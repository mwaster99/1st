# 카메라 MVP v0.2 인수인계

현재 코드를 기준으로 다음 UI 작업의 경계를 정리한 문서입니다. 기존 `PRODUCT_CONTEXT.md`에는 과거 카테고리 구조와 작업 맥락이 남아 있으므로 현재 구현의 최종 기준으로 사용하지 않습니다.

## 현재 범위

장비병자는 현재 시스템에서 무엇을 유지·판매·구매할지 판단하는 로컬 규칙 기반 MVP입니다. 외부 AI API나 시세 API를 호출하지 않습니다. 카메라 첫 구매와 기변이 활성화되어 있고, 추가 구매는 기존 필터·비교 화면, 장비 구성 점검은 비활성 상태입니다.

첫 구매는 기존 구성 5개를 평가합니다. 이번 변경으로 디자인 선호, 사진·영상 비율, 렌즈 확장 의향을 반영하며 보유 렌즈로 바뀐 구성의 설명을 다시 계산합니다. 여러 렌즈로 이루어진 첫 구매 구성을 생성하는 엔진은 아닙니다.

## 파일과 처리 순서

| 파일 | 책임 |
| --- | --- |
| `src/cameraData.js` | 기변용 바디·렌즈 데이터, 검색, 미등록 장비 생성 |
| `src/cameraDesign.js` | 공통 디자인 선택값과 선호 일치 평가 |
| `src/cameraComparisons.js` | 사양·렌즈·역할·사진영상 비교와 unknown 판정 |
| `src/cameraScenarioEngine.js` | 기변 후보 생성, 장비 전환, 평가, 다양성 선택, 설명 |
| `src/firstPurchaseEngine.js` | 기존 첫 구매 구성과 `rankFirstPurchaseSystems()` |
| `src/CameraUpgradeSystemDiagnosis.jsx` | 기변 질문과 결과 표시 |
| `src/CameraBodyPicker.jsx` | 현재 바디 탐색·직접 입력 |
| `장비병자_카테고리선택.jsx` | 홈·첫 구매 질문/결과·추가 구매 필터·기존 비활성 기능 |

기변의 공개 진입점은 `generateUpgradeScenarios(input, catalog)`입니다.

1. `analyzeUserIntent()`가 목표, 보존 조건, 휴대성 불편, 브랜드·렌즈 의향을 해석합니다.
2. `generateBodyCandidates()`와 `generateLensCandidates()`가 카탈로그와 호환 마운트에서 후보를 만듭니다. 이 단계에서 디자인 점수로 제외하거나 특정 제품을 우대하지 않습니다.
3. `generateScenarioCandidates()`가 바디 유지·렌즈 변경, 동일 마운트 바디/시스템 변경, 타 마운트 전환, 현상 유지안을 만듭니다. `buildEquipmentTransition()`이 CURRENT → KEEP / SELL / BUY → TARGET을 구성합니다.
4. `evaluateScenario()`가 실제 변화, 비용, 목표 해결, 보존 조건, 용도, 취향을 평가합니다. 사양 비교는 `cameraComparisons.js`가 담당합니다.
5. `selectDiverseTopScenarios()`가 근거와 품질 기준을 충족한 서로 다른 전략을 최대 4개 선택합니다. `buildScenarioExplanation()`은 사용자 목표부터 설명합니다.

## 유지해야 할 판단 원칙

- **현재 시스템 유지는 항상 생성되는 정상 선택지**입니다. 이점이 작거나 확인되지 않은 변경은 단순 취향만으로 구매 결론을 얻지 않습니다.
- 브랜드 변경을 허용하면 사용 가능한 타 브랜드 구성을 실제 후보로 생성합니다. 같은 마운트만 우선하지 않으며, 다양성을 위해 목표 개선 근거가 없는 후보를 억지로 넣지 않습니다.
- `현재 브랜드만`은 브랜드 제한입니다. 브랜드와 마운트를 같은 뜻으로 처리하지 않습니다.
- 렌즈 무게 불만은 바디만 가벼워졌다고 해결되지 않습니다. 대표 조합의 변화와 사용자가 지목한 원인을 함께 봅니다.
- 하나의 장비 ID가 KEEP / SELL / BUY에 중복되면 안 됩니다. 보유한 렌즈를 다시 구매하거나 목표 렌즈 목록에 중복 추가하지 않습니다.
- 보유한 가벼운 렌즈를 대표 렌즈로 바꾸면서 기존 줌도 KEEP하는 무매매 안을 생성합니다. 기존 줌이 남아 있으면 대표 휴대 조합의 화각 제한을 보유 시스템 전체의 손실로 감점하지 않습니다.
- 미등록 장비 ID는 `unknown-body-`와 `unknown-lens-`로 구분합니다. 바디와 렌즈 이름이 같아도 서로 다른 자산입니다.
- `wanted`는 개선 목표, `preserve`는 보존 조건입니다. 확인된 보존 조건 하락은 강하게 감점하지만 unknown을 하락으로 추정하지 않습니다.
- 순위 점수는 MVP 판단 규칙이며 만족도·실측 성능 향상률이 아닙니다. 같은 개선을 여러 이름으로 중복 가산하지 않습니다.
- 일부 목표·보존 조건만 확인된 경우 상세 점수의 `확인 n/m`과 데이터 부족 안내를 함께 표시합니다. 사진영상 데이터가 없어도 별도로 확인된 촬영 역할 손실을 평가에서 누락하지 않습니다.
- 디자인은 외형 취향입니다. 현재 보너스 상한은 기변 **3점**, 첫 구매 **1점**이고 `any`는 순위에 영향이 없습니다. 디자인은 성능·목표 근거가 되거나 예산·브랜드 제한을 우회하지 않습니다.
- 세부 가중치와 품질 구간은 조정 가능한 엔진 정책입니다. UI 후속 작업에서 임의로 바꾸지 않으며, 변경 시 시나리오 테스트와 함께 검토합니다.

## 입력·출력 계약

기변 입력에는 `currentBody`, `currentLenses`, `primaryLens`, `pains`, `portabilityDetails`, `preserve`, `subjects`, `ratio`, `lensIntent`, `brandIntent`, `designPreference`, `extraBudget`가 들어갑니다. 대표 렌즈는 보유 렌즈 목록에 포함되어야 합니다.

현재 질문의 한국어 선택 문자열도 엔진 계약입니다. 예를 들어 `현재 브랜드만`, `가능하면 전부 유지`, `렌즈 무게`, `사진 80% / 영상 20%`를 표시 문구처럼 직접 변경하면 매핑이 끊길 수 있습니다. `CameraUpgradeSystemDiagnosis.jsx`의 옵션 상수와 엔진의 `REASON_CAPABILITY`, `PRESERVE_CAPABILITY`, `RATIO_WEIGHTS`를 함께 확인합니다. 첫 구매 질문값도 `rankFirstPurchaseSystems()`에서 직접 사용합니다.

디자인은 공통 `DESIGN_OPTIONS`의 `any`, `slr`, `rangefinder`, `classic`, `minimal`을 저장합니다. 표시 라벨을 바꾸더라도 이 값을 유지합니다. 바디는 복수 `designTags`를 가질 수 있고 미등록 바디의 태그는 `null`입니다.

변화 상태의 실제 값은 `improved`, `maintained`, `degraded`, `unknown`입니다. 결과의 `cost`, `weight`, `capability`, `coverage`, `changes`, `scores`와 KEEP / SELL / BUY를 그대로 표시하고, 화면에서 점수를 재계산하지 않습니다. `null`을 0, 유지, 개선으로 치환하지 않습니다.

## 데이터 한계

- 현재 기변 DB는 바디 7개·렌즈 11개인 시연 데이터입니다. 브랜드별 후보 수와 사양 충족도가 다르며 가격 출처·시세 자동 갱신은 없습니다.
- 휴대 무게는 **바디 + 대표 렌즈 1개**입니다. 보유 렌즈 수와 역할은 별도 계산하며, 전체 가방 무게라고 표시하면 안 됩니다.
- 바디 크기가 있는 경우 바디 부피만 비교합니다. 렌즈 치수·장착 길이가 없어 전체 조합 부피는 unknown입니다.
- AF는 확인된 인식 기능, 영상은 등록된 기록 사양을 비교합니다. 누락이나 엇갈린 장단점을 종합적인 성능 향상으로 단정하지 않습니다. 렌즈 화각은 센서 형식을 고려한 35mm 환산값입니다.
- DR·고감도·AF 속도/정확도·발열·롤링셔터·조작성·색감·내구성·실제 렌즈 생태계 범위는 충분한 근거가 없습니다. `capabilities.lowLight`, `versatility`, `lensEcosystem`은 확장용 `null` 필드이며 점수를 임의로 채우지 않았습니다.
- 미등록 장비의 무게·가격은 `null`입니다. 판매 또는 구매 항목에 가격 미확인이 있으면 정확한 추가금도 `null`이며 확인된 부분 합계와 구분합니다.
- 첫 구매의 X-S20/R8 바디 무게는 미등록입니다. 해당 보유 렌즈 대체 구성에 기존 경량 설명을 재사용하지 않습니다.

## 다음 UI 작업에서 변경 가능한 영역

- `장비병자_카테고리선택.jsx`, `CameraUpgradeSystemDiagnosis.jsx`, `CameraBodyPicker.jsx`의 스타일, 레이아웃, 정보 배치, 반응형 표현, 접근성.
- 결과 정보의 시각적 묶음과 강조, 설명 문구의 가독성. 의미·상태·단위·unknown 표시는 보존합니다.
- 별도 승인된 제품 이미지·주요 제원 표시. 엔진이 반환한 구성과 연결하고 없는 데이터는 만들지 않습니다.
- 질문의 보조 안내와 표시 라벨. 저장되는 선택값과 입력 검증, 엔진 호출은 보존합니다.

## UI 작업에서 변경하지 말아야 할 영역

- `cameraScenarioEngine.js`: `analyzeUserIntent`, 후보 생성 함수, `buildEquipmentTransition`, `evaluateScenario`, `selectDiverseTopScenarios`, `buildScenarioExplanation`, `generateUpgradeScenarios`, 점수 정책과 매핑.
- `cameraComparisons.js`: `compareCapability`, `compareLens`, `scoreRoleCoverage`, `scorePhotoVideo`, 환산·무게·unknown 처리.
- `firstPurchaseEngine.js`: `FIRST_PURCHASE_SYSTEMS`, `rankFirstPurchaseSystems`와 구성 계산.
- `cameraDesign.js`: 디자인 키와 `scoreDesignPreference`; `cameraData.js`: 장비 ID·마운트·사양·가격·unknown 생성 함수.
- `tests/*.test.js`: UI 변경을 통과시키기 위해 추천 품질·소유권·unknown 검증을 삭제하거나 완화하지 않습니다.

## 검증

```bash
node --test tests/*.test.js
# 같은 테스트의 패키지 명령
pnpm test
pnpm build
```

테스트는 A~F(타 브랜드 후보, 현재 브랜드 제한, AF 목표, 디자인 선호, unknown 렌즈, 현상 유지 우위), 소유권 중복 방지, 보존 조건, 화각 환산, 첫 구매 렌즈 대체 등을 다룹니다. UI 작업 뒤에는 명령 검증에 더해 질문 → 결과를 브라우저에서 확인합니다. 빌드 성공만으로 추천 의미나 화면 동작이 검증되지는 않습니다.

v0.2 검증 기록: Node 테스트 26개 통과. 첫 구매·기변의 질문부터 결과까지 브라우저 확인, 보존 조건 선택 해제와 음수 예산 차단 확인. Sony A7 IV + FE 24–70mm F2.8 GM II에서 렌즈 무게·전체 부피 불만, 브랜드 자유, 렌즈 교체 허용 조건을 입력하면 Sony 조정안과 Fujifilm 전환안, 현재 유지안을 함께 표시합니다. 전체 부피는 여전히 데이터 부족으로 표시합니다.
