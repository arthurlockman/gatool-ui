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

function SixAllianceBracket({ offlinePlayoffSchedule, setOfflinePlayoffSchedule, currentMatch, qualsLength, nextMatch, previousMatch, getSchedule, usePullDownToUpdate, useSwipe, eventLabel, playoffCountOverride, ftcMode, matches, allianceNumbers, allianceName, matchScore, matchWinner, alliances, remapNumberToString }) {
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
	const finalsStartMatch = 10; // First finals match for 6-alliance bracket
	
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
	 * @param bracketMatchNumber The match number displayed on the bracket (1-9 for regular matches)
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
		
		if (seriesMatches.length === 0) {
			return 0;
		}
		
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
		const tieLevel = 10; // For six-alliance bracket
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
		}

	// 6-Alliance Finals: series 10-15 are displayed as match numbers 10-15 in the bracket
	// In FTC mode, get all finals matches (series 10–15) sorted by series then match number, so bracket slots 10, 11, … map to Final 1, Final 2, …
	const scheduleToCheckForFinals = offlinePlayoffSchedule?.schedule || matches;
	const finalSeriesMatchesForDisplay = ftcMode ? scheduleToCheckForFinals
		.filter((m) => m.series >= 10 && m.series <= 15)
		.sort((a, b) => {
			const aSeries = a.series ?? 0;
			const bSeries = b.series ?? 0;
			if (aSeries !== bSeries) return aSeries - bSeries;
			const aMatchNum = a.originalMatchNumber ?? a.matchNumber ?? 0;
			const bMatchNum = b.originalMatchNumber ?? b.matchNumber ?? 0;
			return aMatchNum - bMatchNum;
		}) : [];
	
	// Helper function to check if a bracket match number should be displayed in FTC mode
	const shouldDisplayFinalsMatch = (bracketMatchNumber) => {
		if (!ftcMode) return true; // In FRC mode, show all finals matches
		// In FTC mode, only show matches from final series
		// Map bracket position to match index: match 10 = index 0, match 11 = index 1, etc.
		const positionIndex = bracketMatchNumber - 10;
		return positionIndex < finalSeriesMatchesForDisplay.length;
	};
	
	// Helper function to get score for a finals match position in FTC mode
	const getFinalsMatchScoreForDisplay = (bracketMatchNumber, alliance) => {
		if (!ftcMode) {
			return getMatchScoreForDisplay(bracketMatchNumber, alliance);
		}
		// Map bracket position to match index: match 10 = index 0, match 11 = index 1, etc.
		const positionIndex = bracketMatchNumber - 10;
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
		// Map bracket position to match index: match 10 = index 0, match 11 = index 1, etc.
		const positionIndex = bracketMatchNumber - 10;
		const match = finalSeriesMatchesForDisplay[positionIndex];
		if (!match) return null;
		return match.winner;
	};
	
	// Only calculate tournament winner from matches in the final series (or all finals matches in FRC mode)
	if (ftcMode) {
		// In FTC mode, count all finals matches (series 10–15), e.g. Final 1 and Final 2
		for (const finalsMatch of finalSeriesMatchesForDisplay) {
			if (finalsMatch?.winner?.winner === "red") {
				tournamentWinner.red += 1;
			}
			if (finalsMatch?.winner?.winner === "blue") {
				tournamentWinner.blue += 1;
			}
		}
	} else {
		// In FRC mode, count all finals matches (series 10-15)
	for (var finalsMatchIndex = 9; finalsMatchIndex < 15; finalsMatchIndex++) {
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
		if (finalSeriesMatchesForDisplay.length > 0) {
			// Last finals match (already sorted by series then matchNumber)
			const lastFinalMatch = finalSeriesMatchesForDisplay[finalSeriesMatchesForDisplay.length - 1];
			if (lastFinalMatch?.winner?.tieWinner === "red") {
				tournamentWinner.winner = "red";
				tournamentWinner.level = lastFinalMatch?.winner?.level;
			} else if (lastFinalMatch?.winner?.tieWinner === "blue") {
				tournamentWinner.winner = "blue";
				tournamentWinner.level = lastFinalMatch?.winner?.level;
			}
		}
	} else {
		// FRC mode: check match 15 (index 14)
	if (matches[14]?.winner?.tieWinner === "red") {
		tournamentWinner.winner = "red";
		tournamentWinner.level = matches[14]?.winner?.level;
	} else if (matches[14]?.winner?.tieWinner === "blue") {
		tournamentWinner.winner = "blue";
		tournamentWinner.level = matches[14]?.winner?.level;
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
						<PlayoffMatch
							x={1024}
							y={343.4}
							matchNumber={10}
							onClick={() => setMatchWinner(10)}
							isCurrentMatch={isCurrentMatch(10)}
							isInFinalsView={isInFinalsView}
							getAllianceNameForDisplay={getAllianceNameForDisplay}
							getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
							tournamentWinner={tournamentWinner}
							ftcMode={ftcMode}
							colors={{ RED, BLUE, GOLD, BLACK, WHITE }}
							fontWeights={{ bold }}
						/>
						{shouldDisplayFinalsMatch(10) && (
							<FinalsMatchIndicator
								x={1132}
								y={451}
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
								x={1162}
								y={451}
								matchNumber={11}
								getFinalsMatchWinnerForDisplay={getFinalsMatchWinnerForDisplay}
								getFinalsMatchScoreForDisplay={getFinalsMatchScoreForDisplay}
								overtimeOffset={overtimeOffset}
								colors={{ RED, BLUE, GOLD, GREEN }}
								fontWeights={{ black, semibold }}
							/>
						)}
						{shouldDisplayFinalsMatch(12) && (
							<FinalsMatchIndicator
								x={1192}
								y={451}
								matchNumber={12}
								getFinalsMatchWinnerForDisplay={getFinalsMatchWinnerForDisplay}
								getFinalsMatchScoreForDisplay={getFinalsMatchScoreForDisplay}
								overtimeOffset={overtimeOffset}
								colors={{ RED, BLUE, GOLD, GREEN }}
								fontWeights={{ black, semibold }}
							/>
						)}
						{shouldDisplayFinalsMatch(13) && (
							<FinalsMatchIndicator
								x={1222}
								y={451}
								matchNumber={13}
								getFinalsMatchWinnerForDisplay={getFinalsMatchWinnerForDisplay}
								getFinalsMatchScoreForDisplay={getFinalsMatchScoreForDisplay}
								overtimeOffset={overtimeOffset}
								colors={{ RED, BLUE, GOLD, GREEN }}
								fontWeights={{ black, semibold }}
							/>
						)}
						{shouldDisplayFinalsMatch(14) && (
							<FinalsMatchIndicator
								x={1252}
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
								x={1282}
								y={451}
								matchNumber={15}
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
							matchNumber={9}
							onClick={() => setMatchWinner(9)}
							isCurrentMatch={isCurrentMatch(9)}
							getMatchLabel={getMatchLabel}
							getAllianceNameForDisplay={getAllianceNameForDisplay}
							getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
							getMatchWinnerForDisplay={getMatchWinnerForDisplay}
							getMatchScoreForDisplay={getMatchScoreForDisplay}
							redPlaceHolder="Loser of M7"
							bluePlaceHolder="Winner of M8"
							colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
							fontWeights={{ bold }}
						/>
						<Match
							x={644}
							y={538.54}
							matchNumber={8}
							onClick={() => setMatchWinner(8)}
							isCurrentMatch={isCurrentMatch(8)}
							getMatchLabel={getMatchLabel}
							getAllianceNameForDisplay={getAllianceNameForDisplay}
							getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
							getMatchWinnerForDisplay={getMatchWinnerForDisplay}
							getMatchScoreForDisplay={getMatchScoreForDisplay}
							redPlaceHolder="Winner of M6"
							bluePlaceHolder="Winner of M5"
							colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
							fontWeights={{ bold }}
						/>
						<Match
							x={644}
							y={218.54}
							matchNumber={7}
							onClick={() => setMatchWinner(7)}
							isCurrentMatch={isCurrentMatch(7)}
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
							x={453}
							y={472.54}
							matchNumber={6}
							onClick={() => setMatchWinner(6)}
							isCurrentMatch={isCurrentMatch(6)}
							getMatchLabel={getMatchLabel}
							getAllianceNameForDisplay={getAllianceNameForDisplay}
							getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
							getMatchWinnerForDisplay={getMatchWinnerForDisplay}
							getMatchScoreForDisplay={getMatchScoreForDisplay}
							redPlaceHolder="Loser of M4"
							bluePlaceHolder="Loser of M1"
							colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
							fontWeights={{ bold }}
						/>
						<Match
							x={453}
							y={611.54}
							matchNumber={5}
							onClick={() => setMatchWinner(5)}
							isCurrentMatch={isCurrentMatch(5)}
							getMatchLabel={getMatchLabel}
							getAllianceNameForDisplay={getAllianceNameForDisplay}
							getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
							getMatchWinnerForDisplay={getMatchWinnerForDisplay}
							getMatchScoreForDisplay={getMatchScoreForDisplay}
							redPlaceHolder="Loser of M3"
							bluePlaceHolder="Loser of M2"
							colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
							fontWeights={{ bold }}
						/>
						<Match
							x={254}
							y={292.54}
							matchNumber={4}
							onClick={() => setMatchWinner(4)}
							isCurrentMatch={isCurrentMatch(4)}
							getMatchLabel={getMatchLabel}
							getAllianceNameForDisplay={getAllianceNameForDisplay}
							getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
							getMatchWinnerForDisplay={getMatchWinnerForDisplay}
							getMatchScoreForDisplay={getMatchScoreForDisplay}
							redPlaceHolder="Alliance 2"
							bluePlaceHolder="Winner of M2"
							colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
							fontWeights={{ bold }}
						/>
						<Match
							x={254}
							y={138.54}
							matchNumber={3}
							onClick={() => setMatchWinner(3)}
							isCurrentMatch={isCurrentMatch(3)}
							getMatchLabel={getMatchLabel}
							getAllianceNameForDisplay={getAllianceNameForDisplay}
							getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
							getMatchWinnerForDisplay={getMatchWinnerForDisplay}
							getMatchScoreForDisplay={getMatchScoreForDisplay}
							redPlaceHolder="Alliance 1"
							bluePlaceHolder="Winner of M1"
							colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
							fontWeights={{ bold }}
						/>
						<Match
							x={65}
							y={331.54}
							matchNumber={2}
							onClick={() => setMatchWinner(2)}
							isCurrentMatch={isCurrentMatch(2)}
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
							y={177.54}
							matchNumber={1}
							onClick={() => setMatchWinner(1)}
							isCurrentMatch={isCurrentMatch(1)}
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
					</svg>
				</>}
			<Modal centered={true} show={showSelectWinner} size="lg" onHide={handleClose}>
				<Modal.Header className={"allianceAccept"} closeVariant={"white"} closeButton>
					<Modal.Title >{winnerMatch >= 0 ? <b>Select a winner for {matches[winnerMatch - 1]?.description}</b> : <b>Select a winner  </b>}</Modal.Title>
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
		</div>
	)
}

export default SixAllianceBracket;