#!/usr/bin/env bash
# Capture API fixtures from prod gatool-api for use by hook tests.
#
# Auth is open on read endpoints, so plain curl works. Writes one JSON file
# per endpoint into src/test/fixtures/, keyed by a stable slug matching
# what src/test/handlers.js expects.
#
# Defaults: 2026 / MAWOR / team 190 (FRC). Override via env vars:
#   YEAR=2025 EVENT=NYTR TEAM=254 ./scripts/capture-fixtures.sh
#
# Re-run any time you suspect an upstream contract change. The script is
# idempotent: it overwrites existing fixtures and prints a brief diff
# summary so unintended changes are easy to spot in `git status`.

set -euo pipefail

YEAR="${YEAR:-2026}"
EVENT="${EVENT:-MAWOR}"
TEAM="${TEAM:-190}"
PRIOR_YEAR="${PRIOR_YEAR:-2025}"
BASE="${BASE:-https://api.gatool.org/v3}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/src/test/fixtures"
mkdir -p "$DEST"

YELLOW='\033[33m'; GREEN='\033[32m'; RED='\033[31m'; RESET='\033[0m'

fetch() {
  local path="$1"; local slug="$2"
  local url="$BASE/$path"
  local out="$DEST/$slug.json"
  local tmp; tmp=$(mktemp)
  local code
  code=$(curl -sS -o "$tmp" -w "%{http_code}" "$url")
  if [[ "$code" != "200" ]]; then
    printf "${YELLOW}skip${RESET}  %-40s  HTTP %s  (%s)\n" "$slug" "$code" "$path"
    rm -f "$tmp"
    return
  fi
  # Ensure the body is valid JSON before committing it as a fixture.
  if ! python3 -c "import json,sys; json.load(open(sys.argv[1]))" "$tmp" >/dev/null 2>&1; then
    printf "${RED}bad${RESET}   %-40s  not JSON  (%s)\n" "$slug" "$path"
    rm -f "$tmp"
    return
  fi
  python3 -c "import json,sys; json.dump(json.load(open(sys.argv[1])), open(sys.argv[2], 'w'), indent=2, sort_keys=False)" "$tmp" "$out"
  rm -f "$tmp"
  printf "${GREEN}ok${RESET}    %-40s  %s\n" "$slug" "$path"
}

echo "Capturing fixtures: YEAR=$YEAR EVENT=$EVENT TEAM=$TEAM (BASE=$BASE)"
echo

# Event lists
fetch "$YEAR/events"                                  "$YEAR-events"
fetch "$YEAR/offseason/events/"                       "$YEAR-offseason-events"

# Schedules + scores for the chosen event
fetch "$YEAR/schedule/hybrid/$EVENT/practice"         "$YEAR-$EVENT-schedule-practice"
fetch "$YEAR/schedule/hybrid/$EVENT/qual"             "$YEAR-$EVENT-schedule-qual"
fetch "$YEAR/schedule/hybrid/$EVENT/playoff"          "$YEAR-$EVENT-schedule-playoff"
fetch "$YEAR/scores/$EVENT/qual"                      "$YEAR-$EVENT-scores-qual"
fetch "$YEAR/scores/$EVENT/playoff"                   "$YEAR-$EVENT-scores-playoff"

# Teams (note: real path is /teams?eventCode=<EVENT>, not /teams/<EVENT>)
fetch "$YEAR/teams?eventCode=$EVENT"                  "$YEAR-$EVENT-teams"
fetch "$YEAR/rankings/$EVENT"                         "$YEAR-$EVENT-rankings"
fetch "$YEAR/alliances/$EVENT"                        "$YEAR-$EVENT-alliances"
# Awards (note: real path has an /event/ infix)
fetch "$YEAR/awards/event/$EVENT"                     "$YEAR-$EVENT-awards"
# Community updates merged in by useCommunityUpdates
fetch "$YEAR/communityUpdates/$EVENT"                 "$YEAR-$EVENT-community-updates"

# Global high scores (current + prior season for cross-year diff tests)
fetch "$YEAR/highscores"                              "$YEAR-highscores"
fetch "$PRIOR_YEAR/highscores"                        "$PRIOR_YEAR-highscores"

# Team detail (single-team lookups go through ?teamNumber=)
fetch "$YEAR/teams?teamNumber=$TEAM"                  "$YEAR-team-$TEAM"
fetch "team/$TEAM/updates"                            "team-$TEAM-updates"

# System
fetch "announcements"                                 "announcements"

echo
echo "Done. Files in $DEST:"
ls -1 "$DEST"
echo
echo "If anything changed, review with: git diff -- src/test/fixtures/"
