import {
  BASIC_MATCH_TEMPLATE,
  MATCH_KEYS,
  removeSurrogate,
  createByeMatch,
  parseCSVToSchedule,
  normalizeAndValidateSchedule,
} from "./scheduleParsingHelpers";

describe("removeSurrogate", () => {
  it("strips a single asterisk surrogate marker", () => {
    expect(removeSurrogate("254*")).toBe("254");
  });

  it("returns the team number unchanged when there is no marker", () => {
    expect(removeSurrogate("1234")).toBe("1234");
  });

  it("returns an empty string when the input is just the marker", () => {
    expect(removeSurrogate("*")).toBe("");
  });
});

describe("createByeMatch", () => {
  it("builds a Playoff bye match with six null-team stations and no scores", () => {
    const match = createByeMatch(7, "2024-04-12T10:00:00", "Playoff Bye");
    expect(match.tournamentLevel).toBe("Playoff");
    expect(match.matchNumber).toBe(7);
    expect(match.startTime).toBe("2024-04-12T10:00:00");
    expect(match.description).toBe("Playoff Bye");
    expect(match.scoreRedFinal).toBeNull();
    expect(match.scoreBlueFinal).toBeNull();
    expect(match.teams).toHaveLength(6);
    const stations = match.teams.map((t) => t.station);
    expect(stations).toEqual(["Red1", "Red2", "Red3", "Blue1", "Blue2", "Blue3"]);
    match.teams.forEach((t) => {
      expect(t.teamNumber).toBeNull();
      expect(t.surrogate).toBe(false);
      expect(t.dq).toBe(false);
    });
    expect(match.winner).toEqual({ winner: "", tieWinner: "", level: 0 });
  });
});

describe("parseCSVToSchedule", () => {
  const buildHeader = () =>
    [
      '"StartTime"',
      '"textbox17"',
      '"redStation1"',
      '"redStation2"',
      '"redStation3"',
      '"blueStation1"',
      '"blueStation2"',
      '"blueStation3"',
    ].join(",");

  const buildRow = (cells) => cells.map((c) => `"${c}"`).join(",");

  it("extracts the event name from row 2 column 1", () => {
    const csv = [
      buildHeader(),
      buildRow(["NE District Hartford Event", "", "", "", "", "", "", ""]),
      buildRow(["", "", "", "", "", "", "", ""]),
    ].join("\n");
    const { eventName, schedule } = parseCSVToSchedule(csv);
    expect(eventName).toBe("NE District Hartford Event");
    expect(schedule).toEqual([]);
  });

  it("parses qualification rows into the standardized match shape", () => {
    const csv = [
      buildHeader(),
      buildRow(["NE Hartford", "", "", "", "", "", "", ""]),
      buildRow(["", "", "", "", "", "", "", ""]),
      buildRow(["10:00", "Qualification 1", "111", "222", "333", "444", "555", "666"]),
      buildRow(["10:08", "Qualification 2", "777", "888", "999", "101", "202", "303"]),
    ].join("\n");
    const { schedule } = parseCSVToSchedule(csv);
    expect(schedule).toHaveLength(2);
    expect(schedule[0]).toEqual({
      Time: "10:00",
      Description: "Qualification 1",
      "Red 1": "111",
      "Red 2": "222",
      "Red 3": "333",
      "Blue 1": "444",
      "Blue 2": "555",
      "Blue 3": "666",
    });
    expect(schedule[1].Description).toBe("Qualification 2");
  });

  it("includes practice rows", () => {
    const csv = [
      buildHeader(),
      buildRow(["", "", "", "", "", "", "", ""]),
      buildRow(["", "", "", "", "", "", "", ""]),
      buildRow(["09:00", "Practice 1", "1", "2", "3", "4", "5", "6"]),
    ].join("\n");
    const { schedule } = parseCSVToSchedule(csv);
    expect(schedule).toHaveLength(1);
    expect(schedule[0].Description).toBe("Practice 1");
  });

  it("skips rows that aren't qualification or practice", () => {
    const csv = [
      buildHeader(),
      buildRow(["", "", "", "", "", "", "", ""]),
      buildRow(["", "", "", "", "", "", "", ""]),
      buildRow(["10:00", "Lunch break", "", "", "", "", "", ""]),
      buildRow(["10:30", "Playoff 1", "1", "2", "3", "4", "5", "6"]),
      buildRow(["11:00", "Qualification 5", "1", "2", "3", "4", "5", "6"]),
    ].join("\n");
    const { schedule } = parseCSVToSchedule(csv);
    expect(schedule).toHaveLength(1);
    expect(schedule[0].Description).toBe("Qualification 5");
  });

  it("skips qualification rows that have no team data", () => {
    const csv = [
      buildHeader(),
      buildRow(["", "", "", "", "", "", "", ""]),
      buildRow(["", "", "", "", "", "", "", ""]),
      buildRow(["10:00", "Qualification 1", "", "", "", "", "", ""]),
    ].join("\n");
    const { schedule } = parseCSVToSchedule(csv);
    expect(schedule).toHaveLength(0);
  });

  it("skips empty lines", () => {
    const csv = [
      buildHeader(),
      buildRow(["", "", "", "", "", "", "", ""]),
      buildRow(["", "", "", "", "", "", "", ""]),
      "",
      buildRow(["10:00", "Qualification 1", "1", "2", "3", "4", "5", "6"]),
      "",
    ].join("\n");
    const { schedule } = parseCSVToSchedule(csv);
    expect(schedule).toHaveLength(1);
  });
});

describe("normalizeAndValidateSchedule", () => {
  const fullMatch = (overrides = {}) => ({
    Time: "10:00",
    Description: "Qualification 1",
    "Red 1": "111",
    "Red 2": "222",
    "Red 3": "333",
    "Blue 1": "444",
    "Blue 2": "555",
    "Blue 3": "666",
    ...overrides,
  });

  it("merges each row with the basic template and stringifies all values", () => {
    const { normalized } = normalizeAndValidateSchedule([
      fullMatch({ "Red 1": 111 }),
    ]);
    expect(normalized).toHaveLength(1);
    expect(normalized[0]["Red 1"]).toBe("111");
    Object.keys(BASIC_MATCH_TEMPLATE).forEach((key) => {
      expect(normalized[0]).toHaveProperty(key);
    });
  });

  it("flags qualification rows with any missing team as errors", () => {
    const incomplete = fullMatch({ "Blue 3": "" });
    const { errorMatches } = normalizeAndValidateSchedule([incomplete]);
    expect(errorMatches).toHaveLength(1);
    expect(errorMatches[0]["Blue 3"]).toBe("");
  });

  it("flags practice rows with missing teams", () => {
    const practice = fullMatch({ Description: "Practice 1", "Red 2": "" });
    const { errorMatches } = normalizeAndValidateSchedule([practice]);
    expect(errorMatches).toHaveLength(1);
  });

  it("filters out blank rows that have no team data", () => {
    const blank = fullMatch({
      "Red 1": "",
      "Red 2": "",
      "Red 3": "",
      "Blue 1": "",
      "Blue 2": "",
      "Blue 3": "",
    });
    const { normalized, errorMatches } = normalizeAndValidateSchedule([
      blank,
      fullMatch(),
    ]);
    expect(normalized).toHaveLength(1);
    expect(normalized[0].Description).toBe("Qualification 1");
    // The blank row is also flagged as an error before being filtered out.
    expect(errorMatches).toHaveLength(1);
  });

  it("does not flag complete qualification rows as errors", () => {
    const { errorMatches } = normalizeAndValidateSchedule([fullMatch()]);
    expect(errorMatches).toEqual([]);
  });

  it("flags exactly once per match even if multiple stations are missing", () => {
    const incomplete = fullMatch({ "Red 1": "", "Blue 2": "" });
    const { errorMatches } = normalizeAndValidateSchedule([incomplete]);
    expect(errorMatches).toHaveLength(1);
  });

  it("MATCH_KEYS covers all six team stations", () => {
    expect(MATCH_KEYS.sort()).toEqual([
      "Blue 1",
      "Blue 2",
      "Blue 3",
      "Red 1",
      "Red 2",
      "Red 3",
    ]);
  });
});
