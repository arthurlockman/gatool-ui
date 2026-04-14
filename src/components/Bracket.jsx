import _ from "lodash";
import { Alert } from "react-bootstrap";
import moment from "moment";
import { useHotkeys } from "react-hotkeys-hook";
import { useSwipeable } from "react-swipeable";
import { matchClassesBase } from "../data/matchClasses";
import Match from "./Match";
import PlayoffMatch from "./PlayoffMatch";
import FinalsMatchIndicator from "./FinalsMatchIndicator";
import { GOLD, RED, BLUE, GREEN, BLACK, WHITE, black, bold, semibold } from "./bracketConstants";
import { getTeamByStation, getMatchLabel as getMatchLabelHelper, isCurrentMatchHelper, computeIsInFinalsView, getAllianceNumbersForDisplay as getAllianceNumbersForDisplayHelper, getAllianceNameForDisplay as getAllianceNameForDisplayHelper, getMatchScoreForDisplay as getMatchScoreForDisplayHelper, getMatchWinnerForDisplay as getMatchWinnerForDisplayHelper } from "../utils/bracketHelpers";
import { useBracketState } from "../hooks/useBracketState";
import WinnerSelectionModal from "./WinnerSelectionModal";

function Bracket({ offlinePlayoffSchedule, setOfflinePlayoffSchedule, currentMatch, qualsLength, nextMatch, previousMatch, getSchedule, usePullDownToUpdate, useSwipe, eventLabel, playoffCountOverride, ftcMode, matches, allianceNumbers, allianceName, matchScore, matchWinner, alliances, remapNumberToString }) {
	const { showSelectWinner, setShowSelectWinner, showConfirmWinner, winningAlliance, winnerMatch, setWinnerMatch, handleChooseWinner, handleClose, resetWinnerState } = useBracketState();

	const currentPlayoffMatch = currentMatch - qualsLength;
	const finalsStartMatch = 14; // First finals match for 8-alliance bracket
	
	const isCurrentMatch = (bracketMatchNumber) => {
		return isCurrentMatchHelper(bracketMatchNumber, currentPlayoffMatch, ftcMode, offlinePlayoffSchedule, matches);
	};
	
	const isInFinalsView = computeIsInFinalsView(currentPlayoffMatch, finalsStartMatch, ftcMode, offlinePlayoffSchedule, matches);

	const getMatchLabel = (bracketMatchNumber) => {
		return getMatchLabelHelper(bracketMatchNumber, ftcMode, offlinePlayoffSchedule, matches);
	};

	// Store original functions before we replace them
	const originalMatchScore = matchScore;
	const originalMatchWinner = matchWinner;
	const originalAllianceNumbers = allianceNumbers;
	const originalAllianceName = allianceName;


	const getAllianceNumbersForDisplay = (bracketMatchNumber, allianceColor) => {
		return getAllianceNumbersForDisplayHelper(bracketMatchNumber, allianceColor, ftcMode, offlinePlayoffSchedule, matches, originalAllianceNumbers, alliances, remapNumberToString);
	};

	const getAllianceNameForDisplay = (bracketMatchNumber, allianceColor) => {
		return getAllianceNameForDisplayHelper(bracketMatchNumber, allianceColor, ftcMode, offlinePlayoffSchedule, matches, originalAllianceName, alliances, remapNumberToString, 13);
	};

	const getMatchScoreForDisplay = (bracketMatchNumber, alliance) => {
		return getMatchScoreForDisplayHelper(bracketMatchNumber, alliance, ftcMode, offlinePlayoffSchedule, matches, originalMatchScore);
	};

	const getMatchWinnerForDisplay = (bracketMatchNumber) => {
		return getMatchWinnerForDisplayHelper(bracketMatchNumber, ftcMode, offlinePlayoffSchedule, matches, originalMatchWinner);
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

	var matchClasses = _.cloneDeep(matchClassesBase.eightAlliance);

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
		}

	// 8-Alliance Finals: series 14-18 are displayed as match numbers 14-18 in the bracket
	// Access by array index (series - 1), so indices 13-18 for display matches 14-19
	
	// In FTC mode, find the final series (highest series number in finals range)
	let finalSeries = 18; // Default to highest series in finals range
	if (ftcMode) {
		const scheduleToCheck = offlinePlayoffSchedule?.schedule || matches;
		const finalsSeriesNumbers = scheduleToCheck
			.filter((m) => m.series >= 14 && m.series <= 18)
			.map((m) => m.series);
		if (finalsSeriesNumbers.length > 0) {
			finalSeries = Math.max(...finalsSeriesNumbers);
		}
	}
	
	// In FTC mode, get all matches from the final series sorted by match number
	const scheduleToCheckForFinals = offlinePlayoffSchedule?.schedule || matches;
	const finalSeriesMatchesForDisplay = ftcMode ? scheduleToCheckForFinals
		.filter((m) => m.series === finalSeries)
		.sort((a, b) => {
			const aMatchNum = a.originalMatchNumber || a.matchNumber;
			const bMatchNum = b.originalMatchNumber || b.matchNumber;
			return aMatchNum - bMatchNum;
		}) : [];
	
	// Helper function to check if a bracket match number should be displayed in FTC mode
	const shouldDisplayFinalsMatch = (bracketMatchNumber) => {
		if (!ftcMode) return true; // In FRC mode, show all finals matches
		// In FTC mode, only show matches from final series
		// Map bracket position to match index: match 14 = index 0, match 15 = index 1, etc.
		const positionIndex = bracketMatchNumber - 14;
		return positionIndex < finalSeriesMatchesForDisplay.length;
	};
	
	// Helper function to get score for a finals match position in FTC mode
	const getFinalsMatchScoreForDisplay = (bracketMatchNumber, alliance) => {
		if (!ftcMode) {
			return getMatchScoreForDisplay(bracketMatchNumber, alliance);
		}
		// Map bracket position to match index: match 14 = index 0, match 15 = index 1, etc.
		const positionIndex = bracketMatchNumber - 14;
		const match = finalSeriesMatchesForDisplay[positionIndex];
		if (!match) return null;
		
		if (alliance === "red") {
			return match.scoreRedFinal;
		} else if (alliance === "blue") {
			return match.scoreBlueFinal;
		}
		return null;
	};
	
	// Helper function to get winner for a finals match position in FTC mode
	const getFinalsMatchWinnerForDisplay = (bracketMatchNumber) => {
		if (!ftcMode) {
			return getMatchWinnerForDisplay(bracketMatchNumber);
		}
		// Map bracket position to match index: match 14 = index 0, match 15 = index 1, etc.
		const positionIndex = bracketMatchNumber - 14;
		const match = finalSeriesMatchesForDisplay[positionIndex];
		if (!match) return null;
		return match.winner;
	};
	
	// Only calculate tournament winner from matches in the final series (or all finals matches in FRC mode)
	if (ftcMode) {
		// In FTC mode, only count matches from the final series
		const scheduleToCheck = offlinePlayoffSchedule?.schedule || matches;
		const finalSeriesMatches = scheduleToCheck.filter((m) => m.series === finalSeries);
		
		for (const finalsMatch of finalSeriesMatches) {
			if (finalsMatch?.winner?.winner === "red") {
				tournamentWinner.red += 1;
			}
			if (finalsMatch?.winner?.winner === "blue") {
				tournamentWinner.blue += 1;
			}
		}
	} else {
		// In FRC mode, count all finals matches (series 14-18)
	for (var finalsMatchIndex = 13; finalsMatchIndex < 19; finalsMatchIndex++) {
		const finalsMatch = matches[finalsMatchIndex];
		if (finalsMatch?.winner?.winner === "red") {
				tournamentWinner.red += 1;
		}
		if (finalsMatch?.winner?.winner === "blue") {
				tournamentWinner.blue += 1;
		}
	}
	}
	
	// FTC: Red (higher seed) wins with 1 victory, Blue (lower seed) needs 2 victories
	// FRC: Both alliances need 2 victories (best of 3)
	if (ftcMode) {
		if (tournamentWinner.red >= 1) {
			tournamentWinner.winner = "red";
		} else if (tournamentWinner.blue >= 2) {
			tournamentWinner.winner = "blue";
		}
	} else {
		if (tournamentWinner.red >= 2) {
			tournamentWinner.winner = "red";
		} else if (tournamentWinner.blue >= 2) {
			tournamentWinner.winner = "blue";
		}
	}
	
	// Check for tiebreaker winner from the final series
	if (ftcMode) {
		const scheduleToCheck = offlinePlayoffSchedule?.schedule || matches;
		const finalSeriesMatches = scheduleToCheck.filter((m) => m.series === finalSeries);
		if (finalSeriesMatches.length > 0) {
			// Find the last match in the final series
			const lastFinalMatch = finalSeriesMatches.reduce((prev, current) => {
				const prevMatchNum = prev.originalMatchNumber || prev.matchNumber;
				const currentMatchNum = current.originalMatchNumber || current.matchNumber;
				return (currentMatchNum > prevMatchNum) ? current : prev;
			});
			
			if (lastFinalMatch?.winner?.tieWinner === "red") {
				tournamentWinner.winner = "red";
				tournamentWinner.level = lastFinalMatch?.winner?.level;
			} else if (lastFinalMatch?.winner?.tieWinner === "blue") {
				tournamentWinner.winner = "blue";
				tournamentWinner.level = lastFinalMatch?.winner?.level;
			}
		}
	} else {
		// FRC mode: check match 19 (index 18)
	if (matches[18]?.winner?.tieWinner === "red") {
		tournamentWinner.winner = "red";
		tournamentWinner.level = matches[18]?.winner?.level;
	} else if (matches[18]?.winner?.tieWinner === "blue") {
		tournamentWinner.winner = "blue";
		tournamentWinner.level = matches[18]?.winner?.level;
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
		resetWinnerState();

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
		<div className="gatool-playoff-bracket" {...swipeHandlers} style={{
			"width": "100%"
		}}>
			{!matches && <div>
				<Alert variant="warning" className="gatool-awaiting-message"><div><img src="loadingIcon.gif" alt="Loading data..." /></div><div>Waiting for Playoff Match Schedule</div></Alert>
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
							<text id="playoffBracket" transform="matrix(1 0 0 1 620 47.6909)" dominantBaseline="middle" textAnchor="middle" fontFamily={eventLabel?.length > 50 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={black} fontStyle={"normal"} fontSize="38px">{eventLabel}</text>
						</g>
						<PlayoffMatch
							x={1024}
							y={343.4}
							matchNumber={14}
							onClick={() => setMatchWinner(14)}
							isCurrentMatch={isCurrentMatch(14)}
							isInFinalsView={isInFinalsView}
							getAllianceNameForDisplay={getAllianceNameForDisplay}
							getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
							tournamentWinner={tournamentWinner}
							ftcMode={ftcMode}
							colors={{ RED, BLUE, GOLD, BLACK, WHITE }}
							fontWeights={{ bold }}
						/>
						{shouldDisplayFinalsMatch(14) && (
							<FinalsMatchIndicator
								x={1132}
								y={451}
								matchNumber={14}
								getFinalsMatchWinnerForDisplay={getFinalsMatchWinnerForDisplay}
								getFinalsMatchScoreForDisplay={getFinalsMatchScoreForDisplay}
								overtimeOffset={overtimeOffset}
								colors={{ RED, BLUE, GOLD, GREEN }}
								fontWeights={{ black, semibold }}
							/>
						)}
						{shouldDisplayFinalsMatch(15) && (
							<FinalsMatchIndicator
								x={1162}
								y={451}
								matchNumber={15}
								getFinalsMatchWinnerForDisplay={getFinalsMatchWinnerForDisplay}
								getFinalsMatchScoreForDisplay={getFinalsMatchScoreForDisplay}
								overtimeOffset={overtimeOffset}
								colors={{ RED, BLUE, GOLD, GREEN }}
								fontWeights={{ black, semibold }}
							/>
						)}
						{shouldDisplayFinalsMatch(16) && (
							<FinalsMatchIndicator
								x={1192}
								y={451}
								matchNumber={16}
								getFinalsMatchWinnerForDisplay={getFinalsMatchWinnerForDisplay}
								getFinalsMatchScoreForDisplay={getFinalsMatchScoreForDisplay}
								overtimeOffset={overtimeOffset}
								colors={{ RED, BLUE, GOLD, GREEN }}
								fontWeights={{ black, semibold }}
							/>
						)}
						{shouldDisplayFinalsMatch(17) && (
							<FinalsMatchIndicator
								x={1222}
								y={451}
								matchNumber={17}
								getFinalsMatchWinnerForDisplay={getFinalsMatchWinnerForDisplay}
								getFinalsMatchScoreForDisplay={getFinalsMatchScoreForDisplay}
								overtimeOffset={overtimeOffset}
								colors={{ RED, BLUE, GOLD, GREEN }}
								fontWeights={{ black, semibold }}
							/>
						)}
						{shouldDisplayFinalsMatch(18) && (
							<FinalsMatchIndicator
								x={1252}
								y={451}
								matchNumber={18}
								getFinalsMatchWinnerForDisplay={getFinalsMatchWinnerForDisplay}
								getFinalsMatchScoreForDisplay={getFinalsMatchScoreForDisplay}
								overtimeOffset={overtimeOffset}
								colors={{ RED, BLUE, GOLD, GREEN }}
								fontWeights={{ black, semibold }}
							/>
						)}
						{shouldDisplayFinalsMatch(19) && (
							<FinalsMatchIndicator
								x={1282}
								y={451}
								matchNumber={19}
								getFinalsMatchWinnerForDisplay={getFinalsMatchWinnerForDisplay}
								getFinalsMatchScoreForDisplay={getFinalsMatchScoreForDisplay}
								overtimeOffset={overtimeOffset}
								colors={{ RED, BLUE, GOLD, GREEN }}
								fontWeights={{ black, semibold }}
							/>
						)}


						<Match
							x={826}
							y={468.54}
							matchNumber={13}
							onClick={() => setMatchWinner(13)}
							isCurrentMatch={isCurrentMatch(13)}
							getMatchLabel={getMatchLabel}
							getAllianceNameForDisplay={getAllianceNameForDisplay}
							getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
							getMatchWinnerForDisplay={getMatchWinnerForDisplay}
							getMatchScoreForDisplay={getMatchScoreForDisplay}
							redPlaceHolder="Loser of M11"
							bluePlaceHolder="Winner of M12"
							colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
							fontWeights={{ bold }}
						/>
						<Match
							x={644}
							y={538.54}
							matchNumber={12}
							onClick={() => setMatchWinner(12)}
							isCurrentMatch={isCurrentMatch(12)}
							getMatchLabel={getMatchLabel}
							getAllianceNameForDisplay={getAllianceNameForDisplay}
							getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
							getMatchWinnerForDisplay={getMatchWinnerForDisplay}
							getMatchScoreForDisplay={getMatchScoreForDisplay}
							redPlaceHolder="Winner of M10"
							bluePlaceHolder="Winner of M9"
							colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
							fontWeights={{ bold }}
						/>
						<Match
							x={644}
							y={218.54}
							matchNumber={11}
							onClick={() => setMatchWinner(11)}
							isCurrentMatch={isCurrentMatch(11)}
							getMatchLabel={getMatchLabel}
							getAllianceNameForDisplay={getAllianceNameForDisplay}
							getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
							getMatchWinnerForDisplay={getMatchWinnerForDisplay}
							getMatchScoreForDisplay={getMatchScoreForDisplay}
							redPlaceHolder="Winner of M7"
							bluePlaceHolder="Winner of M8"
							colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
							fontWeights={{ bold }}
						/>
						<Match
							x={453}
							y={472.54}
							matchNumber={10}
							onClick={() => setMatchWinner(10)}
							isCurrentMatch={isCurrentMatch(10)}
							getMatchLabel={getMatchLabel}
							getAllianceNameForDisplay={getAllianceNameForDisplay}
							getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
							getMatchWinnerForDisplay={getMatchWinnerForDisplay}
							getMatchScoreForDisplay={getMatchScoreForDisplay}
							redPlaceHolder="Loser of M8"
							bluePlaceHolder="Winner of M5"
							colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
							fontWeights={{ bold }}
						/>
						<Match
							x={453}
							y={611.54}
							matchNumber={9}
							onClick={() => setMatchWinner(9)}
							isCurrentMatch={isCurrentMatch(9)}
							getMatchLabel={getMatchLabel}
							getAllianceNameForDisplay={getAllianceNameForDisplay}
							getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
							getMatchWinnerForDisplay={getMatchWinnerForDisplay}
							getMatchScoreForDisplay={getMatchScoreForDisplay}
							redPlaceHolder="Loser of M7"
							bluePlaceHolder="Winner of M6"
							colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
							fontWeights={{ bold }}
						/>
						<Match
							x={254}
							y={292.54}
							matchNumber={8}
							onClick={() => setMatchWinner(8)}
							isCurrentMatch={isCurrentMatch(8)}
							getMatchLabel={getMatchLabel}
							getAllianceNameForDisplay={getAllianceNameForDisplay}
							getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
							getMatchWinnerForDisplay={getMatchWinnerForDisplay}
							getMatchScoreForDisplay={getMatchScoreForDisplay}
							redPlaceHolder="Winner of M3"
							bluePlaceHolder="Winner of M4"
							colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
							fontWeights={{ bold }}
						/>
						<Match
							x={254}
							y={138.54}
							matchNumber={7}
							onClick={() => setMatchWinner(7)}
							isCurrentMatch={isCurrentMatch(7)}
							getMatchLabel={getMatchLabel}
							getAllianceNameForDisplay={getAllianceNameForDisplay}
							getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
							getMatchWinnerForDisplay={getMatchWinnerForDisplay}
							getMatchScoreForDisplay={getMatchScoreForDisplay}
							redPlaceHolder="Winner of M1"
							bluePlaceHolder="Winner of M2"
							colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
							fontWeights={{ bold }}
						/>
						<Match
							x={254}
							y={685.54}
							matchNumber={6}
							onClick={() => setMatchWinner(6)}
							isCurrentMatch={isCurrentMatch(6)}
							getMatchLabel={getMatchLabel}
							getAllianceNameForDisplay={getAllianceNameForDisplay}
							getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
							getMatchWinnerForDisplay={getMatchWinnerForDisplay}
							getMatchScoreForDisplay={getMatchScoreForDisplay}
							redPlaceHolder="Loser of M3"
							bluePlaceHolder="Loser of M4"
							colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
							fontWeights={{ bold }}
						/>
						<Match
							x={254}
							y={531.54}
							matchNumber={5}
							onClick={() => setMatchWinner(5)}
							isCurrentMatch={isCurrentMatch(5)}
							getMatchLabel={getMatchLabel}
							getAllianceNameForDisplay={getAllianceNameForDisplay}
							getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
							getMatchWinnerForDisplay={getMatchWinnerForDisplay}
							getMatchScoreForDisplay={getMatchScoreForDisplay}
							redPlaceHolder="Loser of M1"
							bluePlaceHolder="Loser of M2"
							colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
							fontWeights={{ bold }}
						/>
						<Match
							x={65}
							y={331.54}
							matchNumber={4}
							onClick={() => setMatchWinner(4)}
							isCurrentMatch={isCurrentMatch(4)}
							getMatchLabel={getMatchLabel}
							getAllianceNameForDisplay={getAllianceNameForDisplay}
							getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
							getMatchWinnerForDisplay={getMatchWinnerForDisplay}
							getMatchScoreForDisplay={getMatchScoreForDisplay}
							redPlaceHolder="Alliance 3"
							bluePlaceHolder="Alliance 6"
							colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
							fontWeights={{ bold }}
						/>
						<Match
							x={65}
							y={254.54}
							matchNumber={3}
							onClick={() => setMatchWinner(3)}
							isCurrentMatch={isCurrentMatch(3)}
							getMatchLabel={getMatchLabel}
							getAllianceNameForDisplay={getAllianceNameForDisplay}
							getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
							getMatchWinnerForDisplay={getMatchWinnerForDisplay}
							getMatchScoreForDisplay={getMatchScoreForDisplay}
							redPlaceHolder="Alliance 2"
							bluePlaceHolder="Alliance 7"
							colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
							fontWeights={{ bold }}
						/>
						<Match
							x={65}
							y={177.54}
							matchNumber={2}
							onClick={() => setMatchWinner(2)}
							isCurrentMatch={isCurrentMatch(2)}
							getMatchLabel={getMatchLabel}
							getAllianceNameForDisplay={getAllianceNameForDisplay}
							getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
							getMatchWinnerForDisplay={getMatchWinnerForDisplay}
							getMatchScoreForDisplay={getMatchScoreForDisplay}
							redPlaceHolder="Alliance 4"
							bluePlaceHolder="Alliance 5"
							colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
							fontWeights={{ bold }}
						/>
						<Match
							x={65}
							y={100.54}
							matchNumber={1}
							onClick={() => setMatchWinner(1)}
							isCurrentMatch={isCurrentMatch(1)}
							getMatchLabel={getMatchLabel}
							getAllianceNameForDisplay={getAllianceNameForDisplay}
							getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
							getMatchWinnerForDisplay={getMatchWinnerForDisplay}
							getMatchScoreForDisplay={getMatchScoreForDisplay}
							redPlaceHolder="Alliance 1"
							bluePlaceHolder="Alliance 8"
							colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
							fontWeights={{ bold }}
						/>
					</svg>
				</>}
			<WinnerSelectionModal
				showSelectWinner={showSelectWinner}
				showConfirmWinner={showConfirmWinner}
				winnerMatch={winnerMatch}
				winningAlliance={winningAlliance}
				matches={matches}
				finalsStartMatch={14}
				offlinePlayoffSchedule={offlinePlayoffSchedule}
				getAllianceNameForDisplay={getAllianceNameForDisplay}
				handleChooseWinner={handleChooseWinner}
				handleConfirmWinner={handleConfirmWinner}
				handleClose={handleClose}
			/>
		</div>
	)
}

export default Bracket;