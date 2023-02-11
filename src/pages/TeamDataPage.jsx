import { Alert, Button, Container, Form, InputGroup, Modal, Table } from "react-bootstrap";
import { SortAlphaDown, SortAlphaUp, SortNumericDown, SortNumericUp } from 'react-bootstrap-icons';
import { merge, orderBy, find } from "lodash";
import { rankHighlight } from "../components/HelperFunctions";
import { useEffect, useState } from "react";
import moment from "moment";

function TeamDataPage({ selectedEvent, selectedYear, teamList, rankings, teamSort, setTeamSort, communityUpdates, allianceCount, lastVisit, setLastVisit }) {
    const [currentTime, setCurrentTime] = useState(moment());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(moment());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const [show, setShow] = useState(false);
    const [updateTeam, setUpdateTeam] = useState({});
    const [formValue, setFormValue] = useState({});

    const handleClose = () => {
        setUpdateTeam(null);
        setShow(false);
    }

    const handleSubmit = (update, e) => {
        var visits = lastVisit;
        visits[`${updateTeam.teamNumber}`] = moment();
        if (update === "update") {
            console.log(formValue)
            //to do: actually update the team info locally and to the Cloud
        } else {
            //to do: actually update the team info locally
        }
        setLastVisit(visits);


        setUpdateTeam(null);
        setShow(false);
    }

    const handleShow = (team, e) => {
        setUpdateTeam(team);
        setFormValue({});
        setShow(true);
    }

    const clearVisits = (single, e) => {
        if (single) {
            var visits = lastVisit;
            delete visits[`${updateTeam.teamNumber}`]
        } else {
            setLastVisit({});
        }

        setUpdateTeam(null);
        setShow(false);
    }

    const updateForm = (prop, value) => {
        var update = formValue;
        update[prop] = value;
        setFormValue(update);
    }


    function getTeamRank(teamNumber) {
        var team = find(rankings?.ranks, { "teamNumber": teamNumber });
        return team?.rank;
    }

    function updateHighlight(update) {
        var style = {
            backgroundColor: ""
        }
        if (update) {
            style.backgroundColor = "rgb(195, 244, 199)"
            return style;
        }
    }

    var teamListExtended = teamList?.teams?.map((teamRow) => {
        teamRow.rank = getTeamRank(teamRow?.teamNumber);
        teamRow.citySort = teamRow?.country + teamRow?.stateProv + teamRow?.city;
        var update = find(communityUpdates, { "teamNumber": teamRow.teamNumber });
        teamRow = merge(teamRow, update?.updates);
        return teamRow;
    })

    if (teamSort.charAt(0) === "-") {
        teamListExtended = orderBy(teamListExtended, teamSort.slice(1), 'desc');
    } else {
        teamListExtended = orderBy(teamListExtended, teamSort, 'asc');
    }

    return (
        <Container fluid>
            {!selectedEvent && !teamList && <div>
                <Alert variant="warning" >You need to select an event before you can see anything here.</Alert>
            </div>}
            {selectedEvent && !teamList && <div>
                <Alert variant="warning" ><div><img src="loadingIcon.gif" alt="Loading data..." /></div><div>Awaiting team data for {selectedEvent.label}</div></Alert>
            </div>}
            {selectedEvent && teamList?.teams.length === 0 && <div>
                <Alert variant="warning" ><div><img src="loadingIcon.gif" alt="Loading data..." /></div><div>Awaiting team data for {selectedEvent.label}</div></Alert>
            </div>}
            {selectedEvent && teamList?.teams.length > 0 && <div>
                <h4>{selectedEvent?.label}</h4>
                <p>This table is editable and sortable. Tap on a team number to change data for a specific team. Edits you make are local to this browser, and they will persist here if you do not clear your browser cache. You can save your changes to the gatool Cloud on the team details page or on the Setup Screen. Cells <span className={"teamTableHighlight"}>highlighted in green</span> have been modified, either by you or by other gatool users.</p>
                <Table responsive striped bordered size="sm" className={"teamTable"}>
                    <thead className="thead-default">
                        <tr>
                            <th sm={1} onClick={() => (teamSort === "teamNumber") ? setTeamSort("-teamNumber") : setTeamSort("teamNumber")}><b>Team #{teamSort === "teamNumber" ? <SortNumericDown /> : ""}{teamSort === "-teamNumber" ? <SortNumericUp /> : ""}</b></th>
                            <th sm={1} onClick={() => (teamSort === "rank") ? setTeamSort("-rank") : setTeamSort("rank")}> <b>Rank{teamSort === "rank" ? <SortNumericDown /> : ""}{teamSort === "-rank" ? <SortNumericUp /> : ""}</b></th>
                            <th sm={2} onClick={() => (teamSort === "nameShort") ? setTeamSort("-nameShort") : setTeamSort("nameShort")}><b>Team Name{teamSort === "nameShort" ? <SortAlphaDown /> : ""}{teamSort === "-nameShort" ? <SortAlphaUp /> : ""}</b></th>
                            <th sm={1} onClick={() => (teamSort === "citySort") ? setTeamSort("-citySort") : setTeamSort("citySort")}><b>City{teamSort === "citySort" ? <SortAlphaDown /> : ""}{teamSort === "-citySort" ? <SortAlphaUp /> : ""}</b></th>
                            <th sm={2} ><b>Top Sponsors</b></th>
                            <th sm={1} ><b>Organization</b></th>
                            <th sm={1} onClick={() => (teamSort === "rookieYear") ? setTeamSort("-rookieYear") : setTeamSort("rookieYear")}><b>Rookie Year{teamSort === "rookieYear" ? <SortNumericDown /> : ""}{teamSort === "-rookieYear" ? <SortNumericUp /> : ""}</b></th>
                            <th sm={1} ><b>Robot Name</b></th>
                            <th sm={2} ><b>Additional Notes</b></th>
                        </tr>
                    </thead>
                    <tbody>
                        {teamList && teamList.teams && teamListExtended.map((team) => {
                            var cityState = `${team?.city}, ${team?.stateProv} ${(team?.country !== "USA") ? " " + team?.country : ""}`;
                            var avatar = `<img src='https://api.gatool.org/v3/${selectedYear.value}/avatars/team/${team?.teamNumber}/avatar.png' onerror="this.style.display='none'">&nbsp`;
                            var teamNameWithAvatar = team?.nameShortLocal ? team?.nameShortLocal : team?.nameShort;
                            teamNameWithAvatar = avatar + teamNameWithAvatar;

                            return <tr key={`teamDataRow${team?.teamNumber}`}>
                                <td className={`teamNumberButton ${lastVisit[`${team?.teamNumber}`] ? "teamTableButtonHighlight" : ""}`} onClick={(e) => handleShow(team, e)} key={"teamData" + team?.teamNumber}><span className={"teamDataNumber"}>{team?.teamNumber}</span><br />{lastVisit[`${team?.teamNumber}`] ? moment(lastVisit[`${team?.teamNumber}`]).fromNow() : "No recent visit."}</td>
                                <td style={rankHighlight(team?.rank ? team?.rank : 100, allianceCount?.count)}>{team?.rank}</td>
                                <td dangerouslySetInnerHTML={{ __html: teamNameWithAvatar }} style={updateHighlight(team?.nameShortLocal)}></td>
                                <td style={updateHighlight(team?.cityStateLocal)}>{team?.cityStateLocal ? team?.cityStateLocal : cityState} </td>
                                <td style={updateHighlight(team?.topSponsorsLocal)}>{team?.topSponsorsLocal ? team?.topSponsorsLocal : team?.topSponsors}</td>
                                <td style={updateHighlight(team?.organizationLocal)}>{team?.organizationLocal ? team?.organizationLocal : team?.schoolName}</td>
                                <td>{team?.rookieYear}</td>
                                <td style={updateHighlight(team?.robotNameLocal)}>{team?.robotNameLocal}</td>
                                <td style={updateHighlight(team?.teamNotes)} dangerouslySetInnerHTML={{ __html: team?.teamNotes }}></td>
                            </tr>
                        })}
                    </tbody>
                </Table>
                <Button variant="success" size="sm" onClick={(e) => { clearVisits(false, e) }}>Reset visit times. Use at the start of each day.</Button><br /><br /><br />
            </div>}
            {updateTeam && <Modal centered={true} fullscreen={true} show={show} size="lg" onHide={handleClose}>
                <Modal.Header className={"success"} closeButton>
                    <Modal.Title >Editing Team {updateTeam.teamNumber}'s Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Use this form to update team information for <b>Team {updateTeam.teamNumber}.</b> Editable fields are shown below. Your changes will be stored locally on your machine and should not be erased if you close your browser.</p>
                    <p>Tap on each item to update its value. Tap <b>DONE</b> when you're finished editing, or browse to another tab to cancel editing. Items <span className={"teamTableHighlight"}><b>highlighted in green</b></span> have local changes. Motto and Notes do not exist in TIMS, so they are always local. To reset any value to the TIMS value, simply delete it here and tap DONE.</p>
                    <p>You can load changes to Team Data from gatool Cloud, or you can sync your local values with gatool Cloud using the buttons at the bottom of this screen.</p>
                    <p>Last updated in gatool Cloud: No recent update</p>
                    <Form>
                        <Form.Group controlId="teamName">
                            <Form.Label className={"formLabel"}><b>Team Name ({updateTeam.nameShort ? updateTeam.nameShort : "No team name"} in TIMS)</b></Form.Label>
                            <Form.Control className={updateTeam.nameShortLocal ? "formHighlight" : formValue.nameShortLocal ? "formHighlight" : ""} type="text" placeholder={updateTeam.nameShort} defaultValue={updateTeam.nameShortLocal ? updateTeam.nameShortLocal : updateTeam.nameShort} onChange={(e) => updateForm("nameShortLocal", e.target.value)} />
                        </Form.Group>
                        <Form.Group controlId="organization">
                            <Form.Label className={"formLabel"}><b>Organization/School ({updateTeam.organization ? updateTeam.organization : "No organization in TIMS"} in TIMS)</b></Form.Label>
                            <Form.Control className={updateTeam.organizationLocal ? "formHighlight" : formValue.organizationLocal ? "formHighlight" : ""} type="text" placeholder={updateTeam.organization} defaultValue={updateTeam.organizationLocal ? updateTeam.organizationLocal : updateTeam.organization} onChange={(e) => updateForm("organizationLocal", e.target.value)} />
                        </Form.Group>
                        <Form.Group controlId="sayNumber">
                            <Form.Label className={"formLabel"}><b>How to pronounce the team number (some teams are particular)</b></Form.Label>
                            <Form.Control className={updateTeam.sayNumber ? "formHighlight" : formValue.sayNumber ? "formHighlight" : ""} type="text" placeholder={updateTeam.sayNumber} defaultValue={updateTeam.sayNumber} onChange={(e) => updateForm("sayNumber", e.target.value)} />
                        </Form.Group>
                        <Form.Group controlId="robotName">
                            <InputGroup>
                                <Form.Label className={"formLabel"}><b>Robot Name ({updateTeam.robotName ? updateTeam.robotName : "No robot name"}) in TIMS</b> </Form.Label>
                                <Form.Text ><Form.Check className={"robotNameCheckbox"} type="switch" id="showRobotName" label="Show robot name" defaultChecked={updateTeam?.showRobotName ? updateTeam?.showRobotName : true} onChange={(e) => updateForm("showRobotName", e.target.checked)}/></Form.Text>
                            </InputGroup>
                            <Form.Control className={updateTeam.robotNameLocal ? "formHighlight" : formValue.robotNameLocal ? "formHighlight" : ""} type="text" placeholder={updateTeam.robotName} defaultValue={updateTeam.robotNameLocal ? updateTeam.robotNameLocal : updateTeam.robotName} onChange={(e) => updateForm("robotNameLocal", e.target.value)} />
                        </Form.Group>
                        <Form.Group controlId="teamMotto">
                            <Form.Label className={"formLabel"}><b>Team Motto (Team Mottoes do not come from <i>FIRST</i>)</b></Form.Label>
                            <Form.Control className={updateTeam.teamMottoLocal ? "formHighlight" : formValue.teamMottoLocal ? "formHighlight" : ""} type="text" placeholder={updateTeam.teamMottoLocal} defaultValue={updateTeam.teamMottoLocal} onChange={(e) => updateForm("teamMottoLocal", e.target.value)} />
                        </Form.Group>
                        <Form.Group controlId="cityState">
                            <Form.Label className={"formLabel"}><b>City/State ({`${updateTeam?.city}, ${updateTeam?.stateProv} ${(updateTeam?.country !== "USA") ? " " + updateTeam?.country : ""}`}) in TIMS)</b></Form.Label>
                            <Form.Control className={updateTeam.cityStateLocal ? "formHighlight" : formValue.cityStateLocal ? "formHighlight" : ""} type="text" placeholder={`${updateTeam?.city}, ${updateTeam?.stateProv} ${(updateTeam?.country !== "USA") ? " " + updateTeam?.country : ""}`} defaultValue={updateTeam.cityStateLocal ? updateTeam.cityStateLocal : `${updateTeam?.city}, ${updateTeam?.stateProv} ${(updateTeam?.country !== "USA") ? " " + updateTeam?.country : ""}`} onChange={(e) => updateForm("cityStateLocal", e.target.value)} />
                        </Form.Group>
                        <Form.Group controlId="teamYearsNoCompete">
                            <Form.Label className={"formLabel"}><b>Number of seasons NOT competing with FIRST (will be used in calculating Nth season)</b></Form.Label>
                            <Form.Control className={updateTeam.teamYearsNoCompeteLocal ? "formHighlight" : formValue.teamYearsNoCompeteLocal ? "formHighlight" : ""} type="text" placeholder={"Enter the count of years rather than the actual years: i.e. 5, not 2004-2007"} defaultValue={updateTeam.teamYearsNoCompeteLocal} onChange={(e) => updateForm("teamYearsNoCompeteLocal", e.target.value)} />
                        </Form.Group>
                        <Form.Group controlId="teamNotesLocal">
                            <Form.Label className={"formLabel"}><b>Team Notes for Announce Screen (These notes are local notes and do not come from <i>FIRST</i>)</b></Form.Label>
                            <div className={updateTeam.teamNotesLocal ? "form-control formHighlight" : formValue.teamNotesLocal ? "form-control formHighlight" : "form-control"} contentEditable placeholder={"Enter some new notes you would like to appear on the Announce Screen"} dangerouslySetInnerHTML={{ __html: updateTeam.teamNotesLocal }} onKeyDown={(e) => updateForm("teamNotesLocal", e.currentTarget.innerHTML)}></div>
                        </Form.Group>
                        <Form.Group controlId="teamNotes">
                            <Form.Label className={"formLabel"}><b>Team Notes for the Team Data Screen (These notes are local notes and do not come from <i>FIRST</i>)</b></Form.Label>
                            <div className={updateTeam.teamNotes ? "form-control formHighlight" : formValue.teamNotes ? "form-control formHighlight" : "form-control"} contentEditable placeholder={"Enter some new notes you would like to appear on the Team Data Screen"} dangerouslySetInnerHTML={{ __html: updateTeam.teamNotes }} onKeyDown={(e) => updateForm("teamNotes", e.currentTarget.innerHTML)}></div>
                        </Form.Group>
                        <Form.Group controlId="topSponsors">
                            <Form.Label className={"formLabel"}><b>Top Sponsors (Enter no more than 5 top sponsors from the full sponsor list below)</b></Form.Label>
                            <Form.Control className={updateTeam.topSponsorsLocal ? "formHighlight" : formValue.topSponsorsLocal ? "formHighlight" : ""} type="text" placeholder={updateTeam?.topSponsors} defaultValue={updateTeam.topSponsorsLocal ? updateTeam.topSponsorsLocal : updateTeam?.topSponsors} onChange={(e) => updateForm("topSponsorsLocal", e.target.value)} />
                        </Form.Group>
                        <Form.Group controlId="sponsors">
                            <Form.Label className={"formLabel"}><b>Full list of Sponsors (For reference only. This field does not appear in the UI. Delete to revert to TIMS value)</b></Form.Label>
                            <Form.Control className={updateTeam.sponsorsLocal ? "formHighlight" : formValue.sponsorsLocal ? "formHighlight" : ""} type="text" placeholder={updateTeam?.sponsors} defaultValue={updateTeam.sponsorsLocal ? updateTeam.sponsorsLocal : updateTeam?.sponsors} onChange={(e) => updateForm("sponsorsLocal", e.target.value)} />
                        </Form.Group>
                    </Form>



                </Modal.Body>
                <Modal.Footer>
                    <Button variant="warning" size="sm" onClick={(e) => { clearVisits(true, e) }}>Reset visit times</Button><Button variant="primary" size="sm" onClick={(e) => { handleSubmit("save", e) }}>Submit changes but only keep them locally</Button>
                    <Button variant="success" size="sm" onClick={(e) => { handleSubmit("update", e) }}>Submit changes and upload to gatool Cloud</Button>
                </Modal.Footer>
            </Modal>}

        </Container>
    )
}

export default TeamDataPage;