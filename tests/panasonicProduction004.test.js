import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { buildRawDocument } from '../scripts/objective/raw-helper.mjs';
import { readFileSync } from 'node:fs';
import { proposedCanonical, validateCanonical, verifyIncoming } from '../scripts/objective/merge.mjs';
import { combineStagingFragments, digestValue, formatCanonicalDiff, normalizeRawDocument, validateStagingBatch } from '../scripts/objective/rules.mjs';

const root = new URL('../', import.meta.url);
const base = 'src/data/ingestion/', batch = 'production-panasonic-bodies-004';
const archive = `${base}transactions/${batch}/`;
const bytes = path => readFileSync(new URL(path, root));
const json = path => JSON.parse(bytes(path));
const sha = path => createHash('sha256').update(bytes(path)).digest('hex');
const ids = ['panasonic-l10', 'panasonic-tz300', 'panasonic-lx100-ii', 'panasonic-lx10'];
const manifest = () => json(`${base}batches/${batch}.json`);
const stagings = () => manifest().items.map(i => json(`${base}staging/${batch}/${i.itemKey}.json`));
const staging = id => stagings().find(s => s.product.id === id);
const claims = (id, path) => staging(id).claims.filter(c => c.path === path);
const claim = (id, path) => claims(id, path)[0];
const body = id => json(`${archive}after.json`).bodies.find(b => b.id === id);
const raws = () => new Map(manifest().items.flatMap(i => i.sourceIds).map(id => [id, json(`${base}raw/${id}.json`)]));
const context = () => ({ canonical: json(`${archive}before.json`), vocab: json(`${archive}evidence.json`).bundle.vocab, rawDocuments: raws() });
const snapshot = () => json(`${base}panasonic-compact-current-gallery-2026-10-07.json`);

test('Four compact products replay a sealed atomic transaction without changing existing bodies, lenses or prices', () => {
  const m = manifest(), before = json(`${archive}before.json`), after = json(`${archive}after.json`);
  const evidence = json(`${archive}evidence.json`), approval = json(`${base}approvals/${batch}.json`), journal = json(`${archive}journal.json`);
  assert.deepEqual(m.items.map(i => i.productId), ids);
  assert.equal(before.bodies.length, 131); assert.equal(after.bodies.length, 135); assert.equal(after.lenses.length, 36);
  assert.deepEqual(after.lenses, before.lenses);
  for (const old of before.bodies) assert.deepEqual(body(old.id), old);
  assert.equal(journal.phase, 'canonicalized'); assert.equal(journal.evidenceDigest, digestValue(evidence));
  assert.deepEqual(evidence.approval, approval); assert.equal(approval.approvedBy.method, 'cli-explicit');
  assert.equal(approval.diffDigest, digestValue(evidence.bundle.diff)); assert.equal(approval.diffFileDigest, sha(`${base}diffs/${batch}.json`));
  assert.deepEqual(approval.incomingArtifactDigests, evidence.bundle.artifactDigests);
  assert.equal(m.canonicalBaselineDigest, sha(`${archive}before.json`)); assert.equal(m.expectedCanonicalDigest, sha(`${archive}after.json`));
  assert.equal(m.canonicalBaselineDigest, json(`${base}batches/production-panasonic-bodies-003.json`).expectedCanonicalDigest);
  assert.equal(approval.productOperations.filter(o => o.operation === 'new-product').length, 4);
  assert.ok(approval.decisions.every(d => d.category !== 'value-conflict'));
  verifyIncoming(evidence.bundle, before);
  const replay = proposedCanonical(before, evidence.bundle, approval.decisions, approval.productOperations);
  assert.deepEqual(replay.canonical, after); assert.equal(replay.digest, m.expectedCanonicalDigest);
  assert.equal(validateCanonical(after, evidence.bundle.vocab), true);
  assert.equal(validateCanonical(json('src/data/cameraProducts.json'), json(`${base}vocab.json`)), true);
  for (const id of ids) { assert.equal(body(id).price.new.value, null); assert.equal(body(id).price.used.typical, null); }
});

test('Compact gallery closes four exact current cards and keeps DC-L10 separate from historical DMC-L10', () => {
  const s = snapshot();
  assert.deepEqual(s.currentListingCounts, { cards: 5, baseIdentities: 5, previousProduction: 1, selected: 4, announcedUpcoming: 0 });
  assert.deepEqual(s.cards.map(c => c.cardKey), ['DCL10', 'DCTZ300', 'DCTZ99', 'DC10001', 'DMC10002']);
  assert.deepEqual(s.batchCheckpoint.selected, ids);
  assert.equal(s.cards.filter(c => c.batch004Status === 'canonicalized').length, 4);
  assert.deepEqual(s.batchCheckpoint.expectedRemaining, { panasonic: 11, lumixS: 0, lumixG: 0, compact: 0, camcorder: 11 });
  assert.equal(s.identityReview.dcL10.manufacturerModelCode, 'DC-L10'); assert.equal(s.identityReview.dcL10.kind, 'fixed');
  assert.equal(s.identityReview.dcL10.excludedHistoricalModelCode, 'DMC-L10');
  assert.deepEqual(body(ids[0]).aliases, ['DC-L10']);
  const mapping = json(`${archive}evidence.json`).bundle.identityMap.entries.find(e => e.productId === ids[0]);
  assert.equal(mapping.manufacturerModelCode, 'DC-L10'); assert.ok(!mapping.reviewedAliases.includes('DMC-L10'));
  assert.equal(s.cards.find(c => c.cardKey === 'DCTZ99').productionBatch, 'production-panasonic-bodies-001');
  assert.equal(json(`${base}panasonic-current-camera-gallery-2026-10-06.json`).cards.filter(c => c.status === 'canonicalized').length, 5);
  assert.equal(json(`${base}panasonic-lumix-g-current-gallery-2026-10-07.json`).batchCheckpoint.expectedRemaining.compact, 4);
});

test('All fixed lenses retain independent actual, equivalent and maximum-aperture values with one camera weight', () => {
  const expected = [[10.9, 34, 24, 75, 1.7, 2.8], [8.8, 132, 24, 360, 3.3, 6.4], [10.9, 34, 24, 75, 1.7, 2.8], [8.8, 26.4, 24, 72, 1.4, 2.8]];
  for (const [n, id] of ids.entries()) {
    const b = body(id), f = b.specs.fixedLens;
    assert.equal(b.kind, 'fixed'); assert.equal(b.mount, null); assert.equal(b.bodyStyle, 'compact');
    assert.deepEqual([f.focal.min, f.focal.max, f.equivalentFocal.min, f.equivalentFocal.max, f.aperture.wide, f.aperture.tele], expected[n]);
    assert.deepEqual(Object.keys(f).sort(), ['aperture', 'equivalentFocal', 'focal']);
    assert.equal(claim(id, 'specs.bodyOnlyWeight').conditions.weightBasis, 'body-only');
    assert.match(claim(id, 'specs.bodyOnlyWeight').conditions.configuration, /integral lens/);
    assert.equal(claim(id, 'specs.fixedLens.focal.min').conditions.opticalZoom, [3.1, 15, 3.1, 3][n]);
  }
  assert.deepEqual(claim(ids[1], 'specs.fixedLens.equivalentFocal.min').conditions.videoEquivalent['4K'], [36, 540]);
  assert.deepEqual(claim(ids[3], 'specs.fixedLens.equivalentFocal.min').conditions.videoEquivalent['4K'], [36, 108]);
  assert.deepEqual(claim(ids[0], 'specs.fixedLens.equivalentFocal.min').conditions.otherAspectRatios['1:1'], [28, 88]);
  assert.deepEqual(body('panasonic-tz99'), json(`${archive}before.json`).bodies.find(b => b.id === 'panasonic-tz99'));
});

test('New compact focal claims use default strict mm validation and reject missing or unsupported units', () => {
  assert.equal(validateStagingBatch(stagings(), context()).valid, true);
  for (const s of stagings()) for (const field of ['specs.fixedLens.focal.min', 'specs.fixedLens.equivalentFocal.max']) {
    for (const c of s.claims.filter(c => c.path === field)) { assert.equal(c.unit, 'mm'); assert.equal(c.rawUnit, 'mm'); }
    for (const [key, value, code] of [['rawUnit', null, 'UNIT_REQUIRED'], ['unit', null, 'UNIT_REQUIRED'], ['rawUnit', 'yard', 'UNSUPPORTED_UNIT'], ['unit', 'm', 'UNSUPPORTED_UNIT']]) {
      const bad = structuredClone(s); for (const c of bad.claims.filter(c => c.path === field)) c[key] = value;
      const v = validateStagingBatch([bad], context()); assert.equal(v.valid, false); assert.ok(v.items[0].errors.some(e => e.code === code));
    }
    const sourceRaws = manifest().items.find(i => i.productId === s.product.id).sourceIds.map(id => raws().get(id));
    const unknownRaws = sourceRaws.map(raw => {
      const { sourceId, contentDigest, evidenceExcerpt, items, schemaVersion, ...source } = raw;
      return buildRawDocument({ source, items: items.map(i => ({ ...i,
        observations: i.observations.map(o => ({ ...o, field: evidenceExcerpt[o.evidenceRef].field,
          rawValue: o.path === field ? null : o.rawValue, rawUnit: o.path === field ? null : o.rawUnit })),
      })) });
    });
    const c = context(), identityMap = json(`${archive}evidence.json`).bundle.identityMap;
    const fragments = unknownRaws.flatMap(raw => normalizeRawDocument(raw, { batchId: batch, vocab: c.vocab, identityMap }));
    const unknown = combineStagingFragments(fragments);
    const v = validateStagingBatch([unknown], { ...c, rawDocuments: new Map(unknownRaws.map(r => [r.sourceId, r])) });
    assert.equal(v.valid, true); assert.ok(unknown.claims.filter(c => c.path === field).every(c => c.value === null));
  }
});

test('Unresolved LX100II 392/292 operating weight is withheld and conflicting known candidates are blocked', () => {
  assert.equal(body(ids[2]).specs.weight, null); assert.equal(body(ids[2]).specs.weightBasis, null); assert.equal(body(ids[2]).specs.bodyOnlyWeight, 350);
  const wc = claims(ids[2], 'specs.weight'); assert.equal(wc.length, 2);
  for (const c of wc) { assert.equal(c.value, null); assert.deepEqual(c.conditions.reportedClaims.slice(0, 2).map(r => r.valueG), [392, 292]); }
  const bad = staging(ids[2]), values = bad.claims.filter(c => c.path === 'specs.weight');
  values[0].value = 292; values[1].value = 392; for (const c of values) c.conditions.weightBasis = 'battery-and-card';
  bad.product.specs.weight = 292; bad.product.specs.weightBasis = 'battery-and-card';
  const v = validateStagingBatch([bad], context()); assert.equal(v.valid, false); assert.ok(v.items[0].errors.some(e => e.code === 'CONFLICTING_CLAIM_VALUES'));
});

test('Optical and hybrid corrections are not body IBIS; sensor format never implies physical millimeters', () => {
  for (const id of ids) {
    assert.equal(body(id).specs.ibis, null); assert.equal(body(id).specs.sensor.sizeMm, null);
    assert.equal(claim(id, 'specs.ibis').conditions.neverMappedLensOisToBody, true);
    assert.match(claim(id, 'specs.ibis').conditions.lensStabilization, /optical|Optical|O.I.S|OIS/);
    const bad = staging(id); bad.claims.find(c => c.path === 'specs.ibis').value = true;
    assert.ok(validateStagingBatch([bad], context()).items[0].errors.some(e => e.code === 'INVALID_IBIS'));
  }
  assert.deepEqual(ids.map(id => body(id).specs.sensor.megapixels), [20.4, 20.1, 17, 20.1]);
  assert.equal(claim(ids[2], 'specs.sensor.megapixels').conditions.totalMegapixels, 21.77);
  assert.equal(body(ids[0]).specs.lcd.mechanism, 'vari-angle');
  assert.equal(claim(ids[0], 'specs.lcd.mechanism').conditions.manufacturerMechanism, 'free-angle');
});

test('Per-mode video, fractional labels, crop, thermal and region metadata stay scoped', () => {
  const l = claim(ids[0], 'specs.video.max');
  assert.equal(l.value, '5.6K 59.94p'); assert.equal(l.conditions.frameRate, 59.94); assert.deepEqual(l.conditions.resolution, [5632, 2976]);
  assert.equal(l.conditions.imageArea, 'FULL'); assert.equal(l.conditions.container, 'MOV'); assert.equal(l.conditions.bitDepth, 10);
  assert.match(l.conditions.officialFootnote, /prohibits/); assert.match(l.conditions.mode, /notphoto/);
  assert.equal(body(ids[0]).specs.video.cropAtMax, false); assert.equal(body(ids[0]).specs.video.log, true);
  assert.equal(claims(ids[0], 'specs.video.max').length, 2);
  for (const id of ids.slice(1)) {
    const v = claim(id, 'specs.video.max'); assert.equal(v.value, '4K 30p'); assert.equal(v.conditions.frameRate, null);
    assert.equal(v.conditions.singleSessionLimitMinutes, 15); assert.equal(v.conditions.bitRateMbps, 100);
    assert.equal(body(id).specs.video.cropAtMax, true); assert.equal(body(id).specs.video.bitDepth, null);
  }
  assert.match(claim(ids[1], 'specs.video.max').conditions.modelScope, /DC-TZ300GD/);
  assert.match(claim(ids[1], 'specs.video.max').conditions.otherModes, /25fps typo notused/);
  assert.equal(claim(ids[0], 'specs.burst.maxMechanicalFps').conditions.mechanicalAfcFps, 9);
  assert.equal(body(ids[0]).specs.burst.maxMechanicalFps, 11); assert.equal(body(ids[0]).specs.burst.maxElectronicFps, 30);
});

test('Known camera weights enforce their existing basis without requiring a guessed basis for UNKNOWN', () => {
  assert.deepEqual(ids.map(id => body(id).specs.weight), [508, 337, null, 310]);
  assert.deepEqual(ids.map(id => body(id).specs.bodyOnlyWeight), [425, 295, 350, 280]);
  assert.equal(claim(ids[0], 'specs.weight').conditions.hotShoeCover, 'included');
  assert.equal(claim(ids[0], 'specs.bodyOnlyWeight').conditions.bodyCap, 'excluded');
  for (const id of [ids[0], ids[1], ids[3]]) {
    assert.equal(claim(id, 'specs.weight').conditions.weightBasis, 'battery-and-card');
    for (const [value, code] of [[null, 'WEIGHT_BASIS_REQUIRED'], ['operational', 'INVALID_WEIGHT_BASIS'], ['battery', 'WEIGHT_BASIS_MISMATCH']]) {
      const bad = staging(id); bad.claims.find(c => c.path === 'specs.weight').conditions.weightBasis = value;
      assert.ok(validateStagingBatch([bad], context()).items[0].errors.some(e => e.code === code));
    }
  }
  assert.ok(claims(ids[2], 'specs.weight').every(c => c.conditions.weightBasis == null));
  assert.equal(validateStagingBatch([staging(ids[2])], context()).valid, true);
});

test('All eleven manufacturer chains retain actual helper UTC times, identity-only counts and reviewed independent worker attempts', () => {
  const raw = raws(), diff = json(`${base}diffs/${batch}.json`), s = snapshot();
  assert.equal(raw.size, 11); assert.equal(stagings().reduce((n, s) => n + s.claims.length, 0), 103);
  for (const [n, item] of manifest().items.entries()) {
    const count = [3, 3, 3, 2][n]; assert.equal(item.state, 'canonicalized'); assert.equal(item.sourceIds.length, count);
    assert.equal(item.stagingDigest, digestValue(staging(item.productId)));
    assert.match(formatCanonicalDiff(diff.items[n]), new RegExp(`fields / ${count} sources`));
    for (const [k, id] of item.sourceIds.entries()) {
      const r = raw.get(id); assert.equal(r.sourceType, 'manufacturer'); assert.equal(r.items.length, 1);
      assert.equal(r.items[0].itemKey, item.itemKey); assert.equal(item.rawDigests[k], digestValue(r));
      assert.equal(r.contentDigest, digestValue(r.evidenceExcerpt)); assert.equal(new Date(r.accessedAt).toISOString(), r.accessedAt);
      assert.match(r.accessedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      assert.ok(body(item.productId).sources.some(x => x.sourceId === id));
      assert.ok(r.items[0].observations.every(o => !o.path.startsWith('price.')));
      assert.ok(!r.url.includes('shoot-dmc-lx100/'));
    }
  }
  assert.equal(s.rawHelperClockChecks.length, 11);
  for (const c of s.rawHelperClockChecks) { assert.ok(c.before <= c.accessedAt && c.accessedAt <= c.after); assert.equal(raw.get(c.sourceId).accessedAt, c.accessedAt); }
  assert.equal(s.workerTasks.length, 4); assert.equal(new Set(s.workerTasks.map(w => w.taskId)).size, 4);
  assert.deepEqual(s.workerTasks.map(w => w.attempts.length), [1, 2, 1, 1]);
  const attempts = s.workerTasks.flatMap(w => w.attempts);
  assert.equal(attempts.filter(a => a.status === 'failure').length, 1); assert.equal(attempts.reduce((n, a) => n + a.usage.totalTokens, 0), 23609);
  assert.ok(attempts.every(a => a.applied === false));
});
