# Fujifilm Korea 현행 카메라 Objective DB coverage audit — 2026-10-06

## 판정과 감사 범위

**Fujifilm Korea X/GFX 일반 released/current 기본 모델의 Objective DB 제품 coverage는 1차 완료로 판정한다.** 기본 모델 14개가 canonical과 production provenance를 갖추었고 미처리·중복/모호 매핑·critical은 모두 0이다. 사양 전체, 한정판의 기능 전체, 렌즈, 가격, 추천·비교 엔진까지 완성했다는 의미는 아니다.

시작 working tree는 clean, baseline commit `44d6034`였다. 기존 [inventory](../src/data/ingestion/fujifilm-current-camera-gallery-2026-10-02.json), production 001~003의 완료 보고서와 모든 artifact, 진행 문서, canonical, identity-map, catalog-scope, field contracts/rules/vocab, Sony/Canon/Nikon coverage audit 및 기존 Fujifilm 테스트를 대조했다. 새로운 제품·production batch·raw ingestion을 만들지 않았다.

공식 X/GFX gallery, 카드별 제품 페이지 17개, Instax gallery 등 공개 페이지 **19개**를 직접 다시 조회했다. 갤러리 조회 시각은 **2026-10-06T04:10:31.008Z**, 마지막 Instax 조회는 **2026-10-06T04:10:34.286Z**다. [이번 감사 snapshot](../src/data/ingestion/fujifilm-coverage-audit-2026-10-06.json)에 URL/실제 조회 timestamp/응답 HTML SHA-256/관찰 카드/출시 행/판정/개별 findings를 보관했다. HTML SHA는 당시 응답 식별용이며 전체 HTML 보관 또는 향후 사이트 변화 자동 감지를 의미하지 않는다. 과거 inventory의 초기 수치와 batch checkpoint, 과거 raw의 accessedAt은 그대로 보존했다.

## 공식 inventory와 coverage 수치

[한국 공식 카메라 목록](https://fujifilm-korea.co.kr/products/camera)의 제품 목록 영역은 **GFX 6 + X 11 = 실제 17개 카드**다. 상단 및 전체 필터의 “18” 표시는 실제 목록/시스템별 합계와 불일치한다. Featured X-T5 링크와 실제 카드를 중복 집계하지 않고 고유 제품 카드 URL을 기준으로 대조했다. 기존 17개와 URL/identity/availability/variant 상태가 일치하며 신규·제거·출시 상태 변경·variant 변경은 0개다. SOLD OUT은 미출시가 아니라 재고 상태다.

| 항목 | 수 |
| --- | ---: |
| A. X/GFX 공식 카드 | 17 |
| B. 기본 product identity | 15 |
| C. 일반 released/current 기본 모델 | 14 |
| D. production provenance 완료 기본 모델 | 14 |
| E. linked variant/limited 카드 | 2 |
| F. X/GFX deferred-special identity/카드 | 1 |
| G. 일반 released/current 미처리 | 0 |
| H. 중복/모호 identity | 0 |

17카드 = 일반 기본 14 + 변형 2 + IR deferred 1이다. 15identity = 일반 14 + IR 1이다. 별도 Instax 10카드는 이 분모 밖이며 X/GFX의 F를 11로 부풀리지 않는다. 일반 announced/upcoming은 0개다. Canonical 전체는 **111 bodies / 36 lenses / 147 total**, 이번 변경 0개다. 현행 카드에 없는 기존 X-E4는 삭제하지 않고 현행 분모에서만 제외한다.

| 공식 기본 모델 / canonical ID | batch | production source 수 | verified field 경로 수 |
| --- | --- | ---: | ---: |
| GFX100 II / `fujifilm-gfx100-ii` | 001 | 2 | 22 |
| GFX100S II / `fujifilm-gfx100s-ii` | 001 | 2 | 23 |
| GFX ETERNA 55 / `fujifilm-gfx-eterna-55` | 002 | 3 | 14 |
| GFX100RF / `fujifilm-gfx100rf` | 002 | 2 | 28 |
| X-H2S / `fujifilm-x-h2s` | 001 | 2 | 23 |
| X-H2 / `fujifilm-x-h2` | 001 | 2 | 22 |
| X-T5 / `fujifilm-x-t5` | 003 | 2 | 27 |
| X-T50 / `fujifilm-x-t50` | 003 | 3 | 27 |
| X-T30 III / `fujifilm-x-t30-iii` | 001 | 2 | 22 |
| X-E5 / `fujifilm-x-e5` | 002 | 2 | 23 |
| X-S20 / `fujifilm-x-s20` | 003 | 2 | 26 |
| X-M5 / `fujifilm-x-m5` | 003 | 2 | 23 |
| X half/X-HF1 / `fujifilm-x-half` | 002 | 2 | 20 |
| X100VI / `fujifilm-x100vi` | 003 | 2 | 31 |
| 합계 | 3 batches | 30 source 연결/raw | 331 |

Source 수는 제품별 artifact 수이며 서로 다른 웹사이트 수가 아니다. Batch 001~002의 identity-only gallery source도 실제 연결된 provenance에 포함하되 사양 필드 근거로 대신 사용하지 않는다. Batch 003은 기존 공식 source를 유지하므로 현재 canonical의 manufacturer source 수는 위 production source 수보다 제품별 1개 많다.

## Variant와 identity

[GFX100RF FRAGMENT EDITION](https://fujifilm-korea.co.kr/products/id/1357)은 **B: 기본 GFX100RF에 연결하는 외관·기능 variant**다. 공식 페이지는 외장/액세서리/모노크롬 외 사양이 기본 제품과 같다고 설명한다. FRGMT BW preset, 일부 모노크롬/필터 모드 제외, 시작 로고라는 기능 차이가 있어 단순 외관 edition이라고만 설명하지 않는다. 센서/렌즈/대표 무게 등 같은 objective imaging hardware를 중복 제품으로 생성하지 않으며, variant 전용 기능을 기본 모델에 합치거나 모든 기능이 동일하다고 주장하지 않는다. 향후 feature/variant 표현 후보로 남긴다.

[X100VI Limited Edition](https://fujifilm-korea.co.kr/products/id/1332)은 **C: 기본 X100VI의 판매·외관 edition**으로 유지한다. 90주년 로고/시리얼 각인, 전용 부속품 및 티타늄 셔터 버튼 외장 디테일을 보존한다. 기본 센서·렌즈·IBIS 등의 객관 사양에 독립 body identity가 필요한 차이는 확인되지 않았다. 응모 종료는 별도 출시예정 identity가 아니다. 페이지의 2019-02 출시 행은 2024년 90주년 설명과 모순되므로 수용하지 않았다.

두 카드는 각각 고유 cardKey/URL/variantKey를 유지하고 `coverageViaBaseBatch`로 002/003에 연결한다. Canonical alias로 FRAGMENT/Limited를 흡수하지 않았다. GFX100 II IR도 일반 GFX100 II의 alias가 아니며 별도 보류 identity다. 전체 canonical ID/alias 검증과 Fujifilm identity-map의 모델 코드/ID uniqueness가 통과했다. X-T30 III, X-T50, X-E5, X-M5, X half의 공식 표기와 reviewed map이 일치한다. 이전 세대·별도 모델을 합치거나 동일 기본 모델을 중복 생성한 사례는 없다.

## IR / Instax scope

[GFX100 II IR 공식 설명](https://fujifilm-korea.co.kr/products/id/1349)은 적외선/법의학/과학/문화재 복원·분석용 제품임을 밝힌다. 국내 기관·기업 및 해당 컨설턴트 등의 지정 용도와 구매자 계약이 필요하고, 파장 필터 선택이 사용 판단의 중심이다. 일반 가시광선 바디 구매 축에 그대로 넣기 어려워 **deferred-special-category**가 적절하다. 기존 [catalog-scope](../src/data/ingestion/catalog-scope.json)의 이유와 재검토 조건은 유효하다. 필터·구매 자격·분광 워크플로를 비교할 수 있게 되면 specialty 후보로 재검토하며 영구 제외하지 않는다. 전문 제품이라는 이유만으로 직접 운용 시네마 GFX ETERNA 55를 제외하지 않는다.

[한국 공식 Instax camera gallery](https://www.fujifilm.com/kr/ko/consumer/instax/cameras)는 기존과 같은 10개다. 아날로그 6개(mini 12/41/99, SQ1/SQ40, WIDE 400), 하이브리드 3개(mini Evo/LiPlay, WIDE Evo), 디지털 companion Pal 1개로 구분한다. [Pal 공식 페이지](https://www.fujifilm.com/kr/ko/consumer/instax/cameras/pal)는 본체가 디지털 카메라이며 자체 인쇄를 하지 않고 별도 프린터/하이브리드 장치로 인쇄한다는 점을 확인해 준다. Pal은 아날로그가 아니다. 필름 규격/소모품 비용/출력·휴대폰 연결을 비교하는 adjacent category가 필요하므로 **deferred-special-category**를 유지하고 scope registry에 이유·공식 source·재검토 조건을 명시했다. 출시 상태 전수 검증이나 현재 digital body DB와 동등한 분류를 주장하지 않는다. 실제 Instax ingestion은 하지 않았다.

## Provenance / findings

14개 모두 제조사 source와 reviewed identity-map이 있고, **366 verified claims**(112+85+169)가 archive에 연결된다. 알려진 specs 말단값 **365개** 중 **364개**는 상위 객체 evidence를 포함한 verified fieldEvidence로 설명되고, **1개**는 공식 참조만 있다. Legacy-only 및 근거 분류 없는 non-null 말단값은 0개다. Canonical fieldEvidence의 claimId/path/value/source 관계도 각각 staging/raw와 대조했다.

전용 canonical `identityEvidence` 객체는 신규 9개에 있다. Batch 003 기존 5개는 공식 모델/URL과 reviewed mapping 및 기존 identity 유지가 검증되었지만 update promotion 계약이 전용 객체를 생성하지 않는다. 따라서 **14개 모두 구조화된 identityEvidence 객체가 있다**고 말하면 틀린다. 실제 identity 확인과 metadata gap을 구분하여 5건을 should-fix로 기록한다. Canonical을 수동 보강하지 않는다.

아래 수는 **감사한 제품/경로별 항목 수**다. 전체 JSON null 전수 집계나 제품 수가 아니며 이전 브랜드와 조사 범위도 다르다. 모든 개별 항목과 이유는 감사 JSON의 findings에 있다. 공통 엔진/표현 backlog는 이 데이터 finding 합계 밖에서 따로 기록한다.

| 분류 | 수 | 내역 |
| --- | ---: | --- |
| critical | **0** | 일반 제품 누락/중복/모호 identity, source 부재, 근거 분류 없는 known 사양, 잘못된 mount/kind/센서/단위/무게 기준/IBIS, 깨진 artifact 없음 |
| should-fix | **14** | 기존 5개 identityEvidence 객체 누락 5건 + X100VI fixedLens.label의 구조화된 evidence 부재 1건 + 물리 cardSlots 미확정 8건 |
| acceptable UNKNOWN | **27** | GFX100 II dimensions 1 + ETERNA 운용 무게 1 + body IBIS 직접 근거 부족 5 + 내부 log 미검증 10 + ETERNA 내부 bit depth 1 + 영상 crop 3 + 기계 연사 3 + 전자 연사 2 + X-H2 출시월 충돌 1 |

CardSlots 보강 후보는 GFX100 II/GFX100S II/GFX100RF/X-H2S/X-H2/X-T30 III/X-E5/X half 8개다. 매체 목록으로 물리 슬롯 수를 추정하지 않았다. IBIS UNKNOWN은 ETERNA/GFX100RF/X-T30 III/X-M5/X half이며 디지털 보정만으로 IBIS 유무를 확정하지 않는다. Crop UNKNOWN은 ETERNA/X-M5/X half, 기계 연사 UNKNOWN은 ETERNA/X half/X100VI, 전자 연사 UNKNOWN은 ETERNA/X half다. AF 상세, 셔터, EVF/배터리 등 미수집 필드와 가격을 전부 findings로 센 것은 아니다. 가격은 별도 phase이며 누락 blocker가 아니다.

Batch 003은 신규 0/기존 5, identity/alias/가격 유지와 134 fieldEvidence 경로 보강을 확인했다. 유일한 canonical value conflict는 X-T5 `6.2K 30p`의 반올림 홍보 표기와 상세 29.97p이며 명시적 승인 이유와 claim source가 추적된다. Accepted source 간 진짜 값 충돌은 0개다. 상세 원문의 복사/오표기(X-T50 셔터·LCD·8K 문구, X100VI 3150/3510 행)는 기존 raw 검토 기록대로 분리되어 임의 최대값으로 승격되지 않았다.

## Fixed-lens / 센서·시스템

| 제품 | kind / mount | 실제 focal mm | 35mm 환산 mm | 조리개 | 전체 카메라 무게 |
| --- | --- | ---: | ---: | ---: | ---: |
| GFX100RF | fixed / null | 35–35 | 28–28 | F4–F4 | 735g |
| X half | fixed / null | 10.8–10.8 | 32–32 | F2.8–F2.8 | 240g |
| X100VI | fixed / null | 23–23 | 35–35 | F2–F2 | 521g |

12개 focal/equivalent min/max claim은 rawUnit/staging/diff unit 모두 mm다. 실제/환산은 서로 독립이며 GFX100RF의 환산값이 실제값보다 작다는 정상적인 라지포맷 특성을 역전 오류로 처리하지 않는다. 세 제품은 단렌즈이므로 min=max이고 digital teleconverter를 광학 줌으로 합치지 않았다. 별도 interchangeable lens product가 없고 `getIntegratedLens`는 카메라 포함 표현으로 weight/신품·중고 가격이 null이다. 기존 batch 003 실제 추천 시나리오의 X100VI 전체 무게 521g/BUY 카메라 1개/lensCount 0 회귀도 유지하여 이중 계산을 점검했다.

이번 세 batch archive는 **legacyFixedLensUnits 없이 strict default**로 재정규화·검증·승인 결과 재현을 통과했다. 과거 Sony/Nikon replay compatibility를 신규 Fujifilm production에 혼용하지 않았다. 메모리에서 세 fixed 제품의 단위를 지우면 approval 이전 `UNIT_REQUIRED`로 차단된다. 원본 artifact는 그대로다.

GFX 교환식은 Fujifilm G, X 교환식은 Fujifilm X, 세 fixed는 mount null이다. GFX 센서는 **GFX (라지포맷), 43.8×32.9mm**이며 모두 공식 claim evidence를 갖는다. X APS-C 및 X half의 1인치/13.3×8.8mm를 같은 default로 바꾸지 않았다. Film simulation/필름풍 UX/합성 픽셀시프트는 objective performance field로 승격되지 않았다. Film simulation은 future feature/Experience 후보이며 이번 완료 조건에서 제외한다.

## 별도 추천·비교 및 cross-brand backlog

이 항목은 제품 ingestion coverage와 분리한다. 엔진/UI/schema를 이번에 수정하지 않았다.

1. [cameraComparisons.js](../src/cameraComparisons.js)의 SENSOR_RANK에 GFX (라지포맷)이 없어 `compareCapability('imageQuality')`가 비교 불가로 처리한다. CROP_FACTOR에도 GFX가 없어 명시적 cropFactor/환산값 없는 교환식 조합은 환산 화각 null이다. 풀프레임으로 잘못 추정하지는 않는다. 고정렌즈의 명시적 환산값은 우선한다. 현재 G마운트 lens pool 0개도 별도 렌즈/추천 coverage 과제다.
2. Raw/staging의 crop·셔터 방식·센서 영역·native/cropped burst·고속 모드·internal/external RAW·ProRes 매체·pixel shift·펌웨어 조건은 canonical 단일 `video.max`/burst 값을 소비하는 경로에서 자동 적용되지 않는다. GFX100 II/S II의 35mm mode 전자 연사, X의 cropped 최고 연사, ETERNA의 내부 8K/외부 12bit RAW/4K open gate48p, SSD ProRes 조건 등을 일반 무조건 최대 성능으로 읽으면 안 된다. Firmware는 claim에 실제 근거가 있을 때만 적용하며 모든 제품의 firmware 제약을 이번에 완성했다는 뜻은 아니다. Sony/Canon/Nikon의 같은 표현 한계와 묶어 후속 검토한다.
3. 추가로 현행 영상 비교의 fps parser `/(\d+)p/i`는 `29.97p`를 **97p**로 읽는다. 읽기 전용 재현에서 같은 4K/10bit/crop 상태의 30p→29.97p가 `improved`로 나왔다. 데이터에 저장된 29.97p는 정확하며 비교 소비 경로의 별도 버그다. 조건 모델 개선과 별개로 작은 엔진 후속 수정/회귀 작업이 필요하다. 이번 audit의 critical 0은 Objective 제품/provenance 범위 판정이며 추천 엔진에 결함이 없다는 선언이 아니다.

## Production artifact 연쇄

Batch 001~003의 manifest/raw/staging/diff/현재·보관 approval/transaction before·after·evidence·journal을 전부 대조했다. Item 14개 모두 canonicalized, source/content/staging/diff/evidence digest, incoming artifact byte SHA, 승인 ID와 baseline/expected SHA가 맞는다. Missing artifact/digest mismatch/중복 item은 **0건**이다. 기존 registry의 identity-map은 승인 당시 sealed 객체의 bytes로 검증했고, vocab은 당시와 같은 원본 compact bytes 및 sealed 객체를 검증했다. Vocab을 다른 pretty-print 방식으로 다시 직렬화한 hash를 원본 byte digest라고 오인하지 않았다.

| batch | baseline canonical SHA-256 | expected/after SHA-256 |
| --- | --- | --- |
| 001 | `5af85cb2cd789d256ebda930ea6bec7fc1b16c924aa893fcce0242d17dadbb1b` | `fdde584efd7bae388ccf9dea73b0b1da3ec420bf9ff548a66233bc8644e02022` |
| 002 | `fdde584efd7bae388ccf9dea73b0b1da3ec420bf9ff548a66233bc8644e02022` | `0c21fdb4f109e4153db653b223e40dff3142001b5a41b623e874ba6c492ae46d` |
| 003 | `0c21fdb4f109e4153db653b223e40dff3142001b5a41b623e874ba6c492ae46d` | `f58511cd8bf98568f8e38f2b557be655b572e2c722f0903b34b208ae947ac310` |

001 baseline은 Nikon 004 expected와 같고 003 after는 감사 시점 현 canonical SHA와 같다. Archived bundle의 strict `verifyIncoming`과 `proposedCanonical`이 승인된 after를 재현하며 after에 다시 적용한 메모리 결과도 그대로다. Production apply를 재실행하거나 artifact 상태를 새로 쓰지 않았다.

## 검증 및 다음 단계

[coverage regression](../tests/fujifilmCoverageAudit.test.js) 8개를 추가했다. 실제 관찰 카드/분모·variant/deferred 연결, identity/alias, 14개 field provenance 및 metadata gap, 세 batch sealed chain, 세 fixed prime strict mm, sensor/mount/weight/IBIS/조건부 모드, IR/Instax scope·재검토 조건, finding 집계를 확인한다. 기존 테스트는 약화하지 않았다. Snapshot 테스트는 공식 사이트의 미래 변화를 자동 확인하지 않으므로 다음 audit에서 다시 조회해야 한다.

최종 검증 결과:

- `pnpm test`: **187/187**.
- `node --test tests/objective*.test.js tests/*Production*.test.js tests/*CoverageAudit.test.js`: **147/147**.
- `node --test tests/fujifilm*.test.js`: **26/26**(신규 coverage 8 + 기존 production 18).
- `validateCanonical(current, vocab)`: **true**, 111 bodies / 36 lenses / 147 total.
- `pnpm build`: 성공. 기존 500kB 초과 chunk 경고만 있으며 JS 685.07kB다.
- Objective scripts 6개 및 신규 test 1개, 총 **7개 `node --check` 통과**.
- `git diff --check` 및 신규 파일 whitespace 검사 통과.
- Canonical SHA는 `f58511cd8bf98568f8e38f2b557be655b572e2c722f0903b34b208ae947ac310`로 batch 003 이후 불변이다.

변경 파일은 감사 문서·진행 문서·감사 snapshot·coverage test·catalog-scope의 Instax 재검토 entry 등 5개다. Canonical/추천 엔진/UI/field contract/기존 inventory/기존 production artifact는 변경하지 않았다. Cheap-worker 신규 호출은 없다. Git 변경은 검토를 위해 워킹트리에 남겨두며 commit/push는 수행하지 않았다. 다음 브랜드는 [v0.4 계획](OBJECTIVE_DB_V04_PLAN.md)의 **B5 Panasonic / OM System**이며, Panasonic 공식 inventory부터 다음 별도 세션에서 시작할 수 있다. Fujifilm의 should-fix와 엔진/표현 backlog는 별도 후속 과제로 유지한다.
