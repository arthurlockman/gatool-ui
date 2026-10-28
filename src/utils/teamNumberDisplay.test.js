import { describe, expect, it } from "vitest";
import { formatTeamNumber, teamNumberParts } from "./teamNumberDisplay";

const toString = (n) => n === 9984 ? "841B" : n;
const toNumber = (n) => n === "841B" ? 9984 : n;

describe("team number display", () => {
  it("shows both identifiers for remapped robots from either source ID", () => {
    expect(formatTeamNumber(9984, toString)).toBe("9984/841B");
    expect(formatTeamNumber("841B", toString, toNumber)).toBe("9984/841B");
    expect(teamNumberParts(9984, toString)).toEqual(["9984", "841B"]);
  });

  it("leaves ordinary teams, missing teams, and FIRST Global labels unchanged", () => {
    expect(formatTeamNumber(841, toString)).toBe("841");
    expect(formatTeamNumber(841)).toBe("841");
    expect(formatTeamNumber(null, toString)).toBe("");
    expect(formatTeamNumber(13, () => "Bahamas")).toBe("Bahamas");
    expect(formatTeamNumber(13, () => "BHS")).toBe("BHS");
  });
});
