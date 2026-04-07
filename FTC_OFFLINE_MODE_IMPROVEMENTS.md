# FTC Offline Mode Improvements

## Overview
This document describes the improvements made to support FTC Offline mode with proper offline functionality and a manual offline override for unreliable network detection.

## Changes Made

### 1. Modified Community Updates Logic (App.jsx)
**Location**: `src/App.jsx`, lines 2855-2861

**What Changed**:
- Added a check to detect when the app is in FTC Offline mode AND the user is offline (or has enabled manual offline mode)
- When conditions are met, the app now skips network requests for community updates
- **Preserves cached community updates** instead of clearing them, allowing team list to function properly
- When online (even in FTC Offline mode), the app WILL fetch community updates as expected
- Added support for manual offline override when network detection is unreliable

**Code Logic**:
```javascript
if (useFTCOffline && (!isOnline || manualOfflineMode)) {
  // Skip fetching community updates while offline
  // Keep cached data so team list can still work
  console.log("FTC Offline mode: Skipping community updates while offline" + 
    (manualOfflineMode ? " (manual override)" : "") + " - using cached data");
  setLoadingCommunityUpdates(false);
  return;
} else {
  // Fetch community updates normally (when online OR not in FTC Offline mode)
  // ... existing fetch logic ...
}
```

### 2. Added Manual Offline Mode Switch (SetupPage.jsx)
**Location**: `src/pages/SetupPage.jsx`, lines 325-332

**What Changed**:
- Added a new persistent state variable `manualOfflineMode` to allow users to manually indicate they have no internet
- Added a React Switch component on the Settings page underneath the Request API Access button
- Switch is labeled "I have no Internet connection on the FTC Local Server network"
- Includes helpful text explaining when to use this feature
- State persists across sessions using `usePersistentState`
- **The switch is only visible when FTC Offline mode is enabled** (`useFTCOffline` is true)
- When switching to other modes (FTC Online, FRC, etc.), the switch is hidden and ignored

**Benefits**:
- Addresses unreliable browser network detection in local network scenarios
- Gives users direct control over offline behavior
- Particularly useful when connected to FTC Local Server network without internet access
- Prevents unnecessary network requests that would timeout or fail
- **Mode-specific**: Only applies when in FTC Local Server mode, preventing confusion

### 3. Prevented External API Calls in FTC Offline Mode (App.jsx)
**Location**: `src/App.jsx`

**What Changed**:
Added offline checks to prevent calls to external APIs when in FTC offline mode without internet:

1. **FTCScout API Calls** (line 3300-3306):
   - `getEPAFTC()` function now checks offline status before making calls to ftcscout
   - Skips EPA and season stats API calls when offline
   - Console logs: "FTC Offline mode: Skipping FTCScout API calls while offline"

2. **World High Scores API Calls** (line 3404-3410):
   - `getWorldStats()` function now checks offline status before making calls
   - Skips world high scores API call when offline
   - Console logs: "FTC Offline mode: Skipping World High Scores API call while offline"

3. **System Messages API Calls** (line 4030-4035):
   - `getSystemMessages()` function now checks offline status before making calls
   - Skips system-wide notification messages when offline
   - Console logs: "FTC Offline mode: Skipping System Messages API call while offline"

4. **Event Messages API Calls** (line 4055-4060):
   - `getEventMessages()` function now checks offline status before making calls
   - Skips event-specific notification messages when offline
   - Console logs: "FTC Offline mode: Skipping Event Messages API call while offline"

5. **FTC Leagues API Calls** (line 4632-4637):
   - `getFTCLeagues()` function now checks offline status before making calls
   - Skips fetching leagues list when offline, uses cached leagues
   - Console logs: "FTC Offline mode: Skipping FTC Leagues API call while offline - using cached leagues"

6. **Query Awards API Calls** (line 2425-2430):
   - `getTeamList()` function now checks offline status before querying awards
   - Skips awards fetching when offline, uses teams without fetching fresh awards
   - Console logs: "FTC Offline mode: Skipping queryAwards API call while offline - using cached awards"

**Code Logic**:
```javascript
// In all functions:
if (useFTCOffline && (!isOnline || manualOfflineMode)) {
  console.log("FTC Offline mode: Skipping [API name] while offline" + 
    (manualOfflineMode ? " (manual override)" : ""));
  // Set empty/null state and return
  return;
}
// ... proceed with normal API calls
```

**Benefits**:
- Prevents timeouts and failed requests to external services
- Only allows FTC Local Server API calls when in offline mode
- Improves performance by avoiding unnecessary network attempts
- Provides clear console feedback about skipped calls
- Blocks notification banner API calls that require internet
- Preserves cached leagues and awards data for offline use

### 4. Enhanced Service Worker Caching (service-worker.js)
**Location**: `src/service-worker.js`

**What Changed**:
- Added `CacheFirst` import from workbox-strategies for aggressive caching
- Created a new caching strategy specifically for public folder assets
- All files in `/images/`, `/cheatsheet/`, `/bracket/`, and `/json/` directories are now cached
- PDFs, PNGs, JPGs, GIFs, SVGs, DOCX, and DOC files are cached with `CacheFirst` strategy
- **NEW**: Added external font caching for Adobe Typekit, Google Fonts, and other font CDNs
- **NEW**: Font files (.woff, .woff2, .ttf, .otf, .eot) are cached for 1 year
- Cache for static assets expires after 30 days (vs previous 2 days for general files)
- Supports up to 500 cached assets and 100 cached fonts
- HTML and same-origin content cached for 5 days with StaleWhileRevalidate strategy

**Benefits**:
- When users "Add to Home Screen", all public assets are cached automatically
- Cheat sheets, bracket diagrams, team information sheets, and images work offline
- **Fonts remain available offline**, preventing FOIT (Flash of Invisible Text) or FOUT (Flash of Unstyled Text)
- Assets load faster even when online (served from cache first)
- More reliable offline experience for field staff at competitions
- Professional appearance maintained even without internet connection

**Caching Strategies**:
- **CacheFirst** for static assets (images, PDFs, etc.): Check cache first, fall back to network if not found
- **CacheFirst** for external fonts: Check cache first (1-year expiration), fall back to network if not found
- **StaleWhileRevalidate** for HTML and dynamic content: Serve from cache immediately, update cache in background
- **StaleWhileRevalidate** for avatar images: Balance between freshness and offline availability

## Testing Instructions

### Test 1: Manual Offline Mode Switch (NEW)
1. Open the app and log in
2. **Switch to FTC Local Server mode** from the program dropdown (the manual offline switch will appear)
3. Scroll down to the FTC configuration section
4. Locate the switch labeled "I have no Internet connection on the FTC Local Server network"
5. **Expected**: Switch is visible below the API Access buttons
6. **With Internet Connected**: Toggle the switch ON
7. Load team data and try to update community data
8. **Expected**: Community updates should NOT be fetched (manual override)
9. **Check console**: Should see "FTC Offline mode: Skipping community updates while offline (manual override)"
10. Toggle the switch OFF
11. Try to update community data again
12. **Expected**: Community updates SHOULD be fetched from the network
13. **Check console**: Should see "Teams List loaded. Update from the Community"

### Test 1.5: Manual Offline Mode Switch - Mode Switching (NEW)
1. With the manual offline switch enabled (from Test 1)
2. Switch to **FTC Online** or **FRC** mode from the program dropdown
3. Go to Settings page
4. **Expected**: Manual offline switch is no longer visible (it's hidden)
5. Load an event and check console
6. **Expected**: No "manual override" messages - external APIs are called normally
7. Switch back to **FTC Local Server** mode
8. Go to Settings page
9. **Expected**: Manual offline switch reappears with previous setting preserved
10. **Expected**: If switch was ON, offline behavior resumes with "manual override" messages

### Test 2: Online Mode with FTC Offline
1. Open the app and log in
2. Select FTC mode from the program dropdown
3. Enable "FTC Offline" mode in settings
4. Verify internet connection is active
5. **Ensure manual offline mode switch is OFF**
6. Select an event and load team data
7. **Expected**: Community updates SHOULD be fetched from the network
8. **Check console**: Should see "Teams List loaded. Update from the Community"

### Test 3: Offline Mode with FTC Offline
1. Open the app with FTC Offline mode enabled
2. Select an event and load team data (while online)
3. Disconnect from the internet (airplane mode or disable WiFi)
4. Refresh the app or navigate between pages
5. Try to update community data
6. **Expected**: Community updates should NOT attempt network requests
7. **Check console**: Should see "FTC Offline mode: Skipping community updates while offline"
8. Team data should still be visible from local storage
9. Local updates should still work

### Test 4: PWA Installation and Asset Caching
1. Open the app in a browser (Chrome, Edge, or Safari)
2. Use "Add to Home Screen" or "Install App" option
3. Wait for service worker to cache assets
4. Disconnect from the internet
5. Open the installed PWA
6. Navigate to different sections:
   - Check that cheat sheets load (e.g., Reefscape cheat sheet)
   - Verify bracket diagrams display
   - Confirm team information sheet links work
   - Test that images load correctly
7. **Expected**: All assets should load from cache without network errors

### Test 5: Cache Invalidation
1. With the app installed, ensure you're online
2. The service worker will automatically update cached assets after 30 days
3. To manually test:
   - Open Developer Tools → Application → Cache Storage
   - Delete the `public-assets` cache
   - Reload the app
   - Navigate to pages that use images/PDFs
   - **Expected**: Assets are re-cached on access

### Test 6: Regular FRC Mode (Regression Test)
1. Switch back to FRC mode
2. Verify that online/offline behavior is unchanged
3. Verify that community updates still work normally
4. **Expected**: No changes to FRC mode behavior

## Technical Details

### Online Status Detection
The app uses multiple methods for offline detection:
1. **Browser Detection**: `useOnlineStatus()` hook from `OnlineContext.jsx` which:
   - Listens to browser `online` and `offline` events
   - Updates state in real-time when connection changes
   - Provides `isOnline` boolean throughout the app
2. **Manual Override**: `manualOfflineMode` state variable that allows users to manually indicate offline status
   - Persists across sessions
   - Overrides browser detection when enabled
   - Particularly useful for local networks without internet access

The offline check is: `if (useFTCOffline && (!isOnline || manualOfflineMode))`

### Service Worker Caching Order
The service worker evaluates route handlers in order:
1. App Shell navigation (index.html)
2. Public assets (images, PDFs, etc.) - **NEW**
3. General same-origin content
4. Avatar images

Routes are matched from most specific to least specific.

### Cache Storage Limits
- **public-assets**: Up to 500 entries, 30-day expiration
- **external-fonts**: Up to 100 entries, 1-year expiration (fonts rarely change)
- **public-files**: 5-day expiration
- **avatars**: Up to 200 entries

These limits prevent unlimited cache growth while supporting offline functionality.

## Troubleshooting

### Community Updates Still Fetching While Offline
- Verify `useFTCOffline` is true (check Settings)
- Check that `isOnline` is false (check browser DevTools Console)
- **NEW**: Try enabling the manual offline mode switch
- Look for the log message: "FTC Offline mode: Skipping community updates while offline"
- If manual override is on, check for: "FTC Offline mode: Skipping community updates while offline (manual override)"

### Assets Not Loading Offline
- Ensure service worker is registered (check DevTools → Application → Service Workers)
- Verify assets are in cache (DevTools → Application → Cache Storage → public-assets)
- Try clearing cache and reloading while online to re-cache assets
- Check that the asset path matches the cache route patterns

### Service Worker Not Updating
- Service workers update automatically but require all tabs to close
- Manually unregister in DevTools → Application → Service Workers → Unregister
- Hard refresh (Cmd+Shift+R or Ctrl+Shift+R) to force reload
- Check for errors in the Console during service worker registration

## Future Enhancements

Potential improvements for future iterations:

1. **Preload Critical Assets**: Add an install event handler to proactively cache essential assets
2. **Cache Size Management**: Add UI to show cache size and allow manual clearing
3. **Selective Caching**: Allow users to choose which resources to cache offline
4. **Offline Indicator**: Add a visual indicator showing which features are available offline
5. **Background Sync**: Queue community update requests to send when connection is restored

## Files Modified

1. `src/App.jsx` 
   - Added `manualOfflineMode` state variable (line 423-426)
   - Modified `getCommunityUpdates()` function to check manual offline mode (line 2856-2859)
   - Modified `getTeamList()` function to skip queryAwards calls when offline (line 2425-2430)
   - Modified `getEPAFTC()` function to skip FTCScout calls when offline (line 3300-3306)
   - Modified `getWorldStats()` function to skip World High Scores calls when offline (line 3404-3410)
   - Modified `getSystemMessages()` function to skip System Messages calls when offline (line 4030-4035)
   - Modified `getEventMessages()` function to skip Event Messages calls when offline (line 4055-4060)
   - Modified `getFTCLeagues()` function to skip FTC Leagues calls when offline (line 4632-4637)
   - Passed `manualOfflineMode` props to SetupPage component (line 5068-5069)
2. `src/pages/SetupPage.jsx` 
   - Added `manualOfflineMode` and `setManualOfflineMode` to function parameters (line 78)
   - Added manual offline mode switch UI component (lines 325-342)
3. `src/service-worker.js` - Enhanced caching strategies for public assets

## Dependencies

No new dependencies were added. The changes use existing Workbox libraries:
- `workbox-strategies` (already imported, added `CacheFirst`)
- `workbox-expiration` (already imported)
- `workbox-routing` (already imported)
- `workbox-core` (already imported)

## Backward Compatibility

These changes are fully backward compatible:
- FRC mode behavior is unchanged
- Online functionality in FTC mode is unchanged
- Only affects behavior when BOTH `useFTCOffline === true` AND `isOnline === false`
- Service worker gracefully degrades if browser doesn't support it

---

**Last Updated**: November 8, 2025
**Modified By**: AI Assistant
**Tested On**: Not yet tested - requires user testing

