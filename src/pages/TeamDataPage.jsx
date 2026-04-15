import { Alert, Button, Container, Form, Modal, Table } from "react-bootstrap";
import { SortAlphaDown, SortAlphaUp, SortNumericDown, SortNumericUp } from 'react-bootstrap-icons';
import { orderBy, find } from "lodash";
import { rankHighlight } from "../components/HelperFunctions";
import { useState, useEffect, useMemo } from "react";
import moment from "moment";
import _ from "lodash";
import { toast } from "react-toastify";
import { apiBaseUrl } from "../contextProviders/AuthClientContext";
import { useOnlineStatus } from "../contextProviders/OnlineContext";
import { utils, read, write, writeFile } from "xlsx";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import PizZipUtils from "pizzip/utils/index.js";
import { saveAs } from "file-saver";
import { useHotkeysContext } from "react-hotkeys-hook";
import TeamTimer from "components/TeamTimer";
import TeamEditModal from "components/TeamEditModal";
import TeamHistoryModal from "components/TeamHistoryModal";
import { useInterval } from "react-interval-hook";
import useScrollPosition from "../hooks/useScrollPosition";
import { useSettings } from "../contexts/SettingsContext";
import { useEventData } from "contexts/EventDataContext";
import { useEventActions } from "contexts/EventActionsContext";

/** Blue banner stats are a nested object; SheetJS leaves those cells blank unless stringified. */
const BLUE_BANNER_EXPORT_ROWS = [
    ["regionalWins", "regionalWinsYears", "Regional Win", "Regional Wins"],
    ["regionalChairmans", "regionalChairmansYears", "Regional Chairman's Award", "Regional Chairman's Awards"],
    ["regionalImpact", "regionalImpactYears", "Regional Impact Award", "Regional Impact Awards"],
    ["regionalWoodieFlowers", "regionalWoodieFlowersYears", "Regional Woodie Flowers Finalist", "Regional Woodie Flowers Finalists"],
    ["districtWins", "districtWinsYears", "District Win", "District Wins"],
    ["districtChairmans", "districtChairmansYears", "District Chairman's Award", "District Chairman's Awards"],
    ["districtImpact", "districtImpactYears", "District Impact Award", "District Impact Awards"],
    ["districtWoodieFlowers", "districtWoodieFlowersYears", "District Woodie Flowers Finalist", "District Woodie Flowers Finalists"],
    ["districtDivisionWins", "districtDivisionWinsYears", "District Championship Division Win", "District Championship Division Wins"],
    ["districtDivisionChairmans", "districtDivisionChairmansYears", "District Championship Division Chairman's Award", "District Championship Division Chairman's Awards"],
    ["districtDivisionImpact", "districtDivisionImpactYears", "District Championship Division Impact Award", "District Championship Division Impact Awards"],
    ["districtChampionshipWins", "districtChampionshipWinsYears", "District Championship Win", "District Championship Wins"],
    ["districtChampionshipChairmans", "districtChampionshipChairmansYears", "District Championship Chairman's Award", "District Championship Chairman's Awards"],
    ["districtChampionshipImpact", "districtChampionshipImpactYears", "District Championship Impact Award", "District Championship Impact Awards"],
    ["districtChampionshipWoodieFlowers", "districtChampionshipWoodieFlowersYears", "District Championship Woodie Flowers Finalist", "District Championship Woodie Flowers Finalists"],
    ["championshipDivisionWins", "championshipDivisionWinsYears", "World Championship Division Win", "World Championship Division Wins"],
    ["championshipDivisionChairmans", "championshipDivisionChairmansYears", "World Championship Division Chairman's Award", "World Championship Division Chairman's Awards"],
    ["championshipDivisionImpact", "championshipDivisionImpactYears", "World Championship Division Impact Award", "World Championship Division Impact Awards"],
    ["einsteinWins", "einsteinWinsYears", "Einstein Win", "Einstein Wins"],
    ["einsteinChairmans", "einsteinChairmansYears", "Einstein Chairman's Award", "Einstein Chairman's Awards"],
    ["einsteinImpact", "einsteinImpactYears", "Einstein Impact Award", "Einstein Impact Awards"],
    ["einsteinChairmansFinalist", "einsteinChairmansFinalistYears", "Einstein Chairman's Award Finalist", "Einstein Chairman's Award Finalists"],
    ["einsteinImpactFinalist", "einsteinImpactFinalistYears", "Einstein Impact Award Finalist", "Einstein Impact Award Finalists"],
    ["championshipWoodieFlowers", "championshipWoodieFlowersYears", "World Championship Woodie Flowers Award", "World Championship Woodie Flowers Awards"],
    ["festivalWins", "festivalWinsYears", "Festival of Champions Win", "Festival of Champions Wins"],
];

function formatBlueBannersForExport(bb) {
    if (!bb || typeof bb !== "object" || !(Number(bb.blueBanners) > 0)) {
        return "";
    }
    const parts = [`${bb.blueBanners} Blue Banner${bb.blueBanners > 1 ? "s" : ""}`];
    BLUE_BANNER_EXPORT_ROWS.forEach(([countKey, yearsKey, singular, plural]) => {
        const c = Number(bb[countKey]) || 0;
        if (c <= 0) return;
        const years = bb[yearsKey];
        const yStr = Array.isArray(years) && years.length
            ? ` (${_.uniq(years).slice().sort((a, b) => a - b).join(", ")})`
            : "";
        parts.push(`${c} ${c > 1 ? plural : singular}${yStr}`);
    });
    return parts.join("; ");
}

function TeamDataPage({
  teamSort,
  setTeamSort,
  setCommunityUpdates,
  lastVisit,
  setLastVisit,
  putTeamData,
  localUpdates,
  setLocalUpdates,
  originalAndSustaining,
  user,
  isAuthenticated,
  getTeamHistory,
}) {
  const { selectedEvent, selectedYear, teamList, rankings, communityUpdates, allianceCount, qualSchedule, playoffSchedule, eventLabel, ftcMode, remapNumberToString } = useEventData();
  const { getCommunityUpdates, getTeamList } = useEventActions();
    const { monthsWarning, timeFormat, useScrollMemory } = useSettings();
    const [currentTime, setCurrentTime] = useState(moment());
    const [clockRunning, setClockRunning] = useState(true);
    const { disableScope, enableScope } = useHotkeysContext();
    const isOnline = useOnlineStatus();

    // Remember scroll position for Teams page
    useScrollPosition('teams', true, false, useScrollMemory);

    /**
     * Display the delay on the Announce Screen if we have a schedule
     * @param {moment.Moment} updateTime
     */
    function updateClass(updateTime) {
        var timeDifference = 0;
        var updateDelay = "";
        timeDifference = moment(currentTime).diff(updateTime, "hours");
        if (timeDifference < 48) {
            updateDelay = "alert-success";
        } else if ((timeDifference >= 48) && (timeDifference < 72)) {
            updateDelay = "alert-warning";
        } else if (timeDifference >= 72) {
            updateDelay = "alert-danger";
        }
        return updateDelay
    }

    const [show, setShow] = useState(false);
    const [showDownload, setShowDownload] = useState(false);
    const [updateTeam, setUpdateTeam] = useState(null);
    const [gaName, setGaName] = useState("");
    const [showHistory, setShowHistory] = useState(false);
    const [teamHistory, setTeamHistory] = useState([]);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showSaveToCloud, setShowSaveToCloud] = useState(false);
    const [teamsToReset, setTeamsToReset] = useState([]);
    const [resetNotes, setResetNotes] = useState(false);

    const { start, stop } = useInterval(
        () => {
            // console.log("clock tick...")
            setCurrentTime(moment());
        },
        1000,
        {
            autoStart: true,
            immediate: false,
            selfCorrecting: true,
            onFinish: () => {
                console.log('Event refresh stopped at Match Clock level.');
            },
        }
    )

    // Automatically updates the curent time. Checks every second if active.
    useEffect(() => {
        if (teamList?.teams?.length > 0 && clockRunning) {
            start()
        } else { stop() }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [teamList?.teams?.length, clockRunning]);

    const handleClose = () => {
        setUpdateTeam(null);
        setShow(false);
        enableScope('tabNavigation');
    }

    const handleTrack = async () => {
        var visits = _.cloneDeep(lastVisit);
        visits[`${updateTeam.teamNumber}`] = moment().format();
        await setLastVisit(visits);
        setUpdateTeam(null);
        setShow(false);
        enableScope('tabNavigation');
    }

    const handleCloseDownload = () => {
        setShowDownload(false);
        setGaName("");
        enableScope('tabNavigation');
    }

    /**
     * Stores the team updates for a specific team. If we are unable to save to gatool Cloud, it will store the update locally
     * for update later.
     * @param {string} mode - determines whether to send the update to gatool Cloud. "update" = send to cloud
     * @param {*} e - the inbound event from clicking the button.
     */
    const handleSubmit = async (mode, formValue, e) => {
        var visits = _.cloneDeep(lastVisit);
        visits[`${updateTeam.teamNumber}`] = moment().format();
        var communityUpdatesTemp = _.cloneDeep(communityUpdates);
        var update = _.filter(communityUpdatesTemp, { "teamNumber": updateTeam.teamNumber })[0];
        if (!update) {
            update = {};
            update.teamNumber = updateTeam.teamNumber;
        }
        if (!communityUpdatesTemp) { communityUpdatesTemp = [{ "teamNumber": updateTeam.teamNumber }]; }
        update.updates = formValue;
        communityUpdatesTemp[_.findIndex(communityUpdatesTemp, { "teamNumber": updateTeam.teamNumber })] = update;
        setCommunityUpdates(communityUpdatesTemp);

        var localUpdatesTemp = _.cloneDeep(localUpdates);

        if (mode === "update") {
            var resp = []
            resp.push(putTeamData(updateTeam.teamNumber, update.updates));
            Promise.all(resp).then(async (response) => {
                if (response[0].status !== 204) {
                    // Update failed - save locally
                    var failedItemIndex = _.findIndex(localUpdatesTemp, { "teamNumber": updateTeam.teamNumber });
                    if (failedItemIndex >= 0) {
                        localUpdatesTemp.splice(failedItemIndex, 1);
                    }
                    localUpdatesTemp.push({ "teamNumber": updateTeam.teamNumber, "update": update.updates });
                    await setLocalUpdates(localUpdatesTemp);

                    var errorText = `Your update for team ${updateTeam.teamNumber} was not successful. We have saved the change locally, and you can send it later from here or the Settings page.`;
                    toast.error(errorText);
                } else {
                    // Update succeeded - remove from local updates
                    var successItemIndex = _.findIndex(localUpdatesTemp, { "teamNumber": updateTeam.teamNumber });
                    if (successItemIndex >= 0) {
                        localUpdatesTemp.splice(successItemIndex, 1);
                    }
                    await setLocalUpdates(localUpdatesTemp);
                    // Refresh community updates from server to show the latest data
                    // The local update is already in communityUpdates, so it will show immediately
                    // Refreshing ensures we have the authoritative version from the server
                    getCommunityUpdates(false, null).catch((err) => {
                        console.error('Error refreshing community updates:', err);
                        // If refresh fails, the local update in communityUpdates will still be visible
                    });
                    toast.success(`Your update for team ${updateTeam.teamNumber} was successful. Thank you for helping keep the team data current.`)
                }
            }).catch(async (error) => {
                // Handle network errors or other failures - save locally
                var errorItemIndex = _.findIndex(localUpdatesTemp, { "teamNumber": updateTeam.teamNumber });
                if (errorItemIndex >= 0) {
                    localUpdatesTemp.splice(errorItemIndex, 1);
                }
                localUpdatesTemp.push({ "teamNumber": updateTeam.teamNumber, "update": update.updates });
                await setLocalUpdates(localUpdatesTemp);

                var errorText = `Your update for team ${updateTeam.teamNumber} was not successful. We have saved the change locally, and you can send it later from here or the Settings page.`;
                toast.error(errorText);
                console.error('Error updating team data:', error);
            });

        } else {
            var itemExists = _.findIndex(localUpdatesTemp, { "teamNumber": updateTeam.teamNumber });
            if (itemExists >= 0) {
                localUpdatesTemp.splice(itemExists, 1);
            }
            localUpdatesTemp.push({ "teamNumber": updateTeam.teamNumber, "update": update.updates });
            toast.success(`We have stored your update for team ${updateTeam.teamNumber}. Remember that this update is only visible to you until you save it to gatool Cloud.`)
            setLocalUpdates(localUpdatesTemp);
        }

        await setLastVisit(visits);
        setUpdateTeam(null);
        setShow(false);
        enableScope('tabNavigation');
        setClockRunning(true);
    }

    const handleRestoreData = async (data) => {
        console.log(data);
        var resp = await putTeamData(data.team.teamNumber, data.update);
        if (resp.status !== 204) {
            var errorText = `Your update for team ${data.team.teamNumber} was not successful.`;
            toast.error(errorText);
            throw new Error(errorText);
        } else {
            toast.success(`You restored data for team ${data.team.teamNumber}.`);
        }
        handleCloseHistory();
        handleClose();
        await getCommunityUpdates(false, null);
    }



    /**
     * Opens the team data screen so that a user can view and edit the team details
     * @param {object} team - The team to display
     * @param {*} e  - the inbound event from clicking the button.
     */
    const handleShow = (team, e) => {
        if (isAuthenticated && user["https://gatool.org/roles"] && user["https://gatool.org/roles"].indexOf("user") >= 0) {
            setUpdateTeam(team);
            setShow(true);
            disableScope('tabNavigation');
            setClockRunning(false);
        }
    }

    const handleHistory = async (team, e) => {
        if (isAuthenticated && user["https://gatool.org/roles"] && user["https://gatool.org/roles"].indexOf("user") >= 0) {
            var history = await getTeamHistory(team.teamNumber);
            setShowHistory(true);
            setTeamHistory(_.orderBy(history, ['modifiedDate'], ['desc']));
            disableScope('tabNavigation');
        }
    }

    const handleCloseHistory = () => {
        setShowHistory(false);
        setTeamHistory(null);
        enableScope('tabNavigation');
    }

    const clearVisits = (single, e) => {
        if (single) {
            var visits = _.cloneDeep(lastVisit);
            delete visits[`${updateTeam.teamNumber}`];
            setLastVisit(visits);
        } else {
            setLastVisit({});
        }

        setUpdateTeam(null);
        setShow(false);
        enableScope('tabNavigation');
    }

    const updateGaForm = (value) => {
        setGaName(value);
    }



    function updateHighlight(update) {
        var style = {
            backgroundColor: ""
        }
        if (update) {
            style.backgroundColor = "rgb(195, 244, 199)";
            style.margin = "0px";
        }
        return style;
    }

    function updateHighlightClass(update) {
        return update ? "gatool-teamdata-local-edit" : "";
    }


    // The following section emits an Excel doc with two sheets:
    //   Team Table contains details about the teams at the event, including community updates;
    //   Schedule contains the schedule details at the time of export.
    function exportXLSX() {
        var data = [];
        var data2 = [];
        var record = {};
        var keys = [];
        var workbook = utils.book_new();
        var awards = [];
        var awardsKeys = [];

        //Add the team table to the worksheet
        data = teamListExtended.map((item) => {
            record = _.cloneDeep(item);
            awards = record.awards || {};
            record.awards = [];
            delete record.hallOfFame;
            awardsKeys = Object.keys(awards)
            awardsKeys.forEach((key) => {
                awards[key].awards.forEach((award) => {
                    record.awards.push(`${award.year} ${award.eventName}: ${award.name}${award.person ? `: ${award.person}` : ""}`)
                })
            })
            record.awardList = _.join(record.awards, "; ");
            record = _.merge(record, record.updates);
            delete record.updates;
            delete record.topSponsorsArray;
            delete record.awards;
            delete record.source;
            record.blueBanners = formatBlueBannersForExport(record.blueBanners);
            return (record);
        })

        // @ts-ignore
        var ws = utils.json_to_sheet(data, { cellHTML: "true" });
        utils.book_append_sheet(workbook, ws, "Team Table");

        //Add the Schedule to the worksheet
        var schedule = qualSchedule?.schedule?.schedule || qualSchedule?.schedule || [];
        if (playoffSchedule?.schedule?.length > 0 || playoffSchedule?.schedule?.length > 0) {
            schedule = _.concat(qualSchedule?.schedule || qualSchedule?.schedule?.schedule, playoffSchedule?.schedule?.schedule || playoffSchedule?.schedule);
        }

        schedule.forEach((match) => {
            record = {};
            keys = Object.keys(match);
            keys.forEach((key) => {
                if (key === "teams") {
                    match?.teams.forEach((team) => {
                        record[team.station] = team.teamNumber
                    })
                } else if (key === "winner") {
                    record.winner = match?.winner?.winner;
                    record.tieWinner = match?.winner?.tieWinner;
                    record.tieBreakerLevel = match?.winner?.level;
                } else if (key === 'blueRP') {
                    Object.keys(match?.blueRP).forEach((key) => {
                        record[`blueRP_${key}`] = match?.blueRP[key];
                    })
                } else if (key === 'redRP') {
                    Object.keys(match?.redRP).forEach((key) => {
                        record[`redRP_${key}`] = match?.blueRP[key];
                    })
                } else if (key === 'scores') {
                    Object.keys(match?.scores).forEach((key) => {
                        if (key === "alliances") {
                            match.scores.alliances.forEach((allianceScore) => {
                                Object.keys(allianceScore).forEach((allianceKey) => {
                                    if (allianceKey !== "alliance") {
                                        if (typeof allianceScore[allianceKey] !== "object") {
                                            record[`${allianceScore.alliance}_${allianceKey}`] = allianceScore[allianceKey];
                                        }
                                    }
                                })
                            })
                        } else {
                            record[key] = match?.scores[key];
                        }
                    })
                } else {
                    record[key] = match[key];
                }
            })
            data2.push(record);
        })

        // @ts-ignore
        ws = utils.json_to_sheet(data2, { cellHTML: "true" });
        utils.book_append_sheet(workbook, ws, "Schedule");

        write(workbook, { bookType: "xlsx", bookSST: true, type: 'base64' });
        writeFile(workbook, "gatoolExport_" + selectedYear.value + (eventLabel || selectedEvent?.label) + moment().format('MMDDYYYY_HHmmss') + ".xlsx");

    }

    function downloadTeamInfoSheets() {
        setShowDownload(true);
        disableScope('tabNavigation');
    }

    function handleSubmitDownload(e) {
        //toDo make this work.
        setShowDownload(false);
        generateDocx(gaName);
        setGaName("");
        enableScope('tabNavigation');
    }

    // The following section creates merged Word docs.
    // It is used in conjunction with the team list to create team info sheets.
    function loadFile(url, callback) {
        PizZipUtils.getBinaryContent(url, callback);
    }
    function generateDocx(gameAnnouncer) {
        loadFile(
            ftcMode ? "images/ftc_team_information_sheets_merge_2025.docx" : "images/frc_team_information_sheets_merge_2025.docx",
            function (error, content) {
                if (error) {
                    var errorText = "Something went wrong loading the template. Please try again."
                    console.log(error)
                    throw new Error(errorText);
                }
                var zip = new PizZip(content);
                var doc = new Docxtemplater(zip, {
                    paragraphLoop: true,
                    linebreaks: true
                });

                var data = [];
                var record = {};
                var gameAnnouncerFixed = gameAnnouncer.trim();

                if (gameAnnouncer.split(",").length > 1) {
                    var gaTemp = _.map(gameAnnouncer.split(","), _.trim);
                    if (gaTemp.length > 2) {
                        var gaLast = gaTemp.pop();
                        gameAnnouncerFixed = `${gaTemp.join(", ")} and ${gaLast}`
                    } else if (gaTemp.length === 2) {
                        gameAnnouncerFixed = gaTemp.join(" and ");
                    }
                }

                //Create record list from all of the team data
                data = teamListExtended.map((team, index) => {
                    record = {};
                    record.tn = team.teamNumber;
                    record.year = selectedYear.value;
                    record.nameShort = team.nameShortLocal || team.nameShort;
                    record.organization = team.updates?.organizationLocal || team.organization;
                    record.robotName = team.updates?.robotNameLocal || team.robotName;
                    record.cityState = team.updates?.cityStateLocal || `${team.city}, ${team.stateProv}${team.country !== "USA" ? `, ${team.country}` : ""}`;
                    record.topSponsors = team.updates?.topSponsorsLocal || team.topSponsors;
                    record.topSponsor = team.updates?.topSponsorLocal || team.topSponsor;
                    record.teamYearsNoCompete = team.updates?.teamYearsNoCompeteLocal || "";
                    record.teamMotto = team.updates?.teamMottoLocal || "";
                    record.rookieYear = team?.rookieYear || "";
                    record.eventName = eventLabel || selectedEvent?.label;
                    record.sayNumber = team.updates?.sayNumber || "";
                    //let tmp = document.createElement("DIV");
                    //tmp.innerHTML = team.teamNotes;
                    //record.teamNotes = tmp.textContent || tmp.innerText || "";
                    // eslint-disable-next-line
                    record.teamNotes = team.updates?.teamNotes.replace("<br>", "\n").replace("<\div>", "<\div>\n").replace(/&amp;/g, "&").replace(/&nbsp;/g, ' ').replace(/(<([^>]+)>)/gi, "") || "";
                    record.gaName = gameAnnouncerFixed || false;
                    record.gaNames = gameAnnouncer.split(",").length > 1 || false;
                    if (index < teamListExtended.length - 1) {
                        record.lastTeam = false;
                    } else {
                        record.lastTeam = true;
                    }
                    return (record);
                })


                // Render the document (Replace {first_name} by John, {last_name} by Doe, ...)
                doc.render({
                    teams: data
                });

                var out = doc.getZip().generate({
                    type: "blob",
                    mimeType:
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    // compression: DEFLATE adds a compression step.
                    // For a 50MB output document, expect 500ms additional CPU time
                    compression: "DEFLATE",
                });
                // Output the document using Data-URI
                saveAs(out, `${eventLabel || selectedEvent?.label} ${selectedYear.value} Team Info Sheets.docx`);
            }
        );
    }

    // This function clicks the hidden file upload button
    function clickRestoreBackup() {
        document.getElementById("BackupFiles").click();
    }

    // This function clears the file input by removing and recreating the file input button
    function clearFileInput(id) {
        var oldInput = document.getElementById(id);
        var newInput = document.createElement("input");
        newInput.type = "file";
        newInput.id = oldInput.id;
        // @ts-ignore
        newInput.name = oldInput.name;
        newInput.className = oldInput.className;
        newInput.style.cssText = oldInput.style.cssText;
        oldInput.parentNode.replaceChild(newInput, oldInput)
    }

    // This function reads an uploaded Excel file and updates team data based on the
    // Excel file's content. The file must have been previously exported from gatool.
    // It will only update data that Game Announcers control in the Team Data page.
    function handleRestoreBackup(e) {
        var files = e.target.files;
        var i, f, currentUpdate, newUpdate;
        for (i = 0; i !== files.length; ++i) {
            f = files[i];
            var reader = new FileReader();
            // eslint-disable-next-line
            reader.onload = async function (e) {
                var communityUpdatesTemp = _.cloneDeep(communityUpdates);
                // @ts-ignore
                var data = new Uint8Array(e.target.result);
                var workbook;
                var itemExists;
                var localUpdatesTemp = _.cloneDeep(localUpdates);
                workbook = read(data, { type: 'array' });
                var worksheet = workbook.Sheets[workbook.SheetNames[0]];
                var teams = utils.sheet_to_json(worksheet);
                var update = {};
                var keys = [];
                if (!_.isUndefined(teams[0].teamNumber)) {
                    teams.forEach((team) => {
                        update = {}
                        keys = Object.keys(team);
                        update.teamNumber = team.teamNumber;
                        update.updates = {};
                        keys.forEach((key) => {
                            if (key.includes("Local")) {
                                update.updates[key] = team[key];
                                update.updates.lastUpdate = moment().format();
                            }
                        })
                        if (!_.isUndefined(team["showRobotName"])) {
                            update.updates["showRobotName"] = team["showRobotName"];
                            update.updates.lastUpdate = moment().format();
                        };
                        if (!_.isUndefined(team["teamNotes"])) {
                            update.updates["teamNotes"] = team["teamNotes"];
                            update.updates.lastUpdate = moment().format();
                        };
                        if (!_.isUndefined(team["sayNumber"])) {
                            update.updates["sayNumber"] = team["sayNumber"];
                            update.updates.lastUpdate = moment().format();
                        };
                        newUpdate = _.cloneDeep(update);
                        currentUpdate = _.cloneDeep(communityUpdates[_.findIndex(communityUpdatesTemp, { "teamNumber": team.teamNumber })]);
                        if (newUpdate?.updates) {
                            delete newUpdate.updates.lastUpdate;
                            delete newUpdate.updates.source;
                        }
                        if (currentUpdate?.updates) {
                            delete currentUpdate.updates.lastUpdate;
                            delete currentUpdate.updates.source;
                        }

                        if (!_.isEqual(newUpdate, currentUpdate) && currentUpdate) {
                            itemExists = _.findIndex(localUpdatesTemp, { "teamNumber": update?.teamNumber });
                            if (itemExists >= 0) {
                                localUpdatesTemp.splice(itemExists, 1);
                            }
                            localUpdatesTemp.push({ "teamNumber": update.teamNumber, "update": update.updates });
                        }
                        communityUpdatesTemp[_.findIndex(communityUpdatesTemp, { "teamNumber": team?.teamNumber })] = update;

                    })
                    if (localUpdatesTemp?.length > 0) {
                        await setLocalUpdates(localUpdatesTemp);
                    }
                    await setCommunityUpdates(communityUpdatesTemp);
                    toast.success(`Your have successfully loaded updates for this event from Excel. Please check each team's details to ensure your changes were recorded properly. ${localUpdatesTemp?.length > 0 ? "Any inbound changes are stored as Local Updates, which you can push to gatool Cloud on the Setup page." : ""}`)
                    clearFileInput("BackupFiles");
                    document.getElementById("BackupFiles").addEventListener('change', handleRestoreBackup);
                } else {
                    toast.error(`Your Excel file is malformed. Please download the Teams Table to Excel, compare your headers, and try again.`);
                    clearFileInput("BackupFiles");
                    document.getElementById("BackupFiles").addEventListener('change', handleRestoreBackup);
                }

            };
            reader.readAsArrayBuffer(f);
        }
    }

    const handleGetTeamList = () => {
        getTeamList();
    }

    /**
     * Gets the season start date based on the program type
     * @returns {moment.Moment} The season start date
     */
    const getSeasonStartDate = () => {
        const year = parseInt(selectedYear?.value || moment().year());
        // FRC: January 1 of the selected year
        // FTC: September 1 of the selected year
        if (ftcMode) {
            return moment(`${year}-09-01`, 'YYYY-MM-DD');
        } else {
            return moment(`${year}-01-01`, 'YYYY-MM-DD');
        }
    }

    /**
     * Finds teams that have no updates or updates before the season start
     * @returns {Array} Array of team numbers that should be reset
     */
    const findTeamsToReset = () => {
        const seasonStart = getSeasonStartDate();
        const teamsToResetList = [];

        // Check all teams in the team list
        if (teamList?.teams) {
            teamList.teams.forEach((team) => {
                // Check if team has updates in communityUpdates or localUpdates
                const communityUpdate = find(communityUpdates, { "teamNumber": team.teamNumber });
                const localUpdate = _.find(localUpdates, { "teamNumber": team.teamNumber });

                // Get the update object (local takes precedence)
                const update = localUpdate ? localUpdate.update : communityUpdate?.updates;

                // Check if team has sponsor or robot name updates
                // Check for non-empty values (not just existence, as empty strings should be ignored)
                const hasSponsorOrRobotUpdate = update && (
                    (update.topSponsorsLocal && update.topSponsorsLocal.trim() !== "") ||
                    (update.topSponsorLocal && update.topSponsorLocal.trim() !== "") ||
                    (update.robotNameLocal && update.robotNameLocal.trim() !== "")
                );

                if (hasSponsorOrRobotUpdate) {
                    // Check if the lastUpdate is before season start or doesn't exist
                    const lastUpdate = update.lastUpdate ? moment(update.lastUpdate) : null;

                    // Include team if:
                    // 1. No lastUpdate timestamp exists, OR
                    // 2. lastUpdate is before season start
                    if (!lastUpdate || lastUpdate.isBefore(seasonStart)) {
                        teamsToResetList.push(team.teamNumber);
                    }
                }
            });
        }

        return teamsToResetList;
    }

    /**
     * Handles the reset button click - finds teams to reset and shows confirmation dialog
     */
    const handleResetClick = () => {
        const teamsToResetList = findTeamsToReset();
        setTeamsToReset(teamsToResetList);
        setResetNotes(false); // Reset the checkbox to default
        setShowResetConfirm(true);
        disableScope('tabNavigation');
    }

    /**
     * Handles the confirmation to proceed with reset
     */
    const handleResetProceed = async () => {
        setShowResetConfirm(false);

        // Clone local updates and remove sponsor and robot name fields
        var localUpdatesTemp = _.cloneDeep(localUpdates);
        // Don't modify communityUpdates - it represents server state
        // We'll only modify localUpdates, which take precedence when displaying

        // Only process teams that are in the teamsToReset list
        const teamsToResetSet = new Set(teamsToReset);

        // Process local updates - remove sponsor/robot name fields (and notes if option selected) for teams in the reset list
        localUpdatesTemp = localUpdatesTemp.map((localUpdate) => {
            if (teamsToResetSet.has(localUpdate.teamNumber) && localUpdate.update) {
                delete localUpdate.update.topSponsorsLocal;
                delete localUpdate.update.topSponsorLocal;
                delete localUpdate.update.robotNameLocal;
                if (resetNotes) {
                    delete localUpdate.update.teamNotesLocal;
                    delete localUpdate.update.teamNotes;
                }
                localUpdate.update.lastUpdate = moment().format();
            }
            return localUpdate;
        });

        // For teams that are in communityUpdates but not in localUpdates,
        // we need to create local updates that override the community updates
        // by explicitly removing the sponsor/robot name fields
        teamsToReset.forEach((teamNumber) => {
            const existsInLocalUpdates = _.findIndex(localUpdatesTemp, { "teamNumber": teamNumber }) >= 0;

            if (!existsInLocalUpdates) {
                // Get the community update for this team
                const communityUpdate = find(communityUpdates, { "teamNumber": teamNumber });

                if (communityUpdate && communityUpdate.updates) {
                    // Create a local update that removes the sponsor/robot name fields
                    // Start with a copy of the community update
                    const resetUpdate = _.cloneDeep(communityUpdate.updates);

                    // Remove sponsor/robot name fields
                    delete resetUpdate.topSponsorsLocal;
                    delete resetUpdate.topSponsorLocal;
                    delete resetUpdate.robotNameLocal;
                    if (resetNotes) {
                        delete resetUpdate.teamNotesLocal;
                        delete resetUpdate.teamNotes;
                    }
                    resetUpdate.lastUpdate = moment().format();

                    // Add to localUpdates so Setup page can detect it
                    localUpdatesTemp.push({
                        teamNumber: teamNumber,
                        update: resetUpdate
                    });
                } else {
                    // Team has no updates at all, but was in teamsToReset
                    // This shouldn't happen, but create a minimal update entry
                    localUpdatesTemp.push({
                        teamNumber: teamNumber,
                        update: {
                            lastUpdate: moment().format()
                        }
                    });
                }
            }
        });

        // Save changes locally (don't modify communityUpdates)
        await setLocalUpdates(localUpdatesTemp);

        enableScope('tabNavigation');

        // Show second dialog asking about saving to cloud
        setShowSaveToCloud(true);
        disableScope('tabNavigation');
    }

    /**
     * Handles canceling the reset
     */
    const handleResetCancel = () => {
        setShowResetConfirm(false);
        enableScope('tabNavigation');
    }

    /**
     * Handles saving changes to gatool Cloud
     */
    const handleSaveToCloud = async () => {
        setShowSaveToCloud(false);
        enableScope('tabNavigation');

        var localUpdatesTemp = _.cloneDeep(localUpdates);
        var communityUpdatesTemp = _.cloneDeep(communityUpdates);
        var errors = [];
        var successes = [];

        // Only push updates for teams that were reset
        // First, get all updates (local and community) for reset teams
        const updatesToPush = [];

        teamsToReset.forEach((teamNumber) => {
            const localUpdate = _.find(localUpdatesTemp, { "teamNumber": teamNumber });
            const communityUpdate = find(communityUpdatesTemp, { "teamNumber": teamNumber });

            // Use local update if it exists, otherwise use community update
            const update = localUpdate ? localUpdate.update : communityUpdate?.updates;

            if (update) {
                updatesToPush.push({
                    teamNumber: teamNumber,
                    update: update
                });
            }
        });

        // Push each update to gatool Cloud
        for (const updateData of updatesToPush) {
            try {
                var response = await putTeamData(updateData.teamNumber, updateData.update);
                if (response.status !== 204) {
                    errors.push(updateData.teamNumber);
                } else {
                    successes.push(updateData.teamNumber);
                    // Remove from localUpdates if successfully saved
                    var itemExists = _.findIndex(localUpdatesTemp, { "teamNumber": updateData.teamNumber });
                    if (itemExists >= 0) {
                        localUpdatesTemp.splice(itemExists, 1);
                    }
                }
            } catch (error) {
                errors.push(updateData.teamNumber);
            }
        }

        await setLocalUpdates(localUpdatesTemp);

        if (successes.length > 0) {
            toast.success(`Successfully saved changes to gatool Cloud for ${successes.length} team(s).`);
        }
        if (errors.length > 0) {
            toast.error(`Failed to save changes for ${errors.length} team(s). Changes are still saved locally.`);
        }

        // Refresh community updates
        await getCommunityUpdates(false, null);
    }

    /**
     * Handles canceling the save to cloud dialog
     */
    const handleSaveToCloudCancel = () => {
        setShowSaveToCloud(false);
        enableScope('tabNavigation');
        toast.success("Changes have been saved locally. You can upload them to gatool Cloud later from the Setup page.");
    }


    // Memoize teamListExtended to avoid recalculating on every render
    const teamListExtended = useMemo(() => {
        if (!teamList?.teams) return [];

        let extended = teamList.teams.map((teamRow) => {
            const teamRowCopy = { ...teamRow };
            // Calculate rank inline to avoid dependency on getTeamRank function
            var team = find(rankings?.ranks, { "teamNumber": remapNumberToString(teamRowCopy?.teamNumber) });
            teamRowCopy.rank = team?.rank;
            teamRowCopy.citySort = teamRowCopy?.country + teamRowCopy?.stateProv + teamRowCopy?.city;
            var update = find(communityUpdates, { "teamNumber": teamRowCopy.teamNumber });
            var localUpdate = _.find(localUpdates, { "teamNumber": teamRowCopy?.teamNumber });
            teamRowCopy.updates = localUpdate ? localUpdate.update : update?.updates;
            return teamRowCopy;
        });

        if (teamSort.charAt(0) === "-") {
            extended = orderBy(extended, teamSort.slice(1), 'desc');
        } else {
            extended = orderBy(extended, teamSort, 'asc');
        }

        return extended;
    }, [teamList?.teams, communityUpdates, localUpdates, teamSort, rankings?.ranks, remapNumberToString]);

    return (
        <Container fluid>
            {!selectedEvent && <div>
                <Alert variant="warning" className="gatool-awaiting-message">You need to select an event before you can see anything here.</Alert>
            </div>}
            {selectedEvent && (!teamList || teamList?.teams.length === 0) && <div>
                <Alert variant="warning" className="gatool-awaiting-message" onClick={(e) => { handleGetTeamList() }}><div><img src="loadingIcon.gif" alt="Loading data..." /></div>
                    <div>Awaiting team data for {eventLabel || selectedEvent?.label}</div>
                    {selectedEvent?.value?.code === "OFFLINE" && <div>Your OFFLINE Event team list is determined by the schedule. Upload a schedule on the Schedule tab to load teams.</div>}
                    {selectedEvent?.value?.code !== "OFFLINE" && <div>If your event has finished loading and you don't see a Team List, tap here to try loading your teams again.</div>}
                </Alert>
            </div>}
            {selectedEvent && teamList?.teams.length > 0 && <><div>
                <h4>{eventLabel || selectedEvent?.label}</h4>
                <p className={"leftTable"}>This table is {(isAuthenticated && user["https://gatool.org/roles"] && user["https://gatool.org/roles"].indexOf("user") >= 0) ? <>editable and sortable. Tap on a team number to change data for a specific team. Edits you make are local to this browser, and they will persist here if you do not clear your browser cache. You can save your changes to the gatool Cloud on the team details page or on the Setup Screen. </> : <>sortable. </>}Cells <span className={"teamTableHighlight"}>highlighted in green</span> have been modified, either by you or by other gatool users.</p>
                <Table responsive className={"leftTable topBorderLine"}>
                    <thead>
                        <tr>
                            <td>
                                <span className="gatool-tap-link" onClick={exportXLSX}><b><img style={{ float: "left" }} width="30" src="images/excelicon.png" alt="Excel Logo" /> Tap to download this table as Excel</b></span>
                            </td>
                            <td>
                                <span className="gatool-tap-link" onClick={downloadTeamInfoSheets}><img style={{ float: "left" }} width="30" src="images/wordicon.png" alt="Word Logo" /> <b>Tap here to download a merged document (docx).</b></span>
                            </td>
                            {(isAuthenticated && user["https://gatool.org/roles"] && user["https://gatool.org/roles"].indexOf("user") >= 0) && <td>
                                <span className="gatool-tap-link" onClick={clickRestoreBackup}><input type="file" id="BackupFiles" onChange={handleRestoreBackup} className={"hiddenInput"} /><b><img style={{ float: "left" }} width="30" src="images/excelicon.png" alt="Excel Logo" /> Tap here to restore team data from Excel</b></span>
                            </td>}
                        </tr>
                    </thead>

                    <tbody>
                        <tr >
                            <td>
                                <p>You can use this as a backup of your team data in conjunction with the Restore Backup button on the right. You can also merge this with Word to create team data sheets you can hand out at an event. <i>Note: this will save to Files on iOS 13+</i></p>
                            </td>
                            <td>
                                <p>This merged doc contains all of the information in your Teams List, merged onto a template you can print and distribute to teams. <i>Note: this will save to Files on iOS 13+</i></p>
                            </td>
                            {(isAuthenticated && user["https://gatool.org/roles"] && user["https://gatool.org/roles"].indexOf("user") >= 0) && <td>
                                <p>You can export your teams data to Excel using the button on the left, and then restore it from backup here. This is handy in low or no network situations, where you may be unable to update changes to gatool Cloud. <i>Note: Be careful if you modify the Excel file and then import it here.</i></p>
                            </td>}
                        </tr>
                    </tbody>
                </Table>
                {isAuthenticated && <><Button variant="warning" size="sm" onClick={handleResetClick} style={{ marginRight: "10px" }}>Reset sponsors and robot names</Button>
                    <Button variant="success" size="sm" onClick={(e) => { clearVisits(false, e) }}>Reset visit times. Use at the start of each day.</Button><br /><br /></>}

                <Table responsive striped bordered size="sm" className={"teamTable"}>
                    <thead className="thead-default">
                        <tr className={"teamTableHeader"}>
                            <th onClick={() => (teamSort === "teamNumber") ? setTeamSort("-teamNumber") : setTeamSort("teamNumber")}><b>Team #{teamSort === "teamNumber" ? <SortNumericDown /> : ""}{teamSort === "-teamNumber" ? <SortNumericUp /> : ""}</b></th>
                            <th onClick={() => (teamSort === "rank") ? setTeamSort("-rank") : setTeamSort("rank")}> <b>Rank{teamSort === "rank" ? <SortNumericDown /> : ""}{teamSort === "-rank" ? <SortNumericUp /> : ""}</b></th>
                            <th onClick={() => (teamSort === "nameShort") ? setTeamSort("-nameShort") : setTeamSort("nameShort")}><b>Team Name{teamSort === "nameShort" ? <SortAlphaDown /> : ""}{teamSort === "-nameShort" ? <SortAlphaUp /> : ""}</b></th>
                            <th onClick={() => (teamSort === "citySort") ? setTeamSort("-citySort") : setTeamSort("citySort")}><b>City{teamSort === "citySort" ? <SortAlphaDown /> : ""}{teamSort === "-citySort" ? <SortAlphaUp /> : ""}</b></th>
                            {(selectedEvent?.value?.type === "Championship" || selectedEvent?.value?.type === "ChampionshipDivision") ?
                                <th><b>Top Sponsor</b></th> :
                                <th><b>Top Sponsors</b></th>
                            }
                            <th onClick={() => (teamSort === "organization") ? setTeamSort("-organization") : setTeamSort("organization")}><b>Organization{teamSort === "organization" ? <SortAlphaDown /> : ""}{teamSort === "-organization" ? <SortAlphaUp /> : ""}</b></th>
                            <th onClick={() => (teamSort === "rookieYear") ? setTeamSort("-rookieYear") : setTeamSort("rookieYear")}><b>Rookie Year{teamSort === "rookieYear" ? <SortNumericDown /> : ""}{teamSort === "-rookieYear" ? <SortNumericUp /> : ""}</b></th>
                            <th onClick={() => (teamSort === "robotNameLocal") ? setTeamSort("-robotNameLocal") : setTeamSort("robotNameLocal")}><b>Robot Name{teamSort === "robotNameLocal" ? <SortAlphaDown /> : ""}{teamSort === "-robotNameLocal" ? <SortAlphaUp /> : ""}</b></th>
                            <th  ><b>Additional Notes</b></th>
                        </tr>
                    </thead>
                    <tbody>
                        {teamList && teamList?.teams && teamListExtended.map((team) => {
                            var cityState = `${team?.city}, ${team?.stateProv}${(team?.country !== "USA") ? ", " + team?.country : ""}`;
                            var teamName = team?.updates?.nameShortLocal ? team?.updates?.nameShortLocal : team?.nameShort;

                            return <tr key={`teamDataRow${team?.teamNumber}`}>
                                <TeamTimer team={team} lastVisit={lastVisit} monthsWarning={monthsWarning} handleShow={handleShow} currentTime={currentTime} />
                                <td style={rankHighlight(team?.rank ? team?.rank : 100, allianceCount || { "count": 8 })}>{team?.rank}</td>
                                
                                <td className={updateHighlightClass(team?.updates?.nameShortLocal)} style={updateHighlight(team?.updates?.nameShortLocal)}>
                                    {ftcMode
                                        ? <span className={`team-avatar team-${team?.teamNumber}`}></span>
                                        : <img src={`${apiBaseUrl}${selectedYear.value}/avatars/team/${team?.teamNumber}/avatar.png`} onError={(e) => { e.target.style.display = 'none'; }} alt="" />
                                    }
                                    <br />
                                    {teamName}
                                </td>
                                <td className={updateHighlightClass(team?.updates?.cityStateLocal)} style={updateHighlight(team?.updates?.cityStateLocal)}>{team?.updates?.cityStateLocal ? team?.updates?.cityStateLocal : cityState} </td>
                                {(selectedEvent?.value?.type === "Championship" || selectedEvent?.value?.type === "ChampionshipDivision") ?
                                    <td className={updateHighlightClass(team?.updates?.topSponsorLocal)} style={updateHighlight(team?.updates?.topSponsorLocal)}>{team?.updates?.topSponsorLocal ? team?.updates?.topSponsorLocal : team?.topSponsor}</td> :
                                    <td className={updateHighlightClass(team?.updates?.topSponsorsLocal)} style={updateHighlight(team?.updates?.topSponsorsLocal)}>{team?.updates?.topSponsorsLocal ? team?.updates?.topSponsorsLocal : team?.topSponsors}</td>
                                }
                                <td className={updateHighlightClass(team?.updates?.organizationLocal)} style={updateHighlight(team?.updates?.organizationLocal)}>{team?.updates?.organizationLocal ? team?.updates?.organizationLocal : team?.organization}</td>
                                <td>{team?.rookieYear}</td>
                                <td className={updateHighlightClass(team?.updates?.robotNameLocal)} style={updateHighlight(team?.updates?.robotNameLocal)}>{team?.updates?.robotNameLocal ? team?.updates?.robotNameLocal : team?.robotName}</td>
                                <td align="left" className={["teamNotes", updateHighlightClass(!_.isEmpty(team?.updates?.teamNotes))].filter(Boolean).join(" ")} style={updateHighlight(!_.isEmpty(team?.updates?.teamNotes))} dangerouslySetInnerHTML={{ __html: team?.updates?.teamNotes }}></td>
                            </tr>
                        })}
                    </tbody>
                </Table>
                {isAuthenticated && <Button variant="warning" size="sm" onClick={handleResetClick} style={{ marginRight: "10px" }}>Reset sponsors and robot names</Button>}
                <Button variant="success" size="sm" onClick={(e) => { clearVisits(false, e) }}>Reset visit times. Use at the start of each day.</Button><br /><br /><br />
            </div></>}
            <Modal centered={true} show={showDownload} onHide={handleCloseDownload}>
                <Modal.Header className={"allianceChoice"} closeVariant={"white"} closeButton>
                    <Modal.Title >Download Team Info Sheets</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>You are about to download a Word Docx which contains all of the team data we know about the teams. If you have loaded team data from gatool cloud, or if you have made local changes, those changes will be reflected on the sheets. <br /> <br /><b>If you would like us to personalize the sheets with your names as the Game Announcers, please enter them below, separated by commas:</b></p>
                    <Form>
                        <Form.Control type="text" onChange={(e) => updateGaForm(e.target.value)} />
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="success" size="sm" onClick={handleSubmitDownload}>Download Info Sheets</Button>
                </Modal.Footer>
            </Modal>

            <TeamEditModal
                show={show}
                onHide={handleClose}
                updateTeam={updateTeam}
                localUpdates={localUpdates}
                isOnline={isOnline}
                isAuthenticated={isAuthenticated}
                user={user}
                selectedEvent={selectedEvent}
                selectedYear={selectedYear}
                originalAndSustaining={originalAndSustaining}
                ftcMode={ftcMode}
                updateClass={updateClass}
                onSave={handleSubmit}
                onTrack={handleTrack}
                onClearVisits={(e) => { clearVisits(true, e) }}
                onHistory={handleHistory}
                timeFormat={timeFormat}
            />

            <TeamHistoryModal
                show={showHistory}
                onHide={handleCloseHistory}
                updateTeam={updateTeam}
                teamHistory={teamHistory}
                isAuthenticated={isAuthenticated}
                user={user}
                timeFormat={timeFormat}
                onRestore={handleRestoreData}
            />

            <Modal centered={true} show={showResetConfirm} onHide={handleResetCancel}>
                <Modal.Header className={"allianceChoice"} closeVariant={"white"} closeButton>
                    <Modal.Title>Reset Sponsors and Robot Names</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>You are about to remove local updates to sponsors and robot names for teams at <b>{eventLabel || selectedEvent?.label}</b> that have not been updated since the start of the season.</p>
                    <p>This action will remove all local changes to:</p>
                    <ul>
                        <li>Top Sponsors / Top Sponsor</li>
                        <li>Robot Names</li>
                        {resetNotes && <li>Team Notes (both Announce Screen and Team Data Screen notes)</li>}
                    </ul>
                    <p>Other local updates {resetNotes ? "(team names, organization, etc.)" : "(team names, organization, notes, etc.)"} will be preserved.</p>
                    <Form.Group className="gatool-reset-notes-option" style={{ padding: "10px", borderRadius: "4px" }}>
                        <Form.Check
                            type="checkbox"
                            id="resetNotes"
                            label={<strong>Also reset Team Notes fields (Announce Screen and Team Data Screen notes)</strong>}
                            checked={resetNotes}
                            onChange={(e) => setResetNotes(e.target.checked)}
                        />
                    </Form.Group>
                    {teamsToReset.length > 0 ? (
                        <>
                            <p><b>The following {teamsToReset.length} team{teamsToReset.length === 1 ? "" : "s"} will be reset:</b></p>
                            <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #ccc", padding: "10px", borderRadius: "4px" }}>
                                <p style={{ margin: 0, fontFamily: "monospace" }}>
                                    {teamsToReset.sort((a, b) => a - b).join(", ")}
                                </p>
                            </div>
                        </>
                    ) : (
                        <p><b>No teams found that match the reset criteria.</b></p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleResetCancel}>Cancel</Button>
                    <Button variant="warning" onClick={handleResetProceed} disabled={teamsToReset.length === 0}>Proceed</Button>
                </Modal.Footer>
            </Modal>

            <Modal centered={true} show={showSaveToCloud} onHide={handleSaveToCloudCancel}>
                <Modal.Header className={"allianceChoice"} closeVariant={"white"} closeButton>
                    <Modal.Title>Save Changes to gatool Cloud?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>The local updates have been removed. Would you like to save these changes to gatool Cloud now?</p>
                    <p>If you choose to save now, the changes will be pushed to gatool Cloud immediately. If you choose to save later, the changes will remain local and you can upload them from the Setup page.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleSaveToCloudCancel}>I'll update them in gatool Cloud later</Button>
                    <Button variant="success" onClick={handleSaveToCloud} disabled={!isOnline}>Yes, I want to save to gatool Cloud</Button>
                </Modal.Footer>
            </Modal>

        </Container>
    )
}

export default TeamDataPage;