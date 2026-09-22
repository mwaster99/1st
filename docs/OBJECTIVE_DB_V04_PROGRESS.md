# Objective DB v0.4 진행 기록

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
