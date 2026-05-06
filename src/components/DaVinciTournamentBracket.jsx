import { Alert } from "react-bootstrap";
import { useHotkeys } from "react-hotkeys-hook";
import { useSwipeable } from "react-swipeable";
import Match from "./Match";
import PlayoffMatch from "./PlayoffMatch";
import FinalsMatchIndicator from "./FinalsMatchIndicator";
import {
  GOLD,
  RED,
  BLUE,
  GREEN,
  BLACK,
  WHITE,
  bold,
  semibold,
  black,
} from "./bracketConstants";
import {
  isCurrentMatchHelper,
  computeIsInFinalsView,
  getAllianceNameForDisplay as getAllianceNameForDisplayHelper,
  getAllianceNumbersForDisplay as getAllianceNumbersForDisplayHelper,
  getMatchScoreForDisplay as getMatchScoreForDisplayHelper,
  getMatchWinnerForDisplay as getMatchWinnerForDisplayHelper,
} from "../utils/bracketHelpers";

/**
 * Da Vinci Tournament Bracket for FTCCMP1
 *
 * 6 Division Champions play a 15-match round-robin (5 rounds, 3 matches per round),
 * then the top 2 (RR1 and RR2) compete in a best-of-3 Event Finals.
 *
 * Round 1: M1 Franklin vs Edison, M2 Goodall vs Jackson, M3 Ross vs Lovelace
 * Round 2: M4 Franklin vs Goodall, M5 Jackson vs Ross, M6 Edison vs Lovelace
 * Round 3: M7 Franklin vs Jackson, M8 Edison vs Ross, M9 Goodall vs Lovelace
 * Round 4: M10 Ross vs Franklin, M11 Edison vs Goodall, M12 Lovelace vs Jackson
 * Round 5: M13 Goodall vs Ross, M14 Jackson vs Edison, M15 Lovelace vs Franklin
 * Finals (series 16): RR2 vs RR1 (best of 3)
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
  // Finals for da Vinci start at series 16
  const finalsStartMatch = 16;
  const currentPlayoffMatch = currentMatch - qualsLength;

  const isCurrentMatch = (n) =>
    isCurrentMatchHelper(
      n,
      currentPlayoffMatch,
      ftcMode,
      offlinePlayoffSchedule,
      matches,
    );

  const isInFinalsView = computeIsInFinalsView(
    currentPlayoffMatch,
    finalsStartMatch,
    ftcMode,
    offlinePlayoffSchedule,
    matches,
  );

  const getMatchLabel = (bracketMatchNumber) => `MATCH ${bracketMatchNumber}`;

  const originalAllianceNumbers = allianceNumbers;
  const originalAllianceName = allianceName;

  const getAllianceNumbersForDisplay = (bracketMatchNumber, allianceColor) =>
    getAllianceNumbersForDisplayHelper(
      bracketMatchNumber,
      allianceColor,
      ftcMode,
      offlinePlayoffSchedule,
      matches,
      originalAllianceNumbers,
      alliances,
      remapNumberToString,
    );

  const getAllianceNameForDisplay = (bracketMatchNumber, allianceColor) =>
    getAllianceNameForDisplayHelper(
      bracketMatchNumber,
      allianceColor,
      ftcMode,
      offlinePlayoffSchedule,
      matches,
      originalAllianceName,
      alliances,
      remapNumberToString,
      16,
    );

  const getMatchScoreForDisplay = (bracketMatchNumber, alliance) =>
    getMatchScoreForDisplayHelper(
      bracketMatchNumber,
      alliance,
      ftcMode,
      offlinePlayoffSchedule,
      matches,
      matchScore,
    );

  const getMatchWinnerForDisplay = (bracketMatchNumber) =>
    getMatchWinnerForDisplayHelper(
      bracketMatchNumber,
      ftcMode,
      offlinePlayoffSchedule,
      matches,
      matchWinner,
    );

  // Finals series: series 16 (RR2 vs RR1)
  const scheduleToCheckForFinals = offlinePlayoffSchedule?.schedule || matches;
  const finalSeriesMatchesForDisplay =
    ftcMode && scheduleToCheckForFinals
      ? scheduleToCheckForFinals
          .filter((m) => m.series === 16)
          .sort((a, b) => {
            const aMatchNum = a.originalMatchNumber ?? a.matchNumber ?? 0;
            const bMatchNum = b.originalMatchNumber ?? b.matchNumber ?? 0;
            return aMatchNum - bMatchNum;
          })
      : [];

  const shouldDisplayFinalsMatch = (slotIndex) => {
    return slotIndex < finalSeriesMatchesForDisplay.length;
  };

  // Finals scores/winner for a given slot index (0-based within finals series)
  const getFinalsMatchScoreForDisplay = (slotIndex, alliance) => {
    const m = finalSeriesMatchesForDisplay[slotIndex];
    if (!m) return null;
    return alliance === "red"
      ? m.scoreRedFinal
      : alliance === "blue"
        ? m.scoreBlueFinal
        : null;
  };

  const getFinalsMatchWinnerForDisplay = (slotIndex) => {
    const m = finalSeriesMatchesForDisplay[slotIndex];
    return m?.winner ?? null;
  };

  // Tournament winner: in FTC championship finals, higher seed (red = RR1) wins with 1 win; lower seed (blue = RR2) needs 2
  let tournamentWinner = { red: 0, blue: 0, winner: "", level: 0 };
  for (const fm of finalSeriesMatchesForDisplay) {
    if (fm?.winner?.winner === "red") tournamentWinner.red += 1;
    if (fm?.winner?.winner === "blue") tournamentWinner.blue += 1;
  }
  if (tournamentWinner.red >= 1) {
    tournamentWinner.winner = "red";
  } else if (tournamentWinner.blue >= 2) {
    tournamentWinner.winner = "blue";
  }
  if (finalSeriesMatchesForDisplay.length > 0) {
    const lastFinal =
      finalSeriesMatchesForDisplay[finalSeriesMatchesForDisplay.length - 1];
    if (lastFinal?.winner?.tieWinner === "red") {
      tournamentWinner.winner = "red";
      tournamentWinner.level = lastFinal.winner.level;
    } else if (lastFinal?.winner?.tieWinner === "blue") {
      tournamentWinner.winner = "blue";
      tournamentWinner.level = lastFinal.winner.level;
    }
  }

  // Adapters so FinalsMatchIndicator slot 0/1/2 maps to the real series matches
  // FinalsMatchIndicator expects matchNumber arg to derive its slot (matchNumber - 16)
  // We pass bracketMatchNumber = 16+slotIndex so slot 0 = M16, slot 1 = M17, slot 2 = M18
  const getFinalsSlotScore = (bracketMatchNumber, alliance) =>
    getFinalsMatchScoreForDisplay(bracketMatchNumber - 16, alliance);
  const getFinalsSlotWinner = (bracketMatchNumber) =>
    getFinalsMatchWinnerForDisplay(bracketMatchNumber - 16);

  // Override FinalsMatchIndicator's internal circle id derivation: it uses matchNumber - 9
  // We pass fake matchNumbers 16/17/18 but the indicator only uses them for circle id and score lookup.
  // We override the getters so the score/winner lookups resolve correctly.

  const swipeHandlers = useSwipe
    ? // eslint-disable-next-line react-hooks/rules-of-hooks
      useSwipeable({
        onSwipedLeft: () => nextMatch(),
        onSwipedRight: () => previousMatch(),
        onSwipedDown: () => {
          if (usePullDownToUpdate) getSchedule();
        },
        preventScrollOnSwipe: true,
      })
    : {};

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useHotkeys("right", () => nextMatch(), { scopes: "matchNavigation" });
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useHotkeys("left", () => previousMatch(), { scopes: "matchNavigation" });

  // ---- SVG Layout ----
  // viewBox: 1500 wide x 810 tall
  // 6 columns: Round 1–5 (5 match columns) + Finals column
  // Each round column separator is a gray band, same approach as SixAllianceBracket
  // Round columns: x positions for column dividers at 215, 410, 605, 800, 995 (each 195px wide)
  // Finals column starts at 1020
  // Match component: ~194px wide (22.43 label + 171.64 body = 194.07), height 72.46
  // 3 matches per round column, stacked vertically with spacing
  // Column width: ~195px. Usable match area inside = ~175px, left margin ~10px for match x
  // Round columns:
  //   R1: x=10, R2: x=215, R3: x=410, R4: x=605, R5: x=800
  // Finals: x=1020 (PlayoffMatch), FinalsMatchIndicators to the right

  // Match component native size: ~194px wide, 72.46px tall
  const MATCH_SCALE = 1.8;
  const MATCH_NATIVE_W = 194.07;
  const MATCH_NATIVE_H = 72.46;
  const MATCH_W = MATCH_NATIVE_W * MATCH_SCALE; // ~349px
  const MATCH_HEIGHT = MATCH_NATIVE_H * MATCH_SCALE; // ~130px

  // 5 round columns across the full width
  const COL_W = 340;
  const MATCH_X_OFFSET = (COL_W - MATCH_W) / 2 + 15;
  const matchXForRound = (round) => (round - 1) * COL_W + MATCH_X_OFFSET;
  const SVG_W = 5 * COL_W; // 1700

  // TOP: where round match content begins (moved up 40px)
  const TOP = 145;
  const V_SPACING = 55;
  const AVAILABLE_H = 3 * MATCH_HEIGHT + 4 * V_SPACING;
  const matchYForSlot = (slot) => TOP + V_SPACING + slot * (MATCH_HEIGHT + V_SPACING);

  // Finals row: PlayoffMatch scaled 1.6x, centered below the 5 round columns
  // PlayoffMatch native: background spans x=-10..230.5 (240.5px wide), y=-10..158.1 (168.1px tall)
  const FINALS_MATCH_NATIVE_H = 168.1;
  const FINALS_MATCH_NATIVE_W = 240.5;
  const FINALS_SCALE = 1.8;
  const FINALS_MATCH_H = FINALS_MATCH_NATIVE_H * FINALS_SCALE;
  const FINALS_MATCH_W = FINALS_MATCH_NATIVE_W * FINALS_SCALE;

  const FINALS_ROW_TOP = TOP + AVAILABLE_H + 50; // gap below round columns
  const finalsY = FINALS_ROW_TOP-50;
  const finalsX = (SVG_W - FINALS_MATCH_W) / 2; // horizontally centered

  const SVG_H = finalsY + FINALS_MATCH_H + 60; // total height

  // Column divider gray bands (between the 5 round columns only)
  const dividerX = (round) => round * COL_W - 5;

  // FinalsMatchIndicators: scaled positions inside the 1.6x PlayoffMatch box
  // Indicators are 1.5x larger; spaced to fit up to 6 within the box
  
  const INDICATOR_SPACING = 34 * FINALS_SCALE;
  const finalsIndicatorBaseX = finalsX + 102 * FINALS_SCALE;
  const finalsIndicatorY = finalsY + FINALS_MATCH_H / 2 + 25;

  return (
    <div
      className="gatool-playoff-bracket"
      {...swipeHandlers}
      style={{ width: "100%" }}
    >
      {!matches && (
        <div>
          <Alert variant="warning" className="gatool-awaiting-message">
            <div>
              <img src="loadingIcon.gif" alt="Loading data..." />
            </div>
            <div>Waiting for Playoff Match Schedule</div>
          </Alert>
        </div>
      )}
      {matches && (
        <svg
          version="1.1"
          id="davinci-bracket"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          enableBackground={`new 0 0 ${SVG_W} ${SVG_H}`}
          xmlSpace="preserve"
        >
          <g id="background">
            {/* White background */}
            <rect x="1" fill="#FFFFFF" width={SVG_W - 2} height={SVG_H} />

            {/* Column divider gray bands between the 5 round columns only */}
            {[1, 2, 3, 4].map((round) => (
              <rect
                key={`divider${round}`}
                x={dividerX(round)}
                y={TOP-10}
                fill="#DBDAD9"
                width="5"
                height={AVAILABLE_H-20}
              />
            ))}

            {/* Event title */}
            <text
              id="playoffBracket"
              x={SVG_W / 2}
              y="52"
              dominantBaseline="middle"
              textAnchor="middle"
              fontFamily={eventLabel?.length > 50 ? "'myriad-pro-condensed'" : "'myriad-pro'"}
              fontWeight={black}
              fontStyle="normal"
              fontSize="48px"
            >
              {eventLabel}
            </text>

            {/* Subtitle */}
            <text
              x={SVG_W / 2}
              y="95"
              dominantBaseline="middle"
              textAnchor="middle"
              fontFamily="'myriad-pro'"
              fontWeight={bold}
              fontStyle="normal"
              fontSize="28px"
              fill="#555555"
            >
              da Vinci Tournament Round Robin
            </text>

            {/* Round column headers */}
            {["ROUND 1", "ROUND 2", "ROUND 3", "ROUND 4", "ROUND 5"].map((label, i) => (
              <text
                key={`header${i}`}
                x={i * COL_W + COL_W / 2}
                y="163"
                textAnchor="middle"
                fontFamily="'myriad-pro'"
                fontWeight={bold}
                fontStyle="normal"
                fontSize="28px"
              >
                {label}
              </text>
            ))}

          </g>

          {/* ===== ROUND 1 ===== */}
          {/* M1: Franklin (Red) vs Edison (Blue) */}
          <g
            transform={`translate(${matchXForRound(1)}, ${matchYForSlot(0)}) scale(${MATCH_SCALE})`}
          >
            <Match
              x={0}
              y={0}
              matchNumber={1}
              isCurrentMatch={isCurrentMatch(1)}
              getMatchLabel={getMatchLabel}
              getAllianceNameForDisplay={getAllianceNameForDisplay}
              getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
              getMatchWinnerForDisplay={getMatchWinnerForDisplay}
              getMatchScoreForDisplay={getMatchScoreForDisplay}
              redPlaceHolder="Franklin"
              bluePlaceHolder="Edison"
              colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
              fontWeights={{ bold }}
            />
          </g>
          {/* M2: Goodall (Red) vs Jackson (Blue) */}
          <g
            transform={`translate(${matchXForRound(1)}, ${matchYForSlot(1)}) scale(${MATCH_SCALE})`}
          >
            <Match
              x={0}
              y={0}
              matchNumber={2}
              isCurrentMatch={isCurrentMatch(2)}
              getMatchLabel={getMatchLabel}
              getAllianceNameForDisplay={getAllianceNameForDisplay}
              getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
              getMatchWinnerForDisplay={getMatchWinnerForDisplay}
              getMatchScoreForDisplay={getMatchScoreForDisplay}
              redPlaceHolder="Goodall"
              bluePlaceHolder="Jackson"
              colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
              fontWeights={{ bold }}
            />
          </g>
          {/* M3: Ross (Red) vs Lovelace (Blue) */}
          <g
            transform={`translate(${matchXForRound(1)}, ${matchYForSlot(2)}) scale(${MATCH_SCALE})`}
          >
            <Match
              x={0}
              y={0}
              matchNumber={3}
              isCurrentMatch={isCurrentMatch(3)}
              getMatchLabel={getMatchLabel}
              getAllianceNameForDisplay={getAllianceNameForDisplay}
              getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
              getMatchWinnerForDisplay={getMatchWinnerForDisplay}
              getMatchScoreForDisplay={getMatchScoreForDisplay}
              redPlaceHolder="Ross"
              bluePlaceHolder="Lovelace"
              colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
              fontWeights={{ bold }}
            />
          </g>

          {/* ===== ROUND 2 ===== */}
          {/* M4: Franklin (Red) vs Goodall (Blue) */}
          <g
            transform={`translate(${matchXForRound(2)}, ${matchYForSlot(0)}) scale(${MATCH_SCALE})`}
          >
            <Match
              x={0}
              y={0}
              matchNumber={4}
              isCurrentMatch={isCurrentMatch(4)}
              getMatchLabel={getMatchLabel}
              getAllianceNameForDisplay={getAllianceNameForDisplay}
              getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
              getMatchWinnerForDisplay={getMatchWinnerForDisplay}
              getMatchScoreForDisplay={getMatchScoreForDisplay}
              redPlaceHolder="Franklin"
              bluePlaceHolder="Goodall"
              colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
              fontWeights={{ bold }}
            />
          </g>
          {/* M5: Jackson (Red) vs Ross (Blue) */}
          <g
            transform={`translate(${matchXForRound(2)}, ${matchYForSlot(1)}) scale(${MATCH_SCALE})`}
          >
            <Match
              x={0}
              y={0}
              matchNumber={5}
              isCurrentMatch={isCurrentMatch(5)}
              getMatchLabel={getMatchLabel}
              getAllianceNameForDisplay={getAllianceNameForDisplay}
              getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
              getMatchWinnerForDisplay={getMatchWinnerForDisplay}
              getMatchScoreForDisplay={getMatchScoreForDisplay}
              redPlaceHolder="Jackson"
              bluePlaceHolder="Ross"
              colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
              fontWeights={{ bold }}
            />
          </g>
          {/* M6: Edison (Red) vs Lovelace (Blue) */}
          <g
            transform={`translate(${matchXForRound(2)}, ${matchYForSlot(2)}) scale(${MATCH_SCALE})`}
          >
            <Match
              x={0}
              y={0}
              matchNumber={6}
              isCurrentMatch={isCurrentMatch(6)}
              getMatchLabel={getMatchLabel}
              getAllianceNameForDisplay={getAllianceNameForDisplay}
              getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
              getMatchWinnerForDisplay={getMatchWinnerForDisplay}
              getMatchScoreForDisplay={getMatchScoreForDisplay}
              redPlaceHolder="Edison"
              bluePlaceHolder="Lovelace"
              colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
              fontWeights={{ bold }}
            />
          </g>

          {/* ===== ROUND 3 ===== */}
          {/* M7: Franklin (Red) vs Jackson (Blue) */}
          <g
            transform={`translate(${matchXForRound(3)}, ${matchYForSlot(0)}) scale(${MATCH_SCALE})`}
          >
            <Match
              x={0}
              y={0}
              matchNumber={7}
              isCurrentMatch={isCurrentMatch(7)}
              getMatchLabel={getMatchLabel}
              getAllianceNameForDisplay={getAllianceNameForDisplay}
              getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
              getMatchWinnerForDisplay={getMatchWinnerForDisplay}
              getMatchScoreForDisplay={getMatchScoreForDisplay}
              redPlaceHolder="Franklin"
              bluePlaceHolder="Jackson"
              colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
              fontWeights={{ bold }}
            />
          </g>
          {/* M8: Edison (Red) vs Ross (Blue) */}
          <g
            transform={`translate(${matchXForRound(3)}, ${matchYForSlot(1)}) scale(${MATCH_SCALE})`}
          >
            <Match
              x={0}
              y={0}
              matchNumber={8}
              isCurrentMatch={isCurrentMatch(8)}
              getMatchLabel={getMatchLabel}
              getAllianceNameForDisplay={getAllianceNameForDisplay}
              getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
              getMatchWinnerForDisplay={getMatchWinnerForDisplay}
              getMatchScoreForDisplay={getMatchScoreForDisplay}
              redPlaceHolder="Edison"
              bluePlaceHolder="Ross"
              colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
              fontWeights={{ bold }}
            />
          </g>
          {/* M9: Goodall (Red) vs Lovelace (Blue) */}
          <g
            transform={`translate(${matchXForRound(3)}, ${matchYForSlot(2)}) scale(${MATCH_SCALE})`}
          >
            <Match
              x={0}
              y={0}
              matchNumber={9}
              isCurrentMatch={isCurrentMatch(9)}
              getMatchLabel={getMatchLabel}
              getAllianceNameForDisplay={getAllianceNameForDisplay}
              getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
              getMatchWinnerForDisplay={getMatchWinnerForDisplay}
              getMatchScoreForDisplay={getMatchScoreForDisplay}
              redPlaceHolder="Goodall"
              bluePlaceHolder="Lovelace"
              colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
              fontWeights={{ bold }}
            />
          </g>

          {/* ===== ROUND 4 ===== */}
          {/* M10: Ross (Red) vs Franklin (Blue) */}
          <g
            transform={`translate(${matchXForRound(4)}, ${matchYForSlot(0)}) scale(${MATCH_SCALE})`}
          >
            <Match
              x={0}
              y={0}
              matchNumber={10}
              isCurrentMatch={isCurrentMatch(10)}
              getMatchLabel={getMatchLabel}
              getAllianceNameForDisplay={getAllianceNameForDisplay}
              getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
              getMatchWinnerForDisplay={getMatchWinnerForDisplay}
              getMatchScoreForDisplay={getMatchScoreForDisplay}
              redPlaceHolder="Ross"
              bluePlaceHolder="Franklin"
              colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
              fontWeights={{ bold }}
            />
          </g>
          {/* M11: Edison (Red) vs Goodall (Blue) */}
          <g
            transform={`translate(${matchXForRound(4)}, ${matchYForSlot(1)}) scale(${MATCH_SCALE})`}
          >
            <Match
              x={0}
              y={0}
              matchNumber={11}
              isCurrentMatch={isCurrentMatch(11)}
              getMatchLabel={getMatchLabel}
              getAllianceNameForDisplay={getAllianceNameForDisplay}
              getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
              getMatchWinnerForDisplay={getMatchWinnerForDisplay}
              getMatchScoreForDisplay={getMatchScoreForDisplay}
              redPlaceHolder="Edison"
              bluePlaceHolder="Goodall"
              colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
              fontWeights={{ bold }}
            />
          </g>
          {/* M12: Lovelace (Red) vs Jackson (Blue) */}
          <g
            transform={`translate(${matchXForRound(4)}, ${matchYForSlot(2)}) scale(${MATCH_SCALE})`}
          >
            <Match
              x={0}
              y={0}
              matchNumber={12}
              isCurrentMatch={isCurrentMatch(12)}
              getMatchLabel={getMatchLabel}
              getAllianceNameForDisplay={getAllianceNameForDisplay}
              getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
              getMatchWinnerForDisplay={getMatchWinnerForDisplay}
              getMatchScoreForDisplay={getMatchScoreForDisplay}
              redPlaceHolder="Lovelace"
              bluePlaceHolder="Jackson"
              colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
              fontWeights={{ bold }}
            />
          </g>

          {/* ===== ROUND 5 ===== */}
          {/* M13: Goodall (Red) vs Ross (Blue) */}
          <g
            transform={`translate(${matchXForRound(5)}, ${matchYForSlot(0)}) scale(${MATCH_SCALE})`}
          >
            <Match
              x={0}
              y={0}
              matchNumber={13}
              isCurrentMatch={isCurrentMatch(13)}
              getMatchLabel={getMatchLabel}
              getAllianceNameForDisplay={getAllianceNameForDisplay}
              getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
              getMatchWinnerForDisplay={getMatchWinnerForDisplay}
              getMatchScoreForDisplay={getMatchScoreForDisplay}
              redPlaceHolder="Goodall"
              bluePlaceHolder="Ross"
              colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
              fontWeights={{ bold }}
            />
          </g>
          {/* M14: Jackson (Red) vs Edison (Blue) */}
          <g
            transform={`translate(${matchXForRound(5)}, ${matchYForSlot(1)}) scale(${MATCH_SCALE})`}
          >
            <Match
              x={0}
              y={0}
              matchNumber={14}
              isCurrentMatch={isCurrentMatch(14)}
              getMatchLabel={getMatchLabel}
              getAllianceNameForDisplay={getAllianceNameForDisplay}
              getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
              getMatchWinnerForDisplay={getMatchWinnerForDisplay}
              getMatchScoreForDisplay={getMatchScoreForDisplay}
              redPlaceHolder="Jackson"
              bluePlaceHolder="Edison"
              colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
              fontWeights={{ bold }}
            />
          </g>
          {/* M15: Lovelace (Red) vs Franklin (Blue) */}
          <g
            transform={`translate(${matchXForRound(5)}, ${matchYForSlot(2)}) scale(${MATCH_SCALE})`}
          >
            <Match
              x={0}
              y={0}
              matchNumber={15}
              isCurrentMatch={isCurrentMatch(15)}
              getMatchLabel={getMatchLabel}
              getAllianceNameForDisplay={getAllianceNameForDisplay}
              getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
              getMatchWinnerForDisplay={getMatchWinnerForDisplay}
              getMatchScoreForDisplay={getMatchScoreForDisplay}
              redPlaceHolder="Lovelace"
              bluePlaceHolder="Franklin"
              colors={{ RED, BLUE, GOLD, GREEN, BLACK, WHITE }}
              fontWeights={{ bold }}
            />
          </g>

          {/* ===== FINALS (series 16) — 1.5x scale, centered below the 5 round columns ===== */}
          <g transform={`translate(${finalsX}, ${finalsY}) scale(${FINALS_SCALE})`}>
            <PlayoffMatch
              x={0}
              y={0}
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

          {/* Finals match indicators — up to 6 slots for unlimited FTC ties */}
          {[0, 1, 2, 3, 4, 5].map((slot) =>
            shouldDisplayFinalsMatch(slot) ? (
              <FinalsMatchIndicator
                key={`finalsIndicator${slot}`}
                x={finalsIndicatorBaseX + slot * INDICATOR_SPACING}
                y={finalsIndicatorY}
                matchNumber={16 + slot}
                getFinalsMatchWinnerForDisplay={getFinalsSlotWinner}
                getFinalsMatchScoreForDisplay={getFinalsSlotScore}
                overtimeOffset={0}
                indicatorScale={FINALS_SCALE}
                colors={{ RED, BLUE, GOLD, GREEN }}
                fontWeights={{ black, semibold }}
              />
            ) : null
          )}
        </svg>
      )}
    </div>
  );
}

export default DaVinciTournamentBracket;
