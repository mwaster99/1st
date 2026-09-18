import { LEGACY_CAMERA_POLICY } from "./cameraCatalog.js";
import { BODY_BY_ID, LENS_BY_ID, CAMERA_LENSES, LENS_BY_NAME, createUnknownLens } from "./cameraData.js";
import { DESIGN_OPTIONS, scoreDesignPreference } from "./cameraDesign.js";

// Keep the five curated policies; resolve every physical value and price by ID.
export const FIRST_PURCHASE_SYSTEMS = LEGACY_CAMERA_POLICY.firstPurchase.map((policy) => {
  const body = BODY_BY_ID[policy.bodyId];
  const lens = LENS_BY_ID[policy.defaultLensId];
  const fixed = body.kind === "fixed";
  return { ...policy, name: lens ? `${body.brand} ${body.model} + ${lens.name}` : `${body.brand} ${body.model}`,
    type: fixed ? "fixed" : "interchange", mount: body.mount,
    body: `${body.brand} ${body.model}`, bodyWeight: body.weight, designTags: body.designTags,
    lens: lens?.name || body.specs.fixedLens?.label || "내장 렌즈",
    bodyNew: body.newPrice, bodyUsed: body.usedPrice,
    lensNew: fixed ? 0 : lens.newPrice, lensUsed: fixed ? 0 : lens.usedPrice,
    price: body.price, capabilities: body.capabilities,
  };
});

const isKnown = (value) => typeof value === "number" && Number.isFinite(value);
const lensById = Object.fromEntries(CAMERA_LENSES.map((lens) => [lens.id, lens]));

function portabilityFromWeight(weight) {
  if (!isKnown(weight)) return null;
  // MVP의 조합 무게 구간입니다. 제조사 성능 등급이 아닙니다.
  return weight <= 500 ? 4 : weight <= 750 ? 3 : weight <= 1100 ? 2 : 1;
}

function portabilityLabel(score, weight, substituted) {
  if (score === null) return "조합 무게 데이터 부족";
  const label = score >= 4 ? "매우 가벼움" : score >= 3 ? "가벼운 편" : score >= 2 ? "보통" : "무게 고려 필요";
  return substituted && isKnown(weight) ? `${label} · ${weight}g` : label;
}

export function rankFirstPurchaseSystems(answers, { advanced = false, systems = FIRST_PURCHASE_SYSTEMS, ownedLenses } = {}) {
  const lenses = ownedLenses ?? (answers.ownedLenses || []).map((name) => LENS_BY_NAME[name] || createUnknownLens(name));
  const subjects = answers.subject || [];
  const videoShare = answers.video === "영상 비중이 높아요" ? 0.8 : answers.video === "사진과 영상 반반" ? 0.5 : 0.2;

  return systems.map((system) => {
    const ownedLens = system.type === "interchange" ? lenses.find((lens) => lens.mount && lens.mount === system.mount) : null;
    const effectiveLens = ownedLens || lensById[system.defaultLensId] || null;
    const totalFor = (body, lens) => isKnown(body) && (ownedLens || isKnown(lens)) ? body + (ownedLens ? 0 : lens) : null;
    const newTotal = totalFor(system.bodyNew, system.lensNew), usedTotal = totalFor(system.bodyUsed, system.lensUsed);
    const isUsed = answers.condition === "중고 우선" || (answers.condition === "신품·중고 모두 고려" && usedTotal !== null && (newTotal === null || usedTotal < newTotal));
    const bodyPrice = isUsed ? system.bodyUsed : system.bodyNew;
    // 보유 렌즈의 신규 구매 비용만 0입니다. 렌즈 자체의 가격/무게를 0으로 추정하지 않습니다.
    const lensPrice = ownedLens ? 0 : (isUsed ? system.lensUsed : system.lensNew);
    const total = isKnown(bodyPrice) && isKnown(lensPrice) ? bodyPrice + lensPrice : null;
    const systemWeight = isKnown(system.bodyWeight) && (system.type === "fixed" || isKnown(effectiveLens?.weight))
      ? system.bodyWeight + (system.type === "fixed" ? 0 : effectiveLens.weight) : null;
    // 보유 렌즈로 바뀐 경우 원래 기본 렌즈의 용도/경량화 설명을 물려받지 않습니다.
    const rolesKnown = !ownedLens || (Array.isArray(ownedLens.roles) && ownedLens.roles.length > 0);
    const uses = ownedLens ? system.uses.filter((use) => (ownedLens.roles || []).includes(use)) : system.uses;
    const portable = ownedLens ? portabilityFromWeight(systemWeight) : system.portable;
    const video = ownedLens ? (isKnown(ownedLens.videoScore) && isKnown(system.video) ? Math.min(system.video, ownedLens.videoScore / 5 * 3) : null) : system.video;
    const lensPhotoScore = effectiveLens?.photoScore ?? null;
    const matchedUses = uses.filter((use) => subjects.includes(use));
    const purposeFit = !rolesKnown ? null : subjects.length ? Math.round(matchedUses.length / subjects.length * 100) : 50;
    const designPreferenceScore = scoreDesignPreference(system, answers.designPreference);
    const designBonus = designPreferenceScore === null ? 0 : designPreferenceScore / 100;
    // 기존 구성의 영상 참고값과 실제 렌즈의 사진 참고값만 사용합니다.
    // 미등록 값은 근거 점수를 더하지 않습니다. 이 값은 실측 성능 향상률이 아닙니다.
    const mediaScore = (isKnown(video) ? videoShare * video : 0) + (isKnown(lensPhotoScore) ? (1 - videoShare) * lensPhotoScore / 5 : 0);
    let score = matchedUses.length * 5 + mediaScore + designBonus;
    if (answers.type === "렌즈교환식으로 시작하고 싶어요" && system.type === "interchange") score += 4;
    if (answers.type === "고정 렌즈 카메라가 좋아요" && system.type === "fixed") score += 4;
    if (ownedLens) score += 8;
    if (answers.portability === "매일 가볍게 들고 다니고 싶어요" && isKnown(portable)) score += portable;
    if (answers.portability === "여행이나 약속 때 챙길 거예요" && isKnown(portable)) score += portable * 0.4;
    if (answers.lensCount === "한 개로 끝내고 싶어요" && system.type === "fixed") score += 3;
    if (system.type === "interchange") {
      if (answers.lensCount === "두 개 정도는 괜찮아요") score += 1;
      if (answers.lensCount === "여러 개 교환해도 괜찮아요") score += 2;
    }
    const mediaFit = video === null ? "영상 적합성 데이터 부족" : answers.video === "영상 비중이 높아요" ? (video >= 2.4 ? "영상에도 적합" : video >= 1.2 ? "사진·영상 균형" : "사진 중심") : answers.video === "사진과 영상 반반" ? (video >= 1.2 ? "사진·영상 균형" : "사진 중심") : "사진 중심 구성";
    let why = system.why;
    if (ownedLens) {
      const weightText = systemWeight === null ? "조합 무게는 데이터가 부족해 판단을 보류합니다." : `바디와 보유 렌즈 합계 ${systemWeight}g을 기준으로 휴대성을 평가했습니다.`;
      const roleText = rolesKnown ? `선택한 촬영 용도 ${subjects.length}개 중 ${matchedUses.length}개가 바디 구성과 보유 렌즈의 역할 태그에 함께 맞습니다.` : "보유 렌즈의 용도 정보가 부족해 촬영 목적 적합도는 미확인입니다.";
      const mediaText = `보유 렌즈의 사진/영상 참고 점수는 ${lensPhotoScore ?? "미확인"}/${ownedLens.videoScore ?? "미확인"}(각 5점 기준)이며 구성 평가에 반영했습니다.`;
      why = `보유 렌즈를 활용해 새 렌즈 구매 비용을 줄이는 구성입니다. ${weightText} ${roleText} ${mediaText}`;
    }
    if (designBonus > 0) {
      const preferences = Array.isArray(answers.designPreference) ? answers.designPreference : [answers.designPreference];
      const matchedLabels = preferences.filter((value) => system.designTags?.includes(value)).map((value) => DESIGN_OPTIONS.find((option) => option.value === value)?.label).filter(Boolean);
      why += ` 선호한 ${matchedLabels.join(" 또는 ")} 디자인에 맞습니다.`;
    }
    return { ...system, name: ownedLens ? `${system.body} + ${ownedLens.name}` : system.name, style: ownedLens ? "보유 렌즈 활용" : system.style, lens: ownedLens ? `${ownedLens.name} (보유)` : system.lens, total, bodyPrice, lensPrice, priceType: isUsed ? "중고" : "신품", uses, portable, video, lensPhotoScore, systemWeight, purposeFit, portabilityLabel: portabilityLabel(portable, systemWeight, Boolean(ownedLens)), mediaFit, mediaScore, designPreferenceScore, designBonus, why, score };
  }).filter((system) => system.total !== null && system.total <= Number(answers.budget || 0) && (!advanced || (!answers.bodyBudget || system.bodyPrice <= Number(answers.bodyBudget)) && (!answers.lensBudget || system.lensPrice <= Number(answers.lensBudget))))
    .sort((a, b) => b.score - a.score || a.total - b.total);
}
