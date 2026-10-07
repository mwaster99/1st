# Panasonic camcorder production pilot 005 — 2026-10-07

## 결과와 재개 위치

지정된 HC-VX3 / AG-CX20 / HC-X2 / AJ-CX4000 모두 신규 production 적용 완료. 제품 보류0, 신규4/기존보강0. Canonical **135 bodies /36 lenses /171 total →139/36/175**. 이전135개 바디와36개 렌즈는 객체 비교로 불변 확인. 신규 가격은 UNKNOWN이며 price claim, 별도 렌즈 상품, 추천 엔진/UI/Experience 변경 없음.

시작 clean baseline `711f06501c6e414c6785c720f1350399628b2497`. Panasonic inventory/batch001–004/progress/canonical/identity-map/catalog-scope/field contracts 및 LCD/IBIS/weight/focal validator를 대조했다. 네 제품의 정확한 한국 공식 제품 페이지를 재조회하여 released/current를 확인했다. Current는 공식 retained lineup/운용 자료 기준이며 세계 생산 지속이나 재고 보증이 아니다. 다른7개는 기존 inventory를 이어받았고 새 full-brand audit를 수행한 것은 아니다.

Batch `production-panasonic-bodies-005`는 raw→normalize→default strict validate4/4→diff/사람용 summary 검토→explicit CLI approval→단일 atomic apply→canonical validation→실제 재적용까지 완료했다. 사람용 summary는 주 Codex가 검토했으며 별도 인간 심사를 받았다고 주장하지 않는다. 사용자 추가개입0. 적용 이후 worker/raw/approval을 다시 만들지 않는다.

- Diff digest: `5713d99eabd7831a2fa0e80ba4597831aa36a7580de6be9b4b3a1fe02a7f1356`
- Approval: `approval-595fe347b70a1c0df7929034b86879d46e921878754919932e865047f75001e0`
- Before canonical SHA: `e29a0553e24ada3cb6ef1eee62cbdbe17c09e50f8d529930ca9e4da590e16f1f`
- After canonical SHA: `7e1911e29c83bdee9ebb39df0f21bc1b01558cfc2f781207028237f4194562cc`
- 실제 재적용: **already-canonicalized / canonicalMatches:true**
- 종료: 검증된 관련 변경만 local commit, trailer `Objective-Batch: production-panasonic-bodies-005`; push 없음. Commit 해시는 status/Git에서 조회하고 manifest를 사후 변경하지 않는다.

재개 checkpoint는 `src/data/ingestion/panasonic-camcorder-pilot-2026-10-07.json`. 신규 batch005의 raw/staging/diff/approval/transaction만 생성했으며 과거 inventory와 production archive는 불변이다.

## Scope / 대표값

| 제품 / ID | 직접 운용 및 구조 | sensor effective / format | actual / equivalent mm | aperture W/T | operating / main-unit g | 대표 내부 영상 | 공식 sources / claims / unique fields / verified paths |
| --- | --- | --- | --- | --- | --- | --- | --- |
| HC-VX3 / panasonic-vx3 | consumer handheld, fixed/null | 8.29MP /1/2.5-type | 4.12–98.9 /25–600 | F1.8–4 | 484 /433 | 4K30p | 3 /31 /22 /16 |
| AG-CX20 / panasonic-cx20 | professional handheld CX, fixed/null | 8.29MP /1/2.5-type | 4.12–98.9 /25–600 | F1.8–4 | UNKNOWN /850 | 4K59.94p | 3 /25 /24 /18 |
| HC-X2 / panasonic-x2 | professional handheld, fixed/null | 15.03MP /UNKNOWN(conflict) | 8.8–176 /24.5–490 | F2.8–4.5 | 2490 /2040 | 4K59.94p | 3 /27 /23 /19 |
| AJ-CX4000 / panasonic-cx4000 | broadcast shoulder, interchangeable/B4 | UNKNOWN /UNKNOWN | separate interchangeable lens; fixedLens null | UNKNOWN | UNKNOWN /3400 | 4K59.94p | 4 /17 /16 /9 |

네 제품 모두 PTZ/설치 중심 장비가 아닌 직접 운용 recorder로 판단했다. Network 기능만으로 설치형으로 분류하지 않는다. Body style은 camcorder. HC-X2와 HC-X20은 공유 매뉴얼을 가진 **별개 제품**이며 alias/값을 섞지 않는다. HC-VX3K 지역 support 명칭은 원문 범위에 남기며 K를 검증 없는 alias로 추가하지 않았다.

### Fixed lens / stabilization

3개는 기존 kind fixed /mount null /specs.fixedLens. Focal과 equivalentFocal은 각각 독립 mm claim이며 실제 수치와 환산치를 뒤바꾸지 않는다. VX3 대표 환산은4K/16:9 사진25–600mm; 다른 영상28.9–693.7mm 및4:3사진30.6–734.4mm는 conditions에 둔다. 광학 줌은 VX3/CX20 24x, X2 20x, 필터62/62/67mm를 공식 조건에 보존한다. 현재 fixedLens에 해당 필드를 새로 추가하지 않는다.

AG-CX20 공식 렌즈 row의 `98.9 mmm` 오탈자는 원문 그대로 조건에 남기고 같은 row의 명시된 mm 문맥으로98.9mm를 직접 검토했다. 새로운 단위 변환 규칙은 만들지 않았다.

VX3 optical/hybrid OIS, CX20/X2 Ball O.I.S. 및 optical+electronic hybrid를 **IBIS로 승격하지 않는다**. 전4개 ibis null. Lens stabilization 전용 canonical leaf가 없으므로 conditions/향후 feature 후보로 보존한다. Built-in lens는 별도 product로 만들지 않고 runtime integrated lens의 weight/price는 null이다. 실제 generateScenarioCandidates→evaluateScenario에서 고정렌즈 운영무게484/null/2490g을 body 값 그대로 한 번만 계산하는 회귀 검증을 추가했다. AG-CX20 UNKNOWN에850+1500 등의 임의 합산을 하지 않는다.

### AJ-CX4000 mount / sensor

[공식 TOP](https://pro-av.panasonic.net/en/products/aj-cx4000gj/)는 B4 lens mount와 shoulder 형태를, [공식 specification](https://pro-av.panasonic.net/en/products/aj-cx4000gj/spec.html)은 2/3-type bayonet를 명시한다. Existing9mount로 표현 불가하므로 vocab에 canonical **B4**, aliases **B4 lens mount /2/3-type bayonet**만 추가했다. Null/fixed/다른 마운트로 위장하지 않았고 mount taxonomy/schema shape 변경 없음.

2/3는 lens interface/image-circle이며 센서 크기라고 가정하지 않았다. Fresh 공식 spec은 MOS×1/11.14million pixels로 effective를 명시하지 않는다. Sensor format/effectiveMP/sizeMm 모두 UNKNOWN. 공식 features는 광학 확대와 large sensor를 설명하지만 명확한 물리 mm를 제시하지 않는다. 검색 캐시에 남은 구 brochure4/3 표현은 실제 official PDF404 및 archive timeout으로 새 원문 검증을 완료하지 못했으므로 승격하지 않았다. 전4제품 sizeMm UNKNOWN; type명에서 mm 계산 없음.

### Weight semantics

Known specs.weight는 battery-and-card; specs.bodyOnlyWeight 조건은 body-only를 쓴다. 현행 vocab에는 operational이라는 enum이 없다. Main-unit도 렌즈가 분리되지 않는3개에서는 integral lens를 포함하며 mirrorless bare mount 상태로 바꾸지 않는다.

- VX3 433g: hood/battery/card 제외, integral lens 포함. 484g: hood/supplied battery/SD 포함.
- CX20 850g: main unit/integral lens, detachable handle/hood/battery/eyecup 제외. 공식 약1.5kg은 handle/hood/battery/eyecup 포함이나 card 기준 미표기. Reported1500g/configuration을 conditions에 두고 specs.weight/weightBasis UNKNOWN. Dimensions129×159×267mm는 configured 상태로 무게와 측정 구성 차이를 명시했다.
- X2 2040g: integral lens/grip belt 포함, hood/battery/부속품 제외. 2490g: hood/supplied battery/eyecup/**two SD cards**/mic holder/INPUT caps 포함. 공유PDF p304의2000/2430g은 HC-X20 열이라 배제. Dimensions173×195×344mm는 hood 포함 구성,211×195×390mm 대안도 metadata에 보존.
- CX4000 3400g: main unit/내부 optical magnifying system 포함; interchangeable lens/battery/optional EVF 제외. Operating config는 UNKNOWN. Dimensions143×267×348mm는 본체/excluding protrusions.

Validator actual staging 통과와 메모리 negative trial에서 missing/invalid/mismatch를 WEIGHT_BASIS_REQUIRED/INVALID_WEIGHT_BASIS/WEIGHT_BASIS_MISMATCH로 차단했다. 보류된 UNKNOWN에는 추정 기준을 만들지 않는다.

### Video / storage / displays

VX3 대표4K30p는 공식2160/30p mode label, H.264 MP4/72Mbps VBR/internal SD. 실제 fractional29.97 여부는 UNKNOWN이며 숫자를 추정하지 않는다. BitDepth/log/crop UNKNOWN. 2160/24p 및 AVCHD1080/60p는 별도 metadata.

나머지3제품 대표값은 **internal 4K59.94p /HEVC LongGOP /4:2:0 /10bit /200Mbps MOV**로 선정했다. 전체 recording matrix나 bitrate 최대값을 하나로 합치지 않는다. CX20 4:2:2 UHD10bit150M은29.97/25/23.98 조건, HDMI UHD59.94p4:2:2는 external output. FHD120/100capture slow modes도 분리했다. X2 own manual p147 기록표를 렌더링 확인했고 p194의 X2-only V-Log를 적용했다. CX4000 P2HD codec/media와12G-SDI output4:2:2, V-Log firmware 조건은 별도 metadata. 선택모드 crop는 전4개 UNKNOWN. 전문 ND/IR/XLR/SDI/network/streaming 전체 feature layer는 만들지 않는다.

VX3 media SD/SDHC/SDXC는 확인했지만 physical slot count 미검증이라 cardSlots UNKNOWN. CX20 SD2, X2 SDHC/SDXC2(UHS-I/UHS Speed Class3), CX4000 expressP2×1+microP2/SDXC combo×2로3slots. CX20 microP2 지원/단종 footnote, CX4000 codec/firmware/카드별 UHS/V90 조건도 보존한다. 논리 slot index는 count와 구성을 위한 번호이며 제조사 물리 라벨로 가장하지 않는다.

VX3 LCD3in/1.84M dots/touch, CX20/X2 LCD3.5in/2.76M dots, CX20 touch 확인, X2 touch/mechanism 미확정. CX20/X2 EVF2.36M dots. CX4000 LCD3.5in/touch 확인하지만 freshspec **2.76million pixels**를 dots로 변환하지 않아 resolutionDots absent/UNKNOWN. 2.4in B/W OLED status display는 EVF가 아니므로 EVF UNKNOWN. LCD unsupported/malformed는 INVALID_LCD로 validate 차단됨을 확인했다.

## Source graph / 충돌 / UNKNOWN

총13 official raw/100observations =75known/25UNKNOWN,85unique paths,62canonical verified fieldEvidence paths. Identity-only KRsource도 product provenance에 실제 연결되므로 counts3/3/3/4에 포함된다. Sources의 URL/sourceId/excerpt locator/digest/conditions는 raw 및 sealed transaction evidence가 보존한다.

| 제품 | 공식 source |
| --- | --- |
| VX3 | [KR current identity](https://www.panasonic.co.kr/consumer/xview/Camera/Camcoder/Camcoder/HCVX3), [NA own-model specification](https://help.na.panasonic.com/answers/features-and-specifications-camcorder-hc-vx3k/), [DVQX2553YA own manual](https://help.na.panasonic.com/wp-content/uploads/2024/11/HCVX3_Basic-Manual_ENG.pdf) |
| CX20 | [KR current identity](https://www.panasonic.co.kr/systembiz/xview/BrodcastingSystem/ProfessionalCamcoder/CXSeries/AGCX20), [official spec/recording table](https://pro-av.panasonic.net/en/products/ag-cx20/spec.html), [official features](https://pro-av.panasonic.net/en/products/ag-cx20/features.html) |
| X2 | [KR current identity](https://www.panasonic.co.kr/systembiz/xview/BrodcastingSystem/ProfessionalCamcoder/Camcorder/HCX2), [NA own-model specification](https://help.na.panasonic.com/answers/features-and-specifications-camcorder-model-hc-x2/), [DVQP2766ZA shared X2/X20 manual](https://help.na.panasonic.com/wp-content/uploads/2023/02/HCX2_X20_DVQP2766ZA_ENG.pdf) |
| CX4000 | [KR current identity](https://www.panasonic.co.kr/systembiz/xview/BrodcastingSystem/ProfessionalCamcoder/CXSeries/AJCX4000), [official spec](https://pro-av.panasonic.net/en/products/aj-cx4000gj/spec.html), [official TOP](https://pro-av.panasonic.net/en/products/aj-cx4000gj/), [official features](https://pro-av.panasonic.net/en/products/aj-cx4000gj/features.html) |

**X2 sensor format genuine source conflict1제품:** NA own page1/5.8-type High Sensitivity MOS/total1.5MP와 own manual p3051.0-type MOS/total20.92MP가 충돌한다. Both effective15.03MP는 일치. Source typo일 것으로 다수결/추측하지 않고 format UNKNOWN. Totalpixel은 현행 canonical field가 없어 조건에 보존. Both raw의 null claims에 reportedClaims/URL/사유를 기록했다. 값이 있는1.0/1/5.8 후보를 strict validate에 넣으면 CONFLICTING_CLAIM_VALUES; accepted known-value source conflict0/기존canonical overwrite0.

X2/X20 weight 차이는 별도 모델이며 실제 conflict로 분류하지 않는다. VX3 PDF interleaved columns도 시각 확인 후 올바른 model/mode로 구분했다. Discovery용 실패 URL/redirect/403/404/cache는 fresh 검증된 출처와 구별했다. 조회 실패가 worker API 실패인 것은 아니다.

주요 UNKNOWN: 전4sensor.sizeMm/IBIS/crop/weather/burst/shutter/battery/releaseDate, X2/CX4000sensor.format, CX4000effectiveMP, CX20/CX4000operating weight/basis, VX3cardSlots/bitDepth/log/fractionalFPS, CX20log, LCD 미확정 mechanism 및 CX4000dots/EVF. Null claim25개는 제출 observation 집계이며 canonical 모든 null leaf 전수 감사 숫자는 아니다.

Raw-helper 자동 실제 UTC13개: **2026-10-07T02:23:14.955Z–2026-10-07T02:23:14.975Z**. ClockBefore/After 및 ISO round-trip 검증을 checkpoint에 저장했다. 날짜를 자정으로 만들지 않았으며 모든 밀리초 UTC timestamp는 생성 시점의 실제 clock이다. 원문 fetch 시각은 availabilitySources에 별도로 기록한다. 기존 artifact accessedAt/digest semantics는 변경하지 않는다.

## Cheap-worker / 직접 검토

제품별 stable독립4task, public official excerpt+최소 contract만 전달. 코드/canonical 전체/config/secret 전송 없음. 실제 API5attempts, finalsuccess4, needs_information1, retry1, API/network failure0. Dry-run은 API attempt가 아니다. X2만 동일 task ID로 허용된 retry1회, 그 이후 추가 호출 없음. Worker patch 적용0, fixture4개 삭제/Git미포함.

| 제품 | attempt / status | input | output | total |
| --- | --- | ---: | ---: | ---: |
| VX3 | 1 success |4933|1011|5944|
| CX20 | 1 success |3260|1015|4275|
| X2 | 1 needs_information |6387|1276|7663|
| X2 | 2 success |6410|472|6882|
| CX4000 | 1 success |2802|853|3655|
| **합계** | actual5attempts |**23792**|**4627**|**28419**|

X2 product 합계12797input/1748output/14545total. Task IDs는 `panasonic-production-005-{vx3,cx20,x2,cx4000}`. Cost estimate는 제공되지 않았다.

유용한 경고: source sensor 충돌, optical≠IBIS, type→mm추정 금지, operating accessory 구성, shared PDF의 열 구분, region/mode 조건. 채택하지 않은 제안: X2/X20 동일모델·지역variant 의심, VX3 column오독의 sourceconflict, source에 없는 per-slot 의미 추정. CX20의 초기 interchangeable 의문도 부모가 integral lens 확인 후 fixed로 판단. 발췌에서 누락된 LCD/media/recording matrix는 부모가 전체 공식 표를 따로 검토했다.

GPT-6.1 Sol이 identity4/scope4, B4/shape vocab2, sensor conflict/UNKNOWN, 렌즈/무게/영상/저장/지역source,13sources/100observations/85paths, diff/summary/approval/apply를 직접 검토했다. PDF p37/p39(VX3), p304/p305/p147(X2) 표의 시각 확인과 V-Log X2-only section 확인도 수행했다. 정확한 활동 시간 계측은 없으며 사용자에게 추가 질문/승인 요청0회. Worker 반환은 보조 제안으로 취급했다.

## 최소 변경 / 부족한 계약 / 후속 후보

Semantic vocabulary 변경은 B4 mount와 camcorder bodyStyle2개. Identity-map4exactcodes,새checkpoint/artifacts, 관련tests/docs와 pipeline의 canonical output만 변경. SchemaVersion/product shape/validators/merge/raw-helper/engine/UI의 코드 변경0. Vocab 파일은 승인 전에 JSON재직렬화되어 whitespace diff가 크지만 기존 의미는 불변이며 승인 후 bytes를 바꾸지 않는다.

잘 수용된 부분: fixed/interchangeable, exactlensrange, dimensions, 공식기준 무게, conditionalvideo, media/combo slots, source/field provenance, UNKNOWN 및atomic/idempotent flow.

부족/후속 후보:

- operating/accessory configurations가 불완전할 때 대표 weight UNKNOWN 필요. Body-only란 integral lens를 떼어냈다는 뜻이 아니다.
- lens OIS/hybrid/zoom/filter/ND/XLR/SDI/network 및 recording matrix의 전용 feature schema 부재.
- 단일video.max를 소비하는 경로는 codec/internal/output/firmware/thermal 등conditions를 직접 표시하지 못함. 기존 fractionalfps parser의59.94→94 오독 위험도 후속.
- B4 lens pool/price/legacy performance 없으므로 기존 nonfixed body+lens 후보가 B4kit를 완성하지 못한다. Ingestion 차단 사유는 아니지만 추천 완성 선언은 불가.
- UI family/type는 fixed를 compact/똑딱이, interchangeable을 mirrorless로 표시하는 기존 fallback이 있어 camcorder 오표기. camcorder design preference도 없음. 이번에 수정하지 않았다.
- 1/2.5-type 등 format fallback의 기존 sensor 비교 지원 부족; optical format을 physicalmm로 보완하지 않는다.

새 production pipeline blocking bug0. Pilot에서는 두 기존 audit 테스트가 **현재 vocab bytes/style 목록이 과거와 영원히 같다고 가정**하여 실패했다. Sealed journal/approval/evidence/digest/transaction replay 검증은 유지하고, 현재 registry는 기존 entries가 동일한 append-only 확장인지 비교하도록 최소 수정했다. Old Fuji/Nikon artifact/digest 값을 고치거나 validator를 완화하지 않았다. AJ TOP zero-observation draft는 승인 전 source graph 연결을 검토하여 공식 V-Log claim+identity조건을 연결하고 final13sources로 재검증했다. 승인되지 않은 초안만 정리했으며 과거 artifact 변경 없음.

## 검증 / 남은 작업

- 전체 **234/234**
- Objective/production/catalog/coverage **207/207**
- Panasonic **42/42**, 신규 camcorder **9/9**, 기존 Fuji/Nikon audit compatibility **13/13**
- Canonical validation **139/36/175 valid**
- pnpm build 통과; 기존500kB chunk경고 유지
- node --check Objective6scripts+변경test4개 **10files 통과**
- git diff --check 통과
- 실제 idempotent reapply **already-canonicalized/canonicalMatches:true**
- Old135bodies/36lenses unchanged, pricepromotion0, source count3/3/3/4, helper13timestamps, runtime fixed3weight no-double-count 회귀 통과

이번4제품 ingestion 범위 미완료0. 필드 UNKNOWN/표현 backlog는 명시적으로 남는다. Camcorder 미처리 **7**: **HC-V900,HC-VX1,AG-CX370,HC-X1200,HC-X2100,HC-X1600,HC-X20**. PTZ10/studio5는 기존 deferred scope 유지, 이번 분모에 넣지 않는다. S/G/compact 미처리0은 이전 완료checkpoint 기준.

**남은7개 단일 batch는 기술적으로 가능**: handheld fixed3개 및 B4shoulder까지 pilot이 기존shape/minimalvocab 안에서 통과했고, 제품마다 independent worker/source/claim/review 후 하나의atomictransaction으로 묶을 수 있다. 다만 pilot은 나머지7모델 자체의 호환성 검증을 대신하지 않으며 각 source/weight/video 기준을 확인해야 한다. 같은조건검토 효율과 source충돌/usage한도 대응을 위해 실무상 **consumer2(HC-V900/HC-VX1) + professional5(AG-CX370/HC-X1200/HC-X2100/HC-X1600/HC-X20)** 두 subgroup을 권장한다. 구조적으로 불가능해서 나누어야 하는 잔여 제품은 현재 확인된 바 없다. 다음 세션은 완료batch status/digest/commit부터 확인하고 남은제품 공식current/source 검토부터 시작한다.
