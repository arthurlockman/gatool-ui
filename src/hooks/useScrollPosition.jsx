import { useEffect, useRef, useContext, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { ScrollContainerContext } from '../contextProviders/ScrollContainerContext';

/**
 * Custom hook to manage scroll position for specific pages.
 * Uses the main scroll container (between top and bottom bars) when available,
 * otherwise falls back to window.
 * @param {string} pageKey - Unique identifier for the page (e.g., 'schedule', 'teams', 'announce')
 * @param {boolean} shouldRememberScroll - Whether to remember scroll position (default: true)
 * @param {boolean} shouldScrollToTop - Whether to scroll to top when page loads (default: false)
 * @param {boolean} useScrollMemory - Global setting to enable/disable scroll memory (default: true)
 */
function useScrollPosition(pageKey, shouldRememberScroll = true, shouldScrollToTop = false, useScrollMemory = true) {
  const location = useLocation();
  const scrollContainerRef = useContext(ScrollContainerContext);
  const scrollPositionRef = useRef(0);
  const hasRestoredRef = useRef(false);
  const previousPathnameRef = useRef(location.pathname);

  // If scroll memory is disabled globally, don't remember scroll
  const effectiveShouldRememberScroll = useScrollMemory && shouldRememberScroll;

  const getScrollTop = useCallback(() => {
    const el = scrollContainerRef?.current ?? null;
    return el ? el.scrollTop : window.scrollY;
  }, [scrollContainerRef]);

  const setScrollTop = useCallback((value) => {
    const el = scrollContainerRef?.current ?? null;
    if (el) el.scrollTo(0, value);
    else window.scrollTo(0, value);
  }, [scrollContainerRef]);

  // Save scroll position as user scrolls so it's correct when navigating away
  // (saving only on navigate/unmount fails because the new page scrolls to top before we save)
  useEffect(() => {
    if (!effectiveShouldRememberScroll) return;

    const el = scrollContainerRef?.current ?? null;
    let rafId = null;
    const handleScroll = () => {
      const top = getScrollTop();
      scrollPositionRef.current = top;
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        sessionStorage.setItem(`scrollPosition_${pageKey}`, String(top));
        rafId = null;
      });
    };

    if (el) {
      el.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        if (rafId !== null) cancelAnimationFrame(rafId);
        el.removeEventListener('scroll', handleScroll);
      };
    } else {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        if (rafId !== null) cancelAnimationFrame(rafId);
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [effectiveShouldRememberScroll, getScrollTop, scrollContainerRef, pageKey]);

  // Keep previousPathnameRef in sync for restore logic
  useEffect(() => {
    previousPathnameRef.current = location.pathname;
  }, [location.pathname]);

  // Restore scroll position on mount or when shouldScrollToTop changes
  useEffect(() => {
    // Reset restoration flag when pathname changes
    if (previousPathnameRef.current !== location.pathname) {
      hasRestoredRef.current = false;
    }

    // If we should scroll to top, do it immediately
    if (shouldScrollToTop && !hasRestoredRef.current) {
      const scrollToTop = () => setScrollTop(0);
      scrollToTop();
      requestAnimationFrame(scrollToTop);
      setTimeout(scrollToTop, 0);
      hasRestoredRef.current = true;
      return;
    }

    // Otherwise, restore scroll position if we should remember it
    if (effectiveShouldRememberScroll && !hasRestoredRef.current) {
      const savedPosition = sessionStorage.getItem(`scrollPosition_${pageKey}`);
      if (savedPosition) {
        const position = parseInt(savedPosition, 10);
        const restoreScroll = () => setScrollTop(position);
        restoreScroll();
        requestAnimationFrame(restoreScroll);
        setTimeout(restoreScroll, 0);
        setTimeout(restoreScroll, 50);
        hasRestoredRef.current = true;
      } else {
        hasRestoredRef.current = true;
      }
    } else if (!effectiveShouldRememberScroll && !hasRestoredRef.current) {
      setScrollTop(0);
      hasRestoredRef.current = true;
    }
  }, [location.pathname, pageKey, effectiveShouldRememberScroll, shouldScrollToTop, setScrollTop]);

  // Save scroll position when component unmounts (use ref value; getScrollTop() would be 0 after new page scrolls)
  useEffect(() => {
    return () => {
      if (effectiveShouldRememberScroll) {
        sessionStorage.setItem(`scrollPosition_${pageKey}`, String(scrollPositionRef.current));
      }
    };
  }, [pageKey, effectiveShouldRememberScroll]);
}

export default useScrollPosition;
