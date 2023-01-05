import Announce from "../components/Announce";
import { Alert, Container, Row, Col, Button } from "react-bootstrap";
import React from "react";
import _ from "lodash";
import { rankHighlight } from "../components/HelperFunctions";


function AnnouncePage({ selectedEvent, teamList, rankings, communityUpdates, currentMatch, setCurrentMatch, playoffSchedule, qualSchedule, allianceCount }) {
    function updateTeamDetails(station, matchDetails) {
        var team = matchDetails?.teams[_.findIndex(matchDetails?.teams, { "station": station })];
        team = _.merge(team,
            teamList?.teams[_.findIndex(teamList?.teams, { "teamNumber": team?.teamNumber })],
            rankings?.ranks[_.findIndex(rankings?.ranks, { "teamNumber": team?.teamNumber })],
            communityUpdates[_.findIndex(communityUpdates, { "teamNumber": team?.teamNumber })]
        );
        team.rankStyle = rankHighlight(team?.rank, allianceCount || 8);
        return team;
    }

    var schedule = qualSchedule?.schedule || [];
    var inPlayoffs = false;
    if (playoffSchedule?.schedule.length > 0) {
        schedule = _.concat(qualSchedule?.schedule, playoffSchedule?.schedule);
        inPlayoffs = true;
    }
    const matchDetails = schedule[currentMatch - 1];
    var displayOrder = ["Red1","Red2","Red3","Blue1","Blue2","Blue3"];
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
        }
    }
    function previousMatch() {
        if (currentMatch > 1) {
            setCurrentMatch(currentMatch - 1);
        }
    }
    

    return (
        <Container fluid >
            {!selectedEvent && !teamList && <div>
                <Alert variant="warning" >You need to select an event before you can see anything here.</Alert>
            </div>}
            {selectedEvent && teamList && !qualSchedule && <div>
                <Alert variant="warning" >Awaiting schedule data for {selectedEvent.label}</Alert>
            </div>}
            {selectedEvent && teamList && (qualSchedule || playoffSchedule) && <Container fluid>
                <Row>
                    <Col><Button onClick={previousMatch}>Previous Match</Button></Col>
                    <Col><h4>{matchDetails.description}</h4></Col>
                    <Col><Button onClick={nextMatch}>Next Match</Button></Col>
                </Row>
                {displayOrder.forEach((station)=>{
                    <Announce station={station} team={teamDetails[station]} inPlayoffs={inPlayoffs}/>
                })}
                
            </Container>
            }

        </Container>
    )
}

export default AnnouncePage;