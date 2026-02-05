import React, { useState } from "react";
import { Alert, Button, Col, Container, Form, InputGroup, Modal, Row } from "react-bootstrap";
import _ from "lodash";
import { HandThumbsDownFill, HandThumbsUpFill, TrophyFill, XSquare } from "react-bootstrap-icons";
import { useHotkeysContext, useHotkeys } from "react-hotkeys-hook";
import { useEffect } from "react";
import { originalAndSustaining, allianceSelectionBaseRounds } from "./Constants";
import useWindowDimensions from "hooks/UseWindowDimensions";

function AllianceSelection({ selectedYear, selectedEvent, rankings, teamList, allianceCount, communityUpdates, allianceSelectionArrays, setAllianceSelectionArrays, handleReset, teamFilter, setTeamFilter, ftcMode, remapNumberToString, useFourTeamAlliances, setResetAllianceSelection }) {
    const OriginalAndSustaining = _.cloneDeep(originalAndSustaining);
    const AllianceSelectionBaseRounds = _.cloneDeep(allianceSelectionBaseRounds);

    const [show, setShow] = useState(false);
    const [allianceTeam, setAllianceTeam] = useState(null);
    const [allianceMode, setAllianceMode] = useState(null);
    const { disableScope, enableScope } = useHotkeysContext();
    const { width } = useWindowDimensions();


    var availColumns = [[], [], [], [], []];
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
        "removedTeams": [],
        "rounds": {},
    };

    const inChamps =
        selectedEvent?.value?.champLevel === "CHAMPS" ||
            selectedEvent?.value?.champLevel === "CMPDIV" ||
            selectedEvent?.value?.champLevel === "CMPSUB" ||
            useFourTeamAlliances
            ? true
            : false;

    // Determine alliance selection rounds based on mode and championship level
    var allianceSelectionRounds;
    if (ftcMode) {
        allianceSelectionRounds = inChamps ? ["round1", "round2"] : ["round1"];
    } else {
        allianceSelectionRounds = inChamps ? ["round1", "round2", "round3"] : ["round1", "round2"];
    }

    var allianceSelectionOrder = [];
    var allianceSelectionOrderRounds = ftcMode ? { round1: [] } : { round1: [], round2: [] };

    if (inChamps) {
        if (!ftcMode) {
            allianceSelectionOrderRounds.round3 = [];
        } else {
            allianceSelectionOrderRounds.round2 = [];
        }
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
    // remove non-competing teams from sortedTeams
    sortedTeams = _.filter(sortedTeams, (team) => {
        return _.findIndex(teamList?.teams, { "teamNumber": team?.teamNumber }) >= 0;
    });

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

                // Remove the captain whose turn it now is from available teams
                const nextAllianceNumber = asArrays.allianceSelectionOrder[asArrays.nextChoice]?.number;
                if (nextAllianceNumber) {
                    const nextAlliance = asArrays.alliances[_.findIndex(asArrays.alliances, { "number": nextAllianceNumber })];
                    if (nextAlliance?.captain) {
                        const captainIndex = _.findIndex(asArrays.availableTeams, { "teamNumber": nextAlliance.captain.teamNumber });
                        if (captainIndex >= 0) {
                            asArrays.availableTeams.splice(captainIndex, 1);
                        }
                    }
                }
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

            // Remove the next captain whose turn it now is from available teams
            if (asArrays.nextChoice < asArrays.allianceSelectionOrder.length) {
                const nextAllianceNumber = asArrays.allianceSelectionOrder[asArrays.nextChoice]?.number;
                if (nextAllianceNumber) {
                    const nextAlliance = asArrays.alliances[_.findIndex(asArrays.alliances, { "number": nextAllianceNumber })];
                    if (nextAlliance?.captain) {
                        const captainIndex = _.findIndex(asArrays.availableTeams, { "teamNumber": nextAlliance.captain.teamNumber });
                        if (captainIndex >= 0) {
                            asArrays.availableTeams.splice(captainIndex, 1);
                        }
                    }
                }
            }

            setAllianceSelectionArrays(asArrays);

            handleClose();
        }

    }

    const handleRemoveFromPlayoffs = (team, mode, e) => {
        if (mode === "remove") {
            setAllianceTeam(team);
            setAllianceMode("remove");
            disableScope('allianceAccept');
            disableScope('allianceDecline');
            disableScope('allianceSkip');
            setShow(true);
        }
        if (mode === "confirm") {
            var undo = _.cloneDeep(asArrays);
            delete undo.undo;
            asArrays.undo.push(undo);

            // Add team to removed teams list
            asArrays.removedTeams.push(team.teamNumber);

            // If team is rank 1 or not in available teams, add them to available teams
            const availableIndex = _.findIndex(asArrays.availableTeams, { "teamNumber": team.teamNumber });
            if (availableIndex < 0) {
                asArrays.availableTeams.push(team);
                asArrays.availableTeams = _.orderBy(asArrays.availableTeams, ["teamNumber"], ["asc"]);
            }

            // If the team is an alliance captain, promote the next team (skipping other removed teams)
            const captainIndex = _.findIndex(asArrays.alliances, { "captain": team });
            if (captainIndex >= 0) {
                // Filter out removed teams to get available teams for captain positions
                var filteredRankedTeams = _.filter(asArrays.rankedTeams, (t) => {
                    return !asArrays.removedTeams.includes(t.teamNumber);
                });

                // Promote teams in the captain positions
                for (var i = captainIndex; i < allianceCount?.count; i++) {
                    if (i < filteredRankedTeams.length) {
                        const newCaptain = filteredRankedTeams[i];
                        asArrays.alliances[i].captain = newCaptain;

                        // Alliance 1 captain is always removed from availableTeams
                        if (i === 0) {
                            const newCaptainIndex = _.findIndex(asArrays.availableTeams, { "teamNumber": newCaptain.teamNumber });
                            if (newCaptainIndex >= 0) {
                                asArrays.availableTeams.splice(newCaptainIndex, 1);
                            }
                        }
                        // For other alliances, only remove from availableTeams if they've already made their first pick
                        else if (asArrays.alliances[i].round1 !== null) {
                            const newCaptainIndex = _.findIndex(asArrays.availableTeams, { "teamNumber": newCaptain.teamNumber });
                            if (newCaptainIndex >= 0) {
                                asArrays.availableTeams.splice(newCaptainIndex, 1);
                            }
                        } else {
                            // If they haven't made their first pick, ensure they're in availableTeams
                            const newCaptainIndex = _.findIndex(asArrays.availableTeams, { "teamNumber": newCaptain.teamNumber });
                            if (newCaptainIndex < 0) {
                                asArrays.availableTeams.push(newCaptain);
                                asArrays.availableTeams = _.orderBy(asArrays.availableTeams, ["teamNumber"], ["asc"]);
                            }
                        }
                    }
                }
            }

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
        asArrays.removedTeams = undo.removedTeams || [];
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

    const colCount = !ftcMode && width > 1040 ? 5 :
        !ftcMode && width > 850 ? 4 :
            ftcMode && width > 1500 ? 5 :
                ftcMode && width > 1220 ? 4 :
                    ftcMode && width > 930 ? 3 :
                        ftcMode && width > 600 ? 2 :
                            ftcMode && width <= 600 ? 1 :
                                3;

    useEffect(() => {
        if (teamFilter !== "") {
            enableScope("allianceFilter");
        } else {
            disableScope("allianceFilter");
        }
    }, [teamFilter, enableScope, disableScope])

    // Reset alliance selection when useFourTeamAlliances changes
    useEffect(() => {
        if (allianceSelectionArrays && allianceSelectionArrays.allianceCount > 0) {
            // Check if the current stored rounds configuration matches what it should be
            const expectedRounds = inChamps
                ? (ftcMode ? ["round1", "round2"] : ["round1", "round2", "round3"])
                : (ftcMode ? ["round1"] : ["round1", "round2"]);

            const currentRounds = Object.keys(allianceSelectionArrays.rounds || {});

            // If the rounds don't match, reset the alliance selection
            if (JSON.stringify(currentRounds.sort()) !== JSON.stringify(expectedRounds.sort())) {
                console.log("Alliance configuration changed, resetting alliance selection");
                handleReset();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [useFourTeamAlliances])

    // Initialize alliance selection arrays when needed
    useEffect(() => {
        if (selectedEvent && rankings && teamList && allianceCount?.count > 0 && communityUpdates) {
            if (!allianceSelectionArrays || _.isEmpty(allianceSelectionArrays) || allianceSelectionArrays?.allianceCount !== allianceCount?.count) {
                const sortedAndRankedTeams = _.orderBy(sortedTeams, ["rank"], ["asc"]);
                const newAsArrays = {
                    alliances: [
                        {
                            "number": 1,
                            "captain": sortedAndRankedTeams[0],
                            "round1": null,
                            "round2": null,
                            "round3": null,
                            "backup": null,
                            "backupReplaced": null,
                            "name": "Alliance 1"
                        },
                        {
                            "number": 2,
                            "captain": sortedAndRankedTeams[1],
                            "round1": null,
                            "round2": null,
                            "round3": null,
                            "backup": null,
                            "backupReplaced": null,
                            "name": "Alliance 2"
                        },
                        {
                            "number": 3,
                            "captain": sortedAndRankedTeams[2],
                            "round1": null,
                            "round2": null,
                            "round3": null,
                            "backup": null,
                            "backupReplaced": null,
                            "name": "Alliance 3"
                        },
                        {
                            "number": 4,
                            "captain": sortedAndRankedTeams[3],
                            "round1": null,
                            "round2": null,
                            "round3": null,
                            "backup": null,
                            "backupReplaced": null,
                            "name": "Alliance 4"
                        },
                        {
                            "number": 5,
                            "captain": 5 <= allianceCount?.count ? sortedAndRankedTeams[4] : null,
                            "round1": null,
                            "round2": null,
                            "round3": null,
                            "backup": null,
                            "backupReplaced": null,
                            "name": "Alliance 5"
                        },
                        {
                            "number": 6,
                            "captain": 6 <= allianceCount?.count ? sortedAndRankedTeams[5] : null,
                            "round1": null,
                            "round2": null,
                            "round3": null,
                            "backup": null,
                            "backupReplaced": null,
                            "name": "Alliance 6"
                        },
                        {
                            "number": 7,
                            "captain": 7 <= allianceCount?.count ? sortedAndRankedTeams[6] : null,
                            "round1": null,
                            "round2": null,
                            "round3": null,
                            "backup": null,
                            "backupReplaced": null,
                            "name": "Alliance 7"
                        },
                        {
                            "number": 8,
                            "captain": 8 <= allianceCount?.count ? sortedAndRankedTeams[7] : null,
                            "round1": null,
                            "round2": null,
                            "round3": null,
                            "backup": null,
                            "backupReplaced": null,
                            "name": "Alliance 8"
                        }
                    ],
                    allianceCount: allianceCount?.count,
                    rankedTeams: _.orderBy(sortedAndRankedTeams, ["rank", "asc"]),
                    availableTeams: _.orderBy(sortedAndRankedTeams, ["teamNumber", "asc"]),
                    nextChoice: 0,
                    undo: [],
                    declined: [],
                    removedTeams: [],
                    skipped: [],
                    rounds: allianceSelectionOrderRounds,
                    allianceSelectionOrder: allianceSelectionOrder
                };
                
                // Remove the Alliance 1 captain from available teams
                const alliance1CaptainIndex = _.findIndex(newAsArrays.availableTeams, { "teamNumber": sortedAndRankedTeams[0].teamNumber });
                if (alliance1CaptainIndex >= 0) {
                    newAsArrays.availableTeams.splice(alliance1CaptainIndex, 1);
                }
                
                setAllianceSelectionArrays(newAsArrays);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedEvent, rankings, teamList, allianceCount, communityUpdates, allianceSelectionArrays])

    useHotkeys('return', () => document.getElementById("acceptButton")?.click(), { scopes: 'allianceAccept' });
    useHotkeys('d', () => document.getElementById("declineButton")?.click(), { scopes: 'allianceDecline' });
    useHotkeys('s', () => document.getElementById("skipButton")?.click(), { scopes: 'allianceSkip' });
    useHotkeys('meta+z, ctrl+z', () => document.getElementById("undoButton")?.click(), { scopes: 'undo' });
    useHotkeys('esc', () => document.getElementById("resetFilter")?.click(), { scopes: 'allianceFilter' });
    
    const currentRound = asArrays?.allianceSelectionOrder?.[asArrays.nextChoice]?.round || -1;
    
    // Early return if not initialized yet - wait for useEffect to complete
    if (!allianceSelectionArrays || _.isEmpty(allianceSelectionArrays)) {
        return null;
    }


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

        // Use existing alliance selection arrays or wait for initialization
        if (allianceSelectionArrays && !_.isEmpty(allianceSelectionArrays)) {
            asArrays = _.cloneDeep(allianceSelectionArrays);
        }

        // Update alliance captains if any removed teams are captains and filter removed teams from ranked teams
        if (asArrays.removedTeams && asArrays.removedTeams.length > 0) {
            // Filter out removed teams from ranked teams
            asArrays.rankedTeams = _.filter(asArrays.rankedTeams, (team) => {
                return !asArrays.removedTeams.includes(team.teamNumber);
            });

            asArrays.alliances.forEach((alliance, index) => {
                if (alliance.captain && asArrays.removedTeams.includes(alliance.captain.teamNumber)) {
                    // Promote the next available ranked team (skipping removed teams)
                    if (index < asArrays.rankedTeams.length) {
                        alliance.captain = asArrays.rankedTeams[index];
                    } else {
                        alliance.captain = null;
                    }
                }
            });
        }

        // pick off the top 8 remaining teams to be the backup list (excluding removed teams)
        backupTeams = asArrays?.rankedTeams.slice(allianceCount?.count, allianceCount?.count + 8);


        // set up the available teams block - filter out the current captain whose turn it is
        const currentCaptainTeamNumber = asArrays?.alliances[
            _.findIndex(asArrays.alliances, { "number": asArrays?.allianceSelectionOrder?.[asArrays.nextChoice]?.number })
        ]?.captain?.teamNumber;
        
        const displayAvailableTeams = asArrays.availableTeams?.filter(team => 
            team.teamNumber !== currentCaptainTeamNumber
        ) || [];
        
        var rows = displayAvailableTeams.length;
        if (rows > 0) {
            displayAvailableTeams.forEach((team, index) => {
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

    const availCell = (team) => {
        const currentRound = asArrays?.allianceSelectionOrder?.[asArrays.nextChoice]?.round || -1;
        const declined = asArrays?.declined.includes(team?.teamNumber);
        const removed = asArrays?.removedTeams?.includes(team?.teamNumber);
        const skipped = _.findIndex(_.filter(asArrays?.skipped, { round: currentRound }), { teamNumber: team?.teamNumber }) >= 0;
        const displayTeamNumber = remapNumberToString ? remapNumberToString(team?.teamNumber) : team?.teamNumber;

        // Check if this team is currently an alliance captain
        const allianceIndex = _.findIndex(asArrays?.alliances, { "captain": team });
        const isAllianceCaptain = allianceIndex >= 0;

        // Alliance 1 captain is never available to be selected
        const isAlliance1Captain = allianceIndex === 0;

        // Check if this captain has already made their first pick
        const hasFirstPick = isAllianceCaptain && asArrays?.alliances[allianceIndex]?.round1 !== null;
        
        // Check if it's currently this captain's turn to pick
        const isCurrentCaptain = isAllianceCaptain && 
            asArrays?.alliances[allianceIndex]?.number === asArrays?.allianceSelectionOrder?.[asArrays.nextChoice]?.number;

        // A captain is unavailable if they're Alliance 1 captain OR if they've made their first pick OR if it's currently their turn
        const isUnavailableCaptain = isAlliance1Captain || (isAllianceCaptain && hasFirstPick) || isCurrentCaptain;

        return (
            <>
                {(asArrays?.nextChoice < asArrays.allianceSelectionOrder?.length && !isUnavailableCaptain && !skipped && !removed) &&
                    (String(team?.teamNumber).startsWith(teamFilter) || teamFilter === "") && <div key={"availableButton" + team?.teamNumber} className={declined ? "availableTeam allianceDecline" : skipped ? "availableTeam allianceTeam allianceSkip" : "availableTeam allianceTeam"} onClick={(e) => handleShow(team, declined ? "declined" : "show", e)}><b>{displayTeamNumber}</b></div>}

                {(asArrays?.nextChoice >= asArrays.allianceSelectionOrder?.length || isUnavailableCaptain || skipped || removed) &&
                    (String(team?.teamNumber).startsWith(teamFilter) || teamFilter === "") && <div key={"availableButtonDisabled" + team?.teamNumber} className={declined ? "availableTeam allianceDecline" : removed ? "availableTeam allianceTeam" : skipped ? "availableTeam allianceTeam allianceSkip" : "availableTeam allianceTeam"} style={removed ? { backgroundColor: "orange", color: "white" } : {}}><b>{displayTeamNumber}</b></div>}
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
                                    <span>    </span><Button size="sm" variant="success" onClick={() => setResetAllianceSelection(true)} active>Refresh Rankings</Button><span>    </span><Button size="sm" variant="warning" onClick={handleReset} active>Restart Alliance Selection</Button>
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
                                                            {column.map((team) => (
                                                                <React.Fragment key={`availCell${team.teamNumber}`}>
                                                                    {availCell(team)}
                                                                </React.Fragment>
                                                            ))}
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
                                                    <p><strong>{ftcMode ? "Top Ranked Teams" : "Backup Teams"}</strong><br />(Teams here are initially ranked {allianceCount?.count + 1} to {allianceCount?.count + 8} top to bottom. As Alliance Selection progresses, teams will rise up into this section as teams are selected.)</p>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col id="backupTeamsDisplay">
                                                    {backupTeams.map((team) => {
                                                        var declined = asArrays.declined.includes(team.teamNumber);
                                                        var removed = asArrays?.removedTeams?.includes(team.teamNumber);
                                                        const displayTeamNumber = remapNumberToString ? remapNumberToString(team?.teamNumber) : team?.teamNumber;
                                                        return (
                                                            <React.Fragment key={`backupTeam${team.teamNumber}`}>
                                                                {(asArrays?.nextChoice < asArrays.allianceSelectionOrder?.length && !removed) &&
                                                                <div className={declined ? "allianceDecline" : "allianceTeam"} onClick={(e) => handleShow(team, declined ? "declined" : "show", e)}><b>{displayTeamNumber}</b></div>}
                                                                {(asArrays?.nextChoice >= asArrays.allianceSelectionOrder?.length || removed) &&
                                                                    <div className={declined ? "allianceDecline" : "allianceTeam"} style={removed ? { backgroundColor: "orange", color: "white" } : {}}><b>{displayTeamNumber}</b></div>}
                                                            </React.Fragment>
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
                                                            const displayTeamNumber = remapNumberToString ? remapNumberToString(team?.teamNumber) : team?.teamNumber;
                                                            return (
                                                                <React.Fragment key={`skippedTeam${team.teamNumber}`}>
                                                                    {(asArrays?.nextChoice < asArrays.allianceSelectionOrder?.length) &&
                                                                    <div className={declined ? "allianceDecline" : "allianceTeam allianceSkip allianceTeamChoice"} ><b>{displayTeamNumber}</b></div>}
                                                                </React.Fragment>
                                                            )
                                                        })}
                                                    </Col>
                                                </Row>
                                            </Container>}
                                    </Col>}
                                    <Col xs={width < 600 ? 12 : inChamps ? 6 : 5}>
                                        <Row className={"alliancesTeamsTable alliancesTeamsTableHeader"}>{currentRound >= 0 ? `Round ${currentRound} of ${allianceSelectionRounds?.length}` : asArrays?.nextChoice > 0 ? "Alliance Selection Complete" : "Alliance Selection not started"}</Row>
                                        <Container fluid className={"alliancesTeamsTable"}>
                                            {allianceDisplayOrder.map((row) => {

                                                return (
                                                    <Col key={`allianceRow${row[0]}`} xs={12} id="allianceTeamsDisplay">

                                                        <Row key={`allianceDisplay${row[0]}`} >
                                                            {row.map((allianceNumber) => {

                                                                const alliance = _.filter(alliances, { "number": allianceNumber })
                                                                const allianceName = alliance[0]?.name;
                                                                const fullAlliance = allianceSelectionRounds?.length === 3 ? alliance[0]?.round3 : allianceSelectionRounds?.length === 2 ? alliance[0]?.round2 : alliance[0]?.round1;
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
                                                                        <Col key={`alliance-col-${allianceNumber}`} xs={6} className={fullAlliance ? "fullAlliance" : "unfullAlliance"}>
                                                                            <Container fluid className={asArrays.allianceSelectionOrder[asArrays?.nextChoice]?.number === allianceNumber ? "alliance dropzone" : "alliance"}>
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
                                                                                                {captain?.teamNumber ? <b>{remapNumberToString ? remapNumberToString(captain?.teamNumber) : captain?.teamNumber}</b> : <div>TBD</div>}
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
                                                                                                {captain?.teamNumber ? <b>{remapNumberToString ? remapNumberToString(captain?.teamNumber) : captain?.teamNumber}</b> : <div>TBD</div>}
                                                                                            </div>
                                                                                        </Col>
                                                                                    </Row>}

                                                                                <Row>
                                                                                    <Col xs={inChamps && !ftcMode ? 4 : !inChamps && ftcMode ? 12 : 6} className={(asArrays.allianceSelectionOrder[asArrays?.nextChoice]?.number === allianceNumber) && (asArrays.allianceSelectionOrder[asArrays?.nextChoice]?.round === 1) ? "alliancedrop nextAllianceChoice" : "alliancedrop"}>
                                                                                        <div><b>1<sup>st</sup> pick</b></div>
                                                                                        <div key={`${allianceName}round1`}
                                                                                            className={round1?.declined ? "allianceDecline allianceTeamChoice" : round1?.teamNumber ? "allianceTeam allianceTeamChosen" : "allianceTeam allianceTeamChoice"}>{round1?.teamNumber ? <b>{remapNumberToString ? remapNumberToString(round1?.teamNumber) : round1?.teamNumber}</b> : <b>TBD</b>}
                                                                                        </div>
                                                                                    </Col>

                                                                                    {((inChamps && ftcMode) || !ftcMode) &&
                                                                                        <Col xs={inChamps && !ftcMode ? 4 : 6} className={(asArrays.allianceSelectionOrder[asArrays?.nextChoice]?.number === allianceNumber) && (asArrays.allianceSelectionOrder[asArrays?.nextChoice]?.round === 2) ? "alliancedrop nextAllianceChoice" : "alliancedrop"}>
                                                                                            <div><b>2<sup>nd</sup> pick</b></div>
                                                                                            <div key={`${allianceName}round2`}
                                                                                                className={round2?.declined ? "allianceDecline allianceTeamChoice" : round2?.teamNumber ? "allianceTeam allianceTeamChosen" : "allianceTeam allianceTeamChoice"}>{round2?.teamNumber ? <b>{remapNumberToString ? remapNumberToString(round2?.teamNumber) : round2?.teamNumber}</b> : <b>TBD</b>}
                                                                                            </div>
                                                                                        </Col>}


                                                                                    {inChamps && !ftcMode &&
                                                                                        <Col xs={inChamps ? 4 : 6} className={(asArrays.allianceSelectionOrder[asArrays?.nextChoice]?.number === allianceNumber) && (asArrays.allianceSelectionOrder[asArrays?.nextChoice]?.round === 3) ? "alliancedrop nextAllianceChoice" : "alliancedrop"}>
                                                                                            <div><b>3<sup>rd</sup> pick</b></div>
                                                                                            <div key={`${allianceName}round3`}
                                                                                                className={round3?.declined ? "allianceDecline allianceTeamChoice" : round3?.teamNumber ? "allianceTeam allianceTeamChosen" : "allianceTeam allianceTeamChoice"}>{round3?.teamNumber ? <b>{remapNumberToString ? remapNumberToString(round3?.teamNumber) : round3?.teamNumber}</b> : <b>TBD</b>}
                                                                                            </div>
                                                                                        </Col>}
                                                                                </Row>

                                                                            </Container>
                                                                        </Col>
                                                                        : <Col key={`alliance-col-empty-${allianceNumber}`} xs={6}></Col>
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
                                                    <p><strong>{ftcMode ? "Top Ranked Teams" : "Backup Teams"}</strong><br />(Teams here are initially ranked {allianceCount?.count + 1} to {allianceCount?.count + 8} top to bottom. As Alliance Selection progresses, teams will rise up into this section as teams are selected.)</p>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col id="backupTeamsDisplay">
                                                    {backupTeams.map((team) => {
                                                        var declined = asArrays.declined.includes(team.teamNumber);
                                                        var removed = asArrays?.removedTeams?.includes(team.teamNumber);
                                                        const displayTeamNumber = remapNumberToString ? remapNumberToString(team?.teamNumber) : team?.teamNumber;
                                                        return (
                                                            <React.Fragment key={`backupTeam${team.teamNumber}`}>
                                                                {(asArrays?.nextChoice < asArrays.allianceSelectionOrder?.length && !removed) &&
                                                                <div className={declined ? "allianceDecline" : "allianceTeam"} onClick={(e) => handleShow(team, declined ? "declined" : "show", e)}><b>{displayTeamNumber}</b></div>}
                                                                {(asArrays?.nextChoice >= asArrays.allianceSelectionOrder?.length || removed) &&
                                                                    <div className={declined ? "allianceDecline" : "allianceTeam"} style={removed ? { backgroundColor: "orange", color: "white" } : {}}><b>{displayTeamNumber}</b></div>}
                                                            </React.Fragment>
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
                                                            const displayTeamNumber = remapNumberToString ? remapNumberToString(team?.teamNumber) : team?.teamNumber;
                                                            return (
                                                                <React.Fragment key={`skippedTeam${team.teamNumber}`}>
                                                                    {(asArrays?.nextChoice < asArrays.allianceSelectionOrder?.length) &&
                                                                    <div className={declined ? "allianceDecline" : "allianceTeam allianceSkip allianceTeamChoice"} ><b>{displayTeamNumber}</b></div>}
                                                                </React.Fragment>
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
                    <Modal.Header className={allianceMode === "decline" ? "allianceSelectionDecline" : allianceMode === "remove" ? "allianceSelectionDecline" : "allianceChoice"} closeVariant={"white"} closeButton>
                        <Modal.Title >{allianceMode === "decline" ? "Team declines the offer" : allianceMode === "remove" ? "Remove team from Playoffs" : allianceMode === "skip" ? "Skip Alliance" : allianceMode === "accept" ? "Are you sure they want to accept?" : allianceMode === "a1captain" ? "Top Seeded Alliance" : "Alliance Choice"}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {(allianceMode === "show" || allianceMode === "a1captain" || allianceMode === "captain") && <span className={"allianceAnnounceDialog"}>Team {remapNumberToString ? remapNumberToString(allianceTeam?.teamNumber) : allianceTeam?.teamNumber} {allianceTeam?.updates?.nameShortLocal ? allianceTeam?.updates.nameShortLocal : allianceTeam?.nameShort}<br />
                            is {allianceTeam?.updates?.awardsTextLocal ? allianceTeam?.updates?.awardsTextLocal : <>{(OriginalAndSustaining.indexOf(String(allianceTeam?.teamNumber)) >= 0) ? "an Original and Sustaining Team " : ""}from<br />
                                {allianceTeam?.updates?.organizationLocal ? allianceTeam?.updates?.organizationLocal : allianceTeam?.organization}<br />
                                in</>} {allianceTeam?.updates?.cityStateLocal ? allianceTeam?.updates?.cityStateLocal : `${allianceTeam?.city}, ${allianceTeam?.stateProv}`}{allianceTeam?.country !== "USA" ? `, ${allianceTeam?.country}` : ""}<br /></span>}
                        {allianceMode === "accept" && <span className={"allianceAnnounceDialog"}>Team {remapNumberToString ? remapNumberToString(allianceTeam?.teamNumber) : allianceTeam?.teamNumber} {allianceTeam?.updates?.nameShortLocal ? allianceTeam?.updates?.nameShortLocal : allianceTeam?.nameShort}<br />
                            has been asked to join Alliance {asArrays.allianceSelectionOrder[asArrays.nextChoice]?.number}.<br />Do they accept?</span>}
                        {allianceMode === "decline" && <span className={"allianceAnnounceDialog"}>Team {remapNumberToString ? remapNumberToString(allianceTeam?.teamNumber) : allianceTeam?.teamNumber} {allianceTeam?.updates?.nameShortLocal ? allianceTeam?.updates?.nameShortLocal : allianceTeam?.nameShort}<br />
                            has declined the offer from Alliance {asArrays.allianceSelectionOrder[asArrays?.nextChoice]?.number}.<br />They will become inelegible to be selected by another team or to continue as a backup team in the playoffs. Do they decline?</span>}
                        {allianceMode === "declined" && <span className={"allianceAnnounceDialog"}>Team {remapNumberToString ? remapNumberToString(allianceTeam?.teamNumber) : allianceTeam?.teamNumber} {allianceTeam?.updates?.nameShortLocal ? allianceTeam?.updates?.nameShortLocal : allianceTeam?.nameShort}<br />
                            has previously declined an offer. They are inelegible to be selected by another alliance.</span>}
                        {allianceMode === "a1captain" && <span className={"allianceAnnounceDialog"}><br />Team {remapNumberToString ? remapNumberToString(allianceTeam?.teamNumber) : allianceTeam?.teamNumber} is our top seeded Alliance. They are inelegible to be selected by another alliance.</span>}
                        {/* {allianceMode === "captain" && <span className={"allianceAnnounceDialog"}>Team {remapNumberToString ? remapNumberToString(allianceTeam?.teamNumber) : allianceTeam?.teamNumber} {allianceTeam?.updates?.nameShortLocal ? allianceTeam?.updates?.nameShortLocal : allianceTeam?.nameShort}<br />
                            is an Alliance Captain. They are inelegible to be selected by another alliance.</span>} */}
                        {allianceMode === "skip" && <span className={"allianceAnnounceDialog"}>Team {remapNumberToString ? remapNumberToString(allianceTeam?.teamNumber) : allianceTeam?.teamNumber} {allianceTeam?.updates?.nameShortLocal ? allianceTeam?.updates?.nameShortLocal : allianceTeam?.nameShort}<br />
                            has missed their time window for selecting an Alliance partner.</span>}
                        {allianceMode === "remove" && <span className={"allianceAnnounceDialog"}>Team {remapNumberToString ? remapNumberToString(allianceTeam?.teamNumber) : allianceTeam?.teamNumber} {allianceTeam?.updates?.nameShortLocal ? allianceTeam?.updates?.nameShortLocal : allianceTeam?.nameShort}<br />
                            will be removed from playoff participation. They will not be eligible to be selected by an alliance or serve as an alliance captain. Are you sure?</span>}

                    </Modal.Body>
                    <Modal.Footer>
                        {(allianceMode === "show" || allianceMode === "accept") &&

                            <Button id="acceptButton" variant="success" size="sm" style={{ marginBottom: "10px" }} onClick={(e) => { handleAccept(allianceTeam, allianceMode === "accept" ? "confirm" : "accept", e) }}>
                                <HandThumbsUpFill /> Gratefully Accept
                            </Button>
                        }
                        {(allianceMode === "show" || allianceMode === "decline") &&
                            <Button id="declineButton" variant="danger" size="sm" style={{ marginBottom: "10px" }} onClick={(e) => { handleDecline(allianceTeam, allianceMode === "decline" ? "confirm" : "decline", e) }}>
                                <HandThumbsDownFill /> Respectfully Decline
                            </Button>
                        }
                        <Button variant="primary" size="sm" onClick={handleClose} style={{ marginBottom: "10px" }}>
                            {allianceMode === "show" && <span> <TrophyFill /> Alliance Announce</span>}
                            {allianceMode === "a1captain" && <span> <TrophyFill /> Top Seeded Alliance</span>}
                            {allianceMode === "captain" && <span> <TrophyFill /> Alliance Captain</span>}
                            {allianceMode === "declined" && <span> <TrophyFill /> Sorry</span>}
                            {(allianceMode === "decline" || allianceMode === "accept" || allianceMode === "skip" || allianceMode === "remove") && <span><TrophyFill /> Oops, they reconsidered.</span>}
                        </Button>



                        {(allianceMode === "a1captain" || allianceMode === "captain" || allianceMode === "skip") && !ftcMode &&

                            <Button id="skipButton" variant="warning" size="sm" style={{
                                marginBottom: "10px"
                            }} onClick={(e) => { handleSkip(allianceTeam, allianceMode === "skip" ? "confirm" : "skip", e) }}>
                                <HandThumbsUpFill /> Skip Alliance
                            </Button>
                        }
                        {(allianceMode === "show" || allianceMode === "remove" || allianceMode === "a1captain" || allianceMode === "captain") &&

                            <Button id="removeButton" variant="warning" size="sm" style={{
                                marginBottom: "10px",
                                backgroundColor: "orange",
                                borderColor: "orange"
                            }} onClick={(e) => { handleRemoveFromPlayoffs(allianceTeam, allianceMode === "remove" ? "confirm" : "remove", e) }}>
                                <XSquare /> Remove team from Playoffs
                            </Button>
                        }

                    </Modal.Footer>
                </Modal>}
            </Container>
        </>
    )
}

export default AllianceSelection