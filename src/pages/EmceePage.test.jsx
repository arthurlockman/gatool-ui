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
  useSettings: vi.fn(() => ({
    reverseEmcee: false,
    hidePracticeSchedule: true,
    usePullDownToUpdate: false,
    useSwipe: false,
    nonStandardPlayoffs: false,
  })),
}));
vi.mock("hooks/UseWindowDimensions", () => ({
  default: () => ({ width: 1200, height: 800 }),
}));
vi.mock("react-hotkeys-hook", () => ({ useHotkeys: vi.fn() }));
vi.mock("react-swipeable", () => ({ useSwipeable: () => ({}) }));
vi.mock("components/EmceeClock", () => ({
  default: () => <div data-testid="emcee-clock" />,
}));

import { useEventData } from "contexts/EventDataContext";
import { useSettings } from "../contexts/SettingsContext";

const defaultSettings = {
  reverseEmcee: false,
  hidePracticeSchedule: true,
  usePullDownToUpdate: false,
  useSwipe: false,
  nonStandardPlayoffs: false,
};

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
    useSettings.mockReturnValue(defaultSettings);
  });

  it.each([
    ["FRC", false, true],
    ["FTC", { value: "FTC" }, true],
    ["FGC", { value: "FIRSTGlobal" }, false],
  ])("shows finals details for %s only when supported", (_program, ftcMode, visible) => {
    const matches = Array.from({ length: 6 }, (_, index) => ({
      matchNumber: index + 1,
      series: index + 1,
      tournamentLevel: "Playoff",
      description: `Playoff ${index + 1}`,
      teams: [],
      winner: { winner: "" },
    }));
    setupMocks({
      ftcMode,
      playoffSchedule: { schedule: matches },
      currentMatch: 6,
      alliances: { count: 4, alliances: [], Lookup: {} },
    });
    render(<EmceePage />);
    if (visible) {
      expect(screen.getByText(/FINALS MATCH 1/)).toBeInTheDocument();
      if (ftcMode) {
        expect(screen.getByText(/ADVANTAGE RED/)).toBeInTheDocument();
      }
    } else {
      expect(screen.queryByText(/FINALS MATCH/)).not.toBeInTheDocument();
      expect(screen.queryByText(/ADVANTAGE|EVEN/)).not.toBeInTheDocument();
    }
  });

  it.each([
    [4, 6, false, "red", "ADVANTAGE RED"],
    [4, 6, true, "blue", "ADVANTAGE BLUE"],
    [6, 10, false, "red", "ADVANTAGE RED"],
    [8, 14, false, "blue", "ADVANTAGE BLUE"],
    [8, 14, true, "tie", "EVEN"],
  ])("shows finals advantage below the numbers for %i alliances (first final %i, reversed %s)", (count, firstFinal, reverseEmcee, winner, label) => {
    const matches = Array.from({ length: firstFinal + 1 }, (_, index) => ({
      matchNumber: index + 1,
      tournamentLevel: "Playoff",
      description: `Playoff ${index + 1}`,
      teams: [
        { teamNumber: 133, station: "Red1" },
        { teamNumber: 58, station: "Blue1" },
      ],
      winner: { winner: index === firstFinal - 1 ? winner : "" },
    }));
    setupMocks({
      selectedEvent: { value: { code: "OFFLINE" }, label: "Offline Event" },
      offlinePlayoffSchedule: { schedule: matches },
      currentMatch: firstFinal + 1,
      alliances: {
        count,
        alliances: [],
        Lookup: {
          "133": { alliance: "Alliance 1" },
          "58": { alliance: "Alliance 3" },
        },
      },
    });
    useSettings.mockReturnValue({ ...defaultSettings, reverseEmcee });
    const { container, rerender } = render(<EmceePage />);
    const indicator = screen.getByText(/FINALS MATCH 2/);
    expect(indicator).toHaveTextContent(label);
    const captain = container.querySelector(".davidPriceCaptain");
    expect(captain).toBeInTheDocument();
    expect(captain.compareDocumentPosition(indicator) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    useSettings.mockReturnValue({ ...defaultSettings, reverseEmcee, nonStandardPlayoffs: true });
    rerender(<EmceePage />);
    expect(screen.queryByText(/FINALS MATCH 2/)).not.toBeInTheDocument();
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
