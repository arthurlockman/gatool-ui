import {
  getPlayByPlayDisplayOrder,
  getFieldStationsInPlayByPlayVisualOrder,
} from "./playByPlayDisplayOrder";

describe("getPlayByPlayDisplayOrder", () => {
  it("FRC default (no swap) lists 8 stations starting Blue1, Red3", () => {
    expect(getPlayByPlayDisplayOrder(false, false)).toEqual([
      "Blue1", "Red3", "Blue2", "Red2", "Blue3", "Red1", "Blue4", "Red4",
    ]);
  });

  it("FTC default (no swap) lists 6 stations starting Blue1, Red2", () => {
    expect(getPlayByPlayDisplayOrder(true, false)).toEqual([
      "Blue1", "Red2", "Blue2", "Red1", "Blue3", "Red3",
    ]);
  });

  it("FRC swapped starts with Red3, Blue1", () => {
    expect(getPlayByPlayDisplayOrder(false, true)).toEqual([
      "Red3", "Blue1", "Red2", "Blue2", "Red1", "Blue3", "Red4", "Blue4",
    ]);
  });

  it("FTC swapped starts with Red2, Blue1", () => {
    expect(getPlayByPlayDisplayOrder(true, true)).toEqual([
      "Red2", "Blue1", "Red1", "Blue2", "Red3", "Blue3",
    ]);
  });

  it("only swaps when swapScreen is strictly true (not truthy)", () => {
    // Only `=== true` triggers swap per current implementation
    expect(getPlayByPlayDisplayOrder(false, 1)).toEqual(getPlayByPlayDisplayOrder(false, false));
    expect(getPlayByPlayDisplayOrder(true, "yes")).toEqual(getPlayByPlayDisplayOrder(true, false));
  });
});

describe("getFieldStationsInPlayByPlayVisualOrder", () => {
  it("returns red stations 1-3 in visual order for FRC default", () => {
    // From FRC default: Blue1, Red3, Blue2, Red2, Blue3, Red1, Blue4, Red4
    // Red[123] in order: Red3, Red2, Red1
    expect(getFieldStationsInPlayByPlayVisualOrder("Red", false, false)).toEqual([
      "Red3", "Red2", "Red1",
    ]);
  });

  it("returns blue stations 1-3 in visual order for FRC default", () => {
    expect(getFieldStationsInPlayByPlayVisualOrder("Blue", false, false)).toEqual([
      "Blue1", "Blue2", "Blue3",
    ]);
  });

  it("excludes station 4 even in FRC mode (top-to-bottom of red 1-3 only)", () => {
    const reds = getFieldStationsInPlayByPlayVisualOrder("Red", false, false);
    expect(reds).not.toContain("Red4");
  });

  it("returns red stations in visual order for FTC default", () => {
    // From FTC default: Blue1, Red2, Blue2, Red1, Blue3, Red3
    expect(getFieldStationsInPlayByPlayVisualOrder("Red", true, false)).toEqual([
      "Red2", "Red1", "Red3",
    ]);
  });

  it("returns blue stations in visual order for FTC swapped", () => {
    // From FTC swapped: Red2, Blue1, Red1, Blue2, Red3, Blue3
    expect(getFieldStationsInPlayByPlayVisualOrder("Blue", true, true)).toEqual([
      "Blue1", "Blue2", "Blue3",
    ]);
  });
});
