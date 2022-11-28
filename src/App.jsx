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

function LayoutsWithNavbar({scheduleTabReady, teamDataTabReady}) {
  return (
    <>
      <MainNavigation scheduleTabReady={scheduleTabReady} teamDataTabReady={teamDataTabReady} />
      <Outlet />
    </>
  );
}

function App() {
  const httpClient = UseAuthClient();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [events, setEvents] = useState([]);
  const [playoffSchedule, setPlayoffSchedule] = useState(null);
  const [qualSchedule, setQualSchedule] = useState(null);
  const [teamList, setTeamList] = useState(null);

  // Tab state trackers - false indicates loading, true indicates good to go
  const [scheduleTabReady, setScheduleTabReady] = useState(false)
  const [teamDataTabReady, setTeamDataTabReady] = useState(false)

  // Retrieve event list when year selection changes
  useEffect(() => {
    async function getData() {
      try {
        setSelectedEvent(null);
        const val = await httpClient.get(`${selectedYear.value}/events`);
        const json = await val.json();
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
      getData()
    }
  }, [selectedYear, httpClient])

  // Retrieve schedule when event selection changes
  useEffect(() => {
    async function getSchedule() {
      setScheduleTabReady(false);
      setQualSchedule(null);
      setPlayoffSchedule(null);
      var result = await httpClient.get(`${selectedYear.value}/schedule/hybrid/${selectedEvent.value.code}/qual`);
      var qualschedule = await result.json();
      setQualSchedule(qualschedule);
      result = await httpClient.get(`${selectedYear.value}/schedule/hybrid/${selectedEvent.value.code}/playoff`);
      var playoffschedule = await result.json();
      setPlayoffSchedule(playoffschedule);
      setScheduleTabReady(true);
      //schedule = qualSchedule;
      //schedule.concat(playoffSchedule);
    }

    async function getTeamList() {
      setTeamList(null);
      setTeamDataTabReady(false);
      var result = await httpClient.get(`${selectedYear.value}/teams?eventCode=${selectedEvent.value.code}`);
      var teams = await result.json();
      setTeamList(teams);
      setTeamDataTabReady(true);
    }

    if (httpClient && selectedEvent && selectedYear) {
      getSchedule();
      getTeamList();
    }
  }, [httpClient, selectedEvent, selectedYear])

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LayoutsWithNavbar scheduleTabReady={scheduleTabReady} teamDataTabReady={teamDataTabReady} />}>
            <Route path="/" element={<SetupPage selectedEvent={selectedEvent} setSelectedEvent={setSelectedEvent} setSelectedYear={setSelectedYear} selectedYear={selectedYear} eventList={events} />} />
            <Route path="/schedule" element={<SchedulePage selectedEvent={selectedEvent} playoffSchedule={playoffSchedule} qualSchedule={qualSchedule} />} />
            <Route path="/teamdata" element={<TeamDataPage selectedEvent={selectedEvent} teamList={teamList}/>} />
            <Route path='/ranks' element={<RanksPage />} />
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
      </BrowserRouter>
    </div>
  );
}

export default App;
