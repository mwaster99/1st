import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fixture as isolatedFixture } from "./support/objectiveFixture.mjs";
import {
  BATCH_STATES,
  createCanonicalDiff,
  createClaimId,
  createSourceId,
  digestValue,
  formatCanonicalDiff,
  normalizeRawDocument,
  validateStaging,
  validateStagingBatch,
} from "../scripts/objective/rules.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (relativePath) => JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
const canonicalPath = path.join(root, "src/data/cameraProducts.json");
const canonical = readJson("src/data/cameraProducts.json");
const vocab = readJson("src/data/ingestion/vocab.json");
const identityMap = readJson("src/data/ingestion/identity-map.json");
const rawFixture = readJson("src/data/ingestion/raw/source-0379a083289afde8.json");
const batchId = "pilot-sony-a7-iv-001";

function rebuiltRaw(mutator) {
  const raw = structuredClone(rawFixture);
  mutator(raw);
  raw.contentDigest = digestValue(raw.evidenceExcerpt);
  raw.sourceId = createSourceId(raw);
  return raw;
}

function normalize(raw = rawFixture) {
  return normalizeRawDocument(raw, { batchId, vocab, identityMap })[0];
}

function contextFor(raw = rawFixture) {
  return { canonical, vocab, rawDocuments: new Map([[raw.sourceId, raw]]) };
}

test("all lifecycle states remain available and unapproved apply is refused", async (t) => {
  const isolated = await isolatedFixture(t);
  assert.deepEqual(BATCH_STATES, ["pending", "collected", "normalized", "validated", "rejected", "canonicalized"]);
  const before = readFileSync(isolated.p.canonical);
  const result = spawnSync(process.execPath, [path.join(root, "scripts/objective/ingest.mjs"), "apply", "--root", isolated.root, "--batch", batchId], { encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Approval required/);
  assert.deepEqual(readFileSync(isolated.p.canonical), before);
});

test("normalization is deterministic and resolves reviewed identity, mount and provenance", () => {
  const first = normalize();
  const second = normalize();
  assert.deepEqual(second, first);
  assert.equal(digestValue(second), digestValue(first));
  assert.equal(first.product.id, "sony-a7-iv");
  assert.equal(first.product.model, "A7 IV");
  assert.equal(first.product.mount, "Sony E");
  assert.equal(first.product.specs.weight, 658);
  assert.equal(first.product.specs.weightBasis, "battery-and-card");
  assert.ok(first.claims.every((claim) => claim.sourceId === rawFixture.sourceId && claim.claimId === createClaimId(claim)));
});

test("unit conversion is deterministic and UNKNOWN remains null", () => {
  const kilograms = rebuiltRaw((raw) => {
    raw.evidenceExcerpt[0] = { ...raw.evidenceExcerpt[0], value: 0.658, unit: "kg" };
    raw.items[0].observations[0] = { ...raw.items[0].observations[0], rawValue: 0.658, rawUnit: "kg" };
  });
  assert.equal(normalize(kilograms).product.specs.weight, 658);

  const unknown = rebuiltRaw((raw) => {
    raw.evidenceExcerpt[0] = { ...raw.evidenceExcerpt[0], value: null, unit: "g" };
    raw.items[0].observations[0] = { ...raw.items[0].observations[0], rawValue: null, rawUnit: "g" };
  });
  const staging = normalize(unknown);
  assert.equal(staging.product.specs.weight, null);
  assert.equal(staging.claims[0].value, null);
  assert.equal(staging.claims[0].unknown, true);
  assert.equal(validateStaging(staging, contextFor(unknown)).valid, true);
});

test("valid pilot passes ID, alias, type, mount, physical and provenance checks", () => {
  const result = validateStaging(normalize(), contextFor());
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test("invalid ID ownership, alias, type, mount, number, price range and provenance are rejected", () => {
  const cases = [];

  const alias = structuredClone(normalize());
  alias.product.name = "캐논 EOS R8";
  cases.push([alias, "ALIAS_COLLISION"]);

  const type = structuredClone(normalize());
  type.productType = "tripod";
  cases.push([type, "INVALID_PRODUCT_TYPE"]);

  const mount = structuredClone(normalize());
  mount.product.mount = "Unreviewed Mount";
  cases.push([mount, "INVALID_MOUNT"]);

  const negative = structuredClone(normalize());
  negative.product.specs.weight = -1;
  negative.claims[0].value = -1;
  negative.claims[0].claimId = createClaimId(negative.claims[0]);
  cases.push([negative, "NEGATIVE_OR_INVALID_NUMBER"]);

  const price = structuredClone(normalize());
  price.product.price = { used: { low: 200, typical: 150, high: 100 } };
  for (const [pathName, value] of [["price.used.low", 200], ["price.used.typical", 150], ["price.used.high", 100]]) {
    const claim = { ...structuredClone(price.claims[0]), path: pathName, value, unit: "KRW", rawValue: value, rawUnit: "KRW" };
    claim.claimId = createClaimId(claim);
    price.claims.push(claim);
  }
  cases.push([price, "INVALID_ORDERED_RANGE"]);

  const provenance = structuredClone(normalize());
  provenance.claims[0].locator = {};
  provenance.claims[0].claimId = createClaimId(provenance.claims[0]);
  cases.push([provenance, "SOURCE_LOCATOR_MISSING"]);

  for (const [staging, expectedCode] of cases) {
    const result = validateStaging(staging, contextFor());
    assert.equal(result.valid, false, expectedCode);
    assert.ok(result.errors.some((error) => error.code === expectedCode), `${expectedCode}: ${JSON.stringify(result.errors)}`);
  }

  const duplicate = structuredClone(normalize());
  duplicate.itemKey = "duplicate-item";
  const batch = validateStagingBatch([normalize(), duplicate], contextFor());
  assert.equal(batch.valid, false);
  assert.ok(batch.items.every((item) => item.errors.some((error) => error.code === "DUPLICATE_INCOMING_ID")));
});

test("diff is reviewable, reports conflicts and never mutates canonical", () => {
  const before = readFileSync(canonicalPath);
  const same = createCanonicalDiff(normalize(), canonical);
  assert.equal(same.status, "review-required");
  assert.ok(same.changes.every((change) => change.category === "same-value/new-evidence"));

  const incoming = structuredClone(normalize());
  incoming.product.specs.weight = 659;
  incoming.claims[0].value = 659;
  incoming.claims[0].claimId = createClaimId(incoming.claims[0]);
  const conflict = createCanonicalDiff(incoming, canonical);
  const weight = conflict.changes.find((change) => change.path === "specs.weight");
  assert.equal(weight.category, "value-conflict");
  assert.equal(weight.canonicalValue, 658);
  assert.equal(weight.incomingValue, 659);
  const rendered = formatCanonicalDiff(conflict);
  assert.match(rendered, /status: review-required/);
  assert.match(rendered, /canonical: 658 g[\s\S]*incoming:\s+659 g[\s\S]*result:\s+value-conflict/);
  assert.deepEqual(readFileSync(canonicalPath), before);
});

test("completed read-only CLI pilot is idempotent and preserves canonical and checkpoint bytes", async (t) => {
  const isolated = await isolatedFixture(t);
  const cli = path.join(root, "scripts/objective/ingest.mjs");
  const manifestPath = isolated.p.manifest;
  const beforeCanonical = readFileSync(isolated.p.canonical);
  const beforeManifest = readFileSync(manifestPath);
  for (const command of ["normalize", "validate", "diff"]) {
    const result = spawnSync(process.execPath, [cli, command, "--root", isolated.root, "--batch", batchId], { encoding: "utf8" });
    assert.equal(result.status, 0, `${command}: ${result.stderr}`);
  }
  assert.deepEqual(readFileSync(isolated.p.canonical), beforeCanonical);
  assert.deepEqual(readFileSync(manifestPath), beforeManifest);
});
