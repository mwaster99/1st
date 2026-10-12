# OM SYSTEM Objective DB production coverage audit — 2026-10-12

**Japan official catalog 기준 OM SYSTEM 일반 현행 카메라 Objective DB product coverage를 1차 완료로 판정한다.** 일반 released/current 9개가 canonical과 production provenance를 갖추었으며 미처리·중복/모호 identity·critical은 모두 0이다. 이 선언은 한국 판매 coverage, 전체 사양 완성, 가격·렌즈·추천 기능 완성을 의미하지 않는다.

시작 working tree는 clean, baseline은 `821b4ef`였다. 2026-10-08 inventory, production batch 001의 보고서와 artifact, 진행 문서, canonical, identity-map, catalog-scope, field contracts, 최신 validators, 기존 5개 브랜드 감사와 OM regression을 대조했다. 요청문의 날짜와 달리 **실제 감사 기준일은 2026-10-12**다. 작업 중 중단 후에는 만들어진 audit snapshot과 테스트·로그를 재확인하고 문서 작성부터 이어갔다.

## 공식 목록과 지역 범위

분모는 [일본 OM/OM-D](https://jp.omsystem.com/product/dslr/om-d/index.html), [PEN](https://jp.omsystem.com/product/dslr/pen/index.html), [Tough](https://jp.omsystem.com/product/compact/t-tough/index.html)의 모델 카드다. [글로벌 카메라 목록](https://explore.omsystem.com/c/en/all-cameras), 같은 모델의 글로벌 사양, 공식 매뉴얼/FAQ, discontinued archive로 교차 확인했다. 과거 inventory를 덮어쓰지 않았다.

공개 공식 URL 36개를 새로 조회했다. 35개는 HTTP 200이고, 이전에도 확인하지 못했던 Korea locale probe만 404였다. 조회 시각은 `2026-10-12T04:23:48.359Z`부터의 실제 UTC ISO timestamp다. 정확한 URL별 시각·응답 SHA-256·카드·원문 발췌·판정은 [새 감사 snapshot](../src/data/ingestion/om-system-coverage-audit-2026-10-12.json)에 보관했다. 응답 SHA는 관찰 응답의 식별값이며 원본 HTML 전체의 영구 보관이나 미래 웹사이트 변경 자동 추적을 뜻하지 않는다. 실패한 locale을 현행 제품 source로 세지 않는다.

| 지표 — Japan official catalog 기준 | 결과 |
| --- | ---: |
| 공식 카드 | 12 (OM/OM-D 9 + PEN 2 + Tough 1) |
| Base identity | 12 |
| 일반 released/current | 9 |
| Canonicalized 일반 제품 | 9 |
| Production provenance 완료 | 9 |
| Announced/upcoming | 1 |
| Deferred-special | 2 |
| 별도 linked variant 카드 | 0 |
| 일반 current 미처리 | 0 |
| Duplicate / ambiguous | 0 / 0 |

새 카드·카드 삭제·관찰된 출시상태/제품명/identity 변화는 0이다. 카드 안의 색상·바디/렌즈 kit offer는 독립 모델 카드로 중복 계산하지 않았다. Global gallery는 지역별 모델 구성이 다르므로 일본 분모를 대체하지 않는다. 일본 현행 카드에 있는 일반 E-M1 Mark III를 모델의 나이만으로 제외하지 않았다. E-M1X/E-M1II/E-M5III/PEN-F/TG6 등의 공식 discontinued archive는 현행 분모와 구분한다.

**Korea 공식 current catalog는 확정하지 못했다.** 재조회한 `/kr/ko/`가 404라는 사실과 global region selector에서 Korea locale을 확인하지 못한 사실은 한국 철수·미판매의 증명이 아니다. 한국 retail coverage 완료는 주장하지 않는다. 향후 권위 있는 한국 공식 목록이 확인되면 별도 regional reconciliation에서 출시 상태·identity·지역 사양 차이를 비교한다.

## 12개 identity와 상태

| 모델 | Canonical ID | 상태 | Batch raw source / canonical source |
| --- | --- | --- | ---: |
| OM-1 Mark II | `om-1-ii` | canonicalized-current, 기존 보강 | 3 / 4 |
| OM-3 | `om-3` | canonicalized-current | 3 / 3 |
| OM-5 Mark II | `om-5-ii` | canonicalized-current | 3 / 3 |
| E-M10 Mark IV | `om-e-m10-iv` | canonicalized-current | 2 / 2 |
| OM-1 | `om-1` | canonicalized-current | 3 / 3 |
| OM-5 | `om-5` | canonicalized-current, 기존 보강 | 2 / 3 |
| E-M1 Mark III | `om-e-m1-iii` | canonicalized-current | 2 / 2 |
| PEN E-P7 | `om-e-p7` | canonicalized-current | 2 / 2 |
| Tough TG-7 | `om-tg7` | canonicalized-current | 2 / 2 |
| OM-3 ASTRO | 없음 | deferred-special-category | 이번 ingestion 없음 |
| E-M1 Mark III ASTRO filter set | 없음 | deferred-special-category | 이번 ingestion 없음 |
| 신형 OM SYSTEM PEN | 없음 | announced/upcoming | 이번 ingestion 없음 |

[PEN 공식 페이지](https://jp.omsystem.com/product/dslr/pen/pen/index.html)는 여전히 **2026년 10월 하순 출시 예정**으로 표기한다. 10월 12일 기준 upcoming이며 일반 출시 제품 누락으로 세지 않는다. 이미 출시된 OLYMPUS PEN E-P7과 별개 identity다. 실제 출시로 바뀌면 분모와 미처리 수를 다시 계산하고 별도 production batch를 진행해야 한다. 이번 감사에서 선제 ingestion하지 않았다.

ASTRO 두 제품은 **independent specialty product**다. [OM-3 ASTRO](https://jp.omsystem.com/product/dslr/om-omd/om/om3_astro/index.html)는 일반 OM-3에서 IR-cut 필터의 광학 특성을 천체용으로 변경한 바디이며 body-mount 필터는 별매다. [E-M1 Mark III ASTRO](https://jp.omsystem.com/product/dslr/om-omd/omd/em1mk3_astro/index.html)는 같은 계보의 광학 변경 바디에 BMF-LPC01/BMF-SE01 필터가 포함되는 판매 구성이다. 일반 E-M1III에 붙이는 accessory-only listing이나 단순 kit alias가 아니다. 출시일은 각각 2026-02-27 / 2024-07-25, 수주 생산이다.

공식 자료는 H-alpha 투과율을 높인 결과 붉은 색이 강해져 천체 이외 일반 피사체 촬영을 권하지 않는다고 명시한다. 전문가용이라는 이유가 아닌 **실제 광학 특성·일반광 workflow 차이**가 보류 근거다. 기존 `catalog-scope.json`의 모델별 공식 URL·IR-cut 이유·spectral/H-alpha/daylight-filter 재검토 조건은 충분하고 그대로 유지했다. 영구 제외하지 않는다. Audit snapshot에는 기반 모델 관계와 filter bundle 여부를 더 명시했다. 독립 specialty identity의 파생 관계를 일반 바디와 동일 identity를 공유하는 linked variant 수에 넣지 않았다.

OM-1/Mark II, OM-5/Mark II는 별개 ID·세대·모델코드이며 reviewed alias 충돌이 없다. OLYMPUS/OM SYSTEM의 원문 브랜드 표기를 normalized `OM System`과 구분했다. 브랜드 계보를 이유로 다른 모델을 합치거나 동일 제품을 중복 생성하지 않았다. ASTRO/PEN 신형을 일반 바디 alias로 합친 사례도 없다. TG-7 construction/WORM은 동일 카메라의 모드다.

## Provenance와 findings

| 통계 | 결과 |
| --- | ---: |
| Known objective leaf / verified leaf | 258 / 258 |
| Verified fieldEvidence 경로 | 193 |
| Production claim: known / UNKNOWN / 전체 | 193 / 38 / 231 |
| Manufacturer-reference-only known leaf | 0 |
| Legacy-only known leaf | 0 |
| Unclassified / source-less known leaf | 0 / 0 |
| 전용 canonical identityEvidence | 7 |
| 공식 식별 근거는 있지만 전용 객체가 없는 제품 | 2 |
| Production raw source | 22 |
| Canonical source 연결 | 24 |

Known leaf 통계는 `specs`의 non-null scalar 및 배열을 한 경로로 세며 객체는 자식 경로로 펼친다. `fieldEvidence`의 parent object claim은 실제 자식 leaf까지 덮는다. 각 경로의 값 = verified claim 값, claimId/sourceId = raw/transaction, canonical `sources.fields` 범위를 검사했다. 가격·identity를 이 spec leaf 통계에 섞지 않는다. Known claim 하나가 LCD/IBIS 등 객체 여러 leaf를 증명하므로 193과 258은 다른 집계다. 기존 broad source가 존재한다는 이유만으로 필드를 verified로 세지 않았다.

기존 `om-1-ii`, `om-5`는 중복 생성 없이 각각 same-value/new-evidence 3개와 null-fill을 통해 실제 provenance가 보강됐다. 기존 20.4MP → 일본 공식 약 20.37MP는 global 반올림 표기와 일본 유효화소 표기를 검토한 **precision conflict 2건**이며 explicit approval과 decisions가 있다. 센서 세대 변경으로 주장하지 않는다. Canonical ID/name/aliases/가격은 유지됐다.

두 기존 제품에는 전용 canonical `identityEvidence`가 없다. 대신 staging/raw의 verified identityEvidence와 공식 모델 페이지가 있고, 기존 canonical 글로벌 source가 `identity`를 증명한다. 새 일본 product source는 canonical에서 releaseDate 근거로 연결됐지만 그 source의 `fields`에 `identity`가 추가되지는 않았다. 전용 객체·명시적 identity 연결 보강은 별도 승인 batch 후보이며 근거가 없는 identity로 판정하지 않는다.

| 심각도 | 수 | 판단 |
| --- | ---: | --- |
| critical | 0 | 일반 제품 누락·중복·모호 identity, 근거 없는 known 값, 잘못된 kind/mount/무게/단위/IBIS, 깨진 chain 없음 |
| should-fix | 4 | 기존 2개 전용 identity metadata 누락 + 같은 2개 공식 지역 센서 크기 표기 차이 확인 필요 |
| acceptable UNKNOWN | 46 | 명시적 null claim 38 + 객체 내부 미확인 child 8; 추측 없이 유지 |

**새로 발견한 공식 지역 표기 차이:** OM-1 Mark II/OM-5의 JP `撮像画面サイズ`는 **17.4×13mm**, 글로벌 [OM-1 II 사양](https://explore.omsystem.com/gb/en/om-1-mark-ii)과 [OM-5 사양](https://explore.omsystem.com/lt/en/om-5)의 sensor/area는 **17.3×13mm**다. Canonical 17.4는 JP의 직접 근거와 `conditions.region: JP`를 갖는다. 차이를 반올림·별도 하드웨어·물리 센서와 유효영역 차이라고 단정하지 않았다. 정체성이나 일본 범위 제품 누락은 아니므로 critical은 아니지만, 동일 canonical 필드의 지역·측정 범위 계약을 후속 확인해야 한다. 두 원문과 값·URL을 별도 `regionalSourceDiscrepancies`에 남겼으며 canonical/봉인된 raw를 바꾸거나 conflicting claim을 새 ingestion에 주입하지 않았다. 기존 batch 내부 incoming source conflict는 0이고, 차기 batch에서 다른 known 값을 같은 경로로 입력하면 기존 `CONFLICTING_CLAIM_VALUES` 차단을 유지해야 한다.

UNKNOWN 46건은 전체 JSON의 null 총수가 아니다. AF 독립 AI unit 9, 영상 crop 9, 물리 slot 구조 6, 구형 내부 bitDepth 5, log 3, weatherSealing 2, EVF 2, TG7 physical sensor size 1/기계 연사 1이 null claim 38이다. 객체 내부는 LCD mechanism 6, TG7 LCD touch/IBIS axes 각 1이다. 단일 매체 목록만으로 슬롯 수를 추정하지 않았다. 두 global 자료의 vari-angle 표현은 향후 LCD evidence 보강 후보로 남겼으며 이번 감사에서 null을 일괄 채우지 않았다.

## MFT, IBIS, computational, Tough 감사

교환식 8개는 기존 정확한 mount enum **`Micro Four Thirds`**다. Panasonic MFT 자료를 OM 제품 사양의 근거로 재사용한 사례는 없다. Native effectiveMP는 6개 20.37, E-M10IV/E-P7 20.3, TG7 12다. 총화소나 High Res/Handheld High Res 합성 결과를 유효화소로 승격하지 않았다. High Res Shot·Handheld High Res·Live ND·Focus Stacking 등은 공식 조건/기능 설명과 별도 feature backlog다. Pro Capture의 pre-release/buffer를 일반 지속 연사 숫자로 쓰지 않았다.

Body IBIS stops는 모델 순서대로 **8.5 / 6.5 / 6.5 / 4.5 / 7 / 6.5 / 7 / 4.5 / 2.5**다. MFT 8개는 5축, TG7 축수는 UNKNOWN이다. OM-3/OM-5II의 중앙6.5·주변5.5, Sync IS 중앙7.5·주변6.5를 구분하고 시험 렌즈·CIPA2024·시험축·Sync 조건을 보존했다. OM-1 body7 vs Sync8, OM-5 body6.5 vs Sync7.5, E-M1III body7 vs Sync7.5도 분리한다. OM-1II body/Sync가 모두8.5인 것은 각각의 공식 기준이며 combined 값을 body로 복사한 결과가 아니다.

TG7은 `kind: fixed`, `mount: null`, 기존 `specs.fixedLens` 구조다. 실제 **4.5–18mm**, 환산 **25–100mm**, 최대조리개 **F2–4.9**이며 staging rawUnit/unit와 diff의 focal/equivalentFocal 모두 mm다. 별도 교환렌즈 상품은 없고 adapter의 내장 렌즈는 몸체에 포함되는 synthetic 표현이다. 내장 렌즈 무게/가격은 null이고 전체 **249g**을 한 번만 계산한다. 기존 production regression의 scenario 소비 검사도 유지한다.

TG7 공식 보정 방식은 **촬상 센서 시프트**, 2.5stop(actual18/eq100mm)이다. Lens OIS로 분류하지 않았다. CIPA yaw/pitch 2축 *시험*을 보정 축수 2개로 추정하지 않았다. Rugged 조건은 IPX8 15m/IP6X, shock2.1m/crush100kgf/freeze−10°C 공식 문구에 한정한다.

## Weather, weight, video/burst, temperature

IP53 제품 5개는 호환 IP53 렌즈 조합에서 IP53, IPX1 렌즈 조합에서는 IPX1이라는 조건을 claim에 보존했다. E-M1III는 IPX1, TG7은 IPX8/IP6X이며 dust 구조만으로 IP6X를 추정하지 않았다. `weatherSealing` boolean은 구조 존재를 나타내고 IP/렌즈 조건 전체를 소비자에게 표시하지 못한다. 이는 feature 표현 개선 후보이며 제품 coverage와 구분한다.

| 모델 | Battery-and-card g | Body-only g |
| --- | ---: | ---: |
| OM-1 II | 599 | 511 |
| OM-3 | 496 | 413 |
| OM-5 II | 418 | 370 |
| E-M10 IV | 383 | 335 |
| OM-1 | 599 | 511 |
| OM-5 | 414 | 366 |
| E-M1 III | 580 | 504 |
| E-P7 | 337 | 289 |
| TG-7 | 249 | 222 |

9개 모두 두 claim에 올바른 기준이 있고 무게값/기준 누락은 0이다. CIPA 배터리/카드 포함, 해당 제품 eyecup 제외, 교환식 별도 lens 제외 및 TG7 integral lens 포함 조건을 직접 공식 질량 행과 대조했다. 그립/캡 포함 여부를 공식 자료에 없는 경우 추가 추정하지 않았다. 기존 vocab/validator의 기준만 사용하며 `operational`을 새 enum으로 도입하지 않았다.

OM-1II/OM-3/OM-1 대표 영상은 **internal C4K59.94p, HEVC10bit 4:2:0**, 같은 모델 guide/FAQ가 확인한 실제59.94와 JP60p label을 구분한다. OM-5II는 C4K24.00p/AVC8bit 대표 모드, 나머지 C4K24/UHD30의 fractional 실제 rate와 내부 bitDepth는 확인되지 않은 경우 UNKNOWN이다. Manual의 23.98/29.97/59.94와 integer 24.00/25.00, 다른 모드의 24p 표기를 한 값으로 추정하지 않았다. PCM audio16bit를 video bitDepth로 착각하지 않았다. Internal/external HDMI RAW, 일반 영상/S&Q, codec/bitrate/색 표본/AF·AE lock/렌즈 제한은 claim 조건과 원문에 보존된다. Crop9개는 UNKNOWN이며 숫자 crop factor로 바꾸지 않는다. 단일 `video.max`와 burst 최대값만 읽는 경로의 조건 표시 한계는 후속이다. 기존 29.97→97 recommendation parser bug를 product coverage blocker로 세거나 수정하지 않았다.

−10°C는 7개 제품의 공식 operating min이다. Batch001의 변경은 catalog **테스트에서 정확한 operatingTemperatureC min/max 경로만 signed number로 허용**한 것이며 finite 검사와 min<=max 검사를 유지했다. Runtime `rules.mjs`, `merge.mjs`, vocab은 이전 Panasonic audit commit `6711521`과 byte-identical임을 확인했다. 새 회귀는 음수 무게, 무한대 온도, 역전 온도 및 역전 focal range가 계속 거절됨을 검사한다. Schema/validator가 느슨해진 흔적은 없다.

## Artifact chain과 재개 위치

Batch001의 9개 manifest item/22raw/9staging/diff/현재 및 ID별 approval/transaction before·after·evidence·journal, 기존 inventory/checkpoint와 당시 config를 검사했다. **42개 파일의 관찰 hash**를 snapshot에 기록했고 누락0/digest mismatch0이다. Artifact SHA-256 byte digest와 claim/staging/diff 구조 digest를 구분했다. 향후 appendable identity-map/vocab 확장은 과거 sealed bundle로 검증하며 현재 파일이 영원히 같은 hash라고 요구하지 않는다.

- 모든 item canonicalized, manifest gate apply, journal canonicalized.
- Explicit approval ID/decision/incoming/diff digest와 archived approval 일치.
- Strict ingestion9/9 valid; raw source ID/contentDigest 및 source별 실제UTC helper clock 검증 유지.
- Before→proposedCanonical 결과와 after byte digest/내용 일치; after→같은 승인 재적용도 동일.
- 실제 CLI `apply --batch production-om-system-bodies-001` 재실행 결과 **already-canonicalized / canonicalMatches:true**. Canonical과 manifest를 재작성하지 않았다.
- Canonical **153 bodies /36 lenses /189 total**, SHA `d5f544b9978fc02ef6f36e62b723758d400ed5685b1b1d8383324ba95f14cd25` 불변.

Production batch/raw/staging/diff/approval/transaction, 기존 inventory, canonical, identity-map, catalog-scope, vocab, engine/UI/validator를 수정하지 않았다. Worker 호출0/token0; 기존 production 추출을 다시 실행하지 않았다.

## 검증과 다음 작업

[신규 coverage regression](../tests/omSystemCoverageAudit.test.js) 14개를 추가했다. Fresh gallery/status/scope, 세대/브랜드 identity, known-field provenance와 기존 identity gap, 지역별 센서 표기 차이, MFT/computational/ProCapture, Sync/body IBIS, TG7 mm/asset 구조, weight/IP/video, signed temperature와 잘못된 physical range 차단, sealed chain/approval/strict validation/idempotency/지역 제한을 검사한다. 기존 13개 OM production test와 5개 브랜드 fixture를 약화하지 않았다.

| 확인 | 결과 |
| --- | --- |
| 전체 tests | 288/288 |
| Objective/production/catalog/coverage | 261/261 |
| OM SYSTEM production+coverage | 27/27 |
| 새 coverage regression | 14/14 |
| Canonical validation | true |
| pnpm build | 통과, 기존 500kB chunk 경고(약905.53kB) |
| 변경 JS node --check / git diff --check | 통과 |

이번 변경은 감사 문서, 진행 기록, 새 audit snapshot, 새 regression test **4개 파일**뿐이다. Commit/push는 하지 않았다.

다음 세션은 이 감사 snapshot/문서와 진행 기록을 먼저 읽고, 완료된 OM batch를 재수집하지 않는다. 일반 현행 추가 batch는 현재 불필요하다. 기존 v0.4 계획 B6에 따라 **Leica, 이후 Sigma**의 공식 inventory/기존 canonical identity 비교로 이동할 수 있다. 자동 ingestion을 시작한 것은 아니다.

PEN은 실제 출시가 확인된 시점, ASTRO는 spectral/filter·일반광 촬영 workflow pilot의 범위와 표현 계약이 준비된 시점, Korea는 권위 있는 공식 catalog를 확인한 시점에 재검토한다. 전용 identityEvidence와 JP/global sensor-area 차이는 별도 소규모 근거 보강/정합성 작업 후보다. Sync IS·computational/IP layer·single video.max/burst/pre-capture·parser·가격·Experience DB·OM 렌즈·Korea regional reconciliation은 독립 backlog이며 coverage 완료 선언에 포함시키지 않는다.
