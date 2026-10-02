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
const batch = 'production-nikon-bodies-001';
const selected = new Map([
  ['Z8', 'nikon-z8'], ['Z30', 'nikon-z30'], ['ZR', 'nikon-zr'],
  ['D7500', 'nikon-d7500'], ['COOLPIX P1100', 'nikon-coolpix-p1100'],
]);

test('Nikon Korea inventory preserves the first batch denominator and upcoming boundary', () => {
  const snapshot = json(`${base}nikon-current-camera-gallery-2026-10-01.json`);
  const canonical = json('src/data/cameraProducts.json');
  assert.equal(snapshot.cards.length, 22);
  assert.deepEqual(Object.fromEntries(['mirrorless', 'dslr', 'compact', 'zcinema']
    .map((category) => [category, snapshot.cards.filter((card) => card.category === category).length])),
    { mirrorless: 15, dslr: 3, compact: 3, zcinema: 1 });
  assert.equal(snapshot.cards.filter((card) => card.availabilityStatus === 'released-current').length, 21);
  assert.equal(snapshot.cards.filter((card) => card.availabilityStatus === 'announced-upcoming').length, 1);
  assert.ok(snapshot.cards.filter((card) => card.availabilityStatus === 'released-current' && card.status === 'unprocessed').length <= 11);
  assert.equal(snapshot.cards.find((card) => card.name === 'Z5IIC').status, 'unprocessed');
  assert.ok(!canonical.bodies.some((body) => body.model === 'Z5IIC'));
  assert.equal(new Set(snapshot.cards.map((card) => card.productUrl)).size, 22);
  for (const [name, id] of selected) {
    const card = snapshot.cards.find((candidate) => candidate.name === name);
    assert.equal(card.status, 'canonicalized');
    assert.equal(card.canonicalId, id);
    assert.equal(card.productionBatch, batch);
    assert.ok(canonical.bodies.some((body) => body.id === id));
  }
  assert.ok(canonical.bodies.length >= 91);
  assert.ok(canonical.lenses.length >= 36);
  assert.equal(validateCanonical(canonical, json(`${base}vocab.json`)), true);
});

test('Nikon batch 001 has verified official sources and an intact atomic promotion chain', () => {
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
  assert.equal(manifest.canonicalBaselineDigest, json(`${base}batches/production-canon-bodies-005.json`).expectedCanonicalDigest);
  assert.equal(manifest.canonicalBaselineDigest, sha(`${base}transactions/${batch}/before.json`));
  assert.equal(manifest.expectedCanonicalDigest, sha(`${base}transactions/${batch}/after.json`));
  const after = json(`${base}transactions/${batch}/after.json`);
  assert.equal(after.bodies.length, 91);
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
    assert.deepEqual(new Set(product.sources.map((source) => source.sourceId)), new Set(item.sourceIds));
    for (const [sourceIndex, sourceId] of item.sourceIds.entries()) {
      const raw = raws.get(sourceId);
      assert.equal(item.rawDigests[sourceIndex], digestValue(raw));
      assert.match(raw.accessedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      assert.equal(new Date(raw.accessedAt).toISOString(), raw.accessedAt);
    }
  }
  assert.equal(validateStagingBatch(stagings, { canonical: json(`${base}transactions/${batch}/before.json`), vocab: json(`${base}vocab.json`), rawDocuments: raws, legacyFixedLensUnits: true }).valid, true);
});

test('Nikon conditional specs and fixed lens retain their measurement meaning', () => {
  const canonical = json('src/data/cameraProducts.json');
  const byId = new Map(canonical.bodies.map((body) => [body.id, body]));
  const z8 = json(`${base}staging/${batch}/nikon-z8.json`);
  const z30 = json(`${base}staging/${batch}/nikon-z30.json`);
  const zr = json(`${base}staging/${batch}/nikon-zr.json`);
  const d7500 = json(`${base}staging/${batch}/nikon-d7500.json`);
  const p1100 = byId.get('nikon-coolpix-p1100');
  assert.equal(byId.get('nikon-z8').specs.shutter.mechanical, false);
  assert.equal(z8.claims.find((claim) => claim.path === 'specs.video.max').conditions.recordingLocation, 'internal');
  assert.equal(z30.claims.find((claim) => claim.path === 'specs.burst.maxMechanicalFps').conditions.recordingFormat, 'JPEG or 12-bit RAW');
  assert.equal(zr.claims.find((claim) => claim.path === 'specs.video.max').conditions.codec, 'R3D NE');
  assert.equal(d7500.claims.find((claim) => claim.path === 'specs.burst.maxMechanicalFps').conditions.shutterSpeed, '1/250s or faster');
  for (const staging of [z8, z30, zr, d7500, json(`${base}staging/${batch}/nikon-coolpix-p1100.json`)]) {
    assert.equal(staging.claims.find((claim) => claim.path === 'specs.weight').conditions.weightBasis, 'battery-and-card');
  }
  assert.equal(p1100.kind, 'fixed');
  assert.equal(p1100.mount, null);
  assert.deepEqual(p1100.specs.fixedLens.focal, { min: 4.3, max: 539 });
  assert.deepEqual(p1100.specs.fixedLens.equivalentFocal, { min: 24, max: 3000 });
  assert.ok(!canonical.lenses.some((lens) => lens.id.startsWith('nikon-coolpix-p1100')));
  const integrated = getIntegratedLens(BODY_BY_ID[p1100.id]);
  assert.equal(integrated.includedInBodyId, p1100.id);
  assert.equal(integrated.weight, null);
});
