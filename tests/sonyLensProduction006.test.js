import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { proposedCanonical, validateCanonical, verifyIncoming } from '../scripts/objective/merge.mjs';

const read = path => JSON.parse(readFileSync(new URL('../src/data/' + path, import.meta.url)));
const transaction = 'ingestion/transactions/production-sony-e-lenses-006/';
const checkpoint = read('ingestion/sony-e-lenses-production-006.json');
const before = read(transaction + 'before.json');
const after = read(transaction + 'after.json');
const { bundle, approval } = read(transaction + 'evidence.json');
const lens = model => after.lenses.find(product => product.model === model);
const staging = model => bundle.stagings.find(stage => stage.manufacturerModelCode === model);
const claims = (model, path) => staging(model).claims.filter(claim => claim.path === path);
const nativeClaim = (model, path) => claims(model, path).find(claim => claim.conditions.teleconverterCompatibility);

test('Batch 006 keeps existing identities and retains distinct generations and 100–400 variants', () => {
  assert.deepEqual(after.bodies, before.bodies);
  assert.equal(after.lenses.length, before.lenses.length + 11);
  const existingId = 'sony-fe-70-200-gm2';
  for (const old of before.lenses.filter(item => item.id !== existingId)) {
    assert.deepEqual(after.lenses.find(item => item.id === old.id), old);
  }
  const old = before.lenses.find(item => item.id === existingId);
  const updated = lens('SEL70200GM2');
  assert.equal(old.model, undefined);
  assert.equal(updated.id, existingId);
  for (const key of ['name', 'brand', 'mount', 'type', 'aliases', 'price']) {
    assert.deepEqual(updated[key], old[key]);
  }
  assert.equal(approval.productOperations.find(item => item.productId === existingId).modelNullFill.incomingValue, 'SEL70200GM2');
  const four = ['SEL70200G', 'SEL70200G2', 'SEL70200GM', 'SEL70200GM2'];
  assert.equal(new Set(four.map(model => lens(model).id)).size, four.length);
  assert.notEqual(lens('SEL100400').id, lens('SEL100400GM').id);
  assert.equal(lens('SEL100400MC'), undefined);
});

test('All lenses preserve native endpoints, variable or constant maximum aperture, OSS, mount and official provenance', () => {
  for (const product of checkpoint.products) {
    const code = product.manufacturerModelCode;
    const matches = after.lenses.filter(item => item.model === code);
    assert.equal(matches.length, 1);
    const [saved] = matches;
    assert.equal(saved.mount, 'Sony E');
    assert.equal(saved.type, 'zoom');
    assert.equal(saved.specs.formatCoverage, 'full-frame');
    for (const field of ['focal', 'aperture', 'stabilization', 'filterMm', 'minFocusM']) {
      assert.deepEqual(saved.specs[field], product[field]);
    }
    for (const field of ['focal.min', 'focal.max', 'filterMm']) {
      assert.equal(claims(code, 'specs.' + field)[0].rawUnit, 'mm');
      assert.equal(saved.fieldEvidence['specs.' + field].verification, 'verified');
    }
    const sources = product.sourceIds.map(id => read('ingestion/raw/' + id + '.json'));
    assert.deepEqual(sources.map(source => source.accessedAt), [
      product.productRetrievedAt, product.specRetrievedAt,
      ...[product.extraSource?.at, product.compatibilitySource?.at].filter(Boolean)
    ]);
    for (const source of sources) {
      assert.equal(source.accessedAt, new Date(source.accessedAt).toISOString());
    }
  }
  assert.deepEqual(lens('SEL100400').specs.aperture, { wide: 5.6, tele: 8 });
  assert.deepEqual(lens('SEL50150GM').specs.aperture, { wide: 2, tele: 2 });
  assert.equal(lens('SEL50150GM').specs.stabilization, false);
});

test('Focus modes, native magnification, power zoom and TC combinations remain qualified', () => {
  assert.match(lens('SEL100400').specs.minFocusConditions, /1\.13 m W \/ 0\.86 m T/);
  assert.match(lens('SELP28135G').specs.minFocusConditions, /Full MF 0\.95 m/);
  assert.equal(nativeClaim('SELP28135G', 'specs.focal.min').conditions.powerZoom, true);
  assert.equal(lens('SELP28135G').specs.powerZoom, undefined);
  assert.equal(lens('SEL400800G').specs.focal.max, 800);
  assert.equal(nativeClaim('SEL400800G', 'specs.focal.max').conditions.teleconverterCompatibility.SEL20TC, true);
  assert.match(claims('SEL100400', 'specs.focal.max').find(claim => claim.conditions.body === 'ILCE-6300').conditions.SEL20TC, /F13/);
  const macro = claims('SEL70200G2', 'specs.minFocusM')[0].conditions;
  assert.equal(macro.maximumMagnification, 0.5);
  assert.match(macro.magnificationBasis, /2x TC combination/);
  assert.equal(nativeClaim('SEL50150GM', 'specs.focal.min').conditions.teleconverterCompatibility.SEL14TC, false);
  assert.equal(nativeClaim('SEL70300G', 'specs.focal.min').conditions.teleconverterCompatibility.SEL20TC, null);
});

test('Tripod basis and two official transcription discrepancies retain their source context', () => {
  assert.equal(lens('SEL70200G').specs.weight, 840);
  const mass = claims('SEL70200G', 'specs.weight')[0];
  assert.equal(mass.rawUnit, 'g');
  assert.match(mass.conditions.tripodMountBasis, /without tripod mount/);
  assert.match(mass.conditions.sourceDiscrepancy.sonyKoreaText, /8\.40kg/);
  assert.match(claims('SEL70200G2', 'specs.weight')[0].conditions.tripodMountBasis, /without tripod mount/);
  assert.match(claims('SEL400800G', 'specs.weight')[0].conditions.tripodMountBasis, /fixed tripod foot/);
  assert.match(claims('SEL200600G', 'specs.weight')[0].conditions.tripodMountBasis, /does not specify inclusion/);
  assert.match(claims('SEL24240', 'specs.minFocusM')[0].conditions.sourceDiscrepancy.sonyKoreaText, /0\.8mm/);
  assert.match(lens('SEL24240').specs.minFocusConditions, /0\.50–0\.80 m/);
});

test('Sealed Batch 006 evidence validates and replays the same canonical transition', () => {
  verifyIncoming(bundle, before);
  assert.equal(validateCanonical(read('cameraProducts.json'), read('ingestion/vocab.json')), true);
  assert.deepEqual(proposedCanonical(before, bundle, approval.decisions, approval.productOperations).canonical, after);
  assert.deepEqual(proposedCanonical(after, bundle, approval.decisions, approval.productOperations).canonical, after);
});
