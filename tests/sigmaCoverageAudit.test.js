import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {digestValue, createSourceId, getAtPath, normalizeSearch, validateStagingBatch} from '../scripts/objective/rules.mjs';
import {validateCanonical, validateSpecValue, verifyIncoming, proposedCanonical} from '../scripts/objective/merge.mjs';

const root=new URL('../',import.meta.url),base='src/data/ingestion/',batch='production-sigma-bodies-001',tx=base+'transactions/'+batch+'/';
const bytes=p=>readFileSync(new URL(p,root)),json=p=>JSON.parse(bytes(p)),sha=p=>createHash('sha256').update(bytes(p)).digest('hex');
const a=json(base+'sigma-coverage-audit-2026-10-14.json'),old=json(base+a.previousSnapshot),e=json(tx+'evidence.json');
const before=json(tx+'before.json'),after=json(tx+'after.json'),current=json('src/data/cameraProducts.json');
const b=after.bodies.find(b=>b.id==='sigma-bf'),s=e.bundle.stagings[0],claim=p=>s.claims.find(c=>c.path===p);
const context={canonical:before,vocab:e.bundle.vocab,rawDocuments:new Map(Object.entries(e.bundle.raws))};
const covers=(path,scope)=>path===scope||path.startsWith(scope+'.');
const leaves=(v,p='specs')=>v==null?[]:typeof v!=='object'||Array.isArray(v)?[p]:Object.entries(v).flatMap(([k,v])=>leaves(v,p+'.'+k));

test('Sigma audit distinguishes one current card from three retained introductions and two discontinued models',()=>{
 assert.equal(a.auditDate,'2026-10-14');assert.equal(a.startWorkingTree,'clean');assert.match(a.denominatorPolicy,/Korea official CAMERAS/);
 assert.deepEqual(a.counts,{officialCurrentCameraCards:1,currentBaseIdentities:1,releasedCurrentDigital:1,canonicalizedDigital:1,productionProvenanceCompleteDigital:1,announcedUpcomingProducts:0,historicalDevelopmentReferences:1,linkedInlineColorVariants:1,deferredSpecial:0,discontinuedArchive:2,unprocessedReleasedCurrent:0,duplicateAmbiguous:0});
 assert.deepEqual(a.retainedIntroductionCounts,{cards:3,baseIdentities:3});
 assert.deepEqual(a.cards.filter(c=>c.currentDenominator).map(c=>c.manufacturerModelCode),['BF']);
 for(const p of a.inventoryPages){assert.ok(p.sameBytesAsProductionSnapshot);assert.match(p.sha256,/^[a-f0-9]{64}$/);assert.equal(p.cameraProductUrls.length,p.key==='global-our-cameras'?3:1);}
 for(const model of ['fp','fp L']){const c=a.cards.find(c=>c.manufacturerModelCode===model);assert.equal(c.classification,'discontinued/archive');assert.equal(c.currentDenominator,false);assert.match(c.statusEvidence.label,/DISCONTINUED/);assert.equal(c.status,200);}
});

test('Fresh official Korean/global/Japan checks cover sources and retain scope without asserting Korean retail stock',()=>{
 assert.equal(a.officialFetchSummary.directRequests,19);assert.equal(a.officialFetchSummary.http200,19);assert.equal(a.officialFetchSummary.failed,0);
 for(const f of a.officialFetches){assert.ok(['sigma-photo.co.kr','www.sigma-global.com'].includes(new URL(f.url).hostname));assert.equal(f.status,200);assert.match(f.sha256,/^[a-f0-9]{64}$/);assert.equal(new Date(f.accessedAt).toISOString(),f.accessedAt);}
 assert.deepEqual(a.regionalReview.globalCurrent,['BF']);assert.deepEqual(a.regionalReview.japanCurrent,['BF']);assert.equal(a.regionalReview.observedReleaseStatusDisagreement,false);assert.equal(a.regionalReview.koreaRetailStockNotGuaranteed,true);
 for(const k of ['newCurrentProducts','removedCurrentProducts','releaseStatusChanges','identityChanges'])assert.deepEqual(a.changes[k],[]);
});

test('BF maps once to existing identity and L-Mount, independently of fp/fpL and finish',()=>{
 assert.equal(a.products.length,1);assert.equal(a.products[0].productionProvenanceComplete,true);
 assert.equal(current.bodies.filter(b=>b.id==='sigma-bf').length,1);assert.equal(b.brand,'Sigma');assert.equal(b.model,'BF');assert.equal(b.mount,'L-Mount');assert.equal(b.kind,'interchangeable');
 const map=json(base+'identity-map.json').entries.filter(m=>m.manufacturer==='Sigma'&&m.manufacturerModelCode==='BF');assert.equal(map.length,1);assert.equal(map[0].productId,'sigma-bf');
 assert.ok(json(base+'vocab.json').mounts.some(m=>m.name==='L-Mount'));assert.deepEqual(a.variants,old.variants);assert.equal(a.variants[0].newProduct,false);
 const names=new Set([b.name,b.model,...b.aliases].map(normalizeSearch));for(const other of current.bodies.filter(x=>x.id!==b.id))for(const name of [other.name,other.model,...other.aliases])assert.ok(!names.has(normalizeSearch(name)));
 assert.ok(!b.aliases.some(n=>/\bfp\b/i.test(n)));assert.deepEqual(after.lenses,before.lenses);
});

test('Sensor values are directly supported while unsupported RGB condition is disclosed instead of inherited from fpL',()=>{
 assert.equal(b.specs.sensor.megapixels,24.6);assert.deepEqual(b.specs.sensor.sizeMm,[35.9,23.9]);assert.equal(b.specs.sensor.generation,'Back-illuminated CMOS');assert.equal(claim('specs.sensor.sizeMm').conditions.notComputedFromFullFrameLabel,true);
 const finding=a.findings.shouldFix.find(f=>f.id==='SIGMA_UNSUPPORTED_RGB_CONDITION');assert.equal(finding.claimId,claim('specs.sensor.generation').claimId);assert.equal(finding.storedCondition,claim('specs.sensor.generation').conditions.colorFilterSystem);assert.equal(a.specReview.sensor.colorFilterConditionSupportedByConnectedSource,false);assert.equal(a.specReview.sensor.exactBayerLayout,'UNKNOWN');assert.equal(a.specReview.sensor.foveonInherited,false);
});

test('Known internal230GB/no SD is not a removable slot, external USB recording or an unknown hardware fact',()=>{
 const c=claim('specs.cardSlots');assert.equal(c.value,null);assert.equal(c.conditions.internalStorageGB,230);assert.equal(c.conditions.noPhysicalSDCardSlotConfirmed,true);assert.equal(b.specs.cardSlots,null);
 assert.equal(c.conditions.internalStorageNotCardSlot,true);assert.equal(c.conditions.externalUSBStorageNotCardSlot,true);assert.throws(()=>validateSpecValue({count:0,slots:[]},'specs.cardSlots'));
 assert.equal(a.knownAbsenceRepresentation.length,1);assert.equal(a.knownAbsenceRepresentation[0].knownNoSDSlot,true);assert.ok(!a.acceptableUnknowns.some(u=>u.path==='specs.cardSlots'));
});

test('Mechanical absence is explicit and distinct from speed quantization or unverified flash synchronization',()=>{
 assert.equal(b.specs.shutter.mechanical,false);assert.equal(b.specs.shutter.electronic,true);assert.match(claim('specs.shutter.mechanical').conditions.sourceWording,/not equipped/);
 assert.equal(claim('specs.shutter.fastestElectronicSec').rawValue,1/25600);assert.equal(b.specs.shutter.fastestElectronicSec,0.000039);assert.match(a.specReview.shutter.flashSync,/UNKNOWN/);assert.equal(a.notApplicablePaths.length,2);
});

test('Strict LCD and unverified finder/hinge/IBIS preserve absence versus evidence shortage',()=>{
 validateSpecValue(b.specs.lcd,'specs.lcd');assert.equal(b.specs.lcd.present,true);assert.equal(b.specs.lcd.mechanism,null);assert.equal(b.specs.evf,null);assert.equal(b.specs.ibis,null);
 assert.equal(claim('specs.ibis').conditions.lensOISNotBodyIBIS,true);assert.match(a.specReview.stabilization.bodyIBIS,/insufficient direct/);
 assert.deepEqual(a.acceptableUnknowns.map(u=>u.path).sort(),['specs.evf','specs.ibis','specs.lcd.mechanism','specs.video.bitDepth','specs.video.cropAtMax','specs.autofocus.aiUnit'].sort());
});

test('6K29.97 retains movie conditions and reports DC-crop source attribution without changing sealed claims',()=>{
 assert.equal(b.specs.video.max,'6K 29.97p');assert.equal(b.specs.video.bitDepth??null,null);assert.equal(b.specs.video.cropAtMax??null,null);
 const claims=s.claims.filter(c=>c.path==='specs.video.max'),manual=claims.find(c=>c.conditions.bitrateMbps);assert.equal(manual.conditions.bitrateMbps,200);assert.equal(manual.conditions.frameRate,29.97);assert.equal(manual.conditions.h264At6K,false);assert.equal(manual.conditions.dcCropModeSupported,false);assert.equal(manual.conditions.internal,true);
 const finding=a.findings.shouldFix.find(f=>f.id==='SIGMA_DC_CROP_SOURCE_SCOPE');assert.equal(finding.claimIds.length,2);for(const id of finding.claimIds)assert.ok(s.claims.some(c=>c.claimId===id&&c.sourceId===claims.find(c=>!c.conditions.bitrateMbps).sourceId));assert.equal(finding.correctSourceUrl,'https://www.sigma-global.com/en/support/download/BF_EN.pdf');
});

test('Electronic burst/AF restrictions and valid battery/internal-storage masses remain model-bound',()=>{
 assert.equal(b.specs.burst.maxElectronicFps,8);assert.equal(b.specs.burst.maxMechanicalFps??null,null);
 const manual=s.claims.find(c=>c.path==='specs.burst.maxElectronicFps'&&c.conditions.firmwareDocument);assert.equal(manual.conditions.afConditionAppliesToAFSNotAllModes,true);
 assert.equal(b.specs.weight,446);assert.equal(b.specs.bodyOnlyWeight,388);assert.equal(b.specs.weightBasis,'battery-internal-storage');assert.ok(e.bundle.vocab.weightBases.includes(b.specs.weightBasis));assert.equal(claim('specs.weight').conditions.weightBasis,b.specs.weightBasis);assert.equal(claim('specs.bodyOnlyWeight').conditions.weightBasis,'body-only');
});

test('Every known objective leaf has verified raw claims and canonical source attribution; reference-only is not inflated',()=>{
 assert.equal(a.products[0].known.length,27);assert.equal(leaves(b.specs).length,27);
 for(const path of leaves(b.specs)){const k=a.products[0].known.find(k=>k.path===path);assert.equal(k.classification,'verified');assert.deepEqual(k.value,getAtPath(b,path));assert.ok(Object.entries(b.fieldEvidence).some(([scope,f])=>covers(path,scope)&&f.verification==='verified'));}
 for(const [path,f]of Object.entries(b.fieldEvidence))for(const id of f.claimIds){const c=s.claims.find(c=>c.claimId===id);assert.equal(c.path,path);assert.deepEqual(c.value,getAtPath(b,path));assert.ok(e.bundle.raws[c.sourceId]);assert.ok(b.sources.some(src=>src.sourceId===c.sourceId&&src.fields.some(scope=>covers(path,scope))));}
 assert.deepEqual(a.provenanceSummary,{knownObjectiveLeaves:27,verifiedKnownLeaves:27,manufacturerReferenceOnly:0,legacyOnly:0,unclassifiedKnownLeaves:0,sourceLessKnownLeaves:0,verifiedFieldEvidencePaths:24,structuredIdentityEvidence:0,indirectIdentityEvidence:1,productionClaims:37,knownClaims:28,unknownClaims:9,rawSources:3,canonicalSourceLinks:4});
});

test('Existing-product metadata gap and newly found official release date are should-fix, not invented canonical changes',()=>{
 assert.equal(b.identityEvidence,undefined);assert.equal(s.identityEvidence.verification,'verified');assert.equal(b.specs.releaseDate,null);
 const date=a.findings.shouldFix.find(f=>f.path==='specs.releaseDate');assert.equal(date.officialGlobalReleaseDate,'2025-04-24');assert.match(date.sourceUrl,/2025\/04\/07/);assert.ok(!a.acceptableUnknowns.some(u=>u.path==='specs.releaseDate'));
 assert.deepEqual(a.findingCounts,{critical:0,shouldFix:4,acceptableUnknownPaths:6});assert.equal(a.findings.critical.length,0);assert.equal(a.findings.shouldFix.length,4);assert.ok(a.findings.shouldFix.every(f=>f.blocking===false));
});

test('Archive/development and lens boundaries remain reconsiderable but outside current camera denominator',()=>{
 assert.deepEqual(a.archivalScope.products,['fp','fp L']);assert.equal(a.archivalScope.permanentExclusion,false);assert.equal(a.archivalScope.archivedIngestion,false);
 assert.equal(a.developmentReview.latestOfficialAnnouncementReviewed,'2022-02-21');assert.equal(a.developmentReview.concreteProductIdentities,0);assert.equal(a.developmentReview.current2026ProjectStatus,'UNKNOWN');assert.equal(a.developmentReview.countsAsReleasedCurrent,false);
 assert.equal(a.lensSeparation.lensCardsInCameraDenominator,0);assert.equal(a.lensSeparation.lensIngestion,false);assert.equal(a.lensSeparation.cineLensIngestion,false);assert.equal(a.workerUsage.newCalls,0);assert.equal(a.workerUsage.newTokens,0);
});

test('Latest validators accept BF and continue rejecting malformed IBIS/LCD/crop, bad weight and conflicting values',()=>{
 assert.equal(validateStagingBatch([s],context).valid,true);
 for(const[path,value,code]of [['specs.ibis',true,'INVALID_IBIS'],['specs.lcd',{present:true,mechanism:'free-angle'},'INVALID_LCD'],['specs.video.cropAtMax',1.25,'INVALID_CROP_AT_MAX']]){const invalid=structuredClone(s);invalid.claims.find(c=>c.path===path).value=value;assert.ok(validateStagingBatch([invalid],context).items[0].errors.some(e=>e.code===code));}
 const weight=structuredClone(s);delete weight.claims.find(c=>c.path==='specs.weight').conditions.weightBasis;assert.ok(validateStagingBatch([weight],context).items[0].errors.some(e=>e.code==='WEIGHT_BASIS_REQUIRED'));
 const invalid=structuredClone(s),c=structuredClone(claim('specs.sensor.megapixels'));c.claimId='audit-conflict';c.value=61;invalid.claims.push(c);assert.ok(validateStagingBatch([invalid],context).items[0].errors.some(e=>e.code==='CONFLICTING_CLAIM_VALUES'));
 assert.equal(validateCanonical(current,json(base+'vocab.json')),true);
});

test('Sealed14-file batch/context, explicit approval, digest chain and replay retain exact canonicalized result',()=>{
 for(const[p,h]of Object.entries(a.sealedFileDigests))if(![base+'vocab.json',base+'identity-map.json'].includes(p))assert.equal(sha(p),h);
 const m=json(base+'batches/'+batch+'.json'),approval=json(base+'approvals/'+batch+'.json'),j=json(tx+'journal.json'),{approvalId,...body}=approval;
 assert.equal(approvalId,'approval-'+digestValue(body));assert.deepEqual(approval,e.approval);assert.equal(approval.diffDigest,digestValue(e.bundle.diff));assert.equal(j.evidenceDigest,digestValue(e));assert.equal(j.phase,'canonicalized');assert.equal(m.items[0].state,'canonicalized');
 assert.equal(sha(tx+'before.json'),m.canonicalBaselineDigest);assert.equal(sha(tx+'after.json'),m.expectedCanonicalDigest);assert.equal(m.expectedCanonicalDigest,a.canonicalSha256);assert.equal(a.artifactAudit.totalCheckedFiles,14);
 for(const[p,h]of Object.entries(e.bundle.artifactDigests))if(!['vocab.json','identity-map.json'].includes(p))assert.equal(sha(base+p),h);
 verifyIncoming(e.bundle,before);const replay=proposedCanonical(before,e.bundle,approval.decisions,approval.productOperations);assert.deepEqual(replay.canonical,after);assert.equal(replay.digest,m.expectedCanonicalDigest);assert.deepEqual(proposedCanonical(after,e.bundle,approval.decisions,approval.productOperations).canonical,after);
 assert.deepEqual(a.artifactAudit.reapply,{status:'already-canonicalized',batchId:batch,canonicalMatches:true});
});

test('Three manufacturer sources preserve helper UTC bounds and evidence links; new fetch timestamps do not rewrite production',()=>{
 assert.equal(a.sourceRechecks.length,3);assert.equal(a.technicalManual.sameFileAsProduction,true);assert.equal(a.technicalManual.pdfPages,180);
 for(const r of a.sourceRechecks){const raw=json(base+'raw/'+r.sourceId+'.json');assert.equal(raw.sourceType,'manufacturer');assert.equal(createSourceId(raw),r.sourceId);assert.equal(raw.contentDigest,digestValue(raw.evidenceExcerpt));assert.equal(raw.accessedAt,r.productionAccessedAt);assert.equal(new Date(raw.accessedAt).toISOString(),raw.accessedAt);assert.ok(raw.accessedAt>=r.helperClockBounds.start&&raw.accessedAt<=r.helperClockBounds.end);assert.equal(r.freshFetch.status,200);assert.equal(r.canonicalLinked,true);assert.deepEqual(e.bundle.raws[r.sourceId],raw);}
});
