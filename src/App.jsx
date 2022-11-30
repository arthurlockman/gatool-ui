import './App.css';
import MainNavigation from './components/MainNavigation';
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

export const TabStates = {
  NotReady: 'notready',
  Stale: 'stale',
  Ready: 'ready'
};

function LayoutsWithNavbar({ scheduleTabReady, teamDataTabReady, ranksTabReady }) {
  return (
    <>
      <MainNavigation scheduleTabReady={scheduleTabReady} teamDataTabReady={teamDataTabReady} ranksTabReady={ranksTabReady} />
      <Outlet />
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
  const [rankings, setRankings] = usePersistentState("cache:rankings",null);

  // Tab state trackers
  const [scheduleTabReady, setScheduleTabReady] = useState(TabStates.NotReady)
  const [teamDataTabReady, setTeamDataTabReady] = useState(TabStates.NotReady)
  const [ranksTabReady, setRanksTabReady] = useState(TabStates.NotReady)

  // Controllers for table sort order at render time
  const [teamSort, setTeamSort] = useState("")
  const [rankSort, setRankSort] = useState("")

  // Retrieve event list when year selection changes
  useEffect(() => {
    async function getEvents() {
      try {
        const val = await httpClient.get(`${selectedYear.value}/events`);
        const json = await val.json();
        const events = json.Events.map((e) => {
          return {
            value: e,
            label: e.name
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

  // Retrieve schedule when event selection changes
  useEffect(() => {
    async function getSchedule() {
      setScheduleTabReady(TabStates.NotReady);
      setTeamDataTabReady(TabStates.NotReady);
      setRanksTabReady(TabStates.NotReady);
      var result = await httpClient.get(`${selectedYear.value}/schedule/hybrid/${selectedEvent.value.code}/qual`);
      var qualschedule = await result.json();
      setQualSchedule(qualschedule);
      result = await httpClient.get(`${selectedYear.value}/schedule/hybrid/${selectedEvent.value.code}/playoff`);
      var playoffschedule = await result.json();
      setPlayoffSchedule(playoffschedule);
      setScheduleTabReady(TabStates.Ready);
    }

    async function getTeamList() {
      setTeamDataTabReady(TabStates.NotReady);
      var result = await httpClient.get(`${selectedYear.value}/teams?eventCode=${selectedEvent.value.code}`);
      var teams = await result.json();
      setTeamList(teams);
      setTeamDataTabReady(TabStates.Ready);
    }

    async function getRanks() {
      setRanksTabReady(TabStates.NotReady);
      var result = await httpClient.get(`${selectedYear.value}/rankings/${selectedEvent.value.code}`);
      var ranks = await result.json();
      setRankings(ranks);
      setRanksTabReady(TabStates.Ready);
    }

    if (httpClient && selectedEvent && selectedYear) {
      getSchedule();
      getTeamList();
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
              <Route path="/" element={<SetupPage selectedEvent={selectedEvent} setSelectedEvent={setSelectedEvent} setSelectedYear={setSelectedYear} selectedYear={selectedYear} eventList={events} />} />
              <Route path="/schedule" element={<SchedulePage selectedEvent={selectedEvent} playoffSchedule={playoffSchedule} qualSchedule={qualSchedule} />} />
              <Route path="/teamdata" element={<TeamDataPage selectedEvent={selectedEvent} teamList={teamList} rankings={rankings} teamSort={teamSort} setTeamSort={setTeamSort}/>} />
              <Route path='/ranks' element={<RanksPage selectedEvent={selectedEvent} teamList={teamList} rankings={rankings} rankSort={rankSort} setRankSort={setRankSort}/>} />
              <Route path='/announce' element={<AnnouncePage />} />
              <Route path='/playbyplay' element={<PlayByPlayPage />} />
              <Route path='/allianceselection' element={<AllianceSelectionPage />} />
              <Route path='/awards' element={<AwardsPage />} />
              <Route path='/stats' element={<StatsPage />} />
              <Route path='/cheatsheet' element={<CheatsheetPage />} />
              <Route path='/emcee' element={<EmceePage />} />
              <Route path='/help' element={<HelpPage />} />
            </Route>
          </Routes>
        </BrowserRouter> : <AnonymousUserPage />}
    </div>
  );
}

export default App;
