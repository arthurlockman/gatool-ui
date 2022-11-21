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
import { useState } from 'react';

function LayoutsWithNavbar() {
  return (
    <>
      <MainNavigation />
      <Outlet />
    </>
  );
}

function App() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path ="/" element={<LayoutsWithNavbar />}>
            <Route path="/" element={<SetupPage selectedEvent={selectedEvent} setSelectedEvent={setSelectedEvent} setSelectedYear={setSelectedYear} selectedYear={selectedYear} />} />
            <Route path="/schedule" element={<SchedulePage selectedEvent={selectedEvent} selectedYear={selectedYear} />} />
            <Route path="/teamdata" element={<TeamDataPage />} />
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
