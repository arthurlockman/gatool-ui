import _ from "lodash";
import moment from "moment";
import calculateBlueBanners from "../utils/calculateBlueBanners";

const ftcBaseURL = "https://api.gatool.org/ftc/v2/";

/**
 * Trims whitespace from each element in an array.
 * @param {string[]} arr
 * @returns {string[]|null}
 */
function trimArray(arr) {
  if (arr) {
    for (var i = 0; i <= arr.length - 1; i++) {
      arr[i] = arr[i].trim();
    }
    return arr;
  }
  return null;
}

/**
 * Determines whether an award name deserves special highlighting.
 * @param {string} awardName
 * @returns {boolean}
 */
function awardsHilight(awardName) {
  if (
    awardName === "District Chairman's Award" ||
    awardName === "District Event Winner" ||
    awardName === "District Event Finalist" ||
    awardName === "Regional Engineering Inspiration Award" ||
    awardName === "District Engineering Inspiration Award" ||
    awardName === "Engineering Inspiration Award" ||
    awardName === "District Championship Finalist" ||
    awardName === "District Championship Winner" ||
    awardName === "Regional Winners" ||
    awardName === "Regional Finalists" ||
    awardName === "Regional Chairman's Award" ||
    awardName === "FIRST Dean's List Finalist Award" ||
    awardName === "District Championship Dean's List Semi-Finalist" ||
    awardName === "Championship Subdivision Winner" ||
    awardName === "Championship Subdivision Finalist" ||
    awardName === "Championship Division Winner" ||
    awardName === "Championship Division Finalist" ||
    awardName === "Championship Winner" ||
    awardName === "Championship Finalist" ||
    awardName === "Chairman's Award" ||
    awardName === "Chairman's Award Finalist" ||
    awardName === "FIRST Dean's List Award" ||
    awardName === "Woodie Flowers Award" ||
    awardName === "Woodie Flowers Finalist Award" ||
    awardName === "Innovation Challenge Winner" ||
    awardName === "Innovation Challenge Finalist" ||
    awardName === "FIRST Impact Award" ||
    awardName === "FIRST Impact Award Finalist" ||
    awardName === "District FIRST Impact Award" ||
    awardName === "Regional FIRST Impact Award" ||
    awardName === "Inspire Award" ||
    awardName.includes("Winning Alliance") ||
    awardName === "Think Award" ||
    awardName === "Dean's List Winner" ||
    awardName === "Compass Award" ||
    awardName === "Volunteer Award"
  ) {
    return true;
  } else {
    return false;
  }
}

/**
 * Reshapes an FTC Offline server team record into the standard team shape.
 * @param {object} teamDetails
 * @returns {object}
 */
function conformFTCOfflineTeam(teamDetails) {
  return {
    teamNumber: teamDetails?.number,
    displayTeamNumber: `${teamDetails?.number}`,
    nameFull: teamDetails?.school,
    nameShort: teamDetails?.name,
    schoolName: null,
    city: teamDetails?.city,
    stateProv: teamDetails?.state,
    country: teamDetails?.country,
    website: null,
    rookieYear: teamDetails?.rookie,
    robotName: null,
    districtCode: null,
    homeCMP: null,
    homeRegion: null,
    displayLocation: `${teamDetails?.city}, ${teamDetails?.state}, ${teamDetails?.country}`,
  };
}

/**
 * useTeamData — domain hook that owns team-data fetch functions.
 *
 * State ownership stays in App.jsx (passed in via deps). This hook owns
 * only functions: getTeamList, getEPA, getEPAFTC, getRobotImages,
 * getRegionalEventDetail, fetchTeamRemappings, and resetTeamDataState.
 *
 * @param {object} deps — state + setters + read-only env values from App.jsx
 * @param {object} [opts] — optional epoch guard / inflight tracker from provider
 * @param {object} [opts.epochGuard] — stale-response guard for getTeamList
 */
export function useTeamData(deps, opts = {}) {
  const { epochGuard } = opts;

  const {
    // State + setters (owned by App.jsx)
    teamList,
    setTeamList,
    teamListLoading,
    setTeamListLoading,
    setTeamRemappings,
    setRobotImages,
    setEPA,
    setHaveChampsTeams,
    setEITeams,
    setRegionalEventDetail,
    // Read-only environment
    httpClient,
    selectedEvent,
    selectedYear,
    ftcMode,
    isOnline,
    manualOfflineMode,
    useFTCOffline,
    FTCServerURL,
    FTCKey,
    cheesyArenaAvailable,
    useCheesyArena,
    events,
    showBlueBanners,
    showDistrictChampsStats,
    showChampsStatsAtDistrictRegional,
    playoffOnly,
    champsStyle,
    eventnames,
    halloffame,
    specialAwards,
    training,
    // Narrow callbacks (avoid passing raw setters for cross-concerns)
    requestCommunityUpdatesForTeams,
    patchSelectedEvent,
  } = deps;

  /**
   * Fetches TBA teams for an offseason event.
   */
  async function fetchTBATeams(tbaEventKey, year) {
    try {
      console.log(`Fetching TBA teams for event: ${tbaEventKey}`);
      const result = await httpClient.getNoAuth(
        `${year}/offseason/teams/${tbaEventKey}`
      );
      if (result.status === 200) {
        // @ts-ignore
        const teams = await result.json();
        return teams;
      }
      return [];
    } catch (error) {
      console.error("Error fetching TBA teams:", error);
      return [];
    }
  }

  /**
   * Fetches team remappings for a TBA offseason event and sets state.
   */
  async function fetchTeamRemappings(tbaEventKey, year) {
    try {
      const result = await httpClient.getNoAuth(
        `${year}/offseason/event/${tbaEventKey}`
      );
      if (result.status === 200) {
        // @ts-ignore
        const eventData = await result.json();
        const remappedTeams = eventData?.remapTeams ?? null;
        if (remappedTeams == null || typeof remappedTeams !== "object") {
          return null;
        }
        const keys = Object.keys(remappedTeams);
        const remappedTeamsObject = { numbers: {}, strings: {} };
        keys.forEach((key) => {
          remappedTeamsObject.numbers[key.replace("frc", "")] =
            remappedTeams[key].replace("frc", "");
          remappedTeamsObject.strings[remappedTeams[key].replace("frc", "")] =
            key.replace("frc", "");
        });
        return remappedTeamsObject;
      }
      return null;
    } catch (error) {
      console.error("Error fetching team remappings:", error);
      return null;
    }
  }

  /**
   * Fetches the team list for the currently selected event.
   * This is the largest function — handles 5 data source branches,
   * sponsor parsing, awards, championship history, and blue banners.
   *
   * @param {number[]|undefined} adHocTeamList - Optional list of team numbers
   *   (used by world champs, offline, and Cheesy Arena modes)
   */
  async function getTeamList(adHocTeamList) {
    if (
      (teamListLoading === "" ||
        teamListLoading !== selectedEvent?.value?.name) &&
      (selectedEvent?.value?.code !== "OFFLINE" || adHocTeamList)
    ) {
      console.log(`Fetching team list for ${selectedEvent?.value?.name}...`);
      setTeamListLoading(selectedEvent?.value?.name);

      // Epoch guard: capture a token so we can detect if a newer fetch superseded us
      const epoch = epochGuard?.next();

      var result = null;
      var teams = {
        teamCountTotal: adHocTeamList?.length || 0,
        teamCountPage: 1,
        pageCurrent: 1,
        pageTotal: 1,
        teams: [],
      };

      // --- Data source selection ---
      const isWorldChamps = selectedEvent?.value?.champLevel === "CHAMPS";

      if (
        selectedEvent?.value?.code.includes("OFFLINE") ||
        (isWorldChamps && !ftcMode) ||
        (cheesyArenaAvailable && useCheesyArena)
      ) {
        if (adHocTeamList) {
          var adHocTeams = adHocTeamList.map(async (team) => {
            var request = await httpClient.getNoAuth(
              `${selectedYear?.value}/teams?teamNumber=${team}`,
              ftcMode ? ftcBaseURL : undefined
            );

            if (request.status === 200) {
              // @ts-ignore
              const teamDetails = await request.json();
              return teamDetails.teams[0];
            } else if (request.status === 400) {
              return {
                teamNumber: team,
                displayTeamNumber: `${team}`,
                nameFull: `Team ${team}`,
                nameShort: `Team ${team}`,
                schoolName: null,
                city: "Unknown",
                stateProv: "Unknown",
                country: "Unknown",
                website: null,
                rookieYear: null,
                robotName: null,
                districtCode: null,
                homeCMP: null,
                homeRegion: null,
                displayLocation: "Unknown",
              };
            } else {
              return undefined;
            }
          });

          await Promise.all(adHocTeams).then(function (values) {
            console.log(
              `Fetching community updates for ${selectedEvent?.value?.name} from getTeamList`
            );
            teams.lastUpdate = moment().format();
            teams.teams = _.filter(values, (n) => {
              return n ? true : false;
            });
            requestCommunityUpdatesForTeams?.(teams);
          });
        }
      } else if (
        !selectedEvent?.value?.code.includes("PRACTICE") &&
        !useFTCOffline &&
        selectedEvent?.value?.type !== "OffSeason"
      ) {
        // get the team list from FIRST API
        result = await httpClient.getNoAuth(
          `${selectedYear?.value}/teams?eventCode=${selectedEvent?.value?.code}`,
          ftcMode ? ftcBaseURL : undefined
        );
        if (result.status === 200) {
          // @ts-ignore
          teams = await result.json();
        }
      } else if (
        !selectedEvent?.value?.code.includes("PRACTICE") &&
        selectedEvent?.value?.type === "OffSeason" &&
        !useFTCOffline &&
        !ftcMode
      ) {
        // get the team list from TBA via gatool Offseason API
        console.log("Using TBA for Offseason Event Team List");
        const eventKey = selectedEvent?.value?.tbaEventKey;

        if (!eventKey) {
          console.log("No TBA event key available for this offseason event");
        }

        if (eventKey) {
          const tbaTeams = await fetchTBATeams(
            eventKey,
            selectedYear?.value
          );

          if (tbaTeams && tbaTeams?.teams?.length > 0) {
            teams = {
              ...tbaTeams,
              lastUpdate: moment().format(),
            };
          }
        }
      } else if (useFTCOffline) {
        // get the team list from the FTC Offline API
        const val = await httpClient.getNoAuth(
          `/api/v1/events/${selectedEvent?.value?.code}/teams/`,
          FTCServerURL,
          undefined,
          { Authorization: FTCKey?.key || "" }
        );
        if (val.status === 200) {
          // @ts-ignore
          result = await val.json();
          if (result?.teamNumbers.length > 0) {
            let ftcTeams = result.teamNumbers.map(async (team) => {
              const val = await httpClient.getNoAuth(
                `/api/v1/events/${selectedEvent?.value?.code}/teams/${team}/`,
                FTCServerURL,
                undefined,
                { Authorization: FTCKey?.key || "" }
              );
              if (val.status === 200) {
                // @ts-ignore
                const teamDetails = await val.json();
                return conformFTCOfflineTeam(teamDetails);
              }
            });
            await Promise.all(ftcTeams).then((values) => {
              teams.lastUpdate = moment().format();
              teams.teams = values;
              teams.teamCountTotal = values.length;
            });
          }
        }
      } else {
        teams = training.teams.teams;
      }

      // --- Normalize Teams vs teams key ---
      if (typeof teams.Teams !== "undefined") {
        teams.teams = teams.Teams;
        delete teams.Teams;
      }

      // --- District EI/RAS enrichment ---
      var districtEvents = null;
      if (
        events &&
        (selectedEvent?.value?.type === "DistrictChampionship" ||
          selectedEvent?.value?.type === "DistrictChampionshipWithLevels")
      ) {
        districtEvents = _.filter(events, {
          value: { districtCode: selectedEvent?.value?.districtCode },
        });
        var districtEITeams = districtEvents.map(async (event) => {
          try {
            var request = await httpClient.getNoAuth(
              `${selectedYear?.value}/awards/event/${event?.value?.code}`,
              ftcMode ? ftcBaseURL : undefined
            );
            if (request.status === 200) {
              // @ts-ignore
              var eventDetails = await request.json();
              return _.filter(eventDetails?.awards, (award) => {
                return award.awardId === 633 || award.awardId === 417;
              });
            }
            return [];
          } catch (error) {
            console.error(
              `Error fetching awards for event ${event?.value?.code}:`,
              error
            );
            return [];
          }
        });

        await Promise.all(districtEITeams).then(async function (values) {
          var tempTeams = [];
          values.forEach((value) => {
            // @ts-ignore
            if (value && Array.isArray(value) && value[0]?.teamNumber) {
              if (
                _.findIndex(teams.teams, {
                  teamNumber: value[0]?.teamNumber,
                }) < 0
              ) {
                // @ts-ignore
                tempTeams.push(value[0]?.teamNumber);
              }
            }
          });
          if (tempTeams.length > 0) {
            var EITeamData = tempTeams.map(async (teamNumber) => {
              var request = await httpClient.getNoAuth(
                `${selectedYear?.value}/teams?teamNumber=${teamNumber}`,
                ftcMode ? ftcBaseURL : undefined
              );
              if (request.status === 200) {
                // @ts-ignore
                var teamDetails = await request.json();
                return teamDetails.teams[0];
              }
              if (request.status === 400) {
                return {
                  teamNumber: teamNumber,
                  displayTeamNumber: `${teamNumber}`,
                  nameFull: `Team ${teamNumber}`,
                  nameShort: `Team ${teamNumber}`,
                  schoolName: null,
                  city: "Unknown",
                  stateProv: "Unknown",
                  country: "Unknown",
                  website: null,
                  rookieYear: null,
                  robotName: null,
                  districtCode: null,
                  homeCMP: null,
                  homeRegion: null,
                  displayLocation: "Unknown",
                };
              } else {
                return undefined;
              }
            });

            await Promise.all(EITeamData).then((values) => {
              if (values.length > 0) {
                setEITeams(
                  _.filter(values, (value) => {
                    return value ? true : false;
                  })
                );
                values.forEach((value) => {
                  teams.teams.push(value);
                });
                teams.teams = _.sortBy(teams.teams, ["teamNumber"]);
              }
            });
          }
        });
      }

      // --- Sponsor name parsing ---
      var teamListSponsorsFixed = teams?.teams?.map((teamRow) => {
        var sponsors = {
          organization: "",
          sponsors: "",
          topSponsors: "",
          topSponsor: "",
          sponsorsRaw: teamRow.nameFull,
          sponsorArray: [],
          topSponsorsArray: [],
          organizationArray: [],
          lastSponsor: "",
        };

        if (teamRow.schoolName) {
          sponsors.organization = teamRow.schoolName;
          if (sponsors.organization === sponsors.sponsorsRaw) {
            sponsors.sponsorArray[0] = sponsors.sponsorsRaw;
          } else {
            sponsors.sponsorArray = trimArray(sponsors.sponsorsRaw.split("/"));
            sponsors.sponsorArray.push(
              sponsors.sponsorArray.pop().split("&")[0]
            );
          }
        } else {
          sponsors.sponsorArray = trimArray(teamRow?.nameFull?.split("/"));
        }

        sponsors.organizationArray = trimArray(
          teamRow?.nameFull?.split("/").pop().split("&")
        );

        if (
          !sponsors.sponsorArray &&
          !sponsors?.organizationArray &&
          !sponsors?.organization
        ) {
          sponsors.organization = "No organization in TIMS";
          sponsors.sponsors = "No sponsors in TIMS";
          sponsors.topSponsorsArray[0] = sponsors.sponsors;
        }

        if (sponsors?.sponsorArray?.length === 1) {
          sponsors.sponsors = sponsors.sponsorArray[0];
          sponsors.topSponsors = sponsors.sponsors;
          sponsors.topSponsor = sponsors.sponsors;
        } else {
          if (
            sponsors?.organizationArray?.length > 1 &&
            !sponsors?.organization
          ) {
            sponsors.sponsorArray.pop();
            sponsors.sponsorArray.push(
              sponsors.organizationArray.slice(0).shift()
            );
          }
          if (sponsors?.sponsorArray) {
            sponsors.topSponsorsArray = sponsors.sponsorArray.slice(0, 5);
          }
          sponsors.topSponsorsArrayUnchanged = sponsors.topSponsorsArray;
          if (sponsors.sponsorArray) {
            sponsors.lastSponsor = sponsors.sponsorArray.pop();
            sponsors.sponsors = sponsors.sponsorArray.join(", ");
            if (sponsors.lastSponso) {
              sponsors.sponsors += " & " + sponsors.lastSponsor;
            }
            sponsors.lastSponsor = sponsors.topSponsorsArray.pop();
            sponsors.topSponsors = sponsors.topSponsorsArray.join(", ");
            sponsors.topSponsors += " & " + sponsors.lastSponsor;
            sponsors.topSponsor = sponsors.topSponsorsArrayUnchanged[0];
          }
        }

        if (
          sponsors?.organizationArray?.length === 1 &&
          !sponsors?.organization
        ) {
          sponsors.organization = sponsors.organizationArray[0];
        } else {
          if (!sponsors?.organization) {
            sponsors.organizationArray.shift();
            sponsors.organization = sponsors.organizationArray.join(" & ");
          }
        }

        teamRow.sponsors = sponsors?.sponsors;
        teamRow.topSponsors = sponsors?.topSponsors;
        teamRow.topSponsorsArray = sponsors?.topSponsorsArrayUnchanged;
        teamRow.topSponsor = sponsors.topSponsor;
        teamRow.organization = sponsors?.organization;
        return teamRow;
      });

      teams.teams = teamListSponsorsFixed;

      // --- Awards fetching + merging ---
      var newTeams = teams.teams.map((team) => {
        const awards =
          team.awards && typeof team.awards === "object" ? team.awards : {};
        return {
          ...team,
          awards: awards,
        };
      });

      if (useFTCOffline && (!isOnline || manualOfflineMode)) {
        console.log(
          "FTC Offline mode: Skipping queryAwards API call while offline" +
            (manualOfflineMode ? " (manual override)" : "") +
            " - using cached awards"
        );
      } else if (teams?.teams.length > 0) {
        try {
          const teamNumbers = teams.teams.map((t) => t?.teamNumber);
          const baseURL = ftcMode ? ftcBaseURL : undefined;

          var req = await httpClient.postNoAuth(
            `${selectedYear?.value}/queryAwards`,
            {
              teams: teamNumbers,
            },
            baseURL
          );

          if (req.status === 200) {
            // @ts-ignore
            var awards = await req.json();

            newTeams = teams.teams.map((team) => {
              const teamNum = team?.teamNumber;
              const teamAwards =
                awards[`${teamNum}`] ||
                awards[teamNum] ||
                awards[String(teamNum)] ||
                {};

              return {
                ...team,
                awards: teamAwards,
              };
            });

            const teamsWithAwards = newTeams.filter(
              (t) => t.awards && Object.keys(t.awards).length > 0
            ).length;
            if (teamsWithAwards > 0) {
              console.log(
                `Awards loaded: ${teamsWithAwards} of ${newTeams.length} teams have awards data`
              );
            }
          } else {
            console.warn(
              `Awards API returned status ${req.status} for event ${selectedEvent?.value?.code}, using teams without awards update`
            );
          }
        } catch (error) {
          console.error(
            `Error fetching awards for event ${selectedEvent?.value?.code}:`,
            error
          );
        }
      }

      // --- Awards formatting + Hall of Fame ---
      var formattedAwards = newTeams.map((team) => {
        try {
          // Add in special awards not reported by FIRST APIs
          for (var index = 0; index < 3; index++) {
            const targetYear = parseInt(selectedYear?.value) - index;
            let items = specialAwards.filter(
              (item) => item.Year === targetYear
            );
            if (items.length > 0) {
              let teamAwards = items[0].awards.filter(
                (item) => item.teamNumber === team.teamNumber
              );
              if (teamAwards.length > 0) {
                const yearKey = `${selectedYear?.value - index}`;
                if (!team.awards[yearKey]) {
                  team.awards[yearKey] = { awards: [] };
                }
                if (!team.awards[yearKey].awards) {
                  team.awards[yearKey].awards = [];
                }
                team.awards[yearKey].awards = _.concat(
                  team.awards[yearKey].awards,
                  teamAwards
                );
              }
            }
          }
          var awardYears = Object.keys(team?.awards || {});

          awardYears?.forEach((year) => {
            const yearKey = `${year}`;
            const yearAwards = team?.awards[yearKey];

            if (yearAwards !== null && yearAwards !== undefined) {
              if (!yearAwards.awards || !Array.isArray(yearAwards.awards)) {
                team.awards[yearKey] = {
                  awards: Array.isArray(yearAwards) ? yearAwards : [],
                };
              } else {
                team.awards[yearKey] = {
                  awards: yearAwards.awards,
                };
              }

              if (
                team.awards[yearKey].awards &&
                Array.isArray(team.awards[yearKey].awards)
              ) {
                team.awards[yearKey].awards = team.awards[yearKey].awards.map(
                  (award) => {
                    award.highlight = awardsHilight(award.name);
                    award.eventName = eventnames[`${year}`]
                      ? eventnames[`${year}`][award.eventCode]
                      : award.eventCode;
                    award.year = year;
                    return award;
                  }
                );
              }
            } else {
              team.awards[yearKey] = { awards: [] };
            }
          });
          team.hallOfFame = [];
          _.filter(halloffame, { Chairmans: team.teamNumber }).forEach(
            (award) => {
              team.hallOfFame.push({
                // @ts-ignore
                year: award?.Year,
                // @ts-ignore
                challenge: award?.Challenge,
                type: "chairmans",
              });
            }
          );
          _.filter(halloffame, { Impact: team.teamNumber }).forEach(
            (award) => {
              team.hallOfFame.push({
                // @ts-ignore
                year: award?.Year,
                // @ts-ignore
                challenge: award?.Challenge,
                type: "impact",
              });
            }
          );
          _.filter(halloffame, { Inspire: team.teamNumber }).forEach(
            (award) => {
              team.hallOfFame.push({
                // @ts-ignore
                year: award?.Year,
                // @ts-ignore
                challenge: award?.Challenge,
                type: "inspire",
              });
            }
          );
          _.filter(halloffame, { Winner1: team.teamNumber }).forEach(
            (award) => {
              team.hallOfFame.push({
                // @ts-ignore
                year: award.Year,
                // @ts-ignore
                challenge: award.Challenge,
                type: "winner",
              });
            }
          );
          _.filter(halloffame, { Winner2: team.teamNumber }).forEach(
            (award) => {
              team.hallOfFame.push({
                // @ts-ignore
                year: award.Year,
                // @ts-ignore
                challenge: award.Challenge,
                type: "winner",
              });
            }
          );
          _.filter(halloffame, { Winner3: team.teamNumber }).forEach(
            (award) => {
              team.hallOfFame.push({
                // @ts-ignore
                year: award?.Year,
                // @ts-ignore
                challenge: award?.Challenge,
                type: "winner",
              });
            }
          );
          _.filter(halloffame, { Winner4: team.teamNumber }).forEach(
            (award) => {
              team.hallOfFame.push({
                // @ts-ignore
                year: award.Year,
                // @ts-ignore
                challenge: award.Challenge,
                type: "winner",
              });
            }
          );
          _.filter(halloffame, { Winner5: team.teamNumber }).forEach(
            (award) => {
              team.hallOfFame.push({
                // @ts-ignore
                year: award.Year,
                // @ts-ignore
                challenge: award.Challenge,
                type: "winner",
              });
            }
          );

          team.hallOfFame = _.orderBy(
            team.hallOfFame,
            ["type", "year"],
            ["asc", "asc"]
          );

          return team;
        } catch (error) {
          console.error(
            `Error processing awards for team ${team?.teamNumber}:`,
            error
          );
          return team;
        }
      });

      teams.teams = formattedAwards;

      // --- Championship history + blue banners ---
      var champsTeams = [];
      const shouldFetchChampsData =
        !ftcMode &&
        (selectedEvent?.value?.champLevel !== "" ||
          showDistrictChampsStats === true ||
          showChampsStatsAtDistrictRegional === true ||
          (isOnline && showBlueBanners === true) ||
          (selectedEvent?.value?.code.includes("OFFLINE") &&
            playoffOnly &&
            champsStyle));

      if (shouldFetchChampsData) {
        const teamNumbers = teams.teams.map((t) => t?.teamNumber);
        let historyMap = {};
        try {
          const baseURL = ftcMode ? ftcBaseURL : undefined;
          const historyResult = await httpClient.postNoAuth(
            `${selectedYear?.value}/queryHistory`,
            { teams: teamNumbers },
            baseURL
          );
          if (
            historyResult.status === 200 &&
            historyResult instanceof Response
          ) {
            historyMap = await historyResult.json();
          }
        } catch (e) {
          console.error("Error fetching batch history:", e);
        }

        champsTeams = teams.teams.map((team) => {
          var blueBanners = {
            teamNumber: team?.teamNumber,
            blueBanners: 0,
            blueBannersYears: [],
            regionalBanners: 0,
            regionalBannersYears: [],
            districtBanners: 0,
            districtBannersYears: [],
            FOCBanners: 0,
            FOCBannersYears: [],
            einsteinBanners: 0,
            einsteinBannersYears: [],
            divisionBanners: 0,
            divisionBannersYears: [],
            districtDivisionBanners: 0,
            districtDivisionBannersYears: [],
            districtEinsteinBanners: 0,
            districtEinsteinBannersYears: [],
          };

          try {
            var history = historyMap[String(team?.teamNumber)];
            if (history) {
              var appearances = history?.events;
              var histAwards = history?.awards;
              var champsResult = {
                teamNumber: team?.teamNumber,
                champsAppearances: 0,
                champsAppearancesYears: [],
                einsteinAppearances: 0,
                einsteinAppearancesYears: [],
                districtChampsAppearances: 0,
                districtChampsAppearancesYears: [],
                districtEinsteinAppearances: 0,
                districtEinsteinAppearancesYears: [],
                FOCAppearances: 0,
                FOCAppearancesYears: [],
              };

              if (appearances && Array.isArray(appearances)) {
                appearances.forEach((appearance) => {
                  var timeDifference = moment(appearance?.end_date).diff(
                    moment(),
                    "minutes"
                  );

                  if (appearance.district !== null) {
                    if (
                      (appearance.year >= 2019 &&
                        appearance.district.abbreviation === "ont") ||
                      (appearance.year >= 2017 &&
                        appearance.district.abbreviation === "fim") ||
                      (appearance.year >= 2022 &&
                        appearance.district.abbreviation === "ne") ||
                      (appearance.year >= 2022 &&
                        (appearance.district.abbreviation === "tx" ||
                          appearance.district.abbreviation === "fit"))
                    ) {
                      if (appearance.event_type === 5) {
                        champsResult.districtChampsAppearances += 1;
                        champsResult.districtChampsAppearancesYears.push(
                          appearance.year
                        );
                      }
                      if (
                        appearance.event_type === 2 &&
                        timeDifference < 0
                      ) {
                        champsResult.districtEinsteinAppearances += 1;
                        champsResult.districtEinsteinAppearancesYears.push(
                          appearance.year
                        );
                      }
                    } else {
                      if (appearance.event_type === 2) {
                        champsResult.districtChampsAppearances += 1;
                        champsResult.districtChampsAppearancesYears.push(
                          appearance.year
                        );
                      }
                    }
                  }

                  if (appearance.event_type === 6) {
                    champsResult.FOCAppearances += 1;
                    champsResult.FOCAppearancesYears.push(appearance.year);
                  }
                  if (appearance.year < 2001) {
                    if (appearance.event_type === 4) {
                      champsResult.champsAppearances += 1;
                      champsResult.champsAppearancesYears.push(
                        appearance.year
                      );
                    }
                  } else {
                    if (appearance.event_type === 3) {
                      champsResult.champsAppearances += 1;
                      champsResult.champsAppearancesYears.push(
                        appearance.year
                      );
                    }

                    if (
                      appearance.event_type === 4 &&
                      timeDifference < 0
                    ) {
                      champsResult.einsteinAppearances += 1;
                      champsResult.einsteinAppearancesYears.push(
                        appearance.year
                      );
                    }
                  }
                });
              }

              if (appearances && histAwards) {
                const blueBannerData = calculateBlueBanners(
                  { events: appearances },
                  histAwards
                );
                Object.assign(blueBanners, blueBannerData);
              }

              team.champsAppearances = champsResult;
            }
            team.blueBanners = blueBanners;
            return team;
          } catch (error) {
            console.error(
              `Error processing history for team ${team?.teamNumber}:`,
              error
            );
            team.blueBanners = blueBanners;
            return team;
          }
        });

        teams.lastUpdate = moment().format();
        teams.teams = _.filter(champsTeams, (value) => {
          return value ? true : false;
        });
        teams.teams = _.sortBy(teams.teams, ["teamNumber"]);
        // Epoch guard: discard if a newer fetch has started
        if (epochGuard && !epochGuard.isCurrent(epoch)) {
          console.log("getTeamList: stale response discarded (champs path)");
          setTeamListLoading("");
          return;
        }
        setTeamList(teams);
      } else {
        teams.teams = teams.teams.map((team) => {
          if (!team.blueBanners) {
            team.blueBanners = {
              teamNumber: team?.teamNumber,
              blueBanners: 0,
              blueBannersYears: [],
            };
          }
          return team;
        });
        teams.lastUpdate = moment().format();
        // Epoch guard: discard if a newer fetch has started
        if (epochGuard && !epochGuard.isCurrent(epoch)) {
          console.log("getTeamList: stale response discarded (non-champs path)");
          setTeamListLoading("");
          return;
        }
        setTeamList(teams);
      }

      // --- FTC alliance count detection ---
      if (ftcMode && !selectedEvent.value.allianceCount) {
        var allianceCount = "EightAlliance";
        if (teams.teams.length <= 10) {
          allianceCount = "TwoAlliance";
        } else if (teams.teams.length <= 20) {
          allianceCount = "FourAlliance";
        } else if (teams.teams.length <= 40) {
          allianceCount = "SixAlliance";
        }
        patchSelectedEvent?.((ev) => {
          ev.value.allianceCount = allianceCount;
        });
      }

      setTeamListLoading("");
    } else {
      console.log(
        `Team List for ${selectedEvent?.value?.name} is loading. Skipping...`
      );
    }
  }

  /**
   * Fetches regional championship advancement for all event teams.
   */
  async function getRegionalEventDetail(ranksOverride) {
    if (!selectedYear?.value) return;
    const teamNumbers =
      ranksOverride?.map((r) => r.teamNumber) ??
      teamList?.teams?.map((t) => t.teamNumber) ??
      [];
    if (teamNumbers.length === 0) {
      setRegionalEventDetail(null);
      return;
    }
    try {
      const result = await httpClient.postNoAuth(
        `${selectedYear.value}/queryRegionalTeamDetail`,
        { teams: teamNumbers }
      );
      if (result.status === 200 && result instanceof Response) {
        const data = await result.json();
        const teams = [];
        for (const teamNumber of teamNumbers) {
          const detail = data[String(teamNumber)];
          if (detail && detail.teams && Array.isArray(detail.teams)) {
            teams.push(...detail.teams);
          }
        }
        setRegionalEventDetail({
          season: selectedYear?.value,
          lastUpdate: moment().format(),
          teams,
        });
      } else {
        setRegionalEventDetail(null);
      }
    } catch (e) {
      setRegionalEventDetail(null);
    }
  }

  /**
   * Fetches robot images for the current team list.
   */
  async function getRobotImages() {
    const teams = teamList?.teams;
    if (!teams?.length || !selectedYear?.value) return;
    try {
      const teamNumbers = teams.map((t) => t?.teamNumber);
      const result = await httpClient.postNoAuth(
        `${selectedYear.value}/queryMedia`,
        { teams: teamNumbers }
      );
      if (result.status === 200 && result instanceof Response) {
        const data = await result.json();
        const robotImageList = teams.map((team) => {
          const mediaArray = data[String(team?.teamNumber)] || [];
          const image = _.filter(mediaArray, { type: "imgur" })[0];
          return {
            teamNumber: team?.teamNumber,
            imageUrl: image?.direct_url || null,
          };
        });
        setRobotImages(robotImageList);
      }
    } catch (e) {
      console.error("Error fetching robot images batch:", e);
    }
  }

  /**
   * Fetches EPA (Expected Points Added) data for FRC teams.
   */
  async function getEPA() {
    const teams = teamList?.teams;
    if (!teams?.length || !selectedYear?.value) return;
    try {
      const teamNumbers = teams.map((t) => t?.teamNumber);
      const result = await httpClient.postNoAuth(
        `${selectedYear.value}/queryStatbotics`,
        { teams: teamNumbers }
      );
      if (result.status === 200 && result instanceof Response) {
        const data = await result.json();
        const epaList = teams.map((team) => ({
          teamNumber: team?.teamNumber,
          epa: data[String(team?.teamNumber)] || {},
        }));
        setEPA(epaList);
      }
    } catch (e) {
      console.error("Error fetching EPA batch:", e);
    }
  }

  /**
   * Fetches EPA data for FTC teams from FTCScout.
   */
  async function getEPAFTC() {
    if (useFTCOffline && (!isOnline || manualOfflineMode)) {
      console.log(
        "FTC Offline mode: Skipping FTCScout API calls while offline" +
          (manualOfflineMode ? " (manual override)" : "")
      );
      setEPA([]);
      return;
    }

    var epa = teamList?.teams.map(async (team) => {
      var epaArray = {
        teamNumber: team?.teamNumber,
        epa: {},
        record: {
          wins: 0,
          losses: 0,
          ties: 0,
          qualMatchesPlayed: 0,
          dq: 0,
          eventCount: 0,
        },
      };
      var seasonStats = {
        wins: 0,
        losses: 0,
        ties: 0,
        qualMatchesPlayed: 0,
        dq: 0,
        eventCount: 0,
      };

      var epaData = await httpClient.getNoAuth(
        `${selectedYear?.value}/ftcscout/quick-stats/${team?.teamNumber}`,
        ftcMode ? ftcBaseURL : undefined
      );
      if (epaData.status === 200) {
        // @ts-ignore
        epaArray = await epaData.json();
        var seasonResult = await httpClient.getNoAuth(
          `${selectedYear?.value}/ftcscout/events/${team?.teamNumber}`,
          ftcMode ? ftcBaseURL : undefined
        );
        if (seasonResult.status === 200) {
          // @ts-ignore
          var events = await seasonResult.json();
          events.forEach((event) => {
            if (event?.stats) {
              seasonStats.wins += event.stats.wins || 0;
              seasonStats.losses += event.stats.losses || 0;
              seasonStats.ties += event.stats.ties || 0;
              seasonStats.qualMatchesPlayed +=
                event.stats.qualMatchesPlayed || 0;
              seasonStats.dq += event.stats.dq || 0;
              seasonStats.eventCount +=
                event.stats.qualMatchesPlayed > 0 ? 1 : 0;
            }
          });
        }
      } else if (
        epaData.status === 500 ||
        epaData.status === 408 ||
        epaData.status === 404 ||
        epaData.status === 400
      ) {
        // do nothing
      }
      return {
        teamNumber: team?.teamNumber,
        epa: {
          epa: {
            total_points: {
              mean: Math.round(100 * epaArray?.tot?.value) / 100 || 0,
              sd: 0,
            },
          },
          record: seasonStats,
        },
      };
    });
    if (Array.isArray(epa) && epa.length > 0) {
      Promise.all(epa).then((values) => {
        setEPA(values);
      });
    }
  }

  /**
   * Resets all team data state (used on event change).
   */
  function resetTeamDataState() {
    setTeamList(null);
    setTeamListLoading("");
    setTeamRemappings(null);
    setRobotImages(null);
    setEPA(null);
    setHaveChampsTeams(false);
    setEITeams([]);
    setRegionalEventDetail(null);
  }

  return {
    getTeamList,
    getEPA,
    getEPAFTC,
    getRobotImages,
    getRegionalEventDetail,
    fetchTeamRemappings,
    resetTeamDataState,
  };
}
