import { Alert, Container, Table } from "react-bootstrap";
import find from "lodash/find";
import orderBy from "lodash/orderBy";
import { SortNumericDown, SortNumericUp } from 'react-bootstrap-icons';

function RanksPage({ selectedEvent, teamList, rankings, rankSort, setRankSort }) {

    function getTeamName(teamNumber) {
        var team = find(teamList.teams,{"teamNumber": teamNumber} );
        return team.nameShort;

    }

    var rankingsList = rankings?.Rankings;

    if (rankSort.charAt(0)==="-") {
        rankingsList = orderBy(rankingsList,rankSort.slice(1), 'desc');
    } else  {
        rankingsList = orderBy(rankingsList,rankSort, 'asc');
    }

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
                            <th className="col1" onClick={() => (rankSort === "teamNumber") ? setRankSort("-teamNumber") : setRankSort("teamNumber")}><b>Team #{rankSort==="teamNumber" ? <SortNumericUp /> : ""}{rankSort==="-teamNumber" ? <SortNumericDown /> : ""}</b></th>
                            <th className="col1" onClick={() => (rankSort === "rank") ? setRankSort("-rank") : setRankSort("rank")}><b>Rank{rankSort==="rank" ? <SortNumericUp /> : ""}{rankSort==="-rank" ? <SortNumericDown /> : ""}</b></th>
                            <th className="col2"><b>Team Name</b></th>
                            <th className="col1" onClick={() => (rankSort === "sortOrder1") ? setRankSort("-sortOrder1") : setRankSort("sortOrder1")}><b>RP Avg.{rankSort==="sortOrder1" ? <SortNumericUp /> : ""}{rankSort==="-sortOrder1" ? <SortNumericDown /> : ""}</b></th>
                            <th className="col1" onClick={() => (rankSort === "wins") ? setRankSort("-wins") : setRankSort("wins")}><b>Wins{rankSort==="wins" ? <SortNumericUp /> : ""}{rankSort==="-wins" ? <SortNumericDown /> : ""}</b></th>
                            <th className="col1" onClick={() => (rankSort === "losses") ? setRankSort("-losses") : setRankSort("losses")}><b>Losses{rankSort==="losses" ? <SortNumericUp /> : ""}{rankSort==="-losses" ? <SortNumericDown /> : ""}</b></th>
                            <th className="col1" onClick={() => (rankSort === "ties") ? setRankSort("-ties") : setRankSort("ties")}><b>Ties{rankSort==="ties" ? <SortNumericUp /> : ""}{rankSort==="-ties" ? <SortNumericDown /> : ""}</b></th>
                            <th className="col1" onClick={() => (rankSort === "qualAverage") ? setRankSort("-qualAverage") : setRankSort("qualAverage")}><b>Qual Avg.{rankSort==="qualAverage" ? <SortNumericUp /> : ""}{rankSort==="-qualAverage" ? <SortNumericDown /> : ""}</b></th>
                            <th className="col1" onClick={() => (rankSort === "dq") ? setRankSort("-dq") : setRankSort("dq")}><b>DQ{rankSort==="dq" ? <SortNumericUp /> : ""}{rankSort==="-dq" ? <SortNumericDown /> : ""}</b></th>
                            <th className="col1" onClick={() => (rankSort === "matchesPlayed") ? setRankSort("-matchesPlayed") : setRankSort("matchesPlayed")}><b>Matches Played{rankSort==="matchesPlayed" ? <SortNumericUp /> : ""}{rankSort==="-matchesPlayed" ? <SortNumericDown /> : ""}</b></th>
                        </tr>
                    </thead>
                    <tbody>
                        {rankings && rankings.Rankings && rankingsList.map((rankRow) => {
                            return <tr key={"rankings" + rankRow.teamNumber}>
                                <td>{rankRow.teamNumber}</td>
                                <td>{rankRow.rank}</td>
                                <td>{getTeamName(rankRow.teamNumber)}</td>
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