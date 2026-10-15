# Hasselblad Objective DB production coverage audit

감사일: 2026-10-14. Clean baseline: `84ce2a59af4931d22e324e8bd6a57d5d8b5dc113`.

**한국 Hasselblad 공식 온라인 스토어 현행 digital camera offering 2개는 모두 canonical과 production provenance에 연결되어 있다. 미처리·중복/모호·critical은 0이므로 이 지역·source 범위의 1차 coverage는 완료다.** 907X & CFV 100C는 공식 body+digital-back 조합 한 제품이며 센서·저장·배터리·LCD 소유자는 CFV다. 620g은 배터리·카드·렌즈를 제외한 조합 무게이고 운용무게는 UNKNOWN이다. **글로벌 H System/dealer 및 모든 지역의 현행 판매 범위는 미확정이므로 전 세계 전체 coverage 완료를 선언하지 않는다.**

이번 감사는 제품 연결과 근거의 정합성을 검증한 것이다. 모든 선택 사양·렌즈·가격·추천 지원이 완성됐다는 뜻은 아니다. Canonical 데이터 오류 0, should-fix 3건(기존 pipeline 2/미승격 공식 원문 충돌 1), acceptable canonical UNKNOWN 21paths를 구분했다.

[새 감사 snapshot/checkpoint](../src/data/ingestion/hasselblad-coverage-audit-2026-10-14.json) · [회귀 테스트](../tests/hasselbladCoverageAudit.test.js) · [원 production 보고서](OBJECTIVE_DB_HASSELBLAD_PRODUCTION_001.md).

시작 전에 inventory/checkpoint, batch001, 보고서/progress, canonical/map/scope/vocab/contracts, 최신 pipeline/validators와 Hasselblad·기존 브랜드 감사 테스트를 대조했다. 새 ingestion/worker 호출/approval 생성 없이 공식 자료를 새로 조회하고 기존 sealed chain을 검증했다.

## 1. Coverage 기준 지역/source

Primary는 [한국 공식 camera collection](https://store-apac.hasselblad.com/ko-kr/collections/cameras)이다. 실제 card-title, 두 제품의 구매 페이지/공개 SKU selector, 다음 빈 pagination을 확인했다. [NA](https://store-na.hasselblad.com/collections/cameras)·[EU](https://store-eu.hasselblad.com/collections/cameras) collection, 공식 한국/Global X/V 소개, 구세대 페이지, 매뉴얼·datasheet·FAQ·[H System](https://www.hasselblad.com/h-system/)·[실제 dealer locator](https://www.hasselblad.com/dealers/)·[repair 안내](https://www.hasselblad.com/support/availability-of-repair-services/)를 보조 자료로 사용했다.

공식 HTTP 요청 38개: 200 36개/404 2개. 구 X1D II의 추정 store route와 `/where-to-buy/`의 404는 단종 근거로 사용하지 않았다. 공식 링크의 실제 `/dealers/` 재조회는 200이다. Dealer 지도/연락 경로가 있어도 모델별 실판매 증거는 아니다. 모든 조회의 UTC timestamp/status/resolvedURL/content SHA256를 새 snapshot에 기록했다. 국가별 재고·모든 유통 채널은 조사 범위 밖이다.

## 2. 한국 공식 current offering 수

**2개: X2D II 100C /907X & CFV 100C.** Collection의 실제 제품 카드는 둘뿐이며 page2에는 없다. 구매 페이지 공개 JSON-LD의 base/kit 9offers 모두 InStock이었다. NAV/비교 링크/렌즈를 카메라 card로 세지 않았다. 기존 inventory 대비 신규·제거·현행 status·kit 구성 변화 0.

## 3. Base camera identity 수

Current **2개**: integrated camera 1, assembled modular camera configuration 1. 조합을 포함한 whole-camera identity 분모이며, 두 제품을 모두 센서 일체형 body라고 주장하지 않는다. Retained introduction의 구세대 base 3개와 edition 3개는 별도다.

## 4. Modular component identity 수

**2개: 907X body /CFV 100C digital back.** Physical component는 각각 존재하지만 독립된 완성형 digital camera 2개를 추가로 만들지 않았다. 실제 촬영 configuration은 current 2개다. 조합에 충전된 배터리와 호환 렌즈가 필요하며 1TB SSD로 card는 필수가 아니다. 현재 스토어에서 component 독립 현행 offer는 확인되지 않았다; 전 세계 독립 판매가 불가능하다는 주장은 하지 않는다.

## 5. Canonicalized current 수

**2개**: `hasselblad-x2d-ii-100c`, `hasselblad-907x-cfv-100c`. 각각 정확히 한 번 존재한다. Canonical은 **165 bodies /36 lenses /201 total** 그대로다. Byte SHA256 `3f971b678f83576b916ad00e9c5ff48c203ceee48d95be806754ea7c8f1c9842` 불변.

## 6. Production provenance 완료 수

**2개.** 각 raw3→staging1→diff→explicit approval→transaction/after→canonical identityEvidence/fieldEvidence의 실제 연결을 확인했다. 단순히 공식 링크가 있다는 이유로 완료 처리하지 않았다. 모든 optional field의 known 값 완성을 의미하지는 않는다.

## 7. Unprocessed current 수

**0개**. 새 한국 store current 제품이 발견되지 않았다. 따라서 새 production batch 불필요.

## 8. Duplicate/ambiguous 수

**0개**. 907X/CFV/module/kit/lens의 추가 canonical body 생성 없음. 7lens-kit은 X2D II base offer에 연결되며 독립 camera identity가 아니다.

## 9. X2D II identity audit

Hasselblad /X2D II 100C /X System /Hasselblad X native lens mount /interchangeable. 구 X2D 100C의 identity/alias/specs를 병합하지 않았다. 공식 보고 100MP BSI CMOS/43.8×32.9mm, 5축 IBIS, 1TB+CFexpress B, 전자셔터, 조건부 AF-C, EVF/LCD/CIPA 배터리, 840g 배터리 포함·730g body-only를 직접 근거와 대조했다. [한국 제품](https://www.hasselblad.com/ko-kr/x-system/x2d-ii-100c/), [공식 datasheet](https://cdn.hasselblad.com/f/77891/x/a5e78b1d54/x2d-ii-100c-datasheet-multi-language.pdf), [FAQ](https://www.hasselblad.com/x-system/x2d-ii-100c-faq/) 사용.

## 10. 907X & CFV 100C identity audit

Canonical은 공식 assembled **907X body+CFV 100C back**이다. 907X 단독 또는 CFV 단독 센서 일체형 카메라를 뜻하지 않는다. [한국 제품](https://www.hasselblad.com/ko-kr/v-system/907x-cfv-100c/), [datasheet](https://cdn.hasselblad.com/f/77891/x/c5cd0973cd/907x_cfv_100c_datasheet_en_20240124.pdf), [CFV manual](https://cdn.hasselblad.com/manuals/907X_%26_CFV_100C_User_Manual/User_Manual/CFV_100C_User_Manual_v1.0_EN.pdf)의 구성·소유 조건과 일치한다. Kind interchangeable/mount Hasselblad X; fixed-lens 제품이 아니다.

## 11. Body/back/kit relation

X2D II integrated 1, 907X+CFV assembled 1, component 2. 7current lens-kit은 X2D II의 구성 옵션이다. 907X의 lens interface와 CFV의 V back interface를 구분했다. 새로운 component registry/relation schema 또는 lens product를 만들지 않았다. 향후 독립 component 추천은 기존 whole-camera expression만으로 충분하지 않으므로 별도 backlog다.

## 12. Sensor ownership

CFV가 **100MP BSI CMOS/43.8×32.9mm** 센서를 소유한다. 907X는 native XCD front interface를 제공한다. Manual PDFp12의 body+back 구성 설명, p15–18의 module/assembly 사양과 raw 조건 `sensorOwner: CFV 100C`, `notStandalone907XSpecs`를 확인했다. 두 canonical의 MP는 제조사 보고치이며 selected source는 effective/total을 별도로 명명하지 않는다. Output pixel 곱이나 구 X2D의 102MP를 재사용하지 않았다. Imaging processor의 구체적 모델명은 UNKNOWN; AF 알고리즘 설명을 chip 모델로 만들지 않았다.

## 13. Storage ownership

CFV에 1TB SSD와 **물리 CFexpress Type B slot 1개**가 있다(Manual PDFp21). Internal SSD는 두 번째 slot이 아니다. X2D II도 1TB+동일 media 한 slot. Internal capacity는 기존 claim conditions에 있고 canonical은 cardSlots만 직접 표현한다. USB transfer를 외장 recording 기능으로 승격하지 않았다. Sigma BF의 zero-slot 표현 한계와 같은 storage backlog지만 이 제품들은 실제 slot 1개를 표현할 수 있다.

## 14. Battery/display ownership

CFV가 배터리 compartment, rear3.2inch TFT/2.36Mdots/touch/tilt display를 소유한다. Manual PDFp19–21과 claim `batteryOwner`/`displayOwner` 조건 일치. Assembled CIPA420장, 렌즈 이름은 미지정. X2D II는 CIPA327장/XCD4/28P, 466장은 preview Hold/HDR off 조건이 붙으므로 baseline과 구분한다. 907X optional optical finder를 내장 EVF로 승격하지 않았고 EVF는 UNKNOWN이다.

## 15. 620g weight semantics

Manual PDFp18은 **907X & CFV 100C 620g, battery and memory card excluded**를 명시한다. PDFp15–17의 CFV460g(배터리/card 제외)+907X160g, assembly의 구성 및 크기를 대조해 attached lens도 포함되지 않는 body+back 조합임을 확인했다. `lens excluded`가 620g 표 자체의 추가 문구라는 주장은 하지 않는다. 620은 두 module 값을 새로 합산해 추정한 값이 아니라 공식 assembly table의 값이다.

Canonical `bodyOnlyWeight:620` + claim `weightBasis:body-only`/`officialAssembly`/module masses/제외 조건은 조합을 정확히 설명한다. `weight:null`, `weightBasis:null`은 운용무게 UNKNOWN이다. Body160g/back460g로 오인·battery-and-card 승격·렌즈 중복 합산 0. Catalog compatibility view도 weight null을 유지하고 화면 detail은 `무게 미확인`이다. Current contract의 숫자 의미 오류는 없지만 component별 configuration weight의 독립 기계 표현은 backlog다.

## 16. Hasselblad X Mount

Canonical/vocab **`Hasselblad X`**, aliases `Hasselblad XCD`/`XCD mount`; 공식 XCD native front lens interface 근거와 일치한다. 907X가 native lens mount를 소유하며 CFV 자체 back interface는 V다. Identity-map은 두 Hasselblad productId를 각각 한 번 매핑한다.

## 17. Fujifilm mount collision

**0건.** `Hasselblad X` ≠ `Fujifilm X`. Unqualified `X mount`를 Hasselblad alias로 넣지 않았다. Normalized vocabulary alias 전역 중복 검사 통과. 호환 lens filtering은 정확한 mount string 비교라 Fujifilm X lens가 Hasselblad에 native 호환으로 연결되지 않는다. Before/after의 기존 Fujifilm body와 다른 전체 제품은 그대로다.

## 18. V System compatibility

Manual PDFp12/24–25/29 확인. CFV는 V rear mechanical interface, 500/200 등 model별 조건이 있다. SWC/M·903SWC·905SWC는 지원하며 오래된 SWC는 제외된다. Mechanical sync/remote는 body·winder·케이블·modified/unmodified200·lens mode별 표를 따라야 한다. Electronic mode는 camera/lens open 설정 조건. V/technical camera에서 MF만 지원한다.

907X에 V/XPan **lens adapter**를 붙이는 경우와 V **film body에 CFV back**을 붙이는 경우는 다른 관계다. 전자는 electronic shutter only, H lens도 일부 기능만 가능하다. 장착 가능을 full-function AF/flash/remote compatibility로 일반화하지 않았으며 film body ingestion 0.

## 19. IBIS audit

X2D II는 strict 객체 `present:true/axes:5/stops:10/conditions`; 공식 CIPA 기준 XCD3.5/120Macro **centre10/edges8 stops**를 유지한다. 907X/CFV IBIS는 UNKNOWN으로 두었으며 X2D의 7/10stop을 복사하지 않았다. Lens/electronic stabilization을 sensor-shift로 바꾸지 않았다.

## 20. Shutter/lens dependency

전자셔터 최단 raw1/6000s·최장68min은 해당 camera/system 자료로 확인. Canonical0.000167은 기존 6decimal precision이고 exact fraction은 raw에 유지된다. Mechanical support/leaf shutter는 **호환 lens 소유**다. XCD up1/4000, HC/HCD up1/800 또는1/2000은 lens/adapter 조건이다. Mechanical flash sync도 해당 lens mode 조건. `shutter.mechanical`/`fastestMechanicalSec` body 독립 대표값은 null이며 조건은 archive에 있다. Generic3fps/3.3fps14bit를 shutter-mode fps로 임의 배정하지 않았다.

## 21. Video/AF/sensor audit

Video 지원/명시적 no-video는 selected 공식 근거로 직접 확정되지 않아 max/bitDepth/crop/log UNKNOWN이다. Still RAW14/16/HEIF10bit를 movie bit depth로 만들지 않았다. X2D II425PDAF+CDAF+LiDAR/AF-S·AF-C·MF; AF-C는 지정 XCD lens/latest firmware/**electronic shutter OFF** 조건. 907X+CFV/XCD는294PDAF+CDAF/AF-S/face; V/technical MF만 가능. 두 sensor의 physicalmm는 직접 공식 값이며 중형 명칭에서 추정하지 않았다. Explicit effective/total separation은 현 계약 후속 표현 과제다.

## 22. 기존 canonical 제품 상태

Production before의 Hasselblad body/lens **0개**. After는 신규2개뿐, current with production provenance2/legacy canonical0/archived canonical0/identity unresolved0. 다른163bodies/36lenses는 동일하다. Retained X2D100C(NA successor 문구/KR·NA sold out), X1DII50C, 907X50C와 역사적 edition3개는 current KR 분모 밖이다. 페이지 존속/재고 없음/redirect만으로 글로벌 단종을 선언하지 않았으며 삭제도 하지 않았다.

## 23. H System 글로벌/dealer 조사

H6D/H6D Multi-shot/H6X/H6D Digital Back의 공식 소개는 남아 있다. HC/HCD와 adapter 설명도 H body의 현행 판매 증거가 아니다. 실제 [dealer locator](https://www.hasselblad.com/dealers/)는 연락 경로를 제공하지만 이 모델들의 현행 offer·재고·출시 완료 판매 상태를 확정하지 않는다. [repair 안내](https://www.hasselblad.com/support/availability-of-repair-services/)의 spare parts/store/service 안내도 해당 body의 current sales 또는 단종 선언이 아니다.

결론: **unresolved global/dealer status /future regional/global reconciliation**. 공식 지원 문서의 특정 film magazine 단종 문구를 H body/back 전체 단종으로 확대하지 않았다. H 제품은 영구 제외하지도 현행 canonical에 넣지도 않았다.

## 24. 한국/글로벌 scope 구분

A: 한국 official store current digital camera offering coverage **1차 완료**. B: 전 세계 Hasselblad 전체 현행 digital camera system coverage **완료 미선언**. NA/EU collection도 동일2개였지만 이것만으로 모든 지역/dealer를 대표하지 않는다. Explicit discontinued 확인0/announced upcoming 확인0은 이번 조사에서 확정한 수이며 전 세계 단종 제품 또는 향후 발표가 없다는 뜻이 아니다.

## 25. Known objective leaf 통계

| 제품 | Known leaf | Verified | FieldEvidence paths | Claims known/null | 공식 source |
| --- | ---: | ---: | ---: | ---: | ---: |
| X2D II | 31 | 31 | 21 | 22/9 | 3 |
| 907X & CFV100C | 22 | 22 | 17 | 18/12 | 3 |
| 합계 | 53 | 53 | 38 | 40/21 | 6 |

Reference-only0/legacy-only0/unclassified0/source-less0. Arrays는 기존 감사 방식대로 atomic leaf이며 객체는 자식 leaf를 순회했다. 모든 known path를 해당 scope의 verified claim/value/sourceId 및 canonical source.fields에 연결해 다시 검사했다. Scalar 자체의 verified와 원문 조건을 생략해도 된다는 판단은 다르다.

## 26. IdentityEvidence 결과

Structured verified **2**, indirect0. 두 한국 공식 제품 sourceId가 staged identity evidence와 canonical identityEvidence에 연결된다. Manufacturer ownership/모델명/ID/map 중복·세대 병합 없음. Source3개 중 identity 중심 페이지도 실제 연결된 source 수에 포함한다.

## 27. Critical 수

**0건.** 잘못된 센서 소유·620g 운용무게 승격·mount 충돌·current 미처리·중복 제품·artifact 손실 없음. 실제 canonical data error0.

## 28. Should-fix 수

**3건, 모두 이번 한국 product coverage 비차단**:

1. 기존 generic original-unit validation drift: preparation의 MP unit 누락을 normalize/validate는 놓치고 strict approval에서 차단했다. Sealed raw는 승인 전에 교정돼 현재 값/units는 정상. 별도 작은 validator 작업 후보.
2. New-product human summary의 UNKNOWN0은 변화 category count이며 실제 null claim21을 뜻하지 않는다. 별도 summary 명확화 후보; machine diff/digest 변경 불필요.
3. Fresh [907FAQ](https://www.hasselblad.com/v-system/907x-cfv-100c-faq/)의 noncrop output11656×8472는 datasheet/manual11656×8742와 실제 충돌. Output matrix를 승격하지 않았으며 sensorMP도 계산하지 않았다. 향후 해당 field ingestion 전에 공식 근거 충돌을 해결해야 한다.

이는 틀린 canonical 값을 schema backlog로 숨긴 것이 아니다. Promoted same-value claim conflict0; 이번 audit에서 validator/원문/옛 artifact를 수정하지 않았다.

## 29. Acceptable UNKNOWN 수

**Canonical optional null21paths**: X2D II9/907X 조합12. AF chip 모델2, video4fields×2=8, releaseDate2, card standards2, weatherSealing2, X2D EVF refresh1, 907operating weight/basis2·IBIS1·EVF1. Snapshot에 개별 path/이유를 남겼다.

Incoming null claims도21이지만 우연히 같은 총수이며 동일 집합은 아니다. Incoming21 중 렌즈 소유 shutter/mode-unassigned burst8은 표현 scope gap, 나머지13이 raw-backed acceptable UNKNOWN. 여기에 선택 자료에서 확정되지 않은 canonical optional8(video.log2/release2/card standards2/EVFrefresh1/907AF chip1)을 더해21이다. 두 fixedLens null은 interchangeable N/A, 두 burst container null은 아래 mode child scope gap이므로 추가로 세지 않았다. 전체 JSON null 총수와 혼동하지 않는다. 이 감사는 optional 값 채우기 작업이 아니다.

## 30. Batch001 artifact audit

**16batch files+2registry context=18**. Manifest/raw6/staging2/diff/currentapproval+approvalhistory/transaction before·after·evidence·journal 존재 및 byte digest 검사; missing0/mismatch0. Strict2/2, approval ID·diffDigest·evidenceDigest·stagingDigest·canonical before/after digest·canonicalized journal 일치. Archived vocab/map context로 before→after replay 및 after→after no-op replay도 일치.

실제 `node scripts/objective/ingest.mjs apply --batch production-hasselblad-bodies-001` 결과 **already-canonicalized /canonicalMatches:true**. Canonical bytes와 모든 sealed artifact 불변. 향후 다른 brand/map 추가로 live registry가 변할 수 있으므로 회귀 테스트는 old context archive를 사용하며 live registry 전체 hash를 영구 고정하지 않는다. 감사 시점에는 18개 모두 baseline hash를 직접 확인했다.

## 31. Source/accessedAt audit

Raw6 모두 manufacturer/www·cdn.hasselblad.com, sourceId/contentDigest/claim-link/canonical source-link 정상. Raw-helper 실제 UTC 범위 **2026-10-14T02:18:50.884Z–02:24:26.891Z**, 각 raw는 milliseconds ISO로 round-trip/clock bounds 통과. 날짜를 임의 midnight로 재생성하지 않았다. 새 감사 fetch 시간은 snapshot의 별도 records에 보존하며 기존 raw.accessedAt은 덮어쓰지 않았다.

143page CFV manual, X2DII datasheet,907datasheet의 재조회 bytes는 production 당시와 동일했다. Historical worker19072tokens/3actual attempts/1retry는 원 production 이력이며 이번 신규 호출/token0. Retry 여부와 현재 provenance completeness는 별도 기준이다.

## 32. 전체 tests

`pnpm test` **382/382 통과**, fail/skipped/cancelled0. 기존365+새17.

## 33. Objective tests

Objective/production/catalog/coverage **355/355 통과**, 37test files. `cameraScenarioEngine.test.js`/`firstPurchaseEngine.test.js`만 제외하며 두 engine은 전체 suite에서 실행한다.

## 34. Hasselblad tests

**32/32 통과**: 기존 production15 +신규 coverage audit17. Current2/provenance/중복0/modules/sensor owner/storage owner/battery/display/620bare+operatingUNKNOWN/mount collision/V조건/strictIBIS/shutter/video/sourceclock/digest/replay/세계범위 미완료 판정을 검증한다. 기존 테스트 약화 없음.

## 35. Canonical validation

Current canonical을 기존 `validateCanonical`과 live vocab으로 검증하고 archived incoming도 최신 strict gate로 재검증했다. Canonical/map/scope/vocab/legacy policy/추천/UI/옛 artifact 수정 없음.

## 36. Build/node/git diff

Build/node/diff **모두 통과**. `pnpm build`, 신규 test+기존 Objective scripts6의 `node --check`, `git diff --check` 및 신규 파일 whitespace도 확인한다. 기존 Vite chunk-size warning과 실패를 구분한다.

## 37. Git status

이번 감사 산출물만4개: progress 문서 수정, 본 보고서/새 snapshot/새 test 추가. Commit/push 하지 않았다. 다음 clean-start 작업은 이 변경을 검토·commit한 뒤 시작하면 된다. 기존 데이터/engine/UI/sealed artifact는 unchanged.

## 38. 한국 store 완료 판정

**한국 Hasselblad 공식 온라인 스토어 기준 일반 현행 digital camera Objective DB coverage 1차 완료**: current2/canonicalized2/provenance2/unprocessed0/duplicate0/critical0. 907X의 modular 조건을 위와 같이 포함한다. 렌즈·가격·모든 optional spec·추천 engine 완료 선언은 아니다.

## 39. 글로벌 전체 coverage 완료 가능 여부

**아니오.** Global H System/dealer status와 전체 지역 reconciliation 미확정. KR/NA/EU collection 일치만으로 worldwide 완료를 주장하지 않는다.

## 40. 추가 production batch 필요 여부

한국 store current 대상으로 **불필요**. 추가 현행 제품이 공식 확인되거나 H/global reconciliation에서 새 in-scope released product가 확정되면 새 instruction/production batch로 진행한다. Audit에서 억지로 archived/H/film 제품을 추가하지 않았다.

## 41. Modular schema 후속 과제

Component relation/assembled semantics/configuration weight/digital-back·V compatibility, explicit internal storage/no-card-slot, lens leaf-shutter 조건, no-video absence, reported/effective/totalMP, exact shutter fraction 표현은 독립 설계 backlog. XCD lens pool 및 추천 지원도 별도. Price/Experience DB는 현재 scope 밖이다. 기존 whole-camera scalar를 component별 제품으로 임의 분할하지 않는다.

## 42. 다음 브랜드 및 다음 단계

[현재 v0.4 plan](OBJECTIVE_DB_V04_PLAN.md)의 B7 Hasselblad 다음은 **L1 Sony E 현행 순정 렌즈**(원 계획8–15개/batch)다. 이후 Canon RF/Nikon Z/Fujifilm X/L-MFT/기타 native lenses. 새로운 body brand는 현재 plan에서 확정되지 않았다. 원 plan의 렌즈 규모를 지금 실행하지 않았으며 첫 lens pilot 범위/계약은 다음 지시에서 결정한다. Hasselblad 글로벌 reconciliation은 세계 coverage 선언을 위한 별도 과제다.

## 43. 다음 브랜드 진행 blocker 여부

**이번 한국 coverage 기준 blocker0**. Audit4파일 commit이 필요한 clean-start 절차는 남는다. Lens phase에서는 mount variant/표현 계약 검토가 별도로 필요하며 current audit 성공만으로 모든 브랜드/렌즈 생산 ingestion이 자동 승인된 것은 아니다. 전 세계 Hasselblad 완료 선언에는 H/dealer 조사 미해결 blocker가 남는다.
