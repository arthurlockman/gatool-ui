import { countryCodeToFlag, getFirstGlobalFlagUrl } from "./countryFlag";

describe("countryCodeToFlag", () => {
  it("returns a flag emoji for a valid 2-letter code", () => {
    expect(countryCodeToFlag("us")).toBe("🇺🇸");
    expect(countryCodeToFlag("AF")).toBe("🇦🇫");
  });

  it("returns empty string for invalid input", () => {
    expect(countryCodeToFlag("")).toBe("");
    expect(countryCodeToFlag(null)).toBe("");
    expect(countryCodeToFlag("USA")).toBe("");
    expect(countryCodeToFlag(42)).toBe("");
  });
});

describe("getFirstGlobalFlagUrl", () => {
  it("returns null for falsy countryCode", () => {
    expect(getFirstGlobalFlagUrl("")).toBeNull();
    expect(getFirstGlobalFlagUrl(null)).toBeNull();
  });

  it("builds a standard country flag URL", () => {
    expect(getFirstGlobalFlagUrl("us")).toBe(
      "https://results.first.global/static/flags/4x3/us.svg"
    );
  });

  it.each([
    ["10", "10_hope"],
    ["11_south_america", "11_south-america"],
    ["hope", "10_hope"],
    ["south-america", "11_south-america"],
    ["oceania", "12_oceania"],
    ["north_america", "13_north-america"],
    ["europe", "14_europe"],
  ])("corrects special regional code %s → %s", (input, expectedFile) => {
    expect(getFirstGlobalFlagUrl(input)).toBe(
      `https://results.first.global/static/flags/4x3/${expectedFile}.svg`
    );
  });
});
