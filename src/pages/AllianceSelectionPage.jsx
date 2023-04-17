import { Alert, Col, Row, Container } from "react-bootstrap";
import Bracket from "../components/Bracket";
import FourAllianceBracket from "components/FourAllianceBracket";
import moment from "moment/moment";
import AllianceSelection from "../components/AllianceSelection";
import { useState } from "react";
import Switch from "react-switch";

import './AllianceSelectionPage.css';
import TwoAllianceBracket from "components/TwollianceBracket";

function AllianceSelectionPage({ selectedYear, selectedEvent, qualSchedule, playoffSchedule, alliances, rankings, timeFormat, getRanks, allianceSelection, playoffs, teamList, allianceCount, communityUpdates, allianceSelectionArrays, setAllianceSelectionArrays, rankingsOverride, loadEvent }) {
    const [overrideAllianceSelection, setOverrideAllianceSelection] = useState(false);

    var ranksLastUpdateDisplay = "No rankings reporting yet."
    if (rankings?.lastUpdate) {
        ranksLastUpdateDisplay = moment(rankings?.lastUpdate).format("ddd, MMM Do YYYY, " + timeFormat.value)
    }


    return (
        < >
            
                {!selectedEvent && <div>
                    <Alert variant="warning" ><div>You need to select an event before you can see anything here.</div></Alert>
                </div>}
                {selectedEvent && (!qualSchedule || qualSchedule?.schedule?.length === 0) && (!playoffSchedule || playoffSchedule?.schedule?.length === 0) &&
                    <div>
                        <Alert variant="warning" ><div><img src="loadingIcon.gif" alt="Loading data..." /></div><div>Waiting for Qualification Match Schedule</div></Alert>
                    </div>}
                {selectedEvent && qualSchedule?.schedule?.length > 0 && !playoffs &&
                    <div>
                        <h5><b>{selectedEvent.label}</b><br />(Rankings last updated: {ranksLastUpdateDisplay})</h5>
                        <p>Before the selection begins and to help introduce the Alliance Captains with the MC, tap the Alliance Captains to see their team name, school/orgainzaiton, and home town.</p>
                        <p><b>IMPORTANT: Tap <i>Alliance Captain Announce</i> to continue announcing the Captains.</b></p>
                        <p>When it's time for Alliance Selection, simply tap a team when their number is called. If they accept, tap <b>Gratefully Accept.</b> If they decline, tap <b>Respectfully Decline.</b></p>
                        {!allianceSelection &&
                            <Alert variant="danger" ><div onClick={getRanks}><b>Do not proceed with Alliance Selection until you confirm that the rank order below agrees with the rank order in FMS. Check the Alliance leaders and the teams in the Backup Teams box. Tap this alert to see if we can get a more current schedule and rankings.</b></div>
                                <Container fluid>
                                    <Row className="align-items-center">
                                        <Col xs={10}>If you believe that your ranks are correct, and you need to proceed with Alliance Selection even though our confidence is low, you can do so by enabling this option:</Col>
                                        <Col xs={2}><Switch
                                            checked={overrideAllianceSelection}
                                            onChange={setOverrideAllianceSelection}
                                            height={20}
                                            width={40} />
                                        </Col>
                                    </Row>
                                </Container>
                            </Alert>}
                        {allianceSelection && !rankingsOverride &&
                            <Alert variant="success" >
                                <div onClick={loadEvent}><b>We believe your event is ready for Alliance Selection, but you must confirm that the rank order below agrees with the rank order in FMS before proceeding with Alliance Selection. If you see a discrepancy, tap this alert to see if we can get a more current rankings. <i>This will reload your event.</i></b>
                                </div>
                            </Alert>}
                        {allianceSelection && rankingsOverride &&
                            <Alert variant="danger" >
                                <div><b>You have imported a Rankings Report from your Scorekeeper. Please review the table below to ensure that it matches the report</b>
                                </div>
                            </Alert>}
                    </div>}
                {selectedEvent && qualSchedule?.schedule?.length > 0 && !playoffs && (allianceSelection || overrideAllianceSelection) &&
                    <div>
                        <AllianceSelection selectedYear={selectedYear} selectedEvent={selectedEvent} rankings={rankings} teamList={teamList} allianceCount={allianceCount} communityUpdates={communityUpdates} allianceSelectionArrays={allianceSelectionArrays} setAllianceSelectionArrays={setAllianceSelectionArrays} />
                    </div>}
            
            {selectedEvent?.value?.allianceCount === "EightAlliance" && playoffs &&
                <Bracket selectedEvent={selectedEvent} playoffSchedule={playoffSchedule} alliances={alliances} />}
            {selectedEvent?.value?.allianceCount === "FourAlliance" && playoffs &&
                <FourAllianceBracket selectedEvent={selectedEvent} playoffSchedule={playoffSchedule} alliances={alliances} />}
            {selectedEvent?.value?.allianceCount === "TwoAlliance" && playoffs &&
                <TwoAllianceBracket selectedEvent={selectedEvent} playoffSchedule={playoffSchedule} alliances={alliances} />}
        </>

    )
}

export default AllianceSelectionPage;