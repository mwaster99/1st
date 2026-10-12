import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {proposedCanonical, verifyIncoming, validateCanonical, validateSpecValue} from '../scripts/objective/merge.mjs';
import {createSourceId, digestValue, getAtPath, normalizeSearch, validateStagingBatch} from '../scripts/objective/rules.mjs';
import {BODY_BY_ID, CAMERA_LENSES, getIntegratedLens} from '../src/cameraData.js';
const root=new URL('../',import.meta.url),base='src/data/ingestion/',batch='production-om-system-bodies-001',tx=base+'transactions/'+batch+'/';
const read=p=>readFileSync(new URL(p,root)),json=p=>JSON.parse(read(p)),sha=p=>createHash('sha256').update(read(p)).digest('hex');
const audit=json(base+'om-system-coverage-audit-2026-10-12.json'),old=json(base+audit.previousSnapshot),after=json(tx+'after.json'),current=json('src/data/cameraProducts.json'),e=json(tx+'evidence.json');
const ids=old.selected,body=id=>after.bodies.find(b=>b.id===id),stage=id=>e.bundle.stagings.find(s=>s.product.id===id),claim=(id,path)=>stage(id).claims.find(c=>c.path===path);
const covers=(field,scope)=>field===scope||field.startsWith(scope+'.');
const leaves=(v,p='specs')=>v==null?[]:typeof v!=='object'||Array.isArray(v)?[p]:Object.entries(v).flatMap(([k,c])=>leaves(c,p+'.'+k));
const context={canonical:json(tx+'before.json'),vocab:e.bundle.vocab,rawDocuments:new Map(Object.entries(e.bundle.raws))};

test('OM Japan fresh galleries cover all twelve identities, with no silent status/card changes',()=>{
 assert.match(audit.denominatorPolicy,/Japan official current catalog/);assert.match(audit.denominatorPolicy,/NOT Korea/);
 assert.equal(audit.auditDate,'2026-10-12');assert.deepEqual(audit.counts,{officialCards:12,baseIdentities:12,releasedCurrentInScope:9,canonicalized:9,productionProvenanceComplete:9,announcedUpcoming:1,deferredSpecial:2,linkedVariants:0,unprocessedReleasedCurrent:0,duplicateAmbiguous:0});
 assert.deepEqual(audit.galleryAudit.map(g=>g.officialRecheck.cards.length),[9,2,1]);
 for(const g of audit.galleryAudit){assert.deepEqual(g.officialRecheck.cards,g.modelCardLabels);assert.equal(g.officialRecheck.status,200);assert.deepEqual(g.modelCardLabels,old.galleryEvidence.find(o=>o.url===g.url).modelCardLabels);}
 assert.equal(new Set(audit.cards.map(c=>c.cardKey)).size,12);assert.equal(new Set(audit.cards.map(c=>c.manufacturerModelCode)).size,12);
 for(const c of audit.cards){assert.equal(c.officialRecheck.status,200);assert.ok(['released/current','announced/upcoming','deferred-special-category'].includes(c.classification));if(c.classification==='released/current'){assert.ok(current.bodies.some(b=>b.id===c.canonicalId));assert.equal(c.status,'canonicalized');assert.ok(c.releaseDate<audit.auditDate);}}
 for(const changes of Object.values(audit.changes))assert.deepEqual(changes,[]);
});

test('OM upcoming PEN stays outside required coverage and does not alias released PEN E-P7',()=>{
 const c=audit.cards.find(c=>c.cardKey==='pen-upcoming');assert.equal(c.canonicalId,null);assert.equal(c.classification,'announced/upcoming');assert.match(audit.penStatus.evidence,/2026年10月下旬/);assert.equal(audit.penStatus.productionRequired,false);
 assert.ok(body('om-e-p7'));assert.ok(!audit.products.some(p=>p.model==='PEN'));assert.ok(!after.bodies.some(b=>b.brand==='OM System'&&b.model==='PEN'));
});

test('OM ASTRO independent modified cameras retain explicit scope, filter bundle and nonpermanent deferral',()=>{
 assert.equal(audit.specialProducts.length,2);const scope=json(base+'catalog-scope.json').entries;
 for(const s of audit.specialProducts){assert.equal(s.classification,'independent specialty product');assert.equal(s.scopeStatus,'deferred-special-category');assert.equal(s.permanentExclusion,false);assert.match(s.infraredEvidence,/IRカット/);assert.match(s.visibleLightEvidence,/一般的/);assert.match(s.baseRelation,/not base alias/);assert.ok(s.reconsideration.length>40);const policy=scope.find(e=>e.brand==='OM System'&&e.model===s.model);assert.equal(policy.scopeStatus,s.scopeStatus);assert.equal(policy.reconsideration,s.reconsideration);assert.ok(!after.bodies.some(b=>b.model===s.model));}
 assert.match(audit.specialProducts.find(s=>s.model==='E-M1 Mark III ASTRO').offering,/BMF-LPC01.*BMF-SE01.*not accessory-only/);
});

test('OM model generations and Olympus labels resolve once without canonical or identity-map collisions',()=>{
 const map=json(base+'identity-map.json').entries,owners=new Map();
 for(const p of audit.products){assert.equal(current.bodies.filter(b=>b.id===p.productId).length,1);const mappings=map.filter(m=>m.manufacturer==='OM System'&&m.manufacturerModelCode===p.model);assert.equal(mappings.length,1);assert.equal(mappings[0].productId,p.productId);assert.equal(stage(p.productId).manufacturerModelCode,p.model);for(const name of [body(p.productId).name,body(p.productId).model,...body(p.productId).aliases]){const key=normalizeSearch(name);assert.ok(!owners.has(key)||owners.get(key)===p.productId);owners.set(key,p.productId);}}
 assert.notEqual(body('om-1').id,body('om-1-ii').id);assert.notEqual(body('om-5').id,body('om-5-ii').id);assert.ok(!body('om-3').aliases.some(a=>/astro/i.test(a)));assert.ok(!body('om-e-m1-iii').aliases.some(a=>/astro/i.test(a)));assert.equal(validateCanonical(current,json(base+'vocab.json')),true);
});

test('All OM known objective leaves have matching verified claims, raw and manufacturer scope',()=>{
 let known=0,paths=0,structured=0,claims=0,sourceLinks=0;
 for(const p of audit.products){const b=body(p.productId),s=stage(b.id);assert.equal(p.productionProvenanceComplete,true);assert.ok(b.sources.every(src=>src.type==='manufacturer'));assert.equal(s.sources.length,p.rawSourceCount);sourceLinks+=b.sources.length;paths+=Object.keys(b.fieldEvidence).length;claims+=s.claims.length;
  for(const field of leaves(b.specs)){known++;assert.ok(Object.entries(b.fieldEvidence).some(([scope,v])=>covers(field,scope)&&v.verification==='verified'),b.id+'/'+field);}
  for(const [field,v] of Object.entries(b.fieldEvidence)){assert.equal(v.verification,'verified');for(const id of v.claimIds){const c=s.claims.find(c=>c.claimId===id);assert.ok(c);assert.equal(c.path,field);assert.equal(c.verification,'verified');assert.deepEqual(c.value,getAtPath(b,field));assert.ok(e.bundle.raws[c.sourceId]);assert.ok(b.sources.some(src=>src.sourceId===c.sourceId&&src.fields.some(scope=>covers(field,scope))));}}
  if(b.identityEvidence){structured++;assert.equal(b.identityEvidence.sourceId,s.identityEvidence.sourceId);}else{assert.equal(s.identityEvidence.verification,'verified');assert.ok(b.sources.some(src=>src.sourceId===s.identityEvidence.sourceId&&src.fields.includes('specs.releaseDate')));assert.ok(b.sources.some(src=>src.type==='manufacturer'&&src.fields.includes('identity')));assert.ok(audit.findings.shouldFix.some(f=>f.productId===b.id&&f.path==='identityEvidence'));}
 }
 assert.deepEqual([known,paths,structured,claims,sourceLinks],[258,193,7,231,24]);
 assert.deepEqual(audit.provenanceSummary,{knownObjectiveLeaves:258,verifiedKnownLeaves:258,manufacturerReferenceOnly:0,legacyOnly:0,unclassifiedKnownLeaves:0,sourceLessKnownLeaves:0,verifiedFieldEvidencePaths:193,structuredIdentityEvidence:7,indirectIdentityEvidence:2,productionClaims:231,knownClaims:193,unknownClaims:38,rawSources:22,canonicalSourceLinks:24});
});

test('OM existing two bodies retain IDs and explicit precision approvals, not duplicate coverage',()=>{
 const before=context.canonical,a=json(base+'approvals/'+batch+'.json'),d=e.bundle.diff;
 for(const id of ['om-1-ii','om-5']){assert.equal(before.bodies.filter(b=>b.id===id).length,1);assert.equal(after.bodies.filter(b=>b.id===id).length,1);assert.equal(before.bodies.find(b=>b.id===id).specs.sensor.megapixels,20.4);assert.equal(body(id).specs.sensor.megapixels,20.37);const changes=d.items.find(i=>i.productId===id).changes;assert.ok(changes.some(c=>c.category==='same-value/new-evidence'));assert.ok(changes.some(c=>c.category==='null-fill'));const c=changes.find(c=>c.category==='value-conflict');assert.equal(c.path,'specs.sensor.megapixels');assert.ok(a.decisions.some(v=>v.claimId===c.claimId&&v.action==='accept'));}
 assert.match(a.approvalReason,/20.4.*20.37/);
});

test('OM regional official sensor size differences are explicit unresolved findings, not guessed rounding',()=>{
 assert.equal(audit.regionalSourceDiscrepancies.length,2);for(const r of audit.regionalSourceDiscrepancies){assert.deepEqual(body(r.productId).specs.sensor.sizeMm,[17.4,13]);assert.deepEqual(r.global.value,[17.3,13]);assert.match(r.jp,/17.4 mm/);assert.match(r.global.excerpt,/17.3 x 13.0mm/);assert.match(r.resolution,/Unresolved/);assert.ok(audit.findings.shouldFix.some(f=>f.productId===r.productId&&f.path===r.path));}
});

test('OM MFT sources, native pixels and computational modes stay separate from Panasonic and output composites',()=>{
 for(const id of ids.filter(id=>id!=='om-tg7')){assert.equal(body(id).mount,'Micro Four Thirds');assert.equal(body(id).kind,'interchangeable');assert.equal(body(id).specs.sensor.megapixels,['om-e-m10-iv','om-e-p7'].includes(id)?20.3:20.37);assert.equal(claim(id,'specs.sensor.megapixels').conditions.notTotalOrComposite,true);for(const s of stage(id).sources)assert.match(new URL(s.url).hostname,/(^|\.)omsystem\.com$/);}
 const c=claim('om-1-ii','specs.sensor.megapixels');assert.ok(c.conditions.computationalModesNotSensorMP.some(v=>v.includes('80M')));assert.ok(c.conditions.computationalModesNotSensorMP.some(v=>v.includes('ライブND')));
 for(const id of ids)assert.equal(claim(id,'specs.burst.maxElectronicFps').conditions.proCaptureNotSustained,true);
});

test('OM body IBIS and Sync IS have distinct scoped ratings; TG7 sensor shift is not lens IS or inferred axes',()=>{
 for(const id of ids){validateSpecValue(body(id).specs.ibis,'specs.ibis');assert.equal(claim(id,'specs.ibis').conditions.ratingScope,'body-only');}
 for(const id of ['om-3','om-5-ii']){assert.equal(body(id).specs.ibis.stops,6.5);const c=claim(id,'specs.ibis').conditions;assert.equal(c.peripheralStops,5.5);assert.equal(c.syncIS.combinedStops,7.5);assert.equal(c.syncIS.notBodyOnly,true);assert.match(c.testLens,/CIPA2024/);}
 assert.equal(body('om-1').specs.ibis.stops,7);assert.equal(claim('om-1','specs.ibis').conditions.syncIS.combinedStops,8);assert.equal(body('om-tg7').specs.ibis.stops,2.5);assert.equal(body('om-tg7').specs.ibis.axes,null);assert.match(audit.products.find(p=>p.productId==='om-tg7').freshSpecExcerpts.stabilization,/撮像センサーシフト式/);
});

test('OM TG7 actual and equivalent mm are independently traced through diff without an extra lens asset',()=>{
 const b=body('om-tg7'),d=e.bundle.diff.items.find(i=>i.productId===b.id);assert.equal(b.kind,'fixed');assert.equal(b.mount,null);assert.deepEqual(b.specs.fixedLens,{focal:{min:4.5,max:18},equivalentFocal:{min:25,max:100},aperture:{wide:2,tele:4.9}});
 for(const p of ['focal.min','focal.max','equivalentFocal.min','equivalentFocal.max']){const c=claim(b.id,'specs.fixedLens.'+p);assert.equal(c.unit,'mm');assert.equal(c.rawUnit,'mm');assert.equal(d.changes.find(v=>v.claimId===c.claimId).unit,'mm');assert.equal(c.value,getAtPath(b,c.path));}
 const lens=getIntegratedLens(BODY_BY_ID[b.id]);assert.equal(lens.weight,null);assert.equal(lens.includedInBodyId,b.id);assert.ok(!CAMERA_LENSES.some(l=>l.id.startsWith(b.id)));assert.equal(b.specs.weight,249);assert.deepEqual(after.lenses,context.canonical.lenses);
});

test('OM weight, lens-dependent IP, video and electronic burst conditions remain sourced and UNKNOWN stays unknown',()=>{
 for(const id of ids){const b=body(id);assert.equal(b.specs.weightBasis,'battery-and-card');assert.equal(claim(id,'specs.weight').conditions.weightBasis,b.specs.weightBasis);assert.equal(claim(id,'specs.bodyOnlyWeight').conditions.weightBasis,'body-only');assert.ok(claim(id,'specs.weight').conditions.sourceWording);assert.ok(b.specs.weight>b.specs.bodyOnlyWeight);validateSpecValue(b.specs.lcd,'specs.lcd');assert.equal(b.specs.video.cropAtMax??null,null);assert.match(claim(id,'specs.video.max').conditions.conditions,/external HDMI RAW is separate/);assert.ok(claim(id,'specs.burst.maxElectronicFps').conditions.sourceWording);}
 for(const id of ['om-1-ii','om-3','om-5-ii','om-1','om-5'])assert.match(claim(id,'specs.weatherSealing').conditions.officialRating,/IP53 with IP53 lens; IPX1/);
 assert.match(claim('om-tg7','specs.weatherSealing').conditions.officialRating,/IPX8.*IP6X/);
 for(const id of ['om-1-ii','om-3','om-1']){assert.equal(body(id).specs.video.max,'C4K 59.94p');assert.equal(claim(id,'specs.video.max').conditions.frameRate,59.94);assert.equal(claim(id,'specs.video.max').conditions.internal,true);assert.equal(body(id).specs.video.bitDepth,10);}
 for(const id of ['om-5','om-e-m1-iii','om-e-m10-iv','om-e-p7','om-tg7'])assert.equal(claim(id,'specs.video.max').conditions.actualFractionalFrameRate,null);
});

test('OM negative operating temperatures remain valid but invalid physical numbers and reversed ranges still fail',()=>{
 assert.doesNotThrow(()=>validateSpecValue(-10,'specs.operatingTemperatureC.min'));assert.throws(()=>validateSpecValue(-10,'specs.weight'));assert.throws(()=>validateSpecValue(Infinity,'specs.operatingTemperatureC.min'));
 assert.equal(ids.filter(id=>body(id).specs.operatingTemperatureC.min===-10).length,7);
 for(const mutate of [b=>b.specs.weight=-1,b=>b.specs.operatingTemperatureC={min:40,max:-10},b=>b.specs.fixedLens.focal={min:18,max:4.5}]){const bad=structuredClone(after);mutate(bad.bodies.find(b=>b.id==='om-tg7'));assert.throws(()=>validateCanonical(bad,e.bundle.vocab));}
 assert.equal(audit.temperatureReview.testOnly,true);assert.equal(audit.temperatureReview.finiteAndOrderedRangesRetained,true);
});

test('OM sealed production chain digests, strict validation and idempotent replay reproduce all nine products',()=>{
 const m=json(base+'batches/'+batch+'.json'),a=json(base+'approvals/'+batch+'.json'),j=json(tx+'journal.json');
 for(const [path,h]of Object.entries(audit.sealedFileDigests)){// Mutable shared registries may grow in later batches; use their sealed bundle below.
  if(![base+'vocab.json',base+'identity-map.json'].includes(path))assert.equal(sha(path),h,path);
 }
 const {approvalId,...approvalBody}=a;assert.equal(approvalId,'approval-'+digestValue(approvalBody));assert.deepEqual(a.incomingArtifactDigests,e.bundle.artifactDigests);assert.equal(a.incomingDigest,digestValue(e.bundle.artifactDigests));assert.equal(a.diffDigest,digestValue(e.bundle.diff));assert.deepEqual(json(base+'approvals/'+batch+'/'+a.approvalId+'.json'),a);assert.deepEqual(e.approval,a);assert.equal(j.evidenceDigest,digestValue(e));assert.equal(j.phase,'canonicalized');assert.equal(m.apply.state,'canonicalized');assert.equal(m.lastSuccessfulGate,'apply');
 assert.equal(sha(tx+'before.json'),m.canonicalBaselineDigest);assert.equal(sha(tx+'after.json'),m.expectedCanonicalDigest);assert.equal(audit.canonicalDigest,m.expectedCanonicalDigest);
 for(const i of m.items){assert.equal(i.state,'canonicalized');assert.equal(i.stagingDigest,digestValue(stage(i.productId)));assert.equal(i.diffDigest,digestValue(e.bundle.diff));for(const [n,id]of i.sourceIds.entries()){const r=json(base+'raw/'+id+'.json');assert.equal(i.rawDigests[n],digestValue(r));assert.equal(createSourceId(r),id);assert.equal(r.contentDigest,digestValue(r.evidenceExcerpt));assert.deepEqual(e.bundle.raws[id],r);}}
 verifyIncoming(e.bundle,context.canonical);assert.equal(validateStagingBatch(e.bundle.stagings,context).valid,true);
 const replay=proposedCanonical(context.canonical,e.bundle,a.decisions,a.productOperations);assert.deepEqual(replay.canonical,after);assert.equal(replay.digest,m.expectedCanonicalDigest);assert.deepEqual(proposedCanonical(after,e.bundle,a.decisions,a.productOperations).canonical,after);
 assert.equal(audit.artifactChecks[0].digestMismatches,0);assert.equal(audit.artifactChecks[0].missingArtifacts,0);assert.equal(audit.artifactChecks[0].recordedProductionReapply.status,'already-canonicalized');assert.equal(audit.artifactChecks[0].recordedProductionReapply.canonicalMatches,true);
});

test('OM fresh audit evidence preserves real UTC times and keeps regional limitations and backlog out of coverage claims',()=>{
 assert.equal(audit.officialFetches.length,36);for(const f of audit.officialFetches){assert.equal(new Date(f.accessedAt).toISOString(),f.accessedAt);assert.equal(f.accessedAt.slice(0,10),audit.auditDate);assert.match(f.sha256,/^[a-f0-9]{64}$/);assert.match(new URL(f.url).hostname,/(^|\.)omsystem\.com$/);assert.equal(f.status,f.url==='https://explore.omsystem.com/kr/ko/'?404:200);}
 assert.deepEqual([audit.findings.critical.length,audit.findings.shouldFix.length,audit.findings.acceptableUnknown.length],[0,4,46]);assert.equal(audit.findings.shouldFix.filter(f=>f.path==='identityEvidence').length,2);
 for(const u of audit.findings.acceptableUnknown)assert.equal(getAtPath(body(u.productId),u.path)??null,null);
 assert.equal(audit.regionalLimitation.koreaRetailCompletionClaimed,false);assert.equal(audit.conclusion.firstCoverageComplete,true);assert.match(audit.conclusion.scope,/Japan official/);assert.ok(audit.knownBacklog.includes('cross-brand recommendation parser 29.97 -> 97'));assert.equal(audit.workerUsage.calls,0);
});
