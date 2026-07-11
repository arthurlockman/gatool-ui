import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TeamDataPage from "./TeamDataPage";

vi.mock("contexts/EventDataContext", () => ({ useEventData: vi.fn() }));
vi.mock("contexts/EventActionsContext", () => ({
  useEventActions: vi.fn(() => ({
    getCommunityUpdates: vi.fn(),
    getTeamList: vi.fn(),
  })),
}));
vi.mock("../contexts/SettingsContext", () => ({
  useSettings: () => ({
    useScrollMemory: false,
    showSponsors: true,
    showAwards: true,
    showMinorAwards: true,
    showNotes: true,
    showMottoes: true,
    showBlueBanners: true,
    showInspection: true,
    monthsWarning: { value: "6", label: "6 months" },
  }),
}));
vi.mock("../contextProviders/OnlineContext", () => ({
  useOnlineStatus: () => true,
}));
vi.mock("../hooks/useScrollPosition", () => ({ default: vi.fn() }));
vi.mock("react-hotkeys-hook", () => ({
  useHotkeysContext: () => ({ disableScope: vi.fn(), enableScope: vi.fn() }),
}));
vi.mock("react-interval-hook", () => ({
  useInterval: () => ({ start: vi.fn(), stop: vi.fn() }),
}));
vi.mock("../components/TeamAvatar", () => ({ default: () => null }));
vi.mock("components/TeamTimer", () => ({
  default: ({ team }) => <td>{team?.teamNumber}</td>,
}));
vi.mock("components/TeamEditModal", () => ({ default: () => null }));
vi.mock("components/TeamHistoryModal", () => ({ default: () => null }));

import { useEventData } from "contexts/EventDataContext";
import { useEventActions } from "contexts/EventActionsContext";

function teamDataProps(overrides = {}) {
  return {
    teamSort: "teamNumber",
    setTeamSort: vi.fn(),
    setCommunityUpdates: vi.fn(),
    lastVisit: {},
    setLastVisit: vi.fn(),
    putTeamData: vi.fn(),
    localUpdates: [],
    setLocalUpdates: vi.fn(),
    originalAndSustaining: [],
    user: null,
    isAuthenticated: false,
    getTeamHistory: vi.fn(),
    ...overrides,
  };
}

function setupMocks(overrides = {}) {
  useEventData.mockReturnValue({
    selectedEvent: { value: { code: "NYTR" }, label: "Test Event" },
    selectedYear: { value: "2026" },
    teamList: { teams: [] },
    rankings: null,
    communityUpdates: null,
    allianceCount: { count: 8 },
    qualSchedule: null,
    playoffSchedule: null,
    eventLabel: "Test Event",
    ftcMode: false,
    firstGlobalMode: false,
    remapNumberToString: (n) => String(n),
    ...overrides,
  });
}

describe("TeamDataPage", () => {
  beforeEach(() => {
    setupMocks();
  });

  it("shows the no-event alert when nothing is selected", () => {
    setupMocks({ selectedEvent: null });
    render(<TeamDataPage {...teamDataProps()} />);
    expect(
      screen.getByText(/you need to select an event/i)
    ).toBeInTheDocument();
  });

  it("shows the awaiting-team-data alert when teams are not loaded", () => {
    render(<TeamDataPage {...teamDataProps()} />);
    expect(screen.getByText(/awaiting team data/i)).toBeInTheDocument();
  });

  it("retries loading teams when the awaiting alert is clicked", () => {
    const getTeamList = vi.fn();
    vi.mocked(useEventActions).mockReturnValue({
      getCommunityUpdates: vi.fn(),
      getTeamList,
    });
    render(<TeamDataPage {...teamDataProps()} />);
    fireEvent.click(screen.getByText(/awaiting team data/i));
    expect(getTeamList).toHaveBeenCalled();
  });

  it("renders the team table when team data is available", () => {
    setupMocks({
      teamList: {
        teams: [
          {
            teamNumber: 254,
            nameShort: "Poofs",
            organization: "Bellarmine",
            city: "San Jose",
            stateProv: "CA",
            country: "USA",
          },
        ],
      },
    });
    render(<TeamDataPage {...teamDataProps()} />);
    expect(screen.getByText("254")).toBeInTheDocument();
    expect(screen.getByText("Poofs")).toBeInTheDocument();
    expect(screen.getByText(/tap to download this table as excel/i)).toBeInTheDocument();
  });
});
