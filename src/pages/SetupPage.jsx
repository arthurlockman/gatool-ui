import Select from "react-select";
import { Row, Col, Container, Alert, Button } from 'react-bootstrap';
import moment from "moment/moment";
import LogoutButton from "../components/LogoutButton";
import _ from "lodash";
import Switch from "react-switch";
import { useOnlineStatus } from "../contextProviders/OnlineContext";
import { toast } from "react-toastify";

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
    { value: "regional", label: "Regional Events" },
    { value: "champs", label: "FIRST Championships" },
    { value: "offseason", label: "Offseason Events" }
];

const filterTime = [
    { value: "all", label: "All Events" },
    { value: "past", label: "Past Events" },
    { value: "future", label: "Future Events" },
    { value: "week0", label: "Week 0" },
    { value: "week1", label: "Week 1" },
    { value: "week2", label: "Week 2" },
    { value: "week3", label: "Week 3" },
    { value: "week4", label: "Week 4" },
    { value: "week5", label: "Week 5" },
    { value: "week6", label: "Week 6" },
    { value: "week7", label: "Week 7" },
    { value: "week8", label: "Week 8" },
]

const teamReducer = [
    { value: 0, label: 0 },
    { value: 1, label: 1 },
    { value: 2, label: 2 },
    { value: 3, label: 3 },
    { value: 4, label: 4 }
]

const playoffOverrideMenu = [
    { value: 8, label: 8 },
    { value: 7, label: 7 },
    { value: 6, label: 6 },
    { value: 5, label: 5 },
    { value: 4, label: 4 },
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

function SetupPage({ selectedEvent, setSelectedEvent, selectedYear, setSelectedYear, eventList, teamList, qualSchedule, playoffSchedule, rankings, eventFilters, setEventFilters, timeFilter, setTimeFilter, timeFormat, setTimeFormat, showSponsors, setShowSponsors, showAwards, setShowAwards, showNotes, setShowNotes, showMottoes, setShowMottoes, showChampsStats, setShowChampsStats, swapScreen, setSwapScreen, autoAdvance, setAutoAdvance, getSchedule, awardsMenu, setAwardsMenu, showQualsStats, setShowQualsStats, teamReduction, setTeamReduction, playoffCountOverride, setPlayoffCountOverride, allianceCount, localUpdates, setLocalUpdates, putTeamData, getCommunityUpdates}) {
    const isOnline = useOnlineStatus()

    function filterEvents(events) {
        //filter the array
        var filters = eventFilters?.map((e) => { return e?.value });

        var filteredEvents = events;
        //reduce the list by time, then additively include other filters
        if (timeFilter && (timeFilter?.value !== "all")) {
            filteredEvents = _.filter(events, function (o) { return (_.indexOf(o?.filters, timeFilter.value) >= 0) });
        }
        var filterTemp = [];
        if (filters.length > 0) {
            filters.forEach((filter) => {
                filterTemp = filterTemp.concat(_.filter(filteredEvents, function (o) { return (_.indexOf(o.filters, filter) >= 0) }));
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

    function uploadLocalUpdates() {
        var localUpdatesTemp = _.cloneDeep(localUpdates);
        var success = [];
        localUpdatesTemp.forEach((update) => {
            var result = putTeamData(update.teamNumber, update.update);
            var errorText = "";
            if (!result) {
                errorText = `Your update for team ${update.teamNumber} was not successful. We have preserved the change locally, and you can send it later from here.`;
                toast.error(errorText);
                throw new Error(errorText);
            } else {
                errorText = `Your update for team ${update.teamNumber} was successful.`;
                success.push(update);
                toast.success(errorText);
            }
        })
        success.forEach((item) => {
            localUpdatesTemp.splice(_.findIndex(localUpdatesTemp, { "teamNumber": item.teamNumber }), 1)
        })
        setLocalUpdates(localUpdatesTemp);
    }

    if (!selectedYear) {
        setSelectedYear(supportedYears[0]);
    }

    return (
        <Container fluid>
            {!isOnline && <Row>
                <Alert variant="danger"><b>You're offline. Only cached data is available. Some options may be unavailable. <br />Reconnect to the internet to choose a different event.</b></Alert>
            </Row>}
            {!selectedYear && <Row>
                <Alert variant="danger"><b>Awaiting event list</b></Alert>
            </Row>}
            <Row className="setupPageMenus">
                <Col sm={4}><b>Choose a year...</b><br /><Select options={supportedYears} value={selectedYear ? selectedYear : supportedYears[0]} onChange={setSelectedYear} isDisabled={!isOnline} />
                </Col>
                <Col sm={8}>
                    {eventList && <span><b>...then choose an event.</b><br /><Select options={filterEvents(eventList)} placeholder={eventList?.length > 0 ? "Select an event" : "Loading event list"} value={selectedEvent} onChange={setSelectedEvent}
                        styles={{
                            option: (styles, { data }) => {
                                return {
                                    ...styles,
                                    backgroundColor: data.color,
                                    color: "black"
                                };
                            },
                        }} isDisabled={!isOnline} /></span>}
                </Col>
            </Row>
            {eventList && <Row className="setupPageFilters">
                <Col sm={4}><b>Filter by event timeframe here...</b><br />
                    <Select options={filterTime} value={timeFilter ? timeFilter : filterTime[0]} onChange={setTimeFilter} isDisabled={!isOnline} />
                </Col>
                <Col sm={8}><b>Filter by event type or District here...</b><br />
                    <Select isMulti options={filtersMenu} value={eventFilters} onChange={setEventFilters} isDisabled={!isOnline} />
                </Col>
            </Row>}
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
                        <Alert variant={"danger"}><b>ADVANCED EVENT SETTINGS:</b><br />If your event includes non-competing teams in the team list, indicate the number of non-competing teams here. <b>THIS IS A RARE CONDITION</b><Select options={teamReducer} value={teamReduction ? teamReduction : teamReducer[0]} onChange={setTeamReduction} isDisabled={!teamList?.teamCountTotal} /><br />
                            If your event requires a reduced Alliance Count, you can override the Alliance Count here. <b>THIS SHOULD ONLY APPLY TO EVENTS WITH LESS THAN 24 TEAMS. </b><Select options={playoffOverrideMenu} value={playoffCountOverride ? playoffCountOverride : (allianceCount?.menu ? allianceCount.menu : playoffOverrideMenu[0])} onChange={setPlayoffCountOverride} />
                        </Alert>
                        <img style={{ width: 180 }} src="/images/CHARGED_UP_Logo_Horiz_RGB_FullColor.png" alt="FIRST Energize Charged Up Logo" />
                    </Col>
                    <Col sm={4}>
                        {selectedEvent?.value.allianceCount === "SixAlliance" && <p><b>Playoff Type: </b>Round Robin</p>}
                        {selectedEvent?.value.allianceCount === "EightAlliance" && <p><b>Playoff Type: </b>8 Alliance Playoffs</p>}
                        {selectedEvent?.value.allianceCount === "FourAlliance" && <p><b>Playoff Type: </b>4 Alliance Playoff</p>}
                        {qualSchedule?.lastUpdate && <p><b>Quals Schedule last updated: </b><br />{moment(qualSchedule?.lastUpdate).format("ddd, MMM Do YYYY, " + timeFormat.value)}</p>}
                        {playoffSchedule?.lastUpdate && <p><b>Playoff Schedule last updated: </b><br />{moment(playoffSchedule?.lastUpdate).format("ddd, MMM Do YYYY, " + timeFormat.value)}</p>}
                        {teamList?.lastUpdate && <p><b>Team List last updated: </b><br />{moment(teamList?.lastUpdate).format("ddd, MMM Do YYYY, " + timeFormat.value)}</p>}
                        {rankings?.lastUpdate && <p><b>Rankings last updated: </b><br />{moment(rankings?.lastUpdate).format("ddd, MMM Do YYYY, " + timeFormat.value)}</p>}
                        {localUpdates.length > 0 && <Alert><p><b>You have updates that can be uploaded to gatool Cloud.</b></p><Button disabled={!isOnline} onClick={uploadLocalUpdates}>Upload to gatool Cloud now</Button></Alert>}
                        <Alert variant={"warning"}><p><b>Update Team Data</b><br />You can refresh your team data if it has changed on another device. <i><b>Know that we fetch all team data automatically when you load an event</b></i>, so you should not need this very often.</p><Button variant={"warning"} disabled={!isOnline} onClick={(e) => { getCommunityUpdates(true, e) }}>Update now</Button></Alert>
                    </Col>
                    <Col sm={4}>
                        <table>
                            <tbody>
                                <tr>
                                    <td><Switch checked={showSponsors === null ? true : showSponsors} onChange={setShowSponsors} /></td>
                                    <td><b>Show Sponsors on Announce </b></td>
                                </tr>
                                <tr>
                                    <td>
                                        <Switch checked={showAwards === null ? true : showAwards} onChange={setShowAwards} />
                                    </td>
                                    <td>
                                        <b>Show Awards on Announce</b>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Switch checked={showNotes === null ? true : showNotes} onChange={setShowNotes} />
                                    </td>
                                    <td>
                                        <b>Show Notes on Announce & Play-By-Play</b>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Switch checked={showMottoes === null ? true : showMottoes} onChange={setShowMottoes} />
                                    </td>
                                    <td>
                                        <b>Show Mottoes on Announce & Play-By-Play</b>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Switch checked={showChampsStats === null ? false : showChampsStats} onChange={setShowChampsStats} />
                                    </td>
                                    <td>
                                        <b>Show Champs Statistics on Announce</b>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Switch checked={showQualsStats === null ? false : showQualsStats} onChange={setShowQualsStats} />
                                    </td>
                                    <td>
                                        <b>Show Quals Statistics on Announce during Playoffs</b>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Switch checked={swapScreen === null ? false : swapScreen} onChange={setSwapScreen} />
                                    </td>
                                    <td>
                                        <b>Swap Play-By-Play Screen Orientation</b>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Switch checked={autoAdvance === null ? false : autoAdvance} onChange={setAutoAdvance} disabled />
                                    </td>
                                    <td>
                                        <b>Future Feature: Automatically advance to the next match when loading</b>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={2}>
                                        <label><b>For how many years should we display awards on the Announce Screen?</b><Select options={awardsMenuOptions} value={awardsMenu ? awardsMenu : awardsMenuOptions[0]} onChange={setAwardsMenu} /></label>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={2}>
                                        <label><b>Set your time format</b><Select options={timeFormatMenu} value={timeFormat} onChange={setTimeFormat} /></label>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={2}>
                                        <LogoutButton disabled={!isOnline} />
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                    </Col>
                </Row>
                <br />
                <br />
                <br />
            </div>
            }

        </Container>

    )
}

export default SetupPage;