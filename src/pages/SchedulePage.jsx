import { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import moment from 'moment';
import { UseAuthClient } from "../contextProviders/AuthClientContext";

function SchedulePage({ selectedEvent, selectedYear }) {
    var httpClient = UseAuthClient();
    var [playoffSchedule, setPlayoffSchedule] = useState(null);
    var [qualSchedule, setQualSchedule] = useState(null);
    // var schedule;
    useEffect(() => {
        async function getSchedule() {
            var result = await httpClient.get(`${selectedYear.value}/schedule/hybrid/${selectedEvent.value.code}/qual`);
            var qualschedule = await result.json();
            setQualSchedule(qualschedule);
            result = await httpClient.get(`${selectedYear.value}/schedule/hybrid/${selectedEvent.value.code}/playoff`);
            var playoffschedule = await result.json();
            setPlayoffSchedule(playoffschedule);
            //schedule = qualSchedule;
            //schedule.concat(playoffSchedule);
        }
        if (httpClient && selectedEvent && selectedYear) {
            getSchedule();
        }
    }, [selectedEvent, selectedYear, httpClient])

    return (
        <div>
            <p>{selectedEvent.label}</p>
            <Table striped bordered size="sm">
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
                    {qualSchedule && qualSchedule.Schedule.map((match) => {
                        let redStyle = "red";
                        let blueStyle = "blue";
                        if (Number(match.scoreRedFinal) > Number(match.scoreBlueFinal)) {
                            redStyle += " bold"
                        } else if (Number(match.scoreBlueFinal) > Number(match.scoreRedFinal)) {
                            blueStyle += " bold"
                        }

                        return (<tr key={match.matchNumber} className="centerTable">
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
                    {playoffSchedule && playoffSchedule.Schedule.map((match) => {
                        let redStyle = "red";
                        let blueStyle = "blue";
                        let qualMatchCount = qualSchedule.Schedule.length;
                        if (Number(match.scoreRedFinal) > Number(match.scoreBlueFinal)) {
                            redStyle += " bold"
                        } else if (Number(match.scoreBlueFinal) > Number(match.scoreRedFinal)) {
                            blueStyle += " bold"
                        }

                        return (<tr key={match.matchNumber} className="centerTable">
                            <td>{match.actualStartTime ? "Actual:" : "Scheduled:"}<br /> {match.actualStartTime ? moment(match.actualStartTime).format('dd hh:mm A') : moment(match.StartTime).format('dd hh:mm A')}</td>
                            <td>{match.description}</td>
                            <td>{match.matchNumber+qualMatchCount}</td>
                            <td><span className={redStyle}>{match.scoreRedFinal}</span><br /><span className={blueStyle}>{match.scoreBlueFinal}</span></td>
                            <td><span className={redStyle}>{match.teams[0].teamNumber}</span><br /><span className={blueStyle}>{match.teams[3].teamNumber}</span></td>
                            <td><span className={redStyle}>{match.teams[1].teamNumber}</span><br /><span className={blueStyle}>{match.teams[4].teamNumber}</span></td>
                            <td><span className={redStyle}>{match.teams[2].teamNumber}</span><br /><span className={blueStyle}>{match.teams[5].teamNumber}</span></td>
                        </tr>
                        )
                    })
                    }
                </tbody>
            </Table>
        </div>
    )
}

export default SchedulePage;