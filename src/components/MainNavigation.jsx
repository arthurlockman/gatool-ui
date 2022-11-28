import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import AuthWidget from './AuthWidget';
import { NavLink, Link } from 'react-router-dom';
import { Calendar3, CardList, Eye, Flag, Gear, Gift, HandThumbsUp, List, Megaphone, Question, QuestionOctagon, SortNumericDown, Speedometer, Trophy } from 'react-bootstrap-icons';

const activeStyle = {
  backgroundColor: "#ccc",
  boxShadow: "inset 0px 0px 5px 2px #3d85c6"
}

const inactiveStyle = {
  textDecoration: "none"
}

function MainNavigation({scheduleTabState}) {
  return (
    <Navbar bg="light" sticky='top' style={{
      color: "black"
    }}>
      <Nav className="me-auto">
        <Nav.Link as={NavLink} style={({ isActive }) => isActive ? activeStyle : inactiveStyle} to="/"><Gear /><div className='d-none d-xl-block'>Setup</div></Nav.Link>
        <Nav.Link as={NavLink} style={({ isActive }) => isActive ? activeStyle : inactiveStyle} to="/schedule" className={scheduleTabState ? 'tab-loaded' : 'tab-loading'}><Calendar3 /><div className='d-none d-xl-block'>Schedule</div></Nav.Link>
        <Nav.Link as={NavLink} style={({ isActive }) => isActive ? activeStyle : inactiveStyle} to="/teamdata"><CardList /><div className='d-none d-xl-block'>Team Data</div></Nav.Link>
        <Nav.Link as={NavLink} style={({ isActive }) => isActive ? activeStyle : inactiveStyle} to="/ranks"><SortNumericDown /><div className='d-none d-xl-block'>Ranks</div></Nav.Link>
        <Nav.Link as={NavLink} style={({ isActive }) => isActive ? activeStyle : inactiveStyle} to="/announce"><Megaphone /><div className='d-none d-xl-block'>Announce</div></Nav.Link>
        <Nav.Link as={NavLink} style={({ isActive }) => isActive ? activeStyle : inactiveStyle} to="/playbyplay"><Speedometer /><div className='d-none d-xl-block'>Play-by-Play</div></Nav.Link>
        <Nav.Link as={NavLink} style={({ isActive }) => isActive ? activeStyle : inactiveStyle} to="/allianceselection"><HandThumbsUp /><div className='d-none d-xl-block'>Alliance Selection</div></Nav.Link>
        <Nav.Link as={NavLink} style={({ isActive }) => isActive ? activeStyle : inactiveStyle} to="/awards"><Trophy /><div className='d-none d-xl-block'>Awards</div></Nav.Link>
        <Nav.Link as={NavLink} style={({ isActive }) => isActive ? activeStyle : inactiveStyle} to="/stats"><Flag /><div className='d-none d-xl-block'>Stats</div></Nav.Link>
        <Nav.Link as={NavLink} style={({ isActive }) => isActive ? activeStyle : inactiveStyle} to="/cheatsheet"><Eye /><div className='d-none d-xl-block'>Cheat Sheet</div></Nav.Link>
        <Nav.Link as={NavLink} style={({ isActive }) => isActive ? activeStyle : inactiveStyle} to="/emcee"><Gift /><div className='d-none d-xl-block'>Emcee #s</div></Nav.Link>
        <Nav.Link as={NavLink} style={({ isActive }) => isActive ? activeStyle : inactiveStyle} to="/help"><QuestionOctagon  /><div className='d-none d-xl-block'>Help</div></Nav.Link>
      </Nav>
      <AuthWidget />
    </Navbar>
  );
}

export default MainNavigation;