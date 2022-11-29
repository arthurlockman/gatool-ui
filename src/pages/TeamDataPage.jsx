import { Alert, Container, Table } from "react-bootstrap";

function TeamDataPage({ selectedEvent, teamList }) {
    // function fixTeamName(teamName) {
    //     return `aefaefaef ${teamName}`;
    // }

    return (
        <Container fluid>
            {!selectedEvent && !teamList && <div>
                <Alert variant="warning" >You need to select an event before you can see anything here.</Alert>
            </div>}
            {selectedEvent && teamList && <div>
                <p>{selectedEvent.label}</p>
                <Table responsive striped bordered size="sm">
                    <thead className="thead-default">
                        <tr>
                            <th className="col1"><b>Team #</b></th>
                            <th className="col1"><b>Rank</b></th>
                            <th className="col2"><b>Team Name</b></th>
                            <th className="col1"><b>City</b></th>
                            <th className="col2"><b>Top Sponsors</b></th>
                            <th className="col1"><b>Organization</b></th>
                            <th className="col1"><b>Rookie Year</b></th>
                            <th className="col1"><b>Robot Name</b></th>
                            <th className="col2"><b>Additional Notes</b></th>
                        </tr>
                    </thead>
                    <tbody>
                        {teamList && teamList.teams && teamList.teams.map((team) => {
                            return <tr key={"teamData" + team.teamNumber}>
                                <td>{team.teamNumber}</td>
                                <td>Rank</td>
                                <td>{team.nameShort}</td>
                                <td>{team.city}</td>
                                <td>Top Sponsors</td>
                                <td>{team.schoolName}</td>
                                <td>{team.rookieYear}</td>
                                <td>{team.robotName}</td>
                                <td>Additional Notes</td>
                            </tr>
                        })}
                    </tbody>
                </Table>
            </div>}

        </Container>
    )
}

export default TeamDataPage;