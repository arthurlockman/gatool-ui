import { Alert, Container, Table } from "react-bootstrap";
import Bracket from "../components/Bracket";
import { find } from "lodash";

function AllianceSelectionPage({ selectedEvent, playoffSchedule }) {
    return (
        <Container fluid>
            {!selectedEvent && !playoffSchedule && <div>
                <Alert variant="warning" >You need to select an event before you can see anything here.</Alert>
            </div>}
            {selectedEvent && !playoffSchedule && <div>
                <Alert variant="warning" >Waiting for Playoff Schedule</Alert>
            </div>}
            {selectedEvent && playoffSchedule && 
                <Bracket selectedEvent={selectedEvent} playoffSchedule={playoffSchedule} />}
                </Container>

            )
}

            export default AllianceSelectionPage;