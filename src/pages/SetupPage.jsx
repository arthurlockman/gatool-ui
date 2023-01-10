import Select from "react-select";
import { Row, Col, Container, Alert, Button } from 'react-bootstrap';
import moment from "moment/moment";
import LogoutButton from "../components/LogoutButton";
import _ from "lodash";
import Switch from "react-switch";
import { useOnlineStatus } from "../contextProviders/OnlineContext";

import { ArrowClockwise } from 'react-bootstrap-icons';

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

const timeFormatMenu = [
    { label: "12hr", value: "h:mm:ss a" },
    { label: "24hr", value: "HH:mm:ss" },
]

const awardsMenuOptions = [
    { label: "3 (current and two prior seasons)", value: "3" },
    { label: "2 (current and prior season)", value: "2" },
    { label: "1 (current season only", value: "1" },
]

function SetupPage({ selectedEvent, setSelectedEvent, selectedYear, setSelectedYear, eventList, teamList, qualSchedule, playoffSchedule, rankings, eventFilters, setEventFilters, timeFilter, setTimeFilter, timeFormat, setTimeFormat, showSponsors, setShowSponsors, showAwards, setShowAwards, showNotes, setShowNotes, showMottoes, setShowMottoes, showChampsStats, setShowChampsStats, swapScreen, setSwapScreen, autoAdvance, setAutoAdvance, getSchedule, awardsMenu, setAwardsMenu }) {
    const isOnline = useOnlineStatus()

    function filterEvents(events) {
        //filter the array
        var filters = eventFilters?.map((e) => { return e?.value });
        if (timeFilter?.value === "past" || timeFilter?.value === "future") {
            filters.push(timeFilter.value);
        }
        var filteredEvents = events;
        //reduce the list by time, then additively include other filters
        if (_.indexOf(filters, "past") >= 0) {
            filteredEvents = _.filter(events, function (o) { return (_.indexOf(o.filters, "past") >= 0) });
        } else if (_.indexOf(filters, "future") >= 0) {
            filteredEvents = _.filter(events, function (o) { return (_.indexOf(o.filters, "future") >= 0) });
        }
        var filterTemp = [];
        if (filters.length > 0) {
            filters.forEach((filter) => {
                if (filter !== "past" && filter !== "future") {
                    filterTemp = filterTemp.concat(_.filter(filteredEvents, function (o) { return (_.indexOf(o.filters, filter) >= 0) }));
                }
            })

            //remove duplicates
            filterTemp = filterTemp.filter((item, index) => {
                return (filterTemp.indexOf(item) === index)
            })
        } else filterTemp = filteredEvents;


        //sort the list alphabetically
        filterTemp.sort(function (a, b) {
            if (a.value.name < b.value.name) {
                return -1
            }
            if (a.value.name > b.value.name) {
                return 1
            }
            return 0
        });
        return filterTemp
    }


    return (
        <Container fluid>
            {!isOnline && <Row>
                <Alert variant="danger"><b>You're offline. Only cached data is available. Some options may be unavailable. <br />Reconnect to the internet to choose a different event.</b></Alert>
            </Row>}
            <Row className="setupPageMenus">
                <Col sm={4}><b>Choose a year...</b><br /><Select options={supportedYears} value={selectedYear ? selectedYear : supportedYears[0]} onChange={setSelectedYear} isDisabled={!isOnline} />
                </Col>
                <Col sm={8}><b>...then choose an event.</b><br /><Select options={filterEvents(eventList)} placeholder={eventList?.length > 0 ? "Select an event" : "Loading event list"} value={selectedEvent} onChange={setSelectedEvent}
                    styles={{
                        option: (styles, { data }) => {
                            return {
                                ...styles,
                                backgroundColor: data.color,
                                color: "black"
                            };
                        },
                    }} isDisabled={!isOnline} /></Col>
            </Row>
            <Row className="setupPageFilters">
                <Col sm={4}><b>Filter your event list here...</b><br />
                    <Select options={filterTime} value={timeFilter ? timeFilter : filterTime[0]} onChange={setTimeFilter} isDisabled={!isOnline} />
                </Col>
                <Col sm={8}><br />
                    <Select isMulti options={filtersMenu} value={eventFilters} onChange={setEventFilters} isDisabled={!isOnline} />
                </Col>
            </Row>
            {!selectedEvent && <div>
                <Alert variant="warning" >You need to select an event before you can see anything here.</Alert>
            </div>}
            {selectedEvent && <div>
                <Row><Button size="large" onClick={getSchedule} variant="outline-success" disabled={!isOnline}><b><ArrowClockwise /> Tap to refresh Schedule.</b> <br />Use after Alliance Selection to load Playoffs.</Button></Row>
                <br />
                <h4>{selectedEvent.label}</h4>
                <Row className="leftTable">
                    <Col sm={4}>
                        <p><b>Event Code: </b>{selectedEvent?.value.code}</p>
                        {!selectedEvent?.value.type.includes("OffSeason") && <p><b>Event Week: </b>{selectedEvent?.value.weekNumber}</p>}
                        {selectedEvent?.value.type === "Regional" && <p><b>Regional Event</b></p>}
                        {selectedEvent?.value.type === "OffSeasonWithAzureSync" && <p><b>FMS Registered Offseason Event</b></p>}
                        {!selectedEvent?.value.type === "OffSeason" && <p><b>Offseason Event not registered with FMS</b></p>}
                        {selectedEvent?.value.districtCode && <p><b>District Code: </b>{selectedEvent?.value.districtCode}</p>}
                        {selectedEvent?.value.type === "ChampionshipDivision" && <p><b>Championship Division</b></p>}
                        {selectedEvent?.value.type === "ChampionshipSubdivision" && <p><b>Championship Subdivision</b></p>}
                        {selectedEvent?.value.type === "Championship" && <p><b>FIRST Championship</b></p>}
                        {selectedEvent?.value.type === "DistrictChampionship" && <p><b>District Championship</b></p>}
                        {selectedEvent?.value.city && <p><b>Event Location: </b><br />{selectedEvent?.value.venue} in {selectedEvent?.value.city}, {selectedEvent?.value.stateprov} {selectedEvent?.value.country}</p>}
                        {teamList?.teams.length > 0 && <p><b>Number of Competing teams: </b>{teamList?.teams.length}</p>}
                        {selectedEvent?.value.dateStart && <p><b>Event Start: </b>{moment(selectedEvent.value.dateStart, 'YYYY-MM-DDTHH:mm:ss').format('ddd, MMM Do YYYY')}</p>}
                        {selectedEvent?.value.dateEnd && <p><b>Event End: </b>{moment(selectedEvent.value.dateEnd, 'YYYY-MM-DDTHH:mm:ss').format('ddd, MMM Do YYYY')}</p>}
                        <img style={{ width: 140, height: 140 }} src="/images/charged-up-gs-update.svg" alt="FIRST Energize Charged Up Logo" />
                    </Col>
                    <Col sm={4}>
                        {selectedEvent?.value.allianceCount === "SixAlliance" && <p><b>Playoff Type: </b>Round Robin</p>}
                        {selectedEvent?.value.allianceCount === "EightAlliance" && <p><b>Playoff Type: </b>8 Alliance Playoffs</p>}
                        {selectedEvent?.value.allianceCount === "FourAlliance" && <p><b>Playoff Type: </b>4 Alliance Playoff</p>}
                        {qualSchedule?.lastUpdate && <p><b>Quals Schedule last updated: </b><br />{moment(qualSchedule?.lastUpdate).format("ddd, MMM Do YYYY, " + timeFormat.value)}</p>}
                        {playoffSchedule?.lastUpdate && <p><b>Playoff Schedule last updated: </b><br />{moment(playoffSchedule?.lastUpdate).format("ddd, MMM Do YYYY, " + timeFormat.value)}</p>}
                        {teamList?.lastUpdate && <p><b>Team List last updated: </b><br />{moment(teamList?.lastUpdate).format("ddd, MMM Do YYYY, " + timeFormat.value)}</p>}
                        {rankings?.lastUpdate && <p><b>Rankings last updated: </b><br />{moment(rankings?.lastUpdate).format("ddd, MMM Do YYYY, " + timeFormat.value)}</p>}
                    </Col>
                    <Col sm={4}>
                        <Row>
                            <Col width={"50px"}><Switch checked={showSponsors === null ? true : showSponsors} onChange={setShowSponsors} />
                            </Col>
                            <Col sm={10}><label><span className="switchLabel"><b>Show Sponsors on Announce </b></span></label>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={2}><Switch checked={showAwards === null ? true : showAwards} onChange={setShowAwards} />
                            </Col>
                            <Col sm={10}><label><span className="switchLabel"><b>Show Awards on Announce</b></span></label>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={2}><Switch checked={showNotes === null ? true : showNotes} onChange={setShowNotes} />
                            </Col>
                            <Col sm={10}><label><span className="switchLabel"><b>Show Notes on Announce & Play-By-Play</b></span></label>
                            </Col>
                        </Row>
                        <Switch checked={showMottoes === null ? true : showMottoes} onChange={setShowMottoes} /><label><span className="switchLabel">  <b>Show Mottoes on Announce & Play-By-Play</b></span></label><br />
                        <Switch checked={showChampsStats === null ? false : showChampsStats} onChange={setShowChampsStats} /><label><span className="switchLabel">  <b>Show Champs Statistics on Announce</b></span></label><br />
                        <Switch checked={swapScreen === null ? false : swapScreen} onChange={setSwapScreen} /><label><span className="switchLabel">  <b>Swap Play-By-Play Screen Orientation</b></span></label><br />
                        <Switch checked={autoAdvance === null ? false : autoAdvance} onChange={setAutoAdvance} /><label><span className="switchLabel">  <b>Automatically advance to the next match when loading</b></span></label><br />
                        <Row><label><b>For how many years should we display awards on the Announce Screen?</b><Select options={awardsMenuOptions} value={awardsMenu} onChange={setAwardsMenu} /></label></Row>
                        <Row><label><b>Set your time format</b><Select options={timeFormatMenu} value={timeFormat} onChange={setTimeFormat} /></label></Row>
                        <Row><LogoutButton disabled={!isOnline} /></Row>
                    </Col>
                </Row>

            </div>}

        </Container>
    )
}

export default SetupPage;