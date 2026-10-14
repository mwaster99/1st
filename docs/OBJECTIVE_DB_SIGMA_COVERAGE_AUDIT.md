# Sigma camera Objective DB production coverage audit

감사일: 2026-10-14. Clean baseline: `0b9735c92ce6343d2ce4baa65289c0e9e2d08df0`.

**Sigma 공식 현행 일반 digital camera는 BF 1개이며 canonical과 production provenance에 연결되어 있다. 현행 미처리·중복/모호·critical은 모두 0이므로 1차 product coverage 완료로 판정한다.** 소개 목록에는 fp/fp L도 남아 있지만 두 제품의 공식 단종 표기를 독립적으로 재확인했다. 이는 모든 사양·조건 metadata·렌즈·가격의 완성을 뜻하지 않는다. Should-fix 4건과 acceptable UNKNOWN 6개는 별도로 남겼다.

Architecture/field contracts/progress, Sigma batch001/보고서/inventory checkpoint/canonical/identity-map/catalog-scope/mount vocab/최신 validators/회귀 테스트와 기존 7브랜드 감사 방식을 대조했다. 새 ingestion이나 worker 호출 없이 공식 자료를 다시 조회했다.

[새 감사 snapshot / checkpoint](../src/data/ingestion/sigma-coverage-audit-2026-10-14.json) · [기존 production 보고서](OBJECTIVE_DB_SIGMA_PRODUCTION_001.md) · [감사 회귀 테스트](../tests/sigmaCoverageAudit.test.js)

## 1. Inventory 기준 지역/source

[Sigma Korea 홈](https://sigma-photo.co.kr/)과 [한국 BF 페이지](https://sigma-photo.co.kr/pages/bf)를 primary로 사용했다. 한국 CAMERAS 메뉴가 [Global 소개 목록](https://www.sigma-global.com/en/cameras/our-cameras/)으로 연결되므로 [Global 현행 landing](https://www.sigma-global.com/en/cameras/), [Japan 현행 landing](https://www.sigma-global.com/jp/cameras/), 개별 제품·단종 목록으로 상태를 교차 검증했다. 직접 공식 HTTP 요청 19개 모두 200. Web tool의 한국 홈 조회 timeout은 직접 HTTP 재조회에서 성공했으며 제품 단종/제거로 해석하지 않았다. 한국 소매 재고나 전세계 전체 SKU completeness는 판정 범위 밖이다.

## 2. Official current camera card 수

**1개: BF**. Global/JP current landing의 BF product card를 기준으로 한다. 한국 메뉴가 연결하는 retained introduction에는 BF/fp L/fp **3개**가 있으므로 그 수를 현행 수와 분리했다. Explore More는 navigation이며 제품 card가 아니다.

## 3. Base identity 수

**Current 1개**. Retained introduction base identity는 3개, 그중 discontinued/archive 2개. BF Black/Silver는 동일 base의 finish이며 linked Silver 1개다. Deferred-special 0개.

## 4. Released/current 수

**BF 1개**. 현재 공식 listing·제품 페이지·buy/dealer 경로와 구체적인 공식 출시 공지를 대조했다. 명시적 제품 상태에서 관찰한 지역 간 불일치는 없다. Korea의 모든 유통 채널별 판매 지속 여부를 확정한 것은 아니다.

## 5. Canonicalized 수

**1개: `sigma-bf`**. Canonical에 정확히 한 번 존재하고 이전부터 있던 동일 identity를 보강했다. 현재 전체 canonical은 **163 bodies /36 lenses /199 total**이며 이번 감사에서 바뀌지 않았다.

## 6. Production provenance 완료 수

**제품 연결 기준 1개**. BF의 실제 raw3 → staging1 → diff1 → explicit approval → atomic transaction/after → canonical fieldEvidence 연결을 확인했다. Canonical에 제품이 있다는 사실만으로 세지 않았다. 이 수는 아래의 조건 metadata should-fix를 포함해 모든 원문 해석이 완벽하다는 뜻이 아니다.

## 7. Unprocessed 수

Released/current **0개**. 새 current 제품/삭제/identity/status 변화는 확인되지 않았다.

## 8. Duplicate/ambiguous 수

**0개**. BF는 기존 ID 유지, Black/Silver finish의 추가 product 없음. fp/fp L alias가 BF에 병합된 사례도 없다.

## 9. fp/fp L 단종 확인 결과

[fp](https://www.sigma-global.com/en/cameras/fp/)와 [fp L](https://www.sigma-global.com/en/cameras/fpl/)의 개별 페이지에 명시적 DISCONTINUED 표기가 있다. [Global 단종 목록](https://www.sigma-global.com/en/discontinued/)과 [Japan 단종 목록](https://www.sigma-global.com/jp/discontinued/)에도 포함된다. 소개 카드가 남아 있다는 사실은 단종 표기를 뒤집지 않는다. 두 모델은 24.6/61MP 등 독립 hardware identity를 갖지만 이번 감사에서는 단종 scope만 확인하고 archived ingestion하지 않았다.

## 10. Announced/development status

독립 모델명/SKU가 확인된 announced/upcoming **0개**. Unnamed Foveon sensor-camera의 역사적 개발 reference **1건**을 별도 기록했다. 이번에는 이전 2020/2021 자료 외 [2022-02-21 공식 개발 공지](https://www.sigma-global.com/en/news/2022/02/21/17697/)도 확인했다. 당시 소형 prototype Stage2, Stage3/양산 판단은 후속 평가 조건이며 일정은 확정되지 않았다. 2026 진행/취소 상태는 UNKNOWN이다. 이를 새 출시 예정 product 1개로 생성하지 않았다.

## 11. BF identity audit

Official Sigma / BF, `sigma-bf`, interchangeable, L-Mount를 확인했다. BF의 sensor/body/storage/shutter/display/video evidence는 BF 자체 자료에 귀속된다. 검토된 identity-map은 BF를 기존 ID로 한 번 연결하고 `Sigma BF` alias를 유지한다. fp/fp L 또는 다른 제조사의 L-Mount 바디와 합치지 않았다.

## 12. 기존 canonical 보강 audit

Before/after가 같은 BF ID를 사용하며 신규 body는 0개다. Diff는 **33 fields /3 sources**, same-value/new-evidence 6/null-fill 18/value-conflict 0/unknown 9. 기존 162 다른 bodies와 전체 36 lenses, BF identity·가격·aliases는 불변이다. Conflict resolution으로 다른 값을 무단 덮어쓴 경로는 없다.

## 13. L-Mount audit

기존 vocab `L-Mount` 재사용, BF 공식 사양과 manual에서 연결을 검증했다. 증거 URL은 Sigma Korea/Global 도메인뿐이며 Leica/Panasonic 제품 사양을 BF evidence로 사용하지 않았다.

## 14. Sensor audit

Canonical은 공식 유효 **24.6MP**, physical **35.9×23.9mm**, full-frame/Back-illuminated CMOS를 유지한다. Total25.3MP와 output6016×4012는 별도 조건이며 output을 effective MP로 바꾸지 않았다. Full-frame 이름으로 36×24를 자동 생성하지 않았다.

**Provenance issue:** 기존 generation claim의 `conditions.colorFilterSystem`에는 RGB Primary color filter가 들어 있지만 연결된 BF 사양 페이지와 새로 읽은 BF manual/Korea 텍스트에서는 그 label이 확인되지 않는다. fp L 원문에 있는 같은 label은 BF 근거가 될 수 없다. 따라서 이 조건은 unsupported로 판정해 should-fix에 기록했다. Canonical BSI CMOS 값 자체는 직접 근거가 있다. RGB가 실제로 없다는 결론도 내리지 않으며 exact Bayer array/Foveon을 추정하지 않는다. 기존 sealed claim은 수정하지 않았다.

## 15. Internal storage audit

공식 **내부 230GB**를 KR/Global 자료에서 재확인했다. 조건 metadata에 보존되어 있으며 physical removable slot으로 계산하지 않는다. USB storage는 backup이고 BF의 외부 SSD 직접 영상 녹화로 승격하지 않았다.

## 16. Physical card slot audit

공식 SD slot 부재를 확인했다. 기존 `cardSlots` contract는 positive count를 요구하므로 canonical null, provenance의 `noPhysicalSDCardSlotConfirmed:true`/internal230GB로 보존한다. 이는 하드웨어 유무가 불명확한 UNKNOWN과 다르다. Fake count0/USB slot/가짜 매체는 없다. 실제와 반대인 slot 값도 없다. 직접 no-slot 표현은 schema backlog다.

## 17. Shutter audit

Manual PDF20/printed19의 명시적 기계식 셔터 부재로 **mechanical false /electronic true**가 검증된다. Flicker 노출 불균일·빠른 피사체 왜곡 조건은 보존되어 있다. 기계식 연사/최고속은 N/A. `1/25600sec` raw와 exact fraction은 남아 있고 canonical은 기존 6자리 정책으로 `0.000039sec`다. Flash synchronization은 검토한 BF 자료에서 직접 근거가 부족하며 fp/fp L의 sync 사양을 복사하지 않았다. 이 부재를 새로운 false feature로 추정하지 않는다.

## 18. EVF/LCD audit

Strict LCD 객체는 present true /3.15inch /약 2.1M dots /touch true로 유효하다. Hinge mechanism은 null, EVF도 null이다. Official 표에서 항목이 없거나 제품 사진으로만 추정 가능한 사실을 명시적 no-EVF/no-hinge로 바꾸지 않았다.

## 19. IBIS/stabilization audit

Body/sensor-shift IBIS는 직접 presence/absence 근거 부족으로 UNKNOWN이다. 이는 false를 표현하지 못해 null이 된 사례가 아니다. EIS는 video only, lens OIS는 렌즈 기능이다. Manual에서 동시 사용 제한 및 EIS crop1.25/DC1.96 조건을 확인했다. EIS/lens OIS를 IBIS로 승격한 값은 없다.

## 20. Video audit

대표 6K29.97p /internal6016×3384 /HEVC·L-Log /200Mbps와 FW Ver.1.00 조건을 대조했다. 6K 23.98/25/29.97과 FHD119.88은 분리된다. Manual PDF102–103/printed101–102에 H264/EIS/DCcrop의 6K 병용 제한이 있다. Movie depth는 제품 사양과 manual의 recording 표에 직접 명시되지 않아 UNKNOWN 유지가 정당하다. Still DNG14bit/audio16bit를 영상 depth로 바꾸지 않았다. CropAtMax도 직접 native crop/no-crop 근거 부족으로 UNKNOWN이다.

**Source attribution issue:** Global BF 사양 footnote는 EIS 제한만 직접 명시하지만 Global-source video.max 및 cropAtMax claims에는 DCcrop 제한도 달려 있다. 제한 자체는 별도 BF manual로 확인되므로 product fact contradiction은 아니지만 해당 claim의 source attribution은 should-fix다. Canonical/기존 artifacts는 유지하고 새 후속 근거 작업에서 source 범위를 바로잡아야 한다. 기존 29.97 parser bug는 이번 coverage blocker에 포함하지 않는다.

## 21. Burst audit

전자식 약8fps(3/5/8 선택)와 JPEG1000/DNG350 기록 가능 수, 설정별 manual 버퍼 안내를 분리했다. AFS의 첫 frame focus/half-press exposure lock 조건을 모든 AF mode로 일반화하지 않았다. 지속 무제한 AF/AE burst나 mechanical burst로 과장된 대표값은 없다.

## 22. Weight audit

공식 446g including battery와 body-only388g에 각각 기존 `battery-internal-storage` /`body-only`를 사용했다. Valid vocab 및 claim weightBasis와 staged/canonical basis 일치를 확인했다. Cap 포함은 직접 근거 없어 UNKNOWN, lens/accessory 무게를 더하지 않았다. 다른 모델 무게의 전용은 없다.

## 23. Provenance 통계

| 지표 | 수 |
|---|---:|
| Known objective leaves | 27 |
| Verified known leaves | 27 |
| Official reference-only /legacy-only | 0 /0 |
| Unclassified /source-less known leaves | 0 /0 |
| Verified fieldEvidence paths | 24 |
| Claims: 전체 /known /null | 37 /28 /9 |
| Incoming raw sources | 3 |
| Canonical source links | 4 |

배열은 기존 감사 방식대로 하나의 leaf로 세며 LCD object claim은 known child를 커버한다. 모든 known 값은 채택 claim→raw→제조사 source에 연결된다. 조건의 별도 오류 2건을 숨기거나 위 통계를 조건 원문까지 모두 verified라는 뜻으로 확대하지 않는다. Legacy reference 1개는 URL trailing slash와 반복 fields가 남아 있으나 verified known leaf 수를 추가하지 않는다. 신규 independent source가 4개라고 세지 않는다.

## 24. IdentityEvidence 결과

Structured canonical identityEvidence **0**, indirect **1**. Existing-product merge는 verified staging identity와 reviewed map을 보존하지만 canonical 전용 metadata를 붙이지 않았다. Source link와 sealed identity 검증이 있어 product coverage blocker는 아니며 should-fix 1건이다.

## 25. Critical 수

**0**. Current identity 누락/충돌·미처리·canonical 반대 값·artifact 누락/digest mismatch는 없다. Unsupported 조건과 source attribution 오류는 아래의 provenance data issue로 명시하며 schema backlog로 감추지 않는다.

## 26. Should-fix 수

**4건**:

1. 기존 BF canonical의 전용 identityEvidence metadata 누락.
2. [2025-04-07 공식 업데이트](https://www.sigma-global.com/en/news/2025/04/07/010920/)에서 BF Black/Silver의 Global 출시일 **2025-04-24**가 확인됨. 기존 releaseDate null은 이제 후속 evidence 보강 대상이다. 한국 판매점 입고일과 구분한다.
3. BF sensor claim의 RGB filter 조건이 연결 source에서 확인되지 않음. 추정 또는 fp L 복사는 허용하지 않는다.
4. Global-source claims 2개의 DCcrop 제한은 manual 근거이며 source attribution 정리 필요.

각 root issue 한 건으로 계산했다. 이번 감사에서 ingestion/수정하지 않았고 후속 좁은 보강 작업으로 분리한다. 기존 production 보고서의 RGB/출시일 판단은 위의 새 감사 판정으로 한정해 읽어야 한다.

## 27. Acceptable UNKNOWN 수

**현재 검토 범위 6 paths**: EVF, body IBIS, LCD hinge, movie bitDepth, cropAtMax, AI hardware unit. 기존 9 null claims에서 N/A2/no-slot 표현 한계1/새 근거가 있는 releaseDate1을 제외한 5개와 LCD의 null child1이다. 전체 JSON null 수 또는 아직 contract에 없는 모든 feature 수와 다르다. ReleaseDate는 acceptable 근거 부족으로 다시 세지 않는다.

## 28. fp/fp L archival scope

단종으로 현행 denominator 제외, 영구 제외는 아니다. 향후 used-camera recommendation/archived catalog/historical Sigma system 단계에서 독립 모델로 다시 수집할 수 있다. 이번 archived spec ingestion은 0이다.

## 29. Foveon development scope

역사적 development reference 1건, 독립 shipping model/SKU0. 2022 공식 공지를 추가했지만 2026의 현재 개발 단계나 취소 여부는 확정하지 않았다. Future camera를 임의 생성하거나 Foveon을 BF에 상속하지 않았다.

## 30. Lens separation

KR camera/lenses/cine-lenses navigation 경계와 분리된 공식 페이지를 실제 확인했다. Lens/cine/accessory card를 camera 분모에 섞거나 ingestion하지 않았다. Still/cine/L-Mount/E-Mount 등 렌즈 coverage는 별도 phase다.

## 31. Schema limitation backlog

Internal GB/explicit zero-slot, 단일 video.max의 조건 소비, burst/shutter 제약 표시, 기존 shutter 정밀도, 29.97 parser, Sigma lens pool은 후속이다. Mechanical false는 현재 schema로 정확히 표현된다. No-EVF/no-IBIS는 현재 explicit absence 근거를 찾지 못한 사례이며 schema의 absence 표현 불능으로 설명하지 않는다. RGB/DCcrop source 문제는 schema limitation이 아닌 provenance data issue다.

## 32. Batch001 artifact audit

Batch 파일 **12개**(manifest/raw3/staging/diff/current+history approval/transaction4)와 registry context2로 **14개**를 검사했다. Missing0/digest mismatch0. Approval ID/diff digest, manifest raw/staging digest, archive evidence/journal, before/after SHA, canonicalized 상태가 일치한다. 현재 raw/staging은 archived bundle과 동일하며 strict validate 1/1, before→after replay 및 after→after idempotency가 재현된다. Artifact digest는 저장된 발췌/구조의 무결성을 증명하며 원문 사실·조건의 정확성을 자동 증명하지 않는다.

실제 CLI `apply --batch production-sigma-bodies-001` 재실행도 **already-canonicalized /canonicalMatches:true**였다. Sealed artifact를 재작성하지 않았다. Canonical SHA 유지: `6c673d9b99222e23fb56544551b4e75a7420dae39acd2c2913573c1e8a8c05d5`.

## 33. Source/accessedAt audit

KR BF/Global BF/manual 3개는 제조사 도메인과 product identity에 연결되고 새 조회 모두 HTTP200이다. Manual bytes는 production 조사 파일과 동일, current landing/소개 목록 bytes도 동일하다. 과거 raw-helper 시각은 **01:04:14.428Z /01:04:55.569Z /01:06:30.077Z**(2026-10-14), ISO 구조 및 원래 clock window 안에 있다. 새 감사 HTTP 조회 시각은 `officialFetches`에 따로 기록하고 production accessedAt은 바꾸지 않았다. Worker 신규 호출/토큰 **0/0**, 기존 total5196은 provenance completeness의 판정 근거가 아니다.

## 34. 전체 tests

`pnpm test` **350/350 통과**, fail/cancel/skip0.

## 35. Objective/production/catalog/coverage tests

**323/323 통과**. 기존 분류대로 scenario/first-purchase engine 두 test 파일 외 테스트를 실행했다. 이전 7브랜드 production replay/strict validator 및 catalog/coverage 호환을 포함한다.

## 36. Sigma tests

**29/29 통과**(production14 + 새 audit15). 새 감사 regression **15개** 추가. Production14와 함께 inventory/status/identity/storage/sensor/display/video/weight/UNKNOWN/should-fix/strict/artifact/timestamp를 검증한다. 기존 테스트는 변경하지 않았다.

## 37. Canonical validation

현재 canonical validation true, 163/36/199 및 SHA 유지. Canonical/identity-map/vocab/scope/과거 artifacts/production report/기존 tests/추천/UI는 변경하지 않았다.

## 38. Build/node/git diff

`pnpm build` 성공(기존 >500kB chunk 경고, JS 약974.92kB). 새 test와 Objective 6scripts `node --check` 통과. `git diff --check` 및 새 파일 whitespace 검사 통과. Protected files/14-file artifact hashes와 canonical SHA 불변 확인.

## 39. Git status

감사 변경만 미commit/push 상태로 남긴다: 새 감사 보고서/snapshot/test와 진행 문서. 일회성 조회 파일은 `/tmp/sigma-audit-20261014`에 있으며 Git에 포함하지 않는다. 최종 상태: `M docs/OBJECTIVE_DB_V04_PROGRESS.md`, `?? docs/OBJECTIVE_DB_SIGMA_COVERAGE_AUDIT.md`, `?? src/data/ingestion/sigma-coverage-audit-2026-10-14.json`, `?? tests/sigmaCoverageAudit.test.js`.

## 40. Sigma current camera coverage 1차 완료 가능 여부

**가능, 1차 product coverage 완료로 판정**. Released/current1 /canonicalized1 /production provenance 연결1 /unprocessed0 /duplicate·ambiguous0 /critical0. Should-fix4와 UNKNOWN6은 조건/필드 수준의 후속 작업이며 모든 field 완성을 선언하지 않는다.

## 41. 다음 브랜드

기존 plan B7 **Hasselblad 현행 카메라 inventory/production**. 이번 감사에서 다음 브랜드 작업을 시작하지 않는다.

## 42. 다음 브랜드로 넘어가기 전 blocker 여부

Sigma product coverage blocker **0**. 새 세션이 clean 시작을 요구하면 이번 감사 4파일을 검토·commit한 뒤 진행한다. Should-fix4는 별도 좁은 보강 작업으로 추적하며 old batch를 되돌리거나 RGB 조건을 검증된 사실처럼 재사용하지 않는다. Lens/가격/Experience/추천 표현 개선은 별도 phase다.
