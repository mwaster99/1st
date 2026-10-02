# Nikon Korea 현행 카메라 Objective DB coverage audit — 2026-10-02

## 판정과 조회 범위

**Nikon Korea의 출시 완료 직접 운용 카메라 제품 coverage는 1차 완료로 판정한다.** 공식 카드 22개 중 released/current 21개가 canonical 바디와 각각 대응하고, Z5IIC 1개는 현재도 announced/upcoming이다. 출시 완료 미처리·중복/모호 매핑·critical은 모두 0건이다. 모든 객관 필드, 가격, 렌즈 또는 추천 경험이 완성됐다는 뜻은 아니다.

시작 working tree는 clean, baseline commit `da3d5d4`였다. [기존 inventory](../src/data/ingestion/nikon-current-camera-gallery-2026-10-01.json), batch 001~004, 진행 기록, canonical, identity-map, catalog-scope, Objective contracts, Sony/Canon coverage audit 및 Nikon regression을 대조했다. 2026-10-02 공식 페이지를 다시 조회했고 감사 기록 시각은 **2026-10-02T03:18:15Z**다. 이 시각은 감사 기록 시각이며 과거 raw의 accessedAt을 대신하거나 변경하지 않는다.

| 공식 목록 | 직접 운용 카드 수 | 모델 |
| --- | ---: | --- |
| [미러리스](https://www.nikc.nikon.com/product/mirrorless) | 15 | Z50, Z6, Z7, Z7II, Z6II, Z5, Z8, Z30, Z9, Zfc, Z6III, Z50II, Z5II, Zf, Z5IIC |
| [DSLR](https://www.nikc.nikon.com/product/dslr) | 3 | D850, D780, D7500 |
| [콤팩트](https://www.nikc.nikon.com/product/compact) | 3 | COOLPIX P1000, P950, P1100 |
| [Z Cinema](https://www.nikc.nikon.com/product/zcinema) | 1 | ZR |

제품명과 개별 제품 URL을 대조한 결과 새 카드·제거 카드·상태 변경은 **0개**다. 갤러리 상단의 같은 제품 배너/링크는 추가 카드로 세지 않았으며, 기존 snapshot을 덮어쓰지 않았다. Z Cinema 페이지의 RED 영역은 외부 `reddigitalcinema.com` 카탈로그 링크다. 이번 Nikon Korea 개별 카드 분모에 들어오는 RED 제품 카드는 없으며, 이를 Nikon 보류 카메라 수로 임의 환산하지 않는다. Nikon `deferred-special-category`는 **0개**다.

이 감사의 released/current는 **현재 Nikon Korea 공식 제품 목록에 남아 있는 출시 완료 제품**이라는 운영 범위다. 갤러리 노출은 물리적 재고, 모든 국가의 판매 여부 또는 공식 단종 상태 전부를 보증하지 않는다. 발표 제품은 별도 상태 근거를 적용한다.

| 지표 | 수 |
| --- | ---: |
| A 공식 직접 운용 카메라 | **22** |
| B released/current | **21** |
| C canonicalized released/current | **21** |
| D announced/upcoming | **1** |
| E deferred-special-category | **0** |
| F unprocessed released/current | **0** |
| G duplicate/ambiguous mapping | **0** |
| 상태 없는 공식 카드 | **0** |

`A = C + D + E = 22`, `B = C + F = 21`이다. upcoming의 내부 `status: unprocessed`는 출시 완료 미처리 F에 포함하지 않는다.

## Z5IIC: 월이 바뀌었다는 이유로 출시 완료 처리하지 않음

2026-09-28 [공식 보도자료](https://www.nikc.nikon.com/ad/press/view/1019)는 2026년 10월내 발매 예정이라고 설명한다. **2026-10-02 실시간 [Nikon 공식 E Shop 미러리스 목록](https://eshop.nikc.nikon.com/mirrorless)**에서도 `[발매 예정] Z5IIC SL Body`와 `[발매 예정] Z5IIC BK Body`가 표시된다. 따라서 감사 시점 판정은 **announced/upcoming 유지**다. 구입 링크나 가격 표기만으로 실제 출시됐다고 해석하지 않는다. 두 색상은 같은 Z5IIC 제품 identity의 판매 구성이며 별도 카메라 2개로 세지 않는다.

현재 canonical과 identity-map에 Z5IIC를 선제 승격하지 않았다. 이후 실제 출시 완료 근거가 나오면 새 inventory 검토에서 released/current 미처리 1개로 기록하고 별도 production batch를 수행한다. 이번 완료 판정은 감사 시점에 한정된다.

## Identity audit

21개 카드의 canonical ID가 고유하며, 공식 모델 코드와 canonical model은 공백 차이를 제외하면 일치한다. `Z6III`/`Z6 III`, `Z5II`/`Z5 II`, `Z50II`/`Z50 II`, `Zf`/`Z f`는 동일 세대의 표기 차이다. Z5/Z5II/Z5IIC, Z6/Z6II/Z6III, Z7/Z7II, Z50/Z50II는 서로 합치지 않았다. 제품 aliases가 다른 공식 카드 모델을 가리키는 사례, 동일 실제 제품의 중복 생성, identity-map의 중복 모델 코드/ID는 **0건**이다. 전체 canonical ID/alias validation도 통과한다. Nikon canonical 바디는 21개이며 이번 공식 released/current 분모 밖의 추가 Nikon 바디는 없다.

Batch 001~004 신규 **16개**는 모델 코드→canonical ID의 identity-map과 verified `identityEvidence`가 있다. 기존 **5개** Z6 III·D780·Z f·Z5 II·Z50 II는 공식 source와 고유 canonical model을 가지고 있지만 identity-map 항목 및 구조화된 `identityEvidence`가 없다. 공식 카드 매핑이 모호한 것은 아니며 metadata를 보강할 should-fix로 분리한다. 신규 모델을 옛 모델 alias로 숨기거나 기존 데이터를 이번 감사에서 verified로 재표시하지 않는다.

| 처리 구분 | 제품 수 | 제품 |
| --- | ---: | --- |
| 기존 canonical | 5 | Z6III, D780, Zf, Z5II, Z50II |
| Nikon batch 001 | 5 | Z8, Z30, ZR, D7500, P1100 |
| Nikon batch 002 | 5 | Z9, Zfc, Z7II, D850, P950 |
| Nikon batch 003 | 5 | Z50, Z6, Z7, Z6II, Z5 |
| Nikon batch 004 | 1 | P1000 |
| upcoming 제외 | 1 | Z5IIC |

## Provenance와 finding 집계

21개 모두 manufacturer source가 최소 1개 있다. 신규 16개는 제품별 공식 source **2개**(사양 source와 identity/current만 증명하는 gallery source)이며, 기존 5개는 각각 공식 source 1개다. identity-only source를 필드 사양의 근거로 대신 사용하지 않는다. 신규 16개에 verified field claim **173개**(49+55+56+13)가 있다.

null이 아닌 `specs` 말단값은 **222개**다. 배열은 하나의 leaf로 세며, 상위 객체 field 경로는 해당 객체의 알려진 하위 값에 적용한다. 분류 우선순위는 verified fieldEvidence → 공식 sources.fields 참조 → legacyFields → 근거 분류 없음이다. `legacyFields`는 specs 아래의 상대 경로이므로 `specs.`를 붙여 대조했다.

| non-null leaf 근거 | 수 | 의미 |
| --- | ---: | --- |
| verified fieldEvidence | **183** | 신규 production 제품; 객체 IBIS의 하위 leaf 때문에 claim 수 173과 다름 |
| 공식 sources.fields 참조만 존재 | **32** | 기존 5개; 출처 경로가 있으나 새 claim/verified metadata와 같은 수준으로 간주하지 않음 |
| legacy-unverified만 존재 | **7** | Z6 III의 sensor.format/megapixels/generation, dimensions, video.max/log 6개와 D780의 sensor.format 1개 |
| 어떤 근거 분류에도 없음 | **0** | 없음 |

운용 무게는 21개 모두 알려져 있고 기존 vocab의 `battery-and-card`다. 새 production weight claim은 conditions.weightBasis와 product.specs.weightBasis가 일치한다. 신규 본체만 무게 claim은 기존 body-only 정책을 사용하며, 과거 archived claim의 기존 호환 정책은 유지한다. IBIS는 기존 객체 contract 또는 null이며 boolean/malformed가 없다. 종류/마운트는 Nikon Z 교환식 15개(미러리스 출시 완료 14개+ZR), Nikon F DSLR 3개, mount=null fixed 3개다.

아래 수는 **서로 다른 감사 항목 수**이며 제품 수·전체 JSON null 수가 아니다. should-fix에서는 metadata/필드 단위로 세고, 공통 pipeline 단위 문제는 1건으로 센다. 이번에 조사하지 않은 모든 null을 문제로 나열하지 않는다. Sony/Canon 문서와 조사 항목 범위가 달라 단순 건수 비교는 적절하지 않다.

| 등급 | 건수 | 집계 기준 |
| --- | ---: | --- |
| Critical | **0** | 출시 완료 누락, 중복/모호 identity, manufacturer source 부재, 근거 분류 없는 non-null 사양, 잘못된 kind/mount/weightBasis/IBIS, 손상된 artifact 없음 |
| Should-fix | **75** | 기존 5개 identity-map 누락 5건 + identityEvidence 누락 5건 + 공식 참조만 있고 구조화된 verified claim 없는 leaf 32건 + legacy-only leaf 7건 + video.max null 4건 + cardSlots null 21건 + equivalentFocal 단위 정규화 경로 누락 1건 |
| Acceptable UNKNOWN | **20** | COOLPIX 3개의 본체만 무게/물리 sensor.sizeMm/body IBIS 각 3건(9); Z6/Z7/Z7II/Z6II/Z5의 IBIS stops 5건; Z50/Z6/Z7/Z6II/Z5의 셔터별 연사 대표값 미확정 5건; Z50의 직접 IBIS 근거 부족 1건 |

video.max 조사 후보 4개는 D780·Z f·Z5 II·Z50 II다. 카드 슬롯 21개는 별도 공식 사양 보강 대상이며 값을 이번에 추측하지 않았다. 공식 참조-only 32개와 legacy-only 7개는 서로 겹치지 않으며, 같은 제품의 identity metadata gap과 별도 항목이다. Price, AF/화면 등 다른 미수집 필드까지 전수 null 집계를 했다는 뜻은 아니다.

UNKNOWN을 부재(false/0)로 해석하지 않는다. COOLPIX의 1/2.3형 표현에서 물리 mm 센서크기를 추정하지 않으며, 전체 카메라 무게에서 내장 렌즈 무게를 빼 본체만 무게를 만들지 않는다. 렌즈 VR만으로 IBIS를 확정하지 않는다. 나머지 미확인 모드별 bit depth/crop 및 가격도 계속 null이며 가격은 별도 phase다.

## P1000 equivalentFocal unit: should-fix, 현재 값 오류는 아님

P1000 canonical 실제 초점거리는 **4.3–539mm**, 35mm 환산은 **24–3000mm**다. raw observation과 staging의 `rawUnit`은 모두 mm이며 공식 evidenceExcerpt, contentDigest, claimId, archive source 연결은 유지된다. 실제/환산 값을 뒤집거나 cm 값을 mm로 오인한 현재 데이터 오류는 없다.

다만 [rules.mjs](../scripts/objective/rules.mjs)의 `canonicalUnit()`이 `specs.fixedLens.equivalentFocal.*`에 mm를 반환하지 않아 staging 및 diff의 `unit`이 null이다. **검토 가독성만의 문제로 한정할 수 없다.** 향후 cm 등의 입력은 mm 변환 및 단위 관련 numeric 검증 경로를 우회할 수 있다. 따라서 pipeline **should-fix 1건**으로 기록하며, 새로운 non-mm 환산 초점거리 source를 처리하기 전에 단위 경로와 regression을 별도 작업에서 보강해야 한다. 현재 값·raw provenance 손상이나 coverage critical은 아니다.

이번에는 schema/rules와 과거 production artifact를 바꾸지 않았다. 새 coverage regression은 현재 세 COOLPIX의 raw mm 근거와 canonical actual/equivalent 값을 확인한다. `unit: null`을 바람직한 계약으로 고정하는 테스트는 추가하지 않았다.

## Fixed-lens와 lens VR/IBIS

| 모델 | actual mm | 35mm equivalent mm | 최대 조리개 | 카메라 전체 g |
| --- | --- | --- | --- | ---: |
| P1100 | 4.3–539 | 24–3000 | F2.8–8 | 1410 |
| P950 | 4.3–357 | 24–2000 | F2.8–6.5 | 1005 |
| P1000 | 4.3–539 | 24–3000 | F2.8–8 | 1415 |

3개 모두 `kind: fixed / mount: null / specs.fixedLens`다. 별도 interchangeable lens product가 없으며 `getIntegratedLens()`는 includedInBodyId를 가지는 내장 광학 표현만 만든다. 이 객체의 weight/newPrice/usedPrice는 null이라 카메라 전체 무게/가격에 다시 더하지 않는다. 기존 P1000 scenario regression에서도 BUY=카메라 1개, lensCount.after=0, weight.after=1415g을 확인한다.

COOLPIX의 `specs.ibis`는 모두 null이고 생산 staging에 IBIS claim이 없다. P1000 공식 VR의 정지화상 lens-shift, 영상 lens-shift+electronic 보정은 raw의 unpromoted evidenceExcerpt에 남아 있다. 이를 body/sensor-shift IBIS 객체로 승격하지 않았다. P950/P1100도 lens VR에서 body IBIS를 추론한 값이 없다. 광학 줌, lens VR을 충분히 담는 현재 fixedLens leaf가 없는 것은 **후속 표현 후보**이며 별도 카메라 identity 누락이 아니다. 이번에 schema leaf를 추가하지 않았다.

## Nikon 조건부 사양의 경계

- Z9의 대표 전자식 연사는 **20fps**, JPEG L Fine/high-efficiency RAW 조건이며 C120이 아니라는 metadata가 있다. Z8/Z9의 갤러리 약 120fps를 일반 full-resolution RAW 최대 연사로 승격하지 않았다. pre-release/JPEG 저해상도 모드는 별도 조건으로 조사할 후속 표현 영역이다.
- D850은 EN-EL15a 기준 기계식 **7fps**다. MB-D18+EN-EL18b의 **9fps** 조건을 claim에 남겼으며 기본값으로 합치지 않았다. D7500 8fps의 AF-C/S·M/1/250s 조건, Z30 11fps의 JPEG/12bit RAW 조건도 archive에 남아 있다.
- Z9의 8.3K N-RAW 59.94p는 내부 12bit RAW·FX·firmware Ver.2.00 이상 조건이다. Z8의 영상 claim은 내부 N-RAW/resolution/frameRate를 보존하지만 Z9의 추가 firmware 조건을 Z8에 임의 복사하지 않았다. ZR의 6K R3D NE 59.94p/12bit 내부 녹화는 별도의 저해상도 고속 모드와 합치지 않았다.
- Z6II의 4K 59.94p는 firmware>=1.10, DX-based movie format, normal quality 조건이고 cropAtMax=true다. Z5의 4K는 1.7배 고정 영역이며 cropFactor를 metadata에 보존했다. Z7II의 확인되지 않은 crop은 null이며 uncropped로 확정하지 않았다.
- Z50/Z6/Z7/Z6II/Z5의 연사 수치를 셔터별 leaf로 근거 없이 배정하지 않았다. P1000의 mechanical+CMOS electronic 병용은 단순한 독립 셔터 선택 가능성으로 확장하지 않았다.

조건은 source → staging claim.conditions → transaction evidence에서 보존되지만 단일 `video.max`/`burst` 숫자만 소비하는 canonical 화면·추천 경로가 firmware/codec/recording mode/grip/crop/품질을 모두 전달하지 못한다. 기존 Sony/Canon 영상·연사 표현 backlog에 연결할 **후속 표현 개선**이다. 이는 카메라 제품 coverage 완료와 구별되며 이번에 엔진/UI/video schema를 수정하지 않았다. Nikon F 교환렌즈가 현재 36개 렌즈 풀에 없는 점 역시 렌즈/추천 coverage의 별도 과제다.

## Production artifact와 canonical 연쇄

4개 batch의 16개 item은 모두 canonicalized다. manifest, raw, staging, diff, 현재/보관 approval, transaction before/after/evidence/journal을 검사했다. source/content/staging/diff/evidence digest, incoming artifact byte SHA, approval ID와 canonical baseline/expected digest 연결을 확인했다. 과거 identity-map은 이후 append되는 현재 파일과 바이트 비교하지 않고 **transaction에 보관된 identity-map 및 승인 시 digest**를 검증했다. 수정하지 않은 vocab은 현 파일 바이트 hash 및 archived 객체와 대조했다.

보관 raw를 다시 정규화·검증하는 `verifyIncoming()`과 보관 승인 decisions/productOperations를 사용하는 `proposedCanonical()`을 **메모리에서만** 실행했다. 네 batch 모두 과거 after와 동일한 객체·expected digest를 재현했다. 재승인/production apply를 실행하거나 옛 artifact를 재생성하지 않았다.

| batch | item / field claim | 적용 후 SHA-256 |
| --- | ---: | --- |
| 001 | 5 / 49 | `fe082817b2e9d39d821f936aa680b3fde2aa3825848a94bdd096b5c0c1dbb730` |
| 002 | 5 / 55 | `1f1c419c84e5524941530ddd6d8c47a9f1e966bd08505f8313e207f7d4535429` |
| 003 | 5 / 56 | `76e6bc26a2c0515b3f505600c8b98585c8a1819c576a1f689808f0ecf8fd9745` |
| 004 | 1 / 13 | `5af85cb2cd789d256ebda930ea6bec7fc1b16c924aa893fcce0242d17dadbb1b` |

001 baseline은 Canon005 expected `3c6c2d52bbe484d71172da7fc4c9cb5af960ce09477fa40d84d802cf7f72b03e`와 같다. 이후 expected→다음 baseline이 모두 연결되고 **004 after와 현 canonical SHA가 같다**. artifact 누락, digest 불일치, 중복 item, 재현 실패는 **0건**이다. 전체 canonical은 변경 없이 바디 **102**, 렌즈 **36**, 합계 **138**개다.

## 검증·변경 범위·다음 단계

[새 coverage regression](../tests/nikonCoverageAudit.test.js) 5개는 상태 합계/고유 identity와 세대 경계, 알려진 사양의 근거 분류 및 claim 연결, 네 batch의 archive/digest와 승인 결과 재현, COOLPIX 초점거리·IBIS·내장 자산 정책, 조건부 사양을 검증한다. 기존 Nikon 테스트 14개를 약화하지 않았다. Snapshot regression은 저장된 자료의 일관성을 검사하며 공식 사이트의 미래 변경을 자동 감지하지 않는다.

| 검사 | 결과 |
| --- | --- |
| `pnpm test` | **154/154** |
| `node --test tests/objective*.test.js tests/sonyCoverageAudit.test.js tests/canon*.test.js tests/nikon*.test.js` | **114/114**; 기존 Sony coverage 2개도 포함한 관련 suite |
| `node --test tests/nikon*.test.js` | **19/19** |
| `validateCanonical(current, vocab)` | **102 bodies / 36 lenses / 138 total**, true |
| 현 canonical vs Nikon004 expected SHA | **canonicalMatches: true** |
| `pnpm build` | 성공; 기존 500kB 초과 chunk 경고 |
| Objective scripts + 신규 test `node --check` | 통과 |
| `git diff --check` | 통과 |

변경 대상은 이 감사 문서, 진행 문서, 새 coverage test뿐이다. canonical/legacy DB, 기존 inventory, identity-map/vocab/catalog-scope, raw/staging/approval/transaction, 추천 엔진/UI 및 pipeline 코드는 변경하지 않았다. 이번 감사는 새 제품 ingestion이나 cheap-worker/API 호출을 하지 않았다.

다음 브랜드는 [v0.4 계획](OBJECTIVE_DB_V04_PLAN.md)의 **B4 Fujifilm 현행 바디**다. 별도 요청을 받은 다음 공식 inventory와 범위를 확인하고 작은 batch부터 시작한다. Nikon은 위 should-fix와 표현 backlog를 별도 보강 작업으로 유지하며, Z5IIC의 실제 출시 상태를 다음 공식 inventory 점검 때 다시 확인한다.
