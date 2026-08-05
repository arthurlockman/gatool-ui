import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import StatsPage from "./StatsPage";

vi.mock("contexts/EventDataContext", () => ({ useEventData: vi.fn() }));
vi.mock("../components/StatsMatch", () => ({
  default: ({ matchName }) => <td data-testid="stats-match">{matchName}</td>,
}));

import { useEventData } from "contexts/EventDataContext";

const worldStats = {
  year: 2026,
  highscores: {
    "2026overallqual": { score: 100, matchName: "Q1" },
    "2026overallplayoff": { score: 120, matchName: "P1" },
  },
};

function setupEventData(overrides = {}) {
  useEventData.mockReturnValue({
    selectedEvent: { value: { code: "NYTR", districtCode: "NE" }, label: "Test Event" },
    eventLabel: "Test Event",
    selectedYear: { value: "2026" },
    ftcMode: false,
    ...overrides,
  });
}

describe("StatsPage", () => {
  beforeEach(() => {
    setupEventData();
  });

  it("shows the no-event alert when nothing is selected", () => {
    setupEventData({ selectedEvent: null });
    render(<StatsPage worldStats={null} eventHighScores={null} eventNamesCY={{}} districts={[]} ftcRegionHighScores={null} ftcLeagueHighScores={null} ftcLeagues={[]} frcDistrictHighScores={null} />);
    expect(screen.getByText(/you need to select an event/i)).toBeInTheDocument();
  });

  it("shows the awaiting-stats alert when no stats are loaded", () => {
    render(<StatsPage worldStats={null} eventHighScores={null} eventNamesCY={{}} districts={[]} ftcRegionHighScores={null} ftcLeagueHighScores={null} ftcLeagues={[]} frcDistrictHighScores={null} />);
    expect(screen.getByText(/awaiting stats data/i)).toBeInTheDocument();
  });

  it("renders world high scores for FRC events", () => {
    render(
      <StatsPage
        worldStats={worldStats}
        eventHighScores={null}
        eventNamesCY={{}}
        districts={[]}
        ftcRegionHighScores={null}
        ftcLeagueHighScores={null}
        ftcLeagues={[]}
        frcDistrictHighScores={null}
      />
    );
    expect(screen.getByText(/World High Scores 2026/i)).toBeInTheDocument();
  });

  it("toggles between FTC region and league high scores", () => {
    setupEventData({
      ftcMode: { value: "FTCOnline", label: "FTC Online" },
      selectedEvent: {
        value: { code: "FTCTEST", regionCode: "R1", leagueCode: "L9" },
        label: "FTC Event",
      },
    });

    render(
      <StatsPage
        worldStats={worldStats}
        eventHighScores={null}
        eventNamesCY={{}}
        districts={[]}
        ftcRegionHighScores={{ year: 2026, highscores: { overallqual: { score: 50 } } }}
        ftcLeagueHighScores={{ year: 2026, highscores: { overallqual: { score: 60 } } }}
        ftcLeagues={[{ value: "L9", label: "League Nine" }]}
        frcDistrictHighScores={null}
      />
    );

    expect(screen.getByText(/Region R1 High Scores/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "League" }));
    expect(screen.getByText(/League Nine High Scores/i)).toBeInTheDocument();
  });
});
