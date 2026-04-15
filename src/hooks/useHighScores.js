import { useState, useEffect } from "react";
import { usePersistentState } from "./UsePersistentState";
import { eventNames, FTCEventNames } from "../data/eventNames";
import _ from "lodash";
import moment from "moment";

const ftcBaseURL = "https://api.gatool.org/ftc/v2/";

export function useHighScores({
  httpClient,
  selectedEvent,
  selectedYear,
  ftcMode,
  qualSchedule,
  playoffSchedule,
  useFTCOffline,
  isOnline,
  manualOfflineMode,
}) {
  const eventnames = ftcMode
    ? _.cloneDeep(FTCEventNames)
    : _.cloneDeep(eventNames);

  const [worldStats, setWorldStats] = usePersistentState("cache:stats", null);
  const [eventHighScores, setEventHighScores] = usePersistentState(
    "cache:eventHighScores",
    null
  );
  const [ftcRegionHighScores, setFtcRegionHighScores] = useState(null);
  const [ftcLeagueHighScores, setFtcLeagueHighScores] = useState(null);
  const [frcDistrictHighScores, setFrcDistrictHighScores] = useState(null);


  /**
   * This function retrieves the world high scores for the selected year from FIRST.
   * @async
   * @function getWorldStats
   * @param selectedYear The currently selected year, which is a persistent state variable
   * @returns sets the world high scores
   */
  async function getWorldStats() {
    // Skip external API calls when in FTC offline mode without internet
    if (useFTCOffline && (!isOnline || manualOfflineMode)) {
      console.log("FTC Offline mode: Skipping World High Scores API call while offline" + (manualOfflineMode ? " (manual override)" : ""));
      setWorldStats(null);
      return;
    }

    var result = await httpClient.getNoAuth(
      `${selectedYear?.value}/highscores`,
      ftcMode ? ftcBaseURL : undefined
    );
    if (result.status === 404 || result.status === 500) {
      setWorldStats(null);
      return;
    }
    // @ts-ignore
    if (result.status === 200) {
      // @ts-ignore
      var highscores = await result.json();
      var scores = {};
      var reducedScores = {};

      scores.year = selectedYear?.value;
      scores.lastUpdate = moment().format();

      highscores.forEach((score) => {
        if (score?.matchData?.match) {
          var details = {};
          if (!_.isEmpty(eventnames[worldStats?.year])) {
            details.eventName =
              eventnames[worldStats?.year][score?.matchData?.event?.eventCode] ||
              score?.matchData?.event?.eventCode;
          } else {
            details.eventName = score?.matchData?.event?.eventCode;
          }

          //if (worldStats) {
          //  details.eventName = eventnames[worldStats?.year][score?.matchData?.event?.eventCode]
          //} else {
          //  details.eventName = score?.matchData?.event?.eventCode;
          //}
          details.alliance = _.upperFirst(score?.matchData?.highScoreAlliance);
          // FTC API returns yearType like "2025FTCpenaltyFreequal"; normalize to "2025penaltyFreequal" so StatsPage matchTypes match
          let scoreType = score?.yearType;
          if (scoreType && typeof scoreType === "string" && scoreType.includes("FTC")) {
            scoreType = scoreType.replace("FTC", "");
          }
          details.scoreType = scoreType;
          details.matchName = score?.matchData?.match?.description;
          details.allianceMembers = _.filter(
            score?.matchData?.match?.teams,
            function (o) {
              return _.startsWith(o.station, details.alliance);
            }
          )
            .map((team) => {
              return team.teamNumber;
            })
            .join(" ");
          details.score = score.matchData.match[`score${details.alliance}Final`];
          if (scoreType && typeof scoreType === "string" && scoreType.includes("allianceContribution")) {
            const m = score.matchData.match;
            const redF = m.scoreRedFinal ?? 0, blueF = m.scoreBlueFinal ?? 0, redFoul = m.scoreRedFoul ?? 0, blueFoul = m.scoreBlueFoul ?? 0;
            details.score = details.alliance === "Red"
              ? (ftcMode ? redF - blueFoul : redF - redFoul)
              : (ftcMode ? blueF - redFoul : blueF - blueFoul);
          }
          reducedScores[details.scoreType] = details;
        }
      });
      scores.highscores = reducedScores;

      setWorldStats(scores);
    }
  }

  /** Known score type suffixes used by StatsPage matchType lookups (shared by FTC region/league and FRC district normalization) */
  const SCORE_TYPE_SUFFIXES = /(penaltyFreequal|penaltyFreeplayoff|TBAPenaltyFreequal|TBAPenaltyFreeplayoff|offsettingqual|offsettingplayoff|overallqual|overallplayoff|allianceContributionqual|allianceContributionplayoff)$/;

  /**
   * Fetches FRC district high scores from the dedicated district endpoint.
   * @async
   * @function getFrcDistrictHighScores
   */
  async function getFrcDistrictHighScores() {
    const districtCode = selectedEvent?.value?.districtCode;
    if (ftcMode || !selectedYear?.value || !districtCode) {
      setFrcDistrictHighScores(null);
      return;
    }
    try {
      const result = await httpClient.getNoAuth(
        `${selectedYear.value}/highscores/district/${encodeURIComponent(districtCode)}`
      );
      if (result.status === 200 && result instanceof Response) {
        const data = await result.json();
        const list = Array.isArray(data) ? data : [];
        var scores = { year: selectedYear.value, lastUpdate: moment().format(), highscores: {} };
        var reducedScores = {};
        list.forEach((score) => {
          if (score?.matchData?.match) {
            var details = {};
            if (!_.isEmpty(eventnames[selectedYear?.value])) {
              details.eventName =
                eventnames[selectedYear?.value][score?.matchData?.event?.eventCode] ||
                score?.matchData?.event?.eventCode;
            } else {
              details.eventName = score?.matchData?.event?.eventCode;
            }
            details.alliance = _.upperFirst(score?.matchData?.highScoreAlliance);
            // Strip year and district prefix to get bare score type suffix (e.g. "TBAPenaltyFreeplayoff")
            let scoreType = score?.yearType;
            if (scoreType && typeof scoreType === "string") {
              scoreType = scoreType.replace("FRC:district:", "District");
              const match = scoreType.match(SCORE_TYPE_SUFFIXES);
              if (match) scoreType = match[1];
            }
            details.scoreType = scoreType;
            details.matchName = score?.matchData?.match?.description;
            details.allianceMembers = _.filter(
              score?.matchData?.match?.teams,
              (o) => _.startsWith(o.station, details.alliance)
            )
              .map((team) => team.teamNumber)
              .join(" ");
            details.score = score.matchData.match[`score${details.alliance}Final`];
            if (details.scoreType && details.scoreType.includes("allianceContribution")) {
              const m = score.matchData.match;
              const redF = m.scoreRedFinal ?? 0, blueF = m.scoreBlueFinal ?? 0, redFoul = m.scoreRedFoul ?? 0, blueFoul = m.scoreBlueFoul ?? 0;
              details.score = details.alliance === "Red"
                ? redF - redFoul
                : blueF - blueFoul;
            }
            if (details.scoreType) reducedScores[details.scoreType] = details;
          }
        });
        scores.highscores = reducedScores;
        setFrcDistrictHighScores(scores);
      } else {
        setFrcDistrictHighScores(null);
      }
    } catch (e) {
      setFrcDistrictHighScores(null);
    }
  }

  /**
   * Normalizes FTC high scores API response (array) to the same shape as worldStats.highscores.
   * @param {Array} highscores - Array of score objects with matchData and scoreType/yearType
   * @param {string} year - Year for event name lookup
   * @param {string} [regionCode] - When present (region high scores), yearType is like "2025FTCRegionUSTXpenaltyFreequal"; we extract the suffix to match StatsPage matchTypes
   * @returns {{ year: string, lastUpdate: string, highscores: Object }}
   */
  function normalizeFTCHighScores(highscores, year, regionCode) {
    if (!Array.isArray(highscores)) return null;
    var scores = { year, lastUpdate: moment().format(), highscores: {} };
    var reducedScores = {};
    highscores.forEach((score) => {
      if (score?.matchData?.match) {
        var details = {};
        details.eventName = !_.isEmpty(eventnames[year])
          ? (eventnames[year][score?.matchData?.event?.eventCode] || score?.matchData?.event?.eventCode)
          : score?.matchData?.event?.eventCode;
        details.alliance = _.upperFirst(score?.matchData?.highScoreAlliance);
        let scoreType = score?.yearType || score?.scoreType;
        // Region API returns e.g. "2025FTCRegionUSTXpenaltyFreequal" or "2025FTCRegionUSTXHOoffsettingqual" - extract suffix to match StatsPage matchTypes
        if (regionCode && scoreType && typeof scoreType === "string") {
          const match = scoreType.match(SCORE_TYPE_SUFFIXES);
          if (match) scoreType = match[1];
        } else if (scoreType && year && String(scoreType).indexOf(year) === 0) {
          // World: strip leading year prefix (and "FTC" if present, handled in getWorldStats)
          scoreType = scoreType.slice(String(year).length);
        }
        details.scoreType = scoreType;
        details.matchName = score?.matchData?.match?.description;
        details.allianceMembers = _.filter(
          score?.matchData?.match?.teams,
          (o) => _.startsWith(o.station, details.alliance)
        )
          .map((team) => team.teamNumber)
          .join(" ");
        details.score = score.matchData.match[`score${details.alliance}Final`];
        if (details.scoreType && details.scoreType.includes("allianceContribution")) {
          const m = score?.matchData?.match || {};
          const redF = m.scoreRedFinal ?? 0, blueF = m.scoreBlueFinal ?? 0, redFoul = m.scoreRedFoul ?? 0, blueFoul = m.scoreBlueFoul ?? 0;
          details.score = details.alliance === "Red"
            ? redF - blueFoul
            : blueF - redFoul;
        }
        if (details.scoreType) reducedScores[details.scoreType] = details;
      }
    });
    scores.highscores = reducedScores;
    return scores;
  }

  /**
   * Fetches FTC Region High Scores from gatool API for the selected event's region.
   */
  async function getFTCRegionHighScores() {
    if (!ftcMode || !selectedYear?.value || !selectedEvent?.value?.regionCode) {
      setFtcRegionHighScores(null);
      return;
    }
    const regionCode = selectedEvent.value.regionCode;
    if (useFTCOffline && (!isOnline || manualOfflineMode)) {
      setFtcRegionHighScores(null);
      return;
    }
    try {
      const regionCodeEncoded = encodeURIComponent(regionCode);
      const result = await httpClient.getNoAuth(
        `${selectedYear.value}/highscores/region/${regionCodeEncoded}`,
        ftcBaseURL
      );
      if (result.status === 200) {
        // @ts-ignore - result may be Response or timeout object
        const data = await result.json();
        const list = Array.isArray(data) ? data : (data?.highscores || data?.HighScores || []);
        const scores = normalizeFTCHighScores(list, selectedYear.value, regionCode);
        setFtcRegionHighScores(scores);
      } else {
        setFtcRegionHighScores(null);
      }
    } catch (e) {
      setFtcRegionHighScores(null);
    }
  }

  /**
   * Fetches FTC League High Scores from gatool API for the selected event's league.
   * Endpoint: {{apiBase}}/{{season}}/highscores/league/{{regionCode}}/{{leagueCode}}
   */
  async function getFTCLeagueHighScores() {
    if (!ftcMode || !selectedYear?.value || !selectedEvent?.value?.regionCode || !selectedEvent?.value?.leagueCode) {
      setFtcLeagueHighScores(null);
      return;
    }
    const regionCode = selectedEvent.value.regionCode;
    const leagueCode = selectedEvent.value.leagueCode;
    if (useFTCOffline && (!isOnline || manualOfflineMode)) {
      setFtcLeagueHighScores(null);
      return;
    }
    try {
      const regionCodeEncoded = encodeURIComponent(regionCode);
      const leagueCodeEncoded = encodeURIComponent(leagueCode);
      const result = await httpClient.getNoAuth(
        `${selectedYear.value}/highscores/league/${regionCodeEncoded}/${leagueCodeEncoded}`,
        ftcBaseURL
      );
      if (result.status === 200) {
        // @ts-ignore - result may be Response or timeout object
        const data = await result.json();
        const list = Array.isArray(data) ? data : (data?.highscores || data?.HighScores || []);
        const scores = normalizeFTCHighScores(list, selectedYear.value, leagueCode);
        setFtcLeagueHighScores(scores);
      } else {
        setFtcLeagueHighScores(null);
      }
    } catch (e) {
      setFtcLeagueHighScores(null);
    }
  }

  /**
   * This function calculates event high scores from local match data.
   * Tracks 5 categories: overall, penaltyFree, TBAPenaltyFree, offsetting, and allianceContribution
   * For both qualification and playoff matches.
   * @function calculateEventHighScores
   * @param qualSchedule The qualification schedule
   * @param playoffSchedule The playoff schedule
   * @param year The current year
   * @param eventCode The current event code
   * @param districtCode The current district code
   * @returns Array of high score records
   */
  function calculateEventHighScores(qualSchedule, playoffSchedule, year, eventCode, districtCode) {
    const highScores = {
      qual: {
        overall: null,
        penaltyFree: null,
        TBAPenaltyFree: null,
        offsetting: null,
        allianceContribution: null
      },
      playoff: {
        overall: null,
        penaltyFree: null,
        TBAPenaltyFree: null,
        offsetting: null,
        allianceContribution: null
      }
    };

    // Helper function to determine if a match qualifies for a category and get the high score
    function processMatch(match, level, tournamentType) {
      if (!match || match.scoreRedFinal === undefined || match.scoreBlueFinal === undefined) {
        return;
      }

      const redScore = match.scoreRedFinal || 0;
      const blueScore = match.scoreBlueFinal || 0;
      // FTC uses fouls to represent points commmitted, not earned, by each Alliance.
      const redFoul = ftcMode ? match.scoreBlueFoul : match.scoreRedFoul || 0;
      const blueFoul = ftcMode ? match.scoreRedFoul : match.scoreBlueFoul || 0;

      // Determine which alliance has the high score
      const highScoreAlliance = redScore >= blueScore ? "red" : "blue";
      const highScore = Math.max(redScore, blueScore);
      const winningAlliance = redScore > blueScore ? "red" : (blueScore > redScore ? "blue" : "tie");

      // Create match data object
      const matchData = {
        event: {
          districtCode: districtCode || "",
          eventCode: eventCode || "",
          type: tournamentType
        },
        highScoreAlliance: highScoreAlliance,
        match: {
          field: match.field || "Primary",
          startTime: match.startTime,
          autoStartTime: match.autoStartTime,
          matchVideoLink: match.matchVideoLink,
          matchNumber: match.matchNumber,
          isReplay: match.isReplay || false,
          actualStartTime: match.actualStartTime,
          tournamentLevel: match.tournamentLevel,
          postResultTime: match.postResultTime,
          description: match.description,
          scoreRedFinal: redScore,
          scoreRedFoul: redFoul,
          scoreRedAuto: match.scoreRedAuto,
          scoreBlueFinal: blueScore,
          scoreBlueFoul: blueFoul,
          scoreBlueAuto: match.scoreBlueAuto,
          teams: match.teams || [],
          eventCode: eventCode || "",
          districtCode: districtCode || "",
          matchScores: match.matchScores || null
        }
      };

      // Category 1: Overall - highest score regardless of penalties
      if (!highScores[level].overall || highScore > highScores[level].overall.score) {
        highScores[level].overall = { matchData, score: highScore };
      }

      // Category 2: Penalty Free - no penalties for either alliance
      if (redFoul === 0 && blueFoul === 0) {
        if (!highScores[level].penaltyFree || highScore > highScores[level].penaltyFree.score) {
          highScores[level].penaltyFree = { matchData, score: highScore };
        }
      }

      // Category 3: TBA Penalty Free - winning alliance has no penalty points
      if (winningAlliance !== "tie") {
        const winnerFoul = winningAlliance === "red" ? redFoul : blueFoul;
        if (winnerFoul === 0) {
          if (!highScores[level].TBAPenaltyFree || highScore > highScores[level].TBAPenaltyFree.score) {
            highScores[level].TBAPenaltyFree = { matchData, score: highScore };
          }
        }
      }

      // Category 4: Offsetting - both alliances have equal penalty points
      if (redFoul === blueFoul && redFoul > 0) {
        if (!highScores[level].offsetting || highScore > highScores[level].offsetting.score) {
          highScores[level].offsetting = { matchData, score: highScore };
        }
      }

      // Category 5: Alliance contribution - highest score after deducting penalties.
      // FRC: penalties RECEIVED (same side): contribution = final - sameSideFoul.
      // FTC: penalties CREDITED TO OTHER (other side): contribution = final - otherSideFoul.
      const redFoulRaw = match.scoreRedFoul || 0;
      const blueFoulRaw = match.scoreBlueFoul || 0;
      const redContribution = ftcMode ? redScore - blueFoulRaw : redScore - redFoulRaw;
      const blueContribution = ftcMode ? blueScore - redFoulRaw : blueScore - blueFoulRaw;
      const contributionAlliance = redContribution >= blueContribution ? "red" : "blue";
      const contributionScore = Math.max(redContribution, blueContribution);
      const contributionMatchData = {
        ...matchData,
        highScoreAlliance: contributionAlliance,
        match: {
          ...matchData.match,
          scoreRedFoul: redFoulRaw,
          scoreBlueFoul: blueFoulRaw
        }
      };
      if (!highScores[level].allianceContribution || contributionScore > highScores[level].allianceContribution.score) {
        highScores[level].allianceContribution = { matchData: contributionMatchData, score: contributionScore };
      }
    }

    // Process qualification matches
    if (qualSchedule?.schedule && Array.isArray(qualSchedule.schedule)) {
      qualSchedule.schedule.forEach(match => {
        processMatch(match, 'qual', 'qual');
      });
    }

    // Process playoff matches
    if (playoffSchedule?.schedule && Array.isArray(playoffSchedule.schedule)) {
      playoffSchedule.schedule.forEach(match => {
        processMatch(match, 'playoff', 'playoff');
      });
    }

    // Convert to the desired output format
    const result = [];
    ['qual', 'playoff'].forEach(level => {
      ['overall', 'penaltyFree', 'TBAPenaltyFree', 'offsetting', 'allianceContribution'].forEach(type => {
        if (highScores[level][type]) {
          result.push({
            level: level,
            matchData: highScores[level][type].matchData,
            type: type,
            year: parseInt(year),
            yearType: `${year}${type}${level}`
          });
        }
      });
    });

    return result;
  }

  /**
   * This function calculates the event high scores for the selected event using local match data.
   * @async
   * @function getEventStats
   * @param year The currently selected year
   * @param code The currently selected event code
   * @returns sets the event high scores
   */
  async function getEventStats(year, code) {
    // Use locally calculated high scores instead of API call
    if (!qualSchedule && !playoffSchedule) {
      setEventHighScores(null);
      return;
    }

    const highscores = calculateEventHighScores(
      qualSchedule,
      playoffSchedule,
      year,
      code,
      selectedEvent?.value?.districtCode
    );

    if (highscores && highscores.length > 0) {
      var scores = {};
      var reducedScores = {};

      scores.year = year;
      scores.lastUpdate = moment().format();

      highscores.forEach((score) => {
        if (score?.matchData?.match) {
          var details = {};
          if (eventnames[year] && !_.isEmpty(eventnames[year])) {
            details.eventName = eventnames[year][code] || code;
          } else {
            details.eventName = code;
          }

          details.alliance = _.upperFirst(score?.matchData?.highScoreAlliance);
          details.scoreType = score?.type + score?.level;
          details.matchName = score?.matchData?.match?.description;
          details.allianceMembers = _.filter(
            score?.matchData?.match?.teams,
            function (o) {
              return _.startsWith(o.station, details.alliance);
            }
          )
            .map((team) => {
              return team.teamNumber;
            })
            .join(" ");
          if (score?.type === "allianceContribution") {
            const m = score.matchData.match;
            const redF = m.scoreRedFinal ?? 0, blueF = m.scoreBlueFinal ?? 0, redFoul = m.scoreRedFoul ?? 0, blueFoul = m.scoreBlueFoul ?? 0;
            details.score = details.alliance === "Red"
              ? (ftcMode ? redF - blueFoul : redF - redFoul)
              : (ftcMode ? blueF - redFoul : blueF - blueFoul);
          } else {
            details.score = score.matchData.match[`score${details.alliance}Final`];
          }
          reducedScores[details.scoreType] = details;
        }
      });
      scores.highscores = reducedScores;

      setEventHighScores(scores);
    } else {
      setEventHighScores(null);
      return;
    }
  }

  // Reset event high scores and FTC region/league high scores when FTC mode changes to prevent showing stale data
  useEffect(() => {
    setEventHighScores(null);
    setFtcRegionHighScores(null);
    setFtcLeagueHighScores(null);
    setFrcDistrictHighScores(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ftcMode]);

  // Recalculate event high scores whenever schedules update (when event loads or matches are played)
  useEffect(() => {
    if (selectedEvent?.value?.code && selectedYear?.value && (qualSchedule || playoffSchedule)) {
      console.log('Schedules updated, recalculating event high scores...');
      getEventStats(selectedYear?.value, selectedEvent?.value?.code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qualSchedule?.lastUpdate, playoffSchedule?.lastUpdate, selectedEvent?.value?.code, selectedYear?.value]);

  return {
    worldStats,
    eventHighScores,
    ftcRegionHighScores,
    ftcLeagueHighScores,
    frcDistrictHighScores,
    setEventHighScores,
    setFtcRegionHighScores,
    setFtcLeagueHighScores,
    setFrcDistrictHighScores,
    getWorldStats,
    getEventStats,
    getFTCRegionHighScores,
    getFTCLeagueHighScores,
    getFrcDistrictHighScores,
  };
}
