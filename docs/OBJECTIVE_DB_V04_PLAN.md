# Objective DB v0.4 — 구현·수집 작업 계획

상태: 설계안. 이 세션의 결과물은 이 문서와 [기술 설계](./OBJECTIVE_DB_V04_ARCHITECTURE.md)뿐이다. 제품 JSON, 코드, 테스트, 대량 제품 자료는 이번 세션에서 수정하지 않는다.

## 목표와 완료 판정

v0.4의 첫 목표는 제품 수를 즉시 늘리는 것이 아니라, **출처가 확인된 필드만 반복 가능하게 canonical로 승격하고 중단 지점에서 재개하는 절차**를 만드는 것이다. 기존 `cameraProducts.json`은 계속 서비스가 읽는 canonical이다. 첫 구현 세션에서 제품 수, 추천 결과, UI가 바뀌면 범위를 넘은 것이다.

최종적으로 한 제품 또는 한 batch에 대해 다음을 제시할 수 있어야 한다: 원본 URL/위치와 관찰 시점, 원본 단위와 정규화 값, 제품 ID 판정, 필드별 검증 상태, 이전 canonical과의 차이, 승인/기각 이유, 테스트 결과, 배치 커밋, 그리고 재실행 시 중복 없음. 사용량 제한으로 종료되어도 다음 세션은 manifest와 `status`만 읽어 이어갈 수 있어야 한다.

## 1. 단계별 구현 범위

| 단계 | 작업 규모 | 만들 것 | 종료 조건 |
| --- | --- | --- | --- |
| 1. 읽기 전용 골격 | 기존 제품 **1개**, 공식 자료 **1건**; 제품 추가 0 | `vocab.json`, `identity-map.json`, batch/raw/staging/diff 파일 계약; `status`, `normalize`, `validate`, `diff` 명령; 해시·단위·ID·출처 검증 테스트 | 기존 제품에 대한 no-op 또는 근거만 추가하는 **읽기 전용** diff가 결정적으로 재생성됨. `cameraProducts.json` 변경 0. 기존 테스트/build 통과 |
| 2. 안전한 승격과 복구 | 기존 제품 **1–2개**의 leaf 몇 개; 새 제품 최대 1개 | 승인된 diff의 `apply`, 원자적 쓰기, 충돌 차단, manifest 게이트, 중단/재개, commit 판정 | 같은 batch를 두 번 실행해도 canonical·source·claim 중복 0. 적용 전후 digest/테스트/배치 커밋 확인 |
| 3. Tier 1 현행 바디 | 브랜드당 **5–10개**, 독립 batch | 공식 출처 우선 수집, 기존 제품 재검증, 신규 제품 식별, 마운트 vocabulary 확장 | 브랜드별 batch가 수집→정규화→검증→diff 검토→테스트→커밋으로 개별 종료 |
| 4. Tier 1 렌즈와 서드파티 | 마운트·제조사당 **8–15개**, 독립 batch | 순정/서드파티 렌즈의 마운트·변형·초점/조리개/무게 검증 | 동명 렌즈의 마운트별 ID/별칭 충돌 없이 개별 batch 종료 |
| 5. Tier 2·3 및 가격 관찰 | 단종 **5–8개**, legacy **3–5개**씩; 가격은 소규모 별도 batch | 오래된 공식 매뉴얼/지원 문서, 가격 관찰·시계열·요약 정책, bundle/performance 측정, Experience DB의 ID 참조 계약 점검 | 미검증을 검증으로 위장하지 않음. 가격 표본 부족은 `null` 유지. 기존 엔진 회귀 및 재개 테스트 통과 |

단계 3–5는 데이터 규모와 근거 발견 난이도에 따라 더 잘게 나눈다. 단계 2까지의 파이프라인 안정성이 입증되기 전에는 브랜드별 대량 입력을 시작하지 않는다. 권장한 개수는 **한 번에 검토·커밋할 상한 목표**이며 부족한 공식 자료를 채우려고 추측하지 않는다.

### 첫 구현 세션의 정확한 종료선

다음 구현 요청에서 첫 세션은 **단계 1만** 수행한다. `src/data/ingestion/`의 최소 vocabulary/identity/manifest와 기존 제품 1개에 대한 작은 raw fixture를 만들고, `scripts/objective/`에 읽기 전용 `status`, `normalize`, `validate`, `diff`를 구현한다. 단위·출처 위치·ID/alias·결정적 해시·재실행 no-op을 테스트한다. 결과 diff는 파일로만 출력한다. `apply`, canonical 쓰기, 가격 집계, 브랜드 대량 수집, 추천 엔진/UI 수정, Experience DB 생성은 **첫 세션의 작업이 아니다**. `pnpm test`, `pnpm build`, `git diff --check`를 통과시키고 파일 목록·미완료 게이트를 보고하면 종료한다.

## 2. Tier 판정과 수집 순서

Tier는 수집 우선순위이며 추천 점수/품질 등급이 아니다.

| Tier | 대상과 필수 근거 | 허용되는 미확인 정보 |
| --- | --- | --- |
| 1 | 현재 판매/관심도가 높은 바디·렌즈. 제조사 모델 코드, 마운트/형태, 핵심 물리 사양의 공식 자료가 있어야 함 | 가격, 세부 동영상/AF, 드문 부속 사양은 `null` 가능 |
| 2 | 최근 단종 또는 계속 중고 거래되는 제품. 제조사 보존 제품 페이지·매뉴얼·지원 문서 우선 | 현재 신품가, 변형별 세부 사양 `null` 가능 |
| 3 | 오래된 legacy 장비. 공식 아카이브·매뉴얼이 없으면 미검증 경계를 명확히 함 | 상당수 사양 `null` 가능; 정체성과 마운트조차 불명확하면 승격 보류 |

새 제품의 최소 승격 요건은 **제조사/모델 식별, 종류, 바디 또는 렌즈의 마운트(고정렌즈는 `null`), 충돌 없는 ID·별칭, 핵심 필드 근거**다. Tier가 높아도 주관 점수나 근거 없는 가격을 생성하지 않는다. 이미 있는 73개 제품은 새 항목으로 복제하지 않고 같은 productId에 근거를 보강한다.

batch는 아래 순서로 **독립 manifest·diff·커밋**을 갖는다. 표의 이름과 ID는 계획용이며 실제 대상 SKU는 batch 생성 때 중복 여부와 공식 자료를 확인하여 확정한다.

| 순서 | batch 범위 | 권장 크기 | 먼저 확인할 것 |
| --- | --- | --- | --- |
| P | 기존 제품 1개 파이프라인 파일럿 | 1 | 기존 ID 재사용, 동일 값 no-op, 출처 leaf 연결 |
| B1 | Sony 현행 바디 | 5–10 | E 마운트/고정렌즈 구분, 세대/지역 별칭 |
| B2 | Canon 현행 바디 | 5–10 | RF/EF, 무게 측정 기준 |
| B3 | Nikon 현행 바디 | 5–10 | Z/F, 바디 단독·배터리 포함 구분 |
| B4 | Fujifilm 현행 바디 | 5–10 | X, 고정렌즈, 센서 크기/형태 |
| B5 | Panasonic / OM System 현행 바디 | 브랜드별 5–10 | L/MFT 및 브랜드 변경명 |
| B6 | Leica / Sigma 현행 바디 | 브랜드별 3–8 | L, 고정렌즈, 변형별 구성 |
| B7 | Hasselblad 현행 바디 | 3–5 | 새 마운트 vocabulary와 기존 테스트 확장 |
| L1 | 현행 순정 렌즈 — Sony E | 8–15 | FE/E 구분, OSS 여부 |
| L2 | 현행 순정 렌즈 — Canon RF | 8–15 | RF/RF-S, 같은 이름의 변형 |
| L3 | 현행 순정 렌즈 — Nikon Z | 8–15 | FX/DX, VR 근거 |
| L4 | 현행 순정 렌즈 — Fujifilm X | 8–15 | 세대·WR/OIS 접미어 |
| L5 | 현행 순정 렌즈 — L/MFT | 마운트별 8–15 | 제조사·마운트 조합 |
| L6 | 기타 현행 순정 렌즈 | 마운트별 8–15 | 신규 vocabulary 승인 후 진행 |
| T1 | Sigma 렌즈 | 마운트별 8–15 | 동일 모델의 마운트별 ID/무게 |
| T2 | Tamron 렌즈 | 마운트별 8–15 | 제조사 코드·마운트 변형 |
| T3 | Viltrox / Samyang 등 | 브랜드·마운트별 5–10 | 비슷한 명칭/펌웨어 변형 |
| D1 | 최근 단종 바디 | 브랜드별 5–8 | 공식 아카이브와 단종 시점 |
| D2 | 최근 단종 렌즈 | 마운트별 5–8 | 구형/신형 이름 충돌 |
| G1 | Legacy 장비 | 브랜드·세대별 3–5 | 공식 근거의 희소성, `legacy-unverified` 유지 |

브랜드 내부에서는 현행 canonical 항목의 출처·ID를 먼저 맞추고 신규 항목을 추가한다. 한 행이 권장 크기를 넘으면 `-001`, `-002` 등으로 나누며 이전 batch를 닫고 다음 batch를 연다. 바디/렌즈의 가격 수집은 제품 batch와 별도로 `price-<scope>-<nnn>`을 사용한다. 배치 순서는 실제 자료 접근성과 중복 가능성을 고려해 조정할 수 있지만, 먼저 생성한 batch의 checkpoint를 무시하고 새로 만들지 않는다.

## 3. 모든 데이터 batch의 작업 계약

1. **시작:** `git status --short`와 `node scripts/objective/ingest.mjs status --batch ID`를 확인한다. 같은 scope의 열린 batch가 있으면 재개한다. manifest에 baseline commit/canonical digest, 대상 SKU 또는 item key, Tier, 담당 범위를 고정한다.
2. **수집 → `collected`:** 제조사 공식 문서의 URL·버전·원문 위치·지역·관찰 시점을 raw에 저장한다. 공식 자료의 접근 불가/상충은 issue로 남긴다. 검증되지 않은 리뷰/AI 추측은 raw의 객관 claim으로 넣지 않는다.
3. **정규화 → `normalized`:** identity-map으로 기존 ID와 매칭하고 원문 단위를 canonical 단위로 바꾼다. 배터리/카드 포함 여부 등 조건을 claim에 남긴다. 애매한 매칭은 제안만 기록한다.
4. **validation → `validated` 또는 `rejected`:** 스키마, ID/alias, 단위, 도메인, 출처 leaf, 가격, 내부 일관성을 검사한다. 오류는 수정하거나 기각 사유를 남긴다. 다른 제품까지 함께 무작정 통과시키지 않는다.
5. **canonical diff 검토:** 기존 값·제안 값·source/claim·측정 조건과 충돌을 한 경로씩 본다. 동일 값의 근거 추가와 미검증 값의 공식 교체도 명시적으로 승인한다. 충돌이 남으면 적용하지 않는다.
6. **적용 → 테스트:** 승인된 diff만 canonical에 원자적으로 적용한다. `pnpm test`, `pnpm build`, `git diff --check`와 `git diff -- src/data/cameraProducts.json`을 확인한다. 실패 시 원인 수정 후 해당 게이트부터 재실행한다.
7. **커밋/종료:** 해당 batch의 raw·staging·diff·manifest·canonical 결과를 한 커밋에 묶고 `Objective-Batch: <batchId>` 트레일러를 남긴다. 검증되지 않은 item은 `rejected` 상태와 사유를 보존하고, 후속 batch로 보류했다면 `disposition: deferred`와 후속 ID를, 영구 기각이면 `disposition: permanent`를 기록한다. 이 결정 없이 배치를 닫지 않는다. 커밋 해시는 Git에서 조회하고 manifest를 위해 사후 수정 커밋을 만들지 않는다.

이 계약은 **수집 → 정규화 → validation → canonical diff 확인 → 테스트 → commit**의 최소 독립 단위다. 브랜드 전체가 끝나기를 기다리지 않는다. status는 현재 단계, 다음 명령, 미해결 이슈, 파일 digest, canonical digest 불일치, 커밋 유무를 보여준다.

## 4. 중단/재개 시나리오

| 중단 위치 | 다음 세션의 행동 |
| --- | --- |
| `pending` | 대상 item/SKU를 확인하고 같은 batch에서 공식 자료 수집 시작 |
| `collected` | 저장된 raw/source ID·digest 확인 후 normalize; 자료를 다시 수집하지 않음 |
| `normalized` | staging/identity/단위 이슈부터 validate; claim 재생성은 digest 불일치 때만 |
| `validated` | 저장된 diff와 현재 canonical baseline 확인; 바뀌었으면 재diff·재승인 |
| `rejected` | 사유와 attempt를 읽고 새 공식 근거/매핑으로 재시도하거나 제외 결정을 기록 |
| `apply` 도중, 상태 기록 전 | manifest의 baseline/예상 결과 digest와 실제 canonical을 비교; baseline이면 적용 재시도, 예상 결과면 테스트부터 재개, 둘 다 아니면 중단·재diff |
| `canonicalized`, 커밋 전 | canonical after-digest 확인, 테스트/빌드 및 diff 재검토 후 커밋 |
| 커밋 직후 | Git 트레일러와 manifest 상태 확인; 같으면 닫고 다음 batch로 이동 |

재개 시 읽기 순서는 `git status --short` → 이 문서/기술 설계의 해당 절 → batch manifest → `status` 출력 → 필요한 raw/staging/diff 한정이다. 이미 끝난 브랜드를 처음부터 다시 훑지 않는다. manifest를 `OBJECTIVE_DB_PROGRESS.md` 같은 서술형 단일 파일 대신 기계가 읽는 batch별 파일로 분리해 병렬 작업 충돌을 줄인다. 사용량 제한에 걸리면 현재 게이트의 산출물·상태를 저장하고 종료한다. 불완전한 수집을 `validated`나 `canonicalized`로 표시하지 않는다.

## 5. 검증과 회귀 확인

파이프라인 자체의 테스트는 다음 사례가 최소다: 동일 raw 재실행 시 같은 source/claim ID, 동일 배치 재적용 no-op, 공식 값 충돌 차단, 출처 위치 누락 차단, 같은 모델명의 마운트 변형 분리, alias 충돌 차단, 비슷한 모델 자동 병합 금지, lb/oz→g 등 단위 변환·자릿수, body-only/배터리 포함 무게 분리, 미확인/0/false 구분, 외화 가격 요약 차단, 적용 중단 후 digest 기반 재개, baseline canonical 변경 시 적용 차단.

기존 `tests/cameraCatalog.test.js`는 ID·마운트·출처·가격·세 플로우의 불변식을 보장한다. 데이터가 50개 바디 이상이 되기 **전에** 고정 개수 범위 및 마운트 배열을 승인된 vocabulary와 실제 제품 불변식으로 바꿔야 한다. 테스트를 삭제하거나 약화해서 새 제품을 통과시키지 않는다. 첫 단계에서는 기존 테스트를 손대지 않는다. 브랜드 batch마다 전체 테스트와 build를 실행하고, 가격 `null` 및 기존 만원 환산, 고정렌즈 자산 처리, 첫 구매의 5개 시스템, 기변/추가 구매의 기존 동작을 확인한다. 후보 수 증가로 응답 성능이 악화되면 측정값을 기록한 별도 런타임 작업을 연다.

## 6. 승인·충돌·소유권 규칙

- 출처가 공식이어도 정확한 제품 변형/지역/측정 기준이 다르면 별개 claim이다. 이미 verified인 값과 충돌하는 새 문서는 사람이 이유를 남기기 전까지 적용하지 않는다.
- 미검증 과거 값은 지우거나 공식 검증으로 바꾸기 전에 해당 leaf의 공식 claim과 diff 승인을 요구한다. legacy 정책의 체감 점수·역할은 Objective ingestion에서 다루지 않는다.
- alias/ID는 전 제품 범위에서 한 번만 부여한다. canonical 수정은 직렬이다. 독립 batch는 raw/staging 수집을 병행할 수 있으나 동일 baseline으로 동시에 apply하지 않는다.
- 사실값을 바꾸지 않는 source/가격 시계열 관찰도 기록 가능하지만, 가격 요약 갱신은 별도의 집계 규칙과 diff 승인을 요구한다.
- Experience DB는 나중에 stable `productId`를 외래 키로 사용한다. 합성 내장 렌즈와 `unknown-*`는 참조 금지이며, 과거 ID 삭제 시 redirect/tombstone을 먼저 설계한다. 이번 v0.4 단계에는 경험 기록을 만들거나 추천 엔진 점수와 섞지 않는다.

## 7. 후속 세션에 넘길 체크리스트

첫 구현 세션은 다음 순서대로 진행하면 된다.

1. 현재 `git status`, v0.3 JSON 구조/테스트를 확인하고 기존 값을 보존한다.
2. 기술 설계의 raw/staging/manifest 최소 스키마와 결정적 직렬화 규칙을 코드로 고정한다. `vocab.json`은 기존 마운트/종류만 먼저 담고 새 마운트는 명시적 검토로 추가한다.
3. 기존 제품 1개와 공식 자료 1건으로 작은 fixture를 만든다. 출처를 직접 확인한 leaf만 `verified`로 표시한다.
4. 읽기 전용 `status`, `normalize`, `validate`, `diff`와 핵심 거절/재실행 테스트를 구현한다.
5. canonical 변경 0, 기존 테스트/build 통과, 재실행 시 동일 diff/digest를 확인한다.
6. 결과를 보고하고 **`apply` 구현 직전**에 멈춘다. 그다음 세션은 단계 2부터 시작한다.
