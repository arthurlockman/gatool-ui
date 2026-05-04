import { createContext, useContext } from "react";

const EventActionsContext = createContext();

export function EventActionsProvider({ value, children }) {
  return (
    <EventActionsContext.Provider value={value}>
      {children}
    </EventActionsContext.Provider>
  );
}

export function useEventActions() {
  const context = useContext(EventActionsContext);
  if (!context) {
    throw new Error(
      "useEventActions must be used within an EventActionsProvider"
    );
  }
  return context;
}
