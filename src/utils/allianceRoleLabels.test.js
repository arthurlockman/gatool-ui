import {
  isWorldChampsOrDivisionEvent,
  roundThreeOrReserveRoleLabel,
} from "./allianceRoleLabels";

describe("isWorldChampsOrDivisionEvent", () => {
  it("is true for CHAMPS / CMPDIV / CMPSUB", () => {
    expect(isWorldChampsOrDivisionEvent({ champLevel: "CHAMPS" })).toBe(true);
    expect(isWorldChampsOrDivisionEvent({ champLevel: "CMPDIV" })).toBe(true);
    expect(isWorldChampsOrDivisionEvent({ champLevel: "CMPSUB" })).toBe(true);
  });

  it("is false for any other champLevel", () => {
    expect(isWorldChampsOrDivisionEvent({ champLevel: "REGIONAL" })).toBe(false);
    expect(isWorldChampsOrDivisionEvent({ champLevel: "DISTRICT" })).toBe(false);
    expect(isWorldChampsOrDivisionEvent({ champLevel: "" })).toBe(false);
  });

  it("is false when eventValue is null/undefined or has no champLevel", () => {
    expect(isWorldChampsOrDivisionEvent(null)).toBe(false);
    expect(isWorldChampsOrDivisionEvent(undefined)).toBe(false);
    expect(isWorldChampsOrDivisionEvent({})).toBe(false);
  });
});

describe("roundThreeOrReserveRoleLabel", () => {
  it("returns 'Round 3 Selection' at champs / division events", () => {
    expect(roundThreeOrReserveRoleLabel({ champLevel: "CHAMPS" })).toBe("Round 3 Selection");
    expect(roundThreeOrReserveRoleLabel({ champLevel: "CMPDIV" })).toBe("Round 3 Selection");
    expect(roundThreeOrReserveRoleLabel({ champLevel: "CMPSUB" })).toBe("Round 3 Selection");
  });

  it("returns 'Reserve Team' for everything else", () => {
    expect(roundThreeOrReserveRoleLabel({ champLevel: "REGIONAL" })).toBe("Reserve Team");
    expect(roundThreeOrReserveRoleLabel(null)).toBe("Reserve Team");
    expect(roundThreeOrReserveRoleLabel(undefined)).toBe("Reserve Team");
    expect(roundThreeOrReserveRoleLabel({})).toBe("Reserve Team");
  });
});
