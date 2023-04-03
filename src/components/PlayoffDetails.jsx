import { ArrowRight } from "react-bootstrap-icons"
import _ from "lodash";


function PlayoffDetails({ matchDetails, alliances, matches, selectedEvent }) {

    var matchClasses = [
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

    var advantage = {};
    advantage.red = 0;
    advantage.blue = 0;
    var opponent = { "winner": null, "loser": null };
    var elimLimit = 14;

    if (matchDetails?.tournamentLevel === "Playoff") {
        if (selectedEvent?.value?.allianceCount === "FourAlliance") {
            elimLimit = 6;
            matchClasses = [
                {
                    "matchNumber": 1,
                    "red": { "class": "success", "from": null },
                    "blue": { "class": "success", "from": null },
                    "winnerTo": 3,
                    "loserTo": 4,
                    "winnerVs": "blue",
                    "loserVs": "blue"
                },
                {
                    "matchNumber": 2,
                    "red": { "class": "success", "from": null },
                    "blue": { "class": "success", "from": null },
                    "winnerTo": 3,
                    "loserTo": 4,
                    "winnerVs": "red",
                    "loserVs": "red"
                },

                {
                    "matchNumber": 3,
                    "red": { "class": "success", "from": "Won M1" },
                    "blue": { "class": "success", "from": "Won M2" },
                    "winnerTo": 6,
                    "loserTo": 5,
                    "winnerVs": "blue",
                    "loserVs": "blue"
                },
                {
                    "matchNumber": 4,
                    "red": { "class": "davidPriceWarning", "from": "Lost M1" },
                    "blue": { "class": "davidPriceWarning", "from": "Lost M2" },
                    "winnerTo": 5,
                    "loserTo": null,
                    "winnerVs": "red",
                    "loserVs": null
                },
                {
                    "matchNumber": 5,
                    "red": { "class": "davidPriceWarning", "from": "Lost M3" },
                    "blue": { "class": "davidPriceWarning", "from": "Won M4" },
                    "winnerTo": 6,
                    "loserTo": null,
                    "winnerVs": "red",
                    "loserVs": null
                }

            ]

        } else  if (selectedEvent?.value?.allianceCount === "TwoAlliance") {
            elimLimit = 1;
        
        }
        if (matchDetails?.matchNumber > elimLimit) {
            for (var finalsMatches = elimLimit; finalsMatches < matchDetails?.matchNumber; finalsMatches++) {
                if (matches[_.findIndex(matches, { "matchNumber": finalsMatches })]?.winner.winner === "red") {
                    advantage.red += 1
                }
                if (matches[_.findIndex(matches, { "matchNumber": finalsMatches })]?.winner.winner === "blue") {
                    advantage.blue += 1
                }
            }
        }
        
        if (matchDetails?.matchNumber < elimLimit) {
            var winnerMatch = matches[_.findIndex(matches, { "matchNumber": _.filter(matchClasses, { "matchNumber": matchDetails?.matchNumber })[0]?.winnerTo })];
            var winnerOpponent = {};
            winnerOpponent.alliance = _.filter(matchClasses, { "matchNumber": matchDetails?.matchNumber })[0]?.winnerVs;
            if (winnerOpponent.alliance === 'blue') {
                winnerOpponent.lookup = 3
            } else if (winnerOpponent.alliance === 'red') {
                winnerOpponent.lookup = 0
            } else {
                winnerOpponent.lookup = -1
            }
            var loserMatch = matches[_.findIndex(matches, { "matchNumber": _.filter(matchClasses, { "matchNumber": matchDetails?.matchNumber })[0]?.loserTo })];
            var loserOpponent = {};
            loserOpponent.alliance = _.filter(matchClasses, { "matchNumber": matchDetails?.matchNumber })[0]?.loserVs;
            if (loserOpponent.alliance === 'blue') {
                loserOpponent.lookup = 3
            } else if (loserOpponent.alliance === 'red') {
                loserOpponent.lookup = 0
            } else {
                loserOpponent.lookup = -1
            }

            if (winnerOpponent.lookup >= 0) {
                opponent.winner = alliances.Lookup[`${winnerMatch?.teams[winnerOpponent.lookup].teamNumber}`]?.alliance;
            }
            if (loserOpponent.lookup >= 0) {
                opponent.loser = alliances.Lookup[`${loserMatch?.teams[loserOpponent.lookup].teamNumber}`]?.alliance;
            }
        }

    }



    return <>
        {(matchDetails?.matchNumber <= (elimLimit - 1)) && <>Winner <ArrowRight /> {_.filter(matchClasses, { "matchNumber": matchDetails?.matchNumber })[0]?.winnerTo <= (elimLimit - 1) ? `M${_.filter(matchClasses, { "matchNumber": matchDetails?.matchNumber })[0]?.winnerTo}${opponent?.winner ? ` against ${opponent?.winner}` : ""}` : "Finals"}<br />
            Losing Alliance {_.filter(matchClasses, { "matchNumber": matchDetails?.matchNumber })[0]?.loserTo ? <><ArrowRight /> M{_.filter(matchClasses, { "matchNumber": matchDetails?.matchNumber })[0]?.loserTo}{opponent?.loser ? ` against ${opponent?.loser}` : ""} </> : " eliminated"} </>}
        {(matchDetails?.matchNumber === elimLimit) && <>FINALS MATCH 1</>}
        {(matchDetails?.matchNumber === (elimLimit + 1)) && <span className={`${matches[_.findIndex(matches, { "matchNumber": matchDetails?.matchNumber - 1 })]?.winner.winner}AllianceTeam`}>FINALS MATCH 2<br />
            {(advantage.red === advantage.blue) && "EVEN"}
            {(advantage.red > advantage.blue) && "ADVANTAGE RED"}
            {(advantage.blue > advantage.red) && "ADVANTAGE BLUE"}</span>}
        {(matchDetails?.matchNumber >= (elimLimit +2)) && <span className={(advantage?.red > advantage?.blue) ? "redAllianceTeam" : (advantage?.blue > advantage?.red) ? "blueAllianceTeam" : "tieAllianceTeam"}>{_.toUpper(matchDetails.description)}<br />
            {(advantage?.red === advantage?.blue) && "EVEN"}
            {(advantage?.red > advantage?.blue) && "ADVANTAGE RED"}
            {(advantage?.blue > advantage?.red) && "ADVANTAGE BLUE"}
        </span>}
    </>
}

export default PlayoffDetails