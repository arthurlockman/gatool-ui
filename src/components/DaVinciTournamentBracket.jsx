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
} from "../utils/daVinciHelpers";

// ---- Layout constants ----
const MATCH_SCALE      = 1.8;
const MATCH_NATIVE_W   = 194.07;
const MATCH_NATIVE_H   = 72.46;
const MATCH_W          = MATCH_NATIVE_W * MATCH_SCALE;
const MATCH_HEIGHT     = MATCH_NATIVE_H * MATCH_SCALE;
const COL_W            = 340;
const MATCH_X_OFFSET   = (COL_W - MATCH_W) / 2 + 15;
const SVG_W            = 5 * COL_W;
const TOP              = 145;
const V_SPACING        = 55;
const AVAILABLE_H      = 3 * MATCH_HEIGHT + 4 * V_SPACING;

const FINALS_MATCH_NATIVE_H = 168.1;
const FINALS_MATCH_NATIVE_W = 240.5;
const FINALS_SCALE          = 1.8;
const FINALS_MATCH_H        = FINALS_MATCH_NATIVE_H * FINALS_SCALE;
const FINALS_MATCH_W        = FINALS_MATCH_NATIVE_W * FINALS_SCALE;
const FINALS_ROW_TOP        = TOP + AVAILABLE_H;
const FINALS_Y              = FINALS_ROW_TOP+10;
const FINALS_X              = (SVG_W - FINALS_MATCH_W) / 2;
const SVG_H                 = FINALS_Y + FINALS_MATCH_H + 60;

const DIVIDER_COLOR = "#DBDAD9";
const matchXForRound = (round) => (round - 1) * COL_W + MATCH_X_OFFSET;
const matchYForSlot  = (slot)  => TOP + V_SPACING + slot * (MATCH_HEIGHT + V_SPACING);
const dividerX       = (round) => round * COL_W - 5;

// ---- Sub-components ----

function DaVinciBracketBackground({ svgW, svgH, top, availableH, eventLabel }) {
  return (
    <g id="background">
      <rect x="1" fill="#FFFFFF" width={svgW - 2} height={svgH} />
      {[1, 2, 3, 4].map((round) => (
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
        da Vinci Tournament Round Robin
      </text>
      {["ROUND 1", "ROUND 2", "ROUND 3", "ROUND 4", "ROUND 5"].map((label, i) => (
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

function DaVinciRoundMatches({
  isCurrentMatch, getMatchLabel,
  getAllianceNameForDisplay, getAllianceNumbersForDisplay,
  getMatchWinnerForDisplay, getMatchScoreForDisplay,
}) {
  return (
    <>
      {DA_VINCI_SCHEDULE.map(({ matchNumber, round, redPlaceHolder, bluePlaceHolder }) => {
        const slot = (matchNumber - 1) % 3;
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

function DaVinciFinalsSection({
  isCurrentMatch, isInFinalsView,
  getAllianceNameForDisplay, getAllianceNumbersForDisplay,
  tournamentWinner, ftcMode,
  finalSeriesMatches,
}) {
  const getSlotScore  = (bracketMatchNumber, alliance) =>
    getFinalsSlotScore(finalSeriesMatches, bracketMatchNumber - 16, alliance);
  const getSlotWinner = (bracketMatchNumber) =>
    getFinalsSlotWinner(finalSeriesMatches, bracketMatchNumber - 16);

  // Center of the right-side score area in SVG space (native midpoint of x=153.6..230.5 = 192, scaled)
  const indicatorCenterX = FINALS_X + PLAYOFF_MATCH_GRAY_BOX_CENTER_X * FINALS_SCALE;
  // Dot y so the full dot+scores group is vertically centered in the box.
  // Native box spans y=-10..158.1 (center=74.05). Indicator element spans -r..(textOffsetY+lineSpacing)=(-8..40), midpoint=16.
  // So dot y = boxCenter - 16, scaled: FINALS_Y + (74.05 - 16) * FINALS_SCALE
  const indicatorY = FINALS_Y + (86 + 28 / FINALS_SCALE) * FINALS_SCALE;
  // Spacing scaled proportionally from 35px
  const indicatorSpacing = INDICATOR_SPACING * FINALS_SCALE;

  return (
    <>
      <g transform={`translate(${FINALS_X}, ${FINALS_Y}) scale(${FINALS_SCALE})`}>
        <PlayoffMatch
          x={0} y={0}
          matchNumber={16}
          isCurrentMatch={isCurrentMatch(16)}
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
        firstFinalsMatchNumber={16}
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
 * Da Vinci Tournament Bracket for FTCCMP1.
 * 6 Division Champions play a 15-match round-robin (5 rounds × 3 matches),
 * then the top 2 (RR1 red, RR2 blue) compete in a best-of-3 Event Finals.
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
  const currentPlayoffMatch = currentMatch - qualsLength;

  const isCurrentMatch = (n) =>
    isCurrentMatchHelper(n, currentPlayoffMatch, ftcMode, offlinePlayoffSchedule, matches);

  const isInFinalsView = computeIsInFinalsView(
    currentPlayoffMatch, 16, ftcMode, offlinePlayoffSchedule, matches,
  );

  const getMatchLabel = (n) => `MATCH ${n}`;

  const getAllianceNumbersForDisplay = (n, color) =>
    getAllianceNumbersForDisplayHelper(
      n, color, ftcMode, offlinePlayoffSchedule, matches, allianceNumbers, alliances, remapNumberToString,
    );

  const getAllianceNameForDisplay = (n, color) =>
    getAllianceNameForDisplayHelper(
      n, color, ftcMode, offlinePlayoffSchedule, matches, allianceName, alliances, remapNumberToString, 16,
    );

  const getMatchScoreForDisplay = (n, alliance) =>
    getMatchScoreForDisplayHelper(n, alliance, ftcMode, offlinePlayoffSchedule, matches, matchScore);

  const getMatchWinnerForDisplay = (n) =>
    getMatchWinnerForDisplayHelper(n, ftcMode, offlinePlayoffSchedule, matches, matchWinner);

  const finalSeriesMatches = getFinalSeriesMatches(offlinePlayoffSchedule, matches, ftcMode);
  const tournamentWinner   = computeDaVinciTournamentWinner(finalSeriesMatches);

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
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          enableBackground={`new 0 0 ${SVG_W} ${SVG_H}`}
          xmlSpace="preserve"
        >
          <DaVinciBracketBackground
            svgW={SVG_W} svgH={SVG_H} top={TOP} availableH={AVAILABLE_H}
            eventLabel={eventLabel}
          />
          <DaVinciRoundMatches
            isCurrentMatch={isCurrentMatch}
            getMatchLabel={getMatchLabel}
            getAllianceNameForDisplay={getAllianceNameForDisplay}
            getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
            getMatchWinnerForDisplay={getMatchWinnerForDisplay}
            getMatchScoreForDisplay={getMatchScoreForDisplay}
          />
          <DaVinciFinalsSection
            isCurrentMatch={isCurrentMatch}
            isInFinalsView={isInFinalsView}
            getAllianceNameForDisplay={getAllianceNameForDisplay}
            getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
            tournamentWinner={tournamentWinner}
            ftcMode={ftcMode}
            finalSeriesMatches={finalSeriesMatches}
          />
        </svg>
      )}
    </div>
  );
}

export default DaVinciTournamentBracket;
