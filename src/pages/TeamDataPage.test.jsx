import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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
  default: ({ team, handleShow, editable }) => (
    <td onClick={editable ? () => handleShow(team) : undefined}>{team?.teamNumber}</td>
  ),
}));
vi.mock("components/TeamEditModal", () => ({
  default: ({ show, updateTeam, onHistory }) => show ? (
    <div>
      Team edit open
      <button onClick={() => onHistory(updateTeam)}>Show team history</button>
    </div>
  ) : null,
}));
vi.mock("components/TeamHistoryModal", () => ({
  default: ({ show }) => show ? <div>Team history open</div> : null,
}));

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

const testTeam = {
  teamNumber: 254,
  nameShort: "Poofs",
  organization: "Bellarmine",
  city: "San Jose",
  stateProv: "CA",
  country: "USA",
};

function setupFirstGlobal() {
  setupMocks({
    firstGlobalMode: true,
    ftcMode: { value: "FIRSTGlobal", label: "FIRST Global" },
    teamList: { teams: [testTeam] },
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

  it("keeps FIRST Global data read-only for a user without write access", () => {
    setupFirstGlobal();
    render(<TeamDataPage {...teamDataProps({
      isAuthenticated: true,
      user: { "https://gatool.org/roles": ["user"] },
    })} />);

    expect(screen.getByText(/FIRST Global team data is read-only/i)).toBeInTheDocument();
    expect(screen.getByText(/tap to download this table as excel/i)).toBeInTheDocument();
    expect(screen.queryByText(/restore team data from Excel/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /reset sponsors and robot names/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("254"));
    expect(screen.queryByText("Team edit open")).not.toBeInTheDocument();
  });

  it("allows FIRST Global editing and history for a write-enabled user", async () => {
    setupFirstGlobal();
    const getTeamHistory = vi.fn().mockResolvedValue([]);
    render(<TeamDataPage {...teamDataProps({
      isAuthenticated: true,
      user: { "https://gatool.org/roles": ["user", "firstglobal-write"] },
      getTeamHistory,
    })} />);

    expect(screen.getByText(/restore team data from Excel/i)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /reset sponsors and robot names/i })).toHaveLength(2);
    fireEvent.click(screen.getByText("254"));
    expect(screen.getByText("Team edit open")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /show team history/i }));
    await waitFor(() => expect(getTeamHistory).toHaveBeenCalledWith(254));
    expect(screen.getByText("Team history open")).toBeInTheDocument();
  });

  it("allows an admin to edit FIRST Global data without the write role", () => {
    setupFirstGlobal();
    render(<TeamDataPage {...teamDataProps({
      isAuthenticated: true,
      user: { "https://gatool.org/roles": ["admin"] },
    })} />);

    fireEvent.click(screen.getByText("254"));
    expect(screen.getByText("Team edit open")).toBeInTheDocument();
    expect(screen.queryByText(/FIRST Global team data is read-only/i)).not.toBeInTheDocument();
  });
});
