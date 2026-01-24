import MainNavigation from "./components/MainNavigation";
import BottomNavigation from "./components/BottomNavigation";
import { Outlet, Route, Routes } from "react-router";
import { BrowserRouter, useLocation } from "react-router-dom";
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
import { useEffect, useState, useRef } from "react";
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

// Pages that should remember scroll position
const pagesWithScrollMemory = ['schedule', 'teamdata', 'ranks', 'announce', 'playbyplay', 'allianceselection'];

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
  screenMode,
  screenModeStatus,
  syncEvent,
}) {
  const location = useLocation();

  // Scroll to top for pages that don't have scroll memory
  useEffect(() => {
    const currentPath = location.pathname.replace('/', '') || '';
    // Only scroll to top if this page doesn't have scroll memory
    // (Pages with scroll memory handle their own scrolling via useScrollPosition hook)
    if (!pagesWithScrollMemory.includes(currentPath)) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

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
        screenMode={screenMode}
        screenModeStatus={screenModeStatus}
        syncEvent={syncEvent}
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
  const previousEventRef = useRef(null);
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
  const [alliances, setAlliances] = usePersistentState("cache:alliances", null);
  const [teamRemappings, setTeamRemappings] = usePersistentState("cache:teamRemappings", null);
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
  const [showBlueBanners, setShowBlueBanners] = usePersistentState(
    "setting:showBlueBanners",
    null
  );
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
  const [useScrollMemory, setUseScrollMemory] = usePersistentState(
    "setting:useScrollMemory",
    true
  );
  const [syncEvent, setSyncEvent] = usePersistentState(
    "setting:syncEvent",
    false
  );
  const [screenMode, setScreenMode] = usePersistentState(
    "setting:screenMode",
    false
  );
  const [screenModeStatus, setScreenModeStatus] = useState(null); // null = unknown, true = valid data, false = invalid/malformed

  const [ftcMode, setFTCMode] = usePersistentState("setting:ftcMode", null);

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
  const [useFourTeamAlliances, setUseFourTeamAlliances] = usePersistentState(
    "setting:useFourTeamAlliances",
    null
  );

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
  const [manualOfflineMode, setManualOfflineMode] = usePersistentState(
    "setting:manualOfflineMode",
    false
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
   * Helper function to fetch all TBA offseason events
   * @param {string} year Year
   * @returns Array of TBA events
   */
  const fetchTBAEvents = async (year) => {
    try {
      console.log(`Fetching all TBA offseason events for ${year}...`);
      const result = await httpClient.getNoAuth(`${year}/offseason/events/`);
      if (result.status === 200) {
        // @ts-ignore
        const tbaEvents = await result.json();
        return tbaEvents.events || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching TBA events:", error);
      return [];
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
   * Helper function to fetch team remappings for a TBA event
   * @param {string} tbaEventKey TBA event key
   * @param {string} year Year
   * @returns Object with team remapping data
   */
  const fetchTeamRemappings = async (tbaEventKey, year) => {
    try {
      const result = await httpClient.getNoAuth(
        `${year}/offseason/event/${tbaEventKey}`
      );
      if (result.status === 200) {
        // @ts-ignore
        const eventData = await result.json();
        const remappedTeams = eventData?.remapTeams || null;
        const keys = Object.keys(remappedTeams);
        const remappedTeamsObject = { numbers: {}, strings: {} };
        keys.forEach((key, index) => {
          remappedTeamsObject.numbers[key.replace("frc", "")] = remappedTeams[key].replace("frc", "");
          remappedTeamsObject.strings[remappedTeams[key].replace("frc", "")] = key.replace("frc", "");
        });
        return remappedTeamsObject;
      }
      return null;
    } catch (error) {
      console.error("Error fetching team remappings:", error);
      return null;
    }
  };

  /**
   * Remaps a string team identifier to its numeric team number (e.g., "TeamA" -> 9990)
   * @param {string} teamString The string team identifier
   * @returns {number} The numeric team number, or null if not found
   */
  const remapStringToNumber = (teamString) => {
    if (!teamRemappings) return Number(teamString);
    return Number(teamRemappings.strings[teamString]) || Number(teamString) || null;
  };

  /**
   * Remaps a numeric team number to its string identifier (e.g., 9990 -> "TeamA")
   * @param {number} teamNumber The numeric team number
   * @returns {string|number} The string team identifier, or the original number if not found
   */
  const remapNumberToString = (teamNumber) => {
    if (!teamRemappings) return teamNumber;
    return teamRemappings.numbers[teamNumber] || teamNumber || "";
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
      } else {
        qualScores = { MatchScores: [] };
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
          match.scoreRedFinal = matchResults.alliances?.[1]?.totalPoints;
          match.scoreBlueFinal = matchResults.alliances?.[0]?.totalPoints;
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
        if (match.scores?.alliances?.[1]) {
          match.redRP = _.pickBy(match.scores.alliances[1], (value, key) => {
            return key.endsWith("BonusAchieved") || key.endsWith("RP");
          });
        }
        // @ts-ignore
        if (match.scores?.alliances?.[0]) {
          match.blueRP = _.pickBy(match.scores.alliances[0], (value, key) => {
            return key.endsWith("BonusAchieved") || key.endsWith("RP");
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
              match.scoreRedFinal = matchResults.alliances?.[1]?.totalPoints;
              match.scoreBlueFinal = matchResults.alliances?.[0]?.totalPoints;
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

      if (playoffScores?.MatchScores) {
        _.forEach(playoffScores.MatchScores, (score) => {
          if (score.alliances[0].totalPoints === score.alliances[1].totalPoints) {
            const matchIndex = _.findIndex(playoffschedule.schedule, {
              matchNumber: score.matchNumber,
            });

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
    getSystemMessages();

    // Calculate event high scores after schedule is loaded
    getEventStats(selectedYear?.value, selectedEvent?.value?.code);
  }

  /**
   * Calculates Blue Banner counts categorized by event level and type
   * Blue Banners are awarded for:
   * - Event Winners (award_type === 1)
   * - Chairman's Award (award_type === 0, name includes "Chairman")
   * - Impact Award (award_type === 0, name includes "Impact")
   * 
   * @param {Object} champsAppearances - Team's championship appearances with events
   * @param {Array} awards - Team's awards history
   * @returns {Object} Blue Banner counts by category
   */
  function calculateBlueBanners(champsAppearances, awards) {
    const banners = {
      blueBanners: 0,
      blueBannersYears: [],

      // Regional Level
      regionalWins: 0,
      regionalWinsYears: [],
      regionalChairmans: 0,
      regionalChairmansYears: [],
      regionalImpact: 0,
      regionalImpactYears: [],
      regionalWoodieFlowers: 0,
      regionalWoodieFlowersYears: [],

      // District Level
      districtWins: 0,
      districtWinsYears: [],
      districtChairmans: 0,
      districtChairmansYears: [],
      districtImpact: 0,
      districtImpactYears: [],
      districtWoodieFlowers: 0,
      districtWoodieFlowersYears: [],

      // District Championship Division Level
      districtDivisionWins: 0,
      districtDivisionWinsYears: [],
      districtDivisionChairmans: 0,
      districtDivisionChairmansYears: [],
      districtDivisionImpact: 0,
      districtDivisionImpactYears: [],

      // District Championship Level
      districtChampionshipWins: 0,
      districtChampionshipWinsYears: [],
      districtChampionshipChairmans: 0,
      districtChampionshipChairmansYears: [],
      districtChampionshipImpact: 0,
      districtChampionshipImpactYears: [],
      districtChampionshipWoodieFlowers: 0,
      districtChampionshipWoodieFlowersYears: [],

      // World Championship Division Level
      championshipDivisionWins: 0,
      championshipDivisionWinsYears: [],
      championshipDivisionChairmans: 0,
      championshipDivisionChairmansYears: [],
      championshipDivisionImpact: 0,
      championshipDivisionImpactYears: [],

      // World Championship (Einstein) Level
      einsteinWins: 0,
      einsteinWinsYears: [],
      einsteinChairmans: 0,
      einsteinChairmansYears: [],
      einsteinImpact: 0,
      einsteinImpactYears: [],
      einsteinChairmansFinalist: 0,
      einsteinChairmansFinalistYears: [],
      einsteinImpactFinalist: 0,
      einsteinImpactFinalistYears: [],
      championshipWoodieFlowers: 0,
      championshipWoodieFlowersYears: [],

      // Festival of Champions
      festivalWins: 0,
      festivalWinsYears: [],
    };

    // Create a map of event keys to event objects for quick lookup
    const eventMap = {};
    if (champsAppearances?.events) {
      champsAppearances.events.forEach((event) => {
        eventMap[event.key] = event;
      });
    }

    // Process each award
    if (!awards || !Array.isArray(awards)) {
      return banners;
    }

    awards.forEach((award) => {
      const event = eventMap[award.event_key];
      if (!event) return;

      const isWin = award.award_type === 1;
      const isChairmans = award.award_type === 0 && (
        award.name.includes("Chairman") ||
        award.name.toLowerCase().includes("chairman")
      );
      const isImpact = award.award_type === 0 && award.name.includes("Impact");
      const isChairmansImpactFinalist = award.award_type === 69 && (
        award.name.includes("Chairman") ||
        award.name.toLowerCase().includes("chairman") ||
        award.name.includes("Impact")
      );
      const isWoodieFlowers = award.award_type === 3 && (
        award.name.includes("Woodie Flowers") ||
        award.name.toLowerCase().includes("woodie flowers")
      );

      // Only count Blue Banner awards
      if (!isWin && !isChairmans && !isImpact && !isChairmansImpactFinalist && !isWoodieFlowers) return;

      // Determine event level and category
      const eventType = event.event_type;
      const eventTypeString = event.event_type_string;
      const eventName = event.name || "";
      const eventKey = event.key || "";

      // Check for Festival of Champions
      const isFestival = eventName.toLowerCase().includes("festival of champions") ||
        eventKey.toLowerCase().includes("festival");

      // Event type codes:
      // 0 = Regional
      // 1 = District
      // 2 = District Championship
      // 3 = Championship Division
      // 4 = Championship Finals (Einstein)
      // 5 = District Championship Division
      // 99 = Offseason

      if (isFestival && isWin) {
        banners.festivalWins += 1;
        banners.festivalWinsYears.push(award.year);
        banners.blueBanners += 1;
        banners.blueBannersYears.push(award.year);
      } else if (eventType === 0) {
        // Regional
        if (isWin) {
          banners.regionalWins += 1;
          banners.regionalWinsYears.push(award.year);
          banners.blueBanners += 1;
          banners.blueBannersYears.push(award.year);
        } else if (isChairmans) {
          banners.regionalChairmans += 1;
          banners.regionalChairmansYears.push(award.year);
          banners.blueBanners += 1;
          banners.blueBannersYears.push(award.year);
        } else if (isImpact) {
          banners.regionalImpact += 1;
          banners.regionalImpactYears.push(award.year);
          banners.blueBanners += 1;
          banners.blueBannersYears.push(award.year);
        } else if (isWoodieFlowers) {
          banners.regionalWoodieFlowers += 1;
          banners.regionalWoodieFlowersYears.push(award.year);
          banners.blueBanners += 1;
          banners.blueBannersYears.push(award.year);
        }
      } else if (eventType === 1) {
        // District
        if (isWin) {
          banners.districtWins += 1;
          banners.districtWinsYears.push(award.year);
          banners.blueBanners += 1;
          banners.blueBannersYears.push(award.year);
        } else if (isChairmans) {
          banners.districtChairmans += 1;
          banners.districtChairmansYears.push(award.year);
          banners.blueBanners += 1;
          banners.blueBannersYears.push(award.year);
        } else if (isImpact) {
          banners.districtImpact += 1;
          banners.districtImpactYears.push(award.year);
          banners.blueBanners += 1;
          banners.blueBannersYears.push(award.year);
        } else if (isWoodieFlowers) {
          banners.districtWoodieFlowers += 1;
          banners.districtWoodieFlowersYears.push(award.year);
          banners.blueBanners += 1;
          banners.blueBannersYears.push(award.year);
        }
      } else if (eventType === 2) {
        // District Championship or District Championship with Divisions
        // Check if it's a division within a district championship
        const isDivision = event.parent_event_key !== null ||
          eventTypeString === "District Championship Division" ||
          eventName.toLowerCase().includes("division");

        if (isDivision) {
          // District Championship Division
          if (isWin) {
            banners.districtDivisionWins += 1;
            banners.districtDivisionWinsYears.push(award.year);
            banners.blueBanners += 1;
            banners.blueBannersYears.push(award.year);
          } else if (isChairmans) {
            banners.districtDivisionChairmans += 1;
            banners.districtDivisionChairmansYears.push(award.year);
            banners.blueBanners += 1;
            banners.blueBannersYears.push(award.year);
          } else if (isImpact) {
            banners.districtDivisionImpact += 1;
            banners.districtDivisionImpactYears.push(award.year);
            banners.blueBanners += 1;
            banners.blueBannersYears.push(award.year);
          }
        } else {
          // District Championship (Einstein-equivalent)
          if (isWin) {
            banners.districtChampionshipWins += 1;
            banners.districtChampionshipWinsYears.push(award.year);
            banners.blueBanners += 1;
            banners.blueBannersYears.push(award.year);
          } else if (isChairmans) {
            // District Championship Chairman's awards are counted as Regional awards
            banners.regionalChairmans += 1;
            banners.regionalChairmansYears.push(award.year);
            banners.blueBanners += 1;
            banners.blueBannersYears.push(award.year);
          } else if (isImpact) {
            // District Championship Impact awards are counted as Regional awards
            banners.regionalImpact += 1;
            banners.regionalImpactYears.push(award.year);
            banners.blueBanners += 1;
            banners.blueBannersYears.push(award.year);
          } else if (isWoodieFlowers) {
            banners.districtChampionshipWoodieFlowers += 1;
            banners.districtChampionshipWoodieFlowersYears.push(award.year);
            banners.blueBanners += 1;
            banners.blueBannersYears.push(award.year);
          }
        }
      } else if (eventType === 3 || eventType === 5) {
        // Championship Division (at World Championships)
        if (isWin) {
          banners.championshipDivisionWins += 1;
          banners.championshipDivisionWinsYears.push(award.year);
          banners.blueBanners += 1;
          banners.blueBannersYears.push(award.year);
        } else if (isChairmans) {
          banners.championshipDivisionChairmans += 1;
          banners.championshipDivisionChairmansYears.push(award.year);
          banners.blueBanners += 1;
          banners.blueBannersYears.push(award.year);
        } else if (isImpact) {
          banners.championshipDivisionImpact += 1;
          banners.championshipDivisionImpactYears.push(award.year);
          banners.blueBanners += 1;
          banners.blueBannersYears.push(award.year);
        }
      } else if (eventType === 4) {
        // Championship Finals (Einstein)
        if (isWin) {
          banners.einsteinWins += 1;
          banners.einsteinWinsYears.push(award.year);
          banners.blueBanners += 1;
          banners.blueBannersYears.push(award.year);
        } else if (isChairmans) {
          banners.einsteinChairmans += 1;
          banners.einsteinChairmansYears.push(award.year);
          banners.blueBanners += 1;
          banners.blueBannersYears.push(award.year);
        } else if (isImpact) {
          banners.einsteinImpact += 1;
          banners.einsteinImpactYears.push(award.year);
          banners.blueBanners += 1;
          banners.blueBannersYears.push(award.year);
        } else if (isChairmansImpactFinalist) {
          // Chairman's/Impact Finalist - determine which type based on award name
          if (award.name.includes("Chairman") || award.name.toLowerCase().includes("chairman")) {
            banners.einsteinChairmansFinalist += 1;
            banners.einsteinChairmansFinalistYears.push(award.year);
          } else {
            banners.einsteinImpactFinalist += 1;
            banners.einsteinImpactFinalistYears.push(award.year);
          }
          banners.blueBanners += 1;
          banners.blueBannersYears.push(award.year);
        } else if (isWoodieFlowers) {
          banners.championshipWoodieFlowers += 1;
          banners.championshipWoodieFlowersYears.push(award.year);
          banners.blueBanners += 1;
          banners.blueBannersYears.push(award.year);
        }
      }
    });

    return banners;
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
        // Use event's tbaEventKey directly
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
      // Initialize newTeams with current teams as fallback to ensure we always have teams data
      // Create new team objects to avoid mutating originals
      var newTeams = teams.teams.map((team) => {
        // Preserve existing awards if they exist, otherwise initialize empty object
        const awards = (team.awards && typeof team.awards === 'object') ? team.awards : {};
        return {
          ...team,
          awards: awards
        };
      });

      // Skip external API calls when in FTC offline mode without internet
      if (useFTCOffline && (!isOnline || manualOfflineMode)) {
        console.log("FTC Offline mode: Skipping queryAwards API call while offline" + (manualOfflineMode ? " (manual override)" : "") + " - using cached awards");
        // Awards already initialized above, just use cached data
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

            // Merge awards into teams - ensure all teams get awards data
            // Try both string and number keys since API might return different formats
            // Create new team objects to avoid mutating originals
            newTeams = teams.teams.map((team) => {
              const teamNum = team?.teamNumber;
              // Try multiple key formats to handle different API response structures
              const teamAwards = awards[`${teamNum}`] || awards[teamNum] || awards[String(teamNum)] || {};

              // Create a new team object with awards merged in
              return {
                ...team,
                awards: teamAwards
              };
            });

            const teamsWithAwards = newTeams.filter(t => t.awards && Object.keys(t.awards).length > 0).length;
            if (teamsWithAwards > 0) {
              console.log(`Awards loaded: ${teamsWithAwards} of ${newTeams.length} teams have awards data`);
            }
          } else {
            console.warn(`Awards API returned status ${req.status} for event ${selectedEvent?.value?.code}, using teams without awards update`);
          }
        } catch (error) {
          console.error(`Error fetching awards for event ${selectedEvent?.value?.code}:`, error);
          // newTeams already initialized with teams above, so we'll use those
        }
      }

      // Parse awards to ensure we highlight them properly and remove extraneous text i.e. FIRST CHampionship from name
      // newTeams is guaranteed to have data at this point (initialized above)
      var formattedAwards = newTeams.map((team) => {
        try {
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
                const yearKey = `${selectedYear?.value - index}`;
                // Ensure the year key exists in awards before accessing it
                if (!team.awards[yearKey]) {
                  team.awards[yearKey] = { awards: [] };
                }
                // Ensure awards array exists
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
              // Normalize the structure - ensure it has an awards array
              if (!yearAwards.awards || !Array.isArray(yearAwards.awards)) {
                // If awards property doesn't exist or isn't an array, initialize it
                team.awards[yearKey] = {
                  awards: Array.isArray(yearAwards) ? yearAwards : []
                };
              } else {
                // Ensure structure is correct
                team.awards[yearKey] = {
                  awards: yearAwards.awards
                };
              }

              // Map over awards to add highlight, eventName, and year properties
              if (team.awards[yearKey].awards && Array.isArray(team.awards[yearKey].awards)) {
                team.awards[yearKey].awards = team.awards[yearKey].awards.map((award) => {
                  award.highlight = awardsHilight(award.name);
                  award.eventName = eventnames[`${year}`]
                    ? eventnames[`${year}`][award.eventCode]
                    : award.eventCode;
                  award.year = year;
                  return award;
                });
              }
            } else {
              // Initialize empty awards array for this year
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
          console.error(`Error processing awards for team ${team?.teamNumber}:`, error);
          // Return team with existing awards data even if processing failed
          return team;
        }
      });

      // Update teams.teams with formatted awards before proceeding to champs data
      // This ensures awards are always merged before state is updated
      teams.teams = formattedAwards;

      var champsTeams = [];
      // When online and in FRC mode, always check for blue banners if showBlueBanners is enabled
      const shouldFetchChampsData = !ftcMode && (
        selectedEvent?.value?.champLevel !== "" ||
        showDistrictChampsStats ||
        (isOnline && showBlueBanners === true) ||
        (selectedEvent?.value?.code.includes("OFFLINE") &&
          playoffOnly &&
          champsStyle)
      );

      if (shouldFetchChampsData) {
        console.log("Getting Champs stats", {
          champLevel: selectedEvent?.value?.champLevel,
          showDistrictChampsStats,
          showBlueBanners,
          isOnline,
          eventType: selectedEvent?.value?.type,
          shouldFetchChampsData
        });
        champsTeams = teams.teams.map(async (team) => {
          // Initialize blueBanners outside the try-catch so it's always available
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
            var champsRequest = await httpClient.getNoAuth(
              `${selectedYear?.value}/team/${team?.teamNumber}/history/`,
              ftcMode ? ftcBaseURL : undefined
            );
            if (champsRequest.status === 200) {
              // @ts-ignore
              var history = await champsRequest.json();
              var appearances = history?.events;
              var awards = history?.awards;
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

              if (appearances && Array.isArray(appearances)) {
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
              }

              // Calculate comprehensive Blue Banner tracking
              if (appearances && awards) {
                const blueBannerData = calculateBlueBanners({ events: appearances }, awards);
                Object.assign(blueBanners, blueBannerData);
              }

              team.champsAppearances = result;
              team.blueBanners = blueBanners;
              return team;
            }
            // Still set blueBanners even if request failed, so UI doesn't break
            team.blueBanners = blueBanners;
            return team;
          } catch (error) {
            console.error(`Error fetching history for team ${team?.teamNumber}:`, error);
            // Set blueBanners even on error to prevent UI issues
            team.blueBanners = blueBanners;
            return team;
          }
        });

        await Promise.all(champsTeams).then(function (values) {
          teams.lastUpdate = moment().format();

          teams.teams = _.filter(values, (value) => {
            return value ? true : false;
          });
          teams.teams = _.sortBy(teams.teams, ["teamNumber"]);
          setTeamList(teams);
        });
      } else {
        // Initialize empty blueBanners for all teams when not fetching champs data
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
      // Otherwise, use event's tbaEventKey if available
      if (!tbaEventKey && selectedEvent?.value?.tbaEventKey) {
        tbaEventKey = selectedEvent?.value?.tbaEventKey;
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
                setLoadingCommunityUpdates(false);
                return;
              } else {
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
            } else {
              setCommunityUpdates([]);
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
        } catch (error) {
          console.error(`Error fetching community updates:`, error);
          setCommunityUpdates([]);
          setLoadingCommunityUpdates(false);
        }
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
        // Use event's tbaEventKey directly
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

    // Filter out FTC rankings entries that haven't played any matches yet
    // In FTC, rankings are published before matches start (ordered by team number)
    // We only want to show teams that have actually played matches
    if (ftcMode && ranks?.ranks && Array.isArray(ranks.ranks)) {
      const originalCount = ranks.ranks.length;
      ranks.ranks = ranks.ranks.filter((rank) => {
        // Keep entries that have matchesCounted defined and greater than 0
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
    // Skip external API calls when in FTC offline mode without internet
    if (useFTCOffline && (!isOnline || manualOfflineMode)) {
      console.log("FTC Offline mode: Skipping FTCScout API calls while offline" + (manualOfflineMode ? " (manual override)" : ""));
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
      // first let's get the EPA for the team

      var epaData = await httpClient.getNoAuth(
        `${selectedYear?.value}/ftcscout/quick-stats/${team?.teamNumber}`,
        ftcMode ? ftcBaseURL : undefined
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
          `${selectedYear?.value}/ftcscout/events/${team?.teamNumber}`,
          ftcMode ? ftcBaseURL : undefined
        );
        // var seasonResult = await httpClient.getNoAuth(
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
        // console.log("No EPA data for team " + team?.teamNumber);
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
  }

  /**
   * This function calculates event high scores from local match data.
   * Tracks 4 categories: overall, penaltyFree, TBAPenaltyFree, and offsetting
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
        offsetting: null
      },
      playoff: {
        overall: null,
        penaltyFree: null,
        TBAPenaltyFree: null,
        offsetting: null
      }
    };

    // Helper function to determine if a match qualifies for a category and get the high score
    function processMatch(match, level, tournamentType) {
      if (!match || match.scoreRedFinal === undefined || match.scoreBlueFinal === undefined) {
        return;
      }

      const redScore = match.scoreRedFinal || 0;
      const blueScore = match.scoreBlueFinal || 0;
      const redFoul = match.scoreRedFoul || 0;
      const blueFoul = match.scoreBlueFoul || 0;

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
      ['overall', 'penaltyFree', 'TBAPenaltyFree', 'offsetting'].forEach(type => {
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
        // Use event's tbaEventKey directly
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
    if (result.status === 200) {
      // @ts-ignore
      var notifications = await result.json();

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
   * This function fetches the logged-in user's preferences from gatool Cloud.
   * @async
   * @function getUserPrefs
   * @returns {Promise<object>} User preferences saved for the logged-in user
   */
  async function getUserPrefs() {
    var result = await httpClient.get(`user/preferences`);
    // @ts-ignore
    if (result.status === 200) {
      // @ts-ignore
      var userPrefs = await result.json();
      return userPrefs;
    } else {
      return {
      };
    }
  }

  /**
   * This function saves the logged-in user's preferences to gatool Cloud.
   * @async
   * @function putUserPrefs
   * @returns {Promise<object>} Result code for writing the user preferences
   */
  async function putUserPrefs() {
    // gather user preferences from the UI
    var userPrefs = {
      selectedEvent: selectedEvent,
      selectedYear: selectedYear,
      rankingsOverride: rankingsOverride,
      eventFilters: eventFilters,
      regionFilters: regionFilters,
      timeFilter: timeFilter,
      timeFormat: timeFormat,
      showSponsors: showSponsors,
      autoHideSponsors: autoHideSponsors,
      showAwards: showAwards,
      showMinorAwards: showMinorAwards,
      showNotes: showNotes,
      showNotesAnnounce: showNotesAnnounce,
      showMottoes: showMottoes,
      showChampsStats: showChampsStats,
      showDistrictChampsStats: showDistrictChampsStats,
      showBlueBanners: showBlueBanners,
      hidePracticeSchedule: hidePracticeSchedule,
      monthsWarning: monthsWarning,
      showInspection: showInspection,
      swapScreen: swapScreen,
      autoAdvance: autoAdvance,
      highScoreMode: highScoreMode,
      autoUpdate: autoUpdate,
      awardsMenu: awardsMenu,
      showQualsStats: showQualsStats,
      showQualsStatsQuals: showQualsStatsQuals,
      teamReduction: teamReduction,
      playoffCountOverride: playoffCountOverride,
      allianceCount: allianceCount,
      reverseEmcee: reverseEmcee,
      usePullDownToUpdate: usePullDownToUpdate,
      useScrollMemory: useScrollMemory,
      ftcMode: ftcMode,
      useCheesyArena: useCheesyArena,
      useFourTeamAlliances: useFourTeamAlliances,
      useFTCOffline: useFTCOffline,
      FTCKey: FTCKey,
      FTCServerURL: FTCServerURL,
      manualOfflineMode: manualOfflineMode,
      currentMatch: currentMatch
    }
    var result = await httpClient.put(`user/preferences`, userPrefs);
    // @ts-ignore
    if (result.status === 200 || result.status === 204) {
      // @ts-ignore
      return {status: "ok"};
    } else {
      return {
        status: "error",
        message: `**Error** ${result?.statusText || "unknown"}`,
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
      // Check if there's content before trying to parse JSON
      // result might be a Response object or a plain object, so check for headers
      if ('headers' in result && result.headers) {
        const contentLength = result.headers.get('content-length');
        if (contentLength === '0' || contentLength === null) {
          // No content, return empty array
          return [];
        }
      }
      try {
        // @ts-ignore
        var notifications = await result.json();
        return notifications;
      } catch (e) {
        // If JSON parsing fails (e.g., empty body), return empty array
        return [];
      }
    } else if (result.status === 204) {
      // No Content status, return empty array
      return [];
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
    // Skip external API calls when in FTC offline mode without internet
    if (useFTCOffline && (!isOnline || manualOfflineMode)) {
      console.log("FTC Offline mode: Skipping System Messages API call while offline" + (manualOfflineMode ? " (manual override)" : ""));
      return;
    }

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
    // Skip external API calls when in FTC offline mode without internet
    if (useFTCOffline && (!isOnline || manualOfflineMode)) {
      console.log("FTC Offline mode: Skipping Event Messages API call while offline" + (manualOfflineMode ? " (manual override)" : ""));
      return;
    }

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
      const isOfflineEvent = selectedEvent?.value?.code === "OFFLINE";
      const previousWasOffline = previousEventRef.current?.code === "OFFLINE";
      const isSameEvent = previousEventRef.current?.code === selectedEvent?.value?.code;

      // For OFFLINE events, only preserve uploaded data if we're staying on the same OFFLINE event
      // (e.g., page reload). If switching TO OFFLINE from another event, clear everything.
      const shouldPreserveOfflineData = isOfflineEvent && previousWasOffline && isSameEvent;

      if (!shouldPreserveOfflineData) {
        await setPracticeSchedule(null);
        setPracticeFileUploaded(false);
        await setQualSchedule(null);
        await setPlayoffSchedule(null);
        await setOfflinePlayoffSchedule(null);
        await setTeamList(null);
        await setRankings(null);
        if (isOfflineEvent && !isSameEvent) {
          console.log("Switching to OFFLINE event - clearing previous event data");
        }
      } else {
        console.log("Reloading same OFFLINE event - preserving uploaded schedules, rankings, and team list");
      }

      // Update the ref to track current event for next time
      previousEventRef.current = selectedEvent?.value;

      await setCommunityUpdates([]);
      setLoadingCommunityUpdates(false);
      setEITeams([]);
      await setRobotImages(null);
      await setEventHighScores(null);
      await setPlayoffs(false);

      // For OFFLINE events, preserve alliance-related settings only if reloading same event
      if (!shouldPreserveOfflineData) {
        await setAllianceCount(null);
        await setTeamReduction(null);
        await setPlayoffCountOverride(null);
        setAllianceSelectionArrays({});
        setAllianceSelection(false);
        await setRankingsOverride(null);
      } else {
        console.log("Reloading same OFFLINE event - preserving alliance count and settings");
      }

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

      // Fetch team remappings for TBA offseason events
      if (selectedEvent?.value?.type === "OffSeason" && selectedEvent?.value?.tbaEventKey && !ftcMode) {
        const remappings = await fetchTeamRemappings(
          selectedEvent.value.tbaEventKey,
          selectedYear.value
        );
        await setTeamRemappings(remappings);
      } else {
        // Clear remappings for non-TBA events
        await setTeamRemappings(null);
      }

      getTeamList();
      await getSchedule(true);
      getSystemMessages();
      getEventMessages();
      getWorldStats();
    }
  };

  /**
   * Merges TBA offseason events with FIRST events
   * - Matches TBA events to FIRST events by event code (firstEventCode), then by name
   * - Adds tbaEventKey to matched FIRST events
   * - Adds unmatched TBA events as new OffSeason events to the list
   * @param {Array} firstEvents Array of FIRST events
   * @param {Array} tbaEvents Array of TBA events
   * @param {string} year Year for event code generation
   * @returns Merged array of events
   */
  const mergeTBAWithFIRSTEvents = (firstEvents, tbaEvents, year) => {
    console.log(`Merging ${tbaEvents.length} TBA events with ${firstEvents.length} FIRST events...`);

    // Clone FIRST events to avoid mutations
    let mergedEvents = _.cloneDeep(firstEvents);
    const unmatchedTBAEvents = [];

    // Process each TBA event
    tbaEvents.forEach((tbaEvent) => {
      let matched = false;

      // First, try to match by firstEventCode
      const firstCodeMatch = _.findIndex(mergedEvents, (e) =>
        e.code?.toLowerCase() === tbaEvent.firstEventCode?.toLowerCase()
      );

      if (firstCodeMatch >= 0) {
        // Found a match by event code - add TBA event key
        mergedEvents[firstCodeMatch].tbaEventKey = tbaEvent.code?.split(year)[1];
        matched = true;
      } else {
        // Try to match by name
        const nameMatch = _.findIndex(mergedEvents, (e) =>
          e.name?.trim() === tbaEvent.name?.trim()
        );

        if (nameMatch >= 0) {
          // Found a match by name - add TBA event key
          mergedEvents[nameMatch].tbaEventKey = tbaEvent.code?.split(year)[1];
          matched = true;
        }
      }

      // If no match found, add as a new offseason event
      if (!matched) {
        unmatchedTBAEvents.push(tbaEvent);
      }
    });

    // Add unmatched TBA events as new OffSeason events
    unmatchedTBAEvents.forEach((tbaEvent) => {
      // Create a FIRST-compatible event object from TBA event
      const newEvent = {
        eventId: null,
        code: tbaEvent.code,
        divisionCode: null,
        name: tbaEvent.name,
        remote: false,
        hybrid: false,
        fieldCount: null,
        published: false,
        type: "OffSeason",
        typeName: "Offseason Event",
        regionCode: null,
        leagueCode: null,
        districtCode: null,
        venue: tbaEvent.venue || tbaEvent.location_name || null,
        address: tbaEvent.address || null,
        city: tbaEvent.city || null,
        stateprov: tbaEvent.stateprov || tbaEvent.state_prov || null,
        country: tbaEvent.country || null,
        website: tbaEvent.website || null,
        liveStreamUrl: null,
        coordinates: null,
        webcasts: tbaEvent.webcasts || null,
        timezone: tbaEvent.timezone || null,
        dateStart: tbaEvent.dateStart || tbaEvent.start_date ? moment(tbaEvent.dateStart || tbaEvent.start_date).format() : null,
        dateEnd: tbaEvent.dateEnd || tbaEvent.end_date ? moment(tbaEvent.dateEnd || tbaEvent.end_date).format() : null,
        tbaEventKey: tbaEvent.code?.split(year)[1],
        weekNumber: null,
        champLevel: "",
      };

      mergedEvents.push(newEvent);
    });

    console.log(`Merge complete. Total events: ${mergedEvents.length} (${unmatchedTBAEvents.length} new from TBA)`);
    return mergedEvents;
  };

  const getEvents = async () => {
    if (
      eventsLoading === "" ||
      eventsLoading !==
      `${ftcMode ? ftcMode.value : "FRC"}-${selectedYear?.value}`
    ) {
      console.log(
        `Loading ${ftcMode ? ftcMode.label : "FRC"} events list for for ${selectedYear?.value
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

        // Add training events for current season only
        if (selectedYear?.value === supportedYears[0].value && !ftcMode) {
          result.events = result?.events.concat(training.events.events);
        } else if (!ftcMode) {
          // Add OFFLINE event for all FRC seasons
          const offlineEvent = training.events.events.find(e => e.code === "OFFLINE");
          if (offlineEvent) {
            result.events = result?.events.concat([offlineEvent]);
          }
        }

        // Fetch and merge TBA offseason events for FRC mode
        if (!ftcMode && isOnline) {
          try {
            const tbaEvents = await fetchTBAEvents(selectedYear?.value);
            if (tbaEvents.length > 0) {
              result.events = mergeTBAWithFIRSTEvents(result.events, tbaEvents, selectedYear?.value);
            }
          } catch (error) {
            console.error("Error fetching/merging TBA events:", error);
            // Continue with FIRST events only if TBA fetch fails
          }
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

          var eventTime = e.dateEnd ? moment(e.dateEnd) : moment();
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
        // Check if the currently selected event still exists in the newly loaded events list
        if (selectedEvent) {
          const matchingEvent = _.find(events, (event) => event?.value?.code === selectedEvent?.value?.code);
          if (matchingEvent) {
            // Update the selected event with fresh data from the API
            console.log("Updating selected event with fresh data from API");
            setSelectedEvent(matchingEvent);
          } else {
            // Event no longer exists in the list, clear selection
            console.log("Previously selected event not found in current events list, clearing selection");
            setSelectedEvent(null);
            setEventsLoading("");
          }
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      console.log(
        `Events already loaded for ${ftcMode ? ftcMode.label : "FRC"}-${selectedYear?.value
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
    // Skip external API calls when in FTC offline mode without internet
    if (useFTCOffline && (!isOnline || manualOfflineMode)) {
      console.log("FTC Offline mode: Skipping FTC Leagues API call while offline" + (manualOfflineMode ? " (manual override)" : "") + " - using cached leagues");
      return;
    }

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
      selectedEvent?.value?.champLevel === "CMPSUB" ||
      useFourTeamAlliances
    ) {
      allianceMultiplier += 1; // Champs have an extra alliance member (4 teams instead of 3)
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
    useFourTeamAlliances,
  ]);

  // Ensure FRC mode is set when OFFLINE or training events are loaded from localStorage
  // This needs to check when data loads from localStorage ONLY, not on user interactions
  const hasRunOfflineCheck = useRef(false);
  useEffect(() => {
    // Only run this check once when the component mounts and data loads from localStorage
    // Don't interfere with user selections
    if (hasRunOfflineCheck.current) {
      return; // Already ran, don't run again
    }

    // If a training/OFFLINE event is selected but ftcMode is null, set it to FRC mode (false)
    // This handles the edge case where page reloads with OFFLINE event selected
    if (selectedEvent?.value?.code && ftcMode === null && selectedYear) {
      const isTrainingEvent = selectedEvent.value.code === "OFFLINE" ||
        selectedEvent.value.code.includes("PRACTICE");
      if (isTrainingEvent) {
        console.log("OFFLINE/training event detected on load, setting program to FRC mode");
        setFTCMode(false);
      }
      hasRunOfflineCheck.current = true;
    } else if (ftcMode !== null) {
      // If ftcMode is already set, mark as complete so we don't interfere
      hasRunOfflineCheck.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEvent, ftcMode, selectedYear]); // Removed setFTCMode from deps

  // Retrieve event list when year selection or ftc Mode switch changes
  useEffect(() => {
    // Only load events if both program (ftcMode) and season (selectedYear) are selected
    // ftcMode !== null ensures a program has been explicitly selected (false = FRC, object = FTC modes)
    if (httpClient && selectedYear && ftcMode !== null) {
      if (ftcMode) {
        getFTCLeagues();
      } else {
        getDistricts();
      }
      getEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ftcMode, selectedYear, httpClient]);

  // Reset manual offline mode when switching to FRC or FTC Online mode
  useEffect(() => {
    if (ftcMode?.value !== "FTCLocal" && manualOfflineMode) {
      console.log("Switching to online mode, resetting manual offline mode");
      setManualOfflineMode(false);
    }
  }, [ftcMode, manualOfflineMode, setManualOfflineMode]);

  // Refresh team list when showBlueBanners is enabled to fetch blue banner data
  useEffect(() => {
    if (showBlueBanners === true && !ftcMode && selectedEvent && teamList?.teams?.length > 0 && isOnline) {
      console.log("Show Blue Banners enabled, refreshing team list to fetch blue banner data");
      getTeamList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBlueBanners]);

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
      // FTC has 4 teams per match (2 per alliance), FRC has 6 teams per match (3 per alliance)
      const teamsPerMatch = ftcMode ? 4 : 6;

      // Get the actual schedule array - handle both nested (API) and flat (upload) structures
      const scheduleArray = qualSchedule?.schedule?.schedule || qualSchedule?.schedule;

      // Extract unique team numbers that actually competed from the schedule
      // This is especially important for FTC where registered teams may not compete
      // Cross-reference with rankings to ensure we only count teams that actually played
      const competingTeamNumbers = new Set();
      const teamsInSchedule = new Set();

      scheduleArray?.forEach((match) => {
        match?.teams?.forEach((team) => {
          if (team?.teamNumber) {
            teamsInSchedule.add(team.teamNumber);
          }
        });
      });

      // Cross-reference with rankings: only count teams that are in schedule AND have matchesPlayed > 0
      teamsInSchedule.forEach((teamNumber) => {
        const teamRanking = _.find(rankings?.ranks, { teamNumber: teamNumber });
        if (teamRanking && teamRanking.matchesPlayed > 0) {
          competingTeamNumbers.add(teamNumber);
        }
      });

      const actualCompetingTeamsCount = competingTeamNumbers.size;

      const totalMatches = scheduleArray?.length || 0;

      // Calculate expected matches per team based on actual competing teams
      // Use Math.round for better accuracy with uneven distributions
      const calculatedMatchesPerTeam = actualCompetingTeamsCount > 0
        ? Math.round((teamsPerMatch * totalMatches) / actualCompetingTeamsCount)
        : 0;

      // For additional accuracy, check the actual matchesPlayed from rankings
      const teamsWithMatches = _.filter(rankings?.ranks, (team) => team.matchesPlayed > 0);
      const actualMatchesPerTeam = teamsWithMatches.length > 0
        ? _.maxBy(teamsWithMatches, 'matchesPlayed')?.matchesPlayed
        : calculatedMatchesPerTeam;

      // Use the actual matches played if it's close to calculated (within 1 match)
      // Otherwise fall back to calculated value
      matchesPerTeam = Math.abs(actualMatchesPerTeam - calculatedMatchesPerTeam) <= 1
        ? actualMatchesPerTeam
        : calculatedMatchesPerTeam;

      // In order to start Alliance Selection, we need the following conditions to be true:
      // All matches must have been completed
      // All teams that participated must have completed their scheduled matches
      // We test these in different places: the schedule and the rankings. This ensures that
      // we have both API results, and that they are both current and complete.

      // For FTC: Check if all teams that actually competed have completed their matches
      // For FRC: Use the traditional team list count minus reductions
      const expectedTeamCount = ftcMode ? actualCompetingTeamsCount : (teamList?.teamCountTotal - teamReduction);
      const teamsWithExpectedMatches = _.filter(rankings?.ranks, { matchesPlayed: matchesPerTeam }).length;

      // Additional check: all competing teams have at least the expected matches
      const allCompetingTeamsComplete = teamsWithMatches.length > 0 &&
        _.every(teamsWithMatches, (team) => team.matchesPlayed >= matchesPerTeam) &&
        teamsWithMatches.length >= actualCompetingTeamsCount;

      if (
        qualSchedule?.schedule?.length === qualSchedule?.completedMatchCount &&
        (teamsWithExpectedMatches >= expectedTeamCount ||
          (ftcMode && allCompetingTeamsComplete))
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
    ftcMode,
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

  // Reset event high scores when FTC mode changes to prevent showing stale data from the previous mode
  useEffect(() => {
    setEventHighScores(null);
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

  // Screen Mode: Function to fetch and process user preferences
  const fetchAndProcessUserPrefs = async () => {
    if (!screenMode || !isAuthenticated) {
      return;
    }
    
    try {
      const userPrefs = await getUserPrefs();
      
      console.log("Screen Mode: Received userPrefs", {
        userPrefs,
        type: typeof userPrefs,
        isArray: Array.isArray(userPrefs),
        keys: userPrefs ? Object.keys(userPrefs) : [],
        hasStatus: userPrefs?.status !== undefined,
        status: userPrefs?.status
      });
      
      // Check if response has error status
      if (userPrefs && userPrefs.status && userPrefs.status !== "ok" && userPrefs.status !== 200) {
        console.log("Screen Mode: Error status in response", userPrefs.status);
        setScreenModeStatus(false);
        return;
      }
      
      // Check if data is properly formed - validate structure
      // The main check is to ensure it's NOT the malformed structure with "preferences" array
      // We don't require all properties to exist since some may legitimately be missing
      const hasValidStructure = userPrefs && 
                                typeof userPrefs === 'object' && 
                                !Array.isArray(userPrefs) &&
                                Object.keys(userPrefs).length > 0 &&
                                !userPrefs.preferences; // Reject if it has a "preferences" array property
      
      // Check that it has at least some of the core expected properties (not all are required)
      // This ensures we have actual preference data, not just an empty object
      const coreProperties = ['selectedEvent', 'selectedYear', 'currentMatch'];
      const hasCoreProperties = hasValidStructure && coreProperties.some(prop => prop in userPrefs);
      
      // Data is valid if structure is correct and has at least some core properties
      const isValidData = hasValidStructure && hasCoreProperties;
      
      console.log("Screen Mode: Validation results", {
        hasValidStructure,
        hasCoreProperties,
        isValidData: isValidData,
        userPrefsKeys: userPrefs ? Object.keys(userPrefs) : [],
        userPrefsType: typeof userPrefs,
        isArray: Array.isArray(userPrefs),
        hasPreferences: userPrefs?.preferences !== undefined,
        keyCount: userPrefs ? Object.keys(userPrefs).length : 0
      });
      
      if (!isValidData) {
        // Explicitly set to false for malformed data
        console.log("Setting screenModeStatus to false due to invalid data");
        setScreenModeStatus(false);
      } else {
        // Data is valid
        console.log("Setting screenModeStatus to true - data is valid");
        setScreenModeStatus(true);
      }
      
      if (isValidData && typeof userPrefs === 'object') {
        // Only update selectedEvent if it's actually different (compare event codes to avoid reloading)
        if (userPrefs.selectedEvent !== undefined) {
          const currentEventCode = selectedEvent?.value?.code;
          const newEventCode = userPrefs.selectedEvent?.value?.code;
          if (currentEventCode !== newEventCode) {
            setSelectedEvent(userPrefs.selectedEvent);
          }
        }
        // Only update selectedYear if it's actually different
        if (userPrefs.selectedYear !== undefined && userPrefs.selectedYear?.value !== selectedYear?.value) {
          setSelectedYear(userPrefs.selectedYear);
        }
        // Update other preference values only if they've changed
        if (userPrefs.rankingsOverride !== undefined && !_.isEqual(userPrefs.rankingsOverride, rankingsOverride)) {
          setRankingsOverride(userPrefs.rankingsOverride);
        }
        if (userPrefs.eventFilters !== undefined && !_.isEqual(userPrefs.eventFilters, eventFilters)) {
          setEventFilters(userPrefs.eventFilters);
        }
        if (userPrefs.regionFilters !== undefined && !_.isEqual(userPrefs.regionFilters, regionFilters)) {
          setRegionFilters(userPrefs.regionFilters);
        }
        if (userPrefs.timeFilter !== undefined && !_.isEqual(userPrefs.timeFilter, timeFilter)) {
          setTimeFilter(userPrefs.timeFilter);
        }
        if (userPrefs.timeFormat !== undefined && !_.isEqual(userPrefs.timeFormat, timeFormat)) {
          setTimeFormat(userPrefs.timeFormat);
        }
        if (userPrefs.showSponsors !== undefined && userPrefs.showSponsors !== showSponsors) {
          setShowSponsors(userPrefs.showSponsors);
        }
        if (userPrefs.autoHideSponsors !== undefined && userPrefs.autoHideSponsors !== autoHideSponsors) {
          setAutoHideSponsors(userPrefs.autoHideSponsors);
        }
        if (userPrefs.showAwards !== undefined && userPrefs.showAwards !== showAwards) {
          setShowAwards(userPrefs.showAwards);
        }
        if (userPrefs.showMinorAwards !== undefined && userPrefs.showMinorAwards !== showMinorAwards) {
          setShowMinorAwards(userPrefs.showMinorAwards);
        }
        if (userPrefs.showNotes !== undefined && userPrefs.showNotes !== showNotes) {
          setShowNotes(userPrefs.showNotes);
        }
        if (userPrefs.showNotesAnnounce !== undefined && userPrefs.showNotesAnnounce !== showNotesAnnounce) {
          setShowNotesAnnounce(userPrefs.showNotesAnnounce);
        }
        if (userPrefs.showMottoes !== undefined && userPrefs.showMottoes !== showMottoes) {
          setShowMottoes(userPrefs.showMottoes);
        }
        if (userPrefs.showChampsStats !== undefined && userPrefs.showChampsStats !== showChampsStats) {
          setShowChampsStats(userPrefs.showChampsStats);
        }
        if (userPrefs.showDistrictChampsStats !== undefined && userPrefs.showDistrictChampsStats !== showDistrictChampsStats) {
          setShowDistrictChampsStats(userPrefs.showDistrictChampsStats);
        }
        if (userPrefs.showBlueBanners !== undefined && userPrefs.showBlueBanners !== showBlueBanners) {
          setShowBlueBanners(userPrefs.showBlueBanners);
        }
        if (userPrefs.hidePracticeSchedule !== undefined && userPrefs.hidePracticeSchedule !== hidePracticeSchedule) {
          setHidePracticeSchedule(userPrefs.hidePracticeSchedule);
        }
        if (userPrefs.monthsWarning !== undefined && !_.isEqual(userPrefs.monthsWarning, monthsWarning)) {
          setMonthsWarning(userPrefs.monthsWarning);
        }
        if (userPrefs.showInspection !== undefined && userPrefs.showInspection !== showInspection) {
          setShowInspection(userPrefs.showInspection);
        }
        if (userPrefs.swapScreen !== undefined && userPrefs.swapScreen !== swapScreen) {
          setSwapScreen(userPrefs.swapScreen);
        }
        if (userPrefs.autoAdvance !== undefined && userPrefs.autoAdvance !== autoAdvance) {
          setAutoAdvance(userPrefs.autoAdvance);
        }
        if (userPrefs.highScoreMode !== undefined && userPrefs.highScoreMode !== highScoreMode) {
          setHighScoreMode(userPrefs.highScoreMode);
        }
        if (userPrefs.autoUpdate !== undefined && userPrefs.autoUpdate !== autoUpdate) {
          setAutoUpdate(userPrefs.autoUpdate);
        }
        if (userPrefs.awardsMenu !== undefined && userPrefs.awardsMenu !== awardsMenu) {
          setAwardsMenu(userPrefs.awardsMenu);
        }
        if (userPrefs.showQualsStats !== undefined && userPrefs.showQualsStats !== showQualsStats) {
          setShowQualsStats(userPrefs.showQualsStats);
        }
        if (userPrefs.showQualsStatsQuals !== undefined && userPrefs.showQualsStatsQuals !== showQualsStatsQuals) {
          setShowQualsStatsQuals(userPrefs.showQualsStatsQuals);
        }
        if (userPrefs.teamReduction !== undefined && userPrefs.teamReduction !== teamReduction) {
          setTeamReduction(userPrefs.teamReduction);
        }
        if (userPrefs.playoffCountOverride !== undefined && !_.isEqual(userPrefs.playoffCountOverride, playoffCountOverride)) {
          setPlayoffCountOverride(userPrefs.playoffCountOverride);
        }
        if (userPrefs.allianceCount !== undefined && !_.isEqual(userPrefs.allianceCount, allianceCount)) {
          setAllianceCount(userPrefs.allianceCount);
        }
        if (userPrefs.reverseEmcee !== undefined && userPrefs.reverseEmcee !== reverseEmcee) {
          setReverseEmcee(userPrefs.reverseEmcee);
        }
        if (userPrefs.usePullDownToUpdate !== undefined && userPrefs.usePullDownToUpdate !== usePullDownToUpdate) {
          setUsePullDownToUpdate(userPrefs.usePullDownToUpdate);
        }
        if (userPrefs.useScrollMemory !== undefined && userPrefs.useScrollMemory !== useScrollMemory) {
          setUseScrollMemory(userPrefs.useScrollMemory);
        }
        if (userPrefs.ftcMode !== undefined && !_.isEqual(userPrefs.ftcMode, ftcMode)) {
          setFTCMode(userPrefs.ftcMode);
        }
        if (userPrefs.useCheesyArena !== undefined && userPrefs.useCheesyArena !== useCheesyArena) {
          setUseCheesyArena(userPrefs.useCheesyArena);
        }
        if (userPrefs.useFourTeamAlliances !== undefined && userPrefs.useFourTeamAlliances !== useFourTeamAlliances) {
          setUseFourTeamAlliances(userPrefs.useFourTeamAlliances);
        }
        if (userPrefs.useFTCOffline !== undefined && userPrefs.useFTCOffline !== useFTCOffline) {
          setUseFTCOffline(userPrefs.useFTCOffline);
        }
        if (userPrefs.FTCKey !== undefined && !_.isEqual(userPrefs.FTCKey, FTCKey)) {
          setFTCKey(userPrefs.FTCKey);
        }
        if (userPrefs.FTCServerURL !== undefined && userPrefs.FTCServerURL !== FTCServerURL) {
          setFTCServerURL(userPrefs.FTCServerURL);
        }
        if (userPrefs.manualOfflineMode !== undefined && userPrefs.manualOfflineMode !== manualOfflineMode) {
          setManualOfflineMode(userPrefs.manualOfflineMode);
        }
        if (userPrefs.currentMatch !== undefined && userPrefs.currentMatch !== null && userPrefs.currentMatch !== currentMatch) {
          setCurrentMatch(userPrefs.currentMatch);
        }
      } else {
        // Data is malformed or empty
        setScreenModeStatus(false);
      }
    } catch (error) {
      console.error("Error fetching user preferences in Screen Mode:", error);
      setScreenModeStatus(false);
    }
  };

  // Screen Mode: Poll user preferences every 10 seconds and update local state
  const { start: startScreenModePoll, stop: stopScreenModePoll } = useInterval(
    fetchAndProcessUserPrefs,
    10000, // 10 seconds
    {
      autoStart: false,
      immediate: false,
      selfCorrecting: true,
      onFinish: () => {
        console.log("Screen Mode polling stopped.");
      },
    }
  );

  const screenModeInitializedRef = useRef(false);
  const previousScreenModeRef = useRef(screenMode);
  useEffect(() => {
    // Only reset status when screenMode changes from false to true (first enable)
    if (screenMode && isAuthenticated && !previousScreenModeRef.current) {
      setScreenModeStatus(null);
      screenModeInitializedRef.current = true;
      // Fetch immediately when Screen Mode is enabled
      fetchAndProcessUserPrefs();
      startScreenModePoll();
    } else if (screenMode && isAuthenticated) {
      // Screen mode already enabled, just ensure polling is running
      startScreenModePoll();
    } else {
      // Screen mode disabled
      stopScreenModePoll();
      screenModeInitializedRef.current = false;
      if (!screenMode) {
        setScreenModeStatus(null);
      }
    }
    previousScreenModeRef.current = screenMode;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenMode, isAuthenticated]);

  // Sync user preferences when syncEvent is enabled
  const syncEventEnabledRef = useRef(false);
  const previousSyncEventRef = useRef(syncEvent);
  const initialSyncAttemptedRef = useRef(false);
  useEffect(() => {
    if (syncEvent && isAuthenticated && !syncEventEnabledRef.current) {
      // Call putUserPrefs once when syncEvent is enabled (only if authenticated)
      syncEventEnabledRef.current = true;
      previousSyncEventRef.current = syncEvent;
      // Add a small delay for initial sync to ensure backend is ready
      const syncTimeout = setTimeout(() => {
        putUserPrefs().catch((error) => {
          // Log error but don't prevent sync from being enabled
          // The initial sync failure is often due to backend initialization
          if (!initialSyncAttemptedRef.current) {
            console.log("Initial sync attempt failed (this is often expected):", error.message);
            initialSyncAttemptedRef.current = true;
          } else {
            console.error("Error syncing user preferences:", error);
          }
        });
      }, 500); // 500ms delay for initial sync
      
      return () => clearTimeout(syncTimeout);
    } else if (!syncEvent || !isAuthenticated) {
      syncEventEnabledRef.current = false;
      previousSyncEventRef.current = syncEvent;
      initialSyncAttemptedRef.current = false; // Reset on disable
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncEvent, isAuthenticated]);

  // Sync user preferences when currentMatch changes (if syncEvent is enabled and user is authenticated)
  const previousMatchRef = useRef(currentMatch);
  useEffect(() => {
    if (syncEvent && isAuthenticated && currentMatch !== null && previousMatchRef.current !== currentMatch && previousMatchRef.current !== null) {
      previousMatchRef.current = currentMatch;
      putUserPrefs().catch((error) => {
        console.error("Error syncing user preferences after match change:", error);
      });
    } else if (currentMatch !== null) {
      previousMatchRef.current = currentMatch;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMatch, syncEvent, isAuthenticated]);

  // Sync user preferences when any preference changes (if syncEvent is enabled)
  // Use a ref to track if we should skip the first sync (when syncEvent is first enabled)
  const preferencesRef = useRef({
    selectedEvent,
    selectedYear,
    rankingsOverride,
    eventFilters,
    regionFilters,
    timeFilter,
    timeFormat,
    showSponsors,
    autoHideSponsors,
    showAwards,
    showMinorAwards,
    showNotes,
    showNotesAnnounce,
    showMottoes,
    showChampsStats,
    showDistrictChampsStats,
    showBlueBanners,
    hidePracticeSchedule,
    monthsWarning,
    showInspection,
    swapScreen,
    autoAdvance,
    highScoreMode,
    autoUpdate,
    awardsMenu,
    showQualsStats,
    showQualsStatsQuals,
    teamReduction,
    playoffCountOverride,
    allianceCount,
    reverseEmcee,
    usePullDownToUpdate,
    useScrollMemory,
    ftcMode,
    useCheesyArena,
    useFourTeamAlliances,
    useFTCOffline,
    FTCKey,
    FTCServerURL,
    manualOfflineMode,
  });

  useEffect(() => {
    if (syncEvent && isAuthenticated && syncEventEnabledRef.current) {
      // Check if any preference actually changed
      const currentPrefs = {
        selectedEvent,
        selectedYear,
        rankingsOverride,
        eventFilters,
        regionFilters,
        timeFilter,
        timeFormat,
        showSponsors,
        autoHideSponsors,
        showAwards,
        showMinorAwards,
        showNotes,
        showNotesAnnounce,
        showMottoes,
        showChampsStats,
        showDistrictChampsStats,
        showBlueBanners,
        hidePracticeSchedule,
        monthsWarning,
        showInspection,
        swapScreen,
        autoAdvance,
        highScoreMode,
        autoUpdate,
        awardsMenu,
        showQualsStats,
        showQualsStatsQuals,
        teamReduction,
        playoffCountOverride,
        allianceCount,
        reverseEmcee,
        usePullDownToUpdate,
        useScrollMemory,
        ftcMode,
        useCheesyArena,
        useFourTeamAlliances,
        useFTCOffline,
        FTCKey,
        FTCServerURL,
        manualOfflineMode,
      };

      // Compare current preferences with previous (skip if syncEvent just changed)
      if (previousSyncEventRef.current === syncEvent && !_.isEqual(preferencesRef.current, currentPrefs)) {
        preferencesRef.current = currentPrefs;
        putUserPrefs().catch((error) => {
          console.error("Error syncing user preferences after preference change:", error);
        });
      } else {
        preferencesRef.current = currentPrefs;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedEvent,
    selectedYear,
    rankingsOverride,
    eventFilters,
    regionFilters,
    timeFilter,
    timeFormat,
    showSponsors,
    autoHideSponsors,
    showAwards,
    showMinorAwards,
    showNotes,
    showNotesAnnounce,
    showMottoes,
    showChampsStats,
    showDistrictChampsStats,
    showBlueBanners,
    hidePracticeSchedule,
    monthsWarning,
    showInspection,
    swapScreen,
    autoAdvance,
    highScoreMode,
    autoUpdate,
    awardsMenu,
    showQualsStats,
    showQualsStatsQuals,
    teamReduction,
    playoffCountOverride,
    allianceCount,
    reverseEmcee,
    usePullDownToUpdate,
    useScrollMemory,
    ftcMode,
    useCheesyArena,
    useFourTeamAlliances,
    useFTCOffline,
    FTCKey,
    FTCServerURL,
    manualOfflineMode,
    syncEvent,
    isAuthenticated,
  ]);

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
                  screenMode={screenMode}
                  screenModeStatus={screenModeStatus}
                  syncEvent={syncEvent}
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
                    showBlueBanners={showBlueBanners}
                    setShowBlueBanners={setShowBlueBanners}
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
                    useScrollMemory={useScrollMemory}
                    setUseScrollMemory={setUseScrollMemory}
                    syncEvent={syncEvent}
                    setSyncEvent={setSyncEvent}
                    screenMode={screenMode}
                    setScreenMode={setScreenMode}
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
                    useFourTeamAlliances={useFourTeamAlliances}
                    setUseFourTeamAlliances={setUseFourTeamAlliances}
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
                    manualOfflineMode={manualOfflineMode}
                    setManualOfflineMode={setManualOfflineMode}
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
                    remapNumberToString={remapNumberToString}
                    useScrollMemory={useScrollMemory}
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
                    remapNumberToString={remapNumberToString}
                    useScrollMemory={useScrollMemory}
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
                    remapNumberToString={remapNumberToString}
                    remapStringToNumber={remapStringToNumber}
                    useScrollMemory={useScrollMemory}
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
                    showBlueBanners={showBlueBanners}
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
                    remapNumberToString={remapNumberToString}
                    remapStringToNumber={remapStringToNumber}
                    useScrollMemory={useScrollMemory}
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
                    remapNumberToString={remapNumberToString}
                    remapStringToNumber={remapStringToNumber}
                    useScrollMemory={useScrollMemory}
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
                    remapNumberToString={remapNumberToString}
                    useFourTeamAlliances={useFourTeamAlliances}
                    useScrollMemory={useScrollMemory}
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
                    remapNumberToString={remapNumberToString}
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
                    putUserPrefs={putUserPrefs}
                    getUserPrefs={getUserPrefs}
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
