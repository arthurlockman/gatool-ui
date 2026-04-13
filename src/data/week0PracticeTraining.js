/**
 * WEEK0 practice event training payloads (FRC) built from gatool API exports.
 * Phase 1: first 7 quals done + scores; remaining quals scheduled; interim rankings; no playoffs.
 * Phase 2: full quals + final rankings; alliance selection ready; no playoff schedule.
 * Phase 3: full quals; playoffs through match 7 complete; alliances set. Unplayed playoff rows use placeholder teams (TBD) so JSON spoilers are hidden; App then propagates winners/losers from completed matches only.
 * Phase 4: full quals + full playoffs.
 */
import qualMatchesJson from "./week0Practice/WEEK0MatchesQuals.json";
import playoffMatchesJson from "./week0Practice/WEEK0MatchesPlayoffs.json";
import qualScoresJson from "./week0Practice/WEEK0ScoresQuals.json";
import playoffScoresJson from "./week0Practice/WEEK0ScoresPlayoffs.json";
import rankingsJson from "./week0Practice/WEEK0Rankings.json";
import teamsJson from "./week0Practice/WEEK0Teams.json";
import alliancesJson from "./week0Practice/WEEK0Alliances.json";

const SOURCE_DAY = "2026-02-21";

function deepRedate(value, todayYmd) {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") {
    return value.includes(SOURCE_DAY) ? value.split(SOURCE_DAY).join(todayYmd) : value;
  }
  if (Array.isArray(value)) return value.map((v) => deepRedate(v, todayYmd));
  if (typeof value === "object") {
    const o = {};
    for (const k of Object.keys(value)) {
      o[k] = deepRedate(value[k], todayYmd);
    }
    return o;
  }
  return value;
}

function mapTeamsForTraining(teams) {
  return (teams || []).map((t) => ({
    teamNumber: t.teamNumber,
    station: t.station,
    surrogate: false,
    dq: t.dq ?? false,
  }));
}

/** Stations only — used for not-yet-played playoff rows so the UI shows TBD, not spoiler teams. */
const FRC_PLAYOFF_PLACEHOLDER_STATIONS = [
  "Red1",
  "Red2",
  "Red3",
  "Blue1",
  "Blue2",
  "Blue3",
];

function placeholderFrcPlayoffTeams() {
  return FRC_PLAYOFF_PLACEHOLDER_STATIONS.map((station) => ({
    teamNumber: null,
    station,
    surrogate: false,
    dq: false,
  }));
}

function toTrainingQualMatch(raw, todayYmd, played) {
  const m = deepRedate(raw, todayYmd);
  const base = {
    description: m.description,
    level: "Qualification",
    startTime: m.startTime || `${todayYmd}T12:00:00`,
    matchNumber: m.matchNumber,
    field: "Primary",
    tournamentLevel: "Qualification",
    teams: mapTeamsForTraining(m.teams),
    isReplay: m.isReplay ?? false,
    matchVideoLink: m.matchVideoLink ?? null,
  };
  if (!played) {
    return {
      ...base,
      scoreRedFinal: null,
      scoreRedFoul: null,
      scoreRedAuto: null,
      scoreBlueFinal: null,
      scoreBlueFoul: null,
      scoreBlueAuto: null,
      autoStartTime: null,
      actualStartTime: null,
      postResultTime: null,
    };
  }
  return {
    ...base,
    scoreRedFinal: m.scoreRedFinal,
    scoreRedFoul: m.scoreRedFoul,
    scoreRedAuto: m.scoreRedAuto,
    scoreBlueFinal: m.scoreBlueFinal,
    scoreBlueFoul: m.scoreBlueFoul,
    scoreBlueAuto: m.scoreBlueAuto,
    autoStartTime: m.autoStartTime,
    actualStartTime: m.actualStartTime,
    postResultTime: m.postResultTime,
  };
}

function toTrainingPlayoffMatch(raw, todayYmd, played) {
  const m = deepRedate(raw, todayYmd);
  const base = {
    description: m.description,
    level: "Playoff",
    startTime: m.startTime || `${todayYmd}T15:00:00`,
    matchNumber: m.matchNumber,
    field: "Primary",
    tournamentLevel: "Playoff",
    teams: mapTeamsForTraining(m.teams),
    isReplay: m.isReplay ?? false,
    matchVideoLink: m.matchVideoLink ?? null,
  };
  if (!played) {
    return {
      ...base,
      teams: placeholderFrcPlayoffTeams(),
      scoreRedFinal: null,
      scoreRedFoul: null,
      scoreRedAuto: null,
      scoreBlueFinal: null,
      scoreBlueFoul: null,
      scoreBlueAuto: null,
      autoStartTime: null,
      actualStartTime: null,
      postResultTime: null,
    };
  }
  return {
    ...base,
    scoreRedFinal: m.scoreRedFinal,
    scoreRedFoul: m.scoreRedFoul,
    scoreRedAuto: m.scoreRedAuto,
    scoreBlueFinal: m.scoreBlueFinal,
    scoreBlueFoul: m.scoreBlueFoul,
    scoreBlueAuto: m.scoreBlueAuto,
    autoStartTime: m.autoStartTime,
    actualStartTime: m.actualStartTime,
    postResultTime: m.postResultTime,
  };
}

/** ~halfway through 15 quals: 7 played, 8 not yet played */
const QUAL_PLAYED_PHASE1 = 7;
/** Playoff phase 3: bracket complete through match 7 */
const PLAYOFF_COMPLETE_THROUGH = 7;

/**
 * Rankings that look like mid-qual (not enough matches for alliance selection to arm).
 * Caps matches played and scales W-L-T + qual average proportionally.
 */
function buildMidQualRankings(finalRows, targetMatchesPlayed) {
  return finalRows.map((r) => {
    const mp = Math.max(0, Math.min(targetMatchesPlayed, r.matchesPlayed || 0));
    if (mp === 0 || !r.matchesPlayed) {
      return {
        ...r,
        wins: 0,
        losses: 0,
        ties: 0,
        matchesPlayed: 0,
        qualAverage: 0,
        sortOrder1: 0,
        sortOrder2: 0,
        sortOrder3: 0,
        sortOrder4: 0,
        sortOrder5: 0,
        sortOrder6: 0,
      };
    }
    const ratio = mp / r.matchesPlayed;
    let wins = Math.round((r.wins || 0) * ratio);
    let losses = Math.round((r.losses || 0) * ratio);
    let ties = Math.round((r.ties || 0) * ratio);
    let sum = wins + losses + ties;
    if (sum > mp) {
      const over = sum - mp;
      losses = Math.max(0, losses - over);
      sum = wins + losses + ties;
    }
    if (sum < mp) {
      losses += mp - sum;
    }
    return {
      ...r,
      wins,
      losses,
      ties,
      matchesPlayed: mp,
      qualAverage: Number(((r.qualAverage || 0) * ratio).toFixed(2)),
      sortOrder1: Number(((r.sortOrder1 || 0) * ratio).toFixed(2)),
      sortOrder2: Number(((r.sortOrder2 || 0) * ratio).toFixed(2)),
      sortOrder3: Number(((r.sortOrder3 || 0) * ratio).toFixed(2)),
      sortOrder4: Number(((r.sortOrder4 || 0) * ratio).toFixed(2)),
      sortOrder5: r.sortOrder5 ?? 0,
      sortOrder6: r.sortOrder6 ?? 0,
    };
  });
}

function alliancesToTrainingShape(apiAlliances, todayYmd) {
  const a = deepRedate(apiAlliances, todayYmd);
  return {
    Alliances: (a.alliances || []).map((row) => ({
      number: row.number,
      captain: row.captain,
      round1: row.round1,
      round2: row.round2,
      round3: row.round3,
      backup: row.backup,
      backupReplaced: row.backupReplaced,
      name: row.name || `Alliance ${row.number}`,
    })),
    count: a.count ?? (a.alliances || []).length,
  };
}

/**
 * @param {string} todayYmd e.g. moment().format('YYYY-MM-DD')
 */
export function buildWeek0PracticeTraining(todayYmd) {
  const qualMatches = qualMatchesJson.matches || [];
  const playoffMatches = playoffMatchesJson.matches || [];
  const finalRankRows = rankingsJson.rankings?.rankings || [];

  const qualFinalSchedule = qualMatches.map((m) => toTrainingQualMatch(m, todayYmd, true));
  const qualPartialSchedule = qualMatches.map((m, i) =>
    toTrainingQualMatch(m, todayYmd, i < QUAL_PLAYED_PHASE1)
  );

  const playoffFullSchedule = playoffMatches.map((m) => toTrainingPlayoffMatch(m, todayYmd, true));
  const playoffPartialSchedule = playoffMatches.map((m) =>
    toTrainingPlayoffMatch(m, todayYmd, m.matchNumber <= PLAYOFF_COMPLETE_THROUGH)
  );

  const allPlayoffScores = deepRedate(playoffScoresJson.MatchScores || [], todayYmd);
  const playoffScoresPartial = {
    MatchScores: allPlayoffScores.filter((s) => s.matchNumber <= PLAYOFF_COMPLETE_THROUGH),
  };
  const playoffScoresFinal = { MatchScores: allPlayoffScores };

  const ranksFinal = { Rankings: deepRedate(finalRankRows, todayYmd) };
  const ranksPartial = {
    Rankings: buildMidQualRankings(deepRedate(finalRankRows, todayYmd), 2),
  };

  const allQualScoreRows = deepRedate(qualScoresJson.MatchScores || [], todayYmd);
  const qualScoresPartialTraining = {
    MatchScores: allQualScoreRows.filter((s) => s.matchNumber <= QUAL_PLAYED_PHASE1),
  };
  const qualScoresFinalTraining = { MatchScores: allQualScoreRows };

  const teams = deepRedate(teamsJson, todayYmd);
  const alliancesFinal = alliancesToTrainingShape(alliancesJson, todayYmd);

  const trainingSchedule = {
    qual: {
      final: { Schedule: qualFinalSchedule },
      partial: { Schedule: qualPartialSchedule },
    },
    playoff: {
      pending: { Schedule: [] },
      partial: { Schedule: playoffPartialSchedule },
      final: { Schedule: playoffFullSchedule },
    },
  };

  const trainingScores = {
    playoff: {
      initial: { MatchScores: [] },
      partial: playoffScoresPartial,
      final: playoffScoresFinal,
    },
    /** Embedded qual scores merged in getSchedule for PRACTICE events (API scores are not fetched). */
    qual: {
      partial: qualScoresPartialTraining,
      final: qualScoresFinalTraining,
    },
  };

  const trainingRanks = {
    final: ranksFinal,
    partial: ranksPartial,
  };

  const trainingTeams = {
    teams,
    communityUpdates: [],
  };

  const trainingAlliances = {
    initial: { Alliances: [] },
    partial: alliancesFinal,
    final: alliancesFinal,
  };

  return {
    trainingSchedule,
    trainingScores,
    trainingRanks,
    trainingTeams,
    trainingAlliances,
  };
}
