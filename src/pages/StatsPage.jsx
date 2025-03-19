
import { Alert, Container, Row, Col } from "react-bootstrap";
import StatsMatch from "../components/StatsMatch";
import _ from "lodash";

function StatsPage({ worldStats, selectedEvent, eventHighScores, eventNamesCY, eventLabel, districts }) {
    const eventDistrict = _.filter(districts, { value: selectedEvent?.value?.districtCode })[0];
    return (
        <Container fluid>
            {!selectedEvent && <div>
                <Alert variant="warning" >You need to select an event before you can see anything here.</Alert>
            </div>}
            {selectedEvent && !worldStats && <div>
                <Alert variant="warning" ><Alert variant="warning" ><div><img src="loadingIcon.gif" alt="Loading data..." /></div>Awaiting stats data for {eventLabel}</Alert></Alert>
            </div>}
            {selectedEvent && worldStats &&
                <Container fluid>
                    <Row>
                        <Col xs={"12"} sm={selectedEvent?.value?.districtCode?"4":"6"}>
                            <table className="table table-condensed gatool-worldHighScores" >
                                <thead>
                                    <tr>
                                        <td style={{backgroundColor: "#f2dede"}} colSpan={2}>World High Scores {worldStats?.year}</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr >
                                        <StatsMatch highScores={worldStats?.highscores} matchType={"penaltyFreequal"} matchName={"Qual (no penalties in match)"} eventNamesCY={eventNamesCY} tableType={"world"}/>
                                        <StatsMatch highScores={worldStats?.highscores} matchType={"penaltyFreeplayoff"} matchName={"Playoff (no penalties in match)"} eventNamesCY={eventNamesCY} tableType={"world"}/>
                                    </tr>
                                    <tr >
                                        <StatsMatch highScores={worldStats?.highscores} matchType={"TBAPenaltyFreequal"} matchName={"Qual (no penalties to winner)"} eventNamesCY={eventNamesCY} tableType={"world"}/>
                                        <StatsMatch highScores={worldStats?.highscores} matchType={"TBAPenaltyFreeplayoff"} matchName={"Playoff (no penalties to winner)"} eventNamesCY={eventNamesCY} tableType={"world"}/>
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
                        {selectedEvent?.value?.districtCode && <Col xs={"12"} sm={"4"}>
                            <table className="table table-condensed gatool-districtHighScores" >
                                <thead>
                                    <tr >
                                        <td  colSpan={2} style={{backgroundColor: "#fff5ce"}}>{eventDistrict?.label} High Scores {worldStats?.year}</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr >
                                        <StatsMatch highScores={worldStats?.highscores} matchType={`District${selectedEvent?.value?.districtCode}PenaltyFreequal`} matchName={"Qual (no penalties in match)"} eventNamesCY={eventNamesCY} tableType={"district"}/>
                                        <StatsMatch highScores={worldStats?.highscores} matchType={`District${selectedEvent?.value?.districtCode}PenaltyFreeplayoff`} matchName={"Playoff (no penalties in match)"} eventNamesCY={eventNamesCY} tableType={"district"}/>
                                    </tr>
                                    <tr >
                                        <StatsMatch highScores={worldStats?.highscores} matchType={`District${selectedEvent?.value?.districtCode}TBAPenaltyFreequal`} matchName={"Qual (no penalties to winner)"} eventNamesCY={eventNamesCY} tableType={"district"}/>
                                        <StatsMatch highScores={worldStats?.highscores} matchType={`District${selectedEvent?.value?.districtCode}TBAPenaltyFreeplayoff`} matchName={"Playoff (no penalties to winner)"} eventNamesCY={eventNamesCY} tableType={"district"}/>
                                    </tr>
                                    <tr >
                                        <StatsMatch highScores={worldStats?.highscores} matchType={`District${selectedEvent?.value?.districtCode}offsettingqual`} matchName={"Qual (offsetting penalties)"} eventNamesCY={eventNamesCY} tableType={"district"}/>
                                        <StatsMatch highScores={worldStats?.highscores} matchType={`District${selectedEvent?.value?.districtCode}offsettingplayoff`} matchName={"Playoff (offsetting penalties)"} eventNamesCY={eventNamesCY} tableType={"district"}/>
                                    </tr>
                                    <tr >
                                        <StatsMatch highScores={worldStats?.highscores} matchType={`District${selectedEvent?.value?.districtCode}Overallqual`} matchName={"Qual (incl. penalties)"} eventNamesCY={eventNamesCY} tableType={"district"}/>
                                        <StatsMatch highScores={worldStats?.highscores} matchType={`District${selectedEvent?.value?.districtCode}Overallplayoff`} matchName={"Playoff (incl. penalties)"} eventNamesCY={eventNamesCY} tableType={"district"}/>
                                    </tr>
                                </tbody>
                            </table>
                        </Col>}
                        <Col xs={"12"} sm={selectedEvent?.value?.districtCode?"4":"6"}>
                            <table className="table table-condensed gatool-eventHighScores">
                                <thead>
                                    <tr>
                                        <td colSpan={2} style={{backgroundColor: "#d9edf7"}}>Event High Scores: {eventLabel}</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <StatsMatch highScores={eventHighScores?.highscores} matchType={"penaltyFreequal"} matchName={"Qual (no penalties in match)"} eventNamesCY={eventNamesCY} tableType={"event"}/>
                                        <StatsMatch highScores={eventHighScores?.highscores} matchType={"penaltyFreeplayoff"} matchName={"Playoff (no penalties in match)"} eventNamesCY={eventNamesCY}  tableType={"event"}/>
                                    </tr>
                                    <tr>
                                        <StatsMatch highScores={eventHighScores?.highscores} matchType={"TBAPenaltyFreequal"} matchName={"Qual (no penalties to winner)"} eventNamesCY={eventNamesCY} tableType={"event"}/>
                                        <StatsMatch highScores={eventHighScores?.highscores} matchType={"TBAPenaltyFreeplayoff"} matchName={"Playoff (no penalties to winner)"} eventNamesCY={eventNamesCY}  tableType={"event"}/>
                                    </tr>
                                    <tr>
                                        <StatsMatch highScores={eventHighScores?.highscores} matchType={"offsettingqual"} matchName={"Qual (offsetting penalties)"} eventNamesCY={eventNamesCY}  tableType={"event"}/>
                                        <StatsMatch highScores={eventHighScores?.highscores} matchType={"offsettingplayoff"} matchName={"Playoff (offsetting penalties)"} eventNamesCY={eventNamesCY}  tableType={"event"}/>
                                    </tr>
                                    <tr>
                                        <StatsMatch highScores={eventHighScores?.highscores} matchType={"overallqual"} matchName={"Qual (incl. penalties)"} eventNamesCY={eventNamesCY}  tableType={"event"}/>
                                        <StatsMatch highScores={eventHighScores?.highscores} matchType={"overallplayoff"} matchName={"Playoff (incl. penalties)"} eventNamesCY={eventNamesCY}  tableType={"event"}/>
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