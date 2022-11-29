import { Alert, Container, Table } from "react-bootstrap";

function RanksPage({ selectedEvent, teamList, rankings }) {
    return (
        <Container fluid>
            {!selectedEvent && !teamList && <div>
                <Alert variant="warning" >You need to select an event before you can see anything here.</Alert>
            </div>}
            {selectedEvent && teamList && !rankings && <div>
                <Alert variant="warning" >Your event is not reporting rankings yet.</Alert>
            </div>
            }
            {selectedEvent && teamList && rankings && <div>
                <p>{selectedEvent.label}</p>
                <Table responsive striped bordered size="sm">
                    <thead className="thead-default">
                        <tr>
                            <th className="col1"><b>Team #</b></th>
                            <th className="col1"><b>Rank</b></th>
                            <th className="col2"><b>Team Name</b></th>
                            <th className="col1"><b>RP Avg.</b></th>
                            <th className="col1"><b>Wins</b></th>
                            <th className="col1"><b>Losses</b></th>
                            <th className="col1"><b>Ties</b></th>
                            <th className="col1"><b>Qual Avg.</b></th>
                            <th className="col1"><b>DQ</b></th>
                            <th className="col1"><b>Matches Played</b></th>
                        </tr>
                    </thead>
                    <tbody>
                        {rankings && rankings.Rankings && rankings.Rankings.map((rankRow) => {
                            return <tr key={"rankings" + rankRow.teamNumber}>
                                <td>{rankRow.teamNumber}</td>
                                <td>{rankRow.rank}</td>
                                <td>todo: lookup teamName</td>
                                <td>{rankRow.sortOrder1}</td>
                                <td>{rankRow.wins}</td>
                                <td>{rankRow.losses}</td>
                                <td>{rankRow.ties}</td>
                                <td>{rankRow.qualAverage}</td>
                                <td>{rankRow.dq}</td>
                                <td>{rankRow.matchesPlayed}</td>
                            </tr>
                        })}
                    </tbody>
                </Table>
            </div>}

        </Container>
    )
}

export default RanksPage;