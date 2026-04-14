import { useState } from "react";

/**
 * Custom hook for shared bracket winner selection state
 * @returns Object with state values and handlers for winner selection modal
 */
export function useBracketState() {
	const [showSelectWinner, setShowSelectWinner] = useState(false);
	const [showConfirmWinner, setShowConfirmWinner] = useState(false);
	const [winningAlliance, setWinningAlliance] = useState(null);
	const [winnerMatch, setWinnerMatch] = useState(-1);

	const handleChooseWinner = (winner) => {
		setWinningAlliance(winner);
		setShowSelectWinner(false);
		setShowConfirmWinner(true);
	};

	const handleClose = () => {
		setWinnerMatch(-1);
		setShowSelectWinner(false);
		setShowConfirmWinner(false);
	};

	const resetWinnerState = () => {
		setWinnerMatch(-1);
		setShowSelectWinner(false);
		setShowConfirmWinner(false);
	};

	return {
		showSelectWinner,
		setShowSelectWinner,
		showConfirmWinner,
		setShowConfirmWinner,
		winningAlliance,
		setWinningAlliance,
		winnerMatch,
		setWinnerMatch,
		handleChooseWinner,
		handleClose,
		resetWinnerState,
	};
}
