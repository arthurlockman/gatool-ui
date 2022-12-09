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
                <Select options={supportedYears} value={selectedYear ? selectedYear : supportedYears[0]} onChange={setSelectedYear} />
                <Select options={eventList} placeholder={eventList?.length > 0 ? "Select an event" : "Loading event list"} value={selectedEvent} onChange={setSelectedEvent} />
            </div>
            <div className="d-flex p-2 flex-grow-1">
                some more content
            </div>
        </div>
    )
}

export default SetupPage;