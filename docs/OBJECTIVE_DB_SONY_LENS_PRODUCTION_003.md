# Sony E-Mount Lens Production Batch 003 — 완료

2026-10-16. **잔여 FE 일반 단렌즈8개 전부 신규 production 성공**, 하나의 atomic transaction으로 canonical **165bodies/49lenses/214total →165/57/222**. FE 일반 단렌즈 미처리0, 전체 tests498/498 통과. 실제 재적용 already-canonicalized / canonicalMatches:true. 이번 대상 미완료0, schema/pipeline/추천/UI 변경0. Commit/push는 하지 않았다.

**분모 차이를 구분한다.** 과거 snapshot67개 기준으로는 완료25/67·잔여42가 맞다. 그러나 공식 재조회에서 과거 upcoming400mmF4.5/600mmF6.3의 rendered model/SKU summary에 구매 안내와 곧 공개 부재를 확인했다. 기존 catalog-state 정책을 적용한 현재 분모는 **69개·완료25·잔여44**, upcoming2/teleconverter2별도다. 이2개는 이번 production에 넣지 않았다. 과거 snapshot/기존sealedartifact는 보존했으며 변화 시점/원인을 추정하지 않는다. 아래 current69는 기존 inventory+확인된2status deltas의 갱신 판단이며 global/모든SKU coverage audit 완료 선언이 아니다.

[운영 checkpoint](../src/data/ingestion/sony-e-lenses-production-003.json), [manifest](../src/data/ingestion/batches/production-sony-e-lenses-003.json), [diff](../src/data/ingestion/diffs/production-sony-e-lenses-003.json), [explicit approval](../src/data/ingestion/approvals/production-sony-e-lenses-003.json), [sealed evidence](../src/data/ingestion/transactions/production-sony-e-lenses-003/evidence.json), [회귀20개](../tests/sonyLensProduction003.test.js).

## 요청한45항목

1. **실제 선정 수**:8개. Clean baseline **94007034cece6e133455d1ed2e783c25964958ff**에서 시작했다.001~002 artifact/진행문서/readiness/field contracts/map/vocab/canonical/validators/기존 tests를 대조하고, selection을 worker 전에 checkpoint에 고정했다. 중단 이전 조회 결과를 이어 사용했고 API/raw/apply를 처음부터 반복하지 않았다.

2. **전체 model code**: SEL35F28Z, SEL85F14GM, SEL35F18F, SEL135F18GM, SEL28F20, SEL35F14Z, SEL50F14Z, SEL50F18F.

3. **공식 current/status**:Sony Korea rendered gallery73cards(2026-10-16T03:48:35.835Z)와8개 product/spec을 실제 조회했다. Selected8는 전부 기존 released/current이며001~002와 중복0, 선택 inventory 차이0. 과거 upcoming4도 별도 확인했다. [400F45GM](https://www.sony.co.kr/electronics/e-mount-lenses/sel400f45gm)/[600F63GM](https://www.sony.co.kr/electronics/e-mount-lenses/sel600f63gm)은 exact model/SKU summary에 구매 안내가 있고 곧 공개가 없었다(04:15:10.956Z/04:15:10.598Z). [814G](https://www.sony.co.kr/electronics/e-mount-lenses/sel814g)/[28702](https://www.sony.co.kr/electronics/a-mount-lenses/sel28702)는 가격 미정/곧 공개(04:15:21.169Z/04:15:10.320Z). 처음 editorial body만 읽으면 늦게 렌더링되는 summary의 곧 공개를 놓칠 수 있어 실제 선택 모델 영역까지 확인했다. Catalog current는 dealer stock이나 정확한 출시일을 뜻하지 않는다.

4. **기존 canonical 매칭**:8개 모두 공식 code/name/세대/초점거리/조리개/G·GM·ZA/ID를 기존 전체 lens49 및 reviewed identity-map과 비교해 absent 확인.85GM은 이미 처리한85GMII/85F18과,50F18F는 APS-C SEL50F18과 구분한다.

| 공식 model / product link | Official display name | 신규 canonical ID |
|---|---|---|
| [SEL35F28Z](https://www.sony.co.kr/electronics/camera-lenses/sel35f28z) | Sonnar T* FE 35mm F2.8 ZA | sony-sonnar-t-fe-35-f28-za |
| [SEL85F14GM](https://www.sony.co.kr/electronics/camera-lenses/sel85f14gm) | FE 85mm F1.4 GM | sony-fe-85-f14-gm |
| [SEL35F18F](https://www.sony.co.kr/electronics/camera-lenses/sel35f18f) | FE 35mm F1.8 | sony-fe-35-f18 |
| [SEL135F18GM](https://www.sony.co.kr/electronics/camera-lenses/sel135f18gm) | FE 135mm F1.8 GM | sony-fe-135-f18-gm |
| [SEL28F20](https://www.sony.co.kr/electronics/camera-lenses/sel28f20-series) | FE 28mm F2 | sony-fe-28-f2 |
| [SEL35F14Z](https://www.sony.co.kr/electronics/camera-lenses/sel35f14z) | Distagon T* FE 35mm F1.4 ZA | sony-distagon-t-fe-35-f14-za |
| [SEL50F14Z](https://www.sony.co.kr/electronics/camera-lenses/sel50f14z) | Planar T* FE 50mm F1.4 ZA | sony-planar-t-fe-50-f14-za |
| [SEL50F18F](https://www.sony.co.kr/electronics/camera-lenses/sel50f18f) | FE 50mm F1.8 | sony-fe-50-f18 |

5. **신규/기존 보강**:신규8 / 기존0. 기존 제품 보강으로 거짓 집계하거나 duplicate를 생성하지 않았다.

6. **Canonical 수량**:bodies165→165 / lenses49→57 / total214→222. 기존 모든165body/49lens/가격/identity deep equality와 HEAD before·live after byte 일치 확인. CameraProducts는 production pipeline으로만 변경했다.

7. **Sony production 누적**:0015+00212+0038=25개, 모두 실제 transaction provenance 기준. Canonical 존재만으로 production 완료를 세지 않는다.

8. **Production 미처리**:과거67기준42 / 이번 공식status 갱신69기준44. 차이는이번생성실패가 아니라기존upcoming2개가current카탈로그로확인된데서발생한다. Upcoming2와TC2는현재69의분모밖이다.

9. **제품별 focal**:아래 표 actual mm. Canonical prime min=max, explicit raw/staging mm. APS-C 환산·컨버터 조합 화각을 대신 넣지 않았다.

10. **Aperture**:아래 표 최대 개방F / 최소 선택F. Canonical wide=tele=최대F, 최소F는 provenance에만 보존한다. 숫자F 계약이며 minimum selectable/T-stop과 구분한다.85GM/35ZA/50ZA의1.4k는 별도 product maximum-F 근거로 처리했다.

11. **Mount**:8개 모두 공식 마운트 소니 E-마운트 →canonical Sony E. FE라는 별도 physical mount 추가0.

12. **Format coverage**:8개 모두 공식35mm 풀프레임→full-frame, independent fieldEvidence 연결. 이름/physical mount에서 추정한 coverage0.

13. **OSS**:35F18F/135GM/50ZA는 공식 SteadyShot '- (바디 통합)' 행을 기존 policy대로 false. 나머지5개는 해당 행이 없어 UNKNOWN/null. 제품명 OSS 부재만으로 false를 만들지 않았고 body IBIS나 combined stops 승격0.

14. **Minimum focus**:아래 m열.85GM AF0.85/MF0.8을 구분하고 AF를 대표값으로 선택했다. 다른7개는 모드 미기재여서 AF/MF를 추정하지 않았다. Sony [촬상면 마크 일반 설명](https://helpguide.sony.net/ilc/1420/v1/en/contents/TP0000226547.html)을 거리 기준 참고로 사용했으며 개별 numeric row가 그 기준을 직접 재진술한 것으로 과장하지 않는다. 렌즈 전면 working distance 계산0.

15. **Maximum magnification**:아래 x열,0.12/0.12/0.24/0.25/0.13/0.18/0.15/0.14. 전부 decimal×라1:X 변환 불필요. Current canonical 미지원이므로 raw claim conditions/checkpoint backlog에 남겼다.

16. **Filter**:아래 mm열.35F28Z 렌즈 thread49mm와 supplied ALC-SH129 hood thread40.5mm는 다른 장착 범위다.49를승격하고40.5는 accessory 조건으로보존해 가짜conflict를만들지않았다.

17. **Dimensions**:아래 D×L mm,weight claim conditions/backlog에 보존. Canonical 새 dimensions field0.

18. **Weight**:아래 g,standalone lens/몸체 제외. Hood/cap 포함 여부는 source 행에서 명시하지 않아 UNKNOWN. Body용 weightBasis를 lens에 만들지 않았다.

| Model | Actual mm | 최대F / 최소F | OSS | Min focus m | 최대배율 x | Filter mm | D×L mm | g |
|---|---:|---|---|---|---:|---:|---|---:|
| SEL35F28Z | 35 | 2.8 / 22 | UNKNOWN | 0.35 (모드 미구분) | 0.12 | 49 | 61.5 × 36.5 | 120 |
| SEL85F14GM | 85 | 1.4 / 16 | UNKNOWN | 0.85 AF / 0.8 MF | 0.12 | 77 | 89.5 × 107.5 | 820 |
| SEL35F18F | 35 | 1.8 / 22 | false | 0.22 (모드 미구분) | 0.24 | 55 | 65.6 × 73 | 280 |
| SEL135F18GM | 135 | 1.8 / 22 | false | 0.7 (모드 미구분) | 0.25 | 82 | 89.5 × 127 | 950 |
| SEL28F20 | 28 | 2 / 22 | UNKNOWN | 0.29 (모드 미구분) | 0.13 | 49 | 64 × 60 | 200 |
| SEL35F14Z | 35 | 1.4 / 16 | UNKNOWN | 0.3 (모드 미구분) | 0.18 | 72 | 78.5 × 112 | 630 |
| SEL50F14Z | 50 | 1.4 / 16 | false | 0.45 (모드 미구분) | 0.15 | 72 | 83.5 × 108 | 778 |
| SEL50F18F | 50 | 1.8 / 22 | UNKNOWN | 0.45 (모드 미구분) | 0.14 | 49 | 68.6 × 59.5 | 186 |

Optical construction,coating/weather/초점 메커니즘은 checkpoint와 source scope/claim conditions에 보존했다.35ZA/35F1.4ZA/50ZA T*코팅,85GM/135GM NanoAR,135GM frontfluorine,28mm multicoating 등의 공식 문구를 기록하되 IP/완전방진방적 보장은 추정하지 않았다.50F18F weather/coating은UNKNOWN.135GM floating focus와85GM two-sensor/RDSSM,35ZA DDSSM은 일반 focus mechanism으로 currentcore contract와충돌하지않는다. STF/apodization/T-stop/macro/supertele/내장TC는선정제품없음.28mm의21/16mm는외부옵션converter이며barelens는28mm고정이다.

19. **공식 source 수**:제품별2개,raw16개. Identity-only도 product source count에 포함한다.85GM/35ZA/50ZA product source는 identity+maximumF,나머지 product source는identity-only. Spec source는각자의수치와조건을소유한다. 일반거리정의helpguide는modelnumeric source수에합산하지않는다.

| Model | 공식 source | 수 | Product accessedAt UTC | Spec accessedAt UTC |
|---|---|---:|---|---|
| SEL35F28Z | [identity](https://www.sony.co.kr/electronics/camera-lenses/sel35f28z) · [spec](https://www.sony.co.kr/electronics/camera-lenses/sel35f28z/specifications) | 2 | 2026-10-16T03:48:52.966Z | 2026-10-16T03:49:02.202Z |
| SEL85F14GM | [identity+최대F](https://www.sony.co.kr/electronics/camera-lenses/sel85f14gm) · [spec](https://www.sony.co.kr/electronics/camera-lenses/sel85f14gm/specifications) | 2 | 2026-10-16T03:48:54.864Z | 2026-10-16T03:49:02.420Z |
| SEL35F18F | [identity](https://www.sony.co.kr/electronics/camera-lenses/sel35f18f) · [spec](https://www.sony.co.kr/electronics/camera-lenses/sel35f18f/specifications) | 2 | 2026-10-16T03:49:11.234Z | 2026-10-16T03:49:11.597Z |
| SEL135F18GM | [identity](https://www.sony.co.kr/electronics/camera-lenses/sel135f18gm) · [spec](https://www.sony.co.kr/electronics/camera-lenses/sel135f18gm/specifications) | 2 | 2026-10-16T03:49:13.604Z | 2026-10-16T03:49:14.008Z |
| SEL28F20 | [identity](https://www.sony.co.kr/electronics/camera-lenses/sel28f20-series) · [spec](https://www.sony.co.kr/electronics/camera-lenses/sel28f20-series/specifications) | 2 | 2026-10-16T03:49:15.805Z | 2026-10-16T03:49:16.634Z |
| SEL35F14Z | [identity+최대F](https://www.sony.co.kr/electronics/camera-lenses/sel35f14z) · [spec](https://www.sony.co.kr/electronics/camera-lenses/sel35f14z/specifications) | 2 | 2026-10-16T03:49:25.450Z | 2026-10-16T03:49:26.510Z |
| SEL50F14Z | [identity+최대F](https://www.sony.co.kr/electronics/camera-lenses/sel50f14z) · [spec](https://www.sony.co.kr/electronics/camera-lenses/sel50f14z/specifications) | 2 | 2026-10-16T03:49:28.112Z | 2026-10-16T03:49:28.907Z |
| SEL50F18F | [identity](https://www.sony.co.kr/electronics/camera-lenses/sel50f18f) · [spec](https://www.sony.co.kr/electronics/camera-lenses/sel50f18f/specifications) | 2 | 2026-10-16T03:49:30.133Z | 2026-10-16T03:49:30.843Z |

20. **Source/value conflicts**:진짜numeric conflict0,임의덮어쓰기0.3malformed1.4k는숫자claim을만들지않고명시적product F1.4문구에attribution했다. 서로다른정상numeric claims는기존CONFLICTING_CLAIM_VALUES로차단하며회귀확인했다. Hood/lensfilter와externalconverter/barelens는scope차이이므로별도metadata다.

21. **주요 UNKNOWN**:35F28Z/85GM/28F20/35F14Z/50F18F OSS5개;mode미구분7개;hood/capweight포함여부전체8개;50F18Fweather/coating.80specclaims중75known/5UNKNOWN이며 UNKNOWN5의fieldEvidence를만들지않았다.

22. **기존 model null-fill**:0/N/A.8개모두신규이므로model-null-fill flag를사용하지않았다. 향후기존2lens보강에서는readiness의explicitflag필요. 공유contract fixture의existing absent/null/known model 회귀도이번116suite에서통과했다.

23. **Explicit approval**:--confirm/--reviewer/--reason/--diff-digest와 **--allow-new-products** 사용. Main이human-readable summary+80paths+identity/sources를검토했다. Accept75/UNKNOWNignore5,conflict flag없음. Approval ID **approval-fefeb621c74ec1f43db68ab1a5580cf3f80282b5d43c40587406b6b2e4292daf**.별도end-user수동review를받았다고기록하지않는다.

24. **Identity lock**:기존모든49lens identity불변.8개mapping만append,기존registryprefix불변.현재각ID/model한개씩,새productequivalence/alias/knownmodel검증유지.신규knownmodel을변경한negativevalidate와aliascollision도차단.001~002sealedartifact와회귀무수정.

25. **제품별 worker token**:실제API비용만합산하며실패attempt도포함한다. 제품1개=독립task8개. 공개Sony자료+손으로작성한최소lensschema만전달했고전체canonical/코드/secret전송0.

| Model | Input | Output | Total | 실제API / retry / failure |
|---|---:|---:|---:|---|
| SEL35F28Z | 818 | 538 | 1356 | 1 / 0 / 0 |
| SEL85F14GM | 1702 | 1124 | 2826 | 2 / 1 / 1 |
| SEL35F18F | 783 | 480 | 1263 | 1 / 0 / 0 |
| SEL135F18GM | 803 | 446 | 1249 | 1 / 0 / 0 |
| SEL28F20 | 810 | 472 | 1282 | 1 / 0 / 0 |
| SEL35F14Z | 834 | 503 | 1337 | 1 / 0 / 0 |
| SEL50F14Z | 857 | 368 | 1225 | 1 / 0 / 0 |
| SEL50F18F | 786 | 553 | 1339 | 1 / 0 / 0 |

26. **총 worker token**:input7,393/output4,484/total11,877.85GM은실패1,460+성공1,366=2,826을모두포함한다.임시publicfixture8개삭제,patch적용0.

27. **Retry/failure**:실제API9건/재시도1/실패1(MALFORMED_RESPONSE).85GM만동일taskID·--retry로허용된1회재시도,attempt2성공.그외7개첫시도성공.별도로초기STATE_UNAVAILABLE8건은공유lock쓰기권한으로API전차단되어API시도·token0이며preApiFailures에원기록보존.권한확장으로해결했고adapter/worker본체우회패치없음.Dry-run8개는API시도아니다.

28. **Worker 유용성**:focal/aperture/filter/weight숫자는공식자료와일치.35ZAhood49/40.5scope,28mm외부converter,1.4k오류경고유용.일부응답의실제로없는1.4k일반경고·unsupportedfacts누락은버렸다.35F18F의과도한OSSnull은공식dash행에따라false.85GMretry의MF0.8대표선택은AF0.85대표/MF대안정책으로교정.실패응답은채택0이며직접추출대체를worker성공으로꾸미지않았다.

29. **Main GPT-6.1 Sol 직접 판단**:8identity/current/newID/modelgeneration/G·GM·ZA/physicalmount/coverage,80specpaths,3aperture대체근거,OSSunknown5/false3,85AF·MF,hoodfilter/externalconverter,weight·D×L·배율·weather조건,UNKNOWN,진짜conflict구분,diff/approval/atomicapply/reapply와출시상태delta2를직접판단했다.

30. **사람 개입량**:추가사용자제품판단/승인요청0.Mainreview8제품/80specpaths,metadata/source상태별도.실제인간노동분은측정하지않아임의수치없음.공유worker권한확장은자동승인도구경로로처리했다.

31. **Normalization 문제**:3×1.4k는parseFloat/k제거금지;최대F명시본문별도사용.35ZA49mm/hood40.5mm,28barelens/21·16converterscope보존.85AF0.85와MF0.8중최솟값만대표로뽑지않음.OSS없는행≠부재근거.늦은summaryhydration에서upcoming을놓치지않도록exactmodel/SKUsummary확인.모두수집·review로처리했고schema를바꾸지않았다.

32. **Pipeline/schema 신규 문제**:blocking0/codechange0/schemaextension0.초기workerSTATE_UNAVAILABLE은sandbox권한문제로공유state접근권한으로해결,productpipeline오류가아니다.조건·배율·D×L·광학/방진등기존미지원상세는보존만하며추천소비표현은별도후속범위.새guard우회0.

33. **accessedAt**:새raw16개는위표의실제browser읽기UTC ISOtimestamp를raw-helper에명시적으로주어그대로보존했다. **03:48:52.966Z–03:49:30.843Z**,날짜→자정생성0. 중단후raw생성clock은별도rawHelperCreatedAt/Through이며앞선조회시각을덮지않았다. 기존helper의생략시현재UTC자동생성기능은수정없이유지했다.

34. **전체 tests**:498/498,fail/skip0.신규batch003회귀20/20.

35. **Objective tests**:471/471.전체testfiles에서cameraScenarioEngine/firstPurchaseEngine27개만제외한집합으로production/catalog/coverage포함.

36. **Sony lens tests**:116/116=contracts45/readiness15/00117/00219/00320.001~002회귀약화/수정0.

37. **기존 body regression**:9브랜드별도subset246/246.공유contract의기존sealedbrand replay/existingmodelnull-fill/원자성중단복구회귀도통과.

38. **Canonical validation**:true.HEADcanonical=transactionbefore bytes,livecanonical=after bytes. BeforeSHA **c853a3f834890184df74aebc76f8c7ecc10fd56f2a2876f27f3e36ecff3ddb66**,AfterSHA **2c63212888a655494888604c12f2a8ab5d71e669400ef8d8089d161d5e417eb3**.기존모든바디/렌즈/가격동일.

39. **Build/node/diff**:pnpm build성공.새test+scripts/objective/*.mjs8파일node--check성공,gitdiff--check·신규파일whitespace검사성공.기존Vite>500kBchunkwarning유지(JS1046.97kB).추천/UI변경으로확장하지않았다.

40. **Idempotency**:실제CLI재적용 **already-canonicalized/canonicalMatches:true**.1개의8-itemjournal,immutableapproval,source/content/staging/diff/artifactdigests,exactbefore→after/after→afterreplay와registryprefix보존회귀통과.

41. **Git status**:미commit상태.Modified:docs/OBJECTIVE_DB_V04_PROGRESS.md,src/data/cameraProducts.json,src/data/ingestion/identity-map.json.New:본보고서/checkpoint/manifest/diff/approval2/raw16/staging8/transaction4/test.기존sealedartifact/engine/UI/가격/config수정0,publicworkerfixture삭제. Commit/push0.다음새batch는완료변경검토·commit/clean확인이먼저다.

42. **FE 일반 단렌즈 미처리**:0.이번familycoverage완료.STF/macro/supertele같은special이완료되었다는뜻이아니다.

43. **Sony 전체 미처리**:현재공식catalogstatus보정 **44개**,과거67분모고정시42개.현재완료25/69,upcoming2/TC2별도.미처리2증가는재조회statusdelta이며batch미완료제품이아니다.

44. **다음 family별 미처리**:

| Family | 현재 잔여 |
|---|---:|
| FE primes | 0 |
| APS-C | 9 |
| FE wide/standard/telephoto zooms | 24 |
| Special-family review | 11 |

Special11=기존9+이번현행확인supertele2.해당2개는이번worker/raw/canonical에넣지않고향후release/weight/opticalpreflight대상으로만기록했다.기존snapshot/upcoming분류를역사적으로덮지않았다.

45. **다음 권장 batch**:APSC9개(004).이후FEzoom12+12,special11preflight로약4productionbatch+freshcoverageaudit계획이다.각제품의현행·identity·공식수치재확인과기존2lensmodelnull-fill승인을계속적용하고,새광학계약문제가있으면해당제품만보류/분리한다.

- **production-sony-e-lenses-004 / APS-C / 9개**: SEL15F14G, SEL11F18, SEL1655G, SEL70350G, SELP18105G, SEL20F28, SEL24F18Z, SEL50F18, SEL55210
- **production-sony-e-lenses-005 / FE wide/standard/telephoto zooms / 12개**: SEL100400, SEL50150GM, SEL400800G, SEL2870GM, SEL1625G, SEL2450G, SEL1635GM2, SEL70200G2, SEL2070G, SELP1635G, SEL70200GM2, SEL1224GM
- **production-sony-e-lenses-006 / FE wide/standard/telephoto zooms / 12개**: SEL70200G, SEL70200GM, SEL200600G, SEL24105G, SEL1635GM, SEL1224G, SEL100400GM, SEL24240, SEL2470GM, SEL2470Z, SELP28135G, SEL70300G
- **production-sony-e-lenses-007 / Special-family review / 11개**: SEL100400MC, SEL100M28GM, SEL300F28GM, SELC1635G, SEL100F28GM, SEL600F40GM, SEL400F28GM, SEL30M35, SEL50M28, SEL400F45GM, SEL600F63GM — special/무게/광학/출시 preflight 후 필요시 분할.

## 실행 기록과 재개

- pnpm test
- Objective:모든tests/*.test.js에서cameraScenarioEngine.test.js/firstPurchaseEngine.test.js만제외
- node --test tests/sonyLens*.test.js tests/objectiveLensContracts.test.js
- node --test tests/sonyLensProduction003.test.js
- Body/brand:^(sonyProduction|canon|nikon|fujifilm|panasonic|omSystem|leica|sigma|hasselblad).*\.test\.js$
- pnpm build / node --check(newtest+objective7scripts) / git diff --check
- node scripts/objective/ingest.mjs apply --batch production-sony-e-lenses-003

**Batch003완료.**실제worker재시도까지종결했고다시호출하지않는다.raw재생성/새승인/재apply불필요.회귀는기존registry현재whole-file동일가정대신archive값digest+append-onlyprefix를검사해다음batch확장을허용한다.
