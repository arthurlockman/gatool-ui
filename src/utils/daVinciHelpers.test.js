import {
	getFinalSeriesMatches,
	computeDaVinciTournamentWinner,
	getFinalsSlotScore,
	getFinalsSlotWinner,
	DA_VINCI_SCHEDULE,
	FG_ROUND_ROBIN_SCHEDULE,
	FG_FINALS_SCHEDULE,
	getFGFinalsMatches,
	computeFGTournamentWinner,
} from "./daVinciHelpers";

// ---- helpers ----

const makeMatch = (series, matchNumber, overrides = {}) => ({
	series,
	originalMatchNumber: matchNumber,
	matchNumber,
	scoreRedFinal: null,
	scoreBlueFinal: null,
	winner: null,
	...overrides,
});

const winner = (w, extras = {}) => ({ winner: w, ...extras });

// ---- getFinalSeriesMatches ----

describe("getFinalSeriesMatches", () => {
	it("returns empty array when ftcMode is false", () => {
		const matches = [makeMatch(16, 1)];
		expect(getFinalSeriesMatches(null, matches, false)).toEqual([]);
	});

	it("returns empty array when there are no matches", () => {
		expect(getFinalSeriesMatches(null, null, true)).toEqual([]);
	});

	it("filters to series 16 only", () => {
		const matches = [
			makeMatch(15, 1),
			makeMatch(16, 2),
			makeMatch(16, 3),
			makeMatch(17, 4),
		];
		const result = getFinalSeriesMatches(null, matches, true);
		expect(result).toHaveLength(2);
		expect(result.every((m) => m.series === 16)).toBe(true);
	});

	it("sorts by originalMatchNumber ascending", () => {
		const matches = [
			makeMatch(16, 3),
			makeMatch(16, 1),
			makeMatch(16, 2),
		];
		const result = getFinalSeriesMatches(null, matches, true);
		expect(result.map((m) => m.matchNumber)).toEqual([1, 2, 3]);
	});

	it("prefers offlinePlayoffSchedule.schedule over matches", () => {
		const offline = { schedule: [makeMatch(16, 99)] };
		const online  = [makeMatch(16, 1)];
		const result  = getFinalSeriesMatches(offline, online, true);
		expect(result[0].matchNumber).toBe(99);
	});

	it("falls back to matches when offline schedule has no schedule property", () => {
		const result = getFinalSeriesMatches({}, [makeMatch(16, 7)], true);
		expect(result[0].matchNumber).toBe(7);
	});

	it("sorts by matchNumber when originalMatchNumber is absent", () => {
		const matches = [
			{ series: 16, matchNumber: 5 },
			{ series: 16, matchNumber: 3 },
		];
		const result = getFinalSeriesMatches(null, matches, true);
		expect(result.map((m) => m.matchNumber)).toEqual([3, 5]);
	});
});

// ---- computeDaVinciTournamentWinner ----

describe("computeDaVinciTournamentWinner", () => {
	it("returns no winner for empty finals", () => {
		const result = computeDaVinciTournamentWinner([]);
		expect(result.winner).toBe("");
		expect(result.red).toBe(0);
		expect(result.blue).toBe(0);
	});

	it("red wins with 1 victory (higher seed advantage)", () => {
		const finals = [makeMatch(16, 1, { winner: winner("red") })];
		const result = computeDaVinciTournamentWinner(finals);
		expect(result.winner).toBe("red");
		expect(result.red).toBe(1);
	});

	it("blue must win twice to become winner", () => {
		const finals = [
			makeMatch(16, 1, { winner: winner("blue") }),
			makeMatch(16, 2, { winner: winner("blue") }),
		];
		const result = computeDaVinciTournamentWinner(finals);
		expect(result.winner).toBe("blue");
		expect(result.blue).toBe(2);
	});

	it("blue with 1 win is not yet a winner", () => {
		const finals = [makeMatch(16, 1, { winner: winner("blue") })];
		expect(computeDaVinciTournamentWinner(finals).winner).toBe("");
	});

	it("tieWinner on last match overrides regular winner count", () => {
		const finals = [
			makeMatch(16, 1, { winner: winner("blue") }),
			makeMatch(16, 2, { winner: { winner: null, tieWinner: "red", level: 3 } }),
		];
		const result = computeDaVinciTournamentWinner(finals);
		expect(result.winner).toBe("red");
		expect(result.level).toBe(3);
	});

	it("tieWinner blue on last match sets winner to blue", () => {
		const finals = [
			makeMatch(16, 1, { winner: winner("red") }),
			makeMatch(16, 2, { winner: { winner: null, tieWinner: "blue", level: 1 } }),
		];
		const result = computeDaVinciTournamentWinner(finals);
		expect(result.winner).toBe("blue");
		expect(result.level).toBe(1);
	});

	it("handles null winner entries gracefully", () => {
		const finals = [makeMatch(16, 1, { winner: null })];
		expect(() => computeDaVinciTournamentWinner(finals)).not.toThrow();
		expect(computeDaVinciTournamentWinner(finals).winner).toBe("");
	});
});

// ---- getFinalsSlotScore ----

describe("getFinalsSlotScore", () => {
	const finals = [
		makeMatch(16, 1, { scoreRedFinal: 120, scoreBlueFinal: 95 }),
		makeMatch(16, 2, { scoreRedFinal: 80,  scoreBlueFinal: 110 }),
	];

	it("returns red score for slot 0", () => {
		expect(getFinalsSlotScore(finals, 0, "red")).toBe(120);
	});

	it("returns blue score for slot 0", () => {
		expect(getFinalsSlotScore(finals, 0, "blue")).toBe(95);
	});

	it("returns correct score for slot 1", () => {
		expect(getFinalsSlotScore(finals, 1, "red")).toBe(80);
		expect(getFinalsSlotScore(finals, 1, "blue")).toBe(110);
	});

	it("returns null for out-of-range slot", () => {
		expect(getFinalsSlotScore(finals, 5, "red")).toBeNull();
	});

	it("returns null for unknown alliance", () => {
		expect(getFinalsSlotScore(finals, 0, "green")).toBeNull();
	});
});

// ---- getFinalsSlotWinner ----

describe("getFinalsSlotWinner", () => {
	const w0 = winner("red");
	const w1 = winner("blue");
	const finals = [
		makeMatch(16, 1, { winner: w0 }),
		makeMatch(16, 2, { winner: w1 }),
	];

	it("returns winner for slot 0", () => {
		expect(getFinalsSlotWinner(finals, 0)).toBe(w0);
	});

	it("returns winner for slot 1", () => {
		expect(getFinalsSlotWinner(finals, 1)).toBe(w1);
	});

	it("returns null for out-of-range slot", () => {
		expect(getFinalsSlotWinner(finals, 9)).toBeNull();
	});
});

// ---- DA_VINCI_SCHEDULE ----

describe("DA_VINCI_SCHEDULE", () => {
	it("has exactly 15 matches", () => {
		expect(DA_VINCI_SCHEDULE).toHaveLength(15);
	});

	it("covers match numbers 1–15 each exactly once", () => {
		const nums = DA_VINCI_SCHEDULE.map((m) => m.matchNumber).sort((a, b) => a - b);
		expect(nums).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
	});

	it("has exactly 5 rounds, each with 3 matches", () => {
		for (let round = 1; round <= 5; round++) {
			expect(DA_VINCI_SCHEDULE.filter((m) => m.round === round)).toHaveLength(3);
		}
	});

	it("each division appears exactly 5 times across the schedule (once per round)", () => {
		const divisions = ["Franklin", "Edison", "Goodall", "Jackson", "Ross", "Lovelace"];
		for (const div of divisions) {
			const appearances = DA_VINCI_SCHEDULE.filter(
				(m) => m.redPlaceHolder === div || m.bluePlaceHolder === div,
			);
			expect(appearances).toHaveLength(5);
		}
	});

	it("no division plays itself in a match", () => {
		DA_VINCI_SCHEDULE.forEach(({ redPlaceHolder, bluePlaceHolder }) => {
			expect(redPlaceHolder).not.toBe(bluePlaceHolder);
		});
	});

	it("no pair of divisions meets more than once", () => {
		const seen = new Set();
		DA_VINCI_SCHEDULE.forEach(({ redPlaceHolder, bluePlaceHolder }) => {
			const key = [redPlaceHolder, bluePlaceHolder].sort().join("|");
			expect(seen.has(key)).toBe(false);
			seen.add(key);
		});
	});
});

// ---- FIRST Global helpers ----

describe("FG_ROUND_ROBIN_SCHEDULE", () => {
	it("has exactly 16 round-robin matches", () => {
		expect(FG_ROUND_ROBIN_SCHEDULE).toHaveLength(16);
	});

	it("covers match numbers 1–16 each exactly once", () => {
		const nums = FG_ROUND_ROBIN_SCHEDULE.map((m) => m.matchNumber).sort((a, b) => a - b);
		expect(nums).toEqual(Array.from({ length: 16 }, (_, i) => i + 1));
	});

	it("has 4 rounds with 4 matches each", () => {
		for (let round = 1; round <= 4; round++) {
			expect(FG_ROUND_ROBIN_SCHEDULE.filter((m) => m.round === round)).toHaveLength(4);
		}
	});
});

describe("getFGFinalsMatches", () => {
	it("returns empty array when matches is null", () => {
		expect(getFGFinalsMatches(null, 16)).toEqual([]);
	});

	it("returns only matches after the round-robin count", () => {
		const matches = [
			makeMatch(1, 16),
			makeMatch(1, 17),
			makeMatch(1, 18),
		];
		const finals = getFGFinalsMatches(matches, 16);
		expect(finals).toHaveLength(2);
		expect(finals.map((m) => m.matchNumber)).toEqual([17, 18]);
	});
});

describe("computeFGTournamentWinner", () => {
	function finals() {
		const teams = (red, blue) => [
			{ station: "Red1", teamNumber: red },
			{ station: "Blue1", teamNumber: blue },
		];
		return [
			makeMatch(1, 17, { teams: teams(1, 6), scoreRedFinal: 532, scoreBlueFinal: 473 }),
			makeMatch(1, 18, { teams: teams(6, 2), scoreRedFinal: 456, scoreBlueFinal: 422 }),
			makeMatch(1, 19, { teams: teams(1, 2), scoreRedFinal: 478, scoreBlueFinal: 468 }),
		];
	}

	it("ranks alliances by total score across their two matches", () => {
		expect(computeFGTournamentWinner(finals())).toEqual({
			matchNumber: 17, color: "red", totalScore: 1010,
		});
	});

	it("tracks an alliance that changes color instead of counting red/blue wins", () => {
		const matches = finals();
		matches[0].scoreBlueFinal = 600;
		expect(computeFGTournamentWinner(matches)).toEqual({
			matchNumber: 17, color: "blue", totalScore: 1056,
		});
	});

	it("can award the champion to an alliance with no match victories", () => {
		const matches = finals();
		Object.assign(matches[0], { scoreRedFinal: 500, scoreBlueFinal: 501, winner: winner("blue") });
		Object.assign(matches[1], { scoreRedFinal: 1, scoreBlueFinal: 2, winner: winner("blue") });
		Object.assign(matches[2], { scoreRedFinal: 500, scoreBlueFinal: 501, winner: winner("blue") });
		expect(computeFGTournamentWinner(matches)).toEqual({
			matchNumber: 17, color: "red", totalScore: 1000,
		});
	});

	it("uses alliance lookup identities when the participating teams change", () => {
		const matches = finals();
		matches[2].teams[0].teamNumber = 10;
		const alliances = { Lookup: { 1: { alliance: "Alliance 1" }, 10: { alliance: "Alliance 1" } } };
		expect(computeFGTournamentWinner(matches, alliances)?.totalScore).toBe(1010);
	});

	it("matches rosters regardless of station order", () => {
		const matches = finals();
		matches[0].teams.push({ station: "Red2", teamNumber: 10 });
		matches[2].teams.unshift({ station: "Red2", teamNumber: 10 });
		expect(computeFGTournamentWinner(matches)?.totalScore).toBe(1010);
	});

	it("does not declare a champion until all three finals have scores", () => {
		expect(computeFGTournamentWinner([])).toBeNull();
		expect(computeFGTournamentWinner(finals().slice(0, 2))).toBeNull();
		const matches = finals();
		matches[2].scoreBlueFinal = null;
		expect(computeFGTournamentWinner(matches)).toBeNull();
	});

	it("does not declare a champion from unposted zero-zero placeholders", () => {
		const matches = finals();
		matches[2].scoreRedFinal = 0;
		matches[2].scoreBlueFinal = 0;
		expect(computeFGTournamentWinner(matches)).toBeNull();
		matches[2].postResultTime = "2026-10-23T12:00:00Z";
		expect(computeFGTournamentWinner(matches)?.totalScore).toBe(929);
	});

	it("does not break a tie for highest total arbitrarily", () => {
		const matches = finals();
		matches[0].scoreBlueFinal = 554;
		expect(computeFGTournamentWinner(matches)).toBeNull();
	});

	it.each([NaN, Infinity, -1, "invalid"])("does not rank invalid scores (%s)", (score) => {
		const matches = finals();
		matches[2].scoreRedFinal = score;
		expect(computeFGTournamentWinner(matches)).toBeNull();
	});

	it("requires three identifiable alliances with two appearances each", () => {
		const matches = finals();
		matches[2].teams[0].teamNumber = 99;
		expect(computeFGTournamentWinner(matches)).toBeNull();
		matches[2].teams = [];
		expect(computeFGTournamentWinner(matches)).toBeNull();
	});
});

describe("FG_FINALS_SCHEDULE", () => {
	it("contains three finals in which each finalist plays both others", () => {
		expect(FG_FINALS_SCHEDULE.map((match) => match.matchNumber)).toEqual([17, 18, 19]);
		const pairings = FG_FINALS_SCHEDULE.map(({ redPlaceHolder, bluePlaceHolder }) =>
			[redPlaceHolder, bluePlaceHolder].sort().join("|")
		);
		expect(new Set(pairings).size).toBe(3);
		for (const name of ["RR1", "RR2", "RR3"]) {
			expect(FG_FINALS_SCHEDULE.filter((match) =>
				match.redPlaceHolder === name || match.bluePlaceHolder === name
			)).toHaveLength(2);
		}
	});
});
