import _ from "lodash";
import { getAllianceLookupEntry } from "../utils/allianceLookup";

/**
 * Finds a team by their station assignment
 * @param teams the array of team objects
 * @param station the station to find (e.g., "Red1", "Red2", "Red3", "Blue1", "Blue2", "Blue3")
 * @returns the team number or null if not found
 */
export const getTeamByStation = (teams, station) => {
	if (!teams || !Array.isArray(teams)) return null;
	const team = teams.find((t) => t?.station?.toLowerCase() === station?.toLowerCase());
	return team?.teamNumber ?? team?.team ?? null;
};

/**
 * Finds the last match in a series (highest originalMatchNumber or matchNumber)
 * @param scheduleToCheck the schedule array to search
 * @param series the series number to find matches for
 * @returns the last match object, or null if no matches found
 */
export const findLastMatchInSeries = (scheduleToCheck, series) => {
	const seriesMatches = scheduleToCheck.filter(
		(m) => m.series === series
	);

	if (seriesMatches.length === 0) return null;

	return seriesMatches.reduce((prev, current) => {
		const prevMatchNum = prev.originalMatchNumber || prev.matchNumber;
		const currentMatchNum = current.originalMatchNumber || current.matchNumber;
		return (currentMatchNum > prevMatchNum) ? current : prev;
	});
};

/**
 * Counts tiebreaker matches for a given bracket match number in FTC mode
 * @param bracketMatchNumber The match number displayed on the bracket
 * @param ftcMode Whether FTC mode is enabled
 * @param offlinePlayoffSchedule The offline playoff schedule object
 * @param matches The matches array
 * @returns The number of tiebreaker matches for this series, or 0 if none
 */
export const getTiebreakerCount = (bracketMatchNumber, ftcMode, offlinePlayoffSchedule, matches) => {
	if (!ftcMode) return 0;

	const series = bracketMatchNumber;
	const scheduleToCheck = offlinePlayoffSchedule?.schedule || matches;
	const lastMatch = findLastMatchInSeries(scheduleToCheck, series);

	if (!lastMatch) return 0;

	const lastMatchNumber = lastMatch.originalMatchNumber || lastMatch.matchNumber;

	if (lastMatchNumber > 1) {
		return lastMatchNumber - 1;
	}

	return 0;
};

/**
 * Formats the match label with tiebreaker indicator for FTC mode
 * @param bracketMatchNumber The match number displayed on the bracket
 * @param ftcMode Whether FTC mode is enabled
 * @param offlinePlayoffSchedule The offline playoff schedule object
 * @param matches The matches array
 * @returns Formatted match label (e.g., "MATCH 8" or "MATCH 8+1")
 */
export const getMatchLabel = (bracketMatchNumber, ftcMode, offlinePlayoffSchedule, matches) => {
	const baseLabel = `MATCH ${bracketMatchNumber}`;
	if (!ftcMode) return baseLabel;

	const tiebreakerCount = getTiebreakerCount(bracketMatchNumber, ftcMode, offlinePlayoffSchedule, matches);
	return tiebreakerCount > 0 ? `${baseLabel}+${tiebreakerCount}` : baseLabel;
};

/**
 * Helper function to check if a bracket match should be highlighted as the current match.
 * In FTC mode, highlights all matches in the same series as the current match.
 * @param bracketMatchNumber The bracket match number to check
 * @param currentPlayoffMatch The current playoff match ordinal
 * @param ftcMode Whether FTC mode is enabled
 * @param offlinePlayoffSchedule The offline playoff schedule object
 * @param matches The matches array
 * @returns true if this bracket match should be highlighted
 */
export const isCurrentMatchHelper = (bracketMatchNumber, currentPlayoffMatch, ftcMode, offlinePlayoffSchedule, matches) => {
	if (!ftcMode) {
		return currentPlayoffMatch === bracketMatchNumber;
	}

	const scheduleToCheck = offlinePlayoffSchedule?.schedule || matches;
	const currentMatchObj = scheduleToCheck[currentPlayoffMatch - 1];

	if (!currentMatchObj || !currentMatchObj.series) {
		return currentPlayoffMatch === bracketMatchNumber;
	}

	return currentMatchObj.series === bracketMatchNumber;
};

/**
 * Computes whether we're viewing a finals match (for gold background on "FINALS"/"BEST 2 of 3")
 * @param currentPlayoffMatch The current playoff match ordinal
 * @param finalsStartMatch The first finals match number for this bracket type
 * @param ftcMode Whether FTC mode is enabled
 * @param offlinePlayoffSchedule The offline playoff schedule object
 * @param matches The matches array
 * @returns true if currently viewing a finals match
 */
export const computeIsInFinalsView = (currentPlayoffMatch, finalsStartMatch, ftcMode, offlinePlayoffSchedule, matches) => {
	if (ftcMode) {
		const scheduleToCheck = offlinePlayoffSchedule?.schedule || matches;
		const currentMatchObj = scheduleToCheck[currentPlayoffMatch - 1];
		if (currentMatchObj?.series) {
			return currentMatchObj.series >= finalsStartMatch;
		} else {
			return currentPlayoffMatch >= finalsStartMatch;
		}
	} else {
		return currentPlayoffMatch >= finalsStartMatch;
	}
};

/**
 * Gets the match to use for displaying teams/alliances for a bracket match.
 * In FTC mode with tiebreakers, returns the last match in the series.
 * @param bracketMatchNumber The match number displayed on the bracket
 * @param ftcMode Whether FTC mode is enabled
 * @param offlinePlayoffSchedule The offline playoff schedule object
 * @param matches The matches array
 * @returns The match object to use for team display
 */
export const getMatchForTeamDisplay = (bracketMatchNumber, ftcMode, offlinePlayoffSchedule, matches) => {
	if (!ftcMode) {
		const matchIndex = _.findIndex(matches, { "matchNumber": bracketMatchNumber });
		return matches?.[matchIndex];
	}

	const series = bracketMatchNumber;
	const scheduleToCheck = offlinePlayoffSchedule?.schedule || matches;
	const lastMatch = findLastMatchInSeries(scheduleToCheck, series);

	if (!lastMatch) {
		const matchIndex = _.findIndex(matches, { "matchNumber": bracketMatchNumber });
		return matches?.[matchIndex];
	}

	return lastMatch;
};

/**
 * Wrapper for allianceNumbers that uses the correct match from the series
 * @param bracketMatchNumber The match number displayed on the bracket
 * @param allianceColor The alliance color ("red" or "blue")
 * @param ftcMode Whether FTC mode is enabled
 * @param offlinePlayoffSchedule The offline playoff schedule object
 * @param matches The matches array
 * @param originalAllianceNumbers The original allianceNumbers function
 * @param alliances The alliances object
 * @param remapNumberToString The remapNumberToString function
 * @returns The alliance numbers string
 */
export const getAllianceNumbersForDisplay = (bracketMatchNumber, allianceColor, ftcMode, offlinePlayoffSchedule, matches, originalAllianceNumbers, alliances, remapNumberToString) => {
	if (!ftcMode) {
		return originalAllianceNumbers(bracketMatchNumber, allianceColor);
	}

	const match = getMatchForTeamDisplay(bracketMatchNumber, ftcMode, offlinePlayoffSchedule, matches);
	if (!match) {
		return originalAllianceNumbers(bracketMatchNumber, allianceColor);
	}

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

	const targetAlliance = getAllianceLookupEntry(
		alliances?.Lookup,
		lookupTeam,
		remapNumberToString
	);
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
 * @param ftcMode Whether FTC mode is enabled
 * @param offlinePlayoffSchedule The offline playoff schedule object
 * @param matches The matches array
 * @param originalAllianceName The original allianceName function
 * @param alliances The alliances object
 * @param remapNumberToString The remapNumberToString function
 * @param tieLevel The tieLevel constant for this bracket type
 * @returns The alliance name string
 */
export const getAllianceNameForDisplay = (bracketMatchNumber, allianceColor, ftcMode, offlinePlayoffSchedule, matches, originalAllianceName, alliances, remapNumberToString, tieLevel) => {
	if (!ftcMode) {
		return originalAllianceName(bracketMatchNumber, allianceColor);
	}

	const match = getMatchForTeamDisplay(bracketMatchNumber, ftcMode, offlinePlayoffSchedule, matches);
	if (!match) {
		return originalAllianceName(bracketMatchNumber, allianceColor);
	}

	if (!match?.teams || !alliances?.Lookup) {
		return originalAllianceName(bracketMatchNumber, allianceColor);
	}

	const lookupTeam = getTeamByStation(match.teams, allianceColor === "red" ? "Red1" : "Blue1");
	if (!lookupTeam) {
		return originalAllianceName(bracketMatchNumber, allianceColor);
	}

	const targetAlliance = getAllianceLookupEntry(
		alliances?.Lookup,
		lookupTeam,
		remapNumberToString
	);
	if (!targetAlliance) {
		return originalAllianceName(bracketMatchNumber, allianceColor);
	}

	let allianceNameStr = targetAlliance?.alliance || "";

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
 * @param ftcMode Whether FTC mode is enabled
 * @param offlinePlayoffSchedule The offline playoff schedule object
 * @param matches The matches array
 * @param originalMatchScore The original matchScore function
 * @returns The score for the alliance
 */
export const getMatchScoreForDisplay = (bracketMatchNumber, alliance, ftcMode, offlinePlayoffSchedule, matches, originalMatchScore) => {
	if (!ftcMode) {
		return originalMatchScore(bracketMatchNumber, alliance);
	}

	const series = bracketMatchNumber;
	const scheduleToCheck = offlinePlayoffSchedule?.schedule || matches;
	const lastMatch = findLastMatchInSeries(scheduleToCheck, series);

	if (!lastMatch) {
		return originalMatchScore(bracketMatchNumber, alliance);
	}

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
 * @param ftcMode Whether FTC mode is enabled
 * @param offlinePlayoffSchedule The offline playoff schedule object
 * @param matches The matches array
 * @param originalMatchWinner The original matchWinner function
 * @returns The winner object
 */
export const getMatchWinnerForDisplay = (bracketMatchNumber, ftcMode, offlinePlayoffSchedule, matches, originalMatchWinner) => {
	if (!ftcMode) {
		return originalMatchWinner(bracketMatchNumber);
	}

	const series = bracketMatchNumber;
	const scheduleToCheck = offlinePlayoffSchedule?.schedule || matches;
	const lastMatch = findLastMatchInSeries(scheduleToCheck, series);

	if (!lastMatch) {
		return originalMatchWinner(bracketMatchNumber);
	}

	return lastMatch.winner || originalMatchWinner(bracketMatchNumber);
};
