import _ from "lodash";
import moment from "moment";
import { fetchLocal } from "../utils/fetchLocal";
import {
  conformCheesyArenaMatch,
  conformCheesyArenaScores,
  conformCFTCOfflineScheduleMatch,
  conformFTCOfflineScores,
  winner,
} from "../utils/scheduleConformance";
import {
  normalizeFtcHybridMatch,
  hydrateFtcPlayoffTeamsFromResults,
  normalizePlayoffScheduleApiResponse,
} from "../utils/ftcHybridMatchTeams";
import { extendFTCPlayoffScheduleWithPartialMatches } from "../utils/ftcPlayoffSchedule";
import { extendFRCPlayoffScheduleWithPartialMatches } from "../utils/frcPlayoffSchedule";
import { prunePlayoffReserveSetsAfterPostedMatches } from "../utils/playoffReserveEdits";
import { useEventSelection } from "../contexts/EventSelectionContext";
import { useSettings } from "../contexts/SettingsContext";

const ftcBaseURL = "https://api.gatool.org/ftc/v2/";

/**
 * Hook that owns the getSchedule function — the core schedule-fetching orchestrator.
 *
 * Fetches practice, qualification, and playoff schedules from various data sources
 * (FIRST API, Cheesy Arena, FTC Offline Server, TBA offseason API), merges scores,
 * determines winners, auto-advances currentMatch, prunes playoff reserve edits,
 * and triggers downstream data fetches.
 *
 * Fourth store slice, wired via EventStoreProvider.
 *
 * @param {object} deps - Dependencies from App.jsx
 * @returns {{ getSchedule: function }}
 */
/**
 * @param {object} deps — state + setters + read-only env values from App.jsx
 * @param {object} [opts] — optional epoch guard from provider
 * @param {object} [opts.epochGuard] — stale-response guard for getSchedule
 */
export function useScheduleLoader(deps, opts = {}) {
  const { epochGuard } = opts;
  const {
    // State reads
    currentMatch,
    qualSchedule,
    playoffSchedule,
    practiceSchedule,
    practiceFileUploaded,
    teamList,
    cheesyTeamList,
    cheesyArenaAvailable,
    FTCOfflineAvailable,
    FTCServerURL,
    FTCKey,
    useCheesyArena,
    useFTCOffline,
    teamRemappings,
    training,
    // State setters
    setQualSchedule,
    setPlayoffSchedule,
    setPracticeSchedule,
    setQualsLength,
    setCurrentMatch,
    setPlayoffReserveEdits,
    setCheesyTeamList,
    setPracticeFileUploaded,
    // Refs
    playoffReserveEditsRef,
    // External functions
    httpClient,
    getEventStats,
    // Store functions (concrete, not storeRef)
    getTeamList,
    getAlliances,
    getRanks,
    // Event-scoped abort signal
    getEventSignal,
  } = deps;

  // Event selection + overrides + refresh prefs come from context now (Phase 8).
  const { selectedEvent, selectedYear, ftcMode } = useEventSelection();
  const { playoffCountOverride, autoAdvance, autoUpdate } = useSettings();

  // Reads the CURRENT event abort signal at call time. Using a getter avoids
  // capturing a stale signal in closures — the ref is rotated on each event
  // switch in App.jsx, so we must re-read it for every fetch.
  const signal = () => getEventSignal?.();

  /**
   * Remaps a string team identifier to its numeric team number (e.g., "TeamA" -> 9990)
   */
  const remapStringToNumber = (teamString) => {
    if (!teamRemappings) return Number(teamString);
    return Number(teamRemappings.strings[teamString]) || Number(teamString) || null;
  };

  /**
   * Helper function to fetch TBA matches for an event
   * @param {string} tbaEventKey TBA event key
   * @param {string} year Year
   * @returns Array of TBA matches
   */
  const fetchTBAMatches = async (tbaEventKey, year) => {
    try {
      console.log(`Fetching TBA matches for event: ${tbaEventKey}`);
      const result = await httpClient.getNoAuth(
        `${year}/offseason/schedule/hybrid/${tbaEventKey}/`,
        undefined,
        undefined,
        undefined,
        signal()
      );
      if (result.status === 200) {
        // @ts-ignore
        const matches = await result.json();
        return matches;
      }
      return [];
    } catch (error) {
      console.error("Error fetching TBA matches:", error);
      return [];
    }
  };

  /**
   * This function retrieves a schedule from FIRST. It attempts to get both the Qual and Playoff Schedule and sets the global variables
   *
   * It uses the Hybrid Schedule endpoint to fetch the Qual schedule, then process the match data.
   *
   * It then uses the Hybrid Schedule endpoint to fetch the Playoff Schedule. As it processes match results,
   *
   * it will keep track of the event high scores by event stage and penalty conditions.
   *
   * @async
   * @function getSchedule
   * @param loadingEvent Boolean to set the current match to the last match played when loading an event
   * @param {object} [options] Options for the schedule fetch.
   * @param {boolean} [options.updateCurrentMatch=true] If false, schedule/rankings are refreshed but current match is not updated (for background refresh).
   * @param selectedEvent The currently selected event, which is a persistent state variable
   * @param selectedYear The currently selected year, which is a persistent state variable
   *
   * @return Sets the event high scores, qual schedule and playoff
   */
  // @ts-ignore
  async function getSchedule(loadingEvent, options = {}) {
    if (!selectedYear?.value || !selectedEvent?.value?.code) return;
    console.log(`Fetching schedule for ${selectedEvent?.value?.name}...`);

    // Epoch guard: capture a token so we can detect if a newer fetch superseded us
    const epoch = epochGuard?.next();
    const isStale = () => epochGuard && !epochGuard.isCurrent(epoch);

    var practiceschedule = null;
    var qualschedule = null;
    var qualScores = null;
    var playoffschedule = null;
    var playoffScores = null;
    var qualslength = 0;

    console.log(
      `Fetching Practice Schedule for ${selectedEvent?.value?.name}...`
    );
    practiceschedule = { schedule: [] };
    if (
      selectedEvent?.value?.code.includes("OFFLINE") ||
      selectedEvent?.value?.code.includes("PRACTICE")
    ) {
      //create null schedule because there are no practice schedules for these events or they are using Cheesy Arena
      practiceschedule = { schedule: { schedule: [] } };
    } else if (
      selectedEvent?.value?.type === "OffSeason" &&
      selectedEvent?.value?.tbaEventKey
    ) {
      // Skip practice schedule for TBA offseason events - TBA doesn't provide practice matches
      console.log("Skipping practice schedule for TBA offseason event");
      practiceschedule = { schedule: { schedule: [] } };
    } else if (!selectedEvent?.value?.code.includes("PRACTICE") && !ftcMode) {
      if (useCheesyArena && cheesyArenaAvailable) {
        // get schedule from Cheesy Arena
        var result = await fetchLocal("http://10.0.100.5:8080/api/matches/practice");
        var data = await result.json();
        if (data.length > 0) {
          // reformat data to match FIRST API format
          practiceschedule = {
            schedule: {
              schedule: data.map((match, index) => {
                return conformCheesyArenaMatch(match, "Practice", index + 1);
              }),
            },
          };
          var teams = [];
          data.forEach((match) => {
            teams.push(match.Red1);
            teams.push(match.Red2);
            teams.push(match.Red3);
            teams.push(match.Blue1);
            teams.push(match.Blue2);
            teams.push(match.Blue3);
          });
          if (cheesyTeamList.length === 0) {
            const reducedTeamList = _.uniq(teams);
            setCheesyTeamList(reducedTeamList);
            getTeamList(reducedTeamList);
          }
        }
      } else if (!useFTCOffline) {
        // get the practice schedule from FIRST API
        const practiceResult = await httpClient.getNoAuth(
          `${selectedYear?.value}/schedule/hybrid/${selectedEvent?.value.code}/practice`,
          ftcMode ? ftcBaseURL : undefined,
          undefined,
          undefined,
          signal()
        );
        if (practiceResult.status === 200) {
          // @ts-ignore
          practiceschedule = await practiceResult.json();
        }
      }
    }
    if (typeof practiceschedule?.Schedule !== "undefined") {
      practiceschedule.schedule = practiceschedule?.Schedule;
      delete practiceschedule.Schedule;
    }
    if (typeof practiceschedule?.schedule?.Schedule !== "undefined") {
      practiceschedule.schedule.schedule = practiceschedule?.schedule?.Schedule;
      delete practiceschedule.schedule.Schedule;
    }

    if (
      practiceschedule?.schedule?.length > 0 ||
      practiceschedule?.schedule?.schedule?.length > 0
    ) {
      if (typeof practiceSchedule?.schedule?.schedule !== "undefined") {
        practiceSchedule.schedule = practiceSchedule?.schedule?.schedule;
      }

      if (isStale()) {
        console.log("getSchedule: stale response discarded (practice)");
        return;
      }
      if (practiceFileUploaded) {
        setPracticeFileUploaded(false);
      }
      practiceschedule.lastUpdate = moment().format();
      setPracticeSchedule(practiceschedule);
    }

    console.log(`Fetching Qual Schedule for ${selectedEvent?.value?.name}...`);
    qualschedule = { schedule: [] };
    if (selectedEvent?.value?.code.includes("OFFLINE")) {
      //set Qual Schedule to empty array
      qualschedule = { schedule: { schedule: [] } };
    } else if (!selectedEvent?.value?.code.includes("PRACTICE")) {
      if (useCheesyArena && cheesyArenaAvailable) {
        // get schedule from Cheesy Arena
        console.log("Using Cheesy Arena for Qual Schedule");
        result = await fetchLocal(
          "http://10.0.100.5:8080/api/matches/qualification"
        );
        data = await result.json();
        if (data.length > 0) {
          // reformat data to match FIRST API format
          qualschedule = {
            schedule: {
              schedule: data.map((match, index) => {
                return conformCheesyArenaMatch(
                  match,
                  "Qualification",
                  index + 1
                );
              }),
            },
          };

          // now get the scores from the same result.
          qualScores = {
            MatchScores: data.map((match) => {
              return conformCheesyArenaScores(match, "Qualification");
            }),
          };
        }
      } else if (
        useFTCOffline &&
        FTCOfflineAvailable &&
        ftcMode?.value === "FTCLocal"
      ) {
        // get the qual schedule from the FTC Local Server
        console.log("Using FTC Local Server for Qual Schedule");
        const qualsResult = await httpClient.getNoAuth(
          `/api/v1/events/${selectedEvent?.value.code}/matches/`,
          FTCServerURL,
          undefined,
          { Authorization: FTCKey?.key || "" },
          signal()
        );
        if (qualsResult.status === 200) {
          // @ts-ignore
          const qualsData = await qualsResult.json();
          if (qualsData?.matches.length > 0) {
            // reformat data to match FIRST API format
            qualschedule = {
              schedule: qualsData.matches.map((match) => {
                return conformCFTCOfflineScheduleMatch(match, "Qualification");
              }),
            };
          }
        }
        // now get the scores from the same server.
        // http://10.0.100.5/api/2026/v1/events/gatooltest/matches/1/
        const qualScoresFTC = qualschedule?.schedule.map(async (match) => {
          const offlineYear = String(Number(selectedYear.value) + 1);
          const qualScoresResult = await httpClient.getNoAuth(
            `/api/${offlineYear}/v1/events/${selectedEvent?.value.code}/matches/${match.matchNumber}/`,
            FTCServerURL,
            undefined,
            { Authorization: FTCKey?.key || "" },
            signal()
          );
          if (qualScoresResult.status === 200) {
            // @ts-ignore
            const qualScoresData = await qualScoresResult.json();
            return conformFTCOfflineScores(qualScoresData, "Qualification");
          }
        });
        // resolve promises
        await Promise.all(qualScoresFTC).then((scores) => {
          qualScores = { MatchScores: scores };
        });
        // put the results back into the matches
        qualschedule.schedule = qualschedule.schedule.map((match) => {
          const matchScores = qualScores.MatchScores.filter((scoreMatch) => {
            return scoreMatch.matchNumber === match?.matchNumber;
          })[0];
          if (matchScores) {
            match = {
              ...match,
              scoreRedFinal: matchScores?.redScore,
              scoreBlueFinal: matchScores?.blueScore,
              scoreRedAuto: matchScores?.redAuto,
              scoreRedFoul: matchScores?.redPenalty,
              scoreBlueAuto: matchScores?.blueAuto,
              scoreBlueFoul: matchScores?.bluePenalty,
              actualStartTime: matchScores.actualStartTime,
              postResultTime: matchScores.postResultTime,
            };
            // add in DQ
            if (matchScores?.alliances) {
              matchScores?.alliances.forEach((alliance) => {
                var team1 = _.findIndex(match.teams, {
                  teamNumber: alliance.robot1,
                });
                var team2 = _.findIndex(match.teams, {
                  teamNumber: alliance.robot2,
                });
                match.teams[team1].dq = alliance?.dq1 || false;
                match.teams[team2].dq = alliance?.dq2 || false;
              });
            }
          }
          return match;
        });
      } else if (
        !useFTCOffline &&
        selectedEvent?.value?.type === "OffSeason" &&
        !ftcMode
      ) {
        // get the qual schedule from TBA via gatool Offseason API
        console.log("Using TBA for Offseason Event Qual Schedule");
        // Use event's tbaEventKey directly
        const eventKey = selectedEvent?.value?.tbaEventKey;

        if (!eventKey) {
          console.log("No TBA event key available for this offseason event");
        }

        if (eventKey) {
          const tbaMatches = await fetchTBAMatches(
            eventKey,
            selectedYear?.value
          );

          if (tbaMatches && tbaMatches?.Schedule?.schedule?.length > 0) {
            // Filter for qualification matches only
            const qualMatches = tbaMatches.Schedule.schedule
              .filter((match) => match.tournamentLevel === "Qual")
              .sort((a, b) => a.matchNumber - b.matchNumber);

            if (qualMatches.length > 0) {
              // Remap string team identifiers to numeric team numbers
              const remappedMatches = qualMatches.map((match) => {
                if (match.teams) {
                  const remappedTeams = match.teams.map((team) => {
                    if (typeof team.teamNumber === 'string') {
                      const numericTeam = remapStringToNumber(team.teamNumber);
                      if (numericTeam) {
                        return { ...team, teamNumber: numericTeam };
                      } else {
                        console.log(`No mapping found for ${team.teamNumber}, teamRemappings:`, teamRemappings);
                      }
                    }
                    return team;
                  });
                  return { ...match, teams: remappedTeams };
                }
                return match;
              });

              qualschedule = {
                schedule: {
                  schedule: remappedMatches,
                },
              };
            }
          }
        }
      } else if (!useFTCOffline) {
        const qualsResult = await httpClient.getNoAuth(
          `${selectedYear?.value}/schedule/hybrid/${selectedEvent?.value.code}/qual`,
          ftcMode ? ftcBaseURL : undefined,
          undefined,
          undefined,
          signal()
        );
        if (qualsResult.status === 200) {
          // @ts-ignore
          qualschedule = await qualsResult.json();
        }
      }
    } else {
      if (selectedEvent?.value?.code === "PRACTICE1") {
        qualschedule = { schedule: training.schedule.qual.partial };
      } else {
        qualschedule = { schedule: training.schedule.qual.final };
      }
    }
    // adds the winner to the schedule.
    if (typeof qualschedule.Schedule !== "undefined") {
      qualschedule.schedule = qualschedule?.Schedule;
      delete qualschedule.Schedule;
    }
    if (typeof qualschedule.schedule?.Schedule !== "undefined") {
      qualschedule.schedule.schedule = qualschedule?.schedule?.Schedule;
      delete qualschedule.schedule.Schedule;
    }

    // normalize to nutty FRC API results
    if (Array.isArray(qualschedule.schedule)) {
      qualschedule.schedule = { schedule: qualschedule.schedule };
    }

    // fetch the scores
    if (
      !selectedEvent?.value?.code.includes("PRACTICE") &&
      !useFTCOffline &&
      qualschedule?.schedule?.schedule?.length > 0 &&
      !(selectedEvent?.value?.type === "OffSeason")
    ) {
      const qualsScoresResult = await httpClient.getNoAuth(
        `${selectedYear?.value}/scores/${selectedEvent?.value.code}/qual`,
        ftcMode ? ftcBaseURL : undefined,
        undefined,
        undefined,
        signal()
      );
      if (qualsScoresResult.status === 200) {
        // @ts-ignore
        qualScores = await qualsScoresResult.json();
        if (qualScores.matchScores) {
          qualScores = { MatchScores: qualScores.matchScores };
        }
      } else {
        qualScores = { MatchScores: [] };
      }
    }

    if (
      !ftcMode &&
      selectedEvent?.value?.code?.includes("PRACTICE") &&
      training?.scores?.qual
    ) {
      if (
        selectedEvent?.value?.code === "PRACTICE1" &&
        training.scores.qual.partial?.MatchScores?.length
      ) {
        qualScores = _.cloneDeep(training.scores.qual.partial);
      } else if (training.scores.qual.final?.MatchScores?.length) {
        qualScores = _.cloneDeep(training.scores.qual.final);
      }
    }

    const qualMatches = qualschedule?.schedule?.schedule.map((match) => {
      if (ftcMode) {
        match = normalizeFtcHybridMatch(match);
      }
      match.winner = winner(match, ftcMode);
      if (
        qualScores?.MatchScores &&
        !(selectedEvent?.value?.type === "OffSeason")
      ) {
        const matchResults = qualScores.MatchScores.filter((scoreMatch) => {
          return scoreMatch.matchNumber === match.matchNumber;
        })[0];
        if (matchResults) {
          match.scores = matchResults;
          match.scoreRedFinal = matchResults.alliances?.[1]?.totalPoints;
          match.scoreBlueFinal = matchResults.alliances?.[0]?.totalPoints;
          // @ts-ignore - FRC may use "BonusAchieved" or "Achieved" in key names for ranking points
          match.redRP = _.pickBy(matchResults.alliances[1], (value, key) => {
            return (
              key === "rp" ||
              key.endsWith("BonusAchieved") ||
              key.endsWith("Achieved") ||
              key.endsWith("RP")
            );
          });
          // @ts-ignore
          match.blueRP = _.pickBy(matchResults.alliances[0], (value, key) => {
            return (
              key === "rp" ||
              key.endsWith("BonusAchieved") ||
              key.endsWith("Achieved") ||
              key.endsWith("RP")
            );
          });
        }
      } else if (selectedEvent?.value?.type === "OffSeason") {
        match.scores = match?.matchScores || [];
        if (match?.matchScores) {
          delete match.matchScores;
        }
        if (match.scores?.alliances?.[1]) {
          match.redRP = _.pickBy(match.scores.alliances[1], (value, key) => {
            return (
              key === "rp" ||
              key.endsWith("BonusAchieved") ||
              key.endsWith("Achieved") ||
              key.endsWith("RP")
            );
          });
        }
        // @ts-ignore
        if (match.scores?.alliances?.[0]) {
          match.blueRP = _.pickBy(match.scores.alliances[0], (value, key) => {
            return (
              key === "rp" ||
              key.endsWith("BonusAchieved") ||
              key.endsWith("Achieved") ||
              key.endsWith("RP")
            );
          });
        }
      }
      return match;
    });
    if (qualMatches?.length > 0) {
      qualschedule.scheduleLastModified = qualschedule.schedule?.headers
        ? moment(qualschedule.schedule?.headers.schedule["last-modified"])
        : moment();
      qualschedule.matchesLastModified = qualschedule.schedule?.headers
        ? moment(qualschedule.schedule?.headers.matches["last-modified"])
        : moment();
      qualschedule.schedule = qualMatches;
    }

    var completedMatchCount = 0;

    if (qualschedule?.schedule?.length > 0) {
      completedMatchCount =
        qualschedule?.schedule?.length -
        _.filter(qualschedule.schedule, { actualStartTime: null }).length;
      // clear the Practice schedule if there is one loaded and there are matches in the schedule
      if (moment().isAfter(qualschedule?.schedule[0].startTime)) {
        console.log("It's after matches start. Resetting Practice Schedule");
        setPracticeSchedule(null);
      }
    }

    qualschedule.completedMatchCount = completedMatchCount;

    qualschedule.lastUpdate = moment().format();

    // Epoch guard: discard if a newer fetch has started
    if (isStale()) {
      console.log("getSchedule: stale response discarded (quals)");
      return;
    }

    // For OFFLINE events, only update qualSchedule if there's no uploaded schedule already
    const isOfflineEvent = selectedEvent?.value?.code === "OFFLINE";
    if (!isOfflineEvent || !qualSchedule || qualSchedule?.schedule?.length === 0) {
      await setQualSchedule(qualschedule);
    } else {
      console.log("OFFLINE event - preserving uploaded qual schedule");
    }

    if (
      practiceschedule?.schedule?.length > 0 &&
      qualschedule?.schedule?.length === 0
    ) {
      qualslength = practiceschedule?.schedule?.length;
    } else if (qualschedule?.schedule?.length > 0) {
      qualslength = qualschedule?.schedule?.length;
    } else if (isOfflineEvent && qualSchedule?.schedule?.length > 0) {
      // Use the existing uploaded schedule length for OFFLINE events
      qualslength = qualSchedule?.schedule?.length;
    }
    console.log(`There are ${qualslength} qualification matches loaded.`);
    setQualsLength(qualslength);

    console.log(
      `Fetching Playoff Schedule for ${selectedEvent?.value?.name}...`
    );
    playoffschedule = {
      schedule: [],
    };
    //get the playoff schedule
    completedMatchCount = 0;
    if (selectedEvent?.value?.code.includes("OFFLINE")) {
      //set playoffschedule to be empty
      playoffschedule = { schedule: { schedule: [] } };
    } else if (!selectedEvent?.value?.code.includes("PRACTICE")) {
      if (useCheesyArena && cheesyArenaAvailable) {
        // get scores and schedule from Cheesy Arena
        console.log("Using Cheesy Arena for Playoff Schedule");
        result = await fetchLocal("http://10.0.100.5:8080/api/matches/playoff");
        if (result.status === 200) {
          data = await result.json();
          if (data.length > 0) {
            // reformat data to match FIRST API format
            playoffschedule = {
              schedule: {
                schedule: data.map((match, index) => {
                  return conformCheesyArenaMatch(match, "Playoff", index + 1);
                }),
              },
            };

            // now get the scores from the same result.
            playoffScores = {
              MatchScores: data.map((match) => {
                return conformCheesyArenaScores(match, "Playoff");
              }),
            };
          }
        }
      } else if (
        useFTCOffline &&
        FTCOfflineAvailable &&
        ftcMode?.value === "FTCLocal"
      ) {
        // get the playoff schedule from the FTC Local Server
        console.log("Using FTC Local Server for Playoff Schedule");
        const playoffResult = await httpClient.getNoAuth(
          `/api/v2/events/${selectedEvent?.value.code}/elims/`,
          FTCServerURL,
          undefined,
          { Authorization: FTCKey?.key || "" },
          signal()
        );
        if (playoffResult.status === 200) {
          // @ts-ignore
          const playoffsData = await playoffResult.json();
          if (playoffsData?.matches.length > 0) {
            // reformat data to match FIRST API format
            playoffschedule = {
              schedule: playoffsData.matches.map((match) => {
                return conformCFTCOfflineScheduleMatch(match, "Playoffs");
              }),
            };
          }
        }
        // } else if (playoffResult.status === 503) {
        //   return null;
        // }
        // now get the scores from the same server if there is a schedule.
        // /api/2026/v2/events/{code}/elims/{name}/
        if (playoffschedule?.schedule.length > 0) {
          const playoffsScoresFTC = playoffschedule?.schedule.map(
            async (match) => {
              const offlineYear = String(Number(selectedYear.value) + 1);
              const playoffsScoresResult = await httpClient.getNoAuth(
                `/api/${offlineYear}/v1/events/${selectedEvent?.value.code}/matches/${match?.matchName}/`,
                FTCServerURL,
                undefined,
                { Authorization: FTCKey?.key || "" },
                signal()
              );
              if (playoffsScoresResult.status === 200) {
                // @ts-ignore
                const playoffsScoresData = await playoffsScoresResult.json();
                return conformFTCOfflineScores(
                  playoffsScoresData,
                  "Qualification"
                );
              } else if (playoffsScoresResult.status === 204) {
                return null;
              }
            }
          );
          // resolve promises
          await Promise.all(playoffsScoresFTC).then((scores) => {
            playoffScores = { MatchScores: scores };
          });
        } else {
          playoffScores = { MatchScores: [] };
        }
        // put the results back into the matches
        playoffschedule.schedule = playoffschedule.schedule.map((match) => {
          const matchScores = playoffScores.MatchScores.filter((scoreMatch) => {
            return scoreMatch.matchNumber === match.matchNumber;
          })[0];
          if (matchScores) {
            match = {
              ...match,
              scores: matchScores,
              scoreRedFinal: matchScores?.redScore,
              scoreBlueFinal: matchScores?.blueScore,
              scoreRedAuto: matchScores?.redAuto,
              scoreRedFoul: matchScores?.redPenalty,
              scoreBlueAuto: matchScores?.blueAuto,
              scoreBlueFoul: matchScores?.bluePenalty,
              actualStartTime: matchScores.actualStartTime,
              postResultTime: matchScores.postResultTime,
            };
          }
          return match;
        });
      } else if (
        !useFTCOffline &&
        selectedEvent?.value?.type === "OffSeason" &&
        !ftcMode
      ) {
        // get the playoff schedule from TBA via gatool Offseason API
        console.log("Using TBA for Offseason Event Playoff Schedule");
        // Use event's tbaEventKey directly
        const eventKey = selectedEvent?.value?.tbaEventKey;

        if (!eventKey) {
          console.log("No TBA event key available for this offseason event");
        }

        if (eventKey) {
          const tbaMatches = await fetchTBAMatches(
            eventKey,
            selectedYear?.value
          );

          if (tbaMatches && tbaMatches?.Schedule?.schedule?.length > 0) {
            // Filter for playoff matches only (excluding qm)
            const playoffMatches = tbaMatches?.Schedule?.schedule
              .filter((match) => match.tournamentLevel === "Playoff")
              .sort((a, b) => a.matchNumber - b.matchNumber);

            if (playoffMatches.length > 0) {
              // Remap string team identifiers to numeric team numbers
              const remappedMatches = playoffMatches.map((match) => {
                if (match.teams) {
                  const remappedTeams = match.teams.map((team) => {
                    if (typeof team.teamNumber === 'string') {
                      const numericTeam = remapStringToNumber(team.teamNumber);
                      if (numericTeam) {
                        return { ...team, teamNumber: numericTeam };
                      }
                    }
                    return team;
                  });
                  return { ...match, teams: remappedTeams };
                }
                return match;
              });

              playoffschedule = {
                schedule: remappedMatches,
              };
            }
          }
        }
      } else if (!useFTCOffline) {
        const playoffResult = await httpClient.getNoAuth(
          `${selectedYear?.value}/schedule/hybrid/${selectedEvent?.value.code}/playoff`,
          ftcMode ? ftcBaseURL : undefined,
          undefined,
          undefined,
          signal()
        );
        if (playoffResult.status === 200) {
          // @ts-ignore
          playoffschedule = await playoffResult.json();
        }
      }
    } else {
      if (
        selectedEvent?.value?.code === "PRACTICE1" ||
        selectedEvent?.value?.code === "PRACTICE2"
      ) {
        playoffschedule = { schedule: training.schedule.playoff.pending };
      } else if (selectedEvent?.value?.code === "PRACTICE3") {
        playoffschedule = { schedule: training.schedule.playoff.partial };
      } else {
        playoffschedule = { schedule: training.schedule.playoff.final };
      }
    }

    playoffschedule = normalizePlayoffScheduleApiResponse(playoffschedule);

    if (typeof playoffschedule.Schedule !== "undefined") {
      playoffschedule.schedule = playoffschedule.Schedule;
      delete playoffschedule.Schedule;
    }
    if (typeof playoffschedule.schedule.Schedule !== "undefined") {
      playoffschedule.schedule.schedule = playoffschedule.schedule.Schedule;
      delete playoffschedule.schedule.Schedule;
    }

    if (playoffschedule?.schedule?.schedule) {
      playoffschedule.schedule = playoffschedule.schedule.schedule;
    }

    playoffschedule.scheduleLastModified = playoffschedule.schedule?.headers
      ? moment(playoffschedule.schedule?.headers.schedule["last-modified"])
      : moment();
    playoffschedule.matchesLastModified = playoffschedule.schedule?.headers
      ? moment(playoffschedule.schedule?.headers.matches["last-modified"])
      : moment();

    // FTC: normalize team rows (`team` -> teamNumber, station casing) before propagation and UI
    if (ftcMode && playoffschedule?.schedule?.length > 0 && Array.isArray(playoffschedule.schedule)) {
      playoffschedule.schedule = playoffschedule.schedule.map((m) =>
        normalizeFtcHybridMatch(m)
      );
    }

    // FTC: extend schedule with partially populated matches from bracket propagation (winners/losers to downstream series)
    if (ftcMode && playoffschedule?.schedule?.length > 0 && Array.isArray(playoffschedule.schedule)) {
      let allianceCountForPlayoff = 6;
      if (playoffCountOverride?.value != null) {
        allianceCountForPlayoff = parseInt(playoffCountOverride.value, 10);
      } else if (teamList?.teamCountTotal != null) {
        if (teamList.teamCountTotal <= 10) allianceCountForPlayoff = 2;
        else if (teamList.teamCountTotal <= 20) allianceCountForPlayoff = 4;
        else if (teamList.teamCountTotal <= 40) allianceCountForPlayoff = 6;
        else allianceCountForPlayoff = 8;
      }
      playoffschedule.schedule = extendFTCPlayoffScheduleWithPartialMatches(
        playoffschedule.schedule,
        allianceCountForPlayoff,
        true
      );
    }

    if (playoffschedule?.schedule?.length > 0) {
      completedMatchCount =
        playoffschedule?.schedule?.length -
        _.filter(playoffschedule.schedule, { actualStartTime: null }).length;
    }

    playoffschedule.completedMatchCount = completedMatchCount;

    // determine the tiebreaker
    // var lastMatchNumber = playoffschedule?.schedule[_.findLastIndex(playoffschedule?.schedule, function (match) {
    //   return (match?.scoreRedFinal !== null) || (match?.scoreBlueFinal !== null)
    // })]?.matchNumber;

    if (
      !selectedEvent?.value?.code.includes("PRACTICE") &&
      !useFTCOffline &&
      !(selectedEvent?.value?.type === "OffSeason") &&
      playoffschedule?.schedule?.length > 0
    ) {
      const playoffScoresResult = await httpClient.getNoAuth(
        `${selectedYear?.value}/scores/${selectedEvent?.value.code}/playoff`,
        ftcMode ? ftcBaseURL : undefined,
        undefined,
        undefined,
        signal()
      );
      if (playoffScoresResult.status === 200) {
        // @ts-ignore
        playoffScores = await playoffScoresResult.json();
        if (playoffScores.matchScores) {
          playoffScores = { MatchScores: playoffScores.matchScores };
        }
      } else {
        playoffScores = { MatchScores: [] };
      }
    } else if (
      selectedEvent?.value?.code === "PRACTICE1" ||
      selectedEvent?.value?.code === "PRACTICE2"
    ) {
      playoffScores = training.scores.playoff.initial;
    } else if (selectedEvent?.value?.code === "PRACTICE3") {
      playoffScores = training.scores.playoff.partial;
    } else {
      playoffScores = training.scores.playoff.final;
    }

    if (playoffschedule?.schedule?.length > 0) {
      // adds the winner to the schedule.
      playoffschedule.schedule = playoffschedule.schedule.map(
        (match, index) => {
          //fix the match number fro FTC matches
          if (ftcMode) {
            // Preserve original matchNumber before overwriting (needed for tiebreaker detection)
            if (!match.originalMatchNumber) {
              match.originalMatchNumber = match.matchNumber;
            }
            match.matchNumber = index + 1;
          }
          //figure out how to match scores to match
          if (
            playoffScores?.MatchScores &&
            !(selectedEvent?.value?.type === "OffSeason")
          ) {
            const matchResults = playoffScores.MatchScores.filter(
              (scoreMatch) => {
                const foundMatch = !ftcMode ? scoreMatch.matchNumber === match.matchNumber : (scoreMatch.matchNumber === match.originalMatchNumber) && (scoreMatch.matchSeries === match.series);
                return foundMatch
              }
            )[0];
            // FTC offline: scores are in same order as schedule; use index if matchNumber doesn't align
            const ftcMatchResults = useFTCOffline && playoffScores.MatchScores[index];
            const results = matchResults || (ftcMatchResults && (ftcMatchResults.redScore != null || ftcMatchResults.blueScore != null) ? ftcMatchResults : null);
            if (results) {
              match.scores = results;
              match.scoreRedFinal = results.alliances?.[1]?.totalPoints ?? results.redScore;
              match.scoreBlueFinal = results.alliances?.[0]?.totalPoints ?? results.blueScore;
              if (ftcMode) {
                hydrateFtcPlayoffTeamsFromResults(match, results);
              }
            }
          } else if (selectedEvent?.value?.type === "OffSeason") {
            match.scores = match?.matchScores || [];
            if (match?.matchScores) {
              delete match.matchScores;
            }
          }
          match.winner = winner(match, ftcMode);
          return match;
        }
      );

      if (playoffScores?.MatchScores) {
        _.forEach(playoffScores.MatchScores, (score) => {
          if (score.alliances[0].totalPoints === score.alliances[1].totalPoints) {
            const matchIndex = _.findIndex(
              playoffschedule.schedule,
              (m) =>
                ftcMode
                  ? m.originalMatchNumber === score.matchNumber &&
                    m.series === score.matchSeries
                  : m.matchNumber === score.matchNumber
            );

            if (matchIndex >= 0 && playoffschedule.schedule[matchIndex]?.winner) {
              playoffschedule.schedule[matchIndex].winner.tieWinner =
                score?.winningAlliance === 2
                  ? "blue"
                  : score?.winningAlliance === 1
                    ? "red"
                    : "TBD";
              playoffschedule.schedule[matchIndex].winner.level =
                score?.tiebreaker?.item1 >= 0 ? score?.tiebreaker?.item1 : 0;
              playoffschedule.schedule[matchIndex].winner.tieDetail = score?.tiebreaker?.item2;
            }
          }
        });
      }

      if (
        !ftcMode &&
        playoffschedule?.schedule?.length > 0 &&
        Array.isArray(playoffschedule.schedule)
      ) {
        let allianceCountForPlayoff = 6;
        if (playoffCountOverride?.value != null) {
          allianceCountForPlayoff = parseInt(playoffCountOverride.value, 10);
        } else if (teamList?.teamCountTotal != null) {
          if (teamList.teamCountTotal <= 10) allianceCountForPlayoff = 2;
          else if (teamList.teamCountTotal <= 20) allianceCountForPlayoff = 4;
          else if (teamList.teamCountTotal <= 40) allianceCountForPlayoff = 6;
          else allianceCountForPlayoff = 8;
        }
        playoffschedule.schedule = extendFRCPlayoffScheduleWithPartialMatches(
          playoffschedule.schedule,
          allianceCountForPlayoff
        );
      }
    }

    var lastMatchPlayed = 0;

    if (qualschedule?.completedMatchCount > 0) {
      lastMatchPlayed += qualschedule?.completedMatchCount;
    }

    if (playoffschedule?.completedMatchCount > 0) {
      lastMatchPlayed += playoffschedule?.completedMatchCount;
    }

    // Epoch guard: discard if a newer fetch has started before committing
    // playoffs, currentMatch, reserve edits, and downstream fan-out
    if (isStale()) {
      console.log("getSchedule: stale response discarded (playoffs)");
      return;
    }

    if (options.updateCurrentMatch !== false && ((loadingEvent && autoAdvance) || autoUpdate)) {
      if (
        lastMatchPlayed === qualschedule?.schedule.length + 1 ||
        lastMatchPlayed ===
        qualschedule?.schedule.length + playoffschedule?.schedule.length + 2
      ) {
        lastMatchPlayed -= 1;
      }
      if (currentMatch <= lastMatchPlayed) {
        setCurrentMatch(lastMatchPlayed + 1);
      }
    }

    //setEventHighScores(highScores);
    playoffschedule.lastUpdate = moment().format();
    console.log(
      `There are ${playoffschedule?.schedule.length} playoff matches loaded.`
    );

    const eventCodeForReservePrune = selectedEvent?.value?.code;
    if (
      eventCodeForReservePrune &&
      Array.isArray(playoffschedule?.schedule) &&
      playoffschedule.schedule.length > 0
    ) {
      const { nextRoot, prunedAllianceKeys } =
        prunePlayoffReserveSetsAfterPostedMatches({
          editsRoot: playoffReserveEditsRef.current,
          eventCode: eventCodeForReservePrune,
          playoffMatches: playoffschedule.schedule,
          ftcMode: Boolean(ftcMode),
        });
      if (prunedAllianceKeys.length > 0) {
        playoffReserveEditsRef.current = nextRoot;
        setPlayoffReserveEdits(nextRoot);
      }
    }

    // For OFFLINE events, only update playoffSchedule if there's no uploaded schedule already
    if (!isOfflineEvent || !playoffSchedule || playoffSchedule?.schedule?.length === 0) {
      setPlayoffSchedule(playoffschedule);
    } else {
      console.log("OFFLINE event - preserving uploaded playoff schedule");
    }

    if (playoffschedule?.schedule?.length > 0 || (isOfflineEvent && playoffSchedule?.schedule?.length > 0)) {
      getAlliances();
    }
    getRanks();
    // System messages are fetched by callers (loadEvent, useInterval, nextMatch, etc.) to avoid double-fetch

    // Calculate event high scores after schedule is loaded
    getEventStats(selectedYear?.value, selectedEvent?.value?.code);
  }

  return { getSchedule };
}
