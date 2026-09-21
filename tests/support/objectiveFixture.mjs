import { cp, mkdir, mkdtemp, readFile, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { approveBatch } from "../../scripts/objective/promotion.mjs";
import { digestValue, normalizeRawDocument } from "../../scripts/objective/rules.mjs";
import { buildDiff } from "../../scripts/objective/merge.mjs";
import { pathsFor, readJson, sha256, writeJsonAtomic } from "../../scripts/objective/storage.mjs";

export const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const batchId = "pilot-sony-a7-iv-001";
export const cli = path.join(project, "scripts/objective/ingest.mjs");
export async function fixture(t) {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), "objective-stage2-")));
  t.after(() => rm(root, { recursive: true, force: true }));
  const data = path.join(root, "src/data");
  await mkdir(path.join(data, "ingestion"), { recursive: true });
  await cp(path.join(project, "src/data/cameraProducts.json"), path.join(data, "cameraProducts.json"));
  for (const name of ["vocab.json", "identity-map.json", "raw", "staging", "diffs", "batches"]) {
    await cp(path.join(project, "src/data/ingestion", name), path.join(data, "ingestion", name), { recursive: true });
  }
  const p = await pathsFor(root, batchId);
  const before = await readFile(p.canonical, "utf8");
  const manifest = await readJson(p.manifest);
  const vocab = await readJson(path.join(p.ingestion, "vocab.json"));
  const identityMap = await readJson(path.join(p.ingestion, "identity-map.json"));
  const raw = await readJson(path.join(p.ingestion, "raw/source-0379a083289afde8.json"));
  const stagings = normalizeRawDocument(raw, { batchId, vocab, identityMap });
  const diff = buildDiff(stagings, JSON.parse(before), batchId, sha256(before));
  manifest.canonicalBaselineDigest = sha256(before); manifest.lastSuccessfulGate = "diff";
  delete manifest.apply; delete manifest.expectedCanonicalDigest;
  manifest.items = stagings.map((s) => ({ itemKey: s.itemKey, productId: s.product.id, state: "validated", attempt: 1,
    sourceIds: [raw.sourceId], rawDigests: [digestValue(raw)], stagingDigest: digestValue(s), diffDigest: digestValue(diff), issues: [] }));
  for (const s of stagings) await writeJsonAtomic(path.join(p.ingestion, "staging", batchId, `${s.itemKey}.json`), s);
  await writeJsonAtomic(p.diff, diff); await writeJsonAtomic(p.manifest, manifest);
  return { root, p, before };
}
export function run(root, command, ...args) {
  return spawnSync(process.execPath, [cli, command, "--root", root, "--batch", batchId, ...args], { encoding: "utf8" });
}
export async function approve(f, extra = {}) {
  return approveBatch(f.root, batchId, {
    confirm: true, reviewer: "Automated fixture test (not a production human approval)", reason: "Exercise Stage 2 using an isolated fixture",
    method: "test-fixture", diffDigest: digestValue(await readJson(f.p.diff)), ...extra,
  });
}
export async function rewrite(file, change) {
  const value = await readJson(file); change(value); await writeJsonAtomic(file, value); return value;
}
