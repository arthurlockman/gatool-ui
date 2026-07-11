/**
 * Shared program-mode constants for FTC and FIRST Global.
 */
export const ftcBaseURL = "https://api.gatool.org/ftc/v2/";
export const fgBaseURL = "https://api.gatool.org/v3/firstglobal/";

/**
 * Returns the correct API base URL for the current program mode.
 * - FRC: undefined (uses default gatool API)
 * - FTC: ftcBaseURL
 * - FIRST Global: fgBaseURL
 *
 * @param {object|false|null} ftcMode — the ftcMode value from EventSelectionContext
 * @returns {string|undefined}
 */
export function getApiBaseUrl(ftcMode) {
  if (!ftcMode) return undefined;
  if (ftcMode.value === "FIRSTGlobal") return fgBaseURL;
  return ftcBaseURL;
}

/**
 * Returns true if the current mode is FIRST Global.
 * @param {object|false|null} ftcMode
 * @returns {boolean}
 */
export function isFirstGlobalMode(ftcMode) {
  return ftcMode?.value === "FIRSTGlobal";
}

/**
 * Returns the correct API base URL for team community updates (get/put).
 * FG team updates live on the FTC API, not the FG API.
 *
 * @param {object|false|null} ftcMode
 * @returns {string|undefined}
 */
export function getTeamUpdatesBaseUrl(ftcMode) {
  if (!ftcMode) return undefined;
  // Both FTC and FG team updates use the FTC base URL
  return ftcBaseURL;
}

/**
 * Returns true when the current mode uses FTC-style layout conventions
 * (3v3 matches, 2-team alliance selection rounds, FTC bracket variants, etc.).
 *
 * FIRST Global uses FRC-style layout (3v3 quals but 4v4 playoffs, same bracket
 * format, same station display order) so it returns false here.
 *
 * Use this for **UI/layout** decisions. For **data-fetching** decisions
 * (API base URL, endpoint paths), use getApiBaseUrl / isFirstGlobalMode instead.
 *
 * @param {object|false|null} ftcMode
 * @returns {boolean}
 */
export function isFtcLayout(ftcMode) {
  return !!ftcMode && ftcMode.value !== "FIRSTGlobal";
}
