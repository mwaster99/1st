import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {proposedCanonical, verifyIncoming, validateCanonical, validateSpecValue} from '../scripts/objective/merge.mjs';
import {createSourceId, digestValue, getAtPath, normalizeSearch, validateStagingBatch} from '../scripts/objective/rules.mjs';
import {BODY_BY_ID, CAMERA_LENSES, getIntegratedLens} from '../src/cameraData.js';
import {buildEquipmentTransition, evaluateScenario, generateLensCandidates} from '../src/cameraScenarioEngine.js';

const root=new URL('../',import.meta.url),base='src/data/ingestion/',batch='production-leica-bodies-001',tx=base+'transactions/'+batch+'/';
const bytes=p=>readFileSync(new URL(p,root)),json=p=>JSON.parse(bytes(p)),sha=p=>createHash('sha256').update(bytes(p)).digest('hex');
const audit=json(base+'leica-coverage-audit-2026-10-14.json'),old=json(base+audit.previousSnapshot),e=json(tx+'evidence.json');
const after=json(tx+'after.json'),before=json(tx+'before.json'),current=json('src/data/cameraProducts.json');
const body=id=>after.bodies.find(b=>b.id===id),stage=id=>e.bundle.stagings.find(s=>s.product.id===id),claim=(id,path)=>stage(id).claims.find(c=>c.path===path);
const covers=(field,scope)=>field===scope||field.startsWith(scope+'.');
const leaves=(v,p='specs')=>v==null?[]:typeof v!=='object'||Array.isArray(v)?[p]:Object.entries(v).flatMap(([k,c])=>leaves(c,p+'.'+k));
const context={canonical:before,vocab:e.bundle.vocab,rawDocuments:new Map(Object.entries(e.bundle.raws))};

test('Fresh Leica Korea offers, paginated galleries, SL comparisons and selectors cover exactly37 offers/16 identities',()=>{
 assert.equal(audit.auditDate,'2026-10-14');assert.match(audit.denominatorPolicy,/Korea official current/);
 assert.deepEqual(audit.counts,{officialCards:37,baseIdentities:16,releasedCurrentDigital:12,canonicalizedDigital:12,productionProvenanceCompleteDigital:12,analogFilmCurrent:3,hybridInstantCurrent:1,linkedVariantsEditionsKits:21,announcedUpcoming:0,unprocessedDigital:0,duplicateAmbiguous:0});
 const offers=new Set(audit.galleryAudit.flatMap(g=>g.cards.map(c=>c.url)).concat(audit.selectorAudit.flatMap(s=>s.options.map(o=>o.url))));
 assert.equal(offers.size,37);assert.deepEqual([...offers].sort(),audit.currentOfferUrls);assert.deepEqual([...offers].sort(),old.cards.map(c=>c.officialUrl).sort());
 assert.equal(new Set(audit.cards.map(c=>c.cardKey)).size,37);assert.equal(new Set(audit.cards.map(c=>c.baseIdentity)).size,16);
 for(const family of ['m','system-cameras']){assert.ok(audit.galleryAudit.find(g=>g.key===`gallery-ko-KR-${family}-page1`).cards.length>0);assert.deepEqual(audit.galleryAudit.find(g=>g.key===`gallery-ko-KR-${family}-page2`).cards,[]);}
 assert.ok(audit.galleryAudit.find(g=>g.key==='ko-KR-sl').cards.some(c=>c.element==='family camera comparison primary button'&&c.url.endsWith('sl3-p-black')));
 assert.ok(!audit.currentOfferUrls.some(url=>/apo-macro-elmarit|summilux-sl-50|super-apo-summicron/.test(url)));
});

test('Leica fresh official identity/status checks retain all cards and distinguish fetch failure from product removal',()=>{
 for(const changes of Object.values(audit.changes))assert.deepEqual(changes,[]);
 for(const c of audit.cards){assert.equal(c.officialRecheck.status,200);assert.equal(c.releaseStatus,'released/current');assert.equal(new URL(c.officialUrl).hostname,'leica-camera.com');assert.ok(c.observedH1.length>0);}
 assert.deepEqual(audit.officialFetchSummary,{requests:108,uniqueUrls:107,http200:106,http502:2,productionRawUrlsReachable:28,technicalFileByteChanges:0,historicalQuickstartAttempts:2});
 for(const f of audit.officialFetches){assert.equal(new URL(f.url).hostname,'leica-camera.com');assert.equal(new Date(f.accessedAt).toISOString(),f.accessedAt);assert.equal(f.accessedAt.slice(0,10),audit.auditDate);if(f.status===200)assert.match(f.sha256,/^[a-f0-9]{64}$/);else{assert.equal(f.status,502);assert.match(f.url,/Q3_Quickstart-Guide/);}}
});

test('Twelve digital models map once to canonical and reviewed identity-map without aliases/generation collisions',()=>{
 const owners=new Map(),map=json(base+'identity-map.json').entries;
 assert.equal(audit.products.length,12);assert.equal(new Set(audit.products.map(p=>p.productId)).size,12);
 for(const p of audit.products){assert.equal(current.bodies.filter(b=>b.id===p.productId).length,1);assert.deepEqual(current.bodies.find(b=>b.id===p.productId),body(p.productId));assert.ok(p.productionProvenanceComplete);
  const entries=map.filter(x=>x.manufacturer==='Leica'&&x.manufacturerModelCode===p.model);assert.equal(entries.length,1);assert.equal(entries[0].productId,p.productId);
  for(const n of [body(p.productId).name,body(p.productId).model,...body(p.productId).aliases]){const key=normalizeSearch(n);assert.ok(!owners.has(key)||owners.get(key)===p.productId);owners.set(key,p.productId);}
 }
 assert.equal(validateCanonical(current,json(base+'vocab.json')),true);
});

test('M11/P/D/Monochrom preserve independent storage/display/authentication workflows and optical finders',()=>{
 const ids=['leica-m11','leica-m11-p','leica-m11-d','leica-m11-monochrom'];assert.equal(new Set(ids.map(id=>body(id).id)).size,4);
 assert.equal(claim(ids[0],'specs.cardSlots').conditions.internalMemoryGB,64);for(const id of ids.slice(1))assert.equal(claim(id,'specs.cardSlots').conditions.internalMemoryGB,256);
 for(const id of ids){assert.match(body(id).specs.autofocus.description,/수동 초점 전용/);assert.equal(body(id).specs.evf.present,false);assert.equal(body(id).specs.evf.magnification,null);assert.equal(claim(id,'specs.evf').conditions.opticalMagnification,0.73);assert.match(claim(id,'specs.evf').conditions.externalOptionalAccessoryNotBuiltIn,/Visoflex/);assert.equal(body(id).specs.cardSlots,null);}
 assert.equal(body('leica-m11-d').specs.lcd.present,false);assert.equal(claim('leica-m11-d','specs.lcd').conditions.phoneDisplayNotBuiltIn,true);
 assert.equal(body('leica-m11-p').specs.lcd.present,true);assert.ok(audit.knownBacklog.includes('Content Credentials/authentication feature metadata'));
});

test('M EV1 independently preserves M bayonet and built-in electronic finder rather than optical M alias',()=>{
 const b=body('leica-m-ev1');assert.equal(b.mount,'Leica M');assert.equal(b.specs.evf.present,true);assert.equal(b.specs.evf.resolutionDots,5760000);assert.equal(b.specs.evf.maxRefreshHz,60);assert.equal(b.specs.evf.magnification,0.76);assert.equal(claim(b.id,'specs.cardSlots').conditions.internalMemoryGB,64);
 for(const id of ['leica-m11','leica-m11-p','leica-m11-d'])assert.ok(!body(id).aliases.some(a=>normalizeSearch(a).includes('ev1')));
});

test('Leica M vocabulary is official, collision-free and limited to five digital M bodies; L-Mount reused',()=>{
 const v=json(base+'vocab.json'),m=v.mounts.find(m=>m.name==='Leica M');assert.deepEqual(m.aliases,['Leica M bayonet','Leica M-Bajonett','M-Mount']);const names=new Map();
 for(const mount of v.mounts)for(const n of [mount.name,...mount.aliases]){const key=normalizeSearch(n);assert.ok(!names.has(key)||names.get(key)===mount.name);names.set(key,mount.name);}
 assert.equal(audit.products.filter(p=>p.mount==='Leica M').length,5);for(const p of audit.products.filter(p=>p.mount==='Leica M')){assert.equal(p.kind,'interchangeable');assert.ok(stage(p.productId).sources.some(s=>s.url.includes('/cameras/m/')));}
 assert.equal(v.mounts.filter(m=>m.name==='L-Mount').length,1);assert.equal(CAMERA_LENSES.filter(l=>l.mount==='Leica M').length,0);
});

test('Both Monochrom models retain monochrome sensor identity and native MP rather than colour finish/output mode',()=>{
 for(const id of ['leica-m11-monochrom','leica-q3-monochrom']){assert.equal(body(id).specs.sensor.megapixels,60.3);assert.match(body(id).specs.sensor.generation,/Monochrome/);assert.equal(claim(id,'specs.sensor.generation').conditions.dedicatedMonochromeSensor,true);assert.ok(audit.cards.some(c=>c.canonicalId===id&&c.cameraCategory==='digital-monochrome'&&c.relation==='independent-model'));assert.ok(!audit.linkedRelations.some(r=>r.canonicalId===id));}
 assert.equal(claim('leica-m11-monochrom','specs.sensor.megapixels').conditions.outputL_DNG,60.4);assert.notEqual(body('leica-q3').id,body('leica-q3-monochrom').id);
});

test('Q three identities and D-Lux independently preserve actual/equivalent mm without hidden mass or lens purchase',()=>{
 const expected=[['leica-q3',28,28,1.7,1.7,743],['leica-q3-43',43,43,2,2,772],['leica-q3-monochrom',28,28,1.7,1.7,746],['leica-d-lux-8',10.9,34,1.7,2.8,397]];
 const lens=CAMERA_LENSES.find(l=>l.id==='sony-fe-24-70-gm2'),currentSystem={body:BODY_BY_ID['sony-a7-iv'],lenses:[lens],primaryLens:lens};const input={currentBody:currentSystem.body,currentLenses:[lens],primaryLens:lens,pains:['더 가볍고 작은 카메라를 원해요'],subjects:['여행 · 일상'],extraBudget:300};
 for(const[id,min,max,wide,tele,weight]of expected){const b=body(id);assert.equal(b.kind,'fixed');assert.equal(b.mount,null);assert.deepEqual(b.specs.fixedLens.focal,{min,max});assert.deepEqual(b.specs.fixedLens.aperture,{wide,tele});for(const path of ['focal.min','focal.max','equivalentFocal.min','equivalentFocal.max'])assert.equal(claim(id,'specs.fixedLens.'+path).unit,'mm');
  const runtime=BODY_BY_ID[id],integrated=getIntegratedLens(runtime);assert.equal(integrated.includedInBodyId,id);assert.equal(integrated.weight,null);assert.deepEqual(generateLensCandidates({body:runtime}).map(l=>l.id),[integrated.id]);assert.ok(!CAMERA_LENSES.some(l=>l.includedInBodyId===id));
  const result=evaluateScenario({currentSystem,...buildEquipmentTransition(currentSystem,{body:runtime,lenses:[integrated],primaryLens:integrated}),purchaseCondition:'used'},input);assert.equal(result.weight.after,weight);assert.equal(result.lensCount.after,0);assert.deepEqual(result.buy.map(i=>i.id),[id]);
 }
 assert.deepEqual(body('leica-d-lux-8').specs.fixedLens.equivalentFocal,{min:24,max:75});for(const id of ['leica-q3-43','leica-q3-monochrom'])assert.equal(body(id).specs.fixedLens.equivalentFocal?.min??null,null);
 assert.deepEqual(after.lenses,before.lenses);
});

test('SL3/SL3-S/SL3-P keep distinct native sensors, own Leica specifications and L-Mount',()=>{
 for(const[id,mp]of [['leica-sl3',60.3],['leica-sl3-s',24.6],['leica-sl3-p',44.9]]){assert.equal(body(id).mount,'L-Mount');assert.equal(body(id).specs.sensor.megapixels,mp);assert.equal(body(id).specs.fixedLens,null);const p=audit.products.find(p=>p.productId===id);assert.equal(p.freshTechnicalSource.sameFileAsProduction,true);assert.equal(p.freshTechnicalSource.status,200);
  for(const s of stage(id).sources){assert.equal(new URL(s.url).hostname,'leica-camera.com');assert.equal(e.bundle.raws[s.sourceId].items[0].itemKey,id);}
 }
 assert.equal(new Set(audit.products.filter(p=>p.productId.startsWith('leica-sl3')).map(p=>p.freshTechnicalSource.url)).size,3);assert.equal(claim('leica-sl3-p','specs.sensor.megapixels').conditions.outputL_DNG,44.2);
});

test('No format-derived physical sensor dimensions or cross-manufacturer compact facts are introduced',()=>{
 for(const p of audit.products){assert.equal(body(p.productId).specs.sensor.sizeMm??null,null);assert.ok(p.freshTechnicalSource.sameFileAsProduction);assert.ok(stage(p.productId).sources.every(s=>new URL(s.url).hostname==='leica-camera.com'));}
 assert.equal(body('leica-d-lux-8').specs.sensor.megapixels,17);assert.equal(body('leica-d-lux-8').specs.video.bitDepth,8);
});

test('Sensor IBIS, lens compensation and absent display/finder remain distinct from uncertain absence',()=>{
 for(const id of ['leica-sl3','leica-sl3-s','leica-sl3-p']){validateSpecValue(body(id).specs.ibis,'specs.ibis');assert.equal(body(id).specs.ibis.present,true);assert.equal(body(id).specs.ibis.axes,5);assert.equal(body(id).specs.ibis.stops,5);}
 for(const id of audit.absenceReview.ibisUnknownDueToNoDirectBodyAbsenceStatement)assert.equal(body(id).specs.ibis,null);
 for(const id of audit.absenceReview.videoUnknownDueToNoDirectAbsenceStatement){assert.equal(body(id).specs.video.max,null);assert.equal(claim(id,'specs.video.max').conditions.needsExplicitAbsenceEvidence,true);}
 assert.equal(audit.notApplicableChildren.length,16);for(const c of audit.notApplicableChildren){assert.equal(getAtPath(body(c.productId),c.path),null);assert.equal(getAtPath(body(c.productId),c.path.split('.').slice(0,2).join('.')+'.present'),false);}
});

test('All known masses keep battery/bare/finish basis, unknown SL operational mass is not invented',()=>{
 const v=e.bundle.vocab;
 for(const p of audit.products){const b=body(p.productId);assert.ok(b.specs.bodyOnlyWeight>0);assert.equal(claim(b.id,'specs.bodyOnlyWeight').conditions.weightBasis,'body-only');if(b.specs.weight!=null){assert.ok(v.weightBases.includes(b.specs.weightBasis));assert.equal(b.specs.weightBasis,'battery');assert.equal(claim(b.id,'specs.weight').conditions.weightBasis,'battery');}else{assert.ok(b.id.startsWith('leica-sl3'));assert.equal(b.specs.weightBasis,null);}}
 assert.equal(claim('leica-m11-p','specs.weight').conditions.otherVariantWithBattery,640);assert.equal(body('leica-m11-p').specs.weight,530);assert.equal(body('leica-sl3').specs.bodyOnlyWeight,769.7);
});

test('Video modes keep fractional fps, codec/depth/internal/crop and model-bound conditions intact',()=>{
 for(const id of ['leica-q3','leica-q3-43','leica-q3-monochrom','leica-sl3']){assert.equal(body(id).specs.video.max,'C8K 29.97p');assert.equal(claim(id,'specs.video.max').conditions.frameRate,29.97);assert.equal(claim(id,'specs.video.max').conditions.hdmiAndSlowMotionNotThisMode,true);}
 const s=claim('leica-sl3-s','specs.video.max'),p=claim('leica-sl3-p','specs.video.max');assert.equal(s.value,'6K OG 29.97p');assert.equal(p.value,'8K OG 24p');assert.equal(p.conditions.frameRate,24);assert.equal(p.conditions.internal,true);assert.equal(p.conditions.dynamicRangeExpansion,false);assert.equal(p.conditions.fullFrameCropFactor,1);assert.equal(body('leica-sl3-p').specs.video.cropAtMax,false);
 assert.ok(audit.knownBacklog.includes('cross-brand recommendation parser 29.97 -> 97'));assert.equal(claim('leica-sl3-p','specs.burst.maxElectronicFps').value,40);
});

test('Existing Q3/SL3 are production complete despite recorded structured identity gaps; Q3 legacy equivalents are not called verified',()=>{
 for(const id of ['leica-q3','leica-sl3']){const p=audit.products.find(p=>p.productId===id);assert.ok(before.bodies.some(b=>b.id===id));assert.equal(p.structuredIdentityEvidence,false);assert.equal(stage(id).identityEvidence.verification,'verified');assert.ok(audit.findings.shouldFix.some(f=>f.productId===id&&f.path==='identityEvidence'));
  const changes=e.bundle.diff.items.find(i=>i.productId===id).changes;assert.ok(changes.some(c=>c.category==='same-value/new-evidence'));assert.ok(changes.some(c=>c.category==='null-fill'));assert.ok(changes.every(c=>c.category!=='value-conflict'));
 }
 for(const path of ['specs.fixedLens.equivalentFocal.min','specs.fixedLens.equivalentFocal.max']){assert.equal(getAtPath(body('leica-q3'),path),28);assert.equal(claim('leica-q3',path).value,null);assert.ok(audit.products.find(p=>p.productId==='leica-q3').known.some(k=>k.path===path&&k.classification==='manufacturer-reference-only'));assert.ok(audit.findings.shouldFix.some(f=>f.productId==='leica-q3'&&f.path===path));}
});

test('All known Leica objective leaves have correctly classified canonical evidence and traceable verified raw claims',()=>{
 let known=0,verified=0,paths=0,structured=0,claims=0,sources=0;
 for(const p of audit.products){const b=body(p.productId),s=stage(b.id);assert.equal(p.rawSourceCount,s.sources.length);sources+=b.sources.length;paths+=Object.keys(b.fieldEvidence).length;claims+=s.claims.length;if(b.identityEvidence)structured++;
  for(const path of leaves(b.specs)){known++;const record=p.known.find(k=>k.path===path);assert.ok(record);assert.deepEqual(record.value,getAtPath(b,path));const evidence=Object.entries(b.fieldEvidence).filter(([scope,v])=>covers(path,scope)&&v.verification==='verified');if(evidence.length){verified++;assert.equal(record.classification,'verified');}else{assert.equal(record.classification,'manufacturer-reference-only');assert.ok(b.sources.some(src=>src.fields.some(scope=>covers(path,scope))));}}
  for(const [path,v]of Object.entries(b.fieldEvidence)){assert.equal(v.verification,'verified');for(const cid of v.claimIds){const c=s.claims.find(c=>c.claimId===cid);assert.equal(c.path,path);assert.deepEqual(c.value,getAtPath(b,path));assert.ok(e.bundle.raws[c.sourceId]);assert.ok(b.sources.some(src=>src.sourceId===c.sourceId&&src.fields.some(scope=>covers(path,scope))));}}
 }
 assert.deepEqual([known,verified,paths,structured,claims,sources],[326,324,288,10,417,31]);assert.deepEqual(audit.provenanceSummary,{knownObjectiveLeaves:326,verifiedKnownLeaves:324,manufacturerReferenceOnly:2,legacyOnly:0,unclassifiedKnownLeaves:0,sourceLessKnownLeaves:0,verifiedFieldEvidencePaths:288,structuredIdentityEvidence:10,indirectIdentityEvidence:2,productionClaims:417,knownClaims:290,unknownClaims:127,rawSources:28,canonicalSourceLinks:31});
});

test('Worker-fallback M11 and SL3-S have the same full raw/staging/diff/approval chain without new calls',()=>{
 assert.deepEqual(audit.workerUsage.localExtractionCompleteProducts,['leica-m11','leica-sl3-s']);assert.equal(audit.workerUsage.newCalls,0);assert.equal(audit.workerUsage.newTokens,0);
 for(const id of audit.workerUsage.localExtractionCompleteProducts){const s=stage(id),p=audit.products.find(p=>p.productId===id);assert.ok(p.productionProvenanceComplete);assert.equal(s.sources.length,2);assert.ok(s.sources.every(src=>e.bundle.raws[src.sourceId]));assert.ok(e.bundle.diff.items.some(i=>i.productId===id));assert.ok(e.approval.decisions.some(d=>d.productId===id&&d.action==='accept'));assert.equal(s.identityEvidence.verification,'verified');}
});

test('All21 linked offers retain correct kit/finish/collaboration identities; analog and hybrid are reconsiderable adjacent scope',()=>{
 assert.equal(audit.linkedRelations.length,21);assert.deepEqual(audit.linkedRelationCounts,{kit:8,'collaboration-edition':1,'commemorative-edition':1,'color-material-finish':11});
 for(const r of audit.linkedRelations){const c=old.cards.find(c=>c.cardKey===r.cardKey);assert.equal(r.baseIdentity,c.baseIdentity);assert.equal(r.canonicalId,c.canonicalId);assert.equal(r.verified,true);assert.equal(r.sensorOrLensOrWorkflowChanged,false);assert.equal(r.permanentSeparateProduct,false);assert.ok(audit.currentOfferUrls.includes(r.url));}
 const scope=json(base+'catalog-scope.json').entries;
 for(const s of audit.adjacentScopeAudit){assert.equal(s.scopeStatus,'adjacent-category');assert.equal(s.permanentExclusion,false);assert.ok(s.auditConfirmed);assert.ok(scope.some(e=>e.brand==='Leica'&&e.model===s.model&&e.scopeStatus===s.scopeStatus));assert.ok(!after.bodies.some(b=>b.brand==='Leica'&&b.model===s.model));}
 assert.equal(audit.adjacentScopeAudit.length,4);assert.equal(audit.sofortWorkflowReview.digitalCapture,true);assert.match(audit.sofortWorkflowReview.storage,/45images/);
 for(const key of ['m-a-typ-127-silver','mp-silver']){assert.ok(audit.findings.shouldFix.some(f=>f.cardKey===key&&f.type==='inventory-note-copy-error'));assert.match(audit.linkedRelations.find(r=>r.cardKey===key).reason,/does not apply/);}
});

test('Leica sealed51-file chain,28 real UTC sources and replay retain canonicalized approval/application exactly',()=>{
 const m=json(base+'batches/'+batch+'.json'),a=json(base+'approvals/'+batch+'.json'),j=json(tx+'journal.json');
 for(const [p,h]of Object.entries(audit.sealedFileDigests)){if(![base+'vocab.json',base+'identity-map.json'].includes(p))assert.equal(sha(p),h,p);}
 assert.equal(Object.keys(audit.sealedFileDigests).length,51);const {approvalId,...approvalBody}=a;assert.equal(approvalId,'approval-'+digestValue(approvalBody));assert.equal(a.diffDigest,digestValue(e.bundle.diff));assert.deepEqual(a.incomingArtifactDigests,e.bundle.artifactDigests);assert.equal(a.incomingDigest,digestValue(e.bundle.artifactDigests));assert.deepEqual(json(base+'approvals/'+batch+'/'+approvalId+'.json'),a);assert.deepEqual(e.approval,a);assert.equal(j.evidenceDigest,digestValue(e));assert.equal(j.phase,'canonicalized');
 assert.equal(sha(tx+'before.json'),m.canonicalBaselineDigest);assert.equal(sha(tx+'after.json'),m.expectedCanonicalDigest);assert.equal(audit.canonicalDigest,m.expectedCanonicalDigest);
 for(const i of m.items){assert.equal(i.state,'canonicalized');assert.equal(i.stagingDigest,digestValue(stage(i.productId)));assert.equal(i.diffDigest,digestValue(e.bundle.diff));for(const[n,id]of i.sourceIds.entries()){const r=json(base+'raw/'+id+'.json');assert.equal(i.rawDigests[n],digestValue(r));assert.equal(createSourceId(r),id);assert.equal(r.contentDigest,digestValue(r.evidenceExcerpt));assert.deepEqual(e.bundle.raws[id],r);}}
 verifyIncoming(e.bundle,before);assert.equal(validateStagingBatch(e.bundle.stagings,context).valid,true);const replay=proposedCanonical(before,e.bundle,a.decisions,a.productOperations);assert.deepEqual(replay.canonical,after);assert.equal(replay.digest,m.expectedCanonicalDigest);assert.deepEqual(proposedCanonical(after,e.bundle,a.decisions,a.productOperations).canonical,after);
 assert.equal(audit.rawSourceAudit.length,28);for(const r of audit.rawSourceAudit){assert.equal(new Date(r.accessedAt).toISOString(),r.accessedAt);assert.equal(r.helperTimestampWithinWindow,true);assert.equal(r.freshOfficialStatus,200);assert.equal(r.publisher,'Leica Camera AG');}
 assert.equal(audit.artifactChecks[0].missingArtifacts,0);assert.equal(audit.artifactChecks[0].digestMismatches,0);assert.equal(audit.artifactChecks[0].recordedProductionReapply.status,'already-canonicalized');assert.equal(audit.artifactChecks[0].recordedProductionReapply.canonicalMatches,true);
});

test('Critical0, should-fix6, canonical UNKNOWN125 and source access limitations have distinct severity',()=>{
 assert.deepEqual([audit.findings.critical.length,audit.findings.shouldFix.length,audit.findings.acceptableUnknown.length],[0,6,125]);
 assert.equal(audit.findings.shouldFix.filter(f=>f.type==='canonical-identity-metadata').length,2);assert.equal(audit.findings.shouldFix.filter(f=>f.type==='known-reference-only').length,2);assert.equal(audit.findings.shouldFix.filter(f=>f.type==='inventory-note-copy-error').length,2);assert.equal(audit.accessLimitations.length,1);assert.match(audit.accessLimitations[0].classification,/not proof of a product data error/);
 assert.equal(new Set(audit.findings.acceptableUnknown.map(f=>f.productId+'/'+f.path)).size,125);for(const u of audit.findings.acceptableUnknown)assert.equal(getAtPath(body(u.productId),u.path)??null,null);
 assert.equal(audit.unknownCountingPolicy.incomingUnknownClaims,127);assert.equal(audit.unknownCountingPolicy.incomingUnknownButExistingKnownReferenceOnly,2);assert.equal(audit.notApplicableChildren.length,16);
 assert.equal(audit.conclusion.firstCoverageComplete,true);assert.equal(audit.conclusion.nextBrand,'Sigma');assert.equal(audit.conclusion.nextBrandBlocker,false);assert.equal(audit.checkpoint.remainingReleasedDigital,0);assert.match(audit.checkpoint.resumeAt,/Do not re-ingest/);
});
