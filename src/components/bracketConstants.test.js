import { describe, it, expect } from "vitest";
import {
	PLAYOFF_MATCH_GRAY_BOX_MIN_X,
	PLAYOFF_MATCH_GRAY_BOX_MAX_X,
	PLAYOFF_MATCH_GRAY_BOX_CENTER_X,
} from "./bracketConstants";

describe("PLAYOFF_MATCH_GRAY_BOX_* (PlayoffMatch finalsBackground horizontal extent)", () => {
	it("uses bounds aligned with PlayoffMatch.jsx finalsBackground path (-10 .. 240.5)", () => {
		expect(PLAYOFF_MATCH_GRAY_BOX_MIN_X).toBe(-10);
		expect(PLAYOFF_MATCH_GRAY_BOX_MAX_X).toBe(240.5);
	});

	it("computes horizontal center of the full gray box", () => {
		expect(PLAYOFF_MATCH_GRAY_BOX_CENTER_X).toBe(
			(PLAYOFF_MATCH_GRAY_BOX_MIN_X + PLAYOFF_MATCH_GRAY_BOX_MAX_X) / 2,
		);
		expect(PLAYOFF_MATCH_GRAY_BOX_CENTER_X).toBe(115.25);
	});

	it("matches bracket FinalsMatchIndicator x = PlayoffMatch.x + center for six-alliance", () => {
		const playoffMatchX = 1024;
		expect(playoffMatchX + PLAYOFF_MATCH_GRAY_BOX_CENTER_X).toBe(1139.25);
	});
});
