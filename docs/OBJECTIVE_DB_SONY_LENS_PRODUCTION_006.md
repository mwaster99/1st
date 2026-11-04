# Sony E-Mount 순정 렌즈 Production Batch 006

잔여 일반 FE 줌 12개를 한 번의 atomic apply로 반영했다. 신규 11개와 70–200mm F2.8 GM II 보강 1개다. Sony 현행 69개 중 58개가 완료됐으며 특수군 11개가 남았다.

1. 선정 모델 — SEL100400, SEL50150GM, SEL400800G, SEL70200G2, SEL70200GM2, SEL70200G, SEL70200GM, SEL200600G, SEL100400GM, SEL24240, SELP28135G, SEL70300G.
2. 실제 처리 — 선정한 12개 전부. 공식 현행 목록에서 Batch 001–005 완료 제품과 특수군을 분리했다.
3. 신규 11개, 기존 보강 1개.
4. Canonical 바디/렌즈/전체 — 165/77/242 → 165/88/253.
5. Sony 누적 — 46 → 58개.
6. Sony 전체 미처리 — 23 → 11개.
7. 일반 FE 줌 미처리 — 12 → 0개.
8. 특수군 미처리 — 11개.
9. 실제 초점거리(mm) — 아래 표. 장착 후 TC·APS-C 환산 범위는 별도 조건.
10. 최대 조리개 W/T와 최소 선택 조리개 — 아래 표. 고정 6개, 가변 6개.
11. 물리 마운트 — 전 제품 Sony E.
12. 이미지 포맷 — 전 제품 full-frame.
13. 렌즈 OSS — 있음 11개, 없음 1개. SEL50150GM은 Sony 표가 바디 보정만 명시했다.
14. 최단 초점거리 — 아래 표. 공식 표가 범위만 주면 최솟값과 범위를 함께 보존했다. AF/MF 또는 W/T 미표기 조건은 그대로 남겼다.
15. 배율 — 아래 표. SEL70200G2의 전 구간 0.5×와 2× TC 조합 1.0×를 분리했다. [Sony 공식 발표](https://www.sony.eu/presscentre/sony-expands-the-range-of-shooting-possibilities-with-introduction-of-the-fe-70-200mm-f4-macro-g-oss-ii-lens-offering-supreme-image-quality-and-af-performance)
16. TC — 1.4×/2× 모두 지원 7개, 명시 미지원 1개, 공식 호환 목록 미등재 및 개별 사양 미기재 4개. 200–600mm의 TC별 조리개·초점거리와 SEL100400의 α6300/SEL20TC F13 이상 위상차 AF 제한을 조건에 기록했다. 전체 바디에 일반화하지 않았다. [Sony 1.4× 호환표](https://support.d-imaging.sony.co.jp/www/cscs/accessories/compatibility.php?area=us&cat=8&lang=en&mdl=SEL14TC) · [Sony 2× 호환표](https://support.d-imaging.sony.co.jp/www/cscs/accessories/compatibility.php?area=us&cat=8&lang=en&mdl=SEL20TC) · [Sony α6300 조합](https://support.d-imaging.sony.co.jp/www/cscs/accessories/detail.php?area=us&lang=en&value1=ILCE-6300&value2=SEL100400)
17. 필터 — 아래 표. 12개 모두 숫자 직경 확인.
18. 외경 × 길이(mm) — 아래 표. 제조사 수치를 claim metadata에 보존했다.
19. 무게(g) 및 tripod 조건 — 아래 표. 400–800mm는 고정식 풋이 명시됐다. 200–600mm의 2,115g에 탈착식 마운트가 포함되는지는 Sony 표가 명시하지 않는다.
20. 공식 raw source — 총 28개, 제품별 2–3개. 모델·조건과 사양표의 역할을 구분했다.
21. 값 충돌 — 승인 diff 0건. 원문 표기 차이 2건을 해소했다. SEL70200G KR 표의 8.40kg는 동일 모델 Sony USA 29.7oz/840g(삼각대 마운트 제외)으로 교차 확인했다. SEL24240 KR 표의 중복 0.8mm는 같은 KR 행의 0.8m 및 USA metric/imperial과 대조했다. [Sony USA SEL70200G](https://www.sony.com/electronics/support/lenses-e-mount-lenses/sel70200g/specifications) · [Sony USA SEL24240](https://www.sony.com/electronics/support/lenses-e-mount-lenses/sel24240/specifications)
22. 주요 UNKNOWN — 승격 대상 120개 경로의 값은 확인됐다. 일부 AF/MF 및 W/T 배율 조건, 후드·캡 포함 여부, 200–600mm 마운트 포함 여부, 미등재 4개의 개별 TC 조건과 모든 바디별 보정/AF 조합은 확인 범위 밖이다.
23. Model null-fill — sony-fe-70-200-gm2에 SEL70200GM2만 명시 승인. 사양 4개 null-fill 및 동일값 6개 경로의 근거 보강.
24. Identity lock — 기존 ID/이름/브랜드/별칭/마운트/타입/가격과 검증된 사양값 유지. 70–200mm G/GM 각 세대를 구분했다. 기존 바디 165개와 그 외 기존 렌즈 76개는 전부 동일하다.
25. 제품별 worker 토큰과 재시도 — 아래 표.
26. 총 worker 토큰 — 11753 입력 / 9463 출력 / 21216 합계.
27. 독립 task 12개, 실제 호출 14회, 재시도 2회. SEL70200G2는 needs_information, SEL70200GM은 MALFORMED_RESPONSE로 1차 결과를 제외했다. 둘 다 동일 task ID로 1회 재시도해 성공했다.
28. Worker 유용성 — 공식 공개 수치 구조화, 거리 모드, TC와 원본 배율 및 삼각대 조건 경고에 사용했다. 불명확한 최소 조리개 엔드포인트와 TC 결과의 추정은 제외했고, 400–800mm 고정 풋과 별도 무게 조건을 구분했다.
29. 직접 판단 — 현행 분모, 모델별 identity, 한국/미국 출처 범위, 2건 표기 차이, OSS/IBIS 구분, 대표 최단거리, 확대 배율과 TC 조합, 삼각대 조건, diff와 승인.
30. 개입량 — 12개 제품과 120개 고유 사양 경로를 직접 대조했다. 사용자 추가 판단 0회. Worker 공개 입력 파일 12개를 삭제했다.
31. 정규화 — KR 무게/거리 표기 2건의 공식 교차 근거와 텔레컨버터 조건을 별도로 보존했다. SELP28135G는 AF/MF와 Full MF를 구분했다.
32. Pipeline/schema — 신규 차단 문제 0건. PZ·배율·치수·최소 선택 조리개·TC·삼각대·바디별 기능 조건은 기존 claim metadata를 사용했다.
33. accessedAt — 2026-11-04T03:37:59.765Z ~ 2026-11-04T03:40:20.732Z. 모든 raw timestamp가 기록된 실제 공식 페이지 조회 시각과 일치했다.
34. 전체 테스트 — 513/513.
35. Objective/production/catalog/coverage — 486/486.
36. Sony 렌즈 및 계약 — 131/131 (Batch 006 신규 5개 포함).
37. 기존 바디/브랜드 — 246/246.
38. Canonical validation — 통과. 거래 before/after는 각각 HEAD와 현재 canonical 바이트에 일치.
39. pnpm build, node --check(8개 파일), git diff --check 통과. 기존 번들 크기 경고가 표시됐다.
40. 실제 재적용 — already-canonicalized / canonicalMatches: true. After SHA-256 be1d1707e2556e714d2a9b02d02863b4a7fda88e295ba1c3865db68662e2eee2.
41. Git — main, 커밋 전. 기존 파일 3개 수정(canonical, identity map, 진행 문서), 신규 Batch 006 경로 37개 미추적. 기존 sealed artifact 변경 0.
42. 공식 분모 — Sony Korea 73카드에서 upcoming 2개(SEL814G, SEL28702)와 TC 2개(SEL14TC, SEL20TC)를 분리한 69개. 카탈로그 상태 기준이다. [Sony Korea 렌즈 갤러리](https://www.sony.co.kr/lenses/gallery)
43. 특수군 11개 — SEL100400MC, SEL100M28GM, SEL300F28GM, SELC1635G, SEL100F28GM, SEL600F40GM, SEL400F28GM, SEL30M35, SEL50M28, SEL400F45GM, SEL600F63GM.
44. Batch 007 — Batch 006 변경 검토·커밋 후 clean 상태에서 특수군 preflight 가능. STF의 F/T 값, 매크로의 원본/TC 배율, 시네 줌, 초망원 풋 조건을 모델별로 확인한다.
45. 전체 coverage audit까지 — 특수군 검증 및 필요 시 분할 production 후 공식 목록을 새로 조회해 canonical/production 기록과 대조한다.

## 제품별 사양

| 모델 | 작업 | 초점거리 mm | 최대 W/T (최소 선택) | OSS | 최단거리 | 원본 최대 배율 | 1.4× 및 2× TC | 필터 mm | 외경 × 길이 mm | g / 측정 조건 | 출처 수 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| [SEL100400](https://www.sony.co.kr/electronics/support/lenses-e-mount-lenses/sel100400/specifications) | 신규 | 100–400 | F5.6 / F8 (F32–45) | 있음 | 1.13 m W / 0.86 m T; AF/MF unspecified | 0.41× | 둘 다 지원 | 67 | 78.2 × 164.5 | 654 (unspecified) | 3 |
| [SEL50150GM](https://www.sony.co.kr/electronics/support/lenses-e-mount-lenses/sel50150gm/specifications) | 신규 | 50–150 | F2 / F2 (F22) | 없음 | 0.40 m W / 0.74 m T; AF/MF unspecified | 0.2× | 둘 다 미지원 | 95 | 102.8 × 200 | 1340 (without tripod base per product; without tripod mount per spec) | 2 |
| [SEL400800G](https://www.sony.co.kr/electronics/support/lenses-e-mount-lenses/sel400800g/specifications) | 신규 | 400–800 | F6.3 / F8 (F36–45) | 있음 | Published 1.7–3.5 m; 1.7 m lower bound; mode unspecified | 0.23× | 둘 다 지원 | 105 | 119.8 × 346 | 2475 (fixed tripod foot per product; weight table gives no separate accessory basis) | 2 |
| [SEL70200G2](https://www.sony.co.kr/electronics/support/lenses-e-mount-lenses/sel70200g2/specifications) | 신규 | 70–200 | F4 / F4 (F22) | 있음 | Published 0.26–0.42 m; 0.26 m lower bound; mode unspecified | 0.5× | 둘 다 지원 | 72 | 82.2 × 149 | 794 (without tripod mount (Sony specification footnote)) | 3 |
| [SEL70200GM2](https://www.sony.co.kr/electronics/support/lenses-e-mount-lenses/sel70200gm2/specifications) | 기존 | 70–200 | F2.8 / F2.8 (F22) | 있음 | Published 0.40–0.82 m; 0.40 m lower bound; mode unspecified | 0.3× | 둘 다 지원 | 77 | 88 × 200 | 1045 (without tripod mount) | 2 |
| [SEL70200G](https://www.sony.co.kr/electronics/support/lenses-e-mount-lenses/sel70200g/specifications) | 신규 | 70–200 | F4 / F4 (F22) | 있음 | AF 1–1.5 m / MF 1–1.35 m; 1 m lower bound | 0.13× | 둘 다 공식 목록 미등재 | 72 | 80 × 175 | 840 (without tripod mount per Sony US) | 3 |
| [SEL70200GM](https://www.sony.co.kr/electronics/support/lenses-e-mount-lenses/sel70200gm/specifications) | 신규 | 70–200 | F2.8 / F2.8 (F22) | 있음 | 0.96 m; focal position and focus mode unspecified | 0.25× | 둘 다 지원 | 77 | 88 × 200 | 1480 (without tripod mount) | 2 |
| [SEL200600G](https://www.sony.co.kr/electronics/support/lenses-e-mount-lenses/sel200600g/specifications) | 신규 | 200–600 | F5.6 / F6.3 (F32–36) | 있음 | 2.4 m; focal position and focus mode unspecified | 0.2× | 둘 다 지원 | 95 | 111.5 × 318 | 2115 (tripod mount/collar present, published mass does not specify inclusion) | 2 |
| [SEL100400GM](https://www.sony.co.kr/electronics/support/lenses-e-mount-lenses/sel100400gm/specifications) | 신규 | 100–400 | F4.5 / F5.6 (F32–40) | 있음 | 0.98 m; focal position and focus mode unspecified | 0.35× | 둘 다 지원 | 77 | 93.9 × 205 | 1395 (without tripod mount) | 2 |
| [SEL24240](https://www.sony.co.kr/electronics/support/lenses-e-mount-lenses/sel24240/specifications) | 신규 | 24–240 | F3.5 / F6.3 (F22–40) | 있음 | Published 0.50–0.80 m; 0.50 m lower bound; AF/MF unspecified | 0.27× | 둘 다 공식 목록 미등재 | 72 | 80.5 × 118.5 | 780 (unspecified) | 3 |
| [SELP28135G](https://www.sony.co.kr/electronics/support/lenses-e-mount-lenses/selp28135g/specifications) | 신규 | 28–135 | F4 / F4 (F22) | 있음 | AF/MF 0.40 m W / 0.95 m T; Full MF 0.95 m | 0.15× | 둘 다 공식 목록 미등재 | 95 | 105 × 162.5 | 1215 (without tripod mount) | 2 |
| [SEL70300G](https://www.sony.co.kr/electronics/support/lenses-e-mount-lenses/sel70300g/specifications) | 신규 | 70–300 | F4.5 / F5.6 (F22–29) | 있음 | 0.90 m; focal position and focus mode unspecified | 0.31× | 둘 다 공식 목록 미등재 | 72 | 84 × 143.5 | 854 (unspecified) | 2 |

## 제품별 worker 토큰

| 모델 | API 호출 | 입력 | 출력 | 합계 | 시도별 상태와 토큰 |
|---|---:|---:|---:|---:|---|
| SEL100400 | 1 | 824 | 790 | 1614 | success |
| SEL50150GM | 1 | 825 | 677 | 1502 | success |
| SEL400800G | 1 | 855 | 624 | 1479 | success |
| SEL70200G2 | 2 | 1777 | 1379 | 3156 | needs_information 878/801/1679 → success 899/578/1477 |
| SEL70200GM2 | 1 | 807 | 557 | 1364 | success |
| SEL70200G | 1 | 887 | 792 | 1679 | success |
| SEL70200GM | 2 | 1609 | 1307 | 2916 | failure 794/654/1448 → success 815/653/1468 |
| SEL200600G | 1 | 850 | 660 | 1510 | success |
| SEL100400GM | 1 | 809 | 813 | 1622 | success |
| SEL24240 | 1 | 900 | 513 | 1413 | success |
| SELP28135G | 1 | 818 | 641 | 1459 | success |
| SEL70300G | 1 | 792 | 710 | 1502 | success |

공식 URL, 결과, 재개 위치는 [Batch 006 체크포인트](../src/data/ingestion/sony-e-lenses-production-006.json)에 기록했다.
