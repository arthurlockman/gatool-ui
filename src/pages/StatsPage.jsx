
import React from "react";
import { Alert, Container, Row, Col } from "react-bootstrap";
import _ from "lodash";
import StatsMatch from "../components/StatsMatch";

function StatsPage({ worldStats, selectedEvent, eventNames }) {
    var worldHighScores = worldStats?.highscores.map((score) => {
        var details = {};
        details.eventName = eventNames[worldStats?.year][score?.matchData?.event?.eventCode];
        details.alliance = _.upperFirst(score?.matchData?.highScoreAlliance);
        details.scoreType = score?.type + score?.level;
        details.matchName = score?.matchData?.match?.description;
        details.allianceMembers = _.filter(score?.matchData?.match?.teams, function (o) { return _.startsWith(o.station, details.alliance) }).map((team) => { return team.teamNumber }).join(" ")
        details.score = score?.matchData?.match[`score${details.alliance}Final`];
        return details;
    })


    return (
        <Container fluid>
            {!selectedEvent && <div>
                <Alert variant="warning" >You need to select an event before you can see anything here.</Alert>
            </div>}
            {selectedEvent && !worldStats && <div>
                <Alert variant="warning" ><Alert variant="warning" ><div><img src="loadingIcon.gif" alt="Loading data..." /></div>Awaiting stats data for {selectedEvent.label}</Alert></Alert>
            </div>}
            {selectedEvent && worldStats &&
                <Container fluid>
                    <Row>
                        <Col xs={"12"} sm={"6"}>
                            <table className="table table-condensed gatool-worldHighScores alert-danger">
                                <thead>
                                    <tr>
                                        <td colSpan={"2"}>World High Scores {worldStats?.year}</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <StatsMatch highScores={worldHighScores} matchType={"penaltyFreequal"} matchName={"Qual (no penalties)"} />
                                        <StatsMatch highScores={worldHighScores} matchType={"penaltyFreeplayoff"} matchName={"Playoff (no penalties)"} />
                                    </tr>
                                    <tr>
                                        <StatsMatch highScores={worldHighScores} matchType={"offsettingqual"} matchName={"Qual (offsetting penalties)"} />
                                        <StatsMatch highScores={worldHighScores} matchType={"offsettingplayoff"} matchName={"Playoff (offsetting penalties)"} />
                                    </tr>
                                    <tr>
                                    <StatsMatch highScores={worldHighScores} matchType={"overallqual"} matchName={"Qual (incl. penalties)"} />
                                        <StatsMatch highScores={worldHighScores} matchType={"overallplayoff"} matchName={"Playoff (incl. penalties)"} />
                                    </tr>
                                </tbody>
                            </table>
                        </Col>
                        <Col xs={"12"} sm={"6"}>
                            <table className="table table-condensed gatool-worldHighScores alert-info">
                                <thead>
                                    <tr>
                                        <td colSpan={"2"}>Event High Scores: {selectedEvent.label}</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td id="eventHighQualsNoFouls">Qual (no penalties)<br />No matches meet criteria<br /></td>
                                        <td id="eventHighPlayoffNoFouls">Playoff (no penalties)<br />No matches meet criteria</td>
                                    </tr>
                                    <tr>
                                        <td id="eventHighQualsOffsettingFouls">Qual (offsetting penalties)<br />No matches meet criteria<br /></td>
                                        <td id="eventHighPlayoffOffsettingFouls">Playoff (offsetting penalties)<br />No matches meet criteria<br /></td>
                                    </tr>
                                    <tr>
                                        <td id="eventHighQuals">Qual<br />No matches meet criteria<br /></td>
                                        <td id="eventHighPlayoff">Playoff<br />event No matches meet criteria</td>
                                    </tr>
                                </tbody>
                            </table>
                        </Col>
                    </Row>
                </Container>}

        </Container>
    )
}

export default StatsPage;