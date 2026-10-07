import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,existsSync} from 'node:fs';
import {proposedCanonical,validateCanonical,verifyIncoming} from '../scripts/objective/merge.mjs';
import {digestValue,formatCanonicalDiff,validateStagingBatch} from '../scripts/objective/rules.mjs';
import {BODY_BY_ID,LENS_BY_ID,getIntegratedLens,CAMERA_LENSES} from '../src/cameraData.js';
import {generateScenarioCandidates,evaluateScenario} from '../src/cameraScenarioEngine.js';
const root=new URL('../',import.meta.url),base='src/data/ingestion/',batch='production-panasonic-bodies-005',archive=base+'transactions/'+batch+'/';
const bytes=p=>readFileSync(new URL(p,root)),json=p=>JSON.parse(bytes(p)),sha=p=>createHash('sha256').update(bytes(p)).digest('hex');
const ids=['panasonic-vx3','panasonic-cx20','panasonic-x2','panasonic-cx4000'];
const manifest=()=>json(base+'batches/'+batch+'.json'),snapshot=()=>json(base+'panasonic-camcorder-pilot-2026-10-07.json');
const stagings=()=>manifest().items.map(i=>json(base+'staging/'+batch+'/'+i.itemKey+'.json'));
const staging=id=>stagings().find(s=>s.product.id===id),claim=(id,p)=>staging(id).claims.find(c=>c.path===p);
const body=id=>json(archive+'after.json').bodies.find(p=>p.id===id);
const raws=()=>new Map(manifest().items.flatMap(i=>i.sourceIds).map(id=>[id,json(base+'raw/'+id+'.json')]));
const context=()=>({canonical:json(archive+'before.json'),vocab:json(archive+'evidence.json').bundle.vocab,rawDocuments:raws()});

test('Camcorder pilot replays four new identities in one sealed atomic transaction and preserves all prior products',()=>{
 const m=manifest(),before=json(archive+'before.json'),after=json(archive+'after.json'),e=json(archive+'evidence.json'),a=json(base+'approvals/'+batch+'.json'),j=json(archive+'journal.json');
 assert.deepEqual(m.items.map(i=>i.productId),ids);assert.ok(m.items.every(i=>i.state==='canonicalized'));
 assert.equal(before.bodies.length,135);assert.equal(after.bodies.length,139);assert.equal(after.lenses.length,36);assert.deepEqual(after.lenses,before.lenses);
 for(const old of before.bodies)assert.deepEqual(body(old.id),old);
 assert.equal(m.canonicalBaselineDigest,sha(archive+'before.json'));assert.equal(m.expectedCanonicalDigest,sha(archive+'after.json'));
 assert.equal(m.canonicalBaselineDigest,json(base+'batches/production-panasonic-bodies-004.json').expectedCanonicalDigest);
 assert.equal(j.phase,'canonicalized');assert.equal(j.evidenceDigest,digestValue(e));assert.deepEqual(e.approval,a);
 assert.equal(a.approvedBy.method,'cli-explicit');assert.equal(a.diffDigest,digestValue(e.bundle.diff));assert.deepEqual(a.incomingArtifactDigests,e.bundle.artifactDigests);
 verifyIncoming(e.bundle,before);const replay=proposedCanonical(before,e.bundle,a.decisions,a.productOperations);assert.deepEqual(replay.canonical,after);assert.equal(replay.digest,m.expectedCanonicalDigest);
 assert.equal(validateCanonical(after,e.bundle.vocab),true);assert.equal(validateCanonical(json('src/data/cameraProducts.json'),json(base+'vocab.json')),true);
 for(const id of ids){assert.equal(body(id).price.new.value,null);assert.equal(body(id).price.used.typical,null);}
});

test('Fixed camcorders keep actual and equivalent mm separate, without creating lens products or adding lens weight',()=>{
 const ranges=[[4.12,98.9,25,600,1.8,4],[4.12,98.9,25,600,1.8,4],[8.8,176,24.5,490,2.8,4.5]];
 const args={currentBody:BODY_BY_ID['sony-a7-iv'],currentLenses:[LENS_BY_ID['sony-fe-24-70-gm2']],primaryLens:LENS_BY_ID['sony-fe-24-70-gm2'],pains:['더 가볍고 작은 카메라를 원해요'],subjects:['여행 · 일상'],extraBudget:300};
 const candidates=generateScenarioCandidates(args);
 for(const [n,id]of ids.slice(0,3).entries()){
  const b=body(id),f=b.specs.fixedLens;assert.equal(b.kind,'fixed');assert.equal(b.mount,null);assert.equal(b.bodyStyle,'camcorder');
  assert.deepEqual([f.focal.min,f.focal.max,f.equivalentFocal.min,f.equivalentFocal.max,f.aperture.wide,f.aperture.tele],ranges[n]);
  for(const c of staging(id).claims.filter(c=>/fixedLens\.(focal|equivalentFocal)/.test(c.path))) {assert.equal(c.unit,'mm');assert.equal(c.rawUnit,'mm');}
  const lens=getIntegratedLens(BODY_BY_ID[id]);assert.equal(lens.includedInBodyId,id);assert.equal(lens.weight,null);
  assert.ok(!CAMERA_LENSES.some(l=>l.id.startsWith(id)));
  const scenario=candidates.find(s=>s.targetSystem.body.id===id);assert.ok(scenario,id);
  assert.equal(evaluateScenario(scenario,args).weight.after,BODY_BY_ID[id].weight);
 }
 const aj=body(ids[3]);assert.equal(aj.kind,'interchangeable');assert.equal(aj.mount,'B4');assert.equal(aj.specs.fixedLens,null);assert.equal(getIntegratedLens(BODY_BY_ID[ids[3]]),null);
});

test('B4 bayonet and camcorder shape use truthful minimal vocab extensions, not a compact or existing lens mount',()=>{
 const s=snapshot(),v=context().vocab,entry=v.mounts.find(m=>m.name==='B4');assert.deepEqual(entry.aliases,['B4 lens mount','2/3-type bayonet']);assert.ok(v.bodyStyles.includes('camcorder'));
 for(const id of ids){assert.equal(s.scopeReview[id].scope,'in-scope');assert.equal(s.scopeReview[id].status,'released/current');assert.equal(body(id).bodyStyle,'camcorder');}
 assert.match(s.vocabReview.mount.engineImpact,/B4 lens pool/);assert.match(s.vocabReview.bodyStyle.engineImpact,/UI/);
 const top=[...raws().values()].find(r=>r.url==='https://pro-av.panasonic.net/en/products/aj-cx4000gj/');assert.ok(top);assert.match(top.items[0].observations[0].conditions.identityStructure,/B4 lens mount and shoulder/);
 assert.ok(body(ids[3]).sources.some(s=>s.sourceId===top.sourceId));
});

test('Sensor formats never come from lens-mount image circle; HC-X2 genuine conflict is UNKNOWN and blocks known conflicting claims',()=>{
 for(const id of ids){assert.equal(body(id).specs.sensor.sizeMm,null);assert.equal(body(id).specs.ibis,null);}
 assert.equal(body(ids[0]).specs.sensor.megapixels,8.29);assert.equal(body(ids[1]).specs.sensor.megapixels,8.29);assert.equal(body(ids[2]).specs.sensor.megapixels,15.03);
 assert.equal(body(ids[2]).specs.sensor.format,null);assert.equal(body(ids[3]).specs.sensor.format,null);assert.equal(body(ids[3]).specs.sensor.megapixels,null);
 const c=claim(ids[2],'specs.sensor.format');assert.deepEqual(c.conditions.reportedClaims.map(c=>c.value),['1/5.8-type High Sensitivity MOS','1.0-type MOS']);
 const bad=structuredClone(staging(ids[2]));let n=0;for(const c of bad.claims.filter(c=>c.path==='specs.sensor.format'))c.value=n++?'1/5.8-type':'1.0-type';
 const result=validateStagingBatch([bad],context());assert.equal(result.valid,false);assert.ok(result.items[0].errors.some(e=>e.code==='CONFLICTING_CLAIM_VALUES'));
 assert.match(claim(ids[3],'specs.sensor.format').conditions.reason,/lens mount\/image-circle, not sensor/);
});

test('Operating and main-unit weights preserve camera configuration, without guessing a missing basis or confusing X2 and X20',()=>{
 const expected=[[484,433,'battery-and-card'],[null,850,null],[2490,2040,'battery-and-card'],[null,3400,null]];
 for(const [n,id]of ids.entries()){const b=body(id);assert.deepEqual([b.specs.weight,b.specs.bodyOnlyWeight,b.specs.weightBasis],expected[n]);assert.equal(claim(id,'specs.bodyOnlyWeight').conditions.weightBasis,'body-only');}
 assert.equal(claim(ids[1],'specs.weight').conditions.reportedWeightG,1500);assert.match(claim(ids[1],'specs.weight').conditions.reason,/card inclusion\/exclusion unstated/);
 assert.match(claim(ids[2],'specs.weight').conditions.configuration,/two SD cards/);assert.match(claim(ids[2],'specs.bodyOnlyWeight').conditions.excludedOtherModel,/HC-X20 2000g\/2430g/);
 assert.match(claim(ids[3],'specs.bodyOnlyWeight').conditions.configuration,/interchangeable lens, battery and optional viewfinder not included/);
});

test('Recording conditions distinguish internal 4:2:0 HEVC from external 4:2:2 and special capture modes',()=>{
 for(const id of ids.slice(1)){const c=claim(id,'specs.video.max');assert.equal(c.value,'4K 59.94p');assert.equal(c.conditions.frameRate,59.94);assert.equal(c.conditions.chroma,'4:2:0');assert.equal(c.conditions.codec,'H.265/HEVC LongGOP');assert.equal(c.conditions.internal,true);assert.equal(c.conditions.bitrateMbps,200);assert.ok(c.conditions.media.length);assert.equal(body(id).specs.video.bitDepth,10);}
 assert.equal(claim(ids[0],'specs.video.max').conditions.actualFractionalFrameRate,null);assert.equal(body(ids[0]).specs.video.max,'4K 30p');assert.equal(body(ids[0]).specs.video.bitDepth,null);
 assert.match(claim(ids[1],'specs.video.max').conditions.alternatives.at(-1).note,/External output/);
 assert.match(claim(ids[3],'specs.video.log').conditions.firmwareCondition,/firmware/);
 assert.equal(body(ids[1]).specs.cardSlots.count,2);assert.equal(body(ids[2]).specs.cardSlots.count,2);assert.equal(body(ids[3]).specs.cardSlots.count,3);
 assert.deepEqual(body(ids[3]).specs.cardSlots.slots[0].media,['expressP2']);assert.deepEqual(body(ids[3]).specs.cardSlots.slots[1].media,['microP2','SDXC']);
});

test('Actual pilot claims enforce LCD, IBIS, weight basis and focal unit gates before approval',()=>{
 assert.equal(validateStagingBatch(stagings(),context()).valid,true);
 for(const [p,change,code]of [
 ['specs.lcd',c=>c.value={mechanism:'invalid'},'INVALID_LCD'],['specs.ibis',c=>c.value=false,'INVALID_IBIS'],
 ['specs.weight',c=>delete c.conditions.weightBasis,'WEIGHT_BASIS_REQUIRED'],['specs.weight',c=>c.conditions.weightBasis='operational','INVALID_WEIGHT_BASIS'],
 ['specs.weight',c=>c.conditions.weightBasis='battery','WEIGHT_BASIS_MISMATCH'],
 ['specs.fixedLens.focal.min',c=>c.rawUnit=null,'UNIT_REQUIRED'],['specs.fixedLens.equivalentFocal.max',c=>c.rawUnit='yard','UNSUPPORTED_UNIT']]){
  const bad=structuredClone(staging(ids[0]));change(bad.claims.find(c=>c.path===p));const r=validateStagingBatch([bad],context());assert.equal(r.valid,false);assert.ok(r.items[0].errors.some(e=>e.code===code),code);
 }
});

test('All source digests and real helper UTC timestamps remain sealed, with correct identity-only summary counts',()=>{
 const s=snapshot(),raw=raws(),diff=json(base+'diffs/'+batch+'.json');assert.equal(raw.size,13);assert.equal(s.rawHelperClockChecks.length,13);
 for(const clock of s.rawHelperClockChecks){const r=raw.get(clock.sourceId);assert.equal(r.accessedAt,clock.accessedAt);assert.match(r.accessedAt,/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);assert.equal(new Date(r.accessedAt).toISOString(),r.accessedAt);assert.ok(Date.parse(r.accessedAt)>=Date.parse(clock.helperBefore));assert.ok(Date.parse(r.accessedAt)<=Date.parse(clock.helperAfter));assert.equal(r.contentDigest,digestValue(r.evidenceExcerpt));}
 for(const item of manifest().items){assert.equal(item.stagingDigest,digestValue(staging(item.productId)));assert.equal(body(item.productId).sources.length,item.sourceIds.length);const d=diff.items.find(d=>d.productId===item.productId);assert.match(formatCanonicalDiff(d),new RegExp(`fields / ${item.sourceIds.length} sources`));for(const [n,id]of item.sourceIds.entries())assert.equal(item.rawDigests[n],digestValue(raw.get(id)));}
});

test('Independent real worker attempts are checkpointed and only seven unprocessed camcorders remain',()=>{
 const s=snapshot();assert.equal(s.workerTasks.length,4);assert.deepEqual(s.workerTasks.map(t=>t.productId),ids);let count=0;
 for(const task of s.workerTasks){assert.ok(task.attempts.length>=1&&task.attempts.length<=2);assert.equal(task.attempts.at(-1).status,'success');for(const a of task.attempts){count++;assert.equal(a.usage.totalTokens,a.usage.inputTokens+a.usage.outputTokens);assert.equal(a.applied,false);}}
 assert.equal(count,5);assert.equal(s.workerTasks[2].attempts[0].status,'needs_information');assert.equal(s.batchCheckpoint.gate,'canonicalized');assert.equal(s.batchCheckpoint.expectedRemaining.camcorder,7);
 assert.deepEqual(s.batchCheckpoint.remainingProducts,['HC-V900','HC-VX1','AG-CX370','HC-X1200','HC-X2100','HC-X1600','HC-X20']);
 for(const key of ['vx3','cx20','x2','cx4000'])assert.equal(existsSync(new URL('.cheap-worker-panasonic005-'+key+'.txt',root)),false);
});
