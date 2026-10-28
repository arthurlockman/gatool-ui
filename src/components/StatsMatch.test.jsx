import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import StatsMatch from "./StatsMatch";

vi.mock("contexts/EventDataContext", () => ({
  useEventData: () => ({
    firstGlobalMode: false,
    remapNumberToString: (n) => n === 9984 ? "841B" : n,
  }),
}));

describe("Stats team identifiers", () => {
  it("keeps numeric IDs for TBA extra robots", () => {
    render(
      <table><tbody><tr>
        <StatsMatch
          highScores={{ overallqual: { score: 100, allianceMembers: "9984 254 1678" } }}
          matchType="overallqual"
          matchName="Highest score"
          eventNamesCY={{}}
        />
      </tr></tbody></table>
    );
    expect(screen.getByRole("cell")).toHaveTextContent("(9984 254 1678)");
    expect(screen.getByRole("cell")).not.toHaveTextContent("841B");
  });
});
