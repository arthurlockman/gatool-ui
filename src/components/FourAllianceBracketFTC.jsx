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

function FourAllianceBracketFTC({ currentMatch, qualsLength, nextMatch, previousMatch, getSchedule, useSwipe, usePullDownToUpdate, offlinePlayoffSchedule, setOfflinePlayoffSchedule, eventLabel, ftcMode,matches,allianceNumbers, allianceName, matchScore,matchWinner, alliances, remapNumberToString }) {
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
	
	// Helper function to check if a bracket match should be highlighted as the current match
	// In FTC mode, highlights all matches in the same series as the current match
	const isCurrentMatch = (bracketMatchNumber) => {
		if (!ftcMode) {
			// In FRC mode, use ordinal match number comparison
			return currentPlayoffMatch === bracketMatchNumber;
		}
		
		// In FTC mode, compare series numbers
		// Get the current match object
		const scheduleToCheck = offlinePlayoffSchedule?.schedule || matches;
		const currentMatchObj = scheduleToCheck[currentPlayoffMatch - 1];
		
		if (!currentMatchObj || !currentMatchObj.series) {
			// Fallback to ordinal comparison if series is not available
			return currentPlayoffMatch === bracketMatchNumber;
		}
		
		// In FTC mode, bracket match number equals series number
		// Highlight if the current match's series matches the bracket match's series
		return currentMatchObj.series === bracketMatchNumber;
	};
	
	// Check if we're viewing any finals match (for gold background on "FINALS"/"BEST 2 of 3")
	const isInFinalsView = currentPlayoffMatch >= finalsStartMatch;

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

	/**
	 * Counts tiebreaker matches for a given bracket match number in FTC mode
	 * @param bracketMatchNumber The match number displayed on the bracket (1-5 for regular matches)
	 * @returns The number of tiebreaker matches for this series, or 0 if none
	 */
	const getTiebreakerCount = (bracketMatchNumber) => {
		if (!ftcMode) return 0;
		
		// In FTC mode, bracket match number equals series number
		const series = bracketMatchNumber;
		
		// Try offlinePlayoffSchedule first (original uploaded schedule), then fall back to matches array
		// Use originalMatchNumber if available (preserved before transformation), otherwise use matchNumber
		const scheduleToCheck = offlinePlayoffSchedule?.schedule || matches;
		
		// Find all matches in this series
		const seriesMatches = scheduleToCheck.filter(
			(m) => m.series === series
		);
		
		if (seriesMatches.length === 0) return 0;
		
		// Find the last match in the series (highest originalMatchNumber or matchNumber)
		const lastMatch = seriesMatches.reduce((prev, current) => {
			const prevMatchNum = prev.originalMatchNumber || prev.matchNumber;
			const currentMatchNum = current.originalMatchNumber || current.matchNumber;
			return (currentMatchNum > prevMatchNum) ? current : prev;
		});
		
		// Use originalMatchNumber if available, otherwise matchNumber
		const lastMatchNumber = lastMatch.originalMatchNumber || lastMatch.matchNumber;
		
		// If the last match's matchNumber > 1, there were tiebreakers
		// The count is matchNumber - 1 (number of additional matches beyond the first)
		if (lastMatchNumber > 1) {
			return lastMatchNumber - 1;
		}
		
		return 0;
	};

	/**
	 * Formats the match label with tiebreaker indicator for FTC mode
	 * @param bracketMatchNumber The match number displayed on the bracket
	 * @returns Formatted match label (e.g., "MATCH 8" or "MATCH 8+1")
	 */
	const getMatchLabel = (bracketMatchNumber) => {
		const baseLabel = `MATCH ${bracketMatchNumber}`;
		if (!ftcMode) return baseLabel;
		
		const tiebreakerCount = getTiebreakerCount(bracketMatchNumber);
		return tiebreakerCount > 0 ? `${baseLabel}+${tiebreakerCount}` : baseLabel;
	};

	// Store original functions before we replace them
	const originalMatchScore = matchScore;
	const originalMatchWinner = matchWinner;
	const originalAllianceNumbers = allianceNumbers;
	const originalAllianceName = allianceName;

	/**
	 * Gets the match to use for displaying teams/alliances for a bracket match
	 * In FTC mode with tiebreakers, returns the last match in the series
	 * Otherwise returns the match found by the original functions
	 * @param bracketMatchNumber The match number displayed on the bracket
	 * @returns The match object to use for team display
	 */
	const getMatchForTeamDisplay = (bracketMatchNumber) => {
		if (!ftcMode) {
			// In non-FTC mode, find match by matchNumber
			const matchIndex = _.findIndex(matches, { "matchNumber": bracketMatchNumber });
			return matches?.[matchIndex];
		}
		
		// In FTC mode, bracket match number equals series number
		const series = bracketMatchNumber;
		const scheduleToCheck = offlinePlayoffSchedule?.schedule || matches;
		
		// Find all matches in this series
		const seriesMatches = scheduleToCheck.filter(
			(m) => m.series === series
		);
		
		if (seriesMatches.length === 0) {
			// Fallback to original lookup
			const matchIndex = _.findIndex(matches, { "matchNumber": bracketMatchNumber });
			return matches?.[matchIndex];
		}
		
		// Find the last match in the series (highest originalMatchNumber or matchNumber)
		const lastMatch = seriesMatches.reduce((prev, current) => {
			const prevMatchNum = prev.originalMatchNumber || prev.matchNumber;
			const currentMatchNum = current.originalMatchNumber || current.matchNumber;
			return (currentMatchNum > prevMatchNum) ? current : prev;
		});
		
		return lastMatch;
	};

	/**
	 * Wrapper for allianceNumbers that uses the correct match from the series
	 * @param bracketMatchNumber The match number displayed on the bracket
	 * @param allianceColor The alliance color ("red" or "blue")
	 * @returns The alliance numbers string
	 */
	const getAllianceNumbersForDisplay = (bracketMatchNumber, allianceColor) => {
		if (!ftcMode) {
			return originalAllianceNumbers(bracketMatchNumber, allianceColor);
		}
		
		const match = getMatchForTeamDisplay(bracketMatchNumber);
		if (!match) {
			return originalAllianceNumbers(bracketMatchNumber, allianceColor);
		}
		
		// Extract teams from the match and format them
		if (match?.description?.includes("Bye Match")) {
			return "Bye Match";
		}
		
		if (!match?.teams || !alliances?.Lookup) {
			return originalAllianceNumbers(bracketMatchNumber, allianceColor);
		}
		
		const lookupTeam = getTeamByStation(match.teams, allianceColor === "red" ? "Red1" : "Blue1");
		if (!lookupTeam) {
			return originalAllianceNumbers(bracketMatchNumber, allianceColor);
		}
		
		const targetAlliance = alliances.Lookup[`${remapNumberToString ? remapNumberToString(lookupTeam) : lookupTeam}`];
		if (!targetAlliance) {
			return originalAllianceNumbers(bracketMatchNumber, allianceColor);
		}
		
		const allianceMembers = _.compact([
			targetAlliance?.captain,
			targetAlliance?.round1,
			targetAlliance?.round2,
			targetAlliance?.round3,
			targetAlliance?.backup
		]);
		
		return allianceMembers.join("  ");
	};

	/**
	 * Wrapper for allianceName that uses the correct match from the series
	 * @param bracketMatchNumber The match number displayed on the bracket
	 * @param allianceColor The alliance color ("red" or "blue")
	 * @returns The alliance name string
	 */
	const getAllianceNameForDisplay = (bracketMatchNumber, allianceColor) => {
		if (!ftcMode) {
			return originalAllianceName(bracketMatchNumber, allianceColor);
		}
		
		const match = getMatchForTeamDisplay(bracketMatchNumber);
		if (!match) {
			return originalAllianceName(bracketMatchNumber, allianceColor);
		}
		
		// Extract team from the match and get alliance name
		if (!match?.teams || !alliances?.Lookup) {
			return originalAllianceName(bracketMatchNumber, allianceColor);
		}
		
		const lookupTeam = getTeamByStation(match.teams, allianceColor === "red" ? "Red1" : "Blue1");
		if (!lookupTeam) {
			return originalAllianceName(bracketMatchNumber, allianceColor);
		}
		
		const targetAlliance = alliances.Lookup[`${remapNumberToString ? remapNumberToString(lookupTeam) : lookupTeam}`];
		if (!targetAlliance) {
			return originalAllianceName(bracketMatchNumber, allianceColor);
		}
		
		let allianceNameStr = targetAlliance?.alliance || "";
		
		// Add tiebreaker indicator if applicable (for finals matches)
		const tieLevel = 6; // For four-alliance bracket
		if (bracketMatchNumber <= tieLevel || bracketMatchNumber === tieLevel + 6) {
			if (match?.winner?.tieWinner === "red" && allianceColor === "red") {
				allianceNameStr += ` (L${match.winner.level} WIN)`;
			}
		}
		
		return allianceNameStr;
	};

	/**
	 * Wrapper for matchScore that returns the score from the last match in series if tiebreakers exist
	 * @param bracketMatchNumber The match number displayed on the bracket
	 * @param alliance The alliance color ("red" or "blue")
	 * @returns The score for the alliance
	 */
	const getMatchScoreForDisplay = (bracketMatchNumber, alliance) => {
		if (!ftcMode) {
			return originalMatchScore(bracketMatchNumber, alliance);
		}
		
		// In FTC mode, bracket match number equals series number
		const series = bracketMatchNumber;
		const scheduleToCheck = offlinePlayoffSchedule?.schedule || matches;
		
		// Find all matches in this series
		const seriesMatches = scheduleToCheck.filter(
			(m) => m.series === series
		);
		
		if (seriesMatches.length === 0) {
			return originalMatchScore(bracketMatchNumber, alliance);
		}
		
		// Find the last match in the series (highest originalMatchNumber or matchNumber)
		const lastMatch = seriesMatches.reduce((prev, current) => {
			const prevMatchNum = prev.originalMatchNumber || prev.matchNumber;
			const currentMatchNum = current.originalMatchNumber || current.matchNumber;
			return (currentMatchNum > prevMatchNum) ? current : prev;
		});
		
		// Always use the last match's score (even if no tiebreakers, lastMatch is still the correct match)
		if (alliance === "red") {
			return lastMatch.scoreRedFinal;
		} else if (alliance === "blue") {
			return lastMatch.scoreBlueFinal;
		}
		
		return originalMatchScore(bracketMatchNumber, alliance);
	};

	/**
	 * Wrapper for matchWinner that returns the winner from the last match in series if tiebreakers exist
	 * @param bracketMatchNumber The match number displayed on the bracket
	 * @returns The winner object
	 */
	const getMatchWinnerForDisplay = (bracketMatchNumber) => {
		if (!ftcMode) {
			return originalMatchWinner(bracketMatchNumber);
		}
		
		// In FTC mode, bracket match number equals series number
		const series = bracketMatchNumber;
		const scheduleToCheck = offlinePlayoffSchedule?.schedule || matches;
		
		// Find all matches in this series
		const seriesMatches = scheduleToCheck.filter(
			(m) => m.series === series
		);
		
		if (seriesMatches.length === 0) {
			return originalMatchWinner(bracketMatchNumber);
		}
		
		// Find the last match in the series (highest originalMatchNumber or matchNumber)
		const lastMatch = seriesMatches.reduce((prev, current) => {
			const prevMatchNum = prev.originalMatchNumber || prev.matchNumber;
			const currentMatchNum = current.originalMatchNumber || current.matchNumber;
			return (currentMatchNum > prevMatchNum) ? current : prev;
		});
		
		// Always use the last match's winner (even if no tiebreakers, lastMatch is still the correct match)
		return lastMatch.winner || originalMatchWinner(bracketMatchNumber);
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

	// FTC Finals: series 6-11 are displayed as match numbers 6-11 in the bracket
	// Access by array index (series - 1), so indices 5-10 for display matches 6-11
	// Red (higher seed) wins with 1 victory, Blue (lower seed) needs 2 victories
	
	// Find the final series (highest series number in finals range)
	let finalSeries = 11; // Default to highest series in finals range
	const scheduleToCheck = offlinePlayoffSchedule?.schedule || matches;
	const finalsSeriesNumbers = scheduleToCheck
		.filter((m) => m.series >= 6 && m.series <= 11)
		.map((m) => m.series);
	if (finalsSeriesNumbers.length > 0) {
		finalSeries = Math.max(...finalsSeriesNumbers);
	}
	
	// Get all matches from the final series sorted by match number
	const finalSeriesMatchesForDisplay = scheduleToCheck
		.filter((m) => m.series === finalSeries)
		.sort((a, b) => {
			const aMatchNum = a.originalMatchNumber || a.matchNumber;
			const bMatchNum = b.originalMatchNumber || b.matchNumber;
			return aMatchNum - bMatchNum;
		});
	
	// Helper function to check if a bracket match number should be displayed
	const shouldDisplayFinalsMatch = (bracketMatchNumber) => {
		// Map bracket position to match index: match 6 = index 0, match 7 = index 1, etc.
		const positionIndex = bracketMatchNumber - 6;
		return positionIndex < finalSeriesMatchesForDisplay.length;
	};
	
	// Helper function to get score for a finals match position
	const getFinalsMatchScoreForDisplay = (bracketMatchNumber, alliance) => {
		// Map bracket position to match index: match 6 = index 0, match 7 = index 1, etc.
		const positionIndex = bracketMatchNumber - 6;
		const match = finalSeriesMatchesForDisplay[positionIndex];
		if (!match) return null;
		
		if (alliance === "red") {
			return match.scoreRedFinal;
		} else if (alliance === "blue") {
			return match.scoreBlueFinal;
		}
		return null;
	};
	
	// Helper function to get winner for a finals match position
	const getFinalsMatchWinnerForDisplay = (bracketMatchNumber) => {
		// Map bracket position to match index: match 6 = index 0, match 7 = index 1, etc.
		const positionIndex = bracketMatchNumber - 6;
		const match = finalSeriesMatchesForDisplay[positionIndex];
		if (!match) return null;
		return match.winner;
	};
	
	// Only count matches from the final series
	const finalSeriesMatches = scheduleToCheck.filter((m) => m.series === finalSeries);
	
	for (const finalsMatch of finalSeriesMatches) {
		if (finalsMatch?.winner?.winner === "red") {
			tournamentWinner.red += 1;
		}
		if (finalsMatch?.winner?.winner === "blue") {
			tournamentWinner.blue += 1;
		}
	}
	
	if (tournamentWinner?.red >= 1) {
		tournamentWinner.winner = "red";
	} else if (tournamentWinner?.blue >= 2) {
		tournamentWinner.winner = "blue";
	} else if (finalSeriesMatches.length > 0) {
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
									<Col style={{ backgroundColor: "red", color: "white", fontWeight: "bold", fontSize: "40px", textAlign: "center", padding: "50px 0" }} xs={(winnerMatch < 14) ? 5 : 4} onClick={() => { handleChooseWinner("red") }} variant="danger">{getAllianceNameForDisplay(winnerMatch, "red")}</Col>
									{(winnerMatch < 14) &&
										<Col xs={2}></Col>}
									{((offlinePlayoffSchedule?.schedule?.length > 14) && (winnerMatch >= 14)) &&
										<>
											<Col xs={1}></Col>
											<Col style={{ backgroundColor: "green", color: "white", fontWeight: "bold", fontSize: "40px", textAlign: "center", padding: "50px 0" }} xs={2} onClick={() => { handleChooseWinner("tie") }}>It's a Tie!</Col>
											<Col xs={1}></Col>
										</>
									}
									<Col style={{ backgroundColor: "blue", color: "white", fontWeight: "bold", fontSize: "40px", textAlign: "center", padding: "50px 0" }} xs={(winnerMatch < 14) ? 5 : 4} onClick={() => { handleChooseWinner("blue") }}>{getAllianceNameForDisplay(winnerMatch, "blue")}</Col>
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
									<Col style={{ backgroundColor: winningAlliance === "blue" ? "blue" : winningAlliance === "red" ? "red" : "green", color: "white", fontWeight: "bold", fontSize: "40px", textAlign: "center", padding: "50px 0" }} xs={4} onClick={handleConfirmWinner}>{winningAlliance === "tie" ? "It's a tie!" : getAllianceNameForDisplay(winnerMatch, winningAlliance)}</Col>
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