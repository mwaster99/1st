# Panasonic/LUMIX Korea inventory + production pilot 001 — 2026-10-06

## 시작과 적용 전 선정

시작 git clean, baseline d156036, canonical 바디111/렌즈36/전체147. 한국 공식 S/G/컴팩트/가정용 캠코더/프로페셔널 CX/캠코더 모든 pagination을 조회했다. 공식 공개 API `/api/xlist_api.do`의 category IDs와 개별 제품 경로를 실제 페이지에서 읽었다. 카드49개 = LUMIX38 + 직접 운용 캠코더11; 기본 identity39개 = LUMIX28 + 캠코더11. 키트/색상 linked variant10카드는 별도 제품을 만들지 않는다. 기존 canonical 현행4개(S9/S5 II/G9 II/GH7), production 처리0개, production 미처리39개(신규35+기존legacy4). 출시완료/current39, upcoming 확인0. 현행은 한국 공식 목록에 남아 있고 이미 운용/출시 근거가 있는 모델이라는 운영 기준이며 재고/글로벌 생산 지속 보증은 아니다.

Snapshot: `src/data/ingestion/panasonic-current-camera-gallery-2026-10-06.json`. 각 카드의 이름/공식코드/URL/category/mount/status/scope/기존 존재/variant/출시 또는 운용 근거를 보존한다. 인증일·등록일을 출시일로 사용하지 않는다. DC-L10은 2026 고정렌즈이며 옛 DMC-L10 DSLR과 구별한다. TZ300 뉴스 header와 본문 날짜 차이, G100 출시년월 복사 의심, LX100M2 무게 복사 의심은 후속 직접 검토 대상으로 남기며 inventory 사양은 canonical로 승격하지 않는다. PTZ10 + studio5 = 별도 scope 후보15. Studio는 전문가용이라는 이유로 제외하지 않는다. AK-PLV100GSJ의 CCU 없이 SDI 출력 가능성을 확인했고, studio/IP/return/외부녹화 중심 구매 workflow의 범위 검토를 deferred로 남긴다. 산업/보안 설치형은 별도 family 후보이며 이15개 수치에 포함했다고 주장하지 않는다.

Pilot 선정(재선정 없이 이후 진행):

| 제품 | 작업 | 선정 이유 |
| --- | --- | --- |
| S1RII / DC-S1RM2 | 신규 | 풀프레임 L-Mount, 고해상도/8.1K, CFexpress+SD, mode·preburst 분리 |
| S5 II / DC-S5M2 | 기존 보강 | L-Mount legacy identity 유지, body BIS5stop vs DualIS6.5stop,6K open gate/thermal |
| GH7 / DC-GH7 | 기존 보강 | 영상 중심 MFT, body/DualIS·RAW/ProRes·media·AFC 연사 조건 |
| G100D / DC-G100D | 신규 | 경량 MFT, G100과 세대 구분, EFCS와 기계식 분리, hybrid≠IBIS |
| TZ99 / DC-TZ99 | 신규 | 고정렌즈 실제/환산mm, aperture범위, optical≠IBIS, 전체무게/내장렌즈 |

결과는 신규3/기존보강2다. 가격/렌즈/추천/UI/Experience/schema 재설계는 범위 밖이다.

## 전체 inventory와 상태

| 공식 분류 | 카드 | 기본 identity | 모델 목록 |
| --- | ---: | ---: | --- |
| [LUMIX S](https://www.panasonic.co.kr/consumer/xlist/Camera/Camera/LumixS) | 13 | 10 | S9, S5, S1IIE, S1II, S1RII, S1R, S1, S5IIX, S5II, S1H |
| [LUMIX G](https://www.panasonic.co.kr/consumer/xlist/Camera/Camera/LumixG) | 20 | 13 | GH7, G100D, G9II, G85, G100, GH6, GH5II, GH5, G9, G95, GF10, GX9, GH5S |
| [컴팩트](https://www.panasonic.co.kr/consumer/xlist/Camera/Camera/Lumix) | 5 | 5 | DC-L10, TZ300, TZ99, LX100II, LX10 |
| [가정용 캠코더](https://www.panasonic.co.kr/consumer/xlist/Camera/Camcoder/Camcoder) | 3 | 3 | HC-VX3, HC-V900, HC-VX1 |
| [프로페셔널 CX](https://www.panasonic.co.kr/systembiz/xlist/BrodcastingSystem/ProfessionalCamcoder/CXSeries) | 3 | 3 | AG-CX370, AG-CX20, AJ-CX4000 |
| [프로페셔널 캠코더](https://www.panasonic.co.kr/systembiz/xlist/BrodcastingSystem/ProfessionalCamcoder/Camcorder) | 5 | 5 | HC-X1200, HC-X2100, HC-X1600, HC-X20, HC-X2 |
| 합계 | **49** | **39** | LUMIX28 + 직접 운용 캠코더11 |

Released/current39, announced/upcoming0은 기본 identity 기준이다. Linked variant10카드는 S5/S1/S1R의 body/kit 각1, G100 kit1, GH5II body/kit1, GF10 색상4, GX9 색상1이다. Variant 관계는 snapshot에 원래 카드/이름/URL을 보존한다. S1H의 단일 kit 카드도 base camera 하나다. [공식 정품등록 대상](https://panasonic.co.kr/lumix/lumixMem_genuine.do/Membership/Enrollment/Enrollment)의 kit 코드도 대조했다. G100D는 EVF/USB가 바뀐 별도 모델이며 G100과 합치지 않았다. VX3/V900도 인증번호가 공유된다는 이유로 합치지 않았다. 기존 GX85는 한국 현행 gallery에 없어 현행 canonical4개 집계에서 제외했다.

Deferred-special 후보는 PTZ10개(AW-UE150A, AW-UE160W/K, AW-UE100W/K, AW-UE80W/K, AW-UE50W/K, AW-UE40W/K, AW-HE20W/K, AW-UE20W/K, AW-UE4W, AW-UR100)와 studio5개(AK-UCX100, AK-UBX100, AK-PLV100GSJ, AK-UC4000, AK-HC3900)다. 이들은 직접 운용 일반 카메라49카드 분모 밖이며 catalog-scope의 두 family entry에 후보와 재검토 조건을 기록했다. 산업/보안 설치형은 별도 family 후보로만 남겼고 전 모델을 열거했다고 주장하지 않는다. [AK-PLV100GSJ 공식 설명](https://pro-av.panasonic.net/en/products/ak-plv100gsj/features.html)의 독립 SDI 출력도 기록하여 studio라는 이유만으로 무조건 CCU 필수라고 단정하지 않았다.

상태 근거는 제품 목록뿐 아니라 출시 뉴스/운용 사양/공식 호환 자료를 대조했다. TZ300 뉴스의 header와 본문 날짜 차이는 snapshot에 남겼고 출시일을 승격하지 않았다. G100의 복사 의심 출시년월, LX100M2의 복사 의심292g는 다음 제품 검토에서 공식 다중 근거를 확인해야 한다. **AJ-CX4000은 교환식 2/3형 바요네트**이며 이번 pilot 대상이 아니다. 공식 원문 mount를 inventory에 보존했지만 현재 vocab으로 매핑 승인하지 않았다.

## 공식 multi-source와 승격 결과

공식12 raw, 제품별 source3/2/3/2/2, verified claims80, unique product-field paths77. S5II/GH7은 각각 같은 값 근거4경로 + null-fill13경로를 보강했다. 복수 source가 같은 MP를 증명하므로 claim 수와 unique path 수는 다르다. 기존 두 제품의 ID/이름/모델/aliases/mount/kind/가격을 유지했다. 비대상 body와 기존 lens36개는 동일하다. 신규3개는 reviewed identity evidence를 사용했다. Identity-only source도 provenance와 사람용 source count에 포함했다. Accepted source/value conflict는 **0**이며 자동 충돌 덮어쓰기는 없었다.

| 제품/ID | 핵심 canonical 데이터 | batch source / claims / unique fields |
| --- | --- | --- |
| S1RII / `panasonic-s1r-ii` | L-Mount/풀프레임44.3MP,35.8×23.9mm;795g battery-and-card/본체712g;5축IBIS(stops null);CFexpressB+SD;8.1K29.97p10bit | 3 / 16 / 16 |
| S5II / `panasonic-s5-ii` | L-Mount/풀프레임24.2MP,35.6×23.8mm;740g battery-and-card/본체657g;BIS5축5stop;SD2slots;6K29.97p10bit,V-Log | 2 / 18 / 17 |
| GH7 / `panasonic-gh7` | Micro Four Thirds/25.2MP;805g battery-and-card/본체721g;BIS5축7.5stop;CFexpressB+SD;5.8K29.97p10bit,V-Log | 3 / 18 / 17 |
| G100D / `panasonic-g100d` | Micro Four Thirds/20.3MP;346g battery-and-card/본체304g;EVF2.36Mdot,LCD3inch1.84Mdot;4K30p;IBIS null | 2 / 14 / 14 |
| TZ99 / `panasonic-tz99` | fixed/mount null;1/2.3형20.3MP;전체322g battery-and-card/본체280g;4K30p;actual4.3–129mm/equivalent24–720mm/F3.3–6.4 | 2 / 14 / 13 |

S5II/GH7의 기존 legacy source를 포함한 canonical 누적 source 수는 각3/4다. 나머지 신규는3/2/2이므로 batch source 수와 누적 source 수를 혼동하지 않는다.

Source 적용 범위:

- S1RII: [한국 제품 identity](https://www.panasonic.co.kr/consumer/xview/Camera/Camera/LumixS/DCS1RM2GDK), [공식 HTML 매뉴얼 사양](https://eww.pavc.panasonic.co.jp/dscoi/DC-S1RM2/html/DC-S1RM2_DVQP3245_eng/0174.html), [공식 complete guide p150](https://help.na.panasonic.com/wp-content/uploads/2025/03/DCS1RM2_OperatingInstructions_ENG.pdf). 한국 source는 identity-only다.
- S5II: [한국 제품 사양 이미지/MP](https://www.panasonic.co.kr/consumer/xview/Camera/Camera/LumixS/DC-S5M2GD), [Panasonic NA 사양](https://help.na.panasonic.com/answers/specifications-sheet-lumix-s-series-dc-s5m2/).
- GH7: [한국 출시 뉴스/MP/출시일](https://www.panasonic.co.kr/event/news_view.do?seq=135), [NA 사양](https://help.na.panasonic.com/answers/features-and-specifications-lumix-g-series-model-dc-gh7/), [공식 complete guide p145](https://help.na.panasonic.com/wp-content/uploads/2024/07/DCGH7_OperatingInstructions_ENG.pdf).
- G100D: [한국 제품 사양 이미지/4K30p](https://www.panasonic.co.kr/consumer/xview/Camera/Camera/LumixG/DCG100DVGD), [NA 사양](https://help.na.panasonic.com/answers/features-and-specifications-lumix-g-series-model-dc-g100d/).
- TZ99: [한국 제품 identity/MP](https://www.panasonic.co.kr/consumer/xview/Camera/Camera/Lumix/DCTZ99), [동일 DC-TZ99 일본 공식 사양](https://panasonic.jp/dc/products/DC-TZ99/spec.html).

한국 페이지 사양이 이미지라 직접 이미지/표를 확인했다. 해외 공식 자료는 동일 모델의 한국 이미지에서 불충분한 물리 사양/영상 조건 보조 근거이며 다른 지역 형제 모델을 합치지 않았다. 가격은 source에 있어도 canonical promotion 대상에서 제외했다.

## Panasonic 조건/UNKNOWN/표현 한계

L-Mount와 Micro Four Thirds는 기존 vocab을 사용했다. Full Frame 물리 크기는 실제35.8×23.9/35.6×23.8mm이며 MFT라는 이름만으로 물리17.3×13mm를 추정하지 않았다. GH7/G100D 물리 sizeMm, TZ99의 물리 sizeMm은 null이다.

S5II의 body BIS는 CIPA yaw/pitch,S-R2060 60mm에서5stop이고 Dual I.S.2는 S-E70200 200mm에서6.5stop이다. GH7 body7.5stop은 H-ES12060 60mm, combined7.5stop은 H-FSA14140 140mm 조건이다. Combined 성능은 IBIS 대표 body값으로 대체하지 않고 conditions에 보존했다. S1RII는 센서시프트5축을 확인했지만 선택 source에서 독립 body stop을 입증하지 못해 stops null이다. G100D의 hybrid5축 및 TZ99의 optical/hybrid 보정은 body sensor-shift를 입증하지 않으므로 IBIS null이다. Lens OIS/digital/active 보정을 body IBIS로 승격하지 않았다.

영상 대표값의 단위/정밀도와 조건은 raw/staging/diff/canonical에 그대로 보존했다:

- S1RII **8.1K29.97p**는 NTSC59.94Hz/MOV/8128×4288/17:9/300Mbps/HEVC42010bit/FULL 조건이다. 인용 complete guide p150의 모드이며 후속 firmware의 모든 모드를 포괄하는 선언이 아니다. RAW/ProRes/open-gate 대안과 thermal shutdown 가능성을 metadata에 구분했다.
- S5II **6K29.97p**는5952×3968/3:2/FULL/MOV/HEVC42010bit200Mbps. Thermal Management Standard에서30분 종료 조건을 보존했고 별도4K60 APS-C나 S5IIX 전용 ProRes/SSD를 상속하지 않았다.
- GH7 **5.8K29.97p**는5760×4320/4:3/FULL/MOV/HEVC42010bit200Mbps. 5.7K60/C4K120/ProRes RAW 대안 모드와 media 조건은 별개다. 32-bit float는 XLR2 조건의 **오디오**이며 영상 bitDepth32가 아니다. V-Log와 별도 유료 ARRI LogC3도 구분했다.
- G100D/TZ99는 공식30p label을 그대로 저장했고 임의29.97p 변환을 하지 않았다. TZ99의HD120/VGA240 sensor-output slow motion은 일반4K 최대fps와 합치지 않았고4K15분 제한을 보존했다.

S1RII 기계10fps는 AFC H+ SPEED PRIORITY(IMAGE PRIORITY9), 전자SH40은 AFS/AFC/MF이며 PRE는 별도 조건이다. S5II 기계9AFS/MF 대7AFC, 전자SH30을 구분했다. GH7 기계14AFS/MF 대10AFC, 전자75AFS/MF 대60AFC를 보존했다. G100D 전자10fps와 EFCS6AFS/MF 대5AFC를 구분하고 EFCS를 full-mechanical 대표값으로 승격하지 않았다.

주요 UNKNOWN은 물리 센서 크기(위3개), S1RII BIS stop/log, G100D/TZ99 video bitDepth/log/crop, G100D 기계 burst/cardSlots, 직접 검증하지 않은 AF/배터리/출시일 등이다. GH7은 한국 공식 출시일2024-06-28도 승격했다. 제품별 전체 null 목록 대신 직접 사양 검토에서 결정한 UNKNOWN 범위를 기록한다. canonical의 video.max/IBIS 단일값 소비 경로는 복합 모드·combined IS 조건을 충분히 표현하지 못한다. 기존29.97p→97p 추천 영상 parser 버그는 별도 cross-brand backlog로 유지했고 이번 raw/staging/canonical 정밀도에는 영향이 없다. 추천/UI는 변경하지 않았다.

TZ99는 `kind: fixed / mount: null / specs.fixedLens`이며 별도lens product를 생성하지 않았다. Focal은 실제4.3–129mm, equivalent는 정지4:3 기준24–720mm, aperture F3.3–6.4다. 신규 focal4claims 모두 raw/staging/diff **mm**, strict unit 검사이며 archive compatibility 예외를 쓰지 않았다. 본체280g도 내장렌즈를 포함한 camera-body 기준이다. 기존 시나리오 코드의 읽기 전용 실제 회귀에서 integrated lens weight/price null, BUY 카메라1개, lensCount.after0, total weight.after322g으로 이중 계산이 없음을 확인했다. Lens OIS/opticalZoom 전용 leaf는 기존 schema에 없으므로 새 leaf를 만들지 않았다.

## Cheap-worker 실제 호출/직접 판단

제품별 stable task ID `panasonic-production-001-{s1r-ii,s5-ii,gh7,g100d,tz99}`로 독립 task를 호출했다. 공개 공식 발췌와 최소 contract만 제공했고 코드/canonical전체/secret은 전송하지 않았다. preflight는 API 호출이 아니다. 실제 API5회, 전부attempt1, retry0/failure0, 반환5개 모두 검토 보조로 사용했다. 전달용 임시 fixture5개는 삭제했다. API ledger는 그대로 유지한다.

| 제품 | Input | Output | Total | 채택/폐기 판단 |
| --- | ---: | ---: | ---: | --- |
| S1RII | 1132 | 327 | 1459 | BIS/DualIS·영상조건·stop UNKNOWN 채택;712g에 battery 포함이라는 오독 폐기 |
| S5II | 875 | 459 | 1334 | BIS5와combined6.5 분리·센서·6K 조건 채택;740g기준이 불명이라는 경고는 공식 표로 해소 |
| GH7 | 1010 | 430 | 1440 | 셔터/AFC·RAW/media·32bit오디오·BIS조건 검토에 사용 |
| G100D | 1003 | 549 | 1552 | EFCS≠full mechanical,hybrid≠IBIS,미확정 센서크기 추정 금지 채택 |
| TZ99 | 1008 | 371 | 1379 | focal4:3/mm·lens OIS≠IBIS·slow motion 조건 채택;280g본체를 UNKNOWN으로 두라는 제안 폐기 |
| 총합 | **5028** | **2136** | **7164** | 실제API5회 |

S1RII/S5II/GH7 crop UNKNOWN 경고는 해당 official mode table의FULL 표시를 직접 확인해 선택 모드의cropAtMax false로 판단했다. 다른모드 crop까지 false라고 주장하지 않았다. Worker의 일부 중복 발췌 경고는 source 독립성을 재검토하는 데 사용했지만 공식 페이지/매뉴얼을 직접 확인한 source 범위를 대신하지 않는다. GPT-6.1 Sol이49카드/39identity 관계,5제품ID/source범위/80claims77paths/aliases/mount/UNKNOWN/조건/diff와승인·apply를 직접 판단했다. 사용자 추가 개입0회이며 worker결과를 자동적용하지 않았다.

## Validator/원자 적용/검증

기존 raw-helper→normalize→validate→사람용diff검토→CLI explicit approval→atomic apply 경로를 완료했다. Production weight 값은 기존 vocab의battery-and-card/body-only와 실제conditions가 일치한다. 실제 staging을 메모리에서만 변형한 무게 기준 누락/invalid/mismatch는 `WEIGHT_BASIS_REQUIRED / INVALID_WEIGHT_BASIS / WEIGHT_BASIS_MISMATCH`, boolean/malformed IBIS는 `INVALID_IBIS`, fixed mm 누락/지원하지 않는 단위는 `UNIT_REQUIRED / UNSUPPORTED_UNIT`로 approval 전에 차단된다. 원본 fixture는 변형하지 않았다. 공식 출처간 실제 값충돌0이며 기존 `CONFLICTING_CLAIM_VALUES` 정책은 그대로다.

이 pilot의 **신규 pipeline code bug나 validator/schema 수정은 없다**. 승인전 자체 raw초안의 S1RII 무게 구성 조건을 직접 교정할 때, content digest가 observation조건 전체가 아닌 evidenceExcerpt를 기준으로 sourceID를 만드는 기존 계약을 고려해 명시적인 reviewed evidenceScope로 새 immutable source를 만들었다. 채택되지 않은 이번 작업의 초안만 제거했고 기존 production source를 재작성하지 않았다. 최종 sealed input/digest replay는 모두 통과한다. 이 수집 규율을 다음 세션에서도 지키며 임의 raw 덮어쓰기로 조건을 변경하지 않는다.

Raw12개 `accessedAt`은 helper가 자동 생성한 실제 UTC **2026-10-06T05:09:08.008Z~2026-10-06T05:11:09.776Z**다. 밀리초 ISO 구조/Date round-trip을 검증했고 날짜를00:00:00Z로 합성하지 않았다.

Batch `production-panasonic-bodies-001`의5item 모두canonicalized. Canonical **바디111→114 / 렌즈36 유지 / 전체147→150**이며 수동 JSON편집은 하지 않았다.

- Baseline commit: `d156036415fa8f0f792f078e23a02e3419bbf1f6`.
- Baseline canonical SHA: `f58511cd8bf98568f8e38f2b557be655b572e2c722f0903b34b208ae947ac310`.
- Reviewed diff: `fb1822987751016c8629bbdb5532885450c76bfe3d0ea4189d4d445ca949eb0f`.
- CLI explicit approval: `approval-fb9f3ae13d6474ca0ea986b07f8a98f33223fc0963f3091f46c830b21fdd7017`.
- After canonical SHA: `ade28a73f4223b7191c2081ad8577d4581fd91c5791670859dc0c8a1379af2de`.
- Actual idempotent apply: **already-canonicalized / canonicalMatches:true**.

Panasonic regression8개: inventory/variant/scope, archived atomic replay/untouched products,12sources/80claims/digest/UTC,bodyBIS vsDualIS/UNKNOWN,29.97/video/burst조건,actualfixedscenario322g,weight/IBIS rejection,fixed mm rejection. 전체 **195/195**, Objective/production 및 catalog **168/168**, Panasonic **8/8**, canonical150제품valid,build/Objective6scripts+새test의node --check/git diff --check 통과. Build는 기존500kB 초과 chunk 경고만 있다.

변경은 Panasonic inventory/doc/진행doc/test,identity-map5mapping,scope2family,신규batch/raw/staging/diff/approval/transaction과 atomic canonical apply다. Pipeline코드/rules/vocab/schema/추천/UI/가격/렌즈/기존productionartifact는 불변이다. 마지막 local commit trailer는 `Objective-Batch: production-panasonic-bodies-001`; push는 하지 않는다.

## 완료 체크포인트와 다음 batch 크기

완료5, released/current production미처리 **34 = LUMIX23 + 직접운용캠코더11**. Canonical미등록32 + 기존legacy보강2(S9/G9II)로 구분한다. 처음집계39와 완료후checkpoint34를 둘다 유지한다.

- S8: S9,S5,S1IIE,S1II,S1R,S1,S5IIX,S1H.
- G11: G9II,G85,G100,GH6,GH5II,GH5,G9,G95,GF10,GX9,GH5S.
- Fixed4: DC-L10,TZ300,LX100II,LX10.
- 캠코더11: 위inventory의3+3+5제품 전부.

**다음은 일반 LUMIX8–10개 batch를 권장**한다. 이번 L/MFT/fixed contract와 validator가 별도예외없이 통과했고 기존제품보강도 안전하다. 예를 들어 S8을 동일계약으로 묶거나 G8–10을 묶을 수 있으며, 다음 실제 세션에서 현행과 정확한 source를 다시 확인한다. 제품당독립worker/단계별diff/승인 게이트는 batch확대후에도 유지한다.

**잔여34개 전체를 한번에 처리하지 않는다.** 직접 운용 캠코더는 out-of-scope가 아니지만 bodyStyle/영상센서/운용구성의 별도 검토가 필요하며 AJ-CX4000의2/3형bayonet는 현재 mountvocab에 없다. 캠코더 category 진입 시 작은 별도pilot로 mount/weight/recording contract를 확인해야 한다. 이 작업에서 그문제를 임의schema추가로 우회하지 않았다. 알려진 G100/LX100M2 원문 표기 의심도 해당제품 직접검토전 승격하지 않는다. 일반 LUMIX는 확대가능, 나머지캠코더는 구조검증후 확대판정이다.

재개 시 `status --batch production-panasonic-bodies-001`, 현재canonical SHA, commit trailer, 최신 inventorycheckpoint부터 확인한다. 이batch의 worker재호출/raw재생성/normalize재실행/새승인은 불필요하다. 새작업은 clean git에서 다음batch로 시작한다. Panasonic전체coverage는 아직 완료가 아니며 OM System/coverage audit은 이번세션에서 시작하지 않았다.
