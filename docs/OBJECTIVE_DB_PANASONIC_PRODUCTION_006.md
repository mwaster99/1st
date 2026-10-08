# Panasonic camcorder production batch 006 — 2026-10-08

완료: 지정된 7제품을 독립 worker/raw/staging/diff item으로 검토하고 **단일 7제품 atomic transaction**으로 적용했다. 신규7/기존보강0. Canonical **139 bodies/36 lenses/175 total →146/36/182**. 기존139 body와36 lens 동일한 구조/값 유지, 모든 가격 UNKNOWN, 별도 lens product0. 추천/UI/Experience/가격DB/기존 production artifacts/validator/schema/vocab 수정 없음.

## 시작과 scope

Git clean baseline `6bec0de635595373b098c5a85cfe8c7f70e59f24`. 기존 Panasonic inventory, batch001–005, pilot005 보고/회귀, progress, canonical, identity-map, scope, contracts 및 B4/camcorder vocab/LCD/IBIS/weight/focal validators 대조. KR exact product7페이지를 이번에 HTTP200/모델 heading으로 재조회했다. Snapshot은 prior pilot11카드를 보존하면서 **시작 existing4/new7**을 현재 canonical 기준으로 갱신하고 new7의 source recheck를 별도로 기록했다. 한국 공식 listing-based released/current이며 재고 또는 전세계 단종 여부의 보증이 아니다. Consumer2/professional5 모두 in-scope 직접 운용 fixed camcorder. PTZ10/studio5는 별도 deferred family; 이번에 수집/승격하지 않음.

## 제품별 핵심 승격

| 제품 / canonical ID | 센서 format / 유효 MP | actual mm / 35mm equivalent mm / 최대 F | body-only g / 운영 g | 대표 내부 영상 | physical storage |
|---|---|---|---|---|---|
| HC-V900 / panasonic-v900 | 1/2.5-type /8.29 |4.12–98.9 /25–600 /1.8–4 |433 /484 |FHD60p AVCHD H.264 28Mbps VBR |slot count UNKNOWN; SD계열 확인 |
| HC-VX1 / panasonic-vx1 |1/2.5-type /8.29 |4.12–98.9 /25–600 /1.8–4 |428 /UNKNOWN |4K30p MP4 H.264 72Mbps VBR |SD/SDHC/SDXC1 |
| AG-CX370 / panasonic-cx370 |1.0-type /15.03 |8.8–176 /24.5–490 /2.8–4.5 |1900 /UNKNOWN |4K59.94p MOV HEVC42010bit200Mbps |SDHC/SDXC2,UHS-I/II,V90 |
| HC-X1200 / panasonic-x1200 |1/2.5-type /8.29 |4.12–98.9 /25–600 /1.8–4 |800 /UNKNOWN |4K59.94p **MP4** HEVC42010bit**100Mbps** |SDHC/SDXC2,UHS-I |
| HC-X2100 / panasonic-x2100 |1/2.5-type /8.29 |4.12–98.9 /25–600 /1.8–4 |850 /UNKNOWN |4K59.94p MOV HEVC42010bit200Mbps |SDHC/SDXC2,UHS-I |
| HC-X1600 / panasonic-x1600 |1/2.5-type /8.29 |4.12–98.9 /25–600 /1.8–4 |850 /UNKNOWN |4K59.94p MOV HEVC42010bit200Mbps |SDHC/SDXC2,UHS-I |
| HC-X20 / panasonic-x20 |**UNKNOWN (source conflict)** /15.03 |8.8–176 /24.5–490 /2.8–4.5 |2000 /2430 |4K59.94p MOV HEVC42010bit200Mbps |SDHC/SDXC2,UHS-I |

전7 kind fixed/mount null/bodyStyle camcorder/specs.fixedLens; B4 추가 필요 없음. Actual/equivalent 각각 strict mm, aperture wide/tele 독립. Integral lens를 별도 상품/무게/가격으로 만들지 않았다. 기존 시나리오 경로에서도 body weight484/null/null/null/null/null/2430만 한 번 계산한다. Physical sensor sizeMm는 전7 UNKNOWN: inch-type→mm 추정 없음. Optical/hybrid/electronic IS 조건을 보존하고 sensor-shift 근거가 없으므로 전7 IBIS UNKNOWN. Optical zoom24x/20x와 filter62/67mm는 현재 지원 범위 밖이어서 조건 metadata만 사용하며 intelligent/digital zoom과 혼합하지 않았다.

## Consumer 2개와 공유 manual

V900은 VX3와 공유 basic manual의 **V900 전용 우측 열** 및 별도 NA own spec으로 FHD/6.17MP motion·8.29MP16:9 still을 구분. Equivalent 대표25–600은16:9 still이며 video24p25–600, 기타MP4/AVCHD28.9–693.7,4:3still30.6–734.4를 조건에 보존. Worker가 뒤집은 환산 footnote/VX3 motion pixels를 채택하지 않았다. 433g은 hood/battery/SD 제외 integral lens포함,484g은 hood/battery/SD포함 battery-and-card. LCD3inch/1840000dots/touch, 영상 표시영역1550000dots는 별도 조건. Media 확인과 physical slot 수 확인은 분리하여 count UNKNOWN.

VX1은 WXF1/VXF1/VX1/V800 shared manual의 VX1 적용 표기/SDslotB 도식과 own NA spec만 사용. Viewfinder dash로 present false,3inch/460800dots touch. Body428g은 battery/card제외; hood 기준 미명시. 운영무게 UNKNOWN. Shared manual에 해당 weight table이 있다고 가정하지 않았다. Official selected30p integer는29.97로 추정하지 않고 bitdepth/chroma는 worker 추정8bit420을 거절해 UNKNOWN. Own motion-equivalent dash이므로 still25–600을 video에 복사하지 않았다. USB HDD 복사/재생을 별도 slot으로 계산하지 않음.

## Professional 5개와 모델 구분

- CX370 own spec/features: 4K59.94p internal MOV42010bit200M, AVC422400M은29.97/25/23.98 별도, external12G/6GSDI/HDMI422·P2/MXF/VFR/FHDslow120 조건 분리. VLog true, 공식 모든 모드 image-area no crop는 **cropAtMax false**. LCD3.2-type 원문은 inch로 추정하지 않고 sizeInches 미승격;1620000dots/touch, EVF2360000dots. SDXC V90/latest firmware와 microP2 단종 footnote는 조건이며 새 P2 slot을 만들지 않음. 2300g 촬영무게는 card 포함 불명확하여 운영 UNKNOWN;1900g 본체는 hood/battery/accessory제외. ND/4chXLR+mini/audio/GENLOCK/TC/SRT/NDI/streaming 제한은 feature backlog metadata. NDI는 recording/streaming/4Koutput 불가,4Kstreaming은 recording/thumbnail/playback 불가, relay10h/MOV3h 분할 조건 보존.
- X1200/X1600/X2100 shared operating manual: 각 모델명과 weight/dimension 열을 직접 시각 검토. **X1200 MOV 미지원**으로 MP4 HEVC100M, 다른 두 제품 MOV200M을 복사하지 않음. X1200 dims129×93×209/800g, X1600 dims129×93×267/850g, X2100 dims129×159×267/850g. X2100 supplied handle/XLR와 HD3GSDI, X1600 optional handle/XLR와 noSDI, X1200 no supplied handle 구분. NA X1200 공통 handle/eyecup footnote의 잘못된 귀속은 manual 열로 교정. 각 운영1100/1200/1500g은 hood/battery/handle/eyecup 등의 조건으로 보존하되 card 포함 기준이 불분명하여 운영 weight/basis UNKNOWN. X2100/X1600 EVF2360000dots는 present true이며 optional finder 오해 거절. Hybrid IS는 SUPER SLOW 비활성 조건. 외부output/streaming은 슬롯에 포함하지 않음.
- X20/X2 shared manual: **X20 열2000/2430g**을 사용하고 X2의2040/2490g을 복사하지 않음.2430g은 hood/suppliedbattery/eyecup/**twoSDcards**/micholder/2INPUTcaps포함 battery-and-card, fixedlens포함. LCD3.5inch/2760000dots,EVF2360000dots. Internal42010bitMOV200M과 AVC422150M29.97/25/23.98 및 외부HDMI422를 분리. X2-only log/dualcodec section을 X20에 옮기지 않음.

## Conflict / UNKNOWN

HC-X20 NA own spec의 sensor **1/5.8-type /total1.5MP**와 X20 manual의 **1.0-type /total20.92MP**가 실제 모순. Effective15.03MP는 일치하므로 승격, format은 두 source claim을 null로 보류하고 reported값·URL·미해결사유 보존. Known값으로 두 claim을 넣는 regression trial은 **CONFLICTING_CLAIM_VALUES**로 차단. 다른 source value conflict 없음. 같은 source가 identity만 증명해도 공식 source count에 포함한다. 전체 raw21/observations166=known125/UNKNOWN41, unique157paths/verified fieldEvidence117paths. Human diff의 new-product category가 null도 new로 집계하므로 summary의 unknown0을 실제 UNKNOWN0으로 해석하지 않았다.

주요 UNKNOWN: 전7physicalmm/IBIS/가격/AF/배터리성능·미수집필드, X20sensorformat, VX1/CX370 및 trio 3개의 운영 weight/basis, V900slotcount, consumerbitdepth/chroma와 실제fractionalrate, 대부분log/crop/thermal, LCDmechanism등 공식선정근거 없는 값. Schema 밖 zoom/filter/ND/SDI/XLR/network/recordingmatrix를 별도 field로 확장하지 않았다.

## Worker — 실제 DeepSeek 7개 독립 task

| 제품 | input | output | total | API attempts / 결과 |
|---|---:|---:|---:|---|
| V900 |3344|728|4072|1 success |
| VX1 |2757|552|3309|1 success |
| CX370 |4244|710|4954|1 success |
| X1200 |4118|338|4456|1 success |
| X2100 |4607|700|5307|1 success |
| X1600 |4400|555|4955|1 success |
| X20 |11436|1316|12752|2: MALFORMED_RESPONSE →same-ID retry success |
| **합계** |**34906**|**4899**|**39805**|**8 calls,7 final success,1 failure,1 retry** |

X20실패5716/1000/6716 +retry5720/316/6036 모두 비용에 포함. Dry-run7은 API아님. Networkfailure0. Public product-specific official excerpts와 minimum schema만 보내고 canonical/projectcode/config/secret은 전송하지 않았다. Worker returned patches/files0, 제안 코드를 실행/적용하지 않음. Temporary root fixtures7개 삭제/Git제외. 유용성은 source/model 혼동·조건 누락 경고와 extraction 보조이며 자동 정답 채택 아님. V900환산footnote, VX1bitdepth추정, CX370“SDI-less”, X2100optionalEVF, trio unlabeledcolumn 경고의 오해를 main이 원표로 교정. Main GPT-6.1Sol이7identity/current/source/sensor/fixedlens/weight/video/storage/UNKNOWN/conflict/166claims/diff/approval/apply를 판단; 공식 sharedPDF 선택표를 시각 확인. 사용자 추가개입0회, 작업시간은 측정하지 않았다.

## 새 문제와 apply 이전 영향 검토

1. Main raw draft reviewedAt이 fullISOtimestamp여서 기존 **YYYY-MM-DD review contract**에 거절. Unapproved21draft만 date로 교정하고 helper자동 accessedAt을 재생성한 후 모든 gate 재실행. 과거 sealedartifact 무변경.
2. Main CX370 cropAtMax를 숫자1로 작성한 초안이 staging validate를 통과하고 **verifyIncoming preapproval review**에서 Invalid boolean으로 차단. 기존 canonical 계약을 확인해 false로 교정하고 해당 unapprovedraw1개 교체→normalize/validate/diff/직접검토 재실행. 다른6개 crop은 null, 전7후보 verifyIncoming/validateCanonical 통과. 의미 왜곡/범위확장 없이 적용 가능함을 확인. **Ingestion bool contract reuse는 별도 소규모 후속 validator 작업**으로 남긴다. 이번에 validator/schema/엔진을 변경하지 않았다. Regression은 기존 merge boolean계약이1을거절/false허용하는 것을 확인한다.
3. 기존 video.max 소비경로는 조건/recordingmatrix/fractionalfps를 완전히 표현하지 못함. 이번엔 metadata보존만 하며 추천 parser 수정 없음. Feature/backlog/불명확한 operating config도 후속 표현 후보; batch blocker로 억지 schema 확장 없음.
4. New regression draft가 fileFormat을 container로 잘못 참조해 최초8/9; 실제metadata키에 맞춰 test교정 후 전부통과. Data변경으로 테스트를 맞추지 않음. 외부 AU공유manual403은 채택하지 않고 공식 NA공유manual을 사용.

## Pipeline / evidence / 검증

Official multi-source →독립 worker →raw-helper →normalize →strictvalidate7/7 →human-readable summary와 조건/UNKNOWN/main candidate 검토 →explicit CLIapproval →단일atomicapply →canonicalvalidation →**실제reapply already-canonicalized/canonicalMatches:true**. Negative actualproduction trials: weight required/invalid/mismatch, IBISfalse, LCDfree-angle, focalmissing/unsupported, knownsourceconflict 모두 차단. Archivecompatibility 신규production 사용없음.

- Approval `approval-78f06f4827b4706eef9136d0de81663a3ffa407e1545fa81849c4378c3e56ac3`, cli-explicit.
- Diff digest `62846c2d807da269aa27aa52aed84c243241932d5ab657e4694a24b0af023bfd`.
- Before digest `7e1911e29c83bdee9ebb39df0f21bc1b01558cfc2f781207028237f4194562cc`.
- After digest `2470956cd9cd3115713e5b623cfbc3cd74e5aa34a2e22124ec57b92b5d54503c`.
- Raw-helper actualUTC21timestamps **2026-10-08T03:16:06.150Z~2026-10-08T03:21:04.706Z**. Clockbounds/ISOroundtrip/각 content digest/identity-only count 검증. 원페이지 조회시각/hash는 checkpoint availabilitySources에 별도 보존. 날짜00시 생성없음.
- Whole suite **243/243**; Objective/production/catalog/coverage **216/216**; Panasonic/camcorder **51/51**; new camcorder006 **9/9**. 기존5브랜드archive/tests호환유지.
- Canonical **146/36/182 valid**; `pnpm build` 통과(기존500kBchunk경고), `node --check` Objective6modules+newtest1 =**7files**, `git diff --check` 통과.
- `cameraProducts.json`은 productionapply만 변경. Identity-map7추가; 신규 raw21/staging7/diff/approval/transaction/checkpoint/report/test9와progress만 기록. Vocab/B4/bodyStyle불변, 추천/UI/과거production/scope/가격/Experience/lensDB불변.

## 종료 / 재개

이번7범위미완료0. **직접운용camcorder미처리0(11/11)**, 기존S10/G13/compact5도완료checkpoint기준미처리0 →Panasonic직접운용released/current **39/39**, 미처리0. PTZ10/studio5는 별도 deferred; industrial/security는 별도미열거family. 이것은 **full coverage audit 자체의 완료 선언이 아니다**. 다음은 신규productionbatch가 아니라 Panasonic Korea 전체 gallery/category/pagination과canonical/provenance대조 coverage audit이다. Audit에서discovery추가가 생기면별도판단. Boolcropvalidator후속은독립작업이며 UNKNOWN보강도별도phase.

재개checkpoint [panasonic-camcorder-current-2026-10-08.json](../src/data/ingestion/panasonic-camcorder-current-2026-10-08.json), manifest [production-panasonic-bodies-006.json](../src/data/ingestion/batches/production-panasonic-bodies-006.json). 계획의커밋계약에따라 localbatchcommit trailer **Objective-Batch: production-panasonic-bodies-006**, push없음. 현재batch재수집/worker재호출/처음부터재구현하지 않는다. 최종Git clean 여부와commit hash는Git에서조회하며manifest사후hash수정커밋은만들지않는다.

## Source inventory

제품별3개 source, 총21개 provenance문서. 공유PDF는 물리문서URL이같아도 모델귀속별source이며 다른모델값을공유하지 않는다. KRidentity-only1+ownspec1+manual/ownfeatures1. 선택된내용의immutable raw와모델/표locator가증거이며 외부URL의향후변경과분리한다.

### HC-V900 — 3 sources

- [HC-V900 hcv900-kr official reviewed source](https://www.panasonic.co.kr/consumer/xview/Camera/Camcoder/Camcoder/HCV900): source-9bf043509b09f3b7; helper accessedAt 2026-10-08T03:16:06.150Z.
- [HC-V900 v900-spec official reviewed source](https://help.na.panasonic.com/answers/features-and-specifications-camcorder-hc-v900k/): source-fa793d3af3012a06; helper accessedAt 2026-10-08T03:16:06.151Z.
- [HC-V900 v900-manual official reviewed source](https://help.na.panasonic.com/wp-content/uploads/2024/11/HCVX3_Basic-Manual_ENG.pdf): source-11f8946c9180ff32; helper accessedAt 2026-10-08T03:16:06.151Z.

### HC-VX1 — 3 sources

- [HC-VX1 hcvx1-kr official reviewed source](https://www.panasonic.co.kr/consumer/xview/Camera/Camcoder/Camcoder/VX1): source-0f08cca0a1af0b55; helper accessedAt 2026-10-08T03:16:06.151Z.
- [HC-VX1 vx1-spec official reviewed source](https://help.na.panasonic.com/answers/features-and-specifications-camcorder-model-hc-vx1/): source-16d28bae64039580; helper accessedAt 2026-10-08T03:16:06.151Z.
- [HC-VX1 vx1-manual official reviewed source](https://help.na.panasonic.com/wp-content/uploads/2023/02/HCV800_VXF1_VX1_WXF1_DVQP1576ZA_ENG.pdf): source-8d52d0b6efb5f21a; helper accessedAt 2026-10-08T03:16:06.152Z.

### AG-CX370 — 3 sources

- [AG-CX370 agcx370-kr official reviewed source](https://www.panasonic.co.kr/systembiz/xview/BrodcastingSystem/ProfessionalCamcoder/CXSeries/AGCX370): source-8765804aced373bc; helper accessedAt 2026-10-08T03:16:06.152Z.
- [AG-CX370 cx370-spec official reviewed source](https://pro-av.panasonic.net/en/products/ag-cx370/spec.html): source-5526c0c97053eb1c; helper accessedAt 2026-10-08T03:16:06.152Z.
- [AG-CX370 cx370-features official reviewed source](https://pro-av.panasonic.net/en/products/ag-cx370/features.html): source-b5f176d664866548; helper accessedAt 2026-10-08T03:21:04.706Z.

### HC-X1200 — 3 sources

- [HC-X1200 hcx1200-kr official reviewed source](https://www.panasonic.co.kr/systembiz/xview/BrodcastingSystem/ProfessionalCamcoder/Camcorder/HCX1200): source-70a1926e2adc3ad4; helper accessedAt 2026-10-08T03:16:06.152Z.
- [HC-X1200 x1200-spec official reviewed source](https://help.na.panasonic.com/answers/features-and-specifications-camcorder-hc-x1200/): source-d6c41bdb9a2206e8; helper accessedAt 2026-10-08T03:16:06.152Z.
- [HC-X1200 trio-na-manual official reviewed source](https://help.na.panasonic.com/wp-content/uploads/2025/03/HCX1200_X1600_X2100_OperatingInstructions_ENG.pdf): source-2e6bbdb4a3ae32dd; helper accessedAt 2026-10-08T03:16:06.153Z.

### HC-X2100 — 3 sources

- [HC-X2100 hcx2100-kr official reviewed source](https://www.panasonic.co.kr/systembiz/xview/BrodcastingSystem/ProfessionalCamcoder/Camcorder/HCX2100): source-e529dec86fbcd424; helper accessedAt 2026-10-08T03:16:06.153Z.
- [HC-X2100 x2100-spec official reviewed source](https://help.na.panasonic.com/answers/features-and-specifications-camcorder-hc-x2100/): source-77b3d999190d5ef7; helper accessedAt 2026-10-08T03:16:06.153Z.
- [HC-X2100 trio-na-manual official reviewed source](https://help.na.panasonic.com/wp-content/uploads/2025/03/HCX1200_X1600_X2100_OperatingInstructions_ENG.pdf): source-aaef96299b559ba5; helper accessedAt 2026-10-08T03:16:06.153Z.

### HC-X1600 — 3 sources

- [HC-X1600 hcx1600-kr official reviewed source](https://www.panasonic.co.kr/systembiz/xview/BrodcastingSystem/ProfessionalCamcoder/Camcorder/HCX1600): source-9fc6c6645cc25e57; helper accessedAt 2026-10-08T03:16:06.153Z.
- [HC-X1600 x1600-spec official reviewed source](https://help.na.panasonic.com/answers/features-and-specifications-camcorder-hc-x1600/): source-64c071b25e9f3b8c; helper accessedAt 2026-10-08T03:16:06.153Z.
- [HC-X1600 trio-na-manual official reviewed source](https://help.na.panasonic.com/wp-content/uploads/2025/03/HCX1200_X1600_X2100_OperatingInstructions_ENG.pdf): source-c61f83ab1f57485c; helper accessedAt 2026-10-08T03:16:06.154Z.

### HC-X20 — 3 sources

- [HC-X20 hcx20-kr official reviewed source](https://www.panasonic.co.kr/systembiz/xview/BrodcastingSystem/ProfessionalCamcoder/Camcorder/HCX20): source-34d88a2e622dfa48; helper accessedAt 2026-10-08T03:16:06.154Z.
- [HC-X20 x20-spec official reviewed source](https://help.na.panasonic.com/answers/features-and-specifications-camcorder-model-hc-x20/): source-ae31018df810b293; helper accessedAt 2026-10-08T03:16:06.154Z.
- [HC-X20 x20-manual official reviewed source](https://help.na.panasonic.com/wp-content/uploads/2023/02/HCX2_X20_DVQP2766ZA_ENG.pdf): source-738ba5d5ca3689e8; helper accessedAt 2026-10-08T03:16:06.154Z.
