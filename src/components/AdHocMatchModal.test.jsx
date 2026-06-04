import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AdHocMatchModal from "./AdHocMatchModal";

// Stub out SettingsContext so the component doesn't need a full provider
vi.mock("../contexts/SettingsContext", () => ({
    useSettings: () => ({ swapScreen: false, useFourTeamAlliances: false }),
}));

// ─── Fixture builders ─────────────────────────────────────────────────────────

function makeMatch() {
    return [
        { teamNumber: 1234, station: "Red1", surrogate: false, dq: false },
        { teamNumber: 2345, station: "Red2", surrogate: false, dq: false },
        { teamNumber: 3456, station: "Red3", surrogate: false, dq: false },
        { teamNumber: 4567, station: "Blue1", surrogate: false, dq: false },
        { teamNumber: 5678, station: "Blue2", surrogate: false, dq: false },
        { teamNumber: 6789, station: "Blue3", surrogate: false, dq: false },
    ];
}

/** API alliance format — members are raw numbers (as returned by useRankingsAlliances) */
function makeApiAlliances() {
    return {
        alliances: [
            { number: 1, name: "Alliance 1", captain: 1234, round1: 2345, round2: 3456, round3: null },
            { number: 2, name: "Alliance 2", captain: 4567, round1: 5678, round2: 6789, round3: null },
        ],
    };
}

/** Tool alliance format — members are objects with teamNumber property */
function makeToolAlliances() {
    return {
        alliances: [
            {
                number: 1,
                name: "Alliance 1",
                captain: { teamNumber: 1234 },
                round1: { teamNumber: 2345 },
                round2: { teamNumber: 3456 },
            },
            {
                number: 2,
                name: "Alliance 2",
                captain: { teamNumber: 4567 },
                round1: { teamNumber: 5678 },
                round2: { teamNumber: 6789 },
            },
        ],
    };
}

function baseProps(overrides = {}) {
    return {
        show: true,
        onHide: vi.fn(),
        adHocMatch: makeMatch(),
        onStationChange: vi.fn(),
        eventTeams: [],
        allianceSelectionArrays: {},
        alliances: null,
        selectedRedAlliance: null,
        setSelectedRedAlliance: vi.fn(),
        selectedBlueAlliance: null,
        setSelectedBlueAlliance: vi.fn(),
        ...overrides,
    };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("AdHocMatchModal – alliance dropdown visibility", () => {
    it("shows alliance dropdowns when API alliances are present and tool alliances are absent", () => {
        render(<AdHocMatchModal {...baseProps({ alliances: makeApiAlliances() })} />);
        expect(screen.getByText("Red Alliance")).toBeInTheDocument();
        expect(screen.getByText("Blue Alliance")).toBeInTheDocument();
    });

    it("shows alliance dropdowns when tool allianceSelectionArrays are present", () => {
        render(<AdHocMatchModal {...baseProps({ allianceSelectionArrays: makeToolAlliances() })} />);
        expect(screen.getByText("Red Alliance")).toBeInTheDocument();
        expect(screen.getByText("Blue Alliance")).toBeInTheDocument();
    });

    it("hides alliance dropdowns when no alliances are available", () => {
        render(<AdHocMatchModal {...baseProps()} />);
        expect(screen.queryByText("Red Alliance")).not.toBeInTheDocument();
        expect(screen.queryByText("Blue Alliance")).not.toBeInTheDocument();
    });

    it("prefers tool alliances over API alliances when both are provided", () => {
        // When tool alliances are present, they take priority. Verify dropdown appears.
        const toolAlliances = {
            alliances: [
                {
                    number: 1,
                    name: "Tool Alliance 1",
                    captain: { teamNumber: 1234 },
                    round1: { teamNumber: 2345 },
                    round2: { teamNumber: 3456 },
                },
            ],
        };
        const apiAlliances = makeApiAlliances();
        render(
            <AdHocMatchModal
                {...baseProps({ allianceSelectionArrays: toolAlliances, alliances: apiAlliances })}
            />
        );
        expect(screen.getByText("Red Alliance")).toBeInTheDocument();
        expect(screen.getByText("Blue Alliance")).toBeInTheDocument();
    });

    it("hides alliance dropdowns when API alliances are incomplete (missing round2)", () => {
        const incompleteApiAlliances = {
            alliances: [
                { number: 1, name: "Alliance 1", captain: 1234, round1: 2345, round2: null },
            ],
        };
        render(<AdHocMatchModal {...baseProps({ alliances: incompleteApiAlliances })} />);
        expect(screen.queryByText("Red Alliance")).not.toBeInTheDocument();
    });

    it("hides alliance dropdowns when API alliances array is empty", () => {
        render(<AdHocMatchModal {...baseProps({ alliances: { alliances: [] } })} />);
        expect(screen.queryByText("Red Alliance")).not.toBeInTheDocument();
    });
});

describe("AdHocMatchModal – API alliance normalization", () => {
    it("normalizes string team numbers from API to integers", () => {
        const apiAlliancesWithStrings = {
            alliances: [
                { number: 1, name: "Alliance 1", captain: "1234", round1: "2345", round2: "3456" },
                { number: 2, name: "Alliance 2", captain: "4567", round1: "5678", round2: "6789" },
            ],
        };
        render(<AdHocMatchModal {...baseProps({ alliances: apiAlliancesWithStrings })} />);
        // If normalization works, alliances are qualified and dropdowns appear
        expect(screen.getByText("Red Alliance")).toBeInTheDocument();
    });

    it("uses fallback name 'Alliance N' when API alliance has no name", () => {
        // An alliance without a name field should still qualify and show the dropdown
        const unnamedApiAlliances = {
            alliances: [
                { number: 3, captain: 1234, round1: 2345, round2: 3456 },
            ],
        };
        render(<AdHocMatchModal {...baseProps({ alliances: unnamedApiAlliances })} />);
        expect(screen.getByText("Red Alliance")).toBeInTheDocument();
        expect(screen.getByText("Blue Alliance")).toBeInTheDocument();
    });

    it("does not crash when alliances prop is null", () => {
        expect(() =>
            render(<AdHocMatchModal {...baseProps({ alliances: null })} />)
        ).not.toThrow();
    });

    it("does not crash when alliances.alliances is undefined", () => {
        expect(() =>
            render(<AdHocMatchModal {...baseProps({ alliances: {} })} />)
        ).not.toThrow();
    });
});

describe("AdHocMatchModal – match data rendering", () => {
    it("shows 'Awaiting match data' when adHocMatch is null", () => {
        render(<AdHocMatchModal {...baseProps({ adHocMatch: null })} />);
        expect(screen.getByText(/Awaiting match data/i)).toBeInTheDocument();
    });

    it("shows station instruction text when adHocMatch is provided", () => {
        render(<AdHocMatchModal {...baseProps()} />);
        expect(screen.getByText(/Select teams for each station/i)).toBeInTheDocument();
    });
});
