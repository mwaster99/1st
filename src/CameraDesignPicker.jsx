import { useId, useState } from "react";
import { DESIGN_OPTIONS } from "./cameraDesign.js";

const DESIGN_HELP = {
  any: {
    short: "외형보다 목적·예산을 우선",
    detail: "특정 형태를 우대하지 않고 촬영 목적, 예산, 휴대성 같은 조건을 먼저 봅니다.",
  },
  slr: {
    short: "중앙이 솟은 전통적 카메라 형태",
    detail: "바디 위 중앙에 뷰파인더 부분이 돌출되어 있고, 렌즈를 중심으로 좌우 그립이 잡힌 전통적인 카메라 형태입니다.",
  },
  rangefinder: {
    short: "상단이 평평하고 뷰파인더가 한쪽에 있는 형태",
    detail: "바디 윗면이 비교적 평평하고 뷰파인더가 한쪽으로 치우쳐 보여, 네모반듯하고 낮은 인상을 주는 형태입니다.",
  },
  classic: {
    short: "다이얼과 금속 느낌이 드러나는 복고 형태",
    detail: "상단 조작 다이얼과 금속 질감이 눈에 띄어 필름 카메라를 닮은 인상을 주는 형태입니다.",
  },
  minimal: {
    short: "작고 단순한 선으로 정리된 형태",
    detail: "돌출부와 장식을 줄이고 작은 크기와 단순한 선을 강조해 가볍고 간결해 보이는 형태입니다.",
  },
};

function normalizedValues(value) {
  const values = Array.isArray(value) ? value : [value || "any"];
  return values.length ? values : ["any"];
}

export default function CameraDesignPicker({ value, onChange }) {
  const [openInfo, setOpenInfo] = useState(null);
  const baseId = useId();
  const selected = normalizedValues(value);

  function toggle(optionValue) {
    if (optionValue === "any") {
      onChange(["any"]);
      return;
    }
    const withoutAny = selected.filter((item) => item !== "any");
    const next = withoutAny.includes(optionValue) ? withoutAny.filter((item) => item !== optionValue) : [...withoutAny, optionValue];
    onChange(next.length ? next : ["any"]);
  }

  return <div className="gw-design-picker">
    <div className="gw-design-grid" role="group" aria-label="선호하는 카메라 디자인 복수 선택">
      {DESIGN_OPTIONS.map((option) => {
        const active = selected.includes(option.value);
        const infoId = `${baseId}-${option.value}`;
        const help = DESIGN_HELP[option.value];
        return <div className={`gw-design-card${active ? " is-selected" : ""}`} key={option.value}>
          <button type="button" className="gw-design-select" aria-pressed={active} onClick={() => toggle(option.value)}>
            <span className={`gw-camera-silhouette gw-camera-silhouette--${option.value}`} aria-hidden="true"><span /></span>
            <span><span className="gw-choice-label">{option.label}</span><span className="gw-choice-sub">{help.short}</span></span>
            <span className="gw-choice-mark" aria-hidden="true">✓</span>
          </button>
          <button type="button" className="gw-info-button" aria-label={`${option.label} 디자인 설명`} aria-expanded={openInfo === option.value} aria-controls={infoId} onClick={() => setOpenInfo((current) => current === option.value ? null : option.value)}>i</button>
          {openInfo === option.value && <div className="gw-design-info" id={infoId} role="note"><b>{option.label}</b><span>{help.detail}</span></div>}
        </div>;
      })}
    </div>
    <p className="gw-section-copy" style={{ marginTop: 10 }}>여러 형태를 함께 고를 수 있습니다. ‘상관없음’을 고르면 다른 선택이 해제되고, 다른 형태를 고르면 ‘상관없음’이 해제됩니다.</p>
  </div>;
}
