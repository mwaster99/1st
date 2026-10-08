# OM SYSTEM production batch 001 — 2026-10-08

일반 현행 카메라 **9개를 한 번의 production batch로 완료**했다. 신규7/기존 보강2이며 canonical은 **146 bodies /36 lenses /182 total →153/36/189**이다. 기존 `om-1-ii`, `om-5`의 ID·이름·aliases·가격을 유지했다. 나머지 기존144바디와36렌즈는 의미적으로 동일하다. Canonical은 기존 pipeline의 atomic apply로만 변경했으며 수동 편집하지 않았다.

## 공식 inventory와 지역 범위

한국 공식 경로를 우선 확인했으나 `explore.omsystem.com/kr/ko/`는404였고 공식 global region selector에서도 Korea locale을 확정하지 못했다. 이것으로 한국 사업 종료나 한국 판매 여부를 추론하지 않는다. 기준 목록은 [일본 OM/OM-D](https://jp.omsystem.com/product/dslr/om-d/index.html), [PEN](https://jp.omsystem.com/product/dslr/pen/index.html), [Tough](https://jp.omsystem.com/product/compact/t-tough/index.html)의 **모델 카드9+2+1=12**이며 [global camera gallery](https://explore.omsystem.com/c/en/all-cameras)로 교차 확인했다.

지역별 목록이 다르므로 global gallery에 없는 일본 현행 구형 제품도 포함했다. JP 공식 mirrorless/compact discontinued archive를 별도 확인하여 E-M1X/E-M1II/E-M5III/PEN-F/TG6 등을 새 denominator에 넣지 않았다. 이번 범위는 **JP/global 공식 현행 모델 목록**이며 한국 판매·재고나 전세계 모든 지역 SKU의 완전성을 보증하는 감사가 아니다.

| 공식 모델 카드 | 브랜드 label | 상태와 이번 처리 |
| --- | --- | --- |
| OM-1 Mark II | OM SYSTEM | released/current, 기존 `om-1-ii` 보강 |
| OM-3 | OM SYSTEM | released/current, 신규 `om-3` |
| OM-5 Mark II | OM SYSTEM | released/current, 신규 `om-5-ii` |
| OM-D E-M10 Mark IV | OLYMPUS | released/current, 신규 `om-e-m10-iv` |
| OM-1 | OLYMPUS 본체 label / OM SYSTEM 현행 페이지 | released/current, 신규 `om-1` |
| OM-5 | OM SYSTEM | released/current, 기존 `om-5` 보강 |
| OM-D E-M1 Mark III | OLYMPUS | JP 현행 카드에 유지, 신규 `om-e-m1-iii` |
| PEN E-P7 | OLYMPUS | released/current, 신규 `om-e-p7` |
| Tough TG-7 | OM SYSTEM | released/current, 신규 `om-tg7` |
| OM-3 ASTRO | OM SYSTEM | 2026-02-27 출시, deferred-special-category |
| E-M1 Mark III ASTRO body-mount filter set | OM SYSTEM | 2024-07-25 출시, deferred-special-category |
| PEN | OM SYSTEM | **2026년10월하순 출시 예정**, announced/upcoming; PEN E-P7과 별개 |

12cards/12base identities. 출시 제품은 특수 제품까지 포함11, production in-scope released/current는9, upcoming1, 별도 linked variant 중복0, deferred-special2, 기존 canonical current2, 시작 시 production provenance 없는 일반 현행9다. 카드 내부 색상/kit offer는 별도의 모델 카드로 세지 않았다. E-M1III ASTRO filter set는 독립 ASTRO base identity 한 개를 대표하며 일반 E-M1III의 kit alias로 합치지 않는다.

ASTRO 두 제품은 IR-cut filter의 광학 특성이 H-alpha 투과에 맞게 바뀌었고 제조사가 일반 피사체 촬영을 권하지 않는다고 명시한다. 전문가용/천체촬영이라는 이유만으로 제외한 것이 아니다. 스펙트럼·필터·일반광 색상 workflow를 별도 pilot에서 검토할 수 있도록 `catalog-scope.json`에 모델별 근거와 재검토 조건을 추가했다.

TG-7 construction/WORM은 동일 TG-7 하드웨어의 모드이므로 별도 제품을 생성하지 않았다. 공식 support가 안내하는 Olympus 의료/Evident 산업 제품은 다른 회사의 범위이며 OM Digital Solutions 카메라 inventory로 합치지 않았다. 기업 사이트의 광학·부품 제조 사업도 일반 body 모델 목록과 구분했다.

`manufacturerModelCode`는 공식 commercial model heading을 사용한다. 확인하지 못한 규제 IM 번호를 생성하지 않는다. 원문 card label·제품명·브랜드 label·normalized `OM System` brand를 snapshot에서 분리했다. Olympus 계보를 이유로 세대/ASTRO/PEN identity를 합치지 않았다.

## 승격 데이터와 provenance

모든 운용무게는 battery-and-card 기준이며 body-only도 별도로 기록했다. 신규 raw source22개, 제품당2–3개다. 기존 두 제품의 retained official source까지 포함하면 해당9제품의 canonical 누적 공식 링크는24개다. 표의 source는 **이번 raw / canonical 누적**이다.

| 제품 | effective MP | 운용/본체 g | body IBIS stops | 대표 internal video | source |
| --- | ---: | ---: | ---: | --- | ---: |
| OM-1 Mark II |20.37|599/511|8.5|C4K59.94p, HEVC10bit|3/4|
| OM-3 |20.37|496/413|6.5 중앙|C4K59.94p, HEVC10bit|3/3|
| OM-5 Mark II |20.37|418/370|6.5 중앙|C4K24p, AVC8bit|3/3|
| E-M10 Mark IV |20.3|383/335|4.5|4K30p, bit depth UNKNOWN|2/2|
| OM-1 |20.37|599/511|7.0|C4K59.94p, HEVC10bit|3/3|
| OM-5 |20.37|414/366|6.5|C4K24p, bit depth UNKNOWN|2/3|
| E-M1 Mark III |20.37|580/504|7.0|C4K24p, bit depth UNKNOWN|2/2|
| PEN E-P7 |20.3|337/289|4.5|4K30p, bit depth UNKNOWN|2/2|
| Tough TG-7 |12|249/222|2.5 조건부|4K30p, bit depth UNKNOWN|2/2|

각 제품의 JP 제품 페이지와 spec을 사용했다. OM1II/OM3/OM5II에는 동일 모델의 공식 HTML manual, OM1에는 공식 recording-time FAQ를 추가했다. 실제59.94p/24.00p mapping과 해당 internal codec depth를 직접 확인했다. OM5II의 C4K24p는 선택한24.00p이며 다른 모드의23.98p로 바꾸지 않는다. 구형 제품의 JP24p/30p 표기는 검증되지 않은 fractional actual fps로 추정 변환하지 않는다. 외부 HDMI나 PCM 오디오 bit 수를 내부 영상 bit depth로 넣지 않았다.

총 **231claims=known193/UNKNOWN38**, **193verified fieldEvidence**, unique paths231이다. 기존2제품의 diff는 same-value/new-evidence6/null-fill36/value-conflict2/unknown-no-change6, 신규7제품의 changes181이다. 신규 제품의 null claim도 diff category는new-product이므로 summary의 category별unknown count를 실제UNKNOWN claim 수와 혼동하지 않는다. 가격claim0/별도lens product0이다.

진짜 incoming source conflict는0이다. 기존OM1II/OM5의 **20.4→20.37MP 두 건**만 명시적 value-conflict로 승인했다. 기존 공식 global 페이지는20.4MP, JP 세부 사양은2037만임을 새로 확인했다. 반올림 정밀도 차이라는 해석을 main이 명시하고 sensor revision은 추론하지 않았다. 자동 덮어쓰기 없이 두 건을 승인 사유와 `allow-value-conflicts`에 기록했다.

MFT8제품은 기존 `Micro Four Thirds` mount와 각 모델 자신의 공식17.4×13mm를 사용했다. Panasonic 값을 복사하지 않았다. 유효20.3/20.37MP를 총화소나80MP 합성 출력으로 대체하지 않았다. High Res/Live ND/Focus Stacking 등은 해당 claim의 원문/조건과 backlog로 보존하며 새 feature schema를 만들지 않았다.

IBIS는 MFT8제품의5축과 TG7의sensor-shift를 분리했다. TG7은present:true/stops2.5, axes UNKNOWN이며 CIPA2축 가진을 보정 축수로 오해하지 않았다. OM3/OM5II는body 중앙6.5/주변5.5, SyncIS 중앙7.5/주변6.5를 조건에 따로 보존했다. OM1 body7/Sync8, OM5 body6.5/Sync7.5, E-M1III body7/Sync7.5도 test lens/focal/설정을 유지했다. combined rating을 body stops로 승격하지 않았다.

기계/전자max fps는 표 순서로10/120,6/120,6/30,8.7/15,10/120,10/30,15/60,8.7/15,UNKNOWN/20이다. AF/AE 첫 프레임 고정·렌즈·플래시 조건의 원문을 보존했다. ProCapture/prebuffer는 별도 모드이며 해당 속도를 일반 sustained burst로 보증하지 않는다. TG7 WORM 사용 시 영상/연사/RAW 등 기능 제한도 남겼다.

TG7은 기존fixed/mount:null/specs.fixedLens 구조를 사용했다. 실제4.5–18mm, 35mm환산25–100mm, 최대F2–4.9를 분리했다. 4x optical zoom은metadata에만 두었다. 공식 sensor 형식은 **1/2.33-inch**이며 물리mm 크기는UNKNOWN이다. 내장 렌즈에 별도 무게/product를 만들지 않았고 기존 consumer가 전체249g을 한 번만 계산하는 것을 테스트했다.

Weather는 rated OM/OM-D6제품과TG7에서true다. IP53은IP53 렌즈 조합, IPX1 렌즈에서는IPX1이라는 조건을 보존했다. E-M1III는IPX1, TG7은IPX8/15m·IP6X다. 내충격/압궤/내한 수치는 별도feature metadata이며 weather boolean에서 추론하지 않았다. E-M10IV/PEN E-P7의weather는UNKNOWN이다.

주요UNKNOWN은 cropAtMax9, 독립AI unit9, physical slot count6, JP2축 LCD의 hinge enum6, E-P7/TG7 EVF presence, TG7 보정축수·sensor mm·touch, 구형제품의video bit depth/fractional fps 등이다. 기존 정책에 따라 null 또는 leaf 미생성을 사용하며 임의false를 넣지 않는다. MP 교차확인에 사용한 global 자료에서 OM1II/OM5의vari-angle도 새로 확인했지만, sealed batch의LCD claim을 바꾸지 않았다. 해당 mechanism leaf의 별도 evidence 보강 후보로 기록했다.

## Cheap-worker와 직접 검토

9개 독립task/실API10attempts다. TG7 초회는MALFORMED_RESPONSE여서 같은task ID로 허용된retry1회를 했고 성공했다. OM1II는needs_information으로 유용한 후보/경고를 반환했으며 기술적 호출 실패는 아니다. main이 공식guide를 추가 확인하여 재호출하지 않았다. 마지막 결과는8success/1needs_information이다. 버린 TG7 초회 비용도 포함했다.

| 제품 task | input | output | total | attempts/마지막 상태 |
| --- | ---: | ---: | ---: | --- |
| OM1II |2179|895|3074|1/needs_information|
| OM3 |2507|790|3297|1/success|
| OM5II |1979|762|2741|1/success|
| E-M10IV |1352|558|1910|1/success|
| OM1 |1610|610|2220|1/success|
| OM5 |1788|576|2364|1/success|
| E-M1III |1847|788|2635|1/success|
| E-P7 |1327|515|1842|1/success|
| TG7, retry포함 |2667|1244|3911|2/success|
| 합계 |**17256**|**6738**|**23994**|10API|

공개 공식 source 발췌와 최소contract만 담은fixture9개를 사용하고 모두 삭제했다. 프로젝트code/canonical/secret을 보내지 않았다. worker patch 적용0, 추가 사용자 개입0이다. Main은inventory/state/identity9, 각 값/조건/UNKNOWN, 전체diff231, 정밀도conflict2, explicit approval1, apply1/reapply1와 최종 테스트 판단을 수행했다.

채택한 경고: 유효/총/합성MP 구분, body/SyncIS, weight, 모드/bit 정보 부족, 실제/환산 focal 구분. 거절/교정한 제안: OM3 warning의body6.5/6.5 오기→공식6.5/5.5, OM1 slot1만 있는 부분 추출→전체spec의slot2 확인, LCD2축을tilt/vari-angle로 단정, AF 시험 렌즈를 내장렌즈로 해석, 외부/audio bits로 내부 depth를 추정하는 것.

새 normalization 주의사항은 일본어 만화소의pixel→MP, 유효/총/합성 구분,20.4/20.37 정밀도 차이, 중앙/주변·CIPA2024, 시험 가진축과 보정축수, Shift-JIS 공식FAQ 읽기, media 형식만으로 슬롯 수를 추론하지 않기, 브랜드label과모델ID 분리다. Pipeline 구조 변경은 필요하지 않았다.

기존 catalog 테스트의 재귀 숫자 검사가 모든number에 비음수를 요구하여 공식−10°C를 잘못 거절했다. 기존 contract/validator는 음수 온도를 허용하므로 `tests/cameraCatalog.test.js`의 정확한operatingTemperatureC.min/max 경로에만 예외를 적용하고 유한값·min≤max를 검사했다. Runtime/schema/validator/production artifact는 변경하지 않았다. 새OM 테스트 초안의3개assertion도 UNKNOWN이 항상explicit null이라는 잘못된 가정을 기존 미생성 정책에 맞게 고쳤다.

## 실행·검증·재개

Raw helper가22개의실제UTC **2026-10-08T04:37:50.501Z–04:37:50.508Z**를 자동 생성했다. ISO구조·before/after clock bound·source/content/raw/staging digest를 검증했다. Source 조회시각·HTTP status·response byteSHA는snapshot에 별도로 기록했다. Helper가 URL을 fetch하는 구조로 바꾸지 않았다.

Raw→normalize→strict validate9/9→diff/human review→explicit CLI approval→atomic apply→canonical validation→실제reapply를 완료했다. 재적용은 **already-canonicalized/canonicalMatches:true**다. BaselineSHA는 `2470956cd9cd3115713e5b623cfbc3cd74e5aa34a2e22124ec57b92b5d54503c`, afterSHA는 `d5f544b9978fc02ef6f36e62b723758d400ed5685b1b1d8383324ba95f14cd25`다. Archive에서 승인/claim/evidence를 재생하여 동일 canonical/digest를 확인했다. Pipeline의JSON 재직렬화 때문에 byte diff가 크지만 기존 비대상 제품의 의미는 동일하다.

| 검증 | 결과 |
| --- | --- |
| 전체tests | **274/274** |
| Objective/production/catalog/coverage | **247/247** |
| 신규OM regression | **13/13** |
| strict ingestion |9/9 valid|
| canonical validation |true,153/36/189|
| pnpm build |통과,기존500kB chunk 경고|
| 변경test2개의node --check |통과|
| git diff --check |통과|
| 실제reapply |already-canonicalized/canonicalMatches:true|

새OM regression13개는 atomic replay·identity/state·정밀도 승인·진짜source conflict 차단·MFT/composite·IBIS/Sync/축·burst·video·fixed 단일무게·UNKNOWN·strict blockers·provenanceUTC·worker 비용/retry·resume를 검사한다. 기존5브랜드의production/coverage fixture도 전체/Objective suite에서 통과했다.

현재 Git은 **tracked 수정5개 + 신규 파일42개 = 총47파일의 미commit 변경**이다. Tracked 수정은 진행문서,canonical,map,scope,catalog test다. 신규 파일은 보고서1,snapshot1,approval2,manifest1,diff1,raw22,staging9,transaction4,OM test1이다. Writer lock/owner 임시파일은 남아 있지 않다. Push하지 않았다. 추천 엔진/UI/Experience/가격/렌즈/vocab/schema/validator/기존production artifact는 변경하지 않았다.

재개 위치는 `src/data/ingestion/om-system-current-2026-10-08.json`의 `batchCheckpoint`와 `production-om-system-bodies-001` manifest다. 일반 현행production 미처리0,upcoming PEN1,special deferred ASTRO2다. 이번batch 재생성/worker 재호출 없이 **JP/global범위를 명시한OM SYSTEM coverage audit**으로 진행한다. Audit은193fieldEvidence/기존2제품의structured identity evidence 차이/UNKNOWN과 조건/지역 차이를 확인해야 한다. 현재production 처리 완료를field completeness나coverage audit 완료로 보고하지 않는다.

## 사용자 보고 항목 대응

1–2:공식cards12/base identities12. 3:inventory표12제품. 4:일반released/current9,특수포함11. 5:upcoming1. 6:별도linked duplicate0. 7:ASTRO2deferred. 8:기존current2. 9:시작미처리9. 10–11:처리9/표의일반제품. 12:PEN미출시와ASTRO특수범위. 13:신규7/보강2. 14:146/36/182→153/36/189. 15–16:제품대표값/source표. 17:진짜incoming0/기존precision2명시승인. 18:UNKNOWN단락. 19:MFT단락. 20:IBIS단락. 21:computational구분. 22:TG7단락. 23:IP단락. 24:영상/연사조건. 25–26:worker표23994총token. 27:TG7retry1/형식failure1/OM1II정보부족1. 28–29:채택/거절/main판단. 30:추가사용자0/main9제품231diff검토. 31–32:normalization/기존catalog test오류/표현backlog. 33:UTC검증. 34–38:검증표. 39:실제idempotency. 40:미commit상태범위. 41:일반현행미처리0. 42:추가일반batch불필요. 43:coverage audit준비완료,감사자체는후속.
