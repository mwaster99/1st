# Leica Objective DB production batch 001 — 2026-10-12

일반 digital released/current 12개를 단일 batch로 처리했다. 신규10/보강2, canonical163/36/199, 미처리0. 아래 번호는 요청한 완료 보고 1–49와 대응한다.

[Inventory / 재개 checkpoint](../src/data/ingestion/leica-current-2026-10-12.json) · [Manifest](../src/data/ingestion/batches/production-leica-bodies-001.json) · [Regression tests](../tests/leicaProduction001.test.js)

## 1. inventory 기준 지역/공식 source

2026-10-12 Leica Korea 공식 M/Q/SL family, M·system gallery 전체 pagination(0/1페이지 및 마지막 빈 2페이지), compact/instant gallery, 실제 variant selector를 기준으로 했다. Global 공식 제품 설명·technical PDF·release press/store는 보완 근거다. 서드파티/다른 제조사 사양은 사용하지 않았다. [M](https://leica-camera.com/ko-KR/photography/m), [Q](https://leica-camera.com/ko-KR/photography/q), [SL](https://leica-camera.com/ko-KR/photography/sl), [compact](https://leica-camera.com/ko-KR/photography/compact-cameras), [SOFORT](https://leica-camera.com/ko-KR/photography/sofort). 한국 catalog coverage이며 전세계 SKU·재고·생산 census는 아니다.

## 2. official card 수

Official offer/card URL **37개**: gallery/family 34 + 상세 selector에서 추가 확인한 Metal Gray 3. 여러 family에 노출된 동일 URL은 한 번만 센다. Body+lens kit 8개도 camera offer로 기록하되 별도 렌즈 수집을 하지 않는다.

## 3. base identity 수

중복 offer를 base identity에 연결하면 **16개**다. Digital 12 + film 3 + hybrid instant 1.

## 4. 전체 inventory

아래 전체 37개 offer 표를 참조한다. URL, region, family, releaseStatus, scope, mount/kind, base relation, 기존 canonical/production 여부는 snapshot 각 item에 기록했다. 남아 있는 S family landing만으로 S3를 현행으로 추정하지 않았다: 현재 camera product card를 확인하지 못했고 archive 수집은 범위 밖이다.

| Official offer | Base identity | 분류 | URL |
|---|---|---|---|
| Leica Q3 43 / q3-43-black | Q3 43 | digital-color | [official](https://leica-camera.com/ko-KR/photography/cameras/q/q3-43-black) |
| Leica Q3 / q3-black | Q3 | digital-color | [official](https://leica-camera.com/ko-KR/photography/cameras/q/q3-black) |
| Leica D-Lux 8 / d-lux-8 | D-Lux 8 | digital-color | [official](https://leica-camera.com/ko-KR/photography/cameras/d-lux/d-lux-8) |
| Leica SOFORT 2 / sofort-2-burton-edition | SOFORT 2 | linked variant/edition/kit | [official](https://leica-camera.com/ko-KR/photography/cameras/instant-cameras/sofort-2-burton-edition) |
| Leica SOFORT 2 / sofort-2-red | SOFORT 2 | linked variant/edition/kit | [official](https://leica-camera.com/ko-KR/photography/cameras/instant-cameras/sofort-2-red) |
| Leica SOFORT 2 / sofort-2-black | SOFORT 2 | instant-hybrid | [official](https://leica-camera.com/ko-KR/photography/cameras/instant-cameras/sofort-2-black) |
| Leica SOFORT 2 / sofort-2-white | SOFORT 2 | linked variant/edition/kit | [official](https://leica-camera.com/ko-KR/photography/cameras/instant-cameras/sofort-2-white) |
| Leica SOFORT 2 / sofort-2-100-years | SOFORT 2 | linked variant/edition/kit | [official](https://leica-camera.com/ko-KR/photography/cameras/sofort-2-100-years) |
| 라이카 M EV1 / m-ev1-black | M EV1 | digital-color | [official](https://leica-camera.com/ko-KR/photography/cameras/m/m-ev1-black) |
| Leica M11-P / m11-p-black | M11-P | digital-color | [official](https://leica-camera.com/ko-KR/photography/cameras/m/m11-p-black) |
| Leica M11-P / m11-p-safari | M11-P | linked variant/edition/kit | [official](https://leica-camera.com/ko-KR/photography/cameras/m/m11-p-safari) |
| Leica M11-D / m11-d-black | M11-D | digital-color | [official](https://leica-camera.com/ko-KR/photography/cameras/m/m11-d-black) |
| Leica M11-P / m11-p-silver | M11-P | linked variant/edition/kit | [official](https://leica-camera.com/ko-KR/photography/cameras/m/m11-p-silver) |
| Leica M11 / m11-black | M11 | digital-color | [official](https://leica-camera.com/ko-KR/photography/cameras/m/m11-black) |
| Leica M11 Monochrom / m11-monochrom | M11 Monochrom | digital-monochrome | [official](https://leica-camera.com/ko-KR/photography/cameras/m/m11-monochrom) |
| Leica M6 / m6 | M6 | analog-film | [official](https://leica-camera.com/ko-KR/photography/cameras/m/m6) |
| Leica M-A (Typ 127) / m-a-typ-127-black | M-A (Typ 127) | analog-film | [official](https://leica-camera.com/ko-KR/photography/cameras/m/m-a-typ-127-black) |
| Leica M-A (Typ 127) / m-a-typ-127-silver | M-A (Typ 127) | linked variant/edition/kit | [official](https://leica-camera.com/ko-KR/photography/cameras/m/m-a-typ-127-silver) |
| Leica MP / mp-black-lacquered | MP | analog-film | [official](https://leica-camera.com/ko-KR/photography/cameras/m/mp-black-lacquered) |
| Leica MP / mp-silver | MP | linked variant/edition/kit | [official](https://leica-camera.com/ko-KR/photography/cameras/m/mp-silver) |
| Leica M11 / m11-glossy-black-paint-finish | M11 | linked variant/edition/kit | [official](https://leica-camera.com/ko-KR/photography/cameras/m/m11-glossy-black-paint-finish) |
| Leica SL3-S Vario Kit 24-70 & 70-200 / sl3-s-kit-vario-24-70-sl3-s-kit-vario-70-200 | SL3-S | linked variant/edition/kit | [official](https://leica-camera.com/ko-KR/photography/lenses/sl/sl3-s-kit-vario-24-70-sl3-s-kit-vario-70-200) |
| Leica SL3-S Prime Kit 35 / sl3-s-kit-prime-35 | SL3-S | linked variant/edition/kit | [official](https://leica-camera.com/ko-KR/photography/lenses/sl/sl3-s-kit-prime-35) |
| Leica SL3-S Prime Kit 50 / sl3-s-kit-prime-50 | SL3-S | linked variant/edition/kit | [official](https://leica-camera.com/ko-KR/photography/lenses/sl/sl3-s-kit-prime-50) |
| Leica SL3 Reporter / sl3-reporter | SL3 | linked variant/edition/kit | [official](https://leica-camera.com/ko-KR/photography/cameras/sl/sl3-reporter) |
| Leica SL3 / sl3-black | SL3 | digital-color | [official](https://leica-camera.com/ko-KR/photography/cameras/sl/sl3-black) |
| Leica SL3-S / sl3-s-black | SL3-S | digital-color | [official](https://leica-camera.com/ko-KR/photography/cameras/sl/sl3-s-black) |
| Leica SL3-S Vario Kit 28-70 / sl3-s-kit-vario-elmarit-28-70 | SL3-S | linked variant/edition/kit | [official](https://leica-camera.com/ko-KR/photography/lenses/sl/sl3-s-kit-vario-elmarit-28-70) |
| Leica SL3-S Vario Kit 24-70 / sl3-s-kit-vario-24-70 | SL3-S | linked variant/edition/kit | [official](https://leica-camera.com/ko-KR/photography/lenses/sl/sl3-s-kit-vario-24-70) |
| Leica Q3 Monochrom / q3-monochrom | Q3 Monochrom | digital-monochrome | [official](https://leica-camera.com/ko-KR/photography/cameras/q/q3-monochrom) |
| Leica SL3-P Vario Kit 28-70 / sl3-p-kit-vario-28-70 | SL3-P | linked variant/edition/kit | [official](https://leica-camera.com/ko-KR/photography/lenses/sl/sl3-p-kit-vario-28-70) |
| Leica SL3-P Vario Kit 24-70 / sl3-p-kit-vario-24-70 | SL3-P | linked variant/edition/kit | [official](https://leica-camera.com/ko-KR/photography/lenses/sl/sl3-p-kit-vario-24-70) |
| Leica SL3-P Vario Kit 24-70 & 70-200 / sl3-p-kit-vario-24-70-and-vario-70-200 | SL3-P | linked variant/edition/kit | [official](https://leica-camera.com/ko-KR/photography/lenses/sl/sl3-p-kit-vario-24-70-and-vario-70-200) |
| LEICA SL3-P / sl3-p-black | SL3-P | digital-color | [official](https://leica-camera.com/ko-KR/photography/cameras/sl/sl3-p-black) |
| Leica M11-P Metal Gray / m11-p-metal-gray | M11-P | linked variant/edition/kit | [official](https://leica-camera.com/ko-KR/photography/cameras/m/m11-p-metal-gray) |
| Leica Q3 Metal Gray / q3-metal-gray | Q3 | linked variant/edition/kit | [official](https://leica-camera.com/ko-KR/photography/cameras/q/q3-metal-gray) |
| Leica D-Lux 8 Metal Gray / d-lux-8-metal-gray | D-Lux 8 | linked variant/edition/kit | [official](https://leica-camera.com/ko-KR/photography/cameras/d-lux/d-lux-8-metal-gray) |

## 5. 일반 digital released/current 수

일반 released/current digital **12개**(color 10 + monochrome-only 2).

## 6. announced/upcoming

발견한 announced/upcoming **0개**. SL3-P는 공식 press의 2026-06-25 판매 시작, Q3 Monochrom은 2025-11-20, M EV1은 공식 store 배송 가능 근거를 추가 확인했다. 나머지는 현행 official listing/제품 상세와 일반 출시 workflow로 확인했다.

## 7. linked variant/edition

Linked variant/edition/kit **21개**: digital base 연결 15 + film/instant 연결 6. 21 안에 kit 8이 포함된다. 별도 독립 canonical 21개를 생성하지 않는다.

## 8. analog film current 수

Analog film current **3 base identities**: M6, MP, M-A (Typ 127). 색상 포함 film offer 5개.

## 9. instant/hybrid current 수

Hybrid instant current **1 base identity**: SOFORT 2. 색상/Burton/100 Years 포함 5개 offer.

## 10. deferred/special 수

별도의 deferred-special-category **0개**. 이번 조사에서 film/instant 4개는 adjacent-category로 구분했으며 digital 분모에 합산하지 않는다.

## 11. 기존 canonical current 수

기존 canonical current **2개**: leica-q3, leica-sl3. 기존 이름/ID/aliases/가격을 유지하고 새 근거만 병합했다.

## 12. 시작 production 미처리 digital 수

시작 production 미처리 digital **12개**. 기존 2개도 이번 ingestion pipeline production provenance가 없었으므로 포함한다.

## 13. 실제 처리 제품 수

12개를 **단일 production-leica-bodies-001 atomic batch**로 처리했다. Raw → normalize → strict validate → diff → human-readable review → explicit CLI approval → atomic apply → canonical validation → 실제 reapply까지 완료했다.

## 14. 처리 제품 목록

M11 / M11-P / M11-D / M11 Monochrom / M EV1 / Q3 / Q3 43 / Q3 Monochrom / SL3 / SL3-S / SL3-P / D-Lux 8.

## 15. 처리하지 않은 제품과 이유

미처리 in-scope digital 0. Film 3·SOFORT 2는 현재 digital sensor/video 중심 contract를 왜곡하지 않기 위해 inventory/scope만 기록했다. Linked 21개는 base 연결이며, S3 같은 archive 후보는 이번 수집 대상이 아니다.

## 16. 신규/기존 보강

**신규 10 + 기존 보강 2**. Q3/SL3 same-value/new-evidence와 null-fill은 구분하여 승인했다. 알려진 값을 UNKNOWN으로 지우지 않았다.

## 17. canonical 수량 변화

**153 bodies /36 lenses /189 total → 163 bodies /36 lenses /199 total**. 다른 기존 151 bodies 및 모든 36 lenses는 archive before/after deep equality로 확인. 기존 Q3/SL3 identity/가격 불변, 새 제품 가격은 null. cameraProducts.json 수동 편집 없이 apply만 사용했다.

## 18. 제품별 핵심 데이터

아래 제품별 핵심 값 표를 참조한다. 센서 native effective MP, 사진 출력 해상도, total MP를 분리했다. SL3-P 44.9 native/45.8 total/44.2 L-DNG, M11 Monochrom 60.3 native/60.4 L-DNG 차이를 조건에 보존했다. Sensor physical sizeMm는 모두 UNKNOWN: full-frame나 pixel pitch로 36×24를 생성하지 않았다.

| 제품 / canonical ID | MP / mount-kind | Weight g (battery / bare) | 핵심 차이·영상 대표 모드 | 신규 source |
|---|---|---|---|---|
| M11 / `leica-m11` | 60.3 / Leica M | 530 / 455 | 수동초점; 광학 rangefinder; video UNKNOWN | 2 |
| M11-P / `leica-m11-p` | 60.3 / Leica M | 530 / 455 | 수동초점; 광학 rangefinder; video UNKNOWN | 2 |
| M11-D / `leica-m11-d` | 60.3 / Leica M | 539 / 457 | 수동초점; LCD 없음; video UNKNOWN | 2 |
| M11 Monochrom / `leica-m11-monochrom` | 60.3 / Leica M | 542 / 461 | 수동초점; 광학 rangefinder; video UNKNOWN | 2 |
| M EV1 / `leica-m-ev1` | 60.3 / Leica M | 495 / 413 | 수동초점; 내장 EVF; video UNKNOWN | 2 |
| Q3 / `leica-q3` | 60.3 / fixed | 743 / 658 | C8K 29.97p; actual {'min': 28, 'max': 28}mm | 3 |
| Q3 43 / `leica-q3-43` | 60.3 / fixed | 772 / 688 | C8K 29.97p; actual {'max': 43, 'min': 43}mm | 2 |
| Q3 Monochrom / `leica-q3-monochrom` | 60.3 / fixed | 746 / 662 | C8K 29.97p; actual {'max': 28, 'min': 28}mm | 3 |
| SL3 / `leica-sl3` | 60.3 / L-Mount | UNKNOWN / 769.7 | C8K 29.97p | 3 |
| SL3-S / `leica-sl3-s` | 24.6 / L-Mount | UNKNOWN / 768 | 6K OG 29.97p | 2 |
| SL3-P / `leica-sl3-p` | 44.9 / L-Mount | UNKNOWN / 768 | 8K OG 24p | 3 |
| D-Lux 8 / `leica-d-lux-8` | 17 / fixed | 397 / 357 | 4K 29.97p; actual {'max': 34, 'min': 10.9}mm | 2 |

SL은 운영무게 UNKNOWN, body-only만 확인했다. M/Q/D-Lux는 battery 포함이며 card 포함은 확인하지 못했다. Weight basis는 기존 vocab의 `battery` / `body-only`를 사용하고 operational을 신설하지 않았다.

## 19. 공식 source 수

신규 공식 source **28개**, 제품당 2–3개. KR 제품 page + official technical PDF, Q3/Q3 Monochrom/SL3는 실제 LCD tilt 근거 global 제품 page, SL3-P는 전용 video specification PDF를 추가했다. Identity-only source도 실제 provenance에 연결되어 source count에 포함한다. 기존 Q3/SL3 canonical reference까지 합친 누적 source 수와 이번 incoming 수를 혼동하지 않는다. 아래 모든 source URL 표를 참조한다.

| 제품 | Official incoming source URL |
|---|---|
| leica-m11 | [source 1](https://leica-camera.com/ko-KR/photography/cameras/m/m11-black)<br>[source 2](https://leica-camera.com/sites/default/files/pm-13764-Leica_M11_technical_data_EN.pdf) |
| leica-m11-p | [source 1](https://leica-camera.com/ko-KR/photography/cameras/m/m11-p-black)<br>[source 2](https://leica-camera.com/sites/default/files/pm-13818-Leica-M11-P_Technical-Data_EN.pdf) |
| leica-m11-d | [source 1](https://leica-camera.com/ko-KR/photography/cameras/m/m11-d-black)<br>[source 2](https://leica-camera.com/sites/default/files/pm-13912-Leica-M11-D_Technical_Data_EN.pdf) |
| leica-m11-monochrom | [source 1](https://leica-camera.com/ko-KR/photography/cameras/m/m11-monochrom)<br>[source 2](https://leica-camera.com/sites/default/files/pm-13992-EN_Tech-Data_M11-Monochrom.pdf) |
| leica-m-ev1 | [source 1](https://leica-camera.com/ko-KR/photography/cameras/m/m-ev1-black)<br>[source 2](https://leica-camera.com/sites/default/files/pm-24998-Leica-M-EV1_Technical-Data_en.pdf) |
| leica-q3 | [source 1](https://leica-camera.com/ko-KR/photography/cameras/q/q3-black)<br>[source 2](https://leica-camera.com/sites/default/files/pm-19567-EN_technical_data_Leica_Q3_1.pdf)<br>[source 3](https://leica-camera.com/en-int/photography/cameras/q/q3-black) |
| leica-q3-43 | [source 1](https://leica-camera.com/ko-KR/photography/cameras/q/q3-43-black)<br>[source 2](https://leica-camera.com/sites/default/files/pm-13098-Leica-Q343_Technical-Data_en.pdf) |
| leica-q3-monochrom | [source 1](https://leica-camera.com/ko-KR/photography/cameras/q/q3-monochrom)<br>[source 2](https://leica-camera.com/sites/default/files/pm-26854-Leica-Q3-Monochrome_Technical-Data_en.pdf)<br>[source 3](https://leica-camera.com/en-int/photography/cameras/q/q3-monochrom) |
| leica-sl3 | [source 1](https://leica-camera.com/ko-KR/photography/cameras/sl/sl3-black)<br>[source 2](https://leica-camera.com/sites/default/files/pm-14627-Leica-SL3_Technical-Data_en.pdf)<br>[source 3](https://leica-camera.com/en-int/photography/cameras/sl/sl3-black) |
| leica-sl3-s | [source 1](https://leica-camera.com/ko-KR/photography/cameras/sl/sl3-s-black)<br>[source 2](https://leica-camera.com/sites/default/files/pm-14708-Leica-SL3-S_Technical-Data_en.pdf) |
| leica-sl3-p | [source 1](https://leica-camera.com/ko-KR/photography/cameras/sl/sl3-p-black)<br>[source 2](https://leica-camera.com/sites/default/files/pm-28258-Datenblatt-SL3-P_EN.pdf)<br>[source 3](https://leica-camera.com/sites/default/files/pm-28338-ALL_SL3-P_VideoSpecs.pdf) |
| leica-d-lux-8 | [source 1](https://leica-camera.com/ko-KR/photography/cameras/d-lux/d-lux-8)<br>[source 2](https://leica-camera.com/sites/default/files/pm-14928-Leica-D-Lux8_Technical-Data_en.pdf) |

## 20. conflict

진짜 incoming source/value conflict **0**, 기존 canonical value-conflict **0**. 539g technical vs 약540g marketing, total/native/output MP, 다른 finish의 무게, recording mode 차이는 같은 조건의 충돌로 만들지 않았다. Synthetic conflicting claim regression은 CONFLICTING_CLAIM_VALUES로 차단된다.

## 21. 주요 UNKNOWN

417 claims 중 **known 290 / UNKNOWN 127**(전체 canonical JSON null 총수 아님). 공통 sensor.sizeMm/본체 dimension/releaseDate/AI unit, M별 셔터 방식 burst·video·IBIS·physical slot count, SL 운영무게, 일부 LCD hinge/crop, Q3 43·Q3 Monochrom 환산 초점거리 등은 추정하지 않았다. 전체 UNKNOWN path는 snapshot에 있다. 기존 Q3 equivalent28mm는 incoming UNKNOWN이 덮어쓰지 않는다.

## 22. M mount 처리

공식 Leica M bayonet/M-Bajonett 근거로 mount vocab에 **Leica M** 한 항목만 추가했다(aliases: Leica M bayonet, Leica M-Bajonett, M-Mount). 새 lens 제품/추천 로직은 만들지 않았다. 기존 catalog test의 mount allowlist가 하드코딩되어 새 유효 mount를 거절하던 단언만 실제 ingestion vocab 조회로 수정했다.

## 23. L-Mount 처리

SL3/SL3-S/SL3-P는 기존 **L-Mount** vocab 재사용. Panasonic 사양/evidence는 사용하지 않았다.

## 24. M 계열 identity 처리

M11/P/D/Monochrom/EV1은 독립 identity다. M11 64GB, P/D/Monochrom 256GB, EV1 64GB 내부 저장 정보는 claim conditions에 보존했다. M11-P의 Content Credentials/사파이어 LCD, D의 LCD 없음 및 조작 workflow, EV1의 내장 EVF 차이를 확인했다. Internal GB를 card count로 만들지 않는다. M11/P/D/Monochrom built-in EVF false는 optical rangefinder + optional external Visoflex2 공식 근거이며 optical magnification0.73을 EVF 확대율로 넣지 않았다. EV1 내장 EVF true/5.76Mdot/60Hz/0.76×는 별도다. 수동 초점은 autofocus.description에 명시한다.

## 25. Monochrom 처리

M11 Monochrom과 Q3 Monochrom은 전용 monochrome sensor/filter workflow로 독립 identity를 유지했다. 색상 variant/사진 흑백 모드와 합치지 않았고 native 센서 정보 + generation/claim metadata에 보존했다. 새 monochrome boolean schema는 만들지 않았다.

## 26. Q fixed-lens 처리

Q3/Q3 43/Q3 Monochrom은 기존 **kind:fixed /mount:null /specs.fixedLens**. Actual 28/43/28mm 단렌즈이며 F1.7/F2/F1.7. Q3 43은 Q3의 디지털 crop 또는 finish가 아니다. 새 2개 equivalent는 직접 근거가 부족해 UNKNOWN이고 실제 mm와 혼용하지 않았다. Lens product 0, 기존 시나리오 runtime에서 buy는 camera 하나·lensCount0·전체743/772/746g 한 번만 계산한다.

## 27. D-Lux/compact 처리

D-Lux 8은 Leica 자체 official technical data만 사용: MFT-format native17MP, 실제10.9–34mm, 35mm환산24–75mm, F1.7–2.8, fixed whole397g/bare357g, 4K29.97p internal8bit. 다른 제조사 원형 모델 스펙을 복사하지 않았다. 광학/visual compensation을 sensor IBIS로 넣지 않았다.

## 28. film/instant scope 처리

catalog-scope에 M6/MP/M-A(Typ127)/SOFORT2 4개를 adjacent-category로 기록하고 공식 URL·이유·재검토 조건을 남겼다. Film에 sensor=null digital product를 만들거나 영구 제외하지 않는다. 향후 analog schema/consumables/printing phase에서 따로 검토한다.

## 29. edition/variant 처리

Reporter/Safari/Metal Gray/glossy paint/색상/Burton/100 Years/kit은 확인한 base hardware에 연결한다. 외장 재질로 무게가 달라질 수 있으므로 canonical M11/P black finish 무게를 모든 finish로 일반화하지 않는다. M11-P black530g vs silver640g battery 포함 차이를 조건에 보존했다. 명칭 suffix만으로 P/D/Monochrom을 alias로 합치지 않았다.

## 30. IBIS/video 없음 처리

현재 IBIS 계약은 {present:boolean,axes,stops,testConditions} 객체 또는 null. SL3/S/P sensor-shift5axes/5stops만 승격했다. 나머지9는 수집 근거에 explicit sensor-IBIS absence가 부족하여 UNKNOWN: source omission을 false로 바꾸지 않았다. M video도 수집 자료가 still-only formats를 문서화할 뿐 직접 absence 근거가 충분하지 않아 UNKNOWN + needsExplicitAbsenceEvidence를 기록했다. **미지원이 공식 확정됐다고 주장하지 않는다.** 향후 absence 근거 확보/typed no-video 표현은 별도 backlog. D LCD.present=false와 optical M built-in EVF.present=false는 직접 근거로 확정했다.

## 31. 제품별 worker token

아래 제품별 worker usage 표. 모든 task는 제품 1개 단위, 공개 Leica 발췌 + 최소 schema만 전송했다. 전체 canonical/프로젝트 코드/secret 전송 없음. 임시 공개 fixture 12개는 삭제했다.

| 제품 | input | output | returned total | API attempts / retry | 최종 |
|---|---:|---:|---:|---|---|
| leica-m11 | 미반환 | 미반환 | 미반환 | 2 / 1 | local fallback |
| leica-m11-p | 3501 | 1575 | 5076 | 1 / 0 | 검토 후 채택 |
| leica-m11-d | 3181 | 563 | 3744 | 1 / 0 | 검토 후 채택 |
| leica-m11-monochrom | 3727 | 1424 | 5151 | 1 / 0 | 검토 후 채택 |
| leica-m-ev1 | 3081 | 663 | 3744 | 1 / 0 | 검토 후 채택 |
| leica-q3 | 14440 | 2073 | 16513 | 2 / 1 | 검토 후 채택 |
| leica-q3-43 | 14492 | 3114 | 17606 | 2 / 1 | 검토 후 채택 |
| leica-q3-monochrom | 5533 | 980 | 6513 | 1 / 0 | 검토 후 채택 |
| leica-sl3 | 6748 | 1125 | 7873 | 1 / 0 | 검토 후 채택 |
| leica-sl3-s | 6815 | 1919 | 8734 | 2 / 1 | local fallback; network usage 제외 |
| leica-sl3-p | 5062 | 798 | 5860 | 1 / 0 | 검토 후 채택 |
| leica-d-lux-8 | 3370 | 661 | 4031 | 1 / 0 | 검토 후 채택 |

## 32. worker 총 token

반환 usage 합계 **input69,950 /output14,895 /total84,845**. NETWORK_ERROR 3회는 usage를 반환하지 않아 0으로 가정하지 않았다. 따라서 실제 청구 토큰의 완전한 총합은 확인 불가이며 84,845는 확인 가능한 합계다.

## 33. retry/failure

독립12tasks /실제16API attempts /동일ID retry4. M11은 network2회 후 local fallback, SL3-S는 malformed1+retry network1 후 local fallback. Q3 malformed1 후 retry성공, Q3 43 incomplete1 후 retry성공. Task당 2회 제한 준수, ledger 재설정/ID 바꿔 재시도 없음.

## 34. worker 유용성

유효 결과10제품, 직접 추출 fallback2제품. Physical size 추론 금지·native/outputMP 차이·variant weight·조건부 burst/video 경고가 유용했다. M11-P physical slot count 추정1 등 미확인 제안은 버렸다. Worker 결과는 제안으로만 검토하고 자동 patch/apply하지 않았다.

## 35. GPT-6.1 Sol 직접 판단

GPT-6.1 Sol이 official inventory/pagination/출시 상태, 37offer→16base, film/instant scope, 12identity, 기존Q3/SL3 mapping, mount, Monochrom/광학rangefinder/EVF/LCD, 모든 조건·UNKNOWN·source 적용 범위, 417claims 및 diff, explicit approval/apply를 직접 판단했다. SL3 CIPA260 초안은 official source에 근거가 없어 UNKNOWN으로 교정하고 1350 adapted-cycle 조건만 보존했다.

## 36. 사람 개입량

사용자 추가 개입 **0회**. Main12제품 review + M11/SL3-S2제품 직접 추출 fallback + variants37개/분모/공식 자료/게이트 검토. Worker가 의사결정·최종 승인 책임을 대신하지 않았다. 정확한 수동 작업 시간은 측정하지 않았다.

## 37. normalization 신규 문제

초안 dedicated identity evidence 중복은 normalize가 거절하여 1개 KR identity로 교정했다. Whole LCD object(hinge null) + 별도 known hinge leaf 중복은 CLAIM_PRODUCT_MISMATCH로 차단되어 기존 leaf contract로 교정했다. 이들은 seal/approval 전에 해결한 draft authoring 오류이며 기존 artifact를 재작성한 일이 아니다. 기존 numerical normalize의 소수6자리 반올림으로 1/16000s=0.0000625→0.000063이 된다. 정확한 원문/fraction/raw는 보존했고 precision 변경은 후속 후보다.

## 38. pipeline/schema 신규 문제

새 runtime pipeline/schema blocking bug **0**. Minimal M mount vocab만 추가. Optical rangefinder/internal GB/typed no-video/monochrome flag/fixedLens OIS/dimensions diagram parsing은 표현·수집 후속 후보. Single video.max 소비자는 OG/crop/내부녹화/slow/HDMI 조건을 직접 표현하지 못한다. Leica M 렌즈/가격 미수집으로 추천 가능성은 별도 문제이며 이번 엔진/UI를 변경하지 않았다.

## 39. accessedAt

Raw-helper가 28개 source 생성 시 실제 UTC ISO timestamp를 자동 기록했다: **2026-10-12T05:17:46.623Z–2026-10-12T05:17:46.667Z**. Date-only/임의00:00:00Z 없음. ISO 구조/생성 clock bounds/content digest를 regression으로 검증한다. Network fetch 시간은 별도 collectionFetches에 보존했다.

## 40. 전체 tests

전체 **302/302 통과**. 최초 hardcoded mount-list test 실패 후 vocab 재사용으로 수정했고 전체 재실행 통과.

## 41. Objective/production/catalog tests

Objective/production/catalog/coverage **275/275 통과**. 전체 test files에서 cameraScenarioEngine.test.js/firstPurchaseEngine.test.js만 제외한 기존 분류를 사용하며, catalog 내부 시나리오 호환 테스트도 포함한다. 과거6브랜드 sealed fixture 테스트 포함.

## 42. Leica tests

신규 Leica regression **14/14 통과**: 분모/identity/variants/scope, atomic unrelated preservation/replay, M/L mount, rangefinder/EVF/noLCD, nativeMP, fixed optics/기존 추천경로 전체무게/별도상품금지, weight/IBIS/video/strict conflict, timestamps/digests, worker ledger/checkpoint.

## 43. canonical validation

Canonical validation **true**. Before SHA d5f544b9978fc02ef6f36e62b723758d400ed5685b1b1d8383324ba95f14cd25 → after **bbda635e5dbae79e9505531dd1b4b1b916eb1e1a28331cc3ed07bc59a8a13c7b**. Archived sealed inputs로 proposedCanonical 재현도 after와 동일.

## 44. build/node/git diff

pnpm build /변경test 및 objective scripts node --check /git diff --check 통과. Build의 >500kB chunk warning은 기존 알려진 경고이며 이번 UI/bundle 개선은 범위 밖.

## 45. idempotency

실제 CLI reapply **already-canonicalized /canonicalMatches:true**. Journal canonicalized, manifest12items canonicalized. Approval ID approval-09a5912ba1e9e0aaa6fe7c1086b2d87074698701c9c4643cc724b384549ba9b0; reviewed diff digest f554dc2182c9bbdb70afadd3161920230c3a5427785d0ef197547850374532b7. Raw/staging/diff/approval/incoming/before-after/evidence/journal 전체 보존.

## 46. git status

시작 clean HEAD93a6704. 종료는 이번 작업의 canonical/map/scope/vocab/test/doc/progress 변경 및 신규 inventory/production artifact가 있는 **uncommitted working tree**다. 기존 브랜드 sealed artifact/추천/UI/가격/Experience 수정 없음. Push 없음. 다음 audit에서 clean을 요구하면 이 완료 작업을 먼저 검토·commit한다.

## 47. 일반 digital production 미처리 수

일반 digital production 미처리 **0개**.

## 48. 추가 production batch 필요 여부

확정한 Korea 기준 분모에는 추가 일반 production batch 불필요. 새 official current 제품 등장 또는 별도 narrow UNKNOWN enrichment 요청 때 새 batch를 만든다. 완료된12제품을 다시 worker에 보내거나 raw를 재생성하지 않는다.

## 49. coverage audit 준비 여부

**Leica coverage audit으로 바로 넘어갈 준비 완료**. 이번 작업은 production coverage 구축이며 audit 완료 선언은 아니다. Snapshot batchCheckpoint의 gate/canonicalDigest/approval/reapply/remaining/next를 읽고 감사부터 시작한다. Film/instant는 별도 future phase다.
