# Fujifilm production batch 002 — 2026-10-02

완료: 지정된 신규 잔여 **GFX ETERNA 55 / GFX100RF / X-E5 / X half** 4개, 기존 업데이트0개, **85 verified claims**. 바디 **107→111**, 렌즈 **36 유지**, 전체 **143→147**. 기존143개 제품 객체와 렌즈 전부 보존. `cameraProducts.json`은 기존 atomic apply만 작성했다. 시작 git clean, baseline commit `efe747f14cc8fa8b660a3aab24826c185232bc27`. 추천 엔진/UI/Experience/schema/vocab/catalog-scope/기존 production artifact 변경 없음.

## 공식 현행 / scope / identity 검토

[한국 공식 현행 카메라 목록](https://fujifilm-korea.co.kr/products/camera)의 실제17카드를 재확인했다. Featured X-T5 링크를 독립 카드로 중복 집계하지 않았다. [기존 inventory](../src/data/ingestion/fujifilm-current-camera-gallery-2026-10-02.json)의 초기 집계와 batch001Completion은 역사적 checkpoint로 보존하고 이번4개 처리 상태와 batch002Completion만 기록했다. 출시월은 한국 제품별2025-11 /2025-04 /2025-08 /2025-06으로 모두 과거이며, X-E5 SOLD OUT은 재고 상태이지 announced/upcoming이 아니다.

한국 일반14 identity/16카드 전체가 canonical에 연결되어 **신규 미등록0identity/0카드**다. 이것이 모든 현행 제품의 v0.4 provenance 검증 완료를 뜻하지는 않는다. Production 검증9identity, 기존legacy5identity(X-T5/X-T50/X-S20/X-M5/X100VI)는 여전히 보강 대상이다. GFX100RF FRAGMENT EDITION은 기본 identity에 `canonical-base-linked-variant` / coverageViaBaseBatch로 연결했지만 variant-specific feature/사양 검증으로 표시하지 않았다. X100VI Limited도 별도 카드/기본 identity 정책 유지. IR 제한형과 Instax deferred는 이번 범위 밖이다.

ETERNA 55는 G마운트, NP-W235 단독 운용/핸들/직접 버튼 조작/양측 모니터/드론·짐벌 구성에 대한 [한국 공식 설명](https://fujifilm-korea.co.kr/products/id/1352)과 [본사 출시 자료](https://www.fujifilm.com/jp/en/news/hq/12705)로 직접 운용 시네마 in-scope를 확인했다. PL은 제공 어댑터이므로 기본 mount는 Fujifilm G, kind interchangeable이다. 기존 Cinema EOS와 같은 compact 형태 분류를 사용한다. Rangefinder 형태의 GFX100RF/X-E5/X half도 기존 bodyStyle vocab만 사용했다. 새 cinema schema를 만들지 않았다.

## 승격 데이터 / 공식 출처

제품당 한국 사양페이지+identity-only 현행gallery를 연결했다. ETERNA에는 본사 공식 출시자료를 추가하여 물리 듀얼 슬롯 근거를 제공했다. **3/2/2/2 sources, raw9개, 서로 다른 URL6개**다. Gallery는 필드 근거가 아니며 identity source도 사람용 source count에 포함된다.

| 제품 / canonical ID | claims | sources | worker input / output / total | 실제 API / retry / failure |
| --- | ---: | ---: | ---: | ---: |
| GFX ETERNA 55 / `fujifilm-gfx-eterna-55` | 14 | 3 | 1303 / 1068 / 2371 | 1 / 0 / 0 |
| GFX100RF / `fujifilm-gfx100rf` | 28 | 2 | 1191 / 1139 / 2330 | 1 / 0 / 0 |
| X-E5 / `fujifilm-x-e5` | 23 | 2 | 1138 / 1149 / 2287 | 1 / 0 / 0 |
| X half / `fujifilm-x-half` | 20 | 2 | 1148 / 974 / 2122 | 1 / 0 / 0 |
| 합계 | 85 | 9 연결 | 4780 / 4330 / 9110 | 4 / 0 / 0 |

- [GFX ETERNA 55](https://fujifilm-korea.co.kr/products/id/1352): GFX102MP /43.8×32.9mm CMOS II HS, 본체만2.0kg→2000g (배터리·카드 제외/body-only). 운용 무게/weightBasis는UNKNOWN이며 배터리 질량을 더하지 않았다. 110.8×138.2×176.8mm, 내부8K16:9 7680×4320 29.97p, F-Log2/F-Log2 C. 내부bitDepth/crop은null. HDMI10bit비압축/최대8K30p12bitRAW는 별도 출력 조건으로 보존했으며 내부bitDepth로 승격하지 않았다. 4K4:3 open-gate48p도 별도 조건이다. CFexpressB+SD 물리2슬롯은 본사 dual slots근거로 기록(USB SSD는 슬롯 아님, index는 저장순서용 ordinal). 내장양측3인치1.04Mdot 터치LCD를 대표값으로 선택하고 기본제공외장5인치6.22Mdot는 조건에 분리했다. IBIS/EVF/연사는UNKNOWN.
- [GFX100RF](https://fujifilm-korea.co.kr/products/id/1344): fixed/mount null, GFX102MP /43.8×32.9mm CMOS II, 실제35mm/35mm환산28mm/F4 단렌즈. min=max, aperture wide=tele=4, 디지털텔레컨버터값을 광학범위로 합치지 않음. 통합카메라735g/bodyOnly654g, 133.5×90.4×76.5mm. 기계CH6fps/전자CH3fps. 내부4K UHD29.97p H.26510bit, DIS OFFcrop1.0→cropAtMax false, ON1.32는 조건. ProRes는SSD전용이며 표의59.94p bitrate 주석을4K60모드로 승격하지 않음. EVF5.76Mdot/0.84, LCD3.15인치2.1Mdottilt touch. 디지털영상IS를IBIS로 승격하지 않음.
- [X-E5](https://fujifilm-korea.co.kr/products/id/1350): X마운트 APS-C40.2MP /23.5×15.7mm X-Trans5HR. 445g/bodyOnly396g, 124.9×72.9×39.1mm. IBIS5축 중심7stop/주변6stop CIPA2024 pitch/yaw/roll XF35F1.4조건; 대표stop은중심7, 평균값 아님. 기계8fps/전자20fps는1.29crop, native13별도. Pre-shot header1.25/row1.29혼선을 일반CH와 합치지 않았다. 내부6.2K16:9 6240×3510 29.97p H.26510bit/DIS OFFcrop1.23→true, 외부RAW6240×3512/12bit는 분리. EVF2.36Mdot/.62, LCD3인치1.04Mdottilt touch. 슬롯수는매체목록만으로추정하지않음.
- [X half/X-HF1](https://fujifilm-korea.co.kr/products/id/1348): fixed/mount null, 1인치17.74MP /13.3×8.8mm, 실제10.8mm/환산32mm/F2.8단렌즈. 통합240g/bodyOnly191g, 105.8×64.3×45.8mm. 일반내부FHD24p H.2648bit는단일세로1080×1440/3:4모드이다. 48/36/28fps high-speed와2in1/정사각합성은조건에서분리했으며합성출력을센서MP로승격하지않음. LCD2.4인치0.92Mdottouch, 기구/mechanism UNKNOWN. OVF를EVF numeric fields에넣지않고EVF UNKNOWN유지. IBIS/연사도UNKNOWN. Half-frame풍UX/필름경험/필름시뮬레이션은후속feature/Experience후보뿐이며objective성능으로승격하지않음.

## Strict validation / UNKNOWN / source conflict

두fixed 제품의 실제/환산 min/max **8개claim 모두 rawUnit와staged/diff unit mm**. 각prime min=max와actual/equivalent를독립적으로검토했고 별도lens product를생성하지않았다. 기존getIntegratedLens는 camera에포함된표현만 반환하며weight/newPrice/usedPrice 모두null, CAMERA_LENSES독립pool에없다. body의카메라전체무게를한번만사용하는기존구조와호환된다.

신규production은 archive compatibility mode를 **사용하지 않았다**. CLInormalize/validate/diff/approval은기본strict규칙이며ingest/promotion에legacy옵션연결없다. 실제staging의focal/equivalent 각min/max를메모리에서변형하여 unit/rawUnit누락은UNIT_REQUIRED, ft미지원은UNSUPPORTED_UNIT로차단했다. IBISboolean/malformed와무게basis누락/invalid/mismatch도기존validator에서차단함을회귀검증했다. 원본artifact는변형하지않았다.

Accepted sources/value-conflict와CONFLICTING_CLAIM_VALUES **0건**. source의서로다른조건/표기를모두같은claim으로합치지않음: X-E5pre-shot혼선, GFX100RF ProRes비트레이트주석, ETERNA HDMI vs내부녹화는구분보존했다. 기존canonical에존재하는제품업데이트는없어same-value/new-evidence/null-fill/value-conflict승격도없다.

주요UNKNOWN은 ETERNA운용무게·내부bitDepth/crop·IBIS/EVF/연사, X halfIBIS/EVF/연사/LCD기구·센서generation·영상log/crop, GFX100RF IBIS·영상log, X-E5영상log, 3개비ETERNA물리슬롯수, 네제품가격/미수집AF상세/배터리Shots 등이다. null은부재확정이아니다. 가격은production promotion대상밖이며blocker로사용하지않음.

## Cheap-worker / 직접 판단 / 재개

제품별stable task `fujifilm-production-002-gfx-eterna-55`, `fujifilm-production-002-gfx100rf`, `fujifilm-production-002-x-e5`, `fujifilm-production-002-x-half`. Dry-run4회는API횟수에서제외. 각실제API1회, retry/failure0, worker응답은모두success/analysis/files[]/patch빈값으로검토했으며patch를적용하지않았다. 공개제조사발췌+최소계약만전달했다. 코드/canonical전체/프로젝트설정/secret은전송하지않았고공용worker본체도수정하지않음. 전달fixture4개는검토후삭제하여Git에포함하지않았다.

- ETERNA: HDMI출력·ProRes미디어·영상모드조건/UNKNOWN경고채택. 2kg을operating으로분류하거나bodyOnly UNKNOWN로돌리는제안폐기(공식행은명확히배터리·카드제외). ProResCFexpress제한과SD+CFexpress듀얼슬롯을진짜source충돌로보는해석폐기(서로다른계약). 이미명시된센서generation을미확인이라보는제안도폐기.
- GFX100RF: actual/equivalent분리·디지털teleconverter·ProRes59.94주석경고채택. 디지털IS만으로IBISpresent:true를제안한부분폐기. 이미제공된내부10bit/LCD틸트가없다는주장폐기. DIS OFF1.0배는선택한대표모드조건에서cropAtMax false로확인. 디지털teleconverter가광학값이아니라는점과그숫자쌍이공식값충돌이라는주장을구분했다.
- X-E5: 중심/주변IBIS·CIPA2024·CHcrop·pre-shot·내부/외부resolution차이경고채택. 해당6.2K모드의crop1.23도공식표에있으므로cropAtMax를UNKNOWN로보류하라는제안폐기. 제품사양발췌전체를identity-only라부르는판단도폐기.
- X half: 렌즈분리·합성센서MP오해방지·high-speed분리·OVF와EVF·UNKNOWN·무게basis경고채택. shape/kind/identity는Sol이공식제품과기존분류를직접검토했다.

GPT-6.1 Sol이출시상태/scope/4identity·IDs/aliases/bodyStyle/mount/9sources/85claims·conditions/UNKNOWN/전체diff/approval/apply를직접판단했다. 별도사용자확인/수동자료입력 **0회**. worker는보조검토이며정확한사양확정주체가아니다. 신뢰도가낮은제안은폐기해worker결과를맹신하지않았다.

모든manifest item canonicalized, approval/apply/evidence/journal이존재한다. 다음세션은 `status --batch production-fujifilm-bodies-002`와현재canonical을확인하고worker/raw/approval/apply를반복하지않는다. 원본API결과는 `/tmp/fuji002-worker-1.json`~4와worker ledger에남아있으며토큰/채택·폐기는이문서에영구기록했다. 생성용 `/tmp/fuji002-raw.mjs`는이미완료된batch가있으면재실행을거절한다.

## 검증 / digest / 후속 범위

Raw9개의accessedAt은raw-helper에서현재UTC자동생성한 **2026-10-02T04:43:53.178Z~2026-10-02T04:43:53.181Z**. 날짜자정합성없음, 밀리초ISO/Date round-trip검증완료.

Diff digest `fd3826955907b3cc06483ed244c930548e3e75248c195fc7b61f76d65ce5cbdd`, approval `approval-5e6a813ad01c94f7dd3ee6ed7f50472c4e9d32eca05c094ed79d4a75f4a4ca5c`, baseline canonical SHA `fdde584efd7bae388ccf9dea73b0b1da3ec420bf9ff548a66233bc8644e02022`, after SHA `0c21fdb4f109e4153db653b223e40dff3142001b5a41b623e874ba6c492ae46d`.

적용전전체 **166/166**, 최종전체 **172/172**, Objective/production **132/132**, Fujifilm **11/11** (batch002신규6개), canonical **147개 전체valid**, `pnpm build`, Objective6scripts+신규test총7files `node --check`, `git diff --check` 통과. Build는기존500kB초과chunk경고만발생. 실제재적용 **already-canonicalized / canonicalMatches:true** 확인.

Production pipeline 신규bug/architecture변경 **없음**. 첫inventory완료기록스크립트가journal의없는updatedAt을참조하여기록에실패했고그때coverage test1개가실패했다. 실제completedAt필드로기록을완료한뒤전체/Fujifilm최종테스트모두통과했다. production artifact/승격결과문제는아니며확인된실패도숨기지않았다.

후속표현개선후보: 기존단일video.max는세로FHD/합성/특수모드와출력경로를모두표현하지못한다. 단일lcd는ETERNA의내장양측과외장모니터를동시에표현하지못한다. 현재condition metadata에보존하고schema/추천/UI는수정하지않았다. GFX센서포맷에대한기존추천점수/환산fallback및G렌즈pool부족은batch001에서알려진문제로이번범위밖이다.

다음은신규제품재선정/강제5개채우기가아닌 **기존현행5개 provenance 보강batch**(X-T5/X-T50/X-S20/X-M5/X100VI). 그후Fujifilm전체coverage audit. FRAGMENT/limited/IR/Instax범위분리는계속유지한다. local batch commit으로기록하고push하지않는다.
