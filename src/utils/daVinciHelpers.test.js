import {
	getFinalSeriesMatches,
	computeDaVinciTournamentWinner,
	getFinalsSlotScore,
	getFinalsSlotWinner,
	DA_VINCI_SCHEDULE,
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
