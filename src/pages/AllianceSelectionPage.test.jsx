import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AllianceSelectionPage from "./AllianceSelectionPage";

// ─── Context / hook mocks ─────────────────────────────────────────────────────

vi.mock("../contexts/SettingsContext", () => ({
    useSettings: vi.fn(),
}));

vi.mock("contexts/EventDataContext", () => ({
    useEventData: vi.fn(),
}));

vi.mock("contexts/EventActionsContext", () => ({
    useEventActions: vi.fn(),
}));

vi.mock("react-hotkeys-hook", () => ({
    useHotkeysContext: () => ({ disableScope: vi.fn(), enableScope: vi.fn() }),
    useHotkeys: vi.fn(),
}));

vi.mock("../hooks/useScrollPosition", () => ({
    default: vi.fn(),
}));

// AllianceSelection child component is complex; stub it out
vi.mock("../components/AllianceSelection", () => ({
    default: () => <div data-testid="alliance-selection-stub" />,
}));

// Bracket components are complex; stub them all out
vi.mock("../components/Bracket", () => ({ default: () => <div data-testid="bracket-stub" /> }));
vi.mock("../components/SixAllianceBracket", () => ({ default: () => <div data-testid="six-alliance-bracket-stub" /> }));
vi.mock("../components/FourAllianceBracket", () => ({ default: () => <div data-testid="four-alliance-bracket-stub" /> }));
vi.mock("../components/FourAllianceBracketFTC", () => ({ default: () => <div data-testid="four-alliance-bracket-ftc-stub" /> }));
vi.mock("../components/TwoAllianceBracket", () => ({ default: () => <div data-testid="two-alliance-bracket-stub" /> }));
vi.mock("../components/DaVinciTournamentBracket", () => ({ default: () => <div data-testid="davinci-bracket-stub" /> }));

import { useSettings } from "../contexts/SettingsContext";
import { useEventData } from "contexts/EventDataContext";
import { useEventActions } from "contexts/EventActionsContext";

// ─── Fixture builders ─────────────────────────────────────────────────────────

function makeOffseasonEvent() {
    return {
        value: {
            type: "OffSeason",
            code: "OFFTEST",
            champLevel: null,
        },
        label: "Test Offseason Event",
    };
}

function makeRegularEvent() {
    return {
        value: {
            type: "Regional",
            code: "REGTEST",
            champLevel: null,
        },
        label: "Test Regional Event",
    };
}

function makeQualSchedule() {
    return { schedule: [{ matchNumber: 1 }] };
}

function setupMocks({ eventOverrides = {}, settingsOverrides = {} } = {}) {
    useEventData.mockReturnValue({
        selectedEvent: makeOffseasonEvent(),
        selectedYear: 2026,
        qualSchedule: makeQualSchedule(),
        playoffSchedule: null,
        offlinePlayoffSchedule: null,
        alliances: { alliances: [], Lookup: {} },
        rankings: null,
        teamList: { teams: [] },
        allianceCount: { count: 8, menu: null },
        communityUpdates: null,
        practiceSchedule: null,
        currentMatch: 1,
        eventLabel: "Test Offseason Event",
        ftcMode: false,
        remapNumberToString: (n) => String(n),
        ...eventOverrides,
    });

    useSettings.mockReturnValue({
        timeFormat: { value: "h:mm A" },
        useSwipe: false,
        usePullDownToUpdate: false,
        useFourTeamAlliances: false,
        setUseFourTeamAlliances: vi.fn(),
        useScrollMemory: false,
        rankingsOverride: false,
        playoffCountOverride: null,
        setPlayoffCountOverride: vi.fn(),
        allianceSelectionRoundOrder: null,
        setAllianceSelectionRoundOrder: vi.fn(),
        nonStandardPlayoffs: false,
        ...settingsOverrides,
    });

    useEventActions.mockReturnValue({
        getRanks: vi.fn(),
        loadEvent: vi.fn(),
        nextMatch: vi.fn(),
        previousMatch: vi.fn(),
        getSchedule: vi.fn(),
    });
}

function baseProps(overrides = {}) {
    return {
        allianceSelection: true,
        playoffs: false,
        allianceSelectionArrays: {},
        setAllianceSelectionArrays: vi.fn(),
        setOfflinePlayoffSchedule: vi.fn(),
        qualsLength: 50,
        ...overrides,
    };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("AllianceSelectionPage – 4-team alliances switch", () => {
    beforeEach(() => {
        setupMocks();
    });

    it("shows the 4-team alliances switch for offseason events in non-FTC mode", () => {
        render(<AllianceSelectionPage {...baseProps()} />);
        expect(screen.getByText("Use 4 team Alliances for playoffs")).toBeInTheDocument();
    });

    it("does not show the switch for non-offseason events", () => {
        useEventData.mockReturnValue({
            ...useEventData(),
            selectedEvent: makeRegularEvent(),
            ftcMode: false,
        });
        render(<AllianceSelectionPage {...baseProps()} />);
        expect(screen.queryByText("Use 4 team Alliances for playoffs")).not.toBeInTheDocument();
    });

    it("does not show the switch in FTC mode even for offseason events", () => {
        useEventData.mockReturnValue({
            ...useEventData(),
            ftcMode: true,
        });
        render(<AllianceSelectionPage {...baseProps()} />);
        expect(screen.queryByText("Use 4 team Alliances for playoffs")).not.toBeInTheDocument();
    });

    it("does not show the switch when in playoffs mode", () => {
        render(<AllianceSelectionPage {...baseProps({ playoffs: true })} />);
        expect(screen.queryByText("Use 4 team Alliances for playoffs")).not.toBeInTheDocument();
    });

    it("shows the switch checked when useFourTeamAlliances is true", () => {
        setupMocks({ settingsOverrides: { useFourTeamAlliances: true } });
        render(<AllianceSelectionPage {...baseProps()} />);
        expect(screen.getByText("Use 4 team Alliances for playoffs")).toBeInTheDocument();
        // The Switch renders a checkbox input; verify it reflects the checked state
        const checkbox = document.querySelector("input[type='checkbox']");
        expect(checkbox?.checked).toBe(true);
    });

    it("works with OffSeasonWithAzureSync event type", () => {
        useEventData.mockReturnValue({
            ...useEventData(),
            selectedEvent: {
                value: { type: "OffSeasonWithAzureSync", code: "OFFSYNC", champLevel: null },
                label: "Azure Sync Offseason",
            },
        });
        render(<AllianceSelectionPage {...baseProps()} />);
        expect(screen.getByText("Use 4 team Alliances for playoffs")).toBeInTheDocument();
    });
});

describe("AllianceSelectionPage – round order modal descending label", () => {
    beforeEach(() => {
        setupMocks();
    });

    it("shows 'Alliance N → 1' label using allianceCount in the round order modal", () => {
        // allianceCount.count = 8 per setupMocks; round 2 defaults to descending
        render(<AllianceSelectionPage {...baseProps()} />);
        fireEvent.click(screen.getByText("Reorder Alliance Selection"));
        // Round 2 defaults to descending — its select displays the descending label as the value
        expect(screen.getByText("Alliance 8 → 1")).toBeInTheDocument();
    });

    it("uses playoffCountOverride value when set", () => {
        setupMocks({ settingsOverrides: { playoffCountOverride: { value: 6, label: 6 } } });
        render(<AllianceSelectionPage {...baseProps()} />);
        fireEvent.click(screen.getByText("Reorder Alliance Selection"));
        expect(screen.getByText("Alliance 6 → 1")).toBeInTheDocument();
    });
});

describe("AllianceSelectionPage – nonStandardPlayoffs", () => {
    beforeEach(() => {
        setupMocks();
    });

    it("shows info alert when nonStandardPlayoffs is enabled in playoffs mode", () => {
        setupMocks({ settingsOverrides: { nonStandardPlayoffs: true } });
        render(<AllianceSelectionPage {...baseProps({ playoffs: true })} />);
        expect(screen.getByText(/Nonstandard playoff format is enabled/)).toBeInTheDocument();
    });

    it("does not show info alert when nonStandardPlayoffs is false in playoffs mode", () => {
        setupMocks({ settingsOverrides: { nonStandardPlayoffs: false } });
        render(<AllianceSelectionPage {...baseProps({ playoffs: true })} />);
        expect(screen.queryByText(/Nonstandard playoff format is enabled/)).not.toBeInTheDocument();
    });

    it("does not show info alert when nonStandardPlayoffs is enabled but not in playoffs mode", () => {
        setupMocks({ settingsOverrides: { nonStandardPlayoffs: true } });
        render(<AllianceSelectionPage {...baseProps({ playoffs: false })} />);
        expect(screen.queryByText(/Nonstandard playoff format is enabled/)).not.toBeInTheDocument();
    });

    it("hides bracket and shows info alert instead of bracket when nonStandardPlayoffs is enabled", () => {
        setupMocks({ settingsOverrides: { nonStandardPlayoffs: true } });
        render(<AllianceSelectionPage {...baseProps({ playoffs: true })} />);
        expect(screen.queryByTestId("bracket-stub")).not.toBeInTheDocument();
        expect(screen.getByText(/Nonstandard playoff format is enabled/)).toBeInTheDocument();
    });

    it("shows bracket when nonStandardPlayoffs is false in playoffs mode", () => {
        setupMocks({
            settingsOverrides: { nonStandardPlayoffs: false },
            eventOverrides: {
                alliances: { alliances: Array(8).fill({ captain: null, round1: null }), Lookup: {} },
            },
        });
        render(<AllianceSelectionPage {...baseProps({ playoffs: true })} />);
        expect(screen.getByTestId("bracket-stub")).toBeInTheDocument();
    });
});

// ─── FTC 3-team alliances ─────────────────────────────────────────────────────

function makeFTCEvent(type) {
    return {
        value: { type, code: `FTC${type}`, champLevel: "" },
        label: `FTC Event type ${type}`,
    };
}

describe("AllianceSelectionPage – FTC 3-team alliances switch", () => {
    beforeEach(() => {
        setupMocks({ eventOverrides: { ftcMode: true, selectedEvent: makeFTCEvent("10") } });
    });

    it.each(["0", "10", "17"])(
        "shows '3 team Alliances' switch for FTC event type %s",
        (type) => {
            useEventData.mockReturnValue({ ...useEventData(), ftcMode: true, selectedEvent: makeFTCEvent(type) });
            render(<AllianceSelectionPage {...baseProps()} />);
            expect(screen.getByText("Use 3 team Alliances")).toBeInTheDocument();
        }
    );

    it.each(["0", "10", "17"])(
        "shows Alliance Count Override for FTC event type %s",
        (type) => {
            useEventData.mockReturnValue({ ...useEventData(), ftcMode: true, selectedEvent: makeFTCEvent(type) });
            render(<AllianceSelectionPage {...baseProps()} />);
            expect(screen.getByText("Alliance Count Override:")).toBeInTheDocument();
        }
    );

    it.each(["0", "10", "17"])(
        "shows Reorder Alliance Selection button for FTC event type %s",
        (type) => {
            useEventData.mockReturnValue({ ...useEventData(), ftcMode: true, selectedEvent: makeFTCEvent(type) });
            render(<AllianceSelectionPage {...baseProps()} />);
            expect(screen.getByText("Reorder Alliance Selection")).toBeInTheDocument();
        }
    );

    it("does not show alliance controls for non-eligible FTC type (League Meet = '1')", () => {
        useEventData.mockReturnValue({ ...useEventData(), ftcMode: true, selectedEvent: makeFTCEvent("1") });
        render(<AllianceSelectionPage {...baseProps()} />);
        expect(screen.queryByText("Use 3 team Alliances")).not.toBeInTheDocument();
        expect(screen.queryByText("Alliance Count Override:")).not.toBeInTheDocument();
        expect(screen.queryByText("Reorder Alliance Selection")).not.toBeInTheDocument();
    });

    it("does not show alliance controls for non-eligible FTC type (FIRST Championship = '6')", () => {
        useEventData.mockReturnValue({ ...useEventData(), ftcMode: true, selectedEvent: makeFTCEvent("6") });
        render(<AllianceSelectionPage {...baseProps()} />);
        expect(screen.queryByText("Use 3 team Alliances")).not.toBeInTheDocument();
    });

    it("does not show 'Use 4 team Alliances for playoffs' label in FTC mode", () => {
        render(<AllianceSelectionPage {...baseProps()} />);
        expect(screen.queryByText("Use 4 team Alliances for playoffs")).not.toBeInTheDocument();
    });

    it("shows the switch checked when useFourTeamAlliances is true in FTC mode", () => {
        setupMocks({
            eventOverrides: { ftcMode: true, selectedEvent: makeFTCEvent("10") },
            settingsOverrides: { useFourTeamAlliances: true },
        });
        render(<AllianceSelectionPage {...baseProps()} />);
        expect(screen.getByText("Use 3 team Alliances")).toBeInTheDocument();
        const checkbox = document.querySelector("input[type='checkbox']");
        expect(checkbox?.checked).toBe(true);
    });

    it("does not show alliance controls in playoffs mode (controls only in selection phase)", () => {
        render(<AllianceSelectionPage {...baseProps({ playoffs: true })} />);
        expect(screen.queryByText("Use 3 team Alliances")).not.toBeInTheDocument();
    });
});
