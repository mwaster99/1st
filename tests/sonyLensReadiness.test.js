import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildRawDocument} from '../scripts/objective/raw-helper.mjs';
import {normalizeRawDocument, normalizeClaimValue, validateStagingBatch, digestValue, createClaimId} from '../scripts/objective/rules.mjs';
import {validateCanonical, validateSpecValue} from '../scripts/objective/merge.mjs';
import {applyBatch} from '../scripts/objective/promotion.mjs';
import {newProductFixture, pipeline, approveNew, newBatchId} from './support/newProductFixture.mjs';

const json=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url)));
const a=json('src/data/ingestion/sony-e-lenses-current-2026-10-15.json'),canonical=json('src/data/cameraProducts.json'),vocab=json('src/data/ingestion/vocab.json');
const optical=a.items.filter(i=>i.scopeClassification==='native-optical-lens'),current=optical.filter(i=>i.status==='released/current');
const item=code=>a.items.find(i=>i.manufacturerModelCode===code),spec=code=>a.pilot.sourceRecords.find(i=>i.manufacturerModelCode===code);
const source={sourceType:'manufacturer',publisher:'Sony',url:'https://www.sony.co.kr/synthetic-lens-readiness-fixture',documentTitle:'Synthetic isolated lens contract fixture, not production evidence',documentVersion:'test-1',region:'KR',accessedAt:'2026-10-15T03:00:01.123Z',evidenceScope:'Synthetic fixture only'};
function fixture(observations,type='zoom'){
 const identity={name:'Sony Synthetic Readiness Zoom',brand:'Sony',model:'Synthetic lens',aliases:[],mount:'Sony E',type};
 const draft={source,reviewDefaults:{verification:'verified',reviewedAt:'2026-10-15',reviewer:'Synthetic test'},items:[{itemKey:'synthetic-lens',manufacturerModelCode:'SYNTHETIC-LENS',productType:'lens',identity,identityEvidence:{locator:{section:'Synthetic identity'}},observations:observations.map(([path,value,unit,conditions={}])=>({field:path,path,rawValue:value,rawUnit:unit,locator:{row:path},conditions}))}]};
 const raw=buildRawDocument(draft),identityMap={entries:[{manufacturer:'Sony',manufacturerModelCode:'SYNTHETIC-LENS',productId:'sony-synthetic-readiness-lens',productType:'lens',reviewedAliases:[]}]};
 const [staging]=normalizeRawDocument(raw,{batchId:'synthetic-readiness',vocab,identityMap});
 return {raw,staging,context:{canonical,vocab,rawDocuments:new Map([[raw.sourceId,raw]])}};
}
const valid=f=>assert.equal(validateStagingBatch([f.staging],f.context).valid,true);

test('Korea73 official cards separate71 optical identities into67current and4upcoming, never73 lenses',()=>{
 assert.equal(a.startWorkingTree,'clean');assert.equal(a.items.length,73);assert.equal(new Set(a.items.map(i=>i.manufacturerModelCode)).size,73);assert.equal(optical.length,71);assert.equal(current.length,67);
 assert.deepEqual(optical.filter(i=>i.status==='announced/upcoming').map(i=>i.manufacturerModelCode),['SEL400F45GM','SEL600F63GM','SEL814G','SEL28702']);assert.equal(a.sources.browserDetailReview.totalUniqueProducts,73);assert.equal(a.sources.browserDetailReview.unknownStatusCount,0);
 assert.ok(a.items.every(i=>i.detailReviewed&&new URL(i.officialUrl).hostname==='www.sony.co.kr'));assert.ok(a.items.every(i=>new Date(i.cardAccessedAt).toISOString()===i.cardAccessedAt));
});

test('Teleconverters, adapter category duplicates, observed finish and unconfirmed archive remain separate',()=>{
 assert.deepEqual(a.items.filter(i=>i.scopeClassification==='adjacent-teleconverter').map(i=>i.manufacturerModelCode),['SEL14TC','SEL20TC']);
 assert.deepEqual(a.sources.mountAdaptorCategory.cardCodes,['SEL14TC','SEL20TC']);assert.equal(a.sources.mountAdaptorCategory.additionalIndependentLensProducts,0);
 for(const code of ['SEL14TC','SEL20TC']){assert.equal(item(code).focalLength,null);assert.equal(item(code).maximumAperture,null);assert.equal(item(code).lensType,null);}
 assert.equal(a.counts.linkedObservedFinishVariants,1);assert.deepEqual(item('SEL55210').variantRelation.observedColors,['silver','black']);assert.equal(a.counts.explicitDiscontinuedConfirmedInPrimary,0);
});

test('All36 existing lenses are reviewed and six Sony current lenses map to existing IDs without duplicate suggestions',()=>{
 assert.equal(a.counts.existingCanonicalLensesAllBrands,36);const matches=current.filter(i=>i.existingCanonicalId);assert.equal(matches.length,6);assert.equal(current.filter(i=>!i.existingCanonicalId).length,61);
 for(const i of matches){const l=canonical.lenses.find(l=>l.id===i.existingCanonicalId);assert.ok(l);assert.equal(l.brand,'Sony');assert.equal(l.mount,'Sony E');assert.equal(i.productionProvenanceStatus,'not-production-verified');}
 assert.equal(a.counts.currentExistingProvenanceNeeded,6);assert.equal(a.counts.productionUnprocessedAtStart,67);assert.equal(a.counts.remainingCurrentProductionUnprocessed,67);
});

test('GM generations, similar100–400 names, ZEISS and A-looking URL keep manufacturer identity distinct',()=>{
 for(const pair of [['SEL2470GM','SEL2470GM2'],['SEL70200GM','SEL70200GM2'],['SEL85F14GM','SEL85F14GM2'],['SEL100400','SEL100400MC'],['SEL100400MC','SEL100400GM']])for(const c of pair)assert.equal(item(c).status,'released/current');
 assert.equal(item('SEL35F28Z').manufacturer,'Sony');assert.equal(item('SEL35F28Z').productFamily,'Sony/ZEISS ZA');assert.equal(item('SEL28702').physicalMount,'Sony E');assert.match(item('SEL28702').officialUrl,/a-mount-lenses/);assert.equal(item('SEL28702').status,'announced/upcoming');
});

test('FE/APSC share Sony E physical mount while crop and native focal values remain independent',()=>{
 assert.equal(a.formatPolicy.FEIsSeparateMount,false);assert.equal(item('SELP1020G').physicalMount,'Sony E');assert.equal(item('SEL40F25G').physicalMount,'Sony E');assert.equal(item('SELP1020G').sensorFormatCoverage,'APS-C');assert.equal(item('SEL40F25G').sensorFormatCoverage,'35mm full-frame');
 assert.deepEqual(spec('SELP1020G').focalMm,[10,20]);assert.deepEqual(spec('SELP1020G').equivalentOnAPSCMm,[15,30]);assert.deepEqual(spec('SEL40F25G').focalMm,[40,40]);assert.deepEqual(spec('SEL40F25G').equivalentOnAPSCMm,[60,60]);assert.match(a.formatPolicy.apscLensOnFullFrame,/crop/);
});

test('Actual interchangeable prime and zoom endpoints normalize independently to mm',()=>{
 for(const [type,min,max] of [['prime',40,40],['zoom',24,70]]){
  const f=fixture([['specs.focal.min',min,'mm'],['specs.focal.max',max,'mm']],type);valid(f);assert.deepEqual(f.staging.product.specs.focal,{min,max});assert.ok(f.staging.claims.every(c=>c.unit==='mm'&&c.rawUnit==='mm'));
 }
 assert.deepEqual(normalizeClaimValue('specs.focal.min',4,'cm'),{value:40,unit:'mm',unknown:false});const badUnit=fixture([['specs.focal.min',40,'ft']]);assert.ok(validateStagingBatch([badUnit.staging],badUnit.context).items[0].errors.some(e=>e.code==='UNSUPPORTED_UNIT'));
});

test('Maximum constant and variable apertures preserve both endpoints and never reuse minimum selectable f-number',()=>{
 for(const [wide,tele] of [[2.8,2.8],[4,5.6]]){const f=fixture([['specs.aperture.wide',wide,null],['specs.aperture.tele',tele,null]]);valid(f);assert.deepEqual(f.staging.product.specs.aperture,{wide,tele});validateSpecValue(f.staging.product.specs.aperture,'specs.aperture');}
 assert.deepEqual(spec('SEL2860').maximumAperture,[4,5.6]);assert.deepEqual(spec('SEL2860').minimumSelectableAperture,[22,32]);assert.equal(item('SELC1635G').maximumAperture,null);assert.equal(item('SELC1635G').apertureLabel,'T3.1 (not F-number)');
});

test('Lens OSS is boolean independent of body IBIS, standalone grams and AF/MF focus conditions',()=>{
 const f=fixture([['specs.stabilization',true,null],['specs.weight',602,'g'],['specs.minFocusM',280,'mm',{focusMode:'AF'}],['specs.minFocusConditions','AF nominal; MF alternatives require separate source conditions',null]]);valid(f);
 assert.equal(f.staging.product.specs.weight,602);assert.equal(f.staging.product.specs.stabilization,true);assert.equal(f.staging.product.specs.ibis,undefined);assert.equal(f.staging.product.specs.minFocusM,0.28);assert.equal(f.staging.product.specs.weightBasis,undefined);
 assert.equal(spec('SEL90M28G').lensOss,true);assert.equal(spec('SEL40F25G').lensOss,false);assert.deepEqual(spec('SEL40F25G').minimumFocusM,{AF:0.28,MF:0.25});assert.deepEqual(spec('SEL40F25G').maximumMagnification,{AF:0.2,MF:0.23});assert.deepEqual(spec('SEL90M28G').diameterLengthMm,[79,130.5]);
});

test('UNKNOWN stays null; reversed/negative focal/aperture ranges and real source conflicts fail',()=>{
 const unknown=fixture([['specs.stabilization','UNKNOWN',null],['specs.focal.min',null,null]]);valid(unknown);assert.equal(unknown.staging.product.specs.stabilization,null);assert.equal(unknown.staging.product.specs.focal.min,null);
 for(const rows of [[['specs.focal.min',70,'mm'],['specs.focal.max',24,'mm']],[['specs.aperture.wide',5.6,null],['specs.aperture.tele',4,null]],[['specs.focal.min',-1,'mm']]]){const f=fixture(rows);assert.equal(validateStagingBatch([f.staging],f.context).valid,false);}
 const f=fixture([['specs.focal.min',40,'mm']]);const c={...f.staging.claims[0],value:41,rawValue:41};c.claimId=createClaimId(c);f.staging.claims.push(c);assert.ok(validateStagingBatch([f.staging],f.context).items[0].errors.some(e=>e.code==='CONFLICTING_CLAIM_VALUES'));
});

test('Strict existing canonical contract rejects malformed lens types and unsupported body/format/magnification dimensions',()=>{
 for(const [path,v] of [['specs.aperture.wide','F2.8'],['specs.focal.min',{}],['specs.stabilization','OSS'],['specs.minFocusM',[]],['specs.weight',false]])assert.throws(()=>validateSpecValue(v,path));
 for(const [key,value] of [['dimensions',[79,130.5]],['maximumMagnification',1],['minimumAperture',22],['ibis',{present:true}]]){const c=structuredClone(canonical);c.lenses[0].specs[key]=value;assert.throws(()=>validateCanonical(c,vocab),/Wrong product specification/);}
 const covered=structuredClone(canonical);covered.lenses[0].specs.formatCoverage='APS-C';assert.equal(validateCanonical(covered,vocab),true);covered.lenses[0].specs.formatCoverage='FE';assert.throws(()=>validateCanonical(covered,vocab),/Invalid lens format coverage/);
 assert.equal(a.readiness.pilotProductionPermitted,false);assert.equal(a.readiness.supportedCanonicalLensKeys.includes('minFocusConditions'),true);assert.equal(a.readiness.blockers.length,3);
});

test('Existing ID/model identity guard blocks implicit legacy backfill without touching canonical',async t=>{
 const old=json('src/data/ingestion/transactions/production-hasselblad-bodies-001/after.json').lenses.find(l=>l.id==='sony-fe-40-g');
 const f=await newProductFixture(t,{mutateRaw:r=>{const l=r.items[1];l.identity={name:old.name,brand:old.brand,model:'Unauthorized replacement model',aliases:old.aliases,mount:old.mount,type:old.type};},mutateIdentityMap:map=>{map.entries[1].productId=old.id;}});
 const c=JSON.parse(f.before);c.lenses[c.lenses.findIndex(l=>l.id===old.id)]=structuredClone(old);f.before=JSON.stringify(c,null,2)+'\n';const {writeFile}=await import('node:fs/promises');await writeFile(f.p.canonical,f.before);const m=JSON.parse(await readFile(f.p.manifest));m.canonicalBaselineDigest=createHash('sha256').update(f.before).digest('hex');await writeFile(f.p.manifest,JSON.stringify(m,null,2)+'\n');
 const results=pipeline(f);assert.notEqual(results.at(-1).status,0);assert.match(results.at(-1).stdout,/MODEL_IDENTITY_MISMATCH/);await assert.rejects(approveNew(f));assert.equal(await readFile(f.p.canonical,'utf8'),f.before);
});

test('Existing lens name alias prevents creating a duplicate under a new product ID',async t=>{
 const old=canonical.lenses.find(l=>l.id==='sony-fe-40-g');const f=await newProductFixture(t,{mutateRaw:r=>{r.items[1].identity.name=old.name;}});const results=pipeline(f);assert.notEqual(results.at(-1).status,0);assert.match(results.at(-1).stdout,/ALIAS_COLLISION|EQUIVALENT_EXISTING_PRODUCT/);assert.equal(await readFile(f.p.canonical,'utf8'),f.before);
});

test('Missing lens focal units are blocked before approval/apply even while early validate is a recorded readiness gap',async t=>{
 const f=await newProductFixture(t,{mutateRaw:r=>{const o=r.items[1].observations.find(o=>o.path==='specs.focal.min');o.rawUnit=null;r.evidenceExcerpt[o.evidenceRef].unit=null;}});const results=pipeline(f);
 if(results.every(r=>r.status===0))await assert.rejects(approveNew(f),/Explicit original unit required/);
 else assert.match(results.at(-1).stdout,/UNIT_REQUIRED|unit/i);
 assert.equal(await readFile(f.p.canonical,'utf8'),f.before);assert.equal(a.readiness.isolatedDiagnosticProbes.find(p=>p.name==='lens-focal-missing-unit').approval,'rejected');
});

test('Lens-only synthetic transaction has explicit approval, coherent provenance and already-canonicalized replay',async t=>{
 const f=await newProductFixture(t,{mutateRaw:r=>{r.items=r.items.filter(i=>i.productType==='lens');}});assert.ok(pipeline(f).every(r=>r.status===0));const approval=await approveNew(f);assert.equal((await applyBatch(f.root,newBatchId)).status,'canonicalized');const afterBytes=await readFile(f.p.canonical,'utf8'),after=JSON.parse(afterBytes),before=JSON.parse(f.before);
 assert.deepEqual(after.bodies,before.bodies);assert.equal(after.lenses.length,before.lenses.length+1);assert.equal(createHash('sha256').update(afterBytes).digest('hex'),approval.expectedCanonicalDigest);const l=after.lenses.find(l=>l.id==='sony-stage3-test-lens-35-f2');assert.equal(l.identityEvidence.verification,'verified');assert.ok(l.fieldEvidence['specs.focal.min'].claimIds.length);assert.equal(l.specs.stabilization,null);assert.equal(validateCanonical(after,vocab),true);
 const tx=JSON.parse(await readFile(f.p.transaction+'/evidence.json'));assert.equal(tx.approval.diffDigest,digestValue(tx.bundle.diff));const replay=await applyBatch(f.root,newBatchId);assert.equal(replay.status,'already-canonicalized');assert.equal(replay.canonicalMatches,true);assert.equal(await readFile(f.p.canonical,'utf8'),afterBytes);
});

test('No production was forced, worker tokens are zero and conditional six family batches partition62 remaining lenses',()=>{
 assert.equal(a.pilot.status,'blocked-before-collection');assert.equal(a.pilot.productionManifestCreated,false);assert.equal(a.pilot.candidates.length,5);assert.ok(a.pilot.candidates.every(c=>item(c.manufacturerModelCode).status==='released/current'));
 assert.equal(a.pilot.workerCalls,0);assert.equal(a.pilot.workerTotalTokens,0);assert.equal(a.pilot.actualNew,0);assert.equal(a.pilot.actualExistingEnrichment,0);
 const future=a.futurePlan.batches.flatMap(b=>b.modelCodes),selected=a.pilot.candidates.map(c=>c.manufacturerModelCode);assert.equal(a.futurePlan.batches.length,6);assert.equal(future.length,62);assert.equal(new Set(future).size,62);assert.deepEqual([...future,...selected].sort(),current.map(c=>c.manufacturerModelCode).sort());assert.ok(a.futurePlan.batches.every(b=>b.count>=8&&b.count<=12&&b.count===b.modelCodes.length));
 assert.equal(a.checkpoint.productionRestartAllowed,false);
});
