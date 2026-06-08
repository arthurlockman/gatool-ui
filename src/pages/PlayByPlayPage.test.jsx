// Tests for PlayByPlayPage — focused on row-5 (Blue3/Red3) visibility in FTC mode.
//
// Row 5 contains the 3rd team slots (Blue3 / Red3). In FTC mode it is hidden
// by default (standard alliances are 2-team), but must appear when:
//   (a) the event has champLevel CHAMPS / CMPDIV / CMPSUB, OR
//   (b) useFourTeamAlliances is enabled (3-team toggle) during playoffs, OR
//   (c) adHocMode (test match) is active.
//
// These tests focus on case (b): the new useFourTeamAlliances path.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// ─── Module mocks ─────────────────────────────────────────────────────────────

vi.mock("../contexts/SettingsContext", () => ({ useSettings: vi.fn() }));
vi.mock("contexts/EventDataContext", () => ({ useEventData: vi.fn() }));
vi.mock("contexts/EventActionsContext", () => ({ useEventActions: vi.fn() }));

// Stub every child component that makes its own network/context calls.
// PlayByPlay is stubbed to render a detectable element keyed by station so
// tests can assert which rows are rendered without parsing CSS class names.
vi.mock("../components/PlayByPlay", () => ({
    default: ({ station }) => <td data-testid={`pbp-${station}`} />,
}));
vi.mock("../components/TopButtons", () => ({ default: () => <div data-testid="top-buttons" /> }));
vi.mock("../components/BottomButtons", () => ({ default: () => <div data-testid="bottom-buttons" /> }));
vi.mock("components/NotificationBanner", () => ({ default: () => null }));
vi.mock("components/EventNotificationBanner", () => ({ default: () => null }));

vi.mock("../hooks/useScrollPosition", () => ({ default: vi.fn() }));
vi.mock("../contextProviders/ScrollContainerContext", () => ({ useScrollToTop: () => vi.fn() }));
vi.mock("react-swipeable", () => ({ useSwipeable: () => ({}) }));
vi.mock("react-hotkeys-hook", () => ({ useHotkeys: vi.fn() }));

vi.mock("../utils/applyPlayoffStationOrderToMatch", () => ({
    applyPlayoffStationOrderToMatch: (match) => match,
}));
vi.mock("../utils/playoffStationOrderEdits", () => ({
    applyPlayoffStationOrderToMatch: (match) => match,
}));

import PlayByPlayPage from "./PlayByPlayPage";
import { useSettings } from "../contexts/SettingsContext";
import { useEventData } from "contexts/EventDataContext";
import { useEventActions } from "contexts/EventActionsContext";

// ─── Fixture helpers ──────────────────────────────────────────────────────────

/** A minimal FTC Qualifier event (no champLevel → standard 2-team alliances). */
function makeFTCQualifierEvent() {
    return {
        value: { code: "FTCTEST", type: "2", champLevel: "", name: "FTC Qualifier Test" },
        label: "FTC Qualifier Test",
    };
}

/** A 6-team playoff match with tournamentLevel "Playoff". */
function makePlayoffMatch() {
    return {
        description: "Playoff 1",
        matchNumber: 1,
        tournamentLevel: "Playoff",
        startTime: null,
        field: "Primary",
        isReplay: false,
        matchVideoLink: null,
        scoreRedFinal: null, scoreRedFoul: null, scoreRedAuto: null,
        scoreBlueFinal: null, scoreBlueFoul: null, scoreBlueAuto: null,
        autoStartTime: null, actualStartTime: null, postResultTime: null,
        winner: { winner: null, tieWinner: null, level: null },
        teams: [
            { teamNumber: 1001, station: "Red1", surrogate: false, dq: false, alliance: "Alliance 1" },
            { teamNumber: 1002, station: "Red2", surrogate: false, dq: false, alliance: "Alliance 1" },
            { teamNumber: 1003, station: "Red3", surrogate: false, dq: false, alliance: "Alliance 1" },
            { teamNumber: 2001, station: "Blue1", surrogate: false, dq: false, alliance: "Alliance 2" },
            { teamNumber: 2002, station: "Blue2", surrogate: false, dq: false, alliance: "Alliance 2" },
            { teamNumber: 2003, station: "Blue3", surrogate: false, dq: false, alliance: "Alliance 2" },
        ],
    };
}

function makeTeamList() {
    return {
        teams: [1001, 1002, 1003, 2001, 2002, 2003].map((n) => ({
            teamNumber: n, name: `Team ${n}`, city: "City", stateProv: "ST", country: "USA", organization: `Org ${n}`,
        })),
    };
}

function setupMocks({ useFourTeamAlliances = false, champLevel = "" } = {}) {
    useEventData.mockReturnValue({
        selectedEvent: { ...makeFTCQualifierEvent(), value: { ...makeFTCQualifierEvent().value, champLevel } },
        selectedYear: { value: "2026" },
        eventLabel: "FTC Qualifier Test",
        ftcMode: true,
        teamList: makeTeamList(),
        qualSchedule: { schedule: [] },
        playoffSchedule: { schedule: [makePlayoffMatch()] },
        practiceSchedule: { schedule: [] },
        offlinePlayoffSchedule: { schedule: [] },
        rankings: null,
        districtRankings: null,
        alliances: { alliances: [], Lookup: {} },
        allianceCount: { count: 4 },
        communityUpdates: [],
        currentMatch: 1,
        remapNumberToString: (n) => String(n),
        remapStringToNumber: (s) => Number(s),
        EPA: [],
        regionalEventDetail: null,
    });

    useSettings.mockReturnValue({
        swapScreen: false,
        hidePracticeSchedule: false,
        teamReduction: null,
        showInspection: false,
        usePullDownToUpdate: false,
        useSwipe: false,
        useScrollMemory: false,
        useFourTeamAlliances,
        showNotes: false,
        showMottoes: false,
        showQualsStats: false,
        showQualsStatsQuals: false,
        playoffStationOrderEdits: {},
    });

    useEventActions.mockReturnValue({
        nextMatch: vi.fn(),
        previousMatch: vi.fn(),
        setMatchFromMenu: vi.fn(),
        getSchedule: vi.fn(),
        getRegionalEventDetail: vi.fn(),
    });
}

function baseProps(overrides = {}) {
    return {
        worldStats: null,
        ftcRegionHighScores: null,
        ftcLeagueHighScores: null,
        frcDistrictHighScores: null,
        districts: [],
        ftcLeagues: [],
        eventNamesCY: [],
        setAlliances: vi.fn(),
        eventHighScores: null,
        backupTeam: null,
        setBackupTeam: vi.fn(),
        upsertPlayoffReserveOverlay: vi.fn(),
        removePlayoffReserveOverlay: vi.fn(),
        playoffReserveEdits: {},
        playoffStationOrderEdits: {},
        upsertPlayoffStationOrderOverlay: vi.fn(),
        removePlayoffStationOrderOverlay: vi.fn(),
        adHocMatch: null,
        setAdHocMatch: vi.fn(),
        adHocMode: false,
        adHocRedAlliance: null,
        setAdHocRedAlliance: vi.fn(),
        adHocBlueAlliance: null,
        setAdHocBlueAlliance: vi.fn(),
        qualsLength: 0,
        playoffOnly: false,
        eventMessage: [],
        eventBell: 0,
        setEventBell: vi.fn(),
        allianceSelectionArrays: {},
        ...overrides,
    };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("PlayByPlayPage – FTC row-5 (Blue3/Red3) visibility", () => {
    beforeEach(() => {
        setupMocks();
    });

    it("shows Blue3 and Red3 during FTC playoffs when useFourTeamAlliances is enabled", () => {
        setupMocks({ useFourTeamAlliances: true });
        render(<PlayByPlayPage {...baseProps()} />);
        expect(screen.getByTestId("pbp-Blue3")).toBeInTheDocument();
        expect(screen.getByTestId("pbp-Red3")).toBeInTheDocument();
    });

    it("hides Blue3 and Red3 during FTC playoffs when useFourTeamAlliances is disabled and no champLevel", () => {
        setupMocks({ useFourTeamAlliances: false, champLevel: "" });
        render(<PlayByPlayPage {...baseProps()} />);
        expect(screen.queryByTestId("pbp-Blue3")).not.toBeInTheDocument();
        expect(screen.queryByTestId("pbp-Red3")).not.toBeInTheDocument();
    });

    it("shows Blue3 and Red3 during FTC playoffs for CHAMPS champLevel without useFourTeamAlliances", () => {
        setupMocks({ useFourTeamAlliances: false, champLevel: "CHAMPS" });
        render(<PlayByPlayPage {...baseProps()} />);
        expect(screen.getByTestId("pbp-Blue3")).toBeInTheDocument();
        expect(screen.getByTestId("pbp-Red3")).toBeInTheDocument();
    });

    it("shows Blue3 and Red3 in FTC adHocMode regardless of useFourTeamAlliances", () => {
        const adHocMatch = [
            { teamNumber: 1001, station: "Red1", surrogate: false, dq: false },
            { teamNumber: 1002, station: "Red2", surrogate: false, dq: false },
            { teamNumber: 1003, station: "Red3", surrogate: false, dq: false },
            { teamNumber: 2001, station: "Blue1", surrogate: false, dq: false },
            { teamNumber: 2002, station: "Blue2", surrogate: false, dq: false },
            { teamNumber: 2003, station: "Blue3", surrogate: false, dq: false },
        ];
        setupMocks({ useFourTeamAlliances: false });
        render(<PlayByPlayPage {...baseProps({ adHocMode: true, adHocMatch })} />);
        expect(screen.getByTestId("pbp-Blue3")).toBeInTheDocument();
        expect(screen.getByTestId("pbp-Red3")).toBeInTheDocument();
    });

    it("always shows Blue1 and Red2 regardless of useFourTeamAlliances setting", () => {
        setupMocks({ useFourTeamAlliances: false });
        render(<PlayByPlayPage {...baseProps()} />);
        expect(screen.getByTestId("pbp-Blue1")).toBeInTheDocument();
        expect(screen.getByTestId("pbp-Red2")).toBeInTheDocument();
    });
});
