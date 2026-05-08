import { createContext, useContext, useMemo } from "react";
import { usePersistentState } from "../hooks/UsePersistentState";

const EventSelectionContext = createContext(null);

/**
 * EventSelectionContext holds the "what is the app currently viewing" state:
 * - selectedEvent, selectedYear: the event/season in focus
 * - ftcMode: whether we're in FTC or FRC mode (changes entire app orientation)
 *
 * These values change on every event/mode switch, so they are isolated from
 * the rarely-changing user preferences in SettingsContext to keep re-render
 * scope tight.
 *
 * Persistent storage keys are preserved verbatim from App.jsx so existing
 * user state is not lost on migration.
 */
export function EventSelectionProvider({ children }) {
  const [selectedEvent, setSelectedEvent] = usePersistentState(
    "setting:selectedEvent",
    null
  );
  const [selectedYear, setSelectedYear] = usePersistentState(
    "setting:selectedYear",
    null
  );
  const [ftcMode, setFTCMode] = usePersistentState("setting:ftcMode", null);

  const value = useMemo(
    () => ({
      selectedEvent,
      setSelectedEvent,
      selectedYear,
      setSelectedYear,
      ftcMode,
      setFTCMode,
    }),
    [
      selectedEvent,
      selectedYear,
      ftcMode,
      setSelectedEvent,
      setSelectedYear,
      setFTCMode,
    ]
  );

  return (
    <EventSelectionContext.Provider value={value}>
      {children}
    </EventSelectionContext.Provider>
  );
}

export function useEventSelection() {
  const ctx = useContext(EventSelectionContext);
  if (!ctx) {
    throw new Error(
      "useEventSelection must be used within an EventSelectionProvider"
    );
  }
  return ctx;
}
