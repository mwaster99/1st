import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,existsSync} from 'node:fs';
import {proposedCanonical,validateCanonical,verifyIncoming,validateSpecValue} from '../scripts/objective/merge.mjs';
import {digestValue,formatCanonicalDiff,validateStagingBatch} from '../scripts/objective/rules.mjs';
import {BODY_BY_ID,LENS_BY_ID,getIntegratedLens,CAMERA_LENSES} from '../src/cameraData.js';
import {generateScenarioCandidates,evaluateScenario} from '../src/cameraScenarioEngine.js';
const root=new URL('../',import.meta.url),base='src/data/ingestion/',batch='production-panasonic-bodies-006',archive=base+'transactions/'+batch+'/';
const bytes=p=>readFileSync(new URL(p,root)),json=p=>JSON.parse(bytes(p)),sha=p=>createHash('sha256').update(bytes(p)).digest('hex');
const ids=['panasonic-v900','panasonic-vx1','panasonic-cx370','panasonic-x1200','panasonic-x2100','panasonic-x1600','panasonic-x20'];
const manifest=()=>json(base+'batches/'+batch+'.json'),snapshot=()=>json(base+'panasonic-camcorder-current-2026-10-08.json');
const stagings=()=>manifest().items.map(i=>json(base+'staging/'+batch+'/'+i.itemKey+'.json'));
const staging=id=>stagings().find(s=>s.product.id===id),claim=(id,p)=>staging(id).claims.find(c=>c.path===p);
const body=id=>json(archive+'after.json').bodies.find(p=>p.id===id);
const raws=()=>new Map(manifest().items.flatMap(i=>i.sourceIds).map(id=>[id,json(base+'raw/'+id+'.json')]));
const context=()=>({canonical:json(archive+'before.json'),vocab:json(archive+'evidence.json').bundle.vocab,rawDocuments:raws()});

test('Camcorder006 preserves 139 bodies and 36 lenses in one seven-product sealed atomic replay',()=>{
 const m=manifest(),before=json(archive+'before.json'),after=json(archive+'after.json'),e=json(archive+'evidence.json'),a=json(base+'approvals/'+batch+'.json'),j=json(archive+'journal.json');
 assert.deepEqual(m.items.map(i=>i.productId),ids);assert.ok(m.items.every(i=>i.state==='canonicalized'));
 assert.equal(before.bodies.length,139);assert.equal(after.bodies.length,146);assert.equal(after.lenses.length,36);assert.deepEqual(after.lenses,before.lenses);
 for(const old of before.bodies)assert.deepEqual(body(old.id),old);
 assert.equal(m.canonicalBaselineDigest,sha(archive+'before.json'));assert.equal(m.expectedCanonicalDigest,sha(archive+'after.json'));
 assert.equal(m.canonicalBaselineDigest,json(base+'batches/production-panasonic-bodies-005.json').expectedCanonicalDigest);
 assert.equal(j.phase,'canonicalized');assert.equal(j.evidenceDigest,digestValue(e));assert.deepEqual(e.approval,a);
 assert.equal(a.approvedBy.method,'cli-explicit');assert.equal(a.diffDigest,digestValue(e.bundle.diff));assert.deepEqual(a.incomingArtifactDigests,e.bundle.artifactDigests);
 verifyIncoming(e.bundle,before);const replay=proposedCanonical(before,e.bundle,a.decisions,a.productOperations);assert.deepEqual(replay.canonical,after);assert.equal(replay.digest,m.expectedCanonicalDigest);
 assert.equal(validateCanonical(after,e.bundle.vocab),true);assert.equal(validateCanonical(json('src/data/cameraProducts.json'),json(base+'vocab.json')),true);
 for(const id of ids){assert.equal(body(id).price.new.value,null);assert.equal(body(id).price.used.typical,null);}
});

test('Seven fixed camcorders keep actual and equivalent mm independent without a separate lens or double weight',()=>{
 const args={currentBody:BODY_BY_ID['sony-a7-iv'],currentLenses:[LENS_BY_ID['sony-fe-24-70-gm2']],primaryLens:LENS_BY_ID['sony-fe-24-70-gm2'],pains:['더 가볍고 작은 카메라를 원해요'],subjects:['여행 · 일상'],extraBudget:300};const candidates=generateScenarioCandidates(args);
 for(const id of ids){const b=body(id),f=b.specs.fixedLens;assert.equal(b.kind,'fixed');assert.equal(b.mount,null);assert.equal(b.bodyStyle,'camcorder');
 const big=['panasonic-cx370','panasonic-x20'].includes(id);assert.deepEqual([f.focal.min,f.focal.max,f.equivalentFocal.min,f.equivalentFocal.max,f.aperture.wide,f.aperture.tele],big?[8.8,176,24.5,490,2.8,4.5]:[4.12,98.9,25,600,1.8,4]);
 for(const c of staging(id).claims.filter(c=>/fixedLens\.(focal|equivalentFocal)/.test(c.path))){assert.equal(c.unit,'mm');assert.equal(c.rawUnit,'mm');}
 const l=getIntegratedLens(BODY_BY_ID[id]);assert.equal(l.includedInBodyId,id);assert.equal(l.weight,null);assert.ok(!CAMERA_LENSES.some(l=>l.id.startsWith(id)));
 const scenario=candidates.find(s=>s.targetSystem.body.id===id);assert.ok(scenario,id);assert.equal(evaluateScenario(scenario,args).weight.after,BODY_BY_ID[id].weight);
 }
});

test('Shared manual weights and optional accessories never leak between model columns',()=>{
 const expected=[[484,433,'battery-and-card'],[null,428,null],[null,1900,null],[null,800,null],[null,850,null],[null,850,null],[2430,2000,'battery-and-card']];
 for(const [n,id]of ids.entries()){const b=body(id);assert.deepEqual([b.specs.weight,b.specs.bodyOnlyWeight,b.specs.weightBasis],expected[n]);assert.equal(claim(id,'specs.bodyOnlyWeight').conditions.weightBasis,'body-only');}
 for(const id of ids.slice(2,6)){assert.ok(claim(id,'specs.weight').conditions.reportedWeightG);assert.equal(claim(id,'specs.weight').value,null);}
 assert.match(claim('panasonic-x20','specs.weight').conditions.configuration,/two SD cards/);
 assert.deepEqual(body('panasonic-x1200').specs.dimensions,[129,93,209]);assert.deepEqual(body('panasonic-x1600').specs.dimensions,[129,93,267]);assert.deepEqual(body('panasonic-x2100').specs.dimensions,[129,159,267]);assert.equal(body('panasonic-x2').specs.weight,2490);
});

test('Internal recording matrix preserves consumer and model-specific MP4/MOV and chroma conditions',()=>{
 assert.equal(body(ids[0]).specs.video.max,'FHD 60p');assert.equal(body(ids[1]).specs.video.max,'4K 30p');
 for(const id of ids.slice(0,2)){assert.equal(claim(id,'specs.video.max').conditions.actualFractionalFrameRate,null);assert.equal(body(id).specs.video.bitDepth,null);}
 for(const id of ids.slice(2)){const c=claim(id,'specs.video.max');assert.equal(c.value,'4K 59.94p');assert.equal(c.conditions.frameRate,59.94);assert.equal(c.conditions.internal,true);assert.equal(c.conditions.chroma,'4:2:0');assert.equal(body(id).specs.video.bitDepth,10);assert.equal(c.conditions.bitrateMbps,id==='panasonic-x1200'?100:200);assert.equal(c.conditions.fileFormat,id==='panasonic-x1200'?'MP4':'MOV');assert.equal(body(id).specs.cardSlots.count,2);}
 assert.equal(body('panasonic-vx1').specs.cardSlots.count,1);assert.equal(body('panasonic-v900').specs.cardSlots,null);
 assert.equal(body('panasonic-cx370').specs.video.log,true);assert.equal(body('panasonic-cx370').specs.video.cropAtMax,false);assert.equal(body('panasonic-x20').specs.video.log,null);
});

test('Sensor physical size and IBIS remain unknown; X20 official format conflict is blocked rather than guessed',()=>{
 for(const id of ids){assert.equal(body(id).specs.sensor.sizeMm,null);assert.equal(body(id).specs.ibis,null);assert.equal(body(id).specs.sensor.megapixels,['panasonic-cx370','panasonic-x20'].includes(id)?15.03:8.29);}
 assert.equal(body('panasonic-x20').specs.sensor.format,null);assert.equal(claim('panasonic-x20','specs.sensor.format').conditions.reportedClaims.length,2);
 const bad=structuredClone(staging('panasonic-x20'));let n=0;for(const c of bad.claims.filter(c=>c.path==='specs.sensor.format'))c.value=n++?'1.0-type':'1/5.8-type';const r=validateStagingBatch([bad],context());assert.equal(r.valid,false);assert.ok(r.items[0].errors.some(e=>e.code==='CONFLICTING_CLAIM_VALUES'));
});

test('New strict camcorder claims exercise weight, LCD, IBIS and unit blockers; crop numeric is rejected by approval contract',()=>{
 assert.equal(validateStagingBatch(stagings(),context()).valid,true);
 for(const [p,change,code]of [['specs.lcd',c=>c.value={mechanism:'free-angle'},'INVALID_LCD'],['specs.ibis',c=>c.value=false,'INVALID_IBIS'],['specs.weight',c=>delete c.conditions.weightBasis,'WEIGHT_BASIS_REQUIRED'],['specs.weight',c=>c.conditions.weightBasis='operational','INVALID_WEIGHT_BASIS'],['specs.weight',c=>c.conditions.weightBasis='battery','WEIGHT_BASIS_MISMATCH'],['specs.fixedLens.focal.min',c=>c.rawUnit=null,'UNIT_REQUIRED'],['specs.fixedLens.equivalentFocal.max',c=>c.rawUnit='yard','UNSUPPORTED_UNIT']]){const bad=structuredClone(staging(ids[0]));change(bad.claims.find(c=>c.path===p));const r=validateStagingBatch([bad],context());assert.equal(r.valid,false);assert.ok(r.items[0].errors.some(e=>e.code===code),code);}
 assert.throws(()=>validateSpecValue(1,'specs.video.cropAtMax'),/Invalid boolean/);assert.doesNotThrow(()=>validateSpecValue(false,'specs.video.cropAtMax'));
 assert.equal(snapshot().directReview.cropContractGap.correctedValue,false);
});

test('Twenty-one official source digests and actual helper UTC timestamps stay sealed with identity-only counts',()=>{
 const s=snapshot(),raw=raws(),diff=json(base+'diffs/'+batch+'.json');assert.equal(raw.size,21);assert.equal(s.rawHelperClockChecks.length,21);
 for(const clock of s.rawHelperClockChecks){const r=raw.get(clock.sourceId);assert.equal(r.accessedAt,clock.accessedAt);assert.match(r.accessedAt,/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);assert.equal(new Date(r.accessedAt).toISOString(),r.accessedAt);assert.ok(Date.parse(r.accessedAt)>=Date.parse(clock.helperBefore));assert.ok(Date.parse(r.accessedAt)<=Date.parse(clock.helperAfter));assert.equal(r.contentDigest,digestValue(r.evidenceExcerpt));}
 for(const i of manifest().items){assert.equal(i.sourceIds.length,3);assert.equal(body(i.productId).sources.length,3);assert.equal(i.stagingDigest,digestValue(staging(i.productId)));assert.match(formatCanonicalDiff(diff.items.find(d=>d.productId===i.productId)),/fields \/ 3 sources/);for(const [n,id]of i.sourceIds.entries())assert.equal(i.rawDigests[n],digestValue(raw.get(id)));}
});

test('Seven independent real worker tasks include one bounded X20 retry and retain all attempt token costs',()=>{
 const s=snapshot();assert.equal(s.workerTasks.length,7);assert.deepEqual(s.workerTasks.map(t=>t.productId),ids);let count=0;const totals={inputTokens:0,outputTokens:0,totalTokens:0};
 for(const t of s.workerTasks){assert.ok(t.attempts.length>=1&&t.attempts.length<=2);assert.equal(t.attempts.at(-1).status,'success');for(const a of t.attempts){count++;assert.equal(a.usage.totalTokens,a.usage.inputTokens+a.usage.outputTokens);assert.equal(a.applied,false);for(const k of Object.keys(totals))totals[k]+=a.usage[k];}}
 assert.equal(count,8);assert.equal(s.workerTasks.at(-1).attempts[0].status,'failure');assert.deepEqual(totals,{inputTokens:34906,outputTokens:4899,totalTokens:39805});assert.deepEqual(s.workerTotals,totals);
 for(const key of ['v900','vx1','cx370','x1200','x2100','x1600','x20'])assert.equal(existsSync(new URL('.cheap-worker-panasonic006-'+key+'.txt',root)),false);
});

test('All eleven directly-operated camcorders are covered without expanding PTZ/studio or changing pilot vocab',()=>{
 const s=snapshot();assert.equal(s.cards.length,11);assert.ok(s.cards.every(c=>c.status==='canonicalized'));assert.deepEqual(s.selected,ids);assert.equal(s.batchCheckpoint.gate,'canonicalized');assert.equal(s.batchCheckpoint.expectedRemaining.directOperated,0);assert.deepEqual(s.batchCheckpoint.remainingProducts,[]);assert.deepEqual(s.batchCheckpoint.deferred,{PTZ:10,studio:5});
 assert.equal(s.batchCheckpoint.reapply.status,'already-canonicalized');assert.equal(s.batchCheckpoint.reapply.canonicalMatches,true);
 for(const id of ids){assert.equal(s.scopeReview[id].scope,'in-scope');assert.equal(s.scopeReview[id].status,'released/current');}
 assert.deepEqual(context().vocab,json(base+'transactions/production-panasonic-bodies-005/evidence.json').bundle.vocab);
});
