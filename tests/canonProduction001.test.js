import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCanonical } from '../scripts/objective/merge.mjs';
import { digestValue } from '../scripts/objective/rules.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => readFileSync(path.join(root, name));
const json = (name) => JSON.parse(read(name));
const sha = (name) => createHash('sha256').update(read(name)).digest('hex');
const base = 'src/data/ingestion/';

test('Canon Korea gallery snapshot tracks every direct-operated camera card and production state', () => {
  const snapshot = json(`${base}canon-current-camera-gallery-2026-09-29.json`);
  const canonical = json('src/data/cameraProducts.json');
  const byId = new Map(canonical.bodies.map((body) => [body.id, body]));
  assert.equal(snapshot.cards.length, 29);
  for (const [category, count] of Object.entries({ mirrorless: 15, dslr: 2, compact: 5, 'cinema-eos': 7 })) {
    assert.equal(snapshot.cards.filter((card) => card.category === category).length, count);
  }
  assert.equal(new Set(snapshot.cards.map((card) => card.productUrl)).size, 29);
  assert.equal(new Set(snapshot.cards.map((card) => card.modelCode)).size, 29);
  assert.equal(snapshot.cards.filter((card) => card.status === 'canonicalized').length, 16);
  assert.equal(snapshot.cards.filter((card) => card.status === 'unprocessed').length, 13);
  for (const card of snapshot.cards) {
    assert.ok(card.productUrl.startsWith('https://kr.canon/'));
    if (card.status === 'canonicalized') assert.ok(byId.has(card.canonicalId), card.name);
  }
  assert.equal(validateCanonical(canonical, json(`${base}vocab.json`)), true);
});

test('Canon batch 001 preserves five reviewed two-source products and fixed-lens representation', () => {
  const batchId = 'production-canon-bodies-001';
  const manifest = json(`${base}batches/${batchId}.json`);
  const approval = json(`${base}approvals/${batchId}.json`);
  const journal = json(`${base}transactions/${batchId}/journal.json`);
  const canonical = json('src/data/cameraProducts.json');
  const ids = new Set(canonical.bodies.map((body) => body.id));
  assert.equal(manifest.items.length, 5);
  assert.equal(manifest.apply.state, 'canonicalized');
  assert.equal(journal.phase, 'canonicalized');
  assert.equal(manifest.canonicalBaselineDigest, sha(`${base}transactions/${batchId}/before.json`));
  assert.equal(manifest.canonicalBaselineDigest, json(`${base}batches/production-sony-bodies-008.json`).expectedCanonicalDigest);
  assert.equal(manifest.expectedCanonicalDigest, sha(`${base}transactions/${batchId}/after.json`));
  assert.equal(approval.diffFileDigest, sha(`${base}diffs/${batchId}.json`));
  assert.deepEqual(new Set(approval.productIds), new Set(manifest.items.map((item) => item.productId)));
  for (const item of manifest.items) {
    assert.equal(item.state, 'canonicalized');
    assert.ok(ids.has(item.productId));
    assert.equal(item.sourceIds.length, 2);
    assert.equal(item.stagingDigest, digestValue(json(`${base}staging/${batchId}/${item.itemKey}.json`)));
    for (const [index, sourceId] of item.sourceIds.entries()) {
      const raw = json(`${base}raw/${sourceId}.json`);
      assert.equal(raw.sourceId, sourceId);
      assert.equal(item.rawDigests[index], digestValue(raw));
      assert.match(raw.accessedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    }
  }
  const v1 = canonical.bodies.find((body) => body.id === 'canon-powershot-v1');
  assert.equal(v1.kind, 'fixed');
  assert.equal(v1.mount, null);
  assert.deepEqual(v1.specs.fixedLens.focal, { max: 25.6, min: 8.2 });
  assert.deepEqual(v1.specs.fixedLens.equivalentFocal, { max: 50, min: 16 });
  assert.equal(v1.specs.weight, 426);
  assert.equal(v1.specs.video.cropAtMax, true);
  assert.ok(!canonical.lenses.some((lens) => lens.id.startsWith('canon-powershot-v1')));
  assert.equal(canonical.bodies.find((body) => body.id === 'canon-r50-v').specs.weight, null);
  assert.equal(canonical.bodies.find((body) => body.id === 'canon-r100').specs.burst, null);
});
