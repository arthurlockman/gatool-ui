import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
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
