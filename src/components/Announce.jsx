import { Row, Col, Container, Alert, Button } from 'react-bootstrap';
import moment from "moment/moment";
import _ from "lodash";

function Announce({ allianceColor, team, currentMatch, rankDetails }) {

    return (
        <><Row className={`gatool-announce ${allianceColor}Alliance`} >
            <Col className={"col2"}>
                <span id="red1TeamNumber" className={"announceTeamNumber"} ><b>341</b></span><br />
                <span id="red1sayNumber">one two three<br /></span>
                <span id="red1RookieYear">2000 (23rd season)</span>
                <p id="red1Alliance" className={"announceAlliance"}></p>
            </Col>
            <Col className={"col3"} >
                <span id="red1TeamName" className={"teamName"}>Miss Daisy</span><br />
                <span id="red1CityState">Ambler, Pennsylvania</span><br />
                <span id="red1RobotName" className={"robotName"}></span><br />
                <span id="red1Motto" className={"mottoes"}></span><br />
                <span id="red1Champs" className={"champs"}></span>
            </Col>
            <Col className={"col6"} >
                <p className={"announceOrganization"}>Wissahickon High School</p>
                <p className={"sponsors"} id="red1Sponsors">Comcast NBCUniversal, The Boeing Company, Lockheed Martin, BAE Systems &amp; Computer Components Corporation</p>
                <p id="red1HOF" className={`HOF${allianceColor}`}>2010 Breakaway! Chairman's Award</p>
                <p id="red1Awards" className={"awards"}><span className={"awardHilight"}>2022 <span className={"awardsEventName"}>FMA District Springside Chestnut Hill Academy Event</span>: District Event Winner</span></p>
                <p id="red1Notes" className={"notes"}></p>
            </Col>
            <Col className={"col1 ranking"} id="red1Rank" >17</Col>
        </Row>
        </>
    )
}

export default Announce;