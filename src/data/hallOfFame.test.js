import { describe, expect, it } from "vitest";
import { FGCHallOfFame } from "./hallOfFame";

describe("FGCHallOfFame", () => {
  it("contains every completed FIRST Global season and skips the hiatus", () => {
    expect(FGCHallOfFame.map((season) => season.Year)).toEqual([
      2025, 2024, 2023, 2022, 2019, 2018, 2017,
    ]);
  });

  it("uses stable two-character country codes for every winner", () => {
    FGCHallOfFame.forEach((season) => {
      const winners = [
        season.Winner1,
        season.Winner2,
        season.Winner3,
        season.Winner4,
        season.Winner5,
      ].filter(Boolean);

      expect(winners.length).toBeGreaterThan(0);
      winners.forEach((countryCode) => {
        expect(countryCode).toMatch(/^[A-Z0-9]{2}$/);
      });
    });
  });

  it("records four winners for each season using the four-team format", () => {
    FGCHallOfFame.filter((season) => season.Year >= 2019).forEach((season) => {
      expect([
        season.Winner1,
        season.Winner2,
        season.Winner3,
        season.Winner4,
      ]).not.toContain(null);
      expect(season.Winner5).toBeNull();
    });
  });
});
