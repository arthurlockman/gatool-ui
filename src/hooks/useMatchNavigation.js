/**
 * useMatchNavigation — match navigation logic extracted from App.jsx.
 *
 * Owns: nextMatch, previousMatch, setMatchFromMenu
 * State ownership: remains in App.jsx (currentMatch, adHocMatch, adHocMode, etc.)
 *
 * @param {object} deps
 * @param {number|null} deps.currentMatch - Currently displayed match number
 * @param {*} deps.adHocMode - Whether in ad-hoc/test match mode
 * @param {object} deps.qualSchedule - Qualification match schedule
 * @param {object} deps.playoffSchedule - Playoff match schedule
 * @param {object} deps.practiceSchedule - Practice match schedule
 * @param {object} deps.offlinePlayoffSchedule - Offline-generated playoff schedule
 * @param {object} deps.selectedEvent - Currently loaded event
 * @param {*} deps.ftcMode - FRC/FTC mode indicator
 * @param {Function} deps.setCurrentMatch - Setter for currentMatch
 * @param {Function} deps.setAdHocMatch - Setter for adHocMatch teams
 * @param {Function} deps.getSchedule - Schedule refresh (stays in App.jsx)
 * @param {Function} deps.getSystemMessages - From useNotifications
 * @param {Function} deps.getEventMessages - From useNotifications
 * @param {Function} deps.getWorldStats - From useHighScores
 * @param {Function} deps.getFrcDistrictHighScores - From useHighScores
 */
export function useMatchNavigation(deps) {
  const {
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
  } = deps;

  /**
   * Advances to the next match. Refreshes scores, ranks and world stats when appropriate.
   *
   * NOTE: The two `if` blocks below are intentionally NOT `else if` — both can execute.
   * This is preserved from the original App.jsx behavior.
   *
   * NOTE: The OFFLINE guard uses `code.includes("OFFLINE")` (not `name`). This differs
   * from setMatchFromMenu which uses `name.includes("OFFLINE")`. Preserved as-is.
   */
  function nextMatch() {
    if (currentMatch == null) return;
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
      if (!ftcMode && selectedEvent?.value?.districtCode) getFrcDistrictHighScores();
    }
  }

  /**
   * Navigates to the previous match. Refreshes scores, ranks and world stats when appropriate.
   *
   * NOTE: The OFFLINE guard uses `code.includes("OFFLINE")` (same as nextMatch).
   */
  function previousMatch() {
    if (currentMatch == null) return;
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
        if (!ftcMode && selectedEvent?.value?.districtCode) getFrcDistrictHighScores();
      }
    }
  }

  /**
   * Sets the current match from the match dropdown. Refreshes scores, ranks,
   * and world stats as appropriate.
   *
   * NOTE: The OFFLINE guard uses `name.includes("OFFLINE")` (not `code`). This differs
   * from nextMatch/previousMatch. Preserved as-is from original behavior.
   *
   * @param {object} e - Menu select event with `.value` as match number
   */
  function setMatchFromMenu(e) {
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
      if (!ftcMode && selectedEvent?.value?.districtCode) getFrcDistrictHighScores();
    }
  }

  return {
    nextMatch,
    previousMatch,
    setMatchFromMenu,
  };
}
