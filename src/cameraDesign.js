// 외형을 설명하는 MVP 분류입니다. 성능이나 조작성의 우열을 뜻하지 않습니다.
export const DESIGN_OPTIONS = [
  { value: "any", label: "상관없음" },
  { value: "slr", label: "SLR형" },
  { value: "rangefinder", label: "레인지파인더형" },
  { value: "classic", label: "클래식 / 레트로" },
  { value: "minimal", label: "컴팩트 / 미니멀" },
];

export function scoreDesignPreference(body, preference = "any") {
  if (!preference || preference === "any") return 0;
  if (!Array.isArray(body?.designTags) || !body.designTags.length) return null;
  return body.designTags.includes(preference) ? 100 : 0;
}
