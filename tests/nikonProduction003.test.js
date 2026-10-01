import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCanonical } from '../scripts/objective/merge.mjs';
import { digestValue, validateStagingBatch } from '../scripts/objective/rules.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => readFileSync(path.join(root, name));
const json = (name) => JSON.parse(read(name));
const sha = (name) => createHash('sha256').update(read(name)).digest('hex');
const base = 'src/data/ingestion/';
const batch = 'production-nikon-bodies-003';
const selected = new Map([
  ['Z50', 'nikon-z50'], ['Z6', 'nikon-z6'], ['Z7', 'nikon-z7'],
  ['Z6II', 'nikon-z6-ii'], ['Z5', 'nikon-z5'],
]);

test('Nikon batch 003 inventory preserves historical selection and upcoming boundary', () => {
  const snapshot = json(`${base}nikon-current-camera-gallery-2026-10-01.json`);
  const canonical = json('src/data/cameraProducts.json');
  assert.equal(snapshot.cards.length, 22);
  assert.equal(snapshot.cards.filter((card) => card.availabilityStatus === 'released-current').length, 21);
  assert.equal(snapshot.cards.filter((card) => card.availabilityStatus === 'announced-upcoming').length, 1);
  assert.ok(snapshot.cards.filter((card) => card.availabilityStatus === 'released-current' && card.status === 'unprocessed').length <= 1);
  assert.equal(snapshot.cards.find((card) => card.name === 'Z5IIC').status, 'unprocessed');
  assert.ok(!canonical.bodies.some((body) => body.model === 'Z5IIC'));
  for (const [name, id] of selected) {
    const card = snapshot.cards.find((candidate) => candidate.name === name);
    assert.equal(card.status, 'canonicalized');
    assert.equal(card.canonicalId, id);
    assert.equal(card.productionBatch, batch);
    assert.ok(canonical.bodies.some((body) => body.id === id));
  }
  assert.ok(canonical.bodies.length >= 101);
  assert.ok(canonical.lenses.length >= 36);
  assert.equal(validateCanonical(canonical, json(`${base}vocab.json`)), true);
});

test('Nikon batch 003 official evidence and archived atomic transition remain valid', () => {
  const manifest = json(`${base}batches/${batch}.json`);
  const approval = json(`${base}approvals/${batch}.json`);
  const journal = json(`${base}transactions/${batch}/journal.json`);
  const diff = json(`${base}diffs/${batch}.json`);
  const canonical = json('src/data/cameraProducts.json');
  const raws = new Map(manifest.items.flatMap((item) => item.sourceIds)
    .map((sourceId) => [sourceId, json(`${base}raw/${sourceId}.json`)]));
  const stagings = manifest.items.map((item) => json(`${base}staging/${batch}/${item.itemKey}.json`));
  assert.equal(manifest.items.length, 5);
  assert.equal(manifest.apply.state, 'canonicalized');
  assert.equal(journal.phase, 'canonicalized');
  assert.equal(manifest.canonicalBaselineDigest, json(`${base}batches/production-nikon-bodies-002.json`).expectedCanonicalDigest);
  assert.equal(manifest.canonicalBaselineDigest, sha(`${base}transactions/${batch}/before.json`));
  assert.equal(manifest.expectedCanonicalDigest, sha(`${base}transactions/${batch}/after.json`));
  const after = json(`${base}transactions/${batch}/after.json`);
  assert.equal(after.bodies.length, 101);
  assert.equal(after.lenses.length, 36);
  assert.equal(approval.diffDigest, digestValue(diff));
  assert.equal(approval.diffFileDigest, sha(`${base}diffs/${batch}.json`));
  assert.deepEqual(new Set(approval.productIds), new Set(selected.values()));
  assert.ok(diff.items.every((item) => item.operation === 'new-product' && item.changes.every((change) => change.category === 'new-product')));
  for (const [index, item] of manifest.items.entries()) {
    assert.equal(item.state, 'canonicalized');
    assert.equal(item.sourceIds.length, 2);
    assert.equal(item.stagingDigest, digestValue(stagings[index]));
    assert.equal(stagings[index].sources.length, 2);
    assert.ok(stagings[index].claims.every((claim) => claim.verification === 'verified'));
    const product = canonical.bodies.find((body) => body.id === item.productId);
    const productSourceIds = new Set(product.sources.map((source) => source.sourceId));
    assert.ok(item.sourceIds.every((sourceId) => productSourceIds.has(sourceId)));
    for (const [sourceIndex, sourceId] of item.sourceIds.entries()) {
      const raw = raws.get(sourceId);
      assert.equal(item.rawDigests[sourceIndex], digestValue(raw));
      assert.match(raw.accessedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      assert.equal(new Date(raw.accessedAt).toISOString(), raw.accessedAt);
    }
  }
  assert.equal(validateStagingBatch(stagings, { canonical: json(`${base}transactions/${batch}/before.json`), vocab: json(`${base}vocab.json`), rawDocuments: raws }).valid, true);
});

test('Nikon batch 003 retains firmware/crop conditions and unknown burst and IBIS values', () => {
  const canonical = json('src/data/cameraProducts.json');
  const staging = Object.fromEntries([...selected.values()].map((id) => [id, json(    `${base}staging/${batch}/${id}.json`)]));
  for (const id of selected.values()) {
    const body = canonical.bodies.find((body) => body.id === id);
    assert.equal(body.kind, 'interchangeable');
    assert.equal(body.mount, 'Nikon Z');
    assert.equal(body.specs.fixedLens, null);
    assert.equal(body.specs.burst, null); // The reviewed burst excerpts do not specify shutter applicability.
    assert.equal(staging[id].claims.find((c) => c.path === 'specs.weight').conditions.weightBasis, 'battery-and-card');
    assert.equal(staging[id].claims.find((c) => c.path === 'specs.bodyOnlyWeight').conditions.weightBasis, 'body-only');
    if (id !== 'nikon-z50') {
      assert.equal(body.specs.ibis.axes, 5);
      assert.equal(body.specs.ibis.stops, null);
    }
  }
  assert.equal(canonical.bodies.find((b) => b.id === 'nikon-z50').specs.ibis, null);
  const z6ii = staging['nikon-z6-ii'].claims.find((c) => c.path === 'specs.video.max');
  assert.equal(z6ii.value, '4K UHD 59.94p');
  assert.equal(z6ii.conditions.firmwareMin, '1.10');
  assert.equal(z6ii.conditions.imageArea, 'DX-based movie format');
  assert.equal(z6ii.conditions.quality, 'normal');
  assert.equal(staging['nikon-z5'].claims.find((c) => c.path === 'specs.video.max').conditions.cropFactor, 1.7);
});

test('Nikon batch 003 production claims reject malformed IBIS and weight bases before approval', () => {
  const manifest = json(`${base}batches/${batch}.json`);
  const stagings = manifest.items.map((item) => json(`${base}staging/${batch}/${item.itemKey}.json`));
  const rawDocuments = new Map(manifest.items.flatMap((item) => item.sourceIds)
    .map((id) => [id, json(`${base}raw/${id}.json`)]));
  const context = { canonical: json(`${base}transactions/${batch}/before.json`), vocab: json(`${base}vocab.json`), rawDocuments };
  assert.equal(validateStagingBatch(stagings, context).valid, true);
  for (const value of [true, false, { present: 'yes' }, { axes: -1 }]) {
    const changed = structuredClone(stagings);
    changed.find((s) => s.product.id === 'nikon-z6').claims.find((c) => c.path === 'specs.ibis').value = value;
    const result = validateStagingBatch(changed, context);
    assert.equal(result.valid, false);
    assert.ok(result.items.flatMap((i) => i.errors).some((e) => e.code === 'INVALID_IBIS' && e.path === 'specs.ibis'));
  }
  for (const [basis, code] of [[undefined, 'WEIGHT_BASIS_REQUIRED'], ['operational', 'INVALID_WEIGHT_BASIS'], ['battery', 'WEIGHT_BASIS_MISMATCH']]) {
    const changed = structuredClone(stagings);
    const claim = changed.find((s) => s.product.id === 'nikon-z6').claims.find((c) => c.path === 'specs.weight');
    if (basis === undefined) delete claim.conditions.weightBasis;
    else claim.conditions.weightBasis = basis;
    const result = validateStagingBatch(changed, context);
    assert.equal(result.valid, false);
    assert.ok(result.items.flatMap((i) => i.errors).some((e) => e.code === code && e.path === 'specs.weight'));
  }
});
