import { useState } from "react";
import CameraUpgradeEngineDiagnosis from "./src/CameraUpgradeSystemDiagnosis.jsx";
import { CAMERA_LENSES as CAMERA_LENS_DATABASE, LENS_BY_NAME as CAMERA_LENS_BY_NAME, createUnknownLens as createUnknownCameraLens } from "./src/cameraData.js";

const CATEGORIES = [
  {
    id: "pc",
    code: "PC",
    label: "PC / 컴퓨터",
    customFlow: "pc",
    sub: [
      { id: "body", label: "본체만" },
      { id: "body_peripheral", label: "본체 + 주변기기" },
    ],
    purpose: [
      { id: "office", label: "사무용" },
      { id: "gaming", label: "게임용" },
      { id: "graphic", label: "그래픽 작업용" },
      { id: "dev", label: "개발용" },
    ],
  },
  { id: "camera", code: "CAM", label: "카메라", filterMode: true },
  {
    id: "tablet",
    code: "TAB",
    label: "태블릿 PC",
    comingSoon: true,
    sub: [
      { id: "ipad_pro", label: "아이패드 프로" },
      { id: "ipad_air", label: "아이패드 에어" },
      { id: "ipad_base", label: "아이패드 기본형" },
      { id: "ipad_mini", label: "아이패드 미니" },
      { id: "galaxy_tab", label: "갤럭시 탭" },
      { id: "surface", label: "서피스" },
      { id: "other", label: "기타 안드로이드 태블릿" },
    ],
    purpose: [
      { id: "draw", label: "필기 / 드로잉" },
      { id: "watch", label: "영상 시청" },
      { id: "work", label: "작업용" },
      { id: "study", label: "학습용" },
    ],
  },
  {
    id: "peripheral",
    code: "PRPH",
    label: "주변기기",
    customFlow: "peripheral",
    sub: [
      { id: "monitor", label: "모니터", brands: ["LG", "삼성", "Dell", "ASUS", "BenQ", "Apple"], purpose: [
        { id: "office", label: "사무용" }, { id: "gaming", label: "게이밍" }, { id: "color", label: "색보정 / 작업용" },
      ]},
      { id: "keyboard", label: "키보드", brands: ["로지텍", "Keychron", "Razer", "Corsair", "레오폴드", "NuPhy"], purpose: [
        { id: "office", label: "사무 / 타건감" }, { id: "gaming", label: "게이밍" }, { id: "dev", label: "프로그래밍" },
      ]},
      { id: "mouse", label: "마우스", brands: ["로지텍", "Razer", "SteelSeries", "Pulsar", "Zowie", "Apple"], purpose: [
        { id: "office", label: "사무용" }, { id: "gaming", label: "게이밍" }, { id: "design", label: "디자인 작업용" },
      ]},
      { id: "headset", label: "헤드셋", brands: ["Sony", "Bose", "Logitech G", "SteelSeries", "HyperX", "Sennheiser"], purpose: [
        { id: "music", label: "음악 감상" }, { id: "gaming", label: "게이밍" }, { id: "call", label: "화상회의" },
      ]},
      { id: "speaker", label: "스피커", brands: ["Genelec", "Edifier", "Creative", "Bose", "Harman Kardon", "JBL"], purpose: [
        { id: "music", label: "음악 감상" }, { id: "movie", label: "영화 / 영상" }, { id: "desk", label: "데스크테리어" },
      ]},
    ],
  },
  {
    id: "minipc",
    code: "MINI",
    label: "미니 PC",
    comingSoon: true,
    sub: [
      { id: "macmini_base", label: "맥미니 기본형 칩" },
      { id: "macmini_pro", label: "맥미니 프로 칩" },
      { id: "windows_minipc", label: "윈도우 미니PC" },
      { id: "nuc", label: "인텔 NUC 등 기타" },
    ],
    purpose: [
      { id: "office", label: "사무용" },
      { id: "dev", label: "개발용" },
      { id: "media", label: "미디어 서버용" },
      { id: "home_server", label: "홈서버용" },
    ],
  },
];

// ---- 카메라 필터 방식 데이터 ----
const FAMILY_OPTIONS = ["똑딱이", "렌즈교환식"];

const CAMERA_FACETS = {
  type: ["컴팩트", "미러리스", "DSLR", "필름카메라"],
  brand: ["캐논", "니콘", "소니", "후지필름", "파나소닉", "라이카", "리코/펜탁스"],
  sensor: ["1인치 이하", "마이크로포서드", "APS-C", "풀프레임"],
  price: ["100만원 이하", "100~200만원", "200~400만원", "400만원 이상"],
  purpose: ["인물 촬영", "풍경 촬영", "일상 스냅", "영상 촬영"],
};

const CAMERA_FACET_LABEL = {
  type: "카메라 유형",
  brand: "브랜드",
  sensor: "센서 크기",
  price: "가격대",
  purpose: "사용 목적",
};

const PURPOSE_QUICK_CHIPS = ["인물 촬영", "여행 / 풍경 사진", "브이로그 / 영상", "데일리 스냅", "이벤트 / 행사 촬영"];

const CAMERA_ITEMS = [
  { name: "소니 RX100 VII", family: "똑딱이", type: "컴팩트", brand: "소니", sensor: "1인치 이하", price: "100~200만원", isCompactBody: true, purpose: ["일상 스냅", "영상 촬영"] },
  { name: "후지필름 X100VI", family: "똑딱이", type: "컴팩트", brand: "후지필름", sensor: "APS-C", price: "200~400만원", isCompactBody: true, purpose: ["일상 스냅", "인물 촬영"] },
  { name: "리코 GR IIIx", family: "똑딱이", type: "컴팩트", brand: "리코/펜탁스", sensor: "APS-C", price: "100~200만원", isCompactBody: true, purpose: ["일상 스냅", "풍경 촬영"] },
  { name: "라이카 Q3", family: "똑딱이", type: "컴팩트", brand: "라이카", sensor: "풀프레임", price: "400만원 이상", isCompactBody: true, purpose: ["일상 스냅", "인물 촬영"] },
  { name: "캐논 EOS R6 Mark II", family: "렌즈교환식", type: "미러리스", brand: "캐논", sensor: "풀프레임", price: "200~400만원", isCompactBody: false, purpose: ["인물 촬영", "영상 촬영"] },
  { name: "소니 A7 IV", family: "렌즈교환식", type: "미러리스", brand: "소니", sensor: "풀프레임", price: "200~400만원", isCompactBody: false, purpose: ["인물 촬영", "풍경 촬영", "영상 촬영"] },
  { name: "소니 A7C II", family: "렌즈교환식", type: "미러리스", brand: "소니", sensor: "풀프레임", price: "200~400만원", isCompactBody: true, purpose: ["인물 촬영", "풍경 촬영", "영상 촬영"] },
  { name: "후지필름 X-T5", family: "렌즈교환식", type: "미러리스", brand: "후지필름", sensor: "APS-C", price: "200~400만원", isCompactBody: false, purpose: ["풍경 촬영", "일상 스냅"] },
  { name: "후지필름 X-E4", family: "렌즈교환식", type: "미러리스", brand: "후지필름", sensor: "APS-C", price: "100~200만원", isCompactBody: true, purpose: ["일상 스냅", "풍경 촬영"] },
  { name: "파나소닉 루믹스 G9 II", family: "렌즈교환식", type: "미러리스", brand: "파나소닉", sensor: "마이크로포서드", price: "200~400만원", isCompactBody: false, purpose: ["영상 촬영", "풍경 촬영"] },
  { name: "파나소닉 루믹스 GX85", family: "렌즈교환식", type: "미러리스", brand: "파나소닉", sensor: "마이크로포서드", price: "100만원 이하", isCompactBody: true, purpose: ["일상 스냅"] },
  { name: "니콘 Z6 III", family: "렌즈교환식", type: "미러리스", brand: "니콘", sensor: "풀프레임", price: "200~400만원", isCompactBody: false, purpose: ["인물 촬영", "영상 촬영"] },
  { name: "캐논 EOS 90D", family: "렌즈교환식", type: "DSLR", brand: "캐논", sensor: "APS-C", price: "100~200만원", isCompactBody: false, purpose: ["인물 촬영", "풍경 촬영"] },
  { name: "니콘 D780", family: "렌즈교환식", type: "DSLR", brand: "니콘", sensor: "풀프레임", price: "200~400만원", isCompactBody: false, purpose: ["풍경 촬영", "인물 촬영"] },
];

// 시연용 참고가입니다. 실제 서비스에서는 판매처·중고 거래 API로 교체할 수 있습니다.
const CAMERA_DETAILS = {
  "소니 RX100 VII": { newPrice: 142, usedPrice: 95, weight: "302g", strength: "주머니에 넣는 고화질 여행 카메라", caution: "작은 센서와 높은 신품 가격" },
  "후지필름 X100VI": { newPrice: 224, usedPrice: 255, weight: "521g", strength: "필름 감성과 뛰어난 일상 스냅", caution: "고정 렌즈·품귀로 웃돈 가능" },
  "리코 GR IIIx": { newPrice: 139, usedPrice: 125, weight: "262g", strength: "가볍고 자연스러운 스냅", caution: "망원·영상 활용은 제한적" },
  "라이카 Q3": { newPrice: 890, usedPrice: 760, weight: "743g", strength: "풀프레임 고정렌즈의 완성도", caution: "매우 높은 초기 비용" },
  "캐논 EOS R6 Mark II": { newPrice: 299, usedPrice: 220, weight: "670g", strength: "인물·영상 모두 안정적인 균형", caution: "렌즈 예산을 별도로 고려해야 함" },
  "소니 A7 IV": { newPrice: 319, usedPrice: 240, weight: "659g", strength: "검증된 풀프레임 하이브리드", caution: "바디와 렌즈를 합치면 무거워짐" },
  "소니 A7C II": { newPrice: 269, usedPrice: 210, weight: "514g", strength: "풀프레임인데 휴대성이 좋음", caution: "그립과 조작계가 작은 편" },
  "후지필름 X-T5": { newPrice: 249, usedPrice: 195, weight: "557g", strength: "고해상도 APS-C 사진 작업", caution: "영상 연속 촬영 조건 확인 필요" },
  "후지필름 X-E4": { newPrice: 125, usedPrice: 150, weight: "364g", strength: "가벼운 렌즈교환식 스냅", caution: "단종·중고 시세 변동이 큼" },
  "파나소닉 루믹스 G9 II": { newPrice: 239, usedPrice: 180, weight: "658g", strength: "강력한 영상 기능과 연사", caution: "저조도는 큰 센서보다 불리" },
  "파나소닉 루믹스 GX85": { newPrice: 75, usedPrice: 48, weight: "426g", strength: "부담 없는 입문 영상·스냅", caution: "최신 AF 성능은 제한적" },
  "니콘 Z6 III": { newPrice: 319, usedPrice: 280, weight: "760g", strength: "빠른 AF와 영상 성능", caution: "무게와 렌즈 비용 확인 필요" },
  "캐논 EOS 90D": { newPrice: 150, usedPrice: 90, weight: "701g", strength: "광학 뷰파인더와 긴 배터리", caution: "DSLR 렌즈군과 영상 AF 특성 고려" },
  "니콘 D780": { newPrice: 230, usedPrice: 135, weight: "840g", strength: "탄탄한 DSLR 조작성과 화질", caution: "휴대성과 미러리스 확장성은 낮음" },
};

function chipStyle(active) {
  return {
    padding: "7px 12px",
    borderRadius: 999,
    fontSize: 13,
    cursor: "pointer",
    border: active ? "1px solid #FFB020" : "1px solid #2A2E34",
    background: active ? "rgba(255,176,32,0.12)" : "#1D2024",
    color: active ? "#FFB020" : "#ECECEA",
    transition: "all 120ms ease",
  };
}

const FIRST_PURCHASE_SYSTEMS = [
  { name: "Sony A7C II + FE 28-60mm", style: "휴대성 중심", type: "interchange", mount: "Sony E", body: "Sony A7C II", lens: "FE 28-60mm F4-5.6", bodyNew: 269, lensNew: 35, bodyUsed: 210, lensUsed: 22, uses: ["여행 · 일상", "인물", "브이로그 · 영상"], portable: 3, video: 3, why: "작고 가벼운 풀프레임 구성으로 여행과 일상에 부담이 적어요." },
  { name: "Fujifilm X-S20 + XF 18-55mm", style: "균형 중심", type: "interchange", mount: "Fujifilm X", body: "Fujifilm X-S20", lens: "XF 18-55mm F2.8-4", bodyNew: 185, lensNew: 52, bodyUsed: 145, lensUsed: 38, uses: ["여행 · 일상", "인물", "브이로그 · 영상"], portable: 2, video: 3, why: "밝은 표준줌을 포함해 사진과 영상을 균형 있게 시작하기 좋아요." },
  { name: "Canon EOS R8 + RF 24-50mm", style: "화질 중심", type: "interchange", mount: "Canon RF", body: "Canon EOS R8", lens: "RF 24-50mm F4.5-6.3", bodyNew: 205, lensNew: 35, bodyUsed: 160, lensUsed: 23, uses: ["여행 · 일상", "인물", "가족 · 반려동물"], portable: 2, video: 2, why: "풀프레임 화질과 인물 촬영을 비교적 가벼운 구성으로 가져갈 수 있어요." },
  { name: "Fujifilm X100VI", style: "올인원 스냅", type: "fixed", mount: null, body: "Fujifilm X100VI", lens: "23mm F2 고정 렌즈", bodyNew: 224, lensNew: 0, bodyUsed: 255, lensUsed: 0, uses: ["여행 · 일상", "인물", "풍경"], portable: 3, video: 1, why: "렌즈 선택에 시간을 쓰지 않고 사진 경험 자체에 집중하기 좋은 구성입니다." },
  { name: "Ricoh GR IIIx", style: "최소 휴대성", type: "fixed", mount: null, body: "Ricoh GR IIIx", lens: "40mm 상당 고정 렌즈", bodyNew: 139, lensNew: 0, bodyUsed: 125, lensUsed: 0, uses: ["여행 · 일상", "인물"], portable: 4, video: 0, why: "매일 들고 다니며 자연스러운 스냅을 남기고 싶을 때 역할이 분명해요." },
];

function FirstPurchaseSystemDiagnosis({ onBack }) {
  const [step, setStep] = useState(0);
  const [advanced, setAdvanced] = useState(false);
  const [answers, setAnswers] = useState({ type: "", ownsLenses: "", ownedLenses: [], lensInput: "", subject: [], video: "", portability: "", lensCount: "", budget: 200, condition: "신품·중고 모두 고려", bodyBudget: "", lensBudget: "" });
  const questions = [
    { key: "type", title: "어떤 방식의 카메라를 원하시나요?", hint: "아직 모르겠다면 장비병자가 두 방식을 함께 비교해드릴게요.", options: ["렌즈교환식으로 시작하고 싶어요", "고정 렌즈 카메라가 좋아요", "아직 잘 모르겠어요"] },
    ...(answers.type === "렌즈교환식으로 시작하고 싶어요" ? [{ key: "ownsLenses", title: "이미 가지고 있거나 따로 쓸 렌즈가 있나요?", hint: "있다면 마운트만 고르지 않고 실제 렌즈 모델을 등록합니다.", options: ["보유 렌즈 없음", "보유 렌즈 있음"] }] : []),
    ...(answers.type === "렌즈교환식으로 시작하고 싶어요" && answers.ownsLenses === "보유 렌즈 있음" ? [{ key: "ownedLenses", title: "보유한 렌즈 모델을 등록해주세요.", hint: "검색해서 여러 개 추가할 수 있고, 목록에 없다면 직접 입력할 수도 있습니다.", lensSearch: true }] : []),
    { key: "subject", title: "무엇을 가장 많이 찍고 싶나요?", hint: "여러 개를 골라도 됩니다.", multi: true, options: ["여행 · 일상", "인물", "풍경", "브이로그 · 영상", "가족 · 반려동물"] },
    { key: "video", title: "사진과 영상의 비중은 어떤가요?", hint: "영상 비중이 높으면 AF와 손떨림 보정을 더 중요하게 봐요.", options: ["사진 위주", "사진과 영상 반반", "영상 비중이 높아요"] },
    { key: "portability", title: "휴대성은 얼마나 중요하나요?", hint: "카메라를 자주 쓰게 되는 가장 현실적인 조건이에요.", options: ["매일 가볍게 들고 다니고 싶어요", "여행이나 약속 때 챙길 거예요", "무게보다 결과물이 중요해요"] },
    ...(answers.type !== "고정 렌즈 카메라가 좋아요" ? [{ key: "lensCount", title: "렌즈를 여러 개 들고 다니는 건 어떤가요?", hint: "렌즈교환식 시스템의 추천 구성이 달라집니다.", options: ["한 개로 끝내고 싶어요", "두 개 정도는 괜찮아요", "여러 개 교환해도 괜찮아요"] }] : []),
  ];
  const question = questions[step];
  const ownedLenses = answers.ownedLenses.map((name) => CAMERA_LENS_BY_NAME[name] || createUnknownCameraLens(name));
  const hasLens = ownedLenses.length > 0;
  const candidates = FIRST_PURCHASE_SYSTEMS.map((system) => {
    const isUsed = answers.condition === "중고 우선" || (answers.condition === "신품·중고 모두 고려" && system.bodyUsed + system.lensUsed < system.bodyNew + system.lensNew);
    const bodyPrice = isUsed ? system.bodyUsed : system.bodyNew;
    const compatibleOwnedLens = ownedLenses.find((lens) => lens.mount && lens.mount === system.mount);
    const lensPrice = compatibleOwnedLens ? 0 : (isUsed ? system.lensUsed : system.lensNew);
    const total = bodyPrice + lensPrice;
    let score = system.uses.filter((use) => answers.subject.includes(use)).length * 5;
    if (answers.type === "렌즈교환식으로 시작하고 싶어요" && system.type === "interchange") score += 4;
    if (answers.type === "고정 렌즈 카메라가 좋아요" && system.type === "fixed") score += 4;
    if (compatibleOwnedLens) score += 8;
    if (answers.portability === "매일 가볍게 들고 다니고 싶어요") score += system.portable;
    if (answers.video === "영상 비중이 높아요") score += system.video;
    if (answers.lensCount === "한 개로 끝내고 싶어요" && system.lens.includes("고정") ) score += 3;
    const matchedUses = system.uses.filter((use) => answers.subject.includes(use)).length;
    const purposeFit = answers.subject.length ? Math.round((matchedUses / answers.subject.length) * 100) : 50;
    const portabilityLabel = system.portable >= 4 ? "매우 가벼움" : system.portable >= 3 ? "가벼운 편" : system.portable >= 2 ? "보통" : "결과물 우선";
    const mediaFit = answers.video === "영상 비중이 높아요" ? (system.video >= 3 ? "영상에도 적합" : system.video >= 2 ? "사진·영상 균형" : "사진 중심") : answers.video === "사진과 영상 반반" ? (system.video >= 2 ? "사진·영상 균형" : "사진 중심") : "사진 중심에 적합";
    return { ...system, lens: compatibleOwnedLens ? `${compatibleOwnedLens.name} (보유)` : system.lens, total, bodyPrice, lensPrice, priceType: isUsed ? "중고" : "신품", purposeFit, portabilityLabel, mediaFit, score };
  }).filter((system) => system.total <= Number(answers.budget || 0) && (!advanced || (!answers.bodyBudget || system.bodyPrice <= Number(answers.bodyBudget)) && (!answers.lensBudget || system.lensPrice <= Number(answers.lensBudget)))).sort((a, b) => b.score - a.score || a.total - b.total);
  function choose(value) { setAnswers((prev) => ({ ...prev, [question.key]: value, ...(question.key === "ownsLenses" && value === "보유 렌즈 없음" ? { ownedLenses: [], lensInput: "" } : {}) })); setStep((prev) => prev + 1); }
  function toggleSubject(value) { setAnswers((prev) => ({ ...prev, subject: prev.subject.includes(value) ? prev.subject.filter((item) => item !== value) : [...prev.subject, value] })); }

  if (step < questions.length && question.lensSearch) {
    const addLens = () => { const value = answers.lensInput.trim(); if (value && !answers.ownedLenses.includes(value)) setAnswers((prev) => ({ ...prev, ownedLenses: [...prev.ownedLenses, value], lensInput: "" })); };
    return <><button className="gw-back" onClick={() => setStep((prev) => prev - 1)}>← 이전 질문</button><div style={{ marginTop: 18, color: "#3DDC97", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>첫 구매 진단 · {step + 1}/{questions.length + 1}</div><h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, margin: "10px 0 6px" }}>{question.title}</h2><p style={{ color: "#8B8F98", fontSize: 13, lineHeight: 1.6 }}>{question.hint}</p><div style={{ display: "flex", gap: 8 }}><input list="first-purchase-lens-list" value={answers.lensInput} onChange={(event) => setAnswers((prev) => ({ ...prev, lensInput: event.target.value }))} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addLens(); } }} placeholder="예: Sony FE 40mm F2.5 G" style={{ flex: 1, padding: 11, borderRadius: 8, background: "#1D2024", border: "1px solid #2A2E34", color: "#ECECEA" }} /><button onClick={addLens} style={{ padding: "0 14px", borderRadius: 8, border: "none", background: "#FFB020", color: "#14161A", fontWeight: 700 }}>추가</button></div><datalist id="first-purchase-lens-list">{CAMERA_LENS_DATABASE.map((lens) => <option key={lens.id} value={lens.name}>{lens.mount}</option>)}</datalist><div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>{ownedLenses.map((lens) => <span key={lens.id} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 10px", borderRadius: 999, background: "#23262B", color: "#ECECEA", fontSize: 12 }}>{lens.name}{lens.dataStatus === "unknown" ? " · 마운트 미확인" : ""}<button onClick={() => setAnswers((prev) => ({ ...prev, ownedLenses: prev.ownedLenses.filter((name) => name !== lens.name) }))} style={{ border: "none", background: "transparent", color: "#8B8F98", cursor: "pointer", padding: 0 }}>×</button></span>)}</div>{ownedLenses.some((lens) => lens.dataStatus === "unknown") && <p style={{ color: "#FFB020", fontSize: 11 }}>DB에 없는 렌즈는 마운트를 임의로 추정하지 않아 호환 시스템의 가격을 0원으로 만들지 않습니다.</p>}<button disabled={!ownedLenses.length} onClick={() => setStep((prev) => prev + 1)} style={{ marginTop: 18, padding: "11px 18px", border: "none", borderRadius: 8, background: "#FFB020", color: "#14161A", fontWeight: 700, opacity: ownedLenses.length ? 1 : .45 }}>렌즈 등록 완료 ({ownedLenses.length})</button></>;
  }
  if (step < questions.length) return <><button className="gw-back" onClick={step === 0 ? onBack : () => setStep((prev) => prev - 1)}>← {step === 0 ? "시작 화면으로" : "이전 질문"}</button><div style={{ marginTop: 18, color: "#3DDC97", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>첫 구매 진단 · {step + 1}/{questions.length + 1}</div><h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, margin: "10px 0 6px" }}>{question.title}</h2><p style={{ color: "#8B8F98", fontSize: 13, margin: "0 0 20px" }}>{question.hint}</p><div className="gw-grid">{question.options.map((option) => <button key={option} className="gw-card" onClick={() => question.multi ? toggleSubject(option) : choose(option)} style={question.multi && answers.subject.includes(option) ? { borderColor: "#FFB020", background: "rgba(255,176,32,0.1)" } : undefined}><div style={{ fontSize: 14, fontWeight: 600 }}>{option}{question.multi && answers.subject.includes(option) ? "  ✓" : ""}</div></button>)}</div>{question.multi && <button disabled={!answers.subject.length} onClick={() => setStep((prev) => prev + 1)} style={{ marginTop: 18, padding: "11px 18px", border: "none", borderRadius: 8, background: "#FFB020", color: "#14161A", fontWeight: 700, opacity: answers.subject.length ? 1 : .45 }}>선택 완료 ({answers.subject.length})</button>}</>;
  if (step === questions.length) return <><button className="gw-back" onClick={() => setStep((prev) => prev - 1)}>← 이전 질문</button><div style={{ marginTop: 18, color: "#3DDC97", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>첫 구매 진단 · 마지막</div><h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, margin: "10px 0 6px" }}>카메라 시스템 전체 예산은 얼마인가요?</h2><p style={{ color: "#8B8F98", fontSize: 13, lineHeight: 1.6 }}>바디와 기본 렌즈를 포함한 총예산입니다. 적절한 예산 배분은 장비병자가 제안할게요.</p><div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "15px 0" }}>{[100, 150, 200, 300, 500].map((value) => <button key={value} onClick={() => setAnswers((prev) => ({ ...prev, budget: value }))} style={chipStyle(Number(answers.budget) === value)}>{value === 500 ? "500만원+" : `${value}만원`}</button>)}<button onClick={() => setAnswers((prev) => ({ ...prev, budget: "" }))} style={chipStyle(answers.budget === "")}>직접 입력</button></div><input type="number" min="0" value={answers.budget} placeholder="전체 예산 (만원)" onChange={(e) => setAnswers((prev) => ({ ...prev, budget: e.target.value }))} style={{ width: "100%", padding: 12, borderRadius: 8, background: "#1D2024", border: "1px solid #2A2E34", color: "#ECECEA" }} /><div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 15 }}>{["신품 우선", "신품·중고 모두 고려", "중고 우선"].map((option) => <button key={option} onClick={() => setAnswers((prev) => ({ ...prev, condition: option }))} style={chipStyle(answers.condition === option)}>{option}</button>)}</div><button className="gw-back" style={{ color: "#FFB020", marginTop: 16 }} onClick={() => setAdvanced((value) => !value)}>{advanced ? "− 고급 예산 설정 닫기" : "+ 바디와 렌즈 예산을 직접 나눌래요"}</button>{advanced && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginTop: 8 }}><input type="number" min="0" placeholder="바디 최대 (만원)" value={answers.bodyBudget} onChange={(e) => setAnswers((prev) => ({ ...prev, bodyBudget: e.target.value }))} style={{ padding: 10, borderRadius: 8, background: "#1D2024", border: "1px solid #2A2E34", color: "#ECECEA" }} /><input type="number" min="0" placeholder="렌즈 최대 (만원)" value={answers.lensBudget} onChange={(e) => setAnswers((prev) => ({ ...prev, lensBudget: e.target.value }))} style={{ padding: 10, borderRadius: 8, background: "#1D2024", border: "1px solid #2A2E34", color: "#ECECEA" }} /></div>}<button onClick={() => setStep((prev) => prev + 1)} style={{ marginTop: 20, padding: "11px 18px", border: "none", borderRadius: 8, background: "#FFB020", color: "#14161A", fontWeight: 700 }}>내 카메라 시스템 보기</button></>;
  const best = candidates[0];
  const alternatives = candidates.slice(1);
  return <><button className="gw-back" onClick={() => setStep(0)}>← 진단 다시 하기</button><div style={{ marginTop: 18, color: "#3DDC97", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>FIRST PURCHASE · SYSTEM RESULT</div><h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 23, margin: "10px 0 6px" }}>가장 먼저 볼 구성을 정리했어요.</h2><p style={{ color: "#8B8F98", fontSize: 13, lineHeight: 1.6 }}>{answers.subject.join(" · ")} · 총예산 {answers.budget}만원 · {hasLens ? "보유 렌즈 활용" : "기본 렌즈 포함"}</p>
    {best ? <><section style={{ marginTop: 16, background: "linear-gradient(145deg, rgba(255,176,32,0.13), #1D2024 42%)", border: "2px solid #FFB020", borderRadius: 15, padding: 19 }}><div style={{ color: "#FFB020", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700 }}>BEST FIRST SYSTEM · 가장 추천하는 첫 시스템</div><h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, margin: "10px 0 2px" }}>{best.body}</h3><div style={{ color: "#ECECEA", fontSize: 14 }}>{best.lens}</div><div style={{ color: "#3DDC97", fontSize: 12, fontWeight: 700, marginTop: 6 }}>{best.style}</div><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(125px, 1fr))", gap: 8, marginTop: 14 }}><div style={{ background: "#14161A", borderRadius: 9, padding: 11 }}><div style={{ color: "#777D86", fontSize: 9 }}>예상 총가격</div><div style={{ color: "#3DDC97", fontSize: 18, fontWeight: 750, marginTop: 6 }}>{best.total}만원</div><div style={{ color: "#777D86", fontSize: 10, marginTop: 4 }}>{best.priceType} · 예산 잔액 {Number(answers.budget) - best.total}만원</div></div><div style={{ background: "#14161A", borderRadius: 9, padding: 11 }}><div style={{ color: "#777D86", fontSize: 9 }}>촬영 목적 적합도</div><div style={{ color: "#ECECEA", fontSize: 17, fontWeight: 750, marginTop: 6 }}>{best.purposeFit}%</div><div style={{ color: "#777D86", fontSize: 10, marginTop: 4 }}>{answers.subject.join(" · ")}</div></div><div style={{ background: "#14161A", borderRadius: 9, padding: 11 }}><div style={{ color: "#777D86", fontSize: 9 }}>휴대성</div><div style={{ color: "#ECECEA", fontSize: 15, fontWeight: 750, marginTop: 6 }}>{best.portabilityLabel}</div></div><div style={{ background: "#14161A", borderRadius: 9, padding: 11 }}><div style={{ color: "#777D86", fontSize: 9 }}>사진·영상 적합도</div><div style={{ color: "#ECECEA", fontSize: 14, fontWeight: 750, marginTop: 6 }}>{best.mediaFit}</div></div></div><div style={{ background: "rgba(20,22,26,0.72)", borderRadius: 9, padding: "12px 13px", marginTop: 12 }}><b style={{ fontSize: 12 }}>왜 이 시스템인가요?</b><p style={{ color: "#B8BCC3", fontSize: 12, lineHeight: 1.65, margin: "5px 0 0" }}>{best.why}</p></div></section>
      {alternatives.length > 0 && <section style={{ marginTop: 23 }}><h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, margin: "0 0 10px" }}>다른 첫 구매 대안</h3><div style={{ display: "grid", gap: 9 }}>{alternatives.map((system, index) => <details key={system.name} style={{ background: "#1D2024", border: "1px solid #2A2E34", borderRadius: 11, padding: "0 14px" }}><summary style={{ cursor: "pointer", padding: "14px 2px" }}><div style={{ display: "inline-grid", width: "calc(100% - 14px)", gridTemplateColumns: "1fr auto", gap: 10, verticalAlign: "middle" }}><div><div style={{ color: "#FFB020", fontFamily: "'JetBrains Mono', monospace", fontSize: 9 }}>대안 {index + 2} · {system.style}</div><div style={{ fontWeight: 700, fontSize: 14, marginTop: 5 }}>{system.body} + {system.lens}</div></div><div style={{ color: "#3DDC97", fontWeight: 750, fontSize: 14 }}>{system.total}만원</div></div></summary><div style={{ borderTop: "1px solid #2A2E34", padding: "11px 0 14px" }}><p style={{ color: "#AEB2B9", fontSize: 11, lineHeight: 1.6, marginTop: 0 }}>{system.why}</p><div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}><span style={chipStyle(false)}>촬영 목적 {system.purposeFit}%</span><span style={chipStyle(false)}>{system.portabilityLabel}</span><span style={chipStyle(false)}>{system.mediaFit}</span></div><div style={{ color: "#777D86", fontSize: 10, marginTop: 10 }}>{system.priceType} · 예산 잔액 {Number(answers.budget) - system.total}만원</div></div></details>)}</div></section>}</> : <div style={{ marginTop: 16, background: "#1D2024", border: "1px solid #2A2E34", borderRadius: 10, padding: 16, color: "#8B8F98", fontSize: 13 }}>현재 조건과 총예산 안에서는 추천 시스템을 찾지 못했어요. 예산 또는 구매 방식을 조정해 보세요.</div>}
    <p style={{ color: "#656B74", fontSize: 11, lineHeight: 1.6, marginTop: 14 }}>가격과 구성은 MVP용 참고 데이터입니다. 점수보다 추천 이유와 실제 총비용을 먼저 확인해주세요.</p></>;
}

function CameraFilterPanel({ onBack, journey }) {
  const [family, setFamily] = useState(null);
  const [compactOnly, setCompactOnly] = useState(false);
  const [filters, setFilters] = useState({ type: [], brand: [], sensor: [], price: [], purpose: [] });
  const [compareList, setCompareList] = useState([]);
  const [purposeText, setPurposeText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [cash, setCash] = useState(0);
  const [monthlySaving, setMonthlySaving] = useState(20);

  function toggleFacet(facet, value) {
    setFilters((prev) => {
      const cur = prev[facet];
      const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
      return { ...prev, [facet]: next };
    });
  }

  function pickFamily(value) {
    setFamily((prev) => (prev === value ? null : value));
    setCompactOnly(false);
  }

  function clearAll() {
    setFilters({ type: [], brand: [], sensor: [], price: [], purpose: [] });
    setFamily(null);
    setCompactOnly(false);
  }

  function toggleCompare(name) {
    setCompareList((prev) => {
      if (prev.includes(name)) return prev.filter((n) => n !== name);
      if (prev.length >= 4) return prev;
      return [...prev, name];
    });
  }

  function addPurposeChip(chip) {
    setPurposeText((prev) => (prev.trim() ? `${prev.trim()}, ${chip}` : chip));
  }

  const results = CAMERA_ITEMS.filter((item) => {
    if (family && item.family !== family) return false;
    if (family === "렌즈교환식" && compactOnly && !item.isCompactBody) return false;
    return Object.entries(filters).every(([facet, selected]) => {
      if (selected.length === 0) return true;
      if (facet === "purpose") return item.purpose.some((p) => selected.includes(p));
      return selected.includes(item[facet]);
    });
  });

  const activeCount = Object.values(filters).reduce((a, v) => a + v.length, 0) + (family ? 1 : 0) + (compactOnly ? 1 : 0);

  async function runAiComparison() {
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);
    try {
      // API 키를 브라우저에 노출하지 않는, 즉시 실행 가능한 로컬 비교 버전입니다.
      await new Promise((resolve) => setTimeout(resolve, 350));
      const selected = CAMERA_ITEMS.filter((item) => compareList.includes(item.name));
      setAiResult({
        criteria: ["신품 참고가", "중고 참고가", "센서", "무게", "이 용도의 장점", "고려할 점"],
        cameras: selected.map((item) => {
          const detail = CAMERA_DETAILS[item.name];
          return { name: item.name, values: {
            "신품 참고가": `${detail.newPrice}만원`, "중고 참고가": `${detail.usedPrice}만원`,
            "센서": item.sensor, "무게": detail.weight,
            "이 용도의 장점": detail.strength, "고려할 점": detail.caution,
          }};
        }),
      });
    } catch (e) {
      setAiError("비교표를 만드는 중 문제가 생겼어요. 다시 시도해주세요.");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <>
      <button className="gw-back" onClick={onBack}>← 시작 화면으로</button>
      {journey && <div style={{ marginTop: 12, padding: "13px 15px", borderRadius: 10, background: "rgba(255,176,32,0.08)", border: "1px solid rgba(255,176,32,0.24)" }}><div style={{ color: "#FFB020", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>{journey.kicker}</div><div style={{ color: "#ECECEA", fontSize: 14, fontWeight: 600, marginTop: 5 }}>{journey.title}</div><div style={{ color: "#8B8F98", fontSize: 12, marginTop: 5, lineHeight: 1.5 }}>{journey.description}</div></div>}

      {/* 똑딱이 / 렌즈교환식 */}
      <div style={{ marginTop: 16, marginBottom: 18 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.06em", color: "#8B8F98", marginBottom: 8 }}>
          카메라 종류
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {FAMILY_OPTIONS.map((f) => (
            <button
              key={f}
              onClick={() => pickFamily(f)}
              style={{
                flex: 1,
                padding: "14px 12px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                border: family === f ? "1px solid #FFB020" : "1px solid #2A2E34",
                background: family === f ? "rgba(255,176,32,0.12)" : "#1D2024",
                color: family === f ? "#FFB020" : "#ECECEA",
              }}
            >
              {f}
            </button>
          ))}
        </div>
        {family === "렌즈교환식" && (
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, fontSize: 13, color: "#ECECEA", cursor: "pointer" }}>
            <input type="checkbox" checked={compactOnly} onChange={(e) => setCompactOnly(e.target.checked)} />
            컴팩트한 바디를 찾으시나요?
          </label>
        )}
      </div>

      {/* 세부 필터 */}
      {Object.keys(CAMERA_FACETS).map((facet) => (
        <div key={facet} style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.06em", color: "#8B8F98", marginBottom: 8 }}>
            {CAMERA_FACET_LABEL[facet]}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {CAMERA_FACETS[facet].map((value) => (
              <button key={value} onClick={() => toggleFacet(facet, value)} style={chipStyle(filters[facet].includes(value))}>
                {value}
              </button>
            ))}
          </div>
        </div>
      ))}

      {activeCount > 0 && (
        <button className="gw-back" style={{ color: "#FFB020" }} onClick={clearAll}>
          ↺ 필터 초기화 ({activeCount})
        </button>
      )}

      {/* 결과 */}
      <div style={{ marginTop: 22, borderTop: "1px solid #2A2E34", paddingTop: 18 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#3DDC97", marginBottom: 12 }}>
          {"> "}{results.length}개 매칭됨 · 비교 담기 {compareList.length}/4
        </div>

        {results.length === 0 ? (
          <p style={{ color: "#8B8F98", fontSize: 13 }}>조건에 맞는 카메라가 없어요. 필터를 조금 줄여보세요.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {results.map((item) => {
              const inCompare = compareList.includes(item.name);
              return (
                <div key={item.name} style={{ background: "#1D2024", border: inCompare ? "1px solid #3DDC97" : "1px solid #2A2E34", borderRadius: 10, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#8B8F98", marginTop: 6 }}>
                      {item.family} · {item.type} · {item.brand} · {item.sensor} · {item.price}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleCompare(item.name)}
                    disabled={!inCompare && compareList.length >= 4}
                    style={{
                      whiteSpace: "nowrap",
                      padding: "8px 12px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontFamily: "'JetBrains Mono', monospace",
                      cursor: !inCompare && compareList.length >= 4 ? "not-allowed" : "pointer",
                      border: inCompare ? "1px solid #3DDC97" : "1px solid #2A2E34",
                      background: inCompare ? "rgba(61,220,151,0.12)" : "transparent",
                      color: inCompare ? "#3DDC97" : "#8B8F98",
                      opacity: !inCompare && compareList.length >= 4 ? 0.5 : 1,
                    }}
                  >
                    {inCompare ? "담음 ✓" : "비교 담기"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
        <p style={{ color: "#8B8F98", fontSize: 12, marginTop: 14, lineHeight: 1.6 }}>
          가격은 시연용 참고가(만원)예요. 실제 구매 전에는 판매처와 중고 시세를 꼭 확인하세요.
        </p>
      </div>

      {compareList.length > 0 && (() => {
        const choice = CAMERA_DETAILS[compareList[0]];
        const shortfall = Math.max(0, choice.newPrice - Number(cash || 0));
        const months = Number(monthlySaving) > 0 ? Math.ceil(shortfall / Number(monthlySaving)) : "-";
        return <div style={{ marginTop: 22, background: "#1D2024", border: "1px solid #2A2E34", borderRadius: 10, padding: 18 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 700 }}>첫 선택 기준 <span style={{ color: "#FFB020" }}>자금 계획</span></div>
          <p style={{ color: "#8B8F98", fontSize: 12, margin: "7px 0 14px" }}>{compareList[0]} 신품 참고가 {choice.newPrice}만원 기준</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <label style={{ color: "#8B8F98", fontSize: 12 }}>현재 마련한 금액 (만원)<input type="number" min="0" value={cash} onChange={(e) => setCash(e.target.value)} style={{ ...{ width: "100%", marginTop: 6, padding: 9, borderRadius: 7, background: "#14161A", border: "1px solid #2A2E34", color: "#ECECEA" } }} /></label>
            <label style={{ color: "#8B8F98", fontSize: 12 }}>월 저축 가능액 (만원)<input type="number" min="0" value={monthlySaving} onChange={(e) => setMonthlySaving(e.target.value)} style={{ ...{ width: "100%", marginTop: 6, padding: 9, borderRadius: 7, background: "#14161A", border: "1px solid #2A2E34", color: "#ECECEA" } }} /></label>
          </div>
          <div style={{ color: "#3DDC97", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, marginTop: 14 }}>부족액 {shortfall}만원 · 목표까지 약 {months}개월</div>
        </div>;
      })()}

      {/* AI 비교하기 */}
      {compareList.length >= 2 && (
        <div style={{ marginTop: 22, borderTop: "1px solid #2A2E34", paddingTop: 18 }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, margin: "0 0 10px" }}>
            카메라 <span style={{ color: "#FFB020" }}>AI 비교하기</span>
          </h2>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#8B8F98", marginBottom: 10 }}>
            비교 대상: {compareList.join(" · ")}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
            {PURPOSE_QUICK_CHIPS.map((chip) => (
              <button key={chip} onClick={() => addPurposeChip(chip)} style={chipStyle(false)}>
                {chip}
              </button>
            ))}
          </div>

          <textarea
            value={purposeText}
            onChange={(e) => setPurposeText(e.target.value)}
            placeholder="어떤 용도로 쓸 건지 자유롭게 적어주세요. 예: 여행 다니면서 브이로그도 찍고 싶어요"
            style={{
              width: "100%",
              minHeight: 70,
              background: "#1D2024",
              border: "1px solid #2A2E34",
              borderRadius: 8,
              color: "#ECECEA",
              fontSize: 13,
              padding: 12,
              fontFamily: "'Inter', sans-serif",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />

          <button
            onClick={runAiComparison}
            disabled={aiLoading}
            style={{
              marginTop: 12,
              padding: "10px 18px",
              borderRadius: 8,
              border: "none",
              background: "#FFB020",
              color: "#14161A",
              fontWeight: 700,
              fontSize: 13,
              cursor: aiLoading ? "default" : "pointer",
              opacity: aiLoading ? 0.7 : 1,
            }}
          >
            {aiLoading ? "AI가 비교 중이에요..." : "AI로 비교표 만들기"}
          </button>

          {aiError && <p style={{ color: "#FF6B6B", fontSize: 13, marginTop: 12 }}>{aiError}</p>}

          {aiResult && (
            <div style={{ marginTop: 18, overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "8px 10px", borderBottom: "1px solid #2A2E34", color: "#8B8F98", fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, fontSize: 11 }}>
                      항목
                    </th>
                    {aiResult.cameras.map((c) => (
                      <th key={c.name} style={{ textAlign: "left", padding: "8px 10px", borderBottom: "1px solid #2A2E34", color: "#FFB020", fontWeight: 700 }}>
                        {c.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {aiResult.criteria.map((crit) => (
                    <tr key={crit}>
                      <td style={{ padding: "8px 10px", borderBottom: "1px solid #23262B", color: "#8B8F98", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
                        {crit}
                      </td>
                      {aiResult.cameras.map((c) => (
                        <td key={c.name} style={{ padding: "8px 10px", borderBottom: "1px solid #23262B", color: "#ECECEA", lineHeight: 1.5 }}>
                          {c.values ? c.values[crit] : ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
}

const PC_PURPOSE = [
  { id: "office", label: "사무용" },
  { id: "gaming", label: "게임용" },
  { id: "graphic", label: "그래픽 작업용" },
  { id: "dev", label: "개발용" },
];

const PC_SUB = [
  { id: "body", label: "본체만" },
  { id: "body_peripheral", label: "본체 + 주변기기" },
];

const USAGE_YEARS = ["1년 미만", "1~3년", "3~5년", "5년 이상"];

const PC_SPEC_OPTIONS = {
  cpu: [
    "Intel Core i5-10400", "Intel Core i5-12400F", "Intel Core i5-13400F", "Intel Core i5-14600K",
    "Intel Core i7-10700K", "Intel Core i7-12700K", "Intel Core i7-13700", "Intel Core i7-13700K", "Intel Core i7-14700K",
    "Intel Core i9-12900K", "Intel Core i9-13900K", "Intel Core i9-14900K",
    "AMD Ryzen 5 5600", "AMD Ryzen 5 7500F", "AMD Ryzen 5 7600", "AMD Ryzen 7 5800X3D", "AMD Ryzen 7 7800X3D", "AMD Ryzen 9 7950X3D",
  ],
  gpu: [
    "NVIDIA GeForce GTX 1660 SUPER", "NVIDIA GeForce RTX 2060", "NVIDIA GeForce RTX 3060", "NVIDIA GeForce RTX 3070", "NVIDIA GeForce RTX 4060", "NVIDIA GeForce RTX 4060 Ti", "NVIDIA GeForce RTX 4070 SUPER", "NVIDIA GeForce RTX 4080 SUPER", "NVIDIA GeForce RTX 4090",
    "AMD Radeon RX 6600", "AMD Radeon RX 6700 XT", "AMD Radeon RX 7600", "AMD Radeon RX 7700 XT", "AMD Radeon RX 7800 XT", "AMD Radeon RX 7900 XTX",
  ],
  ram: ["DDR4 8GB", "DDR4 16GB", "DDR4 32GB", "DDR4 64GB", "DDR5 16GB", "DDR5 32GB", "DDR5 64GB", "DDR5 128GB"],
  storage: ["SATA SSD 500GB", "NVMe SSD 500GB", "NVMe SSD 1TB", "NVMe SSD 2TB", "NVMe SSD 4TB", "HDD 1TB", "HDD 2TB"],
};

// 시연용 상대 성능 지수와 부품 참고가(만원). 실제 서비스에서는 벤치마크·시세 데이터로 교체합니다.
const CPU_BENCHMARKS = {
  "i5-10400": 100, "i5-12400f": 132, "i5-13400f": 158, "i5-14600k": 205,
  "i7-10700k": 130, "i7-12700k": 185, "i7-13700": 215, "i7-13700k": 228, "i7-14700k": 250,
  "i9-12900k": 225, "i9-13900k": 285, "i9-14900k": 300,
  "ryzen 5 5600": 125, "ryzen 5 7500f": 168, "ryzen 5 7600": 178, "ryzen 7 5800x3d": 185, "ryzen 7 7800x3d": 250, "ryzen 9 7950x3d": 300,
};
const GPU_BENCHMARKS = {
  "gtx 1660 super": 55, "rtx 2060": 65, "rtx 3060": 100, "rtx 3070": 135,
  "rtx 4060": 115, "rtx 4060 ti": 140, "rtx 4070 super": 205, "rtx 4080 super": 295, "rtx 4090": 365,
  "rx 6600": 82, "rx 6700 xt": 128, "rx 7600": 108, "rx 7700 xt": 170, "rx 7800 xt": 205, "rx 7900 xtx": 300,
};
const UPGRADE_CANDIDATES = {
  cpu: [
    { name: "AMD Ryzen 5 7500F", score: 168, newPrice: 18, usedPrice: 14, note: "가성비 게임·일반 작업용" },
    { name: "Intel Core i5-14600K", score: 205, newPrice: 37, usedPrice: 29, note: "작업과 게임을 함께 할 때" },
    { name: "AMD Ryzen 7 7800X3D", score: 250, newPrice: 52, usedPrice: 43, note: "게임 성능을 우선할 때" },
  ],
  gpu: [
    { name: "NVIDIA GeForce RTX 4060", score: 115, newPrice: 42, usedPrice: 32, note: "FHD 게임·전력 효율" },
    { name: "NVIDIA GeForce RTX 4070 SUPER", score: 205, newPrice: 88, usedPrice: 72, note: "QHD 게임·그래픽 작업 균형" },
    { name: "AMD Radeon RX 7800 XT", score: 205, newPrice: 72, usedPrice: 57, note: "고성능 게임 가성비" },
  ],
};
const USED_PART_VALUES = {
  cpu: { "i5-10400": 5, "i5-12400f": 10, "i5-13400f": 16, "i7-10700k": 11, "i7-12700k": 20, "i7-13700": 25, "i7-13700k": 28, "ryzen 5 5600": 8, "ryzen 5 7500f": 13, "ryzen 7 5800x3d": 24, "ryzen 7 7800x3d": 40 },
  gpu: { "gtx 1660 super": 10, "rtx 2060": 13, "rtx 3060": 22, "rtx 3070": 31, "rtx 4060": 30, "rtx 4060 ti": 38, "rtx 4070 super": 70, "rx 6600": 16, "rx 6700 xt": 25, "rx 7600": 23, "rx 7800 xt": 55 },
};

function findBenchmark(value, benchmarks) {
  const input = value.toLowerCase();
  const matched = Object.entries(benchmarks)
    .sort(([a], [b]) => b.length - a.length)
    .find(([model]) => input.includes(model));
  return matched ? matched[1] : null;
}

function UpgradeSimulation({ spec, purpose }) {
  const cpuScore = findBenchmark(spec.cpu, CPU_BENCHMARKS);
  const gpuScore = findBenchmark(spec.gpu, GPU_BENCHMARKS);
  const availableKinds = [{ key: "gpu", label: "그래픽카드", score: gpuScore, value: spec.gpu }, { key: "cpu", label: "CPU", score: cpuScore, value: spec.cpu }].filter((item) => item.score);
  const [selectedKind, setSelectedKind] = useState(availableKinds[0]?.key || "gpu");
  const currentKind = availableKinds.find((item) => item.key === selectedKind) || availableKinds[0];
  const expectedSale = currentKind ? findBenchmark(currentKind.value, USED_PART_VALUES[currentKind.key]) || 0 : 0;
  const [cash, setCash] = useState(20);
  const [resale, setResale] = useState(expectedSale);
  const [monthlySaving, setMonthlySaving] = useState(20);
  const purposeName = PC_PURPOSE.find((item) => item.id === purpose)?.label || "일반 사용";
  const inputStyle = { width: "100%", marginTop: 6, padding: "9px 10px", borderRadius: 7, background: "#14161A", border: "1px solid #2A2E34", color: "#ECECEA" };
  const candidates = currentKind ? UPGRADE_CANDIDATES[currentKind.key].filter((item) => item.score > currentKind.score) : [];

  function chooseKind(kind) {
    const selected = availableKinds.find((item) => item.key === kind);
    setSelectedKind(kind);
    setResale(findBenchmark(selected.value, USED_PART_VALUES[kind]) || 0);
  }

  return <div style={{ marginTop: 20 }}>
    <div style={{ background: "#1D2024", border: "1px solid #2A2E34", borderRadius: 10, padding: 18 }}>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700 }}>내 PC 기준 <span style={{ color: "#FFB020" }}>업그레이드 시뮬레이션</span></div>
      <p style={{ color: "#8B8F98", fontSize: 13, margin: "8px 0 16px", lineHeight: 1.55 }}>{purposeName} 목적 · 상대 성능 지수와 시연용 부품 참고가를 기반으로 계산했어요.</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {availableKinds.map((item) => <button key={item.key} onClick={() => chooseKind(item.key)} style={chipStyle(selectedKind === item.key)}>{item.label} 바꾸기</button>)}
      </div>
      {currentKind && <div style={{ color: "#8B8F98", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, marginBottom: 12 }}>현재 {currentKind.label} :: {currentKind.value} · 상대 지수 {currentKind.score}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        <label style={{ color: "#8B8F98", fontSize: 11 }}>추가로 쓸 현금 (만원)<input type="number" min="0" value={cash} onChange={(e) => setCash(e.target.value)} style={inputStyle} /></label>
        <label style={{ color: "#8B8F98", fontSize: 11 }}>기존 부품 판매 예상가 (만원)<input type="number" min="0" value={resale} onChange={(e) => setResale(e.target.value)} style={inputStyle} /></label>
        <label style={{ color: "#8B8F98", fontSize: 11 }}>월 저축 가능액 (만원)<input type="number" min="0" value={monthlySaving} onChange={(e) => setMonthlySaving(e.target.value)} style={inputStyle} /></label>
      </div>
      <div style={{ marginTop: 14, color: "#3DDC97", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>판매금 포함 가용 금액 :: {Number(cash || 0) + Number(resale || 0)}만원</div>
    </div>

    {!cpuScore && !gpuScore && <p style={{ color: "#FFB020", fontSize: 13, lineHeight: 1.6 }}>입력한 CPU/GPU 모델을 성능 지수에서 찾지 못했어요. 자동완성 목록의 모델을 선택하면 상승률을 계산할 수 있습니다.</p>}
    {candidates.length > 0 && <div style={{ marginTop: 15, display: "grid", gap: 10 }}>
      {candidates.map((item) => {
        const uplift = Math.round(((item.score / currentKind.score) - 1) * 100);
        const available = Number(cash || 0) + Number(resale || 0);
        const newShortage = Math.max(0, item.newPrice - available);
        const usedShortage = Math.max(0, item.usedPrice - available);
        const extraForNew = Math.max(0, item.newPrice - Number(resale || 0));
        const extraForUsed = Math.max(0, item.usedPrice - Number(resale || 0));
        const newMonths = Number(monthlySaving) > 0 ? Math.ceil(newShortage / Number(monthlySaving)) : "-";
        const usedMonths = Number(monthlySaving) > 0 ? Math.ceil(usedShortage / Number(monthlySaving)) : "-";
        return <div key={item.name} style={{ background: "#1D2024", border: "1px solid #2A2E34", borderRadius: 10, padding: "15px 16px" }}>
          <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 10 }}><div><span style={{ color: "#8B8F98", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>{currentKind.label} 대안</span><div style={{ fontWeight: 700, fontSize: 15, marginTop: 4 }}>{item.name}</div></div><div style={{ color: "#FFB020", fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700 }}>+{uplift}%</div></div>
          <div style={{ color: "#8B8F98", fontSize: 12, marginTop: 7 }}>{item.note}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
            <div style={{ padding: 10, borderRadius: 7, background: "#14161A" }}><div style={{ color: "#8B8F98", fontSize: 11 }}>신품 참고가 {item.newPrice}만원</div><div style={{ color: "#ECECEA", fontSize: 12, marginTop: 5 }}>판매 후 {extraForNew}만원 더 필요</div><div style={{ color: newShortage ? "#FFB020" : "#3DDC97", fontSize: 11, marginTop: 4 }}>{newShortage ? `현금 기준 ${newShortage}만원 부족 · 약 ${newMonths}개월` : "현재 현금으로 가능"}</div></div>
            <div style={{ padding: 10, borderRadius: 7, background: "#14161A" }}><div style={{ color: "#8B8F98", fontSize: 11 }}>중고 참고가 {item.usedPrice}만원</div><div style={{ color: "#ECECEA", fontSize: 12, marginTop: 5 }}>판매 후 {extraForUsed}만원 더 필요</div><div style={{ color: usedShortage ? "#FFB020" : "#3DDC97", fontSize: 11, marginTop: 4 }}>{usedShortage ? `현금 기준 ${usedShortage}만원 부족 · 약 ${usedMonths}개월` : "현재 현금으로 가능"}</div></div>
          </div>
        </div>;
      })}
    </div>}
    <p style={{ color: "#8B8F98", fontSize: 11, lineHeight: 1.6, marginTop: 14 }}>※ CPU 교체에는 메인보드·RAM 호환 비용이, GPU 교체에는 파워 용량·케이스 길이 확인이 추가로 필요할 수 있어요. 성능 수치는 부품 단독의 상대 지수이며 실제 체감은 게임·작업 환경에 따라 달라집니다.</p>
  </div>;
}

function SpecAutocomplete({ label, field, value, onChange, placeholder, inputStyle, labelStyle }) {
  const [open, setOpen] = useState(false);
  const normalized = value.trim().toLowerCase();
  const suggestions = PC_SPEC_OPTIONS[field]
    .filter((option) => !normalized || option.toLowerCase().includes(normalized))
    .slice(0, 7);

  return (
    <div style={{ position: "relative" }}>
      <label style={labelStyle}>{label}</label>
      <input
        style={inputStyle}
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 140)}
        placeholder={placeholder}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
      />
      {open && (
        <div style={{ position: "absolute", zIndex: 5, left: 0, right: 0, top: "100%", maxHeight: 235, overflowY: "auto", marginTop: 5, background: "#23262B", border: "1px solid #3A4048", borderRadius: 8, boxShadow: "0 12px 28px rgba(0,0,0,0.35)" }}>
          <div style={{ padding: "8px 11px", color: "#8B8F98", fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>
            {normalized ? "추천 모델 · 직접 입력도 가능" : "자주 쓰는 모델 · 직접 입력도 가능"}
          </div>
          {suggestions.length > 0 ? suggestions.map((option) => (
            <button key={option} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { onChange(option); setOpen(false); }} style={{ display: "block", width: "100%", border: "none", background: "transparent", color: "#ECECEA", padding: "9px 11px", textAlign: "left", cursor: "pointer", fontSize: 13 }}>
              {option}
            </button>
          )) : <div style={{ padding: "10px 11px", color: "#8B8F98", fontSize: 12 }}>일치하는 모델이 없어요. 입력한 내용을 그대로 사용할게요.</div>}
        </div>
      )}
    </div>
  );
}

function PCFlowPanel({ onBack }) {
  const [pcStep, setPcStep] = useState(0); // 0: 신규/업그레이드, 1: 세부입력, 2: 목적, 3: 요약
  const [path, setPath] = useState(null); // "new" | "upgrade"
  const [sub, setSub] = useState(null);
  const [spec, setSpec] = useState({ cpu: "", gpu: "", ram: "", storage: "", years: "" });
  const [purpose, setPurpose] = useState(null);

  function pickPath(p) {
    setPath(p);
    setPcStep(1);
  }
  function updateSpec(field, value) {
    setSpec((prev) => ({ ...prev, [field]: value }));
  }
  function resetAll() {
    setPcStep(0);
    setPath(null);
    setSub(null);
    setSpec({ cpu: "", gpu: "", ram: "", storage: "", years: "" });
    setPurpose(null);
  }

  const purposeLabel = PC_PURPOSE.find((p) => p.id === purpose)?.label;
  const subLabel = PC_SUB.find((s) => s.id === sub)?.label;

  const inputStyle = {
    width: "100%",
    background: "#1D2024",
    border: "1px solid #2A2E34",
    borderRadius: 8,
    color: "#ECECEA",
    fontSize: 13,
    padding: "10px 12px",
    fontFamily: "'Inter', sans-serif",
    boxSizing: "border-box",
  };
  const labelStyle = {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    letterSpacing: "0.06em",
    color: "#8B8F98",
    marginBottom: 6,
    display: "block",
  };

  return (
    <>
      <button className="gw-back" onClick={onBack}>← 카테고리 다시 선택</button>

      {/* STEP 0: 신규 / 업그레이드 */}
      {pcStep === 0 && (
        <div className="gw-grid" style={{ marginTop: 14 }}>
          <button className="gw-card" onClick={() => pickPath("new")}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>새로 PC를 맞출래요</div>
            <div style={{ fontSize: 12, color: "#8B8F98", marginTop: 6 }}>처음부터 구성 잡기</div>
          </button>
          <button className="gw-card" onClick={() => pickPath("upgrade")}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>기존 PC를 업그레이드할래요</div>
            <div style={{ fontSize: 12, color: "#8B8F98", marginTop: 6 }}>지금 쓰는 사양 알려주기</div>
          </button>
        </div>
      )}

      {/* STEP 1-new: 본체만 / 본체+주변기기 */}
      {pcStep === 1 && path === "new" && (
        <>
          <button className="gw-back" onClick={() => setPcStep(0)}>← 다시 선택</button>
          <div className="gw-grid" style={{ marginTop: 14 }}>
            {PC_SUB.map((s) => (
              <button
                key={s.id}
                className="gw-card"
                onClick={() => {
                  setSub(s.id);
                  setPcStep(2);
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 600 }}>{s.label}</div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* STEP 1-upgrade: 현재 스펙 입력 */}
      {pcStep === 1 && path === "upgrade" && (
        <>
          <button className="gw-back" onClick={() => setPcStep(0)}>← 다시 선택</button>
          <p style={{ color: "#8B8F98", fontSize: 13, margin: "14px 0 16px" }}>
            지금 쓰고 계신 PC 사양을 알려주세요. 아는 만큼만 적으셔도 돼요.
          </p>
          <div style={{ display: "grid", gap: 14 }}>
            <SpecAutocomplete label="CPU" field="cpu" value={spec.cpu} onChange={(value) => updateSpec("cpu", value)} placeholder="예: i7 또는 Ryzen 7" inputStyle={inputStyle} labelStyle={labelStyle} />
            <SpecAutocomplete label="GPU" field="gpu" value={spec.gpu} onChange={(value) => updateSpec("gpu", value)} placeholder="예: RTX 4070 또는 RX 7800" inputStyle={inputStyle} labelStyle={labelStyle} />
            <SpecAutocomplete label="RAM" field="ram" value={spec.ram} onChange={(value) => updateSpec("ram", value)} placeholder="예: DDR5 32GB" inputStyle={inputStyle} labelStyle={labelStyle} />
            <SpecAutocomplete label="저장장치" field="storage" value={spec.storage} onChange={(value) => updateSpec("storage", value)} placeholder="예: NVMe SSD 1TB" inputStyle={inputStyle} labelStyle={labelStyle} />
            <div>
              <label style={labelStyle}>사용한 지 얼마나 됐나요?</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {USAGE_YEARS.map((y) => (
                  <button key={y} onClick={() => updateSpec("years", y)} style={chipStyle(spec.years === y)}>
                    {y}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => setPcStep(2)}
            style={{
              marginTop: 18,
              padding: "10px 18px",
              borderRadius: 8,
              border: "none",
              background: "#FFB020",
              color: "#14161A",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            다음
          </button>
        </>
      )}

      {/* STEP 2: 사용 목적 (신규/업그레이드 공통) */}
      {pcStep === 2 && (
        <>
          <button className="gw-back" onClick={() => setPcStep(1)}>← 이전으로</button>
          <p style={{ color: "#8B8F98", fontSize: 13, margin: "14px 0 16px" }}>주로 어디에 쓰실 건가요?</p>
          <div className="gw-grid">
            {PC_PURPOSE.map((p) => (
              <button
                key={p.id}
                className="gw-card"
                onClick={() => {
                  setPurpose(p.id);
                  setPcStep(3);
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 600 }}>{p.label}</div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* STEP 3: 요약 */}
      {pcStep === 3 && (
        <div style={{ background: "#1D2024", border: "1px solid #2A2E34", borderRadius: 10, padding: 22 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#3DDC97", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>
            <div>{"> "}PATH     :: {path === "new" ? "새 PC 맞추기" : "기존 PC 업그레이드"}</div>
            {path === "new" && subLabel && <div>{"> "}TYPE     :: {subLabel}</div>}
            {path === "upgrade" && (
              <>
                <div>{"> "}CPU      :: {spec.cpu || "미입력"}</div>
                <div>{"> "}GPU      :: {spec.gpu || "미입력"}</div>
                <div>{"> "}RAM      :: {spec.ram || "미입력"}</div>
                <div>{"> "}STORAGE  :: {spec.storage || "미입력"}</div>
                <div>{"> "}사용 연차 :: {spec.years || "미입력"}</div>
              </>
            )}
            {purposeLabel && <div>{"> "}PURPOSE  :: {purposeLabel}</div>}
          </div>
          {path === "upgrade" ? <UpgradeSimulation spec={spec} purpose={purpose} /> : <p style={{ color: "#8B8F98", fontSize: 13, marginTop: 18, lineHeight: 1.6 }}>다음 단계에서는 이 조건에 맞는 견적/부품 비교가 이어질 예정이에요.</p>}
          <button className="gw-back" style={{ marginTop: 10, color: "#FFB020" }} onClick={resetAll}>
            ↺ 처음부터 다시
          </button>
        </div>
      )}
    </>
  );
}

function PeripheralFlowPanel({ onBack }) {
  const [flowStep, setFlowStep] = useState(0);
  const [device, setDevice] = useState(null);
  const [brand, setBrand] = useState(null);
  const [purpose, setPurpose] = useState(null);
  const peripheral = CATEGORIES.find((item) => item.id === "peripheral");
  const selected = peripheral.sub.find((item) => item.id === device);
  const purposeLabel = selected?.purpose.find((item) => item.id === purpose)?.label;

  function resetAll() { setFlowStep(0); setDevice(null); setBrand(null); setPurpose(null); }

  return <>
    <button className="gw-back" onClick={onBack}>← 카테고리 다시 선택</button>
    {flowStep === 0 && <><p style={{ color: "#8B8F98", fontSize: 13, margin: "14px 0 16px" }}>어떤 주변기기를 비교해볼까요?</p><div className="gw-grid">{peripheral.sub.map((item) => <button key={item.id} className="gw-card" onClick={() => { setDevice(item.id); setFlowStep(1); }}><div style={{ fontSize: 15, fontWeight: 600 }}>{item.label}</div><div style={{ color: "#8B8F98", fontSize: 12, marginTop: 6 }}>{item.brands.length}개 브랜드 비교</div></button>)}</div></>}
    {flowStep === 1 && selected && <><button className="gw-back" onClick={() => setFlowStep(0)}>← 기기 다시 선택</button><p style={{ color: "#8B8F98", fontSize: 13, margin: "14px 0 16px" }}>{selected.label} 브랜드를 골라주세요.</p><div className="gw-grid">{selected.brands.map((item) => <button key={item} className="gw-card" onClick={() => { setBrand(item); setFlowStep(2); }}><div style={{ fontSize: 15, fontWeight: 600 }}>{item}</div></button>)}</div></>}
    {flowStep === 2 && selected && <><button className="gw-back" onClick={() => setFlowStep(1)}>← 브랜드 다시 선택</button><p style={{ color: "#8B8F98", fontSize: 13, margin: "14px 0 16px" }}>{brand} {selected.label}, 주로 어디에 쓰실 건가요?</p><div className="gw-grid">{selected.purpose.map((item) => <button key={item.id} className="gw-card" onClick={() => { setPurpose(item.id); setFlowStep(3); }}><div style={{ fontSize: 15, fontWeight: 600 }}>{item.label}</div></button>)}</div></>}
    {flowStep === 3 && selected && <div style={{ background: "#1D2024", border: "1px solid #2A2E34", borderRadius: 10, padding: 22 }}><div style={{ color: "#3DDC97", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, lineHeight: 1.9 }}><div>{"> "}CATEGORY :: {selected.label}</div><div>{"> "}BRAND    :: {brand}</div><div>{"> "}PURPOSE  :: {purposeLabel}</div></div><p style={{ color: "#8B8F98", fontSize: 13, lineHeight: 1.6, marginTop: 16 }}>다음 단계에서 {brand} 제품의 스펙·신품/중고 가격과 다른 브랜드 대안을 비교할 수 있게 이어질 예정이에요.</p><button className="gw-back" style={{ color: "#FFB020" }} onClick={resetAll}>↺ 다른 주변기기 보기</button></div>}
  </>;
}

const STEP_LABEL = ["카테고리", "세부 유형", "사용 목적", "진단 결과"];

const CAMERA_JOURNEYS = [
  { id: "first", kicker: "FIRST PURCHASE", title: "처음 장비를 구매하고 싶어요", description: "촬영 목적·예산·휴대성을 기준으로 첫 구성을 찾아볼게요.", icon: "01" },
  { id: "replace", kicker: "UPGRADE OR KEEP", title: "현재 장비를 바꿀지 고민 중이에요", description: "현재 장비와 비교해 기변의 가치와 추가금을 판단해요.", icon: "02" },
  { id: "add", kicker: "ADD A ROLE", title: "현재 장비는 유지하고 새 장비를 추가하고 싶어요", description: "기존 구성과 겹치지 않는 역할의 장비를 찾아볼게요.", icon: "03" },
  { id: "audit", kicker: "COMING SOON", title: "내 장비 구성을 점검해보고 싶어요", description: "역할 중복과 비어 있는 촬영 영역을 분석하는 기능이에요.", icon: "04", comingSoon: true },
];

function CameraMvpHome({ onBegin }) {
  return <>
    <div style={{ fontFamily: "'JetBrains Mono', monospace", color: "#3DDC97", fontSize: 11, letterSpacing: "0.08em", marginBottom: 15 }}>CAMERA MVP · 0.1</div>
    <div role="note" style={{ marginBottom: 18, padding: "11px 13px", border: "1px solid rgba(255,176,32,0.34)", borderRadius: 9, background: "rgba(255,176,32,0.08)", color: "#D8C7A2", fontSize: 12, lineHeight: 1.55 }}>
      초기 MVP입니다. 현재 일부 카메라와 렌즈만 지원하며 가격은 참고 데이터입니다.
    </div>
    <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 30, lineHeight: 1.18, margin: "0 0 12px" }}>카메라 구매,<br /><span style={{ color: "#FFB020" }}>바꾸기 전에 판단하세요.</span></h1>
    <p style={{ color: "#AEB2B9", fontSize: 14, margin: "0 0 29px", lineHeight: 1.7 }}>장비병자는 무엇을 사야 할지뿐 아니라, 지금 사는 게 맞는지까지 함께 판단합니다.</p>
    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#8B8F98", letterSpacing: "0.06em", marginBottom: 10 }}>무엇을 도와드릴까요?</div>
    <div style={{ display: "grid", gap: 10 }}>
      {CAMERA_JOURNEYS.map((journey) => <button key={journey.id} className="gw-card" disabled={journey.comingSoon} onClick={() => onBegin(journey)} style={{ display: "flex", alignItems: "center", gap: 15, opacity: journey.comingSoon ? 0.5 : 1, cursor: journey.comingSoon ? "not-allowed" : "pointer" }}>
        <div style={{ color: journey.comingSoon ? "#8B8F98" : "#FFB020", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700 }}>{journey.icon}</div>
        <div style={{ textAlign: "left" }}><div style={{ fontSize: 15, fontWeight: 600 }}>{journey.title}</div><div style={{ color: "#8B8F98", fontSize: 12, marginTop: 5, lineHeight: 1.45 }}>{journey.description}</div></div>
      </button>)}
    </div>
    <p style={{ color: "#656B74", fontSize: 11, marginTop: 18, lineHeight: 1.55 }}>현재는 카메라 의사결정 MVP에 집중하고 있어요. PC·주변기기 기능은 이후 단계에서 다시 추가할 예정입니다.</p>
  </>;
}

export default function GearWizard() {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState(null);
  const [sub, setSub] = useState(null);
  const [purpose, setPurpose] = useState(null);
  const [cameraJourney, setCameraJourney] = useState(null);

  const cat = CATEGORIES.find((c) => c.id === category);
  const subObj = cat && cat.sub && cat.sub.find((s) => s.id === sub);
  const purposeList = (subObj && subObj.purpose) || (cat && cat.purpose) || [];
  const isFilterMode = cat && cat.filterMode;
  const isCustomFlow = cat && cat.customFlow;

  const log = [];
  if (cat) log.push(`CATEGORY :: ${cat.label}`);
  if (subObj) log.push(`TYPE     :: ${subObj.label}`);
  if (purpose) log.push(`PURPOSE  :: ${purposeList.find((p) => p.id === purpose)?.label}`);

  function reset() {
    setStep(0); setCategory(null); setSub(null); setPurpose(null); setCameraJourney(null);
  }
  function pickCategory(id) {
    setCategory(id); setSub(null); setPurpose(null); setStep(1);
  }
  function pickSub(id) { setSub(id); setStep(2); }
  function pickPurpose(id) { setPurpose(id); setStep(3); }
  function beginCameraJourney(journey) { setCameraJourney(journey); setCategory("camera"); setStep(1); }

  return (
    <div style={{ minHeight: "100%", background: "#14161A", color: "#ECECEA", fontFamily: "'Inter', system-ui, sans-serif", padding: "40px 20px 60px", display: "flex", justifyContent: "center" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+KR:wght@400;500;600;700&display=swap');
        :lang(ko) { font-family: 'Noto Sans KR', sans-serif !important; }
        .gw-card { background: #1D2024; border: 1px solid #2A2E34; border-radius: 10px; padding: 20px 18px; cursor: pointer; transition: border-color 120ms ease, transform 120ms ease, background 120ms ease; text-align: left; }
        .gw-card:hover { border-color: #FFB020; background: #23262B; transform: translateY(-2px); }
        .gw-card:disabled:hover { border-color: #2A2E34; background: #1D2024; transform: none; }
        .gw-card:focus-visible { outline: 2px solid #FFB020; outline-offset: 2px; }
        .gw-badge { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.06em; color: #8B8F98; }
        .gw-back { background: none; border: none; color: #8B8F98; font-family: 'JetBrains Mono', monospace; font-size: 12px; cursor: pointer; padding: 6px 0; }
        .gw-back:hover { color: #ECECEA; }
        .gw-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
        @media (max-width: 520px) {
          .gw-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; }
          .gw-card { padding: 15px 12px; min-width: 0; }
          details > summary { overflow-wrap: anywhere; }
        }
      `}</style>

      <div style={{ width: "100%", maxWidth: 640 }}>
        {step > 0 && !isFilterMode && !isCustomFlow && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.06em", color: "#8B8F98", flexWrap: "wrap" }}>
            {STEP_LABEL.map((label, i) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: i === step ? "#FFB020" : i < step ? "#3DDC97" : "#8B8F98" }}>
                  {String(i + 1).padStart(2, "0")}. {label}
                </span>
                {i < STEP_LABEL.length - 1 && <span style={{ color: "#2A2E34" }}>—</span>}
              </div>
            ))}
          </div>
        )}
        {(isFilterMode || isCustomFlow) && step > 0 && (
          <div style={{ marginBottom: 22, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.06em", color: "#3DDC97" }}>
            01. 카테고리 — <span style={{ color: "#FFB020" }}>02. {isFilterMode ? "조건 필터" : "진행 중"}</span>
          </div>
        )}

        {step === 0 ? <CameraMvpHome onBegin={beginCameraJourney} /> : <>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 26, margin: "0 0 6px" }}>장비병자 <span style={{ color: "#FFB020" }}>카메라 진단</span></h1>
          <p style={{ color: "#8B8F98", fontSize: 14, margin: "0 0 26px" }}>선택한 시작점에 맞춰 후보를 좁혀볼게요. 조건은 여러 개 골라도 됩니다.</p>
        </>}

        {step === 1 && isFilterMode && cameraJourney?.id === "first" && <FirstPurchaseSystemDiagnosis onBack={reset} />}
        {step === 1 && isFilterMode && cameraJourney?.id === "replace" && <CameraUpgradeEngineDiagnosis onBack={reset} />}
        {step === 1 && isFilterMode && cameraJourney?.id !== "first" && cameraJourney?.id !== "replace" && <CameraFilterPanel journey={cameraJourney} onBack={reset} />}

        {step === 1 && cat?.customFlow === "pc" && <PCFlowPanel onBack={() => setStep(0)} />}
        {step === 1 && cat?.customFlow === "peripheral" && <PeripheralFlowPanel onBack={() => setStep(0)} />}

        {step === 1 && !isFilterMode && !isCustomFlow && cat && (
          <>
            <button className="gw-back" onClick={() => setStep(0)}>← 카테고리 다시 선택</button>
            <div className="gw-grid" style={{ marginTop: 14 }}>
              {cat.sub.map((s) => (
                <button key={s.id} className="gw-card" onClick={() => pickSub(s.id)}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{s.label}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && !isFilterMode && cat && (
          <>
            <button className="gw-back" onClick={() => setStep(1)}>← 세부 유형 다시 선택</button>
            <div className="gw-grid" style={{ marginTop: 14 }}>
              {purposeList.map((p) => (
                <button key={p.id} className="gw-card" onClick={() => pickPurpose(p.id)}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{p.label}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 3 && !isFilterMode && (
          <div style={{ background: "#1D2024", border: "1px solid #2A2E34", borderRadius: 10, padding: 22 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#3DDC97", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>
              {log.map((line) => <div key={line}>{"> " + line}</div>)}
            </div>
            <p style={{ color: "#8B8F98", fontSize: 13, marginTop: 18, lineHeight: 1.6 }}>
              다음 단계에서는 이 조건에 맞는 기종들의 스펙·신품/중고 가격 비교표가 이어질 예정이에요.
            </p>
            <button className="gw-back" style={{ marginTop: 10, color: "#FFB020" }} onClick={reset}>↺ 처음부터 다시</button>
          </div>
        )}
      </div>
    </div>
  );
}
