import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BODY_BY_ID, getIntegratedLens } from '../src/cameraData.js';
import { proposedCanonical, validateCanonical, verifyIncoming } from '../scripts/objective/merge.mjs';
import { digestValue, getAtPath, normalizeSearch } from '../scripts/objective/rules.mjs';
import { jsonBytes } from '../scripts/objective/storage.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = 'src/data/ingestion/';
const read = (name) => readFileSync(path.join(root, name));
const json = (name) => JSON.parse(read(name));
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const sha = (name) => hash(read(name));
const snapshot = () => json(`${base}nikon-current-camera-gallery-2026-10-01.json`);
const covers = (field, scope) => field === scope || field.startsWith(`${scope}.`);
const knownLeaves = (value, field = 'specs') => value == null ? []
  : typeof value !== 'object' || Array.isArray(value) ? [field]
    : Object.entries(value).flatMap(([key, child]) => knownLeaves(child, `${field}.${key}`));
const staged = (card) => json(`${base}staging/${card.productionBatch}/${card.canonicalId}.json`);

test('Nikon official snapshot has exhaustive released/upcoming outcomes and unique generation identities', () => {
  const cards = snapshot().cards;
  const canonical = json('src/data/cameraProducts.json');
  const nikon = canonical.bodies.filter((body) => body.brand === 'Nikon');
  const identities = json(`${base}identity-map.json`).entries.filter((entry) => entry.manufacturer === 'Nikon' && entry.productType === 'body');
  assert.equal(cards.length, 22);
  assert.deepEqual(Object.fromEntries(['mirrorless', 'dslr', 'compact', 'zcinema'].map((category) =>
    [category, cards.filter((card) => card.category === category).length])), { mirrorless: 15, dslr: 3, compact: 3, zcinema: 1 });
  for (const field of ['modelCode', 'productUrl']) assert.equal(new Set(cards.map((card) => card[field])).size, cards.length);
  for (const field of ['manufacturerModelCode', 'productId']) assert.equal(new Set(identities.map((entry) => entry[field])).size, identities.length);
  assert.equal(new Set(nikon.map((body) => normalizeSearch(body.model))).size, nikon.length);
  const ids = new Set();
  for (const card of cards) {
    assert.equal(card.scopeStatus, 'in-scope');
    if (card.availabilityStatus === 'announced-upcoming') {
      assert.equal(card.modelCode, 'Z5IIC');
      assert.equal(card.status, 'unprocessed');
      assert.equal(card.canonicalId, null);
      assert.ok(!nikon.some((body) => normalizeSearch(body.model) === normalizeSearch(card.modelCode)));
      assert.ok(!identities.some((entry) => entry.manufacturerModelCode === card.modelCode));
      continue;
    }
    assert.equal(card.availabilityStatus, 'released-current');
    assert.equal(card.status, 'canonicalized');
    assert.ok(!ids.has(card.canonicalId), card.modelCode);
    ids.add(card.canonicalId);
    const body = nikon.find((entry) => entry.id === card.canonicalId);
    assert.equal(normalizeSearch(body?.model), normalizeSearch(card.modelCode));
    assert.equal(body.kind, card.category === 'compact' ? 'fixed' : card.category === 'dslr' ? 'dslr' : 'interchangeable');
    assert.equal(body.mount, card.category === 'compact' ? null : card.category === 'dslr' ? 'Nikon F' : 'Nikon Z');
    if (card.productionBatch) assert.equal(identities.find((entry) => entry.manufacturerModelCode === card.modelCode)?.productId, body.id);
    for (const alias of body.aliases) {
      const key = normalizeSearch(alias).replace(/^(?:nikon|니콘)/, '');
      for (const other of cards) if (other !== card) assert.notEqual(key, normalizeSearch(other.modelCode), `${alias} merges ${other.modelCode}`);
    }
  }
  assert.equal(ids.size, 21);
  assert.equal(cards.filter((card) => card.availabilityStatus === 'announced-upcoming').length, 1);
  assert.equal(cards.filter((card) => card.availabilityStatus === 'released-current' && card.status !== 'canonicalized').length, 0);
  assert.equal(snapshot().adjacentSpecialCategory.status, 'outside-Nikon-Korea-direct-operated-camera-inventory');
  assert.equal(json(`${base}catalog-scope.json`).entries.filter((entry) => entry.brand === 'Nikon').length, 0);
  assert.equal(validateCanonical(canonical, json(`${base}vocab.json`)), true);
});

test('Every known Nikon objective leaf has verified, official-reference or explicit legacy provenance', () => {
  const canonical = json('src/data/cameraProducts.json');
  for (const card of snapshot().cards.filter((entry) => entry.status === 'canonicalized')) {
    const body = canonical.bodies.find((entry) => entry.id === card.canonicalId);
    const official = body.sources.filter((source) => source.type === 'manufacturer');
    assert.ok(official.length > 0, body.id);
    for (const field of knownLeaves(body.specs)) {
      const verified = Object.entries(body.fieldEvidence ?? {}).some(([scope, evidence]) => covers(field, scope) && evidence.verification === 'verified');
      const referenced = official.some((source) => source.fields.some((scope) => covers(field, scope)));
      const legacy = body.legacyFields.some((scope) => covers(field, scope.startsWith('specs.') ? scope : `specs.${scope}`));
      assert.ok(verified || referenced || legacy, `${body.id}/${field} has no provenance classification`);
      if (card.productionBatch) assert.ok(verified, `${body.id}/${field} lost verified evidence`);
    }
    if (!card.productionBatch) continue; // Legacy metadata gaps are audited, not silently reclassified as verified.
    const staging = staged(card);
    assert.equal(body.identityEvidence.verification, 'verified');
    assert.ok(staging.sources.some((source) => source.sourceId === body.identityEvidence.sourceId));
    for (const [field, evidence] of Object.entries(body.fieldEvidence)) {
      for (const claimId of evidence.claimIds) {
        const claim = staging.claims.find((entry) => entry.claimId === claimId);
        assert.ok(claim, `${body.id}/${field} dangling claim`);
        assert.equal(claim.path, field);
        assert.equal(claim.verification, 'verified');
        assert.deepEqual(getAtPath(body, field), claim.value);
        assert.ok(body.sources.some((source) => source.sourceId === claim.sourceId && source.fields.some((scope) => covers(field, scope))));
      }
    }
  }
});

test('Nikon 001–004 archived approvals reproduce atomic results with an intact Canon-to-Nikon digest chain', () => {
  const covered = new Set(snapshot().cards.filter((card) => card.productionBatch).map((card) => card.canonicalId));
  const seen = new Set();
  let previous = json(`${base}batches/production-canon-bodies-005.json`).expectedCanonicalDigest;
  for (let number = 1; number <= 4; number++) {
    const batch = `production-nikon-bodies-${String(number).padStart(3, '0')}`;
    const manifest = json(`${base}batches/${batch}.json`);
    const diff = json(`${base}diffs/${batch}.json`);
    const approval = json(`${base}approvals/${batch}.json`);
    const transaction = `${base}transactions/${batch}/`;
    const evidence = json(`${transaction}evidence.json`);
    const journal = json(`${transaction}journal.json`);
    assert.equal(manifest.lastSuccessfulGate, 'apply');
    assert.equal(manifest.apply.state, 'canonicalized');
    assert.equal(journal.phase, 'canonicalized');
    assert.equal(manifest.canonicalBaselineDigest, previous);
    assert.equal(previous, approval.baselineCanonicalDigest);
    assert.equal(previous, journal.baselineCanonicalDigest);
    assert.equal(previous, sha(`${transaction}before.json`));
    for (const expected of [approval.expectedCanonicalDigest, journal.expectedCanonicalDigest, sha(`${transaction}after.json`)])
      assert.equal(manifest.expectedCanonicalDigest, expected);
    assert.equal(manifest.apply.approvalId, approval.approvalId);
    assert.equal(journal.approvalId, approval.approvalId);
    assert.deepEqual(json(`${base}approvals/${batch}/${approval.approvalId}.json`), approval);
    assert.deepEqual(evidence.approval, approval);
    assert.deepEqual(evidence.bundle.diff, diff);
    assert.equal(journal.evidenceDigest, digestValue(evidence));
    assert.equal(approval.diffDigest, digestValue(diff));
    assert.equal(approval.diffFileDigest, sha(`${base}diffs/${batch}.json`));
    assert.deepEqual(evidence.bundle.artifactDigests, approval.incomingArtifactDigests);
    assert.equal(approval.incomingDigest, digestValue(evidence.bundle.artifactDigests));
    for (const [file, digest] of Object.entries(approval.incomingArtifactDigests)) {
      // Config registries can grow after this transaction. The journal evidence digest
      // above binds the archived vocab; current bytes are not its historical bytes.
      if (file === 'vocab.json') {
        const current = json(`${base}${file}`);
        for (const [key, value] of Object.entries(evidence.bundle.vocab)) {
          if (key === 'brands' || key === 'mounts') {
            for (const entry of value) assert.deepEqual(current[key].find((item) => item.name === entry.name), entry);
          } else if (key === 'bodyStyles') {
            assert.deepEqual(current[key].slice(0, value.length), value);
          } else assert.deepEqual(current[key], value);
        }
        continue;
      }
      // Identity-map is stored in the same JSON byte format as its archived object.
      const archivedConfig = file === 'identity-map.json' ? evidence.bundle.identityMap : null;
      assert.equal(archivedConfig ? hash(jsonBytes(archivedConfig)) : sha(`${base}${file}`), digest, `${batch}/${file}`);
    }
    assert.deepEqual(new Set(approval.productIds), new Set(manifest.items.map((item) => item.productId)));
    for (const item of manifest.items) {
      assert.equal(item.state, 'canonicalized');
      assert.ok(covered.has(item.productId) && !seen.has(item.productId), item.productId);
      seen.add(item.productId);
      const staging = json(`${base}staging/${batch}/${item.itemKey}.json`);
      assert.equal(item.stagingDigest, digestValue(staging));
      assert.ok(evidence.bundle.stagings.some((entry) => digestValue(entry) === item.stagingDigest));
      assert.equal(item.sourceIds.length, 2);
      assert.equal(item.rawDigests.length, item.sourceIds.length);
      for (const [index, sourceId] of item.sourceIds.entries()) {
        const raw = json(`${base}raw/${sourceId}.json`);
        assert.equal(raw.sourceId, sourceId);
        assert.equal(item.rawDigests[index], digestValue(raw));
        assert.equal(raw.contentDigest, digestValue(raw.evidenceExcerpt));
        assert.deepEqual(evidence.bundle.raws[sourceId], raw);
        assert.match(raw.accessedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
        assert.equal(new Date(raw.accessedAt).toISOString(), raw.accessedAt);
      }
    }
    const before = json(`${transaction}before.json`);
    verifyIncoming(evidence.bundle, before, { legacyFixedLensUnits: true });
    const proposed = proposedCanonical(before, evidence.bundle, approval.decisions, approval.productOperations);
    assert.equal(proposed.digest, manifest.expectedCanonicalDigest);
    assert.deepEqual(proposed.canonical, json(`${transaction}after.json`));
    assert.equal(validateCanonical(json(`${transaction}after.json`), evidence.bundle.vocab), true);
    previous = manifest.expectedCanonicalDigest;
  }
  assert.equal(seen.size, 16);
});

test('All three COOLPIX optical systems retain actual/equivalent mm evidence without lens assets or body IBIS', () => {
  const canonical = json('src/data/cameraProducts.json');
  for (const card of snapshot().cards.filter((entry) => entry.category === 'compact')) {
    const body = BODY_BY_ID[card.canonicalId];
    const staging = staged(card);
    assert.equal(body.kind, 'fixed');
    assert.equal(body.mount, null);
    assert.equal(body.specs.ibis, null);
    assert.ok(!staging.claims.some((claim) => claim.path === 'specs.ibis'));
    for (const [range, values] of Object.entries(body.specs.fixedLens).filter(([key]) => ['focal', 'equivalentFocal'].includes(key))) {
      for (const end of ['min', 'max']) {
        const claim = staging.claims.find((entry) => entry.path === `specs.fixedLens.${range}.${end}`);
        assert.equal(claim.rawUnit, 'mm');
        assert.equal(claim.rawValue, values[end]);
        assert.equal(claim.value, values[end]);
      }
    }
    assert.ok(body.specs.fixedLens.focal.min < body.specs.fixedLens.equivalentFocal.min);
    assert.ok(body.specs.fixedLens.focal.max < body.specs.fixedLens.equivalentFocal.max);
    const integrated = getIntegratedLens(body);
    assert.equal(integrated.includedInBodyId, body.id);
    assert.equal(integrated.weight, null);
    assert.equal(integrated.newPrice, null);
    assert.equal(integrated.usedPrice, null);
    assert.ok(!canonical.lenses.some((lens) => lens.id.startsWith(body.id)));
  }
  const p1000 = BODY_BY_ID['nikon-coolpix-p1000'];
  assert.deepEqual(p1000.specs.fixedLens.equivalentFocal, { min: 24, max: 3000 });
  assert.deepEqual(p1000.specs.fixedLens.focal, { min: 4.3, max: 539 });
});

test('Nikon conditional burst, grip, crop, RAW and firmware distinctions survive the production archives', () => {
  const byModel = new Map(snapshot().cards.filter((card) => card.productionBatch).map((card) => [card.modelCode, staged(card)]));
  const claim = (model, field) => byModel.get(model).claims.find((entry) => entry.path === field);
  const z9 = claim('Z9', 'specs.burst.maxElectronicFps');
  assert.equal(z9.value, 20);
  assert.match(z9.conditions.recordingFormat, /not C120/);
  assert.match(claim('D850', 'specs.burst.maxMechanicalFps').conditions.mode, /9fps requires MB-D18 and EN-EL18b/);
  assert.equal(claim('D850', 'specs.burst.maxMechanicalFps').value, 7);
  assert.equal(claim('Z9', 'specs.video.max').conditions.firmware, 'Ver.2.00 or later');
  assert.equal(claim('Z9', 'specs.video.max').conditions.codec, 'N-RAW');
  assert.equal(claim('Z9', 'specs.video.max').conditions.recordingLocation, 'internal');
  assert.equal(claim('Z6II', 'specs.video.max').conditions.imageArea, 'DX-based movie format');
  assert.equal(claim('Z6II', 'specs.video.max').conditions.firmwareMin, '1.10');
  assert.equal(claim('Z6II', 'specs.video.cropAtMax').value, true);
  assert.equal(claim('Z5', 'specs.video.max').conditions.cropFactor, 1.7);
  assert.equal(claim('ZR', 'specs.video.max').conditions.codec, 'R3D NE');
  for (const staging of byModel.values()) {
    for (const weight of staging.claims.filter((entry) => entry.path === 'specs.weight' && entry.value != null))
      assert.equal(weight.conditions.weightBasis, staging.product.specs.weightBasis);
  }
});
