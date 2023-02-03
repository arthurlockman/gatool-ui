import { Alert, Container } from "react-bootstrap";
import Bracket from "../components/Bracket";
import moment from "moment/moment";
import AllianceSelection from "../components/AllianceSelection";

import './AllianceSelectionPage.css';

function AllianceSelectionPage({ selectedYear, selectedEvent, qualSchedule, playoffSchedule, alliances, rankings, timeFormat, getRanks, allianceSelection, playoffs, teamList, allianceCount, communityUpdates }) {

    var ranksLastUpdateDisplay = "No rankings reporting yet."
    if (rankings?.lastUpdate) {
        ranksLastUpdateDisplay = moment(rankings?.lastUpdate).format("ddd, MMM Do YYYY, " + timeFormat.value)
    }

    return (
        <Container fluid>
            <Container>{!selectedEvent && <div>
                <Alert variant="warning" ><div>You need to select an event before you can see anything here.</div></Alert>
            </div>}
                {selectedEvent && (!qualSchedule || qualSchedule?.schedule?.length === 0) && <div>
                    <Alert variant="warning" ><div><img src="loadingIcon.gif" alt="Loading data..." /></div><div>Waiting for Qualification Match Schedule</div></Alert>
                </div>}
                {selectedEvent && qualSchedule?.schedule?.length > 0 && !playoffs && <div>
                    <h5><b>{selectedEvent.label}</b><br />(Rankings last updated: {ranksLastUpdateDisplay})</h5>
                    <p>Before the selection begins and to help introduce the Alliance Captains with the MC, tap the Alliance Captains to see their team name, school/orgainzaiton, and home town.</p>
                    <p><b>IMPORTANT: Tap <i>Alliance Captain Announce</i> to continue announcing the Captains.</b></p>
                    <p>When it's time for Alliance Selection, simply tap a team when their number is called. If they accept, tap <b>Gratefully Accept.</b> If they decline, tap <b>Respectfully Decline.</b></p>
                    {!allianceSelection && <Alert variant="danger" ><div onClick={getRanks}><b>Do not proceed with Alliance Selection until you confirm that the rank order below agrees with the rank order in FMS. Tap this alert to see if we can get a more current schedule and rankings.</b></div></Alert>}
                    {allianceSelection && <Alert variant="success" ><div onClick={getRanks}><b>We believe your event is ready for Alliance Selection, but you must confirm that the rank order below agrees with the rank order in FMS before proceeding with Alliance Selection.</b> If you see a discrepancy, tap this alert to see if we can get a more current rankings.</div></Alert>}
                </div>}
                {selectedEvent && qualSchedule?.schedule?.length > 0 && !playoffs && <div>
                    <AllianceSelection selectedYear={selectedYear} selectedEvent={selectedEvent} rankings={rankings} teamList={teamList} allianceCount={allianceCount} communityUpdates={communityUpdates}/>
                    </div>}
            </Container>
            {selectedEvent && playoffs &&
                <Bracket selectedEvent={selectedEvent} playoffSchedule={playoffSchedule} alliances={alliances} />}

        </Container>

    )
}

export default AllianceSelectionPage;