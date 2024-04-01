import { Alert, Col, Row, Container, Modal, Button } from "react-bootstrap";
import Bracket from "../components/Bracket";
import FourAllianceBracket from "components/FourAllianceBracket";
import moment from "moment/moment";
import AllianceSelection from "../components/AllianceSelection";
import { useState } from "react";
import Switch from "react-switch";
import { useHotkeysContext, useHotkeys } from "react-hotkeys-hook";

import './AllianceSelectionPage.css';
import TwoAllianceBracket from "components/TwollianceBracket";

function AllianceSelectionPage({ selectedYear, selectedEvent, qualSchedule, playoffSchedule, offlinePlayoffSchedule, alliances, rankings, timeFormat, getRanks, allianceSelection, playoffs, teamList, allianceCount, communityUpdates, allianceSelectionArrays, setAllianceSelectionArrays, rankingsOverride, loadEvent, practiceSchedule, setOfflinePlayoffSchedule }) {
    const [overrideAllianceSelection, setOverrideAllianceSelection] = useState(false);
    const [resetAllianceSelection, setResetAllianceSelection] = useState(false);
    const [teamFilter, setTeamFilter] = useState("");
    const { disableScope, enableScope } = useHotkeysContext();

    const updateRanks = () => {
        setResetAllianceSelection(true);
        enableScope('resetAllianceSelection');
        disableScope('tabNavigation');
    }

    const handleResetAllianceSelection = () => {
        if (overrideAllianceSelection) {
            handleReset();
        }
        getRanks();
        handleClose();
    }

    const handleReset = () => {
        // @ts-ignore
        document.getElementById("filterControl").value = "";
        setTeamFilter("");
        setAllianceSelectionArrays({});
    }

    const handleClose = () => {
        setResetAllianceSelection(false);
        disableScope("allianceDecline");
        enableScope('tabNavigation');
    }

    var ranksLastUpdateDisplay = "No rankings reporting yet."
    if (rankings?.lastUpdate) {
        ranksLastUpdateDisplay = moment(rankings?.lastUpdate).format("ddd, MMM Do YYYY, " + timeFormat.value)
    }

    useHotkeys('return', () => document.getElementById("resetAllianceSelection").click(), { scopes: 'resetAllianceSelection' });
    console.log(allianceSelection);
    return (
        < >
            {!selectedEvent && <div>
                <Alert variant="warning" ><div>You need to select an event before you can see anything here.</div></Alert>
            </div>}
            {selectedEvent && (!qualSchedule || qualSchedule?.schedule?.length === 0 || qualSchedule?.schedule?.schedule?.length === 0) && (!practiceSchedule || practiceSchedule?.schedule?.length === 0 || practiceSchedule?.schedule?.schedule?.length === 0) && (!playoffSchedule || playoffSchedule?.schedule?.length === 0 || playoffSchedule?.schedule?.schedule?.length === 0) &&
                <div>
                    <Alert variant="warning" ><div><img src="loadingIcon.gif" alt="Loading data..." /></div><div>Waiting for Qualification Match Schedule</div></Alert>
                </div>}
            {selectedEvent && (qualSchedule?.schedule?.length > 0 || practiceSchedule?.schedule?.length > 0) && !playoffs &&
                <div>
                    <h5><b>{selectedEvent.label}</b><br />(Rankings last updated: {ranksLastUpdateDisplay})</h5>
                    <p>Before the selection begins and to help introduce the Alliance Captains with the MC, tap the Alliance Captains to see their team name, school/orgainzaiton, and home town.</p>
                    <p><b>IMPORTANT: Tap <i>Alliance Captain Announce</i> to continue announcing the Captains.</b></p>
                    <p>When it's time for Alliance Selection, simply tap a team when their number is called. If they accept, tap <b>Gratefully Accept.</b> If they decline, tap <b>Respectfully Decline.</b></p>
                    {!allianceSelection &&
                        <Alert variant="danger" ><div onClick={updateRanks}><b>Do not proceed with Alliance Selection until you confirm that the rank order below agrees with the rank order in FMS. Check the Alliance leaders and the teams in the Backup Teams box. Tap this alert to see if we can get a more current schedule and rankings.</b></div>
                            <Container fluid>
                                <Row className="align-items-center">
                                    <Col xs={10}>If you believe that your rankings are correct, and you need to proceed with Alliance Selection even though our confidence is low, you can do so by enabling this option:</Col>
                                    <Col xs={2}><Switch
                                        checked={overrideAllianceSelection}
                                        onChange={setOverrideAllianceSelection}
                                        height={20}
                                        width={40} />
                                    </Col>
                                </Row>
                            </Container>
                        </Alert>}
                    {allianceSelection && !rankingsOverride && !selectedEvent?.value?.code.includes("OFFLINE") &&
                        <Alert variant="success" >
                            <div onClick={loadEvent}><b>We believe your event is ready for Alliance Selection, but you must confirm that the rank order below agrees with the rank order in FMS before proceeding with Alliance Selection. If you see a discrepancy, take these steps:
                                <div>Tap the RESTART ALLIANCE SELECTION button below to reset using current data</div>
                                <div>Tap this alert to see if we can get a more current rankings. <i>This will reload your event.</i></div>
                            </b><br />
                                We last had a ranking update at {moment(rankings?.lastModified).format("ddd, MMM Do YYYY, " + timeFormat.value)}
                            </div>
                        </Alert>}
                    {allianceSelection && rankingsOverride &&
                        <Alert variant="danger" >
                            <div><b>You have imported a Rankings Report from your Scorekeeper. Please review the table below to ensure that it matches the report.<br /> <span style={{ fontSize: "20px" }}>If you see TBD in place of the Captains' numbers, or if the teams are out of order, tap Restart Alliance Selection.</span></b>
                            </div>
                            {selectedEvent && rankings?.ranks?.length > 0 && teamList?.teams?.length > 0 && allianceCount && allianceCount?.count <= 0 &&
                                <h4>
                                    Please choose an Alliance Count on the Setup Page to proceed.
                                </h4>

                            }
                        </Alert>}
                </div>}
            {selectedEvent && (qualSchedule?.schedule?.length > 0 || qualSchedule?.schedule?.schedule?.length > 0 || practiceSchedule?.schedule?.length > 0) && !playoffs && (allianceSelection || overrideAllianceSelection) &&
                <div>
                    <AllianceSelection selectedYear={selectedYear} selectedEvent={selectedEvent} rankings={rankings} teamList={teamList} allianceCount={allianceCount} communityUpdates={communityUpdates} allianceSelectionArrays={allianceSelectionArrays} setAllianceSelectionArrays={setAllianceSelectionArrays} handleReset={handleReset} teamFilter={teamFilter} setTeamFilter={setTeamFilter} />
                </div>}

            {selectedEvent?.value?.allianceCount === "EightAlliance" && playoffs &&
                <Bracket selectedEvent={selectedEvent} playoffSchedule={playoffSchedule} offlinePlayoffSchedule={offlinePlayoffSchedule} alliances={alliances} setOfflinePlayoffSchedule={setOfflinePlayoffSchedule} />}
            {selectedEvent?.value?.allianceCount === "FourAlliance" && playoffs &&
                <FourAllianceBracket selectedEvent={selectedEvent} playoffSchedule={playoffSchedule} alliances={alliances} />}
            {selectedEvent?.value?.allianceCount === "TwoAlliance" && playoffs &&
                <TwoAllianceBracket selectedEvent={selectedEvent} playoffSchedule={playoffSchedule} alliances={alliances} />}
            <Modal centered={true} show={resetAllianceSelection} onHide={handleClose}>
                <Modal.Header className={"allianceSelectionDecline"} closeVariant={"white"} closeButton>
                    <Modal.Title>
                        Reload Rankings and reset Alliance Selection
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <span>You are about to reload Rankings and reset your Alliance Selection. Are you sure you want to do this?</span>
                </Modal.Body>
                <Modal.Footer>
                    <Button id="resetAllianceSelection" variant="danger" size="sm" onClick={handleResetAllianceSelection}>
                        Yes
                    </Button>
                    <Button id="resetAllianceSelection" size="sm" onClick={handleClose}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </>

    )
}

export default AllianceSelectionPage;