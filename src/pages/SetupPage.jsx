import Select from "react-select";
import { Row, Col, Container, Alert, Button, Modal, ButtonGroup, Form, InputGroup } from 'react-bootstrap';
import moment from "moment/moment";
import LogoutButton from "../components/LogoutButton";
import LoginButton from "components/LoginButton";
import _ from "lodash";
import Switch from "react-switch";
import { useOnlineStatus } from "../contextProviders/OnlineContext";
import { useState } from "react";
import { toast } from "react-toastify";
import { isSafari, isChrome, fullBrowserVersion, browserVersion, isIOS, browserName, isDesktop, isTablet, isMobile } from "react-device-detect";
import { playoffOverrideMenu } from "components/Constants";
import Contenteditable from "components/ContentEditable";
import { ArrowClockwise, Trash, Copy, Plus, BellFill, CaretUpFill, CaretDownFill } from 'react-bootstrap-icons';
import NotificationBanner from "components/NotificationBanner";
import { Link } from "react-router-dom";


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

const filterTimeFTC = [
    { value: "all", label: "All Events" },
    { value: "past", label: "Past Events" },
    { value: "future", label: "Future Events" },
    { value: "thisWeek", label: "This Week" },
    { value: "thisMonth", label: "This Month" },
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

const ftcModeOptions = [
    { value: "FRC", label: "FRC" },
    { value: "FTCOnline", label: "FTC Online" },
    { value: "FTCLocal", label: "FTC Local Server" },
];



function SetupPage({ selectedEvent, setSelectedEvent, selectedYear, setSelectedYear, eventList, teamList, qualSchedule, playoffSchedule, rankings, eventFilters, setEventFilters, regionFilters, setRegionFilters, districts, timeFilter, setTimeFilter, timeFormat, setTimeFormat, showSponsors, setShowSponsors, showAwards, setShowAwards, showNotes, setShowNotes, showNotesAnnounce, setShowNotesAnnounce, showMottoes, setShowMottoes, showChampsStats, setShowChampsStats, swapScreen, setSwapScreen, autoAdvance, setAutoAdvance, autoUpdate, setAutoUpdate, getSchedule, awardsMenu, setAwardsMenu, showQualsStats, setShowQualsStats, showQualsStatsQuals, setShowQualsStatsQuals, teamReduction, setTeamReduction, playoffCountOverride, setPlayoffCountOverride, allianceCount, localUpdates, setLocalUpdates, putTeamData, getCommunityUpdates, reverseEmcee, setReverseEmcee, showDistrictChampsStats, setShowDistrictChampsStats, monthsWarning, setMonthsWarning, user, isAuthenticated, adHocMode, setAdHocMode, supportedYears, FTCSupportedYears, reloadPage, autoHideSponsors, setAutoHideSponsors, setLoadingCommunityUpdates, hidePracticeSchedule, setHidePracticeSchedule, systemMessage, setTeamListLoading, getTeamList, getAlliances, setHaveChampsTeams, appUpdates, usePullDownToUpdate, setUsePullDownToUpdate, useSwipe, setUseSwipe, eventLabel, setEventLabel, showInspection, setShowInspection, showMinorAwards, setShowMinorAwards, highScoreMode, setHighScoreMode, systemBell, setSystemBell, eventBell, setEventBell, eventMessage, setEventMessage, putEventNotifications, useCheesyArena, setUseCheesyArena, ftcLeagues, ftcRegions, ftcMode, setFTCMode, ftcTypes, useFTCOffline, setUseFTCOffline, FTCServerURL, setFTCServerURL, FTCKey, requestFTCKey, checkFTCKey, FTCOfflineAvailable, getFTCOfflineStatus }) {
    const isOnline = useOnlineStatus();
    const PWASupported = (isChrome && Number(browserVersion) >= 76) || (isSafari && Number(browserVersion) >= 15 && Number(fullBrowserVersion.split(".")[1]) >= 4);

    const [deleteSavedModal, setDeleteSavedModal] = useState(false);
    const [showUpdateHistory, setShowUpdateHistory] = useState(false);
    const [manageAnnouncements, setManageAnnouncements] = useState(false);
    const [eventMessageFormData, setEventMessageFormData] = useState(eventMessage);
    const [showTeamInfoSettings, setShowTeamInfoSettings] = useState(false);
    const [showStatsSettings, setShowStatsSettings] = useState(false);
    const [showUISettings, setShowUISettings] = useState(false);

    const filtersMenu = [
        ...districts,
        { value: "regional", label: "Regional Events" },
        { value: "champs", label: "FIRST Championship" },
        { value: "offseason", label: "Offseason Events" }
    ];

    const ftcFiltersMenu = _.orderBy(ftcLeagues, "label", "asc")

    const regionFiltersMenu = [...ftcTypes.map((/** @type {{ type: string; description: string; }} */ type) => {
        return { value: type.type, label: type.description }
    }), ..._.orderBy(ftcRegions.map((/** @type {{ regionCode: string; description: string; }} */ region) => {
        return { value: region.regionCode, label: region.description }
    }), "label", "asc")];

    function filterEvents(events) {
        //filter the array
        var filters = [...eventFilters?.map((e) => { return e?.value }), ...regionFilters?.map((e) => { return e?.value })];

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
        if (selectedEvent?.value.type === "Championship") {
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

    const handleFTCMode = (checked) => {
        setFTCMode(checked.value === "FRC" ? null : checked);
        setUseFTCOffline(checked.value === "FTCLocal");
        setEventFilters([]);
        setRegionFilters([]);
        setTimeFilter({ label: "All Events", value: "all" });
        setSelectedEvent(null);
        setSelectedYear(checked.value === "FRC" ? supportedYears[0] : FTCSupportedYears[0]);
    }

    const handleEventNotification = (property, index, value, user) => {
        var eventNotificationsTemp = _.cloneDeep(eventMessageFormData);
        if (property === "delete") {
            eventNotificationsTemp.splice(index, 1);
        } else if (property === "duplicate") {
            eventNotificationsTemp.push({ ...eventNotificationsTemp[index], user: user?.email });
        }
        else if (property === "add") {
            eventNotificationsTemp.push({ "message": "", "onTime": moment().add(1, "days").format("YYYY-MM-DDTHH:mm:ss"), "expiry": moment().add(1, "days").format("YYYY-MM-DDTHH:mm:ss"), "variant": "primary", "link": "" });
        }
        else {
            eventNotificationsTemp[index][property] = value;
            eventNotificationsTemp[index]["user"] = user?.email;
        }
        setEventMessageFormData(eventNotificationsTemp);
    }

    const handleEventNotificationOpen = () => {
        setEventMessageFormData(_.cloneDeep(eventMessage));
        setManageAnnouncements(true);
    }

    const handleEventNotificationClose = () => {
        setEventMessageFormData(null);
        setManageAnnouncements(false);
    }

    const handleEventNotificationSave = () => {
        setEventMessage(_.filter(eventMessageFormData, function (o) {
            return (o.message !== "")
        }));
        let eventMessageFormDataTemp = eventMessageFormData.map((message) => {
            return {
                ...message,
                onDate: moment(message.onTime).format("YYYY-MM-DD"),
                onTime: moment(message.onTime).format("HH:mm:ss"),
                offDate: moment(message.expiry).format("YYYY-MM-DD"),
                offTime: moment(message.expiry).format("HH:mm:ss"),
            }
        });

        putEventNotifications(eventMessageFormDataTemp);

        setEventMessageFormData(null);
        setManageAnnouncements(false);
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
            <Row className={ftcMode ? "ftcSetupPageMenus" : "setupPageMenus"}>
                <Col sm={2}>
                    <b>Choose a program...</b><br /><Select options={ftcModeOptions} value={ftcMode ? ftcMode : { label: "FRC", value: "FRC" }} onChange={handleFTCMode} />
                </Col>
                <Col sm={3}><b>Choose a year...</b><br /><Select options={ftcMode ? FTCSupportedYears : supportedYears} value={selectedYear} onChange={setSelectedYear} isDisabled={!isOnline} />
                </Col>
                <Col sm={7}>
                    {eventList && <span><b>...then choose an event.</b><br /><Select options={filterEvents(eventList)} placeholder={eventList?.length > 0 ? "Select an event" : "Loading event list"} value={selectedEvent} onChange={handleEventSelection}
                        styles={{
                            // @ts-ignore
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
            {eventList && !useFTCOffline && <Row className="setupPageFilters">
                <Col sm={4}><b>Filter by event timeframe here...</b><br />
                    <Select options={ftcMode ? filterTimeFTC : filterTime} value={timeFilter ? timeFilter : ftcMode ? filterTimeFTC[0] : filterTime[0]} onChange={setTimeFilter} isDisabled={!isOnline} />
                </Col>
                {ftcMode && <Col sm={4}><b>Filter by Event Type or Region here...</b><br />
                    <Select isMulti options={regionFiltersMenu} value={regionFilters} onChange={setRegionFilters} isDisabled={!isOnline} />
                </Col>}
                <Col sm={ftcMode ? 4 : 8}><b>Filter by  {ftcMode ? "League" : "event type or District"} here...</b><br />
                    <Select isMulti options={ftcMode ? ftcFiltersMenu : filtersMenu} value={eventFilters} onChange={setEventFilters} isDisabled={!isOnline} />
                </Col>
            </Row>}
            {useFTCOffline && <Row className="ftcSetupPageMenus">
                <Col><h4>You must configure gatool to use a local FTC server.<br />
                    Please take the following steps:</h4>
                    <div style={{ textAlign: "left" }}><ol>
                        <li>Ensure that your browser is configured to use unsafe content.</li>
                        <li>Enter the URL for the local FTC server</li>
                        <li>Request API access, which your FTA must approve</li>
                        <li>Once approved, verify API status</li>
                        <li>Select your event from the menu above</li>
                    </ol></div>
                </Col>
                <Col style={{ textAlign: "left" }}><Form>
                    <Form.Group controlId="FTCServerURL">
                        <Form.Label className={"formLabel"}><b>Server URL (usually in http://10.0.100.5 format)</b></Form.Label>
                        <Form.Control type="text" placeholder={"usually in http://10.0.100.5 format"} value={FTCServerURL} onChange={(e) => setFTCServerURL(e.target.value)} />
                    </Form.Group>
                </Form>
                    {!FTCKey?.key && !FTCKey?.active && FTCOfflineAvailable && <Button onClick={requestFTCKey}>Request API Access</Button>}
                    {FTCKey?.key && FTCKey?.FTCServerURL !== FTCServerURL && FTCOfflineAvailable && <Button onClick={requestFTCKey}>Request new API Access</Button>}
                    {FTCKey?.key && FTCKey?.FTCServerURL === FTCServerURL && !FTCKey?.active && FTCOfflineAvailable && <Button onClick={checkFTCKey}>Verify API Access</Button>}
                    {FTCKey?.key && FTCKey?.FTCServerURL === FTCServerURL && FTCKey?.active && FTCOfflineAvailable && <><Button onClick={checkFTCKey} variant="success">API Access Granted!</Button>{FTCKey?.key ? <><br />{`Key: ${FTCKey?.key}`}</> : ""}</>}
                    {!FTCOfflineAvailable && <Button onClick={getFTCOfflineStatus} variant={"danger"}>FTC Local Server unavailable. Click to check status.</Button>}

                </Col>
            </Row>}
            {!selectedEvent && <div>
                <Alert variant="warning" >You need to select an event before you can see anything here. {isAuthenticated && <LogoutButton disabled={!isOnline} />}
                    {!isAuthenticated && <LoginButton disabled={!isOnline} />}</Alert>

            </div>}
            {selectedEvent && <div>
                {systemBell !== JSON.stringify(systemMessage) &&
                    <Row><NotificationBanner notification={systemMessage} systemBell={systemBell} setSystemBell={setSystemBell} />
                    </Row>}
                <Row>
                    <Button size="lg" onClick={getSchedule} variant="outline-success" disabled={!isOnline}><b><ArrowClockwise /> Tap to refresh Schedule.</b> <br />Use after Alliance Selection to load Playoffs.</Button>
                </Row>
                <br />
                <h4>{eventLabel}</h4>
                <Row className="leftTable">
                    <Col sm={4}>
                        <p><b>Event Code: </b>{selectedEvent?.value.code}</p>
                        {!selectedEvent?.value.type.includes("OffSeason") && !ftcMode && <p><b>Event Week: </b>{selectedEvent?.value.weekNumber}</p>}
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
                        {selectedEvent?.value.dateStart && <p><b>Event Start: </b>{moment(selectedEvent?.value.dateStart, 'YYYY-MM-DDTHH:mm:ss').format('ddd, MMM Do YYYY')}</p>}
                        {selectedEvent?.value.dateEnd && <p><b>Event End: </b>{moment(selectedEvent?.value.dateEnd, 'YYYY-MM-DDTHH:mm:ss').format('ddd, MMM Do YYYY')}</p>}
                        <Alert variant={"danger"}><b>ADVANCED EVENT SETTINGS:</b><br />If your event includes non-competing teams in the team list, indicate the number of non-competing teams here. <b>THIS IS A RARE CONDITION</b><Select options={teamReducer} value={teamReduction ? teamReduction : teamReducer[0]} onChange={setTeamReduction} isDisabled={!teamList?.teamCountTotal} /><br />
                            If your event requires a reduced Alliance Count, you can override the Alliance Count here. <b>THIS SHOULD ONLY APPLY TO EVENTS WITH LESS THAN 26 TEAMS. </b><Select options={playoffOverrideMenu} value={playoffCountOverride ? playoffCountOverride : (allianceCount?.menu ? allianceCount.menu : playoffOverrideMenu[0])} onChange={setPlayoffCountOverride} />
                        </Alert>
                        <div>
                            {!ftcMode && <img style={{ width: "100%" }} src="/images/frc_reefscape.gif" alt="REEFSCAPE℠ presented by Haas Logo" />}
                            {ftcMode && <img style={{ width: "100%" }} src="/images/first_age_ftc_decode_logo_vertical_rgb_fullcolor.png" alt="DECODE℠ presented by Haas Logo" />}
                        </div>
                    </Col>
                    <Col sm={4}>
                        {selectedEvent?.value.allianceCount === "EightAlliance" && <p><b>Playoff Type: </b>8 Alliance Playoffs</p>}
                        {selectedEvent?.value.allianceCount === "SixAlliance" && <p><b>Playoff Type: </b>6 Alliance Playoffs</p>}
                        {selectedEvent?.value.allianceCount === "FourAlliance" && <p><b>Playoff Type: </b>4 Alliance Playoff</p>}
                        {selectedEvent?.value.allianceCount === "TwoAlliance" && <p><b>Playoff Type: </b>Best 2 out of 3 Playoff</p>}
                        {qualSchedule?.scheduleLastModified && <p><b>Quals Schedule last updated: </b><br />{moment(qualSchedule?.scheduleLastModified).format("ddd, MMM Do YYYY, " + timeFormat.value)}</p>}
                        {qualSchedule?.matchesLastModified && <p><b>Quals Results last updated: </b><br />{moment(qualSchedule?.matchesLastModified).format("ddd, MMM Do YYYY, " + timeFormat.value)}</p>}
                        {playoffSchedule?.scheduleLastModified && <p><b>Playoff Schedule last updated: </b><br />{moment(playoffSchedule?.scheduleLastModified).format("ddd, MMM Do YYYY, " + timeFormat.value)}</p>}
                        {playoffSchedule?.matchesLastModified && <p><b>Playoff Results last updated: </b><br />{moment(playoffSchedule?.matchesLastModified).format("ddd, MMM Do YYYY, " + timeFormat.value)}</p>}
                        {teamList?.lastUpdate && <p><b>Team List last updated: </b><br />{moment(teamList?.lastUpdate).format("ddd, MMM Do YYYY, " + timeFormat.value)}</p>}
                        {rankings?.lastModified && <p><b>Rankings last updated: </b><br />{moment(rankings?.lastModified).format("ddd, MMM Do YYYY, " + timeFormat.value)}</p>}
                        {((isAuthenticated && user["https://gatool.org/roles"] && (user["https://gatool.org/roles"].indexOf("user") >= 0)) && localUpdates.length > 0) &&
                            <Alert>
                                <p><b>You have {localUpdates.length === 1 ? "an update for team" : "updates for teams"} {_.sortBy(updatedTeamList).join(", ")} that can be uploaded to gatool Cloud.</b></p>
                                <span><Button disabled={!isOnline} style={{ width: "45%" }} onClick={uploadLocalUpdates}>Upload to gatool Cloud now</Button>  <Button disabled={!isOnline} variant={"warning"} style={{ width: "50%" }} onClick={deleteLocalUpdates}>Delete stored updates</Button></span>
                            </Alert>
                        }
                        <Alert variant={"warning"}>
                            <p><b>Update Team Data</b><br />
                                You can refresh your community-sourced team data if it has changed on another device. <i><b>Know that we fetch all team data automatically when you load an event</b></i>, so you should not need this very often.</p>
                            <Button variant={"warning"} disabled={!isOnline} onClick={() => { handleGetTeamUpdates() }}>Update now</Button>
                        </Alert>
                        {(isAuthenticated && (user["https://gatool.org/roles"].indexOf("user") >= 0 || user["https://gatool.org/roles"].indexOf("admin") >= 0)) &&
                            <Alert variant="info">
                                <p><b>Announcements</b><br />
                                    You can manage your event's announcements here. You can add, edit, or delete announcements. You can also set the time and date for each announcement to appear and disappear.</p>
                                <Button variant="info" onClick={() => { handleEventNotificationOpen() }}>Manage event notifications</Button></Alert>}

                        {eventBell.length > 0 &&
                            <Button variant="warning" size="sm" onClick={() => { setEventBell([]) }} >Reset dismissed Event Announcements</Button>}

                        {systemBell === JSON.stringify(systemMessage) &&
                            <ButtonGroup>
                                <Button variant="warning" size="sm" onClick={() => {
                                    setSystemBell("")
                                }} >
                                    <BellFill />Reset dismissed System Notifications</Button>
                            </ButtonGroup>}
                        {(isAuthenticated && user["https://gatool.org/roles"].indexOf("admin") >= 0) &&
                            <Link to="/dev">
                                <Button variant="outline-danger" size="sm" onClick={() => { }} >Go to developer tools</Button>
                            </Link>}



                    </Col>
                    <Col sm={4}>
                        <table>
                            <tbody>
                                <tr onClick={() => { setShowTeamInfoSettings(!showTeamInfoSettings) }} className={"teamInfoSettings"}>
                                    <td colSpan={2} style={{ fontSize: "1.25em" }}>{showTeamInfoSettings ? <CaretUpFill /> : <CaretDownFill />} <b>{showTeamInfoSettings ? "Hide" : "Show"} Team Info Settings</b></td>
                                </tr>
                                {showTeamInfoSettings && <>
                                    <tr className={"teamInfoSettings"}>
                                        <td><Switch checked={showSponsors === null ? false : showSponsors} onChange={setShowSponsors} /></td>
                                        <td><b>Always show Sponsors on Announce </b></td>
                                    </tr>
                                    <tr className={"teamInfoSettings"}>
                                        <td><Switch checked={autoHideSponsors === null ? true : autoHideSponsors} onChange={setAutoHideSponsors} disabled={showSponsors} /></td>
                                        <td><b>Hide Sponsors on Announce after first appearance</b></td>
                                    </tr>
                                    <tr className={"teamInfoSettings"}>
                                        <td><Switch checked={showAwards === null ? true : showAwards} onChange={setShowAwards} /></td>
                                        <td><b>Show Awards on Announce</b></td>
                                    </tr>
                                    <td colSpan={2} className={"teamInfoSettings"}>
                                        <label><b>For how many years should we display awards on the Announce Screen?</b><Select options={awardsMenuOptions} value={awardsMenu ? awardsMenu : awardsMenuOptions[0]} onChange={setAwardsMenu} /></label>
                                    </td>
                                    <tr className={"teamInfoSettings"}>
                                        <td><Switch checked={_.isNull(showMinorAwards) ? true : showMinorAwards} onChange={setShowMinorAwards} disabled={!(showAwards || _.isNull(showAwards))} /></td>
                                        <td><b>Show Minor Awards on Announce</b></td>
                                    </tr>
                                    <tr className={"teamInfoSettings"}>
                                        <td>
                                            <Switch checked={showNotesAnnounce === null ? true : showNotesAnnounce} onChange={setShowNotesAnnounce} />
                                        </td>
                                        <td>
                                            <b>Show Notes on Announce</b>
                                        </td>
                                    </tr>
                                    <tr className={"teamInfoSettings"}>
                                        <td>
                                            <Switch checked={showNotes === null ? true : showNotes} onChange={setShowNotes} />
                                        </td>
                                        <td>
                                            <b>Show Notes on Play-By-Play</b>
                                        </td>
                                    </tr>
                                    <tr className={"teamInfoSettings"}>
                                        <td>
                                            <Switch checked={showMottoes === null ? true : showMottoes} onChange={setShowMottoes} />
                                        </td>
                                        <td>
                                            <b>Show Mottoes on Announce & Play-By-Play</b>
                                        </td>
                                    </tr>
                                    <tr>

                                    </tr>
                                    <tr>
                                        <td colSpan={2} className={"teamInfoSettings"}>
                                            <label><b>How many months before we consider a team's data to be stale? The default is 6 months.</b><Select options={monthsWarningMenu} value={monthsWarning ? monthsWarning : monthsWarningMenu[2]} onChange={setMonthsWarning} /></label>
                                        </td>
                                    </tr>
                                </>}
                                <tr onClick={() => { setShowStatsSettings(!showStatsSettings) }} className={"statsSettings"} >
                                    <td style={{ fontSize: "1.25em" }} colSpan={2}>{showStatsSettings ? <CaretUpFill /> : <CaretDownFill />} <b>{showStatsSettings ? "Hide" : "Show"} Event Statistics Settings</b></td>
                                </tr>
                                {showStatsSettings && <>
                                    <tr className={"statsSettings"}>
                                        <td>
                                            <Switch checked={showChampsStats === null ? false : showChampsStats} onChange={setShowChampsStats} />
                                        </td>
                                        <td>
                                            <b>Show Champs Statistics on Announce in World and District Champs</b>
                                        </td>
                                    </tr>
                                    {selectedEvent?.value?.districtCode && <tr className={"statsSettings"}>
                                        <td>
                                            <Switch checked={showDistrictChampsStats === null ? false : showDistrictChampsStats} onChange={setShowDistrictChampsStats} />
                                        </td>
                                        <td>
                                            <b>Show District Champs Statistics on Announce in Playoffs outside of District Champs</b>
                                        </td>
                                    </tr>}
                                    <tr className={"statsSettings"}>
                                        <td>
                                            <Switch checked={showQualsStatsQuals === null ? true : showQualsStatsQuals} onChange={setShowQualsStatsQuals} />
                                        </td>
                                        <td>
                                            <b>Show Quals Statistics on Play-By-Play during Quals</b>
                                        </td>
                                    </tr>
                                    <tr className={"statsSettings"}>
                                        <td>
                                            <Switch checked={showQualsStats === null ? false : showQualsStats} onChange={setShowQualsStats} />
                                        </td>
                                        <td>
                                            <b>Show Quals Statistics on Play-By-Play during Playoffs</b>
                                        </td>
                                    </tr>
                                    <tr className={"statsSettings"}>
                                        <td>
                                            <Switch checked={highScoreMode === null ? false : highScoreMode} onChange={setHighScoreMode} />
                                        </td>
                                        <td>
                                            <b>Always show <b><i>event high score</i></b> on Announce and Play-By-Play</b>
                                        </td>
                                    </tr>
                                </>}
                                <tr onClick={() => { setShowUISettings(!showUISettings) }} className={"UISettings"} >
                                    <td style={{ fontSize: "1.25em" }} colSpan={2}>{showUISettings ? <CaretUpFill /> : <CaretDownFill />} <b>{showUISettings ? "Hide" : "Show"} User Interface Settings</b></td>
                                </tr>
                                {showUISettings && <><tr className={"UISettings"}>
                                    <td>
                                        <Switch checked={_.isNull(showInspection) || _.isUndefined(showInspection) ? false : showInspection} onChange={setShowInspection} />
                                    </td>
                                    <td>
                                        <b>Show Inspection/Alliance Selection reminder on Announce and Play-By-Play</b>
                                    </td>
                                </tr>
                                    <tr className={"UISettings"}>
                                        <td>
                                            <Switch checked={swapScreen === null ? false : swapScreen} onChange={setSwapScreen} />
                                        </td>
                                        <td>
                                            <b>Swap Play-By-Play Screen Orientation</b>
                                        </td>
                                    </tr>
                                    <tr className={"UISettings"}>
                                        <td>
                                            <Switch checked={reverseEmcee === null ? false : reverseEmcee} onChange={setReverseEmcee} />
                                        </td>
                                        <td>
                                            <b>Swap Emcee Screen Orientation</b>
                                        </td>
                                    </tr>
                                    <tr className={"UISettings"}>
                                        <td>
                                            <Switch checked={autoAdvance === null ? false : autoAdvance} onChange={setAutoAdvance} />
                                        </td>
                                        <td>
                                            <b>Automatically advance to the next match when loading the event <i style={{ "color": "red" }}>(Only affects when you load an event)</i></b>
                                        </td>
                                    </tr>
                                    <tr className={"UISettings"}>
                                        <td>
                                            <Switch checked={autoUpdate === null ? false : autoUpdate} onChange={setAutoUpdate} />
                                        </td>
                                        <td>
                                            <b>Automatically track event progress, refreshing every 15 seconds <i style={{ "color": "red" }}>(will advance matches on all screens)</i></b>
                                        </td>
                                    </tr>
                                    <tr className={"UISettings"}>
                                        <td>
                                            <Switch checked={(_.isNull(hidePracticeSchedule) || _.isUndefined(hidePracticeSchedule)) ? false : hidePracticeSchedule} onChange={setHidePracticeSchedule} />
                                        </td>
                                        <td>
                                            <b>Hide Practice Schedule before before Quals start</b>
                                        </td>
                                    </tr>
                                    <tr className={"UISettings"}>
                                        <td>
                                            <Switch checked={(_.isNull(useSwipe) || _.isUndefined(useSwipe)) ? false : useSwipe} onChange={setUseSwipe} />
                                        </td>
                                        <td>
                                            <b>Enable swipe gestures to go to next/previous match<i><br />NOTE: You will need to use two fingers to scroll up/down when using this feature</i></b>
                                        </td>
                                    </tr>
                                    <tr className={"UISettings"}>
                                        <td>
                                            <Switch checked={(_.isNull(usePullDownToUpdate) || _.isUndefined(usePullDownToUpdate)) ? false : usePullDownToUpdate} onChange={setUsePullDownToUpdate} disabled={!useSwipe} />
                                        </td>
                                        <td>
                                            <b>Enable pull down to update scores/ranks</b>
                                        </td>
                                    </tr>
                                    <tr className={"UISettings"}>
                                        <td colSpan={2}>
                                            <label><b>Set your time format</b><Select options={timeFormatMenu} value={timeFormat} onChange={setTimeFormat} /></label>
                                        </td>
                                    </tr>
                                </>}
                                <tr>
                                    <td>
                                        <Switch checked={adHocMode === null ? false : adHocMode} onChange={setAdHocMode} />
                                    </td>
                                    <td>
                                        <b>Enable Test Match Mode. If you enable this mode, you will need to enter team numbers on the Announce Screen. This will disable match navigation.</b>
                                    </td>
                                </tr>
                                {!ftcMode && <tr>
                                    <td>
                                        <Switch checked={useCheesyArena === null ? false : useCheesyArena} onChange={setUseCheesyArena} />
                                    </td>
                                    <td>
                                        <b>Use Cheesy Arena for match data. Please ensure that your device is on the same network as the Cheesy Arena field system.</b>
                                    </td>
                                </tr>}

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
                                        {isAuthenticated && <LogoutButton disabled={!isOnline} />}
                                        {!isAuthenticated && <LoginButton disabled={!isOnline} />}
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
                            {appUpdates.map((appUpdate, index) => {
                                return <Row key={`appUpdate-${index}`}><Col xs={3}><b>{appUpdate.date}</b></Col>
                                    <Col xs={9}>{appUpdate.message}</Col></Row>
                            })}
                        </Container>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleHistory}>Done</Button>
                    </Modal.Footer>
                </Modal>
                <Modal centered={true} show={manageAnnouncements} fullscreen onHide={() => { handleEventNotificationClose() }}>
                    <Modal.Header className={"allianceDecline"} closeVariant={"white"} closeButton>
                        <Modal.Title >Manage announcements for {selectedEvent?.label}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body key={"manageAnnouncements"}>
                        <Container fluid>
                            <Row>
                                <Col xs={12}>Each announcement must have an on time and an off time. You can also set an alert level for each announcement. Once you save, all users at {selectedEvent?.label} will see these announcements on their next refresh. You can delete, duplicate or add new announcements here.</Col>
                            </Row>
                            <Row>
                                <Col xs={4}><b>Timing</b></Col>
                                <Col xs={5}><b>Message (edit in the alert area)</b></Col>
                                <Col xs={2}><b>Variant</b></Col>
                                <Col xs={1}><Plus onClick={() => { handleEventNotification("add", user) }} size={30} /></Col>
                            </Row>
                            {eventMessageFormData && eventMessageFormData.map((message, index) => {
                                return <Row key={`eventMessage-${index}`} style={{ borderTop: "1px solid black", paddingTop: "5px", paddingBottom: "5px", marginTop: "5px" }}>
                                    <Col xs={4}>
                                        <InputGroup>
                                            <InputGroup.Text>On</InputGroup.Text>
                                            <Form.Control
                                                size="sm"
                                                type="datetime-local"
                                                value={moment(message?.onTime).format("YYYY-MM-DDTHH:mm")}
                                                onChange={(e) =>
                                                    handleEventNotification("onTime", index, e.target.value, user)
                                                }
                                            />
                                        </InputGroup>

                                        <InputGroup>
                                            <InputGroup.Text>Off</InputGroup.Text>
                                            <Form.Control
                                                size="sm"
                                                type="datetime-local"
                                                value={moment(message?.expiry).format("YYYY-MM-DDTHH:mm")}
                                                onChange={(e) =>
                                                    handleEventNotification("expiry", index, e.target.value, user)
                                                }
                                            />
                                        </InputGroup>
                                    </Col>
                                    <Col xs={5}>
                                        <Alert variant={message?.variant}>
                                            <Contenteditable
                                                placeholder="Enter your announcement here"
                                                onChange={(e) =>
                                                    handleEventNotification("message", index, e, user)
                                                }
                                                value={message?.message} />
                                        </Alert>
                                    </Col>
                                    <Col xs={2}>

                                        <Form.Select
                                            size="sm"
                                            value={message?.variant}
                                            onChange={(e) => handleEventNotification("variant", index, e.target.value, user)}
                                        >
                                            <option value={"info"}>Info</option>
                                            <option value={"success"}>All OK</option>
                                            <option value={"warning"}>Warning</option>
                                            <option value={"danger"}>Urgent</option>
                                        </Form.Select>
                                    </Col>
                                    <Col xs={1}>
                                        <InputGroup >
                                            <Trash size={20} style={{ color: "red" }} onClick={() => handleEventNotification("delete", index)} />

                                            <Copy size={20} onClick={() => handleEventNotification("duplicate", index, user)} />
                                        </InputGroup>
                                    </Col>
                                </Row>
                            })}
                            {eventMessageFormData && eventMessageFormData.length === 0 && <Row>
                                <Col xs={12}><Alert variant="warning">No announcements have been created for this event. You can add one by clicking the plus sign <Plus size={25} /> above.</Alert></Col>
                            </Row>}
                        </Container>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" disabled={JSON.stringify(eventMessage) === JSON.stringify(eventMessageFormData)} onClick={() => { handleEventNotificationSave() }}>Save Changes</Button>
                        <Button variant="secondary" onClick={() => { handleEventNotificationClose() }}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </div>
            }

        </Container>

    )
}

export default SetupPage;