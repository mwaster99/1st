import { useMemo, useState } from "react";
import CameraBodyPicker from "./CameraBodyPicker.jsx";
import CameraDesignPicker from "./CameraDesignPicker.jsx";
import { CAMERA_LENSES, LENS_BY_NAME, createUnknownLens, getIntegratedLens } from "./cameraData.js";
import { buildScenarioExplanation, generateUpgradeScenarios } from "./cameraScenarioEngine.js";

const PAIN_OPTIONS = ["더 가볍고 작은 카메라를 원해요", "화질을 더 높이고 싶어요", "AF가 더 좋아졌으면 해요", "영상 성능을 높이고 싶어요", "배터리가 오래 갔으면 해요", "렌즈 선택지가 아쉬워요", "새로운 촬영 경험이 필요해요"];
const PORTABILITY_DETAIL_OPTIONS = ["바디 무게", "렌즈 무게", "전체 부피", "가방에 넣기 어려움", "장시간 들고 다니기 힘듦"];
const PRESERVE_OPTIONS = ["화질", "AF", "조작성 · 그립", "배터리", "영상", "렌즈 선택지", "색감", "튼튼함", "특별히 없음"];
const SUBJECT_OPTIONS = ["여행 · 일상", "인물", "풍경", "가족 · 반려동물", "스포츠 · 동물", "브이로그 · 영상"];
const RATIO_OPTIONS = ["사진 100%", "사진 80% / 영상 20%", "사진 50% / 영상 50%", "사진 20% / 영상 80%", "영상 100%"];
const LENS_INTENT_OPTIONS = ["가능하면 전부 유지", "쓸 만한 렌즈는 유지", "렌즈까지 전부 바꿔도 괜찮음", "가장 좋은 방향 추천"];
const BRAND_INTENT_OPTIONS = ["현재 브랜드만", "가능하면 유지 · 다른 브랜드도 가능", "브랜드 상관없음"];

const inputStyle = { width: "100%", padding: 12, borderRadius: 8, background: "#1D2024", border: "1px solid #2A2E34", color: "#ECECEA" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };
const PHASES = ["현재 장비", "기변 목표", "사용 목적", "전환 조건", "예산", "결과"];

function chipStyle(active) {
  return { padding: "7px 12px", borderRadius: 999, fontSize: 13, cursor: "pointer", border: active ? "1px solid #FFB020" : "1px solid #2A2E34", background: active ? "rgba(255,176,32,0.12)" : "#1D2024", color: active ? "#FFB020" : "#ECECEA" };
}

function NextButton({ disabled = false, children, onClick }) {
  return <div className="gw-actions"><button type="button" className="gw-button gw-button--primary" disabled={disabled} onClick={onClick}>{children}</button></div>;
}

function StepHeader({ current, total, phase, title, hint }) {
  const progress = Math.round((current / total) * 100);
  return <div className="gw-flow-progress">
    <div className="gw-progress-meta"><span>SYSTEM UPGRADE · {current}/{total}</span><span>{phase}</span></div>
    <div className="gw-progress-track" role="progressbar" aria-label="기변 진단 진행률" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress}><div className="gw-progress-value" style={{ width: progress + "%" }} /></div>
    <div className="gw-progress-phases" aria-hidden="true">{PHASES.map((item, index) => <span key={item} className={item === phase ? "is-current" : undefined}>{item}{index < PHASES.length - 1 ? " →" : ""}</span>)}</div>
    <h2 className="gw-question-title">{title}</h2>
    <p className="gw-helper">{hint}</p>
  </div>;
}

function ChoiceGrid({ options, selected, multi, onSelect }) {
  return <><div className="gw-selection-guide">{multi ? "복수 선택 · 모두 고른 뒤 완료를 누르세요" : "단일 선택 · 고르면 다음 질문으로 이동합니다"}</div><div className="gw-grid">{options.map((option) => { const value = typeof option === "string" ? option : option.value; const label = typeof option === "string" ? option : option.label; const active = multi ? selected.includes(value) : selected === value; return <button type="button" key={value} className={`gw-choice${active ? " is-selected" : ""}`} aria-pressed={active} onClick={() => onSelect(value)}><span className="gw-choice-inner"><span className="gw-choice-label">{label}</span><span className="gw-choice-mark" aria-hidden="true">✓</span></span></button>; })}</div></>;
}

function isValidBudget(value) {
  return String(value).trim() !== "" && Number.isFinite(Number(value)) && Number(value) >= 0;
}

function DiagnosisSummary({ body, primaryLens, pains, portabilityDetails, extraBudget, budgetTouched }) {
  const items = [];
  if (body) items.push({ label: "현재", value: (body.brand !== "기타" ? body.brand + " " : "") + (body.model || body.name) + (primaryLens ? " + " + primaryLens.name : "") });
  if (pains.length) items.push({ label: "목표", value: pains.join(" · ") });
  if (portabilityDetails.length) items.push({ label: "휴대성", value: portabilityDetails.join(" · ") });
  if (budgetTouched) items.push({ label: "추가 예산", value: isValidBudget(extraBudget) ? Number(extraBudget) + "만원" : "금액 확인 필요" });
  if (!items.length) return null;
  return <div className="gw-summary">{items.map((item) => <div key={item.label} className="gw-summary-row"><span className="gw-summary-label">{item.label}</span><span className="gw-summary-value">{item.value}</span></div>)}</div>;
}

function GearColumn({ code, label, items }) {
  return <div className="gw-gear-column" data-action={code.toLowerCase()}><span className="gw-gear-code">{code} · {label}</span><ul className="gw-gear-items">{items.length ? items.map((item) => <li key={item.id || item.name}>• {item.name}</li>) : <li>해당 장비 없음</li>}</ul></div>;
}

function formatPrice(value, approximate = false) {
  if (!value.missing.length) return (approximate && value.known > 0 ? "약 " : "") + value.known + "만원";
  const missing = value.missing.join(", ");
  return value.known > 0 ? "최소 " + value.known + "만원 + 가격 미확인" : "계산 불가 · " + missing + " 가격 미확인";
}

function formatAdditionalCost(scenario) {
  if (scenario.cost.additionalCost === null) return "정확한 계산 불가";
  return (scenario.cost.additionalCost > 0 ? "약 " : "") + scenario.cost.additionalCost + "만원";
}

function combinationName(scenario) {
  return (scenario.targetSystem.body.model || scenario.targetSystem.body.name) + (scenario.targetSystem.primaryLens ? " + " + scenario.targetSystem.primaryLens.name : "");
}

function collectChanges(scenario) {
  const all = scenario.changes || [...scenario.capability.wanted, ...scenario.capability.constraints, ...scenario.capability.tradeoffs, ...scenario.lensComparison];
  const seen = new Set();
  return all.filter((item) => {
    const key = item.key + "|" + item.status + "|" + item.summary;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function ChangeGroup({ status, title, items }) {
  const icons = { improved: "↑", maintained: "=", degraded: "↓", unknown: "?" };
  const labels = { improved: "개선", maintained: "유지", degraded: "저하", unknown: "데이터 부족" };
  if (!items.length) return null;
  return <section className="gw-change-group"><div className={`gw-status gw-status--${status}`}>{icons[status]} {labels[status]} · {title}</div><div className="gw-change-list">{items.map((item, index) => <div key={item.key + "-" + index} className="gw-change-item"><div className="gw-change-main"><b>{item.label}</b><span className="gw-change-summary">{item.summary}</span></div><div className="gw-change-detail">{(item.details || [item.detail]).filter(Boolean).join(" · ")}</div></div>)}</div></section>;
}

function ChangeGroups({ scenario }) {
  const changes = collectChanges(scenario);
  return <div>
    <ChangeGroup status="improved" title="좋아지는 점" items={changes.filter((item) => item.status === "improved")} />
    <ChangeGroup status="maintained" title="유지되는 점" items={changes.filter((item) => item.status === "maintained")} />
    <ChangeGroup status="degraded" title="나빠지는 점" items={changes.filter((item) => item.status === "degraded")} />
    <ChangeGroup status="unknown" title="비교 데이터 부족" items={changes.filter((item) => item.status === "unknown")} />
  </div>;
}

function MainMetric({ label, value, detail, accent = "#ECECEA" }) {
  return <div className="gw-metric"><div className="gw-metric-label">{label}</div><div className="gw-metric-value" style={{ color: accent }}>{value}</div>{detail && <div className="gw-metric-detail">{detail}</div>}</div>;
}

function PriceSummary({ scenario, overBudget = false }) {
  const purchaseLabel = scenario.purchaseCondition === "new" ? "신품 참고가" : "중고 참고가";
  return <div className="gw-price-grid" aria-label="기변 비용 요약">
    <div className="gw-price-cell"><div className="gw-price-label">SELL · 중고 판매 참고가</div><div className="gw-price-value">{formatPrice(scenario.cost.sellValue, true)}</div></div>
    <div className="gw-price-cell"><div className="gw-price-label">BUY · {purchaseLabel}</div><div className="gw-price-value">{formatPrice(scenario.cost.buyValue, scenario.purchaseCondition !== "new")}</div></div>
    <div className={`gw-price-cell is-total${overBudget ? " is-warning" : ""}`}><div className="gw-price-label">참고가 기준 추가금</div><div className="gw-price-value">{formatAdditionalCost(scenario)}</div></div>
  </div>;
}

function TargetBodySpecs({ body }) {
  const specs = [
    ["센서", body.sensor?.format],
    ["화소", Number.isFinite(body.sensor?.megapixels) ? `${body.sensor.megapixels}MP` : null],
    ["바디 무게", Number.isFinite(body.weight) ? `${body.weight}g` : null],
    ["마운트", body.mount],
    ["최대 영상", body.video?.max],
  ].filter(([, value]) => value);
  if (!specs.length) return null;
  return <dl className="gw-specs" aria-label="추천 바디 주요 제원">{specs.map(([label, value]) => <div className="gw-spec" key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
}

function mainImprovement(scenario) {
  const improved = scenario.capability.wanted.filter((item) => item.status === "improved").sort((a, b) => (b.strength || 0) - (a.strength || 0));
  return improved[0] || null;
}

function mainLoss(scenario) {
  return [...scenario.capability.violations, ...scenario.capability.wanted, ...scenario.capability.constraints, ...scenario.capability.tradeoffs, ...scenario.lensComparison]
    .filter((item) => item.status === "degraded")
    .sort((a, b) => Math.abs(b.strength || 0) - Math.abs(a.strength || 0))[0] || null;
}

function recommendationLabel(scenario) {
  if (scenario.kind === "hold") return "현재 구성 유지 권장";
  if (scenario.capability.violations.length) return "유지 조건 확인 필요";
  if (!mainImprovement(scenario)) return "목표 개선 확인 필요";
  if (scenario.scores.total >= 85) return "추천도 매우 높음";
  if (scenario.scores.total >= 70) return "추천도 높음";
  return "조건부 검토";
}

function EquipmentTransition({ scenario }) {
  const systemName = (system) => [system.body.model || system.body.name, ...system.lenses.map((lens) => lens.name)].join(" + ");
  return <div className="gw-transition"><div className="gw-system-name">현재 시스템 · {systemName(scenario.currentSystem)}</div><div className="gw-transition-grid"><GearColumn code="KEEP" label="그대로 사용" items={scenario.keep} /><GearColumn code="SELL" label="판매" items={scenario.sell} /><GearColumn code="BUY" label="새로 구매" items={scenario.buy} /></div><div className="gw-system-name gw-system-name--target">→ 목표 시스템 · {systemName(scenario.targetSystem)}</div></div>;
}

function ScoreDetails({ scenario }) {
  const evidenceLabel = (key) => {
    const items = key === "objective" ? scenario.capability.wanted : key === "constraints" ? scenario.capability.constraints : null;
    return items?.length ? ` · 확인 ${items.filter((item) => item.status !== "unknown").length}/${items.length}` : "";
  };
  return <div style={{ marginTop: 12 }}><div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{Object.entries(scenario.scores).filter(([key]) => key !== "total").map(([key, value]) => <span key={key} style={{ color: "#8B8F98", background: "#14161A", borderRadius: 999, padding: "5px 8px", fontSize: 10 }}>{({ objective: "목표", constraints: "유지조건", usage: "용도", budget: "예산", simplicity: "전환 간결성", design: "디자인 선호" })[key] || key} {Number.isFinite(value) ? value : "데이터 부족"}{evidenceLabel(key)}</span>)}</div><div style={{ color: "#777D86", fontSize: 10, lineHeight: 1.5, marginTop: 6 }}>점수는 확인된 항목 기준의 MVP 판단값이며 실제 성능 향상률이 아닙니다. 미확인 목표와 유지 조건은 충족한 것으로 계산하지 않습니다.</div></div>;
}

function HeroScenarioCard({ scenario, extraBudget }) {
  const improvement = mainImprovement(scenario);
  const loss = mainLoss(scenario);
  const explanation = buildScenarioExplanation(scenario, extraBudget);
  const overBudget = scenario.cost.additionalCost !== null && scenario.cost.additionalCost > Number(extraBudget || 0);
  const weightValue = scenario.weight.before === null || scenario.weight.after === null ? "비교 데이터 부족" : scenario.weight.before + "g → " + scenario.weight.after + "g";
  const weightDetail = scenario.weight.percent === null ? "대표 렌즈 또는 바디 무게 미등록" : (scenario.weight.difference > 0 ? "+" : "") + scenario.weight.difference + "g · " + (scenario.weight.percent > 0 ? "+" : "") + scenario.weight.percent + "%";

  return <section className="gw-result-hero">
    <div className="gw-result-kicker">BEST MATCH · 가장 추천하는 선택</div>
    <h3 className="gw-result-name">{combinationName(scenario)}</h3>
    <div className="gw-verdict-badge">{scenario.capability.violations.length ? "△" : "✓"} {recommendationLabel(scenario)}</div>

    <div className="gw-goal-card"><div className="gw-goal-card-label">원했던 변화에서 가장 분명한 개선</div><div className="gw-goal-card-value">{improvement ? improvement.label : "확인된 개선 없음"}</div><div className="gw-goal-card-detail">{improvement?.summary || "현재 데이터만으로 목표가 좋아진다고 단정하기 어렵습니다."}</div></div>
    <PriceSummary scenario={scenario} overBudget={overBudget} />

    <div className="gw-metric-grid">
      <MainMetric label="대표 조합 무게" value={weightValue} detail={weightDetail} />
      <MainMetric label="가장 큰 손해" value={loss ? loss.label : "확인된 큰 손해 없음"} detail={loss?.summary} accent={loss ? "#FF8A80" : "#8BC5FF"} />
      <MainMetric label="판단 점수" value={`${scenario.scores.total}점`} detail="확인된 항목을 바탕으로 한 MVP 비교값" accent="#ECECEA" />
    </div>

    <div className="gw-explanation"><div className="gw-explanation-title">왜 이 선택인가요?</div>{explanation.slice(0, 3).map((line) => <p key={line}>{line}</p>)}</div>
    <TargetBodySpecs body={scenario.targetSystem.body} />

    <details className="gw-detail">
      <summary>좋아지는 점·손해·장비 이동 근거 보기</summary>
      <ChangeGroups scenario={scenario} />
      <EquipmentTransition scenario={scenario} />
      <ScoreDetails scenario={scenario} />
      {explanation.slice(3).map((line) => <div key={line} style={{ color: "#8B8F98", fontSize: 11, lineHeight: 1.55, marginTop: 6 }}>· {line}</div>)}
    </details>
  </section>;
}

function AlternativeScenarioCard({ scenario, index, extraBudget }) {
  const improvement = mainImprovement(scenario);
  const loss = mainLoss(scenario);
  const explanation = buildScenarioExplanation(scenario, extraBudget);
  return <details className="gw-alternative">
    <summary><div className="gw-alternative-summary"><div><div className="gw-result-kicker">대안 {index} · {scenario.strategy}</div><div className="gw-alternative-name">{combinationName(scenario)}</div><div className="gw-alternative-reason">{improvement ? `${improvement.label} 개선` : recommendationLabel(scenario)}{loss ? ` · ${loss.label} 주의` : " · 확인된 큰 손해 없음"}</div></div><div><div className="gw-alternative-cost">{formatAdditionalCost(scenario)}</div><div className="gw-metric-label">예상 추가금</div></div></div></summary>
    <div className="gw-alternative-body"><p className="gw-section-copy">{explanation[0]}</p><PriceSummary scenario={scenario} /><TargetBodySpecs body={scenario.targetSystem.body} /><ChangeGroups scenario={scenario} /><EquipmentTransition scenario={scenario} /><ScoreDetails scenario={scenario} /></div>
  </details>;
}

export default function CameraUpgradeSystemDiagnosis({ onBack }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ body: null, lenses: [], lensInput: "", primaryLensId: "", pains: [], portabilityDetails: [], preserve: [], subjects: [], ratio: "", lensIntent: "", brandIntent: "", designPreference: ["any"], extraBudget: 100, budgetTouched: false });
  const body = answers.body;
  const availableLenses = body?.mount ? CAMERA_LENSES.filter((lens) => lens.mount === body.mount) : CAMERA_LENSES;
  const selectedLenses = useMemo(() => body?.kind === "fixed" ? [getIntegratedLens(body)] : answers.lenses.map((name) => LENS_BY_NAME[name] || createUnknownLens(name, body?.mount || null)), [answers.lenses, body]);
  const primaryLens = body?.kind === "fixed" ? selectedLenses[0] : selectedLenses.find((lens) => lens.id === answers.primaryLensId);
  const hasPortabilityQuestion = answers.pains.includes("더 가볍고 작은 카메라를 원해요");

  const questions = [
    { key: "pains", phase: "기변 목표", title: "현재 시스템에서 무엇을 해결하고 싶나요?", hint: "선택한 항목을 추천이 가장 먼저 해결해야 할 목표로 사용할게요.", options: PAIN_OPTIONS, multi: true },
    ...(hasPortabilityQuestion ? [{ key: "portabilityDetails", phase: "기변 목표", title: "휴대성에서 가장 불편한 것은 무엇인가요?", hint: "선택한 불편이 바디 때문인지 렌즈 때문인지에 따라 추천 전략이 달라집니다.", options: PORTABILITY_DETAIL_OPTIONS, multi: true }] : []),
    { key: "preserve", phase: "기변 목표", title: "현재 장비에서 잃고 싶지 않은 점은 무엇인가요?", hint: "새 장비에서 이 부분이 나빠지면 추천 점수를 크게 낮출게요.", options: PRESERVE_OPTIONS, multi: true },
    { key: "subjects", phase: "사용 목적", title: "기변 후 무엇을 더 많이 찍고 싶나요?", hint: "바디의 특성과 렌즈가 담당할 수 있는 촬영 영역을 함께 계산할게요.", options: SUBJECT_OPTIONS, multi: true },
    { key: "ratio", phase: "사용 목적", title: "사진과 영상의 비중은 어떤가요?", hint: "사진과 영상 중 실제로 더 자주 쓰는 쪽에 추천 가중치를 둘게요.", options: RATIO_OPTIONS },
    { key: "lensIntent", phase: "전환 조건", title: "현재 렌즈는 어떻게 하고 싶나요?", hint: "기존 렌즈를 유지할지에 따라 기변 비용과 추천 시스템이 크게 달라집니다.", options: LENS_INTENT_OPTIONS },
    { key: "brandIntent", phase: "전환 조건", title: "현재 브랜드를 유지하고 싶나요?", hint: "타 브랜드를 허용하면 기존 렌즈 판매를 포함한 전체 시스템 전환안도 비교할게요.", options: BRAND_INTENT_OPTIONS },
    { key: "designPreference", phase: "전환 조건", title: "선호하는 카메라 디자인이 있나요?", hint: "여러 형태를 함께 고를 수 있습니다. 정보 버튼을 누르면 외관상의 차이를 확인할 수 있어요.", designPicker: true, multi: true },
  ];
  const questionStart = 2;
  const budgetStep = questionStart + questions.length;
  const resultStep = budgetStep + 1;
  const totalSteps = resultStep;
  const activeQuestion = questions[step - questionStart];

  const toggle = (key, value) => setAnswers((prev) => {
    if (key === "preserve" && value === "특별히 없음") return { ...prev, preserve: prev.preserve.includes(value) ? [] : ["특별히 없음"] };
    if (key === "preserve") return { ...prev, preserve: prev.preserve.includes(value) ? prev.preserve.filter((item) => item !== value) : [...prev.preserve.filter((item) => item !== "특별히 없음"), value] };
    const current = prev[key];
    const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
    const extra = key === "pains" && value === "더 가볍고 작은 카메라를 원해요" && !next.includes(value) ? { portabilityDetails: [] } : {};
    return { ...prev, [key]: next, ...extra };
  });
  const goBack = () => setStep((current) => Math.max(0, current - 1));
  const summary = step > 0 && step < resultStep ? <DiagnosisSummary body={body} primaryLens={primaryLens} pains={answers.pains} portabilityDetails={answers.portabilityDetails} extraBudget={answers.extraBudget} budgetTouched={answers.budgetTouched} /> : null;

  if (step === 0) return <><button type="button" className="gw-back" onClick={onBack}>← 시작 화면으로</button><StepHeader current={1} total={totalSteps} phase="현재 장비" title="현재 사용하는 카메라 바디는 무엇인가요?" hint="브랜드, 시리즈, 모델 순으로 찾거나 모델명을 바로 검색할 수 있어요." /><CameraBodyPicker value={body} allowUnknown onChange={(selected) => setAnswers((prev) => ({ ...prev, body: selected, lenses: selected?.id === prev.body?.id ? prev.lenses : [], primaryLensId: selected?.id === prev.body?.id ? prev.primaryLensId : "" }))} /><NextButton disabled={!body} onClick={() => setStep(1)}>현재 바디 확인</NextButton></>;

  if (step === 1 && body?.kind === "fixed") return <><button type="button" className="gw-back" onClick={goBack}>← 이전 질문</button>{summary}<StepHeader current={2} total={totalSteps} phase="현재 장비" title="내장 렌즈를 포함한 카메라로 비교합니다." hint="고정렌즈 카메라는 렌즈를 따로 등록하지 않습니다. 무게와 매매 비용에 내장 렌즈가 포함됩니다." /><NextButton onClick={() => setStep(questionStart)}>현재 장비 등록 완료</NextButton></>;

  if (step === 1) {
    const addLens = () => {
      const value = answers.lensInput.trim();
      if (!value || answers.lenses.includes(value)) return;
      const lens = LENS_BY_NAME[value];
      if (lens && body.mount && lens.mount !== body.mount) return;
      const resolved = lens || createUnknownLens(value, body.mount || null);
      setAnswers((prev) => ({ ...prev, lenses: [...prev.lenses, value], lensInput: "", primaryLensId: prev.primaryLensId || resolved.id }));
    };
    const removeLens = (lens) => setAnswers((prev) => {
      const names = prev.lenses.filter((name) => name !== lens.name);
      const remaining = names.map((name) => LENS_BY_NAME[name] || createUnknownLens(name, body.mount || null));
      return { ...prev, lenses: names, primaryLensId: prev.primaryLensId === lens.id ? (remaining[0]?.id || "") : prev.primaryLensId };
    });
    return <><button type="button" className="gw-back" onClick={goBack}>← 이전 질문</button>{summary}<StepHeader current={2} total={totalSteps} phase="현재 장비" title="현재 보유 렌즈와 대표 렌즈를 알려주세요." hint="렌즈를 추가한 뒤 가장 자주 바디에 물려 쓰는 렌즈를 선택해주세요. 대표 조합의 무게는 이 렌즈를 기준으로 계산합니다." /><div className="gw-selection-guide">복수 등록 · 대표 렌즈는 하나를 선택하세요</div><div className="gw-input-row"><input className="gw-input" list="upgrade-lens-list" value={answers.lensInput} onChange={(event) => setAnswers((prev) => ({ ...prev, lensInput: event.target.value }))} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addLens(); } }} placeholder="렌즈명 검색 또는 직접 입력" /><button type="button" className="gw-button gw-button--primary" onClick={addLens}>추가</button></div><datalist id="upgrade-lens-list">{availableLenses.map((lens) => <option key={lens.id} value={lens.name}>{(lens.roles || []).join(" · ")}</option>)}</datalist><div style={{ display: "grid", gap: 8, marginTop: 14 }}>{selectedLenses.map((lens) => { const active = primaryLens?.id === lens.id; return <button key={lens.id} type="button" className={`gw-choice${active ? " is-selected" : ""}`} aria-pressed={active} onClick={() => setAnswers((prev) => ({ ...prev, primaryLensId: lens.id }))}><span className="gw-choice-inner"><span><b>{lens.name}</b><span className="gw-choice-sub" style={{ color: lens.dataStatus === "unknown" ? "#FFB020" : undefined }}>{active ? "대표 렌즈 · " : ""}{lens.dataStatus === "unknown" ? "상세 데이터 미등록" : (lens.roles || []).join(" · ")}</span></span><span role="button" aria-label={`${lens.name} 삭제`} tabIndex="0" onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.stopPropagation(); removeLens(lens); } }} onClick={(event) => { event.stopPropagation(); removeLens(lens); }} style={{ color: "#8B8F98", padding: 5 }}>×</span></span></button>; })}</div>{selectedLenses.some((lens) => lens.dataStatus === "unknown") && <p className="gw-notice">직접 입력한 렌즈는 무게·가격이 미확인 상태로 저장됩니다. 필요한 계산도 ‘계산 불가’로 표시됩니다.</p>}<NextButton disabled={!selectedLenses.length || !primaryLens} onClick={() => setStep(questionStart)}>현재 장비 등록 완료</NextButton></>;
  }

  if (step >= questionStart && step < budgetStep) {
    const selected = answers[activeQuestion.key];
    const choose = (value) => activeQuestion.multi ? toggle(activeQuestion.key, value) : (setAnswers((prev) => ({ ...prev, [activeQuestion.key]: value })), setStep((current) => current + 1));
    const selectedDesignCount = activeQuestion.designPicker ? selected.filter((value) => value !== "any").length : 0;
    return <><button type="button" className="gw-back" onClick={goBack}>← 이전 질문</button>{summary}<StepHeader current={step + 1} total={totalSteps} phase={activeQuestion.phase} title={activeQuestion.title} hint={activeQuestion.hint} />{activeQuestion.designPicker ? <CameraDesignPicker value={selected} onChange={(designPreference) => setAnswers((prev) => ({ ...prev, designPreference }))} /> : <ChoiceGrid options={activeQuestion.options} selected={selected} multi={activeQuestion.multi} onSelect={choose} />}{activeQuestion.multi && <NextButton disabled={!activeQuestion.designPicker && !selected.length} onClick={() => setStep((current) => current + 1)}>선택 완료 ({activeQuestion.designPicker ? (selectedDesignCount || "상관없음") : selected.length})</NextButton>}</>;
  }

  if (step === budgetStep) return <><button type="button" className="gw-back" onClick={goBack}>← 이전 질문</button>{summary}<StepHeader current={totalSteps} total={totalSteps} phase="예산" title="판매금에 얼마까지 더 보탤 수 있나요?" hint="실제로 판매하는 장비의 중고 참고가만 포함하고, 가격 미확인 장비가 있으면 정확한 합계처럼 표시하지 않을게요." /><div className="gw-selection-guide">하나 선택 · 직접 금액을 입력해도 됩니다</div><div className="gw-chip-row">{[0, 50, 100, 200, 300, 500].map((value) => <button type="button" key={value} aria-pressed={Number(answers.extraBudget) === value} onClick={() => setAnswers((prev) => ({ ...prev, extraBudget: value, budgetTouched: true }))} style={chipStyle(Number(answers.extraBudget) === value)}>{value === 0 ? "추가 지출 없음" : value === 500 ? "500만원+" : value + "만원"}</button>)}</div><input className="gw-input" aria-label="추가 예산 직접 입력" type="number" min="0" value={answers.extraBudget} onChange={(event) => setAnswers((prev) => ({ ...prev, extraBudget: event.target.value, budgetTouched: true }))} style={{ marginTop: 14 }} />{!isValidBudget(answers.extraBudget) && <p role="alert" style={{ color: "#FFB020", fontSize: 11 }}>추가 예산은 0 이상의 유효한 금액을 입력해주세요.</p>}<NextButton disabled={!isValidBudget(answers.extraBudget)} onClick={() => { if (isValidBudget(answers.extraBudget)) setStep(resultStep); }}>시스템 기변 시나리오 보기</NextButton></>;

  const scenarios = generateUpgradeScenarios({ currentBody: body, currentLenses: selectedLenses, primaryLens, pains: answers.pains, portabilityDetails: answers.portabilityDetails, preserve: answers.preserve.filter((item) => item !== "특별히 없음"), subjects: answers.subjects, ratio: answers.ratio, lensIntent: answers.lensIntent, brandIntent: answers.brandIntent, designPreference: answers.designPreference, extraBudget: Number(answers.extraBudget) });
  const top = scenarios[0];
  const topVerdict = top.kind === "hold" ? "현재 시스템 유지" : top.capability.violations.length ? "조건부 기변" : mainImprovement(top) ? "목표 개선 후보 발견" : "기변 효과 확인 필요";
  return <><button type="button" className="gw-back" onClick={() => setStep(0)}>← 진단 다시 하기</button><header className="gw-result-head"><div className="gw-eyebrow">SYSTEM UPGRADE · RESULT</div><h2 className="gw-result-title">기변 판단: <span className="gw-result-verdict">{topVerdict}</span></h2><p className="gw-copy"><b style={{ color: "#ECECEA" }}>{body.brand} {body.model || body.name}</b>에서 원했던 변화, 필요한 비용, 잃는 점 순서로 확인하세요.</p><div className="gw-price-basis"><b>기변 가격 계산 기준 · 중고 참고가</b><span>판매와 구매 모두 DB의 중고 참고값을 사용합니다. 거래 범위·출처·기준일 데이터는 없습니다.</span></div></header><HeroScenarioCard scenario={top} extraBudget={answers.extraBudget} />{scenarios.length > 1 && <section className="gw-alternatives"><h3 className="gw-section-title">다른 선택지</h3><p className="gw-section-copy">비용, 바디 유지, 시스템 전환처럼 다른 타협점을 가진 대안입니다. 펼치면 추천안과 무엇이 다른지 확인할 수 있어요.</p><div className="gw-alternative-list">{scenarios.slice(1).map((scenario, index) => <AlternativeScenarioCard key={scenario.id} scenario={scenario} index={index + 2} extraBudget={answers.extraBudget} />)}</div></section>}<p className="gw-section-copy" style={{ marginTop: 14 }}>데이터가 없는 성능이나 가격은 숨기거나 0으로 표시하지 않고 ‘비교 데이터 부족’ 또는 ‘정확한 계산 불가’로 표시합니다.</p></>;
}
