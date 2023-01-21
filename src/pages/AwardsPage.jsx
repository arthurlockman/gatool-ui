import { Alert, Container, Button, Row, Col, Modal } from "react-bootstrap";
import { useState } from 'react';
import _ from "lodash";


function AwardsPage({ selectedEvent, selectedYear, teamList, communityUpdates }) {

    var columns = [[], [], [], [], [], []];
    var sortedTeams = _.orderBy(teamList?.teams, "teamNumber", "asc");
    sortedTeams = sortedTeams.map((team) => {
        team = _.merge(team, communityUpdates[_.findIndex(communityUpdates, { "teamNumber": team?.teamNumber })])
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
    var rows = sortedTeams?.length;
    if (sortedTeams?.length > 0) {
        sortedTeams?.forEach((team, index) => {
            if (index <= 1 * rows / 6) {
                columns[0].push(team);
            } else if (index <= 2 * rows / 6) {
                columns[1].push(team);
            } else if (index <= 3 * rows / 6) {
                columns[2].push(team);
            } else if (index <= 4 * rows / 6) {
                columns[3].push(team);
            } else if (index <= 5 * rows / 6) {
                columns[4].push(team);
            } else {
                columns[5].push(team);
            }
        })
    }

    const [show, setShow] = useState(false);
    const [awardTeam, setAwardTeam] = useState(false);

    const handleClose = () => {
        setAwardTeam(null);
        setShow(false);
    }
    const handleShow = (e) => {
        var team = JSON.parse(e.currentTarget.value);
        setAwardTeam(team);
        setShow(true);
    }

    return (
        <Container fluid>
            <h4>{selectedEvent.label}</h4>
            <p>When it's time for Awards, simply tap a team when their number is called, announce the team, and click <b>Congratulations.</b></p>
            {!selectedEvent && !teamList && <div>
                <Alert variant="warning" >You need to select an event before you can see anything here.</Alert>
            </div>}
            {selectedEvent && (!teamList || teamList?.teams.length === 0) && <div>
                <Alert variant="warning" ><div><img src="loadingIcon.gif" alt="Loading data..." /></div><div>Awaiting team data for {selectedEvent.label}</div></Alert>
            </div>}
            {selectedEvent && teamList?.teams.length > 0 &&
                <Container fluid>
                    <Row key={selectedEvent.label}>{columns.map((column, index) => {
                        return (<Col xs="2" key={index}>
                            {column.map((team) => {
                                return (<Row className={"awardsButton"} key={team.teamNumber} ><Button value={JSON.stringify(team)} onClick={handleShow} size="medium" variant="outline-success">{team.teamNumber}</Button></Row>)
                            })}
                        </Col>)
                    })}
                    </Row>
                    {awardTeam && <Modal size={"lg"} centered={true} show={show} onHide={handleClose}>
                        <Modal.Header closeButton>
                            <Modal.Title className={"success"}>Awards Announcement</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <h2>Team {awardTeam?.teamNumber} {awardTeam?.updates?.nameShortLocal ? awardTeam.updates.nameShortLocal : awardTeam?.nameShort}</h2>
                            <h2> is from </h2>
                            <h2>{awardTeam?.updates?.organizationLocal ? awardTeam?.updates?.organizationLocal : awardTeam?.organization}</h2>
                            <h2>in {awardTeam?.updates?.cityStateLocal ? awardTeam?.updates?.cityStateLocal : `${awardTeam?.city}, ${awardTeam?.stateProv}`}{awardTeam?.country !== "USA" ? awardTeam?.country : ""}</h2>
                            <br />
                            <h2>Founded in {awardTeam?.rookieYear}, this is their {awardTeam?.yearsDisplay} season competing with FIRST.</h2>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="success" onClick={handleClose}>
                                Congratulations!
                            </Button>
                        </Modal.Footer>
                    </Modal>}

                </Container>
            }

        </Container>
    )
}

export default AwardsPage;