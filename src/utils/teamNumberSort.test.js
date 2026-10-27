import { describe, expect, it } from "vitest";
import { orderByTeamNumber, parseTeamIdentifier } from "./teamNumberSort";

describe("parseTeamIdentifier", () => {
  it("splits numeric and letter-suffixed identifiers", () => {
    expect(parseTeamIdentifier(841)).toEqual({ number: 841, suffix: "" });
    expect(parseTeamIdentifier("841b")).toEqual({ number: 841, suffix: "B" });
    expect(parseTeamIdentifier("Kosovo")).toEqual({ number: Number.POSITIVE_INFINITY, suffix: "KOSOVO" });
  });
});

describe("orderByTeamNumber", () => {
  const rows = ["2035B", 8, 841, "841B", 2035, "8B", 115, "Bye"].map((id) => ({ id }));

  it("sorts by number then letter suffix", () => {
    expect(orderByTeamNumber(rows, (row) => row.id).map((row) => row.id))
      .toEqual([8, "8B", 115, 841, "841B", 2035, "2035B", "Bye"]);
  });

  it("reverses the same order when descending", () => {
    expect(orderByTeamNumber(rows, (row) => row.id, "desc").map((row) => row.id))
      .toEqual(["Bye", "2035B", 2035, "841B", 841, 115, "8B", 8]);
  });
});
