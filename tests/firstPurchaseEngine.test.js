import test from "node:test";
import assert from "node:assert/strict";
import { CAMERA_BODIES, createUnknownBody, createUnknownLens, LENS_BY_NAME } from "../src/cameraData.js";
import { scoreDesignPreference } from "../src/cameraDesign.js";
import { FIRST_PURCHASE_SYSTEMS, rankFirstPurchaseSystems } from "../src/firstPurchaseEngine.js";

const base = { type: "아직 잘 모르겠어요", ownedLenses: [], subject: ["여행 · 일상", "인물"], video: "사진 위주", portability: "매일 가볍게 들고 다니고 싶어요", lensCount: "한 개로 끝내고 싶어요", budget: 1000, condition: "신품·중고 모두 고려" };
const sony = (results) => results.find((system) => system.mount === "Sony E");

test("design any is exactly neutral, including unclassified bodies", () => {
  const omitted = rankFirstPurchaseSystems(base);
  const explicitAny = rankFirstPurchaseSystems({ ...base, designPreference: "any" });
  const noTags = rankFirstPurchaseSystems({ ...base, designPreference: "any" }, { systems: FIRST_PURCHASE_SYSTEMS.map((system) => ({ ...system, designTags: null })) });
  const rankedScores = (results) => results.map(({ name, score }) => ({ name, score }));
  assert.deepEqual(rankedScores(explicitAny), rankedScores(omitted));
  assert.deepEqual(rankedScores(noTags), rankedScores(omitted));
  assert.equal(scoreDesignPreference(createUnknownBody("미등록"), "any"), 0);
  assert.equal(scoreDesignPreference(createUnknownBody("미등록"), "rangefinder"), null);
});

test("design breaks comparable ties without excluding better mismatching systems", () => {
  const preset = FIRST_PURCHASE_SYSTEMS[0];
  const slr = { ...preset, name: "동등 SLR", designTags: ["slr"] };
  const rf = { ...preset, name: "동등 RF", designTags: ["rangefinder"] };
  const answers = { ...base, designPreference: "rangefinder" };
  const tied = rankFirstPurchaseSystems(answers, { systems: [slr, rf] });
  assert.equal(tied[0].name, "동등 RF");
  assert.equal(tied.length, 2);
  const inferiorRf = { ...rf, name: "목적이 다른 RF", uses: [] };
  const differentPurpose = rankFirstPurchaseSystems(answers, { systems: [inferiorRf, slr] });
  assert.equal(differentPurpose[0].name, "동등 SLR");
  assert.equal(differentPurpose.length, 2);
});

test("multiple design preferences match once without stacking the design bonus", () => {
  const body = { designTags: ["rangefinder", "minimal"] };
  assert.equal(scoreDesignPreference(body, ["slr", "rangefinder"]), 100);
  assert.equal(scoreDesignPreference(body, ["slr", "classic"]), 0);
  assert.equal(scoreDesignPreference(body, ["any", "rangefinder"]), 0);
  assert.equal(scoreDesignPreference(body, null), 0);

  const single = rankFirstPurchaseSystems({ ...base, designPreference: "rangefinder" });
  const multiple = rankFirstPurchaseSystems({ ...base, designPreference: ["rangefinder", "minimal"] });
  const singleSony = sony(single);
  const multipleSony = sony(multiple);
  assert.equal(singleSony.designBonus, 1);
  assert.equal(multipleSony.designBonus, 1);
  assert.equal(singleSony.score, multipleSony.score);
  assert.match(multipleSony.why, /레인지파인더형 또는 컴팩트 \/ 미니멀/);
});

test("heavy owned lens replaces preset role, weight and explanation", () => {
  const defaultSony = sony(rankFirstPurchaseSystems(base));
  const heavy = sony(rankFirstPurchaseSystems({ ...base, ownedLenses: ["Sony FE 70-200mm F2.8 GM II"] }));
  assert.equal(heavy.systemWeight, 1559);
  assert.equal(heavy.lensPrice, 0);
  assert.equal(heavy.total, heavy.bodyPrice);
  assert.equal(heavy.style, "보유 렌즈 활용");
  assert.ok(heavy.portable < defaultSony.portable);
  assert.ok(heavy.purposeFit < defaultSony.purposeFit);
  assert.match(heavy.portabilityLabel, /1559g/);
  assert.match(heavy.why, /1559g/);
  assert.doesNotMatch(heavy.why, /작고 가벼운|부담이 적어요/);
  assert.equal(heavy.lensPhotoScore, 5);
  assert.match(heavy.why, /5\/4/);
});

test("actual owned lens photo and video values affect media scoring", () => {
  const actual = LENS_BY_NAME["Sony FE 70-200mm F2.8 GM II"];
  const original = sony(rankFirstPurchaseSystems(base, { ownedLenses: [actual] }));
  const lowerPhoto = sony(rankFirstPurchaseSystems(base, { ownedLenses: [{ ...actual, photoScore: 1 }] }));
  const lowerVideo = sony(rankFirstPurchaseSystems(base, { ownedLenses: [{ ...actual, videoScore: 1 }] }));
  assert.ok(original.mediaScore > lowerPhoto.mediaScore);
  assert.ok(original.mediaScore > lowerVideo.mediaScore);
  assert.match(lowerPhoto.why, /1\/4/);
  assert.match(lowerVideo.why, /5\/1/);
});

test("photo/video ratio and lens expansion preference are active inputs", () => {
  const options = { systems: [FIRST_PURCHASE_SYSTEMS[0]] };
  const photo = rankFirstPurchaseSystems({ ...base, video: "사진 위주" }, options)[0];
  const mixed = rankFirstPurchaseSystems({ ...base, video: "사진과 영상 반반" }, options)[0];
  const video = rankFirstPurchaseSystems({ ...base, video: "영상 비중이 높아요" }, options)[0];
  assert.notEqual(photo.mediaScore, mixed.mediaScore);
  assert.notEqual(mixed.mediaScore, video.mediaScore);
  const one = rankFirstPurchaseSystems({ ...base, lensCount: "한 개로 끝내고 싶어요" }, options)[0];
  const two = rankFirstPurchaseSystems({ ...base, lensCount: "두 개 정도는 괜찮아요" }, options)[0];
  const several = rankFirstPurchaseSystems({ ...base, lensCount: "여러 개 교환해도 괜찮아요" }, options)[0];
  assert.ok(two.score > one.score);
  assert.ok(several.score > two.score);
  assert.equal(one.lens, several.lens);
});

test("unknown owned lens data is not used as zero weight or known media capability", () => {
  const unknown = createUnknownLens("직접 입력 렌즈", "Sony E");
  const result = sony(rankFirstPurchaseSystems(base, { ownedLenses: [unknown] }));
  assert.equal(result.systemWeight, null);
  assert.equal(result.portable, null);
  assert.equal(result.video, null);
  assert.equal(result.lensPhotoScore, null);
  assert.equal(result.purposeFit, null);
  assert.match(result.portabilityLabel, /데이터 부족/);
  assert.match(result.why, /판단을 보류/);
  assert.doesNotMatch(result.why, /합계 0g/);
  assert.equal(unknown.weight, null);
  assert.equal(unknown.usedPrice, null);
});

test("design bonus cannot bypass budget and unsupported capabilities remain unknown", () => {
  const results = rankFirstPurchaseSystems({ ...base, budget: 150, designPreference: "rangefinder" });
  assert.ok(results.every((system) => system.total <= 150));
  for (const body of [...CAMERA_BODIES, ...FIRST_PURCHASE_SYSTEMS, createUnknownBody("unknown")]) {
    assert.deepEqual(body.capabilities, { lowLight: null, versatility: null, lensEcosystem: null });
  }
});
