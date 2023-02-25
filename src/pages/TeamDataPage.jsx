import { Alert, Button, Container, Form, InputGroup, Modal, Table } from "react-bootstrap";
import { SortAlphaDown, SortAlphaUp, SortNumericDown, SortNumericUp } from 'react-bootstrap-icons';
import { merge, orderBy, find } from "lodash";
import { rankHighlight } from "../components/HelperFunctions";
import { useEffect, useState } from "react";
import moment from "moment";
import _ from "lodash";
import { toast } from "react-toastify";
import { useOnlineStatus } from "../contextProviders/OnlineContext";
import { utils, read, write, writeFile } from "xlsx";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import PizZipUtils from "pizzip/utils/index.js";
import { saveAs } from "file-saver";

function TeamDataPage({ selectedEvent, selectedYear, teamList, rankings, teamSort, setTeamSort, communityUpdates, setCommunityUpdates, allianceCount, lastVisit, setLastVisit, putTeamData, localUpdates, setLocalUpdates, qualSchedule, playoffSchedule }) {
    const [currentTime, setCurrentTime] = useState(moment());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(moment());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    //display the delay on the Announce Screen if we have a schedule

    function updateClass(updateTime) {
        var timeDifference = 0;
        var updateDelay = "";
        timeDifference = moment(currentTime).diff(updateTime, "hours");
        if (timeDifference < 24) {
            updateDelay = "alert-success";
        } else if ((timeDifference >= 24) && (timeDifference < 72)) {
            updateDelay = "alert-warning";
        } else if (timeDifference >= 72) {
            updateDelay = "alert-danger";
        }
        return updateDelay
    }




    const [show, setShow] = useState(false);
    const [showDownload, setShowDownload] = useState(false);
    const [updateTeam, setUpdateTeam] = useState(null);
    const [formValue, setFormValue] = useState(null);
    const [gaName, setGaName] = useState("");

    const handleClose = () => {
        setUpdateTeam(null);
        setShow(false);
    }

    const handleCloseDownload = () => {
        setShowDownload(false);
        setGaName("");
    }

    const handleSubmit = (mode, e) => {
        var visits = lastVisit;
        visits[`${updateTeam.teamNumber}`] = moment();
        var communityUpdatesTemp = _.cloneDeep(communityUpdates);
        var update = _.filter(communityUpdatesTemp, { "teamNumber": updateTeam.teamNumber })[0];
        var keys = Object.keys(formValue);
        keys.forEach((key) => {
            if (formValue[key] !== "") {
                update.updates[key] = formValue[key];
            } else if (update.updates[key] !== "") {
                update.updates[key] = formValue[key];
            }
        })
        update.updates.lastUpdate = moment().format();
        communityUpdatesTemp[_.findIndex(communityUpdatesTemp, { "teamNumber": updateTeam.teamNumber })] = update;
        setCommunityUpdates(communityUpdatesTemp);

        var localUpdatesTemp = _.cloneDeep(localUpdates)
        if (mode === "update") {
            //to do: actually update the team info locally and to the Cloud
            var response = putTeamData(updateTeam.teamNumber, update.updates);
            if (!response) {
                localUpdatesTemp.push({ "teamNumber": updateTeam.teamNumber, "update": update.updates });
                setLocalUpdates(localUpdatesTemp);
                var errorText = `Your update for team ${updateTeam.teamNumber} was not successful. We have saved the change locally, and you can send it later from here or the Settings page.`;
                toast.error(errorText);
                throw new Error(errorText);
            } else {
                toast.success(`Your update for team ${updateTeam.teamNumber} was successful. Thank you for helping keep the team data current.`)
            }
        } else {
            localUpdatesTemp.push({ "teamNumber": updateTeam.teamNumber, "update": update.updates });
            toast.success(`We have stored your update for team ${updateTeam.teamNumber}. Remember that this update is only visible to you until you save it to gatool Cloud.`)
            setLocalUpdates(localUpdatesTemp);
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

    const updateGaForm = (value) => {
        setGaName(value);
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

    const isOnline = useOnlineStatus();

    // The following section emits an Excel doc with two sheets:
    //   Team Table contains details about the teams at the event, including community updates;
    //   Schedule contains the schedule details at the time of export.
    function exportXLSX() {
        var data = [];
        var data2 = [];
        var record = {};
        var keys = [];
        var workbook = utils.book_new();
        var awards = [];
        var awardsKeys = [];

        //Add the team table to the worksheet
        data = teamListExtended.map((item) => {
            record = _.cloneDeep(item);
            awards = record.awards || {};
            record.awards = [];
            delete record.hallOfFame;
            awardsKeys = Object.keys(awards)
            awardsKeys.forEach((key) => {
                awards[key].Awards.forEach((award) => {
                    record.awards.push(`${award.year} ${award.eventName}: ${award.name}${award.person ? `: ${award.person}` : ""}`)
                })
            })
            record.awardList = _.join(record.awards, "; ");
            delete record.awards;
            delete record.source;
            return (record);
        })

        // @ts-ignore
        var ws = utils.json_to_sheet(data, { cellHTML: "true" });
        utils.book_append_sheet(workbook, ws, "Team Table");

        //Add the Schedule to the worksheet
        var schedule = qualSchedule?.schedule || [];
        if (playoffSchedule?.schedule?.length > 0) {
            schedule = _.concat(qualSchedule?.schedule, playoffSchedule?.schedule);
        }

        schedule.forEach((match) => {
            record = {};
            keys = Object.keys(match);
            keys.forEach((key) => {
                if (key === "teams") {
                    match.teams.forEach((team) => {
                        record[team.station] = team.teamNumber
                    })
                } else if (key === "winner") {
                    record.winner = match.winner.winner;
                    record.tieWinner = match.winner.tieWinner;
                    record.tieBreakerLevel = match.winner.level;
                } else {
                    record[key] = match[key];
                }
            })
            data2.push(record);
        })

        // @ts-ignore
        ws = utils.json_to_sheet(data2, { cellHTML: "true" });
        utils.book_append_sheet(workbook, ws, "Schedule");

        write(workbook, { bookType: "xlsx", bookSST: true, type: 'base64' });
        writeFile(workbook, "gatoolExport_" + selectedYear.value + selectedEvent.label + moment().format('MMDDYYYY_HHmmss') + ".xlsx");

    }

    function downloadTeamInfoSheets() {
        setShowDownload(true);
    }

    function handleSubmitDownload(e) {
        //toDo make this work.
        setShowDownload(false);
        console.log(e);
        generateDocx(gaName);
        setGaName("");
    }

    // The following section creates merged Word docs.
    // It is used in conjunction with the team list to create team info sheets.
    function loadFile(url, callback) {
        PizZipUtils.getBinaryContent(url, callback);
    }
    function generateDocx(gameAnnouncer) {
        loadFile(
            "images/gatool_team_information_sheets_merge.docx",
            function (error, content) {
                if (error) {
                    throw error;
                }
                var zip = new PizZip(content);
                var doc = new Docxtemplater(zip, {
                    paragraphLoop: true,
                    linebreaks: true,
                });

                var data = [];
                var record = {};

                //Create record list from all of the team data

                data = teamListExtended.map((team, index) => {
                    record = {};
                    record.tn = team.teamNumber;
                    record.year = selectedYear.value;
                    record.nameShort = team.nameShortLocal || team.nameShort;
                    record.organization = team.organizationLocal || team.organization;
                    record.robotName = team.robotNameLocal || team.robotName;
                    record.cityState = team.cityStateLocal || team.cityState;
                    record.cityState = team.cityStateLocal || `${team.city}, ${team.stateProv}${team.country !== "USA" ? `, ${team.country}` : ""}`;
                    record.topSponsors = team.topSponsorsLocal || team.topSponsors;
                    record.teamYearsNoCompete = team.teamYearsNoCompeteLocal || "";
                    record.teamMotto = team.teamMottoLocal || "";
                    record.rookieYear = team.rookieYear || "";
                    record.eventName = selectedEvent.label;
                    record.sayNumber = team.sayNumber || "";
                    record.gaName = gameAnnouncer || false;
                    if (index < teamListExtended.length - 1) {
                        record.lastTeam = false;
                    } else {
                        record.lastTeam = true;
                    }
                    return (record);
                })


                // Render the document (Replace {first_name} by John, {last_name} by Doe, ...)
                doc.render({
                    teams: data
                });

                var out = doc.getZip().generate({
                    type: "blob",
                    mimeType:
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    // compression: DEFLATE adds a compression step.
                    // For a 50MB output document, expect 500ms additional CPU time
                    compression: "DEFLATE",
                });
                // Output the document using Data-URI
                saveAs(out, selectedEvent.label + " " + selectedYear.value + " Team Info Sheets.docx");
            }
        );
    }

    // This function clicks the hidden file upload button
    function clickRestoreBackup() {
        document.getElementById("BackupFiles").click();
    }

    // This function clears the file input by removing and recreating the file input button
    function clearFileInput(id) {
        var oldInput = document.getElementById(id);
        var newInput = document.createElement("input");
        newInput.type = "file";
        newInput.id = oldInput.id;
        // @ts-ignore
        newInput.name = oldInput.name;
        newInput.className = oldInput.className;
        newInput.style.cssText = oldInput.style.cssText;
        oldInput.parentNode.replaceChild(newInput, oldInput)
    }

    // This function reads an uploaded Excel file and updates team data based on the
    // Excel file's content. The file must have been previously exported from gatool.
    // It will only update data that Game Announcers control in the Team Data page.
    function handleRestoreBackup(e) {
        var files = e.target.files;
        var i, f;
        for (i = 0; i !== files.length; ++i) {
            f = files[i];
            var reader = new FileReader();
            reader.onload = function (e) {
                var communityUpdatesTemp = _.cloneDeep(communityUpdates);
                // @ts-ignore
                var data = new Uint8Array(e.target.result);
                var workbook;
                workbook = read(data, { type: 'array' });
                var worksheet = workbook.Sheets[workbook.SheetNames[0]];
                var teams = utils.sheet_to_json(worksheet);
                if (!_.isUndefined(teams[0].teamNumber)) {
                    teams.forEach((team) => {
                        var update = {}
                        var keys = Object.keys(team);
                        update.teamNumber = team.teamNumber;
                        update.updates = {};
                        keys.forEach((key) => {
                            if (key.includes("Local")) {
                                update.updates[key] = team[key];
                                update.updates.lastUpdate = moment().format();
                            }
                        })
                        if (!_.isUndefined(team["showRobotName"])) {
                            update.updates["showRobotName"] = team["showRobotName"];
                            update.updates.lastUpdate = moment().format();
                        };
                        if (!_.isUndefined(team["teamNotes"])) {
                            update.updates["teamNotes"] = team["teamNotes"];
                            update.updates.lastUpdate = moment().format();
                        };
                        if (!_.isUndefined(team["sayNumber"])) {
                            update.updates["sayNumber"] = team["sayNumber"];
                            update.updates.lastUpdate = moment().format();
                        };
                        communityUpdatesTemp[_.findIndex(communityUpdatesTemp, { "teamNumber": team.teamNumber })] = update;
                    })
                    setCommunityUpdates(communityUpdatesTemp);
                    toast.success(`Your have successfully loaded updates for this event from Excel. Please check each team's details to ensure your changes were recorded properly.`)
                    clearFileInput("BackupFiles");
                    document.getElementById("BackupFiles").addEventListener('change', handleRestoreBackup);
                } else {
                    toast.error(`Your Excel file is malformed. Please download the Teams Table to Excel, compare your headers, and try again.`);
                    clearFileInput("BackupFiles");
                    document.getElementById("BackupFiles").addEventListener('change', handleRestoreBackup);
                }

            };
            reader.readAsArrayBuffer(f);
        }
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
            {selectedEvent && teamList?.teams.length > 0 && <><div>
                <h4>{selectedEvent?.label}</h4>
                <p className={"leftTable"}>This table is editable and sortable. Tap on a team number to change data for a specific team. Edits you make are local to this browser, and they will persist here if you do not clear your browser cache. You can save your changes to the gatool Cloud on the team details page or on the Setup Screen. Cells <span className={"teamTableHighlight"}>highlighted in green</span> have been modified, either by you or by other gatool users.</p>
                <Table responsive className={"leftTable topBorderLine"}>
                    <thead>
                        <tr>
                            <td>
                                <span style={{ cursor: "pointer", color: "darkblue" }} onClick={exportXLSX}><b><img style={{ float: "left" }} width="30" src="images/excelicon.png" alt="Excel Logo" /> Tap to download this table as Excel</b></span>
                            </td>
                            <td>
                                <span style={{ cursor: "pointer", color: "darkblue" }} onClick={downloadTeamInfoSheets}><img style={{ float: "left" }} width="30" src="images/wordicon.png" alt="Word Logo" /> <b>Tap here to download a merged document (docx).</b></span>
                            </td>
                            <td>
                                <span style={{ cursor: "pointer", color: "darkblue" }} onClick={clickRestoreBackup}><input type="file" id="BackupFiles" onChange={handleRestoreBackup} className={"hiddenInput"} /><b><img style={{ float: "left" }} width="30" src="images/excelicon.png" alt="Excel Logo" /> Tap to restore team data from Excel</b></span>
                            </td>
                        </tr>
                    </thead>

                    <tbody>
                        <tr >
                            <td>
                                <p>You can use this as a backup of your team data in conjunction with the Restore Backup button on the right. You can also merge this with Word to create team data sheets you can hand out at an event. <i>Note: this will save to Files on iOS 13+</i></p>
                            </td>
                            <td>
                                <p>This merged doc contains all of the information in your Teams List, merged onto a template you can print and distribute to teams. <i>Note: this will save to Files on iOS 13+</i></p>
                            </td>
                            <td>
                                <p>You can export your teams data to Excel using the button on the left, and then restore it from backup here. This is handy in low or no network situations, where you may be unable to update changes to gatool Cloud. <i>Note: Be careful if you modify the Excel file and then import it here.</i></p>
                            </td>
                        </tr>
                    </tbody>
                </Table>
                <Table responsive striped bordered size="sm" className={"teamTable"}>
                    <thead className="thead-default">
                        <tr>
                            <th onClick={() => (teamSort === "teamNumber") ? setTeamSort("-teamNumber") : setTeamSort("teamNumber")}><b>Team #{teamSort === "teamNumber" ? <SortNumericDown /> : ""}{teamSort === "-teamNumber" ? <SortNumericUp /> : ""}</b></th>
                            <th onClick={() => (teamSort === "rank") ? setTeamSort("-rank") : setTeamSort("rank")}> <b>Rank{teamSort === "rank" ? <SortNumericDown /> : ""}{teamSort === "-rank" ? <SortNumericUp /> : ""}</b></th>
                            <th onClick={() => (teamSort === "nameShort") ? setTeamSort("-nameShort") : setTeamSort("nameShort")}><b>Team Name{teamSort === "nameShort" ? <SortAlphaDown /> : ""}{teamSort === "-nameShort" ? <SortAlphaUp /> : ""}</b></th>
                            <th onClick={() => (teamSort === "citySort") ? setTeamSort("-citySort") : setTeamSort("citySort")}><b>City{teamSort === "citySort" ? <SortAlphaDown /> : ""}{teamSort === "-citySort" ? <SortAlphaUp /> : ""}</b></th>
                            <th ><b>Top Sponsors</b></th>
                            <th ><b>Organization</b></th>
                            <th onClick={() => (teamSort === "rookieYear") ? setTeamSort("-rookieYear") : setTeamSort("rookieYear")}><b>Rookie Year{teamSort === "rookieYear" ? <SortNumericDown /> : ""}{teamSort === "-rookieYear" ? <SortNumericUp /> : ""}</b></th>
                            <th ><b>Robot Name</b></th>
                            <th ><b>Additional Notes</b></th>
                        </tr>
                    </thead>
                    <tbody>
                        {teamList && teamList.teams && teamListExtended.map((team) => {
                            var cityState = `${team?.city}, ${team?.stateProv} ${(team?.country !== "USA") ? " " + team?.country : ""}`;
                            var avatar = `<img src='https://api.gatool.org/v3/${selectedYear.value}/avatars/team/${team?.teamNumber}/avatar.png' onerror="this.style.display='none'">&nbsp`;
                            var teamNameWithAvatar = team?.nameShortLocal ? team?.nameShortLocal : team?.nameShort;
                            teamNameWithAvatar = avatar + "<br />" + teamNameWithAvatar;

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
            </div></>}
            <Modal centered={true} show={showDownload} onHide={handleCloseDownload}>
                <Modal.Header className={"success"} closeButton>
                    <Modal.Title >Download Team Info Sheets</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>You are about to download a Word Docx which contains all of the team data we know about the teams. If you have loaded team data from gatool cloud, or if you have made local changes, those changes will be reflected on the sheets. <br /> If you would like us to personalize the sheets with your name as the Game Announcer, please enter it below:</p>
                    <Form>
                        <Form.Control type="text" onChange={(e) => updateGaForm(e.target.value)} />
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="success" size="sm" onClick={handleSubmitDownload}>Download Info Sheets</Button>
                </Modal.Footer>
            </Modal>

            {updateTeam && <Modal centered={true} fullscreen={true} show={show} size="lg" onHide={handleClose}>
                <Modal.Header className={"success"} closeButton>
                    <Modal.Title >Editing Team {updateTeam.teamNumber}'s Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Use this form to update team information for <b>Team {updateTeam.teamNumber}.</b> Editable fields are shown below. Your changes will be stored locally on your machine and should not be erased if you close your browser.</p>
                    <p>Tap on each item to update its value. Tap <b>DONE</b> when you're finished editing, or browse to another tab to cancel editing. Items <span className={"teamTableHighlight"}><b>highlighted in green</b></span> have local changes. Motto and Notes do not exist in TIMS, so they are always local. To reset any value to the TIMS value, simply delete it here and tap DONE.</p>
                    <p>You can load changes to Team Data from gatool Cloud, or you can sync your local values with gatool Cloud using the buttons at the bottom of this screen.</p>
                    <div className={updateClass(updateTeam?.lastUpdate)}><p>Last updated in gatool Cloud: {moment(updateTeam?.lastUpdate).fromNow()}</p></div>
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
                                <Form.Text ><Form.Check className={"robotNameCheckbox"} type="switch" id="showRobotName" label="Show robot name" defaultChecked={updateTeam?.showRobotName ? updateTeam?.showRobotName : true} onChange={(e) => updateForm("showRobotName", e.target.checked)} /></Form.Text>
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
                            <Form.Control className={updateTeam.teamYearsNoCompeteLocal ? "formHighlight" : formValue.teamYearsNoCompeteLocal ? "formHighlight" : ""} type="number" placeholder={"Enter the count of years rather than the actual years: i.e. 5, not 2004-2007"} defaultValue={updateTeam.teamYearsNoCompeteLocal} onChange={(e) => updateForm("teamYearsNoCompeteLocal", e.target.value)} />
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
                    <Button variant="success" size="sm" disabled={!isOnline} onClick={(e) => { handleSubmit("update", e) }}>Submit changes and upload to gatool Cloud</Button>
                </Modal.Footer>
            </Modal>}
        </Container>
    )
}

export default TeamDataPage;