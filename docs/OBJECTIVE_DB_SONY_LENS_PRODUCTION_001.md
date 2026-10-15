# Sony E-Mount 순정 렌즈 Production Pilot 001 — 2026-10-15

**성공. 지정한5개를 단일 atomic transaction으로 반영했다.** 기존3개는 같은 ID에서 model 최초 보강과 공식 provenance를 확보했고 신규2개를 등록했다. Canonical **165 bodies /36 lenses /201 total →165 /38 /203**. Lens source는 제품별2개, 지원 spec50paths 모두 fieldEvidence가 있다. 실제 재적용 **already-canonicalized /canonicalMatches:true**.

시작 clean commit `bec609aa0127c2ee024b11fd1aac2e17aaca34dc`. Readiness 구현·계약·inventory·기존36lens·map/vocab/scope·pipeline을 확인했다. [운영 checkpoint](../src/data/ingestion/sony-e-lenses-production-001.json), [manifest](../src/data/ingestion/batches/production-sony-e-lenses-001.json), [회귀 테스트](../tests/sonyLensProduction001.test.js). 기존 inventory/readiness 문서는 당시 기록이며 실제 진행 상태는 이 문서와 새 checkpoint를 기준으로 한다.

## 제품별 결과

| 공식 code / 사양 | 처리 / canonical ID | Coverage | Actual mm | 최대 F W/T | OSS | g | 필터 mm |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [SEL40F25G](https://www.sony.co.kr/lenses/products/sel40f25g/spec) | 기존 /sony-fe-40-g | full-frame | 40/40 | 2.5/2.5 | false | 173 | 49 |
| [SEL2470GM2](https://www.sony.co.kr/lenses/products/sel2470gm2/spec) | 기존 /sony-fe-24-70-gm2 | full-frame | 24–70 | 2.8/2.8 | false | 695 | 82 |
| [SEL2860](https://www.sony.co.kr/lenses/products/sel2860/spec) | 기존 /sony-fe-28-60 | full-frame | 28–60 | 4/5.6 | false | 167 | 40.5 |
| [SELP1020G](https://www.sony.co.kr/lenses/products/selp1020g/spec) | 신규 /sony-e-pz-10-20-f4-g | APS-C | 10–20 | 4/4 | false | 178 | 62 |
| [SEL90M28G](https://www.sony.co.kr/electronics/camera-lenses/sel90m28g/specifications) | 신규 /sony-fe-90-f28-macro-g-oss | full-frame | 90/90 | 2.8/2.8 | true | 602 | 62 |

| Code | Canonical 대표 최단거리 /보존 조건 | 최대 배율(미승격) | D×L mm(미승격) |
| --- | --- | --- | --- |
| SEL40F25G | AF0.28m; MF0.25m | AF0.20x/MF0.23x | 68×45 |
| SEL2470GM2 | W24mm0.21m; T70mm0.30m; AF/MF 별도표기 없음 | 0.32x | 87.8×119.9 |
| SEL2860 | W28mm0.30m; T60mm0.45m; AF/MF 별도표기 없음 | 0.16x | 66.6×45 |
| SELP1020G | AF0.20m; MF W0.13m/T0.17m | AF0.14x/MF0.18x | 69.8×55 |
| SEL90M28G | 0.28m; 최단거리 표의 AF/MF 구분 없음 | 1x(1:1) | 79×130.5 |

아래43항목은 사용자 요청 순서다.

1. **실제 처리 제품:** SEL40F25G /SEL2470GM2 /SEL2860 /SELP1020G /SEL90M28G 정확히5개. 다른 렌즈는 처리하지 않았다.
2. **Existing/current 판단:** Sony Korea [현행 갤러리](https://www.sony.co.kr/lenses/gallery)의 rendered73cards 중 해당5개 code/name/format/card offer를 다시 확인하고 각 공식 product/spec을 열었다. 해당5개 upcoming/discontinued 표기나 기존 inventory와 불일치 없음. 기존 ID3개와 공식 code를 대조했다. 매장 재고나 전세계 completeness를 뜻하지 않는다. 나머지62개 상태를 이번에 전수 재조사한 것은 아니다.
3. **신규/기존:** 신규2, 기존 보강3. Duplicate 생성0. Existing 3개는 name/brand/mount/type/aliases/가격을 그대로 유지했다.
4. **Canonical 수량:** 165/36/201→165/38/203. 기존165bodies와 다른33lenses는 byte-value 동일. 기존36개 가격도 동일하며 신규2개의 가격은 UNKNOWN이다.
5. **Official model code:** 표의 대문자 code를 canonical model로 저장했다. 지역 SKU `//CSYX`, `/QSYX` 등을 독립 optical identity로 만들지 않았다.
6. **Physical mount:** 전부 기존 enum `Sony E`. FE 별도 mount 추가0.
7. **Format coverage:** 4개 full-frame, SELP1020G만 APS-C. 제품명 추정이 아닌 spec의 포맷 row를 claim/source/fieldEvidence에 연결했다. Crop runtime 소비는 이번 범위가 아니다.
8. **Focal:** 표의 actual mm를 사용했다. Prime min=max. SELP1020G actual10–20과 equivalent15–30을 구분했으며 후자는 canonical focal에 넣지 않았다. Raw/normalized known focal unit 모두mm.
9. **Aperture:** 표의 maximum f-number를 dimensionless number로 저장했다. SEL2860은 wide4/tele5.6. 최소 선택 조리개22–32와 T-stop으로 덮어쓰지 않았다.
10. **OSS:** Macro90만 true, 나머지4개 false. 공식 spec의 `- (바디 통합)`은 렌즈 내 OSS 부재로 검토했으며 camera-body IBIS 보유 여부를 추정하지 않았다. Raw conditions에 원문/해석 범위를 남겼다.
11. **Minimum focus:** 위 표와 canonical minFocusConditions/claim metadata에 AF/MF와 W/T를 보존했다. 별도 focus mode가 없는24–70/28–60 row에 AF/MF를 생성하지 않았다. 대표 숫자는 각각 W0.21/W0.30이며 전체 줌 구간 공통 최단거리라는 뜻이 아니다.
12. **Maximum magnification:** 위 표의 공식 값은 claim conditions와 checkpoint의 unpromotedFacts에 보존했다. 신규 canonical magnification field는 만들지 않았다. Macro90의1:1을 다른 렌즈에 일반화하지 않는다.
13. **Filter diameter:** 49/82/40.5/62/62mm를 공식 spec으로 승격했다.
14. **Dimensions:** 위 D×L은 raw weight conditions/source locator와 backlog에 보존했다. Body의3D dimensions 배열을 렌즈에 재사용하지 않았다.
15. **Weight:** 173/695/167/178/602g, lens standalone 값이다. Body 포함/중복 합산0. 검토한 weight row가 hood/caps 포함 기준을 별도 명시하지 않아 임의 기준을 만들지 않았다. Body weightBasis를 lens에 강제하지 않았다.
16. **Official source 수:** 각2개, 총10raw. 제품 page는 identity-only, spec page는10개 spec paths를 증명한다. Identity-only source도 canonical sources와 사람용 summary의2sources에 포함된다. 갤러리는 current review 근거로 별도 checkpoint에 기록하며 canonical source 수를3으로 부풀리지 않았다.
17. **Conflicts:** 실제 승격 source/value conflict0. 기존18개 same-value/new-evidence, spec12개 null-fill, 신규spec20개와 model3개 null-fill을 구분했다. `--allow-value-conflicts`는 사용하지 않았다. 진짜 claim 충돌은 기존 validator가 계속 차단함을 regression으로 확인했다.
18. **주요 UNKNOWN:** 무게의 hood/caps 포함 기준, 일부 제품의 최단거리 AF/MF 구분,40G의 이번에 직접 확인하지 않은 weather 설계, 신규2개의 신품/중고 가격. 미지원 D×L/배율/PZ/최소 선택 조리개는 UNKNOWN spec으로 위장하지 않고 공식 값이 있지만 typed field가 없는 backlog로 구분했다.
19. **Existing model null-fill:** 기존40G/24–70GMII/28–60의 absent model을 공식 code로 최초 보강했다. 같은 ID와 기존 identity를 유지하며 identityEvidence/source `identity`+`model`이 연결됐다.
20. **Approval flag:** 실제 CLI에서 `--confirm --reviewer --reason --diff-digest --allow-new-products --allow-model-null-fill`을 사용했다. 승인 productOperations에3개 modelNullFill/2개 new-product가 묶였다.
21. **Identity lock:** non-null model 변경, alias/mount 변경, 중복 ID/identity 보호를 유지했다. 이번에 기존 값 교체 예외나 source bypass는 추가하지 않았다. Reviewer는 main agent GPT-6.1 Sol이며 별도 사람이 승인했다는 뜻은 아니다.
22. **제품별 worker token:** 아래 표. 실패·재시도까지 합산한 API usage다.

   | Code | Input | Output | Total | 실제 호출 |
   | --- | ---: | ---: | ---: | ---: |
   | SEL40F25G | 788 | 565 | 1,353 | 1 |
   | SEL2470GM2 | 1,602 | 1,069 | 2,671 | 2 |
   | SEL2860 | 804 | 912 | 1,716 | 1 |
   | SELP1020G | 868 | 1,627 | 2,495 | 1 |
   | SEL90M28G | 811 | 802 | 1,613 | 1 |

23. **Worker 총 token:** input4,873/output4,975/**total9,848**. 제품별 독립5tasks, 실제 API6회. Dry-run은 API/token 횟수에 포함하지 않았다. Worker에 보낸 것은 해당 공개 source 발췌와 수기 최소 계약만이며 canonical/프로젝트 소스/secret은 보내지 않았다.
24. **Retry/failure:** corrected retry1, malformed response failure1(24–70 첫 호출). 같은 task ID 재시도는 valid JSON extraction을 `needs_information`으로 반환했으며 main이 부분 활용했다. 추가 호출 없음. 네트워크/timeout failure0. 첫40G는 envelope에 전체 extraction payload가 남지 않아 명시적 초점/조리개/OSS 검사와 경고만 채택했다.
25. **Worker 유용성:** 보조 수준. 실제 focal/equivalent, 최대/최소 조리개, AF/MF·W/T 조건 구분에 유용했다. 28–60의 근거 없는 AF/MF alternatives, PZ10–20의 bodyIBIS:true, 명시적 no-OSS의 null/absent 혼용과 미지원 사실 무조건 누락은 버렸다. Worker 결과를 자동 적용하지 않았고 patch0이다.
26. **Main 직접 판단:** current/identity/code/기존 ID3·new2, model null-fill, physical mount와 coverage, actual focal, maximum aperture, OSS false/UNKNOWN 구분, focus 대표값/조건, 배율/D×L·가격 미승격, 모든 diff와 승인/apply를 직접 검토했다.
27. **사람 개입량:** 추가 사용자 제품 판단/확인 요청0. Main 수동 검토는 제품5/공식 primary sources10/spec paths50/model fills3. Raw는 검토한 공식 사실로 main이 작성했고 worker는 extraction assistant였다. 자동화된 수집 정확도나 사용자 개입 시간이0이라고 주장하지 않는다.
28. **Normalization 문제:** 일부 신형 Sony 사양 label의 `::LENS...` token과 PZ focus row의 반복 괄호가 보였다. 실제 표 row/값을 읽고 원문을 metadata에 남겼다. 표시 오류를 숫자나 AF/MF 조건으로 해석하지 않았다. Variable F, coverage alias, mm/m/g는 기존 contract로 정상 처리됐다.
29. **Pipeline/schema 신규 문제:** blocking 문제0, production 코드 수정0. 다만 readiness test가 live40G에 model이 없다고 가정해 실제 보강 후 실패했다. Missing-model regression 입력을 immutable Hasselblad last-body snapshot의 legacy40G 복사본으로 고정하고 격리 root에 넣었다. 검사/에러 기대값을 완화하지 않았으며 실제 신규 batch17개 회귀 테스트를 추가했다. Worker envelope 문제는 별도 추출 출력 운영 이슈다.
30. **AccessedAt:** raw-helper가 timestamp 입력 없이 실제 현재 UTC를 생성했다.10개 raw capture window **2026-10-15T04:56:38.907Z–04:56:38.910Z**. Browser current 확인은04:51:39.228Z, 사양 확인은04:52분대에 수행했다. Raw timestamp는 검토한 source를 raw로 캡처한 시각이며 HTTP 요청 시작 시각을 재구성한 값이 아니다. 날짜→00:00 생성0, 기존 artifact timestamp 변경0.
31. **전체 tests:** **459/459 통과**, fail/skip0.
32. **Objective tests:** 추천 엔진 전용2파일을 제외한40파일 **432/432 통과**. Production/catalog/coverage 포함.
33. **Sony lens tests:** 신규 pilot17 +lens contracts45 +readiness15 =**77/77 통과**. CLI unit/type rejected와 explicit approval/recovery/idempotency 검사를 유지했다.
34. **기존 body regression:** 전체 suite에서 기존9브랜드 body/catalog/coverage와 추천 엔진27개 테스트 통과. 별도 기존브랜드30파일 subset도 **246/246 통과**. 기존30개 body sealed transactions 및 신규lens1개의 before→after/after→after replay도 일치한다. 추천/UI 파일 수정0.
35. **Canonical validation:** current165/38/203에 `validateCanonical` 통과. Before SHA `3f971b678f83576b916ad00e9c5ff48c203ceee48d95be806754ea7c8f1c9842`, after SHA **`ee99e92bf6d90a9f21353f4f1557f3546309824a4ee191446d95862580d706b5`**, approval expected digest와 동일.
36. **Build/node/diff:** `pnpm build` 성공(기존500kB chunk 경고 유지), 변경 JS3파일 `node --check` 통과, `git diff --check`/신규 whitespace 검사 통과. 실제 raw/helper·pipeline script 변경은 없으며 기존 scripts 구문도 확인했다. 임시 worker fixture5개 삭제, Git에 포함하지 않았다.
37. **Idempotency:** 실제 CLI apply를 다시 실행해 `already-canonicalized`, `canonicalMatches:true` 확인. 한 transaction의5items 모두 canonicalized. Atomic before/after/archive/승인 digest와 replay 검사 통과.
38. **Git status:** **기존5파일 modified /신규26파일 untracked /합계31파일**. Canonical은 pipeline으로만 변경. Identity-map에5개 lens mapping append, 기존 readiness test2파일의 fixture 입력 고정, 신규 pilot test1개, 진행/완료 문서와 운영 checkpoint 및 새 batch artifact가 변경/추가됐다. 기존 production artifact/inventory/vocab/scope/engine/UI는 불변. Commit/push는 하지 않았다. Modified는 `docs/OBJECTIVE_DB_V04_PROGRESS.md`, `src/data/cameraProducts.json`, `src/data/ingestion/identity-map.json`, `tests/objectiveLensContracts.test.js`, `tests/sonyLensReadiness.test.js`. 신규는 본 보고서/checkpoint/회귀test3개와 raw10/staging5/manifest1/diff1/approval2/transaction4개다.
39. **현행 Sony lens production 완료:** **5개**. Canonical에 존재한다는 사실과 production provenance 완료는 구분한다.
40. **현행 Sony lens production 미처리:** 기존67기준 **62개**(신규 필요59 +기존 보강3). Upcoming4/teleconverter2는 별도다.
41. **나머지62개 계획:** 아래6개 독립 family batch. 실제 실행 전 각 제품의 현행/출시와 공식 source를 다시 확인한다. 새 checkpoint에 정확한 code 목록이 있으며 과거 snapshot은 덮어쓰지 않는다.

   | Batch | Family | 개수 |
   | --- | --- | ---: |
   | 002 | APS-C | 9 |
   | 003 | FE primes A | 10 |
   | 004 | FE primes B | 10 |
   | 005 | FE wide/standard/telephoto zooms A | 12 |
   | 006 | FE wide/standard/telephoto zooms B | 12 |
   | 007 | Special family preflight: macro/STF/cinema/supertele | 9 |

42. **큰 batch 진행:** 일반 family9–12개 단위 진행 가능. 제품1개=독립 worker task와 전체 diff 검토/단일 atomic apply는 유지한다. Special family9개는 T/F 분리·tripod-foot weight·AF/MF 조건·공식 F-number 확인을 먼저 하고 blocking 표현 문제가 있으면 분할한다.62개 일괄 apply를 권하지 않는다.
43. **후속 lens schema blocker:** 이번5개와 일반 사양 ingestion blocker0. D×L/배율/PZ/weather/T-stop 전용field, 조건부 focus 소비, runtime coverage/crop는 별도 개선 후보다. 특수 렌즈의 unsupported 값을 기존 field에 억지 매핑하지 않는다. 가격/Experience/다른브랜드/나머지렌즈는 이번에 처리하지 않았다.

## 재개 checkpoint

현재 **production complete / tests passed / uncommitted**. 다음 세션은 이 보고서·새 checkpoint·manifest/journal을 읽고 완료 변경을 검토·commit하여 clean을 확인한 뒤 batch002를 시작한다. Worker/API6회/raw10/approval/apply를 다시 실행하거나 sealed artifact를 고치지 않는다. 다음 작업의 대상과 scope가 확정되면 새 batch ID로 수집부터 진행한다.
