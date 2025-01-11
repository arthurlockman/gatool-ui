import Select from "react-select";
import { Row, Col, Container, Alert, Button, Modal } from 'react-bootstrap';
import moment from "moment/moment";
import LogoutButton from "../components/LogoutButton";
import _ from "lodash";
import Switch from "react-switch";
import { useOnlineStatus } from "../contextProviders/OnlineContext";
import { useState } from "react";
import { toast } from "react-toastify";
import { isSafari, isChrome, fullBrowserVersion, browserVersion, isIOS, browserName, isDesktop, isTablet, isMobile } from "react-device-detect";
import { playoffOverrideMenu } from "components/Constants";

import { ArrowClockwise } from 'react-bootstrap-icons';
import NotificationBanner from "components/NotificationBanner";

const filtersMenu = [
    { value: "CHS", label: "FIRST Chesapeake" },
    { value: "FIN", label: "IndianaFIRST" },
    { value: "ISR", label: "FIRST Israel" },
    { value: "FIM", label: "FIRST in Michigan" },
    { value: "FMA", label: "FIRST Mid-Atlantic" },
    { value: "NE", label: "New England" },
    { value: "FNC", label: "FIRST North Carolina" },
    { value: "ONT", label: "Ontario" },
    { value: "PNW", label: "Pacific Northwest" },
    { value: "PCH", label: "Peachtree" },
    { value: "FSC", label: "FIRST South Carolina" },
    { value: "FIT", label: "FIRST in Texas" },
    { value: "regional", label: "Regional Events" },
    { value: "champs", label: "FIRST Championship" },
    { value: "offseason", label: "Offseason Events" }
];

const filterTime = [
    { value: "all", label: "All Events" },
    { value: "past", label: "Past Events" },
    { value: "future", label: "Future Events" },
    { value: "thisWeek", label: "This Week" },
    { value: "thisMonth", label: "This Month" },
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

const timeFormatMenu = [
    { label: "12hr", value: "h:mm:ss a" },
    { label: "24hr", value: "HH:mm:ss" },
]

const awardsMenuOptions = [
    { label: "3 (current and two prior seasons)", value: "3" },
    { label: "2 (current and prior season)", value: "2" },
    { label: "1 (current season only)", value: "1" },
]

const monthsWarningMenu = [
    { label: "1 month", value: "1" },
    { label: "3 months", value: "3" },
    { label: "6 months", value: "6" },
    { label: "12 months", value: "12" }
]



function SetupPage({ selectedEvent, setSelectedEvent, selectedYear, setSelectedYear, eventList, teamList, qualSchedule, playoffSchedule, rankings, eventFilters, setEventFilters, timeFilter, setTimeFilter, timeFormat, setTimeFormat, showSponsors, setShowSponsors, showAwards, setShowAwards, showNotes, setShowNotes, showNotesAnnounce, setShowNotesAnnounce, showMottoes, setShowMottoes, showChampsStats, setShowChampsStats, swapScreen, setSwapScreen, autoAdvance, setAutoAdvance, autoUpdate, setAutoUpdate, getSchedule, awardsMenu, setAwardsMenu, showQualsStats, setShowQualsStats, showQualsStatsQuals, setShowQualsStatsQuals, teamReduction, setTeamReduction, playoffCountOverride, setPlayoffCountOverride, allianceCount, localUpdates, setLocalUpdates, putTeamData, getCommunityUpdates, reverseEmcee, setReverseEmcee, showDistrictChampsStats, setShowDistrictChampsStats, monthsWarning, setMonthsWarning, user, adHocMode, setAdHocMode, supportedYears, reloadPage, autoHideSponsors, setAutoHideSponsors, setLoadingCommunityUpdates, hidePracticeSchedule, setHidePracticeSchedule, systemMessage, setTeamListLoading, getTeamList, getAlliances, setHaveChampsTeams, appUpdates, usePullDownToUpdate, setUsePullDownToUpdate, useSwipe, setUseSwipe, eventLabel, setEventLabel }) {

    const isOnline = useOnlineStatus();
    const PWASupported = (isChrome && Number(browserVersion) >= 76) || (isSafari && Number(browserVersion) >= 15 && Number(fullBrowserVersion.split(".")[1]) >= 4);

    const [deleteSavedModal, setDeleteSavedModal] = useState(false);
    const [showUpdateHistory, setShowUpdateHistory] = useState(false);

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

    const uploadLocalUpdates = () => {
        var localUpdatesTemp = _.cloneDeep(localUpdates);
        localUpdatesTemp.forEach(async function (update) {
            var response = await putTeamData(update.teamNumber, update.update);
            var errorText = "";
            if (response.status !== 204) {
                errorText = `Your update for team ${update.teamNumber} was not successful. We have preserved the change locally, and you can send it later from here.`;
                toast.error(errorText);
                throw new Error(errorText);
            } else {
                errorText = `Your update for team ${update.teamNumber} was successful.`;
                localUpdatesTemp.splice(_.findIndex(localUpdatesTemp, { "teamNumber": update.teamNumber }), 1)
                toast.success(errorText);
            }
        })

        setLocalUpdates(localUpdatesTemp);
    }

    const deleteLocalUpdates = () => {
        setDeleteSavedModal(true);
    }

    const confirmDeleteLocalUpdates = async () => {
        setLocalUpdates([]);
        await setLoadingCommunityUpdates(false);
        handleClose();
        getCommunityUpdates(false, null);
    }

    function handleClose() {
        setDeleteSavedModal(false);
    }

    const handleHistory = () => {
        setShowUpdateHistory(!showUpdateHistory);
    }

    const handleGetTeamUpdates = () => {
        if (selectedEvent.value.type === "Championship") {
            setHaveChampsTeams(false);
            getAlliances();
        } else {
            setTeamListLoading("");
            getTeamList();
        }

    }

    const handleEventSelection = (e) => {
        setSelectedEvent(e);
        setEventLabel(e.label);
    }



    var updatedTeamList = localUpdates.map((update) => {
        return update.teamNumber
    })

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
                    {eventList && <span><b>...then choose an event.</b><br /><Select options={filterEvents(eventList)} placeholder={eventList?.length > 0 ? "Select an event" : "Loading event list"} value={selectedEvent} onChange={handleEventSelection}
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
                <Alert variant="warning" >You need to select an event before you can see anything here. <LogoutButton disabled={!isOnline} /></Alert>

            </div>}
            {selectedEvent && <div>
                <Row><NotificationBanner notification={systemMessage} /></Row>
                <Row><Button size="lg" onClick={getSchedule} variant="outline-success" disabled={!isOnline}><b><ArrowClockwise /> Tap to refresh Schedule.</b> <br />Use after Alliance Selection to load Playoffs.</Button></Row>
                <br />
                <h4>{eventLabel}</h4>
                <Row className="leftTable">
                    <Col sm={4}>
                        <p><b>Event Code: </b>{selectedEvent?.value.code}</p>
                        {!selectedEvent?.value.type.includes("OffSeason") && <p><b>Event Week: </b>{selectedEvent?.value.weekNumber}</p>}
                        {selectedEvent?.value.type === "Regional" && <p><b>Regional Event</b></p>}
                        {selectedEvent?.value.type === "OffSeasonWithAzureSync" && <p><b>FMS Registered Offseason Event</b></p>}
                        {(selectedEvent?.value.type === "OffSeason") && <p><b>Offseason Event not registered with FMS</b></p>}
                        {selectedEvent?.value.districtCode && <p><b>District Code: </b>{selectedEvent?.value.districtCode}</p>}
                        {selectedEvent?.value.type === "ChampionshipDivision" && <p><b>Championship Division</b></p>}
                        {selectedEvent?.value.type === "ChampionshipSubdivision" && <p><b>Championship Subdivision</b></p>}
                        {selectedEvent?.value.type === "Championship" && <p><b>FIRST Championship</b></p>}
                        {selectedEvent?.value.type === "DistrictChampionship" && <p><b>District Championship</b></p>}
                        {selectedEvent?.value.type === "DistrictChampionshipDivision" && <p><b>District Championship Division</b></p>}
                        {selectedEvent?.value.type === "DistrictChampionshipWithLevels" && <p><b>District Championship</b></p>}
                        {selectedEvent?.value.city && <p><b>Event Location: </b><br />{selectedEvent?.value.venue} in {selectedEvent?.value.city}, {selectedEvent?.value.stateprov} {selectedEvent?.value.country}</p>}
                        {teamList?.teams.length > 0 && <p><b>Number of Competing teams: </b>{teamList?.teams.length}</p>}
                        {selectedEvent?.value.dateStart && <p><b>Event Start: </b>{moment(selectedEvent.value.dateStart, 'YYYY-MM-DDTHH:mm:ss').format('ddd, MMM Do YYYY')}</p>}
                        {selectedEvent?.value.dateEnd && <p><b>Event End: </b>{moment(selectedEvent.value.dateEnd, 'YYYY-MM-DDTHH:mm:ss').format('ddd, MMM Do YYYY')}</p>}
                        <Alert variant={"danger"}><b>ADVANCED EVENT SETTINGS:</b><br />If your event includes non-competing teams in the team list, indicate the number of non-competing teams here. <b>THIS IS A RARE CONDITION</b><Select options={teamReducer} value={teamReduction ? teamReduction : teamReducer[0]} onChange={setTeamReduction} isDisabled={!teamList?.teamCountTotal} /><br />
                            If your event requires a reduced Alliance Count, you can override the Alliance Count here. <b>THIS SHOULD ONLY APPLY TO EVENTS WITH LESS THAN 26 TEAMS. </b><Select options={playoffOverrideMenu} value={playoffCountOverride ? playoffCountOverride : (allianceCount?.menu ? allianceCount.menu : playoffOverrideMenu[0])} onChange={setPlayoffCountOverride} />
                        </Alert>
                        <img style={{ width: "300px" }} src="/images/frc_reefscape.gif" alt="REEFSCAPE℠ presented by Haas Logo" />
                    </Col>
                    <Col sm={4}>
                        {selectedEvent?.value.allianceCount === "SixAlliance" && <p><b>Playoff Type: </b>Round Robin</p>}
                        {selectedEvent?.value.allianceCount === "EightAlliance" && <p><b>Playoff Type: </b>8 Alliance Playoffs</p>}
                        {selectedEvent?.value.allianceCount === "FourAlliance" && <p><b>Playoff Type: </b>4 Alliance Playoff</p>}
                        {selectedEvent?.value.allianceCount === "TwoAlliance" && <p><b>Playoff Type: </b>Best 2 out of 3 Playoff</p>}
                        {qualSchedule?.scheduleLastModified && <p><b>Quals Schedule last updated: </b><br />{moment(qualSchedule?.scheduleLastModified).format("ddd, MMM Do YYYY, " + timeFormat.value)}</p>}
                        {qualSchedule?.matchesLastModified && <p><b>Quals Results last updated: </b><br />{moment(qualSchedule?.matchesLastModified).format("ddd, MMM Do YYYY, " + timeFormat.value)}</p>}
                        {playoffSchedule?.scheduleLastModified && <p><b>Playoff Schedule last updated: </b><br />{moment(playoffSchedule?.scheduleLastModified).format("ddd, MMM Do YYYY, " + timeFormat.value)}</p>}
                        {playoffSchedule?.matchesLastModified && <p><b>Playoff Results last updated: </b><br />{moment(playoffSchedule?.matchesLastModified).format("ddd, MMM Do YYYY, " + timeFormat.value)}</p>}
                        {teamList?.lastUpdate && <p><b>Team List last updated: </b><br />{moment(teamList?.lastUpdate).format("ddd, MMM Do YYYY, " + timeFormat.value)}</p>}
                        {rankings?.lastModified && <p><b>Rankings last updated: </b><br />{moment(rankings?.lastModified).format("ddd, MMM Do YYYY, " + timeFormat.value)}</p>}
                        {((user["https://gatool.org/roles"].indexOf("user") >= 0) && localUpdates.length > 0) && <Alert><p><b>You have {localUpdates.length === 1 ? "an update for team" : "updates for teams"} {_.sortBy(updatedTeamList).join(", ")} that can be uploaded to gatool Cloud.</b></p><span><Button disabled={!isOnline} style={{ width: "45%" }} onClick={uploadLocalUpdates}>Upload to gatool Cloud now</Button>  <Button disabled={!isOnline} variant={"warning"} style={{ width: "50%" }} onClick={deleteLocalUpdates}>Delete stored updates</Button></span></Alert>}
                        <Alert variant={"warning"}><p><b>Update Team Data</b><br />You can refresh your community-sourced team data if it has changed on another device. <i><b>Know that we fetch all team data automatically when you load an event</b></i>, so you should not need this very often.</p><Button variant={"warning"} disabled={!isOnline} onClick={() => { handleGetTeamUpdates() }}>Update now</Button></Alert>
                    </Col>
                    <Col sm={4}>
                        <table>
                            <tbody>
                                <tr>
                                    <td><Switch checked={showSponsors === null ? false : showSponsors} onChange={setShowSponsors} /></td>
                                    <td><b>Always show Sponsors on Announce </b></td>
                                </tr>
                                <tr>
                                    <td><Switch checked={autoHideSponsors === null ? true : autoHideSponsors} onChange={setAutoHideSponsors} disabled={showSponsors} /></td>
                                    <td><b>Hide Sponsors on Announce after first appearance</b></td>
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
                                        <Switch checked={showNotesAnnounce === null ? true : showNotesAnnounce} onChange={setShowNotesAnnounce} />
                                    </td>
                                    <td>
                                        <b>Show Notes on Announce</b>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Switch checked={showNotes === null ? true : showNotes} onChange={setShowNotes} />
                                    </td>
                                    <td>
                                        <b>Show Notes on Play-By-Play</b>
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
                                        <b>Show Champs Statistics on Announce in World and District Champs</b>
                                    </td>
                                </tr>
                                {selectedEvent?.value?.districtCode && <tr>
                                    <td>
                                        <Switch checked={showDistrictChampsStats === null ? false : showDistrictChampsStats} onChange={setShowDistrictChampsStats} />
                                    </td>
                                    <td>
                                        <b>Show District Champs Statistics on Announce in Playoffs outside of District Champs</b>
                                    </td>
                                </tr>}
                                <tr>
                                    <td>
                                        <Switch checked={showQualsStatsQuals === null ? true : showQualsStatsQuals} onChange={setShowQualsStatsQuals} />
                                    </td>
                                    <td>
                                        <b>Show Quals Statistics on Play-By-Play during Quals</b>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Switch checked={showQualsStats === null ? false : showQualsStats} onChange={setShowQualsStats} />
                                    </td>
                                    <td>
                                        <b>Show Quals Statistics on Play-By-Play during Playoffs</b>
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
                                        <Switch checked={reverseEmcee === null ? false : reverseEmcee} onChange={setReverseEmcee} />
                                    </td>
                                    <td>
                                        <b>Swap Emcee Screen Orientation</b>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Switch checked={autoAdvance === null ? false : autoAdvance} onChange={setAutoAdvance} />
                                    </td>
                                    <td>
                                        <b>Automatically advance to the next match when loading the event <i style={{ "color": "red" }}>(Only affects when you load an event)</i></b>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Switch checked={autoUpdate === null ? false : autoUpdate} onChange={setAutoUpdate} />
                                    </td>
                                    <td>
                                        <b>Automatically track event progress, refreshing every 15 seconds <i style={{ "color": "red" }}>(will advance matches on all screens)</i></b>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Switch checked={(_.isNull(hidePracticeSchedule) || _.isUndefined(hidePracticeSchedule)) ? false : hidePracticeSchedule} onChange={setHidePracticeSchedule} />
                                    </td>
                                    <td>
                                        <b>Hide Practice Schedule before before Quals start</b>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Switch checked={(_.isNull(useSwipe) || _.isUndefined(useSwipe)) ? false : useSwipe} onChange={setUseSwipe} />
                                    </td>
                                    <td>
                                        <b>Enable swipe gestures to go to next/previous match<i><br />NOTE: You will need to use two fingers to scroll up/down when using this feature</i></b>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Switch checked={(_.isNull(usePullDownToUpdate) || _.isUndefined(usePullDownToUpdate)) ? false : usePullDownToUpdate} onChange={setUsePullDownToUpdate} disabled={!useSwipe} />
                                    </td>
                                    <td>
                                        <b>Enable pull down to update scores/ranks</b>
                                    </td>
                                </tr>

                                <tr>
                                    <td colSpan={2}>
                                        <label><b>For how many years should we display awards on the Announce Screen?</b><Select options={awardsMenuOptions} value={awardsMenu ? awardsMenu : awardsMenuOptions[0]} onChange={setAwardsMenu} /></label>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={2}>
                                        <label><b>How many months before we consider a team's data to be stale? The default is 6 months.</b><Select options={monthsWarningMenu} value={monthsWarning ? monthsWarning : monthsWarningMenu[2]} onChange={setMonthsWarning} /></label>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Switch checked={adHocMode === null ? false : adHocMode} onChange={setAdHocMode} />
                                    </td>
                                    <td>
                                        <b>Enable Test Match Mode. If you enable this mode, you will need to enter team numbers on the Announce Screen. This will disable match navigation.</b>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={2}>
                                        <label><b>Set your time format</b><Select options={timeFormatMenu} value={timeFormat} onChange={setTimeFormat} /></label>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={2}>
                                        <Alert variant={"warning"}><p><b>Reload cached gatool code</b><br />If you know that there are updates to gatool, but you are not seeing them here, you can reload the code. This will not remove any stored settings or team data. Your browser is {browserName} version {fullBrowserVersion} on {isDesktop ? <>desktop</> : isTablet ? <>tablet</> : isMobile ? <>mobile</> : <>unknown surface</>}.{!PWASupported ? <><br /><b><i>Note: Your browser may not support clearing cache this way. Please delete and restore your Home Screen {isIOS ? "icon" : "tile"}.</i></b></> : <></>}</p>
                                            <Row><Col><Button variant={"warning"} onClick={handleHistory}>Show update history</Button></Col>
                                                <Col><Button variant={"warning"} disabled={!isOnline} onClick={reloadPage}>Clear page cache</Button></Col>
                                            </Row>
                                        </Alert>

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
                <Modal centered={true} show={deleteSavedModal} size="lg" onHide={handleClose}>
                    <Modal.Header className={"allianceDecline"} closeVariant={"white"} closeButton>
                        <Modal.Title >Delete Stored Team Details</Modal.Title>
                    </Modal.Header>
                    <Modal.Body key={"storedUpdatesModal"}>
                        <p><b>Are you sure you want to delete the stored {localUpdates.length === 1 ? "update for team" : "updates for teams"} {_.sortBy(updatedTeamList).join(", ")}?</b></p>
                        <p>Know that {localUpdates.length === 1 ? "this update is" : "these updates are"} still loaded and visible in all team displays. If you reload this event, however, {localUpdates.length === 1 ? "this update" : "these updates"} will be lost unless you upload {localUpdates.length === 1 ? "it" : "them"} now from the Team Info screen.</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>Close without deleting updates</Button>
                        <Button variant="danger" onClick={confirmDeleteLocalUpdates}>Delete stored updates</Button>
                    </Modal.Footer>
                </Modal>
                <Modal centered={true} show={showUpdateHistory} size="lg" onHide={handleHistory}>
                    <Modal.Header className={"allianceDecline"} closeVariant={"white"} closeButton>
                        <Modal.Title >Update History</Modal.Title>
                    </Modal.Header>
                    <Modal.Body key={"updatesHistory"}>
                        <Container>
                            {appUpdates.map((appUpdate) => {
                                return <Row><Col xs={3}><b>{appUpdate.date}</b></Col>
                                    <Col xs={9}>{appUpdate.message}</Col></Row>
                            })}
                        </Container>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleHistory}>Done</Button>
                    </Modal.Footer>
                </Modal>
            </div>
            }

        </Container>

    )
}

export default SetupPage;