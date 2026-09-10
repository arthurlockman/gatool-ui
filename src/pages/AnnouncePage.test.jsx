import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import AnnouncePage from "./AnnouncePage";

vi.mock("contexts/EventDataContext", () => ({ useEventData: vi.fn() }));
vi.mock("contexts/EventActionsContext", () => ({
  useEventActions: () => ({
    getRanks: vi.fn(),
    getRegionalEventDetail: vi.fn(),
    nextMatch: vi.fn(),
    previousMatch: vi.fn(),
    getSchedule: vi.fn(),
  }),
}));
vi.mock("../contexts/SettingsContext", () => ({ useSettings: vi.fn() }));
vi.mock("../hooks/useScrollPosition", () => ({ default: vi.fn() }));
vi.mock("react-hotkeys-hook", () => ({
  useHotkeysContext: () => ({ disableScope: vi.fn(), enableScope: vi.fn() }),
  useHotkeys: vi.fn(),
}));
vi.mock("react-swipeable", () => ({ useSwipeable: () => ({}) }));
vi.mock("../components/TopButtons", () => ({ default: () => <div data-testid="top-buttons" /> }));
vi.mock("../components/BottomButtons", () => ({ default: () => <div data-testid="bottom-buttons" /> }));
vi.mock("components/NotificationBanner", () => ({ default: () => null }));
vi.mock("components/EventNotificationBanner", () => ({ default: () => null }));

import { useEventData } from "contexts/EventDataContext";
import { useSettings } from "../contexts/SettingsContext";

function setupMocks(overrides = {}) {
  useEventData.mockReturnValue({
    selectedEvent: { value: { code: "NYTR" }, label: "Test Event" },
    selectedYear: { value: "2026" },
    eventLabel: "Test Event",
    ftcMode: false,
    firstGlobalMode: false,
    teamList: { teams: [{ teamNumber: 254, nameShort: "Poofs" }] },
    qualSchedule: { schedule: [{ matchNumber: 1, teams: [] }] },
    playoffSchedule: null,
    practiceSchedule: null,
    offlinePlayoffSchedule: null,
    alliances: { alliances: [], Lookup: {} },
    rankings: null,
    allianceCount: { count: 8 },
    communityUpdates: null,
    currentMatch: 1,
    remapNumberToString: (n) => String(n),
    remapStringToNumber: (n) => Number(n),
    EPA: {},
    regionalEventDetail: null,
    ...overrides,
  });
}

function setupSettingsMock(overrides = {}) {
  useSettings.mockReturnValue({
    timeFormat: { value: "h:mm A" },
    useSwipe: false,
    usePullDownToUpdate: false,
    useScrollMemory: false,
    nonStandardPlayoffs: false,
    highScoreMode: false,
    showWorldAndStatsOnAnnouncePlayByPlay: false,
    showQualsStats: false,
    ...overrides,
  });
}

/** A single-team playoff match, used to exercise the Announce table's Rank column. */
function playoffMatchWithTeam(teamNumber = 254) {
  return {
    schedule: [
      {
        matchNumber: 1,
        tournamentLevel: "Playoff",
        description: "Playoff 1",
        teams: [{ station: "Red1", teamNumber, surrogate: false, dq: false }],
      },
    ],
  };
}

/** A single-team quals match, used to exercise the Announce table's Rank column. */
function qualsMatchWithTeam(teamNumber = 254) {
  return {
    schedule: [
      {
        matchNumber: 1,
        tournamentLevel: "Qualification",
        description: "Qualification 1",
        teams: [{ station: "Red1", teamNumber, surrogate: false, dq: false }],
      },
    ],
  };
}

describe("AnnouncePage", () => {
  beforeEach(() => {
    setupMocks();
    setupSettingsMock();
  });

  it("shows the no-event alert when nothing is selected", () => {
    setupMocks({ selectedEvent: null });
    render(<AnnouncePage adHocMode={false} setAdHocMode={vi.fn()} qualsLength={10} />);
    expect(screen.getByText(/you need to select an event/i)).toBeInTheDocument();
  });

  it("shows the awaiting-team-data alert when teams are not loaded", () => {
    setupMocks({ teamList: { teams: [] } });
    render(<AnnouncePage adHocMode={false} setAdHocMode={vi.fn()} qualsLength={10} />);
    expect(screen.getByText(/awaiting team data/i)).toBeInTheDocument();
  });

  it("shows the awaiting-schedule alert when no schedule is available", () => {
    setupMocks({ qualSchedule: { schedule: [] }, practiceSchedule: null });
    render(<AnnouncePage adHocMode={false} setAdHocMode={vi.fn()} qualsLength={10} />);
    expect(screen.getByText(/awaiting schedule data/i)).toBeInTheDocument();
  });

  describe("Rank column during Quals vs Playoffs", () => {
    it("shows the Rank column during Quals", () => {
      setupMocks({
        qualSchedule: qualsMatchWithTeam(),
        rankings: { ranks: [{ teamNumber: 254, rank: 3 }] },
      });
      render(<AnnouncePage adHocMode={false} setAdHocMode={vi.fn()} qualsLength={10} />);
      expect(screen.getByText("Rank")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("hides the Rank column during Playoffs when Show Quals Statistics in Playoffs is off", () => {
      setupMocks({
        selectedEvent: { value: { code: "NYTR", name: "Test Event" }, label: "Test Event" },
        qualSchedule: { schedule: [] },
        playoffSchedule: playoffMatchWithTeam(),
        rankings: { ranks: [{ teamNumber: 254, rank: 3 }] },
      });
      setupSettingsMock({ showQualsStats: false });
      render(<AnnouncePage adHocMode={false} setAdHocMode={vi.fn()} qualsLength={10} />);
      expect(screen.queryByText("Rank")).not.toBeInTheDocument();
      expect(screen.queryByText("3")).not.toBeInTheDocument();
    });

    it("shows the Rank column during Playoffs when Show Quals Statistics in Playoffs is on", () => {
      setupMocks({
        selectedEvent: { value: { code: "NYTR", name: "Test Event" }, label: "Test Event" },
        qualSchedule: { schedule: [] },
        playoffSchedule: playoffMatchWithTeam(),
        rankings: { ranks: [{ teamNumber: 254, rank: 3 }] },
      });
      setupSettingsMock({ showQualsStats: true });
      render(<AnnouncePage adHocMode={false} setAdHocMode={vi.fn()} qualsLength={10} />);
      expect(screen.getByText("Rank")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("keeps the Rank column hidden during Playoffs for FIRST Global even when the setting is on", () => {
      setupMocks({
        firstGlobalMode: true,
        selectedEvent: { value: { code: "NYTR", name: "Test Event" }, label: "Test Event" },
        qualSchedule: { schedule: [] },
        playoffSchedule: playoffMatchWithTeam(),
        rankings: { ranks: [{ teamNumber: 254, rank: 3 }] },
      });
      setupSettingsMock({ showQualsStats: true });
      render(<AnnouncePage adHocMode={false} setAdHocMode={vi.fn()} qualsLength={10} />);
      expect(screen.queryByText("Rank")).not.toBeInTheDocument();
    });
  });
});
