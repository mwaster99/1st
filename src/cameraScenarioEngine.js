import { CAMERA_BODIES, CAMERA_LENSES } from "./cameraData.js";
import { scoreDesignPreference } from "./cameraDesign.js";
import { clamp, percentChange, compareNumber, compareCapability, compareLens, scoreRoleCoverage, scorePhotoVideo, unknownCapability } from "./cameraComparisons.js";
export { CAPABILITY_LABEL, RATIO_WEIGHTS, compareCapability, compareLens, scoreRoleCoverage } from "./cameraComparisons.js";

export const REASON_CAPABILITY = {
  "더 가볍고 작은 카메라를 원해요": "portability", "화질을 더 높이고 싶어요": "imageQuality",
  "AF가 더 좋아졌으면 해요": "autofocus", "영상 성능을 높이고 싶어요": "video",
  "배터리가 오래 갔으면 해요": "battery", "렌즈 선택지가 아쉬워요": "lensEcosystem",
  "새로운 촬영 경험이 필요해요": "experience", "저조도 성능을 높이고 싶어요": "lowLight", "범용적으로 쓰고 싶어요": "versatility",
};
export const PRESERVE_CAPABILITY = { 화질: "imageQuality", AF: "autofocus", 배터리: "battery", 영상: "video", "렌즈 선택지": "lensEcosystem", "조작성 · 그립": "handling", 색감: "color", 튼튼함: "durability", 저조도: "lowLight", 범용성: "versatility" };

// Ranking utility, not a measured satisfaction percentage. Goals dominate preferences.
// Unknown evidence contributes no gain or loss; the displayed score stays null.
export const SCORING_WEIGHTS = Object.freeze({ objective: 0.35, usage: 0.1, preservationPenalty: 35, designMax: 3, brandPreferenceMax: 1 });
const KEEP_ALL = "가능하면 전부 유지";
const KEEP_USEFUL = "쓸 만한 렌즈는 유지";
const PREFER_BRAND = "가능하면 유지 · 다른 브랜드도 가능";
const BRAND_ONLY = "현재 브랜드만";
const uniqueItems = (items) => [...new Map(items.map((item) => [item.id, item])).values()];
const uniqueKeys = (items) => [...new Set(items.filter(Boolean))];
const defaultCatalog = { bodies: CAMERA_BODIES, lenses: CAMERA_LENSES };

export function analyzeUserIntent(input) {
  const pains = input.pains || [], preserve = input.preserve || [], details = input.portabilityDetails || [];
  const wanted = uniqueKeys(pains.map((pain) => REASON_CAPABILITY[pain]));
  const portability = wanted.includes("portability");
  if (portability && details.includes("전체 부피")) wanted.push("systemVolume");
  return {
    wanted, preserve: uniqueKeys(preserve.map((item) => PRESERVE_CAPABILITY[item])),
    subjects: uniqueKeys(input.subjects || []), ratio: input.ratio || "사진 50% / 영상 50%",
    portability, lensWeightFocus: portability && details.includes("렌즈 무게"), bodyWeightFocus: portability && details.includes("바디 무게"),
    strongPortability: portability && details.some((detail) => ["렌즈 무게", "전체 부피", "가방에 넣기 어려움", "장시간 들고 다니기 힘듦"].includes(detail)),
    brandOnly: input.brandIntent === BRAND_ONLY, preferBrand: input.brandIntent === PREFER_BRAND,
    keepAllLenses: input.lensIntent === KEEP_ALL, keepUsefulLenses: input.lensIntent === KEEP_USEFUL,
    designPreference: input.designPreference || "any",
    budget: Number.isFinite(Number(input.extraBudget)) && Number(input.extraBudget) >= 0 ? Number(input.extraBudget) : 0,
  };
}

// Generation never ranks, truncates to a preferred brand, or filters on design.
export function generateBodyCandidates({ currentBody, brandIntent }, catalog = defaultCatalog) {
  return catalog.bodies.filter((body) => body.id !== currentBody.id && (brandIntent !== BRAND_ONLY || body.brand === currentBody.brand));
}

export function generateLensCandidates({ body, currentLenses = [] }, catalog = defaultCatalog) {
  if (!body.mount) return [];
  return uniqueItems([...catalog.lenses, ...currentLenses]).filter((lens) => lens.mount && lens.mount === body.mount);
}

function usefulLens(lens, subjects) {
  return lens.dataStatus === "unknown" || !subjects.length || (lens.roles || []).some((role) => subjects.includes(role));
}

// A single identity can occupy exactly one transition column; existing copies are reused.
export function buildEquipmentTransition(currentSystem, proposedSystem) {
  const current = uniqueItems([currentSystem.body, ...currentSystem.lenses]);
  const owned = new Map(current.map((item) => [item.id, item]));
  const body = owned.get(proposedSystem.body.id) || proposedSystem.body;
  const lenses = uniqueItems(proposedSystem.lenses).map((lens) => owned.get(lens.id) || lens);
  const primaryLens = lenses.find((lens) => lens.id === proposedSystem.primaryLens.id);
  if (!primaryLens) throw new Error("대표 렌즈는 목표 렌즈 구성에 포함되어야 합니다.");
  const target = [body, ...lenses];
  const targetIds = new Set(target.map((item) => item.id));
  return {
    targetSystem: { body, lenses, primaryLens },
    keep: current.filter((item) => targetIds.has(item.id)),
    sell: current.filter((item) => !targetIds.has(item.id)),
    buy: target.filter((item) => !owned.has(item.id)),
  };
}

function systemKey(system) {
  return `${system.body.id}|${system.lenses.map((lens) => lens.id).sort().join(",")}|${system.primaryLens.id}`;
}

export function generateScenarioCandidates(input, catalog = defaultCatalog) {
  const intent = analyzeUserIntent(input);
  if (!input.currentBody || !input.primaryLens || !input.currentLenses?.some((lens) => lens.id === input.primaryLens.id)) throw new Error("현재 바디와 보유 렌즈, 대표 렌즈를 등록해주세요.");
  const currentSystem = { body: input.currentBody, lenses: uniqueItems(input.currentLenses), primaryLens: input.primaryLens };
  const scenarios = [], seen = new Set();
  const add = (body, lenses, primaryLens) => {
    const transition = buildEquipmentTransition(currentSystem, { body, lenses, primaryLens });
    const key = systemKey(transition.targetSystem);
    if (seen.has(key)) return;
    seen.add(key);
    const bodyUnchanged = body.id === currentSystem.body.id;
    const unchanged = key === systemKey(currentSystem);
    const sameMount = body.mount && body.mount === currentSystem.body.mount;
    const lensTransition = transition.sell.some((item) => item.id !== currentSystem.body.id) || transition.buy.some((item) => item.id !== body.id) || primaryLens.id !== currentSystem.primaryLens.id;
    const kind = unchanged ? "hold" : bodyUnchanged ? "lens-only" : !sameMount ? "cross-mount-system" : lensTransition ? "same-mount-system" : "same-mount-body";
    const strategy = { hold: "현재 시스템 유지", "lens-only": "바디 유지 · 대표 렌즈 조정", "same-mount-body": "기존 렌즈 유지 · 바디 교체", "same-mount-system": "동일 마운트 시스템 재구성", "cross-mount-system": "전체 시스템 전환" }[kind];
    scenarios.push({ id: `scenario-${scenarios.length + 1}`, kind, strategy, purchaseCondition: "used", currentSystem, ...transition });
  };
  add(currentSystem.body, currentSystem.lenses, currentSystem.primaryLens);
  const bodies = [currentSystem.body, ...generateBodyCandidates(input, catalog)];
  for (const body of bodies) {
    const sameBody = body.id === currentSystem.body.id;
    const sameMount = Boolean(body.mount && body.mount === currentSystem.body.mount);
    if (sameBody || sameMount) add(body, currentSystem.lenses, currentSystem.primaryLens);
    if (!sameMount && !sameBody && intent.keepAllLenses) continue;
    if (!body.mount) continue; // Unknown mount cannot establish new lens compatibility.
    for (const lens of generateLensCandidates({ body, currentLenses: sameMount || sameBody ? currentSystem.lenses : [] }, catalog)) {
      if (!sameMount && !sameBody) { add(body, [lens], lens); continue; }
      // A different primary lens need not mean selling the former primary lens.
      // This also generates a no-transaction option when the lighter lens is already owned.
      add(body, [...currentSystem.lenses, lens], lens);
      if (intent.keepAllLenses) continue;
      // Permission to replace everything does not force sale of useful owned assets.
      add(body, [lens], lens);
      const useful = currentSystem.lenses.filter((owned) => owned.id !== currentSystem.primaryLens.id && usefulLens(owned, intent.subjects));
      add(body, [lens, ...useful], lens);
    }
  }
  return scenarios;
}

function sumPrice(items, field) {
  return { known: items.reduce((sum, item) => sum + (Number.isFinite(item[field]) ? item[field] : 0), 0), missing: items.filter((item) => !Number.isFinite(item[field])).map((item) => item.name) };
}
function combinationWeight(system) {
  return Number.isFinite(system.body.weight) && Number.isFinite(system.primaryLens.weight) ? system.body.weight + system.primaryLens.weight : null;
}
function weightChange(before, after) {
  return { before, after, difference: Number.isFinite(before) && Number.isFinite(after) ? after - before : null, percent: percentChange(after, before) };
}
function goalUtility(metric) {
  return metric.status === "improved" ? metric.strength || 0 : metric.status === "degraded" ? -(metric.strength || 0) : 0;
}

function portabilityGoal(current, target, intent) {
  const metric = compareCapability("portability", current.body, target.body, combinationWeight(current), combinationWeight(target));
  if (metric.status === "unknown") return metric;
  const targetReduction = intent.strongPortability ? 40 : 30;
  const reductions = [-metric.percent];
  const details = [...metric.details];
  for (const [focus, before, after, label] of [[intent.lensWeightFocus, current.primaryLens.weight, target.primaryLens.weight, "대표 렌즈"], [intent.bodyWeightFocus, current.body.weight, target.body.weight, "바디"]]) {
    if (!focus) continue;
    const change = percentChange(after, before);
    if (change === null) return unknownCapability("portability", "불편 원인으로 선택한 바디 또는 대표 렌즈의 무게가 미확인입니다.");
    reductions.push(-change);
    details.push(`${label} ${before}g → ${after}g (${change > 0 ? "+" : ""}${change}%)`);
  }
  const resolvedReduction = Math.min(...reductions);
  const status = resolvedReduction >= 1 ? "improved" : resolvedReduction <= -1 ? "degraded" : "maintained";
  return { ...metric, status, strength: clamp(Math.abs(resolvedReduction) / targetReduction * 100),
    summary: `${metric.summary}${intent.lensWeightFocus && target.primaryLens.weight === current.primaryLens.weight ? " · 렌즈 무게 불만은 남음" : intent.bodyWeightFocus && target.body.weight === current.body.weight ? " · 바디 무게 불만은 남음" : ""}`,
    details: [...details, "대표 조합과 선택한 불편 원인이 함께 개선되는 정도로 목표를 평가합니다. 점수는 실측 만족도가 아닙니다."] };
}

function assessCapabilities(current, target, intent) {
  const compare = (key) => key === "portability" ? portabilityGoal(current, target, intent) : compareCapability(key, current.body, target.body, combinationWeight(current), combinationWeight(target));
  const wanted = intent.wanted.map(compare);
  const constraints = intent.preserve.map(compare);
  const others = ["imageQuality", "autofocus", "video", "battery", "lensEcosystem", "portability"].filter((key) => !intent.wanted.includes(key) && !intent.preserve.includes(key)).map(compare);
  return { wanted, constraints, others, tradeoffs: others.filter((metric) => metric.status === "degraded"), violations: constraints.filter((metric) => metric.status === "degraded") };
}

export function evaluateScenario(base, input) {
  const intent = analyzeUserIntent(input), current = base.currentSystem, target = base.targetSystem;
  const sellValue = sumPrice(base.sell, "usedPrice"), buyValue = sumPrice(base.buy, base.purchaseCondition === "new" ? "newPrice" : "usedPrice");
  const netCost = sellValue.missing.length || buyValue.missing.length ? null : buyValue.known - sellValue.known;
  const cost = { sellValue, buyValue, additionalCost: netCost === null ? null : Math.max(0, netCost), netCost, releasedFunds: netCost === null ? null : Math.max(0, -netCost) };
  const weight = weightChange(combinationWeight(current), combinationWeight(target));
  const bodyWeight = weightChange(current.body.weight, target.body.weight);
  const capability = assessCapabilities(current, target, intent);
  const retainsPreviousPrimary = current.primaryLens.id !== target.primaryLens.id && target.lenses.some((lens) => lens.id === current.primaryLens.id);
  const lensComparison = compareLens(current.primaryLens, target.primaryLens, intent.subjects, current.body, target.body).map((metric) =>
    retainsPreviousPrimary && ["focal", "aperture", "roles"].includes(metric.key)
      ? { ...metric, label: `대표 휴대 조합 · ${metric.label}`, scope: "representative", details: [...metric.details, "기존 대표 렌즈도 보유하므로 필요할 때 다시 사용할 수 있습니다. 보유 시스템 전체에서 잃은 기능은 아닙니다."] }
      : metric);
  capability.tradeoffs.push(...lensComparison.filter((metric) => metric.status === "degraded" && ["focal", "aperture"].includes(metric.key) && !retainsPreviousPrimary));
  const coverage = { beforeSubjectScore: scoreRoleCoverage(intent.subjects, current.body, current.lenses), subjectScore: scoreRoleCoverage(intent.subjects, target.body, target.lenses), beforePhotoVideoScore: scorePhotoVideo(intent.ratio, current.body, current.lenses), photoVideoScore: scorePhotoVideo(intent.ratio, target.body, target.lenses) };
  const lensCount = { before: current.lenses.length, after: target.lenses.length, difference: target.lenses.length - current.lenses.length };
  const costChange = netCost === null ? unknownCapability("cost", "판매 또는 구매할 장비에 가격 미확인 항목이 있어 정확한 추가금을 계산하지 않습니다.", "추가 비용") : {
    key: "cost", label: "추가 비용", status: netCost > 0 ? "degraded" : netCost < 0 ? "improved" : "maintained", strength: 0,
    summary: netCost < 0 ? `추가금 0만원 · 판매 후 ${-netCost}만원 남음` : `추가금 ${netCost}만원`, details: [`판매 ${sellValue.known}만원 · 구매 ${buyValue.known}만원`, "중고 참고가 기준이며 거래 수수료 등은 제외합니다."] };
  const physicalWeight = compareCapability("portability", current.body, target.body, weight.before, weight.after);
  const changes = [
    ...capability.wanted, ...capability.constraints, ...capability.others,
    { ...physicalWeight, key: "systemWeight", label: "대표 조합 무게" },
    compareCapability("bodyWeight", current.body, target.body), compareCapability("bodyVolume", current.body, target.body),
    ...lensComparison.map((metric) => metric.key === "roles" ? { ...metric, key: "lensRoles" } : metric),
    { key: "lensCount", label: "보유 렌즈 수", status: lensCount.difference === 0 ? "maintained" : "unknown", strength: lensCount.difference === 0 ? 0 : null, summary: `${lensCount.before}개 → ${lensCount.after}개`, details: ["개수 변화는 확인했지만 증감 자체의 좋고 나쁨은 판단하지 않습니다. 휴대 무게는 대표 렌즈 기준입니다."] },
    compareNumber("roles", coverage.beforeSubjectScore, coverage.subjectScore, { unit: "%", scale: 100 }), costChange,
  ];
  const uniqueChanges = [...new Map(changes.map((metric) => [metric.key, metric])).values()];

  // Each objective is counted once. Unknown comparisons give no improvement credit.
  const knownGoals = capability.wanted.filter((metric) => metric.status !== "unknown");
  const goalGain = capability.wanted.reduce((sum, metric) => sum + goalUtility(metric), 0) / Math.max(1, capability.wanted.length);
  const objective = knownGoals.length ? Math.round(50 + knownGoals.reduce((sum, metric) => sum + goalUtility(metric), 0) / knownGoals.length / 2) : null;
  const subjectChange = Number.isFinite(coverage.beforeSubjectScore) && Number.isFinite(coverage.subjectScore) ? coverage.subjectScore - coverage.beforeSubjectScore : null;
  const mediaChange = Number.isFinite(coverage.beforePhotoVideoScore) && Number.isFinite(coverage.photoVideoScore) ? coverage.photoVideoScore - coverage.beforePhotoVideoScore : null;
  // Missing media evidence must not hide a known role loss (or the reverse).
  // Each channel retains its fixed share; unknown is zero evidence, not a zero specification.
  const usageChange = (subjectChange ?? 0) / 2 + (mediaChange ?? 0) / 2;
  const usage = Number.isFinite(coverage.subjectScore) && Number.isFinite(coverage.photoVideoScore) ? Math.round((coverage.subjectScore + coverage.photoVideoScore) / 2) : null;
  const knownConstraints = capability.constraints.filter((metric) => metric.status !== "unknown");
  const constraints = !capability.constraints.length ? 100 : knownConstraints.length ? Math.round(100 * knownConstraints.filter((metric) => metric.status !== "degraded").length / knownConstraints.length) : null;
  const extra = cost.additionalCost;
  // Affordable changes still cost money; exceeding budget has a larger penalty.
  const budgetPenalty = extra === null ? 8 : Math.min(12, extra / Math.max(50, intent.budget) * 8) + Math.min(35, Math.max(0, extra - intent.budget) / Math.max(50, intent.budget) * 25);
  const isHold = base.kind === "hold";
  const crossMount = current.body.mount !== target.body.mount;
  const transactionPenalty = isHold ? 0 : (base.sell.length + base.buy.length) * 0.6 + (crossMount ? 2 : 0);
  const lensPreferencePenalty = intent.keepUsefulLenses ? base.sell.filter((item) => item.id !== current.body.id && usefulLens(item, intent.subjects)).length * 3 : 0;
  const tradeoffPenalty = capability.tradeoffs.reduce((sum, metric) => sum + (metric.strength || 0) / 100 * (metric.key === "aperture" || metric.key === "focal" ? 8 : 6), 0);
  const preservationPenalty = capability.violations.length * SCORING_WEIGHTS.preservationPenalty;
  const design = scoreDesignPreference(target.body, intent.designPreference);
  const designBonus = Number.isFinite(design) ? design / 100 * SCORING_WEIGHTS.designMax : 0;
  const brandBonus = intent.preferBrand && current.body.brand === target.body.brand ? SCORING_WEIGHTS.brandPreferenceMax : 0;
  let total = 60 + goalGain * SCORING_WEIGHTS.objective + usageChange * SCORING_WEIGHTS.usage - preservationPenalty - tradeoffPenalty - budgetPenalty - transactionPenalty - lensPreferencePenalty + designBonus + brandBonus;
  // A style match cannot turn an unproven or negligible upgrade into a purchase verdict.
  const meaningfulImprovement = goalGain >= 12 && capability.wanted.some((metric) => metric.status === "improved" && metric.strength >= 20);
  if (!isHold && !meaningfulImprovement) total = Math.min(total, 58);
  const scores = { objective, constraints, usage, budget: extra === null ? null : Math.round(clamp(100 - budgetPenalty * 2)), simplicity: Math.round(clamp(100 - transactionPenalty * 10)), design, total: Math.round(clamp(total) * 10) / 10 };
  return { ...base, cost, weight, bodyWeight, coverage, lensCount, capability, lensComparison, changes: uniqueChanges, scores,
    evaluation: { goalGain, meaningfulImprovement, subjectChange, mediaChange, budgetPenalty, transactionPenalty, tradeoffPenalty, preservationPenalty, lensPreferencePenalty, designBonus, brandBonus, knownGoals: knownGoals.length, unknownGoals: capability.wanted.length - knownGoals.length, knownConstraints: knownConstraints.length, unknownConstraints: capability.constraints.length - knownConstraints.length } };
}

function compareRank(a, b) {
  return b.scores.total - a.scores.total || (a.kind === "hold" ? -1 : b.kind === "hold" ? 1 : 0) || (a.cost.additionalCost ?? Infinity) - (b.cost.additionalCost ?? Infinity) || systemKey(a.targetSystem).localeCompare(systemKey(b.targetSystem));
}

export function selectDiverseTopScenarios(scenarios, limit = 4) {
  const sorted = [...scenarios].sort(compareRank);
  const unique = [], seen = new Set();
  for (const scenario of sorted) {
    const key = systemKey(scenario.targetSystem);
    if (!seen.has(key)) { seen.add(key); unique.push(scenario); }
  }
  const hold = unique.find((scenario) => scenario.kind === "hold");
  const max = Math.max(1, Math.min(4, limit));
  const hasGain = (scenario) => scenario.evaluation?.meaningfulImprovement ?? scenario.capability.wanted.some((metric) => metric.status === "improved");
  const bestChange = unique.find((scenario) => scenario.kind !== "hold" && !scenario.capability.violations.length && hasGain(scenario));
  // Diversity requires a supported goal gain and a reasonable quality band.
  const floor = Math.max(hold ? hold.scores.total - 8 : 45, bestChange ? bestChange.scores.total - 20 : 45);
  const eligible = unique.filter((scenario) => scenario.kind !== "hold" && scenario.scores.total >= floor && !scenario.capability.violations.length && hasGain(scenario));
  const selected = [], slots = max - (hold ? 1 : 0);
  if (slots > 0 && eligible.length) selected.push(eligible[0]);
  const crossBrand = eligible.find((scenario) => scenario.targetSystem.body.brand !== scenario.currentSystem.body.brand);
  if (crossBrand && selected.length < slots && !selected.includes(crossBrand)) selected.push(crossBrand);
  const bucket = (scenario) => scenario.kind === "lens-only" ? "lens-only" : scenario.kind === "cross-mount-system" ? `cross:${scenario.targetSystem.body.brand}` : "same-mount";
  for (const scenario of eligible) {
    if (selected.length >= slots) break;
    if (!selected.includes(scenario) && !selected.some((item) => bucket(item) === bucket(scenario))) selected.push(scenario);
  }
  // Do not pad the output with minor variations of the same strategy.
  if (hold) selected.push(hold);
  return selected.sort(compareRank);
}

export function buildScenarioExplanation(scenario, extraBudget) {
  const lines = [];
  for (const metric of scenario.capability.wanted) {
    lines.push(metric.status === "unknown" ? `목표 '${metric.label}': 비교 데이터가 부족해 개선을 확인할 수 없습니다. ${metric.details[0] || ""}` : `목표 '${metric.label}': ${metric.summary}. ${metric.status === "improved" ? "확인된 사양에서 개선됩니다." : metric.status === "degraded" ? "현재보다 나빠집니다." : "현재 수준이어서 이 목표의 개선은 확인되지 않습니다."}`);
  }
  if (scenario.kind === "hold") lines.push("현재 장비를 유지하면 판매·구매 비용이 없습니다. 확인된 개선 폭과 전환 부담을 함께 비교한 선택입니다.");
  if (scenario.capability.violations.length) lines.push(`잃고 싶지 않은 ${scenario.capability.violations.map((metric) => metric.label).join(", ")}의 하락이 확인되어 큰 감점을 적용했습니다.`);
  const unknownConstraints = scenario.capability.constraints.filter((metric) => metric.status === "unknown");
  if (unknownConstraints.length) lines.push(`유지 조건 중 ${unknownConstraints.map((metric) => metric.label).join(", ")}은 데이터 부족으로 보존 여부를 확인할 수 없습니다.`);
  if (scenario.weight.percent === null) lines.push("바디 또는 대표 렌즈 무게가 미확인이라 대표 조합의 정확한 무게 변화는 계산할 수 없습니다.");
  else lines.push(`대표 조합 ${scenario.weight.before}g → ${scenario.weight.after}g (${scenario.weight.difference > 0 ? "+" : ""}${scenario.weight.difference}g, ${scenario.weight.percent > 0 ? "+" : ""}${scenario.weight.percent}%).`);
  if (scenario.currentSystem.body.mount && scenario.currentSystem.body.mount === scenario.targetSystem.body.mount) {
    const kept = scenario.keep.filter((item) => item.id !== scenario.currentSystem.body.id);
    if (kept.length) lines.push(`기존 렌즈 ${kept.map((item) => item.name).join(", ")}을 재사용하며 다시 구매하지 않습니다.`);
  } else if (scenario.kind !== "hold") lines.push(`${scenario.targetSystem.body.mount} 시스템으로 전환하는 안입니다. 어댑터 호환은 평가하지 않아 기존 장비 판매와 새 렌즈 구매를 계산했습니다.`);
  if (scenario.cost.additionalCost === null) lines.push("가격 미확인 장비가 있어 정확한 추가금은 계산할 수 없습니다.");
  else if (scenario.cost.additionalCost > Number(extraBudget || 0)) lines.push(`추가금 ${scenario.cost.additionalCost}만원으로 예산보다 ${scenario.cost.additionalCost - Number(extraBudget || 0)}만원 더 필요합니다.`);
  else lines.push(`예상 추가금 ${scenario.cost.additionalCost}만원으로 설정한 예산 안입니다.${scenario.cost.releasedFunds > 0 ? ` 판매 후 ${scenario.cost.releasedFunds}만원이 남는 참고 계산입니다.` : ""}`);
  const losses = scenario.capability.tradeoffs.filter((metric) => metric.status === "degraded");
  if (losses.length) lines.push(`함께 고려할 손해: ${losses.map((metric) => `${metric.label} (${metric.summary})`).join(", ")}.`);
  if (scenario.evaluation.designBonus > 0) lines.push("선호한 바디 디자인이 일치해 작은 선호 가산점을 반영했습니다. 성능 개선 근거로 사용하지 않습니다.");
  return lines;
}

export function generateUpgradeScenarios(input, catalog = defaultCatalog) {
  return selectDiverseTopScenarios(generateScenarioCandidates(input, catalog).map((scenario) => evaluateScenario(scenario, input)), 4);
}
