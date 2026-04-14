import { Button, Form, InputGroup, Modal, ButtonToolbar } from "react-bootstrap";
import { CalendarPlusFill } from 'react-bootstrap-icons';
import { useState, useEffect } from "react";
import moment from "moment";
import _ from "lodash";
import ReactQuillWrapper from "components/ReactQuillWrapper";
import 'react-quill/dist/quill.snow.css';

const modules = {
    toolbar: [
        [{ header: '1' }, { header: '2' }],
        [{ size: [] }],
        ['bold', 'italic', 'underline'],
        [{ 'color': [] }],
        [
            { list: 'ordered' },
            { list: 'bullet' },
            { indent: '-1' },
            { indent: '+1' },
        ],
        ['link'],
        ['clean'],
    ],
    clipboard: {
        matchVisual: false,
    },
};

const modules2 = {
    toolbar: [
        ['bold', 'italic', 'underline'],
        ['clean'],
    ],
    clipboard: {
        matchVisual: false,
    },
};

const formats = [
    'header',
    'size',
    'bold',
    'color',
    'italic',
    'underline',
    'list',
    'bullet',
    'indent',
    'link',
];

const formats2 = [
    'bold',
    'italic',
    'underline',
];

function TeamEditModal({
    show,
    onHide,
    updateTeam,
    localUpdates,
    isOnline,
    isAuthenticated,
    user,
    selectedEvent,
    selectedYear,
    originalAndSustaining,
    ftcMode,
    updateClass,
    onSave,
    onTrack,
    onClearVisits,
    onHistory,
    timeFormat,
}) {
    const [nameShortLocal, setNameShortLocal] = useState("");
    const [organizationLocal, setOrganizationLocal] = useState("");
    const [cityStateLocal, setCityStateLocal] = useState("");
    const [sayNumber, setSayNumber] = useState("");
    const [robotNameLocal, setRobotNameLocal] = useState("");
    const [showRobotName, setShowRobotName] = useState(true);
    const [teamMottoLocal, setTeamMottoLocal] = useState("");
    const [teamYearsNoCompeteLocal, setTeamYearsNoCompeteLocal] = useState("");
    const [awardsTextLocal, setAwardsTextLocal] = useState("");
    const [teamNotesLocal, setTeamNotesLocal] = useState("");
    const [teamNotes, setTeamNotes] = useState("");
    const [topSponsorsLocal, setTopSponsorsLocal] = useState("");
    const [topSponsorLocal, setTopSponsorLocal] = useState("");

    useEffect(() => {
        if (updateTeam) {
            setNameShortLocal(updateTeam?.updates?.nameShortLocal || "");
            setOrganizationLocal(updateTeam?.updates?.organizationLocal || "");
            setCityStateLocal(updateTeam?.updates?.cityStateLocal || "");
            setSayNumber(updateTeam?.updates?.sayNumber || "");
            setRobotNameLocal(updateTeam?.updates?.robotNameLocal || "");
            setShowRobotName(updateTeam?.updates?.showRobotName || true);
            setTeamMottoLocal(updateTeam?.updates?.teamMottoLocal || "");
            setTeamYearsNoCompeteLocal(updateTeam?.updates?.teamYearsNoCompeteLocal || "");
            setAwardsTextLocal(updateTeam?.updates?.awardsTextLocal || "");
            setTeamNotesLocal(updateTeam?.updates?.teamNotesLocal || "");
            setTeamNotes(updateTeam?.updates?.teamNotes || "");
            setTopSponsorsLocal(updateTeam?.updates?.topSponsorsLocal || "");
            setTopSponsorLocal(updateTeam?.updates?.topSponsorLocal || "");
        }
    }, [updateTeam]);

    function resetToTIMS() {
        setNameShortLocal("");
        setOrganizationLocal("");
        setCityStateLocal("");
        setSayNumber("");
        setRobotNameLocal("");
        setShowRobotName(true);
        setTeamMottoLocal("");
        setTeamYearsNoCompeteLocal("");
        setAwardsTextLocal("");
        setTeamNotesLocal("");
        setTeamNotes("");
        setTopSponsorsLocal("");
        setTopSponsorLocal("");
    }

    function collectFormValues() {
        return {
            nameShortLocal,
            cityStateLocal,
            topSponsorsLocal,
            topSponsorLocal,
            sponsorsLocal: "",
            organizationLocal,
            robotNameLocal,
            awardsLocal: "",
            teamMottoLocal,
            teamNotesLocal: teamNotesLocal === '<p><br></p>' ? "" : teamNotesLocal,
            teamYearsNoCompeteLocal,
            showRobotName,
            teamNotes: teamNotes === '<p><br></p>' ? "" : teamNotes,
            sayNumber,
            awardsTextLocal,
            lastUpdate: moment().format(),
        };
    }

    if (!updateTeam) return null;

    return (
        <Modal centered={true} fullscreen={true} show={show} size="lg" onHide={onHide} contentClassName="gatool-team-edit-modal">
            <Modal.Header className={_.find(localUpdates, { "teamNumber": updateTeam.teamNumber }) ? "redAlliance" : "allianceChoice"} closeVariant={"white"} closeButton>
                <Modal.Title >{_.find(localUpdates, { "teamNumber": updateTeam.teamNumber }) ? <i> You have a locally saved update for Team {updateTeam.teamNumber}. Please upload to gatool Cloud{!isOnline ? <> when you are online again.</> : <>.</>}</i> : `Editing Team ${updateTeam.teamNumber}'s Details`}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Use this form to update team information for <b>Team {updateTeam.teamNumber}.</b> Editable fields are shown below. Your changes will be stored locally on your machine and should not be erased if you close your browser. We do recommend using the Save to Home Screen feature on Android and iOS, and the Save App feature from Chrome on desktop, if you are offline.</p>
                <p>Items <span className={"teamTableHighlight"}><b>highlighted in green</b></span> have local changes. <b>Motto</b>, {ftcMode ? <></> : <><b>Robot Name</b>,</>} <b>pronounciation guides</b> and <b>Notes</b> do not exist in TIMS, so they are always local. To reset any value to the TIMS value, simply delete it here and tap DONE.</p>
                <p>You can upload this form to gatool Cloud, or keep the values locally for later upload, using the buttons at the bottom of this screen.</p>
                <p onClick={(e) => onHistory(updateTeam, e)}><b><CalendarPlusFill /> Tap here to see prior team data updates.</b></p>
                <div className={updateClass(updateTeam?.lastUpdate)}><p>Last updated in gatool Cloud: {moment(updateTeam?.lastUpdate).fromNow()}</p></div>
                <Form>
                    <Form.Group controlId="teamName">
                        <Form.Label className={"formLabel"}><b>Team Name ({updateTeam.nameShort ? updateTeam.nameShort : "No team name"} in TIMS)</b></Form.Label>
                        <Form.Control className={nameShortLocal ? "formHighlight" : ""} type="text" placeholder={updateTeam.nameShort} value={nameShortLocal} onChange={(e) => setNameShortLocal(e.target.value)} />
                    </Form.Group>
                    <Form.Group controlId="organization">
                        <Form.Label className={"formLabel"}><b>Organization/School ({updateTeam.organization ? updateTeam.organization : "No organization in TIMS"} in TIMS)</b></Form.Label>
                        <Form.Control className={organizationLocal ? "formHighlight" : ""} type="text" placeholder={updateTeam.organization} value={organizationLocal} onChange={(e) => setOrganizationLocal(e.target.value)} />
                    </Form.Group>
                    <Form.Group controlId="cityState">
                        <Form.Label className={"formLabel"}><b>City/State ({`${updateTeam?.city}, ${updateTeam?.stateProv}${(updateTeam?.country !== "USA") ? ", " + updateTeam?.country : ""}`}) in TIMS)</b></Form.Label>
                        <Form.Control className={cityStateLocal ? "formHighlight" : ""} type="text" placeholder={`${updateTeam?.city}, ${updateTeam?.stateProv} ${(updateTeam?.country !== "USA") ? " " + updateTeam?.country : ""}`} value={cityStateLocal} onChange={(e) => setCityStateLocal(e.target.value)} />
                    </Form.Group>
                    <Form.Group controlId="sayNumber">
                        <Form.Label className={"formLabel"}><b>How to pronounce the team number (some teams are particular)</b></Form.Label>
                        <Form.Control className={sayNumber ? "formHighlight" : ""} type="text" value={sayNumber} onChange={(e) => setSayNumber(e.target.value)} />
                    </Form.Group>
                    <Form.Group >
                        <Form.Label className={"formLabel"}><b>Robot Name ({updateTeam.robotName ? updateTeam.robotName : "No robot name"}) in TIMS</b> </Form.Label>
                        <InputGroup>
                            <Form.Control className={robotNameLocal ? "formHighlight" : ""} type="text" placeholder={updateTeam.robotName} value={robotNameLocal} onChange={(e) => setRobotNameLocal(e.target.value)} />
                            <Form.Check className={"robotNameCheckbox"} type="switch" id="showRobotName" label="Show robot name" defaultChecked={showRobotName} onChange={(e) => setShowRobotName(e.target.checked)} />
                        </InputGroup>
                    </Form.Group>
                    <Form.Group controlId="teamMotto">
                        <Form.Label className={"formLabel"}><b>Team Motto (Team Mottoes do not come from <i>FIRST</i>)</b></Form.Label>
                        <Form.Control className={teamMottoLocal ? "formHighlight" : ""} type="text" placeholder={updateTeam.updates?.teamMottoLocal} value={teamMottoLocal} onChange={(e) => setTeamMottoLocal(e.target.value)} />
                    </Form.Group>
                    <Form.Group controlId="teamYearsNoCompete">
                        <Form.Label className={"formLabel"}><b>Number of seasons NOT competing with FIRST (will be used in calculating Nth season)</b></Form.Label>
                        <Form.Control className={teamYearsNoCompeteLocal ? "formHighlight" : ""} type="number" placeholder={"Enter the count of years rather than the actual years: i.e. 5, not 2004-2007"} value={teamYearsNoCompeteLocal} onChange={(e) => setTeamYearsNoCompeteLocal(e.target.value)} />
                    </Form.Group>
                    <Form.Group controlId="awardsText">
                        <Form.Label className={"formLabel"}>
                            <b>Award/Alliance Selection text</b> (editable portion in <b><i>bold and italic</i></b> below):<br />
                            Team {updateTeam?.teamNumber} {nameShortLocal ? nameShortLocal : updateTeam?.nameShort}<br />
                            is <b><i>{awardsTextLocal ? awardsTextLocal : <>{originalAndSustaining.includes(String(updateTeam?.teamNumber)) ? "an Original and Sustaining Team " : ""}from<br />
                                {organizationLocal ? organizationLocal : updateTeam?.organization}<br />
                                in</>}</i></b> {cityStateLocal ? cityStateLocal : `${updateTeam?.city}, ${updateTeam?.stateProv}`}{updateTeam?.country !== "USA" ? `, ${updateTeam?.country}` : ""}<br />
                        </Form.Label>
                        <Form.Control
                            className={awardsTextLocal ? "formHighlight" : ""}
                            type="text"
                            placeholder={`${originalAndSustaining.includes(String(updateTeam?.teamNumber)) ? "an Original and Sustaining Team " : ""}from ${organizationLocal ? organizationLocal : updateTeam?.organization} in`}
                            value={awardsTextLocal}
                            onChange={(e) => setAwardsTextLocal(e.target.value)} />
                    </Form.Group>
                    <Form.Group controlId="teamNotesLocal">
                        <Form.Label className={"formLabel"}><b>Team Notes for Announce and Play-by-Play Screens (These notes are local notes and do not come from <i>FIRST</i>)</b></Form.Label>
                        {/* @ts-expect-error - ReactQuillWrapper accepts all ReactQuill props including className */}
                        <ReactQuillWrapper className={teamNotesLocal.replace(/<(.|\n)*?>/g, '').trim().length === 0 ? "" : "formHighlight"} theme="snow" modules={modules2} formats={formats2} value={teamNotesLocal} placeholder={"Enter some new notes you would like to appear on the Announce Screen"} onChange={(e) => setTeamNotesLocal(e)} />
                    </Form.Group>
                    <Form.Group controlId="teamNotes">
                        <Form.Label className={"formLabel"}><b>Team Notes for the Team Data Screen (These notes are local notes and do not come from <i>FIRST</i>)</b></Form.Label>
                        {!ftcMode && <ButtonToolbar>
                            <Button className={"TBAButton"} onClick={() => { window.open(`https://www.thebluealliance.com/team/${updateTeam.teamNumber}`) }}>{`TBA Page for ${updateTeam.teamNumber}`}</Button>
                            <Button className={"TBAButton"} onClick={() => { window.open(`https://frc-events.firstinspires.org/${selectedYear.value}/team/${updateTeam.teamNumber}`) }}>{`FIRST Season details ${selectedYear.value}`}</Button>
                            <Button className={"TBAButton"} onClick={() => { window.open(`https://frc-events.firstinspires.org/${selectedYear.value - 1}/team/${updateTeam.teamNumber}`) }}>{`FIRST Season details ${selectedYear.value - 1}`}</Button>
                        </ButtonToolbar>}
                        {ftcMode && <ButtonToolbar>
                            <Button className={"TBAButton"} onClick={() => { window.open(`https://ftcscout.org/teams/${updateTeam.teamNumber}`) }}>{`FTC Scout Page for ${updateTeam.teamNumber}`}</Button>
                            <Button className={"TBAButton"} onClick={() => { window.open(`https://ftc-events.firstinspires.org/${selectedYear.value}/team/${updateTeam.teamNumber}`) }}>{`FIRST Season details ${selectedYear.value}`}</Button>
                            <Button className={"TBAButton"} onClick={() => { window.open(`https://ftc-events.firstinspires.org/${selectedYear.value - 1}/team/${updateTeam.teamNumber}`) }}>{`FIRST Season details ${selectedYear.value - 1}`}</Button>
                        </ButtonToolbar>}
                        {/* @ts-expect-error - ReactQuillWrapper accepts all ReactQuill props including className */}
                        <ReactQuillWrapper className={teamNotes.replace(/<(.|\n)*?>/g, '').trim().length === 0 ? "" : "formHighlight"} theme="snow" modules={modules} formats={formats} value={teamNotes} placeholder={"Enter some new notes you would like to appear on the Team Data Screen"} onChange={(e) => setTeamNotes(e)} />
                    </Form.Group>
                    {(selectedEvent?.value?.type === "Championship" || selectedEvent?.value?.type === "ChampionshipDivision") ?
                        <Form.Group controlId="topSponsors">
                            <Form.Label className={"formLabel"} ><b>Top Sponsor (Enter <i>one top sponsor</i> from the full sponsor list below). This will appear under the team name on the Announce Screen.</b></Form.Label>
                            <InputGroup><Form.Control className={topSponsorLocal ? "formHighlight" : ""} type="text" placeholder={updateTeam?.topSponsor} value={topSponsorLocal} onChange={(e) => setTopSponsorLocal(e.target.value)} />
                                <Button onClick={() => setTopSponsorLocal(updateTeam?.topSponsor)}>Tap to reset to TIMS value.</Button>
                            </InputGroup>
                        </Form.Group> :
                        <Form.Group controlId="topSponsors">
                            <Form.Label className={"formLabel"}><b>Top Sponsors (Enter no more than 5 top sponsors from the full sponsor list below). These will appear under the team name on the Announce Screen.</b></Form.Label>
                            <InputGroup>
                                <Form.Control className={topSponsorsLocal ? "formHighlight" : ""} as="textarea"
                                    placeholder={updateTeam?.topSponsors} value={topSponsorsLocal} onChange={(e) => setTopSponsorsLocal(e.target.value)} />
                                <Button onClick={() => setTopSponsorsLocal(updateTeam?.topSponsors)}>Tap to reset to TIMS value.</Button>
                            </InputGroup>
                        </Form.Group>}
                    <Form.Group controlId="sponsors">
                        <Form.Label className={"formLabel"}><b>Full list of Sponsors <i>(For reference only. This field is not editable, does not appear in the UI, and any changes here will not be saved.)</i></b></Form.Label>
                        <Form.Control as="textarea"
                            placeholder={updateTeam?.topSponsors} defaultValue={updateTeam?.topSponsors} disabled />
                    </Form.Group>
                    <br />
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <ButtonToolbar className="justify-content-between">
                    <Button className={"teamDataButtons"} variant="warning" size="sm" onClick={(e) => { onClearVisits(e) }}>Reset <br />visit times</Button>
                    <Button className={"teamDataButtons"} variant="danger" size="sm" onClick={() => { resetToTIMS() }}>Reset team data<br />to TIMS values</Button>
                    <Button className={"teamDataButtons"} variant="secondary" size="sm" onClick={onHide}>Close without<br />saving changes</Button>
                    <Button className={"teamDataButtons"} variant="info" size="sm" onClick={onTrack}>Record visit without<br />saving changes</Button>
                    <Button className={"teamDataButtons"} variant="primary" size="sm" onClick={(e) => { onSave("save", collectFormValues(), e) }}>Submit changes<br />but only keep them locally</Button>
                    <Button className={"teamDataButtons"} variant="success" size="sm" disabled={!isOnline} onClick={(e) => { onSave("update", collectFormValues(), e) }}>Submit changes <br />and upload to gatool Cloud</Button>
                </ButtonToolbar>
                <br />
            </Modal.Footer>
        </Modal>
    );
}

export default TeamEditModal;
