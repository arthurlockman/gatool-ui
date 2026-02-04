import { useHotkeys } from "react-hotkeys-hook";
import { useSwipeable } from "react-swipeable";
import PlayoffMatch from "./PlayoffMatch";
import FinalsMatchIndicator from "./FinalsMatchIndicator";

function TwoAllianceBracket({ nextMatch, previousMatch, getSchedule, useSwipe, usePullDownToUpdate, eventLabel, ftcMode, matches, allianceNumbers, allianceName, matchScore, matchWinner }) {
	//Ball colors
	const GOLD = "#FFCA10";
	const RED = "#FF0000";
	const BLUE = "#0000FF";
	const GREEN = "#09BA48";
	//font weights
	const black = "900";
	const bold = "700";
	const semibold = "600";
	//const normal = "400";

	var overtimeOffset = 0;
	var tournamentWinner = {
		"red": 0,
		"blue": 0,
		"winner": "",
		"level": 0
	}
	if (matches[5]?.actualStartTime) {
		overtimeOffset = 106;
	} else if (matches[4]?.actualStartTime) {
		overtimeOffset = 84;
	} else if (matches[3]?.actualStartTime) {
		overtimeOffset = 63;
	} else if (matches[2]?.actualStartTime) {
		overtimeOffset = 42;
	} else if (matches[1]?.actualStartTime) {
		overtimeOffset = 21;
	}

	// 2-Alliance Finals: series 1-6 (all matches are finals)
	// Access by array index (series - 1), so indices 0-5 for display matches 1-6
	for (var finalsMatchIndex = 0; finalsMatchIndex < 6; finalsMatchIndex++) {
		const finalsMatch = matches[finalsMatchIndex];
		if (finalsMatch?.winner?.winner === "red") {
			tournamentWinner.red += 1
		}
		if (finalsMatch?.winner?.winner === "blue") {
			tournamentWinner.blue += 1
		}
	}
	// Both alliances need 2 victories (best of 3) for both FTC and FRC
	if (tournamentWinner.red >= 2) {
		tournamentWinner.winner = "red";
	} else if (tournamentWinner.blue >= 2) {
		tournamentWinner.winner = "blue";
	}

	// In FRC, if we get to 6 matches, we go to tiebreakers.
	if (matches[5]?.winner?.tieWinner === "red") {
		tournamentWinner.winner = "red";
		tournamentWinner.level = matches[5]?.winner?.level;
	} else if (matches[5]?.winner?.tieWinner === "blue") {
		tournamentWinner.winner = "blue";
		tournamentWinner.level = matches[5]?.winner?.level;
	}

	const dotStart = 541;

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

	return (
		<div style={{
			"width": "100%"
		}} {...swipeHandlers}>
			{/* <?xml version="1.0" encoding="utf-8"?> */}
			<svg id="TwoAllianceBracket" data-name="2AllianceBracket" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1076 568">

				<g id="background">
					<rect width="1076" height="568" fill="#fff" />
					<rect x="500.51" y="128" width="75" height="344.61" fill="#d9d8d7" />
					<text transform="translate(505.92 123.26)" fontFamily="'myriad-pro'" fontWeight={bold} fontStyle={"normal"} fontSize="20px" ><tspan x="0" y="0">FINALS</tspan></text>
					<text id="playoffBracketTitle" transform="translate(538 49.69)" dominantBaseline="middle" textAnchor="middle" fontFamily={eventLabel.length > 50 ? "'myriad-pro-condensed'" : "'myriad-pro'"} fontWeight={black} fontStyle={"normal"} fontSize="38px">{eventLabel}</text>
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
					x={dotStart}
					y={320}
					matchNumber={1}
					getFinalsMatchWinnerForDisplay={getFinalsMatchWinnerForDisplay}
					getFinalsMatchScoreForDisplay={getFinalsMatchScoreForDisplay}
					overtimeOffset={overtimeOffset}
					colors={{ RED, BLUE, GOLD, GREEN }}
					fontWeights={{ black, semibold }}
				/>
				<FinalsMatchIndicator
					x={dotStart + 42}
					y={320}
					matchNumber={2}
					getFinalsMatchWinnerForDisplay={getFinalsMatchWinnerForDisplay}
					getFinalsMatchScoreForDisplay={getFinalsMatchScoreForDisplay}
					overtimeOffset={overtimeOffset}
					colors={{ RED, BLUE, GOLD, GREEN }}
					fontWeights={{ black, semibold }}
				/>
				<FinalsMatchIndicator
					x={dotStart + 84}
					y={320}
					matchNumber={3}
					getFinalsMatchWinnerForDisplay={getFinalsMatchWinnerForDisplay}
					getFinalsMatchScoreForDisplay={getFinalsMatchScoreForDisplay}
					overtimeOffset={overtimeOffset}
					colors={{ RED, BLUE, GOLD, GREEN }}
					fontWeights={{ black, semibold }}
				/>
				<FinalsMatchIndicator
					x={dotStart + 126}
					y={320}
					matchNumber={4}
					getFinalsMatchWinnerForDisplay={getFinalsMatchWinnerForDisplay}
					getFinalsMatchScoreForDisplay={getFinalsMatchScoreForDisplay}
					overtimeOffset={overtimeOffset}
					colors={{ RED, BLUE, GOLD, GREEN }}
					fontWeights={{ black, semibold }}
				/>
				<FinalsMatchIndicator
					x={dotStart + 168}
					y={320}
					matchNumber={5}
					getFinalsMatchWinnerForDisplay={getFinalsMatchWinnerForDisplay}
					getFinalsMatchScoreForDisplay={getFinalsMatchScoreForDisplay}
					overtimeOffset={overtimeOffset}
					colors={{ RED, BLUE, GOLD, GREEN }}
					fontWeights={{ black, semibold }}
				/>
				<FinalsMatchIndicator
					x={dotStart + 210}
					y={320}
					matchNumber={6}
					getFinalsMatchWinnerForDisplay={getFinalsMatchWinnerForDisplay}
					getFinalsMatchScoreForDisplay={getFinalsMatchScoreForDisplay}
					overtimeOffset={overtimeOffset}
					colors={{ RED, BLUE, GOLD, GREEN }}
					fontWeights={{ black, semibold }}
				/>



			</svg>

		</div>
	)
}

export default TwoAllianceBracket;