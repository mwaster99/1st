# Objective DB v0.4 — 수집 파이프라인 기술 설계

상태: 기본 설계 및 Stage 1–4 구현 완료. 현재 동작의 기준은 `src/data/cameraProducts.json`과 이를 읽는 `src/cameraCatalog.js`다. 실행 순서와 작업 범위는 [OBJECTIVE_DB_V04_PLAN.md](./OBJECTIVE_DB_V04_PLAN.md)에, 첫 production batch 이후 확정된 multi-source 및 선택 필드 계약은 [OBJECTIVE_DB_V04_FIELD_CONTRACTS.md](./OBJECTIVE_DB_V04_FIELD_CONTRACTS.md)에 둔다.

## 1. v0.3 기준과 설계 경계

- `cameraProducts.json`의 `schemaVersion: 1`에 바디 37개, 교환렌즈 36개가 있다. 제품별 `id`, 이름/별칭, 마운트, 사양, 신품·중고 가격, `sources`, `legacyFields`를 보유한다. 고정렌즈 카메라는 바디이며 `mount: null`과 `specs.fixedLens`를 쓴다.
- `cameraLegacyPolicy.json`은 이전 시연용 점수·태그·첫 구매 구성·추가 구매 정책이다. 객관 제품값이 아니므로 수집 파이프라인의 병합 대상에서 제외한다.
- `cameraCatalog.js`는 제품 JSON을 호환 뷰로 바꾸고 KRW 원 단위 가격을 기존 엔진의 만원 단위로 환산한다. `cameraCatalogViews.js`, `cameraData.js`와 세 플로우는 이 뷰를 소비한다. 미등록 장비의 `unknown-*` ID 및 고정렌즈의 `*-integrated-lens` ID는 정식 제품 ID가 아니다.
- 현행 `sources[].fields`는 때로 `specs.sensor`처럼 객체 전체를 가리킨다. 출처 URL·접근일은 있으나 원문 위치, 원본 값/단위, 적용 지역·변형, 변경 이력 및 개별 값의 검토 결정을 재현하기 어렵다. `legacyFields`는 미검증 값을 구별하지만 후속 검증의 체크포인트는 아니다.
- 신제품 다수의 가격은 `null`이고 기존 가격 일부는 `legacy-unverified`다. 수집 단계에서 이를 추정값이나 임의의 현재 시세로 채우지 않는다.
- 제품 수가 늘면 단일 JSON에 대한 동시 수정 충돌, 이름/별칭 충돌, 근거가 다른 값의 덮어쓰기, 고정된 테스트용 마운트 목록, 브라우저 번들 및 추천 후보 수 증가가 별도 문제가 된다. 파이프라인은 앞의 데이터 무결성을 다룬다. 런타임 성능은 실제 규모를 측정한 뒤 분할/사전 필터링을 검토한다.

## 2. 최소 구조와 소유권

Node.js ESM 스크립트와 버전 관리되는 JSON만 사용한다. 서버 DB, 별도 백엔드, 크롤러 프레임워크, 메시지 큐는 현재 필요하지 않다. 수집은 사람 또는 도구가 공식 근거를 확인해 구조화한 raw 기록으로 시작한다. 공식 사이트 HTML/PDF 전체를 복제하지 않고 URL, 문서 버전, 원문 위치와 필요한 사실만 남긴다.

```text
src/data/cameraProducts.json                 기존 서비스용 canonical; 유일한 제품값 원본
src/data/cameraLegacyPolicy.json             기존 시연 정책; ingestion 대상 아님
src/data/ingestion/
  vocab.json                                 승인된 브랜드/마운트/제품 종류/무게 기준
  identity-map.json                          제조사 코드·기존 ID·검토된 별칭 연결
  batches/<batchId>.json                     제품별 상태와 재개 체크포인트
  raw/<sourceId>.json                         batch 사이에 공유하는 불변 출처 관찰
  staging/<batchId>/<itemKey>.json            정규화된 제품 후보와 필드별 claim
  diffs/<batchId>.json                        검토 가능한 canonical 변경안
  prices/<batchId>.json                       가격 관찰 기록; 가격 단계에서 사용
scripts/objective/ingest.mjs                 status/normalize/validate/diff/apply CLI
scripts/objective/rules.mjs                  스키마·단위·규칙과 오류 분류
scripts/objective/merge.mjs                  결정적 diff·충돌 검사·원자적 병합
scripts/objective/raw-helper.mjs             raw evidence/source ID 반복 작성 도우미
tests/objectiveIngest.test.js                파이프라인 경계·재실행·복구 테스트
tests/objectivePipelineContracts.test.js     multi-source·선택 필드·요약 회귀 테스트
```

위 핵심 경로는 현재 구현되어 있다. `ingestion/`은 Vite 런타임에서 import하지 않는다. 현행 `cameraProducts.json`의 제품 배열·필드·ID를 유지하고, 필요할 때만 검증 메타데이터를 선택적 필드로 더한다. 단일 canonical JSON의 병합은 직렬로 수행한다. 브랜드별 raw/staging 작업은 독립적으로 진행할 수 있다.

## 3. 자료 계약: Raw → Staging → Canonical

### Raw: 확인 가능한 관찰

raw 파일은 출처 문서/페이지의 특정 버전에서 확보한 **불변 근거 발췌**를 표현한다. 최소 필드: `sourceId`, `sourceType`, `url`, `publisher`, `documentTitle`, `documentVersion`(없으면 `null`), `region`, `accessedAt`(UTC ISO 시각), `contentDigest`, `observations[]`. 각 observation은 제조사 모델 코드 또는 임시 item key, 원문 위치(`page`/`section`/표 제목 중 하나), `fieldHint`, 원래 문자열·숫자·단위, 적용 조건(국가, 색상, 마운트형, 펌웨어, 측정 구성)을 기록한다. 원문에 없는 값은 기록하지 않는다. `contentDigest`는 저장한 근거 발췌의 digest이며 대상 범위를 명시한다. `sourceId`는 정규화 URL·지역·문서 버전·발췌 범위·내용 digest에서 결정적으로 만든다. 같은 발췌를 다시 읽어도 같은 ID다. 여러 batch가 같은 `sourceId`를 참조하면 raw 파일 하나를 공유한다. 문서 내용이나 발췌 범위가 바뀌면 새 raw 파일과 새 ID를 만든다.

### Staging: 해석과 검증의 장소

제품 후보는 `itemKey`, 기존/제안 `productId`, 정규화된 정체성, `claims[]`, `issues[]`로 구성한다. 한 item에 raw source가 여러 개면 각 source의 fragment를 정체성 일치 검증 후 하나로 결합하고 `sources[]` registry를 만든다. 단일 source는 과거 archive 호환을 위해 기존 `source` 형태를 유지한다. 각 claim의 최소 계약은 다음과 같다.

```json
{
  "claimId": "결정적 해시",
  "path": "specs.weight",
  "value": 659,
  "unit": "g",
  "rawValue": "1 lb 7.3 oz",
  "rawUnit": "lb/oz",
  "sourceId": "source-id",
  "locator": { "section": "Specifications", "row": "Weight" },
  "conditions": { "region": "KR", "variant": null, "weightBasis": "battery-and-card" },
  "verification": "pending",
  "reviewedAt": null,
  "reviewer": null
}
```

예시는 구조 설명이며 실제 특정 제품의 검증값이 아니다. `claimId`는 제품 ID, **정확한 leaf 경로**, 정규화 값·단위·조건, `sourceId`, 원문 위치의 안정적 직렬화에서 산출한다. staging의 허용 상태는 `pending`, `verified`, `rejected`, `conflict`다. `verified`는 모델이 그럴듯하다고 판단했다는 뜻이 아니라 사람이 원문 위치와 제품 변형을 확인했다는 뜻이다. 원본이 애매하면 `pending` 또는 `rejected`로 둔다. 동일 경로·동일 값의 여러 claim은 복수 근거로 보존하고, 동일 경로에 서로 다른 값이 오면 충돌로 승격을 차단한다.

### Canonical: 서비스에 제공할 사실

현행 `schemaVersion: 1`, `bodies[]`, `lenses[]`와 기존 제품 필드는 유지한다. 다음 표가 v0.4의 **쓰기 계약**이다. 기존 JSON에 이미 있는 필드를 삭제하거나 이름을 바꾸지 않는다.

| 경로 | canonical 형태와 규칙 |
| --- | --- |
| `schemaVersion` | 현재 숫자 `1`; 필수 필드 개편이 없는 동안 유지 |
| `bodies[].id/name/brand/series/model/aliases` | 안정적 문자열 ID, 표시명, 제조사·시리즈·모델명, 문자열 별칭 배열; ID와 검색 정규화 별칭은 전 제품에서 고유 |
| `bodies[].kind/bodyStyle/mount` | `interchangeable|fixed|dslr`, `slr|rangefinder|compact`, 승인된 마운트 또는 고정렌즈의 `null` |
| `lenses[].id/name/brand/aliases/mount/type` | 안정적 ID·표시명·제조사·별칭·승인된 마운트·`prime|zoom`; 렌즈에 바디 전용 `kind/bodyStyle`을 복사하지 않음 |
| `*.specs` | 현행 중첩 구조 유지. 바디의 sensor/weight/weightBasis/bodyOnlyWeight/dimensions/autofocus/video/batteryShots/fixedLens 등, 렌즈의 focal/aperture/weight/stabilization/filterMm/minFocusM 등. 미확인은 해당 leaf에 `null` |
| `*.price.new` | `{value,currency,asOf,sourceType,sourceUrl}`; KRW 원 요약, 값 미확인은 `null` |
| `*.price.used` | `{low,typical,high,currency,asOf,sourceType,sourceUrl}`; 같은 조건의 가격 범위, 각 값 미확인은 `null` |
| `*.sources[]` | 기존 `{url,type,accessedOn,fields,note}` 유지; 공식 사양 근거만 담고 새 항목은 `sourceId`·문서 버전 및 정확한 leaf 경로를 선택적으로 추가 |
| `*.legacyFields[]` | 현행처럼 `specs`를 기준으로 한 **상대 경로**의 미검증 값 목록; `sources[].fields`/claim/`fieldEvidence`는 제품 최상위에서 시작하는 **전체 경로** |
| `*.fieldEvidence` | v0.4가 확인한 leaf에 한해 추가하는 선택적 검증 메타데이터; 값 자체는 다시 저장하지 않음 |

처음에는 기존 제품에 일괄 메타데이터를 소급 생성하지 않는다. v0.4가 다룬 필드에 한해 선택적 `fieldEvidence`를 붙일 수 있다.

```json
"fieldEvidence": {
  "specs.weight": {
    "verification": "verified",
    "claimIds": ["claim-id"],
    "checkedAt": "2026-09-18"
  }
}
```

`fieldEvidence`는 값의 복사본이 아니라 검증 상태와 근거 링크다. `verified`는 정확한 leaf claim이 있어야 하며 `legacy-unverified`는 기존 값을 보존하되 공식 확인으로 재표시하지 않는다. `unknown`은 값이 `null`이거나 아직 기록되지 않은 경우다. 충돌/거절은 canonical에 쓰지 않고 staging·diff에 남긴다. 기존 `sources[]` 형식은 유지하면서 새로 확인한 값은 정확한 leaf 경로를 `fields[]`에 넣고 가능하면 `sourceId`·문서 버전을 추가한다. 기존의 넓은 `sources[].fields`는 이행 전까지 그대로 읽되 새 검증으로 소급 인정하지 않는다. `legacyFields`에 부모 객체 경로가 있으면 그 객체의 미검증 leaf로 먼저 펼쳐서 관리한다. 실제 검증한 leaf만 제거하고 남은 leaf는 보존한다. `identity`처럼 기존의 특수 필드는 호환을 위해 허용하지만 신규 claim은 구체적인 경로를 사용한다.

## 4. 출처 우선순위와 field-level provenance

제품 정체성과 물리 사양은 해당 제조사의 공식 사양표/기술 매뉴얼을 우선하고, 공식 제품 페이지·지원 문서를 그다음 근거로 쓴다. 원본 지역·개정·제품 변형을 함께 판단한다. 제조사 문서끼리 충돌하면 단순히 날짜가 최신인 값을 자동 선택하지 않는다. 판매점 자료는 **실제 판매가격**의 근거가 될 수 있으나 제조사 물리 사양을 확정하지 않는다. 중고 플랫폼의 완료 거래는 중고가격 관찰 근거이며 진행 중인 호가와 구분한다. 리뷰·사용담·AI 생성 문장은 객관 사양의 검증 근거가 아니다.

검증은 제품 단위가 아닌 필드 단위로 한다. 출처 URL만 있거나 한 필드가 맞다는 이유로 나머지 제품 전체를 `verified`로 바꾸지 않는다. claim은 `path + value + sourceId + locator + conditions`를 보유하고, diff는 그 연결을 보존한다. 수집 일시(`accessedAt`), 출처 문서 버전, 가격 관찰일(`asOf`)을 구분한다. 검토자는 모호한 문서·상이한 공식 문서·지역별 표기를 `issues`에 남기고, 채택 근거와 기각 근거를 diff에 기록한다.

## 5. ID, 모델명, 별칭

- 기존 `id` 73개는 영구 키다. 표기나 스펙이 바뀌어도 재생성하지 않는다. 신규 ID는 소문자 ASCII `brand-model[-generation][-variant]` 형태로 검토자가 확정한다. 현재의 `sony-a7-iv` 같은 형식을 존중한다. URL·이름 문자열만으로 ID를 자동 발급하지 않는다.
- 동일 브랜드의 지역명, 마케팅명, 제조사 모델 코드, 별칭은 `identity-map.json`에 연결한다. 제조사 모델 코드와 명시된 변형이 가장 강한 식별 근거다. 그다음 검토된 ID 매핑, 브랜드+모델+종류+마운트 일치 순으로 확인한다. 유사 문자열 매칭은 **후보 제안만** 한다.
- 다른 센서·마운트·세대·핵심 사양을 가진 변형은 별도 제품 ID다. 색상처럼 동일 사양인 변형도 출처 조건을 지우지 않는다. 정체성이 애매하면 수집은 가능하지만 canonical 승격을 막는다.
- `name`, `model`, `aliases`, `brand + model`을 현행 `normalizeCameraSearch`와 같은 규칙으로 정규화하여 전체 제품 간 충돌을 검사한다. 중복 별칭을 임의로 한쪽에 부여하지 않는다. `unknown-*` 및 `*-integrated-lens`는 공식 제품 ID로 예약/승격하지 않는다.
- 삭제/통합이 필요해지면 과거 ID를 재사용하지 않고 향후 별도의 tombstone/redirect 기록을 추가한다. Experience DB의 참조가 생긴 뒤에는 특히 ID 변경을 금지한다.

## 6. 단위와 측정 조건

정규화는 raw 값·원래 단위·변환식을 보존한다. canonical 단위는 현행 구조에 맞춘다: 무게 g, 크기 `[너비, 높이, 깊이]` mm, 렌즈 실초점거리 mm(`equivalentFocal`과 혼동 금지), 조리개 F 수치, 필터 직경 mm, 최단 초점거리 m, 유효 화소 수 MP, 가격 KRW 원 정수. 변환은 inch→mm `×25.4`, cm→mm `×10`, kg→g `×1000`, oz→g `×28.349523125`처럼 명시된 식을 사용하고 출처 자릿수보다 허위 정밀도를 늘리지 않는다. 총 화소와 유효 화소, 본체 치수와 돌출부 포함 치수, CIPA 조건이 다른 배터리 장수는 같은 필드로 합치지 않는다. 환율 추정값을 KRW canonical 가격에 넣지 않는다.

`specs.weight`는 **작동 구성의 무게**로 유지하고 `specs.weightBasis`로 기준을 분명히 한다. 기존에 확인된 `battery-and-card`, `battery`, `battery-internal-storage`를 보존한다. 본체 단독 수치만 있으면 `specs.bodyOnlyWeight`에 넣고 `specs.weight`는 `null`로 둔다. 카드·배터리·내장 저장소·그립 포함 여부, 렌즈 마운트/색상별 차이를 claim 조건으로 기록한다. 기준이 다른 무게끼리는 데이터 수집 단계에서 억지로 환산하거나 ‘개선’이라고 인증하지 않는다. 현재 추천 엔진은 숫자 무게를 비교하므로 비교 기준 차이가 사용자 결과에 영향을 줄 수 있다. 엔진의 표시/비교 개선은 별도 기능 작업이며 이 파이프라인 설계가 자동으로 해결하지 않는다.

## 7. 가격과 시계열

`price.new`·`price.used`는 기존 서비스가 읽는 **요약값**으로 유지한다. 관찰 자료는 별도 `prices/<batchId>.json`에 append-by-ID 방식으로 둔다. 한 관찰은 `observationId`, `productId`, `condition`(new/used), `channel`(manufacturer/retailer/used-market), 판매자·지역·구성품·중고 상태등급, 원화 금액, 통화, 실제 가격 관찰일 `observedOn`, `capturedAt`, 출처 URL/근거 위치, 거래 완료 여부를 가진다. `observationId`는 제품·채널·판매자·관찰일·상태·구성·금액·출처에서 결정해 재수집 중복을 막는다. 재실행 때 모든 기존 가격 batch에서 같은 ID가 발견되면 새 기록을 쓰지 않고 기존 관찰을 참조한다. 가격이 바뀌면 새 관찰이다.

신품 MSRP와 소매 실판매가를 구분한다. 중고 호가와 완료 거래를 섞지 않는다. 요약 갱신 규칙은 나중에 충분한 표본이 있을 때 버전과 함께 고정한다. 첫 버전은 동일 SKU·지역·구성/등급의 검증된 완료 거래가 최근 90일에 최소 5건일 때만 중고 `low/typical/high`를 각각 최솟값/중앙값/최댓값으로 산출하는 보수적 제안이다. 표본 부족·통화 불일치·근거 불명은 `null` 또는 기존 `legacy-unverified` 보존이다. 가격 요약을 갱신할 때 `price`의 기존 `sourceType`/`sourceUrl`/`asOf`와 함께 `fieldEvidence`의 해당 가격 leaf에 `observationIds`·집계 버전·검토일을 기록하고, 표본 ID와 계산 내역을 diff에 남긴다. 판매점/중고 자료를 제조사 사양용 `sources[]`에 섞지 않는다. 이전 관찰을 덮어쓰지 않는다. 통화 변환이 필요한 자료는 원 통화 관찰로만 보존하고 환율·기준일 정책이 정해질 때까지 KRW 요약에 반영하지 않는다.

## 8. UNKNOWN/null과 검증 규칙

`null`은 모름/근거 없음이다. `false`는 공식 자료가 그 기능이 없음을 명시한 경우, `0`은 실제 0인 경우에만 쓴다. 문서에서 항목을 찾지 못한 것은 `false`가 아니다. 누락된 가격을 무료로, 누락된 무게를 0g으로 바꾸지 않는다. 모호한 센서·AF·동영상 세부 값은 추측하지 않는다.

검증 단계는 다음 순서로 실행하며 오류는 canonical 승격을 막고 경고는 검토 목록에 남긴다.

| 게이트 | 차단 조건의 예 | 경고/수동 확인의 예 |
| --- | --- | --- |
| JSON/스키마 | 필수 identity 누락, 비정상 타입, 정의되지 않은 leaf 경로 | 선택 사양 미수집 |
| 식별 | ID·정규화 별칭 중복, `unknown-*`를 신규 제품으로 사용, 불명확한 변형 | 비슷한 모델명 |
| 도메인 | 허용되지 않은 마운트/종류, 고정렌즈의 교환 마운트, 순서 뒤집힌 치수·초점·가격 범위 | 공식 문서별 수치 차이 |
| 단위/기준 | 근거 없는 변환, weight와 weightBasis 불일치, bare weight를 장착 무게로 복사 | 측정 방식이 다른 제품 간 비교 |
| 출처 | verified claim에 URL·원문 위치·raw 연결 없음, source ID/digest 불일치, 출처가 다른 변형 | 기존 광범위 `sources[].fields` |
| 가격/정책 | KRW 요약에 외화/무근거 날짜 사용, 주관 점수·역할을 Objective JSON에 입력 | 가격 표본 부족, 오래된 값 |
| 회귀 | 기존 canonical 값의 무승인 삭제·덮어쓰기, 정체성 변경, 필수 테스트 실패 | 대규모 배열/번들 증가 |

`vocab.json`은 현행 마운트와 신규 마운트의 승인 절차를 제공한다. 기존 `cameraCatalog.test.js`에는 하드코딩된 마운트·제품 수 범위가 있으므로 Hasselblad 등 확장 전에 테스트를 registry 기반 불변식으로 바꾸되, 기존 데이터 검증 수준을 약화시키지 않는다.

## 9. canonical diff, 적용, 재실행

`diff`는 canonical의 제품별 digest와 staging claim을 비교해 `new-product`, `null-fill`, `same-value/new-evidence`, `value-conflict`, `identity-or-alias-change`, `price-observation-only`, `removal`로 분류한다. 각 행에 제품 ID, 경로, 기존/제안 값과 단위, 출처·claim ID, 조건, baseline digest, 검토 결정을 넣는다. `same-value/new-evidence`는 근거만 추가할 수 있지만, 서로 다른 verified 값은 자동 갱신하지 않는다. 오래된 미검증 값과 공식 검증값의 교체도 사람이 diff에서 승인한 경로에 한정한다. 삭제는 기본 거부한다.

`apply`는 검증 통과와 검토자·시각·필드별 채택/기각 이유를 기록한 승인 diff, 현재 canonical digest가 diff 당시 baseline과 일치할 때만 실행한다. 기존 배열 순서와 미접촉 필드는 유지하고 새 제품만 ID순으로 덧붙여 결정적인 결과를 만든다. 적용 직전에 baseline digest와 예상 결과 digest를 manifest에 기록하고 임시 파일 작성 후 원자적 교체를 사용한다. 재개 시 실제 digest가 baseline이면 아직 적용 전, 예상 결과와 같으면 적용 후로 판정한다. 둘 다 아니면 다른 변경이 섞인 것이므로 중단하고 재diff한다. 다른 batch가 먼저 canonical을 변경했다면 재diff·재검토한다. 반복 실행 시 동일 raw/source/claim/price observation을 중복 추가하지 않고 canonical 바이트 변화가 없어야 한다. 모든 digest는 같은 키 정렬/직렬화 규칙으로 계산한다. canonical 쓰기는 한 번에 한 batch만 허용한다.

## 10. 배치 상태, 체크포인트, 재개

상태는 **batch 안의 제품별 item**에 저장한다. 배치 전체 상태는 item 상태에서 계산한다. 필수 상태 전이는 `pending → collected → normalized → validated → canonicalized`이고, 승격 전 어느 단계에서든 `rejected`가 될 수 있다. `rejected`는 삭제가 아니라 오류·기각 사유·원본을 보존하는 상태다. 새 근거나 수정된 매핑으로 재시도할 때 `attempt`를 늘리고 기존 artifact를 보관한다. 이미 canonicalized한 제품의 수정은 같은 batch를 되돌리지 않고 후속 batch로 제출한다.

```json
{
  "batchId": "body-sony-current-001",
  "scope": "Sony 현행 바디",
  "tier": 1,
  "baselineCommit": "git-commit-id",
  "items": [{
    "itemKey": "manufacturer-model-code-or-reviewed-key",
    "productId": "existing-or-proposed-id",
    "state": "normalized",
    "attempt": 1,
    "sourceIds": ["source-id"],
    "rawDigests": ["digest"],
    "stagingDigest": "digest",
    "diffDigest": null,
    "disposition": null,
    "issues": [],
    "updatedAt": "UTC-ISO-time"
  }],
  "lastSuccessfulGate": "normalize",
  "canonicalBaselineDigest": "digest",
  "expectedCanonicalDigest": null,
  "canonicalAfterDigest": null,
  "commitTrailer": "Objective-Batch: body-sony-current-001"
}
```

manifest는 각 게이트를 통과한 후 원자적으로 기록한다. `status`는 item별 현재 상태, 저장된 artifact/digest, 차단 오류, 다음 명령, canonical 변경 여부, Git 커밋 여부를 보여준다. `collected` 뒤 중단 시 raw에서, `normalized` 뒤 중단 시 staging에서, `validated` 뒤 중단 시 승인된 diff에서 재개한다. 산출물 digest가 맞지 않으면 해당 게이트부터 재실행한다. `apply` 직후 프로세스가 종료되었다면 실제 canonical digest를 사전에 저장한 baseline/예상 결과 digest와 대조해 중복 적용 없이 테스트/커밋 단계로 간다. Git 커밋 후 manifest에 커밋 해시를 다시 쓰지 않는다. 배치 종료 여부는 각 item이 `canonicalized`이거나, `rejected`이고 사유·`disposition: deferred|permanent`·후속 batch ID(보류 시)가 기록되었는지, 그리고 지정된 테스트/빌드 성공 및 `Objective-Batch: <batchId>` 커밋 트레일러로 판정한다. 미해결 `rejected` item이 있으면 일부를 무심코 완료로 표시하지 않는다.

예정 CLI는 `node scripts/objective/ingest.mjs status [--batch ID]`, `normalize`, `validate`, `diff`, `apply`다. `status`는 읽기 전용이다. 수집 자체는 공식 자료 확인 후 raw 파일을 작성하는 명시적 단계로 시작하며 대량 자동 수집은 첫 버전 범위 밖이다. 각 데이터 batch의 종료 단위는 **수집 → 정규화 → validation → canonical diff 검토 → 테스트/빌드 → commit**이다.

## 11. Experience DB와 호환성

미래 Experience DB의 외래 키는 변경되지 않는 canonical `productId`다. 경험 기록은 `experienceId`, `productId`, 사용자/작성 맥락, 사용 기간, 촬영 상황, 관찰 시점, 주관 평가 및 출처를 별도 저장한다. 객관 사양의 `fieldEvidence`나 `cameraLegacyPolicy.json`에 경험을 섞지 않는다. 실제 정식 제품 ID만 참조한다. 미등록 장비는 검토 후 제품 ID에 연결하고, 가상 내장 렌즈 ID는 참조 대상에서 제외한다. 향후 단종/병합은 tombstone/redirect와 참조 무결성 테스트로 처리한다. v0.4에서는 이 **연결 계약만** 정하고 Experience DB 자체는 만들지 않는다.

초기 v0.4는 `schemaVersion: 1`을 유지한다. `cameraProducts.json`은 기존 읽기 코드가 그대로 import하며, 선택적 메타데이터는 기존 `cameraCatalog.js`/엔진이 무시할 수 있다. `toLegacyPrice`의 원→만원 변환, `null` 가격, 기존 5개 첫 구매 구성·추가 구매 정책, 고정렌즈의 합성 렌즈 처리, 기존 제품 ID를 보존한다. 파이프라인 변경과 추천 엔진 변경을 같은 배치에 묶지 않는다. 필수 필드 변경이 실제로 필요해질 때만 명시적 `schemaVersion` 승격, 이행 스크립트, 전후 회귀 테스트를 별도 작업으로 수행한다.
