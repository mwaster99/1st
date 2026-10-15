# Sony E-Mount lens production readiness 구현 — 2026-10-15

**Readiness 보완 완료. 실제 Sony 렌즈 5개 pilot은 별도 작업으로 진행할 수 있다.** 기존 렌즈 model 누락, validate/approval 타입·단위 불일치, image coverage 계약 부재를 최소 범위로 해결했다. 신규·기존 렌즈 모두 격리 fixture에서 승인/atomic apply/recovery/idempotency를 검증했다.

실제 Sony production 수집/worker/승인/apply는 실행하지 않았다. Canonical은 **165 bodies / 36 lenses / 201 total** 그대로이며, 기존 production artifact와 inventory snapshot도 변경하지 않았다. 이번 완료는 pipeline 준비 상태이며 67개 렌즈의 production provenance 완료를 뜻하지 않는다.

기준 commit: `64e70e83b16b6af760cfc08dbfe135d5461c0166` (시작 시 clean 확인). Canonical SHA-256 전후 동일: `3f971b678f83576b916ad00e9c5ff48c203ceee48d95be806754ea7c8f1c9842`.

## 1. 기존 model blocker의 원인

기존 canonical 36개 렌즈에는 모두 `model`이 없었다. 반면 staging은 nonempty model을 요구했고, merge는 기존 제품의 model까지 immutable identity로 비교했다. 생략하면 validate에서 실패하고, 공식 model code를 넣으면 approval에서 기존 undefined와 다르다는 이유로 실패했다. 신규 생성 경로 자체의 부재가 아니라 **기존 ID 보강을 위한 제한적인 identity metadata null-fill 경로가 없는 문제**였다.

Sony current 기존 6개는 다음 ID를 유지한다. 이 표는 기존 inventory의 공식 code 매칭을 정리한 것이며 실제 identity-map 등록이나 canonical model 변경은 하지 않았다.

| 공식 code | 기존 canonical ID |
| --- | --- |
| SEL2470GM2 | sony-fe-24-70-gm2 |
| SEL70200GM2 | sony-fe-70-200-gm2 |
| SEL40F25G | sony-fe-40-g |
| SEL2860 | sony-fe-28-60 |
| SEL85F18 | sony-fe-85-f18 |
| SELP1635G | sony-fe-pz-16-35-f4 |

## 2. Model identity 해결 방법

기존 lens의 model이 absent/null일 때만 공식 manufacturer model code와 일치하는 최초 보강을 허용한다. Reviewed identity-map은 동일 manufacturer/productType/productId/code를 가리켜야 한다. Manufacturer identity source, excerpt, locator, reviewer/date, verified status와 raw/evidenceId 연결도 검증한다. Name/brand/mount/type/aliases는 잠금을 유지한다.

Diff의 선택적 `modelNullFill`은 `path`, `category:null-fill`, canonical/incoming 값, identityEvidenceId를 포함한다. CLI 승인 시 **`--allow-model-null-fill`**을 명시해야 하며 기존 `--confirm --reviewer --reason --diff-digest`도 필요하다. Approval productOperation에 동일 payload를 묶고 atomic transaction으로 반영한다. Canonical에는 model과 structured identityEvidence, source의 `identity`/`model` 연결을 보존한다. 가짜 `specs.model` claim이나 canonical 수동 편집은 사용하지 않는다.

## 3. 신규/기존 model lock

- 신규: 기존 reviewed mapping/identity evidence/중복 ID·alias·동등 제품 검사를 거쳐 explicit new-product 승인 후 생성한다.
- 기존 missing model: 위 조건과 추가 명시적 승인 아래 같은 ID에 최초 보강한다. 다른 identity 속성 변경은 거절한다.
- 기존 non-null model: 일치하면 일반 provenance 보강, 다르면 validate에서 `MODEL_IDENTITY_CONFLICT`. 교체·삭제하는 예외는 없다.
- Legacy canonical 자체는 model 누락을 허용한다. 새 incoming lens의 model은 필수다. 전체 identity lock을 해제하지 않았다.

## 4. Focal contract

기존 `specs.focal.min/max`를 유지하며 actual focal length의 양수 number/mm를 요구한다. Prime의 두 known 값은 같아야 하고 zoom은 min≤max다. Known claim은 rawUnit와 정규화 unit가 모두 있어야 한다. `mm`, 기존 `cm→mm`, `in→mm`만 사용한다. 누락·unsupported unit·숫자 문자열·객체·배열·역순 범위를 validate에서 거절한다. UNKNOWN/null에는 단위를 강제하지 않는다. Fixed-lens body 경로와 35mm 환산 값은 이 계약으로 옮기지 않았다.

## 5. Aperture contract

기존 `specs.aperture.wide/tele`는 양 끝 초점거리에서의 **최대 개방 f-number**, dimensionless 양수 number다. Constant zoom `{wide:2.8,tele:2.8}`, variable zoom `{wide:4,tele:5.6}`, prime `{wide:1.8,tele:1.8}`처럼 표현한다. 두 known 값의 역순과 prime 불일치를 거절한다. `"F2.8"`/숫자 문자열/객체를 묵시 변환하지 않는다. Minimum selectable aperture나 T-stop을 이 값으로 자동 전환하지 않는다. 기존 구조로 variable maximum aperture를 표현할 수 있으므로 새 aperture field는 추가하지 않았다.

## 6. OSS contract

기존 `specs.stabilization`은 boolean/null이다. True는 공식 optical stabilization 존재, false는 공식 부재, null은 UNKNOWN이다. 문자열 `"OSS"`, 숫자, 객체를 거절하며 body IBIS/combined stabilization rating을 lens spec으로 승격하지 않는다. True/false/null과 잘못된 타입을 fixture로 확인했다.

## 7. FE/APS-C coverage contract

새 선택적 field **`specs.formatCoverage`**, enum **`full-frame` / `APS-C`**, UNKNOWN은 null 또는 미기재다. Sony FE와 APS-C E는 모두 physical mount `Sony E`를 유지한다. `FE`라는 비호환 mount는 만들지 않았다.

공식 `35mm full-frame`, `35mm 풀프레임`, `full frame`은 `full-frame`, APS-C 표기는 `APS-C`로 정규화하며 원문은 raw claim에 남는다. 이름에 FE가 있다는 사실이나 mount에서 coverage를 추정하지 않는다. Known coverage에는 검토된 공식 field claim이 필요하며 기존 sources/fieldEvidence 경로로 저장한다. Full-frame lens의 APS-C 사용과 APS-C lens의 full-frame crop 사용은 비대칭이다. 이번 작업은 저장/검증 계약이며 엔진의 crop 처리를 구현한 것은 아니다.

## 8. 실제 추가/변경 field

Canonical optical spec 추가는 optional `specs.formatCoverage` **하나**다. `schemaVersion:1` 유지. Existing lens의 model/identityEvidence/source는 기존 metadata 구조를 재사용한다. Diff/approval에는 model null-fill이 있을 때만 `modelNullFill`을 추가한다. 기존 approval/diff의 속성·digest는 그대로다. Vocab은 기존 claimPaths 뒤에 `specs.formatCoverage` 하나만 append했다. 실제 canonical/identity-map/catalog-scope/legacy policy 변경은 없다.

## 9. Validation error codes

`INVALID_LENS_MODEL`, `MODEL_IDENTITY_MISMATCH`, `MODEL_IDENTITY_UNVERIFIED`, `MODEL_IDENTITY_SOURCE`, `MODEL_IDENTITY_CONFLICT`, `LENS_IDENTITY_CONFLICT`, `RAW_IDENTITY_MISMATCH`, `INVALID_LENS_SPEC`, `INVALID_LENS_FOCAL`, `INVALID_LENS_APERTURE`, `INVALID_LENS_COVERAGE`를 사용한다. 단위·범위·지원 경로·중복·근거 충돌은 기존 `UNIT_REQUIRED`, `UNSUPPORTED_UNIT`, `INVALID_PHYSICAL_RANGE`, `INVALID_ORDERED_RANGE`, `UNSUPPORTED_CLAIM_PATH`, `ALIAS_COLLISION`, `EQUIVALENT_EXISTING_PRODUCT`, `CONFLICTING_CLAIM_VALUES` 체계를 유지한다.

## 10. Validate/approval 공통 규칙

`scripts/objective/lens-contracts.mjs`가 lens spec/value/type/range/coverage/model 계약과 claim unit 검증을 제공한다. Rules staging validate와 merge/approval/canonical validation이 이를 재사용한다. 단위 변환은 기존 rules의 `convertNumber`를 전달해 동일 테이블을 참조한다. Lens identity의 기존 잠금과 model null-fill 판단도 rules helper를 공유한다. Canonical에는 claim unit가 없으므로 값 계약을, incoming에는 값+source unit+근거 계약을 적용한다.

잘못된 numeric raw type/unsupported unit를 normalization이 추정 변환하거나 조기 소실시키지 않고 staging에 보존해 CLI validate가 item을 `rejected`로 기록한다. Approval의 stale baseline/digest/explicit consent/value-conflict 보호는 그대로다.

## 11. Legacy compatibility

기존36lens의 missing model/coverage는 허용하며 default를 주입하지 않는다. 알려진 malformed model이나 잘못된 optical spec까지 허용하는 것은 아니다. Coverage claim이 없는 신규 skeleton도 기존 shape를 유지하고, coverage claim이 있을 때만 optional key를 만든다. 실제 기존 데이터 변경 없이 전체 canonical validation이 통과했다.

## 12. Sealed artifact replay

현재 **30개 sealed transaction / 9개 브랜드**의 incoming을 재검증하고 before→after 및 after→after 재적용 결과를 모두 archived after와 비교했다. 전부 일치했다. Fixed-lens equivalent unit-null 과거 기록에는 기존 archive replay 옵션만 사용하며 fresh production strict validation을 약화하지 않았다. 과거 실제 lens production transaction은 아직 없으므로 legacy36/Stage3/synthetic lens 호환성과 실제 body archive 호환성을 구분한다.

Fujifilm/Nikon/Panasonic/Sigma 테스트의 현재 vocab 완전 일치 가정은 기존 항목 prefix 불변 + append-only claimPaths 검사로 바꿨다. 별도 regression이 과거 최신 vocab 대비 정확히 coverage path 하나만 추가됐음을 확인한다. 옛 artifact/digest/replay 검사는 유지했다.

## 13. 신규 lens fixture

격리 root에서 prime, constant-aperture zoom, variable-aperture zoom 모두 raw→normalize→validate→diff→explicit approval→atomic apply→canonical validation→reapply 성공. Full-frame/APS-C coverage의 fieldEvidence/source 연결과 실제 focal/aperture 양 끝을 확인했다. 실제 Sony 제품 등록은 아니다.

## 14. 기존 lens enrichment fixture

실제 legacy lens 형태의 복사본에 synthetic 공식 identity 근거를 사용했다. Absent/null model null-fill, same-value/new-evidence, optical null-fill, known matching model update를 검증했다. ID/name/brand/mount/type/aliases/가격/다른 제품은 유지했다. Identity-only source와 specification source를 분리한 multi-source도 각각 올바른 provenance로 보존됐다. Model 보강은 field claim이 아닌 identity evidence다.

## 15. Negative regression

Missing/unsupported unit, numeric string/object/array, reversed range, prime endpoint 불일치, malformed aperture/OSS/coverage, unverified/missing/tampered identity, model code 불일치, known model 충돌, mount/alias 변경, 중복 identity, field source conflict, unreviewed claim을 차단했다. CLI validate의 rejected 상태와 approval 불가를 확인했다. Value-conflict는 별도 explicit conflict 승인 없이는 반영되지 않는다. Lens에 body IBIS를 넣거나 body에 lens coverage를 넣는 것도 차단한다.

## 16. Atomic apply / idempotency

신규/기존 모두 실제 fixture transaction을 생성했다. Model null-fill payload를 삭제한 forged approval은 거절됐다. Rename 이후 manifest 갱신 전 interruption에서 recover가 정상 완료했다. CLI/API 재적용 모두 **`already-canonicalized` / `canonicalMatches:true`**, canonical byte/digest 불변이다. 실제 production reapply를 실행했다는 뜻은 아니다.

## 17. 기존 body regression 영향

기존 body/fixed-lens validators, weightBasis/IBIS/LCD/cropAtMax 보호를 유지했다. 9개 브랜드의 sealed body transaction replay와 기존 전체 brand/catalog/coverage/추천 회귀 테스트가 통과했다. 추천 엔진과 UI 파일은 변경하지 않았다.

## 18. 변경 파일 목록

| 구분 | 파일 |
| --- | --- |
| 공통 계약 추가 | `scripts/objective/lens-contracts.mjs` |
| Normalization/validate/identity/diff | `scripts/objective/rules.mjs` |
| Canonical/merge 검증·model 보강 | `scripts/objective/merge.mjs` |
| 명시적 승인과 digest payload | `scripts/objective/promotion.mjs` |
| CLI 승인 flag | `scripts/objective/ingest.mjs` |
| Coverage claim path | `src/data/ingestion/vocab.json` |
| 신규 회귀 테스트 | `tests/objectiveLensContracts.test.js` |
| 이전 진단 테스트의 새 gate 기대값 | `tests/sonyLensReadiness.test.js` |
| Append-only vocab 호환 검사 | `tests/fujifilmCoverageAudit.test.js`, `tests/nikonCoverageAudit.test.js`, `tests/panasonicCoverageAudit.test.js`, `tests/sigmaProduction001.test.js` |
| 문서 | 본 문서, `docs/OBJECTIVE_DB_SONY_LENS_READINESS.md`, `docs/OBJECTIVE_DB_V04_FIELD_CONTRACTS.md`, `docs/OBJECTIVE_DB_V04_ARCHITECTURE.md`, `docs/OBJECTIVE_DB_V04_PROGRESS.md` |

총17파일(기존14개 수정, 신규3개). 기존 Sony inventory/production artifact, canonical, identity-map, catalog-scope, 추천/UI/가격 파일은 변경하지 않았다.

## 19. 전체 tests

`pnpm test`: **442/442 통과**, 실패/skip 0. 마지막 multi-source regression을 추가한 후 전체를 다시 실행한 최종 결과다.

## 20. Objective tests

`tests/*.test.js` 중 추천 엔진 전용 `cameraScenarioEngine.test.js`/`firstPurchaseEngine.test.js`를 제외한 39파일: **415/415 통과**. Objective/production/catalog/coverage 및 기존 9개 브랜드 regression을 포함한다. 제외한 두 파일의27개 테스트도 전체 suite에서 통과했다.

## 21. Lens tests

`node --test tests/objectiveLensContracts.test.js tests/sonyLensReadiness.test.js`: **60/60 통과**(신규45 + 기존 readiness15). 단순 helper 검사뿐 아니라 CLI rejected/approval/apply/recovery/replay를 포함한다.

## 22. Canonical validation

실제 current canonical에 `validateCanonical` 통과. **165/36/201**, SHA-256은 상단 값과 동일하다. Vocab coverage 추가 외에 실제 제품 데이터 변경0. Canonical 전체·기존36lens 호환은 새 테스트에서도 확인했다.

## 23. Build / node / diff / cleanup

`pnpm build` 성공(기존 500kB 초과 chunk 경고 유지). 변경 JS/MJS 11파일 `node --check` 통과. `git diff --check` 및 신규 파일 trailing-whitespace 검사 통과. Fixture root는 tmpdir에만 생성하고 테스트 cleanup hook으로 삭제했다. 명시적 rm→ENOENT 검사와 실제 canonical byte 불변 검사도 통과했다. 프로젝트에 probe/fixture/production artifact를 남기지 않았다. Worker/API 호출과 token 사용은0이다.

## 24. Git status

기존14파일 modified, 신규3파일 untracked이며 위17파일에 한정된다. Commit/push는 하지 않았다. 새 문서/공통 계약/테스트도 검토 대상이며 다음 clean-start production 작업 전 완료 변경을 검토·commit해야 한다. 기존 작업을 지우거나 테스트/worker부터 다시 만들 필요는 없다.

## 25. 남은 blocker

요청한 readiness A–F의 **blocker 0**. 지원하지 않는 lens D×L/배율/최소 선택 조리개/PZ/T-stop, runtime coverage/crop 소비는 기존 범위 밖 후속 후보이며 이번에 schema/엔진으로 확장하지 않았다. 특수 렌즈는 실제 수집 시 공식 F-number와 T-stop 등을 구분하고 미지원 값은 UNKNOWN/조건으로 남겨야 한다.

실제 Sony lens inventory/provenance 미처리는 **67개** 그대로다. 이는 readiness 미완료가 아니라 실행하지 않도록 지정된 다음 production 작업이다. 이번 세션에서 공식 현행 여부를 새로 조사하거나 과거 upcoming 상태를 임의 갱신하지 않았다.

## 26. 실제 5개 pilot 및 재개 checkpoint

**별도 production pilot 001 진행 가능.** 다음 세션은 구현을 반복하지 말고 이 문서와 최신 progress를 읽고 git clean을 확인한다. 기존 후보는 SEL40F25G / SEL2470GM2 / SEL2860 / SELP1020G / SEL90M28G(계획 existing3/new2)이며 현재 공식 출시/사양을 다시 확인한다. 이전 inventory는 historical snapshot으로 유지한다.

이후 제품별 공식 multi-source와 독립 cheap-worker task → reviewed identity-map 등록 → raw-helper의 실제 UTC timestamp → normalize → validate → diff/summary → explicit approval → atomic apply → canonical validation → idempotent replay를 따른다. Existing3은 **기존 ID와 exact identity/aliases 유지 + 공식 code model + verified identity evidence + `--allow-model-null-fill`**이 필요하고 new2는 `--allow-new-products`가 필요하다. 실제 값 충돌은 별도 검토/명시적 conflict gate를 따른다. Ready라는 이유로 근거·승인 절차를 생략하지 않는다.

현재 checkpoint: **implementation complete / fixture verified / actual production not started**. Canonical165/36/201, current67/upcoming4/teleconverter2의 기존 inventory 분류 유지. 새로운 raw/manifest/transaction을 이미 생성한 상태로 착각하지 말고 pilot 수집부터 시작한다.
