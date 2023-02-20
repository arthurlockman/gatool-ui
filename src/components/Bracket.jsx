import _ from "lodash";
function Bracket({ selectedEvent, playoffSchedule, alliances }) {
	//Ball colors
	const GOLD = "#FFCA10";
	const RED = "#FF0000";
	const BLUE = "#0000FF";
	const GREEN = "#09BA48";
	//font weights
	const black = "900";
	const bold = "700";
	const semibold = "600";
	//const normal = "400";

	var matches = playoffSchedule.schedule;

	//returns the three members of an alliance based on the match data.
	function allianceNumbers(matchNumber, allianceColor) {
		var alliance = "TBD";
		var allianceName = "";
		var allianceMembers = [];
		var allianceNumber = 0;
		var targetAlliance = {};
		var match = matches[_.findIndex(matches, { "matchNumber": matchNumber })];
		if (match?.teams[0]?.teamNumber) {
			targetAlliance = alliances?.Lookup[`${match?.teams[0]?.teamNumber}`];
			allianceName = targetAlliance?.alliance;
			allianceNumber = targetAlliance?.number;
			allianceMembers = _.compact([targetAlliance?.captain, targetAlliance?.round1, targetAlliance?.round2, targetAlliance?.round3, targetAlliance?.backup]);
			alliance = allianceMembers.join("  ");
			if (allianceColor === "blue") {
				targetAlliance = alliances?.Lookup[`${match?.teams[3]?.teamNumber}`]
				allianceName = targetAlliance?.alliance;
				allianceNumber = targetAlliance?.number;
				allianceMembers = _.compact([targetAlliance?.captain, targetAlliance?.round1, targetAlliance?.round2, targetAlliance?.round3, targetAlliance?.backup]);
				alliance = allianceMembers.join("  ");
			}
		}
		//todo: layer in fourth member for new playoff modes
		return alliance;
	}

	// returns the name of the alliance
	function allianceName(matchNumber, allianceColor) {
		var allianceName = "";
		if (matches[_.findIndex(matches, { "matchNumber": matchNumber })]?.teams[0]?.teamNumber) {
			allianceName = alliances?.Lookup[`${matches[_.findIndex(matches, { "matchNumber": matchNumber })]?.teams[0]?.teamNumber}`]?.alliance;
			if (matches[_.findIndex(matches, { "matchNumber": matchNumber })]?.winner.tieWinner === "red") {
				allianceName += ` (L${matches[_.findIndex(matches, { "matchNumber": matchNumber })]?.winner.level})`;
			}
			if (allianceColor === "blue") {
				allianceName = alliances?.Lookup[`${matches[_.findIndex(matches, { "matchNumber": matchNumber })]?.teams[3]?.teamNumber}`]?.alliance
				if (matches[_.findIndex(matches, { "matchNumber": matchNumber })]?.winner.tieWinner === "blue") {
					allianceName += ` (L${matches[_.findIndex(matches, { "matchNumber": matchNumber })]?.winner.level} WIN)`;
				}
			}
		}
		return allianceName;
	}
	var overtimeOffset = 0;
	if (matches[17]?.postResultTime) {
		overtimeOffset = -20;
	} else if (matches[16]?.postResultTime) {
		overtimeOffset = -40;
	}

	return (
		<div>
			{/* <?xml version="1.0" encoding="utf-8"?> */}
			{/* <!-- Generator: Adobe Illustrator 27.1.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  --> */}
			<svg version="1.1" id="bracket" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
				viewBox="0 0 1280 810" enableBackground="new 0 0 1280 810" xmlSpace="preserve">
				<g id="background">
					<g>
						<rect x="1" fill="#FFFFFF" width="1279" height="810" />
					</g>
					<rect x="1091" y="89" fill="#DBDAD9" width="75" height="684" />
					<rect x="862" y="89" fill="#DBDAD9" width="75" height="684" />
					<rect x="677" y="89" fill="#DBDAD9" width="75" height="684" />
					<rect x="109" y="89" fill="#DBDAD9" width="75" height="684" />
					<rect x="302" y="89" fill="#DBDAD9" width="75" height="684" />
					<rect x="490" y="89" fill="#DBDAD9" width="75" height="684" />
					<polyline fill="none" stroke="#000000" strokeWidth="2" strokeMiterlimit="10" points="242.02,175.06 430.85,175.06 
		430.85,328.12 242.62,328.12 	"/>
					<polyline fill="none" stroke="#000000" strokeWidth="2" strokeMiterlimit="10" points="186.26,136.56 242.54,136.56 
		242.54,213.56 199.05,213.56 	"/>
					<polyline fill="none" stroke="#000000" strokeWidth="2" strokeMiterlimit="10" points="186.26,291.56 242.54,291.56 
		242.54,368.56 199.05,368.56 	"/>
					<polyline fill="none" stroke="#000000" strokeWidth="2" strokeMiterlimit="10" points="431,254 1006,254 1006,504.12 
		816.83,504.12 816.83,574.12 630,574.12 	"/>
					<polyline fill="none" stroke="#000000" strokeWidth="2" strokeMiterlimit="10" points="388.1,721.12 436.71,721.12 
		436.71,647.99 629.72,647.99 629.72,508.99 436.71,508.99 436.71,567.12 364.94,567.12 	"/>
					<line fill="none" stroke="#000000" strokeWidth="2" strokeMiterlimit="10" x1="1024" y1="421" x2="1006" y2="421" />
					<line fill="none" stroke="#8E8E8E" strokeWidth="2" strokeMiterlimit="10" x1="70" y1="419" x2="971" y2="419" />
					<text transform="matrix(0 -1 1 0 49.7114 348.6689)" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="26px">UPPER BRACKET</text>
					<text transform="matrix(0 -1 1 0 49.7114 673.2046)" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="26px">LOWER BRACKET</text>
					<text transform="matrix(1 0 0 1 116.6694 84.2646)" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="16px">ROUND 1</text>
					<text transform="matrix(1 0 0 1 306.6694 84.2646)" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="16px">ROUND 2</text>
					<text transform="matrix(1 0 0 1 494.6694 84.2646)" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="16px">ROUND 3</text>
					<text transform="matrix(1 0 0 1 682.6694 84.2646)" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="16px">ROUND 4</text>
					<text transform="matrix(1 0 0 1 869.6694 84.2646)" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="16px">ROUND 5</text>
					<text transform="matrix(1 0 0 1 1106.0776 84.2646)" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="16px">FINALS</text>
					<text id="playoffBracket" transform="matrix(1 0 0 1 620 47.6909)" dominantBaseline="middle" textAnchor="middle" fontFamily={selectedEvent?.label.length > 50 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={black} fontStyle={"normal"} fontSize="38px">{selectedEvent?.label}</text>
				</g>
				<g id="finals">
					<g id="finalsContainer">
					<path id="finalsBackground" fill="#C1C1C1" stroke="#000000" strokeWidth="2" strokeMiterlimit="10" d="M1254.5,511.6H1024c-5.5,0-10-4.5-10-10V343.4c0-5.5,4.5-10,10-10h230.5
		c5.5,0,10,4.5,10,10v158.1C1264.5,507.1,1260,511.6,1254.5,511.6z"/>
						<polygon fill={RED} points="1164.7,389.6 1048.4,389.6 1048.4,353.5 1164.7,353.5 1177.6,371.6" />
						<polygon fill={BLUE} points="1164.7,426 1048.4,426 1048.4,390 1164.7,390 1177.6,408" />
						<line fill="none" stroke="#FFFFFF" strokeMiterlimit="10" x1="1164.7" y1="389.7" x2="1026" y2="389.7" />
						<rect x="1026" y="353.5" width="22.4" height="72.5"/>
						<text transform="matrix(0 -1.0059 1 0 1041.7773 418.6328)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.076px">BEST 2 of 3</text>
						<text transform="matrix(0.9941 0 0 1 1106 367)" textAnchor="middle">
							<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(14, "red") ? allianceName(14, "red") : "Winner of M11"}</tspan>
							<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(14, "red").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(14, "red")}</tspan></text>
						<text transform="matrix(0.9941 0 0 1 1106 404)" textAnchor="middle">
							<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(14, "blue") ? allianceName(14, "blue") : "Winner of M13"}</tspan>
							<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(14, "blue").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(14, "blue")}</tspan></text>
					</g>
					<g id="trophy">
						<rect x="1204.36" y="414.19" fill="#474E5D" width="26.51" height="1.66" />
						<rect x="1207.68" y="414.19" fill="#606776" width="1.66" height="1.66" />
						<rect x="1225.91" y="414.19" fill="#2E3544" width="4.97" height="1.66" />
						<rect x="1206.02" y="404.25" fill="#474E5D" width="23.2" height="9.94" />
						<rect x="1209.34" y="404.25" fill="#606776" width="1.66" height="9.94" />
						<rect x="1224.25" y="404.25" fill="#2E3544" width="4.97" height="9.94" />
						<path fill="#FFCA10" d="M1219.28,390.16c0,6.11,3.9,11.31,9.35,13.26l0.6,0.83h-23.2l0.59-0.83c5.45-1.94,9.35-7.14,9.35-13.26
			H1219.28z"/>
						<path fill="#FEE79B" d="M1216.79,390.16h-0.41c0,6.12-2.93,11.31-7.01,13.26l-0.44,0.83h2.9l0.3-0.83
			C1214.84,401.47,1216.79,396.28,1216.79,390.16z"/>
						<path fill="#FFA200" d="M1228.62,403.42c-5.45-1.95-9.35-7.14-9.35-13.26h-0.83c0,6.11,1.95,11.31,4.67,13.26l0.3,0.83h5.8
			L1228.62,403.42z"/>
						<path fill="#FFCA10" d="M1194.42,366.13c0,11.89,10.39,21.54,23.2,21.54c12.81,0,23.2-9.65,23.2-21.54H1194.42z M1217.62,385.19
			c-10.51,0-19.21-7.23-20.54-16.57h41.08C1236.84,377.96,1228.13,385.19,1217.62,385.19z"/>
						<path fill="#FFCA10" d="M1232.54,362.82h-29.83c0,15.56,6.68,28.17,14.91,28.17S1232.54,378.38,1232.54,362.82z" />
						<path fill="#FFA200" d="M1225.08,362.82c0,15.56-3.34,28.17-7.46,28.17c8.24,0,14.91-12.61,14.91-28.17H1225.08z" />
						<path fill="#FEE79B" d="M1208.61,362.82h-2.18c0,15.56,5.01,28.17,11.19,28.17C1212.64,390.99,1208.61,378.38,1208.61,362.82z" />
					</g>
					
					
					
					
					<circle id="winnerMatch1Dot" fill={(matches[13]?.winner.winner === "red") ? RED : (matches[13]?.winner.winner === "blue") ? BLUE : (matches[13]?.winner.winner === "tie") ? GREEN : "none"} cx="1080" cy="451" r="8" />
					<text id="finalsM1Scores"
						transform="matrix(1 0 0 1 1080 477.5537)">
						<tspan x="0" y="0" fill={RED} fontFamily="'myriad-pro'"
							fontWeight={(matches[13]?.winner.winner === "red") ? black : semibold}
							fontStyle={"normal"}
							fontSize="14px" textAnchor="middle">{matches[13]?.scoreRedFinal}</tspan>
						<tspan x="0" y="14" fill={BLUE} fontFamily="'myriad-pro'"
							fontWeight={(matches[13]?.winner.winner === "blue") ? black : semibold}
							fontStyle={"normal"}
							fontSize="14px" textAnchor="middle">{matches[13]?.scoreBlueFinal}</tspan>
					</text>

					<circle id="winnerMatch2Dot" fill={(matches[14]?.winner.winner === "red") ? RED : (matches[14]?.winner.winner === "blue") ? BLUE : (matches[14]?.winner.winner === "tie") ? GREEN : "none"} cx="1110" cy="451" r="8" />
					<text id="finalsM2Scores" transform="matrix(1 0 0 1 1110 477.5537)">
						<tspan x="0" y="0"
							fill={RED}
							fontFamily="'myriad-pro'"
							fontWeight={(matches[14]?.winner.winner === "red") ? black : semibold}
							fontStyle={"normal"}
							fontSize="14px" textAnchor="middle">{matches[14]?.scoreRedFinal}</tspan>
						<tspan x="0" y="14" fill={BLUE}
							fontFamily="'myriad-pro'"
							fontWeight={(matches[14]?.winner.winner === "blue") ? black : semibold}
							fontStyle={"normal"}
							fontSize="14px" textAnchor="middle">{matches[14]?.scoreBlueFinal}</tspan>
					</text>

					<circle id="winnerMatch3Dot" fill={(matches[15]?.winner.winner === "red") ? RED : (matches[15]?.winner.winner === "blue") ? BLUE : (matches[15]?.winner.winner === "tie") ? GREEN : "none"} cx="1140" cy="451" r="8" />
					<text id="finalsM3Scores"
						transform="matrix(1 0 0 1 1140 477.5537)">
						<tspan x="0" y="0"
							fill={RED}
							fontFamily="'myriad-pro'"
							fontWeight={(matches[15]?.winner.winner === "red") ? black : semibold}
							fontStyle={"normal"}
							fontSize="14px" textAnchor="middle">{matches[15]?.scoreRedFinal}</tspan>
						<tspan x="0" y="14" fill={BLUE}
							fontFamily="'myriad-pro'"
							fontWeight={(matches[15]?.winner.winner === "blue") ? black : semibold}
							fontStyle={"normal"}
							fontSize="14px" textAnchor="middle">{matches[15]?.scoreBlueFinal}</tspan>
					</text>

					<circle id="winnerMatch4Dot" fill={(matches[16]?.winner.winner === "red") ? RED : (matches[16]?.winner.winner === "blue") ? BLUE : (matches[16]?.winner.winner === "tie") ? GREEN : "none"} cx="1170" cy="451" r="8" />
					<text id="finalsM4Scores"
						transform="matrix(1 0 0 1 1170 477.5537)">
						<tspan x="0" y="0"
							fill={RED}
							fontFamily="'myriad-pro'"
							fontWeight={(matches[16]?.winner.winner === "red") ? black : semibold}
							fontStyle={"normal"}
							fontSize="14px" textAnchor="middle">{matches[16]?.scoreRedFinal}</tspan>
						<tspan x="0" y="14" fill={BLUE}
							fontFamily="'myriad-pro'"
							fontWeight={(matches[16]?.winner.winner === "blue") ? black : semibold}
							fontStyle={"normal"}
							fontSize="14px" textAnchor="middle">{matches[16]?.scoreBlueFinal}</tspan>
					</text>

					<circle id="winnerMatch5Dot" fill={(matches[17]?.winner.winner === "red") ? RED : (matches[17]?.winner.winner === "blue") ? BLUE : (matches[17]?.winner.winner === "tie") ? GREEN : "none"} cx="1200" cy="451" r="8" />
					<text id="finalsM5Scores"
						transform="matrix(1 0 0 1 1200 477.5537)">
						<tspan x="0" y="0"
							fill={RED}
							fontFamily="'myriad-pro'"
							fontWeight={(matches[17]?.winner.winner === "red") ? black : semibold}
							fontStyle={"normal"}
							fontSize="14px" textAnchor="middle">{matches[17]?.scoreRedFinal}</tspan>
						<tspan x="0" y="14" fill={BLUE}
							fontFamily="'myriad-pro'"
							fontWeight={(matches[17]?.winner.winner === "blue") ? black : semibold}
							fontStyle={"normal"}
							fontSize="14px" textAnchor="middle">{matches[17]?.scoreBlueFinal}</tspan>
					</text>
				</g>
				

				<g id="match13">
					<g>
						<polygon fill={RED} points="984.7,504.56 848.43,504.56 848.43,468.54 984.7,468.54 997.64,486.55 		" stroke={(matches[12]?.winner.winner === "red" || matches[12]?.winner.tieWinner === "red") ? GOLD : "none"} strokeWidth="5" />
						<polygon fill={BLUE} points="984.7,541 848.43,541 848.43,504.99 984.7,504.99 997.64,522.99 		" stroke={(matches[12]?.winner.winner === "blue" || matches[12]?.winner.tieWinner === "blue") ? GOLD : "none"} strokeWidth="5" />
						<line fill="none" stroke="#FFFFFF" strokeMiterlimit="10" x1="984.7" y1="504.75" x2="826" y2="504.75" />
						<rect x="826" y="468.54" width="22.43" height="72.46" />
						<text transform="matrix(0 -1.0059 1 0 841.7773 532.333)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.076px">MATCH 13</text>
						<text transform="matrix(0.9941 0 0 1 906.5 483.1807)" textAnchor="middle">
							<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(13, "red") ? allianceName(13, "red") : "Losing Alliance of M11"}</tspan>
							<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(13, "red").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(13, "red")}</tspan></text>
						<text transform="matrix(0.9941 0 0 1 906.5 519.6221)" textAnchor="middle">
							<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(13, "blue") ? allianceName(13, "blue") : "Winner of M12"}</tspan>
							<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(13, "blue").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(13, "blue")}</tspan></text>
						<circle id="match13RedDot" fill={(matches[12]?.winner.winner === "red") ? GOLD : ((matches[12]?.winner.winner === "tie") ? GREEN : "none")} cx="993" cy="483" r="8" />
						<circle id="match13BlueDot" fill={(matches[12]?.winner.winner === "blue") ? GOLD : ((matches[12]?.winner.winner === "tie") ? GREEN : "none")} cx="993" cy="520" r="8" />

						<text id="M13BlueScore" transform="matrix(1 0 0 1 972 525.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matches[12]?.scoreBlueFinal}</text>

						<text id="M13RedScore" transform="matrix(1 0 0 1 972 489.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matches[12]?.scoreRedFinal}</text>
					</g>
				</g>
				<g id="match12">
					<g>
						<polygon fill={RED} points="802.7,574.56 666.43,574.56 666.43,538.54 802.7,538.54 815.64,556.55 		" stroke={(matches[11]?.winner.winner === "red" || matches[11]?.winner.tieWinner === "red") ? GOLD : "none"} strokeWidth="5" />
						<polygon fill={BLUE} points="802.7,611 666.43,611 666.43,574.99 802.7,574.99 815.64,592.99 		" stroke={(matches[11]?.winner.winner === "blue" || matches[11]?.winner.tieWinner === "blue") ? GOLD : "none"} strokeWidth="5" />
						<line fill="none" stroke="#FFFFFF" strokeMiterlimit="10" x1="802.7" y1="574.75" x2="644" y2="574.75" />
						<rect x="644" y="538.54" width="22.43" height="72.46" />
						<text transform="matrix(0 -1.0059 1 0 659.7773 602.333)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.076px">MATCH 12</text>
						<text transform="matrix(0.9941 0 0 1 725 553.1807)" textAnchor="middle">
							<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(12, "red") ? allianceName(12, "red") : "Winner of M10"}</tspan>
							<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(12, "red").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(12, "red")}</tspan></text>
						<text transform="matrix(0.9941 0 0 1 725 589.6221)" textAnchor="middle">
							<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(12, "blue") ? allianceName(12, "blue") : "Winner of M9"}</tspan>
							<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(12, "blue").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(12, "blue")}</tspan></text>
						<circle id="match12RedDot" fill={(matches[11]?.winner.winner === "red") ? GOLD : ((matches[11]?.winner.winner === "tie") ? GREEN : "none")} cx="814" cy="556" r="8" />
						<circle id="match12BlueDot" fill={(matches[11]?.winner.winner === "blue") ? GOLD : ((matches[11]?.winner.winner === "tie") ? GREEN : "none")} cx="814" cy="593" r="8" />

						<text id="M12BlueScore" transform="matrix(1 0 0 1 792 595.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matches[11]?.scoreBlueFinal}</text>

						<text id="M12RedScore" transform="matrix(1 0 0 1 792 559.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matches[11]?.scoreRedFinal}</text>
					</g>
				</g>
				<g id="match11">
					<g>
						<polygon fill={RED} points="802.7,254.56 666.43,254.56 666.43,218.54 802.7,218.54 815.64,236.55 		" stroke={(matches[10]?.winner.winner === "red" || matches[10]?.winner.tieWinner === "red") ? GOLD : "none"} strokeWidth="5" />
						<polygon fill={BLUE} points="802.7,291 666.43,291 666.43,254.99 802.7,254.99 815.64,272.99 		" stroke={(matches[10]?.winner.winner === "blue" || matches[10]?.winner.tieWinner === "blue") ? GOLD : "none"} strokeWidth="5" />
						<line fill="none" stroke="#FFFFFF" strokeMiterlimit="10" x1="802.7" y1="254.75" x2="644" y2="254.75" />
						<rect x="644" y="218.54" width="22.43" height="72.46" />
						<text transform="matrix(0 -1.0059 1 0 659.7764 282.332)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.076px">MATCH 11</text>
						<text transform="matrix(0.9941 0 0 1 725 233.1807)" textAnchor="middle">
							<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(11, "red") ? allianceName(11, "red") : "Winner of M7"}</tspan>
							<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(11, "red").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(11, "red")}</tspan></text>
						<text transform="matrix(0.9941 0 0 1 725 269.6221)" textAnchor="middle">
							<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(11, "blue") ? allianceName(11, "blue") : "Winner of M8"}</tspan>
							<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(11, "blue").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(11, "blue")}</tspan></text>
						<circle id="match11RedDot" fill={(matches[10]?.winner.winner === "red") ? GOLD : ((matches[10]?.winner.winner === "tie") ? GREEN : "none")} cx="814" cy="236" r="8" />
						<circle id="match11BlueDot" fill={(matches[10]?.winner.winner === "blue") ? GOLD : ((matches[10]?.winner.winner === "tie") ? GREEN : "none")} cx="814" cy="273" r="8" />

						<text id="M11BlueScore" transform="matrix(1 0 0 1 792 277.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matches[10]?.scoreBlueFinal}</text>

						<text id="M11RedScore" transform="matrix(1 0 0 1 792 241.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matches[10]?.scoreRedFinal}</text>
					</g>
				</g>
				<g id="match10">
					<g>
						<polygon fill={RED} points="611.7,508.56 475.43,508.56 475.43,472.54 611.7,472.54 624.64,490.55 		" stroke={(matches[9]?.winner.winner === "red" || matches[9]?.winner.tieWinner === "red") ? GOLD : "none"} strokeWidth="5" />
						<polygon fill={BLUE} points="611.7,545 475.43,545 475.43,508.99 611.7,508.99 624.64,526.99 		" stroke={(matches[9]?.winner.winner === "blue" || matches[9]?.winner.tieWinner === "blue") ? GOLD : "none"} strokeWidth="5" />
						<line fill="none" stroke="#FFFFFF" strokeMiterlimit="10" x1="611.7" y1="508.75" x2="453" y2="508.75" />
						<rect x="453" y="472.54" width="22.43" height="72.46" />
						<text transform="matrix(0 -1.0059 1 0 468.7769 536.333)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.076px">MATCH 10</text>
						<text transform="matrix(0.9941 0 0 1 533 487.1807)" textAnchor="middle">
							<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(10, "red") ? allianceName(10, "red") : "Losing Alliance of M8"}</tspan>
							<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(10, "red").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(10, "red")}</tspan></text>
						<text transform="matrix(0.9941 0 0 1 533 523.6221)" textAnchor="middle">
							<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(10, "blue") ? allianceName(10, "blue") : "Winner of M5"}</tspan>
							<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(10, "blue").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(10, "blue")}</tspan></text>
						<circle id="match10RedDot" fill={(matches[9]?.winner.winner === "red") ? GOLD : ((matches[9]?.winner.winner === "tie") ? GREEN : "none")} cx="623" cy="490" r="8" />
						<circle id="match10BlueDot" fill={(matches[9]?.winner.winner === "blue") ? GOLD : ((matches[9]?.winner.winner === "tie") ? GREEN : "none")} cx="623" cy="527" r="8" />

						<text id="M10BlueScore" transform="matrix(1 0 0 1 599 532.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matches[9]?.scoreBlueFinal}</text>

						<text id="M10RedScore" transform="matrix(1 0 0 1 599 496.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matches[9]?.scoreRedFinal}</text>
					</g>
				</g>
				<g id="match9">
					<g>
						<polygon fill={RED} points="611.7,647.56 475.43,647.56 475.43,611.54 611.7,611.54 624.64,629.55 		" stroke={(matches[8]?.winner.winner === "red" || matches[8]?.winner.tieWinner === "red") ? GOLD : "none"} strokeWidth="5" />
						<polygon fill={BLUE} points="611.7,684 475.43,684 475.43,647.99 611.7,647.99 624.64,665.99 		" stroke={(matches[8]?.winner.winner === "blue" || matches[8]?.winner.tieWinner === "blue") ? GOLD : "none"} strokeWidth="5" />
						<line fill="none" stroke="#FFFFFF" strokeMiterlimit="10" x1="611.7" y1="647.75" x2="453" y2="647.75" />
						<rect x="453" y="611.54" width="22.43" height="72.46" />
						<text transform="matrix(0 -1.0059 1 0 468.7773 671.9619)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.076px">MATCH 9</text>
						<text transform="matrix(0.9941 0 0 1 533 626.1807)" textAnchor="middle">
							<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(9, "red") ? allianceName(9, "red") : "Losing Alliance of M7"}</tspan>
							<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(9, "red").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(9, "red")}</tspan></text>
						<text transform="matrix(0.9941 0 0 1 533 662.6221)" textAnchor="middle">
							<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(9, "blue") ? allianceName(9, "blue") : "Winner of M6"}</tspan>
							<tspan x="-0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(9, "blue").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(9, "blue")}</tspan></text>
						<circle id="match9RedDot" fill={(matches[8]?.winner.winner === "red") ? GOLD : ((matches[8]?.winner.winner === "tie") ? GREEN : "none")} cx="623" cy="629" r="8" />
						<circle id="match9BlueDot" fill={(matches[8]?.winner.winner === "blue") ? GOLD : ((matches[8]?.winner.winner === "tie") ? GREEN : "none")} cx="623" cy="666" r="8" />

						<text id="M9BlueScore" transform="matrix(1 0 0 1 599 669.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matches[8]?.scoreBlueFinal}</text>

						<text id="M9RedScore" transform="matrix(1 0 0 1 599 633.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matches[8]?.scoreRedFinal}</text>
					</g>
				</g>
				<g id="match8">
					<g>
						<polygon fill={RED} points="412.7,328.56 276.43,328.56 276.43,292.54 412.7,292.54 425.64,310.55 		" stroke={(matches[7]?.winner.winner === "red" || matches[7]?.winner.tieWinner === "red") ? GOLD : "none"} strokeWidth="5" />
						<polygon fill={BLUE} points="412.7,365 276.43,365 276.43,328.99 412.7,328.99 425.64,346.99 		" stroke={(matches[7]?.winner.winner === "blue" || matches[7]?.winner.tieWinner === "blue") ? GOLD : "none"} strokeWidth="5" />
						<line fill="none" stroke="#FFFFFF" strokeMiterlimit="10" x1="412.7" y1="328.75" x2="254" y2="328.75" />
						<rect x="254" y="292.54" width="22.43" height="72.46" />
						<text transform="matrix(0 -1.0059 1 0 269.7769 352.9624)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.076px">MATCH 8</text>
						<text transform="matrix(0.9941 0 0 1 334.6 307.1807)" textAnchor="middle">
							<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(8, "red") ? allianceName(8, "red") : "Winner of M3"}</tspan>
							<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(8, "red").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(8, "red")}</tspan></text>
						<text transform="matrix(0.9941 0 0 1 334.6 343.6221)" textAnchor="middle">
							<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(8, "blue") ? allianceName(8, "blue") : "Winner of M4"}</tspan>
							<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(8, "blue").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(8, "blue")}</tspan></text>
						<circle id="match8RedDot" fill={(matches[7]?.winner.winner === "red") ? GOLD : ((matches[7]?.winner.winner === "tie") ? GREEN : "none")} cx="426" cy="309" r="8" />
						<circle id="match8BlueDot" fill={(matches[7]?.winner.winner === "blue") ? GOLD : ((matches[7]?.winner.winner === "tie") ? GREEN : "none")} cx="426" cy="346" r="8" />

						<text id="M8BlueScore" transform="matrix(1 0 0 1 403 352.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matches[7]?.scoreBlueFinal}</text>

						<text id="M8RedScore" transform="matrix(1 0 0 1 403 316.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matches[7]?.scoreRedFinal}</text>
					</g>
				</g>
				<g id="match7">
					<g>
						<polygon fill={RED} points="412.7,174.56 276.43,174.56 276.43,138.54 412.7,138.54 425.64,156.55 		" stroke={(matches[6]?.winner.winner === "red" || matches[6]?.winner.tieWinner === "red") ? GOLD : "none"} strokeWidth="5" />
						<polygon fill={BLUE} points="412.7,211 276.43,211 276.43,174.99 412.7,174.99 425.64,192.99 		" stroke={(matches[6]?.winner.winner === "blue" || matches[6]?.winner.tieWinner === "blue") ? GOLD : "none"} strokeWidth="5" />
						<line fill="none" stroke="#FFFFFF" strokeMiterlimit="10" x1="412.7" y1="174.75" x2="254" y2="174.75" />
						<rect x="254" y="138.54" width="22.43" height="72.46" />
						<text transform="matrix(0 -1.0059 1 0 269.7769 198.9624)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.076px">MATCH 7</text>
						<text transform="matrix(0.9941 0 0 1 334.6 153.1807)" textAnchor="middle">
							<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(7, "red") ? allianceName(7, "red") : "Winner of M1"}</tspan>
							<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(7, "red").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(7, "red")}</tspan></text>
						<text transform="matrix(0.9941 0 0 1 334.6 189.6221)" textAnchor="middle">
							<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(7, "blue") ? allianceName(7, "blue") : "Winner of M2"}</tspan>
							<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(7, "blue").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(7, "blue")}</tspan></text>
						<circle id="match7RedDot" fill={(matches[6]?.winner.winner === "red") ? GOLD : ((matches[6]?.winner.winner === "tie") ? GREEN : "none")} cx="426" cy="156" r="8" />
						<circle id="match7BlueDot" fill={(matches[6]?.winner.winner === "blue") ? GOLD : ((matches[6]?.winner.winner === "tie") ? GREEN : "none")} cx="426" cy="193" r="8" />

						<text id="M7BlueScore" transform="matrix(1 0 0 1 403 196.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matches[6]?.scoreBlueFinal}</text>

						<text id="M7RedScore" transform="matrix(1 0 0 1 403 160.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matches[6]?.scoreRedFinal}</text>
					</g>
				</g>
				<g id="match6">
					<g>
						<polygon fill={RED} points="412.7,721.56 276.43,721.56 276.43,685.54 412.7,685.54 425.64,703.55 		" stroke={(matches[5]?.winner.winner === "red" || matches[5]?.winner.tieWinner === "red") ? GOLD : "none"} strokeWidth="5" />
						<polygon fill={BLUE} points="412.7,758 276.43,758 276.43,721.99 412.7,721.99 425.64,739.99 		" stroke={(matches[5]?.winner.winner === "blue" || matches[5]?.winner.tieWinner === "blue") ? GOLD : "none"} strokeWidth="5" />
						<line fill="none" stroke="#FFFFFF" strokeMiterlimit="10" x1="412.7" y1="721.75" x2="254" y2="721.75" />
						<rect x="254" y="685.54" width="22.43" height="72.46" />
						<text transform="matrix(0 -1.0059 1 0 269.7773 745.9619)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.076px">MATCH 6</text>
						<text transform="matrix(0.9941 0 0 1 334.6 700.1807)" textAnchor="middle">
							<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(6, "red") ? allianceName(6, "red") : "Losing Alliance of M3"}</tspan>
							<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(6, "red").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(6, "red")}</tspan></text>
						<text transform="matrix(0.9941 0 0 1 334.6 736.6221)" textAnchor="middle">
							<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(6, "blue") ? allianceName(6, "blue") : "Losing Alliance of M4"}</tspan>
							<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(6, "blue").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(6, "blue")}</tspan></text>
						<circle id="match6RedDot" fill={(matches[5]?.winner.winner === "red") ? GOLD : ((matches[5]?.winner.winner === "tie") ? GREEN : "none")} cx="426" cy="702" r="8" />
						<circle id="match6BlueDot" fill={(matches[5]?.winner.winner === "blue") ? GOLD : ((matches[5]?.winner.winner === "tie") ? GREEN : "none")} cx="426" cy="739" r="8" />

						<text id="M6BlueScore" transform="matrix(1 0 0 1 403 743.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matches[5]?.scoreBlueFinal}</text>

						<text id="M6RedScore" transform="matrix(1 0 0 1 403 707.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matches[5]?.scoreRedFinal}</text>
					</g>
				</g>
				<g id="match5">
					<g>
						<polygon fill={RED} points="412.7,567.56 276.43,567.56 276.43,531.54 412.7,531.54 425.64,549.55 		" stroke={(matches[4]?.winner.winner === "red" || matches[4]?.winner.tieWinner === "red") ? GOLD : "none"} strokeWidth="5" />
						<polygon fill={BLUE} points="412.7,604 276.43,604 276.43,567.99 412.7,567.99 425.64,585.99 		" stroke={(matches[4]?.winner.winner === "blue" || matches[4]?.winner.tieWinner === "blue") ? GOLD : "none"} strokeWidth="5" />
						<line fill="none" stroke="#FFFFFF" strokeMiterlimit="10" x1="412.7" y1="567.75" x2="254" y2="567.75" />
						<rect x="254" y="531.54" width="22.43" height="72.46" />
						<text transform="matrix(0 -1.0059 1 0 269.7773 591.9619)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.076px">MATCH 5</text>
						<text transform="matrix(0.9941 0 0 1 334.6 546.1807)" textAnchor="middle">
							<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px" textAnchor="middle">{allianceName(5, "red") ? allianceName(5, "red") : "Losing Alliance of M1"}</tspan>
							<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(5, "red").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(5, "red")}</tspan></text>
						<text transform="matrix(0.9941 0 0 1 334.6 582.6221)" textAnchor="middle">
							<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(5, "blue") ? allianceName(5, "blue") : "Winner of M2"}</tspan>
							<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(5, "blue").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(5, "blue")}</tspan></text>
						<circle id="match5RedDot" fill={(matches[4]?.winner.winner === "red") ? GOLD : ((matches[4]?.winner.winner === "tie") ? GREEN : "none")} cx="426" cy="549" r="8" />
						<circle id="match5BlueDot" fill={(matches[4]?.winner.winner === "blue") ? GOLD : ((matches[4]?.winner.winner === "tie") ? GREEN : "none")} cx="426" cy="586" r="8" />

						<text id="M5BlueScore" transform="matrix(1 0 0 1 403 589.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matches[4]?.scoreBlueFinal}</text>

						<text id="M5RedScore" transform="matrix(1 0 0 1 403 553.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matches[4]?.scoreRedFinal}</text>
					</g>
				</g>
				<g id="match4">
					<g>
						<polygon fill={RED} points="223.7,367.56 87.43,367.56 87.43,331.54 223.7,331.54 236.64,349.55 		" stroke={(matches[3]?.winner.winner === "red" || matches[3]?.winner.tieWinner === "red") ? GOLD : "none"} strokeWidth="5" />
						<polygon fill={BLUE} points="223.7,404 87.43,404 87.43,367.99 223.7,367.99 236.64,385.99 		" stroke={(matches[3]?.winner.winner === "blue" || matches[3]?.winner.tieWinner === "blue") ? GOLD : "none"} strokeWidth="5" />
						<line fill="none" stroke="#FFFFFF" strokeMiterlimit="10" x1="223.7" y1="367.75" x2="65" y2="367.75" />
						<rect x="65" y="331.54" width="22.43" height="72.46" />
						<text transform="matrix(0 -1.0059 1 0 80.7769 391.9619)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.076px">MATCH 4</text>
						<text transform="matrix(0.9941 0 0 1 145.6 346.1807)" textAnchor="middle">
							<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(4, "red") ? allianceName(4, "red") : "Alliance 3"}</tspan>
							<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(4, "red").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(4, "red")}</tspan></text>
						<text transform="matrix(0.9941 0 0 1 145.6 382.6221)" textAnchor="middle">
							<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(4, "blue") ? allianceName(4, "blue") : "Alliance 6"}</tspan>
							<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(4, "blue").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(4, "blue")}</tspan></text>
						<circle id="match4RedDot" fill={(matches[3]?.winner.winner === "red") ? GOLD : ((matches[3]?.winner.winner === "tie") ? GREEN : "none")} cx="237" cy="350" r="8" />
						<circle id="match4BlueDot" fill={(matches[3]?.winner.winner === "blue") ? GOLD : ((matches[3]?.winner.winner === "tie") ? GREEN : "none")} cx="237" cy="387" r="8" />

						<text id="M4BlueScore" transform="matrix(1 0 0 1 214 391.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matches[3]?.scoreBlueFinal}</text>

						<text id="M4RedScore" transform="matrix(1 0 0 1 214 355.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matches[3]?.scoreRedFinal}</text>
					</g>
				</g>
				<g id="match3">
					<g>
						<polygon fill={RED} points="223.7,290.56 87.43,290.56 87.43,254.54 223.7,254.54 236.64,272.55 		" stroke={(matches[2]?.winner.winner === "red" || matches[2]?.winner.tieWinner === "red") ? GOLD : "none"} strokeWidth="5" />
						<polygon fill={BLUE} points="223.7,327 87.43,327 87.43,290.99 223.7,290.99 236.64,308.99 		" stroke={(matches[2]?.winner.winner === "blue" || matches[2]?.winner.tieWinner === "blue") ? GOLD : "none"} strokeWidth="5" />
						<line fill="none" stroke="#FFFFFF" strokeMiterlimit="10" x1="223.7" y1="290.75" x2="65" y2="290.75" />
						<rect x="65" y="254.54" width="22.43" height="72.46" />
						<text transform="matrix(0 -1.0059 1 0 80.7769 314.9624)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.076px">MATCH 3</text>
						<text transform="matrix(0.9941 0 0 1 145.6 269.1807)" textAnchor="middle">
							<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(3, "red") ? allianceName(3, "red") : "Alliance 2"}</tspan>
							<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(3, "red").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(3, "red")}</tspan></text>
						<text transform="matrix(0.9941 0 0 1 145.6 305.6221)" textAnchor="middle">
							<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(3, "blue") ? allianceName(3, "blue") : "Alliance 7"}</tspan>
							<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(3, "blue").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(3, "blue")}</tspan></text>
						<circle id="match3RedDot" fill={(matches[2]?.winner.winner === "red") ? GOLD : ((matches[2]?.winner.winner === "tie") ? GREEN : "none")} cx="237" cy="272" r="8" />
						<circle id="match3BlueDot" fill={(matches[2]?.winner.winner === "blue") ? GOLD : ((matches[2]?.winner.winner === "tie") ? GREEN : "none")} cx="237" cy="309" r="8" />

						<text id="M3BlueScore" transform="matrix(1 0 0 1 214 314.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matches[2]?.scoreBlueFinal}</text>

						<text id="M3RedScore" transform="matrix(1 0 0 1 214 278.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matches[2]?.scoreRedFinal}</text>
					</g>
				</g>
				<g id="match2">
					<g>
						<polygon fill={RED} points="223.7,213.56 87.43,213.56 87.43,177.54 223.7,177.54 236.64,195.55 		" stroke={(matches[1]?.winner.winner === "red" || matches[1]?.winner.tieWinner === "red") ? GOLD : "none"} strokeWidth="5" />
						<polygon fill={BLUE} points="223.7,250 87.43,250 87.43,213.99 223.7,213.99 236.64,231.99 		" stroke={(matches[1]?.winner.winner === "blue" || matches[1]?.winner.tieWinner === "blue") ? GOLD : "none"} strokeWidth="5" />
						<line fill="none" stroke="#FFFFFF" strokeMiterlimit="10" x1="223.7" y1="213.75" x2="65" y2="213.75" />
						<rect x="65" y="177.54" width="22.43" height="72.46" />
						<text transform="matrix(0 -1.0059 1 0 80.7769 237.9624)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.076px">MATCH 2</text>
						<text transform="matrix(0.9941 0 0 1 145.6 192.1807)" textAnchor="middle">
							<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(2, "red") ? allianceName(2, "red") : "Alliance 4"}</tspan><tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(2, "red").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(2, "red")}</tspan></text>
						<text transform="matrix(0.9941 0 0 1 145.6 228.6221)" textAnchor="middle">
							<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(2, "blue") ? allianceName(2, "blue") : "Alliance 5"}</tspan><tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(2, "blue").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(2, "blue")}</tspan></text>
						<circle id="match2RedDot" fill={(matches[1]?.winner.winner === "red") ? GOLD : ((matches[1]?.winner.winner === "tie") ? GREEN : "none")} cx="237" cy="195" r="8" />
						<circle id="match2BlueDot" fill={(matches[1]?.winner.winner === "blue") ? GOLD : ((matches[1]?.winner.winner === "tie") ? GREEN : "none")} cx="237" cy="232" r="8" />

						<text id="M2BlueScore" transform="matrix(1 0 0 1 214 236.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matches[1]?.scoreBlueFinal}</text>

						<text id="M2RedScore" transform="matrix(1 0 0 1 214 200.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matches[1]?.scoreRedFinal}</text>
					</g>
				</g>
				<g id="match1">
					<g>
						<polygon fill={RED} points="223.7,136.56 87.43,136.56 87.43,100.54 223.7,100.54 236.64,118.55 		" stroke={(matches[0]?.winner.winner === "red" || matches[6]?.winner.tieWinner === "red") ? GOLD : "none"} strokeWidth="5" />
						<polygon fill={BLUE} points="223.7,173 87.43,173 87.43,136.99 223.7,136.99 236.64,154.99 		" stroke={(matches[0]?.winner.winner === "blue" || matches[0]?.winner.tieWinner === "blue") ? GOLD : "none"} strokeWidth="5" />
						<line fill="none" stroke="#FFFFFF" strokeMiterlimit="10" x1="223.7" y1="136.75" x2="65" y2="136.75" />
						<rect x="65" y="100.54" width="22.43" height="72.46" />
						<text transform="matrix(0 -1.0059 1 0 80.7769 160.9624)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.076px">MATCH 1</text>
						<text transform="matrix(0.9941 0 0 1 145.6 115.1807)" textAnchor="middle">
							<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(1, "red") ? allianceName(1, "red") : "Alliance 1"}</tspan>
							<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(1, "red").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(1, "red")}</tspan></text>
						<text transform="matrix(0.9941 0 0 1 145.6 150.6221)" textAnchor="middle">
							<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(1, "blue") ? allianceName(1, "blue") : "Alliance 8"}</tspan>
							<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(1, "blue").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(1, "blue")}</tspan>
						</text>
						<circle id="match1RedDot" fill={(matches[0]?.winner.winner === "red") ? GOLD : ((matches[0]?.winner.winner === "tie") ? GREEN : "none")} cx="237" cy="118" r="8" />
						<circle id="match1BlueDot" fill={(matches[0]?.winner.winner === "blue") ? GOLD : ((matches[0]?.winner.winner === "tie") ? GREEN : "none")} cx="237" cy="155" r="8" />

						<text id="M1BlueScore" transform="matrix(1 0 0 1 214 160.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matches[0]?.scoreBlueFinal}</text>

						<text id="M1RedScore" transform="matrix(1 0 0 1 214 123.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matches[0]?.scoreRedFinal}</text>
					</g>
				</g>
			</svg>

		</div>
	)
}

export default Bracket;