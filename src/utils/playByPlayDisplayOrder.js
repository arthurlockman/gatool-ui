import { isFtcLayout } from "./programConstants";

/**
 * Match order used by PlayByPlayPage for table rows (same logic, single source of truth).
 * @param {object|false|null} ftcMode
 * @param {boolean} swapScreen
 * @returns {string[]}
 */
export function getPlayByPlayDisplayOrder(ftcMode, swapScreen) {
  const useSixStation = isFtcLayout(ftcMode);
  let displayOrder = useSixStation
    ? ["Blue1", "Red2", "Blue2", "Red1", "Blue3", "Red3"]
    : ["Blue1", "Red3", "Blue2", "Red2", "Blue3", "Red1", "Blue4", "Red4"];
  if (swapScreen === true) {
    displayOrder = useSixStation
      ? ["Red2", "Blue1", "Red1", "Blue2", "Red3", "Blue3"]
      : ["Red3", "Blue1", "Red2", "Blue2", "Red1", "Blue3", "Red4", "Blue4"];
  }
  return displayOrder;
}

/**
 * Field stations for one alliance in the order they appear top-to-bottom on Play-by-Play.
 * @param {"Red"|"Blue"} side
 * @param {object|false|null} ftcMode
 * @param {boolean} swapScreen
 */
export function getFieldStationsInPlayByPlayVisualOrder(side, ftcMode, swapScreen) {
  const max = isFtcLayout(ftcMode) ? 3 : 4;
  const re = side === "Red" ? new RegExp(`^Red[1-${max}]$`) : new RegExp(`^Blue[1-${max}]$`);
  return getPlayByPlayDisplayOrder(ftcMode, swapScreen).filter((st) => re.test(st));
}
