/**
 * FinalsMatchIndicator component for displaying individual match indicators in finals
 * Shows a circle and scores for each match in the finals series
 */
function FinalsMatchIndicator({
	x = 0,
	y = 0,
	matchNumber,
	getFinalsMatchWinnerForDisplay,
	getFinalsMatchScoreForDisplay,
	overtimeOffset = 0,
	colors = {
		RED: "#FF0000",
		BLUE: "#0000FF",
		GOLD: "#FFCA10",
		GREEN: "#09BA48",
	},
	fontWeights = {
		black: "900",
		semibold: "600",
	},
}) {
	const RED = colors.RED;
	const BLUE = colors.BLUE;
	const GREEN = colors.GREEN;
	const black = fontWeights.black;
	const semibold = fontWeights.semibold;

	const winner = getFinalsMatchWinnerForDisplay(matchNumber);
	const winnerColor = winner?.winner === "red" ? RED : winner?.winner === "blue" ? BLUE : winner?.winner === "tie" ? GREEN : "none";
	const redScore = getFinalsMatchScoreForDisplay(matchNumber, "red");
	const blueScore = getFinalsMatchScoreForDisplay(matchNumber, "blue");
	const redFontWeight = winner?.winner === "red" ? black : semibold;
	const blueFontWeight = winner?.winner === "blue" ? black : semibold;

	return (
		<g transform={`translate(${x - overtimeOffset}, ${y})`}>
			<circle
				id={`winnerMatch${matchNumber - 9}Dot`}
				fill={winnerColor}
				cx="0"
				cy="0"
				r="8"
			/>
			<text id={`finalsM${matchNumber - 9}Scores`} transform="matrix(1 0 0 1 0 26)">
				<tspan
					x="0"
					y="0"
					fill={RED}
					fontFamily="'myriad-pro'"
					fontWeight={redFontWeight}
					fontStyle="normal"
					fontSize="14px"
					textAnchor="middle"
				>
					{redScore}
				</tspan>
				<tspan
					x="0"
					y="14"
					fill={BLUE}
					fontFamily="'myriad-pro'"
					fontWeight={blueFontWeight}
					fontStyle="normal"
					fontSize="14px"
					textAnchor="middle"
				>
					{blueScore}
				</tspan>
			</text>
		</g>
	);
}

export default FinalsMatchIndicator;
