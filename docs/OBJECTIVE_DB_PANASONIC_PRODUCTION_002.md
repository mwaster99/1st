# Panasonic/LUMIX S production batch 002 — 2026-10-07

## Completed scope and resume checkpoint

Started with **clean git** at `36460f1956685408b622053557d4b8dd84bb57b5`. Read inventory/pilot/progress/canonical/identity-map/catalog-scope/contracts/regressions. Canonical before **114 bodies /36 lenses /150 total**. Exact8 targets retained, no reselection. Official Korean LUMIX S gallery/API pages1–2 rechecked:13 cards/10 base identities; eight target base products still listed. Delivered/operating evidence is retained from the pilot inventory; S1II/S1IIE Korean 2025 launch and November2025 firmware notice additionally distinguish delivery from a future announcement. “Current” here means officially retained KR lineup, not worldwide manufacture or stock.

Official collection →8 independent actual worker tasks →24 raw →normalize →validate8/8 →human-readable diff/conditions review →explicit CLI approval →one atomic apply →canonical validation →actual idempotent reapply **complete**. All8 manifest items canonicalized; no gate needs repeating. Canonical **121/36/157**; new7/existing S9 reinforcement1. Existing S9 identity/aliases/price and every other pre-existing product/lens preserved. No engine/UI/price/Experience/schema/vocab/pipeline code changes or historical artifacts modified.

A new current S gallery checkpoint preserves the historical pilot snapshot: [S gallery 2026-10-07](../src/data/ingestion/panasonic-lumix-s-current-gallery-2026-10-07.json). Other family counts remain based on the previous full inventory; this is not a new full Panasonic coverage audit.

## Diff review and promoted values

Counts are unique paths/categories, not duplicated evidence rows. For a new product the diff labels incoming null paths as `new-product`; they do **not** become verified canonical evidence. Null-fill applies to existing products, so it is0 for new bodies. Raw167 claims comprise161 known observations (one duplicate SH30 source) and6 UNKNOWN observations across4 unique fields. Canonical gains160 verified unique field evidence entries across8 bodies, including16 on S9.

| Product / canonical ID | Operation | Same-value/new-evidence | Null-fill | Value-conflict | New paths (known) | Batch sources | Core MP / video / operating g / body g |
|---|---|---:|---:|---:|---:|---:|---|
| LUMIX S9 / `panasonic-s9` | update-product | 4 | 12 | 0 | 0 (0) | 2 | 24.2 / 6K 29.97p / 486 / 403 |
| LUMIX S5 / `panasonic-s5` | new-product | 0 | 0 | 0 | 21 (21) | 3 | 24.2 / 4K 59.94p / 714 / 630 |
| LUMIX S1IIE / `panasonic-s1-iie` | new-product | 0 | 0 | 0 | 22 (21) | 4 | 24.2 / 6K 29.97p / 795 / 712 |
| LUMIX S1II / `panasonic-s1-ii` | new-product | 0 | 0 | 0 | 22 (21) | 4 | 24.1 / 6K 29.97p / 800 / 718 |
| LUMIX S1R / `panasonic-s1r` | new-product | 0 | 0 | 0 | 20 (19) | 3 | 47.3 / 5K 30p / 1016 / 899 |
| LUMIX S1 / `panasonic-s1` | new-product | 0 | 0 | 0 | 21 (20) | 3 | 24.2 / 6K 24p / 1016 / 899 |
| LUMIX S5IIX / `panasonic-s5-iix` | new-product | 0 | 0 | 0 | 21 (21) | 2 | 24.2 / 6K 29.97p / 740 / 657 |
| LUMIX S1H / `panasonic-s1h` | new-product | 0 | 0 | 0 | 21 (21) | 3 | 24.2 / 6K 23.98p / 1164 / 1052 |

All8 L-Mount/interchangeable. Field contracts unchanged. S9 batch sources2 are NA specs + full guide; KR identity was checked in gallery but does not manufacture spec evidence or a new identity. S9 firmware menu is a related official thermal-condition reference, not a fabricated precise-fps claim. Its prior canonical manufacturer source remains, so total attached manufacturer sources are3. New bodies' identity-only KR sources remain linked in canonical provenance and counted in the human summary.

## Official source registry

Each raw has exactly one product item, exact official URL/model scope and helper-generated actual UTC accessedAt. Shared Korean launch article produces two independent model-scoped raw sources, not cross-model claims.24 source artifacts /23 distinct URLs. Ingested sources below; further reviewed KR S9 card and firmware thermal reference are recorded in gallery/conditions.

| Product | Source / URL | Artifact |
|---|---|---|
| panasonic-s9 | [DC-S9 official NA specification sheet](https://help.na.panasonic.com/answers/features-and-specifications-lumix-s-series-model-dc-s9k/) | `source-028f8479dd9ee077` |
| panasonic-s9 | [DC-S9 complete guide video mode table](https://help.na.panasonic.com/wp-content/uploads/2024/06/DCS9_DVQP3138ZA_ENG.pdf) | `source-03cbca54fa7957fc` |
| panasonic-s5 | [DC-S5GD-K official Korean product identity](https://www.panasonic.co.kr/consumer/xview/Camera/Camera/LumixS/DC-S5GD-K) | `source-cbeb22b15c2a3ccf` |
| panasonic-s5 | [DC-S5 official NA specification sheet](https://help.na.panasonic.com/answers/features-and-specifications-lumix-s-series-dc-s5/) | `source-7d9026efbdf7d9ab` |
| panasonic-s5 | [DC-S5 complete guide video mode table](https://help.na.panasonic.com/wp-content/uploads/2024/02/DCS5_DVQP2197ZA_ENG.pdf) | `source-da956abb9a3d9274` |
| panasonic-s1-iie | [DC-S1M2ESGD official Korean product identity](https://www.panasonic.co.kr/consumer/xview/Camera/Camera/LumixS/DCS1M2ESGD) | `source-51ea498afe3b22bc` |
| panasonic-s1-iie | [DC-S1M2ES official NA specification sheet](https://help.na.panasonic.com/answers/features-and-specifications-lumix-s-series-dc-s1m2esbody/) | `source-6d1e9a2b4b56ec56` |
| panasonic-s1-iie | [DC-S1M2ES Japanese specification / burst and unresolved physical sensor discrepancy](https://panasonic.jp/dc/products/DC-S1M2ES/spec.html) | `source-56bbda3e8280e76e` |
| panasonic-s1-iie | [DC-S1M2ES individually scoped sensor statement in Korean launch news](https://www.panasonic.co.kr/event/news_view.do?seq=156) | `source-63a6ffcae24429d8` |
| panasonic-s1-ii | [DC-S1M2GD official Korean product identity](https://www.panasonic.co.kr/consumer/xview/Camera/Camera/LumixS/DCS1M2GD) | `source-59ab1f37a047597e` |
| panasonic-s1-ii | [DC-S1M2 official NA specification sheet](https://help.na.panasonic.com/answers/features-and-specifications-lumix-s-series-dc-s1m2body/) | `source-a6378778b07ef76e` |
| panasonic-s1-ii | [DC-S1M2 Japanese specification / burst and unresolved physical sensor discrepancy](https://panasonic.jp/dc/products/DC-S1M2/spec.html) | `source-563cdef723dd1a9c` |
| panasonic-s1-ii | [DC-S1M2 individually scoped sensor statement in Korean launch news](https://www.panasonic.co.kr/event/news_view.do?seq=156) | `source-b62eb6b208d73785` |
| panasonic-s1r | [DC-S1RMGD-K official Korean product identity](https://www.panasonic.co.kr/consumer/xview/Camera/Camera/LumixS/CS10005) | `source-32ce0418785ba4a7` |
| panasonic-s1r | [DC-S1R official NA specification sheet](https://help.na.panasonic.com/answers/features-and-specifications-lumix-s-series-model-dc-s1r/) | `source-f26d75e8e153c243` |
| panasonic-s1r | [DC-S1R official firmware/activation video conditions](https://help.na.panasonic.com/answers/dc-s1r-firmware-updates-improvements/) | `source-d00b4f04c1d42ad6` |
| panasonic-s1 | [DC-S1MGD-K official Korean product identity](https://www.panasonic.co.kr/consumer/xview/Camera/Camera/LumixS/CS10003) | `source-65ab66812e808a83` |
| panasonic-s1 | [DC-S1 official NA specification sheet](https://help.na.panasonic.com/answers/features-and-specifications-lumix-s-series-model-dc-s1/) | `source-24b1e9d9e6d3ca62` |
| panasonic-s1 | [DC-S1 official firmware/activation video conditions](https://av.jpn.support.panasonic.com/support/dsc/download/ff/dl/s1.html) | `source-009d06099528ba38` |
| panasonic-s5-iix | [DC-S5M2XGD official Korean product identity](https://www.panasonic.co.kr/consumer/xview/Camera/Camera/LumixS/DCS5M2XGD) | `source-2069a139d300bd4d` |
| panasonic-s5-iix | [DC-S5M2X official NA specification sheet](https://help.na.panasonic.com/answers/specifications-sheet-lumix-s-series-dc-s5m2x/) | `source-1a301038f2b31d4a` |
| panasonic-s1h | [DC-S1HGD-K official Korean product identity](https://www.panasonic.co.kr/consumer/xview/Camera/Camera/LumixS/CS10002) | `source-24c5e5e052d6b045` |
| panasonic-s1h | [DC-S1H official NA specification sheet](https://help.na.panasonic.com/answers/features-and-specifications-lumix-s-series-dc-s1h/) | `source-80db24e2232f8bd8` |
| panasonic-s1h | [DC-S1H complete guide video mode table](https://help.na.panasonic.com/wp-content/uploads/2023/02/DCS1H_DVQP2021ZA_ENG.pdf) | `source-9772326fbc878614` |

## Direct review decisions / source disagreements

- **S1II vs S1IIE:** independent IDs `panasonic-s1-ii` / `panasonic-s1-iie`, base codes DC-S1M2 / DC-S1M2ES; not regional aliases. S1II24.1MP partially-stacked CMOS/SH70 speed-priority, S1IIE24.2MP BSI CMOS/SH30. Separate same-model JP/NA and scoped KR evidence; physical dimensions134.3×102.3×91.8mm shared but weights800/718 vs795/712 differ. Mechanical H+ speed-priority10fps AFC, ordinary/image-priority differs; H+ tracking caveat retained. S1II NA ordinary-burst table omits SH70; JP SH table proves70 in a different mode, not a genuine same-mode contradiction.
- **Two unresolved source-size discrepancies:** both S1II and S1IIE NA say35.8×23.8mm; their own JP specs say35.6×23.8mm. No measurement/firmware explanation found. Physical-size observations are UNKNOWN/null, with both reported values, other official URL and unresolved disposition preserved in conditions. Neither number is promoted, and no canonical fieldEvidence is created for that path. Accepted known claims/canonical value conflicts0; unresolved manufacturer discrepancies2. Regression explicitly verifies that choosing disagreeing known numeric claims is rejected by `CONFLICTING_CLAIM_VALUES`.
- **Old S1/S1R BIS:** original NA spec sheets show5.5 body/6 combined; complete official firmware1.2 histories state body6.0/combined6.5. This is a documented firmware revision, not an unexplained value conflict. Only revised object is promoted; prior5.5 and minimum firmware1.2 are retained, CIPA yaw/pitch S-X50/f50mm body test and S-R70200/f200mm combined test stay distinct.
- **Other IBIS:** S9/S5/S5IIX body5 vs DualIS6.5; S1II/e body8 center/7 periphery vs DualIS7 center/periphery under CIPA2024 with different lenses/focal lengths; S1H body6 vs combined6.5 (combined firmware1.1). Electronic/ActiveIS/cropless EIS not used as sensor-shift BIS stops. All IBIS objects conform to existing contract.
- **Weights:** all selected operating claims battery-and-card; separate body-only claims. S1/R choose SD1016g, retain XQD1020g alternative in metadata;899g body only. Newer S1II/e/S5IIX explicitly include hot-shoe cover/exclude body cap. No kit lens or grip included. Current vocab used, no invented `operational` enum.

## Video / storage scope

Normal internal representative modes are preserved with actual fps when directly documented, resolution/aspect/crop/chroma/bit depth/codec/container/media/thermal or firmware/activation conditions. Full PDF table columns were visually checked; worker excerpt text flattening was not used as crop authority.

- **S9:** full-guide p127, NTSC MOV5952×3968,3:2,29.97p,42010-bit HEVC200Mbps,FULL. Firmware1.1 menu `Video Record Limit` ON gives6K/5.9K10min; OFF removes fixed duration but heat protection still applies. Exact29.97 comes from full-guide table, not firmware menu. Related menu URL retained in each selected-mode claim's conditions.
- **S5:** MOV p2524K3840×2160,16:9,59.94p,42010-bit HEVC200Mbps,30min starred limit. pp249–250 prohibit FULL at4K60/50; APS-C representative crop retained. Firmware/external5.9K RAW is not internal6K or6K-photo.
- **S1II / S1IIE:** selected internal6K5952×3968,3:2,29.97p,42010-bit HEVC200Mbps,FULL. Different6K2.4:1/59.94p mode exists and is not “all6K is30fps.” S1II5.1K60 open-gate/4K120 are separate modes, not attached to S1IIE. ARRI LogC3 optional DMW-SFU3A, XLR2-dependent32-bit float **audio**, and media/thermal restrictions are retained as separate considerations; no32-bit video promotion.
- **S1R:** firmware>=1.65K4992×3744,4:3,30p label,42010-bit LongGOP MOV200Mbps. Fractional actual fps/crop/codec subtype unproven by firmware summary are UNKNOWN; no invented29.97 or HEVC. HLG is not V-Log; video.log UNKNOWN. External HDMI4K60 42210-bit is not an internal maximum.
- **S1:** firmware>=2.0 + optional paid DMW-SFU2 activation, internal6K5952×3968,3:2,24p label,42010-bit LongGOP MOV200Mbps. Exact fractional24p/crop/codec subtype UNKNOWN. License also preserved on bitDepth and log claims; V-Log activation was added earlier. External HDMI12-bit RAW/recorders not internal video bitDepth.
- **S5IIX:** independent `panasonic-s5-iix`, not S5II color variant. Normal internal6K29.97,3:2,FULL,42010-bit HEVC200Mbps. NA thermal Standard6K/5.9K/ProRes duration30min retained. ProRes422/HQ5.8K and>=800Mbps require USB-SSD; HDMI12-bit RAW/external recorder and RTMP/RTMPS/network modes remain metadata/backlog. ProRes table's contradictory H264 label is not promoted as codec truth. S5II canonical/provenance byte-preserved.
- **S1H:** full-guide p258, NTSC internal6K5952×3968,3:2,23.98p,FULL,42010-bit HEVC200Mbps;5.9K29.97/16:9 andS35 C4K59.94 distinct. No unlimited-duration guarantee inferred from a mode table.

**Internal slots:** S5 dualSD (slot1 UHS-I/II,slot2 UHS-I), S5IIX/S1H dualSD UHS-I/II, S1II/e CFexpressB+SD, S1/R XQD/CFexpress +SD. NA physical-slot evidence retains generic CFexpress rather than inferring a subtype in that composite claim; official firmware1.3 TypeB support is separately reviewed. USB-SSD is never counted as an internal card slot. S9 physical count unconfirmed in reviewed evidence, stays UNKNOWN. No lens products created.

**Major UNKNOWN:** S1II/e physical size; S9 physical size/mechanical burst/EVF/slots; S1/R fractional actual fps and video.cropAtMax; S1R log; uncollected AF/battery/CIPA shooting counts/release dates/weather-sealing remain UNKNOWN instead of guesses. Codec subtype in firmware-only selected modes is metadata-null. Null is not proof of absence.

## Follow-up candidates and batch scale

No new pipeline/schema/validation bug or eight-item transaction blocker. Current video.max-only consumers still cannot express firmware/paid activation, mode-specific fps/crop, heat/duration/media restrictions; inherited29.97→97 recommendation parser issue unchanged. Conditions are sealed in raw/staging/transaction, not copied into new canonical schema. These are separate consumer/representation follow-ups, not fixes in this batch.

Panasonic production remaining **26** = LUMIX G11 + compact4 + directly operated camcorders11; LUMIX S remaining**0**, S10/10 base identities now have production provenance. These counts use full pilot denominator with this S checkpoint applied; no claim of a fresh whole-brand audit. Next LUMIX G **11 identities in one batch is recommended**, with11 independent worker tasks, pre-approval contract/source checks and one transaction. G100/G100D, GH5/GH5II and other generations remain distinct; do not transfer video/battery/IBIS assumptions between them.8-item S success removes the arbitrary5-item limit, but does not pre-certify unreviewed G data. Split only if actual new structural issues emerge; ordinary UNKNOWN is not a blocker. Compact/camcorders remain separate; AJ-CX4000 mount expansion excluded.

## Worker actual calls (public excerpts + minimal contract only)

| Product | Attempt | Status | Input | Output | Total |
|---|---:|---|---:|---:|---:|
| s9 | 1 | success | 2887 | 1562 | 4449 |
| s5 | 1 | success | 2763 | 1543 | 4306 |
| s1iie | 1 | success | 3877 | 1369 | 5246 |
| s1ii | 1 | failure | 3921 | 2048 | 5969 |
| s1ii | 2 | needs_information | 3941 | 349 | 4290 |
| s1r | 1 | success | 2557 | 725 | 3282 |
| s1 | 1 | success | 3202 | 838 | 4040 |
| s5iix | 1 | success | 2633 | 713 | 3346 |
| s1h | 1 | success | 2731 | 865 | 3596 |

Actual API calls9 across8 stable tasks. Totals input/output/total **28512/10012/38524**. S1II attempt1 failed INCOMPLETE_RESPONSE at2048 output tokens; its sole same-ID retry returned needs_information with useful sensor/BIS/weight warnings. No third attempt. Seven tasks returned success. Main Codex read complete official tables/PDF columns to resolve excerpt omissions. All returned patches empty; S9/S1IIE files[] entries said no-change on their temporary fixtures and were ignored. No worker code applied. Temporary public worker fixtures deleted.

Adopted: body BIS vs combined DualIS, weight/configuration, source scope, effective vs total pixels, exact mode/fps, thermal/licensing/storage cautions; S1II/e manufacturer physical-size discrepancy. Discarded: excerpt omissions as global UNKNOWN despite available complete tables; initial S1/S1R BIS5.5 as current after complete firmware1.2 proved6.0; transferring S1II news/spec to S1IIE. S1R HLG is not V-Log; video.log remains UNKNOWN. User extra interventions0; main agent reviewed167 observations,8 identities,24 raw sources, conditional modes and diff.

## Per-product worker adoption / rejection

| Product | Useful warnings adopted after direct review | Discarded / main-agent resolution |
|---|---|---|
| S9 | BIS/DualIS, weight, thermal OFF caveat, identity-only KR | Full PDF column proves FULL6K; limited excerpt absence does not prove absence; no kit-lens product |
| S5 | effective-vs-total MP, shutter/AF burst, per-mode10-bit/time cap | Complete pp249–252 proves crop/fps; worker repository/migration commentary outside extraction task |
| S1IIE |35.8vs35.6 discrepancy, sensor/weight/covers, BIS center/periphery | Complete own NA table proves selected video; no S1II news capability transfer |
| S1II | sensor discrepancy, BIS/DualIS, weights, separateSH | Failed first output discarded; retry needs_information reviewed; complete JP70/NA29.97 tables resolved limited excerpts locally |
| S1R | XQD/SD weight, firmware5K vs externalHDMI | Complete firmware1.2 supersedes old5.5 body stops; no V-Log or codec subtype invented |
| S1 | DMW-SFU2/firmware and internal-vs-RAW | Complete firmware1.2 revises BIS6; true selected 6K is licensed, not standard unconditional mode |
| S5IIX | USB-SSD/bitrate/media/thermal, distinct identity | Complete physical-slot/mode tables override excerpt omissions; ProRes mislabeled codec not promoted |
| S1H | body6/Dual6.5, AF burst/weight/media | Full PDF row proves23.98/FULL rather than shorthand24p; complete spec confirms dimensions/dualSD |

## Final validation / sealed artifacts

- Whole suite **203/203**, Objective/production/catalog/coverage **176/176**, Panasonic **16/16** including8 new regressions. Initial new snapshot test caught an unfinished collect→canonicalized checkpoint; fixed the new checkpoint only, then all suites passed. Tests cover eight-body replay, preserved S9 identity/price/other products/lenses, source/digest links, scoped identities, actual fractional mode strings, unknown/conflict gating, BIS firmware/DualIS, physical slots/SSD, and invalid weight/IBIS across8 actual items.
- Canonical full validation **true**, bodies121/lenses36/total157. `pnpm build` success; existing>500KB chunk warning only. `node --check`7 Objective modules/new regression file success; `git diff --check` success. Old raw/staging/approval/transaction/inventory fixtures unchanged.
- Actual second apply **already-canonicalized / canonicalMatches:true**, with canonical bytes unchanged.
- Helper clock bounds checked for all24 source artifacts: actual-generated UTC window **2026-10-07T00:16:38.413Z → 2026-10-07T00:16:38.422Z**. ISO structure/date round-trip verified, no arbitrary date-only midnight conversion. Original network fetch times are retained in S listing/availability checkpoint; helper times record contemporaneous raw evidence access/review.
- Baseline canonical SHA256 `ade28a73f4223b7191c2081ad8577d4581fd91c5791670859dc0c8a1379af2de`; after `0c60df361495138d8f1872dfa99f48ada5a378153db948093b9e88ae0c1cc44c`.
- Diff digest `4b28098f5f3eec4311d1e23b40f468a05261b67dd107e0b1288972ab71de0866`; approval `approval-d84315d50a5e95f789ffc4a3400045e190f1035dbaf1b1b660c98fc5c0cbbbfa` (`cli-explicit`).
- Resume authority: [manifest](../src/data/ingestion/batches/production-panasonic-bodies-002.json), [approval](../src/data/ingestion/approvals/production-panasonic-bodies-002.json), [transaction journal](../src/data/ingestion/transactions/production-panasonic-bodies-002/journal.json), [new regression](../tests/panasonicProduction002.test.js). Batch complete; no API tasks/gates need repeating. No push; close with local `Objective-Batch: production-panasonic-bodies-002` commit.
