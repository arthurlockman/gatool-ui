import { Row, Col, Button } from "react-bootstrap";
import { CaretLeftFill, CaretRightFill, ArrowRight } from "react-bootstrap-icons";
import _ from "lodash";


function BottomButtons({ previousMatch, nextMatch, matchDetails, playoffSchedule}) {
    const matchClasses = [
        { "matchNumber": 1, "red": { "class": "success", "from": null }, "blue": { "class": "success", "from": null }, "winnerTo": 7, "loserTo": 5 },
        { "matchNumber": 2, "red": { "class": "success", "from": null }, "blue": { "class": "success", "from": null }, "winnerTo": 7, "loserTo": 5 },
        { "matchNumber": 3, "red": { "class": "success", "from": null }, "blue": { "class": "success", "from": null }, "winnerTo": 8, "loserTo": 6 },
        { "matchNumber": 4, "red": { "class": "success", "from": null }, "blue": { "class": "success", "from": null }, "winnerTo": 8, "loserTo": 6 },
        { "matchNumber": 5, "red": { "class": "davidPriceWarning", "from": "Lost M1" }, "blue": { "class": "davidPriceWarning", "from": "Lost M2" }, "winnerTo": 10, "loserTo": null },
        { "matchNumber": 6, "red": { "class": "davidPriceWarning", "from": "Lost M3" }, "blue": { "class": "davidPriceWarning", "from": "Lost M4" }, "winnerTo": 9, "loserTo": null },
        { "matchNumber": 7, "red": { "class": "success", "from": "Won M1" }, "blue": { "class": "success", "from": "Won M2" }, "winnerTo": 11, "loserTo": 9 },
        { "matchNumber": 8, "red": { "class": "success", "from": "Won M3" }, "blue": { "class": "success", "from": "Won M4" }, "winnerTo": 11, "loserTo": 10 },
        { "matchNumber": 9, "red": { "class": "davidPriceWarning", "from": "Lost M7" }, "blue": { "class": "davidPriceWarning", "from": "Won M6" }, "winnerTo": 12, "loserTo": null },
        { "matchNumber": 10, "red": { "class": "davidPriceWarning", "from": "Lost M8" }, "blue": { "class": "davidPriceWarning", "from": "Won M5" }, "winnerTo": 12, "loserTo": null },
        { "matchNumber": 11, "red": { "class": "success", "from": "Won M7" }, "blue": { "class": "success", "from": "Won M8" }, "winnerTo": 14, "loserTo": 13 },
        { "matchNumber": 12, "red": { "class": "davidPriceWarning", "from": "Won M10" }, "blue": { "class": "davidPriceWarning", "from": "Won M9" }, "winnerTo": 13, "loserTo": null },
        { "matchNumber": 13, "red": { "class": "davidPriceWarning", "from": "Lost M11" }, "blue": { "class": "davidPriceWarning", "from": "Won M12" }, "winnerTo": 14, "loserTo": null }
    ]
    var matches=playoffSchedule?.schedule;

    return (
        <>
            <Row style={{ "paddingTop": "10px" }}>
                <Col xs={"3"}>
                    <Button size="large" variant="outline-success" className={"gatool-button buttonNoWrap"} onClick={previousMatch}><span className={"d-none d-lg-block"}><CaretLeftFill /> Previous Match</span><span className={"d-block d-lg-none"}><CaretLeftFill /> <CaretLeftFill /></span></Button>
                </Col>
                {matchDetails.tournamentLevel === "Playoff" && <Col xs={"6"} className={"playoffDetails"}>
                    {(matchDetails.matchNumber <= 13) && <>Winner <ArrowRight /> {_.filter(matchClasses, { "matchNumber": matchDetails.matchNumber })[0]?.winnerTo <= 13 ? `Match ${_.filter(matchClasses, { "matchNumber": matchDetails.matchNumber })[0]?.winnerTo}` : "Finals"}<br />
                        Loser {_.filter(matchClasses, { "matchNumber": matchDetails.matchNumber })[0]?.loserTo ? <><ArrowRight /> Match {_.filter(matchClasses, { "matchNumber": matchDetails.matchNumber })[0]?.loserTo} </> : " eliminated"} </>}
                    {(matchDetails.matchNumber === 14) && <>FINALS MATCH 1</>}
                    {(matchDetails.matchNumber === 15) && <span className={`${matches[_.findIndex(matches, { "matchNumber": matchDetails.matchNumber - 1 })]?.winner.winner}AllianceTeam`}>FINALS MATCH 2<br />ADVANTAGE {_.matches[_.findIndex(matches, { "matchNumber": matchDetails.matchNumber - 1 })]?.winner.tieWinner ? `${_.upperCase(matches[_.findIndex(matches, { "matchNumber": matchDetails.matchNumber - 1 })]?.winner.tieWinner)} (L${matches[_.findIndex(matches, { "matchNumber": matchDetails.matchNumber - 1 })]?.winner.level})` : _.upperCase(matches[_.findIndex(matches, { "matchNumber": matchDetails.matchNumber - 1 })]?.winner.winner)}</span>}
                    {(matchDetails.matchNumber === 16) && <span className={"tieAllianceTeam"}>FINALS TIEBREAKER</span>}


                </Col>}
                {matchDetails.tournamentLevel !== "Playoff" && <Col xs={"6"}><h4>{matchDetails?.description}</h4></Col>}
                <Col xs={"3"}>
                    <Button size="large" variant="outline-success" className={"gatool-button buttonNoWrap"} onClick={nextMatch}><span className={"d-none d-lg-block"}>Next Match <CaretRightFill /></span><span className={"d-block d-lg-none"}><CaretRightFill /> <CaretRightFill /></span></Button>
                </Col>
            </Row>
            <Row> <br /><br /><br /></Row>
        </>
    )
}

export default BottomButtons;