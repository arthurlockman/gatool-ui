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
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [events, setEvents] = useState([]);
  const [playoffSchedule, setPlayoffSchedule] = useState(null);
  const [qualSchedule, setQualSchedule] = useState(null);
  const [teamList, setTeamList] = useState(null);
  const [rankings, setRankings] = useState(null);

  // Tab state trackers - false indicates loading, true indicates good to go
  const [scheduleTabReady, setScheduleTabReady] = useState(false)
  const [teamDataTabReady, setTeamDataTabReady] = useState(false)
  const [ranksTabReady, setRanksTabReady] = useState(false)

  // Data ready trackers for use in pages
  const [eventListReady, setEventListReady] = useState(false)

  // Controllers for table sort order at render time
  const [teamSort, setTeamSort] = useState("")
  const [rankSort, setRankSort] = useState("")

  // Retrieve event list when year selection changes
  useEffect(() => {
    async function getData() {
      try {
        setSelectedEvent(null);
        const val = await httpClient.get(`${selectedYear.value}/events`);
        const json = await val.json();
        setEventListReady(true);
        setEvents(json.Events.map((e) => {
          return {
            value: e,
            label: e.name
          };
        }));
      } catch (e) {
        console.error(e)
      }

    }
    if (httpClient && selectedYear) {
      setEventListReady(false)
      getData()
    }
  }, [selectedYear, httpClient])

  // Retrieve schedule when event selection changes
  useEffect(() => {
    async function getSchedule() {
      setScheduleTabReady(false);
      setTeamDataTabReady(false);
      setRanksTabReady(false);
      setQualSchedule(null);
      setPlayoffSchedule(null);
      setTeamList(null);
      var result = await httpClient.get(`${selectedYear.value}/schedule/hybrid/${selectedEvent.value.code}/qual`);
      var qualschedule = await result.json();
      setQualSchedule(qualschedule);
      result = await httpClient.get(`${selectedYear.value}/schedule/hybrid/${selectedEvent.value.code}/playoff`);
      var playoffschedule = await result.json();
      setPlayoffSchedule(playoffschedule);
      setScheduleTabReady(true);
    }

    async function getTeamList() {
      setTeamList(null);
      setTeamDataTabReady(false);
      var result = await httpClient.get(`${selectedYear.value}/teams?eventCode=${selectedEvent.value.code}`);
      var teams = await result.json();
      setTeamList(teams);
      setTeamDataTabReady(true);
    }

    async function getRanks() {
      setRankings(null);
      setRanksTabReady(false);
      var result = await httpClient.get(`${selectedYear.value}/rankings/${selectedEvent.value.code}`);
      var ranks = await result.json();
      setRankings(ranks);
      setRanksTabReady(true);
    }

    if (httpClient && selectedEvent && selectedYear) {
      getSchedule();
      getTeamList();
      getRanks();
    }
  }, [httpClient, selectedEvent, selectedYear])

  return (
    <div className="App">
      {isLoading ? <div className="vertical-center">
        <Container>
          <Blocks visible height="200" width="" ariaLabel="blocks-loading" />
        </Container>
      </div> :
        isAuthenticated ? <BrowserRouter>
          <Routes>
            <Route path="/" element={<LayoutsWithNavbar scheduleTabReady={scheduleTabReady} teamDataTabReady={teamDataTabReady} eventListready={eventListReady} ranksTabReady={ranksTabReady} />}>
              <Route path="/" element={<SetupPage selectedEvent={selectedEvent} setSelectedEvent={setSelectedEvent} setSelectedYear={setSelectedYear} selectedYear={selectedYear} eventList={events} eventListReady={eventListReady} />} />
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
