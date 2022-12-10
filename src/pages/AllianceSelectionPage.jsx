import Bracket from "../components/Bracket";
import { find } from "lodash";

function AllianceSelectionPage({ selectedEvent, playoffSchedule}) {
    return (
        <div>
            <Bracket selectedEvent={selectedEvent} playoffSchedule={playoffSchedule} />
        </div>
    )
}

export default AllianceSelectionPage;