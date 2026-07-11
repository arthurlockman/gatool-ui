import { useEventSelection } from "../contexts/EventSelectionContext";

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
    qualScheduleAllFields,
    playoffSchedule,
    practiceSchedule,
    offlinePlayoffSchedule,
    firstGlobalMode,
    setCurrentMatch,
    setAdHocMatch,
    getSchedule,
    getSystemMessages,
    getEventMessages,
    getWorldStats,
    getFrcDistrictHighScores,
  } = deps;

  // Event selection comes from context now (Phase 8).
  const { selectedEvent, ftcMode } = useEventSelection();

  /**
   * For FIRST Global with fieldset filter, advance past qual matches not in the selected fieldset.
   * Returns the next valid match number, or null if no valid next match exists.
   */
  function nextFieldsetMatch(from) {
    const fieldset = selectedEvent?.value?.fieldset;
    const fieldsetIndex = selectedEvent?.value?.fieldsetIndex;
    if (!firstGlobalMode || !fieldset || fieldsetIndex === -1 || !qualScheduleAllFields) return from + 1;
    const allQuals = qualScheduleAllFields.schedule?.schedule ?? [];
    const playoffs = playoffSchedule?.schedule ?? [];
    const fullSchedule = [...allQuals, ...playoffs];
    let next = from + 1;
    while (next <= fullSchedule.length) {
      const match = fullSchedule[next - 1];
      const isPlayoff = match?.tournamentLevel?.toLowerCase() === "playoff" ||
        match?.tournamentLevel?.toLowerCase() === "finals";
      if (isPlayoff || !match?.fieldNumber || fieldset.includes(match.fieldNumber)) break;
      next++;
    }
    // If we walked past the end of the schedule, no valid next match exists
    return next <= fullSchedule.length ? next : null;
  }

  function prevFieldsetMatch(from) {
    const fieldset = selectedEvent?.value?.fieldset;
    const fieldsetIndex = selectedEvent?.value?.fieldsetIndex;
    if (!firstGlobalMode || !fieldset || fieldsetIndex === -1 || !qualScheduleAllFields) return from - 1;
    const allQuals = qualScheduleAllFields.schedule?.schedule ?? [];
    const playoffs = playoffSchedule?.schedule ?? [];
    const fullSchedule = [...allQuals, ...playoffs];
    let prev = from - 1;
    while (prev >= 1) {
      const match = fullSchedule[prev - 1];
      const isPlayoff = match?.tournamentLevel?.toLowerCase() === "playoff" ||
        match?.tournamentLevel?.toLowerCase() === "finals";
      if (isPlayoff || !match?.fieldNumber || fieldset.includes(match.fieldNumber)) break;
      prev--;
    }
    // If we walked before the start of the schedule, no valid previous match exists
    return prev >= 1 ? prev : null;
  }

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

      const totalQualCount = (firstGlobalMode && qualScheduleAllFields?.schedule?.schedule?.length) ||
        qualSchedule?.schedule?.length ||
        qualSchedule?.schedule?.schedule?.length;
      if (
        currentMatch <
        totalQualCount + playoffSchedule?.schedule?.length
      ) {
        const nextMatchNum = nextFieldsetMatch(currentMatch);
        if (nextMatchNum != null) {
          setCurrentMatch(nextMatchNum);
          if (!selectedEvent?.value?.code.includes("OFFLINE")) {
            getSchedule();
          }
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
        const prevMatchNum = prevFieldsetMatch(currentMatch);
        if (prevMatchNum != null) {
          if (practiceSchedule?.schedule?.length > 0) {
            setAdHocMatch(
              practiceSchedule?.schedule[currentMatch - 2]?.teams ||
              practiceSchedule?.schedule?.schedule?.teams
            );
          }
          setCurrentMatch(prevMatchNum);
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
