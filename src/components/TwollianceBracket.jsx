import { useHotkeys } from "react-hotkeys-hook";
import { useSwipeable } from "react-swipeable";
import PlayoffMatch from "./PlayoffMatch";
import FinalsMatchIndicator from "./FinalsMatchIndicator";
import { GOLD, RED, BLUE, black, bold, PLAYOFF_MATCH_GRAY_BOX_CENTER_X, INDICATOR_SPACING } from "./bracketConstants";
import { countConsecutiveFinalsSlotsFromWinnerGetter } from "../utils/bracketHelpers";

function computeTwoAllianceTournamentWinner(matches) {
	const tournamentWinner = {
		red: 0,
		blue: 0,
		winner: "",
		level: 0,
	};
	if (!matches?.length) {
		return tournamentWinner;
	}
	for (let finalsMatchIndex = 0; finalsMatchIndex < 6; finalsMatchIndex++) {
		const finalsMatch = matches[finalsMatchIndex];
		if (finalsMatch?.winner?.winner === "red") {
			tournamentWinner.red += 1;
		}
		if (finalsMatch?.winner?.winner === "blue") {
			tournamentWinner.blue += 1;
		}
	}
	if (tournamentWinner.red >= 2) {
		tournamentWinner.winner = "red";
	} else if (tournamentWinner.blue >= 2) {
		tournamentWinner.winner = "blue";
	}
	const match6 = matches[5]?.winner;
	if (match6?.tieWinner === "red") {
		tournamentWinner.winner = "red";
		tournamentWinner.level = match6.level;
	} else if (match6?.tieWinner === "blue") {
		tournamentWinner.winner = "blue";
		tournamentWinner.level = match6.level;
	}
	return tournamentWinner;
}

function TwoAllianceBracket({ nextMatch, previousMatch, getSchedule, useSwipe, usePullDownToUpdate, eventLabel, ftcMode, matches, allianceNumbers, allianceName, matchScore, matchWinner }) {
	const tournamentWinner = computeTwoAllianceTournamentWinner(matches);
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

	// Wrapper functions for PlayoffMatch and FinalsMatchIndicator components
	const getAllianceNameForDisplay = (matchNumber, alliance) => allianceName(matchNumber, alliance);
	const getAllianceNumbersForDisplay = (matchNumber, alliance) => allianceNumbers(matchNumber, alliance);
	const getFinalsMatchWinnerForDisplay = (matchNumber) => matchWinner(matchNumber);
	const getFinalsMatchScoreForDisplay = (matchNumber, alliance) => matchScore(matchNumber, alliance);
	const BLACK = "#000000";
	const WHITE = "#FFFFFF";
	const bracketTitleFontFamily = eventLabel.length > 50 ? "'myriad-pro-condensed'" : "'myriad-pro'";

	return (
		<div className="gatool-playoff-bracket" style={{
			"width": "100%"
		}} {...swipeHandlers}>
			{/* <?xml version="1.0" encoding="utf-8"?> */}
			<svg id="TwoAllianceBracket" data-name="2AllianceBracket" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1076 568">

				<g id="background">
					<rect width="1076" height="568" fill="#fff" />
					<rect x="500.51" y="128" width="75" height="344.61" fill="#d9d8d7" />
					<text transform="translate(505.92 123.26)" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="20px" ><tspan x="0" y="0">FINALS</tspan></text>
					<text id="playoffBracketTitle" transform="translate(538 49.69)" dominantBaseline="middle" textAnchor="middle" fontFamily={bracketTitleFontFamily} fontWeight={black} fontStyle={"normal"} fontSize="38px">{eventLabel}</text>
				</g>

				<PlayoffMatch
					x={425}
					y={220}
					matchNumber={1}
					onClick={() => {}}
					isCurrentMatch={false}
					isInFinalsView={true}
					getAllianceNameForDisplay={getAllianceNameForDisplay}
					getAllianceNumbersForDisplay={getAllianceNumbersForDisplay}
					tournamentWinner={tournamentWinner}
					ftcMode={ftcMode}
					colors={{ RED, BLUE, GOLD, BLACK, WHITE }}
					fontWeights={{ bold }}
				/>
		<FinalsMatchIndicator
			x={425 + PLAYOFF_MATCH_GRAY_BOX_CENTER_X}
			y={315}
			firstFinalsMatchNumber={1}
			finalsCount={countConsecutiveFinalsSlotsFromWinnerGetter(getFinalsMatchWinnerForDisplay, 1, 6)}
			indicatorSpacing={INDICATOR_SPACING}
			indicatorScale={1.2}
			getFinalsMatchWinnerForDisplay={getFinalsMatchWinnerForDisplay}
			getFinalsMatchScoreForDisplay={getFinalsMatchScoreForDisplay}
		/>



			</svg>

		</div>
	)
}

export default TwoAllianceBracket;