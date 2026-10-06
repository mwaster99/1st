import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {proposedCanonical, validateCanonical, verifyIncoming} from '../scripts/objective/merge.mjs';
import {digestValue, formatCanonicalDiff, getAtPath, summarizeCanonicalDiff, validateStagingBatch} from '../scripts/objective/rules.mjs';
import {BODY_BY_ID, CAMERA_LENSES, getIntegratedLens} from '../src/cameraData.js';
import {generateScenarioCandidates, generateLensCandidates, evaluateScenario} from '../src/cameraScenarioEngine.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read=p=>readFileSync(path.join(root,p));
const json=p=>JSON.parse(read(p));
const sha=p=>createHash('sha256').update(read(p)).digest('hex');
const base='src/data/ingestion/',batch='production-fujifilm-bodies-003',tx=`${base}transactions/${batch}/`;
const manifest=()=>json(`${base}batches/${batch}.json`);
const before=()=>json(`${tx}before.json`),after=()=>json(`${tx}after.json`);
const stages=()=>manifest().items.map(i=>json(`${base}staging/${batch}/${i.itemKey}.json`));
const raws=()=>new Map(manifest().items.flatMap(i=>i.sourceIds).map(id=>[id,json(`${base}raw/${id}.json`)]));
const context=()=>({canonical:before(),vocab:json(`${base}vocab.json`),rawDocuments:raws()});
const stage=id=>stages().find(s=>s.product.id===id);
const claim=(id,field)=>stage(id).claims.find(c=>c.path===field);
const body=id=>after().bodies.find(p=>p.id===id);
const ids=['fujifilm-x-t5','fujifilm-x-t50','fujifilm-x-s20','fujifilm-x-m5','fujifilm-x100vi'];

test('Fujifilm 003 updates exactly five existing identities atomically without new products, alias, price or unrelated changes',()=>{
  const m=manifest(),a=json(`${base}approvals/${batch}.json`),e=json(`${tx}evidence.json`),j=json(`${tx}journal.json`);
  const b=before(),r=after();
  assert.equal(b.bodies.length,111);assert.equal(r.bodies.length,111);assert.equal(r.lenses.length,36);
  assert.deepEqual(r.lenses,b.lenses);
  assert.deepEqual(r.bodies.map(p=>p.id),b.bodies.map(p=>p.id));
  for(const p of b.bodies){
    const result=r.bodies.find(v=>v.id===p.id);
    if(!ids.includes(p.id)){assert.deepEqual(result,p);continue;}
    for(const key of ['id','name','brand','series','model','aliases','mount','kind','bodyStyle','price'])assert.deepEqual(result[key],p[key]);
  }
  assert.deepEqual(a.productIds,ids);assert.ok(a.productOperations.every(o=>o.operation==='update-product'&&o.action==='update'));
  assert.equal(a.approvedBy.method,'cli-explicit');assert.equal(j.phase,'canonicalized');
  assert.equal(m.canonicalBaselineDigest,json(`${base}batches/production-fujifilm-bodies-002.json`).expectedCanonicalDigest);
  assert.equal(m.canonicalBaselineDigest,sha(`${tx}before.json`));assert.equal(m.expectedCanonicalDigest,sha(`${tx}after.json`));
  assert.deepEqual(a,e.approval);assert.equal(a.incomingDigest,digestValue(e.bundle.artifactDigests));
  assert.equal(a.diffDigest,digestValue(e.bundle.diff));assert.equal(a.diffFileDigest,sha(`${base}diffs/${batch}.json`));
  assert.equal(j.evidenceDigest,digestValue(e));
  verifyIncoming(e.bundle,b); // strict current defaults: no archive compatibility option
  const replay=proposedCanonical(b,e.bundle,a.decisions,a.productOperations);
  assert.deepEqual(replay.canonical,r);assert.equal(replay.digest,m.expectedCanonicalDigest);
  assert.deepEqual(proposedCanonical(r,e.bundle,a.decisions,a.productOperations).canonical,r);
  assert.equal(validateCanonical(r,e.bundle.vocab),true);
});

test('Existing updates distinguish same evidence/null fill and only the explicitly reviewed X-T5 exact-fps conflict',()=>{
  const d=json(`${base}diffs/${batch}.json`),a=json(`${base}approvals/${batch}.json`);
  const expected=[[10,16,1],[4,23,0],[8,18,0],[5,18,0],[8,23,0]];
  for(const [index,item] of d.items.entries()){
    const c=summarizeCanonicalDiff(item.changes).categories;
    assert.deepEqual([c['same-value/new-evidence'],c['null-fill'],c['value-conflict']],expected[index]);
    assert.equal(c['new-product'],0);assert.equal(item.operation,'update-product');
  }
  const conflicts=a.decisions.filter(d=>d.category==='value-conflict');
  assert.equal(conflicts.length,1);assert.equal(conflicts[0].productId,ids[0]);assert.equal(conflicts[0].path,'specs.video.max');
  assert.match(conflicts[0].reason,/marketing-rounded/);assert.match(conflicts[0].reason,/29\.97/);
  assert.equal(before().bodies.find(p=>p.id===ids[0]).specs.video.max,'6.2K 30p');
  assert.equal(body(ids[0]).specs.video.max,'6.2K 29.97p');
  assert.equal(a.decisions.filter(d=>d.action==='ignore').length,5);
});

test('Five existing Fuji bodies gain 134 verified field paths with every new source linked and exact raw access timestamps',()=>{
  const sourceMap=raws(),diff=json(`${base}diffs/${batch}.json`);
  assert.equal(sourceMap.size,11);assert.equal(stages().reduce((n,s)=>n+s.claims.length,0),169);
  assert.equal(validateStagingBatch(stages(),context()).valid,true);
  assert.equal(ids.reduce((n,id)=>n+Object.keys(body(id).fieldEvidence).length,0),134);
  for(const [index,i] of manifest().items.entries()){
    const expected=index===1?3:2,s=stage(i.productId),p=body(i.productId);
    assert.equal(i.state,'canonicalized');assert.equal(i.sourceIds.length,expected);
    assert.equal(i.stagingDigest,digestValue(s));assert.equal(s.identityEvidence,null);
    assert.equal(Object.keys(before().bodies.find(p=>p.id===i.productId).fieldEvidence??{}).length,0);
    assert.equal(p.sources.length,expected+1); // retain pre-existing official legacy source
    assert.match(formatCanonicalDiff(diff.items[index]),new RegExp(`fields / ${expected} sources`));
    for(const [n,id] of i.sourceIds.entries()){
      const r=sourceMap.get(id);assert.equal(i.rawDigests[n],digestValue(r));assert.equal(r.contentDigest,digestValue(r.evidenceExcerpt));
      assert.match(r.accessedAt,/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      assert.equal(new Date(r.accessedAt).toISOString(),r.accessedAt);
      assert.ok(['fujifilm-korea.co.kr','fujifilm-dsc.com','www.fujifilm-x.com'].includes(new URL(r.url).hostname));
      assert.ok(s.claims.some(c=>c.sourceId===id&&c.value!==null));
      assert.ok(p.sources.some(source=>source.sourceId===id&&source.fields.length));
    }
    // The manually checked 10-bit evidence comes from the manual, not the Korea product source.
    assert.equal(new URL(sourceMap.get(claim(i.productId,'specs.video.bitDepth').sourceId).url).hostname,'fujifilm-dsc.com');
    assert.ok(!s.claims.some(c=>/price|film|simulation|experience/i.test(c.path)));
    assert.ok(s.claims.every(c=>c.verification==='verified'));
  }
});

test('New Fuji update claims enforce weight, IBIS, strict mm and multi-source conflicts before approval',()=>{
  const ctx=context();
  for(const [value,code] of [[null,'WEIGHT_BASIS_REQUIRED'],['operational','INVALID_WEIGHT_BASIS'],['battery','WEIGHT_BASIS_MISMATCH']]){
    const s=stage(ids[0]);s.claims.find(c=>c.path==='specs.weight').conditions.weightBasis=value;
    assert.ok(validateStagingBatch([s],ctx).items[0].errors.some(e=>e.code===code));
  }
  for(const value of [true,false,{present:'yes'}]){
    const s=stage(ids[0]);s.claims.find(c=>c.path==='specs.ibis').value=value;
    assert.ok(validateStagingBatch([s],ctx).items[0].errors.some(e=>e.code==='INVALID_IBIS'));
  }
  for(const field of ['specs.fixedLens.focal.min','specs.fixedLens.focal.max','specs.fixedLens.equivalentFocal.min','specs.fixedLens.equivalentFocal.max']){
    for(const [key,value,code] of [['unit',null,'UNIT_REQUIRED'],['rawUnit',null,'UNIT_REQUIRED'],['rawUnit','ft','UNSUPPORTED_UNIT']]){
      const s=stage(ids[4]);s.claims.find(c=>c.path===field)[key]=value;
      assert.ok(validateStagingBatch([s],ctx).items[0].errors.some(e=>e.path===field&&e.code===code));
    }
  }
  const s=stage(ids[0]),mp=s.claims.filter(c=>c.path==='specs.sensor.megapixels');
  assert.equal(mp.length,2);mp[0].value=41;
  assert.ok(validateStagingBatch([s],ctx).items[0].errors.some(e=>e.code==='CONFLICTING_CLAIM_VALUES'));
});

test('X100VI keeps its fixed prime and actual/equivalent mm separate with no extra lens assets or mass',()=>{
  const p=body(ids[4]);assert.equal(p.kind,'fixed');assert.equal(p.mount,null);
  assert.deepEqual(p.specs.fixedLens.focal,{min:23,max:23});assert.deepEqual(p.specs.fixedLens.equivalentFocal,{min:35,max:35});
  assert.deepEqual(p.specs.fixedLens.aperture,{wide:2,tele:2});assert.equal(p.specs.fixedLens.label,'23mm F2 고정 렌즈');
  assert.equal(p.specs.weight,521);assert.equal(p.specs.bodyOnlyWeight,471);
  for(const range of ['focal','equivalentFocal'])for(const end of ['min','max']){
    const c=claim(ids[4],`specs.fixedLens.${range}.${end}`);assert.equal(c.unit,'mm');assert.equal(c.rawUnit,'mm');
    assert.equal(c.conditions.lensType,'prime');assert.equal(c.value,range==='focal'?23:35);
  }
  const integrated=getIntegratedLens(BODY_BY_ID[ids[4]]);
  assert.equal(integrated.includedInBodyId,ids[4]);assert.equal(integrated.weight,null);assert.equal(integrated.newPrice,null);assert.equal(integrated.usedPrice,null);
  assert.ok(!CAMERA_LENSES.some(l=>l.id===integrated.id));assert.deepEqual(after().lenses,before().lenses);
  assert.deepEqual(generateLensCandidates({body:BODY_BY_ID[ids[4]]}).map(l=>l.id),[integrated.id]);
  const currentLens=CAMERA_LENSES.find(l=>l.id==='sony-fe-24-70-gm2');
  const input={currentBody:BODY_BY_ID['sony-a7-iv'],currentLenses:[currentLens],primaryLens:currentLens,pains:['더 가볍고 작은 카메라를 원해요'],subjects:['여행 · 일상'],extraBudget:300};
  const candidate=generateScenarioCandidates(input).find(s=>s.targetSystem.body.id===ids[4]);
  assert.ok(candidate);const result=evaluateScenario(candidate,input);assert.equal(result.weight.after,521);
  assert.deepEqual(result.buy.map(p=>p.id),[ids[4]]);assert.equal(result.lensCount.after,0);
});

test('Conditional video/IBIS/burst/battery facts retain the selected mode while digital IS and unverifiable fields stay UNKNOWN',()=>{
  for(const id of ids){
    const v=claim(id,'specs.video.max');assert.equal(v.value,'6.2K 29.97p');
    assert.equal(v.conditions.frameRate,29.97);assert.equal(v.conditions.recording,'internal SD');assert.equal(v.conditions.bitDepth,10);
    assert.equal(v.conditions.highSpeedSeparate.resolution,'Full HD');assert.equal(v.conditions.highSpeedSeparate.captureFps,240);
    assert.equal(v.conditions.externalRawNotInternal,true);
    const b=claim(id,'specs.burst.maxElectronicFps');assert.equal(b.conditions.shutter,'electronic');
    assert.equal(b.conditions.cropFactor,['fujifilm-x-s20','fujifilm-x-m5'].includes(id)?1.25:1.29);
    assert.equal(claim(id,'specs.weight').conditions.weightBasis,'battery-and-card');
    assert.equal(claim(id,'specs.bodyOnlyWeight').conditions.weightBasis,'body-only');
  }
  assert.equal(body(ids[0]).specs.sensor.megapixels,40.2);assert.ok(stage(ids[0]).claims.some(c=>c.path==='specs.sensor.megapixels'&&c.conditions.pixelShiftCompositeIsNotSensorResolution===true));
  assert.equal(body(ids[1]).specs.burst.maxMechanicalFps,8);assert.equal(new URL(raws().get(claim(ids[1],'specs.burst.maxMechanicalFps').sourceId).url).hostname,'www.fujifilm-x.com');
  assert.equal(body(ids[1]).specs.lcd.mechanism,'tilt');assert.equal(claim(ids[1],'specs.lcd.mechanism').conditions.directionCount,null);
  assert.deepEqual(claim(ids[2],'specs.ibis').conditions.measuredAxes,['yaw','pitch']);assert.equal(claim(ids[2],'specs.ibis').conditions.lens,'XF35mmF1.4 R');
  assert.deepEqual(body(ids[2]).specs.ibis,before().bodies.find(p=>p.id===ids[2]).specs.ibis);
  assert.equal(body(ids[2]).specs.video.cropAtMax,false);assert.equal(claim(ids[2],'specs.video.cropAtMax').conditions.cropFactor,1);
  assert.equal(body(ids[3]).specs.ibis,null);assert.equal(claim(ids[3],'specs.ibis').conditions.digitalStabilizationVideoOnly,true);
  assert.equal(body(ids[3]).fieldEvidence['specs.ibis'],undefined);assert.equal(body(ids[3]).specs.evf.present,false);
  for(const [id,field] of [[ids[2],'specs.video.log'],[ids[3],'specs.video.cropAtMax'],[ids[4],'specs.video.log'],[ids[4],'specs.burst.maxMechanicalFps']]){
    assert.equal(claim(id,field).value,null);assert.equal(getAtPath(body(id),field)??null,null);assert.equal(body(id).fieldEvidence[field],undefined);
  }
  assert.deepEqual(claim(ids[4],'specs.video.max').conditions.resolution,[6240,3510]);
  assert.ok(claim(ids[4],'specs.video.max').locator.row.includes('3510'));
  assert.equal(body(ids[4]).specs.batteryShots,310);assert.deepEqual(claim(ids[4],'specs.batteryShots').conditions.alternativeViewfinderShots,{LCD:320,OVF:450});
});

test('All 14 Korean in-scope base identities have production provenance while original snapshots and limited variants remain distinct',()=>{
  const inventory=json(`${base}fujifilm-current-camera-gallery-2026-10-02.json`);
  const ordinary=inventory.cards.filter(c=>c.scopeStatus==='in-scope'&&c.availabilityStatus==='released-current');
  const bases=ordinary.filter(c=>c.variantKey===null);
  assert.equal(bases.length,14);assert.equal(ordinary.length,16);assert.ok(bases.every(c=>c.productionBatch&&c.status==='canonicalized'));
  for(const c of bases){
    const m=json(`${base}batches/${c.productionBatch}.json`);assert.ok(m.items.some(i=>i.productId===c.canonicalId&&i.state==='canonicalized'));
    const p=json('src/data/cameraProducts.json').bodies.find(p=>p.id===c.canonicalId);assert.ok(Object.keys(p.fieldEvidence??{}).length);
  }
  assert.equal(inventory.initialCounts.productionCanonicalizedIdentities,0);assert.equal(inventory.batch001Completion.remainingIdentitiesWithoutCanonical,4);
  assert.equal(inventory.batch002Completion.productionCanonicalizedIdentities,9);assert.equal(inventory.batch002Completion.existingLegacyIdentities,5);
  assert.equal(inventory.batch003Completion.canonicalizedNewIdentities,0);assert.equal(inventory.batch003Completion.canonicalizedExistingIdentities,5);
  assert.equal(inventory.batch003Completion.remainingIdentitiesWithoutProductionProvenance,0);
  const limited=ordinary.find(c=>c.name==='X100VI Limited Edition');assert.equal(limited.productionBatch,null);assert.equal(limited.coverageViaBaseBatch,batch);
  assert.equal(limited.canonicalId,ids[4]);assert.equal(limited.status,'canonical-base-linked-variant');
  assert.equal(inventory.cards.find(c=>c.modelCode==='GFX100 II IR').scopeStatus,'deferred-special-category');
  assert.equal(inventory.adjacentSpecialCategory.scopeStatus,'deferred-special-category');
});
