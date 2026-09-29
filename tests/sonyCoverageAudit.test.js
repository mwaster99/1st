import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { validateCanonical } from '../scripts/objective/merge.mjs';
import { digestValue } from '../scripts/objective/rules.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => readFileSync(path.join(root, name));
const json = (name) => JSON.parse(read(name));
const sha = (name) => createHash('sha256').update(read(name)).digest('hex');
const base = 'src/data/ingestion/';

test('Sony Korea current gallery cards have exactly one canonical or reviewed scope outcome', () => {
  const snapshot = json(`${base}sony-current-camera-gallery-2026-09-29.json`);
  const scope = json(`${base}catalog-scope.json`);
  const identity = json(`${base}identity-map.json`).entries.filter((entry) => entry.manufacturer === 'Sony' && entry.productType === 'body');
  const canonical = json('src/data/cameraProducts.json');
  const codes = snapshot.cards.map((card) => card.modelCode);
  assert.equal(snapshot.cards.length, 35);
  assert.equal(snapshot.cards.filter((card) => card.gallery === 'interchangeable').length, 27);
  assert.equal(snapshot.cards.filter((card) => card.gallery === 'compact').length, 8);
  assert.equal(new Set(codes).size, codes.length);
  assert.equal(new Set(identity.map((entry) => entry.manufacturerModelCode)).size, identity.length);
  assert.equal(new Set(identity.map((entry) => entry.productId)).size, identity.length);
  assert.equal(new Set(canonical.bodies.map((body) => body.id)).size, canonical.bodies.length);

  const byCode = new Map(identity.map((entry) => [entry.manufacturerModelCode, entry]));
  const excluded = new Map(scope.entries.map((entry) => [entry.manufacturerModelCode, entry]));
  const canonicalIds = new Set(canonical.bodies.map((body) => body.id));
  const byId = new Map(canonical.bodies.map((body) => [body.id, body]));
  const resolvedIds = [];
  for (const card of snapshot.cards) {
    assert.ok(['interchangeable', 'compact'].includes(card.gallery));
    assert.ok(!card.cardCodes || card.cardCodes.includes(card.modelCode));
    const mapped = byCode.get(card.modelCode);
    const deferred = excluded.get(card.modelCode);
    assert.equal(Number(Boolean(mapped)) + Number(Boolean(deferred)), 1, card.modelCode);
    if (mapped) {
      assert.ok(canonicalIds.has(mapped.productId), card.modelCode);
      const body = byId.get(mapped.productId);
      assert.equal(body.kind, card.gallery === 'compact' ? 'fixed' : 'interchangeable', card.modelCode);
      assert.equal(body.mount, card.gallery === 'compact' ? null : 'Sony E', card.modelCode);
      resolvedIds.push(mapped.productId);
    } else {
      assert.equal(deferred.scopeStatus, 'deferred-special-category');
      assert.ok(deferred.reason.length > 30);
      assert.ok(deferred.officialSources.length > 0);
      assert.ok(deferred.officialSources.every((url) => url.startsWith('https://')));
      assert.ok(!Number.isNaN(Date.parse(deferred.reviewedAt)));
      assert.ok(deferred.reconsideration.length > 30);
    }
  }
  assert.equal(resolvedIds.length, 34);
  assert.equal(new Set(resolvedIds).size, 34);
  assert.deepEqual([...excluded.keys()], ['ILME-FR7']);
  assert.equal(identity.length, 34);
  assert.deepEqual(new Set(resolvedIds), new Set(identity.map((entry) => entry.productId)));
  assert.equal(byCode.get('ILME-FX3').productId, 'sony-fx3');
  assert.equal(byCode.get('ILME-FX3A').productId, 'sony-fx3a');
  assert.equal(byCode.get('ILCE-7RM3A').productId, 'sony-a7r-iii-a');
  assert.equal(byCode.get('ILCE-7RM4A').productId, 'sony-a7r-iv-a');
  assert.ok(!byCode.has('ILCE-7RM3'));
  assert.ok(!byCode.has('ILCE-7RM4'));
  assert.ok(!canonicalIds.has('sony-a7r-iii'));
  assert.ok(!canonicalIds.has('sony-a7r-iv'));
  assert.equal(validateCanonical(canonical, json(`${base}vocab.json`)), true);
});

test('production batches 001–008 retain approval, source, diff, transaction and digest chain', () => {
  const canonical = json('src/data/cameraProducts.json');
  const canonicalIds = new Set(canonical.bodies.map((body) => body.id));
  const seen = new Set();
  let previousDigest;
  for (let number = 1; number <= 8; number++) {
    const batchId = `production-sony-bodies-${String(number).padStart(3, '0')}`;
    const batch = json(`${base}batches/${batchId}.json`);
    const approval = json(`${base}approvals/${batchId}.json`);
    const journal = json(`${base}transactions/${batchId}/journal.json`);
    assert.equal(batch.lastSuccessfulGate, 'apply');
    assert.equal(batch.apply.state, 'canonicalized');
    assert.equal(journal.phase, 'canonicalized');
    assert.equal(batch.apply.approvalId, approval.approvalId);
    assert.equal(journal.approvalId, approval.approvalId);
    assert.equal(batch.expectedCanonicalDigest, approval.expectedCanonicalDigest);
    assert.equal(batch.expectedCanonicalDigest, journal.expectedCanonicalDigest);
    assert.equal(batch.canonicalBaselineDigest, approval.baselineCanonicalDigest);
    assert.equal(batch.canonicalBaselineDigest, journal.baselineCanonicalDigest);
    assert.equal(batch.expectedCanonicalDigest, sha(`${base}transactions/${batchId}/after.json`));
    assert.equal(batch.canonicalBaselineDigest, sha(`${base}transactions/${batchId}/before.json`));
    assert.equal(approval.diffFileDigest, sha(`${base}diffs/${batchId}.json`));
    const archivedApproval = `${base}approvals/${batchId}/${approval.approvalId}.json`;
    assert.ok(existsSync(path.join(root, archivedApproval)));
    assert.deepEqual(json(archivedApproval), approval);
    if (previousDigest) assert.equal(batch.canonicalBaselineDigest, previousDigest);
    previousDigest = batch.expectedCanonicalDigest;
    assert.deepEqual(new Set(approval.productIds), new Set(batch.items.map((item) => item.productId)));
    for (const item of batch.items) {
      assert.equal(item.state, 'canonicalized');
      assert.ok(!seen.has(item.productId), item.productId);
      seen.add(item.productId);
      assert.ok(canonicalIds.has(item.productId), item.productId);
      const stagingPath = `${base}staging/${batchId}/${item.itemKey}.json`;
      assert.ok(existsSync(path.join(root, stagingPath)));
      assert.equal(item.stagingDigest, digestValue(json(stagingPath)));
      assert.ok(item.sourceIds.length > 0);
      assert.equal(item.sourceIds.length, item.rawDigests.length);
      for (const [index, sourceId] of item.sourceIds.entries()) {
        const rawPath = `${base}raw/${sourceId}.json`;
        assert.ok(existsSync(path.join(root, rawPath)));
        assert.equal(item.rawDigests[index], digestValue(json(rawPath)));
      }
    }
  }
  assert.equal(seen.size, 34);
  assert.equal(previousDigest, sha('src/data/cameraProducts.json'));
});
