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

function FourAllianceBracketFTC({ currentMatch, qualsLength, nextMatch, previousMatch, getSchedule, useSwipe, usePullDownToUpdate, offlinePlayoffSchedule, setOfflinePlayoffSchedule, eventLabel, ftcMode,matches,allianceNumbers, allianceName, matchScore,matchWinner, alliances, remapNumberToString }) {
	const { showSelectWinner, setShowSelectWinner, showConfirmWinner, winningAlliance, winnerMatch, setWinnerMatch, handleChooseWinner, handleClose, resetWinnerState } = useBracketState();

	const currentPlayoffMatch = currentMatch - qualsLength;
	const finalsStartMatch = 6; // First finals match for 4-alliance bracket
	
	const isCurrentMatch = (bracketMatchNumber) => isCurrentMatchHelper(bracketMatchNumber, currentPlayoffMatch, ftcMode, offlinePlayoffSchedule, matches);
	
	const isInFinalsView = computeIsInFinalsView(currentPlayoffMatch, finalsStartMatch, ftcMode, offlinePlayoffSchedule, matches);

	const getMatchLabel = (bracketMatchNumber) => getMatchLabelHelper(bracketMatchNumber, ftcMode, offlinePlayoffSchedule, matches);

	// Store original functions before we replace them
	const originalMatchScore = matchScore;
	const originalMatchWinner = matchWinner;
	const originalAllianceNumbers = allianceNumbers;
	const originalAllianceName = allianceName;

	const getAllianceNumbersForDisplay = (bracketMatchNumber, allianceColor) => getAllianceNumbersForDisplayHelper(bracketMatchNumber, allianceColor, ftcMode, offlinePlayoffSchedule, matches, originalAllianceNumbers, alliances, remapNumberToString);

	const getAllianceNameForDisplay = (bracketMatchNumber, allianceColor) => getAllianceNameForDisplayHelper(bracketMatchNumber, allianceColor, ftcMode, offlinePlayoffSchedule, matches, originalAllianceName, alliances, remapNumberToString, 6);

	const getMatchScoreForDisplay = (bracketMatchNumber, alliance) => getMatchScoreForDisplayHelper(bracketMatchNumber, alliance, ftcMode, offlinePlayoffSchedule, matches, originalMatchScore);

	const getMatchWinnerForDisplay = (bracketMatchNumber) => getMatchWinnerForDisplayHelper(bracketMatchNumber, ftcMode, offlinePlayoffSchedule, matches, originalMatchWinner);

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

	// FTC Finals: bracket match numbers 6, 7, 8, ... correspond to series 6, 7, 8, ...
	// Each slot shows the (last) match in that series. Red (higher seed) wins with 1 victory, Blue needs 2.
	const scheduleToCheck = offlinePlayoffSchedule?.schedule || matches;
	
	// Helper: get the last (deciding) match for a given series
	const getLastMatchInSeries = (seriesNum) => {
		const seriesMatches = scheduleToCheck.filter((m) => m.series === seriesNum);
		if (seriesMatches.length === 0) return null;
		return seriesMatches.reduce((prev, current) => {
			const prevMatchNum = prev.originalMatchNumber ?? prev.matchNumber ?? 0;
			const currentMatchNum = current.originalMatchNumber ?? current.matchNumber ?? 0;
			return currentMatchNum > prevMatchNum ? current : prev;
		});
	};
	
	// Helper function to check if a bracket match number should be displayed (series has at least one match)
	const shouldDisplayFinalsMatch = (bracketMatchNumber) => {
		const seriesNum = bracketMatchNumber;
		return scheduleToCheck.some((m) => m.series === seriesNum);
	};
	
	// Helper function to get score for a finals match: bracket N → series N, use last match in that series
	const getFinalsMatchScoreForDisplay = (bracketMatchNumber, alliance) => {
		const match = getLastMatchInSeries(bracketMatchNumber);
		if (!match) return null;
		if (alliance === "red") return match.scoreRedFinal;
		if (alliance === "blue") return match.scoreBlueFinal;
		return null;
	};
	
	// Helper function to get winner for a finals match: derive from redWins/blueWins (FTC API) or match.winner
	const getFinalsMatchWinnerForDisplay = (bracketMatchNumber) => {
		const match = getLastMatchInSeries(bracketMatchNumber);
		if (!match) return null;
		if (match.winner?.winner) return match.winner;
		if (match.redWins === true && match.blueWins === false) return { winner: "red" };
		if (match.blueWins === true && match.redWins === false) return { winner: "blue" };
		if (match.redWins === false && match.blueWins === false) return { winner: "tie" };
		return null;
	};
	
	// Tournament winner: count wins in finals series (6 and 7 for 4-alliance). Red wins with 1, Blue with 2.
	const finalsSeriesNumbers = [...new Set(scheduleToCheck.filter((m) => m.series >= 6).map((m) => m.series))].sort((a, b) => a - b);
	const finalSeriesMatches = scheduleToCheck.filter((m) => m.series >= 6);
	
	// Count series wins in finals (each series 6, 7, ... has one outcome: last match winner)
	for (const seriesNum of finalsSeriesNumbers) {
		const lastMatch = getLastMatchInSeries(seriesNum);
		if (!lastMatch) continue;
		const winner = lastMatch.winner?.winner ?? (lastMatch.redWins ? "red" : lastMatch.blueWins ? "blue" : null);
		if (winner === "red") tournamentWinner.red += 1;
		if (winner === "blue") tournamentWinner.blue += 1;
	}
	
	if (tournamentWinner?.red >= 1) {
		tournamentWinner.winner = "red";
	} else if (tournamentWinner?.blue >= 2) {
		tournamentWinner.winner = "blue";
	} else if (finalSeriesMatches.length > 0) {
		// Find the last match in the finals (highest series, then highest matchNumber)
		const lastFinalMatch = finalSeriesMatches.reduce((prev, current) => {
			const prevSeries = prev.series ?? 0;
			const currentSeries = current.series ?? 0;
			if (currentSeries !== prevSeries) return currentSeries > prevSeries ? current : prev;
			const prevMatchNum = prev.originalMatchNumber ?? prev.matchNumber ?? 0;
			const currentMatchNum = current.originalMatchNumber ?? current.matchNumber ?? 0;
			return currentMatchNum > prevMatchNum ? current : prev;
		});
		
		if (lastFinalMatch?.winner?.tieWinner === "red") {
			tournamentWinner.winner = "red";
			tournamentWinner.level = lastFinalMatch?.winner?.level;
		} else if (lastFinalMatch?.winner?.tieWinner === "blue") {
			tournamentWinner.winner = "blue";
			tournamentWinner.level = lastFinalMatch?.winner?.level;
		}
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
		<div className="gatool-playoff-bracket" style={{
			"width": "100%"
		}} {...swipeHandlers}>
			{!matches && <div>
				<Alert variant="warning" className="gatool-awaiting-message"><div><img src="loadingIcon.gif" alt="Loading data..." /></div><div>Waiting for Playoff Match Schedule</div></Alert>
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
						{shouldDisplayFinalsMatch(6) && (
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
						)}
						{shouldDisplayFinalsMatch(7) && (
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
						)}
						{shouldDisplayFinalsMatch(8) && (
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
						)}
						{shouldDisplayFinalsMatch(9) && (
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
						)}
						{shouldDisplayFinalsMatch(10) && (
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
						)}
						{shouldDisplayFinalsMatch(11) && (
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
						)}

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
							redPlaceHolder="Loser of M4"
							bluePlaceHolder="Winner of M3"
							colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
							fontWeights={{ bold }}
						/>
						{/* FTC reverses Match 3 and 4 when compared to FRC. */}
						<Match
							x={291}
							y={538.54}
							matchNumber={3}
							onClick={() => setMatchWinner(3)}
							isCurrentMatch={isCurrentMatch(3)}
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
						{/* FTC reverses Match 3 and 4 when compared to FRC. */}
						<Match
							x={289}
							y={138.54}
							matchNumber={4}
							onClick={() => setMatchWinner(4)}
							isCurrentMatch={isCurrentMatch(4)}
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
							redPlaceHolder="Alliance 2"
							bluePlaceHolder="Alliance 3"
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
							redPlaceHolder="Alliance 1"
							bluePlaceHolder="Alliance 4"
							colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
							fontWeights={{ bold }}
						/>

					</svg>
					<WinnerSelectionModal
						showSelectWinner={showSelectWinner}
						showConfirmWinner={showConfirmWinner}
						winnerMatch={winnerMatch}
						winningAlliance={winningAlliance}
						matches={matches}
						finalsStartMatch={6}
						offlinePlayoffSchedule={offlinePlayoffSchedule}
						getAllianceNameForDisplay={getAllianceNameForDisplay}
						handleChooseWinner={handleChooseWinner}
						handleConfirmWinner={handleConfirmWinner}
						handleClose={handleClose}
					/>
				</>
			}
		</div>

	)
}

export default FourAllianceBracketFTC;