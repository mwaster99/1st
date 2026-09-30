# Canon Korea 현행 카메라 Objective DB coverage audit — 2026-09-30

## 판정과 공식 범위

Canon Korea 공식 [렌즈교환카메라 목록](https://kr.canon/product/category/141)의 미러리스 15개·DSLR 2개, [컴팩트 카메라 목록](https://kr.canon/product/category/183)의 PowerShot 4개·IXUS 1개, [영상/방송 기기 목록](https://kr.canon/product/category/268)의 직접 운용 Cinema EOS 카메라 7개를 다시 대조했다. 새로 나타나거나 사라진 **직접 운용 카메라 카드가 없으므로** 2026-09-29 [inventory snapshot](../src/data/ingestion/canon-current-camera-gallery-2026-09-29.json)의 29개 모델/제품 URL을 교체하지 않았다. 공식 목록은 판매 가능 재고나 단종 여부 전체를 보증하지 않으며, 이 감사의 `released/current`는 **현재 Canon Korea 공식 목록에 올라 있고 공식 출시월이 지난 카드**라는 운영 정의다. 제품별 물리적 재고를 단정하지 않는다.

| 구분 | 카드 수 | 감사 결과 |
| --- | ---: | --- |
| 직접 운용 카메라 | 29 | 미러리스 15, DSLR 2, 컴팩트 5, Cinema EOS 7 |
| `canonicalized-released` | 28 | 공식 출시월이 지난 카드 28개 모두 canonical 바디와 1:1 |
| `announced-upcoming` | 1 | EOS R8 Mark II, Canon Korea [제품 페이지](https://kr.canon/product/content/detail/233585E59CCB3F659615A07386CE5498)의 출시월 2026-10 |
| `unprocessed released/current` | 0 | 없음 |
| 중복/모호한 직접 운용 매핑 | 0 | 한 공식 카드↔한 canonical ID |
| 별도 `deferred-special-category` | 17 | Canon의 PTZ 리모트 **분류 카드 수**. 직접 운용 카메라 29개에는 포함하지 않음 |

Canon [영상/방송 기기 목록](https://kr.canon/product/category/268)의 PTZ 리모트 카메라 분류는 17개 카드를 표시한다. 화면에 나타나는 17개에는 CR-N/CR-X 카메라·영상회의 시스템 카드 11개 외에 RC-IP/RC-V 제어기 4개와 소프트웨어 2개도 들어 있다. 따라서 **17은 서로 다른 카메라 바디 17개라는 뜻이 아니다.** 영상회의 시스템과 일반 CR-N 카드에도 이름이 같은 모델이 있으므로 이 분류의 카드 수를 canonical 제품 identity 수로 승격하지 않았다. 원격 조작·설치·제어기·네트워크·전원·시스템 비용이 구매 판단의 핵심인 이 분류는 기존 [catalog scope 정책](../src/data/ingestion/catalog-scope.json)의 Sony FR7과 같은 이유로 snapshot의 `adjacentSpecialCategory.scopeStatus: deferred-special-category`로 추적한다. 영구 제외가 아니며, 전문 제품 또는 Cinema EOS라는 이름만으로 보류하지 않는다. 현재 Canon Cinema EOS 7개는 직접 운용 카메라로 모두 포함했다. 특수기종별 identity와 별도 추천 흐름 설계는 이번 감사 범위가 아니다.

**Canon Korea 현행 직접 운용 카메라의 Objective DB 제품 coverage는 1차 완료로 판정한다.** 이는 29개 공식 카드 중 출시 완료 28개가 모두 canonical에 존재하고, 출시 예정 1개와 보류 특수분류를 누락과 구별했다는 뜻이다. 모든 객관 필드·가격·렌즈 및 추천 경험의 완성을 뜻하지 않는다. 공식 목록이 바뀌면 새 snapshot 검토와 별도 production batch가 필요하다. EOS R8 Mark II는 감사 시점인 2026-09-30에 아직 표시 출시월 2026-10 전이므로 선제 승격하지 않는다.

## Identity와 상태

28개 출시 완료 카드의 `modelCode`는 해당 canonical 바디의 `model`과 일치하고, canonical ID가 서로 다르다. `validateCanonical`의 전체 ID/이름/alias 충돌 검사도 통과한다. EOS R8과 R8 Mark II, EOS R5와 R5 Mark II와 R5 C, EOS R6 Mark II와 Mark III와 R6 V, C300 MK III와 C500 MK2, PowerShot G7 X Mark III와 다른 PowerShot, IXUS 285 HS A와 과거 IXUS 285 HS를 합치지 않았다. 기존 Canon EOS 90D `canon-90d`는 현행 공식 카드 29개에는 없는 기존 canonical 항목이며 이번 현행 coverage 분모에 넣지 않는다.

Batch 001~005에서 추가한 22개는 [identity-map](../src/data/ingestion/identity-map.json)의 Canon 모델 코드와 1:1이고 production `identityEvidence`도 있다. 이전 canonical에 이미 있던 R5 Mark II·R8·R6 Mark II·R10·R7·R50의 6개는 공식 Canon source와 canonical `model`은 있으나 identity-map 항목과 구조화된 `identityEvidence`가 없다. 잘못 합쳐졌다는 증거는 없지만 별도 검증을 거쳐 metadata를 보강할 **should-fix**다. Canon canonical 바디 총 29개와 현행 출시 완료 28개의 차이 1개는 EOS 90D다.

## Provenance와 필드 완성도

출시 완료 28개 모두 manufacturer source가 최소 1개 있다. `specs`의 null이 아닌 말단값 **228개**를 세었고, `fieldEvidence` 또는 공식 `sources[].fields`가 해당 경로나 상위 객체를 가리키는 값 **227개**, `legacyFields`로만 분류된 값 **1개**(R6 Mark II의 `specs.sensor.format`)다. 어떤 근거 분류에도 속하지 않는 non-null 객관값은 **0개**다. 상위 source field가 하위 값을 지지하는 기존 정책으로 집계했으며 source 기록 자체와 동일한 수준의 현장 재검증을 뜻하지 않는다. 가격은 별도 phase라 이 228개에 넣지 않았다. 운영 무게 값이 있는 바디는 허용된 `specs.weightBasis`를 가지고, fixed/interchangeable 종류와 mount도 canonical validation을 통과했다. Batch claim의 영상·셔터별 연사·무게 조건도 보존되어 있다.

아래 건수는 **제품 수나 전체 JSON null 수가 아니라 서로 다른 감사 항목 수**다. Null을 일괄 채우기 위한 목록이 아니다.

| 등급 | 건수 | 근거와 조치 범위 |
| --- | ---: | --- |
| Critical | **0** | 출시 완료 제품 누락, 중복/모호 identity, 제조사 source 0개, 근거 분류 없는 non-null 객관값, 잘못된 kind/mount/유효 운영 무게 기준, 깨진 production artifact가 없음 |
| Should-fix | **52** | 위 6개 기존 바디의 identity-map 6건과 `identityEvidence` 6건; R6 Mark II의 legacy sensor format 1건; `specs.video.max` null 11건; 카드 슬롯 null 22건; 기존 바디 R5 Mark II·R8·R10·R7·R50의 바디만 무게 null 5건; C80의 과거 `specs.bodyOnlyWeight` claim에 `basis`가 쓰이고 표준 `weightBasis`가 빠진 metadata 1건. 각 필드는 제품별 공식 조건을 확인하는 별도 보강 batch가 필요함 |
| Acceptable UNKNOWN | **20** | 사진용 대표 화소를 영상 유효 화소에서 추정할 수 없는 Cinema EOS 6건; 구성에 따라 바뀌는 C80·C400·C70·C300 III·C500 II 운영 무게 5건; R50 V·G7 X III·IXUS 색상/변형 기준과 V10 측정 기준이 해결되지 않은 무게 4건; V10의 사진/영상별 환산 화각과 IXUS의 확인되지 않은 실제 초점거리 2건; C300 III·C500 II의 모드별 bit depth 2건; C80의 공식 자료 간 치수 기준 불일치 1건. 근거/기준이 정리될 때까지 null 유지 |

Should-fix의 null 수는 **공식 모델 사양에서 조사할 가치가 있는 필드 gap**이다. 값이나 측정 조건을 이번 감사에서 추측하지 않았고 source를 신규 claim으로 승격하지 않았다. R50 V의 영상처럼 출처별 조건이 달라 보이는 항목은 값만 고르지 않고 조건을 먼저 판정해야 한다. C80의 과거 claim metadata 표기는 현 canonical 바디 무게 값을 잘못 만들지 않았지만 표준화할 후속 후보로 남긴다. 모든 가격의 검증/승격은 별도 가격 phase다.

## 고정렌즈·표현 경계

PowerShot V1·V10·G7 X Mark III·SX740 HS 및 IXUS 285 HS A의 5개는 모두 `kind: fixed`, `mount: null`이며 `specs.fixedLens`로 내장 광학계를 표현한다. 별도 교환식 lens product는 없다. 내장 렌즈의 무게는 별도 값으로 더하지 않는다. V1·G7 X III·SX740의 실제/35mm 환산 초점거리는 서로 다른 필드이고, V10은 실제 6.6mm 고정 단렌즈다. V10의 사진/영상 환산 화각을 하나로 합치지 않았으며 IXUS는 환산 25–300mm만 기록하고 실제 초점거리를 추정하지 않았다.

Batch 004의 R5 C는 8K 60p에 외부 전원이 필요하고, batch 005의 C300/C500은 일반 내부 RAW와 S&Q/crop/RAW 등급 조건이 다르다. 이 조건은 staging claim의 `conditions`에 남지만 단일 canonical `specs.video.max`만 소비하는 화면·추천 경로에는 직접 드러나지 않는다. **이것은 product identity coverage 미완료가 아니라 후속 표현 개선 과제**다. 또한 현재 36개 렌즈 중 Canon EF 렌즈가 없어 EF DSLR·Cinema EOS 바디가 시스템 추천 후보에서 렌즈와 결합되지 않는다. **이는 렌즈/추천 coverage의 별도 과제**이며 이번 Canon 바디 coverage 완료 판정을 막지 않는다. 엔진·UI·schema는 이번에 수정하지 않았다.

## Production artifact와 검증

Canon batch 001~005의 **22개 item**은 모두 `canonicalized`다. 각 batch에서 manifest, raw, staging, diff, 현재·보관 approval, transaction `before`/`after`/`evidence`/`journal`의 존재와 source/staging/diff/evidence 및 baseline/expected digest를 확인했다. 001의 baseline은 Sony 008의 expected digest와 같고, Canon 각 batch의 expected digest가 다음 batch baseline이며, 005의 `after` SHA-256은 현 canonical과 같다. 원래 artifact를 재작성하지 않았다. 누락 파일·digest 불일치·연속성 단절·중복 item은 **0건**이다.

[Canon coverage 회귀 테스트](../tests/canonCoverageAudit.test.js)는 29개 카드의 상태와 고유 매핑, 출시 예정 카드 예외, 인접 PTZ 분류의 보류 상태, 고정렌즈 불변식, 001~005의 승인/근거/transaction 연쇄를 검사한다. 이 테스트는 저장된 snapshot과 artifact의 일관성을 보장하며 Canon 공식 사이트의 미래 변경을 자동 감지하지는 않는다. 후속 공식 목록 점검은 별도로 반복해야 한다.

검증은 전체 테스트 **129/129**, Objective·Canon production 및 coverage 테스트 **87/87**, canonical validation **바디 86·렌즈 36·전체 122개**, `pnpm build`, 신규 테스트 `node --check`, `git diff --check` 모두 통과했다. 빌드의 500kB 초과 chunk 경고는 기존과 같다. Canon 제품·가격·추천 엔진·UI·과거 production artifact는 변경하지 않았다.

다음 브랜드 production 후보는 [v0.4 계획](OBJECTIVE_DB_V04_PLAN.md)의 **B3 Nikon 현행 바디**다. Nikon 공식 현행 제품 inventory와 직접/특수 운용 범위를 먼저 확정한 뒤 작은 독립 batch로 진행한다. 위 should-fix 항목은 Canon 별도 보강 작업으로 유지한다.
