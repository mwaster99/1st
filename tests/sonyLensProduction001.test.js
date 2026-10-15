import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {digestValue,createSourceId,createClaimId,getAtPath,formatCanonicalDiff,validateStagingBatch} from '../scripts/objective/rules.mjs';
import {validateCanonical,verifyIncoming,proposedCanonical} from '../scripts/objective/merge.mjs';
import {jsonBytes} from '../scripts/objective/storage.mjs';

const root=new URL('../',import.meta.url),base='src/data/ingestion/',batch='production-sony-e-lenses-001',tx=base+'transactions/'+batch+'/';
const bytes=p=>readFileSync(new URL(p,root)),json=p=>JSON.parse(bytes(p)),sha=p=>createHash('sha256').update(bytes(p)).digest('hex');
const a=json(base+'sony-e-lenses-production-001.json'),e=json(tx+'evidence.json'),before=json(tx+'before.json'),after=json(tx+'after.json'),manifest=json(base+'batches/'+batch+'.json'),approval=json(base+'approvals/'+batch+'.json');
const ids=['sony-fe-40-g','sony-fe-24-70-gm2','sony-fe-28-60','sony-e-pz-10-20-f4-g','sony-fe-90-f28-macro-g-oss'];
const codes=['SEL40F25G','SEL2470GM2','SEL2860','SELP1020G','SEL90M28G'];
const stage=id=>e.bundle.stagings.find(s=>s.product.id===id),lens=id=>after.lenses.find(p=>p.id===id),claim=(id,p)=>stage(id).claims.find(c=>c.path===p);
const ctx={canonical:before,vocab:e.bundle.vocab,rawDocuments:new Map(Object.entries(e.bundle.raws))};

test('Lens pilot selects exactly five reviewed Korea current products, excluding upcoming and teleconverters',()=>{
 assert.equal(a.startWorkingTree,'clean');assert.deepEqual(a.products.map(p=>p.manufacturerModelCode),codes);assert.deepEqual(a.products.map(p=>p.productId),ids);assert.equal(a.officialCurrentReview.renderedCards,73);assert.equal(a.officialCurrentReview.selectedPresent,5);assert.ok(a.products.every(p=>p.officialCurrentConfirmed&&p.classification==='released/current'&&p.state==='canonicalized'));
 const inventory=json(base+a.inventoryReference);for(const code of codes){const item=inventory.items.find(p=>p.manufacturerModelCode===code);assert.equal(item.status,'released/current');assert.equal(item.scopeClassification,'native-optical-lens');}
 assert.deepEqual(a.officialCurrentReview.previousSnapshotDifferences,[]);assert.equal(a.countsAfter.upcomingExcluded,4);assert.equal(a.countsAfter.teleconverterExcluded,2);
});

test('Atomic pilot adds two lenses and enriches three existing IDs without modifying any body, other lens or old prices',()=>{
 assert.equal(before.bodies.length,165);assert.equal(before.lenses.length,36);assert.equal(after.lenses.length,38);assert.deepEqual(after.bodies,before.bodies);assert.equal(after.bodies.length+after.lenses.length,203);
 for(const old of before.lenses){const current=lens(old.id);if(!ids.includes(old.id))assert.deepEqual(current,old);else for(const key of ['id','name','brand','mount','type','aliases','price'])assert.deepEqual(current[key],old[key]);}
 assert.deepEqual(a.products.map(p=>p.existing),[true,true,true,false,false]);for(const id of ids.slice(3)){assert.ok(!before.lenses.some(p=>p.id===id));assert.equal(lens(id).price.new.sourceType,'unknown');assert.equal(lens(id).price.new.value,null);assert.equal(lens(id).price.used.typical,null);}
});

test('Three model fills are explicitly approved, code-mapped and backed by identity-only manufacturer sources',()=>{
 assert.equal(a.approval.allowModelNullFill,true);assert.equal(a.approval.allowNewProducts,true);assert.equal(a.approval.allowValueConflicts,false);
 for(const [i,id] of ids.entries()){const s=stage(id),p=lens(id);assert.equal(p.model,codes[i]);assert.equal(p.identityEvidence.verification,'verified');assert.equal(e.bundle.identityMap.entries.filter(m=>m.productType==='lens'&&m.manufacturerModelCode===codes[i]&&m.productId===id).length,1);const op=approval.productOperations.find(o=>o.productId===id);assert.equal(op.operation,i<3?'update-product':'new-product');if(i<3){assert.equal(before.lenses.find(p=>p.id===id).model,undefined);assert.equal(op.modelNullFill.incomingValue,codes[i]);assert.equal(op.modelNullFill.identityEvidenceId,s.identityEvidence.evidenceId);assert.ok(p.sources.some(v=>v.sourceId===p.identityEvidence.sourceId&&v.fields.includes('model')&&v.fields.includes('identity')));}else assert.equal(op.modelNullFill,undefined);}
 assert.equal(approval.productOperations.filter(o=>o.modelNullFill).length,3);
});

test('Full-frame and APS-C coverage share Sony E physical mount and are field verified rather than name inferred',()=>{
 for(const id of ids){const p=lens(id);assert.equal(p.mount,'Sony E');assert.equal(p.specs.formatCoverage,id===ids[3]?'APS-C':'full-frame');assert.equal(claim(id,'specs.formatCoverage').conditions.coverageNotInferredFromName,true);assert.ok(p.fieldEvidence['specs.formatCoverage']);}
 assert.equal(e.bundle.vocab.mounts.some(m=>m.name==='Sony FE'),false);assert.equal(lens(ids[3]).type,'zoom');
});

test('Prime and zoom focal endpoints use explicit actual mm, never APS-C equivalent values',()=>{
 for(const [i,range] of [[0,[40,40]],[1,[24,70]],[2,[28,60]],[3,[10,20]],[4,[90,90]]]){assert.deepEqual(lens(ids[i]).specs.focal,{min:range[0],max:range[1]});for(const key of ['min','max']){const c=claim(ids[i],'specs.focal.'+key);assert.equal(c.rawUnit,'mm');assert.equal(c.unit,'mm');assert.equal(typeof c.value,'number');}}
 assert.deepEqual(claim(ids[3],'specs.focal.min').conditions.unpromotedEquivalentOnAPSCMm,[15,30]);assert.equal(lens(ids[3]).specs.equivalentFocal,undefined);
});

test('Maximum f-number endpoints preserve prime, constant and variable apertures separately from minimum aperture',()=>{
 for(const [i,range] of [[0,[2.5,2.5]],[1,[2.8,2.8]],[2,[4,5.6]],[3,[4,4]],[4,[2.8,2.8]]]){assert.deepEqual(lens(ids[i]).specs.aperture,{wide:range[0],tele:range[1]});for(const key of ['wide','tele']){const c=claim(ids[i],'specs.aperture.'+key);assert.equal(c.rawUnit,null);assert.equal(c.unit,null);assert.equal(typeof c.value,'number');}}
 assert.equal(claim(ids[2],'specs.aperture.wide').conditions.unpromotedMinimumSelectableAperture,'22-32');assert.equal(lens(ids[2]).specs.minimumAperture,undefined);
});

test('Four explicit no-lens-OSS rows become false, macro optical OSS true, and no body IBIS is asserted',()=>{
 for(const [i,id] of ids.entries()){assert.equal(lens(id).specs.stabilization,i===4);assert.equal(lens(id).specs.ibis,undefined);const c=claim(id,'specs.stabilization');assert.equal(c.conditions.bodyIbisNotAsserted,true);assert.equal(c.conditions.sourceText,i===4?'Optical SteadyShot™':'- (바디 통합)');}
});

test('Representative focus retains AF/MF and W/T alternatives without inventing modes for unspecified rows',()=>{
 assert.deepEqual(ids.map(id=>lens(id).specs.minFocusM),[0.28,0.21,0.3,0.2,0.28]);
 assert.deepEqual(claim(ids[0],'specs.minFocusM').conditions.officialFocusDistancesM,{AF:0.28,MF:0.25});assert.deepEqual(claim(ids[3],'specs.minFocusM').conditions.officialFocusDistancesM,{AF:0.2,MFwide:0.13,MFtele:0.17});
 for(const id of ids.slice(1,3)){assert.match(lens(id).specs.minFocusConditions,/focus mode not separately specified/);assert.equal(claim(id,'specs.minFocusM').conditions.representativeBasis,'wide endpoint; AF/MF unspecified');}
 assert.equal(claim(ids[4],'specs.minFocusM').conditions.unpromotedMaximumMagnification,1);assert.match(lens(ids[4]).specs.minFocusConditions,/macro 1:1/);
});

test('Standalone lens weight/filter values are official, while D×L/magnification/power zoom/weather remain unpromoted',()=>{
 assert.deepEqual(ids.map(id=>lens(id).specs.weight),[173,695,167,178,602]);assert.deepEqual(ids.map(id=>lens(id).specs.filterMm),[49,82,40.5,62,62]);
 for(const p of a.products){const l=lens(p.productId),c=claim(p.productId,'specs.weight');assert.equal(c.conditions.lensOnly,true);assert.equal(c.conditions.bodyExcluded,true);assert.deepEqual(c.conditions.unpromotedDiameterLengthMm,p.diameterLengthMm);for(const key of ['dimensions','maximumMagnification','powerZoom','weatherSealing','weightBasis'])assert.equal(l.specs[key],undefined);}
 assert.equal(a.products[3].unpromotedFacts.powerZoom,true);assert.equal(claim(ids[3],'specs.focal.min').conditions.unpromotedZoomSystem,'전원');assert.equal(a.products[0].unpromotedFacts.weather,null);
});

test('Two unique sources per product include identity-only evidence in the human summary and canonical provenance',()=>{
 for(const id of ids){const s=stage(id),p=lens(id),d=e.bundle.diff.items.find(d=>d.productId===id);assert.equal(s.sources.length,2);assert.equal(p.sources.length,2);assert.match(formatCanonicalDiff(d),/10 fields \/ 2 sources/);const identity=p.sources.find(v=>v.sourceId===s.identityEvidence.sourceId);assert.ok(identity.fields.includes('identity'));assert.ok(!s.claims.some(c=>c.sourceId===identity.sourceId));for(const src of s.sources)assert.equal(new URL(src.url).hostname,'www.sony.co.kr');}
});

test('All 50 supported spec leaves have verified field-level evidence linked to correct source and raw claims',()=>{
 let count=0;for(const id of ids){const p=lens(id),s=stage(id);assert.equal(s.claims.length,10);assert.equal(Object.keys(p.fieldEvidence).length,10);for(const [field,f] of Object.entries(p.fieldEvidence)){count++;assert.equal(f.verification,'verified');assert.equal(f.claimIds.length,1);const c=s.claims.find(c=>c.claimId===f.claimIds[0]);assert.equal(c.path,field);assert.deepEqual(getAtPath(p,field),c.value);assert.ok(p.sources.some(src=>src.sourceId===c.sourceId&&src.fields.includes(field)));const raw=e.bundle.raws[c.sourceId];assert.ok(raw.items[0].observations.some(o=>o.path===field));}}
 assert.equal(count,50);assert.equal(a.productionStatistics.knownSpecClaims,50);
});

test('Real raw-helper UTC timestamps are bounded by capture clock and all source/content digests are intact',()=>{
 assert.equal(Object.keys(e.bundle.raws).length,10);for(const [id,raw] of Object.entries(e.bundle.raws)){assert.equal(createSourceId(raw),id);assert.equal(raw.contentDigest,digestValue(raw.evidenceExcerpt));assert.equal(new Date(raw.accessedAt).toISOString(),raw.accessedAt);assert.ok(raw.accessedAt>=a.rawHelperTimestampWindow.start&&raw.accessedAt<=a.rawHelperTimestampWindow.end);assert.equal(raw.sourceType,'manufacturer');}
});

test('Worker task-per-product usage includes malformed attempt, one corrected retry and partial adoption without patches',()=>{
 assert.equal(a.workerTasks.length,5);assert.equal(new Set(a.workerTasks.map(w=>w.taskId)).size,5);assert.deepEqual(a.workerTotals,{inputTokens:4873,outputTokens:4975,totalTokens:9848});assert.deepEqual(a.workerStats,{actualApiAttempts:6,retries:1,failures:1,needsInformation:1});assert.deepEqual(a.workerTasks.map(w=>w.usage.totalTokens),[1353,2671,1716,2495,1613]);
 for(const p of a.products){assert.equal(existsSync(new URL('.cheap-worker-sony-lens001-'+p.manufacturerModelCode.toLowerCase()+'.txt',root)),false);assert.ok(a.workerTasks.find(w=>w.taskId===p.workerTaskId).discarded.length);}
 assert.equal(a.workerFixturesDeleted,true);assert.ok(a.workerTasks.every(w=>!w.patchApplied&&w.attempts.length<=2));assert.equal(a.humanIntervention.extraUserProductDecisions,0);
});

test('Strict production rejects missing/unsupported focal units, malformed aperture/OSS, true value conflicts and locked identity changes',()=>{
 assert.equal(validateStagingBatch(e.bundle.stagings,ctx).valid,true);
 for(const [field,value,code] of [['specs.aperture.wide','F2.8','INVALID_LENS_SPEC'],['specs.stabilization','OSS','INVALID_LENS_SPEC']]){const s=structuredClone(stage(ids[0]));s.claims.find(c=>c.path===field).value=value;assert.ok(validateStagingBatch([s],ctx).items[0].errors.some(e=>e.code===code));}
 for(const [unit,code] of [[null,'UNIT_REQUIRED'],['ft','UNSUPPORTED_UNIT']]){const s=structuredClone(stage(ids[0])),c=s.claims.find(c=>c.path==='specs.focal.min');c.rawUnit=unit;assert.ok(validateStagingBatch([s],ctx).items[0].errors.some(e=>e.code===code));}
 const s=structuredClone(stage(ids[0])),c=structuredClone(s.claims.find(c=>c.path==='specs.focal.min'));c.value=41;c.rawValue=41;c.claimId=createClaimId(c);s.claims.push(c);assert.ok(validateStagingBatch([s],ctx).items[0].errors.some(e=>e.code==='CONFLICTING_CLAIM_VALUES'));
 const changed=structuredClone(stage(ids[0]));changed.product.model='DIFFERENT';assert.ok(validateStagingBatch([changed],{...ctx,canonical:after}).items[0].errors.some(e=>e.code==='MODEL_IDENTITY_CONFLICT'));
 changed.product.model=codes[0];changed.product.aliases=[lens(ids[1]).name];assert.ok(validateStagingBatch([changed],ctx).items[0].errors.some(e=>e.code==='ALIAS_COLLISION'));
});

test('A single five-item transaction binds explicit approval, original files, expected digest and exact before/after/idempotent replay',()=>{
 const journal=json(tx+'journal.json');assert.equal(manifest.items.length,5);assert.ok(manifest.items.every(i=>i.state==='canonicalized'&&i.sourceIds.length===2));assert.equal(journal.phase,'canonicalized');assert.equal(sha(tx+'before.json'),manifest.canonicalBaselineDigest);assert.equal(sha(tx+'after.json'),manifest.expectedCanonicalDigest);assert.deepEqual(e.approval,approval);assert.deepEqual(json(base+'approvals/'+batch+'/'+approval.approvalId+'.json'),approval);
 for(const [file,digest] of Object.entries(e.bundle.artifactDigests)){
  if(file==='identity-map.json'||file==='vocab.json'){
   const archived=file==='identity-map.json'?e.bundle.identityMap:e.bundle.vocab,current=json(base+file);
   assert.equal(createHash('sha256').update(jsonBytes(archived)).digest('hex'),digest);
   for(const [key,value] of Object.entries(archived))assert.deepEqual(Array.isArray(value)?current[key].slice(0,value.length):current[key],value);
  }else assert.equal(sha(base+file),digest);
 }
 for(const item of manifest.items){assert.equal(item.stagingDigest,digestValue(stage(item.productId)));assert.deepEqual(item.rawDigests,item.sourceIds.map(id=>digestValue(e.bundle.raws[id])));}
 verifyIncoming(e.bundle,before);const replay=proposedCanonical(before,e.bundle,approval.decisions,approval.productOperations);assert.deepEqual(replay.canonical,after);assert.equal(replay.digest,manifest.expectedCanonicalDigest);assert.deepEqual(proposedCanonical(after,e.bundle,approval.decisions,approval.productOperations).canonical,after);assert.equal(a.checkpoint.reapply.status,'already-canonicalized');assert.equal(a.checkpoint.reapply.canonicalMatches,true);
});

test('Reviewed diff distinguishes same-value/new-evidence, null-fill, new-product and model metadata without conflicts',()=>{
 const categories=e.bundle.diff.items.flatMap(d=>d.changes).reduce((s,c)=>(s[c.category]=(s[c.category]??0)+1,s),{});assert.deepEqual(categories,{'same-value/new-evidence':18,'null-fill':12,'new-product':20});assert.equal(e.bundle.diff.items.filter(d=>d.modelNullFill).length,3);assert.ok(approval.decisions.every(d=>d.action==='accept'));assert.equal(a.productionStatistics.valueConflicts,0);assert.equal(a.productionStatistics.promotedSourceConflicts,0);
});

test('Current canonical passes contract and contains the five official identities while the remaining62 family plan is independent',()=>{
 const live=json('src/data/cameraProducts.json');assert.equal(validateCanonical(live,json(base+'vocab.json')),true);for(const id of ids)assert.ok(live.lenses.some(l=>l.id===id));
 assert.equal(a.countsAfter.currentSonyLensesProductionCompleted,5);assert.equal(a.countsAfter.currentSonyLensesProductionUnprocessed,62);const remaining=a.futurePlan.batches.flatMap(b=>b.modelCodes);assert.equal(remaining.length,62);assert.equal(new Set(remaining).size,62);assert.ok(remaining.every(c=>!codes.includes(c)));assert.ok(a.futurePlan.batches.every(b=>b.modelCodes.length===b.count));
});
