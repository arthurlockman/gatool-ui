import _ from "lodash";
import { Alert, Button, Col, Container, Modal, Row } from "react-bootstrap";
import { useState } from "react";
import moment from "moment";
import { useHotkeys } from "react-hotkeys-hook";
import { useSwipeable } from "react-swipeable";
import { matchClassesBase } from "./Constants";

function FourAllianceBracketFTC({ currentMatch, qualsLength, nextMatch, previousMatch, getSchedule, useSwipe, usePullDownToUpdate, offlinePlayoffSchedule, setOfflinePlayoffSchedule, eventLabel, ftcMode,matches,allianceNumbers, allianceName, matchScore,matchWinner }) {
	const [showSelectWinner, setShowSelectWinner] = useState(false);
	const [showConfirmWinner, setShowConfirmWinner] = useState(false);
	const [winningAlliance, setWinningAlliance] = useState(null);
	const [winnerMatch, setWinnerMatch] = useState(-1);

	//Ball colors
	const GOLD = "#FFCA10";
	const RED = "#FF0000";
	const BLUE = "#0000FF";
	const GREEN = "#09BA48";
	const BLACK = "#000000";
	const WHITE = "#FFFFFF";
	//font weights
	const black = "900";
	const bold = "700";
	const semibold = "600";
	//const normal = "400";

	const currentPlayoffMatch = currentMatch - qualsLength;

	/**
	 * This function finds a team by their station assignment
	 * @param teams the array of team objects
	 * @param station the station to find (e.g., "Red1", "Red2", "Red3", "Blue1", "Blue2", "Blue3")
	 * @returns the team number or null if not found
	 */
	const getTeamByStation = (teams, station) => {
		if (!teams || !Array.isArray(teams)) return null;
		const team = teams.find((t) => t?.station?.toLowerCase() === station?.toLowerCase());
		return team?.teamNumber || null;
	};

	var overtimeOffset = 0;
	var tournamentWinner = {
		"red": 0,
		"blue": 0,
		"winner": "",
		"level": 0
	}

	const matchClasses = _.cloneDeep(matchClassesBase.fourAlliance)

	
	if (matches[10]?.actualStartTime) {
		overtimeOffset = 75;
	} else if (matches[9]?.actualStartTime) {
		overtimeOffset = 60;
	} else if (matches[8]?.actualStartTime) {
		overtimeOffset = 45;
	} else if (matches[7]?.actualStartTime) {
		overtimeOffset = 30;
	} else if (matches[6]?.actualStartTime) {
		overtimeOffset = 15;
	}

	for (var finalsMatches = 6; finalsMatches < 12; finalsMatches++) {
		if (matches[_.findIndex(matches, { "matchNumber": finalsMatches })]?.winner.winner === "red") {
			tournamentWinner.red += 1
		}
		if (matches[_.findIndex(matches, { "matchNumber": finalsMatches })]?.winner.winner === "blue") {
			tournamentWinner.blue += 1
		}
	}
	if (tournamentWinner?.red === 2) {
		tournamentWinner.winner = "red";
	} else if (tournamentWinner?.blue === 2) {
		tournamentWinner.winner = "blue";
	} else if (matchWinner(11)?.tieWinner === "red") {
		tournamentWinner.winner = "red";
		tournamentWinner.level = matchWinner(11)?.level;
	} else if (matchWinner(11)?.tieWinner === "blue") {
		tournamentWinner.winner = "blue";
		tournamentWinner.level = matchWinner(11)?.level;
	}

	const setMatchWinner = (matchNumber) => {
		if (offlinePlayoffSchedule?.schedule) {
			console.log(matches[matchNumber - 1] || "no teams yet");
			console.log(!matches[matchNumber - 1]?.teams[5]?.teamNumber ? "no blue team yet" : "select team");
			if (matches[matchNumber - 1]?.teams[5]?.teamNumber) {
				if (matchNumber >= 6) {
					var finalsMatches = _.filter(matches, (value) => { return value.matchNumber > 5 });
					matchNumber = 6 + _.findIndex(finalsMatches, (value) => { return value.scoreRedFinal < 10 });
				}
				setWinnerMatch(matchNumber);
				setShowSelectWinner(true);
			}
		}
	}

	const handleChooseWinner = (winner) => {
		setWinningAlliance(winner);
		setShowSelectWinner(false);
		setShowConfirmWinner(true);
	}
	const handleConfirmWinner = async () => {
		console.log(winningAlliance);
		const losingAlliance = winningAlliance === "red" ? "blue" : "red";
		// do something with the winning alliance
		var tempMatches = _.cloneDeep(offlinePlayoffSchedule);
		var tempTeams = { "red": [], "blue": [] };
		if (winningAlliance === "blue") {
			tempMatches.schedule[winnerMatch - 1].scoreBlueFinal = 20;
			tempMatches.schedule[winnerMatch - 1].scoreRedFinal = 10;
		} else if (winningAlliance === "red") {
			tempMatches.schedule[winnerMatch - 1].scoreBlueFinal = 10;
			tempMatches.schedule[winnerMatch - 1].scoreRedFinal = 20;
		} else {
			tempMatches.schedule[winnerMatch - 1].scoreBlueFinal = 10;
			tempMatches.schedule[winnerMatch - 1].scoreRedFinal = 10;
		}

		const matchTeams = tempMatches.schedule[winnerMatch - 1].teams;
		tempTeams.red = [getTeamByStation(matchTeams, "Red1"), getTeamByStation(matchTeams, "Red2"), getTeamByStation(matchTeams, "Red3")];
		tempTeams.blue = [getTeamByStation(matchTeams, "Blue1"), getTeamByStation(matchTeams, "Blue2"), getTeamByStation(matchTeams, "Blue3")];

		tempMatches.schedule[winnerMatch - 1].actualStartTime = moment().format();
		tempMatches.schedule[winnerMatch - 1].winner.winner = winningAlliance;
		var winnerTo = _.find(matchClasses, { "matchNumber": winnerMatch }).winnerTo?.matchNumber;
		var loserTo = _.find(matchClasses, { "matchNumber": winnerMatch }).loserTo?.matchNumber;
		var winnerStation = _.startCase(_.find(matchClasses, { "matchNumber": winnerMatch }).winnerTo.station);
		var loserStation = loserTo ? _.startCase(_.find(matchClasses, { "matchNumber": winnerMatch }).loserTo.station) : null;
		if (typeof tempMatches.schedule[winnerTo - 1] === "undefined" && winnerTo) {
			tempMatches.schedule[winnerTo - 1] = {
				"description": _.find(matchClasses, { "matchNumber": winnerTo })?.description,
				"tournamentLevel": "Playoff",
				"matchNumber": winnerTo,
				"startTime": moment().add(20, "minutes").format(),
				"actualStartTime": null,
				"postResultTime": null,
				"scoreRedFinal": null,
				"scoreRedFoul": null,
				"scoreRedAuto": null,
				"scoreBlueFinal": null,
				"scoreBlueFoul": null,
				"scoreBlueAuto": null,
				"teams": [{
					"teamNumber": null,
					"station": "Red1",
					"surrogate": false,
					"dq": false
				}, {
					"teamNumber": null,
					"station": "Red2",
					"surrogate": false,
					"dq": false
				}, {
					"teamNumber": null,
					"station": "Red3",
					"surrogate": false,
					"dq": false
				}, {
					"teamNumber": null,
					"station": "Blue1",
					"surrogate": false,
					"dq": false
				}, {
					"teamNumber": null,
					"station": "Blue2",
					"surrogate": false,
					"dq": false
				}, {
					"teamNumber": null,
					"station": "Blue3",
					"surrogate": false,
					"dq": false
				}],
				"winner": { "winner": "", "tieWinner": "", "level": 0 }
			};
		}
		if (typeof tempMatches.schedule[loserTo - 1] === "undefined" && loserTo) {
			tempMatches.schedule[loserTo - 1] = {
				"description": _.find(matchClasses, { "matchNumber": loserTo })?.description,
				"tournamentLevel": "Playoff",
				"matchNumber": loserTo,
				"startTime": moment().add(20, "minutes").format(),
				"actualStartTime": null,
				"postResultTime": null,
				"scoreRedFinal": null,
				"scoreRedFoul": null,
				"scoreRedAuto": null,
				"scoreBlueFinal": null,
				"scoreBlueFoul": null,
				"scoreBlueAuto": null,
				"teams": [{
					"teamNumber": null,
					"station": "Red1",
					"surrogate": false,
					"dq": false
				}, {
					"teamNumber": null,
					"station": "Red2",
					"surrogate": false,
					"dq": false
				}, {
					"teamNumber": null,
					"station": "Red3",
					"surrogate": false,
					"dq": false
				}, {
					"teamNumber": null,
					"station": "Blue1",
					"surrogate": false,
					"dq": false
				}, {
					"teamNumber": null,
					"station": "Blue2",
					"surrogate": false,
					"dq": false
				}, {
					"teamNumber": null,
					"station": "Blue3",
					"surrogate": false,
					"dq": false
				}],
				"winner": { "winner": "", "tieWinner": "", "level": 0 }
			};
		}

		if (winnerTo <= 14) {
			if (winnerTo) {
				tempMatches.schedule[winnerTo - 1].teams[_.findIndex(tempMatches.schedule[winnerTo - 1].teams, { "station": `${winnerStation}1` })].teamNumber = tempTeams[winningAlliance][0];
				tempMatches.schedule[winnerTo - 1].teams[_.findIndex(tempMatches.schedule[winnerTo - 1].teams, { "station": `${winnerStation}2` })].teamNumber = tempTeams[winningAlliance][1];
				tempMatches.schedule[winnerTo - 1].teams[_.findIndex(tempMatches.schedule[winnerTo - 1].teams, { "station": `${winnerStation}3` })].teamNumber = tempTeams[winningAlliance][2];
			}

			if (loserTo) {
				tempMatches.schedule[loserTo - 1].teams[_.findIndex(tempMatches.schedule[loserTo - 1].teams, { "station": `${loserStation}1` })].teamNumber = tempTeams[losingAlliance][0];
				tempMatches.schedule[loserTo - 1].teams[_.findIndex(tempMatches.schedule[loserTo - 1].teams, { "station": `${loserStation}2` })].teamNumber = tempTeams[losingAlliance][1];
				tempMatches.schedule[loserTo - 1].teams[_.findIndex(tempMatches.schedule[loserTo - 1].teams, { "station": `${loserStation}3` })].teamNumber = tempTeams[losingAlliance][2];
			}
		} else {
			if (winnerTo) {
				tempMatches.schedule[winnerTo - 1].teams[_.findIndex(tempMatches.schedule[winnerTo - 1].teams, { "station": `Red1` })].teamNumber = tempTeams["red"][0];
				tempMatches.schedule[winnerTo - 1].teams[_.findIndex(tempMatches.schedule[winnerTo - 1].teams, { "station": `Red2` })].teamNumber = tempTeams["red"][1];
				tempMatches.schedule[winnerTo - 1].teams[_.findIndex(tempMatches.schedule[winnerTo - 1].teams, { "station": `Red3` })].teamNumber = tempTeams["red"][2];
				tempMatches.schedule[loserTo - 1].teams[_.findIndex(tempMatches.schedule[loserTo - 1].teams, { "station": `Blue1` })].teamNumber = tempTeams["blue"][0];
				tempMatches.schedule[loserTo - 1].teams[_.findIndex(tempMatches.schedule[loserTo - 1].teams, { "station": `Blue2` })].teamNumber = tempTeams["blue"][1];
				tempMatches.schedule[loserTo - 1].teams[_.findIndex(tempMatches.schedule[loserTo - 1].teams, { "station": `Blue3` })].teamNumber = tempTeams["blue"][2];
			}
		}

		await setOfflinePlayoffSchedule(tempMatches);
		setWinnerMatch(-1)
		setShowSelectWinner(false);
		setShowConfirmWinner(false);

	}

	// manages closing the modal
	const handleClose = () => {
		setWinnerMatch(-1);
		setShowSelectWinner(false);
		setShowConfirmWinner(false);
	}

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
			{!matches && <div>
				<Alert variant="warning" ><div><img src="loadingIcon.gif" alt="Loading data..." /></div><div>Waiting for Playoff Match Schedule</div></Alert>
			</div>}
			{matches &&
				<>
					{/* <?xml version="1.0" encoding="utf-8"?> */}
					<svg id="FourAllianceBracket" data-name="FourAllianceBracket" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1076 686">
						<g id="background">
							<rect width="1076" height="686" fill="#fff" />
							<rect x="872" y="89" width="75" height="545" fill="#d9d8d7" />
							<rect x="108" y="89" width="75" height="545" fill="#d9d8d7" />
							<rect x="334" y="89" width="75" height="545" fill="#d9d8d7" />
							<rect x="583" y="89" width="75" height="545" fill="#d9d8d7" />
							<polyline points="257 175.06 498.85 175.06 498.85 254" fill="none" stroke="#000" strokeMiterlimit="10" strokeWidth="2" />
							<polyline points="185.26 136.56 257 136.56 257 213.56 198.05 213.56" fill="none" stroke="#000" strokeMiterlimit="10" strokeWidth="2" />
							<polyline points="499 254 748 254 748 504.12 502 504.12 502 574.12 410 574.12" fill="none" stroke="#000" strokeMiterlimit="10" strokeWidth="2" />
							<line x1="69" y1="366" x2="784" y2="366" fill="none" stroke="#8c8c8c" strokeMiterlimit="10" strokeWidth="2" />
							<text transform="translate(48.71 305.53) rotate(-90)" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="26px">UPPER BRACKET</text>
							<text transform="translate(48.71 589.48) rotate(-90)" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="26px">LOWER BRACKET</text>
							<text transform="translate(98 84.26)" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="26px">ROUND 1</text>
							<text transform="translate(320 84.26)" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="26px">ROUND 2</text>
							<text transform="translate(570 84.26)" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="26px">ROUND 3</text>
							<text transform="translate(870 84.26)" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="26px">FINALS</text>
							<text id="playoffBracket" transform="matrix(1 0 0 1 538 47.6909)" dominantBaseline="middle" textAnchor="middle" fontFamily={eventLabel.length > 50 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={black} fontStyle={"normal"} fontSize="38px">{eventLabel}</text>
						</g>
						<g id="finals" onClick={() => { setMatchWinner(6) }}>

							<g id="finalsContainer">
								<rect id="finalsBackground" x="784" y="272.45" width="250.49" height="178.1" rx="10" ry="10" fill="#C1C1C1" stroke="#000" strokeMiterlimit="10" strokeWidth="2" />
								<polygon points="934.7 328.56 818.43 328.56 818.43 292.54 934.7 292.54 947.64 310.55 934.7 328.56" fill={RED} stroke={(tournamentWinner?.winner === "red") ? GOLD : "none"} strokeWidth="5" />
								<polygon points="934.7 365 818.43 365 818.43 328.99 934.7 328.99 947.64 346.99 934.7 365" fill={BLUE} stroke={(tournamentWinner?.winner === "blue") ? GOLD : "none"} strokeWidth="5" />
								<line x1="934.7" y1="328.75" x2="796" y2="328.75" fill="none" stroke="#fff" strokeMiterlimit="10" />
								<rect x="796" y="292.54" width="22.43" height="72.46" fill={currentPlayoffMatch >= 6 ? GOLD : BLACK} />
								<text transform={ftcMode?"translate(811.78 349.63) rotate(-90)":"translate(811.78 357.63) rotate(-90)"} fill={currentPlayoffMatch >= 6 ? BLACK : WHITE} fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.076px">{ftcMode?"FINALS":"BEST 2 of 3"}</text>

								<text transform="matrix(0.9941 0 0 1 880 307)" textAnchor="middle">
									<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(6, "red") ? allianceName(6, "red") : "Winner of M3"}</tspan>
									<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(6, "red").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(6, "red")}</tspan></text>

								<text transform="matrix(0.9941 0 0 1 880 343)" textAnchor="middle">
									<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(6, "blue") ? allianceName(6, "blue") : "Winner of M13"}</tspan>
									<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(6, "blue").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(6, "blue")}</tspan></text>
							</g>

							<g id="trophy">
								<rect x="974.36" y="353.19" width="26.51" height="1.66" fill="#4a4f5d" />
								<rect x="977.68" y="353.19" width="1.66" height="1.66" fill="#626775" />
								<rect x="995.91" y="353.19" width="4.97" height="1.66" fill="#343845" />
								<rect x="976.02" y="343.25" width="23.2" height="9.94" fill="#4a4f5d" />
								<rect x="979.34" y="343.25" width="1.66" height="9.94" fill="#626775" />
								<rect x="994.25" y="343.25" width="4.97" height="9.94" fill="#343845" />
								<path d="m989.28,329.16c0,6.11,3.9,11.31,9.35,13.26l.6.83h-23.2l.59-.83c5.45-1.94,9.35-7.14,9.35-13.26h3.31Z" fill="#f0c833" />
								<path d="m986.79,329.16h-.41c0,6.12-2.93,11.31-7.01,13.26l-.44.83h2.9l.3-.83c2.73-1.94,4.68-7.14,4.68-13.26Z" fill="#f6e59d" />
								<path d="m998.62,342.42c-5.45-1.95-9.35-7.14-9.35-13.26h-.83c0,6.11,1.95,11.31,4.67,13.26l.3.83h5.8l-.6-.83Z" fill="#e8a026" />
								<path d="m964.42,305.13c0,11.89,10.39,21.54,23.2,21.54s23.2-9.65,23.2-21.54h-46.4Zm23.2,19.06c-10.51,0-19.21-7.23-20.54-16.57h41.08c-1.32,9.34-10.03,16.57-20.53,16.57Z" fill="#f0c833" />
								<path d="m1002.54,301.82h-29.83c0,15.56,6.68,28.17,14.91,28.17s14.91-12.61,14.91-28.17Z" fill="#f0c833" />
								<path d="m995.08,301.82c0,15.56-3.34,28.17-7.46,28.17,8.24,0,14.91-12.61,14.91-28.17h-7.46Z" fill="#e8a026" />
								<path d="m978.61,301.82h-2.18c0,15.56,5.01,28.17,11.19,28.17-4.98,0-9.01-12.61-9.01-28.17Z" fill="#f6e59d" />
							</g>


							<circle id="winnerMatch1Dot" fill={(matchWinner(6)?.winner === "red") ? RED : (matchWinner(6)?.winner === "blue") ? BLUE : (matchWinner(6)?.winner === "tie") ? GREEN : "none"} cx={`${910 - overtimeOffset}`} cy="390" r="8" />
							<text id="finalsM1Scores" transform={`matrix(1 0 0 1 ${910 - overtimeOffset} 416)`}>
								<tspan x="0" y="0" fill={RED} fontFamily="'myriad-pro'"
									fontWeight={(matchWinner(6)?.winner === "red") ? black : semibold}
									fontStyle={"normal"}
									fontSize="14px" textAnchor="middle">{matchScore(6, "red")}</tspan>
								<tspan x="0" y="14" fill={BLUE} fontFamily="'myriad-pro'"
									fontWeight={(matchWinner(6)?.winner === "blue") ? black : semibold}
									fontStyle={"normal"}
									fontSize="14px" textAnchor="middle">{matchScore(6, "blue")}</tspan>
							</text>

							<circle id="winnerMatch2Dot" fill={(matchWinner(7)?.winner === "red") ? RED : (matchWinner(7)?.winner === "blue") ? BLUE : (matchWinner(7)?.winner === "tie") ? GREEN : "none"} cx={`${940 - overtimeOffset}`} cy="390" r="8" />
							<text id="finalsM2Scores" transform={`matrix(1 0 0 1 ${940 - overtimeOffset} 416)`}>
								<tspan x="0" y="0"
									fill={RED}
									fontFamily="'myriad-pro'"
									fontWeight={(matchWinner(7)?.winner === "red") ? black : semibold}
									fontStyle={"normal"}
									fontSize="14px" textAnchor="middle">{matchScore(7, "red")}</tspan>
								<tspan x="0" y="14" fill={BLUE}
									fontFamily="'myriad-pro'"
									fontWeight={(matchWinner(7)?.winner === "blue") ? black : semibold}
									fontStyle={"normal"}
									fontSize="14px" textAnchor="middle">{matchScore(7, "blue")}</tspan>
							</text>

							<circle id="winnerMatch3Dot" fill={(matchWinner(8)?.winner === "red") ? RED : (matchWinner(8)?.winner === "blue") ? BLUE : (matchWinner(8)?.winner === "tie") ? GREEN : "none"} cx={`${970 - overtimeOffset}`} cy="390" r="8" />
							<text id="finalsM3Scores"
								transform={`matrix(1 0 0 1 ${970 - overtimeOffset} 416)`}>
								<tspan x="0" y="0"
									fill={RED}
									fontFamily="'myriad-pro'"
									fontWeight={(matchWinner(8)?.winner === "red") ? black : semibold}
									fontStyle={"normal"}
									fontSize="14px" textAnchor="middle">{matchScore(8, "red")}</tspan>
								<tspan x="0" y="14" fill={BLUE}
									fontFamily="'myriad-pro'"
									fontWeight={(matchWinner(8)?.winner === "blue") ? black : semibold}
									fontStyle={"normal"}
									fontSize="14px" textAnchor="middle">{matchScore(8, "blue")}</tspan>
							</text>

							<circle id="winnerMatch4Dot" fill={(matchWinner(9)?.winner === "red") ? RED : (matchWinner(9)?.winner === "blue") ? BLUE : (matchWinner(9)?.winner === "tie") ? GREEN : "none"} cx={`${1000 - overtimeOffset}`} cy="390" r="8" />
							<text id="finalsM4Scores"
								transform={`matrix(1 0 0 1 ${1000 - overtimeOffset} 416)`}>
								<tspan x="0" y="0"
									fill={RED}
									fontFamily="'myriad-pro'"
									fontWeight={(matchWinner(9)?.winner === "red") ? black : semibold}
									fontStyle={"normal"}
									fontSize="14px" textAnchor="middle">{matchScore(9, "red")}</tspan>
								<tspan x="0" y="14" fill={BLUE}
									fontFamily="'myriad-pro'"
									fontWeight={(matchWinner(9)?.winner === "blue") ? black : semibold}
									fontStyle={"normal"}
									fontSize="14px" textAnchor="middle">{matchScore(9, "blue")}</tspan>
							</text>

							<circle id="winnerMatch5Dot" fill={(matches[10]?.winner.winner === "red") ? RED : (matches[10]?.winner.winner === "blue") ? BLUE : (matches[10]?.winner.winner === "tie") ? GREEN : "none"} cx={`${1030 - overtimeOffset}`} cy="390" r="8" />
							<text id="finalsM5Scores"
								transform={`matrix(1 0 0 1 ${1030 - overtimeOffset} 416)`}>
								<tspan x="0" y="0"
									fill={RED}
									fontFamily="'myriad-pro'"
									fontWeight={(matches[10]?.winner.winner === "red") ? black : semibold}
									fontStyle={"normal"}
									fontSize="14px" textAnchor="middle">{matchScore(10, "red")}</tspan>
								<tspan x="0" y="14" fill={BLUE}
									fontFamily="'myriad-pro'"
									fontWeight={(matches[10]?.winner.winner === "blue") ? black : semibold}
									fontStyle={"normal"}
									fontSize="14px" textAnchor="middle">{matchScore(10, "blue")}</tspan>
							</text>

							<circle id="winnerMatch6Dot" fill={(matchWinner(11)?.winner === "red") ? RED : (matchWinner(11)?.winner === "blue") ? BLUE : (matches[10]?.winner.winner === "tie") ? GREEN : "none"} cx={`${1070 - overtimeOffset}`} cy="390" r="8" />
							<text id="finalsM5Scores"
								transform={`matrix(1 0 0 1 ${1070 - overtimeOffset} 416)`}>
								<tspan x="0" y="0"
									fill={RED}
									fontFamily="'myriad-pro'"
									fontWeight={(matchWinner(11)?.winner === "red") ? black : semibold}
									fontStyle={"normal"}
									fontSize="14px" textAnchor="middle">{matchScore(11, "red")}</tspan>
								<tspan x="0" y="14" fill={BLUE}
									fontFamily="'myriad-pro'"
									fontWeight={(matchWinner(11)?.winner === "blue") ? black : semibold}
									fontStyle={"normal"}
									fontSize="14px" textAnchor="middle">{matchScore(11, "blue")}</tspan>
							</text>


						</g>

						<g id="match5" onClick={() => { setMatchWinner(5) }}>
							<g>
								<polygon fill={RED} points="691.7 504.56 555.43 504.56 555.43 468.54 691.7 468.54 704.64 486.55 691.7 504.56" stroke={(matchWinner(5)?.winner === "red" || matchWinner(5)?.tieWinner === "red") ? GOLD : "none"} strokeWidth="5" />
								<polygon fill={BLUE} points="691.7 541 555.43 541 555.43 504.99 691.7 504.99 704.64 522.99 691.7 541" stroke={(matchWinner(5)?.winner === "blue" || matchWinner(5)?.tieWinner === "blue") ? GOLD : "none"} strokeWidth="5" />
								<line fill="none" stroke="#FFFFFF" strokeMiterlimit="10" x1="691.7" y1="504.75" x2="533" y2="504.75" />
								<rect x="533" y="468.54" width="22.43" height="72.46" fill={currentPlayoffMatch === 5 ? GOLD : BLACK} />
								<text transform="matrix(0 -1.0059 1 0 548.78 528.26)" fill={currentPlayoffMatch === 5 ? BLACK : WHITE} fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.076px">MATCH 5</text>
								<text transform="matrix(0.9941 0 0 1 608 483.18)" textAnchor="middle">
									<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px" textAnchor="middle">{allianceName(5, "red") ? allianceName(5, "red") : "Losing Alliance of M3"}</tspan>
									<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(5, "red").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(5, "red")}</tspan></text>
								<text transform="matrix(0.9941 0 0 1 608 519.62)" textAnchor="middle">
									<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(5, "blue") ? allianceName(5, "blue") : "Winning Alliance of M4"}</tspan>
									<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(5, "blue").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(5, "blue")}</tspan></text>
								<circle id="match5RedDot" fill={(matchWinner(5)?.winner === "red") ? GOLD : ((matchWinner(5)?.winner === "tie") ? GREEN : "none")} cx="705" cy="485" r="8" />
								<circle id="match5BlueDot" fill={(matchWinner(5)?.winner === "blue") ? GOLD : ((matchWinner(5)?.winner === "tie") ? GREEN : "none")} cx="705" cy="522" r="8" />

								<text id="M5BlueScore" transform="matrix(1 0 0 1 675 525.63)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matchScore(5, "blue")}</text>

								<text id="M5RedScore" transform="matrix(1 0 0 1 675 489.63)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matchScore(5, "red")}</text>
							</g>
						</g>

						{/* FTC reverses Match 3 and 4 when compared to FRC. */}
						<g id="match3" onClick={() => { setMatchWinner(3) }}>
							<g>
								<polygon fill={RED} points="449.7 574.56 313.43 574.56 313.43 538.54 449.7 538.54 462.64 556.55 449.7 574.56" stroke={(matchWinner(3)?.winner === "red" || matchWinner(3)?.tieWinner === "red") ? GOLD : "none"} strokeWidth="5" />
								<polygon fill={BLUE} points="449.7 611 313.43 611 313.43 574.99 449.7 574.99 462.64 592.99 449.7 611" stroke={(matchWinner(3)?.winner === "blue" || matchWinner(3)?.tieWinner === "blue") ? GOLD : "none"} strokeWidth="5" />
								<line fill="none" stroke="#FFFFFF" strokeMiterlimit="10" x1="449.7" y1="574.75" x2="291" y2="574.75" />
								<rect x="291" y="538.54" width="22.43" height="72.46" fill={currentPlayoffMatch === 3 ? GOLD : BLACK} />
								<text transform="matrix(0 -1.0059 1 0 306.78 598.26)" fill={currentPlayoffMatch === 3 ? BLACK : WHITE} fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.076px">MATCH 3</text>
								<text transform="matrix(0.9941 0 0 1 370 553.18)" textAnchor="middle">
									<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(4, "red") ? allianceName(3, "red") : "TBD"}</tspan>
									<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(3, "red").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(3, "red")}</tspan></text>
								<text transform="matrix(0.9941 0 0 1 370 589.62)" textAnchor="middle">
									<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(3, "blue") ? allianceName(3, "blue") : "TBD"}</tspan>
									<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(3, "blue").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(3, "blue")}</tspan></text>
								<circle id="match3RedDot" fill={(matchWinner(3)?.winner === "red") ? GOLD : ((matchWinner(3)?.winner === "tie") ? GREEN : "none")} cx="464" cy="556" r="8" />
								<circle id="match3BlueDot" fill={(matchWinner(3)?.winner === "blue") ? GOLD : ((matchWinner(3)?.winner === "tie") ? GREEN : "none")} cx="464" cy="593" r="8" />

								<text id="M3BlueScore" transform="matrix(1 0 0 1 435 595.63)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matchScore(3, "blue")}</text>

								<text id="M3RedScore" transform="matrix(1 0 0 1 435 559.63)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matchScore(3, "red")}</text>
							</g>
						</g>

						{/* FTC reverses Match 3 and 4 when compared to FRC. */}
						<g id="match4" onClick={() => { setMatchWinner(4) }}>
							<g>
								<polygon fill={RED} points="447.7 174.56 311.43 174.56 311.43 138.54 447.7 138.54 460.64 156.55 447.7 174.56" stroke={(matchWinner(34)?.winner === "red" || matchWinner(4)?.tieWinner === "red") ? GOLD : "none"} strokeWidth="5" />
								<polygon fill={BLUE} points="447.7 211 311.43 211 311.43 174.99 447.7 174.99 460.64 192.99 447.7 211" stroke={(matchWinner(4)?.winner === "blue" || matchWinner(4)?.tieWinner === "blue") ? GOLD : "none"} strokeWidth="5" />
								<line fill="none" stroke="#FFFFFF" strokeMiterlimit="10" x1="447.7" y1="174.75" x2="289" y2="174.75" />
								<rect x="289" y="138.54" width="22.43" height="72.46" fill={currentPlayoffMatch === 4 ? GOLD : BLACK} />
								<text transform="matrix(0 -1.0059 1 0 304.78 198.26)" fill={currentPlayoffMatch === 4 ? BLACK : WHITE} fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.076px">MATCH 4</text>
								<text transform="matrix(0.9941 0 0 1 370 153.18)" textAnchor="middle">
									<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(4, "red") ? allianceName(4, "red") : "TBD"}</tspan>
									<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(4, "red").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(4, "red")}</tspan></text>
								<text transform="matrix(0.9941 0 0 1 370 189.62)" textAnchor="middle">
									<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(3, "blue") ? allianceName(4, "blue") : "TBD"}</tspan>
									<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(4, "blue").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(4, "blue")}</tspan></text>
								<circle id="match4RedDot" fill={(matchWinner(4)?.winner === "red") ? GOLD : ((matchWinner(4)?.winner === "tie") ? GREEN : "none")} cx="464" cy="156" r="8" />
								<circle id="match4BlueDot" fill={(matchWinner(4)?.winner === "blue") ? GOLD : ((matchWinner(4)?.winner === "tie") ? GREEN : "none")} cx="464" cy="193" r="8" />

								<text id="43BlueScore" transform="matrix(1 0 0 1 435 196.63)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matchScore(4, "blue")}</text>

								<text id="M4RedScore" transform="matrix(1 0 0 1 435 160.63)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matchScore(4, "red")}</text>
							</g>
						</g>

						<g id="match2" onClick={() => { setMatchWinner(2) }}>
							<g>
								<polygon fill={RED} points="222.7 213.56 86.43 213.56 86.43 177.54 222.7 177.54 235.64 195.55 222.7 213.56" stroke={(matchWinner(2)?.winner === "red" || matchWinner(2)?.tieWinner === "red") ? GOLD : "none"} strokeWidth="5" />
								<polygon fill={BLUE} points="222.7 250 86.43 250 86.43 213.99 222.7 213.99 235.64 231.99 222.7 250" stroke={(matchWinner(2)?.winner === "blue" || matchWinner(2)?.tieWinner === "blue") ? GOLD : "none"} strokeWidth="5" />
								<line x1="222.7" y1="213.75" x2="64" y2="213.75" fill="none" stroke="#fff" strokeMiterlimit="10" />
								<rect x="64" y="177.54" width="22.43" height="72.46" fill={currentPlayoffMatch === 2 ? GOLD : BLACK} />
								<text transform="matrix(0 -1.0059 1 0 79.78 237.26)" fill={currentPlayoffMatch === 2 ? BLACK : WHITE} fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.076px">MATCH 2</text>
								<text transform="matrix(0.9941 0 0 1 145 192.18)" textAnchor="middle">
									<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(2, "red") ? allianceName(2, "red") : "DIVISION C"}</tspan><tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(2, "red").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(2, "red")}</tspan></text>
								<text transform="matrix(0.9941 0 0 1 145 228.62)" textAnchor="middle">
									<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(2, "blue") ? allianceName(2, "blue") : "DIVISION D"}</tspan><tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(2, "blue").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(2, "blue")}</tspan></text>
								<circle id="match2RedDot" fill={(matchWinner(2)?.winner === "red") ? GOLD : ((matchWinner(2)?.winner === "tie") ? GREEN : "none")} cx="236" cy="195" r="8" />
								<circle id="match2BlueDot" fill={(matchWinner(2)?.winner === "blue") ? GOLD : ((matchWinner(2)?.winner === "tie") ? GREEN : "none")} cx="237" cy="232" r="8" />

								<text id="M2BlueScore" transform="matrix(1 0 0 1 210 236.63)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matchScore(2, "blue")}</text>

								<text id="M2RedScore" transform="matrix(1 0 0 1 210 200.63)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matchScore(2, "red")}</text>
							</g>
						</g>

						<g id="match1" onClick={() => { setMatchWinner(1) }}>
							<g>
								<polygon fill={RED} points="222.7 136.56 86.43 136.56 86.43 100.54 222.7 100.54 235.64 118.55 222.7 136.56" stroke={(matchWinner(1)?.winner === "red" || matchWinner(1)?.tieWinner === "red") ? GOLD : "none"} strokeWidth="5" />
								<polygon fill={BLUE} points="222.7 173 86.43 173 86.43 136.99 222.7 136.99 235.64 154.99 222.7 173" stroke={(matchWinner(1)?.winner === "blue" || matchWinner(1)?.tieWinner === "blue") ? GOLD : "none"} strokeWidth="5" />
								<line x1="222.7" y1="136.75" x2="64" y2="136.75" fill="none" stroke="#fff" strokeMiterlimit="10" />
								<rect x="64" y="100.54" width="22.43" height="72.46" fill={currentPlayoffMatch === 1 ? GOLD : BLACK} />
								<text transform="matrix(0 -1.0059 1 0 79.78 160.26)" fill={currentPlayoffMatch === 1 ? BLACK : WHITE} fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.076px">MATCH 1</text>
								<text transform="matrix(0.9941 0 0 1 145 115.18)" textAnchor="middle">
									<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(1, "red") ? allianceName(1, "red") : "DIVISION A"}</tspan>
									<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(1, "red").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(1, "red")}</tspan></text>
								<text transform="matrix(0.9941 0 0 1 145 151.62)" textAnchor="middle">
									<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(1, "blue") ? allianceName(1, "blue") : "DIVISION B"}</tspan>
									<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(1, "blue").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(1, "blue")}</tspan>
								</text>
								<circle id="match1RedDot" fill={(matchWinner(1)?.winner === "red") ? GOLD : ((matchWinner(1)?.winner === "tie") ? GREEN : "none")} cx="236" cy="118" r="8" />
								<circle id="match1BlueDot" fill={(matchWinner(1)?.winner === "blue") ? GOLD : ((matchWinner(1)?.winner === "tie") ? GREEN : "none")} cx="236" cy="155" r="8" />

								<text id="M1BlueScore" transform="matrix(1 0 0 1 210 159.63)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matchScore(1, "blue")}</text>

								<text id="M1RedScore" transform="matrix(1 0 0 1 210 123.63)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matchScore(1, "red")}</text>
							</g>
						</g>
					</svg>
					<Modal centered={true} show={showSelectWinner} size="lg" onHide={handleClose}>
						<Modal.Header className={"allianceAccept"} closeVariant={"white"} closeButton>
							<Modal.Title ><b>Select a winner for {matches[winnerMatch - 1]?.description}</b></Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<Container fluid>
								<Row>
									<Col style={{ backgroundColor: "red", color: "white", fontWeight: "bold", fontSize: "40px", textAlign: "center", padding: "50px 0" }} xs={(winnerMatch < 14) ? 5 : 4} onClick={() => { handleChooseWinner("red") }} variant="danger">{allianceName(winnerMatch, "red")}</Col>
									{(winnerMatch < 14) &&
										<Col xs={2}></Col>}
									{((offlinePlayoffSchedule?.schedule?.length > 14) && (winnerMatch >= 14)) &&
										<>
											<Col xs={1}></Col>
											<Col style={{ backgroundColor: "green", color: "white", fontWeight: "bold", fontSize: "40px", textAlign: "center", padding: "50px 0" }} xs={2} onClick={() => { handleChooseWinner("tie") }}>It's a Tie!</Col>
											<Col xs={1}></Col>
										</>
									}
									<Col style={{ backgroundColor: "blue", color: "white", fontWeight: "bold", fontSize: "40px", textAlign: "center", padding: "50px 0" }} xs={(winnerMatch < 14) ? 5 : 4} onClick={() => { handleChooseWinner("blue") }}>{allianceName(winnerMatch, "blue")}</Col>
								</Row>
							</Container>
						</Modal.Body>
						<Modal.Footer>
							<Button variant="secondary" onClick={handleClose}>Close without selecting a winner</Button>
						</Modal.Footer>
					</Modal>
					<Modal centered={true} show={showConfirmWinner} size="lg" onHide={handleClose}>
						<Modal.Header className={"allianceAccept"} closeVariant={"white"} closeButton>
							<Modal.Title ><b>Confirm winner for {matches[winnerMatch - 1]?.description}</b></Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<Container fluid>
								<Row>
									<Col xs={4}></Col>
									<Col style={{ backgroundColor: winningAlliance === "blue" ? "blue" : winningAlliance === "red" ? "red" : "green", color: "white", fontWeight: "bold", fontSize: "40px", textAlign: "center", padding: "50px 0" }} xs={4} onClick={handleConfirmWinner}>{winningAlliance === "tie" ? "It's a tie!" : allianceName(winnerMatch, winningAlliance)}</Col>
									<Col xs={4}></Col>
								</Row>
							</Container>
						</Modal.Body>
						<Modal.Footer>
							<Button variant="secondary" onClick={handleClose}>Close without selecting a winner</Button>
						</Modal.Footer>
					</Modal>
				</>
			}
		</div>

	)
}

export default FourAllianceBracketFTC;