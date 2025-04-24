import { Row, Col, Button } from "react-bootstrap";
import FoulButtons from "./FoulButtons";
import { CaretLeftFill, CaretRightFill } from "react-bootstrap-icons";
import PlayoffDetails from "../components/PlayoffDetails";


function BottomButtons({ previousMatch, nextMatch, matchDetails, playoffSchedule, eventHighScores, alliances, selectedEvent, adHocMode, playoffCountOverride }) {
    var matches = playoffSchedule?.schedule;
    var eventHighScore = eventHighScores?.highscores?.overallqual;
    if (eventHighScores?.highscores?.overallqual?.score < eventHighScores?.highscores?.overallplayoff?.score) {
        eventHighScore = eventHighScores?.highscores?.overallplayoff;
    }


    return (
        <>
            <Row style={{ "paddingTop": "10px" }}>
                <Col xs={"2"} lg={"3"}>
                    {!adHocMode && <Button size="lg" variant="outline-success" className={"gatool-button buttonNoWrap"} onClick={previousMatch}><span className={"d-none d-lg-block"}><CaretLeftFill /> Previous Match</span><span className={"d-block d-lg-none"}><CaretLeftFill /> <CaretLeftFill /></span></Button>}
                </Col>
                {matchDetails?.tournamentLevel === "Playoff" && <Col xs={eventHighScore?.score? "5" : "8"} lg={eventHighScore?.score ? "4" : "6"} className={"playoffDetails"}>
                    <PlayoffDetails matchDetails={matchDetails} alliances={alliances} matches={matches} selectedEvent={selectedEvent} playoffCountOverride={playoffCountOverride} />
                </Col>}

                {matchDetails?.tournamentLevel !== "Playoff" && eventHighScore?.score && <Col xs={"8"} lg={"6"}><p><b>Event High Score: {eventHighScore?.score}<br />
                    in {eventHighScore?.matchName}<br />
                    ({eventHighScore?.allianceMembers})</b></p></Col>}

                {matchDetails?.tournamentLevel === "Playoff" && eventHighScore?.score && <Col xs={"3"} lg={"2"}><p><b>Event High Score: {eventHighScore?.score}<br />
                    in {eventHighScore?.matchName}<br />
                    ({eventHighScore?.allianceMembers})</b></p></Col>}

                {matchDetails?.tournamentLevel !== "Playoff" && !eventHighScore && <Col xs={"8"} lg={"6"}><h4>{matchDetails?.description}</h4></Col>}

                <Col xs={"2"} lg={"3"}>
                    {!adHocMode && <Button size="lg" variant="outline-success" className={"gatool-button buttonNoWrap"} onClick={nextMatch}><span className={"d-none d-lg-block"}>Next Match <CaretRightFill /></span><span className={"d-block d-lg-none"}><CaretRightFill /> <CaretRightFill /></span></Button>}
                </Col>
            </Row>
            <Row><FoulButtons currentYear={selectedEvent?.year}/></Row>
            <Row> <br /><br /><br /></Row>
        </>
    )
}

export default BottomButtons;