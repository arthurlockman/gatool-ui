import { createContext, useContext, useCallback } from "react";

/**
 * Ref to the main scrollable content area (the div between top nav and bottom bar).
 * When present, scroll position and scroll-to-top should use this element instead of window.
 */
export const ScrollContainerContext = createContext({ current: null });

/**
 * Returns a function that scrolls the main content area to top.
 * Use this instead of window.scrollTo(0, 0) so the correct element is scrolled.
 */
export function useScrollToTop() {
  const scrollContainerRef = useContext(ScrollContainerContext);
  return useCallback(() => {
    const el = scrollContainerRef?.current;
    if (el) el.scrollTo(0, 0);
    else window.scrollTo(0, 0);
  }, [scrollContainerRef]);
}
