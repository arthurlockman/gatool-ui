import { useState } from "react";
import { Row, Col, Button, Modal, Container } from "react-bootstrap";
import { ArrowUpSquareFill, CaretLeftFill, CaretRightFill } from "react-bootstrap-icons";
import Select from "react-select";
import MatchClock from "../components/MatchClock";
import _ from "lodash";

function TopButtons({ previousMatch, nextMatch, currentMatch, matchMenu, setMatchFromMenu, selectedEvent, matchDetails, timeFormat, alliances, setAlliances, rankings, inPlayoffs, backupTeam, setBackupTeam}) {

    const [show, setShow] = useState(null);
    const [teamSelected, setTeamSelected] = useState(null);
    const [confirmSelection, setConfirmSelection] = useState(false);

    function handleShow() {
        setShow(true);
    }

    function handleClose() {
        setShow(false);
        setTeamSelected(null);
        setConfirmSelection(false);
    }

    function teamToReplace(team) {
        setTeamSelected(team);
        setConfirmSelection(false);
    }

    function handleBackupSelect(team) {
        setBackupTeam({ "backup": team.value, "replacing": teamSelected.teamNumber });
        setConfirmSelection(true);
    }

    function handleBackupConfirm() {
        //do the temporary work on the Allianes and team list

        //patch alliance
        var alliancesTemp = _.cloneDeep(alliances);
        var allianceToPatch = alliancesTemp?.Lookup[`${backupTeam?.replacing}`];
        alliancesTemp.alliances[_.findIndex(alliancesTemp?.alliances,{"name":allianceToPatch?.alliance})].backup=backupTeam?.backup?.teamNumber;
        alliancesTemp.alliances[_.findIndex(alliancesTemp?.alliances,{"name":allianceToPatch?.alliance})].backupReplaced=backupTeam?.replacing;
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
    }

    var allianceMembers = Object.keys(alliances?.Lookup);
    var availableTeams = [];
    rankings?.ranks.forEach((team) => {
        if (_.indexOf(allianceMembers, String(team.teamNumber)) < 0) { availableTeams.push({ "label": team.teamNumber, "value": team }) }
    })

    return (
        <>
            <Row style={{ "paddingTop": "10px", "paddingBottom": "10px" }}>
                <Col xs={"2"} lg={"3"}><Button size="lg" variant="outline-success" className={"gatool-button buttonNoWrap"} onClick={previousMatch}><span className={"d-none d-lg-block"}><CaretLeftFill /> Previous Match</span><span className={"d-block d-lg-none"}><CaretLeftFill /> <CaretLeftFill /></span></Button></Col>
                <MatchClock matchDetails={matchDetails} timeFormat={timeFormat} />
                <Col xs={inPlayoffs ? "4" : "5"} lg={inPlayoffs ? "3" : "4"}><b>{selectedEvent?.label.replace("FIRST Championship - ", "").replace("FIRST In Texas District Championship - ", "").replace("FIRST Ontario Provincial Championship - ", "").replace("New England FIRST District Championship - ", "")}</b><br /><Select options={matchMenu} value={currentMatch ? matchMenu[currentMatch - 1] : matchMenu[0]} onChange={setMatchFromMenu} styles={{
                    option: (styles, { data }) => {
                        return {
                            ...styles,
                            backgroundColor: data.color,
                            color: "black"
                        };
                    },
                }} /></Col>
                {inPlayoffs && <Col className="promoteBackup" xs={1} onClick={handleShow}>+<ArrowUpSquareFill/>+<br />backup</Col>}
                <Col xs={"2"} lg={"3"}><Button size="lg" variant="outline-success" className={"gatool-button buttonNoWrap"} onClick={nextMatch}><span className={"d-none d-lg-block"}>Next Match <CaretRightFill /></span><span className={"d-block d-lg-none"}><CaretRightFill /> <CaretRightFill /></span></Button></Col>
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
            </Row>
        </>
    )
}

export default TopButtons;