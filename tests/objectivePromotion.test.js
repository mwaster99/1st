import test from "node:test";
import assert from "node:assert/strict";
import { readFile, writeFile, readdir, symlink } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { approveBatch, applyBatch, recoverBatch, promotionStatus } from "../scripts/objective/promotion.mjs";
import { validateCanonical } from "../scripts/objective/merge.mjs";
import { createSourceId, digestValue, normalizeRawDocument } from "../scripts/objective/rules.mjs";
import { readJson, sha256, writeJsonAtomic, withWriterLock } from "../scripts/objective/storage.mjs";
import { fixture, approve, batchId, project, run, rewrite } from "./support/objectiveFixture.mjs";

test("approval requires explicit actor, confirmation and exact reviewed diff", async (t) => {
  const f = await fixture(t);
  await assert.rejects(applyBatch(f.root, batchId), /Approval required/);
  await assert.rejects(approveBatch(f.root, batchId, {}), /Explicit approval/);
  await assert.rejects(approve(f, { diffDigest: "wrong" }), /diff-digest/);
  const a = await approve(f);
  assert.equal(a.baselineCanonicalDigest, sha256(f.before));
  assert.notEqual(a.expectedCanonicalDigest, a.baselineCanonicalDigest);
  assert.equal(a.decisions.length, 2);
  assert.ok(a.incomingArtifactDigests["staging/pilot-sony-a7-iv-001/sony-ilce-7m4.json"]);
  assert.equal(await readFile(f.p.canonical, "utf8"), f.before);
});

test("atomic evidence promotion preserves all physical values, validates whole DB, and is idempotent", async (t) => {
  const f = await fixture(t), approval = await approve(f);
  assert.equal((await applyBatch(f.root, batchId)).status, "canonicalized");
  const after = await readFile(f.p.canonical, "utf8"), data = JSON.parse(after), before = JSON.parse(f.before);
  assert.equal(sha256(after), approval.expectedCanonicalDigest);
  for (const group of ["bodies", "lenses"]) {
    assert.equal(data[group].length, before[group].length);
    for (let i = 0; i < data[group].length; i++) {
      assert.deepEqual(data[group][i].specs, before[group][i].specs);
      assert.deepEqual(data[group][i].price, before[group][i].price);
    }
  }
  const product = data.bodies.find((p) => p.id === "sony-a7-iv");
  assert.equal(product.fieldEvidence["specs.weight"].verification, "verified");
  assert.ok(product.sources.some((s) => s.sourceId && s.fields.includes("specs.weight")));
  const evidence = await readJson(path.join(f.p.transaction, "evidence.json"));
  assert.deepEqual(evidence.bundle.stagings[0].claims[0].locator, { section: "Specifications", row: "Weight (including battery and memory card)" });
  assert.ok(product.fieldEvidence["specs.weight"].claimIds.includes(evidence.bundle.stagings[0].claims[0].claimId));
  assert.equal(validateCanonical(data, await readJson(path.join(f.p.ingestion, "vocab.json"))), true);
  const manifestBeforeRetry = await readFile(f.p.manifest, "utf8");
  assert.equal(JSON.parse(manifestBeforeRetry).items[0].state, "canonicalized");
  assert.equal((await applyBatch(f.root, batchId)).status, "already-canonicalized");
  assert.equal(await readFile(f.p.manifest, "utf8"), manifestBeforeRetry);
  assert.equal(await readFile(f.p.canonical, "utf8"), after);
  assert.equal((await promotionStatus(f.root, batchId)).apply, "applied");
  assert.equal(run(f.root, "status").status, 0);
  assert.notEqual(run(f.root, "validate").status, 0, "canonicalized batch cannot be downgraded");
});

test("stale canonical is refused, then CLI refresh-diff and new approval work", async (t) => {
  const f = await fixture(t); await approve(f);
  await writeFile(f.p.canonical, `${f.before}\n`);
  await assert.rejects(applyBatch(f.root, batchId), /Stale/);
  assert.equal(await readFile(f.p.canonical, "utf8"), `${f.before}\n`);
  assert.equal(run(f.root, "diff", "--refresh-baseline").status, 0);
  await assert.rejects(applyBatch(f.root, batchId), /Approval invalid/);
  await approve(f);
  assert.equal((await applyBatch(f.root, batchId)).status, "canonicalized");
});

for (const relative of ["staging/pilot-sony-a7-iv-001/sony-ilce-7m4.json", "diffs/pilot-sony-a7-iv-001.json", "raw/source-0379a083289afde8.json", "identity-map.json", "vocab.json"]) {
  test(`approval rejects modified ${relative}`, async (t) => {
    const f = await fixture(t); await approve(f);
    const file = path.join(f.p.ingestion, relative);
    await writeFile(file, `${await readFile(file, "utf8")}\n`);
    await assert.rejects(applyBatch(f.root, batchId), /Approval invalid/);
    assert.equal(await readFile(f.p.canonical, "utf8"), f.before);
  });
}

for (const event of ["intent-saved", "temp-open", "temp-written", "before-rename"]) {
  test(`failure at ${event} preserves original canonical and resumes safely`, async (t) => {
    const f = await fixture(t); await approve(f);
    await assert.rejects(applyBatch(f.root, batchId, { hook: async (stage) => { if (stage === event) throw Error("injected failure"); } }), /injected failure/);
    assert.equal(await readFile(f.p.canonical, "utf8"), f.before);
    assert.equal((await recoverBatch(f.root, batchId)).status, "not-applied");
    assert.equal((await applyBatch(f.root, batchId)).status, "canonicalized");
    assert.ok(!(await readdir(path.dirname(f.p.canonical))).some((s) => s.includes(".tmp-")));
  });
}

for (const event of ["after-rename", "before-manifest"]) {
  test(`failure at ${event} leaves complete new canonical and recovery finalizes manifest`, async (t) => {
    const f = await fixture(t), approval = await approve(f);
    await assert.rejects(applyBatch(f.root, batchId, { hook: async (stage) => { if (stage === event) throw Error("injected failure"); } }), /injected failure/);
    assert.equal(sha256(await readFile(f.p.canonical)), approval.expectedCanonicalDigest);
    assert.equal((await readJson(f.p.manifest)).items[0].state, "validated");
    // Recovery uses the approved immutable archive, never modified live inputs.
    await rewrite(f.p.diff, (d) => { d.items[0].status = "tampered"; });
    await assert.rejects(applyBatch(f.root, batchId), /Approval invalid/);
    assert.equal((await recoverBatch(f.root, batchId)).status, "canonicalized");
    assert.equal((await readJson(f.p.manifest)).items[0].state, "canonicalized");
  });
}

test("rollback restores exact original bytes, preserves audit, and cancels the approval", async (t) => {
  const f = await fixture(t); await approve(f); await applyBatch(f.root, batchId);
  assert.equal((await recoverBatch(f.root, batchId, { rollback: true })).status, "rolled-back");
  assert.equal(await readFile(f.p.canonical, "utf8"), f.before);
  assert.equal((await recoverBatch(f.root, batchId, { rollback: true })).status, "already-rolled-back");
  await assert.rejects(applyBatch(f.root, batchId), /rollback/);
  assert.equal((await readJson(f.p.manifest)).apply.state, "rolled-back");
});

test("interrupted rollback finishes automatically through recover", async (t) => {
  const f = await fixture(t); await approve(f); await applyBatch(f.root, batchId);
  await assert.rejects(recoverBatch(f.root, batchId, { rollback: true, hook: async (stage) => { if (stage === "after-rename") throw Error("rollback interrupted"); } }), /rollback interrupted/);
  assert.equal(await readFile(f.p.canonical, "utf8"), f.before);
  assert.equal((await recoverBatch(f.root, batchId)).status, "rolled-back");
});

test("recovery refuses unknown canonical digest and corrupted archive", async (t) => {
  const f = await fixture(t); await approve(f);
  await assert.rejects(applyBatch(f.root, batchId, { hook: async (event) => { if (event === "intent-saved") throw Error("stop"); } }), /stop/);
  await writeFile(f.p.canonical, `${f.before}\n`);
  await assert.rejects(recoverBatch(f.root, batchId, { rollback: true }), /Unknown canonical digest/);
  assert.equal(await readFile(f.p.canonical, "utf8"), `${f.before}\n`);
  await writeFile(f.p.canonical, f.before);
  await writeFile(path.join(f.p.transaction, "after.json"), "{}");
  await assert.rejects(recoverBatch(f.root, batchId), /snapshot corrupted/);
});

test("invalid source-linked staging and invalid untouched canonical both block approval", async (t) => {
  const f = await fixture(t);
  const stagingFile = path.join(f.p.ingestion, "staging", batchId, "sony-ilce-7m4.json");
  await rewrite(stagingFile, (s) => { s.claims[0].reviewer = "forged reviewer"; });
  await assert.rejects(approve(f), /Staging checkpoint/);
  const canonical = JSON.parse(f.before);
  canonical.lenses[0].price.used.typical = -1;
  const vocab = await readJson(path.join(f.p.ingestion, "vocab.json"));
  assert.throws(() => validateCanonical(canonical, vocab), /Invalid price/);
  const invalid = await fixture(t);
  await writeJsonAtomic(invalid.p.canonical, canonical);
  assert.equal(run(invalid.root, "diff", "--refresh-baseline").status, 0);
  await assert.rejects(approve(invalid), /Invalid price/);
});

test("live writer lock blocks concurrent apply and cannot be force-recovered", async (t) => {
  const f = await fixture(t); await approve(f);
  await withWriterLock(f.p.ingestion, async () => {
    await assert.rejects(applyBatch(f.root, batchId), /Writer lock/);
    await assert.rejects(recoverBatch(f.root, batchId, { unlockStale: true }), /live or unknown/);
  });
});

for (const event of ["before-rename", "after-rename"]) {
  test(`real SIGKILL at ${event} recovers dead lock and complete file`, async (t) => {
    const f = await fixture(t), approval = await approve(f);
    const moduleUrl = pathToFileURL(path.join(project, "scripts/objective/promotion.mjs")).href;
    const script = `import {applyBatch} from ${JSON.stringify(moduleUrl)}; await applyBatch(${JSON.stringify(f.root)}, ${JSON.stringify(batchId)}, {hook: async s => {if(s === ${JSON.stringify(event)}) process.kill(process.pid, "SIGKILL")}});`;
    const child = spawnSync(process.execPath, ["--input-type=module", "-e", script], { encoding: "utf8" });
    assert.equal(child.signal, "SIGKILL", child.stderr);
    assert.equal(sha256(await readFile(f.p.canonical)), event === "before-rename" ? approval.baselineCanonicalDigest : approval.expectedCanonicalDigest);
    const result = await recoverBatch(f.root, batchId, { unlockStale: true });
    assert.equal(result.status, event === "before-rename" ? "not-applied" : "canonicalized");
    if (event === "before-rename") await applyBatch(f.root, batchId);
    assert.equal((await readJson(f.p.manifest)).items[0].state, "canonicalized");
  });
}

test("symlink canonical is refused without touching its target", async (t) => {
  const f = await fixture(t), target = `${f.p.canonical}.target`;
  const { rename } = await import("node:fs/promises");
  await rename(f.p.canonical, target); await symlink(target, f.p.canonical);
  await assert.rejects(applyBatch(f.root, batchId), /regular, unlinked/);
  assert.equal(await readFile(target, "utf8"), f.before);
});

async function modifyRaw(f, update) {
  const raw = await readJson(path.join(f.p.ingestion, "raw/source-0379a083289afde8.json"));
  update(raw);
  raw.contentDigest = digestValue(raw.evidenceExcerpt); raw.sourceId = createSourceId(raw);
  await writeJsonAtomic(path.join(f.p.ingestion, "raw", `${raw.sourceId}.json`), raw);
  await rewrite(f.p.manifest, (m) => { m.items[0].sourceIds = [raw.sourceId]; });
  for (const cmd of ["normalize", "validate", "diff"]) {
    const result = run(f.root, cmd); assert.equal(result.status, 0, result.stderr || result.stdout);
  }
}

test("value-conflict needs explicit override; changed fields carry only the new evidence", async (t) => {
  const f = await fixture(t);
  await modifyRaw(f, (raw) => { raw.evidenceExcerpt[0].value = 659; raw.items[0].observations[0].rawValue = 659; });
  await assert.rejects(approve(f), /Value conflict/);
  const approval = await approve(f, { allowValueConflicts: true, reason: "Synthetic conflict test in temporary copy" });
  assert.equal(approval.decisions[0].category, "value-conflict");
  await applyBatch(f.root, batchId);
  const p = (await readJson(f.p.canonical)).bodies[0];
  assert.equal(p.specs.weight, 659);
  assert.ok(p.sources.filter((s) => s.fields.includes("specs.weight")).every((s) => s.sourceId));
});

test("null-fill needs approval and unknown incoming never clears a known value", async (t) => {
  const f = await fixture(t);
  await modifyRaw(f, (raw) => {
    raw.evidenceExcerpt[0].value = "UNKNOWN"; raw.items[0].observations[0].rawValue = "UNKNOWN";
    raw.evidenceExcerpt.push({ field: "Body only mass (synthetic fixture)", value: 600, unit: "g" });
    raw.items[0].observations.push({ ...raw.items[0].observations[0], path: "specs.bodyOnlyWeight", evidenceRef: 2, rawValue: 600, conditions: { weightBasis: "body-only" } });
  });
  await assert.rejects(applyBatch(f.root, batchId), /Approval required/);
  const approval = await approve(f);
  assert.equal(approval.decisions.find((d) => d.path === "specs.weight").action, "ignore");
  assert.equal(approval.decisions.find((d) => d.path === "specs.bodyOnlyWeight").category, "null-fill");
  await applyBatch(f.root, batchId);
  const p = (await readJson(f.p.canonical)).bodies[0];
  const beforeProduct = JSON.parse(f.before).bodies.find((product) => product.id === "sony-a7-iv");
  assert.equal(p.specs.weight, 658); assert.equal(p.specs.bodyOnlyWeight, 600);
  assert.deepEqual(p.fieldEvidence?.["specs.weight"], beforeProduct.fieldEvidence?.["specs.weight"]);
});

test("staging rebuilt from invalid raw types cannot pass approval even after Stage 1 checkpoints", async (t) => {
  const f = await fixture(t);
  await modifyRaw(f, (raw) => {
    raw.evidenceExcerpt.push({ field: "Boolean", value: "yes", unit: null });
    raw.items[0].observations.push({ ...raw.items[0].observations[1], path: "specs.video.log", evidenceRef: 2, rawValue: "yes" });
  });
  await assert.rejects(approve(f), /Invalid boolean/);
  assert.equal(await readFile(f.p.canonical, "utf8"), f.before);
});

test("canonical changing at the final rename gate is preserved", async (t) => {
  const f = await fixture(t); await approve(f);
  await assert.rejects(applyBatch(f.root, batchId, { hook: async (event) => {
    if (event === "before-rename") await writeFile(f.p.canonical, `${f.before}\n`);
  } }), /Stale canonical/);
  assert.equal(await readFile(f.p.canonical, "utf8"), `${f.before}\n`);
});

test("CLI approve and apply run end to end on an isolated pilot", async (t) => {
  const f = await fixture(t);
  const digest = digestValue(await readJson(f.p.diff));
  const a = run(f.root, "approve", "--confirm", "--reviewer", "isolated CLI fixture operator", "--reason", "Fixture-only evidence promotion", "--diff-digest", digest);
  assert.equal(a.status, 0, a.stderr);
  const applied = run(f.root, "apply");
  assert.equal(applied.status, 0, applied.stderr);
  assert.equal(JSON.parse(applied.stdout).status, "canonicalized");
  const repeated = run(f.root, "apply");
  assert.equal(JSON.parse(repeated.stdout).status, "already-canonicalized");
});

test("apply recomputes expected result rather than trusting a modified approval digest", async (t) => {
  const f = await fixture(t); await approve(f);
  await rewrite(f.p.approval, (a) => {
    a.expectedCanonicalDigest = "0".repeat(64);
    delete a.approvalId;
    a.approvalId = `approval-${digestValue(a)}`;
  });
  await assert.rejects(applyBatch(f.root, batchId), /Expected canonical digest mismatch/);
  assert.equal(await readFile(f.p.canonical, "utf8"), f.before);
});
