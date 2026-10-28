import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import RanksPage from "./RanksPage";

vi.mock("contexts/EventDataContext", () => ({ useEventData: vi.fn() }));
vi.mock("contexts/EventActionsContext", () => ({
  useEventActions: () => ({ getRanks: vi.fn(), getRegionalEventDetail: vi.fn() }),
}));
vi.mock("../contexts/SettingsContext", () => ({
  useSettings: () => ({
    useScrollMemory: false,
    rankingsOverride: false,
    setRankingsOverride: vi.fn(),
  }),
}));
vi.mock("../hooks/useScrollPosition", () => ({ default: vi.fn() }));
vi.mock("components/AdvancementDetailsModal", () => ({
  default: () => null,
  getRegionalAdvancementTotal: () => 0,
}));
vi.mock("react-toastify", () => ({ toast: { error: vi.fn() } }));

import { useEventData } from "contexts/EventDataContext";

function setupMocks(overrides = {}) {
  useEventData.mockReturnValue({
    selectedEvent: { value: { code: "NYTR", districtCode: "NE" }, label: "Test Event" },
    selectedYear: { value: "2026" },
    eventLabel: "Test Event",
    teamList: { teams: [{ teamNumber: 254, nameShort: "Poofs", name: "Poofs" }] },
    rankings: {
      ranks: [{
        teamNumber: 254,
        rank: 1,
        sortOrder1: 0,
        wins: 5,
        losses: 1,
        ties: 0,
        season: 2026,
        epaVal: 42,
        qualAverage: 80,
        dq: 0,
        matchesPlayed: 10,
      }],
      lastModified: "2026-03-01T12:00:00Z",
    },
    allianceCount: { count: 8 },
    districtRankings: null,
    communityUpdates: null,
    ftcMode: false,
    firstGlobalMode: false,
    remapNumberToString: (n) => String(n),
    remapStringToNumber: (s) => Number(s),
    EPA: {},
    regionalEventDetail: null,
    playoffs: false,
    ...overrides,
  });
}

function baseProps(overrides = {}) {
  return {
    rankSort: "rank",
    setRankSort: vi.fn(),
    setRankings: vi.fn(),
    allianceSelection: false,
    setAllianceSelectionArrays: vi.fn(),
    ...overrides,
  };
}

describe("RanksPage", () => {
  beforeEach(() => {
    setupMocks();
  });

  it("shows the no-event alert when nothing is selected", () => {
    setupMocks({ selectedEvent: null });
    render(<RanksPage {...baseProps()} />);
    expect(screen.getByText(/you need to select an event/i)).toBeInTheDocument();
  });

  it("shows the awaiting-team-data alert when teams are not loaded", () => {
    setupMocks({ teamList: { teams: [] } });
    render(<RanksPage {...baseProps()} />);
    expect(screen.getByText(/awaiting team data/i)).toBeInTheDocument();
  });

  it("renders rankings rows for FRC events", () => {
    render(<RanksPage {...baseProps()} />);
    expect(screen.getByText("254")).toBeInTheDocument();
    expect(screen.getByText("Season Record")).toBeInTheDocument();
    expect(screen.getByText("EPA")).toBeInTheDocument();
  });

  it("hides Season and EPA columns in FIRST Global mode", () => {
    setupMocks({ firstGlobalMode: true, ftcMode: { value: "FIRSTGlobal", label: "FIRST Global" } });
    render(<RanksPage {...baseProps()} />);
    expect(screen.getByText("254")).toBeInTheDocument();
    expect(screen.queryByText("Season Record")).not.toBeInTheDocument();
    expect(screen.queryByText("EPA")).not.toBeInTheDocument();
  });

  it("sorts letter-suffixed offseason teams by number then letter", () => {
    const remap = { 9984: "841B", 9997: "8B" };
    setupMocks({
      selectedEvent: { value: { code: "CAELK", type: "OffSeason" }, label: "Test Event" },
      teamList: { teams: [8, 841, 1678, 9984, 9997].map((teamNumber) => ({ teamNumber, nameShort: `Team ${teamNumber}` })) },
      rankings: { ranks: [1678, "841B", 841, "8B", 8].map((teamNumber, i) => ({ teamNumber, rank: i + 1 })) },
      remapNumberToString: (n) => remap[n] || n,
      remapStringToNumber: (s) => Number(Object.keys(remap).find((key) => remap[key] === s)) || Number(s),
    });
    const { container, rerender } = render(<RanksPage {...baseProps({ rankSort: "teamNumber" })} />);
    const order = () => [...container.querySelectorAll("tbody tr")].map((row) => row.cells[0].textContent.trim().split(/\s/)[0]);
    expect(order()).toEqual(["8", "9997/8B", "841", "9984/841B", "1678"]);

    rerender(<RanksPage {...baseProps({ rankSort: "-teamNumber" })} />);
    expect(order()).toEqual(["1678", "9984/841B", "841", "9997/8B", "8"]);
  });
});
