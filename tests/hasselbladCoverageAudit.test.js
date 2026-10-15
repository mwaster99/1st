import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {validateCanonical, validateSpecValue, verifyIncoming, proposedCanonical} from '../scripts/objective/merge.mjs';
import {digestValue, createSourceId, getAtPath, normalizeSearch, validateStagingBatch} from '../scripts/objective/rules.mjs';
import {CATALOG_BODIES} from '../src/cameraCatalog.js';
import {CAMERA_DETAILS} from '../src/cameraCatalogViews.js';

const root=new URL('../',import.meta.url),base='src/data/ingestion/',batch='production-hasselblad-bodies-001',tx=base+'transactions/'+batch+'/';
const bytes=p=>readFileSync(new URL(p,root)),json=p=>JSON.parse(bytes(p)),sha=p=>createHash('sha256').update(bytes(p)).digest('hex');
const a=json(base+'hasselblad-coverage-audit-2026-10-14.json'),e=json(tx+'evidence.json'),before=json(tx+'before.json'),after=json(tx+'after.json');
const ids=['hasselblad-x2d-ii-100c','hasselblad-907x-cfv-100c'];
const body=id=>after.bodies.find(b=>b.id===id),stage=id=>e.bundle.stagings.find(s=>s.product.id===id),claim=(id,path)=>stage(id).claims.find(c=>c.path===path);
const x=body(ids[0]),m=body(ids[1]),context={canonical:before,vocab:e.bundle.vocab,rawDocuments:new Map(Object.entries(e.bundle.raws))};
const covers=(path,scope)=>path===scope||path.startsWith(scope+'.');
const leaves=(v,p='specs')=>v==null?[]:typeof v!=='object'||Array.isArray(v)?[p]:Object.entries(v).flatMap(([k,c])=>leaves(c,p+'.'+k));

test('Fresh KR camera cards, empty pagination and linked kits retain two current configurations',()=>{
 assert.equal(a.startWorkingTree,'clean');assert.equal(a.counts.koreaCurrentOfferings,2);assert.equal(a.counts.currentBaseCameraIdentities,2);assert.equal(a.counts.digitalCameraConfigurations,2);
 assert.deepEqual(a.collectionAudit.find(c=>c.region==='KR').cardTitles,['X2D II 100C KR','907X & CFV 100C KR']);assert.deepEqual(a.collectionAudit.find(c=>c.region==='KR-page2').cardTitles,[]);
 assert.equal(a.counts.linkedLensKits,7);assert.equal(a.linkedOffers.length,7);assert.equal(a.counts.currentSKUOffers,9);assert.ok(a.linkedOffers.every(k=>k.productId===ids[0]&&k.relation==='lens-kit'));
 assert.deepEqual(a.inventoryChanges,{newCurrent:[],removedCurrent:[],statusChanges:[],linkedKitChanges:[]});
});

test('Current identities and actual provenance are one-to-one with no incomplete or ambiguous item',()=>{
 assert.equal(a.counts.canonicalizedCurrent,2);assert.equal(a.counts.productionProvenanceComplete,2);assert.equal(a.counts.unprocessedCurrent,0);assert.equal(a.counts.duplicateAmbiguous,0);
 for(const id of ids){assert.equal(after.bodies.filter(p=>p.id===id).length,1);assert.equal(body(id).identityEvidence.verification,'verified');assert.equal(stage(id).product.model,body(id).model);assert.equal(body(id).sources.length,3);}
 assert.equal(x.model,'X2D II 100C');assert.ok(!x.aliases.includes('X2D 100C'));assert.equal(m.model,'907X & CFV 100C');
});

test('907X and CFV are two components of one assembled camera, never extra digital camera products',()=>{
 assert.equal(a.counts.integratedCameraIdentities,1);assert.equal(a.counts.assembledCameraIdentities,1);assert.equal(a.counts.modularComponentIdentities,2);assert.equal(a.modules.length,2);
 assert.ok(a.modules.every(c=>!c.standaloneDigitalCamera&&!c.canonicalProductCreated));assert.ok(!after.bodies.some(p=>p.brand==='Hasselblad'&&['907X','CFV 100C'].includes(p.model)));
 assert.equal(a.modularDecision.componentRelationSchemaCreated,false);assert.equal(a.modularDecision.independentModuleCurrentOffersConfirmed,false);assert.match(a.modularDecision.minimumConfiguration,/907X \+ CFV100C/);
});

test('CFV owns sensor while assembled capability keeps explicit100MP and43.8x32.9mm',()=>{
 assert.equal(a.modules.find(c=>c.module==='907X').sensor,false);assert.equal(a.modules.find(c=>c.module==='CFV 100C').sensor,true);
 for(const id of ids){assert.deepEqual(body(id).specs.sensor.sizeMm,[43.8,32.9]);assert.equal(body(id).specs.sensor.megapixels,100);assert.equal(claim(id,'specs.sensor.megapixels').conditions.notCalculatedFromOutputPixels,true);assert.equal(claim(id,'specs.sensor.megapixels').conditions.effectiveVersusTotalNotSeparatelyLabeled,true);}
 for(const path of ['specs.sensor.megapixels','specs.sensor.sizeMm','specs.sensor.generation'])assert.equal(claim(ids[1],path).conditions.sensorOwner,'CFV 100C');
});

test('Internal1TB and one removable CFexpress slot stay distinct and attributed to CFV',()=>{
 for(const id of ids){assert.equal(body(id).specs.cardSlots.count,1);assert.deepEqual(body(id).specs.cardSlots.slots[0].media,['CFexpress Type B']);assert.equal(claim(id,'specs.cardSlots').conditions.internalStorageTB,1);assert.equal(claim(id,'specs.cardSlots').conditions.internalSSDNotSlot,true);}
 assert.equal(claim(ids[1],'specs.cardSlots').conditions.storageOwner,'CFV 100C');assert.equal(a.modularDecision.storageOwner,'CFV 100C');
});

test('Battery and rear display belong to digital back and minimum assembly needs battery plus lens',()=>{
 assert.equal(claim(ids[1],'specs.batteryShots').conditions.batteryOwner,'CFV 100C');assert.equal(claim(ids[1],'specs.lcd').conditions.displayOwner,'CFV 100C');assert.equal(m.specs.batteryShots,420);
 assert.equal(m.specs.lcd.sizeInches,3.2);assert.match(a.modularDecision.canonicalMeaning,/battery and compatible lens required/);assert.equal(a.modularDecision.imagingProcessorModel,'UNKNOWN');
});

test('620g is official bare assembled weight, never operational/body160/back460 or lens-added mass',()=>{
 assert.equal(m.specs.bodyOnlyWeight,620);assert.equal(m.specs.weight,null);assert.equal(m.specs.weightBasis,null);assert.deepEqual(m.specs.dimensions,[102,92,84]);
 const c=claim(ids[1],'specs.bodyOnlyWeight');assert.equal(c.conditions.weightBasis,'body-only');assert.equal(c.conditions.officialAssemblyWeightNotCalculated,true);assert.equal(c.conditions.cameraBodyModuleG,160);assert.equal(c.conditions.digitalBackModuleG,460);
 for(const k of ['batteryExcluded','cardExcluded','lensExcluded'])assert.equal(c.conditions[k],true);
 assert.equal(a.weightAudit.officialAssemblySourcePdfPage,18);assert.equal(a.weightAudit.doubleCountingDetected,false);
 assert.equal(CATALOG_BODIES.find(b=>b.id===ids[1]).weight,null);assert.equal(CAMERA_DETAILS[m.name].weight,'무게 미확인');assert.equal(x.specs.weight,840);assert.equal(x.specs.weightBasis,'battery');
});

test('Manufacturer-qualified XCD mount cannot collide with Fujifilm X aliases or lens compatibility',()=>{
 const v=json(base+'vocab.json'),h=v.mounts.find(m=>m.name==='Hasselblad X'),f=v.mounts.find(m=>m.name==='Fujifilm X');assert.notEqual(h.name,f.name);assert.ok(h.aliases.includes('XCD mount'));assert.ok(!h.aliases.includes('X mount'));
 const owners=new Map();for(const m of v.mounts)for(const n of [m.name,...m.aliases]){const key=normalizeSearch(n);assert.ok(!owners.has(key)||owners.get(key)===m.name);owners.set(key,m.name);}
 for(const id of ids){assert.equal(body(id).mount,h.name);assert.equal(body(id).kind,'interchangeable');assert.equal(json(base+'identity-map.json').entries.filter(p=>p.manufacturer==='Hasselblad'&&p.productId===id).length,1);assert.ok(!after.lenses.some(l=>l.brand==='Fujifilm'&&l.mount===body(id).mount));}
 for(const b of before.bodies.filter(b=>b.brand==='Fujifilm'))assert.deepEqual(after.bodies.find(p=>p.id===b.id),b);
});

test('V back interface and model-specific sync/manual focus are not universal XCD/full-function compatibility',()=>{
 assert.equal(a.vSystemCompatibility.autofocusOnVFilmBodies,false);assert.equal(a.vSystemCompatibility.oldSWCUnsupported,true);assert.deepEqual(a.vSystemCompatibility.supportedSWC,['SWC/M','903 SWC','905 SWC']);assert.equal(a.vSystemCompatibility.filmBodiesIngested,false);
 assert.match(a.vSystemCompatibility.mechanicalMode,/cables/);assert.match(a.vSystemCompatibility.electronicMode,/open mode/);
 const c=stage(ids[1]).claims.find(c=>c.path==='specs.autofocus.description'&&c.conditions.VSystemAndTechnicalCameraManualFocusOnly);assert.ok(e.bundle.raws[c.sourceId].url.includes('/manuals/'));assert.equal(c.conditions.VOrXPanLensOn907XElectronicShutterOnly,true);assert.equal(c.conditions.requiresCorrectLensAdapter,true);
});

test('Strict IBIS10stop centre/8edge object stays on X2DII, never copied into CFV UNKNOWN',()=>{
 validateSpecValue(x.specs.ibis,'specs.ibis');validateSpecValue(m.specs.ibis,'specs.ibis');assert.equal(x.specs.ibis.axes,5);assert.equal(x.specs.ibis.stops,10);assert.match(x.specs.ibis.conditions,/8 stops edges/);assert.match(x.specs.ibis.conditions,/120 Macro/);assert.equal(m.specs.ibis,null);
});

test('Lens leaf shutter limits and generic still rates remain conditional, exact electronic fraction remains raw',()=>{
 for(const id of ids){const b=body(id);assert.equal(b.specs.shutter.mechanical??null,null);assert.equal(b.specs.shutter.fastestMechanicalSec??null,null);assert.equal(b.specs.shutter.electronic,true);assert.equal(b.specs.shutter.fastestElectronicSec,0.000167);assert.equal(claim(id,'specs.shutter.fastestElectronicSec').rawValue,1/6000);assert.equal(claim(id,'specs.shutter.mechanical').conditions.mechanicalShutterOwner,'compatible lens');assert.equal(b.specs.burst,null);}
 assert.equal(claim(ids[1],'specs.burst.maxMechanicalFps').conditions.genericCaptureFps,3.3);
});

test('Unproven video absence/still bit depth and conditional native AF remain separate',()=>{
 for(const id of ids){assert.equal(body(id).specs.video.max,null);assert.equal(body(id).specs.video.bitDepth,null);assert.equal(body(id).specs.video.cropAtMax,null);assert.equal(claim(id,'specs.video.max').conditions.noVideoAbsenceNotVerified,true);}
 assert.equal(claim(ids[0],'specs.autofocus.description').conditions.afCWithElectronicShutter,false);assert.equal(claim(ids[0],'specs.autofocus.description').conditions.requiresLatestLensFirmware,true);assert.equal(claim(ids[1],'specs.autofocus.description').conditions.compatibleNativeXCDConfiguration,true);
});

test('Every known objective leaf is verified through model-owned field claim and actual manufacturer source',()=>{
 for(const id of ids){const b=body(id),p=a.products.find(p=>p.productId===id);assert.equal(p.known.length,leaves(b.specs).length);
  for(const path of leaves(b.specs)){const k=p.known.find(k=>k.path===path);assert.equal(k.classification,'verified');assert.deepEqual(k.value,getAtPath(b,path));assert.ok(Object.entries(b.fieldEvidence).some(([scope,f])=>covers(path,scope)&&f.verification==='verified'));}
  for(const [path,f] of Object.entries(b.fieldEvidence))for(const cid of f.claimIds){const c=stage(id).claims.find(c=>c.claimId===cid);assert.equal(c.path,path);assert.deepEqual(c.value,getAtPath(b,path));assert.equal(e.bundle.raws[c.sourceId].sourceType,'manufacturer');assert.ok(b.sources.some(s=>s.sourceId===c.sourceId&&s.fields.some(scope=>covers(path,scope))));}
 }
 assert.deepEqual(a.provenanceSummary,{knownObjectiveLeaves:53,verifiedKnownLeaves:53,manufacturerReferenceOnly:0,legacyOnly:0,unclassifiedKnownLeaves:0,sourceLessKnownLeaves:0,verifiedFieldEvidencePaths:38,structuredIdentityEvidence:2,indirectIdentityEvidence:0,productionClaims:61,knownClaims:40,unknownClaims:21,rawSources:6,canonicalSourceLinks:6});
});

test('KR completion never inflates retained pages, out-of-stock or dealer contact into global completion',()=>{
 assert.equal(a.scope.koreaCurrentOfferingCoverageComplete,true);assert.equal(a.scope.worldwideCurrentCameraSystemCoverageComplete,false);assert.equal(a.hSystemReview.worldwideCoverageComplete,false);assert.equal(a.hSystemReview.dealerPageIsSalesProof,false);assert.equal(a.hSystemReview.repairPolicyIsSalesProof,false);assert.equal(a.hSystemReview.classification,'unresolved global/dealer status');
 assert.equal(a.retainedNonCurrent.length,3);assert.ok(a.retainedNonCurrent.every(p=>p.explicitDiscontinued===null));assert.equal(a.retainedEditions.length,3);assert.equal(a.counts.explicitDiscontinuedConfirmed,0);assert.equal(a.counts.announcedUpcoming,0);
 for(const region of ['NA','EU'])assert.deepEqual(a.collectionAudit.find(c=>c.region===region).cardTitles,['X2D II 100C','907X & CFV 100C']);assert.equal(a.workerUsage.newCalls,0);assert.equal(a.workerUsage.newTokens,0);
 assert.equal(a.findings.critical.length,0);assert.equal(a.findings.shouldFix.length,3);assert.ok(a.findings.shouldFix.every(f=>!f.blocking));assert.equal(a.findingCounts.canonicalDataErrors,0);assert.equal(a.acceptableUnknowns.length,21);
 const discrepancy=a.findings.shouldFix.find(f=>f.id==='official-faq-output-height');assert.equal(discrepancy.FAQ,'11656x8472');assert.equal(discrepancy.datasheetAndManual,'11656x8742');
});

test('18-file sealed chain, explicit approval and before/after replay retain exact canonicalized transaction',()=>{
 for(const [p,h] of Object.entries(a.sealedFileDigests))if(![base+'vocab.json',base+'identity-map.json'].includes(p))assert.equal(sha(p),h);
 const manifest=json(base+'batches/'+batch+'.json'),approval=json(base+'approvals/'+batch+'.json'),j=json(tx+'journal.json'),{approvalId,...approvalBody}=approval;
 assert.equal(approvalId,'approval-'+digestValue(approvalBody));assert.equal(approval.diffDigest,digestValue(e.bundle.diff));assert.equal(j.evidenceDigest,digestValue(e));assert.deepEqual(approval,e.approval);assert.deepEqual(json(base+'approvals/'+batch+'/'+approvalId+'.json'),approval);assert.equal(j.phase,'canonicalized');
 assert.equal(sha(tx+'before.json'),manifest.canonicalBaselineDigest);assert.equal(sha(tx+'after.json'),manifest.expectedCanonicalDigest);assert.equal(manifest.expectedCanonicalDigest,a.canonicalSha256);assert.equal(Object.keys(a.sealedFileDigests).length,18);
 for(const item of manifest.items){assert.equal(item.state,'canonicalized');assert.equal(item.stagingDigest,digestValue(stage(item.productId)));}
 verifyIncoming(e.bundle,before);const replay=proposedCanonical(before,e.bundle,approval.decisions,approval.productOperations);assert.deepEqual(replay.canonical,after);assert.deepEqual(proposedCanonical(after,e.bundle,approval.decisions,approval.productOperations).canonical,after);
 assert.deepEqual(a.artifactAudit.reapply,{status:'already-canonicalized',batchId:batch,canonicalMatches:true});assert.equal(a.artifactAudit.missingFiles,0);assert.equal(a.artifactAudit.digestMismatches,0);
});

test('Six raw UTC timestamps preserve clock bounds and evidence links independently of fresh audit fetches',()=>{
 assert.equal(a.sourceRechecks.length,6);assert.equal(a.technicalDocuments.cfvManualPdfPages,143);assert.equal(a.technicalDocuments.cfvManualSameBytesAsProduction,true);
 for(const s of a.sourceRechecks){const r=json(base+'raw/'+s.sourceId+'.json');assert.equal(createSourceId(r),s.sourceId);assert.equal(r.contentDigest,digestValue(r.evidenceExcerpt));assert.equal(r.accessedAt,s.productionAccessedAt);assert.equal(new Date(r.accessedAt).toISOString(),r.accessedAt);assert.ok(r.accessedAt>=s.helperClockBounds.start&&r.accessedAt<=s.helperClockBounds.end);assert.equal(s.freshFetch.status,200);assert.equal(s.canonicalLinked,true);assert.deepEqual(r,e.bundle.raws[s.sourceId]);}
 for(const f of a.officialFetches)assert.equal(new Date(f.accessedAt).toISOString(),f.accessedAt);assert.equal(a.officialFetches.find(f=>f.key==='official-dealers').status,200);
});

test('Latest strict staging/canonical contracts still pass and reject bad IBIS/weight/LCD/crop/conflicting claims',()=>{
 assert.equal(validateStagingBatch(e.bundle.stagings,context).valid,true);assert.equal(validateCanonical(json('src/data/cameraProducts.json'),json(base+'vocab.json')),true);
 for(const [path,value,code] of [['specs.ibis',true,'INVALID_IBIS'],['specs.lcd',{present:true,mechanism:'free-angle'},'INVALID_LCD'],['specs.video.cropAtMax',1.1,'INVALID_CROP_AT_MAX']]){const s=structuredClone(stage(ids[0]));s.claims.find(c=>c.path===path).value=value;assert.ok(validateStagingBatch([s],context).items[0].errors.some(e=>e.code===code));}
 const bad=structuredClone(stage(ids[0]));delete bad.claims.find(c=>c.path==='specs.weight').conditions.weightBasis;assert.ok(validateStagingBatch([bad],context).items[0].errors.some(e=>e.code==='WEIGHT_BASIS_REQUIRED'));
 const s=structuredClone(stage(ids[0])),c=structuredClone(claim(ids[0],'specs.sensor.megapixels'));c.claimId='audit-value-conflict';c.value=50;s.claims.push(c);assert.ok(validateStagingBatch([s],context).items[0].errors.some(e=>e.code==='CONFLICTING_CLAIM_VALUES'));
});
