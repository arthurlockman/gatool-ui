// Shared color and font weight constants for all bracket components

// Ball colors
export const GOLD = "#FFCA10";
export const RED = "#FF0000";
export const BLUE = "#0000FF";
export const GREEN = "#09BA48";
export const BLACK = "#000000";
export const WHITE = "#FFFFFF";

// Font weights
export const black = "900";
export const bold = "700";
export const semibold = "600";
//export const normal = "400";

// PlayoffMatch.jsx `finalsBackground` path — horizontal extent (native coords; PlayoffMatch origin top-left of translate group)
export const PLAYOFF_MATCH_GRAY_BOX_MIN_X = -10;
export const PLAYOFF_MATCH_GRAY_BOX_MAX_X = 240.5;
/** Center of the full gray finals container (not the trophy or score column). */
export const PLAYOFF_MATCH_GRAY_BOX_CENTER_X =
	(PLAYOFF_MATCH_GRAY_BOX_MIN_X + PLAYOFF_MATCH_GRAY_BOX_MAX_X) / 2;

// Scaling factors
export const INDICATOR_SCALE = 1.2;
export const INDICATOR_SPACING = 35;
