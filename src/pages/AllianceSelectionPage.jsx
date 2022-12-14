import { Alert, Container } from "react-bootstrap";
import Bracket from "../components/Bracket";

function AllianceSelectionPage({ selectedEvent, playoffSchedule, alliances }) {
    return (
        <Container fluid>
            {!selectedEvent && !playoffSchedule && <div>
                <Alert variant="warning" ><div>You need to select an event before you can see anything here.</div></Alert>
            </div>}
            {selectedEvent && !playoffSchedule && <div>
                <Alert variant="warning" ><div><img src="loadingIcon.gif" alt="Loading data..."/></div><div>Waiting for Playoff Schedule</div></Alert>
            </div>}
            {selectedEvent && playoffSchedule && 
                <Bracket selectedEvent={selectedEvent} playoffSchedule={playoffSchedule} alliances={alliances}/>}
                </Container>

            )
}

            export default AllianceSelectionPage;