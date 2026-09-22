#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createCanonicalDiff,
  combineStagingFragments,
  digestValue,
  formatCanonicalDiff,
  normalizeRawDocument,
  stableStringify,
  summarizeBatch,
  validateStagingBatch,
} from "./rules.mjs";

import { pathsFor, readJson, safeId, exists, writeJsonAtomic, withWriterLock } from "./storage.mjs";
import { approveBatch, applyBatch, recoverBatch, promotionStatus } from "./promotion.mjs";
const option = (name) => process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : undefined;
const projectRoot = path.resolve(option("--root") ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.."));
const ingestionRoot = path.join(projectRoot, "src/data/ingestion");
const canonicalPath = path.join(projectRoot, "src/data/cameraProducts.json");
const command = process.argv[2];
const batchIndex = process.argv.indexOf("--batch");
const batchId = batchIndex >= 0 ? process.argv[batchIndex + 1] : null;

function assertBatchId(value) {
  if (!value || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) throw new Error("Provide a safe batch ID with --batch <id>");
}

async function fileDigest(filePath) {
  return createHash("sha256").update(await readFile(filePath)).digest("hex");
}

function now() {
  return new Date().toISOString();
}

function manifestPathFor(id) {
  return path.join(ingestionRoot, "batches", `${id}.json`);
}

function stagingPathFor(id, itemKey) {
  return path.join(ingestionRoot, "staging", id, `${itemKey}.json`);
}

function diffPathFor(id) {
  return path.join(ingestionRoot, "diffs", `${id}.json`);
}

async function loadContext() {
  assertBatchId(batchId);
  await pathsFor(projectRoot, batchId);
  const [manifest, canonical, vocab, identityMap] = await Promise.all([
    readJson(manifestPathFor(batchId)),
    readJson(canonicalPath),
    readJson(path.join(ingestionRoot, "vocab.json")),
    readJson(path.join(ingestionRoot, "identity-map.json")),
  ]);
  if (manifest.batchId !== batchId) throw new Error(`Manifest batchId does not match ${batchId}`);
  for (const item of manifest.items) {
    safeId(item.itemKey); safeId(item.productId);
    for (const sourceId of item.sourceIds) safeId(sourceId);
  }
  return { manifest, canonical, vocab, identityMap, canonicalDigest: await fileDigest(canonicalPath) };
}

async function loadRawDocuments(manifest) {
  const rawDocuments = new Map();
  for (const sourceId of new Set(manifest.items.flatMap((item) => item.sourceIds ?? []))) {
    const raw = await readJson(path.join(ingestionRoot, "raw", `${sourceId}.json`));
    if (raw.sourceId !== sourceId) throw new Error(`Raw file identity mismatch for ${sourceId}`);
    rawDocuments.set(sourceId, raw);
  }
  return rawDocuments;
}

async function loadStagings(manifest) {
  return Promise.all(manifest.items.map(async (item) => {
    const filePath = stagingPathFor(manifest.batchId, item.itemKey);
    if (!await exists(filePath)) throw new Error(`Missing staging file for ${item.itemKey}; run normalize first`);
    return readJson(filePath);
  }));
}

function updateManifestItem(item, patch) {
  const changed = Object.entries(patch).some(([key, value]) => stableStringify(item[key]) !== stableStringify(value));
  if (changed) Object.assign(item, patch, { updatedAt: now() });
  return changed;
}

async function saveManifestIfChanged(manifest, changed, gate) {
  const gateOrder = { collect: 0, normalize: 1, validate: 2, diff: 3 };
  if (!changed && (gateOrder[manifest.lastSuccessfulGate] ?? -1) >= (gateOrder[gate] ?? -1)) return false;
  manifest.lastSuccessfulGate = gate;
  manifest.updatedAt = now();
  return writeJsonAtomic(manifestPathFor(manifest.batchId), manifest);
}

async function runStatus() {
  const { manifest, canonicalDigest } = await loadContext();
  const summary = summarizeBatch(manifest, canonicalDigest);
  summary.artifacts = {};
  for (const item of manifest.items) summary.artifacts[item.itemKey] = {
    staging: await exists(stagingPathFor(manifest.batchId, item.itemKey)),
  };
  summary.artifacts.diff = await exists(diffPathFor(manifest.batchId));
  summary.promotion = await promotionStatus(projectRoot, batchId);
  console.log(JSON.stringify(summary, null, 2));
  if (!summary.baselineMatches && summary.promotion.apply !== "applied") process.exitCode = 2;
}

async function runNormalize() {
  const { manifest, vocab, identityMap } = await loadContext();
  const rawDocuments = await loadRawDocuments(manifest);
  const fragmentsByItem = new Map();
  for (const raw of rawDocuments.values()) {
    for (const fragment of normalizeRawDocument(raw, { batchId, vocab, identityMap })) {
      const fragments = fragmentsByItem.get(fragment.itemKey) ?? [];
      fragments.push(fragment);
      fragmentsByItem.set(fragment.itemKey, fragments);
    }
  }
  const normalizedByItem = new Map([...fragmentsByItem].map(([itemKey, fragments]) => [itemKey, combineStagingFragments(fragments)]));

  let manifestChanged = false;
  for (const item of manifest.items) {
    const staging = normalizedByItem.get(item.itemKey);
    if (!staging) throw new Error(`No normalized output for ${item.itemKey}`);
    const stagingDigest = digestValue(staging);
    await writeJsonAtomic(stagingPathFor(batchId, item.itemKey), staging);
    const rawDigests = item.sourceIds.map((sourceId) => digestValue(rawDocuments.get(sourceId)));
    const sameOutput = item.stagingDigest === stagingDigest && stableStringify(item.rawDigests) === stableStringify(rawDigests);
    const nextState = sameOutput && ["validated", "canonicalized"].includes(item.state) ? item.state : "normalized";
    manifestChanged = updateManifestItem(item, {
      productId: staging.product.id,
      state: nextState,
      rawDigests,
      stagingDigest,
      ...(nextState === "normalized" ? { diffDigest: null, issues: [] } : {}),
    }) || manifestChanged;
  }
  await saveManifestIfChanged(manifest, manifestChanged, "normalize");
  console.log(JSON.stringify({ batchId, status: "normalized", items: manifest.items.map(({ itemKey, productId, state, stagingDigest }) => ({ itemKey, productId, state, stagingDigest })) }, null, 2));
}

async function runValidate() {
  const { manifest, canonical, vocab } = await loadContext();
  const [stagings, rawDocuments] = await Promise.all([loadStagings(manifest), loadRawDocuments(manifest)]);
  const result = validateStagingBatch(stagings, { canonical, vocab, rawDocuments });
  let manifestChanged = false;
  for (const itemResult of result.items) {
    const item = manifest.items.find((candidate) => candidate.itemKey === itemResult.itemKey);
    manifestChanged = updateManifestItem(item, {
      state: itemResult.valid ? "validated" : "rejected",
      issues: itemResult.errors,
      ...(itemResult.valid ? {} : { diffDigest: null }),
    }) || manifestChanged;
  }
  await saveManifestIfChanged(manifest, manifestChanged, result.valid ? "validate" : "normalize");
  console.log(JSON.stringify({ batchId, status: result.valid ? "validated" : "rejected", ...result }, null, 2));
  if (!result.valid) process.exitCode = 1;
}

async function runDiff() {
  const { manifest, canonical, vocab, canonicalDigest } = await loadContext();
  if (canonicalDigest !== manifest.canonicalBaselineDigest) {
    if (!process.argv.includes("--refresh-baseline")) throw new Error("Canonical changed; run diff --refresh-baseline, review, then create a new approval");
    manifest.canonicalBaselineDigest = canonicalDigest;
  }
  const [stagings, rawDocuments] = await Promise.all([loadStagings(manifest), loadRawDocuments(manifest)]);
  const validation = validateStagingBatch(stagings, { canonical, vocab, rawDocuments });
  if (!validation.valid) throw new Error("Staging validation failed; run validate and review its issues before diff");
  if (manifest.items.some((item) => item.state !== "validated")) throw new Error("Every batch item must be validated before diff");

  const diffs = stagings.map((staging) => createCanonicalDiff(staging, canonical));
  const output = { schemaVersion: 1, batchId, canonicalBaselineDigest: canonicalDigest, items: diffs };
  const diffDigest = digestValue(output);
  await writeJsonAtomic(diffPathFor(batchId), output);
  let manifestChanged = false;
  for (const item of manifest.items) manifestChanged = updateManifestItem(item, { diffDigest }) || manifestChanged;
  await saveManifestIfChanged(manifest, manifestChanged, "diff");
  console.log(diffs.map(formatCanonicalDiff).join("\n\n---\n\n"));
  console.log(`\nread-only diff: ${path.relative(projectRoot, diffPathFor(batchId))}`);
  console.log(`diff digest: ${diffDigest}`);
}

const show = (result) => console.log(JSON.stringify(result, null, 2));
const commands = { status: runStatus, normalize: runNormalize, validate: runValidate, diff: runDiff,
  approve: async () => show(await approveBatch(projectRoot, batchId, {
    confirm: process.argv.includes("--confirm"), reviewer: option("--reviewer"), reason: option("--reason"),
    diffDigest: option("--diff-digest"), allowValueConflicts: process.argv.includes("--allow-value-conflicts"),
    allowNewProducts: process.argv.includes("--allow-new-products"),
  })),
  apply: async () => show(await applyBatch(projectRoot, batchId)),
  recover: async () => show(await recoverBatch(projectRoot, batchId, {
    rollback: process.argv.includes("--rollback"), unlockStale: process.argv.includes("--unlock-stale"),
  })),
};

try {
  if (!commands[command]) throw new Error("Usage: node scripts/objective/ingest.mjs <status|normalize|validate|diff|approve|apply|recover> --batch <id>");
  if (["normalize", "validate", "diff"].includes(command)) {
    const p = await pathsFor(projectRoot, batchId);
    await withWriterLock(p.ingestion, async () => {
      if (await exists(path.join(p.transaction, "journal.json"))) throw new Error("Batch has an apply intent; use recover or a new batch");
      await commands[command]();
    });
  } else await commands[command]();
} catch (error) {
  console.error(JSON.stringify({ status: "failure", command: command ?? null, batchId, error: error.message }, null, 2));
  process.exitCode = 1;
}
