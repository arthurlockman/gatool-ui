/**
 * Match order used by PlayByPlayPage for table rows (same logic, single source of truth).
 * @param {boolean} ftcMode
 * @param {boolean} swapScreen
 * @returns {string[]}
 */
export function getPlayByPlayDisplayOrder(ftcMode, swapScreen) {
  let displayOrder = ftcMode
    ? ["Blue1", "Red2", "Blue2", "Red1", "Blue3", "Red3"]
    : ["Blue1", "Red3", "Blue2", "Red2", "Blue3", "Red1", "Blue4", "Red4"];
  if (swapScreen === true) {
    displayOrder = ftcMode
      ? ["Red2", "Blue1", "Red1", "Blue2", "Red3", "Blue3"]
      : ["Red3", "Blue1", "Red2", "Blue2", "Red1", "Blue3", "Red4", "Blue4"];
  }
  return displayOrder;
}

/**
 * Field stations (1–3) for one alliance in the order they appear top-to-bottom on Play-by-Play.
 * @param {"Red"|"Blue"} side
 * @param {boolean} ftcMode
 * @param {boolean} swapScreen
 */
export function getFieldStationsInPlayByPlayVisualOrder(side, ftcMode, swapScreen) {
  const re = side === "Red" ? /^Red[123]$/ : /^Blue[123]$/;
  return getPlayByPlayDisplayOrder(ftcMode, swapScreen).filter((st) => re.test(st));
}
