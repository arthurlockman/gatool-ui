import './App.css';
import MainNavigation from './components/MainNavigation';
import BottomNavigation from './components/BottomNavigation'
import { Outlet, Route, Routes } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import SetupPage from './pages/SetupPage';
import SchedulePage from './pages/SchedulePage';
import TeamDataPage from './pages/TeamDataPage';
import RanksPage from './pages/RanksPage';
import AnnouncePage from './pages/AnnouncePage';
import PlayByPlayPage from './pages/PlayByPlayPage';
import AllianceSelectionPage from './pages/AllianceSelectionPage';
import AwardsPage from './pages/AwardsPage';
import StatsPage from './pages/StatsPage';
import CheatsheetPage from './pages/CheatsheetPage';
import EmceePage from './pages/EmceePage';
import HelpPage from './pages/HelpPage';
import { useEffect, useState } from 'react';
import { UseAuthClient } from './contextProviders/AuthClientContext';
import { useAuth0 } from '@auth0/auth0-react';
import AnonymousUserPage from './pages/AnonymousUserPage';
import { Blocks } from 'react-loader-spinner';
import { Container } from 'react-bootstrap';
import { usePersistentState } from './hooks/UsePersistentState';
import _ from 'lodash';
import moment from 'moment';
import Developer from './pages/Developer';

export const TabStates = {
  NotReady: 'notready',
  Stale: 'stale',
  Ready: 'ready'
};

// Tiebreakers
const playoffTiebreakers = {
  "2033": ["foulPoints"], // Update after rules release
  "2022": ["foulPoints", "endgamePoints", "autoCargoTotal+autoTaxiPoints"],
  "2021": ["foulPoints", "autoPoints", "endgamePoints", "controlPanelPoints+teleopCellPoints"],
  "2020": ["foulPoints", "autoPoints", "endgamePoints", "controlPanelPoints+teleopCellPoints"],
  "2019": ["foulPoints", "cargoPoints", "hatchPanelPoints", "habClimbPoints", "sandStormBonusPoints"],
  "2018": ["foulPoints", "endgamePoints", "autoPoints", "autoOwnershipPoints+teleopOwnershipPoints", "vaultPoints"]
};

const paleYellow = "#fdfaed";
const paleBlue = "#effdff";


function LayoutsWithNavbar({ scheduleTabReady, teamDataTabReady, ranksTabReady }) {
  return (
    <>
      <MainNavigation scheduleTabReady={scheduleTabReady} teamDataTabReady={teamDataTabReady} ranksTabReady={ranksTabReady} />
      <Outlet />
      <BottomNavigation />
    </>
  );
}

function App() {
  const { isAuthenticated, isLoading } = useAuth0();

  // eslint-disable-next-line no-unused-vars
  const [httpClient] = UseAuthClient();
  const [selectedEvent, setSelectedEvent] = usePersistentState("setting:selectedEvent", null);
  const [selectedYear, setSelectedYear] = usePersistentState("setting:selectedYear", null);
  const [events, setEvents] = usePersistentState("cache:events", []);
  const [playoffSchedule, setPlayoffSchedule] = usePersistentState("cache:playoffSchedule", null);
  const [qualSchedule, setQualSchedule] = usePersistentState("cache:qualSchedule", null);
  const [teamList, setTeamList] = usePersistentState("cache:teamList", null);
  const [rankings, setRankings] = usePersistentState("cache:rankings", null);
  const [alliances, setAlliances] = usePersistentState("cache:alliances", null);
  const [communityUpdates, setCommunityUpdates] = usePersistentState("cache:communityUpdates", null);
  const [eventFilters, setEventFilters] = usePersistentState("cache:eventFilters", []);
  const [timeFilter, setTimeFilter] = usePersistentState("cache:timeFilter", null);
  const [timeFormat, setTimeFormat] = usePersistentState("cache:timeFormat",{ label: "12hr", value:"h:mm:ss a"});
  const [showSponsors, setShowSponsors] = usePersistentState("cache:showSponsors", null);
  const [showAwards, setShowAwards] = usePersistentState("cache:showAwards",null);
  const [showNotes, setShowNotes] = usePersistentState("cache:showNotes",null);
  const [showMottoes, setShowMottoes] = usePersistentState("cache:showMottoes",null);
  const [showChampsStats, setShowChampsStats] = usePersistentState("cache:showChampsStats",null);
  const [swapScreen, setSwapScreen] = usePersistentState("cache:swapScreen",null);
  const [autoAdvance, setAutoAdvance] = usePersistentState("cache:autoAdvance",null);
  const [currentMatch,setCurrentMatch] = usePersistentState("cache:currentMatch",null);

  // Tab state trackers
  const [scheduleTabReady, setScheduleTabReady] = useState(TabStates.NotReady)
  const [teamDataTabReady, setTeamDataTabReady] = useState(TabStates.NotReady)
  const [ranksTabReady, setRanksTabReady] = useState(TabStates.NotReady)

  // Controllers for table sort order at render time
  const [teamSort, setTeamSort] = useState("")
  const [rankSort, setRankSort] = useState("")

  function getAllianceCount() {
    var allianceCount = 8;
    return allianceCount;
  }

  function trimArray(arr) {
    for (var i = 0; i <= arr.length - 1; i++) {
      arr[i] = arr[i].trim();
    }
    return arr;
  }

  //functions to retrieve API data

  // This function retrieves a schedule from FIRST. It attempts to get both the Qual and Playoff Schedule and sets the global variables
  async function getSchedule() {

    // returns the winner of the match
    function winner(match) {
      var winner = { winner: "", tieWinner: "", level: 0 }
      if (match?.scoreRedFinal || match?.scoreBlueFinal) {
        if (match?.scoreRedFinal < match?.scoreBlueFinal) {
          winner.winner = "blue";
        } else if (match?.scoreRedFinal > match?.scoreBlueFinal) {
          winner.winner = "red";
        } else if (match?.scoreRedFinal === match?.scoreBlueFinal) {
          winner.winner = "tie";
        }
      } else {
        winner.winner = "TBD";
      }

      return winner;
    }

    setScheduleTabReady(TabStates.NotReady);
    var result = await httpClient.get(`${selectedYear?.value}/schedule/hybrid/${selectedEvent?.value.code}/qual`);
    var qualschedule = await result.json();
    // adds the winner to the schedule.
    var matches = qualschedule.Schedule.map((match) => {
      match.winner = winner(match);
      return match;
    });
    qualschedule.Schedule = matches;

    qualschedule.lastUpdate = moment();
    setQualSchedule(qualschedule);

    //get the playoff schedule
    matches = [];
    result = {};
    result = await httpClient.get(`${selectedYear?.value}/schedule/hybrid/${selectedEvent?.value.code}/playoff`);
    var playoffschedule = await result.json();

    if (playoffschedule?.Schedule.length > 0) {
      // adds the winner to the schedule.
      matches = playoffschedule.Schedule.map((match) => {
        match.winner = winner(match);
        return match;
      });
      playoffschedule.Schedule = matches;

      // determine the tiebreaker
      var lastMatchNumber = playoffschedule.Schedule[_.findLastIndex(playoffschedule.Schedule, function (match) {
        return (match.scoreRedFinal !== null) || (match.scoreBlueFinal !== null)
      })].matchNumber;

      result = await httpClient.get(`${selectedYear?.value}/scores/${selectedEvent?.value.code}/playoff/1/${lastMatchNumber}`);
      var scores = await result.json();

      _.forEach(scores.MatchScores, ((score) => {
        if (score.alliances[0].totalPoints === score.alliances[1].totalPoints) {
          var tiebreaker = {
            level: 0,
            red: 0,
            blue: 0,
            winner: "TBD"
          }
          for (var i = 0; i < playoffTiebreakers[selectedYear?.value].length; i++) {
            tiebreaker.level = i + 1;
            var criterion = playoffTiebreakers[selectedYear?.value][i].split("+");
            for (var a = 0; a < criterion.length; a++) {
              tiebreaker.red += Number(score.alliances[1][criterion[a]]);
              tiebreaker.blue += Number(score.alliances[0][criterion[a]]);
            }
            if (tiebreaker.red > tiebreaker.blue) {
              tiebreaker.winner = "red";
              break;
            } else if (tiebreaker.red < tiebreaker.blue) {
              tiebreaker.winner = "blue";
              break;
            }
          }
          playoffschedule.Schedule[_.findIndex(playoffschedule.Schedule, { "matchNumber": score.matchNumber })].winner.tieWinner = tiebreaker.winner;
          playoffschedule.Schedule[_.findIndex(playoffschedule.Schedule, { "matchNumber": score.matchNumber })].winner.level = tiebreaker.level;

        }


      }))



      getAlliances();
    }

    playoffschedule.lastUpdate = moment();
    setPlayoffSchedule(playoffschedule);
    setScheduleTabReady(TabStates.Ready);
  }

  // This function retrieves a a list of teams for a specific event from FIRST. It parses the list and modifies some of the data to produce more readable content.
  async function getTeamList() {
    setTeamDataTabReady(TabStates.NotReady);
    var result = await httpClient.get(`${selectedYear?.value}/teams?eventCode=${selectedEvent?.value.code}`);
    var teams = await result.json();

    // Fix the sponsors now that teams are loaded

    // prepare to separate and combine sponsors and organization name
    var teamListSponsorsFixed = teams?.teams?.map((teamRow) => {
      var sponsors = {
        organization: "",
        sponsors: "",
        topSponsors: "",
        sponsorsRaw: teamRow.nameFull,
        sponsorArray: [],
        topSponsorsArray: [],
        organizationArray: [],
        lastSponsor: ""
      };

      if (teamRow.schoolName) {
        sponsors.organization = teamRow.schoolName;
        if (sponsors.organization === sponsors.sponsorsRaw) {
          sponsors.sponsorArray[0] = sponsors.sponsorsRaw
        } else {
          sponsors.sponsorArray = trimArray(sponsors.sponsorsRaw.split("/"));
          sponsors.sponsorArray.push(sponsors.sponsorArray.pop().split("&")[0]);
        }
      } else {
        sponsors.sponsorArray = trimArray(teamRow.nameFull.split("/"))
      }

      sponsors.organizationArray = trimArray(teamRow.nameFull.split("/").pop().split("&"));

      if (!sponsors.sponsorArray && !sponsors.organizationArray && !sponsors.organization) {
        sponsors.organization = "No organization in TIMS";
        sponsors.sponsors = "No sponsors in TIMS";
        sponsors.topSponsorsArray[0] = sponsors.sponsors
      }

      if (sponsors.sponsorArray.length === 1) {
        sponsors.sponsors = sponsors.sponsorArray[0];
        sponsors.topSponsors = sponsors.sponsors
      } else {
        if (sponsors.organizationArray.length > 1 && !sponsors.organization) {
          sponsors.sponsorArray.pop();
          sponsors.sponsorArray.push(sponsors.organizationArray.slice(0).shift())
        }
        sponsors.topSponsorsArray = sponsors.sponsorArray.slice(0, 5);
        sponsors.lastSponsor = sponsors.sponsorArray.pop();
        sponsors.sponsors = sponsors.sponsorArray.join(", ");
        sponsors.sponsors += " & " + sponsors.lastSponsor;
        sponsors.lastSponsor = sponsors.topSponsorsArray.pop();
        sponsors.topSponsors = sponsors.topSponsorsArray.join(", ");
        sponsors.topSponsors += " & " + sponsors.lastSponsor;
      }

      if (sponsors.organizationArray.length === 1 && !sponsors.organization) {
        sponsors.organization = sponsors.organizationArray[0]
      } else {
        if (!sponsors.organization) {
          sponsors.organizationArray.shift();
          sponsors.organization = sponsors.organizationArray.join(" & ")
        }
      }

      teamRow.sponsors = sponsors.sponsors;
      teamRow.topSponsors = sponsors.topSponsors;
      teamRow.organization = sponsors.organization;
      return teamRow;
    })

    teams.teams = teamListSponsorsFixed

    teams.lastUpdate = moment();
    setTeamList(teams);
    setTeamDataTabReady(TabStates.Ready);
  }

  // This function retrieves communnity updates for a specified event from gatool Cloud.
  async function getCommunityUpdates() {
    setTeamDataTabReady(TabStates.NotReady);
    var result = await httpClient.get(`${selectedYear?.value}/communityUpdates/${selectedEvent?.value.code}`);
    var teams = await result.json();

    teams.lastUpdate = moment();
    setCommunityUpdates(teams);
    setTeamDataTabReady(TabStates.Ready);
  }

  // This function retrieves the ranking data for a specified event from FIRST.
  async function getRanks() {
    setRanksTabReady(TabStates.NotReady);
    var result = await httpClient.get(`${selectedYear?.value}/rankings/${selectedEvent?.value.code}`);
    var ranks = await result.json();

    ranks.lastUpdate = moment();
    setRankings(ranks);
    setRanksTabReady(TabStates.Ready);
  }

  // This function retrieves the Playoff Alliance data for a specified event from FIRST.
  async function getAlliances() {
    var result = await httpClient.get(`${selectedYear?.value}/alliances/${selectedEvent?.value.code}`);
    var alliances = await result.json();
    var allianceLookup = {};
    alliances.Alliances.forEach(alliance => {
      allianceLookup[`${alliance.captain}`] = { role: `Captain`, alliance: `Alliance ${alliance.number}` };
      allianceLookup[`${alliance.round1}`] = { role: `Round 1 Selection`, alliance: `Alliance ${alliance.number}` };
      allianceLookup[`${alliance.round2}`] = { role: `Round 2 Selection`, alliance: `Alliance ${alliance.number}` };
      if (alliance.round3) { allianceLookup[`${alliance.round3}`] = { role: `Round 3 Selection`, alliance: `Alliance ${alliance.number}` }; }
      if (alliance.backup) { allianceLookup[`${alliance.backup}`] = { role: `Backup for ${alliance.backupReplaced}`, alliance: `Alliance ${alliance.number}` }; }
    })
    alliances.Lookup = allianceLookup;

    alliances.lastUpdate = moment();
    setAlliances(alliances);
  }

  // Retrieve event list when year selection changes
  useEffect(() => {
    async function getEvents() {
      try {
        const val = await httpClient.get(`${selectedYear?.value}/events`);
        const json = await val.json();
        var timeNow = moment();

        const events = json?.Events.map((e) => {
          var color = "";
          var optionPrefix = "";
          var optionPostfix = "";
          var filters = [];
          var eventTime = moment(e.dateEnd);
          e.name = e.name.trim();
          e.name = _.replace(e.name, `- FIRST Robotics Competition -`, `-`);
          if (e.type === "OffSeasonWithAzureSync") {
            color = paleBlue;
            optionPrefix = "•• ";
            optionPostfix = " ••";
            filters.push("offseason");
          }
          if (e.type === "OffSeason") {
            color = paleYellow;
            optionPrefix = "•• ";
            optionPostfix = " ••";
            filters.push("offseason");
          }
          if (e.type.startsWith("Regional")) {
            filters.push("regional");
          } else if (e.type.startsWith("Champion")) {
            filters.push("champs");
          } else if (e.type.startsWith("District")) {
            filters.push("district");
            filters.push(e.districtCode);
          }
          if (timeNow.diff(eventTime) < 0) {
            filters.push("future")
          } else {
            filters.push("past")
          }
          filters.push("week" + e.weekNumber);

          return {
            value: e,
            label: `${optionPrefix}${e.name}${optionPostfix}`,
            color: color,
            filters: filters
          };
        });

        setEvents(events);
        if (!_.some(events, selectedEvent)) {
          setSelectedEvent(null);
        }

      } catch (e) {
        console.error(e)
      }

    }
    if (httpClient && selectedYear) {
      getEvents()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, httpClient, setSelectedEvent, setEvents])

  // Reset the event data when the selectedEvent changes
  useEffect(() => {
    if (!selectedEvent) {
      setPlayoffSchedule(null);
      setQualSchedule(null);
      setTeamList(null);
      setRankings(null);
      setScheduleTabReady(TabStates.NotReady);
      setTeamDataTabReady(TabStates.NotReady);
      setRanksTabReady(TabStates.NotReady);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEvent])

  // Retrieve schedule, team list, community updates, andrankings when event selection changes
  useEffect(() => {

    if (httpClient && selectedEvent && selectedYear) {
      setQualSchedule(null);
      setPlayoffSchedule(null);
      setTeamList(null);
      setRankings(null);
      getSchedule();
      getTeamList();
      getCommunityUpdates();
      getRanks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [httpClient, selectedEvent])

  return (
    <div className="App">
      {isLoading ? <div className="vertical-center">
        <Container>
          <Blocks visible height="200" width="" ariaLabel="blocks-loading" />
        </Container>
      </div> :
        isAuthenticated ? <BrowserRouter>
          <Routes>
            <Route path="/" element={<LayoutsWithNavbar scheduleTabReady={scheduleTabReady} teamDataTabReady={teamDataTabReady} ranksTabReady={ranksTabReady} />}>

              <Route path="/" element={<SetupPage selectedEvent={selectedEvent} setSelectedEvent={setSelectedEvent} setSelectedYear={setSelectedYear} selectedYear={selectedYear} eventList={events} teamList={teamList} eventFilters={eventFilters} setEventFilters={setEventFilters} timeFilter={timeFilter} setTimeFilter={setTimeFilter} qualSchedule={qualSchedule} playoffSchedule={playoffSchedule} rankings={rankings} timeFormat={timeFormat} setTimeFormat={setTimeFormat} showSponsors={showSponsors} setShowSponsors={setShowSponsors} showAwards={showAwards} setShowAwards={setShowAwards} showNotes={showNotes} setShowNotes={setShowNotes} showMottoes={showMottoes} setShowMottoes={setShowMottoes} showChampsStats={showChampsStats} setShowChampsStats={setShowChampsStats} swapScreen={swapScreen} setSwapScreen={setSwapScreen} autoAdvance={autoAdvance} setAutoAdvance={setAutoAdvance} getSchedule={getSchedule}/>} />

              <Route path="/schedule" element={<SchedulePage selectedEvent={selectedEvent} playoffSchedule={playoffSchedule} qualSchedule={qualSchedule} />} />

              <Route path="/teamdata" element={<TeamDataPage selectedEvent={selectedEvent} selectedYear={selectedYear} teamList={teamList} rankings={rankings} teamSort={teamSort} setTeamSort={setTeamSort} communityUpdates={communityUpdates} allianceCount={getAllianceCount()} />} />

              <Route path='/ranks' element={<RanksPage selectedEvent={selectedEvent} teamList={teamList} rankings={rankings} rankSort={rankSort} setRankSort={setRankSort} communityUpdates={communityUpdates} allianceCount={getAllianceCount()} />} />

              <Route path='/announce' element={<AnnouncePage teamList={teamList} rankings={rankings} communityUpdates={communityUpdates} currentMatch={currentMatch} setCurrentMatch={setCurrentMatch}/>} />
              <Route path='/playbyplay' element={<PlayByPlayPage />} />
              <Route path='/allianceselection' element={<AllianceSelectionPage selectedEvent={selectedEvent} playoffSchedule={playoffSchedule} alliances={alliances} />} />
              <Route path='/awards' element={<AwardsPage />} />
              <Route path='/stats' element={<StatsPage />} />
              <Route path='/cheatsheet' element={<CheatsheetPage />} />
              <Route path='/emcee' element={<EmceePage />} />
              <Route path='/help' element={<HelpPage />} />
              <Route path='/dev' element={<Developer />} />
            </Route>
          </Routes>
        </BrowserRouter> : <AnonymousUserPage />}
    </div>
  );
}

export default App;
