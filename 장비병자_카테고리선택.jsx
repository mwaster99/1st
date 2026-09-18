import { CAMERA_ITEMS, CAMERA_DETAILS, calculateFunding } from "./src/cameraCatalogViews.js";
import { useState } from "react";
import CameraUpgradeEngineDiagnosis from "./src/CameraUpgradeSystemDiagnosis.jsx";
import CameraDesignPicker from "./src/CameraDesignPicker.jsx";
import { rankFirstPurchaseSystems } from "./src/firstPurchaseEngine.js";
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
  brand: [...new Set(CAMERA_ITEMS.map((item) => item.brand))],
  sensor: ["1인치 이하", "마이크로포서드", "APS-C", "풀프레임"],
  price: ["100만원 이하", "100~200만원", "200~400만원", "400만원 이상", "가격 미확인"],
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

function FirstPurchaseStepHeader({ current, total, title, hint, multi = false }) {
  const progress = Math.round((current / total) * 100);
  return <div className="gw-flow-progress"><div className="gw-progress-meta"><span>FIRST PURCHASE · {current}/{total}</span><span>첫 구매 진단</span></div><div className="gw-progress-track" role="progressbar" aria-label="첫 구매 진단 진행률" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress}><div className="gw-progress-value" style={{ width: `${progress}%` }} /></div><h2 className="gw-question-title">{title}</h2><p className="gw-helper">{hint}</p>{multi !== null && <div className="gw-selection-guide">{multi ? "복수 선택 · 모두 고른 뒤 완료를 누르세요" : "단일 선택 · 고르면 다음 질문으로 이동합니다"}</div>}</div>;
}

const isKnownPrice = (value) => typeof value === "number" && Number.isFinite(value);
const sumKnownPrices = (body, lens) => isKnownPrice(body) && isKnownPrice(lens) ? body + lens : null;
const formatReferencePrice = (value, approximate = false) => isKnownPrice(value) ? `${approximate ? "약 " : ""}${value}만원` : "가격 데이터 없음";
const formatSystemReferencePrice = (system) => formatReferencePrice(system.total, system.priceType === "중고");

function firstPurchasePriceOptions(system) {
  const usesOwnedLens = system.style === "보유 렌즈 활용";
  const newLens = usesOwnedLens ? 0 : system.lensNew;
  const usedLens = usesOwnedLens ? 0 : system.lensUsed;
  return {
    newBody: system.bodyNew,
    newLens,
    newTotal: sumKnownPrices(system.bodyNew, newLens),
    usedBody: system.bodyUsed,
    usedLens,
    usedTotal: sumKnownPrices(system.bodyUsed, usedLens),
  };
}

function FirstPurchasePriceSummary({ system, condition, compact = false }) {
  const prices = firstPurchasePriceOptions(system);
  const selectedLabel = condition === "신품 우선" ? "신품 참고가 우선" : condition === "중고 우선" ? "중고 참고가 우선" : "신품·중고 함께 비교";
  if (compact) return <div className="gw-alternative-price"><div className="gw-alternative-cost">{formatSystemReferencePrice(system)}</div><div className="gw-metric-label">{system.priceType} 참고가 · {selectedLabel}</div></div>;

  return <div className="gw-price-panel">
    <div className="gw-price-context"><span>선택한 구매 방식</span><b>{condition}</b><small>{selectedLabel} 기준으로 추천 순위와 예산을 계산했습니다.</small></div>
    <div className={`gw-price-grid gw-price-grid--${condition === "신품·중고 모두 고려" ? "compare" : "focused"}`}>
      {condition === "신품 우선" && <><div className="gw-price-cell"><div className="gw-price-label">BODY · 신품 참고가</div><div className="gw-price-value">{formatReferencePrice(prices.newBody)}</div></div><div className="gw-price-cell"><div className="gw-price-label">LENS · 신품 참고가</div><div className="gw-price-value">{formatReferencePrice(prices.newLens)}</div></div><div className="gw-price-cell is-total"><div className="gw-price-label">신품 예상 총비용</div><div className="gw-price-value">{formatReferencePrice(prices.newTotal)}</div></div></>}
      {condition === "중고 우선" && <><div className="gw-price-cell"><div className="gw-price-label">BODY · 중고 참고가</div><div className="gw-price-value">{formatReferencePrice(prices.usedBody, true)}</div></div><div className="gw-price-cell"><div className="gw-price-label">LENS · 중고 참고가</div><div className="gw-price-value">{formatReferencePrice(prices.usedLens, true)}</div></div><div className="gw-price-cell is-total"><div className="gw-price-label">중고 예상 총비용</div><div className="gw-price-value">{formatReferencePrice(prices.usedTotal, true)}</div></div></>}
      {condition === "신품·중고 모두 고려" && <><div className="gw-price-cell"><div className="gw-price-label">신품 예상 총비용</div><div className="gw-price-value">{formatReferencePrice(prices.newTotal)}</div><div className="gw-metric-detail">바디 {formatReferencePrice(prices.newBody)} · 렌즈 {formatReferencePrice(prices.newLens)}</div></div><div className="gw-price-cell"><div className="gw-price-label">중고 예상 총비용</div><div className="gw-price-value">{formatReferencePrice(prices.usedTotal, true)}</div><div className="gw-metric-detail">바디 {formatReferencePrice(prices.usedBody, true)} · 렌즈 {formatReferencePrice(prices.usedLens, true)}</div></div><div className="gw-price-cell is-total"><div className="gw-price-label">추천 계산 기준</div><div className="gw-price-value">{system.priceType} {formatSystemReferencePrice(system)}</div><div className="gw-metric-detail">현재 데이터에서 더 낮은 총비용</div></div></>}
    </div>
    <div className="gw-price-data-note"><b>가격 데이터 범위</b><span>중고 거래 최소·최대 범위 없음 · 가격 출처와 기준일 미등록</span><span>현재 표시값은 DB에 저장된 MVP 참고가이며 공식 정가나 실시간 시세가 아닙니다.</span></div>
  </div>;
}

function FirstPurchaseSystemDiagnosis({ onBack }) {
  const [step, setStep] = useState(0);
  const [advanced, setAdvanced] = useState(false);
  const [answers, setAnswers] = useState({ type: "", ownsLenses: "", ownedLenses: [], lensInput: "", subject: [], video: "", portability: "", lensCount: "", designPreference: ["any"], budget: 200, condition: "신품·중고 모두 고려", bodyBudget: "", lensBudget: "" });
  const questions = [
    { key: "type", title: "어떤 방식의 카메라를 원하시나요?", hint: "아직 모르겠다면 장비병자가 두 방식을 함께 비교해드릴게요.", options: ["렌즈교환식으로 시작하고 싶어요", "고정 렌즈 카메라가 좋아요", "아직 잘 모르겠어요"] },
    ...(answers.type === "렌즈교환식으로 시작하고 싶어요" ? [{ key: "ownsLenses", title: "이미 가지고 있거나 따로 쓸 렌즈가 있나요?", hint: "있다면 마운트만 고르지 않고 실제 렌즈 모델을 등록합니다.", options: ["보유 렌즈 없음", "보유 렌즈 있음"] }] : []),
    ...(answers.type === "렌즈교환식으로 시작하고 싶어요" && answers.ownsLenses === "보유 렌즈 있음" ? [{ key: "ownedLenses", title: "보유한 렌즈 모델을 등록해주세요.", hint: "검색해서 여러 개 추가할 수 있고, 목록에 없다면 직접 입력할 수도 있습니다.", lensSearch: true }] : []),
    { key: "subject", title: "무엇을 가장 많이 찍고 싶나요?", hint: "여러 개를 골라도 됩니다.", multi: true, options: ["여행 · 일상", "인물", "풍경", "브이로그 · 영상", "가족 · 반려동물"] },
    { key: "video", title: "사진과 영상의 비중은 어떤가요?", hint: "사진·영상 비중에 맞는 구성을 우선해요. 비교 정보가 부족한 부분은 결과에 표시합니다.", options: ["사진 위주", "사진과 영상 반반", "영상 비중이 높아요"] },
    { key: "portability", title: "휴대성은 얼마나 중요하나요?", hint: "카메라를 자주 쓰게 되는 가장 현실적인 조건이에요.", options: ["매일 가볍게 들고 다니고 싶어요", "여행이나 약속 때 챙길 거예요", "무게보다 결과물이 중요해요"] },
    { key: "designPreference", title: "어떤 카메라 디자인을 선호하나요?", hint: "좋아하는 형태를 여러 개 골라도 됩니다. 정보 버튼을 누르면 외관상의 차이를 확인할 수 있어요.", designPicker: true, multi: true },
    ...(answers.type !== "고정 렌즈 카메라가 좋아요" ? [{ key: "lensCount", title: "렌즈를 여러 개 들고 다니는 건 어떤가요?", hint: "첫 추천은 렌즈 1개 구성이며, 이후 렌즈를 늘릴 의향을 추천에 반영해요.", options: ["한 개로 끝내고 싶어요", "두 개 정도는 괜찮아요", "여러 개 교환해도 괜찮아요"] }] : []),
  ];
  const question = questions[step];
  const ownedLenses = answers.ownedLenses.map((name) => CAMERA_LENS_BY_NAME[name] || createUnknownCameraLens(name));
  const hasLens = ownedLenses.length > 0;
  const candidates = rankFirstPurchaseSystems(answers, { advanced, ownedLenses });
  function choose(value) { setAnswers((prev) => ({ ...prev, [question.key]: value, ...(question.key === "ownsLenses" && value === "보유 렌즈 없음" ? { ownedLenses: [], lensInput: "" } : {}) })); setStep((prev) => prev + 1); }
  function toggleSubject(value) { setAnswers((prev) => ({ ...prev, subject: prev.subject.includes(value) ? prev.subject.filter((item) => item !== value) : [...prev.subject, value] })); }

  if (step < questions.length && question.lensSearch) {
    const addLens = () => { const value = answers.lensInput.trim(); if (value && !answers.ownedLenses.includes(value)) setAnswers((prev) => ({ ...prev, ownedLenses: [...prev.ownedLenses, value], lensInput: "" })); };
    return <><button type="button" className="gw-back" onClick={() => setStep((prev) => prev - 1)}>← 이전 질문</button><FirstPurchaseStepHeader current={step + 1} total={questions.length + 1} title={question.title} hint={question.hint} multi /><div className="gw-input-row"><input className="gw-input" list="first-purchase-lens-list" value={answers.lensInput} onChange={(event) => setAnswers((prev) => ({ ...prev, lensInput: event.target.value }))} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addLens(); } }} placeholder="예: Sony FE 40mm F2.5 G" /><button type="button" className="gw-button gw-button--primary" onClick={addLens}>추가</button></div><datalist id="first-purchase-lens-list">{CAMERA_LENS_DATABASE.map((lens) => <option key={lens.id} value={lens.name}>{lens.mount}</option>)}</datalist><div className="gw-chip-row" style={{ marginTop: 14 }}>{ownedLenses.map((lens) => <span key={lens.id} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 10px", borderRadius: 999, background: "#23262B", color: "#ECECEA", fontSize: 12 }}>{lens.name}{lens.dataStatus === "unknown" ? " · 마운트 미확인" : ""}<button type="button" aria-label={`${lens.name} 삭제`} onClick={() => setAnswers((prev) => ({ ...prev, ownedLenses: prev.ownedLenses.filter((name) => name !== lens.name) }))} style={{ border: "none", background: "transparent", color: "#8B8F98", cursor: "pointer", padding: 0 }}>×</button></span>)}</div>{ownedLenses.some((lens) => lens.dataStatus === "unknown") && <p className="gw-notice">DB에 없는 렌즈는 마운트를 임의로 추정하지 않아 호환 시스템의 가격을 0원으로 만들지 않습니다.</p>}<div className="gw-actions"><button type="button" className="gw-button gw-button--primary" disabled={!ownedLenses.length} onClick={() => setStep((prev) => prev + 1)}>렌즈 등록 완료 ({ownedLenses.length})</button></div></>;
  }
  if (step < questions.length) {
    const multiValues = question.designPicker ? answers.designPreference.filter((value) => value !== "any") : answers.subject;
    return <><button type="button" className="gw-back" onClick={step === 0 ? onBack : () => setStep((prev) => prev - 1)}>← {step === 0 ? "시작 화면으로" : "이전 질문"}</button><FirstPurchaseStepHeader current={step + 1} total={questions.length + 1} title={question.title} hint={question.hint} multi={Boolean(question.multi)} />{question.designPicker ? <CameraDesignPicker value={answers.designPreference} onChange={(designPreference) => setAnswers((prev) => ({ ...prev, designPreference }))} /> : <div className="gw-grid">{question.options.map((option) => { const active = question.multi && answers.subject.includes(option); return <button type="button" key={option} className={`gw-choice${active ? " is-selected" : ""}`} aria-pressed={active} onClick={() => question.multi ? toggleSubject(option) : choose(option)}><span className="gw-choice-inner"><span className="gw-choice-label">{option}</span><span className="gw-choice-mark" aria-hidden="true">✓</span></span></button>; })}</div>}{question.multi && <div className="gw-actions"><button type="button" className="gw-button gw-button--primary" disabled={!question.designPicker && !multiValues.length} onClick={() => setStep((prev) => prev + 1)}>선택 완료 ({question.designPicker ? (multiValues.length || "상관없음") : multiValues.length})</button></div>}</>;
  }
  if (step === questions.length) return <><button type="button" className="gw-back" onClick={() => setStep((prev) => prev - 1)}>← 이전 질문</button><FirstPurchaseStepHeader current={questions.length + 1} total={questions.length + 1} title="카메라 시스템 전체 예산은 얼마인가요?" hint="바디와 기본 렌즈를 포함한 총예산입니다. 적절한 예산 배분은 장비병자가 제안할게요." multi={null} /><div className="gw-selection-guide">금액 하나와 구매 방식을 선택하세요</div><div className="gw-chip-row">{[100, 150, 200, 300, 500].map((value) => <button type="button" key={value} aria-pressed={Number(answers.budget) === value} onClick={() => setAnswers((prev) => ({ ...prev, budget: value }))} style={chipStyle(Number(answers.budget) === value)}>{value === 500 ? "500만원+" : `${value}만원`}</button>)}<button type="button" aria-pressed={answers.budget === ""} onClick={() => setAnswers((prev) => ({ ...prev, budget: "" }))} style={chipStyle(answers.budget === "")}>직접 입력</button></div><input className="gw-input" aria-label="전체 예산 직접 입력" type="number" min="0" value={answers.budget} placeholder="전체 예산 (만원)" onChange={(e) => setAnswers((prev) => ({ ...prev, budget: e.target.value }))} style={{ marginTop: 14 }} /><div className="gw-chip-row" style={{ marginTop: 15 }}>{["신품 우선", "신품·중고 모두 고려", "중고 우선"].map((option) => <button type="button" key={option} aria-pressed={answers.condition === option} onClick={() => setAnswers((prev) => ({ ...prev, condition: option }))} style={chipStyle(answers.condition === option)}>{option}</button>)}</div><button type="button" className="gw-back" style={{ color: "#FFB020", marginTop: 16 }} onClick={() => setAdvanced((value) => !value)}>{advanced ? "− 고급 예산 설정 닫기" : "+ 바디와 렌즈 예산을 직접 나눌래요"}</button>{advanced && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginTop: 8 }}><input className="gw-input" type="number" min="0" aria-label="바디 최대 예산" placeholder="바디 최대 (만원)" value={answers.bodyBudget} onChange={(e) => setAnswers((prev) => ({ ...prev, bodyBudget: e.target.value }))} /><input className="gw-input" type="number" min="0" aria-label="렌즈 최대 예산" placeholder="렌즈 최대 (만원)" value={answers.lensBudget} onChange={(e) => setAnswers((prev) => ({ ...prev, lensBudget: e.target.value }))} /></div>}<div className="gw-actions"><button type="button" className="gw-button gw-button--primary" onClick={() => setStep((prev) => prev + 1)}>내 카메라 시스템 보기</button></div></>;
  const best = candidates[0];
  const alternatives = candidates.slice(1);
  const budgetLimit = Number(answers.budget || 0);
  const stretchCandidates = answers.condition === "신품 우선" ? [] : rankFirstPurchaseSystems({ ...answers, budget: budgetLimit + 50 }, { advanced, ownedLenses })
    .filter((system) => system.total > budgetLimit && system.total <= budgetLimit + 50 && !candidates.some((candidate) => candidate.name === system.name))
    .slice(0, 2);
  return <><button type="button" className="gw-back" onClick={() => setStep(0)}>← 진단 다시 하기</button><header className="gw-result-head"><div className="gw-eyebrow">FIRST PURCHASE · SYSTEM RESULT</div><h2 className="gw-result-title">첫 시스템 추천 결과</h2><p className="gw-copy">{answers.subject.join(" · ")} · 총예산 {answers.budget}만원 · {hasLens ? "보유 렌즈 활용" : "기본 렌즈 포함"}</p></header>
    {best ? <><section className="gw-result-hero"><div className="gw-result-kicker">BEST FIRST SYSTEM · 가장 추천하는 첫 구성</div><h3 className="gw-result-name">{best.body}</h3><div className="gw-copy" style={{ color: "#ECECEA" }}>{best.lens}</div><div className="gw-verdict-badge">✓ {best.style}</div><div className="gw-goal-card"><div className="gw-goal-card-label">이 구성을 먼저 볼 이유</div><div className="gw-goal-card-value">{best.portabilityLabel} · {best.mediaFit}</div><div className="gw-goal-card-detail">{best.why}</div></div><FirstPurchasePriceSummary system={best} condition={answers.condition} /><div className="gw-metric-grid"><div className="gw-metric"><div className="gw-metric-label">촬영 목적 적합도</div><div className="gw-metric-value">{best.purposeFit === null ? "데이터 부족" : `${best.purposeFit}%`}</div><div className="gw-metric-detail">{answers.subject.join(" · ")}</div></div><div className="gw-metric"><div className="gw-metric-label">대표 조합 무게</div><div className="gw-metric-value">{best.systemWeight === null ? "데이터 부족" : `${best.systemWeight}g`}</div><div className="gw-metric-detail">{best.portabilityLabel}</div></div><div className="gw-metric"><div className="gw-metric-label">예산 잔액</div><div className="gw-metric-value">{Number(answers.budget) - best.total}만원</div><div className="gw-metric-detail">{best.priceType} 추천 계산 가격 기준</div></div></div></section>
      {stretchCandidates.length > 0 && <section className="gw-budget-stretch"><div><div className="gw-result-kicker">BUDGET EDGE · 예산 경계의 후보</div><h3 className="gw-section-title">조금 더 투자하면 보이는 구성</h3><p className="gw-section-copy">기본 추천을 바꾸지 않고, 현재 예산보다 50만원 이내에 있는 후보만 최대 2개 보여드립니다.</p></div><div className="gw-budget-stretch-list">{stretchCandidates.map((system) => <div className="gw-budget-stretch-item" key={system.name}><div><b>+{system.priceType === "중고" ? "약 " : ""}{system.total - budgetLimit}만원</b><span>{system.body} + {system.lens}</span></div><span>{system.priceType} 참고가 {formatSystemReferencePrice(system)}</span></div>)}</div></section>}
      {alternatives.length > 0 && <section className="gw-alternatives"><h3 className="gw-section-title">다른 첫 구매 대안</h3><p className="gw-section-copy">가격, 휴대성, 사진·영상 성격이 다른 후보입니다. 추천 순위와 구성은 그대로 유지했습니다.</p><div className="gw-alternative-list">{alternatives.map((system, index) => <details key={system.name} className="gw-alternative"><summary><div className="gw-alternative-summary"><div><div className="gw-result-kicker">대안 {index + 2} · {system.style}</div><div className="gw-alternative-name">{system.body} + {system.lens}</div><div className="gw-alternative-reason">{system.portabilityLabel} · {system.mediaFit}</div></div><FirstPurchasePriceSummary system={system} condition={answers.condition} compact /></div></summary><div className="gw-alternative-body"><p className="gw-section-copy">{system.why}</p><FirstPurchasePriceSummary system={system} condition={answers.condition} /><div className="gw-metric-grid"><div className="gw-metric"><div className="gw-metric-label">촬영 목적</div><div className="gw-metric-value">{system.purposeFit === null ? "데이터 부족" : `${system.purposeFit}%`}</div></div><div className="gw-metric"><div className="gw-metric-label">대표 조합 무게</div><div className="gw-metric-value">{system.systemWeight === null ? "데이터 부족" : `${system.systemWeight}g`}</div></div><div className="gw-metric"><div className="gw-metric-label">예산 잔액</div><div className="gw-metric-value">{Number(answers.budget) - system.total}만원</div></div></div></div></details>)}</div></section>}</> : <div className="gw-notice" style={{ marginTop: 16 }}>현재 조건과 총예산 안에서는 추천 시스템을 찾지 못했어요. 예산 또는 구매 방식을 조정해 보세요.</div>}
    <p className="gw-section-copy" style={{ marginTop: 14 }}>가격과 구성은 MVP용 참고 데이터입니다. 추천 이유와 선택한 구매 방식에 따른 실제 표시 가격을 함께 확인해주세요.</p></>;
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
      if (facet === "purpose") return (item.purpose || []).some((p) => selected.includes(p));
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
            "신품 참고가": formatReferencePrice(detail.newPrice), "중고 참고가": formatReferencePrice(detail.usedPrice, true),
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
      <button type="button" className="gw-back" onClick={onBack}>← 시작 화면으로</button>
      {journey && <header className="gw-result-head"><div className="gw-eyebrow">{journey.kicker}</div><h2 className="gw-question-title">{journey.title}</h2><p className="gw-helper">{journey.description}</p><div className="gw-selection-guide">복수 선택 · 기존 장비와 다른 역할을 찾을 조건을 고르세요</div></header>}

      {/* 똑딱이 / 렌즈교환식 */}
      <div style={{ marginTop: 16, marginBottom: 18 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.06em", color: "#8B8F98", marginBottom: 8 }}>
          카메라 종류
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {FAMILY_OPTIONS.map((f) => (
            <button
              type="button"
              key={f}
              className={`gw-choice${family === f ? " is-selected" : ""}`}
              aria-pressed={family === f}
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
              <button type="button" key={value} aria-pressed={filters[facet].includes(value)} onClick={() => toggleFacet(facet, value)} style={chipStyle(filters[facet].includes(value))}>
                {value}
              </button>
            ))}
          </div>
        </div>
      ))}

      {activeCount > 0 && (
        <button type="button" className="gw-back" style={{ color: "#FFB020" }} onClick={clearAll}>
          ↺ 필터 초기화 ({activeCount})
        </button>
      )}

      {/* 결과 */}
      <section className="gw-alternatives" style={{ paddingTop: 18, borderTop: "1px solid #2A2E34" }}>
        <h3 className="gw-section-title">역할 추가 후보</h3>
        <p className="gw-section-copy">{results.length}개 매칭 · 비교 목록 {compareList.length}/4 · 주요 제원과 가격대는 현재 제공되는 데이터만 표시합니다. 새 모델의 용도·컴팩트 분류가 미확인인 경우 해당 필터에서는 제외됩니다.</p>

        {results.length === 0 ? (
          <p style={{ color: "#8B8F98", fontSize: 13 }}>조건에 맞는 카메라가 없어요. 필터를 조금 줄여보세요.</p>
        ) : (
          <div className="gw-alternative-list">
            {results.map((item) => {
              const inCompare = compareList.includes(item.name);
              return (
                <div key={item.name} className="gw-card" style={{ borderColor: inCompare ? "#3DDC97" : undefined, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, cursor: "default" }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#8B8F98", marginTop: 6 }}>
                      {item.family} · {item.type} · {item.brand} · {item.sensor} · {item.price}
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-pressed={inCompare}
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
      </section>

      {compareList.length > 0 && (() => {
        const choice = CAMERA_DETAILS[compareList[0]];
        const { shortfall, months } = calculateFunding(choice.newPrice, cash, monthlySaving);
        return <section className="gw-result-hero" style={{ marginTop: 22 }}>
          <div className="gw-result-kicker">첫 선택 기준 · 자금 계획</div>
          <h3 className="gw-section-title" style={{ marginTop: 8 }}>{compareList[0]}</h3>
          <p style={{ color: "#8B8F98", fontSize: 12, margin: "7px 0 14px" }}>{compareList[0]} 신품 참고가 {formatReferencePrice(choice.newPrice)} 기준</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <label style={{ color: "#8B8F98", fontSize: 12 }}>현재 마련한 금액 (만원)<input type="number" min="0" value={cash} onChange={(e) => setCash(e.target.value)} style={{ ...{ width: "100%", marginTop: 6, padding: 9, borderRadius: 7, background: "#14161A", border: "1px solid #2A2E34", color: "#ECECEA" } }} /></label>
            <label style={{ color: "#8B8F98", fontSize: 12 }}>월 저축 가능액 (만원)<input type="number" min="0" value={monthlySaving} onChange={(e) => setMonthlySaving(e.target.value)} style={{ ...{ width: "100%", marginTop: 6, padding: 9, borderRadius: 7, background: "#14161A", border: "1px solid #2A2E34", color: "#ECECEA" } }} /></label>
          </div>
          <div className="gw-goal-card"><div className="gw-goal-card-label">현재 자금 기준</div><div className="gw-goal-card-value">{shortfall === null ? "부족액 계산 불가" : `부족액 ${shortfall}만원`}</div><div className="gw-goal-card-detail">{months === null ? "가격 또는 저축액을 확인해주세요" : `월 저축액 기준 목표까지 약 ${months}개월`}</div></div>
        </section>;
      })()}

      {/* AI 비교하기 */}
      {compareList.length >= 2 && (
        <section className="gw-alternatives" style={{ borderTop: "1px solid #2A2E34", paddingTop: 18 }}>
          <h2 className="gw-section-title">
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
            type="button"
            className="gw-button gw-button--primary"
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
            <div style={{ marginTop: 18, overflowX: "auto" }} tabIndex="0" aria-label="카메라 비교표">
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
        </section>
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
    <div className="gw-eyebrow">CAMERA MVP · 0.2</div>
    <div role="note" className="gw-notice gw-home-note" style={{ marginTop: 15 }}>
      초기 MVP입니다. 현재 일부 카메라와 렌즈만 지원하며 가격은 참고 데이터입니다.
    </div>
    <h1 className="gw-page-title">카메라 구매,<br /><span style={{ color: "#FFB020" }}>바꾸기 전에 판단하세요.</span></h1>
    <p className="gw-copy" style={{ margin: "0 0 29px" }}>장비병자는 무엇을 사야 할지뿐 아니라, 지금 사는 게 맞는지까지 함께 판단합니다.</p>
    <div className="gw-badge" style={{ marginBottom: 10 }}>무엇을 도와드릴까요?</div>
    <div className="gw-journey-list">
      {CAMERA_JOURNEYS.map((journey) => <button type="button" key={journey.id} className="gw-card gw-journey-card" disabled={journey.comingSoon} onClick={() => onBegin(journey)}>
        <div className="gw-journey-number" style={{ color: journey.comingSoon ? "#8B8F98" : undefined }}>{journey.icon}</div>
        <div><div className="gw-journey-title">{journey.title}</div><div className="gw-journey-description">{journey.description}</div></div><div className="gw-journey-arrow" aria-hidden="true">→</div>
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
    <div className="gw-app">
      <div className="gw-shell">
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
          <h1 className="gw-page-title" style={{ fontSize: 28 }}>장비병자 <span style={{ color: "#FFB020" }}>카메라 진단</span></h1>
          <p className="gw-copy" style={{ margin: "0 0 26px" }}>선택한 시작점에 맞춰 후보를 좁혀볼게요. 각 질문에서 단일·복수 선택 여부를 안내합니다.</p>
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
