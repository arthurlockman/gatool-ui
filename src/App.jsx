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
  FTCEventNames,
  specialAwards,
  hallOfFame,
  FTCHallOfFame,
  originalAndSustaining,
  refreshRate,
  communityUpdateTemplate,
  ftcRegions,
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
  { label: "2026 REBUILT℠ presented by Haas", value: "2026", program: "FRC" },
  { label: "2025 REEFSCAPE℠ presented by Haas", value: "2025", program: "FRC" },
  { label: "2024 CRESCENDO℠", value: "2024", program: "FRC" },
  //{ label: "2023 CHARGED UP℠ presented by Haas", value: "2023", program: "FRC"  },
];

const FTCSupportedYears = [
  { label: "2025/26 DECODE℠ presented by RTX", value: "2025", program: "FTC" },
  { label: "2024/25 INTO THE DEEP℠", value: "2024", program: "FTC" },
  { label: "2023", value: "2023", program: "FTC" },
  // { label: "2022", value: "2022", program: "FTC" },
];

const paleYellow = "#fdfaed";
const paleBlue = "#effdff";
const ftcBaseURL = "https://api.gatool.org/ftc/v2/";

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
  ftcMode,
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
      <BottomNavigation ftcMode={ftcMode} />
    </>
  );
}

const training = _.cloneDeep(trainingData);

const timezones = _.cloneDeep(timeZones);

var ftcregions = _.cloneDeep(ftcRegions);
const regionLookup = [];
ftcregions.forEach((region) => {
  regionLookup[region.regionCode] = region.description;
});

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
  const [tbaEventKey, setTbaEventKey] = usePersistentState(
    "cache:tbaEventKey",
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
  const [alliances, setAlliances] = usePersistentState("cache:alliances", null);
  const [communityUpdates, setCommunityUpdates] = usePersistentState(
    "cache:communityUpdates",
    null
  );
  const [eventFilters, setEventFilters] = usePersistentState(
    "setting:eventFilters",
    []
  );
  const [regionFilters, setRegionFilters] = usePersistentState(
    "setting:regionFilters",
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

  const [ftcMode, setFTCMode] = usePersistentState("setting:ftcMode", false);

  const [ftcLeagues, setFTCLeagues] = usePersistentState(
    "cache:ftcLeagues",
    []
  );

  const [ftcTypes, setFTCTypes] = usePersistentState("cache:ftcTypes", []);

  // Controllers for table sort order at render time
  const [teamSort, setTeamSort] = useState("");
  const [rankSort, setRankSort] = useState("");

  const isOnline = useOnlineStatus();
  const [teamListLoading, setTeamListLoading] = useState("");
  const [eventsLoading, setEventsLoading] = useState("");
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

  // event name lookups
  const eventnames = ftcMode
    ? _.cloneDeep(FTCEventNames)
    : _.cloneDeep(eventNames);
  const halloffame = ftcMode
    ? _.cloneDeep(FTCHallOfFame)
    : _.cloneDeep(hallOfFame);

  // Cheesy Arena status
  const [cheesyArenaAvailable, setCheesyArenaAvailable] = useState(false);
  const [useCheesyArena, setUseCheesyArena] = usePersistentState(
    "setting:useCheesyArena",
    null
  );
  const [cheesyTeamList, setCheesyTeamList] = useState([]);

  // FTC Offline status
  const [FTCOfflineAvailable, setFTCOfflineAvailable] = useState(false);
  const [useFTCOffline, setUseFTCOffline] = usePersistentState(
    "setting:useFTCOffline",
    false
  );
  const [FTCKey, setFTCKey] = usePersistentState("setting:FTCKey", {});
  const [FTCServerURL, setFTCServerURL] = usePersistentState(
    "setting:FTCServerURL",
    "http://10.0.100.5"
  );

  /**
   * Function to get the Cheesy Arena status by connecting to the Cheesy Arena API
   */
  const getCheesyStatus = async (loadSchedule) => {
    // See if you can connect to Cheesy Arena
    console.log("Checking Cheesy Arena status...");
    try {
      var result = await fetch(
        "http://10.0.100.5:8080/api/matches/qualification",
        {
          signal: AbortSignal.timeout(5000),
        }
      );
      var data = result.status === 200;
      // Set the IP address to the constant `ip`
      if (data) {
        console.log("Cheesy Arena is available.");
        setCheesyArenaAvailable(true);
        if (loadSchedule) {
          getTeamList();
          getSchedule();
        }
        return true;
      } else {
        console.log("Cheesy Arena is not available.");
        setCheesyArenaAvailable(false);
        return false;
      }
    } catch (error) {
      console.log("Error fetching Cheesy Arena status:", error.message);
      setCheesyArenaAvailable(false);
      return false;
    }
  };

  // eslint-disable-next-line
  const getFTCOfflineStatus = async () => {
    // See if you can connect to FTC Local Server
    // Requires that FTC Server URL be set.
    console.log("Checking FTC Local Server status...");
    try {
      const result = await httpClient.getNoAuth(
        `/api/v1/version/`,
        FTCServerURL,
        5000,
        { Authorization: FTCKey?.key || "" }
      );
      if (result?.status === 200) {
        console.log("FTC Local Server is available.");
        return setFTCOfflineAvailable(true);
      } else {
        console.log("FTC Local Server is not available.");
        return setFTCOfflineAvailable(false);
      }
    } catch (error) {
      console.log("Error fetching FTC Local Server status:", error.message);
      return setFTCOfflineAvailable(false);
    }
  };

  // Check the status of FTC Local Server when the URL changes
  useEffect(() => {
    if (ftcMode?.value === "FTCLocal" && FTCServerURL) {
      getFTCOfflineStatus();
    }
  }, [FTCServerURL, ftcMode?.value]); // eslint-disable-line react-hooks/exhaustive-deps

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
  const conformCheesyArenaMatch = (match, level, index) => {
    return {
      description: match?.LongName,
      tournamentLevel: level,
      matchNumber: index,
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
          : 0,
      dq: team?.Disqualifications,
      matchesPlayed: team?.Played,
    };
  };

  /**
   * Should be merged with /events/{{eventName}}/matches/{{matchNumber}} for full schedule.
   * @constant conformFTCOfflineScheduleMatch
   * @param match Match details from FTC Server
   * @param level Tournament Level
   */
  // eslint-disable-next-line
  // @ts-ignore
  const conformCFTCOfflineScheduleMatch = (match, level) => {
    return {
      description: match?.matchName,
      tournamentLevel: level,
      field: match?.field,
      matchNumber: match?.matchNumber,
      startTime: moment(match?.time).format(),
      actualStartTime: match?.finished ? moment(match?.time).format() : null,
      postResultTime:
        match?.matchState === "COMMITTED" ? moment(match?.time).format() : null,
      scoreRedFinal: null,
      scoreRedFoul: null,
      scoreRedAuto: null,
      scoreBlueFinal: null,
      scoreBlueFoul: null,
      scoreBlueAuto: null,
      teams: [
        {
          teamNumber: match?.red?.team1,
          station: "Red1",
          surrogate: match?.red?.isTeam1Surrogate,
          dq: !1,
        },
        {
          teamNumber: match?.red?.team2,
          station: "Red2",
          surrogate: match?.red?.isTeam2Surrogate,
          dq: !1,
        },
        {
          teamNumber: match?.blue?.team1,
          station: "Blue1",
          surrogate: match?.blue?.isTeam1Surrogate,
          dq: !1,
        },
        {
          teamNumber: match?.blue?.team2,
          station: "Blue2",
          surrogate: match?.blue?.isTeam2Surrogate,
          dq: !1,
        },
      ],
      winner: { winner: "", tieWinner: "", level: 0 },
    };
  };

  /**
   * Use to conform match scores, which come from /api/2025/v1/events/{code}/matches/{match}/ and which contain technical details of the match.
   * @constant conformFTCOfflineScores
   * @param match Match details from FTC Server
   * @param level Tournament Level
   */
  // eslint-disable-next-line
  // @ts-ignore
  const conformFTCOfflineScores = (match, level) => {
    return {
      matchLevel: level,
      matchNumber: match?.matchBrief?.matchNumber,
      redScore:
        match?.matchBrief?.matchState !== "UNPLAYED" ? match?.redScore : null,
      blueScore:
        match?.matchBrief?.matchState !== "UNPLAYED" ? match?.blueScore : null,
      redAuto:
        match?.matchBrief?.matchState !== "UNPLAYED" ? match?.red?.auto : null,
      blueAuto:
        match?.matchBrief?.matchState !== "UNPLAYED" ? match?.blue?.auto : null,
      redPenalty:
        match?.matchBrief?.matchState !== "UNPLAYED"
          ? match?.red?.penalty
          : null,
      bluePenalty:
        match?.matchBrief?.matchState !== "UNPLAYED"
          ? match?.blue?.penalty
          : null,
      winningAlliance:
        match?.redScore > match?.blueScore
          ? 1
          : match?.redScore < match?.blueScore
          ? 2
          : 0,
      tiebreaker: {
        item1: -1, // Fix for Elims in FTC Server
        item2: "",
      },
      coopertitionBonusAchieved: false, // no coopertition in FTC
      alliances: [
        { ...match?.blue, alliance: "Blue" },
        { ...match?.red, alliance: "Red" },
      ],
      actualStartTime:
        match.startTime >= 0 ? moment(match?.startTime).format() : null,
      postResultTime:
        match?.resultPostedTime >= 0
          ? moment(match?.resultPostedTime).format()
          : null,
    };
  };

  /**
   * @constant conformFTCOfflineRankings
   * @param match Match details from FTC Server
   * @param level Tournament Level
   */
  // eslint-disable-next-line
  // @ts-ignore
  const conformFTCOfflineRankings = (team) => {
    return {
      ...team,
      rank: team?.ranking,
      teamNumber: team?.team,
      qualAverage: Math.round(100 * team?.tbp1) / 100,
      dq: team?.dq || 0,
      sortOrder1: Number(team?.rankingPoints) || 0,
    };
  };

  /**
   * @constant conformFTCOfflineTeam
   * @param {*} teamDetails team details from FTC Offline server
   * @returns reformatted team details from FTC Offline server
   */
  const conformFTCOfflineTeam = (teamDetails) => {
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
  };

  /**
   * @constant conformFTCOfflineAlliance
   * @param {*} alliance team details from FTC Offline server
   * @returns reformatted team details from FTC Offline server
   */
  const conformFTCOfflineAlliance = (alliance) => {
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
  };

  /**
   * Helper function to fetch TBA event by matching FIRST event
   * This searches through TBA events to find one that matches the FIRST event code or name
   * @param {object} firstEvent Complete FIRST event object with code and name properties
   * @param {string} year Year
   * @returns TBA event code (e.g., "2025cc")
   */
  const getTBAEventKeyFromFIRSTCode = async (firstEvent, year) => {
    try {
      console.log(
        `Looking up TBA event key for FIRST event: ${firstEvent?.code} - ${firstEvent?.name}`
      );

      // Fetch all TBA events for the year
      const result = await httpClient.getNoAuth(`${year}/offseason/events/`);
      if (result.status === 200) {
        // @ts-ignore
        const tbaEvents = await result.json();

        // First, try to find by firstEventCode
        let matchingEventIndex = _.findIndex(tbaEvents.events, {
          firstEventCode: firstEvent?.code.toLowerCase(),
        });

        if (matchingEventIndex >= 0) {
          let matchingEvent = tbaEvents.events[matchingEventIndex];
          console.log(
            `Found TBA event key: ${matchingEvent?.code} for FIRST event: ${firstEvent?.code}`
          );
          return matchingEvent?.code.split(year)[1];
        } else {
          console.log("trying to match by name");
          matchingEventIndex = _.findIndex(tbaEvents.events, {
            name: firstEvent?.name,
          });
          if (matchingEventIndex >= 0) {
            let matchingEvent = tbaEvents.events[matchingEventIndex];
            console.log(
              `Found TBA event key: ${matchingEvent?.code} for FIRST event: ${firstEvent?.name}`
            );
            return matchingEvent.code?.split(year)[1];
          }
          console.log(
            `No matching TBA event found for FIRST event: ${firstEvent?.code} - ${firstEvent?.name}`
          );
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error("Error fetching TBA event key:", error);
      return null;
    }
  };

  /**
   * Helper function to fetch TBA teams for an event
   * @param {string} tbaEventKey TBA event key
   * @param {string} year Year
   * @returns Array of TBA teams
   */
  const fetchTBATeams = async (tbaEventKey, year) => {
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
        `${year}/offseason/schedule/hybrid/${tbaEventKey}/`
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
   * Helper function to fetch TBA rankings for an event
   * @param {string} tbaEventKey TBA event key
   * @param {string} year Year
   * @returns TBA rankings
   */
  const fetchTBARankings = async (tbaEventKey, year) => {
    try {
      console.log(`Fetching TBA rankings for event: ${tbaEventKey}`);
      const result = await httpClient.getNoAuth(
        `${year}/offseason/rankings/${tbaEventKey}/`
      );
      if (result.status === 200) {
        // @ts-ignore
        const rankings = await result.json();
        return rankings;
      }
      return null;
    } catch (error) {
      console.error("Error fetching TBA rankings:", error);
      return null;
    }
  };

  /**
   * Helper function to fetch TBA alliances for an event
   * @param {string} tbaEventKey TBA event key
   * @param {string} year Year
   * @returns Array of TBA alliances
   */
  const fetchTBAAlliances = async (tbaEventKey, year) => {
    try {
      console.log(`Fetching TBA alliances for event: ${tbaEventKey}`);
      const result = await httpClient.getNoAuth(
        `${year}/offseason/alliances/${tbaEventKey}/`
      );
      if (result.status === 200) {
        // @ts-ignore
        const alliances = await result.json();
        return alliances;
      }
      return [];
    } catch (error) {
      console.error("Error fetching TBA alliances:", error);
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
   * @param selectedEvent The currently selected event, which is a persistent state variable
   * @param selectedYear The currently selected year, which is a persistent state variable
   *
   * @return Sets the event high scores, qual schedule and playoff
   */
  // @ts-ignore
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
    practiceschedule = { schedule: [] };
    if (
      selectedEvent?.value?.code.includes("OFFLINE") ||
      selectedEvent?.value?.code.includes("PRACTICE")
    ) {
      //create null schedule because there are no practice schedules for these events or they are using Cheesy Arena
      practiceschedule = { schedule: { schedule: [] } };
    } else if (!selectedEvent?.value?.code.includes("PRACTICE") && !ftcMode) {
      if (useCheesyArena && cheesyArenaAvailable) {
        // get schedule from Cheesy Arena
        var result = await fetch("http://10.0.100.5:8080/api/matches/practice");
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
          ftcMode ? ftcBaseURL : undefined
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
        result = await fetch(
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
          { Authorization: FTCKey?.key || "" }
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
            { Authorization: FTCKey?.key || "" }
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
        // Use cached TBA event key if available, otherwise fetch it
        let eventKey = tbaEventKey;
        if (!eventKey) {
          eventKey = await getTBAEventKeyFromFIRSTCode(
            selectedEvent?.value,
            selectedYear?.value
          );
          setTbaEventKey(eventKey);
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
              qualschedule = {
                schedule: {
                  schedule: qualMatches,
                },
              };
            }
          }
        }
      } else if (!useFTCOffline) {
        const qualsResult = await httpClient.getNoAuth(
          `${selectedYear?.value}/schedule/hybrid/${selectedEvent?.value.code}/qual`,
          ftcMode ? ftcBaseURL : undefined
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
        ftcMode ? ftcBaseURL : undefined
      );
      if (qualsScoresResult.status === 200) {
        // @ts-ignore
        qualScores = await qualsScoresResult.json();
        if (qualScores.matchScores) {
          qualScores = { MatchScores: qualScores.matchScores };
        }
      }
    }

    const qualMatches = qualschedule?.schedule?.schedule.map((match) => {
      match.winner = winner(match);
      if (
        qualScores?.MatchScores &&
        !(selectedEvent?.value?.type === "OffSeason")
      ) {
        const matchResults = qualScores.MatchScores.filter((scoreMatch) => {
          return scoreMatch.matchNumber === match.matchNumber;
        })[0];
        if (matchResults) {
          match.scores = matchResults;
          // @ts-ignore
          match.redRP = _.pickBy(matchResults.alliances[1], (value, key) => {
            return key.endsWith("BonusAchieved") || key.endsWith("RP");
          });
          // @ts-ignore
          match.blueRP = _.pickBy(matchResults.alliances[0], (value, key) => {
            return key.endsWith("BonusAchieved") || key.endsWith("RP");
        });
        }
      } else if (selectedEvent?.value?.type === "OffSeason") {
        match.scores = match?.matchScores || [];
        if (match?.matchScores) {
          delete match.matchScores;
        }
        match.redRP = _.pickBy(match.scores?.alliances[1], (value, key) => {
          return key.endsWith("BonusAchieved") || key.endsWith("RP");
        });
        // @ts-ignore
        match.blueRP = _.pickBy(match?.scores?.alliances[0], (value, key) => {
          return key.endsWith("BonusAchieved") || key.endsWith("RP");
        });
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
    await setQualSchedule(qualschedule);
    if (
      practiceschedule?.schedule?.length > 0 &&
      qualschedule?.schedule?.length === 0
    ) {
      qualslength = practiceschedule?.schedule?.length;
    } else if (qualschedule?.schedule?.length > 0) {
      qualslength = qualschedule?.schedule?.length;
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
        result = await fetch("http://10.0.100.5:8080/api/matches/playoff");
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
          { Authorization: FTCKey?.key || "" }
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
                { Authorization: FTCKey?.key || "" }
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
        // Use cached TBA event key if available, otherwise fetch it
        let eventKey = tbaEventKey;
        if (!eventKey) {
          eventKey = await getTBAEventKeyFromFIRSTCode(
            selectedEvent?.value,
            selectedYear?.value
          );
          setTbaEventKey(eventKey);
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
              playoffschedule = {
                schedule: playoffMatches,
              };
            }
          }
        }
      } else if (!useFTCOffline) {
        const playoffResult = await httpClient.getNoAuth(
          `${selectedYear?.value}/schedule/hybrid/${selectedEvent?.value.code}/playoff`,
          ftcMode ? ftcBaseURL : undefined
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

    if (
      !selectedEvent?.value?.code.includes("PRACTICE") &&
      !useFTCOffline &&
      !(selectedEvent?.value?.type === "OffSeason") &&
      playoffschedule?.schedule?.length > 0
    ) {
      const playoffScoresResult = await httpClient.getNoAuth(
        `${selectedYear?.value}/scores/${selectedEvent?.value.code}/playoff`,
        ftcMode ? ftcBaseURL : undefined
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
          match.winner = winner(match);
          //fix the match number fro FTC matches
          if (ftcMode) {
            match.matchNumber = index + 1;
          }
          //figure out how to match scores to match
          if (
            playoffScores?.MatchScores &&
            !(selectedEvent?.value?.type === "OffSeason")
          ) {
            const matchResults = playoffScores.MatchScores.filter(
              (scoreMatch) => {
                return scoreMatch.matchNumber === match.matchNumber;
              }
            )[0];
            if (matchResults) {
              match.scores = matchResults;
            }
          } else if (selectedEvent?.value?.type === "OffSeason") {
            match.scores = match?.matchScores || [];
            if (match?.matchScores) {
              delete match.matchScores;
            }
          }
          return match;
        }
      );

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
    playoffschedule.lastUpdate = moment().format();
    console.log(
      `There are ${playoffschedule?.schedule.length} playoff matches loaded.`
    );
    setPlayoffSchedule(playoffschedule);
    if (playoffschedule?.schedule?.length > 0) {
      getAlliances();
    }
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

      var result = null;
      var teams = {
        teamCountTotal: adHocTeamList?.length || 0,
        teamCountPage: 1,
        pageCurrent: 1,
        pageTotal: 1,
        teams: [],
      };

      if (
        selectedEvent?.value?.code.includes("OFFLINE") ||
        (inWorldChamps() && !ftcMode) ||
        (cheesyArenaAvailable && useCheesyArena)
      ) {
        if (adHocTeamList) {
          //https://api.gatool.org/v3/2023/teams?teamNumber=172

          var adHocTeams = adHocTeamList.map(async (team) => {
            var request = await httpClient.getNoAuth(
              `${selectedYear?.value}/teams?teamNumber=${team}`,
              ftcMode ? ftcBaseURL : undefined
            );

            if (request.status === 200) {
              // @ts-ignorevar
              const teamDetails = await request.json();
              return teamDetails.teams[0];
            } else if (request.status === 400) {
              // team not found. Return a stub team
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
            // set the team list from the team list.
            console.log(
              `Fetching community updates for ${selectedEvent?.value?.name} from getTeamList`
            );
            teams.lastUpdate = moment().format();
            teams.teams = _.filter(values, (n) => {
              return n ? true : false;
            });
            getCommunityUpdates(false, teams.teams);
          });
        }
      } else if (
        !selectedEvent?.value?.code.includes("PRACTICE") &&
        !useFTCOffline &&
        selectedEvent?.value?.type !== "OffSeason"
      ) {
        // get the team list from FIRST API
        setTbaEventKey(null); // Clear TBA event key for non-offseason events
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
        // Use cached TBA event key if available, otherwise fetch it
        let eventKey = tbaEventKey;
        if (!eventKey) {
          eventKey = await getTBAEventKeyFromFIRSTCode(
            selectedEvent?.value,
            selectedYear?.value
          );
          setTbaEventKey(eventKey);
        }

        if (eventKey) {
          const tbaTeams = await fetchTBATeams(
            eventKey,
            selectedYear?.value
          );

          if (tbaTeams && tbaTeams.teams.length > 0) {
            teams = {
              ...tbaTeams,
              lastUpdate: moment().format(),
            };
            getCommunityUpdates(false, teams.teams);
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
              getCommunityUpdates(false, teams.teams);
            });
          }
        }
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
            `${selectedYear?.value}/awards/event/${event?.value?.code}`,
            ftcMode ? ftcBaseURL : undefined
          );
          if (request.status === 200) {
            // @ts-ignore
            var eventDetails = await request.json();
            // filter that list by EI {awardId: "633"} {name: "District Engineering Inspiration Award"} and {awardID: "417"} {name:"Rookie All Star Award"}
            return _.filter(eventDetails?.awards, (award) => {
              return award.awardId === 633 || award.awardId === 417;
            });
          }
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
                `${selectedYear?.value}/teams?teamNumber=${teamNumber}`,
                ftcMode ? ftcBaseURL : undefined
              );
              if (request.status === 200) {
                // @ts-ignore
                var teamDetails = await request.json();
                return teamDetails.teams[0];
              }
              if (request.status === 400) {
                // team not found. Return a stub team
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
              // merge with teams.teams
              if (values.length > 0) {
                //prepare to get community updates for these teams
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
      if (teams?.teams.length > 0) {
        var req = await httpClient.postNoAuth(
          `${selectedYear?.value}/queryAwards`,
          {
            teams: teams.teams.map((t) => t?.teamNumber),
          },
          ftcMode ? ftcBaseURL : undefined
        );
        var newTeams = [];
        if (req.status === 200) {
          // @ts-ignore
          var awards = await req.json();

          newTeams = teams.teams.map((team) => {
            team.awards = awards[`${team?.teamNumber}`] || {};
            return team;
          });
        }
      }

      // Parse awards to ensure we highlight them properly and remove extraneous text i.e. FIRST CHampionship from name

      var formattedAwards = newTeams
        ? newTeams.map((team) => {
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
                  team.awards[`${selectedYear?.value - index}`].awards =
                    _.concat(
                      team.awards[`${selectedYear?.value - index}`].awards,
                      teamAwards
                    );
                }
              }
            }
            var awardYears = Object.keys(team?.awards);

            awardYears?.forEach((year) => {
              if (team?.awards[`${year}`] !== null) {
                if (team.awards[`${year}`]?.awards) {
                  team.awards[`${year}`] = {
                    awards: team.awards[`${year}`].awards,
                  };
                }
                team.awards[`${year}`].awards = team?.awards[
                  `${year}`
                ]?.awards?.map((award) => {
                  award.highlight = awardsHilight(award.name);
                  award.eventName = eventnames[`${year}`]
                    ? eventnames[`${year}`][award.eventCode]
                    : award.eventCode;
                  award.year = year;
                  return award;
                });
              } else {
                team.awards[`${year}`] = { awards: [] };
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
          })
        : null;
      teams.teams = formattedAwards ? formattedAwards : teams.teams;

      var champsTeams = [];
      if (
        // Do not attempt to get Champs stats for FTC events
        (selectedEvent?.value?.champLevel !== "" ||
          showDistrictChampsStats ||
          (selectedEvent?.value?.code.includes("OFFLINE") &&
            playoffOnly &&
            champsStyle)) &&
        !ftcMode
      ) {
        console.log("Getting Champs stats");
        champsTeams = teams.teams.map(async (team) => {
          var champsRequest = await httpClient.getNoAuth(
            `/team/${team?.teamNumber}/appearances`,
            ftcMode ? ftcBaseURL : undefined
          );
          if (champsRequest.status === 200) {
            // @ts-ignore
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
          }
        });

        Promise.all(champsTeams).then(function (values) {
          teams.lastUpdate = moment().format();

          teams.teams = _.filter(values, (value) => {
            return value ? true : false;
          });
          teams.teams = _.sortBy(teams.teams, ["teamNumber"]);
          setTeamList(teams);
        });
      } else {
        teams.lastUpdate = moment().format();
        setTeamList(teams);
      }
      // });
      // determine the number of Alliances in the playoffs for FTC events
      if (ftcMode && !selectedEvent.value.allianceCount) {
        var allianceCount = "EightAlliance";
        if (teams.teams.length <= 10) {
          allianceCount = "TwoAlliance";
        } else if (teams.teams.length <= 20) {
          allianceCount = "FourAlliance";
        } else if (teams.teams.length <= 40) {
          allianceCount = "SixAlliance";
        }
        const selectedEventTemp = _.cloneDeep(selectedEvent);
        selectedEventTemp.value.allianceCount = allianceCount;
        setSelectedEvent(selectedEventTemp);
      }

      setTeamListLoading("");
    } else {
      console.log(
        `Team List for ${selectedEvent?.value?.name} is loading. Skipping...`
      );
    }
  }

  /**
   * Helper function to get the effective team number for API calls
   * For FRC demo teams (9970-9999), prepend the event code or TBA key
   * FTC teams are not modified
   * @param {number} teamNumber The team number
   * @param {string} eventCode The FIRST event code (optional)
   * @param {string} tbaEventKey The TBA event key (optional)
   * @returns {Promise<string>} The effective team number for API calls
   */
  const getEffectiveTeamNumber = async (teamNumber, eventCode = null, tbaEventKey = null) => {
    // Check if team number is a demo team (9970-9999) and NOT in FTC mode
    if (teamNumber >= 9970 && teamNumber <= 9999 && !ftcMode) {
      // Use eventCode if available
      if (eventCode) {
        return `${eventCode}_${teamNumber}`;
      }
      // Otherwise, fetch TBA event key if we have the event details
      if (!tbaEventKey && selectedEvent?.value?.type === "OffSeason") {
        tbaEventKey = await getTBAEventKeyFromFIRSTCode(
          selectedEvent?.value,
          selectedYear?.value
        );
      }
      // Use TBA event key if available
      if (tbaEventKey) {
        return `${tbaEventKey}_${teamNumber}`;
      }
    }
    // Return normal team number
    return teamNumber.toString();
  };

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
      if (!loadingCommunityUpdates) {
        setLoadingCommunityUpdates(true);
        console.log(
          `Fetching community updates for ${selectedEvent?.value?.name}...`
        );
        var result = null;
        var teams = [];

        if (
          selectedEvent?.value?.code.includes("OFFLINE") ||
          (cheesyArenaAvailable && useCheesyArena) ||
          useFTCOffline ||
          (selectedEvent?.value?.type?.includes("OffSeason") && !ftcMode)
        ) {
          //Do something with the team list
          if (adHocTeamList) {
            // https://api.gatool.org/v3/team/172/updates
            console.log("Teams List loaded. Update from the Community");
            var adHocTeams = adHocTeamList.map(async (team) => {
              // Get effective team number (with event prefix for demo teams)
              const effectiveTeamNumber = await getEffectiveTeamNumber(
                team?.teamNumber,
                selectedEvent?.value?.code
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
          } else {
            setCommunityUpdates([]);
            setLoadingCommunityUpdates(false);
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
            setLoadingCommunityUpdates(false);
          } else {
            teams.lastUpdate = moment().format();
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
      ranks = { rankings: { Rankings: [] } };
      if (useCheesyArena && cheesyArenaAvailable) {
        // get rankings from Cheesy Arena
        result = await fetch("http://10.0.100.5:8080/api/rankings");
        if (result.status === 200) {
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
        }
      } else if (
        useFTCOffline &&
        FTCOfflineAvailable &&
        ftcMode?.value === "FTCLocal"
      ) {
        // get the ranks from the FTC Local Server
        console.log("Using FTC Local Server for ranks");
        const rankingsResult = await httpClient.getNoAuth(
          `/api/v1/events/${selectedEvent?.value.code}/rankings/`,
          FTCServerURL,
          undefined,
          { Authorization: FTCKey?.key || "" }
        );
        if (rankingsResult.status === 200) {
          // @ts-ignore
          const rankingsData = await rankingsResult.json();
          if (rankingsData?.rankingList?.length > 0) {
            // reformat data to FIRST API Rankings format
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
        // get the ranks from TBA via gatool Offseason API
        console.log("Using TBA for Offseason Event Rankings");
        // Use cached TBA event key if available, otherwise fetch it
        let eventKey = tbaEventKey;
        if (!eventKey) {
          eventKey = await getTBAEventKeyFromFIRSTCode(
            selectedEvent?.value,
            selectedYear?.value
          );
          setTbaEventKey(eventKey);
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
        //do not use Cheesy Arena and use FIRST API
        result = await httpClient.getNoAuth(
          `${selectedYear?.value}/rankings/${selectedEvent?.value.code}`,
          ftcMode ? ftcBaseURL : undefined
        );
        if (result.status === 200) {
          // @ts-ignore
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
    setRankings(ranks);
    if (ranks?.ranks?.length > 0) {
      if (!ftcMode) {
        getEPA();
      } else if (ftcMode) {
        getEPAFTC();
      }
      if (selectedEvent?.value.districtCode) {
        getDistrictRanks();
      }
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
      `${selectedYear?.value}/district/rankings/${selectedEvent?.value.districtCode}`,
      ftcMode ? ftcBaseURL : undefined
    );
    // @ts-ignore
    districtranks = await result.json();
    districtranks.lastUpdate = moment().format();
    setDistrictRankings(districtranks);
  }

  /** This function retrieves URLs for robot images from The Blue Alliance
   * @async
   * @function getRobotImages
   * @param selectedYear The currently selected year, which is a persistent state variable
   * @param teams The event's team list
   * @return sets the array of URLs
   */
  function getRobotImages() {
    var robotImageList = teamList?.teams.map(async (team) => {
      var media = await httpClient.getNoAuth(
        `${selectedYear?.value}/team/${team?.teamNumber}/media`
      );
      var mediaArray = [];
      if (media?.status !== 204) {
        // @ts-ignore
        mediaArray = await media.json();
      }
      var image = _.filter(mediaArray, { type: "imgur" })[0];
      return {
        teamNumber: team?.teamNumber,
        imageUrl: image?.direct_url || null,
      };
    });
    Promise.all(robotImageList).then((values) => {
      setRobotImages(values);
    });
  }

  async function getEPA() {
    var epa = teamList?.teams.map(async (team) => {
      var epaData = await httpClient.getNoAuth(
        `${selectedYear?.value}/statbotics/${team?.teamNumber}/`
      );
      // var epaData = await httpClient.getNoAuth(
      //   `team_year/${team?.teamNumber}/${selectedYear?.value}`,
      //   "https://api.statbotics.io/v3/",
      //   20000
      // );
      if (epaData.status === 200) {
        // @ts-ignore
        var epaArray = await epaData.json();
        return {
          teamNumber: team?.teamNumber,
          epa: epaArray,
        };
      } else {
        return {
          teamNumber: team?.teamNumber,
          epa: {},
        };
      }
    });
    if (Array.isArray(epa) && epa.length > 0) {
      Promise.all(epa).then((values) => {
        setEPA(values);
      });
    }
  }

  async function getEPAFTC() {
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
      // first let's get the EPA for the team

      var epaData = await httpClient.getNoAuth(
        `${selectedYear?.value}/ftcscout/quick-stats/${team?.teamNumber}`
      );
      // var epaData = await httpClient.getNoAuth(
      //   `teams/${team?.teamNumber}/quick-stats?season=${selectedYear?.value}`,
      //   "https://api.ftcscout.org/rest/v1/",
      //   20000
      // );
      if (epaData.status === 200) {
        // @ts-ignore
        epaArray = await epaData.json();
        // now let's get the season stats for the same team.
        // https://api.ftcscout.org/rest/v1/teams/172/events/2023
        // to get wins, losses, ties, played, dq
        var seasonResult = await httpClient.getNoAuth(
          `${selectedYear?.value}/ftcscout/events/${team?.teamNumber}`
        ); // var seasonResult = await httpClient.getNoAuth(
        //   `teams/${team?.teamNumber}/events/${selectedYear?.value}`,
        //   "https://api.ftcscout.org/rest/v1/",
        //   20000
        // );
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
        console.log("No EPA data for team " + team?.teamNumber);
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
   * This function retrieves the world high scores for the selected year from FIRST.
   * @async
   * @function getWorldStats
   * @param selectedYear The currently selected year, which is a persistent state variable
   * @returns sets the world high scores
   */
  async function getWorldStats() {
    var result = await httpClient.getNoAuth(
      `${selectedYear?.value}/highscores`,
      ftcMode ? ftcBaseURL : undefined
    );
    if (result.status === 404 || result.status === 500) {
      setWorldStats(null);
      return;
    }
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
        details.scoreType = score?.yearType;
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
    var result = await httpClient.getNoAuth(
      `${year}/highscores/${code}`,
      ftcMode ? ftcBaseURL : undefined
    );
    if (result.status === 200) {
      // @ts-ignore
      var highscores = await result.json();
      var scores = {};
      var reducedScores = {};

      scores.year = year;
      scores.lastUpdate = moment().format();

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
          details.score =
            score.matchData.match[`score${details.alliance}Final`];
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
    var alliances = allianceTemp || { Alliances: [] };
    if (
      !selectedEvent?.value?.code.includes("PRACTICE") &&
      !selectedEvent?.value?.code.includes("OFFLINE")
    ) {
      if (useCheesyArena && cheesyArenaAvailable) {
        // get rankings from Cheesy Arena
        result = await fetch("http://10.0.100.5:8080/api/alliances");
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
      } else if (
        useFTCOffline &&
        FTCOfflineAvailable &&
        ftcMode?.value === "FTCLocal"
      ) {
        // get the alliances from the FTC Local Server
        console.log("Using FTC Local Server for Alliances");
        const allianceResult = await httpClient.getNoAuth(
          `/api/v1/events/${selectedEvent?.value.code}/elim/alliances/`,
          FTCServerURL,
          undefined,
          { Authorization: FTCKey?.key || "" }
        );
        if (allianceResult.status === 200) {
          // @ts-ignore
          const allianceData = await allianceResult.json();
          if (allianceData?.alliances?.length > 0) {
            // reformat data to FIRST API Rankings format
            alliances = {
              Alliances: allianceData?.alliances.map((alliance) => {
                return conformFTCOfflineAlliance(alliance);
              }),
            };
          }
        } else if (allianceResult.status === 204) {
          alliances = { Alliances: [] };
        }
      } else if (
        !useFTCOffline &&
        selectedEvent?.value?.type === "OffSeason" &&
        !ftcMode
      ) {
        // get the alliances from TBA via gatool Offseason API
        console.log("Using TBA for Offseason Event Alliances");
        // Use cached TBA event key if available, otherwise fetch it
        let eventKey = tbaEventKey;
        if (!eventKey) {
          eventKey = await getTBAEventKeyFromFIRSTCode(
            selectedEvent?.value,
            selectedYear?.value
          );
          setTbaEventKey(eventKey);
        }

        if (eventKey) {
          const tbaAlliances = await fetchTBAAlliances(
            eventKey,
            selectedYear?.value
          );

          if (tbaAlliances && tbaAlliances?.alliances?.length > 0) {
            alliances = {
              Alliances: tbaAlliances?.alliances,
              count: tbaAlliances?.count,
            };
          } else {
            alliances = { Alliances: [] };
            console.log(
              `No Alliances found for ${selectedEvent?.value?.name} on TBA. Skipping...`
            );
          }
        }
      } else if (!useFTCOffline) {
        result = await httpClient.getNoAuth(
          `${selectedYear?.value}/alliances/${selectedEvent?.value.code}`,
          ftcMode ? ftcBaseURL : undefined
        );
        if (result.status !== 200) {
          alliances = { Alliances: [] };
          console.log(
            `No Alliances found for ${selectedEvent?.value?.name}. Skipping...`
          );
        } else {
          // @ts-ignore
          alliances = await result.json();
          // remove "Seed" from FTC alliance names
          if (ftcMode) {
            alliances.alliances = alliances.alliances.map((alliance) => {
              alliance.name = alliance?.name.replace("Seed ", "");
              return alliance;
            });
          }
        }
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
        if (alliance.round2) {
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
        }
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

    alliances.lastUpdate = moment().format();
    console.log(`${alliances?.alliances?.length} Alliances loaded.`);
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
    // Get effective team number (with event prefix for demo teams)
    const effectiveTeamNumber = await getEffectiveTeamNumber(
      teamNumber,
      selectedEvent?.value?.code
    );
    var result = await httpClient.put(
      `team/${effectiveTeamNumber}/updates`,
      data,
      ftcMode ? ftcBaseURL : undefined
    );
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
    // @ts-ignore
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
    // @ts-ignore
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
      // @ts-ignore
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
    const result = await httpClient.get(`system/syncusers`);
    if (result.status === 200) {
      const syncResult = await result.json();
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
      `team/${teamNumber}/updates/history/`,
      ftcMode ? ftcBaseURL : undefined
    );
    // @ts-ignore
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
          qualSchedule?.schedule?.schedule?.length) +
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
      await setCommunityUpdates([]);
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
      if (!ftcMode && useCheesyArena) {
        getCheesyStatus();
      }
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
    if (
      eventsLoading === "" ||
      eventsLoading !==
        `${ftcMode ? ftcMode.value : "FRC"}-${selectedYear?.value}`
    ) {
      console.log(
        `Loading ${ftcMode ? ftcMode.label : "FRC"} events list for for ${
          selectedYear?.value
        }...`
      );
      setEventsLoading(
        `${ftcMode ? ftcMode.label : "FRC"}-${selectedYear?.value}`
      );
      try {
        let result;
        if (useFTCOffline) {
          const val = await httpClient.getNoAuth(
            `/api/v1/events/`,
            FTCServerURL
          );
          if (val.status === 200) {
            // @ts-ignore
            result = await val.json();
          }
          if (result?.eventCodes?.length > 0) {
            let events = result.eventCodes.map(async (code) => {
              const val = await httpClient.getNoAuth(
                `/api/v1/events/${code}/`,
                FTCServerURL,
                undefined,
                { Authorization: FTCKey?.key || "" }
              );
              if (val.status === 200) {
                // @ts-ignore
                const localEvent = await val.json();
                return {
                  eventId: localEvent.eventCode,
                  code: localEvent.eventCode,
                  divisionCode: null,
                  name: localEvent.name,
                  remote: false,
                  hybrid: false,
                  fieldCount: localEvent.fieldCount,
                  published: false,
                  type: localEvent.type,
                  typeName: "Local Event",
                  regionCode: null,
                  leagueCode: null,
                  districtCode: null,
                  venue: null,
                  address: null,
                  city: null,
                  stateprov: null,
                  country: null,
                  website: null,
                  liveStreamUrl: null,
                  coordinates: null,
                  webcasts: null,
                  timezone: null,
                  dateStart: moment(localEvent.start).format(),
                  dateEnd: moment(localEvent.end).format(),
                };
              }
            });
            await Promise.all(events).then((values) => {
              result.events = values;
            });
          } else {
            result = { events: [] };
          }
        } else {
          const val = await httpClient.getNoAuth(
            `${selectedYear?.value}/events`,
            ftcMode ? ftcBaseURL : null
          );
          if (val.status === 200) {
            // @ts-ignore
            result = await val.json();
          }
        }

        if (typeof result.Events !== "undefined") {
          result.events = result.Events;
          delete result.Events;
        }
        var timeNow = moment();

        if (selectedYear?.value === supportedYears[0].value && !ftcMode) {
          result.events = result?.events.concat(training.events.events);
        }
        var regionCodes = [];
        var types = [];
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
          if (e.type === "OffSeason" || e.type === "10") {
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
          } else if (ftcMode) {
            filters.push(e.type);
            filters.push(e.leagueCode);
            filters.push(e.regionCode);
            regionCodes.push({
              regionCode: e.regionCode,
              description: regionLookup[e.regionCode]
                ? `${regionLookup[e.regionCode]} (${e.regionCode})`
                : e.regionCode,
            });
            types.push({ type: e.type, description: e.typeName });
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
          } else if (e.type === "6") {
            e.champLevel = "CHAMPS";
          }

          return {
            value: e,
            label: `${optionPrefix}${e.name}${optionPostfix}`,
            color: color,
            filters: filters,
          };
        });

        // use for diagnostics to find missing regionCodes
        // regionCodes = _.filter(_.uniqBy(regionCodes,"regionCode"),function(o) {return _.filter(ftcregions, {regionCode:o.regionCode}).length === 0;});

        ftcregions = _.orderBy(
          _.uniqBy(regionCodes, "regionCode"),
          "description",
          "asc"
        );
        types = _.orderBy(_.uniqBy(types, "type"), "description", "asc");
        setFTCTypes(types);

        //Ensure that current year event names change when Division or sponsor names change
        if (typeof eventnames[selectedYear?.value] === "undefined") {
          eventnames[selectedYear?.value] = {};
        }

        events.forEach((event) => {
          // if (!eventnames[selectedYear?.value]) {
          //   eventnames[selectedYear?.value] = {};
          // }

          eventnames[selectedYear?.value][event?.value?.code] =
            event?.value?.name;
        });
        setEventNamesCY(eventnames[selectedYear?.value]);

        setEvents(events);
        if (!_.some(events, selectedEvent)) {
          setSelectedEvent(null);
          setEventsLoading("");
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      console.log(
        `Events already loaded for ${ftcMode ? ftcMode.label : "FRC"}-${
          selectedYear?.value
        }. Skipping...`
      );
    }
  };

  const getDistricts = async () => {
    try {
      const val = await httpClient.getNoAuth(
        `${selectedYear?.value}/districts`
      );
      if (val.status === 200) {
        // @ts-ignore
        const json = await val.json();
        if (typeof json.Districts !== "undefined") {
          json.districts = json.Districts;
          delete json.Districts;
        }
        const districts = json.districts.map((district) => {
          return { label: district.name, value: district.code };
        });

        setDistricts(districts);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getFTCLeagues = async () => {
    try {
      const val = await httpClient.getNoAuth(
        `${selectedYear?.value}/leagues`,
        ftcMode ? ftcBaseURL : undefined
      );
      if (val.status === 200) {
        // @ts-ignore
        const json = await val.json();
        if (typeof json.Leagues !== "undefined") {
          json.leagues = json.Leagues;
          delete json.Leagues;
        }
        const leagues = json.leagues.map((league) => {
          return { label: league.name, value: league.code };
        });

        setFTCLeagues(leagues);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Request FTC Key from local FTC Server
  const requestFTCKey = async () => {
    const val = await httpClient.postNoAuth(
      `/api/v1/keyrequest/?name=gatool`,
      null,
      FTCServerURL,
      null
    );
    if (val.status === 200) {
      // @ts-ignore
      const json = await val.json();
      setFTCKey({ ...json, FTCServerURL: FTCServerURL, active: false });
    }
  };

  // Get the FTC Key from gatool Cloud
  const checkFTCKey = async () => {
    const val = await httpClient.getNoAuth(
      `/api/v1/keycheck/`,
      FTCServerURL,
      undefined,
      { Authorization: FTCKey?.key || "" }
    );
    if (val.status === 200) {
      // @ts-ignore
      const json = await val.json();
      setFTCKey({ ...FTCKey, active: json?.active });
    }
  };

  // Reset the server-side cache
  const resetCache = async () => {
    const val = await httpClient.delete(`system/cache`);
    if (val.status === 204) {
      toast("Server-side cache reset successfully", { type: "success" });
    } else {
      toast("Error resetting cache: " + val.statusText, { type: "error" });
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

  //update the Alliance Count when conditions change
  useEffect(() => {
    var allianceCountTemp = {};

    if (playoffCountOverride) {
      allianceCountTemp.count = parseInt(playoffCountOverride.value);
    } else if (!ftcMode) {
      if (teamList?.teamCountTotal <= 24) {
        allianceCountTemp.count = Math.floor(
          (teamList?.teamCountTotal - 1) / 3
        );
      } else {
        allianceCountTemp.count = 8;
      }
    } else {
      if (teamList?.teamCountTotal <= 10) {
        allianceCountTemp.count = 2;
      } else if (teamList?.teamCountTotal <= 20) {
        allianceCountTemp.count = 4;
      } else if (teamList?.teamCountTotal <= 40) {
        allianceCountTemp.count = 6;
      } else {
        allianceCountTemp.count = 8;
      }
    }

    var allianceMultiplier = ftcMode ? 1 : 2;
    if (
      selectedEvent?.value?.champLevel === "CHAMPS" ||
      selectedEvent?.value?.champLevel === "CMPDIV" ||
      selectedEvent?.value?.champLevel === "CMPSUB"
    ) {
      allianceMultiplier += 1; // Champs have an extra alliance
    }

    allianceCountTemp.allianceSelectionLength =
      allianceMultiplier * allianceCountTemp.count - 1;
    allianceCountTemp.menu = {
      value: allianceCountTemp.count,
      label: allianceCountTemp.count,
    };
    setAllianceCount(allianceCountTemp);
  }, [
    playoffCountOverride,
    teamList,
    setAllianceCount,
    selectedEvent,
    ftcMode,
  ]);

  // Retrieve event list when year selection or ftc Mode switch changes
  useEffect(() => {
    if (httpClient && selectedYear) {
      if (ftcMode) {
        getFTCLeagues();
      } else {
        getDistricts();
      }
      getEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ftcMode, selectedYear, httpClient]);

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
    if (
      teamList?.teams?.length > 0 &&
      selectedEvent?.value?.name &&
      isOnline &&
      !ftcMode
    ) {
      console.log(`Fetching robot images for ${selectedEvent?.value?.name}...`);
      getRobotImages();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [httpClient, teamList?.lastUpdate]);

  // Timer to autmatically refresh event data
  // This will run every refreshRate seconds, which is set in the settings.
  // It will fetch the schedule, world stats, event stats, system messages and event messages
  // It will also check if the event is online or offline, and fetch the schedule accordingly

  const { start, stop } = useInterval(
    () => {
      console.log("fetching event data now");
      if (!selectedEvent?.value?.code.includes("OFFLINE")) {
        console.log("Online event. Getting schedule and ranks");
        if (!ftcMode && useCheesyArena) {
          getCheesyStatus();
        }
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
                  ftcMode={ftcMode}
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
                    regionFilters={regionFilters}
                    setRegionFilters={setRegionFilters}
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
                    FTCSupportedYears={FTCSupportedYears}
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
                    tbaEventKey={tbaEventKey}
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
                    ftcLeagues={ftcLeagues}
                    ftcMode={ftcMode}
                    setFTCMode={setFTCMode}
                    ftcRegions={ftcregions}
                    ftcTypes={ftcTypes}
                    useFTCOffline={useFTCOffline}
                    setUseFTCOffline={setUseFTCOffline}
                    FTCServerURL={FTCServerURL}
                    setFTCServerURL={setFTCServerURL}
                    FTCKey={FTCKey}
                    requestFTCKey={requestFTCKey}
                    checkFTCKey={checkFTCKey}
                    FTCOfflineAvailable={FTCOfflineAvailable}
                    getFTCOfflineStatus={getFTCOfflineStatus}
                    getCheesyStatus={getCheesyStatus}
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
                    ftcMode={ftcMode}
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
                    ftcMode={ftcMode}
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
                    ftcMode={ftcMode}
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
                    ftcMode={ftcMode}
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
                    ftcMode={ftcMode}
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
                    ftcMode={ftcMode}
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
                    selectedYear={selectedYear}
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
                    ftcMode={ftcMode}
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
                    ftcMode={ftcMode}
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
                    resetCache={resetCache}
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

export default App; // @ts-ignore
