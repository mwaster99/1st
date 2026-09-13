import { useMemo, useState } from "react";
import CameraBodyPicker from "./CameraBodyPicker.jsx";
import { CAMERA_LENSES, LENS_BY_NAME, createUnknownLens } from "./cameraData.js";
import { buildScenarioExplanation, generateUpgradeScenarios } from "./cameraScenarioEngine.js";
import { DESIGN_OPTIONS } from "./cameraDesign.js";

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
  return <button disabled={disabled} onClick={onClick} style={{ marginTop: 18, padding: "11px 18px", border: "none", borderRadius: 8, background: "#FFB020", color: "#14161A", fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.45 : 1 }}>{children}</button>;
}

function StepHeader({ current, total, phase, title, hint }) {
  const progress = Math.round((current / total) * 100);
  return <div style={{ marginTop: 16 }}>
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, color: "#3DDC97", ...mono, fontSize: 10 }}><span>SYSTEM UPGRADE · {current}/{total}</span><span>{phase}</span></div>
    <div style={{ height: 4, borderRadius: 999, background: "#252930", marginTop: 8, overflow: "hidden" }}><div style={{ width: progress + "%", height: "100%", borderRadius: 999, background: "#FFB020", transition: "width 180ms ease" }} /></div>
    <div style={{ display: "flex", gap: 6, marginTop: 7, color: "#656B74", ...mono, fontSize: 8, flexWrap: "wrap" }}>{PHASES.map((item, index) => <span key={item} style={{ color: item === phase ? "#FFB020" : "#656B74" }}>{item}{index < PHASES.length - 1 ? " →" : ""}</span>)}</div>
    <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, margin: "14px 0 6px" }}>{title}</h2>
    <p style={{ color: "#8B8F98", fontSize: 13, lineHeight: 1.6, marginTop: 0 }}>{hint}</p>
  </div>;
}

function ChoiceGrid({ options, selected, multi, onSelect }) {
  return <div className="gw-grid">{options.map((option) => { const value = typeof option === "string" ? option : option.value; const label = typeof option === "string" ? option : option.label; const active = multi ? selected.includes(value) : selected === value; return <button key={value} className="gw-card" onClick={() => onSelect(value)} style={active ? { borderColor: "#FFB020", background: "rgba(255,176,32,0.1)" } : undefined}>{label}{active ? "  ✓" : ""}</button>; })}</div>;
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
  return <div style={{ background: "#191C20", border: "1px solid #292E35", borderRadius: 10, padding: "10px 12px", display: "grid", gap: 5, marginBottom: 8 }}>{items.map((item) => <div key={item.label} style={{ display: "grid", gridTemplateColumns: "54px 1fr", gap: 8, fontSize: 11, lineHeight: 1.45 }}><span style={{ color: "#656B74", ...mono }}>{item.label}</span><span style={{ color: "#AEB2B9" }}>{item.value}</span></div>)}</div>;
}

function GearColumn({ code, label, items }) {
  return <div style={{ background: "#14161A", borderRadius: 8, padding: 9 }}><span style={{ color: "#8B8F98", ...mono, fontSize: 9 }}>{label} · {code}</span><div style={{ color: "#ECECEA", marginTop: 5, lineHeight: 1.5, fontSize: 11 }}>{items.map((item) => item.name).join(" · ") || "—"}</div></div>;
}

function formatPrice(value) {
  if (!value.missing.length) return value.known + "만원";
  const missing = value.missing.join(", ");
  return value.known > 0 ? "최소 " + value.known + "만원 + 가격 미확인" : "계산 불가 · " + missing + " 가격 미확인";
}

function formatAdditionalCost(scenario) {
  return scenario.cost.additionalCost === null ? "정확한 계산 불가" : scenario.cost.additionalCost + "만원";
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
  const colors = { improved: "#3DDC97", maintained: "#8BC5FF", degraded: "#FF8A80", unknown: "#AEB2B9" };
  const icons = { improved: "↑", maintained: "=", degraded: "↓", unknown: "?" };
  if (!items.length) return null;
  return <div style={{ marginTop: 12 }}><div style={{ color: colors[status], ...mono, fontSize: 10, fontWeight: 700 }}>{icons[status]} {title}</div><div style={{ display: "grid", gap: 6, marginTop: 7 }}>{items.map((item, index) => <div key={item.key + "-" + index} style={{ background: "#14161A", borderRadius: 8, padding: "9px 10px" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 9, flexWrap: "wrap", fontSize: 11 }}><b>{item.label}</b><span style={{ color: colors[status] }}>{item.summary}</span></div><div style={{ color: "#777D86", fontSize: 10, lineHeight: 1.5, marginTop: 4 }}>{(item.details || [item.detail]).filter(Boolean).join(" · ")}</div></div>)}</div></div>;
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
  return <div style={{ background: "#14161A", borderRadius: 9, padding: "11px 12px", minHeight: 76 }}><div style={{ color: "#777D86", ...mono, fontSize: 9 }}>{label}</div><div style={{ color: accent, fontSize: 16, fontWeight: 750, marginTop: 7, lineHeight: 1.3 }}>{value}</div>{detail && <div style={{ color: "#777D86", fontSize: 10, marginTop: 5, lineHeight: 1.45 }}>{detail}</div>}</div>;
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
  return <div style={{ marginTop: 12 }}><div style={{ color: "#8B8F98", fontSize: 11, lineHeight: 1.6 }}>현재 시스템 · {systemName(scenario.currentSystem)}</div><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 7, marginTop: 7 }}><GearColumn code="KEEP" label="그대로 사용" items={scenario.keep} /><GearColumn code="SELL" label="판매" items={scenario.sell} /><GearColumn code="BUY" label="새로 구매" items={scenario.buy} /></div><div style={{ color: "#AEB2B9", fontSize: 11, lineHeight: 1.6, marginTop: 7 }}>→ 목표 시스템 · {systemName(scenario.targetSystem)}</div></div>;
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

  return <section style={{ background: "linear-gradient(145deg, rgba(255,176,32,0.13), #1D2024 42%)", border: "2px solid #FFB020", borderRadius: 15, padding: 19 }}>
    <div style={{ color: "#FFB020", ...mono, fontSize: 11, fontWeight: 700 }}>BEST MATCH · 가장 추천하는 선택</div>
    <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 23, lineHeight: 1.25, margin: "10px 0 4px" }}>{combinationName(scenario)}</h3>
    <div style={{ color: scenario.capability.violations.length ? "#FFB020" : "#3DDC97", fontSize: 12, fontWeight: 700 }}>{recommendationLabel(scenario)}</div>

    <div style={{ marginTop: 15, padding: "13px 14px", background: "rgba(20,22,26,0.7)", borderRadius: 10 }}><div style={{ color: "#ECECEA", fontSize: 12, fontWeight: 700 }}>왜 추천하나요?</div>{explanation.slice(0, 3).map((line) => <p key={line} style={{ color: "#B8BCC3", fontSize: 12, lineHeight: 1.65, margin: "6px 0 0" }}>{line}</p>)}</div>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))", gap: 8, marginTop: 12 }}>
      <MainMetric label="예상 추가금" value={formatAdditionalCost(scenario)} detail={"판매 " + formatPrice(scenario.cost.sellValue) + " · 구매 " + formatPrice(scenario.cost.buyValue)} accent={overBudget ? "#FFB020" : "#3DDC97"} />
      <MainMetric label="대표 조합 무게" value={weightValue} detail={weightDetail} />
      <MainMetric label="가장 크게 좋아지는 점" value={improvement ? improvement.label : "확인된 개선 없음"} detail={improvement?.summary} accent="#3DDC97" />
      <MainMetric label="가장 큰 손해" value={loss ? loss.label : "확인된 큰 손해 없음"} detail={loss?.summary} accent={loss ? "#FF8A80" : "#8BC5FF"} />
    </div>

    <details style={{ marginTop: 14, borderTop: "1px solid rgba(255,176,32,0.25)", paddingTop: 12 }}>
      <summary style={{ color: "#ECECEA", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>세부 판단과 장비 이동 보기</summary>
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
  return <details style={{ background: "#1D2024", border: "1px solid #2A2E34", borderRadius: 11, padding: "0 14px" }}>
    <summary style={{ cursor: "pointer", listStylePosition: "outside", padding: "14px 2px" }}><div style={{ display: "inline-grid", width: "calc(100% - 14px)", gridTemplateColumns: "1fr auto", gap: 10, verticalAlign: "middle" }}><div><div style={{ color: "#FFB020", ...mono, fontSize: 9 }}>대안 {index} · {scenario.strategy}</div><div style={{ color: "#ECECEA", fontWeight: 700, fontSize: 14, marginTop: 5 }}>{combinationName(scenario)}</div><div style={{ color: "#8B8F98", fontSize: 10, marginTop: 4 }}>{improvement ? improvement.label + " 개선" : recommendationLabel(scenario)}{loss ? " · " + loss.label + " 주의" : ""}</div></div><div style={{ textAlign: "right" }}><div style={{ color: scenario.cost.additionalCost === null ? "#FFB020" : "#3DDC97", fontWeight: 750, fontSize: 14 }}>{formatAdditionalCost(scenario)}</div><div style={{ color: "#656B74", fontSize: 9, marginTop: 4 }}>예상 추가금</div></div></div></summary>
    <div style={{ borderTop: "1px solid #2A2E34", padding: "12px 0 14px" }}><p style={{ color: "#AEB2B9", fontSize: 11, lineHeight: 1.65, marginTop: 0 }}>{explanation[0]}</p><ChangeGroups scenario={scenario} /><EquipmentTransition scenario={scenario} /><ScoreDetails scenario={scenario} /><div style={{ color: "#777D86", fontSize: 10, lineHeight: 1.55, marginTop: 10 }}>판매 예상금 {formatPrice(scenario.cost.sellValue)} · 구매 예상금 {formatPrice(scenario.cost.buyValue)}</div></div>
  </details>;
}

export default function CameraUpgradeSystemDiagnosis({ onBack }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ body: null, lenses: [], lensInput: "", primaryLensId: "", pains: [], portabilityDetails: [], preserve: [], subjects: [], ratio: "", lensIntent: "", brandIntent: "", designPreference: "any", extraBudget: 100, budgetTouched: false });
  const body = answers.body;
  const availableLenses = body?.mount ? CAMERA_LENSES.filter((lens) => lens.mount === body.mount) : CAMERA_LENSES;
  const selectedLenses = useMemo(() => answers.lenses.map((name) => LENS_BY_NAME[name] || createUnknownLens(name, body?.mount || null)), [answers.lenses, body?.mount]);
  const primaryLens = selectedLenses.find((lens) => lens.id === answers.primaryLensId);
  const hasPortabilityQuestion = answers.pains.includes("더 가볍고 작은 카메라를 원해요");

  const questions = [
    { key: "pains", phase: "기변 목표", title: "현재 시스템에서 무엇을 해결하고 싶나요?", hint: "선택한 항목을 추천이 가장 먼저 해결해야 할 목표로 사용할게요.", options: PAIN_OPTIONS, multi: true },
    ...(hasPortabilityQuestion ? [{ key: "portabilityDetails", phase: "기변 목표", title: "휴대성에서 가장 불편한 것은 무엇인가요?", hint: "선택한 불편이 바디 때문인지 렌즈 때문인지에 따라 추천 전략이 달라집니다.", options: PORTABILITY_DETAIL_OPTIONS, multi: true }] : []),
    { key: "preserve", phase: "기변 목표", title: "현재 장비에서 잃고 싶지 않은 점은 무엇인가요?", hint: "새 장비에서 이 부분이 나빠지면 추천 점수를 크게 낮출게요.", options: PRESERVE_OPTIONS, multi: true },
    { key: "subjects", phase: "사용 목적", title: "기변 후 무엇을 더 많이 찍고 싶나요?", hint: "바디의 특성과 렌즈가 담당할 수 있는 촬영 영역을 함께 계산할게요.", options: SUBJECT_OPTIONS, multi: true },
    { key: "ratio", phase: "사용 목적", title: "사진과 영상의 비중은 어떤가요?", hint: "사진과 영상 중 실제로 더 자주 쓰는 쪽에 추천 가중치를 둘게요.", options: RATIO_OPTIONS },
    { key: "lensIntent", phase: "전환 조건", title: "현재 렌즈는 어떻게 하고 싶나요?", hint: "기존 렌즈를 유지할지에 따라 기변 비용과 추천 시스템이 크게 달라집니다.", options: LENS_INTENT_OPTIONS },
    { key: "brandIntent", phase: "전환 조건", title: "현재 브랜드를 유지하고 싶나요?", hint: "타 브랜드를 허용하면 기존 렌즈 판매를 포함한 전체 시스템 전환안도 비교할게요.", options: BRAND_INTENT_OPTIONS },
    { key: "designPreference", phase: "전환 조건", title: "선호하는 카메라 디자인이 있나요?", hint: "조건이 비슷하면 선호하는 형태를 우대합니다. 디자인이 달라도 목표와 예산에 잘 맞는 후보는 함께 비교할게요.", options: DESIGN_OPTIONS },
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

  if (step === 0) return <><button className="gw-back" onClick={onBack}>← 시작 화면으로</button><StepHeader current={1} total={totalSteps} phase="현재 장비" title="현재 사용하는 카메라 바디는 무엇인가요?" hint="브랜드, 시리즈, 모델 순으로 찾거나 모델명을 바로 검색할 수 있어요." /><CameraBodyPicker value={body} allowUnknown onChange={(selected) => setAnswers((prev) => ({ ...prev, body: selected, lenses: selected?.id === prev.body?.id ? prev.lenses : [], primaryLensId: selected?.id === prev.body?.id ? prev.primaryLensId : "" }))} /><NextButton disabled={!body} onClick={() => setStep(1)}>현재 바디 확인</NextButton></>;

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
    return <><button className="gw-back" onClick={goBack}>← 이전 질문</button>{summary}<StepHeader current={2} total={totalSteps} phase="현재 장비" title="현재 보유 렌즈와 대표 렌즈를 알려주세요." hint="렌즈를 추가한 뒤 가장 자주 바디에 물려 쓰는 렌즈를 선택해주세요. 대표 조합의 무게는 이 렌즈를 기준으로 계산합니다." /><div style={{ display: "flex", gap: 8 }}><input list="upgrade-lens-list" value={answers.lensInput} onChange={(event) => setAnswers((prev) => ({ ...prev, lensInput: event.target.value }))} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addLens(); } }} placeholder="렌즈명 검색 또는 직접 입력" style={{ ...inputStyle, flex: 1 }} /><button onClick={addLens} style={{ padding: "0 14px", borderRadius: 8, border: "none", background: "#FFB020", color: "#14161A", fontWeight: 700 }}>추가</button></div><datalist id="upgrade-lens-list">{availableLenses.map((lens) => <option key={lens.id} value={lens.name}>{lens.roles.join(" · ")}</option>)}</datalist><div style={{ display: "grid", gap: 8, marginTop: 14 }}>{selectedLenses.map((lens) => { const active = primaryLens?.id === lens.id; return <button key={lens.id} type="button" onClick={() => setAnswers((prev) => ({ ...prev, primaryLensId: lens.id }))} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "10px 11px", borderRadius: 9, border: active ? "1px solid #FFB020" : "1px solid #2A2E34", background: active ? "rgba(255,176,32,0.1)" : "#1D2024", color: "#ECECEA", textAlign: "left", cursor: "pointer" }}><span><b>{lens.name}</b><span style={{ display: "block", color: lens.dataStatus === "unknown" ? "#FFB020" : "#8B8F98", fontSize: 10, marginTop: 3 }}>{active ? "대표 렌즈 · " : ""}{lens.dataStatus === "unknown" ? "상세 데이터 미등록" : (lens.roles || []).join(" · ")}</span></span><span onClick={(event) => { event.stopPropagation(); removeLens(lens); }} style={{ color: "#8B8F98", padding: 5 }}>×</span></button>; })}</div>{selectedLenses.some((lens) => lens.dataStatus === "unknown") && <p style={{ color: "#FFB020", fontSize: 11, lineHeight: 1.55 }}>직접 입력한 렌즈는 무게·가격이 미확인 상태로 저장됩니다. 필요한 계산도 ‘계산 불가’로 표시됩니다.</p>}<NextButton disabled={!selectedLenses.length || !primaryLens} onClick={() => setStep(questionStart)}>현재 장비 등록 완료</NextButton></>;
  }

  if (step >= questionStart && step < budgetStep) {
    const selected = answers[activeQuestion.key];
    const choose = (value) => activeQuestion.multi ? toggle(activeQuestion.key, value) : (setAnswers((prev) => ({ ...prev, [activeQuestion.key]: value })), setStep((current) => current + 1));
    return <><button className="gw-back" onClick={goBack}>← 이전 질문</button>{summary}<StepHeader current={step + 1} total={totalSteps} phase={activeQuestion.phase} title={activeQuestion.title} hint={activeQuestion.hint} /><ChoiceGrid options={activeQuestion.options} selected={selected} multi={activeQuestion.multi} onSelect={choose} />{activeQuestion.multi && <NextButton disabled={!selected.length} onClick={() => setStep((current) => current + 1)}>선택 완료 ({selected.length})</NextButton>}</>;
  }

  if (step === budgetStep) return <><button className="gw-back" onClick={goBack}>← 이전 질문</button>{summary}<StepHeader current={totalSteps} total={totalSteps} phase="예산" title="판매금에 얼마까지 더 보탤 수 있나요?" hint="실제로 판매하는 장비의 중고 참고가만 포함하고, 가격 미확인 장비가 있으면 정확한 합계처럼 표시하지 않을게요." /><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{[0, 50, 100, 200, 300, 500].map((value) => <button key={value} onClick={() => setAnswers((prev) => ({ ...prev, extraBudget: value, budgetTouched: true }))} style={chipStyle(Number(answers.extraBudget) === value)}>{value === 0 ? "추가 지출 없음" : value === 500 ? "500만원+" : value + "만원"}</button>)}</div><input type="number" min="0" value={answers.extraBudget} onChange={(event) => setAnswers((prev) => ({ ...prev, extraBudget: event.target.value, budgetTouched: true }))} style={{ ...inputStyle, marginTop: 14 }} />{!isValidBudget(answers.extraBudget) && <p role="alert" style={{ color: "#FFB020", fontSize: 11 }}>추가 예산은 0 이상의 유효한 금액을 입력해주세요.</p>}<NextButton disabled={!isValidBudget(answers.extraBudget)} onClick={() => { if (isValidBudget(answers.extraBudget)) setStep(resultStep); }}>시스템 기변 시나리오 보기</NextButton></>;

  const scenarios = generateUpgradeScenarios({ currentBody: body, currentLenses: selectedLenses, primaryLens, pains: answers.pains, portabilityDetails: answers.portabilityDetails, preserve: answers.preserve.filter((item) => item !== "특별히 없음"), subjects: answers.subjects, ratio: answers.ratio, lensIntent: answers.lensIntent, brandIntent: answers.brandIntent, designPreference: answers.designPreference, extraBudget: Number(answers.extraBudget) });
  const top = scenarios[0];
  const topVerdict = top.kind === "hold" ? "현재 시스템 유지" : top.capability.violations.length ? "조건부 기변" : mainImprovement(top) ? "목표 개선 후보 발견" : "기변 효과 확인 필요";
  return <><button className="gw-back" onClick={() => setStep(0)}>← 진단 다시 하기</button><div style={{ marginTop: 18, color: "#3DDC97", ...mono, fontSize: 11 }}>SYSTEM UPGRADE · RESULT</div><h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 23, margin: "10px 0 6px" }}>결론: <span style={{ color: top.kind === "hold" ? "#8BC5FF" : "#3DDC97" }}>{topVerdict}</span></h2><p style={{ color: "#AEB2B9", fontSize: 13, lineHeight: 1.65, marginBottom: 16 }}><b style={{ color: "#ECECEA" }}>{body.brand} {body.model || body.name}</b>에서 무엇을 바꾸는 게 가장 합리적인지 먼저 결론부터 보여드릴게요.</p><HeroScenarioCard scenario={top} extraBudget={answers.extraBudget} />{scenarios.length > 1 && <section style={{ marginTop: 23 }}><h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, margin: "0 0 10px" }}>다른 선택지</h3><p style={{ color: "#777D86", fontSize: 11, lineHeight: 1.55, margin: "0 0 10px" }}>비용, 바디 유지, 시스템 전환처럼 다른 타협점을 가진 대안입니다. 눌러서 세부 내용을 확인할 수 있어요.</p><div style={{ display: "grid", gap: 9 }}>{scenarios.slice(1).map((scenario, index) => <AlternativeScenarioCard key={scenario.id} scenario={scenario} index={index + 2} extraBudget={answers.extraBudget} />)}</div></section>}<p style={{ color: "#656B74", fontSize: 11, lineHeight: 1.6, marginTop: 14 }}>데이터가 없는 성능이나 가격은 숨기거나 0으로 표시하지 않고 ‘비교 데이터 부족’ 또는 ‘정확한 계산 불가’로 표시합니다.</p></>;
}
