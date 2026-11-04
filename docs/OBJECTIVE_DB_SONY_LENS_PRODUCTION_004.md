# Sony E-Mount 렌즈 Production Batch 004 — 2026-11-04

일반 APS-C 9개 신규 적용 완료. **165/66/231**, Sony 현행 **34/69 완료, 35개 잔여**. SELP1020G 중복 없음, 매크로는 특수군으로 유지.

| 모델 | 공식 이름 | 유형 | 실제 mm | 최대 F | OSS | 최단거리 조건 | 배율 | 필터 mm | D×L mm | g | 소스 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| [SEL15F14G](https://www.sony.co.kr/lenses/products/sel15f14g) | E 15mm F1.4 G | prime/— | 15–15 | 1.4–1.4 | false | 0.20m AF; 0.17m MF | 0.12x AF; 0.15x MF | 55 | 66.6 × 69.5 | 219 | [2](https://www.sony.co.kr/lenses/products/sel15f14g/spec?sku=sel15f14g-csyx) |
| [SEL11F18](https://www.sony.co.kr/lenses/products/sel11f18) | E 11mm F1.8 | prime/— | 11–11 | 1.8–1.8 | false | 0.15m AF; 0.12m MF | 0.13x AF; 0.20x MF | 55 | 66 × 57.5 | 181 | [2](https://www.sony.co.kr/lenses/products/sel11f18/spec) |
| [SEL1655G](https://www.sony.co.kr/electronics/camera-lenses/sel1655g) | E 16-55mm F2.8 G | zoom/constant-aperture | 16–55 | 2.8–2.8 | false | Published 0.33m; AF/MF and zoom position not specified | 0.20x | 67 | 73 × 100 | 494 | [2](https://www.sony.co.kr/electronics/camera-lenses/sel1655g/specifications) |
| [SEL70350G](https://www.sony.co.kr/electronics/camera-lenses/sel70350g) | E 70-350mm F4.5-6.3 G OSS | zoom/variable-aperture | 70–350 | 4.5–6.3 | true | Published range 1.1–1.5m; 1.1m is lower bound only; exact focal position and AF/MF unspecified | 0.23x; focal position not specified | 67 | 77 × 142 | 625 | [2](https://www.sony.co.kr/electronics/camera-lenses/sel70350g/specifications) |
| [SELP18105G](https://www.sony.co.kr/electronics/camera-lenses/selp18105g) | E PZ 18-105mm F4 G OSS | zoom/PZ | 18–105 | 4–4 | true | 0.45m wide; 0.95m tele; AF/MF unspecified | 0.11x; focal position not specified | 72 | 78 × 110 | 427 | [2](https://www.sony.co.kr/electronics/camera-lenses/selp18105g/specifications) |
| [SEL20F28](https://www.sony.co.kr/electronics/camera-lenses/sel20f28) | E 20mm F2.8 | prime/— | 20–20 | 2.8–2.8 | UNKNOWN | Published 0.20m; mode unspecified | 0.12x | 49 | 62.6 × 20.4 | 69 | [2](https://www.sony.co.kr/electronics/camera-lenses/sel20f28/specifications) |
| [SEL24F18Z](https://www.sony.co.kr/electronics/camera-lenses/sel24f18z) | Sonnar T* E 24mm F1.8 ZA | prime/— | 24–24 | 1.8–1.8 | UNKNOWN | Published 0.16m; mode unspecified | 0.25x (1:4); inconsistent 4:1 feature wording not used | 49 | 63 × 65.5 | 225 | [2](https://www.sony.co.kr/electronics/camera-lenses/sel24f18z/specifications) |
| [SEL50F18](https://www.sony.co.kr/electronics/camera-lenses/sel50f18) | E 50mm F1.8 OSS | prime/— | 50–50 | 1.8–1.8 | true | Published 0.39m; mode unspecified | 0.16x | 49 | 62 × 62 | 202 | [2](https://www.sony.co.kr/electronics/camera-lenses/sel50f18/specifications) |
| [SEL55210](https://www.sony.co.kr/electronics/camera-lenses/sel55210) | E 55-210mm F4.5-6.3 OSS | zoom/variable-aperture | 55–210 | 4.5–6.3 | true | 1m at tele; wide not specified; AF/MF unspecified | 0.225x; focal position not specified | 49 | 63.8 × 108 | 345 | [2](https://www.sony.co.kr/electronics/camera-lenses/sel55210/specifications) |

1. 공식 APS-C: 일반 10개, 특수 매크로 SEL30M35 포함 11개. SELP1020G는 001 완료. 공식 갤러리의 현재 카탈로그 기준이며 실제 재고와 다르다.
2. 선정 모델: SEL15F14G, SEL11F18, SEL1655G, SEL70350G, SELP18105G, SEL20F28, SEL24F18Z, SEL50F18, SEL55210. Worker 전에 checkpoint에 고정했다.
3. 실제 처리: 9개, 하나의 atomic transaction.
4. 신규 9개 / 기존 보강 0개. APS-C SEL50F18과 FE SEL50F18F는 독립 모델이다.
5. Canonical: 165/57/222 → 165/66/231. 기존 바디·렌즈·가격 유지.
6. 누적: 34/69 (001~003의 25 + 이번 9).
7. 미처리: 35개. 과거 67개 분모를 고정하면 33개다.
8. 단렌즈 5개, 줌 4개. 줌은 고정 최대 조리개 2개(그중 PZ 1개), 가변 최대 조리개 2개. PZ는 줌 동작 근거에만 보존.
9. 실제 초점거리: 위 표의 mm 값. 환산 초점거리는 승격하지 않았다.
10. 최대 조리개: 표의 wide–tele. 최소 조리개는 근거 조건에만 보존.
11. 포맷: 전부 APS-C, 모델별 검증된 fieldEvidence.
12. 물리 마운트: 전부 기존 Sony E, 별도 APS-C 마운트 추가 없음.
13. OSS: true 4 / false 3 / UNKNOWN 2. 바디 통합 표기는 렌즈 OSS 부재, 바디 IBIS 수치가 아니다.
14. 최단거리: 표 참조. AF/MF 분리, 70–350의 하한 및 18–105/55–210의 줌 위치를 보존. 일반 Sony 촬상면 기준은 참고이며 개별 수치 행에 명시되지 않음.
15. 배율: 표 참조, 미승격. 24mm ZA는 0.25×와 1:4가 일치하므로 기능 본문의 4:1 표현을 사용하지 않았다.
16. 필터 직경: 표 참조, mm.
17. 치수: 표 참조, D×L mm. 근거에만 보존.
18. 무게: 표 참조, g. 렌즈 무게이며 후드·캡 포함 여부는 명시되지 않았다.
19. 소스: 제품마다 공식 제품 + 공식 사양 2개, 총 18개. 88개 검증 필드와 identity 9개.
20. 승격 값 충돌 0. 원문 표기 문제(1.4k, 4:1)는 아래 정규화 항목처럼 분리.
21. UNKNOWN: 20mm/24mm ZA OSS, 미명시 초점 모드·줌 위치 및 액세서리 포함 조건.
22. 기존 model null-fill 0: 전부 신규. 기존 null-fill 회귀 통과.
23. Identity lock 유지. 기존 매핑 불변, 공식 코드 9개 append; 신규 승인만 명시, conflict/모델 보강 플래그 미사용.
24. 제품별 worker 토큰: 아래 표.
25. 총 worker 토큰: {"inputTokens":5362,"outputTokens":4271,"totalTokens":9633}.
26. 독립 task 9개 / 실제 API 9회 / 재시도 0 / 실패 0. Public fixture 삭제.
27. Worker는 범위/사양/조건을 구조화하는 데 사용. 제안은 공식 자료와 대조했으며 패치를 적용하지 않았다.
28. Sol은 공식 목록과 기록 대조, 신규 ID, 사양 귀속, OSS/초점/배율 조건, UNKNOWN, diff와 승인·적용을 직접 판단.
29. 추가 사용자 제품 판단 0. 사람 작업 시간은 측정하지 않았다.
30. 정규화: 15mm의 1.4k를 파싱하지 않고 공식 F1.4 본문에 귀속. 24mm ZA의 4:1은 표 0.25× 및 본문의 1:4와 불일치해 제외. 색상은 별도 ID로 만들지 않았다.
31. 새 pipeline/schema blocker 없음. PZ/배율/치수는 근거 보존; 기존 계약·추천·UI·가격 DB 변경 없음.
32. accessedAt: 실제 2026-11-04T00:12:11.804Z–00:12:40.189Z UTC 브라우저 조회 시각을 raw-helper에 전달.
33. 전체 테스트: 503/503; 신규 5개.
34. Objective 테스트: 476/476 (추천 전용 두 파일 제외).
35. Sony lens 테스트: 121/121 (이전 회귀 유지).
36. Body/brand: 246/246.
37. Canonical validation 통과. 새 SHA-256 7e4e5fb76a37759917921dd839c418c07031cf4a4be2fe000c08f137f2263e20.
38. Build, node --check 8파일, git diff --check 통과. 기존 Vite 청크 크기 경고 유지.
39. 실제 CLI 재적용 already-canonicalized / canonicalMatches: true. Sealed before/after 재생도 일치.
40. Git: main에서 clean 시작. 작업 결과는 미커밋이며 commit/push/amend 하지 않았다. 기존 sealed artifact 수정 없음.
41. 일반 APS-C 미처리 0. 매크로 SEL30M35 1개는 특수군 잔여에 포함.
42. FE 일반 줌 미처리 24개.
43. 특수군 미처리 11개.
44. 11월 4일 공식 갤러리 73개 카드, 2개 곧 공개 + 2개 텔레컨버터 제외 = 69개. 과거 snapshot과 코드 집합 동일, 003 조정 이후 추가 상태 변화 없음.
45. SEL400F45GM/SEL600F63GM 현행 유지, 후속 망원·특수군 대기. SEL814G/SEL28702 출시 예정 유지.
46. 다음: Batch 005 FE 줌 12개. 아래 계획 참조.
47. 005·006 일반 줌 각 12개, 특수군 11개 사전 검토 및 처리 후 공식 목록/예외/증거/재생을 최종 audit.

| Worker | Input | Output | Total |
|---|---:|---:|---:|
| SEL15F14G | 620 | 507 | 1127 |
| SEL11F18 | 582 | 471 | 1053 |
| SEL1655G | 589 | 480 | 1069 |
| SEL70350G | 618 | 515 | 1133 |
| SELP18105G | 596 | 442 | 1038 |
| SEL20F28 | 580 | 413 | 993 |
| SEL24F18Z | 603 | 459 | 1062 |
| SEL50F18 | 578 | 424 | 1002 |
| SEL55210 | 596 | 560 | 1156 |

- production-sony-e-lenses-005: SEL100400, SEL50150GM, SEL400800G, SEL2870GM, SEL1625G, SEL2450G, SEL1635GM2, SEL70200G2, SEL2070G, SELP1635G, SEL70200GM2, SEL1224GM
- production-sony-e-lenses-006: SEL70200G, SEL70200GM, SEL200600G, SEL24105G, SEL1635GM, SEL1224G, SEL100400GM, SEL24240, SEL2470GM, SEL2470Z, SELP28135G, SEL70300G
- production-sony-e-lenses-007: SEL100400MC, SEL100M28GM, SEL300F28GM, SELC1635G, SEL100F28GM, SEL600F40GM, SEL400F28GM, SEL30M35, SEL50M28, SEL400F45GM, SEL600F63GM

[체크포인트](../src/data/ingestion/sony-e-lenses-production-004.json) · [회귀 테스트](../tests/sonyLensProduction004.test.js)
