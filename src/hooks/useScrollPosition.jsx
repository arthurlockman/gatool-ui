import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook to manage scroll position for specific pages
 * @param {string} pageKey - Unique identifier for the page (e.g., 'schedule', 'teams', 'announce')
 * @param {boolean} shouldRememberScroll - Whether to remember scroll position (default: true)
 * @param {boolean} shouldScrollToTop - Whether to scroll to top when page loads (default: false)
 * @param {boolean} useScrollMemory - Global setting to enable/disable scroll memory (default: true)
 */
function useScrollPosition(pageKey, shouldRememberScroll = true, shouldScrollToTop = false, useScrollMemory = true) {
  const location = useLocation();
  const scrollPositionRef = useRef(0);
  const hasRestoredRef = useRef(false);
  const previousPathnameRef = useRef(location.pathname);

  // If scroll memory is disabled globally, don't remember scroll
  const effectiveShouldRememberScroll = useScrollMemory && shouldRememberScroll;

  // Save scroll position as user scrolls
  useEffect(() => {
    if (!effectiveShouldRememberScroll) return;

    const handleScroll = () => {
      scrollPositionRef.current = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [effectiveShouldRememberScroll]);

  // Save scroll position when navigating away from this page
  useEffect(() => {
    const previousPathname = previousPathnameRef.current;
    previousPathnameRef.current = location.pathname;

    // If we're leaving this page, save the scroll position
    if (previousPathname !== location.pathname && effectiveShouldRememberScroll) {
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
      // Use multiple attempts to ensure scroll happens
      window.scrollTo(0, 0);
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
      });
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 0);
      hasRestoredRef.current = true;
      return;
    }

    // Otherwise, restore scroll position if we should remember it
    if (effectiveShouldRememberScroll && !hasRestoredRef.current) {
      const savedPosition = sessionStorage.getItem(`scrollPosition_${pageKey}`);
      if (savedPosition) {
        const position = parseInt(savedPosition, 10);
        // Use multiple attempts to ensure scroll restoration happens after DOM is ready
        const restoreScroll = () => {
          window.scrollTo(0, position);
        };
        restoreScroll();
        requestAnimationFrame(restoreScroll);
        setTimeout(restoreScroll, 0);
        setTimeout(restoreScroll, 50);
        hasRestoredRef.current = true;
      } else {
        hasRestoredRef.current = true;
      }
    } else if (!effectiveShouldRememberScroll && !hasRestoredRef.current) {
      // If we shouldn't remember scroll, scroll to top
      window.scrollTo(0, 0);
      hasRestoredRef.current = true;
    }
  }, [location.pathname, pageKey, effectiveShouldRememberScroll, shouldScrollToTop]);

  // Save scroll position when component unmounts
  useEffect(() => {
    return () => {
      if (effectiveShouldRememberScroll) {
        sessionStorage.setItem(`scrollPosition_${pageKey}`, scrollPositionRef.current.toString());
      }
    };
  }, [pageKey, effectiveShouldRememberScroll]);
}

export default useScrollPosition;

