import _ from "lodash";
import { Alert, Button, Col, Container, Modal, Row } from "react-bootstrap";
import { useState } from "react";
import moment from "moment";
import { useHotkeys } from "react-hotkeys-hook";
import { useSwipeable } from "react-swipeable";
import { matchClassesBase } from "./Constants";
import Match from "./Match";
import PlayoffMatch from "./PlayoffMatch";
import FinalsMatchIndicator from "./FinalsMatchIndicator";

function FourAllianceBracket({ currentMatch, qualsLength, nextMatch, previousMatch, getSchedule, useSwipe, usePullDownToUpdate, offlinePlayoffSchedule, setOfflinePlayoffSchedule, eventLabel, ftcMode, matches, allianceNumbers, allianceName, matchScore, matchWinner }) {
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
	const finalsStartMatch = 6; // First finals match for 4-alliance bracket

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
	
	// Check if we're viewing any finals match (for gold background on "FINALS"/"BEST 2 of 3")
	// In FTC mode, use series number comparison to handle tiebreakers correctly
	let isInFinalsView = false;
	if (ftcMode) {
		const scheduleToCheck = offlinePlayoffSchedule?.schedule || matches;
		const currentMatchObj = scheduleToCheck[currentPlayoffMatch - 1];
		if (currentMatchObj?.series) {
			isInFinalsView = currentMatchObj.series >= finalsStartMatch;
		} else {
			isInFinalsView = currentPlayoffMatch >= finalsStartMatch;
		}
	} else {
		isInFinalsView = currentPlayoffMatch >= finalsStartMatch;
	}

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

	// Helper function to check if a bracket match should be highlighted as the current match
	// Handles tiebreakers by comparing series numbers
	const isCurrentMatch = (bracketMatchNumber) => {
		// Get the current match object
		const scheduleToCheck = offlinePlayoffSchedule?.schedule || matches;
		const currentMatchObj = scheduleToCheck[currentPlayoffMatch - 1];
		
		if (!currentMatchObj || !currentMatchObj.series) {
			// Fallback to ordinal comparison if series is not available
			return currentPlayoffMatch === bracketMatchNumber;
		}
		
		// In bracket display, match number equals series number
		// Highlight if the current match's series matches the bracket match's series
		// This ensures tiebreakers still highlight the original match
		return currentMatchObj.series === bracketMatchNumber;
	};

	// Wrapper functions for Match component
	const getMatchLabel = (matchNumber) => `MATCH ${matchNumber}`;
	const getAllianceNameForDisplay = (matchNumber, alliance) => allianceName(matchNumber, alliance);
	const getAllianceNumbersForDisplay = (matchNumber, alliance) => allianceNumbers(matchNumber, alliance);
	const getMatchWinnerForDisplay = (matchNumber) => matchWinner(matchNumber);
	const getMatchScoreForDisplay = (matchNumber, alliance) => matchScore(matchNumber, alliance);
	// Wrapper functions for FinalsMatchIndicator component
	const getFinalsMatchWinnerForDisplay = (matchNumber) => matchWinner(matchNumber);
	const getFinalsMatchScoreForDisplay = (matchNumber, alliance) => matchScore(matchNumber, alliance);

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
						<PlayoffMatch
							x={784}
							y={272.45}
							matchNumber={6}
							onClick={() => setMatchWinner(6)}
							isCurrentMatch={isCurrentMatch(6)}
							isInFinalsView={isInFinalsView}
							getAllianceNameForDisplay={getAllianceNameForDisplay}
							getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
							tournamentWinner={tournamentWinner}
							ftcMode={ftcMode}
							colors={{ RED, BLUE, GOLD, BLACK, WHITE }}
							fontWeights={{ bold }}
						/>
						<FinalsMatchIndicator
							x={910}
							y={370}
							matchNumber={6}
							getFinalsMatchWinnerForDisplay={getFinalsMatchWinnerForDisplay}
							getFinalsMatchScoreForDisplay={getFinalsMatchScoreForDisplay}
							overtimeOffset={overtimeOffset}
							colors={{ RED, BLUE, GOLD, GREEN }}
							fontWeights={{ black, semibold }}
						/>
						<FinalsMatchIndicator
							x={940}
							y={370}
							matchNumber={7}
							getFinalsMatchWinnerForDisplay={getFinalsMatchWinnerForDisplay}
							getFinalsMatchScoreForDisplay={getFinalsMatchScoreForDisplay}
							overtimeOffset={overtimeOffset}
							colors={{ RED, BLUE, GOLD, GREEN }}
							fontWeights={{ black, semibold }}
						/>
						<FinalsMatchIndicator
							x={970}
							y={370}
							matchNumber={8}
							getFinalsMatchWinnerForDisplay={getFinalsMatchWinnerForDisplay}
							getFinalsMatchScoreForDisplay={getFinalsMatchScoreForDisplay}
							overtimeOffset={overtimeOffset}
							colors={{ RED, BLUE, GOLD, GREEN }}
							fontWeights={{ black, semibold }}
						/>
						<FinalsMatchIndicator
							x={1000}
							y={370}
							matchNumber={9}
							getFinalsMatchWinnerForDisplay={getFinalsMatchWinnerForDisplay}
							getFinalsMatchScoreForDisplay={getFinalsMatchScoreForDisplay}
							overtimeOffset={overtimeOffset}
							colors={{ RED, BLUE, GOLD, GREEN }}
							fontWeights={{ black, semibold }}
						/>
						<FinalsMatchIndicator
							x={1030}
							y={370}
							matchNumber={10}
							getFinalsMatchWinnerForDisplay={getFinalsMatchWinnerForDisplay}
							getFinalsMatchScoreForDisplay={getFinalsMatchScoreForDisplay}
							overtimeOffset={overtimeOffset}
							colors={{ RED, BLUE, GOLD, GREEN }}
							fontWeights={{ black, semibold }}
						/>
						<FinalsMatchIndicator
							x={1070}
							y={370}
							matchNumber={11}
							getFinalsMatchWinnerForDisplay={getFinalsMatchWinnerForDisplay}
							getFinalsMatchScoreForDisplay={getFinalsMatchScoreForDisplay}
							overtimeOffset={overtimeOffset}
							colors={{ RED, BLUE, GOLD, GREEN }}
							fontWeights={{ black, semibold }}
						/>

						<Match
							x={533}
							y={468.54}
							matchNumber={5}
							onClick={() => setMatchWinner(5)}
							isCurrentMatch={isCurrentMatch(5)}
							getMatchLabel={getMatchLabel}
							getAllianceNameForDisplay={getAllianceNameForDisplay}
							getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
							getMatchWinnerForDisplay={getMatchWinnerForDisplay}
							getMatchScoreForDisplay={getMatchScoreForDisplay}
							colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
							fontWeights={{ bold }}
						/>
						<Match
							x={291}
							y={538.54}
							matchNumber={4}
							onClick={() => setMatchWinner(4)}
							isCurrentMatch={isCurrentMatch(4)}
							getMatchLabel={getMatchLabel}
							getAllianceNameForDisplay={getAllianceNameForDisplay}
							getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
							getMatchWinnerForDisplay={getMatchWinnerForDisplay}
							getMatchScoreForDisplay={getMatchScoreForDisplay}
							colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
							fontWeights={{ bold }}
						/>
						<Match
							x={289}
							y={138.54}
							matchNumber={3}
							onClick={() => setMatchWinner(3)}
							isCurrentMatch={isCurrentMatch(3)}
							getMatchLabel={getMatchLabel}
							getAllianceNameForDisplay={getAllianceNameForDisplay}
							getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
							getMatchWinnerForDisplay={getMatchWinnerForDisplay}
							getMatchScoreForDisplay={getMatchScoreForDisplay}
							colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
							fontWeights={{ bold }}
						/>
						<Match
							x={64}
							y={177.54}
							matchNumber={2}
							onClick={() => setMatchWinner(2)}
							isCurrentMatch={isCurrentMatch(2)}
							getMatchLabel={getMatchLabel}
							getAllianceNameForDisplay={getAllianceNameForDisplay}
							getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
							getMatchWinnerForDisplay={getMatchWinnerForDisplay}
							getMatchScoreForDisplay={getMatchScoreForDisplay}
							colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
							fontWeights={{ bold }}
						/>
						<Match
							x={64}
							y={100.54}
							matchNumber={1}
							onClick={() => setMatchWinner(1)}
							isCurrentMatch={isCurrentMatch(1)}
							getMatchLabel={getMatchLabel}
							getAllianceNameForDisplay={getAllianceNameForDisplay}
							getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
							getMatchWinnerForDisplay={getMatchWinnerForDisplay}
							getMatchScoreForDisplay={getMatchScoreForDisplay}
							colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
							fontWeights={{ bold }}
						/>
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

export default FourAllianceBracket;