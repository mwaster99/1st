# Sony E-Mount 순정 렌즈 Production Batch 005

광각·표준 FE 줌 12개를 한 번의 atomic apply로 반영했다. 신규 11개와 기존 PZ 16–35mm 1개를 처리해 Sony 현행 렌즈 69개 중 46개가 완료됐다.

1. 선정 모델 — SEL2870GM, SEL1625G, SEL2450G, SEL1635GM2, SEL2070G, SELP1635G, SEL1224GM, SEL24105G, SEL1635GM, SEL1224G, SEL2470GM, SEL2470Z. 공식 현행 광각·표준 줌을 우선했고 Batch 001–004 처리 이력을 제외했다.
2. 실제 처리 — 12개.
3. 신규 11개, 기존 보강 1개.
4. Canonical 바디/렌즈/전체 — 165/66/231 → 165/77/242.
5. Sony 누적 — 34 → 46개.
6. Sony 미처리 — 35 → 23개.
7. FE 줌 미처리 — 24 → 12개.
8. 실제 초점거리(mm) — 아래 표.
9. 최대 조리개 W/T와 최소 선택 조리개 — 아래 표. 전부 고정 최대 조리개 줌.
10. 물리 마운트 — 전 제품 Sony E.
11. 포맷 — 전 제품 full-frame.
12. OSS — 있음 2개, 없음 9개, UNKNOWN 1개.
13. 최단 초점거리(m) — 아래 표. 확인된 AF/MF와 W/T 조건 보존.
14. 최대 배율 — 아래 표. 조건과 함께 claim metadata에 보존.
15. 필터 직경(mm) — 아래 표.
16. 외경 × 길이(mm) — 아래 표. claim metadata에 보존.
17. 렌즈 무게(g) — 아래 표. 액세서리 포함 여부를 추정하지 않았다.
18. 신규 공식 source — 제품당 2개(제품 identity, 사양), 총 24개. PZ의 기존 출처도 유지했다.
19. 값 충돌 — 0건. 16–25mm의 KR 본문 0.79m 표기는 공식 사양표 및 Sony 지원 자료의 AF T 0.79ft, MF T 0.22m와 대조했다. [Sony 지원 사양](https://www.sony.com/electronics/support/lenses-e-mount-lenses/sel1625g/specifications)
20. UNKNOWN 3건 — SEL1224G는 필터 장착 불가, SEL1224GM은 후면 시트 템플릿이며 둘 다 숫자 직경은 없다. SEL2470GM은 공식 사양표에 OSS 항목이 없다. [Sony 12–24 GM 공식 사양](https://www.sony.co.kr/electronics/support/lenses-e-mount-lenses/sel1224gm/specifications)
21. Model null-fill — sony-fe-pz-16-35-f4에 SELP1635G를 명시 승인으로 등록. 사양 null-fill 5개, 동일값 근거 보강 5개.
22. Identity lock — 기존 PZ ID/이름/브랜드/별칭/마운트/타입/가격 유지. GM 세대별 ID는 독립 유지. 기존 바디 165개 및 그 외 기존 렌즈 65개 동일.
23. 제품별 worker 토큰 — 아래 표.
24. 총 토큰 — 7204 / 5714 / 12918 (입력 / 출력 / 합계).
25. 실제 API 호출 12회, 재시도 0, 실패 0.
26. Worker는 공개 사양 구조화와 조건 경고에 사용했다. 공통 필드를 공식 자료와 대조해 채택했으며 worker 패치는 없었다.
27. 직접 판단 — 공식 현행 범위, 코드와 세대, PZ model null-fill, 필터와 OSS UNKNOWN, AF/MF 대표거리와 출처 표기 차이, diff/승인.
28. 개입량 — 12개 제품과 120개 사양 경로 직접 검토. 사용자 추가 판단 0회. 공개 입력 fixture 12개 삭제.
29. 정규화 — 20–70mm는 AF T 0.25m와 AF W 0.30m를 구분. PZ의 0.28–0.24m는 모드 미표기인 채 보존했다. PZ와 OSS는 독립이다.
30. Pipeline/schema — 신규 차단 이슈 0건. 배율/치수/최소 F/PZ 및 후면 필터 형식은 기존 claim metadata로 보존했다.
31. accessedAt — 2026-11-04T00:41:06.261Z ~ 2026-11-04T00:41:37.427Z. 24개 raw timestamp가 제품/사양 실제 조회 시각과 정확히 일치했다.
32. 전체 테스트 — 508/508.
33. Objective/production/catalog/coverage — 481/481.
34. Sony 렌즈 및 계약 테스트 — 126/126 (Batch 005 신규 5개 포함).
35. 기존 바디/브랜드 회귀 — 246/246.
36. Canonical validation — 통과. 트랜잭션 before/after가 각각 HEAD와 현재 canonical 바이트에 일치.
37. pnpm build, node --check(8개 파일), git diff --check 통과. Build에 기존 번들 크기 경고가 표시됐다.
38. 실제 재적용 — already-canonicalized / canonicalMatches: true. After SHA-256 1fc8e78e53ac36d885adbfeeca1badcc6af055428a2884c458523e30130aee3f.
39. Git — main, 커밋 전. 기존 수정은 canonical, identity map, 진행 문서 3개. 신규 Batch 005 증거/회귀/보고 파일은 untracked. 기존 sealed artifact 변경 0.
40. 분모 — 2026-11-04 Sony Korea 73카드에서 upcoming 2개(SEL814G, SEL28702)와 TC 2개(SEL14TC, SEL20TC)를 분리해 69개. 공식 카탈로그 상태 기준이다. [Sony Korea 렌즈 갤러리](https://www.sony.co.kr/lenses/gallery)
41. 잔여 FE 줌 12개 — SEL100400, SEL50150GM, SEL400800G, SEL70200G2, SEL70200GM2, SEL70200G, SEL70200GM, SEL200600G, SEL100400GM, SEL24240, SELP28135G, SEL70300G.
42. 잔여 특수 11개 — SEL100400MC, SEL100M28GM, SEL300F28GM, SELC1635G, SEL100F28GM, SEL600F40GM, SEL400F28GM, SEL30M35, SEL50M28, SEL400F45GM, SEL600F63GM.
43. 다음 Batch 006 — 잔여 FE 줌 후보를 먼저 대조하고 삼각대 칼라 무게, 매크로/TC, PZ 조건을 사전 검토한다.
44. 전체 coverage audit까지 — FE 줌 Batch 006, 특수군 Batch 007 사전 검토 및 필요 시 분할 처리, 마지막에 공식 목록 재조회와 production 기록 대조.

## 제품별 사양

| 모델 | 작업 | 초점거리 mm | 최대 F W/T (최소 F) | OSS | 최단거리와 조건 | 최대 배율 | 필터 mm | 외경 × 길이 mm | g | 출처 |
|---|---|---|---|---|---|---|---|---|---|---|
| SEL2870GM | 신규 | 28–70 | 2 / 2 (최소 F22) | 없음 | 0.38m; position/mode unspecified | 0.23x | 86 | 92.9 × 139.8 | 918 | 2 |
| SEL1625G | 신규 | 16–25 | 2.8 / 2.8 (최소 F22) | 없음 | AF W 0.18m/T 0.24m; MF W 0.17m/T 0.22m | 0.20x AF; 0.23x MF | 67 | 74.8 × 91.4 | 409 | 2 |
| SEL2450G | 신규 | 24–50 | 2.8 / 2.8 (최소 F22) | 없음 | AF W 0.19m/T 0.30m; MF W 0.18m/T 0.29m | 0.30x AF; 0.33x MF | 67 | 74.8 × 92.3 | 440 | 2 |
| SEL1635GM2 | 신규 | 16–35 | 2.8 / 2.8 (최소 F22) | 없음 | 0.22m W/T; mode unspecified | 0.32x | 82 | 87.8 × 111.5 | 547 | 2 |
| SEL2070G | 신규 | 20–70 | 4 / 4 (최소 F22) | 없음 | AF W 0.30m/T 0.25m; MF 0.25m | 0.39x | 72 | 78.7 × 99 | 488 | 2 |
| SELP1635G | 기존 | 16–35 | 4 / 4 (최소 F22) | 없음 | Published 0.28–0.24m; 0.24m lower bound, mode not specified | 0.23x | 72 | 80.5 × 88.1 | 353 | 2 |
| SEL1224GM | 신규 | 12–24 | 2.8 / 2.8 (최소 F22) | 없음 | 0.28m; position/mode unspecified | 0.14x | UNKNOWN | 97.6 × 137 | 847 | 2 |
| SEL24105G | 신규 | 24–105 | 4 / 4 (최소 F22) | 있음 | 0.38m; position/mode unspecified | 0.31x | 77 | 83.4 × 113.3 | 663 | 2 |
| SEL1635GM | 신규 | 16–35 | 2.8 / 2.8 (최소 F22) | 없음 | 0.28m; position/mode unspecified | 0.19x | 82 | 88.5 × 121.6 | 680 | 2 |
| SEL1224G | 신규 | 12–24 | 4 / 4 (최소 F22) | 없음 | 0.28m; position/mode unspecified | 0.14x | UNKNOWN | 87 × 117.4 | 565 | 2 |
| SEL2470GM | 신규 | 24–70 | 2.8 / 2.8 (최소 F22) | UNKNOWN | 0.38m; position/mode unspecified | 0.24x | 82 | 87.6 × 136 | 886 | 2 |
| SEL2470Z | 신규 | 24–70 | 4 / 4 (최소 F22) | 있음 | 0.40m; position/mode unspecified | 0.20x | 67 | 73 × 94.5 | 426 | 2 |

## 제품별 worker 토큰

| 모델 | 입력 | 출력 | 합계 |
|---|---:|---:|---:|
| SEL2870GM | 583 | 429 | 1012 |
| SEL1625G | 696 | 565 | 1261 |
| SEL2450G | 616 | 456 | 1072 |
| SEL1635GM2 | 585 | 405 | 990 |
| SEL2070G | 583 | 465 | 1048 |
| SELP1635G | 602 | 469 | 1071 |
| SEL1224GM | 599 | 497 | 1096 |
| SEL24105G | 586 | 522 | 1108 |
| SEL1635GM | 587 | 430 | 1017 |
| SEL1224G | 593 | 495 | 1088 |
| SEL2470GM | 585 | 515 | 1100 |
| SEL2470Z | 589 | 466 | 1055 |

공식 URL, worker 결과 및 재개 위치는 [Batch 005 checkpoint](../src/data/ingestion/sony-e-lenses-production-005.json)에 기록했다.
