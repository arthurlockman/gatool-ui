import MainNavigation from "./components/MainNavigation";
import BottomNavigation from "./components/BottomNavigation";
import { Outlet, Route, Routes } from "react-router";
import { BrowserRouter, useLocation } from "react-router-dom";
import { ScrollContainerContext } from "./contextProviders/ScrollContainerContext";
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
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import {
  compactReserveEditsForEvent,
  prunePlayoffReserveSetsAfterPostedMatches,
} from "./utils/playoffReserveEdits";
import { UseAuthClient } from "./contextProviders/AuthClientContext";
import { useAuth0 } from "@auth0/auth0-react";
import { Blocks } from "react-loader-spinner";
import { Container } from "react-bootstrap";
import { usePersistentState } from "./hooks/UsePersistentState";
import { useDarkMode } from "./hooks/useDarkMode";
import { useSettings } from "./contexts/SettingsContext";
import { useEventData } from "./contexts/EventDataContext";
import { EventStoreProvider } from "./contexts/EventStoreProvider";
import _ from "lodash";
import moment from "moment";
import Developer from "./pages/Developer";
import { eventNames, FTCEventNames } from "./data/eventNames";
import { specialAwards, hallOfFame, FTCHallOfFame } from "./data/hallOfFame";
import { originalAndSustaining, refreshRate } from "./data/appConfig";
import { ftcRegions } from "./data/ftcRegions";
import { appUpdates } from "./data/appUpdates";
import { useOnlineStatus } from "./contextProviders/OnlineContext";
import { toast } from "react-toastify";
import { trainingData } from "components/TrainingMatches";
import { timeZones } from "data/timeZones";
import { extendFTCPlayoffScheduleWithPartialMatches } from "./utils/ftcPlayoffSchedule";
import { extendFRCPlayoffScheduleWithPartialMatches } from "./utils/frcPlayoffSchedule";
import {
  normalizeFtcHybridMatch,
  hydrateFtcPlayoffTeamsFromResults,
  normalizePlayoffScheduleApiResponse,
} from "./utils/ftcHybridMatchTeams";
import {
  getConnectionsEventKey,
  fetchAllianceConnections,
  allianceRosterToConnectionKey,
} from "./utils/allianceConnectionsApi";
import { useInterval } from "react-interval-hook";
import { clearAvatarCache } from "./components/TeamAvatar";

import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useHotkeys } from "react-hotkeys-hook";
import { useNotifications } from "hooks/useNotifications";
import { useHighScores } from "hooks/useHighScores";
import { useCommunityUpdates } from "hooks/useCommunityUpdates";

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
  eventHighScores,
  worldHighScores,
  allianceSelection,
  systemBell,
  systemMessage,
  screenMode,
  screenModeStatus,
  syncEvent,
}) {
  const { selectedEvent, qualSchedule, teamList, communityUpdates, rankings, practiceSchedule, ftcMode, playoffs } = useEventData();
  const location = useLocation();
  const scrollContainerRef = useRef(null);

  // Scroll to top for pages that don't have scroll memory
  useEffect(() => {
    const currentPath = location.pathname.replace('/', '') || '';
    if (!pagesWithScrollMemory.includes(currentPath)) {
      const el = scrollContainerRef.current;
      if (el) el.scrollTo(0, 0);
      else window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return (
    <ScrollContainerContext.Provider value={scrollContainerRef}>
      <div
        className="app-layout-fixed"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100dvh",
          overflow: "hidden",
        }}
      >
        <header className="app-layout-top" style={{ flexShrink: 0 }}>
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
        </header>
        <main
          ref={scrollContainerRef}
          className="app-layout-main"
          style={{
            flex: "1 1 0",
            minHeight: 0,
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <Outlet />
        </main>
        <footer className="app-layout-bottom" style={{ flexShrink: 0 }}>
          <BottomNavigation ftcMode={ftcMode} />
        </footer>
      </div>
    </ScrollContainerContext.Provider>
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

  const [httpClient, operationsInProgress] = UseAuthClient();
  /** Ref populated by EventStoreProvider with store-owned functions.
   *  Allows App.jsx orchestrators (getSchedule, loadEvent) to call
   *  store functions even though they live above the provider tree. */
  const eventStoreRef = useRef({});
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
  const [EPA, setEPA] = usePersistentState("cache:EPA", null);
  const [rankings, setRankings] = usePersistentState("cache:rankings", null);
  const [rankingsOverride, setRankingsOverride] = usePersistentState(
    "setting:rankingsOverride",
    null
  );
  const [alliances, setAlliances] = usePersistentState("cache:alliances", null);
  const [allianceCount, setAllianceCount] = usePersistentState(
    "setting:allianceCount",
    null
  );
  const [districtRankings, setDistrictRankings] = usePersistentState(
    "cache:districtRankings",
    null
  );
  const [playoffs, setPlayoffs] = usePersistentState("cache:playoffs", null);
  /**
   * Playoff reserve edits keyed only by event code then alliance **number** (string):
   * { op: 'set', round3 } | legacy { op: 'set', backup, backupReplaced } | { op: 'clear' }.
   */
  const [playoffReserveEdits, setPlayoffReserveEdits] = usePersistentState(
    "cache:playoffReserveEditsByAlliance",
    {}
  );
  const playoffReserveEditsRef = useRef(playoffReserveEdits || {});
  if (playoffReserveEdits && typeof playoffReserveEdits === "object") {
    playoffReserveEditsRef.current = playoffReserveEdits;
  } else {
    playoffReserveEditsRef.current = {};
  }
  const [teamRemappings, setTeamRemappings] = usePersistentState("cache:teamRemappings", null);
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

  // Display & UX preferences from SettingsContext
  const {
    timeFormat, setTimeFormat,
    showSponsors, setShowSponsors,
    autoHideSponsors, setAutoHideSponsors,
    showAwards, setShowAwards,
    showMinorAwards, setShowMinorAwards,
    showNotes, setShowNotes,
    showNotesAnnounce, setShowNotesAnnounce,
    showMottoes, setShowMottoes,
    showChampsStats, setShowChampsStats,
    showDistrictChampsStats, setShowDistrictChampsStats,
    showChampsStatsAtDistrictRegional, setShowChampsStatsAtDistrictRegional,
    showBlueBanners, setShowBlueBanners,
    hidePracticeSchedule, setHidePracticeSchedule,
    monthsWarning, setMonthsWarning,
    showInspection, setShowInspection,
    showWorldAndStatsOnAnnouncePlayByPlay, setShowWorldAndStatsOnAnnouncePlayByPlay,
    swapScreen, setSwapScreen,
    autoAdvance, setAutoAdvance,
    highScoreMode, setHighScoreMode,
    autoUpdate, setAutoUpdate,
    awardsMenu, setAwardsMenu,
    showQualsStats, setShowQualsStats,
    showQualsStatsQuals, setShowQualsStatsQuals,
    teamReduction, setTeamReduction,
    reverseEmcee, setReverseEmcee,
    usePullDownToUpdate, setUsePullDownToUpdate,
    useScrollMemory, setUseScrollMemory,
    useFourTeamAlliances, setUseFourTeamAlliances,
  } = useSettings();
  const [allianceSelection, setAllianceSelection] = useState(null);
  /** Preloaded prior-partnership data per alliance roster (key = sorted team ids). */
  const [alliancePartnerConnectionsCache, setAlliancePartnerConnectionsCache] =
    useState({});
  const [playoffCountOverride, setPlayoffCountOverride] = usePersistentState(
    "setting:playoffCountOverride",
    null
  );
  const [lastVisit, setLastVisit] = usePersistentState("cache:lastVisit", {});
  const [localUpdates, setLocalUpdates] = usePersistentState(
    "cache:localUpdates",
    []
  );
  const [allianceSelectionArrays, setAllianceSelectionArrays] = useState({});
  const { darkMode, setDarkMode, useOsTheme, setUseOsTheme, appearanceDark } = useDarkMode();
  const [eventNamesCY, setEventNamesCY] = usePersistentState(
    "cache:eventNamesCY",
    []
  );
  // Live data: changes after every match; do not persist
  const [regionalEventDetail, setRegionalEventDetail] = useState(null);
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

  function upsertPlayoffReserveOverlay({
    allianceNumber,
    round3,
    pendingSourceMatch,
  }) {
    const code = selectedEvent?.value?.code;
    if (
      !code ||
      allianceNumber === undefined ||
      allianceNumber === null ||
      allianceNumber === "" ||
      round3 === undefined ||
      round3 === null ||
      round3 === ""
    ) {
      return;
    }
    const prev =
      playoffReserveEditsRef.current &&
      typeof playoffReserveEditsRef.current === "object"
        ? playoffReserveEditsRef.current
        : {};
    const key = String(allianceNumber);
    const forEv = compactReserveEditsForEvent({ ...(prev[code] || {}) });
    const entry = { op: "set", round3 };
    if (pendingSourceMatch && typeof pendingSourceMatch === "object") {
      entry.pendingSourceMatch = {
        tournamentLevel: pendingSourceMatch.tournamentLevel ?? null,
        matchNumber:
          pendingSourceMatch.matchNumber != null
            ? Number(pendingSourceMatch.matchNumber)
            : null,
        originalMatchNumber:
          pendingSourceMatch.originalMatchNumber != null
            ? Number(pendingSourceMatch.originalMatchNumber)
            : undefined,
        series:
          pendingSourceMatch.series != null
            ? Number(pendingSourceMatch.series)
            : undefined,
      };
    }
    forEv[key] = entry;
    const next = { ...prev, [code]: forEv };
    playoffReserveEditsRef.current = next;
    setPlayoffReserveEdits(next);
  }

  function removePlayoffReserveOverlay({ allianceNumber }) {
    const code = selectedEvent?.value?.code;
    if (
      !code ||
      allianceNumber === undefined ||
      allianceNumber === null ||
      allianceNumber === ""
    ) {
      return;
    }
    const prev =
      playoffReserveEditsRef.current &&
      typeof playoffReserveEditsRef.current === "object"
        ? playoffReserveEditsRef.current
        : {};
    const key = String(allianceNumber);
    const forEv = compactReserveEditsForEvent({ ...(prev[code] || {}) });
    forEv[key] = { op: "clear" };
    const next = { ...prev, [code]: forEv };
    playoffReserveEditsRef.current = next;
    setPlayoffReserveEdits(next);
  }

  /** Per-event, per-playoff-match station order (Red1… / Blue1…) for Announce / Play-by-Play. */
  const [playoffStationOrderEdits, setPlayoffStationOrderEdits] =
    usePersistentState("cache:playoffStationOrderEditsByMatch", {});
  const playoffStationOrderEditsRef = useRef({});
  useEffect(() => {
    playoffStationOrderEditsRef.current =
      playoffStationOrderEdits && typeof playoffStationOrderEdits === "object"
        ? playoffStationOrderEdits
        : {};
  }, [playoffStationOrderEdits]);

  function upsertPlayoffStationOrderOverlay({ eventCode, matchKey, teams }) {
    if (!eventCode || !matchKey || !teams?.length) return;
    const prev = _.cloneDeep(
      playoffStationOrderEditsRef.current &&
        typeof playoffStationOrderEditsRef.current === "object"
        ? playoffStationOrderEditsRef.current
        : {}
    );
    const next = {
      ...prev,
      [eventCode]: {
        ...(prev[eventCode] || {}),
        [matchKey]: { teams: _.cloneDeep(teams) },
      },
    };
    playoffStationOrderEditsRef.current = next;
    setPlayoffStationOrderEdits(next);
  }

  function removePlayoffStationOrderOverlay({ eventCode, matchKey }) {
    if (!eventCode || !matchKey) return;
    const prev = _.cloneDeep(
      playoffStationOrderEditsRef.current &&
        typeof playoffStationOrderEditsRef.current === "object"
        ? playoffStationOrderEditsRef.current
        : {}
    );
    if (!prev[eventCode]) return;
    const ev = { ...prev[eventCode] };
    delete ev[matchKey];
    const next = { ...prev };
    if (Object.keys(ev).length === 0) {
      delete next[eventCode];
    } else {
      next[eventCode] = ev;
    }
    playoffStationOrderEditsRef.current = next;
    setPlayoffStationOrderEdits(next);
  }

  const [qualsLength, setQualsLength] = useState(-1);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [syncEvent, setSyncEvent] = usePersistentState(
    "setting:syncEvent",
    false
  );
  const [screenMode, setScreenMode] = usePersistentState(
    "setting:screenMode",
    false
  );
  const [screenModeSyncFrequency, setScreenModeSyncFrequency] = usePersistentState(
    "setting:screenModeSyncFrequency",
    10
  ); // Frequency in seconds (5-10)
  const [backgroundDataRefresh, setBackgroundDataRefresh] = usePersistentState(
    "setting:backgroundDataRefresh",
    true
  );
  const [backgroundDataRefreshFrequency, setBackgroundDataRefreshFrequency] = usePersistentState(
    "setting:backgroundDataRefreshFrequency",
    15
  ); // Frequency in seconds (5-60)
  const [screenModeStatus, setScreenModeStatus] = useState(null); // null = unknown, true = valid data, false = invalid/malformed

  // Enforce mutual exclusivity between syncEvent and screenMode
  // Use a ref to prevent infinite loops when disabling one or the other
  const enforcingMutualExclusivityRef = useRef(false);
  useEffect(() => {
    // Skip if we're already in the process of enforcing mutual exclusivity
    if (enforcingMutualExclusivityRef.current) {
      return;
    }

    if (screenMode && syncEvent) {
      // If both are enabled, disable syncEvent (screenMode takes priority)
      console.log("Screen Mode and Sync Event both enabled - disabling Sync Event");
      enforcingMutualExclusivityRef.current = true;
      setSyncEvent(false);
      // Reset flag after state update
      setTimeout(() => {
        enforcingMutualExclusivityRef.current = false;
      }, 100);
    }
  }, [screenMode, syncEvent, setSyncEvent]);

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
  const [haveChampsTeams, setHaveChampsTeams] = useState(false);
  const [EITeams, setEITeams] = useState([]);

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
  const [manualOfflineMode, setManualOfflineMode] = usePersistentState(
    "setting:manualOfflineMode",
    false
  );

  // High scores state and functions
  const {
    worldStats,
    eventHighScores,
    ftcRegionHighScores,
    ftcLeagueHighScores,
    frcDistrictHighScores,
    setEventHighScores,
    setFtcLeagueHighScores,
    setFrcDistrictHighScores,
    getWorldStats,
    getEventStats,
    getFTCRegionHighScores,
    getFTCLeagueHighScores,
    getFrcDistrictHighScores,
  } = useHighScores({
    httpClient,
    selectedEvent,
    selectedYear,
    ftcMode,
    qualSchedule,
    playoffSchedule,
    useFTCOffline,
    isOnline,
    manualOfflineMode,
  });

  // Notification system (state, API, service worker effects)
  const {
    systemMessage,
    setSystemMessage,
    systemBell,
    setSystemBell,
    eventMessage,
    setEventMessage,
    eventBell,
    setEventBell,
    putNotifications,
    putEventNotifications,
    getNotifications,
    getSystemMessages,
    getEventMessages,
    reloadPage,
  } = useNotifications({
    httpClient,
    selectedEvent,
    useFTCOffline,
    manualOfflineMode,
  });

  // Community updates state and functions
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

  const {
    communityUpdates,
    setCommunityUpdates,
    getCommunityUpdates,
    setLoadingCommunityUpdates,
  } = useCommunityUpdates({
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
  });

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
          eventStoreRef.current.getTeamList();
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

  const allianceConnectionsPrefetchSignature = useMemo(() => {
    if (!alliances?.alliances?.length) return "";
    const roster = alliances.alliances
      .map((a) => allianceRosterToConnectionKey(a) || "")
      .filter(Boolean)
      .sort()
      .join("|");
    return `${selectedEvent?.value?.code || ""}@${selectedYear?.value || ""}@${roster}`;
  }, [alliances?.alliances, selectedEvent?.value?.code, selectedYear?.value]);

  useEffect(() => {
    if (ftcMode !== false) {
      setAlliancePartnerConnectionsCache({});
      return;
    }
    const eventKey = getConnectionsEventKey(selectedEvent, selectedYear);
    if (!eventKey || !alliances?.alliances?.length || !allianceConnectionsPrefetchSignature) {
      setAlliancePartnerConnectionsCache({});
      return;
    }

    const unique = [];
    const seen = new Set();
    for (const a of alliances.alliances) {
      const key = allianceRosterToConnectionKey(a);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      unique.push({
        key,
        nums: key.split(",").map((n) => Number(n)),
      });
    }

    const initial = {};
    for (const { key } of unique) {
      initial[key] = { loading: true, data: null, error: null };
    }
    setAlliancePartnerConnectionsCache(initial);

    const ac = new AbortController();
    Promise.all(
      unique.map(async ({ key, nums }) => {
        try {
          const data = await fetchAllianceConnections(
            eventKey,
            nums,
            ac.signal
          );
          return { key, loading: false, data, error: null };
        } catch (e) {
          if (e?.name === "AbortError") return null;
          return { key, loading: false, data: null, error: e };
        }
      })
    ).then((results) => {
      if (ac.signal.aborted) return;
      setAlliancePartnerConnectionsCache((prev) => {
        const next = { ...prev };
        for (const r of results) {
          if (r) next[r.key] = r;
        }
        return next;
      });
    });

    return () => ac.abort();
    // allianceConnectionsPrefetchSignature encodes alliances.alliances rosters
  }, [allianceConnectionsPrefetchSignature, ftcMode]); // eslint-disable-line react-hooks/exhaustive-deps

  //functions to retrieve API data

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
      matchName: match?.matchName,
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
   * Remaps a string team identifier to its numeric team number (e.g., "TeamA" -> 9990)
   * @param {string} teamString The string team identifier
   * @returns {number} The numeric team number, or null if not found
   */
  const remapStringToNumber = useCallback((teamString) => {
    if (!teamRemappings) return Number(teamString);
    return Number(teamRemappings.strings[teamString]) || Number(teamString) || null;
  }, [teamRemappings]);

  /**
   * Remaps a numeric team number to its string identifier (e.g., 9990 -> "TeamA")
   * @param {number} teamNumber The numeric team number
   * @returns {string|number} The string team identifier, or the original number if not found
   */
  const remapNumberToString = useCallback((teamNumber) => {
    if (!teamRemappings) return teamNumber;
    return teamRemappings.numbers[teamNumber] || teamNumber || "";
  }, [teamRemappings]);

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

    /**
     * Returns the winner of the match
     * @function winner
     * @param {object} match - The match to test
     * @return an object containing the winning alliance, and in the event of a tie, the tiebreaker level.
     */
    function winner(match) {
      var winner = { winner: "", tieWinner: "", level: 0 };
      if (
        ftcMode &&
        (match?.redWins === true ||
          match?.blueWins === true ||
          match?.redWins === false ||
          match?.blueWins === false)
      ) {
        if (match?.redWins === true) winner.winner = "red";
        else if (match?.blueWins === true) winner.winner = "blue";
        else if (match?.redWins === false && match?.blueWins === false) {
          winner.winner = "tie";
        } else winner.winner = "TBD";
        return winner;
      }
      if (match?.redWins === true) {
        winner.winner = "red";
        return winner;
      }
      if (match?.blueWins === true) {
        winner.winner = "blue";
        return winner;
      }
      if (match?.redWins === false && match?.blueWins === false) {
        winner.winner = "tie";
        return winner;
      }
      if (!ftcMode) {
        const wa =
          match?.scores?.winningAlliance ??
          match?.winningAlliance ??
          match?.WinningAlliance;
        const r = match?.scoreRedFinal;
        const b = match?.scoreBlueFinal;
        const hasScores = r != null && b != null;
        const tieOnPoints = hasScores && Number(r) === Number(b);
        const committed =
          (match?.actualStartTime != null && match?.actualStartTime !== "") ||
          (match?.postResultTime != null && match?.postResultTime !== "");
        if (wa === 1 || wa === 2) {
          if (
            tieOnPoints ||
            (!hasScores && (committed || match?.scores))
          ) {
            winner.winner = wa === 1 ? "red" : "blue";
            return winner;
          }
        }
      }
      if (match?.scoreRedFinal != null || match?.scoreBlueFinal != null) {
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
            eventStoreRef.current.getTeamList(reducedTeamList);
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
          match.winner = winner(match);
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
      eventStoreRef.current.getAlliances();
    }
    eventStoreRef.current.getRanks();
    // System messages are fetched by callers (loadEvent, useInterval, nextMatch, etc.) to avoid double-fetch

    // Calculate event high scores after schedule is loaded
    getEventStats(selectedYear?.value, selectedEvent?.value?.code);
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
    // Get effective team number (with event prefix for demo teams 9970-9999, same as Offseason/playoff bye)
    const effectiveTeamNumber = await getEffectiveTeamNumber(
      teamNumber,
      selectedEvent?.value?.code,
      selectedEvent?.value?.tbaEventKey ?? null
    );
    var result = await httpClient.put(
      `team/${effectiveTeamNumber}/updates`,
      data,
      ftcMode ? ftcBaseURL : undefined
    );
    return result;
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
    // Skip sync if other network operations are in progress
    // Set pending flag so useEffect can retry when operations complete
    // @ts-ignore - operationsInProgress is a number from AuthClientContext
    if (operationsInProgress > 0) {
      console.log("Skipping sync - network operations in progress");
      pendingSyncRef.current = true;
      return;
    }

    // Clear pending flag since we're proceeding with sync
    pendingSyncRef.current = false;

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
      showChampsStatsAtDistrictRegional: showChampsStatsAtDistrictRegional,
      showBlueBanners: showBlueBanners,
      hidePracticeSchedule: hidePracticeSchedule,
      monthsWarning: monthsWarning,
      showInspection: showInspection,
      showWorldAndStatsOnAnnouncePlayByPlay: showWorldAndStatsOnAnnouncePlayByPlay,
      swapScreen: swapScreen,
      darkMode: darkMode,
      useOsTheme: useOsTheme,
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
      currentMatch: currentMatch,
      screenModeSyncFrequency: screenModeSyncFrequency
    }
    var result = await httpClient.put(`user/preferences`, userPrefs);
    // @ts-ignore
    if (result.status === 200 || result.status === 204) {
      // @ts-ignore
      return { status: "ok" };
    } else {
      return {
        status: "error",
        message: `**Error** ${result?.statusText || "unknown"}`,
      };
    }
  }

  const getSyncStatus = async () => {
    const result = await httpClient.get(`system/syncusers`);
    if (result.status === 200) {
      const syncResult = await result.json();
      return syncResult;
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
      clearAvatarCache();

      // Reset rankings/alliances state (store-owned)
      await eventStoreRef.current.resetRankingsAlliancesState(shouldPreserveOfflineData);

      // For OFFLINE events, preserve alliance-related settings only if reloading same event
      if (!shouldPreserveOfflineData) {
        await setTeamReduction(null);
        await setPlayoffCountOverride(null);
        setAllianceSelectionArrays({});
        setAllianceSelection(false);
      } else {
        console.log("Reloading same OFFLINE event - preserving alliance count and settings");
      }

      setCurrentMatch(1);
      setRegionalEventDetail(null);

      // Clear reserve overlays and station-order overrides for the event being loaded
      // so stale local edits from a previous session don't carry over.
      const eventCodeToLoad = selectedEvent?.value?.code;
      if (eventCodeToLoad) {
        const codeKey = String(eventCodeToLoad);
        if (playoffReserveEditsRef.current?.[codeKey]) {
          const nextReserve = Object.fromEntries(
            Object.entries(playoffReserveEditsRef.current).filter(([k]) => k !== codeKey)
          );
          playoffReserveEditsRef.current = nextReserve;
          setPlayoffReserveEdits(nextReserve);
        }
        if (playoffStationOrderEditsRef.current?.[codeKey]) {
          const nextStation = Object.fromEntries(
            Object.entries(playoffStationOrderEditsRef.current).filter(([k]) => k !== codeKey)
          );
          playoffStationOrderEditsRef.current = nextStation;
          setPlayoffStationOrderEdits(nextStation);
        }
      }
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
        const remappings = await eventStoreRef.current.fetchTeamRemappings(
          selectedEvent.value.tbaEventKey,
          selectedYear.value
        );
        await setTeamRemappings(remappings);
      } else {
        // Clear remappings for non-TBA events
        await setTeamRemappings(null);
      }

      eventStoreRef.current.getTeamList();
      await getSchedule(true);
      getSystemMessages();
      await getEventMessages();
      getWorldStats();
      if (ftcMode) {
        getFTCRegionHighScores();
        if (selectedEvent?.value?.leagueCode) {
          getFTCLeagueHighScores();
        } else {
          setFtcLeagueHighScores(null);
        }
      } else if (selectedEvent?.value?.districtCode) {
        getFrcDistrictHighScores();
      } else {
        setFrcDistrictHighScores(null);
      }
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

        // FTC: kickoff events are not competition events; omit from picker and type filters
        if (ftcMode) {
          result.events = _.filter(result?.events, (e) => {
            const type = String(
              _.get(e, "type") ?? _.get(e, "Type") ?? ""
            )
              .trim()
              .toUpperCase();
            const typeName = String(
              _.get(e, "typeName") ?? _.get(e, "TypeName") ?? ""
            )
              .trim()
              .toUpperCase();
            return type !== "12" && typeName !== "KICKOFF";
          });
        }

        var regionCodes = [];
        var types = [];
        const events = result?.events.map((e) => {
          var color = "";
          /** @type {null | 'offseasonAzure' | 'offseason'} */
          var eventMenuTint = null;
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
            eventMenuTint = "offseasonAzure";
            optionPrefix = "•• ";
            optionPostfix = " ••";
            filters.push("offseason");
          }
          if (e.type === "OffSeason" || e.type === "10") {
            color = paleYellow;
            eventMenuTint = "offseason";
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
            eventMenuTint: eventMenuTint,
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
    selectedEvent,
    ftcMode,
    useFourTeamAlliances,
    setAllianceCount,
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

  // Load FTC avatars composed CSS when in ftcMode (season+1 for next-season avatar styles)
  useEffect(() => {
    const linkId = "ftc-avatars-composed-css";
    if (!ftcMode || !selectedYear?.value) {
      const existing = document.getElementById(linkId);
      if (existing) existing.remove();
      return;
    }
    const seasonPlusOne = Number(selectedYear.value) + 1;
    const href = `https://ftc-scoring.firstinspires.org/avatars/composed/${seasonPlusOne}.css`;
    const existingLink = document.getElementById(linkId);
    if (existingLink) {
      if (existingLink.getAttribute("href") === href) return;
      existingLink.remove();
    }
    const linkEl = document.createElement("link");
    linkEl.id = linkId;
    linkEl.rel = "stylesheet";
    linkEl.href = href;
    document.head.appendChild(linkEl);
    return () => {
      const el = document.getElementById(linkId);
      if (el) el.remove();
    };
  }, [ftcMode, selectedYear?.value]);

  // Refresh team list when showBlueBanners is enabled to fetch blue banner data
  useEffect(() => {
    if (showBlueBanners === true && !ftcMode && selectedEvent && teamList?.teams?.length > 0 && isOnline) {
      console.log("Show Blue Banners enabled, refreshing team list to fetch blue banner data");
      eventStoreRef.current.getTeamList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBlueBanners]);

  // Refresh team list when local-event Champs stats are enabled so appearance data is loaded
  useEffect(() => {
    if (showChampsStatsAtDistrictRegional === true && !ftcMode && selectedEvent && teamList?.teams?.length > 0 && isOnline) {
      eventStoreRef.current.getTeamList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showChampsStatsAtDistrictRegional]);

  // Refresh when District Champs playoff stats are enabled (otherwise list was built without history)
  useEffect(() => {
    if (showDistrictChampsStats === true && !ftcMode && selectedEvent && teamList?.teams?.length > 0 && isOnline) {
      eventStoreRef.current.getTeamList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDistrictChampsStats]);

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
      // Practice events ship a large training team list but rankings only include teams on the synthetic schedule
      const isPracticeEvent = selectedEvent?.value?.code?.includes("PRACTICE");
      const expectedTeamCount = ftcMode
        ? actualCompetingTeamsCount
        : isPracticeEvent
          ? actualCompetingTeamsCount
          : teamList?.teamCountTotal - teamReduction;
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
    selectedEvent,
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

  // Update eventLabel when selectedEvent changes
  useEffect(() => {
    if (selectedEvent) {
      // Prefer label if available (formatted), otherwise use name
      const newLabel = selectedEvent.label || selectedEvent.value?.name;
      if (newLabel) {
        setEventLabel(newLabel);
      } else {
        // Clear eventLabel if selectedEvent has no name/label
        setEventLabel(null);
      }
    } else {
      // Clear eventLabel if selectedEvent is null
      setEventLabel(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEvent?.label, selectedEvent?.value?.name, selectedEvent?.value?.code]);

  // Track current state values in refs so Screen Mode sync can always read latest values
  // This prevents stale closure values when reading state in async callbacks
  const currentEventCodeRef = useRef(null);
  const currentMatchRef = useRef(null);

  // Update refs whenever state changes so we always have current values
  useEffect(() => {
    currentEventCodeRef.current = selectedEvent?.value?.code;
  }, [selectedEvent?.value?.code]);

  useEffect(() => {
    currentMatchRef.current = currentMatch;
  }, [currentMatch]);

  // Reset lastSyncedEventCodeRef when event changes manually (not from Screen Mode sync)
  // This ensures manual changes can be overridden by server
  useEffect(() => {
    if (screenMode && selectedEvent?.value?.code && !isScreenModeSyncRef.current) {
      // Event changed but not from Screen Mode sync - user manually changed it
      // Reset lastSyncedEventCodeRef so server can override it
      const currentCode = selectedEvent.value.code;
      if (lastSyncedEventCodeRef.current !== currentCode) {
        console.log(`Screen Mode: Detected manual event change to ${currentCode}, resetting lastSyncedEventCodeRef`);
        lastSyncedEventCodeRef.current = null; // Reset so server can override
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEvent?.value?.code, screenMode]);

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
      eventStoreRef.current.getRobotImages();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [httpClient, teamList?.lastUpdate]);


  // Timer to autmatically refresh event data
  // Runs at refreshRate (autoUpdate) or backgroundDataRefreshFrequency (background only); when both are on, uses the faster rate.
  const effectiveRefreshSeconds = (autoUpdate && backgroundDataRefresh)
    ? Math.min(refreshRate, backgroundDataRefreshFrequency)
    : (autoUpdate ? refreshRate : backgroundDataRefreshFrequency);
  const intervalDelayMs = (autoUpdate || backgroundDataRefresh) ? effectiveRefreshSeconds * 1000 : 999999;

  const { start, stop } = useInterval(
    () => {
      console.log("fetching event data now");
      const updateCurrentMatch = !backgroundDataRefresh;
      if (!selectedEvent?.value?.code.includes("OFFLINE")) {
        console.log("Online event. Getting schedule and ranks");
        if (!ftcMode && useCheesyArena) {
          getCheesyStatus();
        }
        getSchedule(undefined, { updateCurrentMatch });
      } else {
        console.log("Offline event. Just get the world stats if you can");
      }
      getSystemMessages();
      getEventMessages();
      getWorldStats();
      if (ftcMode) {
        getFTCRegionHighScores();
        if (selectedEvent?.value?.leagueCode) {
          getFTCLeagueHighScores();
        } else {
          setFtcLeagueHighScores(null);
        }
      } else if (selectedEvent?.value?.districtCode) {
        getFrcDistrictHighScores();
      }
    },
    intervalDelayMs,
    {
      autoStart: true,
      immediate: false,
      selfCorrecting: true,
      onFinish: () => {
        console.log("Event refresh stopped at App level.");
      },
    }
  );

  // Automatically keep event details up to date when autoUpdate or backgroundDataRefresh is on.
  useEffect(() => {
    if (autoUpdate || backgroundDataRefresh) {
      start();
    } else {
      stop();
    }
  }, [autoUpdate, backgroundDataRefresh, backgroundDataRefreshFrequency, start, stop]);

  // Track last event code we attempted to sync in Screen Mode
  // This prevents reloading the same event when React state hasn't updated yet
  const lastSyncedEventCodeRef = useRef(null);
  // Track if we're currently processing a Screen Mode sync to distinguish from manual changes
  const isScreenModeSyncRef = useRef(false);

  // Screen Mode: Function to fetch and process user preferences
  const fetchAndProcessUserPrefs = async () => {
    if (!screenMode || !isAuthenticated) {
      return;
    }

    // Skip refresh if other network operations are in progress
    // @ts-ignore - operationsInProgress is a number from AuthClientContext
    if (operationsInProgress > 0) {
      return;
    }

    try {
      const userPrefs = await getUserPrefs();

      // Check if response has error status
      if (userPrefs && userPrefs.status && userPrefs.status !== "ok" && userPrefs.status !== 200) {
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

      if (!isValidData) {
        // Explicitly set to false for malformed data
        setScreenModeStatus(false);
      } else {
        // Data is valid
        setScreenModeStatus(true);
      }

      if (isValidData && typeof userPrefs === 'object') {
        // In Screen Mode, compare server values to current client state to ensure we always apply server values
        // Read state values from refs (always current) to avoid stale closure values
        const currentMatchFromRef = currentMatchRef.current;

        if (userPrefs.selectedEvent !== undefined && userPrefs.selectedEvent !== null) {
          // Use ref value (always current) for accurate comparison
          const serverEventCode = userPrefs.selectedEvent?.value?.code;
          const lastSyncedCode = lastSyncedEventCodeRef.current;

          // Only update if server differs from what we last synced
          // This prevents reloading the same event when React state hasn't updated yet
          // Manual changes are handled by resetting lastSyncedEventCodeRef in the useEffect
          if (lastSyncedCode !== serverEventCode) {
            isScreenModeSyncRef.current = true; // Mark that this is a Screen Mode sync
            setSelectedEvent(userPrefs.selectedEvent);
            // Update ref immediately to prevent reloading on next sync
            lastSyncedEventCodeRef.current = serverEventCode;
            // Reset flag after a short delay to allow state update to complete
            setTimeout(() => {
              isScreenModeSyncRef.current = false;
            }, 100);
          }
        } else if (userPrefs.selectedEvent === null) {
          // Server wants to clear the event
          if (lastSyncedEventCodeRef.current !== null || selectedEvent !== null) {
            setSelectedEvent(null);
            lastSyncedEventCodeRef.current = null;
          }
        }
        // Only update selectedYear if server value differs from current client state
        if (userPrefs.selectedYear !== undefined) {
          const currentYear = selectedYear?.value;
          const serverYear = userPrefs.selectedYear?.value;
          if (currentYear !== serverYear) {
            setSelectedYear(userPrefs.selectedYear);
          }
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
        if (userPrefs.showChampsStatsAtDistrictRegional !== undefined && userPrefs.showChampsStatsAtDistrictRegional !== showChampsStatsAtDistrictRegional) {
          setShowChampsStatsAtDistrictRegional(userPrefs.showChampsStatsAtDistrictRegional);
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
        if (userPrefs.showWorldAndStatsOnAnnouncePlayByPlay !== undefined && userPrefs.showWorldAndStatsOnAnnouncePlayByPlay !== showWorldAndStatsOnAnnouncePlayByPlay) {
          setShowWorldAndStatsOnAnnouncePlayByPlay(userPrefs.showWorldAndStatsOnAnnouncePlayByPlay);
        }
        if (userPrefs.swapScreen !== undefined && userPrefs.swapScreen !== swapScreen) {
          setSwapScreen(userPrefs.swapScreen);
        }
        if (userPrefs.darkMode !== undefined && userPrefs.darkMode !== darkMode) {
          setDarkMode(userPrefs.darkMode);
        }
        if (userPrefs.useOsTheme !== undefined && userPrefs.useOsTheme !== useOsTheme) {
          setUseOsTheme(userPrefs.useOsTheme);
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
        if (userPrefs.screenModeSyncFrequency !== undefined && userPrefs.screenModeSyncFrequency !== screenModeSyncFrequency) {
          // Clamp value between 5 and 10
          const newFrequency = Math.max(5, Math.min(10, userPrefs.screenModeSyncFrequency));
          if (newFrequency !== screenModeSyncFrequency) {
            setScreenModeSyncFrequency(newFrequency);
            // Polling will restart automatically via useEffect when frequency changes
          }
        }
        // Only update currentMatch if server value differs from current client state
        // Use ref value (always current) for accurate comparison
        if (userPrefs.currentMatch !== undefined && userPrefs.currentMatch !== null) {
          // Compare against ref value (always current) not closure value (may be stale)
          if (currentMatchFromRef !== userPrefs.currentMatch) {
            setCurrentMatch(userPrefs.currentMatch);
          }
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

  // Screen Mode: Poll user preferences at configured frequency and update local state
  // Note: useInterval doesn't support dynamic intervals, so we'll recreate it when frequency changes
  const screenModePollIntervalRef = useRef(null);
  const startScreenModePoll = () => {
    if (screenModePollIntervalRef.current) {
      clearInterval(screenModePollIntervalRef.current);
    }
    const frequency = (screenModeSyncFrequency || 10) * 1000; // Convert seconds to milliseconds
    screenModePollIntervalRef.current = setInterval(() => {
      if (screenMode && isAuthenticated) {
        fetchAndProcessUserPrefs();
      }
    }, frequency);
  };
  const stopScreenModePoll = () => {
    if (screenModePollIntervalRef.current) {
      clearInterval(screenModePollIntervalRef.current);
      screenModePollIntervalRef.current = null;
    }
  };

  const screenModeInitializedRef = useRef(false);
  const previousScreenModeRef = useRef(screenMode);
  useEffect(() => {
    // Only reset status when screenMode changes from false to true (first enable)
    if (screenMode && isAuthenticated && !previousScreenModeRef.current) {
      // Ensure syncEvent is disabled when Screen Mode is enabled
      if (syncEvent) {
        console.log("Screen Mode enabled - disabling Sync Event");
        setSyncEvent(false);
      }
      setScreenModeStatus(null);
      screenModeInitializedRef.current = true;
      // Reset lastSyncedEventCodeRef when Screen Mode is first enabled
      lastSyncedEventCodeRef.current = null;
      // Fetch immediately when Screen Mode is enabled
      fetchAndProcessUserPrefs();
      startScreenModePoll();
    } else if (screenMode && isAuthenticated) {
      // Screen mode already enabled, ensure syncEvent is still disabled
      if (syncEvent) {
        console.log("Screen Mode active - disabling Sync Event");
        setSyncEvent(false);
      }
      // Screen mode already enabled, restart polling to pick up any frequency changes
      stopScreenModePoll();
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
  }, [screenMode, isAuthenticated, syncEvent, setSyncEvent, screenModeSyncFrequency]);

  // Restart polling when frequency changes (if Screen Mode is active)
  useEffect(() => {
    if (screenMode && isAuthenticated) {
      stopScreenModePoll();
      startScreenModePoll();
    }
    // Cleanup on unmount or when screenMode/frequency changes
    return () => {
      stopScreenModePoll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenModeSyncFrequency]);

  // Debounce putUserPrefs to prevent rapid successive calls
  const syncDebounceTimeoutRef = useRef(null);
  const pendingSyncRef = useRef(false);
  const debouncedPutUserPrefs = () => {
    // Clear any existing timeout
    if (syncDebounceTimeoutRef.current) {
      clearTimeout(syncDebounceTimeoutRef.current);
    }

    // Set pending flag
    pendingSyncRef.current = true;

    // Set new timeout
    syncDebounceTimeoutRef.current = setTimeout(() => {
      if (pendingSyncRef.current && syncEvent && isAuthenticated) {
        // Don't clear pendingSyncRef here - let putUserPrefs handle it
        // If it skips due to operations in progress, it will set pendingSyncRef to true
        putUserPrefs().catch((error) => {
          console.error("Error syncing user preferences:", error);
          pendingSyncRef.current = false; // Clear on error
        });
      }
    }, 1000); // 1 second debounce
  };

  // Sync user preferences when syncEvent is enabled
  const syncEventEnabledRef = useRef(false);
  const previousSyncEventRef = useRef(syncEvent);
  const initialSyncAttemptedRef = useRef(false);
  const isEventLoadingRef = useRef(false);
  useEffect(() => {
    if (syncEvent && isAuthenticated && !syncEventEnabledRef.current) {
      // Ensure screenMode is disabled when Sync Event is enabled
      if (screenMode) {
        console.log("Sync Event enabled - disabling Screen Mode");
        setScreenMode(false);
      }
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
      // Clear any pending syncs
      if (syncDebounceTimeoutRef.current) {
        clearTimeout(syncDebounceTimeoutRef.current);
        syncDebounceTimeoutRef.current = null;
      }
      pendingSyncRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncEvent, isAuthenticated, screenMode, setScreenMode]);

  // Retry pending sync when network operations complete
  useEffect(() => {
    // @ts-ignore - operationsInProgress is a number from AuthClientContext
    if (operationsInProgress === 0 && syncEvent && isAuthenticated) {
      // Retry pending sync if we have one
      if (pendingSyncRef.current) {
        console.log("Retrying sync - network operations completed");
        putUserPrefs().catch((error) => {
          console.error("Error syncing user preferences on retry:", error);
          pendingSyncRef.current = false; // Clear on error
        });
      }
      // Also check if we have a pending event sync that was waiting for operations to complete
      if (pendingEventSyncRef.current && !isEventLoadingRef.current) {
        console.log("Event sync pending - network operations completed, triggering sync");
        pendingEventSyncRef.current = false;
        debouncedPutUserPrefs();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operationsInProgress, syncEvent, isAuthenticated]);

  // Track when event is loading to skip syncing during transitions
  const previousEventCodeRef = useRef(selectedEvent?.value?.code);
  const pendingEventSyncRef = useRef(false);
  useEffect(() => {
    const currentEventCode = selectedEvent?.value?.code;
    if (currentEventCode !== previousEventCodeRef.current) {
      isEventLoadingRef.current = true;
      previousEventCodeRef.current = currentEventCode;
      // Mark that we need to sync after event loads (if syncEvent is enabled)
      if (syncEvent && isAuthenticated) {
        pendingEventSyncRef.current = true;
      }
      // Reset loading flag after a delay to allow event to finish loading
      setTimeout(() => {
        isEventLoadingRef.current = false;
        // If we have a pending event sync and no network operations, trigger sync
        if (pendingEventSyncRef.current && syncEvent && isAuthenticated) {
          // @ts-ignore - operationsInProgress is a number from AuthClientContext
          if (operationsInProgress === 0) {
            console.log("Event loading complete - triggering sync");
            pendingEventSyncRef.current = false;
            debouncedPutUserPrefs();
          }
        }
      }, 2000); // 2 seconds should be enough for event to load
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEvent?.value?.code, syncEvent, isAuthenticated]);

  // Sync user preferences when currentMatch changes (if syncEvent is enabled and user is authenticated)
  const previousMatchRef = useRef(currentMatch);
  useEffect(() => {
    if (syncEvent && isAuthenticated && currentMatch !== null && previousMatchRef.current !== currentMatch && previousMatchRef.current !== null && !isEventLoadingRef.current) {
      previousMatchRef.current = currentMatch;
      debouncedPutUserPrefs();
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
    showChampsStatsAtDistrictRegional,
    showBlueBanners,
    hidePracticeSchedule,
    monthsWarning,
    showInspection,
    swapScreen,
    darkMode,
    useOsTheme,
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
    screenModeSyncFrequency,
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
        showChampsStatsAtDistrictRegional,
        showBlueBanners,
        hidePracticeSchedule,
        monthsWarning,
        showInspection,
        swapScreen,
        darkMode,
        useOsTheme,
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
        screenModeSyncFrequency,
      };

      // Compare current preferences with previous (skip if syncEvent just changed or event is loading)
      // If event is loading, mark that we need to sync after it completes
      if (previousSyncEventRef.current === syncEvent && !_.isEqual(preferencesRef.current, currentPrefs)) {
        if (!isEventLoadingRef.current) {
          // Event not loading, sync immediately
          preferencesRef.current = currentPrefs;
          debouncedPutUserPrefs();
        } else {
          // Event is loading, mark for sync after loading completes
          console.log("Event is loading - marking for sync after load completes");
          pendingEventSyncRef.current = true;
          preferencesRef.current = currentPrefs;
        }
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
    showChampsStatsAtDistrictRegional,
    showBlueBanners,
    hidePracticeSchedule,
    monthsWarning,
    showInspection,
    swapScreen,
    darkMode,
    useOsTheme,
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
    screenModeSyncFrequency,
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

  // --- Team Data slice dependencies ---
  // Passed to EventStoreProvider → useTeamData hook

  // Narrow callback: when getTeamList finishes in the adHoc branch, request community updates
  const requestCommunityUpdatesForTeams = useCallback(
    (teams) => {
      getCommunityUpdates(false, teams.teams);
    },
    [getCommunityUpdates]
  );

  // Narrow callback: getTeamList patches selectedEvent for FTC alliance count
  const patchSelectedEvent = useCallback(
    (mutator) => {
      setSelectedEvent((prev) => {
        if (!prev) return prev;
        const patched = JSON.parse(JSON.stringify(prev));
        mutator(patched);
        // No-op guard: skip update if value didn't change
        if (JSON.stringify(patched) === JSON.stringify(prev)) return prev;
        return patched;
      });
    },
    [setSelectedEvent]
  );

  const teamDeps = {
    // State + setters
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
    // Narrow callbacks
    requestCommunityUpdatesForTeams,
    patchSelectedEvent,
  };

  // --- Rankings/Alliances slice dependencies ---
  // Passed to EventStoreProvider → useRankingsAlliances hook
  // NOTE: getEPA, getEPAFTC, getTeamList, getRegionalEventDetail are now provided
  // by the team slice via slice composition inside EventStoreProvider.
  const rankingsDeps = {
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
    setHaveChampsTeams,
    haveChampsTeams,
    // State + setters (owned by App.jsx, used by the hook)
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
  };

  // --- Match Navigation deps (passed to EventStoreProvider → useMatchNavigation) ---
  const matchNavDeps = {
    currentMatch,
    adHocMode,
    qualSchedule,
    playoffSchedule,
    practiceSchedule,
    offlinePlayoffSchedule,
    selectedEvent,
    ftcMode,
    setCurrentMatch,
    setAdHocMatch,
    getSchedule,
    getSystemMessages,
    getEventMessages,
    getWorldStats,
    getFrcDistrictHighScores,
  };

  // --- Event Data Context (read-mostly state) ---
  const eventDataValue = useMemo(
    () => ({
      selectedEvent,
      selectedYear,
      eventLabel,
      ftcMode,
      teamList,
      qualSchedule,
      playoffSchedule,
      practiceSchedule,
      offlinePlayoffSchedule,
      rankings,
      rankingsOverride,
      districtRankings,
      alliances,
      allianceCount,
      playoffs,
      communityUpdates,
      currentMatch,
      remapNumberToString,
      remapStringToNumber,
      EPA,
      robotImages,
      regionalEventDetail,
    }),
    [
      selectedEvent,
      selectedYear,
      eventLabel,
      ftcMode,
      teamList,
      qualSchedule,
      playoffSchedule,
      practiceSchedule,
      offlinePlayoffSchedule,
      rankings,
      rankingsOverride,
      districtRankings,
      alliances,
      allianceCount,
      playoffs,
      communityUpdates,
      currentMatch,
      remapNumberToString,
      remapStringToNumber,
      EPA,
      robotImages,
      regionalEventDetail,
    ]
  );

  // --- Event Actions (passed to EventStoreProvider for ref-stabilization) ---
  const eventActions = {
    setSelectedEvent,
    setSelectedYear,
    setFTCMode,
    loadEvent,
    getSchedule,
    getCommunityUpdates,
  };

  return (
    <div className="App">
      {isLoading ? (
        <div className="vertical-center">
          <Container>
            <Blocks visible height="200" width="" ariaLabel="blocks-loading" />
          </Container>
        </div>
      ) : (
        <EventStoreProvider data={eventDataValue} actions={eventActions} teamDeps={teamDeps} rankingsDeps={rankingsDeps} matchNavDeps={matchNavDeps} storeRef={eventStoreRef}>
            <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <LayoutsWithNavbar
                  eventHighScores={eventHighScores}
                  worldHighScores={worldStats}
                  allianceSelection={allianceSelection}
                  systemBell={systemBell}
                  systemMessage={systemMessage}
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
                    eventList={events}
                    eventFilters={eventFilters}
                    setEventFilters={setEventFilters}
                    regionFilters={regionFilters}
                    setRegionFilters={setRegionFilters}
                    districts={districts}
                    timeFilter={timeFilter}
                    setTimeFilter={setTimeFilter}
                    playoffCountOverride={playoffCountOverride}
                    setPlayoffCountOverride={setPlayoffCountOverride}
                    localUpdates={localUpdates}
                    setLocalUpdates={setLocalUpdates}
                    putTeamData={putTeamData}
                    user={user}
                    isAuthenticated={isAuthenticated}
                    adHocMode={adHocMode}
                    setAdHocMode={setAdHocMode}
                    supportedYears={supportedYears}
                    FTCSupportedYears={FTCSupportedYears}
                    reloadPage={reloadPage}
                    setLoadingCommunityUpdates={setLoadingCommunityUpdates}
                    systemMessage={systemMessage}
                    setTeamListLoading={setTeamListLoading}
                    setHaveChampsTeams={setHaveChampsTeams}
                    appUpdates={appUpdates}
                    setEventLabel={setEventLabel}
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
                    syncEvent={syncEvent}
                    setSyncEvent={setSyncEvent}
                    screenMode={screenMode}
                    setScreenMode={setScreenMode}
                    screenModeSyncFrequency={screenModeSyncFrequency}
                    setScreenModeSyncFrequency={setScreenModeSyncFrequency}
                    backgroundDataRefresh={backgroundDataRefresh}
                    setBackgroundDataRefresh={setBackgroundDataRefresh}
                    backgroundDataRefreshFrequency={backgroundDataRefreshFrequency}
                    setBackgroundDataRefreshFrequency={setBackgroundDataRefreshFrequency}
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                    useOsTheme={useOsTheme}
                    setUseOsTheme={setUseOsTheme}
                    appearanceDark={appearanceDark}
                  />
                }
              />

              <Route
                path="/schedule"
                element={
                  <SchedulePage
                    setPracticeSchedule={setPracticeSchedule}
                    setOfflinePlayoffSchedule={setOfflinePlayoffSchedule}
                    practiceFileUploaded={practiceFileUploaded}
                    setPracticeFileUploaded={setPracticeFileUploaded}
                    setTeamListLoading={setTeamListLoading}
                    playoffOnly={playoffOnly}
                    setPlayoffOnly={setPlayoffOnly}
                    champsStyle={champsStyle}
                    setChampsStyle={setChampsStyle}
                    setQualsLength={setQualsLength}
                    playoffCountOverride={playoffCountOverride}
                    setEventLabel={setEventLabel}
                    setPlayoffCountOverride={setPlayoffCountOverride}
                  />
                }
              />

              <Route
                path="/teamdata"
                element={
                  <TeamDataPage
                    teamSort={teamSort}
                    setTeamSort={setTeamSort}
                    setCommunityUpdates={setCommunityUpdates}
                    lastVisit={lastVisit}
                    setLastVisit={setLastVisit}
                    putTeamData={putTeamData}
                    localUpdates={localUpdates}
                    setLocalUpdates={setLocalUpdates}
                    originalAndSustaining={originalAndSustaining}
                    user={user}
                    isAuthenticated={isAuthenticated}
                    getTeamHistory={getTeamHistory}
                  />
                }
              />

              <Route
                path="/ranks"
                element={
                  <RanksPage
                    rankSort={rankSort}
                    setRankSort={setRankSort}
                    rankingsOverride={rankingsOverride}
                    setRankingsOverride={setRankingsOverride}
                    allianceSelection={allianceSelection}
                    setRankings={setRankings}
                    setAllianceSelectionArrays={setAllianceSelectionArrays}
                  />
                }
              />

              <Route
                path="/announce"
                element={
                    <AnnouncePage
                    worldStats={worldStats}
                    ftcRegionHighScores={ftcRegionHighScores}
                    ftcLeagueHighScores={ftcLeagueHighScores}
                    frcDistrictHighScores={frcDistrictHighScores}
                    districts={districts}
                    ftcLeagues={ftcLeagues}
                    setAlliances={setAlliances}
                    eventHighScores={eventHighScores}
                    backupTeam={backupTeam}
                    setBackupTeam={setBackupTeam}
                    eventNamesCY={eventNamesCY}
                    adHocMatch={adHocMatch}
                    setAdHocMatch={setAdHocMatch}
                    adHocMode={adHocMode}
                    qualsLength={qualsLength}
                    playoffOnly={playoffOnly}
                    playoffCountOverride={playoffCountOverride}
                    eventMessage={eventMessage}
                    eventBell={eventBell}
                    setEventBell={setEventBell}
                    alliancePartnerConnectionsCache={
                      alliancePartnerConnectionsCache
                    }
                    upsertPlayoffReserveOverlay={upsertPlayoffReserveOverlay}
                    removePlayoffReserveOverlay={removePlayoffReserveOverlay}
                    playoffReserveEdits={playoffReserveEdits}
                    playoffStationOrderEdits={playoffStationOrderEdits}
                    upsertPlayoffStationOrderOverlay={upsertPlayoffStationOrderOverlay}
                    removePlayoffStationOrderOverlay={removePlayoffStationOrderOverlay}
                  />
                }
              />

              <Route
                path="/playbyplay"
                element={
                  <PlayByPlayPage
                    worldStats={worldStats}
                    ftcRegionHighScores={ftcRegionHighScores}
                    ftcLeagueHighScores={ftcLeagueHighScores}
                    frcDistrictHighScores={frcDistrictHighScores}
                    districts={districts}
                    ftcLeagues={ftcLeagues}
                    eventNamesCY={eventNamesCY}
                    setAlliances={setAlliances}
                    eventHighScores={eventHighScores}
                    backupTeam={backupTeam}
                    setBackupTeam={setBackupTeam}
                    adHocMatch={adHocMatch}
                    setAdHocMatch={setAdHocMatch}
                    adHocMode={adHocMode}
                    qualsLength={qualsLength}
                    playoffOnly={playoffOnly}
                    playoffCountOverride={playoffCountOverride}
                    eventMessage={eventMessage}
                    eventBell={eventBell}
                    setEventBell={setEventBell}
                    upsertPlayoffReserveOverlay={upsertPlayoffReserveOverlay}
                    removePlayoffReserveOverlay={removePlayoffReserveOverlay}
                    playoffReserveEdits={playoffReserveEdits}
                    playoffStationOrderEdits={playoffStationOrderEdits}
                    upsertPlayoffStationOrderOverlay={upsertPlayoffStationOrderOverlay}
                    removePlayoffStationOrderOverlay={removePlayoffStationOrderOverlay}
                  />
                }
              />

              <Route
                path="/allianceselection"
                element={
                  <AllianceSelectionPage
                    allianceSelection={allianceSelection}
                    playoffs={playoffs}
                    allianceSelectionArrays={allianceSelectionArrays}
                    setAllianceSelectionArrays={setAllianceSelectionArrays}
                    rankingsOverride={rankingsOverride}
                    setOfflinePlayoffSchedule={setOfflinePlayoffSchedule}
                    qualsLength={qualsLength}
                    playoffOnly={playoffOnly}
                    playoffCountOverride={playoffCountOverride}
                  />
                }
              />

              <Route
                path="/awards"
                element={
                  <AwardsPage />
                }
              />

              <Route
                path="/stats"
                element={
                  <StatsPage
                    worldStats={worldStats}
                    eventHighScores={eventHighScores}
                    eventNamesCY={eventNamesCY}
                    districts={districts}
                    ftcRegionHighScores={ftcRegionHighScores}
                    ftcLeagueHighScores={ftcLeagueHighScores}
                    ftcLeagues={ftcLeagues}
                    frcDistrictHighScores={frcDistrictHighScores}
                  />
                }
              />

              <Route
                path="/cheatsheet"
                element={
                  <CheatsheetPage />
                }
              />

              <Route
                path="/emcee"
                element={
                  <EmceePage
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
        </EventStoreProvider>
      )}
    </div>
  );
}

export default App; // @ts-ignore
