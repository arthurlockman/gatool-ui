import { Alert, Col, Container, Row } from "react-bootstrap";
import _ from "lodash";
import { ArrowRight } from "react-bootstrap-icons";
import { useHotkeys } from "react-hotkeys-hook";

function EmceePage({ selectedEvent, playoffSchedule, qualSchedule, alliances, currentMatch, nextMatch, previousMatch }) {
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
    var schedule = qualSchedule?.schedule || [];
    var inPlayoffs = false;
    var playoffMatchNumber = -1;
    var scores = [];
    var matches = playoffSchedule?.schedule;

    // returns the name of the alliance
    function allianceName(matchNumber, allianceColor) {
        var allianceName = "";
        if (matches[_.findIndex(matches, { "matchNumber": matchNumber })]?.teams[0]?.teamNumber) {
            allianceName = alliances?.Lookup[`${matches[_.findIndex(matches, { "matchNumber": matchNumber })]?.teams[0]?.teamNumber}`]?.alliance;
            if (matchNumber < 14) {
                if (matches[_.findIndex(matches, { "matchNumber": matchNumber })]?.winner.tieWinner === "red") {
                    allianceName += ` (L${matches[_.findIndex(matches, { "matchNumber": matchNumber })]?.winner.level})`;
                }
            }
            if (allianceColor === "blue") {
                allianceName = alliances?.Lookup[`${matches[_.findIndex(matches, { "matchNumber": matchNumber })]?.teams[3]?.teamNumber}`]?.alliance
                if (matchNumber < 14) {
                    if (matches[_.findIndex(matches, { "matchNumber": matchNumber })]?.winner.tieWinner === "blue") {
                        allianceName += ` (L${matches[_.findIndex(matches, { "matchNumber": matchNumber })]?.winner.level} WIN)`;
                    }
                }
            }
        }
        return allianceName;
    }

    if (playoffSchedule?.schedule?.length > 0) {
        schedule = _.concat(qualSchedule?.schedule, playoffSchedule?.schedule);
    }

    var advantage = {};
    advantage.red = 0;
    advantage.blue = 0;

    if (currentMatch > qualSchedule?.schedule?.length) {
        inPlayoffs = true;
        playoffMatchNumber = currentMatch - qualSchedule?.schedule?.length;
        if (playoffMatchNumber > 14) {
            for (var finalsMatches = 14; finalsMatches < playoffMatchNumber; finalsMatches++) {
                if (matches[_.findIndex(matches, { "matchNumber": finalsMatches })]?.winner.winner === "red") {
                    advantage.red += 1
                }
                if (matches[_.findIndex(matches, { "matchNumber": finalsMatches })]?.winner.winner === "blue") {
                    advantage.blue += 1
                }
            }
        }
    }

    _.forEach(schedule, (match) => {
        _.forEach(match.teams, (team) => {
            var row = {};
            row.teamNumber = team.teamNumber;
            row.alliance = team.station.substring(0, team.station.length - 1);
            row.score = match[`score${row.alliance}Final`];
            row.level = match.level;
            row.description = match.description;
            row.alliancePartners = _.filter(match.teams, function (o) { return o.station.substring(0, team.station.length - 1) === row.alliance }).map((q) => {
                return q.teamNumber;
            })
            scores.push(row);
        })
    })


    useHotkeys('right', () => nextMatch(), { scopes: 'matchNavigation' });
    useHotkeys('left', () => previousMatch(), { scopes: 'matchNavigation' });

    return (
        <Container fluid>
            {!selectedEvent && <div>
                <Alert variant="warning" >You need to select an event before you can see anything here.</Alert>
            </div>}
            {selectedEvent && (!schedule || schedule?.length === 0) && <div>
                <Alert variant="warning" ><div><img src="loadingIcon.gif" alt="Loading data..." /></div>Awaiting schedule data for {selectedEvent.label}</Alert>
            </div>}
            {selectedEvent && (schedule?.length > 0) && !inPlayoffs &&
                <div className={"davidPrice"}>{schedule[currentMatch - 1].matchNumber}</div>
            }
            {selectedEvent && (schedule?.length > 0) && inPlayoffs &&
                <Container fluid>
                    <Row>
                        {(playoffMatchNumber <= 13) && <Col xs={2} className={"davidPriceDetail redAllianceTeam"}>
                            {_.filter(matchClasses, { "matchNumber": playoffMatchNumber })[0]?.red.from ? _.filter(matchClasses, { "matchNumber": playoffMatchNumber })[0]?.red.from : ""}
                        </Col>}
                        <Col xs={(playoffMatchNumber > 13) ? 6 : 4} className={`redAllianceTeam`}>
                            <div className={"davidPrice"}>{allianceName(schedule[currentMatch - 1].matchNumber, "red").replace("Alliance ", "")}</div>
                        </Col>
                        <Col xs={(playoffMatchNumber > 13) ? 6 : 4} className={`blueAllianceTeam`}>
                            <div className={"davidPrice"}>{allianceName(schedule[currentMatch - 1].matchNumber, "blue").replace("Alliance ", "")}</div>
                        </Col>
                        {(playoffMatchNumber <= 13) && <Col xs={2} className={"davidPriceDetail blueAllianceTeam"}>
                            {_.filter(matchClasses, { "matchNumber": playoffMatchNumber })[0]?.blue.from ? _.filter(matchClasses, { "matchNumber": playoffMatchNumber })[0]?.blue.from : ""}
                        </Col>}
                    </Row>
                    <Row>
                        <Col xs={12} className={"davidPriceDetail"}>
                            {(playoffMatchNumber <= 13) && <>Winner <ArrowRight /> {_.filter(matchClasses, { "matchNumber": playoffMatchNumber })[0]?.winnerTo <= 13 ? `M${_.filter(matchClasses, { "matchNumber": playoffMatchNumber })[0]?.winnerTo}` : "Finals"}<br />
                                Losing Alliance {_.filter(matchClasses, { "matchNumber": playoffMatchNumber })[0]?.loserTo ? <><ArrowRight /> M{_.filter(matchClasses, { "matchNumber": playoffMatchNumber })[0]?.loserTo} </> : " eliminated"} </>}
                            {(playoffMatchNumber === 14) && <>FINALS MATCH 1</>}
                            {(playoffMatchNumber === 15) && <span className={`${matches[_.findIndex(matches, { "matchNumber": playoffMatchNumber - 1 })]?.winner.winner}AllianceTeam`}>FINALS MATCH 2<br />
                                {(advantage.red === advantage.blue) && "EVEN"}
                                {(advantage.red > advantage.blue) && "ADVANTAGE RED"}
                                {(advantage.blue > advantage.red) && "ADVANTAGE BLUE"}</span>}
                            {(playoffMatchNumber >= 16) && <span className={(advantage.red > advantage.blue) ? "redAllianceTeam" : (advantage.blue > advantage.red) ? "blueAllianceTeam" : "tieAllianceTeam"}>FINALS TIEBREAKER<br />
                                {(advantage.red === advantage.blue) && "EVEN"}
                                {(advantage.red > advantage.blue) && "ADVANTAGE RED"}
                                {(advantage.blue > advantage.red) && "ADVANTAGE BLUE"}
                            </span>}
                        </Col>
                    </Row>

                </Container>

            }

        </Container>
    )
}

export default EmceePage;