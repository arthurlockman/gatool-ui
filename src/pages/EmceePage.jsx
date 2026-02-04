import { Alert, Col, Container, Row } from "react-bootstrap";
import _ from "lodash";
import PlayoffDetails from "../components/PlayoffDetails";
import { useHotkeys } from "react-hotkeys-hook";
import { useSwipeable } from "react-swipeable";
import useWindowDimensions from "hooks/UseWindowDimensions";
import EmceeClock from "components/EmceeClock";
import moment from "moment";
import { matchClassesBase } from "components/Constants";

function EmceePage({
  selectedEvent,
  playoffSchedule,
  qualSchedule,
  practiceSchedule,
  offlinePlayoffSchedule,
  alliances,
  currentMatch,
  nextMatch,
  previousMatch,
  reverseEmcee,
  timeFormat,
  hidePracticeSchedule,
  getSchedule,
  usePullDownToUpdate,
  useSwipe,
  eventLabel,
  playoffCountOverride,
  ftcMode,
}) {
  const { height, width } = useWindowDimensions();
  
  /**
   * This function finds a team by their station assignment
   * @param teams the array of team objects
   * @param station the station to find (e.g., "Red1", "Red2", "Red3", "Blue1", "Blue2", "Blue3")
   * @returns the team number or null if not found
   */
  const getTeamByStation = (teams, station) => {
    if (!teams || !Array.isArray(teams)) return null;
    const team = teams.find((t) => t?.station?.toLowerCase() === station?.toLowerCase());
    return team?.teamNumber || null;
  };

  /**
   * This function determines which alliance number a set of team numbers belongs to
   * by comparing against all alliance rosters
   * @param teamNumbers sorted array of team numbers
   * @param alliancesData the alliances data object
   * @returns alliance display string (e.g., "A1", "A2") or null if not found
   */
  const getAllianceNumberByTeams = (teamNumbers, alliancesData) => {
    if (!teamNumbers || teamNumbers.length === 0 || !alliancesData?.List) return null;
    
    // Iterate through all alliances and compare team rosters
    for (const alliance of alliancesData.List) {
      if (alliance?.teams) {
        const allianceTeamNumbers = alliance.teams
          .map((t) => t.teamNumber)
          .sort();
        
        // If the team numbers match, we found the alliance
        if (JSON.stringify(teamNumbers) === JSON.stringify(allianceTeamNumbers)) {
          return alliance.name ? alliance.name.replace("Alliance ", "A") : null;
        }
      }
    }
    
    return null;
  };

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
      : null;

  var schedule = [];
  var qualMatchLength = 0;
  if (
    (practiceSchedule?.schedule?.schedule?.length > 0 ||
      practiceSchedule?.schedule?.length > 0) &&
    (qualSchedule?.schedule?.length === 0 ||
      qualSchedule?.schedule?.schedule?.length === 0)
  ) {
    schedule =
      practiceSchedule?.schedule?.schedule || practiceSchedule?.schedule;
  }
  if (
    (practiceSchedule?.schedule?.schedule?.length > 0 ||
      practiceSchedule?.schedule?.length > 0) &&
    (qualSchedule?.schedule?.length > 0 ||
      qualSchedule?.schedule?.schedule?.length > 0)
  ) {
    var firstMatch =
      typeof qualSchedule.schedule?.schedule !== "undefined"
        ? qualSchedule.schedule?.schedule[0]
        : qualSchedule?.schedule[0];
    if (
      moment().isBefore(moment(firstMatch.startTime).subtract(20, "minutes")) &&
      !hidePracticeSchedule
    ) {
      schedule =
        practiceSchedule?.schedule?.schedule || practiceSchedule?.schedule;
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
  var matches =
    offlinePlayoffSchedule?.schedule ||
    playoffSchedule?.schedule?.schedule ||
    playoffSchedule?.schedule ||
    [];

  if (
    selectedEvent?.value?.type === "Championship" ||
    selectedEvent?.value?.type === "DistrictChampionshipWithLevels"
  ) {
    inPlayoffs = true;
  }

  // returns the name of the alliance
  function allianceName(matchNumber, allianceColor) {
    var allianceName = "";
    var captain = ";";
    var allianceShortName = "";
    const match = matches[_.findIndex(matches, { matchNumber: matchNumber })];
    const red1Team = getTeamByStation(match?.teams, "Red1");
    const red2Team = getTeamByStation(match?.teams, "Red2");
    const red3Team = getTeamByStation(match?.teams, "Red3");
    const blue1Team = getTeamByStation(match?.teams, "Blue1");
    const blue2Team = getTeamByStation(match?.teams, "Blue2");
    const blue3Team = getTeamByStation(match?.teams, "Blue3");
    
    if (red1Team) {
      allianceName = ftcMode
        ? alliances?.Lookup[`${red1Team}`]?.alliance ||
          alliances?.Lookup[`${red2Team}`]?.alliance
        : alliances?.Lookup[`${red1Team}`]?.alliance ||
          alliances?.Lookup[`${red2Team}`]?.alliance ||
          alliances?.Lookup[`${red3Team}`]?.alliance;
      captain = ftcMode
        ? alliances?.Lookup[`${red1Team}`]?.captain ||
          alliances?.Lookup[`${red2Team}`]?.captain
        : alliances?.Lookup[`${red1Team}`]?.captain ||
          alliances?.Lookup[`${red2Team}`]?.captain ||
          alliances?.Lookup[`${red3Team}`]?.captain;
      if (matchNumber < finalsStart) {
        if (match?.winner?.tieWinner === "red") {
          allianceName += ` (L${match?.winner.level})`;
        }
      }
      if (allianceColor === "blue") {
        allianceName = ftcMode
          ? alliances?.Lookup[`${blue1Team}`]?.alliance ||
            alliances?.Lookup[`${blue2Team}`]?.alliance
          : alliances?.Lookup[`${blue1Team}`]?.alliance ||
            alliances?.Lookup[`${blue2Team}`]?.alliance ||
            alliances?.Lookup[`${blue3Team}`]?.alliance;
        captain = ftcMode
          ? alliances?.Lookup[`${blue1Team}`]?.captain ||
            alliances?.Lookup[`${blue2Team}`]?.captain
          : alliances?.Lookup[`${blue1Team}`]?.captain ||
            alliances?.Lookup[`${blue2Team}`]?.captain ||
            alliances?.Lookup[`${blue3Team}`]?.captain;
        if (matchNumber < finalsStart) {
          if (match?.winner?.tieWinner === "blue") {
            allianceName += ` (L${match?.winner.level} WIN)`;
          }
        }
      }
    }

    allianceShortName =
      allianceName?.replace("Alliance ", "").length === 1
        ? allianceName.replace("Alliance ", "")?.slice(0, 1)
        : allianceName?.slice(0, 2);

    if (!allianceName) {
      return { allianceName: "?", captain: "TBD", shortName: "?" };
    } else {
      return {
        allianceName: allianceName,
        captain: captain,
        shortName: allianceShortName,
      };
    }
  }

  // Function to generate "Lost to..." and "Won..." text dynamically
  // Shows both upper bracket losses and lower bracket wins
  // Uses Series numbers in FTC mode to handle tiebreakers correctly
  function getLostToText(matchNumber, allianceColor) {
    // In FTC mode, matchClasses uses Series numbers, not matchNumber
    // Get the actual match to find its series
    let matchNumberToUse = matchNumber;
    if (ftcMode) {
      // Find the match by matchNumber first, then get its series
      const currentMatchData = matches.find((m) => m.matchNumber === matchNumber);
      if (currentMatchData?.series) {
        matchNumberToUse = currentMatchData.series;
      }
    }
    
    const currentMatchClass = _.filter(matchClasses, {
      matchNumber: matchNumberToUse,
    })[0];
    
    if (!currentMatchClass) return "";
    
    // Get the "from" field which tells us which match they came from
    const fromText = allianceColor === "red" 
      ? currentMatchClass?.red?.from 
      : currentMatchClass?.blue?.from;
    
    const currentMatch = matches.find((m) => m.matchNumber === matchNumber);
    const currentTeamNumbers = currentMatch?.teams
      ?.filter((t) => t.station?.startsWith(allianceColor === "red" ? "Red" : "Blue"))
      .map((t) => t.teamNumber)
      .sort() || [];
    
    // Find upper bracket match they lost (if any)
    let upperBracketLossMatch = null;
    // Find lower bracket match they won (if any)
    let lowerBracketWinMatch = null;
    
    // First, try to parse the "from" field as a fallback for when teams aren't assigned yet
    if (fromText) {
      if (fromText.includes("Lost M")) {
        const lostMatchNum = parseInt(fromText.replace("Lost M", ""));
        if (lostMatchNum) {
          upperBracketLossMatch = lostMatchNum;
        }
      } else if (fromText.includes("Won M")) {
        const wonMatchNum = parseInt(fromText.replace("Won M", ""));
        if (wonMatchNum) {
          lowerBracketWinMatch = wonMatchNum;
        }
      }
    }
    
    // Then try to determine dynamically by searching backwards through matches
    // This will override the fromText if we can find better data
    if (currentTeamNumbers.length > 0) {
      // Search backwards to find where these teams played previously
      if (ftcMode) {
        // In FTC mode, search by series starting from current match's series - 1
        const currentSeries = currentMatch?.series || matchNumberToUse;
        const searchStart = currentSeries - 1;
        for (let series = searchStart; series > 0; series--) {
          const seriesMatches = matches.filter((m) => m.series === series);
          const prevMatch = seriesMatches.length > 0
            ? seriesMatches.sort((a, b) => {
                const aMatchNum = a.originalMatchNumber || a.matchNumber;
                const bMatchNum = b.originalMatchNumber || b.matchNumber;
                return bMatchNum - aMatchNum;
              })[0]
            : null;
          
          if (prevMatch?.teams) {
            const redTeamNumbers = prevMatch.teams
              .filter((t) => t.station?.startsWith("Red"))
              .map((t) => t.teamNumber)
              .sort();
            const blueTeamNumbers = prevMatch.teams
              .filter((t) => t.station?.startsWith("Blue"))
              .map((t) => t.teamNumber)
              .sort();
            
            if (prevMatch?.winner?.winner) {
              const winningAlliance = prevMatch.winner.winner;
              const losingAlliance = winningAlliance === "red" ? "blue" : "red";
              const winningTeamNumbers = winningAlliance === "red" ? redTeamNumbers : blueTeamNumbers;
              const losingTeamNumbers = losingAlliance === "red" ? redTeamNumbers : blueTeamNumbers;
              
              // Check if they won this match
              if (JSON.stringify(currentTeamNumbers) === JSON.stringify(winningTeamNumbers)) {
                lowerBracketWinMatch = series;
                break;
              }
              // Check if they lost this match
              else if (JSON.stringify(currentTeamNumbers) === JSON.stringify(losingTeamNumbers)) {
                upperBracketLossMatch = series;
                break;
              }
            } else if (
              JSON.stringify(currentTeamNumbers) === JSON.stringify(redTeamNumbers) ||
              JSON.stringify(currentTeamNumbers) === JSON.stringify(blueTeamNumbers)
            ) {
              // Teams match but no winner yet
              upperBracketLossMatch = series;
              break;
            }
          }
        }
      } else {
        // In FRC mode, search by match number starting from current match - 1
        const searchStart = matchNumber - 1;
        for (let i = searchStart; i > 0; i--) {
          const prevMatch = matches.find((m) => m.matchNumber === i);
          if (prevMatch?.teams) {
            const redTeamNumbers = prevMatch.teams
              .filter((t) => t.station?.startsWith("Red"))
              .map((t) => t.teamNumber)
              .sort();
            const blueTeamNumbers = prevMatch.teams
              .filter((t) => t.station?.startsWith("Blue"))
              .map((t) => t.teamNumber)
              .sort();
            
            if (prevMatch?.winner?.winner) {
              const winningAlliance = prevMatch.winner.winner;
              const losingAlliance = winningAlliance === "red" ? "blue" : "red";
              const winningTeamNumbers = winningAlliance === "red" ? redTeamNumbers : blueTeamNumbers;
              const losingTeamNumbers = losingAlliance === "red" ? redTeamNumbers : blueTeamNumbers;
              
              // Check if they won this match
              if (JSON.stringify(currentTeamNumbers) === JSON.stringify(winningTeamNumbers)) {
                lowerBracketWinMatch = i;
                break;
              }
              // Check if they lost this match
              else if (JSON.stringify(currentTeamNumbers) === JSON.stringify(losingTeamNumbers)) {
                upperBracketLossMatch = i;
                break;
              }
            } else if (
              JSON.stringify(currentTeamNumbers) === JSON.stringify(redTeamNumbers) ||
              JSON.stringify(currentTeamNumbers) === JSON.stringify(blueTeamNumbers)
            ) {
              // Teams match but no winner yet
              upperBracketLossMatch = i;
              break;
            }
          }
        }
      }
    }
    
    // Build the display text
    const parts = [];
    
    // If they won a lower bracket match, only show that (don't show upper bracket loss)
    if (lowerBracketWinMatch) {
      let wonMatch;
      if (ftcMode) {
        // In FTC mode, find all matches in this series and get the last one (handles tiebreakers)
        const seriesMatches = matches.filter((m) => m.series === lowerBracketWinMatch);
        if (seriesMatches.length > 0) {
          wonMatch = seriesMatches.sort((a, b) => {
            const aMatchNum = a.originalMatchNumber || a.matchNumber;
            const bMatchNum = b.originalMatchNumber || b.matchNumber;
            return bMatchNum - aMatchNum;
          })[0];
        }
      } else {
        wonMatch = matches.find((m) => m.matchNumber === lowerBracketWinMatch);
      }
      
      let losingTeamNumbers = [];
      
      if (wonMatch?.teams) {
        if (wonMatch.winner?.winner) {
          // If we have an explicit winner, use that
          const losingAlliance = wonMatch.winner.winner === "red" ? "blue" : "red";
          losingTeamNumbers = wonMatch.teams
            ?.filter((t) => t.station?.startsWith(losingAlliance === "red" ? "Red" : "Blue"))
            .map((t) => t.teamNumber)
            .sort() || [];
        } else {
          // If no explicit winner, determine by figuring out which team is NOT the current team
          const redTeamNumbers = wonMatch.teams
            .filter((t) => t.station?.startsWith("Red"))
            .map((t) => t.teamNumber)
            .sort();
          const blueTeamNumbers = wonMatch.teams
            .filter((t) => t.station?.startsWith("Blue"))
            .map((t) => t.teamNumber)
            .sort();
          
          // The losing team is the one that ISN'T the current team
          if (JSON.stringify(currentTeamNumbers) === JSON.stringify(redTeamNumbers)) {
            losingTeamNumbers = blueTeamNumbers;
          } else if (JSON.stringify(currentTeamNumbers) === JSON.stringify(blueTeamNumbers)) {
            losingTeamNumbers = redTeamNumbers;
          } else {
            // Couldn't determine, try both and see if we can find an alliance
            const redAlliance = getAllianceNumberByTeams(redTeamNumbers, alliances);
            const blueAlliance = getAllianceNumberByTeams(blueTeamNumbers, alliances);
            // Use whichever is found (prefer the one that's not the current team's alliance)
            const currentAlliance = getAllianceNumberByTeams(currentTeamNumbers, alliances);
            if (redAlliance && redAlliance !== currentAlliance) {
              losingTeamNumbers = redTeamNumbers;
            } else if (blueAlliance && blueAlliance !== currentAlliance) {
              losingTeamNumbers = blueTeamNumbers;
            }
          }
        }
      }
      
      // Always try to display alliance info, use fallback if needed
      let allianceDisplay = getAllianceNumberByTeams(losingTeamNumbers, alliances);
      if (!allianceDisplay) {
        allianceDisplay = `A${lowerBracketWinMatch}`;
      }
      parts.push(`Won M${lowerBracketWinMatch} vs ${allianceDisplay}`);
    } else if (upperBracketLossMatch) {
      // Only show upper bracket loss if they didn't win a lower bracket match
      let lostMatch;
      if (ftcMode) {
        // In FTC mode, find all matches in this series and get the last one (handles tiebreakers)
        const seriesMatches = matches.filter((m) => m.series === upperBracketLossMatch);
        if (seriesMatches.length > 0) {
          lostMatch = seriesMatches.sort((a, b) => {
            const aMatchNum = a.originalMatchNumber || a.matchNumber;
            const bMatchNum = b.originalMatchNumber || b.matchNumber;
            return bMatchNum - aMatchNum;
          })[0];
        }
      } else {
        lostMatch = matches.find((m) => m.matchNumber === upperBracketLossMatch);
      }
      
      let winningTeamNumbers = [];
      
      if (lostMatch?.teams) {
        if (lostMatch.winner?.winner) {
          // If we have an explicit winner, use that
          const winningAlliance = lostMatch.winner.winner;
          winningTeamNumbers = lostMatch.teams
            ?.filter((t) => t.station?.startsWith(winningAlliance === "red" ? "Red" : "Blue"))
            .map((t) => t.teamNumber)
            .sort() || [];
        } else {
          // If no explicit winner, determine by figuring out which team is NOT the current team
          const redTeamNumbers = lostMatch.teams
            .filter((t) => t.station?.startsWith("Red"))
            .map((t) => t.teamNumber)
            .sort();
          const blueTeamNumbers = lostMatch.teams
            .filter((t) => t.station?.startsWith("Blue"))
            .map((t) => t.teamNumber)
            .sort();
          
          // The winning team is the one that ISN'T the current team
          if (JSON.stringify(currentTeamNumbers) === JSON.stringify(redTeamNumbers)) {
            winningTeamNumbers = blueTeamNumbers;
          } else if (JSON.stringify(currentTeamNumbers) === JSON.stringify(blueTeamNumbers)) {
            winningTeamNumbers = redTeamNumbers;
          } else {
            // Couldn't determine, try both and see if we can find an alliance
            const redAlliance = getAllianceNumberByTeams(redTeamNumbers, alliances);
            const blueAlliance = getAllianceNumberByTeams(blueTeamNumbers, alliances);
            // Use whichever is found (prefer the one that's not the current team's alliance)
            const currentAlliance = getAllianceNumberByTeams(currentTeamNumbers, alliances);
            if (redAlliance && redAlliance !== currentAlliance) {
              winningTeamNumbers = redTeamNumbers;
            } else if (blueAlliance && blueAlliance !== currentAlliance) {
              winningTeamNumbers = blueTeamNumbers;
            }
          }
        }
      }
      
      // Always try to display alliance info, use fallback if needed
      let allianceDisplay = getAllianceNumberByTeams(winningTeamNumbers, alliances);
      if (!allianceDisplay) {
        allianceDisplay = `A${upperBracketLossMatch}`;
      }
      parts.push(`Lost to ${allianceDisplay} in M${upperBracketLossMatch}`);
    }
    
    // If no parts found, return original text or empty
    if (parts.length === 0) {
      return fromText || "";
    }
    
    return (
      <>
        {parts.map((part, index) => (
          <span key={index}>
            {index > 0 && <br />}
            {part}
          </span>
        ))}
      </>
    );
  }

  var advantage = {};
  advantage.red = 0;
  advantage.blue = 0;
  var opponent = { winner: null, loser: null };

  if (currentMatch > qualMatchLength) {
    inPlayoffs = true;
    playoffMatchNumber =
      playoffSchedule?.schedule[currentMatch - qualMatchLength - 1]
        ?.matchNumber ||
      offlinePlayoffSchedule?.schedule[currentMatch - qualMatchLength - 1]
        ?.matchNumber;
    if (playoffMatchNumber > finalsStart) {
      for (
        var finalsMatches = finalsStart;
        finalsMatches < playoffMatchNumber;
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
    if (playoffMatchNumber < finalsStart) {
      var winnerMatch =
        matches[
          _.findIndex(matches, {
            matchNumber: _.filter(matchClasses, {
              matchNumber: playoffMatchNumber,
            })[0]?.winnerTo,
          })
        ];
      var winnerOpponent = {};
      winnerOpponent.alliance = _.filter(matchClasses, {
        matchNumber: playoffMatchNumber,
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
              matchNumber: playoffMatchNumber,
            })[0]?.loserTo,
          })
        ];
      var loserOpponent = {};
      loserOpponent.alliance = _.filter(matchClasses, {
        matchNumber: playoffMatchNumber,
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

  _.forEach(schedule, (match) => {
    _.forEach(match?.teams, (team) => {
      var row = {};
      row.teamNumber = team.teamNumber;
      row.alliance = team.station.substring(0, team.station.length - 1);
      row.score = match[`score${row.alliance}Final`];
      row.level = match.level;
      row.description = match.description;
      row.alliancePartners = _.filter(match?.teams, function (o) {
        return o.station.substring(0, team.station.length - 1) === row.alliance;
      }).map((q) => {
        return q.teamNumber;
      });
      scores.push(row);
    });
  });

  var matchDetails =
    _.filter(matches, { matchNumber: playoffMatchNumber })[0] ||
    _.filter(schedule, { matchNumber: currentMatch })[0];

  const swipeHandlers = useSwipe
    ? // eslint-disable-next-line react-hooks/rules-of-hooks
      useSwipeable({
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
      })
    : {};

  useHotkeys("right", () => nextMatch(), { scopes: "matchNavigation" });
  useHotkeys("left", () => previousMatch(), { scopes: "matchNavigation" });

  const smallScreen = width * height <= 786500 ? "Small" : "";
  const portrait = width > height && smallScreen === "Small" ? "Landscape" : "";

  return (
    <Container fluid>
      {!selectedEvent && (
        <div>
          <Alert variant="warning">
            You need to select an event before you can see anything here.
          </Alert>
        </div>
      )}
      {selectedEvent && (!schedule || schedule?.length === 0) && (
        <div>
          <Alert variant="warning">
            <div>
              <img src="loadingIcon.gif" alt="Loading data..." />
            </div>
            Awaiting schedule data for {eventLabel}
          </Alert>
        </div>
      )}
      {selectedEvent && schedule?.length > 0 && !inPlayoffs && (
        <Container
          fluid
          {...swipeHandlers}
          style={{ textAlign: "center", padding: "7px" }}
        >
          <EmceeClock matchDetails={matchDetails} timeFormat={timeFormat} />
          <div className={`davidPriceQuals`}>
            {schedule[currentMatch - 1]?.matchNumber}
          </div>
        </Container>
      )}
      {selectedEvent && schedule?.length > 0 && inPlayoffs && (
        <>
          <Container fluid {...swipeHandlers}>
            <EmceeClock matchDetails={matchDetails} timeFormat={timeFormat} />
            <Row>
              <Col
                className={`davidPriceDetail${smallScreen}${portrait}`}
                xs={12}
              >
                {_.replace(
                  schedule[currentMatch - 1]?.description,
                  "(R",
                  "(Round "
                ) || ""}
              </Col>
            </Row>
            {!reverseEmcee && (
              <Row>
                {playoffMatchNumber <= 13 && (
                  <Col
                    xs={2}
                    className={`davidPriceDetail${smallScreen}${portrait} redAllianceTeam`}
                  >
                    {getLostToText(playoffMatchNumber, "red")}
                  </Col>
                )}
                <Col
                  xs={playoffMatchNumber > 13 ? 6 : 4}
                  className={`redAllianceTeam`}
                >
                  <div className={`davidPrice${smallScreen}`}>
                    {allianceName(
                      schedule[currentMatch - 1]?.matchNumber,
                      "red"
                    )?.shortName || ""}
                  </div>
                  <div
                    className={`davidPriceDetail${smallScreen}${portrait} davidPriceCaptain`}
                  >
                    C: 
                    {
                      allianceName(
                        schedule[currentMatch - 1]?.matchNumber,
                        "red"
                      )?.captain
                    }
                  </div>
                </Col>
                <Col
                  xs={playoffMatchNumber > 13 ? 6 : 4}
                  className={`blueAllianceTeam`}
                >
                  <div className={`davidPrice${smallScreen}`}>
                    {allianceName(
                      schedule[currentMatch - 1]?.matchNumber,
                      "blue"
                    )?.shortName || ""}
                  </div>
                  <div
                    className={`davidPriceDetail${smallScreen}${portrait} davidPriceCaptain`}
                  >
                    C: 
                    {
                      allianceName(
                        schedule[currentMatch - 1]?.matchNumber,
                        "blue"
                      )?.captain
                    }
                  </div>
                </Col>
                {playoffMatchNumber <= 13 && (
                  <Col
                    xs={2}
                    className={`davidPriceDetail${smallScreen}${portrait} blueAllianceTeam`}
                  >
                    {getLostToText(playoffMatchNumber, "blue")}
                  </Col>
                )}
              </Row>
            )}

            {reverseEmcee && (
              <Row>
                {playoffMatchNumber <= 13 && (
                  <Col
                    xs={2}
                    className={`davidPriceDetail${smallScreen}${portrait} blueAllianceTeam`}
                  >
                    {getLostToText(playoffMatchNumber, "blue")}
                  </Col>
                )}
                <Col
                  xs={playoffMatchNumber > 13 ? 6 : 4}
                  className={`blueAllianceTeam`}
                >
                  <div className={`davidPrice${smallScreen}`}>
                    {allianceName(
                      schedule[currentMatch - 1]?.matchNumber,
                      "blue"
                    )?.shortName || ""}
                  </div>
                  <div
                    className={`davidPriceDetail${smallScreen}${portrait} davidPriceCaptain`}
                  >
                    C: 
                    {
                      allianceName(
                        schedule[currentMatch - 1]?.matchNumber,
                        "blue"
                      )?.captain
                    }
                  </div>
                </Col>
                <Col
                  xs={playoffMatchNumber > 13 ? 6 : 4}
                  className={`redAllianceTeam`}
                >
                  <div className={`davidPrice${smallScreen}`}>
                    {allianceName(
                      schedule[currentMatch - 1]?.matchNumber,
                      "red"
                    )?.shortName || ""}
                  </div>
                  <div
                    className={`davidPriceDetail${smallScreen}${portrait} davidPriceCaptain`}
                  >
                    C: 
                    {
                      allianceName(
                        schedule[currentMatch - 1]?.matchNumber,
                        "red"
                      )?.captain
                    }
                  </div>
                </Col>
                {playoffMatchNumber <= 13 && (
                  <Col
                    xs={2}
                    className={`davidPriceDetail${smallScreen}${portrait} redAllianceTeam`}
                  >
                    {getLostToText(playoffMatchNumber, "red")}
                  </Col>
                )}
              </Row>
            )}

            <Row>
              <Col
                xs={12}
                className={`davidPriceDetail${smallScreen}${portrait}`}
              >
                <PlayoffDetails
                  matchDetails={matchDetails}
                  alliances={alliances}
                  matches={matches}
                  playoffCountOverride={playoffCountOverride}
                  ftcMode={ftcMode}
                />
              </Col>
            </Row>
          </Container>
        </>
      )}
    </Container>
  );
}

export default EmceePage;
