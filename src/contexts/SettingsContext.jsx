import { createContext, useContext, useMemo } from "react";
import { usePersistentState } from "../hooks/UsePersistentState";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  // Display preferences
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
  const [showChampsStatsAtDistrictRegional, setShowChampsStatsAtDistrictRegional] =
    usePersistentState("setting:showChampsStatsAtDistrictRegional", null);
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
  const [showWorldAndStatsOnAnnouncePlayByPlay, setShowWorldAndStatsOnAnnouncePlayByPlay] = usePersistentState(
    "setting:showWorldAndStatsOnAnnouncePlayByPlay",
    true
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
  const [teamReduction, setTeamReduction] = usePersistentState(
    "setting:teamReduction",
    0
  );
  const [reverseEmcee, setReverseEmcee] = usePersistentState(
    "setting:reverseEmcee",
    null
  );

  // UX preferences
  const [useSwipe, setUseSwipe] = usePersistentState("cache:useSwipe", false);
  const [usePullDownToUpdate, setUsePullDownToUpdate] = usePersistentState(
    "setting:usePullDownToUpdate",
    false
  );
  const [useScrollMemory, setUseScrollMemory] = usePersistentState(
    "setting:useScrollMemory",
    true
  );
  const [useFourTeamAlliances, setUseFourTeamAlliances] = usePersistentState(
    "setting:useFourTeamAlliances",
    null
  );

  const value = useMemo(() => ({
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
    useSwipe, setUseSwipe,
    usePullDownToUpdate, setUsePullDownToUpdate,
    useScrollMemory, setUseScrollMemory,
    useFourTeamAlliances, setUseFourTeamAlliances,
  }), [
    timeFormat, showSponsors, autoHideSponsors, showAwards, showMinorAwards,
    showNotes, showNotesAnnounce, showMottoes, showChampsStats,
    showDistrictChampsStats, showChampsStatsAtDistrictRegional, showBlueBanners,
    hidePracticeSchedule, monthsWarning, showInspection,
    showWorldAndStatsOnAnnouncePlayByPlay, swapScreen, autoAdvance,
    highScoreMode, autoUpdate, awardsMenu, showQualsStats, showQualsStatsQuals,
    teamReduction, reverseEmcee, useSwipe, usePullDownToUpdate, useScrollMemory,
    useFourTeamAlliances,
    // Setters are stable (from useState) — no need to include them, but including for safety
    setTimeFormat, setShowSponsors, setAutoHideSponsors, setShowAwards, setShowMinorAwards,
    setShowNotes, setShowNotesAnnounce, setShowMottoes, setShowChampsStats,
    setShowDistrictChampsStats, setShowChampsStatsAtDistrictRegional, setShowBlueBanners,
    setHidePracticeSchedule, setMonthsWarning, setShowInspection,
    setShowWorldAndStatsOnAnnouncePlayByPlay, setSwapScreen, setAutoAdvance,
    setHighScoreMode, setAutoUpdate, setAwardsMenu, setShowQualsStats, setShowQualsStatsQuals,
    setTeamReduction, setReverseEmcee, setUseSwipe, setUsePullDownToUpdate, setUseScrollMemory,
    setUseFourTeamAlliances,
  ]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
