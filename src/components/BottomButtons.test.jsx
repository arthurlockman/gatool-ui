import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import BottomButtons from "./BottomButtons";
import { useEventData } from "contexts/EventDataContext";

vi.mock("contexts/EventDataContext", () => ({ useEventData: vi.fn() }));
vi.mock("../contexts/SettingsContext", () => ({
  useSettings: () => ({
    showWorldAndStatsOnAnnouncePlayByPlay: false,
    highScoreMode: false,
    nonStandardPlayoffs: false,
    playoffCountOverride: null,
  }),
}));
vi.mock("./FoulButtons", () => ({ default: () => null }));
vi.mock("./HighScoresSummary", () => ({ default: () => null }));

function match(matchNumber, winner = "") {
  return { matchNumber, tournamentLevel: "Playoff", description: `Final ${matchNumber}`, winner: { winner } };
}

describe("offline finals advantage", () => {
  it.each([
    ["red", "ADVANTAGE RED", "redAllianceTeam"],
    ["blue", "ADVANTAGE BLUE", "blueAllianceTeam"],
    ["tie", "EVEN", "tieAllianceTeam"],
  ])("uses uploaded results for a %s win or tie instead of API results", (winner, label, className) => {
    useEventData.mockReturnValue({
      offlinePlayoffSchedule: { schedule: [match(6, winner), match(7)] },
    });
    render(
      <BottomButtons
        matchDetails={match(7)}
        alliances={{ count: 4 }}
        playoffSchedule={{ schedule: [] }}
        selectedEvent={{ value: { code: "OFFLINE" } }}
      />,
    );
    expect(screen.getByText(/FINALS MATCH 2/)).toHaveTextContent(label);
    expect(screen.getByText(/FINALS MATCH 2/)).toHaveClass(className);
  });

  it("continues to use API results when no offline schedule is uploaded", () => {
    useEventData.mockReturnValue({ offlinePlayoffSchedule: null });
    render(
      <BottomButtons
        matchDetails={match(7)}
        alliances={{ count: 4 }}
        playoffSchedule={{ schedule: [match(6, "blue"), match(7)] }}
        selectedEvent={{ value: { code: "NYTR" } }}
      />,
    );
    expect(screen.getByText(/FINALS MATCH 2/)).toHaveTextContent("ADVANTAGE BLUE");
  });

  it("shows an even series after split wins and the correct advantage after a tie", () => {
    useEventData.mockReturnValue({
      offlinePlayoffSchedule: { schedule: [match(6, "red"), match(7, "blue"), match(8)] },
    });
    const props = {
      matchDetails: match(8),
      alliances: { count: 4 },
      playoffSchedule: { schedule: [] },
      selectedEvent: { value: { code: "OFFLINE" } },
    };
    const { rerender } = render(<BottomButtons {...props} />);
    expect(screen.getByText(/FINAL 8/)).toHaveTextContent("EVEN");
    useEventData.mockReturnValue({
      offlinePlayoffSchedule: { schedule: [match(6, "red"), match(7, "tie"), match(8)] },
    });
    rerender(<BottomButtons {...props} />);
    expect(screen.getByText(/FINAL 8/)).toHaveTextContent("ADVANTAGE RED");
  });
});
