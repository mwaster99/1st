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
const batch = 'production-canon-bodies-005';
const selected = new Map([['EOS C300 MK III', 'canon-c300-iii'], ['EOS C500 MK2', 'canon-c500-ii']]);

test('Canon batch 005 completes released-current direct-operated camera coverage', () => {
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
  assert.equal(upcoming.officialReleaseMonth, '2026-10');
  assert.ok(canonical.bodies.length >= 86);
  assert.ok(canonical.lenses.length >= 36);
  assert.equal(validateCanonical(canonical, json(`${base}vocab.json`)), true);
});

test('Canon batch 005 retains three official sources per product and an intact approval/transaction chain', () => {
  const manifest = json(`${base}batches/${batch}.json`);
  const approval = json(`${base}approvals/${batch}.json`);
  const journal = json(`${base}transactions/${batch}/journal.json`);
  const diff = json(`${base}diffs/${batch}.json`);
  const canonical = json('src/data/cameraProducts.json');
  const bodies = new Map(canonical.bodies.map((body) => [body.id, body]));
  assert.equal(manifest.items.length, 2);
  assert.equal(manifest.apply.state, 'canonicalized');
  assert.equal(journal.phase, 'canonicalized');
  assert.equal(manifest.canonicalBaselineDigest, sha(`${base}transactions/${batch}/before.json`));
  assert.equal(manifest.expectedCanonicalDigest, sha(`${base}transactions/${batch}/after.json`));
  assert.equal(approval.diffFileDigest, sha(`${base}diffs/${batch}.json`));
  assert.deepEqual(new Set(approval.productIds), new Set(selected.values()));
  assert.ok(diff.items.every((item) => item.operation === 'new-product' && item.changes.every((change) => change.category === 'new-product')));
  for (const item of manifest.items) {
    assert.equal(item.state, 'canonicalized');
    assert.equal(item.sourceIds.length, 3);
    const staging = json(`${base}staging/${batch}/${item.itemKey}.json`);
    assert.equal(item.stagingDigest, digestValue(staging));
    assert.equal(staging.sources.length, 3);
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

test('Cinema EOS claims distinguish default EF body, normal internal RAW, media slots and unknown configured mass', () => {
  const canonical = json('src/data/cameraProducts.json');
  for (const [id, sensor, video] of [
    ['canon-c300-iii', 'Super 35mm', '4K DCI Cinema RAW Light 59.94p'],
    ['canon-c500-ii', 'Full-frame', '5.9K Cinema RAW Light 59.94p'],
  ]) {
    const body = canonical.bodies.find((entry) => entry.id === id);
    assert.equal(body.kind, 'interchangeable');
    assert.equal(body.mount, 'Canon EF');
    assert.equal(body.specs.sensor.format, sensor);
    assert.equal(body.specs.sensor.megapixels, null);
    assert.equal(body.specs.video.max, video);
    assert.equal(body.specs.video.bitDepth, null);
    assert.equal(body.specs.weight, null);
    assert.equal(body.specs.bodyOnlyWeight, 1750);
    assert.equal(body.specs.cardSlots.count, 3);
    assert.deepEqual(body.specs.cardSlots.slots.map((slot) => slot.media[0]), ['CFexpress', 'CFexpress', 'SD']);
    const itemKey = id === 'canon-c300-iii' ? 'canon-eos-c300-mark-iii' : 'canon-eos-c500-mark-ii';
    const staging = json(`${base}staging/${batch}/${itemKey}.json`);
    const videoClaim = staging.claims.find((claim) => claim.path === 'specs.video.max');
    assert.equal(videoClaim.conditions.recording, 'normal');
    assert.equal(videoClaim.conditions.recordingLocation, 'internal');
    assert.equal(videoClaim.conditions.frameRate, '59.94p');
    assert.equal(staging.claims.find((claim) => claim.path === 'specs.bodyOnlyWeight').conditions.weightBasis, 'body-only');
    if (id === 'canon-c500-ii') assert.deepEqual(videoClaim.conditions.rawGrades, ['ST', 'LT']);
  }
});

test('batch 005 body-only weight claims pass validation and invalid basis is rejected', () => {
  const manifest = json(`${base}batches/${batch}.json`);
  const stagings = manifest.items.map((item) => json(`${base}staging/${batch}/${item.itemKey}.json`));
  const rawDocuments = new Map(manifest.items.flatMap((item) => item.sourceIds)
    .map((sourceId) => [sourceId, json(`${base}raw/${sourceId}.json`)]));
  const context = { canonical: json(`${base}transactions/${batch}/before.json`), vocab: json(`${base}vocab.json`), rawDocuments };
  assert.equal(validateStagingBatch(stagings, context).valid, true);
  const altered = structuredClone(stagings);
  altered[0].claims.find((claim) => claim.path === 'specs.bodyOnlyWeight').conditions.weightBasis = 'operational';
  const result = validateStagingBatch(altered, context);
  assert.equal(result.valid, false);
  assert.ok(result.items.flatMap((item) => item.errors).some((error) => error.code === 'INVALID_WEIGHT_BASIS'));
});
