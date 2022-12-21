import { Alert, Container, Table } from "react-bootstrap";
import find from "lodash/find";
import { SortAlphaDown, SortAlphaUp, SortNumericDown, SortNumericUp } from 'react-bootstrap-icons';
import { merge, orderBy } from "lodash";

function TeamDataPage({ selectedEvent, selectedYear, teamList, rankings, teamSort, setTeamSort, communityUpdates, allianceCount }) {

    function getTeamRank(teamNumber) {
        var team = find(rankings?.Rankings, { "teamNumber": teamNumber });
        return team?.rank;
    }

    function rankHighlight(rank) {
        var style = { color: "black", backgroundColor: "white" };
        if ((rank <= allianceCount) && (rank > 1)) {
            style.color = "white";
            style.backgroundColor = "green"
        } else if ((rank < (allianceCount + 3)) && (rank > allianceCount)) {
            style.color = "black";
            style.backgroundColor = "yellow"
        } else if (rank === 1) {
            style.color = "white";
            style.backgroundColor = "orange"
        } else {
            style.color = "";
            style.backgroundColor = ""
        }
        return style;
    }

    function updateHighlight(update) {
        var style = {
            backgroundColor: ""
        }
        if (update) {
            style.backgroundColor = "rgb(195, 244, 199)"
            return style;
        }
    }

    var teamListExtended = teamList?.teams?.map((teamRow) => {
        teamRow.rank = getTeamRank(teamRow?.teamNumber);
        teamRow.citySort = teamRow?.country + teamRow?.stateProv + teamRow?.city;
        var update = find(communityUpdates, { "teamNumber": teamRow.teamNumber });
        teamRow = merge(teamRow, update?.updates);
        return teamRow;
    })

    if (teamSort.charAt(0) === "-") {
        teamListExtended = orderBy(teamListExtended, teamSort.slice(1), 'desc');
    } else {
        teamListExtended = orderBy(teamListExtended, teamSort, 'asc');
    }

    return (
        <Container fluid>
            {!selectedEvent && !teamList && <div>
                <Alert variant="warning" >You need to select an event before you can see anything here.</Alert>
            </div>}
            {selectedEvent && !teamList && <div>
                <Alert variant="warning" >Loading team data for {selectedEvent.label}</Alert>
            </div>}
            {selectedEvent && teamList && <div>
                <h4>{selectedEvent.label}</h4>
                <p>This table is editable and sortable. Tap on a team number to change data for a specific team. Edits you make are local to this browser, and they will persist here if you do not clear your browser cache. You can save your changes to the gatool Cloud on the team details page or on the Setup Screen. Cells highlighted in green have been modified, either by you or by other gatool users.</p>
                <Table responsive striped bordered size="sm">
                    <thead className="thead-default">
                        <tr>
                            <th sm={1} onClick={() => (teamSort === "teamNumber") ? setTeamSort("-teamNumber") : setTeamSort("teamNumber")}><b>Team #{teamSort === "teamNumber" ? <SortNumericDown /> : ""}{teamSort === "-teamNumber" ? <SortNumericUp /> : ""}</b></th>
                            <th sm={1} onClick={() => (teamSort === "rank") ? setTeamSort("-rank") : setTeamSort("rank")}> <b>Rank{teamSort === "rank" ? <SortNumericDown /> : ""}{teamSort === "-rank" ? <SortNumericUp /> : ""}</b></th>
                            <th sm={2} onClick={() => (teamSort === "nameShort") ? setTeamSort("-nameShort") : setTeamSort("nameShort")}><b>Team Name{teamSort === "nameShort" ? <SortAlphaDown /> : ""}{teamSort === "-nameShort" ? <SortAlphaUp /> : ""}</b></th>
                            <th sm={1} onClick={() => (teamSort === "citySort") ? setTeamSort("-citySort") : setTeamSort("citySort")}><b>City{teamSort === "citySort" ? <SortAlphaDown /> : ""}{teamSort === "-citySort" ? <SortAlphaUp /> : ""}</b></th>
                            <th sm={2} ><b>Top Sponsors</b></th>
                            <th sm={1} ><b>Organization</b></th>
                            <th sm={1} onClick={() => (teamSort === "rookieYear") ? setTeamSort("-rookieYear") : setTeamSort("rookieYear")}><b>Rookie Year{teamSort === "rookieYear" ? <SortNumericDown /> : ""}{teamSort === "-rookieYear" ? <SortNumericUp /> : ""}</b></th>
                            <th sm={1} ><b>Robot Name</b></th>
                            <th sm={2} ><b>Additional Notes</b></th>
                        </tr>
                    </thead>
                    <tbody>
                        {teamList && teamList.teams && teamListExtended.map((team) => {
                            var cityState = `${team?.city} ${team?.stateProv} ${(team?.country !== "USA") ? " " + team?.country : ""}`;
                            var avatar = `<img src='https://api.gatool.org/v3/${selectedYear.value}/avatars/team/${team?.teamNumber}/avatar.png' onerror="this.style.display='none'">&nbsp`;
                            var teamNameWithAvatar = team?.nameShortLocal ? team?.nameShortLocal : team?.nameShort;
                            teamNameWithAvatar = avatar + teamNameWithAvatar;

                            return <tr key={"teamData" + team?.teamNumber}>
                                <td>{team?.teamNumber}</td>
                                <td style={rankHighlight(team?.rank ? team?.rank : 100)}>{team?.rank}</td>
                                <td dangerouslySetInnerHTML={{ __html: teamNameWithAvatar }} style={updateHighlight(team?.nameShortLocal)}></td>
                                <td style={updateHighlight(team?.cityStateLocal)}>{team?.cityStateLocal ? team?.cityStateLocal : cityState} </td>
                                <td style={updateHighlight(team?.topSponsorsLocal)}>{team?.topSponsorsLocal ? team?.topSponsorsLocal : team?.topSponsors}</td>
                                <td style={updateHighlight(team?.organizationLocal)}>{team?.organizationLocal ? team?.organizationLocal : team?.schoolName}</td>
                                <td>{team?.rookieYear}</td>
                                <td style={updateHighlight(team?.robotNameLocal)}>{team?.robotNameLocal}</td>
                                <td style={updateHighlight(team?.teamNotes)} dangerouslySetInnerHTML={{ __html: team?.teamNotes }}></td>
                            </tr>
                        })}
                    </tbody>
                </Table>
            </div>}

        </Container>
    )
}

export default TeamDataPage;