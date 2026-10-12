import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {proposedCanonical,verifyIncoming,validateCanonical,validateSpecValue} from '../scripts/objective/merge.mjs';
import {digestValue,formatCanonicalDiff,validateStagingBatch} from '../scripts/objective/rules.mjs';
import {BODY_BY_ID,LENS_BY_ID,CAMERA_LENSES,getIntegratedLens} from '../src/cameraData.js';
import {buildEquipmentTransition,evaluateScenario,generateLensCandidates} from '../src/cameraScenarioEngine.js';
const root=new URL('../',import.meta.url),base='src/data/ingestion/',batch='production-leica-bodies-001',archive=base+'transactions/'+batch+'/';
const bytes=p=>readFileSync(new URL(p,root)),json=p=>JSON.parse(bytes(p)),sha=p=>createHash('sha256').update(bytes(p)).digest('hex');
const snapshot=()=>json(base+'leica-current-2026-10-12.json'),manifest=()=>json(base+'batches/'+batch+'.json');
const stagings=()=>manifest().items.map(i=>json(base+'staging/'+batch+'/'+i.itemKey+'.json'));
const staging=id=>stagings().find(s=>s.product.id===id),claim=(id,p)=>staging(id).claims.find(c=>c.path===p);
const body=id=>json(archive+'after.json').bodies.find(b=>b.id===id);
const context=()=>({canonical:json(archive+'before.json'),vocab:json(archive+'evidence.json').bundle.vocab,rawDocuments:new Map(manifest().items.flatMap(i=>i.sourceIds).map(id=>[id,json(base+'raw/'+id+'.json')]))});

test('Leica inventory completes pagination and selectors, deduplicates 37 offers into 16 identities',()=>{
 const s=snapshot();assert.equal(s.cards.length,37);assert.equal(new Set(s.cards.map(c=>c.officialUrl)).size,37);assert.equal(new Set(s.cards.map(c=>c.baseIdentity)).size,16);
 assert.equal(s.countsAtStart.releasedCurrentDigital,12);assert.equal(s.countsAtStart.linkedVariantsEditionsKits,21);assert.equal(s.countsAtStart.announcedUpcoming,0);
 assert.equal(s.cards.filter(c=>c.relation==='independent-model').length,16);assert.equal(s.cards.filter(c=>c.cameraCategory==='analog-film'&&c.relation==='independent-model').length,3);assert.equal(s.cards.filter(c=>c.cameraCategory==='instant-hybrid'&&c.relation==='independent-model').length,1);
 assert.equal(s.cards.filter(c=>c.cardKey.includes('kit')).length,8);assert.equal(s.cards.filter(c=>c.cardKey.includes('metal-gray')).length,3);
 for(const key of ['gallery-ko-KR-m-page1','gallery-ko-KR-m-page2','gallery-ko-KR-system-cameras-page1','gallery-ko-KR-system-cameras-page2'])assert.equal(s.collectionFetches.find(f=>f.key===key).status,200);
 assert.match(s.denominatorPolicy,/Retained S landing has no camera product card/);assert.ok(s.cards.every(c=>c.officialUrl.startsWith('https://leica-camera.com/ko-KR/')));
});

test('One Leica atomic batch adds ten and reinforces two; unrelated products, lenses and existing prices stay unchanged',()=>{
 const b=json(archive+'before.json'),a=json(archive+'after.json'),m=manifest(),e=json(archive+'evidence.json'),ap=json(base+'approvals/'+batch+'.json');
 assert.equal(b.bodies.length,153);assert.equal(a.bodies.length,163);assert.equal(a.lenses.length,36);assert.deepEqual(a.lenses,b.lenses);
 assert.equal(m.items.length,12);assert.ok(m.items.every(i=>i.state==='canonicalized'));assert.equal(ap.productOperations.filter(o=>o.operation==='new-product').length,10);assert.equal(ap.approvedBy.method,'cli-explicit');
 for(const old of b.bodies){const current=body(old.id);if(!['leica-q3','leica-sl3'].includes(old.id))assert.deepEqual(current,old);else for(const k of ['id','name','brand','model','series','mount','kind','bodyStyle','aliases','price'])assert.deepEqual(current[k],old[k]);}
 assert.equal(m.canonicalBaselineDigest,sha(archive+'before.json'));assert.equal(m.expectedCanonicalDigest,sha(archive+'after.json'));assert.equal(m.canonicalBaselineDigest,json(base+'batches/production-om-system-bodies-001.json').expectedCanonicalDigest);
 assert.equal(json(archive+'journal.json').phase,'canonicalized');assert.equal(ap.diffDigest,digestValue(e.bundle.diff));verifyIncoming(e.bundle,b);const replay=proposedCanonical(b,e.bundle,ap.decisions,ap.productOperations);assert.deepEqual(replay.canonical,a);assert.equal(replay.digest,m.expectedCanonicalDigest);assert.equal(validateCanonical(a,e.bundle.vocab),true);assert.equal(validateCanonical(json('src/data/cameraProducts.json'),json(base+'vocab.json')),true);
});

test('Leica M official bayonet adds one vocab entry while native L-Mount is reused; no M lens is fabricated',()=>{
 const v=json(base+'vocab.json'),e=json(archive+'evidence.json');assert.equal(v.mounts.filter(m=>m.name==='Leica M').length,1);assert.equal(v.mounts.filter(m=>m.name==='L-Mount').length,1);
 for(const id of snapshot().selected.filter(id=>id.startsWith('leica-m'))){assert.equal(body(id).mount,'Leica M');assert.equal(body(id).kind,'interchangeable');assert.match(claim(id,'specs.autofocus.description').value,/수동 초점 전용/);assert.equal(body(id).specs.fixedLens,null);const raw=Object.values(e.bundle.raws).find(r=>r.items[0].itemKey===id&&r.items[0].observations.some(o=>o.path==='specs.sensor.megapixels'));assert.ok(raw.evidenceScope.includes('Leica'));}
 for(const id of ['leica-sl3','leica-sl3-s','leica-sl3-p'])assert.equal(body(id).mount,'L-Mount');assert.equal(CAMERA_LENSES.filter(l=>l.mount==='Leica M').length,0);
});

test('M11/P/D/Monochrom/EV1 independent workflow identities preserve optical vs electronic finder and explicit no LCD',()=>{
 const ids=['leica-m11','leica-m11-p','leica-m11-d','leica-m11-monochrom','leica-m-ev1'];assert.equal(new Set(ids.map(id=>body(id).id)).size,5);
 for(const id of ids.slice(0,4)){assert.equal(body(id).specs.evf.present,false);assert.equal(body(id).specs.evf.magnification,null);assert.equal(claim(id,'specs.evf').conditions.opticalMagnification,0.73);assert.match(claim(id,'specs.evf').conditions.externalOptionalAccessoryNotBuiltIn,/Visoflex/);}
 assert.equal(body('leica-m-ev1').specs.evf.present,true);assert.equal(body('leica-m-ev1').specs.evf.resolutionDots,5760000);assert.equal(body('leica-m-ev1').specs.evf.maxRefreshHz,60);
 assert.equal(body('leica-m11-d').specs.lcd.present,false);assert.equal(body('leica-m11-d').specs.lcd.sizeInches,null);assert.equal(claim('leica-m11-d','specs.lcd').conditions.phoneDisplayNotBuiltIn,true);
 assert.equal(claim('leica-m11','specs.cardSlots').conditions.internalMemoryGB,64);for(const id of ['leica-m11-p','leica-m11-d','leica-m11-monochrom'])assert.equal(claim(id,'specs.cardSlots').conditions.internalMemoryGB,256);
 assert.ok(ids.every(id=>body(id).specs.cardSlots===null)); // Internal storage and a supported media list do not prove slot count.
});

test('Monochrom sensor identity is independent, native sensor pixels never become DNG/JPEG/composite output pixels',()=>{
 for(const id of ['leica-m11-monochrom','leica-q3-monochrom']){assert.match(body(id).specs.sensor.generation,/Monochrome/);assert.equal(claim(id,'specs.sensor.generation').conditions.dedicatedMonochromeSensor,true);assert.equal(body(id).specs.sensor.megapixels,60.3);}
 const c=claim('leica-m11-monochrom','specs.sensor.megapixels');assert.equal(c.conditions.outputL_DNG,60.4);assert.equal(c.conditions.notOutputResolution,true);
 const p=claim('leica-sl3-p','specs.sensor.megapixels');assert.equal(p.value,44.9);assert.equal(p.conditions.totalMP,45.8);assert.equal(p.conditions.outputL_DNG,44.2);assert.equal(body('leica-sl3-s').specs.sensor.megapixels,24.6);assert.equal(body('leica-d-lux-8').specs.sensor.megapixels,17);
 for(const id of snapshot().selected)assert.equal(body(id).specs.sensor.sizeMm??null,null); // No full-frame -> 36x24 or pixel-pitch-derived dimensions.
});

test('Q and D-Lux fixed optics preserve actual/explicit equivalent mm with no fabricated lens or doubled mass',()=>{
 const expected=[['leica-q3',28,28,1.7,1.7,743],['leica-q3-43',43,43,2,2,772],['leica-q3-monochrom',28,28,1.7,1.7,746],['leica-d-lux-8',10.9,34,1.7,2.8,397]];
 for(const[id,min,max,wide,tele,weight]of expected){const b=body(id),l=b.specs.fixedLens;assert.equal(b.kind,'fixed');assert.equal(b.mount,null);assert.deepEqual(l.focal,{min,max});assert.deepEqual(l.aperture,{wide,tele});assert.equal(b.specs.weight,weight);assert.equal(claim(id,'specs.weight').conditions.wholeFixedLensCamera,true);assert.equal(getIntegratedLens(BODY_BY_ID[id]).weight,null);assert.ok(!CAMERA_LENSES.some(l=>l.includedInBodyId===id));
  for(const path of ['focal.min','focal.max','equivalentFocal.min','equivalentFocal.max'])assert.equal(claim(id,'specs.fixedLens.'+path).unit,'mm');}
 const currentLens=LENS_BY_ID['sony-fe-24-70-gm2'],input={currentBody:BODY_BY_ID['sony-a7-iv'],currentLenses:[currentLens],primaryLens:currentLens,pains:['더 가볍고 작은 카메라를 원해요'],subjects:['여행 · 일상'],extraBudget:300};
 const currentSystem={body:input.currentBody,lenses:[currentLens],primaryLens:currentLens};
 for(const[id,,,,,weight]of expected){const b=BODY_BY_ID[id],l=getIntegratedLens(b);assert.equal(l.includedInBodyId,id);assert.deepEqual(generateLensCandidates({body:b}).map(l=>l.id),[l.id]);const proposed={body:b,lenses:[l],primaryLens:l};const result=evaluateScenario({currentSystem,...buildEquipmentTransition(currentSystem,proposed),purchaseCondition:'used'},input);assert.equal(result.weight.after,weight);assert.equal(result.lensCount.after,0);assert.deepEqual(result.buy.map(i=>i.id),[id]);}
 assert.deepEqual(body('leica-d-lux-8').specs.fixedLens.equivalentFocal,{min:24,max:75});for(const id of ['leica-q3-43','leica-q3-monochrom']){const equivalent=body(id).specs.fixedLens.equivalentFocal;assert.equal(equivalent?.min??null,null);assert.equal(equivalent?.max??null,null);}
 assert.equal(claim('leica-q3','specs.fixedLens.equivalentFocal.min').value,null);assert.equal(body('leica-q3').specs.fixedLens.equivalentFocal.min,28); // Incoming UNKNOWN does not erase existing evidence.
});

test('Battery and bare mass remain scoped by finish; SL bare mass is never converted into an invented operational sum',()=>{
 for(const id of snapshot().selected.filter(id=>!id.startsWith('leica-sl3'))){assert.equal(body(id).specs.weightBasis,'battery');assert.equal(claim(id,'specs.weight').conditions.weightBasis,'battery');assert.equal(claim(id,'specs.bodyOnlyWeight').conditions.weightBasis,'body-only');}
 assert.equal(body('leica-m11-p').specs.weight,530);assert.equal(claim('leica-m11-p','specs.weight').conditions.otherVariantWithBattery,640);
 for(const id of ['leica-sl3','leica-sl3-s','leica-sl3-p']){assert.equal(body(id).specs.weight,null);assert.equal(body(id).specs.weightBasis,null);assert.equal(claim(id,'specs.bodyOnlyWeight').conditions.withoutBodyCap,true);}
 assert.equal(body('leica-sl3').specs.bodyOnlyWeight,769.7);assert.equal(body('leica-sl3').specs.batteryShots,null);assert.equal(claim('leica-sl3','specs.batteryConditions').conditions.adaptedCycleOnly,true);assert.match(body('leica-sl3').specs.batteryConditions,/1350/);
});

test('SL sensor IBIS is a strict object; omission/visual lens compensation are never inferred as body IBIS or false',()=>{
 for(const id of ['leica-sl3','leica-sl3-s','leica-sl3-p']){assert.equal(body(id).specs.ibis.present,true);assert.equal(body(id).specs.ibis.axes,5);assert.equal(body(id).specs.ibis.stops,5);validateSpecValue(body(id).specs.ibis,'specs.ibis');}
 for(const id of snapshot().selected.filter(id=>!id.startsWith('leica-sl3')))assert.equal(body(id).specs.ibis,null);
 for(const id of ['leica-q3','leica-q3-43','leica-q3-monochrom','leica-d-lux-8'])assert.equal(claim(id,'specs.ibis').conditions.lensCompensationNotIBIS,true);
});

test('Video mode metadata preserves OG24p, fractional frame rates, internal recording and no guessed unsupported state',()=>{
 const p=claim('leica-sl3-p','specs.video.max');assert.equal(p.value,'8K OG 24p');assert.equal(p.conditions.frameRate,24);assert.equal(p.conditions.dynamicRangeExpansion,false);assert.equal(p.conditions.fullFrameCropFactor,1);assert.equal(p.conditions.internal,true);assert.equal(body('leica-sl3-p').specs.video.cropAtMax,false);
 for(const id of ['leica-q3','leica-q3-43','leica-q3-monochrom','leica-sl3']){assert.equal(body(id).specs.video.max,'C8K 29.97p');assert.equal(claim(id,'specs.video.max').conditions.frameRate,29.97);assert.equal(claim(id,'specs.video.max').conditions.hdmiAndSlowMotionNotThisMode,true);}
 assert.equal(body('leica-sl3-s').specs.video.max,'6K OG 29.97p');assert.equal(body('leica-d-lux-8').specs.video.bitDepth,8);
 for(const id of snapshot().selected.filter(id=>id.startsWith('leica-m'))){assert.equal(body(id).specs.video.max,null);assert.equal(claim(id,'specs.video.max').conditions.needsExplicitAbsenceEvidence,true);assert.equal(body(id).specs.burst?.maxMechanicalFps??null,null);assert.equal(claim(id,'specs.burst.maxMechanicalFps').conditions.overallHighFps,4.5);}
 assert.equal(claim('leica-sl3','specs.burst.maxElectronicFps').conditions.firstFrameAeAfLocked,true);assert.equal(claim('leica-sl3-p','specs.burst.maxElectronicFps').value,40);
});

test('All current strict gates validate sealed Leica raw/staging and contradictory official claims are rejected',()=>{
 assert.equal(validateStagingBatch(stagings(),context()).valid,true);
 const bad=structuredClone(staging('leica-sl3-p'));const c=structuredClone(claim('leica-sl3-p','specs.sensor.megapixels'));c.claimId='deliberate-conflict';c.value=60;bad.claims.push(c);assert.ok(validateStagingBatch([bad],context()).items[0].errors.some(e=>e.code==='CONFLICTING_CLAIM_VALUES'));
 for(const[path,value,code]of [['specs.ibis',true,'INVALID_IBIS'],['specs.video.cropAtMax',1.11,'INVALID_CROP_AT_MAX']]){const s=structuredClone(staging('leica-sl3-p')),c=s.claims.find(c=>c.path===path);c.value=value;assert.ok(validateStagingBatch([s],context()).items[0].errors.some(e=>e.code===code));}
 const d=json(base+'diffs/'+batch+'.json');assert.ok(d.items.every(i=>i.changes.every(c=>c.category!=='value-conflict')));for(const i of d.items){const count=staging(i.productId).sources.length;assert.match(formatCanonicalDiff(i),new RegExp(' / '+count+' sources'));}
});

test('Raw source timestamps are helper-generated UTC instants within creation window; immutable evidence has coherent digests',()=>{
 const s=snapshot(),ctx=context(),e=json(archive+'evidence.json');assert.equal(ctx.rawDocuments.size,28);
 for(const raw of ctx.rawDocuments.values()){assert.match(raw.accessedAt,/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);assert.ok(Date.parse(raw.accessedAt)>=Date.parse(s.rawHelperTimestampWindow.start));assert.ok(Date.parse(raw.accessedAt)<=Date.parse(s.rawHelperTimestampWindow.end));assert.equal(raw.publisher,'Leica Camera AG');assert.ok(raw.url.startsWith('https://leica-camera.com/'));assert.equal(raw.contentDigest,digestValue(raw.evidenceExcerpt));}
 for(const[p,h]of Object.entries(e.bundle.artifactDigests)){if(['identity-map.json','vocab.json'].includes(p))continue;assert.equal(sha(base+p),h,p);}
});

test('Film and hybrid instant remain adjacent, linked offers never create duplicate canonical digital products',()=>{
 const s=snapshot(),scope=json(base+'catalog-scope.json'),after=json(archive+'after.json');for(const model of ['M6','MP','M-A (Typ 127)','SOFORT 2']){const entry=scope.entries.find(e=>e.brand==='Leica'&&e.model===model);assert.equal(entry.scopeStatus,'adjacent-category');assert.match(entry.reconsideration,/Not permanent exclusion/);assert.ok(!after.bodies.some(b=>b.brand==='Leica'&&b.model===model));}
 assert.equal(after.bodies.filter(b=>b.brand==='Leica').length,12);assert.equal(s.cards.filter(c=>c.status==='canonicalized').length,12);assert.equal(s.cards.filter(c=>c.status==='linked-to-canonicalized-base').length,15);
});

test('Worker ledger keeps independent tasks, bounded retries, unavailable network usage and deleted public fixtures',()=>{
 const s=snapshot(),sum={inputTokens:0,outputTokens:0,totalTokens:0};assert.equal(s.workerTasks.length,12);assert.equal(new Set(s.workerTasks.map(t=>t.stableTaskId)).size,12);let calls=0;
 for(const t of s.workerTasks){assert.ok(t.attempts.length>=1&&t.attempts.length<=2);for(const a of t.attempts){calls++;assert.equal(a.applied,false);if(a.usage){assert.equal(a.usage.inputTokens+a.usage.outputTokens,a.usage.totalTokens);for(const k of Object.keys(sum))sum[k]+=a.usage[k];}}for(const f of t.contextFiles)assert.equal(existsSync(new URL(f,root)),false);}
 assert.equal(calls,16);assert.equal(s.workerStats.retries,4);assert.equal(s.workerStats.usableProducts,10);assert.equal(s.workerUsageUnavailable.length,3);assert.deepEqual(sum,{inputTokens:69950,outputTokens:14895,totalTokens:84845});assert.deepEqual(s.workerTotals,sum);assert.deepEqual(s.workerStats.localFallbackProducts,['leica-m11','leica-sl3-s']);
});

test('Checkpoint is canonicalized with zero ordinary Leica digital products pending and directs audit instead of repeated ingestion',()=>{
 const s=snapshot();assert.equal(s.countsAfter.productionUnprocessedDigital,0);assert.equal(s.batchCheckpoint.gate,'canonicalized');assert.equal(s.batchCheckpoint.reapply.status,'already-canonicalized');assert.equal(s.batchCheckpoint.reapply.canonicalMatches,true);assert.match(s.batchCheckpoint.next,/coverage audit/);assert.ok(s.workerFixturesDeleted);
});
