# Panasonic/LUMIX G production batch 003 — 2026-10-07

## Completed scope / resume checkpoint

Started from **clean git `49fb7b6be69cc1fe56245f3f258fb614a9422d25`**; reviewed original Panasonic inventory, production001/002, progress, canonical, identity-map, catalog-scope, field contracts and existing regressions. Exact remaining eleven matched the supplied list; GH7/G100D excluded by artifacts. Korean current G gallery/API pages1–3 were rechecked: **20 cards /13 base identities**, all original card keys present. Current means officially retained KR lineup, not worldwide manufacturing/stock. Historical inventory/S checkpoint and earlier production artifacts remain immutable.

**All eleven complete in one atomic transaction.** Official per-model sources →11 independent actual worker tasks →30 raw /222 observations →normalize →validate11/11 →human-readable diff and conditions review →explicit CLI approval →atomic apply →full canonical validation →actual idempotent reapply complete. **New10 /existing G9II reinforcement1**. Canonical **121 bodies /36 lenses /157 total →131 /36 /167**. G9II identity/aliases/prices and every other old body/lens preserved. No recommendation/UI/Experience/price/lens/schema/vocab/validator/adapter changes.

The new [G current checkpoint](../src/data/ingestion/panasonic-lumix-g-current-gallery-2026-10-07.json) records canonicalized states and raw-helper clock checks. All manifest items canonicalized, lastSuccessfulGate apply. No worker calls or production gates need repeating. Other-family counts are inherited from the original full inventory and S batch002; this is not a new whole-brand audit.

## Per-product diff and core values

Unique paths are counted, not duplicate source observations. New-product categories include incoming null paths; those do not become verified known field evidence. **222 observations =197 known +25 UNKNOWN**; known source duplicates3 yield **194 unique verified field evidence paths** across11 cameras (21 existing G9II,173 across10 new cameras). All new prices stay UNKNOWN.

| Product / ID | Operation | Same evidence | Null-fill | Value conflict | New paths (known) | Batch sources / all attached | MP / selected internal video / operating g / body-only g |
|---|---|---:|---:|---:|---:|---:|---|
| LUMIX G9 II / `panasonic-g9-ii` | update-product | 4 | 16 | 1 | 0 (0) | 2/4 | 25.21 / 5.8K 29.97p / 658 / 575 |
| LUMIX G85 / `panasonic-g85` | new-product | 0 | 0 | 0 | 19 (16) | 3/3 | 16 / 4K 30p / 505 / 453 |
| LUMIX G100 / `panasonic-g100` | new-product | 0 | 0 | 0 | 19 (14) | 3/3 | 20.3 / 4K 30p / 345 / 303 |
| LUMIX GH6 / `panasonic-gh6` | new-product | 0 | 0 | 0 | 21 (21) | 3/3 | 25.21 / 5.8K 29.97p / 823 / 739 |
| LUMIX GH5II / `panasonic-gh5-ii` | new-product | 0 | 0 | 0 | 21 (20) | 2/2 | 20.33 / 6K 29.97p / 727 / 647 |
| LUMIX GH5 / `panasonic-gh5` | new-product | 0 | 0 | 0 | 21 (20) | 3/3 | 20.33 / 6K 29.97p / 725 / 646 |
| LUMIX G9 / `panasonic-g9` | new-product | 0 | 0 | 0 | 20 (19) | 3/3 | 20.33 / 4K 60p / 658 / 586 |
| LUMIX G95 / `panasonic-g95` | new-product | 0 | 0 | 0 | 21 (17) | 2/2 | 20.3 / 4K 30p / 536 / 484 |
| LUMIX GF10 / `panasonic-gf10` | new-product | 0 | 0 | 0 | 17 (12) | 2/2 | 16 / 4K 30p / 270 / 240 |
| LUMIX GX9 / `panasonic-gx9` | new-product | 0 | 0 | 0 | 19 (17) | 3/3 | 20.3 / 4K 30p / 450 / 407 |
| LUMIX GH5S / `panasonic-gh5s` | new-product | 0 | 0 | 0 | 20 (17) | 4/4 | 10.28 / C4K 59.94p / 660 / 580 |

G9II's only conflict is **rounded legacy25.2MP →official exact25.21MP**, independently corroborated by NA and JP. Both agreeing incoming claims received explicit accept decisions; no silent overwrite. Four same-value paths are sensor.format/weight/weightBasis/bodyOnlyWeight;16 other paths null-fill. Existing identity/aliases/price remain byte-equivalent. G9II contributes2 new official source artifacts; prior2 manufacturer sources remain, total4. New identity-only Korean sources are actually linked and counted. Unknown object children may remain absent under the existing canonical contract (e.g. G100/GF10 mechanical burst and G95 LCD dots); staging explicitly retains null/UNKNOWN and conditions. Absence/null is not false or zero.

## Official source registry

30 source artifacts /30 distinct ingested URLs, one product per raw. Full model source pages and PDF tables were directly reviewed beyond the bounded worker excerpts. Additional lookup references (KR G100D release, GH6 SSD, GH5 firmware) are preserved in checkpoint/claim metadata; they are not inflated into extra accepted source counts.

| Product | Official source | Raw artifact |
|---|---|---|
| panasonic-g9-ii | [DC-G9M2 official camera specification](https://help.na.panasonic.com/answers/specifications-sheet-for-lumix-g-series-dc-g9m2/) | `source-4dea1fe3a5b27474` |
| panasonic-g9-ii | [DC-G9M2 Japanese exact pixels / operating weight corroboration](https://panasonic.jp/dc/products/DC-G9M2/spec.html) | `source-9b428c4b072143f8` |
| panasonic-g85 | [DMC-G85(바디킷) official KR current identity](https://www.panasonic.co.kr/consumer/xview/Camera/Camera/LumixG/CDC1215) | `source-d0856e6fca5400e3` |
| panasonic-g85 | [DMC-G85 official camera specification](https://help.na.panasonic.com/answers/features-and-specifications-lumix-g-series-dmc-g85/) | `source-9d7b1b0f0c657ff1` |
| panasonic-g85 | [DMC-G85 advanced manual / firmware appendices](https://help.na.panasonic.com/wp-content/uploads/2023/02/DMCG85_DVQP1003ZA_ENG.pdf) | `source-724ff42490ecd0ff` |
| panasonic-g100 | [DC-G100KGD official KR current identity](https://www.panasonic.co.kr/consumer/xview/Camera/Camera/LumixG/CDC1204) | `source-cb08fe807db4f524` |
| panasonic-g100 | [DC-G100 official camera specification](https://help.na.panasonic.com/answers/features-and-specifications-lumix-g-series-dc-g100/) | `source-1acb81c600f971ba` |
| panasonic-g100 | [DC-G100 advanced manual / firmware appendices](https://help.na.panasonic.com/wp-content/uploads/2023/02/DCG100_DVQP2173ZA_ENG.pdf) | `source-b527ba810d999f5c` |
| panasonic-gh6 | [DC-GH6GD official KR current identity](https://www.panasonic.co.kr/consumer/xview/Camera/Camera/LumixG/DCGH6GD) | `source-a2f6dd934179772c` |
| panasonic-gh6 | [DC-GH6 official camera specification](https://help.na.panasonic.com/answers/specifications-sheet-for-lumix-g-series-dc-gh6/) | `source-392f555eced23539` |
| panasonic-gh6 | [DC-GH6 advanced manual / firmware appendices](https://help.na.panasonic.com/wp-content/uploads/2023/02/DCGH6_DVQP2441ZA_ENG.pdf) | `source-2694e633f9364b49` |
| panasonic-gh5-ii | [DC-GH5M2L official KR current identity](https://www.panasonic.co.kr/consumer/xview/Camera/Camera/LumixG/GH5M2L) | `source-6d8640fd4f73c031` |
| panasonic-gh5-ii | [DC-GH5M2 official camera specification](https://help.na.panasonic.com/answers/features-and-specifications-lumix-s-series-model-dc-gh5m2/) | `source-2957e88fe5a44cf3` |
| panasonic-gh5 | [DC-GH5GD official KR current identity](https://www.panasonic.co.kr/consumer/xview/Camera/Camera/LumixG/CDC1211) | `source-589368e0819fc066` |
| panasonic-gh5 | [DC-GH5 official camera specification](https://help.na.panasonic.com/answers/features-and-specifications-lumix-g-series-dc-gh5/) | `source-10aaad61becbb07f` |
| panasonic-gh5 | [DC-GH5 advanced manual / firmware appendices](https://help.na.panasonic.com/wp-content/uploads/2023/02/DCGH5_DVQP1117ZA_ENG.pdf) | `source-23a83bf7ce25c5a8` |
| panasonic-g9 | [DC-G9GD-K official KR current identity](https://www.panasonic.co.kr/consumer/xview/Camera/Camera/LumixG/CDC1202) | `source-bde07a69fad42d2a` |
| panasonic-g9 | [DC-G9 official camera specification](https://help.na.panasonic.com/answers/features-and-specifications-lumix-g-series-dc-g9/) | `source-89695eb188302acd` |
| panasonic-g9 | [DC-G9 advanced manual / firmware appendices](https://help.na.panasonic.com/wp-content/uploads/2023/02/DCG9_DVQP1402ZA_ENG.pdf) | `source-edf1f2eae4ceb08e` |
| panasonic-g95 | [DC-G95GD official KR current identity](https://www.panasonic.co.kr/consumer/xview/Camera/Camera/LumixG/CDC1203) | `source-e2453a76d6c1c9f3` |
| panasonic-g95 | [DC-G95 official camera specification](https://help.na.panasonic.com/answers/features-and-specifications-lumix-g-series-dc-g95-g95d/) | `source-5517b7976667bc2e` |
| panasonic-gf10 | [DC-GF10KGD (핑크) official KR current identity](https://www.panasonic.co.kr/consumer/xview/Camera/Camera/LumixG/CDC1209) | `source-7674fe9b5ab5f1c1` |
| panasonic-gf10 | [DC-GF10 official camera specification](https://news.panasonic.com/jp/press/jn180201-1) | `source-a9eb652712a40b63` |
| panasonic-gx9 | [DC-GX9GD(바디킷-실버) official KR current identity](https://www.panasonic.co.kr/consumer/xview/Camera/Camera/LumixG/CDC1214) | `source-96be7b7d9416bf20` |
| panasonic-gx9 | [DC-GX9 official camera specification](https://help.na.panasonic.com/answers/features-and-specifications-lumix-g-series-dc-gx9/) | `source-c99fae1f4ed2b12e` |
| panasonic-gx9 | [DC-GX9 advanced manual / firmware appendices](https://help.na.panasonic.com/wp-content/uploads/2023/02/DCGX9_DVQP1462ZA_ENG.pdf) | `source-4ef92e59b74d02e2` |
| panasonic-gh5s | [DC-GH5S official KR current identity](https://www.panasonic.co.kr/consumer/xview/Camera/Camera/LumixG/CDC1212) | `source-01ea7bf148bf3485` |
| panasonic-gh5s | [DC-GH5S official camera specification](https://help.na.panasonic.com/answers/features-and-specifications-lumix-g-series-dc-gh5s/) | `source-b15f2449b5b8e679` |
| panasonic-gh5s | [DC-GH5S advanced manual / firmware appendices](https://help.na.panasonic.com/wp-content/uploads/2023/02/DCGH5S_DVQP1438ZA_ENG.pdf) | `source-ad648336770db342` |
| panasonic-gh5s | [DC-GH5S exactly scoped official Body I.S. comparison column](https://help.na.panasonic.com/answers/model-comparison-dc-gh5m2-dc-gh5-dc-gh5s-dc-gh6-dc-bgh1/) | `source-a32101e0416d0b95` |

## Direct review / preserved conditions / UNKNOWN

Incoming source-value conflicts: none accepted. G95 LCD disputed numerical field is explicitly withheld: NA help G95 column says1,240k,official archive search gives1,040k but archive is inaccessible403; no resolution guessed or G95D value transferred. G95 PDF confirms motion modes but does not resolve monitor spec. Pending source-scope/region reconciliation, not two conflicting known incoming claims. Future incompatible known values must be rejected by CONFLICTING_CLAIM_VALUES. Human diff categories classify all new-product paths as new, including null observations; its unknown category0 does not mean the new camera has no UNKNOWN fields.

GH5S BodyIS absence verified against explicit GH5S comparison column; selected C4K59.94p internal420/8bit150Mbps,notHDMI42210bitoutput. GH5/II6K29.97p is4992x3744 4:3 anamorphic motion picture,not6KPHOTO. GH5 requiresfirmware2.0 andMP4(LPCM),2xanamorphic lens/desqueeze-compatible playback,noHDMI during recording. VLogL GH5/G9 requiresoptionalDMW-SFU1 (G9firmware2.0). G9 selected internal4K60 label8bit differsfrom4K30internal10bit and4K60HDMI10bit. Exact fractional fps retained wherever explicitly documented; integer-only labels not inferred.

IBIS: bodyBIS8/7.5/6.5/5/5 forG9II/GH6/GH5II/GH5/G95, CIPA yawpitch actual60/equivalent120mm lens conditions; combinedDualIS ratings separate metadata. G85/G9/GX9bodypresent directly proven by manual,but standaloneaxes/stops unknown. G100Hybrid5axis comes fromlens+electronic,notbody; GF10kitOISnotbody; bodyIBIS UNKNOWN.

Weight: all11battery-and-card plusbody-only,exclude lens/grip/rig. G95FIRSTcolumn536/484g,notG95D533/481. GF10official270/240g,notkit337/392. GX9body407g. G100EVFcolorLCD3680kdots+USBMicroB distinguishG100DOLED2360k+TypeC. G9/G9IIoperatingboth658gbutbody586vs575and20.33vs25.21MP.

Storage: explicitdualSDforG9II/GH5II/GH5/G9/GH5S;GH6CFexpressB+SD,externalSSDfirmware2.2notthirdphysicalslot. G85/G100/G95/GF10/GX9count UNKNOWN from reviewedmedia-onlytables;GF10microSDfamily+UHSI metadata,notordinarySD. G85SH40electronicJPEGonlysmallSfixed,focuslockedfirst,max120 retained;G100/GF10EFCS6/5.8notmappedtomechanicalmax;GH5Scombinedburst12/8,RAW14bit11/7notmappedtounprovenshutter split.

UNKNOWN: physicalmm absentG85/G100/G9/GF10/GX9/GH5S;per-modecrop unknownexceptG9II/GH6FULLandGX9narrower4K;selectedbitdepthunknownG85/G100/G95/GF10/GX9;GF10EVFunknown;AF/battery/date/shutter/weatherfieldsnotcollectedremainNULL. Prices excluded. Singlevideo.max and existingrecommendationfractionalparser limitations intentionally untouched.

Reviewer: main Codex direct review; no claim that a separate person reviewed the data. User intervention during batch:0. Local evidence/PDF/column decisions above are parent-agent review. Official-source retrieval failures404/403 were replaced or leftUNKNOWN;worker API failures0. No pipeline or schema modifications.

Additional scope notes:

- All eleven mounts are Micro Four Thirds under existing vocab; model-specific specifications/manual mount passages confirm this. Physical17.3×13mm is recorded only for G9II/GH6/GH5II/GH5/G95 where explicitly stated. Other4/3-type claims do not imply physical mm.
- G9II/GH6 selected5.8K29.97p5760×4320 4:3 internal42010bit200Mbps differ from5.7K59.94p17:9 and4K/C4K119.88p. GH6 PDFp139 visually proves FULL. G9II own NA mode row explicitly proves FULL; crop false is tied to that mode.
- GH5 PDF358 (printedF-11), GH5S164 and G85115 were rendered and visually inspected to preserve table columns/footnotes. GH5S comparison HTML column spans were checked explicitly for bodyIS absence. G95 original/current revision columns were reviewed from HTML, never flattened into one value.
- GH5S shutter-specific fps stays UNKNOWN because own spec/advanced guide H-row combines modes;12/8 and14bit11/7 preserved in metadata. GF10 manufacturer labels5.8fps mechanical **electronic-front-curtain**, so parent rejected mapping it into full mechanical maximum. G1006fpsEFCS handled identically.
- G85/G9/GX9 body stabilization presence is verified, standaloneaxes/stops are UNKNOWN in the directly reviewed evidence. Manufacturer archive retrieval blocked403/404; no cached search snippet was elevated into verified canonical body-stop data.
- G95 LCD1.24M vs1.04M remains a **follow-up regional/revision/source reconciliation candidate**, not a claimed fully resolved true source conflict. No incompatible known incoming values were approved. Selected bitdepth remains UNKNOWN when only HDMI output depth or incomplete mode evidence exists.

## Cheap-worker actual calls / adoption

Exactly **11 independent stable tasks,11 actual API calls**, first call without retry. All preflights passed, all calls returnedsuccess, retry0/failure0. Only public per-model official extracts plus a minimal contract were sent; no canonical/project code/secrets. Bounded excerpts omitted full video/IBIS tables and sometimes repeated overlapping fragments; parent reviewed the complete official pages/PDFs before promotion. Worker usefulness was primarily warnings/scoped extraction, not autonomous approval. Returned no-change file entries were not applied or executed.11 temporary fixture files deleted; API result/usage details recorded here so later sessions must not repeat calls.

| Product / stable task suffix | Input | Output | Total | Useful warnings adopted | Parent resolution / rejected proposal |
|---|---:|---:|---:|---|---|
| G9II / `panasonic-production-003-g9ii` | 4000 | 607 | 4607 | 25.21 effective versus total; CIPA lenses; cover/body-cap and burst modes | Own full NA video row proves5.8K29.97/FULL; JP confirms25.21/658; limited excerpt omissions do not prove absence |
| G85 / `panasonic-production-003-g85` | 2817 | 459 | 3276 | kit weights excluded; media-only row not proof of slot count | Manual SH40 JPEG/S/focus/max120 and bodyIS presence; body-stop rating not guessed |
| G100 / `panasonic-production-003-g100` | 2641 | 259 | 2900 | 6fpsEFCS not mechanical; sensor mm absent; no bodyIBIS evidence | Manual239 records4K30label10min;205 lens+electronicHybrid; no invented fractional rate or8bit |
| GH6 / `panasonic-production-003-gh6` | 3067 | 1133 | 4200 | BIS/DualIS separate lenses; card and burst/media constraints | Full PDF139 provesFULL; internalCFexpressB+SD; USBSSD>=2.2 not third slot |
| GH5II / `panasonic-production-003-gh5ii` | 3910 | 460 | 4370 | weights, shutter/AF burst, no6KPHOTO/video conflation | Full own spec provesanamorphic6K29.97/42010bit; preinstalledVLogL |
| GH5 / `panasonic-production-003-gh5` | 3352 | 543 | 3895 | body/kit weights, dualSD, firmware/6KPHOTO distinction | Manual firmware2.0F-11 proves6Kanamorphic; optionalDMW-SFU1,bodyBIS separate |
| G9 / `panasonic-production-003-g9` | 3323 | 303 | 3626 | effective20.33;658/586 weights; optionalDMW-SFU1 | Full manualMOV60label8bit vs4K30internal10bit/4K60HDMI10bit; standaloneBISstops unknown |
| G95 / `panasonic-production-003-g95` | 3440 | 681 | 4121 | model columns536/484 vs533/481; no4KPHOTO in video | Parent HTMLFIRSTG95 column resolvesweight (not a trueweightconflict);LCD numerical ambiguity withheld |
| GF10 / `panasonic-production-003-gf10` | 5396 | 401 | 5797 | GF10W kit body scope;270/240 vs337/392; lensOIS notbody | Parent rejected5.8EFCS as mechanical maximum;10ES retained;JPbody row andKRbaseidentity matched |
| GX9 / `panasonic-production-003-gx9` | 2592 | 408 | 3000 | body407 vs kit weights; no sensor mm/slot count inferred | Manual provesbodyIS presence/narrower4K,30label; axes/stops/bitdepth remain unknown |
| GH5S / `panasonic-production-003-gh5s` | 3086 | 411 | 3497 | 10.28 vs total11.93; RAW14bit burst anddualSD | Explicit comparison provesnoBIS;manual164C4K59.94internal8bit not10bitHDMI;shutter split UNKNOWN |

**Total input/output/total: 37624/5665/43289.** API calls11, retries0, failures0. No worker code applied.

Main GPT-6.1 Sol retained eleven identity/new-existing/source/mount/sensor/BIS/video/media/UNKNOWN/diff/approval/apply decisions. All222 observations and30 source artifacts reviewed;8 official manuals examined,4 selected PDF table renders inspected. Human user additional intervention0; this is agent review, not a claim of a separate human approval. Small script/test-draft corrections remained in temporary orchestration/new regression files; no pipeline workaround.

## Validation / closure

- Whole suite **211/211**; Objective/production/catalog/coverage **184/184**; Panasonic **24/24** including8 new regression cases. Scope-specific tests verify eleven-item replay and full unchanged unrelated products/prices/lenses, source/digest/explicit conflict approval, raw UTC helper bounds, exact current inventory/generation identities, bodyBIS versusDual/Hybrid, conditional fractional/video/firmware/license/HDMI bits, physicalslots/SSD/EFCS/SH/UNKNOWN, and weightBasis/IBIS rejection across all11 actual production staging items. Initial new test expected unknown sparse children to be explicitnull; corrected that test to existing absence/null contract. No data/pipeline change needed.
- Canonical full validator **true**,131 bodies/36 lenses/167 total.
- `pnpm build` success; existing>500KB bundle warning only. `node --check`7files (six Objective modules plus new regression) and `git diff --check` pass.
- Actual second `apply` returns **already-canonicalized /canonicalMatches:true**. Canonical hash matches sealed transaction archive; no apply repeated writes.
- Raw helper auto-generated all30 UTC timestamps in actual clock window **2026-10-07T00:47:59.822Z → 2026-10-07T00:47:59.854Z**; every before≤accessedAt≤after and ISO round-trip verified. Raw-helper time is contemporaneous evidence access/review at creation; earlier network fetch time for gallery/availability is separately retained. No date-only midnight conversion or historical timestamp changes.
- Baseline SHA256 `0c60df361495138d8f1872dfa99f48ada5a378153db948093b9e88ae0c1cc44c`; after `19d37989beccef9930e6af2130b0e4bab3e3eeeb9d487f9e90ba989b8ad6ea71`; diff `1ba169d54cc932a351342850a764e42ec9d7eea1743005a25064766b8650cc36`; approval `approval-778f81e7bb3272ba0f9bd8a8feaab0a640932e20023da393e795c1eb1519281d` (`cli-explicit`).
- Resume authority: [manifest](../src/data/ingestion/batches/production-panasonic-bodies-003.json), [approval](../src/data/ingestion/approvals/production-panasonic-bodies-003.json), [journal](../src/data/ingestion/transactions/production-panasonic-bodies-003/journal.json), [regression](../tests/panasonicProduction003.test.js). Close with local `Objective-Batch: production-panasonic-bodies-003` commit; no push.

## Remaining scope / next batches

**LUMIX G production unprocessed0 (13/13 base identities now have production provenance). LUMIX S also0 (10/10). Panasonic overall remaining15 =compact4 +directly operated camcorder11**, under original full-inventory denominator with S/G checkpoints applied. Full field completeness is not claimed; above UNKNOWN fields are retained.

Compact4 can be one subsequent batch after official current recheck and per-model multi-source/fixed-lens actual-versus-equivalent/unit review. Existing fixed-lens pipeline has production precedent, but unreviewed compact data is not preapproved. Camcorder pipeline work can start with a separate small pilot to verify operational/accessory-dependent weight, video modes and current contracts. AJ-CX4000 bayonet vocab remains out of scope; not every camcorder is pre-certified to fit unchanged contracts. Do not mix this with lenses, price/Experience or engine/UI changes.

No new schema-wide/validator/atomicity blocker or pipeline code fix. Inherited singlevideo.max consumers cannot consume all conditional metadata; inherited29.97→97 parser behavior unchanged. G95 LCD reconciliation, body-only BISratings/axes on G85/G9/GX9, physicalslot-count evidence and integer-label fractional fps are follow-up data candidates, not guessed values or new schema in this batch.
