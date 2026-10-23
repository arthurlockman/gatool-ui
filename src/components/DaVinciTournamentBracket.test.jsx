import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { HotkeysProvider } from "react-hotkeys-hook";
import DaVinciTournamentBracket from "./DaVinciTournamentBracket";

// react-swipeable needs pointer events that jsdom doesn't support — stub it out.
vi.mock("react-swipeable", () => ({
	useSwipeable: () => ({}),
}));

// ---- Fixture builders ----

function makeMatch(matchNumber, series = 1, overrides = {}) {
	return {
		matchNumber,
		originalMatchNumber: matchNumber,
		series,
		teams: [],
		scoreRedFinal: null,
		scoreBlueFinal: null,
		winner: null,
		...overrides,
	};
}

/** Minimal props that satisfy DaVinciTournamentBracket without crashing. */
function baseProps(overrides = {}) {
	return {
		offlinePlayoffSchedule: null,
		currentMatch: 1,
		qualsLength: 0,
		nextMatch: vi.fn(),
		previousMatch: vi.fn(),
		getSchedule: vi.fn(),
		usePullDownToUpdate: false,
		useSwipe: false,
		eventLabel: "TEST EVENT",
		ftcMode: false,
		matches: Array.from({ length: 15 }, (_, i) => makeMatch(i + 1)),
		allianceNumbers: vi.fn(() => []),
		allianceName: vi.fn(() => ""),
		matchScore: vi.fn(() => null),
		matchWinner: vi.fn(() => null),
		alliances: [],
		remapNumberToString: vi.fn((n) => String(n)),
		...overrides,
	};
}

function renderBracket(props = {}) {
	return render(
		<HotkeysProvider initiallyActiveScopes={["matchNavigation"]}>
			<DaVinciTournamentBracket {...baseProps(props)} />
		</HotkeysProvider>
	);
}

// ---- Tests ----

describe("DaVinciTournamentBracket", () => {
	beforeEach(() => {
		// jsdom doesn't implement matchMedia
		if (!window.matchMedia) {
			window.matchMedia = (query) => ({
				matches: false, media: query, onchange: null,
				addListener: () => {}, removeListener: () => {},
				addEventListener: () => {}, removeEventListener: () => {},
				dispatchEvent: () => false,
			});
		}
	});

	it("renders a loading alert when matches is null/undefined", () => {
		renderBracket({ matches: null });
		expect(screen.getByText(/Waiting for Playoff Match Schedule/i)).toBeInTheDocument();
	});

	it("renders the SVG bracket when matches are provided", () => {
		const { container } = renderBracket();
		const svg = container.querySelector("svg#davinci-bracket");
		expect(svg).toBeInTheDocument();
	});

	it("renders the event label in the bracket header", () => {
		renderBracket({ eventLabel: "My Championship" });
		expect(screen.getByText("My Championship")).toBeInTheDocument();
	});

	it("renders the da Vinci subtitle", () => {
		renderBracket();
		expect(screen.getByText(/da Vinci Tournament Round Robin/i)).toBeInTheDocument();
	});

	it("renders all 5 round headers", () => {
		renderBracket();
		for (let r = 1; r <= 5; r++) {
			expect(screen.getByText(`ROUND ${r}`)).toBeInTheDocument();
		}
	});

	it("renders MATCH labels for all 15 round-robin matches", () => {
		renderBracket();
		for (let m = 1; m <= 15; m++) {
			expect(screen.getByText(`MATCH ${m}`)).toBeInTheDocument();
		}
	});

	it("renders division placeholder names for round 1 matches", () => {
		renderBracket();
		// Round 1 has Franklin, Edison, Goodall, Jackson, Ross, Lovelace
		["Franklin", "Edison", "Goodall", "Jackson", "Ross", "Lovelace"].forEach((name) => {
			// Each division appears 5 times total (once per round); at least one match
			expect(screen.getAllByText(name).length).toBeGreaterThanOrEqual(1);
		});
	});

	it("renders the PlayoffMatch finals section inside the SVG", () => {
		// PlayoffMatch renders "BEST 2 of 3" (non-ftcMode) or "FINALS" (ftcMode)
		renderBracket({ ftcMode: false });
		expect(screen.getByText("BEST 2 of 3")).toBeInTheDocument();
	});

	it("renders FINALS label in ftcMode", () => {
		renderBracket({ ftcMode: true });
		expect(screen.getByText("FINALS")).toBeInTheDocument();
	});

	it("does not render FinalsMatchIndicators when no finals matches exist", () => {
		const { container } = renderBracket({ ftcMode: false });
		// FinalsMatchIndicator renders circles with id winnerMatch*Dot
		const circles = container.querySelectorAll("circle[id^='winnerMatch']");
		expect(circles.length).toBe(0);
	});

	it("renders FinalsMatchIndicators for each completed finals match in ftcMode", () => {
		const finalsMatches = [
			makeMatch(1, 16, { scoreRedFinal: 100, scoreBlueFinal: 80, winner: { winner: "red" } }),
			makeMatch(2, 16, { scoreRedFinal: 90,  scoreBlueFinal: 95, winner: { winner: "blue" } }),
		];
		const allMatches = [
			...Array.from({ length: 15 }, (_, i) => makeMatch(i + 1, i + 1)),
			...finalsMatches,
		];
		const { container } = renderBracket({ ftcMode: true, matches: allMatches });
		const circles = container.querySelectorAll("circle[id^='winnerMatch']");
		expect(circles.length).toBe(2);
	});

	it("renders up to 6 FinalsMatchIndicators for extended FTC finals", () => {
		const finalsMatches = Array.from({ length: 6 }, (_, i) =>
			makeMatch(i + 1, 16, { scoreRedFinal: 100, scoreBlueFinal: 100, winner: null })
		);
		const allMatches = [
			...Array.from({ length: 15 }, (_, i) => makeMatch(i + 1, i + 1)),
			...finalsMatches,
		];
		const { container } = renderBracket({ ftcMode: true, matches: allMatches });
		const circles = container.querySelectorAll("circle[id^='winnerMatch']");
		expect(circles.length).toBe(6);
	});

	it("does not throw when useSwipe is true", () => {
		expect(() => renderBracket({ useSwipe: true })).not.toThrow();
	});

	it("does not throw when usePullDownToUpdate is true", () => {
		expect(() => renderBracket({ useSwipe: true, usePullDownToUpdate: true })).not.toThrow();
	});
});

describe("DaVinciTournamentBracket — FIRST Global mode", () => {
	const fgMode = { value: "FIRSTGlobal", label: "FIRST Global" };

	function fgMatches() {
		return Array.from({ length: 16 }, (_, i) => makeMatch(i + 1));
	}

	function fgFinals() {
		const teams = (red, blue) => [
			...red.map((teamNumber, i) => ({ station: `Red${i + 1}`, teamNumber })),
			...blue.map((teamNumber, i) => ({ station: `Blue${i + 1}`, teamNumber })),
		];
		const a1 = [177, 114, 179, 53];
		const a6 = [174, 88, 77, 102];
		const a2 = [35, 171, 31, 170];
		return [
			makeMatch(17, 1, { teams: teams(a1, a6), scoreRedFinal: 532, scoreBlueFinal: 473, winner: { winner: "red" } }),
			makeMatch(18, 1, { teams: teams(a6, a2), scoreRedFinal: 456, scoreBlueFinal: 422, winner: { winner: "red" } }),
			makeMatch(19, 1, { teams: teams(a1, a2), scoreRedFinal: 478, scoreBlueFinal: 468, winner: { winner: "red" } }),
		];
	}

	const fgAlliances = {
		Lookup: {
			177: { alliance: "Alliance 1" },
			174: { alliance: "Alliance 6" },
			35: { alliance: "Alliance 2" },
		},
	};

	it("renders the FIRST Global subtitle", () => {
		renderBracket({ ftcMode: fgMode, matches: fgMatches() });
		expect(screen.getByText(/FIRST Global Round Robin/i)).toBeInTheDocument();
	});

	it("renders 4 round headers (not 5)", () => {
		renderBracket({ ftcMode: fgMode, matches: fgMatches() });
		for (let r = 1; r <= 4; r++) {
			expect(screen.getByText(`ROUND ${r}`)).toBeInTheDocument();
		}
		expect(screen.queryByText("ROUND 5")).not.toBeInTheDocument();
	});

	it("renders MATCH labels for all 16 round-robin matches", () => {
		renderBracket({ ftcMode: fgMode, matches: fgMatches() });
		for (let m = 1; m <= 16; m++) {
			expect(screen.getByText(`MATCH ${m}`)).toBeInTheDocument();
		}
	});

	it("renders alliance placeholder names from the FG schedule", () => {
		renderBracket({ ftcMode: fgMode, matches: fgMatches() });
		expect(screen.getAllByText("Alliance 1").length).toBeGreaterThanOrEqual(1);
		expect(screen.getAllByText("Alliance 8").length).toBeGreaterThanOrEqual(1);
	});

	it("renders three independent finals cards and a trophy before finals are scheduled", () => {
		const { container } = renderBracket({ ftcMode: fgMode, matches: fgMatches() });
		for (let n = 1; n <= 3; n++) {
			expect(screen.getByText(`FINALS ${n}`)).toBeInTheDocument();
			expect(container.querySelector(`#match${16 + n}`)).toBeInTheDocument();
		}
		expect(container.querySelector("#trophy")).toBeInTheDocument();
		expect(screen.getByText("Winning Alliance")).toBeInTheDocument();
		expect(screen.queryByText("BEST 2 of 3")).not.toBeInTheDocument();
		expect(container.querySelector("#finalsContainer")).not.toBeInTheDocument();
		expect(container.querySelectorAll("circle[id^='winnerMatch']")).toHaveLength(0);
	});

	it("places finals below the four rounds in three columns with the trophy in the fourth", () => {
		const { container } = renderBracket({ ftcMode: fgMode, matches: fgMatches() });
		const translation = (element) => element.getAttribute("transform")
			.match(/translate\(([^,]+), ([^)]+)\)/).slice(1).map(Number);
		const positions = [17, 18, 19].map((n) =>
			translation(container.querySelector(`#match${n}`).parentElement)
		);
		const lastRoundY = translation(container.querySelector("#match16").parentElement)[1];
		const [trophyX, trophyY] = translation(container.querySelector("#fg-champion"));
		const [, , svgW, svgH] = container.querySelector("svg").getAttribute("viewBox").split(" ").map(Number);
		for (let i = 0; i < positions.length; i++) {
			const [x, y] = positions[i];
			expect(x).toBeCloseTo(10.337 + i * 340);
			expect(y).toBeCloseTo(positions[0][1]);
			expect(y).toBeGreaterThan(lastRoundY + 72.46 * 1.8);
			expect(y + 72.46 * 1.8).toBeLessThan(svgH);
		}
		expect(trophyX).toBeGreaterThan(positions[2][0] + 194.07 * 1.8);
		expect(trophyX + 280).toBeLessThan(svgW);
		expect(trophyY + 230).toBeLessThan(svgH);
	});

	it("shows each final's teams, scores, winner, and independent current-match highlight", () => {
		const { container } = renderBracket({
			ftcMode: fgMode, matches: [...fgMatches(), ...fgFinals()],
			alliances: fgAlliances, currentMatch: 28, qualsLength: 10,
		});
		expect(container.querySelector("#M17RedScore")).toHaveTextContent("532");
		expect(container.querySelector("#M18BlueScore")).toHaveTextContent("422");
		expect(container.querySelector("#M19RedScore")).toHaveTextContent("478");
		expect(container.querySelector("#match18")).toHaveTextContent("Alliance 6");
		expect(container.querySelector("#match18")).toHaveTextContent("Alliance 2");
		expect(container.querySelector("#match18RedDot")).toHaveAttribute("fill", "#FFCA10");
		expect(container.querySelector("#match18 rect")).toHaveAttribute("fill", "#FFCA10");
		expect(container.querySelector("#match17 rect")).toHaveAttribute("fill", "#000000");
		expect(container.querySelector("#match19 rect")).toHaveAttribute("fill", "#000000");
		expect(container.querySelector("#fg-champion")).toHaveTextContent("Alliance 1");
		expect(container.querySelector("#fg-champion")).toHaveTextContent("177 114 179 53");
	});

	it("uses country codes in finals and trophy when available", () => {
		const { container } = renderBracket({
			ftcMode: fgMode, matches: [...fgMatches(), ...fgFinals()], alliances: fgAlliances,
			remapNumberToString: (n) => ({ 177: "USA", 114: "CAN", 179: "MEX", 53: "BRA" })[n] ?? String(n),
		});
		expect(container.querySelector("#match17")).toHaveTextContent("USA CAN MEX BRA");
		expect(container.querySelector("#fg-champion")).toHaveTextContent("USA CAN MEX BRA");
		expect(container.querySelector("#fg-champion rect")).toHaveAttribute("width", "280");
		container.querySelectorAll("#fg-champion text").forEach((text) => {
			expect(text).toHaveAttribute("x", "140");
		});
	});

	it("keeps the champion unnamed until all finals are complete", () => {
		const finals = fgFinals();
		finals[2].scoreBlueFinal = null;
		const { container } = renderBracket({
			ftcMode: fgMode, matches: [...fgMatches(), ...finals], alliances: fgAlliances,
		});
		expect(container.querySelector("#fg-champion")).toHaveTextContent("Winning Alliance");
		expect(container.querySelector("#fg-champion")).not.toHaveTextContent("Alliance 1");
	});
});
