import { Alert, Container, Button, Row, Col, Modal, Form, InputGroup } from "react-bootstrap";
import { useState } from 'react';
import { Trophy } from "react-bootstrap-icons";
import _ from "lodash";
import { useHotkeysContext, useHotkeys } from "react-hotkeys-hook";
import useWindowDimensions from "hooks/UseWindowDimensions";



function AwardsPage({ selectedEvent, selectedYear, teamList, communityUpdates, eventLabel }) {
    const originalAndSustaining = ["20", "45", "126", "148", "151", "157", "190", "191", "250"];
    const { disableScope, enableScope } = useHotkeysContext();

    const [show, setShow] = useState(false);
    const [awardTeam, setAwardTeam] = useState(null);
    const [teamFilter, setTeamFilter] = useState("");

    const { width } = useWindowDimensions();

    const colCount = width > 1040 ? 6 :
        width > 850 ? 5 :
            width > 640 ? 4 :
                width > 480 ? 3 : 2;

    var columns = [[], [], [], [], [], []];
    var sortedTeams = _.orderBy(teamList?.teams, "teamNumber", "asc");
    if (communityUpdates) (
        sortedTeams = sortedTeams.map((team) => {
            team.updates = team?.updates ? _.merge(team.updates, communityUpdates[_.findIndex(communityUpdates, { "teamNumber": team?.teamNumber })]?.updates) : communityUpdates[_.findIndex(communityUpdates, { "teamNumber": team?.teamNumber })]?.updates;
            var years = 1 + Number(selectedYear?.value) - Number(team?.rookieYear);
            if (typeof team?.updates?.teamYearsNoCompeteLocal !== "undefined") { years -= team?.updates?.teamYearsNoCompeteLocal };
            var yearsDisplay = "th";
            if (years.toString().endsWith("1")) { yearsDisplay = "st" };
            if (years.toString().endsWith("2")) { yearsDisplay = "nd" };
            if (years.toString().endsWith("3")) { yearsDisplay = "rd" };
            if (years.toString() === "11" || years.toString() === "12" || years.toString() === "13") { yearsDisplay = "th" };
            if (years.toString() === "1") { yearsDisplay = "Rookie" };
            if (years === 1) { team.yearsDisplay = yearsDisplay } else { team.yearsDisplay = `${years}${yearsDisplay}`; }
            return team;
        })
    )
    var rows = sortedTeams?.length;
    if (sortedTeams?.length > 0) {
        sortedTeams?.forEach((team, index) => {
            if (index <= 1 * rows / colCount - 1) {
                columns[0].push(team);
            } else if (index <= 2 * rows / colCount - 1) {
                columns[1].push(team);
            } else if (index <= 3 * rows / colCount - 1) {
                columns[2].push(team);
            } else if (index <= 4 * rows / colCount - 1) {
                columns[3].push(team);
            } else if (index <= 5 * rows / colCount - 1) {
                columns[4].push(team);
            } else {
                columns[5].push(team);
            }
        })
    }



    const handleClose = () => {
        setAwardTeam(null);
        setShow(false);
        enableScope('tabNavigation');
        disableScope('formEnter');
    }

    const handleShow = (e) => {
        var team = JSON.parse(e.currentTarget.value);
        // @ts-ignore
        document.getElementById("filterControl").value = "";
        setTeamFilter("");
        setAwardTeam(team);
        setShow(true);
        enableScope('formEnter');
        disableScope('tabNavigation');
    }

    const filterTeams = (e) => {
        e.preventDefault();
        if (e.currentTarget.valueAsNumber === "") {
            setTeamFilter("");
        } else {
            setTeamFilter(e.currentTarget.value);
        }
    }

    const handleFilterSelect = (e) => {
        e.preventDefault();
        var team = {};
        if (e.currentTarget[0].value) {
            team = _.filter(sortedTeams, { 'teamNumber': Number(e.currentTarget[0].value) })[0];
            if (_.isEmpty(team)) {
                team = _.filter(sortedTeams, (team) => { return String(team?.teamNumber).startsWith(teamFilter) })[0]
            }
            // @ts-ignore
            document.getElementById("filterControl").value = "";
            setTeamFilter("");
            setAwardTeam(team);
            setShow(true);
            enableScope('formEnter');
            disableScope('tabNavigation');
        }

    }

    useHotkeys('return', (e) => {
        e.preventDefault();
        document.getElementById("congratulationsButton").click()
    }, { scopes: 'formEnter' });

    return (
        <Container fluid style={{marginBottom: "20px"}}>
            {!selectedEvent && <div>
                <Alert variant="warning" >You need to select an event before you can see anything here.</Alert>
            </div>}
            {selectedEvent && (!teamList || teamList?.teams.length === 0) && <div>
                <h4>{eventLabel}</h4>
                <Alert variant="warning" ><div><img src="loadingIcon.gif" alt="Loading data..." /></div><div>Awaiting team data for {eventLabel}</div></Alert>
            </div>}
            {selectedEvent && teamList?.teams.length > 0 &&
                <Container fluid>
                    <h4>{eventLabel}</h4>
                    <p>When it's time for Awards, simply tap a team when their number is called, announce the team, and click <b>Congratulations.</b></p>
                    <div>
                        <Form onSubmit={handleFilterSelect}>
                            <InputGroup className="mb-3" >
                                <InputGroup.Text>Filter the teams</InputGroup.Text>
                                <Form.Control id={"filterControl"} type="number" placeholder="Enter a number" aria-label="Team Number" onChange={filterTeams} />
                                {(_.filter(sortedTeams, { 'teamNumber': Number(teamFilter) }).length === 1 || (_.filter(sortedTeams, (team) => { return String(team?.teamNumber).startsWith(teamFilter) }).length === 1)) && <Button variant="primary" type="submit">Select this team</Button>}
                            </InputGroup>
                        </Form>
                    </div>
                    <Row key={eventLabel}>{columns.map((column, index) => {
                        return (index<colCount? <Col  key={index}>
                            {column.map((team) => {
                                return ((String(team?.teamNumber).startsWith(teamFilter) || teamFilter === "") && <Row className={"awardsButton"} key={team.teamNumber} ><Button value={JSON.stringify(team)} onClick={handleShow} size="sm" variant={(team?.teamNumber === Number(teamFilter) || (_.filter(sortedTeams, (team) => { return String(team?.teamNumber).startsWith(teamFilter) }).length === 1)) ? "success" : "outline-success"}>{team?.teamNumber}</Button></Row>)
                            })}
                        </Col> : null)
                    })}
                    </Row>
                    {awardTeam && <Modal centered={true} show={show} onHide={handleClose}>
                        <Modal.Header className={"allianceChoice"} closeVariant={"white"} closeButton>
                            <Modal.Title className={"success"}>Awards Announcement</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <span className={"allianceAnnounceDialog"}>Team {awardTeam?.teamNumber} {awardTeam?.updates?.nameShortLocal ? awardTeam.updates.nameShortLocal : awardTeam?.nameShort}<br />
                                is {awardTeam?.updates?.awardsTextLocal ? awardTeam?.updates?.awardsTextLocal : <>{originalAndSustaining.includes(String(awardTeam?.teamNumber)) ? "an Original and Sustaining Team " : ""}from<br />
                                    {awardTeam?.updates?.organizationLocal ? awardTeam?.updates?.organizationLocal : awardTeam?.organization}<br />
                                    in</>} {awardTeam?.updates?.cityStateLocal ? awardTeam?.updates?.cityStateLocal : `${awardTeam?.city}, ${awardTeam?.stateProv}`}{awardTeam?.country !== "USA" ? `, ${awardTeam?.country}` : ""}<br />
                                <br />
                                Founded in {awardTeam?.rookieYear}, this is their {awardTeam?.yearsDisplay} season competing with <i><b>FIRST</b></i>. </span>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="success" onClick={handleClose} id={"congratulationsButton"}>
                                <Trophy /> Congratulations!
                            </Button>
                        </Modal.Footer>
                    </Modal>}

                </Container>
            }

        </Container>
    )
}

export default AwardsPage;