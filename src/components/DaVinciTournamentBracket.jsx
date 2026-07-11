import { Alert } from "react-bootstrap";
import { useHotkeys } from "react-hotkeys-hook";
import { useSwipeable } from "react-swipeable";
import Match from "./Match";
import PlayoffMatch from "./PlayoffMatch";
import FinalsMatchIndicator from "./FinalsMatchIndicator";
import {
  GOLD, RED, BLUE, GREEN, BLACK, WHITE, bold, black,
  PLAYOFF_MATCH_GRAY_BOX_CENTER_X, INDICATOR_SPACING
} from "./bracketConstants";
import {
  isCurrentMatchHelper,
  computeIsInFinalsView,
  getAllianceNameForDisplay as getAllianceNameForDisplayHelper,
  getAllianceNumbersForDisplay as getAllianceNumbersForDisplayHelper,
  getMatchScoreForDisplay as getMatchScoreForDisplayHelper,
  getMatchWinnerForDisplay as getMatchWinnerForDisplayHelper,
} from "../utils/bracketHelpers";
import {
  getFinalSeriesMatches,
  computeDaVinciTournamentWinner,
  getFinalsSlotScore,
  getFinalsSlotWinner,
  DA_VINCI_SCHEDULE,
  FG_ROUND_ROBIN_SCHEDULE,
  getFGFinalsMatches,
  computeFGTournamentWinner,
} from "../utils/daVinciHelpers";
import { isFirstGlobalMode } from "../utils/programConstants";

// ---- Layout helpers ----
const MATCH_SCALE      = 1.8;
const MATCH_NATIVE_H   = 72.46;
const MATCH_NATIVE_W   = 194.07;
const MATCH_W          = MATCH_NATIVE_W * MATCH_SCALE;
const MATCH_HEIGHT     = MATCH_NATIVE_H * MATCH_SCALE;
const COL_W            = 340;
const MATCH_X_OFFSET   = (COL_W - MATCH_W) / 2 + 15;
const TOP              = 145;
const V_SPACING        = 55;

const FINALS_MATCH_NATIVE_H = 168.1;
const FINALS_MATCH_NATIVE_W = 240.5;
const FINALS_SCALE          = 1.8;
const FINALS_MATCH_H        = FINALS_MATCH_NATIVE_H * FINALS_SCALE;
const FINALS_MATCH_W        = FINALS_MATCH_NATIVE_W * FINALS_SCALE;

const DIVIDER_COLOR = "#DBDAD9";
const matchXForRound = (round) => (round - 1) * COL_W + MATCH_X_OFFSET;
const matchYForSlot  = (slot)  => TOP + V_SPACING + slot * (MATCH_HEIGHT + V_SPACING);
const dividerX       = (round) => round * COL_W - 5;

/**
 * Compute layout dimensions based on the round-robin configuration.
 * @param {number} numRounds
 * @param {number} matchesPerRound
 */
function computeLayout(numRounds, matchesPerRound) {
  const svgW = numRounds * COL_W;
  const availableH = matchesPerRound * MATCH_HEIGHT + (matchesPerRound + 1) * V_SPACING;
  const finalsRowTop = TOP + availableH;
  const finalsY = finalsRowTop + 10;
  const finalsX = (svgW - FINALS_MATCH_W) / 2;
  const svgH = finalsY + FINALS_MATCH_H + 60;
  return { svgW, svgH, availableH, finalsX, finalsY };
}

// ---- Sub-components ----

function RoundRobinBackground({ svgW, svgH, top, availableH, eventLabel, numRounds, title }) {
  const roundLabels = Array.from({ length: numRounds }, (_, i) => `ROUND ${i + 1}`);
  // Dividers between columns (numRounds - 1 dividers)
  const dividers = Array.from({ length: numRounds - 1 }, (_, i) => i + 1);
  return (
    <g id="background">
      <rect x="1" fill="#FFFFFF" width={svgW - 2} height={svgH} />
      {dividers.map((round) => (
        <rect
          key={`divider${round}`}
          x={dividerX(round)}
          y={top - 10}
          fill={DIVIDER_COLOR}
          width="5"
          height={availableH - 20}
        />
      ))}
      <text
        id="playoffBracket"
        x={svgW / 2} y="52"
        dominantBaseline="middle" textAnchor="middle"
        fontFamily={eventLabel?.length > 50 ? "'myriad-pro-condensed'" : "'myriad-pro'"}
        fontWeight={black} fontStyle="normal" fontSize="48px"
      >
        {eventLabel}
      </text>
      <text
        x={svgW / 2} y="95"
        dominantBaseline="middle" textAnchor="middle"
        fontFamily="'myriad-pro'" fontWeight={bold} fontStyle="normal"
        fontSize="28px" fill="#555555"
      >
        {title}
      </text>
      {roundLabels.map((label, i) => (
        <text
          key={`header${i}`}
          x={i * COL_W + COL_W / 2} y="163"
          textAnchor="middle"
          fontFamily="'myriad-pro'" fontWeight={bold} fontStyle="normal" fontSize="28px"
        >
          {label}
        </text>
      ))}
    </g>
  );
}

function RoundRobinMatches({
  schedule, matchesPerRound,
  isCurrentMatch, getMatchLabel,
  getAllianceNameForDisplay, getAllianceNumbersForDisplay,
  getMatchWinnerForDisplay, getMatchScoreForDisplay,
}) {
  return (
    <>
      {schedule.map(({ matchNumber, round, redPlaceHolder, bluePlaceHolder }) => {
        const slot = (matchNumber - 1) % matchesPerRound;
        return (
          <g
            key={`match${matchNumber}`}
            transform={`translate(${matchXForRound(round)}, ${matchYForSlot(slot)}) scale(${MATCH_SCALE})`}
          >
            <Match
              x={0} y={0}
              matchNumber={matchNumber}
              isCurrentMatch={isCurrentMatch(matchNumber)}
              getMatchLabel={getMatchLabel}
              getAllianceNameForDisplay={getAllianceNameForDisplay}
              getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
              getMatchWinnerForDisplay={getMatchWinnerForDisplay}
              getMatchScoreForDisplay={getMatchScoreForDisplay}
              redPlaceHolder={redPlaceHolder}
              bluePlaceHolder={bluePlaceHolder}
              colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
              fontWeights={{ bold }}
            />
          </g>
        );
      })}
    </>
  );
}

function RoundRobinFinalsSection({
  finalsMatchNumber, 
  isCurrentMatch, isInFinalsView,
  getAllianceNameForDisplay, getAllianceNumbersForDisplay,
  tournamentWinner, ftcMode,
  finalSeriesMatches, finalsX, finalsY,
}) {
  const getSlotScore  = (bracketMatchNumber, alliance) =>
    getFinalsSlotScore(finalSeriesMatches, bracketMatchNumber - finalsMatchNumber, alliance);
  const getSlotWinner = (bracketMatchNumber) =>
    getFinalsSlotWinner(finalSeriesMatches, bracketMatchNumber - finalsMatchNumber);

  const indicatorCenterX = finalsX + PLAYOFF_MATCH_GRAY_BOX_CENTER_X * FINALS_SCALE;
  const indicatorY = finalsY + (86 + 28 / FINALS_SCALE) * FINALS_SCALE;
  const indicatorSpacing = INDICATOR_SPACING * FINALS_SCALE;

  return (
    <>
      <g transform={`translate(${finalsX}, ${finalsY}) scale(${FINALS_SCALE})`}>
        <PlayoffMatch
          x={0} y={0}
          matchNumber={finalsMatchNumber}
          isCurrentMatch={isCurrentMatch(finalsMatchNumber)}
          isInFinalsView={isInFinalsView}
          getAllianceNameForDisplay={getAllianceNameForDisplay}
          getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
          tournamentWinner={tournamentWinner}
          ftcMode={ftcMode}
          colors={{ RED, BLUE, GOLD, BLACK, WHITE }}
          fontWeights={{ bold }}
        />
      </g>
      <FinalsMatchIndicator
        x={indicatorCenterX}
        y={indicatorY}
        firstFinalsMatchNumber={finalsMatchNumber}
        finalsCount={finalSeriesMatches.length}
        indicatorSpacing={indicatorSpacing}
        indicatorScale={FINALS_SCALE}
        getFinalsMatchWinnerForDisplay={getSlotWinner}
        getFinalsMatchScoreForDisplay={getSlotScore}
      />
    </>
  );
}

// ---- Main component ----

/**
 * Round-robin tournament bracket.
 * Supports both the da Vinci Tournament (FTCCMP1: 6 alliances, 5 rounds × 3 matches)
 * and FIRST Global (8 alliances, 4 rounds × 4 matches).
 */
function DaVinciTournamentBracket({
  offlinePlayoffSchedule,
  currentMatch,
  qualsLength,
  nextMatch,
  previousMatch,
  getSchedule,
  usePullDownToUpdate,
  useSwipe,
  eventLabel,
  ftcMode,
  matches,
  allianceNumbers,
  allianceName,
  matchScore,
  matchWinner,
  alliances,
  remapNumberToString,
}) {
  const isFG = isFirstGlobalMode(ftcMode);

  // Pick configuration based on program
  const roundRobinSchedule = isFG ? FG_ROUND_ROBIN_SCHEDULE : DA_VINCI_SCHEDULE;
  const matchesPerRound = isFG ? 4 : 3;
  const numRounds = isFG ? 4 : 5;
  const finalsMatchNumber = roundRobinSchedule.length + 1; // 17 for FG, 16 for daVinci
  const bracketTitle = isFG ? "FIRST Global Round Robin" : "da Vinci Tournament Round Robin";

  const { svgW, svgH, availableH, finalsX, finalsY } = computeLayout(numRounds, matchesPerRound);

  const currentPlayoffMatch = currentMatch - qualsLength;

  const isCurrentMatch = (n) =>
    isFG
      ? currentPlayoffMatch === n
      : isCurrentMatchHelper(n, currentPlayoffMatch, ftcMode, offlinePlayoffSchedule, matches);

  const isInFinalsView = isFG
    ? currentPlayoffMatch >= finalsMatchNumber
    : computeIsInFinalsView(currentPlayoffMatch, finalsMatchNumber, ftcMode, offlinePlayoffSchedule, matches);

  const getMatchLabel = (n) => `MATCH ${n}`;

  const getAllianceNumbersForDisplay = (n, color) =>
    isFG
      ? (function() {
          // For FG, look up teams directly from the match in the schedule
          const match = matches?.[n - 1];
          if (!match?.teams) return allianceNumbers(n, color);
          const prefix = color === "red" ? "Red" : "Blue";
          const teamNums = match.teams
            .filter((t) => t.station?.startsWith(prefix))
            .map((t) => remapNumberToString ? remapNumberToString(t.teamNumber) : t.teamNumber);
          return teamNums.join("  ") || allianceNumbers(n, color);
        })()
      : getAllianceNumbersForDisplayHelper(
          n, color, ftcMode, offlinePlayoffSchedule, matches, allianceNumbers, alliances, remapNumberToString,
        );

  const getAllianceNameForDisplay = (n, color) =>
    isFG
      ? (function() {
          const match = matches?.[n - 1];
          if (!match?.teams || !alliances?.Lookup) return allianceName(n, color);
          const prefix = color === "red" ? "Red1" : "Blue1";
          const team = match.teams.find((t) => t.station === prefix);
          if (!team) return allianceName(n, color);
          const entry = alliances.Lookup?.[team.teamNumber];
          return entry?.alliance ?? allianceName(n, color);
        })()
      : getAllianceNameForDisplayHelper(
          n, color, ftcMode, offlinePlayoffSchedule, matches, allianceName, alliances, remapNumberToString, finalsMatchNumber,
        );

  const getMatchScoreForDisplay = (n, alliance) =>
    isFG
      ? (function() {
          const match = matches?.[n - 1];
          if (!match) return matchScore(n, alliance);
          return alliance === "red" ? match.scoreRedFinal : match.scoreBlueFinal;
        })()
      : getMatchScoreForDisplayHelper(n, alliance, ftcMode, offlinePlayoffSchedule, matches, matchScore);

  const getMatchWinnerForDisplay = (n) =>
    isFG
      ? matches?.[n - 1]?.winner ?? matchWinner(n)
      : getMatchWinnerForDisplayHelper(n, ftcMode, offlinePlayoffSchedule, matches, matchWinner);

  // Finals handling
  const finalSeriesMatches = isFG
    ? getFGFinalsMatches(matches, roundRobinSchedule.length)
    : getFinalSeriesMatches(offlinePlayoffSchedule, matches, ftcMode);
  const tournamentWinner = isFG
    ? computeFGTournamentWinner(finalSeriesMatches)
    : computeDaVinciTournamentWinner(finalSeriesMatches);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const swipeHandlers = useSwipe ? useSwipeable({
    onSwipedLeft:  () => nextMatch(),
    onSwipedRight: () => previousMatch(),
    onSwipedDown:  () => { if (usePullDownToUpdate) getSchedule(); },
    preventScrollOnSwipe: true,
  }) : {};

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useHotkeys("right", () => nextMatch(), { scopes: "matchNavigation" });
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useHotkeys("left",  () => previousMatch(), { scopes: "matchNavigation" });

  return (
    <div className="gatool-playoff-bracket" {...swipeHandlers} style={{ width: "100%" }}>
      {!matches && (
        <Alert variant="warning" className="gatool-awaiting-message">
          <div><img src="loadingIcon.gif" alt="Loading data..." /></div>
          <div>Waiting for Playoff Match Schedule</div>
        </Alert>
      )}
      {matches && (
        <svg
          version="1.1" id="davinci-bracket"
          xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
          x="0px" y="0px"
          viewBox={`0 0 ${svgW} ${svgH}`}
          enableBackground={`new 0 0 ${svgW} ${svgH}`}
          xmlSpace="preserve"
        >
          <RoundRobinBackground
            svgW={svgW} svgH={svgH} top={TOP} availableH={availableH}
            eventLabel={eventLabel} numRounds={numRounds} title={bracketTitle}
          />
          <RoundRobinMatches
            schedule={roundRobinSchedule}
            matchesPerRound={matchesPerRound}
            isCurrentMatch={isCurrentMatch}
            getMatchLabel={getMatchLabel}
            getAllianceNameForDisplay={getAllianceNameForDisplay}
            getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
            getMatchWinnerForDisplay={getMatchWinnerForDisplay}
            getMatchScoreForDisplay={getMatchScoreForDisplay}
          />
          <RoundRobinFinalsSection
            finalsMatchNumber={finalsMatchNumber}
            svgW={svgW}
            isCurrentMatch={isCurrentMatch}
            isInFinalsView={isInFinalsView}
            getAllianceNameForDisplay={getAllianceNameForDisplay}
            getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
            tournamentWinner={tournamentWinner}
            ftcMode={ftcMode}
            finalSeriesMatches={finalSeriesMatches}
            finalsX={finalsX}
            finalsY={finalsY}
          />
        </svg>
      )}
    </div>
  );
}

export default DaVinciTournamentBracket;
