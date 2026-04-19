import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Row, Col, Button, Modal, Container, Nav } from "react-bootstrap";
import { ArrowUpSquareFill, CaretLeftFill, CaretRightFill, GripVertical } from "react-bootstrap-icons";
import Select from "react-select";
import MatchClock from "../components/MatchClock";
import _ from "lodash";
import { useHotkeysContext } from "react-hotkeys-hook";
import { roundThreeOrReserveRoleLabel } from "../utils/allianceRoleLabels";
import {
    matchHasPostedResult,
} from "../utils/playoffReserveEdits";
import { useSettings } from "../contexts/SettingsContext";
import AdHocMatchModal from "../components/AdHocMatchModal";
import {
    hasLocalPlayoffReserveSetOverride,
    syncAllianceLookupRound3Entry,
    clearAllianceLookupRound3,
    getAllianceIndexForMatchSide,
    getPlayoffReserveForSide,
} from "../components/allianceHelpers";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    TouchSensor,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    getPlayoffStationOrderMatchKey,
    partitionMatchTeamsByAllianceColor,
    canonicalAllianceStation,
} from "../utils/playoffStationOrderEdits";
import { getFieldStationsInPlayByPlayVisualOrder } from "../utils/playByPlayDisplayOrder";
import { getAllianceLookupEntry } from "../utils/allianceLookup";

// ─── Reorder (drag-and-drop) helpers ─────────────────────────────────────────

function withSortKeys(rows, prefix) {
    return (rows || []).map((t) => ({
        ..._.cloneDeep(t),
        _sortKey: _.uniqueId(prefix),
    }));
}

function stripSortKeys(rows) {
    return (rows || []).map((row) => _.omit(row, "_sortKey"));
}

function normalizeTeamNum(raw, remapStringToNumber) {
    if (raw == null || raw === "") return null;
    const n = remapStringToNumber ? Number(remapStringToNumber(raw)) : Number(raw);
    if (Number.isNaN(n) || n <= 0) return null;
    return n;
}

function isRedFieldStation(station) {
    return /^Red[123]$/.test(canonicalAllianceStation(station));
}

function isBlueFieldStation(station) {
    return /^Blue[123]$/.test(canonicalAllianceStation(station));
}

function isAllianceFieldStation(station) {
    return isRedFieldStation(station) || isBlueFieldStation(station);
}

function fieldTeamNumberSetFromRows(rows, remapStringToNumber) {
    const s = new Set();
    stripSortKeys(rows || []).forEach((t) => {
        if (!isAllianceFieldStation(t?.station)) return;
        const n = normalizeTeamNum(t?.teamNumber, remapStringToNumber);
        if (n != null) s.add(n);
    });
    return s;
}

function swapTeamPayload(a, b) {
    if (!a || !b) return;
    const keys = ["teamNumber", "surrogate", "dq"];
    keys.forEach((k) => {
        const t = a[k];
        a[k] = b[k];
        b[k] = t;
    });
}

function playoffSortRowPaletteKey(station) {
    if (!station) return "bench";
    const c = canonicalAllianceStation(station);
    if (/^Red[123]$/.test(c)) return "red";
    if (/^Blue[123]$/.test(c)) return "blue";
    return "bench";
}

function computeSideDragNext(prev, activeKey, overKey, isFieldStation) {
    const items = prev.map((x) => ({ ...x }));
    const ai = items.findIndex((x) => x._sortKey === activeKey);
    const oi = items.findIndex((x) => x._sortKey === overKey);
    if (ai < 0 || oi < 0) return prev;
    const activeItem = items[ai];
    const overItem = items[oi];
    const af = isFieldStation(activeItem.station);
    const of = isFieldStation(overItem.station);
    if (af && of) {
        return arrayMove(items, ai, oi);
    }
    if ((af && !of) || (!af && of)) {
        swapTeamPayload(activeItem, overItem);
        return items;
    }
    return arrayMove(items, ai, oi);
}

function getBenchTeamNumbersForSide(
    sideRows,
    matchDetails,
    alliances,
    remapNumberToString,
    remapStringToNumber,
    sidePrefix
) {
    if (!matchDetails?.teams || !alliances?.Lookup || !alliances?.alliances?.length) {
        return [];
    }
    const stations = [`${sidePrefix}1`, `${sidePrefix}2`, `${sidePrefix}3`];
    const anchor = stations
        .map((st) => matchDetails.teams.find((t) => canonicalAllianceStation(t?.station) === st))
        .find((t) => normalizeTeamNum(t?.teamNumber, remapStringToNumber));
    if (!anchor) return [];
    const entry = getAllianceLookupEntry(alliances.Lookup, anchor.teamNumber, remapNumberToString);
    if (!entry?.alliance) return [];
    const row =
        alliances.alliances.find((a) => a.name === entry.alliance) ||
        alliances.alliances.find((a) => Number(a.number) === Number(entry.number));
    if (!row) return [];
    const field = fieldTeamNumberSetFromRows(sideRows, remapStringToNumber);
    const roster = _.uniq(
        _.compact([row.captain, row.round1, row.round2, row.round3, row.backup]).map((x) =>
            normalizeTeamNum(x, remapStringToNumber)
        )
    );
    return roster.filter((n) => n != null && !field.has(n));
}

function SortableTeamRow({ id, teamNumber, orderHint, station }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id,
    });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.65 : 1,
    };
    const display =
        teamNumber != null && teamNumber !== "" && Number(teamNumber) > 0 ? teamNumber : "—";
    const palette = playoffSortRowPaletteKey(station);
    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`d-flex align-items-center border rounded px-2 py-2 mb-2 playoff-station-sort-row playoff-station-sort-row--${palette}`}
        >
            <span
                className="playoff-station-sort-handle me-2"
                {...attributes}
                {...listeners}
                aria-label="Drag to reorder"
            >
                <GripVertical size={20} />
            </span>
            <div className="min-w-0">
                <small className="playoff-station-sort-meta d-block">{orderHint}</small>
                <div className="playoff-station-sort-team">Team {display}</div>
            </div>
        </div>
    );
}

// ─── TopButtons ───────────────────────────────────────────────────────────────

function TopButtons({ previousMatch, nextMatch, currentMatch, matchMenu, setMatchFromMenu, selectedEvent, matchDetails, rawMatchDetailsForReserve, alliances, setAlliances, rankings, inPlayoffs, backupTeam, setBackupTeam, upsertPlayoffReserveOverlay, removePlayoffReserveOverlay, playoffReserveEdits, playoffStationOrderEdits, upsertPlayoffStationOrderOverlay, removePlayoffStationOrderOverlay, teamList, adHocMatch, setAdHocMatch, adHocMode, playoffOnly, eventLabel, ftcMode, remapNumberToString, remapStringToNumber }) {
    const { swapScreen } = useSettings();

    // ── shared modal state ────────────────────────────────────────────────────
    const [showTeamOpsModal, setShowTeamOpsModal] = useState(false);
    const [activeTab, setActiveTab] = useState("addTeam"); // "addTeam" | "reorder"

    const [showAdHoc, setAdHoc] = useState(null);
    const [teamSelected, setTeamSelected] = useState(null);
    const [confirmSelection, setConfirmSelection] = useState(false);
    const [reserveAddSide, setReserveAddSide] = useState(/** @type {null | 'Red' | 'Blue'} */ (null));
    const { disableScope, enableScope } = useHotkeysContext();

    // ── reorder (drag-and-drop) state ─────────────────────────────────────────
    const [redItems, setRedItems] = useState([]);
    const [blueItems, setBlueItems] = useState([]);
    const [restItems, setRestItems] = useState([]);
    const [listEpoch, setListEpoch] = useState(0);

    const lastInitTokenRef = useRef("");
    const redItemsRef = useRef([]);
    const blueItemsRef = useRef([]);
    const restItemsRef = useRef([]);
    const visualRedOrderRef = useRef([]);
    const visualBlueOrderRef = useRef([]);

    useEffect(() => { redItemsRef.current = redItems; }, [redItems]);
    useEffect(() => { blueItemsRef.current = blueItems; }, [blueItems]);
    useEffect(() => { restItemsRef.current = restItems; }, [restItems]);

    const reorderShow = showTeamOpsModal && activeTab === "reorder";

    const eventCode = selectedEvent?.value?.code;

    const matchKey = useMemo(
        () => (matchDetails ? getPlayoffStationOrderMatchKey(matchDetails, ftcMode) : null),
        [matchDetails, ftcMode]
    );

    useEffect(() => {
        if (!reorderShow) {
            lastInitTokenRef.current = "";
            return;
        }
        if (!matchDetails?.teams) return;
        const allianceSig = `${alliances?.alliances?.length ?? 0}:${alliances?.Lookup ? "1" : "0"}`;
        const initToken = `${listEpoch}|${matchKey}|${ftcMode}|${swapScreen}|${allianceSig}`;
        if (lastInitTokenRef.current === initToken) return;
        lastInitTokenRef.current = initToken;

        const { rest } = partitionMatchTeamsByAllianceColor(matchDetails.teams);
        const teams = matchDetails.teams || [];

        const visualRed = getFieldStationsInPlayByPlayVisualOrder("Red", ftcMode, swapScreen);
        visualRedOrderRef.current = visualRed;
        const fieldRed = visualRed.map((st) => {
            const t = teams.find((x) => canonicalAllianceStation(x?.station) === st);
            return _.cloneDeep(t || { station: st, teamNumber: null, surrogate: false, dq: false });
        });
        const benchRedNums = getBenchTeamNumbersForSide(
            fieldRed, matchDetails, alliances, remapNumberToString, remapStringToNumber, "Red"
        );
        const benchRed = benchRedNums.map((n) => ({
            station: null, teamNumber: n, surrogate: false, dq: false,
        }));
        setRedItems(withSortKeys([...fieldRed, ...benchRed], "r"));

        const visualBlue = getFieldStationsInPlayByPlayVisualOrder("Blue", ftcMode, swapScreen);
        visualBlueOrderRef.current = visualBlue;
        const fieldBlue = visualBlue.map((st) => {
            const t = teams.find((x) => canonicalAllianceStation(x?.station) === st);
            return _.cloneDeep(t || { station: st, teamNumber: null, surrogate: false, dq: false });
        });
        const benchBlueNums = getBenchTeamNumbersForSide(
            fieldBlue, matchDetails, alliances, remapNumberToString, remapStringToNumber, "Blue"
        );
        const benchBlue = benchBlueNums.map((n) => ({
            station: null, teamNumber: n, surrogate: false, dq: false,
        }));
        setBlueItems(withSortKeys([...fieldBlue, ...benchBlue], "b"));

        const restClone = rest.map((t) => _.cloneDeep(t));
        restItemsRef.current = restClone;
        setRestItems(restClone);
    }, [
        reorderShow,
        matchDetails,
        listEpoch,
        matchKey,
        ftcMode,
        swapScreen,
        alliances,
        remapNumberToString,
        remapStringToNumber,
    ]);

    const dndSensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 6 } })
    );

    const redIds = redItems.map((t) => t._sortKey);
    const blueIds = blueItems.map((t) => t._sortKey);

    const hasPersistedOverride = Boolean(
        eventCode && matchKey && playoffStationOrderEdits?.[eventCode]?.[matchKey]
    );

    const persistFromLists = useCallback(
        (red, blue, restSnap) => {
            if (!eventCode || !matchKey) return;
            const visualRed = visualRedOrderRef.current;
            const visualBlue = visualBlueOrderRef.current;
            const redField = stripSortKeys(red).filter((r) => isRedFieldStation(r.station));
            const blueField = stripSortKeys(blue).filter((r) => isBlueFieldStation(r.station));
            const redWithStations = redField.map((row, i) => ({
                ...row,
                station: visualRed[i] ?? `Red${i + 1}`,
            }));
            const blueWithStations = blueField.map((row, i) => ({
                ...row,
                station: visualBlue[i] ?? `Blue${i + 1}`,
            }));
            const teams = [...redWithStations, ...blueWithStations, ...(restSnap || [])];
            upsertPlayoffStationOrderOverlay({ eventCode, matchKey, teams });
        },
        [eventCode, matchKey, upsertPlayoffStationOrderOverlay]
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const a = String(active.id);
        const o = String(over.id);
        if (redIds.includes(a) && redIds.includes(o)) {
            setRedItems((prev) => {
                const next = computeSideDragNext(prev, a, o, isRedFieldStation);
                if (next !== prev) {
                    queueMicrotask(() =>
                        persistFromLists(next, blueItemsRef.current, restItemsRef.current)
                    );
                }
                return next;
            });
            return;
        }
        if (blueIds.includes(a) && blueIds.includes(o)) {
            setBlueItems((prev) => {
                const next = computeSideDragNext(prev, a, o, isBlueFieldStation);
                if (next !== prev) {
                    queueMicrotask(() =>
                        persistFromLists(redItemsRef.current, next, restItemsRef.current)
                    );
                }
                return next;
            });
        }
    };

    const handleReorderReset = () => {
        if (eventCode && matchKey) {
            removePlayoffStationOrderOverlay({ eventCode, matchKey });
        }
        setListEpoch((e) => e + 1);
    };

    const blueColumnFirst = !swapScreen;

    const reorderRedColumn = (() => {
        let fieldIdx = 0;
        return (
            <Col md={6} key="col-red">
                <SortableContext items={redIds} strategy={verticalListSortingStrategy}>
                    {redItems.map((t) => {
                        const isField = isRedFieldStation(t.station);
                        const fi = isField ? fieldIdx++ : -1;
                        const finalStation = isField ? (visualRedOrderRef.current[fi] ?? t.station) : t.station;
                        const label = isField ? finalStation : "Bench / not on field";
                        return (
                            <SortableTeamRow
                                key={t._sortKey}
                                id={t._sortKey}
                                station={finalStation}
                                teamNumber={t?.teamNumber}
                                orderHint={label}
                            />
                        );
                    })}
                </SortableContext>
            </Col>
        );
    })();

    const reorderBlueColumn = (() => {
        let fieldIdx = 0;
        return (
            <Col md={6} key="col-blue">
                <SortableContext items={blueIds} strategy={verticalListSortingStrategy}>
                    {blueItems.map((t) => {
                        const isField = isBlueFieldStation(t.station);
                        const fi = isField ? fieldIdx++ : -1;
                        const finalStation = isField ? (visualBlueOrderRef.current[fi] ?? t.station) : t.station;
                        const label = isField ? finalStation : "Bench / not on field";
                        return (
                            <SortableTeamRow
                                key={t._sortKey}
                                id={t._sortKey}
                                station={finalStation}
                                teamNumber={t?.teamNumber}
                                orderHint={label}
                            />
                        );
                    })}
                </SortableContext>
            </Col>
        );
    })();

    // ── open / close handlers ────────────────────────────────────────────────
    const handleShow = () => {
        setActiveTab(showTopBarReorderStationsCol && !showTopBarAddTeamCol ? "reorder" : "addTeam");
        setShowTeamOpsModal(true);
        setReserveAddSide(null);
        disableScope("matchNavigation");
        disableScope("tabNavigation");
    };

    const handleClose = () => {
        setShowTeamOpsModal(false);
        setTeamSelected(null);
        setConfirmSelection(false);
        setReserveAddSide(null);
        enableScope("matchNavigation");
        enableScope("tabNavigation");
    };

    const handleAdHoc = () => {
        setAdHoc(true);
        disableScope("matchNavigation");
        disableScope("tabNavigation");
    };

    const handleCloseAdHoc = () => {
        setAdHoc(false);
        enableScope("matchNavigation");
        enableScope("tabNavigation");
    };

    const handleBackupReconsider = () => {
        setConfirmSelection(false);
        setBackupTeam(null);
    };

    const handleMatchSelection = (newMatch) => {
        setMatchFromMenu(newMatch);
        selectRef.current?.blur();
    };

    const selectRef = useRef(null);

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
                (matchDetails.matchNumber != null || matchDetails.originalMatchNumber != null)
                    ? {
                          tournamentLevel:
                              matchDetails.tournamentLevel || (inPlayoffs ? "Playoff" : null),
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
        setShowTeamOpsModal(false);
        setBackupTeam(null);
        setTeamSelected(null);
        setConfirmSelection(false);
        setReserveAddSide(null);
        enableScope("matchNavigation");
        enableScope("tabNavigation");
    };

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
        // Also clear any station-order reordering for this match — the reorder
        // may have placed the reserve team into a field station, which is now invalid.
        if (eventCode && matchKey) {
            removePlayoffStationOrderOverlay?.({ eventCode, matchKey });
        }
        setAlliances(alliancesTemp);
        setShowTeamOpsModal(false);
        setBackupTeam(null);
        setTeamSelected(null);
        setConfirmSelection(false);
        setReserveAddSide(null);
        enableScope("matchNavigation");
        enableScope("tabNavigation");
    };

    // ── derived data ─────────────────────────────────────────────────────────

    var allianceMembers = alliances?.Lookup ? Object.keys(alliances?.Lookup) : null;
    var availableTeams = [];
    if (selectedEvent?.value?.name.includes("OFFLINE")) {
        teamList?.teams.forEach((team) => {
            if (_.indexOf(allianceMembers, String(team.teamNumber)) < 0) {
                availableTeams.push({ label: team.teamNumber, value: team });
            }
        });
    } else {
        rankings?.ranks.forEach((team) => {
            if (_.indexOf(allianceMembers, String(team.teamNumber)) < 0) {
                availableTeams.push({ label: team.teamNumber, value: team });
            }
        });
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
    const isBuiltInPracticeTrainingEvent =
        selectedEvent?.value?.code === "PRACTICE1" ||
        selectedEvent?.value?.code === "PRACTICE2" ||
        selectedEvent?.value?.code === "PRACTICE3" ||
        selectedEvent?.value?.code === "PRACTICE4";
    const addBackupButton =
        !ftcMode &&
        inPlayoffs &&
        ((selectedEvent?.value?.champLevel !== "CHAMPS" &&
            selectedEvent?.value?.champLevel !== "CMPDIV" &&
            selectedEvent?.value?.champLevel !== "CMPSUB") ||
            (selectedEvent?.value?.code === "OFFLINE" && !playoffOnly));

    const reserveMatchDetails = rawMatchDetailsForReserve ?? matchDetails;

    const fieldTeamsOnly = reserveMatchDetails?.teams || [];
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

    const blueAllianceColumnFirst = !swapScreen;
    const leftColumnTeams = blueAllianceColumnFirst ? blueFieldTeams : redFieldTeams;
    const rightColumnTeams = blueAllianceColumnFirst ? redFieldTeams : blueFieldTeams;
    const leftColumnSide = blueAllianceColumnFirst ? "Blue" : "Red";
    const rightColumnSide = blueAllianceColumnFirst ? "Red" : "Blue";

    const redReserveCtx = getPlayoffReserveForSide("Red", reserveMatchDetails, alliances, inPlayoffs);
    const blueReserveCtx = getPlayoffReserveForSide("Blue", reserveMatchDetails, alliances, inPlayoffs);
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
                eventCode,
                reserveCtx.allianceNumber
            );
        return (
            <Col xs={12} md={6} className="d-flex flex-column gap-2">
                {teams.map((team, index) => renderBackupModalFieldTile(team, index))}
                {reserveAddSide === side && !confirmSelection && !reserveCtx && (
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

    const removeReserveConfirmBlockedByApi = Boolean(
        teamSelected?.isPlayoffReserve &&
            !hasLocalPlayoffReserveSetOverride(
                playoffReserveEdits,
                eventCode,
                teamSelected.allianceNumber
            )
    );

    const matchHasPosted = matchHasPostedResult(matchDetails);
    // Hide the Add/Reorder button when any alliance member in the match is still unknown (teamNumber 0 or missing)
    const mainStations = ftcMode
        ? ["Red1","Red2","Blue1","Blue2"]
        : ["Red1","Red2","Red3","Blue1","Blue2","Blue3"];
    const allAllianceMembersKnown = inPlayoffs && matchDetails?.teams
        ? mainStations.every(
            (st) => {
                const entry = matchDetails.teams.find((t) => t.station === st);
                return entry?.teamNumber && entry.teamNumber !== 0;
            }
          )
        : true;
    const showTopBarAddTeamCol =
        (addBackupButton ||
            inPractice ||
            (isBuiltInPracticeTrainingEvent && inPlayoffs)) &&
        !matchHasPosted &&
        allAllianceMembersKnown;
    const showTopBarChangeTeamsCol = adHocMode || inPractice;
    const showTopBarReorderStationsCol =
        showTopBarAddTeamCol &&
        inPlayoffs &&
        matchDetails &&
        !(matchDetails?.description || "").includes("Bye Match");
    // Show a single combined button when either the add-team or reorder action is available.
    const showTopBarTeamOpsCol = showTopBarAddTeamCol || showTopBarReorderStationsCol;
    const promoteCount =
        (showTopBarTeamOpsCol ? 1 : 0) +
        (showTopBarChangeTeamsCol ? 1 : 0);
    const topBarCenterColXs =
        promoteCount === 0 ? "5" : promoteCount === 1 ? "4" : "3";

    let eventTeams = teamList?.teams.map((team) => ({
        label: team.teamNumber,
        value: team.teamNumber,
    }));
    _.forEach(adHocMatch, (item) => {
        _.remove(eventTeams, { value: item.teamNumber });
    });
    eventTeams.unshift({ label: "None", value: null });

    // ── modal title adapts to tab + reserve state ─────────────────────────────
    const modalTitle = 
        teamSelected?.isPlayoffReserve
          ? "Remove reserve team"
          : "Add / Reorder Teams";

    return (
        <>
            <Row style={{ paddingTop: "10px", paddingBottom: "10px" }}>
                <Col xs={"2"} lg={"3"}>
                    {!adHocMode && (
                        <Button
                            size="lg"
                            variant="outline-success"
                            className={"gatool-button buttonNoWrap"}
                            onClick={previousMatch}
                        >
                            {inPractice ? (
                                <span>
                                    <CaretLeftFill /> <CaretLeftFill />
                                </span>
                            ) : (
                                <>
                                    <span className={"d-none d-lg-block"}>
                                        <CaretLeftFill /> Previous Match
                                    </span>
                                    <span className={"d-block d-lg-none"}>
                                        <CaretLeftFill /> <CaretLeftFill />
                                    </span>
                                </>
                            )}
                        </Button>
                    )}
                </Col>
                {!adHocMode && <MatchClock matchDetails={matchDetails} />}
                <Col
                    xs={topBarCenterColXs}
                    lg={!ftcMode && (inPlayoffs || inPractice) ? (showTopBarTeamOpsCol ? "3" : "4") : "4"}
                >
                    <b>
                        {eventLabel
                            ?.replace("FIRST Championship - ", "")
                            .replace("FIRST In Texas District Championship - ", "")
                            .replace("FIRST Ontario Provincial Championship - ", "")
                            .replace("New England FIRST District Championship - ", "")}
                    </b>
                    <br />
                    {!adHocMode && (
                        <Select
                            classNamePrefix="gatool-rs"
                            options={matchMenu}
                            value={currentMatch ? matchMenu[currentMatch - 1] : matchMenu[0]}
                            onChange={handleMatchSelection}
                            classNames={{
                                option: (props) =>
                                    props.data?.matchCompleted
                                        ? "gatool-match-completed-option"
                                        : "",
                            }}
                            ref={selectRef}
                        />
                    )}
                    {adHocMode && <span className="announceOrganization">TEST MATCH</span>}
                </Col>

                {showTopBarTeamOpsCol && (
                    <Col className="promoteBackup" xs={1} onClick={handleShow}>
                        <ArrowUpSquareFill />
                        <br />
                        Add/Reorder
                        <br />
                        Teams
                    </Col>
                )}
                {showTopBarChangeTeamsCol && (
                    <Col className="promoteBackup" xs={1} onClick={handleAdHoc}>
                        Change
                        <br />
                        Teams
                    </Col>
                )}

                <Col xs={"2"} lg={"3"}>
                    {!adHocMode && (
                        <Button
                            size="lg"
                            variant="outline-success"
                            className={"gatool-button buttonNoWrap"}
                            onClick={nextMatch}
                        >
                            {inPractice ? (
                                <span>
                                    <CaretRightFill /> <CaretRightFill />
                                </span>
                            ) : (
                                <>
                                    <span className={"d-none d-lg-block"}>
                                        Next Match <CaretRightFill />
                                    </span>
                                    <span className={"d-block d-lg-none"}>
                                        <CaretRightFill /> <CaretRightFill />
                                    </span>
                                </>
                            )}
                        </Button>
                    )}
                </Col>

                {/* ── Combined Add Team / Reorder Teams modal ── */}
                <Modal
                    centered
                    show={showTeamOpsModal}
                    onHide={handleClose}
                    size="lg"
                    dialogClassName="alliance-backup-modal-dialog"
                    contentClassName="alliance-backup-modal__content playoff-station-order-modal__content"
                >
                    <Modal.Header className={"promoteBackup"} closeButton closeVariant="white">
                        <Modal.Title>{modalTitle}</Modal.Title>
                    </Modal.Header>

                    {/* Tab bar — only shown when both tabs are available */}
                    {showTopBarAddTeamCol && showTopBarReorderStationsCol && (                        <div className="px-3 pt-2 pb-0">
                            <Nav
                                variant="tabs"
                                activeKey={activeTab}
                                onSelect={(k) => {
                                    if (k) setActiveTab(k);
                                }}
                            >
                                <Nav.Item>
                                    <Nav.Link eventKey="addTeam">Add Team</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="reorder">Reorder Teams</Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </div>
                    )}

                    {/* ── Add Team tab ── */}
                    {activeTab === "addTeam" && (
                        <Modal.Body className={"backupDialog alliance-backup-modal-body"}>
                            <Container fluid>
                                {confirmSelection && backupTeam && reserveAddSide && !teamSelected && (
                                    <>
                                        <Row>
                                            <Col>
                                                Add team {backupTeam.backup.teamNumber} as the{" "}
                                                <b>{reserveSlotUiLabel}</b> for the {reserveAddSide} Alliance?
                                            </Col>
                                        </Row>
                                        <Row className="mt-2">
                                            <Col>
                                                <Button
                                                    className="me-2"
                                                    variant="success"
                                                    onClick={handleBackupConfirm}
                                                >
                                                    Yes
                                                </Button>
                                                <Button
                                                    variant="outline-secondary"
                                                    onClick={handleBackupReconsider}
                                                >
                                                    No, they reconsidered
                                                </Button>
                                            </Col>
                                        </Row>
                                    </>
                                )}

                                {teamSelected?.isPlayoffReserve && (
                                    <>
                                        <Row>
                                            <Col>
                                                Remove team {teamSelected?.teamNumber} from the{" "}
                                                {teamSelected?.side} Alliance?
                                            </Col>
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
                                                <Button
                                                    variant="outline-secondary"
                                                    onClick={() => {
                                                        setTeamSelected(null);
                                                    }}
                                                >
                                                    Back
                                                </Button>
                                            </Col>
                                        </Row>
                                    </>
                                )}

                                {!teamSelected && !(confirmSelection && backupTeam && reserveAddSide) && (
                                    <>
                                        <Row>
                                            <Col>
                                                Use <b>Add team to Alliance</b> to add the{" "}
                                                <b>{reserveSlotUiLabel}</b> for that Alliance. They become a permanent Alliance member after the match completes.
                                            </Col>
                                        </Row>
                                        <Row className="mt-3 g-3 alliance-backup-modal-columns">
                                            {renderAllianceReserveColumn(leftColumnSide, leftColumnTeams)}
                                            {renderAllianceReserveColumn(rightColumnSide, rightColumnTeams)}
                                        </Row>
                                    </>
                                )}
                            </Container>
                        </Modal.Body>
                    )}

                    {/* ── Reorder Teams tab ── */}
                    {activeTab === "reorder" && (
                        <>
                            <Modal.Body>
                                <p >
                                    Drag up and down to reorder teams for{" "}
                                    <b>{matchDetails?.description || "this match"}</b>. The positions here align with the positions on the Field as seen from the scoring table. Announce and Play-by-Play update as you drag.
                                </p>
                                <DndContext
                                    sensors={dndSensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <Row className="g-3">
                                        {blueColumnFirst ? (
                                            <>
                                                {reorderBlueColumn}
                                                {reorderRedColumn}
                                            </>
                                        ) : (
                                            <>
                                                {reorderRedColumn}
                                                {reorderBlueColumn}
                                            </>
                                        )}
                                    </Row>
                                </DndContext>
                            </Modal.Body>
                            <Modal.Footer className="d-flex flex-wrap gap-2">
                                <Button
                                    variant="outline-danger"
                                    onClick={handleReorderReset}
                                    title={
                                        hasPersistedOverride
                                            ? "Remove saved order and reload from schedule"
                                            : "Reload field order from the current schedule"
                                    }
                                >
                                    Reset to schedule
                                </Button>
                                <Button variant="outline-secondary" onClick={handleClose}>
                                    Close
                                </Button>
                            </Modal.Footer>
                        </>
                    )}
                </Modal>

                {/* ── Ad-hoc (Change Teams) modal ── */}
                <AdHocMatchModal
                    show={showAdHoc}
                    onHide={handleCloseAdHoc}
                    adHocMatch={adHocMatch}
                    onStationChange={setAdHocMatch}
                    eventTeams={eventTeams}
                />
            </Row>
        </>
    );
}

export default TopButtons;
