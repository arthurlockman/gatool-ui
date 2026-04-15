import { useState, useEffect, useRef } from "react";
import { usePersistentState } from "./UsePersistentState";
import { communityUpdateTemplate } from "../data/appConfig";
import { trainingData } from "components/TrainingMatches";
import { toast } from "react-toastify";
import _ from "lodash";
import moment from "moment";

const ftcBaseURL = "https://api.gatool.org/ftc/v2/";
const training = _.cloneDeep(trainingData);

export function useCommunityUpdates({
  httpClient,
  selectedEvent,
  selectedYear,
  ftcMode,
  teamList,
  isOnline,
  useFTCOffline,
  manualOfflineMode,
  localUpdates,
  EITeams,
  qualSchedule,
  playoffSchedule,
  getEffectiveTeamNumber,
  cheesyArenaAvailable,
  useCheesyArena,
}) {
  const [communityUpdates, setCommunityUpdates] = usePersistentState(
    "cache:communityUpdates",
    null
  );
  const [loadingCommunityUpdates, setLoadingCommunityUpdates] = useState(false);

  // Use a ref to track loading state for the async function to avoid stale closures
  const loadingRef = useRef(false);

  /**
   * This function retrieves communnity updates for a specified event from gatool Cloud.
   * @async
   * @function getCommunityUpdates
   * @param notify boolean set to Toast if the request is successful
   * @param selectedYear The currently selected year, which is a persistent state variable
   * @param ignoreLocalUpdates don't load the community updates
   * @param selectedEvent The currently selected event, which is a persistent state variable
   * @param adHocTeamList An array of team numbers to support offline events
   * @return sets the communityUpdates persistent state
   */
  async function getCommunityUpdates(
    notify,
    adHocTeamList,
    ignoreLocalUpdates
  ) {
    if (selectedEvent) {
      if (!loadingRef.current) {
        loadingRef.current = true;
        setLoadingCommunityUpdates(true);
        console.log(
          `Fetching community updates for ${selectedEvent?.value?.name}...`
        );
        try {
          var result = null;
          var teams = [];

          if (
            selectedEvent?.value?.code.includes("OFFLINE") ||
            (cheesyArenaAvailable && useCheesyArena) ||
            useFTCOffline ||
            (selectedEvent?.value?.type?.includes("OffSeason") && !ftcMode)
          ) {
            //Do something with the team list
            if (adHocTeamList && Array.isArray(adHocTeamList)) {
              // https://api.gatool.org/v3/team/172/updates
              // When in FTC Offline mode and user is offline (or manually marked offline), skip fetching community updates
              // Leave cached updates in place so team list can still be used
              if (useFTCOffline && (!isOnline || manualOfflineMode)) {
                console.log("FTC Offline mode: Skipping community updates while offline" + (manualOfflineMode ? " (manual override)" : "") + " - using cached data");
                loadingRef.current = false;
                setLoadingCommunityUpdates(false);
                return;
              } else {
                console.log("Teams List loaded. Update from the Community");
                var adHocTeams = adHocTeamList.map(async (team) => {
                  // Always use event key for demo teams (9970-9999) so edits persist
                  const effectiveTeamNumber = await getEffectiveTeamNumber(
                    team?.teamNumber,
                    selectedEvent?.value?.code ?? null,
                    selectedEvent?.value?.tbaEventKey ?? null
                  );
                  var request = await httpClient.getNoAuth(
                    `/team/${effectiveTeamNumber}/updates`,
                    ftcMode ? ftcBaseURL : undefined
                  );
                  var teamDetails = { teamNumber: team?.teamNumber };
                  if (request.status === 200) {
                    // @ts-ignore
                    var teamUpdate = await request?.json();
                    teamDetails.updates = _.merge(
                      _.cloneDeep(communityUpdateTemplate),
                      teamUpdate?.updates
                    );
                    // {
                    //       ..._.cloneDeep(communityUpdateTemplate),
                    //       ...teamUpdate,
                    //     };
                  } else {
                    teamDetails.updates = [];
                  }

                  return teamDetails;
                });

                await Promise.all(adHocTeams).then(function (values) {
                  teams = values;
                });
              }

              teams = teams.map((team) => {
                team.updates = _.merge(
                  _.cloneDeep(communityUpdateTemplate),
                  team?.updates
                );
                if (!ignoreLocalUpdates) {
                  if (
                    _.findIndex(localUpdates, {
                      teamNumber: team?.teamNumber,
                    }) >= 0
                  ) {
                    team.updates = _.merge(
                      team.updates,
                      _.cloneDeep(
                        localUpdates[
                          _.findIndex(localUpdates, {
                            teamNumber: team?.teamNumber,
                          })
                        ].update
                      )
                    );
                  }
                }
                return team;
              });
            } else {
              console.log("no teams loaded yet");
              teams = [];
            }
          } else if (
            !selectedEvent?.value?.code.includes("PRACTICE") &&
            !useFTCOffline
          ) {
            result = await httpClient.getNoAuth(
              `${selectedYear?.value}/communityUpdates/${selectedEvent?.value.code}`,
              ftcMode ? ftcBaseURL : undefined
            );
            if (result.status === 200) {
              // @ts-ignore
              teams = await result.json();
              // Ensure teamNumber is a number for consistency with teamList
              teams = teams.map(team => ({
                ...team,
                teamNumber: typeof team.teamNumber === 'string' ? parseInt(team.teamNumber) : team.teamNumber
              }));

              // Demo teams (9970-9999) are always keyed by event in the API. Always fetch their
              // community updates from the event-prefixed endpoint so edits don't get overwritten by bulk data.
              const demoTeamNumbers = new Set();
              const collectDemoTeams = (scheduleObj) => {
                const matchList = Array.isArray(scheduleObj) ? scheduleObj : (scheduleObj?.schedule ?? []);
                const arr = Array.isArray(matchList) ? matchList : (matchList?.schedule ?? []) || [];
                arr.forEach((match) => {
                  const list = match?.teams ?? match?.schedule?.teams ?? [];
                  (Array.isArray(list) ? list : []).forEach((t) => {
                    const num = t?.teamNumber;
                    if (num != null && num >= 9970 && num <= 9999) demoTeamNumbers.add(num);
                  });
                });
              };
              collectDemoTeams(qualSchedule?.schedule ?? qualSchedule);
              collectDemoTeams(playoffSchedule?.schedule ?? playoffSchedule);
              (teamList?.teams ?? []).forEach((t) => {
                const num = t?.teamNumber;
                if (num != null && num >= 9970 && num <= 9999) demoTeamNumbers.add(num);
              });
              // Remove any demo teams from bulk response so we always use event-keyed data for them
              const isDemoTeam = (n) => n >= 9970 && n <= 9999;
              teams = (teams || []).filter((t) => !isDemoTeam(t.teamNumber));
              if (demoTeamNumbers.size > 0) {
                const eventCode = selectedEvent?.value?.code ?? null;
                const tbaKey = selectedEvent?.value?.tbaEventKey ?? null;
                const demoUpdates = await Promise.all(
                  [...demoTeamNumbers].map(async (teamNumber) => {
                    const effectiveTeamNumber = await getEffectiveTeamNumber(teamNumber, eventCode, tbaKey);
                    const request = await httpClient.getNoAuth(
                      `/team/${effectiveTeamNumber}/updates`,
                      ftcMode ? ftcBaseURL : undefined
                    );
                    const teamDetails = { teamNumber };
                    if (request.status === 200) {
                      // httpClient.getNoAuth may return Response or { status, statusText }
                      const teamUpdate =
                        "json" in request && typeof request.json === "function"
                          ? await /** @type { { json: () => Promise<{ updates?: object }> } } */ (request).json()
                          : {};
                      teamDetails.updates = _.merge(
                        _.cloneDeep(communityUpdateTemplate),
                        teamUpdate?.updates ?? {}
                      );
                    } else {
                      teamDetails.updates = _.cloneDeep(communityUpdateTemplate);
                    }
                    return teamDetails;
                  })
                );
                teams = (teams || []).concat(demoUpdates);
              }
            } else {
              setCommunityUpdates([]);
              loadingRef.current = false;
              setLoadingCommunityUpdates(false);
              return;
            }
          } else {
            teams = training.teams.communityUpdates;
          }

          if (teams?.length > 0) {
            teams = teams.map((team) => {
              team.updates = _.merge(
                _.cloneDeep(communityUpdateTemplate),
                team?.updates
              );
              if (
                !ignoreLocalUpdates &&
                _.findIndex(localUpdates, { teamNumber: team?.teamNumber }) >= 0
              ) {
                team.updates = _.merge(
                  team.updates,
                  _.cloneDeep(
                    localUpdates[
                      _.findIndex(localUpdates, { teamNumber: team?.teamNumber })
                    ].update
                  )
                );
              }
              return team;
            });
            //handle EI teams
            if (EITeams?.length > 0) {
              console.log(
                "EI Teams present. Fetching updates from the Community"
              );
              //get updates for these teams
              var EIUpdates = EITeams.map(async (EITeam) => {
                var request = await httpClient.getNoAuth(
                  `/team/${EITeam?.teamNumber}/updates`,
                  ftcMode ? ftcBaseURL : undefined
                );
                var teamDetails = { teamNumber: EITeam?.teamNumber };
                if (request?.status === 200) {
                  // @ts-ignore
                  var teamUpdate = await request.json();
                  teamDetails.updates = {
                    ..._.cloneDeep(communityUpdateTemplate),
                    ...teamUpdate,
                  };
                } else {
                  teamDetails.updates = [];
                }
                return teamDetails;
              });

              await Promise.all(EIUpdates).then((values) => {
                teams = _.concat(teams, values);
              });
              teams.lastUpdate = moment().format();
              if (notify) {
                toast.success(
                  `Your team data is now up to date including EI teams.`
                );
              }
              setCommunityUpdates(teams);
              loadingRef.current = false;
              setLoadingCommunityUpdates(false);
            } else {
              teams.lastUpdate = moment().format();
              if (notify) {
                toast.success(`Your team data is now up to date.`);
              }
              setCommunityUpdates(teams);
              loadingRef.current = false;
              setLoadingCommunityUpdates(false);
            }
          } else {
            loadingRef.current = false;
            setLoadingCommunityUpdates(false);
          }
        } catch (error) {
          console.error(`Error fetching community updates:`, error);
          setCommunityUpdates([]);
          loadingRef.current = false;
          setLoadingCommunityUpdates(false);
        }
      }
    }
  }

  // Retrieve Community Updates when the team list changes
  useEffect(() => {
    if (
      teamList?.teams?.length > 0 &&
      !loadingRef.current &&
      !selectedEvent?.value?.code.includes("OFFLINE")
    ) {
      if (selectedEvent) {
        console.log("Team list changed. Fetching Community Updates.");
        if (ftcMode?.value === "FTCLocal") {
          getCommunityUpdates(false, teamList?.teams);
        } else if (selectedEvent?.value?.type?.includes("OffSeason") && !ftcMode) {
          getCommunityUpdates(false, teamList?.teams);
        } else {
          getCommunityUpdates();
        }
      } else {
        console.log(`No event loaded. Skipping...`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [httpClient, teamList]);

  return {
    communityUpdates,
    setCommunityUpdates,
    getCommunityUpdates,
    loadingCommunityUpdates,
    setLoadingCommunityUpdates,
  };
}
