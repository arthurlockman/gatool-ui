import { Alert, Container, Table } from "react-bootstrap";
import moment from 'moment';

function SchedulePage({ selectedEvent, playoffSchedule, qualSchedule }) {
    return (
        <Container fluid>
            {!selectedEvent && !qualSchedule && <div>
                <Alert variant="warning" >You need to select an event before you can see anything here.</Alert>
            </div>}
            {selectedEvent && qualSchedule?.schedule.length===0 && <div>
                <Alert variant="warning" ><div><img src="loadingIcon.gif" alt="Loading data..."/></div><div>Awaiting schedule for {selectedEvent.label}</div></Alert>
            </div>}
            {selectedEvent && qualSchedule?.schedule.length>0 &&
                <div>
                    <h4>{selectedEvent.label}</h4>
                    <Table responsive striped bordered size="sm">
                        <thead className="thead-default">
                            <tr>
                                <th className="col2"><b>Time</b></th>
                                <th className="col2"><b>Description</b></th>
                                <th className="col1"><b>Match Number</b></th>
                                <th className="col1"><b>Score</b></th>
                                <th className="col1"><b>Station 1</b></th>
                                <th className="col1"><b>Station 2</b></th>
                                <th className="col1"><b>Station 3</b></th>
                            </tr>
                        </thead>
                        <tbody>
                            {qualSchedule && qualSchedule?.schedule?.map((match) => {
                                let redStyle = "red";
                                let blueStyle = "blue";
                                if (Number(match.scoreRedFinal) > Number(match.scoreBlueFinal)) {
                                    redStyle += " bold"
                                } else if (Number(match.scoreBlueFinal) > Number(match.scoreRedFinal)) {
                                    blueStyle += " bold"
                                }

                                return (<tr key={"qualSchedule"+match.matchNumber} className="centerTable">
                                    <td>{match.actualStartTime ? "Actual:" : "Scheduled:"}<br /> {match.actualStartTime ? moment(match.actualStartTime).format('dd hh:mm A') : moment(match.StartTime).format('dd hh:mm A')}</td>
                                    <td>{match.description}</td>
                                    <td>{match.matchNumber}</td>
                                    <td><span className={redStyle}>{match.scoreRedFinal}</span><br /><span className={blueStyle}>{match.scoreBlueFinal}</span></td>
                                    <td><span className={redStyle}>{match.teams[0].teamNumber}</span><br /><span className={blueStyle}>{match.teams[3].teamNumber}</span></td>
                                    <td><span className={redStyle}>{match.teams[1].teamNumber}</span><br /><span className={blueStyle}>{match.teams[4].teamNumber}</span></td>
                                    <td><span className={redStyle}>{match.teams[2].teamNumber}</span><br /><span className={blueStyle}>{match.teams[5].teamNumber}</span></td>
                                </tr>
                                )
                            })
                            }
                            {(playoffSchedule && playoffSchedule.schedule?.length > 0) ? playoffSchedule.schedule.map((match) => {
                                let redStyle = "red";
                                let blueStyle = "blue";
                                let qualMatchCount = qualSchedule.schedule.length;
                                if (Number(match.scoreRedFinal) > Number(match.scoreBlueFinal)) {
                                    redStyle += " bold"
                                } else if (Number(match.scoreBlueFinal) > Number(match.scoreRedFinal)) {
                                    blueStyle += " bold"
                                }

                                return (<tr key={"playoffSchedule"+match.matchNumber} className="centerTable">
                                    <td>{match.actualStartTime ? "Actual:" : "Scheduled:"}<br /> {match.actualStartTime ? moment(match.actualStartTime).format('dd hh:mm A') : moment(match.StartTime).format('dd hh:mm A')}</td>
                                    <td>{match.description}</td>
                                    <td>{match.matchNumber + qualMatchCount}</td>
                                    <td><span className={redStyle}>{match.scoreRedFinal}</span><br /><span className={blueStyle}>{match.scoreBlueFinal}</span></td>
                                    <td><span className={redStyle}>{match.teams[0].teamNumber}</span><br /><span className={blueStyle}>{match.teams[3].teamNumber}</span></td>
                                    <td><span className={redStyle}>{match.teams[1].teamNumber}</span><br /><span className={blueStyle}>{match.teams[4].teamNumber}</span></td>
                                    <td><span className={redStyle}>{match.teams[2].teamNumber}</span><br /><span className={blueStyle}>{match.teams[5].teamNumber}</span></td>
                                </tr>
                                )
                            })
                            : <tr><td colSpan={7}>No playoff schedule available yet.</td></tr>}
                        </tbody>
                    </Table>
                </div>}
        </Container>
    )
}

export default SchedulePage;