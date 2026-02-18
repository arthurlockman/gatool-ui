export const appUpdates = [
  {
    date: "February 16, 2026",
    message: (
      <ul>
        <li>ALL PROGRAMS:</li>
        <ul>
          <li>Fixed a bug which prevented event notifications from displaying correctly</li>
        </ul>
      </ul>
    ),
  },{
    date: "February 13, 2026",
    message: (
      <ul>
        <li>FTC:</li>
        <ul>
          <li>Fixed a bug where team avatars were not displaying correctly on Team Data and Cheat Sheet pages</li>
        </ul>
      </ul>
    ),
  },{
    date: "February 2, 2026",
    message: (
      <ul>
        <li>ALL PROGRAMS:</li>
        <ul>
          <li>Refactored the Playoff Brackets to use reusable components for each match and finals match.</li>
          <li>Tuned match display to improve readability and consistency on Playoff screen.</li>
          <li>Tuned Emcee screen for readability.</li>
          <li>Improved handling of case when Top Seeded Alliance declines to play in the Playoffs.</li>
        </ul>
        <li>FTC:</li>
        <ul>
          <li>Removed Skip Alliance option from Alliance Selection for FTC.</li>
          <li>Fixed a bug that prevented proper display of tiebreakers in the Playoff Brackets</li>
          <li>Fixed the match results guidance on Announce, Play-By-Play and Emcee pages to account for ties in FTC</li>
        </ul>
      </ul>
    ),
  },{
    date: "January 25, 2026",
    message: (
      <ul>
        <li>ALL PROGRAMS:</li>
        <ul>
          <li>Added Screen Mode. When Sync Event is enabled, other devices in Screen Mode will automatically follow the current match and event settings from this device. Requires login.</li>
          <li>Fixed a bug that prevented team-entered robot names from displaying correctly on the Play-By-Play page</li>
          <li>Fixed a server-side bug that prevented awards from displaying correctly</li>
        </ul>
      </ul>
    ),
  },{
    date: "January 18, 2026",
    message: (
      <ul>
        <li>FTC:</li>
        <ul>
          <li>Fixed a bug that prevented awards for some events from displaying correctly on the Awards page</li>
          <li>Added a routine to filter out ranks for teams that have not played any matches yet. This will ensure that Sponsors appear correctly on the Awards page</li>
        </ul>
      </ul>
    ),
  },{
    date: "January 16, 2026",
    message: (
      <ul>
        <li>ALL PROGRAMS:</li>
        <ul>
          <li>Added button on Team List screento reset sponsors, robot names and optionally team notes for teams that have not been updated since the start of the season</li>
          <li>Fixed a bug that prevented awards from displaying correctly on the Announce page</li>
        </ul>
      </ul>
    ),
  },{
    date: "January 12, 2026",
    message: (
      <ul>
        <li>FTC: </li>
        <ul>
          <li>Fixed an issue where updates to team data were not being saved correctly and causing the app to crash</li>
        </ul>
        
        <li>FRC:</li>
        <ul>
        <li>Updated fouls to match REBUILT™ game rules</li>
        <li>Updated cheat sheet to match REBUILT™ game</li>
        </ul>
      </ul>
    ),
  },{
    date: "December 16, 2025",
    message: (
      <ul>
        <li>ALL PROGRAMS: </li>
        <ul>
          <li>Added option to remove a team from the list of available teams in Alliance Selection</li>
          <li>Added button to refresh rankings in Alliance Selection. This also restarts Alliance Selection to ensure proper ranking order is displayed</li>
          <li>Fixed timing issue with displaying event stats on first event load</li>
          <li>Fixed 🤞 rendering issue which caused the footer to move when scrolling on the Alliance Selection screen</li>
          <li>Added scrolling memory for screens. Enabled by default, can be disabled on the Setup page</li>
        </ul>
        
        <li>FRC:</li>
        <ul>
        <li>Updated game brand on Setting page to animated REBUILT™ logo</li>
        </ul>
      </ul>
    ),
  },{
    date: "December 9, 2025",
        message: (
      <ul>
        <li>ALL PROGRAMS: Updated logic for Alliance Selection to only show teams that are competing in the event</li>
        <li>FRC: Updated game brand on Setting page to REBUILT™</li>
        <li>FTC: Updated Alliance Selection screen to show correct number of rounds for FTC events</li>
        <li>FTC: Removed non-competing teams from rankings on League Meet events</li>
        <li>FTC: Fixed a bug that prevented OPA and season stats from displaying correctly on the Ranks and Play-By-Play pages</li>
      </ul>
    ),
  },{
    date: "November 17, 2025",
    message: (
      <ul>
        <li>ALL PROGRAMS:Refined the reload experience to reduce the number of times a user must choose program, season and events</li>
        <li>FRC: Persisting OFFLINE event details across reloads</li>
        <li>FTC: Fixing a bug that prevented Alliance Selection screen from activating</li>
        <li>FTC: Fixed event winner display on the Playoff Brackets for FTC events</li>
        <li>FTC: Fixed cache timing issues in our APIs that prevented some team data from loading in a timely manner</li>
      </ul>
    ),
  },{
    date: "November 8, 2025",
    message: (
      <ul>
        <li>Refined how offline works for FTC. There is now a switch to enable true offline mode when using FTC Local Server mode. Use when the FTC Local Server networks is completely isolated.</li>
        <li>Included support for remapping team numbers for TBA offseason events</li>
        <li>Added switch to enable 4-team Alliances for Offseason events</li>
        <li>Fixed a bug where Blue Banner statistics were not displayed correctly on Announce for TBA-soueces events</li>
      </ul>
    ),
  },{
    date: "November 3, 2025",
    message: (
      <ul>
        <li>Added event high scores to Announce, Play-By-Play and Stats pages for FTC and Offline events</li>
        <li>Fixed a bug that mixed up the placement of teams on Alliances in the Schedule and Brackets pages</li>
        <li>Added ••OFFLINE•• to the event list for all seasons.</li>
        <li>Added support for csv schedule uploads for FRC Offline events</li>
        <li>Added Blue Banner statistics to Announce pages, configurable on Setup page</li>
        <li>Fixed a bug that ignored certain event properties when loading from TBA</li>
      </ul>
    ),
  },{
    date: "October 25, 2025",
    message: (
      <ul>
        <li>Fixed TBA offseason event data loading - events without FIRST equivalents now appear in the event list</li>
        <li>Ranking points now display immediately after match completion (previously delayed until next match)</li>
        <li>Added FTC-specific resource buttons (FTC Scout, FTC event links) in Team Data page</li>
        <li>Fixed crashes when loading TBA events without score data</li>
      </ul>
    ),
  },{
    date: "October 23, 2025",
    message: (
      <ul>
        <li>Ofseason demo team updates will now be keyed to a specific event. No more cross-contamination of updates during events!</li>
        <li>Added support for Offline Events using TBA! gatool will now attempt to load event details from TBA for events that do not sync with FIRST API.</li>
        <ul>
          <li>When you select an Offseason Event that's got a beige tint, gatool will attempt to load event details from TBA.</li>
          <li>When you select an Offseason Event that's got a blue tint, gatool will attempt to load event details from FIRST API.</li>
          <li>If TBA doesn't have the event details, you should try using OFFLINE mode if the event uses the FIRST field system.</li>
        </ul>
      </ul>
    ),
  }, {
    date: "October 5, 2025",
    message: (
      <ul>
        <li>Added support for FTC!</li>
        <li>gatool now support loading events from FTC's Cloud API*. With this update, you can:</li>
        <ul>
          <li>Load FTC events and filter by event type, region and league</li>
          <li>Edit team details and save to gatool Cloud</li>
          <li>Announce teams and call matches</li>
          <li>Use gatool's Alliance Selection mode</li>
          <li>Announce awards</li>
          <li>See team stats from FTCScout</li>
        </ul>
        <i>* Loading live event data from a local Event server is available but requires browser configuration.</i>
      </ul>
    ),
  }, {
    date: "July 14, 2025",
    message: (
      <ul>
        <li>Added support for Cheesy Arena</li>
        <li>Improved handling of statbotics responses to reduce error notifications</li>
      </ul>
    ),
  }, {
    date: "May 12, 2025",
    message: (
      <ul>
        <li>Added links to TBA and Statbotics in footer</li>
        <li>Possible solution to moving footer on Announce</li>
        <li>Consolidated settings into groups on Setup</li>
        <li>Word spacing tweaks in Playoff match result guidance at bottom of Announce & Play-By-Play</li>
      </ul>
    ),
  }, {
    date: "May 6, 2025",
    message: (
      <ul>
        <li>Added notification bell for system-wide notifications</li>
        <li>Added event-level announcement reminders. You can now add time-bound announcements that appear on Announce and Play-By-Play</li>
        <li>Made notifications and announcements dismissible.</li>
      </ul>
    ),
  }, {
    date: "April 28, 2025",
    message: (
      <ul>
        <li>Small Screen support on Alliance Selection and Awards</li>
        <li>Adding EPA and season record to Rankings and Play-By-Play</li>
      </ul>
    ),
  }, {
    date: "April 26, 2025",
    message: (
      <ul>
        <li><b>Introducing Unauthenticated mode.</b><br /> Users can now use gatool without login. Unauthenticated users can load events, see schedule and score details, announce teams and call matches. </li>
        <li>On Announce and Play-By-Play, gatool now shows the high score based on tournament phase. You can make it show the event high score instead via a switch on the Setup page</li>
        <li>Auto Advance now allows you to advance beyond the last known completed match + 1.</li>
        <li>Updated how we calculate Tiebreakers for Playoff matches</li>
      </ul>
    ),
  }, {
    date: "April 23, 2025",
    message: (
      <ul>
        <li>Updates content on Cheat Sheet page</li>
        <li>Adds additional foul buttons</li>
        <li>Adds District Points and District Point details to Ranks page</li>
        <li>Adds button to reset Top Sponsors</li>
        <li>Adds switch on Setup to suppress non-major awards</li>
        <li>Adds button on Practice matches to substitute teams</li>
        <li>Cosmetic updates and crash prevention</li>
      </ul>
    ),
  }, {
    date: "April 18, 2025",
    message: (
      <ul>
        <li>Expanded exported schedule (from Team Data page) to include additional score details</li>
      </ul>
    ),
  }, {
    date: "April 15, 2025",
    message: (
      <ul>
        <li>Fixed an issue with downloaded file names</li>
      </ul>
    ),
  }, {
    date: "April 10, 2025",
    message: (
      <ul>
        <li>Formatting improvements for score details on Schedule page</li>
        <li>Adding Rookie All Star teams to District Champs attendees</li>
        <li>Updated major awards highlighting</li>
      </ul>
    ),
  }, {
    date: "April 8, 2025",
    message: (
      <ul>
        <li>Adding verbose score details on Schedule page</li>
        <li>Adding in additional fouls</li>
      </ul>
    ),
  }, {
    date: "March 28, 2025",
    message: (
      <ul>
        <li>Fixing a bug that could cause a white screen while loading an event</li>
      </ul>
    ),
  }, {
    date: "March 25, 2025",
    message: (
      <ul>
        <li>Per Team Update 19, changed the calculation for Playoff Tiebreakers</li>
      </ul>
    ),
  }, {
    date: "March 20, 2025",
    message: (
      <ul>
        <li>Added Ranking Point highlighting to the Schedule page</li>
        <li>Fixed a bug that suppressed highlighting the winning Alliance on the Schedule page when Red's score was zero</li>
      </ul>
    ),
  }, {
    date: "March 19, 2025",
    message: (
      <ul>
        <li>Added District High Scores to Stats Page</li>
        <li>Added new high score to Stats page to align with TBA</li>
      </ul>
    ),
  },
  {
    date: "March 16, 2025",
    message: (
      <ul>
        <li>
          Restored Practice Matches to Schedule, Announce and Play by Play pages
        </li>
        <li>
          Added switch to control Inspection/Alliance Selection alert on Setup
          screen
        </li>
        <li>Changed Top Sponsors form field to text area for easier editing</li>
        <li>Added Ranking Points Achieved to match results on Schedule page</li>
      </ul>
    ),
  },
  {
    date: "March 4, 2025",
    message: (
      <ul>
        <li>
          Alliance Captains are now removed from the list of available teams
          during Alliance Selection.
        </li>
        <li>Declined teams who become Alliance Captains can now be skipped.</li>
      </ul>
    ),
  },
  {
    date: "February 28, 2025",
    message: (
      <ul>
        <li>
          Updating definition of Playoff tiebreaker to include
          "endGameBargePoints" as the level three tiebreaker
        </li>
      </ul>
    ),
  },
  {
    date: "February 27, 2025",
    message: (
      <ul>
        <li>Redesigned Alliance Selection skipping process</li>
      </ul>
    ),
  },
  {
    date: "February 9, 2025",
    message: (
      <ul>
        <li>
          Removed top ranked team from Available teams in Alliance Selection
        </li>
      </ul>
    ),
  },
  {
    date: "February 8, 2025",
    message: (
      <ul>
        <li>Fixed issues with skipped Alliances in Alliance Selection</li>
        <li>
          Updated Alliance Selection page to include more relevant visual
          information about teams and Alliances
        </li>
      </ul>
    ),
  },
  {
    date: "January 19, 2025",
    message: (
      <ul>
        <li>
          Updated Cheat Sheet for names of Fouls and extended Alliance Area
        </li>
        <li>
          Ensured that you can't have the same team on both Alliances as a
          replacement in Playoffs
        </li>
      </ul>
    ),
  },
  {
    date: "January 11, 2025",
    message: (
      <ul>
        <li>Fixed stale data highlighting on Team Data page</li>
        <li>Added Foul lookup on Play-by-Play page</li>
      </ul>
    ),
  },
  {
    date: "January 10, 2025",
    message: (
      <ul>
        <li>
          Added buttons to view TBA and FIRST Team pages from Team Details page
        </li>
        <li>Added support to close Awards Announce dialog via enter key</li>
        <li>
          Added button to Team Details page to erase all locally entered data
          for a team, effectively resetting it to TIMS values.
        </li>
      </ul>
    ),
  },
  {
    date: "January 10, 2025",
    message: (
      <ul>
        <li>Updated branding for Reefscape</li>
        <li>
          Added support for skipping Alliance choice during Alliance Selection
        </li>
        <li>Updated playoff tiebreakers</li>
      </ul>
    ),
  },
  {
    date: "June 22, 2024",
    message: (
      <ul>
        <li>
          Fixed a bug in Rankings page that prevented updated team names from
          displaying
        </li>
        <li>
          Fixed a bug that hid the "Add Team" button on Announce and
          Play-by-play during Playoffs
        </li>
      </ul>
    ),
  },
  {
    date: "June 11, 2024",
    message: (
      <ul>
        <li>
          Implemented handling for offseason playoff variations, including 5, 6
          and 7 Alliance playoffs using the double-elimination format
        </li>
        <li>Implemented better handling for offseason demo teams</li>
      </ul>
    ),
  },
  {
    date: "April 21, 2024",
    message: (
      <ul>
        <li>Added switch to enable/disable swipe action</li>
        <li>
          Added pull down to refresh scores/schedule/ranks to Announce, Play By
          Play, Emcee and Bracket
        </li>
        <li>
          Fixed a bug that prevented updated team data from displaying in the
          Alliance Selection flow
        </li>
        <li>Added 2024 Championship Impact and event winners</li>
        <li>Fixed Hall of Fame text sizing for Impact winners</li>
        <li>Replaced "Backup" with "Add Team" in Playoffs</li>
      </ul>
    ),
  },
  {
    date: "April 18, 2024",
    message: (
      <ul>
        <li>{`Restored highlighting for Regional IMPACT Winners (requires event reload)`}</li>
      </ul>
    ),
  },
  {
    date: "April 16, 2024",
    message: (
      <ul>
        <li>Adding button to show update history on Setup</li>
        <li>
          Added support for Playoff-only OFFLINE events, such as Einstein.
        </li>
      </ul>
    ),
  },
  {
    date: "April 15, 2024",
    message: (
      <ul>
        <li>Fixing bug in Update Team Data flow for Einstein</li>
        <li>Fixing tab highlighting for Announce and Play By Play</li>
        <li>Fixed Team Table headers</li>
      </ul>
    ),
  },
  {
    date: "April 14, 2024",
    message: (
      <ul>
        <li>Making how we store team updates consistent on every page</li>
        <li>
          Added new top sponsor option for World Champs Divisions and Champs
        </li>
        <li>
          Added additional checks in Alliance Selection to ensure reset when
          conditions change
        </li>
        <li>Restoring team info sheet downloads from Teams tab</li>
        <li>
          Adding highlighting when Team Notes are present on Team Data form
        </li>
      </ul>
    ),
  },
  {
    date: "April 8, 2024",
    message: (
      <ul>
        <li>Fixed a bug that hid custom Awards Text on Awards</li>
        <li>
          Added current match highlighting to Playoff brackets for 8 and 4
          Alliance events
        </li>
        <li>
          Added 's' and 'F5' keyboard shortcut to refresh schedules/scores
        </li>
        <li>Update team data on Setup screen now reloads all team data</li>
      </ul>
    ),
  },
  {
    date: "April 4, 2024",
    message: (
      <ul>
        <li>Updating behavior of Update Team Data button</li>
        <li>Fixing a flashing re-inspection banner</li>
      </ul>
    ),
  },
  {
    date: "April 3, 2024",
    message: (
      <ul>
        <li>System-wide messaging</li>
      </ul>
    ),
  },
  {
    date: "April 2, 2024",
    message: (
      <ul>
        <li>Fixed a bug in the match clock</li>
        <li>Added OFFLINE support for Emcee page</li>
        <li>
          Added support to load Team List from Teams Table page when it doesn't
          load
        </li>
      </ul>
    ),
  },
  {
    date: "April 1, 2024",
    message: (
      <ul>
        <li>
          Fixed a bug in OFFLINE playoffs that prevented the first match from
          rendering properly
        </li>
        <li>Added OFFLINE support for Emcee page</li>
        <li>
          Fixed bug in manual Playoff advancement that incorrectly displayed Tie
          as a choice
        </li>
      </ul>
    ),
  },
  {
    date: "March 31, 2024",
    message: (
      <ul>
        <li>
          Fixed a bug in OFFLINE playoffs that prevented the first match from
          rendering properly
        </li>
        <li>Additional work on Practice Match controls</li>
        <li>Adjusted timing for re-inspection notice at the end of Quals</li>
      </ul>
    ),
  },
  {
    date: "March 28, 2024",
    message: (
      <ul>
        <li>Fixed a big that prevented replacing teams in Practice matches</li>
        <li>
          Fixed bug that prevented locally stored updates from working properly
        </li>
        <li>Added control for Practice Match schedule visibility</li>
        <li>
          Adds framework for notifications, starting with alert for Inspection &
          Alliance Selection
        </li>
      </ul>
    ),
  },
  {
    date: "March 26, 2024",
    message: (
      <ul>
        <li>
          Fixed bug that prevented District Champs EI teams' community updates
          from loading
        </li>
        <li>Added Restore option to Team update History</li>
        <li>Restored OFFLINE Event ranking file upload</li>
      </ul>
    ),
  },
  {
    date: "March 25, 2024",
    message: (
      <ul>
        <li>
          Added contextual warning to Reload cached gatool code if browser
          doesn't support PWA
        </li>
        <li>Updated language and functionality of Show Sponsors switches</li>
        <li>
          Added confirm dialog when choosing teams during OFFLINE Playoff
          advancement via Playoff Tab
        </li>
      </ul>
    ),
  },
  {
    date: "March 21, 2024",
    message: (
      <ul>
        <li>Restore Test Match when no schedule is loaded</li>
        <li>Hotfix for Team Excel downloads</li>
        <li>Added OFFLINE Playoff advancement via Playoff Tab</li>
      </ul>
    ),
  },
  {
    date: "March 19, 2024",
    message: (
      <ul>
        <li>Practice Match upload fix</li>
        <li>Patched bug that prevented community updates from loading</li>
      </ul>
    ),
  },
  {
    date: "March 18, 2024",
    message: (
      <ul>
        <li>Test match fixes</li>
        <li>
          Restored all controls for OFFLINE match schedule loading/unloading
        </li>
        <li>Better controls for managing overlapping team list loads</li>
      </ul>
    ),
  },
  {
    date: "March 15, 2024",
    message: (
      <ul>
        <li>Enabled Offline Qual Schedule upload from Schedule Tab</li>
        <li>Enabled Offline Playoff Schedule upload from Schedule Tab</li>
        <li>
          Fixed issue which prevented Team Lists from loading when selecting an
          event
        </li>
      </ul>
    ),
  },
  {
    date: "March 14, 2024",
    message: (
      <ul>
        <li>Fixed blank Schedule page when no schedule is available</li>
      </ul>
    ),
  },
  {
    date: "March 10 & 11, 2024",
    message: (
      <ul>
        <li>Major performance improvement when loading events</li>
        <li>Major performance improvement when changing matches</li>
        <li>Adding District EI winners to District Champs team list</li>
        <li>Adding switch to automatically hide Sponsors on Announce</li>
        <li>Fixed Tab highlighting</li>
        <li>Layout adjustments for tablets</li>
      </ul>
    ),
  },
  {
    date: "March 3, 2024",
    message: (
      <ul>
        <li>Added support for Practice Matches</li>
        <li>Fixed the auto advance feature</li>
        <li>Added match time clock to the Emcee screen</li>
        <li>Updated match clock to display how many minutes ahead/behind</li>
        <li>
          Separating switches to display notes on Announce and Play-by-play
        </li>
        <li>Fixed winner highlighting issue in Playoff Bracket</li>
        <li>Fixed a typo on Announce Screen</li>
      </ul>
    ),
  },
  {
    date: "February 28, 2024",
    message: (
      <ul>
        <li>Updates to Anonymous user page</li>
        <li>Fixing a crasher on the Cheat Sheet screen</li>
        <li>Updates to the Sponsor field workflow</li>
        <li>Restored World High Scores on Stats page</li>
      </ul>
    ),
  },
  {
    date: "February 25, 2024",
    message: (
      <ul>
        <li>Added V2 of Bill Aucoin's playoff guide</li>
        <li>Fixed flashcard size issue on cheatsheet page</li>
        <li>Hide flashcards when no event is selected</li>
      </ul>
    ),
  },
  {
    date: "February 24, 2024",
    message: (
      <ul>
        <li>
          Added Logout button to the Setup Screen when user has not yet selected
          an event
        </li>
        <li>Added Reload button to the Setup Screen</li>
      </ul>
    ),
  },
  {
    date: "February 23, 2024",
    message: (
      <ul>
        <li>
          Update to Bill Aucoin's playoff guide, which is available on the Cheat
          Sheet screen
        </li>
      </ul>
    ),
  },
  {
    date: "February 22, 2024",
    message: (
      <ul>
        <li>Change how PDF documents download to better support iOS devices</li>
      </ul>
    ),
  },
  {
    date: "February 21, 2024",
    message: (
      <ul>
        <li>
          Updates to Emcee Page playoff display to reduce overset on small
          screens
        </li>
        <li>
          Adding Rich Text editor to notes fields on the Team Details page
        </li>
      </ul>
    ),
  },
  {
    date: "February 20, 2024",
    message: (
      <ul>
        <li>Many updates to Test Match setup screen</li>
        <li>Added robot images to flash cards on the Cheat Sheet</li>
      </ul>
    ),
  },
  {
    date: "February 18, 2024",
    message: (
      <ul>
        <li>Fixed Week 0 filter on Setup Screen</li>
      </ul>
    ),
  },
  {
    date: "January 23, 2024",
    message: (
      <ul>
        <li>Updated Playoff tiebreaker criteria for Crescendo</li>
        <li>
          Adding Rich Text editor to notes fields on the Team Details page
        </li>
      </ul>
    ),
  },
  {
    date: "January 12, 2024",
    message: (
      <ul>
        <li>Adjustments to Team Info form to optimize vertical space</li>
      </ul>
    ),
  },
  {
    date: "January 8, 2024",
    message: (
      <ul>
        <li>Updated Cheat Sheets for Crescendo</li>
        <li>Added option to keep event details up to date automatically</li>
      </ul>
    ),
  },
  {
    date: "December 13, 2023",
    message: (
      <ul>
        <li>Updated Practice Match schedule to always happen "today"</li>
      </ul>
    ),
  },
  {
    date: "December 11, 2023",
    message: (
      <ul>
        <li>Updated to include 2024 season</li>
      </ul>
    ),
  },
  {
    date: "October 23, 2023",
    message: (
      <ul>
        <li>Added support for uploading Rankings for Offline events</li>
        <li>Fixed selectors for This Week and This Month</li>
      </ul>
    ),
  },
  {
    date: "October 3, 2023",
    message: (
      <ul>
        <li>Fixed an issue when reloading Quals schedule in Offline</li>
      </ul>
    ),
  },
  {
    date: "October 3, 2023",
    message: (
      <ul>
        <li>Added support for Offline events</li>
      </ul>
    ),
  },
];
