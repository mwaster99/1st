# Fujifilm production batch 003 — 2026-10-06

## 대상 및 직접 검토

시작 working tree clean. 기존 canonical 바디111/렌즈36/전체147과 inventory, batch001~002 manifest/transaction, 진행 문서, identity-map, field contracts를 대조했다. 대상은 기존 **X-T5 / X-T50 / X-S20 / X-M5 / X100VI** 그대로이며 신규 선정·생성을 하지 않는다. 이름/ID/series/model/aliases/mount/kind/bodyStyle 및 가격은 보존한다. Canonical JSON은 수동 편집하지 않고 기존 production approval/atomic apply만 사용한다.

[한국 공식 현행 목록](https://fujifilm-korea.co.kr/products/camera)에 다섯 모델이 모두 노출된다. 제품별 한국 출시월 2022-11/2024-06/2023-06/2024-11/2024-02는 과거다. SOLD OUT은 재고 상태로 구분했다. 일반14 identity/16카드, 제한 IR1 identity 및 한정판 base-link 정책은 그대로다. Gallery의 총18 표기와 실제17카드 차이를 새로운 제품으로 해석하지 않았다. 초기 inventory 및 과거 완료 checkpoint는 역사 기록으로 유지한다.

## 승인 전 사람이 읽는 diff 검토

아래 집계는 `summarizeCanonicalDiff`의 **서로 다른 path/category 수**다. 동일 path를 두 source가 증명하는 claim을 필드 두 개로 세지 않는다.

| 제품 | same-value/new-evidence | null-fill | value-conflict | UNKNOWN | 이번 공식 source / claim |
| --- | ---: | ---: | ---: | ---: | ---: |
| X-T5 | 10 | 16 | 1 | 0 | 2 / 33 |
| X-T50 | 4 | 23 | 0 | 0 | 3 / 33 |
| X-S20 | 8 | 18 | 0 | 1 | 2 / 33 |
| X-M5 | 5 | 18 | 0 | 2 | 2 / 31 |
| X100VI | 8 | 23 | 0 | 2 | 2 / 39 |
| 합계 | 35 | 98 | 1 | 5 | 11 / 169 |

139개 unique 필드 중 알려진134개를 승격하고 UNKNOWN5개는 ignore한다. Sources는 한국 제품 사양 + 공식 매뉴얼 사양이며 X-T50만 셔터별 연사를 직접 증명하는 글로벌 사양을 추가했다. 기존 제품 업데이트의 identity-only source를 새 identity 승격인 것처럼 다루지 않고 **각 신규 source를 실제 field claim에 연결**했다. 기존 legacy source도 삭제하지 않으므로 적용 후 전체 source record는 제품별3/4/3/3/3개이며 이번 batch source 수와 구분한다.

**유일한 value-conflict 직접 판단:** X-T5 `specs.video.max`의 기존 `6.2K 30p`는 반올림된 제품 홍보 표기이고 기존 legacy-unverified 값이다. [한국 상세 사양](https://fujifilm-korea.co.kr/products/id/1235)의 내부 SD 6.2K16:9 모드는 6240×3510/최대29.97p다. 이를 `6.2K 29.97p`로 명시적으로 승인한다. 성능 상승이나 별도 모드가 아니며 영상 단일 문자열 schema는 변경하지 않는다. 이외 known 기존값은 공식 자료와 동일하다. X-S20 IBIS 객체의 기존 manufacturer-maximum 설명도 값은 유지하고 CIPA/yaw·pitch/XF35mmF1.4 R 조건을 새 claim metadata에 보강했다. 승인 `--allow-value-conflicts`는 이 단 하나를 직접 검토한 이유와 함께 사용하며 `--allow-new-products`는 사용하지 않는다.

## 제품별 공식 데이터

- [X-T5 한국 사양](https://fujifilm-korea.co.kr/products/id/1235), [공식 매뉴얼](https://fujifilm-dsc.com/en/manual/x-t5/technical_notes/spec/): APS-C40.2MP/23.5×15.7mm/X-Trans5HR, 기존557g·본체476g·129.5×91×63.8mm·NORMAL LCD580장을 재검증. IBIS5축7stop(CIPA yaw/pitch·XF35F1.4), 기계CH15fps/전자20fps1.29crop(native13), 6.2K16:9 29.97p H.26510bit/1.23crop, F-Log/F-Log2. EVF3.69Mdot/0.8, LCD3인치1.84Mdot/3방향tilt touch, UHS-II SD2슬롯. Pixel-shift160MP는20프레임 합성이므로 sensor.megapixels에 넣지 않았다.
- [X-T50 한국 사양](https://fujifilm-korea.co.kr/products/id/1334), [매뉴얼](https://fujifilm-dsc.com/en/manual/x-t50/technical_notes/spec/), [글로벌 사양](https://www.fujifilm-x.com/global/products/cameras/x-t50/specifications/): 기존APS-C40.2MP/438g를 재검증하고 X-Trans5HR/23.5×15.7mm/본체389g/123.8×84×48.8mm를 추가. IBIS5축7stop 조건, 6.2K16:9 29.97p10bit/1.23crop/F-Log·F-Log2, 전자20fps1.29crop/native13, 글로벌 명시 기계8fps. EVF2.36Mdot/0.62, LCD3인치1.84Mdot tilt touch, SD UHS-II1슬롯, NORMAL LCD305장.
- [X-S20 한국 사양](https://fujifilm-korea.co.kr/products/id/1262), [매뉴얼](https://fujifilm-dsc.com/en/manual/x-s20/technical_notes/spec/): 기존APS-C26.1MP/X-Trans4/491g·본체410g/127.7×85.1×65.4mm/IBIS5축7stop를 재검증. 센서23.5×15.6mm, IBIS CIPA/yaw·pitch/XF35F1.4 조건, 6.2K3:2 6240×4160/29.97p10bit/DIS OFF1.0crop, 기계8/전자30fps1.25crop(native20), EVF2.36Mdot/0.62, LCD3인치1.84Mdot vari-angle touch, SD UHS-II1슬롯, NORMAL750장 추가. 검토한 페이지에서 log 직접 근거를 확보하지 못해 UNKNOWN.
- [X-M5 한국 사양](https://fujifilm-korea.co.kr/products/id/1337), [매뉴얼](https://fujifilm-dsc.com/en/manual/x-m5/technical_notes/spec/): 기존APS-C26.1MP/355g/111.9×66.6×38mm 유지, X-Trans4/23.5×15.6mm/본체307g 추가. 6.2K3:2 6240×4160/29.97p10bit/F-Log2, 기계8/전자30fps1.25crop(native20), LCD3인치1.04Mdot vari-angle touch, SD UHS-I1슬롯, NORMAL330장. 매뉴얼 EVF `—`는 present:false의 직접 근거다. Digital IS/IS MODE BOOST는 영상 전용이며 **IBIS:null** 유지. 센서 시프트나 IBIS 부재를 명시하는 자료가 아니라 기능 누락만으로 false를 추정하지 않았다. 선택모드 crop UNKNOWN.
- [X100VI 한국 사양](https://fujifilm-korea.co.kr/products/id/1330), [매뉴얼](https://fujifilm-dsc.com/en/manual/x100vi/technical_notes/spec/): 기존fixed/mount null/521g/APS-C40.2MP/실제23mm/F2 유지. 환산35mm, 본체471g(배터리·액세서리·카드 제외, 내장렌즈는 포함), 128×74.8×55.3mm/X-Trans5HR/23.5×15.7mm 추가. IBIS5축6stop(CIPA yaw/pitch, EVF/LCD), 6.2K16:9 29.97p10bit/1.23crop, 전자20fps1.29crop/native13, EVF3.69Mdot/0.66와 별도OVF 구분, LCD3인치1.62Mdot tilt touch, SD UHS-I1슬롯. NORMAL EVF310장을 대표값으로 선택하고 LCD320/OVF450을 metadata에 보존. Log/기계 최대 연사는UNKNOWN.

모든 영상 대표값은 내부SD/H.265 모드이며 외부 RAW/HDMI bit depth와 합치지 않았다. FHD240p 고속은 별도 conditions다. Video crop는 선택한6.2K 모드의 DIS OFF1.23/1.0에만 적용한다. 단일 `video.max` 소비 경로가 모드/조건을 모두 보여주지 못하는 기존 한계는 후속 후보이며 엔진/UI/schema를 수정하지 않았다.

X100VI focal min=max23mm / equivalent min=max35mm / aperture wide=tele2로 기존 prime 정책을 유지한다. 실제/환산4claim 모두 rawUnit/staging/diff unit mm. 별도 lens product 생성 없음. 기존 `getIntegratedLens()`는 includedInBodyId/weight:null/price:null 표현만 반환하고 독립 lens pool에 없으므로 전체521g을 두 번 세지 않는다. Film simulation/가격/Experience/렌즈 coverage/IR/한정판 고유 feature는 미승격.

## 출처 이상과 UNKNOWN 판단

Accepted 서로 다른 source의 같은 path 값 충돌은0. 실제 다른 claim 값을 조작한 regression은 `CONFLICTING_CLAIM_VALUES`로 차단한다. 아래 원문 문제를 무조건 일치한다거나 조용히 교정했다고 숨기지 않았다.

1. X-T50 한국 shutter/battery 부분의8K 템플릿 문구: 실제6.2K recording 표/매뉴얼과 구분하며8K claim을 생성하지 않음.
2. X-T50 한국LCD의3-way 표현: 매뉴얼/글로벌은tilt-type이므로 현재enum tilt까지만 승격, 방향수 UNKNOWN. 한국 CH8fps는 electronic으로 잘못 표기되어 있어 기계8fps는 글로벌의 명시 Mechanical 행만 근거로 사용.
3. X100VI 한국 summary의6240×3150과 상세기록표3510 불일치: 대표mode의 locator/metadata는 상세3510을 사용하고 이상을 unpromoted context에 보존.
4. X100VI CH11fps는 한국/글로벌 행이 electronic으로 표기되어 있어 기계최대11이라고 추정하지 않음. 기계 최대UNKNOWN. 상세video/log 원문 누락으로XS20/X100VI log도UNKNOWN.
5. Worker의 XT5 SD UHS-I vs UHS-II 충돌 제안은 잘못된 해석: 한국목록은 두 규격 모두, 매뉴얼은2슬롯 UHS-II를 명시. DIS ON 불가와OFF1.23도 충돌이 아닌 서로 다른조건.

승인 전 raw 초안 검토에서 영상10bit의 매뉴얼 인용이 한국 source에 연결된 것을 발견해 해당claim을 매뉴얼 source로 이동했다. X100VI video locator도 요약 typo행에서 상세 mode행으로 수정했다. Raw 재생성 시 원래 accessedAt을 명시적으로 보존하고 normalize/validate/diff를 다시 수행했으며 이전 production artifact는 수정하지 않았다. 이들은 수집 초안의 직접 검토 교정이며 pipeline codebug/validator 재설계가 아니다. 글로벌 공개페이지의 curl403은 web 도구로 직접 확인하여 처리했으며 worker/API 실패로 집계하지 않는다.

## Cheap-worker

공개 제조사 발췌와 최소 contract만 전달하는 일회성 파일5개를 사용했다. 코드/canonical 전체/설정/secret은 전달하지 않았다. 동일한 independent task5개, 실제API 제품당1회/총5회, attempt1, retry0/failure0. `analysis` envelope를 검토했고 patch/files를 적용하지 않았다.

| 제품 / stable task | input | output | total |
| --- | ---: | ---: | ---: |
| X-T5 / fujifilm-production-003-x-t5 | 2105 | 1212 | 3317 |
| X-T50 / fujifilm-production-003-x-t50 | 1712 | 1288 | 3000 |
| X-S20 / fujifilm-production-003-x-s20 | 1608 | 1104 | 2712 |
| X-M5 / fujifilm-production-003-x-m5 | 1527 | 1613 | 3140 |
| X100VI / fujifilm-production-003-x100vi | 1634 | 932 | 2566 |
| 합계 | 8586 | 6149 | 14735 |

채택: 무게기준/IBIS 시험조건·디지털IS 분리/actual·equivalent 분리/내부와 외부영상/UNKNOWN·원문이상 경고. 폐기: XT5 카드규격 충돌과 mode crop 불확실 주장(직접표확인), XT50 CH전자연사를 영상high-speed로 부른 부분, XS20 사진burst를영상high-speed로 부른 부분, XM5 이미 매뉴얼에 제공된10bit를없다고 한 부분, X100VI prime tele aperture를null로 만들자는 제안·IBIS 시험에roll축을 추가한 부분·DIS ON/OFF를뒤집은 해석. 기존 prime schema는 wide=tele2를 유지하고 IBIS측정조건은CIPA yaw/pitch만 사용한다.

GPT-6.1 Sol이5identity/mapping/공식source 범위/139필드·169claim/조건/UNKNOWN/충돌원인과승인/atomic apply를 직접 판단했다. 사용자 추가 자료입력·승인 요청 **0회**. Worker는 보조검토이며 사실확정 주체가 아니다. 원본 결과 `/tmp/fuji003-worker-1.json`~5와공용ledger는 유지하며 사용량/채택·폐기는 이 문서에 기록했다.

## Production checkpoint

Batch ID `production-fujifilm-bodies-003`. Strict validator 기본값을 사용하며 archive compatibility mode 없음. 승인 전 기존 전체 테스트172/172 통과. Diff digest `3a65d8a4a58b67b4b01c063f9e8fe3be8e7d06aa9ae952288bf7bf04f0ac56ee`.

완료: raw → normalize → validate → diff/조건 직접 검토 → 명시적 conflict approval → atomic apply → canonical validation → idempotent reapply. 신규0/기존5, 바디111/렌즈36/전체147 그대로다. 승인 `approval-24dcd084febf22b2bb394c655b8409f2017804c006612259b2442ec71281d99a`, baseline SHA `0c21fdb4f109e4153db653b223e40dff3142001b5a41b623e874ba6c492ae46d`, after SHA `f58511cd8bf98568f8e38f2b557be655b572e2c722f0903b34b208ae947ac310`. Journal completedAt `2026-10-06T03:49:38.964Z`와 manifest5개 모두canonicalized. 재적용은 **already-canonicalized / canonicalMatches:true**이며 중복source/claim/제품이나 추가쓰기가 없다.

Raw11개 accessedAt은helper가생성한 실제UTC **2026-10-06T03:45:07.063Z~.067Z**다. 초안 source 연결 교정 시 해당 명시 timestamp를 보존했다. 밀리초ISO구조/Date round-trip 모두 검증했고 날짜자정합성은 없다.

신규 회귀7개는 기존identity/가격/비대상제품·렌즈불변, 원자적approval/digest/replay, category구분·명시적conflict,169claim/134fieldEvidence·11sources/source귀속, weight/IBIS/mm/source-conflict차단, X100VI실제추천시나리오521g·lensCount0·카메라1개만BUY,조건/UNKNOWN,inventory14identity 및과거checkpoint/variant구분을검증한다. 테스트 초안에서 동일path의첫claim이manual이라pixel-shift조건이없던조회1건,upgrade시나리오API에first구매입력을잘못준1건이실패했다. 적합한claim선택과기존upgrade입력계약으로 테스트만 교정한뒤모두통과했다. engine/production artifact는수정하지않았다.

최종 전체 **179/179**, Objective/production **139/139**, Fujifilm **18/18**. Canonical **147개 valid**, `pnpm build` 성공(기존500kB초과chunk경고,685.07kB), Objective6scripts+신규test총7files `node --check`, `git diff --check` 통과. 공개workerfixture5개는삭제했고Git에포함하지않는다. Canonical 변경은atomic apply만, pipeline코드/계약/vocab/catalog-scope/추천엔진/UI/Experience/기존production artifact변경없음.

종료현재in-scope released/current **14base identity 전체production provenance 보유**,미등록0/production provenance미처리0/기존legacy보강잔여0, upcoming0. Limited/FRAGMENT은기본모델 coverageViaBaseBatch만연결하고고유사양검증완료로표시하지않는다. IR/Instax deferred 유지. 이는 Korea snapshot 범위이며 전세계모든Fujifilm제품의완료주장은아니다. **다음은 Fujifilm production coverage audit**이다. Audit 자체는이번batch에서실행하지않았다.

재개 시 `node scripts/objective/ingest.mjs status --batch production-fujifilm-bodies-003`, journal/expectedCanonicalDigest, 이문서를확인하고완료된worker/raw/approval/apply를다시수행하지않는다. Local batch commit으로기록하며push하지않는다.
