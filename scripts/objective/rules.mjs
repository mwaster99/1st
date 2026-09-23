import { createHash } from "node:crypto";

export const BATCH_STATES = Object.freeze([
  "pending",
  "collected",
  "normalized",
  "validated",
  "rejected",
  "canonicalized",
]);

const RESERVED_ID_PREFIXES = ["unknown-body-", "unknown-lens-"];
const PRODUCT_TYPES = new Set(["body", "lens"]);
const CLAIM_VERIFICATIONS = new Set(["pending", "verified", "rejected", "conflict"]);

export function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map((v) => stableStringify(v) ?? "null").join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).filter((key) => value[key] !== undefined).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function digestValue(value) {
  return createHash("sha256").update(stableStringify(value)).digest("hex");
}

export function createSourceId(source) {
  const identity = {
    url: source.url,
    region: source.region ?? null,
    documentVersion: source.documentVersion ?? null,
    evidenceScope: source.evidenceScope,
    contentDigest: source.contentDigest,
  };
  return `source-${digestValue(identity).slice(0, 16)}`;
}

export function createClaimId(claim) {
  return `claim-${digestValue({
    productId: claim.productId,
    path: claim.path,
    value: claim.value,
    unit: claim.unit,
    sourceId: claim.sourceId,
    locator: claim.locator,
    conditions: claim.conditions,
  }).slice(0, 20)}`;
}

export function normalizeSearch(value) {
  return String(value ?? "")
    .toLowerCase()
    .replaceAll("α", "a")
    .replaceAll("mark", "m")
    .replace(/[^a-z0-9가-힣]/g, "");
}

const ROMAN_GENERATIONS = Object.freeze({ i: "1", ii: "2", iii: "3", iv: "4", v: "5", vi: "6", vii: "7", viii: "8", ix: "9", x: "10" });

// Strict identity folding, not fuzzy search: only common generation spelling differs.
export function normalizeModelIdentity(value, brand = "") {
  let text = String(value ?? "").toLowerCase().replaceAll("α", "a");
  text = text.replace(/\b(?:mark|mk)\s*(i{1,3}|iv|v|vi{0,3}|ix|x|\d+)\b/g, (_, generation) => ROMAN_GENERATIONS[generation] ?? generation);
  text = text.replace(/\b(i{1,3}|iv|v|vi{0,3}|ix|x)\b/g, (generation) => ROMAN_GENERATIONS[generation] ?? generation);
  const normalized = normalizeSearch(text);
  const normalizedBrand = normalizeSearch(brand);
  return normalizedBrand && normalized.startsWith(normalizedBrand) ? normalized.slice(normalizedBrand.length) : normalized;
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : value;
}

function uniqueAliases(values) {
  const seen = new Set();
  return values.map(normalizeText).filter((value) => {
    const key = normalizeSearch(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function canonicalUnit(path) {
  if (["specs.weight", "specs.bodyOnlyWeight"].includes(path)) return "g";
  if (["specs.dimensions", "specs.sensor.sizeMm"].includes(path) || path.startsWith("specs.focal.") || path === "specs.filterMm" || path.startsWith("specs.fixedLens.focal.")) return "mm";
  if (path === "specs.minFocusM") return "m";
  if (path === "specs.sensor.megapixels") return "MP";
  if (path.endsWith("resolutionDots")) return "dots";
  if (path.endsWith("sizeInches")) return "in";
  if (path.endsWith("maxRefreshHz")) return "Hz";
  if (path.startsWith("specs.burst.")) return "fps";
  if (path.startsWith("specs.shutter.") && path.endsWith("Sec")) return "s";
  if (path.startsWith("specs.operatingTemperatureC.")) return "°C";
  if (path.startsWith("price.")) return "KRW";
  return null;
}

function roundConverted(value) {
  return Number(Number(value).toFixed(6));
}

function convertNumber(value, from, to) {
  const conversions = {
    "kg:g": 1000,
    "oz:g": 28.349523125,
    "lb:g": 453.59237,
    "cm:mm": 10,
    "in:mm": 25.4,
    "cm:m": 0.01,
    "mm:m": 0.001,
    "pixel:MP": 0.000001,
  };
  if (from === to || from == null) return roundConverted(value);
  const factor = conversions[`${from}:${to}`];
  if (!factor) throw new Error(`Unsupported unit conversion: ${from} -> ${to}`);
  return roundConverted(value * factor);
}

export function normalizeClaimValue(path, rawValue, rawUnit) {
  const unit = canonicalUnit(path);
  if (rawValue === null || (typeof rawValue === "string" && rawValue.trim().toUpperCase() === "UNKNOWN")) {
    return { value: null, unit, unknown: true };
  }
  if (Array.isArray(rawValue)) {
    if (path === "specs.autofocus.subjects") {
      if (rawUnit !== null && rawUnit !== undefined) throw new Error(`Text array must not have a unit for ${path}`);
      if (!rawValue.every((value) => typeof value === "string" && value.trim())) throw new Error(`Invalid text array for ${path}`);
      return { value: uniqueAliases(rawValue), unit: null, unknown: false };
    }
    if (!["specs.dimensions", "specs.sensor.sizeMm"].includes(path)) throw new Error(`Array value is not supported for ${path}`);
    if (!rawValue.every((value) => typeof value === "number" && Number.isFinite(value))) throw new Error(`Invalid numeric array for ${path}`);
    const expectedLength = path === "specs.dimensions" ? 3 : 2;
    if (rawValue.length !== expectedLength) throw new Error(`${path} must contain ${expectedLength} numbers`);
    return { value: rawValue.map((value) => convertNumber(value, rawUnit, unit)), unit, unknown: false };
  }
  if (unit && unit !== "KRW") {
    if ((typeof rawValue !== "number" && typeof rawValue !== "string") || rawValue === "" || !Number.isFinite(Number(rawValue))) {
      throw new Error(`Invalid numeric value for ${path}`);
    }
    return { value: convertNumber(Number(rawValue), rawUnit, unit), unit, unknown: false };
  }
  if (unit === "KRW") {
    if (typeof rawValue !== "number" || !Number.isFinite(rawValue) || rawUnit !== "KRW") throw new Error(`Price must be a finite KRW number for ${path}`);
    return { value: rawValue, unit, unknown: false };
  }
  return { value: normalizeText(rawValue), unit: null, unknown: false };
}

function findIdentity(rawItem, identityMap) {
  const code = normalizeText(rawItem.manufacturerModelCode)?.toUpperCase();
  const brand = normalizeText(rawItem.identity?.brand);
  const matches = identityMap.entries.filter((entry) =>
    normalizeText(entry.manufacturer) === brand && normalizeText(entry.manufacturerModelCode)?.toUpperCase() === code);
  if (matches.length > 1) throw new Error(`Duplicate identity mapping for ${brand}/${code}`);
  return matches[0];
}

function setAtPath(target, path, value) {
  const parts = path.split(".");
  let cursor = target;
  for (const part of parts.slice(0, -1)) cursor = cursor[part] ??= {};
  cursor[parts.at(-1)] = value;
}

export function getAtPath(target, path) {
  return path.split(".").reduce((value, key) => value?.[key], target);
}

function normalizedVocabularyValue(value, entries, label) {
  if (value === null) return null;
  const key = normalizeSearch(value);
  for (const entry of entries) {
    if ([entry.name, ...(entry.aliases ?? [])].some((candidate) => normalizeSearch(candidate) === key)) return entry.name;
  }
  throw new Error(`Unknown ${label}: ${value}`);
}

export function normalizeRawDocument(raw, { batchId, vocab, identityMap }) {
  if (!raw || typeof raw !== "object" || !Array.isArray(raw.items)) throw new Error("Raw document must contain items[]");
  if (digestValue(raw.evidenceExcerpt) !== raw.contentDigest) throw new Error("Raw contentDigest does not match evidenceExcerpt");
  if (createSourceId(raw) !== raw.sourceId) throw new Error("Raw sourceId does not match its provenance fields");

  const source = {
    sourceId: raw.sourceId,
    sourceType: raw.sourceType,
    url: raw.url,
    publisher: raw.publisher,
    documentTitle: raw.documentTitle,
    documentVersion: raw.documentVersion ?? null,
    region: raw.region ?? null,
    accessedAt: raw.accessedAt,
    evidenceScope: raw.evidenceScope,
    contentDigest: raw.contentDigest,
  };

  return raw.items.map((rawItem) => {
    const identityEntry = findIdentity(rawItem, identityMap);
    if (!identityEntry) throw new Error(`No reviewed identity mapping for ${rawItem.manufacturerModelCode}`);
    if (!PRODUCT_TYPES.has(rawItem.productType) || rawItem.productType !== identityEntry.productType) {
      throw new Error(`Product type does not match identity map for ${rawItem.itemKey}`);
    }
    const identity = rawItem.identity ?? {};
    const product = {
      id: identityEntry.productId,
      name: normalizeText(identity.name),
      brand: normalizedVocabularyValue(identity.brand, vocab.brands, "brand"),
      model: normalizeText(identity.model),
      aliases: uniqueAliases([...(identity.aliases ?? []), ...(identityEntry.reviewedAliases ?? [])]),
      mount: normalizedVocabularyValue(identity.mount, vocab.mounts, "mount"),
    };
    if (rawItem.productType === "body") {
      product.series = normalizeText(identity.series);
      product.kind = normalizeText(identity.kind);
      product.bodyStyle = normalizeText(identity.bodyStyle);
    } else {
      product.type = normalizeText(identity.type);
    }

    let identityEvidence = null;
    if (rawItem.identityEvidence) {
      const review = rawItem.identityEvidence;
      const evidence = raw.evidenceExcerpt?.[review.evidenceRef];
      const expected = { manufacturerModelCode: rawItem.manufacturerModelCode, productType: rawItem.productType, identity: rawItem.identity };
      if (!evidence || stableStringify(evidence.value) !== stableStringify(expected) || (evidence.unit ?? null) !== null) {
        throw new Error(`Identity for ${rawItem.itemKey} does not match its evidenceExcerpt reference`);
      }
      identityEvidence = {
        evidenceId: `identity-${digestValue({ productId: product.id, sourceId: raw.sourceId, locator: review.locator, value: expected }).slice(0, 20)}`,
        sourceId: raw.sourceId,
        evidenceRef: review.evidenceRef,
        locator: review.locator,
        verification: review.verification ?? "pending",
        reviewedAt: review.reviewedAt ?? null,
        reviewer: review.reviewer ?? null,
      };
    }

    const claims = rawItem.observations.map((observation) => {
      if (!vocab.claimPaths.includes(observation.path) || observation.path.split('.').some((p) => ['__proto__', 'constructor', 'prototype'].includes(p))) {
        throw new Error(`Unsupported claim path: ${observation.path}`);
      }
      const evidence = raw.evidenceExcerpt?.[observation.evidenceRef];
      if (!evidence || stableStringify(evidence.value) !== stableStringify(observation.rawValue) || (evidence.unit ?? null) !== (observation.rawUnit ?? null)) {
        throw new Error(`Observation ${observation.path} does not match its evidenceExcerpt reference`);
      }
      const normalized = normalizeClaimValue(observation.path, observation.rawValue, observation.rawUnit ?? null);
      const claim = {
        productId: product.id,
        path: observation.path,
        value: normalized.value,
        unit: normalized.unit,
        rawValue: observation.rawValue,
        rawUnit: observation.rawUnit ?? null,
        unknown: normalized.unknown,
        sourceId: raw.sourceId,
        locator: observation.locator,
        conditions: observation.conditions ?? {},
        verification: observation.verification ?? "pending",
        reviewedAt: observation.reviewedAt ?? null,
        reviewer: observation.reviewer ?? null,
      };
      claim.claimId = createClaimId(claim);
      setAtPath(product, observation.path, normalized.value);
      return claim;
    });

    return {
      schemaVersion: 1,
      batchId,
      itemKey: rawItem.itemKey,
      manufacturerModelCode: rawItem.manufacturerModelCode,
      productType: rawItem.productType,
      identityMapping: {
        manufacturer: identityEntry.manufacturer,
        manufacturerModelCode: identityEntry.manufacturerModelCode,
        productId: identityEntry.productId,
        productType: identityEntry.productType,
        variantKey: identityEntry.variantKey ?? null,
      },
      identityEvidence,
      product,
      source,
      claims,
    };
  });
}

function identityOnly(product, productType) {
  const keys = productType === "body"
    ? ["id", "name", "brand", "series", "model", "aliases", "mount", "kind", "bodyStyle"]
    : ["id", "name", "brand", "model", "aliases", "mount", "type"];
  return Object.fromEntries(keys.map((key) => [key, product[key]]));
}

export function stagingSources(staging) {
  const candidates = staging.sources?.length ? staging.sources : staging.source ? [staging.source] : [];
  const byId = new Map();
  for (const source of candidates) {
    const prior = byId.get(source.sourceId);
    if (prior && stableStringify(prior) !== stableStringify(source)) throw new Error(`Conflicting source metadata for ${source.sourceId}`);
    byId.set(source.sourceId, source);
  }
  return [...byId.values()].sort((left, right) => left.sourceId.localeCompare(right.sourceId));
}

// Single-source output remains byte-compatible with Stage 1–4 archives. Multiple
// fragments gain sources[] while retaining source as the identity/primary source.
export function combineStagingFragments(fragments) {
  if (!Array.isArray(fragments) || fragments.length === 0) throw new Error("No staging fragments to combine");
  if (fragments.length === 1) return fragments[0];
  const ordered = [...fragments].sort((left, right) => left.source.sourceId.localeCompare(right.source.sourceId));
  const expected = ordered[0];
  for (const fragment of ordered.slice(1)) {
    for (const key of ["schemaVersion", "batchId", "itemKey", "manufacturerModelCode", "productType"]) {
      if (stableStringify(fragment[key]) !== stableStringify(expected[key])) throw new Error(`Multi-source ${key} mismatch for ${expected.itemKey}`);
    }
    if (stableStringify(fragment.identityMapping) !== stableStringify(expected.identityMapping)
      || stableStringify(identityOnly(fragment.product, fragment.productType)) !== stableStringify(identityOnly(expected.product, expected.productType))) {
      throw new Error(`Multi-source identity mismatch for ${expected.itemKey}`);
    }
  }
  const identityEvidence = ordered.map((fragment) => fragment.identityEvidence).filter(Boolean);
  if (identityEvidence.length > 1) throw new Error(`Multiple identity evidence records for ${expected.itemKey}`);
  const primary = identityEvidence.length
    ? ordered.find((fragment) => fragment.source.sourceId === identityEvidence[0].sourceId)
    : ordered[0];
  const claims = ordered.flatMap((fragment) => fragment.claims).sort((left, right) =>
    `${left.path}:${left.sourceId}:${left.claimId}`.localeCompare(`${right.path}:${right.sourceId}:${right.claimId}`));
  const product = identityOnly(primary.product, primary.productType);
  for (const claim of claims) {
    if (getAtPath(product, claim.path) === undefined) setAtPath(product, claim.path, structuredClone(claim.value));
  }
  return {
    schemaVersion: primary.schemaVersion,
    batchId: primary.batchId,
    itemKey: primary.itemKey,
    manufacturerModelCode: primary.manufacturerModelCode,
    productType: primary.productType,
    identityMapping: structuredClone(primary.identityMapping),
    identityEvidence: identityEvidence[0] ?? null,
    product,
    source: structuredClone(primary.source),
    sources: ordered.map((fragment) => structuredClone(fragment.source)),
    claims,
  };
}

function allCanonicalProducts(canonical) {
  return [
    ...(canonical.bodies ?? []).map((product) => ({ product, productType: "body" })),
    ...(canonical.lenses ?? []).map((product) => ({ product, productType: "lens" })),
  ];
}

function identityValues(product) {
  return [product.model, product.name, ...(product.aliases ?? [])].filter(Boolean);
}

function equivalentIdentity(left, right) {
  if (left.brand !== right.brand) return false;
  const leftKeys = new Set(identityValues(left).map((value) => normalizeModelIdentity(value, left.brand)).filter(Boolean));
  return identityValues(right).some((value) => leftKeys.has(normalizeModelIdentity(value, right.brand)));
}

function explicitMountVariant(staging, canonicalProduct) {
  return staging.productType === "lens"
    && staging.product.mount !== canonicalProduct.mount
    && normalizeSearch(staging.identityMapping?.variantKey) === normalizeSearch(staging.product.mount);
}

function unknownPrice() {
  return {
    new: { value: null, currency: "KRW", asOf: null, sourceType: "unknown", sourceUrl: null },
    used: { low: null, typical: null, high: null, currency: "KRW", asOf: null, sourceType: "unknown", sourceUrl: null },
  };
}

function unknownSpecs(productType) {
  return productType === "body" ? {
    sensor: { format: null, megapixels: null, generation: null, sizeMm: null },
    weight: null, weightBasis: null, bodyOnlyWeight: null, dimensions: null,
    autofocus: { aiUnit: null, subjects: null, description: null },
    video: { max: null, bitDepth: null, log: null, cropAtMax: null },
    batteryShots: null, releaseDate: null, batteryConditions: null, ibis: null,
    evf: null, lcd: null, burst: null, shutter: null, cardSlots: null,
    weatherSealing: null, fixedLens: null,
  } : {
    focal: { min: null, max: null }, aperture: { wide: null, tele: null },
    weight: null, stabilization: null, filterMm: null, minFocusM: null, minFocusConditions: null,
  };
}

export function createNewProductSkeleton(staging, { includeClaims = false } = {}) {
  const p = staging.product;
  const product = staging.productType === "body" ? {
    id: p.id, name: p.name, brand: p.brand, series: p.series, model: p.model,
    aliases: [...p.aliases], mount: p.mount, kind: p.kind, bodyStyle: p.bodyStyle,
    price: unknownPrice(), specs: unknownSpecs("body"),
  } : {
    id: p.id, name: p.name, brand: p.brand, model: p.model, aliases: [...p.aliases],
    mount: p.mount, type: p.type, price: unknownPrice(), specs: unknownSpecs("lens"),
  };
  if (includeClaims) for (const claim of staging.claims) setAtPath(product, claim.path, structuredClone(claim.value));
  const identitySource = stagingSources(staging).find((source) => source.sourceId === staging.identityEvidence?.sourceId) ?? staging.source;
  product.sources = [{
    url: identitySource.url, type: "manufacturer", accessedOn: identitySource.accessedAt.slice(0, 10),
    fields: ["identity"], note: "Identity evidence retained in ingestion transaction archive",
    sourceId: identitySource.sourceId, documentVersion: identitySource.documentVersion,
  }];
  product.identityEvidence = {
    verification: "verified",
    evidenceId: staging.identityEvidence.evidenceId,
    sourceId: staging.identityEvidence.sourceId,
    checkedAt: staging.identityEvidence.reviewedAt,
  };
  product.legacyFields = [];
  return product;
}

function addIssue(issues, code, message, path = null) {
  issues.push({ severity: "error", code, path, message });
}

function finiteNonnegative(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function validatePhysicalClaims(staging, issues) {
  const claimByPath = new Map(staging.claims.map((claim) => [claim.path, claim]));
  for (const claim of staging.claims) {
    const { value, path } = claim;
    if (value === undefined || (typeof value === "string" && value.toUpperCase() === "UNKNOWN")) {
      addIssue(issues, "UNKNOWN_NOT_NORMALIZED", `${path} must use null for unknown values`, path);
      continue;
    }
    if (value === null) continue;
    const numericValues = Array.isArray(value) ? value.filter((entry) => typeof entry === "number") : typeof value === "number" ? [value] : [];
    if (!path.startsWith("specs.operatingTemperatureC.") && numericValues.some((number) => !finiteNonnegative(number))) addIssue(issues, "NEGATIVE_OR_INVALID_NUMBER", `${path} contains an invalid or negative number`, path);
    if ((["specs.weight", "specs.bodyOnlyWeight", "specs.minFocusM", "specs.filterMm", "specs.sensor.megapixels"].includes(path)
      || /^specs\.(?:fixedLens\.)?(?:focal|aperture)\.(?:min|max|wide|tele)$/.test(path))
      && typeof value === "number" && value <= 0) addIssue(issues, "INVALID_PHYSICAL_RANGE", `${path} must be greater than zero`, path);
    if (path === "specs.dimensions" && (!Array.isArray(value) || value.length !== 3 || value.some((number) => !Number.isFinite(number) || number <= 0))) {
      addIssue(issues, "INVALID_DIMENSIONS", "specs.dimensions must contain three positive numbers", path);
    }
    if (path === "specs.sensor.sizeMm" && (!Array.isArray(value) || value.length !== 2 || value.some((number) => !Number.isFinite(number) || number <= 0))) {
      addIssue(issues, "INVALID_SENSOR_SIZE", "specs.sensor.sizeMm must contain width and height in mm", path);
    }
  }
  const orderedPairs = [
    ["specs.focal.min", "specs.focal.max"],
    ["specs.fixedLens.focal.min", "specs.fixedLens.focal.max"],
    ["specs.aperture.wide", "specs.aperture.tele"],
    ["price.used.low", "price.used.typical"],
    ["price.used.typical", "price.used.high"],
    ["price.used.low", "price.used.high"],
    ["specs.operatingTemperatureC.min", "specs.operatingTemperatureC.max"],
  ];
  for (const [lowPath, highPath] of orderedPairs) {
    const low = claimByPath.get(lowPath)?.value;
    const high = claimByPath.get(highPath)?.value;
    if (low !== undefined && low !== null && high !== undefined && high !== null && low > high) {
      addIssue(issues, "INVALID_ORDERED_RANGE", `${lowPath} must not exceed ${highPath}`, lowPath);
    }
  }
}

function sourceIsValid(source, staging, rawDocuments, vocab, issues) {
  if (!source || !vocab.sourceTypes.includes(source.sourceType)) addIssue(issues, "INVALID_SOURCE_TYPE", `Unsupported source type: ${source?.sourceType}`);
  if (source?.sourceType !== "manufacturer" && staging.claims.some((claim) => claim.sourceId === source?.sourceId && !claim.path.startsWith("price."))) {
    addIssue(issues, "NON_MANUFACTURER_SPEC_SOURCE", "Retail and used-market sources may support price claims only");
  }
  try {
    if (new URL(source.url).protocol !== "https:") throw new Error();
  } catch {
    addIssue(issues, "INVALID_SOURCE_URL", "Source URL must be HTTPS");
  }
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(source.accessedAt ?? "")) {
    addIssue(issues, "INVALID_ACCESSED_AT", "Source accessedAt must be a UTC ISO timestamp");
  }
  const raw = rawDocuments?.get(source.sourceId);
  if (!raw) {
    addIssue(issues, "RAW_SOURCE_MISSING", `Raw source ${source.sourceId} is unavailable`);
    return;
  }
  if (digestValue(raw.evidenceExcerpt) !== source.contentDigest || createSourceId(raw) !== source.sourceId) {
    addIssue(issues, "SOURCE_DIGEST_MISMATCH", `Raw source ${source.sourceId} failed its digest check`);
  }
}

export function validateStaging(staging, { canonical, vocab, rawDocuments = new Map() }) {
  const issues = [];
  if (!staging || typeof staging !== "object" || !staging.product) {
    addIssue(issues, "INVALID_STAGING", "Staging document must contain product");
    return { valid: false, errors: issues, warnings: [] };
  }
  const { product, productType } = staging;
  if (!PRODUCT_TYPES.has(productType)) addIssue(issues, "INVALID_PRODUCT_TYPE", `Unsupported product type: ${productType}`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.id ?? "") || RESERVED_ID_PREFIXES.some((prefix) => product.id?.startsWith(prefix)) || product.id?.endsWith("-integrated-lens")) {
    addIssue(issues, "INVALID_PRODUCT_ID", `Invalid or reserved product ID: ${product.id}`);
  }

  const canonicalEntries = allCanonicalProducts(canonical);
  const canonicalIds = new Map();
  for (const entry of canonicalEntries) {
    if (canonicalIds.has(entry.product.id)) addIssue(issues, "DUPLICATE_CANONICAL_ID", `Canonical ID is duplicated: ${entry.product.id}`);
    canonicalIds.set(entry.product.id, entry);
  }
  const existing = canonicalIds.get(product.id);
  if (existing && existing.productType !== productType) addIssue(issues, "ID_TYPE_COLLISION", `${product.id} belongs to another product type`);

  const vocabularyMounts = new Set(vocab.mounts.map((entry) => entry.name));
  for (const field of ["id", "name", "brand", "model"]) {
    if (typeof product[field] !== "string" || !product[field].trim()) addIssue(issues, "MISSING_REQUIRED_IDENTITY", `Missing required identity field: ${field}`, `product.${field}`);
  }
  if (!Array.isArray(product.aliases)) addIssue(issues, "MISSING_REQUIRED_IDENTITY", "aliases must be an array", "product.aliases");
  if (productType === "body") {
    if (typeof product.series !== "string" || !product.series.trim()) addIssue(issues, "MISSING_REQUIRED_IDENTITY", "Missing required identity field: series", "product.series");
    if (!vocab.bodyKinds.includes(product.kind)) addIssue(issues, "INVALID_BODY_KIND", `Unsupported body kind: ${product.kind}`);
    if (!vocab.bodyStyles.includes(product.bodyStyle)) addIssue(issues, "INVALID_BODY_STYLE", `Unsupported body style: ${product.bodyStyle}`);
    if (product.kind === "fixed" ? product.mount !== null : !vocabularyMounts.has(product.mount)) addIssue(issues, "INVALID_MOUNT", `Invalid mount for body kind ${product.kind}: ${product.mount}`);
  } else if (productType === "lens") {
    if (!vocab.lensTypes.includes(product.type)) addIssue(issues, "INVALID_LENS_TYPE", `Unsupported lens type: ${product.type}`);
    if (!vocabularyMounts.has(product.mount)) addIssue(issues, "INVALID_MOUNT", `Invalid lens mount: ${product.mount}`);
  }

  let sources = [];
  try {
    sources = stagingSources(staging);
  } catch (error) {
    addIssue(issues, "SOURCE_REGISTRY_CONFLICT", error.message, "sources");
  }
  const sourceIds = new Set(sources.map((source) => source.sourceId));
  if (!sources.length) addIssue(issues, "SOURCE_REGISTRY_EMPTY", "Staging requires at least one source", "sources");
  if (staging.source && !sourceIds.has(staging.source.sourceId)) addIssue(issues, "PRIMARY_SOURCE_MISSING", "Primary source is absent from sources[]", "source");

  if (!existing) {
    const evidence = staging.identityEvidence;
    const identitySource = sources.find((source) => source.sourceId === evidence?.sourceId);
    if (identitySource?.sourceType !== "manufacturer") addIssue(issues, "NEW_PRODUCT_IDENTITY_SOURCE", "A new product identity requires a manufacturer source", "source.sourceType");
    if (!evidence || evidence.verification !== "verified" || !evidence.reviewer || !/^\d{4}-\d{2}-\d{2}$/.test(evidence.reviewedAt ?? "")) {
      addIssue(issues, "NEW_PRODUCT_IDENTITY_UNVERIFIED", "A new product requires reviewed identity evidence", "identityEvidence");
    } else {
      if (!identitySource) addIssue(issues, "IDENTITY_SOURCE_MISMATCH", "Identity evidence source is absent from staging sources", "identityEvidence.sourceId");
      if (!evidence.locator || !Object.values(evidence.locator).some((value) => typeof value === "string" && value.trim())) addIssue(issues, "IDENTITY_LOCATOR_MISSING", "Identity evidence requires a source locator", "identityEvidence.locator");
      const rawItem = rawDocuments.get(evidence.sourceId)?.items?.find((item) => item.itemKey === staging.itemKey);
      const rawReview = rawItem?.identityEvidence;
      if (!rawReview || rawReview.evidenceRef !== evidence.evidenceRef || stableStringify(rawReview.locator) !== stableStringify(evidence.locator)
        || rawReview.verification !== evidence.verification || rawReview.reviewedAt !== evidence.reviewedAt || rawReview.reviewer !== evidence.reviewer) {
        addIssue(issues, "RAW_IDENTITY_MISMATCH", "Staged identity evidence does not match raw evidence", "identityEvidence");
      }
    }
    const equivalent = canonicalEntries.find((entry) => entry.productType === productType && equivalentIdentity(product, entry.product));
    if (equivalent && !explicitMountVariant(staging, equivalent.product)) {
      addIssue(issues, "EQUIVALENT_EXISTING_PRODUCT", `${product.id} appears equivalent to existing ${equivalent.product.id}`, "product.id");
    }
  }

  const aliasOwners = new Map();
  for (const { product: canonicalProduct } of canonicalEntries) {
    for (const value of [canonicalProduct.name, canonicalProduct.model, canonicalProduct.model && `${canonicalProduct.brand} ${canonicalProduct.model}`, ...(canonicalProduct.aliases ?? [])]) {
      const key = normalizeSearch(value);
      if (key && !aliasOwners.has(key)) aliasOwners.set(key, canonicalProduct.id);
    }
  }
  for (const value of [product.name, product.model, product.model && `${product.brand} ${product.model}`, ...(product.aliases ?? [])]) {
    const key = normalizeSearch(value);
    const owner = aliasOwners.get(key);
    if (!key) addIssue(issues, "EMPTY_IDENTITY_NAME", "Product names and aliases must normalize to a nonempty value");
    else if (owner && owner !== product.id) addIssue(issues, "ALIAS_COLLISION", `${value} collides with ${owner}`);
  }

  for (const source of sources) sourceIsValid(source, staging, rawDocuments, vocab, issues);
  const stagedWeight = getAtPath(product, "specs.weight");
  const stagedWeightBasis = getAtPath(product, "specs.weightBasis");
  if (productType === "body" && stagedWeight !== undefined && stagedWeight !== null && !vocab.weightBases.includes(stagedWeightBasis)) {
    addIssue(issues, "WEIGHT_BASIS_REQUIRED", "A known operational weight requires an approved specs.weightBasis", "specs.weightBasis");
  }
  if (productType === "body" && stagedWeightBasis !== undefined && stagedWeightBasis !== null && !vocab.weightBases.includes(stagedWeightBasis)) {
    addIssue(issues, "INVALID_WEIGHT_BASIS", `Unsupported weight basis: ${stagedWeightBasis}`, "specs.weightBasis");
  }
  const claimsByPath = new Map();
  const claimIds = new Set();
  for (const claim of staging.claims ?? []) {
    const priorClaims = claimsByPath.get(claim.path) ?? [];
    if (priorClaims.some((prior) => !valuesEqual(prior.value, claim.value) || prior.unit !== claim.unit)) {
      addIssue(issues, "CONFLICTING_CLAIM_VALUES", `Official sources disagree for ${claim.path}`, claim.path);
    }
    priorClaims.push(claim);
    claimsByPath.set(claim.path, priorClaims);
    if (claimIds.has(claim.claimId)) addIssue(issues, "DUPLICATE_CLAIM_ID", `Duplicate claim ID: ${claim.claimId}`, claim.path);
    claimIds.add(claim.claimId);
    if (!vocab.claimPaths.includes(claim.path)) addIssue(issues, "UNSUPPORTED_CLAIM_PATH", `Unsupported claim path: ${claim.path}`, claim.path);
    if (!CLAIM_VERIFICATIONS.has(claim.verification)) addIssue(issues, "INVALID_VERIFICATION", `Invalid verification state: ${claim.verification}`, claim.path);
    else if (claim.verification !== "verified") addIssue(issues, "CLAIM_NOT_VERIFIED", `Claim must be verified before the batch can reach validated: ${claim.path}`, claim.path);
    if (claim.verification === "verified" && (!claim.reviewer || !/^\d{4}-\d{2}-\d{2}$/.test(claim.reviewedAt ?? ""))) {
      addIssue(issues, "UNREVIEWED_VERIFIED_CLAIM", `Verified claim requires reviewer and reviewedAt: ${claim.path}`, claim.path);
    }
    if (!claim.locator || !Object.values(claim.locator).some((value) => typeof value === "string" && value.trim())) {
      addIssue(issues, "SOURCE_LOCATOR_MISSING", `Claim has no source locator: ${claim.path}`, claim.path);
    }
    if (!sourceIds.has(claim.sourceId)) addIssue(issues, "CLAIM_SOURCE_MISMATCH", `Claim source is absent from staging sources: ${claim.path}`, claim.path);
    const rawItem = rawDocuments.get(claim.sourceId)?.items?.find((item) => item.itemKey === staging.itemKey);
    const rawObservation = rawItem?.observations?.find((observation) => observation.path === claim.path);
    if (!rawObservation) addIssue(issues, "RAW_OBSERVATION_MISSING", `No raw observation supports ${claim.path}`, claim.path);
    else {
      try {
        const expected = normalizeClaimValue(claim.path, rawObservation.rawValue, rawObservation.rawUnit ?? null);
        if (!valuesEqual(expected.value, claim.value) || expected.unit !== claim.unit || !valuesEqual(rawObservation.locator, claim.locator)
          || !valuesEqual(rawObservation.conditions ?? {}, claim.conditions) || rawObservation.verification !== claim.verification) {
          addIssue(issues, "RAW_CLAIM_MISMATCH", `Staged claim does not match its raw observation: ${claim.path}`, claim.path);
        }
      } catch (error) {
        addIssue(issues, "RAW_NORMALIZATION_FAILED", error.message, claim.path);
      }
    }
    if (claim.claimId !== createClaimId(claim)) addIssue(issues, "CLAIM_ID_MISMATCH", `Claim ID is not deterministic: ${claim.path}`, claim.path);
    if (getAtPath(product, claim.path) !== claim.value && stableStringify(getAtPath(product, claim.path)) !== stableStringify(claim.value)) {
      addIssue(issues, "CLAIM_PRODUCT_MISMATCH", `Claim value is not represented in staged product: ${claim.path}`, claim.path);
    }
  }
  validatePhysicalClaims(staging, issues);
  return { valid: issues.length === 0, errors: issues, warnings: [] };
}

export function validateStagingBatch(stagings, context) {
  const results = stagings.map((staging) => ({ itemKey: staging.itemKey, ...validateStaging(staging, context) }));
  const incomingIds = new Map();
  const incomingAliases = new Map();
  const priorStagings = [];
  for (const staging of stagings) {
    const owner = incomingIds.get(staging.product.id);
    if (owner && owner !== staging.itemKey) {
      for (const result of results.filter((candidate) => [owner, staging.itemKey].includes(candidate.itemKey))) {
        result.errors.push({ severity: "error", code: "DUPLICATE_INCOMING_ID", path: "product.id", message: `${staging.product.id} appears in multiple staging items` });
        result.valid = false;
      }
    } else incomingIds.set(staging.product.id, staging.itemKey);
    for (const value of [staging.product.name, staging.product.model, staging.product.model && `${staging.product.brand} ${staging.product.model}`, ...(staging.product.aliases ?? [])]) {
      const key = normalizeSearch(value);
      const owner = incomingAliases.get(key);
      if (key && owner && owner.productId !== staging.product.id) {
        for (const result of results.filter((candidate) => [owner.itemKey, staging.itemKey].includes(candidate.itemKey))) {
          result.errors.push({ severity: "error", code: "DUPLICATE_INCOMING_ALIAS", path: "product.aliases", message: `${value} appears in multiple incoming products` });
          result.valid = false;
        }
      } else if (key) incomingAliases.set(key, { productId: staging.product.id, itemKey: staging.itemKey });
    }
    const equivalent = priorStagings.find((candidate) => candidate.productType === staging.productType
      && candidate.product.id !== staging.product.id && equivalentIdentity(candidate.product, staging.product)
      && !explicitMountVariant(staging, candidate.product) && !explicitMountVariant(candidate, staging.product));
    if (equivalent) {
      for (const result of results.filter((candidate) => [equivalent.itemKey, staging.itemKey].includes(candidate.itemKey))) {
        result.errors.push({ severity: "error", code: "EQUIVALENT_INCOMING_PRODUCT", path: "product.id", message: `${staging.product.id} appears equivalent to incoming ${equivalent.product.id}` });
        result.valid = false;
      }
    }
    priorStagings.push(staging);
  }
  return { valid: results.every((result) => result.valid), items: results };
}

function valuesEqual(left, right) {
  return stableStringify(left) === stableStringify(right);
}

export function createCanonicalDiff(staging, canonical) {
  const entries = allCanonicalProducts(canonical);
  const existing = entries.find(({ product }) => product.id === staging.product.id)?.product ?? null;
  const sourcesById = new Map(stagingSources(staging).map((source) => [source.sourceId, source]));
  const changes = staging.claims.map((claim) => {
    const canonicalValue = existing ? getAtPath(existing, claim.path) : undefined;
    let category;
    if (!existing) category = "new-product";
    else if (claim.value === null) category = canonicalValue == null ? "unknown-no-change" : "incoming-unknown";
    else if (canonicalValue == null) category = "null-fill";
    else if (valuesEqual(canonicalValue, claim.value)) category = "same-value/new-evidence";
    else category = "value-conflict";
    return {
      path: claim.path,
      category,
      canonicalValue: canonicalValue === undefined ? null : canonicalValue,
      incomingValue: claim.value,
      unit: claim.unit,
      claimId: claim.claimId,
      canonicalSources: existing?.sources?.filter((source) => (source.fields ?? []).some((field) => claim.path === field || claim.path.startsWith(`${field}.`))) ?? [],
      incomingSource: {
        sourceId: claim.sourceId,
        url: sourcesById.get(claim.sourceId)?.url ?? null,
        locator: claim.locator,
        conditions: claim.conditions,
      },
      reviewRequired: !["unknown-no-change", "incoming-unknown"].includes(category),
    };
  });
  return {
    schemaVersion: 1,
    batchId: staging.batchId,
    productId: staging.product.id,
    productName: staging.product.name,
    productType: staging.productType,
    operation: existing ? "update-product" : "new-product",
    incomingProduct: existing ? null : createNewProductSkeleton(staging, { includeClaims: true }),
    identityEvidence: existing ? null : {
      ...staging.identityEvidence,
      source: { sourceId: staging.source.sourceId, url: staging.source.url, documentTitle: staging.source.documentTitle, documentVersion: staging.source.documentVersion },
    },
    canonicalProductDigest: existing ? digestValue(existing) : null,
    status: !existing || changes.some((change) => change.reviewRequired) ? "review-required" : "no-action",
    changes,
  };
}

export function summarizeCanonicalDiff(changes) {
  const categories = Object.fromEntries(["same-value/new-evidence", "null-fill", "value-conflict", "new-product", "unknown-no-change", "incoming-unknown"].map((name) => [name, 0]));
  const seen = new Set();
  for (const change of changes ?? []) {
    const key = `${change.path}:${change.category}`;
    if (!seen.has(key)) categories[change.category] = (categories[change.category] ?? 0) + 1;
    seen.add(key);
  }
  return {
    fieldCount: new Set((changes ?? []).map((change) => change.path)).size,
    sourceCount: new Set((changes ?? []).map((change) => change.incomingSource?.sourceId).filter(Boolean)).size,
    categories,
  };
}

function formatValue(value, unit, path) {
  if (value === null || value === undefined) return "UNKNOWN";
  const rendered = Array.isArray(value)
    ? ["specs.dimensions", "specs.sensor.sizeMm"].includes(path) ? value.join(" × ") : value.join(", ")
    : typeof value === "object" ? JSON.stringify(value) : String(value);
  return unit ? `${rendered} ${unit}` : rendered;
}

export function formatCanonicalDiff(diff) {
  const summary = diff.summary ?? summarizeCanonicalDiff(diff.changes);
  const sourceCount = new Set([
    ...(diff.changes ?? []).map((change) => change.incomingSource?.sourceId),
    diff.identityEvidence?.source?.sourceId,
  ].filter(Boolean)).size;
  const c = summary.categories;
  const lines = [
    `${diff.productName} (${diff.productId})`,
    `operation: ${diff.operation ?? "update-product"}`,
    `status: ${diff.status}`,
    `summary: ${summary.fieldCount} fields / ${sourceCount} sources | evidence ${c["same-value/new-evidence"] ?? 0} | null-fill ${c["null-fill"] ?? 0} | conflict ${c["value-conflict"] ?? 0} | new ${c["new-product"] ?? 0} | unknown ${((c["unknown-no-change"] ?? 0) + (c["incoming-unknown"] ?? 0))}`,
  ];
  if (diff.operation === "new-product") {
    lines.push("", "new canonical product:", JSON.stringify(diff.incomingProduct, null, 2), `identity source: ${diff.identityEvidence?.source?.url ?? "UNKNOWN"}`, `identity locator: ${JSON.stringify(diff.identityEvidence?.locator ?? null)}`);
  }
  for (const change of diff.changes) {
    lines.push("", `${change.path}:`, `  canonical: ${formatValue(change.canonicalValue, change.unit, change.path)}`, `  incoming:  ${formatValue(change.incomingValue, change.unit, change.path)}`, `  result:    ${change.category}`, `  source:    ${change.incomingSource.url}`, `  locator:   ${JSON.stringify(change.incomingSource.locator)}`);
  }
  return lines.join("\n");
}

export function nextActionForState(state) {
  return {
    pending: "collect raw evidence",
    collected: "run normalize",
    normalized: "run validate",
    validated: "run diff or review existing diff",
    rejected: "review issues and collect corrected evidence",
    canonicalized: "verify tests and batch commit",
  }[state] ?? "repair invalid state";
}

export function summarizeBatch(manifest, currentCanonicalDigest) {
  const counts = Object.fromEntries(BATCH_STATES.map((state) => [state, 0]));
  for (const item of manifest.items ?? []) if (counts[item.state] !== undefined) counts[item.state] += 1;
  return {
    batchId: manifest.batchId,
    scope: manifest.scope,
    tier: manifest.tier,
    lastSuccessfulGate: manifest.lastSuccessfulGate,
    baselineMatches: manifest.canonicalBaselineDigest === currentCanonicalDigest,
    states: counts,
    items: (manifest.items ?? []).map((item) => ({
      itemKey: item.itemKey,
      productId: item.productId,
      state: item.state,
      issues: item.issues ?? [],
      nextAction: nextActionForState(item.state),
    })),
  };
}
