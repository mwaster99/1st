import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {proposedCanonical, verifyIncoming, validateCanonical, validateSpecValue} from '../scripts/objective/merge.mjs';
import {createSourceId, digestValue, formatCanonicalDiff, getAtPath, validateStagingBatch} from '../scripts/objective/rules.mjs';

const root=new URL('../',import.meta.url),base='src/data/ingestion/',batch='production-sigma-bodies-001',tx=base+'transactions/'+batch+'/';
const bytes=p=>readFileSync(new URL(p,root)),json=p=>JSON.parse(bytes(p)),sha=p=>createHash('sha256').update(bytes(p)).digest('hex');
const snapshot=json(base+'sigma-current-2026-10-14.json'),e=json(tx+'evidence.json'),before=json(tx+'before.json'),after=json(tx+'after.json');
const body=after.bodies.find(b=>b.id==='sigma-bf'),staging=e.bundle.stagings[0],claim=path=>staging.claims.find(c=>c.path===path);
const context={canonical:before,vocab:e.bundle.vocab,rawDocuments:new Map(Object.entries(e.bundle.raws))};

test('Sigma camera inventory separates three retained model cards from one released/current and two officially discontinued',()=>{
 assert.equal(snapshot.snapshotDate,'2026-10-14');assert.match(snapshot.denominatorPolicy,/Korea official home CAMERAS category delegates to Global/);
 assert.deepEqual(snapshot.cards.map(c=>c.manufacturerModelCode),['BF','fp L','fp']);assert.equal(snapshot.countsAtStart.officialCameraCards,3);assert.equal(snapshot.countsAtStart.baseIdentities,3);assert.equal(snapshot.countsAtStart.releasedCurrent,1);assert.equal(snapshot.countsAtStart.discontinuedArchive,2);
 assert.equal(snapshot.cards.find(c=>c.manufacturerModelCode==='BF').classification,'released/current');
 for(const c of snapshot.cards.filter(c=>c.manufacturerModelCode!=='BF')){assert.equal(c.classification,'discontinued/archive');assert.equal(c.canonicalId,null);assert.equal(c.statusEvidence.label,'DISCONTINUED in product heading and tag');assert.equal(c.statusEvidence.crossCheck,'https://www.sigma-global.com/en/discontinued/');}
 assert.deepEqual(snapshot.selected,['sigma-bf']);assert.equal(snapshot.countsAtStart.productionUnprocessedCurrent,1);assert.ok(snapshot.collectionFetches.every(f=>f.status===200));
});

test('BF silver is one linked inline finish and historical Foveon development is not a shipping camera SKU',()=>{
 assert.equal(snapshot.variants.length,1);assert.equal(snapshot.variants[0].baseIdentity,'BF');assert.equal(snapshot.variants[0].canonicalId,'sigma-bf');assert.equal(snapshot.variants[0].newProduct,false);
 assert.equal(snapshot.countsAtStart.announcedUpcomingProducts,0);assert.equal(snapshot.developmentReferences.length,1);const d=snapshot.developmentReferences[0];assert.equal(d.countsAsReleasedCurrent,false);assert.equal(d.canonicalId,null);assert.equal(d.concreteCurrentModelCode,null);assert.match(d.classification,/current project status not confirmed/);
 assert.equal(snapshot.scopeBoundary.lensCardsInCameraDenominator,0);assert.equal(snapshot.scopeBoundary.lensIngestion,false);assert.equal(snapshot.scopeBoundary.accessoryIngestion,false);assert.ok(snapshot.scopeBoundary.cameraRoute.includes('/cameras/'));assert.ok(snapshot.scopeBoundary.lensRoutes.every(u=>u.includes('/lenses')));
});

test('Sigma batch reinforces existing BF atomically with no new body, price, alias or unrelated product changes',()=>{
 assert.equal(before.bodies.length,163);assert.equal(after.bodies.length,163);assert.equal(after.lenses.length,36);assert.deepEqual(after.lenses,before.lenses);
 for(const old of before.bodies){const now=after.bodies.find(b=>b.id===old.id);if(old.id!=='sigma-bf')assert.deepEqual(now,old);else for(const key of ['id','name','brand','model','series','aliases','mount','kind','bodyStyle','price'])assert.deepEqual(now[key],old[key]);}
 assert.equal(after.bodies.filter(b=>b.brand==='Sigma').length,1);assert.ok(!after.bodies.some(b=>b.brand==='Sigma'&&['fp','fp L'].includes(b.model)));
 assert.equal(e.approval.productOperations.length,1);assert.equal(e.approval.productOperations[0].operation,'update-product');assert.equal(e.approval.approvedBy.method,'cli-explicit');
 const changes=e.bundle.diff.items[0].changes;assert.ok(changes.some(c=>c.category==='same-value/new-evidence'));assert.ok(changes.some(c=>c.category==='null-fill'));assert.ok(changes.every(c=>c.category!=='value-conflict'));assert.match(formatCanonicalDiff(e.bundle.diff.items[0]),/33 fields \/ 3 sources/);
});

test('BF native sensor and explicit physical dimensions are Sigma facts, not output pixels or Foveon inheritance',()=>{
 assert.equal(body.specs.sensor.megapixels,24.6);assert.deepEqual(body.specs.sensor.sizeMm,[35.9,23.9]);assert.equal(body.specs.sensor.generation,'Back-illuminated CMOS');assert.deepEqual(body.specs.dimensions,[130.1,72.8,36.8]);
 assert.equal(claim('specs.sensor.megapixels').conditions.totalMegapixels,25.3);assert.deepEqual(claim('specs.sensor.megapixels').conditions.stillRawOutput,[6016,4012]);assert.equal(claim('specs.sensor.sizeMm').conditions.notComputedFromFullFrameLabel,true);assert.equal(claim('specs.sensor.generation').conditions.specificBayerLayoutNamed,false);assert.equal(claim('specs.sensor.generation').conditions.notInheritedFoveon,true);
});

test('BF reuses L-Mount and reviewed identity while all evidence belongs to Sigma, never Panasonic/Leica',()=>{
 assert.equal(body.mount,'L-Mount');assert.equal(body.kind,'interchangeable');assert.equal(body.specs.fixedLens,null);assert.deepEqual(e.bundle.vocab,json(base+'vocab.json'));
 const map=json(base+'identity-map.json').entries.filter(x=>x.manufacturer==='Sigma');assert.equal(map.length,1);assert.equal(map[0].manufacturerModelCode,'BF');assert.equal(map[0].productId,'sigma-bf');assert.deepEqual(map[0].reviewedAliases,['Sigma BF']);
 assert.equal(staging.identityEvidence.verification,'verified');assert.equal(body.identityEvidence,undefined); // Existing-product merge metadata gap remains explicit.
 for(const source of staging.sources){assert.ok(['sigma-photo.co.kr','www.sigma-global.com'].includes(new URL(source.url).hostname));assert.equal(e.bundle.raws[source.sourceId].items[0].manufacturerModelCode,'BF');assert.ok(body.sources.some(s=>s.sourceId===source.sourceId));}
});

test('Electronic-only shutter is explicitly false for mechanical and exact fractional source survives known quantization',()=>{
 assert.equal(body.specs.shutter.mechanical,false);assert.equal(body.specs.shutter.electronic,true);validateSpecValue(false,'specs.shutter.mechanical');assert.match(claim('specs.shutter.mechanical').conditions.sourceWording,/not equipped/);
 assert.equal(claim('specs.shutter.mechanical').conditions.fastSubjectCanDistort,true);assert.equal(claim('specs.shutter.mechanical').conditions.flickerCanCauseUnevenExposure,true);
 assert.equal(claim('specs.shutter.fastestElectronicSec').rawValue,1/25600);assert.equal(claim('specs.shutter.fastestElectronicSec').conditions.exactSourceFraction,'1/25600');assert.equal(body.specs.shutter.fastestElectronicSec,0.000039);assert.equal(body.specs.shutter.fastestMechanicalSec??null,null);assert.equal(body.specs.shutter.slowestTimedSec,30);assert.equal(body.specs.shutter.bulb,true);assert.equal(claim('specs.shutter.bulb').conditions.maximumSeconds,300);
});

test('Known no-SD-slot and internal230GB stay in provenance; USB backup is not a card slot or external recording',()=>{
 assert.equal(body.specs.cardSlots,null);const c=claim('specs.cardSlots');assert.equal(c.value,null);assert.equal(c.conditions.noPhysicalSDCardSlotConfirmed,true);assert.equal(c.conditions.internalStorageGB,230);assert.equal(c.conditions.internalStorageNotCardSlot,true);assert.equal(c.conditions.externalUSBStorageNotCardSlot,true);
 assert.throws(()=>validateSpecValue({count:0,slots:[]},'specs.cardSlots'));assert.ok(staging.claims.some(c=>c.path==='specs.video.max'&&c.conditions.externalUSBStorageForBackupNotRecording===true&&e.bundle.raws[c.sourceId].url==='https://www.sigma-global.com/en/cameras/bf/'));assert.ok(snapshot.reviewDecisions.representationLimitations.some(s=>s.includes('zero-card-slot')));
});

test('LCD strict object is valid while unsupported hinge, EVF, sensor IBIS and movie bit depth are not guessed',()=>{
 assert.deepEqual(body.specs.lcd,{present:true,sizeInches:3.15,resolutionDots:2100000,mechanism:null,touch:true});validateSpecValue(body.specs.lcd,'specs.lcd');assert.equal(body.specs.evf,null);assert.equal(body.specs.ibis,null);assert.equal(body.specs.video.bitDepth??null,null);assert.equal(claim('specs.ibis').conditions.electronicStabilization,'video only');assert.equal(claim('specs.ibis').conditions.lensOISNotBodyIBIS,true);
 assert.ok(snapshot.workerTasks[0].discardedSuggestions.some(s=>s.includes('IBIS.present:false')));
});

test('BF6K29.97 mode retains internal HEVC200Mbps/EIS/DC-crop restrictions;119.88fps is FHD only',()=>{
 assert.equal(body.specs.video.max,'6K 29.97p');assert.equal(body.specs.video.log,true);assert.equal(body.specs.video.cropAtMax??null,null);const cs=staging.claims.filter(c=>c.path==='specs.video.max');assert.equal(cs.length,2);
 for(const c of cs){assert.equal(c.value,'6K 29.97p');assert.equal(c.conditions.internal,true);assert.equal(c.conditions.eisSupported,false);assert.equal(c.conditions.dcCropModeSupported,false);assert.equal(c.conditions.frameRate,29.97);assert.deepEqual(c.conditions.resolution,[6016,3384]);}
 const manual=cs.find(c=>c.conditions.bitrateMbps);assert.equal(manual.conditions.bitrateMbps,200);assert.equal(manual.conditions.h264At6K,false);assert.deepEqual(manual.conditions.frameRateTable6K,[23.98,25,29.97]);assert.equal(manual.conditions.eisAtLowerResolutionCropFactor,1.25);assert.equal(manual.conditions.lensOISAndEISMutuallyExclusive,true);assert.equal(manual.conditions.doNotConflateWith119_88FHD,true);
});

test('BF electronic8fps preserves recordable-frame and AF-mode conditions without inventing mechanical burst',()=>{
 assert.equal(body.specs.burst.maxElectronicFps,8);assert.equal(body.specs.burst.maxMechanicalFps??null,null);const cs=staging.claims.filter(c=>c.path==='specs.burst.maxElectronicFps');assert.equal(cs.length,2);
 const spec=cs.find(c=>c.conditions.recordableFramesJPEG);assert.equal(spec.conditions.recordableFramesJPEG,1000);assert.equal(spec.conditions.recordableFramesDNG,350);assert.equal(spec.conditions.notUnlimitedSustained,true);
 const manual=cs.find(c=>c.conditions.singleAFContinuousFocusFirstFrameLocked);assert.equal(manual.conditions.afConditionAppliesToAFSNotAllModes,true);assert.equal(manual.conditions.singleAFExposureLockedAtHalfPress,true);assert.equal(manual.conditions.manualConditionalBufferAtLeastAround100MayBeLess,true);assert.deepEqual(manual.conditions.selectableFrameRates,[3,5,8]);
});

test('BF battery/internal-storage and body-only masses remain exact approved bases without arbitrary CIPA/IP claims',()=>{
 assert.equal(body.specs.weight,446);assert.equal(body.specs.weightBasis,'battery-internal-storage');assert.equal(body.specs.bodyOnlyWeight,388);assert.equal(claim('specs.weight').conditions.weightBasis,body.specs.weightBasis);assert.equal(claim('specs.bodyOnlyWeight').conditions.weightBasis,'body-only');assert.equal(claim('specs.weight').conditions.capInclusionNotSpecified,true);
 assert.equal(body.specs.batteryShots,260);assert.equal(claim('specs.batteryConditions').conditions.notClaimedCIPA,true);assert.equal(body.specs.weatherSealing,true);assert.equal(claim('specs.weatherSealing').conditions.notWaterproof,true);assert.equal(claim('specs.weatherSealing').conditions.noIPRatingClaimed,true);assert.deepEqual(body.specs.operatingTemperatureC,{max:40,min:0});assert.equal(claim('specs.operatingTemperatureC.min').rawUnit,'°C');
});

test('Strict production validators accept reviewed BF and reject conflicting claims/invalid IBIS/LCD/crop/weight',()=>{
 assert.equal(validateStagingBatch([staging],context).valid,true);
 for(const[path,value,code]of [['specs.ibis',true,'INVALID_IBIS'],['specs.lcd',{present:true,mechanism:'free-angle'},'INVALID_LCD'],['specs.video.cropAtMax',1.25,'INVALID_CROP_AT_MAX']]){const s=structuredClone(staging);s.claims.find(c=>c.path===path).value=value;assert.ok(validateStagingBatch([s],context).items[0].errors.some(e=>e.code===code));}
 const weight=structuredClone(staging);delete weight.claims.find(c=>c.path==='specs.weight').conditions.weightBasis;assert.ok(validateStagingBatch([weight],context).items[0].errors.some(e=>e.code==='WEIGHT_BASIS_REQUIRED'));
 const conflict=structuredClone(staging),c=structuredClone(claim('specs.sensor.megapixels'));c.claimId='deliberate-conflict';c.value=61;conflict.claims.push(c);assert.ok(validateStagingBatch([conflict],context).items[0].errors.some(e=>e.code==='CONFLICTING_CLAIM_VALUES'));
});

test('BF approved raw/staging/diff/transaction chain has coherent digests, real UTC timestamps and idempotent replay',()=>{
 const m=json(base+'batches/'+batch+'.json'),a=json(base+'approvals/'+batch+'.json'),journal=json(tx+'journal.json');const {approvalId,...approvalBody}=a;assert.equal(approvalId,'approval-'+digestValue(approvalBody));assert.equal(a.diffDigest,digestValue(e.bundle.diff));assert.deepEqual(json(base+'approvals/'+batch+'/'+approvalId+'.json'),a);assert.deepEqual(e.approval,a);assert.equal(journal.evidenceDigest,digestValue(e));assert.equal(journal.phase,'canonicalized');
 assert.equal(m.items[0].state,'canonicalized');assert.equal(m.items[0].stagingDigest,digestValue(staging));assert.equal(m.items[0].diffDigest,digestValue(e.bundle.diff));assert.equal(sha(tx+'before.json'),m.canonicalBaselineDigest);assert.equal(sha(tx+'after.json'),m.expectedCanonicalDigest);assert.equal(m.canonicalBaselineDigest,json(base+'batches/production-leica-bodies-001.json').expectedCanonicalDigest);
 for(const[path,h]of Object.entries(e.bundle.artifactDigests))if(!['vocab.json','identity-map.json'].includes(path))assert.equal(sha(base+path),h);
 for(const[n,id]of m.items[0].sourceIds.entries()){const raw=json(base+'raw/'+id+'.json');assert.equal(createSourceId(raw),id);assert.equal(raw.contentDigest,digestValue(raw.evidenceExcerpt));assert.equal(m.items[0].rawDigests[n],digestValue(raw));assert.deepEqual(e.bundle.raws[id],raw);assert.equal(new Date(raw.accessedAt).toISOString(),raw.accessedAt);assert.ok(raw.accessedAt>=snapshot.rawHelperTimestampWindow.start&&raw.accessedAt<=snapshot.rawHelperTimestampWindow.end);}
 verifyIncoming(e.bundle,before);const replay=proposedCanonical(before,e.bundle,a.decisions,a.productOperations);assert.deepEqual(replay.canonical,after);assert.equal(replay.digest,m.expectedCanonicalDigest);assert.deepEqual(proposedCanonical(after,e.bundle,a.decisions,a.productOperations).canonical,after);assert.equal(validateCanonical(json('src/data/cameraProducts.json'),json(base+'vocab.json')),true);
 let known=0;const leaves=(v,path='specs')=>v==null?[]:typeof v!=='object'||Array.isArray(v)?[path]:Object.entries(v).flatMap(([k,x])=>leaves(x,path+'.'+k));for(const path of leaves(body.specs)){known++;assert.ok(Object.entries(body.fieldEvidence).some(([p,v])=>(p===path||path.startsWith(p+'.'))&&v.verification==='verified'));}
 assert.equal(known,27);assert.equal(Object.keys(body.fieldEvidence).length,24);for(const[path,v]of Object.entries(body.fieldEvidence))for(const id of v.claimIds){const c=staging.claims.find(c=>c.claimId===id);assert.equal(c.path,path);assert.deepEqual(c.value,getAtPath(body,path));assert.ok(e.bundle.raws[c.sourceId]);}
 assert.deepEqual(snapshot.claimStatistics,{claims:37,knownClaims:28,nullClaims:9,uniquePaths:33,verifiedFieldEvidencePaths:24,knownObjectiveLeaves:27,incomingRawSources:3,canonicalSourceLinks:4,structuredCanonicalIdentityEvidence:false});
});

test('Independent BF worker succeeded once, fixture deleted and checkpoint directs coverage audit with no current products pending',()=>{
 assert.equal(snapshot.workerTasks.length,1);const t=snapshot.workerTasks[0];assert.equal(t.stableTaskId,'sigma-production-001-bf');assert.equal(t.attempts.length,1);assert.equal(t.attempts[0].status,'success');assert.equal(t.attempts[0].applied,false);assert.deepEqual(snapshot.workerTotals,{inputTokens:4153,outputTokens:1043,totalTokens:5196});assert.deepEqual(snapshot.workerStats,{tasks:1,apiAttempts:1,retries:0,failures:0,usableProducts:1});
 assert.equal(snapshot.workerFixtureDeleted,true);assert.equal(existsSync(new URL('.cheap-worker-sigma001-bf.txt',root)),false);assert.equal(snapshot.countsAfter.productionUnprocessedCurrent,0);assert.equal(snapshot.countsAfter.newProducts,0);assert.equal(snapshot.countsAfter.existingReinforced,1);assert.equal(snapshot.batchCheckpoint.gate,'canonicalized');assert.equal(snapshot.batchCheckpoint.reapply.status,'already-canonicalized');assert.equal(snapshot.batchCheckpoint.reapply.canonicalMatches,true);
});
