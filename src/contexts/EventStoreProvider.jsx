import { useRef, useMemo } from "react";
import { EventDataProvider } from "./EventDataContext";
import { EventActionsProvider } from "./EventActionsContext";
import { useRankingsAlliances } from "../hooks/useRankingsAlliances";
import { useTeamData } from "../hooks/useTeamData";
import { useMatchNavigation } from "../hooks/useMatchNavigation";
import { useScheduleLoader } from "../hooks/useScheduleLoader";

/**
 * Request deduplication: prevents multiple in-flight fetches to the same logical endpoint.
 * Key should encode function name + all params that affect the result.
 * The Map is cleared on event change via clearInflight().
 */
function createInflightTracker() {
  const map = new Map();
  return {
    /**
     * If a fetch for `key` is already in-flight, return its promise.
     * Otherwise, run `fetchFn`, store its promise, and auto-clean on settle.
     */
    dedupe(key, fetchFn) {
      if (map.has(key)) return map.get(key);
      const promise = fetchFn().finally(() => map.delete(key));
      map.set(key, promise);
      return promise;
    },
    clear() {
      map.clear();
    },
    has(key) {
      return map.has(key);
    },
  };
}

/**
 * Creates an epoch-based stale-response guard.
 * Increment the epoch before starting a fetch; compare after the fetch resolves.
 * If epochs don't match, a newer fetch superseded this one — discard the result.
 */
function createEpochGuard() {
  let epoch = 0;
  return {
    next() {
      epoch += 1;
      return epoch;
    },
    isCurrent(token) {
      return token === epoch;
    },
    current() {
      return epoch;
    },
  };
}

/**
 * EventStoreProvider — wraps EventActionsProvider + EventDataProvider.
 *
 * Progressively absorbs state + fetch logic from App.jsx into domain-specific
 * hooks. Each hook is a "store slice" that owns its state, mutations, and
 * fetch functions. The provider merges all slices into the shared contexts.
 *
 * Current slices:
 * - useTeamData: team list, EPA, robot images, regional event detail, remappings
 * - useRankingsAlliances: rankings, alliances, districtRankings, playoffs
 * - useScheduleLoader: getSchedule (schedule fetching orchestrator)
 * - useMatchNavigation: nextMatch, previousMatch, setMatchFromMenu
 *
 * @param {object} props.data - Read-mostly event data from App.jsx (will shrink over time)
 * @param {object} props.actions - Action functions from App.jsx (will shrink over time)
 * @param {object} props.teamDeps - Dependencies for the team data slice
 * @param {object} props.rankingsDeps - Dependencies for the rankings/alliances slice
 * @param {object} props.scheduleDeps - Dependencies for the schedule loader slice
 * @param {React.MutableRefObject} props.storeRef - Ref that the provider populates with
 *   store-owned functions so App.jsx callers (getSchedule, loadEvent) can invoke them
 *   without being inside the provider tree.
 */
export function EventStoreProvider({ data, actions, teamDeps, rankingsDeps, scheduleDeps, matchNavDeps, storeRef, children }) {
  // --- Request deduplication (available to future slices) ---
  const inflightRef = useRef(createInflightTracker());
  const epochGuards = useRef({
    alliances: createEpochGuard(),
    teamList: createEpochGuard(),
    schedule: createEpochGuard(),
    rankings: createEpochGuard(),
  });

  // --- Team Data slice ---
  // The hook receives state + setters from App.jsx (via teamDeps) and returns
  // fetch functions. State ownership stays in App.jsx.
  const teamSlice = useTeamData(teamDeps, {
    epochGuard: epochGuards.current.teamList,
  });

  // --- Rankings & Alliances slice ---
  // Compose: team functions feed directly into rankings (no App.jsx roundtrip).
  const composedRankingsDeps = {
    ...rankingsDeps,
    getEPA: teamSlice.getEPA,
    getEPAFTC: teamSlice.getEPAFTC,
    getTeamList: teamSlice.getTeamList,
    getRegionalEventDetail: teamSlice.getRegionalEventDetail,
  };
  const rankingsSlice = useRankingsAlliances(composedRankingsDeps);

  // --- Schedule Loader slice ---
  // Compose: pass concrete store functions (getTeamList, getAlliances, getRanks)
  // so the hook doesn't need eventStoreRef.
  const composedScheduleDeps = {
    ...scheduleDeps,
    getTeamList: teamSlice.getTeamList,
    getAlliances: rankingsSlice.getAlliances,
    getRanks: rankingsSlice.getRanks,
  };
  const scheduleSlice = useScheduleLoader(composedScheduleDeps, {
    epochGuard: epochGuards.current.schedule,
  });

  // --- Match Navigation slice ---
  // Compose: override getSchedule with the store-owned version from scheduleSlice,
  // so matchNav calls the hook's getSchedule (not the now-deleted App.jsx one).
  const composedMatchNavDeps = {
    ...matchNavDeps,
    getSchedule: scheduleSlice.getSchedule,
  };
  const matchNavSlice = useMatchNavigation(composedMatchNavDeps);

  // --- Expose store-owned functions to App.jsx via ref ---
  // This allows App.jsx functions (getSchedule, loadEvent) that live above the
  // provider tree to call store-owned functions without being context consumers.
  if (storeRef) {
    storeRef.current = {
      // Team data slice
      getTeamList: teamSlice.getTeamList,
      getEPA: teamSlice.getEPA,
      getEPAFTC: teamSlice.getEPAFTC,
      getRobotImages: teamSlice.getRobotImages,
      getRegionalEventDetail: teamSlice.getRegionalEventDetail,
      fetchTeamRemappings: teamSlice.fetchTeamRemappings,
      resetTeamDataState: teamSlice.resetTeamDataState,
      // Rankings & alliances slice
      getRanks: rankingsSlice.getRanks,
      getAlliances: rankingsSlice.getAlliances,
      getDistrictRanks: rankingsSlice.getDistrictRanks,
      resetRankingsAlliancesState: rankingsSlice.resetRankingsAlliancesState,
      applyUserPrefs: rankingsSlice.applyUserPrefs,
      // Match navigation slice
      nextMatch: matchNavSlice.nextMatch,
      previousMatch: matchNavSlice.previousMatch,
      setMatchFromMenu: matchNavSlice.setMatchFromMenu,
      // Schedule loader slice
      getSchedule: scheduleSlice.getSchedule,
      // Infrastructure: reset dedup + epoch guards on event change
      resetInflight() {
        inflightRef.current.clear();
      },
    };
  }

  // --- Merge store-owned actions into the actions context value ---
  // Explicit surface: store actions extend App.jsx actions
  const allActions = {
    // App.jsx actions (will shrink as more slices are extracted)
    setSelectedEvent: actions.setSelectedEvent,
    setSelectedYear: actions.setSelectedYear,
    setFTCMode: actions.setFTCMode,
    loadEvent: actions.loadEvent,
    getCommunityUpdates: actions.getCommunityUpdates,
    // Store-owned: schedule loader slice
    getSchedule: scheduleSlice.getSchedule,
    // Store-owned: match navigation slice
    nextMatch: matchNavSlice.nextMatch,
    previousMatch: matchNavSlice.previousMatch,
    setMatchFromMenu: matchNavSlice.setMatchFromMenu,
    // Store-owned: team data slice
    getTeamList: teamSlice.getTeamList,
    getEPA: teamSlice.getEPA,
    getRobotImages: teamSlice.getRobotImages,
    fetchTeamRemappings: teamSlice.fetchTeamRemappings,
    // Store-owned: rankings & alliances slice
    getRanks: rankingsSlice.getRanks,
    getAlliances: rankingsSlice.getAlliances,
    getDistrictRanks: rankingsSlice.getDistrictRanks,
  };

  // --- Actions: ref-stabilized so the context value never changes ---
  const actionsRef = useRef({});
  actionsRef.current = allActions;

  const stableActions = useMemo(
    () =>
      Object.fromEntries(
        Object.keys(allActions).map((key) => [
          key,
          (...args) => actionsRef.current[key](...args),
        ])
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // Empty deps: stable wrappers never change
  );

  return (
    <EventActionsProvider value={stableActions}>
      <EventDataProvider value={data}>{children}</EventDataProvider>
    </EventActionsProvider>
  );
}

export { createInflightTracker, createEpochGuard };
