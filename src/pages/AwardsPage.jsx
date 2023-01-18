import { Alert, Container, Button, Row, Col } from "react-bootstrap";
import _ from "lodash";


function AwardsPage({ selectedEvent, teamList }) {

    var columns = [[], [], [], [], [], []];
    var sortedTeams = _.orderBy(teamList?.teams, "teamNumber", "asc");
    var rows = sortedTeams?.length;
    if (sortedTeams?.length > 0) {
        sortedTeams?.forEach((team, index) => {
            if (index <= 1 * rows / 6) {
                columns[0].push(team);
            } else if (index <= 2 * rows / 6) {
                columns[1].push(team);
            } else if (index <= 3 * rows / 6) {
                columns[2].push(team);
            } else if (index <= 4 * rows / 6) {
                columns[3].push(team);
            } else if (index <= 5 * rows / 6) {
                columns[4].push(team);
            } else {
                columns[5].push(team);
            }
        })
    }

    return (
        <Container fluid>
            <h4>{selectedEvent.label}</h4>
            <p>When it's time for Awards, simply tap a team when their number is called, announce the team, and click <b>Congratulations.</b></p>
            {!selectedEvent && !teamList && <div>
                <Alert variant="warning" >You need to select an event before you can see anything here.</Alert>
            </div>}
            {selectedEvent && (!teamList || teamList?.teams.length === 0) && <div>
                <Alert variant="warning" ><div><img src="loadingIcon.gif" alt="Loading data..." /></div><div>Awaiting team data for {selectedEvent.label}</div></Alert>
            </div>}
            {selectedEvent && teamList?.teams.length > 0 &&
                    <Container fluid>
                        <Row key={selectedEvent.label}>{columns.map((column, index) => {
                            return (<Col xs="2" key={index}>
                                {column.map((team) => {
                                    return (<Row key={team.teamNumber} ><Button size="medium" variant="outline-success">{team.teamNumber}</Button></Row>)
                                })}
                            </Col>)
                        })}
                        </Row>

                    </Container>
            }

        </Container>
    )
}

export default AwardsPage;