import { cp, mkdir, mkdtemp, readFile, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { approveBatch } from "../../scripts/objective/promotion.mjs";
import { createSourceId, digestValue } from "../../scripts/objective/rules.mjs";
import { pathsFor, readJson, sha256, writeJsonAtomic } from "../../scripts/objective/storage.mjs";
import { project } from "./objectiveFixture.mjs";

export const newBatchId = "stage3-new-products-fixture";

const reviewed = {
  verification: "verified",
  reviewedAt: "2026-09-20",
  reviewer: "Stage 3 fixture reviewer",
};

function observation(pathName, evidenceRef, rawValue, rawUnit, conditions = {}) {
  return { path: pathName, evidenceRef, rawValue, rawUnit, locator: { section: "Synthetic specifications", row: pathName }, conditions, ...reviewed };
}

function sourceDocument() {
  const bodyIdentity = {
    name: "Sony Stage 3 Test Body", brand: "Sony", model: "STB-1", aliases: ["sony stb1"],
    mount: "Sony E", series: "Stage Test", kind: "interchangeable", bodyStyle: "slr",
  };
  const lensIdentity = {
    name: "Sony Stage 3 Test Lens 35mm F2", brand: "Sony", model: "STL 35 F2", aliases: ["sony stl35f2"],
    mount: "Sony E", type: "prime",
  };
  const raw = {
    schemaVersion: 1,
    sourceType: "manufacturer",
    url: "https://www.sony.com/stage-3-fixture/specifications",
    publisher: "Sony",
    documentTitle: "Stage 3 synthetic fixture — not production product data",
    documentVersion: "fixture-1",
    region: "KR",
    accessedAt: "2026-09-20T00:00:00Z",
    evidenceScope: "Synthetic identity and specifications for isolated tests only",
    evidenceExcerpt: [
      { field: "body identity", value: { manufacturerModelCode: "STB-1", productType: "body", identity: bodyIdentity }, unit: null },
      { field: "lens identity", value: { manufacturerModelCode: "STL-35-F2", productType: "lens", identity: lensIdentity }, unit: null },
      { field: "body operational weight", value: 500, unit: "g" },
      { field: "body weight basis", value: "battery-and-card", unit: null },
      { field: "body optional megapixels", value: "UNKNOWN", unit: "MP" },
      { field: "lens weight", value: 300, unit: "g" },
      { field: "lens focal minimum", value: 35, unit: "mm" },
      { field: "lens focal maximum", value: 35, unit: "mm" },
      { field: "lens optional stabilization", value: "UNKNOWN", unit: null },
    ],
    items: [
      {
        itemKey: "sony-stage3-test-body", manufacturerModelCode: "STB-1", productType: "body", identity: bodyIdentity,
        identityEvidence: { evidenceRef: 0, locator: { section: "Synthetic product heading", row: "STB-1" }, ...reviewed },
        observations: [
          observation("specs.weight", 2, 500, "g", { weightBasis: "battery-and-card" }),
          observation("specs.weightBasis", 3, "battery-and-card", null, { weightBasis: "battery-and-card" }),
          observation("specs.sensor.megapixels", 4, "UNKNOWN", "MP"),
        ],
      },
      {
        itemKey: "sony-stage3-test-lens", manufacturerModelCode: "STL-35-F2", productType: "lens", identity: lensIdentity,
        identityEvidence: { evidenceRef: 1, locator: { section: "Synthetic product heading", row: "STL-35-F2" }, ...reviewed },
        observations: [
          observation("specs.weight", 5, 300, "g"),
          observation("specs.focal.min", 6, 35, "mm"),
          observation("specs.focal.max", 7, 35, "mm"),
          observation("specs.stabilization", 8, "UNKNOWN", null),
        ],
      },
    ],
  };
  return raw;
}

function refreshIdentityEvidence(raw) {
  for (const item of raw.items) {
    const evidence = raw.evidenceExcerpt[item.identityEvidence.evidenceRef];
    evidence.value = { manufacturerModelCode: item.manufacturerModelCode, productType: item.productType, identity: item.identity };
  }
  raw.contentDigest = digestValue(raw.evidenceExcerpt);
  raw.sourceId = createSourceId(raw);
}

export async function newProductFixture(t, options = {}) {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), "objective-stage3-")));
  t.after(() => rm(root, { recursive: true, force: true }));
  const data = path.join(root, "src/data");
  const ingestion = path.join(data, "ingestion");
  await mkdir(ingestion, { recursive: true });
  await cp(path.join(project, "src/data/cameraProducts.json"), path.join(data, "cameraProducts.json"));
  await cp(path.join(project, "src/data/ingestion/vocab.json"), path.join(ingestion, "vocab.json"));

  const raw = sourceDocument();
  options.mutateRaw?.(raw);
  refreshIdentityEvidence(raw);
  const identityMap = {
    schemaVersion: 1,
    entries: raw.items.map((item) => ({
      manufacturer: item.identity.brand, manufacturerModelCode: item.manufacturerModelCode,
      productId: item.productType === "body" ? "sony-stage3-test-body" : "sony-stage3-test-lens-35-f2",
      productType: item.productType, reviewedAliases: [...(item.identity.aliases ?? [])],
    })),
  };
  options.mutateIdentityMap?.(identityMap, raw);
  const canonicalBytes = await readFile(path.join(data, "cameraProducts.json"));
  const manifest = {
    schemaVersion: 1, batchId: newBatchId, scope: "Stage 3 isolated new-product fixture", tier: 1,
    baselineCommit: "fixture", canonicalBaselineDigest: sha256(canonicalBytes), lastSuccessfulGate: "collect",
    items: raw.items.map((item) => {
      const mapping = identityMap.entries.find((entry) => entry.manufacturer === item.identity.brand && entry.manufacturerModelCode === item.manufacturerModelCode);
      return { itemKey: item.itemKey, productId: mapping?.productId ?? "missing-mapping", state: "collected", attempt: 1,
        sourceIds: [raw.sourceId], rawDigests: [digestValue(raw)], stagingDigest: null, diffDigest: null, issues: [] };
    }),
  };
  const p = await pathsFor(root, newBatchId);
  await writeJsonAtomic(path.join(ingestion, "identity-map.json"), identityMap);
  await writeJsonAtomic(path.join(ingestion, "raw", `${raw.sourceId}.json`), raw);
  await writeJsonAtomic(p.manifest, manifest);
  const before = await readFile(p.canonical, "utf8");
  return { root, p, before, raw, identityMap };
}

export function runNew(root, command, ...args) {
  return spawnSync(process.execPath, [path.join(project, "scripts/objective/ingest.mjs"), command, "--root", root, "--batch", newBatchId, ...args], { encoding: "utf8" });
}

export function pipeline(f, { through = "diff" } = {}) {
  const commands = ["normalize", "validate", "diff"];
  const results = [];
  for (const command of commands) {
    const result = runNew(f.root, command);
    results.push(result);
    if (command === through || result.status !== 0) break;
  }
  return results;
}

export async function approveNew(f, extra = {}) {
  return approveBatch(f.root, newBatchId, {
    confirm: true, reviewer: "Stage 3 fixture approver", reason: "Approve isolated new-product fixture only",
    method: "test-fixture", diffDigest: digestValue(await readJson(f.p.diff)), allowNewProducts: true, ...extra,
  });
}
