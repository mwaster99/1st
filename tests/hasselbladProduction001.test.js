import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {validateCanonical,validateSpecValue,verifyIncoming,proposedCanonical} from '../scripts/objective/merge.mjs';
import {digestValue,createSourceId,getAtPath,normalizeSearch,validateStagingBatch,formatCanonicalDiff} from '../scripts/objective/rules.mjs';

const root=new URL('../',import.meta.url),base='src/data/ingestion/',batch='production-hasselblad-bodies-001',tx=base+'transactions/'+batch+'/';
const bytes=p=>readFileSync(new URL(p,root)),json=p=>JSON.parse(bytes(p)),sha=p=>createHash('sha256').update(bytes(p)).digest('hex');
const a=json(base+'hasselblad-current-2026-10-14.json'),e=json(tx+'evidence.json'),before=json(tx+'before.json'),after=json(tx+'after.json');
const body=id=>after.bodies.find(b=>b.id===id),stage=id=>e.bundle.stagings.find(s=>s.product.id===id),claim=(id,path)=>stage(id).claims.find(c=>c.path===path);
const ids=['hasselblad-x2d-ii-100c','hasselblad-907x-cfv-100c'],x=body(ids[0]),m=body(ids[1]);
const context={canonical:before,vocab:e.bundle.vocab,rawDocuments:new Map(Object.entries(e.bundle.raws))};

test('Official Korea current catalog covers exactly two camera configurations and seven lens kits without module inflation',()=>{
 assert.equal(a.startWorkingTree,'clean');assert.deepEqual(a.selected,ids);assert.equal(a.countsAtStart.officialCurrentCameraCards,2);assert.equal(a.countsAtStart.currentBaseIdentities,2);assert.equal(a.countsAtStart.digitalCameraConfigurations,2);assert.equal(a.countsAtStart.modularComponentIdentities,2);assert.equal(a.countsAtStart.linkedCurrentLensKits,7);assert.equal(a.countsAtStart.currentPurchasableSKUOffers,9);
 assert.equal(a.cards.length,2);assert.ok(a.cards.every(c=>c.classification==='released/current'&&c.offerAvailability==='InStock'&&c.state==='canonicalized'));
 assert.equal(a.linkedOffers.length,7);assert.ok(a.linkedOffers.every(o=>o.lensIncluded&&o.productId===ids[0]&&o.relation==='lens-kit'));
 assert.equal(a.officialFetches.find(f=>f.key==='kr-cameras-page2').status,200);assert.equal(a.countsAfter.unprocessedCurrent,0);
});

test('Retained predecessors and editions are not declared current or discontinued merely from remaining pages or missing stock',()=>{
 assert.equal(a.retainedNonCurrent.length,3);assert.equal(a.retainedEditions.length,3);
 const old=a.retainedNonCurrent.find(p=>p.model==='X2D 100C');assert.match(old.classification,/superseded-offer-unavailable/);assert.equal(old.explicitDiscontinued,null);
 for(const p of a.retainedNonCurrent)assert.equal(p.explicitDiscontinued,null);
 assert.ok(a.retainedEditions.every(p=>p.currentOfferConfirmed===false));assert.equal(a.countsAtStart.announcedUpcoming,0);assert.equal(a.countsAtStart.officialExplicitDiscontinuedConfirmed,0);
 assert.equal(a.hSystemReview.retainedReferences.length,4);assert.ok(a.hSystemReview.retainedReferences.every(p=>p.url.includes('/h-system/')&&!p.inKoreaCurrentStoreCatalog));assert.equal(a.hSystemReview.globalCurrentSalesNotRuledOut,true);assert.equal(a.hSystemReview.explicitDiscontinuedConfirmed,false);
});

test('Two new canonical cameras preserve all163 prior bodies,36 lenses,prices and official identity evidence',()=>{
 assert.equal(before.bodies.length,163);assert.equal(after.bodies.length,165);assert.equal(after.lenses.length,36);assert.deepEqual(after.lenses,before.lenses);
 for(const b of before.bodies)assert.deepEqual(after.bodies.find(p=>p.id===b.id),b);
 assert.equal(after.bodies.filter(b=>b.brand==='Hasselblad').length,2);assert.ok(!before.bodies.some(b=>b.brand==='Hasselblad'));
 for(const id of ids){const b=body(id);assert.equal(b.identityEvidence.verification,'verified');assert.equal(b.price.new.value,null);assert.equal(b.price.used.typical,null);assert.equal(b.sources.length,3);assert.equal(b.specs.fixedLens,null);assert.equal(b.kind,'interchangeable');assert.equal(b.mount,'Hasselblad X');}
 assert.ok(e.approval.productOperations.every(o=>o.operation==='new-product'&&o.action==='accept'));
});

test('Hasselblad X/XCD mount is manufacturer qualified, collision free and separate from Fujifilm X',()=>{
 const vocab=json(base+'vocab.json'),h=vocab.mounts.find(m=>m.name==='Hasselblad X'),f=vocab.mounts.find(m=>m.name==='Fujifilm X');assert.deepEqual(h.aliases,['Hasselblad XCD','XCD mount']);assert.ok(f.aliases.includes('X mount'));
 const owners=new Map();for(const m of vocab.mounts)for(const name of [m.name,...m.aliases]){const n=normalizeSearch(name);assert.ok(!owners.has(n)||owners.get(n)===m.name);owners.set(n,m.name);}
 assert.notEqual(h.name,f.name);assert.ok(!h.aliases.includes('X mount'));assert.equal(a.mountDecision.fujifilmMountReused,false);
 const map=json(base+'identity-map.json').entries;for(const id of ids)assert.equal(map.filter(m=>m.manufacturer==='Hasselblad'&&m.productId===id).length,1);
});

test('907X/CFV module identities stay in inventory and never become three whole cameras',()=>{
 assert.equal(a.modules.length,2);assert.ok(a.modules.every(m=>!m.standaloneDigitalCamera&&!m.canonicalProductCreated));assert.equal(a.modules.find(m=>m.module==='907X').sensor,false);assert.equal(a.modules.find(m=>m.module==='CFV 100C').sensor,true);
 assert.equal(a.modularDecision.newRelationSchemaRequiredForThisConfiguration,false);assert.match(a.modularDecision.minimumConfiguration,/907X \+ CFV100C/);assert.equal(a.countsAfter.standaloneModuleProducts,0);assert.equal(a.countsAfter.lensOrKitProducts,0);
 assert.ok(!after.bodies.some(b=>b.brand==='Hasselblad'&&['907X','CFV 100C'].includes(b.model)));
});

test('Medium-format dimensions and reported100MP are explicit and never copied from predecessor102MP/output pixels',()=>{
 for(const id of ids){assert.deepEqual(body(id).specs.sensor.sizeMm,[43.8,32.9]);assert.equal(body(id).specs.sensor.megapixels,100);assert.match(body(id).specs.sensor.generation,/BSI/);const c=claim(id,'specs.sensor.megapixels');assert.equal(c.rawUnit,'MP');assert.equal(c.conditions.notCalculatedFromOutputPixels,true);assert.equal(c.conditions.effectiveVersusTotalNotSeparatelyLabeled,true);}
 assert.equal(claim(ids[1],'specs.sensor.megapixels').conditions.sensorOwner,'CFV 100C');assert.equal(claim(ids[1],'specs.sensor.sizeMm').conditions.sensorOwner,'CFV 100C');
 assert.ok(a.reviewDecisions.sourceDiscrepancies.some(d=>d.datasheetAndManual==='11656x8742'&&d.FAQ==='11656x8472'));
});

test('Assembled907X bare620g and102x92x84 are not back-only460g/body160g or guessed operational mass',()=>{
 assert.equal(m.specs.bodyOnlyWeight,620);assert.equal(m.specs.weight,null);assert.equal(m.specs.weightBasis,null);assert.deepEqual(m.specs.dimensions,[102,92,84]);
 const c=claim(ids[1],'specs.bodyOnlyWeight');assert.equal(c.conditions.weightBasis,'body-only');assert.equal(c.conditions.cameraBodyModuleG,160);assert.equal(c.conditions.digitalBackModuleG,460);assert.equal(c.conditions.officialAssemblyWeightNotCalculated,true);assert.equal(c.conditions.batteryExcluded,true);assert.equal(c.conditions.cardExcluded,true);assert.equal(c.conditions.lensExcluded,true);
 assert.equal(x.specs.weight,840);assert.equal(x.specs.bodyOnlyWeight,730);assert.equal(x.specs.weightBasis,'battery');assert.equal(claim(ids[0],'specs.weight').conditions.weightBasis,'battery');
});

test('Digital-back storage/display/battery ownership is preserved and internal1TB is not an extra card slot',()=>{
 assert.equal(m.specs.cardSlots.count,1);assert.deepEqual(m.specs.cardSlots.slots[0].media,['CFexpress Type B']);const c=claim(ids[1],'specs.cardSlots');assert.equal(c.conditions.internalStorageTB,1);assert.equal(c.conditions.storageOwner,'CFV 100C');assert.equal(c.conditions.internalSSDNotSlot,true);
 assert.equal(claim(ids[1],'specs.lcd').conditions.displayOwner,'CFV 100C');assert.equal(claim(ids[1],'specs.batteryShots').conditions.batteryOwner,'CFV 100C');assert.equal(m.specs.batteryShots,420);assert.equal(x.specs.batteryShots,327);assert.equal(claim(ids[0],'specs.batteryShots').conditions.alternativeShots,466);
});

test('X2DII10stop centre/8edge CIPA IBIS and strict display are not copied to907X',()=>{
 validateSpecValue(x.specs.ibis,'specs.ibis');validateSpecValue(x.specs.lcd,'specs.lcd');assert.equal(x.specs.ibis.axes,5);assert.equal(x.specs.ibis.stops,10);assert.match(x.specs.ibis.conditions,/8 stops edges/);assert.match(x.specs.ibis.conditions,/120 Macro/);
 assert.equal(m.specs.ibis,null);assert.equal(m.specs.evf,null);assert.equal(x.specs.evf.resolutionDots,5760000);assert.equal(x.specs.lcd.mechanism,'tilt');assert.equal(m.specs.lcd.mechanism,'tilt');assert.equal(m.specs.lcd.sizeInches,3.2);
});

test('In-lens mechanical speed and generic fps stay conditional, electronic body speed is explicit',()=>{
 for(const id of ids){const b=body(id);assert.equal(b.specs.shutter.mechanical??null,null);assert.equal(b.specs.shutter.fastestMechanicalSec??null,null);assert.equal(b.specs.shutter.electronic,true);assert.equal(b.specs.shutter.fastestElectronicSec,0.000167);assert.equal(claim(id,'specs.shutter.fastestElectronicSec').rawValue,1/6000);assert.equal(claim(id,'specs.shutter.mechanical').conditions.mechanicalShutterOwner,'compatible lens');assert.equal(b.specs.burst?.maxMechanicalFps??null,null);assert.equal(b.specs.burst?.maxElectronicFps??null,null);}
 assert.equal(claim(ids[0],'specs.burst.maxMechanicalFps').conditions.genericCaptureFps,3);assert.equal(claim(ids[1],'specs.burst.maxMechanicalFps').conditions.genericCaptureFps,3.3);
});

test('907X native AF and V/technical manual-focus interface conditions remain source scoped',()=>{
 const cs=stage(ids[1]).claims.filter(c=>c.path==='specs.autofocus.description');assert.equal(cs.length,2);assert.equal(cs[0].value,cs[1].value);const manual=cs.find(c=>c.conditions.VSystemAndTechnicalCameraManualFocusOnly);assert.ok(e.bundle.raws[manual.sourceId].url.includes('/manuals/'));assert.equal(manual.conditions.VOrXPanLensOn907XElectronicShutterOnly,true);
 assert.equal(a.vSystemCompatibility.autofocusOnVFilmBodies,false);assert.equal(claim(ids[0],'specs.autofocus.description').conditions.afCWithElectronicShutter,false);assert.equal(claim(ids[0],'specs.autofocus.description').conditions.requiresLatestLensFirmware,true);
});

test('Still14/16bit and absence-based worker suggestions never become no-video or movie data',()=>{
 for(const id of ids){assert.equal(body(id).specs.video.max,null);assert.equal(body(id).specs.video.bitDepth,null);assert.equal(body(id).specs.video.cropAtMax,null);assert.equal(claim(id,'specs.video.max').conditions.noVideoAbsenceNotVerified,true);}
 assert.ok(a.workerTasks[0].discardedSuggestions.some(s=>s.includes('video unsupported')));assert.ok(a.workerTasks[1].discardedSuggestions.some(s=>s.includes('10th-gen')));assert.equal(a.workerFixturesDeleted,true);for(const n of ['x2d2','907x100'])assert.equal(existsSync(new URL('.cheap-worker-hasselblad001-'+n+'.txt',root)),false);
 assert.deepEqual(a.workerTotals,{inputTokens:16143,outputTokens:2929,totalTokens:19072});assert.equal(a.workerStats.actualApiAttempts,3);assert.equal(a.workerStats.retries,1);
});

test('Production strict validation/approval enforces weights, IBIS, LCD, crop, explicit units and source conflicts',()=>{
 assert.equal(validateStagingBatch(e.bundle.stagings,context).valid,true);verifyIncoming(e.bundle,before);
 for(const[path,value,code]of [['specs.ibis',true,'INVALID_IBIS'],['specs.lcd',{present:true,mechanism:'free-angle'},'INVALID_LCD'],['specs.video.cropAtMax',1.2,'INVALID_CROP_AT_MAX']]){const s=structuredClone(stage(ids[0]));s.claims.find(c=>c.path===path).value=value;assert.ok(validateStagingBatch([s],context).items[0].errors.some(e=>e.code===code));}
 const s=structuredClone(stage(ids[0]));delete s.claims.find(c=>c.path==='specs.weight').conditions.weightBasis;assert.ok(validateStagingBatch([s],context).items[0].errors.some(e=>e.code==='WEIGHT_BASIS_REQUIRED'));
 const c=structuredClone(claim(ids[0],'specs.sensor.megapixels'));c.claimId='conflict-regression';c.value=50;s.claims.push(c);assert.ok(validateStagingBatch([s],context).items[0].errors.some(e=>e.code==='CONFLICTING_CLAIM_VALUES'));
 for(const s of e.bundle.stagings)for(const c of s.claims)if(c.value!==null&&c.unit!==null)assert.ok(typeof c.rawUnit==='string'&&c.rawUnit.length>0);
});

test('Six raw UTC source records, staged claims, approved digests and atomic before/after replay are intact',()=>{
 const manifest=json(base+'batches/'+batch+'.json'),approval=json(base+'approvals/'+batch+'.json'),journal=json(tx+'journal.json'),{approvalId,...approvalBody}=approval;
 assert.equal(approvalId,'approval-'+digestValue(approvalBody));assert.equal(approval.diffDigest,digestValue(e.bundle.diff));assert.equal(journal.evidenceDigest,digestValue(e));assert.equal(journal.phase,'canonicalized');assert.deepEqual(e.approval,approval);assert.deepEqual(json(base+'approvals/'+batch+'/'+approvalId+'.json'),approval);
 assert.equal(sha(tx+'before.json'),manifest.canonicalBaselineDigest);assert.equal(sha(tx+'after.json'),manifest.expectedCanonicalDigest);
 for(const[p,h]of Object.entries(e.bundle.artifactDigests))if(!['vocab.json','identity-map.json'].includes(p))assert.equal(sha(base+p),h);
 for(const item of manifest.items){assert.equal(item.state,'canonicalized');assert.equal(item.sourceIds.length,3);assert.equal(item.stagingDigest,digestValue(stage(item.productId)));}
 for(const[id,r]of Object.entries(e.bundle.raws)){assert.equal(createSourceId(r),id);assert.equal(r.contentDigest,digestValue(r.evidenceExcerpt));assert.equal(new Date(r.accessedAt).toISOString(),r.accessedAt);assert.ok(r.accessedAt>=a.rawHelperTimestampWindow.start&&r.accessedAt<=a.rawHelperTimestampWindow.end);}
 const replay=proposedCanonical(before,e.bundle,approval.decisions,approval.productOperations);assert.deepEqual(replay.canonical,after);assert.equal(replay.digest,manifest.expectedCanonicalDigest);assert.deepEqual(proposedCanonical(after,e.bundle,approval.decisions,approval.productOperations).canonical,after);assert.equal(a.checkpoint.reapply.status,'already-canonicalized');assert.equal(a.checkpoint.reapply.canonicalMatches,true);
});

test('All known leaves have verified model-owned evidence and current canonical passes existing contract',()=>{
 const leaves=(v,p='specs')=>v==null?[]:typeof v!=='object'||Array.isArray(v)?[p]:Object.entries(v).flatMap(([k,c])=>leaves(c,p+'.'+k));
 for(const id of ids){const b=body(id);for(const path of leaves(b.specs))assert.ok(Object.entries(b.fieldEvidence).some(([scope,f])=>(path===scope||path.startsWith(scope+'.'))&&f.verification==='verified'));for(const[path,f]of Object.entries(b.fieldEvidence))for(const cid of f.claimIds){const c=stage(id).claims.find(c=>c.claimId===cid);assert.equal(c.path,path);assert.deepEqual(c.value,getAtPath(b,path));assert.ok(b.sources.some(s=>s.sourceId===c.sourceId));}}
 assert.equal(validateCanonical(json('src/data/cameraProducts.json'),json(base+'vocab.json')),true);assert.deepEqual(a.productStatistics.map(p=>[p.knownObjectiveLeaves,p.fieldEvidencePaths]),[[31,21],[22,17]]);
});
