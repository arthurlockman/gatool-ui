import {
	getTeamByStation,
	findLastMatchInSeries,
	getTiebreakerCount,
	getMatchLabel,
	isCurrentMatchHelper,
	computeIsInFinalsView,
	getMatchForTeamDisplay,
	getAllianceNumbersForDisplay,
	getAllianceNameForDisplay,
	getMatchScoreForDisplay,
	getMatchWinnerForDisplay,
	getFrcScheduleRowByMatchNumber,
	countConsecutiveFrcFinalsWithResults,
	countConsecutiveFinalsSlotsFromWinnerGetter,
	countConsecutiveTwoAllianceFinalsWithResults,
} from "./bracketHelpers";

const team = (station, teamNumber) => ({ station, teamNumber });

const seriesMatch = (series, originalMatchNumber, extras = {}) => ({
	series,
	originalMatchNumber,
	matchNumber: originalMatchNumber,
	...extras,
});

describe("getTeamByStation", () => {
	const teams = [
		team("Red1", 111),
		team("Red2", 222),
		team("Red3", 333),
		team("Blue1", 444),
		team("Blue2", 555),
		team("Blue3", 666),
	];

	it("returns the team number for a matching station", () => {
		expect(getTeamByStation(teams, "Red1")).toBe(111);
		expect(getTeamByStation(teams, "Blue3")).toBe(666);
	});

	it("matches station case-insensitively", () => {
		expect(getTeamByStation(teams, "red2")).toBe(222);
		expect(getTeamByStation(teams, "BLUE1")).toBe(444);
	});

	it("falls back to the `team` field when `teamNumber` is absent", () => {
		const ts = [{ station: "Red1", team: 9999 }];
		expect(getTeamByStation(ts, "Red1")).toBe(9999);
	});

	it("returns null if no team matches the station", () => {
		expect(getTeamByStation(teams, "Red9")).toBeNull();
	});

	it("returns null for null/undefined/non-array input", () => {
		expect(getTeamByStation(null, "Red1")).toBeNull();
		expect(getTeamByStation(undefined, "Red1")).toBeNull();
		expect(getTeamByStation("not-an-array", "Red1")).toBeNull();
	});

	it("returns null when the matching team has neither teamNumber nor team", () => {
		expect(getTeamByStation([{ station: "Red1" }], "Red1")).toBeNull();
	});
});

describe("findLastMatchInSeries", () => {
	it("returns null when no matches belong to the series", () => {
		expect(findLastMatchInSeries([seriesMatch(2, 1)], 5)).toBeNull();
	});

	it("returns null when schedule is empty", () => {
		expect(findLastMatchInSeries([], 1)).toBeNull();
	});

	it("returns the only match when only one match in series exists", () => {
		const m = seriesMatch(3, 1);
		expect(findLastMatchInSeries([m], 3)).toBe(m);
	});

	it("returns the match with the highest originalMatchNumber", () => {
		const m1 = seriesMatch(7, 1);
		const m2 = seriesMatch(7, 2);
		const m3 = seriesMatch(7, 3);
		const other = seriesMatch(8, 9);
		expect(findLastMatchInSeries([m1, m3, other, m2], 7)).toBe(m3);
	});

	it("falls back to matchNumber when originalMatchNumber is missing", () => {
		const m1 = { series: 4, matchNumber: 1 };
		const m2 = { series: 4, matchNumber: 5 };
		expect(findLastMatchInSeries([m1, m2], 4)).toBe(m2);
	});
});

describe("getTiebreakerCount", () => {
	it("returns 0 when ftcMode is false", () => {
		expect(getTiebreakerCount(1, false, null, [seriesMatch(1, 5)])).toBe(0);
	});

	it("returns 0 when no matches exist for the series", () => {
		expect(getTiebreakerCount(2, true, null, [seriesMatch(1, 1)])).toBe(0);
	});

	it("returns 0 when last match is the first match (no tiebreakers)", () => {
		expect(getTiebreakerCount(3, true, null, [seriesMatch(3, 1)])).toBe(0);
	});

	it("returns lastMatchNumber - 1 when tiebreakers exist", () => {
		const sched = [seriesMatch(4, 1), seriesMatch(4, 2), seriesMatch(4, 3)];
		expect(getTiebreakerCount(4, true, null, sched)).toBe(2);
	});

	it("prefers offlinePlayoffSchedule.schedule over matches when present", () => {
		const offline = { schedule: [seriesMatch(5, 1), seriesMatch(5, 2)] };
		expect(getTiebreakerCount(5, true, offline, [])).toBe(1);
	});
});

describe("getMatchLabel", () => {
	it("returns base label when not in ftcMode", () => {
		expect(getMatchLabel(7, false, null, [])).toBe("MATCH 7");
	});

	it("returns base label in ftcMode with no tiebreakers", () => {
		expect(getMatchLabel(8, true, null, [seriesMatch(8, 1)])).toBe("MATCH 8");
	});

	it("appends +N tiebreakers in ftcMode", () => {
		const sched = [seriesMatch(8, 1), seriesMatch(8, 2)];
		expect(getMatchLabel(8, true, null, sched)).toBe("MATCH 8+1");
	});

	it("appends +2 when there are two tiebreakers", () => {
		const offline = {
			schedule: [seriesMatch(9, 1), seriesMatch(9, 2), seriesMatch(9, 3)],
		};
		expect(getMatchLabel(9, true, offline, [])).toBe("MATCH 9+2");
	});
});

describe("isCurrentMatchHelper", () => {
	it("compares directly when not in ftcMode", () => {
		expect(isCurrentMatchHelper(3, 3, false, null, [])).toBe(true);
		expect(isCurrentMatchHelper(3, 4, false, null, [])).toBe(false);
	});

	it("returns true when current match's series matches bracketMatchNumber (ftc)", () => {
		const sched = [seriesMatch(1, 1), seriesMatch(2, 1), seriesMatch(2, 2)];
		// currentPlayoffMatch=3 -> sched[2], series=2
		expect(isCurrentMatchHelper(2, 3, true, null, sched)).toBe(true);
		expect(isCurrentMatchHelper(1, 3, true, null, sched)).toBe(false);
	});

	it("falls back to direct comparison when current match has no series", () => {
		const sched = [{ matchNumber: 1 }];
		expect(isCurrentMatchHelper(1, 1, true, null, sched)).toBe(true);
		expect(isCurrentMatchHelper(2, 1, true, null, sched)).toBe(false);
	});

	it("falls back to direct comparison when currentMatchObj is missing", () => {
		expect(isCurrentMatchHelper(99, 99, true, null, [])).toBe(true);
		expect(isCurrentMatchHelper(99, 99, true, { schedule: [] }, [])).toBe(true);
		expect(isCurrentMatchHelper(4, 99, true, null, [])).toBe(false);
	});

	it("uses offlinePlayoffSchedule when provided", () => {
		const offline = { schedule: [seriesMatch(7, 1)] };
		expect(isCurrentMatchHelper(7, 1, true, offline, [])).toBe(true);
	});
});

describe("computeIsInFinalsView", () => {
	it("compares directly when not in ftcMode", () => {
		expect(computeIsInFinalsView(13, 13, false, null, [])).toBe(true);
		expect(computeIsInFinalsView(12, 13, false, null, [])).toBe(false);
	});

	it("uses series when current match has a series (ftc)", () => {
		const sched = [seriesMatch(13, 1)];
		expect(computeIsInFinalsView(1, 13, true, null, sched)).toBe(true);
		const sched2 = [seriesMatch(12, 1)];
		expect(computeIsInFinalsView(1, 13, true, null, sched2)).toBe(false);
	});

	it("falls back to direct comparison when no series on current match (ftc)", () => {
		const sched = [{ matchNumber: 1 }];
		expect(computeIsInFinalsView(13, 13, true, null, sched)).toBe(true);
		expect(computeIsInFinalsView(12, 13, true, null, sched)).toBe(false);
	});

	it("falls back to direct comparison when currentMatchObj is missing (ftc)", () => {
		expect(computeIsInFinalsView(13, 13, true, null, [])).toBe(true);
		expect(computeIsInFinalsView(12, 13, true, null, [])).toBe(false);
	});

	it("uses offlinePlayoffSchedule when provided", () => {
		const offline = { schedule: [seriesMatch(14, 1)] };
		expect(computeIsInFinalsView(1, 13, true, offline, [])).toBe(true);
	});
});

describe("getMatchForTeamDisplay", () => {
	it("returns matches[matchNumber] in non-ftc mode", () => {
		const matches = [
			{ matchNumber: 1, label: "a" },
			{ matchNumber: 2, label: "b" },
		];
		expect(getMatchForTeamDisplay(2, false, null, matches)).toEqual({
			matchNumber: 2,
			label: "b",
		});
	});

	it("returns undefined when match number not found in non-ftc mode", () => {
		expect(getMatchForTeamDisplay(99, false, null, [{ matchNumber: 1 }])).toBeUndefined();
	});

	it("returns last match in series in ftc mode", () => {
		const sched = [seriesMatch(3, 1), seriesMatch(3, 2)];
		expect(getMatchForTeamDisplay(3, true, null, sched)).toBe(sched[1]);
	});

	it("falls back to matches lookup when no series matches in ftc mode", () => {
		const matches = [{ matchNumber: 5, foo: "bar" }];
		expect(getMatchForTeamDisplay(5, true, null, matches)).toEqual({
			matchNumber: 5,
			foo: "bar",
		});
	});

	it("uses offlinePlayoffSchedule when provided in ftc mode", () => {
		const offline = { schedule: [seriesMatch(6, 1)] };
		expect(getMatchForTeamDisplay(6, true, offline, [])).toBe(offline.schedule[0]);
	});
});

describe("getAllianceNumbersForDisplay", () => {
	const originalAllianceNumbers = (n, color) => `orig-${n}-${color}`;

	it("delegates to original in non-ftc mode", () => {
		expect(
			getAllianceNumbersForDisplay(1, "red", false, null, [], originalAllianceNumbers, {}, null)
		).toBe("orig-1-red");
	});

	it("delegates when no match found for series", () => {
		expect(
			getAllianceNumbersForDisplay(1, "red", true, null, [], originalAllianceNumbers, {}, null)
		).toBe("orig-1-red");
	});

	it("returns 'Bye Match' if the match description includes Bye Match", () => {
		const sched = [seriesMatch(2, 1, { description: "Bye Match (R1)" })];
		expect(
			getAllianceNumbersForDisplay(2, "red", true, { schedule: sched }, [], originalAllianceNumbers, {}, null)
		).toBe("Bye Match");
	});

	it("delegates when match has no teams or no alliances.Lookup", () => {
		const sched = [seriesMatch(3, 1, { teams: [team("Red1", 111)] })];
		expect(
			getAllianceNumbersForDisplay(3, "red", true, { schedule: sched }, [], originalAllianceNumbers, null, null)
		).toBe("orig-3-red");

		const sched2 = [seriesMatch(3, 1)];
		expect(
			getAllianceNumbersForDisplay(3, "red", true, { schedule: sched2 }, [], originalAllianceNumbers, { Lookup: {} }, null)
		).toBe("orig-3-red");
	});

	it("delegates when the lookup team for the station can't be found", () => {
		const sched = [seriesMatch(4, 1, { teams: [team("Blue1", 444)] })];
		expect(
			getAllianceNumbersForDisplay(4, "red", true, { schedule: sched }, [], originalAllianceNumbers, { Lookup: {} }, null)
		).toBe("orig-4-red");
	});

	it("delegates when the alliance lookup entry is not found", () => {
		const sched = [seriesMatch(5, 1, { teams: [team("Red1", 111)] })];
		const alliances = { Lookup: { "999": { captain: 999 } } };
		expect(
			getAllianceNumbersForDisplay(5, "red", true, { schedule: sched }, [], originalAllianceNumbers, alliances, null)
		).toBe("orig-5-red");
	});

	it("returns space-separated alliance member numbers when found", () => {
		const sched = [seriesMatch(6, 1, { teams: [team("Red1", 111)] })];
		const alliances = {
			Lookup: {
				"111": { captain: 111, round1: 222, round2: 333, round3: null, backup: 999 },
			},
		};
		expect(
			getAllianceNumbersForDisplay(6, "red", true, { schedule: sched }, [], originalAllianceNumbers, alliances, null)
		).toBe("111  222  333  999");
	});

	it("uses Blue1 station when allianceColor is blue", () => {
		const sched = [seriesMatch(7, 1, { teams: [team("Blue1", 444)] })];
		const alliances = {
			Lookup: { "444": { captain: 444, round1: 555 } },
		};
		expect(
			getAllianceNumbersForDisplay(7, "blue", true, { schedule: sched }, [], originalAllianceNumbers, alliances, null)
		).toBe("444  555");
	});

	it("uses remapNumberToString to find lookup entry", () => {
		const sched = [seriesMatch(8, 1, { teams: [team("Red1", 111)] })];
		const alliances = {
			Lookup: { "remapped-111": { captain: 1, round1: 2 } },
		};
		expect(
			getAllianceNumbersForDisplay(8, "red", true, { schedule: sched }, [], originalAllianceNumbers, alliances, (n) => `remapped-${n}`)
		).toBe("1  2");
	});
});

describe("getAllianceNameForDisplay", () => {
	const originalAllianceName = (n, color) => `name-${n}-${color}`;

	it("delegates to original in non-ftc mode", () => {
		expect(
			getAllianceNameForDisplay(1, "red", false, null, [], originalAllianceName, {}, null, 0)
		).toBe("name-1-red");
	});

	it("delegates when no match for series", () => {
		expect(
			getAllianceNameForDisplay(1, "red", true, null, [], originalAllianceName, {}, null, 0)
		).toBe("name-1-red");
	});

	it("delegates when match lacks teams or alliances.Lookup", () => {
		const sched = [seriesMatch(2, 1)];
		expect(
			getAllianceNameForDisplay(2, "red", true, { schedule: sched }, [], originalAllianceName, { Lookup: {} }, null, 0)
		).toBe("name-2-red");
	});

	it("delegates when lookupTeam is missing for the station", () => {
		const sched = [seriesMatch(3, 1, { teams: [team("Blue1", 444)] })];
		expect(
			getAllianceNameForDisplay(3, "red", true, { schedule: sched }, [], originalAllianceName, { Lookup: {} }, null, 0)
		).toBe("name-3-red");
	});

	it("delegates when alliance lookup entry not found", () => {
		const sched = [seriesMatch(4, 1, { teams: [team("Red1", 111)] })];
		expect(
			getAllianceNameForDisplay(4, "red", true, { schedule: sched }, [], originalAllianceName, { Lookup: {} }, null, 0)
		).toBe("name-4-red");
	});

	it("returns the alliance name when found", () => {
		const sched = [seriesMatch(5, 1, { teams: [team("Red1", 111)] })];
		const alliances = { Lookup: { "111": { alliance: "Alliance 1" } } };
		expect(
			getAllianceNameForDisplay(5, "red", true, { schedule: sched }, [], originalAllianceName, alliances, null, 0)
		).toBe("Alliance 1");
	});

	it("returns empty string when alliance entry has no alliance field", () => {
		const sched = [seriesMatch(5, 1, { teams: [team("Red1", 111)] })];
		const alliances = { Lookup: { "111": {} } };
		expect(
			getAllianceNameForDisplay(5, "red", true, { schedule: sched }, [], originalAllianceName, alliances, null, 0)
		).toBe("");
	});

	it("appends '(L<level> WIN)' when red tieWinner and bracket below tieLevel", () => {
		const sched = [
			seriesMatch(2, 1, {
				teams: [team("Red1", 111)],
				winner: { tieWinner: "red", level: 4 },
			}),
		];
		const alliances = { Lookup: { "111": { alliance: "A1" } } };
		expect(
			getAllianceNameForDisplay(2, "red", true, { schedule: sched }, [], originalAllianceName, alliances, null, 4)
		).toBe("A1 (L4 WIN)");
	});

	it("appends '(L<level> WIN)' when bracketMatchNumber === tieLevel + 6", () => {
		const sched = [
			seriesMatch(10, 1, {
				teams: [team("Red1", 111)],
				winner: { tieWinner: "red", level: 4 },
			}),
		];
		const alliances = { Lookup: { "111": { alliance: "A1" } } };
		expect(
			getAllianceNameForDisplay(10, "red", true, { schedule: sched }, [], originalAllianceName, alliances, null, 4)
		).toBe("A1 (L4 WIN)");
	});

	it("does not append '(L<level> WIN)' for blue color even when red tieWinner", () => {
		const sched = [
			seriesMatch(2, 1, {
				teams: [team("Blue1", 444)],
				winner: { tieWinner: "red", level: 4 },
			}),
		];
		const alliances = { Lookup: { "444": { alliance: "B1" } } };
		expect(
			getAllianceNameForDisplay(2, "blue", true, { schedule: sched }, [], originalAllianceName, alliances, null, 4)
		).toBe("B1");
	});

	it("does not append when bracketMatchNumber is above tieLevel and not tieLevel+6", () => {
		const sched = [
			seriesMatch(7, 1, {
				teams: [team("Red1", 111)],
				winner: { tieWinner: "red", level: 4 },
			}),
		];
		const alliances = { Lookup: { "111": { alliance: "A1" } } };
		expect(
			getAllianceNameForDisplay(7, "red", true, { schedule: sched }, [], originalAllianceName, alliances, null, 4)
		).toBe("A1");
	});
});

describe("getMatchScoreForDisplay", () => {
	const originalMatchScore = (n, alliance) => `orig-${n}-${alliance}`;

	it("delegates to original when not in ftcMode", () => {
		expect(getMatchScoreForDisplay(1, "red", false, null, [], originalMatchScore)).toBe("orig-1-red");
	});

	it("delegates when no match in series found", () => {
		expect(getMatchScoreForDisplay(1, "red", true, null, [], originalMatchScore)).toBe("orig-1-red");
	});

	it("returns scoreRedFinal for red in ftcMode", () => {
		const sched = [seriesMatch(2, 1, { scoreRedFinal: 100, scoreBlueFinal: 80 })];
		expect(getMatchScoreForDisplay(2, "red", true, { schedule: sched }, [], originalMatchScore)).toBe(100);
	});

	it("returns scoreBlueFinal for blue in ftcMode", () => {
		const sched = [seriesMatch(2, 1, { scoreRedFinal: 100, scoreBlueFinal: 80 })];
		expect(getMatchScoreForDisplay(2, "blue", true, { schedule: sched }, [], originalMatchScore)).toBe(80);
	});

	it("uses last match in series for score", () => {
		const sched = [
			seriesMatch(3, 1, { scoreRedFinal: 10, scoreBlueFinal: 20 }),
			seriesMatch(3, 2, { scoreRedFinal: 50, scoreBlueFinal: 60 }),
		];
		expect(getMatchScoreForDisplay(3, "red", true, { schedule: sched }, [], originalMatchScore)).toBe(50);
		expect(getMatchScoreForDisplay(3, "blue", true, { schedule: sched }, [], originalMatchScore)).toBe(60);
	});

	it("delegates to original when alliance is neither red nor blue", () => {
		const sched = [seriesMatch(4, 1, { scoreRedFinal: 1, scoreBlueFinal: 2 })];
		expect(getMatchScoreForDisplay(4, "green", true, { schedule: sched }, [], originalMatchScore)).toBe(
			"orig-4-green"
		);
	});
});

describe("getMatchWinnerForDisplay", () => {
	const originalMatchWinner = (n) => ({ origFor: n });

	it("delegates to original when not in ftcMode", () => {
		expect(getMatchWinnerForDisplay(1, false, null, [], originalMatchWinner)).toEqual({ origFor: 1 });
	});

	it("delegates when no match in series found", () => {
		expect(getMatchWinnerForDisplay(1, true, null, [], originalMatchWinner)).toEqual({ origFor: 1 });
	});

	it("returns the winner of the last match in the series", () => {
		const winner = { tieWinner: "red", level: 4 };
		const sched = [seriesMatch(2, 1), seriesMatch(2, 2, { winner })];
		expect(getMatchWinnerForDisplay(2, true, { schedule: sched }, [], originalMatchWinner)).toBe(winner);
	});

	it("falls back to original when last match has no winner", () => {
		const sched = [seriesMatch(3, 1)];
		expect(getMatchWinnerForDisplay(3, true, { schedule: sched }, [], originalMatchWinner)).toEqual({
			origFor: 3,
		});
	});

	it("uses matches array when no offlinePlayoffSchedule", () => {
		const winner = { tieWinner: "blue", level: 2 };
		const matches = [seriesMatch(4, 1, { winner })];
		expect(getMatchWinnerForDisplay(4, true, null, matches, originalMatchWinner)).toBe(winner);
	});
});

describe("countConsecutiveFinalsSlotsFromWinnerGetter", () => {
	it("counts consecutive slots until first gap", () => {
		const getter = (mn) => {
			if (mn === 10) return { winner: "red" };
			if (mn === 11) return { winner: "blue" };
			if (mn === 12) return null;
			return { winner: "red" };
		};
		expect(countConsecutiveFinalsSlotsFromWinnerGetter(getter, 10, 15)).toBe(2);
	});

	it("includes tie as played", () => {
		const getter = (mn) => {
			if (mn === 10) return { winner: "tie" };
			return null;
		};
		expect(countConsecutiveFinalsSlotsFromWinnerGetter(getter, 10, 15)).toBe(1);
	});
});

describe("getFrcScheduleRowByMatchNumber", () => {
	it("finds by matchNumber field when present", () => {
		const row = { matchNumber: 12, winner: { winner: "red" } };
		const sched = [{ matchNumber: 99 }, row];
		expect(getFrcScheduleRowByMatchNumber(sched, 12)).toBe(row);
	});

	it("falls back to 1-based index when matchNumber field missing", () => {
		const sched = [{ foo: 1 }, { foo: 2 }, { foo: 3 }];
		expect(getFrcScheduleRowByMatchNumber(sched, 2)).toEqual({ foo: 2 });
	});

	it("returns null for empty schedule or invalid match number", () => {
		expect(getFrcScheduleRowByMatchNumber([], 1)).toBeNull();
		expect(getFrcScheduleRowByMatchNumber(null, 1)).toBeNull();
		expect(getFrcScheduleRowByMatchNumber([{ matchNumber: 1 }], 0)).toBeNull();
	});
});

describe("countConsecutiveFrcFinalsWithResults", () => {
	const row = (mn, w) => ({ matchNumber: mn, winner: { winner: w } });

	it("returns 0 when schedule empty", () => {
		expect(countConsecutiveFrcFinalsWithResults([], 10, 15)).toBe(0);
	});

	it("counts consecutive finals from minMatchNumber until first gap", () => {
		const sched = [row(10, "red"), row(11, "blue"), row(12, "tie"), row(13, "red")];
		expect(countConsecutiveFrcFinalsWithResults(sched, 10, 15)).toBe(4);
	});

	it("stops at first missing result even if later rows would have winners", () => {
		const sched = [row(10, "red"), { matchNumber: 11, winner: {} }, row(12, "red")];
		expect(countConsecutiveFrcFinalsWithResults(sched, 10, 15)).toBe(1);
	});

	it("counts ties as played", () => {
		const sched = [row(10, "red"), row(11, "tie")];
		expect(countConsecutiveFrcFinalsWithResults(sched, 10, 15)).toBe(2);
	});
});

describe("countConsecutiveTwoAllianceFinalsWithResults", () => {
	it("returns 0 when no matches", () => {
		expect(countConsecutiveTwoAllianceFinalsWithResults([])).toBe(0);
	});

	it("counts consecutive games from match 1 using index fallback", () => {
		const matches = [
			{ winner: { winner: "red" } },
			{ winner: { winner: "blue" } },
			{ winner: { winner: "red" } },
		];
		expect(countConsecutiveTwoAllianceFinalsWithResults(matches)).toBe(3);
	});

	it("stops at first row without a decided winner", () => {
		const matches = [{ winner: { winner: "red" } }, { winner: {} }];
		expect(countConsecutiveTwoAllianceFinalsWithResults(matches)).toBe(1);
	});
});
