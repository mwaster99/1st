import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { proposedCanonical, validateCanonical, verifyIncoming } from '../scripts/objective/merge.mjs';
import { digestValue, formatCanonicalDiff, validateStagingBatch } from '../scripts/objective/rules.mjs';

const root = new URL('../', import.meta.url);
const bytes = name => readFileSync(new URL(name, root));
const json = name => JSON.parse(bytes(name));
const sha = name => createHash('sha256').update(bytes(name)).digest('hex');
const base = 'src/data/ingestion/', batch = 'production-panasonic-bodies-002';
const archive = `${base}transactions/${batch}/`;
const ids = ['panasonic-s9','panasonic-s5','panasonic-s1-iie','panasonic-s1-ii','panasonic-s1r','panasonic-s1','panasonic-s5-iix','panasonic-s1h'];
const manifest = () => json(`${base}batches/${batch}.json`);
const stagings = () => manifest().items.map(i => json(`${base}staging/${batch}/${i.itemKey}.json`));
const staging = id => stagings().find(s => s.product.id === id);
const claims = (id, field) => staging(id).claims.filter(c => c.path === field);
const claim = (id, field) => claims(id, field)[0];
const raws = () => new Map(manifest().items.flatMap(i => i.sourceIds).map(id => [id,json(`${base}raw/${id}.json`)]));
const context = () => ({ canonical:json(`${archive}before.json`), vocab:json(`${archive}evidence.json`).bundle.vocab, rawDocuments:raws() });
const body = id => json(`${archive}after.json`).bodies.find(b => b.id === id);

test('LUMIX S eight-item transaction replays seven new identities and one update with unrelated products/prices preserved', () => {
  const m=manifest(), evidence=json(`${archive}evidence.json`), approval=json(`${base}approvals/${batch}.json`);
  const before=json(`${archive}before.json`), after=json(`${archive}after.json`), journal=json(`${archive}journal.json`);
  assert.deepEqual(m.items.map(i=>i.productId),ids);
  assert.equal(before.bodies.length,114); assert.equal(after.bodies.length,121); assert.equal(after.lenses.length,36);
  assert.deepEqual(after.lenses,before.lenses);
  for (const old of before.bodies) {
    const current=after.bodies.find(b=>b.id===old.id);
    if (old.id!=='panasonic-s9') assert.deepEqual(current,old);
    else for (const key of ['id','name','brand','model','series','aliases','mount','kind','bodyStyle','price']) assert.deepEqual(current[key],old[key]);
  }
  assert.equal(journal.phase,'canonicalized'); assert.equal(journal.evidenceDigest,digestValue(evidence));
  assert.deepEqual(evidence.approval,approval); assert.equal(approval.approvedBy.method,'cli-explicit');
  assert.equal(approval.diffDigest,digestValue(evidence.bundle.diff)); assert.equal(approval.diffFileDigest,sha(`${base}diffs/${batch}.json`));
  assert.deepEqual(approval.incomingArtifactDigests,evidence.bundle.artifactDigests);
  assert.equal(m.canonicalBaselineDigest,sha(`${archive}before.json`)); assert.equal(m.expectedCanonicalDigest,sha(`${archive}after.json`));
  assert.equal(m.canonicalBaselineDigest,json(`${base}batches/production-panasonic-bodies-001.json`).expectedCanonicalDigest);
  verifyIncoming(evidence.bundle,before);
  const result=proposedCanonical(before,evidence.bundle,approval.decisions,approval.productOperations);
  assert.equal(result.digest,m.expectedCanonicalDigest); assert.deepEqual(result.canonical,after);
  assert.equal(validateCanonical(after,evidence.bundle.vocab),true);
  assert.equal(validateCanonical(json('src/data/cameraProducts.json'),json(`${base}vocab.json`)),true);
});

test('LUMIX S current gallery keeps kits and independent generations distinct without rewriting the pilot snapshot', () => {
  const snapshot=json(`${base}panasonic-lumix-s-current-gallery-2026-10-07.json`);
  assert.deepEqual(snapshot.currentListingCounts,{cards:13,baseIdentities:10,previousProduction:2,selected:8,announcedUpcoming:0});
  assert.equal(snapshot.cards.length,13); assert.equal(new Set(snapshot.cards.map(c=>c.identityGroup)).size,10);
  assert.equal(snapshot.cards.filter(c=>c.variantRelation).length,3);
  assert.deepEqual(snapshot.batchCheckpoint.selected,ids);
  for (const id of ids) { assert.equal(body(id).mount,'L-Mount'); assert.equal(body(id).kind,'interchangeable'); }
  for (const id of ['panasonic-s1','panasonic-s1-ii','panasonic-s1-iie','panasonic-s1r','panasonic-s1r-ii','panasonic-s5','panasonic-s5-ii','panasonic-s5-iix']) assert.ok(body(id));
  assert.equal(new Set(snapshot.cards.filter(c=>c.batch002Status==='canonicalized').map(c=>c.canonicalId)).size,8);
  const pilot=json(`${base}panasonic-current-camera-gallery-2026-10-06.json`);
  assert.equal(pilot.cards.filter(c=>c.status==='canonicalized').length,5);
});

test('LUMIX S raw provenance, helper UTC timestamps and evidence counts are sealed per independent product', () => {
  const documents=raws(), diff=json(`${base}diffs/${batch}.json`);
  assert.equal(documents.size,24); assert.equal(stagings().reduce((n,s)=>n+s.claims.length,0),167);
  assert.equal(validateStagingBatch(stagings(),context()).valid,true);
  const expectedSources=[2,3,4,4,3,3,2,3];
  for (const [index,item] of manifest().items.entries()) {
    assert.equal(item.state,'canonicalized'); assert.equal(item.stagingDigest,digestValue(staging(item.productId)));
    assert.equal(item.sourceIds.length,expectedSources[index]);
    for (const [n,id] of item.sourceIds.entries()) {
      const raw=documents.get(id); assert.equal(item.rawDigests[n],digestValue(raw)); assert.equal(raw.contentDigest,digestValue(raw.evidenceExcerpt));
      assert.equal(raw.sourceType,'manufacturer'); assert.equal(raw.items.length,1); assert.equal(raw.items[0].itemKey,item.itemKey);
      assert.match(raw.accessedAt,/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/); assert.equal(new Date(raw.accessedAt).toISOString(),raw.accessedAt);
      assert.ok(body(item.productId).sources.some(s=>s.sourceId===id));
    }
    const d=diff.items.find(d=>d.productId===item.productId);
    assert.match(formatCanonicalDiff(d),new RegExp(`fields / ${expectedSources[index]} sources`));
    assert.ok(d.changes.every(c=>c.category!=='value-conflict'));
    for (const c of staging(item.productId).claims) assert.ok(!c.path.startsWith('price.'));
  }
  const s9=diff.items.find(d=>d.productId==='panasonic-s9');
  assert.equal(new Set(s9.changes.filter(c=>c.category==='same-value/new-evidence').map(c=>c.path)).size,4);
  assert.equal(new Set(s9.changes.filter(c=>c.category==='null-fill').map(c=>c.path)).size,12);
});

test('S1II and S1IIE have separate sensors and SH modes; unresolved manufacturer dimensions cannot become known claims', () => {
  assert.equal(body('panasonic-s1-ii').specs.sensor.megapixels,24.1);
  assert.equal(body('panasonic-s1-iie').specs.sensor.megapixels,24.2);
  assert.equal(body('panasonic-s1-ii').specs.sensor.generation,'partially-stacked CMOS');
  assert.equal(body('panasonic-s1-iie').specs.sensor.generation,'BSI CMOS');
  assert.equal(body('panasonic-s1-ii').specs.burst.maxElectronicFps,70);
  assert.equal(body('panasonic-s1-iie').specs.burst.maxElectronicFps,30);
  for (const id of ['panasonic-s1-ii','panasonic-s1-iie']) {
    assert.equal(body(id).specs.sensor.sizeMm,null);
    const dimensionClaims=claims(id,'specs.sensor.sizeMm'); assert.equal(dimensionClaims.length,2);
    assert.deepEqual(dimensionClaims.map(c=>c.conditions.reportedHereMm).sort(),[[35.6,23.8],[35.8,23.8]]);
    assert.ok(dimensionClaims.every(c=>c.value===null&&c.unknown&&c.conditions.disposition.includes('UNKNOWN')));
    const edited=structuredClone(staging(id)), selected=edited.claims.filter(c=>c.path==='specs.sensor.sizeMm');
    selected[0].value=[35.6,23.8]; selected[1].value=[35.8,23.8]; selected.forEach(c=>c.unknown=false);
    const rejected=validateStagingBatch([edited],context());
    assert.equal(rejected.valid,false); assert.ok(rejected.items[0].errors.some(e=>e.code==='CONFLICTING_CLAIM_VALUES'));
  }
});

test('LUMIX S body BIS stays distinct from Dual IS and firmware-adjusted S1/S1R values', () => {
  const stops=[5,5,8,8,6,6,5,6], dual=[6.5,6.5,7,7,6.5,6.5,6.5,6.5];
  for (const [n,id] of ids.entries()) {
    assert.equal(body(id).specs.ibis.present,true); assert.equal(body(id).specs.ibis.axes,5);
    assert.equal(body(id).specs.ibis.stops,stops[n]); assert.equal(claim(id,'specs.ibis').conditions.combinedStabilization.stops,dual[n]);
  }
  for (const id of ['panasonic-s1-ii','panasonic-s1-iie']) {
    const c=claim(id,'specs.ibis'); assert.equal(c.conditions.peripheryStops,7); assert.equal(c.conditions.standard,'CIPA 2024');
    assert.equal(c.conditions.focalLengthMm,60); assert.equal(c.conditions.combinedStabilization.focalLengthMm,105);
  }
  for (const id of ['panasonic-s1','panasonic-s1r']) {
    const c=claim(id,'specs.ibis'); assert.equal(c.conditions.minimumFirmware,'1.2'); assert.equal(c.conditions.priorBaseBodyStops,5.5);
    assert.match(raws().get(c.sourceId).url,/firmware|\/dl\/s1\.html/);
  }
});

test('LUMIX S video preserves exact fractional fps, mode rows, crop, firmware/license and thermal conditions', () => {
  for (const id of ['panasonic-s9','panasonic-s1-iie','panasonic-s1-ii','panasonic-s5-iix']) {
    const c=claim(id,'specs.video.max'); assert.equal(c.value,'6K 29.97p'); assert.equal(body(id).specs.video.max,c.value);
    assert.equal(c.conditions.frameRate,29.97); assert.deepEqual(c.conditions.resolution,[5952,3968]); assert.equal(c.conditions.aspectRatio,'3:2');
    assert.equal(c.conditions.imageArea,'FULL'); assert.equal(c.conditions.recording,'internal normal motion picture, not S&Q or external RAW');
    assert.equal(raws().get(c.sourceId).items[0].observations.find(o=>o.path==='specs.video.max').rawValue,c.value);
  }
  const s5=claim('panasonic-s5','specs.video.max'); assert.equal(s5.value,'4K 59.94p'); assert.equal(s5.conditions.frameRate,59.94);
  assert.equal(body('panasonic-s5').specs.video.cropAtMax,true); assert.equal(s5.conditions.imageArea,'APS-C'); assert.match(s5.conditions.thermalManagement,/30 minute/);
  const s1=claim('panasonic-s1','specs.video.max'); assert.equal(s1.conditions.minimumFirmware,'2.0'); assert.match(s1.conditions.optionalActivation,/DMW-SFU2/);
  for (const field of ['specs.video.max','specs.video.bitDepth','specs.video.log']) assert.match(claim('panasonic-s1',field).conditions.optionalActivation,/DMW-SFU2/);
  assert.equal(s1.conditions.frameRate,null); assert.equal(s1.value,'6K 24p'); assert.equal(body('panasonic-s1').specs.video.cropAtMax,null);
  const s1r=claim('panasonic-s1r','specs.video.max'); assert.equal(s1r.conditions.minimumFirmware,'1.6'); assert.equal(s1r.conditions.frameRate,null);
  assert.equal(s1r.value,'5K 30p'); assert.equal(body('panasonic-s1r').specs.video.log,null); assert.equal(body('panasonic-s1r').specs.video.cropAtMax,null);
  const s1h=claim('panasonic-s1h','specs.video.max'); assert.equal(s1h.value,'6K 23.98p'); assert.equal(s1h.conditions.frameRate,23.98);
  const s9=claim('panasonic-s9','specs.video.max'); assert.equal(s9.conditions.minimumFirmwareForRecordLimitOff,'1.1'); assert.match(s9.conditions.thermalManagement,/heat protection/);
  assert.match(s9.conditions.thermalConditionEvidenceUrl,/0153\.html$/);
});

test('S5IIX external SSD/RAW/ProRes metadata does not add an internal slot or modify S5II', () => {
  const x=body('panasonic-s5-iix'), before=json(`${archive}before.json`);
  assert.notEqual(x.id,'panasonic-s5-ii'); assert.equal(x.specs.cardSlots.count,2);
  assert.ok(x.specs.cardSlots.slots.every(s=>s.media.length===1&&s.media[0]==='SD'));
  const video=claim(x.id,'specs.video.max'); assert.match(video.conditions.externalSsd,/USB-SSD/); assert.match(video.conditions.otherModes,/ProRes/);
  assert.match(video.conditions.otherModes,/RAW external recorder/); assert.match(video.conditions.otherModes,/RTMP/);
  assert.equal(x.specs.video.bitDepth,10);
  assert.deepEqual(body('panasonic-s5-ii'),before.bodies.find(b=>b.id==='panasonic-s5-ii'));
  for (const id of ['panasonic-s1-ii','panasonic-s1-iie']) assert.deepEqual(body(id).specs.cardSlots.slots.map(s=>s.media),[['CFexpress Type B'],['SD']]);
  for (const id of ['panasonic-s1','panasonic-s1r']) assert.deepEqual(body(id).specs.cardSlots.slots.map(s=>s.media),[['XQD','CFexpress'],['SD']]);
  assert.equal(body('panasonic-s9').specs.cardSlots,null);
});

test('All eight actual LUMIX S claims retain weight configuration and reject invalid weight/IBIS before approval', () => {
  const weights=[486,714,795,800,1016,1016,740,1164], bodyOnly=[403,630,712,718,899,899,657,1052];
  for (const [n,id] of ids.entries()) {
    assert.equal(body(id).specs.weight,weights[n]); assert.equal(body(id).specs.bodyOnlyWeight,bodyOnly[n]);
    assert.equal(claim(id,'specs.weight').conditions.weightBasis,'battery-and-card'); assert.equal(claim(id,'specs.bodyOnlyWeight').conditions.weightBasis,'body-only');
    for (const [basis,code] of [[undefined,'WEIGHT_BASIS_REQUIRED'],['operational','INVALID_WEIGHT_BASIS'],['battery','WEIGHT_BASIS_MISMATCH']]) {
      const s=structuredClone(staging(id)), c=s.claims.find(c=>c.path==='specs.weight');
      if (basis===undefined) delete c.conditions.weightBasis; else c.conditions.weightBasis=basis;
      const result=validateStagingBatch([s],context()); assert.equal(result.valid,false); assert.ok(result.items[0].errors.some(e=>e.code===code));
    }
    const s=structuredClone(staging(id)); s.claims.find(c=>c.path==='specs.ibis').value=true;
    const result=validateStagingBatch([s],context()); assert.equal(result.valid,false); assert.ok(result.items[0].errors.some(e=>e.code==='INVALID_IBIS'));
  }
  for (const id of ['panasonic-s1','panasonic-s1r']) assert.equal(claim(id,'specs.weight').conditions.alternateConfiguration.weightG,1020);
});
