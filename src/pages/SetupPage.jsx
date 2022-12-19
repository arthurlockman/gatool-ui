import Select from "react-select";
import { Row, Col, Container } from 'react-bootstrap';

const supportedYears = [
    { label: '2023', value: '2023' },
    { label: '2022', value: '2022' },
    { label: '2021', value: '2021' },
    { label: '2020', value: '2020' },
    { label: '2019', value: '2019' }
];

const filtersMenu = [
    { value: "CHS", label: "FIRST Chesapeake" },
    { value: "FIM", label: "FIRST in Michigan" },
    { value: "FMA", label: "FIRST Mid-Atlantic" },
    { value: "FNC", label: "FIRST North Carolina" },
    { value: "FIN", label: "IndianaFIRST" },
    { value: "ISR", label: "FIRST Israel" },
    { value: "NE", label: "New England" },
    { value: "ONT", label: "Ontario" },
    { value: "PCH", label: "Peachtree" },
    { value: "PNW", label: "Pacific Northwest" },
    { value: "FIT", label: "FIRST in Texas" },
    { value: "regionals", label: "Regional Events" },
    { value: "champs", label: "FIRST Championships" },
    { value: "offseason", label: "Offseason Events" }
];

const filterTime = [
    { value: "all", label: "All Events" },
    { value: "past", label: "Past Events" },
    { value: "future", label: "Future Events" }
]

function SetupPage({ selectedEvent, setSelectedEvent, selectedYear, setSelectedYear, eventList, eventFilters, setEventFilters, timeFilter, setTimeFilter }) {
    return (
        <Container fluid>
            <Row>
                <Col sm={4}>Choose a year...<br /><Select options={supportedYears} value={selectedYear ? selectedYear : supportedYears[0]} onChange={setSelectedYear} />
                </Col>
                <Col sm={8}>
                    ...then choose an event.<br /><Select options={eventList} placeholder={eventList?.length > 0 ? "Select an event" : "Loading event list"} value={selectedEvent} onChange={setSelectedEvent}
                        styles={{
                            option: (styles, { data }) => {
                                return {
                                    ...styles,
                                    backgroundColor: data.color,
                                    color: "black"
                                };
                            },
                        }} /></Col>
            </Row>
            <Row>
                <Col sm={4}>Filter your event list here...<br />
                    <Select options={filterTime} value={timeFilter ? timeFilter : filterTime[0]} onChange={setTimeFilter} />
                </Col>
                <Col sm={8}><br />
                    <Select isMulti options={filtersMenu} value={eventFilters} onChange={setEventFilters} />
                </Col>
            </Row>
            <div className="d-flex p-2 flex-grow-1">
                some more content
            </div>
        </Container>
    )
}

export default SetupPage;