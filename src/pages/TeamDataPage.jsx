import { Alert, Container, Table } from "react-bootstrap";
import find from "lodash/find";
import orderBy from "lodash/orderBy";
import { SortAlphaDown, SortAlphaUp, SortNumericDown, SortNumericUp } from 'react-bootstrap-icons';

function TeamDataPage({ selectedEvent, teamList, rankings, teamSort, setTeamSort}) {
    
    function getTeamRank(teamNumber) {
        var team = find(rankings.Rankings,{"teamNumber": teamNumber} );
        return team.rank;

    }

    var teamListExtended = teamList.teams.map((teamRow) => {
        teamRow.rank = getTeamRank(teamRow.teamNumber);
        teamRow.citySort = teamRow.country+teamRow.stateProv+teamRow.city;
        return teamRow;
    })

    if (teamSort.charAt(0)==="-") {
        teamListExtended = orderBy(teamListExtended,teamSort.slice(1), 'desc');
    } else  {
        teamListExtended = orderBy(teamListExtended,teamSort, 'asc');
    }

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
                            <th className="col1" onClick={() => (teamSort === "teamNumber") ? setTeamSort("-teamNumber") : setTeamSort("teamNumber")}><b>Team #{teamSort==="teamNumber" ? <SortNumericDown /> : ""}{teamSort==="-teamNumber" ? <SortNumericUp /> : ""}</b></th>
                            <th className="col1" onClick={() => (teamSort === "rank") ? setTeamSort("-rank") : setTeamSort("rank")}><b>Rank{teamSort==="rank" ? <SortNumericDown /> : ""}{teamSort==="-rank" ? <SortNumericUp /> : ""}</b></th>
                            <th className="col2" onClick={() => (teamSort === "nameShort") ? setTeamSort("-nameShort") : setTeamSort("nameShort")}><b>Team Name{teamSort==="nameShort" ? <SortAlphaDown /> : ""}{teamSort==="-nameShort" ? <SortAlphaUp /> : ""}</b></th>
                            <th className="col1" onClick={() => (teamSort === "citySort") ? setTeamSort("-citySort") : setTeamSort("citySort")}><b>City{teamSort==="citySort" ? <SortAlphaDown /> : ""}{teamSort==="-citySort" ? <SortAlphaUp /> : ""}</b></th>
                            <th className="col2"><b>Top Sponsors</b></th>
                            <th className="col1"><b>Organization</b></th>
                            <th className="col1" onClick={() => (teamSort === "rookieYear") ? setTeamSort("-rookieYear") : setTeamSort("rookieYear")}><b>Rookie Year{teamSort==="rookieYear" ? <SortNumericDown /> : ""}{teamSort==="-rookieYear" ? <SortNumericUp /> : ""}</b></th>
                            <th className="col1"><b>Robot Name</b></th>
                            <th className="col2"><b>Additional Notes</b></th>
                        </tr>
                    </thead>
                    <tbody>
                        {teamList && teamList.teams && teamListExtended.map((team) => {
                            return <tr key={"teamData" + team.teamNumber}>
                                <td>{team.teamNumber}</td>
                                <td>{team.rank}</td>
                                <td>{team.nameShort}</td>
                                <td>{team.city}, {team.stateProv} {(team.country !== "USA") ? " "+team.country : ""}</td>
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