# Hasselblad Objective DB production batch 001

2026-10-14. Batch `production-hasselblad-bodies-001`.

**한국 공식 스토어의 현재 카메라 카드 2개를 신규 production 처리했다: X2D II 100C, 공식 조합 907X & CFV 100C. Canonical은 163/36/199에서 165/36/201로 늘었으며, 확인된 한국 current 대상 미처리는 0이다.** 907X와 CFV를 별도 완성형 카메라로 추가하지 않았다. 센서·저장·배터리·display의 digital-back 소유와 assembled bare620g을 근거에 보존했다.

이는 전세계 Hasselblad 제품 모두의 current/단종 상태나 full field completeness를 확정한 결과가 아니다. 구세대·한정판 소개, H System의 dealer/support 페이지가 남아 있어 다음 coverage audit에서 지역/판매 상태를 계속 구분해야 한다. 기존 페이지의 존재나 품절/404만으로 단종을 선언하지 않았다.

Clean baseline `0b875901e5cb339745a1c37e20f71034c7d4e3d1`. Architecture/contracts/progress, 기존 브랜드 감사, canonical/map/scope/vocab/최신 validators/production pipeline/tests를 대조했다. User가 이미 clean 상태로 만들어 추가 정리 commit은 필요 없었다.

[Inventory/재개 checkpoint](../src/data/ingestion/hasselblad-current-2026-10-14.json) · [Batch manifest](../src/data/ingestion/batches/production-hasselblad-bodies-001.json) · [회귀 테스트](../tests/hasselbladProduction001.test.js)

## 1. Inventory 지역/공식 source

[한국 제조사 홈](https://www.hasselblad.com/ko-kr/)·X/V System·한국 제품 페이지와 그 메뉴가 연결하는 [한국 공식 camera collection](https://store-apac.hasselblad.com/ko-kr/collections/cameras)을 우선했다. NA/EU 공식 current camera collection, Global retained 제품/FAQ/공식 CDN datasheet·manual을 보조로 확인했다. 한국 collection 실제 product-card 2개, page2 빈 결과를 확인했다. 서드파티 목록·재고 추정은 사용하지 않았다.

## 2. Official camera offer/card 수

Current camera **카드 2개**. 개별 제품 selector의 SKU offer까지 세면 X2DII base1+렌즈kit7, 907X assembled offer1로 **9개**다. SKU 수를 카메라 수로 합치지 않는다. KR/NA/EU collection 모두 같은 base2를 표시한다.

## 3. 독립 base identity 수

Current 촬영 configuration **2개**: integrated X2DII1, modular assembled907X/CFV1. Manufacturer X/V retained 소개 목록은 8개 항목/5개 base/3개 edition 관계이며 current 판매 카드와 별도다.

## 4. 전체 inventory

| 공식 모델/offer | 상태 및 이번 처리 |
|---|---|
| X2D II 100C | KR official current collection/InStock; 신규 camera |
| 907X & CFV 100C | KR official current collection/InStock; 신규 공식 assembled camera |
| X2D 100C | Retained 소개·KR/NA OutOfStock, NA 공식 successor 안내; current collection 밖, 이번 미처리 대상에 넣지 않음 |
| X1D II 50C | 소개/지원 자료 잔존, current 판매 확인 불충분; 단종으로 단정하지 않음 |
| 907X & CFV II 50C | Predecessor 소개 잔존, 옛 store route는 current collection으로 redirect; current 판매 미확인 |
| X2D Earth Explorer | X2D100C base의 한정 finish/렌즈kit; current offer 미확인 |
| 907X Anniversary Edition Kit | 50C base의 기념 finish/kit; current offer 미확인 |
| 907X Special Edition | 50C base 기념 edition; current offer 미확인 |
| H6D /H6D Multi-shot /H6X /H6D Digital Back | Global H System dealer/support 소개 4개 참조; 한국 current collection 밖, 글로벌 현행 dealer 판매를 배제하지 않음 |

H System은 페이지가 남아 있다는 사실과 active sales를 분리했다. 공식 단종 문구를 찾지 못했으므로 모두 archived라고 확정하지 않는다. H6D 가족 안의 모든 과거 SKU를 대량 수집/집계하지 않았다.

## 5. 일반 digital released/current 수

**확인한 한국 current camera configurations 2개**. 과거에 출시됐다는 사실만으로 지금의 current denominator에 포함하지 않는다.

## 6. Modular component identity 수

Current assembled offering의 물리 module **2개: 907X /CFV100C**. Snapshot에서 각각 유지하지만 standalone digital camera 또는 canonical product로 만들지 않았다. Module 수를 current camera2에 더하지 않는다.

## 7. Linked kit/variant 수

Current X2DII 렌즈kit **7개**, 모두 동일 camera identity에 연결한다. 35–100E/55V/38V/90V/28P/20–35E/25V 구성이다. 별도 lens/camera 상품을 생성하거나 가격을 승격하지 않았다. Retained historical edition 관계3은 current kit7과 별도다.

## 8. Discontinued/archive 수

이번 자료에서 **명시적으로 공식 단종을 확정한 제품 0개**. Superseded/unavailable X2D1, retained current-status-unconfirmed X/V2 및 H dealer/support4참조는 별도 상태다. 품절·누락·redirect·404만으로 단종 수를 채우지 않는다. 영구 제외도 아니다.

## 9. Announced/upcoming 수

이번 확인한 camera offer 범위 **0개**.

## 10. 기존 canonical 수

Hasselblad **0개**, 전체 **bodies163/lenses36/total199**였다.

## 11. Production 시작 미처리 수

확인된 current **2개**. Module/렌즈kit/옛 페이지까지 더한 수가 아니다.

## 12. 실제 production 처리 제품

`hasselblad-x2d-ii-100c`, `hasselblad-907x-cfv-100c`. 제품별 독립 worker와 기존 pipeline으로 처리했다.

## 13. 신규/기존 보강

**신규2 /기존보강0**. 각각 verified identity evidence와 공식 source3을 갖는다.

## 14. Canonical 수량 변화

| 구분 | 이전 | 이후 |
|---|---:|---:|
| bodies | 163 | 165 |
| lenses | 36 | 36 |
| total | 199 | 201 |

기존 163 bodies·36 lenses 및 다른 브랜드 값/가격은 동일하다. Canonical 쓰기는 atomic pipeline apply만 사용했다.

## 15. 처리하지 않은 제품과 이유

Current 판매 근거가 확인되지 않은 위 구세대/edition/H references, standalone body/back 및 lens catalog는 ingestion하지 않았다. 한국 current2는 완료했지만, worldwide current coverage 선언 전에는 dealer/retained 상태 확인이 필요하다. 부정확한 current 또는 단종 flag를 만들지 않았다.

## 16. 907X/CFV 관계 분석

[공식 CFV manual](https://cdn.hasselblad.com/manuals/907X_%26_CFV_100C_User_Manual/User_Manual/CFV_100C_User_Manual_v1.0_EN.pdf)은 두 module을 하나의 medium-format digital camera로 정의하고 assembled 사양을 따로 제시한다. 촬영 최소 구성은 **907X +CFV100C +배터리 +호환 XCD lens**, 내부SSD가 있어 removable card는 선택이다. Canonical은 렌즈 제외 공식 camera/back 조합 하나다. 별도 판매 module offering은 검토한 current catalog에서 확인되지 않았으며, 세계 어디에서도 별도 판매 불가능하다고 단정하지 않는다.

## 17. Digital back sensor ownership

CFV100C에 sensor/SSD/CFexpress slot/battery/display가 있다. 907X는 native XCD lens interface를 제공한다. 센서 없는907X body 단독에100MP를 귀속하지 않았다. Sensor/storage/display claims의 `conditions`에 소유 module과 공식 assembly를 보존했다.

## 18. Modular system의 현재 schema 적합성

선택 **A: 공식 assembled configuration 하나를 canonical camera로 표현**. Manufacturer가 조합 전체 dimensions/무게를 명시하므로 기존 body spec 구조로 대표 사양을 안전하게 제공할 수 있다. Physical module은 snapshot/provenance에서 유지한다. V film body나 technical camera에 붙인 다른 configuration의 사양으로 확대하지 않는다.

## 19. 새 relation/schema 필요 여부

이번 공식 조합에는 새 product type/relation schema **불필요**. B처럼 독립 module 구매·추천·소유 관계를 런타임에서 관리하려면 별도 relation/compatibility 설계가 필요하다. 이번에 DB 전체나 engine을 개편하지 않았다.

## 20. Hasselblad X Mount 처리

공식 X System/XCD lens interface 근거로 registry label **`Hasselblad X`**, aliases `Hasselblad XCD` /`XCD mount`를 추가했다. Brand는 기존 객체 형태 `{name,aliases}`에 맞춰 Hasselblad를 append했다. Mount label은 manufacturer로 한정된 canonical 식별자이며 CFV back의 V rear interface와 구분한다.

## 21. Fujifilm X-Mount와 collision 검사

기존 **`Fujifilm X` /`X mount`**를 재사용하지 않았다. 전체 mount names/aliases의 기존 search normalization으로 충돌0을 검증했다. 과거 registry 항목/alias는 변경하지 않았다.

## 22. V System compatibility

CFV의 rear interface로 500/200 등 V film cameras와 연동하는 것과, 907X 앞에 XH/XV/XPan adapter로 렌즈를 연결하는 것은 다르다. Manual에서 V/technical camera 사용은 MF only, 907X+V/XPan lens는 electronic shutter only로 확인했다. Original SWC 예외, body별 sync cable/노출 모드 조건이 있으며 모든 V body의 완전한 전자/AF 호환을 주장하지 않는다. H/film archive를 ingestion하지 않았다.

## 23. X2D 계열 identity

X2DII는425 PDAF+LiDAR/AF-C/10stop IBIS/OLED/730g bare 등으로 기존 X2D100C의294 PDAF/AF-S/7stop/TFT/790g과 구별된다. 독립 generation을 alias로 합치지 않았다. 구세대 공식 footnote의102 effectiveMP를 II에 복사하지 않았다. 비교용 조사 사실과 이번 승격값을 구분한다.

## 24. Sensor/effectiveMP/sizeMm

둘 다 선택 source가 명시한 **100MP BSI CMOS /43.8×32.9mm**. 공식 physical mm를 사용했고 중형 명칭에서 크기를 계산하지 않았다. 100은 제조사 sensor 표기이며 해당 source가 effective/total을 별도로 구분하지 않아 그 정밀도를 조건에 남겼다. 11656×8742를 계산해102MP로 만들거나 다른 세대 값을 상속하지 않았다. FAQ의 다른 출력 높이는 아래 conflict로 분리했다.

## 25. IBIS

X2DII 객체 `{present:true,axes:5,stops:10,conditions:...}`로 기록했다. **Centre10/edge8, XCD3.5/120Macro, CIPA** 조건을 datasheet/FAQ 모두 확인했다. 907X body/back IBIS는 직접 근거 부족으로 UNKNOWN이며 X2D7/10stop을 복사하지 않았다.

## 26. Storage

두 configuration의 내부1TB와 **physical CFexpress Type B slot1**은 별도다. Canonical slot은1개, 내부SSD는 claim metadata에 보존한다. 907X의 저장 소유자는CFV다. USB 연결을 SSD recording이나 추가 physical slot으로 만들지 않았다.

## 27. Shutter/lens dependency

Electronic true, 공식1/6000sec raw와68min(4080sec)을 기록했다. 기존6자리 정규화로 fastest canonical은0.000167sec이며 exact fraction이 남는다. XCD leaf shutter 최대1/4000/HC·HCD1/800 또는1/2000은 렌즈/adapter 조건이다. 독립 body mechanical mechanism/최고속으로 승격하지 않고 해당 fields는null+조건이다. Flash sync는 mechanical lens shutter에서만, 실제 최고속은 렌즈에 따라 다르다. Generic capture3fps AF-C(II)/3.3fps14bit(CFV)는 universal shutter별fps로 할당하지 않았다.

## 28. Weight semantics

X2DII **840g with battery /730g body-only**, valid `battery`/`body-only` 기준. 907X 조합은 manual의 **620g battery/card 제외**, `bodyOnlyWeight`로 승격했다. Back460g/body160g 또는 가정한 배터리를 더한 값으로 대체하지 않았다. Assembled operating weight/basis는UNKNOWN, 렌즈·accessory 제외. Dimension은 조합102×92×84, component 치수와 분리한다.

## 29. Video/no-video

검토한 source는 직접 movie support 또는 no-video를 확정하지 않는다. 따라서 두 제품의 video.max/depth/crop은UNKNOWN이다. Worker의 unsupported video 결론도 채택하지 않았다. Still RAW14/16bit·HEIF10bit를 movie spec으로 옮기거나0K/0fps를 만들지 않았다. 명시적 no-video 근거 확보와 typed absence/engine 소비는 후속이다.

## 30. Autofocus

II의 AF-C는 지정 XCD lens/최신 lens firmware/전자셔터 off 조건이며 피사체Human/Cat·Dog/Vehicle,425 zones/LiDAR를 보존했다. 907X 조합은294 zones/PDAF+CDAF/AF-S/Face. V/technical MF 제한은 그 사실을 확인한 manual claim에만 연결하고 datasheet description에 다른 source 조건을 섞지 않았다.

## 31. Edition/kit mapping

한국 II lenskit7은 baseII에 연결, 별도canonical0. EarthExplorer/Anniversary/Special은 기존 base와의 finish/kit 관계를 기록하되 current offering을 확인하지 못해 새 camera로 승격하지 않았다. CFV50과100의 sensor/back 차이는 독립 base이며 finish로 합치지 않는다.

## 32. 공식 source 수

**제품별3 /총6 raw**. II: [한국 product](https://www.hasselblad.com/ko-kr/x-system/x2d-ii-100c/), [official datasheet](https://cdn.hasselblad.com/f/77891/x/a5e78b1d54/x2d-ii-100c-datasheet-multi-language.pdf), [FAQ](https://www.hasselblad.com/x-system/x2d-ii-100c-faq/). 907X: [한국 product](https://www.hasselblad.com/ko-kr/v-system/907x-cfv-100c/), [linked datasheet](https://cdn.hasselblad.com/f/77891/x/c5cd0973cd/907x_cfv_100c_datasheet_en_20240124.pdf), [manual](https://cdn.hasselblad.com/manuals/907X_%26_CFV_100C_User_Manual/User_Manual/CFV_100C_User_Manual_v1.0_EN.pdf). 모든 raw source는 canonical에 연결됐다. 부가 조사45HTTP 중43개200, 검증하지 않은X1Dstore route404/추가개정PDF403은 접근·상태 한계로 기록했다. Production source6는 모두200이었다.

## 33. Source/value conflicts

**승격 claim conflict0**. 부가 FAQ의 non-crop output11656×8472는 datasheet/manual11656×8742와 실제 높이 불일치다. 이 출력 matrix는 현재 contract 밖이므로 승격하거나MP계산에 사용하지 않았고 별도source discrepancy로 남겼다. 약3fps와up to3.3fps의 일반 연사 표기는 정밀도/조건 차이로 기록했다. 회귀 테스트의 같은-path50/100 충돌은 `CONFLICTING_CLAIM_VALUES`로 차단된다.

## 34. 주요 UNKNOWN

Incoming61claims 중 known40/null21, unique59paths. II의 refresh/AI/video/weather/기계식·셔터별 연사, 907X의 operating weight/basis/IBIS/built-in EVF/video/weather/셔터별 연사 등이UNKNOWN이다. Lens-dependent mechanical/일반fps는 근거가 없어서가 아니라 현재 대표field의 scope 한계로null+조건이다. ReleaseDate와card standards 등 skeleton의 추가null도 있으며 incomingnull21을 전체JSONnull 수로 혼동하지 않는다.

## 35. 제품별 worker token

| Task | Input | Output | Total | API/retry |
|---|---:|---:|---:|---|
| `hasselblad-production-001-x2d2` | 10,218 | 2,518 | 12,736 | 2 /1 |
| `hasselblad-production-001-907x100` | 5,925 | 411 | 6,336 | 1 /0 |

II first6966/2048/9014는 truncation failure, retry3252/470/3722는success이며 실패 사용량도 포함했다.

## 36. 총 worker token

**Input16,143 /output2,929 /total19,072**. Cache hit0. 반환되지 않은 비용은 추정하지 않는다.

## 37. Retry/failure

독립task2/actualAPI3/retry1/failure1(INCOMPLETE_RESPONSE), 최종 두 제품 성공. II는 같은taskID로250word output을 요구한 한 번의 수정 재시도만 했다. Dry-run은 API attempt가 아니다. Network failure0.

## 38. Worker 유용성

조건부IBIS/AF-C, sensor와모듈 소유, bare/operating weight, 영상/IBIS 추정 금지 경고가 유용했다. II의 no-video 단정과907X의 근거 없는10th-gen 표현은 버렸다. Worker 파일/patch 적용0, fixture2삭제. 해당 공개 자료와 수기 최소 계약만 제공했고 프로젝트 코드/canonical/secret은 전송하지 않았다.

## 39. GPT-6.1 Sol 직접 판단

Inventory/지역·판매상태/identity/module relation/소유/mount/weight/UNKNOWN/source attribution/conflict/59필드summary·원문 검토/approval/apply를 직접 판단했다. Worker 분석을 그대로 raw로 바꾸지 않았다. Conditions는 실제 source 범위에서 검토했다.

## 40. 사람 개입량

추가 사용자 사양 판단0, main의 원문/구조/승인 검토 필요. 시작 clean 확인 외 사용자 입력을 요청하지 않았다. 실제 사람의 검토 소요 시간은 측정하지 않았다.

## 41. Normalization 문제

작성 중 brand registry string 초안은 기존객체 계약에 맞지 않아 normalize가 거절했고, 기존 `{name,aliases}`로 수정했다. 검토에서 FAQ에 없는 size 관찰은 직접 확인된IBIS footnote로 대체했고, nativeAF와 V-MF source 조건도 분리했다. 모두unsealed draft만 helper로 재작성한 뒤 seal했다. Schema/validator/oldartifact 변경은 없다.

## 42. Pipeline/schema 신규 문제

Approval은 knownMP의 누락된 원 unit을 거절했지만 normalize/validate는 이를 통과시켰다. 두 primary raw에 실제MPunit을 명시해 production을 완료했으며 generic unit validation drift는 별도 좁은 보강 후보다. 처음 거절된 approval/apply는 canonical을 바꾸지 않았다. New-product summary의 unknown0은 category집계로 실제null21을 표시하지 않는 한계가 있다. Machine diff/digest를 변경하지 않고 수동검토에서 따로 수량화했다. Module schema 재설계/validator 우회0.

## 43. AccessedAt

최종raw6은 helper가 실제UTC ISO timestamp를 자동 생성했다: **2026-10-14T02:18:50.886Z–02:24:26.891Z**. Raw 생성 clock window/ISO/digest를 검증하고 실제 HTTP 조회 시각도 별도로 보존했다. 날짜만자정으로 만들지 않았다. 과거 production sources 불변.

## 44. 전체 tests

`pnpm test` **365/365 통과**, fail/cancel/skip0.

## 45. Objective/production/catalog tests

**338/338 통과**. 기존 분류대로 scenario/first-purchase engine 두 test파일 외 Objective/production/catalog/coverage 전체를 실행했다. 기존8브랜드 archive/validator/replay 호환 포함.

## 46. Hasselblad tests

신규 **15/15 통과**. Current/oldstatus·kit,module중복,sensor소유/무게,마운트충돌,IBIS/LCD/AF,렌즈셔터/UNKNOWN,worker통계,source/digest/승인/재적용을 검사한다. 기존Sigma test의 전체vocab동일 가정만 append-only registry 검증으로 바꿨다. 기존 항목/aliases/다른규칙 및 archived context 검증은 유지했다.

## 47. Canonical validation

True,165/36/201. Known objective leaves II31/907X22=**53개** 전부 verified evidence,fieldEvidence21/17=38paths. Structured identity2,source6. AfterSHA `3f971b678f83576b916ad00e9c5ff48c203ceee48d95be806754ea7c8f1c9842`.

## 48. Build/node/git diff

`pnpm build` 통과, 기존 >500kB 경고 유지(JS985.06kB). 신규/변경 test2와Objective6scripts node--check, git diff--check 및 새파일 whitespace 검사도 통과했다. Engine/UI/legacy policy/기존 production artifacts는 변경하지 않았다.

## 49. Idempotency

실제 CLI 재적용 **already-canonicalized /canonicalMatches:true**, before→after 및after→after replay도 통과. Final reviewed diff `83ae085229d67d653adea8f73465e48614810be9502036f54a4b3e1ef418b657`, approval `approval-87d57c6609b65f9eb60c06f3aa3956d1c1e067e5d2d175ea67a39277b3f7f365`. Sealed batch **16files+registrycontext2=18files**를 보존한다.

## 50. Git status

이번 변경은 미commit 상태이며 push하지 않았다. Tracked변경: canonical(atomic),vocab,map,Sigma회귀test,진행문서. New: Hasselblad inventory/report/test 및manifest/raw6/staging2/diff/approval current+history/transaction before-after-evidence-journal. 임시worker fixture삭제, source download/조사 스크립트는/tmp에 있어Git에포함하지않았다.

## 51. Released/current production 미처리 수

**검증한 한국 official current catalog 기준0**. Worldwidedealer/H/retained status 미확인 제품의 불확실성을0미처리라는수치로감추지않는다.

## 52. 추가 batch 필요 여부

같은한국current2대상추가batch불필요. Audit에서다른지역/dealer current제품이확인되면새inventory판단후추가batch검토. 모듈/kit로숫자를채우지않는다.

## 53. Coverage audit 준비 여부

**준비완료**. 다음은Hasselbladcoverageaudit이며primaryKRcollection2와retained/global/dealer상태를별도로확인한다. 이번은안전한production완료이며전세계coverage완료선언이아니다. Clean시작조건이면완료변경검토·commit후진행한다. 기존worker/raw/approval/apply를반복할필요없다.
