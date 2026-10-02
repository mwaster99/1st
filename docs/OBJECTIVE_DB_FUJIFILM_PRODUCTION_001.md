# Fujifilm Korea production batch 001 — 2026-10-02

시작 working tree clean, baseline add35a7, canonical 바디102/렌즈36/전체138. 공식 갤러리 카드17개(GFX6/X11), 모델 identity15개, 일반 출시완료14개/제한형IR1개. 일반 카드16개와 identity14개를 혼동하지 않는다. 기존 canonical 일반5개(카드6개), 신규 미처리9개(카드10개). 기존5개는 production 검증 완료로 재표시하지 않는다. 한정판2개는 공식 모델 행과 물리 사양에 따라 기본 objective identity에 연결하되 variant 정보/독립 URL을 inventory에 보존한다. Instax 공식 별도 목록10개는 즉석사진/휴대폰·프린터 workflow 검토 대상으로 분리한다.

## 적용 전 선정

- GFX100 II: G 마운트 라지포맷102MP, 탈착EVF 구성별 무게, 고속·영상 조건.
- GFX100S II: 같은 센서 크기·해상도지만 더 가벼운 GFX, SSD/ProRes와 영상 모드 구분.
- X-H2S: X 마운트 APS-C 고속형, 40fps와 open-gate6.2K/4K120 구분.
- X-H2: APS-C 고해상도40.2MP/8K, pixel-shift·전자셔터crop 분리.
- X-T30 III: 가벼운 APS-C, 디지털IS를 IBIS로 오해하지 않는 UNKNOWN 경계.

신규5개를 우선한다. 나머지 신규 identity4개는 GFX ETERNA55, GFX100RF(별도 FRAGMENT 카드 연결), X-E5, X half. GFX ETERNA55는 직접 운용 시네마이므로 제외하지 않는다. 한정판 필름 시뮬레이션/외장/액세서리 차이는 기본 제품에 합치지 않는다.

## 체크포인트

**완료:** 제품별 독립 worker → raw-helper → normalize → validate → diff/조건 직접 검토 → explicit CLI approval → atomic apply → canonical validation → idempotent reapply → tests/build. 신규5개/기존보강0개, 검증 field claim112개다. Canonical은 바디 **102→107**, 렌즈 **36 유지**, 전체 **138→143**이다. 이전138개 제품 객체와 모든 렌즈는 그대로이며 `cameraProducts.json`은 production apply만 작성했다.

중단 후 재개에서는 manifest5개 모두 canonicalized, 현재 canonical SHA와 승인 결과 일치를 확인했다. 이미 끝난 수집·worker·raw·approval/apply를 처음부터 반복하지 않았다. 남은 문서/임시 fixture 정리/최종 검증/commit을 이어서 마무리했다.

## 공식 inventory와 집계 기준

[Fujifilm Korea 공식 카메라 목록](https://fujifilm-korea.co.kr/products/camera)에서 실제 개별 카드17개와 각 제품 소개·모델명·사양·출시 표기를 직접 확인했다. 조회일은 2026-10-02이며 [snapshot](../src/data/ingestion/fujifilm-current-camera-gallery-2026-10-02.json)에 URL, 공식 모델 identity, 날짜 근거, scope, 변형 구분, 시작 당시 canonical 존재 여부와 처리 상태를 보존했다. 현행은 이 한국 공식 목록에 남아 있는 출시 완료 모델이라는 운영 기준이며 실물 재고나 모든 국가의 단종 여부를 보증하지 않는다. SOLD OUT은 upcoming으로 바꾸지 않았다.

| 공식 표시명 | 공식 분류 | objective identity / 처리 결과 |
| --- | --- | --- |
| GFX100 II | GFX | 신규, batch001 canonicalized |
| GFX100 II IR | GFX | 독립 IR identity, deferred-special-category |
| GFX100S II | GFX | 신규, batch001 canonicalized |
| GFX ETERNA 55 | GFX | 출시완료(한국 표기2025-11), 신규 미처리 |
| GFX100RF FRAGMENT EDITION | GFX | 공식 모델명GFX100RF의 변형 카드, 기본 모델 신규 미처리 |
| GFX100RF | GFX | 고정렌즈, 신규 미처리 |
| X-H2S | X | 신규, batch001 canonicalized |
| X-H2 | X | 신규, batch001 canonicalized; 한국 출시월 승격 보류 |
| X-T5 | X | 기존 canonical, 이번 production 보강 없음 |
| X-T50 | X | 기존 canonical, 이번 production 보강 없음 |
| X-T30 III | X | 출시완료(한국 표기2025-12), 신규 canonicalized |
| X-E5 | X | 출시완료(한국 표기2025-08), 신규 미처리 |
| X-S20 | X | 기존 canonical, 이번 production 보강 없음 |
| X-M5 | X | 기존 canonical, 이번 production 보강 없음 |
| X half | X | 공식 identity FUJIFILM X half / X-HF1, 고정렌즈 신규 미처리 |
| X100VI | X | 고정렌즈 기존 canonical, 이번 보강 없음 |
| X100VI Limited Edition | X | 공식 모델명X100VI의 변형 카드, 기존 canonical과 연결 |

X/GFX 목록17카드 = 일반16카드 + IR1카드다. 한정판2개는 별도 공식 URL/variantKey/feature 차이를 보존하면서 제조사 모델명 기준으로 기본 objective identity에 연결했다. 따라서 **모델 identity15개 = 일반 released/current14개 + IR deferred1개**, announced/upcoming0개다. IR과 일반 GFX100 II는 합치지 않았다. FRAGMENT는 외장·액세서리·모노크롬 기능 외 사양이 GFX100RF와 같다는 공식 설명을 적용했으며, 이 기능 차이를 기본 제품의 alias/성능/가격에 섞지 않았다. 한정판 응모 종료와 일반 모델 출시 사실을 함께 확인했고, 확인하지 못한 한정판 한국 출시일은 null로 남겼다.

시작 시 일반 canonical **5identity/6카드**(X-T5, X-T50, X-S20, X-M5, X100VI)와 신규 미등록 **9identity/10카드**였다. 기존5개는 이번 v0.4 production 검증이 끝난 제품이 아니다. 이 작업에서 '미처리' 집계는 기존 브랜드 inventory처럼 **canonical에 없는 released/current 제품 coverage** 기준이다. 구조화된 production ingestion 검증이라는 기준으로는 시작 시 일반14개 모두 미검증, 종료 시 이번5개가 검증되었고 나머지9개(신규4+기존legacy5)는 보강/수집 대상이다. 이 두 분모를 혼용하지 않는다. X-E4는 canonical에는 있지만 이번 공식 현행 카드에는 없어 현행 기존 수에 넣지 않았다.

[별도 한국 공식 Instax 목록](https://www.fujifilm.com/kr/ko/consumer/instax/cameras)은 미니12/41/99, 미니Evo/리플레이, 스퀘어SQ1/SQ40, 와이드400/에보, 팔의 **10개 카드**다. 아날로그 필름 카메라는 디지털 바디 DB와 범위가 다르다. 하이브리드와 디지털 Pal은 필름·프린터·휴대폰 연계 구매 흐름을 별도로 검토하도록 deferred 후보로 남겼다. Pal을 아날로그라고 분류하거나 영구 제외하지 않았으며 출시 상태 전수 audit을 했다고 표시하지 않았다. 이10개는 X/GFX17카드 분모 밖이다.

IR은 [공식 제품 설명](https://fujifilm-korea.co.kr/products/id/1349)의 제한된 구매기관/용도·필터·구매자 계약에 따른 별도 scope 후보로 registry에 기록했다. Cinema라는 이유로 ETERNA55를 제외하지 않았다.

## 승격값, 공식 source와 UNKNOWN

각 제품에 공식 사양 페이지1개와 현행 gallery의 identity-only source1개를 연결했다. **제품별2source, 제품-source 연결/raw artifact10개, 서로 다른 URL6개**다. 같은 gallery URL을 제품별 발췌 identity로 기록한 것이며 서로 다른 공식 사이트10개를 조사했다고 의미하지 않는다. Identity source는 field 근거로 사용하지 않았다.

| 제품 / 공식 사양 | claim | 핵심 대표값 / 보존 조건 |
| --- | ---: | --- |
| [GFX100 II](https://fujifilm-korea.co.kr/products/id/1289) | 22 | G마운트, GFX102MP/43.8×32.9mm, 배터리·카드·제공EVF포함1030g/배터리·카드제외EVF포함949g. 5축8stop CIPA GF63mmF2.8/pitch-yaw. 기계8fps, 전자8.7fps는35mm모드ON(기본5.3fps 별도). 내부8K16:9 29.97p/10bit H.265, DIS OFF crop1.51배. EVF9.44Mdot/1.0배, 3.2인치3방향tilt LCD2.36Mdot. |
| [GFX100S II](https://fujifilm-korea.co.kr/products/id/1335) | 23 | G마운트102MP/43.8×32.9mm, 883g/본체802g, 150×104.2×87.2mm. 5축8stop 같은CIPA렌즈조건. 기계7fps/전자4.1fps는35mm모드ON(기본3fps 별도). 내부UHD4K29.97p/10bit H.265, DIS OFF1.0배. ProRes SSD전용은 별도조건. EVF5.76Mdot/0.84배, 3.2인치3방향tilt LCD2.36Mdot. |
| [X-H2S](https://fujifilm-korea.co.kr/products/id/1220) | 23 | X마운트APS-C26.16MP/23.5×15.6mm, 660g/본체579g. 5축7stop CIPA XF35mmF1.4/pitch-yaw. 기계15fps/전자40fps, buffer시험CFexpress B/cold start는metadata. 내부6.2K3:2 29.97p/10bit H.265, DIS OFF1.0배. 고속4K120p/1.29배는별도모드. |
| [X-H2](https://fujifilm-korea.co.kr/products/id/1232) | 22 | X마운트APS-C40.2MP/23.5×15.6mm, 660g/본체579g. 5축7stop 같은CIPA렌즈조건. 기계15fps/전자20fps는1.29배crop(기본13fps 별도). 내부8K16:9 29.97p/10bit H.265, DIS OFF1.0배. 160MP픽셀시프트는복합출력이라센서화소에합치지않음. |
| [X-T30 III](https://fujifilm-korea.co.kr/products/id/1356) | 22 | X마운트APS-C26.1MP/23.5×15.6mm, 378g/본체329g, 118.4×82.8×46.8mm. 기계8fps/전자30fps는1.25배crop(기본20fps별도). 내부6.2K3:2 29.97p/10bit H.265 Long GOP MOV, DIS OFF1.0배. 영상디지털IS를body IBIS로승격하지않음. |

X-H2S의 한국 유효화소2616만은 raw26160000pixel→26.16MP로 변환했다. 26.1로 기억해 반올림하지 않았다. GFX sensor format은 공식 GFX/라지포맷 명칭을 보존하고 물리mm는 직접 사양값을 사용했다. X/GFX마운트·센서 크기·무게를 합치지 않았다. X-H2S/X-H2 LCD의 제조사 '멀티앵글'은 기존 허용 `multi-angle` 값으로 보존했다.

모든 운영 무게 claim은 `battery-and-card`, 본체만 claim은 `body-only`다. GFX100 II의 탈착EVF를 포함하는 대표 구성을 선택하고 948/867g의 EVF미포함 대안값을 conditions에 함께 보존했다. 같은 구성의 운용/본체만 무게를 비교하며 바디2개나 렌즈로 분리하지 않았다.

**주요 UNKNOWN:** GFX100 II의 EVF포함 치수 표기 혼선으로dimensions null; X-H2의 한국출시월 표기2022-06과 [공식 글로벌2022-09-08 소개](https://www.fujifilm-x.com/tr-tr/news/introducing-fujifilm-x-h2/)의 연혁 불일치로releaseDate null; X-T30 III의 직접적인sensor-shift/IBIS 유무근거가 없어ibis null. 슬롯 수는 저장매체 목록만으로 추정하지 않아5개 모두cardSlots null. 가격, AF 상세, 배터리Shots, 영상log, 셔터범위 등 이번field claim으로 확인하지 않은 값도null이다. 디지털IS의 존재는IBIS=true/false 근거가 아니다.

GFX100S II의 codec bitrate 표에59.94p가 있어도 실제4K모드표29.97p를 대체하지 않았다. X100VI Limited의2019-02 복사된 출시 표기도 inventory에 이상으로 남기고 날짜를 승격하지 않았다. 조건이 다른영상/무게/연사는 진짜같은조건 source충돌로 처리하지 않는다. **이번 accepted staging의 CONFLICTING_CLAIM_VALUES와 기존canonical value-conflict는0건**이다. 공식페이지의 의심스러운날짜/표기행까지 모두신뢰가능하다는뜻은아니다.

## Cheap-worker 실제 사용량과 검토

공개공식발췌와최소contract만 전달한 제품별독립task5개다. Adapter/secret/프로젝트코드/canonical전체는전송하지않았다. Dry-run5개는API횟수에넣지않는다. Worker의field후보/조건/UNKNOWN 경고를검토했으며patch/file변경은없다.

| 제품 / task ID | input / output / total token | 실제 호출 / 채택 결과 |
| --- | ---: | --- |
| GFX100 II / `fujifilm-production-001-gfx100-ii` | **1484 / 1185 / 2669** | attempt1 **730/643/1373**, MALFORMED_RESPONSE로폐기. 같은ID `--retry` attempt2 **754/542/1296** 정상. EVF별무게·CIPAlens·35mm연사·1.51crop·슬롯추정금지경고채택. sensor.format=G마운트와cropAtMax=배율제안은폐기. |
| GFX100S II / `fujifilm-production-001-gfx100s-ii` | **738 / 722 / 1460** | attempt1정상. 실제4K모드29.97p/SSD ProRes/본문무게조건채택. 센서format에센서모델을합친제안과프레임레이트만인video.max는주Codex가분리·정규화. |
| X-H2S / `fujifilm-production-001-x-h2s` | **722 / 721 / 1443** | attempt1정상. 26.16MP, 6.2K3:2와4K120분리, CH40crop미확정·slot추정금지경고채택. |
| X-H2 / `fujifilm-production-001-x-h2` | **699 / 834 / 1533** | attempt1정상. 전자20fpscrop/160MP복합출력분리/날짜보류경고채택. cropAtMax의모호한true-or-false제안은모드표1.0배에따라false로판단. |
| X-T30 III / `fujifilm-production-001-x-t30-iii` | **718 / 697 / 1415** | attempt1정상. digitalIS≠IBIS, UNKNOWN유지, 30fpscrop1.25와6.2K/FHD240분리경고채택. |
| **합계** | **4361 / 4159 / 8520** | 실제API6회, 형식실패1회, 같은ID수정재시도1회, 네트워크실패0회. 5제품모두정상채택응답확보. 실패토큰포함. |

Worker는추출/오독경고보조로유용했으나공식자료를직접확인하거나테스트를실행한주체가아니다. 주Codex가출시/scope, 17카드와2변형, 5개ID/aliases/mount/kind, 공식source적용범위, 112claim/조건/UNKNOWN, worker5결과, 전체diff및CLIapproval/apply를판단했다. 사용자추가개입 **0회**다. 'human review'는parent의직접검토게이트명이며사용자가각claim을직접승인했다고표시하지않았다. 전송용임시fixture5개는삭제하고Git에포함하지않았다.

## 최소 변경과 후속 경계

- 기존vocab에공식 **Fujifilm G**와별칭만추가했다. schemaVersion/contract/추천엔진/UI는유지했다. `cameraCatalog.test.js`의허용마운트에도G를추가하고첫6개기존렌즈풀검증은유지했다.
- Nikon감사테스트가과거승인vocab과현재vocab의바이트동일성을전제했다. 현재registry는추가가능하도록기존entry불변성을검증하고, 과거vocab은sealed transaction evidence/digest와archived verifyIncoming/proposedCanonical로검증한다. 과거artifact는변경하지않았다.
- Sony감사테스트가전브랜드scope목록을FR7하나로고정하여새IR추가후1건실패했다. Sony브랜드범위로검사하도록보완했다. 최종전체회귀는모두통과한다.
- 새승격/validation/atomic apply버그는없다. 영상/연사/탈착EVF조건은claim archive에보존되지만단일대표값만소비하는기존UI/추천경로의조건전달은별도후속표현과제다. 사람용diff의값/출처요약외에staging.conditions도직접검토했다.
- GFX는DB에정상들어가지만현36개렌즈에G마운트렌즈가없고기존센서format ranking/crop-factor표도GFX를포함하지않는다. UNKNOWN비교·렌즈조합한계는추천엔진후속범위이며이번에고치지않았다.
- PROVIA/Velvia/Classic Chrome/ACROS 등필름시뮬레이션은현재객관수치/제품identity claim으로저장하지않았다. 기능/경험영역후속후보로만남기며Experience DB를시작하지않았다.
- 다음신규4개중GFX100RF/X half는고정렌즈다. Nikon audit의기존 `fixedLens.equivalentFocal` 단위변환/검증공백은별도should-fix로남아있다. 다음고정렌즈수집전해당작은unit regression보강을분리해처리하는편이안전하다. 이번5개교환식사양은이경로를사용하지않는다.

## 검증과 재개 지점

Raw10개 `accessedAt`은raw-helper가자동생성한실제UTC ISO **2026-10-02T03:51:52.351Z~2026-10-02T03:51:52.359Z**다. 날짜만입력하거나00시로합성하지않았다. ISO밀리초구조와Date round-trip을회귀검증했다.

승인 diff digest **54ccc4891d0dbfa50304f82c48d4c60868879a30992eea99f82fc7e89dab9f5d**, approval ID **approval-d743378e1680836abc5df9b45bab4632d864a32e4428f20e08b98410a8ddbd91**, canonical after SHA **fdde584efd7bae388ccf9dea73b0b1da3ec420bf9ff548a66233bc8644e02022**다. Nikon004 expected→Fujifilm001 baseline→after 연결, 보관 원본·승인·결과 재현과 기존 제품·렌즈 불변성을 검증했다.

- 전체 **159/159**, Objective/production **119/119**, 신규Fujifilm **5/5**.
- 전체canonical **143개 validation 통과**.
- `pnpm build` 통과(기존500kB초과chunk경고만존재), Objective scripts6개/변경test4개 **node --check10파일**, `git diff --check` 통과.
- 실제production재적용 **already-canonicalized / canonicalMatches:true**. 재개후에도동일결과를확인했다.
- 실제production4개IBIS객체와운영/본체무게claim은통과. 메모리변형IBISboolean/malformed는INVALID_IBIS, weight basis누락/invalid/mismatch는기존3error code로validate에서차단했다. 원본artifact는그대로다.

종료신규미등록 **4identity/5카드: GFX ETERNA55, GFX100RF(+FRAGMENT 카드), X-E5, X half**. announced/upcoming0, IR1및Instax별도10후보는보류다. 기존canonical5개의field-level provenance보강은이번coverage신규수와별도과제다. 다음에는이4개를최대batch로진행하고, 억지로5개를채우지않는다. 남은새identity를처리한뒤기존legacy5개와한정판mapping을포함한전체coverage audit으로넘어간다.
