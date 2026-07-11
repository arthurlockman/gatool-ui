import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import SetupPage from "./SetupPage";

vi.mock("contexts/EventDataContext", () => ({ useEventData: vi.fn() }));
vi.mock("contexts/EventActionsContext", () => ({
  useEventActions: () => ({
    setSelectedEvent: vi.fn(),
    setSelectedYear: vi.fn(),
    setFTCMode: vi.fn(),
    getSchedule: vi.fn(),
    getCommunityUpdates: vi.fn(),
    getTeamList: vi.fn(),
    getAlliances: vi.fn(),
  }),
}));
vi.mock("../contexts/SettingsContext", () => ({
  useSettings: () => ({
    timeFormat: { value: "h:mm:ss a", label: "12hr" },
    setTimeFormat: vi.fn(),
    showSponsors: true,
    setShowSponsors: vi.fn(),
    autoHideSponsors: false,
    setAutoHideSponsors: vi.fn(),
    showAwards: true,
    setShowAwards: vi.fn(),
    showMinorAwards: true,
    setShowMinorAwards: vi.fn(),
    showNotes: true,
    setShowNotes: vi.fn(),
    showNotesAnnounce: true,
    setShowNotesAnnounce: vi.fn(),
    showMottoes: true,
    setShowMottoes: vi.fn(),
    showChampsStats: true,
    setShowChampsStats: vi.fn(),
    showDistrictChampsStats: true,
    setShowDistrictChampsStats: vi.fn(),
    showChampsStatsAtDistrictRegional: true,
    setShowChampsStatsAtDistrictRegional: vi.fn(),
    showBlueBanners: true,
    setShowBlueBanners: vi.fn(),
    hidePracticeSchedule: false,
    setHidePracticeSchedule: vi.fn(),
    monthsWarning: { value: "3", label: "3 months" },
    setMonthsWarning: vi.fn(),
    showInspection: true,
    setShowInspection: vi.fn(),
    showWorldAndStatsOnAnnouncePlayByPlay: false,
    setShowWorldAndStatsOnAnnouncePlayByPlay: vi.fn(),
    swapScreen: false,
    setSwapScreen: vi.fn(),
    autoAdvance: false,
    setAutoAdvance: vi.fn(),
    highScoreMode: false,
    setHighScoreMode: vi.fn(),
    autoUpdate: true,
    setAutoUpdate: vi.fn(),
    awardsMenu: { value: "3", label: "3 (current and two prior seasons)" },
    setAwardsMenu: vi.fn(),
    showQualsStats: true,
    setShowQualsStats: vi.fn(),
    showQualsStatsQuals: true,
    setShowQualsStatsQuals: vi.fn(),
    teamReduction: { value: 0, label: 0 },
    setTeamReduction: vi.fn(),
    reverseEmcee: false,
    setReverseEmcee: vi.fn(),
    useSwipe: false,
    setUseSwipe: vi.fn(),
    usePullDownToUpdate: false,
    setUsePullDownToUpdate: vi.fn(),
    useScrollMemory: false,
    setUseScrollMemory: vi.fn(),
    eventFilters: [],
    setEventFilters: vi.fn(),
    regionFilters: [],
    setRegionFilters: vi.fn(),
    timeFilter: { value: "all", label: "All Events" },
    setTimeFilter: vi.fn(),
    playoffCountOverride: null,
    setPlayoffCountOverride: vi.fn(),
    syncEvent: false,
    setSyncEvent: vi.fn(),
    screenMode: false,
    setScreenMode: vi.fn(),
    screenModeSyncFrequency: 30,
    setScreenModeSyncFrequency: vi.fn(),
    backgroundDataRefresh: true,
    setBackgroundDataRefresh: vi.fn(),
    backgroundDataRefreshFrequency: 60,
    setBackgroundDataRefreshFrequency: vi.fn(),
    nonStandardPlayoffs: false,
    setNonStandardPlayoffs: vi.fn(),
  }),
}));
vi.mock("../contextProviders/OnlineContext", () => ({
  useOnlineStatus: vi.fn(() => true),
}));
vi.mock("react-device-detect", () => ({
  isSafari: false,
  isChrome: true,
  fullBrowserVersion: "120.0.0.0",
  browserVersion: "120",
  isIOS: false,
  browserName: "Chrome",
  isDesktop: true,
  isTablet: false,
  isMobile: false,
}));
vi.mock("components/NotificationBanner", () => ({ default: () => null }));
vi.mock("components/LoginButton", () => ({ default: () => null }));
vi.mock("components/LogoutButton", () => ({ default: () => null }));
vi.mock("components/ContentEditable", () => ({ default: () => null }));

import { useEventData } from "contexts/EventDataContext";
import { useOnlineStatus } from "../contextProviders/OnlineContext";

function setupProps(overrides = {}) {
  return {
    eventList: [{ value: { code: "NYTR", name: "Test Event" }, label: "Test Event", filters: [] }],
    districts: [],
    localUpdates: [],
    setLocalUpdates: vi.fn(),
    putTeamData: vi.fn(),
    user: null,
    isAuthenticated: false,
    adHocMode: false,
    setAdHocMode: vi.fn(),
    supportedYears: [{ value: "2026", label: "2026" }],
    FTCSupportedYears: [{ value: "2026", label: "2026" }],
    FGSupportedYears: [{ value: "2026", label: "2026" }],
    reloadPage: vi.fn(),
    setLoadingCommunityUpdates: vi.fn(),
    systemMessage: null,
    setTeamListLoading: vi.fn(),
    setHaveChampsTeams: vi.fn(),
    appUpdates: [],
    setEventLabel: vi.fn(),
    systemBell: false,
    setSystemBell: vi.fn(),
    eventBell: false,
    setEventBell: vi.fn(),
    eventMessage: [],
    setEventMessage: vi.fn(),
    putEventNotifications: vi.fn(),
    useCheesyArena: false,
    setUseCheesyArena: vi.fn(),
    useFourTeamAlliances: false,
    setUseFourTeamAlliances: vi.fn(),
    ftcLeagues: [],
    ftcRegions: [],
    ftcTypes: [],
    useFTCOffline: false,
    setUseFTCOffline: vi.fn(),
    FTCServerURL: "",
    setFTCServerURL: vi.fn(),
    FTCKey: "",
    requestFTCKey: vi.fn(),
    checkFTCKey: vi.fn(),
    FTCOfflineAvailable: false,
    getFTCOfflineStatus: vi.fn(),
    getCheesyStatus: vi.fn(),
    manualOfflineMode: false,
    setManualOfflineMode: vi.fn(),
    darkMode: false,
    setDarkMode: vi.fn(),
    useOsTheme: false,
    setUseOsTheme: vi.fn(),
    appearanceDark: false,
    ...overrides,
  };
}

function setupMocks(overrides = {}) {
  useEventData.mockReturnValue({
    selectedEvent: null,
    selectedYear: { value: "2026", label: "2026" },
    eventLabel: "",
    ftcMode: false,
    teamList: null,
    qualSchedule: null,
    playoffSchedule: null,
    rankings: null,
    alliances: null,
    allianceCount: null,
    ...overrides,
  });
}

describe("SetupPage", () => {
  beforeEach(() => {
    setupMocks();
    vi.mocked(useOnlineStatus).mockReturnValue(true);
  });

  it("prompts the user to select a program when ftcMode is null", () => {
    setupMocks({ ftcMode: null, selectedYear: null });
    render(<SetupPage {...setupProps()} />);
    expect(screen.getByText(/please select a program/i)).toBeInTheDocument();
  });

  it("prompts the user to select a season when program is chosen but year is not", () => {
    setupMocks({ ftcMode: false, selectedYear: null });
    render(<SetupPage {...setupProps()} />);
    expect(screen.getByText(/please select a season/i)).toBeInTheDocument();
  });

  it("renders program and year selectors", () => {
    render(<SetupPage {...setupProps()} />);
    expect(screen.getByText(/choose a program/i)).toBeInTheDocument();
    expect(screen.getByText(/choose a year/i)).toBeInTheDocument();
    expect(screen.getByText(/then choose an event/i)).toBeInTheDocument();
  });

  it("shows an offline warning when the browser is offline", () => {
    vi.mocked(useOnlineStatus).mockReturnValue(false);
    render(<SetupPage {...setupProps()} />);
    expect(screen.getByText(/you're offline/i)).toBeInTheDocument();
  });
});
