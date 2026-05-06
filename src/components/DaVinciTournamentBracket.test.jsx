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
