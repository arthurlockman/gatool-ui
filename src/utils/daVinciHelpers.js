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
