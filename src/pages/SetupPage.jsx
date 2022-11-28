import { Offline } from "react-detect-offline";
// import { Blocks } from "react-loader-spinner";
import Select from "react-select";

const supportedYears = [
    { label: '2023', value: '2023' },
    { label: '2022', value: '2022' },
    { label: '2021', value: '2021' },
    { label: '2020', value: '2020' },
    { label: '2019', value: '2019' }
];

function SetupPage({ selectedEvent, setSelectedEvent, selectedYear, setSelectedYear, eventList }) {
    return (
        <div className="d-flex">
            <div className="d-flex p-2 flex-grow-1">
                <Select options={supportedYears} defaultValue={selectedYear} onChange={setSelectedYear} />
                <Select options={eventList} placeholder="Select an event" defaultValue={selectedEvent} onChange={setSelectedEvent} />
                {/* <Blocks
                    visible={loading}
                    height="38"
                    width="38"
                    ariaLabel="blocks-loading"
                    wrapperStyle={{}}
                    wrapperClass="blocks-wrapper"
                /> */}
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