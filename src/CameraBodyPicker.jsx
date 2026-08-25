import { useMemo, useState } from "react";
import { CAMERA_BODIES, createUnknownBody, searchCameraBodies } from "./cameraData.js";

const BRANDS = ["Sony", "Canon", "Nikon", "Fujifilm", "Panasonic", "Ricoh / Pentax", "Leica", "기타"];
const inputStyle = { width: "100%", padding: 12, borderRadius: 8, background: "#14161A", border: "1px solid #2A2E34", color: "#ECECEA" };

function PickerCard({ active = false, title, sub, onClick }) {
  return <button type="button" className="gw-card" onClick={onClick} style={{ padding: "15px 16px", borderColor: active ? "#FFB020" : undefined, background: active ? "rgba(255,176,32,0.1)" : undefined }}><div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>{sub && <div style={{ color: "#8B8F98", fontSize: 11, marginTop: 4 }}>{sub}</div>}</button>;
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

  if (value) return <div style={{ background: "rgba(61,220,151,0.08)", border: "1px solid rgba(61,220,151,0.3)", borderRadius: 12, padding: 15 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
      <div><div style={{ color: "#3DDC97", fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>현재 바디</div><div style={{ fontSize: 17, fontWeight: 700, marginTop: 6 }}>{value.brand !== "기타" ? `${value.brand} ` : ""}{value.model || value.name}</div><div style={{ color: "#8B8F98", fontSize: 12, marginTop: 4 }}>{value.series && value.series !== "기타" ? `${value.series} 시리즈 · ` : ""}{value.mount || "마운트 미확인"}</div></div>
      <button type="button" onClick={edit} style={{ border: "1px solid #3A3F47", background: "transparent", color: "#AEB2B9", borderRadius: 7, padding: "6px 9px", cursor: "pointer", fontSize: 11 }}>수정</button>
    </div>
    {value.dataStatus === "unknown" && <div style={{ color: "#FFB020", fontSize: 11, lineHeight: 1.55, marginTop: 10 }}>모델은 등록되었지만 현재 MVP 데이터에 없어 세부 성능 비교는 제한됩니다. 없는 정보는 추정하지 않습니다.</div>}
  </div>;

  return <div>
    {mode === "browse" && <>
      {phase === "brand" && <><div style={{ color: "#8B8F98", fontSize: 11, marginBottom: 9 }}>1. 브랜드를 선택하세요</div><div className="gw-grid">{BRANDS.map((item) => <PickerCard key={item} title={item} onClick={() => { setBrand(item); setSeries(""); setPhase("series"); }} />)}</div></>}
      {phase === "series" && <><button type="button" className="gw-back" onClick={() => setPhase("brand")}>← 브랜드 다시 선택</button><div style={{ color: "#FFB020", fontSize: 12, margin: "10px 0" }}>{brand} · 시리즈를 선택하세요</div><div className="gw-grid">{seriesOptions.map((item) => <PickerCard key={item} title={item} sub={item === "기타" ? "목록에 없는 시리즈" : `${brandBodies.filter((body) => body.series === item).length}개 모델`} onClick={() => { setSeries(item); item === "기타" ? startDirect() : setPhase("model"); }} />)}</div></>}
      {phase === "model" && <><button type="button" className="gw-back" onClick={() => setPhase("series")}>← 시리즈 다시 선택</button><div style={{ color: "#FFB020", fontSize: 12, margin: "10px 0" }}>{brand} · {series} · 모델을 선택하세요</div><div style={{ display: "grid", gap: 8 }}>{modelOptions.map((body) => <PickerCard key={body.id} title={body.model} sub={`${body.mount} · ${body.sensor?.format || "센서 정보 없음"}`} onClick={() => onChange(body)} />)}</div></>}
    </>}

    {mode === "search" && <><button type="button" className="gw-back" onClick={startBrowse}>← 브랜드별로 찾아보기</button><div style={{ color: "#FFB020", fontSize: 12, margin: "10px 0" }}>전체 모델 검색</div><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="예: a7c2, sony a7c ii, 소니 a7c2" style={inputStyle} /><div style={{ display: "grid", gap: 8, marginTop: 10 }}>{searchResults.map((body) => <PickerCard key={body.id} title={`${body.brand} ${body.model}`} sub={`${body.series} · ${body.mount}`} onClick={() => onChange(body)} />)}</div>{query.trim() && !searchResults.length && <div style={{ color: "#8B8F98", fontSize: 12, lineHeight: 1.6, marginTop: 12 }}>현재 DB에서 일치하는 모델을 찾지 못했습니다.</div>}</>}

    {mode === "direct" && <><button type="button" className="gw-back" onClick={startBrowse}>← 목록으로 돌아가기</button><div style={{ color: "#FFB020", fontSize: 12, margin: "10px 0" }}>목록에 없는 카메라 직접 등록</div><input autoFocus value={directName} onChange={(event) => setDirectName(event.target.value)} placeholder="카메라 모델명을 입력하세요" style={inputStyle} /><p style={{ color: "#8B8F98", fontSize: 11, lineHeight: 1.55 }}>직접 입력한 모델은 등록할 수 있지만, 무게·센서·AF·가격처럼 확인되지 않은 값은 비교 불가로 처리됩니다.</p><button type="button" disabled={!directName.trim()} onClick={() => onChange(createUnknownBody(directName.trim(), brand || "기타", series || "기타"))} style={{ padding: "10px 14px", border: "none", borderRadius: 8, background: "#FFB020", color: "#14161A", fontWeight: 700, opacity: directName.trim() ? 1 : 0.45 }}>이 모델로 등록</button></>}

    {mode === "browse" && <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 15 }}><button type="button" onClick={startSearch} style={{ border: "1px solid #3A3F47", background: "#1D2024", color: "#ECECEA", borderRadius: 8, padding: "9px 11px", cursor: "pointer" }}>모델명을 바로 검색할래요</button>{allowUnknown && <button type="button" onClick={startDirect} style={{ border: "none", background: "transparent", color: "#FFB020", padding: "9px 4px", cursor: "pointer" }}>목록에 내 카메라가 없어요</button>}</div>}
    {mode === "search" && allowUnknown && <button type="button" onClick={startDirect} style={{ border: "none", background: "transparent", color: "#FFB020", padding: "11px 2px", cursor: "pointer" }}>검색 결과에 없어요 · 직접 입력</button>}
  </div>;
}
