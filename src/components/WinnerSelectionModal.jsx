import { Button, Col, Container, Modal, Row } from "react-bootstrap";

/**
 * Shared modal components for winner selection and confirmation across all bracket types.
 * @param {Object} props
 * @param {boolean} props.showSelectWinner - Whether to show the select winner modal
 * @param {boolean} props.showConfirmWinner - Whether to show the confirm winner modal
 * @param {number} props.winnerMatch - The match number for winner selection
 * @param {string} props.winningAlliance - The selected winning alliance ("red", "blue", or "tie")
 * @param {Array} props.matches - The matches array
 * @param {number} props.finalsStartMatch - The first finals match number for this bracket type
 * @param {Object} props.offlinePlayoffSchedule - The offline playoff schedule object
 * @param {Function} props.getAllianceNameForDisplay - Function to get alliance name for display
 * @param {Function} props.handleChooseWinner - Handler for choosing a winner
 * @param {Function} props.handleConfirmWinner - Handler for confirming the winner
 * @param {Function} props.handleClose - Handler for closing the modal
 */
function WinnerSelectionModal({
	showSelectWinner,
	showConfirmWinner,
	winnerMatch,
	winningAlliance,
	matches,
	finalsStartMatch,
	offlinePlayoffSchedule,
	getAllianceNameForDisplay,
	handleChooseWinner,
	handleConfirmWinner,
	handleClose,
}) {
	return (
		<>
			<Modal centered={true} show={showSelectWinner} size="lg" onHide={handleClose}>
				<Modal.Header className={"allianceAccept"} closeVariant={"white"} closeButton>
					<Modal.Title >{winnerMatch >= 0 ? <b>Select a winner for {matches[winnerMatch - 1]?.description}</b> : <b>Select a winner  </b>}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Container fluid>
						<Row>
							<Col style={{ backgroundColor: "red", color: "white", fontWeight: "bold", fontSize: "40px", textAlign: "center", padding: "50px 0" }} xs={(winnerMatch < finalsStartMatch) ? 5 : 4} onClick={() => { handleChooseWinner("red") }} variant="danger">{getAllianceNameForDisplay(winnerMatch, "red")}</Col>
							{(winnerMatch < finalsStartMatch) &&
								<Col xs={2}></Col>}
							{((offlinePlayoffSchedule?.schedule?.length > finalsStartMatch) && (winnerMatch >= finalsStartMatch)) &&
								<>
									<Col xs={1}></Col>
									<Col style={{ backgroundColor: "green", color: "white", fontWeight: "bold", fontSize: "40px", textAlign: "center", padding: "50px 0" }} xs={2} onClick={() => { handleChooseWinner("tie") }}>It's a Tie!</Col>
									<Col xs={1}></Col>
								</>
							}
							<Col style={{ backgroundColor: "blue", color: "white", fontWeight: "bold", fontSize: "40px", textAlign: "center", padding: "50px 0" }} xs={(winnerMatch < finalsStartMatch) ? 5 : 4} onClick={() => { handleChooseWinner("blue") }}>{getAllianceNameForDisplay(winnerMatch, "blue")}</Col>
						</Row>
					</Container>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={handleClose}>Close without selecting a winner</Button>
				</Modal.Footer>
			</Modal>
			<Modal centered={true} show={showConfirmWinner} size="lg" onHide={handleClose}>
				<Modal.Header className={"allianceAccept"} closeVariant={"white"} closeButton>
					<Modal.Title ><b>Confirm winner for {matches[winnerMatch - 1]?.description}</b></Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Container fluid>
						<Row>
							<Col xs={4}></Col>
							<Col style={{ backgroundColor: winningAlliance === "blue" ? "blue" : winningAlliance === "red" ? "red" : "green", color: "white", fontWeight: "bold", fontSize: "40px", textAlign: "center", padding: "50px 0" }} xs={4} onClick={handleConfirmWinner}>{winningAlliance === "tie" ? "It's a tie!" : getAllianceNameForDisplay(winnerMatch, winningAlliance)}</Col>
							<Col xs={4}></Col>
						</Row>
					</Container>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={handleClose}>Close without selecting a winner</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
}

export default WinnerSelectionModal;
