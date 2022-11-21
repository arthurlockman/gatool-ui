import { useEffect, useState } from "react";
import { UseAuthClient } from "../contextProviders/AuthClientContext";

function SchedulePage({ selectedEvent, selectedYear }) {
    var httpClient = UseAuthClient();
    var [playoffSchedule, setPlayoffSchedule] = useState(null);

    useEffect(() => {
        async function getSchedule() {
            var result = await httpClient.get(`${selectedYear.value}/schedule/hybrid/${selectedEvent.value.code}/playoff`);
            var schedule = await result.json();
            setPlayoffSchedule(schedule);
        }
        if (httpClient && selectedEvent && selectedYear) {
            getSchedule()
        }
    }, [selectedEvent, selectedYear, httpClient])
    return (
        <>
            {playoffSchedule && playoffSchedule.Schedule.map((match) => {
                return (<li>{match.description} at {match.startTime}</li>)
            })
            }
        </>
    )
}

export default SchedulePage;