import { Alert, Col, Container, Row, Table } from "react-bootstrap";
import moment from 'moment';
import { utils, read } from "xlsx";
import { toast } from "react-toastify";
import _ from "lodash";

function SchedulePage({ selectedEvent, playoffSchedule, qualSchedule, practiceSchedule, setPracticeSchedule }) {

    // This function clicks the hidden file upload button
    function clickLoadPractice() {
        document.getElementById("BackupFiles").click();
    }

    function clickRemovePractice() {
        setPracticeSchedule(null);
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

    // This function imports a Practice Schedule from Excel.
    function handlePracticeFiles(e) {
        var files = e.target.files;
        var f = files[0];
        var reader = new FileReader();
        reader.onload = function (e) {
            // @ts-ignore
            var data = new Uint8Array(e.target.result);
            var workbook;
            workbook = read(data, { type: 'array' });
            var worksheet = workbook.Sheets[workbook.SheetNames[0]];
            var schedule = utils.sheet_to_json(worksheet, { range: 4 });
            var formattedSchedule = {};
            var matchNumber = 0;
            var errorMatches = [];
            var errorMessage = "";
            var innerSchedule = [];
            schedule.forEach((match) => {
                var scheduleKeys = Object.keys(match);
                scheduleKeys.forEach((key) => {
                    match[key] = match[key].toString();
                })

                if (scheduleKeys.length < 8) {
                    if (match["Description"].includes("Practice")) {
                        errorMatches.push(match);
                    }
                }
            })

            if (errorMatches.length > 0) {
                errorMessage = "Your Practice Schedule has missing data from the following match" + ((errorMatches.length > 1) ? "es:" : ":") + "</br>";
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
                                "teamNumber": parseInt(removeSurrogate(match["Red 1"])),
                                "station": "Red1",
                                "surrogate": (match["Red 1"].toString().includes("*")) ? !0 : !1,
                                "dq": !1
                            }, {
                                "teamNumber": parseInt(removeSurrogate(match["Red 2"])),
                                "station": "Red2",
                                "surrogate": (match["Red 2"].toString().includes("*")) ? !0 : !1,
                                "dq": !1
                            }, {
                                "teamNumber": parseInt(removeSurrogate(match["Red 3"])),
                                "station": "Red3",
                                "surrogate": (match["Red 3"].toString().includes("*")) ? !0 : !1,
                                "dq": !1
                            }, {
                                "teamNumber": parseInt(removeSurrogate(match["Blue 1"])),
                                "station": "Blue1",
                                "surrogate": (match["Blue 1"].toString().includes("*")) ? !0 : !1,
                                "dq": !1
                            }, {
                                "teamNumber": parseInt(removeSurrogate(match["Blue 2"])),
                                "station": "Blue2",
                                "surrogate": (match["Blue 2"].toString().includes("*")) ? !0 : !1,
                                "dq": !1
                            }, {
                                "teamNumber": parseInt(removeSurrogate(match["Blue 3"])),
                                "station": "Blue3",
                                "surrogate": (match["Blue 3"].toString().includes("*")) ? !0 : !1,
                                "dq": !1
                            }]
                        };
                    }
                    return (tempRow);
                })

                formattedSchedule.schedule = _.filter(innerSchedule,"description");
                setPracticeSchedule(formattedSchedule);
                toast.success(`Your have successfully loaded your Practice Schedule.`)
                clearFileInput("BackupFiles");
                document.getElementById("BackupFiles").addEventListener('change', handlePracticeFiles);
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
            {selectedEvent && (!qualSchedule || qualSchedule?.schedule.length === 0) && <div>
                <Alert variant="warning" ><div><img src="loadingIcon.gif" alt="Loading data..." /></div><div>Awaiting schedule for {selectedEvent.label}<br /><br /></div>
                    {!practiceSchedule && <>
                        <Container fluid>
                            <Row style={{ cursor: "pointer", color: "darkblue" }} onClick={clickLoadPractice}>
                                <Col xs={2}></Col>
                                <Col xs={1}><input type="file" id="BackupFiles" onChange={handlePracticeFiles} className={"hiddenInput"} /><img style={{ float: "left" }} width="50" src="images/excelicon.png" alt="Excel Logo" /></Col>
                                <Col xs={7} className={"leftTable"}><b>You can upload a Practice Schedule while you wait for the Quals Schedule to post. You will need to ask your Scorekeeper to export a Schedule Report in Excel format, which you can upload here.<br />Tap here to upload a Practice Schedule.</b>
                                </Col><Col xs={2}></Col>
                            </Row>
                        </Container>
                    </>}
                    {practiceSchedule && <>
                        <Container fluid>
                            <Row style={{ cursor: "pointer", color: "darkblue" }} onClick={clickRemovePractice}>
                                <Col xs={2}></Col>
                                <Col xs={1}><img style={{ float: "left" }} width="50" src="images/excelicon.png" alt="Excel Logo" /></Col>
                                <Col xs={7} className={"leftTable"}><b>You have uploaded a Practice Schedule.<br />Tap here to remove it. Know that we will automatically remove it when we get a Qualification Matches Schedule.</b>
                                </Col><Col xs={2}></Col>
                            </Row>
                        </Container>
                    </>}
                </Alert>
            </div>}
            {selectedEvent && (practiceSchedule?.schedule.length > 0 || qualSchedule?.schedule.length > 0) &&
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
                            {practiceSchedule && practiceSchedule?.schedule.length > 0 && practiceSchedule?.schedule.map((match) => {
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
                            {qualSchedule && qualSchedule?.schedule?.map((match) => {
                                let redStyle = "red";
                                let blueStyle = "blue";
                                if (Number(match.scoreRedFinal) > Number(match.scoreBlueFinal)) {
                                    redStyle += " bold"
                                } else if (Number(match.scoreBlueFinal) > Number(match.scoreRedFinal)) {
                                    blueStyle += " bold"
                                }

                                return (<tr key={"qualSchedule" + match.matchNumber} className="centerTable">
                                    <td>{match?.actualStartTime ? "Actual:" : "Scheduled:"}<br /> {match?.actualStartTime ? moment(match?.actualStartTime).format('dd hh:mm A') : moment(match?.startTime).format('dd hh:mm A')}</td>
                                    <td>{match?.description}</td>
                                    <td>{match?.matchNumber}</td>
                                    <td><span className={redStyle}>{match?.scoreRedFinal}</span><br /><span className={blueStyle}>{match?.scoreBlueFinal}</span></td>
                                    <td><span className={redStyle}>{match?.teams[0]?.teamNumber}</span><br /><span className={blueStyle}>{match?.teams[3]?.teamNumber}</span></td>
                                    <td><span className={redStyle}>{match?.teams[1]?.teamNumber}</span><br /><span className={blueStyle}>{match?.teams[4]?.teamNumber}</span></td>
                                    <td><span className={redStyle}>{match?.teams[2]?.teamNumber}</span><br /><span className={blueStyle}>{match.teams[5]?.teamNumber}</span></td>
                                </tr>
                                )
                            })
                            }
                            {(playoffSchedule && playoffSchedule?.schedule?.length > 0) ? playoffSchedule.schedule.map((match) => {
                                let redStyle = "red";
                                let blueStyle = "blue";
                                let qualMatchCount = qualSchedule?.schedule?.length;
                                if (Number(match.scoreRedFinal) > Number(match.scoreBlueFinal)) {
                                    redStyle += " bold"
                                } else if (Number(match.scoreBlueFinal) > Number(match.scoreRedFinal)) {
                                    blueStyle += " bold"
                                }

                                return (<tr key={"playoffSchedule" + match?.matchNumber} className="centerTable">
                                    <td>{match?.actualStartTime ? "Actual:" : "Scheduled:"}<br /> {match?.actualStartTime ? moment(match?.actualStartTime).format('dd hh:mm A') : moment(match?.startTime).format('dd hh:mm A')}</td>
                                    <td>{match?.description}</td>
                                    <td>{match?.matchNumber + qualMatchCount}</td>
                                    <td><span className={redStyle}>{match?.scoreRedFinal}</span><br /><span className={blueStyle}>{match?.scoreBlueFinal}</span></td>
                                    <td><span className={redStyle}>{match?.teams[0]?.teamNumber}</span><br /><span className={blueStyle}>{match?.teams[3]?.teamNumber}</span></td>
                                    <td><span className={redStyle}>{match?.teams[1]?.teamNumber}</span><br /><span className={blueStyle}>{match?.teams[4]?.teamNumber}</span></td>
                                    <td><span className={redStyle}>{match?.teams[2]?.teamNumber}</span><br /><span className={blueStyle}>{match?.teams[5]?.teamNumber}</span></td>
                                </tr>
                                )
                            })
                                : <tr><td colSpan={7}>No playoff schedule available yet.</td></tr>}
                        </tbody>
                    </Table>
                </div>}
        </Container>
    )
}

export default SchedulePage;