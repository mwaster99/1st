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
const batch = 'production-canon-bodies-004';
const selected = new Map([
  ['PowerShot SX740 HS', 'canon-powershot-sx740-hs'],
  ['IXUS 285 HS A', 'canon-ixus-285-hs-a'],
  ['EOS C400', 'canon-c400'],
  ['EOS R5 C', 'canon-r5-c'],
  ['EOS C70', 'canon-c70'],
]);

test('Canon batch 004 retains its five released cameras after later batches complete coverage', () => {
  const snapshot = json(`${base}canon-current-camera-gallery-2026-09-29.json`);
  const canonical = json('src/data/cameraProducts.json');
  assert.equal(snapshot.cards.length, 29);
  assert.equal(snapshot.cards.filter((card) => card.status === 'canonicalized').length, 28);
  assert.equal(snapshot.cards.filter((card) => card.status === 'unprocessed' && card.availabilityStatus === 'released-current').length, 0);
  assert.equal(snapshot.cards.filter((card) => card.status === 'unprocessed' && card.availabilityStatus === 'announced-upcoming').length, 1);
  for (const [code, id] of selected) {
    const card = snapshot.cards.find((entry) => entry.modelCode === code);
    assert.equal(card?.availabilityStatus, 'released-current');
    assert.equal(card?.status, 'canonicalized');
    assert.equal(card?.canonicalId, id);
    assert.equal(card?.productionBatch, batch);
  }
  assert.ok(canonical.bodies.length >= 86);
  assert.ok(canonical.lenses.length >= 36);
  assert.equal(validateCanonical(canonical, json(`${base}vocab.json`)), true);
});

test('Canon batch 004 retains official source, approval, and atomic transaction integrity', () => {
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
  assert.ok(diff.items.every((item) => item.operation === 'new-product' && item.changes.every((change) => change.category === 'new-product')));
  for (const item of manifest.items) {
    assert.equal(item.state, 'canonicalized');
    assert.ok(bodies.has(item.productId));
    assert.equal(item.sourceIds.length, item.productId === 'canon-r5-c' ? 3 : 2);
    const staging = json(`${base}staging/${batch}/${item.itemKey}.json`);
    assert.equal(item.stagingDigest, digestValue(staging));
    assert.equal(staging.sources.length, item.sourceIds.length);
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
});

test('fixed cameras keep integrated optics and Cinema EOS keeps conditional facts in evidence', () => {
  const canonical = json('src/data/cameraProducts.json');
  const bodies = new Map(canonical.bodies.map((body) => [body.id, body]));
  for (const id of ['canon-powershot-sx740-hs', 'canon-ixus-285-hs-a']) {
    assert.equal(bodies.get(id).kind, 'fixed');
    assert.equal(bodies.get(id).mount, null);
    assert.ok(!canonical.lenses.some((lens) => lens.id.startsWith(id)));
  }
  assert.deepEqual(bodies.get('canon-powershot-sx740-hs').specs.fixedLens.focal, { max: 172, min: 4.3 });
  assert.deepEqual(bodies.get('canon-powershot-sx740-hs').specs.fixedLens.equivalentFocal, { max: 960, min: 24 });
  const ixus = bodies.get('canon-ixus-285-hs-a');
  assert.deepEqual(ixus.specs.fixedLens.equivalentFocal, { max: 300, min: 25 });
  assert.equal(ixus.specs.fixedLens.focal, undefined);
  assert.equal(ixus.specs.fixedLens.aperture, undefined);
  assert.equal(ixus.specs.weight, null);
  for (const id of ['canon-c400', 'canon-r5-c', 'canon-c70']) {
    assert.equal(bodies.get(id).kind, 'interchangeable');
    assert.equal(bodies.get(id).mount, 'Canon RF');
    assert.equal(bodies.get(id).specs.fixedLens, null);
  }
  assert.equal(bodies.get('canon-c400').specs.sensor.megapixels, null);
  assert.equal(bodies.get('canon-c70').specs.sensor.megapixels, null);
  assert.equal(bodies.get('canon-c70').specs.cardSlots.count, 2);
  const r5c = json(`${base}staging/${batch}/canon-eos-r5-c.json`);
  assert.equal(r5c.claims.find((claim) => claim.path === 'specs.video.max').conditions.externalPowerRequired, true);
  assert.equal(r5c.claims.find((claim) => claim.path === 'specs.weight').conditions.weightBasis, 'battery-and-card');
  assert.equal(r5c.claims.find((claim) => claim.path === 'specs.bodyOnlyWeight').conditions.weightBasis, 'body-only');
  const c70 = json(`${base}staging/${batch}/canon-eos-c70.json`);
  assert.equal(c70.claims.find((claim) => claim.path === 'specs.video.max').conditions.recording, 'normal');
});

test('batch 004 weight basis errors fail the production validator before approval', () => {
  const manifest = json(`${base}batches/${batch}.json`);
  const stagings = manifest.items.map((item) => json(`${base}staging/${batch}/${item.itemKey}.json`));
  const rawDocuments = new Map(manifest.items.flatMap((item) => item.sourceIds)
    .map((sourceId) => [sourceId, json(`${base}raw/${sourceId}.json`)]));
  const context = { canonical: json(`${base}transactions/${batch}/before.json`), vocab: json(`${base}vocab.json`), rawDocuments };
  assert.equal(validateStagingBatch(stagings, context).valid, true);
  for (const [basis, code] of [[undefined, 'WEIGHT_BASIS_REQUIRED'], ['operational', 'INVALID_WEIGHT_BASIS'], ['battery', 'WEIGHT_BASIS_MISMATCH']]) {
    const changed = structuredClone(stagings);
    const weight = changed.find((entry) => entry.product.id === 'canon-r5-c').claims.find((claim) => claim.path === 'specs.weight');
    if (basis === undefined) delete weight.conditions.weightBasis;
    else weight.conditions.weightBasis = basis;
    const result = validateStagingBatch(changed, context);
    assert.equal(result.valid, false);
    assert.ok(result.items.flatMap((item) => item.errors).some((error) => error.code === code));
  }
});
