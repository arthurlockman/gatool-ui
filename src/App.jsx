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
import { Button, Container } from 'react-bootstrap';
import { usePersistentState } from './hooks/UsePersistentState';
import _ from 'lodash';
import moment from 'moment';
import Developer from './pages/Developer';
import { eventNames, specialAwards, hallOfFame, originalAndSustaining } from './components/Constants';
import { useOnlineStatus } from './contextProviders/OnlineContext';
import { toast } from 'react-toastify';
import { trainingData } from 'components/TrainingMatches';
import { timeZones } from 'components/TimeZones';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useHotkeys } from 'react-hotkeys-hook';
import { useServiceWorker } from 'contextProviders/ServiceWorkerContext';
import { useSnackbar } from 'notistack';

export const TabStates = {
  NotReady: 'notready',
  Stale: 'stale',
  Ready: 'ready'
};

/** 
 * Tiebreakers constant defines the sort order for breaking ties during playoffs.
 * Criteria 2023 has been updated.
 * 1st Cumulative TECH FOUL points due to opponent rule violations
 * 2nd ALLIANCE CHARGE STATION points
 * 3rd ALLIANCE AUTO points
 * 4th MATCH is replayed
 * @constant {object}
 * @default
 */
const playoffTiebreakers = {
  "2024": ["foulPoints", "autoPoints"],// Update after rules release
  "2023": ["foulPoints", "totalChargeStationPoints", "autoPoints"],
  "2022": ["foulPoints", "endgamePoints", "autoCargoTotal+autoTaxiPoints"],
  "2021": ["foulPoints", "autoPoints", "endgamePoints", "controlPanelPoints+teleopCellPoints"],
  "2020": ["foulPoints", "autoPoints", "endgamePoints", "controlPanelPoints+teleopCellPoints"],
  "2019": ["foulPoints", "cargoPoints", "hatchPanelPoints", "habClimbPoints", "sandStormBonusPoints"],
  "2018": ["foulPoints", "endgamePoints", "autoPoints", "autoOwnershipPoints+teleopOwnershipPoints", "vaultPoints"]
};

const navPages = [
  { "href": "", "id": "setupPage" },
  { "href": "schedule", "id": "schedulePage" },
  { "href": "teamdata", "id": "teamsPage" },
  { "href": "ranks", "id": "ranksPage" },
  { "href": "announce", "id": "announcePage" },
  { "href": "playbyplay", "id": "playByPlayPage" },
  { "href": "allianceselection", "id": "allianceSelectionPage" },
  { "href": "awards", "id": "awardsPage" },
  { "href": "stats", "id": "statsPage" },
  { "href": "cheatsheet", "id": "cheatSheetPage" },
  { "href": "emcee", "id": "emceePage" }
]

const supportedYears = [
  { label: '2023', value: '2023' },
  { label: '2022', value: '2022' },
  { label: '2021', value: '2021' },
  { label: '2020', value: '2020' },
  { label: '2019', value: '2019' }
];

const paleYellow = "#fdfaed";
const paleBlue = "#effdff";

function LayoutsWithNavbar({ selectedEvent, qualSchedule, playoffs, teamList, communityUpdates,
  rankings, eventHighScores, worldHighScores, allianceSelectionReady }) {
  return (
    <>
      <MainNavigation selectedEvent={selectedEvent} qualSchedule={qualSchedule} playoffs={playoffs}
        teamList={teamList} communityUpdates={communityUpdates} rankings={rankings} eventHighScores={eventHighScores}
        worldHighScores={worldHighScores} allianceSelectionReady={allianceSelectionReady}
      />
      <Outlet />
      <BottomNavigation />
    </>
  );
}

const training = _.cloneDeep(trainingData);

var eventnames = _.cloneDeep(eventNames);
var halloffame = _.cloneDeep(hallOfFame);

const timezones = _.cloneDeep(timeZones);

function App() {
  const { isAuthenticated, isLoading, user } = useAuth0();

  // eslint-disable-next-line no-unused-vars
  const [httpClient] = UseAuthClient();
  const [selectedEvent, setSelectedEvent] = usePersistentState("setting:selectedEvent", null);
  const [selectedYear, setSelectedYear] = usePersistentState("setting:selectedYear", null);
  const [events, setEvents] = usePersistentState("cache:events", []);
  const [playoffSchedule, setPlayoffSchedule] = usePersistentState("cache:playoffSchedule", null);
  const [qualSchedule, setQualSchedule] = usePersistentState("cache:qualSchedule", null);
  const [practiceSchedule, setPracticeSchedule] = usePersistentState("cache:practiceSchedule", null);
  const [teamList, setTeamList] = usePersistentState("cache:teamList", null);
  const [rankings, setRankings] = usePersistentState("cache:rankings", null);
  const [rankingsOverride, setRankingsOverride] = usePersistentState("cache:rankingsOverride", null);
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
  const [showDistrictChampsStats, setShowDistrictChampsStats] = usePersistentState("cache:showDistrictChampsStats", null);
  const [monthsWarning, setMonthsWarning] = usePersistentState("cache:monthsWarning", { label: "6 months", value: "6" });

  const [swapScreen, setSwapScreen] = usePersistentState("cache:swapScreen", null);
  const [autoAdvance, setAutoAdvance] = usePersistentState("cache:autoAdvance", null);
  const [currentMatch, setCurrentMatch] = usePersistentState("cache:currentMatch", null);
  const [awardsMenu, setAwardsMenu] = usePersistentState("cache:awardsMenu", null);
  const [showQualsStats, setShowQualsStats] = usePersistentState("cache:showQualsStats", null);
  const [showQualsStatsQuals, setShowQualsStatsQuals] = usePersistentState("cache:showQualsStatsQuals", null);
  const [worldStats, setWorldStats] = usePersistentState("cache:stats", null);
  const [eventHighScores, setEventHighScores] = usePersistentState("cache:eventHighScores", null);
  const [teamReduction, setTeamReduction] = usePersistentState("cache:teamReduction", 0);
  const [allianceSelection, setAllianceSelection] = usePersistentState("cache:allianceSelection", null);
  const [playoffs, setPlayoffs] = usePersistentState("cache:playoffs", null);
  const [playoffCountOverride, setPlayoffCountOverride] = usePersistentState("cache:playoffCountOverride", null);
  const [allianceCount, setAllianceCount] = usePersistentState("cache:allianceCount", null);
  const [lastVisit, setLastVisit] = usePersistentState("cache:lastVisit", {});
  const [localUpdates, setLocalUpdates] = usePersistentState("cache:localUpdates", []);
  const [allianceSelectionArrays, setAllianceSelectionArrays] = usePersistentState("cache:allianceSelectionArrays", {});
  const [reverseEmcee, setReverseEmcee] = usePersistentState("cache:reverseEmcee", null)
  const [allianceSelectionReady, setAllianceSelectionReady] = useState(TabStates.NotReady)
  const [eventNamesCY, setEventNamesCY] = usePersistentState("cache:eventNamesCY", []);
  const [districtRankings, setDistrictRankings] = usePersistentState("cache:districtRankings", null);
  const [adHocMatch, setAdHocMatch] = usePersistentState("cache:adHocMatch", [
    { teamNumber: null, station: 'Red1', surrogate: false, dq: false },
    { teamNumber: null, station: 'Red2', surrogate: false, dq: false },
    { teamNumber: null, station: 'Red3', surrogate: false, dq: false },
    { teamNumber: null, station: 'Blue1', surrogate: false, dq: false },
    { teamNumber: null, station: 'Blue2', surrogate: false, dq: false },
    { teamNumber: null, station: 'Blue3', surrogate: false, dq: false }
  ]);
  const [adHocMode, setAdHocMode] = usePersistentState("cache:adHocMode", null);
  const [backupTeam, setBackupTeam] = useState(null);

  // Controllers for table sort order at render time
  const [teamSort, setTeamSort] = useState("");
  const [rankSort, setRankSort] = useState("");

  const isOnline = useOnlineStatus();

  // Handle update notifications from the service worker
  const { waitingWorker, showReload, reloadPage } = useServiceWorker();
  const { enqueueSnackbar } = useSnackbar();

  if (!selectedYear) {
    setSelectedYear(supportedYears[0]);
  }

  useEffect(() => {
    if (showReload && waitingWorker) {
      enqueueSnackbar("A new version was released", {
        persist: true,
        variant: "success",
        action: <>
          <Button className='snackbar-button'
            color='primary'
            onClick={reloadPage} >Reload and Update</Button>
        </>
      });
    }
  }, [waitingWorker, showReload, reloadPage, enqueueSnackbar])

  // Handle if users are offline. If they're offline but have an event and year selected, let them in.
  const canAccessApp = () => {
    return isOnline ? isAuthenticated : selectedEvent && selectedYear
  }

  /**
   * Trim all values in an array
   * @function trimArray
   * @param arr the array to trim
   * @return {array} the trimmed array
   */
  function trimArray(arr) {
    for (var i = 0; i <= arr.length - 1; i++) {
      arr[i] = arr[i].trim();
    }
    return arr;
  }

  //functions to retrieve API data

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
   * @param selectedEvent The currently selected event, which is a persistent state variable
   * @param selectedYear The currently selected year, which is a persistent state variable
   * 
   * @return Sets the event high scores, qual schedule and playoff
  */
  async function getSchedule(loadingEvent) {
    var highScores = [];

    /** 
     * Returns the winner of the match
     * @function winner
     * @param {object} match - The match to test
     * @return an object containing the winning alliance, and in the event of a tie, the tiebreaker level.
     */
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

    /**
    * Checks to see if the match is an event high score 
    * @function isHighScore
    * @param {object} match - The match to test
    * @return Adds the match to the highScores object if it is a high scoring match
    */
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

        if (match.tournamentLevel === "Qualification" || match.level === "Qualification") {
          tempMatch.matchLevel = "qual";
        } else if (match.tournamentLevel === "Playoff") {
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

    var result = null;
    var qualschedule = null;
    if (selectedEvent?.value?.code.includes("OFFLINE")) {
      //do something
      qualschedule = { "schedule": { "schedule": [] } };
    } else if (!selectedEvent?.value?.code.includes("PRACTICE")) {
      result = await httpClient.get(`${selectedYear?.value}/schedule/hybrid/${selectedEvent?.value.code}/qual`);
      qualschedule = await result.json();
    } else {
      if (selectedEvent?.value?.code === "PRACTICE1") {
        qualschedule = { schedule: training.schedule.qual.partial };
      } else {
        qualschedule = { schedule: training.schedule.qual.final };
      }
    }
    // adds the winner to the schedule.
    if (typeof qualschedule.Schedule !== "undefined") {
      qualschedule.schedule = qualschedule.Schedule;
      delete qualschedule.Schedule;
    }
    if (typeof qualschedule.schedule?.Schedule !== "undefined") {
      qualschedule.schedule.schedule = qualschedule.schedule.Schedule;
      delete qualschedule.schedule.Schedule;
    }
    var matches = qualschedule?.schedule.schedule.map((match) => {
      match.winner = winner(match);
      return match;
    });
    qualschedule.scheduleLastModified = qualschedule.schedule?.headers ? moment(qualschedule.schedule?.headers.schedule["last-modified"]) : moment();
    qualschedule.matchesLastModified = qualschedule.schedule?.headers ? moment(qualschedule.schedule?.headers.matches["last-modified"]) : moment();
    qualschedule.schedule = matches;
    matches.forEach((match) => {
      isHighScore(match);
    })

    var completedMatchCount = 0;

    if (qualschedule?.schedule?.length > 0) {
      completedMatchCount = qualschedule?.schedule?.length - _.filter(qualschedule.schedule, { "postResultTime": null }).length;
      // clear the Practice schedule if there is one loaded and there are matches in the schedule
      setPracticeSchedule(null);
    }

    qualschedule.completedMatchCount = completedMatchCount;

    qualschedule.lastUpdate = moment();
    setQualSchedule(qualschedule);

    //get the playoff schedule
    matches = [];
    result = null;
    var playoffschedule = null;
    completedMatchCount = 0;
    if (selectedEvent?.value?.code.includes("OFFLINE")) {
      //do something
      playoffschedule = { "schedule": { "schedule": [] } };
    } else if (!selectedEvent?.value?.code.includes("PRACTICE")) {
      result = await httpClient.get(`${selectedYear?.value}/schedule/hybrid/${selectedEvent?.value.code}/playoff`);
      playoffschedule = await result.json();
    } else {
      if (selectedEvent?.value?.code === "PRACTICE1" || selectedEvent?.value?.code === "PRACTICE2") {
        playoffschedule = { schedule: training.schedule.playoff.pending };
      } else if (selectedEvent?.value?.code === "PRACTICE3") {
        playoffschedule = { schedule: training.schedule.playoff.partial };
      } else {
        playoffschedule = { schedule: training.schedule.playoff.final };
      }
    }
    if (typeof playoffschedule.Schedule !== "undefined") {
      playoffschedule.schedule = playoffschedule.Schedule;
      delete playoffschedule.Schedule;
    }
    if (typeof playoffschedule.schedule.Schedule !== "undefined") {
      playoffschedule.schedule.schedule = playoffschedule.schedule.Schedule;
      delete playoffschedule.schedule.Schedule;
    }
    playoffschedule.scheduleLastModified = playoffschedule.schedule?.headers ? moment(playoffschedule.schedule?.headers.schedule["last-modified"]) : moment();
    playoffschedule.matchesLastModified = playoffschedule.schedule?.headers ? moment(playoffschedule.schedule?.headers.matches["last-modified"]) : moment();
    if (playoffschedule?.schedule?.schedule?.length > 0) {
      // adds the winner to the schedule.
      matches = playoffschedule.schedule.schedule.map((match) => {
        match.winner = winner(match);
        return match;
      });

      if (playoffschedule?.schedule?.length > 0) {
        completedMatchCount = playoffschedule?.schedule?.length - _.filter(playoffschedule.schedule, { "postResultTime": null }).length;
      }

      playoffschedule.completedMatchCount = completedMatchCount;
      playoffschedule.schedule = matches;
      matches.forEach((match) => {
        isHighScore(match);
      })

      // determine the tiebreaker
      // var lastMatchNumber = playoffschedule?.schedule[_.findLastIndex(playoffschedule?.schedule, function (match) {
      //   return (match?.scoreRedFinal !== null) || (match?.scoreBlueFinal !== null)
      // })]?.matchNumber;

      if (!selectedEvent?.value?.code.includes("PRACTICE")) {
        result = await httpClient.get(`${selectedYear?.value}/scores/${selectedEvent?.value.code}/playoff`);
        var scores = await result.json();
      } else if (selectedEvent?.value?.code === "PRACTICE1" || selectedEvent?.value?.code === "PRACTICE2") {
        scores = training.scores.playoff.initial;
      } else if (selectedEvent?.value?.code === "PRACTICE3") {
        scores = training.scores.playoff.partial;
      } else {
        scores = training.scores.playoff.final;
      }


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
          playoffschedule.schedule[_.findIndex(playoffschedule.schedule, { "matchNumber": score.matchNumber })].winner.tieWinner = tiebreaker?.winner;
          playoffschedule.schedule[_.findIndex(playoffschedule.schedule, { "matchNumber": score.matchNumber })].winner.level = tiebreaker?.level;

        }
      }))

      // since we have a playoff schedule, we need to fetch the Alliances.
      getAlliances();
    } else { playoffschedule.schedule = playoffschedule.schedule.schedule }

    var lastMatchPlayed = 0;

    if (qualschedule?.completedMatchCount > 0) {
      lastMatchPlayed += qualschedule?.completedMatchCount;
    }

    if (playoffschedule?.completedMatchCount > 0) {
      lastMatchPlayed += playoffschedule?.completedMatchCount

    }
    if (loadingEvent && autoAdvance) {
      if ((lastMatchPlayed === qualschedule?.schedule.length) || (lastMatchPlayed === qualschedule?.schedule.length + playoffschedule?.schedule.length)) {
        lastMatchPlayed -= 1;
      }
      setCurrentMatch(lastMatchPlayed + 1)
    }

    setEventHighScores(highScores);
    playoffschedule.lastUpdate = moment();
    setPlayoffSchedule(playoffschedule);

  }

  /**
   *  This function retrieves a a list of teams for a specific event from FIRST. It parses the list and modifies some of the data to produce more readable content.
   * @async
   * @function getTeamList
   * @param adHocTeamList When loading a team list from a spreadsheet, this is the array of teams in the event
   * @return sets the teamList
   */
  async function getTeamList(adHocTeamList) {

    /**
     * Determines whether an award, by name, deserves special highlighting in the Announce Screen
     * @function awardsHilight
     * @param awardName The name of the award to highlight
     * @return true if "special" award; false if not
     */
    function awardsHilight(awardName) {
      if (awardName === "District Chairman's Award" || awardName === "District Event Winner" || awardName === "District Event Finalist" || awardName === "Regional Engineering Inspiration Award" || awardName === "District Engineering Inspiration Award" || awardName === "Engineering Inspiration Award" || awardName === "District Championship Finalist" || awardName === "District Championship Winner" || awardName === "Regional Winners" || awardName === "Regional Finalists" || awardName === "Regional Chairman's Award" || awardName === "FIRST Dean's List Finalist Award" || awardName === "District Championship Dean's List Semi-Finalist" || awardName === "Championship Subdivision Winner" || awardName === "Championship Subdivision Finalist" || awardName === "Championship Division Winner" || awardName === "Championship Division Finalist" || awardName === "Championship Winner" || awardName === "Championship Finalist" || awardName === "Chairman's Award" || awardName === "Chairman's Award Finalist" || awardName === "FIRST Dean's List Award" || awardName === "Woodie Flowers Award" || awardName === "Innovation Challenge Winner" || awardName === "Innovation Challenge Finalist" || awardName === "FIRST Impact Award" || awardName === "District FIRST Impact Award") {
        return true;
      } else {
        return false;
      }
    }

    var result = null;
    var teams = null;

    if (selectedEvent?.value?.code.includes("OFFLINE")) {
      teams = {
        "teamCountTotal": 0,
        "teamCountPage": 1,
        "pageCurrent": 1,
        "pageTotal": 1,
        "teams": []
      };
      if (adHocTeamList) {
        //https://api.gatool.org/v3/2023/teams?teamNumber=172

        var adHocTeams = adHocTeamList.map(async team => {
          var request = await httpClient.get(`${selectedYear?.value}/teams?teamNumber=${team}`);
          var teamDetails = await request.json();

          return teamDetails.teams[0];
        });

        await Promise.all(adHocTeams).then(function (values) {
          //do something with the team list
          console.log(values);
          teams.teams = values;
          getCommunityUpdates(false, values);
        });

      }
    } else if (!selectedEvent?.value?.code.includes("PRACTICE")) {
      result = await httpClient.get(`${selectedYear?.value}/teams?eventCode=${selectedEvent?.value?.code}`);
      teams = await result.json();
    } else {
      teams = training.teams.teams;
    }

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

    await Promise.all(newTeams).then(function (values) {

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


        events.forEach((event) => {
          eventnames[selectedYear?.value][event?.value?.code] = event?.value?.name;
        })
        setEventNamesCY(eventnames[selectedYear?.value]);

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
        _.filter(halloffame, { "Impact": team.teamNumber }).forEach((award) => {
          team.hallOfFame.push({ "year": award.Year, "challenge": award.Challenge, "type": "impact" })
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

        team.hallOfFame = _.orderBy(team.hallOfFame, ['type', 'year'], ['asc', 'asc']);

        return team;

      })
      teams.teams = formattedAwards;



      var champsTeams = [];
      if (selectedEvent?.value?.champLevel !== "" || showDistrictChampsStats) {
        champsTeams = teams.teams.map(async team => {
          var champsRequest = await httpClient.get(`/team/${team?.teamNumber}/appearances`);
          var appearances = await champsRequest.json();
          var result =
          {
            "teamNumber": team?.teamNumber,
            "champsAppearances": 0,
            "champsAppearancesYears": [],
            "einsteinAppearances": 0,
            "einsteinAppearancesYears": [],

            "districtChampsAppearances": 0,
            "districtChampsAppearancesYears": [],
            "districtEinsteinAppearances": 0,
            "districtEinsteinAppearancesYears": [],
            "FOCAppearances": 0,
            "FOCAppearancesYears": []
          };

          appearances.forEach((appearance) => {
            //check for district code
            //DISTRICT_CMP = 2
            //DISTRICT_CMP_DIVISION = 5
            // Ontario (>=2019), Michigan (>=2017), Texas (>=2022), New England (>=2022),
            // Indiana (>=2022) check for Einstein appearances
            // appearances.district.abbreviation = "ont"
            // appearances.district.abbreviation = "fim"
            // appearances.district.abbreviation = "ne"
            // appearances.district.abbreviation = "tx" || "fit"
            // >=2017 check for Division appearance then Champs appearances
            //test for champs prior to 2001

            //Use timeDifference to filter out teams from the current year's Einstein appearances 
            // for World and District Champs events.
            var timeDifference = moment(appearance?.end_date).diff(moment(), "minutes");

            if (appearance.district !== null) {
              if (((appearance.year >= 2019) && (appearance.district.abbreviation === "ont")) ||
                ((appearance.year >= 2017) && (appearance.district.abbreviation === "fim")) ||
                ((appearance.year >= 2022) && (appearance.district.abbreviation === "ne")) ||
                ((appearance.year >= 2022) && (appearance.district.abbreviation === "tx" || appearance.district.abbreviation === "fit"))) {
                if (appearance.event_type === 5) {
                  result.districtChampsAppearances += 1;
                  result.districtChampsAppearancesYears.push(appearance.year);
                }
                if ((appearance.event_type === 2) && (timeDifference < 0)) {
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

              // FIXED: mapping out current year's Einstein appearances.
              if ((appearance.event_type === 4) && (timeDifference < 0)) {
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
        })
      } else {
        teams.lastUpdate = moment();
        setTeamList(teams);
      }

    })
  }

  /**
   * This function retrieves communnity updates for a specified event from gatool Cloud.
   * @async
   * @function getCommunityUpdates
   * @param notify boolean set to Toast if the request is successful
   * @param selectedYear The currently selected year, which is a persistent state variable
   * @param selectedEvent The currently selected event, which is a persistent state variable
   * @param adHocTeamList A list of team numbers to support offline events
   * @return sets the communityUpdates persistent state
   */
  async function getCommunityUpdates(notify, adHocTeamList) {
    var result = null;
    var teams = [];
    var communityUpdateTemplate = {
      "nameShortLocal": "",
      "cityStateLocal": "",
      "topSponsorsLocal": "",
      "sponsorsLocal": "",
      "organizationLocal": "",
      "robotNameLocal": "",
      "awardsLocal": "",
      "teamMottoLocal": "",
      "teamNotesLocal": "",
      "teamYearsNoCompeteLocal": "",
      "showRobotName": "",
      "teamNotes": "",
      "sayNumber": "",
      "lastUpdate": "",
      "source": ""
    }

    if (selectedEvent?.value?.code.includes("OFFLINE")) {
      //Do something with the team list
      if (adHocTeamList) {
        // https://api.gatool.org/v3/team/172/updates
        console.log("Teams List loaded. Update from the Community")
        var adHocTeams = adHocTeamList.map(async team => {
          var request = await httpClient.get(`/team/${team?.teamNumber}/updates`);
          var teamDetails = { "teamNumber": team?.teamNumber };
          var teamUpdate = await request.json();
          teamDetails.updates = teamUpdate;
          teamDetails.teamNumber = team?.teamNumber
          return teamDetails;
        });

        await Promise.all(adHocTeams).then(function (values) {
          teams = values;
          teams = teams.map((team) => {
            team.updates = _.merge(_.cloneDeep(communityUpdateTemplate), team?.updates);
            if (_.findIndex(localUpdates, { "teamNumber": team?.teamNumber }) >= 0) {
              team.updates = _.merge(team.updates, _.cloneDeep(localUpdates[_.findIndex(localUpdates, { "teamNumber": team?.teamNumber })].update))
            }
            return team;
          })

        });

      } else {
        console.log("no teams loaded yet")
        teams = [];
      }

    } else if (!selectedEvent?.value?.code.includes("PRACTICE")) {
      result = await httpClient.get(`${selectedYear?.value}/communityUpdates/${selectedEvent?.value.code}`);
      teams = await result.json();
    } else {
      teams = training.teams.communityUpdates;
    }

    teams = teams.map((team) => {
      team.updates = _.merge(_.cloneDeep(communityUpdateTemplate), team?.updates);
      if (_.findIndex(localUpdates, { "teamNumber": team?.teamNumber }) >= 0) {
        team.updates = _.merge(team.updates, _.cloneDeep(localUpdates[_.findIndex(localUpdates, { "teamNumber": team?.teamNumber })].update))
      }
      return team;
    })

    teams.lastUpdate = moment();
    if (notify) {
      toast.success(`Your team data is now up to date.`)
    }
    setCommunityUpdates(teams);
  }

  /**
   * This function retrieves the ranking data for a specified event from FIRST.
   * @async
   * @function getRanks
   * @param selectedYear The currently selected year, which is a persistent state variable
   * @param selectedEvent The currently selected event, which is a persistent state variable
   * @return sets rankings
   */
  async function getRanks() {
    var result = null;
    var ranks = null;
    if (selectedEvent?.value?.code.includes("OFFLINE")) {
      ranks = { "rankings": { "Rankings": [] } };
    }
    else if (!selectedEvent?.value?.code.includes("PRACTICE")) {
      result = await httpClient.get(`${selectedYear?.value}/rankings/${selectedEvent?.value.code}`);
      ranks = await result.json();
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
    ranks.lastModified = ranks.headers ? moment(ranks?.headers["last-modified"]) : moment();
    ranks.lastUpdate = moment();
    setRankings(ranks);
  }

  /** This function retrieves the ranking data for a specific District from FIRST
   * @async
   * @function getDistrictRanks
   * @param selectedYear The currently selected year, which is a persistent state variable
   * @param selectedEvent The currently selected event, which is a persistent state variable
   * @return sets districtRankings
   */
  async function getDistrictRanks() {
    var result = null;
    var districtranks = null;
    result = await httpClient.get(`${selectedYear?.value}/district/rankings/${selectedEvent?.value.districtCode}`);
    districtranks = await result.json();
    districtranks.lastUpdate = moment();
    setDistrictRankings(districtranks);
  }

  /**
   * This function retrieves the rworld high scores for the selected year from FIRST.
   * @async
   * @function getWorldStats
   * @param selectedYear The currently selected year, which is a persistent state variable
   * @returns sets the world high scores
   */
  async function getWorldStats() {
    var result = await httpClient.get(`${selectedYear?.value}/highscores`);
    var highscores = await result.json();
    var scores = {};
    var reducedScores = {};

    scores.year = selectedYear?.value;
    scores.lastUpdate = moment();


    highscores.forEach((score) => {
      var details = {};
      if (!_.isEmpty(eventnames[worldStats?.year])) {
        details.eventName = eventnames[worldStats?.year][score?.matchData?.event?.eventCode] || score?.matchData?.event?.eventCode;
      } else {
        details.eventName = score?.matchData?.event?.eventCode;
      }

      //if (worldStats) {
      //  details.eventName = eventnames[worldStats?.year][score?.matchData?.event?.eventCode]
      //} else {
      //  details.eventName = score?.matchData?.event?.eventCode;
      //}
      details.alliance = _.upperFirst(score?.matchData?.highScoreAlliance);
      details.scoreType = score?.type + score?.level;
      details.matchName = score?.matchData?.match?.description;
      details.allianceMembers = _.filter(score?.matchData?.match?.teams, function (o) { return _.startsWith(o.station, details.alliance) }).map((team) => { return team.teamNumber }).join(" ")
      details.score = score?.matchData?.match[`score${details.alliance}Final`];
      reducedScores[details.scoreType] = details;
    })
    scores.highscores = reducedScores;

    setWorldStats(scores);
  }

  /**
   * This function retrieves the Playoff Alliance data for a specified event from FIRST. It also formats the Alliance data to better support lookups in the playoff Bracket and on Announce and Play By Play.
   * @async
   * @function getAlliances
   * @param selectedYear The currently selected year, which is a persistent state variable
   * @param selectedEvent The currently selected event, which is a persistent state variable
   * @returns sets alliances
   */
  async function getAlliances() {
    var result = null;
    var alliances = null;
    if (!selectedEvent?.value?.code.includes("PRACTICE")) {
      result = await httpClient.get(`${selectedYear?.value}/alliances/${selectedEvent?.value.code}`);
      alliances = await result.json();
    } else if (selectedEvent?.value?.code === "PRACTICE1" || selectedEvent?.value?.code === "PRACTICE2") {
      alliances = training.alliances.initial;
    } else if (selectedEvent?.value?.code === "PRACTICE3") {
      alliances = training.alliances.partial;
    } else {
      alliances = training.alliances.final;
    }

    if (typeof alliances.Alliances !== "undefined") {
      alliances.alliances = alliances.Alliances;
      delete alliances.Alliances;
    }
    var allianceLookup = {};
    alliances.alliances.forEach(alliance => {
      allianceLookup[`${alliance.captain}`] = { role: `Captain`, alliance: alliance.name, number: alliance.number, captain: alliance.captain, round1: alliance.round1, round2: alliance.round2, round3: alliance.round3, backup: alliance.backup, backupReplaced: alliance.backupReplaced };
      allianceLookup[`${alliance.round1}`] = { role: `Round 1 Selection`, alliance: alliance.name, number: alliance.number, captain: alliance.captain, round1: alliance.round1, round2: alliance.round2, round3: alliance.round3, backup: alliance.backup, backupReplaced: alliance.backupReplaced };
      allianceLookup[`${alliance.round2}`] = { role: `Round 2 Selection`, alliance: alliance.name, number: alliance.number, captain: alliance.captain, round1: alliance.round1, round2: alliance.round2, round3: alliance.round3, backup: alliance.backup, backupReplaced: alliance.backupReplaced };
      if (alliance.round3) { allianceLookup[`${alliance.round3}`] = { role: `Round 3 Selection`, alliance: alliance.name, number: alliance.number, captain: alliance.captain, round1: alliance.round1, round2: alliance.round2, round3: alliance.round3, backup: alliance.backup, backupReplaced: alliance.backupReplaced }; }
      if (alliance.backup) { allianceLookup[`${alliance.backup}`] = { role: `Backup for ${alliance.backupReplaced}`, alliance: alliance.name, number: alliance.number, captain: alliance.captain, round1: alliance.round1, round2: alliance.round2, round3: alliance.round3, backup: alliance.backup, backupReplaced: alliance.backupReplaced }; }
    })
    alliances.Lookup = allianceLookup;

    alliances.lastUpdate = moment();
    setAlliances(alliances);
    if (alliances?.alliances?.length > 0) {
      setPlayoffs(true);
    }
  }

  /**
   * This function writes updated team data back to gatool Cloud.
   * @async
   * @function putTeamData
   * @param {number} teamNumber the team number of the team whose data will be put to gatool Cloud
   * @param {object} data the data to be put to gatool Cloud
   * @returns {Promise<object>} result
   */
  async function putTeamData(teamNumber, data) {
    var result = await httpClient.put(`team/${teamNumber}/updates`, data);
    return result;
  }

  /** 
   * This function reads the team data update history gatool Cloud.
   * @async
   * @function getTeamHistory
   * @param {number} teamNumber the number of the team whose data we want to fetch
   * @returns {Promise<object>} The team's update history array
   */
  async function getTeamHistory(teamNumber) {
    var result = await httpClient.get(`team/${teamNumber}/updates/history/`);
    var history = await result.json();
    return history;
  }

  const nextMatch = () => {
    if (!adHocMode) {
      if (!_.isNull(practiceSchedule) && (currentMatch < practiceSchedule?.schedule?.length)) {
        setCurrentMatch(currentMatch + 1);
        getSchedule();
        getRanks();
        getWorldStats();
      }

      if (currentMatch < (qualSchedule?.schedule?.length + playoffSchedule?.schedule?.length)) {
        setCurrentMatch(currentMatch + 1);
        getSchedule();
        getRanks();
        getWorldStats();
      }
    }
  }

  const previousMatch = () => {
    if (!adHocMode) {
      if (currentMatch > 1) {
        setCurrentMatch(currentMatch - 1);
        getSchedule();
        getRanks();
        getWorldStats();
      }
    }
  }

  const setMatchFromMenu = (e) => {
    setCurrentMatch(e.value);
    getSchedule();
    getRanks();
    getWorldStats();
  }

  const loadEvent = () => {
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
      setAllianceSelectionArrays({});
      setRankingsOverride(null);
      setCurrentMatch(1);
      setDistrictRankings(null);
      setAdHocMatch([
        { teamNumber: null, station: 'Red1', surrogate: false, dq: false },
        { teamNumber: null, station: 'Red2', surrogate: false, dq: false },
        { teamNumber: null, station: 'Red3', surrogate: false, dq: false },
        { teamNumber: null, station: 'Blue1', surrogate: false, dq: false },
        { teamNumber: null, station: 'Blue2', surrogate: false, dq: false },
        { teamNumber: null, station: 'Blue3', surrogate: false, dq: false }
      ]);
      getSchedule(true);
      getTeamList();
      getCommunityUpdates();
      getRanks();
      if (selectedEvent.value.districtCode) {
        getDistrictRanks();
      }
      getWorldStats();
    }
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
    var allianceMultiplier = 2;
    if (selectedEvent?.value?.champLevel === "CHAMPS" || selectedEvent?.value?.champLevel === "CMPDIV" || selectedEvent?.value?.champLevel === "CMPSUB") {
      allianceMultiplier = 3;
    }

    allianceCountTemp.allianceSelectionLength = allianceMultiplier * allianceCountTemp.count - 1;
    allianceCountTemp.menu = { "value": allianceCountTemp.count, "label": allianceCountTemp.count }
    setAllianceCount(allianceCountTemp);
  }, [playoffCountOverride, teamList, setAllianceCount, selectedEvent])

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

        if (selectedYear?.value === "2023") {
          json.events = json?.events.concat(training.events.events)
        }

        const events = json?.events.map((e) => {
          var color = "";
          var optionPrefix = "";
          var optionPostfix = "";
          var filters = [];

          // We have four formats available in timezones: abbreviation, description, Livemeeting and Windows. We lookup the Windows
          // format and convert it to a more standard format. Consider moving off of Moment on to Luxor?

          e.timeZoneAbbreviation = timezones[_.findIndex(timezones, { "Windows": e.timezone })]?.Abbreviation;

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
          if (e.type === "Regional") {
            filters.push("regional");
          } else if (e.type.startsWith("Champion")) {
            filters.push("champs");
          } else if (e.districtCode) {
            filters.push("district");
            filters.push(e.districtCode);
          }
          if (timeNow.diff(eventTime) < 0) {
            filters.push("future")
          } else {
            filters.push("past")
          }
          if (eventTime.diff(timeNow, 'days') <= 7 && eventTime.diff(timeNow, 'days') > 0) {
            filters.push("thisWeek")
          }
          if (eventTime.diff(timeNow, 'weeks') <= 4 && eventTime.diff(timeNow, 'weeks') > 0) {
            filters.push("thisMonth")
          }
          if (e.type !== "OffSeason" && e.type !== "OffSeasonWithAzureSync") {
            filters.push("week" + e.weekNumber);
          }

          e.champLevel = "";

          // old lookup method
          //if (champsEvents.indexOf(e?.code) >= 0) { e.champLevel = "CHAMPS" } else
          //  if (divisions.indexOf(e?.code) >= 0) { e.champLevel = "CMPDIV" } else
          //    if (subdivisions.indexOf(e?.code) >= 0) { } else
          //      if (michamps.indexOf(e?.code) >= 0) { e.champLevel = "DISTCHAMPS" } else
          //        if (midivisions.indexOf(e?.code) >= 0) { e.champLevel = "DISTDIV" }

          // new method using event type data        
          if (e.type === "DistrictChampionship" || e.type === "DistrictChampionshipWithLevels") {
            e.champLevel = "DISTCHAMPS";
          } else if (e.type === "DistrictChampionshipDivision") {
            e.champLevel = "DISTDIV";
          } else if (e.type === "ChampionshipDivision") {
            e.champLevel = "CMPDIV";
          } else if (e.type === "ChampionshipSubdivision") {
            e.champLevel = "CMPSUB";
          } else if (e.type === "Championship") {
            e.champLevel = "CHAMPS";
          }

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
    // In order to start Alliance Selection, we need the following conditions to be true:
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
      setAllianceSelectionArrays({});
      setRankingsOverride(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEvent])

  // Retrieve schedule, team list, community updates, high scores and rankings when event selection changes
  useEffect(() => {
    loadEvent();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [httpClient, selectedEvent])


  // controllers for tab navigation
  //const navigate = useNavigate();
  const tabNavRight = () => {
    var location = window.location.href.split("/").pop();
    var tabNumber = _.findIndex(navPages, { "href": location });
    if (tabNumber < navPages.length - 1) { tabNumber += 1 }
    document.getElementById(navPages[tabNumber].id).click();
  }

  const tabNavLeft = () => {
    var location = window.location.href.split("/").pop();
    var tabNumber = _.findIndex(navPages, { "href": location });
    if (tabNumber > 0) { tabNumber -= 1 }
    document.getElementById(navPages[tabNumber].id).click();
  }

  useHotkeys('shift+right', () => tabNavRight(), { scopes: 'tabNavigation' });
  useHotkeys('.', () => tabNavRight(), { scopes: 'tabNavigation' });
  useHotkeys('k', () => tabNavRight(), { scopes: 'tabNavigation' });
  useHotkeys('shift+left', () => tabNavLeft(), { scopes: 'tabNavigation' });
  useHotkeys('comma', () => tabNavLeft(), { scopes: 'tabNavigation' });
  useHotkeys('j', () => tabNavLeft(), { scopes: 'tabNavigation' });

  return (
    <div className="App">
      {isLoading ? <div className="vertical-center">
        <Container>
          <Blocks visible height="200" width="" ariaLabel="blocks-loading" />
        </Container>
      </div> :
        canAccessApp() ? <BrowserRouter>
          <Routes>
            <Route path="/" element={<LayoutsWithNavbar selectedEvent={selectedEvent} qualSchedule={qualSchedule} playoffs={playoffs} teamList={teamList} communityUpdates={communityUpdates} rankings={rankings} eventHighScores={eventHighScores} worldHighScores={worldStats} allianceSelectionReady={allianceSelectionReady} />}>

              <Route path="/" element={<SetupPage selectedEvent={selectedEvent} setSelectedEvent={setSelectedEvent} setSelectedYear={setSelectedYear} selectedYear={selectedYear} eventList={events} teamList={teamList} eventFilters={eventFilters} setEventFilters={setEventFilters} timeFilter={timeFilter} setTimeFilter={setTimeFilter} qualSchedule={qualSchedule} playoffSchedule={playoffSchedule} rankings={rankings} timeFormat={timeFormat} setTimeFormat={setTimeFormat} showSponsors={showSponsors} setShowSponsors={setShowSponsors} showAwards={showAwards} setShowAwards={setShowAwards} showNotes={showNotes} setShowNotes={setShowNotes} showMottoes={showMottoes} setShowMottoes={setShowMottoes} showChampsStats={showChampsStats} setShowChampsStats={setShowChampsStats} swapScreen={swapScreen} setSwapScreen={setSwapScreen} autoAdvance={autoAdvance} setAutoAdvance={setAutoAdvance} getSchedule={getSchedule} awardsMenu={awardsMenu} setAwardsMenu={setAwardsMenu} showQualsStats={showQualsStats} setShowQualsStats={setShowQualsStats} showQualsStatsQuals={showQualsStatsQuals} setShowQualsStatsQuals={setShowQualsStatsQuals} teamReduction={teamReduction} setTeamReduction={setTeamReduction} playoffCountOverride={playoffCountOverride} setPlayoffCountOverride={setPlayoffCountOverride} allianceCount={allianceCount} localUpdates={localUpdates} setLocalUpdates={setLocalUpdates} putTeamData={putTeamData} getCommunityUpdates={getCommunityUpdates} reverseEmcee={reverseEmcee} setReverseEmcee={setReverseEmcee} showDistrictChampsStats={showDistrictChampsStats} setShowDistrictChampsStats={setShowDistrictChampsStats} monthsWarning={monthsWarning} setMonthsWarning={setMonthsWarning} user={user} adHocMode={adHocMode} setAdHocMode={setAdHocMode} />} />

              <Route path="/schedule" element={<SchedulePage selectedEvent={selectedEvent} playoffSchedule={playoffSchedule} qualSchedule={qualSchedule} practiceSchedule={practiceSchedule} setPracticeSchedule={setPracticeSchedule} getTeamList={getTeamList} />} />

              <Route path="/teamdata" element={<TeamDataPage selectedEvent={selectedEvent} selectedYear={selectedYear} teamList={teamList} rankings={rankings} teamSort={teamSort} setTeamSort={setTeamSort} communityUpdates={communityUpdates} setCommunityUpdates={setCommunityUpdates} allianceCount={allianceCount} lastVisit={lastVisit} setLastVisit={setLastVisit} putTeamData={putTeamData} localUpdates={localUpdates} setLocalUpdates={setLocalUpdates} qualSchedule={qualSchedule} playoffSchedule={playoffSchedule} originalAndSustaining={originalAndSustaining} monthsWarning={monthsWarning} user={user} getTeamHistory={getTeamHistory} timeFormat={timeFormat} />} />

              <Route path='/ranks' element={<RanksPage selectedEvent={selectedEvent} teamList={teamList} rankings={rankings} rankSort={rankSort} setRankSort={setRankSort} allianceCount={allianceCount} rankingsOverride={rankingsOverride} setRankingsOverride={setRankingsOverride} allianceSelection={allianceSelection} getRanks={getRanks} setRankings={setRankings} setAllianceSelectionArrays={setAllianceSelectionArrays} playoffs={playoffs} districtRankings={districtRankings} />} />

              <Route path='/announce' element={<AnnouncePage selectedEvent={selectedEvent} selectedYear={selectedYear} teamList={teamList} rankings={rankings} communityUpdates={communityUpdates} currentMatch={currentMatch} qualSchedule={qualSchedule} playoffSchedule={playoffSchedule} alliances={alliances} setAlliances={setAlliances} awardsMenu={awardsMenu} showNotes={showNotes} showAwards={showAwards} showSponsors={showSponsors} showMottoes={showMottoes} showChampsStats={showChampsStats} timeFormat={timeFormat} eventHighScores={eventHighScores} backupTeam={backupTeam} setBackupTeam={setBackupTeam} allianceCount={allianceCount} nextMatch={nextMatch} previousMatch={previousMatch} setMatchFromMenu={setMatchFromMenu} practiceSchedule={practiceSchedule} eventNamesCY={eventNamesCY} districtRankings={districtRankings} showDistrictChampsStats={showDistrictChampsStats} adHocMatch={adHocMatch} setAdHocMatch={setAdHocMatch} adHocMode={adHocMode} />} />

              <Route path='/playbyplay' element={<PlayByPlayPage selectedEvent={selectedEvent} selectedYear={selectedYear} teamList={teamList} rankings={rankings} communityUpdates={communityUpdates} currentMatch={currentMatch} qualSchedule={qualSchedule} playoffSchedule={playoffSchedule} alliances={alliances} setAlliances={setAlliances} showMottoes={showMottoes} showNotes={showNotes} showQualsStats={showQualsStats} showQualsStatsQuals={showQualsStatsQuals} swapScreen={swapScreen} timeFormat={timeFormat} eventHighScores={eventHighScores} backupTeam={backupTeam} setBackupTeam={setBackupTeam} allianceCount={allianceCount} nextMatch={nextMatch} previousMatch={previousMatch} setMatchFromMenu={setMatchFromMenu} practiceSchedule={practiceSchedule} districtRankings={districtRankings} adHocMatch={adHocMatch} setAdHocMatch={setAdHocMatch} adHocMode={adHocMode} />} />

              <Route path='/allianceselection' element={<AllianceSelectionPage selectedYear={selectedYear} selectedEvent={selectedEvent} qualSchedule={qualSchedule} playoffSchedule={playoffSchedule} alliances={alliances} rankings={rankings} timeFormat={timeFormat} getRanks={getRanks} allianceSelection={allianceSelection} playoffs={playoffs} teamList={teamList} allianceCount={allianceCount} communityUpdates={communityUpdates} allianceSelectionArrays={allianceSelectionArrays} setAllianceSelectionArrays={setAllianceSelectionArrays} rankingsOverride={rankingsOverride} loadEvent={loadEvent} />} />

              <Route path='/awards' element={<AwardsPage selectedEvent={selectedEvent} selectedYear={selectedYear} teamList={teamList} communityUpdates={communityUpdates} />} />

              <Route path='/stats' element={<StatsPage worldStats={worldStats} selectedEvent={selectedEvent} eventHighScores={eventHighScores} eventNamesCY={eventNamesCY} />} />
              <Route path='/cheatsheet' element={<CheatsheetPage teamList={teamList} communityUpdates={communityUpdates} selectedEvent={selectedEvent} />} />
              <Route path='/emcee' element={<EmceePage selectedEvent={selectedEvent} playoffSchedule={playoffSchedule} qualSchedule={qualSchedule} alliances={alliances} currentMatch={currentMatch} nextMatch={nextMatch} previousMatch={previousMatch} reverseEmcee={reverseEmcee} />} />
              <Route path='/help' element={<HelpPage />} />
              <Route path='/dev' element={<Developer />} />
            </Route>
          </Routes>
        </BrowserRouter> : <AnonymousUserPage />}
    </div>
  );
}

export default App;
