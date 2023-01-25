
import React from "react";
import { Alert, Container, Row, Col } from "react-bootstrap";
import StatsMatch from "../components/StatsMatch";

function StatsPage({ worldStats, selectedEvent, eventHighScores }) {

    return (
        <Container fluid>
            {!selectedEvent && <div>
                <Alert variant="warning" >You need to select an event before you can see anything here.</Alert>
            </div>}
            {selectedEvent && !worldStats && <div>
                <Alert variant="warning" ><Alert variant="warning" ><div><img src="loadingIcon.gif" alt="Loading data..." /></div>Awaiting stats data for {selectedEvent.label}</Alert></Alert>
            </div>}
            {selectedEvent && worldStats && eventHighScores &&
                <Container fluid>
                    <Row>
                        <Col xs={"12"} sm={"6"}>
                            <table className="table table-condensed gatool-worldHighScores">
                                <thead>
                                    <tr>
                                        <td colSpan={"2"}>World High Scores {worldStats?.year}</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <StatsMatch highScores={worldStats?.highscores} matchType={"penaltyFreequal"} matchName={"Qual (no penalties)"} />
                                        <StatsMatch highScores={worldStats?.highscores} matchType={"penaltyFreeplayoff"} matchName={"Playoff (no penalties)"} />
                                    </tr>
                                    <tr>
                                        <StatsMatch highScores={worldStats?.highscores} matchType={"offsettingqual"} matchName={"Qual (offsetting penalties)"} />
                                        <StatsMatch highScores={worldStats?.highscores} matchType={"offsettingplayoff"} matchName={"Playoff (offsetting penalties)"} />
                                    </tr>
                                    <tr>
                                        <StatsMatch highScores={worldStats?.highscores} matchType={"overallqual"} matchName={"Qual (incl. penalties)"} />
                                        <StatsMatch highScores={worldStats?.highscores} matchType={"overallplayoff"} matchName={"Playoff (incl. penalties)"} />
                                    </tr>
                                </tbody>
                            </table>
                        </Col>
                        <Col xs={"12"} sm={"6"}>
                            <table className="table table-condensed gatool-eventHighScores">
                                <thead>
                                    <tr>
                                        <td colSpan={"2"}>Event High Scores: {selectedEvent.label}</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <StatsMatch highScores={eventHighScores} matchType={"penaltyFreequal"} matchName={"Qual (no penalties)"} />
                                        <StatsMatch highScores={eventHighScores} matchType={"penaltyFreeplayoff"} matchName={"Playoff (no penalties)"} />
                                    </tr>
                                    <tr>
                                        <StatsMatch highScores={eventHighScores} matchType={"offsettingqual"} matchName={"Qual (offsetting penalties)"} />
                                        <StatsMatch highScores={eventHighScores} matchType={"offsettingplayoff"} matchName={"Playoff (offsetting penalties)"} />
                                    </tr>
                                    <tr>
                                        <StatsMatch highScores={eventHighScores} matchType={"overallqual"} matchName={"Qual (incl. penalties)"} />
                                        <StatsMatch highScores={eventHighScores} matchType={"overallplayoff"} matchName={"Playoff (incl. penalties)"} />
                                    </tr>
                                </tbody>
                            </table>
                        </Col>
                    </Row>
                    <Row> <br /><br /></Row>
                </Container>}

        </Container>
    )
}

export default StatsPage;