/**
 * Match component for displaying a single bracket match
 * Uses relative positioning within a transform group
 */
function Match({
	x = 0,
	y = 0,
	matchNumber,
	onClick,
	isCurrentMatch,
	getMatchLabel,
	getAllianceNameForDisplay,
	getAllianceNumbersForDisplay,
	getMatchWinnerForDisplay,
	getMatchScoreForDisplay,
	redPlaceHolder = "Red Alliance",
	bluePlaceHolder = "Blue Alliance",
	colors = {
		RED: "#FF0000",
		BLUE: "#0000FF",
		GOLD: "#FFCA10",
		GREEN: "#09BA48",
		BLACK: "#000000",
		WHITE: "#FFFFFF",
	},
	fontWeights = {
		bold: "700",
	},
}) {
	const RED = colors?.RED || "#FF0000";
	const BLUE = colors?.BLUE || "#0000FF";
	const GOLD = colors?.GOLD || "#FFCA10";
	const GREEN = colors?.GREEN || "#09BA48";
	const BLACK = colors?.BLACK || "#000000";
	const WHITE = colors?.WHITE || "#FFFFFF";
	const bold = fontWeights?.bold || "700";

	// Relative coordinates within the match component
	// These are relative to (0,0) at the top-left of the match box (x=65, y varies in absolute coordinates)
	const matchBoxX = 0;
	const matchBoxY = 0;
	const matchBoxWidth = 22.43;
	const matchBoxHeight = 72.46;
	
	// Polygon points relative to match box origin
	// Absolute: "223.7,136.56 87.43,136.56 87.43,100.54 223.7,100.54 236.64,118.55"
	// Relative to (65, 100.54): subtract 65 from x, subtract 100.54 from y
	const redPolygonPoints = "158.7,36.02 22.43,36.02 22.43,0 158.7,0 171.64,18.01";
	const bluePolygonPoints = "158.7,72.46 22.43,72.46 22.43,36.45 158.7,36.45 171.64,54.45";
	const dividerLineX1 = 158.7;
	const dividerLineY = 36.21;
	const dividerLineX2 = 0;
	
	// Match label: centered vertically in the match box
	// Container height is 72.46, so center is at 36.23
	// For rotated text, we need to account for the rotation transform
	const matchLabelX = matchBoxWidth / 2; // Center horizontally: 22.43 / 2 = 11.215
	const matchLabelY = matchBoxHeight / 2; // Center vertically: 72.46 / 2 = 36.23
	
	// Alliance text: absolute (145.6, 115.1807) -> relative (80.6, 14.6407)
	const allianceTextX = 80.6;
	const redAllianceTextY = 14.6407;
	const blueAllianceTextY = 51.0821;
	
	// Dots: absolute (237, 118) -> relative (172, 17.46)
	const redDotX = 172;
	const redDotY = 17.46;
	const blueDotX = 172;
	const blueDotY = 54.46;
	
	// Scores: absolute (214, 123.6279) -> relative (149, 23.0879)
	const scoreX = 149;
	const redScoreY = 23.0879;
	const blueScoreY = 59.0879;

	const winner = getMatchWinnerForDisplay(matchNumber);
	const isRedWinner = winner?.winner === "red" || winner?.tieWinner === "red";
	const isBlueWinner = winner?.winner === "blue" || winner?.tieWinner === "blue";
	const isTie = winner?.winner === "tie";

	return (
		<g id={`match${matchNumber}`} onClick={onClick} transform={`translate(${x}, ${y})`}>
			<g>
				{/* Red alliance polygon */}
				<polygon
					fill={RED}
					points={redPolygonPoints}
					stroke={isRedWinner ? GOLD : "none"}
					strokeWidth="5"
				/>
				{/* Blue alliance polygon */}
				<polygon
					fill={BLUE}
					points={bluePolygonPoints}
					stroke={isBlueWinner ? GOLD : "none"}
					strokeWidth="5"
				/>
				{/* Divider line */}
				<line
					fill="none"
					stroke="#FFFFFF"
					strokeMiterlimit="10"
					x1={dividerLineX1}
					y1={dividerLineY}
					x2={dividerLineX2}
					y2={dividerLineY}
				/>
				{/* Match number box */}
				<rect
					x={matchBoxX}
					y={matchBoxY}
					width={matchBoxWidth}
					height={matchBoxHeight}
					fill={isCurrentMatch ? GOLD : BLACK}
				/>
				{/* Match label (rotated) */}
				<text
					transform={`matrix(0 -1.0059 1 0 ${matchLabelX} ${matchLabelY})`}
					fill={isCurrentMatch ? BLACK : WHITE}
					fontFamily="'myriad-pro'"
					fontWeight={bold}
					fontStyle="normal"
					fontSize="12.076px"
					textAnchor="middle"
					dominantBaseline="middle"
				>
					{getMatchLabel(matchNumber)}
				</text>
				{/* Red alliance name and numbers */}
				<text transform={`matrix(0.9941 0 0 1 ${allianceTextX} ${redAllianceTextY})`} textAnchor="middle">
					<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle="normal" fontSize="12.1471px">
						{getAllianceNameForDisplay(matchNumber, "red") || `${redPlaceHolder}`}
					</tspan>
					<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={getAllianceNumbersForDisplay(matchNumber, "red").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle="normal" fontSize="12.1471px">
						{getAllianceNumbersForDisplay(matchNumber, "red")}
					</tspan>
				</text>
				{/* Blue alliance name and numbers */}
				<text transform={`matrix(0.9941 0 0 1 ${allianceTextX} ${blueAllianceTextY})`} textAnchor="middle">
					<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle="normal" fontSize="12.1471px">
						{getAllianceNameForDisplay(matchNumber, "blue") || `${bluePlaceHolder}`}
					</tspan>
					<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={getAllianceNumbersForDisplay(matchNumber, "blue").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle="normal" fontSize="12.1471px">
						{getAllianceNumbersForDisplay(matchNumber, "blue")}
					</tspan>
				</text>
				{/* Winner indicator dots */}
				<circle
					id={`match${matchNumber}RedDot`}
					fill={winner?.winner === "red" ? GOLD : isTie ? GREEN : "none"}
					cx={redDotX}
					cy={redDotY}
					r="8"
				/>
				<circle
					id={`match${matchNumber}BlueDot`}
					fill={winner?.winner === "blue" ? GOLD : isTie ? GREEN : "none"}
					cx={blueDotX}
					cy={blueDotY}
					r="8"
				/>
				{/* Scores */}
				<text
					id={`M${matchNumber}BlueScore`}
					transform={`matrix(1 0 0 1 ${scoreX} ${blueScoreY})`}
					fill="#FFFFFF"
					fontFamily="'myriad-pro'"
					fontWeight={bold}
					fontStyle="normal"
					fontSize="15px"
					textAnchor="middle"
				>
					{getMatchScoreForDisplay(matchNumber, "blue")}
				</text>
				<text
					id={`M${matchNumber}RedScore`}
					transform={`matrix(1 0 0 1 ${scoreX} ${redScoreY})`}
					fill="#FFFFFF"
					fontFamily="'myriad-pro'"
					fontWeight={bold}
					fontStyle="normal"
					fontSize="15px"
					textAnchor="middle"
				>
					{getMatchScoreForDisplay(matchNumber, "red")}
				</text>
			</g>
		</g>
	);
}

export default Match;
