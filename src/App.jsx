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

function LayoutsWithNavbar() {
  return (
    <>
      <MainNavigation />
      <Outlet />
    </>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path ="/" element={<LayoutsWithNavbar />}>
            <Route path="/" element={<SetupPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/teamdata" element={<TeamDataPage />} />
            <Route path='/ranks' element={<RanksPage />} />
            <Route path='/announce' element={<AnnouncePage />} />
            <Route path='/playbyplay' element={<PlayByPlayPage />} />
            <Route path='/allianceselection' element={<RanksPage />} />
            <Route path='/awards' element={<RanksPage />} />
            <Route path='/stats' element={<RanksPage />} />
            <Route path='/cheatsheet' element={<RanksPage />} />
            <Route path='/emcee' element={<RanksPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
