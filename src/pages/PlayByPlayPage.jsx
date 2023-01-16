import Select from "react-select";
import { Alert, Container, Row, Col, Button } from "react-bootstrap";
import React from "react";
import _ from "lodash";
import { rankHighlight } from "../components/HelperFunctions";
import { CaretLeftFill, CaretRightFill } from "react-bootstrap-icons";
import PlayByPlay from "../components/PlayByPlay";

const paleGreen = "rgba(144, 238, 144, 0.5)"
var displayOrder = ["Blue1", "Red3", "Blue2", "Red2", "Blue3", "Red1", "Blue4", "Red4"];

function PlayByPlayPage({ selectedEvent, selectedYear, teamList, rankings, communityUpdates, currentMatch, setCurrentMatch, playoffSchedule, qualSchedule, allianceCount, alliances, getSchedule, getRanks,showNotes, showMottoes, showQualsStats }) {

    function updateTeamDetails(station, matchDetails) {
        var team = matchDetails?.teams[_.findIndex(matchDetails?.teams, { "station": station })];
        team = _.merge(team,
            teamList?.teams[_.findIndex(teamList?.teams, { "teamNumber": team?.teamNumber })],
            rankings?.ranks[_.findIndex(rankings?.ranks, { "teamNumber": team?.teamNumber })],
            communityUpdates[_.findIndex(communityUpdates, { "teamNumber": team?.teamNumber })]
        );
        team.rankStyle = rankHighlight(team?.rank, allianceCount || 8);
        team.alliance = alliances?.Lookup[`${team?.teamNumber}`]?.alliance || null;
        team.allianceRole = alliances?.Lookup[`${team?.teamNumber}`]?.role || null;

        return team;
    }

    var schedule = qualSchedule?.schedule || [];
    var inPlayoffs = false;
    if (playoffSchedule?.schedule.length > 0) {
        schedule = _.concat(qualSchedule?.schedule, playoffSchedule?.schedule);
    }
    if (currentMatch > qualSchedule?.schedule.length) {
        inPlayoffs = true;
    }
    var scores = [];
    _.forEach(schedule, (match) => {
        _.forEach(match.teams,(team)=>{
            var row = {};
            row.teamNumber = team.teamNumber;
            row.alliance=team.station.substring(0,team.station.length-1);
            row.score = match[`score${row.alliance}Final`];
            row.level = match.level;
            row.description = match.description;
            row.alliancePartners = _.filter(match.teams, function(o) {return o.station.substring(0,team.station.length-1)===row.alliance}).map((q) =>{
                return q.teamNumber;
            })
            scores.push(row);
        })
    })

    teamList?.teams.forEach((team,index) => {
        teamList.teams[index].highScore = _.orderBy(_.filter(scores, { "teamNumber": team.teamNumber }),"score", "desc")[0];
    }
    )

    const matchDetails = schedule[currentMatch - 1];
    const matchMenu = schedule.map((match, index) => {
        var tag = `${match.description} of ${qualSchedule.schedule.length}`;
        if (match.tournamentLevel === "Playoff") {
            tag = match.description;
        }
        return { "value": index + 1, "label": tag, "color": match.scoreRedFinal ? paleGreen : "" }
    })

    var teamDetails = [];
    if (teamList && matchDetails) {
        //fill in the team details
        displayOrder.forEach((station) => {
            teamDetails[station] = updateTeamDetails(station, matchDetails)
        })
    }

    function nextMatch() {
        if (currentMatch < schedule.length) {
            setCurrentMatch(currentMatch + 1);
            getSchedule();
            getRanks();
        }
    }
    function previousMatch() {
        if (currentMatch > 1) {
            setCurrentMatch(currentMatch - 1);
            getSchedule();
            getRanks();
        }
    }

    function setMatchFromMenu(e) {
        setCurrentMatch(e.value);
        getSchedule();
        getRanks();
    }

    return (

        <Container fluid>
            {!selectedEvent && !teamList &&
                <div>
                    <Alert variant="warning" >You need to select an event before you can see anything here.</Alert>
                </div>}
            {selectedEvent && teamList && schedule.length === 0 &&
                <div>
                    <Alert variant="warning" ><div><img src="loadingIcon.gif" alt="Loading data..." /></div>Awaiting schedule data for {selectedEvent.label}</Alert>
                </div>}
            {selectedEvent && teamList && schedule.length > 0 &&
                <div className={"container container-fluid"} style={{ display: "block" }}>
                    <Row>
                        <Col ><Button size="large" variant="outline-success" onClick={previousMatch}><CaretLeftFill /><span className="d-none d-lg-block"> Previous Match</span></Button></Col>
                        <Col ><Select options={matchMenu} value={currentMatch ? matchMenu[currentMatch - 1] : matchMenu[0]} onChange={setMatchFromMenu} styles={{
                            option: (styles, { data }) => {
                                return {
                                    ...styles,
                                    backgroundColor: data.color,
                                    color: "black"
                                };
                            },
                        }} /></Col>
                        <Col ><Button size="large" variant="outline-success" onClick={nextMatch}><span className="d-none d-lg-block">Next Match </span><CaretRightFill /></Button></Col>
                    </Row>
                    <div id="playByPlayDisplay" className={"gatool-playbyplay"} style={{ display: "block" }}>
                        <table className={"playByPlayTable"}>
                            <tbody><tr id="playByPlayRow1" className={"row"}>
                                <PlayByPlay station={displayOrder[0]} team={teamDetails[displayOrder[0]]} inPlayoffs={inPlayoffs} key={displayOrder[0]} selectedYear={selectedYear} selectedEvent={selectedEvent} showNotes={showNotes} showMottoes={showMottoes} showQualsStats={showQualsStats}/>
                                <PlayByPlay station={displayOrder[1]} team={teamDetails[displayOrder[1]]} inPlayoffs={inPlayoffs} key={displayOrder[1]} selectedYear={selectedYear} selectedEvent={selectedEvent} showNotes={showNotes} showMottoes={showMottoes} showQualsStats={showQualsStats}/>
                            </tr>
                                <tr id="playByPlayRow2" className={"row"}>
                                    <PlayByPlay station={displayOrder[2]} team={teamDetails[displayOrder[2]]} inPlayoffs={inPlayoffs} key={displayOrder[2]} selectedYear={selectedYear} selectedEvent={selectedEvent} showNotes={showNotes} showMottoes={showMottoes} showQualsStats={showQualsStats}/>
                                    <PlayByPlay station={displayOrder[3]} team={teamDetails[displayOrder[3]]} inPlayoffs={inPlayoffs} key={displayOrder[3]} selectedYear={selectedYear} selectedEvent={selectedEvent} showNotes={showNotes} showMottoes={showMottoes} showQualsStats={showQualsStats}/>
                                </tr>
                                <tr id="playByPlayRow3" className={"row"}>
                                    <PlayByPlay station={displayOrder[4]} team={teamDetails[displayOrder[4]]} inPlayoffs={inPlayoffs} key={displayOrder[4]} selectedYear={selectedYear} selectedEvent={selectedEvent} showNotes={showNotes} showMottoes={showMottoes} showQualsStats={showQualsStats}/>
                                    <PlayByPlay station={displayOrder[5]} team={teamDetails[displayOrder[5]]} inPlayoffs={inPlayoffs} key={displayOrder[5]} selectedYear={selectedYear} selectedEvent={selectedEvent} showNotes={showNotes} showMottoes={showMottoes} showQualsStats={showQualsStats}/>
                                </tr>
                                <tr id="playByPlayRow4" className={"row champsDisplay"} >
                                    <td className={"col2 blueAlliancePlayByPlay"} align="center" >
                                        <p id="blue4PlaybyPlayteamNumber" className={"playByPlayteamNumber"}>blue4 </p>
                                        <p id="blue4PlayByPlaysayNumber" className={"playByPlaysayNumber"}>one two three</p>
                                        <p id="blue4PlayByPlayOrganization" className={"playByPlayOrganization"}>organization</p>
                                        <p id="blue4PlayByPlayCity" className={"playByPlayCity"}>city</p>
                                        <p id="blue4PlayByPlayMotto" className={"playByPlayCity mottoes"}>Motto</p>
                                        <p id="blue4PlayByPlayAlliance" className={"playByPlayAlliance"}></p>
                                    </td>
                                    <td className={"col4 blueAlliancePlayByPlay"} >
                                        <p id="blue4PlaybyPlayTeamName" className={"playByPlayTeamName playByPlayTeamNameStats"}>blue4 Team Name</p>
                                        <p id="blue4PlaybyPlayRobotName" className={"playByPlayRobotName"}>blue4 Robot Name</p>
                                        <p id="blue4WinLossTie" className={"playByPlayWinLossTie text-center"}>win-loss-tie</p>
                                        <p id="blue4PlaybyPlayNotes" className={"notes playByPlayWinLossTie"}>blue4 Notes</p>
                                    </td>
                                    <td className={"col2 redAlliancePlayByPlay"} align="center" >
                                        <p id="red4PlaybyPlayteamNumber" className={"playByPlayteamNumber"}>red4</p>
                                        <p id="red4PlayByPlaysayNumber" className={"playByPlaysayNumber"}>one two three</p>
                                        <p id="red4PlayByPlayOrganization" className={"playByPlayOrganization"}>organization</p>
                                        <p id="red4PlayByPlayCity" className={"playByPlayCity"}>city</p>
                                        <p id="red4PlayByPlayMotto" className={"playByPlayCity mottoes"}>Motto</p>
                                        <p id="red4PlayByPlayAlliance" className={"playByPlayAlliance"}></p>
                                    </td>
                                    <td className={"col4 redAlliancePlayByPlay"} >
                                        <p id="red4PlaybyPlayTeamName" className={"playByPlayTeamName playByPlayTeamNameStats"}>red4 Team Name</p>
                                        <p id="red4PlaybyPlayRobotName" className={"playByPlayRobotName"}>red4 Robot Name</p>
                                        <p id="red4WinLossTie" className={"playByPlayWinLossTie text-center"}>win-loss-tie</p>
                                        <p id="red4PlaybyPlayNotes" className={"notes playByPlayWinLossTie"}>red4 Notes</p>
                                    </td>
                                </tr>
                            </tbody></table>
                        <Row><Col><Button onClick={previousMatch}><CaretLeftFill /> Previous Match</Button></Col>
                            <Col><h4>{matchDetails?.description}</h4></Col>
                            <Col><Button onClick={nextMatch}>Next Match <CaretRightFill /></Button></Col></Row>
                        <Row> <br /><br /></Row>
                    </div>
                </div>}
        </Container>
    )
}

export default PlayByPlayPage;