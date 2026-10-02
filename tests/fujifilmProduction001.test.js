import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { proposedCanonical, validateCanonical, verifyIncoming } from '../scripts/objective/merge.mjs';
import { digestValue, formatCanonicalDiff, validateStagingBatch } from '../scripts/objective/rules.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => readFileSync(path.join(root, name));
const json = (name) => JSON.parse(read(name));
const sha = (name) => createHash('sha256').update(read(name)).digest('hex');
const base = 'src/data/ingestion/';
const batch = 'production-fujifilm-bodies-001';
const transaction = `${base}transactions/${batch}/`;
const manifest = () => json(`${base}batches/${batch}.json`);
const stagings = () => manifest().items.map((item) => json(`${base}staging/${batch}/${item.itemKey}.json`));
const selected = ['fujifilm-gfx100-ii', 'fujifilm-gfx100s-ii', 'fujifilm-x-h2s', 'fujifilm-x-h2', 'fujifilm-x-t30-iii'];
const rawDocuments = () => new Map(manifest().items.flatMap((item) => item.sourceIds)
  .map((id) => [id, json(`${base}raw/${id}.json`)]));
const context = () => ({ canonical: json(`${transaction}before.json`), vocab: json(`${base}vocab.json`), rawDocuments: rawDocuments() });

test('Fujifilm inventory preserves every official card, edition variants, release and scope boundaries', () => {
  const snapshot = json(`${base}fujifilm-current-camera-gallery-2026-10-02.json`);
  const cards = snapshot.cards;
  assert.equal(cards.length, 17);
  assert.equal(new Set(cards.map((card) => card.cardKey)).size, 17);
  assert.equal(new Set(cards.map((card) => card.productUrl)).size, 17);
  assert.equal(new Set(cards.map((card) => card.identityGroup)).size, 15);
  assert.equal(cards.filter((card) => card.category === 'GFX').length, 6);
  assert.equal(cards.filter((card) => card.category === 'X').length, 11);
  const ordinary = cards.filter((card) => card.scopeStatus === 'in-scope');
  assert.equal(ordinary.length, 16);
  assert.equal(new Set(ordinary.map((card) => card.identityGroup)).size, 14);
  assert.ok(ordinary.every((card) => card.availabilityStatus === 'released-current'));
  assert.equal(snapshot.initialCounts.existingCanonicalIdentities, 5);
  assert.equal(snapshot.initialCounts.unprocessedIdentitiesWithoutCanonical, 9);
  assert.equal(snapshot.initialCounts.productionCanonicalizedIdentities, 0);
  assert.equal(snapshot.initialCounts.announcedUpcoming, 0);
  assert.equal(cards.find((card) => card.name === 'GFX ETERNA 55').scopeStatus, 'in-scope');
  const ir = cards.find((card) => card.name === 'GFX100 II IR');
  assert.equal(ir.scopeStatus, 'deferred-special-category');
  assert.notEqual(ir.identityGroup, cards.find((card) => card.name === 'GFX100 II').identityGroup);
  assert.ok(json(`${base}catalog-scope.json`).entries.some((entry) => entry.brand === 'Fujifilm' && entry.model === ir.name));
  for (const [variant, main] of [['GFX100RF FRAGMENT EDITION', 'GFX100RF'], ['X100VI Limited Edition', 'X100VI']]) {
    const v = cards.find((card) => card.name === variant), m = cards.find((card) => card.name === main);
    assert.equal(v.identityGroup, m.identityGroup);
    assert.ok(v.variantKey && v.identityNote);
    assert.notEqual(v.productUrl, m.productUrl);
  }
  assert.equal(snapshot.adjacentSpecialCategory.models.length, 10);
  assert.equal(snapshot.adjacentSpecialCategory.scopeStatus, 'deferred-special-category');
  assert.ok(snapshot.adjacentSpecialCategory.models.includes('인스탁스 팔'));
  for (const id of selected) {
    const card = cards.find((card) => card.proposedCanonicalId === id);
    assert.equal(card.canonicalExistedAtStart, false);
    assert.equal(card.status, 'canonicalized');
    assert.equal(card.productionBatch, batch);
    assert.equal(card.canonicalId, id);
  }
});

test('Fujifilm atomic promotion preserves the Nikon baseline, old products and every lens', () => {
  const m = manifest(), approval = json(`${base}approvals/${batch}.json`);
  const journal = json(`${transaction}journal.json`), evidence = json(`${transaction}evidence.json`);
  const before = json(`${transaction}before.json`), after = json(`${transaction}after.json`);
  assert.equal(m.canonicalBaselineDigest, json(`${base}batches/production-nikon-bodies-004.json`).expectedCanonicalDigest);
  assert.equal(m.canonicalBaselineDigest, sha(`${transaction}before.json`));
  assert.equal(m.expectedCanonicalDigest, sha(`${transaction}after.json`));
  assert.equal(before.bodies.length, 102);
  assert.equal(after.bodies.length, 107);
  assert.equal(after.lenses.length, 36);
  assert.deepEqual(after.lenses, before.lenses);
  for (const old of before.bodies) assert.deepEqual(after.bodies.find((body) => body.id === old.id), old);
  assert.equal(m.apply.state, 'canonicalized');
  assert.equal(journal.phase, 'canonicalized');
  assert.equal(journal.evidenceDigest, digestValue(evidence));
  assert.deepEqual(evidence.approval, approval);
  assert.equal(approval.diffDigest, digestValue(evidence.bundle.diff));
  assert.equal(approval.diffFileDigest, sha(`${base}diffs/${batch}.json`));
  assert.equal(approval.incomingDigest, digestValue(evidence.bundle.artifactDigests));
  assert.deepEqual(approval.incomingArtifactDigests, evidence.bundle.artifactDigests);
  assert.deepEqual(new Set(approval.productIds), new Set(selected));
  assert.equal(approval.approvedBy.method, 'cli-explicit');
  verifyIncoming(evidence.bundle, before);
  const proposed = proposedCanonical(before, evidence.bundle, approval.decisions, approval.productOperations);
  assert.equal(proposed.digest, m.expectedCanonicalDigest);
  assert.deepEqual(proposed.canonical, after);
  assert.equal(validateCanonical(after, evidence.bundle.vocab), true);
  assert.equal(validateCanonical(json('src/data/cameraProducts.json'), json(`${base}vocab.json`)), true);
});

test('Fujifilm verified field provenance includes identity-only sources and real helper timestamps', () => {
  const diff = json(`${base}diffs/${batch}.json`), raws = rawDocuments();
  const canonical = json('src/data/cameraProducts.json');
  assert.equal(raws.size, 10);
  assert.equal(stagings().reduce((n, staging) => n + staging.claims.length, 0), 112);
  assert.equal(validateStagingBatch(stagings(), context()).valid, true);
  for (const item of manifest().items) {
    assert.equal(item.state, 'canonicalized');
    assert.equal(item.sourceIds.length, 2);
    const staging = json(`${base}staging/${batch}/${item.itemKey}.json`);
    assert.equal(item.stagingDigest, digestValue(staging));
    const product = canonical.bodies.find((body) => body.id === item.productId);
    const archivedProduct = json(`${transaction}after.json`).bodies.find((body) => body.id === item.productId);
    assert.equal(archivedProduct.sources.length, 2);
    assert.ok(product.sources.length >= 2); // Later batches may add evidence to this identity.
    assert.ok(staging.claims.every((claim) => claim.verification === 'verified'));
    assert.ok(item.sourceIds.every((id) => product.sources.some((source) => source.sourceId === id)));
    for (const [index, id] of item.sourceIds.entries()) {
      const raw = raws.get(id);
      assert.equal(item.rawDigests[index], digestValue(raw));
      assert.equal(raw.contentDigest, digestValue(raw.evidenceExcerpt));
      assert.match(raw.accessedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      assert.equal(new Date(raw.accessedAt).toISOString(), raw.accessedAt);
      assert.equal(new URL(raw.url).hostname, 'fujifilm-korea.co.kr');
    }
    const itemDiff = diff.items.find((entry) => entry.productId === item.productId);
    assert.match(formatCanonicalDiff(itemDiff), /fields \/ 2 sources/);
    assert.ok(itemDiff.changes.every((change) => change.category === 'new-product'));
    const identitySource = raws.get(staging.identityEvidence.sourceId);
    assert.equal(identitySource.items[0].observations.length, 0);
    assert.ok(!staging.claims.some((claim) => claim.sourceId === identitySource.sourceId));
  }
});

test('GFX/X measurements, conditional modes and withheld ambiguous values stay distinct', () => {
  const bodies = json(`${transaction}after.json`).bodies;
  const body = (id) => bodies.find((entry) => entry.id === id);
  const staging = (id) => stagings().find((entry) => entry.product.id === id);
  const claim = (id, field) => staging(id).claims.find((entry) => entry.path === field);
  for (const id of selected.slice(0, 2)) {
    assert.equal(body(id).mount, 'Fujifilm G');
    assert.deepEqual(body(id).specs.sensor.sizeMm, [43.8, 32.9]);
    assert.equal(body(id).specs.sensor.megapixels, 102);
    assert.equal(claim(id, 'specs.burst.maxElectronicFps').conditions.sensorMode, '35mm format mode ON');
    assert.equal(claim(id, 'specs.ibis').conditions.lens, 'GF63mmF2.8 R WR');
  }
  for (const id of selected.slice(2)) {
    assert.equal(body(id).mount, 'Fujifilm X');
    assert.deepEqual(body(id).specs.sensor.sizeMm, [23.5, 15.6]);
  }
  const gfx = selected[0], gfxS = selected[1], hs = selected[2], hr = selected[3], t30 = selected[4];
  assert.equal(body(gfx).specs.weight, 1030);
  assert.equal(body(gfx).specs.bodyOnlyWeight, 949);
  assert.deepEqual(claim(gfx, 'specs.weight').conditions.includes, ['supplied EVF-GFX3']);
  assert.equal(body(gfx).specs.dimensions, null);
  assert.equal(claim(gfx, 'specs.video.max').conditions.cropFactor, 1.51);
  assert.equal(body(gfx).specs.video.cropAtMax, true);
  assert.equal(body(gfxS).specs.video.max, '4K UHD 29.97p');
  assert.equal(claim(gfxS, 'specs.video.max').conditions.proResMediaRestriction, 'SSD only');
  assert.equal(body(hs).specs.sensor.megapixels, 26.16);
  assert.equal(body(hs).specs.burst.maxElectronicFps, 40);
  assert.equal(claim(hs, 'specs.video.max').conditions.aspectRatio, '3:2');
  assert.equal(body(hr).specs.sensor.megapixels, 40.2);
  assert.equal(body(hr).specs.releaseDate, null);
  assert.equal(claim(hr, 'specs.burst.maxElectronicFps').conditions.cropFactor, 1.29);
  assert.equal(claim(t30, 'specs.burst.maxElectronicFps').conditions.cropFactor, 1.25);
  assert.equal(body(t30).specs.ibis, null);
  assert.ok(!staging(t30).claims.some((entry) => entry.path === 'specs.ibis'));
  for (const id of selected) {
    assert.equal(body(id).kind, 'interchangeable');
    assert.equal(body(id).specs.fixedLens, null);
    assert.equal(body(id).specs.cardSlots, null);
    assert.equal(body(id).price.new.value, null);
    assert.equal(body(id).price.used.typical, null);
    assert.equal(claim(id, 'specs.video.max').conditions.recordingMode, 'normal internal recording');
    assert.equal(claim(id, 'specs.video.bitDepth').value, 10);
    assert.ok(!staging(id).claims.some((entry) => /price|simulation|pixelShift/i.test(entry.path)));
  }
});

test('Actual Fujifilm production claims reject invalid IBIS and weight basis before approval', () => {
  const original = stagings()[0];
  assert.equal(validateStagingBatch([original], context()).valid, true);
  for (const value of [true, false, { present: 'yes' }, { present: true, axes: -1 }]) {
    const changed = structuredClone(original);
    changed.claims.find((entry) => entry.path === 'specs.ibis').value = value;
    const result = validateStagingBatch([changed], context());
    assert.equal(result.valid, false);
    assert.ok(result.items[0].errors.some((error) => error.code === 'INVALID_IBIS'));
  }
  for (const [basis, code] of [[undefined, 'WEIGHT_BASIS_REQUIRED'], ['operational', 'INVALID_WEIGHT_BASIS'], ['battery', 'WEIGHT_BASIS_MISMATCH']]) {
    const changed = structuredClone(original), weight = changed.claims.find((entry) => entry.path === 'specs.weight');
    if (basis === undefined) delete weight.conditions.weightBasis;
    else weight.conditions.weightBasis = basis;
    const result = validateStagingBatch([changed], context());
    assert.equal(result.valid, false);
    assert.ok(result.items[0].errors.some((error) => error.code === code));
  }
  for (const entry of stagings()) {
    assert.equal(entry.claims.find((claim) => claim.path === 'specs.weight').conditions.weightBasis, 'battery-and-card');
    assert.equal(entry.claims.find((claim) => claim.path === 'specs.bodyOnlyWeight').conditions.weightBasis, 'body-only');
  }
});
