import { useRef, useState } from "react";
import { Row, Col, Button, Modal, Container, Table } from "react-bootstrap";
import { ArrowUpSquareFill, CaretLeftFill, CaretRightFill } from "react-bootstrap-icons";
import Select from "react-select";
import MatchClock from "../components/MatchClock";
import _ from "lodash";
import { useHotkeysContext } from "react-hotkeys-hook";
import { roundThreeOrReserveRoleLabel } from "../utils/allianceRoleLabels";
import {
    compactReserveEditsForEvent,
    matchHasPostedResult,
} from "../utils/playoffReserveEdits";

/**
 * True when this alliance has a persisted `op: 'set'` overlay (user-added reserve / round3 in gatool).
 * Merged `alliances` alone mixes API + overlay; comparing to overrides on each render decides if Remove is allowed.
 */
function hasLocalPlayoffReserveSetOverride(playoffReserveEdits, eventCode, allianceNumber) {
    if (
        !eventCode ||
        allianceNumber === undefined ||
        allianceNumber === null ||
        allianceNumber === ""
    ) {
        return false;
    }
    const raw = playoffReserveEdits?.[eventCode];
    if (!raw || typeof raw !== "object") {
        return false;
    }
    const e = compactReserveEditsForEvent(raw)[String(allianceNumber)];
    if (!e || e.op !== "set") {
        return false;
    }
    const hasRound3 =
        e.round3 !== undefined && e.round3 !== null && e.round3 !== "";
    const hasBackup =
        e.backup !== undefined && e.backup !== null && e.backup !== "";
    return hasRound3 || hasBackup;
}

/** Same alliance row as in App.jsx getAlliances — keeps Lookup and alliance.* fields consistent after local round3 edits. */
function sameAllianceRow(entry, allianceRow) {
    if (!entry || !allianceRow) return false;
    const num = allianceRow.number;
    const name = allianceRow.name;
    return (
        (num !== undefined &&
            num !== null &&
            entry.number !== undefined &&
            entry.number !== null &&
            Number(entry.number) === Number(num)) ||
        (name && entry.alliance === name)
    );
}

function lookupTeamStillOnAllianceRoster(allianceRow, teamNum) {
    if (teamNum == null || teamNum === "") return false;
    const s = String(teamNum);
    return (
        String(allianceRow.captain) === s ||
        String(allianceRow.round1) === s ||
        String(allianceRow.round2) === s
    );
}

function syncAllianceLookupRound3Entry(
    alliancesTemp,
    allianceRow,
    prevRound3TeamNumber,
    roundThreeRoleLabel
) {
    const lu = alliancesTemp?.Lookup;
    if (!lu || !allianceRow) return;
    const newR3 = allianceRow.round3;
    if (
        prevRound3TeamNumber != null &&
        prevRound3TeamNumber !== "" &&
        String(prevRound3TeamNumber) !== String(newR3 ?? "")
    ) {
        if (!lookupTeamStillOnAllianceRoster(allianceRow, prevRound3TeamNumber)) {
            delete lu[String(prevRound3TeamNumber)];
        }
    }
    for (const entry of Object.values(lu)) {
        if (sameAllianceRow(entry, allianceRow)) {
            entry.round3 = allianceRow.round3 ?? null;
            entry.backup = null;
            entry.backupReplaced = null;
        }
    }
    const r3 = allianceRow.round3;
    if (r3 != null && r3 !== "") {
        lu[String(r3)] = {
            role: roundThreeRoleLabel,
            alliance: allianceRow.name,
            number: allianceRow.number,
            captain: allianceRow.captain,
            round1: allianceRow.round1,
            round2: allianceRow.round2,
            round3: allianceRow.round3,
            backup: null,
            backupReplaced: null,
        };
    }
}

function clearAllianceLookupRound3(alliancesTemp, allianceRow, removedRound3) {
    const lu = alliancesTemp?.Lookup;
    if (!lu || !allianceRow) return;
    if (removedRound3 != null && removedRound3 !== "") {
        if (!lookupTeamStillOnAllianceRoster(allianceRow, removedRound3)) {
            delete lu[String(removedRound3)];
        }
    }
    for (const entry of Object.values(lu)) {
        if (sameAllianceRow(entry, allianceRow)) {
            entry.round3 = null;
            entry.backup = null;
            entry.backupReplaced = null;
        }
    }
}

function getAllianceIndexForMatchSide(side, matchDetails, alliancesTemp) {
    const field = matchDetails?.teams?.find(
        (t) =>
            String(t.station || "").startsWith(side) &&
            t.teamNumber != null &&
            Number(t.teamNumber) > 0
    );
    if (!field) return null;
    const lu = alliancesTemp?.Lookup?.[String(field.teamNumber)];
    if (!lu?.alliance) return null;
    const idx = _.findIndex(alliancesTemp?.alliances, { name: lu.alliance });
    if (idx < 0) return null;
    return { idx, allianceName: lu.alliance };
}

/**
 * @param {'Red'|'Blue'} side
 * @returns {null | { teamNumber: number|string, allianceName: string, allianceNumber: number|string, side: string, isPlayoffReserve: boolean }}
 */
function getPlayoffReserveForSide(side, matchDetails, alliances, inPlayoffs) {
    if (!inPlayoffs || !matchDetails?.teams?.length || !alliances?.alliances?.length || !alliances?.Lookup) {
        return null;
    }
    const matchNums = new Set(matchDetails.teams.map((t) => String(t.teamNumber)));
    /** Prefer alliance id from Lookup — name strings from API vs schedule can drift. */
    const allianceNumbersOnField = new Set();
    matchDetails.teams.forEach((t) => {
        const lu = alliances.Lookup[String(t.teamNumber)];
        if (lu?.number !== undefined && lu?.number !== null && lu?.number !== "") {
            const n = Number(lu.number);
            if (Number.isFinite(n)) {
                allianceNumbersOnField.add(n);
            }
        }
    });
    for (const al of alliances.alliances) {
        const reserveNum =
            al.round3 !== undefined && al.round3 !== null && al.round3 !== ""
                ? al.round3
                : al.backup !== undefined && al.backup !== null && al.backup !== ""
                  ? al.backup
                  : null;
        if (reserveNum == null) continue;
        const alNum = Number(al.number);
        if (!Number.isFinite(alNum) || !allianceNumbersOnField.has(alNum)) continue;
        if (matchNums.has(String(reserveNum))) continue;
        const fielded = matchDetails.teams.find(
            (t) => Number(alliances.Lookup[String(t.teamNumber)]?.number) === alNum
        );
        const alSide = fielded?.station?.startsWith("Blue") ? "Blue" : "Red";
        if (alSide !== side) continue;
        return {
            teamNumber: reserveNum,
            allianceName: al.name,
            allianceNumber: al.number,
            side,
            isPlayoffReserve: true,
        };
    }
    return null;
}

function TopButtons({ previousMatch, nextMatch, currentMatch, matchMenu, setMatchFromMenu, selectedEvent, matchDetails, timeFormat, alliances, setAlliances, rankings, inPlayoffs, backupTeam, setBackupTeam, upsertPlayoffReserveOverlay, removePlayoffReserveOverlay, playoffReserveEdits, teamList, adHocMatch, setAdHocMatch, adHocMode, swapScreen, playoffOnly, eventLabel, ftcMode }) {

    const [show, setShow] = useState(null);
    const [showAdHoc, setAdHoc] = useState(null);
    const [teamSelected, setTeamSelected] = useState(null);
    const [confirmSelection, setConfirmSelection] = useState(false);
    const [reserveAddSide, setReserveAddSide] = useState(/** @type {null | 'Red' | 'Blue'} */ (null));
    const { disableScope, enableScope } = useHotkeysContext();

    const handleShow = () => {
        setShow(true);
        setReserveAddSide(null);
        disableScope('matchNavigation');
        disableScope('tabNavigation');
    }

    const handleAdHoc = () => {
        setAdHoc(true);
        disableScope('matchNavigation');
        disableScope('tabNavigation');
    }

    const handleCloseAdHoc = () => {
        setAdHoc(false);
        enableScope('matchNavigation');
        enableScope('tabNavigation');
    }

    const handleClose = () => {
        setShow(false);
        setTeamSelected(null);
        setConfirmSelection(false);
        setReserveAddSide(null);
        enableScope('matchNavigation');
        enableScope('tabNavigation');
    }

    const handleBackupReconsider = () => {
        setConfirmSelection(false);
        setBackupTeam(null);
    }

    const handleMatchSelection = (newMatch) => {
        setMatchFromMenu(newMatch)
        selectRef.current?.blur()
    }

    const selectRef = useRef(null)

    const handleBackupConfirm = () => {
        var alliancesTemp = _.cloneDeep(alliances);
        const side = reserveAddSide;
        if (!side || !backupTeam?.backup?.teamNumber) {
            return;
        }
        const meta = getAllianceIndexForMatchSide(side, matchDetails, alliancesTemp);
        if (!meta) {
            return;
        }
        const allianceIdx = meta.idx;
        const prevRound3 = alliancesTemp.alliances[allianceIdx].round3;
        alliancesTemp.alliances[allianceIdx].round3 = backupTeam.backup.teamNumber;
        alliancesTemp.alliances[allianceIdx].backup = null;
        alliancesTemp.alliances[allianceIdx].backupReplaced = null;
        const allianceRow = alliancesTemp.alliances[allianceIdx];
        syncAllianceLookupRound3Entry(
            alliancesTemp,
            allianceRow,
            prevRound3,
            roundThreeOrReserveRoleLabel(selectedEvent?.value)
        );
        let allianceNumber = allianceRow?.number;
        if (allianceNumber === undefined || allianceNumber === null || allianceNumber === "") {
            const nameStr = String(allianceRow?.name || meta.allianceName || "");
            const m = nameStr.match(/(\d+)/);
            if (m) allianceNumber = parseInt(m[1], 10);
        }
        if (
            allianceNumber !== undefined &&
            allianceNumber !== null &&
            allianceNumber !== "" &&
            !Number.isNaN(Number(allianceNumber))
        ) {
            const pendingSourceMatch =
                matchDetails &&
                (matchDetails.matchNumber != null ||
                    matchDetails.originalMatchNumber != null)
                    ? {
                        tournamentLevel:
                            matchDetails.tournamentLevel ||
                            (inPlayoffs ? "Playoff" : null),
                        matchNumber: matchDetails.matchNumber,
                        originalMatchNumber: matchDetails.originalMatchNumber,
                        series: matchDetails.series,
                    }
                    : undefined;
            upsertPlayoffReserveOverlay?.({
                allianceNumber,
                round3: backupTeam.backup.teamNumber,
                pendingSourceMatch,
            });
        }
        setAlliances(alliancesTemp);

        setShow(false);
        setBackupTeam(null);
        setTeamSelected(null);
        setConfirmSelection(false);
        setReserveAddSide(null);
        enableScope('matchNavigation');
        enableScope('tabNavigation');
    }

    const handleRemoveReserveConfirm = () => {
        const allianceName = teamSelected?.allianceName;
        let allianceNumber = teamSelected?.allianceNumber;
        if (allianceNumber === undefined || allianceNumber === null || allianceNumber === "") {
            if (allianceName) {
                const m = String(allianceName).match(/(\d+)/);
                if (m) allianceNumber = parseInt(m[1], 10);
            }
        }
        if (allianceNumber === undefined || allianceNumber === null || allianceNumber === "") {
            handleClose();
            return;
        }
        const eventCode = selectedEvent?.value?.code;
        if (!hasLocalPlayoffReserveSetOverride(playoffReserveEdits, eventCode, allianceNumber)) {
            handleClose();
            return;
        }
        var alliancesTemp = _.cloneDeep(alliances);
        var idx = _.findIndex(
            alliancesTemp?.alliances,
            (a) => Number(a.number) === Number(allianceNumber)
        );
        if (idx < 0 && allianceName) {
            idx = _.findIndex(alliancesTemp?.alliances, { name: allianceName });
        }
        if (idx >= 0) {
            const removedRound3 = alliancesTemp.alliances[idx].round3;
            alliancesTemp.alliances[idx].round3 = null;
            alliancesTemp.alliances[idx].backup = null;
            alliancesTemp.alliances[idx].backupReplaced = null;
            clearAllianceLookupRound3(alliancesTemp, alliancesTemp.alliances[idx], removedRound3);
        }
        removePlayoffReserveOverlay?.({ allianceNumber });
        setAlliances(alliancesTemp);
        setShow(false);
        setBackupTeam(null);
        setTeamSelected(null);
        setConfirmSelection(false);
        setReserveAddSide(null);
        enableScope('matchNavigation');
        enableScope('tabNavigation');
    }



    const adHocStation = (value) => {
        var station = value[0];
        var teamNumber = value[1].value;
        var adHocMatchNew = _.cloneDeep(adHocMatch);
        if (_.isNull(adHocMatchNew)) {
            adHocMatchNew = [
                { teamNumber: null, station: 'Red1', surrogate: false, dq: false },
                { teamNumber: null, station: 'Red2', surrogate: false, dq: false },
                { teamNumber: null, station: 'Red3', surrogate: false, dq: false },
                { teamNumber: null, station: 'Blue1', surrogate: false, dq: false },
                { teamNumber: null, station: 'Blue2', surrogate: false, dq: false },
                { teamNumber: null, station: 'Blue3', surrogate: false, dq: false }
            ]
        }
        adHocMatchNew[_.findIndex(adHocMatchNew, { "station": station })].teamNumber = teamNumber;
        setAdHocMatch(adHocMatchNew);
    }

    var allianceMembers = alliances?.Lookup ? Object.keys(alliances?.Lookup) : null;
    var availableTeams = [];
    if (selectedEvent?.value?.name.includes("OFFLINE")) {
        teamList?.teams.forEach((team) => {
            if (_.indexOf(allianceMembers, String(team.teamNumber)) < 0) {
                availableTeams.push({ "label": team.teamNumber, "value": team })
            }
        })
    } else {
        rankings?.ranks.forEach((team) => {
            if (_.indexOf(allianceMembers, String(team.teamNumber)) < 0) {
                availableTeams.push({ "label": team.teamNumber, "value": team })
            }
        })
    }
    
    if (inPlayoffs && alliances.alliances.length > 0) {
        availableTeams = availableTeams.filter((team) => {
            const label = team?.label;
            return !alliances.alliances.some(
                (al) =>
                    Number(al.round3) === Number(label) ||
                    Number(al.backup) === Number(label)
            );
        });
    }

    availableTeams = _.orderBy(availableTeams, ["label"], "asc");
    const inPractice = matchDetails?.description.toLowerCase().includes("practice");
    const addBackupButton = !ftcMode && inPlayoffs && ((selectedEvent?.value?.champLevel !== "CHAMPS" && selectedEvent?.value?.champLevel !== "CMPDIV" && selectedEvent?.value?.champLevel !== "CMPSUB") || (selectedEvent?.value?.code === "OFFLINE" && !playoffOnly));

    const fieldTeamsOnly = matchDetails?.teams || [];
    const stationSortKeyField = (t) => {
        const n = parseInt(String(t.station).replace(/\D/g, ""), 10);
        return Number.isNaN(n) ? 5 : n;
    };
    const redFieldTeams = fieldTeamsOnly
        .filter((t) => String(t.station || "").startsWith("Red"))
        .sort((a, b) => stationSortKeyField(a) - stationSortKeyField(b));
    const blueFieldTeams = fieldTeamsOnly
        .filter((t) => String(t.station || "").startsWith("Blue"))
        .sort((a, b) => stationSortKeyField(a) - stationSortKeyField(b));

    /** Match Play-by-Play: Blue column left when not swapped; Red left when swapScreen is on. */
    const blueAllianceColumnFirst = !swapScreen;
    const leftColumnTeams = blueAllianceColumnFirst ? blueFieldTeams : redFieldTeams;
    const rightColumnTeams = blueAllianceColumnFirst ? redFieldTeams : blueFieldTeams;
    const leftColumnSide = blueAllianceColumnFirst ? "Blue" : "Red";
    const rightColumnSide = blueAllianceColumnFirst ? "Red" : "Blue";

    const redReserveCtx = getPlayoffReserveForSide("Red", matchDetails, alliances, inPlayoffs);
    const blueReserveCtx = getPlayoffReserveForSide("Blue", matchDetails, alliances, inPlayoffs);
    const eventCodeForReserve = selectedEvent?.value?.code;
    const reserveSlotUiLabel = roundThreeOrReserveRoleLabel(selectedEvent?.value);

    const renderBackupModalFieldTile = (team, index) => {
        const allianceColor = team?.station.slice(0, team.station?.length - 1);
        const key = `Field${team?.station || team?.teamNumber || index}`;
        return (
            <div
                key={key}
                className={`btn w-100 ${allianceColor}Replace alliance-backup-modal-team-btn alliance-backup-modal-field-display`}
            >
                {team.teamNumber}
            </div>
        );
    };

    const renderAllianceReserveColumn = (/** @type {'Red'|'Blue'} */ side, teams) => {
        const reserveCtx = side === "Red" ? redReserveCtx : blueReserveCtx;
        const reserveShownFromApiOnly =
            reserveCtx &&
            !hasLocalPlayoffReserveSetOverride(
                playoffReserveEdits,
                eventCodeForReserve,
                reserveCtx.allianceNumber
            );
        return (
            <Col xs={12} md={6} className="d-flex flex-column gap-2">
                {teams.map((team, index) => renderBackupModalFieldTile(team, index))}
                {reserveAddSide === side && !confirmSelection && (
                    <>
                        <div className="text-center small">
                            Select the team to add as the <b>{reserveSlotUiLabel}</b> for this Alliance.
                        </div>
                        <Select
                            classNamePrefix="gatool-rs"
                            placeholder="Choose team…"
                            options={availableTeams}
                            onChange={(/** @type {{ value: object } | null} */ opt) => {
                                if (opt?.value) {
                                    setBackupTeam({ backup: opt.value });
                                    setConfirmSelection(true);
                                }
                            }}
                        />
                        <Button
                            variant="outline-secondary"
                            onClick={() => {
                                setReserveAddSide(null);
                                setBackupTeam(null);
                            }}
                        >
                            Back
                        </Button>
                    </>
                )}
                {(reserveAddSide !== side || confirmSelection) && (
                    <>
                        {reserveCtx ? (
                            reserveShownFromApiOnly ? (
                                renderBackupModalFieldTile(
                                    { station: `${side}1`, teamNumber: reserveCtx.teamNumber },
                                    `reserve${side}`
                                )
                            ) : (
                                <button
                                    type="button"
                                    className={`btn w-100 ${side}Replace alliance-backup-modal-team-btn alliance-backup-modal-alliance-action-btn alliance-backup-modal-reserve-btn`}
                                    onClick={() => {
                                        setTeamSelected(reserveCtx);
                                        setConfirmSelection(false);
                                    }}
                                >
                                    Remove {reserveCtx.teamNumber} from {side} Alliance
                                </button>
                            )
                        ) : (
                            <button
                                type="button"
                                className={`btn w-100 ${side}Replace alliance-backup-modal-team-btn alliance-backup-modal-alliance-action-btn alliance-backup-modal-reserve-btn`}
                                onClick={() => {
                                    setReserveAddSide(side);
                                    setConfirmSelection(false);
                                    setBackupTeam(null);
                                }}
                            >
                                Add team to {side} Alliance
                            </button>
                        )}
                    </>
                )}
            </Col>
        );
    };

    const removeReserveConfirmBlockedByApi =
        Boolean(
            teamSelected?.isPlayoffReserve &&
            !hasLocalPlayoffReserveSetOverride(
                playoffReserveEdits,
                eventCodeForReserve,
                teamSelected.allianceNumber
            )
        );

    const matchHasPosted = matchHasPostedResult(matchDetails);
    const showTopBarAddTeamCol =
        (addBackupButton || inPractice) && !matchHasPosted;
    const showTopBarChangeTeamsCol = adHocMode || inPractice;
    const topBarCenterColXs =
        showTopBarAddTeamCol || showTopBarChangeTeamsCol ? "4" : "5";

    let eventTeams = teamList?.teams.map((team) => {
        return ({ "label": team.teamNumber, "value": team.teamNumber })
    }
    )

    _.forEach(adHocMatch, (item) => {
        _.remove(eventTeams, { "value": item.teamNumber })
    }
    )
    eventTeams.unshift({ "label": "None", "value": null });

    return (
        <>
            <Row style={{ "paddingTop": "10px", "paddingBottom": "10px" }}>
                <Col xs={"2"} lg={"3"}>
                    {!adHocMode && <Button size="lg" variant="outline-success" className={"gatool-button buttonNoWrap"} onClick={previousMatch}>{inPractice ? <span><CaretLeftFill /> <CaretLeftFill /></span> : <><span className={"d-none d-lg-block"}><CaretLeftFill /> Previous Match</span><span className={"d-block d-lg-none"}><CaretLeftFill /> <CaretLeftFill /></span></>}</Button>}
                </Col>
                {!adHocMode && <MatchClock matchDetails={matchDetails} timeFormat={timeFormat} />}
                <Col xs={topBarCenterColXs} lg={!ftcMode && (inPlayoffs || inPractice) ? "3" : "4"}><b>{eventLabel?.replace("FIRST Championship - ", "").replace("FIRST In Texas District Championship - ", "").replace("FIRST Ontario Provincial Championship - ", "").replace("New England FIRST District Championship - ", "")}</b><br />
                    {!adHocMode && (
                        <Select
                            classNamePrefix="gatool-rs"
                            options={matchMenu}
                            value={currentMatch ? matchMenu[currentMatch - 1] : matchMenu[0]}
                            onChange={handleMatchSelection}
                            classNames={{
                                option: (props) =>
                                    props.data?.matchCompleted ? "gatool-match-completed-option" : "",
                            }}
                            ref={selectRef}
                        />
                    )}
                    {adHocMode && <span className="announceOrganization">TEST MATCH</span>}
                </Col>
                {showTopBarAddTeamCol && <Col className="promoteBackup" xs={1} onClick={handleShow}>+<ArrowUpSquareFill />+<br />Add Team</Col>}
                {showTopBarChangeTeamsCol && <Col className="promoteBackup" xs={1} onClick={handleAdHoc}>Change<br />Teams</Col>}
                <Col xs={"2"} lg={"3"}>
                    {!adHocMode && <Button size="lg" variant="outline-success" className={"gatool-button buttonNoWrap"} onClick={nextMatch}>{inPractice ? <span><CaretRightFill /> <CaretRightFill /></span> : <><span className={"d-none d-lg-block"}>Next Match <CaretRightFill /></span><span className={"d-block d-lg-none"}><CaretRightFill /> <CaretRightFill /></span></>}</Button>}
                </Col>
                <Modal centered={true} show={show} onHide={handleClose} size="lg" dialogClassName="alliance-backup-modal-dialog">
                    <Modal.Header className={"promoteBackup"} closeButton closeVariant="white">
                        <Modal.Title>{teamSelected?.isPlayoffReserve ? "Remove reserve team" : "Call up reserve team"}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className={"backupDialog alliance-backup-modal-body"}>
                        <Container fluid>
                            {confirmSelection && backupTeam && reserveAddSide && !teamSelected && (
                                <>
                                    <Row>
                                        <Col>Add team {backupTeam.backup.teamNumber} as the <b>{reserveSlotUiLabel}</b> for the {reserveAddSide} Alliance?</Col>
                                    </Row>
                                    <Row className="mt-2">
                                        <Col>
                                            <Button className="me-2" variant="success" onClick={handleBackupConfirm}>Yes</Button>
                                            <Button variant="outline-secondary" onClick={handleBackupReconsider}>No, they reconsidered</Button>
                                        </Col>
                                    </Row>
                                </>
                            )}

                            {teamSelected?.isPlayoffReserve && <><Row>
                                <Col>Remove team {teamSelected?.teamNumber} from the {teamSelected?.side} Alliance?</Col>
                            </Row>
                                <Row className="mt-2">
                                    <Col>
                                        <Button
                                            className="me-2"
                                            variant="danger"
                                            disabled={removeReserveConfirmBlockedByApi}
                                            title={
                                                removeReserveConfirmBlockedByApi
                                                    ? "FIRST already lists a round 3 team for this Alliance; remove is disabled."
                                                    : undefined
                                            }
                                            onClick={handleRemoveReserveConfirm}
                                        >
                                            Remove reserve
                                        </Button>
                                        <Button variant="outline-secondary" onClick={() => { setTeamSelected(null) }}>Back</Button>
                                    </Col>
                                </Row></>}

                            {!teamSelected && !(confirmSelection && backupTeam && reserveAddSide) && <><Row>
                                <Col>Use <b>Add team to Alliance</b> to add the <b>{reserveSlotUiLabel}</b> for that Alliance. They become a permanent Alliance member after the match completes.</Col></Row>
                                <Row className="mt-3 g-3 alliance-backup-modal-columns">
                                    {renderAllianceReserveColumn(leftColumnSide, leftColumnTeams)}
                                    {renderAllianceReserveColumn(rightColumnSide, rightColumnTeams)}
                                </Row>
                            </>}
                        </Container>
                    </Modal.Body>
                </Modal>
                <Modal centered={true} show={showAdHoc} onHide={handleCloseAdHoc}>
                    <Modal.Header className={"promoteBackup"} closeButton closeVariant="white">
                        <Modal.Title>Configure Teams for Match</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Container>
                            {adHocMatch && <div>Select teams for each station below.</div>}
                            {!adHocMatch && <div className="gatool-awaiting-inline">Awaiting match data...</div>}
                            {!swapScreen && adHocMatch && <Table>
                                <Row>
                                    <Col className="blueAlliance"><div style={{ backgroundColor: "#98B4F4" }}><b>Blue 1</b> <Select classNamePrefix="gatool-rs" options={eventTeams} tabIndex={4} value={adHocMatch[3]?.teamNumber ? { "value": adHocMatch[3]?.teamNumber, "label": adHocMatch[3]?.teamNumber } : ""} onChange={(e) => { adHocStation(["Blue1", e]) }} /></div></Col>
                                    <Col className="redAlliance"><div style={{ backgroundColor: "#F7B3B4" }}><b>Red 3</b> <Select classNamePrefix="gatool-rs" options={eventTeams} tabIndex={3} value={adHocMatch[2]?.teamNumber ? { "value": adHocMatch[2]?.teamNumber, "label": adHocMatch[2]?.teamNumber } : ""} onChange={(e) => { adHocStation(["Red3", e]) }} /></div></Col>
                                </Row>
                                <Row>
                                    <Col className="blueAlliance"><div style={{ backgroundColor: "#98B4F4" }}><b>Blue 2</b> <Select classNamePrefix="gatool-rs" options={eventTeams} tabIndex={5} value={adHocMatch[4]?.teamNumber ? { "value": adHocMatch[4]?.teamNumber, "label": adHocMatch[4]?.teamNumber } : ""} onChange={(e) => { adHocStation(["Blue2", e]) }} /></div></Col>
                                    <Col className="redAlliance"><div style={{ backgroundColor: "#F7B3B4" }}><b>Red 2</b> <Select classNamePrefix="gatool-rs" options={eventTeams} tabIndex={2} value={adHocMatch[1]?.teamNumber ? { "value": adHocMatch[1]?.teamNumber, "label": adHocMatch[1]?.teamNumber } : ""} onChange={(e) => { adHocStation(["Red2", e]) }} /></div></Col>
                                </Row>
                                <Row>
                                    <Col className="blueAlliance"><div style={{ backgroundColor: "#98B4F4" }}><b>Blue 3</b> <Select classNamePrefix="gatool-rs" options={eventTeams} tabIndex={6} value={adHocMatch[5]?.teamNumber ? { "value": adHocMatch[5]?.teamNumber, "label": adHocMatch[5]?.teamNumber } : ""} onChange={(e) => { adHocStation(["Blue3", e]) }} /></div></Col>
                                    <Col className="redAlliance" ><div style={{ backgroundColor: "#F7B3B4" }}><b>Red 1</b><Select classNamePrefix="gatool-rs" options={eventTeams} tabIndex={1} value={adHocMatch[0]?.teamNumber ? { "value": adHocMatch[0]?.teamNumber, "label": adHocMatch[0]?.teamNumber } : ""} onChange={(e) => { adHocStation(["Red1", e]) }} /></div> </Col>

                                </Row>
                            </Table>}
                            {swapScreen && adHocMatch && <Table>
                                <Row>
                                    <Col className="redAlliance"><div style={{ backgroundColor: "#F7B3B4" }}><b>Red 3</b> <Select classNamePrefix="gatool-rs" options={eventTeams} tabIndex={4} value={adHocMatch[2]?.teamNumber ? { "value": adHocMatch[2]?.teamNumber, "label": adHocMatch[2]?.teamNumber } : ""} onChange={(e) => { adHocStation(["Red3", e]) }} /></div></Col>
                                    <Col className="blueAlliance"><div style={{ backgroundColor: "#98B4F4" }}><b>Blue 1</b> <Select classNamePrefix="gatool-rs" options={eventTeams} tabIndex={3} value={adHocMatch[3]?.teamNumber ? { "value": adHocMatch[3]?.teamNumber, "label": adHocMatch[3]?.teamNumber } : ""} onChange={(e) => { adHocStation(["Blue1", e]) }} /></div></Col>
                                </Row>
                                <Row>
                                    <Col className="redAlliance"><div style={{ backgroundColor: "#F7B3B4" }}><b>Red 2</b> <Select classNamePrefix="gatool-rs" options={eventTeams} tabIndex={5} value={adHocMatch[1]?.teamNumber ? { "value": adHocMatch[1]?.teamNumber, "label": adHocMatch[1]?.teamNumber } : ""} onChange={(e) => { adHocStation(["Red2", e]) }} /></div></Col>
                                    <Col className="blueAlliance"><div style={{ backgroundColor: "#98B4F4" }}><b>Blue 2</b> <Select classNamePrefix="gatool-rs" options={eventTeams} tabIndex={2} value={adHocMatch[4]?.teamNumber ? { "value": adHocMatch[4]?.teamNumber, "label": adHocMatch[4]?.teamNumber } : ""} onChange={(e) => { adHocStation(["Blue2", e]) }} /></div></Col>
                                </Row>
                                <Row>
                                    <Col className="redAlliance" ><div style={{ backgroundColor: "#F7B3B4" }}><b>Red 1</b><Select classNamePrefix="gatool-rs" options={eventTeams} tabIndex={6} value={adHocMatch[0]?.teamNumber ? { "value": adHocMatch[0]?.teamNumber, "label": adHocMatch[0]?.teamNumber } : ""} onChange={(e) => { adHocStation(["Red1", e]) }} /></div> </Col>
                                    <Col className="blueAlliance"><div style={{ backgroundColor: "#98B4F4" }}><b>Blue 3</b> <Select classNamePrefix="gatool-rs" options={eventTeams} tabIndex={1} value={adHocMatch[5]?.teamNumber ? { "value": adHocMatch[5]?.teamNumber, "label": adHocMatch[5]?.teamNumber } : ""} onChange={(e) => { adHocStation(["Blue3", e]) }} /></div></Col>
                                </Row>
                            </Table>}
                        </Container>
                    </Modal.Body>
                </Modal>
            </Row>
        </>
    )
}

export default TopButtons;