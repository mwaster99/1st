import { CAMERA_BODIES, CAMERA_LENSES } from "./cameraData.js";

export const REASON_CAPABILITY = {
  "더 가볍고 작은 카메라를 원해요": "portability",
  "화질을 더 높이고 싶어요": "imageQuality",
  "AF가 더 좋아졌으면 해요": "autofocus",
  "영상 성능을 높이고 싶어요": "video",
  "배터리가 오래 갔으면 해요": "battery",
  "렌즈 선택지가 아쉬워요": "lensEcosystem",
};

export const PRESERVE_CAPABILITY = {
  화질: "imageQuality",
  AF: "autofocus",
  배터리: "battery",
  영상: "video",
  "렌즈 선택지": "lensEcosystem",
  "조작성 · 그립": "handling",
  색감: "color",
  튼튼함: "durability",
};

export const CAPABILITY_LABEL = {
  portability: "휴대성",
  imageQuality: "화질",
  autofocus: "AF",
  video: "영상",
  battery: "배터리",
  lensEcosystem: "렌즈 선택지",
  handling: "조작성 · 그립",
  color: "색감",
  durability: "튼튼함",
};

export const RATIO_WEIGHTS = {
  "사진 100%": { photo: 1, video: 0 },
  "사진 80% / 영상 20%": { photo: 0.8, video: 0.2 },
  "사진 50% / 영상 50%": { photo: 0.5, video: 0.5 },
  "사진 20% / 영상 80%": { photo: 0.2, video: 0.8 },
  "영상 100%": { photo: 0, video: 1 },
};

export const SCORING_WEIGHTS = {
  objective: 0.35,
  constraints: 0.25,
  usage: 0.2,
  budget: 0.15,
  simplicity: 0.05,
};

const SENSOR_RANK = { 마이크로포서드: 1, "APS-C": 2, 풀프레임: 3 };

function average(values, fallback = 0) {
  const known = values.filter((value) => Number.isFinite(value));
  return known.length ? known.reduce((sum, value) => sum + value, 0) / known.length : fallback;
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function percentChange(after, before) {
  return Number.isFinite(before) && Number.isFinite(after) && before !== 0
    ? Math.round(((after / before) - 1) * 100)
    : null;
}

function bodyVolume(dimensions) {
  return Array.isArray(dimensions) && dimensions.every(Number.isFinite)
    ? dimensions.reduce((total, value) => total * value, 1)
    : null;
}

function unknownCapability(key, detail) {
  return { key, label: CAPABILITY_LABEL[key], status: "unknown", strength: null, summary: "비교 불가", details: [detail] };
}

export function compareCapability(key, before, after, beforeWeight, afterWeight) {
  if (key === "portability") {
    const weightChange = percentChange(afterWeight, beforeWeight);
    const beforeVolume = bodyVolume(before.dimensions);
    const afterVolume = bodyVolume(after.dimensions);
    const volumeChange = percentChange(afterVolume, beforeVolume);
    if (weightChange === null) return unknownCapability(key, "대표 렌즈 무게 데이터가 없어 대표 조합을 계산할 수 없습니다.");
    const status = weightChange <= -5 ? "improved" : weightChange >= 5 ? "degraded" : "maintained";
    return {
      key,
      label: CAPABILITY_LABEL[key],
      status,
      strength: clamp(Math.abs(weightChange) * 3),
      summary: weightChange < 0 ? `대표 조합 ${Math.abs(weightChange)}% 경량화` : weightChange > 0 ? `대표 조합 ${weightChange}% 무거워짐` : "대표 조합 무게 동일",
      details: [`${beforeWeight}g → ${afterWeight}g`, volumeChange === null ? "바디 부피 데이터 부족" : `바디 부피 ${volumeChange > 0 ? "+" : ""}${volumeChange}%`],
    };
  }

  if (key === "imageQuality") {
    if (!before.sensor || !after.sensor) return unknownCapability(key, "센서 데이터가 부족합니다.");
    const beforeRank = SENSOR_RANK[before.sensor.format];
    const afterRank = SENSOR_RANK[after.sensor.format];
    const formatDelta = Number.isFinite(beforeRank) && Number.isFinite(afterRank) ? afterRank - beforeRank : null;
    const mpChange = percentChange(after.sensor.megapixels, before.sensor.megapixels);
    if (formatDelta === null && mpChange === null) return unknownCapability(key, "센서 형식과 해상도 데이터가 부족합니다.");
    const status = formatDelta > 0 || (formatDelta === 0 && mpChange > 5)
      ? "improved"
      : formatDelta < 0 || (formatDelta === 0 && mpChange < -5)
        ? "degraded"
        : "maintained";
    return {
      key,
      label: CAPABILITY_LABEL[key],
      status,
      strength: formatDelta ? clamp(Math.abs(formatDelta) * 45) : mpChange === null ? null : clamp(Math.abs(mpChange)),
      summary: status === "improved" ? "센서·해상도 기준 개선" : status === "degraded" ? "센서·해상도 기준 하락" : "센서·해상도 수준 유지",
      details: [`센서 ${before.sensor.format} → ${after.sensor.format}`, mpChange === null ? "해상도 비교 데이터 부족" : `해상도 ${before.sensor.megapixels}MP → ${after.sensor.megapixels}MP (${mpChange > 0 ? "+" : ""}${mpChange}%)`, "DR·고감도 데이터 없음"],
    };
  }

  if (key === "autofocus") {
    if (!before.autofocus || !after.autofocus) return unknownCapability(key, "AF 세대·피사체 인식 데이터가 부족합니다.");
    const added = after.autofocus.subjects.filter((subject) => !before.autofocus.subjects.includes(subject));
    const lost = before.autofocus.subjects.filter((subject) => !after.autofocus.subjects.includes(subject));
    const aiImproved = !before.autofocus.aiUnit && after.autofocus.aiUnit;
    const aiLost = before.autofocus.aiUnit && !after.autofocus.aiUnit;
    const status = aiImproved || added.length ? "improved" : aiLost || lost.length ? "degraded" : "maintained";
    return {
      key,
      label: CAPABILITY_LABEL[key],
      status,
      strength: status === "improved" ? clamp(45 + added.length * 8) : status === "degraded" ? 60 : 0,
      summary: aiImproved ? "전용 AI 처리 장치와 인식 대상 확대" : status === "improved" ? "피사체 인식 범위 확대" : status === "degraded" ? "확인 가능한 AF 기능 감소" : "확인 가능한 AF 기능 수준 유지",
      details: [before.autofocus.description, `→ ${after.autofocus.description}`, added.length ? `추가 인식: ${added.join(", ")}` : "추가 인식 대상 없음"],
    };
  }

  if (key === "video") {
    if (!before.video || !after.video) return unknownCapability(key, "영상 해상도·비트 심도 데이터가 부족합니다.");
    const parseResolution = (value) => { const match = value?.match(/([0-9]+(?:\.[0-9]+)?)K/i); return match ? Number(match[1]) : null; };
    const parseFrameRate = (value) => { const match = value?.match(/([0-9]+)p/i); return match ? Number(match[1]) : null; };
    const beforeResolution = parseResolution(before.video.max);
    const afterResolution = parseResolution(after.video.max);
    if (beforeResolution === null || afterResolution === null) return unknownCapability(key, "최대 영상 기록 데이터가 부족합니다.");
    const beforeFps = parseFrameRate(before.video.max);
    const afterFps = parseFrameRate(after.video.max);
    const resolutionDelta = Math.sign(afterResolution - beforeResolution);
    const fpsDelta = Number.isFinite(beforeFps) && Number.isFinite(afterFps) ? Math.sign(afterFps - beforeFps) : 0;
    const depthDelta = Number.isFinite(before.video.bitDepth) && Number.isFinite(after.video.bitDepth) ? Math.sign(after.video.bitDepth - before.video.bitDepth) : 0;
    const deltas = [resolutionDelta, fpsDelta, depthDelta].filter((value) => value !== 0);
    const mixed = deltas.some((value) => value > 0) && deltas.some((value) => value < 0);
    const status = mixed ? "maintained" : deltas.some((value) => value > 0) || (before.video.cropAtMax && after.video.cropAtMax === false) ? "improved" : deltas.some((value) => value < 0) || (before.video.cropAtMax === false && after.video.cropAtMax) ? "degraded" : "maintained";
    return {
      key,
      label: CAPABILITY_LABEL[key],
      status,
      strength: mixed ? 0 : clamp(deltas.length * 25),
      summary: mixed ? "해상도와 프레임률의 장단점 교차" : status === "improved" ? "영상 기록 사양 개선" : status === "degraded" ? "영상 기록 사양 하락" : "주요 영상 기록 사양 유지",
      details: [`${before.video.max} → ${after.video.max}`, `${before.video.bitDepth ?? "?"}bit → ${after.video.bitDepth ?? "?"}bit`, before.video.cropAtMax === null || after.video.cropAtMax === null ? "최대 모드 크롭 비교 불가" : `최대 모드 크롭 ${before.video.cropAtMax ? "있음" : "없음"} → ${after.video.cropAtMax ? "있음" : "없음"}`, "롤링셔터·발열 데이터 없음"],
    };
  }

  if (key === "battery") {
    if (!Number.isFinite(before.batteryShots) || !Number.isFinite(after.batteryShots)) return unknownCapability(key, "공식 촬영 가능 매수 데이터가 부족합니다.");
    const change = percentChange(after.batteryShots, before.batteryShots);
    const status = change >= 5 ? "improved" : change <= -5 ? "degraded" : "maintained";
    return {
      key,
      label: CAPABILITY_LABEL[key],
      status,
      strength: clamp(Math.abs(change)),
      summary: change > 0 ? `공식 촬영 매수 ${change}% 증가` : change < 0 ? `공식 촬영 매수 ${Math.abs(change)}% 감소` : "공식 촬영 매수 동일",
      details: [`${before.batteryShots}매 → ${after.batteryShots}매`, "제조사 기준·촬영 조건에 따라 실제 사용 시간은 달라질 수 있음"],
      rawChange: change,
    };
  }

  if (key === "lensEcosystem") {
    const same = before.mount === after.mount;
    return { key, label: CAPABILITY_LABEL[key], status: same ? "maintained" : "degraded", strength: same ? 0 : 80, summary: same ? `${before.mount} 마운트 유지` : `${before.mount} → ${after.mount} 변경`, details: [same ? "기존 호환 렌즈 생태계를 유지합니다." : "MVP에서는 어댑터를 고려하지 않아 기존 렌즈를 직접 사용할 수 없습니다."] };
  }

  return unknownCapability(key, `${CAPABILITY_LABEL[key]} 비교 필드가 아직 DB에 없습니다.`);
}

export function compareLens(beforeLens, afterLens, userSubjects = []) {
  if (!beforeLens || !afterLens) return [{ key: "lens", label: "렌즈", status: "unknown", summary: "비교 불가", detail: "대표 렌즈 데이터가 부족합니다." }];
  const rows = [];
  const weightChange = percentChange(afterLens.weight, beforeLens.weight);
  rows.push(weightChange === null
    ? { key: "lensWeight", label: "렌즈 무게", status: "unknown", summary: "비교 불가", detail: "렌즈 무게 데이터가 없습니다." }
    : { key: "lensWeight", label: "렌즈 무게", status: weightChange <= -5 ? "improved" : weightChange >= 5 ? "degraded" : "maintained", summary: weightChange < 0 ? `${beforeLens.weight - afterLens.weight}g 가벼워짐` : weightChange > 0 ? `${afterLens.weight - beforeLens.weight}g 무거워짐` : "동일", detail: `${beforeLens.weight}g → ${afterLens.weight}g` });

  if (!beforeLens.focal || !afterLens.focal) {
    rows.push({ key: "focal", label: "초점거리", status: "unknown", summary: "비교 불가", detail: "초점거리 데이터가 없습니다." });
  } else {
    const narrower = afterLens.focal.min > beforeLens.focal.min || afterLens.focal.max < beforeLens.focal.max;
    const wider = afterLens.focal.min < beforeLens.focal.min || afterLens.focal.max > beforeLens.focal.max;
    const focalStatus = narrower && !wider ? "degraded" : wider && !narrower ? "improved" : "maintained";
    rows.push({ key: "focal", label: "초점거리", status: focalStatus, summary: `${beforeLens.focal.min}-${beforeLens.focal.max}mm → ${afterLens.focal.min}-${afterLens.focal.max}mm`, detail: focalStatus === "degraded" ? "일부 화각 범위가 줄어듭니다." : focalStatus === "improved" ? "사용 가능한 화각 범위가 넓어집니다." : narrower && wider ? "광각은 넓어지고 망원 범위는 줄어드는 교환 관계입니다." : "화각 범위가 같습니다." });
  }

  if (!beforeLens.aperture || !afterLens.aperture) {
    rows.push({ key: "aperture", label: "최대 조리개", status: "unknown", summary: "비교 불가", detail: "조리개 데이터가 없습니다." });
  } else {
    const beforeAverage = (beforeLens.aperture.wide + beforeLens.aperture.tele) / 2;
    const afterAverage = (afterLens.aperture.wide + afterLens.aperture.tele) / 2;
    rows.push({ key: "aperture", label: "최대 조리개", status: afterAverage < beforeAverage ? "improved" : afterAverage > beforeAverage ? "degraded" : "maintained", summary: `F${beforeLens.aperture.wide}-${beforeLens.aperture.tele} → F${afterLens.aperture.wide}-${afterLens.aperture.tele}`, detail: afterAverage > beforeAverage ? "렌즈 밝기가 낮아집니다." : afterAverage < beforeAverage ? "렌즈가 더 밝아집니다." : "렌즈 밝기가 같습니다." });
  }

  const beforeCoverage = userSubjects.filter((subject) => beforeLens.roles.includes(subject)).length;
  const afterCoverage = userSubjects.filter((subject) => afterLens.roles.includes(subject)).length;
  rows.push({ key: "roles", label: "용도 커버리지", status: afterCoverage > beforeCoverage ? "improved" : afterCoverage < beforeCoverage ? "degraded" : "maintained", summary: `${beforeCoverage}/${userSubjects.length} → ${afterCoverage}/${userSubjects.length}`, detail: userSubjects.length ? `선택한 촬영 대상 기준: ${userSubjects.join(", ")}` : "선택한 촬영 대상이 없습니다." });
  rows.push({ key: "opticalUnknown", label: "광학·영상 특성", status: "unknown", summary: "데이터 부족", detail: "AF 속도·포커스 브리딩·실제 해상력은 현재 비교할 수 없습니다." });
  return rows;
}

export function scoreRoleCoverage(userSubjects, body, lenses) {
  if (!userSubjects.length) return 50;
  const availableRoles = new Set([...(body.useTags || []), ...lenses.flatMap((lens) => lens.roles || [])]);
  return Math.round((userSubjects.filter((subject) => availableRoles.has(subject)).length / userSubjects.length) * 100);
}

function scorePhotoVideo(ratio, body, lenses) {
  const weights = RATIO_WEIGHTS[ratio] || { photo: 0.5, video: 0.5 };
  const lensPhoto = average(lenses.map((lens) => lens.photoScore), null);
  const lensVideo = average(lenses.map((lens) => lens.videoScore), null);
  const photo = average([body.photoScore, lensPhoto].map((value) => Number.isFinite(value) ? value * 20 : null), 50);
  const video = average([body.videoScore, lensVideo].map((value) => Number.isFinite(value) ? value * 20 : null), 50);
  return Math.round(photo * weights.photo + video * weights.video);
}

function lensCandidateScore(lens, subjects, ratio, portabilityPriority) {
  const role = subjects.length ? (subjects.filter((subject) => lens.roles.includes(subject)).length / subjects.length) * 100 : 50;
  const weights = RATIO_WEIGHTS[ratio] || { photo: 0.5, video: 0.5 };
  const use = ((lens.photoScore ?? 2.5) * 20 * weights.photo) + ((lens.videoScore ?? 2.5) * 20 * weights.video);
  const portability = (lens.portabilityScore ?? 2.5) * 20;
  return role * 0.5 + use * 0.35 + portability * (portabilityPriority ? 0.15 : 0.05);
}

export function generateLensCandidates({ body, userSubjects, ratio, portabilityPriority }) {
  return CAMERA_LENSES
    .filter((lens) => lens.mount === body.mount)
    .map((lens) => ({ lens, score: lensCandidateScore(lens, userSubjects, ratio, portabilityPriority) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ lens }) => lens);
}

function preliminaryBodyScore(body, currentBody, input) {
  const objectiveKeys = [...new Set(input.pains.map((pain) => REASON_CAPABILITY[pain]).filter(Boolean))];
  const objective = average(objectiveKeys.map((key) => {
    const metric = compareCapability(key, currentBody, body, currentBody.weight, body.weight);
    return metric.status === "improved" ? 90 : metric.status === "maintained" ? 35 : metric.status === "unknown" ? 20 : 0;
  }), 25);
  const usage = scoreRoleCoverage(input.subjects, body, []);
  let brand = 0;
  if (input.brandIntent === "가능하면 유지 · 다른 브랜드도 가능") brand = body.mount === currentBody.mount ? 20 : body.brand === currentBody.brand ? 10 : 0;
  return objective * 0.65 + usage * 0.25 + brand;
}

export function generateBodyCandidates({ currentBody, pains, preserve, subjects, ratio, brandIntent }) {
  const input = { pains, preserve, subjects, ratio, brandIntent };
  return CAMERA_BODIES
    .filter((body) => body.id !== currentBody.id)
    .filter((body) => brandIntent !== "현재 브랜드만" || (body.brand === currentBody.brand && body.mount === currentBody.mount))
    .map((body) => ({ body, score: preliminaryBodyScore(body, currentBody, input) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(({ body }) => body);
}

function sumPrice(items, key) {
  const known = items.filter((item) => Number.isFinite(item[key]));
  const missing = items.filter((item) => !Number.isFinite(item[key]));
  return { known: known.reduce((sum, item) => sum + item[key], 0), missing: missing.map((item) => item.name) };
}

function systemWeight(body, primaryLens) {
  return Number.isFinite(body?.weight) && Number.isFinite(primaryLens?.weight) ? body.weight + primaryLens.weight : null;
}

function usefulLens(lens, subjects) {
  if (lens.dataStatus === "unknown") return true;
  if (!subjects.length) return true;
  return lens.roles.some((role) => subjects.includes(role));
}

function assessCapabilities(currentBody, targetBody, beforeWeight, afterWeight, pains, preserve) {
  const objectiveKeys = [...new Set(pains.map((pain) => REASON_CAPABILITY[pain]).filter(Boolean))];
  const constraintKeys = [...new Set(preserve.map((item) => PRESERVE_CAPABILITY[item]).filter(Boolean))];
  const wanted = objectiveKeys.map((key) => compareCapability(key, currentBody, targetBody, beforeWeight, afterWeight));
  const constraints = constraintKeys.map((key) => {
    const metric = compareCapability(key, currentBody, targetBody, beforeWeight, afterWeight);
    if (key === "battery" && Number.isFinite(metric.rawChange) && metric.rawChange < 0) return { ...metric, status: "degraded", summary: `${metric.summary} ⚠️` };
    return metric;
  });
  const otherKeys = ["portability", "imageQuality", "autofocus", "video", "battery", "lensEcosystem"].filter((key) => !objectiveKeys.includes(key) && !constraintKeys.includes(key));
  const tradeoffs = otherKeys.map((key) => compareCapability(key, currentBody, targetBody, beforeWeight, afterWeight)).filter((item) => item.status === "degraded");
  return { wanted, constraints, tradeoffs, violations: constraints.filter((item) => item.status === "degraded") };
}

function scoreScenario(scenario, input) {
  const objectiveScore = average(scenario.capability.wanted.map((item) => item.status === "improved" ? Math.max(70, item.strength ?? 70) : item.status === "maintained" ? 20 : item.status === "unknown" ? 15 : 0), input.pains.length ? 15 : 50);
  const constraintScore = average(scenario.capability.constraints.map((item) => item.status === "improved" || item.status === "maintained" ? 100 : item.status === "unknown" ? 50 : 0), 100);
  const usageScore = Math.round((scenario.coverage.subjectScore + scenario.coverage.photoVideoScore) / 2);
  const extra = scenario.cost.additionalCost;
  const budget = Number(input.extraBudget || 0);
  const budgetScore = extra === null ? 45 : extra <= budget ? 100 : clamp(100 - ((extra - budget) / Math.max(50, budget || 50)) * 70);
  const simplicityScore = scenario.kind === "hold" ? 100 : scenario.targetSystem.body.mount === scenario.currentSystem.body.mount ? clamp(100 - scenario.sell.length * 12 - scenario.buy.length * 8) : clamp(55 - scenario.sell.length * 5);
  let total = objectiveScore * SCORING_WEIGHTS.objective + constraintScore * SCORING_WEIGHTS.constraints + usageScore * SCORING_WEIGHTS.usage + budgetScore * SCORING_WEIGHTS.budget + simplicityScore * SCORING_WEIGHTS.simplicity;
  total -= scenario.capability.violations.length * 35;
  if (input.brandIntent === "가능하면 유지 · 다른 브랜드도 가능" && scenario.targetSystem.body.mount === scenario.currentSystem.body.mount) total += 6;
  if (input.lensIntent === "가능하면 전부 유지" && scenario.sell.some((item) => item.id !== scenario.currentSystem.body.id)) total -= 30;
  const portabilityDetails = input.portabilityDetails || [];
  if (portabilityDetails.includes("바디 무게") && ["same-mount-body", "same-mount-system", "cross-mount-system"].includes(scenario.kind) && scenario.targetSystem.body.weight < scenario.currentSystem.body.weight) total += 6;
  if (portabilityDetails.includes("렌즈 무게") && ["lens-only", "same-mount-system", "cross-mount-system"].includes(scenario.kind) && scenario.targetSystem.primaryLens?.weight < scenario.currentSystem.primaryLens?.weight) total += 8;
  if (portabilityDetails.some((item) => ["전체 부피", "가방에 넣기 어려움", "장시간 들고 다니기 힘듦"].includes(item)) && scenario.weight?.percent <= -15) total += 5;
  scenario.scores = { objective: Math.round(objectiveScore), constraints: Math.round(constraintScore), usage: Math.round(usageScore), budget: Math.round(budgetScore), simplicity: Math.round(simplicityScore), total: Math.round(clamp(total)) };
  return scenario;
}

function finalizeScenario(base, input) {
  const beforeWeight = systemWeight(base.currentSystem.body, base.currentSystem.primaryLens);
  const afterWeight = systemWeight(base.targetSystem.body, base.targetSystem.primaryLens);
  const sellPrice = sumPrice(base.sell, "usedPrice");
  const buyPrice = sumPrice(base.buy, base.purchaseCondition === "new" ? "newPrice" : "usedPrice");
  const additionalCost = sellPrice.missing.length || buyPrice.missing.length ? null : Math.max(0, buyPrice.known - sellPrice.known);
  const capability = assessCapabilities(base.currentSystem.body, base.targetSystem.body, beforeWeight, afterWeight, input.pains, input.preserve);
  const lensComparison = base.currentSystem.primaryLens?.id === base.targetSystem.primaryLens?.id ? [] : compareLens(base.currentSystem.primaryLens, base.targetSystem.primaryLens, input.subjects);
  capability.tradeoffs.push(...lensComparison.filter((item) => item.status === "degraded").map((item) => ({ ...item, details: [item.detail] })));
  const scenario = {
    ...base,
    cost: { sellValue: sellPrice, buyValue: buyPrice, additionalCost },
    weight: { before: beforeWeight, after: afterWeight, difference: beforeWeight !== null && afterWeight !== null ? afterWeight - beforeWeight : null, percent: percentChange(afterWeight, beforeWeight) },
    coverage: { subjectScore: scoreRoleCoverage(input.subjects, base.targetSystem.body, base.targetSystem.lenses), photoVideoScore: scorePhotoVideo(input.ratio, base.targetSystem.body, base.targetSystem.lenses) },
    capability,
    lensComparison,
  };
  return scoreScenario(scenario, input);
}

function scenarioKey(scenario) {
  return `${scenario.targetSystem.body.id}|${scenario.targetSystem.lenses.map((lens) => lens.id).sort().join(",")}|${scenario.kind}`;
}

export function selectDiverseTopScenarios(scenarios, limit = 4) {
  const unique = [];
  const seen = new Set();
  for (const scenario of scenarios.sort((a, b) => b.scores.total - a.scores.total)) {
    const key = scenarioKey(scenario);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(scenario);
    }
  }
  const selected = [];
  const buckets = new Set();
  for (const scenario of unique.filter((item) => item.kind !== "hold")) {
    const bucket = ["same-mount-body", "same-mount-system"].includes(scenario.kind) ? "same-mount" : scenario.kind;
    if (!buckets.has(bucket)) {
      selected.push(scenario);
      buckets.add(bucket);
    }
    if (selected.length >= limit - 1) break;
  }
  for (const scenario of unique.filter((item) => item.kind !== "hold")) {
    if (selected.length >= limit - 1) break;
    if (!selected.includes(scenario)) selected.push(scenario);
  }
  const hold = unique.find((item) => item.kind === "hold");
  if (hold && selected.length < limit) selected.push(hold);
  return selected.sort((a, b) => b.scores.total - a.scores.total);
}

export function buildScenarioExplanation(scenario, extraBudget) {
  const lines = [];
  const currentBody = scenario.currentSystem.body.model || scenario.currentSystem.body.name;
  const currentLens = scenario.currentSystem.primaryLens?.name;
  if (scenario.weight.percent === null) lines.push(`${currentBody}${currentLens ? ` + ${currentLens}` : ""} 조합은 무게 데이터가 부족해 정확한 경량화 정도를 계산할 수 없습니다.`);
  else if (scenario.weight.percent < 0) lines.push(`현재 ${currentBody}${currentLens ? ` + ${currentLens}` : ""} 조합보다 ${Math.abs(scenario.weight.difference)}g, 약 ${Math.abs(scenario.weight.percent)}% 가벼워집니다.`);
  else if (scenario.weight.percent > 0) lines.push(`현재 대표 조합보다 ${scenario.weight.difference}g, 약 ${scenario.weight.percent}% 무거워집니다.`);
  else lines.push("대표 조합 무게는 현재와 같습니다.");
  const keptLenses = scenario.keep.filter((item) => item.type || item.dataStatus).map((item) => item.name);
  const sameMount = scenario.currentSystem.body.mount === scenario.targetSystem.body.mount;
  if (sameMount && keptLenses.length) lines.push(`${scenario.currentSystem.body.mount} 마운트를 유지하므로 ${keptLenses.join(", ")}은 계속 사용할 수 있습니다.`);
  else if (!sameMount) lines.push(`${scenario.currentSystem.body.mount || "현재"} 시스템에서 ${scenario.targetSystem.body.mount} 시스템으로 이동하므로 기존 렌즈는 그대로 사용할 수 없습니다.`);
  const lensLosses = scenario.lensComparison.filter((item) => item.status === "degraded");
  if (lensLosses.length) lines.push(`다만 대표 렌즈를 바꾸면서 ${lensLosses.map((item) => item.label).join(", ")}에서는 손해가 있습니다.`);
  if (scenario.cost.additionalCost === null) lines.push("가격이 확인되지 않은 장비가 있어 정확한 추가금은 계산하지 않았습니다.");
  else if (scenario.cost.additionalCost <= Number(extraBudget || 0)) lines.push("설정한 추가 예산 안에서 가능한 시나리오입니다.");
  else lines.push(`설정한 예산보다 ${scenario.cost.additionalCost - Number(extraBudget || 0)}만원 더 필요합니다.`);
  if (scenario.capability.violations.length) lines.push(`유지 조건 중 ${scenario.capability.violations.map((item) => item.label).join(", ")}에서 하락이 확인됩니다.`);
  return lines;
}

export function generateUpgradeScenarios(input) {
  const currentBody = input.currentBody;
  const currentLenses = input.currentLenses;
  const primaryLens = input.primaryLens;
  const portabilityPriority = input.pains.includes("더 가볍고 작은 카메라를 원해요");
  const candidates = generateBodyCandidates({ currentBody, pains: input.pains, preserve: input.preserve, subjects: input.subjects, ratio: input.ratio, brandIntent: input.brandIntent });
  const raw = [];
  let sequence = 0;
  const make = (base) => finalizeScenario({ id: `scenario-${++sequence}`, purchaseCondition: "used", ...base }, input);

  for (const body of candidates) {
    const sameMount = body.mount === currentBody.mount;
    const lensCandidates = generateLensCandidates({ body, userSubjects: input.subjects, ratio: input.ratio, portabilityPriority });

    if (sameMount && input.lensIntent !== "렌즈까지 전부 바꿔도 괜찮음") {
      raw.push(make({
        kind: "same-mount-body",
        strategy: "기존 렌즈 유지 · 바디 교체",
        currentSystem: { body: currentBody, lenses: currentLenses, primaryLens },
        targetSystem: { body, lenses: currentLenses, primaryLens },
        keep: currentLenses,
        sell: [currentBody],
        buy: [body],
      }));
    }

    if (!sameMount && input.lensIntent === "가능하면 전부 유지") continue;
    for (const targetLens of lensCandidates.slice(0, 2)) {
      let keptLenses = [];
      let soldLenses = [];
      if (sameMount && input.lensIntent === "쓸 만한 렌즈는 유지") {
        keptLenses = currentLenses.filter((lens) => lens.id !== primaryLens.id && usefulLens(lens, input.subjects));
        soldLenses = currentLenses.filter((lens) => !keptLenses.includes(lens));
      } else if (sameMount && input.lensIntent === "가장 좋은 방향 추천") {
        keptLenses = currentLenses.filter((lens) => lens.id !== primaryLens.id && usefulLens(lens, input.subjects));
        soldLenses = currentLenses.filter((lens) => !keptLenses.includes(lens));
      } else {
        soldLenses = currentLenses;
      }
      const targetLenses = [targetLens, ...keptLenses.filter((lens) => lens.id !== targetLens.id)];
      raw.push(make({
        kind: sameMount ? "same-mount-system" : "cross-mount-system",
        strategy: sameMount ? (portabilityPriority ? "휴대성 중심 시스템 조정" : "성능 균형 시스템 조정") : "전체 시스템 전환",
        currentSystem: { body: currentBody, lenses: currentLenses, primaryLens },
        targetSystem: { body, lenses: targetLenses, primaryLens: targetLens },
        keep: keptLenses,
        sell: [currentBody, ...soldLenses],
        buy: [body, targetLens],
      }));
    }
  }

  if (portabilityPriority && input.lensIntent !== "가능하면 전부 유지") {
    const currentMountLenses = generateLensCandidates({ body: currentBody, userSubjects: input.subjects, ratio: input.ratio, portabilityPriority: true });
    for (const targetLens of currentMountLenses.slice(0, 2)) {
      if (targetLens.id === primaryLens.id) continue;
      const kept = currentLenses.filter((lens) => lens.id !== primaryLens.id);
      raw.push(make({
        kind: "lens-only",
        strategy: "바디 유지 · 렌즈만 경량화",
        currentSystem: { body: currentBody, lenses: currentLenses, primaryLens },
        targetSystem: { body: currentBody, lenses: [targetLens, ...kept], primaryLens: targetLens },
        keep: [currentBody, ...kept],
        sell: [primaryLens],
        buy: [targetLens],
      }));
    }
  }

  raw.push(make({
    kind: "hold",
    strategy: "현재 시스템 유지",
    currentSystem: { body: currentBody, lenses: currentLenses, primaryLens },
    targetSystem: { body: currentBody, lenses: currentLenses, primaryLens },
    keep: [currentBody, ...currentLenses],
    sell: [],
    buy: [],
  }));

  return selectDiverseTopScenarios(raw, 4);
}
