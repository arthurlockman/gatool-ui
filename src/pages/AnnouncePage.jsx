import Announce from "../components/Announce";
import Select from "react-select";
import { Alert, Container, Row, Col, Button } from "react-bootstrap";
import React from "react";
import _ from "lodash";
import { rankHighlight } from "../components/HelperFunctions";
import { CaretLeftFill, CaretRightFill } from "react-bootstrap-icons";

const paleGreen = "rgba(144, 238, 144, 0.5)"

function AnnouncePage({ selectedEvent, selectedYear, teamList, rankings, communityUpdates, currentMatch, setCurrentMatch, playoffSchedule, qualSchedule, allianceCount, alliances, getSchedule, getRanks, awardsMenu, showNotes, showAwards,showSponsors, showMottoes, showChampsStats}) {
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

    const matchDetails = schedule[currentMatch - 1];
    const matchMenu = schedule.map((match, index) => {
        var tag = `${match.description} of ${qualSchedule.schedule.length}`;
        if (match.tournamentLevel === "Playoff") {
            tag = match.description;
        }
        return { "value": index + 1, "label": tag, "color": match.scoreRedFinal ? paleGreen : "" }
    })

    var displayOrder = ["Red1", "Red2", "Red3", "Blue1", "Blue2", "Blue3"];
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
        <Container fluid >
            {!selectedEvent && !teamList && <div>
                <Alert variant="warning" >You need to select an event before you can see anything here.</Alert>
            </div>}
            {selectedEvent && teamList && (!schedule || schedule?.length === 0) && <div>
                <Alert variant="warning" ><div><img src="loadingIcon.gif" alt="Loading data..." /></div>Awaiting schedule data for {selectedEvent.label}</Alert>
            </div>}
            {selectedEvent && teamList?.teams.length>0 && schedule?.length > 0 && 
            <Container fluid>
                <Row>
                    <Col><Button size="large" variant="outline-success" onClick={previousMatch}><CaretLeftFill /> Previous Match</Button></Col>
                    <Col><Select options={matchMenu} value={currentMatch ? matchMenu[currentMatch - 1] : matchMenu[0]} onChange={setMatchFromMenu} styles={{
                        option: (styles, { data }) => {
                            return {
                                ...styles,
                                backgroundColor: data.color,
                                color: "black"
                            };
                        },
                    }} /></Col>
                    <Col><Button size="large" variant="outline-success" onClick={nextMatch}>Next Match <CaretRightFill /></Button></Col>
                </Row>
                <table>
                    <tbody>
                        {displayOrder.map((station) => <Announce station={station} team={teamDetails[station]} inPlayoffs={inPlayoffs} key={station} awardsMenu={awardsMenu} selectedYear={selectedYear} selectedEvent={selectedEvent} showNotes={showNotes} showAwards={showAwards} showSponsors={showSponsors} showMottoes={showMottoes} showChampsStats={showChampsStats}/>)}
                    </tbody></table>
                <Row><Col><Button onClick={previousMatch}><CaretLeftFill /> Previous Match</Button></Col>
                    <Col><h4>{matchDetails?.description}</h4></Col>
                    <Col><Button onClick={nextMatch}>Next Match <CaretRightFill /></Button></Col></Row>
                <Row> <br /><br /></Row>
            </Container>
            }

        </Container>
    )
}

export default AnnouncePage;