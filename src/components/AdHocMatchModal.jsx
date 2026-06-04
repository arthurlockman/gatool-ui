import { useState, useEffect } from "react";
import { Row, Col, Modal, Container } from "react-bootstrap";
import Select from "react-select";
import _ from "lodash";
import { GripVertical } from "react-bootstrap-icons";
import { useSettings } from "../contexts/SettingsContext";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ─── Sortable team row ────────────────────────────────────────────────────────

function SortableAllianceMember({ id, teamNumber, role, stationLabel, color }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id });
    const bgColor = color === "Red" ? "#F7B3B4" : "#98B4F4";
    const borderColor = color === "Red" ? "#c08080" : "#8090c8";
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.55 : 1,
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: "4px",
        padding: "6px 10px",
        marginBottom: "6px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
    };
    return (
        <div ref={setNodeRef} style={style}>
            <span style={{ cursor: "grab", color: "#555", flexShrink: 0 }} {...attributes} {...listeners}>
                <GripVertical size={16} />
            </span>
            <div style={{ minWidth: 0 }}>
                <small className="text-muted d-block">{stationLabel}</small>
                <strong>Team {teamNumber}</strong>
                <small className="d-block text-muted">{role}</small>
            </div>
        </div>
    );
}

// ─── adHocStation helper ──────────────────────────────────────────────────────

function adHocStation(adHocMatch, station, teamNumber, onStationChange, useFourTeamAlliances) {
    var adHocMatchNew = _.cloneDeep(adHocMatch);
    if (_.isNull(adHocMatchNew)) {
        adHocMatchNew = useFourTeamAlliances
            ? [
                { teamNumber: null, station: "Red1", surrogate: false, dq: false },
                { teamNumber: null, station: "Red2", surrogate: false, dq: false },
                { teamNumber: null, station: "Red3", surrogate: false, dq: false },
                { teamNumber: null, station: "Red4", surrogate: false, dq: false },
                { teamNumber: null, station: "Blue1", surrogate: false, dq: false },
                { teamNumber: null, station: "Blue2", surrogate: false, dq: false },
                { teamNumber: null, station: "Blue3", surrogate: false, dq: false },
                { teamNumber: null, station: "Blue4", surrogate: false, dq: false },
            ]
            : [
                { teamNumber: null, station: "Red1", surrogate: false, dq: false },
                { teamNumber: null, station: "Red2", surrogate: false, dq: false },
                { teamNumber: null, station: "Red3", surrogate: false, dq: false },
                { teamNumber: null, station: "Blue1", surrogate: false, dq: false },
                { teamNumber: null, station: "Blue2", surrogate: false, dq: false },
                { teamNumber: null, station: "Blue3", surrogate: false, dq: false },
            ];
    }
    const idx = _.findIndex(adHocMatchNew, { station: station });
    if (idx === -1) {
        adHocMatchNew.push({ teamNumber: teamNumber, station: station, surrogate: false, dq: false });
    } else {
        adHocMatchNew[idx].teamNumber = teamNumber;
    }
    onStationChange(adHocMatchNew);
}

// ─── Main component ───────────────────────────────────────────────────────────

function AdHocMatchModal({ show, onHide, adHocMatch, onStationChange, eventTeams, allianceSelectionArrays, alliances, selectedRedAlliance, setSelectedRedAlliance, selectedBlueAlliance, setSelectedBlueAlliance }) {
    const { swapScreen, useFourTeamAlliances } = useSettings();

    const [redSortItems, setRedSortItems] = useState([]);
    const [blueSortItems, setBlueSortItems] = useState([]);

    // DnD sensors — must always be called (hooks rules)
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
    );

    // Normalize API alliance format (raw numbers) to tool format ({ teamNumber: N } objects)
    const normalizeApiAlliance = (a) => ({
        number: a.number,
        name: a.name || `Alliance ${a.number}`,
        captain: a.captain != null ? { teamNumber: Number(a.captain) } : null,
        round1: a.round1 != null ? { teamNumber: Number(a.round1) } : null,
        round2: a.round2 != null ? { teamNumber: Number(a.round2) } : null,
        round3: a.round3 != null ? { teamNumber: Number(a.round3) } : null,
    });

    const rawAlliances = (allianceSelectionArrays?.alliances?.length > 0)
        ? allianceSelectionArrays.alliances
        : (alliances?.alliances || []).map(normalizeApiAlliance);

    const qualifiedAlliances = rawAlliances.filter(
        (a) => a.captain?.teamNumber && a.round1?.teamNumber && a.round2?.teamNumber
    );
    const hasAlliances = qualifiedAlliances.length > 0;

    // Build a role map for an alliance: teamNumber → role label
    const buildRoleMap = (alliance) => {
        if (!alliance) return {};
        const map = {};
        if (alliance.captain?.teamNumber) map[alliance.captain.teamNumber] = "Captain";
        if (alliance.round1?.teamNumber) map[alliance.round1.teamNumber] = "Round 1 Selection";
        if (alliance.round2?.teamNumber) map[alliance.round2.teamNumber] = "Round 2 Selection";
        if (alliance.round3?.teamNumber) map[alliance.round3.teamNumber] = "Round 3 Selection";
        return map;
    };

    // Build sort items for a color by reading current station assignments from adHocMatch
    const buildSortItems = (color, allianceNumber, currentMatch) => {
        const alliance = qualifiedAlliances.find((a) => a.number === allianceNumber);
        if (!alliance) return [];
        const roles = buildRoleMap(alliance);
        // Red physical field order: Station 3 (top) → Station 2 → Station 1 (bottom) → Reserve
        const stations = color === "Red"
            ? ["Red3", "Red2", "Red1", "Red4"]
            : ["Blue1", "Blue2", "Blue3", "Blue4"];
        return stations
            .map((station) => {
                const entry = currentMatch?.find((t) => t.station === station);
                if (!entry?.teamNumber) return null;
                return {
                    id: _.uniqueId(`${color.toLowerCase()}_`),
                    teamNumber: entry.teamNumber,
                    role: roles[entry.teamNumber] || "Member",
                };
            })
            .filter(Boolean);
    };

    // Re-sync sort items when modal is re-opened with a saved alliance selection
    useEffect(() => {
        if (show) {
            if (selectedRedAlliance) {
                setRedSortItems(buildSortItems("Red", selectedRedAlliance, adHocMatch));
            }
            if (selectedBlueAlliance) {
                setBlueSortItems(buildSortItems("Blue", selectedBlueAlliance, adHocMatch));
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show]);

    // Alliance dropdown options, excluding the alliance chosen on the other side
    const buildAllianceOptions = (excludeAllianceNumber) => [
        { value: null, label: "No Alliance" },
        ...qualifiedAlliances
            .filter((a) => a.number !== excludeAllianceNumber)
            .map((a) => {
                const members = [a.captain?.teamNumber, a.round1?.teamNumber, a.round2?.teamNumber];
                if (useFourTeamAlliances && a.round3?.teamNumber) members.push(a.round3.teamNumber);
                return { value: a.number, label: `${a.name}: ${members.join(", ")}` };
            }),
    ];

    // Apply an alliance to a color in adHocMatch, returning the new match array
    const applyAllianceToColor = (color, allianceNumber, currentMatch) => {
        const alliance = qualifiedAlliances.find((a) => a.number === allianceNumber);
        let newMatch = _.cloneDeep(currentMatch);
        if (!newMatch) {
            newMatch = useFourTeamAlliances
                ? [
                    { teamNumber: null, station: "Red1", surrogate: false, dq: false },
                    { teamNumber: null, station: "Red2", surrogate: false, dq: false },
                    { teamNumber: null, station: "Red3", surrogate: false, dq: false },
                    { teamNumber: null, station: "Red4", surrogate: false, dq: false },
                    { teamNumber: null, station: "Blue1", surrogate: false, dq: false },
                    { teamNumber: null, station: "Blue2", surrogate: false, dq: false },
                    { teamNumber: null, station: "Blue3", surrogate: false, dq: false },
                    { teamNumber: null, station: "Blue4", surrogate: false, dq: false },
                ]
                : [
                    { teamNumber: null, station: "Red1", surrogate: false, dq: false },
                    { teamNumber: null, station: "Red2", surrogate: false, dq: false },
                    { teamNumber: null, station: "Red3", surrogate: false, dq: false },
                    { teamNumber: null, station: "Blue1", surrogate: false, dq: false },
                    { teamNumber: null, station: "Blue2", surrogate: false, dq: false },
                    { teamNumber: null, station: "Blue3", surrogate: false, dq: false },
                ];
        }
        const stations = color === "Red"
            ? ["Red1", "Red2", "Red3", "Red4"]
            : ["Blue1", "Blue2", "Blue3", "Blue4"];
        const members = alliance
            ? [
                alliance.captain?.teamNumber || null,
                alliance.round1?.teamNumber || null,
                alliance.round2?.teamNumber || null,
                useFourTeamAlliances ? (alliance.round3?.teamNumber || null) : null,
            ]
            : [null, null, null, null];
        stations.forEach((station, i) => {
            const teamNumber = members[i] || null;
            const idx = _.findIndex(newMatch, { station });
            if (idx === -1) {
                if (teamNumber) newMatch.push({ teamNumber, station, surrogate: false, dq: false });
            } else {
                newMatch[idx].teamNumber = teamNumber;
            }
        });
        return newMatch;
    };

    const handleAllianceChange = (color, opt) => {
        const allianceNumber = opt?.value ?? null;
        if (color === "Red") setSelectedRedAlliance(allianceNumber);
        else setSelectedBlueAlliance(allianceNumber);

        const newMatch = applyAllianceToColor(color, allianceNumber, adHocMatch);
        onStationChange(newMatch);

        if (allianceNumber) {
            const items = buildSortItems(color, allianceNumber, newMatch);
            if (color === "Red") setRedSortItems(items);
            else setBlueSortItems(items);
        } else {
            if (color === "Red") setRedSortItems([]);
            else setBlueSortItems([]);
        }
    };

    const handleDragEnd = (color) => (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const items = color === "Red" ? redSortItems : blueSortItems;
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        if (color === "Red") setRedSortItems(newItems);
        else setBlueSortItems(newItems);

        // Write reordered team numbers back to adHocMatch (Red uses reversed physical order)
        const stations = color === "Red"
            ? ["Red3", "Red2", "Red1", "Red4"]
            : ["Blue1", "Blue2", "Blue3", "Blue4"];
        const newMatch = _.cloneDeep(adHocMatch);
        newItems.forEach((item, index) => {
            const idx = _.findIndex(newMatch, { station: stations[index] });
            if (idx >= 0) newMatch[idx].teamNumber = item.teamNumber;
        });
        // Clear stations beyond the sorted items count
        for (let i = newItems.length; i < stations.length; i++) {
            const idx = _.findIndex(newMatch, { station: stations[i] });
            if (idx >= 0) newMatch[idx].teamNumber = null;
        }
        onStationChange(newMatch);
    };

    const handleChange = (station, e) => {
        adHocStation(adHocMatch, station, e.value, onStationChange, useFourTeamAlliances);
    };

    const stationValue = (station) => {
        const entry = adHocMatch?.find((t) => t.station === station);
        return entry?.teamNumber ? { value: entry.teamNumber, label: entry.teamNumber } : "";
    };

    const stationSelect = (label, station, tabIndex, bgColor) => (
        <div style={{ backgroundColor: bgColor }}>
            <b>{label}</b>{" "}
            <Select
                classNamePrefix="gatool-rs"
                options={eventTeams}
                tabIndex={tabIndex}
                value={stationValue(station)}
                onChange={(e) => { handleChange(station, e); }}
            />
        </div>
    );

    const allianceDropdown = (color, bgColor) => {
        const isRed = color === "Red";
        const selected = isRed ? selectedRedAlliance : selectedBlueAlliance;
        const exclude = isRed ? selectedBlueAlliance : selectedRedAlliance;
        const options = buildAllianceOptions(exclude);
        const currentValue = options.find((o) => o.value === selected) || options[0];
        return (
            <div style={{ backgroundColor: bgColor, marginBottom: "8px" }}>
                <b>{color} Alliance</b>{" "}
                <Select
                    classNamePrefix="gatool-rs"
                    options={options}
                    value={currentValue}
                    onChange={(opt) => handleAllianceChange(color, opt)}
                />
            </div>
        );
    };

    // A column's team UI: reorder list when alliance chosen, individual selects otherwise
    const stationSelects = (color, bgColor, stations) => {
        const isRed = color === "Red";
        const selectedAlliance = isRed ? selectedRedAlliance : selectedBlueAlliance;
        const sortItems = isRed ? redSortItems : blueSortItems;

        if (selectedAlliance && sortItems.length > 0) {
            const stationLabels = isRed
                ? ["Station 3", "Station 2", "Station 1", "Reserve team"]
                : ["Station 1", "Station 2", "Station 3", "Reserve team"];
            return (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd(color)}
                >
                    <SortableContext
                        items={sortItems.map((i) => i.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {sortItems.map((item, index) => (
                            <SortableAllianceMember
                                key={item.id}
                                id={item.id}
                                teamNumber={item.teamNumber}
                                role={item.role}
                                stationLabel={stationLabels[index]}
                                color={color}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            );
        }

        return stations.map(([label, station, tabIndex]) =>
            stationSelect(label, station, tabIndex, bgColor)
        );
    };

    // Station order definitions (label, station name, tabIndex)
    // Red is reversed to match physical field layout: Station 3 (top) → Station 2 → Station 1 → Reserve team
    const blueStations = [
        ["Blue 1", "Blue1", 4],
        ["Blue 2", "Blue2", 5],
        ["Blue 3", "Blue3", 6],
        ...(useFourTeamAlliances ? [["Reserve team", "Blue4", 7]] : []),
    ];
    const redStations = [
        ["Red 3", "Red3", 3],
        ["Red 2", "Red2", 2],
        ["Red 1", "Red1", 1],
        ...(useFourTeamAlliances ? [["Reserve team", "Red4", 8]] : []),
    ];

    return (
        <Modal centered={true} show={show} onHide={onHide}>
            <Modal.Header className={"promoteBackup"} closeButton closeVariant="white">
                <Modal.Title>Configure Teams for Match</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Container>
                    {adHocMatch && <div style={{ marginBottom: "8px" }}>Select teams for each station below.</div>}
                    {!adHocMatch && (
                        <div className="gatool-awaiting-inline">Awaiting match data...</div>
                    )}
                    {adHocMatch && (
                        <Row>
                            <Col className={`${swapScreen ? "redAlliance" : "blueAlliance"}`}>
                                {hasAlliances && allianceDropdown(swapScreen ? "Red" : "Blue", swapScreen ? "#F7B3B4" : "#98B4F4")}
                                {stationSelects(
                                    swapScreen ? "Red" : "Blue",
                                    swapScreen ? "#F7B3B4" : "#98B4F4",
                                    swapScreen ? redStations : blueStations
                                )}
                            </Col>
                            <Col className={`${swapScreen ? "blueAlliance" : "redAlliance"}`}>
                                {hasAlliances && allianceDropdown(swapScreen ? "Blue" : "Red", swapScreen ? "#98B4F4" : "#F7B3B4")}
                                {stationSelects(
                                    swapScreen ? "Blue" : "Red",
                                    swapScreen ? "#98B4F4" : "#F7B3B4",
                                    swapScreen ? blueStations : redStations
                                )}
                            </Col>
                        </Row>
                    )}
                </Container>
            </Modal.Body>
        </Modal>
    );
}

export default AdHocMatchModal;
