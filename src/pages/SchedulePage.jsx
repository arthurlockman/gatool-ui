import Select from "react-select";
import { Alert, Button, Col, Container, Row, Table, Modal, Form, Tooltip, OverlayTrigger } from "react-bootstrap";
import moment from 'moment';
import { utils, read } from "xlsx";
import { toast } from "react-toastify";
import _ from "lodash";
import Switch from "react-switch";
import { useState } from "react";
import { playoffOverrideMenu } from "components/Constants";

function SchedulePage({ selectedEvent, setSelectedEvent, playoffSchedule, qualSchedule, practiceSchedule, setPracticeSchedule, offlinePlayoffSchedule, setOfflinePlayoffSchedule, getTeamList, loadEvent, practiceFileUploaded, setPracticeFileUploaded, setTeamListLoading, getAlliances, playoffOnly, setPlayoffOnly, alliances, champsStyle, setChampsStyle, setQualsLength, playoffCountOverride, setPlayoffCountOverride, eventLabel, setEventLabel, allianceCount, hidePracticeSchedule }) {

    const [showAdjustAlliances, setShowAdjustAlliances] = useState(false);
    const [formData, setFormData] = useState(null);

    const byeCount = [
        { "bye": 0, "allianceOrder": [{ "match": null, "station": null }], "insertionOrder": [] },
        { "bye": 0, "allianceOrder": [{ "match": 1, "station": "red" }], "insertionOrder": [] },
        { "bye": 0, "allianceOrder": [{ "match": 1, "station": "red" }, { "match": 1, "station": "blue" }], "insertionOrder": [] },

        { "bye": 1, "allianceOrder": [{ "match": 3, "station": "red" }, { "match": 2, "station": "red" }, { "match": 2, "station": "blue" }], "insertionOrder": [{ "number": 0, "description": "Bye Match #1" }] },

        { "bye": 0, "allianceOrder": [{ "match": 1, "station": "red" }, { "match": 2, "station": "red" }, { "match": 2, "station": "blue" }, { "match": 1, "station": "blue" }], "insertionOrder": [] },

        { "bye": 3, "allianceOrder": [{ "match": 7, "station": "red" }, { "match": 8, "station": "red" }, { "match": 8, "station": "blue" }, { "match": 2, "station": "red" }, { "match": 2, "station": "blue" }], "insertionOrder": [{ "number": 0, "description": "Bye Match #1" }, { "number": 2, "description": "Bye Match #2" }, { "number": 3, "description": "Bye Match #3" }, { "number": 4, "description": "Bye Match #4" }, { "number": 5, "description": "Bye Match #5" }] },

        { "bye": 2, "allianceOrder": [{ "match": 7, "station": "red" }, { "match": 8, "station": "red" }, { "match": 4, "station": "red" }, { "match": 2, "station": "red" }, { "match": 2, "station": "blue" }, { "match": 4, "station": "blue" }], "insertionOrder": [{ "number": 0, "description": "Bye Match #1" }, { "number": 2, "description": "Bye Match #2" }, { "number": 4, "description": "Bye Match #3" }, { "number": 5, "description": "Bye Match #4" }] },

        { "bye": 1, "allianceOrder": [{ "match": 7, "station": "red" }, { "match": 3, "station": "red" }, { "match": 4, "station": "red" }, { "match": 2, "station": "red" }, { "match": 2, "station": "blue" }, { "match": 4, "station": "blue" }, { "match": 3, "station": "blue" }], "insertionOrder": [{ "number": 0, "description": "Bye Match #1" }, { "number": 4, "description": "Bye Match #2" }, { "number": 5, "description": "Match 6 (R2) (#6)" }] },

        { "bye": 0, "allianceOrder": [{ "match": 1, "station": "red" }, { "match": 3, "station": "red" }, { "match": 4, "station": "red" }, { "match": 2, "station": "red" }, { "match": 2, "station": "blue" }, { "match": 4, "station": "blue" }, { "match": 3, "station": "blue" }, { "match": 1, "station": "blue" }], "insertionOrder": [] }
    ]

    const byeMatch = (bye, matchTime, description) => {
        return {
            "description": description,
            "tournamentLevel": "Playoff",
            "matchNumber": bye,
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
                "teamNumber": null,
                "station": "Red1",
                "surrogate": !1,
                "dq": !1
            }, {
                "teamNumber": null,
                "station": "Red2",
                "surrogate": !1,
                "dq": !1
            }, {
                "teamNumber": null,
                "station": "Red3",
                "surrogate": !1,
                "dq": !1
            }, {
                "teamNumber": null,
                "station": "Blue1",
                "surrogate": !1,
                "dq": !1
            }, {
                "teamNumber": null,
                "station": "Blue2",
                "surrogate": !1,
                "dq": !1
            }, {
                "teamNumber": null,
                "station": "Blue3",
                "surrogate": !1,
                "dq": !1
            }],
            "winner": { "winner": "", "tieWinner": "", "level": 0 }
        }
    }

    // This function clicks the hidden file upload button
    function clickLoadPractice() {
        document.getElementById("BackupFiles").click();
    }

    // This function removes the Practice Schedule
    const clickRemovePractice = async () => {
        await setPracticeSchedule(null);
        await setPracticeFileUploaded(false);
        await setOfflinePlayoffSchedule(null);
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
        //generate the team list from the schedule
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
        const playoffOffset = byeCount[playoffCountOverride?.value || 8];
        var forPlayoffs = e.target.id === "BackupFiles" ? false : true;
        var files = e.target.files;
        var f = files[0];
        var reader = new FileReader();
        setTeamListLoading(false);
        var alliancesTemp = {
            "Alliances": [],
            "count": playoffCountOverride?.value > 0 ? playoffCountOverride?.value : 8
        }

        reader.onload = async function (e) {
            // @ts-ignore
            var data = new Uint8Array(e.target.result);
            var workbook;
            workbook = read(data, { type: 'array' });
            var worksheet = workbook.Sheets[workbook.SheetNames[0]];
            var schedule = utils.sheet_to_json(worksheet, { range: 4 });
            var eventnameTemp = worksheet.B3.v || selectedEvent.label;
            var formattedSchedule = {};
            var matchNumber = 0;
            var errorMatches = [];
            var errorMessage = "";
            var innerSchedule = [];
            const basicMatch = {
                "Time": "",
                "Description": "",
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
                    var matchTime = moment(match?.Time, "ddd h:mm A").format() === "Invalid date" ? moment() : moment(match?.Time, "ddd h:mm A").format();
                    if (match["Red 1"]) {
                        matchNumber++;
                        var tempRow = {
                            "description": match?.Description,
                            "tournamentLevel": forPlayoffs ? "Playoff" : "Practice",
                            "matchNumber": forPlayoffs ? matchNumber + playoffOffset?.bye : matchNumber,
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
                            }],
                            "winner": { "winner": "", "tieWinner": "", "level": 0 }
                        };
                    }
                    return (tempRow);
                })
                // remove non-match rows
                innerSchedule = _.filter(innerSchedule, "description");

                if (forPlayoffs) {
                    // inject bye matches into schedule for playoff display
                    if (playoffOffset?.bye > 0) {
                        var matchTime = innerSchedule[0].startTime;
                        _.forEach(playoffOffset.insertionOrder, (item, index) => {
                            innerSchedule.splice(item.number, 0, byeMatch(index + 1, matchTime, item.description))
                        }
                        )
                        innerSchedule.map((item, index) => {
                            item.matchNumber = index + 1;
                            return item;
                        }
                        )

                    }


                    alliancesTemp.Alliances = playoffOffset.allianceOrder.map((allianceMember, index) => {
                        try {
                            var stationOffset = allianceMember.station === "red" ? 0 : 3;
                            var tempAlliance = {
                                "number": 1 + index,
                                "captain": innerSchedule[allianceMember.match - 1].teams[0 + stationOffset].teamNumber,
                                "round1": innerSchedule[allianceMember.match - 1].teams[1 + stationOffset].teamNumber,
                                "round2": innerSchedule[allianceMember.match - 1].teams[2 + stationOffset].teamNumber,
                                "round3": null,
                                "backup": null,
                                "backupReplaced": null,
                                "name": `Alliance ${1 + index}`
                            }
                            return tempAlliance;
                        } catch (e) {
                            toast.error(`Please check the Alliance Count on the Setup Page before uploading your schedule.`)
                            return null;
                        }
                    })

                    getAlliances(alliancesTemp);
                }

                formattedSchedule.schedule = _.filter(innerSchedule, "description");
                if (!forPlayoffs) {
                    await setPracticeSchedule(formattedSchedule);
                    setQualsLength(formattedSchedule?.schedule?.length);
                } else {
                    await setOfflinePlayoffSchedule(formattedSchedule);
                }
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

                setEventLabel(eventnameTemp);


            }
        };
        reader.readAsArrayBuffer(f);


    }

    function removeSurrogate(teamNumber) {
        teamNumber = teamNumber.replace("*", "");
        return teamNumber;
    }

    const handleOpen = () => {
        setFormData(_.cloneDeep(alliances));
        setShowAdjustAlliances(true);
    }

    const handleClose = () => {
        setShowAdjustAlliances(false);
    }

    const handleFormValue = (allianceNumber, property, value) => {
        var formDataTemp = _.cloneDeep(formData);
        formDataTemp.alliances[allianceNumber - 1][property] = value;
        setFormData(formDataTemp);
    }

    const handleChampsStyle = (e) => {
        var eventTemp = _.cloneDeep(selectedEvent);
        eventTemp.value.type = "Championship";
        eventTemp.value.champLevel = "CHAMPS"
        setSelectedEvent(eventTemp);
        setChampsStyle(e)
    }

    const handleAdjustAlliances = () => {
        console.log("Adjusting Alliances");
        var alliancesTemp = {};
        var teamNumbers = [];
        alliancesTemp.Alliances = formData.alliances.map((alliance) => {
            // Add the Alliance members to the team list
            var keys = Object.keys(alliance);
            keys.forEach((key) => {
                if (key.includes("captain") || key.includes("round")) {
                    if (alliance[key]) {
                        teamNumbers.push(Number(alliance[key]));
                    }
                }
            })

            return ({
                "number": Number(alliance.number),
                "captain": Number(alliance.captain),
                "round1": Number(alliance.round1),
                "round2": Number(alliance.round2),
                "round3": Number(alliance.round3),
                "backup": null,
                "backupReplaced": null,
                "name": alliance.name
            })
        })

        getAlliances(alliancesTemp);

        // Reset the team list based on changes to the Alliances
        getTeamList(teamNumbers);

        handleClose();
    }

    const showPlayoffMessage = selectedEvent?.value?.code.includes("OFFLINE") && !_.isNull(playoffCountOverride);
    if (typeof practiceSchedule?.schedule?.schedule !== "undefined") {
        practiceSchedule.schedule = practiceSchedule?.schedule?.schedule;
    }
    var firstMatch = typeof qualSchedule?.schedule?.schedule !== "undefined" ? qualSchedule?.schedule?.schedule[0] : qualSchedule?.schedule[0]
    if (moment().isBefore(moment(firstMatch?.startTime).subtract(20, "minutes"))) {

    }
    const rankPointDisplay = (rankPoints) => {
        var pointsDisplay = [];
        _.forEach(rankPoints, (value, key) => {
            pointsDisplay.push({ bonus: _.startCase(key.replace("BonusAchieved", "")), earned: value })
        })
        return pointsDisplay.map((point) => { return <><OverlayTrigger delay={500} overlay={
            <Tooltip id={`tooltip-${point.bonus}`}>
              {point.bonus} {point.earned ? " Achieved" : " Not Achieved"}
            </Tooltip>
          }><span className={`rankPoints${point.earned ? "":" unearned"}`}>{point.bonus.slice(0, 1)}</span></OverlayTrigger></> })
    }


    return (
        <Container fluid>
            {!selectedEvent && <div>
                <Alert variant="warning" >You need to select an event before you can see anything here.</Alert>
            </div>}
            {selectedEvent && (!qualSchedule || qualSchedule?.schedule?.length === 0 || qualSchedule?.schedule?.schedule?.length === 0) && (!playoffSchedule || playoffSchedule?.schedule?.length === 0 || playoffSchedule?.schedule?.schedule?.length === 0) && <div>
                <Alert variant="warning" >
                    {(!practiceSchedule || practiceSchedule?.schedule?.length === 0 || practiceSchedule?.schedule?.schedule?.length === 0) && !practiceFileUploaded && <>
                        {!(playoffOnly && (offlinePlayoffSchedule?.schedule?.length >= 0 || offlinePlayoffSchedule?.schedule?.schedule?.length >= 0)) && <>
                            <div><img src="loadingIcon.gif" alt="Loading data..." /></div>
                            <div>Awaiting schedule for {eventLabel}<br /><br /></div>
                        </>}
                        <Container fluid>
                            <Row>
                                <Col xs={1}></Col>
                                {!playoffOnly && <Col xs={1}>
                                    <input type="file" id="BackupFiles" onChange={handlePracticeFiles} className={"hiddenInput"} /><img style={{ float: "left" }} width="50" src="images/excelicon.png" alt="Excel Logo" />
                                </Col>}
                                {playoffOnly && <Col xs={1}>
                                    <input type="file" id="LoadOfflinePlayoffs" onChange={handlePracticeFiles} className={"hiddenInput"} /><img style={{ float: "left" }} width="50" src="images/excelicon.png" alt="Excel Logo" />
                                </Col>}

                                {selectedEvent?.value?.code.includes("OFFLINE") && <>
                                    {!playoffOnly && <Col xs={5} className={"leftTable"} style={{ cursor: "pointer", color: "darkblue" }} onClick={clickLoadPractice}><b>You can upload a Qualification Match Schedule for your Offline event. You will need to ask your Scorekeeper to export a Schedule Report in Excel format, which you can upload here. We will determine the team list from the Qualification Schedule.<br />Tap here to upload a Qualification Schedule.</b></Col>}
                                    {playoffOnly && showPlayoffMessage && <Col xs={5} className={"leftTable"} style={{ cursor: "pointer", color: "darkblue" }} onClick={clickLoadOfflinePlayoffs}>
                                        <b>You can now load your Offline Playoff Schedule. You can advance the Playoff using the Playoff Tab, or you can reload the schedule after each Round in the playoffs.<br />Tap here to remove it and replace it, as necessary.</b>
                                    </Col>}
                                    {playoffOnly && !showPlayoffMessage && <Col xs={5} className={"leftTable"} >
                                        <b>Please set the Alliance Count before uploading a Playoff Schedule.</b>
                                        <Select options={playoffOverrideMenu} value={playoffCountOverride ? playoffCountOverride : (allianceCount?.menu ? allianceCount.menu : playoffOverrideMenu[0])} onChange={setPlayoffCountOverride} />
                                    </Col>}
                                    <Col xs={1}></Col>
                                    <Col xs={3}>
                                        <Row><Col xs={2}><Switch checked={playoffOnly} onChange={setPlayoffOnly} /></Col>
                                            <Col>Playoff-Only OFFLINE Event</Col>
                                        </Row>
                                        {playoffOnly && <Row><Col xs={2}><Switch checked={champsStyle} onChange={handleChampsStyle} /></Col>
                                            <Col>Is World Champs</Col>
                                        </Row>}
                                        {playoffOnly && offlinePlayoffSchedule && <Row>
                                            <Col><Button onClick={() => handleOpen()}>Adjust Alliances</Button></Col></Row>}
                                    </Col>
                                </>}
                                {!selectedEvent?.value?.code.includes("OFFLINE") && <Col xs={6} className={"leftTable"} style={{ cursor: "pointer", color: "darkblue" }} onClick={clickLoadPractice}><b>You can upload a Practice Schedule while you wait for the Quals Schedule to post. You will need to ask your Scorekeeper to export a Schedule Report in Excel format, which you can upload here.<br />Tap here to upload a Practice Schedule.</b></Col>}

                                <Col xs={1}></Col>
                            </Row>
                        </Container>
                    </>}
                    {(practiceSchedule?.schedule?.length > 0 || practiceSchedule?.schedule?.schedule?.length > 0) &&
                        <Container fluid>
                            {practiceFileUploaded &&
                                <Row>
                                    <Col xs={2}></Col>
                                    <Col xs={1}><input type="file" id="RemoveOfflinePractice" onChange={handlePracticeFiles} className={"hiddenInput"} /><img style={{ float: "left" }} width="50" src="images/excelicon.png" alt="Excel Logo" /></Col>
                                    <Col xs={selectedEvent?.value?.code.includes("OFFLINE") ? 4 : 7} className={"leftTable"} style={{ cursor: "pointer", color: "darkblue" }} onClick={clickRemovePractice}>
                                        {selectedEvent?.value?.code.includes("OFFLINE") && <b>You have uploaded an Offline Schedule.<br />Tap here to remove it. You can add a playoff schedule, when one becomes available.</b>}
                                        {!selectedEvent?.value?.code.includes("OFFLINE") && <b>You have uploaded a Practice Schedule.<br />Tap here to remove it. Know that we will automatically remove it when we get a Qualification Matches Schedule.</b>}
                                    </Col>
                                    <Col xs={2}></Col>
                                </Row>
                            }
                            {!practiceFileUploaded && !selectedEvent?.value?.code.includes("OFFLINE") &&
                                <Row>
                                    <Col xs={2}></Col>
                                    <Col xs={8}><b>Practice Matches</b><br />Your event has not yet posted a Qualification Match schedule. You can use this practice match schedule to help observe teams and practice for the tournament. Please do not announce matches during the Practice Match period.</Col>
                                    <Col xs={2}></Col>
                                </Row>}
                            {selectedEvent?.value?.code.includes("OFFLINE") &&
                                <Row>
                                    <Col xs={1}></Col>
                                    <Col xs={1}>
                                        <input type="file" id="LoadOfflineQuals" onChange={handlePracticeFiles} className={"hiddenInput"} /><img style={{ float: "left" }} width="50" src="images/excelicon.png" alt="Excel Logo" />
                                    </Col>
                                    <Col xs={3} className={"leftTable"} style={{ cursor: "pointer", color: "darkblue" }} onClick={clickRemovePractice}>
                                        {selectedEvent?.value?.code.includes("OFFLINE") && <b>You have uploaded an Offline Schedule.<br />Tap here to remove it. You can add a playoff schedule, when one becomes available.</b>}
                                    </Col>
                                    <Col xs={2}></Col>
                                    <Col xs={1}>
                                        <input type="file" id="LoadOfflinePlayoffs" onChange={handlePracticeFiles} className={"hiddenInput"} /><img style={{ float: "left" }} width="50" src="images/excelicon.png" alt="Excel Logo" />
                                    </Col>
                                    {showPlayoffMessage && <Col xs={3} className={"leftTable"} style={{ cursor: "pointer", color: "darkblue" }} onClick={clickLoadOfflinePlayoffs}>
                                        <b>You can now load your Offline Playoff Schedule. You may need to do this after each phase of the playoffs.<br />Tap here to remove it and replace it, as necessary.</b>
                                    </Col>}
                                    {!showPlayoffMessage && <Col xs={3} className={"leftTable"} style={{ color: "darkblue" }}>
                                        <b>Please set the Alliance Count before uploading a Playoff Schedule.</b>
                                        <Select options={playoffOverrideMenu} value={playoffCountOverride ? playoffCountOverride : (allianceCount?.menu ? allianceCount.menu : playoffOverrideMenu[0])} onChange={setPlayoffCountOverride} />
                                    </Col>}
                                    <Col xs={1}></Col>
                                </Row>}
                        </Container>
                    }
                </Alert>
            </div>}
            {selectedEvent &&
                (
                    practiceSchedule?.schedule?.length > 0 || qualSchedule?.schedule?.length > 0 ||
                    (qualSchedule?.schedule?.length === 0 && playoffSchedule?.schedule?.length > 0) ||
                    (qualSchedule?.schedule?.schedule?.length === 0 && playoffSchedule?.schedule?.length > 0) ||
                    (qualSchedule?.schedule?.schedule?.length === 0 && playoffSchedule?.schedule?.length === 0 && offlinePlayoffSchedule)
                ) &&
                <div>
                    <h4>{eventLabel}</h4>
                    <Table responsive striped bordered size="sm">
                        <thead className="thead-default">
                            <tr>
                                <th className="col2"><b>Time</b></th>
                                <th className="col2"><b>Description</b></th>
                                <th className="col1"><b>Match Number</b></th>
                                <th className="col1" colSpan={2}><b>Score</b></th>
                                <th className="col1"><b>Station 1</b></th>
                                <th className="col1"><b>Station 2</b></th>
                                <th className="col1"><b>Station 3</b></th>
                            </tr>
                        </thead>
                        <tbody>
                            {practiceSchedule && !hidePracticeSchedule && practiceSchedule?.schedule?.length > 0 && practiceSchedule?.schedule.map((match) => {
                                let redStyle = "red";
                                let blueStyle = "blue";
                                return (<tr key={"practiceSchedule" + match?.matchNumber} className="centerTable">
                                    <td>{match?.actualStartTime ? "Actual:" : "Scheduled:"}<br /> {match?.actualStartTime ? moment(match.actualStartTime).format('dd hh:mm A') : moment(match?.startTime).format('dd hh:mm A')}</td>
                                    <td>{match?.description}</td>
                                    <td>{match?.matchNumber}</td>
                                    <td colSpan={2}>
                                        <tr className={`centerTable ${redStyle} block`} ><span>{match?.scoreRedFinal}</span></tr>
                                        <tr className={`centerTable ${blueStyle} block`}><span>{match?.scoreBlueFinal}</span></tr>
                                    </td>
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
                                    <td className={match?.scoreRedFinal ? `scheduleTable${winnerStyle}` : ""}>
                                        <tr className={`centerTable ${redStyle} block`}><span>{match?.scoreRedFinal}</span></tr>
                                        <tr className={`centerTable ${blueStyle} block`}><span>{match?.scoreBlueFinal}</span></tr>
                                    </td>
                                    <td className={(match?.scoreRedFinal>=0 || match?.scoreBlueFinal>=0) ? `scheduleTable${winnerStyle}` : ""}>
                                        <tr className={`centerTable ${redStyle} block`}><span style={{whiteSpace:'nowrap'}}>{match?.redRP ? rankPointDisplay(match?.redRP) : " "}</span></tr>
                                        <tr className={`centerTable ${blueStyle} block`}><span style={{whiteSpace:'nowrap'}}>{match?.blueRP ? rankPointDisplay(match?.blueRP) : " "}</span></tr>
                                    </td>
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
                                    <td className={(match?.scoreRedFinal>=0 || match?.scoreBlueFinal>=0) ? `scheduleTable${winnerStyle}` : " "} colSpan={2}>
                                        <tr className={`centerTable ${redStyle} block`} ><span>{match?.scoreRedFinal}</span></tr>
                                        <tr className={`centerTable ${blueStyle} block`}><span>{match?.scoreBlueFinal}</span></tr>
                                    </td>
                                    <td><span className={redStyle}>{match?.teams[0]?.teamNumber}</span><br /><span className={blueStyle}>{match?.teams[3]?.teamNumber}</span></td>
                                    <td><span className={redStyle}>{match?.teams[1]?.teamNumber}</span><br /><span className={blueStyle}>{match?.teams[4]?.teamNumber}</span></td>
                                    <td><span className={redStyle}>{match?.teams[2]?.teamNumber}</span><br /><span className={blueStyle}>{match?.teams[5]?.teamNumber}</span></td>
                                </tr>
                                )
                            })}
                            {(!qualSchedule || qualSchedule?.schedule?.length === 0 || qualSchedule?.schedule?.schedule?.length === 0 || (selectedEvent?.value?.code.includes("OFFLINE") && !playoffOnly)) &&
                                <tr>
                                    <td colSpan={7}>No Qualification match schedule available yet.</td>
                                </tr>}
                            {!offlinePlayoffSchedule && (playoffSchedule?.schedule?.length === 0 || playoffSchedule?.schedule?.schedule?.length === 0) &&
                                <tr>
                                    <td colSpan={7}>No Playoff match schedule available yet.</td>
                                </tr>}
                        </tbody>
                    </Table>
                </div>}
            <Modal centered={true} show={showAdjustAlliances} size="lg" onHide={handleClose}>
                <Modal.Header className={"promoteBackup"} closeVariant={"white"} closeButton>
                    <Modal.Title >Adjust Alliances</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Container>
                        <Row>Use this form to adjust the Alliance members. If you add Alliance members, gatool will add the teams to the Team List. This is especially useful when planning 4-team Alliance events.</Row>
                        <Form>
                            <Table>
                                <Row><Col>Number</Col><Col>Name</Col><Col>Captain</Col><Col>Round 1</Col><Col>Round 2</Col><Col>Round 3</Col></Row>
                                {formData?.alliances.map((alliance) => {
                                    return <Row>
                                        <Col>{alliance.number}</Col>
                                        <Col><Form.Control type="text" value={alliance.name} placeholder="Name" onChange={(e) => handleFormValue(alliance.number, "name", e.target.value)} /></Col>
                                        <Col><Form.Control type="text" value={alliance.captain} placeholder="Captain" onChange={(e) => handleFormValue(alliance.number, "captain", e.target.value)} /></Col>
                                        <Col><Form.Control type="text" value={alliance.round1} placeholder="Round 1" onChange={(e) => handleFormValue(alliance.number, "round1", e.target.value)} /></Col>
                                        <Col><Form.Control type="text" value={alliance.round2} placeholder="Round 2" onChange={(e) => handleFormValue(alliance.number, "round2", e.target.value)} /></Col>
                                        <Col><Form.Control type="text" value={alliance.round3} placeholder="Round 3" onChange={(e) => handleFormValue(alliance.number, "round3", e.target.value)} /></Col>
                                    </Row>
                                })}
                            </Table></Form>
                    </Container>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleAdjustAlliances}>Save Alliances</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    )
}

export default SchedulePage;