# Leica Korea Objective DB production coverage audit — 2026-10-14

Leica Korea 공식 현행 일반 digital **12개 모두 canonical과 production provenance가 연결되어 1차 product coverage 완료**로 판정한다. 미처리·중복/모호·critical은 0건이다. Should-fix 6건과 acceptable UNKNOWN 125개는 별도로 기록했다. 모든 필드·가격·렌즈·추천 경험의 완성을 뜻하지 않는다.

시작 working tree는 clean, baseline은 `5692810`이었다. Architecture/field contracts/progress, 기존 6브랜드 감사, Leica inventory/batch001/보고서/canonical/identity-map/catalog-scope/vocab, 최신 validators와 regression tests를 대조했다. 새 제품 수집과 cheap-worker 호출은 없었다.

[새 감사 snapshot / 재개 checkpoint](../src/data/ingestion/leica-coverage-audit-2026-10-14.json) · [기존 production 보고서](OBJECTIVE_DB_LEICA_PRODUCTION_001.md) · [새 회귀테스트](../tests/leicaCoverageAudit.test.js)

아래 번호는 요청한 완료 보고 1–49와 대응한다.

## 1. Coverage 기준 지역/source

Leica Korea 공식 현행 목록을 primary로 삼고 글로벌 공식 사양·identity·edition·출시 자료로 보완했다. [M](https://leica-camera.com/ko-KR/photography/m), [Q](https://leica-camera.com/ko-KR/photography/q), [SL](https://leica-camera.com/ko-KR/photography/sl), compact/instant gallery, M/system pagination의 마지막 빈 페이지와 실제 상세 variant selector까지 새로 조회했다. 서드파티 분모나 다른 제조사 사양을 사용하지 않았다. 전세계 SKU·재고·생산 census는 아니다.

## 2. Official offer/card 수

**37개**: family/gallery 고유 34개 + selector에서 추가 확인한 Metal Gray 3개. 신규·삭제 offer, base identity, edition relation, 확인된 출시 상태 변화는 모두 0이다. SL family의 camera comparison 버튼도 카메라 offer로 포함하고 따로 표시된 렌즈 5개는 제외했다. 과거 snapshot의 일반 base label과 현재 selector/hero의 suffix 문구는 구분했으며, 과거 상세 label 근거가 없는 부분을 실제 명칭 변경이라고 단정하지 않는다.

## 3. Base identity 수

**16개**: digital 12 + analog film 3 + hybrid instant 1. 전체 37개 offer의 URL·현재 H1·family·release/scope·base 관계는 새 감사 snapshot에 기록했다. 아래 부록의 base/linked 관계표를 참조한다.

## 4. 일반 digital released/current 수

**12개**: M11, M11-P, M11-D, M11 Monochrom, M EV1, Q3, Q3 43, Q3 Monochrom, SL3, SL3-S, SL3-P, D-Lux 8. Monochrome-only 2개를 포함한다. Current listing과 일반 출시 workflow, SL3-P/Q3 Monochrom/M EV1의 추가 출시·배송 근거를 대조했다.

## 5. Canonicalized digital 수

**12개**. 각 ID는 정확히 한 번 존재한다. 기존 Q3/SL3를 다시 생성한 duplicate는 없다.

## 6. Production provenance 완료 수

**12개**. Manufacturer source → raw → claim → staging → diff → 명시적 approval → transaction → canonical chain으로 판단했다. Canonical에 존재하거나 worker가 성공했다는 사실만으로 완료로 세지 않았다. M11/SL3-S의 직접 공식 추출도 같은 chain으로 검증했다.

## 7. Digital unprocessed 수

**0개**. Film/instant/linked offer는 일반 digital 누락에 합산하지 않는다.

## 8. Duplicate/ambiguous 수

**0개**. 고유 offer URL 37개, base 16개, digital canonical/map 12개를 대조했다. Alias 충돌, 잘못된 세대 병합, edition 오분류를 발견하지 않았다.

## 9. Analog film current 수

**3개**: M6, MP, M-A (Typ 127). 색상을 포함한 실제 current offer는 5개다. 공식 M gallery와 제품의 아날로그·기계식 촬영 설명을 확인했다.

## 10. Hybrid instant current 수

**1개**: SOFORT 2. 색상/Burton/100 Years를 포함한 offer는 5개다. 일반 digital 분모에서는 제외한다.

## 11. Linked variant/edition/kit 수

**21개**: kit 8, color/material/finish 11, collaboration 1, commemorative edition 1. Digital base에 연결된 15개와 adjacent base에 연결된 6개를 구분한다. 공식 수량 근거 없이 모든 edition을 limited edition으로 단정하지 않았다.

## 12. Upcoming 수

**0개**. Metal Gray Q3는 공식 2026-07-16, D-Lux 8은 2026-07-30 출시 문구가 있어 감사일 이전임을 추가 확인했다. 남아 있는 S family landing만으로 S3를 현행으로 추정하지 않았다.

## 13. M family audit

Digital M 5개는 Leica M mount/interchangeable/manual focus로 유지한다. 광학 rangefinder 4개와 M EV1의 built-in EVF를 구분했다. Optical 0.73×를 EVF 확대율로 넣지 않았고 외장 optional Visoflex 2도 built-in으로 세지 않았다. 내부 64/256GB를 card slot count로 바꾸지 않았다.

## 14. M11/P/D/Monochrom identity 결과

M11은 표준 64GB, M11-P는 256GB/sapphire display/Content Credentials, M11-D는 256GB/후면 LCD 부재/다른 조작 workflow, M11 Monochrom은 전용 monochrome sensor와 256GB이다. 독립 공식 identity와 기술 차이를 대조했다. Dedicated identityEvidence 자체는 이름/제품을 검증하고 모든 기능 차이를 구조화하지는 않는다. 세부 차이는 official source·claim conditions·이번 감사 설명과 함께 추적한다. 인증 feature scalar는 현재 schema 밖 backlog다.

## 15. M EV1 audit

별도 공식 identity, M bayonet, native 60.3MP, 내부 64GB, built-in 5.76Mdot/60Hz/0.76× EVF로 기록돼 있다. M11 optical rangefinder variant나 alias로 합쳐진 사례는 없다.

## 16. M mount audit

공식 M bayonet 근거와 canonical `Leica M`, aliases `Leica M bayonet`/`Leica M-Bajonett`/`M-Mount`를 검증했다. Mount alias collision 0이며 digital M 5개에 적용된다. L-Mount와 혼용하지 않았다. M lens DB 부족은 후속 추천 coverage 문제다.

## 17. Q family audit

Q3/Q3 43/Q3 Monochrom 모두 fixed/mount-null/fixedLens 구조다. Native sensor/color filter, 렌즈, 영상, 표시, 무게 차이가 각 제품의 Leica 공식 근거에 귀속된다.

## 18. Q3/Q3 43/Q3 Monochrom identity

Q3 실제 28mm F1.7, Q3 43 실제 43mm F2, Q3 Monochrom 실제 28mm F1.7 + monochrome sensor는 독립 identity다. 신규 Q3 43/Q3 Monochrom의 native equivalent는 직접 근거 부족으로 UNKNOWN이다. 기존 Q3 equivalent 28mm를 자동 추정·승격한 새 claim은 없다. 과거 reference-only 값 유지 2개 leaf는 should-fix로 구분한다.

## 19. SL family audit

SL3/SL3-S/SL3-P는 기존 L-Mount/interchangeable/fixedLens-null이다. Native 60.3/24.6/44.9MP, 자체 official technical PDFs, sensor IBIS 5axes/5stops, 셔터별 burst, EVF/LCD/media/video 조건을 각각 대조했다. 같은 mount의 Panasonic 사양을 전용하지 않았다. Total/native/output DNG MP도 서로 구분한다.

## 20. D-Lux 8 audit

Leica 공식 source만 사용했다. MFT-format native 17MP, actual 10.9–34mm/equivalent 24–75mm/F1.7–2.8, fixed whole 397g/bare 357g, 4K 29.97p/8bit가 유지된다. 다른 제조사의 유사 제품 값을 복사하거나 visual compensation을 sensor IBIS로 승격하지 않았다.

## 21. Monochrom 전체 audit

M11 Monochrom/Q3 Monochrom은 전용 monochrome capture/filter workflow이며 사진 흑백 mode나 외장색 edition이 아니다. Native 60.3MP와 출력 L-DNG 60.4MP는 다르다. Q3 Monochrom 공식 설명의 color filter 생략과 lens OIS도 확인했다. Lens stabilization은 body IBIS와 구분한다.

## 22. Fixed-lens audit

Fixed 4개에 대해 별도 interchangeable lens product 생성 0, 기존 36 lenses 불변이다. Virtual integrated lens는 `includedInBodyId`가 있는 호환 뷰이며 독립 자산이 아니다. 실제 기존 시나리오 평가에서 buy는 카메라 1개, lensCount는 0이고 전체 743/772/746/397g을 한 번만 계산한다. Actual/equivalent claim은 각각 mm이고 서로 복사하지 않았다.

## 23. Sensor-size audit

12개의 physical sizeMm는 UNKNOWN이다. Full-frame/35mm-format, pixel pitch/픽셀 수에서 36×24mm를 생성하지 않았다. 물리 센서 치수로 확정할 수 없는 frame/출력 치수나 도면을 승격하지 않았고 임의 평균·지역 교정도 하지 않았다.

## 24. Stabilization audit

SL3/S/P만 sensor-shift IBIS 객체 `present:true/axes:5/stops:5`다. M 5개와 fixed 4개는 explicit body-IBIS presence/absence 근거가 부족하여 null이다. Q/D-Lux lens visual/OIS와 body IBIS를 혼동하지 않았다. 현재 계약이 false를 표현할 수 있다는 사실과 실제 absence 근거 확보 여부는 별개다.

## 25. Weight audit

Known weight 9개는 기존 `battery`, bare 12개는 `body-only` 조건이다. Battery 포함을 battery-and-card로 추정하지 않았다. M11/P black 530/455g vs silver 640/565g, M11-D 539/457g(마케팅 약540), M11 Monochrom 542/461, EV1 495/413, Q3 743/658, Q3 43 772/688, Q3 Monochrom 746/662, D-Lux 397/357g이다. SL bare 769.7/768/768g는 battery/card/cap 제외이며 운영무게를 임의 합산하지 않았다.

## 26. Video audit

Q3/Q3 43/Q3 Monochrom/SL3 C8K 29.97p, SL3-S 6K OG 29.97p, SL3-P 8K OG 24p, D-Lux 4K 29.97p/8bit 조건이 유지된다. SL3-P는 8064×5376/3:2/full-frame crop1.0/DR-expansion false/internal 10bit HEVC420 300Mbps다. HDMI/RAW/slow/high-fps는 다른 mode로 분리하며 하나의 최대 숫자로 합치지 않았다. M video는 source omission만으로 absence로 만들지 않았다. Single video.max와 29.97→97 소비자 parser는 coverage blocker 밖 backlog다.

## 27. 기존 Q3/SL3 provenance audit

ID/aliases/가격 유지, same-value/new-evidence와 null-fill, value-conflict 0이다. 두 제품은 verified staging identity와 새 official spec source/claims/승인/apply chain을 얻었다. 다만 canonical dedicated identityEvidence와 새 source identity field 연결은 생성되지 않아 2건 should-fix다. Canonical 존재만 보고 production complete로 센 것이 아니다.

## 28. Provenance 통계

Known objective leaves **326**: verified **324**, manufacturer-reference-only **2**, legacy-only **0**, unclassified **0**, source-less **0**. Verified fieldEvidence paths **288**, structured identity **10**/indirect **2**, claims **417**(known290/UNKNOWN127), raw **28**, canonical source links **31**이다. Reference-only 2개는 Q3 equivalent leaf이며 verified로 과장하지 않는다. 아래 제품별 통계 부록을 참조한다.

## 29. IdentityEvidence 결과

Structured **10/12**. 기존 Q3/SL3 2개는 verified staging identity와 reviewed map으로 추적되지만 dedicated canonical metadata가 없다. M11/P/D/Monochrom/EV1은 각각 독립 identityEvidence가 있으며 세부 internal GB/인증/뷰파인더 차이는 조건과 official source에 남아 있다.

## 30. Critical 수

**0건**. Released/current 누락, duplicate/ambiguous identity, sealed chain 누락/digest mismatch, invalid mount/type/unit 또는 확인된 잘못된 제품값으로 coverage를 차단하는 문제는 없다.

## 31. Should-fix 수

**6건**: Q3/SL3 dedicated canonical identityEvidence 2건, Q3 native equivalent28 reference-only 2개 leaf, 과거 M-A/MP silver inventory note에 무관한 M11-P 무게가 복사된 2건이다. 다음 별도 narrow enrichment/metadata 작업으로 추적한다. 이번에 canonical/과거 snapshot/production은 고치지 않았다. 옛 Q3 quickstart URL의 2회 HTTP502는 일시 오류일 수 있어 데이터 오류로 확정하지 않고 별도 접근 제한으로 기록했다.

## 32. Acceptable UNKNOWN 수

**125개 canonical path**다. Incoming UNKNOWN127 중 Q3 equivalent2는 기존 known reference-only28이 유지돼 UNKNOWN으로 중복 계산하지 않는다. No-LCD/no-EVF의 `present:false` child16개는 N/A이며 UNKNOWN이 아니다. 이 수치는 감사 범위의 explicit UNKNOWN path이며 전체 JSON null 총수가 아니다.

## 33. Film scope 판단

Film 3개의 current/analog/adjacent 판단은 적절하다. M6/MP/M-A를 sensor-null digital body로 삽입하지 않았다. Film format/기계식 노출/film stock·현상비·workflow를 다룰 별도 analog phase에서 재검토하며 영구 제외하지 않는다. Analog silver 2개의 과거 잘못된 무게 문구는 실제 analog mass 근거로 사용하지 않는다.

## 34. SOFORT scope 판단

SOFORT 2는 digital capture + selective instant print다. Official technical에서 내부 약45이미지, microSD/microSDHC 약850이미지/1GB, 최근50 print 재인화, 3inch LCD, 4.9MP output을 확인했다. Phone image import와 film 소모품/인화비가 핵심인 hybrid workflow여서 현재 ordinary digital 추천 분모 밖 adjacent 판단이 적절하다. 별도 instant/hybrid phase에서 재검토한다.

## 35. Edition/kit relation audit

21개 모두 공식 제품 페이지/variant picker/kit명을 대조했다. 부록 관계표를 참조한다. Material/finish는 무게가 달라질 수 있어도 imaging base를 새 product로 생성하지 않는다. Safari는 P의 인증/256GB/sapphire 기능, Reporter는 SL3 기술, Metal Gray는 해당 base에 연결한다. Q3 43/Monochrom/P/D/EV1은 실제 독립 차이로 유지한다. Analog silver 2개는 과거 설명의 복사 오류와 올바른 base 관계를 구분한다.

## 36. Batch001 artifact audit

Inventory/manifest/raw/staging/diff/approval+history/transaction before-after/evidence/journal/shared registry **51파일, 12item**을 대조했다. 누락0/digest mismatch0. Approval ID/incoming/diff/source/raw/staging/journal digest 검증, strict12/12, archived before→after 및 after→after replay가 일치했다. Sealed bytes는 수정하지 않았다.

## 37. Raw source/accessedAt audit

Raw28개의 publisher Leica Camera AG, 공식 domain, 실제 UTC ISO, helper window **2026-10-12T05:17:46.623Z–46.667Z**, content digest와 fresh HTTP200을 확인했다. Identity-only source도 해당 제품의 verified identity 근거로 count에 포함한다. 감사 fetch의 2026-10-14 시각은 별도로 보존하고 과거 accessedAt을 다시 쓰지 않았다. 총 **108 HTTP attempts/107 unique URLs**, HTTP200 106회/옛 Q3 quickstart HTTP502 2회다. 현재 production raw28 URL은 모두 정상이며 technical PDF의 관찰된 byte 변화는 없다.

## 38. 전체 tests

**321/321 통과**. 신규 감사 회귀19개를 포함한다.

## 39. Objective/production/catalog/coverage tests

**294/294 통과**. 기존 분류대로 전체 test 파일에서 cameraScenarioEngine/firstPurchaseEngine 두 파일만 제외했다. Catalog 내부 호환 경로와 이전 6브랜드 archive 회귀도 포함한다.

## 40. Leica tests

**33/33 통과**: production001 14 + 새 coverage audit19. 분모/21relations/scope/identity/native MP/source chain/조건/기존 fixed 추천 경로/UNKNOWN·N/A/worker fallback/replay/severity를 검증한다.

## 41. Canonical validation

**true**, **163 bodies/36 lenses/199 total** 그대로다. SHA `bbda635e5dbae79e9505531dd1b4b1b916eb1e1a28331cc3ed07bc59a8a13c7b`를 유지한다. 신규 제품/가격/field 교정/추천/UI/validator 변경은 없다.

## 42. Build/node/git diff

pnpm build, node --check, git diff --check 통과. 기존 >500kB bundle 경고는 남아 있다. 실제 CLI reapply도 `already-canonicalized/canonicalMatches:true`이며 canonical/sealed bytes가 유지된다.

## 43. Git status

시작 clean HEAD5692810. 종료는 새 audit JSON, 새 감사 문서, 새 coverage test, 진행 문서 **4파일만 변경된 미commit working tree**다. Push 없음. CameraProducts/vocab/map/scope/기존 inventory/production artifact/추천/UI는 불변이다.

## 44. 1차 coverage 완료 선언

**가능하다.** Leica Korea 현행 일반 digital released/current12/canonical12/production provenance12/unprocessed0/duplicate·ambiguous0/critical0이다. 필드 완전성, worldwide availability, 가격/렌즈/추천 완성 선언과는 구분한다.

## 45. Analog/instant 재검토 시점

미처리 digital batch로 억지 채우지 않는다. 별도 analog-film/instant-hybrid contract, 소모품 비용, workflow와 추천 목표를 검토할 phase에서 다시 다룬다. Official inventory가 바뀌면 current 여부도 다시 확인한다.

## 46. Known backlog

M lens coverage, 명시적 no-video/no-IBIS 근거와 표현, 인증 feature, Monochrom 추천, fixed crop/OIS, recording matrix/single video.max, fractional fps parser, 1/16000 소수 정밀도, physical slot/internal GB, price/Experience/Leica lens ingestion은 별도 backlog다. Should-fix6은 현재 근거·metadata 보완이며 이번에 추정값으로 해소하지 않는다.

## 47. 다음 브랜드

기존 v0.4 계획 B6의 다음 브랜드는 **Sigma 현행 카메라**다. 이번에 Sigma를 미리 조사하거나 ingestion하지 않았다.

## 48. 다음 브랜드 전 blocker

Product coverage blocker **0개**다. 완료 감사 변경을 검토/commit해 clean baseline을 만든 뒤 Sigma official inventory부터 진행한다. Leica6건은 별도 보완 작업으로 추적하고 완료 batch 재수집/worker 재호출은 하지 않는다.

## 49. 최종 recommendation

Leica 일반 digital 1차 coverage를 완료로 표시하고 다음은 Sigma inventory로 진행한다. Leica 후속은 좁은 provenance/metadata 보강과 별도 analog/hybrid phase로 나눈다. 중단 후에는 새 audit checkpoint의 state/resumeAt와 batch digest를 읽고 기존001을 재생성하지 않는다.

## Appendix: base identity inventory

| Base | Official family/category | Audit outcome |
|---|---|---|
| [Q3 43](https://leica-camera.com/ko-KR/photography/cameras/q/q3-43-black) | Q / digital-color | canonical + production provenance |
| [Q3](https://leica-camera.com/ko-KR/photography/cameras/q/q3-black) | Q / digital-color | canonical + production provenance |
| [D-Lux 8](https://leica-camera.com/ko-KR/photography/cameras/d-lux/d-lux-8) | D-Lux / digital-color | canonical + production provenance |
| [SOFORT 2](https://leica-camera.com/ko-KR/photography/cameras/instant-cameras/sofort-2-black) | SOFORT / instant-hybrid | adjacent / reconsiderable |
| [M EV1](https://leica-camera.com/ko-KR/photography/cameras/m/m-ev1-black) | M / digital-color | canonical + production provenance |
| [M11-P](https://leica-camera.com/ko-KR/photography/cameras/m/m11-p-black) | M / digital-color | canonical + production provenance |
| [M11-D](https://leica-camera.com/ko-KR/photography/cameras/m/m11-d-black) | M / digital-color | canonical + production provenance |
| [M11](https://leica-camera.com/ko-KR/photography/cameras/m/m11-black) | M / digital-color | canonical + production provenance |
| [M11 Monochrom](https://leica-camera.com/ko-KR/photography/cameras/m/m11-monochrom) | M / digital-monochrome | canonical + production provenance |
| [M6](https://leica-camera.com/ko-KR/photography/cameras/m/m6) | M / analog-film | adjacent / reconsiderable |
| [M-A (Typ 127)](https://leica-camera.com/ko-KR/photography/cameras/m/m-a-typ-127-black) | M / analog-film | adjacent / reconsiderable |
| [MP](https://leica-camera.com/ko-KR/photography/cameras/m/mp-black-lacquered) | M / analog-film | adjacent / reconsiderable |
| [SL3](https://leica-camera.com/ko-KR/photography/cameras/sl/sl3-black) | SL / digital-color | canonical + production provenance |
| [SL3-S](https://leica-camera.com/ko-KR/photography/cameras/sl/sl3-s-black) | SL / digital-color | canonical + production provenance |
| [Q3 Monochrom](https://leica-camera.com/ko-KR/photography/cameras/q/q3-monochrom) | Q / digital-monochrome | canonical + production provenance |
| [SL3-P](https://leica-camera.com/ko-KR/photography/cameras/sl/sl3-p-black) | SL / digital-color | canonical + production provenance |

## Appendix: all21 linked offer relations

| Offer | Base | Relation | Reviewed distinction |
|---|---|---|---|
| [sofort-2-burton-edition](https://leica-camera.com/ko-KR/photography/cameras/instant-cameras/sofort-2-burton-edition) | SOFORT 2 | collaboration-edition | SOFORT2 Jake Blue/black/Mountain Logo plus shoulder bag; hybrid capture/print base unchanged. |
| [sofort-2-red](https://leica-camera.com/ko-KR/photography/cameras/instant-cameras/sofort-2-red) | SOFORT 2 | color-material-finish | Official same base model/variant selector and finish/material/design difference; do not generalize variant mass. |
| [sofort-2-white](https://leica-camera.com/ko-KR/photography/cameras/instant-cameras/sofort-2-white) | SOFORT 2 | color-material-finish | Official same base model/variant selector and finish/material/design difference; do not generalize variant mass. |
| [sofort-2-100-years](https://leica-camera.com/ko-KR/photography/cameras/sofort-2-100-years) | SOFORT 2 | commemorative-edition | SOFORT2 black finish, nickel-colour lens cap, glossy print frame and100logo; no new imaging identity. |
| [m11-p-safari](https://leica-camera.com/ko-KR/photography/cameras/m/m11-p-safari) | M11-P | color-material-finish | Official M11-P features retained including Content Credentials/256GB/sapphire display; Safari finish/material with finish-scoped mass. |
| [m11-p-silver](https://leica-camera.com/ko-KR/photography/cameras/m/m11-p-silver) | M11-P | color-material-finish | Official same base model/variant selector and finish/material/design difference; do not generalize variant mass. |
| [m-a-typ-127-silver](https://leica-camera.com/ko-KR/photography/cameras/m/m-a-typ-127-silver) | M-A (Typ 127) | color-material-finish | Silver colour of the corresponding analog M-A/MP base. The old note about M11-P digital masses does not apply to this offer. |
| [mp-silver](https://leica-camera.com/ko-KR/photography/cameras/m/mp-silver) | MP | color-material-finish | Silver colour of the corresponding analog M-A/MP base. The old note about M11-P digital masses does not apply to this offer. |
| [m11-glossy-black-paint-finish](https://leica-camera.com/ko-KR/photography/cameras/m/m11-glossy-black-paint-finish) | M11 | color-material-finish | Official M11 design variant with brass/glossy paint/engraving/logo/dial details; independent imaging hardware not stated. Base black mass not applied. |
| [sl3-s-kit-vario-24-70-sl3-s-kit-vario-70-200](https://leica-camera.com/ko-KR/photography/lenses/sl/sl3-s-kit-vario-24-70-sl3-s-kit-vario-70-200) | SL3-S | kit | Named SL3-S/SL3-P body plus stated lens package; camera sensor/body identity unchanged, lens not ingested. |
| [sl3-s-kit-prime-35](https://leica-camera.com/ko-KR/photography/lenses/sl/sl3-s-kit-prime-35) | SL3-S | kit | Named SL3-S/SL3-P body plus stated lens package; camera sensor/body identity unchanged, lens not ingested. |
| [sl3-s-kit-prime-50](https://leica-camera.com/ko-KR/photography/lenses/sl/sl3-s-kit-prime-50) | SL3-S | kit | Named SL3-S/SL3-P body plus stated lens package; camera sensor/body identity unchanged, lens not ingested. |
| [sl3-reporter](https://leica-camera.com/ko-KR/photography/cameras/sl/sl3-reporter) | SL3 | color-material-finish | Official SL3 technical foundation plus olive-green exterior/protective fabric; no separate sensor/video/IBIS/storage identity. |
| [sl3-s-kit-vario-elmarit-28-70](https://leica-camera.com/ko-KR/photography/lenses/sl/sl3-s-kit-vario-elmarit-28-70) | SL3-S | kit | Named SL3-S/SL3-P body plus stated lens package; camera sensor/body identity unchanged, lens not ingested. |
| [sl3-s-kit-vario-24-70](https://leica-camera.com/ko-KR/photography/lenses/sl/sl3-s-kit-vario-24-70) | SL3-S | kit | Named SL3-S/SL3-P body plus stated lens package; camera sensor/body identity unchanged, lens not ingested. |
| [sl3-p-kit-vario-28-70](https://leica-camera.com/ko-KR/photography/lenses/sl/sl3-p-kit-vario-28-70) | SL3-P | kit | Named SL3-S/SL3-P body plus stated lens package; camera sensor/body identity unchanged, lens not ingested. |
| [sl3-p-kit-vario-24-70](https://leica-camera.com/ko-KR/photography/lenses/sl/sl3-p-kit-vario-24-70) | SL3-P | kit | Named SL3-S/SL3-P body plus stated lens package; camera sensor/body identity unchanged, lens not ingested. |
| [sl3-p-kit-vario-24-70-and-vario-70-200](https://leica-camera.com/ko-KR/photography/lenses/sl/sl3-p-kit-vario-24-70-and-vario-70-200) | SL3-P | kit | Named SL3-S/SL3-P body plus stated lens package; camera sensor/body identity unchanged, lens not ingested. |
| [m11-p-metal-gray](https://leica-camera.com/ko-KR/photography/cameras/m/m11-p-metal-gray) | M11-P | color-material-finish | Official same base model/variant selector and finish/material/design difference; do not generalize variant mass. |
| [q3-metal-gray](https://leica-camera.com/ko-KR/photography/cameras/q/q3-metal-gray) | Q3 | color-material-finish | Official same base model/variant selector and finish/material/design difference; do not generalize variant mass. |
| [d-lux-8-metal-gray](https://leica-camera.com/ko-KR/photography/cameras/d-lux/d-lux-8-metal-gray) | D-Lux 8 | color-material-finish | Official same base model/variant selector and finish/material/design difference; do not generalize variant mass. |

## Appendix: per-product provenance

| Model | Known leaves | Verified leaves | Field evidence paths | Identity evidence | Raw / canonical sources |
|---|---:|---:|---:|---|---|
| M11 | 20 | 20 | 20 | structured | 2 / 2 |
| M11-P | 20 | 20 | 20 | structured | 2 / 2 |
| M11-D | 17 | 17 | 17 | structured | 2 / 2 |
| M11 Monochrom | 20 | 20 | 20 | structured | 2 / 2 |
| M EV1 | 23 | 23 | 20 | structured | 2 / 2 |
| Q3 | 35 | 33 | 30 | staging/map; should-fix | 3 / 5 |
| Q3 43 | 32 | 32 | 29 | structured | 2 / 2 |
| Q3 Monochrom | 33 | 33 | 30 | structured | 3 / 3 |
| SL3 | 32 | 32 | 25 | staging/map; should-fix | 3 / 4 |
| SL3-S | 32 | 32 | 25 | structured | 2 / 2 |
| SL3-P | 33 | 33 | 26 | structured | 3 / 3 |
| D-Lux 8 | 29 | 29 | 26 | structured | 2 / 2 |
