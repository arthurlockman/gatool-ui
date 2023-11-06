
import { Alert, Container, Row, Col } from "react-bootstrap";
import StatsMatch from "../components/StatsMatch";

function StatsPage({ worldStats, selectedEvent, eventHighScores, eventNamesCY }) {

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
                            <table className="table table-condensed gatool-worldHighScores" style={{backgroundColor: "#f2dede"}}>
                                <thead>
                                    <tr>
                                        <td style={{backgroundColor: "#f2dede"}} colSpan={2}>World High Scores {worldStats?.year}</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr >
                                        <StatsMatch highScores={worldStats?.highscores} matchType={"penaltyFreequal"} matchName={"Qual (no penalties)"} eventNamesCY={eventNamesCY} tableType={"world"}/>
                                        <StatsMatch highScores={worldStats?.highscores} matchType={"penaltyFreeplayoff"} matchName={"Playoff (no penalties)"} eventNamesCY={eventNamesCY} tableType={"world"}/>
                                    </tr>
                                    <tr>
                                        <StatsMatch highScores={worldStats?.highscores} matchType={"offsettingqual"} matchName={"Qual (offsetting penalties)"} eventNamesCY={eventNamesCY} tableType={"world"}/>
                                        <StatsMatch highScores={worldStats?.highscores} matchType={"offsettingplayoff"} matchName={"Playoff (offsetting penalties)"} eventNamesCY={eventNamesCY} tableType={"world"}/>
                                    </tr>
                                    <tr>
                                        <StatsMatch highScores={worldStats?.highscores} matchType={"overallqual"} matchName={"Qual (incl. penalties)"} eventNamesCY={eventNamesCY} tableType={"world"}/>
                                        <StatsMatch highScores={worldStats?.highscores} matchType={"overallplayoff"} matchName={"Playoff (incl. penalties)"} eventNamesCY={eventNamesCY} tableType={"world"}/>
                                    </tr>
                                </tbody>
                            </table>
                        </Col>
                        <Col xs={"12"} sm={"6"}>
                            <table className="table table-condensed gatool-eventHighScores">
                                <thead>
                                    <tr>
                                        <td colSpan={2} style={{backgroundColor: "#d9edf7"}}>Event High Scores: {selectedEvent.label}</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <StatsMatch highScores={eventHighScores} matchType={"penaltyFreequal"} matchName={"Qual (no penalties)"} eventNamesCY={eventNamesCY} tableType={"event"}/>
                                        <StatsMatch highScores={eventHighScores} matchType={"penaltyFreeplayoff"} matchName={"Playoff (no penalties)"} eventNamesCY={eventNamesCY}  tableType={"event"}/>
                                    </tr>
                                    <tr>
                                        <StatsMatch highScores={eventHighScores} matchType={"offsettingqual"} matchName={"Qual (offsetting penalties)"} eventNamesCY={eventNamesCY}  tableType={"event"}/>
                                        <StatsMatch highScores={eventHighScores} matchType={"offsettingplayoff"} matchName={"Playoff (offsetting penalties)"} eventNamesCY={eventNamesCY}  tableType={"event"}/>
                                    </tr>
                                    <tr>
                                        <StatsMatch highScores={eventHighScores} matchType={"overallqual"} matchName={"Qual (incl. penalties)"} eventNamesCY={eventNamesCY}  tableType={"event"}/>
                                        <StatsMatch highScores={eventHighScores} matchType={"overallplayoff"} matchName={"Playoff (incl. penalties)"} eventNamesCY={eventNamesCY}  tableType={"event"}/>
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