import { open, mkdir, readFile, rename, unlink, lstat, readdir, rmdir, realpath } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { hostname } from "node:os";
import path from "node:path";

export const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
export const jsonBytes = (value) => `${JSON.stringify(value, null, 2)}\n`;
export const readJson = async (file) => { await assertNoSymlink(file); return JSON.parse(await readFile(file, "utf8")); };
export async function exists(file) {
  try { await lstat(file); return true; } catch (e) { if (e.code === "ENOENT") return false; throw e; }
}
export function safeId(id) {
  if (typeof id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) throw Error(`Unsafe identifier: ${id}`);
  return id;
}
export async function pathsFor(root, batchId) {
  root = await realpath(root);
  const data = path.join(root, "src/data");
  const ingestion = path.join(data, "ingestion");
  for (const folder of [path.join(root, "src"), data, ingestion]) {
    if ((await lstat(folder)).isSymbolicLink()) throw Error(`Symlink directory is not supported: ${folder}`);
  }
  const canonical = path.join(data, "cameraProducts.json");
  const stat = await lstat(canonical);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink !== 1) throw Error("Canonical must be a regular, unlinked file");
  safeId(batchId);
  return { root, ingestion, canonical,
    manifest: path.join(ingestion, "batches", `${batchId}.json`),
    diff: path.join(ingestion, "diffs", `${batchId}.json`),
    approval: path.join(ingestion, "approvals", `${batchId}.json`),
    transaction: path.join(ingestion, "transactions", batchId),
  };
}

async function assertNoSymlink(file) {
  let cursor = path.resolve(file);
  while (cursor !== path.dirname(cursor)) {
    if (await exists(cursor) && (await lstat(cursor)).isSymbolicLink()) throw Error(`Symlink path is not supported: ${cursor}`);
    cursor = path.dirname(cursor);
  }
}
export async function syncDirectory(folder) {
  const handle = await open(folder, "r");
  try { await handle.sync(); } finally { await handle.close(); }
}

// The hook is dependency injection for tests, never an environment/CLI failure switch.
export async function atomicWrite(file, bytes, { beforeRename, hook = async () => {} } = {}) {
  await assertNoSymlink(file);
  const firstCreated = await mkdir(path.dirname(file), { recursive: true });
  const temp = `${file}.tmp-${randomUUID()}`;
  let handle;
  try {
    const mode = await exists(file) ? (await lstat(file)).mode & 0o777 : 0o600;
    handle = await open(temp, "wx", mode);
    await hook("temp-open", temp);
    await handle.writeFile(bytes);
    await hook("temp-written", temp);
    await handle.sync();
    await handle.close(); handle = null;
    if (sha256(await readFile(temp)) !== sha256(bytes)) throw Error("Temporary file digest mismatch");
    await hook("before-rename", temp);
    if (beforeRename) await beforeRename();
    await rename(temp, file);
    await syncDirectory(path.dirname(file));
    if (firstCreated) {
      let folder = path.dirname(file);
      while (folder !== path.dirname(firstCreated)) {
        folder = path.dirname(folder);
        await syncDirectory(folder);
      }
    }
    await hook("after-rename", file);
  } finally {
    if (handle) await handle.close();
    await unlink(temp).catch((e) => { if (e.code !== "ENOENT") throw e; });
  }
}
export async function writeJsonAtomic(file, value) {
  const bytes = jsonBytes(value);
  if (await exists(file) && (await readFile(file, "utf8")) === bytes) return false;
  await atomicWrite(file, bytes); return true;
}

function alive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return true;
  try { process.kill(pid, 0); return true; } catch (e) { return e.code !== "ESRCH"; }
}
// Each owner creates a complete unique file first, then hard-links it to the mutex.
// A separate recovery guard prevents two recover commands unlinking a successor's lock.
export async function withWriterLock(ingestion, operation, { recoverStale = false } = {}) {
  const lock = path.join(ingestion, ".writer-lock");
  const guard = path.join(ingestion, ".recovery-lock");
  const { link } = await import("node:fs/promises");
  await assertNoSymlink(lock);
  let recovering = false;
  if (recoverStale) {
    try { await mkdir(guard); recovering = true; }
    catch (e) { if (e.code === "EEXIST") throw Error("Recovery is already in progress; do not run concurrent recovery commands"); throw e; }
    try {
      if (await exists(lock)) {
        const owner = await readJson(lock);
        if (owner.hostname !== hostname() || alive(owner.pid)) throw Error("Writer lock belongs to a live or unknown process");
        await unlink(lock);
      }
    } catch (e) { await rmdir(guard); throw e; }
  } else if (await exists(guard)) throw Error("Recovery lock is held");
  const owner = path.join(ingestion, `.owner-${randomUUID()}`);
  let acquired = false;
  try {
    await atomicWrite(owner, jsonBytes({ pid: process.pid, hostname: hostname(), startedAt: new Date().toISOString() }));
    try { await link(owner, lock); acquired = true; }
    catch (e) { if (e.code === "EEXIST") throw Error("Writer lock is held; after a dead process use recover --unlock-stale"); throw e; }
    await syncDirectory(ingestion);
    // Once the writer lock is held, recovery itself uses the same crash/retry path.
    if (recovering) { await rmdir(guard); recovering = false; }
    return await operation();
  } finally {
    if (acquired) await unlink(lock);
    await unlink(owner).catch((e) => { if (e.code !== "ENOENT") throw e; });
    if (recovering) await rmdir(guard);
  }
}

export async function cleanCanonicalTemps(canonical) {
  const folder = path.dirname(canonical);
  for (const name of await readdir(folder)) {
    if (name.startsWith(`${path.basename(canonical)}.tmp-`)) await unlink(path.join(folder, name));
  }
}
