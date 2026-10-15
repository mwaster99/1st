import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, writeFile, access, rm} from 'node:fs/promises';
import {readFileSync, readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {newProductFixture, pipeline, approveNew, newBatchId, runNew} from './support/newProductFixture.mjs';
import {applyBatch, recoverBatch} from '../scripts/objective/promotion.mjs';
import {validateCanonical, verifyIncoming, proposedCanonical} from '../scripts/objective/merge.mjs';
import {digestValue, normalizeRawDocument, normalizeClaimValue, validateStagingBatch, createCanonicalDiff, combineStagingFragments, formatCanonicalDiff, createSourceId} from '../scripts/objective/rules.mjs';
import {validateLensValue} from '../scripts/objective/lens-contracts.mjs';

const root=new URL('../',import.meta.url),json=p=>JSON.parse(readFileSync(new URL(p,root))),hash=b=>createHash('sha256').update(b).digest('hex');
const base='src/data/ingestion/',live=json('src/data/cameraProducts.json'),review={verification:'verified',reviewedAt:'2026-10-15',reviewer:'Synthetic lens readiness reviewer'};
const old=live.lenses.find(l=>l.id==='sony-fe-40-g');
async function lensFixture(t,{type='prime',focal=[40,40],aperture=[2.5,2.5],coverage='35mm full-frame',existing=false,model='SYNTH-LENS-40',rows=[],mutate}={}){
 const f=await newProductFixture(t,{mutateRaw(raw){
  const lens=raw.items.find(i=>i.productType==='lens');raw.items=[lens];lens.manufacturerModelCode='SYNTH-LENS-40';
  lens.identity={name:existing?old.name:'Sony Synthetic Lens Readiness',brand:'Sony',model,aliases:existing?old.aliases:[],mount:'Sony E',type};lens.observations=[];
  const values=[['specs.focal.min',focal[0],'mm'],['specs.focal.max',focal[1],'mm'],['specs.aperture.wide',aperture[0],null],['specs.aperture.tele',aperture[1],null],['specs.weight',173,'g'],['specs.stabilization',false,null],['specs.minFocusM',0.28,'m']];
  if(coverage!==undefined)values.push(['specs.formatCoverage',coverage,null]);
  for(const [p,v,u,conditions={}] of [...values,...rows]){
   const idx=raw.evidenceExcerpt.push({field:'Synthetic '+p,value:v,unit:u})-1;
   const obs={path:p,evidenceRef:idx,rawValue:v,rawUnit:u,locator:{section:'Synthetic specifications',row:p},conditions,...review};
   const prior=lens.observations.findIndex(o=>o.path===p);if(prior>=0)lens.observations[prior]=obs;else lens.observations.push(obs);
  }
  mutate?.(raw,lens);
 },mutateIdentityMap(map){if(existing)map.entries[0].productId=old.id;}});
 return f;
}
async function stage(f){return JSON.parse(await readFile(path.join(f.p.ingestion,'staging',newBatchId,'sony-stage3-test-lens.json')));}
async function bodyUnchanged(f){assert.deepEqual(JSON.parse(await readFile(f.p.canonical)).bodies,JSON.parse(f.before).bodies);}
function success(f){const rs=pipeline(f);for(const r of rs)assert.equal(r.status,0,r.stdout+r.stderr);return rs;}
async function assertRejected(t,options,code){const f=await lensFixture(t,options),rs=pipeline(f);assert.equal(rs[0].status,0,rs[0].stderr);assert.equal(rs[1].status,1,rs[1].stdout);assert.match(rs[1].stdout,new RegExp(code));const m=JSON.parse(await readFile(f.p.manifest));assert.equal(m.items[0].state,'rejected');await assert.rejects(approveNew(f));assert.equal(await readFile(f.p.canonical,'utf8'),f.before);}

for(const [name,type,focal,aperture,coverage] of [['prime','prime',[40,40],[2.5,2.5],'35mm full-frame'],['constant zoom','zoom',[24,70],[2.8,2.8],'full-frame'],['variable zoom','zoom',[28,60],[4,5.6],'APS-C']])test(`new ${name} lens atomic apply/provenance/replay`,async t=>{
 const f=await lensFixture(t,{type,focal,aperture,coverage});success(f);const s=await stage(f);assert.equal(s.product.specs.formatCoverage,coverage==='35mm full-frame'?'full-frame':coverage);const approval=await approveNew(f);assert.equal((await applyBatch(f.root,newBatchId)).status,'canonicalized');
 const afterBytes=await readFile(f.p.canonical,'utf8'),after=JSON.parse(afterBytes),lens=after.lenses.find(l=>l.id==='sony-stage3-test-lens-35-f2');
 assert.deepEqual(lens.specs.focal,{min:focal[0],max:focal[1]});assert.deepEqual(lens.specs.aperture,{wide:aperture[0],tele:aperture[1]});assert.equal(lens.mount,'Sony E');assert.equal(lens.specs.formatCoverage,s.product.specs.formatCoverage);assert.ok(lens.fieldEvidence['specs.formatCoverage'].claimIds.length);assert.ok(lens.sources.some(s=>s.fields.includes('specs.formatCoverage')));assert.equal(after.lenses.length,JSON.parse(f.before).lenses.length+1);await bodyUnchanged(f);
 assert.equal(hash(afterBytes),approval.expectedCanonicalDigest);const repeat=await applyBatch(f.root,newBatchId);assert.equal(repeat.status,'already-canonicalized');assert.equal(repeat.canonicalMatches,true);assert.equal(await readFile(f.p.canonical,'utf8'),afterBytes);
});

test('existing missing model preserves ID/identity/prices, requires explicit fill approval and archives identity source',async t=>{
 const f=await lensFixture(t,{existing:true});success(f);const diff=JSON.parse(await readFile(f.p.diff));assert.equal(diff.items[0].operation,'update-product');assert.equal(diff.items[0].modelNullFill.category,'null-fill');assert.match(formatCanonicalDiff(diff.items[0]),/model: UNKNOWN -> SYNTH-LENS-40/);
 assert.ok(diff.items[0].changes.some(c=>c.category==='same-value/new-evidence'));assert.ok(diff.items[0].changes.some(c=>c.path==='specs.formatCoverage'&&c.category==='null-fill'));
 await assert.rejects(approveNew(f),/allow-model-null-fill/);const approved=await approveNew(f,{allowModelNullFill:true});assert.equal(approved.productOperations[0].modelNullFill.incomingValue,'SYNTH-LENS-40');await applyBatch(f.root,newBatchId);
 const after=JSON.parse(await readFile(f.p.canonical)),before=JSON.parse(f.before),lens=after.lenses.find(l=>l.id===old.id);assert.equal(after.lenses.length,before.lenses.length);assert.equal(lens.model,'SYNTH-LENS-40');for(const k of ['id','name','brand','mount','type','aliases','price'])assert.deepEqual(lens[k],old[k]);for(const untouched of before.lenses.filter(l=>l.id!==old.id))assert.deepEqual(after.lenses.find(l=>l.id===untouched.id),untouched);assert.equal(lens.identityEvidence.verification,'verified');assert.ok(lens.sources.some(s=>s.sourceId===lens.identityEvidence.sourceId&&s.fields.includes('model')&&s.fields.includes('identity')));await bodyUnchanged(f);
 const e=JSON.parse(await readFile(path.join(f.p.transaction,'evidence.json')));verifyIncoming(e.bundle,before);assert.deepEqual(proposedCanonical(before,e.bundle,e.approval.decisions,e.approval.productOperations).canonical,after);assert.deepEqual(proposedCanonical(after,e.bundle,e.approval.decisions,e.approval.productOperations).canonical,after);
 assert.equal((await applyBatch(f.root,newBatchId)).canonicalMatches,true);
});

test('existing explicit null model is fillable; non-null model replacement is rejected at validate',async t=>{
 const f=await lensFixture(t,{existing:true});const c=JSON.parse(f.before);c.lenses.find(l=>l.id===old.id).model='LOCKED-MODEL';const bytes=JSON.stringify(c,null,2)+'\n';await writeFile(f.p.canonical,bytes);const m=JSON.parse(await readFile(f.p.manifest));m.canonicalBaselineDigest=hash(bytes);await writeFile(f.p.manifest,JSON.stringify(m,null,2)+'\n');
 const rs=pipeline(f);assert.equal(rs[1].status,1);assert.match(rs[1].stdout,/MODEL_IDENTITY_CONFLICT/);await assert.rejects(approveNew(f,{allowModelNullFill:true}));assert.equal(await readFile(f.p.canonical,'utf8'),bytes);
 const n=await lensFixture(t,{existing:true});const nc=JSON.parse(n.before);nc.lenses.find(l=>l.id===old.id).model=null;const nb=JSON.stringify(nc,null,2)+'\n';await writeFile(n.p.canonical,nb);const nm=JSON.parse(await readFile(n.p.manifest));nm.canonicalBaselineDigest=hash(nb);await writeFile(n.p.manifest,JSON.stringify(nm,null,2)+'\n');success(n);await approveNew(n,{allowModelNullFill:true});await applyBatch(n.root,newBatchId);assert.equal(JSON.parse(await readFile(n.p.canonical)).lenses.find(l=>l.id===old.id).model,'SYNTH-LENS-40');
});

test('existing model fill retains identity-only plus specification sources and official OSS true separately',async t=>{
 const f=await lensFixture(t,{existing:true,rows:[['specs.stabilization',true,null]]});
 const identity=structuredClone(f.raw),spec=structuredClone(f.raw);identity.items[0].observations=[];delete spec.items[0].identityEvidence;spec.url='https://www.sony.com/synthetic-lens-readiness/specifications';
 for(const raw of [identity,spec]){raw.contentDigest=digestValue(raw.evidenceExcerpt);raw.sourceId=createSourceId(raw);await writeFile(path.join(f.p.ingestion,'raw',raw.sourceId+'.json'),JSON.stringify(raw,null,2)+'\n');}
 const manifest=JSON.parse(await readFile(f.p.manifest));manifest.items[0].sourceIds=[identity.sourceId,spec.sourceId];manifest.items[0].rawDigests=[digestValue(identity),digestValue(spec)];await writeFile(f.p.manifest,JSON.stringify(manifest,null,2)+'\n');success(f);
 const s=await stage(f),diff=JSON.parse(await readFile(f.p.diff));assert.equal(s.sources.length,2);assert.equal(s.identityEvidence.sourceId,identity.sourceId);assert.equal(diff.items[0].identityEvidence.source.sourceId,identity.sourceId);
 await approveNew(f,{allowModelNullFill:true,allowValueConflicts:true});await applyBatch(f.root,newBatchId);const c=JSON.parse(await readFile(f.p.canonical)),lens=c.lenses.find(l=>l.id===old.id);assert.equal(lens.specs.stabilization,true);assert.equal(lens.identityEvidence.sourceId,identity.sourceId);assert.ok(lens.sources.some(v=>v.sourceId===identity.sourceId&&v.fields.includes('model')));assert.ok(lens.sources.some(v=>v.sourceId===spec.sourceId&&v.fields.includes('specs.stabilization')));assert.equal(lens.fieldEvidence['specs.stabilization'].claimIds.length,1);await bodyUnchanged(f);assert.equal((await applyBatch(f.root,newBatchId)).canonicalMatches,true);
});

for(const [label,mutate,code] of [
 ['unverified identity',(r,l)=>{l.identityEvidence.verification='pending';},'MODEL_IDENTITY_UNVERIFIED'],
 ['wrong model code',(r,l)=>{l.identity.model='ANOTHER-MODEL';},'MODEL_IDENTITY_MISMATCH'],
 ['wrong mount',(r,l)=>{l.identity.mount='Canon RF';},'LENS_IDENTITY_CONFLICT'],
 ['changed alias',(r,l)=>{l.identity.aliases=['Different identity'];},'LENS_IDENTITY_CONFLICT'],
])test(`existing enrichment rejects ${label}`,async t=>assertRejected(t,{existing:true,mutate},code));

test('existing model fill cannot proceed with no identity evidence',async t=>{
 const f=await lensFixture(t,{existing:true});delete f.raw.items[0].identityEvidence;await writeFile(path.join(f.p.ingestion,'raw',f.raw.sourceId+'.json'),JSON.stringify(f.raw,null,2)+'\n');
 const rs=pipeline(f);assert.equal(rs[1].status,1);assert.match(rs[1].stdout,/MODEL_IDENTITY_UNVERIFIED/);assert.equal(await readFile(f.p.canonical,'utf8'),f.before);
});

for(const [path,value,unit,code] of [
 ['specs.focal.min',40,null,'UNIT_REQUIRED'],['specs.focal.min',40,'ft','UNSUPPORTED_UNIT'],['specs.focal.min','40','mm','INVALID_LENS_SPEC'],['specs.focal.min',{},'mm','INVALID_LENS_SPEC'],['specs.focal.min',[],'mm','INVALID_LENS_SPEC'],
 ['specs.aperture.wide','2.8',null,'INVALID_LENS_SPEC'],['specs.aperture.wide','F2.8',null,'INVALID_LENS_SPEC'],['specs.aperture.wide',{},null,'INVALID_LENS_SPEC'],['specs.aperture.tele',true,null,'INVALID_LENS_SPEC'],['specs.aperture.wide',-1,null,'INVALID_PHYSICAL_RANGE'],
 ['specs.stabilization','OSS',null,'INVALID_LENS_SPEC'],['specs.stabilization',1,null,'INVALID_LENS_SPEC'],['specs.stabilization',{},null,'INVALID_LENS_SPEC'],['specs.formatCoverage','FE',null,'INVALID_LENS_COVERAGE'],['specs.formatCoverage','Sony FE',null,'INVALID_LENS_COVERAGE'],['specs.formatCoverage',true,null,'INVALID_LENS_COVERAGE'],['specs.formatCoverage','full-frame','mm','UNSUPPORTED_UNIT'],
 ['specs.weight','173','g','INVALID_LENS_SPEC'],['specs.weight',173,null,'UNIT_REQUIRED'],['specs.filterMm',49,'ft','UNSUPPORTED_UNIT'],['specs.minFocusM',0.28,null,'UNIT_REQUIRED'],
 ['specs.ibis',{present:true},null,'UNSUPPORTED_CLAIM_PATH'],
])test(`CLI validate rejects ${path} ${JSON.stringify(value)} unit ${unit}`,async t=>assertRejected(t,{rows:[[path,value,unit]]},code));

test('prime mismatch and zoom/aperture reversed ranges fail before approval',async t=>{
 await assertRejected(t,{type:'prime',focal:[35,50]},'INVALID_LENS_FOCAL');await assertRejected(t,{type:'zoom',focal:[70,24]},'INVALID_ORDERED_RANGE');await assertRejected(t,{aperture:[5.6,4]},'INVALID_ORDERED_RANGE');await assertRejected(t,{aperture:[2.5,2.8]},'INVALID_LENS_APERTURE');
});

test('supported cm/in/m/kg conversions retain explicit source units; UNKNOWN never requires unit',async t=>{
 const f=await lensFixture(t,{coverage:'UNKNOWN',rows:[['specs.focal.min',4,'cm'],['specs.focal.max',4,'cm'],['specs.weight',0.173,'kg'],['specs.filterMm',2,'in'],['specs.minFocusM',28,'cm'],['specs.stabilization','UNKNOWN',null]]});success(f);const s=await stage(f);assert.equal(s.product.specs.focal.min,40);assert.equal(s.product.specs.filterMm,50.8);assert.equal(s.product.specs.weight,173);assert.equal(s.product.specs.minFocusM,0.28);assert.equal(s.product.specs.stabilization,null);assert.equal(s.product.specs.formatCoverage,null);await approveNew(f);await applyBatch(f.root,newBatchId);const c=JSON.parse(await readFile(f.p.canonical));assert.equal(c.lenses.at(-1).specs.formatCoverage,null);
});

test('optional missing coverage and explicit null stay UNKNOWN; no model-name or mount inference',async t=>{
 const f=await lensFixture(t,{mutate(r,l){l.observations=l.observations.filter(o=>o.path!=='specs.formatCoverage');}});success(f);await approveNew(f);await applyBatch(f.root,newBatchId);const c=JSON.parse(await readFile(f.p.canonical));assert.equal(c.lenses.at(-1).specs.formatCoverage,undefined);assert.equal(validateCanonical(c,json(base+'vocab.json')),true);
 const n=await lensFixture(t,{coverage:null});success(n);await approveNew(n);await applyBatch(n.root,newBatchId);assert.equal(JSON.parse(await readFile(n.p.canonical)).lenses.at(-1).specs.formatCoverage,null);
 assert.equal(normalizeClaimValue('specs.formatCoverage','35mm 풀프레임',null).value,'full-frame');assert.equal(normalizeClaimValue('specs.formatCoverage','APS-C',null).value,'APS-C');assert.throws(()=>validateLensValue('FE','specs.formatCoverage'));
});

test('new duplicate identity, field conflict and unreviewed claims cannot become lens provenance',async t=>{
 await assertRejected(t,{mutate(r,l){l.identity.name=old.name;}},'ALIAS_COLLISION|EQUIVALENT_EXISTING_PRODUCT');
 await assertRejected(t,{mutate(r,l){const o=structuredClone(l.observations[0]);o.rawValue=41;o.evidenceRef=r.evidenceExcerpt.push({field:'Conflicting synthetic focal',value:41,unit:'mm'})-1;l.observations.push(o);}},'CONFLICTING_CLAIM_VALUES');
 await assertRejected(t,{mutate(r,l){l.observations[0].verification='pending';}},'CLAIM_NOT_VERIFIED');
});

test('lens value conflicts require explicit approval and cannot silently replace existing facts',async t=>{
 const f=await lensFixture(t,{existing:true,rows:[['specs.weight',174,'g']]});success(f);await assert.rejects(approveNew(f,{allowModelNullFill:true}),/Value conflict requires/);assert.equal(await readFile(f.p.canonical,'utf8'),f.before);await approveNew(f,{allowModelNullFill:true,allowValueConflicts:true});await applyBatch(f.root,newBatchId);assert.equal(JSON.parse(await readFile(f.p.canonical)).lenses.find(l=>l.id===old.id).specs.weight,174);
});

test('lens enrichment recovers after interruption at rename and keeps explicit approval/digest protection',async t=>{
 const f=await lensFixture(t,{existing:true});success(f);await approveNew(f,{allowModelNullFill:true});await assert.rejects(applyBatch(f.root,newBatchId,{hook:async event=>{if(event==='before-manifest')throw Error('synthetic interruption');}}),/synthetic interruption/);assert.equal((await recoverBatch(f.root,newBatchId)).status,'canonicalized');assert.equal((await applyBatch(f.root,newBatchId)).canonicalMatches,true);
});

test('known matching model enriches without null-fill operation; evidence tampering and forged approval are blocked',async t=>{
 const f=await lensFixture(t,{existing:true});const c=JSON.parse(f.before);c.lenses.find(l=>l.id===old.id).model='SYNTH-LENS-40';const bytes=JSON.stringify(c,null,2)+'\n';await writeFile(f.p.canonical,bytes);const m=JSON.parse(await readFile(f.p.manifest));m.canonicalBaselineDigest=hash(bytes);await writeFile(f.p.manifest,JSON.stringify(m,null,2)+'\n');success(f);assert.equal(JSON.parse(await readFile(f.p.diff)).items[0].modelNullFill,undefined);await approveNew(f);await applyBatch(f.root,newBatchId);assert.equal((await applyBatch(f.root,newBatchId)).canonicalMatches,true);
 const n=await lensFixture(t,{existing:true});success(n);const s=await stage(n),raws=new Map([[n.raw.sourceId,n.raw]]);s.identityEvidence.evidenceId='identity-forged';const validation=validateStagingBatch([s],{canonical:JSON.parse(n.before),vocab:json(base+'vocab.json'),rawDocuments:raws});assert.ok(validation.items[0].errors.some(e=>e.code==='RAW_IDENTITY_MISMATCH'));
 await approveNew(n,{allowModelNullFill:true});const a=JSON.parse(await readFile(n.p.approval));delete a.productOperations[0].modelNullFill;delete a.approvalId;a.approvalId='approval-'+digestValue(a);await writeFile(n.p.approval,JSON.stringify(a,null,2)+'\n');await assert.rejects(applyBatch(n.root,newBatchId),/Approval product operation mismatch/);assert.equal(await readFile(n.p.canonical,'utf8'),n.before);
});

test('lens-only coverage cannot enter body specs, and invented FE physical mount cannot normalize',async t=>{
 const f=await newProductFixture(t,{mutateRaw(r){const b=r.items.find(i=>i.productType==='body'),i=r.evidenceExcerpt.push({field:'Wrong body coverage',value:'full-frame',unit:null})-1;b.observations.push({path:'specs.formatCoverage',evidenceRef:i,rawValue:'full-frame',rawUnit:null,locator:{row:'Wrong field'},conditions:{},...review});}});const rs=pipeline(f);assert.equal(rs[1].status,1);assert.match(rs[1].stdout,/UNSUPPORTED_CLAIM_PATH/);
 const n=await lensFixture(t,{mutate(r,l){l.identity.mount='Sony FE';}});const ns=pipeline(n);assert.notEqual(ns[0].status,0);assert.match(ns[0].stderr,/Unknown mount/);assert.equal(await readFile(n.p.canonical,'utf8'),n.before);
});

test('isolated fixture files are deleted after validation and never touch the real canonical',async t=>{
 const bytes=readFileSync(new URL('src/data/cameraProducts.json',root));const f=await lensFixture(t);success(f);await approveNew(f);await applyBatch(f.root,newBatchId);await rm(f.root,{recursive:true,force:true});await assert.rejects(access(f.root),/ENOENT/);assert.deepEqual(readFileSync(new URL('src/data/cameraProducts.json',root)),bytes);
});

test('legacy missing model remains valid but malformed known model and unapproved vocab growth do not',()=>{
 for(const value of [0,false,{},[], '', 'UNKNOWN']){const c=structuredClone(live);c.lenses[0].model=value;assert.throws(()=>validateCanonical(c,json(base+'vocab.json')),/Invalid lens model/);}
 const archived=json(base+'transactions/production-hasselblad-bodies-001/evidence.json').bundle.vocab;assert.deepEqual(json(base+'vocab.json').claimPaths,[...archived.claimPaths,'specs.formatCoverage']);assert.equal(new Set(json(base+'vocab.json').claimPaths).size,json(base+'vocab.json').claimPaths.length);
});

test('CLI existing model fill requires its explicit flag then applies and repeats as already-canonicalized',async t=>{
 const f=await lensFixture(t,{existing:true});success(f);const digest=digestValue(JSON.parse(await readFile(f.p.diff))),args=['--confirm','--reviewer','Synthetic CLI operator','--reason','Fixture identity null-fill only','--diff-digest',digest];
 const refused=runNew(f.root,'approve',...args);assert.notEqual(refused.status,0);assert.match(refused.stderr,/allow-model-null-fill/);const approved=runNew(f.root,'approve',...args,'--allow-model-null-fill');assert.equal(approved.status,0,approved.stderr);assert.equal(runNew(f.root,'apply').status,0);const repeated=runNew(f.root,'apply');assert.equal(repeated.status,0,repeated.stderr);assert.equal(JSON.parse(repeated.stdout).status,'already-canonicalized');assert.equal(JSON.parse(repeated.stdout).canonicalMatches,true);
});

test('all sealed brand transaction bundles replay exactly under current code; live legacy36 lenses remain valid',()=>{
 assert.equal(validateCanonical(live,json(base+'vocab.json')),true);const dirs=readdirSync(new URL(base+'transactions/',root));let bodyArchives=0;const brands=new Set();
 for(const dir of dirs){const prefix=base+'transactions/'+dir+'/';const e=json(prefix+'evidence.json'),before=json(prefix+'before.json'),after=json(prefix+'after.json');const legacyFixedLensUnits=e.bundle.stagings.some(s=>s.claims.some(c=>c.path.startsWith('specs.fixedLens.equivalentFocal.')&&c.unit===null&&c.rawUnit==='mm'));verifyIncoming(e.bundle,before,{legacyFixedLensUnits});const replay=proposedCanonical(before,e.bundle,e.approval.decisions,e.approval.productOperations);assert.deepEqual(replay.canonical,after,dir);assert.deepEqual(proposedCanonical(after,e.bundle,e.approval.decisions,e.approval.productOperations).canonical,after,dir);for(const s of e.bundle.stagings)brands.add(s.product.brand);if(e.bundle.stagings.some(s=>s.productType==='body'))bodyArchives++;}
 assert.ok(bodyArchives>=9);assert.equal(brands.size,9);assert.equal(live.lenses.length,36);
});
