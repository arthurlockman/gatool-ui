import { Row, Col, Modal, Container, Table } from "react-bootstrap";
import Select from "react-select";
import _ from "lodash";
import { useSettings } from "../contexts/SettingsContext";

function adHocStation(adHocMatch, station, teamNumber, onStationChange) {
    var adHocMatchNew = _.cloneDeep(adHocMatch);
    if (_.isNull(adHocMatchNew)) {
        adHocMatchNew = [
            { teamNumber: null, station: "Red1", surrogate: false, dq: false },
            { teamNumber: null, station: "Red2", surrogate: false, dq: false },
            { teamNumber: null, station: "Red3", surrogate: false, dq: false },
            { teamNumber: null, station: "Blue1", surrogate: false, dq: false },
            { teamNumber: null, station: "Blue2", surrogate: false, dq: false },
            { teamNumber: null, station: "Blue3", surrogate: false, dq: false },
        ];
    }
    adHocMatchNew[_.findIndex(adHocMatchNew, { station: station })].teamNumber = teamNumber;
    onStationChange(adHocMatchNew);
}

function AdHocMatchModal({ show, onHide, adHocMatch, onStationChange, eventTeams }) {
    const { swapScreen } = useSettings();

    const handleChange = (station, e) => {
        adHocStation(adHocMatch, station, e.value, onStationChange);
    };

    return (
        <Modal centered={true} show={show} onHide={onHide}>
            <Modal.Header className={"promoteBackup"} closeButton closeVariant="white">
                <Modal.Title>Configure Teams for Match</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Container>
                    {adHocMatch && <div>Select teams for each station below.</div>}
                    {!adHocMatch && (
                        <div className="gatool-awaiting-inline">Awaiting match data...</div>
                    )}
                    {!swapScreen && adHocMatch && (
                        <Table>
                            <Row>
                                <Col className="blueAlliance">
                                    <div style={{ backgroundColor: "#98B4F4" }}>
                                        <b>Blue 1</b>{" "}
                                        <Select
                                            classNamePrefix="gatool-rs"
                                            options={eventTeams}
                                            tabIndex={4}
                                            value={
                                                adHocMatch[3]?.teamNumber
                                                    ? { value: adHocMatch[3]?.teamNumber, label: adHocMatch[3]?.teamNumber }
                                                    : ""
                                            }
                                            onChange={(e) => { handleChange("Blue1", e); }}
                                        />
                                    </div>
                                </Col>
                                <Col className="redAlliance">
                                    <div style={{ backgroundColor: "#F7B3B4" }}>
                                        <b>Red 3</b>{" "}
                                        <Select
                                            classNamePrefix="gatool-rs"
                                            options={eventTeams}
                                            tabIndex={3}
                                            value={
                                                adHocMatch[2]?.teamNumber
                                                    ? { value: adHocMatch[2]?.teamNumber, label: adHocMatch[2]?.teamNumber }
                                                    : ""
                                            }
                                            onChange={(e) => { handleChange("Red3", e); }}
                                        />
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col className="blueAlliance">
                                    <div style={{ backgroundColor: "#98B4F4" }}>
                                        <b>Blue 2</b>{" "}
                                        <Select
                                            classNamePrefix="gatool-rs"
                                            options={eventTeams}
                                            tabIndex={5}
                                            value={
                                                adHocMatch[4]?.teamNumber
                                                    ? { value: adHocMatch[4]?.teamNumber, label: adHocMatch[4]?.teamNumber }
                                                    : ""
                                            }
                                            onChange={(e) => { handleChange("Blue2", e); }}
                                        />
                                    </div>
                                </Col>
                                <Col className="redAlliance">
                                    <div style={{ backgroundColor: "#F7B3B4" }}>
                                        <b>Red 2</b>{" "}
                                        <Select
                                            classNamePrefix="gatool-rs"
                                            options={eventTeams}
                                            tabIndex={2}
                                            value={
                                                adHocMatch[1]?.teamNumber
                                                    ? { value: adHocMatch[1]?.teamNumber, label: adHocMatch[1]?.teamNumber }
                                                    : ""
                                            }
                                            onChange={(e) => { handleChange("Red2", e); }}
                                        />
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col className="blueAlliance">
                                    <div style={{ backgroundColor: "#98B4F4" }}>
                                        <b>Blue 3</b>{" "}
                                        <Select
                                            classNamePrefix="gatool-rs"
                                            options={eventTeams}
                                            tabIndex={6}
                                            value={
                                                adHocMatch[5]?.teamNumber
                                                    ? { value: adHocMatch[5]?.teamNumber, label: adHocMatch[5]?.teamNumber }
                                                    : ""
                                            }
                                            onChange={(e) => { handleChange("Blue3", e); }}
                                        />
                                    </div>
                                </Col>
                                <Col className="redAlliance">
                                    <div style={{ backgroundColor: "#F7B3B4" }}>
                                        <b>Red 1</b>
                                        <Select
                                            classNamePrefix="gatool-rs"
                                            options={eventTeams}
                                            tabIndex={1}
                                            value={
                                                adHocMatch[0]?.teamNumber
                                                    ? { value: adHocMatch[0]?.teamNumber, label: adHocMatch[0]?.teamNumber }
                                                    : ""
                                            }
                                            onChange={(e) => { handleChange("Red1", e); }}
                                        />
                                    </div>
                                </Col>
                            </Row>
                        </Table>
                    )}
                    {swapScreen && adHocMatch && (
                        <Table>
                            <Row>
                                <Col className="redAlliance">
                                    <div style={{ backgroundColor: "#F7B3B4" }}>
                                        <b>Red 3</b>{" "}
                                        <Select
                                            classNamePrefix="gatool-rs"
                                            options={eventTeams}
                                            tabIndex={4}
                                            value={
                                                adHocMatch[2]?.teamNumber
                                                    ? { value: adHocMatch[2]?.teamNumber, label: adHocMatch[2]?.teamNumber }
                                                    : ""
                                            }
                                            onChange={(e) => { handleChange("Red3", e); }}
                                        />
                                    </div>
                                </Col>
                                <Col className="blueAlliance">
                                    <div style={{ backgroundColor: "#98B4F4" }}>
                                        <b>Blue 1</b>{" "}
                                        <Select
                                            classNamePrefix="gatool-rs"
                                            options={eventTeams}
                                            tabIndex={3}
                                            value={
                                                adHocMatch[3]?.teamNumber
                                                    ? { value: adHocMatch[3]?.teamNumber, label: adHocMatch[3]?.teamNumber }
                                                    : ""
                                            }
                                            onChange={(e) => { handleChange("Blue1", e); }}
                                        />
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col className="redAlliance">
                                    <div style={{ backgroundColor: "#F7B3B4" }}>
                                        <b>Red 2</b>{" "}
                                        <Select
                                            classNamePrefix="gatool-rs"
                                            options={eventTeams}
                                            tabIndex={5}
                                            value={
                                                adHocMatch[1]?.teamNumber
                                                    ? { value: adHocMatch[1]?.teamNumber, label: adHocMatch[1]?.teamNumber }
                                                    : ""
                                            }
                                            onChange={(e) => { handleChange("Red2", e); }}
                                        />
                                    </div>
                                </Col>
                                <Col className="blueAlliance">
                                    <div style={{ backgroundColor: "#98B4F4" }}>
                                        <b>Blue 2</b>{" "}
                                        <Select
                                            classNamePrefix="gatool-rs"
                                            options={eventTeams}
                                            tabIndex={2}
                                            value={
                                                adHocMatch[4]?.teamNumber
                                                    ? { value: adHocMatch[4]?.teamNumber, label: adHocMatch[4]?.teamNumber }
                                                    : ""
                                            }
                                            onChange={(e) => { handleChange("Blue2", e); }}
                                        />
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col className="redAlliance">
                                    <div style={{ backgroundColor: "#F7B3B4" }}>
                                        <b>Red 1</b>
                                        <Select
                                            classNamePrefix="gatool-rs"
                                            options={eventTeams}
                                            tabIndex={6}
                                            value={
                                                adHocMatch[0]?.teamNumber
                                                    ? { value: adHocMatch[0]?.teamNumber, label: adHocMatch[0]?.teamNumber }
                                                    : ""
                                            }
                                            onChange={(e) => { handleChange("Red1", e); }}
                                        />
                                    </div>
                                </Col>
                                <Col className="blueAlliance">
                                    <div style={{ backgroundColor: "#98B4F4" }}>
                                        <b>Blue 3</b>{" "}
                                        <Select
                                            classNamePrefix="gatool-rs"
                                            options={eventTeams}
                                            tabIndex={1}
                                            value={
                                                adHocMatch[5]?.teamNumber
                                                    ? { value: adHocMatch[5]?.teamNumber, label: adHocMatch[5]?.teamNumber }
                                                    : ""
                                            }
                                            onChange={(e) => { handleChange("Blue3", e); }}
                                        />
                                    </div>
                                </Col>
                            </Row>
                        </Table>
                    )}
                </Container>
            </Modal.Body>
        </Modal>
    );
}

export default AdHocMatchModal;
