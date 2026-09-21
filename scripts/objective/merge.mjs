import { createCanonicalDiff, createNewProductSkeleton, digestValue, getAtPath, normalizeRawDocument, normalizeSearch, stableStringify, validateStagingBatch } from "./rules.mjs";
import { jsonBytes, sha256 } from "./storage.mjs";

const requireValue = (ok, message) => { if (!ok) throw Error(message); };
const equal = (a, b) => stableStringify(a) === stableStringify(b);
const names = (p) => [p.name, ...(p.model ? [p.model, `${p.brand} ${p.model}`] : []), ...(p.aliases ?? [])];
const fullDate = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && new Date(s).toISOString().slice(0, 10) === s;
const https = (s) => { try { return new URL(s).protocol === "https:"; } catch { return false; } };

const numberLeaves = /(?:weight|bodyOnlyWeight|minFocusM|filterMm|megapixels|batteryShots|bitDepth|axes|stops|min|max|wide|tele)$/;
const booleanLeaves = /(?:aiUnit|log|cropAtMax|stabilization|present|weatherSealing)$/;
const stringLeaves = /(?:format|generation|description|label|weightBasis|batteryConditions|minFocusConditions|conditions|releaseDate)$/;
const bodyKeys = new Set(["sensor", "weight", "weightBasis", "bodyOnlyWeight", "dimensions", "autofocus", "video", "batteryShots", "releaseDate", "batteryConditions", "ibis", "evf", "lcd", "burst", "shutter", "cardSlots", "weatherSealing", "fixedLens"]);
const lensKeys = new Set(["focal", "aperture", "weight", "stabilization", "filterMm", "minFocusM", "minFocusConditions"]);
const childKeys = {
  "specs.sensor": ["format", "megapixels", "generation", "sizeMm"],
  "specs.autofocus": ["aiUnit", "subjects", "description"],
  "specs.video": ["max", "bitDepth", "log", "cropAtMax"],
  "specs.ibis": ["present", "axes", "stops", "conditions"],
  "specs.fixedLens": ["focal", "equivalentFocal", "aperture", "label"],
  "specs.focal": ["min", "max"], "specs.aperture": ["wide", "tele"],
  "specs.fixedLens.focal": ["min", "max"], "specs.fixedLens.equivalentFocal": ["min", "max"],
  "specs.fixedLens.aperture": ["wide", "tele"],
};
export function validateSpecValue(value, field) {
  if (value === null) return;
  if (field === "specs.dimensions" || field === "specs.sensor.sizeMm") {
    requireValue(Array.isArray(value) && value.length === (field.endsWith("dimensions") ? 3 : 2) && value.every((v) => typeof v === "number" && Number.isFinite(v) && v > 0), `Invalid physical dimensions: ${field}`);
  } else if (field === "specs.autofocus.subjects") {
    requireValue(Array.isArray(value) && value.every((v) => typeof v === "string" && v.length > 0), `Invalid subjects: ${field}`);
  } else if (field === "specs.video.max" || stringLeaves.test(field)) {
    requireValue(typeof value === "string" && value.trim() && value.trim().toUpperCase() !== "UNKNOWN", `Invalid string: ${field}`);
    if (field.endsWith("releaseDate")) requireValue(fullDate(value), `Invalid date: ${field}`);
  } else if (numberLeaves.test(field)) {
    requireValue(typeof value === "number" && Number.isFinite(value) && value >= 0, `Invalid number: ${field}`);
    if (!/(?:axes|stops)$/.test(field)) requireValue(value > 0, `Physical value must be positive: ${field}`);
  } else if (booleanLeaves.test(field)) {
    requireValue(typeof value === "boolean", `Invalid boolean: ${field}`);
  } else {
    requireValue(childKeys[field] && value && typeof value === "object" && !Array.isArray(value), `Unsupported non-null specification: ${field}`);
    requireValue(Object.keys(value).every((k) => childKeys[field].includes(k)), `Unknown specification child: ${field}`);
    for (const [key, child] of Object.entries(value)) validateSpecValue(child, `${field}.${key}`);
  }
}

// Validates the entire candidate, including untouched legacy products. No fixed product count.
export function validateCanonical(canonical, vocab) {
  requireValue(canonical?.schemaVersion === 1 && Array.isArray(canonical.bodies) && Array.isArray(canonical.lenses), "Invalid canonical schema");
  const ids = new Set(), aliases = new Map();
  for (const [group, products] of [["body", canonical.bodies], ["lens", canonical.lenses]]) {
    for (const p of products) {
      requireValue(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.id) && !p.id.startsWith("unknown-") && !p.id.endsWith("-integrated-lens") && !ids.has(p.id), `Duplicate/invalid canonical ID: ${p.id}`);
      ids.add(p.id);
      requireValue(typeof p.name === "string" && p.name.trim() && vocab.brands.some((b) => b.name === p.brand) && Array.isArray(p.aliases), `Invalid identity: ${p.id}`);
      for (const n of names(p)) {
        const key = normalizeSearch(n);
        requireValue(typeof n === "string" && key && (!aliases.has(key) || aliases.get(key) === p.id), `Alias collision: ${n}`);
        aliases.set(key, p.id);
      }
      if (group === "body") requireValue(p.model && p.series && vocab.bodyKinds.includes(p.kind) && vocab.bodyStyles.includes(p.bodyStyle), `Invalid body type: ${p.id}`);
      else requireValue(vocab.lensTypes.includes(p.type), `Invalid lens type: ${p.id}`);
      requireValue(group === "body" && p.kind === "fixed" ? p.mount === null : vocab.mounts.some((m) => m.name === p.mount), `Invalid mount: ${p.id}`);
      requireValue(p.specs && typeof p.specs === "object" && !Array.isArray(p.specs), `Missing specs: ${p.id}`);
      for (const [key, value] of Object.entries(p.specs)) {
        requireValue((group === "body" ? bodyKeys : lensKeys).has(key), `Wrong product specification: ${group}/${key}`);
        requireValue(!["roles", "photoScore", "videoScore", "portabilityScore", "designTags"].includes(key), "Subjective policy in canonical specs");
        validateSpecValue(value, `specs.${key}`);
      }
      requireValue(!["photoScore", "videoScore", "portabilityScore", "designTags", "roles"].some((k) => k in p), "Subjective policy in canonical product");
      if (group === "body" && p.specs.weight != null) requireValue(vocab.weightBases.includes(p.specs.weightBasis), `Weight basis missing: ${p.id}`);
      for (const field of ["specs.focal", "specs.aperture", "specs.fixedLens.focal", "specs.fixedLens.equivalentFocal", "specs.fixedLens.aperture"]) {
        const range = getAtPath(p, field);
        if (range) { const [a, b] = field.endsWith("aperture") ? [range.wide, range.tele] : [range.min, range.max]; requireValue(a == null || b == null || a <= b, `Reversed range: ${field}`); }
      }
      for (const condition of ["new", "used"]) {
        const quote = p.price?.[condition];
        requireValue(quote?.currency === "KRW" && ["unknown", "legacy-unverified", "manufacturer", "retailer", "used-market"].includes(quote.sourceType), `Invalid price metadata: ${p.id}`);
        const amounts = (condition === "new" ? ["value"] : ["low", "typical", "high"]).map((k) => quote[k]);
        requireValue(amounts.every((v) => v === null || (Number.isSafeInteger(v) && v >= 0)), `Invalid price: ${p.id}`);
        const known = amounts.filter((v) => v !== null);
        requireValue(known.every((v, i) => i === 0 || known[i - 1] <= v), `Reversed price range: ${p.id}`);
        if (quote.sourceType === "unknown") requireValue(known.length === 0, `Unknown price has a value: ${p.id}`);
        if (!["unknown", "legacy-unverified"].includes(quote.sourceType)) requireValue(fullDate(quote.asOf) && https(quote.sourceUrl), `Price provenance missing: ${p.id}`);
      }
      requireValue(Array.isArray(p.sources) && Array.isArray(p.legacyFields), `Missing evidence arrays: ${p.id}`);
      for (const source of p.sources) {
        requireValue(source.type === "manufacturer" && https(source.url) && fullDate(source.accessedOn) && Array.isArray(source.fields) && source.fields.length, `Invalid source: ${p.id}`);
        for (const field of source.fields) requireValue(field === "identity" || getAtPath(p, field) !== undefined, `Dangling source field: ${field}`);
      }
      if (p.identityEvidence !== undefined) {
        const identityEvidence = p.identityEvidence;
        requireValue(identityEvidence?.verification === "verified" && typeof identityEvidence.evidenceId === "string" && identityEvidence.evidenceId.startsWith("identity-")
          && typeof identityEvidence.sourceId === "string" && fullDate(identityEvidence.checkedAt)
          && p.sources.some((source) => source.sourceId === identityEvidence.sourceId && source.fields.includes("identity")), `Invalid identity evidence: ${p.id}`);
      }
      for (const [field, evidence] of Object.entries(p.fieldEvidence ?? {})) {
        requireValue(getAtPath(p, field) !== undefined && evidence.verification === "verified" && Array.isArray(evidence.claimIds) && evidence.claimIds.length && new Set(evidence.claimIds).size === evidence.claimIds.length && fullDate(evidence.checkedAt), `Invalid field evidence: ${p.id}/${field}`);
      }
    }
  }
  return true;
}

export function buildDiff(stagings, canonical, batchId, baselineDigest) {
  return { schemaVersion: 1, batchId, canonicalBaselineDigest: baselineDigest, items: stagings.map((s) => createCanonicalDiff(s, canonical)) };
}

export function verifyIncoming(bundle, canonical) {
  const { manifest, stagings, raws, vocab, identityMap, diff } = bundle;
  requireValue(manifest.items.length > 0 && manifest.items.length === stagings.length, "Invalid incoming item count");
  const seenItems = new Set(), seenProducts = new Set();
  const regenerated = Object.values(raws).flatMap((raw) => normalizeRawDocument(raw, { batchId: manifest.batchId, vocab, identityMap }));
  for (const item of manifest.items) {
    requireValue(!seenItems.has(item.itemKey) && !seenProducts.has(item.productId), "Duplicate incoming ID/item");
    seenItems.add(item.itemKey); seenProducts.add(item.productId);
    const staged = stagings.find((s) => s.itemKey === item.itemKey);
    requireValue(staged?.batchId === manifest.batchId && staged.product.id === item.productId, "Staging identity mismatch");
    requireValue(item.stagingDigest === digestValue(staged), "Staging checkpoint digest mismatch; normalize and validate again");
    const generated = regenerated.filter((s) => s.itemKey === item.itemKey);
    requireValue(generated.length === 1 && equal(generated[0], staged), "Staging does not match normalized raw evidence");
    requireValue(equal(item.rawDigests, item.sourceIds.map((id) => digestValue(raws[id]))), "Raw checkpoint digest mismatch");
    requireValue(item.sourceIds.includes(staged.source.sourceId), "Unlisted source");
    const products = staged.productType === "body" ? canonical.bodies : canonical.lenses;
    const existing = products.find((p) => p.id === item.productId);
    if (existing) {
      for (const k of ["brand", "mount", "name", "model", "series", "kind", "bodyStyle", "type"]) {
        requireValue(equal(staged.product[k], existing[k]), `Identity changes require a separate reviewed schema flow: ${k}`);
      }
      requireValue(equal([...new Set(staged.product.aliases.map(normalizeSearch))].sort(), [...new Set(existing.aliases.map(normalizeSearch))].sort()), "Alias change is outside this promotion");
      requireValue(staged.claims.length > 0, "No incoming claims");
    } else {
      requireValue(staged.identityMapping?.productId === staged.product.id
        && staged.identityMapping?.productType === staged.productType
        && staged.identityMapping?.manufacturerModelCode === staged.manufacturerModelCode,
      "New product identity mapping mismatch");
      requireValue(staged.identityEvidence?.verification === "verified", "New product identity must be verified");
    }
    for (const claim of staged.claims) {
      requireValue(claim.path.startsWith("specs.") && vocab.claimPaths.includes(claim.path), "Stage 2 promotes physical specs only, not price summaries");
      validateSpecValue(claim.value, claim.path);
      if (claim.value !== null && claim.unit !== null) requireValue(typeof claim.rawUnit === "string" && claim.rawUnit.length > 0, `Explicit original unit required: ${claim.path}`);
      if (claim.path === "specs.weight" && staged.productType === "body" && claim.value !== null) requireValue(claim.conditions.weightBasis === staged.product.specs.weightBasis, "Weight condition and weightBasis disagree");
    }
  }
  const validation = validateStagingBatch(stagings, { canonical, vocab, rawDocuments: new Map(Object.entries(raws)) });
  requireValue(validation.valid, `Invalid incoming: ${JSON.stringify(validation.items)}`);
  requireValue(equal(diff, buildDiff(stagings, canonical, manifest.batchId, manifest.canonicalBaselineDigest)), "Diff is stale or modified; generate a fresh diff");
  requireValue(manifest.items.every((i) => i.diffDigest === digestValue(diff)), "Diff checkpoint mismatch");
}

function removeLegacyLeaf(product, leaf) {
  const expand = (prefix, value) => value && typeof value === "object" && !Array.isArray(value)
    ? Object.entries(value).flatMap(([k, v]) => expand(`${prefix}.${k}`, v)) : [prefix];
  product.legacyFields = product.legacyFields.flatMap((old) => leaf.startsWith(`${old}.`) ? expand(old, getAtPath(product.specs, old)) : [old]).filter((old) => old !== leaf);
}

export function proposedCanonical(canonical, bundle, decisions, productOperations = []) {
  const result = structuredClone(canonical);
  const allowed = new Map(decisions.map((d) => [`${d.productId}:${d.claimId}`, d]));
  const operations = new Map(productOperations.map((operation) => [operation.productId, operation]));
  const orderedStagings = [...bundle.stagings].sort((a, b) => {
    const left = `${a.productType}:${a.product.id}`, right = `${b.productType}:${b.product.id}`;
    return left < right ? -1 : left > right ? 1 : 0;
  });
  for (const staged of orderedStagings) {
    const products = staged.productType === "body" ? result.bodies : result.lenses;
    let p = products.find((v) => v.id === staged.product.id);
    if (!p) {
      const operation = operations.get(staged.product.id);
      requireValue(operation?.operation === "new-product" && operation.action === "accept", `New product ${staged.product.id} lacks explicit creation approval`);
      p = createNewProductSkeleton(staged);
      products.push(p);
    }
    for (const claim of staged.claims) {
      const decision = allowed.get(`${p.id}:${claim.claimId}`);
      if (decision?.action !== "accept") continue;
      requireValue(claim.value !== null && claim.verification === "verified", "Cannot promote UNKNOWN or unverified evidence");
      let cursor = p;
      const parts = claim.path.split(".");
      for (const key of parts.slice(0, -1)) cursor = cursor[key] ??= {};
      cursor[parts.at(-1)] = structuredClone(claim.value);
      const prior = p.fieldEvidence?.[claim.path];
      // Replaced values retain history in the transaction archive, not as evidence for the new value.
      const oldValue = getAtPath((staged.productType === "body" ? canonical.bodies : canonical.lenses).find((v) => v.id === p.id), claim.path);
      if (!equal(oldValue, claim.value)) {
        const leaves = (field, value) => value && typeof value === "object" && !Array.isArray(value)
          ? Object.entries(value).flatMap(([k, v]) => leaves(`${field}.${k}`, v)) : [field];
        p.sources = p.sources.map((source) => ({ ...source, fields: source.fields.flatMap((field) => claim.path.startsWith(`${field}.`) ? leaves(field, getAtPath(p, field)) : [field]).filter((field) => field !== claim.path) })).filter((source) => source.fields.length);
      }
      const claimIds = equal(oldValue, claim.value) ? prior?.claimIds ?? [] : [];
      p.fieldEvidence ??= {};
      p.fieldEvidence[claim.path] = { verification: "verified", claimIds: [...new Set([...claimIds, claim.claimId])].sort(), checkedAt: claim.reviewedAt };
      const s = staged.source;
      let source = p.sources.find((v) => v.sourceId === s.sourceId);
      if (!source) {
        source = { url: s.url, type: "manufacturer", accessedOn: s.accessedAt.slice(0, 10), fields: [], note: "Field evidence retained in ingestion transaction archive", sourceId: s.sourceId, documentVersion: s.documentVersion };
        p.sources.push(source);
      }
      source.fields = [...new Set([...source.fields, claim.path])].sort();
      removeLegacyLeaf(p, claim.path.slice("specs.".length));
    }
  }
  validateCanonical(result, bundle.vocab);
  return { canonical: result, bytes: jsonBytes(result), digest: sha256(jsonBytes(result)) };
}
