// Lens-only contracts shared by staging, approval and canonical validation.
// Missing optional coverage in legacy products means UNKNOWN, never full-frame.
export const LENS_SPEC_KEYS = Object.freeze(['focal', 'aperture', 'weight', 'stabilization', 'filterMm', 'minFocusM', 'minFocusConditions', 'formatCoverage']);
export const LENS_FORMAT_COVERAGES = Object.freeze(['full-frame', 'APS-C']);

export function normalizeLensCoverage(value) {
  if (typeof value !== 'string') return value;
  const aliases = { '35mm full-frame': 'full-frame', '35mm 풀프레임': 'full-frame', 'full frame': 'full-frame', 'full-frame': 'full-frame', 'aps-c': 'APS-C' };
  return aliases[value.trim().toLowerCase()] ?? value.trim();
}

export function isLensSpecPath(path) {
  return /^specs\.(?:focal(?:\.(?:min|max))?|aperture(?:\.(?:wide|tele))?|weight|stabilization|filterMm|minFocusM|minFocusConditions|formatCoverage)$/.test(path);
}

export function lensUnit(path) {
  if (/^specs\.focal\.(?:min|max)$/.test(path) || path === 'specs.filterMm') return 'mm';
  if (path === 'specs.weight') return 'g';
  if (path === 'specs.minFocusM') return 'm';
  return null;
}

const fail = (code, message) => { throw Object.assign(new Error(message), { code }); };
export function validateLensModel(value, { required = false } = {}) {
  if (value == null && !required) return;
  if (typeof value !== 'string' || !value.trim() || value.trim().toUpperCase() === 'UNKNOWN') fail('INVALID_LENS_MODEL', 'Invalid lens model: a reviewed nonempty model string is required');
}
export function validateLensValue(value, path) {
  if (value === null) return;
  if (path === 'specs.focal' || path === 'specs.aperture') {
    const keys = path.endsWith('focal') ? ['min', 'max'] : ['wide', 'tele'];
    if (!value || typeof value !== 'object' || Array.isArray(value) || !Object.keys(value).length || Object.keys(value).some(k => !keys.includes(k))) fail('INVALID_LENS_SPEC', `Invalid lens range: ${path}`);
    for (const [key, child] of Object.entries(value)) validateLensValue(child, `${path}.${key}`);
    if (value[keys[0]] != null && value[keys[1]] != null && value[keys[0]] > value[keys[1]]) fail('INVALID_ORDERED_RANGE', `Reversed range: ${path}`);
  } else if (path === 'specs.formatCoverage') {
    if (!LENS_FORMAT_COVERAGES.includes(value)) fail('INVALID_LENS_COVERAGE', `Invalid lens format coverage: ${value}`);
  } else if (path === 'specs.stabilization') {
    if (typeof value !== 'boolean') fail('INVALID_LENS_SPEC', `Invalid boolean: ${path}`);
  } else if (path === 'specs.minFocusConditions') {
    if (typeof value !== 'string' || !value.trim() || value.trim().toUpperCase() === 'UNKNOWN') fail('INVALID_LENS_SPEC', `Invalid string: ${path}`);
  } else {
    if (typeof value !== 'number' || !Number.isFinite(value)) fail('INVALID_LENS_SPEC', `Invalid number: ${path}`);
    if (value <= 0) fail('INVALID_PHYSICAL_RANGE', `Physical value must be positive: ${path}`);
  }
}

export function validateLensSpecs(specs, type) {
  if (!specs || typeof specs !== 'object' || Array.isArray(specs)) fail('INVALID_LENS_SPEC', 'Missing lens specs');
  for (const [key, value] of Object.entries(specs)) {
    if (!LENS_SPEC_KEYS.includes(key)) fail('UNSUPPORTED_CLAIM_PATH', `Wrong product specification: lens/${key}`);
    validateLensValue(value, `specs.${key}`);
  }
  if (type === 'prime' && specs.focal?.min != null && specs.focal?.max != null && specs.focal.min !== specs.focal.max) fail('INVALID_LENS_FOCAL', 'Prime lens focal endpoints must be equal');
  if (type === 'prime' && specs.aperture?.wide != null && specs.aperture?.tele != null && specs.aperture.wide !== specs.aperture.tele) fail('INVALID_LENS_APERTURE', 'Prime lens maximum aperture endpoints must be equal');
}

// The caller supplies the existing pipeline converter so its supported-unit table
// remains the sole authority for both normalization and validation.
export function validateLensClaim(claim, convert) {
  if (!isLensSpecPath(claim.path)) fail('UNSUPPORTED_CLAIM_PATH', `Wrong product specification: lens/${claim.path}`);
  validateLensValue(claim.value, claim.path);
  if (claim.value === null) return;
  const unit = lensUnit(claim.path);
  if (unit) {
    if (typeof claim.rawValue !== 'number' || !Number.isFinite(claim.rawValue)) fail('INVALID_LENS_SPEC', `Lens numeric source must be a number: ${claim.path}`);
    if (claim.rawUnit == null || claim.rawUnit === '' || claim.unit == null) fail('UNIT_REQUIRED', `Known lens value requires an explicit unit: ${claim.path}`);
    if (claim.unit !== unit) fail('UNSUPPORTED_UNIT', `Unsupported lens unit: ${claim.path}`);
    try { convert(1, claim.rawUnit, unit); }
    catch { fail('UNSUPPORTED_UNIT', `Unsupported lens unit: ${claim.path}`); }
  } else if (claim.unit != null || claim.rawUnit != null) {
    fail('UNSUPPORTED_UNIT', `Lens value is dimensionless: ${claim.path}`);
  }
}
