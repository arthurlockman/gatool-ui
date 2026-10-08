import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ScoresDetailsModal from "./ScoresDetailsModal";

describe("ScoresDetailsModal", () => {
  it("displays FIRST Global match-level and nested score details", () => {
    render(
      <ScoresDetailsModal
        show
        onHide={vi.fn()}
        scoresMatch={{
          description: "Qualification 1",
          winner: { winner: "red" },
          scores: {
            matchLevel: "Qualification",
            matchNumber: 1,
            winningAlliance: 1,
            coopertitionAchieved: true,
            allBarriersCleared: false,
            biodiversityDistributed: 0,
            alliances: [
              { alliance: "Red", totalPoints: 72, biodiversityUnits: 0 },
              { alliance: "Blue", totalPoints: 42, biodiversityUnits: 0 },
            ],
            details: {
              eventKey: "FGC_2026-FGC-CMP",
              tournamentKey: "t2",
              id: 1,
              wildfireInRedSuppressionUnit: 48,
              redRobotOneBraceState: 0.1,
              blueRobotOneBraceState: 0.05,
            },
          },
        }}
      />
    );

    expect(screen.getByText("Match Details")).toBeInTheDocument();
    expect(screen.getByText("Coopertition Achieved")).toBeInTheDocument();
    expect(screen.getByText("All Barriers Cleared")).toBeInTheDocument();
    expect(
      screen.getByText("Wildfire In Red Suppression Unit")
    ).toBeInTheDocument();
    expect(screen.getByText("Red Robot One Brace State")).toBeInTheDocument();
    expect(screen.getByText("Blue Robot One Brace State")).toBeInTheDocument();
    expect(screen.queryByText("Event Key")).not.toBeInTheDocument();
    expect(screen.queryByText("Tournament Key")).not.toBeInTheDocument();
  });
});
