import Navbar from 'react-bootstrap/Navbar';

function BottomNavigation() {
    return <Navbar fixed="bottom" bg="light">
    <span style={{width: '100%', fontSize: '11px'}}>
    © 2017-{new Date().getFullYear()} Arthur Rosa &amp; James Lockman, <a target="_blank" href="http://www.northernforce.org/" rel="noreferrer">FIRST Robotics Team 172 Northern Force</a> and the <a target="_blank" href="http://gofarmaine.org" rel="noreferrer">Gorham-Falmouth Alliance for Robotics.</a> <a target="_blank" href="https://frc-events.firstinspires.org/services/API" rel="noreferrer">Event Data provided by <i><b>FIRST</b></i>.</a>
    </span>
    </Navbar>;
}

export default BottomNavigation;