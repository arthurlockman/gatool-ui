import { useState } from "react";
import { Button, Container, Modal } from "react-bootstrap";
import _ from "lodash";
import { HandThumbsDownFill, HandThumbsUpFill, TrophyFill } from "react-bootstrap-icons";

function AllianceSelection({ selectedYear, selectedEvent, rankings, teamList, allianceCount, communityUpdates }) {

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

    var allianceSelectionOrder = [];
    allianceSelectionOrderBase.forEach((alliance) => {
        if (alliance.number <= allianceCount?.count) {
            allianceSelectionOrder.push(alliance);
        }
    })

    var allianceDisplayOrder = [];
    if (allianceCount.count <= 4) {
        allianceDisplayOrder = [[1, 4], [2, 3]]
    } else if (allianceCount.count <= 6) {
        allianceDisplayOrder = [[1, 6], [2, 5], [3, 4]]
    } else { allianceDisplayOrder = [[1, 8], [2, 7], [3, 6], [4, 5]] }

    const [show, setShow] = useState(false);
    const [allianceTeam, setAllianceTeam] = useState(false);
    const [allianceSelectionArrays, setAllianceSelectionArrays] = useState({});
    const [allianceMode, setAllianceMode] = useState(null);

    const handleClose = () => {
        setAllianceTeam(null);
        setAllianceMode("");
        setShow(false);
    }

    const handleShow = (team, mode, e) => {
        setAllianceTeam(team);
        setAllianceMode("show");
        setShow(true);
    }
    const handleAccept = (team, mode, e) => {
        if (mode === "accept") {
            setAllianceTeam(team);
            setAllianceMode("accept");
            setShow(true);
        }
        if (mode === "confirm") {
            console.log("confirm Accept");
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
            console.log("confirm Decline");
            handleClose();
        }

    }

    var availColumns = [[], [], [], [], []];
    var backupTeams = [];
    var alliances = {};




    allianceSelectionOrder = allianceSelectionOrder.slice(0, allianceCount?.allianceSelectionLength + 1);

    var sortedTeams = _.orderBy(rankings?.ranks, "teamNumber", "asc");
    var asArrays = {};

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

        } else { asArrays = allianceSelectionArrays }


        // pick off the top 8 remaining teams to be the backup list
        backupTeams = _.clone(asArrays?.rankedTeams).splice(allianceCount.count, 8);

        // set up the available teams block
        var rows = sortedTeams?.length;
        if (sortedTeams?.length > 0) {
            sortedTeams?.forEach((team, index) => {
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
                {selectedEvent && rankings && teamList && allianceCount &&
                    <table>
                        <tbody>
                            <tr>
                                <td>
                                    <table className="availableTeams">
                                        <tbody>
                                            <tr>
                                                <td colSpan={"5"}><strong>Teams for Alliance Selection</strong></td>
                                            </tr>
                                            <tr>
                                                {availColumns.map((column, index) => {
                                                    return (<td key={index}>
                                                        {column.map((team) => {
                                                            return (<div key={"availableButton" + team.teamNumber} className={"allianceTeam"} value={JSON.stringify(team)} onClick={(e) => handleShow(team, "show", e)}>{team.teamNumber}</div>)
                                                        })}
                                                    </td>)
                                                })}
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                                <td  >
                                    <table id="backupTeamsTable" className={"backupAlliancesTable"}>
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <p><strong>Backup Alliances</strong><br />(Initially rank {allianceCount.count + 1} to {allianceCount.count + 8} top to bottom)</p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    {backupTeams.map((team) => {
                                                        return (<div key={"availableButton" + team.teamNumber} className={"allianceTeam backupAlliance"} value={JSON.stringify(team)} onClick={(e) => handleShow(team, "show", e)}>{team.teamNumber}</div>)
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
                                                            var allianceName = alliance[0].name;
                                                            var captain = alliance[0]?.captain;
                                                            var round1 = alliance[0]?.round1;
                                                            var round2 = alliance[0]?.round2;
                                                            var round3 = alliance[0]?.round3;
                                                            return (
                                                                (allianceNumber <= allianceCount.count) ? <td className={allianceSelectionOrder[asArrays.nextChoice]?.number === allianceNumber ? "dropzone" : ""} key={`AllianceTable${allianceName}`}>
                                                                    <div><b>{allianceName}</b></div>
                                                                    <div className={"alliancedrop allianceCaptain"} >Captain<div className={"allianceTeam"} onClick={(e) => handleShow(captain, "show", e)}>{captain?.teamNumber ? captain?.teamNumber : ""}</div></div>

                                                                    <div className={(allianceSelectionOrder[asArrays.nextChoice]?.number === allianceNumber) && (allianceSelectionOrder[asArrays.nextChoice]?.round === 1) ? "alliancedrop nextAllianceChoice" : "alliancedrop"}>1st choice{round1?.teamNumber ? <div className={"allianceTeam"}>{round1?.teamNumber}</div> : ""}</div>

                                                                    <div className={(allianceSelectionOrder[asArrays.nextChoice]?.number === allianceNumber) && (allianceSelectionOrder[asArrays.nextChoice]?.round === 2) ? "alliancedrop nextAllianceChoice" : "alliancedrop"}>2nd choice{round2?.teamNumber ? <div className={"allianceTeam"}>{round2?.teamNumber}</div> : ""}</div>

                                                                    <div className={(allianceSelectionOrder[asArrays.nextChoice]?.number === allianceNumber) && (allianceSelectionOrder[asArrays.nextChoice]?.round === 3) ? "alliancedrop nextAllianceChoice" : "alliancedrop"}>3rd choice{round3?.teamNumber ? <div className={"allianceTeam"}>{round3?.teamNumber}</div> : ""}</div>
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
                        </tbody></table>
                }
                {allianceTeam && <Modal centered={true} show={show} size="lg" onHide={handleClose}>
                    <Modal.Header className={allianceMode === "decline" ? "allianceDecline" : "allianceChoice"} closeVariant={"white"} closeButton>
                        <Modal.Title >{allianceMode === "decline" ? "Team declines the offer" : allianceMode === "accept" ? "Are you sure they want to accept?" : "Alliance Choice"}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {allianceMode === "show" && <span className={"allianceAnnounceDialog"}>Team {allianceTeam?.teamNumber} {allianceTeam?.updates?.nameShortLocal ? allianceTeam.updates.nameShortLocal : allianceTeam?.nameShort}<br />
                            is from<br />
                            {allianceTeam?.updates?.organizationLocal ? allianceTeam?.updates?.organizationLocal : allianceTeam?.organization}<br />
                            in {allianceTeam?.updates?.cityStateLocal ? allianceTeam?.updates?.cityStateLocal : `${allianceTeam?.city}, ${allianceTeam?.stateProv}`}{allianceTeam?.country !== "USA" ? `, ${allianceTeam?.country}` : ""}<br /></span>}
                        {allianceMode === "accept" && <span className={"allianceAnnounceDialog"}>Team {allianceTeam?.teamNumber} {allianceTeam?.updates?.nameShortLocal ? allianceTeam.updates.nameShortLocal : allianceTeam?.nameShort}<br />
                            has been asked to join Alliance {allianceSelectionOrder[asArrays.nextChoice].number}.<br />Do they accept?</span>}
                        {allianceMode === "decline" && <span className={"allianceAnnounceDialog"}>Team {allianceTeam?.teamNumber} {allianceTeam?.updates?.nameShortLocal ? allianceTeam.updates.nameShortLocal : allianceTeam?.nameShort}<br />
                            has declined the offer from Alliance {allianceSelectionOrder[asArrays.nextChoice].number}.<br />They will become inelegible to be selected by another team or to continue as a backup team in the playoffs. Do they decline?</span>}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" size="sm" onClick={handleClose}>
                            {allianceMode === "show" && <span> <TrophyFill /> Alliance Announce</span>}
                            {allianceMode !== "show" && <span><TrophyFill /> Oops, they reconsidered.</span>}
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