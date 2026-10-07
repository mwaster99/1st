import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { cp, mkdir, mkdtemp, readFile, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { proposedCanonical, validateCanonical, validateSpecValue } from "../scripts/objective/merge.mjs";
import {
  combineStagingFragments,
  createCanonicalDiff,
  createSourceId,
  digestValue,
  formatCanonicalDiff,
  normalizeClaimValue,
  normalizeRawDocument,
  stagingSources,
  summarizeCanonicalDiff,
  validateStaging,
  validateStagingBatch,
} from "../scripts/objective/rules.mjs";
import { buildRawDocument } from "../scripts/objective/raw-helper.mjs";
import { sha256, writeJsonAtomic } from "../scripts/objective/storage.mjs";
import { fixture as isolatedFixture, run as runIsolated, batchId as pilotBatchId } from "./support/objectiveFixture.mjs";

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

test("raw helper generates a current UTC timestamp only when accessedAt is omitted", () => {
  const draft = sourceDraft("https://www.sony.com/fixture/helper-current-accessed-at");
  delete draft.source.accessedAt;

  const before = Date.now();
  const generated = buildRawDocument(draft);
  const after = Date.now();

  assert.match(generated.accessedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  const generatedMilliseconds = Date.parse(generated.accessedAt);
  assert.ok(generatedMilliseconds >= before && generatedMilliseconds <= after);

  const explicitMidnightTimestamp = "2026-09-28T00:00:00Z";
  draft.source.accessedAt = explicitMidnightTimestamp;
  assert.equal(buildRawDocument(draft).accessedAt, explicitMidnightTimestamp);
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

test("body-only weight uses its field contract and validates an explicit claim basis", () => {
  const check = (value, basis) => {
    const draft = sourceDraft("https://www.sony.com/fixture/body-only-basis", value);
    const observation = draft.items[0].observations[0];
    if (basis === undefined) delete observation.conditions.weightBasis;
    else observation.conditions.weightBasis = basis;
    const raw = buildRawDocument(draft);
    const [staging] = normalizeRawDocument(raw, { batchId, vocab, identityMap });
    return validateStaging(staging, { canonical, vocab, rawDocuments: new Map([[raw.sourceId, raw]]) });
  };
  assert.equal(check(575, "body-only").valid, true);
  assert.equal(check(575, undefined).valid, true); // Archived production body-only claims omit the redundant condition.
  assert.ok(check(575, "battery-and-card").errors.some((error) => error.code === "INVALID_WEIGHT_BASIS"));
  assert.equal(check(null, undefined).valid, true);
});

function ibisFixture(value) {
  const draft = sourceDraft("https://www.sony.com/fixture/ibis-contract");
  draft.items[0].observations = [{
    field: "IBIS", path: "specs.ibis", rawValue: value, rawUnit: null,
    locator: { section: "Stabilization", row: "IBIS" }, conditions: {},
  }];
  const raw = buildRawDocument(draft);
  const [staging] = normalizeRawDocument(raw, { batchId, vocab, identityMap });
  return { staging, result: validateStaging(staging, { canonical, vocab, rawDocuments: new Map([[raw.sourceId, raw]]) }) };
}

test("IBIS claims accept the existing optional and null-safe canonical object contract", () => {
  for (const value of [
    { present: true, axes: 5, stops: 5.5, conditions: "CIPA test conditions" },
    { present: false, axes: 0, stops: 0, conditions: null },
    { present: null, axes: null, stops: null, conditions: null },
    { present: true }, {},
  ]) {
    assert.doesNotThrow(() => validateSpecValue(value, "specs.ibis"));
    assert.equal(ibisFixture(value).result.valid, true, JSON.stringify(value));
  }
});

for (const value of [true, false]) {
  test(`IBIS boolean ${value} is rejected before approval`, () => {
    assert.throws(() => validateSpecValue(value, "specs.ibis"));
    const result = ibisFixture(value).result;
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((error) => error.code === "INVALID_IBIS" && error.path === "specs.ibis"));
  });
}

test("malformed IBIS objects are rejected using the existing child contracts", () => {
  assert.throws(() => validateSpecValue([], "specs.ibis"));
  assert.throws(() => ibisFixture([]), /Array value is not supported/);
  for (const value of ["enabled", { unknownKey: true }, { present: 1 }, { axes: "5" },
    { axes: -1 }, { stops: -0.5 }, { conditions: {} }, { conditions: "" }, { conditions: "UNKNOWN" }]) {
    assert.throws(() => validateSpecValue(value, "specs.ibis"));
    assert.ok(ibisFixture(value).result.errors.some((error) => error.code === "INVALID_IBIS"), JSON.stringify(value));
  }
});

test("null and UNKNOWN IBIS retain the existing normalization policy", () => {
  for (const value of [null, "UNKNOWN"]) {
    const { staging, result } = ibisFixture(value);
    assert.equal(staging.product.specs.ibis, null);
    assert.equal(staging.claims[0].unknown, true);
    assert.equal(result.valid, true);
  }
});

test("CLI validate marks invalid IBIS as rejected without changing canonical", async (t) => {
  const isolated = await isolatedFixture(t);
  const original = readJson("src/data/ingestion/raw/source-0379a083289afde8.json");
  const raw = structuredClone(original);
  raw.evidenceExcerpt.push({ field: "IBIS", value: true, unit: null });
  raw.items[0].observations.push({ ...raw.items[0].observations[0],
    path: "specs.ibis", rawValue: true, rawUnit: null, evidenceRef: raw.evidenceExcerpt.length - 1,
    locator: { section: "Stabilization", row: "IBIS" }, conditions: {},
  });
  raw.contentDigest = digestValue(raw.evidenceExcerpt);
  raw.sourceId = createSourceId(raw);
  writeFileSync(path.join(isolated.p.ingestion, "raw", `${raw.sourceId}.json`), JSON.stringify(raw));
  const manifest = JSON.parse(readFileSync(isolated.p.manifest));
  manifest.items.forEach((item) => { item.sourceIds = [raw.sourceId]; });
  writeFileSync(isolated.p.manifest, JSON.stringify(manifest));
  const normalized = runIsolated(isolated.root, "normalize");
  assert.equal(normalized.status, 0, normalized.stderr);
  const validated = runIsolated(isolated.root, "validate");
  assert.equal(validated.status, 1, validated.stderr);
  const result = JSON.parse(validated.stdout);
  assert.equal(result.batchId, pilotBatchId);
  assert.equal(result.status, "rejected");
  assert.ok(result.items[0].errors.some((error) => error.code === "INVALID_IBIS" && error.path === "specs.ibis"));
  assert.equal(JSON.parse(readFileSync(isolated.p.manifest)).items[0].state, "rejected");
  assert.equal(readFileSync(isolated.p.canonical, "utf8"), isolated.before);
});

test("archived production staging remains valid without changing canonical or batch artifacts", () => {
  const batches = readdirSync(path.join(root, "src/data/ingestion/batches"))
    .filter((name) => /^production-(sony|canon|nikon|fujifilm|panasonic)-bodies-\d+\.json$/.test(name))
    .map((name) => name.slice(0, -5));
  for (const brand of ["sony", "canon", "nikon", "fujifilm", "panasonic"]) assert.ok(batches.some((batch) => batch.startsWith(`production-${brand}-`)));
  for (const batch of batches) {
    const manifest = readJson(`src/data/ingestion/batches/${batch}.json`);
    const before = readJson(`src/data/ingestion/transactions/${batch}/before.json`);
    const stagings = manifest.items.map(({ itemKey }) => readJson(`src/data/ingestion/staging/${batch}/${itemKey}.json`));
    const sourceIds = new Set(manifest.items.flatMap(({ sourceIds }) => sourceIds));
    const rawDocuments = new Map([...sourceIds].map((sourceId) => [sourceId, readJson(`src/data/ingestion/raw/${sourceId}.json`)]));
    const legacyFixedLensUnits = stagings.some((staging) => staging.claims.some((claim) => claim.path.startsWith("specs.fixedLens.equivalentFocal.") && claim.value !== null && claim.unit === null));
    const result = validateStagingBatch(stagings, { canonical: before, vocab, rawDocuments, legacyFixedLensUnits });
    assert.equal(result.valid, true, `${batch}: ${JSON.stringify(result.items.flatMap((item) => item.errors))}`);
  }
  assert.equal(validateCanonical(canonical, vocab), true);
});

test("human diff summary includes a new product's identity-only source", () => {
  const staging = readJson("src/data/ingestion/staging/production-sony-bodies-003/sony-ilce-9m3.json");
  const before = readJson("src/data/ingestion/transactions/production-sony-bodies-003/before.json");
  const diff = createCanonicalDiff(staging, before);

  assert.equal(diff.operation, "new-product");
  assert.equal(stagingSources(staging).length, 2);
  assert.match(formatCanonicalDiff(diff), /summary: 22 fields \/ 2 sources \|/);
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

test("the reviewed production canonical inventory remains complete and valid", () => {
  assert.ok(canonical.bodies.length + canonical.lenses.length >= 122);
  for (const id of ["sony-a9-iii", "sony-a7r-v", "sony-a7cr", "sony-a6700", "sony-zv-e1", "sony-zv-e10-ii", "sony-a7s-iii", "sony-rx10-v", "sony-rx1r-iii", "sony-rx100-vii", "sony-zv-1-ii", "sony-zv-1f", "sony-zv-1", "sony-rx0-ii", "sony-rx10-iv", "sony-a1", "sony-a6400", "sony-zv-e10", "sony-fx2", "sony-fx30", "sony-fx5", "sony-a7c", "sony-a9-ii", "sony-a6600", "sony-a7r-iv-a", "sony-fx3a", "sony-fx3", "sony-a7r-iii-a", "sony-fx6"]) {
    assert.ok(canonical.bodies.some((body) => body.id === id), `missing reviewed production body: ${id}`);
  }
  assert.equal(validateCanonical(canonical, vocab), true);
});

function fixedFocalFixture(values = [[4.3, 'mm'], [24, 'mm']]) {
  const draft = sourceDraft('https://www.sony.com/fixture/focal-units');
  draft.items[0].observations = values.map(([rawValue, rawUnit], index) => ({
    field: index ? '35mm equivalent focal length' : 'Actual focal length',
    path: `specs.fixedLens.${index ? 'equivalentFocal' : 'focal'}.min`,
    rawValue, rawUnit, locator: { row: index ? 'Equivalent' : 'Actual' }, conditions: {},
  }));
  const raw = buildRawDocument(draft);
  const [staging] = normalizeRawDocument(raw, { batchId, vocab, identityMap });
  const context = { canonical, vocab, rawDocuments: new Map([[raw.sourceId, raw]]) };
  return { raw, staging, context, result: validateStaging(staging, context) };
}

test('fixed focal and 35mm equivalent claims independently normalize to mm in staging and diff', () => {
  const { staging, result } = fixedFocalFixture();
  assert.equal(result.valid, true, JSON.stringify(result.errors));
  assert.deepEqual(staging.claims.map(({ value, unit }) => [value, unit]), [[4.3, 'mm'], [24, 'mm']]);
  assert.equal(staging.product.specs.fixedLens.focal.min, 4.3);
  assert.equal(staging.product.specs.fixedLens.equivalentFocal.min, 24);
  assert.ok(createCanonicalDiff(staging, canonical).changes.every((change) => change.unit === 'mm'));
  for (const field of ['focal', 'equivalentFocal']) for (const end of ['min', 'max']) {
    const path = `specs.fixedLens.${field}.${end}`;
    assert.deepEqual(normalizeClaimValue(path, 2, 'cm'), { value: 20, unit: 'mm', unknown: false });
    assert.deepEqual(normalizeClaimValue(path, 1, 'in'), { value: 25.4, unit: 'mm', unknown: false });
  }
  assert.equal(fixedFocalFixture([[0.43, 'cm'], [24 / 25.4, 'in']]).result.valid, true);
});

test('known fixed focal claims require supported raw units and normalized mm before approval', () => {
  for (const index of [0, 1]) for (const unit of [undefined, null, '', 'ft', 'm', 'pixels']) {
    const values = [[4.3, 'mm'], [24, 'mm']];
    values[index][1] = unit;
    const { result } = fixedFocalFixture(values);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((error) => error.path === `specs.fixedLens.${index ? 'equivalentFocal' : 'focal'}.min`
      && error.code === (unit == null || unit === '' ? 'UNIT_REQUIRED' : 'UNSUPPORTED_UNIT')));
  }
  for (const index of [0, 1]) {
    const { staging, context } = fixedFocalFixture();
    staging.claims[index].unit = null;
    const result = validateStaging(staging, context);
    assert.ok(result.errors.some((error) => error.code === 'UNIT_REQUIRED'));
  }
});

test('staged focal raw units cannot invent a missing source unit', () => {
  const { staging, context } = fixedFocalFixture([[4.3, null], [24, 'mm']]);
  staging.claims[0].rawUnit = 'mm';
  assert.ok(validateStaging(staging, context).errors.some((error) => error.code === 'RAW_CLAIM_MISMATCH'));
});

test('null and UNKNOWN fixed focal claims do not require a unit', () => {
  for (const value of [null, 'UNKNOWN']) {
    const { staging, result } = fixedFocalFixture([[value, null], [value, undefined]]);
    assert.equal(result.valid, true, JSON.stringify(result.errors));
    assert.ok(staging.claims.every((claim) => claim.value === null && claim.unknown));
  }
});

test('archived P950/P1000 equivalent unit null replays only with explicit archive compatibility', () => {
  for (const batch of ['production-nikon-bodies-002', 'production-nikon-bodies-004']) {
    const manifest = readJson(`src/data/ingestion/batches/${batch}.json`);
    const item = manifest.items.find((item) => /p950|p1000/.test(item.productId));
    const staging = readJson(`src/data/ingestion/staging/${batch}/${item.itemKey}.json`);
    const rawDocuments = new Map(item.sourceIds.map((id) => [id, readJson(`src/data/ingestion/raw/${id}.json`)]));
    const context = { canonical: readJson(`src/data/ingestion/transactions/${batch}/before.json`), vocab, rawDocuments };
    assert.ok(validateStaging(staging, context).errors.some((error) => error.code === 'UNIT_REQUIRED'));
    assert.equal(validateStaging(staging, { ...context, legacyFixedLensUnits: true }).valid, true);
    for (const raw of rawDocuments.values()) {
      for (const fresh of normalizeRawDocument(raw, { batchId: batch, vocab, identityMap })) {
        assert.ok(fresh.claims.filter((claim) => /fixedLens\.(focal|equivalentFocal)\./.test(claim.path)).every((claim) => claim.unit === 'mm'));
      }
    }
  }
});

for (const invalidUnit of [null, 'ft']) test(`CLI validate rejects fixed focal unit ${invalidUnit} without changing canonical`, async (t) => {
  const isolated = await isolatedFixture(t);
  const raw = readJson('src/data/ingestion/raw/source-0379a083289afde8.json');
  raw.evidenceExcerpt.push({ field: 'Equivalent focal length', value: 24, unit: invalidUnit });
  raw.items[0].observations.push({ ...raw.items[0].observations[0],
    path: 'specs.fixedLens.equivalentFocal.min', rawValue: 24, rawUnit: invalidUnit, evidenceRef: raw.evidenceExcerpt.length - 1,
    locator: { row: 'Equivalent focal length' }, conditions: {},
  });
  raw.contentDigest = digestValue(raw.evidenceExcerpt);
  raw.sourceId = createSourceId(raw);
  writeFileSync(path.join(isolated.p.ingestion, 'raw', `${raw.sourceId}.json`), JSON.stringify(raw));
  const manifest = JSON.parse(readFileSync(isolated.p.manifest));
  manifest.items.forEach((item) => { item.sourceIds = [raw.sourceId]; });
  writeFileSync(isolated.p.manifest, JSON.stringify(manifest));
  const normalized = runIsolated(isolated.root, 'normalize');
  assert.equal(normalized.status, 0, normalized.stderr);
  const validated = runIsolated(isolated.root, 'validate');
  assert.equal(validated.status, 1, validated.stderr);
  assert.equal(JSON.parse(validated.stdout).status, 'rejected');
  assert.ok(JSON.parse(validated.stdout).items[0].errors.some((error) => error.code === (invalidUnit === null ? 'UNIT_REQUIRED' : 'UNSUPPORTED_UNIT')));
  assert.equal(JSON.parse(readFileSync(isolated.p.manifest)).items[0].state, 'rejected');
  assert.equal(readFileSync(isolated.p.canonical, 'utf8'), isolated.before);
});

function lcdFixture(value, claimPath = "specs.lcd") {
  const draft = sourceDraft("https://www.panasonic.com/fixture/lcd-contract");
  draft.items[0].observations = [{
    field: "LCD", path: claimPath, rawValue: value, rawUnit: claimPath === "specs.lcd.sizeInches" ? "in" : null,
    locator: { section: "Monitor", row: "LCD" }, conditions: {},
  }];
  const raw = buildRawDocument(draft);
  const [staging] = normalizeRawDocument(raw, { batchId, vocab, identityMap });
  return { raw, staging, result: validateStaging(staging, { canonical, vocab, rawDocuments: new Map([[raw.sourceId, raw]]) }) };
}

test("LCD ingestion and approval share every existing enum and optional child contract", () => {
  for (const mechanism of ["fixed", "tilt", "vari-angle", "multi-angle"]) {
    const value = { present: true, sizeInches: 3, resolutionDots: 1840000, mechanism, touch: false };
    assert.doesNotThrow(() => validateSpecValue(value, "specs.lcd"));
    assert.equal(lcdFixture(value).result.valid, true);
    assert.equal(lcdFixture(mechanism, "specs.lcd.mechanism").result.valid, true);
  }
  for (const value of [{}, { present: null, mechanism: null, sizeInches: null, resolutionDots: null, touch: null }]) {
    assert.doesNotThrow(() => validateSpecValue(value, "specs.lcd"));
    assert.equal(lcdFixture(value).result.valid, true);
  }
});

test("LCD unsupported enums and malformed objects fail ingestion before approval", () => {
  for (const value of [true, false, [], "enabled", { unknownKey: true }, { mechanism: "unsupported" },
    { present: 1 }, { touch: "yes" }, { sizeInches: "3" }, { sizeInches: 0 }, { resolutionDots: -1 }]) {
    assert.throws(() => validateSpecValue(value, "specs.lcd"));
    const result = lcdFixture(value).result;
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((error) => error.code === "INVALID_LCD"), JSON.stringify(value));
  }
  for (const [claimPath, value] of [["specs.lcd.mechanism", "unsupported"], ["specs.lcd.mechanism", true],
    ["specs.lcd.present", 1], ["specs.lcd.touch", "yes"], ["specs.lcd.sizeInches", -1]]) {
    assert.throws(() => validateSpecValue(value, claimPath));
    assert.ok(lcdFixture(value, claimPath).result.errors.some((error) => error.code === "INVALID_LCD" && error.path === claimPath));
  }
});

test("LCD null and UNKNOWN retain existing whole-object and leaf policy", () => {
  for (const claimPath of ["specs.lcd", "specs.lcd.mechanism"]) for (const value of [null, "UNKNOWN"]) {
    const { staging, result } = lcdFixture(value, claimPath);
    assert.equal(staging.claims[0].value, null);
    assert.equal(staging.claims[0].unknown, true);
    assert.equal(result.valid, true);
  }
});

test("DC-L10 free-angle normalizes to vari-angle while preserving raw evidence", () => {
  for (const [claimPath, rawValue, value] of [
    ["specs.lcd.mechanism", "free-angle", "vari-angle"],
    ["specs.lcd", { mechanism: "free-angle", present: true }, { mechanism: "vari-angle", present: true }],
  ]) {
    const { raw, staging, result } = lcdFixture(rawValue, claimPath);
    assert.equal(result.valid, true);
    assert.deepEqual(staging.claims[0].value, value);
    assert.deepEqual(staging.claims[0].rawValue, rawValue);
    assert.deepEqual(raw.items[0].observations[0].rawValue, rawValue);
    assert.doesNotThrow(() => validateSpecValue(staging.claims[0].value, claimPath));
    const diff = createCanonicalDiff(staging, canonical);
    const decisions = diff.changes.map((change) => ({ productId: diff.productId, claimId: change.claimId, action: "accept" }));
    const promoted = proposedCanonical(canonical, { stagings: [staging], vocab }, decisions).canonical;
    assert.equal(promoted.bodies.find((body) => body.id === staging.product.id).specs.lcd.mechanism, "vari-angle");
  }
});

test("CLI validate rejects an unsupported LCD enum without changing canonical", async (t) => {
  const isolated = await isolatedFixture(t);
  const raw = structuredClone(readJson("src/data/ingestion/raw/source-0379a083289afde8.json"));
  raw.evidenceExcerpt.push({ field: "LCD mechanism", value: "unsupported", unit: null });
  raw.items[0].observations.push({ ...raw.items[0].observations[0],
    path: "specs.lcd.mechanism", rawValue: "unsupported", rawUnit: null, evidenceRef: raw.evidenceExcerpt.length - 1,
    locator: { section: "Monitor", row: "Mechanism" }, conditions: {},
  });
  raw.contentDigest = digestValue(raw.evidenceExcerpt);
  raw.sourceId = createSourceId(raw);
  writeFileSync(path.join(isolated.p.ingestion, "raw", `${raw.sourceId}.json`), JSON.stringify(raw));
  const manifest = JSON.parse(readFileSync(isolated.p.manifest));
  manifest.items.forEach((item) => { item.sourceIds = [raw.sourceId]; });
  writeFileSync(isolated.p.manifest, JSON.stringify(manifest));
  const normalized = runIsolated(isolated.root, "normalize");
  assert.equal(normalized.status, 0, normalized.stderr);
  const validated = runIsolated(isolated.root, "validate");
  assert.equal(validated.status, 1, validated.stderr);
  const result = JSON.parse(validated.stdout);
  assert.equal(result.status, "rejected");
  assert.ok(result.items[0].errors.some((error) => error.code === "INVALID_LCD" && error.path === "specs.lcd.mechanism"));
  assert.equal(JSON.parse(readFileSync(isolated.p.manifest)).items[0].state, "rejected");
  assert.equal(readFileSync(isolated.p.canonical, "utf8"), isolated.before);
});
