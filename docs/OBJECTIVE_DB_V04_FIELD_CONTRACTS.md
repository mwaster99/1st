# Objective DB v0.4 — production field contracts

이 문서는 첫 production batch 이후 확정한 **선택적 body spec**과 multi-source provenance의 쓰기 계약이다. 기존 74개 제품에는 새 필드를 일괄 추가하지 않는다. 값이 공식 자료로 확인되지 않으면 leaf를 만들지 않거나 `null`을 사용하며, `false`와 `0`은 실제로 확인된 값에만 쓴다.

## 1. 한 제품의 여러 공식 source

- batch item의 `sourceIds[]`는 그 제품에 사용할 모든 raw source를 열거한다.
- normalize는 같은 `itemKey`의 raw fragment를 하나의 staging으로 결합한다. 결합된 staging은 기존 호환용 `source`와 전체 registry인 `sources[]`를 함께 가진다. 단일 source staging은 과거 transaction digest를 보존하기 위해 기존 형태를 그대로 유지한다.
- 각 claim은 하나의 `sourceId`, locator, 원문 값·단위, 조건을 가진다. 같은 canonical leaf와 같은 값을 서로 다른 공식 source가 뒷받침하면 claim을 각각 보존하고 `fieldEvidence.claimIds[]`에 모두 연결한다. canonical `sources[]`도 그 leaf를 각 source의 `fields[]`에 기록한다.
- 신규 제품 identity evidence는 여러 source 중 정확히 하나에만 둔다. 나머지 source는 같은 reviewed identity를 사용하되 spec claim만 제공한다.
- 같은 leaf에 서로 다른 값이 있으면 source 순서나 최신 날짜로 자동 선택하지 않고 `CONFLICTING_CLAIM_VALUES`로 승격을 막는다. 지역, 제품 변형, 측정 조건을 검토해 별도 batch에서 해소한다.
- URL은 source registry에 한 번만 저장한다. claim은 URL을 복사하지 않고 `sourceId`로 참조한다. transaction archive의 claim과 source snapshot이 근거 관계를 보존한다.

## 2. body 선택 필드

아래 필드는 모두 optional이다. 부모 객체 전체가 `null`이어도 유효하며, 알려진 leaf만 채울 수 있다.

| 경로 | canonical 값 | 단위와 의미 |
| --- | --- | --- |
| `specs.sensor.sizeMm` | `[width, height]` | mm. 센서 포맷 이름으로 추정하지 않는다. |
| `specs.evf` | `{present,resolutionDots,magnification,maxRefreshHz}` | dots, 배율, Hz. 제조사 공식 최대 refresh만 기록한다. |
| `specs.lcd` | `{present,sizeInches,resolutionDots,mechanism,touch}` | inch, dots. `mechanism`은 `fixed`, `tilt`, `vari-angle`, `multi-angle`. |
| `specs.burst` | `{maxMechanicalFps,maxElectronicFps}` | fps. 압축, AF/AE, crop 같은 달성 조건은 claim `conditions`에 남긴다. |
| `specs.shutter` | `{mechanical,electronic,fastestMechanicalSec,fastestElectronicSec,slowestTimedSec,bulb}` | 시간은 초. 지원 여부와 속도 범위를 분리한다. |
| `specs.cardSlots` | `{count,slots:[{index,media,standards}]}` | slot별 복수 media와 표준을 보존한다. combo slot을 한 문자열로 합치지 않는다. |
| `specs.weatherSealing` | boolean | 제조사가 방진·방적 구조를 명시한 경우만 `true`; 문서에 없음은 `null`. |
| `specs.operatingTemperatureC` | `{min,max}` | °C. 음수를 허용하고 `min <= max`를 요구한다. |
| `specs.releaseDate` | `YYYY`, `YYYY-MM`, `YYYY-MM-DD` | 공식 시장 출시·판매 시작일. 확인된 정밀도까지만 기록한다. |

`specs.video`는 현재의 `max`, `bitDepth`, `log`, `cropAtMax` 계약을 유지한다. 해상도·frame rate·codec·열 제한 등 조건을 하나의 새 구조로 추측해 확장하지 않고 claim `conditions`와 원문 locator에 보존한다. 실제 여러 브랜드 자료가 쌓인 뒤 leaf 확장을 별도 검토한다.

### 카드 slot 표기

`media[]`에는 매체 형식(예: `SD`, `CFexpress Type A`)을, `standards[]`에는 해당 slot의 공식 표준(예: `UHS-I`, `UHS-II`, `CFexpress 2.0`)을 쓴다. 한 slot이 두 매체를 지원하면 같은 slot 객체의 `media[]`에 둘 다 둔다. `standards`를 확인하지 못하면 `null`이며 빈 배열로 확인 부재를 표현하지 않는다.

### release date 정책

`releaseDate`는 발표일이 아니라 소비자가 제품을 구할 수 있게 된 공식 시장 출시일 또는 판매 시작일이다. 지역별 날짜가 다르면 canonical 대상 지역을 claim `conditions.region`에 명시한다. 공식 자료에서 연도만 확인되면 `YYYY`, 월까지면 `YYYY-MM`, 일까지면 `YYYY-MM-DD`를 쓴다. 발표일만 있는 경우 canonical 값은 `null`로 둔다.

## 3. raw 작성 helper

`scripts/objective/raw-helper.mjs`는 source 메타데이터와 제품별 observation draft를 받아 다음 반복 작업만 수행한다.

- 동일한 `{field,value,unit}` evidence 발췌를 한 번만 등록하고 `evidenceRef` 연결
- evidence excerpt의 결정적 `contentDigest` 계산
- URL·지역·문서 버전·digest 기반의 결정적 `sourceId` 계산
- source 또는 item의 명시적 review 기본값을 observation에 복사

helper는 출처를 조회하지 않고, 필드를 추정하지 않으며, 입력에 없는 `verification`, reviewer, review date를 만들지 않는다. 따라서 수집자가 공식 원문과 locator를 확인하는 절차는 그대로 필요하다.

```sh
node scripts/objective/raw-helper.mjs --input /path/to/reviewed-draft.json > /path/to/raw.json
```

같은 draft를 반복 실행하면 동일 JSON과 digest를 만든다. `sourceId`나 `contentDigest`를 draft에 직접 넣으면 오류로 거부한다.

## 4. validation과 diff 검토

- 새 숫자 leaf는 정의된 canonical 단위와 양수 조건을 검사한다. operating temperature만 음수를 허용한다.
- `sensor.sizeMm`는 정확히 두 양수, body dimensions는 세 양수여야 한다.
- card slot은 `slots.length === count`, 1부터 count 이내의 중복 없는 index, 비어 있지 않은 media를 요구한다.
- partial release date도 실제 달력 날짜와 월 범위를 검증한다.
- multi-source staging의 identity, item key, product type이 모두 같아야 한다. manifest `sourceIds[]`와 staging registry도 정확히 일치해야 한다.
- 사람용 diff에는 제품별 unique field 수, unique source 수와 category별 field 수를 먼저 표시한다. 같은 field의 claim이 여러 개여도 field 수는 한 번만 센다. 배열은 센서/본체 치수만 `×`로, 문자열 배열은 쉼표로 보여준다.
- JSON diff의 entry 구조와 digest는 유지한다. 요약 문구는 검토 편의용이며 승인과 apply는 기존 machine-readable diff를 기준으로 한다.

## 5. backward compatibility

- `schemaVersion: 1`과 기존 canonical shape를 유지한다. 새 필드는 optional이므로 기존 제품에 자동 default를 삽입하지 않는다.
- 단일 source staging과 과거 transaction archive의 바이트 형태를 유지한다.
- 기존 추천 엔진과 UI는 새 필드를 읽도록 바꾸지 않는다. 이번 계약은 ingestion과 검증 범위에만 적용된다.
- 다음 Sony batch는 제품 3–5개로 제한하고, 제품별 source를 manifest에 등록한 뒤 `normalize → validate → diff → 명시적 승인 → apply → test/build` 순서를 따른다.
