import Trophy from "./Trophy";

/**
 * PlayoffMatch component for displaying finals matches
 * Uses relative positioning within a transform group
 */
function PlayoffMatch({
	x = 0,
	y = 0,
	matchNumber,
	onClick = null,
	isCurrentMatch,
	isInFinalsView,
	getAllianceNameForDisplay,
	getAllianceNumbersForDisplay,
	tournamentWinner,
	ftcMode,
	colors = {
		RED: "#FF0000",
		BLUE: "#0000FF",
		GOLD: "#FFCA10",
		BLACK: "#000000",
		WHITE: "#FFFFFF",
	},
	fontWeights = {
		bold: "700",
	},
}) {
	const RED = colors.RED;
	const BLUE = colors.BLUE;
	const GOLD = colors.GOLD;
	const BLACK = colors.BLACK;
	const WHITE = colors.WHITE;
	const bold = fontWeights.bold;

	// Relative coordinates within the playoff match component
	// These are relative to (0,0) at the top-left of the match box
	const redPolygonPoints = "140.7,36.1 24.4,36.1 24.4,0 140.7,0 153.6,18.1";
	const bluePolygonPoints = "140.7,72.5 24.4,72.5 24.4,36.5 140.7,36.5 153.6,54.5";
	const dividerLineX1 = 140.7;
	const dividerLineY = 36.2;
	const dividerLineX2 = 2;
	
	const matchBoxX = 2;
	const matchBoxY = 0;
	const matchBoxWidth = 22.4;
	const matchBoxHeight = 72.5;
	
	// Match label: centered vertically in the match box
	const matchLabelX = matchBoxX + matchBoxWidth / 2; // Center horizontally: 2 + 22.4 / 2 = 13.2
	const matchLabelY = matchBoxHeight / 2; // Center vertically: 72.5 / 2 = 36.25
	
	const allianceTextX = 82;
	const redAllianceTextY = 13.5;
	const blueAllianceTextY = 50.5;

	const isRedWinner = tournamentWinner?.winner === "red";
	const isBlueWinner = tournamentWinner?.winner === "blue";

	return (
		<g id="finals" onClick={onClick} transform={`translate(${x}, ${y})`}>
			<g id="finalsContainer">
				{/* Background path */}
				<path
					id="finalsBackground"
					fill="#C1C1C1"
					stroke="#000000"
					strokeWidth="2"
					strokeMiterlimit="10"
					d="M230.5,158.1H0c-5.5,0-10-4.5-10-10V0c0-5.5,4.5-10,10-10h230.5c5.5,0,10,4.5,10,10v148.1C240.5,153.6,236,158.1,230.5,158.1z"
				/>
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
					fill={(isCurrentMatch || isInFinalsView) ? GOLD : BLACK}
				/>
			{/* Match label (rotated) */}
			<text
				transform={`matrix(0 -1.0059 1 0 ${matchLabelX} ${matchLabelY})`}
				fill={(isCurrentMatch || isInFinalsView) ? BLACK : WHITE}
				fontFamily="'myriad-pro'"
				fontWeight={bold}
				fontStyle="normal"
				fontSize="12.076px"
				textAnchor="middle"
				dominantBaseline="middle"
			>
				{ftcMode ? "FINALS" : "BEST 2 of 3"}
			</text>
			{/* Red alliance name and numbers */}
			<text transform={`matrix(0.9941 0 0 1 ${allianceTextX} ${redAllianceTextY})`} textAnchor="middle">
				<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle="normal" fontSize="12.1471px">
					{getAllianceNameForDisplay(matchNumber, "red") || `Winner of M${matchNumber - 3}`}
				</tspan>
				<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={getAllianceNumbersForDisplay(matchNumber, "red").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle="normal" fontSize="12.1471px">
					{getAllianceNumbersForDisplay(matchNumber, "red")}
				</tspan>
			</text>
			{/* Blue alliance name and numbers */}
			<text transform={`matrix(0.9941 0 0 1 ${allianceTextX} ${blueAllianceTextY})`} textAnchor="middle">
				<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle="normal" fontSize="12.1471px">
					{getAllianceNameForDisplay(matchNumber, "blue") || `Winner of M${matchNumber - 1}`}
				</tspan>
				<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={getAllianceNumbersForDisplay(matchNumber, "blue").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle="normal" fontSize="12.1471px">
					{getAllianceNumbersForDisplay(matchNumber, "blue")}
				</tspan>
			</text>
				<Trophy transform="translate(180.36, 70.79)" />
			</g>
		</g>
	);
}

export default PlayoffMatch;
