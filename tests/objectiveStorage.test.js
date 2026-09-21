// Cheap-worker draft reviewed locally; resolve macOS tmpdir aliases before testing.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { atomicWrite } from "../scripts/objective/storage.mjs";

test("atomicWrite replaces the file completely", async () => {
  const dir = await realpath(await mkdtemp(path.join(tmpdir(), "storage-")));
  try {
    const file = path.join(dir, "target.json");
    await writeFile(file, "old-bytes");
    const next = Buffer.from("new-bytes-complete\n", "utf8");
    await atomicWrite(file, next);
    assert.deepEqual(await readFile(file), next);
    assert.deepEqual((await readdir(dir)).filter((n) => n.includes(".tmp-")), []);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test("atomicWrite hook failure keeps original bytes and cleans temps", async () => {
  const dir = await realpath(await mkdtemp(path.join(tmpdir(), "storage-")));
  try {
    const file = path.join(dir, "target.json");
    const original = Buffer.from("original-content", "utf8");
    await writeFile(file, original);
    const hook = async (stage) => { if (stage === "temp-written") throw new Error("injected hook failure"); };
    await assert.rejects(() => atomicWrite(file, Buffer.from("replacement"), { hook }), /injected hook failure/);
    assert.deepEqual(await readFile(file), original);
    assert.deepEqual((await readdir(dir)).filter((n) => n.includes(".tmp-")), []);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
