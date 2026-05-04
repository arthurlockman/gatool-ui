// Default MSW handlers for the gatool-api endpoints exercised by hooks.
//
// Each handler reads a committed fixture (src/test/fixtures/*.json) and
// returns it. Per-test handlers can override these via `server.use(...)` to
// simulate errors, empty responses, or shape variants.
//
// Slug convention (matches scripts/capture-fixtures.sh):
//   <year>-events                        2026/events
//   <year>-offseason-events              2026/offseason/events/
//   <year>-<event>-schedule-<level>      2026/schedule/hybrid/MAWOR/qual
//   <year>-<event>-scores-<level>        2026/scores/MAWOR/qual
//   <year>-<event>-teams                 2026/teams?eventCode=MAWOR
//   <year>-<event>-rankings              2026/rankings/MAWOR
//   <year>-<event>-alliances             2026/alliances/MAWOR
//   <year>-<event>-awards                2026/awards/event/MAWOR
//   <year>-<event>-community-updates     2026/communityUpdates/MAWOR
//   <year>-highscores                    2026/highscores
//   <year>-team-<n>                      2026/teams?teamNumber=190
//   team-<n>-updates                     team/190/updates
//   announcements                        announcements
import { http, HttpResponse } from "msw";
import { loadFixture, fixtureExists } from "./fixtures";

const BASE = "https://api.gatool.org/v3";

const fixtureOr404 = (slug) => () => {
  if (!fixtureExists(slug)) {
    return new HttpResponse(null, { status: 404 });
  }
  return HttpResponse.json(loadFixture(slug));
};

export const defaultHandlers = [
  // Event lists
  http.get(`${BASE}/:year/events`, ({ params }) =>
    fixtureOr404(`${params.year}-events`)()
  ),
  http.get(`${BASE}/:year/offseason/events/`, ({ params }) =>
    fixtureOr404(`${params.year}-offseason-events`)()
  ),

  // Schedules
  http.get(`${BASE}/:year/schedule/hybrid/:event/:level`, ({ params }) =>
    fixtureOr404(`${params.year}-${params.event}-schedule-${params.level}`)()
  ),
  http.get(`${BASE}/:year/scores/:event/:level`, ({ params }) =>
    fixtureOr404(`${params.year}-${params.event}-scores-${params.level}`)()
  ),

  // Teams (?eventCode= for event roster, ?teamNumber= for single team)
  http.get(`${BASE}/:year/teams`, ({ params, request }) => {
    const url = new URL(request.url);
    const eventCode = url.searchParams.get("eventCode");
    const teamNumber = url.searchParams.get("teamNumber");
    if (eventCode) {
      return fixtureOr404(`${params.year}-${eventCode}-teams`)();
    }
    if (teamNumber) {
      return fixtureOr404(`${params.year}-team-${teamNumber}`)();
    }
    return new HttpResponse(null, { status: 400 });
  }),

  // Rankings / alliances / awards / community updates
  http.get(`${BASE}/:year/rankings/:event`, ({ params }) =>
    fixtureOr404(`${params.year}-${params.event}-rankings`)()
  ),
  http.get(`${BASE}/:year/alliances/:event`, ({ params }) =>
    fixtureOr404(`${params.year}-${params.event}-alliances`)()
  ),
  http.get(`${BASE}/:year/awards/event/:event`, ({ params }) =>
    fixtureOr404(`${params.year}-${params.event}-awards`)()
  ),
  http.get(`${BASE}/:year/communityUpdates/:event`, ({ params }) =>
    fixtureOr404(`${params.year}-${params.event}-community-updates`)()
  ),

  // Global high scores
  http.get(`${BASE}/:year/highscores`, ({ params }) =>
    fixtureOr404(`${params.year}-highscores`)()
  ),

  // Team updates (no year prefix in path)
  http.get(`${BASE}/team/:team/updates`, ({ params }) =>
    fixtureOr404(`team-${params.team}-updates`)()
  ),

  // System
  http.get(`${BASE}/announcements`, fixtureOr404("announcements")),
];
