import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { HotkeysProvider } from "react-hotkeys-hook";
import FourAllianceBracket from "./FourAllianceBracket";
import SixAllianceBracket from "./SixAllianceBracket";
import Bracket from "./Bracket";
import { createByeMatch } from "../utils/scheduleParsingHelpers";

vi.mock("../contexts/SettingsContext", () => ({
  useSettings: () => ({ playoffCountOverride: null }),
}));

vi.mock("./WinnerSelectionModal", () => ({
  default: ({ showSelectWinner, showConfirmWinner, handleChooseWinner, handleConfirmWinner }) => (
    <>
      {showSelectWinner && ["red", "blue", "tie"].map((color) => (
        <button key={color} onClick={() => handleChooseWinner(color)}>{color}</button>
      ))}
      {showConfirmWinner && <button onClick={handleConfirmWinner}>Confirm</button>}
    </>
  ),
}));

function makeSchedule(firstFinal) {
  return {
    schedule: Array.from({ length: firstFinal + 2 }, (_, index) => {
      const match = createByeMatch(index + 1, "2026-10-24T13:45:00", `Match ${index + 1}`);
      if (index < firstFinal) {
        match.teams.forEach((team, station) => { team.teamNumber = 100 + station; });
      }
      return match;
    }),
  };
}

describe.each([
  ["four", FourAllianceBracket, 6],
  ["six", SixAllianceBracket, 10],
  ["eight", Bracket, 14],
])("%s-alliance offline finals", (_name, Component, firstFinal) => {
  it.each(["red", "blue", "tie"])("preserves station colors after a %s result in consecutive finals", async (result) => {
    let schedule = makeSchedule(firstFinal);
    const save = vi.fn();
    function view() {
      return (
        <HotkeysProvider initiallyActiveScopes={["matchNavigation"]}>
          <Component
            currentMatch={firstFinal}
            qualsLength={0}
            nextMatch={vi.fn()}
            previousMatch={vi.fn()}
            getSchedule={vi.fn()}
            useSwipe={false}
            usePullDownToUpdate={false}
            offlinePlayoffSchedule={schedule}
            setOfflinePlayoffSchedule={save}
            eventLabel="Offline Event"
            ftcMode={false}
            matches={schedule.schedule}
            allianceNumbers={() => []}
            allianceName={() => ""}
            matchScore={() => null}
            matchWinner={(number) => schedule.schedule[number - 1]?.winner}
          />
        </HotkeysProvider>
      );
    }
    const { container, rerender } = render(view());
    const originalTeams = structuredClone(schedule.schedule[firstFinal - 1].teams);
    for (let round = 0; round < 2; round++) {
      fireEvent.click(container.querySelector("#finals"));
      fireEvent.click(screen.getByRole("button", { name: result, exact: true }));
      fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
      await waitFor(() => expect(save).toHaveBeenCalledTimes(round + 1));
      schedule = save.mock.calls[round][0];
      expect(schedule.schedule[firstFinal - 1 + round].winner.winner).toBe(result);
      expect(schedule.schedule[firstFinal + round].teams).toEqual(originalTeams);
      expect(schedule.schedule[firstFinal - 1 + round].actualStartTime).toBeTruthy();
      rerender(view());
    }
  });
});
