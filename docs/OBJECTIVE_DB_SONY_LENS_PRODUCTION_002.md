# Sony E-Mount lens Production Batch 002 — 완료

2026-10-16. **일반 FE 단렌즈12개를 실제 production 처리했다. 신규11개 + 기존85mm F1.8 보강1개, canonical165bodies/38lenses/203total →165/49/214.** 공식 current67개 중 production 완료17개, 잔여50개.12개를 단일 atomic transaction으로 적용했으며 실제 재적용은 already-canonicalized / canonicalMatches:true다. 전체478/478 테스트 통과. 추가 사용자 판단 요청0, 미완료 batch 제품0. Commit/push는 하지 않았다.

운영 checkpoint: [sony-e-lenses-production-002.json](../src/data/ingestion/sony-e-lenses-production-002.json). [manifest](../src/data/ingestion/batches/production-sony-e-lenses-002.json), [machine diff](../src/data/ingestion/diffs/production-sony-e-lenses-002.json), [approval](../src/data/ingestion/approvals/production-sony-e-lenses-002.json), [sealed evidence](../src/data/ingestion/transactions/production-sony-e-lenses-002/evidence.json), [회귀19개](../tests/sonyLensProduction002.test.js).

## 요청한44항목

1. **실제 선정 수**:12개. Clean baseline5b1f70d에서 시작, selection을 worker 호출 전에 고정했다.12개 모두 해당 Sony Korea gallery card와 제품/사양을 실제 확인했다. Current는 공식 카탈로그 노출/제품 정보/출시예정 표기 부재 기준이며, 판매점 재고를 뜻하지 않는다.

2. **전체 model code**: SEL16F18G, SEL14F18GM, SEL20F18G, SEL24F28G, SEL24F14GM, SEL35F14GM, SEL50F14GM, SEL50F12GM, SEL50F25G, SEL85F14GM2, SEL55F18Z, SEL85F18.

3. **선정 기준**: official current inventory67에서 pilot001 완료5개를 artifact로 제외. Physical Sony E, 공식35mm full-frame, 일반 prime, 기존 계약으로 표현 가능한 제품을 우선했다. G/GM/ZA,14–85mm/F1.2–F2.8을 포함하고 upcoming4/TC2/macro/STF/cinema/supertele는 제외했다. 이전 제안의002 APS-C 순서는 이번 사용자 FE prime 지시로 바꿨으며 과거 문서는 당시 기록으로 보존했다.

4. **실제 처리 목록 및 identity**:

| Model / 공식 제품 링크 | Official display name | 작업 | Canonical ID |
|---|---|---|---|
| [SEL16F18G](https://www.sony.co.kr/electronics/camera-lenses/sel16f18g) | FE 16mm F1.8 G | 신규 | sony-fe-16-f18-g |
| [SEL14F18GM](https://www.sony.co.kr/lenses/products/sel14f18gm) | FE 14mm F1.8 GM | 신규 | sony-fe-14-f18-gm |
| [SEL20F18G](https://www.sony.co.kr/lenses/products/sel20f18g) | FE 20mm F1.8 G | 신규 | sony-fe-20-f18-g |
| [SEL24F28G](https://www.sony.co.kr/lenses/products/sel24f28g) | FE 24mm F2.8 G | 신규 | sony-fe-24-f28-g |
| [SEL24F14GM](https://www.sony.co.kr/electronics/camera-lenses/sel24f14gm) | FE 24mm F1.4 GM | 신규 | sony-fe-24-f14-gm |
| [SEL35F14GM](https://www.sony.co.kr/lenses/products/sel35f14gm) | FE 35mm F1.4 GM | 신규 | sony-fe-35-f14-gm |
| [SEL50F14GM](https://www.sony.co.kr/lenses/products/sel50f14gm) | FE 50mm F1.4 GM | 신규 | sony-fe-50-f14-gm |
| [SEL50F12GM](https://www.sony.co.kr/lenses/products/sel50f12gm) | FE 50mm F1.2 GM | 신규 | sony-fe-50-f12-gm |
| [SEL50F25G](https://www.sony.co.kr/lenses/products/sel50f25g) | FE 50mm F2.5 G | 신규 | sony-fe-50-f25-g |
| [SEL85F14GM2](https://www.sony.co.kr/electronics/camera-lenses/sel85f14gm2) | FE 85mm F1.4 GM II | 신규 | sony-fe-85-f14-gm2 |
| [SEL55F18Z](https://www.sony.co.kr/electronics/camera-lenses/sel55f18z) | Sonnar T* FE 55mm F1.8 ZA | 신규 | sony-sonnar-t-fe-55-f18-za |
| [SEL85F18](https://www.sony.co.kr/electronics/camera-lenses/sel85f18) | FE 85mm F1.8 | 기존 보강 | sony-fe-85-f18 |

5. **신규/기존**: 신규11, 기존1. 기존 sony-fe-85-f18에 새 ID를 만들지 않았다.

6. **Canonical 수량**: bodies165→165 / lenses38→49 / total203→214. 전체165bodies와 나머지37개 기존lens, 기존 가격은 deep equality 및 transaction before/after로 불변 확인. cameraProducts는 pipeline atomic apply로만 변경했다.

7. **Sony production 완료 누적**:17/67(pilot5+이번12). Canonical에 존재한다는 이유만으로 완료로 세지 않았다.

8. **미처리**:50개(신규 필요48+기존 provenance 보강2). Upcoming4/TC2는67개 분모 밖에서 별도 유지한다. 과거 inventory snapshot은 당시 상태 그대로 보존했다.

9. **제품별 actual focal**: 다음 표 mm열. 단렌즈 min=max, raw/staging 모두 explicit mm. APS-C 환산을 actual로 저장하지 않았다.

10. **Aperture**: 표는 최대 개방F / 최소 선택 가능F. Canonical aperture.wide=tele=최대F이며 최소F는 claim conditions/backlog에만 남긴다. 숫자 F-number이며 T-stop이 아니다.

11. **Mount**:12개 모두 소니 공식 사양의 Sony E-Mount →기존 canonical Sony E. Sony FE라는 새 physical mount를 만들지 않았다.

12. **Format coverage**:12개 모두 공식35mm 풀프레임 →full-frame. FE 이름만으로 추정하지 않고 별도 verified fieldEvidence를 연결했다.

13. **OSS**:11개는 명시적 SteadyShot '- (바디 통합)' 행에 pilot과 동일한 lens OSS false 정책 적용. SEL55F18Z는 해당 행이 없어 UNKNOWN/null. 렌즈 OSS와 body IBIS/combined stabilization stops를 섞지 않았다.

14. **최소 촬영거리**: 다음 표 m열. 명시적 AF/MF7쌍은 AF를 대표값으로 사용하고 MF 대안을 conditions에 보존했다. 나머지5개는 공개된 단일 거리이며 AF라고 추정하지 않았다. Sony [촬상면 마크 거리 측정 설명](https://helpguide.sony.net/ilc/1420/v1/en/contents/TP0000226547.html)을 일반 측정 관례로 참조했다. 개별 수치 행이 기준을 다시 명시한 것으로 과장하지 않았고, 렌즈 전면 기준 working distance를 계산하지 않았다.

15. **최대 촬영배율**: 다음 표 x열. AF/MF 분리값과 공식 원문을 provenance/claim conditions에 남겼고 canonical field를 추가하지 않았다. 이번 자료는 모두0.xx배이므로1:X 역수 변환은 필요 없었다.

16. **필터 직경**: 다음 표 mm.14GM은 공식 '-' 및 rear-filter template 맥락이라 숫자 앞필터 지름UNKNOWN.0mm로 기록하지 않았다.

17. **치수**: 다음 표 D×L mm. Unsupported fact로 weight claim conditions와 audit에만 보존했다. Canonical dimensions 확장0.

18. **무게**: 다음 표 g. Standalone lens 수치로 body 제외. 후드/캡 포함 여부는 공식 행에서 명시하지 않아 UNKNOWN이며 body weightBasis를 lens에 새로 만들지 않았다.

| Model | Actual mm | 최대F / 최소F | Focus m (AF / MF) | 최대배율 x (AF / MF) | Filter mm | D×L mm | g |
|---|---:|---|---|---|---|---|---:|
| SEL16F18G | 16 | 1.8 / 22 | 0.15 / 0.13 | 0.25 / 0.3 | 67 | 73.8 × 75 | 304 |
| SEL14F18GM | 14 | 1.8 / 16 | 0.25 (모드 미구분) | 0.1 | UNKNOWN | 83 × 99.8 | 460 |
| SEL20F18G | 20 | 1.8 / 22 | 0.19 / 0.18 | 0.2 / 0.22 | 67 | 73.5 × 84.7 | 373 |
| SEL24F28G | 24 | 2.8 / 22 | 0.24 / 0.18 | 0.13 / 0.19 | 49 | 68 × 45 | 162 |
| SEL24F14GM | 24 | 1.4 / 16 | 0.24 (모드 미구분) | 0.17 | 67 | 75.4 × 92.4 | 445 |
| SEL35F14GM | 35 | 1.4 / 16 | 0.27 / 0.25 | 0.23 / 0.26 | 67 | 76 × 96 | 524 |
| SEL50F14GM | 50 | 1.4 / 16 | 0.41 / 0.38 | 0.16 / 0.18 | 67 | 80.6 × 96 | 516 |
| SEL50F12GM | 50 | 1.2 / 16 | 0.4 (모드 미구분) | 0.17 | 72 | 87 × 108 | 778 |
| SEL50F25G | 50 | 2.5 / 22 | 0.35 / 0.31 | 0.18 / 0.21 | 49 | 68 × 45 | 174 |
| SEL85F14GM2 | 85 | 1.4 / 16 | 0.85 / 0.8 | 0.11 / 0.12 | 77 | 84.7 × 107.3 | 642 |
| SEL55F18Z | 55 | 1.8 / 22 | 0.5 (모드 미구분) | 0.14 | 49 | 64.4 × 70.5 | 281 |
| SEL85F18 | 85 | 1.8 / 22 | 0.8 (모드 미구분) | 0.13 | 67 | 78 × 82 | 371 |

Optical construction groups/elements는 제품별 공식 표 원문을 conditions에 보존했다. Exact-model로 확인한 방진/방습/불소/T*/Nano AR 등의 design 문구는 checkpoint와 product source scope에만 남겼다.14GM/20G/24G/35GM/50GM/50F1.2GM/50G의 이번 선별 근거에서 확정하지 않은 방진/코팅 세부값은 UNKNOWN이며, SPA의 이전 제품 highlight를 복사하지 않았다. 방진방적 보장/IP등급도 추정하지 않았다.

19. **Official source 수**: 신규 raw26개. 제품당2개,35GM/50F1.4GM은 explicit aperture feature를 더해3개. Identity-only도 해당 제품 source count에 포함한다. 기존85F18의 이전 manufacturer reference1개를 보존해 canonical source는3개다. 아래 current batch source와 canonical 전체 source를 구분한다. 일반 거리 정의 Helpguide는 모델 수치 source에 합산하지 않는다.

| Model | 공식 자료 | 이번 batch source | Canonical 전체 source |
|---|---|---:|---:|
| SEL16F18G | [제품](https://www.sony.co.kr/electronics/camera-lenses/sel16f18g) · [사양](https://www.sony.co.kr/electronics/camera-lenses/sel16f18g/specifications) | 2 | 2 |
| SEL14F18GM | [제품](https://www.sony.co.kr/lenses/products/sel14f18gm) · [사양](https://www.sony.co.kr/lenses/products/sel14f18gm/spec) | 2 | 2 |
| SEL20F18G | [제품](https://www.sony.co.kr/lenses/products/sel20f18g) · [사양](https://www.sony.co.kr/lenses/products/sel20f18g/spec) | 2 | 2 |
| SEL24F28G | [제품](https://www.sony.co.kr/lenses/products/sel24f28g) · [사양](https://www.sony.co.kr/lenses/products/sel24f28g/spec) | 2 | 2 |
| SEL24F14GM | [제품](https://www.sony.co.kr/electronics/camera-lenses/sel24f14gm) · [사양](https://www.sony.co.kr/electronics/camera-lenses/sel24f14gm/specifications) | 2 | 2 |
| SEL35F14GM | [제품](https://www.sony.co.kr/lenses/products/sel35f14gm) · [사양](https://www.sony.co.kr/lenses/products/sel35f14gm/spec) · [F1.4 근거](https://electronics.sony.com/imaging/lenses/all-e-mount/p/sel35f14gm?rid=1) | 3 | 3 |
| SEL50F14GM | [제품](https://www.sony.co.kr/lenses/products/sel50f14gm) · [사양](https://www.sony.co.kr/lenses/products/sel50f14gm/spec) · [F1.4 근거](https://www.sony.co.kr/lenses/products/sel50f14gm/feature1) | 3 | 3 |
| SEL50F12GM | [제품](https://www.sony.co.kr/lenses/products/sel50f12gm) · [사양](https://www.sony.co.kr/lenses/products/sel50f12gm/spec) | 2 | 2 |
| SEL50F25G | [제품](https://www.sony.co.kr/lenses/products/sel50f25g) · [사양](https://www.sony.co.kr/lenses/products/sel50f25g/spec) | 2 | 2 |
| SEL85F14GM2 | [제품](https://www.sony.co.kr/electronics/camera-lenses/sel85f14gm2) · [사양](https://www.sony.co.kr/electronics/camera-lenses/sel85f14gm2/specifications) | 2 | 2 |
| SEL55F18Z | [제품](https://www.sony.co.kr/electronics/camera-lenses/sel55f18z) · [사양](https://www.sony.co.kr/electronics/camera-lenses/sel55f18z/specifications) | 2 | 2 |
| SEL85F18 | [제품](https://www.sony.co.kr/electronics/camera-lenses/sel85f18) · [사양](https://www.sony.co.kr/electronics/camera-lenses/sel85f18/specifications) | 2 | 3 |

20. **Source/value conflicts**: 승격된 진짜 값 충돌0, 기존 값 자동 덮어쓰기0.24GM/35GM/50F1.4GM/85GMII 한국 사양의 최대F '1.4k'는 malformed 원문이다. parseFloat나 k제거를 하지 않고,24/85 제품 본문·35 Sony USA static feature·50 Korea feature1의 명시적 F1.4로 근거를 분리했다. 잘못된 문자열은 conditions에 보존하고 numeric claim은 해당 올바른 문구 source가 소유한다.35 USA AI생성 FAQ는 사용하지 않았다. 서로 다른 숫자 claim이 나오면 기존 CONFLICTING_CLAIM_VALUES 차단을 유지한다.

21. **주요 UNKNOWN**:14GM 숫자 앞필터 지름,55ZA OSS, 모든 렌즈 무게의 후드/캡 포함 여부, 단일 거리5개 AF/MF 구분, 확인하지 않은 방진/코팅 세부 조건.120spec claims 중 known118/UNKNOWN2이며 UNKNOWN2는 verified fieldEvidence를 만들지 않았다. AF/MF/액세서리 조건 UNKNOWN은 별도 meta 문맥이다.

22. **기존 model null-fill**:sony-fe-85-f18의 absent model을 공식 SEL85F18로 최초 보강. Verified identity evidence와 reviewed identity-map을 연결하고 --allow-model-null-fill을 명시적으로 사용했다. Model non-null 변경0.

23. **Identity lock**:기존 ID/name/brand/mount/type/aliases/price 보존.12 reviewed mapping만 append했고 기존 registry prefix는 동일하다. Non-null model 변경·alias collision negative 회귀 유지.12 code/ID는 현재 canonical에서 각각 유일하다.

24. **제품별 worker token**: 제품1개=독립 task12개. 공개 Sony 원문과 손으로 작성한 최소 schema만 전송. 전체 canonical/프로젝트 코드/secret 전송0. 아래 호출/재시도/실패는 실제 API 기준이다.

| Model | Input | Output | Total | 호출 / retry / failure |
|---|---:|---:|---:|---|
| SEL16F18G | 828 | 382 | 1210 | 1 / 0 / 0 |
| SEL14F18GM | 801 | 473 | 1274 | 1 / 0 / 0 |
| SEL20F18G | 841 | 333 | 1174 | 1 / 0 / 0 |
| SEL24F28G | 823 | 493 | 1316 | 1 / 0 / 0 |
| SEL24F14GM | 874 | 490 | 1364 | 1 / 0 / 0 |
| SEL35F14GM | 868 | 729 | 1597 | 1 / 0 / 0 |
| SEL50F14GM | 881 | 492 | 1373 | 1 / 0 / 0 |
| SEL50F12GM | 807 | 490 | 1297 | 1 / 0 / 0 |
| SEL50F25G | 823 | 632 | 1455 | 1 / 0 / 0 |
| SEL85F14GM2 | 902 | 342 | 1244 | 1 / 0 / 0 |
| SEL55F18Z | 823 | 531 | 1354 | 1 / 0 / 0 |
| SEL85F18 | 800 | 573 | 1373 | 1 / 0 / 0 |

25. **Worker 합계**:input10,071 / output5,960 / total16,031.12개 public input fixture는 결과 검토/기록 후 삭제했으며 Git에 남기지 않았다.

26. **Retry/failure**:12개 실제 API 모두 첫 시도 성공, retry0/failure0. Dry-run12개 통과는 API 시도에 포함하지 않는다. Task ID와 응답/usage/adopted/discarded는 checkpoint에 보존한다.

27. **Worker 유용성**:focal/filter/weight/focus 추출과1.4k 오류 경고가 유용했다. Worker가 모든 lens OSS를 과도하게 null 처리하거나 prime tele aperture를 null로 두고 unsupported 숫자를 누락한 부분은 main이 공식 근거/기존 계약으로 검토했다.11개 명시적 no-OSS는 false,55ZA만 UNKNOWN; prime endpoint는 동일한 최대F. D×L/배율은 main이 provenance에 보존했다. 패치 자동 적용0.

28. **Main GPT-6.1 Sol 판단**:현행/identity/model generation/ID/기존 여부, source ownership/scope, 모든120spec paths,4 aperture 대체근거, coverage/mount, OSS≠IBIS, AF/MF/배율/weight/UNKNOWN, 전체 human diff, explicit approval와 atomic apply/reapply를 직접 판단했다.

29. **사람 개입량**:추가 end-user 제품 판단/승인 요청0. Main Codex의 review12제품/120spec paths 및 source/meta 조건 검토. 실제 사람 노동분은 측정하지 않아 임의 분수로 환산하지 않았다. Human-readable summary review는 main이 수행했으며 사용자에게 별도 수동 검토를 받았다고 주장하지 않는다.

30. **Normalization 문제**:1.4k는 자동 숫자정규화 대상이 아니다. Prime maximum F를 wide/tele에 반복하는 표현, AF/MF 대표값 선택, dash/absent OSS 구분,14GM filter '-'를0으로 만들지 않는 처리를 기존 policy로 해결했다. Sony SPA에서 이전 제품 highlight가 남을 수 있어 mismatched 문구는 버리고 model/title/정확한 spec table 및 targeted 공식 본문을 확인했다.

31. **Pipeline/schema 신규 문제**:이번12개를 막는 새 pipeline defect나 schema blocker0. Production pipeline/validator/schema 코드 변경0. Unsupported D×L/magnification/coating/weather/minimum selectable F는 현재 표현 한계로 남고 이번 batch에서 억지 확장하지 않았다. Diff는 new-product110(UNKNOWN2포함) +same-value/new-evidence8+specnull-fill2, model null-fill1은별도. Approval은 known118 accept/UNKNOWN2 ignore. Structured identity12 +verified fieldEvidence118.

32. **accessedAt**:26개 모두 raw-helper 자동 생성 실제 UTC ISO timestamp, **2026-10-16T03:25:45.253Z–2026-10-16T03:25:45.281Z** capture clock bounds 안에 있다. Date-only→자정 조작0. 이는 immutable excerpt capture 시각이며 앞서 live browser에서 읽은 시각은 specRetrievedAt/source scope에 따로 보존했다. Capture를 원본 HTTP 요청 시작 시각이라고 주장하지 않는다. 과거 artifact 변경0.

33. **전체 tests**:478/478 통과, 실패/skip0. 신규 production 회귀19/19.

34. **Objective tests**:451/451 통과. tests/*.test.js에서 recommendation-only cameraScenarioEngine/firstPurchaseEngine27개만 제외한 production/catalog/coverage 포함집합이다.

35. **Sony lens tests**:96/96=shared contracts45 +readiness15 +pilot00117 +batch00219. 기존 pilot 회귀 수정/약화0.

36. **기존 body/brand regression**:Sony/Canon/Nikon/Fujifilm/Panasonic/OM/Leica/Sigma/Hasselblad subset246/246. Shared lens contract tests의 기존30sealed transactions/9brands replay도 포함해 통과했다.

37. **Canonical validation**:true. HEAD canonical bytes=transaction before, live canonical bytes=transaction after를 확인했다. Before SHA ee99e92bf6d90a9f21353f4f1557f3546309824a4ee191446d95862580d706b5. **After SHA c853a3f834890184df74aebc76f8c7ecc10fd56f2a2876f27f3e36ecff3ddb66**.

38. **build/node/diff**:pnpm build 성공. 새 회귀와 scripts/objective/*.mjs8파일 node --check 성공, git diff --check 및 신규 파일 trailing whitespace 검사 성공. 기존 Vite >500kB chunk 경고 유지(JS1026.74kB); 추천/UI 변경으로 다루지 않았다.

39. **실제 idempotency**:production CLI apply 재실행 결과 **already-canonicalized / canonicalMatches:true**. 하나의12-item journal,approval,original artifact digests,exact before→after/after→after replay,registry prefix,source/content/claim/staging/diff digests 검증 통과. Sealed001 및 기존 브랜드 artifact 불변.

40. **git status**:미commit 변경 상태. Tracked modified3파일 / untracked49파일(raw26/staging12/transaction4/approval2/manifest1/diff1/checkpoint1/report1/test1). Modified: docs/OBJECTIVE_DB_V04_PROGRESS.md,src/data/cameraProducts.json,src/data/ingestion/identity-map.json. New: 이 보고서,batch002 checkpoint/manifest/diff/approval pointer+immutable approval/raw26/staging12/transaction archive,tests/sonyLensProduction002.test.js. Worker fixture/secret/추천/UI/기존sealedartifact 변경0. Commit/push0. 다음 batch는 완료 변경을 검토·commit한 뒤 clean 확인이 먼저다.

41. **Family별 미처리**:당시 snapshot의67current에서 실제001/002 product code를 제외한50개다. 다음 batch 시작 시 현행 여부를 다시 확인한다.

| Family | 잔여 |
|---|---:|
| FE primes | 8 |
| APS-C | 9 |
| FE wide/standard/telephoto zooms | 24 |
| Special-family review | 9 |

42. **다음 권장 family**:remaining FE primes8개. 일반 family 잔여8개를 임의로 특수제품과 섞어10개로 채우지 않는다. 이후 APS-C9,FE zoom12+12,특수9preflight. 계획이며 다음 제품 작업을 이번에 시작하지 않았다.

43. **예상 구조적 위험**:special STF의 T-stop≠F-number,macro배율,supertele tripod/hood/weight 조건,cinema/PZ 조건은 별도 preflight가 필요하다. 기존70–200GMII/PZ16–35F4의 model-null-fill은 explicit approval 필요. Source 오기/SPA stale highlight/OSS UNKNOWN/AF·MF 조건은 제품별 review를 계속한다. 기존 contract가 표현하지 못하는 구조가 나오면 해당 제품 보류/별도 설계이며 안전장치를 우회하지 않는다.

44. **67개 완료까지 batch 추정**:현재50개는 아래 **5개 family production batch+최종fresh coverage audit** 계획이다. 모든 향후 제품의 구조적 문제가 없다는 보장은 아니며 special preflight/현행 변동에 따라 추가 분할할 수 있다.

- **production-sony-e-lenses-003 / FE primes / 8개**: SEL35F28Z, SEL85F14GM, SEL35F18F, SEL135F18GM, SEL28F20, SEL35F14Z, SEL50F14Z, SEL50F18F
- **production-sony-e-lenses-004 / APS-C / 9개**: SEL15F14G, SEL11F18, SEL1655G, SEL70350G, SELP18105G, SEL20F28, SEL24F18Z, SEL50F18, SEL55210
- **production-sony-e-lenses-005 / FE wide/standard/telephoto zooms / 12개**: SEL100400, SEL50150GM, SEL400800G, SEL2870GM, SEL1625G, SEL2450G, SEL1635GM2, SEL70200G2, SEL2070G, SELP1635G, SEL70200GM2, SEL1224GM
- **production-sony-e-lenses-006 / FE wide/standard/telephoto zooms / 12개**: SEL70200G, SEL70200GM, SEL200600G, SEL24105G, SEL1635GM, SEL1224G, SEL100400GM, SEL24240, SEL2470GM, SEL2470Z, SELP28135G, SEL70300G
- **production-sony-e-lenses-007 / Special-family review / 9개**: SEL100400MC, SEL100M28GM, SEL300F28GM, SELC1635G, SEL100F28GM, SEL600F40GM, SEL400F28GM, SEL30M35, SEL50M28 — 특수 광학/무게/시네마 조건을 먼저 검토, 필요하면 분할.

## 검증 명령과 재개

- 전체: pnpm test
- Lens: node --test tests/sonyLens*.test.js tests/objectiveLensContracts.test.js
- 신규: node --test tests/sonyLensProduction002.test.js
- Objective: 모든 *.test.js에서 cameraScenarioEngine.test.js/firstPurchaseEngine.test.js 제외
- 기존 body/brand: ^(sonyProduction|canon|nikon|fujifilm|panasonic|omSystem|leica|sigma|hasselblad).*\.test\.js$
- pnpm build / 변경회귀+scripts/objective/*.mjs node --check / git diff --check
- 실제재적용: node scripts/objective/ingest.mjs apply --batch production-sony-e-lenses-002

**이번 batch는 완료.**12개 재수집/worker 재호출/raw 재생성/기존artifact수정 불필요. 향후 batch가 registry를 append해도 본 회귀는 archived registry digest+current prefix를 비교하며 과거 whole-file registry를 현재 파일과 동일하다고 강제하지 않는다.
