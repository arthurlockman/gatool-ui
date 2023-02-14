import MainNavigation from './components/MainNavigation';
import BottomNavigation from './components/BottomNavigation'
import { Outlet, Route, Routes } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import SetupPage from './pages/SetupPage';
import SchedulePage from './pages/SchedulePage';
import TeamDataPage from './pages/TeamDataPage';
import RanksPage from './pages/RanksPage';
import AnnouncePage from './pages/AnnouncePage';
import PlayByPlayPage from './pages/PlayByPlayPage';
import AllianceSelectionPage from './pages/AllianceSelectionPage';
import AwardsPage from './pages/AwardsPage';
import StatsPage from './pages/StatsPage';
import CheatsheetPage from './pages/CheatsheetPage';
import EmceePage from './pages/EmceePage';
import HelpPage from './pages/HelpPage';
import { useEffect, useState } from 'react';
import { UseAuthClient } from './contextProviders/AuthClientContext';
import { useAuth0 } from '@auth0/auth0-react';
import AnonymousUserPage from './pages/AnonymousUserPage';
import { Blocks } from 'react-loader-spinner';
import { Container } from 'react-bootstrap';
import { usePersistentState } from './hooks/UsePersistentState';
import _ from 'lodash';
import moment from 'moment';
import Developer from './pages/Developer';
import { eventNames, specialAwards, hallOfFame, champs, champDivisions, champSubdivisions, miChamps, miDivisions } from './components/Constants';
import { useOnlineStatus } from './contextProviders/OnlineContext';
import { toast } from 'react-toastify';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

export const TabStates = {
  NotReady: 'notready',
  Stale: 'stale',
  Ready: 'ready'
};

// Tiebreakers
// Order Sort
// Criteria 2023 need to revisit once we see the data
// 1st Cumulative TECH FOUL points due to opponent rule violations
// 2nd ALLIANCE CHARGE STATION points 
// 3rd ALLIANCE AUTO points
// 4th MATCH is replayed
const playoffTiebreakers = {
  "2033": ["foulPoints", "chargeStationPoints", "autoPoints"], // Update after rules release
  "2022": ["foulPoints", "endgamePoints", "autoCargoTotal+autoTaxiPoints"],
  "2021": ["foulPoints", "autoPoints", "endgamePoints", "controlPanelPoints+teleopCellPoints"],
  "2020": ["foulPoints", "autoPoints", "endgamePoints", "controlPanelPoints+teleopCellPoints"],
  "2019": ["foulPoints", "cargoPoints", "hatchPanelPoints", "habClimbPoints", "sandStormBonusPoints"],
  "2018": ["foulPoints", "endgamePoints", "autoPoints", "autoOwnershipPoints+teleopOwnershipPoints", "vaultPoints"]
};

const paleYellow = "#fdfaed";
const paleBlue = "#effdff";

function LayoutsWithNavbar({ scheduleTabReady, teamDataTabReady, ranksTabReady, statsTabReady, allianceSelectionReady, playoffs }) {
  return (
    <>
      <MainNavigation scheduleTabReady={scheduleTabReady} teamDataTabReady={teamDataTabReady} ranksTabReady={ranksTabReady} statsTabReady={statsTabReady} allianceSelectionReady={allianceSelectionReady} playoffs={playoffs} />
      <Outlet />
      <BottomNavigation />
    </>
  );
}

const champsEvents = _.clone(champs);
const divisions = _.clone(champDivisions);
const subdivisions = _.clone(champSubdivisions);
const michamps = _.clone(miChamps);
const midivisions = _.clone(miDivisions);

function App() {
  const { isAuthenticated, isLoading } = useAuth0();

  // eslint-disable-next-line no-unused-vars
  const [httpClient] = UseAuthClient();
  const [selectedEvent, setSelectedEvent] = usePersistentState("setting:selectedEvent", null);
  const [selectedYear, setSelectedYear] = usePersistentState("setting:selectedYear", null);
  const [events, setEvents] = usePersistentState("cache:events", []);
  const [playoffSchedule, setPlayoffSchedule] = usePersistentState("cache:playoffSchedule", null);
  const [qualSchedule, setQualSchedule] = usePersistentState("cache:qualSchedule", null);
  const [teamList, setTeamList] = usePersistentState("cache:teamList", null);
  const [rankings, setRankings] = usePersistentState("cache:rankings", null);
  const [alliances, setAlliances] = usePersistentState("cache:alliances", null);
  const [communityUpdates, setCommunityUpdates] = usePersistentState("cache:communityUpdates", null);
  const [eventFilters, setEventFilters] = usePersistentState("cache:eventFilters", []);
  const [timeFilter, setTimeFilter] = usePersistentState("cache:timeFilter", null);
  const [timeFormat, setTimeFormat] = usePersistentState("cache:timeFormat", { label: "12hr", value: "h:mm:ss a" });
  const [showSponsors, setShowSponsors] = usePersistentState("cache:showSponsors", null);
  const [showAwards, setShowAwards] = usePersistentState("cache:showAwards", null);
  const [showNotes, setShowNotes] = usePersistentState("cache:showNotes", null);
  const [showMottoes, setShowMottoes] = usePersistentState("cache:showMottoes", null);
  const [showChampsStats, setShowChampsStats] = usePersistentState("cache:showChampsStats", null);
  const [swapScreen, setSwapScreen] = usePersistentState("cache:swapScreen", null);
  const [autoAdvance, setAutoAdvance] = usePersistentState("cache:autoAdvance", null);
  const [currentMatch, setCurrentMatch] = usePersistentState("cache:currentMatch", null);
  const [awardsMenu, setAwardsMenu] = usePersistentState("cache:awardsMenu", null);
  const [showQualsStats, setShowQualsStats] = usePersistentState("cache:showQualsStats", null);
  const [worldStats, setWorldStats] = usePersistentState("cache:stats", null);
  const [eventHighScores, setEventHighScores] = usePersistentState("cache:eventHighScores", null);
  const [teamReduction, setTeamReduction] = usePersistentState("cache:teamReduction", 0);
  const [allianceSelection, setAllianceSelection] = usePersistentState("cache:allianceSelection", null);
  const [playoffs, setPlayoffs] = usePersistentState("cache:playoffs", null);
  const [playoffCountOverride, setPlayoffCountOverride] = usePersistentState("cache:playoffCountOverride", null);
  const [allianceCount, setAllianceCount] = usePersistentState("cache:allianceCount", null);
  const [lastVisit, setLastVisit] = usePersistentState("cache:lastVisit", {});
  const [localUpdates, setLocalUpdates] = usePersistentState("cache:localUpdates", []);

  // Tab state trackers
  const [scheduleTabReady, setScheduleTabReady] = useState(TabStates.NotReady)
  const [teamDataTabReady, setTeamDataTabReady] = useState(TabStates.NotReady)
  const [ranksTabReady, setRanksTabReady] = useState(TabStates.NotReady)
  const [statsTabReady, setStatsTabReady] = useState(TabStates.NotReady)
  const [allianceSelectionReady, setAllianceSelectionReady] = useState(TabStates.NotReady)

  // Controllers for table sort order at render time
  const [teamSort, setTeamSort] = useState("")
  const [rankSort, setRankSort] = useState("")

  const isOnline = useOnlineStatus()

  // Handle if users are offline. If they're offline but have an event and year selected, let them in.
  const canAccessApp = () => {
    return isOnline ? isAuthenticated : selectedEvent && selectedYear
  }

  function trimArray(arr) {
    for (var i = 0; i <= arr.length - 1; i++) {
      arr[i] = arr[i].trim();
    }
    return arr;
  }

  //functions to retrieve API data

  // This function retrieves a schedule from FIRST. It attempts to get both the Qual and Playoff Schedule and sets the global variables
  async function getSchedule() {
    var highScores = [];

    // returns the winner of the match
    function winner(match) {
      var winner = { winner: "", tieWinner: "", level: 0 }
      if (match?.scoreRedFinal || match?.scoreBlueFinal) {
        if (match?.scoreRedFinal < match?.scoreBlueFinal) {
          winner.winner = "blue";
        } else if (match?.scoreRedFinal > match?.scoreBlueFinal) {
          winner.winner = "red";
        } else if (match?.scoreRedFinal === match?.scoreBlueFinal) {
          winner.winner = "tie";
        }
      } else {
        winner.winner = "TBD";
      }

      return winner;
    }

    //checks to see if the match is a high score
    function isHighScore(match) {
      var tempMatch = {};
      if (!_.isNull(match.scoreRedFinal)) {
        tempMatch.eventName = selectedEvent.label;
        tempMatch.matchName = match?.description;
        if (match?.scoreRedFinal > match?.scoreBlueFinal) {
          tempMatch.alliance = "Red";
          tempMatch.allianceMembers = _.filter(match?.teams, function (o) { return _.startsWith(o.station, tempMatch.alliance) }).map((team) => { return team.teamNumber }).join(" ");
          tempMatch.score = match[`score${tempMatch.alliance}Final`]
        } else if (match?.scoreRedFinal < match?.scoreBlueFinal) {
          tempMatch.alliance = "Blue";
          tempMatch.allianceMembers = _.filter(match?.teams, function (o) { return _.startsWith(o.station, tempMatch.alliance) }).map((team) => { return team.teamNumber }).join(" ");
          tempMatch.score = match[`score${tempMatch.alliance}Final`]
        } else {
          tempMatch.alliance = "Tie";
          tempMatch.allianceMembers = match?.teams.map((team) => { return team.teamNumber }).join(" ");
          tempMatch.score = match.scoreRedFinal
        }

        if (match.level === "Qualification") {
          tempMatch.matchLevel = "qual";
        } else if (match.level === "Playoff") {
          tempMatch.matchLevel = "playoff";
        }

        if (match.scoreRedFoul === match.scoreBlueFoul) {
          if (match.scoreRedFoul > 0) {
            tempMatch.scoreType = "offsetting" + tempMatch.matchLevel;
          } else if (match.scoreRedFoul === 0) {
            tempMatch.scoreType = "penaltyFree" + tempMatch.matchLevel;
          }
        } else {
          tempMatch.scoreType = "overall" + tempMatch.matchLevel;
        }
        // test to see if the match is penalty free and a high score
        if (tempMatch.scoreType.includes("penaltyFree")) {
          if (_.isEmpty(highScores[`penaltyFree${tempMatch.matchLevel}`])) {
            highScores[`penaltyFree${tempMatch.matchLevel}`] = tempMatch;
          } else if (highScores[`penaltyFree${tempMatch.matchLevel}`].score < tempMatch.score) {
            highScores[`penaltyFree${tempMatch.matchLevel}`] = tempMatch;
          }
        }

        //test to see if the match has offsetting penalties and is a high score
        if (tempMatch.scoreType.includes("offsetting")) {
          if (_.isEmpty(highScores[`offsetting${tempMatch.matchLevel}`])) {
            highScores[`offsetting${tempMatch.matchLevel}`] = tempMatch;
          } else if (highScores[`offsetting${tempMatch.matchLevel}`].score < tempMatch.score) {
            highScores[`offsetting${tempMatch.matchLevel}`] = tempMatch;
          }
        }

        //now test against overall high score
        if (_.isEmpty(highScores[`overall${tempMatch.matchLevel}`])) {
          highScores[`overall${tempMatch.matchLevel}`] = tempMatch;
        } else if (highScores[`overall${tempMatch.matchLevel}`].score < tempMatch.score) {
          highScores[`overall${tempMatch.matchLevel}`] = tempMatch;
        }

      }
    }

    setScheduleTabReady(TabStates.NotReady);

    var result = await httpClient.get(`${selectedYear?.value}/schedule/hybrid/${selectedEvent?.value.code}/qual`);
    var qualschedule = await result.json();
    // adds the winner to the schedule.
    if (typeof qualschedule.Schedule !== "undefined") {
      qualschedule.schedule = qualschedule.Schedule;
      delete qualschedule.Schedule;
    }
    var matches = qualschedule?.schedule.map((match) => {
      match.winner = winner(match);
      return match;
    });

    qualschedule.schedule = matches;
    matches.forEach((match) => {
      isHighScore(match);
    })

    var completedMatchCount = 0;

    if (qualschedule?.schedule?.length > 0) {
      completedMatchCount = qualschedule?.schedule?.length - _.filter(qualschedule.schedule, { "postResultTime": null });
    }

    qualschedule.completedMatchCount = completedMatchCount;

    qualschedule.lastUpdate = moment();
    setQualSchedule(qualschedule);

    //get the playoff schedule
    matches = [];
    result = {};
    result = await httpClient.get(`${selectedYear?.value}/schedule/hybrid/${selectedEvent?.value.code}/playoff`);
    var playoffschedule = await result.json();
    if (typeof playoffschedule.Schedule !== "undefined") {
      playoffschedule.schedule = playoffschedule.Schedule;
      delete playoffschedule.Schedule;
    }

    if (playoffschedule?.schedule.length > 0) {
      // adds the winner to the schedule.
      matches = playoffschedule.schedule.map((match) => {
        match.winner = winner(match);
        return match;
      });
      playoffschedule.schedule = matches;
      matches.forEach((match) => {
        isHighScore(match);
      })

      // determine the tiebreaker
      var lastMatchNumber = playoffschedule.schedule[_.findLastIndex(playoffschedule.schedule, function (match) {
        return (match.scoreRedFinal !== null) || (match.scoreBlueFinal !== null)
      })].matchNumber;

      result = await httpClient.get(`${selectedYear?.value}/scores/${selectedEvent?.value.code}/playoff/1/${lastMatchNumber}`);
      var scores = await result.json();

      _.forEach(scores.MatchScores, ((score) => {
        if (score.alliances[0].totalPoints === score.alliances[1].totalPoints) {
          var tiebreaker = {
            level: 0,
            red: 0,
            blue: 0,
            winner: "TBD"
          }
          for (var i = 0; i < playoffTiebreakers[selectedYear?.value].length; i++) {
            tiebreaker.level = i + 1;
            var criterion = playoffTiebreakers[selectedYear?.value][i].split("+");
            for (var a = 0; a < criterion.length; a++) {
              tiebreaker.red += Number(score.alliances[1][criterion[a]]);
              tiebreaker.blue += Number(score.alliances[0][criterion[a]]);
            }
            if (tiebreaker.red > tiebreaker.blue) {
              tiebreaker.winner = "red";
              break;
            } else if (tiebreaker.red < tiebreaker.blue) {
              tiebreaker.winner = "blue";
              break;
            }
          }
          playoffschedule.schedule[_.findIndex(playoffschedule.schedule, { "matchNumber": score.matchNumber })].winner.tieWinner = tiebreaker.winner;
          playoffschedule.schedule[_.findIndex(playoffschedule.schedule, { "matchNumber": score.matchNumber })].winner.level = tiebreaker.level;

        }
      }))
      getAlliances();
    }

    setEventHighScores(highScores);
    playoffschedule.lastUpdate = moment();
    setPlayoffSchedule(playoffschedule);
    if (qualSchedule?.schedule?.length === 0) {
      setScheduleTabReady(TabStates.Stale);
    } else if (qualSchedule?.schedule?.length > 0) {
      setScheduleTabReady(TabStates.Ready);
    } else if ((_.indexOf(champsEvents, selectedEvent?.value?.code) >= 0) && (playoffSchedule.schedule.length > 0)) {
      setScheduleTabReady(TabStates.Ready);
    } else {
      setScheduleTabReady(TabStates.NotReady);
    }

  }

  // This function retrieves a a list of teams for a specific event from FIRST. It parses the list and modifies some of the data to produce more readable content.
  async function getTeamList() {
    function awardsHilight(awardName) {
      if (awardName === "District Chairman's Award" || awardName === "District Event Winner" || awardName === "District Event Finalist" || awardName === "Regional Engineering Inspiration Award" || awardName === "District Engineering Inspiration Award" || awardName === "Engineering Inspiration Award" || awardName === "District Championship Finalist" || awardName === "District Championship Winner" || awardName === "Regional Winners" || awardName === "Regional Finalists" || awardName === "Regional Chairman's Award" || awardName === "FIRST Dean's List Finalist Award" || awardName === "Championship Subdivision Winner" || awardName === "Championship Subdivision Finalist" || awardName === "Championship Division Winner" || awardName === "Championship Division Finalist" || awardName === "Championship Winner" || awardName === "Championship Finalist" || awardName === "Chairman's Award" || awardName === "Chairman's Award Finalist" || awardName === "FIRST Dean's List Award" || awardName === "Woodie Flowers Award" || awardName === "Innovation Challenge Winner" || awardName === "Innovation Challenge Finalist") {
        return true;
      } else {
        return false;
      }
    }

    setTeamDataTabReady(TabStates.NotReady);
    var result = await httpClient.get(`${selectedYear?.value}/teams?eventCode=${selectedEvent?.value.code}`);
    var teams = await result.json();
    if (typeof teams.Teams !== "undefined") {
      teams.teams = teams.Teams;
      delete teams.Teams;
    }

    // Fix the sponsors now that teams are loaded

    // prepare to separate and combine sponsors and organization name
    var teamListSponsorsFixed = teams?.teams?.map((teamRow) => {
      var sponsors = {
        organization: "",
        sponsors: "",
        topSponsors: "",
        sponsorsRaw: teamRow.nameFull,
        sponsorArray: [],
        topSponsorsArray: [],
        organizationArray: [],
        lastSponsor: ""
      };

      if (teamRow.schoolName) {
        sponsors.organization = teamRow.schoolName;
        if (sponsors.organization === sponsors.sponsorsRaw) {
          sponsors.sponsorArray[0] = sponsors.sponsorsRaw
        } else {
          sponsors.sponsorArray = trimArray(sponsors.sponsorsRaw.split("/"));
          sponsors.sponsorArray.push(sponsors.sponsorArray.pop().split("&")[0]);
        }
      } else {
        sponsors.sponsorArray = trimArray(teamRow.nameFull.split("/"))
      }

      sponsors.organizationArray = trimArray(teamRow.nameFull.split("/").pop().split("&"));

      if (!sponsors.sponsorArray && !sponsors.organizationArray && !sponsors.organization) {
        sponsors.organization = "No organization in TIMS";
        sponsors.sponsors = "No sponsors in TIMS";
        sponsors.topSponsorsArray[0] = sponsors.sponsors
      }

      if (sponsors.sponsorArray.length === 1) {
        sponsors.sponsors = sponsors.sponsorArray[0];
        sponsors.topSponsors = sponsors.sponsors
      } else {
        if (sponsors.organizationArray.length > 1 && !sponsors.organization) {
          sponsors.sponsorArray.pop();
          sponsors.sponsorArray.push(sponsors.organizationArray.slice(0).shift())
        }
        sponsors.topSponsorsArray = sponsors.sponsorArray.slice(0, 5);
        sponsors.lastSponsor = sponsors.sponsorArray.pop();
        sponsors.sponsors = sponsors.sponsorArray.join(", ");
        sponsors.sponsors += " & " + sponsors.lastSponsor;
        sponsors.lastSponsor = sponsors.topSponsorsArray.pop();
        sponsors.topSponsors = sponsors.topSponsorsArray.join(", ");
        sponsors.topSponsors += " & " + sponsors.lastSponsor;
      }

      if (sponsors.organizationArray.length === 1 && !sponsors.organization) {
        sponsors.organization = sponsors.organizationArray[0]
      } else {
        if (!sponsors.organization) {
          sponsors.organizationArray.shift();
          sponsors.organization = sponsors.organizationArray.join(" & ")
        }
      }

      teamRow.sponsors = sponsors.sponsors;
      teamRow.topSponsors = sponsors.topSponsors;
      teamRow.organization = sponsors.organization;
      return teamRow;
    })

    teams.teams = teamListSponsorsFixed;

    //fetch awards for the current teams
    var newTeams = teams.teams.map(async team => {
      var request = await httpClient.get(`${selectedYear?.value}/team/${team?.teamNumber}/awards`);
      var awards = await request.json();
      team.awards = awards;
      return team;
    });

    setTeamDataTabReady(TabStates.NotReady);

    Promise.all(newTeams).then(function (values) {

      // Parse awards to ensure we highlight them properly and remove extraneous text i.e. FIRST CHampionship from name
      var formattedAwards = values.map(team => {
        // Add in special awards not reported by FIRST APIs (from 2021 season)
        for (var index = 0; index < 3; index++) {
          const targetYear = (parseInt(selectedYear?.value) - index)
          let items = specialAwards.filter(item => item.Year === targetYear);
          if (items.length > 0) {
            let teamAwards = items[0].awards.filter(item => item.teamNumber === team.teamNumber);
            if (teamAwards.length > 0) {
              team.awards[`${selectedYear?.value - index}`].Awards = _.concat(team.awards[`${selectedYear?.value - index}`].Awards, teamAwards);
            }
          }
        }
        var awardYears = Object.keys(team?.awards);
        var eventnames = _.clone(eventNames);
        var halloffame = _.clone(hallOfFame);

        events.forEach((event) => {
          eventNames[selectedYear?.value][event?.value?.code] = event?.value?.name;
        })
        awardYears?.forEach(year => {
          if (team?.awards[`${year}`] !== null) {
            team.awards[`${year}`].Awards = team?.awards[`${year}`]?.Awards.map(award => {
              award.highlight = awardsHilight(award.name);
              award.eventName = eventnames[`${year}`][award.eventCode];
              award.year = year
              return award;
            })
          } else {
            team.awards[`${year}`] = { "Awards": [] }
          }
        })
        team.hallOfFame = [];
        _.filter(halloffame, { "Chairmans": team.teamNumber }).forEach((award) => {
          team.hallOfFame.push({ "year": award.Year, "challenge": award.Challenge, "type": "chairmans" })
        });
        _.filter(halloffame, { "Winner1": team.teamNumber }).forEach((award) => {
          team.hallOfFame.push({ "year": award.Year, "challenge": award.Challenge, "type": "winner" })
        });
        _.filter(halloffame, { "Winner2": team.teamNumber }).forEach((award) => {
          team.hallOfFame.push({ "year": award.Year, "challenge": award.Challenge, "type": "winner" })
        });
        _.filter(halloffame, { "Winner3": team.teamNumber }).forEach((award) => {
          team.hallOfFame.push({ "year": award.Year, "challenge": award.Challenge, "type": "winner" })
        });
        _.filter(halloffame, { "Winner4": team.teamNumber }).forEach((award) => {
          team.hallOfFame.push({ "year": award.Year, "challenge": award.Challenge, "type": "winner" })
        });
        _.filter(halloffame, { "Winner5": team.teamNumber }).forEach((award) => {
          team.hallOfFame.push({ "year": award.Year, "challenge": award.Challenge, "type": "winner" })
        });

        return team;

      })
      teams.teams = formattedAwards;

      teams.lastUpdate = moment();
      setTeamList(teams);

      if (teams?.teams?.length === 0) {
        setTeamDataTabReady(TabStates.Stale);
      } else if (teams?.teams?.length > 0) {
        setTeamDataTabReady(TabStates.Ready);
      } else {
        setTeamDataTabReady(TabStates.NotReady);
      }



      var champsTeams = [];
      if (selectedEvent?.value?.champLevel !== "") {
        setTeamDataTabReady(TabStates.NotReady);
        champsTeams = teams.teams.map(async team => {
          var champsRequest = await httpClient.get(`/team/${team?.teamNumber}/appearances`);
          var appearances = await champsRequest.json();
          var result = {};
          result.teamNumber = team?.teamNumber;
          result.champsAppearances = 0;
          result.champsAppearancesYears = [];
          result.einsteinAppearances = 0;
          result.einsteinAppearancesYears = [];

          result.districtChampsAppearances = 0;
          result.districtChampsAppearancesYears = [];
          result.districtEinsteinAppearances = 0;
          result.districtEinsteinAppearancesYears = [];
          result.FOCAppearances = 0;
          result.FOCAppearancesYears = [];

          appearances.forEach((appearance) => {
            //check for district code
            //DISTRICT_CMP = 2
            //DISTRICT_CMP_DIVISION = 5
            // Ontario (>=2019), Michigan (>=2017), Texas (>=2022), New England (>=2022),
            // Indiana (>=2022) check for Einstein appearances
            //appearances.district.abbreviation = "ont"
            //appearances.district.abbreviation = "fim"
            // >=2017 check for Division appearance then Champs appearances
            //test for champs prior to 2001
            if (appearance.district !== null) {
              if (((appearance.year >= 2019) && (appearance.district.abbreviation === "ont")) ||
                ((appearance.year >= 2017) && (appearance.district.abbreviation === "fim")) ||
                ((appearance.year >= 2022) && (appearance.district.abbreviation === "ne")) ||
                ((appearance.year >= 2022) && (appearance.district.abbreviation === "in")) ||
                ((appearance.year >= 2022) && (appearance.district.abbreviation === "tx"))) {
                if (appearance.event_type === 5) {
                  result.districtChampsAppearances += 1;
                  result.districtChampsAppearancesYears.push(appearance.year);
                }
                if (appearance.event_type === 2) {
                  result.districtEinsteinAppearances += 1;
                  result.districtEinsteinAppearancesYears.push(appearance.year);
                }
              } else {
                if (appearance.event_type === 2) {
                  result.districtChampsAppearances += 1;
                  result.districtChampsAppearancesYears.push(appearance.year);
                }

              }
            }


            //check for champs Division code
            //CMP_DIVISION = 3
            //CMP_FINALS = 4
            //FOC = 6
            // >=2001 check for Division appearance then Champs appearances
            if (appearance.event_type === 6) {
              result.FOCAppearances += 1;
              result.FOCAppearancesYears.push(appearance.year);
            }
            //test for champs prior to 2001
            if (appearance.year < 2001) {
              if (appearance.event_type === 4) {
                result.champsAppearances += 1;
                result.champsAppearancesYears.push(appearance.year);
              }
            } else {
              if (appearance.event_type === 3) {
                result.champsAppearances += 1;
                result.champsAppearancesYears.push(appearance.year);
              }
              // TO FIX: mapping out this year's Einstein appearances.
              // if (appearance.event_type === 4 && appearance.year < Number(localStorage.currentYear) && inSubdivision()) {
              if (appearance.event_type === 4) {
                result.einsteinAppearances += 1;
                result.einsteinAppearancesYears.push(appearance.year);
              }

            }
          })

          team.champsAppearances = result;
          return team;
        });

        Promise.all(champsTeams).then(function (values) {
          teams.lastUpdate = moment();
          teams.teams = values;
          setTeamList(teams);
          setTeamDataTabReady(TabStates.Ready);
        })
      }
    })
  }

  // This function retrieves communnity updates for a specified event from gatool Cloud.
  async function getCommunityUpdates(notify) {
    setTeamDataTabReady(TabStates.NotReady);
    var result = await httpClient.get(`${selectedYear?.value}/communityUpdates/${selectedEvent?.value.code}`);
    var teams = await result.json();

    teams.lastUpdate = moment();
    if (notify) {
      toast.success(`Your team data is now up to date.`)
    }
    setCommunityUpdates(teams);
    setTeamDataTabReady(TabStates.Ready);
  }

  // This function retrieves the ranking data for a specified event from FIRST.
  async function getRanks() {
    setRanksTabReady(TabStates.NotReady);
    var result = await httpClient.get(`${selectedYear?.value}/rankings/${selectedEvent?.value.code}`);
    var ranks = await result.json();
    if (typeof ranks.Rankings === "undefined") {
      ranks.ranks = ranks.rankings;
      delete ranks.rankings;
    } else {
      ranks.ranks = ranks.Rankings;
      delete ranks.Rankings;
    }


    ranks.lastUpdate = moment();
    setRankings(ranks);
    if (ranks?.ranks?.length === 0) {
      setRanksTabReady(TabStates.Stale);
    } else if (ranks?.ranks?.length > 0) {
      setRanksTabReady(TabStates.Ready);
    } else {
      setRanksTabReady(TabStates.NotReady);
    }

  }

  // This function retrieves the ranking data for a specified event from FIRST.
  async function getWorldStats() {
    setStatsTabReady(TabStates.NotReady);
    var result = await httpClient.get(`${selectedYear?.value}/highscores`);
    var highscores = await result.json();
    var scores = {};
    var reducedScores = {};

    scores.year = selectedYear?.value;
    scores.lastUpdate = moment();


    highscores.forEach((score) => {
      var details = {};
      if (worldStats) {
        details.eventName = eventNames[worldStats?.year][score?.matchData?.event?.eventCode]
      } else {
        details.eventName = score?.matchData?.event?.eventCode;
      }
      details.alliance = _.upperFirst(score?.matchData?.highScoreAlliance);
      details.scoreType = score?.type + score?.level;
      details.matchName = score?.matchData?.match?.description;
      details.allianceMembers = _.filter(score?.matchData?.match?.teams, function (o) { return _.startsWith(o.station, details.alliance) }).map((team) => { return team.teamNumber }).join(" ")
      details.score = score?.matchData?.match[`score${details.alliance}Final`];
      reducedScores[details.scoreType] = details;
    })
    scores.highscores = reducedScores;

    setWorldStats(scores);
    if (!_.isEmpty(scores?.highscores)) {
      setStatsTabReady(TabStates.Ready);
    } else {
      setStatsTabReady(TabStates.NotReady);
    }

  }

  // This function retrieves the Playoff Alliance data for a specified event from FIRST.
  async function getAlliances() {
    var result = await httpClient.get(`${selectedYear?.value}/alliances/${selectedEvent?.value.code}`);
    var alliances = await result.json();
    if (typeof alliances.Alliances !== "undefined") {
      alliances.alliances = alliances.Alliances;
      delete alliances.Alliances;
    }
    var allianceLookup = {};
    alliances.alliances.forEach(alliance => {
      allianceLookup[`${alliance.captain}`] = { role: `Captain`, alliance: `Alliance ${alliance.number}` };
      allianceLookup[`${alliance.round1}`] = { role: `Round 1 Selection`, alliance: `Alliance ${alliance.number}` };
      allianceLookup[`${alliance.round2}`] = { role: `Round 2 Selection`, alliance: `Alliance ${alliance.number}` };
      if (alliance.round3) { allianceLookup[`${alliance.round3}`] = { role: `Round 3 Selection`, alliance: `Alliance ${alliance.number}` }; }
      if (alliance.backup) { allianceLookup[`${alliance.backup}`] = { role: `Backup for ${alliance.backupReplaced}`, alliance: `Alliance ${alliance.number}` }; }
    })
    alliances.Lookup = allianceLookup;

    alliances.lastUpdate = moment();
    setAlliances(alliances);
    if (alliances?.alliances?.length > 0) {
      setPlayoffs(true);
    }
  }

  // This function writes updated team data back to gatool Cloud.
  async function putTeamData(teamNumber, data) {
    var result = await httpClient.put(`team/${teamNumber}/updates`, data);
    return result.ok;
  }

  //update the Alliance Count when conditions change
  useEffect(() => {
    var allianceCountTemp = {};

    if (playoffCountOverride) {
      allianceCountTemp.count = parseInt(playoffCountOverride.value);
    } else if (teamList?.teamCountTotal <= 24) {
      allianceCountTemp.count = Math.floor((teamList?.teamCountTotal - 1) / 3);
    } else {
      allianceCountTemp.count = 8;
    }
    allianceCountTemp.allianceSelectionLength = 2 * allianceCountTemp.count - 1;
    allianceCountTemp.menu = { "value": allianceCountTemp.count, "label": allianceCountTemp.count }
    setAllianceCount(allianceCountTemp);
  }, [playoffCountOverride, teamList, setAllianceCount])

  // Retrieve event list when year selection changes
  useEffect(() => {
    async function getEvents() {
      try {
        const val = await httpClient.get(`${selectedYear?.value}/events`);
        const json = await val.json();
        if (typeof json.Events !== "undefined") {
          json.events = json.Events;
          delete json.Events;
        }
        var timeNow = moment();

        const events = json?.events.map((e) => {
          var color = "";
          var optionPrefix = "";
          var optionPostfix = "";
          var filters = [];
          var eventTime = moment(e.dateEnd);
          e.name = e.name.trim();
          e.name = _.replace(e.name, `- FIRST Robotics Competition -`, `-`);
          if (e.code === "week0") {
            filters.push("week0")
          }
          if (e.type === "OffSeasonWithAzureSync") {
            color = paleBlue;
            optionPrefix = "•• ";
            optionPostfix = " ••";
            filters.push("offseason");
          }
          if (e.type === "OffSeason") {
            color = paleYellow;
            optionPrefix = "•• ";
            optionPostfix = " ••";
            filters.push("offseason");
          }
          if (e.type.startsWith("Regional")) {
            filters.push("regional");
          } else if (e.type.startsWith("Champion")) {
            filters.push("champs");
          } else if (e.type.startsWith("District")) {
            filters.push("district");
            filters.push(e.districtCode);
          }
          if (timeNow.diff(eventTime) < 0) {
            filters.push("future")
          } else {
            filters.push("past")
          }
          if (e.type !== "OffSeason" && e.type !== "OffSeasonWithAzureSync") {
            filters.push("week" + e.weekNumber);
          }

          e.champLevel = "";
          if (champsEvents.indexOf(e?.code) >= 0) { e.champLevel = "CHAMPS" } else
            if (divisions.indexOf(e?.code) >= 0) { e.champLevel = "CMPDIV" } else
              if (subdivisions.indexOf(e?.code) >= 0) { e.champLevel = "CMPSUB" } else
                if (michamps.indexOf(e?.code) >= 0) { e.champLevel = "DISTCHAMPS" } else
                  if (midivisions.indexOf(e?.code) >= 0) { e.champLevel = "DISTDIV" }

          return {
            value: e,
            label: `${optionPrefix}${e.name}${optionPostfix}`,
            color: color,
            filters: filters
          };
        });

        setEvents(events);
        if (!_.some(events, selectedEvent)) {
          setSelectedEvent(null);
        }

      } catch (e) {
        console.error(e)
      }

    }
    if (httpClient && selectedYear) {
      getEvents()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, httpClient, setSelectedEvent, setEvents])


  // check to see if Alliance Slection is ready when QualSchedule and Ranks changes
  useEffect(() => {
    var asReady = false;
    setAllianceSelectionReady(TabStates.NotReady);
    var matchesPerTeam = 0;
    matchesPerTeam = _.toInteger(6 * qualSchedule?.schedule?.length / (teamList?.teamCountTotal - teamReduction));
    // In order to start Alliance Selection, we need the following conditions to be trueL
    // All matches must have been completed
    // All teams must have completed their scheduled matches
    // We test these in different places: the schedule and the rankings. This ensures that
    // we have both API results, and that they are both current and complete.

    if ((qualSchedule?.schedule?.length === qualSchedule?.completedMatchCount) && (_.filter(rankings?.ranks, { "matchesPlayed": matchesPerTeam }).length === (teamList?.teamCountTotal - teamReduction))) {
      asReady = true;
      setAllianceSelectionReady(TabStates.Ready);
    }

    setAllianceSelection(asReady);

  }, [rankings, qualSchedule, teamList, teamReduction, setAllianceSelection])

  // Reset the event data when the selectedEvent changes
  useEffect(() => {
    if (!selectedEvent) {
      setPlayoffSchedule(null);
      setQualSchedule(null);
      setTeamList(null);
      setRankings(null);
      setPlayoffs(false);
      setEventHighScores(null);
      setAllianceCount(null);
      setTeamReduction(null);
      setPlayoffCountOverride(null);
      setScheduleTabReady(TabStates.NotReady);
      setTeamDataTabReady(TabStates.NotReady);
      setRanksTabReady(TabStates.NotReady);
      setAllianceSelectionReady(TabStates.NotReady);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEvent])

  // Retrieve schedule, team list, community updates, high scores and rankings when event selection changes
  useEffect(() => {

    if (httpClient && selectedEvent && selectedYear) {
      setQualSchedule(null);
      setPlayoffSchedule(null);
      setTeamList(null);
      setRankings(null);
      setEventHighScores(null);
      setPlayoffs(false);
      setAllianceCount(null);
      setTeamReduction(null);
      setPlayoffCountOverride(null);
      setCurrentMatch(1);
      getSchedule();
      getTeamList();
      getCommunityUpdates();
      getRanks();
      getWorldStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [httpClient, selectedEvent])

  return (
    <div className="App">
      {isLoading ? <div className="vertical-center">
        <Container>
          <Blocks visible height="200" width="" ariaLabel="blocks-loading" />
        </Container>
      </div> :
        canAccessApp() ? <BrowserRouter>
          <Routes>
            <Route path="/" element={<LayoutsWithNavbar scheduleTabReady={scheduleTabReady} teamDataTabReady={teamDataTabReady} ranksTabReady={ranksTabReady} statsTabReady={statsTabReady} allianceSelectionReady={allianceSelectionReady} playoffs={playoffs} />}>

              <Route path="/" element={<SetupPage selectedEvent={selectedEvent} setSelectedEvent={setSelectedEvent} setSelectedYear={setSelectedYear} selectedYear={selectedYear} eventList={events} teamList={teamList} eventFilters={eventFilters} setEventFilters={setEventFilters} timeFilter={timeFilter} setTimeFilter={setTimeFilter} qualSchedule={qualSchedule} playoffSchedule={playoffSchedule} rankings={rankings} timeFormat={timeFormat} setTimeFormat={setTimeFormat} showSponsors={showSponsors} setShowSponsors={setShowSponsors} showAwards={showAwards} setShowAwards={setShowAwards} showNotes={showNotes} setShowNotes={setShowNotes} showMottoes={showMottoes} setShowMottoes={setShowMottoes} showChampsStats={showChampsStats} setShowChampsStats={setShowChampsStats} swapScreen={swapScreen} setSwapScreen={setSwapScreen} autoAdvance={autoAdvance} setAutoAdvance={setAutoAdvance} getSchedule={getSchedule} awardsMenu={awardsMenu} setAwardsMenu={setAwardsMenu} showQualsStats={showQualsStats} setShowQualsStats={setShowQualsStats} teamReduction={teamReduction} setTeamReduction={setTeamReduction} playoffCountOverride={playoffCountOverride} setPlayoffCountOverride={setPlayoffCountOverride} allianceCount={allianceCount} localUpdates={localUpdates} setLocalUpdates={setLocalUpdates} putTeamData={putTeamData} getCommunityUpdates={getCommunityUpdates}/>} />

              <Route path="/schedule" element={<SchedulePage selectedEvent={selectedEvent} playoffSchedule={playoffSchedule} qualSchedule={qualSchedule} />} />

              <Route path="/teamdata" element={<TeamDataPage selectedEvent={selectedEvent} selectedYear={selectedYear} teamList={teamList} rankings={rankings} teamSort={teamSort} setTeamSort={setTeamSort} communityUpdates={communityUpdates} setCommunityUpdates={setCommunityUpdates} allianceCount={allianceCount} lastVisit={lastVisit} setLastVisit={setLastVisit} putTeamData={putTeamData} localUpdates={localUpdates} setLocalUpdates={setLocalUpdates}/>} />

              <Route path='/ranks' element={<RanksPage selectedEvent={selectedEvent} teamList={teamList} rankings={rankings} rankSort={rankSort} setRankSort={setRankSort} communityUpdates={communityUpdates} allianceCount={allianceCount} />} />

              <Route path='/announce' element={<AnnouncePage selectedEvent={selectedEvent} selectedYear={selectedYear} teamList={teamList} rankings={rankings} communityUpdates={communityUpdates} currentMatch={currentMatch} setCurrentMatch={setCurrentMatch} qualSchedule={qualSchedule} playoffSchedule={playoffSchedule} alliances={alliances} getSchedule={getSchedule} getRanks={getRanks} awardsMenu={awardsMenu} showNotes={showNotes} showAwards={showAwards} showSponsors={showSponsors} showMottoes={showMottoes} showChampsStats={showChampsStats} timeFormat={timeFormat} />} />

              <Route path='/playbyplay' element={<PlayByPlayPage selectedEvent={selectedEvent} selectedYear={selectedYear} teamList={teamList} rankings={rankings} communityUpdates={communityUpdates} currentMatch={currentMatch} setCurrentMatch={setCurrentMatch} qualSchedule={qualSchedule} playoffSchedule={playoffSchedule} alliances={alliances} getSchedule={getSchedule} getRanks={getRanks} awardsMenu={awardsMenu} showMottoes={showMottoes} showNotes={showNotes} showQualsStats={showQualsStats} swapScreen={swapScreen} timeFormat={timeFormat} />} />

              <Route path='/allianceselection' element={<AllianceSelectionPage selectedYear={selectedYear} selectedEvent={selectedEvent} qualSchedule={qualSchedule} playoffSchedule={playoffSchedule} alliances={alliances} rankings={rankings} timeFormat={timeFormat} getRanks={getRanks} allianceSelection={allianceSelection} playoffs={playoffs} teamList={teamList} allianceCount={allianceCount} communityUpdates={communityUpdates} />} />

              <Route path='/awards' element={<AwardsPage selectedEvent={selectedEvent} selectedYear={selectedYear} teamList={teamList} communityUpdates={communityUpdates} />} />

              <Route path='/stats' element={<StatsPage worldStats={worldStats} selectedEvent={selectedEvent} eventHighScores={eventHighScores} />} />
              <Route path='/cheatsheet' element={<CheatsheetPage />} />
              <Route path='/emcee' element={<EmceePage selectedEvent={selectedEvent} playoffSchedule={playoffSchedule} qualSchedule={qualSchedule} alliances={alliances} currentMatch={currentMatch} />} />
              <Route path='/help' element={<HelpPage />} />
              <Route path='/dev' element={<Developer />} />
            </Route>
          </Routes>
        </BrowserRouter> : <AnonymousUserPage />}
    </div>
  );
}

export default App;
