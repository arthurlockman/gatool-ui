import { useRef, useState } from "react";
import { Row, Col, Button, Modal, Container, Table } from "react-bootstrap";
import { ArrowUpSquareFill, CaretLeftFill, CaretRightFill } from "react-bootstrap-icons";
import Select from "react-select";
import MatchClock from "../components/MatchClock";
import _ from "lodash";
import { useHotkeysContext } from "react-hotkeys-hook";

function TopButtons({ previousMatch, nextMatch, currentMatch, matchMenu, setMatchFromMenu, selectedEvent, matchDetails, timeFormat, alliances, setAlliances, rankings, inPlayoffs, backupTeam, setBackupTeam, teamList, adHocMatch, setAdHocMatch, adHocMode, swapScreen }) {

    const [show, setShow] = useState(null);
    const [showAdHoc, setAdHoc] = useState(null);
    const [teamSelected, setTeamSelected] = useState(null);
    const [confirmSelection, setConfirmSelection] = useState(false);
    const { disableScope, enableScope } = useHotkeysContext();

    const handleShow = () => {
        setShow(true);
        disableScope('matchNavigation');
        disableScope('tabNavigation');
    }

    const handleAdHoc = () => {
        setAdHoc(true);
        disableScope('matchNavigation');
        disableScope('tabNavigation');
    }

    const handleCloseAdHoc = () => {
        setAdHoc(false);
        enableScope('matchNavigation');
        enableScope('tabNavigation');
    }

    const handleClose = () => {
        setShow(false);
        setTeamSelected(null);
        setConfirmSelection(false);
        enableScope('matchNavigation');
        enableScope('tabNavigation');
    }

    const teamToReplace = (/** @type {object} */ team) => {
        setTeamSelected(team);
        setConfirmSelection(false);
    }

    const handleBackupSelect = (/** @type {object} */ team) => {
        setBackupTeam({ "backup": team.value, "replacing": teamSelected.teamNumber });
        setConfirmSelection(true);
    }

    const handleMatchSelection = (newMatch) => {
        setMatchFromMenu(newMatch)
        selectRef.current?.blur()
    }

    const selectRef = useRef(null)

    const handleBackupConfirm = () => {
        //do the temporary work on the Allianes and team list

        //patch alliance
        var alliancesTemp = _.cloneDeep(alliances);
        var allianceToPatch = alliancesTemp?.Lookup[`${backupTeam?.replacing}`];
        alliancesTemp.alliances[_.findIndex(alliancesTemp?.alliances, { "name": allianceToPatch?.alliance })].backup = backupTeam?.backup?.teamNumber;
        alliancesTemp.alliances[_.findIndex(alliancesTemp?.alliances, { "name": allianceToPatch?.alliance })].backupReplaced = backupTeam?.replacing;
        setAlliances(alliancesTemp);

        // patch schedule
        // var playoffScheduleTemp = _.cloneDeep(playoffSchedule);
        // var matchToPatch = playoffScheduleTemp?.schedule[_.findIndex(playoffScheduleTemp?.schedule,{"description":matchDetails?.description})];
        // matchToPatch.teams[_.findIndex(matchToPatch?.teams,{"teamNumber":backupTeam?.replacing})].teamNumber = backupTeam?.backup?.teamNumber;
        // playoffScheduleTemp.schedule[_.findIndex(playoffScheduleTemp?.schedule,{"description":matchDetails?.description})]=matchToPatch;
        // setPlayoffSchedule(playoffScheduleTemp);

        setShow(false);
        setBackupTeam(null);
        setTeamSelected(null);
        setConfirmSelection(false);
        enableScope('matchNavigation');
        enableScope('tabNavigation');
    }



    const adHocStation = (value) => {
        var station = value[0];
        var teamNumber = value[1].value;
        var adHocMatchNew = _.cloneDeep(adHocMatch);
        if (_.isNull(adHocMatchNew)) {
            adHocMatchNew = [
                { teamNumber: null, station: 'Red1' },
                { teamNumber: null, station: 'Red2' },
                { teamNumber: null, station: 'Red3' },
                { teamNumber: null, station: 'Blue1' },
                { teamNumber: null, station: 'Blue2' },
                { teamNumber: null, station: 'Blue3' }
            ]
        }
        adHocMatchNew[_.findIndex(adHocMatchNew, { "station": station })].teamNumber = teamNumber;
        setAdHocMatch(adHocMatchNew);
    }

    var allianceMembers = alliances?.Lookup ? Object.keys(alliances?.Lookup) : null;
    var availableTeams = [];
    rankings?.ranks.forEach((team) => {
        if (_.indexOf(allianceMembers, String(team.teamNumber)) < 0) { availableTeams.push({ "label": team.teamNumber, "value": team }) }
    })
    const addBackupButton = inPlayoffs && selectedEvent.value.champLevel !== "CHAMPS" && selectedEvent.value.champLevel !== "CMPDIV" && selectedEvent.value.champLevel !== "CMPSUB";

    let eventTeams = teamList?.teams.map((team) => {
        return ({ "label": team.teamNumber, "value": team.teamNumber })
    }
    )

    _.forEach(adHocMatch, (item) => {
        _.remove(eventTeams, { "value": item.teamNumber })
    }
    )
    eventTeams.unshift({ "label": "None", "value": null });

    return (
        <>
            <Row style={{ "paddingTop": "10px", "paddingBottom": "10px" }}>
                <Col xs={"2"} lg={"3"}>
                    {!adHocMode && <Button size="lg" variant="outline-success" className={"gatool-button buttonNoWrap"} onClick={previousMatch}><span className={"d-none d-lg-block"}><CaretLeftFill /> Previous Match</span><span className={"d-block d-lg-none"}><CaretLeftFill /> <CaretLeftFill /></span></Button>}
                </Col>
                {!adHocMode && <MatchClock matchDetails={matchDetails} timeFormat={timeFormat} />}
                <Col xs={addBackupButton ? "4" : "5"} lg={inPlayoffs ? "3" : "4"}><b>{selectedEvent?.label.replace("FIRST Championship - ", "").replace("FIRST In Texas District Championship - ", "").replace("FIRST Ontario Provincial Championship - ", "").replace("New England FIRST District Championship - ", "")}</b><br />
                    {!adHocMode && <Select options={matchMenu} value={currentMatch ? matchMenu[currentMatch - 1] : matchMenu[0]} onChange={handleMatchSelection} styles={{
                        option: (styles, { data }) => {
                            return {
                                ...styles,
                                backgroundColor: data.color,
                                color: "black"
                            };
                        },
                    }} ref={selectRef} />}
                    {adHocMode && <span className="announceOrganization">TEST MATCH</span>}
                </Col>
                {addBackupButton && <Col className="promoteBackup" xs={1} onClick={handleShow}>+<ArrowUpSquareFill />+<br />backup</Col>}
                {adHocMode && <Col className="promoteBackup" xs={1} onClick={handleAdHoc}>Change<br />Teams</Col>}
                <Col xs={"2"} lg={"3"}>
                    {!adHocMode && <Button size="lg" variant="outline-success" className={"gatool-button buttonNoWrap"} onClick={nextMatch}><span className={"d-none d-lg-block"}>Next Match <CaretRightFill /></span><span className={"d-block d-lg-none"}><CaretRightFill /> <CaretRightFill /></span></Button>}
                </Col>
                <Modal centered={true} show={show} onHide={handleClose}>
                    <Modal.Header className={"promoteBackup"} closeButton closeVariant="white">
                        <Modal.Title>Alliance Backup</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className={"backupDialog"}>
                        <Container fluid>
                            {!teamSelected && <><Row>
                                <Col>Select a team to replace:</Col></Row>
                                <Row>
                                    {matchDetails?.teams.map((team) => {
                                        var allianceColor = team?.station.slice(0, team.station?.length - 1);
                                        return (<div className={`btn ${allianceColor}Replace`} key={`Replace${team.teamNumber}`} onClick={() => { teamToReplace(team) }}>{team.teamNumber}</div>)
                                    })}
                                </Row></>}

                            {teamSelected && !confirmSelection && <><Row><Col>Select a team from the backup teams to replace team {teamSelected?.teamNumber} with team </Col></Row>
                                <Row> <Col><Select options={availableTeams} onChange={handleBackupSelect} /></Col>
                                </Row></>}

                            {teamSelected && confirmSelection && <><Row><Col>Are you sure you want to replace team {teamSelected?.teamNumber} with {backupTeam?.backup?.teamNumber}?</Col></Row>
                                <Row> <Col><Button onClick={handleBackupConfirm}>Yes</Button></Col>
                                </Row></>}
                        </Container>
                    </Modal.Body>
                </Modal>
                <Modal centered={true} show={showAdHoc} onHide={handleCloseAdHoc}>
                    <Modal.Header className={"promoteBackup"} closeButton closeVariant="white">
                        <Modal.Title>Configure Teams for Match</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Container>
                            <div>Select teams for each station below.</div>
                            {!swapScreen && <Table>
                                <Row>
                                    <Col className="blueAlliance"><div style={{ backgroundColor: "#98B4F4" }}><b>Blue 1</b> <Select options={eventTeams} tabIndex={4} value={adHocMatch[3]?.teamNumber ? { "value": adHocMatch[3]?.teamNumber, "label": adHocMatch[3]?.teamNumber } : ""} onChange={(e) => { adHocStation(["Blue1", e]) }} /></div></Col>
                                    <Col className="redAlliance"><div style={{ backgroundColor: "#F7B3B4" }}><b>Red 3</b> <Select options={eventTeams} tabIndex={3} value={adHocMatch[2]?.teamNumber ? { "value": adHocMatch[2]?.teamNumber, "label": adHocMatch[2]?.teamNumber } : ""} onChange={(e) => { adHocStation(["Red3", e]) }} /></div></Col>
                                </Row>
                                <Row>
                                    <Col className="blueAlliance"><div style={{ backgroundColor: "#98B4F4" }}><b>Blue 2</b> <Select options={eventTeams} tabIndex={5} value={adHocMatch[4]?.teamNumber ? { "value": adHocMatch[4]?.teamNumber, "label": adHocMatch[4]?.teamNumber } : ""} onChange={(e) => { adHocStation(["Blue2", e]) }} /></div></Col>
                                    <Col className="redAlliance"><div style={{ backgroundColor: "#F7B3B4" }}><b>Red 2</b> <Select options={eventTeams} tabIndex={2} value={adHocMatch[1]?.teamNumber ? { "value": adHocMatch[1]?.teamNumber, "label": adHocMatch[1]?.teamNumber } : ""} onChange={(e) => { adHocStation(["Red2", e]) }} /></div></Col>
                                </Row>
                                <Row>
                                    <Col className="blueAlliance"><div style={{ backgroundColor: "#98B4F4" }}><b>Blue 3</b> <Select options={eventTeams} tabIndex={6} value={adHocMatch[5]?.teamNumber ? { "value": adHocMatch[5]?.teamNumber, "label": adHocMatch[5]?.teamNumber } : ""} onChange={(e) => { adHocStation(["Blue3", e]) }} /></div></Col>
                                    <Col className="redAlliance" ><div style={{ backgroundColor: "#F7B3B4" }}><b>Red 1</b><Select options={eventTeams} tabIndex={1} value={adHocMatch[0]?.teamNumber ? { "value": adHocMatch[0]?.teamNumber, "label": adHocMatch[0]?.teamNumber } : ""} onChange={(e) => { adHocStation(["Red1", e]) }} /></div> </Col>

                                </Row>
                            </Table>}
                            {swapScreen && <Table>
                                <Row>
                                    <Col className="redAlliance"><div style={{ backgroundColor: "#F7B3B4" }}><b>Red 3</b> <Select options={eventTeams} tabIndex={4} value={adHocMatch[2]?.teamNumber ? { "value": adHocMatch[2]?.teamNumber, "label": adHocMatch[2]?.teamNumber } : ""} onChange={(e) => { adHocStation(["Red3", e]) }} /></div></Col>
                                    <Col className="blueAlliance"><div style={{ backgroundColor: "#98B4F4" }}><b>Blue 1</b> <Select options={eventTeams} tabIndex={3} value={adHocMatch[3]?.teamNumber ? { "value": adHocMatch[3]?.teamNumber, "label": adHocMatch[3]?.teamNumber } : ""} onChange={(e) => { adHocStation(["Blue1", e]) }} /></div></Col>
                                </Row>
                                <Row>
                                    <Col className="redAlliance"><div style={{ backgroundColor: "#F7B3B4" }}><b>Red 2</b> <Select options={eventTeams} tabIndex={5} value={adHocMatch[1]?.teamNumber ? { "value": adHocMatch[1]?.teamNumber, "label": adHocMatch[1]?.teamNumber } : ""} onChange={(e) => { adHocStation(["Red2", e]) }} /></div></Col>
                                    <Col className="blueAlliance"><div style={{ backgroundColor: "#98B4F4" }}><b>Blue 2</b> <Select options={eventTeams} tabIndex={2} value={adHocMatch[4]?.teamNumber ? { "value": adHocMatch[4]?.teamNumber, "label": adHocMatch[4]?.teamNumber } : ""} onChange={(e) => { adHocStation(["Blue2", e]) }} /></div></Col>
                                </Row>
                                <Row>
                                    <Col className="redAlliance" ><div style={{ backgroundColor: "#F7B3B4" }}><b>Red 1</b><Select options={eventTeams} tabIndex={6} value={adHocMatch[0]?.teamNumber ? { "value": adHocMatch[0]?.teamNumber, "label": adHocMatch[0]?.teamNumber } : ""} onChange={(e) => { adHocStation(["Red1", e]) }} /></div> </Col>
                                    <Col className="blueAlliance"><div style={{ backgroundColor: "#98B4F4" }}><b>Blue 3</b> <Select options={eventTeams} tabIndex={1} value={adHocMatch[5]?.teamNumber ? { "value": adHocMatch[5]?.teamNumber, "label": adHocMatch[5]?.teamNumber } : ""} onChange={(e) => { adHocStation(["Blue3", e]) }} /></div></Col>
                                </Row>
                            </Table>}
                        </Container>
                    </Modal.Body>
                </Modal>
            </Row>
        </>
    )
}

export default TopButtons;