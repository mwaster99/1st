import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { proposedCanonical, validateCanonical, verifyIncoming } from '../scripts/objective/merge.mjs';
import { digestValue, formatCanonicalDiff, validateStagingBatch } from '../scripts/objective/rules.mjs';
import { BODY_BY_ID, CAMERA_LENSES, getIntegratedLens } from '../src/cameraData.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(path.join(root, p));
const json = (p) => JSON.parse(read(p));
const sha = (p) => createHash('sha256').update(read(p)).digest('hex');
const base = 'src/data/ingestion/', batch = 'production-fujifilm-bodies-002';
const transaction = `${base}transactions/${batch}/`;
const manifest = () => json(`${base}batches/${batch}.json`);
const stages = () => manifest().items.map((item) => json(`${base}staging/${batch}/${item.itemKey}.json`));
const raws = () => new Map(manifest().items.flatMap((item) => item.sourceIds).map((id) => [id, json(`${base}raw/${id}.json`)]));
// No archive replay options: this new production must use current strict rules.
const context = () => ({ canonical: json(`${transaction}before.json`), vocab: json(`${base}vocab.json`), rawDocuments: raws() });
const selected = ['fujifilm-gfx-eterna-55', 'fujifilm-gfx100rf', 'fujifilm-x-e5', 'fujifilm-x-half'];
const stage = (id) => stages().find((s) => s.product.id === id);
const claim = (id, p) => stage(id).claims.find((c) => c.path === p);
const after = () => json(`${transaction}after.json`);
const body = (id) => after().bodies.find((p) => p.id === id);

test('Fujifilm batch 002 adds exactly four bodies through an approved atomic chain and preserves all previous products', () => {
  const m = manifest(), evidence = json(`${transaction}evidence.json`), approval = json(`${base}approvals/${batch}.json`);
  const before = json(`${transaction}before.json`), result = after(), journal = json(`${transaction}journal.json`);
  assert.equal(before.bodies.length, 107);
  assert.equal(result.bodies.length, 111);
  assert.equal(result.lenses.length, 36);
  assert.deepEqual(result.lenses, before.lenses);
  for (const previous of before.bodies) assert.deepEqual(result.bodies.find((p) => p.id === previous.id), previous);
  assert.equal(m.canonicalBaselineDigest, json(`${base}batches/production-fujifilm-bodies-001.json`).expectedCanonicalDigest);
  assert.equal(m.canonicalBaselineDigest, sha(`${transaction}before.json`));
  assert.equal(m.expectedCanonicalDigest, sha(`${transaction}after.json`));
  assert.deepEqual(approval.productIds, selected);
  assert.equal(approval.approvedBy.method, 'cli-explicit');
  assert.ok(approval.productOperations.every((operation) => operation.operation === 'new-product'));
  assert.equal(approval.diffDigest, digestValue(evidence.bundle.diff));
  assert.equal(approval.diffFileDigest, sha(`${base}diffs/${batch}.json`));
  assert.equal(approval.incomingDigest, digestValue(evidence.bundle.artifactDigests));
  assert.equal(journal.evidenceDigest, digestValue(evidence));
  assert.equal(journal.phase, 'canonicalized');
  assert.deepEqual(evidence.approval, approval);
  verifyIncoming(evidence.bundle, before); // strict normalization/validation, including explicit mm
  const replay = proposedCanonical(before, evidence.bundle, approval.decisions, approval.productOperations);
  assert.deepEqual(replay.canonical, result);
  assert.equal(replay.digest, m.expectedCanonicalDigest);
  assert.equal(validateCanonical(result, evidence.bundle.vocab), true);
});

test('Fujifilm batch 002 preserves 85 verified claims, identity-only sources, raw digests and real UTC timestamps', () => {
  const sources = raws(), staged = stages(), diff = json(`${base}diffs/${batch}.json`);
  assert.equal(sources.size, 9);
  assert.equal(new Set([...sources.values()].map((r) => r.url)).size, 6);
  assert.equal(staged.reduce((n, s) => n + s.claims.length, 0), 85);
  assert.equal(validateStagingBatch(staged, context()).valid, true);
  for (const item of manifest().items) {
    const s = stage(item.productId), count = item.productId === selected[0] ? 3 : 2;
    assert.equal(item.state, 'canonicalized');
    assert.equal(item.sourceIds.length, count);
    assert.equal(item.stagingDigest, digestValue(s));
    assert.equal(body(item.productId).sources.length, count);
    assert.ok(s.claims.every((c) => c.verification === 'verified'));
    for (const [index, id] of item.sourceIds.entries()) {
      const r = sources.get(id);
      assert.equal(item.rawDigests[index], digestValue(r));
      assert.equal(r.contentDigest, digestValue(r.evidenceExcerpt));
      assert.match(r.accessedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      assert.equal(new Date(r.accessedAt).toISOString(), r.accessedAt);
      assert.ok(['fujifilm-korea.co.kr', 'www.fujifilm.com'].includes(new URL(r.url).hostname));
    }
    const identitySource = sources.get(s.identityEvidence.sourceId);
    assert.equal(identitySource.items[0].observations.length, 0);
    assert.ok(!s.claims.some((c) => c.sourceId === identitySource.sourceId));
    const d = diff.items.find((d) => d.productId === item.productId);
    assert.match(formatCanonicalDiff(d), new RegExp(`fields / ${count} sources`));
    assert.ok(d.changes.every((c) => c.category === 'new-product'));
  }
});

test('GFX100RF and X half keep actual/equivalent primes separate in mm and never create extra lens mass or assets', () => {
  for (const [id, focal, equivalent, aperture, weight] of [
    [selected[1], 35, 28, 4, 735], [selected[3], 10.8, 32, 2.8, 240],
  ]) {
    const p = body(id), optical = p.specs.fixedLens;
    assert.equal(p.kind, 'fixed'); assert.equal(p.mount, null);
    assert.deepEqual(optical.focal, { min: focal, max: focal });
    assert.deepEqual(optical.equivalentFocal, { min: equivalent, max: equivalent });
    assert.deepEqual(optical.aperture, { wide: aperture, tele: aperture });
    assert.equal(p.specs.weight, weight);
    for (const range of ['focal', 'equivalentFocal']) for (const end of ['min', 'max']) {
      const c = claim(id, `specs.fixedLens.${range}.${end}`);
      assert.equal(c.unit, 'mm'); assert.equal(c.rawUnit, 'mm');
      assert.equal(c.value, range === 'focal' ? focal : equivalent);
      assert.equal(c.conditions.lensType, 'prime');
    }
    const integrated = getIntegratedLens(BODY_BY_ID[id]);
    assert.equal(integrated.includedInBodyId, id);
    assert.equal(integrated.weight, null);
    assert.equal(integrated.newPrice, null);
    assert.equal(integrated.usedPrice, null);
    assert.ok(!after().lenses.some((l) => l.id.startsWith(id)));
    assert.ok(!CAMERA_LENSES.some((l) => l.id === integrated.id));
  }
});

test('New fixed-lens production claims reject missing/unsupported units with strict validation before approval', () => {
  for (const id of [selected[1], selected[3]]) {
    const original = stage(id);
    assert.equal(validateStagingBatch([original], context()).valid, true);
    for (const range of ['focal', 'equivalentFocal']) for (const end of ['min', 'max']) {
      const field = `specs.fixedLens.${range}.${end}`;
      for (const [key, value, code] of [['unit', null, 'UNIT_REQUIRED'], ['rawUnit', null, 'UNIT_REQUIRED'], ['rawUnit', 'ft', 'UNSUPPORTED_UNIT']]) {
        const changed = structuredClone(original);
        changed.claims.find((c) => c.path === field)[key] = value;
        const r = validateStagingBatch([changed], context());
        assert.equal(r.valid, false);
        assert.ok(r.items[0].errors.some((e) => e.path === field && e.code === code));
      }
    }
  }
  for (const value of [true, false, { present: 'yes' }]) {
    const changed = stage(selected[2]); changed.claims.find((c) => c.path === 'specs.ibis').value = value;
    assert.ok(validateStagingBatch([changed], context()).items[0].errors.some((e) => e.code === 'INVALID_IBIS'));
  }
  for (const [value, code] of [[null, 'WEIGHT_BASIS_REQUIRED'], ['operational', 'INVALID_WEIGHT_BASIS'], ['battery', 'WEIGHT_BASIS_MISMATCH']]) {
    const changed = stage(selected[1]); changed.claims.find((c) => c.path === 'specs.weight').conditions.weightBasis = value;
    assert.ok(validateStagingBatch([changed], context()).items[0].errors.some((e) => e.code === code));
  }
});

test('Cinema, IBIS and half-frame video conditions remain separate from representative numbers and UNKNOWNs', () => {
  const cinema = body(selected[0]);
  assert.equal(cinema.kind, 'interchangeable'); assert.equal(cinema.mount, 'Fujifilm G'); assert.equal(cinema.bodyStyle, 'compact');
  assert.equal(cinema.specs.bodyOnlyWeight, 2000);
  assert.equal(claim(selected[0], 'specs.bodyOnlyWeight').rawUnit, 'kg');
  assert.equal(claim(selected[0], 'specs.bodyOnlyWeight').conditions.weightBasis, 'body-only');
  assert.equal(cinema.specs.weight, null); assert.equal(cinema.specs.weightBasis, null);
  assert.equal(cinema.specs.video.max, '8K 29.97p'); assert.equal(cinema.specs.video.bitDepth, null);
  assert.equal(cinema.specs.video.cropAtMax, null); assert.equal(cinema.specs.video.log, true);
  assert.equal(claim(selected[0], 'specs.video.max').conditions.externalOutputSeparate.rawBitDepth, 12);
  assert.equal(claim(selected[0], 'specs.video.max').conditions.highFrameRateSeparate.maxFps, 48);
  assert.equal(cinema.specs.cardSlots.count, 2);
  assert.deepEqual(cinema.specs.cardSlots.slots.map((s) => s.media), [['CFexpress Type B'], ['SD']]);
  assert.equal(cinema.specs.lcd.sizeInches, 3); // built-in, not the bundled external 5-inch monitor
  const xe = body(selected[2]), ibis = claim(selected[2], 'specs.ibis');
  assert.equal(xe.mount, 'Fujifilm X'); assert.deepEqual(xe.specs.sensor.sizeMm, [23.5, 15.7]);
  assert.equal(xe.specs.ibis.stops, 7); assert.equal(ibis.conditions.peripheryStops, 6); assert.equal(ibis.conditions.standard, 'CIPA2024');
  assert.equal(claim(selected[2], 'specs.burst.maxElectronicFps').conditions.cropFactor, 1.29);
  assert.equal(claim(selected[2], 'specs.burst.maxMechanicalFps').conditions.cropFactor, undefined);
  assert.deepEqual(claim(selected[2], 'specs.video.max').conditions.resolution, [6240, 3510]);
  assert.deepEqual(claim(selected[2], 'specs.video.max').conditions.externalRawSeparate.resolution, [6240, 3512]);
  assert.equal(xe.specs.video.cropAtMax, true);
  const half = body(selected[3]), video = claim(selected[3], 'specs.video.max').conditions;
  assert.equal(half.specs.sensor.megapixels, 17.74);
  assert.deepEqual(half.specs.sensor.sizeMm, [13.3, 8.8]);
  assert.equal(half.specs.video.max, 'FHD 24p'); assert.equal(half.specs.video.bitDepth, 8);
  assert.deepEqual(video.resolution, [1080, 1440]); assert.equal(video.aspectRatio, '3:4');
  assert.deepEqual(video.highSpeedSeparate.captureFps, [48, 36, 28]);
  assert.equal(half.specs.ibis, null); assert.equal(half.specs.evf, null);
  for (const id of selected) {
    assert.equal(body(id).price.new.value, null); assert.equal(body(id).price.used.typical, null);
    assert.ok(!stage(id).claims.some((c) => /price|film|simulation|experience/i.test(c.path)));
  }
});

test('Fujifilm current new-model coverage reaches zero while five legacy models and special variants remain distinct', () => {
  const inventory = json(`${base}fujifilm-current-camera-gallery-2026-10-02.json`);
  const ordinary = inventory.cards.filter((c) => c.scopeStatus === 'in-scope' && c.availabilityStatus === 'released-current');
  assert.equal(new Set(ordinary.map((c) => c.identityGroup)).size, 14);
  assert.ok(ordinary.every((c) => c.canonicalId && json('src/data/cameraProducts.json').bodies.some((p) => p.id === c.canonicalId)));
  assert.equal(inventory.batch001Completion.remainingIdentitiesWithoutCanonical, 4); // historical checkpoint retained
  assert.equal(inventory.batch002Completion.remainingIdentitiesWithoutCanonical, 0);
  assert.equal(inventory.batch002Completion.existingLegacyIdentities, 5);
  assert.equal(ordinary.filter((c) => c.canonicalExistedAtStart && c.variantKey === null).length, 5);
  const variant = ordinary.find((c) => c.name === 'GFX100RF FRAGMENT EDITION');
  assert.equal(variant.canonicalId, selected[1]); assert.ok(variant.variantKey); assert.equal(variant.productionBatch, null);
  assert.equal(variant.coverageViaBaseBatch, batch); // its variant-specific features were not ingested
  assert.ok(!after().bodies.some((p) => /fragment|limited|gfx100-ii-ir/.test(p.id)));
  assert.equal(inventory.cards.find((c) => c.modelCode === 'GFX100 II IR').scopeStatus, 'deferred-special-category');
  assert.equal(inventory.adjacentSpecialCategory.scopeStatus, 'deferred-special-category');
});
