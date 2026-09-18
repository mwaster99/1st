import { CATALOG_BODIES, LEGACY_CAMERA_POLICY } from "./cameraCatalog.js";

const brandLabels = { Sony: "소니", Canon: "캐논", Nikon: "니콘", Fujifilm: "후지필름", Panasonic: "파나소닉", Leica: "라이카", Ricoh: "리코", "OM System": "OM System", Sigma: "시그마" };
export function priceBand(value) {
  if (!Number.isFinite(value)) return "가격 미확인";
  return value <= 100 ? "100만원 이하" : value <= 200 ? "100~200만원" : value <= 400 ? "200~400만원" : "400만원 이상";
}
export const CAMERA_ITEMS = CATALOG_BODIES.map((body) => {
  const policy = LEGACY_CAMERA_POLICY.additional[body.id];
  return { id: body.id, name: body.name, family: body.kind === "fixed" ? "똑딱이" : "렌즈교환식",
    type: body.kind === "fixed" ? "컴팩트" : body.kind === "dslr" ? "DSLR" : "미러리스",
    brand: brandLabels[body.brand] || body.brand, sensor: body.sensor?.format === "1인치" ? "1인치 이하" : body.sensor?.format || "미확인",
    price: priceBand(body.newPrice), purpose: policy?.purpose ?? null,
    // Preserve previous classifications; don't infer physical size from bodyStyle.
    isCompactBody: policy?.isCompactBody ?? null,
  };
});
export const CAMERA_DETAILS = Object.fromEntries(CATALOG_BODIES.map((body) => {
  const policy = LEGACY_CAMERA_POLICY.additional[body.id];
  return [body.name, { id: body.id, newPrice: body.newPrice, usedPrice: body.usedPrice, price: body.price,
    weight: Number.isFinite(body.weight) ? `${body.weight}g` : "무게 미확인",
    strength: policy?.strength || "용도 적합성 평가 미등록",
    caution: policy?.caution || "가격·사용 경험은 미확인입니다. 확인된 제원을 기준으로 비교하세요.",
  }];
}));

export function calculateFunding(price, cash, monthlySaving) {
  const cashValue = Number(cash), savingValue = Number(monthlySaving);
  const shortfall = Number.isFinite(price) && price >= 0 && Number.isFinite(cashValue) && cashValue >= 0 ? Math.max(0, price - cashValue) : null;
  return { shortfall, months: shortfall !== null && Number.isFinite(savingValue) && savingValue > 0 ? Math.ceil(shortfall / savingValue) : null };
}
