import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { digestValue, createSourceId, createClaimId, getAtPath, formatCanonicalDiff, validateStagingBatch } from '../scripts/objective/rules.mjs';
import { validateCanonical, verifyIncoming, proposedCanonical } from '../scripts/objective/merge.mjs';
import { jsonBytes } from '../scripts/objective/storage.mjs';

const root = new URL('../', import.meta.url), base = 'src/data/ingestion/';
const batch = 'production-sony-e-lenses-002', tx = base + 'transactions/' + batch + '/';
const bytes = p => readFileSync(new URL(p, root)), json = p => JSON.parse(bytes(p));
const sha = p => createHash('sha256').update(bytes(p)).digest('hex');
const a = json(base + 'sony-e-lenses-production-002.json'), e = json(tx + 'evidence.json');
const before = json(tx + 'before.json'), after = json(tx + 'after.json');
const manifest = json(base + 'batches/' + batch + '.json'), approval = json(base + 'approvals/' + batch + '.json');
const codes = ['SEL16F18G','SEL14F18GM','SEL20F18G','SEL24F28G','SEL24F14GM','SEL35F14GM','SEL50F14GM','SEL50F12GM','SEL50F25G','SEL85F14GM2','SEL55F18Z','SEL85F18'];
const ids = a.products.map(p => p.productId), stage = id => e.bundle.stagings.find(s => s.product.id === id);
const lens = id => after.lenses.find(p => p.id === id), claim = (id, path) => stage(id).claims.find(c => c.path === path);
const ctx = { canonical: before, vocab: e.bundle.vocab, rawDocuments: new Map(Object.entries(e.bundle.raws)) };

test('Lens002 fixes twelve current FE prime identities before workers and excludes pilot/upcoming/TC', () => {
  assert.equal(a.startWorkingTree, 'clean'); assert.equal(a.selection.fixedBeforeWorker, true);
  assert.deepEqual(a.selection.codes, codes); assert.deepEqual(a.products.map(p => p.manufacturerModelCode), codes);
  assert.equal(a.officialCurrentReview.selectedPresent, 12); assert.equal(a.officialCurrentReview.allSelectedHaveCurrentCards, true);
  const inv = json(base + a.inventoryReference), pilot = json(base + 'sony-e-lenses-production-001.json');
  for (const p of a.products) {
    const i = inv.items.find(i => i.manufacturerModelCode === p.manufacturerModelCode);
    assert.equal(i.status, 'released/current'); assert.equal(i.scopeClassification, 'native-optical-lens');
    assert.equal(i.lensType, 'prime'); assert.equal(i.sensorFormatCoverage, '35mm full-frame');
    assert.ok(!pilot.products.some(v => v.manufacturerModelCode === p.manufacturerModelCode));
    assert.equal(p.state, 'canonicalized'); assert.equal(p.officialCurrentConfirmed, true);
  }
});

test('Lens002 atomic result adds eleven and preserves bodies, other lenses and legacy identity/prices', () => {
  assert.equal(before.bodies.length, 165); assert.equal(before.lenses.length, 38);
  assert.equal(after.lenses.length, 49); assert.equal(after.bodies.length + after.lenses.length, 214);
  assert.deepEqual(after.bodies, before.bodies); assert.equal(a.products.filter(p => p.existing).length, 1);
  for (const old of before.lenses) {
    const p = lens(old.id);
    if (old.id !== 'sony-fe-85-f18') assert.deepEqual(p, old);
    else for (const key of ['id','name','brand','mount','type','aliases','price']) assert.deepEqual(p[key], old[key]);
  }
  for (const p of a.products.filter(p => !p.existing)) {
    assert.ok(!before.lenses.some(l => l.id === p.productId));
    assert.equal(lens(p.productId).price.new.value, null); assert.equal(lens(p.productId).price.used.typical, null);
    assert.equal(lens(p.productId).price.new.sourceType, 'unknown');
  }
});

test('Lens002 exactly one explicit model-null-fill binds existing85F18 to verified manufacturer identity', () => {
  assert.equal(a.approval.allowModelNullFill, true); assert.equal(a.approval.allowNewProducts, true);
  const fills = approval.productOperations.filter(o => o.modelNullFill);
  assert.equal(fills.length, 1); assert.equal(fills[0].productId, 'sony-fe-85-f18');
  assert.equal(fills[0].modelNullFill.incomingValue, 'SEL85F18');
  assert.equal(before.lenses.find(l => l.id === 'sony-fe-85-f18').model, undefined);
  for (const [i,id] of ids.entries()) {
    const p = lens(id); assert.equal(p.model, codes[i]); assert.equal(p.identityEvidence.verification, 'verified');
    assert.equal(e.bundle.identityMap.entries.filter(m => m.manufacturerModelCode === codes[i] && m.productId === id).length, 1);
  }
});

test('Lens002 actual prime focal endpoints have explicit mm and never substituted equivalent focal', () => {
  const expected = [16,14,20,24,24,35,50,50,50,85,55,85];
  for (const [i,id] of ids.entries()) {
    assert.deepEqual(lens(id).specs.focal, { min: expected[i], max: expected[i] });
    for (const key of ['min','max']) { const c = claim(id, 'specs.focal.' + key); assert.equal(c.rawUnit, 'mm'); assert.equal(c.unit, 'mm'); }
    assert.equal(lens(id).specs.equivalentFocal, undefined);
  }
});

test('Lens002 maximum apertures repeat at prime endpoints while minimum selectable F is unpromoted', () => {
  const expected = [1.8,1.8,1.8,2.8,1.4,1.4,1.4,1.2,2.5,1.4,1.8,1.8];
  for (const [i,id] of ids.entries()) {
    assert.deepEqual(lens(id).specs.aperture, { wide: expected[i], tele: expected[i] });
    for (const key of ['wide','tele']) { const c = claim(id, 'specs.aperture.' + key); assert.equal(c.rawUnit, null); assert.equal(c.unit, null); assert.ok(c.conditions.unpromotedMinimumSelectableAperture >= 16); }
    assert.equal(lens(id).specs.minimumAperture, undefined);
  }
});

test('Lens002 four malformed1.4k rows cannot silently become numeric claims; explicit alternate evidence owns F1.4', () => {
  for (const code of ['SEL24F14GM','SEL35F14GM','SEL50F14GM','SEL85F14GM2']) {
    const p = a.products.find(p => p.manufacturerModelCode === code);
    for (const key of ['wide','tele']) {
      const c = claim(p.productId, 'specs.aperture.' + key), raw = e.bundle.raws[c.sourceId];
      assert.equal(c.value, 1.4); assert.equal(c.conditions.malformedSpecText, '1.4k');
      assert.equal(c.conditions.malformedTextNotParsed, true); assert.equal(raw.url, p.apertureAlternate.url);
      assert.notEqual(raw.url, p.specUrl); const observation = raw.items[0].observations.find(o => o.path === c.path); assert.match(raw.evidenceExcerpt[observation.evidenceRef].field, /F1.4/);
    }
  }
});

test('Lens002 all twelve share physical Sony E but have independently sourced full-frame coverage', () => {
  for (const id of ids) { assert.equal(lens(id).mount, 'Sony E'); assert.equal(lens(id).specs.formatCoverage, 'full-frame'); assert.equal(claim(id, 'specs.formatCoverage').conditions.coverageNotInferredFromName, true); assert.ok(lens(id).fieldEvidence['specs.formatCoverage']); }
  assert.equal(e.bundle.vocab.mounts.some(m => m.name === 'Sony FE'), false);
});

test('Lens002 explicit no-OSS rows become false, absent55ZA row stays UNKNOWN, body IBIS never inferred', () => {
  for (const p of a.products) {
    const l = lens(p.productId), c = claim(p.productId, 'specs.stabilization');
    assert.equal(l.specs.stabilization, p.manufacturerModelCode === 'SEL55F18Z' ? null : false);
    assert.equal(c.conditions.bodyIbisNotAsserted, true); assert.equal(l.specs.ibis, undefined);
  }
  assert.equal(lens('sony-sonnar-t-fe-55-f18-za').fieldEvidence['specs.stabilization'], undefined);
});

test('Lens002 representative AF distance retains MF alternatives and qualified sensor-plane reference', () => {
  for (const p of a.products) {
    const c = claim(p.productId, 'specs.minFocusM'); assert.equal(c.value, p.minFocusM); assert.equal(c.unit, 'm');
    assert.equal(c.conditions.frontElementWorkingDistanceNotDerived, true); assert.equal(c.conditions.measurementReference, a.measurementReference.url);
    if (p.focusModes) { assert.deepEqual(c.conditions.officialFocusDistancesM, p.focusModes); assert.equal(c.conditions.representativeBasis, 'AF'); assert.match(lens(p.productId).specs.minFocusConditions, /MF/); }
    else assert.match(lens(p.productId).specs.minFocusConditions, /focus mode not separately specified/);
    assert.deepEqual(c.conditions.unpromotedMaximumMagnification, p.maximumMagnification);
  }
  assert.equal(a.measurementReference.numericWorkingDistanceDerived, false);
});

test('Lens002 standalone weight and filter preserve units; dimensions/magnification/design do not extend canonical', () => {
  assert.deepEqual(ids.map(id => lens(id).specs.weight), [304,460,373,162,445,524,516,778,174,642,281,371]);
  assert.deepEqual(ids.map(id => lens(id).specs.filterMm), [67,null,67,49,67,67,67,72,49,77,49,67]);
  for (const p of a.products) {
    const c = claim(p.productId, 'specs.weight'); assert.equal(c.unit, 'g'); assert.equal(c.conditions.lensOnly, true); assert.equal(c.conditions.bodyExcluded, true);
    assert.deepEqual(c.conditions.unpromotedDiameterLengthMm, p.diameterLengthMm);
    for (const key of ['dimensions','maximumMagnification','weatherSealing','coating','weightBasis']) assert.equal(lens(p.productId).specs[key], undefined);
  }
});

test('Lens002 source counts include identity-only plus two targeted features and preserve legacy reference', () => {
  for (const p of a.products) {
    const s = stage(p.productId), count = ['SEL35F14GM','SEL50F14GM'].includes(p.manufacturerModelCode) ? 3 : 2;
    assert.equal(s.sources.length, count); assert.match(formatCanonicalDiff(e.bundle.diff.items.find(d => d.productId === p.productId)), new RegExp('10 fields / ' + count + ' sources'));
    assert.equal(lens(p.productId).sources.length, count + (p.existing ? 1 : 0));
    const identity = lens(p.productId).sources.find(src => src.sourceId === s.identityEvidence.sourceId); assert.ok(identity.fields.includes('identity'));
    for (const src of s.sources) assert.ok(['www.sony.co.kr','electronics.sony.com'].includes(new URL(src.url).hostname));
  }
});

test('Lens002 all118 known spec leaves have verified field evidence; two UNKNOWN leaves do not fabricate evidence', () => {
  let known = 0;
  for (const id of ids) {
    const s = stage(id), p = lens(id); assert.equal(s.claims.length, 10);
    for (const c of s.claims) {
      if (c.value === null) { assert.equal(p.fieldEvidence[c.path], undefined); continue; }
      known++; const f = p.fieldEvidence[c.path]; assert.equal(f.verification, 'verified'); assert.deepEqual(f.claimIds, [c.claimId]);
      assert.deepEqual(getAtPath(p, c.path), c.value); assert.ok(p.sources.some(src => src.sourceId === c.sourceId && src.fields.includes(c.path)));
      assert.ok(e.bundle.raws[c.sourceId].items[0].observations.some(o => o.path === c.path));
    }
  }
  assert.equal(known, 118); assert.equal(a.productionStatistics.unknownSpecClaims, 2);
});

test('Lens00226 raw-helper source captures contain actual UTC ISO timestamps and matching source/content digests', () => {
  assert.equal(Object.keys(e.bundle.raws).length, 26);
  for (const [id,raw] of Object.entries(e.bundle.raws)) {
    assert.equal(createSourceId(raw), id); assert.equal(raw.contentDigest, digestValue(raw.evidenceExcerpt)); assert.equal(raw.sourceType, 'manufacturer');
    assert.equal(new Date(raw.accessedAt).toISOString(), raw.accessedAt);
    assert.ok(raw.accessedAt >= a.rawHelperTimestampWindow.start && raw.accessedAt <= a.rawHelperTimestampWindow.end);
  }
});

test('Lens002 independent worker tasks record first-attempt usage, review decisions and deleted public fixtures', () => {
  assert.equal(a.workerTasks.length, 12); assert.equal(new Set(a.workerTasks.map(w => w.taskId)).size, 12);
  assert.deepEqual(a.workerTotals, { inputTokens:10071, outputTokens:5960, totalTokens:16031 });
  assert.deepEqual(a.workerStats, { actualApiAttempts:12, retries:0, failures:0 });
  assert.deepEqual(a.workerTasks.map(w => w.usage.totalTokens), [1210,1274,1174,1316,1364,1597,1373,1297,1455,1244,1354,1373]);
  for (const p of a.products) { const w = a.workerTasks.find(w => w.taskId === p.workerTaskId); assert.equal(w.attempts.length, 1); assert.equal(w.reviewed, true); assert.equal(w.patchApplied, false); assert.ok(w.adopted.length && w.discarded.length); assert.equal(existsSync(new URL('.cheap-worker-sony-lens002-' + p.manufacturerModelCode.toLowerCase() + '.txt', root)), false); }
  assert.equal(a.humanIntervention.extraUserProductDecisions, 0); assert.equal(a.workerFixturesDeleted, true);
});

test('Lens002 twelve-item sealed atomic transaction exactly replays before/after and repeated after state', () => {
  assert.equal(manifest.items.length, 12); assert.ok(manifest.items.every(i => i.state === 'canonicalized'));
  assert.equal(json(tx + 'journal.json').phase, 'canonicalized'); assert.equal(sha(tx + 'before.json'), manifest.canonicalBaselineDigest); assert.equal(sha(tx + 'after.json'), manifest.expectedCanonicalDigest);
  assert.deepEqual(e.approval, approval); assert.deepEqual(json(base + 'approvals/' + batch + '/' + approval.approvalId + '.json'), approval);
  for (const [file,digest] of Object.entries(e.bundle.artifactDigests)) {
    if (file === 'identity-map.json' || file === 'vocab.json') {
      const archived = file === 'identity-map.json' ? e.bundle.identityMap : e.bundle.vocab, current = json(base + file);
      assert.equal(createHash('sha256').update(jsonBytes(archived)).digest('hex'), digest);
      for (const [key,value] of Object.entries(archived)) assert.deepEqual(Array.isArray(value) ? current[key].slice(0,value.length) : current[key], value);
    } else assert.equal(sha(base + file), digest);
  }
  for (const item of manifest.items) { assert.equal(item.stagingDigest, digestValue(stage(item.productId))); assert.deepEqual(item.rawDigests, item.sourceIds.map(id => digestValue(e.bundle.raws[id]))); }
  verifyIncoming(e.bundle, before); const replay = proposedCanonical(before, e.bundle, approval.decisions, approval.productOperations);
  assert.deepEqual(replay.canonical, after); assert.equal(replay.digest, manifest.expectedCanonicalDigest);
  assert.deepEqual(proposedCanonical(after, e.bundle, approval.decisions, approval.productOperations).canonical, after);
  assert.equal(a.checkpoint.reapply.status, 'already-canonicalized'); assert.equal(a.checkpoint.reapply.canonicalMatches, true);
});

test('Lens002 reviewed diff distinguishes110 new paths, eight new-evidence paths and two spec null-fills', () => {
  const categories = e.bundle.diff.items.flatMap(d => d.changes).reduce((s,c) => (s[c.category]=(s[c.category]??0)+1,s), {});
  assert.deepEqual(categories, { 'new-product':110, 'same-value/new-evidence':8, 'null-fill':2 });
  assert.equal(approval.decisions.filter(d => d.action === 'accept').length, 118); const ignored = approval.decisions.filter(d => d.action === 'ignore'); assert.equal(ignored.length, 2); assert.ok(ignored.every(d => claim(d.productId, d.path).value === null)); assert.equal(a.approval.allowValueConflicts, false);
});

test('Lens002 strict validation still rejects unit/type errors, genuine source conflicts and locked identity changes', () => {
  assert.equal(validateStagingBatch(e.bundle.stagings, ctx).valid, true);
  for (const [field,value,code] of [['specs.aperture.wide','F1.8','INVALID_LENS_SPEC'],['specs.stabilization','OSS','INVALID_LENS_SPEC']]) {
    const s = structuredClone(stage(ids[0])); s.claims.find(c => c.path === field).value = value;
    assert.ok(validateStagingBatch([s], ctx).items[0].errors.some(e => e.code === code));
  }
  for (const [unit,code] of [[null,'UNIT_REQUIRED'],['ft','UNSUPPORTED_UNIT']]) {
    const s = structuredClone(stage(ids[0])); s.claims.find(c => c.path === 'specs.focal.min').rawUnit = unit;
    assert.ok(validateStagingBatch([s], ctx).items[0].errors.some(e => e.code === code));
  }
  const s = structuredClone(stage(ids[0])), c = structuredClone(claim(ids[0], 'specs.focal.min')); c.value = 17; c.rawValue = 17; c.claimId = createClaimId(c); s.claims.push(c);
  assert.ok(validateStagingBatch([s], ctx).items[0].errors.some(e => e.code === 'CONFLICTING_CLAIM_VALUES'));
  const locked = structuredClone(stage('sony-fe-85-f18')); locked.product.model = 'DIFFERENT';
  assert.ok(validateStagingBatch([locked], { ...ctx, canonical:after }).items[0].errors.some(e => e.code === 'MODEL_IDENTITY_CONFLICT'));
  locked.product.model = 'SEL85F18'; locked.product.aliases = [lens(ids[0]).name];
  assert.ok(validateStagingBatch([locked], { ...ctx, canonical:after }).items[0].errors.some(e => e.code === 'ALIAS_COLLISION'));
});

test('Lens002 coverage plan accounts for all67 identities by actual completed artifacts, not canonical presence', () => {
  const pilot = json(base + 'sony-e-lenses-production-001.json'), completed = [...pilot.products,...a.products].map(p => p.manufacturerModelCode), remaining = a.futurePlan.batches.flatMap(b => b.modelCodes);
  assert.equal(completed.length, 17); assert.equal(new Set(completed).size, 17); assert.equal(remaining.length, 50); assert.equal(new Set(remaining).size, 50);
  const inv = json(base + a.inventoryReference); assert.deepEqual([...completed,...remaining].sort(), inv.items.filter(i => i.status === 'released/current' && i.scopeClassification === 'native-optical-lens').map(i => i.manufacturerModelCode).sort());
  assert.deepEqual(a.futurePlan.familyRemaining, { 'FE primes':8, 'APS-C':9, 'FE wide/standard/telephoto zooms':24, 'Special-family review':9 });
  assert.equal(a.countsAfter.currentSonyLensesProductionCompleted, 17); assert.equal(a.futurePlan.batches.length, 5); assert.ok(a.futurePlan.batches.every(b => b.count === b.modelCodes.length && b.count <= 12));
});

test('Lens002 current canonical remains valid with exactly one instance of every reviewed manufacturer model', () => {
  const live = json('src/data/cameraProducts.json'); assert.equal(validateCanonical(live, json(base + 'vocab.json')), true);
  for (const [i,id] of ids.entries()) { assert.equal(live.lenses.filter(l => l.id === id).length, 1); assert.equal(live.lenses.filter(l => l.model === codes[i]).length, 1); }
});
