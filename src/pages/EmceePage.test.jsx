import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import EmceePage from "./EmceePage";

vi.mock("contexts/EventDataContext", () => ({ useEventData: vi.fn() }));
vi.mock("contexts/EventActionsContext", () => ({
  useEventActions: () => ({
    nextMatch: vi.fn(),
    previousMatch: vi.fn(),
    getSchedule: vi.fn(),
  }),
}));
vi.mock("../contexts/SettingsContext", () => ({
  useSettings: () => ({
    reverseEmcee: false,
    hidePracticeSchedule: true,
    usePullDownToUpdate: false,
    useSwipe: false,
    nonStandardPlayoffs: false,
  }),
}));
vi.mock("hooks/UseWindowDimensions", () => ({
  default: () => ({ width: 1200, height: 800 }),
}));
vi.mock("react-hotkeys-hook", () => ({ useHotkeys: vi.fn() }));
vi.mock("react-swipeable", () => ({ useSwipeable: () => ({}) }));
vi.mock("components/EmceeClock", () => ({
  default: () => <div data-testid="emcee-clock" />,
}));
vi.mock("../components/PlayoffDetails", () => ({ default: () => null }));

import { useEventData } from "contexts/EventDataContext";

function setupMocks(overrides = {}) {
  useEventData.mockReturnValue({
    selectedEvent: { value: { code: "NYTR", type: "Regional" }, label: "Test Event" },
    playoffSchedule: null,
    qualSchedule: { schedule: [] },
    practiceSchedule: null,
    offlinePlayoffSchedule: null,
    alliances: { alliances: [], Lookup: {} },
    currentMatch: 1,
    eventLabel: "Test Event",
    ftcMode: false,
    remapNumberToString: (n) => String(n),
    ...overrides,
  });
}

describe("EmceePage", () => {
  beforeEach(() => {
    setupMocks();
  });

  it("shows the no-event alert when nothing is selected", () => {
    setupMocks({ selectedEvent: null });
    render(<EmceePage />);
    expect(
      screen.getByText(/you need to select an event/i)
    ).toBeInTheDocument();
  });

  it("shows the awaiting-schedule alert when no schedule is loaded", () => {
    render(<EmceePage />);
    expect(screen.getByText(/awaiting schedule data/i)).toBeInTheDocument();
  });

  it("renders the emcee clock when qual matches are available", () => {
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
    render(<EmceePage />);
    expect(screen.getByTestId("emcee-clock")).toBeInTheDocument();
  });
});
