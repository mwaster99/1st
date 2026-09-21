import test from "node:test";
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { approveBatch, applyBatch, recoverBatch } from "../scripts/objective/promotion.mjs";
import { validateCanonical } from "../scripts/objective/merge.mjs";
import { digestValue } from "../scripts/objective/rules.mjs";
import { readJson, sha256 } from "../scripts/objective/storage.mjs";
import { approveNew, newBatchId, newProductFixture, pipeline, runNew } from "./support/newProductFixture.mjs";

function expectPipelineSuccess(results) {
  for (const result of results) assert.equal(result.status, 0, result.stderr || result.stdout);
}

test("valid new body and lens have explicit new-product diffs and require creation approval", async (t) => {
  const f = await newProductFixture(t);
  expectPipelineSuccess(pipeline(f));
  const diff = await readJson(f.p.diff);
  assert.deepEqual(diff.items.map((item) => item.operation), ["new-product", "new-product"]);
  assert.ok(diff.items.every((item) => item.incomingProduct.price.new.value === null));
  assert.ok(diff.items.every((item) => item.identityEvidence.verification === "verified"));
  await assert.rejects(approveBatch(f.root, newBatchId, {
    confirm: true, reviewer: "fixture", reason: "reviewed", method: "test-fixture", diffDigest: digestValue(diff),
  }), /allow-new-products/);
  const approval = await approveNew(f);
  assert.deepEqual(approval.productOperations.map((operation) => operation.operation), ["new-product", "new-product"]);
  assert.equal(approval.incomingDigest, digestValue(approval.incomingArtifactDigests));
  assert.equal(approval.approvalReason, "Approve isolated new-product fixture only");
});

test("atomic apply adds one body and one lens, preserves provenance, UNKNOWN and full canonical validity", async (t) => {
  const f = await newProductFixture(t);
  expectPipelineSuccess(pipeline(f));
  const before = JSON.parse(f.before);
  const approval = await approveNew(f);
  assert.equal((await applyBatch(f.root, newBatchId)).status, "canonicalized");
  const afterBytes = await readFile(f.p.canonical, "utf8");
  const after = JSON.parse(afterBytes);
  assert.equal(after.bodies.length, before.bodies.length + 1);
  assert.equal(after.lenses.length, before.lenses.length + 1);
  assert.equal(sha256(afterBytes), approval.expectedCanonicalDigest);

  const body = after.bodies.find((product) => product.id === "sony-stage3-test-body");
  const lens = after.lenses.find((product) => product.id === "sony-stage3-test-lens-35-f2");
  assert.equal(body.specs.weight, 500);
  assert.equal(body.specs.sensor.megapixels, null);
  assert.equal(body.specs.weatherSealing, null);
  assert.equal(body.price.new.value, null);
  assert.equal(body.price.new.sourceType, "unknown");
  assert.equal(lens.specs.weight, 300);
  assert.equal(lens.specs.stabilization, null);
  assert.equal(lens.price.used.typical, null);
  for (const product of [body, lens]) {
    assert.ok(product.sources.some((source) => source.fields.includes("identity") && source.sourceId));
    assert.equal(product.identityEvidence.verification, "verified");
    assert.ok(product.identityEvidence.evidenceId.startsWith("identity-"));
    assert.ok(Object.values(product.fieldEvidence).every((evidence) => evidence.verification === "verified"));
  }
  assert.equal(validateCanonical(after, await readJson(path.join(f.p.ingestion, "vocab.json"))), true);

  const manifestBytes = await readFile(f.p.manifest, "utf8");
  assert.ok(JSON.parse(manifestBytes).items.every((item) => item.state === "canonicalized"));
  assert.equal((await applyBatch(f.root, newBatchId)).status, "already-canonicalized");
  assert.equal(await readFile(f.p.canonical, "utf8"), afterBytes);
  assert.equal(await readFile(f.p.manifest, "utf8"), manifestBytes);
});

test("unapproved new-product apply is refused without changing canonical", async (t) => {
  const f = await newProductFixture(t);
  expectPipelineSuccess(pipeline(f));
  await assert.rejects(applyBatch(f.root, newBatchId), /Approval required/);
  assert.equal(await readFile(f.p.canonical, "utf8"), f.before);
});

test("an existing canonical ID cannot be repurposed as a new identity", async (t) => {
  const f = await newProductFixture(t, { mutateIdentityMap: (map) => { map.entries[0].productId = "sony-a7-iv"; } });
  expectPipelineSuccess(pipeline(f));
  await assert.rejects(approveNew(f), /Identity changes require/);
  assert.equal(await readFile(f.p.canonical, "utf8"), f.before);
});

test("a new product alias colliding with canonical is rejected", async (t) => {
  const f = await newProductFixture(t, { mutateRaw: (raw) => { raw.items[0].identity.aliases = ["캐논 EOS R8"]; } });
  const results = pipeline(f);
  assert.equal(results[0].status, 0, results[0].stderr);
  assert.notEqual(results[1].status, 0);
  assert.match(results[1].stdout, /ALIAS_COLLISION/);
});

test("Mark II and II naming variants are detected as an equivalent existing product", async (t) => {
  const f = await newProductFixture(t, { mutateRaw: (raw) => {
    Object.assign(raw.items[0].identity, {
      name: "Canon EOS R6 II", brand: "Canon", model: "EOS R6 II", aliases: ["canon r6 ii"],
      mount: "Canon RF", series: "EOS R", kind: "interchangeable", bodyStyle: "slr",
    });
  } });
  const results = pipeline(f);
  assert.equal(results[0].status, 0, results[0].stderr);
  assert.notEqual(results[1].status, 0);
  assert.match(results[1].stdout, /EQUIVALENT_EXISTING_PRODUCT/);
});

test("missing required new-product identity is rejected before diff", async (t) => {
  const f = await newProductFixture(t, { mutateRaw: (raw) => { delete raw.items[0].identity.model; } });
  const results = pipeline(f);
  assert.equal(results[0].status, 0, results[0].stderr);
  assert.notEqual(results[1].status, 0);
  assert.match(results[1].stdout, /MISSING_REQUIRED_IDENTITY/);
});

test("a changed staging, source, or diff invalidates new-product approval", async (t) => {
  for (const kind of ["staging", "source", "diff"]) {
    await t.test(kind, async (t) => {
      const f = await newProductFixture(t);
      expectPipelineSuccess(pipeline(f));
      await approveNew(f);
      const manifest = await readJson(f.p.manifest);
      const target = kind === "staging"
        ? path.join(f.p.ingestion, "staging", newBatchId, `${manifest.items[0].itemKey}.json`)
        : kind === "source"
          ? path.join(f.p.ingestion, "raw", `${manifest.items[0].sourceIds[0]}.json`)
          : f.p.diff;
      await writeFile(target, `${await readFile(target, "utf8")}\n`);
      await assert.rejects(applyBatch(f.root, newBatchId), /Approval invalid/);
      assert.equal(await readFile(f.p.canonical, "utf8"), f.before);
    });
  }
});

test("stale canonical baseline invalidates a new-product approval", async (t) => {
  const f = await newProductFixture(t);
  expectPipelineSuccess(pipeline(f));
  await approveNew(f);
  await writeFile(f.p.canonical, `${f.before}\n`);
  await assert.rejects(applyBatch(f.root, newBatchId), /Stale/);
  assert.equal(await readFile(f.p.canonical, "utf8"), `${f.before}\n`);
});

test("failure before new-product rename preserves canonical and resumes through the same transaction", async (t) => {
  const f = await newProductFixture(t);
  expectPipelineSuccess(pipeline(f));
  await approveNew(f);
  await assert.rejects(applyBatch(f.root, newBatchId, { hook: async (event) => {
    if (event === "before-rename") throw Error("injected Stage 3 failure");
  } }), /injected Stage 3 failure/);
  assert.equal(await readFile(f.p.canonical, "utf8"), f.before);
  assert.equal((await recoverBatch(f.root, newBatchId)).status, "not-applied");
  assert.equal((await applyBatch(f.root, newBatchId)).status, "canonicalized");
});

test("CLI emits new-product review and applies only with the explicit flag", async (t) => {
  const f = await newProductFixture(t);
  const results = pipeline(f);
  expectPipelineSuccess(results);
  assert.match(results[2].stdout, /operation: new-product/);
  const diffDigest = digestValue(await readJson(f.p.diff));
  const denied = runNew(f.root, "approve", "--confirm", "--reviewer", "CLI fixture", "--reason", "Stage 3 fixture", "--diff-digest", diffDigest);
  assert.notEqual(denied.status, 0);
  const approved = runNew(f.root, "approve", "--confirm", "--reviewer", "CLI fixture", "--reason", "Stage 3 fixture", "--diff-digest", diffDigest, "--allow-new-products");
  assert.equal(approved.status, 0, approved.stderr);
  assert.equal(runNew(f.root, "apply").status, 0);
  assert.equal(JSON.parse(runNew(f.root, "apply").stdout).status, "already-canonicalized");
});
