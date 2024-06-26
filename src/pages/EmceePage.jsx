import { Alert, Col, Container, Row } from "react-bootstrap";
import _ from "lodash";
import PlayoffDetails from "../components/PlayoffDetails";
import { useHotkeys } from "react-hotkeys-hook";
import { useSwipeable } from "react-swipeable";
import useWindowDimensions from "hooks/UseWindowDimensions";
import EmceeClock from "components/EmceeClock";
import moment from "moment";

function EmceePage({ selectedEvent, playoffSchedule, qualSchedule, practiceSchedule, offlinePlayoffSchedule, alliances, currentMatch, nextMatch, previousMatch, reverseEmcee, timeFormat, hidePracticeSchedule, getSchedule, usePullDownToUpdate, useSwipe, eventLabel, playoffCountOverride }) {
    const { height, width } = useWindowDimensions();
    const matchClasses = [
        { "matchNumber": 1, "red": { "class": "success", "from": null }, "blue": { "class": "success", "from": null }, "winnerTo": 7, "loserTo": 5, "winnerVs": "blue", "loserVs": "blue" },
        { "matchNumber": 2, "red": { "class": "success", "from": null }, "blue": { "class": "success", "from": null }, "winnerTo": 7, "loserTo": 5, "winnerVs": "red", "loserVs": "red" },
        { "matchNumber": 3, "red": { "class": "success", "from": null }, "blue": { "class": "success", "from": null }, "winnerTo": 8, "loserTo": 6, "winnerVs": "blue", "loserVs": "blue" },
        { "matchNumber": 4, "red": { "class": "success", "from": null }, "blue": { "class": "success", "from": null }, "winnerTo": 8, "loserTo": 6, "winnerVs": "red", "loserVs": "red" },
        { "matchNumber": 5, "red": { "class": "davidPriceWarning", "from": "Lost M1" }, "blue": { "class": "davidPriceWarning", "from": "Lost M2" }, "winnerTo": 10, "loserTo": null, "winnerVs": "red", "loserVs": null },
        { "matchNumber": 6, "red": { "class": "davidPriceWarning", "from": "Lost M3" }, "blue": { "class": "davidPriceWarning", "from": "Lost M4" }, "winnerTo": 9, "loserTo": null, "winnerVs": "red", "loserVs": null },
        { "matchNumber": 7, "red": { "class": "success", "from": "Won M1" }, "blue": { "class": "success", "from": "Won M2" }, "winnerTo": 11, "loserTo": 9, "winnerVs": "blue", "loserVs": "blue" },
        { "matchNumber": 8, "red": { "class": "success", "from": "Won M3" }, "blue": { "class": "success", "from": "Won M4" }, "winnerTo": 11, "loserTo": 10, "winnerVs": "red", "loserVs": "blue" },
        { "matchNumber": 9, "red": { "class": "davidPriceWarning", "from": "Lost M7" }, "blue": { "class": "davidPriceWarning", "from": "Won M6" }, "winnerTo": 12, "loserTo": null, "winnerVs": "red", "loserVs": null },
        { "matchNumber": 10, "red": { "class": "davidPriceWarning", "from": "Lost M8" }, "blue": { "class": "davidPriceWarning", "from": "Won M5" }, "winnerTo": 12, "loserTo": null, "winnerVs": "blue", "loserVs": null },
        { "matchNumber": 11, "red": { "class": "success", "from": "Won M7" }, "blue": { "class": "success", "from": "Won M8" }, "winnerTo": 14, "loserTo": 13, "winnerVs": "blue", "loserVs": "blue" },
        { "matchNumber": 12, "red": { "class": "davidPriceWarning", "from": "Won M10" }, "blue": { "class": "davidPriceWarning", "from": "Won M9" }, "winnerTo": 13, "loserTo": null, "winnerVs": "red", "loserVs": null },
        { "matchNumber": 13, "red": { "class": "davidPriceWarning", "from": "Lost M11" }, "blue": { "class": "davidPriceWarning", "from": "Won M12" }, "winnerTo": 14, "loserTo": null, "winnerVs": "red", "loserVs": null }
    ]
    var schedule = [];
    var qualMatchLength = 0;
    if ((practiceSchedule?.schedule?.schedule?.length > 0 || practiceSchedule?.schedule?.length > 0) && (qualSchedule?.schedule?.length === 0 || qualSchedule?.schedule?.schedule?.length === 0)) {
        schedule = practiceSchedule?.schedule?.schedule || practiceSchedule?.schedule;
    }
    if ((practiceSchedule?.schedule?.schedule?.length > 0 || practiceSchedule?.schedule?.length > 0) && (qualSchedule?.schedule?.length > 0 || qualSchedule?.schedule?.schedule?.length > 0)) {
        var firstMatch = typeof qualSchedule.schedule?.schedule !== "undefined" ? qualSchedule.schedule?.schedule[0] : qualSchedule?.schedule[0]
        if (moment().isBefore(moment(firstMatch.startTime).subtract(20, "minutes")) && !hidePracticeSchedule) {
            schedule = practiceSchedule?.schedule?.schedule || practiceSchedule?.schedule;
        }
    }
    qualMatchLength = schedule.length;
    if (offlinePlayoffSchedule?.schedule?.length > 0) {
        schedule = _.concat(schedule, offlinePlayoffSchedule?.schedule);
    }

    if (qualSchedule?.schedule.length > 0) {
        schedule = _.concat(schedule, qualSchedule?.schedule);
        qualMatchLength = schedule.length;
    }

    if (playoffSchedule?.schedule?.length > 0) {
        schedule = _.concat(schedule, playoffSchedule?.schedule);
    }
    var inPlayoffs = false;
    var playoffMatchNumber = -1;
    var scores = [];
    var matches = offlinePlayoffSchedule?.schedule || playoffSchedule?.schedule?.schedule || playoffSchedule?.schedule || [];

    if (selectedEvent?.value?.type === "Championship" || selectedEvent?.value?.type === "DistrictChampionshipWithLevels") {
        inPlayoffs = true;
    }

    // returns the name of the alliance
    function allianceName(matchNumber, allianceColor) {
        var allianceName = "";
        var captain = ";"
        var allianceShortName = "";
        if (matches[_.findIndex(matches, { "matchNumber": matchNumber })]?.teams[0]?.teamNumber) {
            allianceName = alliances?.Lookup[`${matches[_.findIndex(matches, { "matchNumber": matchNumber })]?.teams[0]?.teamNumber}`]?.alliance || alliances?.Lookup[`${matches[_.findIndex(matches, { "matchNumber": matchNumber })]?.teams[1]?.teamNumber}`]?.alliance || alliances?.Lookup[`${matches[_.findIndex(matches, { "matchNumber": matchNumber })]?.teams[2]?.teamNumber}`]?.alliance;
            captain = alliances?.Lookup[`${matches[_.findIndex(matches, { "matchNumber": matchNumber })]?.teams[0]?.teamNumber}`]?.captain || alliances?.Lookup[`${matches[_.findIndex(matches, { "matchNumber": matchNumber })]?.teams[1]?.teamNumber}`]?.captain || alliances?.Lookup[`${matches[_.findIndex(matches, { "matchNumber": matchNumber })]?.teams[2]?.teamNumber}`]?.captain;
            if (matchNumber < 14) {
                if (matches[_.findIndex(matches, { "matchNumber": matchNumber })]?.winner?.tieWinner === "red") {
                    allianceName += ` (L${matches[_.findIndex(matches, { "matchNumber": matchNumber })]?.winner.level})`;
                }
            }
            if (allianceColor === "blue") {
                allianceName = alliances?.Lookup[`${matches[_.findIndex(matches, { "matchNumber": matchNumber })]?.teams[3]?.teamNumber}`]?.alliance || alliances?.Lookup[`${matches[_.findIndex(matches, { "matchNumber": matchNumber })]?.teams[4]?.teamNumber}`]?.alliance || alliances?.Lookup[`${matches[_.findIndex(matches, { "matchNumber": matchNumber })]?.teams[5]?.teamNumber}`]?.alliance;
                captain = alliances?.Lookup[`${matches[_.findIndex(matches, { "matchNumber": matchNumber })]?.teams[3]?.teamNumber}`]?.captain || alliances?.Lookup[`${matches[_.findIndex(matches, { "matchNumber": matchNumber })]?.teams[4]?.teamNumber}`]?.captain || alliances?.Lookup[`${matches[_.findIndex(matches, { "matchNumber": matchNumber })]?.teams[5]?.teamNumber}`]?.captain;
                if (matchNumber < 14) {
                    if (matches[_.findIndex(matches, { "matchNumber": matchNumber })]?.winner?.tieWinner === "blue") {
                        allianceName += ` (L${matches[_.findIndex(matches, { "matchNumber": matchNumber })]?.winner.level} WIN)`;
                    }
                }
            }
        }

        allianceShortName = allianceName?.replace("Alliance ", "").length === 1 ? allianceName.replace("Alliance ", "")?.slice(0, 1) : allianceName?.slice(0, 2);

        if (!allianceName) {
            return { "allianceName": "?", "captain": "TBD", "shortName": "?" };
        } else {
            return { "allianceName": allianceName, "captain": captain, "shortName": allianceShortName };
        }
    }

    var advantage = {};
    advantage.red = 0;
    advantage.blue = 0;
    var opponent = { "winner": null, "loser": null };

    if (currentMatch > qualMatchLength) {
        inPlayoffs = true;
        playoffMatchNumber = playoffSchedule?.schedule[currentMatch - qualMatchLength - 1]?.matchNumber || offlinePlayoffSchedule?.schedule[currentMatch - qualMatchLength - 1]?.matchNumber;
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
        if (playoffMatchNumber < 14) {
            var winnerMatch = matches[_.findIndex(matches, { "matchNumber": _.filter(matchClasses, { "matchNumber": playoffMatchNumber })[0]?.winnerTo })];
            var winnerOpponent = {};
            winnerOpponent.alliance = _.filter(matchClasses, { "matchNumber": playoffMatchNumber })[0]?.winnerVs;
            if (winnerOpponent.alliance === 'blue') {
                winnerOpponent.lookup = 3
            } else if (winnerOpponent.alliance === 'red') {
                winnerOpponent.lookup = 0
            } else {
                winnerOpponent.lookup = -1
            }
            var loserMatch = matches[_.findIndex(matches, { "matchNumber": _.filter(matchClasses, { "matchNumber": playoffMatchNumber })[0]?.loserTo })];
            var loserOpponent = {};
            loserOpponent.alliance = _.filter(matchClasses, { "matchNumber": playoffMatchNumber })[0]?.loserVs;
            if (loserOpponent.alliance === 'blue') {
                loserOpponent.lookup = 3
            } else if (loserOpponent.alliance === 'red') {
                loserOpponent.lookup = 0
            } else {
                loserOpponent.lookup = -1
            }

            if (winnerOpponent.lookup >= 0) {
                opponent.winner = alliances?.Lookup[`${winnerMatch?.teams[winnerOpponent.lookup].teamNumber}`]?.alliance;
            }
            if (loserOpponent.lookup >= 0) {
                opponent.loser = alliances?.Lookup[`${loserMatch?.teams[loserOpponent.lookup].teamNumber}`]?.alliance;
            }
        }
    }

    _.forEach(schedule, (match) => {
        _.forEach(match?.teams, (team) => {
            var row = {};
            row.teamNumber = team.teamNumber;
            row.alliance = team.station.substring(0, team.station.length - 1);
            row.score = match[`score${row.alliance}Final`];
            row.level = match.level;
            row.description = match.description;
            row.alliancePartners = _.filter(match?.teams, function (o) { return o.station.substring(0, team.station.length - 1) === row.alliance }).map((q) => {
                return q.teamNumber;
            })
            scores.push(row);
        })
    })

    var matchDetails = _.filter(matches, { "matchNumber": playoffMatchNumber })[0] || _.filter(schedule, { "matchNumber": currentMatch })[0];

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const swipeHandlers = useSwipe ? useSwipeable(
        {
            onSwipedLeft: () => {
                nextMatch();
            },
            onSwipedRight: () => {
                previousMatch();
            },
            onSwipedDown: () => {
                if (usePullDownToUpdate) {
                    getSchedule();
                }
                
            },
            preventScrollOnSwipe: true,
        }
    ) : {}

    useHotkeys('right', () => nextMatch(), { scopes: 'matchNavigation' });
    useHotkeys('left', () => previousMatch(), { scopes: 'matchNavigation' });

    const smallScreen = width * height <= 786500 ? "Small" : "";
    const portrait = width > height && smallScreen === "Small" ? "Landscape" : "";


    return (
        <Container fluid>
            {!selectedEvent && <div>
                <Alert variant="warning" >You need to select an event before you can see anything here.</Alert>
            </div>}
            {selectedEvent && (!schedule || schedule?.length === 0) && <div>
                <Alert variant="warning" ><div><img src="loadingIcon.gif" alt="Loading data..." /></div>Awaiting schedule data for {eventLabel}</Alert>
            </div>}
            {selectedEvent && (schedule?.length > 0) && !inPlayoffs &&
                <Container fluid {...swipeHandlers} style={{ textAlign: "center", padding: "7px" }}>
                    <EmceeClock matchDetails={matchDetails} timeFormat={timeFormat} />
                    <div className={`davidPriceQuals`}>{schedule[currentMatch - 1]?.matchNumber}</div>
                </Container>
            }
            {selectedEvent && (schedule?.length > 0) && inPlayoffs &&
                <>
                    <Container fluid {...swipeHandlers}>
                        <EmceeClock matchDetails={matchDetails} timeFormat={timeFormat} />
                        <Row>
                            <Col className={`davidPriceDetail${smallScreen}${portrait}`} xs={12}>{_.replace(schedule[currentMatch - 1]?.description, "(R", "(Round ") || ""}</Col>
                        </Row>
                        {!reverseEmcee && <Row>
                            {(playoffMatchNumber <= 13) && <Col xs={2} className={`davidPriceDetail${smallScreen}${portrait} redAllianceTeam`}>
                                {_.filter(matchClasses, { "matchNumber": playoffMatchNumber })[0]?.red.from ? _.filter(matchClasses, { "matchNumber": playoffMatchNumber })[0]?.red.from : ""}
                            </Col>}
                            <Col xs={(playoffMatchNumber > 13) ? 6 : 4} className={`redAllianceTeam`}>
                                <div className={`davidPrice${smallScreen}`}>{allianceName(schedule[currentMatch - 1]?.matchNumber, "red")?.shortName || ""}</div>
                                <div className={`davidPriceDetail${smallScreen}${portrait} davidPriceCaptain`}>C: {allianceName(schedule[currentMatch - 1]?.matchNumber, "red")?.captain}</div>
                            </Col>
                            <Col xs={(playoffMatchNumber > 13) ? 6 : 4} className={`blueAllianceTeam`}>
                                <div className={`davidPrice${smallScreen}`}>{allianceName(schedule[currentMatch - 1]?.matchNumber, "blue")?.shortName || ""}</div>
                                <div className={`davidPriceDetail${smallScreen}${portrait} davidPriceCaptain`}>C: {allianceName(schedule[currentMatch - 1]?.matchNumber, "blue")?.captain}</div>
                            </Col>
                            {(playoffMatchNumber <= 13) && <Col xs={2} className={`davidPriceDetail${smallScreen}${portrait} blueAllianceTeam`}>
                                {_.filter(matchClasses, { "matchNumber": playoffMatchNumber })[0]?.blue.from ? _.filter(matchClasses, { "matchNumber": playoffMatchNumber })[0]?.blue.from : ""}
                            </Col>}
                        </Row>}

                        {reverseEmcee && <Row>
                            {(playoffMatchNumber <= 13) && <Col xs={2} className={`davidPriceDetail${smallScreen}${portrait} blueAllianceTeam`}>
                                {_.filter(matchClasses, { "matchNumber": playoffMatchNumber })[0]?.blue.from ? _.filter(matchClasses, { "matchNumber": playoffMatchNumber })[0]?.blue.from : ""}
                            </Col>}
                            <Col xs={(playoffMatchNumber > 13) ? 6 : 4} className={`blueAllianceTeam`}>
                                <div className={`davidPrice${smallScreen}`}>{allianceName(schedule[currentMatch - 1]?.matchNumber, "blue")?.shortName || ""}</div>
                                <div className={`davidPriceDetail${smallScreen}${portrait} davidPriceCaptain`}>C: {allianceName(schedule[currentMatch - 1]?.matchNumber, "blue")?.captain}</div>
                            </Col>
                            <Col xs={(playoffMatchNumber > 13) ? 6 : 4} className={`redAllianceTeam`}>
                                <div className={`davidPrice${smallScreen}`}>{allianceName(schedule[currentMatch - 1]?.matchNumber, "red")?.shortName || ""}</div>
                                <div className={`davidPriceDetail${smallScreen}${portrait} davidPriceCaptain`}>C: {allianceName(schedule[currentMatch - 1]?.matchNumber, "red")?.captain}</div>
                            </Col>
                            {(playoffMatchNumber <= 13) && <Col xs={2} className={`davidPriceDetail${smallScreen}${portrait} redAllianceTeam`}>
                                {_.filter(matchClasses, { "matchNumber": playoffMatchNumber })[0]?.red.from ? _.filter(matchClasses, { "matchNumber": playoffMatchNumber })[0]?.red.from : ""}
                            </Col>}
                        </Row>}

                        <Row>
                            <Col xs={12} className={`davidPriceDetail${smallScreen}${portrait}`}>
                                <PlayoffDetails matchDetails={matchDetails} alliances={alliances} matches={matches} selectedEvent={selectedEvent} playoffCountOverride={playoffCountOverride} />
                            </Col>
                        </Row>
                    </Container>
                </>

            }

        </Container>
    )
}

export default EmceePage;