import { RED, BLUE, GREEN, black, semibold } from "./bracketConstants";

/**
 * Renders the full row of finals-series indicators, centered horizontally on `x`.
 *
 * Props
 * ─────
 * x                          – SVG x of the horizontal center of the indicator row
 * y                          – SVG y of the circle centers
 * firstFinalsMatchNumber     – match number that maps to slot 0 (e.g. 6, 10, 14, 16)
 * finalsCount                – number of indicators to draw (0–6); renders nothing if 0
 * indicatorSpacing           – center-to-center distance (SVG units) between adjacent indicators
 * indicatorScale             – uniform scale for circle radius, font size, and text offset
 * getFinalsMatchWinnerForDisplay(matchNumber) → { winner, tieWinner, level } | null
 * getFinalsMatchScoreForDisplay(matchNumber, "red"|"blue") → number | null
 */
function FinalsMatchIndicator({
	x = 0,
	y = 0,
	firstFinalsMatchNumber = 14,
	finalsCount = 0,
	indicatorSpacing = 32,
	indicatorScale = 1,
	getFinalsMatchWinnerForDisplay,
	getFinalsMatchScoreForDisplay,
}) {
	if (finalsCount === 0) return null;

	const r           = 8  * indicatorScale;
	const fontSize    = `${14 * indicatorScale}px`;
	const textOffsetY = 26  * indicatorScale;
	const lineSpacing = 14  * indicatorScale;

	// Center the row of dots on x.
	// slot 0 center = x - (n-1)/2 * spacing, slot n-1 center = x + (n-1)/2 * spacing.
	// Use a single outer <g> translated to (x, y) and offset each slot symmetrically from 0.
	const halfSpan = ((finalsCount - 1) * indicatorSpacing) / 2;

	return (
		<g transform={`translate(${x}, ${y})`}>
			{Array.from({ length: finalsCount }, (_, slot) => {
				const matchNumber    = firstFinalsMatchNumber + slot;
				const slotX          = slot * indicatorSpacing - halfSpan;

				const winner         = getFinalsMatchWinnerForDisplay(matchNumber);
				const winnerColor    = winner?.winner === "red"  ? RED
					: winner?.winner === "blue" ? BLUE
					: winner?.winner === "tie"  ? GREEN
					: "none";
				const redScore       = getFinalsMatchScoreForDisplay(matchNumber, "red");
				const blueScore      = getFinalsMatchScoreForDisplay(matchNumber, "blue");
				const redFontWeight  = winner?.winner === "red"  ? black : semibold;
				const blueFontWeight = winner?.winner === "blue" ? black : semibold;

				return (
					<g key={slot} transform={`translate(${slotX}, 0)`}>
						<circle
							id={`winnerMatch${slot}Dot`}
							fill={winnerColor}
							cx="0" cy="0"
							r={r}
						/>
						<text
							id={`finalsM${slot}Scores`}
							transform={`matrix(1 0 0 1 0 ${textOffsetY})`}
						>
							<tspan
								x="0" y="0"
								fill={RED}
								fontFamily="'myriad-pro'"
								fontWeight={redFontWeight}
								fontStyle="normal"
								fontSize={fontSize}
								textAnchor="middle"
							>
								{redScore}
							</tspan>
							<tspan
								x="0" y={lineSpacing}
								fill={BLUE}
								fontFamily="'myriad-pro'"
								fontWeight={blueFontWeight}
								fontStyle="normal"
								fontSize={fontSize}
								textAnchor="middle"
							>
								{blueScore}
							</tspan>
						</text>
					</g>
				);
			})}
		</g>
	);
}

export default FinalsMatchIndicator;
