import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {proposedCanonical,verifyIncoming,validateCanonical,validateSpecValue} from '../scripts/objective/merge.mjs';
import {digestValue,formatCanonicalDiff,validateStagingBatch} from '../scripts/objective/rules.mjs';
import {BODY_BY_ID,LENS_BY_ID,CAMERA_LENSES,getIntegratedLens} from '../src/cameraData.js';
import {generateScenarioCandidates,evaluateScenario} from '../src/cameraScenarioEngine.js';
const root=new URL('../',import.meta.url),base='src/data/ingestion/',batch='production-om-system-bodies-001',archive=base+'transactions/'+batch+'/';
const bytes=p=>readFileSync(new URL(p,root)),json=p=>JSON.parse(bytes(p)),sha=p=>createHash('sha256').update(bytes(p)).digest('hex');
const ids=['om-1-ii','om-3','om-5-ii','om-e-m10-iv','om-1','om-5','om-e-m1-iii','om-e-p7','om-tg7'];
const snapshot=()=>json(base+'om-system-current-2026-10-08.json'),manifest=()=>json(base+'batches/'+batch+'.json');
const stagings=()=>manifest().items.map(i=>json(base+'staging/'+batch+'/'+i.itemKey+'.json'));
const staging=id=>stagings().find(s=>s.product.id===id),claim=(id,path)=>staging(id).claims.find(c=>c.path===path);
const body=id=>json(archive+'after.json').bodies.find(b=>b.id===id);
const raws=()=>new Map(manifest().items.flatMap(i=>i.sourceIds).map(id=>[id,json(base+'raw/'+id+'.json')]));
const context=()=>({canonical:json(archive+'before.json'),vocab:json(archive+'evidence.json').bundle.vocab,rawDocuments:raws()});

test('OM current model-card inventory separates future PEN, infrared ASTRO and archived Olympus identities',()=>{
 const s=snapshot();assert.deepEqual(s.countsAtStart,{officialCards:12,baseIdentities:12,releasedCurrentInScope:9,releasedCurrentIncludingDeferred:11,announcedUpcoming:1,linkedVariants:0,deferredSpecial:2,existingCanonicalCurrent:2,productionUnprocessedReleasedCurrent:9});
 assert.equal(s.cards.length,12);assert.equal(new Set(s.cards.map(c=>c.manufacturerModelCode)).size,12);assert.deepEqual(s.selected,ids);
 const ordinary=s.cards.filter(c=>c.classification==='released/current');assert.equal(ordinary.length,9);assert.ok(ordinary.every(c=>c.releaseDate<=s.snapshotDate&&c.status==='canonicalized'));
 const future=s.cards.find(c=>c.cardKey==='pen-upcoming');assert.equal(future.releaseEvidence,'2026年10月下旬');assert.equal(future.classification,'announced/upcoming');assert.equal(future.canonicalId,null);
 const astro=s.cards.filter(c=>c.classification==='deferred-special-category');assert.equal(astro.length,2);assert.ok(astro.every(c=>c.availabilityStatus==='released-current'&&c.canonicalId===null&&c.releaseDate<=s.snapshotDate));
 assert.ok(s.cards.some(c=>c.manufacturerModelCode==='E-M1 Mark III'&&c.classification==='released/current'));assert.equal(s.cards.filter(c=>c.cardKey==='tg7').length,1);
 assert.match(s.denominatorPolicy,/JP official/);assert.match(s.denominatorPolicy,/not a Korea/);
 const scope=json(base+'catalog-scope.json');for(const c of astro){const e=scope.entries.find(e=>e.brand==='OM System'&&e.model===c.manufacturerModelCode);assert.equal(e.scopeStatus,'deferred-special-category');assert.match(e.reason,/IR-cut/);assert.ok(e.officialSources.includes(c.officialUrl));}
});

test('One OM atomic transaction adds seven and reinforces two without touching other cameras, lenses or prices',()=>{
 const before=json(archive+'before.json'),after=json(archive+'after.json'),m=manifest(),e=json(archive+'evidence.json'),a=json(base+'approvals/'+batch+'.json'),j=json(archive+'journal.json');
 assert.equal(before.bodies.length,146);assert.equal(after.bodies.length,153);assert.equal(after.lenses.length,36);assert.deepEqual(after.lenses,before.lenses);
 for(const old of before.bodies){const current=body(old.id);if(!['om-1-ii','om-5'].includes(old.id))assert.deepEqual(current,old);else{for(const key of ['id','name','brand','model','series','aliases','mount','kind','bodyStyle','price'])assert.deepEqual(current[key],old[key]);}}
 assert.deepEqual(m.items.map(i=>i.productId),ids);assert.ok(m.items.every(i=>i.state==='canonicalized'));assert.equal(m.canonicalBaselineDigest,sha(archive+'before.json'));assert.equal(m.expectedCanonicalDigest,sha(archive+'after.json'));assert.equal(m.canonicalBaselineDigest,json(base+'batches/production-panasonic-bodies-006.json').expectedCanonicalDigest);
 assert.equal(j.phase,'canonicalized');assert.equal(j.evidenceDigest,digestValue(e));assert.deepEqual(e.approval,a);assert.equal(a.approvedBy.method,'cli-explicit');assert.equal(a.diffDigest,digestValue(e.bundle.diff));
 verifyIncoming(e.bundle,before);const r=proposedCanonical(before,e.bundle,a.decisions,a.productOperations);assert.deepEqual(r.canonical,after);assert.equal(r.digest,m.expectedCanonicalDigest);assert.equal(validateCanonical(after,e.bundle.vocab),true);assert.equal(validateCanonical(json('src/data/cameraProducts.json'),json(base+'vocab.json')),true);
 for(const id of ids){assert.equal(body(id).price.new.value,null);assert.equal(body(id).price.used.typical,null);}
});

test('Existing MP precision changes require explicit review; no incoming source value conflict is silently accepted',()=>{
 const d=json(base+'diffs/'+batch+'.json'),a=json(base+'approvals/'+batch+'.json');const conflicts=d.items.flatMap(i=>i.changes.filter(c=>c.category==='value-conflict').map(c=>({...c,productId:i.productId})));
 assert.deepEqual(conflicts.map(c=>[c.productId,c.path,c.canonicalValue,c.incomingValue]),[['om-1-ii','specs.sensor.megapixels',20.4,20.37],['om-5','specs.sensor.megapixels',20.4,20.37]]);assert.match(a.approvalReason,/20.4/);assert.match(a.approvalReason,/20.37/);
 for(const c of conflicts)assert.ok(a.decisions.some(d=>d.claimId===c.claimId&&d.action==='accept'&&d.category==='value-conflict'));
 for(const id of ['om-1-ii','om-5']){const d=json(base+'diffs/'+batch+'.json').items.find(i=>i.productId===id);assert.equal(d.changes.filter(c=>c.category==='same-value/new-evidence').length,3);assert.ok(d.changes.some(c=>c.category==='null-fill'));}
 const bad=structuredClone(staging('om-3')),c=structuredClone(claim('om-3','specs.sensor.megapixels'));c.claimId='claim-deliberate-conflict';c.value=40;bad.claims.push(c);const result=validateStagingBatch([bad],context());assert.equal(result.valid,false);assert.ok(result.items[0].errors.some(e=>e.code==='CONFLICTING_CLAIM_VALUES'));
});

test('MFT reuse preserves eight distinct identities and native effective pixels rather than total/composite output',()=>{
 for(const id of ids.slice(0,-1)){const b=body(id);assert.equal(b.brand,'OM System');assert.equal(b.mount,'Micro Four Thirds');assert.equal(b.kind,'interchangeable');assert.deepEqual(b.specs.sensor.sizeMm,[17.4,13]);assert.equal(b.specs.sensor.megapixels,['om-e-m10-iv','om-e-p7'].includes(id)?20.3:20.37);assert.equal(claim(id,'specs.sensor.megapixels').conditions.notTotalOrComposite,true);assert.equal(b.specs.fixedLens,null);}
 assert.match(body('om-e-p7').name,/OLYMPUS PEN/);assert.match(body('om-e-m1-iii').name,/OLYMPUS/);assert.notEqual(body('om-5').id,body('om-5-ii').id);assert.notEqual(body('om-1').id,body('om-1-ii').id);
 const c=claim('om-1-ii','specs.sensor.megapixels');assert.ok(c.conditions.computationalModesNotSensorMP.some(s=>s.includes('80M')));assert.ok(c.conditions.computationalModesNotSensorMP.some(s=>s.includes('ライブND')));
});

test('Body IBIS never inherits SyncIS stops or peripheral/axis test interpretation',()=>{
 const stops=[8.5,6.5,6.5,4.5,7,6.5,7,4.5,2.5];for(const [i,id]of ids.entries()){assert.equal(body(id).specs.ibis.stops,stops[i]);assert.equal(body(id).specs.ibis.axes,id==='om-tg7'?null:5);assert.equal(body(id).specs.ibis.present,true);assert.equal(claim(id,'specs.ibis').conditions.ratingScope,'body-only');}
 for(const id of ['om-3','om-5-ii']){const c=claim(id,'specs.ibis');assert.equal(c.conditions.peripheralStops,5.5);assert.equal(c.conditions.syncIS.combinedStops,7.5);assert.equal(c.conditions.syncIS.peripheralStops,6.5);assert.equal(c.conditions.syncIS.notBodyOnly,true);assert.match(c.conditions.testLens,/CIPA2024/);}
 assert.equal(claim('om-1','specs.ibis').conditions.syncIS.combinedStops,8);assert.equal(claim('om-5','specs.ibis').conditions.syncIS.combinedStops,7.5);
 assert.match(claim('om-tg7','specs.ibis').conditions.unknownAxes,/does not prove/);
});

test('Mechanical/electronic rates retain mode restrictions and never consume ProCapture buffer counts',()=>{
 const rates=[[10,120],[6,120],[6,30],[8.7,15],[10,120],[10,30],[15,60],[8.7,15],[null,20]];
 for(const [i,id]of ids.entries()){assert.deepEqual([body(id).specs.burst.maxMechanicalFps??null,body(id).specs.burst.maxElectronicFps],rates[i]);const c=claim(id,'specs.burst.maxElectronicFps');assert.equal(c.conditions.proCaptureNotSustained,true);assert.ok(c.conditions.sourceWording);}
 for(const id of ['om-1-ii','om-3','om-5-ii'])assert.equal(claim(id,'specs.burst.maxElectronicFps').conditions.firstFrameAfAeLocked,true);
 assert.match(claim('om-tg7','specs.burst.maxElectronicFps').conditions.wormRestriction,/disable/);
});

test('Exact verified video rates stay independent of JP labels, PCM audio bits and external RAW',()=>{
 for(const id of ['om-1-ii','om-3','om-1']){const b=body(id),c=claim(id,'specs.video.max');assert.equal(b.specs.video.max,'C4K 59.94p');assert.equal(b.specs.video.bitDepth,10);assert.equal(c.conditions.frameRate,59.94);assert.equal(c.conditions.officialRateLabel,'60p');assert.equal(c.conditions.internal,true);assert.equal(c.conditions.codec,'HEVC/H.265');assert.equal(c.conditions.chroma,'4:2:0');assert.equal(c.conditions.bitrateMbps,152);}
 assert.equal(body('om-5-ii').specs.video.max,'C4K 24p');assert.equal(body('om-5-ii').specs.video.bitDepth,8);assert.equal(claim('om-5-ii','specs.video.max').conditions.actualFractionalFrameRate,24);
 for(const id of ['om-5','om-e-m1-iii','om-e-m10-iv','om-e-p7','om-tg7']){assert.equal(claim(id,'specs.video.max').conditions.actualFractionalFrameRate,null);assert.equal(body(id).specs.video.bitDepth??null,null);}
 for(const id of ids){assert.equal(body(id).specs.video.cropAtMax??null,null);assert.match(claim(id,'specs.video.max').conditions.conditions,/external HDMI RAW is separate/);}
});

test('Fixed Tough TG7 lens uses actual/equivalent mm once and remains compatible with existing scenario consumer',()=>{
 const b=body('om-tg7');assert.equal(b.kind,'fixed');assert.equal(b.mount,null);assert.equal(b.bodyStyle,'compact');assert.deepEqual(b.specs.fixedLens,{focal:{min:4.5,max:18},equivalentFocal:{min:25,max:100},aperture:{wide:2,tele:4.9}});assert.equal(b.specs.sensor.format,'1/2.33-inch');assert.equal(b.specs.sensor.sizeMm,null);
 for(const c of staging(b.id).claims.filter(c=>/fixedLens\.(focal|equivalentFocal)/.test(c.path))){assert.equal(c.unit,'mm');assert.equal(c.rawUnit,'mm');}
 const integrated=getIntegratedLens(BODY_BY_ID[b.id]);assert.equal(integrated.includedInBodyId,b.id);assert.equal(integrated.weight,null);assert.ok(!CAMERA_LENSES.some(l=>l.id.startsWith(b.id)));
 const args={currentBody:BODY_BY_ID['sony-a7-iv'],currentLenses:[LENS_BY_ID['sony-fe-24-70-gm2']],primaryLens:LENS_BY_ID['sony-fe-24-70-gm2'],pains:['더 가볍고 작은 카메라를 원해요'],subjects:['여행 · 일상'],extraBudget:300};const scenario=generateScenarioCandidates(args).find(s=>s.targetSystem.body.id===b.id);assert.ok(scenario);assert.equal(evaluateScenario(scenario,args).weight.after,249);
});

test('Mass basis, IP lens conditions and UNKNOWN UI-independent hardware remain explicit',()=>{
 const weights=[[599,511],[496,413],[418,370],[383,335],[599,511],[414,366],[580,504],[337,289],[249,222]];
 for(const [i,id]of ids.entries()){assert.deepEqual([body(id).specs.weight,body(id).specs.bodyOnlyWeight],weights[i]);assert.equal(body(id).specs.weightBasis,'battery-and-card');assert.equal(claim(id,'specs.weight').conditions.weightBasis,'battery-and-card');assert.equal(claim(id,'specs.bodyOnlyWeight').conditions.weightBasis,'body-only');assert.equal(body(id).specs.autofocus.aiUnit??null,null);}
 for(const id of ['om-1-ii','om-3','om-5-ii','om-1','om-5'])assert.match(claim(id,'specs.weatherSealing').conditions.officialRating,/IP53 with IP53 lens; IPX1/);
 assert.match(claim('om-e-m1-iii','specs.weatherSealing').conditions.officialRating,/IPX1/);assert.match(claim('om-tg7','specs.weatherSealing').conditions.officialRating,/IPX8.*IP6X/);
 for(const id of ['om-1-ii','om-3','om-5-ii','om-1','om-5','om-e-m1-iii'])assert.equal(body(id).specs.lcd.mechanism,null);
 for(const id of ['om-3','om-5-ii','om-e-m10-iv','om-5','om-e-p7','om-tg7'])assert.equal(body(id).specs.cardSlots,null);
 assert.deepEqual(body('om-e-m1-iii').specs.cardSlots.slots.map(s=>s.standards),[['UHS-I','UHS-II'],['UHS-I']]);
});

test('OM new strict claims and common approval contract retain all existing validation blockers',()=>{
 assert.equal(validateStagingBatch(stagings(),context()).valid,true);
 for(const [path,change,code]of [['specs.weight',c=>delete c.conditions.weightBasis,'WEIGHT_BASIS_REQUIRED'],['specs.weight',c=>c.conditions.weightBasis='operational','INVALID_WEIGHT_BASIS'],['specs.weight',c=>c.conditions.weightBasis='battery','WEIGHT_BASIS_MISMATCH'],['specs.ibis',c=>c.value=true,'INVALID_IBIS'],['specs.lcd',c=>c.value={mechanism:'two-axis'},'INVALID_LCD'],['specs.video.cropAtMax',c=>c.value=1.0,'INVALID_CROP_AT_MAX'],['specs.fixedLens.focal.min',c=>c.rawUnit=null,'UNIT_REQUIRED'],['specs.fixedLens.equivalentFocal.max',c=>c.rawUnit='yard','UNSUPPORTED_UNIT']]){const bad=structuredClone(staging('om-tg7'));change(bad.claims.find(c=>c.path===path));const r=validateStagingBatch([bad],context());assert.equal(r.valid,false);assert.ok(r.items[0].errors.some(e=>e.code===code),code);}
 assert.doesNotThrow(()=>validateSpecValue(false,'specs.video.cropAtMax'));assert.throws(()=>validateSpecValue(1,'specs.video.cropAtMax'),/Invalid boolean/);
});

test('Twenty-two official raw sources retain real helper UTC times and sealed source/claim digests',()=>{
 const raw=raws(),s=snapshot(),diff=json(base+'diffs/'+batch+'.json');assert.equal(raw.size,22);assert.equal(s.rawHelperClockChecks.length,22);
 for(const clock of s.rawHelperClockChecks){const r=raw.get(clock.sourceId);assert.equal(r.accessedAt,clock.accessedAt);assert.match(r.accessedAt,/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);assert.equal(new Date(r.accessedAt).toISOString(),r.accessedAt);assert.ok(Date.parse(r.accessedAt)>=Date.parse(clock.helperBefore));assert.ok(Date.parse(r.accessedAt)<=Date.parse(clock.helperAfter));assert.equal(r.contentDigest,digestValue(r.evidenceExcerpt));assert.equal(r.sourceType,'manufacturer');assert.ok(new URL(r.url).hostname.endsWith('.omsystem.com'));}
 for(const item of manifest().items){const count=['om-1-ii','om-3','om-5-ii','om-1'].includes(item.productId)?3:2;assert.equal(item.sourceIds.length,count);assert.match(formatCanonicalDiff(diff.items.find(i=>i.productId===item.productId)),new RegExp('fields / '+count+' sources'));assert.equal(item.stagingDigest,digestValue(staging(item.productId)));for(const [n,id]of item.sourceIds.entries())assert.equal(item.rawDigests[n],digestValue(raw.get(id)));}
});

test('Nine independent real worker tasks keep one bounded retry, information warning and every token cost',()=>{
 const s=snapshot();assert.deepEqual(s.workerTasks.map(t=>t.productId),ids);const total={inputTokens:0,outputTokens:0,totalTokens:0};let count=0;
 for(const task of s.workerTasks){assert.ok(task.attempts.length>=1&&task.attempts.length<=2);for(const a of task.attempts){count++;assert.equal(a.usage.totalTokens,a.usage.inputTokens+a.usage.outputTokens);assert.equal(a.applied,false);for(const k of Object.keys(total))total[k]+=a.usage[k];}}
 assert.equal(count,10);assert.equal(s.workerTasks[0].attempts[0].status,'needs_information');assert.equal(s.workerTasks.at(-1).attempts[0].status,'failure');assert.equal(s.workerTasks.at(-1).attempts[1].status,'success');assert.deepEqual(total,{inputTokens:17256,outputTokens:6738,totalTokens:23994});assert.deepEqual(s.workerTotals,total);
 for(const key of ['om1ii','om3','om5ii','em10iv','om1','om5','em1iii','ep7','tg7'])assert.equal(existsSync(new URL('.cheap-worker-om001-'+key+'.txt',root)),false);
});

test('OM checkpoint leaves no ordinary current ingestion pending and directs next session to coverage audit',()=>{
 const s=snapshot();assert.equal(s.batchCheckpoint.gate,'canonicalized');assert.equal(s.batchCheckpoint.remainingReleasedCurrent,0);assert.equal(s.batchCheckpoint.announcedUpcoming,1);assert.equal(s.batchCheckpoint.deferredSpecial,2);assert.equal(s.batchCheckpoint.reapply.status,'already-canonicalized');assert.equal(s.batchCheckpoint.reapply.canonicalMatches,true);assert.match(s.batchCheckpoint.next,/coverage audit/);
});
