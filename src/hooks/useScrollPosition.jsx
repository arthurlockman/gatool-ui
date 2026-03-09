import { useEffect, useRef, useContext } from 'react';
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

  const getScrollElement = () => scrollContainerRef?.current ?? null;

  const getScrollTop = () => {
    const el = getScrollElement();
    return el ? el.scrollTop : window.scrollY;
  };

  const setScrollTop = (value) => {
    const el = getScrollElement();
    if (el) el.scrollTo(0, value);
    else window.scrollTo(0, value);
  };

  // Save scroll position as user scrolls
  useEffect(() => {
    if (!effectiveShouldRememberScroll) return;

    const el = getScrollElement();
    const handleScroll = () => {
      scrollPositionRef.current = getScrollTop();
    };

    if (el) {
      el.addEventListener('scroll', handleScroll, { passive: true });
      return () => el.removeEventListener('scroll', handleScroll);
    } else {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [effectiveShouldRememberScroll]);

  // Save scroll position when navigating away from this page
  useEffect(() => {
    const previousPathname = previousPathnameRef.current;
    previousPathnameRef.current = location.pathname;

    // If we're leaving this page, save the scroll position
    if (previousPathname !== location.pathname && effectiveShouldRememberScroll) {
      scrollPositionRef.current = getScrollTop();
      sessionStorage.setItem(`scrollPosition_${pageKey}`, scrollPositionRef.current.toString());
    }
  }, [location.pathname, pageKey, effectiveShouldRememberScroll]);

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
  }, [location.pathname, pageKey, effectiveShouldRememberScroll, shouldScrollToTop]);

  // Save scroll position when component unmounts
  useEffect(() => {
    return () => {
      if (effectiveShouldRememberScroll) {
        scrollPositionRef.current = getScrollTop();
        sessionStorage.setItem(`scrollPosition_${pageKey}`, scrollPositionRef.current.toString());
      }
    };
  }, [pageKey, effectiveShouldRememberScroll]);
}

export default useScrollPosition;
