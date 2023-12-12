// @ts-nocheck
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import AuthWidget from './AuthWidget';
import { NavLink } from 'react-router-dom';
import { Calendar3, CardList, Eye, Flag, Gear, Gift, HandThumbsUp, Megaphone, QuestionOctagon, SortNumericDown, Speedometer, Trophy, WifiOff } from 'react-bootstrap-icons';
import { TabStates } from '../App';
import { useOnlineStatus } from '../contextProviders/OnlineContext';
import { useEffect, useState } from 'react';

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

const tabActiveReadyOffline = {
  backgroundColor: "rgba(255, 211, 51, 1.0)",
  boxShadow: "inset 0px 0px 5px 2px #3d85c6"
}

const tabActiveStale = {
  backgroundColor: "rgba(255, 153, 51, 1.0)",
  boxShadow: "inset 0px 0px 5px 2px #3d85c6"
}

const tabInactive = {
  textDecoration: "none"
}

const tabInactiveReady = {
  backgroundColor: "rgba(144, 238, 144, 0.5)",
  textDecoration: "none"
}

const tabInactiveReadyOffline = {
  backgroundColor: "rgba(255, 211, 51, 0.5)",
  textDecoration: "none"
}

const tabInactiveStale = {
  backgroundColor: "rgba(255, 153, 51, 0.5)",
  textDecoration: "none"
}

const tabInactiveNotready = {
  backgroundColor: "rgba(255, 109, 109, 0.5)",
  textDecoration: "none"
}

function MainNavigation({ selectedEvent, qualSchedule, playoffs, teamList, communityUpdates,
  rankings, eventHighScores, worldHighScores, allianceSelectionReady }) {
  const [scheduleTabReady, setScheduleTabReady] = useState(TabStates.NotReady)
  const [teamDataTabReady, setTeamDataTabReady] = useState(TabStates.NotReady)
  const [ranksTabReady, setRanksTabReady] = useState(TabStates.NotReady)
  const [statsTabReady, setStatsTabReady] = useState(TabStates.NotReady)
  const isOnline = useOnlineStatus();

  function getTabStyle(active, state) {
    if (state === null) { // tab has no ready state
      if (active) return tabActive;
      else return tabInactive;
    } else if (state === TabStates.Ready) { // tab is ready
      if (!isOnline) {
        if (active) return tabActiveReadyOffline;
        else return tabInactiveReadyOffline;
      } else {
        if (active) return tabActiveReady;
        else return tabInactiveReady;
      }
    } else if (state === TabStates.NotReady) { // tab is not ready
      if (active) return tabActiveNotready;
      else return tabInactiveNotready;
    } else if (state === TabStates.Stale) { // tab may contain stale data
      if (active) return tabActiveStale;
      else return tabInactiveStale;
    }
  }

  // Handle ready state for schedule tab
  useEffect(() => {
    // GREEN: Event Selected, Qual Schedule loaded, has >0 matches in the array
    // YELLOW: Event Selected, Qual Schedule loaded, has 0 matches in the array
    // RED: Event Selected, No qual schedule loaded

    if (selectedEvent && qualSchedule && qualSchedule.schedule.length > 0) {
      setScheduleTabReady(TabStates.Ready)
    } else if (selectedEvent && qualSchedule && qualSchedule.schedule?.length === 0) {
      setScheduleTabReady(TabStates.Stale)
    } else {
      setScheduleTabReady(TabStates.NotReady)
    }
  }, [qualSchedule, selectedEvent])

  // Handle ready state for the team data tab
  useEffect(() => {
    // GREEN: Event Selected, teams loaded, Community updates for the event loaded
    // YELLOW: Event Selected, Teams loaded, no Community updates loaded
    // RED: Event Selected, No teams loaded

    if (selectedEvent && teamList && communityUpdates) {
      setTeamDataTabReady(TabStates.Ready)
    } else if (selectedEvent && teamList && communityUpdates == null) {
      setTeamDataTabReady(TabStates.Stale)
    } else {
      setTeamDataTabReady(TabStates.NotReady)
    }
  }, [selectedEvent, teamList, communityUpdates])

  // Handle ready state for the ranks tab
  useEffect(() => {
    // GREEN: Event Selected, Ranks loaded, rankings array >0 in length
    // YELLOW: Event Selected, Ranks loaded, rankings array empty
    // RED: Event Selected, Ranks not loaded

    if (selectedEvent && rankings && rankings.ranks.length > 0) {
      setRanksTabReady(TabStates.Ready)
    } else if (selectedEvent && rankings && rankings.ranks.length === 0) {
      setRanksTabReady(TabStates.Stale)
    } else {
      setRanksTabReady(TabStates.NotReady)
    }
  }, [selectedEvent, rankings])

  // Handle ready state for the stats tab
  useEffect(() => {
    // GREEN: Event Selected, World High Scores available, Event High Scores available
    // YELLOW: Event Selected, World High Scores Available, no matches complete for selected event
    // RED: Event Selected, no world high scores available

    if (selectedEvent && eventHighScores?.overallqual && worldHighScores) {
      setStatsTabReady(TabStates.Ready)
    } else if (selectedEvent && worldHighScores) {
      setStatsTabReady(TabStates.Stale)
    } else {
      setStatsTabReady(TabStates.NotReady)
    }
  }, [selectedEvent, eventHighScores, worldHighScores])

  return (
    <>
      <Navbar bg="light" sticky='top' style={{ color: "black" }}>
        <Nav className="me-auto">
          <Nav.Link id={"setupPage"} as={NavLink} style={({ isActive }) => getTabStyle(isActive, null)} to="/"><Gear /><div className='d-none d-md-block navBarText'>Setup</div></Nav.Link>
          <Nav.Link id={"schedulePage"} as={NavLink} style={({ isActive }) => getTabStyle(isActive, scheduleTabReady)} to="/schedule"><Calendar3 /><div className='d-none d-md-block navBarText'>Schedule</div></Nav.Link>
          <Nav.Link id={"teamsPage"} as={NavLink} style={({ isActive }) => getTabStyle(isActive, teamDataTabReady)} to="/teamdata"><CardList /><div className='d-none d-md-block navBarText'>Teams</div></Nav.Link>
          <Nav.Link id={"ranksPage"} as={NavLink} style={({ isActive }) => getTabStyle(isActive, ranksTabReady)} to="/ranks"><SortNumericDown /><div className='d-none d-md-block navBarText'>Ranks</div></Nav.Link>
          <Nav.Link id={"announcePage"} as={NavLink} style={({ isActive }) => getTabStyle(isActive, scheduleTabReady)} to="/announce"><Megaphone /><div className='d-none d-md-block navBarText'>Announce</div></Nav.Link>
          <Nav.Link id={"playByPlayPage"} as={NavLink} style={({ isActive }) => getTabStyle(isActive, scheduleTabReady)} to="/playbyplay"><Speedometer /><div className='d-none d-md-block navBarText'>Play-by-Play</div></Nav.Link>
          <Nav.Link id={"allianceSelectionPage"} as={NavLink} style={({ isActive }) => getTabStyle(isActive, allianceSelectionReady)} to="/allianceselection"><HandThumbsUp /><div className='d-none d-md-block navBarText'>{playoffs ? "Playoffs" : "Alliance Selection"}</div></Nav.Link>
          <Nav.Link id={"awardsPage"} as={NavLink} style={({ isActive }) => getTabStyle(isActive, teamDataTabReady)} to="/awards"><Trophy /><div className='d-none d-md-block navBarText'>Awards</div></Nav.Link>
          <Nav.Link id={"statsPage"} as={NavLink} style={({ isActive }) => getTabStyle(isActive, statsTabReady)} to="/stats"><Flag /><div className='d-none d-md-block navBarText'>Stats</div></Nav.Link>
          <Nav.Link id={"cheatSheetPage"} as={NavLink} style={({ isActive }) => getTabStyle(isActive, null)} to="/cheatsheet"><Eye /><div className='d-none d-md-block navBarText'>Cheat Sheet</div></Nav.Link>
          <Nav.Link id={"emceePage"} as={NavLink} style={({ isActive }) => getTabStyle(isActive, null)} to="/emcee"><Gift /><div className='d-none d-md-block navBarText'>Emcee #s</div></Nav.Link>
          <Nav.Link as={NavLink} className='d-none d-md-block navBarText' style={({ isActive }) => getTabStyle(isActive, null)} to="https://github.com/arthurlockman/gatool-ui/wiki" target="_blank" rel="noopener noreferrer"><QuestionOctagon /><div className='d-none d-md-block navBarText'>Help</div></Nav.Link>
        </Nav>
        {
          !isOnline &&
          <WifiOff style={{
            color: 'red',
            marginRight: '5px',
            height: "31px",
            width: "31px"
          }} />
        }
        <AuthWidget />
      </Navbar>
    </>
  );
}

export default MainNavigation;