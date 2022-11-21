import { useEffect, useState } from "react";
import { Offline, Online } from "react-detect-offline";
import { Blocks } from "react-loader-spinner";
import Select from "react-select";
import { UseAuthClient } from "../contextProviders/AuthClientContext";

const supportedYears = [
    { label: '2022', value: '2022' },
    { label: '2021', value: '2021' },
    { label: '2020', value: '2020' },
    { label: '2019', value: '2019' }
];

function SetupPage({ selectedEvent, setSelectedEvent, selectedYear, setSelectedYear }) {
    // This is a demo on how to get data from the API. UseAuthClient()
    // provides us with an authenticated client that we can use to get data.
    var httpClient = UseAuthClient();

    // UseState can store data that persists across re-renders
    var [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function getData() {
            try {
                setLoading(true);
                setSelectedEvent(null);
                setEvents([]);
                // Get the data inside the UseEffect
                const val = await httpClient.get(`${selectedYear.value}/events`);
                const json = await val.json();
                setLoading(false);
                // Store the data in the UseEffect
                setEvents(json.Events.map((e) => {
                    return {
                        value: e,
                        label: e.name
                    };
                }));
            } catch (e) {
                console.error(e)
            }
        }
        if (httpClient && selectedYear && setSelectedEvent) {
            getData()
        }
    }, [httpClient, selectedYear, setSelectedEvent])

    return (
        <div className="d-flex">
            <div className="d-flex p-2 flex-grow-1">
                <Select options={supportedYears} defaultValue={selectedYear} onChange={setSelectedYear} />
                <Select options={events} placeholder="Select an event" defaultValue={selectedEvent} onChange={setSelectedEvent} />
                <Blocks
                    visible={loading}
                    height="38"
                    width="38"
                    ariaLabel="blocks-loading"
                    wrapperStyle={{}}
                    wrapperClass="blocks-wrapper"
                />
            </div>
            <div className="d-flex p-2 flex-grow-1">
                some more content
            </div>
            <Offline><span style={{
                color: 'red',
                fontSize: '100pt'
            }}>You're offline, dummy!</span></Offline>
        </div>
    )
}

export default SetupPage;