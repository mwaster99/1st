import { CATALOG_BODIES, CATALOG_LENSES } from "./cameraCatalog.js";
export { getIntegratedLens } from "./cameraCatalog.js";
export const CAMERA_BODIES = CATALOG_BODIES;
export const CAMERA_LENSES = CATALOG_LENSES;
export const LENS_BY_ID = Object.fromEntries(CAMERA_LENSES.map((lens) => [lens.id, lens]));

export const BODY_BY_NAME = Object.fromEntries(CAMERA_BODIES.map((body) => [body.name, body]));
export const BODY_BY_ID = Object.fromEntries(CAMERA_BODIES.map((body) => [body.id, body]));
export const LENS_BY_NAME = Object.fromEntries(CAMERA_LENSES.map((lens) => [lens.name, lens]));

export function normalizeCameraSearch(value) {
  return String(value || "")
    .toLowerCase()
    .replaceAll("α", "a")
    .replaceAll("mark", "m")
    .replace(/[^a-z0-9가-힣]/g, "");
}

export function searchCameraBodies(query) {
  const needle = normalizeCameraSearch(query);
  if (!needle) return [];
  return CAMERA_BODIES.filter((body) => [body.name, body.brand, body.series, body.model, ...(body.aliases || [])]
    .some((value) => normalizeCameraSearch(value).includes(needle)));
}

export function createUnknownBody(name, brand = "기타", series = "기타") {
  return {
    id: `unknown-body-${name}`,
    name,
    brand,
    series,
    model: name,
    aliases: [],
    mount: null,
    designTags: null,
    capabilities: { lowLight: null, versatility: null, lensEcosystem: null },
    sensor: null,
    weight: null,
    dimensions: null,
    autofocus: null,
    video: null,
    batteryShots: null,
    newPrice: null,
    usedPrice: null,
    useTags: [],
    photoScore: null,
    videoScore: null,
    portabilityScore: null,
    dataStatus: "unknown",
  };
}

export function createUnknownLens(name, mount = null) {
  return {
    id: `unknown-lens-${name}`,
    name,
    brand: null,
    mount,
    type: null,
    focal: null,
    aperture: null,
    weight: null,
    stabilization: null,
    newPrice: null,
    usedPrice: null,
    roles: [],
    photoScore: null,
    videoScore: null,
    portabilityScore: null,
    dataStatus: "unknown",
  };
}
