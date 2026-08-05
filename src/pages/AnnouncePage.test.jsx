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
vi.mock("../contexts/SettingsContext", () => ({
  useSettings: () => ({
    timeFormat: { value: "h:mm A" },
    useSwipe: false,
    usePullDownToUpdate: false,
    useScrollMemory: false,
    nonStandardPlayoffs: false,
    highScoreMode: false,
    showWorldAndStatsOnAnnouncePlayByPlay: false,
  }),
}));
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
vi.mock("components/AnnounceAllianceMatchupSummary", () => ({ default: () => null }));

import { useEventData } from "contexts/EventDataContext";

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
    EPA: {},
    regionalEventDetail: null,
    ...overrides,
  });
}

describe("AnnouncePage", () => {
  beforeEach(() => {
    setupMocks();
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
});
