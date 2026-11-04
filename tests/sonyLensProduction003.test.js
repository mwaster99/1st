import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { digestValue, createSourceId, createClaimId, getAtPath, formatCanonicalDiff, validateStagingBatch } from '../scripts/objective/rules.mjs';
import { validateCanonical, verifyIncoming, proposedCanonical } from '../scripts/objective/merge.mjs';
import { jsonBytes } from '../scripts/objective/storage.mjs';

const root = new URL('../', import.meta.url), base = 'src/data/ingestion/';
const batch = 'production-sony-e-lenses-003', tx = base + 'transactions/' + batch + '/';
const bytes = p => readFileSync(new URL(p, root)), json = p => JSON.parse(bytes(p));
const sha = p => createHash('sha256').update(bytes(p)).digest('hex');
const a = json(base + 'sony-e-lenses-production-003.json'), e = json(tx + 'evidence.json');
const before = json(tx + 'before.json'), after = json(tx + 'after.json');
const manifest = json(base + 'batches/' + batch + '.json'), approval = json(base + 'approvals/' + batch + '.json');
const codes = ['SEL35F28Z','SEL85F14GM','SEL35F18F','SEL135F18GM','SEL28F20','SEL35F14Z','SEL50F14Z','SEL50F18F'];
const ids = a.products.map(p => p.productId), stage = id => e.bundle.stagings.find(s => s.product.id === id);
const lens = id => after.lenses.find(p => p.id === id), claim = (id,path) => stage(id).claims.find(c => c.path === path);
const ctx = { canonical:before, vocab:e.bundle.vocab, rawDocuments:new Map(Object.entries(e.bundle.raws)) };

test('Lens003 selects the exact remaining8 ordinary FE primes with no duplicate001/002 or special/upcoming identity', () => {
  assert.equal(a.startWorkingTree, 'clean'); assert.equal(a.selection.fixedBeforeWorker, true);
  assert.deepEqual(a.selection.codes, codes); assert.deepEqual(a.products.map(p => p.manufacturerModelCode), codes);
  const completed = ['001','002'].flatMap(n => json(base + 'sony-e-lenses-production-' + n + '.json').products.map(p => p.manufacturerModelCode));
  assert.equal(completed.length, 17); const inv = json(base + a.inventoryReference);
  for (const p of a.products) { assert.ok(!completed.includes(p.manufacturerModelCode)); const i = inv.items.find(i => i.manufacturerModelCode === p.manufacturerModelCode); assert.equal(i.status, 'released/current'); assert.equal(i.lensType, 'prime'); assert.equal(i.sensorFormatCoverage, '35mm full-frame'); assert.equal(p.state, 'canonicalized'); assert.equal(p.officialCurrentConfirmed, true); assert.equal(p.unpromoted.schemaExtensionRequired, false); }
  assert.equal(a.officialCurrentReview.selectedPresent, 8); assert.deepEqual(a.officialCurrentReview.selectedInventoryDifferences, []);
});

test('Lens003 atomically adds8 and preserves every existing165body/49lens including identities and prices', () => {
  assert.equal(before.bodies.length, 165); assert.equal(before.lenses.length, 49); assert.equal(after.lenses.length, 57); assert.equal(after.bodies.length + after.lenses.length, 222);
  assert.deepEqual(after.bodies, before.bodies); for (const old of before.lenses) assert.deepEqual(lens(old.id), old);
  for (const id of ids) { assert.ok(!before.lenses.some(l => l.id === id)); assert.equal(lens(id).price.new.value, null); assert.equal(lens(id).price.used.typical, null); assert.equal(lens(id).price.new.sourceType, 'unknown'); }
});

test('Lens003 all-new explicit approval does not enable model-null-fill or conflicts and keeps unique official identities', () => {
  assert.equal(a.approval.allowNewProducts, true); assert.equal(a.approval.allowModelNullFill, false); assert.equal(a.approval.allowValueConflicts, false);
  assert.ok(approval.productOperations.every(o => o.operation === 'new-product' && !o.modelNullFill));
  for (const [i,id] of ids.entries()) { const p = lens(id); assert.equal(p.model, codes[i]); assert.equal(p.identityEvidence.verification, 'verified'); assert.equal(e.bundle.identityMap.entries.filter(m => m.productId === id && m.manufacturerModelCode === codes[i]).length, 1); assert.equal(after.lenses.filter(l => l.model === codes[i]).length, 1); }
});

test('Lens003 actual prime endpoints use explicit mm, not APS-C equivalents or converter system focal', () => {
  const expected = [35,85,35,135,28,35,50,50];
  for (const [i,id] of ids.entries()) { assert.deepEqual(lens(id).specs.focal, { min:expected[i], max:expected[i] }); for (const k of ['min','max']) { assert.equal(claim(id,'specs.focal.' + k).rawUnit, 'mm'); assert.equal(claim(id,'specs.focal.' + k).unit, 'mm'); } assert.equal(lens(id).specs.equivalentFocal, undefined); }
});

test('Lens003 maximum-F prime endpoints remain numeric/equal and minimum selectable-F stays in provenance', () => {
  const expected = [2.8,1.4,1.8,1.8,2,1.4,1.4,1.8];
  for (const [i,id] of ids.entries()) { assert.deepEqual(lens(id).specs.aperture, { wide:expected[i], tele:expected[i] }); for (const k of ['wide','tele']) { const c = claim(id,'specs.aperture.' + k); assert.equal(c.rawUnit, null); assert.equal(c.unit, null); assert.ok([16,22].includes(c.conditions.unpromotedMinimumSelectableAperture)); } assert.equal(lens(id).specs.minimumAperture, undefined); }
});

test('Lens003 three malformed1.4k rows use separately attributed explicit manufacturer product maximum-F evidence', () => {
  for (const p of a.products.filter(p => p.maximumAperture === 1.4)) {
    for (const k of ['wide','tele']) { const c = claim(p.productId,'specs.aperture.' + k), raw = e.bundle.raws[c.sourceId], o = raw.items[0].observations.find(o => o.path === c.path); assert.equal(c.value, 1.4); assert.equal(c.conditions.malformedSpecText, '1.4k'); assert.equal(c.conditions.malformedTextNotParsed, true); assert.equal(raw.url, p.productUrl); assert.notEqual(raw.url, p.specUrl); assert.match(raw.evidenceExcerpt[o.evidenceRef].field, /F1.4/); }
  }
  assert.equal(a.review.malformedApertureTokensNotParsed, 3);
});

test('Lens003 physical Sony E and full-frame image coverage each have reviewed official field evidence', () => {
  for (const id of ids) { assert.equal(lens(id).mount, 'Sony E'); assert.equal(lens(id).specs.formatCoverage, 'full-frame'); assert.ok(lens(id).fieldEvidence['specs.formatCoverage']); assert.equal(claim(id,'specs.formatCoverage').conditions.coverageNotInferredFromName, true); }
});

test('Lens003 three explicit no-OSS rows are false and five absent rows stay UNKNOWN without body IBIS', () => {
  assert.deepEqual(ids.map(id => lens(id).specs.stabilization), [null,null,false,false,null,null,false,null]);
  for (const id of ids) { const c = claim(id,'specs.stabilization'); assert.equal(c.conditions.bodyIbisNotAsserted, true); assert.equal(c.conditions.absenceNotInferredFromName, true); assert.equal(lens(id).specs.ibis, undefined); if (c.value === null) assert.equal(lens(id).fieldEvidence[c.path], undefined); }
});

test('Lens00385GM uses AF0.85 representative, retains MF0.8, and never turns minimum focus into working distance', () => {
  assert.deepEqual(ids.map(id => lens(id).specs.minFocusM), [.35,.85,.22,.7,.29,.3,.45,.45]);
  const c = claim(ids[1],'specs.minFocusM'); assert.deepEqual(c.conditions.officialFocusDistancesM, { AF:.85, MF:.8 }); assert.equal(c.conditions.representativeBasis, 'AF'); assert.match(lens(ids[1]).specs.minFocusConditions, /MF 0.8m/);
  for (const [i,id] of ids.entries()) { const c = claim(id,'specs.minFocusM'); assert.equal(c.unit, 'm'); assert.equal(c.conditions.frontElementWorkingDistanceNotDerived, true); assert.equal(c.conditions.measurementReference, a.measurementReference.url); if (i !== 1) assert.match(lens(id).specs.minFocusConditions, /focus mode not separately specified/); }
});

test('Lens00335ZA49mm lens and40.5mm hood threads remain different scopes without false conflicts', () => {
  const c = claim(ids[0],'specs.filterMm'); assert.equal(c.value, 49); assert.equal(c.conditions.unpromotedHoodThreadMm, 40.5); assert.equal(c.conditions.hoodModel, 'ALC-SH129'); assert.equal(c.conditions.differentAccessoryScope, true);
  assert.equal(stage(ids[0]).claims.filter(c => c.path === 'specs.filterMm').length, 1); assert.equal(a.productionStatistics.valueConflicts, 0);
});

test('Lens00328mm bare lens never inherits optional21/16mm external converter focal or a new product', () => {
  const c = claim(ids[4],'specs.focal.min'); assert.equal(c.value, 28); assert.equal(c.conditions.convertersNotBuiltIn, true); assert.deepEqual(c.conditions.unpromotedExternalConverters, { wideEquivalentSystemFocalMm:21, fisheyeSystemFocalMm:16 }); assert.equal(after.lenses.length - before.lenses.length, 8);
});

test('Lens003 official weight/filter are promoted while dimensions/magnification/design remain supported provenance only', () => {
  assert.deepEqual(ids.map(id => lens(id).specs.weight), [120,820,280,950,200,630,778,186]);
  assert.deepEqual(ids.map(id => lens(id).specs.filterMm), [49,77,55,82,49,72,72,49]);
  assert.deepEqual(a.products.map(p => p.maximumMagnification), [.12,.12,.24,.25,.13,.18,.15,.14]);
  for (const p of a.products) { const c = claim(p.productId,'specs.weight'); assert.equal(c.unit, 'g'); assert.equal(c.conditions.lensOnly, true); assert.equal(c.conditions.bodyExcluded, true); assert.deepEqual(c.conditions.unpromotedDiameterLengthMm, p.diameterLengthMm); assert.equal(claim(p.productId,'specs.minFocusM').conditions.unpromotedMaximumMagnification, p.maximumMagnification); for (const k of ['dimensions','maximumMagnification','weatherSealing','coating','weightBasis']) assert.equal(lens(p.productId).specs[k], undefined); }
});

test('Lens003 all16 manufacturer sources including identity-only appear in human summary/canonical provenance', () => {
  assert.equal(Object.keys(e.bundle.raws).length, 16);
  for (const p of a.products) { const s = stage(p.productId), l = lens(p.productId); assert.equal(s.sources.length, 2); assert.equal(l.sources.length, 2); assert.match(formatCanonicalDiff(e.bundle.diff.items.find(d => d.productId === p.productId)), /10 fields \/ 2 sources/); assert.ok(l.sources.find(src => src.sourceId === s.identityEvidence.sourceId).fields.includes('identity')); for (const src of s.sources) assert.equal(new URL(src.url).hostname, 'www.sony.co.kr'); }
});

test('Lens00375 known fields are verified and5 UNKNOWN claims are ignored without fabricated evidence', () => {
  let known = 0, unknown = 0;
  for (const id of ids) { assert.equal(stage(id).claims.length, 10); for (const c of stage(id).claims) { const l = lens(id), f = l.fieldEvidence[c.path]; if (c.value === null) { unknown++; assert.equal(f, undefined); continue; } known++; assert.equal(f.verification, 'verified'); assert.deepEqual(f.claimIds, [c.claimId]); assert.deepEqual(getAtPath(l,c.path), c.value); assert.ok(l.sources.some(src => src.sourceId === c.sourceId && src.fields.includes(c.path))); } }
  assert.equal(known, 75); assert.equal(unknown, 5); assert.equal(approval.decisions.filter(d => d.action === 'accept').length, 75); assert.equal(approval.decisions.filter(d => d.action === 'ignore').length, 5); assert.ok(e.bundle.diff.items.every(d => d.changes.every(c => c.category === 'new-product')));
});

test('Lens003 raw-helper preserves exact actual browser-read UTC timestamps and source/content digests', () => {
  for (const p of a.products) { const raws = p.sourceIds.map(id => e.bundle.raws[id]); assert.equal(raws.find(r => r.url === p.productUrl).accessedAt, p.productRetrievedAt); assert.equal(raws.find(r => r.url === p.specUrl).accessedAt, p.specRetrievedAt); for (const raw of raws) { assert.equal(raw.contentDigest, digestValue(raw.evidenceExcerpt)); assert.equal(raw.sourceId, createSourceId(raw)); assert.equal(raw.accessedAt, new Date(raw.accessedAt).toISOString()); assert.ok(raw.accessedAt < a.rawHelperCreatedAt); } }
});

test('Lens003 worker accounting preserves preAPI lock failures, malformed response cost and one same-ID retry', () => {
  assert.equal(a.workerTasks.length, 8); assert.equal(new Set(a.workerTasks.map(w => w.taskId)).size, 8); assert.deepEqual(a.workerStats, { actualApiAttempts:9, retries:1, failures:1, preApiStateFailures:8, successfulProducts:8 }); assert.deepEqual(a.workerTotals, { inputTokens:7393, outputTokens:4484, totalTokens:11877 });
  assert.deepEqual(a.workerTasks.map(w => w.usage.totalTokens), [1356,2826,1263,1249,1282,1337,1225,1339]);
  const failed = a.workerTasks[1]; assert.deepEqual(failed.attempts.map(v => v.status), ['failure','success']); assert.deepEqual(failed.attempts.map(v => v.attempt), [1,2]); assert.equal(failed.attempts[0].usage.totalTokens, 1460); assert.match(failed.attempts[0].warnings.join(' '), /MALFORMED_RESPONSE/);
  for (const w of a.workerTasks) { assert.equal(w.preApiFailures.length, 1); assert.equal(w.preApiFailures[0].error, 'STATE_UNAVAILABLE'); assert.equal(w.preApiFailures[0].apiAttempt, false); assert.equal(w.reviewed, true); assert.equal(w.patchApplied, false); assert.ok(w.adopted.length && w.discarded.length); assert.ok(!existsSync(new URL('.cheap-worker-sony-lens003-' + w.manufacturerModelCode.toLowerCase() + '.txt', root))); }
  assert.equal(a.workerFixturesDeleted, true); assert.equal(a.humanIntervention.extraUserProductDecisions, 0);
});

test('Lens003 single8-item atomic archive binds all source/staging/approval digests and replays exactly/idempotently', () => {
  assert.equal(manifest.items.length, 8); assert.ok(manifest.items.every(i => i.state === 'canonicalized')); assert.equal(json(tx + 'journal.json').phase, 'canonicalized'); assert.equal(sha(tx + 'before.json'), manifest.canonicalBaselineDigest); assert.equal(sha(tx + 'after.json'), manifest.expectedCanonicalDigest); assert.deepEqual(e.approval, approval); assert.deepEqual(json(base + 'approvals/' + batch + '/' + approval.approvalId + '.json'), approval);
  for (const [file,digest] of Object.entries(e.bundle.artifactDigests)) {
    if (file === 'identity-map.json' || file === 'vocab.json') { const archived = file === 'identity-map.json' ? e.bundle.identityMap : e.bundle.vocab, current = json(base + file); assert.equal(createHash('sha256').update(jsonBytes(archived)).digest('hex'), digest); for (const [k,v] of Object.entries(archived)) assert.deepEqual(Array.isArray(v) ? current[k].slice(0,v.length) : current[k], v); }
    else assert.equal(sha(base + file), digest);
  }
  for (const item of manifest.items) { assert.equal(item.stagingDigest, digestValue(stage(item.productId))); assert.deepEqual(item.rawDigests, item.sourceIds.map(id => digestValue(e.bundle.raws[id]))); }
  verifyIncoming(e.bundle,before); const replay = proposedCanonical(before,e.bundle,approval.decisions,approval.productOperations); assert.deepEqual(replay.canonical,after); assert.equal(replay.digest,manifest.expectedCanonicalDigest); assert.deepEqual(proposedCanonical(after,e.bundle,approval.decisions,approval.productOperations).canonical,after); assert.equal(a.checkpoint.reapply.status,'already-canonicalized'); assert.equal(a.checkpoint.reapply.canonicalMatches,true);
});

test('Lens003 strict gates continue rejecting invalid unit/type/range/coverage, source conflicts and locked identity', () => {
  assert.equal(validateStagingBatch(e.bundle.stagings,ctx).valid,true);
  for (const [path,value,code] of [['specs.aperture.wide','F2.8','INVALID_LENS_SPEC'],['specs.stabilization',1,'INVALID_LENS_SPEC'],['specs.formatCoverage','FE','INVALID_LENS_COVERAGE'],['specs.aperture.wide',0,'INVALID_PHYSICAL_RANGE']]) { const s = structuredClone(stage(ids[0])); s.claims.find(c => c.path === path).value = value; assert.ok(validateStagingBatch([s],ctx).items[0].errors.some(e => e.code === code)); }
  for (const [unit,code] of [[null,'UNIT_REQUIRED'],['ft','UNSUPPORTED_UNIT']]) { const s = structuredClone(stage(ids[0])); s.claims.find(c => c.path === 'specs.focal.min').rawUnit = unit; assert.ok(validateStagingBatch([s],ctx).items[0].errors.some(e => e.code === code)); }
  const s = structuredClone(stage(ids[0])), c = structuredClone(claim(ids[0],'specs.focal.min')); c.value = 36; c.rawValue = 36; c.claimId = createClaimId(c); s.claims.push(c); assert.ok(validateStagingBatch([s],ctx).items[0].errors.some(e => e.code === 'CONFLICTING_CLAIM_VALUES'));
  const locked = structuredClone(stage(ids[0])); locked.product.model = 'DIFFERENT'; assert.ok(validateStagingBatch([locked],{ ...ctx,canonical:after }).items[0].errors.some(e => e.code === 'MODEL_IDENTITY_CONFLICT')); locked.product.model = codes[0]; locked.product.aliases = [lens(ids[1]).name]; assert.ok(validateStagingBatch([locked],{ ...ctx,canonical:after }).items[0].errors.some(e => e.code === 'ALIAS_COLLISION'));
});

test('Lens003 fresh status deltas keep old67 denominator immutable and account for current69/25completed/44remaining', () => {
  const inv = json(base + a.inventoryReference); assert.equal(inv.items.filter(p => p.status === 'released/current' && p.scopeClassification === 'native-optical-lens').length,67); assert.equal(inv.items.filter(p => p.status === 'announced/upcoming').length,4);
  assert.deepEqual(a.officialCurrentReview.statusChangesOutsideSelection.map(p => p.code), ['SEL400F45GM','SEL600F63GM']); assert.ok(a.officialCurrentReview.statusChangesOutsideSelection.every(p => p.before === 'announced/upcoming' && p.now === 'released/current')); assert.deepEqual(a.officialCurrentReview.stillUpcoming.map(p => p.code), ['SEL814G','SEL28702']);
  assert.equal(a.countsAfter.currentReleased,69); assert.equal(a.countsAfter.currentSonyLensesProductionCompleted,25); assert.equal(a.countsAfter.currentSonyLensesProductionUnprocessed,44); assert.equal(a.countsAfter.historicalSonyLensesProductionUnprocessed,42); assert.equal(a.countsAfter.ordinaryFePrimesUnprocessed,0);
  const completed = ['001','002','003'].flatMap(n => json(base + 'sony-e-lenses-production-' + n + '.json').products.map(p => p.manufacturerModelCode)), remaining = a.futurePlan.batches.flatMap(b => b.modelCodes);
  assert.equal(completed.length,25); assert.equal(remaining.length,44); assert.equal(new Set([...completed,...remaining]).size,69);
  const currentCodes = [...inv.items.filter(p => p.status === 'released/current' && p.scopeClassification === 'native-optical-lens').map(p => p.manufacturerModelCode),'SEL400F45GM','SEL600F63GM']; assert.deepEqual([...completed,...remaining].sort(),currentCodes.sort()); assert.deepEqual(a.futurePlan.familyRemaining,{ 'FE primes':0,'APS-C':9,'FE wide/standard/telephoto zooms':24,'Special-family review':11 });
});

test('Lens003 live canonical passes shared contract with one occurrence of every official ID/model', () => {
  const live = json('src/data/cameraProducts.json'); assert.equal(validateCanonical(live,json(base + 'vocab.json')),true); for (const [i,id] of ids.entries()) { assert.equal(live.lenses.filter(l => l.id === id).length,1); assert.equal(live.lenses.filter(l => l.model === codes[i]).length,1); }
});
