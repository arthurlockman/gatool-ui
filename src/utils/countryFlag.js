/**
 * Converts a 2-letter ISO country code to a flag emoji.
 * Uses Unicode regional indicator symbols (U+1F1E6–U+1F1FF).
 * @param {string} countryCode — 2-letter ISO code (e.g., "af", "US")
 * @returns {string} flag emoji, or empty string if invalid
 */
export function countryCodeToFlag(countryCode) {
  if (!countryCode || typeof countryCode !== "string" || countryCode.length !== 2) {
    return "";
  }
  const upper = countryCode.toUpperCase();
  const codePoints = [...upper].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}

const FIRST_GLOBAL_FLAG_BASE = "https://results.first.global/static/flags/4x3";

/**
 * Corrections for FIRST Global special-case country codes.
 * The API may return these with underscores where the SVG filename uses hyphens,
 * or without the numeric prefix entirely.
 */
const FIRST_GLOBAL_CODE_CORRECTIONS = {
  // numeric-only fallbacks
  "10": "10_hope",
  "11": "11_south-america",
  "12": "12_oceania",
  "13": "13_north-america",
  "14": "14_europe",
  // underscore variants → hyphenated filenames
  "10_hope": "10_hope",
  "11_south_america": "11_south-america",
  "11_south-america": "11_south-america",
  "12_oceania": "12_oceania",
  "13_north_america": "13_north-america",
  "13_north-america": "13_north-america",
  "14_europe": "14_europe",
  // prefix-less variants
  "hope": "10_hope",
  "south_america": "11_south-america",
  "south-america": "11_south-america",
  "oceania": "12_oceania",
  "north_america": "13_north-america",
  "north-america": "13_north-america",
  "europe": "14_europe",
};

/**
 * Returns the URL for a FIRST Global SVG flag given a countryCode property
 * from the FIRST Global API. Applies corrections for the 5 special regional codes.
 * @param {string} countryCode
 * @returns {string|null} SVG URL, or null if countryCode is falsy
 */
export function getFirstGlobalFlagUrl(countryCode) {
  if (!countryCode) return null;
  const lower = countryCode.toLowerCase();
  const corrected = FIRST_GLOBAL_CODE_CORRECTIONS[lower] ?? lower;
  return `${FIRST_GLOBAL_FLAG_BASE}/${corrected}.svg`;
}
