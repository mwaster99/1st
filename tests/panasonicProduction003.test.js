import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { proposedCanonical, validateCanonical, verifyIncoming } from '../scripts/objective/merge.mjs';
import { digestValue, formatCanonicalDiff, validateStagingBatch } from '../scripts/objective/rules.mjs';

const root=new URL('../',import.meta.url), base='src/data/ingestion/', batch='production-panasonic-bodies-003', archive=`${base}transactions/${batch}/`;
const bytes=name=>readFileSync(new URL(name,root)), json=name=>JSON.parse(bytes(name));
const sha=name=>createHash('sha256').update(bytes(name)).digest('hex');
const ids=['panasonic-g9-ii','panasonic-g85','panasonic-g100','panasonic-gh6','panasonic-gh5-ii','panasonic-gh5','panasonic-g9','panasonic-g95','panasonic-gf10','panasonic-gx9','panasonic-gh5s'];
const manifest=()=>json(`${base}batches/${batch}.json`), stagings=()=>manifest().items.map(i=>json(`${base}staging/${batch}/${i.itemKey}.json`));
const staging=id=>stagings().find(s=>s.product.id===id), claims=(id,path)=>staging(id).claims.filter(c=>c.path===path), claim=(id,path)=>claims(id,path)[0];
const raws=()=>new Map(manifest().items.flatMap(i=>i.sourceIds).map(id=>[id,json(`${base}raw/${id}.json`)]));
const context=()=>({canonical:json(`${archive}before.json`),vocab:json(`${archive}evidence.json`).bundle.vocab,rawDocuments:raws()});
const body=id=>json(`${archive}after.json`).bodies.find(b=>b.id===id);

test('LUMIX G eleven-item atomic transaction replays ten new products plus a scoped precision update',()=>{
  const m=manifest(),e=json(`${archive}evidence.json`),a=json(`${base}approvals/${batch}.json`),before=json(`${archive}before.json`),after=json(`${archive}after.json`),j=json(`${archive}journal.json`);
  assert.deepEqual(m.items.map(i=>i.productId),ids);
  assert.equal(before.bodies.length,121);assert.equal(after.bodies.length,131);assert.equal(after.lenses.length,36);assert.deepEqual(after.lenses,before.lenses);
  for(const old of before.bodies){const current=body(old.id);if(old.id!=='panasonic-g9-ii')assert.deepEqual(current,old);else for(const key of ['id','name','brand','series','model','aliases','mount','kind','bodyStyle','price'])assert.deepEqual(current[key],old[key]);}
  assert.equal(j.phase,'canonicalized');assert.equal(j.evidenceDigest,digestValue(e));assert.deepEqual(e.approval,a);assert.equal(a.approvedBy.method,'cli-explicit');
  assert.equal(a.diffDigest,digestValue(e.bundle.diff));assert.equal(a.diffFileDigest,sha(`${base}diffs/${batch}.json`));assert.deepEqual(a.incomingArtifactDigests,e.bundle.artifactDigests);
  assert.equal(m.canonicalBaselineDigest,sha(`${archive}before.json`));assert.equal(m.expectedCanonicalDigest,sha(`${archive}after.json`));
  assert.equal(m.canonicalBaselineDigest,json(`${base}batches/production-panasonic-bodies-002.json`).expectedCanonicalDigest);
  verifyIncoming(e.bundle,before);const replay=proposedCanonical(before,e.bundle,a.decisions,a.productOperations);assert.deepEqual(replay.canonical,after);assert.equal(replay.digest,m.expectedCanonicalDigest);
  assert.equal(validateCanonical(after,e.bundle.vocab),true);assert.equal(validateCanonical(json('src/data/cameraProducts.json'),json(`${base}vocab.json`)),true);
  assert.equal(a.productOperations.filter(o=>o.operation==='new-product').length,10);
});

test('KR LUMIX G gallery closes exact eleven remaining identities without rewriting historical pilot/S snapshots',()=>{
  const s=json(`${base}panasonic-lumix-g-current-gallery-2026-10-07.json`);
  assert.deepEqual(s.currentListingCounts,{cards:20,baseIdentities:13,previousProduction:2,selected:11,announcedUpcoming:0});assert.equal(s.cards.length,20);assert.equal(new Set(s.cards.map(c=>c.identityGroup)).size,13);
  assert.deepEqual(s.batchCheckpoint.selected,ids);assert.equal(new Set(s.cards.filter(c=>c.batch003Status==='canonicalized').map(c=>c.canonicalId)).size,11);
  assert.deepEqual(s.batchCheckpoint.expectedRemaining,{panasonic:15,lumixS:0,lumixG:0,compact:4,camcorder:11});
  assert.equal(json(`${base}panasonic-current-camera-gallery-2026-10-06.json`).cards.filter(c=>c.status==='canonicalized').length,5);
  assert.equal(json(`${base}panasonic-lumix-s-current-gallery-2026-10-07.json`).batchCheckpoint.expectedRemaining.lumixG,11);
  for(const id of ids){assert.equal(body(id).kind,'interchangeable');assert.equal(body(id).mount,'Micro Four Thirds');assert.equal(body(id).specs.fixedLens,null);}
});

test('Independent raw chains retain exact UTC helper times, source counts and explicit G9II conflict approval',()=>{
  const r=raws(),diff=json(`${base}diffs/${batch}.json`),a=json(`${base}approvals/${batch}.json`);
  assert.equal(r.size,30);assert.equal(stagings().reduce((n,s)=>n+s.claims.length,0),222);assert.equal(validateStagingBatch(stagings(),context()).valid,true);
  const expected=[2,3,3,3,2,3,3,2,2,3,4];
  for(const [n,i]of manifest().items.entries()){
    assert.equal(i.state,'canonicalized');assert.equal(i.sourceIds.length,expected[n]);assert.equal(i.stagingDigest,digestValue(staging(i.productId)));
    for(const [k,id]of i.sourceIds.entries()){const raw=r.get(id);assert.equal(raw.sourceType,'manufacturer');assert.equal(raw.items.length,1);assert.equal(raw.items[0].itemKey,i.itemKey);assert.equal(i.rawDigests[k],digestValue(raw));assert.equal(raw.contentDigest,digestValue(raw.evidenceExcerpt));assert.match(raw.accessedAt,/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);assert.equal(new Date(raw.accessedAt).toISOString(),raw.accessedAt);assert.ok(body(i.productId).sources.some(s=>s.sourceId===id));}
    assert.match(formatCanonicalDiff(diff.items[n]),new RegExp(`fields / ${expected[n]} sources`));assert.ok(staging(i.productId).claims.every(c=>!c.path.startsWith('price.')));
  }
  const d=diff.items[0];for(const [category,count]of [['same-value/new-evidence',4],['null-fill',16],['value-conflict',1]])assert.equal(new Set(d.changes.filter(c=>c.category===category).map(c=>c.path)).size,count);
  assert.equal(body(ids[0]).specs.sensor.megapixels,25.21);assert.equal(claims(ids[0],'specs.sensor.megapixels').length,2);
  assert.ok(a.decisions.filter(c=>c.category==='value-conflict').every(c=>c.productId===ids[0]&&c.path==='specs.sensor.megapixels'&&c.action==='accept'));
  const checks=json(`${base}panasonic-lumix-g-current-gallery-2026-10-07.json`).rawHelperClockChecks;
  assert.equal(checks.length,30);for(const c of checks){assert.ok(c.before<=c.accessedAt&&c.accessedAt<=c.after);assert.equal(r.get(c.sourceId).accessedAt,c.accessedAt);}
});

test('G100/D, G9/II and GH5/II/S stay distinct with separate sensor, display and body weights',()=>{
  const before=json(`${archive}before.json`);assert.deepEqual(body('panasonic-g100d'),before.bodies.find(b=>b.id==='panasonic-g100d'));assert.deepEqual(body('panasonic-gh7'),before.bodies.find(b=>b.id==='panasonic-gh7'));
  assert.equal(body('panasonic-g100').specs.evf.resolutionDots,3680000);assert.equal(body('panasonic-g100d').specs.evf.resolutionDots,2360000);
  assert.match(claim('panasonic-g100','specs.evf.resolutionDots').conditions.usb,/Micro-B/);
  assert.equal(body('panasonic-g9').specs.sensor.megapixels,20.33);assert.equal(body(ids[0]).specs.sensor.megapixels,25.21);assert.equal(body('panasonic-g9').specs.bodyOnlyWeight,586);assert.equal(body(ids[0]).specs.bodyOnlyWeight,575);
  for(const id of ['panasonic-gh5','panasonic-gh5-ii'])assert.equal(body(id).specs.sensor.megapixels,20.33);assert.equal(body('panasonic-gh5s').specs.sensor.megapixels,10.28);
  assert.deepEqual(['panasonic-gh5','panasonic-gh5-ii','panasonic-gh5s'].map(id=>body(id).specs.bodyOnlyWeight),[646,647,580]);
  const mappings=json(`${base}transactions/${batch}/evidence.json`).bundle.identityMap.entries.filter(e=>ids.includes(e.productId));assert.equal(new Set(mappings.map(e=>e.manufacturerModelCode)).size,11);
});

test('Body BIS is not combined Dual IS, Hybrid digital correction or lens OIS',()=>{
  for(const [id,stops,dual]of [['panasonic-g9-ii',8,7.5],['panasonic-gh6',7.5,7.5],['panasonic-gh5-ii',6.5,6.5],['panasonic-gh5',5,null],['panasonic-g95',5,5]]){
    assert.equal(body(id).specs.ibis.stops,stops);const c=claim(id,'specs.ibis');assert.equal(c.conditions.focalLengthMm,60);assert.equal(c.conditions.equivalentFocalLengthMm,120);assert.equal(c.conditions.combinedStabilization.stops,dual);
  }
  for(const id of ['panasonic-g85','panasonic-g9','panasonic-gx9']){assert.equal(body(id).specs.ibis.present,true);assert.equal(body(id).specs.ibis.axes,null);assert.equal(body(id).specs.ibis.stops,null);}
  assert.deepEqual(body('panasonic-gh5s').specs.ibis.present,false);assert.match(claim('panasonic-gh5s','specs.ibis').conditions.modelColumn,/DC-GH5S/);
  for(const id of ['panasonic-g100','panasonic-gf10'])assert.equal(body(id).specs.ibis,null);
  assert.match(claim('panasonic-g100','specs.video.max').conditions.stabilization,/lens OIS plus electronic/);
});

test('GH motion picture modes preserve fractional fps, anamorphic/firmware/license and internal versus HDMI bits',()=>{
  for(const id of ['panasonic-g9-ii','panasonic-gh6','panasonic-gh5-ii','panasonic-gh5']){const c=claim(id,'specs.video.max');assert.equal(c.conditions.frameRate,29.97);assert.equal(body(id).specs.video.max,c.value);assert.equal(raws().get(c.sourceId).items[0].observations.find(o=>o.path===c.path).rawValue,c.value);}
  for(const id of ['panasonic-gh5','panasonic-gh5-ii']){const c=claim(id,'specs.video.max');assert.equal(c.value,'6K 29.97p');assert.equal(c.conditions.anamorphic,true);assert.deepEqual(c.conditions.resolution,[4992,3744]);assert.equal(c.conditions.aspectRatio,'4:3');}
  const gh5=claim('panasonic-gh5','specs.video.max');assert.equal(gh5.conditions.minimumFirmware,'2.0');assert.equal(gh5.conditions.container,'MP4 (LPCM)');assert.match(gh5.conditions.restrictions,/no HDMI output/);
  for(const id of ['panasonic-gh5','panasonic-g9'])assert.match(claim(id,'specs.video.log').conditions.optionalActivation,/DMW-SFU1/);
  const gh5s=claim('panasonic-gh5s','specs.video.max');assert.equal(gh5s.value,'C4K 59.94p');assert.equal(gh5s.conditions.frameRate,59.94);assert.equal(body('panasonic-gh5s').specs.video.bitDepth,8);assert.match(gh5s.conditions.otherModes,/HDMI output-only/);
  assert.equal(body('panasonic-gh6').specs.video.cropAtMax,false);assert.equal(body(ids[0]).specs.video.cropAtMax,false);assert.equal(body('panasonic-gx9').specs.video.cropAtMax,true);
  for(const id of ['panasonic-g85','panasonic-g100','panasonic-g9','panasonic-g95','panasonic-gf10','panasonic-gx9'])assert.equal(claim(id,'specs.video.max').conditions.frameRate,null);
  assert.equal(claim('panasonic-g100','specs.video.max').conditions.singleSessionLimitMinutes,10);assert.equal(claim('panasonic-gf10','specs.video.max').conditions.singleSessionLimitMinutes,5);
});

test('Storage, EFCS, reduced-size SH and region/revision UNKNOWN stay conditionally scoped',()=>{
  assert.deepEqual(body('panasonic-gh6').specs.cardSlots.slots.map(s=>s.media),[['CFexpress Type B'],['SD']]);assert.equal(body('panasonic-gh6').specs.cardSlots.count,2);
  assert.equal(claim('panasonic-gh6','specs.video.max').conditions.externalUsbSsd.minimumFirmware,'2.2');assert.equal(claim('panasonic-gh6','specs.video.max').conditions.externalUsbSsd.notInternalSlot,true);
  for(const id of ['panasonic-g9-ii','panasonic-gh5-ii','panasonic-gh5','panasonic-g9','panasonic-gh5s'])assert.deepEqual(body(id).specs.cardSlots.slots.map(s=>s.media),[['SD'],['SD']]);
  for(const id of ['panasonic-g85','panasonic-g100','panasonic-g95','panasonic-gf10','panasonic-gx9'])assert.equal(body(id).specs.cardSlots,null);
  assert.deepEqual(claim('panasonic-gf10','specs.cardSlots').conditions.recordingMedia,['microSD','microSDHC','microSDXC']);
  for(const id of ['panasonic-g100','panasonic-gf10'])assert.equal(body(id).specs.burst?.maxMechanicalFps??null,null);
  const sh=claim('panasonic-g85','specs.burst.maxElectronicFps');assert.equal(sh.value,40);assert.equal(sh.conditions.rawRecording,false);assert.equal(sh.conditions.maximumFrames,120);assert.match(sh.conditions.pictureSize,/S fixed/);
  for(const field of ['specs.burst.maxMechanicalFps','specs.burst.maxElectronicFps'])assert.equal(body('panasonic-gh5s').specs.burst?.[field.split('.').at(-1)]??null,null);
  assert.equal(body('panasonic-g95').specs.lcd.resolutionDots??null,null);assert.equal(claim('panasonic-g95','specs.lcd.resolutionDots').conditions.officialHelpG95FirstColumnDots,1240000);
  for(const id of ['panasonic-g85','panasonic-g100','panasonic-g9','panasonic-gf10','panasonic-gx9','panasonic-gh5s'])assert.equal(body(id).specs.sensor.sizeMm,null);
});

test('All eleven production weight claims reject missing/invalid/mismatch; body-IBIS booleans are rejected before approval',()=>{
  const weights=[658,505,345,823,727,725,658,536,270,450,660],bodyOnly=[575,453,303,739,647,646,586,484,240,407,580];
  for(const [n,id]of ids.entries()){
    assert.equal(body(id).specs.weight,weights[n]);assert.equal(body(id).specs.bodyOnlyWeight,bodyOnly[n]);assert.equal(claim(id,'specs.weight').conditions.weightBasis,'battery-and-card');assert.equal(claim(id,'specs.bodyOnlyWeight').conditions.weightBasis,'body-only');
    for(const [basis,code]of [[undefined,'WEIGHT_BASIS_REQUIRED'],['operational','INVALID_WEIGHT_BASIS'],['battery','WEIGHT_BASIS_MISMATCH']]){
      const s=structuredClone(staging(id));for(const c of s.claims.filter(c=>c.path==='specs.weight'))if(basis===undefined)delete c.conditions.weightBasis;else c.conditions.weightBasis=basis;
      const r=validateStagingBatch([s],context());assert.equal(r.valid,false);assert.ok(r.items[0].errors.some(e=>e.code===code));
    }
    const s=structuredClone(staging(id));s.claims.find(c=>c.path==='specs.ibis').value=true;s.claims.find(c=>c.path==='specs.ibis').unknown=false;const r=validateStagingBatch([s],context());assert.equal(r.valid,false);assert.ok(r.items[0].errors.some(e=>e.code==='INVALID_IBIS'));
  }
  assert.equal(claim('panasonic-g95','specs.weight').conditions.excludedG95dWeightG,533);assert.equal(claim('panasonic-g95','specs.bodyOnlyWeight').conditions.excludedG95dWeightG,481);
  assert.deepEqual(claim('panasonic-gf10','specs.weight').conditions.excludedKitWeightsG,[337,392]);
});
