import { readFile } from "node:fs/promises";
import path from "node:path";
import { digestValue } from "./rules.mjs";
import { proposedCanonical, validateCanonical, verifyIncoming } from "./merge.mjs";
import { atomicWrite, cleanCanonicalTemps, exists, pathsFor, readJson, safeId, sha256, withWriterLock, writeJsonAtomic } from "./storage.mjs";

const ensure = (condition, message) => { if (!condition) throw Error(message); };
const same = (a, b) => digestValue(a) === digestValue(b);
const now = () => new Date().toISOString();
const journalPath = (p) => path.join(p.transaction, "journal.json");
const transactionFile = (p, name) => path.join(p.transaction, name);

export async function loadBundle(p) {
  const manifest = await readJson(p.manifest);
  ensure(manifest.batchId === path.basename(p.manifest, ".json"), "Manifest batch ID mismatch");
  const artifactDigests = {};
  async function artifact(file) {
    // readJson also refuses symlinks; the byte hash binds even whitespace changes.
    await readJson(file);
    const bytes = await readFile(file);
    artifactDigests[path.relative(p.ingestion, file)] = sha256(bytes);
    return JSON.parse(bytes);
  }
  const vocab = await artifact(path.join(p.ingestion, "vocab.json"));
  const identityMap = await artifact(path.join(p.ingestion, "identity-map.json"));
  const diff = await artifact(p.diff);
  const raws = {}, stagings = [];
  ensure(Array.isArray(manifest.items), "Manifest items are required");
  for (const item of manifest.items) {
    safeId(item.itemKey); safeId(item.productId);
    stagings.push(await artifact(path.join(p.ingestion, "staging", manifest.batchId, `${item.itemKey}.json`)));
    for (const id of item.sourceIds) {
      safeId(id);
      raws[id] = await artifact(path.join(p.ingestion, "raw", `${id}.json`));
      ensure(raws[id].sourceId === id, "Raw source ID mismatch");
    }
  }
  return { manifest, vocab, identityMap, diff, raws, stagings, artifactDigests };
}

function approvalId(approval) {
  const { approvalId: ignored, ...body } = approval;
  return `approval-${digestValue(body)}`;
}
function checkApproval(approval, bundle) {
  ensure(approval.schemaVersion === 1 && approval.approvalId === approvalId(approval), "Approval integrity mismatch");
  ensure(approval.approvedBy?.name?.trim() && ["cli-explicit", "test-fixture"].includes(approval.approvedBy.method) && Number.isFinite(Date.parse(approval.approvedAt)), "Explicit approval identity/time missing");
  ensure(approval.batchId === bundle.manifest.batchId && same(approval.productIds, bundle.manifest.items.map((i) => i.productId)), "Approval target mismatch");
  ensure(same(approval.incomingArtifactDigests, bundle.artifactDigests), "Approval invalid: staging/diff/raw/config changed; regenerate diff and approval");
  ensure(approval.incomingDigest === digestValue(bundle.artifactDigests), "Approval incoming digest mismatch");
  ensure(approval.diffDigest === digestValue(bundle.diff) && approval.diffFileDigest === bundle.artifactDigests[`diffs/${approval.batchId}.json`], "Approval diff mismatch");
  const expectedOperations = bundle.diff.items.map((item) => {
    const operation = item.operation ?? "update-product";
    return {
      productId: item.productId,
      operation,
      action: operation === "new-product" ? "accept" : "update",
      incomingProductDigest: item.incomingProduct ? digestValue(item.incomingProduct) : null,
      canonicalProductDigest: item.canonicalProductDigest,
      identityEvidenceId: item.identityEvidence?.evidenceId ?? null,
      reason: approval.approvalReason,
    };
  });
  ensure(approval.approvalReason?.trim() && same(approval.productOperations, expectedOperations), "Approval product operation mismatch");
}

export async function approveBatch(root, batchId, options) {
  const p = await pathsFor(root, batchId);
  return withWriterLock(p.ingestion, async () => {
    ensure(options?.confirm === true && options.reviewer?.trim() && options.reason?.trim(), "Explicit approval requires --confirm, --reviewer and --reason");
    ensure(!await exists(journalPath(p)), "Batch already has an apply intent; recover it before creating another batch");
    const before = await readFile(p.canonical, "utf8");
    const canonical = JSON.parse(before);
    const bundle = await loadBundle(p);
    ensure(bundle.manifest.items.every((i) => i.state === "validated"), "Every item must be validated before approval");
    ensure(bundle.manifest.canonicalBaselineDigest === sha256(before), "Stale baseline: run diff --refresh-baseline and approve again");
    ensure(options.diffDigest === digestValue(bundle.diff), "Explicit --diff-digest does not match reviewed diff");
    validateCanonical(canonical, bundle.vocab);
    verifyIncoming(bundle, canonical);
    const productOperations = bundle.diff.items.map((item) => {
      const operation = item.operation ?? "update-product";
      if (operation === "new-product") ensure(options.allowNewProducts === true, "New product creation requires --allow-new-products and an explicit reason");
      ensure(["new-product", "update-product"].includes(operation), `Unsupported product operation: ${operation}`);
      return {
        productId: item.productId,
        operation,
        action: operation === "new-product" ? "accept" : "update",
        incomingProductDigest: item.incomingProduct ? digestValue(item.incomingProduct) : null,
        canonicalProductDigest: item.canonicalProductDigest,
        identityEvidenceId: item.identityEvidence?.evidenceId ?? null,
        reason: options.reason.trim(),
      };
    });
    const decisions = bundle.diff.items.flatMap((item) => item.changes.map((c) => {
      if (c.category === "value-conflict") ensure(options.allowValueConflicts === true, "Value conflict requires --allow-value-conflicts and an explicit reason");
      ensure(["new-product", "value-conflict", "null-fill", "same-value/new-evidence", "incoming-unknown", "unknown-no-change"].includes(c.category), `Unsupported approval category: ${c.category}`);
      return { productId: item.productId, path: c.path, claimId: c.claimId, category: c.category,
        action: c.incomingValue === null ? "ignore" : "accept", reason: options.reason.trim() };
    }));
    ensure(decisions.some((d) => d.action === "accept") || productOperations.some((operation) => operation.operation === "new-product" && operation.action === "accept"), "No known facts/evidence to promote");
    const candidate = proposedCanonical(canonical, bundle, decisions, productOperations);
    const approval = {
      schemaVersion: 1, batchId, productIds: bundle.manifest.items.map((i) => i.productId),
      approvedAt: now(), approvedBy: { name: options.reviewer.trim(), method: options.method ?? "cli-explicit" },
      approvalReason: options.reason.trim(),
      diffDigest: digestValue(bundle.diff), diffFileDigest: bundle.artifactDigests[`diffs/${batchId}.json`],
      baselineCanonicalDigest: sha256(before), expectedCanonicalDigest: candidate.digest,
      incomingDigest: digestValue(bundle.artifactDigests), incomingArtifactDigests: bundle.artifactDigests,
      productOperations, decisions,
    };
    approval.approvalId = approvalId(approval);
    ensure(sha256(await readFile(p.canonical)) === approval.baselineCanonicalDigest, "Canonical changed during approval");
    await writeJsonAtomic(path.join(p.ingestion, "approvals", batchId, `${approval.approvalId}.json`), approval);
    await writeJsonAtomic(p.approval, approval);
    return approval;
  });
}

async function assertArtifactsUnchanged(p, approval) {
  ensure(same(await readJson(p.approval), approval), "Approval record changed during apply");
  const current = await loadBundle(p);
  checkApproval(approval, current);
  return current;
}

async function prepareTransaction(p, approval, bundle, before) {
  const canonical = JSON.parse(before);
  ensure(sha256(before) === approval.baselineCanonicalDigest && bundle.manifest.canonicalBaselineDigest === approval.baselineCanonicalDigest, "Stale canonical baseline; regenerate diff and approval");
  ensure(bundle.manifest.items.every((i) => i.state === "validated"), "Every item must be validated before apply");
  validateCanonical(canonical, bundle.vocab);
  verifyIncoming(bundle, canonical);
  const candidate = proposedCanonical(canonical, bundle, approval.decisions, approval.productOperations);
  ensure(candidate.digest === approval.expectedCanonicalDigest, "Expected canonical digest mismatch");
  const evidence = { approval, bundle };
  await atomicWrite(transactionFile(p, "before.json"), before);
  await atomicWrite(transactionFile(p, "after.json"), candidate.bytes);
  await writeJsonAtomic(transactionFile(p, "evidence.json"), evidence);
  const journal = { schemaVersion: 1, batchId: approval.batchId, approvalId: approval.approvalId,
    phase: "prepared", preparedAt: now(), baselineCanonicalDigest: approval.baselineCanonicalDigest,
    expectedCanonicalDigest: candidate.digest, evidenceDigest: digestValue(evidence) };
  // The journal is the durable commit intent. Canonical is never renamed before it exists.
  await writeJsonAtomic(journalPath(p), journal);
  return readTransaction(p);
}

async function readTransaction(p) {
  const journal = await readJson(journalPath(p));
  ensure(["prepared", "canonicalized", "rolling-back", "rolled-back"].includes(journal.phase), "Invalid transaction phase");
  const evidence = await readJson(transactionFile(p, "evidence.json"));
  const before = await readFile(transactionFile(p, "before.json"), "utf8");
  const after = await readFile(transactionFile(p, "after.json"), "utf8");
  const { approval, bundle } = evidence;
  ensure(journal.batchId === bundle.manifest.batchId && journal.approvalId === approval.approvalId, "Transaction identity mismatch");
  ensure(digestValue(evidence) === journal.evidenceDigest && sha256(before) === journal.baselineCanonicalDigest && sha256(after) === journal.expectedCanonicalDigest, "Transaction snapshot corrupted");
  checkApproval(approval, bundle);
  ensure(approval.baselineCanonicalDigest === journal.baselineCanonicalDigest && approval.expectedCanonicalDigest === journal.expectedCanonicalDigest, "Transaction approval digest mismatch");
  verifyIncoming(bundle, JSON.parse(before));
  validateCanonical(JSON.parse(before), bundle.vocab);
  const expected = proposedCanonical(JSON.parse(before), bundle, approval.decisions, approval.productOperations);
  ensure(expected.digest === sha256(after), "Archived result does not match approved changes");
  validateCanonical(JSON.parse(after), bundle.vocab);
  return { journal, approval, bundle, before, after };
}

async function finishManifest(p, tx, state, hook) {
  await hook("before-manifest");
  const manifest = await readJson(p.manifest);
  ensure(manifest.batchId === tx.approval.batchId && same(manifest.items.map((i) => [i.itemKey, i.productId]), tx.bundle.manifest.items.map((i) => [i.itemKey, i.productId])), "Manifest identity changed; cannot finalize");
  if (manifest.apply?.approvalId === tx.approval.approvalId && manifest.apply?.state === state && manifest.items.every((i) => i.state === (state === "canonicalized" ? "canonicalized" : "validated"))) return;
  const timestamp = now();
  manifest.items = tx.bundle.manifest.items.map((i) => ({ ...i, state: state === "canonicalized" ? "canonicalized" : "validated", updatedAt: timestamp }));
  manifest.lastSuccessfulGate = state === "canonicalized" ? "apply" : "diff";
  manifest.expectedCanonicalDigest = tx.approval.expectedCanonicalDigest;
  manifest.apply = { state, approvalId: tx.approval.approvalId, completedAt: timestamp, transaction: path.relative(p.ingestion, p.transaction) };
  manifest.updatedAt = timestamp;
  await writeJsonAtomic(p.manifest, manifest);
}

async function completeTransaction(p, tx, hook) {
  const actual = await readFile(p.canonical);
  ensure(sha256(actual) === tx.journal.expectedCanonicalDigest, "Canonical changed after rename; recovery will not overwrite external edits");
  validateCanonical(JSON.parse(actual), tx.bundle.vocab);
  // Journal first: a process killed before manifest update can replay this exact finalization.
  if (tx.journal.phase !== "canonicalized") {
    tx.journal = { ...tx.journal, phase: "canonicalized", completedAt: now() };
    await writeJsonAtomic(journalPath(p), tx.journal);
  }
  await finishManifest(p, tx, "canonicalized", hook);
  return { status: "canonicalized", batchId: tx.approval.batchId, approvalId: tx.approval.approvalId, canonicalDigest: sha256(actual) };
}

export async function applyBatch(root, batchId, { hook = async () => {} } = {}) {
  const p = await pathsFor(root, batchId);
  return withWriterLock(p.ingestion, async () => {
    ensure(await exists(p.approval), "Approval required: review diff and run approve first");
    const approval = await readJson(p.approval);
    const bundle = await assertArtifactsUnchanged(p, approval);
    let tx;
    if (await exists(journalPath(p))) {
      tx = await readTransaction(p);
      ensure(tx.approval.approvalId === approval.approvalId, "Apply intent belongs to another approval");
      ensure(!["rolled-back", "rolling-back"].includes(tx.journal.phase), "Approval rollback started; use recover, then a new batch and approval");
    } else tx = await prepareTransaction(p, approval, bundle, await readFile(p.canonical, "utf8"));
    const current = sha256(await readFile(p.canonical));
    if (tx.journal.phase === "canonicalized") {
      const manifest = await readJson(p.manifest);
      if (manifest.apply?.state === "canonicalized" && manifest.apply.approvalId === approval.approvalId) {
        return { status: "already-canonicalized", batchId, canonicalMatches: current === approval.expectedCanonicalDigest };
      }
    }
    if (current === approval.expectedCanonicalDigest) return completeTransaction(p, tx, hook);
    ensure(current === approval.baselineCanonicalDigest, "Stale canonical baseline; apply refused");
    await hook("intent-saved");
    await atomicWrite(p.canonical, tx.after, {
      hook,
      beforeRename: async () => {
        await assertArtifactsUnchanged(p, approval);
        ensure(sha256(await readFile(p.canonical)) === approval.baselineCanonicalDigest, "Stale canonical baseline immediately before rename");
      },
    });
    return completeTransaction(p, tx, hook);
  });
}

export async function recoverBatch(root, batchId, { rollback = false, unlockStale = false, hook = async () => {} } = {}) {
  const p = await pathsFor(root, batchId);
  return withWriterLock(p.ingestion, async () => {
    if (!await exists(journalPath(p))) return { status: "no-apply-intent", nextAction: "Review approval, then run apply", batchId };
    const tx = await readTransaction(p);
    const current = sha256(await readFile(p.canonical));
    if (tx.journal.phase === "rolled-back") {
      ensure(current === tx.journal.baselineCanonicalDigest, "Canonical changed after rollback");
      await finishManifest(p, tx, "rolled-back", hook);
      return { status: "already-rolled-back", batchId };
    }
    ensure(current === tx.journal.baselineCanonicalDigest || current === tx.journal.expectedCanonicalDigest, "Unknown canonical digest; recovery refuses to overwrite external changes");
    await cleanCanonicalTemps(p.canonical);
    if (rollback || tx.journal.phase === "rolling-back") {
      if (tx.journal.phase !== "rolling-back") {
        tx.journal = { ...tx.journal, phase: "rolling-back", rollbackStartedAt: now() };
        await writeJsonAtomic(journalPath(p), tx.journal);
      }
      if (current === tx.journal.expectedCanonicalDigest) await atomicWrite(p.canonical, tx.before, {
        hook, beforeRename: async () => ensure(sha256(await readFile(p.canonical)) === current, "Canonical changed before rollback"),
      });
      validateCanonical(JSON.parse(await readFile(p.canonical, "utf8")), tx.bundle.vocab);
      tx.journal = { ...tx.journal, phase: "rolled-back", rolledBackAt: now() };
      await writeJsonAtomic(journalPath(p), tx.journal);
      await finishManifest(p, tx, "rolled-back", hook);
      return { status: "rolled-back", batchId };
    }
    if (current === tx.journal.expectedCanonicalDigest) return completeTransaction(p, tx, hook);
    return { status: "not-applied", batchId, nextAction: "Run apply to resume the same approval, or recover --rollback to cancel" };
  }, { recoverStale: unlockStale });
}

export async function promotionStatus(root, batchId) {
  const p = await pathsFor(root, batchId);
  if (!await exists(journalPath(p))) {
    if (!await exists(p.approval)) return { apply: "not-started", approvalPresent: false };
    try {
      const approval = await readJson(p.approval);
      await assertArtifactsUnchanged(p, approval);
      const current = sha256(await readFile(p.canonical));
      return { apply: "not-started", approvalPresent: true, approvalValid: current === approval.baselineCanonicalDigest,
        nextAction: current === approval.baselineCanonicalDigest ? "apply" : "diff --refresh-baseline, then approve again" };
    } catch (e) { return { apply: "not-started", approvalPresent: true, approvalValid: false, reason: e.message, nextAction: "Revalidate and regenerate diff/approval" }; }
  }
  const tx = await readTransaction(p);
  const current = sha256(await readFile(p.canonical));
  const manifest = await readJson(p.manifest);
  const state = current === tx.journal.expectedCanonicalDigest ? "applied" : current === tx.journal.baselineCanonicalDigest ? "not-applied" : "external-change";
  return { apply: state, journalPhase: tx.journal.phase, manifestState: manifest.apply?.state ?? null,
    expectedCanonicalDigest: tx.journal.expectedCanonicalDigest,
    nextAction: tx.journal.phase === "rolled-back" ? "Create a new batch" : manifest.apply?.state === "canonicalized" ? "Batch applied; run tests and review commit" : state === "applied" ? "recover (finish manifest)" : state === "not-applied" ? "apply or recover --rollback" : "Inspect external canonical changes; no automatic overwrite" };
}
