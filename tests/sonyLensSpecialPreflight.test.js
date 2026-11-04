import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildRawDocument } from '../scripts/objective/raw-helper.mjs';
import { createCanonicalDiff, normalizeRawDocument, validateStagingBatch } from '../scripts/objective/rules.mjs';
import { compareLens } from '../src/cameraComparisons.js';

const read = path => JSON.parse(readFileSync(new URL('../src/data/' + path, import.meta.url)));
const canonical = read('cameraProducts.json');
const vocab = read('ingestion/vocab.json');
const model = 'SYNTH-SPECIAL-PREFLIGHT';
const id = 'sony-synthetic-special-preflight';

function fixture(type, rows) {
  const locator = { section: 'Synthetic test only' };
  const raw = buildRawDocument({
    source: {
      sourceType: 'manufacturer', publisher: 'Sony', url: 'https://www.sony.co.kr/synthetic-preflight-fixture',
      documentTitle: 'Synthetic fixture', accessedAt: '2026-11-04T00:00:00Z',
    },
    reviewDefaults: { verification: 'verified', reviewedAt: '2026-11-04', reviewer: 'Synthetic fixture' },
    items: [{
      itemKey: id, manufacturerModelCode: model, productType: 'lens',
      identity: { brand: 'Sony', model, name: 'Sony Synthetic Special Preflight', aliases: [], mount: 'Sony E', type },
      identityEvidence: { locator },
      observations: rows.map(([path, rawValue, rawUnit, conditions]) => ({ path, rawValue, rawUnit, conditions, locator, field: path })),
    }],
  });
  const identityMap = { entries: [{ manufacturer: 'Sony', manufacturerModelCode: model, productId: id, productType: 'lens', reviewedAliases: [] }] };
  const [staging] = normalizeRawDocument(raw, { batchId: 'synthetic-special-preflight', vocab, identityMap });
  const validation = validateStagingBatch([staging], { canonical, vocab, rawDocuments: new Map([[raw.sourceId, raw]]) });
  return { staging, validation, diff: () => createCanonicalDiff(staging, canonical) };
}

test('Macro and TC context survives normalization and diff without replacing native optical values', () => {
  const focus = { nativeMaximumMagnification: 1.4, withSEL20TCMaximumMagnification: 2.8, mode: 'unspecified' };
  const tc = { withSEL20TCFocalMm: 200 };
  const { staging, validation, diff } = fixture('prime', [
    ['specs.focal.min', 100, 'mm', tc],
    ['specs.focal.max', 100, 'mm', tc],
    ['specs.minFocusM', 0.26, 'm', focus],
    ['specs.formatCoverage', '35mm 풀프레임', null],
  ]);
  assert.deepEqual(validation.items[0].errors, []);
  assert.deepEqual(staging.product.specs.focal, { min: 100, max: 100 });
  assert.equal(staging.product.specs.maximumMagnification, undefined);
  assert.deepEqual(diff().changes.find(change => change.path === 'specs.minFocusM').incomingSource.conditions, focus);
  assert.deepEqual(diff().changes.find(change => change.path === 'specs.focal.max').incomingSource.conditions, tc);
});

test('A cine F-number stays numeric while T-stop stays in evidence and rear-only filter can stay unknown', () => {
  const tStop = { apertureBasis: 'geometric-f-number', maximumTransmissionTStop: 3.1 };
  const { staging, validation, diff } = fixture('zoom', [
    ['specs.focal.min', 16, 'mm'],
    ['specs.focal.max', 35, 'mm'],
    ['specs.aperture.wide', 2.8, null, tStop],
    ['specs.aperture.tele', 2.8, null, tStop],
    ['specs.filterMm', 'UNKNOWN', null, { attachment: 'rear-only', rearDiameterMm: 40.5 }],
  ]);
  assert.deepEqual(validation.items[0].errors, []);
  assert.deepEqual(staging.product.specs.aperture, { wide: 2.8, tele: 2.8 });
  assert.equal(staging.product.specs.filterMm, null);
  assert.deepEqual(diff().changes.find(change => change.path === 'specs.aperture.wide').incomingSource.conditions, tStop);
  const invalid = fixture('zoom', [['specs.aperture.wide', 'T3.1', null]]);
  assert.ok(invalid.validation.items[0].errors.some(error => error.code === 'INVALID_LENS_SPEC'));
});

test('Brightness comparison sees equal F-numbers despite a synthetic STF transmission difference', () => {
  const compareAperture = after => compareLens({ aperture: { wide: 2.8, tele: 2.8 } }, after)
    .find(row => row.key === 'aperture');
  assert.equal(compareAperture({
    aperture: { wide: 2.8, tele: 2.8 }, maximumTransmissionTStop: 5.6,
  }).status, 'maintained');
  assert.equal(compareAperture({ aperture: { wide: null, tele: null } }).status, 'unknown');
});
