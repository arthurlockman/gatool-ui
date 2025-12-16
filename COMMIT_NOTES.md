# Commit Notes: Scroll Position Memory System

## Summary
Implemented a comprehensive scroll position memory system for the game announcer tool's tabbed interface, allowing users to maintain their scroll position when navigating between tabs. Added a user preference toggle to enable/disable this feature.

## Features Added

### Scroll Position Memory
- Created `useScrollPosition` custom hook to manage scroll position persistence
- Scroll positions are stored in `sessionStorage` and persist during the browser session
- Pages with scroll memory:
  - Schedule
  - Teams
  - Ranks
  - Announce
  - Play by Play
  - Alliance Selection (when in Alliance Selection mode)

### Special Behaviors
- **Alliance Selection Brackets Mode**: Always scrolls to top (no memory) when displaying brackets
- **Alliance Selection Mode**: Remembers scroll position to allow users to navigate to Rankings and return
- **Match Navigation**: When navigating to a different match on Announce or Play By Play pages, both pages reset their scroll positions to top
- **Other Pages**: All pages without scroll memory (Setup, Awards, Stats, Cheatsheet, Emcee) automatically scroll to top when navigated to

### User Preference
- Added "Enable screen scroll memory" toggle in Setup page under User Interface Settings
- Setting is persisted using `usePersistentState` and defaults to enabled
- When disabled, all pages scroll to top regardless of previous scroll position

## Technical Changes

### New Files
- `src/hooks/useScrollPosition.jsx`: Custom hook for managing scroll position memory

### Modified Files
- `src/pages/SchedulePage.jsx`: Added scroll position memory
- `src/pages/TeamDataPage.jsx`: Added scroll position memory
- `src/pages/RanksPage.jsx`: Added scroll position memory
- `src/pages/AnnouncePage.jsx`: Added scroll position memory with match change reset logic
- `src/pages/PlayByPlayPage.jsx`: Added scroll position memory with match change reset logic
- `src/pages/AllianceSelectionPage.jsx`: Added conditional scroll memory (disabled in Brackets mode)
- `src/pages/SetupPage.jsx`: Added scroll memory toggle switch
- `src/App.jsx`: 
  - Added `useScrollMemory` state management
  - Updated Layout component to scroll other pages to top
  - Passed `useScrollMemory` prop to all relevant pages
- `src/hooks/UsePersistentState.jsx`: Fixed bug where `false` values were incorrectly treated as falsy, causing program selection to not persist on page reload

## Bug Fixes
- Fixed `UsePersistentState` hook to properly handle falsy values (`false`, `0`, empty strings) by checking explicitly for `null`/`undefined` instead of using `||` operator
- This fix also resolved an issue where the selected program (FRC/FTC) was not persisting across page reloads

## Testing Notes
- Verify scroll positions are remembered when navigating between tabs
- Verify scroll resets when match changes on Announce/Play By Play pages
- Verify Alliance Selection Brackets mode always starts at top
- Verify Alliance Selection mode remembers scroll position
- Verify toggle in Settings properly enables/disables scroll memory
- Verify program selection persists across page reloads

