#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createSourceId, digestValue, stableStringify } from "./rules.mjs";

const REVIEW_KEYS = ["verification", "reviewedAt", "reviewer"];

function requireValue(ok, message) {
  if (!ok) throw new Error(message);
}

function reviewFields(defaults = {}, override = {}) {
  return Object.fromEntries(REVIEW_KEYS
    .map((key) => [key, override[key] ?? defaults[key]])
    .filter(([, value]) => value !== undefined));
}

/**
 * Builds the exact immutable raw document accepted by the ingestion pipeline.
 * Draft observations colocate their evidence label and value; this helper assigns
 * evidenceRef values and deterministic content/source digests without marking
 * anything verified unless the draft explicitly supplies review metadata.
 */
export function buildRawDocument(draft) {
  requireValue(draft && typeof draft === "object", "Raw draft must be an object");
  requireValue(draft.source && typeof draft.source === "object", "Raw draft requires source metadata");
  requireValue(Array.isArray(draft.items) && draft.items.length, "Raw draft requires items[]");
  requireValue(draft.source.sourceId === undefined && draft.source.contentDigest === undefined, "Derived source fields must not be supplied");

  const evidenceExcerpt = [];
  const evidenceIndex = new Map();
  const addEvidence = (evidence) => {
    const normalized = { field: evidence.field, value: structuredClone(evidence.value), unit: evidence.unit ?? null };
    requireValue(typeof normalized.field === "string" && normalized.field.trim(), "Evidence requires a field label");
    const key = stableStringify(normalized);
    if (!evidenceIndex.has(key)) {
      evidenceIndex.set(key, evidenceExcerpt.length);
      evidenceExcerpt.push(normalized);
    }
    return evidenceIndex.get(key);
  };

  const items = draft.items.map((item) => {
    const defaults = { ...(draft.reviewDefaults ?? {}), ...(item.reviewDefaults ?? {}) };
    const output = {
      itemKey: item.itemKey,
      manufacturerModelCode: item.manufacturerModelCode,
      productType: item.productType,
      identity: structuredClone(item.identity),
      observations: (item.observations ?? []).map((observation) => ({
        path: observation.path,
        evidenceRef: addEvidence({ field: observation.field, value: observation.rawValue, unit: observation.rawUnit }),
        rawValue: structuredClone(observation.rawValue),
        rawUnit: observation.rawUnit ?? null,
        locator: structuredClone(observation.locator),
        conditions: structuredClone(observation.conditions ?? {}),
        ...reviewFields(defaults, observation),
      })),
    };
    if (item.identityEvidence) {
      const identityValue = { manufacturerModelCode: item.manufacturerModelCode, productType: item.productType, identity: item.identity };
      output.identityEvidence = {
        evidenceRef: addEvidence({ field: item.identityEvidence.field ?? "Product identity", value: identityValue, unit: null }),
        locator: structuredClone(item.identityEvidence.locator),
        ...reviewFields(defaults, item.identityEvidence),
      };
    }
    return output;
  });

  const raw = { schemaVersion: 1, ...structuredClone(draft.source), evidenceExcerpt, items };
  raw.contentDigest = digestValue(raw.evidenceExcerpt);
  raw.sourceId = createSourceId(raw);
  return raw;
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  const inputIndex = process.argv.indexOf("--input");
  if (inputIndex < 0 || !process.argv[inputIndex + 1]) {
    console.error("Usage: node scripts/objective/raw-helper.mjs --input <draft.json>");
    process.exitCode = 1;
  } else {
    try {
      const draft = JSON.parse(await readFile(path.resolve(process.argv[inputIndex + 1]), "utf8"));
      console.log(`${JSON.stringify(buildRawDocument(draft), null, 2)}\n`);
    } catch (error) {
      console.error(JSON.stringify({ status: "failure", error: error.message }, null, 2));
      process.exitCode = 1;
    }
  }
}
