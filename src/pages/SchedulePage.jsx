import { Alert, Col, Container, Row, Table } from "react-bootstrap";
import moment from 'moment';
import { utils, read } from "xlsx";
import { toast } from "react-toastify";
import _ from "lodash";

function SchedulePage({ selectedEvent, playoffSchedule, qualSchedule, practiceSchedule, setPracticeSchedule, offlinePlayoffSchedule, setOfflinePlayoffSchedule, getTeamList, loadEvent, practiceFileUploaded, setPracticeFileUploaded }) {

    // This function clicks the hidden file upload button
    function clickLoadPractice() {
        document.getElementById("BackupFiles").click();
    }

    // This function removes the Practice Schedule
    function clickRemovePractice() {
        setPracticeSchedule(null);
        setPracticeFileUploaded(false);
        setOfflinePlayoffSchedule(null);
        loadEvent();
    }

    // This function clicks the hidden file upload button
    function clickLoadOfflinePlayoffs() {
        document.getElementById("LoadOfflinePlayoffs").click();
    }

    /** 
     * This function clears the file input by removing and recreating the file input button
     *
     * @function clearFileInput
     * @param id text The ID to delete and recreate
    */
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

    /** 
     * This function reads a schedule array and determines the participating teams from the schedule.
     * It then creates a team list from the unique teams in the schedule.
     * @function addTeamsToTeamList
     * @param formattedSchedule the schedule to parse
    */
    function addTeamsToTeamList(formattedSchedule) {
        var tempTeamList = [];
        _.forEach(formattedSchedule.schedule, function (row) {
            //do something
            _.forEach(row.teams, function (team) {

                if (_.findIndex(tempTeamList, team.teamNumber) < 0) {
                    tempTeamList.push(team.teamNumber);
                };
            })

        });
        tempTeamList = _.uniq(tempTeamList);
        //console.log(tempTeamList);
        getTeamList(tempTeamList);
    }

    /**
     * This function imports a Practice Schedule from Excel.
     * @param e the file upload button event
     */

    function handlePracticeFiles(e) {
        var forPlayoffs = e.target.id === "BackupFiles" ? false : true;
        var files = e.target.files;
        var f = files[0];
        var reader = new FileReader();
        reader.onload = function (e) {
            // @ts-ignore
            var data = new Uint8Array(e.target.result);
            var workbook;
            workbook = read(data, { type: 'array' });
            var worksheet = workbook.Sheets[workbook.SheetNames[0]];
            var schedule = utils.sheet_to_json(worksheet, { range: 4 });;
            var formattedSchedule = {};
            var matchNumber = 0;
            var errorMatches = [];
            var errorMessage = "";
            var innerSchedule = [];
            const basicMatch = {
                Time: "",
                Description: "",
                "Blue 1": "",
                "Blue 2": "",
                "Blue 3": "",
                "Red 1": "",
                "Red 2": "",
                "Red 3": "",
            }
            const matchKeys = ["Red 1", "Red 2", "Red 3", "Blue 1", "Blue 2", "Blue 3"];
            schedule = schedule.map((match) => {
                match = _.merge(_.cloneDeep(basicMatch), match)
                var scheduleKeys = Object.keys(match);
                scheduleKeys.forEach((key) => {
                    match[key] = match[key].toString();
                })
                // detect matches with missing teams
                if (match["Description"]?.includes("Practice")) {
                    for (var i = 0; i < matchKeys?.length; i++) {
                        if (match[matchKeys[i]] === "") {
                            errorMatches.push(match);
                            break;
                        }
                    }
                }
                return match;
            });

            if (errorMatches?.length > 0) {
                errorMessage = "Your Practice Schedule has missing data from the following match" + ((errorMatches?.length > 1) ? "es:" : ":") + "</br>";
                errorMatches.forEach((match) => {
                    errorMessage += match["Description"] + "</br>"
                })
                errorMessage += "Please adjust the match details and reload.</br>"
                toast.error(errorMessage);
            } else {
                innerSchedule = schedule.map((match) => {
                    var matchTime = moment(match?.Time, "ddd h:mm A").format();
                    if (match["Red 1"]) {
                        matchNumber++;
                        var tempRow = {
                            "description": match?.Description,
                            "tournamentLevel": "Practice",
                            "matchNumber": matchNumber,
                            "startTime": matchTime,
                            "actualStartTime": null,
                            "postResultTime": null,
                            "scoreRedFinal": null,
                            "scoreRedFoul": null,
                            "scoreRedAuto": null,
                            "scoreBlueFinal": null,
                            "scoreBlueFoul": null,
                            "scoreBlueAuto": null,
                            "teams": [{
                                "teamNumber": match["Red 1"] !== "" ? parseInt(removeSurrogate(match["Red 1"])) : null,
                                "station": "Red1",
                                "surrogate": (match["Red 1"].toString().includes("*")) ? !0 : !1,
                                "dq": !1
                            }, {
                                "teamNumber": match["Red 2"] !== "" ? parseInt(removeSurrogate(match["Red 2"])) : null,
                                "station": "Red2",
                                "surrogate": (match["Red 2"].toString().includes("*")) ? !0 : !1,
                                "dq": !1
                            }, {
                                "teamNumber": match["Red 3"] !== "" ? parseInt(removeSurrogate(match["Red 3"])) : null,
                                "station": "Red3",
                                "surrogate": (match["Red 3"].toString().includes("*")) ? !0 : !1,
                                "dq": !1
                            }, {
                                "teamNumber": match["Blue 1"] !== "" ? parseInt(removeSurrogate(match["Blue 1"])) : null,
                                "station": "Blue1",
                                "surrogate": (match["Blue 1"].toString().includes("*")) ? !0 : !1,
                                "dq": !1
                            }, {
                                "teamNumber": match["Blue 2"] !== "" ? parseInt(removeSurrogate(match["Blue 2"])) : null,
                                "station": "Blue2",
                                "surrogate": (match["Blue 2"].toString().includes("*")) ? !0 : !1,
                                "dq": !1
                            }, {
                                "teamNumber": match["Blue 3"] !== "" ? parseInt(removeSurrogate(match["Blue 3"])) : null,
                                "station": "Blue3",
                                "surrogate": (match["Blue 3"].toString().includes("*")) ? !0 : !1,
                                "dq": !1
                            }]
                        };
                    }
                    return (tempRow);
                })

                formattedSchedule.schedule = _.filter(innerSchedule, "description");
                !forPlayoffs ? setPracticeSchedule(formattedSchedule) : setOfflinePlayoffSchedule(formattedSchedule);
                addTeamsToTeamList(formattedSchedule);
                toast.success(`Your have successfully loaded your ${selectedEvent?.value?.code.includes("OFFLINE") ? "Offline" : "Practice"} Schedule.`)
                if (!selectedEvent?.value?.code.includes("OFFLINE")) {
                    setPracticeFileUploaded(true);
                }
                if (!forPlayoffs) {
                    clearFileInput("BackupFiles");
                    document.getElementById("BackupFiles").addEventListener('change', handlePracticeFiles);
                } else {
                    clearFileInput("LoadOfflinePlayoffs");
                    document.getElementById("LoadOfflinePlayoffs").addEventListener('change', handlePracticeFiles);
                }

            }
        };
        reader.readAsArrayBuffer(f);


    }

    function removeSurrogate(teamNumber) {
        teamNumber = teamNumber.replace("*", "");
        return teamNumber;
    }

    return (
        <Container fluid>
            {!selectedEvent && <div>
                <Alert variant="warning" >You need to select an event before you can see anything here.</Alert>
            </div>}
            {selectedEvent && (!qualSchedule || qualSchedule?.schedule?.length === 0 || qualSchedule?.schedule?.schedule?.length === 0) && (!playoffSchedule || playoffSchedule?.schedule?.length === 0 || playoffSchedule?.schedule?.schedule?.length === 0) && <div>
                <Alert variant="warning" >
                    {(!practiceSchedule || practiceSchedule?.schedule?.length === 0 || practiceSchedule?.schedule?.schedule?.length === 0) && !practiceFileUploaded && <>
                        <div><img src="loadingIcon.gif" alt="Loading data..." /></div>
                        <div>Awaiting schedule for {selectedEvent.label}<br /><br /></div>
                        <Container fluid>
                            <Row>
                                <Col xs={2}></Col>
                                <Col xs={1}><input type="file" id="BackupFiles" onChange={handlePracticeFiles} className={"hiddenInput"} /><img style={{ float: "left" }} width="50" src="images/excelicon.png" alt="Excel Logo" /></Col>
                                <Col xs={7} className={"leftTable"} style={{ cursor: "pointer", color: "darkblue" }} onClick={clickLoadPractice}>
                                    {selectedEvent?.value?.code.includes("OFFLINE") && <b>You can upload a Qualification Match Schedule for your Offline event. You will need to ask your Scorekeeper to export a Schedule Report in Excel format, which you can upload here. We will determine the team list from the Qualification Schedule.<br />Tap here to upload a Qualification Schedule.</b>}
                                    {!selectedEvent?.value?.code.includes("OFFLINE") && <b>You can upload a Practice Schedule while you wait for the Quals Schedule to post. You will need to ask your Scorekeeper to export a Schedule Report in Excel format, which you can upload here.<br />Tap here to upload a Practice Schedule.</b>}
                                </Col><Col xs={2}></Col>
                            </Row>
                        </Container>
                    </>}
                    {practiceSchedule?.schedule?.length > 0 && <>
                        <Container fluid>
                            <Row >
                                <Col xs={2}></Col>
                                {practiceFileUploaded && <>
                                    <Col xs={1}><input type="file" id="LoadOfflinePlayoffs" onChange={handlePracticeFiles} className={"hiddenInput"} /><img style={{ float: "left" }} width="50" src="images/excelicon.png" alt="Excel Logo" /></Col>
                                    <Col xs={selectedEvent?.value?.code.includes("OFFLINE") ? 4 : 7} className={"leftTable"} style={{ cursor: "pointer", color: "darkblue" }} onClick={clickRemovePractice}>
                                        {selectedEvent?.value?.code.includes("OFFLINE") && <b>You have uploaded an Offline Schedule.<br />Tap here to remove it. You can add a playoff schedule, when one becomes available.</b>}
                                        {!selectedEvent?.value?.code.includes("OFFLINE") && <b>You have uploaded a Practice Schedule.<br />Tap here to remove it. Know that we will automatically remove it when we get a Qualification Matches Schedule.</b>}
                                    </Col>
                                </>}
                                {!practiceFileUploaded &&
                                    <Col xs={8}><b>Practice Matches</b><br />Your event has not yet posted a Qualification Match schedule. You can use this practice match schedule to help observe teams and practice for the tournament. Please do not announce matches during the Practice Match period.</Col>}
                                {selectedEvent?.value?.code.includes("OFFLINE") &&
                                    <Col xs={3} className={"leftTable"} style={{ cursor: "pointer", color: "darkblue" }} onClick={clickLoadOfflinePlayoffs}>
                                        <b>You can now load your Offline Playoff Schedule. You may need to do this after each phase of the playoffs.<br />Tap here to remove it and replace it, as necessary.</b>
                                    </Col>}
                                <Col xs={2}></Col>
                            </Row>
                        </Container>
                    </>}
                </Alert>
            </div>}
            {selectedEvent && (practiceSchedule?.schedule?.length > 0 || qualSchedule?.schedule?.length > 0 || (qualSchedule?.schedule?.length === 0 && playoffSchedule?.schedule?.length > 0) || (qualSchedule?.schedule?.schedule?.length === 0 && playoffSchedule?.schedule?.length > 0)) &&
                <div>
                    <h4>{selectedEvent.label}</h4>
                    <Table responsive striped bordered size="sm">
                        <thead className="thead-default">
                            <tr>
                                <th className="col2"><b>Time</b></th>
                                <th className="col2"><b>Description</b></th>
                                <th className="col1"><b>Match Number</b></th>
                                <th className="col1"><b>Score</b></th>
                                <th className="col1"><b>Station 1</b></th>
                                <th className="col1"><b>Station 2</b></th>
                                <th className="col1"><b>Station 3</b></th>
                            </tr>
                        </thead>
                        <tbody>
                            {practiceSchedule && practiceSchedule?.schedule?.length > 0 && practiceSchedule?.schedule.map((match) => {
                                let redStyle = "red";
                                let blueStyle = "blue";
                                return (<tr key={"practiceSchedule" + match?.matchNumber} className="centerTable">
                                    <td>{match?.actualStartTime ? "Actual:" : "Scheduled:"}<br /> {match?.actualStartTime ? moment(match.actualStartTime).format('dd hh:mm A') : moment(match?.startTime).format('dd hh:mm A')}</td>
                                    <td>{match?.description}</td>
                                    <td>{match?.matchNumber}</td>
                                    <td><span className={redStyle}>{match?.scoreRedFinal}</span><br /><span className={blueStyle}>{match?.scoreBlueFinal}</span></td>
                                    <td><span className={redStyle}>{match?.teams[0]?.teamNumber}</span><br /><span className={blueStyle}>{match?.teams[3]?.teamNumber}</span></td>
                                    <td><span className={redStyle}>{match?.teams[1]?.teamNumber}</span><br /><span className={blueStyle}>{match?.teams[4]?.teamNumber}</span></td>
                                    <td><span className={redStyle}>{match?.teams[2]?.teamNumber}</span><br /><span className={blueStyle}>{match?.teams[5]?.teamNumber}</span></td>
                                </tr>
                                )
                            })}
                            {offlinePlayoffSchedule && offlinePlayoffSchedule?.schedule?.length > 0 && offlinePlayoffSchedule?.schedule.map((match) => {
                                let redStyle = "red";
                                let blueStyle = "blue";
                                return (<tr key={"practiceSchedule" + match?.matchNumber} className="centerTable">
                                    <td>{match?.actualStartTime ? "Actual:" : "Scheduled:"}<br /> {match?.actualStartTime ? moment(match.actualStartTime).format('dd hh:mm A') : moment(match?.startTime).format('dd hh:mm A')}</td>
                                    <td>{match?.description}</td>
                                    <td>{match?.matchNumber}</td>
                                    <td><span className={redStyle}>{match?.scoreRedFinal}</span><br /><span className={blueStyle}>{match?.scoreBlueFinal}</span></td>
                                    <td><span className={redStyle}>{match?.teams[0]?.teamNumber}</span><br /><span className={blueStyle}>{match?.teams[3]?.teamNumber}</span></td>
                                    <td><span className={redStyle}>{match?.teams[1]?.teamNumber}</span><br /><span className={blueStyle}>{match?.teams[4]?.teamNumber}</span></td>
                                    <td><span className={redStyle}>{match?.teams[2]?.teamNumber}</span><br /><span className={blueStyle}>{match?.teams[5]?.teamNumber}</span></td>
                                </tr>
                                )
                            })}
                            {qualSchedule?.schedule?.length > 0 && qualSchedule?.schedule?.map((match) => {
                                let redStyle = "red";
                                let blueStyle = "blue";
                                let winnerStyle = "tie";
                                if (Number(match.scoreRedFinal) > Number(match.scoreBlueFinal)) {
                                    redStyle += " bold";
                                    winnerStyle = "red";
                                } else if (Number(match.scoreBlueFinal) > Number(match.scoreRedFinal)) {
                                    blueStyle += " bold";
                                    winnerStyle = "blue";
                                }

                                return (<tr key={"qualSchedule" + match?.matchNumber} className="centerTable">
                                    <td>{match?.actualStartTime ? "Actual:" : "Scheduled:"}<br /> {match?.actualStartTime ? moment(match?.actualStartTime).format('dd hh:mm A') : moment(match?.startTime).format('dd hh:mm A')}</td>
                                    <td>{match?.description}</td>
                                    <td>{match?.matchNumber}</td>
                                    <td className={match?.scoreRedFinal ? `scheduleTable${winnerStyle}` : ""}><span className={redStyle}>{match?.scoreRedFinal}</span><br /><span className={blueStyle}>{match?.scoreBlueFinal}</span></td>
                                    <td><span className={redStyle}>{match?.teams[0]?.teamNumber}</span><br /><span className={blueStyle}>{match?.teams[3]?.teamNumber}</span></td>
                                    <td><span className={redStyle}>{match?.teams[1]?.teamNumber}</span><br /><span className={blueStyle}>{match?.teams[4]?.teamNumber}</span></td>
                                    <td><span className={redStyle}>{match?.teams[2]?.teamNumber}</span><br /><span className={blueStyle}>{match?.teams[5]?.teamNumber}</span></td>
                                </tr>
                                )
                            })
                            }
                            {(playoffSchedule && playoffSchedule?.schedule?.length > 0) && playoffSchedule.schedule.map((match) => {
                                let redStyle = "red";
                                let blueStyle = "blue";
                                let winnerStyle = "tie";
                                let qualMatchCount = qualSchedule?.schedule?.length;
                                if (Number(match.scoreRedFinal) > Number(match.scoreBlueFinal)) {
                                    redStyle += " bold";
                                    winnerStyle = "red";
                                } else if (Number(match.scoreBlueFinal) > Number(match.scoreRedFinal)) {
                                    blueStyle += " bold";
                                    winnerStyle = "blue";
                                }

                                return (<tr key={"playoffSchedule" + match?.matchNumber} className="centerTable">
                                    <td>{match?.actualStartTime ? "Actual:" : "Scheduled:"}<br /> {match?.actualStartTime ? moment(match?.actualStartTime).format('dd hh:mm A') : moment(match?.startTime).format('dd hh:mm A')}</td>
                                    <td>{match?.description}</td>
                                    <td>{match?.matchNumber + (qualMatchCount || 0)}</td>
                                    <td className={match?.scoreRedFinal ? `scheduleTable${winnerStyle}` : ""}><span className={redStyle}>{match?.scoreRedFinal}</span><br /><span className={blueStyle}>{match?.scoreBlueFinal}</span></td>
                                    <td><span className={redStyle}>{match?.teams[0]?.teamNumber}</span><br /><span className={blueStyle}>{match?.teams[3]?.teamNumber}</span></td>
                                    <td><span className={redStyle}>{match?.teams[1]?.teamNumber}</span><br /><span className={blueStyle}>{match?.teams[4]?.teamNumber}</span></td>
                                    <td><span className={redStyle}>{match?.teams[2]?.teamNumber}</span><br /><span className={blueStyle}>{match?.teams[5]?.teamNumber}</span></td>
                                </tr>
                                )
                            })}
                            {(!qualSchedule || qualSchedule?.schedule?.length === 0 || qualSchedule?.schedule?.schedule?.length === 0) &&
                                <tr>
                                    <td colSpan={7}>No Qualification match schedule available yet.</td>
                                </tr>}
                            {!offlinePlayoffSchedule && (playoffSchedule?.schedule?.length === 0 || playoffSchedule?.schedule?.schedule?.length === 0 )&&
                                <tr>
                                    <td colSpan={7}>No Playoff match schedule available yet.</td>
                                </tr>}
                        </tbody>
                    </Table>
                </div>}
        </Container>
    )
}

export default SchedulePage;