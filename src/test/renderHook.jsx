// renderHook wrapper that injects the minimum context tree gatool hooks need:
// - EventSelectionProvider (selectedEvent, selectedYear, ftcMode)
//
// Hooks accept `httpClient` and most other deps via their `deps` argument
// (see useEventListLoader, useScheduleLoader, etc.), so we inject those
// directly into the hook call instead of via a context. Use
// `createTestHttpClient()` to build one that talks to the MSW server.
//
// Usage:
//   const { result, rerender } = renderHookWithProviders(
//     () => useEventListLoader({ httpClient, ...deps }),
//     { selectedYear: { value: "2026", label: "2026" } }
//   );
import { renderHook } from "@testing-library/react";
import { EventSelectionProvider } from "../contexts/EventSelectionContext";

// usePersistentState writes via localforage which works in jsdom but is
// async. To keep tests deterministic and synchronous we provide an explicit
// override mechanism: tests can pre-seed the EventSelection by setting
// localStorage keys before mounting (usePersistentState falls back to
// in-memory state on the first render anyway, so this is mostly defensive).
//
// Most hook tests don't actually depend on EventSelection at runtime — they
// pass selectedYear/selectedEvent through the deps arg — so the provider is
// here purely so `useEventSelection()` doesn't throw.
function DefaultWrapper({ children }) {
  return <EventSelectionProvider>{children}</EventSelectionProvider>;
}

export function renderHookWithProviders(callback, options = {}) {
  const { wrapper: customWrapper, ...rest } = options;
  const Wrapper = customWrapper || DefaultWrapper;
  return renderHook(callback, { wrapper: Wrapper, ...rest });
}

export { renderHook } from "@testing-library/react";
