import MainNavigation from "./components/MainNavigation";
import BottomNavigation from "./components/BottomNavigation";
import { Outlet, Route, Routes } from "react-router";
import { BrowserRouter } from "react-router-dom";
import SetupPage from "./pages/SetupPage";
import SchedulePage from "./pages/SchedulePage";
import TeamDataPage from "./pages/TeamDataPage";
import RanksPage from "./pages/RanksPage";
import AnnouncePage from "./pages/AnnouncePage";
import PlayByPlayPage from "./pages/PlayByPlayPage";
import AllianceSelectionPage from "./pages/AllianceSelectionPage";
import AwardsPage from "./pages/AwardsPage";
import StatsPage from "./pages/StatsPage";
import CheatsheetPage from "./pages/CheatsheetPage";
import EmceePage from "./pages/EmceePage";
import { useEffect, useState } from "react";
import { UseAuthClient } from "./contextProviders/AuthClientContext";
import { useAuth0 } from "@auth0/auth0-react";
import { Blocks } from "react-loader-spinner";
import { Button, Container } from "react-bootstrap";
import { usePersistentState } from "./hooks/UsePersistentState";
import _ from "lodash";
import moment from "moment";
import Developer from "./pages/Developer";
import {
  eventNames,
  specialAwards,
  hallOfFame,
  originalAndSustaining,
  refreshRate,
  communityUpdateTemplate,
} from "./components/Constants";
import { appUpdates } from "./components/AppUpdates";
import { useOnlineStatus } from "./contextProviders/OnlineContext";
import { toast } from "react-toastify";
import { trainingData } from "components/TrainingMatches";
import { timeZones } from "components/TimeZones";
import { useInterval } from "react-interval-hook";

import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useHotkeys } from "react-hotkeys-hook";
import { useServiceWorker } from "contextProviders/ServiceWorkerContext";
import { useSnackbar } from "notistack";

export const TabStates = {
  NotReady: "notready",
  Stale: "stale",
  Ready: "ready",
};

const navPages = [
  { href: "", id: "setupPage" },
  { href: "schedule", id: "schedulePage" },
  { href: "teamdata", id: "teamsPage" },
  { href: "ranks", id: "ranksPage" },
  { href: "announce", id: "announcePage" },
  { href: "playbyplay", id: "playByPlayPage" },
  { href: "allianceselection", id: "allianceSelectionPage" },
  { href: "awards", id: "awardsPage" },
  { href: "stats", id: "statsPage" },
  { href: "cheatsheet", id: "cheatSheetPage" },
  { href: "emcee", id: "emceePage" },
];

const supportedYears = [
  { label: "2025 REEFSCAPE℠ presented by Haas", value: "2025" },
  { label: "2024 CRESCENDO℠", value: "2024" },
  { label: "2023 CHARGED UP℠ presented by Haas", value: "2023" },
  { label: "2022 RAPID REACT℠ presented by The Boeing Company", value: "2022" },
  { label: "2021 Infinite Recharge", value: "2021" },
  { label: "2020 INFINITE RECHARGE", value: "2020" },
];

const paleYellow = "#fdfaed";
const paleBlue = "#effdff";

function LayoutsWithNavbar({
  selectedEvent,
  practiceSchedule,
  qualSchedule,
  playoffs,
  teamList,
  communityUpdates,
  rankings,
  eventHighScores,
  worldHighScores,
  allianceSelection,
  systemBell,
  systemMessage,
}) {
  return (
    <>
      <MainNavigation
        selectedEvent={selectedEvent}
        qualSchedule={qualSchedule}
        playoffs={playoffs}
        teamList={teamList}
        communityUpdates={communityUpdates}
        rankings={rankings}
        eventHighScores={eventHighScores}
        worldHighScores={worldHighScores}
        allianceSelection={allianceSelection}
        practiceSchedule={practiceSchedule}
        systemBell={systemBell}
        systemMessage={systemMessage}
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
  const {
    isAuthenticated,
    isLoading,
    user,
    getAccessTokenSilently,
    loginWithRedirect,
  } = useAuth0();

  useEffect(() => {
    const checkLogin = async () => {
      try {
        await getAccessTokenSilently();
      } catch (error) {
        console.log("Error refreshing access token:", error);
      }
    };
    checkLogin();
  }, [getAccessTokenSilently, isAuthenticated, loginWithRedirect]);

  // eslint-disable-next-line no-unused-vars
  const [httpClient] = UseAuthClient();
  const [selectedEvent, setSelectedEvent] = usePersistentState(
    "setting:selectedEvent",
    null
  );
  const [selectedYear, setSelectedYear] = usePersistentState(
    "setting:selectedYear",
    null
  );
  const [events, setEvents] = usePersistentState("cache:events", []);
  const [districts, setDistricts] = usePersistentState("cache:districts", []);
  const [eventLabel, setEventLabel] = usePersistentState(
    "cache:eventLabel",
    null
  );
  const [playoffSchedule, setPlayoffSchedule] = usePersistentState(
    "cache:playoffSchedule",
    null
  );
  const [qualSchedule, setQualSchedule] = usePersistentState(
    "cache:qualSchedule",
    null
  );
  const [practiceSchedule, setPracticeSchedule] = usePersistentState(
    "cache:practiceSchedule",
    null
  );
  const [practiceFileUploaded, setPracticeFileUploaded] = usePersistentState(
    "cache:practiceFileUploaded",
    false
  );
  const [offlinePlayoffSchedule, setOfflinePlayoffSchedule] =
    usePersistentState("cache:offlinePlayoffSchedule", null);
  const [playoffOnly, setPlayoffOnly] = useState(false);
  const [champsStyle, setChampsStyle] = useState(false);
  const [teamList, setTeamList] = usePersistentState("cache:teamList", null);
  const [robotImages, setRobotImages] = usePersistentState(
    "cache:robotImages",
    null
  );
  const [rankings, setRankings] = usePersistentState("cache:rankings", null);
  const [EPA, setEPA] = usePersistentState("cache:EPA", null);
  const [rankingsOverride, setRankingsOverride] = usePersistentState(
    "setting:rankingsOverride",
    null
  );
  const [useCheesyArena, setUseCheesyArena] = usePersistentState(
    "setting:useCheesyArena",
    null
  );
  const [cheesyTeamList, setCheesyTeamList] = useState([]);
  const [alliances, setAlliances] = usePersistentState("cache:alliances", null);
  const [communityUpdates, setCommunityUpdates] = usePersistentState(
    "cache:communityUpdates",
    null
  );
  const [eventFilters, setEventFilters] = usePersistentState(
    "setting:eventFilters",
    []
  );
  const [timeFilter, setTimeFilter] = usePersistentState(
    "setting:timeFilter",
    null
  );
  const [timeFormat, setTimeFormat] = usePersistentState("setting:timeFormat", {
    label: "12hr",
    value: "h:mm:ss a",
  });
  const [showSponsors, setShowSponsors] = usePersistentState(
    "setting:showSponsors",
    null
  );
  const [autoHideSponsors, setAutoHideSponsors] = usePersistentState(
    "setting:autoHideSponsors",
    null
  );
  const [showAwards, setShowAwards] = usePersistentState(
    "setting:showAwards",
    null
  );
  const [showMinorAwards, setShowMinorAwards] = usePersistentState(
    "setting:showMinorAwards",
    null
  );
  const [showNotes, setShowNotes] = usePersistentState(
    "setting:showNotes",
    null
  );
  const [showNotesAnnounce, setShowNotesAnnounce] = usePersistentState(
    "setting:showNotesAnnounce",
    null
  );
  const [showMottoes, setShowMottoes] = usePersistentState(
    "setting:showMottoes",
    null
  );
  const [showChampsStats, setShowChampsStats] = usePersistentState(
    "setting:showChampsStats",
    null
  );
  const [showDistrictChampsStats, setShowDistrictChampsStats] =
    usePersistentState("setting:showDistrictChampsStats", null);
  const [hidePracticeSchedule, setHidePracticeSchedule] = usePersistentState(
    "setting:hidePracticeSchedule"
  );
  const [monthsWarning, setMonthsWarning] = usePersistentState(
    "setting:monthsWarning",
    { label: "6 months", value: "6" }
  );
  const [showInspection, setShowInspection] = usePersistentState(
    "setting:showInspection",
    false
  );

  const [swapScreen, setSwapScreen] = usePersistentState(
    "setting:swapScreen",
    null
  );
  const [autoAdvance, setAutoAdvance] = usePersistentState(
    "setting:autoAdvance",
    null
  );
  const [highScoreMode, setHighScoreMode] = usePersistentState(
    "setting:highScoreMode",
    null
  );

  const [autoUpdate, setAutoUpdate] = usePersistentState(
    "setting:autoUpdate",
    null
  );
  const [awardsMenu, setAwardsMenu] = usePersistentState(
    "setting:awardsMenu",
    null
  );
  const [showQualsStats, setShowQualsStats] = usePersistentState(
    "setting:showQualsStats",
    null
  );
  const [showQualsStatsQuals, setShowQualsStatsQuals] = usePersistentState(
    "setting:showQualsStatsQuals",
    null
  );
  const [worldStats, setWorldStats] = usePersistentState("cache:stats", null);
  const [eventHighScores, setEventHighScores] = usePersistentState(
    "cache:eventHighScores",
    null
  );
  const [teamReduction, setTeamReduction] = usePersistentState(
    "setting:teamReduction",
    0
  );
  const [allianceSelection, setAllianceSelection] = useState(null);
  const [playoffs, setPlayoffs] = usePersistentState("cache:playoffs", null);
  const [playoffCountOverride, setPlayoffCountOverride] = usePersistentState(
    "setting:playoffCountOverride",
    null
  );
  const [allianceCount, setAllianceCount] = usePersistentState(
    "setting:allianceCount",
    null
  );
  const [lastVisit, setLastVisit] = usePersistentState("cache:lastVisit", {});
  const [localUpdates, setLocalUpdates] = usePersistentState(
    "cache:localUpdates",
    []
  );
  const [allianceSelectionArrays, setAllianceSelectionArrays] = useState({});
  const [reverseEmcee, setReverseEmcee] = usePersistentState(
    "setting:reverseEmcee",
    null
  );
  const [eventNamesCY, setEventNamesCY] = usePersistentState(
    "cache:eventNamesCY",
    []
  );
  const [districtRankings, setDistrictRankings] = usePersistentState(
    "cache:districtRankings",
    null
  );
  const [adHocMatch, setAdHocMatch] = useState([
    { teamNumber: null, station: "Red1", surrogate: false, dq: false },
    { teamNumber: null, station: "Red2", surrogate: false, dq: false },
    { teamNumber: null, station: "Red3", surrogate: false, dq: false },
    { teamNumber: null, station: "Blue1", surrogate: false, dq: false },
    { teamNumber: null, station: "Blue2", surrogate: false, dq: false },
    { teamNumber: null, station: "Blue3", surrogate: false, dq: false },
  ]);
  const [adHocMode, setAdHocMode] = useState(null);
  const [backupTeam, setBackupTeam] = useState(null);
  const [showReloaded, setShowReloaded] = usePersistentState(
    "cache:showReloaded",
    false
  );
  const [qualsLength, setQualsLength] = useState(-1);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [useSwipe, setUseSwipe] = usePersistentState("cache:useSwipe", false);
  const [usePullDownToUpdate, setUsePullDownToUpdate] = usePersistentState(
    "setting:usePullDownToUpdate",
    false
  );

  // Controllers for table sort order at render time
  const [teamSort, setTeamSort] = useState("");
  const [rankSort, setRankSort] = useState("");

  const isOnline = useOnlineStatus();
  const [teamListLoading, setTeamListLoading] = useState("");
  const [loadingCommunityUpdates, setLoadingCommunityUpdates] = useState(false);
  const [haveChampsTeams, setHaveChampsTeams] = useState(false);
  const [EITeams, setEITeams] = useState([]);
  const [systemMessage, setSystemMessage] = usePersistentState(
    "setting:systemMessage",
    null
  );
  const [systemBell, setSystemBell] = usePersistentState(
    "setting:systemBell",
    ""
  );
  const [eventMessage, setEventMessage] = usePersistentState(
    "setting:eventMessage",
    []
  );
  const [eventBell, setEventBell] = usePersistentState("setting:eventBell", []);

  // Handle update notifications from the service worker
  const { waitingWorker, showReload, reloadPage } = useServiceWorker();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  // Cheesy Arena status
  const [cheesyArenaAvailable, setCheesyArenaAvailable] = useState(false);

  /**
   * Function to get the Cheesy Arena status by connecting to the Cheesy Arena API
   */
  const getCheesyStatus = async () => {
    // See if you can connect to Cheesy Arena
    try {
      var result = await fetch(
        "http://10.0.100.5:8443/api/matches/qualification"
      );
      var data = result.status === 200;

      // Set the IP address to the constant `ip`
      if (data) {
        setCheesyArenaAvailable(true);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log("Error fetching Cheesy Arena status:", error.message);
      setCheesyArenaAvailable(false);
      return false;
    }
  };

  // Display an alert when there are updates to the app. This allows the user to update the cached code.
  useEffect(() => {
    const reload = () => {
      setShowReloaded(true);
      reloadPage();
    };

    if (showReload && waitingWorker) {
      enqueueSnackbar("A new version was released.", {
        persist: true,
        variant: "success",
        action: (
          <>
            <Button
              className="snackbar-button"
              color="primary"
              onClick={reload}
            >
              Reload and Update
            </Button>
          </>
        ),
      });
    }
  }, [waitingWorker, showReload, setShowReloaded, reloadPage, enqueueSnackbar]);

  // Display an alert when updates have been made to the app. The user can clear the message.
  useEffect(() => {
    const closeSnackBar = () => {
      setShowReloaded(false);
      closeSnackbar();
    };

    if (showReloaded) {
      enqueueSnackbar(
        <div>
          A new version was released. Here's what changed on{" "}
          {appUpdates[0].date}:<br />
          {appUpdates[0].message}
        </div>,
        {
          persist: false,
          autoHideDuration: 7500,
          variant: "success",
          action: (
            <>
              <Button
                className="snackbar-button"
                color="primary"
                onClick={closeSnackBar}
              >
                Return to Announcing
              </Button>
            </>
          ),
        }
      );
    }
  }, [showReloaded, setShowReloaded, enqueueSnackbar, closeSnackbar]);

  /**
   * Trim all values in an array
   * @function trimArray
   * @param arr the array to trim
   * @return {array} the trimmed array
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

  //functions to retrieve API data

  /**
   * Returns whether the event is Champs
   * @constant inWorldChamps
   * @return {boolean}
   * */
  const inWorldChamps = () => {
    if (selectedEvent?.value?.champLevel === "CHAMPS") {
      return true;
    } else {
      return false;
    }
  };

  /**
   * @constant conformCheesyArenaMatch
   * @param match Match details from TBA
   * @param level Tournament Level
   */
  const conformCheesyArenaMatch = (match, level) => {
    return {
      description: match?.LongName,
      tournamentLevel: level,
      matchNumber: match?.TbaMatchKey?.MatchNumber,
      startTime: match?.Time,
      actualStartTime: match?.StartedAt,
      postResultTime: match?.ScoreCommittedAt,
      scoreRedFinal: match?.Result?.RedSummary?.Score,
      scoreRedFoul: match?.Result?.RedSummary?.FoulPoints,
      scoreRedAuto: match?.Result?.RedSummary?.AutoPoints,
      scoreBlueFinal: match?.Result?.BlueSummary?.Score,
      scoreBlueFoul: match?.Result?.BlueSummary?.FoulPoints,
      scoreBlueAuto: match?.Result?.BlueSummary?.AutoPoints,
      teams: [
        {
          teamNumber: match?.Red1,
          station: "Red1",
          surrogate: match?.Red1IsSurrogate,
          dq: !1,
        },
        {
          teamNumber: match?.Red2,
          station: "Red2",
          surrogate: match?.Red2IsSurrogate,
          dq: !1,
        },
        {
          teamNumber: match?.Red3,
          station: "Red3",
          surrogate: match?.Red3IsSurrogate,
          dq: !1,
        },
        {
          teamNumber: match?.Blue1,
          station: "Blue1",
          surrogate: match?.Blue1IsSurrogate,
          dq: !1,
        },
        {
          teamNumber: match?.Blue2,
          station: "Blue2",
          surrogate: match?.Blue2IsSurrogate,
          dq: !1,
        },
        {
          teamNumber: match?.Blue3,
          station: "Blue3",
          surrogate: match?.Blue3IsSurrogate,
          dq: !1,
        },
      ],
      winner: { winner: "", tieWinner: "", level: 0 },
    };
  };

  /**
   * @constant conformCheesyArenaScores
   * @param match Match details from TBA
   * @param level Tournament Level
   */
  const conformCheesyArenaScores = (match, level) => {
    return {
      matchLevel: level,
      matchNumber: match?.TbaMatchKey?.MatchNumber,
      winningAlliance:
        match?.RedSummary?.Score > match?.BlueSummary?.Score
          ? 1
          : match?.RedSummary?.Score < match?.BlueSummary?.Score
          ? 2
          : 0,
      tiebreaker: {
        item1: !match?.UseTiebreakCriteria ? -1 : 1,
        item2: match?.UseTiebreakCriteria ? match?.UseTiebreakCriteria : "",
      },
      coopertitionBonusAchieved:
        match?.RedSummary?.CoopertitionBonus ||
        match?.BlueSummary?.CoopertitionBonus,
      alliances: [
        { ...match?.Result?.BlueScore, alliance: "Blue" },
        { ...match?.Result?.RedScore, alliance: "Red" },
      ],
    };
  };

  /**
   * @constant conformCheesyArenaRankings
   * @param match Match details from TBA
   * @param level Tournament Level
   */
  const conformCheesyArenaRankings = (team) => {
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
          : null,
      dq: team?.Disqualifications,
      matchesPlayed: team?.Played,
    };
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
   * @param selectedEvent The currently selected event, which is a persistent state variable
   * @param selectedYear The currently selected year, which is a persistent state variable
   *
   * @return Sets the event high scores, qual schedule and playoff
   */
  async function getSchedule(loadingEvent) {
    console.log(`Fetching schedule for ${selectedEvent?.value?.name}...`);

    /**
     * Returns the winner of the match
     * @function winner
     * @param {object} match - The match to test
     * @return an object containing the winning alliance, and in the event of a tie, the tiebreaker level.
     */
    function winner(match) {
      var winner = { winner: "", tieWinner: "", level: 0 };
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

    var practiceschedule = null;
    var qualschedule = null;
    var qualScores = null;
    var playoffschedule = null;
    var playoffScores = null;
    var qualslength = 0;

    console.log(
      `Fetching Practice Schedule for ${selectedEvent?.value?.name}...`
    );
    if (
      selectedEvent?.value?.code.includes("OFFLINE") ||
      selectedEvent?.value?.code.includes("PRACTICE")
    ) {
      //create null schedule because there are no practice schedules for these events or they are using Cheesy Arena
      practiceschedule = { schedule: { schedule: [] } };
    } else if (!selectedEvent?.value?.code.includes("PRACTICE")) {
      if (useCheesyArena && cheesyArenaAvailable) {
        // get schedule from Cheesy Arena
        var result = await fetch("http://10.0.100.5:8443/api/matches/practice");
        var data = await result.json();
        if (data.length > 0) {
          // reformat data to match FIRST API format
          practiceschedule = {
            schedule: {
              schedule: data.map((match) => {
                return conformCheesyArenaMatch(match, "Practice");
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
      } else {
        // get the practice schedule from FIRST API
        const practiceResult = await httpClient.getNoAuth(
          `${selectedYear?.value}/schedule/hybrid/${selectedEvent?.value.code}/practice`
        );
        practiceschedule = await practiceResult.json();
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
      practiceschedule?.schedule?.schedule.length > 0
    ) {
      if (typeof practiceSchedule?.schedule?.schedule !== "undefined") {
        practiceSchedule.schedule = practiceSchedule?.schedule?.schedule;
      }

      if (practiceFileUploaded) {
        setPracticeFileUploaded(false);
      }
      practiceschedule.lastUpdate = moment();
      setPracticeSchedule(practiceschedule);
    }

    console.log(`Fetching Qual Schedule for ${selectedEvent?.value?.name}...`);
    if (selectedEvent?.value?.code.includes("OFFLINE")) {
      //do something
      qualschedule = { schedule: { schedule: [] } };
    } else if (!selectedEvent?.value?.code.includes("PRACTICE")) {
      if (useCheesyArena && cheesyArenaAvailable) {
        // get schedule from Cheesy Arena
        result = await fetch(
          "http://10.0.100.5:8443/api/matches/qualification"
        );
        data = await result.json();
        if (data.length > 0) {
          // reformat data to match FIRST API format
          qualschedule = {
            schedule: {
              schedule: data.map((match) => {
                return conformCheesyArenaMatch(match, "Qualification");
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
      } else {
        const qualsResult = await httpClient.getNoAuth(
          `${selectedYear?.value}/schedule/hybrid/${selectedEvent?.value.code}/qual`
        );
        qualschedule = await qualsResult.json();

        const qualsScoresResult = await httpClient.getNoAuth(
          `${selectedYear?.value}/scores/${selectedEvent?.value.code}/qual`
        );

        qualScores = await qualsScoresResult.json();
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

    const qualMatches = qualschedule?.schedule?.schedule.map((match) => {
      match.winner = winner(match);
      if (qualScores?.MatchScores) {
        const matchResults = qualScores.MatchScores.filter((scoreMatch) => {
          return scoreMatch.matchNumber === match.matchNumber;
        })[0];
        if (matchResults) {
          match.scores = matchResults;
          match.redRP = _.pickBy(matchResults.alliances[1], (value, key) => {
            return key.endsWith("BonusAchieved");
          });
          match.blueRP = _.pickBy(matchResults.alliances[0], (value, key) => {
            return key.endsWith("BonusAchieved");
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

    qualschedule.lastUpdate = moment();
    await setQualSchedule(qualschedule);
    if (
      practiceschedule?.schedule?.length > 0 &&
      qualschedule?.schedule?.length === 0
    ) {
      qualslength = practiceschedule?.schedule?.length;
    } else if (qualschedule?.schedule?.length > 0) {
      qualslength = qualschedule?.schedule?.length;
    }
    setQualsLength(qualslength);

    console.log(
      `Fetching Playoff Schedule for ${selectedEvent?.value?.name}...`
    );
    //get the playoff schedule
    completedMatchCount = 0;
    if (selectedEvent?.value?.code.includes("OFFLINE")) {
      //set playoffschedule to be empty
      playoffschedule = { schedule: { schedule: [] } };
    } else if (!selectedEvent?.value?.code.includes("PRACTICE")) {
      if (useCheesyArena && cheesyArenaAvailable) {
        // get scores and schedule from Cheesy Arena
        result = await fetch("http://10.0.100.5:8443/api/matches/playoff");
        data = await result.json();
        if (data.length > 0) {
          // reformat data to match FIRST API format
          playoffschedule = {
            schedule: {
              schedule: data.map((match) => {
                return conformCheesyArenaMatch(match, "Playoff");
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
      } else {
        const playoffResult = await httpClient.getNoAuth(
          `${selectedYear?.value}/schedule/hybrid/${selectedEvent?.value.code}/playoff`
        );
        playoffschedule = await playoffResult.json();
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

    if (!selectedEvent?.value?.code.includes("PRACTICE")) {
      const playoffScoresResult = await httpClient.getNoAuth(
        `${selectedYear?.value}/scores/${selectedEvent?.value.code}/playoff`
      );
      playoffScores = await playoffScoresResult.json();
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
      playoffschedule.schedule = playoffschedule.schedule.map((match) => {
        match.winner = winner(match);
        //figure out how to match scores to match
        if (playoffScores?.MatchScores) {
          const matchResults = playoffScores.MatchScores.filter(
            (scoreMatch) => {
              return scoreMatch.matchNumber === match.matchNumber;
            }
          )[0];
          if (matchResults) {
            match.scores = matchResults;
          }
        }
        return match;
      });

      _.forEach(playoffScores.MatchScores, (score) => {
        if (score.alliances[0].totalPoints === score.alliances[1].totalPoints) {
          playoffschedule.schedule[
            _.findIndex(playoffschedule.schedule, {
              matchNumber: score.matchNumber,
            })
          ].winner.tieWinner =
            score?.winningAlliance === 2
              ? "blue"
              : score?.winningAlliance === 1
              ? "red"
              : "TBD";
          playoffschedule.schedule[
            _.findIndex(playoffschedule.schedule, {
              matchNumber: score.matchNumber,
            })
          ].winner.level =
            score?.tiebreaker?.item1 >= 0 ? score?.tiebreaker?.item1 : 0;
          playoffschedule.schedule[
            _.findIndex(playoffschedule.schedule, {
              matchNumber: score.matchNumber,
            })
          ].winner.tieDetail = score?.tiebreaker?.item2;
        }
      });
    }

    var lastMatchPlayed = 0;

    if (qualschedule?.completedMatchCount > 0) {
      lastMatchPlayed += qualschedule?.completedMatchCount;
    }

    if (playoffschedule?.completedMatchCount > 0) {
      lastMatchPlayed += playoffschedule?.completedMatchCount;
    }
    if ((loadingEvent && autoAdvance) || autoUpdate) {
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
    playoffschedule.lastUpdate = moment();
    setPlayoffSchedule(playoffschedule);
    getRanks();
    getSystemMessages();
  }

  /**
   *  This function retrieves a a list of teams for a specific event from FIRST. It parses the list and modifies some of the data to produce more readable content.
   * @async
   * @function getTeamList
   * @param adHocTeamList When loading a team list from a spreadsheet, this is the array of teams in the event
   * @return sets the teamList
   */
  async function getTeamList(adHocTeamList) {
    if (
      (teamListLoading === "" ||
        teamListLoading !== selectedEvent?.value?.name) &&
      (selectedEvent?.value?.code !== "OFFLINE" || adHocTeamList)
    ) {
      console.log(`Fetching team list for ${selectedEvent?.value?.name}...`);
      setTeamListLoading(selectedEvent?.value?.name);
      /**
       * Determines whether an award, by name, deserves special highlighting in the Announce Screen
       * @function awardsHilight
       * @param awardName The name of the award to highlight
       * @return true if "special" award; false if not
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
          awardName === "Rookie All Star Award"
        ) {
          return true;
        } else {
          return false;
        }
      }

      var result = null;
      var teams = null;

      if (
        selectedEvent?.value?.code.includes("OFFLINE") ||
        inWorldChamps() ||
        (cheesyArenaAvailable && useCheesyArena)
      ) {
        teams = {
          teamCountTotal: adHocTeamList?.length || 0,
          teamCountPage: 1,
          pageCurrent: 1,
          pageTotal: 1,
          teams: [],
        };
        if (adHocTeamList) {
          //https://api.gatool.org/v3/2023/teams?teamNumber=172

          var adHocTeams = adHocTeamList.map(async (team) => {
            var request = await httpClient.getNoAuth(
              `${selectedYear?.value}/teams?teamNumber=${team}`
            );
            var teamDetails = await request.json();

            return teamDetails.teams[0];
          });

          await Promise.all(adHocTeams).then(function (values) {
            // set the team list from the team list.
            console.log(
              `Fetching community updates for ${selectedEvent?.value?.name} from getTeamList`
            );
            teams.teams = values;
            getCommunityUpdates(false, values);
          });
        }
      } else if (!selectedEvent?.value?.code.includes("PRACTICE")) {
        // get the team list from FIRST API
        result = await httpClient.getNoAuth(
          `${selectedYear?.value}/teams?eventCode=${selectedEvent?.value?.code}`
        );
        teams = await result.json();
      } else {
        teams = training.teams.teams;
      }

      if (typeof teams.Teams !== "undefined") {
        teams.teams = teams.Teams;
        delete teams.Teams;
      }

      // handle District EI and RAS teams
      // if District Champs, filter list of events by district code
      var districtEvents = null;
      if (
        events &&
        (selectedEvent?.value?.type === "DistrictChampionship" ||
          selectedEvent?.value?.type === "DistrictChampionshipWithLevels")
      ) {
        districtEvents = _.filter(events, {
          value: { districtCode: selectedEvent?.value?.districtCode },
        });
        // get awards for those filtered events
        var districtEITeams = districtEvents.map(async (event) => {
          var request = await httpClient.getNoAuth(
            `${selectedYear?.value}/awards/event/${event?.value?.code}`
          );
          var eventDetails = await request.json();
          // filter that list by EI {awardId: "633"} {name: "District Engineering Inspiration Award"} and {awardID: "417"} {name:"Rookie All Star Award"}
          return _.filter(eventDetails?.Awards, (award) => {
            return award.awardId === 633 || award.awardId === 417;
          });
        });

        await Promise.all(districtEITeams).then(async function (values) {
          var tempTeams = [];
          values.forEach((value) => {
            // @ts-ignore
            if (value[0]?.teamNumber) {
              if (
                _.findIndex(teams.teams, { teamNumber: value[0]?.teamNumber }) <
                0
              ) {
                // @ts-ignore
                tempTeams.push(value[0]?.teamNumber);
              }
            }
          });
          // get team details for those teams not in this event
          if (tempTeams.length > 0) {
            var EITeamData = tempTeams.map(async (teamNumber) => {
              var request = await httpClient.getNoAuth(
                `${selectedYear?.value}/teams?teamNumber=${teamNumber}`
              );
              var teamDetails = await request.json();
              return teamDetails.teams[0];
            });

            await Promise.all(EITeamData).then((values) => {
              // merge with teams.teams
              if (values.length > 0) {
                //prepare to get community updates for these teams
                setEITeams(values);
                values.forEach((value) => {
                  teams.teams.push(value);
                });
                teams.teams = _.sortBy(teams.teams, ["teamNumber"]);
              }
            });
          }
        });
      }

      // Fix the sponsors now that teams are loaded

      // prepare to separate and combine sponsors and organization name
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

      //fetch awards for the current teams
      var newTeams = teams.teams.map(async (team) => {
        var request = await httpClient.getNoAuth(
          `${selectedYear?.value}/team/${team?.teamNumber}/awards`
        );
        var awards = await request.json();
        team.awards = awards;
        return team;
      });

      await Promise.all(newTeams).then(function (values) {
        // Parse awards to ensure we highlight them properly and remove extraneous text i.e. FIRST CHampionship from name
        var formattedAwards = values.map((team) => {
          // Add in special awards not reported by FIRST APIs (from 2021 season)
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
                team.awards[`${selectedYear?.value - index}`].Awards = _.concat(
                  team.awards[`${selectedYear?.value - index}`].Awards,
                  teamAwards
                );
              }
            }
          }
          var awardYears = Object.keys(team?.awards);

          //Ensure that current year event names change when Division or sponsor names change
          events.forEach((event) => {
            // if (!eventnames[selectedYear?.value]) {
            //   eventnames[selectedYear?.value] = {};
            // }
            eventnames[selectedYear?.value][event?.value?.code] =
              event?.value?.name;
          });

          setEventNamesCY(eventnames[selectedYear?.value]);

          awardYears?.forEach((year) => {
            if (team?.awards[`${year}`] !== null) {
              team.awards[`${year}`].Awards = team?.awards[
                `${year}`
              ]?.Awards.map((award) => {
                award.highlight = awardsHilight(award.name);
                award.eventName = eventnames[`${year}`][award.eventCode];
                award.year = year;
                return award;
              });
            } else {
              team.awards[`${year}`] = { Awards: [] };
            }
          });
          team.hallOfFame = [];
          _.filter(halloffame, { Chairmans: team.teamNumber }).forEach(
            (award) => {
              team.hallOfFame.push({
                year: award.Year,
                challenge: award.Challenge,
                type: "chairmans",
              });
            }
          );
          _.filter(halloffame, { Impact: team.teamNumber }).forEach((award) => {
            team.hallOfFame.push({
              year: award.Year,
              challenge: award.Challenge,
              type: "impact",
            });
          });
          _.filter(halloffame, { Winner1: team.teamNumber }).forEach(
            (award) => {
              team.hallOfFame.push({
                year: award.Year,
                challenge: award.Challenge,
                type: "winner",
              });
            }
          );
          _.filter(halloffame, { Winner2: team.teamNumber }).forEach(
            (award) => {
              team.hallOfFame.push({
                year: award.Year,
                challenge: award.Challenge,
                type: "winner",
              });
            }
          );
          _.filter(halloffame, { Winner3: team.teamNumber }).forEach(
            (award) => {
              team.hallOfFame.push({
                year: award.Year,
                challenge: award.Challenge,
                type: "winner",
              });
            }
          );
          _.filter(halloffame, { Winner4: team.teamNumber }).forEach(
            (award) => {
              team.hallOfFame.push({
                year: award.Year,
                challenge: award.Challenge,
                type: "winner",
              });
            }
          );
          _.filter(halloffame, { Winner5: team.teamNumber }).forEach(
            (award) => {
              team.hallOfFame.push({
                year: award.Year,
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
        });
        teams.teams = formattedAwards;

        var champsTeams = [];
        if (
          selectedEvent?.value?.champLevel !== "" ||
          showDistrictChampsStats ||
          (selectedEvent?.value?.code.includes("OFFLINE") &&
            playoffOnly &&
            champsStyle)
        ) {
          console.log("Getting Champs stats");
          champsTeams = teams.teams.map(async (team) => {
            var champsRequest = await httpClient.getNoAuth(
              `/team/${team?.teamNumber}/appearances`
            );
            var appearances = await champsRequest.json();
            var result = {
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
                    result.districtChampsAppearances += 1;
                    result.districtChampsAppearancesYears.push(appearance.year);
                  }
                  if (appearance.event_type === 2 && timeDifference < 0) {
                    result.districtEinsteinAppearances += 1;
                    result.districtEinsteinAppearancesYears.push(
                      appearance.year
                    );
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
                if (appearance.event_type === 4 && timeDifference < 0) {
                  result.einsteinAppearances += 1;
                  result.einsteinAppearancesYears.push(appearance.year);
                }
              }
            });

            team.champsAppearances = result;
            return team;
          });

          Promise.all(champsTeams).then(function (values) {
            teams.lastUpdate = moment();

            teams.teams = values;
            setTeamList(teams);
            //getRobotImages(teams);
          });
        } else {
          teams.lastUpdate = moment();
          setTeamList(teams);
          //getRobotImages(teams);
        }
      });
      setTeamListLoading("");
    } else {
      console.log(
        `Team List for ${selectedEvent?.value?.name} is loading. Skipping...`
      );
    }
  }

  /**
   * This function retrieves communnity updates for a specified event from gatool Cloud.
   * @async
   * @function getCommunityUpdates
   * @param notify boolean set to Toast if the request is successful
   * @param selectedYear The currently selected year, which is a persistent state variable
   * @param ignoreLocalUpdates don't load the community updates
   * @param selectedEvent The currently selected event, which is a persistent state variable
   * @param adHocTeamList A list of team numbers to support offline events
   * @return sets the communityUpdates persistent state
   */
  async function getCommunityUpdates(
    notify,
    adHocTeamList,
    ignoreLocalUpdates
  ) {
    if (selectedEvent) {
      if (!loadingCommunityUpdates) {
        setLoadingCommunityUpdates(true);
        console.log(
          `Fetching community updates for ${selectedEvent?.value?.name}...`
        );
        var result = null;
        var teams = [];

        if (
          selectedEvent?.value?.code.includes("OFFLINE") ||
          (cheesyArenaAvailable && useCheesyArena)
        ) {
          //Do something with the team list
          if (adHocTeamList) {
            // https://api.gatool.org/v3/team/172/updates
            console.log("Teams List loaded. Update from the Community");
            var adHocTeams = adHocTeamList.map(async (team) => {
              var request = await httpClient.getNoAuth(
                `/team/${team?.teamNumber}/updates`
              );
              var teamDetails = { teamNumber: team?.teamNumber };
              var teamUpdate = _.cloneDeep(communityUpdateTemplate);
              if (request.status === 200) {
                teamUpdate = await request?.json();
              }
              teamDetails.updates = teamUpdate;
              teamDetails.teamNumber = team?.teamNumber;
              return teamDetails;
            });

            await Promise.all(adHocTeams).then(function (values) {
              teams = values;
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
            });
          } else {
            console.log("no teams loaded yet");
            teams = [];
          }
        } else if (!selectedEvent?.value?.code.includes("PRACTICE")) {
          result = await httpClient.getNoAuth(
            `${selectedYear?.value}/communityUpdates/${selectedEvent?.value.code}`
          );
          teams = await result.json();
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
                `/team/${EITeam?.teamNumber}/updates`
              );
              var teamDetails = { teamNumber: EITeam?.teamNumber };
              var teamUpdate = _.cloneDeep(communityUpdateTemplate);
              if (request?.status === 200) {
                teamUpdate = await request.json();
              }
              teamDetails.updates = teamUpdate;
              teamDetails.teamNumber = EITeam?.teamNumber;
              return teamDetails;
            });

            await Promise.all(EIUpdates).then((values) => {
              teams = _.concat(teams, values);
            });
            teams.lastUpdate = moment();
            if (notify) {
              toast.success(
                `Your team data is now up to date including EI teams.`
              );
            }
            setCommunityUpdates(teams);
            setLoadingCommunityUpdates(false);
          } else {
            teams.lastUpdate = moment();
            if (notify) {
              toast.success(`Your team data is now up to date.`);
            }
            setCommunityUpdates(teams);
            setLoadingCommunityUpdates(false);
          }
        } else {
          setLoadingCommunityUpdates(false);
        }
      } else {
        console.log(`No event loaded. Skipping...`);
      }
    }
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
    console.log(`Fetching Ranks for ${selectedEvent?.value?.name}...`);
    var result = null;
    var ranks = null;
    if (selectedEvent?.value?.code.includes("OFFLINE")) {
      ranks = { rankings: { Rankings: [] } };
    } else if (!selectedEvent?.value?.code.includes("PRACTICE")) {
      if (useCheesyArena && cheesyArenaAvailable) {
        // get rankings from Cheesy Arena
        result = await fetch("http://10.0.100.5:8443/api/rankings");
        var data = await result.json();
        if (data?.Rankings.length > 0) {
          // reformat data to FIRST API Rankings format
          ranks = {
            rankings: {
              rankings: data?.Rankings.map((team) => {
                return conformCheesyArenaRankings(team);
              }),
            },
          };
        }
      } else {
        //do not use Cheesy Arena and use FIRST API
        result = await httpClient.getNoAuth(
          `${selectedYear?.value}/rankings/${selectedEvent?.value.code}`
        );
        ranks = await result.json();
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

    ranks.lastModified = ranks.headers
      ? moment(ranks?.headers["last-modified"])
      : moment();
    ranks.lastUpdate = moment();
    setRankings(ranks);
    getEPA();
    if (selectedEvent?.value.districtCode) {
      getDistrictRanks();
    }
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
    result = await httpClient.getNoAuth(
      `${selectedYear?.value}/district/rankings/${selectedEvent?.value.districtCode}`
    );
    districtranks = await result.json();
    districtranks.lastUpdate = moment();
    setDistrictRankings(districtranks);
  }

  /** This function retrieves URLs for robot images from The Blue Alliance
   * @async
   * @function getRobotImages
   * @param selectedYear The currently selected year, which is a persistent state variable
   * @param teams The event's team list
   * @return sets the array of URLs
   */
  async function getRobotImages() {
    var robotImageList = teamList?.teams.map(async (team) => {
      var media = await httpClient.getNoAuth(
        `${selectedYear?.value}/team/${team?.teamNumber}/media`
      );
      var mediaArray = await media.json();
      var image = _.filter(mediaArray, { type: "imgur" })[0];
      return {
        teamNumber: team?.teamNumber,
        imageURL: image?.direct_url || null,
      };
    });
    await Promise.all(robotImageList).then((values) => {
      setRobotImages(values);
    });
  }

  async function getEPA() {
    var epa = teamList?.teams.map(async (team) => {
      var epaData = await httpClient.getNoAuth(
        `team_year/${team?.teamNumber}/${selectedYear?.value}`,
        "https://api.statbotics.io/v3/"
      );
      if (epaData.status === 500) {
        return {
          teamNumber: team?.teamNumber,
          epa: {},
        };
      } else {
        var epaArray = await epaData.json();
        return {
          teamNumber: team?.teamNumber,
          epa: epaArray,
        };
      }
    });
    if (Array.isArray(epa) && epa.length > 0) {
      Promise.all(epa).then((values) => {
        setEPA(values);
      });
    }
  }

  /**
   * This function retrieves the world high scores for the selected year from FIRST.
   * @async
   * @function getWorldStats
   * @param selectedYear The currently selected year, which is a persistent state variable
   * @returns sets the world high scores
   */
  async function getWorldStats() {
    var result = await httpClient.getNoAuth(
      `${selectedYear?.value}/highscores`
    );
    var highscores = await result.json();
    var scores = {};
    var reducedScores = {};

    scores.year = selectedYear?.value;
    scores.lastUpdate = moment();

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
        details.score = score.matchData.match[`score${details.alliance}Final`];
        reducedScores[details.scoreType] = details;
      }
    });
    scores.highscores = reducedScores;

    setWorldStats(scores);
  }

  /**
   * This function retrieves the event high scores for the selected event from FIRST.
   * @async
   * @function getEventStats
   * @param year The currently selected year
   * @param code The currently selected event code
   * @returns sets the world high scores
   */
  async function getEventStats(year, code) {
    var result = await httpClient.getNoAuth(`${year}/highscores/${code}`);
    var highscores = await result.json();
    var scores = {};
    var reducedScores = {};

    scores.year = year;
    scores.lastUpdate = moment();

    highscores.forEach((score) => {
      if (score?.matchData?.match) {
        var details = {};
        if (!_.isEmpty(eventnames[worldStats?.year])) {
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
        details.score = score.matchData.match[`score${details.alliance}Final`];
        reducedScores[details.scoreType] = details;
      }
    });
    scores.highscores = reducedScores;

    setEventHighScores(scores);
  }
  /**
   * This function retrieves the Playoff Alliance data for a specified event from FIRST. It also formats the Alliance data to better support lookups in the playoff Bracket and on Announce and Play By Play.
   * @async
   * @function getAlliances
   * @param selectedYear The currently selected year, which is a persistent state variable
   * @param selectedEvent The currently selected event, which is a persistent state variable
   * @returns sets alliances
   */
  async function getAlliances(allianceTemp) {
    console.log("Getting Alliances");
    var result = null;
    var alliances = allianceTemp || null;
    if (
      !selectedEvent?.value?.code.includes("PRACTICE") &&
      !selectedEvent?.value?.code.includes("OFFLINE")
    ) {
      if (useCheesyArena && cheesyArenaAvailable) {
        // get rankings from Cheesy Arena
        result = await fetch("http://10.0.100.5:8443/api/alliances");
        var data = await result.json();
        if (data.length > 0) {
          // reformat data to FIRST API Rankings format
          alliances = {
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
      } else {
        result = await httpClient.getNoAuth(
          `${selectedYear?.value}/alliances/${selectedEvent?.value.code}`
        );
        alliances = await result.json();
      }
    } else if (
      selectedEvent?.value?.code === "PRACTICE1" ||
      selectedEvent?.value?.code === "PRACTICE2"
    ) {
      alliances = training.alliances.initial;
    } else if (selectedEvent?.value?.code === "PRACTICE3") {
      alliances = training.alliances.partial;
    } else if (selectedEvent?.value?.code === "PRACTICE4") {
      alliances = training.alliances.final;
    }

    if (typeof alliances.Alliances !== "undefined") {
      alliances.alliances = alliances.Alliances;
      delete alliances.Alliances;
    }
    var allianceLookup = {};
    if (alliances?.alliances) {
      alliances?.alliances.forEach((alliance) => {
        allianceLookup[`${alliance.captain}`] = {
          role: `Captain`,
          alliance: alliance.name,
          number: alliance.number,
          captain: alliance.captain,
          round1: alliance.round1,
          round2: alliance.round2,
          round3: alliance.round3,
          backup: alliance.backup,
          backupReplaced: alliance.backupReplaced,
        };
        allianceLookup[`${alliance.round1}`] = {
          role: `Round 1 Selection`,
          alliance: alliance.name,
          number: alliance.number,
          captain: alliance.captain,
          round1: alliance.round1,
          round2: alliance.round2,
          round3: alliance.round3,
          backup: alliance.backup,
          backupReplaced: alliance.backupReplaced,
        };
        allianceLookup[`${alliance.round2}`] = {
          role: `Round 2 Selection`,
          alliance: alliance.name,
          number: alliance.number,
          captain: alliance.captain,
          round1: alliance.round1,
          round2: alliance.round2,
          round3: alliance.round3,
          backup: alliance.backup,
          backupReplaced: alliance.backupReplaced,
        };
        if (alliance.round3) {
          allianceLookup[`${alliance.round3}`] = {
            role: `Round 3 Selection`,
            alliance: alliance.name,
            number: alliance.number,
            captain: alliance.captain,
            round1: alliance.round1,
            round2: alliance.round2,
            round3: alliance.round3,
            backup: alliance.backup,
            backupReplaced: alliance.backupReplaced,
          };
        }
        if (alliance.backup) {
          allianceLookup[`${alliance.backup}`] = {
            role: `Backup for ${alliance.backupReplaced}`,
            alliance: alliance.name,
            number: alliance.number,
            captain: alliance.captain,
            round1: alliance.round1,
            round2: alliance.round2,
            round3: alliance.round3,
            backup: alliance.backup,
            backupReplaced: alliance.backupReplaced,
          };
        }
      });
      alliances.Lookup = allianceLookup;
    }

    alliances.lastUpdate = moment();
    setAlliances(alliances);
    if (alliances?.alliances?.length > 0) {
      setPlayoffs(true);

      // If we are in World Champs, we need to determine the team list from the Alliances
      if (selectedEvent?.value?.type === "Championship" && alliances) {
        console.log("Getting Champs teams from Alliances");
        var tempChampsTeamList = [];
        if (!haveChampsTeams) {
          alliances?.alliances.forEach((alliance) => {
            tempChampsTeamList.push(alliance?.captain);
            tempChampsTeamList.push(alliance?.round1);
            tempChampsTeamList.push(alliance?.round2);
            tempChampsTeamList.push(alliance?.round3);
          });

          // We have bypassed getting the team list and details in the normal loading cycle,
          // so we need to get the details now from this array of competing teams
          setHaveChampsTeams(true);
          await getTeamList(_.uniq(tempChampsTeamList));
        }
      }
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
   * This function writes updated system alerts data back to gatool Cloud.
   * @async
   * @function putNotifications
   * @param {object} data the data to be put to gatool Cloud
   * @returns {Promise<object>} result
   */
  async function putNotifications(data) {
    var result = await httpClient.put(`system/announcements`, data);
    return result;
  }

  /**
   * This function writes updated event alerts data back to gatool Cloud.
   * @async
   * @function putEventNotifications
   * @param {object} data the data to be put to gatool Cloud
   * @returns {Promise<object>} result
   */
  async function putEventNotifications(data) {
    var result = await httpClient.put(
      `system/announcements/${selectedEvent?.value?.code}`,
      data
    );
    return result;
  }

  /**
   * This function forces a user sync with mailchimp. This wil take a long time.
   * @returns {Promise<{ok}|void|undefined>}
   */
  async function forceUserSync() {
    return await httpClient.post(`system/syncUsers`);
  }

  /**
   * This function fetches systemwide notifications from gatool Cloud.
   * @async
   * @function getNotifications
   * @returns {Promise<object>} system notifications posted by system admins
   */
  async function getNotifications() {
    var result = await httpClient.getNoAuth(`announcements`);
    var notifications = await result.json();
    if (result.status === 200) {
      return notifications;
    } else {
      return {
        message: `**Error** ${result?.statusText || "unknown"}`,
        onTime: null,
        offTime: null,
        onDate: null,
        offDate: null,
        variant: "danger",
      };
    }
  }

  /**
   * This function fetches event specific notifications from gatool Cloud.
   * @async
   * @function getEventNotifications
   * @returns {Promise<object>} The team's update history array
   */
  async function getEventNotifications() {
    var result = await httpClient.getNoAuth(
      `announcements/${selectedEvent?.value?.code}`
    );

    if (result.status === 200) {
      var notifications = await result.json();
      return notifications;
    } else if (result.status === 404) {
      return [
        {
          message: `**Error** ${result?.statusText || "not found"}`,
          onTime: null,
          offTime: null,
          onDate: null,
          offDate: null,
          variant: "danger",
          user: null,
        },
      ];
    } else {
      return [
        {
          message: `**Error** ${result?.statusText || "unknown"}`,
          onTime: null,
          offTime: null,
          onDate: null,
          offDate: null,
          variant: "danger",
          user: null,
        },
      ];
    }
  }

  const getSyncStatus = async () => {
    const result = await httpClient.get(`system/admin/syncUsers`);
    const syncResult = await result.json();
    if (result.status === 200) {
      return syncResult;
    }
  };

  const getSystemMessages = async () => {
    var message = await getNotifications();
    if (message?.message.includes("**Error**")) {
      console.log(message?.message);
    } else {
      var formattedMessage = {
        message: message?.message,
        expiry: moment(`${message?.offDate} ${message?.offTime}`),
        onTime: moment(`${message?.onDate} ${message?.onTime}`),
        variant: message?.variant || "",
        link: message?.link || "",
      };
      if (JSON.stringify(formattedMessage) !== JSON.stringify(systemMessage)) {
        setSystemBell("");
        setSystemMessage(formattedMessage);
      }
    }
  };

  const getEventMessages = async () => {
    var message = await getEventNotifications();
    if (Array.isArray(message) && message[0]?.message.includes("**Error**")) {
      console.log(`No Event Messages found for ${selectedEvent?.label}`);
    } else {
      var formattedMessage = message.map((item) => {
        return {
          message: item?.message,
          expiry: moment(`${item?.offDate} ${item?.offTime}`),
          onTime: moment(`${item?.onDate} ${item?.onTime}`),
          variant: item?.variant || "",
          user: item?.user || null,
        };
      });
      setEventMessage(formattedMessage);
    }
  };

  /**
   * This function reads the team data update history gatool Cloud.
   * @async
   * @function getTeamHistory
   * @param {number} teamNumber the number of the team whose data we want to fetch
   * @returns {Promise<object>} The team's update history array
   */
  async function getTeamHistory(teamNumber) {
    var result = await httpClient.getNoAuth(
      `team/${teamNumber}/updates/history/`
    );
    var history = await result.json();
    return history;
  }

  /**
   * This function advances to the next match. It will refresh scores, ranks and world stats when appropriate.
   * @async
   * @function nextMatch
   */
  const nextMatch = () => {
    if (!adHocMode) {
      if (
        (practiceSchedule?.schedule?.length === 0 &&
          qualSchedule?.schedule?.length === 0 &&
          playoffSchedule?.schedule?.length > 0) ||
        ((practiceSchedule?.schedule?.length > 0 ||
          practiceSchedule?.schedule?.schedule?.length > 0 ||
          offlinePlayoffSchedule?.schedule?.length > 0 ||
          offlinePlayoffSchedule?.schedule?.schedule?.length > 0) &&
          currentMatch <
            (practiceSchedule?.schedule?.length ||
              practiceSchedule?.schedule?.schedule?.length ||
              0) +
              (offlinePlayoffSchedule?.schedule?.length ||
                offlinePlayoffSchedule?.schedule?.schedule?.length ||
                0))
      ) {
        setAdHocMatch(
          practiceSchedule?.schedule[currentMatch]?.teams ||
            practiceSchedule?.schedule[currentMatch]?.schedule?.teams
        );
        setCurrentMatch(currentMatch + 1);
        if (!selectedEvent?.value?.code.includes("OFFLINE")) {
          getSchedule();
        }
      }

      if (
        currentMatch <
        (qualSchedule?.schedule?.length ||
          qualSchedule?.schedule?.schedule.length) +
          playoffSchedule?.schedule?.length
      ) {
        setCurrentMatch(currentMatch + 1);
        if (!selectedEvent?.value?.code.includes("OFFLINE")) {
          getSchedule();
        }
      }
      getSystemMessages();
      getEventMessages();
      getWorldStats();
      getEventStats(selectedYear?.value, selectedEvent?.value?.code);
    }
  };

  /**
   * This function navigates to the previous match. It will refresh scores, ranks and world stats when appropriate.
   * @async
   * @function previousMatch
   */
  const previousMatch = () => {
    if (!adHocMode) {
      if (currentMatch > 1) {
        if (practiceSchedule?.schedule?.length > 0) {
          setAdHocMatch(
            practiceSchedule?.schedule[currentMatch - 2]?.teams ||
              practiceSchedule?.schedule?.schedule?.teams
          );
        }
        setCurrentMatch(currentMatch - 1);
        if (!selectedEvent?.value?.code.includes("OFFLINE")) {
          getSchedule();
        }
        getSystemMessages();
        getEventMessages();
        getWorldStats();
        getEventStats(selectedYear?.value, selectedEvent?.value?.code);
      }
    }
  };

  /**
   * This function sets the current match from the match dropdown. It will refresh scores, ranks, and world stats as appropriate.
   * @async
   * @function setMatchFromMenu
   * @param e The menu select event which contains the selected match
   *
   */
  const setMatchFromMenu = (e) => {
    setCurrentMatch(e.value);
    if (
      practiceSchedule?.schedule?.length > 0 &&
      !selectedEvent?.value?.name.includes("OFFLINE")
    ) {
      setAdHocMatch(practiceSchedule?.schedule[e.value - 1].teams);
    }
    if (!selectedEvent?.value?.name.includes("OFFLINE")) {
      getSystemMessages();
      getEventMessages();
      getSchedule();
      getWorldStats();
    }
  };

  /**
   * This function loads an event when a user selects an event from the menu. It will reset all event data, load the event details, team lists, team updates, refresh scores, ranks and world stats when appropriate.
   * @async
   * @function loadEvent
   */
  const loadEvent = async () => {
    console.log("starting to load event");
    if (httpClient && selectedEvent?.value?.name && selectedYear?.value) {
      console.log(`Conditions match to load ${selectedEvent?.value?.name}...`);
      await setPracticeSchedule(null);
      setPracticeFileUploaded(false);
      await setQualSchedule(null);
      await setPlayoffSchedule(null);
      await setOfflinePlayoffSchedule(null);
      await setTeamList(null);
      await setCommunityUpdates(null);
      setLoadingCommunityUpdates(false);
      setEITeams([]);
      await setRobotImages(null);
      await setRankings(null);
      await setEventHighScores(null);
      await setPlayoffs(false);
      await setAllianceCount(null);
      await setTeamReduction(null);
      await setPlayoffCountOverride(null);
      setAllianceSelectionArrays({});
      setAllianceSelection(false);
      await setRankingsOverride(null);
      setCurrentMatch(1);
      await setDistrictRankings(null);
      setAdHocMatch([
        { teamNumber: null, station: "Red1", surrogate: false, dq: false },
        { teamNumber: null, station: "Red2", surrogate: false, dq: false },
        { teamNumber: null, station: "Red3", surrogate: false, dq: false },
        { teamNumber: null, station: "Blue1", surrogate: false, dq: false },
        { teamNumber: null, station: "Blue2", surrogate: false, dq: false },
        { teamNumber: null, station: "Blue3", surrogate: false, dq: false },
      ]);
      getCheesyStatus();
      setCheesyTeamList([]);
      setEventMessage([]);
      setSystemMessage(null);
      setSystemBell("");
      setTeamListLoading("");
      setHaveChampsTeams(false);
      getTeamList();
      getSchedule(true);
      getSystemMessages();
      getEventMessages();
      getWorldStats();
      getEventStats(selectedYear?.value, selectedEvent?.value?.code);
    }
  };

  const getEvents = async () => {
    try {
      const val = await httpClient.getNoAuth(`${selectedYear?.value}/events`);
      const result = await val.json();
      if (typeof result.Events !== "undefined") {
        result.events = result.Events;
        delete result.Events;
      }
      var timeNow = moment();

      if (selectedYear?.value === supportedYears[0].value) {
        result.events = result?.events.concat(training.events.events);
      }

      const events = result?.events.map((e) => {
        var color = "";
        var optionPrefix = "";
        var optionPostfix = "";
        var filters = [];

        // We have four formats available in timezones: abbreviation, description, Livemeeting and Windows. We lookup the Windows
        // format and convert it to a more standard format. Consider moving off of Moment on to Luxor?

        e.timeZoneAbbreviation =
          timezones[
            _.findIndex(timezones, { Windows: e.timezone })
          ]?.Abbreviation;

        var eventTime = moment(e.dateEnd);
        e.name = e.name.trim();
        e.name = _.replace(e.name, `- FIRST Robotics Competition -`, `-`);
        e.name = _.replace(
          e.name,
          `FIRST Championship - FIRST Robotics Competition`,
          `FIRST Championship - Einstein`
        );
        if (e.code === "week0" || e.code === "WEEK0") {
          filters.push("week0");
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
          filters.push("future");
        } else {
          filters.push("past");
        }
        if (
          eventTime.diff(timeNow, "days") <= 7 &&
          eventTime.diff(timeNow, "days") >= -0
        ) {
          filters.push("thisWeek");
        }
        if (
          eventTime.diff(timeNow, "weeks") <= 4 &&
          eventTime.diff(timeNow, "weeks") >= 0
        ) {
          filters.push("thisMonth");
        }
        if (e.type !== "OffSeason" && e.type !== "OffSeasonWithAzureSync") {
          filters.push("week" + e.weekNumber);
        }

        e.champLevel = "";

        // new method using event type data
        if (
          e.type === "DistrictChampionship" ||
          e.type === "DistrictChampionshipWithLevels"
        ) {
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
          filters: filters,
        };
      });

      setEvents(events);
      if (!_.some(events, selectedEvent)) {
        setSelectedEvent(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getDistricts = async () => {
    try {
      const val = await httpClient.getNoAuth(
        `${selectedYear?.value}/districts`
      );
      const json = await val.json();
      if (typeof json.Districts !== "undefined") {
        json.districts = json.Districts;
        delete json.Districts;
      }
      const districts = json.districts.map((district) => {
        return { label: district.name, value: district.code };
      });

      setDistricts(districts);
    } catch (e) {
      console.error(e);
    }
  };

  // Retrieve Community Updates when the team list changes
  useEffect(() => {
    if (
      teamList?.teams?.length > 0 &&
      !loadingCommunityUpdates &&
      !selectedEvent?.value?.code.includes("OFFLINE")
    ) {
      if (selectedEvent) {
        console.log("Team list changed. Fetching Community Updates.");
        getCommunityUpdates();
      } else {
        console.log(`No event loaded. Skipping...`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [httpClient, teamList]);

  // Retrieve Alliances when we have a playoff schedule
  useEffect(() => {
    if (playoffSchedule?.schedule?.length > 0) {
      getAlliances();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [httpClient, playoffSchedule]);

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
    if (
      selectedEvent?.value?.champLevel === "CHAMPS" ||
      selectedEvent?.value?.champLevel === "CMPDIV" ||
      selectedEvent?.value?.champLevel === "CMPSUB"
    ) {
      allianceMultiplier = 3;
    }

    allianceCountTemp.allianceSelectionLength =
      allianceMultiplier * allianceCountTemp.count - 1;
    allianceCountTemp.menu = {
      value: allianceCountTemp.count,
      label: allianceCountTemp.count,
    };
    setAllianceCount(allianceCountTemp);
  }, [playoffCountOverride, teamList, setAllianceCount, selectedEvent]);

  // Retrieve event list when year selection changes
  useEffect(() => {
    if (httpClient && selectedYear) {
      getDistricts();
      getEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, httpClient, setSelectedEvent, setEvents]);

  // check to see if Alliance Selection is ready when QualSchedule and Ranks changes
  useEffect(() => {
    if (
      rankings?.ranks?.length > 0 &&
      qualSchedule?.schedule?.length > 0 &&
      teamList?.teams?.length > 0 &&
      playoffSchedule?.schedule?.length === 0
    ) {
      var asReady = false;
      var matchesPerTeam = 0;
      matchesPerTeam = _.toInteger(
        (6 * qualSchedule?.schedule?.length) /
          (teamList?.teamCountTotal - teamReduction)
      );
      // In order to start Alliance Selection, we need the following conditions to be true:
      // All matches must have been completed
      // All teams must have completed their scheduled matches
      // We test these in different places: the schedule and the rankings. This ensures that
      // we have both API results, and that they are both current and complete.

      if (
        qualSchedule?.schedule?.length === qualSchedule?.completedMatchCount &&
        _.filter(rankings?.ranks, { matchesPlayed: matchesPerTeam }).length ===
          teamList?.teamCountTotal - teamReduction
      ) {
        asReady = true;
      }

      setAllianceSelection(asReady);
    }
  }, [
    rankings,
    qualSchedule,
    teamList,
    teamReduction,
    playoffSchedule,
    setAllianceSelection,
  ]);

  // check to see if Alliance Selection is ready when in Offline and we have uploaded Ranks
  useEffect(() => {
    if (
      rankings?.ranks.length > 0 &&
      practiceSchedule?.schedule.length > 0 &&
      teamList?.teams.length > 0
    ) {
      var asReady = false;
      // In order to start Alliance Selection, we need the following conditions to be true:
      // All matches must have been completed
      // All teams must have completed their scheduled matches
      // We test these in different places: the schedule and the rankings. This ensures that
      // we have both API results, and that they are both current and complete.
      if (selectedEvent?.value.name.includes("OFFLINE")) {
        asReady = true;
      }

      setAllianceSelection(asReady);
    }
  }, [
    rankings,
    teamList,
    setAllianceSelection,
    practiceSchedule?.schedule.length,
    offlinePlayoffSchedule?.schedule.length,
    selectedEvent?.value.name,
  ]);

  // Retrieve schedule, team list, community updates, high scores and rankings when event selection changes
  useEffect(() => {
    if (events.length > 0 && selectedEvent?.value) {
      loadEvent();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [httpClient, selectedEvent]);

  // Retrieve robot images when the team list changes
  useEffect(() => {
    if (teamList?.teams?.length > 0 && selectedEvent?.value?.name && isOnline) {
      console.log(`Fetching robot images for ${selectedEvent?.value?.name}...`);
      getRobotImages();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [httpClient, teamList?.lastUpdate]);

  // run this once to get the status of Cheesy Arena
  useEffect(() => {
    getCheesyStatus();
  }, [httpClient]);

  // Timer to autmatically refresh event data
  // This will run every refreshRate seconds, which is set in the settings.
  // It will fetch the schedule, world stats, event stats, system messages and event messages
  // It will also check if the event is online or offline, and fetch the schedule accordingly

  const { start, stop } = useInterval(
    () => {
      console.log("fetching event data now");
      if (!selectedEvent?.value?.code.includes("OFFLINE")) {
        console.log("Online event. Getting schedule and ranks");
        getCheesyStatus();
        getSchedule();
      } else {
        console.log("Offline event. Just get the world stats if you can");
      }
      getSystemMessages();
      getEventMessages();
      getWorldStats();
      getEventStats(selectedYear?.value, selectedEvent?.value?.code);
    },
    refreshRate * 1000,
    {
      autoStart: true,
      immediate: false,
      selfCorrecting: true,
      onFinish: () => {
        console.log("Event refresh stopped at App level.");
      },
    }
  );

  // Automatically keep event details up to date. Checks every 15 seconds if active.
  useEffect(() => {
    if (autoUpdate) {
      start();
    } else {
      stop();
    }
  }, [autoUpdate, start, stop]);

  // controllers for tab navigation
  //const navigate = useNavigate();
  const tabNavRight = () => {
    var location = window.location.href.split("/").pop();
    var tabNumber = _.findIndex(navPages, { href: location });
    if (tabNumber < navPages.length - 1) {
      tabNumber += 1;
    }
    document.getElementById(navPages[tabNumber].id).click();
  };

  const tabNavLeft = () => {
    var location = window.location.href.split("/").pop();
    var tabNumber = _.findIndex(navPages, { href: location });
    if (tabNumber > 0) {
      tabNumber -= 1;
    }
    document.getElementById(navPages[tabNumber].id).click();
  };

  useHotkeys("shift+right", () => tabNavRight(), { scopes: "tabNavigation" });
  useHotkeys(".", () => tabNavRight(), { scopes: "tabNavigation" });
  useHotkeys("k", () => tabNavRight(), { scopes: "tabNavigation" });
  useHotkeys("shift+left", () => tabNavLeft(), { scopes: "tabNavigation" });
  useHotkeys("comma", () => tabNavLeft(), { scopes: "tabNavigation" });
  useHotkeys("j", () => tabNavLeft(), { scopes: "tabNavigation" });
  useHotkeys("s,F5", () => getSchedule(), { scopes: "tabNavigation" });

  return (
    <div className="App">
      {isLoading ? (
        <div className="vertical-center">
          <Container>
            <Blocks visible height="200" width="" ariaLabel="blocks-loading" />
          </Container>
        </div>
      ) : (
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <LayoutsWithNavbar
                  selectedEvent={selectedEvent}
                  qualSchedule={qualSchedule}
                  playoffs={playoffs}
                  teamList={teamList}
                  communityUpdates={communityUpdates}
                  rankings={rankings}
                  eventHighScores={eventHighScores}
                  worldHighScores={worldStats}
                  allianceSelection={allianceSelection}
                  practiceSchedule={practiceSchedule}
                  systemBell={systemBell}
                  systemMessage={systemMessage}
                />
              }
            >
              <Route
                path="/"
                element={
                  <SetupPage
                    selectedEvent={selectedEvent}
                    setSelectedEvent={setSelectedEvent}
                    setSelectedYear={setSelectedYear}
                    selectedYear={selectedYear}
                    eventList={events}
                    teamList={teamList}
                    eventFilters={eventFilters}
                    setEventFilters={setEventFilters}
                    districts={districts}
                    timeFilter={timeFilter}
                    setTimeFilter={setTimeFilter}
                    qualSchedule={qualSchedule}
                    playoffSchedule={playoffSchedule}
                    rankings={rankings}
                    timeFormat={timeFormat}
                    setTimeFormat={setTimeFormat}
                    showSponsors={showSponsors}
                    setShowSponsors={setShowSponsors}
                    showAwards={showAwards}
                    setShowAwards={setShowAwards}
                    showNotes={showNotes}
                    setShowNotes={setShowNotes}
                    showNotesAnnounce={showNotesAnnounce}
                    setShowNotesAnnounce={setShowNotesAnnounce}
                    showMottoes={showMottoes}
                    setShowMottoes={setShowMottoes}
                    showChampsStats={showChampsStats}
                    setShowChampsStats={setShowChampsStats}
                    swapScreen={swapScreen}
                    setSwapScreen={setSwapScreen}
                    autoAdvance={autoAdvance}
                    setAutoAdvance={setAutoAdvance}
                    autoUpdate={autoUpdate}
                    setAutoUpdate={setAutoUpdate}
                    getSchedule={getSchedule}
                    awardsMenu={awardsMenu}
                    setAwardsMenu={setAwardsMenu}
                    showQualsStats={showQualsStats}
                    setShowQualsStats={setShowQualsStats}
                    showQualsStatsQuals={showQualsStatsQuals}
                    setShowQualsStatsQuals={setShowQualsStatsQuals}
                    teamReduction={teamReduction}
                    setTeamReduction={setTeamReduction}
                    playoffCountOverride={playoffCountOverride}
                    setPlayoffCountOverride={setPlayoffCountOverride}
                    allianceCount={allianceCount}
                    localUpdates={localUpdates}
                    setLocalUpdates={setLocalUpdates}
                    putTeamData={putTeamData}
                    getCommunityUpdates={getCommunityUpdates}
                    reverseEmcee={reverseEmcee}
                    setReverseEmcee={setReverseEmcee}
                    showDistrictChampsStats={showDistrictChampsStats}
                    setShowDistrictChampsStats={setShowDistrictChampsStats}
                    monthsWarning={monthsWarning}
                    setMonthsWarning={setMonthsWarning}
                    user={user}
                    isAuthenticated={isAuthenticated}
                    adHocMode={adHocMode}
                    setAdHocMode={setAdHocMode}
                    supportedYears={supportedYears}
                    reloadPage={reloadPage}
                    autoHideSponsors={autoHideSponsors}
                    setAutoHideSponsors={setAutoHideSponsors}
                    setLoadingCommunityUpdates={setLoadingCommunityUpdates}
                    hidePracticeSchedule={hidePracticeSchedule}
                    setHidePracticeSchedule={setHidePracticeSchedule}
                    systemMessage={systemMessage}
                    setTeamListLoading={setTeamListLoading}
                    getTeamList={getTeamList}
                    getAlliances={getAlliances}
                    setHaveChampsTeams={setHaveChampsTeams}
                    appUpdates={appUpdates}
                    usePullDownToUpdate={usePullDownToUpdate}
                    setUsePullDownToUpdate={setUsePullDownToUpdate}
                    useSwipe={useSwipe}
                    setUseSwipe={setUseSwipe}
                    eventLabel={eventLabel}
                    setEventLabel={setEventLabel}
                    showInspection={showInspection}
                    setShowInspection={setShowInspection}
                    showMinorAwards={showMinorAwards}
                    setShowMinorAwards={setShowMinorAwards}
                    highScoreMode={highScoreMode}
                    setHighScoreMode={setHighScoreMode}
                    systemBell={systemBell}
                    setSystemBell={setSystemBell}
                    eventBell={eventBell}
                    setEventBell={setEventBell}
                    eventMessage={eventMessage}
                    setEventMessage={setEventMessage}
                    putEventNotifications={putEventNotifications}
                    useCheesyArena={useCheesyArena}
                    setUseCheesyArena={setUseCheesyArena}
                    cheesyArenaAvailable={cheesyArenaAvailable}
                  />
                }
              />

              <Route
                path="/schedule"
                element={
                  <SchedulePage
                    selectedEvent={selectedEvent}
                    setSelectedEvent={setSelectedEvent}
                    playoffSchedule={playoffSchedule}
                    qualSchedule={qualSchedule}
                    practiceSchedule={practiceSchedule}
                    setPracticeSchedule={setPracticeSchedule}
                    getTeamList={getTeamList}
                    setOfflinePlayoffSchedule={setOfflinePlayoffSchedule}
                    offlinePlayoffSchedule={offlinePlayoffSchedule}
                    loadEvent={loadEvent}
                    practiceFileUploaded={practiceFileUploaded}
                    setPracticeFileUploaded={setPracticeFileUploaded}
                    setTeamListLoading={setTeamListLoading}
                    getAlliances={getAlliances}
                    playoffOnly={playoffOnly}
                    setPlayoffOnly={setPlayoffOnly}
                    alliances={alliances}
                    champsStyle={champsStyle}
                    setChampsStyle={setChampsStyle}
                    setQualsLength={setQualsLength}
                    playoffCountOverride={playoffCountOverride}
                    eventLabel={eventLabel}
                    setEventLabel={setEventLabel}
                    allianceCount={allianceCount}
                    setPlayoffCountOverride={setPlayoffCountOverride}
                    hidePracticeSchedule={hidePracticeSchedule}
                  />
                }
              />

              <Route
                path="/teamdata"
                element={
                  <TeamDataPage
                    selectedEvent={selectedEvent}
                    selectedYear={selectedYear}
                    teamList={teamList}
                    rankings={rankings}
                    teamSort={teamSort}
                    setTeamSort={setTeamSort}
                    communityUpdates={communityUpdates}
                    setCommunityUpdates={setCommunityUpdates}
                    allianceCount={allianceCount}
                    lastVisit={lastVisit}
                    setLastVisit={setLastVisit}
                    putTeamData={putTeamData}
                    localUpdates={localUpdates}
                    setLocalUpdates={setLocalUpdates}
                    qualSchedule={qualSchedule}
                    playoffSchedule={playoffSchedule}
                    originalAndSustaining={originalAndSustaining}
                    monthsWarning={monthsWarning}
                    user={user}
                    isAuthenticated={isAuthenticated}
                    getTeamHistory={getTeamHistory}
                    timeFormat={timeFormat}
                    getCommunityUpdates={getCommunityUpdates}
                    getTeamList={getTeamList}
                    eventLabel={eventLabel}
                  />
                }
              />

              <Route
                path="/ranks"
                element={
                  <RanksPage
                    selectedEvent={selectedEvent}
                    teamList={teamList}
                    rankings={rankings}
                    rankSort={rankSort}
                    setRankSort={setRankSort}
                    allianceCount={allianceCount}
                    rankingsOverride={rankingsOverride}
                    setRankingsOverride={setRankingsOverride}
                    allianceSelection={allianceSelection}
                    getRanks={getRanks}
                    setRankings={setRankings}
                    setAllianceSelectionArrays={setAllianceSelectionArrays}
                    playoffs={playoffs}
                    districtRankings={districtRankings}
                    eventLabel={eventLabel}
                    communityUpdates={communityUpdates}
                    EPA={EPA}
                  />
                }
              />

              <Route
                path="/announce"
                element={
                  <AnnouncePage
                    selectedEvent={selectedEvent}
                    selectedYear={selectedYear}
                    teamList={teamList}
                    rankings={rankings}
                    communityUpdates={communityUpdates}
                    currentMatch={currentMatch}
                    qualSchedule={qualSchedule}
                    playoffSchedule={playoffSchedule}
                    alliances={alliances}
                    setAlliances={setAlliances}
                    awardsMenu={awardsMenu}
                    showNotesAnnounce={showNotesAnnounce}
                    showAwards={showAwards}
                    showMinorAwards={showMinorAwards}
                    showSponsors={showSponsors}
                    showMottoes={showMottoes}
                    showChampsStats={showChampsStats}
                    timeFormat={timeFormat}
                    eventHighScores={eventHighScores}
                    backupTeam={backupTeam}
                    setBackupTeam={setBackupTeam}
                    allianceCount={allianceCount}
                    nextMatch={nextMatch}
                    previousMatch={previousMatch}
                    setMatchFromMenu={setMatchFromMenu}
                    practiceSchedule={practiceSchedule}
                    eventNamesCY={eventNamesCY}
                    districtRankings={districtRankings}
                    showDistrictChampsStats={showDistrictChampsStats}
                    adHocMatch={adHocMatch}
                    setAdHocMatch={setAdHocMatch}
                    adHocMode={adHocMode}
                    offlinePlayoffSchedule={offlinePlayoffSchedule}
                    swapScreen={swapScreen}
                    autoHideSponsors={autoHideSponsors}
                    hidePracticeSchedule={hidePracticeSchedule}
                    teamReduction={teamReduction}
                    qualsLength={qualsLength}
                    playoffOnly={playoffOnly}
                    getSchedule={getSchedule}
                    usePullDownToUpdate={usePullDownToUpdate}
                    useSwipe={useSwipe}
                    eventLabel={eventLabel}
                    playoffCountOverride={playoffCountOverride}
                    showInspection={showInspection}
                    highScoreMode={highScoreMode}
                    eventMessage={eventMessage}
                    eventBell={eventBell}
                    setEventBell={setEventBell}
                  />
                }
              />

              <Route
                path="/playbyplay"
                element={
                  <PlayByPlayPage
                    selectedEvent={selectedEvent}
                    teamList={teamList}
                    rankings={rankings}
                    communityUpdates={communityUpdates}
                    currentMatch={currentMatch}
                    qualSchedule={qualSchedule}
                    playoffSchedule={playoffSchedule}
                    alliances={alliances}
                    setAlliances={setAlliances}
                    showMottoes={showMottoes}
                    showNotes={showNotes}
                    showQualsStats={showQualsStats}
                    showQualsStatsQuals={showQualsStatsQuals}
                    swapScreen={swapScreen}
                    timeFormat={timeFormat}
                    eventHighScores={eventHighScores}
                    backupTeam={backupTeam}
                    setBackupTeam={setBackupTeam}
                    allianceCount={allianceCount}
                    nextMatch={nextMatch}
                    previousMatch={previousMatch}
                    setMatchFromMenu={setMatchFromMenu}
                    practiceSchedule={practiceSchedule}
                    districtRankings={districtRankings}
                    adHocMatch={adHocMatch}
                    setAdHocMatch={setAdHocMatch}
                    adHocMode={adHocMode}
                    offlinePlayoffSchedule={offlinePlayoffSchedule}
                    hidePracticeSchedule={hidePracticeSchedule}
                    teamReduction={teamReduction}
                    qualsLength={qualsLength}
                    playoffOnly={playoffOnly}
                    getSchedule={getSchedule}
                    usePullDownToUpdate={usePullDownToUpdate}
                    useSwipe={useSwipe}
                    eventLabel={eventLabel}
                    playoffCountOverride={playoffCountOverride}
                    showInspection={showInspection}
                    highScoreMode={highScoreMode}
                    EPA={EPA}
                    eventMessage={eventMessage}
                    eventBell={eventBell}
                    setEventBell={setEventBell}
                  />
                }
              />

              <Route
                path="/allianceselection"
                element={
                  <AllianceSelectionPage
                    selectedYear={selectedYear}
                    selectedEvent={selectedEvent}
                    qualSchedule={qualSchedule}
                    playoffSchedule={playoffSchedule}
                    offlinePlayoffSchedule={offlinePlayoffSchedule}
                    alliances={alliances}
                    rankings={rankings}
                    timeFormat={timeFormat}
                    getRanks={getRanks}
                    allianceSelection={allianceSelection}
                    playoffs={playoffs}
                    teamList={teamList}
                    allianceCount={allianceCount}
                    communityUpdates={communityUpdates}
                    allianceSelectionArrays={allianceSelectionArrays}
                    setAllianceSelectionArrays={setAllianceSelectionArrays}
                    rankingsOverride={rankingsOverride}
                    loadEvent={loadEvent}
                    practiceSchedule={practiceSchedule}
                    setOfflinePlayoffSchedule={setOfflinePlayoffSchedule}
                    currentMatch={currentMatch}
                    qualsLength={qualsLength}
                    nextMatch={nextMatch}
                    previousMatch={previousMatch}
                    getSchedule={getSchedule}
                    useSwipe={useSwipe}
                    usePullDownToUpdate={usePullDownToUpdate}
                    eventLabel={eventLabel}
                    playoffCountOverride={playoffCountOverride}
                  />
                }
              />

              <Route
                path="/awards"
                element={
                  <AwardsPage
                    selectedEvent={selectedEvent}
                    selectedYear={selectedYear}
                    teamList={teamList}
                    communityUpdates={communityUpdates}
                    eventLabel={eventLabel}
                  />
                }
              />

              <Route
                path="/stats"
                element={
                  <StatsPage
                    worldStats={worldStats}
                    selectedEvent={selectedEvent}
                    eventHighScores={eventHighScores}
                    eventNamesCY={eventNamesCY}
                    eventLabel={eventLabel}
                    districts={districts}
                  />
                }
              />

              <Route
                path="/cheatsheet"
                element={
                  <CheatsheetPage
                    teamList={teamList}
                    communityUpdates={communityUpdates}
                    selectedEvent={selectedEvent}
                    selectedYear={selectedYear}
                    robotImages={robotImages}
                    eventLabel={eventLabel}
                  />
                }
              />

              <Route
                path="/emcee"
                element={
                  <EmceePage
                    selectedEvent={selectedEvent}
                    playoffSchedule={playoffSchedule}
                    qualSchedule={qualSchedule}
                    alliances={alliances}
                    currentMatch={currentMatch}
                    nextMatch={nextMatch}
                    previousMatch={previousMatch}
                    reverseEmcee={reverseEmcee}
                    timeFormat={timeFormat}
                    practiceSchedule={practiceSchedule}
                    offlinePlayoffSchedule={offlinePlayoffSchedule}
                    hidePracticeSchedule={hidePracticeSchedule}
                    getSchedule={getSchedule}
                    usePullDownToUpdate={usePullDownToUpdate}
                    useSwipe={useSwipe}
                    eventLabel={eventLabel}
                    playoffCountOverride={playoffCountOverride}
                  />
                }
              />
              <Route
                path="/dev"
                element={
                  <Developer
                    putNotifications={putNotifications}
                    getNotifications={getNotifications}
                    forceUserSync={forceUserSync}
                    getSyncStatus={getSyncStatus}
                    systemBell={systemBell}
                    setSystemBell={setSystemBell}
                  />
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      )}
    </div>
  );
}

export default App;
