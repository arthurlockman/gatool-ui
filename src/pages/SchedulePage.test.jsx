import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import SchedulePage from "./SchedulePage";

vi.mock("contexts/EventDataContext", () => ({ useEventData: vi.fn() }));
vi.mock("contexts/EventActionsContext", () => ({
  useEventActions: () => ({
    setSelectedEvent: vi.fn(),
    getTeamList: vi.fn(),
    loadEvent: vi.fn(),
    getAlliances: vi.fn(),
  }),
}));
vi.mock("../contexts/SettingsContext", () => ({
  useSettings: () => ({
    hidePracticeSchedule: false,
    useScrollMemory: false,
    playoffCountOverride: null,
    setPlayoffCountOverride: vi.fn(),
  }),
}));
vi.mock("../hooks/useScrollPosition", () => ({ default: vi.fn() }));
vi.mock("components/ScoresDetailsModal", () => ({
  default: () => null,
  rankPointDisplay: () => null,
}));
vi.mock("components/AdjustAlliancesModal", () => ({ default: () => null }));

import { useEventData } from "contexts/EventDataContext";

function schedulePageProps(overrides = {}) {
  return {
    setPracticeSchedule: vi.fn(),
    setOfflinePlayoffSchedule: vi.fn(),
    practiceFileUploaded: false,
    setPracticeFileUploaded: vi.fn(),
    setTeamListLoading: vi.fn(),
    playoffOnly: false,
    setPlayoffOnly: vi.fn(),
    champsStyle: false,
    setChampsStyle: vi.fn(),
    setQualsLength: vi.fn(),
    setEventLabel: vi.fn(),
    ...overrides,
  };
}

function setupMocks(overrides = {}) {
  useEventData.mockReturnValue({
    selectedEvent: { value: { code: "NYTR" }, label: "Test Event" },
    playoffSchedule: null,
    qualSchedule: { schedule: [] },
    qualScheduleAllFields: null,
    practiceSchedule: null,
    offlinePlayoffSchedule: null,
    alliances: { alliances: [], Lookup: {} },
    eventLabel: "Test Event",
    allianceCount: { count: 8 },
    ftcMode: false,
    firstGlobalMode: false,
    remapNumberToString: (n) => String(n),
    ...overrides,
  });
}

describe("SchedulePage", () => {
  beforeEach(() => {
    setupMocks();
  });

  it("shows the no-event alert when nothing is selected", () => {
    setupMocks({ selectedEvent: null });
    render(<SchedulePage {...schedulePageProps()} />);
    expect(
      screen.getByText(/you need to select an event/i)
    ).toBeInTheDocument();
  });

  it("shows the awaiting-schedule alert when no schedule is loaded", () => {
    render(<SchedulePage {...schedulePageProps()} />);
    expect(screen.getByText(/awaiting schedule for/i)).toBeInTheDocument();
  });

  it("renders the schedule table when qual matches are available", () => {
    setupMocks({
      qualSchedule: {
        schedule: [
          {
            matchNumber: 1,
            description: "Qualification 1",
            startTime: "2026-03-01T12:00:00Z",
            teams: [
              { teamNumber: 254, station: "Red1" },
              { teamNumber: 1678, station: "Blue1" },
            ],
          },
        ],
      },
    });
    render(<SchedulePage {...schedulePageProps()} />);
    expect(screen.getByText("Match Number")).toBeInTheDocument();
    expect(screen.getByText("Qualification 1")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
