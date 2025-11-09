import _ from "lodash";
import { useHotkeys } from "react-hotkeys-hook";
import { useSwipeable } from "react-swipeable";

function TwoAllianceBracket({ nextMatch, previousMatch, getSchedule, useSwipe, usePullDownToUpdate, eventLabel, ftcMode, matches, allianceNumbers, allianceName, matchScore, matchWinner, remapNumberToString }) {
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

	var overtimeOffset = 0;
	var tournamentWinner = {
		"red": 0,
		"blue": 0,
		"winner": "",
		"level": 0
	}
	if (matches[5]?.actualStartTime) {
		overtimeOffset = 106;
	} else if (matches[4]?.actualStartTime) {
		overtimeOffset = 84;
	} else if (matches[3]?.actualStartTime) {
		overtimeOffset = 63;
	} else if (matches[2]?.actualStartTime) {
		overtimeOffset = 42;
	} else if (matches[1]?.actualStartTime) {
		overtimeOffset = 21;
	}

	for (var finalsMatches = 1; finalsMatches < 7; finalsMatches++) {
		if (matches[_.findIndex(matches, { "matchNumber": finalsMatches })]?.winner.winner === "red") {
			tournamentWinner.red += 1
		}
		if (matches[_.findIndex(matches, { "matchNumber": finalsMatches })]?.winner.winner === "blue") {
			tournamentWinner.blue += 1
		}
	}
	if (tournamentWinner.red === 2) {
		tournamentWinner.winner = "red";
	} else if (tournamentWinner.blue === 2) {
		tournamentWinner.winner = "blue";
	} else if (matchWinner(6)?.tieWinner === "red") {
		tournamentWinner.winner = "red";
		tournamentWinner.level = matchWinner(6)?.level;
	} else if (matchWinner(6)?.tieWinner === "blue") {
		tournamentWinner.winner = "blue";
		tournamentWinner.level = matchWinner(6)?.level;
	}

	const dotStart = 541;

	// eslint-disable-next-line react-hooks/rules-of-hooks
	const swipeHandlers = useSwipe ? useSwipeable(
		{
			onSwipedLeft: () => {
				nextMatch();
			},
			onSwipedRight: () => {
				previousMatch();
			},
			onSwipedDown: () => {
				if (usePullDownToUpdate) {
					getSchedule();
				}

			},
			preventScrollOnSwipe: true,
		}
	) : {}

	useHotkeys('right', () => nextMatch(), { scopes: 'matchNavigation' });
	useHotkeys('left', () => previousMatch(), { scopes: 'matchNavigation' });

	return (
		<div style={{
			"width": "100%"
		}} {...swipeHandlers}>
			{/* <?xml version="1.0" encoding="utf-8"?> */}
			<svg id="TwoAllianceBracket" data-name="2AllianceBracket" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1076 568">

				<g id="background">
					<rect width="1076" height="568" fill="#fff" />
					<rect x="500.51" y="128" width="75" height="344.61" fill="#d9d8d7" />
					<text transform="translate(505.92 123.26)" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="20px" ><tspan x="0" y="0">FINALS</tspan></text>
					<text id="playoffBracketTitle" transform="translate(538 49.69)" dominantBaseline="middle" textAnchor="middle" fontFamily={eventLabel.length > 50 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={black} fontStyle={"normal"} fontSize="38px">{eventLabel}</text>
				</g>

				<g id="finals">
					<rect id="finalsBackground" x="363.69" y="166.55" width="357.1" height="253.91" rx="10" ry="10" fill="#bfbfbf" stroke="#000" strokeMiterlimit="10" strokeWidth="2" />
					<g id="finalsContainer">
						<polygon points="578.53 246.54 412.77 246.54 412.77 195.19 578.53 195.19 596.98 220.87 578.53 246.54" fill={RED} stroke={(tournamentWinner?.winner === "red") ? GOLD : "none"} strokeWidth="8" />
						<polygon points="578.53 298.49 412.77 298.49 412.77 247.15 578.53 247.15 596.98 272.82 578.53 298.49" fill={BLUE} stroke={(tournamentWinner?.winner === "blue") ? GOLD : "none"} strokeWidth="8" />
						<line x1="578.53" y1="246.81" x2="380.8" y2="246.81" fill="none" stroke="#fff" strokeMiterlimit="10" />
						<rect x="380.8" y="195.19" width="31.97" height="103.3" />

						<text transform={ftcMode ? "translate(403.29 274.99) rotate(-90)" : "translate(403.29 287.99) rotate(-90)"} fill="#fff" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="17.22px" ><tspan x="0" y="0">{ftcMode ? "FINALS" : "BEST 2 of 3"}</tspan></text>

						<text transform="translate(495 216.06)" fill="#fff" textAnchor="middle" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="17.32px">
							<tspan x="0" y="0">{allianceName(1, "red") ? allianceName(1, "red") : "Alliance 1"}</tspan>
							<tspan x="0" y="20.78">{allianceNumbers(1, "red")}</tspan></text>

						<text transform="translate(495 268.01)" fill="#fff" textAnchor="middle" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="17.32px">
							<tspan x="0" y="0">{allianceName(1, "blue") ? allianceName(1, "blue") : "Alliance 2"}</tspan>
							<tspan x="0" y="20.78">{allianceNumbers(1, "blue")}</tspan></text>
					</g>
					<g id="trophy">
						<rect x="635.08" y="281.65" width="37.8" height="2.36" fill="#4a4f5d" />
						<rect x="639.81" y="281.65" width="2.36" height="2.36" fill="#626775" />
						<rect x="665.79" y="281.65" width="7.09" height="2.36" fill="#343845" />
						<rect x="637.44" y="267.48" width="33.08" height="14.18" fill="#4a4f5d" />
						<rect x="642.17" y="267.48" width="2.36" height="14.18" fill="#626775" />
						<rect x="663.43" y="267.48" width="7.09" height="14.18" fill="#343845" />
						<path d="m656.34,247.4c0,8.72,5.56,16.13,13.32,18.9l.85,1.18h-33.08l.84-1.18c7.77-2.77,13.33-10.18,13.33-18.9h4.73Z" fill="#f0c833" />
						<path d="m652.8,247.4h-.59c0,8.72-4.17,16.13-10,18.9l-.63,1.18h4.13l.42-1.18c3.89-2.77,6.67-10.18,6.67-18.9Z" fill="#f6e59d" />
						<path d="m669.67,266.3c-7.77-2.77-13.32-10.18-13.32-18.9h-1.18c0,8.72,2.78,16.13,6.66,18.9l.43,1.18h8.27l-.85-1.18Z" fill="#e8a026" />
						<path d="m620.91,213.14c0,16.95,14.81,30.71,33.08,30.71s33.07-13.75,33.07-30.71h-66.15Zm33.08,27.17c-14.98,0-27.39-10.31-29.29-23.63h58.56c-1.89,13.31-14.3,23.63-29.27,23.63Z" fill="#f0c833" />
						<path d="m675.24,208.41h-42.53c0,22.18,9.52,40.16,21.26,40.16s21.26-17.98,21.26-40.16Z" fill="#f0c833" />
						<path d="m664.61,208.41c0,22.18-4.76,40.16-10.63,40.16,11.74,0,21.26-17.98,21.26-40.16h-10.63Z" fill="#e8a026" />
						<path d="m641.13,208.41h-3.1c0,22.18,7.14,40.16,15.95,40.16-7.09,0-12.85-17.98-12.85-40.16Z" fill="#f6e59d" />
					</g>
					<circle id="winnerMatch1Dot" cx={`${dotStart - overtimeOffset}`} cy="334.13" r="11.41" fill={(matchWinner(1)?.winner === "red") ? RED : (matchWinner(1)?.winner === "blue") ? BLUE : (matchWinner(1)?.winner === "tie") ? GREEN : "none"} />
					<text id="finalsM1Scores" transform={`matrix(1 0 0 1 ${dotStart - overtimeOffset} 372)`}>
						<tspan x="0" y="0" fill={RED} fontFamily="'myriad-pro'"
							fontWeight={(matchWinner(1)?.winner === "red") ? black : semibold}
							fontStyle={"normal"}
							fontSize="20px" textAnchor="middle">{matchScore(1, "red")}</tspan>
						<tspan x="0" y="20" fill={BLUE} fontFamily="'myriad-pro'"
							fontWeight={(matchWinner(1)?.winner === "blue") ? black : semibold}
							fontStyle={"normal"}
							fontSize="20px" textAnchor="middle">{matchScore(1, "blue")}</tspan>
					</text>

					<circle id="winnerMatch2Dot" cx={`${dotStart + 42 - overtimeOffset}`} cy="334.13" r="11.41" fill={(matchWinner(2)?.winner === "red") ? RED : (matchWinner(2)?.winner === "blue") ? BLUE : (matchWinner(2)?.winner === "tie") ? GREEN : "none"} />
					<text id="finalsM2Scores" transform={`matrix(1 0 0 1 ${dotStart + 42 - overtimeOffset} 372)`}>
						<tspan x="0" y="0" fill={RED} fontFamily="'myriad-pro'"
							fontWeight={(matchWinner(2)?.winner === "red") ? black : semibold}
							fontStyle={"normal"}
							fontSize="20px" textAnchor="middle">{matchScore(2, "red")}</tspan>
						<tspan x="0" y="20" fill={BLUE} fontFamily="'myriad-pro'"
							fontWeight={(matchWinner(2)?.winner === "blue") ? black : semibold}
							fontStyle={"normal"}
							fontSize="20px" textAnchor="middle">{matchScore(2, "blue")}</tspan>
					</text>

					<circle id="winnerMatch3Dot" cx={`${dotStart + 84 - overtimeOffset}`} cy="334.13" r="11.41" fill={(matchWinner(3)?.winner === "red") ? RED : (matchWinner(3)?.winner === "blue") ? BLUE : (matchWinner(3)?.winner === "tie") ? GREEN : "none"} />
					<text id="finalsM3Scores" transform={`matrix(1 0 0 1 ${dotStart + 84 - overtimeOffset} 372)`}>
						<tspan x="0" y="0" fill={RED} fontFamily="'myriad-pro'"
							fontWeight={(matchWinner(3)?.winner === "red") ? black : semibold}
							fontStyle={"normal"}
							fontSize="20px" textAnchor="middle">{matchScore(3, "red")}</tspan>
						<tspan x="0" y="20" fill={BLUE} fontFamily="'myriad-pro'"
							fontWeight={(matchWinner(3)?.winner === "blue") ? black : semibold}
							fontStyle={"normal"}
							fontSize="20px" textAnchor="middle">{matchScore(3, "blue")}</tspan>
					</text>

					<circle id="winnerMatch4Dot" cx={`${dotStart + 126 - overtimeOffset}`} cy="334.13" r="11.41" fill={(matchWinner(4)?.winner === "red") ? RED : (matchWinner(4)?.winner === "blue") ? BLUE : (matchWinner(4)?.winner === "tie") ? GREEN : "none"} />
					<text id="finalsM4Scores" transform={`matrix(1 0 0 1 ${dotStart + 126 - overtimeOffset} 372)`}>
						<tspan x="0" y="0" fill={RED} fontFamily="'myriad-pro'"
							fontWeight={(matchWinner(4)?.winner === "red") ? black : semibold}
							fontStyle={"normal"}
							fontSize="20px" textAnchor="middle">{matchScore(4, "red")}</tspan>
						<tspan x="0" y="20" fill={BLUE} fontFamily="'myriad-pro'"
							fontWeight={(matchWinner(4)?.winner === "blue") ? black : semibold}
							fontStyle={"normal"}
							fontSize="20px" textAnchor="middle">{matchScore(4, "blue")}</tspan>
					</text>

					<circle id="winnerMatch5Dot" cx={`${dotStart + 168 - overtimeOffset}`} cy="334.13" r="11.41" fill={(matchWinner(5)?.winner === "red") ? RED : (matchWinner(5)?.winner === "blue") ? BLUE : (matchWinner(5)?.winner === "tie") ? GREEN : "none"} />
					<text id="finalsM5Scores" transform={`matrix(1 0 0 1 ${dotStart + 168 - overtimeOffset} 372)`}>
						<tspan x="0" y="0" fill={RED} fontFamily="'myriad-pro'"
							fontWeight={(matchWinner(5)?.winner === "red") ? black : semibold}
							fontStyle={"normal"}
							fontSize="20px" textAnchor="middle">{matchScore(5, "red")}</tspan>
						<tspan x="0" y="20" fill={BLUE} fontFamily="'myriad-pro'"
							fontWeight={(matchWinner(5)?.winner === "blue") ? black : semibold}
							fontStyle={"normal"}
							fontSize="20px" textAnchor="middle">{matchScore(5, "blue")}</tspan>
					</text>

					<circle id="winnerMatch6Dot" cx={`${dotStart + 210 - overtimeOffset}`} cy="334.13" r="11.41" fill={(matchWinner(6)?.winner === "red") ? RED : (matchWinner(6)?.winner === "blue") ? BLUE : (matchWinner(6)?.winner === "tie") ? GREEN : "none"} />
					<text id="finalsM6Scores" transform={`matrix(1 0 0 1 ${dotStart + 210 - overtimeOffset} 372)`}>
						<tspan x="0" y="0" fill={RED} fontFamily="'myriad-pro'"
							fontWeight={(matchWinner(6)?.winner === "red") ? black : semibold}
							fontStyle={"normal"}
							fontSize="20px" textAnchor="middle">{matchScore(6, "red")}</tspan>
						<tspan x="0" y="20" fill={BLUE} fontFamily="'myriad-pro'"
							fontWeight={(matchWinner(6)?.winner === "blue") ? black : semibold}
							fontStyle={"normal"}
							fontSize="20px" textAnchor="middle">{matchScore(6, "blue")}</tspan>
					</text>

				</g>



			</svg>

		</div>
	)
}

export default TwoAllianceBracket;