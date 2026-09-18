# Objective DB 1차 확장 — 2026-09-18

이번 단계는 제품 정보의 공통 원본과 MVP 후보 풀을 확장했다. Experience DB나 새 추천 알고리즘은 만들지 않았다. 모든 세부 사양과 현재 시장가격을 검증한 완성 DB는 아니다.

## 기존 문제와 해결

기변 바디 7개/렌즈 11개, 첫 구매 구성 5개, 추가 구매 바디 14개에 모델·가격·무게가 중복됐다. A7 IV는 658/659g으로 달랐고 Z6 III는 바디 단독 670g과 배터리/카드 포함 760g이 섞였다. X-S20/R8은 첫 구매에만 있고 바디 무게가 없었다.

이제 물리 사양과 가격은 `src/data/cameraProducts.json`에서만 수정한다. Z6 III는 비교용 무게 760g과 단독 무게 670g을 분리했다. A7 IV는 658g으로 통일했고 X-S20 491g, R8 461g을 연결했다. RF 24-50의 손떨림보정도 공식 사양에 따라 true로 수정했다.

## 구조와 단위

| 파일 | 역할 |
| --- | --- |
| `src/data/cameraProducts.json` | schemaVersion 1; bodies/lenses; 식별자, 마운트, 사양, 구조화 가격, 출처 |
| `src/data/cameraLegacyPolicy.json` | 기존 시연 점수·용도 태그·추천 문구·첫 구매 구성의 제품 ID만 보존. Objective/Experience 평가 자료로 간주하지 않음 |
| `src/cameraCatalog.js` | canonical → 기존 엔진 인터페이스, KRW → 만원 변환, 내장 렌즈 표현 |
| `src/cameraData.js` | 기존 export 호환, ID/이름 인덱스, 검색, 미등록 장비 |
| `src/cameraCatalogViews.js` | 추가 구매 목록/비교표, 가격대, 미확인 가격의 자금 계획 |
| `src/firstPurchaseEngine.js` | 5개 구성의 물리값/가격을 제품 ID로 참조 |

바디는 `id/name/brand/series/model/aliases/mount/kind/bodyStyle`와 `specs`를 가진다. kind는 interchangeable/fixed/dslr, bodyStyle은 slr/rangefinder/compact다. bodyStyle은 외형 분류이며 미적 점수가 아니다. 기존 복수 디자인 태그는 별도 정책에서 보존한다.

`specs`는 센서 형식·유효화소·크기, 무게·무게 기준·바디 단독 무게, 치수, IBIS, AF, 영상, 배터리, EVF/LCD, 연사/셔터, 카드, 방진방적, 내장 렌즈 등을 담는다. 미수집 필드는 null이다. 렌즈는 실제 초점거리(mm), 최대조리개, 무게(g), 보정 여부, 필터(mm), 최소 촬영거리(m)를 담는다. 몸체 치수는 mm이며 전체 장착 시스템 부피가 아니다.

`weight`는 주로 배터리/카드를 포함한 촬영 가능한 상태다. `weightBasis`를 반드시 함께 해석한다. Sigma BF는 배터리/내장 저장장치, Q3는 배터리 포함이며 카드 포함 여부는 공식 문구에 없다. SL3의 공식 bare-body 769.7g은 `bodyOnlyWeight`에만 보관하고 촬영 상태 무게는 null이다. Q3는 공식 문서 간 치수 차이가 있어 현재 null로 보류했다. R50 375g은 검정 모델 기준이다.

고정렌즈는 mount=null이며 `specs.fixedLens`로 광학 사양을 가진다. `getIntegratedLens()`가 만드는 객체는 독립 매매 자산이 아니다. KEEP/SELL/BUY와 교환렌즈 수에서 제외하고, 조합 무게·가격은 카메라에 한 번만 포함한다. 내장 렌즈 단독 무게와 가격을 0으로 만들어 저장하지 않는다. 제조사가 명시한 환산 초점거리가 있으면 일반 센서 배율보다 우선한다.

## 후보 풀

기변의 공통 바디 카탈로그는 **7 → 37(+30)**, 교환렌즈는 **11 → 36(+25)**다. 바디 30개 중 9개는 다른 화면에 존재하던 모델의 통합이며, 저장소 전체 기준 신규 모델은 **21개**다. 추가 구매는 14 → 37, 첫 구매는 기존 구성 5개를 유지한다.

| 시스템 | 바디 | 교환렌즈 |
| --- | ---: | ---: |
| Sony E | 6 | 6 |
| Canon RF | 6 | 6 |
| Nikon Z | 4 | 6 |
| Fujifilm X | 5 | 6 |
| L-Mount (Panasonic 2 / Leica 1 / Sigma 1) | 4 | 6 |
| MFT (Panasonic 3 / OM System 2) | 5 | 6 |
| 고정렌즈 (Sony 1 / Fuji 1 / Ricoh 2 / Leica 1) | 5 | 내장 렌즈 |
| Canon EF / Nikon F | 각 1 | 0 |
| 합계 | 37 | 36 |

브랜드별 바디: Sony 7, Canon 7, Nikon 5, Fujifilm 6, Panasonic 5, Ricoh 2, Leica 2, OM System 2, Sigma 1.

각 주요 교환 마운트에 표준줌/경량줌/표준 단렌즈/인물 단렌즈/광각/망원 후보를 배치했다. L-Mount는 Panasonic 렌즈를 Leica/Sigma에서도 호환 마운트 기준으로 사용한다. 어댑터, 펌웨어별 기능 제약, AF 성능 호환은 검증하지 않는다. EF/F 바디는 기존 추가 구매 자료를 보존한 것이며 신규 렌즈 풀은 없다. 따라서 기본 카탈로그에서 다른 시스템으로부터 진입하는 새 기변 구성은 35개 바디까지 생성 가능하고, DSLR 2개는 현재 장비/직접 등록 렌즈 또는 추가 구매 비교에 사용한다.

## 출처와 검증 상태

제조사 사양표·매뉴얼·공식 제품 페이지를 우선한다. `sources[]`에는 url/type/accessedOn/fields/note를 저장한다. accessedOn은 사양 확인일이며 출시일·가격 기준일이 아니다. 현재 37개 바디와 26개 렌즈에 적어도 하나의 공식 출처가 있다. **출처가 있는 제품도 모든 필드가 검증됐다는 의미는 아니다.** 기존 10개 렌즈는 공식 재검증 전 자료를 유지한다. RF 24-50은 기존 렌즈 중 손떨림보정만 공식 재확인했다.

`sources.fields`의 경로(예: specs.sensor.megapixels)가 확인 범위를 나타낸다. `legacyFields`는 specs 아래의 아직 재검증하지 않은 기존 값을 leaf 경로로 기록한다. source의 상위 객체 경로는 그 객체의 등록된 값에 적용하되 null은 계속 UNKNOWN이다. 둘 중 어디에도 검증 근거가 없는 신규 사실을 입력하지 않는다. 식별/외형 분류는 제품 페이지 및 모델 식별 기준이고 체감 평가가 아니다. 출처에 모순이 있으면 불명확한 필드를 보류한다.

기존 AF/영상/배터리 값과 시연 가격 일부는 아직 legacy-unverified다. 호환성을 위해 유지했으나 공식 검증 완료로 재표시하지 않았다. 예전 시연 역할/점수/주관적 소개 문구도 분리만 했으며 검증된 경험 데이터로 승격하지 않았다. 신규 제품에는 이런 점수를 만들지 않았고 role/useTags=null로 전달한다.

## 가격

```json
{
  "new": { "value": null, "currency": "KRW", "asOf": null, "sourceType": "unknown", "sourceUrl": null },
  "used": { "low": null, "typical": null, "high": null, "currency": "KRW", "asOf": null, "sourceType": "unknown", "sourceUrl": null }
}
```

canonical은 원, 기존 엔진의 `newPrice/usedPrice`는 만원이다. 어댑터 한 곳에서 변환하며 다른 통화는 임의 환산하지 않는다. 기존 가격은 legacy-unverified, 날짜는 null이다. **새 바디 21개와 새 렌즈 25개의 가격은 모두 null**이고, 전 제품의 중고 범위·기준일은 미확인이다. 해외 정가를 한국 시세로 환산하거나 신품가로 중고가를 추정하지 않았다. 현재 가격 조건 UX는 구조화 가격의 대표값을 사용하며, 향후 범위를 채우면 표시 문구도 함께 갱신해야 한다.

판매/구매 항목의 가격이 빠지면 정확한 추가금은 null이다. 첫 구매는 알려진 구성 총비용만 예산 판정에 사용한다. 추가 구매도 null만원/무료 구매/즉시 구매 가능으로 표시하지 않는다.

## 엔진 변경 범위

점수 가중치, 목표/보존 조건, 브랜드 제한, 다양성 선택 규칙은 유지했다. 데이터 확장에 필요한 변경만 수행했다.

- 내장 렌즈 후보·매매/무게/개수 처리와 고정렌즈 전환 설명. mount=null인 서로 다른 고정렌즈 카메라도 전환 비용 정책상 시스템 전환이다.
- 신규 roles=null은 역할 미확인으로 다루며 쓸모없다고 단정해 기존 렌즈를 처분하지 않는다.
- 기존 센서 순서에 1인치 항목을 추가. 센서/화소가 엇갈리는 경우 UNKNOWN 규칙 유지.
- 공식 환산 화각이 있는 고정렌즈 지원.
- 첫 구매 가격 비교에서 null의 숫자 강제변환 제거 및 보유 렌즈 비용 반영.

데이터·후보가 늘고 Z6 III 무게가 정정돼 순위가 달라질 수 있다. 모든 이전 결과가 문자 그대로 같다는 보장은 하지 않는다. 기존 27개 회귀 테스트의 판단 원칙은 통과했다. 소유권 테스트는 새 내장 렌즈를 독립 자산에서 제외하도록 도메인 표현만 조정했고, 중복/집합 검증은 유지했다.

## 검증과 남은 데이터 작업

- `pnpm test`: 38개 통과. 기존 회귀 27 + DB/연결/UNKNOWN/고정렌즈 검증 11.
- `pnpm build`: 성공. `git diff --check`: 통과.
- 브라우저: 첫 구매(Canon RF50 보유 → R8 조합 621g/미등록 적합도), Sigma BF 기변(신규 L 렌즈/타 브랜드/가격 미확인), GR IIIx 기변(내장 렌즈/262g/한 번만 판매), 미등록 바디+렌즈(UNKNOWN/현상 유지), 추가 구매(Sigma/Ricoh 비교, 가격 미확인/자금 계획 계산 불가)를 확인했다.
- 경험 점수, 실시간 가격, 추가 구매의 실제 역할 중복 분석, 첫 구매 후보 자동 확대는 이번 범위에 포함되지 않는다.
- 출시일, EVF/LCD/연사/셔터/카드/방진방적, 다수 AF·영상·배터리·IBIS·센서 크기, 일부 렌즈 필터/최소 거리/보정 여부는 null이다. 이번 1차 데이터셋은 정체성/마운트/센서·화소/무게/렌즈 기본 광학 사양을 중심으로 확장했다.
- Experience DB 전에 기존 미검증 사양 재검증, 국내 가격 표본·기준일 확보, 상세 사양의 조건/펌웨어/측정 기준 통일이 필요하다. 신규 역할/미디어 점수가 없어 기존 시연 점수 보유 모델과 증거량 차이도 남는다. 이를 임의 점수로 메우지 않았다.
- 추가 구매의 용도/작은 바디 필터는 해당 분류 미등록 모델을 제외하며 화면에 안내한다. 새 모델의 용도 태그는 자동 추정하지 않는다.

## 후속 UI 작업 경계

`src/styles.css`, `src/CameraBodyPicker.jsx`, `src/CameraDesignPicker.jsx`, `src/CameraUpgradeSystemDiagnosis.jsx`, 루트 JSX의 레이아웃·접근성·표현을 다룰 수 있다. 입력값, 제품 ID, 단위, 미확인 상태와 엔진 호출을 보존한다.

UI 작업에서 수정하지 말아야 할 대상은 `src/data/*`, `cameraCatalog.js`, `cameraCatalogViews.js`, `cameraData.js`, `cameraDesign.js`, `cameraComparisons.js`, `cameraScenarioEngine.js`, `firstPurchaseEngine.js`다. 특히 후보 생성, `buildEquipmentTransition`, `evaluateScenario`, `selectDiverseTopScenarios`, `rankFirstPurchaseSystems`, 가격 변환, 내장 렌즈 및 UNKNOWN 처리, 회귀 테스트를 UI에 맞추려고 바꾸지 않는다.

## 변경 파일 / Git 상태

이번 Objective DB 작업의 새 파일: `src/data/cameraProducts.json`, `src/data/cameraLegacyPolicy.json`, `src/cameraCatalog.js`, `src/cameraCatalogViews.js`, `tests/cameraCatalog.test.js`, `docs/OBJECTIVE_DB.md`, `docs/OBJECTIVE_DB_PROGRESS.md`.

수정 파일: `src/cameraData.js`, `src/firstPurchaseEngine.js`, `src/cameraScenarioEngine.js`, `src/cameraComparisons.js`, `src/CameraBodyPicker.jsx`, `src/CameraUpgradeSystemDiagnosis.jsx`, `장비병자_카테고리선택.jsx`, `tests/cameraScenarioEngine.test.js`, `docs/CAMERA_MVP_V02_HANDOFF.md`.

작업 시작 전부터 남아 있던 UI/디자인 변경을 보존했다. 특히 `src/CameraDesignPicker.jsx`(신규), `src/cameraDesign.js`, `src/styles.css`, `tests/firstPurchaseEngine.test.js`와 일부 겹치는 JSX/엔진 변경은 이전 작업의 내용이다. 최종 워킹트리에는 수정 파일 12개, 새 파일 8개가 있고 커밋/푸시하지 않았다. 개수에는 이전 작업도 포함된다.
