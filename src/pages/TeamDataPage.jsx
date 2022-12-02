import { Alert, Container, Table } from "react-bootstrap";
import find from "lodash/find";
import { SortAlphaDown, SortAlphaUp, SortNumericDown, SortNumericUp } from 'react-bootstrap-icons';
import { merge, orderBy } from "lodash";

function TeamDataPage({ selectedEvent, teamList, rankings, teamSort, setTeamSort, communityUpdates}) {

    function getTeamRank(teamNumber) {
        var team = find(rankings?.Rankings,{"teamNumber": teamNumber} );
        return team?.rank;
    }

    function getTeamSponsors (sponsors) {
        return sponsors;
    }

    var teamListExtended = teamList?.teams?.map((teamRow) => {
        teamRow.rank = getTeamRank(teamRow.teamNumber);
        teamRow.citySort = teamRow.country+teamRow.stateProv+teamRow.city;
        teamRow = merge(teamRow,find(communityUpdates,{"teamNumber": teamRow.teamNumber}))
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
                                <td>{team?.teamNumber}</td>
                                <td>{team?.rank}</td>
                                <td>{team?.updates.nameShortLocal ? team.updates.nameShortLocal : team?.nameShort}</td>
                                <td>{team?.city}, {team?.stateProv} {(team?.country !== "USA") ? " "+team?.country : ""}</td>
                                <td>{team?.updates.topSponsorsLocal ? team.updates.topSponsorsLocal :getTeamSponsors(team.nameFull)}</td>
                                <td>{team?.schoolName}</td>
                                <td>{team?.rookieYear}</td>
                                <td>{team?.updates.robotNameLocal}</td>
                                <td dangerouslySetInnerHTML={{__html:team?.updates.teamNotes}}></td>
                            </tr>
                        })}
                    </tbody>
                </Table>
            </div>}

        </Container>
    )
}

export default TeamDataPage;