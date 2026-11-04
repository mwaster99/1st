import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { verifyIncoming, proposedCanonical, validateCanonical } from '../scripts/objective/merge.mjs';

const read = path => JSON.parse(readFileSync(new URL('../src/data/' + path, import.meta.url)));
const batch = 'production-sony-e-lenses-004';
const tx = 'ingestion/transactions/' + batch + '/';
const before = read(tx + 'before.json'), after = read(tx + 'after.json');
const { bundle, approval } = read(tx + 'evidence.json');
const models = ['SEL15F14G','SEL11F18','SEL1655G','SEL70350G','SELP18105G','SEL20F28','SEL24F18Z','SEL50F18','SEL55210'];
const find = model => after.lenses.find(l => l.model === model);

test('Batch 004 adds exactly nine identities and preserves prior bodies, lenses and prices', () => {
  assert.deepEqual(after.bodies, before.bodies);
  assert.equal(after.lenses.length, 66);
  for (const l of before.lenses) assert.deepEqual(after.lenses.find(p => p.id === l.id), l);
  assert.deepEqual(after.lenses.filter(p => !before.lenses.some(l => l.id === p.id)).map(p => p.model).sort(), [...models].sort());
  for (const model of models) assert.equal(after.lenses.filter(p => p.model === model).length, 1);
  assert.ok(approval.productOperations.every(o => o.operation === 'new-product' && !o.modelNullFill));
});

test('APS-C coverage is sourced independently of Sony E mount and actual focal length', () => {
  for (const model of models) {
    const l = find(model);
    assert.equal(l.mount, 'Sony E');
    assert.equal(l.specs.formatCoverage, 'APS-C');
    assert.equal(l.fieldEvidence['specs.formatCoverage'].verification, 'verified');
    assert.equal(l.sources.length, 2);
    assert.equal(l.identityEvidence.verification, 'verified');
    for (const end of ['min','max']) {
      const claim = bundle.stagings.find(s => s.product.id === l.id).claims.find(c => c.path === 'specs.focal.' + end);
      assert.equal(claim.rawUnit, 'mm');
    }
  }
  assert.deepEqual(find('SEL1655G').specs.focal, { min:16, max:55 });
  assert.deepEqual(find('SEL15F14G').specs.focal, { min:15, max:15 });
  assert.deepEqual(find('SEL1655G').specs.aperture, { wide:2.8, tele:2.8 });
  assert.deepEqual(find('SEL70350G').specs.aperture, { wide:4.5, tele:6.3 });
});

test('Power zoom is a zoom with independent OSS and explicit wide/tele close-focus conditions', () => {
  const l = find('SELP18105G'), s = bundle.stagings.find(s => s.product.id === l.id);
  assert.equal(l.type,'zoom');
  assert.equal(l.specs.stabilization,true);
  assert.equal(l.specs.ibis,undefined);
  assert.equal(l.specs.powerZoom,undefined);
  assert.equal(s.claims.find(c => c.path === 'specs.focal.min').conditions.powerZoom,true);
  assert.deepEqual(l.specs.aperture,{ wide:4, tele:4 });
  assert.equal(l.specs.weight,427);
  assert.match(l.specs.minFocusConditions,/0\.45m wide; 0\.95m tele/);
  assert.match(find('SEL70350G').specs.minFocusConditions,/lower bound only/);
  assert.match(find('SEL55210').specs.minFocusConditions,/1m at tele; wide not specified/);
});

test('Absent OSS row remains unknown and verified body-integrated dash is lens false', () => {
  for (const model of ['SEL20F28','SEL24F18Z']) {
    assert.equal(find(model).specs.stabilization,null);
    assert.equal(find(model).fieldEvidence['specs.stabilization'],undefined);
  }
  assert.equal(find('SEL11F18').specs.stabilization,false);
  assert.equal(find('SEL50F18').specs.stabilization,true);
  assert.equal(find('SEL50F18F').specs.formatCoverage,'full-frame');
});

test('Sealed Batch 004 validates and replays exactly, including on reapply', () => {
  verifyIncoming(bundle,before);
  assert.equal(validateCanonical(read('cameraProducts.json'),read('ingestion/vocab.json')),true);
  assert.deepEqual(proposedCanonical(before,bundle,approval.decisions,approval.productOperations).canonical,after);
  assert.deepEqual(proposedCanonical(after,bundle,approval.decisions,approval.productOperations).canonical,after);
});
