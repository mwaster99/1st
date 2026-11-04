# Sony E-Mount Batch 007 특수 렌즈 사전 검토

2026-11-04 Sony Korea 공식 목록은 **현행 69개, production 완료 58개, 미처리 11개**다. 10개는 다음 production 거래로, STF 1개는 별도 pilot으로 권장한다. [공식 갤러리](https://www.sony.co.kr/lenses/gallery) · [사전 검토 스냅샷](../src/data/ingestion/sony-e-lenses-special-preflight-007.json)

## 범위와 identity

- main의 clean baseline f6673f7에서 시작했다. Batch 001–006의 58개 고유 코드를 canonical의 검증된 모델 identity와 대조했다.
- 73카드에서 출시 예정 SEL814G·SEL28702와 TC SEL14TC·SEL20TC를 분리했다. Batch 006 대비 현행 추가·제외 0개다. SEL400F45GM·SEL600F63GM은 공식 제품 카드에 출시 예정 표시가 없고 Sony Store 연결이 있다. 현행은 Sony Korea 카탈로그 기준이다. [Sony Korea 갤러리](https://www.sony.co.kr/lenses/gallery)
- 아래 11개 모두 released/current, 신규 canonical 후보, 물리 Sony E다. Canonical ID·이름·모델·별칭과 identity-map을 확인했고 model null-fill은 0개다. SEL100400MC는 기존 SEL100400 및 SEL100400GM과, SEL100M28GM은 SEL100F28GM과 구분한다. SEL50M28은 A-mount SAL50M28과 다른 제품이다.
- A는 기본 계약으로 처리 가능, B는 조건을 provenance에 보존하고 불확실한 leaf를 UNKNOWN으로 두면 가능, C는 최소 validator/contract 보완 필요, D는 별도 pilot이다. **A 2 / B 8 / C 0 / D 1**이다.

## 제품별 공식 사양과 readiness

모든 초점거리와 배율은 원본 렌즈 기준이다. 제품·지원·교차 출처 및 실제 UTC 조회 시각은 스냅샷에 기록했다. D×L은 스냅샷의 제조사 측정값을 참고한다.

| 모델 / 공식 제품 | 특수 구조 / 등급 | 포맷·유형 | 실제 mm / 최대 조리개 | OSS | 최단거리 m / 원본 배율 | 필터 | 무게 g / 기준 | TC 1.4×·2× | 출처 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [SEL100400MC · FE 100-400mm F4.5 GM OSS](https://www.sony.co.kr/electronics/camera-lenses/sel100400mc) | 듀얼 필터·내부 줌 / B | full-frame · zoom | 100–400 / F4.5 | 있음 | 0.64–1.5 / 0.25× | 95 mm front plus separate 40.5 mm drop-in | 1840 · includes tripod foot per KR gallery | 둘 다 지원 | 2 |
| [SEL100M28GM · FE 100mm F2.8 Macro GM OSS](https://www.sony.co.kr/electronics/camera-lenses/sel100m28gm) | 고배율 Macro / B | full-frame · prime | 100 / F2.8 | 있음 | 0.26 / 1.4× | 67 mm front | 646 · hood/cap inclusion unspecified | 둘 다 지원 | 4 |
| [SEL300F28GM · FE 300mm F2.8 GM OSS](https://www.sony.co.kr/lenses/products/sel300f28gm) | 초망원 / B | full-frame · prime | 300 / F2.8 | 있음 | 2 / 0.16× | 40.5 mm slot-in; numeric front thread not established | 1470 · excludes tripod mount per spec footnote | 둘 다 지원 | 3 |
| [SELC1635G · FE C 16-35mm T3.1](https://www.sony.co.kr/electronics/camera-lenses/selc1635g) | 시네 PZ / B | full-frame · zoom | 16–35 / F2.8 / T3.1 | 없음 | 0.28 / 0.19× | KR spec dash; Sony Pro 114 mm is mechanical front diameter | 1390 · Sony KR published value; servo/hood/cap inclusion unresolved | 둘 다 대시·미등재 | 3 |
| [SEL100F28GM · FE 100mm F2.8 STF GM OSS](https://www.sony.co.kr/electronics/camera-lenses/sel100f28gm) | STF·APD / D | full-frame · prime | 100 / F2.8 / T5.6 | 있음 | 0.85 / 0.57 근접 / 0.25× | 72 mm front | 700 · hood/cap inclusion unspecified | 둘 다 대시·미등재 | 2 |
| [SEL600F40GM · FE 600mm F4 GM OSS](https://www.sony.co.kr/electronics/camera-lenses/sel600f40gm) | 초망원 / B | full-frame · prime | 600 / F4 | 있음 | 4.5 / 0.14× | 40.5 mm drop-in; numeric front thread not established | 3040 · includes tripod mount per Sony Korea product | 둘 다 지원 | 3 |
| [SEL400F28GM · FE 400mm F2.8 GM OSS](https://www.sony.co.kr/electronics/camera-lenses/sel400f28gm) | 초망원 / B | full-frame · prime | 400 / F2.8 | 있음 | 2.7 / 0.16× | 40.5 mm slot-in; numeric front thread not established | 2895 · current KR/US spec 2895 g; 2018 KR release 2897 g; configuration or cause unresolved | 둘 다 지원 | 4 |
| [SEL30M35 · E 30mm F3.5 매크로](https://www.sony.co.kr/electronics/camera-lenses/sel30m35) | APS-C 1:1 Macro / A | APS-C · prime | 30 / F3.5 | 없음 | 0.095 / 1× | 49 mm official filter diameter | 138 · hood/cap inclusion unspecified | UNKNOWN · 미등재 | 3 |
| [SEL50M28 · FE 50mm F2.8 매크로](https://www.sony.co.kr/electronics/camera-lenses/sel50m28) | FE 1:1 Macro / A | full-frame · prime | 50 / F2.8 | 없음 | 0.16 / 1× | 55 mm front | 236 · hood/cap inclusion unspecified | UNKNOWN · 미등재 | 3 |
| [SEL400F45GM · FE 400 mm F4.5 GM OSS](https://www.sony.co.kr/electronics/e-mount-lenses/sel400f45gm) | 경량 초망원 / B | full-frame · prime | 400 / F4.5 | 있음 | 2.5 / 0.18× | 95 mm front | 994 · excludes detachable tripod foot | 둘 다 지원 | 3 |
| [SEL600F63GM · FE 600mm F6.3 GM OSS](https://www.sony.co.kr/electronics/e-mount-lenses/sel600f63gm) | 경량 초망원 / B | full-frame · prime | 600 / F6.3 | 있음 | 2.5 / 0.25× | 95 mm front | 995 · excludes detachable tripod foot | 둘 다 지원 | 3 |

## Macro와 초점

- SEL30M35의 최단 초점거리 0.095m는 센서면 기준이며 최소 작동거리 0.024m는 렌즈 전면부터의 거리다. 30mm APS-C와 50mm full-frame 매크로는 모두 1:1(1.0×)이다. 1:2는 0.5×다. 30mm는 한국 표에 OSS 행이 없지만 Sony Electronics가 광학 보정 부재를 명시했다. 30mm의 모드별 최소거리·리미터·플로팅 방식은 미확인이다. 50mm의 0.16–0.30m, 0.30m–∞, FULL은 AF 리미터 설정이다. [Sony 30mm 매크로](https://electronics.sony.com/imaging/lenses/aps-c-e-mount/p/sel30m35) · [Sony 50mm 매크로](https://electronics.sony.com/imaging/lenses/full-frame-e-mount/p/sel50m28?sku=sel50m28) · [Sony 최단 초점거리 기준](https://www.sony.com/electronics/support/e-mount-body-ilce-7-series/ilce-7cm2l/articles/00267924)
- SEL100M28GM 한국 지원표의 1.4k 표기는 제품 본문의 **원본 1.4×·0.26m**와 대조했다. **2.8×는 SEL20TC 조합**이다. 플로팅 초점, 범위 리미터, AF/MF 및 Full MF 전환은 공식 기능이다. 모드별 최소거리와 근접 실효 개방값은 UNKNOWN이다. [Sony 100mm Macro 제품](https://www.sony.co.kr/electronics/camera-lenses/sel100m28gm) · [Sony Korea 지원 사양](https://www.sony.co.kr/electronics/support/lenses-e-mount-lenses/sel100m28gm/specifications)
- SEL100F28GM의 APD는 주변부 투과를 줄인다. DDSSM AF, 11매 원형 조리개와 클릭 전환을 제공한다. 정상 범위는 최단 0.85m·0.14×, 근접 범위는 0.57m·0.25×다. 대표값을 쓰려면 근접 전환을 minFocusConditions에 명시한다. [Sony STF 제품](https://www.sony.co.kr/electronics/camera-lenses/sel100f28gm) · [Sony STF 사양](https://www.sony.co.kr/electronics/support/lenses-e-mount-lenses/sel100f28gm/specifications)

## 초망원, 무게, TC

- **무게.** SEL100400MC는 삼각대 발 포함 1,840g, SEL600F40GM은 마운트 포함 3,040g이다. SEL300F28GM은 마운트 제외 1,470g, 신형 400mm F4.5·600mm F6.3은 발 제외 994g·995g이다. SEL400F28GM은 현재 한국·미국 사양 2,895g, 한국 출시 자료 2,897g으로 다르다. 2g 차이의 구성과 원인은 미확인이다. 두 값을 같은 조건으로 승격하면 기존 충돌 검사에서 차단된다. 후속 작업에서도 기준이 확인되지 않으면 **무게만 UNKNOWN**으로 둔다. 후드·캡·발을 임의로 합산하지 않는다. [400mm 현재 사양](https://www.sony.co.kr/electronics/support/lenses-e-mount-lenses/sel400f28gm/specifications) · [400mm 한국 출시 자료](https://www.sony.co.kr/handler/DisplayNewsList-Detail?BBSTYPESEQ=112&noticeNo=29875)
- **필터.** SEL100400MC는 전면 95mm를 후보로 삼고 후면 드롭인 40.5mm는 조건에 둔다. 300mm F2.8, 400mm F2.8, 600mm F4의 40.5mm는 후면 삽입형이다. 전면 필터처럼 읽히지 않도록 해당 모델의 숫자 leaf를 보류한다. SELC1635G의 114mm는 전면 외경이다. 한국 필터 행은 대시이고 1,390g에 탈착 서보가 포함되는지는 미확인이다. [Sony 100–400 사양](https://www.sony.co.kr/electronics/support/lenses-e-mount-lenses/sel100400mc/specifications) · [Sony Pro 시네 제품](https://pro.sony/en_GB/products/camera-lenses/selc1635g)
- **TC.** 7개가 SEL14TC·SEL20TC를 모두 지원한다. STF와 시네 줌은 사양표가 양쪽 대시이고 공식 호환 목록에 없다. 30mm·50mm 매크로는 개별 TC 행 없이 호환 목록 미등재여서 UNKNOWN으로 구분했다. TC는 실제 조합 초점거리를 1.4×/2× 늘리고 최대 개방 조리개를 바꾼다. 400mm F2.8의 F4/F5.6, 600mm F4의 F5.6/F8은 Sony가 직접 명시한 조합값이다. 다른 모델은 제조사가 공개한 조건만 붙인다. [Sony 1.4× 호환표](https://support.d-imaging.sony.co.jp/www/cscs/accessories/compatibility.php?area=us&cat=8&lang=en&mdl=SEL14TC) · [Sony 2× 호환표](https://support.d-imaging.sony.co.jp/www/cscs/accessories/compatibility.php?area=us&cat=8&lang=en&mdl=SEL20TC) · [400mm 제품](https://www.sony.co.kr/electronics/camera-lenses/sel400f28gm) · [600mm 제품](https://www.sony.co.kr/electronics/camera-lenses/sel600f40gm)
- **바디 제한.** 600mm F6.3과 α9(ILCE-9), SEL20TC 조합의 위상차 AF는 바디 펌웨어 5.00 이상이 조건이다. 400mm F4.5와 α6300, SEL20TC는 노출 설정 가이드 F64 초과 표시 제한이 있다. 100mm Macro와 α5100의 TC 조합은 AF-C 초점 및 EXIF 표시 조건이 있다. [Sony α9/600mm](https://support.d-imaging.sony.co.jp/www/cscs/lens_body/detail.php?area=gb&lang=en&prdct_name=SEL600F63GM&rel_prdct_name=ILCE-9) · [Sony α6300/400mm](https://support.d-imaging.sony.co.jp/www/cscs/accessories/detail.php?area=us&lang=en&value1=ILCE-6300&value2=SEL400F45GM) · [Sony α5100/100mm Macro](https://support.d-imaging.sony.co.jp/www/cscs/accessories/detail.php?area=CA&lang=en&value1=ILCE-5100&value2=SEL100M28GM)

## 시네 조리개와 출시 예정 어안

- SELC1635G는 실제 16–35mm, 전 구간 F2.8과 T3.1을 각각 명시한다. 최대 F-number leaf에 F2.8을 쓰고 T3.1, 최소 F22/T25, 수동·파워 줌, 탈착 서보, 플로팅 초점은 provenance에 둔다. [Sony 시네 제품](https://www.sony.co.kr/electronics/camera-lenses/selc1635g) · [Sony 시네 사양](https://www.sony.co.kr/electronics/support/lenses-e-mount-lenses/selc1635g/specifications)
- STF의 F2.8과 T5.6은 약 2스톱 차이다. 숫자 검증은 F/T 의미를 판별하지 못하며 현재 밝기 비교는 F값이 같으면 밝기 유지로 표시한다. Pilot에서는 F2.8 후보와 aperture UNKNOWN 후보의 소비 경로를 비교한다. 소비 경로에서 투과율 오해가 남으면 aperture를 UNKNOWN으로 두고 F/T 원문을 known claim의 조건에 보존한다. [밝기 비교 구현](../src/cameraComparisons.js) · [격리 테스트](../tests/sonyLensSpecialPreflight.test.js)
- SEL814G는 **출시 예정**이다. 8–14mm F3.5, 8mm 풀프레임 원형 이미지와 14mm 대각선 어안, 180° 어안 화각, 후면 시트 필터가 공식 근거에 있다. 숫자 필터 구경과 정확한 APS-C 이미지 서클·투영 수식은 미확인이다. 출시 후 원형/대각선 투영과 포맷별 이미지 서클을 별도 검토한다. [Sony Korea 어안 제품](https://www.sony.co.kr/electronics/e-mount-lenses/sel814g?sku=sel814gb.syx) · [Sony UK 후면 필터 사양](https://www.sony.co.uk/electronics/e-mount-lenses/sel814g/specifications)

## 계약과 후속 거래

| 검토 범위 | 판단 |
| --- | --- |
| 지원 leaf | 모델 identity, 물리 마운트, actual focal mm, 최대 F-number, OSS boolean/null, coverage enum, 무게 g, 필터 mm, 최단거리 m와 조건 문자열. 후보 11개의 lens shape를 검사했다. |
| Provenance | 배율/작동거리, AF/MF·리미터·플로팅, D×L, 삼각대·액세서리 구성, 후면 필터, 최소 F와 T-stop, TC·바디/펌웨어·AF, PZ/서보, APD, OSS 모드와 조합 조건. 후속 승인에서 known leaf의 공식 출처·locator와 조건을 연결한다. |
| 현재 표현 한계 | 단일 숫자 필터는 장착 방식을 전달하지 못한다. 별도 배율·T-stop·시네/PZ·투영·이미지 서클·삼각대 구성·TC 호환 매트릭스는 feature DB 후보로 분리한다. |
| Validation 변경 | 필수 변경 0건. 기존 unit/type, ordered endpoints, CONFLICTING_CLAIM_VALUES, identity lock과 명시 승인 게이트를 사용한다. 숫자 T-stop이나 TC 장착값의 오배치는 출처 및 diff 검토에서 잡는다. |
| Blocking issue | 10개 기본 등록에는 구조적 차단 없음. 400mm F2.8 무게는 확인 전 UNKNOWN. STF의 밝기 해석은 별도 pilot 게이트다. |
| 기존 audit backlog | 필터 UNKNOWN, SEL2470GM OSS 미기재, SEL200600G 탈착 마운트 포함 미확인, AF/MF, TC, PZ와 특수 광학 소비 경로를 전체 coverage audit에서 대조한다. |

권장안 **B**는 일반 계약 호환 **10개 단일 atomic 거래**와 **STF 1개 별도 pilot**이다. 분할 근거는 STF의 노출 의미다. 시네 줌의 F-number는 제조사가 별도로 명시해 기존 계약으로 처리 가능하다. 후속 거래는 현행 목록과 identity 재확인, 제품별 공식 자료와 extraction, strict validate, 사람용 diff, 명시 승인, atomic apply, canonical validation과 idempotent replay 순이다. 첫 거래 후 예상 68/69, STF 완료 후 예상 69/69다. 마지막에 공식 목록을 새로 조회하고 전체 provenance coverage audit을 진행한다.

## 출처와 검증

- 제품별 공식 출처 2–4개, 총 33개다. 갤러리·공용 TC 표·어안 예비 검토·최단거리 정의 7개를 포함해 총 40개를 스냅샷에 기록했다. DeepSeek 호출 0회, 0토큰이다.
- 전체 516/516, Objective 489/489, Sony 렌즈 134/134가 통과했다. 신규 메모리 격리 테스트 3개는 원본/TC 값과 배율의 분리, F/T 및 후면 필터, STF 밝기 소비 경로를 검증한다.
- Canonical validation, pnpm build, 변경 JS node --check 및 git diff --check 통과. 빌드는 기존 번들 크기 경고를 표시했다.
- Canonical 165 바디 / 88 렌즈 / 253 전체. SHA-256 `be1d1707e2556e714d2a9b02d02863b4a7fda88e295ba1c3865db68662e2eee2`가 baseline과 일치한다. Git diff로 기존 ingestion 파일과 sealed artifact가 baseline과 일치함을 확인했다. Production apply와 신규 production artifact 생성은 0건이다.
- Git main, 기존 진행 문서 1개 수정, 신규 preflight 보고·스냅샷·격리 테스트 3개 미추적, 커밋 전이다.
