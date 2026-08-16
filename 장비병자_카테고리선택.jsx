import { useState } from "react";

const CATEGORIES = [
  {
    id: "pc",
    code: "PC",
    label: "PC / 컴퓨터",
    customFlow: true,
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
    sub: [
      { id: "monitor", label: "모니터", purpose: [
        { id: "office", label: "사무용" }, { id: "gaming", label: "게이밍" }, { id: "color", label: "색보정 / 작업용" },
      ]},
      { id: "keyboard", label: "키보드", purpose: [
        { id: "office", label: "사무 / 타건감" }, { id: "gaming", label: "게이밍" }, { id: "dev", label: "프로그래밍" },
      ]},
      { id: "mouse", label: "마우스", purpose: [
        { id: "office", label: "사무용" }, { id: "gaming", label: "게이밍" }, { id: "design", label: "디자인 작업용" },
      ]},
      { id: "audio", label: "헤드셋 / 스피커", purpose: [
        { id: "music", label: "음악 감상" }, { id: "gaming", label: "게이밍" }, { id: "call", label: "화상회의" },
      ]},
      { id: "webcam", label: "웹캠", purpose: [
        { id: "call", label: "화상회의" }, { id: "stream", label: "방송 / 스트리밍" }, { id: "class", label: "화상 강의" },
      ]},
    ],
  },
  {
    id: "minipc",
    code: "MINI",
    label: "미니 PC",
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

function CameraFilterPanel({ onBack }) {
  const [family, setFamily] = useState(null);
  const [compactOnly, setCompactOnly] = useState(false);
  const [filters, setFilters] = useState({ type: [], brand: [], sensor: [], price: [], purpose: [] });
  const [compareList, setCompareList] = useState([]);
  const [purposeText, setPurposeText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiResult, setAiResult] = useState(null);

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
      const prompt = `다음 카메라들을 "${purposeText || "일반적인 사용"}" 목적 기준으로 비교해줘: ${compareList.join(", ")}.
반드시 아래 JSON 형식으로만 응답하고, 다른 설명이나 코드블록 표시는 절대 붙이지 마:
{"criteria": ["가격대(신품 기준)", "센서", "무게감", "이 목적에서의 장점", "이 목적에서의 단점", "추천도(5점 만점)"], "cameras": [{"name": "카메라명", "values": {"가격대(신품 기준)": "...", "센서": "...", "무게감": "...", "이 목적에서의 장점": "...", "이 목적에서의 단점": "...", "추천도(5점 만점)": "..."}}]}`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await response.json();
      const text = (data.content || [])
        .map((b) => b.text || "")
        .join("")
        .replace(/```json|```/g, "")
        .trim();
      const parsed = JSON.parse(text);
      setAiResult(parsed);
    } catch (e) {
      setAiError("비교표를 만드는 중 문제가 생겼어요. 다시 시도해주세요.");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <>
      <button className="gw-back" onClick={onBack}>← 카테고리 다시 선택</button>

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
          지금은 예시 데이터예요. 실제 신품·중고 가격 연동은 다음 단계에서 붙일 예정이에요.
        </p>
      </div>

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
            <div>
              <label style={labelStyle}>CPU</label>
              <input style={inputStyle} value={spec.cpu} onChange={(e) => updateSpec("cpu", e.target.value)} placeholder="예: 인텔 i5-10400" />
            </div>
            <div>
              <label style={labelStyle}>GPU</label>
              <input style={inputStyle} value={spec.gpu} onChange={(e) => updateSpec("gpu", e.target.value)} placeholder="예: RTX 3060" />
            </div>
            <div>
              <label style={labelStyle}>RAM</label>
              <input style={inputStyle} value={spec.ram} onChange={(e) => updateSpec("ram", e.target.value)} placeholder="예: 16GB" />
            </div>
            <div>
              <label style={labelStyle}>저장장치</label>
              <input style={inputStyle} value={spec.storage} onChange={(e) => updateSpec("storage", e.target.value)} placeholder="예: SSD 500GB" />
            </div>
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
          <p style={{ color: "#8B8F98", fontSize: 13, marginTop: 18, lineHeight: 1.6 }}>
            {path === "upgrade"
              ? "다음 단계에서는 이 사양을 기준으로 어떤 부품을 업그레이드하면 좋을지 비교/추천이 이어질 예정이에요."
              : "다음 단계에서는 이 조건에 맞는 견적/부품 비교가 이어질 예정이에요."}
          </p>
          <button className="gw-back" style={{ marginTop: 10, color: "#FFB020" }} onClick={resetAll}>
            ↺ 처음부터 다시
          </button>
        </div>
      )}
    </>
  );
}

const STEP_LABEL = ["카테고리", "세부 유형", "사용 목적", "진단 결과"];

export default function GearWizard() {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState(null);
  const [sub, setSub] = useState(null);
  const [purpose, setPurpose] = useState(null);

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
    setStep(0); setCategory(null); setSub(null); setPurpose(null);
  }
  function pickCategory(id) {
    setCategory(id); setSub(null); setPurpose(null); setStep(1);
  }
  function pickSub(id) { setSub(id); setStep(2); }
  function pickPurpose(id) { setPurpose(id); setStep(3); }

  return (
    <div style={{ minHeight: "100%", background: "#14161A", color: "#ECECEA", fontFamily: "'Inter', system-ui, sans-serif", padding: "40px 20px 60px", display: "flex", justifyContent: "center" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        .gw-card { background: #1D2024; border: 1px solid #2A2E34; border-radius: 10px; padding: 20px 18px; cursor: pointer; transition: border-color 120ms ease, transform 120ms ease, background 120ms ease; text-align: left; }
        .gw-card:hover { border-color: #FFB020; background: #23262B; transform: translateY(-2px); }
        .gw-card:focus-visible { outline: 2px solid #FFB020; outline-offset: 2px; }
        .gw-badge { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.06em; color: #8B8F98; }
        .gw-back { background: none; border: none; color: #8B8F98; font-family: 'JetBrains Mono', monospace; font-size: 12px; cursor: pointer; padding: 6px 0; }
        .gw-back:hover { color: #ECECEA; }
        .gw-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 640 }}>
        {!isFilterMode && !isCustomFlow && (
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

        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 26, margin: "0 0 6px" }}>
          장비병자 <span style={{ color: "#FFB020" }}>진단 접수</span>
        </h1>
        <p style={{ color: "#8B8F98", fontSize: 14, margin: "0 0 26px" }}>
          {step === 0 && "어떤 장비를 보고 계신가요?"}
          {step === 1 && isFilterMode && "원하는 조건을 골라주세요. 여러 개 골라도 돼요."}
          {step === 1 && !isFilterMode && "세부 유형을 골라주세요."}
          {step === 2 && "주로 어디에 쓰실 건가요?"}
          {step === 3 && "선택하신 조건으로 다음 단계(스펙/가격 비교)를 준비할게요."}
        </p>

        {step === 0 && (
          <div className="gw-grid">
            {CATEGORIES.map((c) => (
              <button key={c.id} className="gw-card" onClick={() => pickCategory(c.id)}>
                <div className="gw-badge">{c.code}</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginTop: 6 }}>{c.label}</div>
              </button>
            ))}
          </div>
        )}

        {step === 1 && isFilterMode && <CameraFilterPanel onBack={() => setStep(0)} />}

        {step === 1 && isCustomFlow && <PCFlowPanel onBack={() => setStep(0)} />}

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
