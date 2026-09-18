import test from "node:test";
import assert from "node:assert/strict";
import {
  CAMERA_BODIES,
  CAMERA_LENSES,
  createUnknownBody,
  createUnknownLens,
} from "../src/cameraData.js";
import {
  buildScenarioExplanation,
  compareCapability,
  compareLens,
  evaluateScenario,
  generateScenarioCandidates,
  generateUpgradeScenarios,
  scoreRoleCoverage,
  selectDiverseTopScenarios,
} from "../src/cameraScenarioEngine.js";

const bodyById = (id) => CAMERA_BODIES.find((body) => body.id === id);
const lensById = (id) => CAMERA_LENSES.find((lens) => lens.id === id);
const sonyBody = bodyById("sony-a7-iv");
const heavyZoom = lensById("sony-fe-24-70-gm2");
const portabilityGoal = "더 가볍고 작은 카메라를 원해요";
const autofocusGoal = "AF가 더 좋아졌으면 해요";

function inputWith(overrides = {}) {
  return {
    currentBody: sonyBody,
    currentLenses: [heavyZoom],
    primaryLens: heavyZoom,
    pains: [portabilityGoal],
    portabilityDetails: ["렌즈 무게", "전체 부피"],
    preserve: [],
    subjects: ["여행 · 일상"],
    ratio: "사진 80% / 영상 20%",
    lensIntent: "렌즈까지 전부 바꿔도 괜찮음",
    brandIntent: "브랜드 상관없음",
    extraBudget: 200,
    designPreference: "any",
    ...overrides,
  };
}

const scoredCandidates = (input, catalog) => generateScenarioCandidates(input, catalog)
  .map((scenario) => evaluateScenario(scenario, input));

function syntheticBody(id, overrides = {}) {
  return {
    ...sonyBody,
    id,
    name: id,
    model: id,
    brand: "Test",
    mount: "Test mount",
    weight: 650,
    usedPrice: 100,
    newPrice: 150,
    designTags: ["slr"],
    ...overrides,
  };
}

function syntheticLens(id, overrides = {}) {
  return {
    ...heavyZoom,
    id,
    name: id,
    brand: "Test",
    mount: "Test mount",
    weight: 400,
    usedPrice: 50,
    newPrice: 70,
    ...overrides,
  };
}

test("CASE A: heavy Sony kit considers every available brand and presents a useful Fujifilm alternative", () => {
  const input = inputWith();
  const raw = generateScenarioCandidates(input);
  const candidateBrands = new Set(raw.map((scenario) => scenario.targetSystem.body.brand));
  for (const brand of ["Sony", "Fujifilm", "Canon", "Nikon", "Panasonic"]) {
    assert.ok(candidateBrands.has(brand), `${brand} must reach scenario evaluation`);
  }
  assert.ok(raw.some((scenario) => scenario.kind === "same-mount-body"), "permission to replace lenses does not remove a lens-retention alternative");
  assert.ok(raw.some((scenario) => scenario.kind === "same-mount-system"));
  assert.ok(raw.some((scenario) => scenario.kind === "lens-only"));
  assert.ok(raw.every((scenario) => !scenario.scores), "candidate creation must not rank candidates before systems are complete");

  const result = generateUpgradeScenarios(input);
  assert.ok(result.length >= 2 && result.length <= 4);
  assert.ok(result.some((scenario) => scenario.kind === "hold"));
  assert.ok(result.some((scenario) => scenario.kind !== "hold" && scenario.targetSystem.body.brand === "Sony"));
  const fuji = result.find((scenario) => scenario.targetSystem.body.brand === "Fujifilm");
  assert.ok(fuji, "a competitive lightweight Fujifilm system should survive final diversity selection");
  assert.ok(fuji.weight.after < fuji.weight.before);
  assert.equal(fuji.capability.wanted.find((metric) => metric.key === "portability").status, "improved");
  assert.ok(!fuji.capability.violations.length);
});

test("CASE B: current-brand-only prevents cross-brand candidates and final results", () => {
  const input = inputWith({ brandIntent: "현재 브랜드만" });
  for (const scenario of [...generateScenarioCandidates(input), ...generateUpgradeScenarios(input)]) {
    assert.equal(scenario.targetSystem.body.brand, "Sony");
  }
});

test("a lens-weight complaint rewards meaningful system reduction over a lighter body retaining the heavy lens", () => {
  const scenarios = scoredCandidates(inputWith({ portabilityDetails: ["렌즈 무게"] }));
  const bodyOnly = scenarios.find((scenario) => scenario.kind === "same-mount-body" && scenario.targetSystem.body.id === "sony-a7c-ii");
  const lensOnly = scenarios.find((scenario) => scenario.kind === "lens-only" && scenario.targetSystem.primaryLens.id === "sony-fe-28-60");
  assert.ok(bodyOnly && lensOnly);
  assert.equal(bodyOnly.weight.after, bodyById("sony-a7c-ii").weight + heavyZoom.weight);
  assert.ok(lensOnly.weight.after < bodyOnly.weight.after);
  assert.ok(lensOnly.scores.objective > bodyOnly.scores.objective, "the goal is resolved by the whole representative kit, not just body mass");
});

test("current-brand-only still permits another mount belonging to that brand", () => {
  const currentBody = syntheticBody("current");
  const currentLens = syntheticLens("owned");
  const otherMountBody = syntheticBody("other-mount", { mount: "Test alternate", weight: 400 });
  const otherMountLens = syntheticLens("alternate-lens", { mount: "Test alternate", weight: 180 });
  const input = inputWith({ currentBody, currentLenses: [currentLens], primaryLens: currentLens, brandIntent: "현재 브랜드만" });
  const raw = generateScenarioCandidates(input, { bodies: [currentBody, otherMountBody], lenses: [currentLens, otherMountLens] });
  assert.ok(raw.some((scenario) => scenario.targetSystem.body.id === otherMountBody.id));
});

test("CASE C: lens-only weight reduction cannot count as AF improvement", () => {
  const input = inputWith({ pains: [autofocusGoal], portabilityDetails: [] });
  const scenarios = scoredCandidates(input);
  const lensOnly = scenarios.filter((scenario) => scenario.kind === "lens-only");
  assert.ok(lensOnly.length, "lens-only strategies are evaluated even when the desired change is not portability");
  for (const scenario of lensOnly) {
    assert.equal(scenario.capability.wanted.find((metric) => metric.key === "autofocus").status, "maintained");
  }
  const afUpgrade = scenarios.find((scenario) => scenario.targetSystem.body.id === "sony-a7c-ii" && scenario.capability.wanted.some((metric) => metric.key === "autofocus" && metric.status === "improved"));
  assert.ok(afUpgrade);
  assert.ok(lensOnly.every((scenario) => scenario.scores.objective < afUpgrade.scores.objective));
  assert.notEqual(generateUpgradeScenarios(input)[0].kind, "lens-only");
  assert.match(buildScenarioExplanation(afUpgrade, input.extraBudget)[0], /AF|인식|자동.*초점/);
});

test("CASE D: rangefinder preference breaks comparable ties with a bounded soft bonus", () => {
  const currentBody = syntheticBody("current");
  const lens = syntheticLens("owned");
  const slr = syntheticBody("slr-candidate", { weight: 350, usedPrice: 150, designTags: ["slr"] });
  const rangefinder = syntheticBody("rangefinder-candidate", { weight: 350, usedPrice: 150, designTags: ["rangefinder"] });
  const catalog = { bodies: [currentBody, slr, rangefinder], lenses: [lens] };
  const input = inputWith({ currentBody, currentLenses: [lens], primaryLens: lens, portabilityDetails: ["바디 무게"] });
  const neutral = scoredCandidates(input, catalog);
  const preferred = scoredCandidates({ ...input, designPreference: "rangefinder" }, catalog);
  const scoreFor = (scenarios, id) => Math.max(...scenarios.filter((scenario) => scenario.targetSystem.body.id === id).map((scenario) => scenario.scores.total));

  assert.equal(scoreFor(neutral, slr.id), scoreFor(neutral, rangefinder.id), "any must not favor a design tag");
  assert.ok(scoreFor(preferred, rangefinder.id) > scoreFor(preferred, slr.id));
  assert.ok(scoreFor(preferred, rangefinder.id) - scoreFor(neutral, rangefinder.id) <= 3, "design cannot dominate the primary decision");
  const multiple = scoredCandidates({ ...input, designPreference: ["slr", "rangefinder"] }, catalog);
  assert.ok(scoreFor(multiple, rangefinder.id) - scoreFor(neutral, rangefinder.id) <= 3, "multiple matches must not stack the design bonus");
  assert.ok(scoreFor(multiple, slr.id) - scoreFor(neutral, slr.id) <= 3, "each acceptable style keeps the original bonus ceiling");
  assert.equal(generateUpgradeScenarios({ ...input, designPreference: "rangefinder" }, catalog)[0].targetSystem.body.id, rangefinder.id);

  const inferior = { ...rangefinder, weight: 1100, usedPrice: 1000 };
  const poorMatch = generateUpgradeScenarios({ ...input, designPreference: "rangefinder" }, { bodies: [currentBody, slr, inferior], lenses: [lens] });
  assert.equal(poorMatch[0].targetSystem.body.id, slr.id, "a much heavier and more expensive style match must not win");
});

test("CASE E: unknown lens mass and sale value remain unknown through evaluation", () => {
  const unknownLens = createUnknownLens("직접 입력 렌즈", sonyBody.mount);
  assert.equal(unknownLens.weight, null);
  assert.equal(unknownLens.usedPrice, null);
  const input = inputWith({ currentLenses: [unknownLens], primaryLens: unknownLens });
  const scenarios = scoredCandidates(input);
  assert.ok(scenarios.length);
  for (const scenario of scenarios) {
    assert.equal(scenario.weight.before, null);
    assert.equal(scenario.weight.difference, null);
    assert.equal(scenario.weight.percent, null);
    if (scenario.sell.some((item) => item.id === unknownLens.id)) {
      assert.equal(scenario.cost.additionalCost, null);
      assert.ok(scenario.cost.sellValue.missing.includes(unknownLens.name));
    }
    if (scenario.targetSystem.primaryLens.id === unknownLens.id) assert.equal(scenario.weight.after, null);
    assert.notEqual(scenario.capability.wanted.find((metric) => metric.key === "portability").status, "degraded");
  }
  const hold = scenarios.find((scenario) => scenario.kind === "hold");
  assert.equal(hold.cost.additionalCost, 0, "not transacting costs zero even when the retained equipment price is unknown");
});

test("CASE F: negligible benefit at substantial additional cost ranks below keeping the current system", () => {
  const currentBody = syntheticBody("current");
  const currentLens = syntheticLens("owned");
  const expensiveBody = syntheticBody("costly-near-equivalent", { weight: 645, usedPrice: 1000 });
  const input = inputWith({ currentBody, currentLenses: [currentLens], primaryLens: currentLens, extraBudget: 100, portabilityDetails: ["바디 무게"] });
  const catalog = { bodies: [currentBody, expensiveBody], lenses: [currentLens] };
  const raw = generateScenarioCandidates(input, catalog);
  assert.ok(raw.some((scenario) => scenario.targetSystem.body.id === expensiveBody.id), "the poor option is evaluated rather than silently omitted by a product shortcut");
  assert.equal(generateUpgradeScenarios(input, catalog)[0].kind, "hold");
});

test("KEEP/SELL/BUY are disjoint ownership transitions with unique target lenses", () => {
  const ownedLightLens = lensById("sony-fe-40-g");
  const ownedTelephoto = lensById("sony-fe-70-200-gm2");
  const input = inputWith({ currentLenses: [heavyZoom, ownedLightLens, ownedTelephoto], lensIntent: "쓸 만한 렌즈는 유지" });
  const raw = generateScenarioCandidates(input);
  assert.ok(raw.some((scenario) => scenario.kind === "lens-only" && scenario.targetSystem.primaryLens.id === ownedLightLens.id), "switching to an already owned lens is a real option");
  for (const scenario of raw) {
    const currentIds = new Set([scenario.currentSystem.body, ...scenario.currentSystem.lenses.filter((lens) => !lens.includedInBodyId)].map((item) => item.id));
    const targetItems = [scenario.targetSystem.body, ...scenario.targetSystem.lenses.filter((lens) => !lens.includedInBodyId)];
    const targetIds = new Set(targetItems.map((item) => item.id));
    assert.equal(targetIds.size, targetItems.length, `${scenario.id}: duplicate target gear`);
    const groups = [scenario.keep, scenario.sell, scenario.buy].map((items) => new Set(items.map((item) => item.id)));
    assert.equal(new Set(groups.flatMap((group) => [...group])).size, groups.reduce((sum, group) => sum + group.size, 0), `${scenario.id}: an item appears in incompatible actions`);
    assert.deepEqual(groups[0], new Set([...currentIds].filter((id) => targetIds.has(id))), `${scenario.id}: KEEP must be current ∩ target`);
    assert.deepEqual(groups[1], new Set([...currentIds].filter((id) => !targetIds.has(id))), `${scenario.id}: SELL must be current − target`);
    assert.deepEqual(groups[2], new Set([...targetIds].filter((id) => !currentIds.has(id))), `${scenario.id}: BUY must be target − current`);
    if (scenario.targetSystem.primaryLens.id === ownedLightLens.id) assert.ok(!groups[2].has(ownedLightLens.id));
  }
});

test("unknown preservation data never becomes a constraint violation", () => {
  const input = inputWith({ preserve: ["AF", "조작성 · 그립", "색감", "튼튼함"] });
  const fuji = scoredCandidates(input).find((scenario) => scenario.targetSystem.body.brand === "Fujifilm");
  assert.ok(fuji);
  const unknownAF = fuji.capability.constraints.find((metric) => metric.key === "autofocus");
  assert.equal(unknownAF.status, "unknown");
  assert.ok(!fuji.capability.violations.some((metric) => ["autofocus", "handling", "color", "durability"].includes(metric.key)));
});

test("a known preserve regression is penalized rather than forced into final diversity", () => {
  const input = inputWith({ preserve: ["화질"] });
  const candidates = scoredCandidates(input);
  const fuji = candidates.find((scenario) => scenario.targetSystem.body.id === "fujifilm-x-e4");
  const sony = candidates.find((scenario) => scenario.kind !== "hold" && scenario.targetSystem.body.id === "sony-a7c-ii" && scenario.capability.wanted.some((metric) => metric.status === "improved"));
  const hold = candidates.find((scenario) => scenario.kind === "hold");
  assert.ok(fuji.capability.violations.some((metric) => metric.key === "imageQuality"));
  assert.ok(fuji.scores.total < sony.scores.total);
  const selected = selectDiverseTopScenarios([sony, fuji, hold], 4);
  assert.ok(!selected.some((scenario) => scenario.id === fuji.id), "a clearly violating cross-brand option must not fill a diversity slot");
  assert.ok(selected.some((scenario) => scenario.kind === "hold"));
});

test("mixed sensor-size and resolution changes do not establish overall image-quality regression", () => {
  const metric = compareCapability("imageQuality", sonyBody, bodyById("fujifilm-x-t5"));
  assert.equal(metric.status, "unknown", "smaller sensor with higher resolution is a tradeoff, not evidence of overall image-quality loss");
  const input = inputWith({ preserve: ["화질"] });
  const scenario = scoredCandidates(input).find((candidate) => candidate.targetSystem.body.id === "fujifilm-x-t5");
  assert.equal(scenario.capability.constraints.find((item) => item.key === "imageQuality").status, "unknown");
  assert.ok(!scenario.capability.violations.some((item) => item.key === "imageQuality"));
});

test("cross-brand diversity does not force an option with no known improvement of the user's goal", () => {
  const input = inputWith({ pains: [autofocusGoal], portabilityDetails: [] });
  const candidates = scoredCandidates(input);
  const unknownCross = candidates.find((scenario) => scenario.targetSystem.body.brand === "Fujifilm");
  const sony = candidates.find((scenario) => scenario.targetSystem.body.id === "sony-a7c-ii");
  const hold = candidates.find((scenario) => scenario.kind === "hold");
  assert.equal(unknownCross.capability.wanted.find((metric) => metric.key === "autofocus").status, "unknown");
  const selected = selectDiverseTopScenarios([sony, unknownCross, hold], 4);
  assert.ok(!selected.some((scenario) => scenario.id === unknownCross.id));
  assert.ok(selected.some((scenario) => scenario.kind === "hold"));
});

test("lens angle of view compares 35mm equivalents across sensor formats", () => {
  const fullFrame = syntheticBody("ff", { sensor: { format: "풀프레임", megapixels: 24 } });
  const apsc = syntheticBody("apsc", { sensor: { format: "APS-C", megapixels: 24 } });
  const before = syntheticLens("ff-lens", { focal: { min: 24, max: 75 } });
  const after = syntheticLens("apsc-lens", { focal: { min: 16, max: 50 } });
  const focal = compareLens(before, after, ["여행 · 일상"], fullFrame, apsc).find((metric) => metric.key === "focal");
  assert.equal(focal.status, "maintained", "24–75mm FF and 16–50mm APS-C cover equal angles of view");
  const unknownFocal = compareLens(before, after, ["여행 · 일상"], fullFrame, createUnknownBody("sensor unknown")).find((metric) => metric.key === "focal");
  assert.equal(unknownFocal.status, "unknown");
});

test("missing role and future capability data stay unknown", () => {
  const body = createUnknownBody("unknown camera");
  const lens = createUnknownLens("unknown lens");
  assert.equal(scoreRoleCoverage(["여행 · 일상"], body, [lens]), null);
  const lensRoles = compareLens(lens, heavyZoom, ["여행 · 일상"], body, sonyBody).find((metric) => metric.key === "roles");
  assert.equal(lensRoles.status, "unknown");
  for (const key of ["lowLight", "versatility"]) assert.equal(compareCapability(key, sonyBody, bodyById("sony-a7c-ii")).status, "unknown");
});

test("every scenario exposes structured, valid change statuses", () => {
  const allowed = new Set(["improved", "maintained", "degraded", "unknown"]);
  for (const scenario of scoredCandidates(inputWith())) {
    assert.ok(Array.isArray(scenario.changes) && scenario.changes.length);
    assert.ok(scenario.bodyWeight);
    assert.ok(scenario.lensCount);
    for (const change of scenario.changes) assert.ok(allowed.has(change.status), `${change.key}: unexpected status ${change.status}`);
  }
});

test("already owned light primary can be used without selling another useful lens", () => {
  const lightLens = lensById("sony-fe-40-g");
  const input = inputWith({ currentLenses: [heavyZoom, lightLens], lensIntent: "쓸 만한 렌즈는 유지", portabilityDetails: ["렌즈 무게"] });
  const scenario = scoredCandidates(input).find((item) => item.targetSystem.body.id === sonyBody.id && item.targetSystem.primaryLens.id === lightLens.id && item.targetSystem.lenses.length === 2);
  assert.ok(scenario, "retaining both useful owned lenses must be considered");
  assert.equal(scenario.buy.length, 0);
  assert.equal(scenario.sell.length, 0);
  assert.equal(scenario.cost.additionalCost, 0);
  assert.equal(scenario.evaluation.tradeoffPenalty, 0, "a retained zoom's range has not been lost from the system");
  assert.equal(scenario.lensComparison.find((metric) => metric.key === "focal").scope, "representative");
  assert.ok(scenario.changes.some((metric) => metric.key === "lensRoles"));
  assert.ok(scenario.changes.some((metric) => metric.key === "roles"));
});

test("unknown body and lens with identical names have distinct ownership identities", () => {
  const body = createUnknownBody("동일 이름");
  const lens = createUnknownLens("동일 이름");
  assert.notEqual(body.id, lens.id);
  const input = inputWith({ currentBody: body, currentLenses: [lens], primaryLens: lens });
  const hold = scoredCandidates(input).find((scenario) => scenario.kind === "hold");
  assert.equal(hold.targetSystem.body.id, body.id);
  assert.equal(hold.targetSystem.primaryLens.id, lens.id);
  assert.equal(hold.keep.length, 2);
  assert.equal(hold.weight.before, null);
  assert.equal(hold.weight.after, null);
});

test("missing media evidence does not erase a known change in role coverage", () => {
  const body = syntheticBody("current", { videoScore: null });
  const lens = syntheticLens("owned");
  const unsuitableLens = syntheticLens("poor-role", { roles: [], weight: 150 });
  const input = inputWith({ currentBody: body, currentLenses: [lens], primaryLens: lens, portabilityDetails: ["렌즈 무게"] });
  const scenario = scoredCandidates(input, { bodies: [body], lenses: [lens, unsuitableLens] }).find((item) => item.targetSystem.lenses.length === 1 && item.targetSystem.primaryLens.id === unsuitableLens.id);
  assert.equal(scenario.evaluation.mediaChange, null);
  assert.equal(scenario.evaluation.subjectChange, -100);
  assert.equal(scenario.scores.usage, null);
});
