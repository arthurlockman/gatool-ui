export const appUpdates = [
  {
    date: "March 4, 2025",
    message: (
      <ul>
        <li>
          Alliance Captains are now removed from the list of available teams during Alliance Selection.
        </li>
        <li>
          Declined teams who become Alliance Captains can now be skipped.
        </li>
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
