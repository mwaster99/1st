import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCanonical } from '../scripts/objective/merge.mjs';
import { digestValue, validateStagingBatch } from '../scripts/objective/rules.mjs';

import { BODY_BY_ID, LENS_BY_ID, CAMERA_LENSES, getIntegratedLens } from '../src/cameraData.js';
import { generateScenarioCandidates, generateLensCandidates, evaluateScenario } from '../src/cameraScenarioEngine.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => readFileSync(path.join(root, name));
const json = (name) => JSON.parse(read(name));
const sha = (name) => createHash('sha256').update(read(name)).digest('hex');
const base = 'src/data/ingestion/';
const batch = 'production-nikon-bodies-004';
const selected = new Map([['COOLPIX P1000', 'nikon-coolpix-p1000']]);

test('Nikon batch 004 inventory preserves historical selection and upcoming boundary', () => {
  const snapshot = json(`${base}nikon-current-camera-gallery-2026-10-01.json`);
  const canonical = json('src/data/cameraProducts.json');
  assert.equal(snapshot.cards.length, 22);
  assert.equal(snapshot.cards.filter((card) => card.availabilityStatus === 'released-current').length, 21);
  assert.equal(snapshot.cards.filter((card) => card.availabilityStatus === 'announced-upcoming').length, 1);
  assert.ok(snapshot.cards.filter((card) => card.availabilityStatus === 'released-current' && card.status === 'unprocessed').length === 0);
  assert.equal(snapshot.cards.find((card) => card.name === 'Z5IIC').status, 'unprocessed');
  assert.ok(!canonical.bodies.some((body) => body.model === 'Z5IIC'));
  for (const [name, id] of selected) {
    const card = snapshot.cards.find((candidate) => candidate.name === name);
    assert.equal(card.status, 'canonicalized');
    assert.equal(card.canonicalId, id);
    assert.equal(card.productionBatch, batch);
    assert.ok(canonical.bodies.some((body) => body.id === id));
  }
  assert.ok(canonical.bodies.length >= 102);
  assert.ok(canonical.lenses.length >= 36);
  assert.equal(validateCanonical(canonical, json(`${base}vocab.json`)), true);
});

test('Nikon batch 004 official evidence and archived atomic transition remain valid', () => {
  const manifest = json(`${base}batches/${batch}.json`);
  const approval = json(`${base}approvals/${batch}.json`);
  const journal = json(`${base}transactions/${batch}/journal.json`);
  const diff = json(`${base}diffs/${batch}.json`);
  const canonical = json('src/data/cameraProducts.json');
  const raws = new Map(manifest.items.flatMap((item) => item.sourceIds)
    .map((sourceId) => [sourceId, json(`${base}raw/${sourceId}.json`)]));
  const stagings = manifest.items.map((item) => json(`${base}staging/${batch}/${item.itemKey}.json`));
  assert.equal(manifest.items.length, 1);
  assert.equal(manifest.apply.state, 'canonicalized');
  assert.equal(journal.phase, 'canonicalized');
  assert.equal(manifest.canonicalBaselineDigest, json(`${base}batches/production-nikon-bodies-003.json`).expectedCanonicalDigest);
  assert.equal(manifest.canonicalBaselineDigest, sha(`${base}transactions/${batch}/before.json`));
  assert.equal(manifest.expectedCanonicalDigest, sha(`${base}transactions/${batch}/after.json`));
  const after = json(`${base}transactions/${batch}/after.json`);
  assert.equal(after.bodies.length, 102);
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
  assert.equal(validateStagingBatch(stagings, { canonical: json(`${base}transactions/${batch}/before.json`), vocab: json(`${base}vocab.json`), rawDocuments: raws }).valid, true);
});

test('P1000 integrated optics keep focal units separate, lens VR out of IBIS and weight counted once', () => {
  const id = 'nikon-coolpix-p1000';
  const body = BODY_BY_ID[id];
  const staging = json(`${base}staging/${batch}/${id}.json`);
  assert.equal(body.kind, 'fixed');
  assert.equal(body.mount, null);
  assert.equal(body.specs.ibis, null);
  assert.ok(!staging.claims.some((claim) => claim.path === 'specs.ibis'));
  assert.deepEqual(body.specs.fixedLens.focal, { min: 4.3, max: 539 });
  assert.deepEqual(body.specs.fixedLens.equivalentFocal, { min: 24, max: 3000 });
  assert.deepEqual(body.specs.fixedLens.aperture, { wide: 2.8, tele: 8 });
  assert.deepEqual(Object.keys(body.specs.fixedLens).sort(), ['aperture', 'equivalentFocal', 'focal']);
  assert.equal(body.specs.bodyOnlyWeight, null);
  assert.equal(body.specs.sensor.sizeMm, null);
  assert.equal(body.specs.video.bitDepth, null);
  assert.equal(body.specs.video.cropAtMax, null);
  const manifest = json(`${base}batches/${batch}.json`);
  const raw = manifest.items[0].sourceIds.map((sourceId) => json(`${base}raw/${sourceId}.json`))
    .find((source) => source.items[0].observations.length > 0);
  const context = raw.evidenceExcerpt.find((entry) => entry.field.startsWith('손떨림 보정'));
  assert.deepEqual(context.value, { stills: 'lens-shift', movies: 'lens-shift plus electronic stabilization' });
  assert.equal(raw.evidenceExcerpt.find((entry) => entry.field.startsWith('렌즈 광학 줌')).value, 125);
  assert.ok(raw.items[0].observations.filter((obs) => obs.path.includes('Focal.') || obs.path.includes('.focal.'))
    .every((obs) => obs.rawUnit === 'mm'));
  const lens = getIntegratedLens(body);
  assert.equal(lens.includedInBodyId, id);
  assert.equal(lens.weight, null);
  assert.equal(lens.newPrice, null);
  assert.equal(lens.usedPrice, null);
  assert.ok(!CAMERA_LENSES.some((lens) => lens.id.startsWith(id)));
  assert.deepEqual(generateLensCandidates({ body }).map((lens) => lens.id), [lens.id]);
  const currentLens = LENS_BY_ID['sony-fe-24-70-gm2'];
  const input = { currentBody: BODY_BY_ID['sony-a7-iv'], currentLenses: [currentLens], primaryLens: currentLens,
    pains: ['더 가볍고 작은 카메라를 원해요'], subjects: ['여행 · 일상'], extraBudget: 300 };
  const candidate = generateScenarioCandidates(input).find((item) => item.targetSystem.body.id === id);
  assert.ok(candidate);
  const result = evaluateScenario(candidate, input);
  assert.deepEqual(result.buy.map((item) => item.id), [id]);
  assert.equal(result.weight.after, 1415);
  assert.equal(result.lensCount.after, 0);
});

test('P1000 known weight validates its basis and conditional movie/shutter claims remain intact', () => {
  const manifest = json(`${base}batches/${batch}.json`);
  const staging = json(`${base}staging/${batch}/${manifest.items[0].itemKey}.json`);
  const rawDocuments = new Map(manifest.items[0].sourceIds.map((id) => [id, json(`${base}raw/${id}.json`)]));
  const context = { canonical: json(`${base}transactions/${batch}/before.json`), vocab: json(`${base}vocab.json`), rawDocuments };
  assert.equal(validateStagingBatch([staging], context).valid, true);
  assert.equal(staging.claims.length, 13);
  const weight = staging.claims.find((claim) => claim.path === 'specs.weight');
  assert.equal(weight.conditions.weightBasis, 'battery-and-card');
  assert.equal(weight.conditions.integratedLensIncluded, true);
  assert.equal(staging.claims.find((claim) => claim.path === 'specs.video.max').conditions.codec, 'H.264/MPEG-4 AVC');
  assert.equal(staging.claims.find((claim) => claim.path === 'specs.shutter.mechanical').conditions.operation,
    'mechanical shutter and CMOS electronic shutter used together');
  for (const [basis, code] of [[undefined, 'WEIGHT_BASIS_REQUIRED'], ['operational', 'INVALID_WEIGHT_BASIS'], ['battery', 'WEIGHT_BASIS_MISMATCH']]) {
    const changed = structuredClone(staging);
    const claim = changed.claims.find((claim) => claim.path === 'specs.weight');
    if (basis === undefined) delete claim.conditions.weightBasis;
    else claim.conditions.weightBasis = basis;
    const result = validateStagingBatch([changed], context);
    assert.equal(result.valid, false);
    assert.ok(result.items[0].errors.some((error) => error.code === code && error.path === 'specs.weight'));
  }
});
