import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ScoresDetailsModal from "./ScoresDetailsModal";

describe("ScoresDetailsModal", () => {
  it("displays alliance-designated FIRST Global scores in the Alliance Results table", () => {
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
              wildfireInRedSuppressionUnit: 118,
              wildfireInBlueSuppressionUnit: 208,
              redRobotOneBraceState: 0.3,
              blueRobotOneBraceState: 0.3,
            },
          },
        }}
      />
    );

    expect(screen.getByText("Match Details")).toBeInTheDocument();
    expect(screen.getByText("Coopertition Achieved")).toBeInTheDocument();
    expect(screen.getByText("All Barriers Cleared")).toBeInTheDocument();
    const criterion = screen.getByText("Criterion");
    const wildfireRow = screen.getByText("Wildfire In Suppression Unit").closest("tr");
    const robotStateRow = screen.getByText("Robot One Brace State").closest("tr");
    expect(criterion.compareDocumentPosition(wildfireRow)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(criterion.compareDocumentPosition(robotStateRow)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(wildfireRow.children[1]).toHaveTextContent("118");
    expect(wildfireRow.children[2]).toHaveTextContent("208");
    expect(robotStateRow.children[1]).toHaveTextContent("0.3");
    expect(robotStateRow.children[2]).toHaveTextContent("0.3");
    expect(screen.queryByText("Wildfire In Red Suppression Unit")).not.toBeInTheDocument();
    expect(screen.queryByText("Red Robot One Brace State")).not.toBeInTheDocument();
    expect(screen.queryByText("Blue Robot One Brace State")).not.toBeInTheDocument();
    expect(screen.queryByText("Event Key")).not.toBeInTheDocument();
    expect(screen.queryByText("Tournament Key")).not.toBeInTheDocument();
  });
});
