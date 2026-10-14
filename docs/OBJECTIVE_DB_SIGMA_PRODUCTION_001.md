# Sigma Objective DB production batch 001

완료일: 2026-10-14. Batch: `production-sigma-bodies-001`.

시작 시 clean HEAD `0a21488f004496ce99faaab668b2d05e758f3899`에서 기존 설계·field contracts·진행 기록·브랜드 감사·canonical·identity-map·scope·mount vocab·production pipeline·validators·회귀 테스트를 대조했다. 중단 후에는 동일 워킹트리의 완료된 worker/production/테스트를 재사용하고 문서와 checkpoint만 마무리했다.

## 1. Inventory 기준 지역/source

Sigma Korea를 우선 조사했다. [한국 공식 홈](https://sigma-photo.co.kr/)의 CAMERAS 메뉴는 [Global 모델 소개](https://www.sigma-global.com/en/cameras/our-cameras/)로 연결된다. 한국 [BF 소개](https://sigma-photo.co.kr/pages/bf), [Global 현행 카메라](https://www.sigma-global.com/en/cameras/), [Japan 현행 카메라](https://www.sigma-global.com/jp/cameras/)와 제품별 상태·[공식 단종 목록](https://www.sigma-global.com/en/discontinued/)을 교차 확인했다. 16회 공식 HTTP 요청 모두 200이며 URL·실제 조회 시각·응답 hash는 inventory snapshot의 `collectionFetches`에 보존했다. 한국 판매점 재고나 전세계 모든 SKU의 완전성을 주장하지 않는다.

## 2. Official camera card 수

한국 메뉴가 연결하는 모델 소개 목록에는 **3개**가 남아 있다. 실제 현행 landing은 BF만 표시한다. 남아 있는 소개 카드와 현행 제품 수를 구분했다.

## 3. Base identity 수

소개 목록 기준 **3개**: BF, fp L, fp. 색상은 별도 base identity가 아니다.

## 4. 전체 camera inventory

| 표시명 | 공식 제품 URL | 판정 | Canonical | 이번 처리 |
|---|---|---|---|---|
| BF | [BF](https://www.sigma-global.com/en/cameras/bf/) | released/current | 기존 `sigma-bf` | provenance/사양 보강 |
| fp L | [fp L](https://www.sigma-global.com/en/cameras/fpl/) | discontinued/archive | 없음 | 현행 denominator 제외 |
| fp | [fp](https://www.sigma-global.com/en/cameras/fp/) | discontinued/archive | 없음 | 현행 denominator 제외 |

fp/fp L의 개별 공식 페이지와 단종 목록에 있는 명시적 단종 상태를 소개 카드의 잔존 여부보다 우선했다. 과거 카메라 catalog 전체를 수집하지 않았다. Lens/cine-lens/accessory는 snapshot의 별도 scope 경계에 기록하고 카메라 수에 포함하지 않았다.

## 5. Released/current 수

**1개: BF**. 검증한 현행 목록에 fixed-lens 카메라는 없었다.

## 6. Announced/upcoming/development 수

이름과 SKU가 확인되는 현행 announced/upcoming 제품은 **0개**. 별도로 과거 **unnamed full-frame Foveon X3 개발 reference 1건**을 기록했다. [2020 공식 공지](https://www.sigma-global.com/en/news/2020/02/08/10874/)와 [2021 공식 공지](https://www.sigma-global.com/en/news/2021/02/19/12739/)의 개발 언급이며, 2026년 진행/취소 상태나 출시 모델은 확인되지 않았다. 현행 출시 제품 또는 확정된 신규 모델로 계산하지 않는다.

## 7. Linked variant 수

**1개**: BF 기본 Black에 연결되는 Silver finish. 두 색상, 한 BF identity이며 별도 제품 생성은 없다.

## 8. Deferred/special 수

**0개**. 단종 2개와 과거 개발 reference는 위의 별도 상태로 분리했다.

## 9. 기존 canonical current 수

**1개: `sigma-bf`**. 기존 identity·가격·aliases를 유지했다.

## 10. 시작 production 미처리 수

**1개**. BF가 canonical에 있었지만 production field provenance가 없어 보강 대상이었다.

## 11. 실제 처리 수

**1개**. 공식 자료 → 독립 worker → raw → normalize → strict validate → diff → 사람이 읽는 summary 검토 → explicit approval → atomic apply → canonical validation → 실제 재적용까지 완료했다.

## 12. 처리 제품 목록

**Sigma BF / `sigma-bf`**. 소수 현행 제품 전체를 한 batch로 종료했다.

## 13. 미처리와 이유

현행 제품 미처리 **0개**. fp/fp L은 공식 단종, 이름 없는 Foveon 개발 reference는 출시 제품이 아니므로 이번 production 대상이 아니다.

## 14. 신규/기존 보강

신규 **0**, 기존 보강 **1**. 사람이 보는 diff: **33 fields / 3 sources**, same-value/new-evidence **6**, null-fill **18**, value-conflict **0**, new **0**, unknown **9**. 총 37 claims는 known 28/null 9이며 일부 동일 필드에 독립 source가 반복되어 unique path는 33개다.

## 15. Canonical 수량 변화

| 구분 | 이전 | 이후 | 변화 |
|---|---:|---:|---:|
| bodies | 163 | 163 | 0 |
| lenses | 36 | 36 | 0 |
| total | 199 | 199 | 0 |

BF 외 기존 162 bodies와 전체 36 lenses는 동일하다. 기존 BF identity/aliases/mount/kind/bodyStyle/price도 동일하다. `cameraProducts.json`은 pipeline atomic apply로만 변경했다.

## 16. 제품별 핵심 데이터

| 항목 | 승격값/처리 |
|---|---|
| Sensor | native 유효 24.6MP, full-frame, 공식 35.9×23.9mm, Back-illuminated CMOS |
| Body | W/H/D 130.1×72.8×36.8mm, interchangeable / L-Mount |
| Weight | 446g battery-internal-storage / body-only 388g |
| Shutter | mechanical false / electronic true, timed 30sec, bulb true |
| LCD | present true, 3.15inch, 약 2.1M dots, touch true, mechanism UNKNOWN |
| AF | phase+contrast hybrid, Human/Animal tracking |
| Video | 6K 29.97p / Log true, 대표 mode의 내부 HEVC·200Mbps 조건 보존 |
| Burst | electronic 약 8fps, 3/5/8 선택 및 AF/기록 조건 보존 |
| Battery | 약 260 still images, 공식 시험 기준 이상으로 CIPA 추정하지 않음 |
| Environment | 공식 dust/splash 조건, 0–40°C; waterproof/IP 등급으로 확대 해석하지 않음 |

Verified fieldEvidence **24 paths**가 known objective leaf **27개**를 지원한다. 조건과 대표값의 범위를 분리했다.

## 17. 공식 source 수

Incoming production raw **3개**:

| Source | 역할 | helper accessedAt |
|---|---|---|
| [Sigma Korea BF](https://sigma-photo.co.kr/pages/bf) | identity, full-frame, 내부 저장·no SD 근거 | `2026-10-14T01:06:30.077Z` |
| [Global BF 사양](https://www.sigma-global.com/en/cameras/bf/) | sensor/body/shutter/영상 등 객관 사양 | `2026-10-14T01:04:55.569Z` |
| [BF English manual](https://www.sigma-global.com/en/support/download/BF_EN.pdf) | mechanical 부재, 영상/AF/연사 조건; FW Ver.1.00 | `2026-10-14T01:04:14.428Z` |

3개 모두 canonical의 채택된 field evidence에 연결됐다. 기존 legacy reference 1개가 남아 누적 canonical source link는 **4개**지만, 새로 수집한 독립 자료 수는 3개다.

## 18. Conflicts

실제 source value conflict **0**, 기존 canonical value conflict **0**. Worker가 제시한 두 자료의 6K/EIS 금지는 동일 조건이다. 사양의 JPEG 1000/DNG 350 기록 가능 수와 manual의 설정에 따라 약 100 이상/미만 가능 안내는 범위가 달라 진짜 동일 claim 충돌로 분류하지 않았다. 서로 다른 조건은 보존했다. 회귀 테스트에서 의도적으로 주입한 값 충돌은 `CONFLICTING_CLAIM_VALUES`로 차단된다.

## 19. 주요 UNKNOWN

실제 근거 부족 **7 paths**: EVF 유무, body/sensor IBIS 유무, LCD mechanism, video bitDepth, cropAtMax, AI hardware unit, 실제 출시일. 공식 발표의 예정 월을 실제 출시일로 승격하지 않았다.

기계식 연사/최고속 2개는 no mechanical shutter에 따른 N/A. `cardSlots` null 1개는 no SD 근거는 있으나 zero-slot 상태를 표현하지 못하는 기존 계약 한계다. 따라서 9 null claims를 모두 사양 미확인으로 세지 않는다. LCD mechanism은 객체 내부 null이다. 기존 merge가 부분 객체의 null 자식을 생략하는 경우 UNKNOWN은 canonical에서 `undefined`로 남을 수 있으며, 이번에 그 동작을 바꾸지 않았다.

## 20. fp/fp L identity 결과

공식 단종으로 이번 수집에서는 상태/identity만 확인했다. fp 24.6MP와 fp L 61MP, contrast AF와 hybrid AF 등 독립 hardware 차이를 확인했으며 합치지 않았다. 단종 제품의 전체 spec matrix/canonical/raw 생성은 이번 범위에서 하지 않았다.

## 21. BF identity 결과

기존 `sigma-bf` 유지, identity-map에 검토된 BF 매핑과 `Sigma BF` alias를 연결했다. Silver는 finish만 연결했다. BF의 sensor/storage/shutter를 fp와 공유한다고 추정하지 않았다. Staging identity는 verified지만 기존 제품 update 경로는 canonical의 전용 `identityEvidence`를 새로 붙이지 않는 기존 한계가 있다. 채택 spec evidence 및 sealed identity-map/staging에서 identity를 확인할 수 있고, 전용 metadata 보강은 별도 후속 후보다.

## 22. L-Mount 처리

기존 `L-Mount` vocab 재사용. Sigma 자체 공식 자료만 evidence로 사용했다. Panasonic/Leica의 동일 mount 사양을 전용하지 않았다. Vocab와 catalog-scope 변경은 없다.

## 23. Foveon/Bayer 처리

BF 공식 literal `Back-illuminated CMOS`와 RGB Primary color filter 조건을 보존했다. BF 자료가 exact Bayer array를 명명하지 않아 이를 단정하지 않는다. fp L의 공식 Bayer CMOS 표현이나 과거 Foveon 특성을 BF에 상속하지 않았다. BSI 세대 번호/stacked 구조도 추정하지 않았다.

## 24. Shutter 처리

Manual의 명시적 기계식 셔터 부재를 boolean false로 승격했다. 전자식 true 및 flicker/빠른 피사체 왜곡 주의 조건을 보존했다. 최고속 공식 `1/25600sec`의 raw `0.0000390625`와 exact fraction은 유지하지만 기존 6자리 정규화로 canonical은 `0.000039`다. 정밀도 정책은 이번에 바꾸지 않았다. Timed 30sec와 bulb 최대 300sec 조건을 분리했다. Flash sync 등 추가 대표값은 근거·계약 검토 없이 생성하지 않았다.

## 25. Storage 처리

공식 내부 **230GB**, 명시적 **SD slot 없음**, USB storage **backup**을 분리했다. `cardSlots` 계약은 양수 count를 요구하므로 `{count:0,slots:[]}`를 만들지 않고 null과 조건 metadata를 사용했다. Internal storage는 slot이 아니며 USB backup을 외장 SSD 영상 recording으로 표현하지 않았다. 별도 storage schema는 추가하지 않았다.

## 26. EVF/LCD 처리

기존 strict LCD 객체 사용: present true / 3.15inch / 약 2.1M dots / touch true. Hinge mechanism은 확인되지 않아 null. EVF 항목의 누락을 명시적 EVF 부재로 해석하지 않고 UNKNOWN 유지했다.

## 27. IBIS 처리

Sensor-shift/body IBIS는 직접 근거 부족으로 UNKNOWN. Video EIS와 lens OIS는 별도 조건이다. EIS/lens OIS 동시 사용 제한, 낮은 해상도에서 EIS crop 1.25(DC 1.96)를 조건에 보존했다. Worker의 `IBIS.present:false` 제안은 채택하지 않았다.

## 28. Video 처리

대표 **6K 29.97p**, internal 6016×3384 / H.265 HEVC / 200Mbps / L-Log. 6K의 23.98/25/29.97 표기 유지, H.264/EIS/DC crop 병용 불가 조건과 FW manual1.00 범위 보존. 119.88fps는 FHD이며 6K 최대 fps로 합치지 않았다. Still DNG14bit를 movie bit depth로 옮기지 않았다. CropAtMax는 UNKNOWN. fp 계열 CinemaDNG/SSD recording을 상속하지 않았다. 단일 `video.max` 소비 경로와 기존 fractional-fps parser 문제는 후속 표현 개선 후보다.

## 29. Burst 처리

전자식 약 8fps, 3/5/8 선택. JPEG1000/DNG350 기록 가능 수와 manual의 설정별 버퍼 안내를 조건으로 분리했다. SingleAF의 첫 프레임 focus/half-press exposure lock은 AFS에만 적용되는 조건이며 모든 AF mode의 8fps AF/AE 추적 또는 무제한 연속 성능을 주장하지 않는다. Mechanical burst는 N/A.

## 30. Weight 처리

446g은 배터리 포함/내부 저장형 기준의 기존 `battery-internal-storage`, 388g은 `body-only`. Cap 포함 여부는 공식 근거 없음, 렌즈 제외. Claims의 `conditions.weightBasis`가 기존 validator와 일치한다. 액세서리나 렌즈를 더하지 않았다.

## 31. 제품별 worker token

| 제품 / task | Input | Output | Total | 실제 API / retry |
|---|---:|---:|---:|---|
| BF / `sigma-production-001-bf` | 4,153 | 1,043 | 5,196 | 1 / 0 |

## 32. Worker 총 token

**Input 4,153 / output 1,043 / total 5,196**. 사용한 공용 worker model은 `deepseek-flash`. Cache hit 0/cache miss 4,153. 비용은 반환되지 않아 추정하지 않는다.

## 33. Retry/failure

독립 task 1, 실제 API attempt 1 성공, retry 0, API/network failure 0. Dry-run은 API attempt가 아니다. 일회성 공개자료 fixture는 삭제했다.

## 34. Worker 유용성

영상 bit depth·EVF/hinge 추정 금지, storage/weight/조건 분리 경고가 유용했다. 동일 금지 문구를 conflict로 제시한 의견, unsupported no-IBIS, BSI literal까지 미지원으로 본 의견은 직접 검토 후 버렸다. Patch 적용은 0이며 worker는 보조 검토 역할이었다. 공개 해당 제품 자료와 최소 수기 contract만 전달했고 프로젝트 코드/canonical/secret은 전달하지 않았다.

## 35. GPT-6.1 Sol 직접 판단

Inventory·현행/단종·개발 상태·identity·기존제품 보강·source 범위·mount/sensor/shutter/storage/EVF/LCD/IBIS/video/burst/weight·조건·UNKNOWN·충돌·33필드 diff·explicit approval·atomic apply·테스트 판단을 직접 수행했다. KR의 공개 content JSON은 데이터로 decode하고 JS를 실행하지 않았으며 worker에는 필요한 공개 텍스트만 전달했다.

## 36. 사람 개입량

추가 사용자 데이터 판단/수동 편집 요청 **0**. Main의 위 검토가 필요했으며 자동 추출만으로 승인하지 않았다. Exact elapsed human time은 측정하지 않았다. 중단 후 이어서 완료했고 worker/raw/apply는 재실행하지 않았다.

## 37. Normalization 신규 문제

Unsealed 초안의 온도 unit `C`는 기존 rules가 지원하지 않아 normalize에서 차단됐다. 현재 지원되는 `°C`로 초안만 바로잡고 raw-helper로 해당 source를 다시 생성한 뒤 seal했다. 기존 rules 수정/추정 변환/과거 artifact 변경은 없다. Canonical shutter 6자리 정밀도 한계는 기존 동작이다.

## 38. Pipeline/schema 신규 문제

새 blocking bug **0**, architecture/validator 수정 **0**. 최초 approval 명령에 필수 `--diff-digest`가 빠져 기존 gate가 approval/apply를 차단했고 canonical은 바뀌지 않았다. 검토한 정확한 digest로 승인한 뒤 정상 적용했다. 이 CLI 호출 실수는 worker failure와 별개다.

후속 후보: zero-card-slot/internal-storage의 직접 표현, 기존제품 canonical identityEvidence 보강, 단일 video.max 조건 소비, shutter 정밀도, fractional-fps 소비. 이번 batch의 조건/evidence에는 정확한 근거가 남아 있으나 full field completeness를 주장하지 않는다.

## 39. AccessedAt

3개 새 raw 모두 raw-helper가 실제 UTC ISO timestamp를 생성했다. 생성 window `2026-10-14T01:04:14.399Z`–`2026-10-14T01:06:30.079Z` 안에 있는 위 timestamp와 ISO 구조/digest를 검증했다. 날짜를 자정으로 바꾸는 방식은 사용하지 않았다. HTTP 조회 기록과 raw-helper 생성 시각은 구분해 보존했다.

## 40. 전체 tests

`pnpm test`: **335/335 통과**, 실패/취소/skip 0. 완료된 실행 로그를 중단 후 재확인했다.

## 41. Objective/production/catalog tests

**308/308 통과**. 기존 분류대로 scenario/first-purchase engine 2개 test 파일 외 Objective/production/catalog/coverage 테스트를 실행했다. 이전 Sony/Canon/Nikon/Fujifilm/Panasonic/OM SYSTEM/Leica sealed fixture/replay 호환 포함.

## 42. Sigma tests

신규 `tests/sigmaProduction001.test.js`: **14/14 통과**. Inventory/variant/development, BF 기존 보강·다른 제품 불변, sensor/mount/shutter/storage/display/stabilization/video/burst/weight, strict validator 오류, timestamp/digest/approval/replay, worker ledger 및 남은 0개를 검증한다.

## 43. Canonical validation

**true**. 전후 163/36/199, 검증된 known 27 leaves / fieldEvidence24, raw/staging/diff/approval/transaction chain 일치. Baseline SHA `bbda635e5dbae79e9505531dd1b4b1b916eb1e1a28331cc3ed07bc59a8a13c7b`, after SHA `6c673d9b99222e23fb56544551b4e75a7420dae39acd2c2913573c1e8a8c05d5`.

## 44. Build/node/git diff

`pnpm build` 성공. 기존 500kB 이상 chunk 경고 유지(JS 약 974.92kB). 새 Sigma test와 Objective 6 scripts의 `node --check` 통과. `git diff --check` 통과. 문서/checkpoint 마감 후 node/whitespace 검사와 Sigma 회귀 14/14를 재확인했다. 추천/UI/가격/Experience/렌즈/기존 production artifact는 변경하지 않았다.

## 45. Idempotency

실제 CLI 재적용: **`already-canonicalized` / `canonicalMatches: true`**. Sealed before→after replay와 after→after 동등성도 테스트했다.

Reviewed diff digest: `1638cf12b35b25f0cf158e3d2d4ffbcddf4ff5d9756f84fcb81c641927fbf8b7`.

Approval: `approval-ec854cb62fc3035f177cb8a18a74c8ac6a6980f9dfd1afd405134cf675c390da`.

## 46. Git status

이번 작업 변경은 미commit/push 상태다. Tracked: `cameraProducts.json`(atomic apply), `identity-map.json`, 진행 문서. New: Sigma inventory snapshot, batch manifest, raw3, staging1, diff1, current/history approval, transaction before/after/evidence/journal, 상세 보고서, Sigma 회귀 테스트. 일회성 worker fixture는 삭제됐고 Git에 포함하지 않았다. 시작 시 clean 검증 후 생성한 동일 작업 변경이며 새로운 작업 시작 전에는 검토·commit으로 clean 상태를 만들어야 한다.

## 47. 일반 released/current production 미처리 수

**0개**, duplicate/ambiguous **0**. 이 판정은 위 공식 현행 inventory 기준이다.

## 48. 추가 production batch 필요 여부

동일 기준의 추가 현행 batch는 **필요 없음**. 단종/개발 reference나 렌즈를 넣어 숫자를 채우지 않는다. 공식 현행 lineup이 달라지면 새 inventory diff를 먼저 검토한다.

## 49. Coverage audit으로 바로 넘어갈 수 있는지

**데이터와 pipeline은 준비 완료**. 다음은 Sigma coverage audit이며 이번 완료 변경을 검토·commit하여 clean 시작 조건을 충족하면 진행할 수 있다. 이번은 production 구축 완료이며 별도 coverage audit 완료와 동일하지 않다. 완료 worker 재호출/raw 재생성/동일 batch 재적용은 불필요하다.

재개 기준: [inventory/checkpoint](../src/data/ingestion/sigma-current-2026-10-14.json), [batch](../src/data/ingestion/batches/production-sigma-bodies-001.json), [회귀 테스트](../tests/sigmaProduction001.test.js). Canonical hash/terminal checkpoint/검증 결과를 빠르게 확인하고 다음 audit에서 이어간다.
