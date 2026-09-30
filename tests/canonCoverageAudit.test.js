import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getIntegratedLens, BODY_BY_ID } from '../src/cameraData.js';
import { validateCanonical } from '../scripts/objective/merge.mjs';
import { digestValue } from '../scripts/objective/rules.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = 'src/data/ingestion/';
const read = (name) => readFileSync(path.join(root, name));
const json = (name) => JSON.parse(read(name));
const sha = (name) => createHash('sha256').update(read(name)).digest('hex');

test('Canon official direct-operated cards have one released canonical or one upcoming outcome', () => {
  const snapshot = json(`${base}canon-current-camera-gallery-2026-09-29.json`);
  const identity = json(`${base}identity-map.json`).entries.filter((entry) => entry.manufacturer === 'Canon' && entry.productType === 'body');
  const canonical = json('src/data/cameraProducts.json');
  const byId = new Map(canonical.bodies.map((body) => [body.id, body]));
  const byCode = new Map(identity.map((entry) => [entry.manufacturerModelCode, entry]));
  const cards = snapshot.cards;
  assert.equal(cards.length, 29);
  assert.deepEqual(Object.fromEntries(['mirrorless', 'dslr', 'compact', 'cinema-eos'].map((category) => [category, cards.filter((card) => card.category === category).length])),
    { mirrorless: 15, dslr: 2, compact: 5, 'cinema-eos': 7 });
  assert.equal(new Set(cards.map((card) => card.modelCode)).size, cards.length);
  assert.equal(new Set(cards.map((card) => card.productUrl)).size, cards.length);
  assert.equal(new Set(identity.map((entry) => entry.manufacturerModelCode)).size, identity.length);
  assert.equal(new Set(identity.map((entry) => entry.productId)).size, identity.length);
  const releasedIds = [];
  for (const card of cards) {
    assert.match(card.officialReleaseMonth, /^\d{4}-\d{2}$/);
    if (card.availabilityStatus === 'announced-upcoming') {
      assert.equal(card.modelCode, 'EOS R8 Mark II');
      assert.equal(card.officialReleaseMonth, '2026-10');
      assert.ok(card.officialReleaseMonth > '2026-09');
      assert.equal(card.status, 'unprocessed');
      assert.equal(card.canonicalId, undefined);
      assert.ok(!canonical.bodies.some((body) => body.brand === 'Canon' && body.model === card.modelCode));
      assert.ok(!byCode.has(card.modelCode));
      continue;
    }
    assert.equal(card.availabilityStatus, 'released-current', card.modelCode);
    assert.ok(card.officialReleaseMonth <= '2026-09', card.modelCode);
    assert.equal(card.status, 'canonicalized', card.modelCode);
    const body = byId.get(card.canonicalId);
    assert.equal(body?.brand, 'Canon', card.modelCode);
    assert.equal(body.model, card.modelCode);
    assert.equal(body.kind, card.category === 'compact' ? 'fixed' : card.category === 'dslr' ? 'dslr' : 'interchangeable');
    assert.equal(body.mount, card.category === 'compact' ? null : card.category === 'dslr' || ['EOS C300 MK III', 'EOS C500 MK2'].includes(card.modelCode) ? 'Canon EF' : 'Canon RF');
    if (card.productionBatch) assert.equal(byCode.get(card.modelCode)?.productId, card.canonicalId);
    releasedIds.push(card.canonicalId);
  }
  assert.equal(releasedIds.length, 28);
  assert.equal(new Set(releasedIds).size, releasedIds.length);
  assert.equal(cards.filter((card) => card.availabilityStatus === 'released-current' && card.status !== 'canonicalized').length, 0);
  assert.equal(snapshot.adjacentSpecialCategory.scopeStatus, 'deferred-special-category');
  assert.equal(snapshot.adjacentSpecialCategory.officialCardCount, 17);
  assert.ok(snapshot.adjacentSpecialCategory.galleryUrl.startsWith('https://kr.canon/'));
  assert.ok(!cards.some((card) => card.category === 'ptz'));
  assert.ok(!canonical.bodies.some((body) => body.brand === 'Canon' && /^(?:CR-|RC-)/.test(body.model)));
  assert.equal(validateCanonical(canonical, json(`${base}vocab.json`)), true);
});

test('Canon fixed-lens cards retain one integrated optical system and no interchangeable lens product', () => {
  const snapshot = json(`${base}canon-current-camera-gallery-2026-09-29.json`);
  const canonical = json('src/data/cameraProducts.json');
  const fixed = snapshot.cards.filter((card) => card.category === 'compact');
  assert.equal(fixed.length, 5);
  for (const card of fixed) {
    const body = canonical.bodies.find((entry) => entry.id === card.canonicalId);
    assert.equal(body.kind, 'fixed');
    assert.equal(body.mount, null);
    assert.ok(body.specs.fixedLens);
    assert.ok(!canonical.lenses.some((lens) => lens.id.startsWith(`${body.id}-`)));
    const integrated = getIntegratedLens(BODY_BY_ID[body.id]);
    assert.equal(integrated.includedInBodyId, body.id);
    assert.equal(integrated.weight, null);
    const focal = body.specs.fixedLens.focal;
    const equivalent = body.specs.fixedLens.equivalentFocal;
    if (focal && equivalent) assert.ok(focal.min < equivalent.min && focal.max < equivalent.max);
  }
  const v10 = canonical.bodies.find((body) => body.id === 'canon-powershot-v10');
  assert.equal(v10.specs.fixedLens.focal.min, v10.specs.fixedLens.focal.max);
  assert.equal(canonical.bodies.find((body) => body.id === 'canon-ixus-285-hs-a').specs.fixedLens.focal, undefined);
});

test('Canon batches 001–005 preserve approved raw, staged, diff and atomic transaction chains', () => {
  const snapshot = json(`${base}canon-current-camera-gallery-2026-09-29.json`);
  const canonical = json('src/data/cameraProducts.json');
  const covered = new Set(snapshot.cards.filter((card) => card.status === 'canonicalized').map((card) => card.canonicalId));
  const seen = new Set();
  let previousDigest = json(`${base}batches/production-sony-bodies-008.json`).expectedCanonicalDigest;
  for (let number = 1; number <= 5; number++) {
    const batchId = `production-canon-bodies-${String(number).padStart(3, '0')}`;
    const manifest = json(`${base}batches/${batchId}.json`);
    const diff = json(`${base}diffs/${batchId}.json`);
    const approval = json(`${base}approvals/${batchId}.json`);
    const transaction = `${base}transactions/${batchId}/`;
    const evidence = json(`${transaction}evidence.json`);
    const journal = json(`${transaction}journal.json`);
    assert.equal(manifest.lastSuccessfulGate, 'apply');
    assert.equal(manifest.apply.state, 'canonicalized');
    assert.equal(journal.phase, 'canonicalized');
    assert.equal(manifest.canonicalBaselineDigest, previousDigest);
    assert.equal(manifest.canonicalBaselineDigest, approval.baselineCanonicalDigest);
    assert.equal(manifest.canonicalBaselineDigest, journal.baselineCanonicalDigest);
    assert.equal(manifest.canonicalBaselineDigest, sha(`${transaction}before.json`));
    assert.equal(manifest.expectedCanonicalDigest, approval.expectedCanonicalDigest);
    assert.equal(manifest.expectedCanonicalDigest, journal.expectedCanonicalDigest);
    assert.equal(manifest.expectedCanonicalDigest, sha(`${transaction}after.json`));
    assert.equal(manifest.apply.approvalId, approval.approvalId);
    assert.equal(journal.approvalId, approval.approvalId);
    assert.equal(journal.evidenceDigest, digestValue(evidence));
    assert.deepEqual(evidence.approval, approval);
    assert.deepEqual(evidence.bundle.diff, diff);
    assert.deepEqual(evidence.bundle.artifactDigests, approval.incomingArtifactDigests);
    assert.equal(approval.diffDigest, digestValue(diff));
    assert.equal(approval.diffFileDigest, sha(`${base}diffs/${batchId}.json`));
    const archived = `${base}approvals/${batchId}/${approval.approvalId}.json`;
    assert.ok(existsSync(path.join(root, archived)));
    assert.deepEqual(json(archived), approval);
    assert.deepEqual(new Set(approval.productIds), new Set(manifest.items.map((item) => item.productId)));
    assert.deepEqual(new Set(diff.items.map((item) => item.productId)), new Set(approval.productIds));
    for (const item of manifest.items) {
      assert.equal(item.state, 'canonicalized');
      assert.ok(!seen.has(item.productId), item.productId);
      seen.add(item.productId);
      assert.ok(covered.has(item.productId), item.productId);
      const staged = json(`${base}staging/${batchId}/${item.itemKey}.json`);
      assert.equal(item.stagingDigest, digestValue(staged));
      assert.ok(evidence.bundle.stagings.some((entry) => digestValue(entry) === item.stagingDigest));
      assert.equal(item.sourceIds.length, item.rawDigests.length);
      assert.ok(item.sourceIds.length >= 2);
      for (const [index, sourceId] of item.sourceIds.entries()) {
        const raw = json(`${base}raw/${sourceId}.json`);
        assert.equal(raw.sourceId, sourceId);
        assert.equal(item.rawDigests[index], digestValue(raw));
        assert.deepEqual(evidence.bundle.raws[sourceId], raw);
      }
    }
    previousDigest = manifest.expectedCanonicalDigest;
  }
  assert.equal(seen.size, 22);
  assert.equal(previousDigest, sha('src/data/cameraProducts.json'));
});
