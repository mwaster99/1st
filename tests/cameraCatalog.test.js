import test from "node:test";
import assert from "node:assert/strict";
import { CAMERA_PRODUCTS, LEGACY_CAMERA_POLICY, toLegacyPrice } from "../src/cameraCatalog.js";
import { CAMERA_BODIES, CAMERA_LENSES, BODY_BY_ID, LENS_BY_ID, getIntegratedLens, normalizeCameraSearch, searchCameraBodies, createUnknownBody, createUnknownLens } from "../src/cameraData.js";
import { CAMERA_ITEMS, CAMERA_DETAILS, calculateFunding, priceBand } from "../src/cameraCatalogViews.js";
import { FIRST_PURCHASE_SYSTEMS, rankFirstPurchaseSystems } from "../src/firstPurchaseEngine.js";
import { generateScenarioCandidates, generateLensCandidates, evaluateScenario, generateUpgradeScenarios } from "../src/cameraScenarioEngine.js";
import { compareCapability, compareLens, scoreRoleCoverage, scorePhotoVideo } from "../src/cameraComparisons.js";

const products = [...CAMERA_PRODUCTS.bodies, ...CAMERA_PRODUCTS.lenses];
const mounts = ["Sony E", "Canon RF", "Nikon Z", "Fujifilm X", "L-Mount", "Micro Four Thirds", "Canon EF", "Nikon F"];
const input = (extra = {}) => ({ currentBody: BODY_BY_ID["sony-a7-iv"], currentLenses: [LENS_BY_ID["sony-fe-24-70-gm2"]], primaryLens: LENS_BY_ID["sony-fe-24-70-gm2"], pains: ["더 가볍고 작은 카메라를 원해요"], subjects: ["여행 · 일상"], extraBudget: 300, ...extra });

test("canonical identifiers, model names and aliases are unique and searchable", () => {
  const ids = new Set(), names = new Map();
  for (const product of products) {
    assert.ok(product.id && product.name && product.brand);
    assert.ok(!ids.has(product.id), product.id); ids.add(product.id);
    for (const value of [product.name, ...(product.aliases || []), ...(product.model ? [product.model, `${product.brand} ${product.model}`] : [])]) {
      const key = normalizeCameraSearch(value);
      assert.ok(key);
      assert.ok(!names.has(key) || names.get(key) === product.id, `alias collision: ${value}`);
      names.set(key, product.id);
    }
  }
  for (const body of CAMERA_BODIES) assert.ok(searchCameraBodies(body.model).some((item) => item.id === body.id));
});

test("body and lens coverage, mount and exterior categories are valid", () => {
  assert.ok(CAMERA_BODIES.length >= 30 && CAMERA_BODIES.length <= 50);
  for (const mount of mounts.slice(0, 6)) {
    assert.ok(CAMERA_BODIES.some((body) => body.mount === mount));
    assert.ok(CAMERA_LENSES.filter((lens) => lens.mount === mount).length >= 6);
  }
  for (const body of CAMERA_BODIES) {
    assert.ok(body.model && body.series);
    assert.ok(["slr", "rangefinder", "compact"].includes(body.bodyStyle));
    assert.ok(["fixed", "dslr", "interchangeable"].includes(body.kind));
    assert.ok(body.kind === "fixed" ? body.mount === null : mounts.includes(body.mount));
  }
  for (const lens of CAMERA_LENSES) assert.ok(mounts.includes(lens.mount));
});

test("objective numbers are nonnegative, physical ranges ordered and missing values explicit", () => {
  const numbers = (value, path) => {
    if (typeof value === "number") assert.ok(Number.isFinite(value) && value >= 0, path);
    else if (value && typeof value === "object") for (const [key, child] of Object.entries(value)) numbers(child, `${path}.${key}`);
  };
  for (const product of products) {
    numbers(product.specs, product.id); numbers(product.price, product.id);
    if (product.specs.dimensions) assert.ok(product.specs.dimensions.length === 3 && product.specs.dimensions.every((n) => n > 0));
    if (product.specs.focal) assert.ok(product.specs.focal.min > 0 && product.specs.focal.max >= product.specs.focal.min);
    if (product.specs.aperture) assert.ok(product.specs.aperture.wide > 0 && product.specs.aperture.tele >= product.specs.aperture.wide);
    const used = product.price.used;
    for (const [a, b] of [[used.low, used.typical], [used.typical, used.high], [used.low, used.high]]) if (a !== null && b !== null) assert.ok(a <= b, product.id);
    for (const key of ["low", "typical", "high"]) assert.notEqual(used[key], undefined);
    for (const quote of [product.price.new, used]) {
      assert.equal(quote.currency, "KRW");
      assert.ok(["unknown", "legacy-unverified", "manufacturer", "retailer", "used-market"].includes(quote.sourceType));
      if (quote.sourceType === "unknown") assert.ok([quote.value, quote.low, quote.typical, quote.high].every((n) => n == null));
      if (!["unknown", "legacy-unverified"].includes(quote.sourceType)) assert.ok(quote.sourceUrl && /^\d{4}-\d{2}-\d{2}$/.test(quote.asOf));
    }
  }
});

test("source records identify verified fields; historical scores stay outside objective DB", () => {
  const objectiveKeys = ["weight", "dimensions", "sensor", "mount", "model", "newPrice", "usedPrice", "price"];
  for (const policy of [...Object.values(LEGACY_CAMERA_POLICY.bodies), ...Object.values(LEGACY_CAMERA_POLICY.lenses), ...LEGACY_CAMERA_POLICY.firstPurchase, ...Object.values(LEGACY_CAMERA_POLICY.additional)]) {
    for (const key of objectiveKeys) assert.ok(!(key in policy), `duplicated objective field in policy: ${key}`);
  }
  for (const product of products) {
    assert.ok(product.sources.length || product.legacyFields.length, product.id);
    assert.ok(!("photoScore" in product) && !("roles" in product.specs) && !("designTags" in product));
    for (const source of product.sources) {
      assert.equal(source.type, "manufacturer");
      assert.ok(new URL(source.url).protocol === "https:");
      assert.match(source.accessedOn, /^\d{4}-\d{2}-\d{2}$/);
      assert.ok(source.fields.length);
      for (const field of source.fields) if (field !== "identity") assert.notEqual(field.split(".").reduce((value, key) => value?.[key], product), undefined, `${product.id}: ${field}`);
    }
  }
  for (const body of CAMERA_BODIES) if (!LEGACY_CAMERA_POLICY.bodies[body.id]?.useTags) {
    assert.equal(body.useTags, null); assert.equal(body.photoScore, null);
    assert.equal(scoreRoleCoverage(["인물"], body, [CAMERA_LENSES[0]]), null);
    assert.equal(scorePhotoVideo("사진 100%", body, [CAMERA_LENSES[0]]), null);
  }
  for (const lens of CAMERA_LENSES) if (!LEGACY_CAMERA_POLICY.lenses[lens.id]) assert.equal(lens.roles, null);
});

test("all three flows share canonical weight and price values", () => {
  assert.equal(CAMERA_ITEMS.length, CAMERA_BODIES.length);
  for (const body of CAMERA_BODIES) {
    const detail = CAMERA_DETAILS[body.name];
    assert.equal(detail.newPrice, body.newPrice); assert.equal(detail.usedPrice, body.usedPrice);
    assert.equal(detail.weight, body.weight === null ? "무게 미확인" : `${body.weight}g`);
    assert.equal(CAMERA_ITEMS.find((item) => item.id === body.id).price, priceBand(body.newPrice));
  }
  for (const system of FIRST_PURCHASE_SYSTEMS) {
    const body = BODY_BY_ID[system.bodyId], lens = LENS_BY_ID[system.defaultLensId];
    assert.equal(system.bodyWeight, body.weight); assert.equal(system.bodyNew, body.newPrice); assert.equal(system.bodyUsed, body.usedPrice);
    assert.equal(system.lensNew, lens?.newPrice ?? 0); assert.equal(system.lensUsed, lens?.usedPrice ?? 0);
  }
  assert.equal(BODY_BY_ID["nikon-z6-iii"].weight, 760);
  assert.equal(LENS_BY_ID["canon-rf-24-50"].stabilization, true);
});

test("KRW conversion and funding never coerce unknown prices to free purchases", () => {
  assert.equal(toLegacyPrice({ value: 1230000, currency: "KRW" }, "value"), 123);
  for (const quote of [{ value: null, currency: "KRW" }, { value: 100, currency: "USD" }, { value: -1, currency: "KRW" }]) assert.equal(toLegacyPrice(quote, "value"), null);
  assert.deepEqual(calculateFunding(null, 0, 10), { shortfall: null, months: null });
  assert.deepEqual(calculateFunding(150, 50, 10), { shortfall: 100, months: 10 });
  assert.deepEqual(calculateFunding(100, 200, 10), { shortfall: 0, months: 0 });
  assert.equal(calculateFunding(100, -1, 10).shortfall, null);
});

test("first purchase uses available condition prices and actual owned-lens costs", () => {
  const preset = FIRST_PURCHASE_SYSTEMS[0];
  const answers = { condition: "신품·중고 모두 고려", budget: 1000 };
  assert.equal(rankFirstPurchaseSystems(answers, { systems: [{ ...preset, bodyNew: null }] })[0].priceType, "중고");
  assert.equal(rankFirstPurchaseSystems(answers, { systems: [{ ...preset, bodyUsed: null }] })[0].priceType, "신품");
  assert.deepEqual(rankFirstPurchaseSystems(answers, { systems: [{ ...preset, bodyNew: null, bodyUsed: null }] }), []);
  const owned = LENS_BY_ID[preset.defaultLensId];
  const result = rankFirstPurchaseSystems(answers, { systems: [{ ...preset, bodyNew: 100, bodyUsed: 120, lensNew: 100, lensUsed: 10 }], ownedLenses: [owned] })[0];
  assert.equal(result.priceType, "신품"); assert.equal(result.total, 100);
});

test("expanded same/cross mount and fixed candidates are generated without guessing unknown prices", () => {
  const raw = generateScenarioCandidates(input());
  for (const body of CAMERA_BODIES.filter((body) => body.kind !== "dslr")) assert.ok(raw.some((s) => s.targetSystem.body.id === body.id), body.id);
  for (const scenario of raw) for (const lens of scenario.targetSystem.lenses) assert.ok(lens.includedInBodyId === scenario.targetSystem.body.id || lens.mount === scenario.targetSystem.body.mount);
  const sigma = raw.find((s) => s.targetSystem.body.brand === "Sigma");
  const result = evaluateScenario(sigma, input());
  assert.equal(result.cost.additionalCost, null); assert.ok(result.cost.buyValue.missing.length);
  assert.ok(Number.isFinite(result.scores.total));
});

test("fixed lenses are bundled once in trading and weight, and never interchangeable", () => {
  const body = BODY_BY_ID["ricoh-gr-iiix"], lens = getIntegratedLens(body);
  assert.equal(lens.weight, null); assert.equal(lens.usedPrice, null);
  assert.deepEqual(generateLensCandidates({ body }).map((l) => l.id), [lens.id]);
  const args = input({ currentBody: body, currentLenses: [lens], primaryLens: lens, lensIntent: "가능하면 전부 유지" });
  const raw = generateScenarioCandidates(args);
  const hold = evaluateScenario(raw.find((s) => s.kind === "hold"), args);
  assert.deepEqual(hold.keep.map((item) => item.id), [body.id]);
  assert.equal(hold.weight.before, 262); assert.equal(hold.cost.additionalCost, 0); assert.equal(hold.lensCount.before, 0);
  assert.ok(raw.some((s) => s.targetSystem.body.mount === "Sony E"));
  const target = evaluateScenario(generateScenarioCandidates(input()).find((s) => s.targetSystem.body.id === body.id), input());
  assert.deepEqual(target.buy.map((item) => item.id), [body.id]); assert.equal(target.cost.buyValue.known, body.usedPrice); assert.equal(target.weight.after, 262);
  const protectedLenses = generateScenarioCandidates(input({ lensIntent: "가능하면 전부 유지" }));
  assert.ok(!protectedLenses.some((s) => s.targetSystem.body.kind === "fixed"));
  const focal = compareLens(lens, lens, [], body, body).find((m) => m.key === "focal");
  assert.match(focal.summary, /40–40mm/);
  const otherFixed = evaluateScenario(raw.find((s) => s.targetSystem.body.id === "fujifilm-x100vi"), args);
  assert.equal(otherFixed.evaluation.transactionPenalty, 3.2, "different fixed cameras share no lens mount despite both mount values being null");
});

test("production Sony fixed-lens bodies retain integrated optics without a second product or weight", () => {
  const candidates = generateScenarioCandidates(input());
  for (const id of ["sony-rx10-v", "sony-rx1r-iii", "sony-rx100-vii"]) {
    const body = BODY_BY_ID[id];
    assert.equal(body.kind, "fixed"); assert.equal(body.mount, null);
    assert.ok(body.specs.fixedLens);
    assert.ok(!CAMERA_LENSES.some((lens) => lens.id === `${id}-integrated-lens`));
    const lens = getIntegratedLens(body);
    assert.equal(lens.includedInBodyId, id);
    assert.equal(lens.weight, null); assert.equal(lens.newPrice, null); assert.equal(lens.usedPrice, null);
    assert.deepEqual(generateLensCandidates({ body }).map((item) => item.id), [lens.id]);
    const candidate = candidates.find((item) => item.targetSystem.body.id === id);
    const evaluated = evaluateScenario(candidate, input());
    assert.deepEqual(evaluated.buy.map((item) => item.id), [id]);
    assert.equal(evaluated.weight.after, body.weight);
    assert.equal(evaluated.lensCount.after, 0);
  }
  const rx10 = BODY_BY_ID["sony-rx10-v"].specs.fixedLens;
  assert.deepEqual(rx10.focal, { min: 9.1, max: 210 });
  assert.deepEqual(rx10.equivalentFocal, { min: 24, max: 600 });
  const rx1r = BODY_BY_ID["sony-rx1r-iii"].specs.fixedLens;
  assert.equal(rx1r.focal.min, rx1r.focal.max);
  assert.equal(rx1r.aperture.wide, rx1r.aperture.tele);
  assert.equal(rx1r.equivalentFocal, undefined);
});

test("unregistered gear still produces an honest hold with unknown comparisons", () => {
  const body = createUnknownBody("미등록 바디"), lens = createUnknownLens("미등록 렌즈");
  const result = generateUpgradeScenarios(input({ currentBody: body, currentLenses: [lens], primaryLens: lens }));
  assert.equal(result[0].kind, "hold"); assert.equal(result[0].weight.before, null);
  assert.equal(result[0].capability.wanted[0].status, "unknown");
});

test("one-inch fixed cameras preserve the existing sensor comparison ordering", () => {
  const fullFrame = BODY_BY_ID["sigma-bf"], oneInch = BODY_BY_ID["sony-rx100-vii"];
  assert.equal(compareCapability("imageQuality", fullFrame, oneInch).status, "degraded");
  assert.equal(compareCapability("imageQuality", oneInch, fullFrame).status, "improved");
  const args = input({ preserve: ["화질"] });
  const scenario = generateScenarioCandidates(args).find((s) => s.targetSystem.body.id === oneInch.id);
  assert.ok(evaluateScenario(scenario, args).capability.violations.some((v) => v.key === "imageQuality"));
});
