import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyIncoming, proposedCanonical, validateCanonical} from '../scripts/objective/merge.mjs';
const read = p => JSON.parse(readFileSync(new URL('../src/data/'+p, import.meta.url)));
const tx = 'ingestion/transactions/production-sony-e-lenses-005/';
const before = read(tx+'before.json'), after = read(tx+'after.json');
const {bundle, approval} = read(tx+'evidence.json');
const find = code => after.lenses.find(l=>l.model===code);
const staging = code => bundle.stagings.find(s=>s.product.model===code);
const codes = ['SEL2870GM','SEL1625G','SEL2450G','SEL1635GM2','SEL2070G','SELP1635G','SEL1224GM','SEL24105G','SEL1635GM','SEL1224G','SEL2470GM','SEL2470Z'];

test('Batch 005 adds eleven lenses, enriches one ID, and preserves all other products',()=>{
  assert.deepEqual(after.bodies,before.bodies);
  assert.equal(after.lenses.length,before.lenses.length+11);
  for(const l of before.lenses.filter(l=>l.id!=='sony-fe-pz-16-35-f4')) assert.deepEqual(after.lenses.find(x=>x.id===l.id),l);
  for(const code of codes) assert.equal(after.lenses.filter(l=>l.model===code).length,1);
  for(const [a,b] of [['SEL1635GM','SEL1635GM2'],['SEL2470GM','SEL2470GM2']]) assert.notEqual(find(a).id,find(b).id);
});

test('Physical focal endpoints and fixed maximum apertures have exact-model evidence',()=>{
  for(const code of codes){
    const l=find(code),s=staging(code);
    assert.equal(l.mount,'Sony E');
    assert.equal(l.type,'zoom');
    assert.equal(l.specs.formatCoverage,'full-frame');
    assert.equal(l.specs.aperture.wide,l.specs.aperture.tele);
    assert.equal(l.fieldEvidence['specs.formatCoverage'].verification,'verified');
    assert.ok(s.sources.length>=2);
    for(const end of ['min','max']) assert.equal(s.claims.find(c=>c.path==='specs.focal.'+end).rawUnit,'mm');
  }
  assert.deepEqual(find('SEL2870GM').specs.focal,{min:28,max:70});
  assert.deepEqual(find('SEL2870GM').specs.aperture,{wide:2,tele:2});
});

test('Explicit PZ model fill preserves identity and separates motorized zoom from OSS',()=>{
  const l=find('SELP1635G'), old=before.lenses.find(x=>x.id===l.id);
  assert.equal(old.id,'sony-fe-pz-16-35-f4');
  assert.equal(old.model,undefined);
  for(const k of ['id','name','brand','aliases','type','mount','price']) assert.deepEqual(l[k],old[k]);
  assert.equal(approval.productOperations.find(o=>o.productId===l.id).modelNullFill.incomingValue,'SELP1635G');
  assert.equal(l.specs.stabilization,false);
  assert.equal(l.specs.weight,353);
  assert.equal(l.specs.ibis,undefined);
  assert.equal(l.specs.powerZoom,undefined);
  assert.equal(staging('SELP1635G').claims.find(c=>c.path==='specs.focal.min').conditions.powerZoom,true);
});

test('Filter gaps, zoom-position focus, and unresolved OSS stay qualified',()=>{
  for(const c of ['SEL1224GM','SEL1224G']) assert.equal(find(c).specs.filterMm,null);
  assert.equal(find('SEL2470GM').specs.stabilization,null);
  assert.equal(find('SEL24105G').specs.stabilization,true);
  assert.match(find('SEL1625G').specs.minFocusConditions,/MF W 0.17m\/T 0.22m/);
  const c=staging('SEL1625G').claims.find(x=>x.path==='specs.minFocusM');
  assert.equal(c.conditions.maximumMagnification,'0.20x AF; 0.23x MF');
  assert.match(c.conditions.sourceDiscrepancy.resolution,/0.79ft/);
  assert.deepEqual(staging('SEL1224GM').claims.find(c=>c.path==='specs.weight').conditions.unpromotedDiameterLengthMm,[97.6,137]);
});

test('Sealed production evidence validates and replays exactly from before and after',()=>{
  verifyIncoming(bundle,before);
  assert.equal(validateCanonical(read('cameraProducts.json'),read('ingestion/vocab.json')),true);
  assert.deepEqual(proposedCanonical(before,bundle,approval.decisions,approval.productOperations).canonical,after);
  assert.deepEqual(proposedCanonical(after,bundle,approval.decisions,approval.productOperations).canonical,after);
});
