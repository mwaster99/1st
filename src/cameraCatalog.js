import products from "./data/cameraProducts.json" with { type: "json" };
import legacyPolicy from "./data/cameraLegacyPolicy.json" with { type: "json" };

// Objective facts live only in cameraProducts.json. These are compatibility views,
// not another catalogue. Historical demo scores are explicitly separate policy.
export const CAMERA_PRODUCTS = products;
export const LEGACY_CAMERA_POLICY = legacyPolicy;
export const toLegacyPrice = (quote, field) => quote?.currency === "KRW" && Number.isFinite(quote[field]) && quote[field] >= 0 ? quote[field] / 10000 : null;
const common = (product) => ({
  ...product,
  newPrice: toLegacyPrice(product.price.new, "value"),
  usedPrice: toLegacyPrice(product.price.used, "typical"),
  photoScore: null, videoScore: null, portabilityScore: null,
  dataStatus: "partial",
});
export const CATALOG_BODIES = products.bodies.map((product) => ({
  ...common(product),
  sensor: null, weight: null, dimensions: null, autofocus: null, video: null, batteryShots: null,
  ...product.specs,
  useTags: null,
  capabilities: { lowLight: null, versatility: null, lensEcosystem: null },
  designTags: [product.bodyStyle === "compact" ? "minimal" : product.bodyStyle].filter(Boolean),
  ...legacyPolicy.bodies[product.id],
}));
export const CATALOG_LENSES = products.lenses.map((product) => ({
  ...common(product),
  focal: null, aperture: null, weight: null, stabilization: null, roles: null,
  ...product.specs,
  ...legacyPolicy.lenses[product.id],
}));

// An integrated lens describes optics, not a separately tradable asset.
// Its mass/price are unknown, not zero. The body already includes them.
export function getIntegratedLens(body) {
  if (body?.kind !== "fixed") return null;
  const specs = body.specs?.fixedLens;
  return {
    id: `${body.id}-integrated-lens`, name: `${body.model} 내장 렌즈`,
    includedInBodyId: body.id, brand: body.brand, mount: null,
    focal: specs?.focal ?? null, equivalentFocal: specs?.equivalentFocal ?? null,
    aperture: specs?.aperture ?? null, weight: null, stabilization: null,
    newPrice: null, usedPrice: null, roles: null,
    photoScore: null, videoScore: null, portabilityScore: null, dataStatus: "partial",
  };
}
