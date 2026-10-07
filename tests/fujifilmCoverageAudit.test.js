import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { proposedCanonical, validateCanonical, verifyIncoming } from '../scripts/objective/merge.mjs';
import { createSourceId, digestValue, getAtPath, normalizeSearch, validateStagingBatch } from '../scripts/objective/rules.mjs';
import { jsonBytes } from '../scripts/objective/storage.mjs';
import { BODY_BY_ID, CAMERA_LENSES, getIntegratedLens } from '../src/cameraData.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = 'src/data/ingestion/';
const read = (name) => readFileSync(path.join(root, name));
const json = (name) => JSON.parse(read(name));
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const sha = (name) => hash(read(name));
const snapshot = () => json(`${base}fujifilm-current-camera-gallery-2026-10-02.json`);
const audit = () => json(`${base}fujifilm-coverage-audit-2026-10-06.json`);
const cards = () => snapshot().cards.filter((card) => card.productionBatch);
const stage = (card) => json(`${base}staging/${card.productionBatch}/${card.canonicalId}.json`);
const covers = (field, scope) => field === scope || field.startsWith(`${scope}.`);
const knownLeaves = (value, field = 'specs') => value == null ? []
  : typeof value !== 'object' || Array.isArray(value) ? [field]
    : Object.entries(value).flatMap(([key, child]) => knownLeaves(child, `${field}.${key}`));

test('Fuji audit accounts for every official card once without trusting the inconsistent gallery total', () => {
  const a = audit(), s = snapshot(), canonical = json('src/data/cameraProducts.json');
  assert.equal(a.officialGallery.displayedTotal, 18);
  assert.equal(a.cards.length, 17);
  assert.equal(new Set(a.cards.map((card) => card.productUrl)).size, 17);
  assert.deepEqual(a.cards.map((card) => card.productUrl), s.cards.map((card) => card.productUrl));
  assert.deepEqual(a.changes, { added: [], removed: [], availabilityChanged: [], variantChanged: [] });
  const bases = a.cards.filter((card) => card.productionBatch);
  const variants = a.cards.filter((card) => card.variantKey);
  const deferred = a.cards.filter((card) => card.scopeStatus === 'deferred-special-category');
  assert.deepEqual(a.counts, {
    officialCards: a.cards.length, modelIdentities: new Set(a.cards.map((card) => card.identityGroup)).size,
    releasedCurrentBaseModels: bases.length, productionProvenanceComplete: bases.length,
    linkedVariants: variants.length, deferredXGfx: deferred.length, unprocessed: 0, duplicateAmbiguous: 0,
  });
  assert.equal(bases.length, 14);
  assert.equal(variants.length, 2);
  assert.equal(deferred.length, 1);
  assert.equal(bases.length + variants.length + deferred.length, a.cards.length);
  for (const card of bases) {
    assert.equal(card.availabilityStatus, 'released-current');
    assert.equal(card.status, 'canonicalized');
    assert.ok(canonical.bodies.some((body) => body.id === card.canonicalId));
  }
  for (const card of variants) {
    const model = bases.find((entry) => entry.identityGroup === card.identityGroup);
    assert.equal(card.status, 'canonical-base-linked-variant');
    assert.equal(card.canonicalId, model.canonicalId);
    assert.equal(card.coverageViaBaseBatch, model.productionBatch);
    assert.equal(card.productionBatch, null);
  }
  assert.equal(deferred[0].canonicalId, null);
  assert.equal(deferred[0].identityGroup, 'GFX100 II IR');
  assert.equal(a.officialFetches.length, 19);
  for (const source of a.officialFetches) {
    assert.equal(new Date(source.accessedAt).toISOString(), source.accessedAt);
    assert.match(source.htmlSha256, /^[a-f0-9]{64}$/);
  }
});

test('Fuji reviewed identities and aliases remain unique across generations, editions and restricted IR', () => {
  const canonical = json('src/data/cameraProducts.json');
  const map = json(`${base}identity-map.json`).entries.filter((entry) => entry.manufacturer === 'Fujifilm' && entry.productType === 'body');
  assert.equal(new Set(map.map((entry) => entry.productId)).size, map.length);
  assert.equal(new Set(map.map((entry) => normalizeSearch(entry.manufacturerModelCode))).size, map.length);
  const owners = new Map();
  for (const body of canonical.bodies.filter((entry) => entry.brand === 'Fujifilm')) {
    for (const name of [body.name, body.model, ...body.aliases]) {
      const key = normalizeSearch(name);
      assert.ok(!owners.has(key) || owners.get(key) === body.id, name);
      owners.set(key, body.id);
      assert.ok(!/fragment|limited|\bir\b/i.test(name), name);
    }
  }
  for (const card of cards()) {
    const body = canonical.bodies.find((entry) => entry.id === card.canonicalId);
    const mapped = map.find((entry) => entry.productId === body.id);
    const staged = stage(card);
    assert.equal(mapped.manufacturerModelCode, staged.manufacturerModelCode);
    assert.equal(normalizeSearch(mapped.manufacturerModelCode), normalizeSearch(card.modelCode));
    assert.ok(staged.sources.some((source) => source.url === card.productUrl));
  }
  assert.equal(new Set(cards().map((card) => card.canonicalId)).size, 14);
  assert.equal(map.length, 14);
  assert.ok(!map.some((entry) => /IR|FRAGMENT|Limited/.test(entry.manufacturerModelCode)));
  assert.equal(validateCanonical(canonical, json(`${base}vocab.json`)), true);
});

test('All 14 Fuji products have traceable production field evidence and honestly classified identity/label gaps', () => {
  const canonical = json('src/data/cameraProducts.json');
  let verifiedPaths = 0, knownCount = 0, referenceOnly = 0, identityObjects = 0, claimCount = 0;
  for (const card of cards()) {
    const body = canonical.bodies.find((entry) => entry.id === card.canonicalId), staged = stage(card);
    assert.ok(body.sources.some((source) => source.type === 'manufacturer'));
    assert.ok(Object.keys(body.fieldEvidence).length > 0);
    verifiedPaths += Object.keys(body.fieldEvidence).length;
    claimCount += staged.claims.length;
    if (body.identityEvidence) {
      identityObjects++;
      assert.equal(body.identityEvidence.verification, 'verified');
      assert.ok(staged.sources.some((source) => source.sourceId === body.identityEvidence.sourceId));
    } else {
      assert.equal(card.productionBatch, 'production-fujifilm-bodies-003');
      assert.equal(staged.identityEvidence, null);
      assert.ok(audit().findings.shouldFix.some((finding) => finding.productId === body.id && finding.path === 'identityEvidence'));
    }
    for (const field of knownLeaves(body.specs)) {
      knownCount++;
      const verified = Object.entries(body.fieldEvidence).some(([scope, evidence]) => covers(field, scope) && evidence.verification === 'verified');
      if (verified) continue;
      referenceOnly++;
      assert.equal(body.id, 'fujifilm-x100vi');
      assert.equal(field, 'specs.fixedLens.label');
      assert.ok(body.sources.some((source) => source.type === 'manufacturer' && source.fields.some((scope) => covers(field, scope))));
    }
    for (const [field, evidence] of Object.entries(body.fieldEvidence)) {
      assert.equal(evidence.verification, 'verified');
      for (const claimId of evidence.claimIds) {
        const claim = staged.claims.find((entry) => entry.claimId === claimId);
        assert.ok(claim, `${body.id}/${field}`);
        assert.equal(claim.path, field);
        assert.equal(claim.verification, 'verified');
        assert.deepEqual(getAtPath(body, field), claim.value);
        assert.ok(body.sources.some((source) => source.sourceId === claim.sourceId && source.fields.some((scope) => covers(field, scope))));
      }
    }
  }
  assert.deepEqual([verifiedPaths, knownCount, referenceOnly, identityObjects, claimCount], [331, 365, 1, 9, 366]);
  assert.equal(audit().provenanceSummary.verifiedKnownLeaves, knownCount - referenceOnly);
});

test('Fuji 001–003 immutable artifacts reproduce approvals and a complete strict canonical digest chain', () => {
  let previous = json(`${base}batches/production-nikon-bodies-004.json`).expectedCanonicalDigest;
  let sourceCount = 0;
  const seen = new Set();
  for (let number = 1; number <= 3; number++) {
    const batch = `production-fujifilm-bodies-${String(number).padStart(3, '0')}`;
    const manifest = json(`${base}batches/${batch}.json`), approval = json(`${base}approvals/${batch}.json`);
    const tx = `${base}transactions/${batch}/`, evidence = json(`${tx}evidence.json`), journal = json(`${tx}journal.json`);
    const before = json(`${tx}before.json`), after = json(`${tx}after.json`), diff = json(`${base}diffs/${batch}.json`);
    assert.equal(manifest.lastSuccessfulGate, 'apply');
    assert.equal(manifest.apply.state, 'canonicalized');
    assert.equal(journal.phase, 'canonicalized');
    for (const digest of [manifest.canonicalBaselineDigest, approval.baselineCanonicalDigest, journal.baselineCanonicalDigest, sha(`${tx}before.json`)]) assert.equal(digest, previous);
    for (const digest of [approval.expectedCanonicalDigest, journal.expectedCanonicalDigest, sha(`${tx}after.json`)]) assert.equal(digest, manifest.expectedCanonicalDigest);
    assert.equal(manifest.apply.approvalId, approval.approvalId);
    assert.equal(journal.approvalId, approval.approvalId);
    assert.deepEqual(json(`${base}approvals/${batch}/${approval.approvalId}.json`), approval);
    assert.deepEqual(evidence.approval, approval);
    assert.deepEqual(evidence.bundle.diff, diff);
    assert.equal(journal.evidenceDigest, digestValue(evidence));
    assert.equal(approval.diffDigest, digestValue(diff));
    assert.equal(approval.diffFileDigest, sha(`${base}diffs/${batch}.json`));
    assert.deepEqual(evidence.bundle.artifactDigests, approval.incomingArtifactDigests);
    assert.equal(approval.incomingDigest, digestValue(approval.incomingArtifactDigests));
    for (const [file, digest] of Object.entries(approval.incomingArtifactDigests)) {
      // The sealed journal/evidence above binds the historical vocab and byte digest.
      // Current mount/style registries may grow; old entries must remain identical.
      if (file === 'vocab.json') {
        const current = json(`${base}${file}`);
        for (const [key, value] of Object.entries(evidence.bundle.vocab)) {
          if (['brands', 'mounts', 'bodyStyles'].includes(key)) {
            assert.deepEqual(current[key].slice(0, value.length), value);
          } else assert.deepEqual(current[key], value);
        }
        continue;
      }
      // The appendable identity-map uses jsonBytes; verify the sealed version.
      const archived = file === 'identity-map.json' ? evidence.bundle.identityMap : null;
      assert.equal(archived ? hash(jsonBytes(archived)) : sha(`${base}${file}`), digest, `${batch}/${file}`);
    }
    assert.deepEqual(new Set(approval.productIds), new Set(manifest.items.map((item) => item.productId)));
    for (const item of manifest.items) {
      assert.equal(item.state, 'canonicalized');
      assert.ok(!seen.has(item.productId));
      seen.add(item.productId);
      const staged = json(`${base}staging/${batch}/${item.itemKey}.json`);
      assert.equal(item.stagingDigest, digestValue(staged));
      assert.equal(item.diffDigest, digestValue(diff));
      assert.ok(evidence.bundle.stagings.some((entry) => digestValue(entry) === item.stagingDigest));
      assert.equal(item.rawDigests.length, item.sourceIds.length);
      for (const [index, id] of item.sourceIds.entries()) {
        sourceCount++;
        const raw = json(`${base}raw/${id}.json`);
        assert.equal(raw.sourceId, id);
        assert.equal(createSourceId(raw), id);
        assert.equal(item.rawDigests[index], digestValue(raw));
        assert.equal(raw.contentDigest, digestValue(raw.evidenceExcerpt));
        assert.deepEqual(evidence.bundle.raws[id], raw);
        assert.equal(new Date(raw.accessedAt).toISOString(), raw.accessedAt);
      }
    }
    // Strict default only: no legacyFixedLensUnits option in any Fuji replay.
    verifyIncoming(evidence.bundle, before);
    const proposed = proposedCanonical(before, evidence.bundle, approval.decisions, approval.productOperations);
    assert.equal(proposed.digest, manifest.expectedCanonicalDigest);
    assert.deepEqual(proposed.canonical, after);
    assert.deepEqual(proposedCanonical(after, evidence.bundle, approval.decisions, approval.productOperations).canonical, after);
    assert.equal(validateCanonical(after, evidence.bundle.vocab), true);
    previous = manifest.expectedCanonicalDigest;
  }
  assert.equal(sourceCount, 30);
  assert.deepEqual(seen, new Set(cards().map((card) => card.canonicalId)));
  assert.equal(previous, audit().canonicalDigest);
});

test('All three Fuji fixed primes keep independent strict actual/equivalent mm evidence without lens assets', () => {
  const expected = {
    'fujifilm-gfx100rf': [35, 28, 4, 735],
    'fujifilm-x-half': [10.8, 32, 2.8, 240],
    'fujifilm-x100vi': [23, 35, 2, 521],
  };
  for (const [id, [actual, equivalent, aperture, weight]] of Object.entries(expected)) {
    const card = cards().find((entry) => entry.canonicalId === id), body = BODY_BY_ID[id], staged = stage(card);
    assert.equal(body.kind, 'fixed');
    assert.equal(body.mount, null);
    assert.deepEqual(body.fixedLens.focal, { min: actual, max: actual });
    assert.deepEqual(body.fixedLens.equivalentFocal, { min: equivalent, max: equivalent });
    assert.deepEqual(body.fixedLens.aperture, { wide: aperture, tele: aperture });
    assert.equal(body.weight, weight);
    const diff = json(`${base}diffs/${card.productionBatch}.json`).items.find((item) => item.productId === id);
    const tx = json(`${base}transactions/${card.productionBatch}/evidence.json`).bundle;
    const context = { canonical: json(`${base}transactions/${card.productionBatch}/before.json`), vocab: tx.vocab, rawDocuments: new Map(Object.entries(tx.raws)) };
    assert.equal(validateStagingBatch([staged], context).valid, true);
    for (const range of ['focal', 'equivalentFocal']) for (const end of ['min', 'max']) {
      const field = `specs.fixedLens.${range}.${end}`, claim = staged.claims.find((entry) => entry.path === field);
      assert.equal(claim.unit, 'mm');
      assert.equal(claim.rawUnit, 'mm');
      assert.equal(claim.value, range === 'focal' ? actual : equivalent);
      assert.equal(diff.changes.find((entry) => entry.claimId === claim.claimId).unit, 'mm');
      const broken = structuredClone(staged);
      broken.claims.find((entry) => entry.claimId === claim.claimId).unit = null;
      assert.ok(validateStagingBatch([broken], context).items[0].errors.some((error) => error.path === field && error.code === 'UNIT_REQUIRED'));
    }
    const integrated = getIntegratedLens(body);
    assert.equal(integrated.includedInBodyId, id);
    assert.equal(integrated.weight, null);
    assert.equal(integrated.newPrice, null);
    assert.equal(integrated.usedPrice, null);
    assert.ok(!CAMERA_LENSES.some((lens) => lens.id === integrated.id || lens.id.startsWith(id)));
  }
});

test('Fuji sensor, mount, IBIS and selected-mode conditions are preserved without simulation performance fields', () => {
  for (const card of cards()) {
    const body = json('src/data/cameraProducts.json').bodies.find((entry) => entry.id === card.canonicalId), staged = stage(card);
    assert.equal(body.mount, body.kind === 'fixed' ? null : card.category === 'GFX' ? 'Fujifilm G' : 'Fujifilm X');
    assert.equal(body.specs.sensor.format, card.category === 'GFX' ? 'GFX (라지포맷)' : card.modelCode === 'X-HF1' ? '1인치' : 'APS-C');
    assert.ok(body.fieldEvidence['specs.sensor.sizeMm']);
    if (card.category === 'GFX') assert.deepEqual(body.specs.sensor.sizeMm, [43.8, 32.9]);
    assert.ok(!staged.claims.some((claim) => /simulation|experience|film/i.test(claim.path)));
    assert.ok(!knownLeaves(body.specs).some((field) => /simulation|experience|film/i.test(field)));
    for (const claim of staged.claims.filter((entry) => entry.value != null)) {
      if (claim.path === 'specs.weight') assert.equal(claim.conditions.weightBasis, body.specs.weightBasis);
      if (claim.path === 'specs.bodyOnlyWeight') assert.equal(claim.conditions.weightBasis, 'body-only');
      if (claim.path === 'specs.ibis') assert.equal(typeof claim.value, 'object');
      if (claim.path === 'specs.video.max') assert.ok(Number.isFinite(claim.conditions.frameRate));
      if (claim.path.startsWith('specs.burst.')) assert.ok(claim.conditions.shutter);
    }
  }
  const byId = (id) => stage(cards().find((card) => card.canonicalId === id));
  assert.equal(BODY_BY_ID['fujifilm-x-m5'].ibis, null);
  assert.equal(byId('fujifilm-x-m5').claims.find((claim) => claim.path === 'specs.ibis').value, null);
  const eterna = byId('fujifilm-gfx-eterna-55').claims.find((claim) => claim.path === 'specs.video.max');
  assert.equal(eterna.conditions.notExternalRaw, true);
  assert.equal(eterna.conditions.externalOutputSeparate.rawBitDepth, 12);
  assert.equal(eterna.conditions.highFrameRateSeparate.maxFps, 48);
  const approval = json(`${base}approvals/production-fujifilm-bodies-003.json`);
  const conflicts = approval.decisions.filter((decision) => decision.category === 'value-conflict');
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].productId, 'fujifilm-x-t5');
  assert.equal(conflicts[0].path, 'specs.video.max');
  assert.match(conflicts[0].reason, /marketing-rounded.*29\.97/);
});

test('Fuji feature variants and IR/Instax deferral preserve differences and explicit reconsideration', () => {
  const a = audit(), scope = json(`${base}catalog-scope.json`).entries;
  const fragment = a.variants.find((variant) => variant.cardKey === '1357');
  assert.equal(fragment.classification, 'linked-feature-and-appearance-variant');
  assert.ok(fragment.differences.some((text) => text.includes('FRGMT BW')));
  assert.ok(fragment.differences.some((text) => text.includes('modes excluded')));
  assert.equal(a.variants.find((variant) => variant.cardKey === '1332').classification, 'linked-sale-and-appearance-edition');
  for (const name of ['GFX100 II IR', 'Instax instant imaging system']) {
    const entry = scope.find((item) => item.brand === 'Fujifilm' && item.model === name);
    assert.equal(entry.scopeStatus, 'deferred-special-category');
    assert.ok(entry.reason.length > 50 && entry.reconsideration.length > 50);
    assert.ok(entry.officialSources.length);
  }
  assert.equal(a.adjacentInstax.notInXGfxDenominator, true);
  assert.deepEqual(a.adjacentInstax.digitalCompanion, ['Pal']);
  assert.equal(a.adjacentInstax.analog.length, 6);
  assert.equal(a.adjacentInstax.hybrid.length, 3);
  assert.equal(new Set([...a.adjacentInstax.analog, ...a.adjacentInstax.hybrid, ...a.adjacentInstax.digitalCompanion]).size, 10);
});

test('Fuji findings count explicit audited metadata gaps and UNKNOWNs without claiming all null fields were surveyed', () => {
  const a = audit(), canonical = json(`${base}transactions/production-fujifilm-bodies-003/after.json`);
  assert.equal(a.findings.critical.length, 0);
  assert.equal(a.findings.shouldFix.length, 14);
  assert.equal(a.findings.acceptableUnknown.length, 27);
  for (const group of [a.findings.shouldFix, a.findings.acceptableUnknown]) {
    assert.equal(new Set(group.map((finding) => `${finding.productId}:${finding.path}`)).size, group.length);
    for (const finding of group) {
      const body = canonical.bodies.find((entry) => entry.id === finding.productId);
      assert.ok(body && finding.reason.length > 20);
      if (finding.path !== 'specs.fixedLens.label') assert.equal(getAtPath(body, finding.path) ?? null, null);
    }
  }
  const missing = a.findings.shouldFix;
  assert.equal(missing.filter((finding) => finding.path === 'identityEvidence').length, 5);
  assert.equal(missing.filter((finding) => finding.path === 'specs.cardSlots').length, 8);
  assert.equal(missing.filter((finding) => finding.path === 'specs.fixedLens.label').length, 1);
});
