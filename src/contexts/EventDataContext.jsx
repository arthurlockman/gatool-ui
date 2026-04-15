import { createContext, useContext } from "react";

const EventDataContext = createContext();

export function EventDataProvider({ value, children }) {
  return (
    <EventDataContext.Provider value={value}>
      {children}
    </EventDataContext.Provider>
  );
}

export function useEventData() {
  const context = useContext(EventDataContext);
  if (!context) {
    throw new Error("useEventData must be used within an EventDataProvider");
  }
  return context;
}
