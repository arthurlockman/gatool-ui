import _ from "lodash";
import { Alert, Button, Col, Container, Modal, Row } from "react-bootstrap";
import { useState } from "react";
import moment from "moment";
import { useHotkeys } from "react-hotkeys-hook";
import { useSwipeable } from "react-swipeable";
import { matchClassesBase } from "./Constants";

function SixAllianceBracket({ offlinePlayoffSchedule, setOfflinePlayoffSchedule, currentMatch, qualsLength, nextMatch, previousMatch, getSchedule, usePullDownToUpdate, useSwipe, eventLabel, playoffCountOverride, ftcMode, matches, allianceNumbers, allianceName, matchScore, matchWinner, remapNumberToString }) {
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

	const byeCount = [
		{ "bye": 0, "replacementMatchClasses": [] },
		{ "bye": 0, "replacementMatchClasses": [] },
		{ "bye": 0, "replacementMatchClasses": [] },
		{ "bye": 1, "replacementMatchClasses": [] },
		{ "bye": 0, "replacementMatchClasses": [] },
		{ "bye": 3, "replacementMatchClasses": [{ "matchNumber": 2, "description": "Match 2 (R1) (#2)", "winnerTo": { "matchNumber": 7, "station": "blue" }, "loserTo": { "matchNumber": 10, "station": "blue" } }, { "matchNumber": 4, "description": "Match 4 (R1) (#4)", "winnerTo": { "matchNumber": 8, "station": "blue" }, "loserTo": { "matchNumber": 9, "station": "blue" }, }] },
		{ "bye": 2, "replacementMatchClasses": [{ "matchNumber": 2, "description": "Match 2 (R1) (#2)", "winnerTo": { "matchNumber": 7, "station": "blue" }, "loserTo": { "matchNumber": 10, "station": "blue" } }, { "matchNumber": 4, "description": "Match 4 (R1) (#4)", "winnerTo": { "matchNumber": 8, "station": "blue" }, "loserTo": { "matchNumber": 9, "station": "blue" }, }] },
		{ "bye": 1, "replacementMatchClasses": [{ "matchNumber": 2, "description": "Match 2 (R1) (#2)", "winnerTo": { "matchNumber": 7, "station": "blue" }, "loserTo": { "matchNumber": 10, "station": "blue" } }] },
		{ "bye": 0, "replacementMatchClasses": [] }
	]

	var matchClasses = _.cloneDeep(matchClassesBase.sixAlliance);

	_.forEach(byeCount[playoffCountOverride?.value || 8].replacementMatchClasses, (match) => {
		var tempClass = _.findIndex(matchClasses, { "matchNumber": match.matchNumber });
		matchClasses[tempClass].winnerTo = match.winnerTo;
		matchClasses[tempClass].loserTo = match.loserTo;
	})

	if (matches) {
		if (matches[18]?.actualStartTime) {
			overtimeOffset = 75;
		} else if (matches[17]?.actualStartTime) {
			overtimeOffset = 60;
		} else if (matches[16]?.actualStartTime) {
			overtimeOffset = 45;
		} else if (matches[15]?.actualStartTime) {
			overtimeOffset = 30;
		} else if (matches[14]?.actualStartTime) {
			overtimeOffset = 15;
		}


		for (var finalsMatches = 14; finalsMatches < 19; finalsMatches++) {
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
		} else if (matchWinner(19)?.tieWinner === "red") {
			tournamentWinner.winner = "red";
			tournamentWinner.level = matchWinner(19)?.level;
		} else if (matchWinner(19)?.tieWinner === "blue") {
			tournamentWinner.winner = "blue";
			tournamentWinner.level = matchWinner(19)?.level;
		}
	}

	const setMatchWinner = (matchNumber) => {
		if (offlinePlayoffSchedule?.schedule) {
			console.log(matches[matchNumber - 1] || "no teams yet");
			console.log(!matches[matchNumber - 1]?.teams[5]?.teamNumber ? "no blue team yet" : "select team");
			if (matches[matchNumber - 1]?.teams[5]?.teamNumber) {
				if (matchNumber >= 14) {
					var finalsMatches = _.filter(matches, (value) => { return value.matchNumber > 13 });
					matchNumber = 14 + _.findIndex(finalsMatches, (value) => { return value.scoreRedFinal < 10 });
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

		if (winnerTo <= 10) {
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
		<div {...swipeHandlers} style={{
			"width": "100%"
		}}>
			{!matches && <div>
				<Alert variant="warning" ><div><img src="loadingIcon.gif" alt="Loading data..." /></div><div>Waiting for Playoff Match Schedule</div></Alert>
			</div>}
			{matches &&
				<>
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
						<polyline points="242 175.1 430.8 175.1 430.8 328.1 242.6 328.1" fill="none" stroke="#000" strokeMiterlimit="10" strokeWidth="2" />
						<polyline points="242.5 175.1 242.5 213.6 199.1 213.6" fill="none" stroke="#000" strokeMiterlimit="10" strokeWidth="2" />
						<polyline points="242.5 328.1 242.5 368.6 199.1 368.6" fill="none" stroke="#000" strokeMiterlimit="10" strokeWidth="2" />
						<polyline points="431 254 1006 254 1006 504.1 816.8 504.1 816.8 574.1 630 574.1" fill="none" stroke="#000" strokeMiterlimit="10" strokeWidth="2" />
						<polyline points="611.7 648 629.7 648 629.7 509 611.7 509" fill="none" stroke="#000" strokeMiterlimit="10" strokeWidth="2" />
						<line x1="1024" y1="421" x2="1006" y2="421" fill="none" stroke="#000" strokeMiterlimit="10" strokeWidth="2" />
						<line x1="70" y1="419" x2="971" y2="419" fill="none" stroke="#8e8e8e" strokeMiterlimit="10" strokeWidth="2" />
							<text transform="matrix(0 -1 1 0 49.7114 348.6689)" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="26px">UPPER BRACKET</text>
							<text transform="matrix(0 -1 1 0 49.7114 673.2046)" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="26px">LOWER BRACKET</text>
							<text transform="matrix(1 0 0 1 116.6694 84.2646)" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="16px">ROUND 1</text>
							<text transform="matrix(1 0 0 1 306.6694 84.2646)" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="16px">ROUND 2</text>
							<text transform="matrix(1 0 0 1 494.6694 84.2646)" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="16px">ROUND 3</text>
							<text transform="matrix(1 0 0 1 682.6694 84.2646)" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="16px">ROUND 4</text>
							<text transform="matrix(1 0 0 1 869.6694 84.2646)" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="16px">ROUND 5</text>
							<text transform="matrix(1 0 0 1 1106.0776 84.2646)" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="16px">FINALS</text>
							<text id="playoffBracket" transform="matrix(1 0 0 1 620 47.6909)" dominantBaseline="middle" textAnchor="middle" fontFamily={eventLabel?.length > 50 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={black} fontStyle={"normal"} fontSize="38px">{eventLabel}</text>
						</g>
						<g id="finals" onClick={() => { setMatchWinner(10) }}>
							<g id="finalsContainer">
								<path id="finalsBackground" fill="#C1C1C1" stroke="#000000" strokeWidth="2" strokeMiterlimit="10" d="M1254.5,511.6H1024c-5.5,0-10-4.5-10-10V343.4c0-5.5,4.5-10,10-10h230.5
		c5.5,0,10,4.5,10,10v158.1C1264.5,507.1,1260,511.6,1254.5,511.6z"/>
								<polygon fill={RED} points="1164.7,389.6 1048.4,389.6 1048.4,353.5 1164.7,353.5 1177.6,371.6" stroke={(tournamentWinner?.winner === "red") ? GOLD : "none"} strokeWidth="5" />
								<polygon fill={BLUE} points="1164.7,426 1048.4,426 1048.4,390 1164.7,390 1177.6,408" stroke={(tournamentWinner?.winner === "blue") ? GOLD : "none"} strokeWidth="5" />
								<line fill="none" stroke="#FFFFFF" strokeMiterlimit="10" x1="1164.7" y1="389.7" x2="1026" y2="389.7" />
								<rect x="1026" y="353.5" width="22.4" height="72.5" fill={currentPlayoffMatch >= 10 ? GOLD : BLACK} />
								<text transform={ftcMode ? "matrix(0 -1.0059 1 0 1041.7773 410.6328)" : "matrix(0 -1.0059 1 0 1041.7773 418.6328)"} fill={currentPlayoffMatch >= 14 ? BLACK : WHITE} fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.076px">{ftcMode ? "FINALS" : "BEST 2 of 3"}</text>
								<text transform="matrix(0.9941 0 0 1 1106 367)" textAnchor="middle">
									<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(10, "red") ? allianceName(10, "red") : "Winner of M7"}</tspan>
									<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(10, "red").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(10, "red")}</tspan></text>
								<text transform="matrix(0.9941 0 0 1 1106 404)" textAnchor="middle">
									<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(10, "blue") ? allianceName(10, "blue") : "Winner of M9"}</tspan>
									<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(10, "blue").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(10, "blue")}</tspan></text>
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

							<circle id="winnerMatch1Dot" fill={(matchWinner(10)?.winner === "red") ? RED : (matchWinner(10)?.winner === "blue") ? BLUE : (matchWinner(10)?.winner === "tie") ? GREEN : "none"} cx={`${1132 - overtimeOffset}`} cy="451" r="8" />
							<text id="finalsM1Scores" transform={`matrix(1 0 0 1 ${1132 - overtimeOffset} 477.5537)`}>
								<tspan x="0" y="0" fill={RED} fontFamily="'myriad-pro'"
									fontWeight={(matchWinner(10)?.winner === "red") ? black : semibold}
									fontStyle={"normal"}
									fontSize="14px" textAnchor="middle">{matchScore(10, "red")}</tspan>
								<tspan x="0" y="14" fill={BLUE} fontFamily="'myriad-pro'"
									fontWeight={(matchWinner(10)?.winner === "blue") ? black : semibold}
									fontStyle={"normal"}
									fontSize="14px" textAnchor="middle">{matchScore(10, "blue")}</tspan>
							</text>

							<circle id="winnerMatch2Dot" fill={(matchWinner(11)?.winner === "red") ? RED : (matchWinner(11)?.winner === "blue") ? BLUE : (matchWinner(11)?.winner === "tie") ? GREEN : "none"} cx={`${1162 - overtimeOffset}`} cy="451" r="8" />
							<text id="finalsM2Scores" transform={`matrix(1 0 0 1 ${1162 - overtimeOffset} 477.5537)`}>
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

							<circle id="winnerMatch3Dot" fill={(matchWinner(12)?.winner === "red") ? RED : (matchWinner(12)?.winner === "blue") ? BLUE : (matchWinner(12)?.winner === "tie") ? GREEN : "none"} cx={`${1192 - overtimeOffset}`} cy="451" r="8" />
							<text id="finalsM3Scores"
								transform={`matrix(1 0 0 1 ${1192 - overtimeOffset} 477.5537)`}>
								<tspan x="0" y="0"
									fill={RED}
									fontFamily="'myriad-pro'"
									fontWeight={(matchWinner(12)?.winner === "red") ? black : semibold}
									fontStyle={"normal"}
									fontSize="14px" textAnchor="middle">{matchScore(12, "red")}</tspan>
								<tspan x="0" y="14" fill={BLUE}
									fontFamily="'myriad-pro'"
									fontWeight={(matchWinner(12)?.winner === "blue") ? black : semibold}
									fontStyle={"normal"}
									fontSize="14px" textAnchor="middle">{matchScore(12, "blue")}</tspan>
							</text>

							<circle id="winnerMatch4Dot" fill={(matchWinner(13)?.winner === "red") ? RED : (matchWinner(13)?.winner === "blue") ? BLUE : (matchWinner(13)?.winner === "tie") ? GREEN : "none"} cx={`${1222 - overtimeOffset}`} cy="451" r="8" />
							<text id="finalsM4Scores"
								transform={`matrix(1 0 0 1 ${1222 - overtimeOffset} 477.5537)`}>
								<tspan x="0" y="0"
									fill={RED}
									fontFamily="'myriad-pro'"
									fontWeight={(matchWinner(13)?.winner === "red") ? black : semibold}
									fontStyle={"normal"}
									fontSize="14px" textAnchor="middle">{matchScore(13, "red")}</tspan>
								<tspan x="0" y="14" fill={BLUE}
									fontFamily="'myriad-pro'"
									fontWeight={(matchWinner(13)?.winner === "blue") ? black : semibold}
									fontStyle={"normal"}
									fontSize="14px" textAnchor="middle">{matchScore(13, "blue")}</tspan>
							</text>

							<circle id="winnerMatch5Dot" fill={(matchWinner(14)?.winner === "red") ? RED : (matchWinner(14)?.winner === "blue") ? BLUE : (matchWinner(14)?.winner === "tie") ? GREEN : "none"} cx={`${1252 - overtimeOffset}`} cy="451" r="8" />
							<text id="finalsM5Scores"
								transform={`matrix(1 0 0 1 ${1252 - overtimeOffset} 477.5537)`}>
								<tspan x="0" y="0"
									fill={RED}
									fontFamily="'myriad-pro'"
									fontWeight={(matchWinner(14)?.winner === "red") ? black : semibold}
									fontStyle={"normal"}
									fontSize="14px" textAnchor="middle">{matchScore(14, "red")}</tspan>
								<tspan x="0" y="14" fill={BLUE}
									fontFamily="'myriad-pro'"
									fontWeight={(matchWinner(14)?.winner === "blue") ? black : semibold}
									fontStyle={"normal"}
									fontSize="14px" textAnchor="middle">{matchScore(14, "blue")}</tspan>
							</text>

							<circle id="winnerMatch6Dot" fill={(matchWinner(15)?.winner === "red") ? RED : (matchWinner(15)?.winner === "blue") ? BLUE : (matchWinner(15)?.winner === "tie") ? GREEN : "none"} cx={`${1282 - overtimeOffset}`} cy="451" r="8" />
							<text id="finalsM5Scores"
								transform={`matrix(1 0 0 1 ${1282 - overtimeOffset} 477.5537)`}>
								<tspan x="0" y="0"
									fill={RED}
									fontFamily="'myriad-pro'"
									fontWeight={(matchWinner(15)?.winner === "red") ? black : semibold}
									fontStyle={"normal"}
									fontSize="14px" textAnchor="middle">{matchScore(15, "red")}</tspan>
								<tspan x="0" y="14" fill={BLUE}
									fontFamily="'myriad-pro'"
									fontWeight={(matchWinner(15)?.winner === "blue") ? black : semibold}
									fontStyle={"normal"}
									fontSize="14px" textAnchor="middle">{matchScore(15, "blue")}</tspan>
							</text>
						</g>


						<g id="match9" onClick={() => { setMatchWinner(9) }}>
							<g>
								<polygon fill={RED} points="984.7,504.56 848.43,504.56 848.43,468.54 984.7,468.54 997.64,486.55 		" stroke={(matchWinner(9)?.winner === "red" || matchWinner(9)?.tieWinner === "red") ? GOLD : "none"} strokeWidth="5" />
								<polygon fill={BLUE} points="984.7,541 848.43,541 848.43,504.99 984.7,504.99 997.64,522.99 		" stroke={(matchWinner(9)?.winner === "blue" || matchWinner(9)?.tieWinner === "blue") ? GOLD : "none"} strokeWidth="5" />
								<line fill="none" stroke="#FFFFFF" strokeMiterlimit="10" x1="984.7" y1="504.75" x2="826" y2="504.75" />
								<rect x="826" y="468.54" width="22.43" height="72.46" fill={currentPlayoffMatch === 9 ? GOLD : BLACK} />
								<text transform="matrix(0 -1.0059 1 0 841.7773 532.333)" fill={currentPlayoffMatch === 9 ? BLACK : WHITE} fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.076px">MATCH 9</text>
								<text transform="matrix(0.9941 0 0 1 906.5 483.1807)" textAnchor="middle">
									<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(9, "red") ? allianceName(9, "red") : "Losing Alliance of M7"}</tspan>
									<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(9, "red").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(9, "red")}</tspan></text>
								<text transform="matrix(0.9941 0 0 1 906.5 519.6221)" textAnchor="middle">
									<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(9, "blue") ? allianceName(9, "blue") : "Winner of M8"}</tspan>
									<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(9, "blue").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(9, "blue")}</tspan></text>
								<circle id="match9RedDot" fill={(matchWinner(9)?.winner === "red") ? GOLD : ((matchWinner(9)?.winner === "tie") ? GREEN : "none")} cx="993" cy="483" r="8" />
								<circle id="match9BlueDot" fill={(matchWinner(9)?.winner === "blue") ? GOLD : ((matchWinner(9)?.winner === "tie") ? GREEN : "none")} cx="993" cy="520" r="8" />

								<text id="M9BlueScore" transform="matrix(1 0 0 1 972 525.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matchScore(9, "blue")}</text>

								<text id="M9RedScore" transform="matrix(1 0 0 1 972 489.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matchScore(9, "red")}</text>
							</g>
						</g>
						<g id="match8" onClick={() => { setMatchWinner(8) }}>
							<g>
								<polygon fill={RED} points="802.7,574.56 666.43,574.56 666.43,538.54 802.7,538.54 815.64,556.55 		" stroke={(matchWinner(8)?.winner === "red" || matchWinner(8)?.tieWinner === "red") ? GOLD : "none"} strokeWidth="5" />
								<polygon fill={BLUE} points="802.7,611 666.43,611 666.43,574.99 802.7,574.99 815.64,592.99 		" stroke={(matchWinner(8)?.winner === "blue" || matchWinner(8)?.tieWinner === "blue") ? GOLD : "none"} strokeWidth="5" />
								<line fill="none" stroke="#FFFFFF" strokeMiterlimit="10" x1="802.7" y1="574.75" x2="644" y2="574.75" />
								<rect x="644" y="538.54" width="22.43" height="72.46" fill={currentPlayoffMatch === 8 ? GOLD : BLACK} />
								<text transform="matrix(0 -1.0059 1 0 659.7773 602.333)" fill={currentPlayoffMatch === 8 ? BLACK : WHITE} fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.076px">MATCH 8</text>
								<text transform="matrix(0.9941 0 0 1 725 553.1807)" textAnchor="middle">
									<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(8, "red") ? allianceName(8, "red") : "Winner of M6"}</tspan>
									<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(8, "red").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(8, "red")}</tspan></text>
								<text transform="matrix(0.9941 0 0 1 725 589.6221)" textAnchor="middle">
									<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(8, "blue") ? allianceName(8, "blue") : "Winner of M5"}</tspan>
									<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(8, "blue").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(8, "blue")}</tspan></text>
								<circle id="match8RedDot" fill={(matchWinner(8)?.winner === "red") ? GOLD : ((matchWinner(8)?.winner === "tie") ? GREEN : "none")} cx="814" cy="556" r="8" />
								<circle id="match8BlueDot" fill={(matchWinner(8)?.winner === "blue") ? GOLD : ((matchWinner(8)?.winner === "tie") ? GREEN : "none")} cx="814" cy="593" r="8" />

								<text id="M8BlueScore" transform="matrix(1 0 0 1 792 595.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matchScore(8, "blue")}</text>

								<text id="M8RedScore" transform="matrix(1 0 0 1 792 559.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matchScore(8, "red")}</text>
							</g>
						</g>
						<g id="match7" onClick={() => { setMatchWinner(7) }}>
							<g>
								<polygon fill={RED} points="802.7,254.56 666.43,254.56 666.43,218.54 802.7,218.54 815.64,236.55 		" stroke={(matchWinner(7)?.winner === "red" || matchWinner(7)?.tieWinner === "red") ? GOLD : "none"} strokeWidth="5" />
								<polygon fill={BLUE} points="802.7,291 666.43,291 666.43,254.99 802.7,254.99 815.64,272.99 		" stroke={(matchWinner(7)?.winner === "blue" || matchWinner(7)?.tieWinner === "blue") ? GOLD : "none"} strokeWidth="5" />
								<line fill="none" stroke="#FFFFFF" strokeMiterlimit="10" x1="802.7" y1="254.75" x2="644" y2="254.75" />
								<rect x="644" y="218.54" width="22.43" height="72.46" fill={currentPlayoffMatch === 7 ? GOLD : BLACK} />
								<text transform="matrix(0 -1.0059 1 0 659.7764 282.332)" fill={currentPlayoffMatch === 7 ? BLACK : WHITE} fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.076px">MATCH 7</text>
								<text transform="matrix(0.9941 0 0 1 725 233.1807)" textAnchor="middle">
									<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(7, "red") ? allianceName(7, "red") : "Winner of M3"}</tspan>
									<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(7, "red").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(7, "red")}</tspan></text>
								<text transform="matrix(0.9941 0 0 1 725 269.6221)" textAnchor="middle">
									<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(7, "blue") ? allianceName(7, "blue") : "Winner of M4"}</tspan>
									<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(7, "blue").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(7, "blue")}</tspan></text>
								<circle id="match7RedDot" fill={(matchWinner(7)?.winner === "red") ? GOLD : ((matchWinner(7)?.winner === "tie") ? GREEN : "none")} cx="814" cy="236" r="8" />
								<circle id="match7BlueDot" fill={(matchWinner(7)?.winner === "blue") ? GOLD : ((matchWinner(7)?.winner === "tie") ? GREEN : "none")} cx="814" cy="273" r="8" />

								<text id="M7BlueScore" transform="matrix(1 0 0 1 792 277.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matchScore(7, "blue")}</text>

								<text id="M7RedScore" transform="matrix(1 0 0 1 792 241.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matchScore(7, "red")}</text>
							</g>
						</g>
						<g id="match6" onClick={() => { setMatchWinner(6) }}>
							<g>
								<polygon fill={RED} points="611.7,508.56 475.43,508.56 475.43,472.54 611.7,472.54 624.64,490.55 		" stroke={(matchWinner(6)?.winner === "red" || matchWinner(6)?.tieWinner === "red") ? GOLD : "none"} strokeWidth="5" />
								<polygon fill={BLUE} points="611.7,545 475.43,545 475.43,508.99 611.7,508.99 624.64,526.99 		" stroke={(matchWinner(6)?.winner === "blue" || matchWinner(6)?.tieWinner === "blue") ? GOLD : "none"} strokeWidth="5" />
								<line fill="none" stroke="#FFFFFF" strokeMiterlimit="10" x1="611.7" y1="508.75" x2="453" y2="508.75" />
								<rect x="453" y="472.54" width="22.43" height="72.46" fill={currentPlayoffMatch === 6 ? GOLD : BLACK} />
								<text transform="matrix(0 -1.0059 1 0 468.7769 536.333)" fill={currentPlayoffMatch === 6 ? BLACK : WHITE} fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.076px">MATCH 6</text>
								<text transform="matrix(0.9941 0 0 1 533 487.1807)" textAnchor="middle">
									<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(6, "red") ? allianceName(6, "red") : "Losing Alliance of M4"}</tspan>
									<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(6, "red").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(6, "red")}</tspan></text>
								<text transform="matrix(0.9941 0 0 1 533 523.6221)" textAnchor="middle">
									<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(6, "blue") ? allianceName(6, "blue") : "Losing Alliance of M1"}</tspan>
									<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(6, "blue").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(6, "blue")}</tspan></text>
								<circle id="match6RedDot" fill={(matchWinner(6)?.winner === "red") ? GOLD : ((matchWinner(6)?.winner === "tie") ? GREEN : "none")} cx="623" cy="490" r="8" />
								<circle id="match6BlueDot" fill={(matchWinner(6)?.winner === "blue") ? GOLD : ((matchWinner(6)?.winner === "tie") ? GREEN : "none")} cx="623" cy="527" r="8" />

								<text id="M6BlueScore" transform="matrix(1 0 0 1 599 532.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matchScore(6, "blue")}</text>

								<text id="M6RedScore" transform="matrix(1 0 0 1 599 496.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matchScore(6, "red")}</text>
							</g>
						</g>
						<g id="match5" onClick={() => { setMatchWinner(5) }}>
							<g>
								<polygon fill={RED} points="611.7,647.56 475.43,647.56 475.43,611.54 611.7,611.54 624.64,629.55 		" stroke={(matchWinner(5)?.winner === "red" || matchWinner(5)?.tieWinner === "red") ? GOLD : "none"} strokeWidth="5" />
								<polygon fill={BLUE} points="611.7,684 475.43,684 475.43,647.99 611.7,647.99 624.64,665.99 		" stroke={(matchWinner(5)?.winner === "blue" || matchWinner(5)?.tieWinner === "blue") ? GOLD : "none"} strokeWidth="5" />
								<line fill="none" stroke="#FFFFFF" strokeMiterlimit="10" x1="611.7" y1="647.75" x2="453" y2="647.75" />
								<rect x="453" y="611.54" width="22.43" height="72.46" fill={currentPlayoffMatch === 5 ? GOLD : BLACK} />
								<text transform="matrix(0 -1.0059 1 0 468.7773 671.9619)" fill={currentPlayoffMatch === 5 ? BLACK : WHITE} fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.076px">MATCH 5</text>
								<text transform="matrix(0.9941 0 0 1 533 626.1807)" textAnchor="middle">
									<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(5, "red") ? allianceName(5, "red") : "Losing Alliance of M3"}</tspan>
									<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(5, "red").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(5, "red")}</tspan></text>
								<text transform="matrix(0.9941 0 0 1 533 662.6221)" textAnchor="middle">
									<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(5, "blue") ? allianceName(5, "blue") : "Losing Alliance of M2"}</tspan>
									<tspan x="-0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(5, "blue").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(5, "blue")}</tspan></text>
								<circle id="match5RedDot" fill={(matchWinner(5)?.winner === "red") ? GOLD : ((matchWinner(5)?.winner === "tie") ? GREEN : "none")} cx="623" cy="629" r="8" />
								<circle id="match5BlueDot" fill={(matchWinner(5)?.winner === "blue") ? GOLD : ((matchWinner(5)?.winner === "tie") ? GREEN : "none")} cx="623" cy="666" r="8" />

								<text id="M5BlueScore" transform="matrix(1 0 0 1 599 669.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matchScore(5, "blue")}</text>

								<text id="M5RedScore" transform="matrix(1 0 0 1 599 633.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matchScore(5, "red")}</text>
							</g>
						</g>
						<g id="match4" onClick={() => { setMatchWinner(4) }}>
							<g>
								<polygon fill={RED} points="412.7,328.56 276.43,328.56 276.43,292.54 412.7,292.54 425.64,310.55 		" stroke={(matchWinner(4)?.winner === "red" || matchWinner(4)?.tieWinner === "red") ? GOLD : "none"} strokeWidth="5" />
								<polygon fill={BLUE} points="412.7,365 276.43,365 276.43,328.99 412.7,328.99 425.64,346.99 		" stroke={(matchWinner(4)?.winner === "blue" || matchWinner(4)?.tieWinner === "blue") ? GOLD : "none"} strokeWidth="5" />
								<line fill="none" stroke="#FFFFFF" strokeMiterlimit="10" x1="412.7" y1="328.75" x2="254" y2="328.75" />
								<rect x="254" y="292.54" width="22.43" height="72.46" fill={currentPlayoffMatch === 4 ? GOLD : BLACK} />
								<text transform="matrix(0 -1.0059 1 0 269.7769 352.9624)" fill={currentPlayoffMatch === 4 ? BLACK : WHITE} fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.076px">MATCH 4</text>
								<text transform="matrix(0.9941 0 0 1 334.6 307.1807)" textAnchor="middle">
									<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(4, "red") ? allianceName(4, "red") : "Alliance 2"}</tspan>
									<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(4, "red").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(4, "red")}</tspan></text>
								<text transform="matrix(0.9941 0 0 1 334.6 343.6221)" textAnchor="middle">
									<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(4, "blue") ? allianceName(4, "blue") : "Winner of M2"}</tspan>
									<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(4, "blue").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(4, "blue")}</tspan></text>
								<circle id="match4RedDot" fill={(matchWinner(4)?.winner === "red") ? GOLD : ((matchWinner(4)?.winner === "tie") ? GREEN : "none")} cx="426" cy="309" r="8" />
								<circle id="match4BlueDot" fill={(matchWinner(4)?.winner === "blue") ? GOLD : ((matchWinner(4)?.winner === "tie") ? GREEN : "none")} cx="426" cy="346" r="8" />

								<text id="M4BlueScore" transform="matrix(1 0 0 1 403 352.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matchScore(4, "blue")}</text>

								<text id="M4RedScore" transform="matrix(1 0 0 1 403 316.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matchScore(4, "red")}</text>
							</g>
						</g>
						<g id="match3" onClick={() => { setMatchWinner(3) }}>
							<g>
								<polygon fill={RED} points="412.7,174.56 276.43,174.56 276.43,138.54 412.7,138.54 425.64,156.55 		" stroke={(matchWinner(3)?.winner === "red" || matchWinner(3)?.tieWinner === "red") ? GOLD : "none"} strokeWidth="5" />
								<polygon fill={BLUE} points="412.7,211 276.43,211 276.43,174.99 412.7,174.99 425.64,192.99 		" stroke={(matchWinner(3)?.winner === "blue" || matchWinner(3)?.tieWinner === "blue") ? GOLD : "none"} strokeWidth="5" />
								<line fill="none" stroke="#FFFFFF" strokeMiterlimit="10" x1="412.7" y1="174.75" x2="254" y2="174.75" />
								<rect x="254" y="138.54" width="22.43" height="72.46" fill={currentPlayoffMatch === 3 ? GOLD : BLACK} />
								<text transform="matrix(0 -1.0059 1 0 269.7769 198.9624)" fill={currentPlayoffMatch === 3 ? BLACK : WHITE} fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.076px">MATCH 3</text>
								<text transform="matrix(0.9941 0 0 1 334.6 153.1807)" textAnchor="middle">
									<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(3, "red") ? allianceName(3, "red") : "Alliance 1"}</tspan>
									<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(3, "red").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(3, "red")}</tspan></text>
								<text transform="matrix(0.9941 0 0 1 334.6 189.6221)" textAnchor="middle">
									<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(3, "blue") ? allianceName(3, "blue") : "Winner of M1"}</tspan>
									<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(3, "blue").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(3, "blue")}</tspan></text>
								<circle id="match3RedDot" fill={(matchWinner(3)?.winner === "red") ? GOLD : ((matchWinner(3)?.winner === "tie") ? GREEN : "none")} cx="426" cy="156" r="8" />
								<circle id="match3BlueDot" fill={(matchWinner(3)?.winner === "blue") ? GOLD : ((matchWinner(3)?.winner === "tie") ? GREEN : "none")} cx="426" cy="193" r="8" />

								<text id="M3BlueScore" transform="matrix(1 0 0 1 403 196.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matchScore(3, "blue")}</text>

								<text id="M3RedScore" transform="matrix(1 0 0 1 403 160.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matchScore(3, "red")}</text>
							</g>
						</g>
						<g id="match2" onClick={() => { setMatchWinner(2) }}>
							<g>
								<polygon fill={RED} points="223.7,367.56 87.43,367.56 87.43,331.54 223.7,331.54 236.64,349.55 		" stroke={(matchWinner(2)?.winner === "red" || matchWinner(2)?.tieWinner === "red") ? GOLD : "none"} strokeWidth="5" />
								<polygon fill={BLUE} points="223.7,404 87.43,404 87.43,367.99 223.7,367.99 236.64,385.99 		" stroke={(matchWinner(2)?.winner === "blue" || matchWinner(2)?.tieWinner === "blue") ? GOLD : "none"} strokeWidth="5" />
								<line fill="none" stroke="#FFFFFF" strokeMiterlimit="10" x1="223.7" y1="367.75" x2="65" y2="367.75" />
								<rect x="65" y="331.54" width="22.43" height="72.46" fill={currentPlayoffMatch === 2 ? GOLD : BLACK} />
								<text transform="matrix(0 -1.0059 1 0 80.7769 391.9619)" fill={currentPlayoffMatch === 2 ? BLACK : WHITE} fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.076px">MATCH 2</text>
								<text transform="matrix(0.9941 0 0 1 145.6 346.1807)" textAnchor="middle">
									<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(2, "red") ? allianceName(2, "red") : "Alliance 3"}</tspan>
									<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(2, "red").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(2, "red")}</tspan></text>
								<text transform="matrix(0.9941 0 0 1 145.6 382.6221)" textAnchor="middle">
									<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(2, "blue") ? allianceName(2, "blue") : "Alliance 6"}</tspan>
									<tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(2, "blue").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(2, "blue")}</tspan></text>
								<circle id="match2RedDot" fill={(matchWinner(2)?.winner === "red") ? GOLD : ((matchWinner(2)?.winner === "tie") ? GREEN : "none")} cx="237" cy="350" r="8" />
								<circle id="match2BlueDot" fill={(matchWinner(2)?.winner === "blue") ? GOLD : ((matchWinner(2)?.winner === "tie") ? GREEN : "none")} cx="237" cy="387" r="8" />

								<text id="M2BlueScore" transform="matrix(1 0 0 1 214 391.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matchScore(2, "blue")}</text>

								<text id="M2RedScore" transform="matrix(1 0 0 1 214 355.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matchScore(2, "red")}</text>
							</g>
						</g>
						<g id="match1" onClick={() => { setMatchWinner(1) }}>
							<g>
								<polygon fill={RED} points="223.7,213.56 87.43,213.56 87.43,177.54 223.7,177.54 236.64,195.55 		" stroke={(matchWinner(1)?.winner === "red" || matchWinner(1)?.tieWinner === "red") ? GOLD : "none"} strokeWidth="5" />
								<polygon fill={BLUE} points="223.7,250 87.43,250 87.43,213.99 223.7,213.99 236.64,231.99 		" stroke={(matchWinner(1)?.winner === "blue" || matchWinner(1)?.tieWinner === "blue") ? GOLD : "none"} strokeWidth="5" />
								<line fill="none" stroke="#FFFFFF" strokeMiterlimit="10" x1="223.7" y1="213.75" x2="65" y2="213.75" />
								<rect x="65" y="177.54" width="22.43" height="72.46" fill={currentPlayoffMatch === 1 ? GOLD : BLACK} />
								<text transform="matrix(0 -1.0059 1 0 80.7769 237.9624)" fill={currentPlayoffMatch === 1 ? BLACK : WHITE} fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.076px">MATCH 1</text>
								<text transform="matrix(0.9941 0 0 1 145.6 192.1807)" textAnchor="middle">
									<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(1, "red") ? allianceName(1, "red") : "Alliance 4"}</tspan><tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(1, "red").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(1, "red")}</tspan></text>
								<text transform="matrix(0.9941 0 0 1 145.6 228.6221)" textAnchor="middle">
									<tspan x="0" y="0" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceName(1, "blue") ? allianceName(1, "blue") : "Alliance 5"}</tspan><tspan x="0" y="14.58" fill="#FFFFFF" fontFamily={allianceNumbers(1, "blue").length > 20 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={bold} fontStyle={"normal"} fontSize="12.1471px">{allianceNumbers(1, "blue")}</tspan></text>
								<circle id="match1RedDot" fill={(matchWinner(1)?.winner === "red") ? GOLD : ((matchWinner(1)?.winner === "tie") ? GREEN : "none")} cx="237" cy="195" r="8" />
								<circle id="match1BlueDot" fill={(matchWinner(1)?.winner === "blue") ? GOLD : ((matchWinner(1)?.winner === "tie") ? GREEN : "none")} cx="237" cy="232" r="8" />

								<text id="M1BlueScore" transform="matrix(1 0 0 1 214 236.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matchScore(1, "blue")}</text>

								<text id="M1RedScore" transform="matrix(1 0 0 1 214 200.6279)" fill="#FFFFFF" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="15px" textAnchor="middle">{matchScore(1, "red")}</text>
							</g>
						</g>
					</svg>
				</>}
			<Modal centered={true} show={showSelectWinner} size="lg" onHide={handleClose}>
				<Modal.Header className={"allianceAccept"} closeVariant={"white"} closeButton>
					<Modal.Title >{winnerMatch >= 0 ? <b>Select a winner for {matches[winnerMatch - 1]?.description}</b> : <b>Select a winner  </b>}</Modal.Title>
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
		</div>
	)
}

export default SixAllianceBracket;