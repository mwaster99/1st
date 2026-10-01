import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { digestValue, validateStagingBatch } from '../scripts/objective/rules.mjs';
import { validateCanonical } from '../scripts/objective/merge.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => readFileSync(path.join(root, name));
const json = (name) => JSON.parse(read(name));
const sha = (name) => createHash('sha256').update(read(name)).digest('hex');
const base = 'src/data/ingestion/';
const batch = 'production-canon-bodies-003';
const selected = new Map([
  ['EOS R5', 'canon-r5'], ['EOS RP', 'canon-rp'],
  ['EOS-1D X Mark III', 'canon-1d-x-iii'],
  ['PowerShot V10', 'canon-powershot-v10'], ['EOS C50', 'canon-c50'],
]);

test('Canon batch 003 promotes five released direct-operated cameras and leaves the upcoming card pending', () => {
  const snapshot = json(`${base}canon-current-camera-gallery-2026-09-29.json`);
  const canonical = json('src/data/cameraProducts.json');
  assert.equal(snapshot.cards.length, 29);
  assert.equal(snapshot.cards.filter((card) => card.status === 'canonicalized').length, 28);
  assert.equal(snapshot.cards.filter((card) => card.status === 'unprocessed' && card.availabilityStatus === 'released-current').length, 0);
  for (const [code, id] of selected) {
    const card = snapshot.cards.find((entry) => entry.modelCode === code);
    assert.equal(card?.availabilityStatus, 'released-current');
    assert.equal(card?.status, 'canonicalized');
    assert.equal(card?.canonicalId, id);
    assert.equal(card?.productionBatch, batch);
  }
  const upcoming = snapshot.cards.find((card) => card.modelCode === 'EOS R8 Mark II');
  assert.equal(upcoming.status, 'unprocessed');
  assert.equal(upcoming.availabilityStatus, 'announced-upcoming');
  assert.ok(canonical.bodies.length >= 86);
  assert.ok(canonical.lenses.length >= 36);
  assert.equal(validateCanonical(canonical, json(`${base}vocab.json`)), true);
});

test('Canon batch 003 keeps official evidence and atomic promotion auditable', () => {
  const canonical = json('src/data/cameraProducts.json');
  const bodies = new Map(canonical.bodies.map((body) => [body.id, body]));
  const manifest = json(`${base}batches/${batch}.json`);
  const approval = json(`${base}approvals/${batch}.json`);
  const journal = json(`${base}transactions/${batch}/journal.json`);
  const diff = json(`${base}diffs/${batch}.json`);
  assert.equal(manifest.items.length, 5);
  assert.equal(manifest.apply.state, 'canonicalized');
  assert.equal(journal.phase, 'canonicalized');
  assert.equal(manifest.canonicalBaselineDigest, sha(`${base}transactions/${batch}/before.json`));
  assert.equal(manifest.expectedCanonicalDigest, sha(`${base}transactions/${batch}/after.json`));
  assert.equal(approval.diffFileDigest, sha(`${base}diffs/${batch}.json`));
  assert.deepEqual(new Set(approval.productIds), new Set(selected.values()));
  assert.equal(diff.items.length, 5);
  assert.ok(diff.items.every((item) => item.operation === 'new-product' && item.changes.every((change) => change.category === 'new-product')));
  for (const item of manifest.items) {
    assert.equal(item.state, 'canonicalized');
    assert.ok(bodies.has(item.productId));
    assert.equal(item.sourceIds.length, 2);
    const staging = json(`${base}staging/${batch}/${item.itemKey}.json`);
    assert.equal(item.stagingDigest, digestValue(staging));
    assert.equal(staging.sources.length, 2);
    assert.ok(staging.claims.every((claim) => claim.verification === 'verified'));
    assert.deepEqual(new Set(bodies.get(item.productId).sources.map((source) => source.sourceId)), new Set(item.sourceIds));
    for (const [index, sourceId] of item.sourceIds.entries()) {
      const raw = json(`${base}raw/${sourceId}.json`);
      assert.equal(raw.sourceId, sourceId);
      assert.equal(item.rawDigests[index], digestValue(raw));
      assert.match(raw.accessedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      assert.equal(new Date(raw.accessedAt).toISOString(), raw.accessedAt);
    }
  }
  const v10 = bodies.get('canon-powershot-v10');
  assert.equal(v10.kind, 'fixed');
  assert.equal(v10.mount, null);
  assert.deepEqual(v10.specs.fixedLens.focal, { min: 6.6, max: 6.6 });
  assert.equal(v10.specs.fixedLens.equivalentFocal, undefined);
  assert.equal(v10.specs.weight, null);
  assert.ok(!canonical.lenses.some((lens) => lens.id.startsWith('canon-powershot-v10')));
  assert.equal(bodies.get('canon-1d-x-iii').mount, 'Canon EF');
  assert.equal(bodies.get('canon-c50').specs.sensor.megapixels, null);
  assert.equal(bodies.get('canon-c50').specs.cardSlots.count, 2);
});

test('the production weight claims satisfy the new basis contract and malformed variants fail validation', () => {
  const manifest = json(`${base}batches/${batch}.json`);
  const stagings = manifest.items.map((item) => json(`${base}staging/${batch}/${item.itemKey}.json`));
  const rawDocuments = new Map([...new Set(manifest.items.flatMap((item) => item.sourceIds))]
    .map((sourceId) => [sourceId, json(`${base}raw/${sourceId}.json`)]));
  const context = {
    canonical: json(`${base}transactions/${batch}/before.json`),
    vocab: json(`${base}vocab.json`), rawDocuments,
  };
  assert.equal(validateStagingBatch(stagings, context).valid, true);
  for (const staging of stagings) {
    const operational = staging.claims.find((claim) => claim.path === 'specs.weight');
    if (!operational) continue;
    assert.equal(operational.conditions.weightBasis, 'battery-and-card');
    assert.equal(staging.claims.find((claim) => claim.path === 'specs.bodyOnlyWeight').conditions.weightBasis, 'body-only');
  }
  const verifyFailure = (basis, expectedCode) => {
    const changed = structuredClone(stagings);
    const claim = changed[0].claims.find((entry) => entry.path === 'specs.weight');
    if (basis === undefined) delete claim.conditions.weightBasis;
    else claim.conditions.weightBasis = basis;
    const result = validateStagingBatch(changed, context);
    assert.equal(result.valid, false);
    assert.ok(result.items.flatMap((item) => item.errors).some((error) => error.code === expectedCode));
  };
  verifyFailure(undefined, 'WEIGHT_BASIS_REQUIRED');
  verifyFailure('unsupported-basis', 'INVALID_WEIGHT_BASIS');
  verifyFailure('battery', 'WEIGHT_BASIS_MISMATCH');
});
