import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { digestValue } from '../scripts/objective/rules.mjs';
import { validateCanonical } from '../scripts/objective/merge.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => readFileSync(path.join(root, name));
const json = (name) => JSON.parse(read(name));
const sha = (name) => createHash('sha256').update(read(name)).digest('hex');
const base = 'src/data/ingestion/';
const batch = 'production-canon-bodies-002';
const selected = new Map([
  ['EOS R3', 'canon-r3'], ['EOS R6 V', 'canon-r6-v'],
  ['EOS 5D Mark IV', 'canon-5d-iv'],
  ['PowerShot G7 X Mark III', 'canon-g7-x-iii'], ['EOS C80', 'canon-c80'],
]);

test('Canon batch 002 includes only released cards and defers the upcoming card', () => {
  const snapshot = json(`${base}canon-current-camera-gallery-2026-09-29.json`);
  assert.equal(snapshot.cards.length, 29);
  assert.equal(snapshot.cards.filter((card) => card.availabilityStatus === 'released-current').length, 28);
  assert.equal(snapshot.cards.filter((card) => card.availabilityStatus === 'announced-upcoming').length, 1);
  assert.equal(snapshot.cards.filter((card) => card.status === 'canonicalized').length, 28);
  assert.equal(snapshot.cards.filter((card) => card.status === 'unprocessed' && card.availabilityStatus === 'released-current').length, 0);
  for (const [code, id] of selected) {
    const card = snapshot.cards.find((entry) => entry.modelCode === code);
    assert.equal(card?.status, 'canonicalized');
    assert.equal(card?.canonicalId, id);
    assert.equal(card?.productionBatch, batch);
    assert.equal(card?.availabilityStatus, 'released-current');
  }
  const upcoming = snapshot.cards.find((card) => card.modelCode === 'EOS R8 Mark II');
  assert.equal(upcoming.status, 'unprocessed');
  assert.equal(upcoming.availabilityStatus, 'announced-upcoming');
  assert.equal(upcoming.officialReleaseMonth, '2026-10');
});

test('Canon batch 002 is an approved, traceable five-product atomic promotion', () => {
  const canonical = json('src/data/cameraProducts.json');
  const vocab = json(`${base}vocab.json`);
  const manifest = json(`${base}batches/${batch}.json`);
  const approval = json(`${base}approvals/${batch}.json`);
  const journal = json(`${base}transactions/${batch}/journal.json`);
  const bodies = new Map(canonical.bodies.map((body) => [body.id, body]));
  assert.equal(canonical.bodies.length, 86);
  assert.equal(canonical.lenses.length, 36);
  assert.equal(validateCanonical(canonical, vocab), true);
  assert.equal(manifest.items.length, 5);
  assert.equal(manifest.apply.state, 'canonicalized');
  assert.equal(journal.phase, 'canonicalized');
  assert.equal(manifest.canonicalBaselineDigest, sha(`${base}transactions/${batch}/before.json`));
  assert.equal(manifest.expectedCanonicalDigest, sha(`${base}transactions/${batch}/after.json`));
  assert.equal(approval.diffFileDigest, sha(`${base}diffs/${batch}.json`));
  assert.deepEqual(new Set(approval.productIds), new Set(selected.values()));
  for (const item of manifest.items) {
    assert.equal(item.state, 'canonicalized');
    assert.ok(bodies.has(item.productId));
    assert.equal(item.sourceIds.length, 2);
    const staging = json(`${base}staging/${batch}/${item.itemKey}.json`);
    assert.equal(item.stagingDigest, digestValue(staging));
    assert.equal(staging.sources.length, 2);
    assert.ok(staging.claims.every((claim) => claim.verification === 'verified'));
    for (const [index, sourceId] of item.sourceIds.entries()) {
      const raw = json(`${base}raw/${sourceId}.json`);
      assert.equal(raw.sourceId, sourceId);
      assert.equal(item.rawDigests[index], digestValue(raw));
      assert.match(raw.accessedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      assert.equal(new Date(raw.accessedAt).toISOString(), raw.accessedAt);
    }
  }
  const fixed = bodies.get('canon-g7-x-iii');
  assert.equal(fixed.kind, 'fixed');
  assert.equal(fixed.mount, null);
  assert.deepEqual(fixed.specs.fixedLens.focal, { max: 36.8, min: 8.8 });
  assert.deepEqual(fixed.specs.fixedLens.equivalentFocal, { max: 100, min: 24 });
  assert.equal(fixed.specs.weight, null);
  assert.ok(!canonical.lenses.some((lens) => lens.id.startsWith('canon-g7-x-iii')));
  const c80 = bodies.get('canon-c80');
  assert.equal(c80.kind, 'interchangeable');
  assert.equal(c80.mount, 'Canon RF');
  assert.equal(c80.specs.weight, null);
  assert.equal(c80.specs.bodyOnlyWeight, 1300);
  assert.equal(c80.specs.dimensions, null);
  assert.equal(c80.specs.sensor.megapixels, null);
  assert.equal(c80.specs.cardSlots.slots[0].standards, null);
  assert.equal(bodies.get('canon-5d-iv').mount, 'Canon EF');
  assert.equal(bodies.get('canon-r3').specs.burst.maxMechanicalFps, 12);
  assert.equal(bodies.get('canon-r3').specs.burst.maxElectronicFps, 30);
  assert.equal(bodies.get('canon-r6-v').specs.burst.maxElectronicFps, 40);
});
