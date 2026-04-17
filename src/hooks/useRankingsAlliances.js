import { useRef, useCallback } from "react";
import {
  applyPlayoffReserveEdits,
  compactReserveEditsForEvent,
} from "../utils/playoffReserveEdits";
import { roundThreeOrReserveRoleLabel } from "../utils/allianceRoleLabels";
import { normalizeFtcGatoolAllianceRow } from "../utils/ftcHybridMatchTeams";
import { fetchLocal } from "../utils/fetchLocal";
import _ from "lodash";
import moment from "moment";

const ftcBaseURL = "https://api.gatool.org/ftc/v2/";

// --- Pure conformer helpers ---

function conformCheesyArenaRankings(team) {
  return {
    ...team,
    rank: team?.Rank,
    teamNumber: team?.TeamId,
    wins: team?.Wins,
    losses: team?.Losses,
    ties: team?.Ties,
    qualAverage:
      team?.MatchPoints && team?.Played
        ? team?.MatchPoints / team?.Played
        : 0,
    dq: team?.Disqualifications,
    matchesPlayed: team?.Played,
  };
}

function conformFTCOfflineRankings(team) {
  return {
    ...team,
    rank: team?.ranking,
    teamNumber: team?.team,
    qualAverage: Math.round(100 * team?.tbp1) / 100,
    dq: team?.dq || 0,
    sortOrder1: Number(team?.rankingPoints) || 0,
  };
}

function conformFTCOfflineAlliance(alliance) {
  return {
    number: alliance?.seed,
    captain: alliance?.captain || null,
    round1: alliance?.pick1 || null,
    round2: alliance?.pick2 || null,
    round3: alliance?.pick3 || null,
    backup: null,
    backupReplaced: null,
    name: `Alliance ${alliance?.seed}`,
  };
}

/**
 * useRankingsAlliances — owns rankings, alliances, and district rankings state
 * plus their fetch functions.
 *
 * @param {object} deps - dependencies from App.jsx / EventStoreProvider
 * @param {object} deps.httpClient - AuthClient instance
 * @param {object} deps.selectedEvent - currently selected event (usePersistentState value)
 * @param {object} deps.selectedYear - currently selected year
 * @param {object} deps.ftcMode - FTC mode state (null/false/{value:...})
 * @param {object} deps.teamList - current team list
 * @param {object} deps.qualSchedule - qualification schedule
 * @param {boolean} deps.useCheesyArena - whether Cheesy Arena is enabled
 * @param {boolean} deps.cheesyArenaAvailable - whether Cheesy Arena server is reachable
 * @param {boolean} deps.useFTCOffline - whether FTC offline mode is enabled
 * @param {boolean} deps.FTCOfflineAvailable - whether FTC offline server is reachable
 * @param {string} deps.FTCServerURL - FTC local server URL
 * @param {object} deps.FTCKey - FTC API key
 * @param {function} deps.remapNumberToString - team number remapper
 * @param {object} deps.playoffReserveEditsRef - ref to current reserve edits
 * @param {function} deps.setPlayoffReserveEdits - setter for reserve edits state
 * @param {object} deps.training - training/practice data
 * @param {boolean} deps.isOnline - online status
 * @param {boolean} deps.manualOfflineMode - manual offline mode flag
 * @param {function} deps.getEPA - EPA fetch callback (stays in App.jsx)
 * @param {function} deps.getEPAFTC - FTC EPA fetch callback (stays in App.jsx)
 * @param {function} deps.getRegionalEventDetail - regional detail fetch callback
 * @param {function} deps.getTeamList - team list fetch callback (for world champs)
 * @param {function} deps.setHaveChampsTeams - setter for champs teams flag
 * @param {boolean} deps.haveChampsTeams - whether champs teams are loaded
 */
export function useRankingsAlliances(deps) {
  const {
    httpClient,
    selectedEvent,
    selectedYear,
    ftcMode,
    teamList,
    qualSchedule,
    useCheesyArena,
    cheesyArenaAvailable,
    useFTCOffline,
    FTCOfflineAvailable,
    FTCServerURL,
    FTCKey,
    remapNumberToString,
    playoffReserveEditsRef,
    setPlayoffReserveEdits,
    training,
    getEPA,
    getEPAFTC,
    getRegionalEventDetail,
    getTeamList,
    setHaveChampsTeams,
    haveChampsTeams,
    // State + setters (owned by App.jsx, passed in)
    rankings,
    setRankings,
    rankingsOverride,
    setRankingsOverride,
    alliances,
    setAlliances,
    allianceCount,
    setAllianceCount,
    districtRankings,
    setDistrictRankings,
    playoffs,
    setPlayoffs,
    // Event-scoped abort signal
    getEventSignal,
  } = deps;

  // Reads the CURRENT event abort signal at call time. Using a getter avoids
  // capturing a stale signal in closures — the ref is rotated on each event
  // switch in App.jsx, so we must re-read it for every fetch.
  const signal = () => getEventSignal?.();

  /** Stale-response guards — prevent slow responses from event A overwriting event B state */
  const getAlliancesEpochRef = useRef(0);
  const getRanksEpochRef = useRef(0);

  // --- TBA fetchers (need httpClient) ---

  const fetchTBARankings = useCallback(async (tbaEventKey, year) => {
    try {
      console.log(`Fetching TBA rankings for event: ${tbaEventKey}`);
      const result = await httpClient.getNoAuth(
        `${year}/offseason/rankings/${tbaEventKey}/`,
        undefined,
        undefined,
        undefined,
        signal()
      );
      if (result.status === 200) {
        const rankingsData = await result.json();
        return rankingsData;
      }
      return null;
    } catch (error) {
      console.error("Error fetching TBA rankings:", error);
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [httpClient]);

  const fetchTBAAlliances = useCallback(async (tbaEventKey, year) => {
    try {
      console.log(`Fetching TBA alliances for event: ${tbaEventKey}`);
      const result = await httpClient.getNoAuth(
        `${year}/offseason/alliances/${tbaEventKey}/`,
        undefined,
        undefined,
        undefined,
        signal()
      );
      if (result.status === 200) {
        const alliancesData = await result.json();
        return alliancesData;
      }
      return [];
    } catch (error) {
      console.error("Error fetching TBA alliances:", error);
      return [];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [httpClient]);

  // --- getDistrictRanks ---

  async function getDistrictRanks() {
    var result = null;
    var districtranks = null;
    result = await httpClient.getNoAuth(
      `${selectedYear?.value}/district/rankings/${selectedEvent?.value.districtCode}`,
      ftcMode ? ftcBaseURL : undefined,
      undefined,
      undefined,
      signal()
    );
    districtranks = await result.json();
    districtranks.lastUpdate = moment().format();
    setDistrictRankings(districtranks);
  }

  // --- getRanks ---

  async function getRanks() {
    console.log(`Fetching Ranks for ${selectedEvent?.value?.name}...`);
    getRanksEpochRef.current += 1;
    const getRanksEpoch = getRanksEpochRef.current;
    var result = null;
    var ranks = null;
    if (selectedEvent?.value?.code.includes("OFFLINE")) {
      ranks = { rankings: { Rankings: [] } };
    } else if (!selectedEvent?.value?.code.includes("PRACTICE")) {
      ranks = { rankings: { Rankings: [] } };
      if (useCheesyArena && cheesyArenaAvailable) {
        result = await fetchLocal("http://10.0.100.5:8080/api/rankings");
        if (result.status === 200) {
          var data = await result.json();
          if (data?.Rankings.length > 0) {
            ranks = {
              rankings: {
                rankings: data?.Rankings.map((team) => {
                  return conformCheesyArenaRankings(team);
                }),
              },
            };
          }
        }
      } else if (
        useFTCOffline &&
        FTCOfflineAvailable &&
        ftcMode?.value === "FTCLocal"
      ) {
        console.log("Using FTC Local Server for ranks");
        const rankingsResult = await httpClient.getNoAuth(
          `/api/v1/events/${selectedEvent?.value.code}/rankings/`,
          FTCServerURL,
          undefined,
          { Authorization: FTCKey?.key || "" },
          signal()
        );
        if (rankingsResult.status === 200) {
          const rankingsData = await rankingsResult.json();
          if (rankingsData?.rankingList?.length > 0) {
            ranks = {
              rankings: {
                rankings: rankingsData?.rankingList.map((team) => {
                  return conformFTCOfflineRankings(team);
                }),
              },
            };
          }
        } else if (rankingsResult.status === 204) {
          ranks = { rankings: { Rankings: [] } };
        }
      } else if (
        !useFTCOffline &&
        selectedEvent?.value?.type === "OffSeason" &&
        !ftcMode
      ) {
        console.log("Using TBA for Offseason Event Rankings");
        const eventKey = selectedEvent?.value?.tbaEventKey;

        if (!eventKey) {
          console.log("No TBA event key available for this offseason event");
        }

        if (eventKey) {
          const tbaRankings = await fetchTBARankings(
            eventKey,
            selectedYear?.value
          );

          if (
            tbaRankings &&
            tbaRankings.rankings &&
            tbaRankings.rankings.rankings.length > 0
          ) {
            ranks = {
              rankings: {
                rankings: tbaRankings.rankings.rankings,
              },
            };
          } else {
            ranks = { rankings: { Rankings: [] } };
          }
        }
      } else if (!useFTCOffline) {
        result = await httpClient.getNoAuth(
          `${selectedYear?.value}/rankings/${selectedEvent?.value.code}`,
          ftcMode ? ftcBaseURL : undefined,
          undefined,
          undefined,
          signal()
        );
        if (result.status === 200) {
          ranks = await result.json();
        }
      }
    } else if (selectedEvent?.value?.code === "PRACTICE1") {
      ranks = { rankings: _.cloneDeep(training.ranks.partial) };
    } else {
      ranks = { rankings: _.cloneDeep(training.ranks.final) };
    }

    if (typeof ranks.Rankings === "undefined") {
      ranks.ranks = ranks.rankings;
      delete ranks.rankings;
    } else {
      ranks.ranks = ranks.Rankings;
      delete ranks.Rankings;
    }

    if (typeof ranks.ranks.Rankings !== "undefined") {
      ranks.ranks = ranks.ranks.Rankings;
      delete ranks.ranks.Rankings;
    } else {
      ranks.ranks = ranks.ranks.rankings;
      delete ranks.ranks.rankings;
    }

    // Filter out FTC rankings entries that haven't played any matches yet
    if (ftcMode && ranks?.ranks && Array.isArray(ranks.ranks)) {
      const originalCount = ranks.ranks.length;
      ranks.ranks = ranks.ranks.filter((rank) => {
        return rank.matchesCounted !== undefined && rank.matchesCounted !== null && rank.matchesCounted > 0;
      });
      const filteredCount = ranks.ranks.length;
      if (originalCount !== filteredCount) {
        console.log(`Filtered FTC rankings: ${originalCount} -> ${filteredCount} (removed ${originalCount - filteredCount} teams with no matches played)`);
      }
    }

    // fix FTC online rankings
    const teamResults = teamList?.teams.map((team) => {
      return {
        teamNumber: team?.teamNumber,
        qualTotal: 0,
        dqTotal: 0,
        matchesPlayed: 0,
      };
    });
    if (ftcMode && ranks?.ranks?.length > 0) {
      if (qualSchedule?.schedule?.length > 0) {
        qualSchedule.schedule.forEach((match) => {
          const matchReference = _.cloneDeep(match);
          match.teams.forEach((matchTeam) => {
            const teamIndex = _.findIndex(teamResults, {
              teamNumber: matchTeam.teamNumber,
            });
            if (teamIndex >= 0 && !matchTeam.surrogate) {
              const teamScore = matchTeam.station.toLowerCase().includes("red")
                ? matchReference.scoreRedFinal
                : matchReference.scoreBlueFinal;
              teamResults[teamIndex].qualTotal += teamScore;
              if (matchTeam.dq) {
                teamResults[teamIndex].dqTotal += 1;
              }
              teamResults[teamIndex].matchesPlayed += 1;
            }
          });
        });
      }
      // merge the teamResults into the ranks
      ranks.ranks = ranks.ranks.map((rank) => {
        const teamIndex = _.findIndex(teamResults, {
          teamNumber: rank.teamNumber,
        });
        if (teamIndex >= 0) {
          rank.qualAverage = teamResults[teamIndex].matchesPlayed
            ? Math.round(
              (teamResults[teamIndex].qualTotal * 100) /
              teamResults[teamIndex].matchesPlayed
            ) / 100
            : 0;
          rank.dq = teamResults[teamIndex].dqTotal;
        }
        return rank;
      });
    }

    ranks.lastModified = ranks.headers
      ? moment(ranks?.headers["last-modified"]).format()
      : moment().format();
    ranks.lastUpdate = moment().format();

    // For OFFLINE events, only update rankings if there's no uploaded rankings already
    const isOfflineEvent = selectedEvent?.value?.code === "OFFLINE";
    // Stale-response guard: if a newer getRanks() call started, discard this result
    if (getRanksEpoch !== getRanksEpochRef.current) {
      return;
    }
    if (!isOfflineEvent || !rankings || rankings?.ranks?.length === 0) {
      setRankings(ranks);
    } else {
      console.log("OFFLINE event - preserving uploaded rankings");
    }

    if (ranks?.ranks?.length > 0 || (isOfflineEvent && rankings?.ranks?.length > 0)) {
      if (!ftcMode) {
        getEPA();
      } else if (ftcMode) {
        getEPAFTC();
      }
      if (selectedEvent?.value.districtCode) {
        getDistrictRanks();
      }
    }
    // FRC Regional event: fetch championship advancement per team
    if (!ftcMode && !selectedEvent?.value?.districtCode && selectedEvent?.value?.code && !selectedEvent?.value?.code.includes("OFFLINE")) {
      getRegionalEventDetail(ranks?.ranks);
    }
  }

  // --- getAlliances ---

  async function getAlliances(allianceTemp) {
    console.log("Getting Alliances");
    getAlliancesEpochRef.current += 1;
    const getAlliancesEpoch = getAlliancesEpochRef.current;
    var result = null;
    var alliancesData = allianceTemp || { Alliances: [] };
    if (
      !selectedEvent?.value?.code.includes("PRACTICE") &&
      !selectedEvent?.value?.code.includes("OFFLINE")
    ) {
      if (useCheesyArena && cheesyArenaAvailable) {
        result = await fetchLocal("http://10.0.100.5:8080/api/alliances");
        var data = await result.json();
        if (data.length > 0) {
          alliancesData = {
            Alliances: data.map((Alliance) => {
              return {
                number: Alliance?.Id,
                captain: Alliance?.TeamIds[0] || null,
                round1: Alliance?.TeamIds[1] || null,
                round2: Alliance?.TeamIds[2] || null,
                round3: Alliance?.TeamIds[3] || null,
                backup: Alliance?.TeamIds[4] || null,
                backupReplaced: null,
                name: `Alliance ${Alliance?.Id}`,
              };
            }),
          };
        }
      } else if (
        useFTCOffline &&
        FTCOfflineAvailable &&
        ftcMode?.value === "FTCLocal"
      ) {
        console.log("Using FTC Local Server for Alliances");
        const allianceResult = await httpClient.getNoAuth(
          `/api/v1/events/${selectedEvent?.value.code}/elim/alliances/`,
          FTCServerURL,
          undefined,
          { Authorization: FTCKey?.key || "" },
          signal()
        );
        if (allianceResult.status === 200) {
          const allianceData = await allianceResult.json();
          if (allianceData?.alliances?.length > 0) {
            alliancesData = {
              Alliances: allianceData?.alliances.map((alliance) => {
                return conformFTCOfflineAlliance(alliance);
              }),
            };
          }
        } else if (allianceResult.status === 204) {
          alliancesData = { Alliances: [] };
        }
      } else if (
        !useFTCOffline &&
        selectedEvent?.value?.type === "OffSeason" &&
        !ftcMode
      ) {
        console.log("Using TBA for Offseason Event Alliances");
        const eventKey = selectedEvent?.value?.tbaEventKey;

        if (!eventKey) {
          console.log("No TBA event key available for this offseason event");
        }

        if (eventKey) {
          const tbaAlliances = await fetchTBAAlliances(
            eventKey,
            selectedYear?.value
          );

          if (tbaAlliances && tbaAlliances?.alliances?.length > 0) {
            alliancesData = {
              Alliances: tbaAlliances?.alliances,
              count: tbaAlliances?.count,
            };
          } else {
            alliancesData = { Alliances: [] };
            console.log(
              `No Alliances found for ${selectedEvent?.value?.name} on TBA. Skipping...`
            );
          }
        }
      } else if (!useFTCOffline) {
        result = await httpClient.getNoAuth(
          `${selectedYear?.value}/alliances/${selectedEvent?.value.code}`,
          ftcMode ? ftcBaseURL : undefined,
          undefined,
          undefined,
          signal()
        );
        if (result.status !== 200) {
          alliancesData = { Alliances: [] };
          console.log(
            `No Alliances found for ${selectedEvent?.value?.name}. Skipping...`
          );
        } else {
          alliancesData = await result.json();
          if (typeof alliancesData.Alliances !== "undefined") {
            alliancesData.alliances = alliancesData.Alliances;
            delete alliancesData.Alliances;
          }
          // remove "Seed" from FTC alliance names
          if (ftcMode && Array.isArray(alliancesData.alliances)) {
            alliancesData.alliances = alliancesData.alliances.map((alliance) => {
              if (alliance?.name && typeof alliance.name === "string") {
                alliance.name = alliance.name.replace("Seed ", "");
              }
              return alliance;
            });
          }
        }
      }
    } else if (
      selectedEvent?.value?.code === "PRACTICE1" ||
      selectedEvent?.value?.code === "PRACTICE2"
    ) {
      alliancesData = training.alliances.initial;
    } else if (selectedEvent?.value?.code === "PRACTICE3") {
      alliancesData = training.alliances.partial;
    } else if (selectedEvent?.value?.code === "PRACTICE4") {
      alliancesData = training.alliances.final;
    }

    if (typeof alliancesData.Alliances !== "undefined") {
      alliancesData.alliances = alliancesData.Alliances;
      delete alliancesData.Alliances;
    }
    // FTC gatool (and some payloads) nest captain/round picks as { teamNumber, displayTeamNumber, teamName }
    if (Array.isArray(alliancesData?.alliances)) {
      alliancesData.alliances = alliancesData.alliances.map((a) =>
        normalizeFtcGatoolAllianceRow(a)
      );
    }
    /** Reserve merge + prune must commit with setAlliances (same epoch) so stale fetches do not mutate edits without updating alliances. */
    let reserveEditsPruneForCommit = null;
    if (!allianceTemp && selectedEvent?.value?.code) {
      const code = selectedEvent.value.code;
      const pruneKeys = applyPlayoffReserveEdits(
        alliancesData,
        code,
        playoffReserveEditsRef.current
      );
      if (pruneKeys.length > 0) {
        reserveEditsPruneForCommit = { code, pruneKeys };
      }
    }
    var allianceLookup = {};
    if (alliancesData?.alliances) {
      const setAllianceLookupEntry = (teamNumber, payload) => {
        if (_.isNull(teamNumber) || _.isUndefined(teamNumber) || teamNumber === "") {
          return;
        }
        const rawKey = `${teamNumber}`;
        allianceLookup[rawKey] = payload;
        const remappedKey = `${remapNumberToString(teamNumber)}`;
        if (remappedKey && remappedKey !== rawKey) {
          allianceLookup[remappedKey] = payload;
        }
      };

      alliancesData?.alliances.forEach((rawAlliance) => {
        const alliance = ftcMode
          ? {
              ...rawAlliance,
              captain:
                rawAlliance.captain ??
                rawAlliance.captainTeam ??
                rawAlliance.captainTeamNumber ??
                null,
              round1:
                rawAlliance.round1 ??
                rawAlliance.pick1 ??
                null,
              round2:
                rawAlliance.round2 ??
                rawAlliance.pick2 ??
                null,
              round3:
                rawAlliance.round3 ??
                rawAlliance.pick3 ??
                null,
              backup:
                rawAlliance.backup ??
                rawAlliance.backupTeam ??
                null,
            }
          : rawAlliance;

        setAllianceLookupEntry(alliance.captain, {
          role: `Captain`,
          alliance: alliance.name,
          number: alliance.number,
          captain: alliance.captain,
          round1: alliance.round1,
          round2: alliance.round2,
          round3: alliance.round3,
          backup: alliance.backup,
          backupReplaced: alliance.backupReplaced,
        });
        setAllianceLookupEntry(alliance.round1, {
          role: `Round 1 Selection`,
          alliance: alliance.name,
          number: alliance.number,
          captain: alliance.captain,
          round1: alliance.round1,
          round2: alliance.round2,
          round3: alliance.round3,
          backup: alliance.backup,
          backupReplaced: alliance.backupReplaced,
        });
        if (alliance.round2) {
          setAllianceLookupEntry(alliance.round2, {
            role: `Round 2 Selection`,
            alliance: alliance.name,
            number: alliance.number,
            captain: alliance.captain,
            round1: alliance.round1,
            round2: alliance.round2,
            round3: alliance.round3,
            backup: alliance.backup,
            backupReplaced: alliance.backupReplaced,
          });
        }
        if (alliance.round3) {
          setAllianceLookupEntry(alliance.round3, {
            role: roundThreeOrReserveRoleLabel(selectedEvent?.value),
            alliance: alliance.name,
            number: alliance.number,
            captain: alliance.captain,
            round1: alliance.round1,
            round2: alliance.round2,
            round3: alliance.round3,
            backup: alliance.backup,
            backupReplaced: alliance.backupReplaced,
          });
        }
        if (alliance.backup) {
          setAllianceLookupEntry(alliance.backup, {
            role: `Reserve team`,
            alliance: alliance.name,
            number: alliance.number,
            captain: alliance.captain,
            round1: alliance.round1,
            round2: alliance.round2,
            round3: alliance.round3,
            backup: alliance.backup,
            backupReplaced: alliance.backupReplaced,
          });
        }
      });
      alliancesData.Lookup = allianceLookup;
    }

    alliancesData.lastUpdate = moment().format();
    console.log(`${alliancesData?.alliances?.length} Alliances loaded.`);
    if (getAlliancesEpoch !== getAlliancesEpochRef.current) {
      return;
    }
    if (reserveEditsPruneForCommit) {
      const { code, pruneKeys } = reserveEditsPruneForCommit;
      setPlayoffReserveEdits((prev) => {
        const forEv = compactReserveEditsForEvent({ ...(prev[code] || {}) });
        for (const k of pruneKeys) {
          delete forEv[k];
        }
        let next;
        if (Object.keys(forEv).length === 0) {
          const { [code]: _removed, ...rest } = prev;
          next = rest;
        } else {
          next = { ...prev, [code]: forEv };
        }
        playoffReserveEditsRef.current = next;
        return next;
      });
    }
    setAlliances(alliancesData);
    if (alliancesData?.alliances?.length > 0) {
      setPlayoffs(true);

      // If we are in World Champs, we need to determine the team list from the Alliances
      if (selectedEvent?.value?.type === "Championship" && alliancesData) {
        var tempChampsTeamList = [];
        if (!haveChampsTeams) {
          alliancesData?.alliances.forEach((alliance) => {
            tempChampsTeamList.push(alliance?.captain);
            tempChampsTeamList.push(alliance?.round1);
            tempChampsTeamList.push(alliance?.round2);
            tempChampsTeamList.push(alliance?.round3);
          });

          setHaveChampsTeams(true);
          await getTeamList(_.uniq(tempChampsTeamList));
          if (getAlliancesEpoch !== getAlliancesEpochRef.current) {
            return;
          }
        }
      }
    }
  }

  return {
    // --- State (read by context consumers) ---
    rankings,
    rankingsOverride,
    alliances,
    allianceCount,
    districtRankings,
    playoffs,
    getAlliancesEpochRef,

    // --- Fetch actions ---
    getRanks,
    getAlliances,
    getDistrictRanks,

    // --- Semantic mutation actions ---
    // (Prefer these over raw setters — they express intent, not implementation)

    /** Reset all rankings/alliances state when switching events. */
    async resetRankingsAlliancesState(preserveOfflineData = false) {
      if (!preserveOfflineData) {
        await setRankings(null);
        await setAllianceCount(null);
        await setRankingsOverride(null);
      }
      await setPlayoffs(false);
      await setDistrictRankings(null);
    },

    /** Apply cloud-synced user preferences that affect rankings/alliances. */
    applyUserPrefs(prefs) {
      if (prefs.rankingsOverride !== undefined) {
        setRankingsOverride(prefs.rankingsOverride);
      }
      if (prefs.allianceCount !== undefined) {
        setAllianceCount(prefs.allianceCount);
      }
    },

    // --- Low-level setters (for pages that directly mutate, e.g. SchedulePage) ---
    setRankings,
    setRankingsOverride,
    setAlliances,
    setAllianceCount,
    setDistrictRankings,
    setPlayoffs,
  };
}
