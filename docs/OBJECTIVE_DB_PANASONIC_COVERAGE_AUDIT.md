# Panasonic/LUMIX Objective DB production coverage audit

2026-10-08. **Panasonic Korea 현행 직접 운용 camera/camcorder product coverage를 1차 완료로 판정한다.** 공식 49카드 → 39 base identity + 연결 variant 10; released/current·canonical·production provenance 각각 39, 미처리/중복/모호/critical 모두 0. 알려진 사양 803 leaf 전부 verified production fieldEvidence로 연결된다. 이는 모든 사양이 채워졌거나 추천 구성이 완성됐다는 뜻은 아니다. 후속 보강 18개, 명시적으로 감사한 UNKNOWN 134개와 기능 표현 backlog가 남는다.

시작 working tree clean, baseline `f62a24bf9671290c56b2c563feb3ef9ea033ede9`. Canonical **146 bodies / 36 lenses / 182 total** 불변, SHA-256 `2470956cd9cd3115713e5b623cfbc3cd74e5aa34a2e22124ec57b92b5d54503c`. 새 ingestion·cheap-worker 호출 없이 기존 production을 read-only replay했다. 새 감사 JSON·문서·테스트와 기존 catalog-scope의 Panasonic 두 가족 metadata/진행 기록만 변경한다. 과거 inventory와 sealed artifact, canonical, validators, vocab/identity-map, 추천/UI는 변경하지 않는다.

## 공식 inventory 재조회와 denominator

[감사 checkpoint](../src/data/ingestion/panasonic-coverage-audit-2026-10-08.json)에 107개 실제 공식 조회의 URL/method/POST params/HTTP status/accessedAt/response SHA-256, 11개 gallery의 전체 페이지 및 마지막 빈 페이지, 카드별 product heading 확인을 기록했다. 원래 [2026-10-06 snapshot](../src/data/ingestion/panasonic-current-camera-gallery-2026-10-06.json)은 보존했다. API는 live gallery의 cate1/2/3, psize=9, ppage 순차 요청으로 확인했으며 요청 종료 빈 List까지 확인했다. 전 요청 HTTP200.

| 직접 운용 family | 공식 카드 | base | linked variant |
|---|---:|---:|---:|
| [LUMIX S](https://www.panasonic.co.kr/consumer/xlist/Camera/Camera/LumixS) | 13 | 10 | 3 |
| [LUMIX G](https://www.panasonic.co.kr/consumer/xlist/Camera/Camera/LumixG) | 20 | 13 | 7 |
| [Compact](https://www.panasonic.co.kr/consumer/xlist/Camera/Camera/Lumix) | 5 | 5 | 0 |
| [Consumer camcorder](https://www.panasonic.co.kr/consumer/xlist/Camera/Camcoder/Camcoder) | 3 | 3 | 0 |
| [Professional CX](https://www.panasonic.co.kr/systembiz/xlist/BrodcastingSystem/ProfessionalCamcoder/CXSeries) | 3 | 3 | 0 |
| [Professional camcorder](https://www.panasonic.co.kr/systembiz/xlist/BrodcastingSystem/ProfessionalCamcoder/Camcorder) | 5 | 5 | 0 |
| **직접 운용 합계** | **49** | **39** | **10** |

별도 denominator 밖: **PTZ 10 / studio 5**. 두 수치를 직접 운용 coverage에 합치지 않는다. Canonical에 존재하는 Panasonic GX85는 이번 KR 현행 목록 밖이며, Panasonic canonical 전체 40개와 현행 감사 39개를 구분한다.

별도 카드 추가/제거, 제품명 변화, base/kit/color 연결 변화, 발견된 출시상태 변화 모두 0. Released/current는 원 inventory의 실제 전달된 operating/spec/support/launch 근거와 sealed production sources를 fresh retained card/heading에 대조한 판단이다. 카드 노출만으로 출시를 판정하지 않았고, 새 제품 페이지 텍스트에서 upcoming 표기는 발견하지 않았다. 재고/전 세계 생산 지속을 보증하지 않는다. S9 한 카드 안의 11 color swatch는 독립 카드로 세지 않는다. 원 snapshot에 inline swatch 목록이 없어 그 세부 변경 여부는 비교 불가로 명시했다.

## Card → identity → production

각 base에 정확히 하나의 reviewed manufacturer model code와 canonical ID, batch001–006 manifest item이 연결된다. 39개 모두 in-scope/released-current/canonicalized. Variant는 canonical-base-linked-variant이며 productionBatch는 null, coverageViaBaseBatch와 baseCardKey로 완료된 base를 참조한다. 과거 snapshot identityGroup의 표시용 ID 철자와 실제 canonical ID가 다른 경우에도 exact manufacturerModelCode → reviewed identity-map으로 해석했고 기억/유사명으로 병합하지 않았다.

| linked card | 종류 | base card | canonical ID |
|---|---|---|---|
| CS10006 (DC-S5KGD-K) | kit | DC-S5GD-K | panasonic-s5 |
| CS10001 (DC-S1GD-K) | kit | CS10003 | panasonic-s1 |
| CS10004 (DC-S1RGD-K) | kit | CS10005 | panasonic-s1r |
| CDC1205 (DC-G100VGD) | kit | CDC1204 | panasonic-g100 |
| GH5M2 (DC-GH5M2) | kit | GH5M2L | panasonic-gh5-ii |
| CDC1213 (DC-GX9GD(바디킷-블랙)) | color | CDC1214 | panasonic-gx9 |
| CDC1210 (DC-GF10KGD(화이트)) | color | CDC1209 | panasonic-gf10 |
| CDC1208 (DC-GF10KGD(오렌지)) | color | CDC1209 | panasonic-gf10 |
| CDC1207 (DC-GF10KGD(실버)) | color | CDC1209 | panasonic-gf10 |
| CDC1206 (DC-GF10KGD(블랙)) | color | CDC1209 | panasonic-gf10 |

S1/II/IIE, S1R/II, S5/II/IIX, G9/II, G100/D, GH5/II/S, HX/CX/VX 모델은 독립 ID/사양을 유지한다. DC-L10은 과거 DMC-L10 DSLR과 다른 fixed 제품이며 DMC-L10 alias가 없다. Canonical alias collision/duplicate/ambiguous mapping 모두 0.

| 제품 | canonical ID | batch | 공식 source | verified paths | known/verified leaf |
|---|---|---|---:|---:|---:|
| LUMIX S9 | panasonic-s9 | 002 | 3 | 16 | 19/19 |
| LUMIX S5 | panasonic-s5 | 002 | 3 | 21 | 25/25 |
| LUMIX S1IIE | panasonic-s1-iie | 002 | 4 | 21 | 25/25 |
| LUMIX S1II | panasonic-s1-ii | 002 | 4 | 21 | 25/25 |
| LUMIX S1RII | panasonic-s1r-ii | 001 | 3 | 16 | 19/19 |
| LUMIX S1R | panasonic-s1r | 002 | 3 | 19 | 23/23 |
| LUMIX S1 | panasonic-s1 | 002 | 3 | 20 | 24/24 |
| LUMIX S5IIX | panasonic-s5-iix | 002 | 2 | 21 | 25/25 |
| LUMIX S5 II | panasonic-s5-ii | 001 | 3 | 17 | 21/21 |
| LUMIX S1H | panasonic-s1h | 002 | 3 | 21 | 25/25 |
| LUMIX GH7 | panasonic-gh7 | 001 | 4 | 17 | 21/21 |
| LUMIX G100D | panasonic-g100d | 001 | 2 | 14 | 14/14 |
| LUMIX G9 II | panasonic-g9-ii | 003 | 4 | 21 | 25/25 |
| LUMIX G85 | panasonic-g85 | 003 | 3 | 16 | 17/17 |
| LUMIX G100 | panasonic-g100 | 003 | 3 | 14 | 14/14 |
| LUMIX GH6 | panasonic-gh6 | 003 | 3 | 21 | 25/25 |
| LUMIX GH5II | panasonic-gh5-ii | 003 | 2 | 20 | 24/24 |
| LUMIX GH5 | panasonic-gh5 | 003 | 3 | 20 | 24/24 |
| LUMIX G9 | panasonic-g9 | 003 | 3 | 19 | 21/21 |
| LUMIX G95 | panasonic-g95 | 003 | 2 | 17 | 20/20 |
| LUMIX GF10 | panasonic-gf10 | 003 | 2 | 12 | 12/12 |
| LUMIX GX9 | panasonic-gx9 | 003 | 3 | 17 | 18/18 |
| LUMIX GH5S | panasonic-gh5s | 003 | 4 | 17 | 19/19 |
| LUMIX L10 | panasonic-l10 | 004 | 3 | 26 | 26/26 |
| LUMIX TZ300 | panasonic-tz300 | 004 | 3 | 18 | 18/18 |
| LUMIX TZ99 | panasonic-tz99 | 001 | 2 | 13 | 13/13 |
| LUMIX LX100 II | panasonic-lx100-ii | 004 | 3 | 19 | 19/19 |
| LUMIX LX10 | panasonic-lx10 | 004 | 2 | 19 | 19/19 |
| HC-VX3 | panasonic-vx3 | 005 | 3 | 16 | 19/19 |
| HC-V900 | panasonic-v900 | 006 | 3 | 16 | 19/19 |
| HC-VX1 | panasonic-vx1 | 006 | 3 | 14 | 18/18 |
| AG-CX370 | panasonic-cx370 | 006 | 3 | 19 | 23/23 |
| AG-CX20 | panasonic-cx20 | 005 | 3 | 18 | 23/23 |
| AJ-CX4000 | panasonic-cx4000 | 005 | 4 | 9 | 12/12 |
| HC-X1200 | panasonic-x1200 | 006 | 3 | 16 | 20/20 |
| HC-X2100 | panasonic-x2100 | 006 | 3 | 17 | 22/22 |
| HC-X1600 | panasonic-x1600 | 006 | 3 | 17 | 22/22 |
| HC-X20 | panasonic-x20 | 006 | 3 | 18 | 22/22 |
| HC-X2 | panasonic-x2 | 005 | 3 | 19 | 23/23 |

Source 수에는 identity-only source도 실제 제품 연결이면 포함한다. 총111은 제품별 raw source 연결 수이며 unique URL 수가 아니다.

## Provenance 통계와 finding 기준

Spec leaf는 null/absent 제외, scalar와 배열은 각각 하나, 객체는 children으로 펼친다. 검증된 parent object fieldEvidence는 그 child leaf를 덮을 수 있다. FieldEvidence claimIds를 실제 staging claim/sourceId/path/value/verification와 대조했고 canonical 제조사 sources의 fields 연결도 확인했다.

| 통계 | 수 |
|---|---:|
| Known objective leaf | 803 |
| Verified known leaf | 803 |
| Manufacturer-reference-only | 0 |
| Legacy-only | 0 |
| Unclassified/source-less known leaf | 0 |
| Verified fieldEvidence paths | 692 |
| Production claims (UNKNOWN 포함) | 838 |
| 제품별 raw source 연결 | 111 |
| 전용 structured identityEvidence | 35/39 |

기존 canonical 보강 S9/S5II/GH7/G9II의 전용 identityEvidence는 없는 상태지만 reviewed identity-map·production sources·manifest·승인으로 identity는 추적 가능하다. 이를 structured identity 완료 39로 부풀리지 않고 **metadata 보강 4개**로 분류한다. 39 production provenance 완료와 35 structured identity object는 다른 지표다. 기존 same-value/new-evidence/null-fill 및 G9II25.2→25.21MP 정밀도 conflict의 명시승인도 artifact에 남아 있다.

**Critical 0. Should-fix 18**: identityEvidence 4 + physical cardSlots UNKNOWN 14. 이번 audit에서 채우지 않는다.

| 제품 | path | 후속 보강 |
|---|---|---|
| panasonic-s9 | identityEvidence | Reviewed map/production identity 존재; 전용 structured identityEvidence 없음 |
| panasonic-s9 | specs.cardSlots | Physical slot/media UNKNOWN; 제품별 공식 manual 추가 검토 후보 |
| panasonic-s5-ii | identityEvidence | Reviewed map/production identity 존재; 전용 structured identityEvidence 없음 |
| panasonic-gh7 | identityEvidence | Reviewed map/production identity 존재; 전용 structured identityEvidence 없음 |
| panasonic-g100d | specs.cardSlots | Physical slot/media UNKNOWN; 제품별 공식 manual 추가 검토 후보 |
| panasonic-g9-ii | identityEvidence | Reviewed map/production identity 존재; 전용 structured identityEvidence 없음 |
| panasonic-g85 | specs.cardSlots | Physical slot/media UNKNOWN; 제품별 공식 manual 추가 검토 후보 |
| panasonic-g100 | specs.cardSlots | Physical slot/media UNKNOWN; 제품별 공식 manual 추가 검토 후보 |
| panasonic-g95 | specs.cardSlots | Physical slot/media UNKNOWN; 제품별 공식 manual 추가 검토 후보 |
| panasonic-gf10 | specs.cardSlots | Physical slot/media UNKNOWN; 제품별 공식 manual 추가 검토 후보 |
| panasonic-gx9 | specs.cardSlots | Physical slot/media UNKNOWN; 제품별 공식 manual 추가 검토 후보 |
| panasonic-l10 | specs.cardSlots | Physical slot/media UNKNOWN; 제품별 공식 manual 추가 검토 후보 |
| panasonic-tz300 | specs.cardSlots | Physical slot/media UNKNOWN; 제품별 공식 manual 추가 검토 후보 |
| panasonic-tz99 | specs.cardSlots | Physical slot/media UNKNOWN; 제품별 공식 manual 추가 검토 후보 |
| panasonic-lx100-ii | specs.cardSlots | Physical slot/media UNKNOWN; 제품별 공식 manual 추가 검토 후보 |
| panasonic-lx10 | specs.cardSlots | Physical slot/media UNKNOWN; 제품별 공식 manual 추가 검토 후보 |
| panasonic-vx3 | specs.cardSlots | Physical slot/media UNKNOWN; 제품별 공식 manual 추가 검토 후보 |
| panasonic-v900 | specs.cardSlots | Physical slot/media UNKNOWN; 제품별 공식 manual 추가 검토 후보 |

**Acceptable UNKNOWN 134**는 이번에 명시적으로 감사한 productId:path 쌍이다. 가격·미수집 AF/EVF/battery/shutter/release 등 모든 JSON null을 총조사한 수가 아니며 다른 브랜드 감사와 직접 비교하지 않는다. Parent IBIS가 null이면 stops를 중복 집계하지 않고, GH5S의 명시적 IBIS 없음에 따른 stops는 not applicable로 제외한다. Camcorder 사진 burst도 제외한다. 공식 근거/조건/대표 측정 기준이 부족하거나 진짜 source conflict인 경우 UNKNOWN 유지가 적절하다.

| 감사 UNKNOWN field | 수 |
|---|---:|
| specs.sensor.sizeMm | 27 |
| specs.burst.maxMechanicalFps | 9 |
| specs.ibis.stops | 4 |
| specs.lcd | 4 |
| specs.video.log | 19 |
| specs.video.cropAtMax | 22 |
| specs.ibis | 19 |
| specs.video.bitDepth | 13 |
| specs.burst.maxElectronicFps | 5 |
| specs.weight | 8 |
| specs.sensor.format | 3 |
| specs.sensor.megapixels | 1 |

개별 reason과 staging UNKNOWN 경로는 감사 JSON 참조. Unknown이 존재한다고 product coverage 미처리로 세지 않는다.

## LUMIX S/G와 stabilization

S10 전부 interchangeable/L-Mount, G13 전부 interchangeable/Micro Four Thirds. S1II 부분적층24.1MP와 S1IIE BSI24.2MP 등 세대별 값 독립. G9II25.21MP의 기존 rounded25.2 수정은 batch003에서 명시승인된 정밀도 보강이며 이번에 값을 다시 변경하지 않았다.

Body BIS와 Dual I.S. combined 등급은 claim conditions에서 구분된다. S9/S5/S5II/IIX body5와 combined6.5를 혼동하지 않았고 S1II/IIE body center8/periphery7 조건, S1/S1R firmware>=1.2 body6/combined6.5 조건을 보존했다. G9II body8/combined7.5, GH7 별도 측정 렌즈, GH5/II/S 차이를 유지한다. GH5S bodyIS 없음은 false object; G100/D/GF10은 lens/hybrid/digital 근거에서 sensor-shift IBIS를 추정하지 않고 null. G85/G9/GX9 body 존재만 확인된 경우 axes/stops를 억지로 채우지 않았다. Compact5와 camcorder11 전부 IBIS UNKNOWN으로, optical/hybrid를 body IBIS로 승격한 사례 0.

## Compact / fixed / camcorder / B4

Fixed 총15 = compact5 + camcorder10. 전부 kind fixed/mount null/specs.fixedLens. Actual focal과 35mm equivalent는 독립 경로이며 raw/staging/diff 모두 mm, default strict validate를 통과한다. 별도 interchangeable lens product 생성0. Runtime integrated lens의 weight/newPrice/usedPrice null, includedInBodyId 명시; 실제 scenario 평가에서도 전체 카메라 무게를 한 번만 사용한다. Fixed unknown whole weight를 body-only weight로 대체해서 추정하지 않는다.

Compact actual→equivalent: TZ99 4.3–129→24–720, DC-L10 10.9–34→24–75, TZ300 8.8–132→24–360, LX100II 10.9–34→24–75, LX10 8.8–26.4→24–72mm. Aperture wide/tele 유지, multi-aspect/still/video 환산 조건은 claim metadata에 남는다. LX100II292/392g 공식 operating weight 불일치는 양 source 보고/URL을 보존하고 weight/basis null; body-only350g은 별개 근거다.

Camcorder11 모두 bodyStyle camcorder. VX3/V900/VX1, CX370/CX20/CX4000, X1200/X2100/X1600/X20/X2 별도 identity이며 shared manual 모델 열과 recording/storage 조건을 구분한다. Optical/hybrid IS는 IBIS null과 별개 조건으로 보존한다.

AJ-CX4000은 **interchangeable/B4/fixedLens null**, 공식 B4/2/3-type bayonet 근거가 source에 연결된다. 2/3 mount image circle을 sensor physical mm/format으로 추정하지 않아 format/megapixels/sizeMm null. B4 alias는 기존 최소 두 표현(B4 lens mount, 2/3-type bayonet), 다른 mount와 충돌0. Body-only3400g에서 별도 렌즈·배터리·optional EVF 제외, operating UNKNOWN. Slot3은 expressP2 1 + microP2/SDXC 2 물리슬롯이고 저장 형식을 슬롯으로 추가하지 않았다. 현재 B4 lens pool0은 product coverage와 다른 추천 구성 backlog다.

## Weight / sensor / video / validators

Known weight claim마다 기존 basis 계약을 strict validate로 확인했다. VX3/V900484g은 battery/card 포함, body-only433g. X2 2040/2490g과 X20 2000/2430g은 별개 열이며 twoSD/accessory 조건 보존. VX1/CX20/CX370/X1200/X1600/X2100/AJ는 card/accessory 조건이 기존 weightBasis를 충족하지 않으면 operating UNKNOWN 유지. Hood/handle/eyecup/optional accessory 포함 여부는 claims에 남고 integral fixed lens는 camera mass에 이미 포함된다.

Physical sizeMm UNKNOWN27. Optical1.0/1/2.5/2/3-type를 임의 mm로 환산하지 않았다. S1II/IIE NA35.8×23.8 vs JP35.6×23.8mm는 양 source null claims의 reportedHereMm/otherOfficialMm/URL로 보존. X2/X20 NA1/5.8 vs manual1.0-type는 format UNKNOWN, effective15.03MP는 일치하는 별개 값. G95LCD 지역1.24M/1.04M 해상도도 승격하지 않았다. 이러한 withholding은 진짜 source conflict를 다수결/최대값으로 덮은 사례가 아니다.

Exact23.98/29.97/59.94가 canonical/raw/staging 및 conditions에 보존된다. Official integer24/30/60p만 제공된 경우 fractional을 추정하지 않고 frameRateLabel/manufacturerFrameRateLabel/sensorOutputFps 또는 actualFractionalFrameRate null을 유지한다. S1/S1R firmware/license, GH5/II6K anamorphic, internal/externalRAW/ProRes/SSD/chroma/codec/paid activation/recordingmedia/thermal/S&Q 조건은 selected-mode claim에 남는다. Procamcorder4K59.94 internalHEVC42010bit, X1200MP4100Mbps와 X1600/X2100MOV200Mbps 및 외부422/SDI/slowmode를 구분했다. Full recording matrix나 single video.max의 조건 소비는 후속 표현 개선이다.

CropAtMax는 true crop/false no-crop/nullUNKNOWN. AG-CX370false 확인; 숫자/string/object/array 잔존0. validate와 merge가 기존 validateCropAtMaxValue helper를 공유하고 새 감사 테스트가 invalid numeric staging/merge 둘 다 거절함을 확인한다. LCD도 validateLcdValue 공통 계약을 사용; DC-L10 공식 free-angle은 conditions.manufacturerMechanism/locator에 남고 canonical vari-angle로 추적 가능. Unsupported enum을 strict staging/merge에서 거절한다. **이번 validator 수정은 없다.**

기존29.97p→97p recommendation/comparison parser 오류는 cross-brand engine backlog다. Exact product 저장값을 잘못 저장한 defect로 계산하지 않으며 이번 수정 대상도 아니다.

## PTZ / studio specialty scope

PTZ10: AW-UE150A, AW-UE160W/K, AW-UE100W/K, AW-UE80W/K, AW-UE50W/K, AW-UE40W/K, AW-HE20W/K, AW-UE20W/K, AW-UE4W, AW-UR100. 한국 공식 high-end/standard/entry/outdoor4gallery와 각10product 페이지를 재조회했다. Motorized remote pan/tilt, installation/controller/network/live output 중심이어서 deferred-special-category를 유지한다. 영구 제외0. Catalog-scope에 모델별 공식 product/gallery URL, 이유와 controller/installation/remote-flow 재검토 조건을 추가했다.

Studio5는 **CCU가 모두 필수라는 가정 없이** 개별로 검토한다. Fresh Korea5cards와 제조사 글로벌 기능/compatibility 자료를 대조했다. 아래 내용은 scope 관찰이며 이번에 canonical spec으로 ingestion하지 않았다.

| 제품 / 공식 근거 | mount 관찰 | CCU-less/standalone 조건 | 재검토 조건 |
|---|---|---|---|
| [AK-UCX100](https://pro-av.panasonic.net/en/products/ak-ucx100/) | 2/3-type bayonet | Official camera-head 12G-SDI and IP workflows can operate without a CCU; do not mark CCU mandatory. Future firmware capabilities remain conditional. | Review standalone camera-head or shoulder operation with external recorder/power and lens, as well as delivered firmware, before deciding specialty versus general directly-operated ingestion. |
| [AK-UBX100](https://pro-av.panasonic.net/en/products/ak-ubx100/features.html) | B4 / 2/3-type bayonet | Multipurpose box camera supports robot, gimbal, crane and ceiling/rig mounting; CCU necessity is not established and must not be presumed. | Review manual/rig/gimbal operation, external recording and power requirements independently; directly-operated purchase flow could justify later general coverage. |
| [AK-PLV100GSJ](https://pro-av.panasonic.net/en/products/ak-plv100gsj/features.html) | PL | Camera-head 12G-SDI and ST 2110 operation without CCU is explicitly supported; PL lens and Super35 live cinema workflow are distinct from B4 studio cameras. | Review standalone PL cinema/rig workflow and external recorder/power configuration individually, alongside live-system dependencies and delivered features. |
| [AK-UC4000](https://pro-av.panasonic.net/en/products/ak-uc4000/features.html) | B4 | Camera-head HD-SDI output supports 1080p/1080i/720p; CCU enables optical transmission and broader system operation. Do not infer standalone UHD from CCU/system specifications. | Assess shoulder/standalone HD acquisition with external recorder, power and viewfinder, and distinguish CCU UHD operation before scope/field ingestion. |
| [AK-HC3900](https://pro-av.panasonic.net/en/products/ak-hc3900/features.html) | B4 | Camera-head HD-SDI output exists. Paid AK-SFC391 enables CCU-less ST 2110 HD; optional 4K upgrade is a separate system condition, not unconditional camera-head 4K. | Review standalone HD shoulder workflow and paid CCU-less IP configuration separately from optional CCU/4K upgrades and external recorder/power requirements. |

현재는 live system/head/external capture configuration을 일반 추천 흐름으로 충분히 설명하지 못해 deferred로 둔다. Studio shoulder/rig 운용 가능성을 영구 제외 이유로 쓰지 않는다. 다음 specialty phase에서 제품별 외부 recording/power/lens/CCU·IP/paid option 의존성을 재검토하고 직접 운용 일반 coverage로 옮길 수 있다. AJ-CX4000은 사용자가 직접 운용하는 내부 recording camcorder이므로 일반 coverage 유지; 전문용/B4라는 이유만으로 special로 보류하지 않았다. 두 family의 최소 scope metadata만 수정하고 Sony/Canon/Nikon/Fuji scope 기록은 유지한다.

## Batch001–006 sealed artifact 감사

Manifest/item state/last gate, raw digests/sourceId/content digest/UTC, staging/diff, 현재·archive approval, transaction evidence/journal, before/after digest, incomingartifactdigests와 canonical chain 모두 대조했다. **누락0/digest mismatch0**. Baseline은 Fuji003 이후 Panasonic001→006 연속이며 끝 digest는 이번146/36/182 canonical과 같다. 이후 current canonical 확장을 오래된 before/after로 착각하지 않는다.

| Batch | 제품 | raw sources | claims | validate/replay | 누락 / mismatch |
|---|---:|---:|---:|---|---:|
| 001 | 5 | 12 | 80 | strict / replay / idempotent 통과 | 0 / 0 |
| 002 | 8 | 24 | 167 | strict / replay / idempotent 통과 | 0 / 0 |
| 003 | 11 | 30 | 222 | strict / replay / idempotent 통과 | 0 / 0 |
| 004 | 4 | 11 | 103 | strict / replay / idempotent 통과 | 0 / 0 |
| 005 | 4 | 13 | 100 | strict / replay / idempotent 통과 | 0 / 0 |
| 006 | 7 | 21 | 166 | strict / replay / idempotent 통과 | 0 / 0 |

Sealed evidence bundle은 read-only strict verifyIncoming/validateStagingBatch/merge 재현으로 각 after와 일치; after에 동일 승인 재적용해도 동일 canonical이다. 실제 production apply를 다시 실행하지 않았다. Old identity-map은 archive jsonBytes로, old vocab은 각 batch Git commit의 **원래 파일 바이트**로 expected digest를 확인했다. Current appendable registry가 성장한 사실과 원래 artifact 오염을 구분했다. Historical vocab을 임의 JSON 재직렬화해서 byte digest를 비교하지 않는다. Regression은 evidence/journal seal과 registry append-only policy, raw/staging/diff/approval 전체 연결을 계속 검증한다. 기존 Sony/Canon/Nikon/Fuji artifact tests도 유지한다.

## 검증 / 후속 작업

새 Panasonic coverage 회귀11개: 49/39/10 accounting·공식 pagination·identity·known leaf evidence·6batchstrict replay·fixed oneweight·S/Gmount/IS·camcorder/B4·conflictUNKNOWN·crop/LCD gate·special-family·finding 분리. 기존51 Panasonic production/camcorder 테스트는 약화하지 않는다.

| 검증 | 결과 |
|---|---|
| 전체 tests | **261/261** |
| Objective/production/catalog/coverage | **234/234** |
| Panasonic (새 audit11 포함) | **62/62** |
| Camcorder005/006 | **18/18** |
| 새 audit regression | **11/11** |
| Canonical validation | valid / 146 bodies / 36 lenses / 182 total |
| pnpm build | 통과; 기존 500kB bundle 경고 유지 |
| 변경 JS node --check | tests/panasonicCoverageAudit.test.js 통과 |
| git diff --check + 신규 파일 whitespace 확인 | 통과 |
| 6 batch archive strict/idempotent replay | 전부 canonicalMatches true |

Git status: catalog-scope.json / OBJECTIVE_DB_V04_PROGRESS.md 수정, 새 감사 JSON / 이 문서 / panasonicCoverageAudit.test.js 추가. 총5파일이며 commit/push하지 않고 검토 가능한 working tree로 남긴다. Canonical·기존 inventory·sealed production·추천/UI/validator 불변을 최종 diff에서 확인했다.

다음 일반 브랜드는 기존 Panasonic/OM System 수집 순서에 따라 **OM System**을 권장한다. Panasonic 직접 운용 추가 batch는 현재 필요 없고 공식 inventory가 변하면 별도 delta 검토한다. Narrow enrichment(identityEvidence/cardSlots), specialty15 scope 재검토, full video matrix/조건 소비, OIS/DualIS, ND/XLR/SDI/network, accessory weight, B4 lens pool, 가격/Experience는 별도 승인 범위다. 이번 coverage audit 요구는 완료이며 이 backlog를 이번 세션에서 실행하지 않는다.
