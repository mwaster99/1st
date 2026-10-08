import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { proposedCanonical, validateCanonical, validateSpecValue, verifyIncoming } from '../scripts/objective/merge.mjs';
import { createSourceId, digestValue, getAtPath, normalizeSearch, validateStagingBatch } from '../scripts/objective/rules.mjs';
import { jsonBytes } from '../scripts/objective/storage.mjs';
import { BODY_BY_ID, CAMERA_LENSES, LENS_BY_ID, getIntegratedLens } from '../src/cameraData.js';
import { evaluateScenario, generateScenarioCandidates } from '../src/cameraScenarioEngine.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = 'src/data/ingestion/';
const read = (name) => readFileSync(path.join(root, name));
const json = (name) => JSON.parse(read(name));
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const sha = (name) => hash(read(name));
const audit = json(`${base}panasonic-coverage-audit-2026-10-08.json`);
const checkpoint = json(`${base}transactions/production-panasonic-bodies-006/after.json`);
const current = json('src/data/cameraProducts.json');
const body = (id) => checkpoint.bodies.find((entry) => entry.id === id);
const product = (id) => audit.products.find((entry) => entry.productId === id);
const stage = (id) => json(`${base}staging/${product(id).productionBatch}/${id}.json`);
const claim = (id, field) => stage(id).claims.find((entry) => entry.path === field);
const context = (id) => {
  const tx = `${base}transactions/${product(id).productionBatch}/`;
  const evidence = json(`${tx}evidence.json`);
  return { canonical: json(`${tx}before.json`), vocab: evidence.bundle.vocab, rawDocuments: new Map(Object.entries(evidence.bundle.raws)) };
};
const covers = (field, scope) => field === scope || field.startsWith(`${scope}.`);
const leaves = (value, field = 'specs') => value == null ? [] : typeof value !== 'object' || Array.isArray(value)
  ? [field] : Object.entries(value).flatMap(([key, child]) => leaves(child, `${field}.${key}`));

test('Panasonic fresh paginated galleries explain 49 cards as 39 released bases and ten linked variants', () => {
  const old = json(`${base}${audit.previousSnapshot}`), cards = audit.cards;
  assert.deepEqual(cards.map((card) => card.cardKey), old.cards.map((card) => card.cardKey));
  assert.equal(cards.length, 49);
  assert.equal(new Set(cards.map((card) => card.cardKey)).size, 49);
  assert.equal(new Set(cards.map((card) => card.productUrl)).size, 49);
  assert.equal(cards.filter((card) => !card.variantRelation).length, 39);
  assert.equal(cards.filter((card) => card.variantRelation).length, 10);
  assert.deepEqual(audit.counts, {
    directOperatedOfficialCards: 49, baseIdentities: 39, linkedVariants: 10,
    releasedCurrentBaseIdentities: 39, canonicalized: 39, productionProvenanceComplete: 39,
    unprocessedReleasedCurrent: 0, duplicateAmbiguous: 0, ptzSpecialCandidates: 10, studioSpecialCandidates: 5,
  });
  for (const card of cards) {
    assert.equal(card.availabilityStatus, 'released-current');
    assert.equal(card.officialRecheck.status, 200);
    assert.equal(card.officialRecheck.productHeadingVerified, true);
    assert.equal(card.officialRecheck.announcedUpcomingMarkerObserved, false);
    assert.ok(card.releaseEvidence.length >= 2);
    assert.ok(current.bodies.some((entry) => entry.id === card.canonicalId));
    if (card.variantRelation) {
      const linked = cards.find((entry) => entry.cardKey === card.variantRelation.baseCardKey);
      assert.ok(linked && !linked.variantRelation);
      assert.equal(card.canonicalId, linked.canonicalId);
      assert.equal(card.manufacturerModelCode, linked.manufacturerModelCode);
      assert.equal(card.coverageViaBaseBatch, linked.productionBatch);
      assert.equal(card.productionBatch, null);
      assert.equal(card.status, 'canonical-base-linked-variant');
    } else assert.equal(card.status, 'canonicalized');
  }
  assert.deepEqual(audit.galleryAudit.slice(0, 6).map((gallery) => gallery.totalCards), [13, 20, 5, 3, 3, 5]);
  for (const gallery of audit.galleryAudit) {
    assert.equal(gallery.emptyTerminalPage, true);
    assert.equal(gallery.verifiedPages.length, gallery.totalPages + 1);
    const observed = gallery.verifiedPages.flatMap((page) => page.observedCards);
    assert.equal(observed.length, gallery.totalCards);
    for (const page of gallery.verifiedPages) {
      assert.deepEqual(page.observedCards.map((card) => card.cardKey), page.cardKeys);
      assert.ok(audit.officialFetches.some((fetch) => fetch.key === page.requestKey && fetch.method === 'POST'));
    }
  }
  assert.equal(audit.officialFetches.length, 107);
  for (const fetch of audit.officialFetches) {
    assert.equal(fetch.status, 200);
    assert.match(new URL(fetch.url).hostname, /(^|\.)panasonic\.(co\.kr|net)$/);
    assert.equal(new Date(fetch.accessedAt).toISOString(), fetch.accessedAt);
    assert.match(fetch.sha256, /^[a-f0-9]{64}$/);
  }
  for (const key of ['added', 'removed', 'availabilityChanged', 'variantChanged', 'titleChanged']) assert.deepEqual(audit.changes[key], []);
});

test('Panasonic model codes and aliases do not merge generations, kits, regional identities or historic DMC-L10', () => {
  const map = json(`${base}identity-map.json`).entries.filter((entry) => entry.manufacturer === 'Panasonic' && entry.productType === 'body');
  const owners = new Map();
  for (const entry of current.bodies.filter((entry) => entry.brand === 'Panasonic')) {
    for (const name of [entry.name, entry.model, ...entry.aliases]) {
      const key = normalizeSearch(name);
      assert.ok(!owners.has(key) || owners.get(key) === entry.id, name);
      owners.set(key, entry.id);
    }
  }
  assert.equal(new Set(audit.products.map((entry) => entry.productId)).size, 39);
  for (const card of audit.cards) {
    const matches = map.filter((entry) => entry.manufacturerModelCode === card.manufacturerModelCode);
    assert.equal(matches.length, 1);
    assert.equal(matches[0].productId, card.canonicalId);
    assert.equal(stage(card.canonicalId).manufacturerModelCode, card.manufacturerModelCode);
  }
  assert.ok(!body('panasonic-l10').aliases.includes('DMC-L10'));
  assert.equal(body('panasonic-l10').kind, 'fixed');
  assert.equal(validateCanonical(current, json(`${base}vocab.json`)), true);
});

test('Every Panasonic known objective leaf has matching verified field and source claims, with four honest identity metadata gaps', () => {
  let known = 0, paths = 0, identities = 0, claims = 0;
  for (const entry of audit.products) {
    const b = body(entry.productId), staged = stage(b.id);
    assert.ok(b.sources.some((source) => source.type === 'manufacturer'));
    assert.ok(staged.sources.length >= 2);
    paths += Object.keys(b.fieldEvidence).length;
    claims += staged.claims.length;
    if (b.identityEvidence) {
      identities++;
      assert.equal(b.identityEvidence.verification, 'verified');
      assert.ok(staged.sources.some((source) => source.sourceId === b.identityEvidence.sourceId));
    } else assert.ok(audit.findings.shouldFix.some((finding) => finding.productId === b.id && finding.path === 'identityEvidence'));
    for (const field of leaves(b.specs)) {
      known++;
      assert.ok(Object.entries(b.fieldEvidence).some(([scope, evidence]) => covers(field, scope) && evidence.verification === 'verified'), `${b.id}/${field}`);
    }
    for (const [field, evidence] of Object.entries(b.fieldEvidence)) {
      assert.equal(evidence.verification, 'verified');
      for (const id of evidence.claimIds) {
        const c = staged.claims.find((entry) => entry.claimId === id);
        assert.ok(c, `${b.id}/${field}`);
        assert.equal(c.path, field);
        assert.equal(c.verification, 'verified');
        assert.deepEqual(getAtPath(b, field), c.value);
        assert.ok(b.sources.some((source) => source.sourceId === c.sourceId && source.fields.some((scope) => covers(field, scope))));
      }
    }
  }
  assert.deepEqual([known, paths, identities, claims], [803, 692, 35, 838]);
  assert.deepEqual(audit.provenanceSummary, {
    knownObjectiveLeaves: 803, verifiedKnownLeaves: 803, manufacturerReferenceOnly: 0,
    legacyOnly: 0, unclassifiedKnownLeaves: 0, verifiedFieldEvidencePaths: 692,
    structuredIdentityEvidence: 35, productionClaims: 838, rawSources: 111,
  });
});

test('All six Panasonic sealed transactions reproduce strict validation, digests, approvals and idempotent canonical results', () => {
  let previous = json(`${base}batches/production-fujifilm-bodies-003.json`).expectedCanonicalDigest;
  const seen = new Set();
  let sources = 0;
  for (const record of audit.artifactChecks) {
    const batch = record.batchId, tx = `${base}transactions/${batch}/`;
    const m = json(`${base}batches/${batch}.json`), a = json(`${base}approvals/${batch}.json`);
    const e = json(`${tx}evidence.json`), j = json(`${tx}journal.json`);
    const before = json(`${tx}before.json`), after = json(`${tx}after.json`), diff = json(`${base}diffs/${batch}.json`);
    assert.equal(m.lastSuccessfulGate, 'apply');
    assert.equal(m.apply.state, 'canonicalized');
    assert.equal(j.phase, 'canonicalized');
    for (const digest of [m.canonicalBaselineDigest, a.baselineCanonicalDigest, j.baselineCanonicalDigest, sha(`${tx}before.json`)]) assert.equal(digest, previous);
    for (const digest of [a.expectedCanonicalDigest, j.expectedCanonicalDigest, sha(`${tx}after.json`), record.expectedCanonicalDigest]) assert.equal(digest, m.expectedCanonicalDigest);
    assert.equal(m.apply.approvalId, a.approvalId);
    assert.equal(j.approvalId, a.approvalId);
    assert.deepEqual(json(`${base}approvals/${batch}/${a.approvalId}.json`), a);
    assert.deepEqual(e.approval, a);
    assert.deepEqual(e.bundle.diff, diff);
    assert.equal(j.evidenceDigest, digestValue(e));
    assert.equal(a.diffDigest, digestValue(diff));
    assert.equal(a.diffFileDigest, sha(`${base}diffs/${batch}.json`));
    assert.deepEqual(e.bundle.artifactDigests, a.incomingArtifactDigests);
    assert.equal(a.incomingDigest, digestValue(a.incomingArtifactDigests));
    for (const [file, digest] of Object.entries(a.incomingArtifactDigests)) {
      if (file === 'vocab.json') {
        // Journal/evidence bind the historical registry. Current mount/style vocab may grow.
        const v = json(`${base}${file}`);
        for (const [key, value] of Object.entries(e.bundle.vocab)) assert.deepEqual(['brands', 'mounts', 'bodyStyles'].includes(key) ? v[key].slice(0, value.length) : v[key], value);
      } else assert.equal(file === 'identity-map.json' ? hash(jsonBytes(e.bundle.identityMap)) : sha(`${base}${file}`), digest);
    }
    for (const item of m.items) {
      assert.equal(item.state, 'canonicalized');
      assert.ok(!seen.has(item.productId));
      seen.add(item.productId);
      const st = json(`${base}staging/${batch}/${item.itemKey}.json`);
      assert.equal(item.stagingDigest, digestValue(st));
      assert.equal(item.diffDigest, digestValue(diff));
      assert.ok(e.bundle.stagings.some((entry) => digestValue(entry) === item.stagingDigest));
      assert.equal(item.rawDigests.length, item.sourceIds.length);
      for (const [index, id] of item.sourceIds.entries()) {
        sources++;
        const raw = json(`${base}raw/${id}.json`);
        assert.equal(createSourceId(raw), id);
        assert.equal(item.rawDigests[index], digestValue(raw));
        assert.equal(raw.contentDigest, digestValue(raw.evidenceExcerpt));
        assert.deepEqual(e.bundle.raws[id], raw);
        assert.equal(new Date(raw.accessedAt).toISOString(), raw.accessedAt);
      }
    }
    verifyIncoming(e.bundle, before);
    assert.equal(validateStagingBatch(e.bundle.stagings, { canonical: before, vocab: e.bundle.vocab, rawDocuments: new Map(Object.entries(e.bundle.raws)) }).valid, true);
    const replay = proposedCanonical(before, e.bundle, a.decisions, a.productOperations);
    assert.equal(replay.digest, m.expectedCanonicalDigest);
    assert.deepEqual(replay.canonical, after);
    assert.deepEqual(proposedCanonical(after, e.bundle, a.decisions, a.productOperations).canonical, after);
    assert.equal(validateCanonical(after, e.bundle.vocab), true);
    assert.equal(record.digestMismatches, 0);
    assert.equal(record.missingArtifacts, 0);
    previous = m.expectedCanonicalDigest;
  }
  assert.equal(sources, 111);
  assert.deepEqual(seen, new Set(audit.products.map((entry) => entry.productId)));
  assert.equal(previous, audit.canonicalDigest);
});

test('Fifteen fixed cameras keep actual/equivalent strict mm claims and one whole-camera weight without lens assets', () => {
  const fixed = audit.products.filter((entry) => entry.kind === 'fixed');
  assert.equal(fixed.length, 15);
  const args = { currentBody: BODY_BY_ID['sony-a7-iv'], currentLenses: [LENS_BY_ID['sony-fe-24-70-gm2']], primaryLens: LENS_BY_ID['sony-fe-24-70-gm2'], pains: ['더 가볍고 작은 카메라를 원해요'], subjects: ['여행 · 일상'], extraBudget: 300 };
  const candidates = generateScenarioCandidates(args);
  for (const entry of fixed) {
    const id = entry.productId, b = body(id), staged = stage(id);
    assert.equal(b.mount, null);
    assert.ok(b.specs.fixedLens);
    assert.equal(b.specs.ibis, null);
    const diff = json(`${base}diffs/${entry.productionBatch}.json`).items.find((item) => item.productId === id);
    for (const range of ['focal', 'equivalentFocal']) for (const end of ['min', 'max']) {
      const field = `specs.fixedLens.${range}.${end}`, c = staged.claims.find((entry) => entry.path === field);
      assert.ok(c, `${id}/${field}`);
      assert.equal(c.rawUnit, 'mm');
      assert.equal(c.unit, 'mm');
      assert.equal(c.value, getAtPath(b, field));
      assert.equal(diff.changes.find((change) => change.claimId === c.claimId).unit, 'mm');
    }
    const lens = getIntegratedLens(BODY_BY_ID[id]);
    assert.equal(lens.includedInBodyId, id);
    assert.equal(lens.weight, null);
    assert.equal(lens.newPrice, null);
    assert.equal(lens.usedPrice, null);
    assert.ok(!CAMERA_LENSES.some((entry) => entry.id === lens.id || entry.id.startsWith(id)));
    const scenario = candidates.find((entry) => entry.targetSystem.body.id === id);
    assert.ok(scenario, id);
    assert.equal(evaluateScenario(scenario, args).weight.after, BODY_BY_ID[id].weight);
  }
});

test('LUMIX S/G mounts and body BIS remain separate from combined, optical and digital correction', () => {
  for (const entry of audit.products.filter((entry) => ['LumixS', 'LumixG'].includes(entry.category))) {
    const b = body(entry.productId);
    assert.equal(b.kind, 'interchangeable');
    assert.equal(b.mount, entry.category === 'LumixS' ? 'L-Mount' : 'Micro Four Thirds');
    validateSpecValue(b.specs.ibis, 'specs.ibis');
  }
  for (const id of ['panasonic-s9', 'panasonic-s5-ii', 'panasonic-s5-iix']) assert.equal(body(id).specs.ibis.stops, 5);
  assert.equal(body('panasonic-g9-ii').specs.ibis.stops, 8);
  assert.equal(body('panasonic-gh5s').specs.ibis.present, false);
  for (const id of ['panasonic-g100', 'panasonic-g100d', 'panasonic-gf10']) assert.equal(body(id).specs.ibis, null);
});

test('Eleven camcorders preserve scoped weight and media configurations; AJ-CX4000 is a real interchangeable B4 body', () => {
  const camcorders = audit.products.filter((entry) => entry.bodyStyle === 'camcorder');
  assert.equal(camcorders.length, 11);
  assert.equal(camcorders.filter((entry) => entry.kind === 'fixed').length, 10);
  for (const entry of camcorders) {
    const b = body(entry.productId);
    assert.equal(b.bodyStyle, 'camcorder');
    assert.equal(b.specs.ibis, null);
    assert.equal(b.specs.sensor.sizeMm, null);
    for (const c of stage(b.id).claims.filter((entry) => entry.value != null && /specs\.(weight|bodyOnlyWeight)$/.test(entry.path))) {
      assert.equal(c.conditions.weightBasis, c.path.endsWith('bodyOnlyWeight') ? 'body-only' : b.specs.weightBasis);
      assert.ok(c.conditions.configuration || c.conditions.includes);
    }
  }
  const aj = body('panasonic-cx4000');
  assert.equal(aj.kind, 'interchangeable');
  assert.equal(aj.mount, 'B4');
  assert.equal(aj.specs.fixedLens, null);
  assert.equal(getIntegratedLens(BODY_BY_ID[aj.id]), null);
  assert.deepEqual(json(`${base}vocab.json`).mounts.find((entry) => entry.name === 'B4').aliases, ['B4 lens mount', '2/3-type bayonet']);
  assert.ok(!CAMERA_LENSES.some((lens) => lens.mount === 'B4'));
  assert.equal(aj.specs.bodyOnlyWeight, 3400);
  assert.equal(aj.specs.weight, null);
  assert.equal(aj.specs.cardSlots.count, 3);
  assert.deepEqual(aj.specs.cardSlots.slots.map((slot) => slot.media), [['expressP2'], ['microP2', 'SDXC'], ['microP2', 'SDXC']]);
  assert.deepEqual(['panasonic-x20', 'panasonic-x2'].map((id) => [body(id).specs.bodyOnlyWeight, body(id).specs.weight]), [[2000, 2430], [2040, 2490]]);
});

test('Regional sensor and LX100II operating-weight conflicts remain unknown with both official reports preserved', () => {
  for (const id of ['panasonic-s1-ii', 'panasonic-s1-iie']) {
    assert.equal(body(id).specs.sensor.sizeMm, null);
    const reports = stage(id).claims.filter((entry) => entry.path === 'specs.sensor.sizeMm');
    assert.equal(new Set(reports.map((entry) => entry.sourceId)).size, 2);
    assert.deepEqual(new Set(reports.map((entry) => entry.conditions.reportedHereMm.join('x'))), new Set(['35.6x23.8', '35.8x23.8']));
  }
  for (const id of ['panasonic-x2', 'panasonic-x20']) {
    assert.equal(body(id).specs.sensor.format, null);
    assert.equal(body(id).specs.sensor.megapixels, 15.03);
    assert.ok(claim(id, 'specs.sensor.format').conditions.reportedClaims.length >= 2);
  }
  assert.equal(body('panasonic-lx100-ii').specs.weight, null);
  assert.equal(body('panasonic-lx100-ii').specs.weightBasis, null);
  assert.equal(body('panasonic-lx100-ii').specs.bodyOnlyWeight, 350);
  const weights = stage('panasonic-lx100-ii').claims.filter((entry) => entry.path === 'specs.weight');
  assert.ok(weights.length >= 2);
  assert.ok(weights.every((entry) => entry.value === null));
  assert.equal(body('panasonic-cx4000').specs.sensor.format, null);
  assert.equal(body('panasonic-cx4000').specs.sensor.megapixels, null);
});

test('Exact video rates, crop boolean and LCD contracts stay traceable through strict gates and source conditions', () => {
  for (const entry of audit.products) {
    const b = body(entry.productId);
    const video = claim(b.id, 'specs.video.max');
    assert.equal(video.value, b.specs.video.max);
    if (!Number.isFinite(video.conditions.frameRate)) {
      const label = video.conditions.frameRateLabel ?? video.conditions.manufacturerFrameRateLabel;
      assert.ok(label && video.value.includes(label), b.id);
      assert.ok(!video.value.includes('29.97') && !video.value.includes('59.94') && !video.value.includes('23.98'), b.id);
    }
    validateSpecValue(b.specs.video.cropAtMax, 'specs.video.cropAtMax');
    validateSpecValue(b.specs.lcd, 'specs.lcd');
    assert.ok([true, false, null].includes(b.specs.video.cropAtMax));
    if (video.value.includes('29.97')) assert.equal(video.conditions.frameRate, 29.97);
  }
  assert.equal(claim('panasonic-vx3', 'specs.video.max').conditions.actualFractionalFrameRate, null);
  assert.equal(body('panasonic-cx370').specs.video.cropAtMax, false);
  assert.equal(claim('panasonic-l10', 'specs.lcd.mechanism').conditions.manufacturerMechanism, 'free-angle');
  assert.equal(body('panasonic-l10').specs.lcd.mechanism, 'vari-angle');
  for (const [field, value, code] of [['specs.video.cropAtMax', 1, 'INVALID_CROP_AT_MAX'], ['specs.lcd', { mechanism: 'free-angle' }, 'INVALID_LCD']]) {
    const bad = structuredClone(stage('panasonic-cx370'));
    bad.claims.find((entry) => entry.path === field).value = value;
    assert.ok(validateStagingBatch([bad], context('panasonic-cx370')).items[0].errors.some((error) => error.code === code));
    assert.throws(() => validateSpecValue(value, field));
  }
});

test('Ten PTZ and five studio candidates retain per-model reasons and standalone exceptions outside the direct denominator', () => {
  const families = json(`${base}catalog-scope.json`).entries.filter((entry) => entry.brand === 'Panasonic');
  assert.equal(families.length, 2);
  for (const entry of audit.specialFamilies) {
    assert.equal(entry.scopeStatus, 'deferred-special-category');
    assert.equal(entry.outsideDirectOperatedDenominator, true);
    assert.equal(entry.permanentExclusion, false);
    assert.ok(entry.reason.length > 50 && entry.reconsideration.length > 50);
    assert.ok(entry.officialSources.length >= 2);
    assert.ok(!audit.cards.some((card) => card.cardKey === entry.cardKey));
    const family = families.find((family) => family.modelReviews.some((model) => model.cardKey === entry.cardKey));
    assert.ok(family);
    assert.equal(family.scopeStatus, 'deferred-special-category');
    assert.equal(family.modelReviews.find((model) => model.cardKey === entry.cardKey).standaloneOperation, entry.standaloneOperation);
  }
  assert.equal(audit.specialFamilies.filter((entry) => entry.family === 'PTZ').length, 10);
  assert.equal(audit.specialFamilies.filter((entry) => entry.family === 'studio').length, 5);
  for (const key of ['AKUCX100', 'AKPLV100GSJ', 'AKHC3900']) assert.match(audit.specialFamilies.find((entry) => entry.cardKey === key).standaloneOperation, /without a CCU|without CCU|CCU-less/);
  assert.match(audit.specialFamilies.find((entry) => entry.cardKey === 'AKUBX100').standaloneOperation, /not be presumed/);
  assert.match(audit.specialFamilies.find((entry) => entry.cardKey === 'AKUC4000').standaloneOperation, /HD-SDI/);
  assert.equal(product('panasonic-cx4000').scopeStatus, 'in-scope');
});

test('Panasonic findings distinguish metadata enrichment and scoped UNKNOWNs from product coverage blockers', () => {
  assert.deepEqual([audit.findings.critical.length, audit.findings.shouldFix.length, audit.findings.acceptableUnknown.length], [0, 18, 134]);
  for (const group of [audit.findings.shouldFix, audit.findings.acceptableUnknown]) {
    assert.equal(new Set(group.map((finding) => `${finding.productId}:${finding.path}`)).size, group.length);
    for (const finding of group) {
      assert.ok(product(finding.productId));
      assert.ok(getAtPath(body(finding.productId), finding.path) == null);
      assert.ok(finding.reason);
    }
  }
  assert.equal(audit.findings.shouldFix.filter((finding) => finding.path === 'identityEvidence').length, 4);
  assert.equal(audit.findings.shouldFix.filter((finding) => finding.path === 'specs.cardSlots').length, 14);
  assert.equal(audit.conclusion.firstCoverageComplete, true);
  assert.ok(!audit.products.some((entry) => entry.productId === 'panasonic-gx85'));
  assert.ok(audit.knownBacklog.some((entry) => entry.classification === 'cross-brand-recommendation-engine'));
});
