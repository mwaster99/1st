# Objective DB v0.4 진행 기록

## Stage 4 Fujifilm Korea coverage audit — 2026-10-06

완료. 시작 git clean, baseline `44d6034`. 기존 inventory/batch001~003/완료 보고서/canonical/identity-map/catalog-scope/field contracts/과거 3브랜드 audit를 대조하고 한국 공식 gallery+17제품페이지+Instax gallery를 실제 UTC **04:10:31.008Z~04:10:34.286Z**에 재조회했다. 실제 **17카드(GFX6/X11)**는 기존과 같고 사이트 상단의 총18 표시는 실제 카드 합계와 불일치한다. 신규/삭제/상태·variant 변경0, 과거 snapshot/checkpoint와 raw accessedAt 불변.

**기본 identity15 / 일반 released-current14 / production provenance14 / linked variant2 / X·GFX deferred1 / 일반 미처리0 / 중복·모호0 / critical0**. Canonical **111/36/147 유지**, SHA `f58511cd8bf98568f8e38f2b557be655b572e2c722f0903b34b208ae947ac310`. 현행 일반 카메라 Objective 제품 coverage **1차 완료**로 판정한다. IR은 구매자 계약/분광 필터·전문 목적 때문에 deferred 유지, Instax10카드는 별도분모의 analog6/hybrid3/digital Pal1로 구분하여 재검토 조건을 scope registry에 추가했다. FRAGMENT는 필름 레시피와 일부 모노크롬 제외의 **기능 차이도 있는 variant**이며 외관만 동일하다고 단순화하지 않았다. Limited는 외장/판매 edition, 두 카드 모두 기존 base에 연결하며 기능을 기본제품에 승격하지 않는다.

366 verified claims /331 fieldEvidence paths. Known specs 말단365 중 verified364/공식 참조-only1/legacy-only0/미분류0. 신규9개는 구조화된 identityEvidence, 기존보강5개는 reviewed-map+공식 identity 확인이 있으나 전용 객체는 누락. **Should-fix14**(identityEvidence5+X100VI label evidence1+cardSlots8), **acceptable UNKNOWN27**은 제품/경로별 감사 항목으로 [감사 snapshot](../src/data/ingestion/fujifilm-coverage-audit-2026-10-06.json)에 전부 기록했다. 모든 null 전수 집계 또는 엔진 완성 선언이 아니다.

세 fixed prime GFX100RF/Xhalf/X100VI는 fixed/mount null, actual35/10.8/23mm와 eq28/32/35mm 분리, apertureF4/F2.8/F2,12focalclaims raw/staging/diff mm. Strict archive replay 및 단위누락 차단 검증, 별도lens/무게 이중계산 없음. XM5 digitalIS→IBIS 오인없음. Batch001~003의30raw와 모든 sealed artifact/digest/approval/transaction chain 재현, missing/mismatch0, 메모리 재적용 no-op. 기존 artifact를 재작성하지 않았다.

GFX ranking/cropFactor 및 G마운트 렌즈 coverage, 조건부video/burst/opengate/RAW/ProRes/pixelshift/firmware 단일값 소비는 별도 cross-brand backlog다. 읽기 전용 재현에서 영상 비교 fps 정규식이29.97p→97p로 읽는 기존 엔진 버그도 발견해 [상세감사](OBJECTIVE_DB_FUJIFILM_COVERAGE_AUDIT.md)에 기록했다. 추천/UI/schema/가격/Experience/production 데이터 수정 없음.

Coverage8개 신규, 전체 **187/187**, Objective/production **147/147**, Fujifilm **26/26**, canonical147 valid, build/7files node --check/git diff --check 통과. 기존 build chunk경고만 남음. 변경5개는 감사doc/진행doc/auditJSON/coverage test/Instax scope entry이며 워킹트리에 저장(commit/push 미수행). 다음 **B5 Panasonic / OM System**, Panasonic 공식 inventory부터 별도세션에서 시작 가능. 이번 audit 범위 미완료 작업 없음; 데이터 should-fix와 소비엔진 backlog는 별도 후속으로 유지한다.

## Stage 4 Fujifilm Korea production batch 003 — 2026-10-06

시작 working tree clean. Inventory/batch001~002/canonical/identity-map/field contracts를대조하고공식Korea현행목록/과거출시월을확인했다. 기존 **X-T5/X-T50/X-S20/X-M5/X100VI**만보강, 신규0/기존5, **바디111/렌즈36/전체147 유지**. 이름/ID/aliases/mount/kind/가격및비대상제품불변. 기존production pipeline으로raw→normalize→validate→사람용diff/조건검토→명시적approval→atomic apply→canonical validation→재적용까지완료했다.

Officialsources제품별 **2/3/2/2/2**, raw11/claims169. Unique같은값근거 **35**,nullfill **98**,conflict **1**,UNKNOWN **5**. X-T5 legacy `6.2K 30p`와사양표29.97p차이를반올림홍보표기로판단해정확한`6.2K 29.97p`로명시승인했으며자동덮어쓰기/new-product승인은없다. 기존5개의v0.4fieldEvidence **0→134**(27/27/26/23/31),Korea일반14base identity전체production provenance 보유로보강잔여 **0**. 과거inventorycheckpoint유지,Limited/FRAGMENT은base-link만표시,IR/Instaxdeferred유지.

센서물리크기/세대·무게기준·본체만무게·IBIS/CIPA조건·내부6.2K29.97p10bit모드·crop/셔터별burst·EVF/LCD/물리슬롯·NORMAL배터리조건/출시월을보강. X100VI는기존fixed/mountnull,실제23/환산35mm/F2prime,strict4focalclaims mm,별도lens생성없음. 실제추천시나리오전체무게521g한번/lensCount0/BUY카메라1개검증. XM5digitalIS를IBIS로승격하지않아IBISnull,미확정영상crop도UNKNOWN. XS20/X100VIlog및X100VI기계최대burst는직접근거부족으로UNKNOWN. Pixel-shift160MP/외부RAW/영상고속/OVF배터리조건을대표센서·영상·EVF와합치지않음.

원문이상(XT50한국8K/3방향LCD/기계8fpslabel,X100VI3150vs3510)과worker의카드/IBIS/crop/prime오해는직접구분해미승격/상세근거선택을기록했다. 승인전raw초안의10bit매뉴얼source귀속과X100VI영상locator를교정후재검증. Accepted source값충돌0,새pipeline코드bug없음;단일video.max의조건소비한계는후속후보. 엔진/UI/Experience/schema/vocab/기존productionartifact변경없음.

Worker독립5tasks/API5/attempt1/retry0/failure0,token **8586input/6149output/14735total**. 공개source+최소계약만전달,fixture5개삭제. 사용자추가개입0회,Sol이139필드/169claims/identity/조건/UNKNOWN/충돌/승인·apply를판단. UTChelperaccessedAt **2026-10-06T03:45:07.063Z~.067Z**,교정시명시값보존/ISO검증완료.

전체 **179/179**,Objective/production **139/139**,Fujifilm **18/18**,canonical147valid,build/node --check7files/git diff --check통과. Build기존chunk경고만남음. 재적용 **already-canonicalized / canonicalMatches:true**. Diff `3a65d8a4a58b67b4b01c063f9e8fe3be8e7d06aa9ae952288bf7bf04f0ac56ee`,approval `approval-24dcd084febf22b2bb394c655b8409f2017804c006612259b2442ec71281d99a`,after SHA `f58511cd8bf98568f8e38f2b557be655b572e2c722f0903b34b208ae947ac310`. [상세보고](OBJECTIVE_DB_FUJIFILM_PRODUCTION_003.md). 다음 **Fujifilm coverage audit** 준비완료,이번에audit실행은하지않았다. 완료batch를재수집하지않고checkpoint부터확인한다.

## Stage 4 Fujifilm Korea production batch 002 — 2026-10-02

시작 clean, baseline `efe747f`, 바디107/렌즈36/전체143. 지정된released/current 신규4개 **GFX ETERNA 55, GFX100RF, X-E5, X half/X-HF1**의한국공식현행카드/출시월을재확인하고독립worker4task→raw-helper→strict normalize/validate→사람용diff 및conditions직접검토→explicit approval→atomic apply→canonical validation→실제idempotent reapply를완료했다. **85verified claims, 신규4/기존0, 바디111/렌즈36/전체147**, 이전143개객체보존. 카메라JSON직접편집/추천/UI/Experience/schema/기존artifact변경없음.

ETERNA는G마운트직접운용시네마in-scope/compact, 본체만2.0kg→2000g/body-only이고운용weight는null. 내부8K29.97와외부HDMI12bitRAW,4Kopen-gate48p를분리. 본사공식dual slots근거로CFexpressB+SD2슬롯,내장3인치LCD와외장5인치조건구분. GFX100RF는actual35/eq28mm/F4, X half는actual10.8/eq32mm/F2.8;둘다fixed/mount null/prime,별도lens없이전체무게한번,8focalclaims모두raw/staging/diff mm. X-E5는CIPA2024중심7/주변6stop,전자20fps1.29crop,내부6.2K6240×3510/H26510bit1.23crop과외부RAW6240×3512를분리. X half합성해상도/half-frameUX를sensorMP/성능으로승격하지않음. Film simulation/가격제외.

Sources제품별3/2/2/2, raw9/URL6, source/value conflict0. Strict unit/weightBasis/IBIS 실제staging회귀검증통과;archive compatibility mode신규production에서사용안함. UTChelper accessedAt04:43:53.178Z~.181Z. worker **4780/4330/9110 tokens**,API4/retry0/failure0;오해한IBIS/무게/codec-슬롯충돌제안은직접폐기,공식근거로확정. 사용자개입0회,공개fixture4개삭제.

전체 **172/172**,Objective/production **132/132**,Fujifilm **11/11**,canonical147valid,build/node --check7files/git diff --check통과. 재적용 **already-canonicalized/canonicalMatches true**. Diff `fd3826955907b3cc06483ed244c930548e3e75248c195fc7b61f76d65ce5cbdd`, approval `approval-5e6a813ad01c94f7dd3ee6ed7f50472c4e9d32eca05c094ed79d4a75f4a4ca5c`,after SHA `0c21fdb4f109e4153db653b223e40dff3142001b5a41b623e874ba6c492ae46d`.

한국일반14identity모두canonical연결, **신규미등록0**,production검증9/기존legacy보강5를구분. FRAGMENT카드는기본GFX100RF에연결하되별도production검증으로위장하지않음. 초기집계/batch001완료이력유지,batch002완료checkpoint추가. 다음기존5개provenance보강후coverage audit. 세로FHD/복수모니터/영상조건표현은후속후보,새pipeline codebug없음. [상세보고](OBJECTIVE_DB_FUJIFILM_PRODUCTION_002.md).

## Stage 4 Fujifilm Korea production batch 001 — 2026-10-02

시작 working tree clean, baseline `add35a7`, canonical 바디102/렌즈36/전체138이었다. 공식 Korea 카메라 목록과 개별17개 제품 페이지를 확인해 [inventory snapshot](../src/data/ingestion/fujifilm-current-camera-gallery-2026-10-02.json)을 작성했다. GFX6/X11 카드 중 한정판2개는 공식 기본 모델 identity에 연결하되 변형/URL/기능 차이를 inventory에 보존했다. **17카드/15모델 identity = 일반 released/current14identity(16카드) + 제한형IR1identity**, upcoming0이다. 별도 공식 Instax 목록10개는 즉석사진/휴대폰·프린터 workflow scope 검토 대상으로 분리했다. IR 구매 자격·필터·계약 조건은 catalog-scope에 기록했다. ETERNA55는 직접 운용 시네마라 in-scope다.

시작 시 기존 현행 canonical5개(X-T5, X-T50, X-S20, X-M5, X100VI; 한정판 포함6카드), 신규 미등록9개(10카드)였다. 기존5개를 v0.4 production 검증 완료로 재표시하지 않았다. 신규 **GFX100 II, GFX100S II, X-H2S, X-H2, X-T30 III**를 고화소 GFX/고속 APS-C/고화소 APS-C/경량형으로 선정했다. 각 제품 공식 사양1개+gallery identity-only1개, **2source씩/총10 raw artifact(서로 다른 URL6개)**, verified claim112개로 기존 pipeline을 완료했다. 신규5개/기존보강0개, canonical **바디107/렌즈36/전체143**이다. 이전138개 제품은 동일하며 cameraProducts.json 수동 편집 없이 atomic apply만 사용했다.

[전체 batch 보고](OBJECTIVE_DB_FUJIFILM_PRODUCTION_001.md)에 inventory 전체, 공식 자료의 표기 이상, 제품별 승격/UNKNOWN/조건, worker 사용량·채택/폐기 결과, 승인/digest와 다음 범위를 기록했다. G마운트 vocab/별칭과 catalog 마운트 테스트만 확장했다. GFX 물리 sensor.sizeMm43.8×32.9와 APS-C23.5×15.6은 직접 검증값이다. GFX100 II는 제공EVF 포함1030g/본체949g 구성을 선택하고 대안 무게를 conditions에 보존했다. GFX100 II dimensions, X-H2 releaseDate, X-T30 III IBIS와 전제품 cardSlots 등 직접 확정하지 못한 값은 null이다. Digital IS≠IBIS, pixel-shift복합출력≠센서화소, 내부10bit녹화≠외부RAW, 전자연사crop/35mm모드 조건을 지켰다. Film simulation·가격·렌즈·Experience·추천 엔진/UI는 추가/변경하지 않았다. Accepted source/value conflict0건이다.

Cheap-worker는 제품별 독립5task, 실제API6회였다. GFX100 II 첫 응답의 MALFORMED_RESPONSE1건을 폐기하고 같은ID로 허용된1회 재시도해 정상 응답을 확보했다. 실패 포함 input/output/total: GFX100 II **1484/1185/2669**, GFX100S II **738/722/1460**, X-H2S **722/721/1443**, X-H2 **699/834/1533**, X-T30 III **718/697/1415**, 총 **4361/4159/8520**. 마운트를 센서format으로 제안하거나 배율을boolean으로 제안한 부분 등은 주Codex가 폐기·교정했으며, EVF 무게/모드/crop/RAW/UNKNOWN 경고는 직접 검토 후 채택했다. 프로젝트 코드/canonical전체/secret은 전송하지 않았고 임시 fixture5개는 삭제했다. 사용자 추가 개입0회, 주Codex가112claim/identity/scope/조건/diff/approval/apply를 판단했다.

Raw10개 accessedAt은 helper 자동 실제UTC **2026-10-02T03:51:52.351Z~03:51:52.359Z**다. ISO/date round-trip 회귀를 통과했다. 승인diff **54ccc4891d0dbfa50304f82c48d4c60868879a30992eea99f82fc7e89dab9f5d**, approval **approval-d743378e1680836abc5df9b45bab4632d864a32e4428f20e08b98410a8ddbd91**, after SHA **fdde584efd7bae388ccf9dea73b0b1da3ec420bf9ff548a66233bc8644e02022**. Nikon004 expected와 이번 baseline은 연결된다. 실제재적용 **already-canonicalized/canonicalMatches:true**이며 중단 후 재개에서도 manifest와 digest를 스캔하고 이미 완료된 수집/worker/승격을 다시 시작하지 않았다.

검증: 전체 **159/159**, Objective/production **119/119**, 신규Fujifilm **5/5**, canonical **143개 validation**, build, Objective scripts6개/변경test4개 node --check, git diff --check 통과. Build는 기존500kB chunk 경고만 남았다. 실제 IBIS객체/무게기준과 메모리 변형의 INVALID_IBIS 및 weight basis 누락/invalid/mismatch 차단을 검증했다. 확장 전제 테스트의 작은 문제2곳(Sony 전브랜드scope를FR7로고정, Nikon 과거vocab과현재registry 바이트동일성)을 보완하고 모든 과거 production fixture/archived digest를 유지했다. Pipeline 승격/validation 코드 변경은 없다.

종료 신규 미등록 **4identity/5카드: GFX ETERNA55, GFX100RF(+FRAGMENT 카드), X-E5, X half**, upcoming0이다. 기존legacy5개 provenance 보강은 별도다. 다음에는 남은4개를 처리하며5개를 억지로 채우지 않는다. GFX RF/X half 고정렌즈 수집 전 기존 equivalentFocal 단위변환/검증 gap을 별도 작은 수정으로 보강하는 것이 안전하다. GFX 렌즈 없음/센서format 비교표/단일 video·burst·EVF 조건 소비 한계는 엔진·표현 후속 범위로만 남겼다.

## Nikon Korea production coverage audit — 2026-10-02

시작 working tree clean, baseline commit `da3d5d4`였다. 공식 미러리스/DSLR/compact/Z Cinema 갤러리의 카드와 기존 inventory를 다시 대조했으며 추가/제거/상태 변경은 없었다. 직접 운용 카메라 **22개 = released/current canonicalized 21개 + announced/upcoming Z5IIC 1개**다. Nikon 공식 E Shop의 Z5IIC BK/SL 모두 **[발매 예정]** 표기를 확인했고, 10월에 들어섰다는 이유로 출시 완료/production으로 승격하지 않았다. RED 외부 카탈로그는 Nikon Korea 개별 카드 분모 밖이며 deferred-special 0개다. 출시 완료 미처리·중복/모호·상태 미기재·critical은 모두 **0건**으로 **Nikon 현행 직접 운용 카메라 제품 coverage 1차 완료**로 판정한다.

전체 결과와 집계 기준은 [Nikon coverage audit](OBJECTIVE_DB_NIKON_COVERAGE_AUDIT.md)에 기록했다. 알려진 specs leaf 222개는 verified 183개 / 공식 경로 참조-only 32개 / legacy-only 7개 / 근거 분류 없음 0개다. 기존 5개 identity-map/identityEvidence 및 field-level metadata, legacy 사양, 영상/카드 슬롯 gap과 공통 equivalentFocal 단위 경로 누락을 **should-fix 75건**으로 기록했다. 근거/측정 의미가 미해결인 선택된 UNKNOWN 항목 **20건**은 추정하지 않았다. 두 수는 제품 수나 전체 JSON null 개수가 아닌 문서에 정의한 감사 항목 수다. P1000 actual/equivalent 값과 raw mm 근거는 정확하며 unit=null은 **현재 critical이 아닌 should-fix**지만 향후 다른 단위의 변환/검증 공백도 포함한다. COOLPIX 3개는 fixed/null mount/내장 광학 구조이고 lens VR을 IBIS로 승격하지 않았다.

Batch 001~004의 16개 item / 173개 claim에 대해 source/staging/diff/approval/evidence/transaction digest chain과 보관 승인 입력의 메모리 재현을 검증했다. Canon005→Nikon001→004 chain은 정상이며 004 expected SHA `5af85cb2cd789d256ebda930ea6bec7fc1b16c924aa893fcce0242d17dadbb1b`와 현 canonical이 일치한다. canonical은 **바디 102 / 렌즈 36 / 전체 138**로 유지됐다. 모든 기존 artifact·데이터·pipeline·추천 엔진/UI는 변경하지 않았다.

Coverage regression 5개 추가 후 전체 **154/154**, Objective/production 관련 **114/114**(Sony coverage 2개 포함), Nikon **19/19**, canonical validation, build, Objective scripts/신규 test node --check 및 git diff --check 통과. Build는 기존 chunk 크기 경고만 남는다. 새 production/worker 호출은 없었다. 다음 후보는 계획의 **B4 Fujifilm 현행 바디**이며 이번에는 시작하지 않았다. Nikon 조건부 영상/연사 소비 경로와 lens VR/optical zoom 표현 및 Nikon F 렌즈 coverage는 별도 후속 과제다.

## Stage 4 Nikon Korea production batch 004 — 2026-10-01

시작 시 working tree clean, baseline commit 169afe8, canonical 바디 101 / 렌즈 36 / 전체 137개였다. [Nikon inventory snapshot](../src/data/ingestion/nikon-current-camera-gallery-2026-10-01.json), production batch 001~003 manifest/transaction, 진행 기록, canonical, identity-map 및 기존 field contracts를 대조했다. released/current 미처리 **COOLPIX P1000 1개**, announced/upcoming **Z5IIC 1개**였다. 제품 재선정 없이 [Nikon Korea 콤팩트 현행 목록](https://www.nikc.nikon.com/product/compact)의 P1000 카드와 [공식 제품 주요사양](https://www.nikc.nikon.com/product/compact/COOLPIX%20P1000)을 다시 확인했다. 공식 보도자료의 Z5IIC는 2026년 10월내 발매 예정이며 이번 batch에서 제외했다.

공식 source **2개**(제품 주요사양 1개, 현행 gallery identity-only 1개), verified field claim **13개**를 사용했다. P1000만 독립 cheap-worker task로 검토한 뒤 raw → normalize → validate → diff → 사람용 summary 직접 검토 → explicit approval → atomic apply → canonical validation → idempotent reapply를 완료했다. **신규 1개 / 기존 보강 0개**, canonical은 **바디 101→102 / 렌즈 36 유지 / 전체 137→138**이다. 기존 137개 제품과 렌즈 데이터는 동일하며 cameraProducts.json 직접 편집은 하지 않았다. source/value conflict 0건이다.

승격 ID는 `nikon-coolpix-p1000`, `kind: fixed / mount: null / bodyStyle: slr`로 기존 P950/P1100 정책을 유지한다. 유효 16.05MP(공식 1605만, 화상 처리로 감소 가능 조건), 배터리·메모리 카드 포함 전체 무게 **1415g / weightBasis: battery-and-card**, 크기 **146.3×118.8×181.3mm**(약, 돌출부 제외), 기계식+CMOS 전자식 셔터 병용, 일반 **4K UHD 30p**(MP4/H.264 MPEG-4 AVC; 별도 HS 저해상도 모드는 합치지 않음)를 승격했다. 조건은 claim metadata에 남겼다. 30p를 근거 없이 29.97p로 바꾸지 않았다.

내장 광학 사양은 `specs.fixedLens.focal: {min:4.3,max:539}` **실제 mm**, `equivalentFocal: {min:24,max:3000}` **35mm 환산 mm**, `aperture: {wide:2.8,tele:8}`이다. 실제/환산 값을 서로 바꾸거나 디지털 줌 값과 합치지 않았다. 별도 lens product를 만들지 않았으며 기존 `getIntegratedLens()`의 내장 렌즈는 weight/price 모두 null이다. 실제 기존 시나리오 생성·평가 회귀 테스트에서 BUY 항목은 카메라 1개, lensCount.after 0, weight.after **1415g**으로 확인했다. 전체 카메라와 내장 렌즈 무게를 이중 계산하지 않는다.

공식 VR은 정지화상 **렌즈 시프트**, 동영상 **렌즈 시프트+전자식 보정**이다. 이는 body/sensor-shift IBIS 근거가 아니므로 `specs.ibis: null`이며 IBIS claim/object를 만들지 않았다. 현재 fixedLens contract에는 별도 lens VR/opticalZoom leaf가 없으므로 VR 및 광학 125배는 canonical에 억지 승격하지 않았다. 공식 1/2.3형 CMOS 표현도 물리 mm 크기나 crop factor로 추정 변환하지 않았다. 세 사실은 기존 raw의 `evidenceExcerpt`에 **unpromoted context**로 보존하여 동일한 content/source digest 계약에 포함했고, unsupported observation을 만들지 않았다. 이러한 lens VR/optical zoom 표현은 후속 개선 후보다. 본체만 무게, sensor physical size, 영상 bit depth/crop, AF/EVF/LCD/슬롯/연사/출시일 및 가격 등 미승격 leaf는 UNKNOWN/null이다. 가격은 별도 phase이며 ingestion을 막지 않았다.

Cheap-worker stable task `nikon-production-004-p1000`은 공개 Nikon 발췌와 최소 contract만 받았으며 코드/canonical 전체/secret을 받지 않았다. 실제 API **1회**, attempt **1**, retry/failure **0**, token **input 798 / output 832 / total 1630**이었다. 실제 채택한 결과는 실제·환산 초점거리 분리, lens VR≠IBIS, battery/card 포함 무게, 물리 센서크기·본체만 무게·영상 crop/bit depth 추정 금지, 없는 schema leaf에 125x/VR를 넣지 말라는 경고다. 잘못된 숫자/재시도/폐기한 API 결과는 없었다. Worker의 영상 표기 제안 2160/30p는 Sol이 기존 표현과 공식 UHD 명칭에 맞춰 4K UHD 30p로 정규화했다. 전달용 임시 fixture는 호출 후 삭제했다.

GPT-6.1 Sol이 identity/ID/aliases, 공식 source 적용 범위, fixed-lens 구조, actual/equivalent focal range, VR/IBIS 구분, 무게 기준, 13개 claim·조건/UNKNOWN, worker 결과, diff, approval/apply를 직접 판단했다. 사용자 추가 개입은 **0회**다. 사용자에게 별도 검토/승인을 요청하지 않았으며 이미 요청된 production 절차 안에서 CLI 명시적 승인을 기록했다.

Validator는 실제 1415g claim의 `conditions.weightBasis`와 `specs.weightBasis`가 battery-and-card로 일치하여 통과했다. 실제 staging을 메모리에서만 변형한 weight basis 누락/invalid/mismatch 검증은 `WEIGHT_BASIS_REQUIRED / INVALID_WEIGHT_BASIS / WEIGHT_BASIS_MISMATCH`로 validate에서 차단됐다. IBIS null은 정상 통과했고 기존 boolean/malformed `INVALID_IBIS` regression 및 기존 Sony/Canon/Nikon production fixture도 통과했다. 원본 artifact를 테스트 때문에 수정하지 않았다.

**발견한 기존 정규화 한계:** `canonicalUnit()`에 fixedLens.equivalentFocal 경로의 mm 반환이 없어 staging/사람용 summary의 환산 초점거리 unit이 null이다. 이번 공식 rawUnit은 모두 mm이고 canonical 값은 24–3000으로 정확하여 이번 승격을 차단할 문제는 아니다. 향후 다른 단위 입력의 변환/검증 및 summary 단위 표기를 보강할 후보로 기록한다. 이번 작업에서는 rules/vocab/schema/추천 엔진/UI/Experience DB를 수정하지 않았고, 신규 production blocker는 없었다.

Raw source ID `source-eded3b9e38524450`(사양), `source-369bcdf8a53b3dfd`(identity-only)의 accessedAt은 helper가 실제 UTC로 생성한 **2026-10-01T05:15:08.439Z / 2026-10-01T05:15:08.441Z**다. 밀리초 ISO 구조와 Date round-trip을 테스트했다. 승인 diff digest `fa841b9e1372e3385336aa32ef2f048cea69967312444854849ba5d991af8b4d`, approval ID `approval-60f3e50867c21721149fa92830e695dec069cc11713f88c1618e3084d7faac1f`, 적용 후 canonical SHA-256 `5af85cb2cd789d256ebda930ea6bec7fc1b16c924aa893fcce0242d17dadbb1b`이다. 재적용은 **already-canonicalized / canonicalMatches: true**였다.

검증: 전체 **149/149**, Objective/production **107/107**, Nikon **14/14**(batch 004 신규 regression 4개), canonical **138개 전체 validation**, `pnpm build`, 모든 Objective scripts 및 새 test `node --check`, `git diff --check` 통과. Build는 기존 500kB 초과 chunk 경고만 출력했다. 종료 snapshot은 released/current **21개 모두 canonicalized, 미처리 0개**, announced/upcoming **Z5IIC 1개**다. [공식 보도자료](https://www.nikc.nikon.com/ad/press/view/1019)의 발매 예정 상태를 재확인했다. 새로운 released/current production 대상을 추가 선정할 단계가 아니라 **Nikon 전체 production coverage audit으로 넘어갈 준비가 완료**됐다. Coverage audit 자체는 이번 batch의 범위에 포함하지 않았다.

2026-10-02 재개 시 batch 004는 이미 canonicalized 상태이고 canonical digest도 승인 결과와 일치했다. 해당 미커밋 변경만 이어서 마무리했으며 재수집·raw 재생성·worker 추가 호출은 하지 않았다. 공식 현행 목록의 P1000과 공식 발매 예정 표기를 재확인하고 테스트/build/validation/idempotency를 다시 검증했다. 기존 artifact accessedAt과 digest는 유지했다.

## Stage 4 Nikon Korea production batch 003 — 2026-10-01

시작 시 working tree clean, canonical 바디 96 / 렌즈 36 / 전체 132개였다. batch 001~002 artifact와 [inventory snapshot](../src/data/ingestion/nikon-current-camera-gallery-2026-10-01.json), 진행 기록, canonical, identity-map, catalog-scope 및 field contracts를 대조했다. 공식 [미러리스 목록](https://www.nikc.nikon.com/product/mirrorless)과 [콤팩트 목록](https://www.nikc.nikon.com/product/compact), 6개 개별 사양 페이지에서 released/current 잔여 6개를 확인했다. 이번 선정은 **Z50, Z6, Z7, Z6II, Z5**이며 모두 신규다. 다섯 모델은 같은 Z 마운트·FX/DX·센서 시프트 VR·셔터·무게 contract와 사양 표 구조를 공유해 함께 검토할 수 있다. 마지막 **COOLPIX P1000**은 공식 사양에 실제 4.3–539mm/35mm 환산 24–3000mm, 렌즈 시프트 VR, 배터리·카드 포함 전체 무게 1415g이 있어 별도 fixed-lens 검토가 필요하므로 독립 최종 batch로 남겼다. source 수집 자체는 모두 가능하지만 다섯 미러리스를 공통 기준으로 검토하는 편이 효율적이며, P1000을 다른 모델로 임의 교체하지 않았다.

제품별 독립 cheap-worker task 5개는 공개 공식 발췌와 최소 contract만 받았다. 프로젝트 코드·canonical 전체·secret은 전송하지 않았다. 공식 사양/제품특징 source 1개와 현행 목록 identity-only source 1개를 제품별 연결하여 **공식 source 각 2개, 총 10개**다. 목록 source는 identity/current만 증명하며 spec을 증명하지 않는다. raw-helper → normalize → validate → 사람용 summary 검토 → CLI explicit approval → atomic apply → canonical validation → 재적용을 완료했다. **신규 5개 / 기존 보강 0개 / verified field claim 56개**, source/value conflict **0건**이다. canonical은 **바디 96→101 / 렌즈 36 유지 / 전체 132→137**이다. 이전 제품과 렌즈는 수정하지 않았다.

| 제품 / ID | source / claim | 핵심 승격값 |
| --- | ---: | --- |
| [Z50](https://www.nikc.nikon.com/product/mirrorless/Z50) / `nikon-z50` | 2 / 10 | DX 20.88MP, 센서 23.5×15.7mm, 450g 배터리·SD카드 포함 / 395g 본체만, 126.5×93.5×60mm, 기계식·전자식 셔터, 4K UHD 29.97p. IBIS는 이번 직접 근거가 없어 UNKNOWN. |
| [Z6](https://www.nikc.nikon.com/product/mirrorless/Z6) / `nikon-z6` | 2 / 11 | FX 24.5MP, 센서 35.9×23.9mm, 675g / 585g, 134×100.5×67.5mm, 센서 시프트 5축 VR, 기계식·전자식 셔터, 4K UHD 29.97p. |
| [Z7](https://www.nikc.nikon.com/product/mirrorless/Z7) / `nikon-z7` | 2 / 11 | FX 45.75MP, 센서 35.9×23.9mm, 675g / 585g, 134×100.5×67.5mm, 센서 시프트 5축 VR, 기계식·전자식 셔터, 4K UHD 29.97p. |
| [Z6II](https://www.nikc.nikon.com/product/mirrorless/Z6II) / `nikon-z6-ii` | 2 / 12 | FX 24.5MP, 705g / 615g, 134×100.5×69.5mm, 센서 시프트 5축 VR, 4K UHD 59.94p; **펌웨어 1.10 이상·DX 기반 영상 영역 고정·일반 화질** 조건을 claim metadata에 보존하고 기존 `cropAtMax: true`를 승격. |
| [Z5](https://www.nikc.nikon.com/product/mirrorless/Z5) / `nikon-z5` | 2 / 12 | FX 24.32MP, 675g / 590g, 134×100.5×69.5mm, 센서 시프트 5축 VR, 4K UHD 29.97p; **1.7배 영상 영역 고정**을 metadata 및 기존 `cropAtMax: true`에 보존. |

5개 모두 `kind: interchangeable / mount: Nikon Z / fixedLens: null`이다. 내장 렌즈/별도 렌즈 제품을 만들지 않았다. 무게에는 배터리·카드 포함, 바디 캡 제외 및 approximate 조건을 보존했고, 본체만 무게는 별도 body-only claim이다. Z50 11fps, Z6 12fps(14-bit RAW 9fps), Z7 확장 9fps(14-bit RAW 8fps), Z6II 14fps(14-bit RAW 10fps), Z5 4.5fps는 공식 사양 표에서 확인했으나 검토한 근거가 특정 셔터 방식과 직접 연결되지 않아 셔터별 burst leaf를 UNKNOWN으로 남겼다. Full HD 고속·저속 모드를 4K 최대 프레임율과 합치지 않았다. IBIS stops, AF, EVF/LCD, 카드 슬롯, releaseDate, 가격 등 직접 field claim으로 검증하지 않은 leaf는 null이다. Z50의 IBIS null은 부재 확정을 뜻하지 않는다. 영상 max 문자열만 소비하는 경로에서 firmware/품질/crop factor 조건을 모두 보여주지 못하는 기존 한계는 후속 표현 개선 후보로 남는다.

| 제품 / stable task ID | worker input / output / total token | 채택 / 폐기한 검토 결과 |
| --- | ---: | --- |
| Z50 / `nikon-production-003-z50` | 643 / 624 / 1267 | IBIS 미언급은 부재 근거가 아님, 영상 crop 미확인, 확장 연사 셔터 불명 경고 채택. |
| Z6 / `nikon-production-003-z6` | 648 / 1055 / 1703 | 센서 VR/렌즈 VR 분리, IBIS stops 미확인, 확장 연사·14bit 조건 및 무게 기준 경고 채택. `sensor-shift VR`는 기존 객체의 mechanism 설명으로 사용하며 CIPA 시험 조건으로 해석하지 않음. |
| Z7 / `nikon-production-003-z7` | 663 / 436 / 1099 | 고속/확장·14bit RAW 조건 분리 및 영상 crop UNKNOWN 경고 채택. Worker의 파일 작성 주장은 실제 작업이 아니며 patch는 없었음. |
| Z6II / `nikon-production-003-z6ii` | 655 / 565 / 1220 | DX·펌웨어·화질 조건과 셔터 미확정 경고 채택. “영상 조건 metadata가 없어 영상 max를 null로 남겨야 한다”는 제안은 폐기하고 Sol이 공식 footnote를 직접 확인하여 기존 claim metadata에 기록함. |
| Z5 / `nikon-production-003-z5` | 639 / 517 / 1156 | 1.7배 조건, 무게/IBIS stops/셔터별 연사 경고 채택. 2432만의 단위 변환은 24.32MP로 결정하며 정수 MP가 아니라는 이유로 UNKNOWN 처리하지 않음. |
| **합계** | **3248 / 3197 / 6445** | 실제 API 5회, 제품별 attempt 1, retry/failure 0회. |

GPT-6.1 Sol이 출시 상태/선정 이유, 5개 identity·canonical ID·aliases, 10개 source 적용 범위, 56개 claim/UNKNOWN/조건, worker 결과 5건, 전체 diff 및 approval/apply를 직접 판단했다. 별도 사용자 개입은 0회다. Worker는 독립 검토 보조이며 실제 공식 자료 조회·fact verification·코드 적용·테스트를 수행한 주체는 Sol이다. 전달용 임시 fixture 5개는 호출 후 삭제했다.

**Validator 실전 검증:** 실제 batch의 4개 IBIS 객체와 5개 운영/본체 무게는 normalize/validate/approval을 통과했다. 실제 production staging을 메모리에서만 변형한 회귀 테스트는 boolean true/false, malformed present/음수 axes를 `INVALID_IBIS`로, 무게 basis 누락/invalid/mismatch를 `WEIGHT_BASIS_REQUIRED / INVALID_WEIGHT_BASIS / WEIGHT_BASIS_MISMATCH`로 validate에서 차단했다. 원본 raw/staging/approval은 수정하지 않았다. 이전 Sony/Canon/Nikon fixture도 통과했다. 새로운 Nikon normalization/pipeline code bug는 없었다. 첫 batch 전용 inventory 검증은 snapshot 상태 갱신 전에 실행하여 한 항목이 실패했고, apply 결과대로 inventory를 동기화한 후 최종 테스트가 모두 통과했다. 구조/schema/추천 엔진/UI/Experience DB는 변경하지 않았다.

Raw source 10개 accessedAt은 helper의 실제 현재 UTC 자동 생성값 **2026-10-01T05:04:23.048Z~2026-10-01T05:04:23.052Z**로, 밀리초 ISO 구조와 Date round-trip을 검증했다. 승인 diff digest `06ae449adb5718d6362e41a0a3b475719447c5dcda768e952238c2cb8ed2887d`, approval ID `approval-fd1c35e4949297f2e7f19d6479320ccc943c245b49508d414b2aa67f735838f2`, 적용 후 canonical SHA-256 `76e6bc26a2c0515b3f505600c8b98585c8a1819c576a1f689808f0ecf8fd9745`이다. 재적용은 `already-canonicalized / canonicalMatches: true`였다.

검증: 전체 **145/145**, Objective/production **103/103**, Nikon **10/10** (신규 batch 003 테스트 4개 포함), canonical **137개 전체 validation 통과**, `pnpm build`, 모든 Objective scripts 및 새 test `node --check`, `git diff --check` 통과. Build는 기존 500kB 초과 chunk 경고만 출력했다. 종료 시 released/current 미처리 **1개: COOLPIX P1000**, announced/upcoming **1개: Z5IIC**다. [공식 2026-09-28 보도자료](https://www.nikc.nikon.com/ad/press/view/1019)의 “2026년 10월내 발매예정” 상태를 다시 확인했고 이번 승격에서 제외했다. 마지막 P1000 단독 production batch로 진행 가능하며, 그 후 Nikon coverage audit으로 넘어간다.

## Stage 4 Nikon Korea production batch 002 — 2026-10-01

시작 시 working tree는 clean, canonical은 바디 91 / 렌즈 36 / 전체 127개였다. [Nikon inventory snapshot](../src/data/ingestion/nikon-current-camera-gallery-2026-10-01.json), batch 001 transaction 및 진행 기록, canonical, identity-map을 대조해 released/current 미처리 11개를 확인했다. Nikon Korea 공식 [미러리스](https://www.nikc.nikon.com/product/mirrorless)·[DSLR](https://www.nikc.nikon.com/product/dslr)·[콤팩트](https://www.nikc.nikon.com/product/compact) 목록에서 아래 5개 카드와 개별 사양 페이지를 재확인했다. [공식 보도자료](https://www.nikc.nikon.com/ad/press/view/1019)의 Z5IIC는 2026년 10월 발매 예정으로 아직 별도 announced/upcoming이다.

신규 **Z9, Zfc, Z7II, D850, COOLPIX P950**을 선정했다. 각기 FX 플래그십 전자셔터, DX 복고형, 이전 세대 FX 고화소, F 마운트 DSLR, 고정렌즈 초망원을 대표한다. 제품별 공식 사양 페이지 1개와 Nikon Korea 현행 분류 카드 1개를 연결해 **공식 source 각 2개, 총 10개**를 사용했다. 분류 카드는 identity/current 근거만 담당한다. 제품별 독립 cheap-worker task 5건은 공개 공식 발췌문만 받았고 프로젝트 코드·canonical 전체·secret은 받지 않았다. raw-helper → normalize → validate → 사람용 diff 검토 → 명시적 approval → atomic apply를 완료했다. **신규 5개, 기존 보강 0개, 검증 claim 55개**로 canonical은 바디 **91→96**, 렌즈 **36 유지**, 전체 **127→132**다. source/value conflict **0건**. 승인 diff digest `48ad5cd4c9615c62a890634e7248bade9d8209e55b255613ad1f9acb33376b60`, approval ID `approval-23584e4fc2fe8e502ea1296f14f84e0c94c55e0538a70ce31b2060b37f3101cb`, 적용 후 canonical SHA-256 `1f1c419c84e5524941530ddd6d8c47a9f1e966bd08505f8313e207f7d4535429`다. 재적용은 `already-canonicalized`, `canonicalMatches: true`였다.

| 제품 | 공식 source / claim | 핵심 승격값과 보류값 |
| --- | ---: | --- |
| Z9 / `nikon-z9` | 2 / 11 | FX 45.71MP, Z 마운트, 배터리·카드 포함 1340g / 본체만 1160g, 전자셔터 전용. 20fps는 해당 고속 연속·기록 형식 조건을 claim에 보존했다. C120의 저해상도 JPEG 120fps는 일반 연사로 승격하지 않았다. 8.3K N-RAW 59.94p는 내부 기록·12bit·FX·펌웨어 조건을 보존했다. |
| Zfc / `nikon-zfc` | 2 / 10 | DX 20.88MP, Z 마운트, 445g / 본체만 390g, 기계식·전자식 셔터, 4K UHD 29.97p. 약 11fps 확장 연사는 셔터·기록 조건이 충분히 확정되지 않아 이번 canonical leaf에 넣지 않았다. |
| Z7II / `nikon-z7-ii` | 2 / 11 | FX 45.75MP, Z 마운트, 705g / 본체만 615g, 센서 시프트 5축 VR, 4K UHD 59.94p. 4K 60p의 crop 해석은 검토한 사양 발췌만으로 확정하지 않고 조건 metadata에 미확정으로 명시했다. |
| D850 / `nikon-d850` | 2 / 10 | FX 45.75MP, F 마운트 DSLR, 1005g / 본체만 915g, 기계식 셔터, EN-EL15a 구성 CH 약 7fps. 그립·EN-EL18b 구성의 약 9fps는 일반값으로 승격하지 않았다. |
| COOLPIX P950 / `nikon-coolpix-p950` | 2 / 13 | `kind: fixed`, `mount: null`, 16.05MP, 1005g. 내장 렌즈 실제 4.3–357mm, 35mm 환산 24–2000mm, F2.8–6.5. 별도 lens product나 내장 렌즈 무게 없음. |

가격은 별도 phase라 모두 UNKNOWN이다. releaseDate, AF, EVF, 카드 슬롯 등 이번에 직접 field claim으로 검증하지 않은 값은 `null`이다. P950의 1/2.3형 센서는 물리 mm 크기로 추정 변환하지 않았다. 영상 `max` 단일 leaf가 crop·codec·펌웨어 조건을 직접 표시하지 못하는 기존 한계는 claim metadata로 보존했다. 추천 엔진·UI와 스키마는 변경하지 않았다.

Cheap-worker 사용량(input/output/total token): Z9 **444/362/806**, Zfc **430/601/1031**, Z7II **450/545/995**, D850 **431/733/1164**, P950 **451/732/1183**. **총 2206/2973/5179 token**, 실제 API 5회, worker 재시도/실패 0회다. Z9 최초 로컬 호출의 `STATE_UNAVAILABLE`은 공용 상태 디렉터리 접근이 없어 API에 도달하지 않은 실패이며 권한이 있는 동일 task 첫 호출부터 5건 모두 성공했다. Worker는 Z9 C120·영상 codec, D850 그립별 연사, P950 실제/환산 초점거리 및 내장 렌즈 분리를 유용하게 경고했다. Zfc의 약 11fps를 **19fps**로 오독한 worker 경고는 공식 사양과 달라 폐기했다. 사람이 출시 상태·5개 identity/ID·10개 source 적용 범위·55개 claim/조건·UNKNOWN·diff·approval/apply를 직접 판단했고, 별도 사용자 개입은 없었다.

새로 확인된 validation 빈틈: `specs.ibis`를 불리언으로 쓴 최초 Z7II draft는 validate를 통과했으나 approval의 canonical 구조 검사에서 거절됐다. 기존 객체 contract(`present`, `axes`, `stops`, `conditions`)에 맞게 raw를 재생성하고 normalize/validate/diff/approval을 다시 수행했다. pipeline 코드는 이번 batch에서 변경하지 않았고 validate 단계의 구조 검사 보강 후보로 남긴다. raw source 10개 `accessedAt`은 raw-helper가 생성한 실제 UTC ISO timestamp(03:06:11.459–03:06:11.461Z)이며, 과거 transaction의 expected digest와 현재 canonical digest를 분리한 회귀 테스트 3개를 추가했다. 검증은 전체 **135/135**, Objective/production **93/93**, Nikon batch 002 전용 **3/3**, canonical **132/132**, `pnpm build`, Objective scripts `node --check`, `git diff --check` 통과였다. 종료 시 released/current 미처리 **6개**(Z50, Z6, Z7, Z6II, Z5, COOLPIX P1000), announced/upcoming **1개**(Z5IIC)다. 다음 5개 batch를 진행할 수 있다.

## Stage 4 Nikon Korea production batch 001 — 2026-10-01

시작 시 git working tree는 clean, canonical은 바디 86 / 렌즈 36 / 전체 122개였다. Nikon Korea 공식 [미러리스](https://www.nikc.nikon.com/product/mirrorless) 15개, [SLR](https://www.nikc.nikon.com/product/dslr) 3개, [콤팩트](https://www.nikc.nikon.com/product/compact) 3개, [시네마](https://www.nikc.nikon.com/product/zcinema) 1개를 직접 대조해 [Nikon inventory snapshot](../src/data/ingestion/nikon-current-camera-gallery-2026-10-01.json)에 22개 카드를 기록했다. Nikon 공식 [2026-09-28 보도자료](https://www.nikc.nikon.com/ad/press/view/1019)는 Z5IIC를 2026년 10월 발매 예정으로 명시하므로 announced/upcoming 1개로 분리했다. 출시 완료 21개 중 기존 canonical 5개(Z6III, D780, Zf, Z5II, Z50II), 시작 시 미처리 16개였다. Nikon Korea 시네마 분류의 RED 링크는 외부 RED 카탈로그로 이동하며 Nikon Korea 제품 카드가 아니므로 이 22개 분모에 넣지 않았다. 공식 카메라 분류에서 원격 설치형 별도 카드는 발견되지 않아 deferred-special 후보는 0개다.

첫 batch는 신규 **Z8, Z30, ZR, D7500, COOLPIX P1100**을 선정했다. FX 고화소, DX 영상 지향, 직접 운용하는 Z Cinema, F 마운트 DSLR, 고정렌즈 초망원으로 Nikon의 사양 표현을 검증한다. 각 제품마다 Nikon Korea 공식 제품 사양 페이지와 독립 공식 출시/제품자료 각 1개를 연결해 공식 source **2개씩, 총 10개**를 사용했다. 제품별 독립 cheap-worker 실제 API task 5개는 공개 Nikon 발췌문만 받았고 코드, canonical 전체, secret은 전송하지 않았다. raw-helper → normalize → validate → 사람용 diff 검토 → 명시적 approval → atomic apply를 완료했다. **신규 5개, 기존 보강 0개, 검증 claim 49개**로 canonical은 바디 **86→91**, 렌즈 **36 유지**, 전체 **122→127**이다. source/value conflict **0건**. 승인 diff digest `810089e21daafb8d7c556710b72c9d93060b757d5d99e860b3c1d5179d5a5265`, approval ID `approval-a0df80779d70e8de2b7710f3bfc2b08b399d9525f9e03e0ad179562d3596d8ba`, 적용 후 canonical SHA-256 `fe082817b2e9d39d821f936aa680b3fde2aa3825848a94bdd096b5c0c1dbb730`이다. 재적용은 `already-canonicalized`, `canonicalMatches: true`였다.

| 제품 | 공식 source / claim | 핵심 승격값과 보류값 |
| --- | ---: | --- |
| Z8 / `nikon-z8` | 2 / 11 | FX 45.71MP, Z 마운트, 배터리·카드 포함 910g / 본체만 820g, 기계식 셔터 없음, 내부 8.3K N-RAW 59.94p. 120fps 정지화상은 11MP JPEG C120 조건이므로 일반 연사 최대값에 넣지 않았다. |
| Z30 / `nikon-z30` | 2 / 9 | DX 20.88MP, Z 마운트, 405g / 본체만 350g, 4K UHD 29.97p. 11fps는 기계식 셔터·확장 고속·JPEG/12-bit RAW 조건을 claim에 보존했다. |
| ZR / `nikon-zr` | 2 / 9 | 직접 운용하는 Z Cinema, FX 24.5MP, Z 마운트, 630g / 본체만 540g, 내부 R3D NE 12-bit 6K 59.94p. 4K 119.88p는 DX crop이므로 일반 최대값과 합치지 않았다. slot 배열은 공식 발췌로 확정되지 않아 UNKNOWN. |
| D7500 / `nikon-d7500` | 2 / 9 | DX 20.88MP F 마운트 DSLR, 720g / 본체만 640g, 4K UHD 29.97p. 8fps는 AF-C, S/M 노출, 1/250초 이상 등 조건을 claim에 보존했다. |
| COOLPIX P1100 / `nikon-coolpix-p1100` | 2 / 11 | `kind: fixed`, `mount: null`, 16.05MP, 1410g; 내장 렌즈 실제 4.3–539mm, 35mm 환산 24–3000mm, F2.8–8. 별도 lens product 없음. 디지털 줌 6000mm 상당은 optical field에 넣지 않았다. |

모든 가격은 production promotion 대상이 아니어서 UNKNOWN이다. AF/IBIS/EVF/슬롯처럼 이번 공식 발췌로 검증하지 않은 필드는 `null`로 남겼다. P1100 광학 125배, ZR 기록 모드별 시간, Z30 Full HD 장시간 녹화 등 현재 canonical leaf로 안전하게 표현하기 어려운 조건도 임의 schema 확장 없이 원문 및 human review에 남겼다. 영상 `max` 단일 leaf의 조건 표시 한계는 기존 후속 과제이며 이번에 추천 엔진·UI는 수정하지 않았다.

Cheap-worker 사용량: Z8 **첫 실패 483/352/835, 성공 재시도 484/257/741**, Z30 **494/418/912**, ZR **497/386/883**, D7500 **488/353/841**, P1100 **539/387/926** (순서: input/output/total token). **총 2985/2153/5138 token**, API 시도 6회, 형식 오류 1회, 동일 task ID 수정 재시도 1회, 유효 결과 5개였다. Z8 첫 malformed 결과는 채택하지 않았다. Worker는 Z8 120fps의 JPEG 제한, Z30·D7500의 조건부 연사, ZR의 crop/녹화시간, P1100의 실제/환산 초점거리 혼동을 유용하게 지적했다. P1100의 `1605만`을 '정밀 MP 불명'으로 본 worker 의견은 사람이 공식 숫자를 16.05MP로 정확히 환산해 바로잡았다. 사람이 22개 inventory 상태, 5개 identity/ID/범위, 10개 공식 source, 49개 claim·무게 기준·조건·UNKNOWN, diff 및 approval/apply를 직접 판단했다. 별도 사용자 개입은 없었다.

새 pipeline validation 문제는 없었다. 다만 이전 Canon·catalog 테스트 일부가 canonical 총수를 86/122와 Canon 최종 digest가 영구 현재 digest인 것으로 고정해 Nikon 승격 후 실패했다. 과거 Canon transaction 자체의 digest 검증은 유지하고, 이후 batch를 허용하도록 테스트 조건을 고쳤으며 Nikon batch 전용 inventory/atomic chain/fixed-lens 회귀 테스트 3개를 추가했다. raw source 10개의 `accessedAt`은 raw-helper가 만든 실제 UTC ISO timestamp이고 밀리초 구조 및 파싱 일치를 검사했다. 검증: 전체 테스트 **132/132**, Nikon 전용 **3/3**, canonical validation **127/127**, `pnpm build`, 관련 `node --check`, `git diff --check` 통과. 종료 시 released/current 미처리 **11개**, announced/upcoming **1개**라 다음 최대 5개 batch를 계속할 수 있다.

## Canon Korea 현행 카메라 coverage audit — 2026-09-30

Canon Korea 공식 미러리스 15·DSLR 2·컴팩트 5·직접 운용 Cinema EOS 7개를 재대조해 직접 운용 카드 29개 중 출시 완료 canonical 28개, 출시 예정 EOS R8 Mark II 1개, 출시 완료 미처리 0개, 중복/모호 identity 0개를 확인했다. 인접 PTZ 분류의 17개 카드는 카메라 외 제어기·소프트웨어를 포함하므로 별도 `deferred-special-category`로 추적한다. Batch 001~005의 22개 item과 digest chain은 모두 유효하며 Canon 바디 제품 coverage를 1차 완료로 판정했다. 이전 canonical 6개의 구조화 identity 근거와 일부 객관 필드 null, 영상 조건 표시 및 EF 렌즈 추천 coverage는 별도 후속 과제다. 전체 테스트 129/129, Objective·Canon 테스트 87/87, canonical 122개 validation, build·`node --check`·`git diff --check`를 통과했다. 자세한 분모·근거·심각도·회귀 검증은 [Canon coverage 감사 문서](OBJECTIVE_DB_CANON_COVERAGE_AUDIT.md)에 기록했다.

## Stage 4 Canon production batch 005 — 2026-09-30

시작 시 git working tree는 clean, canonical은 바디 84 / 렌즈 36 / 전체 120개였다. Canon 공식 inventory snapshot, batch 001~004 artifact·진행 기록, canonical, identity-map, catalog-scope와 field contract를 대조했다. Canon Korea의 현재 Cinema EOS 제품 목록과 개별 제품 페이지에서 **EOS C300 MK III**(한국 출시 2020-06)와 **EOS C500 MK2**(2019-12)가 여전히 출시된 제품임을 확인했다. 이 2개가 정해진 마지막 released/current 일반 카메라 대상이다. EOS R8 Mark II는 공식 출시월 2026-10으로 아직 announced/upcoming이므로 제외한다. 두 제품은 사람이 직접 운용하는 Cinema EOS이며, 기본 EF 마운트를 제품 identity로 기록하고 선택적으로 교체 가능한 PL/EF-C 마운트를 별도 제품이나 기본 사양으로 혼동하지 않는다.

`production-canon-bodies-005`는 제품별 Canon Korea 제품 페이지, Canon U.S.A. 공식 support 사양, Canon 공식 Cinema EOS white paper의 **공식 source 각 3개, 총 6개**를 연결했다. 제품 페이지는 identity와 한국 출시월, support는 센서·기본 마운트·영상 모드·바디 무게·치수, white paper는 CFexpress 2개와 SD 1개의 매체 구성을 증명한다. 제품별 독립 cheap-worker task는 공개 공식 자료와 최소 field schema만 받았고 프로젝트 코드·canonical 전체·secret은 받지 않았다. 사람 검토 후 raw-helper → normalize → validate → diff → 명시적 approval → atomic apply를 완료했다. 신규 바디 **2개**, 기존 보강 **0개**, 신규 검증 claim **12개**이며 canonical은 바디 **84→86**, 렌즈 **36 유지**, 전체 **120→122**다. 공식 source 간 진짜 값 충돌과 기존 canonical value conflict는 **0건**이다. 승인 diff digest `a179ae2d0c2a75bffff2f4de4c3a7d097e5ef9292f4675235fdce19625b7520e`, approval ID `approval-ac1fea06f157e49f6b3bffdbf5ad91b953059b8548fa2ca237640385bc0504d3`, 적용 후 canonical SHA-256 `3c6c2d52bbe484d71172da7fc4c9cb5af960ce09477fa40d84d802cf7f72b03e`다. 재적용 결과는 `already-canonicalized`, `canonicalMatches: true`였다.

| 제품 / ID | 공식 source | 검증 claim | 주요 승격값과 UNKNOWN |
| --- | ---: | ---: | --- |
| EOS C300 Mark III / `canon-c300-iii` | 3 | 6 | 기본 Canon EF 교환식 바디, Super 35mm, 일반 내부 CFexpress 녹화 4K DCI Cinema RAW Light 59.94p, 바디만 1750g, 153×148×168mm, CFexpress Type B 2슬롯 + SD UHS-II 1슬롯, 한국 출시 2020-06. 영상 모드용 화소를 사진용 대표 MP로 승격하지 않았고 운영 무게·일반 bit depth는 UNKNOWN. |
| EOS C500 Mark II / `canon-c500-ii` | 3 | 6 | 기본 Canon EF 교환식 바디, 풀프레임, 일반 내부 CFexpress 녹화 5.9K Cinema RAW Light 59.94p(RAW ST/LT), 바디만 1750g, 153×148×168mm, CFexpress 2슬롯 + SD 1슬롯, 한국 출시 2019-12. RAW HQ의 59.94p를 주장하지 않았고 SD 표준·운영 무게·일반 MP/bit depth는 UNKNOWN. |

4K 120p/2K 180p(C300)와 2K 120p(C500) 같은 S&Q·crop 촬영 조건은 일반 내부 녹화의 대표 `specs.video.max`에 합치지 않았다. C500 59.94p의 RAW 등급은 ST/LT로 claim `conditions`에 남겼다. 바디 무게는 `specs.bodyOnlyWeight`에만 넣고 EF 본체에서 제외된 그립·배터리·액세서리 조건을 claim에 보존했다. `specs.weight`는 운영 구성에 따라 달라져 `null`이며 모든 가격도 UNKNOWN이다. `specs.cardSlots`의 세 슬롯은 공식 white paper를 추가 확인한 뒤 승격했고, 첫 support 발췌만으로 2개라고 확정하지 않았다. 현행 단일 `specs.video.max` 값을 소비하는 경로는 녹화 방식·RAW 등급·S&Q/전원 조건을 직접 표시하지 못한다. 이는 batch 004의 R5 C와 같은 **후속 표현 개선 후보**이며 이번에 schema·추천 엔진·UI를 변경하지 않았다. 또한 현재 렌즈 catalog에 Canon EF 렌즈가 없어, 이 두 교환식 바디는 기존 장비 구성 후보 생성 경로에서 렌즈와 결합되지 않는다. Objective DB 수집은 완료됐지만 추천 coverage는 별도 과제다.

| 제품 | 실제 API 시도 | input / output / total token | 채택한 검토 경고 |
| --- | ---: | ---: | --- |
| EOS C300 Mark III | 1회 성공 | 697 / 537 / 1,234 | 영상 유효 화소를 일반 MP로 쓰지 않기, 일반 녹화와 S&Q 분리, EF 바디 무게와 PL 변형 분리, 매체 슬롯 추가 확인 |
| EOS C500 Mark II | 1회 실패 + 동일 task ID 1회 재시도 성공 | 1,367 / 925 / 2,292 | 5.9K 59.94p의 RAW HQ 제외, crop/S&Q·변동 bit depth·EF 바디 무게 구분, 매체 슬롯 추가 확인 |
| **합계** | **3회 실제 호출; 실패 1·재시도 1** | **2,064 / 1,462 / 3,526** | 첫 C500 응답은 `MALFORMED_RESPONSE`로 버리고 성공한 두 번째 결과만 채택 |

사람이 출시 상태와 2개 identity/alias·기본 EF/선택 PL 구성, 공식 source 6개, claim 12개 및 조건·UNKNOWN, worker 결과 2개, canonical diff 2건, approval/apply를 직접 판단했다. Worker의 초기 슬롯 수 미확정 경고를 받아 공식 white paper 2개를 더 확인했고 3슬롯으로 검증했다. C500 첫 응답은 실제 API 결과지만 malformed이므로 값·판단에 반영하지 않았다. C300/C500의 값이 있는 무게 claim은 모두 `conditions.weightBasis: body-only`로 validate를 통과했고, C300 claim의 basis를 `operational` 또는 `battery-and-card`로 바꾼 검증에서는 `INVALID_WEIGHT_BASIS`로 차단됐다. 새 validator/schema 문제는 발견되지 않았다. raw-helper가 실제 조회 시점의 UTC ISO `accessedAt`을 source 6개에 기록했으며 범위는 `2026-09-30T03:37:04.908Z`~`2026-09-30T03:38:40.036Z`다.

종료 시 Canon 공식 직접 운용 카메라 카드 29개 중 canonicalized **28개**, 출시된 일반 카메라 미처리 **0개**, 발표됐지만 출시 예정인 EOS R8 Mark II **1개**다. 현재 snapshot 범위에서는 Canon released/current coverage audit으로 넘어갈 준비가 됐다. PTZ·원격 설치형, 가격, 렌즈 수집, Experience DB, 추천 엔진·UI는 이번 batch 범위가 아니다.

검증: 전체 테스트 **126/126**, Objective+Canon production 테스트 **84/84**, Canon 005 전용 테스트 **4/4**, canonical validation **122/122**, `pnpm build`, 관련 `node --check`, `git diff --check`를 통과했다. Build의 500kB 초과 chunk 경고는 기존과 같다.

## Stage 4 Canon production batch 004 — 2026-09-30

시작 시 git working tree는 clean, canonical은 바디 79 / 렌즈 36 / 전체 115개였다. Canon Korea 직접 운용 카메라 inventory 29개, batch 001~003 artifact·진행 기록·canonical을 대조해 출시된 미처리 제품 7개와 출시 예정 EOS R8 Mark II 1개를 확인했다. 이번 batch는 canonical에 없는 **PowerShot SX740 HS, IXUS 285 HS A, EOS C400, EOS R5 C, EOS C70**을 선정한다. 고정렌즈 여행용 줌·소형 컴팩트 2종과 직접 운용하는 Cinema EOS 3종을 섞어 실제/환산 초점거리, 색상별 무게, RF 마운트, 시네마 영상 모드/미디어 조건을 검토한다. 공식 inventory의 출시월은 각각 2018-08, 2025-10, 2024-09, 2022-03, 2020-11로 모두 현재 출시됐다. EOS R8 Mark II와 원격 설치형 PTZ는 제외하며, 남은 EOS C300 MK III·EOS C500 MK2는 마지막 잔여 batch 후보로 둔다.

`production-canon-bodies-004`는 Canon Korea 제품/출시 페이지를 각 제품의 identity source로, Canon U.S.A. support 또는 Canon Asia의 모델별 사양을 상세 source로 사용했다. EOS R5 C에는 8K 60p의 외부 전원 조건을 확인하는 Canon UAE 공식 source를 추가했다. 총 **11개 공식 source**, 제품별 2/2/2/3/2개다. 제품별 독립 cheap-worker 실제 API task 5개는 공개 공식 자료의 최소 발췌만 검토했고, 프로젝트 코드·canonical 전체·secret은 전달하지 않았다. raw-helper → normalize → validate → 사람용 diff 검토 → 명시적 approval → atomic apply까지 완료했다. 신규 바디 **5개**, 기존 보강 **0개**로 canonical은 바디 **79→84**, 렌즈 **36 유지**, 전체 **115→120**이다. 신규 claim은 **39개**, source/value conflict는 **0건**이다. 승인 diff digest `9313b1d9ee7fb8d749abc9159bf3b92b5497170c5a97c511ef2662455994d93c`, approval ID `approval-1d8a5b3a62e1a884efa3690f0fbc63d853e8a6b05de1974a88dbe081a32ce453`, 최종 canonical SHA-256 `4b0a9bc760754742a4a930b9c76ee1c87d7b22954edaa217d4a3205c91ba3ed2`다. 재적용은 `already-canonicalized`, `canonicalMatches: true`였다.

| 제품 / ID | source | claim | 주요 승격값과 UNKNOWN |
| --- | ---: | ---: | --- |
| PowerShot SX740 HS / `canon-powershot-sx740-hs` | 2 | 12 | `kind: fixed`, `mount: null`; 실제 4.3–172mm / 35mm 환산 24–960mm, F3.3–6.9, 20.3MP, 4K 29.97p, 바디만 275g. 배터리·카드 포함 무게는 UNKNOWN. |
| IXUS 285 HS A / `canon-ixus-285-hs-a` | 2 | 6 | `kind: fixed`, `mount: null`; 환산 25–300mm, 20.2MP. 공식 Asia 사양의 검정색 변형 146g은 전체 모델 대표 무게로 승격하지 않았다. 실제 초점거리·조리개·영상 fps·대표 무게는 UNKNOWN. |
| EOS C400 / `canon-c400` | 2 | 5 | RF, 풀프레임 BSI stacked 센서, 일반 모드 6K RAW 59.94p, 바디만 1550g. 4K 120p·180p 특수/S&Q crop은 일반 녹화 최대로 합치지 않았다. 일반 사진용 화소·운영 무게·슬롯 수는 UNKNOWN. |
| EOS R5 C / `canon-r5-c` | 3 | 10 | RF, 풀프레임 사진 45MP, 기계식/전자선막 12fps·전자식 20fps, 8K 60p는 **외부 전원 필요** 조건을 claim에 보존, 배터리+CFexpress 카드 포함 770g / 바디만 680g. |
| EOS C70 / `canon-c70` | 2 | 6 | RF, Super 35mm, 일반 XF-AVC 4K DCI 59.94p, SD 계열 2슬롯, 바디만 1170g. 영상 모드별 화소를 대표 화소로 쓰지 않았고 운영 무게는 UNKNOWN. |

고정렌즈 2종의 내장 렌즈는 `specs.fixedLens`에만 있고 별도 lens product를 만들지 않았다. 카메라 전체 무게와 내장 렌즈 무게를 합산하지 않는다. SX740은 실제/환산 초점거리를 구분했고, IXUS는 실제 초점거리를 추정하지 않았다. 현재 schema에 광학 줌 배율을 위한 고정렌즈 leaf가 없으므로 40x/12x는 canonical로 승격하지 않았다. 모든 신품·중고 가격과 미확인 스펙 leaf는 UNKNOWN이다. R5 C의 외부 전원 조건 및 C400/C70 일반 녹화와 S&Q 구분은 staging claim metadata에 남는다. 단일 `specs.video.max` 문자열만 소비하는 화면/추천 로직에는 이 조건이 직접 포함되지 않는 기존 표현 한계가 있어 후속 구조 검토가 필요하며 이번 batch에서 추천 엔진은 건드리지 않았다.

| 제품 | worker input / output / total token | 채택한 검토 경고 |
| --- | ---: | --- |
| SX740 HS | 547 / 1,226 / 1,773 | 실제·환산 초점거리 및 바디/운영 무게 구분 |
| IXUS 285 HS A | 510 / 338 / 848 | 검정색 변형 무게의 일반화 금지, 구형/지역 alias 사양 전용 금지 |
| EOS C400 | 558 / 491 / 1,049 | 영상 모드별 화소·S&Q/일반 녹화 구분, 바디 무게 |
| EOS R5 C | 526 / 421 / 947 | 8K 60p 외부 전원 조건, 셔터별 연사, 무게 기준 |
| EOS C70 | 525 / 1,048 / 1,573 | 영상 모드별 화소와 S&Q 프레임율 분리 |

총 worker **input 2,666 / output 3,524 / total 6,190 token**이다. SX740 task는 공용 worker lock sandbox 접근 때문에 API 호출 **이전** preflight에서 1회 실패했고, 허용된 공용 state 접근으로 같은 task ID의 첫 실제 호출이 성공했다. 실제 API 재시도·실패는 0건, 제품당 성공 호출 1회다. 사람 검토는 출시 상태/ID·alias·kind/mount 5개, 공식 source 11개와 claim 39개, variant/UNKNOWN/조건 및 diff 5건과 approval에 집중됐다. IXUS 146g 제외는 사람이 직접 판단했다. R5 C의 770g claim은 `conditions.weightBasis: battery-and-card`와 제품 `specs.weightBasis`가 일치해 통과했고, 동일 staging의 메모리 변형은 basis 누락 `WEIGHT_BASIS_REQUIRED`, invalid `INVALID_WEIGHT_BASIS`, mismatch `WEIGHT_BASIS_MISMATCH`로 validate 단계에서 모두 차단됐다. raw source 11개에는 raw-helper가 자동 생성한 실제 UTC ISO `accessedAt` `2026-09-30T02:28:24.071Z`~`2026-09-30T02:28:24.073Z`가 기록됐다.

종료 시 Canon 공식 카드 29개 중 canonicalized **26개**, 출시된 일반 카메라 미처리 **2개**(EOS C300 MK III, EOS C500 MK2), 출시 예정 **1개**(EOS R8 Mark II)다. 마지막 잔여 batch를 진행할 수 있다. 가격·추천 엔진·UI·Experience DB 및 pipeline architecture는 변경하지 않았다.

검증: 전체 테스트 **122/122**, Objective+Canon production 테스트 **80/80**, 새 Canon 004 테스트 **4/4**, canonical validation **120/120**, `pnpm build`, 관련 `node --check`, `git diff --check` 모두 통과했다. Build는 기존과 같은 500kB 초과 chunk 경고만 출력했다.

## Stage 4 Canon production batch 003 — 2026-09-30

시작 시 working tree는 clean, canonical은 바디 74 / 렌즈 36 / 전체 110개였다. Canon Korea 공식 직접 운용 카메라 snapshot 29개와 batch 001~002 artifact·canonical을 대조한 결과 `released-current`이면서 `unprocessed`인 일반 카메라는 12개, `announced-upcoming`은 EOS R8 Mark II 1개다. 이번 batch에는 canonical에 없는 **EOS R5, EOS RP, EOS-1D X Mark III, PowerShot V10, EOS C50**을 선정했다. 고해상도 RF 미러리스, 소형 RF 미러리스, EF 플래그십 DSLR, 고정렌즈 브이로그 카메라, 직접 운용하는 RF Cinema EOS를 섞어 shutter/연사·무게 기준·고정렌즈의 촬영 모드별 화각·Cinema RAW/슬롯 조건을 검토한다. 공식 제품 페이지의 출시월은 각각 2020-07, 2019-03, 2020-02, 2023-06, 2025-12로 현재 모두 출시됐다. EOS R8 Mark II와 PTZ/원격 설치형은 제외했다.

`production-canon-bodies-003`에서 각 제품의 Canon Korea 공식 제품 페이지와 공식 상세 사양(Canon Korea RF Lens World 또는 Canon U.S.A. support)을 **제품별 2개**, 총 10개 source로 연결했다. 제품별 공개 발췌만 담은 독립 cheap-worker task 5개를 실제 API 호출했으며, 전체 코드·canonical·secret은 전송하지 않았다. raw-helper → normalize → validate → diff → 사람 검토 → 명시적 approval → atomic apply를 완료했다. 신규 바디 **5개**, 기존 보강 **0개**로 canonical은 바디 **74→79**, 렌즈 **36 유지**, 전체 **110→115**다. 43개 새 field claim의 source/value conflict는 0건이었다. 승인 diff digest는 `fca088613ac126f0d3a08981c76fa93e0b11fe43d367ef7b33b029b832ef238f`, approval ID는 `approval-2a0bd6303a1ae4a570cff496e0d94e1d390da642f0bd6f41c6d069a38fc3cba9`, 최종 canonical SHA-256은 `e615539cfea9e411c18dcc51833f879f91bfe0d06861da29311554720cc7aea8`이다. 재적용은 `already-canonicalized`, `canonicalMatches: true`였다.

| 제품 / ID | 공식 source | 새 claim | 핵심 승격값 / 보류 |
| --- | ---: | ---: | --- |
| EOS R5 / `canon-r5` | 2 | 10 | RF 풀프레임 45MP, 기계식 12·전자식 20fps(전자식은 비 EF-S 렌즈 조건), 8K DCI 29.97p, 738g 배터리·카드 포함 / 650g 바디. |
| EOS RP / `canon-rp` | 2 | 7 | 소형 RF 풀프레임 26.2MP, 485g 배터리·카드 포함 / 440g 바디. 5fps 셔터 기준과 영상 모드별 최대치는 UNKNOWN. |
| EOS-1D X Mark III / `canon-1d-x-iii` | 2 | 9 | EF DSLR 풀프레임 20.1MP, 광학 뷰파인더 기계식 16fps / 라이브 뷰 전자식 20fps, CIPA 1440g 배터리·카드 포함 / 1250g 바디. 최종 사양에서 확인하지 않은 CFexpress 슬롯·영상 최대치는 UNKNOWN. |
| PowerShot V10 / `canon-powershot-v10` | 2 | 9 | `kind: fixed`, `mount: null`; 1형 센서, 사진 유효 15.2MP, 실제 6.6mm 단렌즈 F2.8, 4K 30p. 사진/영상 환산 화각 18/19mm는 단일 필드로 합치지 않아 UNKNOWN, 211g의 기준도 불명이라 운영 무게 UNKNOWN. 별도 렌즈 제품 없음. |
| EOS C50 / `canon-c50` | 2 | 8 | RF Cinema EOS 풀프레임, 내부 7K RAW 59.94p(풀프레임 16:9 RAW ST/LT; 3:2 open-gate 별도), CFexpress Type B + SD 2슬롯, 765g 배터리·두 카드 포함 / 670g 바디. 영상 모드별 센서 화소를 사진용 단일 유효 화소로 합치지 않아 UNKNOWN. |

공식 근거가 없는 모든 가격과 나머지 스펙 leaf는 UNKNOWN이다. R5/1D X III의 셔터 방식별 연사, C50의 RAW·센서 모드, 네 제품의 운영/바디 무게 조건은 claim metadata에 보존했다. V10의 `specs.fixedLens`는 실제 초점거리·조리개만 포함하며 환산 화각의 사진/영상 차이를 숨기지 않는다. 사람 검토 중 V10의 4K 30p 근거가 Canon Korea 제품 페이지에만 있음을 확인하여 **승인 전에** 해당 claim을 Korea source로 옮기고 raw → diff를 다시 생성했다. 이는 source attribution 수정이며 pipeline 코드/schema 문제는 아니었다.

| 제품 | worker input / output / total token | 채택한 검토 경고 |
| --- | ---: | --- |
| EOS R5 | 505 / 546 / 1,051 | 전자식 20fps 렌즈 조건, 배터리 포함/바디 무게 분리 |
| EOS RP | 468 / 544 / 1,012 | 셔터별 5fps·영상 최대치 보류 |
| EOS-1D X Mark III | 530 / 335 / 865 | 발표 자료만의 CFexpress claim 보류, 광학 뷰파인더/라이브 뷰 연사 분리 |
| PowerShot V10 | 509 / 236 / 745 | 211g 기준 불명, 사진/영상 환산 화각 차이 |
| EOS C50 | 538 / 794 / 1,332 | 사진 기록 화소와 모드별 센서 유효 화소 구분, 3:2 open-gate와 16:9 RAW 분리 |
| **합계** | **2,550 / 2,455 / 5,005** | 실제 API 호출 5회, API 재시도·실패 0회 |

첫 R5 호출은 공용 worker state 잠금에 대한 sandbox 접근 오류로 **API 이전** 실패했고 권한 범위 보완 후 같은 task ID로 첫 실제 호출이 성공했다. 사람이 공식 source 10개, 출시 상태 5개, 제품 ID·alias·kind/mount, worker 결과 5개, field claim 43개, 조건/UNKNOWN, 사람용 diff 5건과 approval을 직접 판단했다. 무게 claim이 있는 실제 batch 4개는 `conditions.weightBasis: battery-and-card` 및 별도 `specs.weightBasis` 일치로 validate를 통과했다. 동일 production staging을 메모리에서만 변형한 검증에서는 basis 누락 `WEIGHT_BASIS_REQUIRED`, 허용되지 않는 basis `INVALID_WEIGHT_BASIS`, 제품 기준과 불일치 `WEIGHT_BASIS_MISMATCH`가 모두 approval 전 validate에서 검출됐다. V10의 UNKNOWN 무게에는 basis를 만들지 않았다. raw-helper가 source 10개에 실제 UTC ISO `accessedAt` `2026-09-30T02:11:23.344Z`~`2026-09-30T02:11:23.346Z`를 자동 기록했다.

종료 시 Canon 공식 카드 29개 중 canonicalized **21개**, 출시된 직접 운용 일반 카메라 미처리 **7개**, 출시 예정 **1개**다. 따라서 다음 5개 batch 진행이 가능하다. 가격·추천 엔진·UI·Experience DB는 변경하지 않았다. 전체 테스트 **118/118**, Objective+Canon production 테스트 **76/76**, Canon 003 회귀 테스트 **3/3**, canonical validation **115/115**, `pnpm build`, 관련 `node --check`, `git diff --check`가 통과했다. Build는 기존과 같은 500kB 초과 chunk 경고를 출력했다.

## Stage 4 Canon production batch 002 — 2026-09-30

작업 시작 시 git working tree는 clean, canonical은 바디 69 / 렌즈 36 / 전체 105개였다. [Canon 공식 inventory snapshot](../src/data/ingestion/canon-current-camera-gallery-2026-09-29.json)의 29개 카드와 제품별 공식 출시월을 재확인했다. 출시되어 현재 공식 카드에 있는 제품은 28개, 아직 출시 예정인 제품은 **EOS R8 Mark II 1개(공식 출시월 2026-10)**다. 기존 `status`(canonicalized/unprocessed)와 별도로 `availabilityStatus`(released-current/announced-upcoming)를 기록했다. batch 001 종료 시 미처리 18개 중 실제 출시된 미처리 제품은 17개였다.

이번 batch 선정은 **EOS R3, EOS R6 V, EOS 5D Mark IV, PowerShot G7 X Mark III, EOS C80**이다. 다섯 제품 모두 Canon Korea 공식 제품 카드에서 출시월이 2026-09 이전으로 확인되며 canonical에 없는 신규 모델이다. R3는 스포츠 지향 고급 미러리스, R6 V는 영상형 미러리스, 5D Mark IV는 EF 마운트 DSLR, G7 X Mark III는 고정렌즈 컴팩트, C80은 사람이 직접 운용하는 RF 마운트 Cinema EOS다. 이 조합으로 셔터·무게·고정렌즈·시네마 영상/전원 조건의 표현 차이를 검토한다. R8 Mark II와 PTZ 원격 카메라는 선정하지 않았다.

`production-canon-bodies-002`에서 제품별 Canon Korea 공식 제품 페이지와 공식 상세 사양 페이지(Canon Korea RF Lens World 또는 Canon U.S.A. support)를 **각 2개 source**, 총 10개로 연결했다. 제품 페이지는 주로 identity·한국 출시월을, 상세 사양은 각 field claim을 뒷받침한다. 제품마다 독립 cheap-worker task 1개를 실제 호출했다. 이후 raw-helper → normalize → validate → diff → 사람 검토 → 명시적 approval → atomic apply를 완료했다. 신규 바디 **5개**, 기존 보강 **0개**이며 canonical은 바디 **69→74**, 렌즈 **36 유지**, 전체 **105→110**이다. 승인 diff digest는 `daf00efd7f478149733bd42ae33970918be39575edb309a488f2ea9e6ca9e9a3`, approval ID는 `approval-deaee1e9745fa70dfcbf9079e5e294d90e4f2e664b8e767b736b29a2237710d0`, 최종 canonical SHA-256은 `ebea608a0893ba0a4f35c2628722d501d5772f2aad385d740600a33ffe925e36`이다. 재적용은 `already-canonicalized`, `canonicalMatches: true`였다.

| 제품 / ID | 공식 source | 신규 claim | 핵심 승격값 / 보류 |
| --- | ---: | ---: | --- |
| EOS R3 / `canon-r3` | 2 | 10 | RF 풀프레임 24.1MP, 기계식 12·전자식 30fps, 6K RAW 59.94p, 1015g 배터리·CFexpress 포함 / 822g 바디. |
| EOS R6 V / `canon-r6-v` | 2 | 9 | RF 풀프레임 32.5MP, 전자식 40fps, 7K RAW Light 59.94p(7K RAW Standard·open-gate와 구분), 688g 배터리·카드 포함 / 598g 바디. |
| EOS 5D Mark IV / `canon-5d-iv` | 2 | 10 | EF DSLR 풀프레임 30.4MP, 기계식 7fps, CF UDMA 7 + SD UHS-I 두 슬롯, 890g 배터리·두 카드 포함 / 800g 바디. |
| PowerShot G7 X Mark III / `canon-g7-x-iii` | 2 | 11 | `kind: fixed`, `mount: null`; 실제 8.8–36.8mm / 35mm 환산 24–100mm, F1.8–2.8. 색상별 통합 무게는 UNKNOWN, 별도 렌즈 제품 없음. |
| EOS C80 / `canon-c80` | 2 | 10 | 직접 운용 RF Cinema EOS, 풀프레임, SD 2슬롯, 내부 6K RAW 29.97p(HDMI RAW 59.94p와 구분), 1300g 바디만. 배터리 포함 무게·사진용 유효 화소·전체 치수는 UNKNOWN. |

공식 자료 10개에서 동일 leaf에 대한 값 충돌 및 기존 canonical value conflict는 **0건**이었다. 다만 별도로 검토한 [Canon Korea C80 보도자료](https://www.kr.canon/company/brand/news/11108/Iframe)의 크기 축·수치(160×116×138mm)와 [Canon U.S.A. support](https://www.usa.canon.com/support/p/eos-c80)의 W×H×D 160×137.4×116mm는 서로 다르다. 동일 측정·축 순서가 확인되지 않아 치수를 raw claim과 canonical에 승격하지 않았다. G7 X Mark III의 무게는 Canon U.S.A.의 검정/은색 변형에 대한 값만 확인되고 Canon Korea 카드의 graphite 변형까지 일반화할 수 없어 `null`로 보류했다. C80의 공식 19.0MP는 영상 유효 화소이므로 사진용 `specs.sensor.megapixels`에 넣지 않았다. 모든 신품·중고 가격과 그 밖의 미검증 leaf도 UNKNOWN이다. 조건부 영상·셔터·무게 기준은 claim `conditions`에 보존했다.

| 제품 | worker input / output / total token | 유용했던 검토 경고 |
| --- | ---: | --- |
| EOS R3 | 500 / 616 / 1,116 | 셔터별 연사, 배터리 포함/본체 무게 분리 |
| EOS R6 V | 525 / 1,186 / 1,711 | RAW Light·Standard·open-gate 모드 구분 |
| EOS 5D Mark IV | 533 / 1,029 / 1,562 | CF·SD 슬롯과 무게 기준 구분 |
| PowerShot G7 X Mark III | 540 / 460 / 1,000 | 고정렌즈와 graphite 색상 무게 불명 |
| EOS C80 | 546 / 1,242 / 1,788 | 내부/외부 6K, 영상 화소, 치수 차이 |
| **합계** | **2,644 / 4,533 / 7,177** | 실제 API 호출 5회, 재시도·실패 0회 |

Worker에는 제품별 공개 공식 발췌와 최소 schema만 전달했고 전체 코드·canonical·secret은 보내지 않았다. worker의 EOS R6 V 출시 여부 의문은 현재 Canon Korea 공식 제품·출시월로 반증되어 채택하지 않았다. 사람이 29개 카드의 출시 상태, 5개 identity/alias·kind/mount, 공식 source 10개, worker 결과 5개, 승격 claim 50개, diff 5건과 UNKNOWN·approval을 직접 판단했다. raw-helper는 source 10개의 `accessedAt`을 실제 UTC ISO timestamp `2026-09-30T01:43:50.162Z`~`2026-09-30T01:43:50.183Z`로 자동 기록했다.

파이프라인에서 드러난 작은 계약 누락: `validate`는 운영 무게 claim의 `conditions.weightBasis`가 필요한지 검사하지 않아 첫 `approve`가 `Weight condition and weightBasis disagree`로 중단됐다. 적용 전 raw metadata를 `basis`에서 `weightBasis`로 수정하고 normalize→validate→diff→approval을 다시 거쳤다. C80의 확인되지 않은 카드 표준도 빈 배열 대신 `null`로 바꾸었다. 코드/schema 변경 없이 데이터만 보정했고 승인 전 실패라 canonical 오염은 없었다. EOS R8 Mark II는 `status: unprocessed`와 `availabilityStatus: announced-upcoming`으로 계속 분리했다. 종료 시 Canon 공식 카드 29개 중 canonicalized **16개**, 출시된 일반 카메라 미처리 **12개**, 출시 예정 **1개**다. 따라서 다음 5개 production batch를 진행할 수 있다. 가격·추천 엔진·UI는 변경하지 않았다.

전체 테스트 **111/111**, Objective·Canon production 테스트 **69/69**, canonical validation **110/110**, `pnpm build`, 관련 `node --check`, `git diff --check`를 통과했다. Build는 500kB 초과 chunk 경고를 출력했다.

## Stage 4 첫 Canon production batch — 2026-09-29

Canon Korea의 [렌즈교환식 카메라](https://kr.canon/product/category/141), [컴팩트 카메라](https://kr.canon/product/category/183), [Cinema EOS](https://kr.canon/product/category/268) 공식 제품 카드를 직접 대조하여, 사람이 직접 운용하는 카메라 **29개**(미러리스 15, DSLR 2, 컴팩트 5, Cinema EOS 바디 7)의 [전체 inventory snapshot](../src/data/ingestion/canon-current-camera-gallery-2026-09-29.json)을 저장했다. 시작 시 현행 카드 중 canonical 6개, 미처리 23개였다. Cinema EOS라는 이름만으로 제외하지 않았다. 같은 영상/방송기기 갤러리의 **PTZ 리모트 카메라 17개**는 원격·설치 운용 제품군으로 snapshot에 인접 특수 카테고리로 기록했으며 직접 운용 카메라 29개에는 포함하지 않았다. 따라서 이번 29개 안에서 `deferred-special-category`로 판정한 제품은 없다. EOS R8 Mark II 카드는 목록에 있지만 제품 페이지의 2026-10 출시 예정 정보 때문에 첫 batch에는 선정하지 않았다.

첫 batch `production-canon-bodies-001`은 **EOS R1, EOS R6 Mark III, EOS R100, EOS R50 V, PowerShot V1**의 신규 5개를 처리했다. 상위 풀프레임, 범용 풀프레임, 입문 APS-C, 영상형 APS-C, 고정렌즈를 섞어 Canon 표기와 기존 스키마를 확인했다. 각 제품에 Canon Korea 제품 페이지와 공식 RF Lens World 사양 또는 Canon Inc. PowerShot V1 설명서, 총 **공식 source 2개씩**을 연결했다. `raw → normalize → validate → diff → 사람 검토 → 명시적 승인 → atomic apply`를 완료했고 source/value conflict는 0건이다. canonical은 바디 **64→69**, 렌즈 **36**, 전체 **100→105**개다. 승인 diff digest `2adbe9113317a0512c92502f67b1a2dcca8cbc5ac759d26c4ba698fe42d0baa3`, 적용 후 SHA-256 `708490fef20a116166275353330fb7a330c05577fb14173d39d31a59323f8165`이며 재적용은 `already-canonicalized`, `canonicalMatches: true`다. 이후 일반 카메라 미처리 카드는 **18개**다.

| 제품 | 신규 필드 | 핵심 승격값 / 보류 |
| --- | ---: | --- |
| EOS R1 | 11 | 풀프레임 24.2MP, 배터리·카드 포함 1115g, 기계식 12fps·전자식 40fps, 6K DCI 59.94p. |
| EOS R6 Mark III | 10 | 풀프레임 32.5MP, 배터리·카드 포함 699g, 전자식 40fps, 7K RAW Light 59.94p 조건. |
| EOS R100 | 8 | APS-C 24.1MP, 배터리·카드 포함 356g, 4K UHD 25p(PAL). 전자선막 6.5fps를 전자식 셔터 필드로 치환하지 않음. |
| EOS R50 V | 5 | APS-C 24.2MP, 전자식 15fps, 119.3×73.7×45.2mm. 블랙/화이트 무게 차이와 4K 모드별 표기 차이 때문에 단일 무게·최대 영상 leaf는 UNKNOWN. |
| PowerShot V1 | 18 | `kind: fixed`, `mount: null`, 내장 렌즈 실제 8.2–25.6mm / 사진 35mm 환산 16–50mm, F2.8–4.5, 배터리·카드 포함 426g, 4K 59.94p crop 조건. 별도 렌즈 제품 없음. |

제품별 cheap-worker 독립 호출의 input/output/total token은 R1 **477/288/765**, R6 Mark III **503/773/1,276**, R100 **491/925/1,416**, R50 V **1,008/1,152/2,160**(첫 응답 형식 오류 후 같은 ID로 1회 재시도), PowerShot V1 **560/761/1,321**이다. 합계 **3,039/3,899/6,938 token**, 실제 API 시도 6회·성공 5회·실패 1회다. 처음 R1의 공용 state 접근 오류는 API 이전 단계였고 권한 보완 후 정상 호출했다. Worker는 조건·UNKNOWN 점검에 도움을 주었으며 값의 채택, Canon 제품 identity/ID, R50 V 무게·영상 보류, R100 전자선막 분류, V1 실제/환산 초점거리 분리는 Codex가 공식 원문과 diff를 직접 확인했다. 일회성 공개 발췌 파일은 삭제했고 프로젝트 코드·전체 canonical·secret은 전송하지 않았다. 새 raw `accessedAt`은 실제 UTC ISO 시각으로 기록됐다. 추천 엔진·UI·가격은 변경하지 않았다. 전체 테스트 **109/109**, Objective 및 Canon production 테스트 **67/67**, canonical validation **105/105**, `pnpm build`, Objective scripts·신규 테스트 `node --check`, `git diff --check`를 통과했다.

## Sony Korea 현행 카메라 coverage audit — 2026-09-29

Sony Korea 공식 현행 갤러리 카드 35개(렌즈교환식 27, 컴팩트 8)를 1:1 대조했다. production batch 001~008에서 canonicalized된 서로 다른 바디 34개가 34개 카드에 대응한다. 남은 FR7 `ILME-FR7`은 설치·원격 운용 중심의 PTZ 시스템으로, 현재 직접 운용하는 바디/렌즈 구매·기변 비교와 다른 제품군이므로 `deferred-special-category`로 명시했다. 따라서 미처리 0, 중복/모호 0이며 Sony Korea 현행 **카메라 제품 coverage 1차 완료**로 판정한다. 사양·가격이 모두 완성됐다는 뜻은 아니다. 공식 목록 snapshot, scope registry, identity·provenance·UNKNOWN 및 batch artifact 검증의 상세 결과는 [Sony coverage audit](OBJECTIVE_DB_SONY_COVERAGE_AUDIT.md)에 기록했다. 이번 감사에서 canonical, 추천 엔진, UI, 기존 production artifact는 변경하지 않았다.

## Stage 4 여덟 번째 Sony production batch — 2026-09-29

batch 007의 Sony Korea 공식 갤러리 대조 결과 남은 5개 카드 **FX3A, FX3, FR7, α7R III A, FX6**를 그대로 검토했다. 새 제품을 다시 선정하지 않았다. [렌즈교환식 카메라 갤러리](https://www.sony.co.kr/interchangeable-lens-cameras/gallery)에 노출된 카드 수는 다섯이지만, 이번 batch에서 안전하게 canonical로 승격한 것은 **4개**다. FR7은 Sony 공식 [지원](https://www.sony.co.kr/electronics/support/interchangeable-lens-camcorders-ilme-series/ilme-fr7)·[사양](https://www.sony.co.kr/electronics/support/camcorders-and-video-cameras-interchangeable-lens-camcorders/ilme-fr7/specifications)에서 E-mount PTZ 원격 카메라, 본체만 약 4.6kg으로 확인했다. 현행 consumer canonical의 `bodyStyle`(`slr`, `rangefinder`, `compact`)로 PTZ 설치형을 정확히 표현할 수 없고, 배터리·카드 포함 등 허용된 operational weight basis도 없다. 따라서 별도 raw/canonical 제품을 만들지 않고 승격 보류했다. 갤러리 미처리 제품은 **FR7 1개**이며 Sony 전체 coverage audit 준비 완료로 간주하지 않는다.

| 제품 / canonical ID | 공식 source | 신규 필드 | 핵심 승격값 |
| --- | ---: | ---: | --- |
| FX3A / `sony-fx3a` (`ILME-FX3A`) | 2 | 11 | 풀프레임 12.1MP(사진), 715g 배터리·카드 포함 / 630g 본체만, 236만 도트 LCD, XAVC HS 4K 119.88p·10-bit 조건. |
| FX3 / `sony-fx3` (`ILME-FX3`) | 2 | 10 | 풀프레임 35.6×23.8mm, 같은 측정 기준의 715g / 630g, 144만 도트 LCD, XAVC HS 4K 119.88p·10-bit 조건. 사진 유효 화소는 이번 batch에서 UNKNOWN. |
| α7R III A / `sony-a7r-iii-a` (`ILCE-7RM3A`) | 2 | 8 | 풀프레임 42.4MP, 657g 배터리·카드 포함, 235만 9,296도트 LCD. 원판 `ILCE-7RM3`와 별도 개정 모델 code를 유지했다. |
| FX6 / `sony-fx6` (`ILME-FX6V`) | 2 | 4 | 풀프레임 E-mount, 890g 본체만, 114×116×153mm 돌출부 제외, 통상 XAVC-I QFHD 59.94p. |
| FR7 / 승격 보류 (`ILME-FR7`) | 2개 검토 | 0 | PTZ 설치형으로 기존 body style·operational weight 계약에 맞지 않음. |

FX3/FX3A는 Sony 공식 [FX3 사양](https://www.sony.co.kr/electronics/support/camcorders-and-video-cameras-interchangeable-lens-camcorders/ilme-fx3/specifications)과 [FX3A 사양](https://www.sony.co.kr/electronics/support/camcorders-and-video-cameras-interchangeable-lens-camcorders/ilme-fx3a/specifications)의 별도 모델 코드 및 약 144만/236만 도트 LCD 차이 때문에 한 제품의 alias로 합치지 않았다. 같은 센서·무게 등의 공통값도 각각의 공식 source에서 따로 확인했다. α7R III A 역시 별도 `ILCE-7RM3A` 코드·지원 페이지를 가진 A 개정 제품이다. Sony의 [원판과 A 개정판 차이 설명](https://support.sony.jp/electronics/support/articles/con/00277855)은 LCD가 변경되었고 외형 치수·무게는 같다고 명시한다. Sony Korea의 [원판 사양](https://www.sony.co.kr/electronics/support/e-mount-body-ilce-7-series/ilce-7rm3/specifications)은 LCD 144만 도트, A 개정판 사양은 2,359,296도트다. 기존 canonical에는 원판 α7R III가 없으며, 원판의 사양을 A 모델의 field evidence로 전용하지 않았다. FX6의 2.59kg은 렌즈·배터리·그립·핸들 등을 포함한 구성 무게여서 `specs.weight`에 넣지 않았다. FX6의 4K 120p는 S&Q 조건이므로 일반 녹화 최대치처럼 사용하지 않고 현 스키마에는 통상 녹화 4K 60p만 승격했다. 네 제품 모두 `kind: interchangeable`, `mount: Sony E`이며 렌즈 제품은 추가하지 않았다.

제품마다 별도의 공개 Sony 발췌만 담은 일회성 파일로 cheap-worker 실제 호출을 1회씩 실행했다. 프로젝트 코드·전체 canonical·secret은 전송하지 않았다. 첫 FX3A 호출에서 공용 lock의 `STATE_UNAVAILABLE`은 API 이전 실패였고 권한 보완 후 성공했다. 이후 FX3, FR7, α7R III A, FX6 호출은 모두 실제 API에 도달했다. FR7은 안전한 승격 불가를 알리는 `needs_information` 반환으로 종료했다. 실제 API 재시도·네트워크 실패는 0회다.

| 제품 | worker input / output / total token | 채택한 검토 경고 |
| --- | ---: | --- |
| FX3A | 513 / 744 / 1,257 | FX3와 LCD 차이, 공통값도 제품별 공식 재확인 |
| FX3 | 474 / 596 / 1,070 | 별도 revision identity, 비디오 codec·frame 조건 보존 |
| FR7 | 462 / 502 / 964 | PTZ 분류·무게 기준 불일치로 승격 보류 |
| α7R III A | 479 / 732 / 1,211 | 원판 자료를 A 개정 모델의 field evidence로 사용하지 않음 |
| FX6 | 497 / 695 / 1,192 | 구성품 포함 무게 제외, S&Q 120p와 일반 녹화 구분 |
| **합계** | **2,425 / 3,269 / 5,694** | 사람의 공식 원문·locator·diff 재검토 후 채택 |

raw-helper가 네 승격 제품의 8개 raw source에 실제 UTC ISO `accessedAt` **2026-09-29T03:25:04.958Z~03:25:04.962Z**를 자동 기록했다. 원문 간 진짜 값 충돌, 기존 canonical 값 충돌, validation error/warning은 0건이다. 가격, FX6 배터리 포함 카메라 단독 무게, 지원 범위 밖의 codec·출력·crop 세부값 등은 UNKNOWN으로 남겼다. FX3A·FX3의 4K 120p는 NTSC 119.88p/XAVC HS, FX6의 4K 60p는 일반 XAVC-I QFHD 59.94p 조건을 raw claim에 남겼다. 사람은 다섯 identity, 공식 source 10개, 신규 claim 33개, FR7 보류 판단, diff·approval을 직접 검토했다. 신규 pipeline 코드 버그는 없었지만 PTZ 분류와 설치형 무게 기준의 schema 적용 범위 문제가 드러났다.

승격 전 바디 **60** / 렌즈 **36** / 전체 **96**, canonical SHA-256 `4356661a473af4c793a6487da1b4ce51d314075ed9a518990b03ca3c4801f347`였다. 검토한 diff digest `54cd0c6bc22ea64ad754d04d7bb52047e630e2b486c363290c1e4ba69dec144e`를 approval `approval-b8aad6659d35eb099dc5855a2feed7c98fea208b656f408c15e136a3a299c29a`로 승인하고 atomic apply했다. 이후 바디 **64** / 렌즈 **36** / 전체 **100**, SHA-256 `2f40c2b507787d1afcf5a07fc26aa1aa57117c17e22321dbb2e44e96ae06e44b`다. 재적용은 `already-canonicalized`, `canonicalMatches: true`이며 네 item과 journal은 `canonicalized`다. 전체 테스트 **105/105**, Objective 테스트 **65/65**, canonical validation **100/100**, `pnpm build`, Objective script·변경 테스트의 `node --check`, `git diff --check`가 통과했다.

## Stage 4 일곱 번째 Sony production batch 완료 — 2026-09-29

이번에는 제품 선정 전에 Sony Korea 공식 [렌즈교환식 카메라 갤러리](https://www.sony.co.kr/interchangeable-lens-cameras/gallery)의 27개 제품 카드와 [컴팩트 카메라 갤러리](https://www.sony.co.kr/compact-cameras/gallery)의 8개 제품 카드를 직접 확인했다. 렌즈 키트 SKU는 별도 카메라로 세지 않고, Sony가 FX3와 FX3A처럼 별도 카드로 노출한 모델은 각각 셌다. batch 001~006 manifest·진행 기록의 완료된 25개는 이 공식 목록에 모두 포함된다. 따라서 시작 시 공식 갤러리 35개 중 **미처리 제품 카드 10개**였다. 전체 미처리 목록은 **FX5 (`ILME-FX5`), FX3A (`ILME-FX3A`), FX3 (`ILME-FX3`), α7C (`ILCE-7C`), FR7 (`ILME-FR7`), α9 II (`ILCE-9M2`), α6600 (`ILCE-6600`), α7R IV A (`ILCE-7RM4A`), α7R III A (`ILCE-7RM3A`), FX6 (`ILME-FX6`)**다. 이 중 canonical에 없던 다섯 제품을 `production-sony-bodies-007`로 처리했다.

| 제품 / canonical ID | 공식 source | 신규 객관 필드 | 핵심 승격값 |
| --- | ---: | ---: | --- |
| FX5 / `sony-fx5` | 2 | 8 | 풀프레임 35.9×24.0mm Exmor RS; 배터리·카드 포함 734g/본체만 643g. 사진용 유효 화소와 전체 깊이는 UNKNOWN. |
| α7C / `sony-a7c` | 2 | 11 | 풀프레임 24.2MP; 509g/본체만 424g; 전체 치수 124.0×71.1×59.7mm; LCD CIPA 740매. |
| α9 II / `sony-a9-ii` | 2 | 13 | 풀프레임 24.2MP; 678g; 전자식 최대 20fps/기계식 최대 10fps; NTSC XAVC S 4K 30p. |
| α6600 / `sony-a6600` | 2 | 10 | APS-C 24.2MP; 503g; 전체 치수 120.0×66.9×69.3mm; LCD CIPA 810매. |
| α7R IV A / `sony-a7r-iv-a` | 2 | 12 | 풀프레임 61.0MP; 665g; EVF 576만 도트; NTSC XAVC S 4K 30p; LCD CIPA 660매. A 개정 모델 identity 유지. |

모두 기존 `kind: interchangeable`, `mount: Sony E` 정책에 따라 렌즈 제품 없이 추가했다. 각 제품의 Sony 공식 제품 페이지와 상세 사양 페이지를 별도 raw source로 연결했다. 제품 페이지는 주로 identity, 사양 페이지는 field evidence를 뒷받침하며, 두 source가 모든 수치를 독립 교차검증한다는 의미는 아니다. 무게는 모두 배터리·메모리 카드 포함 기준이고, body-only 값은 별도 필드로 저장했다. 전체 치수와 `그립에서 모니터까지` 등의 대체 깊이를 구분했으며 FX5는 공식 표의 깊이 기준이 전체 치수로 명확하지 않아 dimensions 자체를 승격하지 않았다. α9 II의 연사는 셔터별 값으로 분리하고 영상 NTSC/PAL, LCD/EVF CIPA 조건은 raw claim `conditions`에 남겼다. FX5의 향후 펌웨어 예정 5K 120p/4K 240p는 현행 기능으로 승격하지 않았다. 공개 가격과 사용 중고가는 정책에 따라 모두 UNKNOWN이다.

공식 source 간 동일 필드 충돌, 기존 canonical 값 충돌, validation 오류·경고는 각각 0건이다. 제품별 worker 독립 task는 모두 첫 실제 API 호출 1회로 성공했다. 첫 FX5 실행의 `STATE_UNAVAILABLE`은 공용 lock 접근 불가로 API 이전 실패였고, 권한 보완 후 성공했다. API 재시도와 API 실패는 0회다.

| 제품 | worker input / output / total token |
| --- | ---: |
| FX5 | 521 / 388 / 909 |
| α7C | 490 / 475 / 965 |
| α9 II | 505 / 499 / 1,004 |
| α6600 | 501 / 417 / 918 |
| α7R IV A | 534 / 1,153 / 1,687 |
| **합계** | **2,551 / 2,932 / 5,483** |

worker는 FX5 화소·깊이의 불명확성, 무게와 치수의 서로 다른 측정 기준, α9 II 셔터별 연사 및 NTSC/PAL 영상 조건을 지적해 검토에 유용했다. 단, worker는 제공된 공개 발췌문만 읽고 원문을 독립 조회하지 않았으므로 값과 locator의 최종 확인은 메인 모델이 공식 사이트에서 직접 했다. 사람 검토량은 공식 현행 카드 35개와 기존 batch 25개 대조, 미처리 10개 선정 판단, 공식 source 10개, 제품별 worker 결과 5개, 객관 claim 54개와 diff 5건, UNKNOWN·identity·approval 판단이다. FX3/FX3A의 별도 공식 카드가 별도 canonical 제품이 되어야 하는지는 다음 batch의 identity 검토 과제로 남긴다. 이번에는 pipeline 신규 버그나 schema 변경이 없었다.

raw-helper가 새 raw source 10개에 실제 UTC ISO `accessedAt`을 `2026-09-29T03:08:00.427Z`~`2026-09-29T03:08:00.431Z`로 기록했다. 검토한 diff digest는 `21a0a0952a2bbf6ae702b741ea1007d1a866f1e0c8e429a93634a93266665e84`, approval ID는 `approval-f344d6fd3ba03dee76853e7ab4cc6e148a0232fba4b122b2c743f9867cdfb61b`다. canonical은 시작 바디 55/렌즈 36/전체 91, SHA-256 `1197634a466225094bc162981b7bd7e5ab0e0d03db1760e597f9787b3de878bf`에서 바디 **60**/렌즈 **36**/전체 **96**, SHA-256 `4356661a473af4c793a6487da1b4ce51d314075ed9a518990b03ca3c4801f347`로 증가했다. 다섯 item과 journal은 `canonicalized`이고 재적용은 `already-canonicalized`, `canonicalMatches: true`다.

전체 테스트 **104/104**, Objective 테스트 **65/65**, canonical validation **96/96**, `pnpm build`, 변경 테스트와 Objective script의 `node --check`, `git diff --check`를 통과했다. 공식 갤러리 기준 미처리 제품 카드는 **5개(FX3A, FX3, FR7, α7R III A, FX6)** 남아 다음 production batch가 필요하다. 그 후 현재 제품 카드 전체의 coverage audit으로 넘어간다.

## Stage 4 여섯 번째 Sony production batch 완료 — 2026-09-28

`production-sony-bodies-006`은 batch 001~005의 manifest·진행 기록과 86개 canonical 제품을 대조한 뒤, Sony Korea 현행 제품 페이지에 있는 미처리 E 마운트 바디 5개를 선정했다. α1, α6400, ZV-E10, FX2, FX30은 모두 신규 제품이며, 각 제품에 공식 제품 페이지(주로 identity)와 공식 상세 사양 페이지(객관 필드)를 독립 source로 연결했다. 두 source가 모든 물리값을 각각 교차 확인했다는 뜻은 아니다. 제품별 독립 cheap-worker 검토 후 raw → normalize → validate → diff → 사람 검토 → 명시적 approval → atomic apply를 완료했다.

| 제품 / canonical ID | 공식 source | 승격 필드 | 핵심 사양 |
| --- | ---: | ---: | --- |
| α1 / `sony-a1` (`ILCE-1`) | 2 | 12 | 풀프레임 50.1MP Exmor RS, 배터리·카드 포함 737g, 8K 30p 제품 표기, LCD CIPA 530매 |
| α6400 / `sony-a6400` (`ILCE-6400`) | 2 | 9 | APS-C 24.2MP Exmor, 배터리·카드 포함 403g, 본체 전체 깊이 59.7mm |
| ZV-E10 / `sony-zv-e10` | 2 | 13 | APS-C 24.2MP, 343g, XAVC S 4K NTSC 30p/8-bit, LCD CIPA 440매 |
| FX2 / `sony-fx2` (`ILME-FX2`) | 2 | 10 | 풀프레임 스틸 33.0MP Exmor R, 배터리·카드 포함 679g/본체만 594g |
| FX30 / `sony-fx30` (`ILME-FX30`) | 2 | 14 | APS-C 스틸 26.0MP Exmor R, 배터리·카드 포함 646g/본체만 562g, XAVC HS/S 4K 119.88p/10-bit |

다섯 제품은 `kind: interchangeable`, `mount: Sony E`로 승격했으며 렌즈 제품은 추가하지 않았다. FX30 공식 사양의 951g은 XLR 핸들·배터리·카드 포함 구성이므로 카메라 본체 운용 무게로 사용하지 않았다. FX2의 본체 전용 SKU `ILME-FX2B`는 별도 카메라로 만들지 않았다. ZV-E10의 NTSC 30p/PAL 25p, FX30의 119.88p·100p 및 해당 XAVC 모드, 무게·치수의 측정 기준은 raw claim `conditions`에 보존했다. α1의 8K 30p는 공식 제품 하이라이트에 근거하되 codec·crop·녹화 시간 조건은 UNKNOWN이다. 공개 페이지의 판매가격은 이번 promotion 대상에서 제외했다.

공식 source 사이 동일 leaf 값 충돌, canonical value conflict, validation 오류·경고는 모두 0건이다. 주요 UNKNOWN은 5개 제품의 신품·중고 가격과 출시일, α6400·FX2의 정밀 video max, 확인되지 않은 AF·IBIS·EVF·카드 세부값, α1·α6400·ZV-E10의 body-only weight다. 검토한 diff digest는 `02ff4e916d730945efc6b44e6b8b8fcd2fe6e31cc253406641d2c8e7243fcdc0`, approval ID는 `approval-380fcdf357fc6e1b6b1a1ad60f8856761216e58dbd4295f044788c28aae236dc`다.

| 제품 | cheap-worker input / output / total token | 실제 호출 |
| --- | ---: | ---: |
| α1 | 492 / 815 / 1,307 | 1 |
| α6400 | 499 / 508 / 1,007 | 1 |
| ZV-E10 | 488 / 685 / 1,173 | 1 |
| FX2 | 514 / 414 / 928 | 1 |
| FX30 | 555 / 928 / 1,483 | 1 |
| **합계** | **2,548 / 3,350 / 5,898** | **5** |

API 재시도·실패는 없었다. α1 첫 실행의 `STATE_UNAVAILABLE`은 sandbox에서 공용 worker lock에 접근하지 못한 API 이전 실패였고, 권한 보완 뒤 성공했다. worker의 FX30 XLR 핸들 무게 구분, ZV-E10 영상 모드·치수 기준, 스틸/영상 화소 차이 경고를 반영했다. α6400 치수 축 표기와 FX2 SKU 관련 worker의 과도한 불확실성은 Sony 공식 사양 표를 직접 다시 읽고 판단했다. 사람 검토는 제품 선정 5건, 공식 source 10개, worker 결과 5개, 58개 field claim 및 제품별 diff 5건, UNKNOWN·identity·approval 판단을 포함했다. 일회성 worker 입력 5개와 raw 생성 스크립트는 삭제했다.

새 raw 10개의 `accessedAt`은 `raw-helper`가 생성 시 실제 UTC ISO timestamp인 `2026-09-28T04:03:38.601Z`~`2026-09-28T04:03:38.613Z`로 기록했다. 날짜만으로 임의의 자정을 만들지 않았다. 기존 production artifact는 변경하지 않았다. 시작 canonical 바디 50 / 렌즈 36 / 전체 86, SHA-256 `67b3ffb9ede727b0f3ed7286b5e631f5ed032e5cc4fdf86c213ffa1fd3463bea`에서 적용 후 바디 **55** / 렌즈 **36** / 전체 **91**, SHA-256 `1197634a466225094bc162981b7bd7e5ab0e0d03db1760e597f9787b3de878bf`로 늘었다. 5개 item과 journal은 `canonicalized`이며 재적용 결과는 `already-canonicalized`, `canonicalMatches: true`다.

이번 batch에서 새 pipeline 버그는 없었다. 기존 catalog 테스트의 바디 수 상한 50이 정상 증가에 걸려 정확한 55/36 재고 검사로 갱신했다. 전체 테스트 **104/104**, Objective 테스트 **65/65**, canonical validation **91/91**, `pnpm build`, Objective script·변경 테스트의 `node --check`, `git diff --check`가 통과했다. 다음 Sony 5개 batch는 현재 방식으로 계속할 수 있으나, 후보의 현행 여부는 다음 batch 시작 시 공식 목록에서 다시 확인해야 한다.

## Stage 4 다섯 번째 Sony production batch 완료 — 2026-09-28

`production-sony-bodies-005`에서는 batch 001~004와 canonical의 처리 목록을 제외하고 Sony Korea의 현재 컴팩트·프리미엄 컴팩트 카테고리에 올라온 미등록 고정렌즈 바디 5개를 선정했다. 각 제품의 공식 제품 페이지와 상세 사양을 별도 raw source로 등록하고, 제품별 독립 cheap-worker task → normalize → validate → 사람용 diff 검토 → 명시적 approval → atomic apply를 완료했다. 모든 item과 transaction journal은 `canonicalized`이며 재적용은 `already-canonicalized`, `canonicalMatches: true`다. 렌즈·추천 엔진·UI·가격 promotion은 변경하지 않았다.

| 제품 / ID | 공식 source | 객관 필드 | 핵심 승격값 |
| --- | ---: | ---: | --- |
| ZV-1 II / `sony-zv-1-ii` | 2 | 18 | 20.1MP·13.2×8.8mm, 292g 배터리·카드 포함/266g 본체, 실제 6.9–17.6mm·사진 35mm 환산 18–50mm·F1.8–4.0, LCD CIPA 290매 |
| ZV-1F / `sony-zv-1f` | 2 | 16 | 20.1MP, 256/229g, 실제 7.6mm·환산 20mm·F2.0 단렌즈 |
| ZV-1 / `sony-zv-1` | 2 | 15 | 20.1MP, 294/267g, 실제 9.4–25.7mm·환산 24–70mm·F1.8–2.8 줌 |
| RX0 II / `sony-rx0-ii` | 2 | 15 | 15.3MP, 132/117g, 실제 7.9mm·환산 24mm·F4 단렌즈. 그립 키트 `DSC-RX0M2G`는 별도 카메라로 만들지 않음 |
| RX10 IV / `sony-rx10-iv` | 2 | 15 | 20.1MP, 1095/1050g, 실제 8.8–220mm·환산 24–600mm·F2.4–4.0 줌 |

모든 제품은 기존 `kind: fixed`, `mount: null`, `specs.fixedLens` 정책을 사용하며 내장 렌즈를 별도 교환식 lens product로 생성하지 않는다. 무게는 첫 숫자가 CIPA 배터리·카드 포함, 둘째가 본체만이다. ZV-1 II의 환산 18–50mm는 사진 기준이고 Active 영상 손떨림 보정 시 crop 가능성을 claim 조건에 보존했다. RX10 IV 치수는 공식 전체 깊이 145.0mm를 저장하고, 공식의 별도 렌즈 전면~모니터 깊이 127.4mm와 구분하는 조건을 보존했다. 기존 schema에 없는 내장 렌즈 filter diameter·optical zoom과 판매가격은 승격하지 않았다.

공식 두 source 사이의 동일 leaf 값 충돌은 0건, diff의 value-conflict도 0건이다. Sony 자료에 센서 크기 13.2×8.8mm가 있으나 이번에 검증한 field locator에서 `1.0타입`이라는 포맷 표기를 직접 연결하지 않은 ZV-1·RX0 II·RX10 IV의 `specs.sensor.format`은 `null`로 남겼다. 가격, 확인하지 않은 영상·AF·EVF·날씨 보호 세부값도 UNKNOWN이다. 최초 diff 후 일부 센서 포맷의 source locator가 직접 근거보다 넓게 잡힌 것을 사람 검토에서 수정해 raw → normalize → validate → diff를 다시 실행했다. 오래된 diff digest로 한 승인 시도는 CLI가 거부했고, 재검토한 최신 digest만 승인했다. 이번 raw의 `accessedAt`은 조회 당일 `00:00:00Z`로 날짜 정규화한 값이므로 실제 조회 시각의 정밀도는 없다. 다음 batch에서는 실제 UTC 시각을 기록해야 한다. pipeline 코드 변경은 필요하지 않았다.

cheap-worker 실제 호출은 제품당 1회씩 총 5회 모두 성공했다. input/output/total token은 ZV-1 II **504/366/870**, ZV-1F **478/546/1,024**, ZV-1 **476/249/725**, RX0 II **507/393/900**, RX10 IV **516/436/952**, 합계 **2,481/1,990/4,471**이다. API 재시도·실패는 0회다. 최초 공유 worker lock 접근 거부는 API 호출 전 `STATE_UNAVAILABLE`였으며 권한 보완 후 성공했다. worker 경고 중 무게 기준, 단렌즈/줌과 실제/환산 초점거리, RX0 II 그립 키트의 identity, RX10 IV의 깊이 두 기준을 검토에 채택했다. 공식 원문 확인, source locator 정정, UNKNOWN, 최종 diff/approval은 메인 모델이 직접 판단했다. 일회성 worker 입력 5개와 raw 생성 임시 script는 삭제했다.

시작 canonical은 바디 45 / 렌즈 36 / 전체 81, SHA-256 `2871c702407e3d02932e24db1d6dd1e469088cb079dd6abb9be5c1c2197ca498`였다. 검토한 diff digest `6b9104951a4dd0cb0227265794c4d7e9967753e462121a1890060fe95c7a44a0`를 approval `approval-9a6ad9297ad1988e6d79e5742802cc06657a5c54e16b5d05f9b1bcb062e963c8`로 승인했다. 적용 후 바디 **50** / 렌즈 **36** / 전체 **86**, canonical SHA-256 `67b3ffb9ede727b0f3ed7286b5e631f5ed032e5cc4fdf86c213ffa1fd3463bea`다.

고정렌즈 5종이 별도 렌즈 제품·무게 없이 기존 scenario에서 바디 하나로 처리되는 회귀 검사를 확장했다. 전체 테스트 **103/103**, Objective 테스트 **64/64**, canonical validation **86/86**, `pnpm build`, Objective script·변경 테스트의 `node --check`, `git diff --check`가 통과했다. 같은 5개 제품 단위 batch 운영을 계속할 수 있으나, 내장 렌즈의 필터 지름·광학 줌 배율은 추후 별도 schema 논의 전까지 UNKNOWN으로 둔다.

## Stage 4 네 번째 Sony production batch 완료 — 2026-09-23

미리 선정된 5개 바디를 `production-sony-bodies-004`로 처리했다. Sony 공식 제품·사양·지원 자료 11개를 제품별 독립 cheap-worker task로 검토한 뒤 raw → normalize → validate → diff → 사람 검토 → 명시적 승인 → atomic apply까지 완료했다. 모든 item과 transaction journal은 `canonicalized`이며, 재적용은 `already-canonicalized`와 `canonicalMatches: true`를 반환했다. 추천 엔진·UI·렌즈 제품·가격 promotion은 변경하지 않았다.

| 제품 / canonical ID | 작업 | 공식 source | 핵심 결과 |
| --- | --- | ---: | --- |
| ZV-E10 II / `sony-zv-e10-ii` | 신규 | 2 | E-mount APS-C 26MP, body-only 292g, 크기·LCD 배터리 조건. 배터리·카드 포함 무게는 UNKNOWN. |
| α7S III / `sony-a7s-iii` | 신규 | 3 | E-mount full-frame 12.1MP, 배터리·카드 포함 699g, 4K 120p/10-bit. 120p의 공식 1.1배 crop 조건을 claim에 보존. |
| RX10 V / `sony-rx10-v` | 신규 fixed | 2 | 1형 20.1MP, 카메라 전체 1111g, 내장 줌의 실제 9.1–210mm / 35mm 환산 24–600mm / F2.4–4.0. |
| RX1R III / `sony-rx1r-iii` | 신규 fixed | 2 | full-frame 61MP, 카메라 전체 498g, 실제 35mm F2 단렌즈. 환산 초점거리는 공식 직접 근거를 찾지 못해 UNKNOWN. |
| RX100 VII / `sony-rx100-vii` | 기존 fixed 보강 | 신규 2, canonical 총 3 | 기존 ID·물리값 유지, 센서 세대·크기·배터리 조건·온도 보강, 내장 렌즈 실제 9–72mm / 환산 24–200mm / F2.8–4.5의 공식 근거 추가. |

기존 fixed-lens 정책 그대로 세 제품 모두 `kind: fixed`, `mount: null`, `specs.fixedLens`를 사용한다. 내장 렌즈를 별도 교환식 lens product로 만들지 않았고, compatibility용 통합 렌즈는 `includedInBodyId`를 가지며 자체 무게·가격이 `null`이다. scenario에서는 바디 하나만 구매하고 바디 전체 무게를 한 번만 계산한다. RX1R III는 초점거리와 조리개 범위 양 끝이 같은 단렌즈로 표현했다. 현재 schema에는 내장 렌즈의 optical zoom·filter diameter 필드가 없다. Sony 페이지의 RX10 V 25배 표기와 실제 9.1–210mm 범위의 비율도 달라 해당 값은 canonical에 추정·추가하지 않았다. 공식 72mm(RX10 V)·49mm(RX1R III) 필터 정보 역시 현재 fixedLens 계약으로 승격하지 않았다.

RX100 VII diff는 `same-value/new-evidence` 14건, `null-fill` 6건, `value-conflict` 0건이다. 공식 source 간 동일 필드 값 충돌은 0건이며 기존 값을 자동 덮어쓰지 않았다. 가격, 불명확한 crop/영상 조건, ZV-E10 II의 operational weight, RX1R III의 명시적 환산 초점거리 등은 UNKNOWN으로 유지했다. 무게 claim에 필수 `weightBasis` 조건이 누락된 초기 검증 시도는 pipeline이 거부했고 raw 조건을 보완하여 normalize·validate·diff를 다시 통과시켰다. 이는 canonical 적용 이전에 해결했으며 pipeline 코드 변경은 필요하지 않았다.

cheap-worker는 제품당 1개 task·1회 실제 API 호출, 재시도 0회였다. ZV-E10 II **395/320/715**, α7S III **422/297/719**, RX10 V **437/659/1,096**, RX1R III **417/394/811**, RX100 VII **443/385/828** input/output/total token으로, 총 **2,114/2,055/4,169** token이다. 첫 시도의 공유 worker lock 접근 실패는 `STATE_UNAVAILABLE` 사전 실행 오류로 API 호출이 아니었고, 권한을 보완한 뒤 다섯 호출 모두 성공했다. worker의 무게 기준, 고정 단렌즈·줌 구분, 25배 표기와 실제 range 불일치, 120p crop, UNKNOWN 경고를 검토에 활용했다. 실제 source 확인, identity·alias, field locator, 값 채택, diff와 승인 판단은 메인 모델이 직접 수행했다. 확인되지 않은 worker 추정은 채택하지 않았고 일회성 입력 파일은 삭제했다.

시작 canonical은 바디 41 / 렌즈 36 / 전체 77, SHA-256 `a4e27a06648307846ebdb850d4062289dc32291d591d2b9421658527fdbcb2da`였다. 검토한 diff digest `e59842b030818b76eda384be269f8f0139f8397cffc6f85af511c09684bf193b`를 approval `approval-cc7971b7912b7cd7a51ebffcd210b29a0c5edca58869158c388afb459bb25172`로 승인했고, 완료 canonical은 바디 **45** / 렌즈 **36** / 전체 **81**, SHA-256 `2871c702407e3d02932e24db1d6dd1e469088cb079dd6abb9be5c1c2197ca498`이다.

전체 테스트 **103/103**, Objective 테스트 **64/64**, canonical validation **81/81**, `pnpm build`, Objective script·변경 테스트의 `node --check`, `git diff --check`가 통과했다. fixed-lens 3종의 별도 렌즈 미생성, 중복 무게 미계산, 실제/환산 초점거리 분리, 단렌즈 표현을 확인하는 회귀 테스트를 추가했다. 다음 Sony 5개 batch도 동일한 pipeline으로 계속할 수 있다. 다만 내장 렌즈 filter diameter·optical zoom 승격은 현재 schema 범위 밖이며 별도 설계가 필요하다.

## Stage 4 세 번째 Sony production batch 완료 — 2026-09-23

시작 commit `09eb2d1`, clean working tree, canonical SHA-256 `602af39634df3102cedc615facefbd4bdb2de46e578919ae33ef6ab3b8c7fa5d`에서 `production-sony-bodies-003`을 실행했다. Sony Korea 공식 현행 제품 페이지와 canonical을 대조해 정확히 5개를 선정했고, 앞선 batch의 A7 IV, α1 II, A7 V, A7R VI, A7C II는 제외했다.

- 신규 `sony-a9-iii` / α9 III (`ILCE-9M3`): 공식 제품·사양 2 source, 22개 field. 24.6MP full-frame Exmor RS, 702g operational/617g body-only, 4K 120p 10-bit, 120fps 전자 연사, 1/80000초 전자 셔터, 8-stop IBIS, EVF/LCD, dual SD/CFexpress Type A, 배터리·온도를 추가했다.
- 기존 `sony-a7r-v` / A7R V (`ILCE-7RM5`): 2 source, 23개 field, same-value/new-evidence 4, null-fill 19. 61MP sensor size/generation, AI AF, 8K 25p 10-bit/S-Log3, 8-stop IBIS, EVF/LCD, dual card slots, 방진·방적 설계 등을 보강했다.
- 기존 `sony-a7cr` / A7CR (`ILCE-7CR`): 2 source, 23개 field, same-value/new-evidence 4, null-fill 19. AI AF, 4K 60p 10-bit와 Super 35mm 조건, 7-stop IBIS, 430g body-only, EVF/LCD·셔터·slot 등을 보강했다.
- 기존 `sony-a6700` / A6700 (`ILCE-6700`): 2 source, 22개 field, same-value/new-evidence 4, null-fill 18. APS-C sensor size/generation, AI AF, 4K 120p 10-bit, 5-stop IBIS, 409g body-only, EVF/LCD·셔터·slot 등을 보강했다.
- 기존 `sony-zv-e1` / ZV-E1 (`ZV-E1`): 제품·사양·4K 120p upgrade support의 3 source, 22개 field, same-value/new-evidence 4, null-fill 18. 4K 120p는 upgrade license 조건을 claim에 보존했고, EVF 없음, 전자 셔터 전용, AI AF, 5-stop IBIS, 399g body-only 등을 보강했다.

공식 source 간 value conflict는 0건이다. 가격과 release date, A7R V body-only weight, α9 III 전용 AI unit, 확인되지 않은 video crop/log와 비특정 shutter별 burst는 UNKNOWN으로 유지했다. α9 III 외 비특정 연사 수치는 shutter별 계약으로 안전하게 분리할 근거가 부족해 넣지 않았다.

cheap-worker는 제품 1개당 독립 task로 운영했다. A7R V 809/689/1,498, A7CR 756/558/1,314, A6700 765/742/1,507, ZV-E1 710/462/1,172 input/output/total token을 사용했다. α9 III는 첫 review 출력이 사실 목록을 누락해 789/169/958 후 같은 task ID로 1회 재시도했고 783/646/1,429를 사용했다. 총 6회 API 호출, 7,878 token이며 모든 호출이 성공했다. worker 요약은 필드 누락·조건 검토에 유용했지만 live source 검증은 하지 못하므로 값 채택, source locator, UNKNOWN, ZV-E1 upgrade 조건, identity와 최종 diff는 메인 모델이 직접 판단했다.

diff digest `be7c14ba7ff2a1cef1c9b72e2d1683ae25eb9b4219750b0ae21d183ef8348d45`를 제품별로 검토한 뒤 approval `approval-093b61484d6dec8a0e7bbefd338b9660b81f5e15a8a9374af310bed81a345328`로 승인했다. atomic apply 후 바디 41 / 렌즈 36 / 총 77, canonical SHA-256 `a4e27a06648307846ebdb850d4062289dc32291d591d2b9421658527fdbcb2da`가 됐다. 재적용은 `already-canonicalized`, `canonicalMatches: true`였고 5개 item과 journal은 모두 `canonicalized`다.

canonical count 검사는 단순 최소값으로 약화하지 않았다. 검토된 inventory 삭제를 잡는 exact total 77을 유지하고 이번 5개 production body의 존재 assertion을 추가했다. 다음 Sony batch도 5개 단위로 동일한 제품별 worker → official review → pipeline 흐름을 사용할 수 있다. 가격·렌즈·추천 엔진·UI는 변경하지 않았다.

검증은 전체 101/101, Objective pipeline 63/63, canonical validation 77/77을 통과했다. `pnpm build`, Objective script 전체 `node --check`, `git diff --check`도 성공했다.

## Stage 4 두 번째 Sony production batch 완료 — 2026-09-23

`production-sony-bodies-002`에서 Sony 현행 Tier 1 바디 3개를 공식 자료로 처리했다. Sony Korea 현행 렌즈 교환식 카메라 목록과 canonical을 대조해 신규 `sony-a7-v`(ILCE-7M5), 신규 `sony-a7r-vi`(ILCE-7RM6), 기존 `sony-a7c-ii`(ILCE-7CM2)를 골랐다. 앞 batch의 A7 IV와 α1 II는 제외했다. 신규 생성과 기존 제품 보강을 한 batch에서 함께 통과시키는 표본이며 추천 엔진·UI·렌즈·가격 promotion은 변경하지 않았다.

### 제품과 공식 근거

- Sony A7 V: Sony Korea 제품 페이지, Sony 공식 specifications, Sony Korea 공식 출시 월 자료의 3개 source를 사용했다. 33MP 풀프레임 센서, 센서 크기, 배터리·카드 포함 695g/body-only 610g, 크기, AF 인식 대상, 4K 120p/10-bit, 배터리, 5축 IBIS 조건, EVF/LCD, 셔터·연사, slot별 저장 매체, 방진방적 설계, 동작 온도와 2025-12 출시 근거를 확보했다. `new-product` 25개, conflict 0, incoming UNKNOWN 0이다.
- Sony A7R VI: Sony Korea 제품 페이지와 Sony 공식 specifications의 2개 source를 사용했다. 66.8MP 풀프레임 센서, 센서 크기, 배터리·카드 포함 713g/body-only 622g, 크기, AF 인식 대상, 8K 30p/10-bit와 S-Log3, 배터리, 5축 IBIS 조건, EVF/LCD, 셔터·연사, 두 개의 SD/CFexpress Type A 겸용 slot, 동작 온도를 확보했다. `new-product` 24개, conflict 0, incoming UNKNOWN 0이다.
- Sony A7C II: Sony Korea 제품 페이지와 Sony 공식 specifications의 2개 source를 사용했다. 기존 값 15개에 새 공식 evidence를 연결하고, 센서 크기, 배터리 조건, 5축 7스톱 IBIS 조건, EVF/LCD, 셔터, 단일 SD slot, 동작 온도 등 9개 `null-fill`을 적용했다. AF 설명은 실제 전용 AI 처리 장치 문구가 있는 제품 페이지에 연결했다. 4K 60/50p의 Super 35mm 조건을 보존했고, 공식 10fps 표기가 셔터 방식별 값을 나누지 않으므로 burst에는 억지로 넣지 않았다. conflict 0, incoming UNKNOWN 0이다.

공식 source끼리 같은 leaf에서 다른 값을 주장한 사례는 없어 `CONFLICTING_CLAIM_VALUES`는 발생하지 않았다. 무게는 body-only와 배터리·카드 포함 값을 분리했고, IBIS·영상·EVF 조건과 slot별 media 차이를 claim에 보존했다. A7 V의 log/crop-at-max, A7R VI의 release date/weather sealing/crop-at-max, A7C II의 release date/weather sealing/셔터 방식별 burst는 확인 범위를 넘겨 `null`로 유지했다. 신품·중고 가격은 이번 batch에서 수집·승격하지 않았다.

### Diff, 승인, 적용

- 시작 canonical: 바디 38 / 렌즈 36, 총 74, SHA-256 `2f3794736da0dbc94c9089040620247cf51551e1d40db296811b1d474c7a2771`.
- 검토한 diff digest: `fb0a2d01ed7a0fafcd2143f488510ee128887cb41a5460ac86eaa4c95640c1b1`. 세 item 모두 validation error/warning과 value conflict가 0이었다.
- 승인 ID: `approval-c2e0789126d2a6f61647130bf3ebc58933bc0f8d1bea8f3f8e5ef65860fa7a37`. `--allow-new-products`를 포함한 explicit CLI approval 뒤 expected digest와 모든 incoming artifact digest를 고정했다.
- atomic apply 후 바디 40 / 렌즈 36, 총 76, canonical SHA-256 `602af39634df3102cedc615facefbd4bdb2de46e578919ae33ef6ab3b8c7fa5d`가 됐다. 재적용은 `already-canonicalized`, `canonicalMatches: true`였고 세 item과 journal은 모두 `canonicalized`다.

### Cheap-worker와 사람 작업량

공식 Sony 공개 발췌와 최소 허용 필드 목록만 일회성 파일로 전달했다. 프로젝트 코드, canonical DB, 설정, 개인정보와 secret은 보내지 않았다. task `objective-v04-production-sony-bodies-002-extraction`의 첫 실제 호출은 input 2,054 / output 2,048 tokens에서 응답 길이 제한으로 `INCOMPLETE_RESPONSE`가 됐다. 같은 task ID의 1회 재시도는 source 간 조건·충돌 후보만 요청해 input 2,066 / output 727, 총 2,793 tokens로 성공했다. 두 시도의 합계는 6,895 tokens다.

첫 호출의 잘린 structured extraction은 채택하지 않았다. 재시도의 15개 검토 경고는 모두 확인했고, 그중 13개가 실제 claim·UNKNOWN 결정에 직접 반영됐다(약 87%). 센서의 `partially/fully stacked`와 generic `Exmor RS`를 같은 말로 합치지 않기, 120p/119.88p 표현 보존, body-only/operational weight 분리, IBIS 측정 조건, slot 차이, A7C II Super 35mm crop, 셔터별 근거가 없는 10fps burst 제외, EVF NTSC/PAL 조건, A7R VI release date UNKNOWN을 포함한다.

| 제품 | 공식 source | worker 호출 | Sol의 주요 직접 판단 |
| --- | ---: | --- | --- |
| A7 V | 3 | batch 공용 2회(1회 길이 실패 + 1회 성공) | 현행/신규 identity, 출시 월 의미, sensor 표현 범위, 무게·IBIS·영상 조건, 비대칭 slot 구조 |
| A7R VI | 2 | batch 공용 2회 | 현행/신규 identity, release UNKNOWN, sensor 표현 범위, 셔터·연사·slot·영상 조건 |
| A7C II | 2 | batch 공용 2회 | 기존 제품 동일성, AF 설명 source 재매핑, Super 35mm crop, 셔터별 burst 미승격, 기존 subject enum 보존 |

호출이 batch 공용이어서 제품별 worker token을 정확히 분리할 수는 없다. 공식 source 2–3개를 읽고 identity, 조건부 사양, UNKNOWN과 diff를 사람이 검토해야 하므로 현재 검토 비용은 제품당 대략 한 번의 집중 검토 묶음이다. raw 반복 입력은 worker가 줄일 수 있지만 최종 provenance와 조건 판단은 아직 사람이 맡아야 한다.

### 운영 판단과 검증

pipeline code 변경이나 신규 회귀 테스트 추가가 필요할 정도의 버그는 발견하지 않았다. 기존 canonical 계약 테스트에 고정된 제품 수는 이번 정상 증가에 맞춰 74에서 76으로 갱신했으며 검증 강도는 그대로다. 새로 드러난 운영 병목은 긴 다제품 worker 응답이 출력 한도에 걸릴 수 있다는 점과, 공식 문구의 조건을 canonical leaf로 옮길 때 사람 검토가 계속 필요하다는 점이다. 다음에는 worker 요청을 제품별 또는 추출/경고 단계로 더 작게 나누는 편이 안전하다.

전체 테스트 **101/101**, Objective pipeline 테스트 **63/63**, canonical validation **76/76**이 통과했다. `pnpm build`, 전체 objective script와 변경 테스트의 `node --check`, `git diff --check`도 성공했다. 신규 pipeline 동작을 추가하지 않았으므로 새 테스트 코드는 0개이며, 이번 세 item의 raw/staging/diff/approval/transaction과 idempotent 재적용이 production batch 검증 자료다.

다음 Sony batch는 **5개 단위**로 확대해도 된다. 10개를 한 요청·한 검토 단위로 바로 처리하면 worker 출력 한도와 사람의 조건 검토 부담이 커지므로, 10개를 처리할 때도 5개짜리 독립 batch 두 개로 나누는 것을 권장한다.

## Stage 4 production pipeline 보완 완료 — 2026-09-22

첫 production batch에서 확인한 반복 작업 병목을 보완했다. 새 제품이나 canonical 값을 추가하지 않았고 추천 엔진과 UI도 변경하지 않았다. 상세 계약은 [OBJECTIVE_DB_V04_FIELD_CONTRACTS.md](./OBJECTIVE_DB_V04_FIELD_CONTRACTS.md)에 고정했다.

- 한 item의 여러 공식 raw source를 하나의 staging으로 결정적으로 결합한다. 같은 leaf·같은 값의 복수 claim과 source를 보존하고, 값이 다르면 `CONFLICTING_CLAIM_VALUES`로 차단한다. 단일 source staging은 과거 transaction과 호환된다.
- `sensor.sizeMm`, EVF, LCD, shutter, burst, slot별 복수 media/card standard, weather sealing, 동작 온도, 정밀도별 release date의 선택적 계약과 validation을 추가했다. 기존 74개 제품에는 새 default나 추정값을 넣지 않았다.
- `raw-helper.mjs`가 evidence dedup, reference, content/source digest를 생성한다. review 정보는 입력에 명시된 경우만 복사한다.
- 사람용 diff에 unique field/source와 category별 field summary를 추가하고 문자열 배열 표시를 고쳤다. machine-readable diff 구조는 유지했다.
- cheap-worker에는 프로젝트 코드나 제품 DB 대신 합성 diff fixture만 전달했다. 첫 호출은 malformed response로 거부됐고(input 473/output 479), 같은 task ID의 마지막 재시도가 성공했다(input 496/output 473). 총 1,921 tokens이며 patch는 적용하지 않고 중복 field/source assertion 제안만 검토해 반영했다. 일회성 fixture는 삭제했다.
- 다음 단계는 Sony 현행 바디 3–5개 production batch다. 제품마다 제품/spec/support source를 필요한 만큼 등록하고, 공식 근거가 없는 선택 필드는 `null`로 유지한다.

## Stage 4 첫 production batch 완료 — 2026-09-22

공식 제조사 자료 → cheap-worker 추출 보조 → 메인 모델 검증 → raw → normalize → validate → diff 검토 → 명시적 승인 → atomic apply의 첫 실제 운영 흐름을 `production-sony-bodies-001` batch로 끝까지 실행했다. **Sony 현행 Tier 1 바디 2개만** 처리했으며 추천 엔진과 UI는 변경하지 않았다.

### 제품 선택과 공식 근거

- 기존 제품: `sony-a7-iv` / Sony A7 IV (`ILCE-7M4`). Sony Korea의 현행 제품·지원 페이지가 유지되는 제품으로, 기존 canonical 값 재검증과 provenance 강화 표본으로 선택했다.
- 신규 제품: `sony-a1-ii` / Sony α1 II (`ILCE-1M2`). Sony Korea 현행 렌즈 교환식 카메라 목록에 노출되는 제품이고 canonical에 없어서 신규 제품 production 생성 경로 표본으로 선택했다.
- 현행성 확인: `https://www.sony.co.kr/interchangeable-lens-cameras`, A7 IV 제품 `https://www.sony.co.kr/interchangeable-lens-cameras/products/ilce-7m4`, α1 II 제품 `https://www.sony.co.kr/electronics/interchangeable-lens-cameras/ilce-1m2?locale=ko_KR`.
- spec source: A7 IV `https://www.sony.com/electronics/support/e-mount-body-ilce-7-series/ilce-7m4/specifications`, α1 II `https://www.sony.com/electronics/support/e-mount-body-ilce-1-series/ilce-1m2/specifications`.
- 가격은 이번 범위에서 승격하지 않았다. α1 II의 신품·중고 가격은 `unknown`, A7 IV의 기존 `legacy-unverified` 가격은 그대로 유지했다.

### 실제 diff와 canonical 결과

- A7 IV: 센서 포맷/유효 화소, 배터리·카드 포함 658g과 weight basis, 131.3×96.4×79.8mm, 4K 60p/10-bit는 `same-value/new-evidence`였다. 5축/5.5스톱 IBIS와 공식 측정 조건은 `null-fill`로 추가했다. 값 충돌은 없었다.
- α1 II: 신규 identity와 Sony E mount, 50.1MP 풀프레임 Exmor RS CMOS, 배터리·카드 포함 743g, body-only 658g, 136.1×96.9×82.9mm, 공식 인식 대상/고속 하이브리드 AF, 8K 30p/10-bit, LCD CIPA 520매와 EVF 420매 조건, 5축 중앙 8.5스톱/주변 7.0스톱 조건을 추가했다.
- α1 II의 release date, AI unit 여부, log/crop, EVF/LCD 상세, burst, shutter, card slots, weather sealing, 가격은 현재 batch에서 안전하게 승격하지 않고 `null`로 남겼다. 공식 센서 크기 35.9×24.0mm는 canonical skeleton에 `sizeMm`가 있지만 ingestion vocab claim path가 없어 승격하지 않았다.
- 시작 canonical: 바디 37 / 렌즈 36, 총 73. 완료 canonical: 바디 38 / 렌즈 36, 총 74.
- 시작 SHA-256: `871e79d42eac665c1a83b8d3a818260238c1517012c69b2bfe0de45220e59969`.
- 완료 SHA-256: `2f3794736da0dbc94c9089040620247cf51551e1d40db296811b1d474c7a2771`.
- 승인 ID: `approval-468a5de1f161b6aeb1704f50d020b6b769a02a35e5b6a0453fad60eedf2d713d`. batch의 두 item과 journal은 `canonicalized`다. apply 재실행은 `already-canonicalized`와 같은 canonical digest를 반환했다.

### Cheap-worker 측정

- task: `objective-v04-stage4-sony-extraction-001`. 공개 Sony 공식 발췌와 허용 필드 목록만 담은 일회성 `.cheap-worker-stage4-sony-public.txt`를 전달했다. 소스코드·Objective DB·프로젝트 설정은 전달하지 않았고 호출 후 probe를 삭제했다.
- 결과: 첫 실제 호출 성공. input 1,271 / output 710 / total 1,981 tokens, cache hit 128.
- 채택: A7 IV에서 IBIS·배터리·AF 자료가 제공되지 않았다는 누락 판정, 두 깊이 측정값 구분, body-only와 operational weight 분리, 배터리 LCD/EVF 조건 보존, editorial identity와 공식 claim 분리 경고를 검토 체크리스트로 채택했다.
- 메인 모델 수정/판단: worker는 live source를 조회하지 못했고 raw JSON 자체를 반환하지 않았다. 공식 페이지 신뢰성, current 여부, canonical ID/동일 제품 판정, alias, 한국어 정규화, `battery-and-card` 대표값, 8K 표기, UNKNOWN, approval/apply는 직접 검증했다.

### 첫 운영 batch에서 발견한 pipeline 문제

1. `specs.autofocus.subjects`는 vocab/validator에는 있었지만 normalizer가 모든 배열을 dimensions로 간주해 거부했다. 문자열 배열 정규화와 validation false positive를 수정하고 회귀 테스트를 추가했다.
2. 기존 promotion 테스트 두 개가 production A7 IV에 field evidence가 아직 없다는 전제에 묶여 있었다. 기존 provenance를 보존하면서 새 claim이 합쳐지는지를 검사하도록 수정했다.
3. Stage 1의 한 item당 raw source 1개 제한 때문에 현행 제품 페이지, 상세 specs, release 자료를 한 제품에 함께 연결할 수 없다. 이번에는 상세 spec source 하나를 raw claim source로 쓰고 현행성은 별도 공식 페이지로 사람이 확인했다. 다음 5–10개 batch 전에 multi-source item을 지원하는 편이 좋다.
4. vocab에는 `specs.evf`, `lcd`, `burst`, `shutter`, `cardSlots`, `weatherSealing` 경로가 있지만 canonical validator는 이 필드의 non-null 형태를 정의하지 않았다. `specs.sensor.sizeMm`는 canonical에 있으나 vocab claim path에는 없다. 이 상태에서 대량 수집하면 공식 값이 있어도 UNKNOWN으로 남거나 batch별 임의 객체가 생길 수 있으므로 먼저 작은 schema 계약 보완이 필요하다.
5. raw `evidenceExcerpt`는 구조화된 정규값과 locator를 보존하지만 원문 전체 snapshot은 저장하지 않는다. 한국어 enum 매핑과 30p/29.97p 같은 표현은 `conditions.officialText`/`officialRates`로 보완했다. 제품 수가 늘면 원문 발췌 보존 형식을 명시하는 것이 좋다.
6. diff는 값·source·locator·category를 충분히 보여 승인 판단에는 사용 가능했다. 다만 문자열 배열을 `×`로 표시해 AF 인식 대상이 치수처럼 보이는 표현은 후속 가독성 개선 후보이며 안전성 차단 문제는 아니다.

### 생성·수정 artifact

- 신규 batch/raw/staging/diff: `src/data/ingestion/batches/production-sony-bodies-001.json`, 두 Sony raw source, 두 staging artifact, production diff.
- 신규 approval/transaction archive: 현재 승인과 승인 이력, before/after/evidence/journal snapshot.
- 수정: `src/data/ingestion/identity-map.json`, `src/data/cameraProducts.json`, `scripts/objective/rules.mjs`, `tests/objectiveIngest.test.js`, `tests/objectivePromotion.test.js`, 이 문서.
- 일회성 cheap-worker public probe는 삭제되어 Git에 포함되지 않는다.

### 검증과 다음 시작점

- `pnpm test`: **90/90 통과**. 관련 Objective ingestion/promotion/storage/new-product 검사도 전체 통과했다.
- canonical 전체 validation 통과. `pnpm build` 성공. 변경 script/test의 `node --check`와 `git diff --check` 통과.
- 첫 2제품 production 흐름과 원자적/idempotent apply는 정상이다. 다음 batch를 바로 수십 개로 늘리지는 않는다. 먼저 multi-source item과 현재 선언만 있고 승격할 수 없는 spec 경로 계약을 보완한 뒤, 같은 Sony Tier 1 바디를 **5개 이하**로 한 번 더 실행한다. 그 결과가 안정적이면 브랜드별 5–10개 batch로 확대한다.

## Stage 3 완료 — 2026-09-21

Stage 2의 raw → normalize → validate → diff → explicit approval → atomic apply/recovery 흐름을 그대로 확장하여 **canonical에 없는 신규 바디와 렌즈를 안전하게 생성하는 경로를 완료했다.** 별도 append 우회 경로는 없으며 신규 제품도 같은 artifact digest, baseline, expected digest, journal, 전체 canonical validation을 통과한다. production `cameraProducts.json`, 추천 엔진, UI는 변경하지 않았다. 아래 Stage 2/1 절은 이력이며 최신 재개 지점은 이 절이다.

### 신규 제품 계약

- 공통 필수 identity: 검토자가 확정한 canonical `id`, `name`, `brand`, `model`, `aliases[]`, `productType`, 제조사 모델 코드와 `identity-map.json` 연결, 공식 manufacturer source의 locator가 있는 `verified` identity evidence.
- 바디 추가 필수값: `series`, `kind`, `bodyStyle`, `mount`. `kind: fixed`만 `mount: null`을 허용한다.
- 렌즈 추가 필수값: `type`, `mount`. 신규 렌즈는 canonical에도 `model`을 보존한다.
- 선택 사양은 완전한 바디/렌즈 `specs` 골격에서 `null`로 생성한다. `null`은 미확인, `false`는 확인된 기능 없음, `0`은 실제 0이다.
- 가격은 기존 런타임 형태를 항상 만든다. 신품 `value`, 중고 `low/typical/high`, `asOf`, `sourceUrl`은 `null`, 통화는 `KRW`, `sourceType`은 `unknown`이다. 이번 Stage는 가격 claim을 canonical 요약으로 승격하지 않는다.
- identity source는 canonical `sources[].fields: ["identity"]`와 `identityEvidence`의 verified/evidenceId/sourceId/checkedAt로 연결하고, 원문 위치·검토자·raw identity는 transaction evidence에 보존한다. 알려진 spec claim만 `fieldEvidence`와 정확한 source field로 추가된다.

`createNewProductSkeleton()`이 이 계약의 단일 구현이다. diff preview와 apply가 같은 함수를 사용하므로 검토한 모양과 생성 결과가 갈라지지 않는다.

### 신규/기존 판정과 중복 방지

- reviewed identity mapping이 가리키는 `productId`가 같은 product type의 canonical에 있으면 기존 제품 update다. identity와 aliases가 canonical과 정확히 같아야 Stage 2 spec promotion을 계속할 수 있다.
- ID가 없으면 `new-product`다. diff 상단에 `operation: new-product`, 전체 incoming canonical preview, identity evidence/source/locator가 표시된다.
- 다른 product type이 같은 ID를 소유하거나 기존 ID를 다른 identity에 재사용하면 차단한다.
- canonical 및 같은 batch의 정규화 alias/name/model 충돌을 차단한다.
- 브랜드가 같은 모델명의 `Mark II`/`Mk II`/`II` 같은 세대 표기를 보수적으로 접어 기존 제품과 incoming 중복을 검사한다. fuzzy matching으로 자동 병합하지 않는다.
- 마운트가 다른 렌즈 SKU는 자동으로 같은 제품으로 취급하지 않는다. 분리하려면 identity map의 명시적 `variantKey`가 해당 mount와 일치해야 하며, canonical name/model/aliases도 mount를 포함해 검색 충돌이 없어야 한다.

### Approval과 apply

신규 생성 승인은 일반 `--confirm`, `--reviewer`, `--reason`, 정확한 `--diff-digest`에 더해 `--allow-new-products`가 필요하다. approval에는 batch/product IDs, `productOperations[].operation: new-product`, incoming product digest, canonical product digest(null), identity evidence ID, incoming 전체 artifact digest와 파일별 digest, diff digest, canonical baseline/expected digest, 승인자·시각·사유가 기록된다. source/staging/diff/vocab/identity-map의 바이트가 하나라도 바뀌면 승인 무효다.

```bash
node scripts/objective/ingest.mjs normalize --batch <batch-id>
node scripts/objective/ingest.mjs validate --batch <batch-id>
node scripts/objective/ingest.mjs diff --batch <batch-id>
node scripts/objective/ingest.mjs approve --batch <batch-id> --diff-digest <검토한-digest> --reviewer "승인자" --reason "신규 identity와 근거를 승인한 이유" --confirm --allow-new-products
node scripts/objective/ingest.mjs apply --batch <batch-id>
```

apply는 Stage 2와 같은 전체 후보 생성 → 전체 validation → before/after/evidence/journal 저장 → fsync 임시 파일 → rename 직전 artifact/baseline 재검사 → atomic rename → manifest canonicalized 순서다. 새 제품은 각 type 안에서 batch product ID 순으로 기존 배열 뒤에 추가된다. 동일 승인을 재실행하면 `already-canonicalized`이며 중복 제품/source/claim을 만들지 않는다.

### Pilot과 검증 결과

- production에 없는 합성 Sony 바디 1개와 렌즈 1개를 **임시 canonical 복사본**에서 raw부터 canonicalized까지 실행했다. 합성 이름·수치·URL은 production 파일에 기록되지 않으며 테스트 종료 시 삭제된다.
- 바디: known weight/weightBasis가 적용되고 미확인 megapixels 및 나머지 선택 사양은 `null`로 유지됐다.
- 렌즈: known weight/focal이 적용되고 미확인 stabilization 및 나머지 선택 사양은 `null`로 유지됐다.
- 두 제품 모두 identity provenance, claim provenance, unknown 가격 구조를 보존하고 전체 canonical validator를 통과했다.
- 기존 75개 + Stage 3 신규 14개 = **89/89 통과** (`pnpm test`). 신규 검사는 valid body/lens, ID 재사용, alias 충돌, equivalent existing, 필수 identity 누락, UNKNOWN, 무승인 apply, artifact/stale 승인, atomic failure/resume, idempotency, provenance, 전체 validation, CLI flag를 포함한다.
- 기존 Sony A7 IV read-only pilot artifact는 새 staging/diff 계약으로 재생성했고 여전히 `validated`/`diff`, approval 없음이다.
- production canonical SHA-256: `871e79d42eac665c1a83b8d3a818260238c1517012c69b2bfe0de45220e59969` (Stage 시작 전과 동일).
- `pnpm build` 성공. `git diff --check`, ingestion JSON parse, 변경된 script/test의 `node --check`도 모두 통과했다.

### Stage 3 생성·수정 파일

- 수정: `scripts/objective/rules.mjs` — identity evidence 정규화, 신규 필수 identity, 모델 세대/alias/incoming 중복 검사, UNKNOWN canonical skeleton, new-product diff/출력.
- 수정: `scripts/objective/merge.mjs` — 기존/신규 판정, 신규 identity 계약 재검증, 승인된 skeleton 생성과 결정적 append, 전체 validation.
- 수정: `scripts/objective/promotion.mjs` — 신규 product operation 승인, incoming digest와 승인 의미 검증, 기존 transaction 경로 연결.
- 수정: `scripts/objective/ingest.mjs` — `approve --allow-new-products`.
- 신규: `tests/support/newProductFixture.mjs`, `tests/objectiveNewProduct.test.js` — production을 오염시키지 않는 2제품 pilot와 Stage 3 회귀 검사.
- 수정: 기존 pilot staging/diff/manifest와 이 문서 — 새 결정적 artifact 계약으로 checkpoint 갱신.

### cheap-worker

`objective-v04-stage3-fixtures-tests`로 기존 test helper와 vocab만 선택해 fixture 초안을 요청했다. dry-run은 통과했으나 첫 실제 호출과 같은 task ID의 허용된 재시도가 모두 `WORKER_BUSY`로 실패했다. worker patch는 생성·적용되지 않았다. 필수 계약과 구현, fixture, 검토, 테스트는 메인 모델이 수행했다.

### 다음 세션의 정확한 시작점

1. `git status --short`, 이 Stage 3 절, canonical SHA-256, `pnpm test`를 확인한다. Stage 1–3을 다시 구현하지 않는다.
2. 가격 promotion은 별도 Stage로 남아 있다. `prices/<batchId>.json` 관찰, 표본/기간/상태 조건, 요약 산출 버전을 먼저 확정하기 전에는 신품/중고 값을 채우지 않는다.
3. Objective 제품 확대를 시작한다면 첫 production batch는 한 브랜드의 Tier 1 바디 1–2개로 제한한다. 각 제품의 실제 공식 identity/spec 근거를 사람이 검토한 raw/identity-map으로 만들고, diff의 `new-product` preview를 검토한 뒤 승인한다.
4. 첫 batch가 canonicalized되고 89개 이상 전체 테스트와 build가 통과한 뒤 5–10개 단위 브랜드 batch로 늘린다. 추천 엔진/UI/Experience DB 작업은 ingestion batch와 섞지 않는다.

## Stage 2 완료 — 2026-09-21

Stage 1의 미커밋 작업을 보존하고 approval/apply/recovery 계층을 이어서 구현했다. **Stage 2 필수 미완료 항목 없음.** production canonical과 추천 엔진/UI는 변경하지 않았다. 아래 Stage 1 기록은 당시 이력이며 최신 재개 지점은 이 절이다.

### 검증 결과와 pilot

- 기존 38개 + Stage 1 7개 + Stage 2 30개 = **75/75 통과** (`pnpm test`).
- `pnpm build` 성공. `git diff --check` 및 신규 파일 공백/JSON 검사 완료.
- 임시 저장소 복사본에서 Sony A7 IV evidence 승격을 실제 파일 쓰기로 실행했다. physical specs와 가격은 전부 동일하고 source/claim 연결만 추가됐다.
- 임시 pilot baseline: `871e79d42eac665c1a83b8d3a818260238c1517012c69b2bfe0de45220e59969`
- 임시 pilot expected/actual: `b0e386cfe54bb002020c4917c65efb61a04b2dbd201be0e27ef29ee6fd05ec41`
- 결과 `canonicalized`, manifest item `canonicalized`, 두 번째 apply `already-canonicalized`.
- production SHA-256은 baseline과 동일하다. production manifest는 기존 `validated`/`diff`, approval 없음. 테스트 승인을 production 사람 승인으로 만들지 않았다.
- 테스트의 659g·600g 같은 합성 수치는 임시 fixture에만 존재하며 테스트 종료 시 삭제된다. Stage 1 pilot 근거를 재사용한 것이며 제조사 자료를 이번에 새로 검증했다고 주장하지 않는다.
- 실제 자식 프로세스를 rename 전/후 SIGKILL로 종료하고 `recover --unlock-stale`로 복구하는 테스트도 통과했다.

### 생성·수정 파일

- 수정: `scripts/objective/ingest.mjs` — approve/apply/recover, status의 승격 상태, 명시적 baseline 갱신, writer lock, 임시 root 지원.
- 수정: `scripts/objective/rules.mjs` — raw 경로 allowlist를 쓰기 전에 검사하고 결정적 직렬화의 undefined 처리를 JSON과 맞춤.
- 신규: `scripts/objective/merge.mjs` — raw 재정규화 대조, 전체 canonical 검증, 승인된 leaf만 병합, source/fieldEvidence 보존.
- 신규: `scripts/objective/promotion.mjs` — approval record, digest gate, 적용 의도 journal, apply/복구/rollback/audit.
- 신규: `scripts/objective/storage.mjs` — SHA-256, 경로 검사, durable atomic write, writer lock.
- 수정: `tests/objectiveIngest.test.js` — 기존 7개 검사의 의도를 유지. apply 부재 검사는 승인 없는 apply 거부로 전환하고 CLI 검사를 임시 root로 격리.
- 신규: `tests/objectivePromotion.test.js`, `tests/objectiveStorage.test.js`, `tests/support/objectiveFixture.mjs`.
- 수정: 이 진행 문서. 기존 `package.json`, `.cheap-worker.json`, `AGENTS.md`, `delegate-cheap.mjs`는 사용자 변경 그대로 보존.

### 승인 계약

`approve`는 검증된 batch, 검토한 diff digest, `--confirm`, 승인 주체, 사유를 모두 요구한다. 승인 기록에는 batch/product IDs, approvedAt, approvedBy(name/method), diff의 구조 digest와 파일 digest, raw/staging/diff/vocab/identity-map의 파일 digest, baselineCanonicalDigest, expectedCanonicalDigest, claim별 category/action/reason이 들어간다.

- `same-value/new-evidence`와 `null-fill`도 명시적 승인이 필요하다.
- `value-conflict`는 추가로 `--allow-value-conflicts`와 사유가 있어야 한다. 대체된 값의 과거 근거는 transaction에 남기고 새 값의 현재 근거로 재표시하지 않는다.
- `incoming-unknown`과 `unknown-no-change`는 ignore로 기록하고 기존 값을 지우지 않는다.
- 이번 CLI 승인은 batch의 알려진 변경 전체를 승인한다. 일부 필드만 승인하려면 적용 전에 batch를 나누고 diff를 재생성한다.
- 승인 이후 artifact는 공백 변경도 무효화한다. diff/approval을 다시 만들어야 한다. apply는 expected 결과도 다시 계산하며 기록만 신뢰하지 않는다.
- 로컬 작업자의 명시적 CLI 확인을 기록하는 방식이다. 전자서명/다중 사용자 인증 시스템은 아니다. 테스트 승인 method는 `test-fixture`, 실제 CLI는 `cli-explicit`다.

실행 예시(실제 사람이 diff와 원문 근거를 검토한 뒤 자리표시자를 채운다):

```bash
node scripts/objective/ingest.mjs status --batch pilot-sony-a7-iv-001
node scripts/objective/ingest.mjs diff --batch pilot-sony-a7-iv-001
node scripts/objective/ingest.mjs approve --batch pilot-sony-a7-iv-001 --diff-digest <검토한-diff-digest> --reviewer "승인자" --reason "근거와 채택 사유" --confirm
node scripts/objective/ingest.mjs apply --batch pilot-sony-a7-iv-001
```

canonical이 다른 작업으로 바뀌었고 아직 apply intent가 없다면 `diff --refresh-baseline --batch <ID>` → 검토 → 새 approve 순서다. intent가 이미 있다면 recover로 먼저 상태를 확인한다. terminal batch는 새 batch로 후속 변경을 제출한다.

### 원자적 쓰기·checkpoint·복구

apply 전에 같은 파일시스템의 임시 파일에 전체 후보 JSON을 쓴다. 전체 canonical validation, 파일 fsync, 임시 파일 digest 확인, rename 직전 artifact/baseline 재확인, atomic rename, 부모 디렉터리 fsync, 적용 후 전체 validation 순서로 진행한다. 새 디렉터리도 부모까지 sync한다. 단일 writer lock은 모든 변경 CLI를 직렬화하며 살아 있는 프로세스의 lock은 회수하지 않는다. 지원 기준은 현재 macOS/Linux 로컬 파일시스템이다. 협조하지 않는 외부 편집기는 lock을 사용하지 않으므로 apply 동안 canonical을 동시에 직접 편집하지 않는다.

적용 때 자동으로 생성되는 파일:

```text
src/data/ingestion/approvals/<batchId>.json                  현재 승인
src/data/ingestion/approvals/<batchId>/<approvalId>.json     승인 이력
src/data/ingestion/transactions/<batchId>/before.json        원본 바이트
src/data/ingestion/transactions/<batchId>/after.json         검증된 예상 결과
src/data/ingestion/transactions/<batchId>/evidence.json      승인 + raw/staging/diff/config snapshot
src/data/ingestion/transactions/<batchId>/journal.json       prepared/canonicalized/rolling-back/rolled-back
```

journal은 canonical 교체 전에 저장한다. canonical 교체 후 journal을 완료하고 manifest를 canonicalized로 기록한다. 두 파일의 원자적 교체를 하나의 트랜잭션인 척하지 않고, digest와 journal로 중간 상태를 판별한다.

| 상태 | 재개 방법 |
| --- | --- |
| 원본 digest, prepared | `recover --batch <ID>`가 not-applied 표시. 동일 approval로 apply 재실행 |
| 예상 결과 digest, manifest 미완료 | `recover --batch <ID>`가 고정된 snapshot으로 검증하고 manifest 완료 |
| canonicalized | apply 재실행은 no-op. 이후 다른 batch 변경이 있어도 이 batch를 다시 덮어쓰지 않음 |
| 취소/원복 | `recover --batch <ID> --rollback`. 원본 바이트 복구 후 approval 취소. 후속 변경은 새 batch |
| rollback 도중 종료 | 다음 recover가 rolling-back intent를 읽고 원복·상태 기록 완료 |
| apply 프로세스 강제 종료로 lock 잔존 | `recover --batch <ID> --unlock-stale`. 같은 호스트의 죽은 PID일 때만 회수 |
| 원본/예상과 모두 다른 canonical 또는 손상된 snapshot | 자동 덮어쓰기 거부. 외부 변경을 먼저 검토 |

이미 rename됐으나 live staging/diff가 이후 바뀐 경우 apply는 승인을 무효화한다. recover는 **적용 전에 저장된 승인 snapshot**만 사용해 기존 적용 결과를 마무리할 수 있다. 새 incoming을 몰래 적용하지 않는다. rollback은 현재 digest가 원본/예상 중 하나일 때만 가능하며 외부 변경을 덮어쓰지 않는다.

### Provenance와 현재 범위

canonical `sources`에 sourceId/문서 버전/정확한 필드 경로를 연결하고 `fieldEvidence`에는 검증 상태·claim IDs·검토일을 남긴다. 원문 위치, raw 값/단위, 측정 조건, reviewer, 기존 값과 출처 전체는 evidence/before snapshot에 보존한다. 같은 승인 재실행은 source/claim/제품을 중복 생성하지 않는다. source JSON과 transaction archive를 canonical과 함께 버전 관리한다. 실행 중인 lock/temp 파일은 커밋 대상이 아니다.

이번 Stage 2 승격 범위는 **기존 productId의 검증된 물리 사양 leaf와 근거**다. 신규 제품 생성, identity/alias 변경, 가격 요약 승격은 명시적으로 거부한다. 기존 canonical의 모델명·별칭·스키마·원→만원 변환·엔진 정책은 유지된다. Stage 1이 받아들이던 일부 느슨한 타입도 승인 시 전체 validator에서 거부한다. 아직 스키마가 정의되지 않은 상세 사양은 임의로 비어 있는 객체를 채우지 않는다.

### cheap-worker

`objective-v04-stage2-storage-tests`로 storage 파일 하나만 전달했다. dry-run 성공 후 실제 API 1회는 출력 한도로 실패했고, 동일 ID의 마지막 재시도에서 테스트 2개 초안을 받았다. 경로·부작용을 직접 검토하고 macOS 임시 경로 realpath 처리와 표현을 보완해 `objectiveStorage.test.js`에 채택했다. 승인 의미, digest, 원자적 쓰기, recovery, canonical 병합은 메인 모델이 작성·판단했고 테스트도 직접 실행했다.

### 다음 Stage의 정확한 시작점

1. `git status --short`와 이 문서, `pnpm test`부터 확인한다. 이번 Stage 2를 다시 만들지 않는다.
2. 현행 바디 수집(Stage 3)을 시작하기 전에 신규 product의 필수 skeleton/identity 승인 및 new-product diff 승격 계약을 작은 fixture로 추가한다. 현재 Stage 2의 new-product 거부를 단순 제거하면 안 된다.
3. 기존 Sony 제품 1–2개의 공식 원문 위치·측정 기준을 실제로 재검증하여 첫 소규모 batch를 만든다. 사용자 검토 후 production approve/apply로 이어간다.
4. 그다음 브랜드별 5–10개 규모로 나눈다. 가격 수집·추천 엔진/UI 작업은 섞지 않는다.

## 재개 순서

1. `git status --short`로 사용자 기존 변경과 Stage 1 변경을 구분한다.
2. 이 문서와 `OBJECTIVE_DB_V04_ARCHITECTURE.md`, `OBJECTIVE_DB_V04_PLAN.md`를 읽는다.
3. `shasum -a 256 src/data/cameraProducts.json`이 아래 canonical 기준값과 같은지 확인한다.
4. `node scripts/objective/ingest.mjs status --batch pilot-sony-a7-iv-001`로 다음 작업을 확인한다.
5. 완료된 명령을 처음부터 다시 구현하지 않는다.

## 보호 기준

- 시작 commit: `c2277c5` (`Design objective DB v0.4 ingestion pipeline`)
- canonical SHA-256: `871e79d42eac665c1a83b8d3a818260238c1517012c69b2bfe0de45220e59969`
- `src/data/cameraProducts.json`, 추천 엔진, UI는 Stage 1에서 수정하지 않는다.
- `apply`와 canonical 쓰기 기능은 Stage 1 범위 밖이다.
- 시작 시 기존 테스트: 38/38 통과.
- 작업 전부터 존재한 사용자 변경: `.cheap-worker.json`, `AGENTS.md`, `delegate-cheap.mjs`, `package.json`의 `delegate-cheap` script.

## 현재 상태

- [x] 설계 문서, v0.3 canonical/호환 코드, 기존 테스트 확인
- [x] 시작 canonical digest와 기존 38개 테스트 확인
- [x] status 상태 모델/조회: 6개 상태, artifact 존재 여부, 다음 명령, canonical baseline 일치 여부 표시
- [x] raw → staging normalize: reviewed ID mapping, 단위/UNKNOWN, provenance, weight basis claim 연결
- [x] staging validate: pilot의 ID/alias/type/mount/숫자/출처/claim 검증 통과
- [x] canonical read-only diff: 값·단위·canonical/incoming 출처와 review 상태 출력
- [x] pilot 전체 실행: Sony A7 IV 658g 및 `battery-and-card`가 `same-value/new-evidence`로 출력됨
- [x] 신규 테스트, 전체 테스트, build, canonical 불변 확인

## cheap-worker

- 테스트 초안을 위임하려 했으나 dry-run은 입력 크기 제한으로 실패했다.
- 같은 task ID의 1회 재시도는 worker ledger에 초기 시도가 없다는 오류로 실패했다.
- 프로젝트 지침에 따라 추가 재시도하지 않는다. 생성되거나 채택한 worker 코드는 없다.

## 다음 시작 위치

Stage 1 완료. pilot manifest는 `validated`, 마지막 성공 gate는 `diff`다. staging/diff artifact가 생성됐으며 canonical digest는 시작값과 같다.

### 구현 파일

- `scripts/objective/rules.mjs`: 상태/해시, reviewed identity, 단위·UNKNOWN 정규화, validation, read-only diff와 출력
- `scripts/objective/ingest.mjs`: `status`, `normalize`, `validate`, `diff` CLI와 원자적 checkpoint 쓰기
- `src/data/ingestion/vocab.json`, `identity-map.json`: Stage 1 vocabulary와 Sony pilot ID 연결
- `src/data/ingestion/raw/source-0379a083289afde8.json`: 기존 Sony A7 IV 공식 무게 근거 pilot
- `src/data/ingestion/staging/pilot-sony-a7-iv-001/sony-ilce-7m4.json`: 결정적으로 생성된 staging
- `src/data/ingestion/diffs/pilot-sony-a7-iv-001.json`: canonical을 바꾸지 않는 검토용 diff
- `src/data/ingestion/batches/pilot-sony-a7-iv-001.json`: `validated`/`diff` checkpoint
- `tests/objectiveIngest.test.js`: 7개 Stage 1 테스트

### 최종 검증

- 기존 테스트 38개 + 신규 테스트 7개: 45/45 통과
- `pnpm build`: 성공
- normalize/validate/diff 재실행: canonical과 checkpoint 바이트 변화 없음
- canonical SHA-256: `871e79d42eac665c1a83b8d3a818260238c1517012c69b2bfe0de45220e59969` (시작값과 동일)
- `apply` 명령/API는 구현하지 않았으며 CLI에서 거부됨

## Stage 1 종료 당시 다음 세션 안내 (이력)

Stage 1의 필수 미완료 항목은 없다. 다음 구현 세션은 `OBJECTIVE_DB_V04_PLAN.md`의 **2단계: 안전한 승격과 복구**부터 시작한다. 먼저 현재 pilot diff를 사람이 검토하고, canonical baseline/예상 결과 digest, 승인 기록, 원자적 `apply`, 적용 중단 복구를 설계대로 구현한다. 대량 제품 수집·추천 엔진/UI 변경은 그 세션에도 섞지 않는다.
