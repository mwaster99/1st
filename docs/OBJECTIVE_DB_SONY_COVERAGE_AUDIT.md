# Sony Korea 현행 카메라 Objective DB coverage audit — 2026-09-29

## 판정과 범위

Sony Korea 공식 [렌즈교환식 갤러리](https://www.sony.co.kr/interchangeable-lens-cameras/gallery)의 제품 카드 27개와 [컴팩트 갤러리](https://www.sony.co.kr/compact-cameras/gallery)의 8개를 직접 대조했다. 같은 카드에 함께 표기된 렌즈 키트·그립 키트 SKU는 별도 카메라로 세지 않는다. 당시 35개 카드의 모델 코드와 갤러리 구분을 [`sony-current-camera-gallery-2026-09-29.json`](../src/data/ingestion/sony-current-camera-gallery-2026-09-29.json)에 고정했다. 이는 조회 시점의 snapshot이며 Sony가 이후 갤러리를 바꾸면 다시 수집해야 한다.

이 서비스의 현행 카메라 범위는 사용자가 직접 들고, 삼각대에 올리거나 카메라 리그에 장착하여 조작하는 바디·고정렌즈 카메라다. 선택의 핵심인 바디/렌즈 구성, 휴대 무게·크기, 화면/뷰파인더, 전원과 예산을 같은 의사결정 축에서 비교할 수 있어야 한다. 전문 촬영용이라는 이유만으로 배제하지 않는다. FX 시리즈처럼 촬영자가 직접 운용하는 시네마 카메라도 이 범위에 속한다. 원격 제어와 설치가 핵심인 로보틱/PTZ 시스템은 제어기·네트워크·전원·설치 및 총 시스템 비용을 비교하는 별도 의사결정 모델이 필요하므로 현재 범위에서 보류한다. E 마운트 여부나 현행 스키마에 필드가 있는지 여부는 단독 판단 근거가 아니다.

**FR7 (`ILME-FR7`)은 `deferred-special-category`로 결정했다.** Sony [제품 페이지](https://www.sony.co.kr/interchangeable-lens-cameras/products/ilme-fr7)와 [전문 PTZ 제품군](https://pro.sony/ko_KR/products/ptz-cameras/pan-tilt-zoom-cameras)은 원격 팬·틸트·줌과 설치/원격 운용을 제품의 중심 기능으로 설명한다. [공식 사양](https://www.sony.co.kr/electronics/support/camcorders-and-video-cameras-interchangeable-lens-camcorders/ilme-fr7/specifications)에는 E 마운트가 있지만 본체만 약 4.6kg, 원격·네트워크/전원 관련 사양이 나온다. 소비자용 일반 바디 선택지에 dummy 제품으로 추가하면 무게·뷰파인더·body+lens 조합 점수가 구매 판단을 왜곡한다. 별도 professional/PTZ 추천 흐름과 운영·설치·전원·제어·시스템 비용 축이 준비되면 최신 공식 자료로 재검토한다. 이유·공식 출처·재검토 조건은 [`catalog-scope.json`](../src/data/ingestion/catalog-scope.json)에 기록했다.

| 공식 카드 | canonical 완료 | 범위 보류 | 미처리 | 중복/모호 |
| ---: | ---: | ---: | ---: | ---: |
| 35 | 34 | 1 (FR7) | 0 | 0 |

34개 canonical 매핑은 [`identity-map.json`](../src/data/ingestion/identity-map.json)의 Sony 바디 모델 코드와 batch 001~008의 34개 `canonicalized` item을 1:1로 대조했다. 별도 scope registry와 canonical/identity map의 모델 코드 교집합은 없다. 따라서 **Sony Korea 현행 카메라 Objective DB의 제품 범위 coverage를 1차 완료**로 판정한다. 이것은 모든 사양·가격·근거가 완성되었다는 선언이 아니다. Sony 렌즈나 다른 국가의 판매 목록도 이 35개 분모에 포함하지 않는다.

## Identity / revision 점검

- FX3 `ILME-FX3`와 FX3A `ILME-FX3A`는 각각 별도 공식 카드·canonical ID다. Sony [FX3 사양](https://www.sony.co.kr/electronics/support/camcorders-and-video-cameras-interchangeable-lens-camcorders/ilme-fx3/specifications)과 [FX3A 사양](https://www.sony.co.kr/electronics/support/camcorders-and-video-cameras-interchangeable-lens-camcorders/ilme-fx3a/specifications)의 LCD 해상도 차이(약 144만/236만 도트)도 확인했다. 서로의 alias로 합치지 않았다.
- α7R III A `ILCE-7RM3A`, α7R IV A `ILCE-7RM4A`는 각각 현재 공식 카드와 별도 canonical ID에 대응한다. Sony의 [원판/A 개정 안내](https://support.sony.jp/electronics/support/articles/con/00277855)는 LCD 변경을 명시한다. 원판 `ILCE-7RM3`와 `ILCE-7RM4`는 이번 한국 공식 현행 갤러리 카드가 아니며, 원판 canonical을 임의 생성하거나 A 모델에 합치지 않았다.
- 34개 production product ID가 서로 다르고, canonical 전체의 ID 및 이름/alias 충돌 검증을 통과한다. 카드에 병기된 키트 SKU는 동일 제품 카드의 판매 구성으로 취급했다.

## Completeness / provenance 판정

이번 분류 수치는 **현행 Sony 34개 바디의 핵심 필드·근거 metadata에 대해 확인한 항목 수**다. 전체 JSON의 모든 null 개수나 서로 다른 제품 수로 읽지 않는다.

| 등급 | 수 | 근거와 후속 성격 |
| --- | ---: | --- |
| Critical | 0 | 공식 source 0개, 근거 미표시 비-null 핵심 사양, 잘못된 kind/mount/weight basis, 중복 identity가 없었다. |
| Should-fix | 30 | 7개 기존 제품의 `identityEvidence` metadata 미기재; α7 IV의 값이 있는 legacy-unverified 사양 7개; 공식 모드/조건을 확인해 보강할 `specs.video.max` null 15개; FX3의 공식 사진 유효 화소는 확인 가능하나 null인 1개. 별도 검증 batch에서 처리한다. |
| Acceptable UNKNOWN | 8 | 운용 기준 무게 2개(ZV-E10 II·FX6), 정확한 센서 포맷 라벨 3개(ZV-1·RX0 II·RX10 IV), 사진용 유효 화소 정의가 불명확한 시네마 2개(FX5·FX6), 전체 깊이 기준이 불명확한 FX5 치수 1개. 출처와 측정/의미 기준을 확인할 때까지 null 유지한다. |

`identityEvidence` metadata가 빠진 제품은 α7 IV, α7C II, α7R V, α7CR, α6700, ZV-E1, RX100 VII다. 각각 공식 source와 처리 artifact는 있으며 제품 identity 자체가 미상이라는 뜻은 아니다. 34개 모두 제조사 source가 최소 1개 있다. 비-null `specs` 말단값 634개를 검사할 때 상위 객체 경로의 field evidence도 하위 값을 뒷받침하는 것으로 계산하면 627개가 `verified` evidence에, 7개가 명시적 `legacyFields`에 대응한다. **근거 분류조차 없는 비-null 말단값은 0개**다. 남은 7개는 α7 IV의 AF AI unit/설명/피사체, 배터리 매수, 센서 세대, 영상 crop/log다. `legacyFields`는 verified를 뜻하지 않으므로 should-fix에 남겼다.

영상 최대치 null 15개는 Sony 공식 사양에서 모드·NTSC/PAL·crop·codec 조건을 확인한 후에만 채워야 한다. 값만 추측해 `4K`로 일괄 채우지 않는다. FX3 사진 유효 화소 역시 [공식 FX3 사양](https://www.sony.co.kr/electronics/support/camcorders-and-video-cameras-interchangeable-lens-camcorders/ilme-fx3/specifications)의 약 12.1MP와 현재 null을 대조한 후속 후보이며 이번 감사에서 DB를 수정하지 않았다. 가격은 이번 사양 감사 범위 밖이다. 34개 중 신품·중고 각각 31개 quote는 UNKNOWN, 나머지 3개씩은 기존 `legacy-unverified` 값이다. 어느 쪽도 이번 감사에서 가격 promotion을 하지 않았다.

## Production artifact 점검

batch 001~008에 대해 manifest의 34개 item 상태가 모두 `canonicalized`인지, 제품 ID가 중복되지 않는지, 각 raw source·staging·diff·승인 파일과 archived approval·transaction `before`/`after`/journal이 존재하는지 검사했다. 각 batch의 승인 ID, baseline/expected digest, diff 파일 SHA-256이 manifest·approval·journal·transaction 파일과 맞는다. 001의 expected digest가 002의 baseline digest인 방식으로 008까지 이어지며, 008의 `after` digest는 현 canonical 파일 SHA-256과 같다. 누락 artifact, digest chain 단절, 중복 item은 **0건**이다. 이 감사는 과거 artifact를 재작성하지 않았다.

회귀 테스트 [`sonyCoverageAudit.test.js`](../tests/sonyCoverageAudit.test.js)는 snapshot의 공식 카드 각각이 canonical 또는 scope registry **정확히 한 곳**에 연결되는지와 위 production chain을 확인한다. 이 snapshot 기반 테스트는 이후 Sony 사이트에 새 제품이 올라온 사실을 자동 감지하지 않으므로 다음 coverage 점검 때 공식 갤러리를 다시 조회하고 snapshot을 갱신해야 한다.

다음 브랜드는 기존 [v0.4 batch 계획](OBJECTIVE_DB_V04_PLAN.md)의 B2인 **Canon 현행 바디**가 자연스럽다. Canon 공식 현행 목록을 먼저 확정하고, Sony와 같은 scope/identity/출처 정책으로 작은 batch부터 시작한다. Sony의 30개 should-fix 항목은 별도 보강 과제로 남으며 제품 coverage 완료 판정을 뒤집지는 않는다.
