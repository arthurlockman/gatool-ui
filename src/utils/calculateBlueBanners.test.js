import calculateBlueBanners from "./calculateBlueBanners";

const REGIONAL_EVENT = (key, year, extras = {}) => ({
  key,
  year,
  event_type: 0,
  event_type_string: "Regional",
  name: "Test Regional",
  parent_event_key: null,
  ...extras,
});

const DISTRICT_EVENT = (key, year, extras = {}) => ({
  key,
  year,
  event_type: 1,
  event_type_string: "District",
  name: "Test District",
  parent_event_key: null,
  ...extras,
});

const DCMP_EVENT = (key, year, extras = {}) => ({
  key,
  year,
  event_type: 2,
  event_type_string: "District Championship",
  name: "Test District Championship",
  parent_event_key: null,
  ...extras,
});

const DCMP_DIVISION_EVENT = (key, year, parent, extras = {}) => ({
  key,
  year,
  event_type: 2,
  event_type_string: "District Championship Division",
  name: "Test DCMP Division",
  parent_event_key: parent,
  ...extras,
});

const CMP_DIVISION_EVENT = (key, year, extras = {}) => ({
  key,
  year,
  event_type: 3,
  event_type_string: "Championship Division",
  name: "Newton",
  parent_event_key: null,
  ...extras,
});

const EINSTEIN_EVENT = (key, year, extras = {}) => ({
  key,
  year,
  event_type: 4,
  event_type_string: "Championship Finals",
  name: "Einstein",
  parent_event_key: null,
  ...extras,
});

const FESTIVAL_EVENT = (key, year, extras = {}) => ({
  key,
  year,
  event_type: 99,
  event_type_string: "Offseason",
  name: "Festival of Champions",
  parent_event_key: null,
  ...extras,
});

const winnerAward = (eventKey, year) => ({
  event_key: eventKey,
  year,
  award_type: 1,
  name: "Winner",
});

const chairmansAward = (eventKey, year) => ({
  event_key: eventKey,
  year,
  award_type: 0,
  name: "Chairman's Award",
});

const impactAward = (eventKey, year) => ({
  event_key: eventKey,
  year,
  award_type: 0,
  name: "Impact Award",
});

const woodieFlowersAward = (eventKey, year) => ({
  event_key: eventKey,
  year,
  award_type: 3,
  name: "Woodie Flowers Finalist Award",
});

const finalistAward = (eventKey, year, name) => ({
  event_key: eventKey,
  year,
  award_type: 69,
  name,
});

describe("calculateBlueBanners", () => {
  it("returns the empty banner shape when given no awards", () => {
    const result = calculateBlueBanners({ events: [] }, []);
    expect(result.blueBanners).toBe(0);
    expect(result.blueBannersYears).toEqual([]);
    expect(result.regionalWins).toBe(0);
    expect(result.einsteinWins).toBe(0);
  });

  it("handles undefined / null inputs without throwing", () => {
    expect(() => calculateBlueBanners(undefined, undefined)).not.toThrow();
    expect(() => calculateBlueBanners(null, null)).not.toThrow();
    expect(calculateBlueBanners(undefined, undefined).blueBanners).toBe(0);
  });

  it("ignores awards whose event isn't in champsAppearances", () => {
    const result = calculateBlueBanners(
      { events: [REGIONAL_EVENT("2024nytr", 2024)] },
      [winnerAward("2024_unknown", 2024)]
    );
    expect(result.blueBanners).toBe(0);
  });

  it("ignores award types that aren't blue-banner awards", () => {
    const result = calculateBlueBanners(
      { events: [REGIONAL_EVENT("2024nytr", 2024)] },
      [
        { event_key: "2024nytr", year: 2024, award_type: 2, name: "Finalist" },
        { event_key: "2024nytr", year: 2024, award_type: 9, name: "Excellence in Engineering" },
      ]
    );
    expect(result.blueBanners).toBe(0);
  });

  it("counts a regional win toward regionalWins and the global total", () => {
    const result = calculateBlueBanners(
      { events: [REGIONAL_EVENT("2024nytr", 2024)] },
      [winnerAward("2024nytr", 2024)]
    );
    expect(result.regionalWins).toBe(1);
    expect(result.regionalWinsYears).toEqual([2024]);
    expect(result.blueBanners).toBe(1);
    expect(result.blueBannersYears).toEqual([2024]);
  });

  it("counts regional Chairman's, Impact, and Woodie Flowers separately", () => {
    const result = calculateBlueBanners(
      { events: [REGIONAL_EVENT("2024nytr", 2024)] },
      [
        chairmansAward("2024nytr", 2024),
        impactAward("2024nytr", 2024),
        woodieFlowersAward("2024nytr", 2024),
      ]
    );
    expect(result.regionalChairmans).toBe(1);
    expect(result.regionalImpact).toBe(1);
    expect(result.regionalWoodieFlowers).toBe(1);
    expect(result.blueBanners).toBe(3);
  });

  it("counts district wins/awards toward district buckets", () => {
    const result = calculateBlueBanners(
      { events: [DISTRICT_EVENT("2024necmp", 2024)] },
      [
        winnerAward("2024necmp", 2024),
        chairmansAward("2024necmp", 2024),
        impactAward("2024necmp", 2024),
        woodieFlowersAward("2024necmp", 2024),
      ]
    );
    expect(result.districtWins).toBe(1);
    expect(result.districtChairmans).toBe(1);
    expect(result.districtImpact).toBe(1);
    expect(result.districtWoodieFlowers).toBe(1);
    expect(result.blueBanners).toBe(4);
  });

  it("recognizes a District Championship Division by parent_event_key", () => {
    const result = calculateBlueBanners(
      {
        events: [
          DCMP_DIVISION_EVENT("2024necmp_div", 2024, "2024necmp", {
            event_type_string: "District Championship Division",
            name: "Wilson Division",
          }),
        ],
      },
      [winnerAward("2024necmp_div", 2024), impactAward("2024necmp_div", 2024)]
    );
    expect(result.districtDivisionWins).toBe(1);
    expect(result.districtDivisionImpact).toBe(1);
    expect(result.blueBanners).toBe(2);
    expect(result.districtChampionshipWins).toBe(0);
  });

  it("treats District Championship Chairman's/Impact as Regional-bucket banners", () => {
    const result = calculateBlueBanners(
      { events: [DCMP_EVENT("2024necmp", 2024)] },
      [
        chairmansAward("2024necmp", 2024),
        impactAward("2024necmp", 2024),
        winnerAward("2024necmp", 2024),
        woodieFlowersAward("2024necmp", 2024),
      ]
    );
    expect(result.regionalChairmans).toBe(1);
    expect(result.regionalImpact).toBe(1);
    expect(result.districtChampionshipWins).toBe(1);
    expect(result.districtChampionshipWoodieFlowers).toBe(1);
    expect(result.blueBanners).toBe(4);
  });

  it("counts Championship Division (event_type 3) and FTC equivalent (5)", () => {
    const result = calculateBlueBanners(
      {
        events: [
          CMP_DIVISION_EVENT("2024newton", 2024),
          { ...CMP_DIVISION_EVENT("2024archimedes", 2024), event_type: 5 },
        ],
      },
      [winnerAward("2024newton", 2024), chairmansAward("2024archimedes", 2024)]
    );
    expect(result.championshipDivisionWins).toBe(1);
    expect(result.championshipDivisionChairmans).toBe(1);
    expect(result.blueBanners).toBe(2);
  });

  it("counts Einstein wins, Chairman's, Impact, and finalists", () => {
    const result = calculateBlueBanners(
      { events: [EINSTEIN_EVENT("2024cmptx", 2024)] },
      [
        winnerAward("2024cmptx", 2024),
        chairmansAward("2024cmptx", 2024),
        impactAward("2024cmptx", 2024),
        finalistAward("2024cmptx", 2024, "Chairman's Finalist"),
        finalistAward("2024cmptx", 2024, "Impact Award Finalist"),
        woodieFlowersAward("2024cmptx", 2024),
      ]
    );
    expect(result.einsteinWins).toBe(1);
    expect(result.einsteinChairmans).toBe(1);
    expect(result.einsteinImpact).toBe(1);
    expect(result.einsteinChairmansFinalist).toBe(1);
    expect(result.einsteinImpactFinalist).toBe(1);
    expect(result.championshipWoodieFlowers).toBe(1);
    expect(result.blueBanners).toBe(6);
  });

  it("counts a Festival of Champions win regardless of event_type", () => {
    const result = calculateBlueBanners(
      { events: [FESTIVAL_EVENT("2024foc", 2024)] },
      [winnerAward("2024foc", 2024)]
    );
    expect(result.festivalWins).toBe(1);
    expect(result.festivalWinsYears).toEqual([2024]);
    expect(result.blueBanners).toBe(1);
  });

  it("aggregates banners across multiple years and tracks years per category", () => {
    const result = calculateBlueBanners(
      {
        events: [
          REGIONAL_EVENT("2022nytr", 2022),
          REGIONAL_EVENT("2024nytr", 2024),
          EINSTEIN_EVENT("2023cmptx", 2023),
        ],
      },
      [
        winnerAward("2022nytr", 2022),
        winnerAward("2024nytr", 2024),
        winnerAward("2023cmptx", 2023),
      ]
    );
    expect(result.regionalWins).toBe(2);
    expect(result.regionalWinsYears.sort()).toEqual([2022, 2024]);
    expect(result.einsteinWins).toBe(1);
    expect(result.einsteinWinsYears).toEqual([2023]);
    expect(result.blueBanners).toBe(3);
    expect(result.blueBannersYears.sort()).toEqual([2022, 2023, 2024]);
  });
});
