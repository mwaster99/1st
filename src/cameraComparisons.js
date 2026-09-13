// Measured changes and their evidence. Unknown data never becomes a specification of zero.
export const CAPABILITY_LABEL = {
  portability: "대표 조합 휴대성", bodyWeight: "바디 무게", lensWeight: "대표 렌즈 무게",
  systemVolume: "전체 조합 부피", bodyVolume: "바디 부피", imageQuality: "센서·해상도",
  autofocus: "AF", video: "영상", battery: "배터리", lensEcosystem: "렌즈 선택지",
  handling: "조작성 · 그립", color: "색감", durability: "튼튼함", lowLight: "저조도",
  versatility: "범용성", experience: "새로운 촬영 경험", roles: "촬영 역할 커버리지",
};

export const RATIO_WEIGHTS = {
  "사진 100%": { photo: 1, video: 0 }, "사진 80% / 영상 20%": { photo: 0.8, video: 0.2 },
  "사진 50% / 영상 50%": { photo: 0.5, video: 0.5 }, "사진 20% / 영상 80%": { photo: 0.2, video: 0.8 },
  "영상 100%": { photo: 0, video: 1 },
};

export const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
export const averageKnown = (values) => {
  const known = values.filter(Number.isFinite);
  return known.length ? known.reduce((sum, value) => sum + value, 0) / known.length : null;
};
export const percentChange = (after, before) => Number.isFinite(before) && before > 0 && Number.isFinite(after)
  ? Math.round((after - before) / before * 1000) / 10 : null;
export const bodyVolume = (dimensions) => Array.isArray(dimensions) && dimensions.length === 3 && dimensions.every((v) => Number.isFinite(v) && v > 0)
  ? dimensions.reduce((total, value) => total * value, 1) : null;
export const unknownCapability = (key, detail, label = CAPABILITY_LABEL[key]) => ({ key, label, status: "unknown", strength: null, summary: "비교 데이터 부족", details: [detail] });
const formatNumber = (value) => Math.round(value * 100) / 100;

export function compareNumber(key, before, after, { label = CAPABILITY_LABEL[key], unit = "", lowerIsBetter = false, threshold = 0, scale = 40 } = {}) {
  if (!Number.isFinite(before) || !Number.isFinite(after)) return unknownCapability(key, "현재 또는 후보의 비교 데이터가 없습니다.", label);
  const difference = after - before;
  const percent = percentChange(after, before);
  const signed = lowerIsBetter ? -difference : difference;
  const magnitude = percent === null ? Math.abs(difference) : Math.abs(percent);
  const status = signed === 0 || magnitude < threshold ? "maintained" : signed > 0 ? "improved" : "degraded";
  return { key, label, status, strength: status === "maintained" ? 0 : clamp(magnitude / scale * 100), before, after, difference, percent,
    summary: `${formatNumber(before)}${unit} → ${formatNumber(after)}${unit}`, details: [percent === null ? `변화 ${formatNumber(difference)}${unit}` : `${difference > 0 ? "+" : ""}${formatNumber(difference)}${unit} (${percent > 0 ? "+" : ""}${percent}%)`] };
}

const SENSOR_RANK = { 마이크로포서드: 1, "APS-C": 2, 풀프레임: 3 };
const CROP_FACTOR = { 마이크로포서드: 2, "APS-C": 1.5, 풀프레임: 1 };

export function compareCapability(key, before, after, beforeWeight, afterWeight) {
  if (key === "portability") return compareNumber(key, beforeWeight, afterWeight, { unit: "g", lowerIsBetter: true, threshold: 1 });
  if (key === "bodyWeight") return compareNumber(key, before.weight, after.weight, { unit: "g", lowerIsBetter: true, threshold: 1 });
  if (key === "bodyVolume") return compareNumber(key, bodyVolume(before.dimensions), bodyVolume(after.dimensions), { unit: "mm³", lowerIsBetter: true, threshold: 1 });
  if (key === "systemVolume") return unknownCapability(key, "렌즈 치수와 장착 시 돌출 길이가 없어 전체 조합 부피를 계산할 수 없습니다. 바디 부피를 전체 부피로 대신하지 않습니다.");
  if (key === "imageQuality") {
    const a = before.sensor, b = after.sensor;
    if (!a || !b) return unknownCapability(key, "센서 데이터가 부족합니다.");
    const rankA = SENSOR_RANK[a.format], rankB = SENSOR_RANK[b.format];
    const formatDelta = Number.isFinite(rankA) && Number.isFinite(rankB) ? rankB - rankA : null;
    const mp = percentChange(b.megapixels, a.megapixels);
    const details = [`센서 ${a.format || "미확인"} → ${b.format || "미확인"}`, `해상도 ${a.megapixels ?? "?"}MP → ${b.megapixels ?? "?"}MP`, "센서 형식과 해상도만 비교합니다. DR·고감도·실제 해상력은 미확인입니다."];
    if (formatDelta === null || (formatDelta === 0 && mp === null)) return { ...unknownCapability(key, "센서 형식 또는 해상도 데이터가 부족합니다."), details };
    // Conflicting format/resolution changes cannot establish an overall image-quality gain.
    const mixed = formatDelta !== 0 && mp !== null && Math.abs(mp) > 5 && Math.sign(formatDelta) !== Math.sign(mp);
    if (mixed) return { ...unknownCapability(key, "센서 형식과 화소 수의 장단점이 엇갈립니다."), summary: "센서 크기와 해상도의 교환 관계", details };
    const delta = formatDelta !== 0 ? Math.sign(formatDelta) : Math.abs(mp) > 5 ? Math.sign(mp) : 0;
    return { key, label: CAPABILITY_LABEL[key], status: delta > 0 ? "improved" : delta < 0 ? "degraded" : "maintained",
      strength: formatDelta ? clamp(Math.abs(formatDelta) * 40) : clamp(Math.abs(mp)), summary: delta > 0 ? "센서·해상도 사양 개선" : delta < 0 ? "센서·해상도 사양 하락" : "센서·해상도 사양 유지", details };
  }
  if (key === "autofocus") {
    const a = before.autofocus, b = after.autofocus;
    if (!a || !b || !Array.isArray(a.subjects) || !Array.isArray(b.subjects) || typeof a.aiUnit !== "boolean" || typeof b.aiUnit !== "boolean") return unknownCapability(key, "AF 처리 장치·피사체 인식 데이터가 부족합니다.");
    const added = b.subjects.filter((s) => !a.subjects.includes(s));
    const lost = a.subjects.filter((s) => !b.subjects.includes(s));
    const up = (!a.aiUnit && b.aiUnit) || added.length > 0;
    const down = (a.aiUnit && !b.aiUnit) || lost.length > 0;
    const details = [a.description, `→ ${b.description}`, `추가 인식: ${added.join(", ") || "없음"}`, `감소 인식: ${lost.join(", ") || "없음"}`, "AF 속도·정확도의 실측 개선율은 아닙니다."].filter(Boolean);
    if (up && down) return { ...unknownCapability(key, "인식 기능의 증가와 감소가 함께 있습니다."), details };
    return { key, label: CAPABILITY_LABEL[key], status: up ? "improved" : down ? "degraded" : "maintained", strength: up ? clamp(35 + added.length * 8) : down ? clamp(35 + lost.length * 8) : 0, summary: up ? "확인된 AF 인식 기능 확대" : down ? "확인된 AF 인식 기능 감소" : "확인된 AF 기능 유지", details };
  }
  if (key === "video") {
    const a = before.video, b = after.video;
    if (!a || !b) return unknownCapability(key, "영상 기록 데이터가 부족합니다.");
    const parse = (value, regex) => { const match = value?.match(regex); return match ? Number(match[1]) : null; };
    const pairs = [[parse(a.max, /([\d.]+)K/i), parse(b.max, /([\d.]+)K/i)], [parse(a.max, /(\d+)p/i), parse(b.max, /(\d+)p/i)], [a.bitDepth, b.bitDepth], [typeof a.cropAtMax === "boolean" ? Number(!a.cropAtMax) : null, typeof b.cropAtMax === "boolean" ? Number(!b.cropAtMax) : null]];
    const deltas = pairs.filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y)).map(([x, y]) => Math.sign(y - x));
    const details = [`${a.max || "?"} → ${b.max || "?"}`, `${a.bitDepth ?? "?"}bit → ${b.bitDepth ?? "?"}bit`, `최대 모드 크롭 ${typeof a.cropAtMax === "boolean" ? a.cropAtMax ? "있음" : "없음" : "미확인"} → ${typeof b.cropAtMax === "boolean" ? b.cropAtMax ? "있음" : "없음" : "미확인"}`, "기록 모드 조합·롤링셔터·발열의 종합 평가는 미확인입니다."];
    const up = deltas.some((v) => v > 0), down = deltas.some((v) => v < 0);
    if ((up && down) || deltas.length !== pairs.length) return { ...unknownCapability(key, "서로 다른 기록 모드의 장단점 또는 누락된 사양이 있습니다."), summary: up && down ? "영상 기록 사양의 교환 관계" : "일부 영상 사양 비교 불가", details };
    return { key, label: CAPABILITY_LABEL[key], status: up ? "improved" : down ? "degraded" : "maintained", strength: deltas.filter((v) => v !== 0).length * 25, summary: up ? "영상 기록 사양 개선" : down ? "영상 기록 사양 하락" : "주요 영상 기록 사양 유지", details };
  }
  if (key === "battery") {
    const result = compareNumber(key, before.batteryShots, after.batteryShots, { unit: "매", scale: 40 });
    return { ...result, rawChange: result.percent ?? null, details: [...result.details, "제조사 촬영 조건에 따라 실제 사용 시간은 다릅니다."] };
  }
  if (key === "lensEcosystem") {
    if (before.mount && before.mount === after.mount) return { key, label: CAPABILITY_LABEL[key], status: "maintained", strength: 0, summary: `${before.mount} 렌즈 선택지 유지`, details: ["마운트가 같아 생태계가 바뀌지 않습니다. 등록된 샘플 렌즈 개수를 시장 전체 선택지로 평가하지 않습니다."] };
    return unknownCapability(key, "마운트별 렌즈 생태계의 범위·가격 데이터가 없어 확대/축소를 판단하지 않습니다. 마운트 변경 자체를 성능 하락으로 간주하지 않습니다.");
  }
  if (key === "experience") return unknownCapability(key, "새로운 촬영 경험을 비교할 근거가 부족합니다. 디자인 선호와 확인 가능한 촬영 역할 변화는 별도로 보여드립니다.");
  return unknownCapability(key, `${CAPABILITY_LABEL[key] || key} 비교 근거가 아직 DB에 없습니다.`);
}

function equivalentFocal(lens, body) {
  if (!body?.sensor || !Number.isFinite(lens?.focal?.min) || !Number.isFinite(lens?.focal?.max)) return null;
  const factor = Number.isFinite(body.sensor.cropFactor) ? body.sensor.cropFactor : body.sensor.format === "APS-C" && body.brand === "Canon" ? 1.6 : CROP_FACTOR[body.sensor.format];
  return factor ? { min: Math.round(lens.focal.min * factor * 10) / 10, max: Math.round(lens.focal.max * factor * 10) / 10 } : null;
}

export function compareLens(beforeLens, afterLens, userSubjects = [], beforeBody, afterBody) {
  if (!beforeLens || !afterLens) return [unknownCapability("lens", "대표 렌즈가 없습니다.", "대표 렌즈")];
  const rows = [compareNumber("lensWeight", beforeLens.weight, afterLens.weight, { unit: "g", lowerIsBetter: true, threshold: 1 })];
  const a = equivalentFocal(beforeLens, beforeBody), b = equivalentFocal(afterLens, afterBody);
  if (!a || !b) rows.push(unknownCapability("focal", "센서 형식 또는 초점거리 데이터가 없어 환산 화각을 비교할 수 없습니다.", "35mm 환산 화각"));
  else {
    const gains = b.min < a.min || b.max > a.max, losses = b.min > a.min || b.max < a.max;
    rows.push({ key: "focal", label: "35mm 환산 화각", status: gains && losses ? "unknown" : gains ? "improved" : losses ? "degraded" : "maintained", strength: gains && losses ? null : gains || losses ? 40 : 0,
      summary: `${a.min}–${a.max}mm → ${b.min}–${b.max}mm`, details: [gains && losses ? "넓어지는 영역과 잃는 영역이 함께 있어 단일 개선/하락으로 판정하지 않습니다." : gains ? "담을 수 있는 화각 범위가 넓어집니다." : losses ? "기존 화각 범위 일부를 잃습니다." : "환산 화각 범위가 같습니다."] });
  }
  const apertures = [beforeLens.aperture?.wide, beforeLens.aperture?.tele, afterLens.aperture?.wide, afterLens.aperture?.tele];
  if (!apertures.every((value) => Number.isFinite(value) && value > 0)) rows.push(unknownCapability("aperture", "조리개 데이터가 부족합니다.", "렌즈 밝기"));
  else {
    const [aw, at, bw, bt] = apertures;
    const gains = bw < aw || bt < at, losses = bw > aw || bt > at;
    rows.push({ key: "aperture", label: "렌즈 밝기", status: gains && losses ? "unknown" : gains ? "improved" : losses ? "degraded" : "maintained", strength: gains && losses ? null : clamp(Math.abs(Math.log2((bw * bt) / (aw * at))) * 25),
      summary: `F${aw}–${at} → F${bw}–${bt}`, details: ["광각·망원 끝의 최대 조리개를 비교합니다. 서로 다른 초점거리의 동일 화각 실측이나 시스템 저조도 성능을 뜻하지 않습니다.", gains && losses ? "양 끝 조리개의 장단점이 엇갈립니다." : losses ? "최대 조리개가 어두워집니다." : gains ? "최대 조리개가 밝아집니다." : "최대 조리개 값이 같습니다."] });
  }
  const roleCoverage = (lens) => userSubjects.length && lens.dataStatus !== "unknown" && Array.isArray(lens.roles)
    ? Math.round(userSubjects.filter((subject) => lens.roles.includes(subject)).length / userSubjects.length * 100) : null;
  rows.push(compareNumber("roles", roleCoverage(beforeLens), roleCoverage(afterLens), { label: "대표 렌즈 역할 커버리지", unit: "%", scale: 100 }));
  rows.push(unknownCapability("opticalUnknown", "렌즈 AF 속도·포커스 브리딩·실제 해상력 데이터가 없습니다.", "렌즈 광학·영상 특성"));
  return rows;
}

// Tags express demonstrated catalogue roles, not a measured performance score.
export function scoreRoleCoverage(subjects, body, lenses) {
  if (!subjects.length || !Array.isArray(body.useTags) || body.dataStatus === "unknown" || !lenses.length || lenses.some((lens) => lens.dataStatus === "unknown" || !Array.isArray(lens.roles))) return null;
  return Math.round(subjects.filter((subject) => body.useTags.includes(subject) && lenses.some((lens) => lens.roles.includes(subject))).length / subjects.length * 100);
}

export function scorePhotoVideo(ratio, body, lenses) {
  const weights = RATIO_WEIGHTS[ratio] || RATIO_WEIGHTS["사진 50% / 영상 50%"];
  let total = 0;
  for (const [kind, weight] of Object.entries(weights)) {
    if (weight === 0) continue;
    const key = `${kind}Score`;
    if (!Number.isFinite(body[key]) || !lenses.length || lenses.some((lens) => !Number.isFinite(lens[key]))) return null;
    total += (body[key] + averageKnown(lenses.map((lens) => lens[key]))) / 2 * 20 * weight;
  }
  return Math.round(total);
}
