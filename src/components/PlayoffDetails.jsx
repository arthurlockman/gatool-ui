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

  // In FTC mode, use series number; otherwise use matchNumber
  const currentMatchIdentifier = ftcMode ? matchDetails?.series : matchDetails?.matchNumber;
  const currentMatchClass = currentMatchIdentifier ? _.filter(matchClasses, {
    matchNumber: currentMatchIdentifier,
  })[0] : null;

  if (matchDetails?.tournamentLevel.toLowerCase() === "playoff") {
    // In FTC mode, Red (higher seed) starts with an advantage: Red has 0 losses, Blue has 1 loss
    // This means Red needs 1 win to win the series, Blue needs 2 wins
    // Initialize: Red starts with advantage of 1 (equivalent to Blue having 1 loss)
    if (ftcMode && currentMatchIdentifier >= finalsStart) {
      advantage.red = 1;
      advantage.blue = 0;
    }
    
    if (currentMatchIdentifier > finalsStart) {
      if (ftcMode) {
        // Count wins from all matches in series up to (but not including) the current series
        // Note: We already set advantage.red = 1 above, so we're adding to that base
        const seriesNumbers = [];
        for (var seriesNum = finalsStart; seriesNum < currentMatchIdentifier; seriesNum++) {
          seriesNumbers.push(seriesNum);
        }
        seriesNumbers.forEach((seriesNum) => {
          const seriesMatches = matches.filter((m) => m.series === seriesNum);
          if (seriesMatches.length > 0) {
            // Find the last match in the series (highest matchNumber)
            const lastMatch = seriesMatches.reduce((prev, current) => {
              const prevMatchNum = prev.originalMatchNumber || prev.matchNumber;
              const currentMatchNum = current.originalMatchNumber || current.matchNumber;
              return (currentMatchNum > prevMatchNum) ? current : prev;
            });
            if (lastMatch?.winner?.winner === "red") {
              advantage.red += 1;
            }
            if (lastMatch?.winner?.winner === "blue") {
              advantage.blue += 1;
            }
          }
        });
      } else {
        // FRC mode: use ordinal match numbers
        for (
          var finalsMatches = finalsStart;
          finalsMatches < currentMatchIdentifier;
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
    }

    if (currentMatchIdentifier < finalsStart) {
      if (currentMatchClass) {
        var winnerMatch;
        var loserMatch;
        
        if (ftcMode) {
          // In FTC mode, find matches by series number
          winnerMatch = matches.find((m) => m.series === currentMatchClass?.winnerTo);
          loserMatch = matches.find((m) => m.series === currentMatchClass?.loserTo);
        } else {
          // FRC mode: find matches by matchNumber
          winnerMatch = matches[_.findIndex(matches, {
            matchNumber: currentMatchClass?.winnerTo,
          })];
          loserMatch = matches[_.findIndex(matches, {
            matchNumber: currentMatchClass?.loserTo,
          })];
        }
        
        var winnerOpponent = {};
        winnerOpponent.alliance = currentMatchClass?.winnerVs;
        if (winnerOpponent.alliance === "blue") {
          winnerOpponent.lookup = 3;
        } else if (winnerOpponent.alliance === "red") {
          winnerOpponent.lookup = 0;
        } else {
          winnerOpponent.lookup = -1;
        }
        
        var loserOpponent = {};
        loserOpponent.alliance = currentMatchClass?.loserVs;
        if (loserOpponent.alliance === "blue") {
          loserOpponent.lookup = 3;
        } else if (loserOpponent.alliance === "red") {
          loserOpponent.lookup = 0;
        } else {
          loserOpponent.lookup = -1;
        }

        if (winnerOpponent.lookup >= 0 && winnerMatch) {
          opponent.winner =
            alliances?.Lookup[
              `${winnerMatch?.teams[winnerOpponent.lookup]?.teamNumber}`
            ]?.alliance;
        }
        if (loserOpponent.lookup >= 0 && loserMatch) {
          opponent.loser =
            alliances?.Lookup[
              `${loserMatch?.teams[loserOpponent.lookup]?.teamNumber}`
            ]?.alliance;
        }
      }
    }
  }

  return (
    <>
      {currentMatchIdentifier &&
        currentMatchIdentifier <= finalsStart - 1 && (
          <>
            Winner <ArrowRight />{" "}
            {currentMatchClass?.winnerTo <= finalsStart - 1
              ? `M${currentMatchClass?.winnerTo}${
                  opponent?.winner
                    ? ` against ${opponent?.winner.replace(" ", " ")}`
                    : ""
                }`
              : "Finals"}
            <br />
            Losing Alliance{" "}
            {currentMatchClass?.loserTo ? (
              <>
                <ArrowRight /> M{currentMatchClass?.loserTo}
                {opponent?.loser
                  ? ` against ${opponent?.loser.replace(" ", " ")}`
                  : ""}{" "}
              </>
            ) : (
              " eliminated"
            )}{" "}
          </>
        )}
      {currentMatchIdentifier &&
        currentMatchIdentifier === finalsStart && (
          <>
            {ftcMode ? (
              <span className="redAllianceTeam">
                FINALS MATCH 1<br />
                ADVANTAGE RED
              </span>
            ) : (
              <>FINALS MATCH 1</>
            )}
          </>
        )}
      {currentMatchIdentifier &&
        currentMatchIdentifier === finalsStart + 1 && (
          <span
            className={`${
              ftcMode
                ? (() => {
                    // In FTC mode, find the previous series' last match
                    const prevSeries = currentMatchIdentifier - 1;
                    const prevSeriesMatches = matches.filter((m) => m.series === prevSeries);
                    if (prevSeriesMatches.length > 0) {
                      const lastMatch = prevSeriesMatches.reduce((prev, current) => {
                        const prevMatchNum = prev.originalMatchNumber || prev.matchNumber;
                        const currentMatchNum = current.originalMatchNumber || current.matchNumber;
                        return (currentMatchNum > prevMatchNum) ? current : prev;
                      });
                      return lastMatch?.winner?.winner || "";
                    }
                    return "";
                  })()
                : matches[
                    _.findIndex(matches, {
                      matchNumber: currentMatchIdentifier - 1,
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
      {currentMatchIdentifier &&
        currentMatchIdentifier >= finalsStart + 2 && (
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
