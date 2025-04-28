import { useState } from "react";
import { Alert, Button, Col, Container, Form, InputGroup, Modal, Row } from "react-bootstrap";
import _ from "lodash";
import { HandThumbsDownFill, HandThumbsUpFill, TrophyFill, XSquare } from "react-bootstrap-icons";
import { useHotkeysContext, useHotkeys } from "react-hotkeys-hook";
import { useEffect } from "react";
import { originalAndSustaining, allianceSelectionBaseRounds } from "./Constants";
import useWindowDimensions from "hooks/UseWindowDimensions";

function AllianceSelection({ selectedYear, selectedEvent, rankings, teamList, allianceCount, communityUpdates, allianceSelectionArrays, setAllianceSelectionArrays, handleReset, teamFilter, setTeamFilter }) {
    const OriginalAndSustaining = _.cloneDeep(originalAndSustaining);
    const AllianceSelectionBaseRounds = _.cloneDeep(allianceSelectionBaseRounds);

    const [show, setShow] = useState(false);
    const [allianceTeam, setAllianceTeam] = useState(null);
    const [allianceMode, setAllianceMode] = useState(null);
    const { disableScope, enableScope } = useHotkeysContext();
    const { width } = useWindowDimensions();


    var availColumns = [[], [], [], [], []];
    var allianceSelectionRounds = ["round1", "round2"]
    var backupTeams = [];
    var alliances = null;
    var allianceDisplayOrder = [];
    var asArrays = {
        "alliances": [],
        "allianceCount": -1,
        "rankedTeams": [],
        "availableTeams": [],
        "nextChoice": 0,
        "undo": [],
        "declined": [],
        "skipped": [],
        "rounds": {},
    };

    const inChamps =
        selectedEvent?.value?.champLevel === "CHAMPS" ||
            selectedEvent?.value?.champLevel === "CMPDIV" ||
            selectedEvent?.value?.champLevel === "CMPSUB"
            ? true
            : false;

    var allianceSelectionOrder = [];
    var allianceSelectionOrderRounds = { round1: [], round2: [] };

    if (inChamps) {
        allianceSelectionOrderRounds.round3 = [];
        allianceSelectionRounds.push("round3");
    };

    allianceSelectionRounds.forEach((round, index) => {
        AllianceSelectionBaseRounds[round].forEach((alliance) => {
            if (alliance <= allianceCount?.count) {
                allianceSelectionOrderRounds[round].push({ number: alliance, round: index + 1 });
            }
        })
    })

    allianceSelectionRounds.forEach((round) => {
        allianceSelectionOrder = _.concat(allianceSelectionOrder, allianceSelectionOrderRounds[round]);
    })

    var sortedTeams = _.orderBy(rankings?.ranks, "teamNumber", "asc");

    if (allianceCount?.count <= 4) {
        allianceDisplayOrder = [[1, 4], [2, 3]]
    } else if (allianceCount?.count <= 6) {
        allianceDisplayOrder = [[1, 6], [2, 5], [3, 4]]
    } else { allianceDisplayOrder = [[1, 8], [2, 7], [3, 6], [4, 5]] }

    const resetFilter = () => {
        // @ts-ignore
        document.getElementById("filterControl").value = "";
        setTeamFilter("")
    }

    const handleClose = () => {
        setAllianceTeam(null);
        setAllianceMode("");
        setShow(false);
        disableScope("allianceAccept");
        disableScope("allianceDecline");
        disableScope("allianceSkip");
        enableScope('tabNavigation');
    }

    const handleShow = (team, mode, e) => {
        setAllianceTeam(team);
        setAllianceMode(mode || "show");
        setShow(true);
        enableScope("allianceAccept");
        enableScope("allianceDecline");
        enableScope("allianceSkip");
        disableScope('tabNavigation');
    }

    const handleAccept = (team, mode, e) => {
        if (mode === "accept") {
            setAllianceTeam(team);
            setAllianceMode("accept");
            enableScope("allianceAccept");
            disableScope("allianceDecline");
            disableScope("allianceSkip");
            setShow(true);
        }
        if (mode === "confirm") {
            const round = asArrays.allianceSelectionOrder[asArrays.nextChoice]?.round;
            var undo = _.cloneDeep(asArrays);
            delete undo.undo;
            // Save the prior state
            asArrays.undo.push(undo);

            // Remove the selected team from the available and ranked teams
            const availableIndex = _.findIndex(asArrays.availableTeams, { "teamNumber": team.teamNumber });
            if (availableIndex >= 0) { asArrays.availableTeams.splice(availableIndex, 1); }
            const rankedIndex = _.findIndex(asArrays.rankedTeams, { "teamNumber": team.teamNumber });
            if (rankedIndex >= 0) { asArrays.rankedTeams.splice(rankedIndex, 1); }

            // Add the team to the alliance
            const choosingAlliance = asArrays.alliances[_.findIndex(asArrays.alliances, { "number": asArrays.allianceSelectionOrder[asArrays.nextChoice]?.number })];
            if (round) { choosingAlliance[`round${round}`] = team; }

            // remove the captain from the skipped teams list
            const teamSkipped = _.findIndex(asArrays.skipped, { teamNumber: choosingAlliance?.captain?.teamNumber });
            if (teamSkipped >= 0) {
                asArrays.skipped.splice(teamSkipped, 1);
            }

            // check to see if they are an alliance captain. If so, remove them from their prior alliance and do the promotions from the backup list
            if (asArrays.nextChoice < asArrays.rounds["round1"].length) {
                var isAllianceCaptain = _.findIndex(asArrays.alliances, { "captain": team }) + 1;
                if (isAllianceCaptain >= 1) {
                    for (var topAlliance = isAllianceCaptain; topAlliance <= allianceCount?.count; topAlliance++) {
                        asArrays.alliances[_.findIndex(asArrays.alliances, { "number": topAlliance })][`captain`] = asArrays.rankedTeams[topAlliance - 1];
                    }
                    // var currentCaptain = asArrays.alliances[_.findIndex(asArrays.alliances, { "number": asArrays.allianceSelectionOrder[asArrays.nextChoice].number })].captain.teamNumber;
                    // asArrays.availableTeams.splice(_.findIndex(asArrays.availableTeams, { "teamNumber": currentCaptain }), 1);
                }
            }

            if (asArrays.nextChoice < asArrays.allianceSelectionOrder.length) {
                asArrays.nextChoice += 1;
                const nextCaptain = asArrays.alliances[_.findIndex(asArrays.alliances, { "number": asArrays.allianceSelectionOrder[asArrays.nextChoice]?.number })]?.captain.teamNumber;
                const captainIndex = _.findIndex(asArrays.availableTeams, { "teamNumber": nextCaptain })
                if (captainIndex >= 0) { asArrays.availableTeams.splice(captainIndex, 1); }

            }

            setAllianceSelectionArrays(asArrays);
            enableScope("undo");
            handleClose();
        }

    }

    const handleDecline = (team, mode, e) => {
        if (mode === "decline") {
            setAllianceTeam(team);
            setAllianceMode("decline");
            disableScope('allianceAccept');
            disableScope("allianceSkip");
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

    const handleSkip = (team, mode, e) => {
        if (mode === "skip") {
            setAllianceTeam(team);
            setAllianceMode("skip");
            disableScope('allianceAccept');
            disableScope('allianceDecline');
            setShow(true);
        }
        if (mode === "confirm") {
            const round = asArrays.allianceSelectionOrder[asArrays.nextChoice].round;
            var undo = _.cloneDeep(asArrays);

            delete undo.undo;
            asArrays.undo.push(undo);
            //if team is on the list, move them to the bottom of the list.
            const teamSkipped = _.findIndex(asArrays.skipped, { teamNumber: team.teamNumber });
            if (teamSkipped >= 0) {
                asArrays.skipped.splice(teamSkipped, 1);
            }
            asArrays.skipped.push({ ...team, round: round });
            //skip the team and rebuild allianceSelectionOrder
            // asArrays.rounds[`round${asArrays.allianceSelectionOrder[asArrays.nextChoice].round}`].push(asArrays.allianceSelectionOrder[asArrays.nextChoice]);

            let roundReducer;
            switch (round) {
                case 2:
                    roundReducer = asArrays.rounds[`round1`].length;
                    break;
                case 3:
                    roundReducer = asArrays.rounds[`round1`].length + asArrays.rounds[`round2`].length;
                    break;
                default:
                    roundReducer = 0;
            }
            let insertionPoint = asArrays.rounds[`round${round}`].length > asArrays.nextChoice - roundReducer ? asArrays.nextChoice + 2 - roundReducer : asArrays.nextChoice + 1 - roundReducer;

            asArrays.rounds[`round${round}`].splice(insertionPoint, 0, asArrays.allianceSelectionOrder[asArrays.nextChoice]);
            asArrays.allianceSelectionOrder = [];
            _.keys(asArrays.rounds).forEach((_round) => {
                asArrays.allianceSelectionOrder = _.concat(asArrays.allianceSelectionOrder, asArrays.rounds[_round]);
            })
            if (asArrays.nextChoice < asArrays.allianceSelectionOrder.length) { asArrays.nextChoice += 1; }
            const availableIndex = _.findIndex(asArrays.availableTeams, { "teamNumber": team.teamNumber });
            if (availableIndex >= 0) { asArrays.availableTeams.splice(availableIndex, 1); }
            setAllianceSelectionArrays(asArrays);

            handleClose();
        }

    }

    const handleUndo = () => {
        var undo = asArrays.undo.pop();
        asArrays.alliances = undo.alliances;
        asArrays.availableTeams = undo.availableTeams;
        asArrays.declined = undo.declined;
        asArrays.skipped = undo.skipped;
        asArrays.nextChoice = undo.nextChoice;
        asArrays.rankedTeams = undo.rankedTeams;
        setAllianceSelectionArrays(asArrays);
        if (asArrays?.undo?.length === 0) {
            disableScope("undo")
        }
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
        enableScope("allianceAccept");
        enableScope("allianceDecline");
        disableScope('tabNavigation');
        setShow(true);
    }

    const colCount = width > 1040 ? 5 :
        width > 850 ? 4 :
            3;

    useEffect(() => {
        if (teamFilter !== "") {
            enableScope("allianceFilter");
        } else {
            disableScope("allianceFilter");
        }
    }, [teamFilter, enableScope, disableScope])

    if (selectedEvent && rankings && teamList && allianceCount?.count > 0 && communityUpdates) {
        sortedTeams = sortedTeams.map((team) => {
            team = _.merge(team, teamList?.teams[_.findIndex(teamList?.teams, { "teamNumber": team?.teamNumber })]);
            team.updates = communityUpdates[_.findIndex(communityUpdates, { "teamNumber": team?.teamNumber })]?.updates || team?.updates || {}
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
        if (!allianceSelectionArrays || _.isEmpty(allianceSelectionArrays) || allianceSelectionArrays?.allianceCount !== allianceCount?.count) {
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
            asArrays.allianceCount = allianceCount?.count;
            asArrays.rankedTeams = _.orderBy(sortedTeams, ["rank", "asc"]);
            asArrays.availableTeams = _.orderBy(sortedTeams.slice(1), ["teamNumber", "asc"]);
            asArrays.nextChoice = 0;
            asArrays.undo = [];
            asArrays.declined = [];
            asArrays.rounds = allianceSelectionOrderRounds;
            asArrays.allianceSelectionOrder = allianceSelectionOrder;
            setAllianceSelectionArrays(asArrays);

        } else { asArrays = _.cloneDeep(allianceSelectionArrays) }


        // pick off the top 8 remaining teams to be the backup list
        backupTeams = asArrays?.rankedTeams.slice(allianceCount?.count, allianceCount?.count + 8);


        // set up the available teams block
        var rows = asArrays.availableTeams?.length;
        if (rows > 0) {
            asArrays.availableTeams?.forEach((team, index) => {
                if (index <= 1 * rows / colCount - 1) {
                    availColumns[0].push(team);
                } else if (index <= 2 * rows / colCount - 1) {
                    availColumns[1].push(team);
                } else if (index <= 3 * rows / colCount - 1) {
                    availColumns[2].push(team);
                } else if (index <= 4 * rows / colCount - 1) {
                    availColumns[3].push(team);
                } else {
                    availColumns[4].push(team);
                }
            })
        }

        //set up the Alliances
        alliances = asArrays.alliances;
    }

    useHotkeys('return', () => document.getElementById("acceptButton")?.click(), { scopes: 'allianceAccept' });
    useHotkeys('d', () => document.getElementById("declineButton")?.click(), { scopes: 'allianceDecline' });
    useHotkeys('s', () => document.getElementById("skipButton")?.click(), { scopes: 'allianceSkip' });
    useHotkeys('meta+z, ctrl+z', () => document.getElementById("undoButton")?.click(), { scopes: 'undo' });
    useHotkeys('esc', () => document.getElementById("resetFilter")?.click(), { scopes: 'allianceFilter' });
    const currentRound = asArrays.allianceSelectionOrder[asArrays.nextChoice]?.round || -1;
    const availCell = (team) => {
        const currentRound = asArrays.allianceSelectionOrder[asArrays.nextChoice]?.round || -1;
        const declined = asArrays?.declined.includes(team?.teamNumber);
        const skipped = _.findIndex(_.filter(asArrays?.skipped, { round: currentRound }), { teamNumber: team?.teamNumber }) >= 0;
        return (
            <>
                {(asArrays?.nextChoice < asArrays.allianceSelectionOrder?.length && team.rank !== 1 && !skipped) &&
                    (String(team?.teamNumber).startsWith(teamFilter) || teamFilter === "") && <div key={"availableButton" + team?.teamNumber} className={declined ? "availableTeam allianceDecline" : skipped ? "availableTeam allianceTeam allianceSkip" : "availableTeam allianceTeam"} onClick={(e) => handleShow(team, declined ? "declined" : "show", e)}><b>{team.teamNumber}</b></div>}

                {(asArrays?.nextChoice >= asArrays.allianceSelectionOrder?.length || team.rank === 1 || skipped) &&
                    (String(team?.teamNumber).startsWith(teamFilter) || teamFilter === "") && <div key={"availableButtonDisabled" + team?.teamNumber} className={declined ? "availableTeam allianceDecline" : skipped ? "availableTeam allianceTeam allianceSkip" : "availableTeam allianceTeam"} ><b>{team?.teamNumber}</b></div>}
            </>
        )
    }
    return (
        <>
            <Container fluid>
                {selectedEvent && rankings?.ranks?.length > 0 && teamList?.teams?.length > 0 && allianceCount && allianceCount?.count === -1 && <Alert style={{ fontSize: "24px" }}>Please set an alliance count on the Setup Screen.</Alert>}
                {selectedEvent && rankings?.ranks?.length > 0 && teamList?.teams?.length > 0 && allianceCount && allianceCount?.count > 0 &&
                    <>
                        <Row><br />
                        </Row>
                        <Row>
                            <Form onSubmit={handleFilterSelect}>
                                <InputGroup className="mb-3" >
                                    <InputGroup.Text>Filter the teams</InputGroup.Text>
                                    <Form.Control id={"filterControl"} type="number" placeholder="Enter a number" aria-label="Team Number" onChange={filterTeams} style={{ minWidth: "100px" }} />
                                    <InputGroup.Text id="resetFilter" onClick={resetFilter}><XSquare /></InputGroup.Text>
                                    {(_.filter(asArrays?.availableTeams, { 'teamNumber': Number(teamFilter) }).length === 1) && <Button variant="primary" type="submit">Select this team</Button>}
                                    <span>    </span>
                                    {(asArrays?.undo?.length > 0) && <Button id="undoButton" size="sm" onClick={handleUndo} active >Undo Previous Choice</Button>}
                                    {(asArrays?.undo?.length === 0) && <Button size="sm" onClick={handleUndo} disabled >Undo Previous Choice</Button>}
                                    <span>    </span><Button size="sm" variant="warning" onClick={handleReset} active>Restart Alliance Selection</Button>
                                </InputGroup>
                            </Form>
                        </Row>
                        <Row>
                            <Container fluid>
                                <Row>
                                    <Col xs={width < 600 ? 12 : inChamps ? 4 : 5}>
                                        <Container fluid className="allianceContainer">
                                            <Row>
                                                <Col><strong>Teams for Alliance Selection</strong></Col>
                                            </Row>
                                            <Row key={"AvailableTeams"} >
                                                {availColumns.map((column, index) => {
                                                    return index < colCount ? (
                                                        <Col key={`availableColumn${index}`}>
                                                            {column.map((team) => {
                                                                return availCell(team)
                                                            })}
                                                        </Col>
                                                    ) : null
                                                })}
                                            </Row>

                                        </Container>
                                    </Col>
                                    {width >= 600 && <Col xs={2} >
                                        <Container fluid className={"backupAlliancesTable"}>
                                            <Row>
                                                <Col>
                                                    <p><strong>Backup Teams</strong><br />(Teams here are initially ranked {allianceCount?.count + 1} to {allianceCount?.count + 8} top to bottom. As Alliance Selection progresses, teams will rise up into this section as teams are selected.)</p>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col id="backupTeamsDisplay">
                                                    {backupTeams.map((team) => {
                                                        var declined = asArrays.declined.includes(team.teamNumber);
                                                        return (
                                                            <>{(asArrays?.nextChoice < asArrays.allianceSelectionOrder?.length) &&
                                                                <div key={"backupButton" + team?.teamNumber} className={declined ? "allianceDecline" : "allianceTeam"} onClick={(e) => handleShow(team, declined ? "declined" : "show", e)}><b>{team?.teamNumber}</b></div>}
                                                                {(asArrays?.nextChoice >= asArrays.allianceSelectionOrder?.length) &&
                                                                    <div key={"backupButtonDisabled" + team?.teamNumber} className={declined ? "allianceDecline" : "allianceTeam"} ><b>{team.teamNumber}</b></div>}
                                                            </>
                                                        )
                                                    })}
                                                </Col>
                                            </Row>
                                        </Container>

                                        {asArrays?.skipped && asArrays.skipped.length > 0 &&
                                            <Container fluid className={"skippedAlliancesTable"}>
                                                <Row>
                                                    <Col>
                                                        <p><strong>Skipped Teams</strong><br />(Skipped Alliance Captains will have the opportunity to select a partner after the next successful selection or skip.)</p>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col id="skippedTeamsDisplay">
                                                        {asArrays?.skipped.map((team) => {
                                                            var declined = asArrays.declined.includes(team.teamNumber);
                                                            return (
                                                                <>{(asArrays?.nextChoice < asArrays.allianceSelectionOrder?.length) &&
                                                                    <div key={"skipButton" + team?.teamNumber} className={declined ? "allianceDecline" : "allianceTeam allianceSkip allianceTeamChoice"} ><b>{team?.teamNumber}</b></div>}
                                                                </>
                                                            )
                                                        })}
                                                    </Col>
                                                </Row>
                                            </Container>}
                                    </Col>}
                                    <Col xs={width < 600 ? 12 : inChamps ? 6 : 5}>
                                        <Row className={"alliancesTeamsTable alliancesTeamsTableHeader"}>{currentRound >= 0 ? `Round ${currentRound} of ${inChamps ? "3" : "2"}` : asArrays?.nextChoice > 0 ? "Alliance Selection Complete" : "Alliance Selection not started"}</Row>
                                        <Container fluid className={"alliancesTeamsTable"}>
                                            {allianceDisplayOrder.map((row) => {

                                                return (
                                                    <Col xs={12} id="allianceTeamsDisplay">

                                                        <Row key={`allianceDisplay${row[0]}`} >
                                                            {row.map((allianceNumber) => {

                                                                const alliance = _.filter(alliances, { "number": allianceNumber })
                                                                const allianceName = alliance[0]?.name;
                                                                const fullAlliance = inChamps ? alliance[0]?.round3 : alliance[0]?.round2;
                                                                var captain = alliance[0]?.captain;
                                                                if (captain) {
                                                                    captain.declined = asArrays?.declined?.includes(captain?.teamNumber);
                                                                    captain.skipped = _.findIndex(_.filter(asArrays?.skipped, { round: currentRound }), { teamNumber: captain?.teamNumber }) >= 0;
                                                                    captain.hasFirstPick = alliance[0]?.round1 ? true : false;
                                                                    captain.mode = allianceNumber === 1 ? "a1captain" : allianceNumber === asArrays.allianceSelectionOrder[asArrays.nextChoice]?.number ? "captain" : captain?.declined ? "declined" : captain?.skipped ? "skip" : "show"
                                                                }
                                                                var round1 = alliance[0]?.round1;
                                                                if (round1) {
                                                                    round1.declined = asArrays?.declined?.includes(round1?.teamNumber);
                                                                }
                                                                var round2 = alliance[0]?.round2;
                                                                if (round2) {
                                                                    round2.declined = asArrays?.declined?.includes(round2?.teamNumber);
                                                                }
                                                                var round3 = alliance[0]?.round3;
                                                                if (round3) {
                                                                    round3.declined = asArrays?.declined?.includes(round3?.teamNumber);
                                                                }
                                                                return (
                                                                    (allianceNumber <= allianceCount?.count) ?
                                                                        <Col xs={6} className={fullAlliance ? "fullAlliance" : "unfullAlliance"}>
                                                                            <Container fluid className={asArrays.allianceSelectionOrder[asArrays?.nextChoice]?.number === allianceNumber ? "alliance dropzone" : "alliance"} key={`AllianceTable${allianceName}`}>
                                                                                <Row>
                                                                                    <Col xs={12}><b>{allianceName}</b></Col>
                                                                                </Row>

                                                                                {((allianceNumber > asArrays.allianceSelectionOrder[asArrays?.nextChoice]?.number && !captain?.hasFirstPick) || (allianceNumber === asArrays.allianceSelectionOrder[asArrays?.nextChoice]?.number)) &&
                                                                                    //Captain is available
                                                                                    <Row>
                                                                                        <Col xs={12} className={"alliancedrop allianceCaptain"} >
                                                                                            <div><b>Captain</b></div>
                                                                                            <div key={`${allianceName}captainAvailable`}
                                                                                                className={captain?.declined ? "captainDecline allianceTeamChoice" : captain?.skipped ? "allianceTeam allianceSkip allianceTeamChoice" : round1?.teamNumber ? "allianceTeam allianceTeamChosen" : "allianceTeam allianceTeamChoice"}
                                                                                                onClick={(e) => handleShow(captain, captain.mode, e)}>
                                                                                                {captain?.teamNumber ? <b>{captain?.teamNumber}</b> : <div>TBD</div>}
                                                                                            </div>
                                                                                        </Col>
                                                                                    </Row>}

                                                                                {((allianceNumber < asArrays.allianceSelectionOrder[asArrays?.nextChoice]?.number) || (asArrays.allianceSelectionOrder[asArrays?.nextChoice]?.round > 1 && allianceNumber !== asArrays.allianceSelectionOrder[asArrays?.nextChoice]?.number) || asArrays?.nextChoice === asArrays.allianceSelectionOrder.length || (allianceNumber > asArrays.allianceSelectionOrder[asArrays?.nextChoice]?.number && captain?.hasFirstPick)) &&
                                                                                    //Captain is unavailable for picking
                                                                                    <Row>
                                                                                        <Col xs={12} className={"alliancedrop allianceCaptain"} >
                                                                                            <div><b>Captain</b></div>
                                                                                            <div key={`${allianceName}captainunavailable`}
                                                                                                className={captain?.declined ? "captainDecline allianceTeamChoice" : captain?.skipped ? "allianceTeam allianceSkip allianceTeamChoice" : round1?.teamNumber ? "allianceTeam allianceTeamChosen" : "allianceTeam allianceTeamChoice"} >
                                                                                                {captain?.teamNumber ? <b>{captain?.teamNumber}</b> : <div>TBD</div>}
                                                                                            </div>
                                                                                        </Col>
                                                                                    </Row>}

                                                                                <Row>
                                                                                    <Col xs={inChamps ? 4 : 6} className={(asArrays.allianceSelectionOrder[asArrays?.nextChoice]?.number === allianceNumber) && (asArrays.allianceSelectionOrder[asArrays?.nextChoice]?.round === 1) ? "alliancedrop nextAllianceChoice" : "alliancedrop"}>
                                                                                        <div><b>1<sup>st</sup> pick</b></div>
                                                                                        <div key={`${allianceName}round1`}
                                                                                            className={round1?.declined ? "allianceDecline allianceTeamChoice" : round1?.teamNumber ? "allianceTeam allianceTeamChosen" : "allianceTeam allianceTeamChoice"}>{round1?.teamNumber ? <b>{round1?.teamNumber}</b> : <b>TBD</b>}
                                                                                        </div>
                                                                                    </Col>

                                                                                    <Col xs={inChamps ? 4 : 6} className={(asArrays.allianceSelectionOrder[asArrays?.nextChoice]?.number === allianceNumber) && (asArrays.allianceSelectionOrder[asArrays?.nextChoice]?.round === 2) ? "alliancedrop nextAllianceChoice" : "alliancedrop"}>
                                                                                        <div><b>2<sup>nd</sup> pick</b></div>
                                                                                        <div key={`${allianceName}round2`}
                                                                                            className={round2?.declined ? "allianceDecline allianceTeamChoice" : round2?.teamNumber ? "allianceTeam allianceTeamChosen" : "allianceTeam allianceTeamChoice"}>{round2?.teamNumber ? <b>{round2?.teamNumber}</b> : <b>TBD</b>}
                                                                                        </div>
                                                                                    </Col>


                                                                                    {inChamps &&
                                                                                        <Col xs={inChamps ? 4 : 6} className={(asArrays.allianceSelectionOrder[asArrays?.nextChoice]?.number === allianceNumber) && (asArrays.allianceSelectionOrder[asArrays?.nextChoice]?.round === 3) ? "alliancedrop nextAllianceChoice" : "alliancedrop"}>
                                                                                            <div><b>3<sup>rd</sup> pick</b></div>
                                                                                            <div key={`${allianceName}round3`}
                                                                                                className={round3?.declined ? "allianceDecline allianceTeamChoice" : round3?.teamNumber ? "allianceTeam allianceTeamChosen" : "allianceTeam allianceTeamChoice"}>{round3?.teamNumber ? <b>{round3?.teamNumber}</b> : <b>TBD</b>}
                                                                                            </div>
                                                                                        </Col>}
                                                                                </Row>

                                                                            </Container>
                                                                        </Col>
                                                                        : <Col xs={6}></Col>
                                                                )
                                                            })}

                                                        </Row>
                                                    </Col>
                                                )
                                            })}

                                        </Container>
                                    </Col>
                                    {width < 600 && <Col xs={12} >
                                        <Container fluid className={"backupAlliancesTable"}>
                                            <Row>
                                                <Col>
                                                    <p><strong>Backup Teams</strong><br />(Teams here are initially ranked {allianceCount?.count + 1} to {allianceCount?.count + 8} top to bottom. As Alliance Selection progresses, teams will rise up into this section as teams are selected.)</p>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col id="backupTeamsDisplay">
                                                    {backupTeams.map((team) => {
                                                        var declined = asArrays.declined.includes(team.teamNumber);
                                                        return (
                                                            <>{(asArrays?.nextChoice < asArrays.allianceSelectionOrder?.length) &&
                                                                <div key={"backupButton" + team?.teamNumber} className={declined ? "allianceDecline" : "allianceTeam"} onClick={(e) => handleShow(team, declined ? "declined" : "show", e)}><b>{team?.teamNumber}</b></div>}
                                                                {(asArrays?.nextChoice >= asArrays.allianceSelectionOrder?.length) &&
                                                                    <div key={"backupButtonDisabled" + team?.teamNumber} className={declined ? "allianceDecline" : "allianceTeam"} ><b>{team.teamNumber}</b></div>}
                                                            </>
                                                        )
                                                    })}
                                                </Col>
                                            </Row>
                                        </Container>

                                        {asArrays?.skipped && asArrays.skipped.length > 0 &&
                                            <Container fluid className={"skippedAlliancesTable"}>
                                                <Row>
                                                    <Col>
                                                        <p><strong>Skipped Teams</strong><br />(Skipped Alliance Captains will have the opportunity to select a partner after the next successful selection or skip.)</p>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col id="skippedTeamsDisplay">
                                                        {asArrays?.skipped.map((team) => {
                                                            var declined = asArrays.declined.includes(team.teamNumber);
                                                            return (
                                                                <>{(asArrays?.nextChoice < asArrays.allianceSelectionOrder?.length) &&
                                                                    <div key={"skipButton" + team?.teamNumber} className={declined ? "allianceDecline" : "allianceTeam allianceSkip allianceTeamChoice"} ><b>{team?.teamNumber}</b></div>}
                                                                </>
                                                            )
                                                        })}
                                                    </Col>
                                                </Row>
                                            </Container>}
                                    </Col>}
                                </Row>

                            </Container>
                        </Row>
                        <Row><br /><br />
                        </Row>
                    </>
                }
                {allianceTeam && <Modal centered={true} show={show} onHide={handleClose}>
                    <Modal.Header className={allianceMode === "decline" ? "allianceSelectionDecline" : "allianceChoice"} closeVariant={"white"} closeButton>
                        <Modal.Title >{allianceMode === "decline" ? "Team declines the offer" : allianceMode === "skip" ? "Skip Alliance" : allianceMode === "accept" ? "Are you sure they want to accept?" : allianceMode === "a1captain" ? "Top Seeded Alliance" : "Alliance Choice"}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {(allianceMode === "show" || allianceMode === "a1captain" || allianceMode === "captain") && <span className={"allianceAnnounceDialog"}>Team {allianceTeam?.teamNumber} {allianceTeam?.updates?.nameShortLocal ? allianceTeam?.updates.nameShortLocal : allianceTeam?.nameShort}<br />
                            is {allianceTeam?.updates?.awardsTextLocal ? allianceTeam?.updates?.awardsTextLocal : <>{(OriginalAndSustaining.indexOf(String(allianceTeam?.teamNumber)) >= 0) ? "an Original and Sustaining Team " : ""}from<br />
                                {allianceTeam?.updates?.organizationLocal ? allianceTeam?.updates?.organizationLocal : allianceTeam?.organization}<br />
                                in</>} {allianceTeam?.updates?.cityStateLocal ? allianceTeam?.updates?.cityStateLocal : `${allianceTeam?.city}, ${allianceTeam?.stateProv}`}{allianceTeam?.country !== "USA" ? `, ${allianceTeam?.country}` : ""}<br /></span>}
                        {allianceMode === "accept" && <span className={"allianceAnnounceDialog"}>Team {allianceTeam?.teamNumber} {allianceTeam?.updates?.nameShortLocal ? allianceTeam?.updates?.nameShortLocal : allianceTeam?.nameShort}<br />
                            has been asked to join Alliance {asArrays.allianceSelectionOrder[asArrays.nextChoice]?.number}.<br />Do they accept?</span>}
                        {allianceMode === "decline" && <span className={"allianceAnnounceDialog"}>Team {allianceTeam?.teamNumber} {allianceTeam?.updates?.nameShortLocal ? allianceTeam?.updates?.nameShortLocal : allianceTeam?.nameShort}<br />
                            has declined the offer from Alliance {asArrays.allianceSelectionOrder[asArrays?.nextChoice]?.number}.<br />They will become inelegible to be selected by another team or to continue as a backup team in the playoffs. Do they decline?</span>}
                        {allianceMode === "declined" && <span className={"allianceAnnounceDialog"}>Team {allianceTeam?.teamNumber} {allianceTeam?.updates?.nameShortLocal ? allianceTeam?.updates?.nameShortLocal : allianceTeam?.nameShort}<br />
                            has previously declined an offer. They are inelegible to be selected by another alliance.</span>}
                        {allianceMode === "a1captain" && <span className={"allianceAnnounceDialog"}><br />Team {allianceTeam?.teamNumber} is our top seeded Alliance. They are inelegible to be selected by another alliance.</span>}
                        {/* {allianceMode === "captain" && <span className={"allianceAnnounceDialog"}>Team {allianceTeam?.teamNumber} {allianceTeam?.updates?.nameShortLocal ? allianceTeam?.updates?.nameShortLocal : allianceTeam?.nameShort}<br />
                            is an Alliance Captain. They are inelegible to be selected by another alliance.</span>} */}
                        {allianceMode === "skip" && <span className={"allianceAnnounceDialog"}>Team {allianceTeam?.teamNumber} {allianceTeam?.updates?.nameShortLocal ? allianceTeam?.updates?.nameShortLocal : allianceTeam?.nameShort}<br />
                            has missed their time window for selecting an Alliance partner.</span>}

                    </Modal.Body>
                    <Modal.Footer>
                                <Button variant="primary" size="sm" onClick={handleClose} style={{ marginBottom: "10px" }}>
                                    {allianceMode === "show" && <span> <TrophyFill /> Alliance Announce</span>}
                                    {allianceMode === "a1captain" && <span> <TrophyFill /> Top Seeded Alliance</span>}
                                    {allianceMode === "captain" && <span> <TrophyFill /> Alliance Captain</span>}
                                    {allianceMode === "declined" && <span> <TrophyFill /> Sorry</span>}
                                    {(allianceMode === "decline" || allianceMode === "accept" || allianceMode === "skip") && <span><TrophyFill /> Oops, they reconsidered.</span>}
                                </Button>
                            
                            {(allianceMode === "show" || allianceMode === "decline") &&
                                <Button id="declineButton" variant="danger" size="sm" style={{ marginBottom: "10px" }} onClick={(e) => { handleDecline(allianceTeam, allianceMode === "decline" ? "confirm" : "decline", e) }}>
                                    <HandThumbsDownFill /> Respectfully Decline
                                </Button>
                                }
                            {(allianceMode === "show" || allianceMode === "accept") &&
                                
                                    <Button id="acceptButton" variant="success" size="sm" style={{ marginBottom: "10px" }} onClick={(e) => { handleAccept(allianceTeam, allianceMode === "accept" ? "confirm" : "accept", e) }}>
                                        <HandThumbsUpFill /> Gratefully Accept
                                    </Button>
                                }
                            {(allianceMode === "a1captain" || allianceMode === "captain" || allianceMode === "skip") &&
                                
                                    <Button id="skipButton" variant="warning" size="sm" style={{
                                        marginBottom: "10px"
                                    }} onClick={(e) => { handleSkip(allianceTeam, allianceMode === "skip" ? "confirm" : "skip", e) }}>
                                        <HandThumbsUpFill /> Skip Alliance
                                    </Button>
                                }
                        
                    </Modal.Footer>
                </Modal>}
            </Container>
        </>
    )
}

export default AllianceSelection