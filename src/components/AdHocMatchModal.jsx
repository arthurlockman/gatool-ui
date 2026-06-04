import { Row, Col, Modal, Container } from "react-bootstrap";
import Select from "react-select";
import _ from "lodash";
import { useSettings } from "../contexts/SettingsContext";

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

function AdHocMatchModal({ show, onHide, adHocMatch, onStationChange, eventTeams }) {
    const { swapScreen, useFourTeamAlliances } = useSettings();

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
                        <div>
                            <Row>
                                <Col className="blueAlliance">
                                    {stationSelect("Blue 1", "Blue1", 4, "#98B4F4")}
                                </Col>
                                <Col className="redAlliance">
                                    {stationSelect("Red 3", "Red3", 3, "#F7B3B4")}
                                </Col>
                            </Row>
                            <Row>
                                <Col className="blueAlliance">
                                    {stationSelect("Blue 2", "Blue2", 5, "#98B4F4")}
                                </Col>
                                <Col className="redAlliance">
                                    {stationSelect("Red 2", "Red2", 2, "#F7B3B4")}
                                </Col>
                            </Row>
                            <Row>
                                <Col className="blueAlliance">
                                    {stationSelect("Blue 3", "Blue3", 6, "#98B4F4")}
                                </Col>
                                <Col className="redAlliance">
                                    {stationSelect("Red 1", "Red1", 1, "#F7B3B4")}
                                </Col>
                            </Row>
                            {useFourTeamAlliances && (
                                <Row>
                                    <Col className="blueAlliance">
                                        {stationSelect("Blue 4", "Blue4", 7, "#98B4F4")}
                                    </Col>
                                    <Col className="redAlliance">
                                        {stationSelect("Red 4", "Red4", 8, "#F7B3B4")}
                                    </Col>
                                </Row>
                            )}
                        </div>
                    )}
                    {swapScreen && adHocMatch && (
                        <div>
                            <Row>
                                <Col className="redAlliance">
                                    {stationSelect("Red 3", "Red3", 4, "#F7B3B4")}
                                </Col>
                                <Col className="blueAlliance">
                                    {stationSelect("Blue 1", "Blue1", 3, "#98B4F4")}
                                </Col>
                            </Row>
                            <Row>
                                <Col className="redAlliance">
                                    {stationSelect("Red 2", "Red2", 5, "#F7B3B4")}
                                </Col>
                                <Col className="blueAlliance">
                                    {stationSelect("Blue 2", "Blue2", 2, "#98B4F4")}
                                </Col>
                            </Row>
                            <Row>
                                <Col className="redAlliance">
                                    {stationSelect("Red 1", "Red1", 6, "#F7B3B4")}
                                </Col>
                                <Col className="blueAlliance">
                                    {stationSelect("Blue 3", "Blue3", 1, "#98B4F4")}
                                </Col>
                            </Row>
                            {useFourTeamAlliances && (
                                <Row>
                                    <Col className="redAlliance">
                                        {stationSelect("Red 4", "Red4", 8, "#F7B3B4")}
                                    </Col>
                                    <Col className="blueAlliance">
                                        {stationSelect("Blue 4", "Blue4", 7, "#98B4F4")}
                                    </Col>
                                </Row>
                            )}
                        </div>
                    )}
                </Container>
            </Modal.Body>
        </Modal>
    );
}

export default AdHocMatchModal;
