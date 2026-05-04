import { getAllianceLookupEntry } from "./allianceLookup";

describe("getAllianceLookupEntry", () => {
  const lookup = {
    "254": { team: 254, name: "Cheesy" },
    "1234": { team: 1234, name: "FRC" },
    "FTC-12345": { team: 12345, name: "FTC" },
  };

  it("returns null when lookup is missing", () => {
    expect(getAllianceLookupEntry(null, 254)).toBeNull();
    expect(getAllianceLookupEntry(undefined, 254)).toBeNull();
  });

  it("returns null for null/undefined/empty teamNumber", () => {
    expect(getAllianceLookupEntry(lookup, null)).toBeNull();
    expect(getAllianceLookupEntry(lookup, undefined)).toBeNull();
    expect(getAllianceLookupEntry(lookup, "")).toBeNull();
  });

  it("matches on stringified team number when no remapper is provided", () => {
    expect(getAllianceLookupEntry(lookup, 254)).toEqual({ team: 254, name: "Cheesy" });
    expect(getAllianceLookupEntry(lookup, "1234")).toEqual({ team: 1234, name: "FRC" });
  });

  it("returns null when team is not in lookup and no remapper", () => {
    expect(getAllianceLookupEntry(lookup, 9999)).toBeNull();
  });

  it("falls back to the remapped key when the raw key misses", () => {
    const remap = (n) => `FTC-${n}`;
    expect(getAllianceLookupEntry(lookup, 12345, remap)).toEqual({ team: 12345, name: "FTC" });
  });

  it("prefers the raw key over the remapped key", () => {
    const remap = () => "1234";
    expect(getAllianceLookupEntry(lookup, 254, remap)).toEqual({ team: 254, name: "Cheesy" });
  });

  it("returns null when remapper does not produce a hit", () => {
    const remap = (n) => `none-${n}`;
    expect(getAllianceLookupEntry(lookup, 9999, remap)).toBeNull();
  });

  it("ignores a non-function remapper argument", () => {
    expect(getAllianceLookupEntry(lookup, 9999, "not-a-fn")).toBeNull();
    expect(getAllianceLookupEntry(lookup, 9999, 42)).toBeNull();
  });
});
