/**
 * PlayoffMatch component for displaying finals matches
 * Uses relative positioning within a transform group
 */
function PlayoffMatch({
	x = 0,
	y = 0,
	matchNumber,
	onClick,
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
				{/* Trophy icon - positioned relative to background origin */}
				{/* Original absolute coords: x=1204.36, y=414.19. Background origin: x=1024, y=343.4 */}
				{/* Relative: x=180.36, y=70.79 */}
				<g id="trophy" transform="translate(180.36, 70.79)">
					{/* Base rects - relative to trophy origin (1204.36, 414.19) */}
					<rect x="0" y="0" fill="#474E5D" width="26.51" height="1.66" />
					<rect x="3.32" y="0" fill="#606776" width="1.66" height="1.66" />
					<rect x="21.55" y="0" fill="#2E3544" width="4.97" height="1.66" />
					<rect x="1.66" y="-9.94" fill="#474E5D" width="23.2" height="9.94" />
					<rect x="4.98" y="-9.94" fill="#606776" width="1.66" height="9.94" />
					<rect x="19.89" y="-9.94" fill="#2E3544" width="4.97" height="9.94" />
					{/* Trophy paths - converted from absolute to relative coordinates */}
					{/* Original: M1219.28,390.16 -> Relative: (1219.28-1204.36, 390.16-414.19) = (14.92, -24.03) */}
					<path fill="#FFCA10" d="M14.92,-24.03c0,6.11,3.9,11.31,9.35,13.26l0.6,0.83h-23.2l0.59-0.83c5.45-1.94,9.35-7.14,9.35-13.26H14.92z"/>
					<path fill="#FEE79B" d="M12.43,-24.03h-0.41c0,6.12-2.93,11.31-7.01,13.26l-0.44,0.83h2.9l0.3-0.83C10.48,-12.72,12.43,-17.91,12.43,-24.03z"/>
					<path fill="#FFA200" d="M24.26,-10.77c-5.45-1.95-9.35-7.14-9.35-13.26h-0.83c0,6.11,1.95,11.31,4.67,13.26l0.3,0.83h5.8L24.26,-10.77z"/>
					{/* Original uses two subpaths: outer cup with handles, then inner decoration */}
					{/* Using corrected coordinates matching fourAllianceBracket.svg style */}
					<path fill="#FFCA10" d="M-9.94,-48.06c0,11.89,10.39,21.54,23.2,21.54s23.2-9.65,23.2-21.54h-46.4Zm23.2,19.06c-10.51,0-19.21-7.23-20.54-16.57h41.08c-1.32,9.34-10.03,16.57-20.53,16.57Z"/>
					{/* Original: M1232.54,362.82 -> Relative: (1232.54-1204.36, 362.82-414.19) = (28.18, -51.37) */}
					<path fill="#FFCA10" d="M28.18,-51.37h-29.83c0,15.56,6.68,28.17,14.91,28.17S28.18,-35.81,28.18,-51.37z" />
					<path fill="#FFA200" d="M20.72,-51.37c0,15.56-3.34,28.17-7.46,28.17c8.24,0,14.91-12.61,14.91-28.17H20.72z" />
					<path fill="#FEE79B" d="M4.25,-51.37h-2.18c0,15.56,5.01,28.17,11.19,28.17C9.28,-23.2,4.25,-35.81,4.25,-51.37z" />
				</g>
			</g>
		</g>
	);
}

export default PlayoffMatch;
