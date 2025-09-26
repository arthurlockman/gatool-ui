import { ArrowRight } from "react-bootstrap-icons";
import _ from "lodash";
import { matchClassesBase } from "./Constants";

function PlayoffDetails({
  matchDetails,
  alliances,
  matches,
  playoffCountOverride,
  ftcMode
}) {
  const formatMatchClasses = (baseClasses) => {
    const newClasses = baseClasses.map((match) => {
      return {
        matchNumber: match.matchNumber,
        red: match?.red,
        blue: match?.blue,
        winnerTo: match?.winnerTo?.matchNumber,
        loserTo: match?.loserTo?.matchNumber,
        winnerVs: match?.winnerTo?.station === "red" ? "blue" : "red",
        loserVs: match?.winnerTo?.station === "red" ? "blue" : "red",
      };
    });
    return newClasses;
  };

  const matchClasses =
    alliances?.count === 8
      ? formatMatchClasses(_.cloneDeep(matchClassesBase.eightAlliance))
      : alliances?.count === 6
      ? formatMatchClasses(_.cloneDeep(matchClassesBase.sixAlliance))
      : alliances?.count === 4
      ? formatMatchClasses(
          _.cloneDeep(
            ftcMode
              ? matchClassesBase.fourAllianceFTC
              : matchClassesBase.fourAlliance
          )
        )
      : null;

  const finalsStart =
    alliances?.count === 8
      ? 14
      : alliances?.count === 6
      ? 10
      : alliances?.count === 4
      ? 6
      : 1;

  const byeCount = [
    { bye: 0, replacementMatchClasses: [] },
    { bye: 0, replacementMatchClasses: [] },
    { bye: 0, replacementMatchClasses: [] },
    { bye: 1, replacementMatchClasses: [] },
    { bye: 0, replacementMatchClasses: [] },
    {
      bye: 3,
      replacementMatchClasses: [
        {
          matchNumber: 2,
          red: { class: "success", from: null },
          blue: { class: "success", from: null },
          winnerTo: 7,
          loserTo: 10,
          winnerVs: "red",
          loserVs: "red",
        },
        {
          matchNumber: 4,
          red: { class: "success", from: null },
          blue: { class: "success", from: null },
          winnerTo: 8,
          loserTo: 9,
          winnerVs: "red",
          loserVs: "red",
        },
      ],
    },
    {
      bye: 2,
      replacementMatchClasses: [
        {
          matchNumber: 2,
          red: { class: "success", from: null },
          blue: { class: "success", from: null },
          winnerTo: 7,
          loserTo: 10,
          winnerVs: "red",
          loserVs: "red",
        },
        {
          matchNumber: 4,
          red: { class: "success", from: null },
          blue: { class: "success", from: null },
          winnerTo: 8,
          loserTo: 9,
          winnerVs: "red",
          loserVs: "red",
        },
      ],
    },
    {
      bye: 1,
      replacementMatchClasses: [
        {
          matchNumber: 2,
          red: { class: "success", from: null },
          blue: { class: "success", from: null },
          winnerTo: 7,
          loserTo: 10,
          winnerVs: "red",
          loserVs: "red",
        },
      ],
    },
    { bye: 0, replacementMatchClasses: [] },
  ];

  _.forEach(
    byeCount[playoffCountOverride?.value || 8].replacementMatchClasses,
    (match) => {
      var tempClass = _.findIndex(matchClasses, {
        matchNumber: match.matchNumber,
      });
      matchClasses[tempClass].winnerTo = match.winnerTo;
      matchClasses[tempClass].loserTo = match.loserTo;
    }
  );

  var advantage = {};
  advantage.red = 0;
  advantage.blue = 0;
  var opponent = { winner: null, loser: null };

  if (matchDetails?.tournamentLevel.toLowerCase() === "playoff") {
    if (matchDetails?.matchNumber > finalsStart) {
      for (
        var finalsMatches = finalsStart;
        finalsMatches < matchDetails?.matchNumber;
        finalsMatches++
      ) {
        if (
          matches[_.findIndex(matches, { matchNumber: finalsMatches })]?.winner
            .winner === "red"
        ) {
          advantage.red += 1;
        }
        if (
          matches[_.findIndex(matches, { matchNumber: finalsMatches })]?.winner
            .winner === "blue"
        ) {
          advantage.blue += 1;
        }
      }
    }

    if (matchDetails?.matchNumber < finalsStart) {
      var winnerMatch =
        matches[
          _.findIndex(matches, {
            matchNumber: _.filter(matchClasses, {
              matchNumber: matchDetails?.matchNumber,
            })[0]?.winnerTo,
          })
        ];
      var winnerOpponent = {};
      winnerOpponent.alliance = _.filter(matchClasses, {
        matchNumber: matchDetails?.matchNumber,
      })[0]?.winnerVs;
      if (winnerOpponent.alliance === "blue") {
        winnerOpponent.lookup = 3;
      } else if (winnerOpponent.alliance === "red") {
        winnerOpponent.lookup = 0;
      } else {
        winnerOpponent.lookup = -1;
      }
      var loserMatch =
        matches[
          _.findIndex(matches, {
            matchNumber: _.filter(matchClasses, {
              matchNumber: matchDetails?.matchNumber,
            })[0]?.loserTo,
          })
        ];
      var loserOpponent = {};
      loserOpponent.alliance = _.filter(matchClasses, {
        matchNumber: matchDetails?.matchNumber,
      })[0]?.loserVs;
      if (loserOpponent.alliance === "blue") {
        loserOpponent.lookup = 3;
      } else if (loserOpponent.alliance === "red") {
        loserOpponent.lookup = 0;
      } else {
        loserOpponent.lookup = -1;
      }

      if (winnerOpponent.lookup >= 0) {
        opponent.winner =
          alliances?.Lookup[
            `${winnerMatch?.teams[winnerOpponent.lookup].teamNumber}`
          ]?.alliance;
      }
      if (loserOpponent.lookup >= 0) {
        opponent.loser =
          alliances?.Lookup[
            `${loserMatch?.teams[loserOpponent.lookup].teamNumber}`
          ]?.alliance;
      }
    }
  }

  return (
    <>
      {matchDetails?.matchNumber &&
        matchDetails?.matchNumber <= finalsStart - 1 && (
          <>
            Winner <ArrowRight />{" "}
            {_.filter(matchClasses, {
              matchNumber: matchDetails?.matchNumber,
            })[0]?.winnerTo <=
            finalsStart - 1
              ? `M${
                  _.filter(matchClasses, {
                    matchNumber: matchDetails?.matchNumber,
                  })[0]?.winnerTo
                }${
                  opponent?.winner
                    ? ` against ${opponent?.winner.replace(" ", " ")}`
                    : ""
                }`
              : "Finals"}
            <br />
            Losing Alliance{" "}
            {_.filter(matchClasses, {
              matchNumber: matchDetails?.matchNumber,
            })[0]?.loserTo ? (
              <>
                <ArrowRight /> M
                {
                  _.filter(matchClasses, {
                    matchNumber: matchDetails?.matchNumber,
                  })[0]?.loserTo
                }
                {opponent?.loser
                  ? ` against ${opponent?.loser.replace(" ", " ")}`
                  : ""}{" "}
              </>
            ) : (
              " eliminated"
            )}{" "}
          </>
        )}
      {matchDetails?.matchNumber &&
        matchDetails?.matchNumber === finalsStart && <>FINALS MATCH 1</>}
      {matchDetails?.matchNumber &&
        matchDetails?.matchNumber === finalsStart + 1 && (
          <span
            className={`${
              matches[
                _.findIndex(matches, {
                  matchNumber: matchDetails?.matchNumber - 1,
                })
              ]?.winner.winner
            }AllianceTeam`}
          >
            FINALS MATCH 2<br />
            {advantage.red === advantage.blue && "EVEN"}
            {advantage.red > advantage.blue && "ADVANTAGE RED"}
            {advantage.blue > advantage.red && "ADVANTAGE BLUE"}
          </span>
        )}
      {matchDetails?.matchNumber &&
        matchDetails?.matchNumber >= finalsStart + 2 && (
          <span
            className={
              advantage?.red > advantage?.blue
                ? "redAllianceTeam"
                : advantage?.blue > advantage?.red
                ? "blueAllianceTeam"
                : "tieAllianceTeam"
            }
          >
            {_.toUpper(matchDetails.description)}
            <br />
            {advantage?.red === advantage?.blue && "EVEN"}
            {advantage?.red > advantage?.blue && "ADVANTAGE RED"}
            {advantage?.blue > advantage?.red && "ADVANTAGE BLUE"}
          </span>
        )}
    </>
  );
}

export default PlayoffDetails;
