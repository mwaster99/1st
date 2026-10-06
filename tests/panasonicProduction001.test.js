import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { proposedCanonical, validateCanonical, verifyIncoming } from '../scripts/objective/merge.mjs';
import { digestValue, formatCanonicalDiff, validateStagingBatch } from '../scripts/objective/rules.mjs';
import { BODY_BY_ID, LENS_BY_ID, CAMERA_LENSES, getIntegratedLens } from '../src/cameraData.js';
import { generateScenarioCandidates, generateLensCandidates, evaluateScenario } from '../src/cameraScenarioEngine.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read=name=>readFileSync(path.join(root,name));
const json=name=>JSON.parse(read(name));
const sha=name=>createHash('sha256').update(read(name)).digest('hex');
const base='src/data/ingestion/', batch='production-panasonic-bodies-001', transaction=`${base}transactions/${batch}/`;
const selected=['panasonic-s1r-ii','panasonic-s5-ii','panasonic-gh7','panasonic-g100d','panasonic-tz99'];
const manifest=()=>json(`${base}batches/${batch}.json`);
const stagings=()=>manifest().items.map(item=>json(`${base}staging/${batch}/${item.itemKey}.json`));
const rawDocuments=()=>new Map(manifest().items.flatMap(item=>item.sourceIds).map(id=>[id,json(`${base}raw/${id}.json`)]));
const context=()=>({canonical:json(`${transaction}before.json`),vocab:json(`${transaction}evidence.json`).bundle.vocab,rawDocuments:rawDocuments()});
const body=id=>json(`${transaction}after.json`).bodies.find(b=>b.id===id);
const staging=id=>stagings().find(s=>s.product.id===id);
const claim=(id,p)=>staging(id).claims.find(c=>c.path===p);

test('Panasonic inventory counts official cards separately from kits/colors and deferred broadcast families',()=>{
 const s=json(`${base}panasonic-current-camera-gallery-2026-10-06.json`), cards=s.cards;
 assert.equal(cards.length,49);assert.equal(new Set(cards.map(c=>c.cardKey)).size,49);assert.equal(new Set(cards.map(c=>c.productUrl)).size,49);
 assert.equal(new Set(cards.map(c=>c.identityGroup)).size,39);assert.equal(cards.filter(c=>c.variantRelation).length,10);
 assert.equal(s.initialCounts.releasedCurrentIdentities,39);assert.equal(s.initialCounts.announcedUpcoming,0);
 assert.equal(s.initialCounts.existingCanonicalIdentities,4);assert.equal(s.initialCounts.productionCanonicalizedIdentities,0);assert.equal(s.initialCounts.unprocessedProductionIdentities,39);
 assert.equal(s.deferredSpecialCandidates.length,15);assert.equal(cards.filter(c=>c.scopeStatus==='in-scope').length,49);
 assert.deepEqual(s.gallerySources.map(g=>g.cardCount),[13,20,5,3,3,5]);
 for(const c of cards){assert.ok(c.releaseEvidence.length>=2);assert.equal(new URL(c.productUrl).hostname,'www.panasonic.co.kr');assert.equal(c.availabilityStatus,'released-current');}
 for(const group of ['S5','S1','S1R','G100','GH5II','GF10','GX9']){
  const members=cards.filter(c=>c.baseModel===group);assert.equal(members.filter(c=>!c.variantRelation).length,1);assert.ok(members.length>1);
  assert.equal(new Set(members.map(c=>c.manufacturerModelCode)).size,1);
 }
 assert.notEqual(cards.find(c=>c.baseModel==='G100D').identityGroup,cards.find(c=>c.baseModel==='G100').identityGroup);
 assert.notEqual(cards.find(c=>c.baseModel==='VX3').identityGroup,cards.find(c=>c.baseModel==='V900').identityGroup);
 assert.equal(cards.find(c=>c.baseModel==='L10').manufacturerModelCode,'DC-L10');assert.equal(cards.find(c=>c.baseModel==='L10').kind,'fixed');
 const shoulder=cards.find(c=>c.baseModel==='CX4000');assert.equal(shoulder.kind,'interchangeable');assert.match(shoulder.mount,/bayonet/);
 assert.equal(cards.filter(c=>c.status==='canonicalized').length,5);
 assert.equal(new Set(cards.filter(c=>c.status!=='canonicalized').map(c=>c.identityGroup)).size,34);
});

test('Panasonic pilot archive replays three additions and two updates atomically without touching old unrelated bodies or lenses',()=>{
 const m=manifest(), e=json(`${transaction}evidence.json`), a=json(`${base}approvals/${batch}.json`), j=json(`${transaction}journal.json`);
 const before=json(`${transaction}before.json`),after=json(`${transaction}after.json`);
 assert.equal(before.bodies.length,111);assert.equal(after.bodies.length,114);assert.equal(after.lenses.length,36);assert.deepEqual(after.lenses,before.lenses);
 for(const old of before.bodies){const b=after.bodies.find(x=>x.id===old.id);if(!selected.includes(old.id))assert.deepEqual(b,old);else{for(const k of ['name','brand','model','series','aliases','mount','kind','bodyStyle','price'])assert.deepEqual(b[k],old[k]);}}
 assert.equal(m.canonicalBaselineDigest,sha(`${transaction}before.json`));assert.equal(m.expectedCanonicalDigest,sha(`${transaction}after.json`));
 assert.equal(m.canonicalBaselineDigest,json(`${base}batches/production-fujifilm-bodies-003.json`).expectedCanonicalDigest);
 assert.equal(j.phase,'canonicalized');assert.equal(j.evidenceDigest,digestValue(e));assert.deepEqual(e.approval,a);
 assert.equal(a.approvedBy.method,'cli-explicit');assert.equal(a.diffDigest,digestValue(e.bundle.diff));assert.equal(a.diffFileDigest,sha(`${base}diffs/${batch}.json`));assert.deepEqual(a.incomingArtifactDigests,e.bundle.artifactDigests);
 verifyIncoming(e.bundle,before);const proposed=proposedCanonical(before,e.bundle,a.decisions,a.productOperations);assert.equal(proposed.digest,m.expectedCanonicalDigest);assert.deepEqual(proposed.canonical,after);
 assert.equal(validateCanonical(after,e.bundle.vocab),true);assert.equal(validateCanonical(json('src/data/cameraProducts.json'),json(`${base}vocab.json`)),true);
});

test('Panasonic multi-source evidence, actual helper timestamps and diff categories remain sealed',()=>{
 const raws=rawDocuments(),diff=json(`${base}diffs/${batch}.json`);
 assert.equal(raws.size,12);assert.equal(stagings().reduce((n,s)=>n+s.claims.length,0),80);assert.equal(validateStagingBatch(stagings(),context()).valid,true);
 for(const item of manifest().items){
  assert.equal(item.state,'canonicalized');const s=staging(item.productId);assert.equal(item.stagingDigest,digestValue(s));
  for(const [i,id]of item.sourceIds.entries()){
   const raw=raws.get(id);assert.equal(item.rawDigests[i],digestValue(raw));assert.equal(raw.contentDigest,digestValue(raw.evidenceExcerpt));
   assert.match(raw.accessedAt,/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);assert.equal(new Date(raw.accessedAt).toISOString(),raw.accessedAt);
   assert.ok(body(item.productId).sources.some(x=>x.sourceId===id));assert.equal(raw.sourceType,'manufacturer');
  }
  const d=diff.items.find(d=>d.productId===item.productId);assert.match(formatCanonicalDiff(d),new RegExp(`fields / ${item.sourceIds.length} sources`));
  assert.ok(d.changes.every(c=>c.category!=='value-conflict'));assert.ok(s.claims.every(c=>c.verification==='verified'));
 }
 const identityOnly=raws.get(staging('panasonic-s1r-ii').identityEvidence.sourceId);assert.equal(identityOnly.items[0].observations.length,0);
 for(const id of ['panasonic-s5-ii','panasonic-gh7']){assert.equal(staging(id).identityEvidence,null);const cats=diff.items.find(d=>d.productId===id).changes.map(c=>c.category);assert.ok(cats.includes('same-value/new-evidence'));assert.ok(cats.includes('null-fill'));}
});

test('Panasonic L-Mount/MFT, body BIS, lens OIS and combined Dual IS stay distinct',()=>{
 for(const id of selected.slice(0,2)){assert.equal(body(id).mount,'L-Mount');assert.equal(body(id).specs.sensor.format,'풀프레임');}
 for(const id of ['panasonic-gh7','panasonic-g100d']){assert.equal(body(id).mount,'Micro Four Thirds');assert.equal(body(id).specs.sensor.format,'마이크로포서드');}
 assert.deepEqual(body('panasonic-s1r-ii').specs.sensor.sizeMm,[35.8,23.9]);assert.deepEqual(body('panasonic-s5-ii').specs.sensor.sizeMm,[35.6,23.8]);
 assert.equal(body('panasonic-s1r-ii').specs.ibis.stops,null);
 assert.equal(body('panasonic-s5-ii').specs.ibis.stops,5);assert.equal(claim('panasonic-s5-ii','specs.ibis').conditions.combinedStabilization.stops,6.5);
 assert.equal(body('panasonic-gh7').specs.ibis.stops,7.5);assert.equal(claim('panasonic-gh7','specs.ibis').conditions.focalLengthMm,60);assert.equal(claim('panasonic-gh7','specs.ibis').conditions.combinedStabilization.focalLengthMm,140);
 for(const id of ['panasonic-g100d','panasonic-tz99']){assert.equal(body(id).specs.ibis,null);assert.ok(!staging(id).claims.some(c=>c.path==='specs.ibis'));assert.equal(body(id).specs.sensor.sizeMm,null);}
});

test('Panasonic ordinary video keeps exact 29.97, aspect, codec, media and thermal conditions distinct from high speed and RAW',()=>{
 for(const [id,max,aspect]of [['panasonic-s1r-ii','8.1K 29.97p','17:9'],['panasonic-s5-ii','6K 29.97p','3:2'],['panasonic-gh7','5.8K 29.97p','4:3']]){
  assert.equal(body(id).specs.video.max,max);const c=claim(id,'specs.video.max');assert.equal(c.conditions.frameRate,29.97);assert.equal(c.conditions.aspectRatio,aspect);assert.equal(c.conditions.imageArea,'FULL');assert.equal(c.conditions.systemFrequency,'59.94Hz NTSC');assert.match(c.conditions.codec,/HEVC/);assert.ok(c.conditions.media);
  const raw=rawDocuments().get(c.sourceId);assert.equal(raw.items[0].observations.find(x=>x.path==='specs.video.max').rawValue,max);
  const change=json(`${base}diffs/${batch}.json`).items.find(x=>x.productId===id).changes.find(x=>x.path==='specs.video.max');assert.equal(change.incomingValue,max);
 }
 assert.match(claim('panasonic-s5-ii','specs.video.max').conditions.thermalManagement,/30 minutes/);
 assert.match(claim('panasonic-gh7','specs.video.max').conditions.otherModes,/32-bit float audio/);
 assert.equal(body('panasonic-g100d').specs.video.bitDepth,null);assert.equal(body('panasonic-tz99').specs.video.cropAtMax,null);
 assert.equal(body('panasonic-g100d').specs.burst.maxMechanicalFps,undefined);assert.equal(claim('panasonic-g100d','specs.burst.maxElectronicFps').conditions.efcs.fps,6);
 assert.equal(claim('panasonic-gh7','specs.burst.maxElectronicFps').conditions.alternateAfcFps,60);
});

test('TZ99 fixed camera keeps built-in lens, actual/equivalent mm and total weight with no separate lens',()=>{
 const b=body('panasonic-tz99');assert.equal(b.kind,'fixed');assert.equal(b.mount,null);assert.deepEqual(b.specs.fixedLens.focal,{min:4.3,max:129});assert.deepEqual(b.specs.fixedLens.equivalentFocal,{min:24,max:720});assert.deepEqual(b.specs.fixedLens.aperture,{wide:3.3,tele:6.4});
 assert.equal(b.specs.weight,322);assert.equal(b.specs.bodyOnlyWeight,280);const w=claim(b.id,'specs.weight');assert.ok(w.conditions.includes.includes('built-in lens'));assert.ok(!w.conditions.excludes.includes('lens'));
 for(const p of ['focal.min','focal.max','equivalentFocal.min','equivalentFocal.max'])assert.equal(claim(b.id,'specs.fixedLens.'+p).unit,'mm');
 assert.equal(claim(b.id,'specs.fixedLens.equivalentFocal.max').conditions.aspectRatio,'4:3');assert.equal(claim(b.id,'specs.video.max').conditions.recordingTimeLimitMinutes,15);
 assert.deepEqual(json(`${transaction}after.json`).lenses,json(`${transaction}before.json`).lenses);
 assert.ok(!staging(b.id).claims.some(c=>/zoom|ois|price/i.test(c.path)));
 const integrated=getIntegratedLens(BODY_BY_ID[b.id]);assert.equal(integrated.includedInBodyId,b.id);assert.equal(integrated.weight,null);assert.equal(integrated.newPrice,null);assert.equal(integrated.usedPrice,null);
 assert.ok(!CAMERA_LENSES.some(l=>l.id===integrated.id));assert.deepEqual(generateLensCandidates({body:BODY_BY_ID[b.id]}).map(l=>l.id),[integrated.id]);
 const currentLens=LENS_BY_ID['sony-fe-24-70-gm2'];const input={currentBody:BODY_BY_ID['sony-a7-iv'],currentLenses:[currentLens],primaryLens:currentLens,pains:['더 가볍고 작은 카메라를 원해요'],subjects:['여행 · 일상'],extraBudget:300};
 const candidate=generateScenarioCandidates(input).find(c=>c.targetSystem.body.id===b.id);assert.ok(candidate);const result=evaluateScenario(candidate,input);assert.deepEqual(result.buy.map(i=>i.id),[b.id]);assert.equal(result.weight.after,322);assert.equal(result.lensCount.after,0);
});

test('Actual Panasonic claims reject invalid IBIS and missing/invalid/mismatched weight basis before approval',()=>{
 const original=staging('panasonic-s5-ii');
 for(const val of [true,false,{present:'yes'},{present:true,axes:-1}]){const s=structuredClone(original);s.claims.find(c=>c.path==='specs.ibis').value=val;const r=validateStagingBatch([s],context());assert.equal(r.valid,false);assert.ok(r.items[0].errors.some(e=>e.code==='INVALID_IBIS'));}
 for(const [basis,code]of [[undefined,'WEIGHT_BASIS_REQUIRED'],['operational','INVALID_WEIGHT_BASIS'],['battery','WEIGHT_BASIS_MISMATCH']]){const s=structuredClone(original),w=s.claims.find(c=>c.path==='specs.weight');if(basis===undefined)delete w.conditions.weightBasis;else w.conditions.weightBasis=basis;const r=validateStagingBatch([s],context());assert.equal(r.valid,false);assert.ok(r.items[0].errors.some(e=>e.code===code));}
 for(const s of stagings()){assert.equal(s.claims.find(c=>c.path==='specs.weight').conditions.weightBasis,'battery-and-card');assert.equal(s.claims.find(c=>c.path==='specs.bodyOnlyWeight').conditions.weightBasis,'body-only');}
});

test('Actual TZ99 focal claims reject missing or unsupported units independently before approval',()=>{
 for(const field of ['specs.fixedLens.focal.min','specs.fixedLens.equivalentFocal.max'])for(const [unit,code]of [[null,'UNIT_REQUIRED'],['inch','UNSUPPORTED_UNIT']]){
  const s=structuredClone(staging('panasonic-tz99'));s.claims.find(c=>c.path===field).unit=unit;const r=validateStagingBatch([s],context());assert.equal(r.valid,false);assert.ok(r.items[0].errors.some(e=>e.code===code));
 }
 assert.equal(validateStagingBatch([staging('panasonic-tz99')],context()).valid,true);
});
