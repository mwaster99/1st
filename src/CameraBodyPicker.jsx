import { useMemo, useState } from "react";
import { CAMERA_BODIES, createUnknownBody, searchCameraBodies } from "./cameraData.js";

const BRANDS = [...new Set(CAMERA_BODIES.map((body) => body.brand)), "기타"];
function PickerCard({ active = false, title, sub, onClick }) {
  return <button type="button" className={`gw-choice${active ? " is-selected" : ""}`} aria-pressed={active} onClick={onClick}><span className="gw-choice-inner"><span><span className="gw-choice-label">{title}</span>{sub && <span className="gw-choice-sub">{sub}</span>}</span><span className="gw-choice-mark" aria-hidden="true">✓</span></span></button>;
}

export default function CameraBodyPicker({ value, onChange, allowUnknown = true }) {
  const [mode, setMode] = useState("browse");
  const [phase, setPhase] = useState("brand");
  const [brand, setBrand] = useState("");
  const [series, setSeries] = useState("");
  const [query, setQuery] = useState("");
  const [directName, setDirectName] = useState("");

  const brandBodies = useMemo(() => CAMERA_BODIES.filter((body) => body.brand === brand), [brand]);
  const seriesOptions = useMemo(() => [...new Set(brandBodies.map((body) => body.series).filter(Boolean)), "기타"], [brandBodies]);
  const modelOptions = useMemo(() => brandBodies.filter((body) => body.series === series), [brandBodies, series]);
  const searchResults = useMemo(() => searchCameraBodies(query).slice(0, 8), [query]);

  const startBrowse = () => { setMode("browse"); setPhase("brand"); setBrand(""); setSeries(""); setQuery(""); };
  const startSearch = () => { setMode("search"); setQuery(""); };
  const startDirect = () => { setMode("direct"); setDirectName(query.trim()); };
  const edit = () => { onChange(null); startBrowse(); };

  if (value) return <div className="gw-picker-selected">
    <div className="gw-picker-head">
      <div><div className="gw-eyebrow">선택한 현재 바디</div><div style={{ fontSize: 18, fontWeight: 700, marginTop: 7 }}>{value.brand !== "기타" ? `${value.brand} ` : ""}{value.model || value.name}</div><div className="gw-choice-sub">{value.series && value.series !== "기타" ? `${value.series} 시리즈 · ` : ""}{value.kind === "fixed" ? "고정렌즈" : value.mount || "마운트 미확인"}</div></div>
      <button type="button" className="gw-button gw-button--secondary" onClick={edit}>수정</button>
    </div>
    {value.dataStatus === "unknown" && <div className="gw-notice" style={{ marginTop: 12 }}>모델은 등록되었지만 현재 MVP 데이터에 없어 세부 성능 비교는 제한됩니다. 없는 정보는 추정하지 않습니다.</div>}
  </div>;

  return <div>
    {mode === "browse" && <>
      {phase === "brand" && <><div className="gw-selection-guide">1/3 · 브랜드 하나를 선택하세요</div><div className="gw-grid">{BRANDS.map((item) => <PickerCard key={item} title={item} onClick={() => { setBrand(item); setSeries(""); setPhase("series"); }} />)}</div></>}
      {phase === "series" && <><button type="button" className="gw-back" onClick={() => setPhase("brand")}>← 브랜드 다시 선택</button><div className="gw-picker-stage">2/3 · {brand} 시리즈 선택</div><div className="gw-grid">{seriesOptions.map((item) => <PickerCard key={item} title={item} sub={item === "기타" ? "목록에 없는 시리즈" : `${brandBodies.filter((body) => body.series === item).length}개 모델`} onClick={() => { setSeries(item); item === "기타" ? startDirect() : setPhase("model"); }} />)}</div></>}
      {phase === "model" && <><button type="button" className="gw-back" onClick={() => setPhase("series")}>← 시리즈 다시 선택</button><div className="gw-picker-stage">3/3 · {brand} {series} 모델 선택</div><div style={{ display: "grid", gap: 8 }}>{modelOptions.map((body) => <PickerCard key={body.id} title={body.model} sub={`${body.kind === "fixed" ? "고정렌즈" : body.mount || "마운트 미확인"} · ${body.sensor?.format || "센서 정보 없음"}`} onClick={() => onChange(body)} />)}</div></>}
    </>}

    {mode === "search" && <><button type="button" className="gw-back" onClick={startBrowse}>← 브랜드별로 찾아보기</button><div className="gw-picker-stage">전체 모델 검색</div><input className="gw-input" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="예: a7c2, sony a7c ii, 소니 a7c2" /><div style={{ display: "grid", gap: 8, marginTop: 10 }}>{searchResults.map((body) => <PickerCard key={body.id} title={`${body.brand} ${body.model}`} sub={`${body.series} · ${body.kind === "fixed" ? "고정렌즈" : body.mount || "마운트 미확인"}`} onClick={() => onChange(body)} />)}</div>{query.trim() && !searchResults.length && <div className="gw-notice" style={{ marginTop: 12 }}>현재 DB에서 일치하는 모델을 찾지 못했습니다.</div>}</>}

    {mode === "direct" && <><button type="button" className="gw-back" onClick={startBrowse}>← 목록으로 돌아가기</button><div className="gw-picker-stage">목록에 없는 카메라 직접 등록</div><input className="gw-input" autoFocus value={directName} onChange={(event) => setDirectName(event.target.value)} placeholder="카메라 모델명을 입력하세요" /><p className="gw-helper">직접 입력한 모델은 등록할 수 있지만, 무게·센서·AF·가격처럼 확인되지 않은 값은 비교 불가로 처리됩니다.</p><button type="button" className="gw-button gw-button--primary" disabled={!directName.trim()} onClick={() => onChange(createUnknownBody(directName.trim(), brand || "기타", series || "기타"))}>이 모델로 등록</button></>}

    {mode === "browse" && <div className="gw-picker-tools"><button type="button" className="gw-button gw-button--secondary" onClick={startSearch}>모델명으로 검색</button>{allowUnknown && <button type="button" className="gw-back" onClick={startDirect}>목록에 내 카메라가 없어요</button>}</div>}
    {mode === "search" && allowUnknown && <button type="button" className="gw-back" onClick={startDirect}>검색 결과에 없어요 · 직접 입력</button>}
  </div>;
}
