# Panasonic/LUMIX compact production batch 004 — 2026-10-07

## 시작 / identity / 적용 전 직접 검토

시작 git clean, baseline `c472892c75c35bc328c5fd02a6e4a782475d28a3`, canonical 바디131/렌즈36/전체167. Batch001~003 manifest·진행 문서·canonical·identity-map·catalog-scope·field contract·Panasonic regression을 대조했다. 원래 inventory와 새 한국 compact gallery API의 exact5 keys(DCL10,DCTZ300,DCTZ99,DC10001,DMC10002)가 일치한다. TZ99는 pilot001 완료 근거로 제외하고 지정된 잔여4개를 유지했다. 신규4/기존보강0.

새 checkpoint: `src/data/ingestion/panasonic-compact-current-gallery-2026-10-07.json`. 원래 inventory와 batch001~003 artifact는 수정하지 않는다. Current는 한국 공식 retained lineup + 출시/운용 근거라는 기존 정책이며, 전 세계 생산 지속/재고 보증이 아니다. S/G/캠코더 숫자는 이전 checkpoint에서 이어받았으며 이번에 브랜드 전체를 다시 audit했다고 주장하지 않는다.

DC-L10 공식 카드/display/code는 DC-L10, 한국 분류 Camera/Camera/Lumix다. [한국2026-06-29 출시 뉴스](https://www.panasonic.co.kr/event/news_view.do?seq=184)가 렌즈 일체형 DC-L10 출시를 명시하고, complete guide p750의 Mount Fixed를 직접 확인했다. Canonical `panasonic-l10`은 신규이며 옛 DMC-L10/L10K Four Thirds DSLR과 다르다. [옛 모델의 공식 렌즈 호환 자료](https://av.jpn.support.panasonic.com/support/global/cs/dsc/connect/l10k.html)를 대조했고 DMC-L10을 alias로 추가하지 않는다. [TZ300 한국 뉴스](https://www.panasonic.co.kr/lumix/news_view_detail.do?cate_code1=&cate_code2=&cate_code3=&seq=198)의 header2026-09-18과 본문2026-05-20/May15출시가 다르지만 출시 완료 근거는 확실하다. Canonical 출시일은 UNKNOWN. TZ300은 TZ99/ZS200의 alias가 아니며 NA 사양의 명시적 NTSC TZ300/ZS300 범위와 own manual p146의 DC-TZ300GD regional row만 사용한다.

## 승격 후보 / UNKNOWN

| 제품 | effective MP / format | actual mm | equivalent mm / 조건 | 최대 조리개 W/T | 전체 운영 g / 본체 g | 영상 대표값 | batch sources / claims / unique fields |
| --- | --- | --- | --- | --- | --- | --- | --- |
| LUMIX L10 / `panasonic-l10` | 20.4MP / 마이크로포서드 | 10.9–34 | 24–75 / multi-aspect still | F1.7–2.8 | 508 / 425 | 5.6K 59.94p | 3 / 30 / 29 |
| LUMIX TZ300 / `panasonic-tz300` | 20.1MP / 1인치 | 8.8–132 | 24–360 / 3:2 still | F3.3–6.4 | 337 / 295 | 4K 30p | 3 / 22 / 22 |
| LUMIX LX100 II / `panasonic-lx100-ii` | 17MP / 마이크로포서드 | 10.9–34 | 24–75 / multi-aspect still | F1.7–2.8 | UNKNOWN(conflict) / 350 | 4K 30p | 3 / 28 / 25 |
| LUMIX LX10 / `panasonic-lx10` | 20.1MP / 1인치 | 8.8–26.4 | 24–72 / 3:2 still | F1.4–2.8 | 310 / 280 | 4K 30p | 2 / 23 / 23 |

전체 4개 kind fixed / mount null / bodyStyle compact / specs.fixedLens. 기존 lens36개와 비대상 body131개는 그대로 유지하며 내장 렌즈를 별도 상품으로 생성하지 않는다. 전체무게와 bodyOnlyWeight는 대안 측정 기준이며 더하지 않는다. Body-only도 내장 렌즈를 포함한 카메라에서 배터리·카드를 제외한 값이다. L10 운영508g/본체425g에는 핫슈 커버가 포함되고 바디 캡은 제외된다. 알려진 운영무게는 battery-and-card, bodyOnlyWeight는 body-only를 조건에 명시한다. LX100II 운영무게/기준은 아래 충돌 때문에 null이다.

전체 4개 physical sensor sizeMm과 body/sensor IBIS는 UNKNOWN이다. Type 명칭에서17.3×13/13.2×8.8mm를 추정하지 않는다. L10 total26.5MP→effective20.4MP, LX100II total21.77MP→effective17MP의 multi-aspect/사용 영역 표현을 보존하며 면적 계산을 하지 않는다. TZ300과 LX10은 각각20.1MP/1-type이지만 렌즈·무게·영상 등 서로 공유하지 않는다. AF·배터리·날짜·weather sealing 등 이번에 직접 검증하지 않은 필드는 UNKNOWN이다. L10 물리 slot 수, TZ300 EVF 존재, 그외 cardSlots/shutter/burst는 직접 확정하지 않은 경우 null. L10 제외3개 selected-mode bitDepth/log UNKNOWN; 정수30p에서29.97을 추정하지 않는다.

## Source/value conflict와 거절한 자료

**LX100II operating weight genuine conflict1건, unresolved**: 같은 한국 product URL의 [사양 이미지](https://www.panasonic.co.kr/UploadFiles/editor/8179a6f0b400bf59720efc5179a8c5c16a29889b.png)는392g, [제품정보 이미지](https://www.panasonic.co.kr/UploadFiles/editor/2cf6bf4b2e95985c21036e9558c1d0268cbf5138.png)는292g이며 둘 다 배터리/메모리 포함이다. 두 이미지를 직접 시각 검토했고 NA와 일본 공식 사양은392g이다. 다수결/오타 추측으로 덮어쓰지 않고 실제 raw/staging/canonical operating weight와 basis를 UNKNOWN으로 보류한다. 각 raw claim conditions.reportedClaims에 수치·URL·image locator·기준을 보존한다. Body-only350g은 별도 측정값으로 검증되었다. 알려진292/392 claim 후보를 default strict validate에 넣는 검토 실험에서 CONFLICTING_CLAIM_VALUES 차단을 확인했으며 회귀 테스트로 남긴다. 제출된 production claim은 상충 숫자를 채택하지 않고 검토 결정에 따라 null이므로4개 모두 validate 가능하다. 승인 diff의 value-conflict acceptance0; 이것이 source conflict가 없었다는 뜻은 아니다.

TZ300 대안4K24p의 sensor-output 항목은 NA help25fps vs own manual24fps다. 대표4K30p는 양쪽30p로 일치한다. 24p sensor fps 대안은 승격하지 않고 모순과 manual 범위를 metadata/backlog에 남겼다. 이 대안 모드에25fps나24fps를 canonical 대표값으로 추가하지 않는다.

LX10용으로 처음 조회한 NA URL `/features-and-specifications-lumix-point-shoot-dmc-lx10/`는 DMC-LX100 URL/title/12.8MP/4/3센서로 redirect되었다. 전체 source를 거절했고 raw에는 넣지 않는다. KR LX10 자체 사양 이미지와 DMC-LX10 own SQW0721 매뉴얼만 사용한다. LX100 values를 LX10에 이식하지 않았다. LX10K 사양 재조회403, 처음 잘못 찾은 LX100M2 PDF404는 수집 실패로 기록하고 own 공식 support의 실제 PDF 링크로 대체했다. Worker 실패와 source HTTP 실패는 별개다.

## 고정렌즈 / stabilization / 영상 조건

Optical zoom은 L10/LX100II3.1x,TZ30015x,LX10 3x를 focal claim conditions에 보존한다. fixedLens canonical에 opticalZoom/filter/OIS 새 필드를 추가하지 않는다. 최소 lens/schema 확장도 하지 않았다. 렌즈 OIS는 L10 POWER O.I.S., LX100II optical method, TZ300 POWER O.I.S. + 영상 HYBRID O.I.S.+, LX10 HYBRID O.I.S.+의 원문 범위를 metadata에 보존한다. 전체 4개 IBIS null이며 lens optical/electronic/hybrid의5축을 sensor-shift5축으로 바꾸지 않는다. TZ300/LX10 hybrid는4K/highspeed에서 제약이 있고 TZ300 digital zoom/4KLiveCropping도 별도 제한이다. L10 E-Stabilization은 S&Q/LiveCropping/>100p에 제약이 있어 bodyIBIS 증거가 아니다. OIS 독립 canonical 표현은 후속 후보다.

35mm 환산 대표값은 TZ300/LX10 3:2 still 기준이다. TZ300 4:3=26–390,16:9=25–375,1:1=31–465,4Kvideo=36–540; OIS/LevelShot별 영상 환산값도 conditions에 보존한다. LX10 4:3=26–78,16:9=25–75,1:1=31–93,4Kvideo=36–108. L10 multi-aspect4:3/3:2/16:9=24–75,1:1=28–88. LX100II multi-aspect 공식 표현을 그대로 유지한다. 환산값을 actual focal로 넣지 않고 각각mm로 strict normalize/validate한다. 단위 누락UNIT_REQUIRED/미지원yard UNSUPPORTED_UNIT negative checks를 actual new staging에 적용했다. Archive compatibility mode를 사용하지 않았다. 의미 swap을 단위 검증만으로 판정한다고 주장하지 않는다.

L10 video.max5.6K59.94p는 NTSC59.94Hz/MOV/5632×2976/17:9/FULL/42010bitHEVC LongGOP300Mbps다. NA footnote4 FULL와 own complete guide132 mode row를 확인했다. Own guide122를 렌더링해서 **photo mode direct-video에서5.6K/5.2K/4.4K MOV 사용 불가**를 확인하고 video mode 조건을 보존한다. 대안5.2K29.97p4:3 FULL/4.4K59.94pPIXEL·PIXEL/C4K119.88p는 구분한다. 고온 보호, 파일 분할, C4K별23°C cold-start thermal 테스트를 대표5.6K의 무조건 녹화시간으로 오해하지 않는다. V-Log10bit도 selected-mode 범위다. L10 mechanical11AFS/MF vs AFC9, electronicSH30AFS/AFC/MF와 PRE를 구분했다.

나머지3개4K30p/MP4/H264/3840×2160/100Mbps/15분 제한을 own manual 표에서 검증했다. TZ300146과 LX100II158,LX10151를 렌더링해 표의 recording fps/sensor-output/AVCHD interlace 열을 구별했다. Crop는 TZ300147,LX100II159,LX10152의 좁은4K화각 및 공식 mode range로 확인했다. 실제 fraction이 명시된 L10만59.94p를 보존하고 나머지는 integer30p 그대로다. 기존 추천 fractional parser29.97→97 및 video.max 단일값에서 모든 조건을 소비하지 못하는 한계는 후속 표현 후보로만 남긴다. 가격은 전체 4개 UNKNOWN 기본 scaffold이며 price claim을 만들지 않았다.

## 공식 provenance registry

| productId | source / 범위 | sourceId |
| --- | --- | --- |
| panasonic-l10 | [DC-L10 KR current identity / reviewed specification images](https://www.panasonic.co.kr/consumer/xview/Camera/Camera/Lumix/DCL10) | `source-602c266ebbd29ee8` |
| panasonic-l10 | [DC-L10 official exact-model specification](https://help.na.panasonic.com/answers/features-and-specifications-lumix-point-shoot-dc-l10/) | `source-b660ffba88cfd7ad` |
| panasonic-l10 | [DC-L10 official advanced operating instructions](https://help.na.panasonic.com/wp-content/uploads/2026/05/DCL10_OperatingInstructions_ENG.pdf) | `source-1f56ffbcff292c00` |
| panasonic-tz300 | [DC-TZ300 KR current identity / reviewed specification images](https://www.panasonic.co.kr/consumer/xview/Camera/Camera/Lumix/DCTZ300) | `source-f2ca984756209aa4` |
| panasonic-tz300 | [DC-TZ300 official exact-model specification (NTSC TZ300/ZS300 explicitly scoped)](https://help.na.panasonic.com/answers/features-and-specifications-lumix-point-shoot-dc-zs300/) | `source-c1685e1e783af1c8` |
| panasonic-tz300 | [DC-TZ300 official advanced operating instructions](https://help.na.panasonic.com/wp-content/uploads/2026/05/DCZS300_OperatingInstructions_ENG.pdf) | `source-49a188a3f0404711` |
| panasonic-lx100-ii | [DC-LX100M2 KR current identity / reviewed specification images](https://www.panasonic.co.kr/consumer/xview/Camera/Camera/Lumix/DC10001) | `source-71ad236324e691ca` |
| panasonic-lx100-ii | [DC-LX100M2 official exact-model specification](https://help.na.panasonic.com/answers/features-and-specifications-lumix-point-shoot-dc-lx100m2/) | `source-9dca87fb2c2895c0` |
| panasonic-lx100-ii | [DC-LX100M2 official advanced operating instructions](https://help.na.panasonic.com/wp-content/uploads/2023/02/DCLX100M2_DVQP1769ZA_ENG.pdf) | `source-c2f8d69f08bce6a6` |
| panasonic-lx10 | [DMC-LX10GD KR current identity / reviewed specification images](https://www.panasonic.co.kr/consumer/xview/Camera/Camera/Lumix/DMC10002) | `source-0d8cdca20665aa86` |
| panasonic-lx10 | [DMC-LX10 official advanced operating instructions](https://help.na.panasonic.com/wp-content/uploads/2023/02/DMCLX10_SQW0721_ENG.pdf) | `source-24a6a2031cbb5fb7` |

공식11 raw /103 reviewed observations(known85/UNKNOWN18), unique paths99, 실제 canonical verified fieldEvidence82경로. UNKNOWN은 근거 부족 또는 충돌 보류 결정이며 공식 숫자로 verified 승격된 필드가 아니다. source count3/3/3/2에는 실제 identity-only source도 포함한다. 모든 raw는 raw-helper accessedAt 자동 UTC ISO timestamp를 사용하고 직전/직후 시각 범위 및 Date roundtrip을 checkpoint에 기록한다. 조회 cache 자체의 실제 timestamp도 별도 availabilitySources에 보존한다. canonical accessedOn의 날짜 단위 계약은 바꾸지 않는다. 이 raw/staging chain과 approval/evidence transaction이 field provenance를 보존하며 기존 artifact/digest semantics는 그대로다.

## Cheap-worker actual calls / parent 판단

공개 exact-model 공식 원문 발췌·최소 계약만 제품별 일회성 fixture로 전달했다. 프로젝트 코드/canonical/config/secret은 전송하지 않았다. 총4개 stable independent task, API attempts5(성공4, TZ300 MALFORMED_RESPONSE실패1 + 동일ID retry1). Dry-run4회는 API attempt에 포함하지 않는다. Worker가 제시한 no-change file entry/patch는 적용하지 않는다. 일회성 fixture4개는 사용 후 삭제하고 Git에 포함하지 않는다.

| 제품 / task | attempt | result | input | output | total |
| --- | ---: | --- | ---: | ---: | ---: |
| panasonic-l10 / `panasonic-production-004-l10` | 1 | success | 4253 | 589 | 4842 |
| panasonic-tz300 / `panasonic-production-004-tz300` | 1 | failure | 4697 | 649 | 5346 |
| panasonic-tz300 / `panasonic-production-004-tz300` | 2 | success | 4716 | 584 | 5300 |
| panasonic-lx100-ii / `panasonic-production-004-lx100ii` | 1 | success | 3739 | 512 | 4251 |
| panasonic-lx10 / `panasonic-production-004-lx10` | 1 | success | 2992 | 878 | 3870 |

실패/재시도 포함 실제총 input20397,output3212,total23609. Cost estimate 미제공. Worker는 보조 경고 검토이며 최종 field promotion 판단자가 아니다.

### panasonic-l10

- Source1 says weight ~508g without explicit basis; source2 defines 508g as body+battery+SD+hot shoe cover, 425g body-only.
- WeightBasis: 508g included-battery/card vs 425g body-only; official scope/value basis must be reconciled.
- IBIS: no body IBIS stated; lens POWER O.I.S. exists — do not map to IBIS.
- Equivalent focal differs by aspect: 24-75 (4:3/3:2/16:9) vs 28-88 (1:1).
- Video max depends on mode/conditions; 5.6K limited to MOV; photo-mode limits 5.6K/5.2K/4.4K and >100p.
- Sensor physical mm not explicitly stated as mm; '4/3-type' format only.

### panasonic-tz300

- 35mm-equivalent focal length is multiple values conditioned on aspect ratio, 4K PHOTO, video recording, O.I.S. state, and Level Shot function; store as conditioned range not single value.
- 4K 24p sensor output is 25fps in the spec sheet but 24fps in the operating instructions table; unresolved official scope conflict, flag and preserve NULL candidate.
- Weight 337g includes battery and SD card; 295g excludes both. Assign to correct condition fields, do not conflate.
- 5-axis HYBRID O.I.S.+ is lens optical stabilization, not sensor-shift IBIS; do not map to ibis. Unavailable for 4K video, Digital Zoom, and 4K Live Cropping.
- Sensor physical dimensions are not given; only '1-type BSI CMOS, 20.1 effective MP' stated. Do not infer mm or fraction.
- Frame rates differ by region/model variant (NTSC ZS300P/PP/TZ300GT/GD vs PAL TZ300E/GA/GH/GN); recording frame rate may differ from stated sensor output fps.

### panasonic-lx100-ii

- Weight conflict unresolved: 392g vs 292g stated same basis (battery+card); preserve NULL operating weight, do not pick 392.
- Sensor physical sizeMm not explicitly stated; only '4/3" MOS' -> sizeMm UNKNOWN, no inferred 17.3x13.
- Stabilizer described only as 'Optical method'; no IBIS axes/stops stated -> ibis null, do not map lens OIS to IBIS.
- Video bitDepth, log, and cropAtMax not stated for any mode; leave UNKNOWN.
- Korean page excerpt is navigation chrome; contains no usable specs (model appears as DC-LX100M2).
- Excerpt truncation ('Tou', 'Battery Pack (Lit', 'Lit\nDimensions') may clip monitor/battery fields.

### panasonic-lx10

- KR official page excerpt contains only site navigation/footer boilerplate; no in-page spec text — spec numbers derive solely from a parent visual transcription not independently verifiable here.
- Conflict: KR image says '5-axis HYBRID OIS+' (lens-based framing) while manual p139 describes 5-axis Hybrid Image Stabilizer for motion pictures; task contract forbids equating lens OIS/hybrid with IBIS.
- Manual states 5-axis hybrid stabilization unavailable for [4K/100M/30p] and [4K/100M/24p] and high-speed motion pictures — mode-conditional, do not generalize.
- Sensor physical dimensions in mm are not stated in provided excerpts; do not infer fractional size.
- No bitDepth, log profile, or cropAtMax stated in provided excerpts; 15-min 4K recording limit is a recording limit, not necessarily thermal/crop data.
- Weight/basis and dimensions appear only in the image transcription; verify against a primary official spec sheet before committing.

채택: L10 aspect별 환산/IBIS 금지/photo-mode 제약; TZ300 weight basis/regional rows 및24p sensor-output 모순; LX100II 무게 보류/physical mm/optical≠IBIS; LX10 hybrid mode 제약/이미지 source를 직접 확인할 필요. 수정/거절: LX100II 후보F1.7–16/F2.8–16에서 최대 조리개는1.7/2.8이며16은 최소 aperture라 별도 저장하지 않는다. Worker가 crop UNKNOWN을 제안한 경우 own manual159/152와 실제공식 환산범위로 parent가 독립 판단했다. 발췌의 navigation/truncated row 한계가 있어 본체350g/LCD/영상 조건은 전체 원문·이미지·표를 직접 검증했다. TZ300 첫 malformed output은 반환되지 않았으므로 채택하지 않았고 수정 retry의 string 경고만 참고했다.

최종 identity/code/alias/current/fixed 구조/source 범위/focal·aperture/OIS·IBIS/sensor·사용면적/weight UNKNOWN/video·crop/조건/diff/approval/apply 판단은 main Codex GPT-6.1 Sol이 수행한다. 별도 실제 사람이 직접 검토했다고 주장하지 않는다. 사용자 추가 개입0회. Main 직접 검토량4제품11raw103claims와 공식4PDF·2KR이미지·regional/status identity 대조. Worker는 이미지나 Git/tests/승인을 실행하지 않았다.

## 검증 / 종료 checkpoint

현재 gate: canonicalized; explicit CLI approval → atomic apply → canonical validation → 실제 재적용 완료. Approval 전 default strict validate4/4 통과, source-valued292vs392 negative trial 차단, 신규4개 human-readable summary 직접 검토. Canonical 실제 변경 바디131→135 / 렌즈36유지 / 전체167→171. 구조/pipeline/추천/UI 코드는 변경하지 않는다.

완료 후 compact미처리0, LUMIX S0/G0, 직접운용camcorder11(전체Panasonic11)의 다음 gate로 이동한다. Camcorder pilot은 개별 공식 current recheck/source selection/contract 검토부터 시작할 수 있으나 AJ-CX4000 2/3형교환식 mount vocab 이슈는 별도 검토 대상이며 이번에 확장하지 않는다.


### 승인 전 발견한 LCD enum과 validation 차이

L10 원문 free-angle은 canonical의 허용 LCD mechanism(fixed/tilt/vari-angle/multi-angle)에 직접 들어갈 수 없었다. Ingestion validate는 문자열 타입만 검사해 처음에는 통과했지만 approval의 canonical contract가 Invalid LCD mechanism으로 차단했고 canonical 변경은 없었다. 이번 미승격 draft를 기존 vari-angle로 정규화하고 conditions.manufacturerMechanism에 free-angle을 보존했다. 이 변경 후 normalize/strict validate/diff/사람용summary를 다시 검토해 새 diff digest로 승인했다. 새 batch의 아직 승인되지 않은 raw만 교체했고 기존 production artifact는 수정하지 않았다. 기존 ingestion LCD enum validation과 approval 계약 사이 차이는 후속 소규모 validator 보강 후보이며 이번에는 코드 변경을 하지 않았다.


### 최종 검증 / 종료

전체220/220, Objective/production/catalog/coverage193/193, Panasonic33/33, 새batch회귀9/9. Canonical validation=true, 바디135/렌즈36/전체171. pnpm build 통과(기존 >500kB chunk 경고), Objective6scripts+새test 총7파일 node --check 및 git diff --check 통과. 실제 CLI apply 재호출에서 already-canonicalized/canonicalMatches:true; canonical SHA는 적용 이후 그대로다. 사용자 개입0, worker fixture4개 삭제.

Diff `34db6241b500c8814d223df5b1e207f9387f2ce46a7296af31616dc77da29c27`, approval `approval-4d31c24d26dc448752c865eacc8ca620039316c21079739a5e94fcffdcc8462e`, canonical after SHA `e29a0553e24ada3cb6ef1eee62cbdbe17c09e50f8d529930ca9e4da590e16f1f`. Raw helper clock UTC 2026-10-07T01:43:15.403Z~2026-10-07T01:46:15.325Z; ISO밀리초/Date round-trip 및 생성 직전/직후 clock bounds11개 통과. 기존artifact timestamp/digest를 변경하지 않았다.

완료 범위의 미완료 제품0. 남은 **compact0 / LUMIX S0 / LUMIX G0 / 직접 운용 camcorder11 / Panasonic 전체11**. LX100II 무게와 TZ300 대안24p sensor-output source reconciliation, LCD ingestion enum 검증 차이, OIS 및 조건부 video 소비는 후속 후보로 명시적으로 남긴다. Product production coverage와 모든 필드 완성도는 다른 개념이다. 다음 session은 작은 camcorder pilot의 current/source/계약 검토부터 시작할 수 있다. AJ-CX4000 mount 확장이나 camcorder11 전체 수집은 이번에 실행하지 않았다.

Batch 종료는 로컬 커밋 trailer `Objective-Batch: production-panasonic-bodies-004`로 기록한다. Push하지 않는다. 재개 시 이 manifest/approval/transaction/status와 commit trailer를 먼저 확인하고 완료된 worker/raw/apply를 반복하지 않는다.
