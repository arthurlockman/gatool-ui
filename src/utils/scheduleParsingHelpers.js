import _ from "lodash";

export const BASIC_MATCH_TEMPLATE = {
  Time: "",
  Description: "",
  "Blue 1": "",
  "Blue 2": "",
  "Blue 3": "",
  "Red 1": "",
  "Red 2": "",
  "Red 3": "",
};

export const MATCH_KEYS = [
  "Red 1",
  "Red 2",
  "Red 3",
  "Blue 1",
  "Blue 2",
  "Blue 3",
];

export function removeSurrogate(teamNumber) {
  teamNumber = teamNumber.replace("*", "");
  return teamNumber;
}

export function createByeMatch(bye, matchTime, description) {
  return {
    description: description,
    tournamentLevel: "Playoff",
    matchNumber: bye,
    startTime: matchTime,
    actualStartTime: null,
    postResultTime: null,
    scoreRedFinal: null,
    scoreRedFoul: null,
    scoreRedAuto: null,
    scoreBlueFinal: null,
    scoreBlueFoul: null,
    scoreBlueAuto: null,
    teams: [
      { teamNumber: null, station: "Red1", surrogate: !1, dq: !1 },
      { teamNumber: null, station: "Red2", surrogate: !1, dq: !1 },
      { teamNumber: null, station: "Red3", surrogate: !1, dq: !1 },
      { teamNumber: null, station: "Blue1", surrogate: !1, dq: !1 },
      { teamNumber: null, station: "Blue2", surrogate: !1, dq: !1 },
      { teamNumber: null, station: "Blue3", surrogate: !1, dq: !1 },
    ],
    winner: { winner: "", tieWinner: "", level: 0 },
  };
}

/**
 * Parse CSV text into a schedule array with standardized column keys.
 * @param {string} csvText raw CSV content
 * @returns {{ schedule: Array, eventName: string|null }}
 */
export function parseCSVToSchedule(csvText) {
  const lines = csvText.split('\n');

  // Parse header to understand column structure
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());

  // Find event name (usually in second row, first column)
  let eventName = null;
  if (lines[1]) {
    const secondRow = lines[1].split(',').map(c => c.replace(/"/g, '').trim());
    if (secondRow[0]) {
      eventName = secondRow[0];
    }
  }

  // Find column indices (CSV format from FIRST)
  const timeCol = headers.findIndex(h => h.toLowerCase().includes('starttime') || h.toLowerCase().includes('time'));
  const descCol = headers.findIndex(h => h.toLowerCase().includes('textbox17') || h.toLowerCase().includes('description'));
  const blue1Col = headers.findIndex(h => h.toLowerCase().includes('bluestation1') || h === 'textbox15');
  const blue2Col = headers.findIndex(h => h.toLowerCase().includes('bluestation2'));
  const blue3Col = headers.findIndex(h => h.toLowerCase().includes('bluestation3'));
  const red1Col = headers.findIndex(h => h.toLowerCase().includes('redstation1'));
  const red2Col = headers.findIndex(h => h.toLowerCase().includes('redstation2'));
  const red3Col = headers.findIndex(h => h.toLowerCase().includes('redstation3'));

  // Parse data rows (skip header and first 3 rows)
  const schedule = [];
  for (let i = 3; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    const cols = lines[i].split(',').map(c => c.replace(/"/g, '').trim());

    // Skip rows without match data
    if (!cols[descCol] || (!cols[descCol].toLowerCase().includes('qualification') && !cols[descCol].toLowerCase().includes('practice'))) {
      continue;
    }

    // Check if at least one team number exists to avoid blank matches
    const hasTeamData = cols[blue1Col] || cols[blue2Col] || cols[blue3Col] ||
                       cols[red1Col] || cols[red2Col] || cols[red3Col];

    if (!hasTeamData) {
      continue;
    }

    schedule.push({
      Time: cols[timeCol] || "",
      Description: cols[descCol] || "",
      "Blue 1": cols[blue1Col] || "",
      "Blue 2": cols[blue2Col] || "",
      "Blue 3": cols[blue3Col] || "",
      "Red 1": cols[red1Col] || "",
      "Red 2": cols[red2Col] || "",
      "Red 3": cols[red3Col] || "",
    });
  }

  return { schedule, eventName };
}

/**
 * Normalize schedule rows by merging with the basic template, converting all
 * values to strings, filtering blank rows, and detecting rows with missing teams.
 * @param {Array} schedule raw schedule rows
 * @returns {{ normalized: Array, errorMatches: Array }}
 */
export function normalizeAndValidateSchedule(schedule) {
  const errorMatches = [];

  let normalized = schedule.map((match) => {
    match = _.merge(_.cloneDeep(BASIC_MATCH_TEMPLATE), match);
    var scheduleKeys = Object.keys(match);
    scheduleKeys.forEach((key) => {
      match[key] = match[key].toString();
    });
    // detect matches with missing teams
    if (match["Description"]?.includes("Practice") || match["Description"]?.includes("Qualification")) {
      for (var i = 0; i < MATCH_KEYS.length; i++) {
        if (match[MATCH_KEYS[i]] === "") {
          errorMatches.push(match);
          break;
        }
      }
    }
    return match;
  });

  // Filter out blank rows (rows without any team data)
  normalized = normalized.filter((match) => {
    const hasTeamData = match["Blue 1"] || match["Blue 2"] || match["Blue 3"] ||
                       match["Red 1"] || match["Red 2"] || match["Red 3"];
    return hasTeamData;
  });

  return { normalized, errorMatches };
}
