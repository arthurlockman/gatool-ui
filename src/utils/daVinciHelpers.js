import { matchHasPostedResult } from "./playoffReserveEdits";

/**
 * Helper utilities for the Da Vinci Tournament round-robin bracket (FTCCMP1).
 *
 * The 6 Division Champions play matches 1–15 across 5 rounds, then the top 2
 * (RR1 = red, RR2 = blue) compete in a best-of-3 Event Finals (series 16).
 * Red (RR1, higher seed) wins the tournament with 1 victory; blue (RR2) needs 2.
 */

/**
 * Returns the finals series matches sorted by match number.
 * @param {object|null} offlinePlayoffSchedule
 * @param {Array|null} matches
 * @param {boolean} ftcMode
 * @returns {Array}
 */
export function getFinalSeriesMatches(offlinePlayoffSchedule, matches, ftcMode) {
	if (!ftcMode) return [];
	const schedule = offlinePlayoffSchedule?.schedule || matches;
	if (!schedule) return [];
	return schedule
		.filter((m) => m.series === 16)
		.sort((a, b) => {
			const aNum = a.originalMatchNumber ?? a.matchNumber ?? 0;
			const bNum = b.originalMatchNumber ?? b.matchNumber ?? 0;
			return aNum - bNum;
		});
}

/**
 * Computes the tournament winner from a list of finals series matches.
 * Red (RR1) wins with 1 victory; blue (RR2) needs 2. Tiebreaker overrides.
 * @param {Array} finalSeriesMatches
 * @returns {{ red: number, blue: number, winner: string, level: number }}
 */
export function computeDaVinciTournamentWinner(finalSeriesMatches) {
	const result = { red: 0, blue: 0, winner: "", level: 0 };

	for (const fm of finalSeriesMatches) {
		if (fm?.winner?.winner === "red") result.red += 1;
		if (fm?.winner?.winner === "blue") result.blue += 1;
	}

	if (result.red >= 1) {
		result.winner = "red";
	} else if (result.blue >= 2) {
		result.winner = "blue";
	}

	if (finalSeriesMatches.length > 0) {
		const lastFinal = finalSeriesMatches[finalSeriesMatches.length - 1];
		if (lastFinal?.winner?.tieWinner === "red") {
			result.winner = "red";
			result.level = lastFinal.winner.level;
		} else if (lastFinal?.winner?.tieWinner === "blue") {
			result.winner = "blue";
			result.level = lastFinal.winner.level;
		}
	}

	return result;
}

/**
 * Returns the score for a given finals slot index and alliance.
 * @param {Array} finalSeriesMatches
 * @param {number} slotIndex 0-based index into the finals series
 * @param {"red"|"blue"} alliance
 * @returns {number|null}
 */
export function getFinalsSlotScore(finalSeriesMatches, slotIndex, alliance) {
	const m = finalSeriesMatches[slotIndex];
	if (!m) return null;
	if (alliance === "red") return m.scoreRedFinal;
	if (alliance === "blue") return m.scoreBlueFinal;
	return null;
}

/**
 * Returns the winner object for a given finals slot index.
 * @param {Array} finalSeriesMatches
 * @param {number} slotIndex 0-based index into the finals series
 * @returns {object|null}
 */
export function getFinalsSlotWinner(finalSeriesMatches, slotIndex) {
	return finalSeriesMatches[slotIndex]?.winner ?? null;
}

/**
 * The round-robin match schedule for the da Vinci tournament.
 * Each entry: { matchNumber, round, redPlaceHolder, bluePlaceHolder }
 */
export const DA_VINCI_SCHEDULE = [
	// Round 1
	{ matchNumber: 1, round: 1, redPlaceHolder: "Franklin", bluePlaceHolder: "Edison" },
	{ matchNumber: 2, round: 1, redPlaceHolder: "Goodall",  bluePlaceHolder: "Jackson" },
	{ matchNumber: 3, round: 1, redPlaceHolder: "Ross",     bluePlaceHolder: "Lovelace" },
	// Round 2
	{ matchNumber: 4, round: 2, redPlaceHolder: "Franklin", bluePlaceHolder: "Goodall" },
	{ matchNumber: 5, round: 2, redPlaceHolder: "Jackson",  bluePlaceHolder: "Ross" },
	{ matchNumber: 6, round: 2, redPlaceHolder: "Edison",   bluePlaceHolder: "Lovelace" },
	// Round 3
	{ matchNumber: 7, round: 3, redPlaceHolder: "Franklin", bluePlaceHolder: "Jackson" },
	{ matchNumber: 8, round: 3, redPlaceHolder: "Edison",   bluePlaceHolder: "Ross" },
	{ matchNumber: 9, round: 3, redPlaceHolder: "Goodall",  bluePlaceHolder: "Lovelace" },
	// Round 4
	{ matchNumber: 10, round: 4, redPlaceHolder: "Ross",     bluePlaceHolder: "Franklin" },
	{ matchNumber: 11, round: 4, redPlaceHolder: "Edison",   bluePlaceHolder: "Goodall" },
	{ matchNumber: 12, round: 4, redPlaceHolder: "Lovelace", bluePlaceHolder: "Jackson" },
	// Round 5
	{ matchNumber: 13, round: 5, redPlaceHolder: "Goodall",  bluePlaceHolder: "Ross" },
	{ matchNumber: 14, round: 5, redPlaceHolder: "Jackson",  bluePlaceHolder: "Edison" },
	{ matchNumber: 15, round: 5, redPlaceHolder: "Lovelace", bluePlaceHolder: "Franklin" },
];

/**
 * FIRST Global round-robin schedule: 8 alliances, 16 matches across 4 rounds,
 * then the top 3 play a 3-match round-robin finals (t4).
 */
export const FG_ROUND_ROBIN_SCHEDULE = [
	// Round 1
	{ matchNumber: 1,  round: 1, redPlaceHolder: "Alliance 4", bluePlaceHolder: "Alliance 7" },
	{ matchNumber: 2,  round: 1, redPlaceHolder: "Alliance 5", bluePlaceHolder: "Alliance 6" },
	{ matchNumber: 3,  round: 1, redPlaceHolder: "Alliance 3", bluePlaceHolder: "Alliance 8" },
	{ matchNumber: 4,  round: 1, redPlaceHolder: "Alliance 1", bluePlaceHolder: "Alliance 2" },
	// Round 2
	{ matchNumber: 5,  round: 2, redPlaceHolder: "Alliance 5", bluePlaceHolder: "Alliance 4" },
	{ matchNumber: 6,  round: 2, redPlaceHolder: "Alliance 3", bluePlaceHolder: "Alliance 6" },
	{ matchNumber: 7,  round: 2, redPlaceHolder: "Alliance 2", bluePlaceHolder: "Alliance 7" },
	{ matchNumber: 8,  round: 2, redPlaceHolder: "Alliance 1", bluePlaceHolder: "Alliance 8" },
	// Round 3
	{ matchNumber: 9,  round: 3, redPlaceHolder: "Alliance 3", bluePlaceHolder: "Alliance 4" },
	{ matchNumber: 10, round: 3, redPlaceHolder: "Alliance 2", bluePlaceHolder: "Alliance 5" },
	{ matchNumber: 11, round: 3, redPlaceHolder: "Alliance 1", bluePlaceHolder: "Alliance 6" },
	{ matchNumber: 12, round: 3, redPlaceHolder: "Alliance 7", bluePlaceHolder: "Alliance 8" },
	// Round 4
	{ matchNumber: 13, round: 4, redPlaceHolder: "Alliance 2", bluePlaceHolder: "Alliance 3" },
	{ matchNumber: 14, round: 4, redPlaceHolder: "Alliance 1", bluePlaceHolder: "Alliance 4" },
	{ matchNumber: 15, round: 4, redPlaceHolder: "Alliance 5", bluePlaceHolder: "Alliance 8" },
	{ matchNumber: 16, round: 4, redPlaceHolder: "Alliance 6", bluePlaceHolder: "Alliance 7" },
];

export const FG_FINALS_SCHEDULE = [
	{ matchNumber: 17, redPlaceHolder: "RR1", bluePlaceHolder: "RR2" },
	{ matchNumber: 18, redPlaceHolder: "RR2", bluePlaceHolder: "RR3" },
	{ matchNumber: 19, redPlaceHolder: "RR1", bluePlaceHolder: "RR3" },
];

/**
 * Returns the finals matches for FIRST Global (t4 matches, no series).
 * These are the last matches in the combined schedule after the round-robin.
 * @param {Array|null} matches
 * @param {number} roundRobinMatchCount — number of round-robin matches (16 for FG)
 * @returns {Array}
 */
export function getFGFinalsMatches(matches, roundRobinMatchCount) {
	if (!matches) return [];
	return matches
		.filter((m) => m.matchNumber > roundRobinMatchCount)
		.sort((a, b) => (a.matchNumber ?? 0) - (b.matchNumber ?? 0));
}

/**
 * Ranks the three FIRST Global finalists by the sum of their two match scores.
 * Returns a match/color reference for displaying the champion using the same
 * alliance names and country-code/team-number formatting as the match cards.
 * Incomplete finals or tied totals do not establish a champion.
 * @param {Array} finalsMatches
 * @param {object} alliances
 * @returns {{ matchNumber: number, color: string, totalScore: number }|null}
 */
export function computeFGTournamentWinner(finalsMatches, alliances) {
	if (finalsMatches.length !== 3) return null;
	const standings = new Map();
	for (const match of finalsMatches) {
		if (!matchHasPostedResult(match)) return null;
		for (const color of ["red", "blue"]) {
			const score = color === "red" ? match.scoreRedFinal : match.scoreBlueFinal;
			if (score == null || !Number.isFinite(Number(score)) || Number(score) < 0) return null;
			const prefix = color === "red" ? "Red" : "Blue";
			const teams = match.teams?.filter((team) => team.station?.startsWith(prefix)) ?? [];
			if (!teams.length) return null;
			const alliance = teams
				.map((team) => alliances?.Lookup?.[team.teamNumber]?.alliance)
				.find((name) => name != null);
			const key = alliance != null
				? `alliance:${alliance}`
				: `teams:${teams.map((team) => team.teamNumber).sort().join(",")}`;
			const entry = standings.get(key) ?? {
				matchNumber: match.matchNumber, color, totalScore: 0, appearances: 0,
			};
			entry.totalScore += Number(score);
			entry.appearances += 1;
			standings.set(key, entry);
		}
	}
	const ranked = [...standings.values()].sort((a, b) => b.totalScore - a.totalScore);
	if (ranked.length !== 3 || ranked.some((entry) => entry.appearances !== 2)) return null;
	if (ranked[0].totalScore === ranked[1].totalScore) return null;
	const { matchNumber, color, totalScore } = ranked[0];
	return { matchNumber, color, totalScore };
}
