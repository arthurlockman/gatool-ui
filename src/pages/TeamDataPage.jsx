import { Alert, Button, Container, Form, InputGroup, Modal, Table } from "react-bootstrap";
import { CalendarPlusFill, SortAlphaDown, SortAlphaUp, SortNumericDown, SortNumericUp } from 'react-bootstrap-icons';
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
import { useHotkeysContext } from "react-hotkeys-hook";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';
import { useInterval } from 'react-interval-hook';

function TeamDataPage({ selectedEvent, selectedYear, teamList, rankings, teamSort, setTeamSort, communityUpdates, setCommunityUpdates, allianceCount, lastVisit, setLastVisit, putTeamData, localUpdates, setLocalUpdates, qualSchedule, playoffSchedule, originalAndSustaining, monthsWarning, user, getTeamHistory, timeFormat, getCommunityUpdates }) {
    const [currentTime, setCurrentTime] = useState(moment());
    const { disableScope, enableScope } = useHotkeysContext();

    /**
     * Display the delay on the Announce Screen if we have a schedule
     * @param {moment.Moment} updateTime 
     */
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

    /**
     * /Display a warning on the Team Data screen if the data is over 6 months old
     * @param {moment.Moment} updateTime 
     */
    function updateWarning(updateTime) {
        var timeDifference = 0;
        var updateDelay = false;
        timeDifference = moment(currentTime).diff(updateTime, "months");
        if (timeDifference >= monthsWarning?.value) {
            updateDelay = true;
        }
        return updateDelay
    }


    const [show, setShow] = useState(false);
    const [showDownload, setShowDownload] = useState(false);
    const [updateTeam, setUpdateTeam] = useState(null);
    const [formValue, setFormValue] = useState(null);
    const [gaName, setGaName] = useState("");
    const [showHistory, setShowHistory] = useState(false);
    const [teamHistory, setTeamHistory] = useState(null);

    /**
     * Quill Modules
     */
    const modules = {
        toolbar: [
            [{ header: '1' }, { header: '2' }],
            [{ size: [] }],
            ['bold', 'italic', 'underline'],
            [{ 'color': [] }],
            [
                { list: 'ordered' },
                { list: 'bullet' },
                { indent: '-1' },
                { indent: '+1' },
            ],
            ['link'],
            ['clean'],
        ],
        clipboard: {
            // toggle to add extra line breaks when pasting HTML:
            matchVisual: false,
        },
    }
    const modules2 = {
        toolbar: [
            ['bold', 'italic', 'underline'],
            ['clean'],
        ],
        clipboard: {
            // toggle to add extra line breaks when pasting HTML:
            matchVisual: false,
        },
    }

    /*
     * Quill editor formats
     * See https://quilljs.com/docs/formats/
     */
    const formats = [
        'header',
        'size',
        'bold',
        'color',
        'italic',
        'underline',
        'list',
        'bullet',
        'indent',
        'link',
    ]
    const formats2 = [
        'bold',
        'italic',
        'underline',
    ]

    const { start, stop } = useInterval(
        () => {
            setCurrentTime(moment());
        },
        1000,
        {
            autoStart: true,
            immediate: false,
            selfCorrecting: true,
            onFinish: () => {
                console.log('Clock Stopped in TeamUpdate Page.');
            },
        }
    )

    // Automatically updates the curent time. Checks every second if active.
    useEffect(() => {
        if (teamList && !updateTeam) {
            start()
        } else { stop() }
    }, [teamList, updateTeam, start, stop]);

    const handleClose = () => {
        setUpdateTeam(null);
        setShow(false);
        enableScope('tabNavigation');
    }

    const handleTrack = async () => {
        var visits = _.cloneDeep(lastVisit);
        visits[`${updateTeam.teamNumber}`] = moment();
        await setLastVisit(visits);
        setUpdateTeam(null);
        setShow(false);
        enableScope('tabNavigation');
    }

    const handleCloseDownload = () => {
        setShowDownload(false);
        setGaName("");
        enableScope('tabNavigation');
    }

    /**
     * Stores the team updates for a specific team. If we are unable to save to gatool Cloud, it will store the update locally
     * for update later.
     * @param {string} mode - determines whether to send the update to gatool Cloud. "update" = send to cloud 
     * @param {*} e - the inbound event from clicking the button. 
     */
    const handleSubmit = async (mode, e) => {
        var visits = _.cloneDeep(lastVisit);
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

        var localUpdatesTemp = _.cloneDeep(localUpdates);

        if (mode === "update") {
            var resp = []
            resp.push(putTeamData(updateTeam.teamNumber, update.updates));
            Promise.all(resp).then(async (response) => {
                if (response[0].status !== 204) {
                    var errorText = `Your update for team ${updateTeam.teamNumber} was not successful. We have saved the change locally, and you can send it later from here or the Settings page.`;
                    toast.error(errorText);
                    throw new Error(errorText);
                } else {
                    var itemExists = _.findIndex(localUpdatesTemp, { "teamNumber": updateTeam.teamNumber });
                    if (itemExists >= 0) {
                        localUpdatesTemp.splice(itemExists, 1);
                    }
                    toast.success(`Your update for team ${updateTeam.teamNumber} was successful. Thank you for helping keep the team data current.`)
                }
                await setLocalUpdates(localUpdatesTemp);
            })

        } else {
            localUpdatesTemp.push({ "teamNumber": updateTeam.teamNumber, "update": update.updates });
            toast.success(`We have stored your update for team ${updateTeam.teamNumber}. Remember that this update is only visible to you until you save it to gatool Cloud.`)
            setLocalUpdates(localUpdatesTemp);
        }

        await setLastVisit(visits);
        setUpdateTeam(null);
        setShow(false);
        enableScope('tabNavigation');
    }

    const handleRestoreData = async (data) => {
        console.log(data);
        var resp = await putTeamData(data.team.teamNumber, data.update);
        if (resp.status !== 204) {
            var errorText = `Your update for team ${data.team.teamNumber} was not successful.`;
            toast.error(errorText);
            throw new Error(errorText);
        } else {
            toast.success(`You restored data for team ${data.team.teamNumber}.`);
        }
        handleCloseHistory();
        handleClose();
        await getCommunityUpdates(false, null);
    }



    /**
     * Opens the team data screen so that a user can view and edit the team details 
     * @param {number} team - The number of the team to display
     * @param {*} e  - the inbound event from clicking the button. 
     */
    const handleShow = (team, e) => {
        if (user["https://gatool.org/roles"].indexOf("user") >= 0) {
            setUpdateTeam(team);
            setFormValue({});
            setShow(true);
            disableScope('tabNavigation');
        }
    }

    const handleHistory = async (team, e) => {
        if (user["https://gatool.org/roles"].indexOf("user") >= 0) {
            var history = await getTeamHistory(team.teamNumber);
            setShowHistory(true);
            setTeamHistory(_.orderBy(history, ['modifiedDate'], ['desc']));
            disableScope('tabNavigation');
        }
    }

    const handleCloseHistory = () => {
        setShowHistory(false);
        setTeamHistory(null);
        enableScope('tabNavigation');
    }

    const clearVisits = (single, e) => {
        if (single) {
            var visits = _.cloneDeep(lastVisit);
            delete visits[`${updateTeam.teamNumber}`];
            setLastVisit(visits);
        } else {
            setLastVisit({});
        }

        setUpdateTeam(null);
        setShow(false);
        enableScope('tabNavigation');
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
            style.backgroundColor = "rgb(195, 244, 199)";
            style.margin = "0px";
        }
        return style;
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
        var schedule = qualSchedule?.schedule?.schedule || qualSchedule?.schedule || [];
        if (playoffSchedule?.schedule?.length > 0 || playoffSchedule?.schedule?.schedule?.length > 0) {
            schedule = _.concat(qualSchedule?.schedule || qualSchedule?.schedule?.schedule, playoffSchedule?.schedule?.schedule || playoffSchedule?.schedule);
        }

        schedule.forEach((match) => {
            record = {};
            keys = Object.keys(match);
            keys.forEach((key) => {
                if (key === "teams") {
                    match?.teams.forEach((team) => {
                        record[team.station] = team.teamNumber
                    })
                } else if (key === "winner") {
                    record.winner = match?.winner?.winner;
                    record.tieWinner = match?.winner?.tieWinner;
                    record.tieBreakerLevel = match?.winner?.level;
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
        disableScope('tabNavigation');
    }

    function handleSubmitDownload(e) {
        //toDo make this work.
        setShowDownload(false);
        generateDocx(gaName);
        setGaName("");
        enableScope('tabNavigation');
    }

    // The following section creates merged Word docs.
    // It is used in conjunction with the team list to create team info sheets.
    function loadFile(url, callback) {
        PizZipUtils.getBinaryContent(url, callback);
    }
    function generateDocx(gameAnnouncer) {
        loadFile(
            "images/gatool_team_information_sheets_merge_2024.docx",
            function (error, content) {
                if (error) {
                    var errorText = "Something went wrong loading the template. Please try again."
                    throw new Error(errorText);
                }
                var zip = new PizZip(content);
                var doc = new Docxtemplater(zip, {
                    paragraphLoop: true,
                    linebreaks: true
                });

                var data = [];
                var record = {};
                var gameAnnouncerFixed = gameAnnouncer.trim();

                if (gameAnnouncer.split(",").length > 1) {
                    var gaTemp = _.map(gameAnnouncer.split(","), _.trim);
                    if (gaTemp.length > 2) {
                        var gaLast = gaTemp.pop();
                        gameAnnouncerFixed = `${gaTemp.join(", ")} and ${gaLast}`
                    } else if (gaTemp.length === 2) {
                        gameAnnouncerFixed = gaTemp.join(" and ");
                    }
                }

                //Create record list from all of the team data
                data = teamListExtended.map((team, index) => {
                    record = {};
                    record.tn = team.teamNumber;
                    record.year = selectedYear.value;
                    record.nameShort = team.nameShortLocal || team.nameShort;
                    record.organization = team.organizationLocal || team.organization;
                    record.robotName = team.robotNameLocal || team.robotName;
                    record.cityState = team.cityStateLocal || `${team.city}, ${team.stateProv}${team.country !== "USA" ? `, ${team.country}` : ""}`;
                    record.topSponsors = team.topSponsorsLocal || team.topSponsors;
                    record.teamYearsNoCompete = team.teamYearsNoCompeteLocal || "";
                    record.teamMotto = team.teamMottoLocal || "";
                    record.rookieYear = team.rookieYear || "";
                    record.eventName = selectedEvent.label;
                    record.sayNumber = team.sayNumber || "";
                    //let tmp = document.createElement("DIV");
                    //tmp.innerHTML = team.teamNotes;
                    //record.teamNotes = tmp.textContent || tmp.innerText || "";
                    // eslint-disable-next-line
                    record.teamNotes = team.teamNotes.replace("<br>", "\n").replace("<\div>", "<\div>\n").replace(/&amp;/g, "&").replace(/&nbsp;/g, ' ').replace(/(<([^>]+)>)/gi, "") || "";
                    record.gaName = gameAnnouncerFixed || false;
                    record.gaNames = gameAnnouncer.split(",").length > 1 || false;
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
        var i, f, currentUpdate, newUpdate;
        for (i = 0; i !== files.length; ++i) {
            f = files[i];
            var reader = new FileReader();
            // eslint-disable-next-line
            reader.onload = async function (e) {
                var communityUpdatesTemp = _.cloneDeep(communityUpdates);
                // @ts-ignore
                var data = new Uint8Array(e.target.result);
                var workbook;
                var itemExists;
                var localUpdatesTemp = _.cloneDeep(localUpdates);
                workbook = read(data, { type: 'array' });
                var worksheet = workbook.Sheets[workbook.SheetNames[0]];
                var teams = utils.sheet_to_json(worksheet);
                var update = {};
                var keys = [];
                if (!_.isUndefined(teams[0].teamNumber)) {
                    teams.forEach((team) => {
                        update = {}
                        keys = Object.keys(team);
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
                        newUpdate = _.cloneDeep(update);
                        currentUpdate = _.cloneDeep(communityUpdates[_.findIndex(communityUpdatesTemp, { "teamNumber": team.teamNumber })]);
                        if (newUpdate?.updates) {
                            delete newUpdate.updates.lastUpdate;
                            delete newUpdate.updates.source;
                        }
                        if (currentUpdate?.updates) {
                            delete currentUpdate.updates.lastUpdate;
                            delete currentUpdate.updates.source;
                        }

                        if (!_.isEqual(newUpdate, currentUpdate) && currentUpdate) {
                            itemExists = _.findIndex(localUpdatesTemp, { "teamNumber": update?.teamNumber });
                            if (itemExists >= 0) {
                                localUpdatesTemp.splice(itemExists, 1);
                            }
                            localUpdatesTemp.push({ "teamNumber": update.teamNumber, "update": update.updates });
                        }
                        communityUpdatesTemp[_.findIndex(communityUpdatesTemp, { "teamNumber": team?.teamNumber })] = update;

                    })
                    if (localUpdatesTemp?.length > 0) {
                        await setLocalUpdates(localUpdatesTemp);
                    }
                    await setCommunityUpdates(communityUpdatesTemp);
                    toast.success(`Your have successfully loaded updates for this event from Excel. Please check each team's details to ensure your changes were recorded properly. ${localUpdatesTemp?.length > 0 ? "Any inbound changes are stored as Local Updates, which you can push to gatool Cloud on the Setup page." : ""}`)
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
                            {(user["https://gatool.org/roles"].indexOf("user") >= 0) && <td>
                                <span style={{ cursor: "pointer", color: "darkblue" }} onClick={clickRestoreBackup}><input type="file" id="BackupFiles" onChange={handleRestoreBackup} className={"hiddenInput"} /><b><img style={{ float: "left" }} width="30" src="images/excelicon.png" alt="Excel Logo" /> Tap here to restore team data from Excel</b></span>
                            </td>}
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
                            {(user["https://gatool.org/roles"].indexOf("user") >= 0) && <td>
                                <p>You can export your teams data to Excel using the button on the left, and then restore it from backup here. This is handy in low or no network situations, where you may be unable to update changes to gatool Cloud. <i>Note: Be careful if you modify the Excel file and then import it here.</i></p>
                            </td>}
                        </tr>
                    </tbody>
                </Table>
                <Table responsive striped bordered size="sm" className={"teamTable"}>
                    <thead className="thead-default">
                        <tr className={"teamTableHeader"}>
                            <th onClick={() => (teamSort === "teamNumber") ? setTeamSort("-teamNumber") : setTeamSort("teamNumber")}><b>Team #{teamSort === "teamNumber" ? <SortNumericDown /> : ""}{teamSort === "-teamNumber" ? <SortNumericUp /> : ""}</b></th>
                            <th onClick={() => (teamSort === "rank") ? setTeamSort("-rank") : setTeamSort("rank")}> <b>Rank{teamSort === "rank" ? <SortNumericDown /> : ""}{teamSort === "-rank" ? <SortNumericUp /> : ""}</b></th>
                            <th onClick={() => (teamSort === "nameShort") ? setTeamSort("-nameShort") : setTeamSort("nameShort")}><b>Team Name{teamSort === "nameShort" ? <SortAlphaDown /> : ""}{teamSort === "-nameShort" ? <SortAlphaUp /> : ""}</b></th>
                            <th onClick={() => (teamSort === "citySort") ? setTeamSort("-citySort") : setTeamSort("citySort")}><b>City{teamSort === "citySort" ? <SortAlphaDown /> : ""}{teamSort === "-citySort" ? <SortAlphaUp /> : ""}</b></th>
                            <th  ><b>Top Sponsors</b></th>
                            <th onClick={() => (teamSort === "organization") ? setTeamSort("-organization") : setTeamSort("organization")}><b>Organization{teamSort === "organization" ? <SortAlphaDown /> : ""}{teamSort === "-organization" ? <SortAlphaUp /> : ""}</b></th>
                            <th onClick={() => (teamSort === "rookieYear") ? setTeamSort("-rookieYear") : setTeamSort("rookieYear")}><b>Rookie Year{teamSort === "rookieYear" ? <SortNumericDown /> : ""}{teamSort === "-rookieYear" ? <SortNumericUp /> : ""}</b></th>
                            <th onClick={() => (teamSort === "robotNameLocal") ? setTeamSort("-robotNameLocal") : setTeamSort("robotNameLocal")}><b>Robot Name{teamSort === "robotNameLocal" ? <SortAlphaDown /> : ""}{teamSort === "-robotNameLocal" ? <SortAlphaUp /> : ""}</b></th>
                            <th  ><b>Additional Notes</b></th>
                        </tr>
                    </thead>
                    <tbody>
                        {teamList && teamList?.teams && teamListExtended.map((team) => {
                            var cityState = `${team?.city}, ${team?.stateProv}${(team?.country !== "USA") ? ", " + team?.country : ""}`;
                            var avatar = `<img src='https://api.gatool.org/v3/${selectedYear.value}/avatars/team/${team?.teamNumber}/avatar.png' onerror="this.style.display='none'">&nbsp`;
                            var teamNameWithAvatar = team?.nameShortLocal ? team?.nameShortLocal : team?.nameShort;
                            teamNameWithAvatar = avatar + "<br />" + teamNameWithAvatar;

                            return <tr key={`teamDataRow${team?.teamNumber}`}>
                                <td className={`teamNumberButton ${lastVisit[`${team?.teamNumber}`] ? "teamTableButtonHighlight" : ""}${updateWarning(team.lastUpdate) ? " staleTeam" : ""}`} onClick={(e) => handleShow(team, e)} key={"teamData" + team?.teamNumber}><span className={"teamDataNumber"}>{team?.teamNumber}</span><br />{lastVisit[`${team?.teamNumber}`] ? moment(lastVisit[`${team?.teamNumber}`]).fromNow() : updateWarning(team.lastUpdate) ? <b><i>Needs review!</i></b> : "No recent visit."}</td>
                                <td style={rankHighlight(team?.rank ? team?.rank : 100, allianceCount || { "count": 8 })}>{team?.rank}</td>
                                <td dangerouslySetInnerHTML={{ __html: teamNameWithAvatar }} style={updateHighlight(team?.nameShortLocal)}></td>
                                <td style={updateHighlight(team?.cityStateLocal)}>{team?.cityStateLocal ? team?.cityStateLocal : cityState} </td>
                                <td style={updateHighlight(team?.topSponsorsLocal)}>{team?.topSponsorsLocal ? team?.topSponsorsLocal : team?.topSponsors}</td>
                                <td style={updateHighlight(team?.organizationLocal)}>{team?.organizationLocal ? team?.organizationLocal : team?.schoolName}</td>
                                <td>{team?.rookieYear}</td>
                                <td style={updateHighlight(team?.robotNameLocal)}>{team?.robotNameLocal}</td>
                                <td align="left" style={updateHighlight(!_.isEmpty(team?.teamNotes))} className="teamNotes" dangerouslySetInnerHTML={{ __html: team?.teamNotes }}></td>
                            </tr>
                        })}
                    </tbody>
                </Table>
                <Button variant="success" size="sm" onClick={(e) => { clearVisits(false, e) }}>Reset visit times. Use at the start of each day.</Button><br /><br /><br />
            </div></>}
            <Modal centered={true} show={showDownload} onHide={handleCloseDownload}>
                <Modal.Header className={"allianceChoice"} closeVariant={"white"} closeButton>
                    <Modal.Title >Download Team Info Sheets</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>You are about to download a Word Docx which contains all of the team data we know about the teams. If you have loaded team data from gatool cloud, or if you have made local changes, those changes will be reflected on the sheets. <br /> <br /><b>If you would like us to personalize the sheets with your names as the Game Announcers, please enter them below, separated by commas:</b></p>
                    <Form>
                        <Form.Control type="text" onChange={(e) => updateGaForm(e.target.value)} />
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="success" size="sm" onClick={handleSubmitDownload}>Download Info Sheets</Button>
                </Modal.Footer>
            </Modal>

            {updateTeam && <Modal centered={true} fullscreen={true} show={show} size="lg" onHide={handleClose}>
                <Modal.Header className={_.find(localUpdates, { "teamNumber": updateTeam.teamNumber }) ? "redAlliance" : "allianceChoice"} closeVariant={"white"} closeButton>
                    <Modal.Title >{_.find(localUpdates, { "teamNumber": updateTeam.teamNumber }) ? <i> You have a locally saved update for Team {updateTeam.teamNumber}. Please upload to gatool Cloud{!isOnline ? <> when you are online again.</> : <>.</>}</i> : `Editing Team ${updateTeam.teamNumber}'s Details`}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Use this form to update team information for <b>Team {updateTeam.teamNumber}.</b> Editable fields are shown below. Your changes will be stored locally on your machine and should not be erased if you close your browser. We do recommend using the Save to Home Screen feature on Android and iOS, and the Save App feature from Chrome on desktop, if you are offline.</p>
                    <p>Tap on each item to update its value. Tap <b>DONE</b> when you're finished editing, or browse to another tab to cancel editing. Items <span className={"teamTableHighlight"}><b>highlighted in green</b></span> have local changes. <b>Motto</b> and <b>Notes</b> do not exist in TIMS, so they are always local. To reset any value to the TIMS value, simply delete it here and tap DONE.</p>
                    <p>You can upload this form to gatool Cloud, or keep the values locally for later upload, using the buttons at the bottom of this screen.</p>
                    <p onClick={(e) => handleHistory(updateTeam, e)}><b><CalendarPlusFill /> Tap here to see prior team data updates.</b></p>
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
                        <Form.Group controlId="cityState">
                            <Form.Label className={"formLabel"}><b>City/State ({`${updateTeam?.city}, ${updateTeam?.stateProv}${(updateTeam?.country !== "USA") ? ", " + updateTeam?.country : ""}`}) in TIMS)</b></Form.Label>
                            <Form.Control className={updateTeam.cityStateLocal ? "formHighlight" : formValue.cityStateLocal ? "formHighlight" : ""} type="text" placeholder={`${updateTeam?.city}, ${updateTeam?.stateProv} ${(updateTeam?.country !== "USA") ? " " + updateTeam?.country : ""}`} defaultValue={updateTeam.cityStateLocal ? updateTeam.cityStateLocal : `${updateTeam?.city}, ${updateTeam?.stateProv}${(updateTeam?.country !== "USA") ? ", " + updateTeam?.country : ""}`} onChange={(e) => updateForm("cityStateLocal", e.target.value)} />
                        </Form.Group>
                        <Form.Group controlId="sayNumber">
                            <Form.Label className={"formLabel"}><b>How to pronounce the team number (some teams are particular)</b></Form.Label>
                            <Form.Control className={updateTeam.sayNumber ? "formHighlight" : formValue.sayNumber ? "formHighlight" : ""} type="text" placeholder={updateTeam.sayNumber} defaultValue={updateTeam.sayNumber} onChange={(e) => updateForm("sayNumber", e.target.value)} />
                        </Form.Group>
                        <Form.Group controlId="robotName">
                            <InputGroup>
                                <Form.Label className={"formLabel"}><b>Robot Name ({updateTeam.robotName ? updateTeam.robotName : "No robot name"}) in TIMS</b> </Form.Label>
                                <Form.Text><Form.Check className={"robotNameCheckbox"} type="switch" id="showRobotName" label="Show robot name" defaultChecked={updateTeam?.showRobotName ? updateTeam?.showRobotName : true} onChange={(e) => updateForm("showRobotName", e.target.checked)} /></Form.Text>
                            </InputGroup>
                            <Form.Control className={updateTeam.robotNameLocal ? "formHighlight" : formValue.robotNameLocal ? "formHighlight" : ""} type="text" placeholder={updateTeam.robotName} defaultValue={updateTeam.robotNameLocal ? updateTeam.robotNameLocal : updateTeam.robotName} onChange={(e) => updateForm("robotNameLocal", e.target.value)} />
                        </Form.Group>
                        <Form.Group controlId="teamMotto">
                            <Form.Label className={"formLabel"}><b>Team Motto (Team Mottoes do not come from <i>FIRST</i>)</b></Form.Label>
                            <Form.Control className={updateTeam.teamMottoLocal ? "formHighlight" : formValue.teamMottoLocal ? "formHighlight" : ""} type="text" placeholder={updateTeam.teamMottoLocal} defaultValue={updateTeam.teamMottoLocal} onChange={(e) => updateForm("teamMottoLocal", e.target.value)} />
                        </Form.Group>
                        <Form.Group controlId="teamYearsNoCompete">
                            <Form.Label className={"formLabel"}><b>Number of seasons NOT competing with FIRST (will be used in calculating Nth season)</b></Form.Label>
                            <Form.Control className={updateTeam.teamYearsNoCompeteLocal ? "formHighlight" : formValue.teamYearsNoCompeteLocal ? "formHighlight" : ""} type="number" placeholder={"Enter the count of years rather than the actual years: i.e. 5, not 2004-2007"} defaultValue={updateTeam.teamYearsNoCompeteLocal} onChange={(e) => updateForm("teamYearsNoCompeteLocal", e.target.value)} />
                        </Form.Group>
                        <Form.Group controlId="awardsText">
                            <Form.Label className={"formLabel"}>
                                <b>Award/Alliance Selection text</b> (editable portion in <b><i>bold and italic</i></b> below):<br />
                                Team {updateTeam?.teamNumber} {updateTeam?.updates?.nameShortLocal ? updateTeam.updates.nameShortLocal : updateTeam?.nameShort}<br />
                                is <b><i>{formValue?.awardsTextLocal ? formValue?.awardsTextLocal : updateTeam?.awardsTextLocal ? updateTeam?.awardsTextLocal : <>{originalAndSustaining.includes(String(updateTeam?.teamNumber)) ? "an Original and Sustaining Team " : ""}from<br />
                                    {updateTeam?.updates?.organizationLocal ? updateTeam?.updates?.organizationLocal : updateTeam?.organization}<br />
                                    in</>}</i></b> {updateTeam?.updates?.cityStateLocal ? updateTeam?.updates?.cityStateLocal : `${updateTeam?.city}, ${updateTeam?.stateProv}`}{updateTeam?.country !== "USA" ? `, ${updateTeam?.country}` : ""}<br />
                            </Form.Label>
                            <Form.Control
                                className={updateTeam?.awardsTextLocal ? "formHighlight" : ""}
                                type="text"
                                placeholder={`${originalAndSustaining.includes(String(updateTeam?.teamNumber)) ? "an Original and Sustaining Team " : ""}from ${updateTeam?.updates?.organizationLocal ? updateTeam?.updates?.organizationLocal : updateTeam?.organization} in`}
                                defaultValue={updateTeam?.awardsTextLocal ? updateTeam?.awardsTextLocal : `${originalAndSustaining.includes(String(updateTeam?.teamNumber)) ? "an Original and Sustaining Team " : ""}from ${updateTeam?.updates?.organizationLocal ? updateTeam?.updates?.organizationLocal : updateTeam?.organization} in`}
                                onChange={(e) => updateForm("awardsTextLocal", e.target.value)} />
                        </Form.Group>
                        <Form.Group controlId="teamNotesLocal">
                            <Form.Label className={"formLabel"}><b>Team Notes for Announce and Play-by-Play Screens (These notes are local notes and do not come from <i>FIRST</i>)</b></Form.Label>
                            <ReactQuill theme="snow" modules={modules2} formats={formats2} value={updateTeam.teamNotesLocal} placeholder={"Enter some new notes you would like to appear on the Announce Screen"} onChange={(e) => updateForm("teamNotesLocal", e)} ></ReactQuill>
                        </Form.Group>
                        <Form.Group controlId="teamNotes">
                            <Form.Label className={"formLabel"}><b>Team Notes for the Team Data Screen (These notes are local notes and do not come from <i>FIRST</i>)</b></Form.Label>
                            <ReactQuill theme="snow" modules={modules} formats={formats} value={updateTeam.teamNotes} placeholder={"Enter some new notes you would like to appear on the Team Data Screen"} onChange={(e) => updateForm("teamNotes", e)}></ReactQuill>
                        </Form.Group>
                        <Form.Group controlId="topSponsors">
                            <Form.Label className={"formLabel"}><b>Top Sponsors (Enter no more than 5 top sponsors from the full sponsor list below). These will appear under the team name on the Announce Screen. Delete the text to reset to TIMS value.</b></Form.Label>
                            <Form.Control className={updateTeam.topSponsorsLocal ? "formHighlight" : formValue.topSponsorsLocal ? "formHighlight" : ""} type="text" placeholder={updateTeam?.topSponsors} defaultValue={updateTeam.topSponsorsLocal ? updateTeam.topSponsorsLocal : updateTeam?.topSponsors} onChange={(e) => updateForm("topSponsorsLocal", e.target.value)} />
                        </Form.Group>
                        <Form.Group controlId="sponsors">
                            <Form.Label className={"formLabel"}><b>Full list of Sponsors (For reference only. This field is not editable, does not appear in the UI, and any changes here will not be saved.)</b></Form.Label>
                            <Form.Control type="text" placeholder={updateTeam?.sponsors} defaultValue={updateTeam?.sponsors} disabled />
                        </Form.Group>
                        <br />
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="warning" size="sm" onClick={(e) => { clearVisits(true, e) }}>Reset <br />visit times</Button>
                    <Button variant="secondary" size="sm" onClick={handleClose}>Close without<br />saving changes</Button>
                    <Button variant="info" size="sm" onClick={handleTrack}>Record visit without<br />saving changes</Button>
                    <Button variant="primary" size="sm" onClick={(e) => { handleSubmit("save", e) }}>Submit changes<br />but only keep them locally</Button>
                    <Button variant="success" size="sm" disabled={!isOnline} onClick={(e) => { handleSubmit("update", e) }}>Submit changes <br />and upload to gatool Cloud</Button>
                    <br />
                </Modal.Footer>
            </Modal>}

            <Modal fullscreen={true} centered={true} show={showHistory} onHide={handleCloseHistory}>
                <Modal.Header className={"allianceChoice"} closeVariant={"white"} closeButton>
                    <Modal.Title >Team Update History</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>The table below shows the recorded values for each of the customizable fields we record in gatool Cloud.</p>
                    <Table bordered striped size="sm">
                        <thead><tr>
                            <td>Date modified</td>
                            <td>Team Name</td>
                            <td>Org Name</td>
                            <td>Robot Name</td>
                            <td>Motto</td>
                            <td>City/State</td>
                            <td>Top Sponsors</td>
                            <td>Awards text</td>
                            <td>Team Table Notes</td>
                            <td>Announce Screen Notes</td>
                            <td>Sponsors</td>
                            <td>How to pronounce #</td>
                            {(user["https://gatool.org/roles"].indexOf("admin") >= 0) && <td>
                                Source</td>}
                            <td></td>
                        </tr>
                        </thead>
                        <tbody>
                            <tr key={updateTeam?.lastUpdate}>
                                <td>{moment(updateTeam?.lastUpdate).format("MMM Do YYYY, " + timeFormat.value)}</td>
                                <td>{updateTeam?.nameShortLocal}</td>
                                <td>{updateTeam?.organizationLocal}</td>
                                <td>{updateTeam?.robotNameLocal}</td>
                                <td>{updateTeam?.teamMottoLocal}</td>
                                <td>{updateTeam?.cityStateLocal}</td>
                                <td>{updateTeam?.topSponsorsLocal}</td>
                                <td>{updateTeam?.awardsTextLocal}</td>
                                <td>{updateTeam?.teamNotes}</td>
                                <td>{updateTeam?.teamNotesLocal}</td>
                                <td>{updateTeam?.sponsorsLocal}</td>
                                <td><td>{updateTeam?.sayNumber}</td></td>
                                {(user["https://gatool.org/roles"].indexOf("admin") >= 0) && <td>
                                    {updateTeam?.source}</td>}
                                <td>Current Value</td>
                            </tr>
                            {teamHistory && teamHistory.map((team, index) => {
                                return <tr key={`history${index}`}>
                                    <td>{moment(team?.lastUpdate).format("MMM Do YYYY, " + timeFormat.value)}</td>
                                    <td>{team?.nameShortLocal}</td>
                                    <td>{team?.organizationLocal}</td>
                                    <td>{team?.robotNameLocal}</td>
                                    <td>{team?.teamMottoLocal}</td>
                                    <td>{team?.cityStateLocal}</td>
                                    <td>{team?.topSponsorsLocal}</td>
                                    <td>{team?.awardsTextLocal}</td>
                                    <td>{team?.teamNotes}</td>
                                    <td>{team?.teamNotesLocal}</td>
                                    <td>{team?.sponsordLocal}</td>
                                    <td>{team?.sayNumber}</td>
                                    {(user["https://gatool.org/roles"].indexOf("admin") >= 0) && <td>
                                        {team?.source}</td>}
                                    <td><Button onClick={() => { handleRestoreData({ "team": updateTeam, "update": team }) }}>Restore</Button></td>
                                </tr>
                            })}</tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="success" size="sm" onClick={handleCloseHistory}>close</Button>
                </Modal.Footer>
            </Modal>

        </Container>
    )
}

export default TeamDataPage;