import { useState } from "react";
import { Button, Container, Form, InputGroup, Modal } from "react-bootstrap";
import _ from "lodash";
import { HandThumbsDownFill, HandThumbsUpFill, TrophyFill } from "react-bootstrap-icons";
import { useHotkeysContext } from "react-hotkeys-hook";


function AllianceSelection({ selectedYear, selectedEvent, rankings, teamList, allianceCount, communityUpdates, allianceSelectionArrays, setAllianceSelectionArrays }) {

    const [show, setShow] = useState(false);
    const [allianceTeam, setAllianceTeam] = useState(null);
    const [allianceMode, setAllianceMode] = useState(null);
    const [teamFilter, setTeamFilter] = useState("");
    const { disableScope, enableScope } = useHotkeysContext();

    const allianceSelectionOrderBase = [
        { "number": 1, "round": 1 },
        { "number": 2, "round": 1 },
        { "number": 3, "round": 1 },
        { "number": 4, "round": 1 },
        { "number": 5, "round": 1 },
        { "number": 6, "round": 1 },
        { "number": 7, "round": 1 },
        { "number": 8, "round": 1 },
        { "number": 8, "round": 2 },
        { "number": 7, "round": 2 },
        { "number": 6, "round": 2 },
        { "number": 5, "round": 2 },
        { "number": 4, "round": 2 },
        { "number": 3, "round": 2 },
        { "number": 2, "round": 2 },
        { "number": 1, "round": 2 },
        { "number": 1, "round": 3 },
        { "number": 2, "round": 3 },
        { "number": 3, "round": 3 },
        { "number": 4, "round": 3 },
        { "number": 5, "round": 3 },
        { "number": 6, "round": 3 },
        { "number": 7, "round": 3 },
        { "number": 8, "round": 3 }];

    const originalAndSustaining = ["20", "45", "126", "148", "151", "157", "190", "191", "250"];

    var allianceSelectionOrder = [];
    allianceSelectionOrderBase.forEach((alliance) => {
        if (alliance.number <= allianceCount?.count) {
            allianceSelectionOrder.push(alliance);
        }
    })

    var inChamps = false;
    if (selectedEvent?.value?.champLevel === "CHAMPS" || selectedEvent?.value?.champLevel === "CMPDIV" || selectedEvent?.value?.champLevel === "CMPSUB") {
        inChamps = true;
    }

    var allianceDisplayOrder = [];
    if (allianceCount?.count <= 4) {
        allianceDisplayOrder = [[1, 4], [2, 3]]
    } else if (allianceCount?.count <= 6) {
        allianceDisplayOrder = [[1, 6], [2, 5], [3, 4]]
    } else { allianceDisplayOrder = [[1, 8], [2, 7], [3, 6], [4, 5]] }


    const handleClose = () => {
        setAllianceTeam(null);
        setAllianceMode("");
        setShow(false);
        enableScope('tabNavigation');
    }

    const handleShow = (team, mode, e) => {
        setAllianceTeam(team);
        setAllianceMode(mode || "show");
        setShow(true);
        disableScope('tabNavigation');
    }
    const handleAccept = (team, mode, e) => {
        if (mode === "accept") {
            setAllianceTeam(team);
            setAllianceMode("accept");
            setShow(true);
        }
        if (mode === "confirm") {
            var undo = _.cloneDeep(asArrays);
            delete undo.undo;
            asArrays.undo.push(undo);
            asArrays.availableTeams.splice(_.findIndex(asArrays.availableTeams, { "teamNumber": team.teamNumber }), 1);
            asArrays.rankedTeams.splice(_.findIndex(asArrays.rankedTeams, { "teamNumber": team.teamNumber }), 1);
            asArrays.alliances[_.findIndex(asArrays.alliances, { "number": allianceSelectionOrder[asArrays.nextChoice].number })][`round${allianceSelectionOrder[asArrays.nextChoice].round}`] = team;
            if (asArrays.nextChoice < allianceCount?.count) {
                for (var topAlliance = asArrays.nextChoice; topAlliance < allianceCount?.count; topAlliance++) {
                    asArrays.alliances[_.findIndex(asArrays.alliances, { "number": topAlliance + 1 })][`captain`] = asArrays.rankedTeams[topAlliance];
                }
                var currentCaptain = asArrays.alliances[_.findIndex(asArrays.alliances, { "number": allianceSelectionOrder[asArrays.nextChoice].number })].captain.teamNumber;
                asArrays.availableTeams.splice(_.findIndex(asArrays.availableTeams, { "teamNumber": currentCaptain }), 1);
            }

            if (asArrays.nextChoice < allianceSelectionOrder.length) { asArrays.nextChoice += 1; }


            setAllianceSelectionArrays(asArrays);
            handleClose();
        }

    }
    const handleDecline = (team, mode, e) => {
        if (mode === "decline") {
            setAllianceTeam(team);
            setAllianceMode("decline");
            setShow(true);
        }
        if (mode === "confirm") {
            var undo = _.cloneDeep(asArrays);
            delete undo.undo;
            asArrays.undo.push(undo);
            asArrays.declined.push(team.teamNumber);
            setAllianceSelectionArrays(asArrays);
            handleClose();
        }

    }

    const handleUndo = () => {
        var undo = asArrays.undo.pop();
        asArrays.alliances = undo.alliances;
        asArrays.availableTeams = undo.availableTeams;
        asArrays.declined = undo.declined;
        asArrays.nextChoice = undo.nextChoice;
        asArrays.rankedTeams = undo.rankedTeams;
        setAllianceSelectionArrays(asArrays);
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
        var team = _.filter(asArrays.availableTeams, { 'teamNumber': Number(e.currentTarget[0].value) })[0];
        // @ts-ignore
        document.getElementById("filterControl").value = "";
        setTeamFilter("");
        setAllianceTeam(team);
        setAllianceMode("show");
        setShow(true);

    }

    const handleReset = () => {
        // @ts-ignore
        document.getElementById("filterControl").value = "";
        setTeamFilter("");
        setAllianceSelectionArrays({});
    }

    var availColumns = [[], [], [], [], []];
    var backupTeams = [];
    var alliances = null;




    allianceSelectionOrder = allianceSelectionOrder.slice(0, allianceCount?.allianceSelectionLength + 1);

    var sortedTeams = _.orderBy(rankings?.ranks, "teamNumber", "asc");
    var asArrays = {
        "alliances":[],
        "rankedReams": [],
        "availableTeams": [],
        "nextChoice": 0,
        "undo": [],
        "declined": []
    };

    if (selectedEvent && rankings && teamList && allianceCount && communityUpdates) {


        sortedTeams = sortedTeams.map((team) => {
            team = _.merge(team, communityUpdates[_.findIndex(communityUpdates, { "teamNumber": team?.teamNumber })], teamList?.teams[_.findIndex(teamList?.teams, { "teamNumber": team?.teamNumber })])
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

        //initialize allianceSelectionArrays
        if (!allianceSelectionArrays || _.isEmpty(allianceSelectionArrays)) {
            sortedTeams = _.orderBy(sortedTeams, ["rank"], ["asc"]);
            asArrays.alliances = [
                {
                    "number": 1,
                    "captain": sortedTeams[0],
                    "round1": null,
                    "round2": null,
                    "round3": null,
                    "backup": null,
                    "backupReplaced": null,
                    "name": "Alliance 1"
                },
                {
                    "number": 2,
                    "captain": sortedTeams[1],
                    "round1": null,
                    "round2": null,
                    "round3": null,
                    "backup": null,
                    "backupReplaced": null,
                    "name": "Alliance 2"
                },
                {
                    "number": 3,
                    "captain": sortedTeams[2],
                    "round1": null,
                    "round2": null,
                    "round3": null,
                    "backup": null,
                    "backupReplaced": null,
                    "name": "Alliance 3"
                },
                {
                    "number": 4,
                    "captain": sortedTeams[3],
                    "round1": null,
                    "round2": null,
                    "round3": null,
                    "backup": null,
                    "backupReplaced": null,
                    "name": "Alliance 4"
                },
                {
                    "number": 5,
                    "captain": 5 <= allianceCount?.count ? sortedTeams[4] : null,
                    "round1": null,
                    "round2": null,
                    "round3": null,
                    "backup": null,
                    "backupReplaced": null,
                    "name": "Alliance 5"
                },
                {
                    "number": 6,
                    "captain": 6 <= allianceCount?.count ? sortedTeams[5] : null,
                    "round1": null,
                    "round2": null,
                    "round3": null,
                    "backup": null,
                    "backupReplaced": null,
                    "name": "Alliance 6"
                },
                {
                    "number": 7,
                    "captain": 7 <= allianceCount?.count ? sortedTeams[6] : null,
                    "round1": null,
                    "round2": null,
                    "round3": null,
                    "backup": null,
                    "backupReplaced": null,
                    "name": "Alliance 7"
                },
                {
                    "number": 8,
                    "captain": 8 <= allianceCount?.count ? sortedTeams[7] : null,
                    "round1": null,
                    "round2": null,
                    "round3": null,
                    "backup": null,
                    "backupReplaced": null,
                    "name": "Alliance 8"
                }
            ];
            asArrays.rankedTeams = _.orderBy(sortedTeams, ["rank", "asc"]);
            asArrays.availableTeams = _.orderBy(sortedTeams, ["teamNumber", "asc"]);
            asArrays.nextChoice = 0;
            asArrays.undo = [];
            asArrays.declined = [];
            setAllianceSelectionArrays(asArrays);

        } else { asArrays = _.cloneDeep(allianceSelectionArrays) }


        // pick off the top 8 remaining teams to be the backup list
        backupTeams = asArrays?.rankedTeams.slice(allianceCount?.count, allianceCount?.count + 8);

        // set up the available teams block
        var rows = asArrays.availableTeams?.length;
        if (rows > 0) {
            asArrays.availableTeams?.forEach((team, index) => {
                if (index <= 1 * rows / 5 - 1) {
                    availColumns[0].push(team);
                } else if (index <= 2 * rows / 5 - 1) {
                    availColumns[1].push(team);
                } else if (index <= 3 * rows / 5 - 1) {
                    availColumns[2].push(team);
                } else if (index <= 4 * rows / 5 - 1) {
                    availColumns[3].push(team);
                } else {
                    availColumns[4].push(team);
                }
            })
        }

        //set up the Alliances
        alliances = asArrays.alliances;
    }


    return (
        <>
            <Container fluid>
                {selectedEvent && rankings?.ranks?.length > 0 && teamList?.teams?.length > 0 && allianceCount &&
                    <div>
                        <Form onSubmit={handleFilterSelect}>
                            <InputGroup className="mb-3" >
                                <InputGroup.Text>Filter the teams</InputGroup.Text>
                                <Form.Control id={"filterControl"} type="number" placeholder="Enter a number" aria-label="Team Number" onChange={filterTeams} />
                                {(_.filter(asArrays?.availableTeams, { 'teamNumber': Number(teamFilter) }).length === 1) && <Button variant="primary" type="submit">Select this team</Button>}
                                <span>    </span>
                                {(asArrays?.undo?.length > 0) && <Button size="sm" onClick={handleUndo} active >Undo Previous Choice</Button>}
                                {(asArrays?.undo?.length === 0) && <Button size="sm" onClick={handleUndo} disabled >Undo Previous Choice</Button>}
                                <span>    </span><Button size="sm" variant="warning" onClick={handleReset} active>Restart Alliance Selection</Button>
                            </InputGroup>
                        </Form>
                        <table>
                            <tbody>
                                <tr>
                                    <td>
                                        <table className="availableTeams">
                                            <tbody>
                                                <tr key={"titleRow"}>
                                                    <td colSpan={5} key={"Title"} ><strong>Teams for Alliance Selection</strong></td>
                                                </tr>
                                                <tr key={"AvailableTeams"}>
                                                    {availColumns.map((column, index) => {
                                                        return (<td key={`availableTableColumn${index}`}>
                                                            {column.map((team) => {
                                                                var declined = asArrays?.declined.includes(team?.teamNumber);
                                                                return (
                                                                    <>
                                                                        {(asArrays?.nextChoice < allianceSelectionOrder?.length && team.rank !== 1) &&
                                                                            (String(team?.teamNumber).startsWith(teamFilter) || teamFilter === "") && <div key={"availableButton" + team?.teamNumber} className={declined ? "allianceDecline" : "allianceTeam"} onClick={(e) => handleShow(team, declined ? "declined" : "show", e)}><b>{team.teamNumber}</b></div>}

                                                                        {(asArrays?.nextChoice >= allianceSelectionOrder?.length || team.rank === 1) &&
                                                                            (String(team?.teamNumber).startsWith(teamFilter) || teamFilter === "") && <div key={"availableButtonDisabled" + team?.teamNumber} className={declined ? "allianceDecline" : "allianceTeam"} ><b>{team?.teamNumber}</b></div>}
                                                                    </>
                                                                )
                                                            })}
                                                        </td>)
                                                    })}
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                    <td  >
                                        <table className={"backupAlliancesTable"}>
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <p><strong>Backup Alliances</strong><br />(Teams here are initially ranked {allianceCount?.count + 1} to {allianceCount?.count + 8} top to bottom. As Alliance Selection progresses, teams will rise up into this section as teams are selected.)</p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        {backupTeams.map((team) => {
                                                            var declined = asArrays.declined.includes(team.teamNumber);
                                                            return (
                                                                <>{(asArrays?.nextChoice < allianceSelectionOrder?.length) &&
                                                                    <div key={"backupButton" + team?.teamNumber} className={declined ? "allianceDecline" : "allianceTeam"} onClick={(e) => handleShow(team, declined ? "declined" : "show", e)}><b>{team?.teamNumber}</b></div>}
                                                                    {(asArrays?.nextChoice >= allianceSelectionOrder?.length) &&
                                                                        <div key={"backupButtonDisabled" + team?.teamNumber} className={declined ? "allianceDecline" : "allianceTeam"} ><b>{team.teamNumber}</b></div>}
                                                                </>
                                                            )
                                                        })}
                                                    </td>
                                                </tr>

                                            </tbody>
                                        </table>
                                    </td>
                                    <td>
                                        <table className={"alliancesTeamsTable"}>
                                            <tbody>
                                                {allianceDisplayOrder.map((row) => {
                                                    return (
                                                        <tr key={`allianceDisplay${row[0]}`}>
                                                            {row.map((allianceNumber) => {
                                                                var alliance = _.filter(alliances, { "number": allianceNumber })
                                                                var allianceName = alliance[0]?.name;
                                                                var captain = alliance[0]?.captain;
                                                                if (captain) { captain.declined = asArrays?.declined?.includes(captain?.teamNumber); }
                                                                var round1 = alliance[0]?.round1;
                                                                if (round1) { round1.declined = asArrays?.declined?.includes(round1?.teamNumber); }
                                                                var round2 = alliance[0]?.round2;
                                                                if (round2) { round2.declined = asArrays?.declined?.includes(round2?.teamNumber); }
                                                                var round3 = alliance[0]?.round3;
                                                                if (round3) { round3.declined = asArrays?.declined?.includes(round3?.teamNumber); }
                                                                return (
                                                                    (allianceNumber <= allianceCount?.count) ? <td className={allianceSelectionOrder[asArrays?.nextChoice]?.number === allianceNumber ? "dropzone" : ""} key={`AllianceTable${allianceName}`}>
                                                                        <div><b>{allianceName}</b></div>

                                                                        {(allianceNumber === asArrays?.nextChoice + 1) && <div className={"alliancedrop allianceCaptain"} >Captain<div key={`${allianceName}captainAvailable`} className={captain?.declined ? "allianceDecline" : "allianceTeam"} onClick={(e) => handleShow(captain, allianceNumber === 1 ? "a1captain" : allianceNumber > 1 ? "captain" : captain?.declined ? "declined" : "show", e)}>{captain?.teamNumber ? captain?.teamNumber : ""}</div></div>}

                                                                        {(allianceNumber > asArrays.nextChoice + 1) && <div className={"alliancedrop allianceCaptain"} >Captain<div key={`${allianceName}captainAvailable`} className={captain?.declined ? "allianceDecline" : "allianceTeam"} onClick={(e) => handleShow(captain, captain?.declined ? "declined" : "show", e)}>{captain?.teamNumber ? captain?.teamNumber : ""}</div></div>}

                                                                        {(allianceNumber < asArrays?.nextChoice + 1) && <div className={"alliancedrop allianceCaptain"} >Captain<div key={`${allianceName}captainunavailable`} className={captain?.declined ? "allianceDecline" : "allianceTeam"} >{captain?.teamNumber ? captain?.teamNumber : ""}</div></div>}

                                                                        <div className={(allianceSelectionOrder[asArrays?.nextChoice]?.number === allianceNumber) && (allianceSelectionOrder[asArrays?.nextChoice]?.round === 1) ? "alliancedrop nextAllianceChoice" : "alliancedrop"}>1st choice{round1?.teamNumber ? <div key={`${allianceName}round1`} className={round1?.declined ? "allianceDecline" : "allianceTeam"}>{round1?.teamNumber}</div> : ""}</div>

                                                                        <div className={(allianceSelectionOrder[asArrays?.nextChoice]?.number === allianceNumber) && (allianceSelectionOrder[asArrays?.nextChoice]?.round === 2) ? "alliancedrop nextAllianceChoice" : "alliancedrop"}>2nd choice{round2?.teamNumber ? <div key={`${allianceName}round2`} className={"allianceTeam"}>{round2?.teamNumber}</div> : ""}</div>

                                                                        {inChamps && <div className={(allianceSelectionOrder[asArrays?.nextChoice]?.number === allianceNumber) && (allianceSelectionOrder[asArrays?.nextChoice]?.round === 3) ? "alliancedrop nextAllianceChoice" : "alliancedrop"}>3rd choice{round3?.teamNumber ? <div key={`${allianceName}round3`} className={"allianceTeam"}>{round3?.teamNumber}</div> : ""}</div>}
                                                                    </td> : <td></td>
                                                                )
                                                            })}
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tbody></table></div>
                }
                {allianceTeam && <Modal centered={true} show={show} onHide={handleClose}>
                    <Modal.Header className={allianceMode === "decline" ? "allianceDecline" : "allianceChoice"} closeVariant={"white"} closeButton>
                        <Modal.Title >{allianceMode === "decline" ? "Team declines the offer" : allianceMode === "accept" ? "Are you sure they want to accept?" : allianceMode === "a1captaion" ? "Top Seeded Alliance" : "Alliance Choice"}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {(allianceMode === "show" || allianceMode === "a1captain") && <span className={"allianceAnnounceDialog"}>Team {allianceTeam?.teamNumber} {allianceTeam?.updates?.nameShortLocal ? allianceTeam?.updates.nameShortLocal : allianceTeam?.nameShort}<br />
                            is {allianceTeam?.awardsTextLocal ? allianceTeam?.awardsTextLocal : <>{(originalAndSustaining.indexOf(String(allianceTeam?.teamNumber)) >= 0) ? "an Original and Sustaining Team " : ""}from<br />
                            {allianceTeam?.updates?.organizationLocal ? allianceTeam?.updates?.organizationLocal : allianceTeam?.organization}<br />
                            in</>} {allianceTeam?.updates?.cityStateLocal ? allianceTeam?.updates?.cityStateLocal : `${allianceTeam?.city}, ${allianceTeam?.stateProv}`}{allianceTeam?.country !== "USA" ? `, ${allianceTeam?.country}` : ""}<br /></span>}
                        {allianceMode === "accept" && <span className={"allianceAnnounceDialog"}>Team {allianceTeam?.teamNumber} {allianceTeam?.updates?.nameShortLocal ? allianceTeam?.updates?.nameShortLocal : allianceTeam?.nameShort}<br />
                            has been asked to join Alliance {allianceSelectionOrder[asArrays.nextChoice]?.number}.<br />Do they accept?</span>}
                        {allianceMode === "decline" && <span className={"allianceAnnounceDialog"}>Team {allianceTeam?.teamNumber} {allianceTeam?.updates?.nameShortLocal ? allianceTeam?.updates?.nameShortLocal : allianceTeam?.nameShort}<br />
                            has declined the offer from Alliance {allianceSelectionOrder[asArrays?.nextChoice]?.number}.<br />They will become inelegible to be selected by another team or to continue as a backup team in the playoffs. Do they decline?</span>}
                        {allianceMode === "declined" && <span className={"allianceAnnounceDialog"}>Team {allianceTeam?.teamNumber} {allianceTeam?.updates?.nameShortLocal ? allianceTeam?.updates?.nameShortLocal : allianceTeam?.nameShort}<br />
                            has previously declined an offer. They are inelegible to be selected by another alliance.</span>}
                        {allianceMode === "a1captain" && <span className={"allianceAnnounceDialog"}><br />Team {allianceTeam?.teamNumber} is our top seeded Alliance. They are inelegible to be selected by another alliance.</span>}
                        {allianceMode === "captain" && <span className={"allianceAnnounceDialog"}>Team {allianceTeam?.teamNumber} {allianceTeam?.updates?.nameShortLocal ? allianceTeam?.updates?.nameShortLocal : allianceTeam?.nameShort}<br />
                            is an Alliance Captain. They are inelegible to be selected by another alliance.</span>}

                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" size="sm" onClick={handleClose}>
                            {allianceMode === "show" && <span> <TrophyFill /> Alliance Announce</span>}
                            {allianceMode === "a1captain" && <span> <TrophyFill /> Top Seeded Alliance</span>}
                            {allianceMode === "captain" && <span> <TrophyFill /> Alliance Captain</span>}
                            {allianceMode === "declined" && <span> <TrophyFill /> Sorry</span>}
                            {(allianceMode === "decline" || allianceMode === "accept") && <span><TrophyFill /> Oops, they reconsidered.</span>}
                        </Button>
                        {(allianceMode === "show" || allianceMode === "decline") && <Button variant="danger" size="sm" onClick={(e) => { handleDecline(allianceTeam, allianceMode === "decline" ? "confirm" : "decline", e) }}>
                            <HandThumbsDownFill /> Respectfully Decline
                        </Button>}
                        {(allianceMode === "show" || allianceMode === "accept") && <Button variant="success" size="sm" onClick={(e) => { handleAccept(allianceTeam, allianceMode === "accept" ? "confirm" : "accept", e) }}>
                            <HandThumbsUpFill /> Gratefully Accept
                        </Button>}
                    </Modal.Footer>
                </Modal>}
            </Container>
        </>
    )
}

export default AllianceSelection