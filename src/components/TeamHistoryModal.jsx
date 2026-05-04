import { Button, Modal, Table } from "react-bootstrap";
import moment from "moment";

function TeamHistoryModal({
    show,
    onHide,
    updateTeam,
    teamHistory,
    isAuthenticated,
    user,
    timeFormat,
    onRestore,
}) {
    return (
        <Modal fullscreen={true} centered={true} show={show} onHide={onHide}>
            <Modal.Header className={"allianceChoice"} closeVariant={"white"} closeButton>
                <Modal.Title >Team Update History</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>The table below shows the recorded values for each of the customizable fields we record in gatool Cloud.</p>
                <Table bordered striped size="sm">
                    <thead><tr>
                        <td>Date modified</td>
                        <td>Team Name</td>
                        <td>Org Name</td>
                        <td>Robot Name</td>
                        <td>Motto</td>
                        <td>City/State</td>
                        <td>Top Sponsors</td>
                        <td>Awards text</td>
                        <td>Team Table Notes</td>
                        <td>Announce Screen Notes</td>
                        <td>Sponsors</td>
                        <td>How to pronounce #</td>
                        {(isAuthenticated && user["https://gatool.org/roles"] && user["https://gatool.org/roles"].indexOf("admin") >= 0) && <td>
                            Source</td>}
                        <td></td>
                    </tr>
                    </thead>
                    <tbody>
                        <tr key={updateTeam?.lastUpdate}>
                            <td>{moment(updateTeam?.lastUpdate).format("MMM Do YYYY, " + timeFormat.value)}</td>
                            <td>{updateTeam?.updates?.nameShortLocal}</td>
                            <td>{updateTeam?.updates?.organizationLocal}</td>
                            <td>{updateTeam?.updates?.robotNameLocal}</td>
                            <td>{updateTeam?.updates?.teamMottoLocal}</td>
                            <td>{updateTeam?.updates?.cityStateLocal}</td>
                            <td>{updateTeam?.updates?.topSponsorsLocal}</td>
                            <td>{updateTeam?.updates?.awardsTextLocal}</td>
                            <td>{updateTeam?.updates?.teamNotes}</td>
                            <td>{updateTeam?.updates?.teamNotesLocal}</td>
                            <td>{updateTeam?.updates?.topSponsorsLocal}</td>
                            <td>{updateTeam?.updates?.sayNumber}</td>
                            {(isAuthenticated && user["https://gatool.org/roles"] && user["https://gatool.org/roles"].indexOf("admin") >= 0) && <td>
                                {updateTeam?.updates?.source}</td>}
                            <td>Current Value</td>
                        </tr>
                        {teamHistory && teamHistory.map((team, index) => {
                            return <tr key={`history${index}`}>
                                <td>{moment(team?.lastUpdate).format("MMM Do YYYY, " + timeFormat.value)}</td>
                                <td>{team?.nameShortLocal}</td>
                                <td>{team?.organizationLocal}</td>
                                <td>{team?.robotNameLocal}</td>
                                <td>{team?.teamMottoLocal}</td>
                                <td>{team?.cityStateLocal}</td>
                                <td>{team?.topSponsorsLocal}</td>
                                <td>{team?.awardsTextLocal}</td>
                                <td>{team?.teamNotes}</td>
                                <td>{team?.teamNotesLocal}</td>
                                <td>{team?.sponsorsLocal}</td>
                                <td>{team?.sayNumber}</td>
                                {(isAuthenticated && user["https://gatool.org/roles"] && user["https://gatool.org/roles"].indexOf("admin") >= 0) && <td>
                                    {team?.source}</td>}
                                <td><Button onClick={() => { onRestore({ "team": updateTeam, "update": team }) }}>Restore</Button></td>
                            </tr>
                        })}</tbody>
                </Table>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="success" size="sm" onClick={onHide}>close</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default TeamHistoryModal;
