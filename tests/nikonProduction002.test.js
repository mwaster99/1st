import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCanonical } from '../scripts/objective/merge.mjs';
import { digestValue, validateStagingBatch } from '../scripts/objective/rules.mjs';
import { getIntegratedLens, BODY_BY_ID } from '../src/cameraData.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => readFileSync(path.join(root, name));
const json = (name) => JSON.parse(read(name));
const sha = (name) => createHash('sha256').update(read(name)).digest('hex');
const base = 'src/data/ingestion/';
const batch = 'production-nikon-bodies-002';
const selected = new Map([
  ['Z9', 'nikon-z9'], ['Zfc', 'nikon-zfc'], ['Z7II', 'nikon-z7-ii'],
  ['D850', 'nikon-d850'], ['COOLPIX P950', 'nikon-coolpix-p950'],
]);

test('Nikon batch 002 inventory preserves historical selection and upcoming boundary', () => {
  const snapshot = json(`${base}nikon-current-camera-gallery-2026-10-01.json`);
  const canonical = json('src/data/cameraProducts.json');
  assert.equal(snapshot.cards.length, 22);
  assert.equal(snapshot.cards.filter((card) => card.availabilityStatus === 'released-current').length, 21);
  assert.equal(snapshot.cards.filter((card) => card.availabilityStatus === 'announced-upcoming').length, 1);
  assert.ok(snapshot.cards.filter((card) => card.availabilityStatus === 'released-current' && card.status === 'unprocessed').length <= 6);
  assert.equal(snapshot.cards.find((card) => card.name === 'Z5IIC').status, 'unprocessed');
  assert.ok(!canonical.bodies.some((body) => body.model === 'Z5IIC'));
  for (const [name, id] of selected) {
    const card = snapshot.cards.find((candidate) => candidate.name === name);
    assert.equal(card.status, 'canonicalized');
    assert.equal(card.canonicalId, id);
    assert.equal(card.productionBatch, batch);
    assert.ok(canonical.bodies.some((body) => body.id === id));
  }
  assert.ok(canonical.bodies.length >= 96);
  assert.ok(canonical.lenses.length >= 36);
  assert.equal(validateCanonical(canonical, json(`${base}vocab.json`)), true);
});

test('Nikon batch 002 official evidence and archived atomic transition remain valid', () => {
  const manifest = json(`${base}batches/${batch}.json`);
  const approval = json(`${base}approvals/${batch}.json`);
  const journal = json(`${base}transactions/${batch}/journal.json`);
  const diff = json(`${base}diffs/${batch}.json`);
  const canonical = json('src/data/cameraProducts.json');
  const raws = new Map(manifest.items.flatMap((item) => item.sourceIds)
    .map((sourceId) => [sourceId, json(`${base}raw/${sourceId}.json`)]));
  const stagings = manifest.items.map((item) => json(`${base}staging/${batch}/${item.itemKey}.json`));
  assert.equal(manifest.items.length, 5);
  assert.equal(manifest.apply.state, 'canonicalized');
  assert.equal(journal.phase, 'canonicalized');
  assert.equal(manifest.canonicalBaselineDigest, json(`${base}batches/production-nikon-bodies-001.json`).expectedCanonicalDigest);
  assert.equal(manifest.canonicalBaselineDigest, sha(`${base}transactions/${batch}/before.json`));
  assert.equal(manifest.expectedCanonicalDigest, sha(`${base}transactions/${batch}/after.json`));
  const after = json(`${base}transactions/${batch}/after.json`);
  assert.equal(after.bodies.length, 96);
  assert.equal(after.lenses.length, 36);
  assert.equal(approval.diffDigest, digestValue(diff));
  assert.equal(approval.diffFileDigest, sha(`${base}diffs/${batch}.json`));
  assert.deepEqual(new Set(approval.productIds), new Set(selected.values()));
  assert.ok(diff.items.every((item) => item.operation === 'new-product' && item.changes.every((change) => change.category === 'new-product')));
  for (const [index, item] of manifest.items.entries()) {
    assert.equal(item.state, 'canonicalized');
    assert.equal(item.sourceIds.length, 2);
    assert.equal(item.stagingDigest, digestValue(stagings[index]));
    assert.equal(stagings[index].sources.length, 2);
    assert.ok(stagings[index].claims.every((claim) => claim.verification === 'verified'));
    const product = canonical.bodies.find((body) => body.id === item.productId);
    const productSourceIds = new Set(product.sources.map((source) => source.sourceId));
    assert.ok(item.sourceIds.every((sourceId) => productSourceIds.has(sourceId)));
    for (const [sourceIndex, sourceId] of item.sourceIds.entries()) {
      const raw = raws.get(sourceId);
      assert.equal(item.rawDigests[sourceIndex], digestValue(raw));
      assert.match(raw.accessedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      assert.equal(new Date(raw.accessedAt).toISOString(), raw.accessedAt);
    }
  }
  assert.equal(validateStagingBatch(stagings, { canonical: json(`${base}transactions/${batch}/before.json`), vocab: json(`${base}vocab.json`), rawDocuments: raws, legacyFixedLensUnits: true }).valid, true);
});

test('Nikon conditional claims, weight basis and P950 integrated lens keep their meanings', () => {
  const canonical = json('src/data/cameraProducts.json');
  const byId = new Map(canonical.bodies.map((body) => [body.id, body]));
  const staging = Object.fromEntries([...selected.values()].map((id) => [id, json(`${base}staging/${batch}/${id}.json`)]));
  for (const s of Object.values(staging)) {
    assert.equal(s.claims.find((claim) => claim.path === 'specs.weight').conditions.weightBasis, 'battery-and-card');
  }
  assert.equal(byId.get('nikon-z9').specs.shutter.mechanical, false);
  assert.equal(byId.get('nikon-z9').specs.burst.maxElectronicFps, 20);
  assert.equal(staging['nikon-z9'].claims.find((claim) => claim.path === 'specs.video.max').conditions.codec, 'N-RAW');
  assert.equal(byId.get('nikon-z7-ii').specs.ibis.axes, 5);
  assert.equal(staging['nikon-d850'].claims.find((claim) => claim.path === 'specs.burst.maxMechanicalFps').conditions.battery, 'EN-EL15a');
  const p950 = byId.get('nikon-coolpix-p950');
  assert.equal(p950.kind, 'fixed');
  assert.equal(p950.mount, null);
  assert.deepEqual(p950.specs.fixedLens.focal, { min: 4.3, max: 357 });
  assert.deepEqual(p950.specs.fixedLens.equivalentFocal, { min: 24, max: 2000 });
  assert.deepEqual(p950.specs.fixedLens.aperture, { wide: 2.8, tele: 6.5 });
  assert.ok(!canonical.lenses.some((lens) => lens.id.startsWith('nikon-coolpix-p950')));
  const integrated = getIntegratedLens(BODY_BY_ID[p950.id]);
  assert.equal(integrated.includedInBodyId, p950.id);
  assert.equal(integrated.weight, null);
});
