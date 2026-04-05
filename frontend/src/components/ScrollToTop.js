import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls the window to the top on route changes, except when opening the
 * Contests page anchored to the leaderboard (Hero "View Leaderboard" link).
 */
function ScrollToTop() {
  const location = useLocation();

  useLayoutEffect(() => {
    const isContestLeaderboardDeepLink =
      (location.pathname === '/contests' && location.hash === '#contest-leaderboard') ||
      location.state?.scrollToContestLeaderboard === true;

    if (isContestLeaderboardDeepLink) return;

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [
    location.pathname,
    location.search,
    location.hash,
    location.key,
    location.state?.scrollToContestLeaderboard,
  ]);

  return null;
}

export default ScrollToTop;
