# Sony E-Mount 순정 렌즈 inventory 및 production readiness — 2026-10-15

**공식 inventory와 schema/pipeline 검증을 완료했지만, 실제 production pilot은 진행하지 않았다.** 한국 공식 gallery73cards는 일반 optical lens71개(출시/현행67·출시예정4)와 teleconverter2개다. 기존 Sony current lens6개를 매칭했고 신규등록61/기존 provenance보강6이 필요하다.

사용자 지시 14번의 안전 분기를 적용했다. 신규 lens의 synthetic atomic path는 작동하지만, 기존36lens 모두 빠진 `model` 때문에 existing-ID update가 staging/approval 계약 사이에서 막힌다. 교환식 lens focal 단위 및 aperture/OSS 타입 검증도 validate와 approval 간 drift가 재현됐다. FE/APS-C image circle은 직접 canonical 계약이 없다. Guard 우회·수동 canonical 편집·5개 신규만 골라 기존 문제를 숨기는 방식은 사용하지 않았다.

Canonical **165 bodies /36 lenses /201 total 불변**. 신규 worker/API/token0, production manifest/raw/staging/diff/approval/transaction 생성0. 본 문서의 5개는 **미실행 pilot 후보**이고, 데이터 수집 결과는 inventory 분석 자료다. Production provenance가 아니다.

[날짜별 inventory/checkpoint](../src/data/ingestion/sony-e-lenses-current-2026-10-15.json) · [readiness 회귀 테스트](../tests/sonyLensReadiness.test.js).

## 1. Inventory 기준 지역/source

Primary: [Sony Korea lens gallery](https://www.sony.co.kr/lenses/gallery). 실제 rendered DOM의73개 card heading/model-code data attribute/공식 URL을 읽고, **73개 모든 모델의 product summary**를 확인했다. Header/support/최근 본 제품/연관 제품은 denominator에서 제외한다. 일반 HTTP403·web parser의 빈 JS 목록은 제품 부재로 판단하지 않고 공식 페이지를 browser에서 읽었다.

[Mount-adaptors category](https://www.sony.co.kr/lenses/mount-adaptors)는 같은 teleconverter2개를 표시했다. 이를 추가2개로 중복 집계하지 않았다. 세계 모든 지역/지원 archive/전문 장비 전체 SKU completeness는 선언하지 않는다. 조사 범위는 한국 공식 현행 gallery다.

## 2. 공식 lens card 수

**73cards**. 실제 전체 DOM73개와 UI의73제품 표기를 대조했다. 모두 Sony 공식 model code이며 외부제조사 lens0. Code는 retail SKU 지역 suffix와 구분했다.

## 3. Base lens identity 수

일반 optical lens **71**, adjacent teleconverter2. 전체 card model identity73. FE와 E APS-C, G/GM/ZA/PZ/macro/cinema를 포함한다. GMII가 있다는 이유로 GM을 제외하지 않는다.

## 4. 전체 released/current lens 목록

**67개.** Appendix A에 model code/official name/format/기존ID를 전부 열거했다. Current 분류는 한국 현행 gallery와 해당 product summary의 공개 offer/사양·지원 경로, upcoming/discontinued 명시 부재를 대조한 catalog 판정이다. 매장별 실시간 재고를 의미하지 않는다.

## 5. Discontinued/archive 수

Primary71개 안에서 **명시적 단종 확인0**. Current gallery 밖 제품이 전 세계 단종됐다는 뜻은 아니다. Support의 과거 모델 목록은 current denominator가 아니다. A-Mount archive 전수 수집은 이번에 하지 않았다. 한국 gallery의 A optical card0이며, SAL archive/서드파티를 빈 current 수에 억지로 추가하지 않았다.

## 6. Upcoming 수

**4개: SEL400F45GM /SEL600F63GM /SEL814G /SEL28702.** 각 제품 summary의 **곧 공개**를 직접 확인했다. 가격 미정/신규 card만으로 출시완료를 추정하지 않았다. SEL28702는 URL에 `a-mount-lenses`가 있지만 card가 E-mount full-frame을 명시하므로 mount는 Sony E, status는 upcoming으로 유지한다. URL path를 mount 근거로 쓰지 않는다. 지역 밖 출시 여부와 구분한다.

## 7. Linked variant 수

Gallery에서 확인한 linked finish **1개**: SEL55210 silver/black, 같은 base identity. 별도 optical lens를 만들지 않는다. 이것은 **gallery에 노출된 변형 수**이며 모든 지역·상세 SKU selector의 색상 전수 감사 완료를 뜻하지 않는다. 세대 II/다른 maximum aperture/GM·G·Macro·STF/PZ/OSS 차이는 finish로 병합하지 않는다.

## 8. Teleconverter/adapter 분류

SEL14TC/SEL20TC는 adjacent magnification accessory2개. Standalone prime/zoom focal/aperture를 부여하지 않고 denominator에서 제외했다. 별도 mount-adaptors category도 같은2개로 추가 identity0. LA-EA adapter가 세계적으로 존재하지 않는다는 선언은 아니다. A→E adapter와 native E lens의 physical mount를 혼동하지 않았다.

## 9. 기존 canonical Sony lens 수

**6개**, 기존 전체36개 조회:

| Sony code | 유지할 기존 ID | 출처 상태 |
| --- | --- | --- |
| SEL2470GM2 | sony-fe-24-70-gm2 | sources0/legacy facts |
| SEL70200GM2 | sony-fe-70-200-gm2 | sources0/legacy facts |
| SEL40F25G | sony-fe-40-g | sources0/legacy facts |
| SEL2860 | sony-fe-28-60 | sources0/legacy facts |
| SEL85F18 | sony-fe-85-f18 | manufacturer reference1/fieldEvidence 없음 |
| SELP1635G | sony-fe-pz-16-35-f4 | manufacturer reference1/fieldEvidence 없음 |

6개 모두 current. 다른 제조사30개도 ID/brand/spec shape를 조회했지만 수정하지 않았다. Lens identity-map entry0, 전체36개에 model 없음. 기존 reference와 production provenance를 구분한다.

## 10. 시작 production 미처리 수

**67개 = 신규등록61 +기존 보강6**. Production verified0. 이번 actual production0이므로 종료 잔여도67개다. 가상 pilot 이후의62와 혼동하지 않는다.

## 11. Lens schema compatibility 결과

| 항목 | 현재 계약 | 판정 |
| --- | --- | --- |
| manufacturer/model/mount/prime·zoom | brand/model/Sony E/type | 신규 지원; legacy model 누락과 update 잠금 충돌 |
| actual focal | specs.focal.min/max, mm | prime min=max/zoom 양 끝; strict unit 보강 필요 |
| maximum aperture | specs.aperture.wide/tele, dimensionless f-number | constant 같은 값/variable 양 끝; 최소 조리개 아님 |
| minimum selectable aperture | 직접 field 없음 | inventory/future claim conditions; aperture에 덮어쓰지 않음 |
| FE/APS-C coverage | 직접 field 없음 | mount로 대체 금지, 좁은 계약 결정 필요 |
| OSS | specs.stabilization boolean/null | body IBIS·combined stops와 별개; validate 타입 drift |
| AF/MF | 전용 field 없음 | minFocusConditions/claim 조건으로 제한 |
| minimum focus | minFocusM, m +minFocusConditions | AF/MF·W/T 대표 조건을 명시해야 함 |
| maximum magnification | 직접 field 없음 | inventory/claim 조건; 임의 새 canonical field 금지 |
| filter diameter | filterMm, mm | 지원; unknown/미지원 구경은 null |
| diameter/length | lens 직접 field 없음 | body dimensions[3]를 렌즈[D,L]로 재사용 금지 |
| weight | weight, g | standalone lens; body weightBasis 강제 대상 아님 |
| weather sealing/PZ/T-stop | 직접 field 없음 | 공식 조건을 남기며 unsupported canonical key 생성 금지 |
| sources/fieldEvidence | 공통 source/claim 구조 | lens 신규 synthetic transaction에서 연결 확인 |

Unsupported field가 모두 production을 막는 것은 아니다. 배율/치수 등은 claim conditions로 보존할 수 있다. **legacy identity 경로와 주요 field의 validation gap**이 실제 pilot gate blocker다. Typed format 부재와 runtime crop 소비 한계도 명시적으로 결정해야 한다.

## 12. Lens pipeline 지원 여부

**부분 지원**. `productType:lens`, prime/zoom skeleton, multi-source, diff/new-product approval, atomic apply/provenance/idempotency 코드는 있다. 기존 Stage3 body+lens fixture와 이번 **lens-only synthetic transaction**이 이를 검증한다. 그러나 실제36legacy lens를 body와 같은 production-ready 상태로 판단할 수 없다.

격리 root에서 재현:

- existing Sony ID에 공식 model을 제공: normalize/validate/diff 통과 → approval `Identity changes require a separate reviewed schema flow: model`.
- model 생략: validate `MISSING_REQUIRED_IDENTITY` (`product.model`), empty-name 검사도 발생.
- known focal rawUnit 누락: validate 통과 → approval `Explicit original unit required`.
- aperture 문자열 `F2.8`: validate 통과 → approval `Invalid number`.
- OSS 문자열 `OSS`: validate 통과 → approval `Invalid boolean`.

모든 probe에서 canonical bytes unchanged. 저장한 probe는 **synthetic 진단**이며 Sony 공식 사양 raw가 아니다.

## 13. 새 validator 필요 여부

필요. 현재 body.fixedLens strict unit helper를 교환식 lens.focal에도 올바르게 적용하고 lens aperture/OSS/numeric leaf의 기존 canonical value contract를 validate에서 공유해야 한다. F-number는 무차원 비율이므로 mm처럼 단위를 강제하면 안 된다. `mm/cm/in`과 `m/mm/cm`, `g/kg/oz/lb`는 현재 conversion table에 있는 경로만 검증하고 새 단위를 추정하지 않는다. 잘못된 타입·단위·순서·불일치는 approval 이전에 거절해야 한다. 이번에는 validator를 바꾸지 않았다.

## 14. Pilot 가능 여부

**이번 상태에서는 불가; 지시14번 안전 분기로 inventory/compatibility 분석까지 완료.** 모든 lens path를 unsupported라 한 것이 아니라, actual production pilot의 required readiness가 충족되지 않은 것이다. Identity 잠금을 무조건 해제하거나 model을 수동 canonical에 넣지 않았다. 다음 구현은 아래 최소 보완 계약을 먼저 처리해야 한다.

## 15. 선정한5개 후보

**미실행 후보**: SEL40F25G /SEL2470GM2 /SEL2860 /SELP1020G /SEL90M28G. 모두 공식 current summary와 각각의 공식 spec table까지 확인했다. 새 제품2/기존3 조합이지만 actual count가 아니다.

## 16. 선정 이유

FE prime/constant F2.8 zoom/variable F4–5.6 zoom/APSC Power Zoom/macro OSS를 각각 대표한다. Existing ID 보존·legacy evidence 보강·신규 creation·AF/MF와 W/T focus·magnification·lens-only weight·format crop을 최소5개로 검증한다. 단종·upcoming으로 유형을 채우지 않았다.

## 17. 실제 production 처리 제품

**없음(0개).** 신규 manifest/raw/staging/diff/approval/transaction 생성0. 진단은 tmp root fixture만 사용했다. 위 후보를 canonicalized라고 표시하지 않았다.

## 18. 신규/기존 보강 수

Actual **0/0**. Readiness 보완 후 후보 실행 시 계획2new/3existing; 기존6current 전체는 결국 같은 ID 보강 대상이다.

## 19. Canonical 수량 변화

165/36/201→**165/36/201**. 기존 카메라/렌즈/가격 데이터는 그대로다.

## 20. Focal handling

Prime40는{min:40,max:40}, zoom24–70는{min:24,max:70}, APSC PZ10–20은 actual10–20mm이다. 35mm-equivalent15–30을 actual로 저장하지 않는다. 기존 normalization의 cm→mm는 테스트했으며 ft는 지원하지 않는다. 단위가 없는데 mm를 자동 생성해 strict validate를 통과시키는 gap은 보완 대상이다. Body fixedLens와 interchangeable lens는 별도 경로다.

## 21. Aperture handling

Constant2.8→wide2.8/tele2.8; variable4–5.6→wide4/tele5.6. SEL2860의 최소22–32는 별개다. SELC1635G의 T3.1을 F3.1로 저장하지 않는다. 현재 inventory F-number는 null로 남기고 특수 family에서 별도 공식 사양을 검토한다. STF의 F와 T도 구분한다. 실제 pilot 승격은0.

## 22. FE/APS-C coverage handling

Inventory는 full-frame/APS-C를 physical mount와 별도 속성으로 보관한다. Canonical에는 typed coverage field가 없다. [Sony 호환 안내](https://www.sony.co.kr/electronics/support/e-mount-body-ilce-3000-series/ilce-3000k/articles/00268906) 및 [공식 렌즈 명칭 설명](https://www.sony.co.kr/electronics/support/lenses-e-mount-lenses/sel40f25g/articles/00095004)에 따라 APS-C lens의 FF 사용은 crop 조건이다. 현재 engine이 이 조건을 읽어 추천을 보정한다고 주장하지 않는다. Format field/조건-only 한계를 먼저 결정하고 향후 consumer 지원은 별도 단계로 분리한다.

## 23. Mount handling

**Sony E 한 physical mount**. FE라는 비호환 mount 추가0. Identity는 manufacturer code가 핵심이고 retail SKU 지역 suffix는 같은 base다. A-looking SEL28702 URL 예외는 위6번 참고. Mount만 같다고 모든 format에서 full image circle을 보장하지 않는다.

## 24. OSS handling

SEL90M28G spec은 Optical SteadyShot, 나머지 후보4개는 body-integrated 표기라 lens OSS false 분석. Body IBIS/combined stabilization stops를 lens spec으로 만들지 않았다. Lens scalar boolean은 정상 계약이고 문자열 OSS는 approval에서 거절됨을 재현했다.

## 25. Focus/magnification handling

SEL40F25G: AF0.28/MF0.25m, AF0.20/MF0.23x. SEL2470GM2: W0.21/T0.30m,0.32x. SEL2860: W0.30/T0.45m,0.16x. SELP1020G: AF0.20/MF W0.13·T0.17m, AF0.14/MF0.18x. SEL90M28G:0.28m/1x. `minFocusM` 대표값을 선택하면 focus mode·focal endpoint를 반드시 함께 남기며, MF 최단을 일반 AF 성능으로 과장하지 않는다. Magnification은 typed canonical 지원이 없어 snapshot과 향후 claim 조건 대상이다.

## 26. Size/weight handling

후보 순서대로 D×L/weight:40G68×45mm/173g,2470II87.8×119.9/695g,286066.6×45/167g,PZ1020G69.8×55/178g,90Macro79×130.5/602g. 렌즈 자체 g이며 body weight와 합쳐 저장하지 않는다. D×L는 body3D dimension field에 넣지 않았다. Hood/caps/tripod mount 포함 여부가 공식 표에 없으면 추정하지 않는다. 향후 supertelephoto의 tripod-foot 조건은 separate source condition 필요.

## 27. Source/value conflicts

5candidate spec과 기존3candidate의 known focal/aperture/weight/OSS를 대조한 범위에서 **충돌0**. 전체67의 모든 사양에 conflict0을 보증한 것은 아니다. Existing6 전체 field diff/production conflict resolution은 아직 없다. 기존값과 다른 근거가 발견되면 자동 덮어쓰기 없이 value-conflict 검토가 필요하다. Synthetic conflicting claim은 기존 `CONFLICTING_CLAIM_VALUES`로 차단된다.

## 28. UNKNOWN

Unsupported schema와 실제 근거 UNKNOWN은 다르다. Cine F-number는 이번 수집 범위에서 null; T3.1만 F로 변환하지 않았다. 전체67의 focus/weight/spec field를 이번에 전수 채운 것은 아니다. Model identity/format·slot 구조를 title만으로 추정해 canonical에 넣지 않았다. Null/UNKNOWN 경로는 기존 정책으로 유지하며 0/false를 문서 누락 대신 사용하지 않는다.

## 29. 공식 source 수

Primary gallery1 +제품 summary73개 +후보 spec5 +이름에 aperture가 빠진100400GM spec1 +별도 category1를 직접 검토했다. 후보는 각 **official product+spec2개**를 확인했다. 이것은 research source 수이고 **production raw/sourceId 연결 수0**이다. Snapshot에 URL·실제 조회 시각/clock bounds·검토 결과를 저장했으며 raw evidence로 위장하지 않았다.

## 30. 제품별 worker token

후보5개 각각 input/output/total **0/0/0**. Worker task는 gate 실패로 not-started. Dry-run/API 호출도 하지 않았다.

## 31. Worker 총 token

**0**. 코드/canonical/secret 전송0.

## 32. Retry/failure

Worker API retry/failure0. 초기 일반 HTTP3요청403, 상세 추출 selector5건 timeout은 browser에서 회복했다. HTTP 실패/DOM selector 차이를 제품 단종 또는 worker 실패로 계산하지 않는다.

## 33. Worker 유용성

미실행이므로 평가 N/A. 다음 pilot이 승인되면 제품1개=독립task5개, 해당 공식 원문+최소 lens 계약만 제공한다. Token/retry/채택/기각 결과를 제품별 기록한다.

## 34. GPT-6.1 Sol 직접 판단

Scope/모델코드/세대와 변형/current-upcoming/기존ID/지원 field/field 의미/format vs mount/OSS vs IBIS/AF·MF·W·T/UNKNOWN/guard 실패/pilot 중단과 다음 계획을 직접 판단했다. 신규 사양 patch를 자동 적용하지 않았다.

## 35. 사람 개입량

추가 사용자 판단 요청0. Main이73개 summary·5spec와 추가1spec/metadata/contracts를 검토했다. 실제 작업시간을 계측하지 않았으므로 분 단위 수치를 만들지 않는다. 다음 구현은 explicit identity metadata 승인 설계가 필요하다.

## 36. 신규 normalization 문제

Focal rawUnit 누락이 mm로 채워지는 generic converter 행동, aperture `F2.8` 문자열과 OSS 문자열의 early type 검사 누락을 격리 재현했다. 페이지별 `/permalink`→`/lenses/products` redirect 및 새/옛 product summary DOM 차이는 source extraction 문제이며 mount/spec 의미 변경이 아니다.

## 37. 신규 pipeline/schema 문제

Blocking2: **legacy missing-model vs immutable identity**, **lens validate/approval drift**. 별도 contract decision1: **typed image-circle coverage 미지원**. Body3D dimensions/IBIS를 lens용으로 우회 재사용하지 않는다. 최소 보완 계획은 Appendix B다. 이번 runtime/schema/validator 변경0.

## 38. AccessedAt

Gallery DOM 수집 실제 **2026-10-15T03:06:20.847Z**. 73개 summary 검토 clock bounds는 snapshot에 별도 보존했다. 5spec의 actual UTC milliseconds timestamp도 제품별 저장했다. 날짜에서 midnight를 생성하지 않았다. **새 production raw0이므로 raw-helper 신규 production timestamp 검증은 N/A**. Synthetic helper tests와 기존 source timestamp 회귀는 전체 suite에서 유지된다.

## 39. 전체 tests

`pnpm test` **397/397 통과**(기존382+신규15), fail/skipped/cancelled0. 기존 테스트는 약화하지 않았다.

## 40. Objective/production tests

Objective/production/catalog/coverage **370/370 통과**, 38files. Engine2files는 전체397 suite에서 포함했다.

## 41. Sony lens tests

신규 readiness **15/15 통과**. Inventory/분모/분류/기존ID/세대/format/focal/constant·variable aperture/OSS/weight/focus/UNKNOWN/invalid type·range·unit/source conflict/duplicate/approval guard/lens-only atomic chain와idempotency/후속partition을 검증했다. 기존 Stage3 new-product tests도 전체 suite에서 실행한다.

## 42. Canonical validation

기존 `validateCanonical`/vocab으로 live 전체201products **통과**. Lens-only transaction test는 tmp root에서만 신규 lens를 만들고 정리한다.

## 43. Build/node/diff 검사

**Build/node/diff 모두 통과**. Node는 신규 test+기존 Objective6scripts 총7files, `git diff --check`와 신규 파일 whitespace도 검사했다. Build는 기존 Vite >500kB chunk warning만 있다. 추천 engine/UI/기존 production artifact 변경은 없다.

## 44. Idempotency

**실제 production reapply N/A**: batch를 만들지 않았기 때문이다. Lens-only synthetic explicit approval→atomic apply→reapply는 **already-canonicalized /canonicalMatches:true**이며 canonical/manifest bytes no-op을 검증했다. 이를 실제 Sony lens production 성공으로 보고하지 않는다.

## 45. Git status

변경은 progress +새 inventory/readiness 보고서/test 총4파일이다. Canonical/identity-map/vocab/scope/pipeline/engine/UI/기존 artifacts/tests는 unchanged. Commit/push 하지 않는다.

## 46. Remaining current Sony lenses

Actual **67개 모두 production 미처리**. 기존canonical6개도 reference/legacy 상태이므로 완료로 세지 않는다. Hypothetical pilot5를 성공시킨 뒤에만62개다. Upcoming4와teleconverter2는67에 포함하지 않는다.

## 47. 후속 대형 batch 계획

Readiness→pilot5 성공을 전제로 **62개/6family batches**: APS-C9, FE primes10+10, FE zooms12+12, special-family9. Snapshot에 각 batch의 실제 model code 목록을 고정했다. 각각 독립 worker task, multi-source/strict gates/diff/approval/atomic transaction/tests/commit 단위다. 5개 고정 batch를 반복하지 않는다.

Special9의 T/F·STF·macro·supertele weight/teleconverter 범위는 family별 작은 preflight가 선행되어야 한다. 같은 transaction에 넣어도 모든 family를 무조건 통과시키지 않으며 불명확한 claim은 UNKNOWN/분리한다. Family가 새 contract를 필요로 하면 해당 subgroup을 별도 pilot로 나눠 **batch 수는 증가할 수 있다**. 6개는 현재 core field 계약을 유지할 때의 분할 계획이다.

## 48. Coverage audit까지 필요한 작업

1. Appendix B의 좁은 contract/identity/validator 구현과 회귀 검증.
2. 공식 status 재확인 후 동일5후보를 실제 independent workers→production pilot.
3. 나머지62를 위6family batches로 처리; newcomer/status 변경은 분모 재계산.
4. Fresh gallery/상세/current·upcoming·variant 대조, 기존6의 provenance/identity, source/digests/단위/조건/unknown/재적용과 실제 coverage audit.

완료한 바디 brand 수를 lens coverage 완료 근거로 쓰지 않는다.

## 49. 최종 recommendation

**다음 세션은 대량 ingestion보다 lens readiness 최소 보완이 먼저다.** 새로운 brand schema 설계나 가격/추천/UI 작업은 필요하지 않다. Inventory와 후보·probe·작업계획은 저장돼 있으므로 처음부터 재조사할 필요 없이 다음 구현 단계부터 시작할 수 있다. 다만 production을 시작하는 날 official status는 재확인한다. 현재 작업의 분석 분기는 완료이며 실제 Sony pilot/전체 coverage는 미완료로 명확히 기록했다.

## Appendix A. 한국 공식 released/current 전체67개

| Model code | Official display name | Coverage | Existing canonical ID |
| --- | --- | --- | --- |
| SEL100400 | FE 100-400mm F5.6-8 OSS | 35mm full-frame | 신규 필요 |
| SEL100400MC | FE 100-400mm F4.5 GM OSS | 35mm full-frame | 신규 필요 |
| SEL100M28GM | FE 100mm F2.8 Macro GM OSS | 35mm full-frame | 신규 필요 |
| SEL50150GM | FE 50-150mm F2 GM | 35mm full-frame | 신규 필요 |
| SEL400800G | FE 400-800mm F6.3-8 G OSS | 35mm full-frame | 신규 필요 |
| SEL16F18G | FE 16mm F1.8 G | 35mm full-frame | 신규 필요 |
| SEL2870GM | FE 28-70mm F2 GM | 35mm full-frame | 신규 필요 |
| SEL85F14GM2 | FE 85mm F1.4 GM II | 35mm full-frame | 신규 필요 |
| SEL1625G | FE 16-25mm F2.8 G | 35mm full-frame | 신규 필요 |
| SEL2450G | FE 24-50mm F2.8 G | 35mm full-frame | 신규 필요 |
| SEL300F28GM | FE 300mm F2.8 GM OSS | 35mm full-frame | 신규 필요 |
| SEL1635GM2 | FE 16-35mm F2.8 GM II | 35mm full-frame | 신규 필요 |
| SEL70200G2 | FE 70-200mm F4 Macro G OSS Ⅱ | 35mm full-frame | 신규 필요 |
| SEL50F14GM | FE 50mm F1.4 GM | 35mm full-frame | 신규 필요 |
| SEL2070G | FE 20-70mm F4 G | 35mm full-frame | 신규 필요 |
| SELP1020G | E PZ 10-20mm F4 G | APS-C | 신규 필요 |
| SEL15F14G | E 15mm F1.4 G | APS-C | 신규 필요 |
| SEL11F18 | E 11mm F1.8 | APS-C | 신규 필요 |
| SEL2470GM2 | FE 24-70mm F2.8 GM II | 35mm full-frame | sony-fe-24-70-gm2 |
| SELP1635G | FE PZ 16-35mm F4 G | 35mm full-frame | sony-fe-pz-16-35-f4 |
| SEL70200GM2 | FE 70-200mm F2.8 GM OSS II | 35mm full-frame | sony-fe-70-200-gm2 |
| SEL14F18GM | FE 14mm F1.8 GM | 35mm full-frame | 신규 필요 |
| SEL24F28G | FE 24mm F2.8 G | 35mm full-frame | 신규 필요 |
| SEL40F25G | FE 40mm F2.5 G | 35mm full-frame | sony-fe-40-g |
| SEL50F25G | FE 50mm F2.5 G | 35mm full-frame | 신규 필요 |
| SEL50F12GM | FE 50mm F1.2 GM | 35mm full-frame | 신규 필요 |
| SEL35F14GM | FE 35mm F1.4 GM | 35mm full-frame | 신규 필요 |
| SELC1635G | FE C 16-35mm T3.1 | 35mm full-frame | 신규 필요 |
| SEL2860 | FE 28-60mm F4-5.6 | 35mm full-frame | sony-fe-28-60 |
| SEL1224GM | FE 12-24mm F2.8 GM | 35mm full-frame | 신규 필요 |
| SEL20F18G | FE 20mm F1.8 G | 35mm full-frame | 신규 필요 |
| SEL1655G | E 16-55mm F2.8 G | APS-C | 신규 필요 |
| SEL35F28Z | Sonnar T* FE 35mm F2.8 ZA | 35mm full-frame | 신규 필요 |
| SEL55F18Z | Sonnar T* FE 55mm F1.8 ZA | 35mm full-frame | 신규 필요 |
| SEL70200G | FE 70-200mm F4 G OSS | 35mm full-frame | 신규 필요 |
| SEL70200GM | FE 70-200mm F2.8 GM OSS | 35mm full-frame | 신규 필요 |
| SEL85F14GM | FE 85mm F1.4 GM | 35mm full-frame | 신규 필요 |
| SEL90M28G | FE 90mm F2.8 Macro G OSS | 35mm full-frame | 신규 필요 |
| SEL100F28GM | FE 100mm F2.8 STF GM OSS | 35mm full-frame | 신규 필요 |
| SEL70350G | E 70-350mm F4.5-6.3 G OSS | APS-C | 신규 필요 |
| SEL600F40GM | FE 600mm F4 GM OSS | 35mm full-frame | 신규 필요 |
| SEL35F18F | FE 35mm F1.8 | 35mm full-frame | 신규 필요 |
| SEL200600G | FE 200-600mm F5.6-6.3 G OSS | 35mm full-frame | 신규 필요 |
| SEL135F18GM | FE 135mm F1.8 GM | 35mm full-frame | 신규 필요 |
| SEL400F28GM | FE 400mm F2.8 GM OSS | 35mm full-frame | 신규 필요 |
| SEL24F14GM | FE 24mm F1.4 GM | 35mm full-frame | 신규 필요 |
| SEL24105G | FE 24-105mm F4 G OSS 렌즈 | 35mm full-frame | 신규 필요 |
| SEL1635GM | FE 16-35mm F2.8 GM | 35mm full-frame | 신규 필요 |
| SEL1224G | FE 12-24mm F4 G | 35mm full-frame | 신규 필요 |
| SEL100400GM | 소니 fe 100-400mm 망원 줌 렌즈 | 35mm full-frame | 신규 필요 |
| SEL85F18 | FE 85mm F1.8 | 35mm full-frame | sony-fe-85-f18 |
| SELP18105G | E PZ 18-105mm F4 G OSS | APS-C | 신규 필요 |
| SEL20F28 | E 20mm F2.8 | APS-C | 신규 필요 |
| SEL24240 | FE 24-240mm F3.5-6.3 OSS | 35mm full-frame | 신규 필요 |
| SEL2470GM | FE 24-70mm F2.8 GM | 35mm full-frame | 신규 필요 |
| SEL2470Z | Vario-Tessar T* FE 24-70mm F4 ZA OSS | 35mm full-frame | 신규 필요 |
| SEL24F18Z | Sonnar T* E 24mm F1.8 ZA | APS-C | 신규 필요 |
| SEL28F20 | FE 28mm F2 | 35mm full-frame | 신규 필요 |
| SELP28135G | FE PZ 28-135mm F4 G OSS | 35mm full-frame | 신규 필요 |
| SEL30M35 | E 30mm F3.5 매크로 | APS-C | 신규 필요 |
| SEL35F14Z | Distagon T* FE 35mm F1.4 ZA | 35mm full-frame | 신규 필요 |
| SEL50F14Z | Planar T* FE 50mm F1.4 ZA | 35mm full-frame | 신규 필요 |
| SEL50F18 | E 50mm F1.8 OSS | APS-C | 신규 필요 |
| SEL50F18F | FE 50mm F1.8 | 35mm full-frame | 신규 필요 |
| SEL50M28 | FE 50mm F2.8 매크로 | 35mm full-frame | 신규 필요 |
| SEL55210 | E 55-210mm F4.5-6.3 OSS | APS-C | 신규 필요 |
| SEL70300G | FE 70-300mm F4.5-5.6 G OSS | 35mm full-frame | 신규 필요 |

출시예정4: SEL400F45GM, SEL600F63GM, SEL814G, SEL28702. 인접2: SEL14TC/SEL20TC. 각 공식 URL·focal/max aperture·family·status·scope는 JSON에 제품별 저장돼 있다.

## Appendix B. 다음 구현 세션의 정확한 최소 범위

현재는 아래 구현을 **제안만** 한다.

- `docs/OBJECTIVE_DB_V04_FIELD_CONTRACTS.md`: lens maximum aperture와 actual focal/format/OSS/focus/weight 쓰기 계약 추가. Missing-model lens identity 보강은 제품코드/공식 source/기존ID/name/aliases 검증과 explicit approval을 요구하도록 계약한다.
- `scripts/objective/rules.mjs` +`merge.mjs`: 기존 lens value 검증 helper를 공유하여 타입/range/unit을 validate 이전부터 일치시킨다. `focal.min/max`의 mm와 raw unit 필수, 기존 supported conversion만 허용; aperture는 positive dimensionless number, stabilization boolean/null, focus/weight/filter 기존 units. ProductType별 허용 path/prime equality도 검토한다. Body fixedLens archive replay·기존 sealed digest semantics는 유지한다.
- `promotion.mjs`/`merge.mjs`: missing-model인 **기존 Sony6개만** 공식 mapping/identity evidence에 기반한 append-only identity metadata 보강의 명시적 승인 경로를 설계·구현한다. 기존 model/name/brand/mount/aliases를 임의 변경하거나 identity lock을 전체 생략하지 않는다. Canonical 수동 수정이나 이름을 바꾼 신규복제는 금지한다.
- FE/APS-C: 필요하다면 **선택적 lens-only coverage field 하나**를 최소 확장하되, 값/enum/원문 매핑을 먼저 field contract에 확정한다. 기존36개 전체에 default를 삽입하지 않는다. Conditions-only를 택하면 runtime이 crop-aware라는 완료 선언은 금지하며 다음 phase의 소비 한계를 명시한다. FE 별도 mount는 추가하지 않는다.
- `tests/sonyLensReadiness.test.js` 및 기존 Objective contract tests: invalid type/unit/range가 CLI validate에서 rejected, existing ID의 explicit identity 보강과 arbitrary replacement 차단, new/existing diff·multi-source·atomic replay·기존5이상brand archive 호환을 확인한다. 현재 진단 결과는 역사적 snapshot으로 남긴다.

**첫 구현 세션 종료선:** lens readiness contracts/helper/명시적 identity 보강 경로와 synthetic tests까지. Sony 전체 사양 추가/worker/API production은 포함하지 않아도 된다. 그다음 실제5pilot은 별도 세션으로 수행하면 사용량 제한 시 재개 위치가 명확하다. 최소2세션(보완1+pilot1), 이후6family batches+coverage audit1을 권장한다. 새 directory/DB 서버/별도 백엔드/대규모 feature schema 불필요.
