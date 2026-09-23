import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { cp, mkdir, mkdtemp, readFile, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { proposedCanonical, validateCanonical, validateSpecValue } from "../scripts/objective/merge.mjs";
import {
  combineStagingFragments,
  createCanonicalDiff,
  digestValue,
  formatCanonicalDiff,
  normalizeClaimValue,
  normalizeRawDocument,
  stagingSources,
  summarizeCanonicalDiff,
  validateStaging,
} from "../scripts/objective/rules.mjs";
import { buildRawDocument } from "../scripts/objective/raw-helper.mjs";
import { sha256, writeJsonAtomic } from "../scripts/objective/storage.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (relative) => JSON.parse(readFileSync(path.join(root, relative), "utf8"));
const canonical = readJson("src/data/cameraProducts.json");
const vocab = readJson("src/data/ingestion/vocab.json");
const identityMap = readJson("src/data/ingestion/identity-map.json");
const batchId = "multi-source-contract-test";
const reviewed = { verification: "verified", reviewedAt: "2026-09-22", reviewer: "pipeline-contract-test" };
const a7Identity = {
  name: "소니 A7 IV", brand: "Sony", series: "α7", model: "A7 IV",
  aliases: ["sony a7 iv", "sony a7iv", "소니 a7 iv", "a74", "a7m4"],
  mount: "E-mount", kind: "interchangeable", bodyStyle: "slr",
};

function sourceDraft(url, bodyOnlyWeight = 575) {
  return {
    source: {
      sourceType: "manufacturer", url, publisher: "Sony", documentTitle: "Synthetic official fixture",
      documentVersion: "test-1", region: "global", accessedAt: "2026-09-22T00:00:00Z", evidenceScope: "Body only weight",
    },
    reviewDefaults: reviewed,
    items: [{
      itemKey: "sony-ilce-7m4-multi-source", manufacturerModelCode: "ILCE-7M4", productType: "body", identity: a7Identity,
      observations: [{
        field: "Body Only", path: "specs.bodyOnlyWeight", rawValue: bodyOnlyWeight, rawUnit: "g",
        locator: { section: "Size & Weight", row: "Body Only" }, conditions: { weightBasis: "body-only" },
      }],
    }],
  };
}

function multiSourceFixture(secondValue = 575) {
  const raws = [
    buildRawDocument(sourceDraft("https://www.sony.com/fixture/product", 575)),
    buildRawDocument(sourceDraft("https://www.sony.com/fixture/manual", secondValue)),
  ];
  const fragments = raws.flatMap((raw) => normalizeRawDocument(raw, { batchId, vocab, identityMap }));
  const staging = combineStagingFragments(fragments);
  return { raws, staging, rawDocuments: new Map(raws.map((raw) => [raw.sourceId, raw])) };
}

test("raw helper is deterministic, deduplicates evidence, and never invents review approval", () => {
  const draft = sourceDraft("https://www.sony.com/fixture/helper");
  draft.reviewDefaults = {};
  draft.items[0].observations.push(structuredClone(draft.items[0].observations[0]));
  const first = buildRawDocument(draft), second = buildRawDocument(draft);
  assert.deepEqual(second, first);
  assert.equal(first.evidenceExcerpt.length, 1);
  assert.equal(first.items[0].observations[0].verification, undefined);
  assert.equal(first.items[0].observations[0].evidenceRef, first.items[0].observations[1].evidenceRef);
});

test("single-source staging keeps the archived shape for backward compatibility", () => {
  const raw = buildRawDocument(sourceDraft("https://www.sony.com/fixture/single"));
  const [fragment] = normalizeRawDocument(raw, { batchId, vocab, identityMap });
  assert.strictEqual(combineStagingFragments([fragment]), fragment);
  assert.equal(fragment.sources, undefined);
});

test("multi-source staging links two official sources and promotes two claims for one value", () => {
  const { staging, rawDocuments } = multiSourceFixture();
  assert.equal(stagingSources(staging).length, 2);
  assert.equal(staging.claims.length, 2);
  assert.equal(validateStaging(staging, { canonical, vocab, rawDocuments }).valid, true);

  const diff = createCanonicalDiff(staging, canonical);
  assert.equal(diff.changes.length, 2);
  assert.ok(diff.changes.every((change) => change.category === "null-fill"));
  assert.deepEqual(summarizeCanonicalDiff(diff.changes), {
    fieldCount: 1,
    sourceCount: 2,
    categories: {
      "same-value/new-evidence": 0, "null-fill": 1, "value-conflict": 0,
      "new-product": 0, "unknown-no-change": 0, "incoming-unknown": 0,
    },
  });
  assert.match(formatCanonicalDiff(diff), /summary: 1 fields \/ 2 sources \| evidence 0 \| null-fill 1/);

  const decisions = diff.changes.map((change) => ({ productId: diff.productId, claimId: change.claimId, action: "accept" }));
  const result = proposedCanonical(canonical, { stagings: [staging], vocab }, decisions).canonical;
  const product = result.bodies.find((entry) => entry.id === "sony-a7-iv");
  assert.equal(product.specs.bodyOnlyWeight, 575);
  assert.equal(product.fieldEvidence["specs.bodyOnlyWeight"].claimIds.length, 2);
  assert.equal(product.sources.filter((source) => source.fields.includes("specs.bodyOnlyWeight")).length, 2);
  assert.equal(validateCanonical(result, vocab), true);
});

test("multi-source disagreement is rejected instead of selecting by source order", () => {
  const { staging, rawDocuments } = multiSourceFixture(576);
  const result = validateStaging(staging, { canonical, vocab, rawDocuments });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.code === "CONFLICTING_CLAIM_VALUES"));
});

test("CLI normalizes, validates, and diffs one manifest item backed by two sources", async (t) => {
  const fixtureRoot = await realpath(await mkdtemp(path.join(tmpdir(), "objective-multi-source-")));
  t.after(() => rm(fixtureRoot, { recursive: true, force: true }));
  const data = path.join(fixtureRoot, "src/data"), ingestion = path.join(data, "ingestion");
  await mkdir(path.join(ingestion, "raw"), { recursive: true });
  await mkdir(path.join(ingestion, "batches"), { recursive: true });
  await cp(path.join(root, "src/data/cameraProducts.json"), path.join(data, "cameraProducts.json"));
  await cp(path.join(root, "src/data/ingestion/vocab.json"), path.join(ingestion, "vocab.json"));
  await cp(path.join(root, "src/data/ingestion/identity-map.json"), path.join(ingestion, "identity-map.json"));
  const { raws } = multiSourceFixture();
  for (const raw of raws) await writeJsonAtomic(path.join(ingestion, "raw", `${raw.sourceId}.json`), raw);
  const canonicalBytes = await readFile(path.join(data, "cameraProducts.json"));
  const manifest = {
    schemaVersion: 1, batchId, scope: "Synthetic multi-source CLI fixture", tier: 1,
    baselineCommit: "fixture", canonicalBaselineDigest: sha256(canonicalBytes), lastSuccessfulGate: "collect",
    items: [{
      itemKey: "sony-ilce-7m4-multi-source", productId: "sony-a7-iv", state: "collected", attempt: 1,
      sourceIds: raws.map((raw) => raw.sourceId), rawDigests: raws.map((raw) => digestValue(raw)),
      stagingDigest: null, diffDigest: null, issues: [],
    }],
  };
  await writeJsonAtomic(path.join(ingestion, "batches", `${batchId}.json`), manifest);
  const cli = path.join(root, "scripts/objective/ingest.mjs");
  for (const command of ["normalize", "validate", "diff"]) {
    const result = spawnSync(process.execPath, [cli, command, "--root", fixtureRoot, "--batch", batchId], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr || result.stdout);
  }
  const staged = JSON.parse(await readFile(path.join(ingestion, "staging", batchId, "sony-ilce-7m4-multi-source.json"), "utf8"));
  assert.equal(staged.sources.length, 2);
  assert.equal(staged.claims.length, 2);
});

test("sensor.sizeMm normalizes verified millimetres and preserves UNKNOWN", () => {
  assert.deepEqual(normalizeClaimValue("specs.sensor.sizeMm", [35.9, 24], "mm"), { value: [35.9, 24], unit: "mm", unknown: false });
  assert.deepEqual(normalizeClaimValue("specs.sensor.sizeMm", "UNKNOWN", "mm"), { value: null, unit: "mm", unknown: true });
  assert.throws(() => normalizeClaimValue("specs.sensor.sizeMm", [35.9], "mm"), /must contain 2 numbers/);
});

test("EVF and LCD contracts accept objective leaves and remain null-safe", () => {
  assert.doesNotThrow(() => validateSpecValue(null, "specs.evf"));
  assert.doesNotThrow(() => validateSpecValue(null, "specs.lcd"));
  assert.doesNotThrow(() => validateSpecValue({ present: true, resolutionDots: 9437184, magnification: 0.9, maxRefreshHz: 240 }, "specs.evf"));
  assert.doesNotThrow(() => validateSpecValue({ present: true, sizeInches: 3.2, resolutionDots: 2095104, mechanism: "multi-angle", touch: true }, "specs.lcd"));
  assert.throws(() => validateSpecValue({ mechanism: "very-good" }, "specs.lcd"), /Invalid LCD mechanism/);
});

test("shutter, burst, and environment contracts reject malformed values", () => {
  assert.doesNotThrow(() => validateSpecValue({ mechanical: true, electronic: true, fastestMechanicalSec: 0.000125, fastestElectronicSec: 0.00003125, slowestTimedSec: 30, bulb: true }, "specs.shutter"));
  assert.doesNotThrow(() => validateSpecValue({ maxMechanicalFps: 10, maxElectronicFps: 30 }, "specs.burst"));
  assert.doesNotThrow(() => validateSpecValue({ min: -10, max: 40 }, "specs.operatingTemperatureC"));
  assert.throws(() => validateSpecValue({ maxMechanicalFps: -1 }, "specs.burst"), /Invalid number/);
  const copy = structuredClone(canonical);
  copy.bodies[0].specs.operatingTemperatureC = { min: 50, max: 40 };
  assert.throws(() => validateCanonical(copy, vocab), /Reversed operating temperature/);
});

test("card slot contract represents combo slots without flattening media", () => {
  const slots = {
    count: 2,
    slots: [
      { index: 1, media: ["SD", "CFexpress Type A"], standards: ["UHS-I", "UHS-II", "CFexpress 2.0"] },
      { index: 2, media: ["SD", "CFexpress Type A"], standards: ["UHS-I", "UHS-II", "CFexpress 2.0"] },
    ],
  };
  assert.doesNotThrow(() => validateSpecValue(slots, "specs.cardSlots"));
  assert.throws(() => validateSpecValue({ ...slots, count: 1 }, "specs.cardSlots"), /count mismatch/);
  assert.throws(() => validateSpecValue({ count: 1, slots: [{ index: 1, media: [], standards: null }] }, "specs.cardSlots"), /Invalid card media/);
});

test("releaseDate stores official market availability with explicit precision", () => {
  for (const value of ["2024", "2024-12", "2024-12-13"]) assert.doesNotThrow(() => validateSpecValue(value, "specs.releaseDate"));
  for (const value of ["2024-13", "announced 2024", "2024-02-30"]) assert.throws(() => validateSpecValue(value, "specs.releaseDate"), /Invalid release date/);
});

test("the reviewed 77-product canonical inventory remains complete and valid", () => {
  assert.equal(canonical.bodies.length + canonical.lenses.length, 77);
  for (const id of ["sony-a9-iii", "sony-a7r-v", "sony-a7cr", "sony-a6700", "sony-zv-e1"]) {
    assert.ok(canonical.bodies.some((body) => body.id === id), `missing reviewed production body: ${id}`);
  }
  assert.equal(validateCanonical(canonical, vocab), true);
});
