import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import AuthWidget from './AuthWidget';
import { NavLink } from 'react-router-dom';
import { Calendar3, CardList, Eye, Flag, Gear, Gift, HandThumbsUp, Megaphone, QuestionOctagon, SortNumericDown, Speedometer, Trophy } from 'react-bootstrap-icons';

const tabActive = {
  backgroundColor: "#ccc",
  boxShadow: "inset 0px 0px 5px 2px #3d85c6"
}

const tabActiveNotready = {
  backgroundColor: "rgba(255, 109, 109, 1.0)",
  boxShadow: "inset 0px 0px 5px 2px #3d85c6"
}

const tabActiveReady = {
  backgroundColor: "rgba(144, 238, 144, 1.0)",
  boxShadow: "inset 0px 0px 5px 2px #3d85c6"
}

const tabInactive = {
  textDecoration: "none"
}

const tabInactiveReady = {
  backgroundColor: "rgba(144, 238, 144, 0.5)",
  textDecoration: "none"
}

const tabInactiveNotready = {
  backgroundColor: "rgba(255, 109, 109, 0.5)",
  textDecoration: "none"
}

function MainNavigation({scheduleTabReady, teamDataTabReady, ranksTabReady}) {
  function getTabStyle(active, state) {
    if (state === null) { // tab has no ready state
      if (active) return tabActive;
      else return tabInactive;
    } else if (state) { // tab is ready
      if (active) return tabActiveReady;
      else return tabInactiveReady;
    } else if (!state) { // tab is not ready
      if (active) return tabActiveNotready;
      else return tabInactiveNotready;
    }
  }
  return (
    <Navbar bg="light" sticky='top' style={{
      color: "black"
    }}>
      <Nav className="me-auto">
        <Nav.Link as={NavLink} style={({ isActive }) => getTabStyle(isActive, null)} to="/"><Gear /><div className='d-none d-xl-block'>Setup</div></Nav.Link>
        <Nav.Link as={NavLink} style={({ isActive }) => getTabStyle(isActive, scheduleTabReady)} to="/schedule"><Calendar3 /><div className='d-none d-xl-block'>Schedule</div></Nav.Link>
        <Nav.Link as={NavLink} style={({ isActive }) => getTabStyle(isActive, teamDataTabReady)} to="/teamdata"><CardList /><div className='d-none d-xl-block'>Team Data</div></Nav.Link>
        <Nav.Link as={NavLink} style={({ isActive }) => getTabStyle(isActive, ranksTabReady)} to="/ranks"><SortNumericDown /><div className='d-none d-xl-block'>Ranks</div></Nav.Link>
        <Nav.Link as={NavLink} style={({ isActive }) => getTabStyle(isActive, null)} to="/announce"><Megaphone /><div className='d-none d-xl-block'>Announce</div></Nav.Link>
        <Nav.Link as={NavLink} style={({ isActive }) => getTabStyle(isActive, null)} to="/playbyplay"><Speedometer /><div className='d-none d-xl-block'>Play-by-Play</div></Nav.Link>
        <Nav.Link as={NavLink} style={({ isActive }) => getTabStyle(isActive, null)} to="/allianceselection"><HandThumbsUp /><div className='d-none d-xl-block'>Alliance Selection</div></Nav.Link>
        <Nav.Link as={NavLink} style={({ isActive }) => getTabStyle(isActive, null)} to="/awards"><Trophy /><div className='d-none d-xl-block'>Awards</div></Nav.Link>
        <Nav.Link as={NavLink} style={({ isActive }) => getTabStyle(isActive, null)} to="/stats"><Flag /><div className='d-none d-xl-block'>Stats</div></Nav.Link>
        <Nav.Link as={NavLink} style={({ isActive }) => getTabStyle(isActive, null)} to="/cheatsheet"><Eye /><div className='d-none d-xl-block'>Cheat Sheet</div></Nav.Link>
        <Nav.Link as={NavLink} style={({ isActive }) => getTabStyle(isActive, null)} to="/emcee"><Gift /><div className='d-none d-xl-block'>Emcee #s</div></Nav.Link>
        <Nav.Link as={NavLink} style={({ isActive }) => getTabStyle(isActive, null)} to="/help"><QuestionOctagon  /><div className='d-none d-xl-block'>Help</div></Nav.Link>
      </Nav>
      <AuthWidget />
    </Navbar>
  );
}

export default MainNavigation;