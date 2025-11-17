import React from "react";
import Select from "react-select";
import {
  Alert,
  Button,
  Col,
  Container,
  Row,
  Table,
  Modal,
  Form,
  Tooltip,
  OverlayTrigger,
} from "react-bootstrap";
import moment from "moment";
import { utils, read } from "xlsx";
import { toast } from "react-toastify";
import _ from "lodash";
import Switch from "react-switch";
import { useState } from "react";
import { playoffOverrideMenu } from "components/Constants";
import { CheckCircleFill, XCircleFill } from "react-bootstrap-icons";
import Handshake from "components/Handshake";

function SchedulePage({
  selectedEvent,
  setSelectedEvent,
  playoffSchedule,
  qualSchedule,
  practiceSchedule,
  setPracticeSchedule,
  offlinePlayoffSchedule,
  setOfflinePlayoffSchedule,
  getTeamList,
  loadEvent,
  practiceFileUploaded,
  setPracticeFileUploaded,
  setTeamListLoading,
  getAlliances,
  playoffOnly,
  setPlayoffOnly,
  alliances,
  champsStyle,
  setChampsStyle,
  setQualsLength,
  playoffCountOverride,
  setPlayoffCountOverride,
  eventLabel,
  setEventLabel,
  allianceCount,
  hidePracticeSchedule,
  ftcMode,
  remapNumberToString,
}) {
  const [showAdjustAlliances, setShowAdjustAlliances] = useState(false);
  const [showScores, setShowScores] = useState(false);
  const [scoresMatch, setScoresMatch] = useState(null);

  const [formData, setFormData] = useState(null);

  const byeCount = [
    {
      bye: 0,
      allianceOrder: [{ match: null, station: null }],
      insertionOrder: [],
    },
    {
      bye: 0,
      allianceOrder: [{ match: 1, station: "red" }],
      insertionOrder: [],
    },
    {
      bye: 0,
      allianceOrder: [
        { match: 1, station: "red" },
        { match: 1, station: "blue" },
      ],
      insertionOrder: [],
    },

    {
      bye: 1,
      allianceOrder: [
        { match: 3, station: "red" },
        { match: 2, station: "red" },
        { match: 2, station: "blue" },
      ],
      insertionOrder: [{ number: 0, description: "Bye Match #1" }],
    },

    {
      bye: 0,
      allianceOrder: [
        { match: 1, station: "red" },
        { match: 2, station: "red" },
        { match: 2, station: "blue" },
        { match: 1, station: "blue" },
      ],
      insertionOrder: [],
    },

    {
      bye: 3,
      allianceOrder: [
        { match: 7, station: "red" },
        { match: 8, station: "red" },
        { match: 8, station: "blue" },
        { match: 2, station: "red" },
        { match: 2, station: "blue" },
      ],
      insertionOrder: [
        { number: 0, description: "Bye Match #1" },
        { number: 2, description: "Bye Match #2" },
        { number: 3, description: "Bye Match #3" },
        { number: 4, description: "Bye Match #4" },
        { number: 5, description: "Bye Match #5" },
      ],
    },

    {
      bye: 2,
      allianceOrder: [
        { match: 7, station: "red" },
        { match: 8, station: "red" },
        { match: 4, station: "red" },
        { match: 2, station: "red" },
        { match: 2, station: "blue" },
        { match: 4, station: "blue" },
      ],
      insertionOrder: [
        { number: 0, description: "Bye Match #1" },
        { number: 2, description: "Bye Match #2" },
        { number: 4, description: "Bye Match #3" },
        { number: 5, description: "Bye Match #4" },
      ],
    },

    {
      bye: 1,
      allianceOrder: [
        { match: 7, station: "red" },
        { match: 3, station: "red" },
        { match: 4, station: "red" },
        { match: 2, station: "red" },
        { match: 2, station: "blue" },
        { match: 4, station: "blue" },
        { match: 3, station: "blue" },
      ],
      insertionOrder: [
        { number: 0, description: "Bye Match #1" },
        { number: 4, description: "Bye Match #2" },
        { number: 5, description: "Match 6 (R2) (#6)" },
      ],
    },

    {
      bye: 0,
      allianceOrder: [
        { match: 1, station: "red" },
        { match: 3, station: "red" },
        { match: 4, station: "red" },
        { match: 2, station: "red" },
        { match: 2, station: "blue" },
        { match: 4, station: "blue" },
        { match: 3, station: "blue" },
        { match: 1, station: "blue" },
      ],
      insertionOrder: [],
    },
  ];

  const byeMatch = (bye, matchTime, description) => {
    return {
      description: description,
      tournamentLevel: "Playoff",
      matchNumber: bye,
      startTime: matchTime,
      actualStartTime: null,
      postResultTime: null,
      scoreRedFinal: null,
      scoreRedFoul: null,
      scoreRedAuto: null,
      scoreBlueFinal: null,
      scoreBlueFoul: null,
      scoreBlueAuto: null,
      teams: [
        {
          teamNumber: null,
          station: "Red1",
          surrogate: !1,
          dq: !1,
        },
        {
          teamNumber: null,
          station: "Red2",
          surrogate: !1,
          dq: !1,
        },
        {
          teamNumber: null,
          station: "Red3",
          surrogate: !1,
          dq: !1,
        },
        {
          teamNumber: null,
          station: "Blue1",
          surrogate: !1,
          dq: !1,
        },
        {
          teamNumber: null,
          station: "Blue2",
          surrogate: !1,
          dq: !1,
        },
        {
          teamNumber: null,
          station: "Blue3",
          surrogate: !1,
          dq: !1,
        },
      ],
      winner: { winner: "", tieWinner: "", level: 0 },
    };
  };

  // This function clicks the hidden file upload button
  function clickLoadPractice() {
    document.getElementById("BackupFiles").click();
  }

  // This function removes the Practice Schedule
  const clickRemovePractice = async () => {
    await setPracticeSchedule(null);
    await setPracticeFileUploaded(false);
    await setOfflinePlayoffSchedule(null);
    loadEvent();
  };

  // This function clicks the hidden file upload button
  function clickLoadOfflinePlayoffs() {
    document.getElementById("LoadOfflinePlayoffs").click();
  }

  /**
   * This function clears the file input by removing and recreating the file input button
   *
   * @function clearFileInput
   * @param id text The ID to delete and recreate
   */
  function clearFileInput(id) {
    var oldInput = document.getElementById(id);
    var newInput = document.createElement("input");
    newInput.type = "file";
    newInput.id = oldInput.id;
    // @ts-ignore
    newInput.name = oldInput.name;
    newInput.className = oldInput.className;
    newInput.style.cssText = oldInput.style.cssText;
    oldInput.parentNode.replaceChild(newInput, oldInput);
  }

  /**
   * This function reads a schedule array and determines the participating teams from the schedule.
   * It then creates a team list from the unique teams in the schedule.
   * @function addTeamsToTeamList
   * @param formattedSchedule the schedule to parse
   */
  function addTeamsToTeamList(formattedSchedule) {
    //generate the team list from the schedule
    var tempTeamList = [];
    // Handle both nested structure (schedule.schedule) and flat structure (schedule)
    const scheduleArray = formattedSchedule.schedule?.schedule || formattedSchedule.schedule;
    _.forEach(scheduleArray, function (row) {
      //do something
      _.forEach(row.teams, function (team) {
        if (_.findIndex(tempTeamList, team.teamNumber) < 0) {
          tempTeamList.push(team.teamNumber);
        }
      });
    });
    tempTeamList = _.uniq(tempTeamList);
    //console.log(tempTeamList);
    getTeamList(tempTeamList);
  }

  /**
   * This function imports a Practice Schedule from Excel.
   * @param e the file upload button event
   */

  function handlePracticeFiles(e) {
    const playoffOffset = byeCount[playoffCountOverride?.value || 8];
    var forPlayoffs = e.target.id === "BackupFiles" ? false : true;
    var files = e.target.files;
    var f = files[0];
    var reader = new FileReader();
    setTeamListLoading(false);
    var alliancesTemp = {
      Alliances: [],
      count: playoffCountOverride?.value > 0 ? playoffCountOverride?.value : 8,
    };

    // Determine if file is CSV or Excel based on extension
    const fileName = f.name.toLowerCase();
    const isCSV = fileName.endsWith('.csv');

    reader.onload = async function (e) {
      // @ts-ignore
      var data = new Uint8Array(e.target.result);
      var workbook;
      var schedule;
      var eventnameTemp = selectedEvent?.label;
      
      if (isCSV) {
        // Parse CSV file
        const csvText = new TextDecoder().decode(data);
        const lines = csvText.split('\n');
        
        // Parse header to understand column structure
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        
        // Find event name (usually in second row, first column)
        if (lines[1]) {
          const secondRow = lines[1].split(',').map(c => c.replace(/"/g, '').trim());
          if (secondRow[0]) {
            eventnameTemp = secondRow[0];
          }
        }
        
        // Find column indices (CSV format from FIRST)
        const timeCol = headers.findIndex(h => h.toLowerCase().includes('starttime') || h.toLowerCase().includes('time'));
        const descCol = headers.findIndex(h => h.toLowerCase().includes('textbox17') || h.toLowerCase().includes('description'));
        const blue1Col = headers.findIndex(h => h.toLowerCase().includes('bluestation1') || h === 'textbox15');
        const blue2Col = headers.findIndex(h => h.toLowerCase().includes('bluestation2'));
        const blue3Col = headers.findIndex(h => h.toLowerCase().includes('bluestation3'));
        const red1Col = headers.findIndex(h => h.toLowerCase().includes('redstation1'));
        const red2Col = headers.findIndex(h => h.toLowerCase().includes('redstation2'));
        const red3Col = headers.findIndex(h => h.toLowerCase().includes('redstation3'));
        
        // Parse data rows (skip header and first 3 rows)
        schedule = [];
        for (let i = 3; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const cols = lines[i].split(',').map(c => c.replace(/"/g, '').trim());
          
          // Skip rows without match data
          if (!cols[descCol] || (!cols[descCol].toLowerCase().includes('qualification') && !cols[descCol].toLowerCase().includes('practice'))) {
            continue;
          }
          
          // Check if at least one team number exists to avoid blank matches
          const hasTeamData = cols[blue1Col] || cols[blue2Col] || cols[blue3Col] || 
                             cols[red1Col] || cols[red2Col] || cols[red3Col];
          
          if (!hasTeamData) {
            continue;
          }
          
          schedule.push({
            Time: cols[timeCol] || "",
            Description: cols[descCol] || "",
            "Blue 1": cols[blue1Col] || "",
            "Blue 2": cols[blue2Col] || "",
            "Blue 3": cols[blue3Col] || "",
            "Red 1": cols[red1Col] || "",
            "Red 2": cols[red2Col] || "",
            "Red 3": cols[red3Col] || "",
          });
        }
      } else {
        // Parse Excel file (existing logic)
        workbook = read(data, { type: "array" });
        var worksheet = workbook.Sheets[workbook.SheetNames[0]];
        schedule = utils.sheet_to_json(worksheet, { range: 4 });
        eventnameTemp = worksheet.B3?.v || selectedEvent?.label;
      }
      
      var formattedSchedule = {};
      var matchNumber = 0;
      var errorMatches = [];
      var errorMessage = "";
      var innerSchedule = [];
      const basicMatch = {
        Time: "",
        Description: "",
        "Blue 1": "",
        "Blue 2": "",
        "Blue 3": "",
        "Red 1": "",
        "Red 2": "",
        "Red 3": "",
      };
      const matchKeys = [
        "Red 1",
        "Red 2",
        "Red 3",
        "Blue 1",
        "Blue 2",
        "Blue 3",
      ];
      schedule = schedule.map((match) => {
        match = _.merge(_.cloneDeep(basicMatch), match);
        var scheduleKeys = Object.keys(match);
        scheduleKeys.forEach((key) => {
          match[key] = match[key].toString();
        });
        // detect matches with missing teams
        if (match["Description"]?.includes("Practice") || match["Description"]?.includes("Qualification")) {
          for (var i = 0; i < matchKeys?.length; i++) {
            if (match[matchKeys[i]] === "") {
              errorMatches.push(match);
              break;
            }
          }
        }
        return match;
      });

      // Filter out blank rows (rows without any team data)
      schedule = schedule.filter((match) => {
        const hasTeamData = match["Blue 1"] || match["Blue 2"] || match["Blue 3"] || 
                           match["Red 1"] || match["Red 2"] || match["Red 3"];
        return hasTeamData;
      });

      if (errorMatches?.length > 0) {
        errorMessage =
          "Your Practice Schedule has missing data from the following match" +
          (errorMatches?.length > 1 ? "es:" : ":") +
          "</br>";
        errorMatches.forEach((match) => {
          errorMessage += match["Description"] + "</br>";
        });
        errorMessage += "Please adjust the match details and reload.</br>";
        toast.error(errorMessage);
      } else {
        innerSchedule = schedule.map((match) => {
          var matchTime =
            moment(match?.Time, "ddd h:mm A").format() === "Invalid date"
              ? moment()
              : moment(match?.Time, "ddd h:mm A").format();
          if (match["Red 1"]) {
            matchNumber++;
            var tempRow = {
              description: match?.Description,
              tournamentLevel: forPlayoffs ? "Playoff" : "Practice",
              matchNumber: forPlayoffs
                ? matchNumber + playoffOffset?.bye
                : matchNumber,
              startTime: matchTime,
              actualStartTime: null,
              postResultTime: null,
              scoreRedFinal: null,
              scoreRedFoul: null,
              scoreRedAuto: null,
              scoreBlueFinal: null,
              scoreBlueFoul: null,
              scoreBlueAuto: null,
              teams: [
                {
                  teamNumber:
                    match["Red 1"] !== ""
                      ? parseInt(removeSurrogate(match["Red 1"]))
                      : null,
                  station: "Red1",
                  surrogate: match["Red 1"].toString().includes("*") ? !0 : !1,
                  dq: !1,
                },
                {
                  teamNumber:
                    match["Red 2"] !== ""
                      ? parseInt(removeSurrogate(match["Red 2"]))
                      : null,
                  station: "Red2",
                  surrogate: match["Red 2"].toString().includes("*") ? !0 : !1,
                  dq: !1,
                },
                {
                  teamNumber:
                    match["Red 3"] !== ""
                      ? parseInt(removeSurrogate(match["Red 3"]))
                      : null,
                  station: "Red3",
                  surrogate: match["Red 3"].toString().includes("*") ? !0 : !1,
                  dq: !1,
                },
                {
                  teamNumber:
                    match["Blue 1"] !== ""
                      ? parseInt(removeSurrogate(match["Blue 1"]))
                      : null,
                  station: "Blue1",
                  surrogate: match["Blue 1"].toString().includes("*") ? !0 : !1,
                  dq: !1,
                },
                {
                  teamNumber:
                    match["Blue 2"] !== ""
                      ? parseInt(removeSurrogate(match["Blue 2"]))
                      : null,
                  station: "Blue2",
                  surrogate: match["Blue 2"].toString().includes("*") ? !0 : !1,
                  dq: !1,
                },
                {
                  teamNumber:
                    match["Blue 3"] !== ""
                      ? parseInt(removeSurrogate(match["Blue 3"]))
                      : null,
                  station: "Blue3",
                  surrogate: match["Blue 3"].toString().includes("*") ? !0 : !1,
                  dq: !1,
                },
              ],
              winner: { winner: "", tieWinner: "", level: 0 },
            };
          }
          return tempRow;
        });
        // remove non-match rows
        innerSchedule = _.filter(innerSchedule, "description");

        if (forPlayoffs) {
          // inject bye matches into schedule for playoff display
          if (playoffOffset?.bye > 0) {
            var matchTime = innerSchedule[0].startTime;
            _.forEach(playoffOffset.insertionOrder, (item, index) => {
              innerSchedule.splice(
                item.number,
                0,
                byeMatch(index + 1, matchTime, item.description)
              );
            });
            innerSchedule.map((item, index) => {
              item.matchNumber = index + 1;
              return item;
            });
          }

          alliancesTemp.Alliances = playoffOffset.allianceOrder.map(
            (allianceMember, index) => {
              try {
                var stationPrefix = allianceMember.station === "red" ? "Red" : "Blue";
                var matchTeams = innerSchedule[allianceMember.match - 1].teams;
                var tempAlliance = {
                  number: 1 + index,
                  captain: getTeamByStation(matchTeams, `${stationPrefix}1`),
                  round1: getTeamByStation(matchTeams, `${stationPrefix}2`),
                  round2: getTeamByStation(matchTeams, `${stationPrefix}3`),
                  round3: null,
                  backup: null,
                  backupReplaced: null,
                  name: `Alliance ${1 + index}`,
                };
                return tempAlliance;
              } catch (e) {
                toast.error(
                  `Please check the Alliance Count on the Setup Page before uploading your schedule.`
                );
                return null;
              }
            }
          );

          getAlliances(alliancesTemp);
        }

        const scheduleArray = _.filter(innerSchedule, "description");
        // Normalize to match API structure: schedule.schedule (nested)
        // This ensures consistency with how getSchedule formats data from FIRST API
        formattedSchedule.schedule = { schedule: scheduleArray };
        
        if (!forPlayoffs) {
          await setPracticeSchedule(formattedSchedule);
          setQualsLength(formattedSchedule?.schedule?.schedule?.length);
        } else {
          await setOfflinePlayoffSchedule(formattedSchedule);
        }
        addTeamsToTeamList(formattedSchedule);
        toast.success(
          `Your have successfully loaded your ${
            selectedEvent?.value?.code.includes("OFFLINE")
              ? "Offline"
              : "Practice"
          } Schedule.`
        );
        if (!selectedEvent?.value?.code.includes("OFFLINE")) {
          setPracticeFileUploaded(true);
        }
        if (!forPlayoffs) {
          clearFileInput("BackupFiles");
          document
            .getElementById("BackupFiles")
            .addEventListener("change", handlePracticeFiles);
        } else {
          clearFileInput("LoadOfflinePlayoffs");
          document
            .getElementById("LoadOfflinePlayoffs")
            .addEventListener("change", handlePracticeFiles);
        }

        setEventLabel(eventnameTemp);
      }
    };
    reader.readAsArrayBuffer(f);
  }

  function removeSurrogate(teamNumber) {
    teamNumber = teamNumber.replace("*", "");
    return teamNumber;
  }

  /**
   * This function finds a team by their station assignment
   * @param teams the array of team objects
   * @param station the station to find (e.g., "Red1", "Red2", "Red3", "Blue1", "Blue2", "Blue3")
   * @returns the team object or null if not found
   */
  function getTeamByStation(teams, station) {
    if (!teams || !Array.isArray(teams)) return null;
    const team = teams.find((t) => t?.station?.toLowerCase() === station?.toLowerCase());
    const teamNumber = team?.teamNumber || null;
    // Use remapNumberToString to display the original team identifier (e.g., "841B" instead of 9991)
    return remapNumberToString ? remapNumberToString(teamNumber) : teamNumber;
  }

  const handleOpen = () => {
    setFormData(_.cloneDeep(alliances));
    setShowAdjustAlliances(true);
  };

  const handleClose = () => {
    setShowAdjustAlliances(false);
  };

  const handleOpenScores = (match) => {
    setScoresMatch(match);
    setShowScores(true);
  };

  const handleCloseScores = () => {
    setShowScores(false);
  };

  const handleFormValue = (allianceNumber, property, value) => {
    var formDataTemp = _.cloneDeep(formData);
    formDataTemp.alliances[allianceNumber - 1][property] = value;
    setFormData(formDataTemp);
  };

  const handleChampsStyle = (e) => {
    var eventTemp = _.cloneDeep(selectedEvent);
    eventTemp.value.type = "Championship";
    eventTemp.value.champLevel = "CHAMPS";
    setSelectedEvent(eventTemp);
    setChampsStyle(e);
  };

  const handleAdjustAlliances = () => {
    console.log("Adjusting Alliances");
    var alliancesTemp = {};
    var teamNumbers = [];
    alliancesTemp.Alliances = formData.alliances.map((alliance) => {
      // Add the Alliance members to the team list
      var keys = Object.keys(alliance);
      keys.forEach((key) => {
        if (key.includes("captain") || key.includes("round")) {
          if (alliance[key]) {
            teamNumbers.push(Number(alliance[key]));
          }
        }
      });

      return {
        number: Number(alliance.number),
        captain: Number(alliance.captain),
        round1: Number(alliance.round1),
        round2: Number(alliance.round2),
        round3: Number(alliance.round3),
        backup: null,
        backupReplaced: null,
        name: alliance.name,
      };
    });

    getAlliances(alliancesTemp);

    // Reset the team list based on changes to the Alliances
    getTeamList(teamNumbers);

    handleClose();
  };

  const showPlayoffMessage =
    selectedEvent?.value?.code.includes("OFFLINE") &&
    !_.isNull(playoffCountOverride);
  if (typeof practiceSchedule?.schedule?.schedule !== "undefined") {
    practiceSchedule.schedule = practiceSchedule?.schedule?.schedule;
  }
  var firstMatch =
    typeof qualSchedule?.schedule?.schedule !== "undefined"
      ? qualSchedule?.schedule?.schedule[0]
      : qualSchedule?.schedule[0];
  if (
    moment().isBefore(moment(firstMatch?.startTime).subtract(20, "minutes"))
  ) {
  }
  const rankPointDisplay = (rankPoints) => {
    var pointsDisplay = [];
    _.forEach(rankPoints, (value, key) => {
      pointsDisplay.push({
        bonus: _.startCase(key.replace("BonusAchieved", "")),
        earned: value,
      });
    });
    return pointsDisplay.map((point, index) => {
      return (
        <React.Fragment key={`rp-${point.bonus}-${index}`}>
          <OverlayTrigger
            delay={500}
            overlay={
              <Tooltip id={`tooltip-${point.bonus}`}>
                {point.bonus} {point.earned ? " Achieved" : " Not Achieved"}
              </Tooltip>
            }
          >
            <span className={`rankPoints${point.earned ? "" : " unearned"}`}>
              {point.bonus.slice(0, 1)}
            </span>
          </OverlayTrigger>
        </React.Fragment>
      );
    });
  };

  const scoreAchieved = (result) => {
    return result ? (
      <CheckCircleFill style={{ color: "green" }} />
    ) : (
      <XCircleFill style={{ color: "red" }} />
    );
  };

  const addScoreType = (scores) => {
    return Object.keys(scores).map((key) => {
      if (key.toLowerCase().includes("alliance")) return { type: 1, key: key };
      else if (
        key.toLowerCase().includes("bonus") ||
        key.toLowerCase() === "rp"
      )
        return { type: 2, key: key };
      else if (key.toLowerCase().includes("auto")) return { type: 3, key: key };
      else if (key.toLowerCase().includes("teleop"))
        return { type: 4, key: key };
      else if (key.toLowerCase().includes("endgame"))
        return { type: 5, key: key };
      else if (key.toLowerCase().includes("algae"))
        return { type: 6, key: key };
      else if (key.toLowerCase().includes("foul")) return { type: 7, key: key };
      else if (key.toLowerCase().includes("total"))
        return { type: 9, key: key };
      else return { type: 10, key: key };
    });
  };

  const scoresRow = (key) => {
    return (
      <tr>
        <td>
          <b>{key.key}</b>
        </td>
        <td className="scheduleTablered">
          {typeof scoresMatch?.scores.alliances[1][key.key] === "boolean"
            ? scoreAchieved(scoresMatch?.scores.alliances[1][key.key])
            : scoresMatch?.scores.alliances[1][key.key]}
        </td>

        <td className="scheduleTableblue">
          {typeof scoresMatch?.scores.alliances[1][key.key] === "boolean"
            ? scoreAchieved(scoresMatch?.scores.alliances[0][key.key])
            : scoresMatch?.scores.alliances[0][key.key]}
        </td>
      </tr>
    );
  };

  const expandScoresRow = (key) => {
    const redRow = scoresMatch?.scores.alliances[1][key.key];
    const blueRow = scoresMatch?.scores.alliances[0][key.key];
    return (
      <>
        <tr>
          <td>
            <b>{key.key}</b>
          </td>
          <td className="scheduleTablered"></td>
          <td className="scheduleTableblue"></td>
        </tr>

        {Object.keys(redRow).map((itemKey, itemIndex) => {
          if (typeof redRow[itemKey] === "object") {
            const redRowKeys = Object.keys(redRow[itemKey]);
            return (
              <React.Fragment key={`redrow-${itemKey}-${itemIndex}`}>
                <tr>
                  <td>
                    <b>     {itemKey}</b>
                  </td>
                  <td className="scheduleTablered">
                    <tr>
                      <td>
                        <tr>
                          {redRowKeys.map((score, scoreIndex) => {
                            return (
                              <td
                                key={`red-header-${score}-${scoreIndex}`}
                                style={{
                                  writingMode: "vertical-rl",
                                  padding: "5px 0px 0px 5px",
                                }}
                              >
                                <b>{score}</b>
                              </td>
                            );
                          })}
                        </tr>
                        <tr>
                          {redRowKeys.map((score, scoreIndex) => {
                            const writingMode =
                              typeof redRow[itemKey][score] === "string"
                                ? "vertical-rl"
                                : Array.isArray(redRow[itemKey][score])
                                ? "vertical-rl"
                                : "horizontal-tb";
                            return (
                              <td
                                key={`red-value-${score}-${scoreIndex}`}
                                style={{
                                  writingMode: writingMode,
                                  padding: "5px 0px 0px 5px",
                                }}
                              >
                                {typeof redRow[itemKey][score] === "string"
                                  ? redRow[itemKey][score]
                                  : Array.isArray(redRow[itemKey][score])
                                  ? redRow[itemKey][score].join(",")
                                  : scoreAchieved(redRow[itemKey][score])}
                              </td>
                            );
                          })}
                        </tr>
                      </td>
                    </tr>
                  </td>
                  <td className="scheduleTableblue">
                    <tr>
                      <td>
                        <tr>
                          {redRowKeys.map((score, scoreIndex) => {
                            return (
                              <td
                                key={`blue-header-${score}-${scoreIndex}`}
                                style={{
                                  writingMode: "vertical-rl",
                                  padding: "5px 0px 0px 5px",
                                }}
                              >
                                <b>{score}</b>
                              </td>
                            );
                          })}
                        </tr>
                        <tr>
                          {redRowKeys.map((score, scoreIndex) => {
                            const writingMode =
                              typeof redRow[itemKey][score] === "string"
                                ? "vertical-rl"
                                : Array.isArray(redRow[itemKey][score])
                                ? "vertical-rl"
                                : "horizontal-tb";
                            return (
                              <td
                                key={`blue-value-${score}-${scoreIndex}`}
                                style={{
                                  writingMode: writingMode,
                                  padding: "5px 0px 0px 5px",
                                }}
                              >
                                {typeof blueRow[itemKey][score] === "string"
                                  ? blueRow[itemKey][score]
                                  : Array.isArray(blueRow[itemKey][score])
                                  ? blueRow[itemKey][score].join(",")
                                  : scoreAchieved(blueRow[itemKey][score])}
                              </td>
                            );
                          })}
                        </tr>
                      </td>
                    </tr>
                  </td>
                </tr>
              </React.Fragment>
            );
          } else {
            return (
              <tr key={`redrow-simple-${itemKey}-${itemIndex}`}>
                <td>
                  <b>     {itemKey}</b>
                </td>
                <td className="scheduleTablered">{redRow[itemKey]}</td>
                <td className="scheduleTableblue">{blueRow[itemKey]}</td>
              </tr>
            );
          }
        })}
      </>
    );
  };

  return (
    <Container fluid>
      {!selectedEvent && (
        <div>
          <Alert variant="warning">
            You need to select an event before you can see anything here.
          </Alert>
        </div>
      )}
      {selectedEvent &&
        (!qualSchedule ||
          qualSchedule?.schedule?.length === 0 ||
          qualSchedule?.schedule?.schedule?.length === 0) &&
        (!playoffSchedule || playoffSchedule?.schedule?.length === 0) && (
          <div>
            <Alert variant="warning">
              {(!practiceSchedule ||
                practiceSchedule?.schedule?.length === 0 ||
                practiceSchedule?.schedule?.schedule?.length === 0) &&
                !practiceFileUploaded && (
                  <>
                    {!(
                      playoffOnly &&
                      (offlinePlayoffSchedule?.schedule?.length >= 0 ||
                        offlinePlayoffSchedule?.schedule?.schedule?.length >= 0)
                    ) && (
                      <>
                        <div>
                          <img src="loadingIcon.gif" alt="Loading data..." />
                        </div>
                        <div>
                          Awaiting schedule for {eventLabel}
                          <br />
                          <br />
                        </div>
                      </>
                    )}
                    <Container fluid>
                      <Row>
                        <Col xs={1}></Col>
                        {!playoffOnly && (
                          <Col xs={1}>
                            <input
                              type="file"
                              id="BackupFiles"
                              onChange={handlePracticeFiles}
                              className={"hiddenInput"}
                            />
                            <img
                              style={{ float: "left" }}
                              width="50"
                              src="images/excelicon.png"
                              alt="Excel Logo"
                            />
                          </Col>
                        )}
                        {playoffOnly && (
                          <Col xs={1}>
                            <input
                              type="file"
                              id="LoadOfflinePlayoffs"
                              onChange={handlePracticeFiles}
                              className={"hiddenInput"}
                            />
                            <img
                              style={{ float: "left" }}
                              width="50"
                              src="images/excelicon.png"
                              alt="Excel Logo"
                            />
                          </Col>
                        )}

                        {selectedEvent?.value?.code.includes("OFFLINE") && (
                          <>
                            {!playoffOnly && (
                              <Col
                                xs={5}
                                className={"leftTable"}
                                style={{ cursor: "pointer", color: "darkblue" }}
                                onClick={clickLoadPractice}
                              >
                                <b>
                                  You can upload a Qualification Match Schedule
                                  for your Offline event. You will need to ask
                                  your Scorekeeper to export a Schedule Report
                                  in Excel format, which you can upload here. We
                                  will determine the team list from the
                                  Qualification Schedule.
                                  <br />
                                  Tap here to upload a Qualification Schedule.
                                </b>
                              </Col>
                            )}
                            {playoffOnly && showPlayoffMessage && (
                              <Col
                                xs={5}
                                className={"leftTable"}
                                style={{ cursor: "pointer", color: "darkblue" }}
                                onClick={clickLoadOfflinePlayoffs}
                              >
                                <b>
                                  You can now load your Offline Playoff
                                  Schedule. You can advance the Playoff using
                                  the Playoff Tab, or you can reload the
                                  schedule after each Round in the playoffs.
                                  <br />
                                  Tap here to remove it and replace it, as
                                  necessary.
                                </b>
                              </Col>
                            )}
                            {playoffOnly && !showPlayoffMessage && (
                              <Col xs={5} className={"leftTable"}>
                                <b>
                                  Please set the Alliance Count before uploading
                                  a Playoff Schedule.
                                </b>
                                <Select
                                  options={playoffOverrideMenu}
                                  value={
                                    playoffCountOverride
                                      ? playoffCountOverride
                                      : allianceCount?.menu
                                      ? allianceCount.menu
                                      : playoffOverrideMenu[0]
                                  }
                                  onChange={setPlayoffCountOverride}
                                />
                              </Col>
                            )}
                            <Col xs={1}></Col>
                            <Col xs={3}>
                              <Row>
                                <Col xs={2}>
                                  <Switch
                                    checked={playoffOnly}
                                    onChange={setPlayoffOnly}
                                  />
                                </Col>
                                <Col>Playoff-Only OFFLINE Event</Col>
                              </Row>
                              {playoffOnly && (
                                <Row>
                                  <Col xs={2}>
                                    <Switch
                                      checked={champsStyle}
                                      onChange={handleChampsStyle}
                                    />
                                  </Col>
                                  <Col>Is World Champs</Col>
                                </Row>
                              )}
                              {playoffOnly && offlinePlayoffSchedule && (
                                <Row>
                                  <Col>
                                    <Button onClick={() => handleOpen()}>
                                      Adjust Alliances
                                    </Button>
                                  </Col>
                                </Row>
                              )}
                            </Col>
                          </>
                        )}
                        {!selectedEvent?.value?.code.includes("OFFLINE") && (
                          <Col
                            xs={6}
                            className={"leftTable"}
                            style={{ cursor: "pointer", color: "darkblue" }}
                            onClick={clickLoadPractice}
                          >
                            <b>
                              You can upload a Practice Schedule while you wait
                              for the Quals Schedule to post. You will need to
                              ask your Scorekeeper to export a Schedule Report
                              in Excel format, which you can upload here.
                              <br />
                              Tap here to upload a Practice Schedule.
                            </b>
                          </Col>
                        )}

                        <Col xs={1}></Col>
                      </Row>
                    </Container>
                  </>
                )}
              {(practiceSchedule?.schedule?.length > 0 ||
                practiceSchedule?.schedule?.schedule?.length > 0) && (
                <Container fluid>
                  {practiceFileUploaded && (
                    <Row>
                      <Col xs={2}></Col>
                      <Col xs={1}>
                        <input
                          type="file"
                          id="RemoveOfflinePractice"
                          onChange={handlePracticeFiles}
                          className={"hiddenInput"}
                        />
                        <img
                          style={{ float: "left" }}
                          width="50"
                          src="images/excelicon.png"
                          alt="Excel Logo"
                        />
                      </Col>
                      <Col
                        xs={
                          selectedEvent?.value?.code.includes("OFFLINE") ? 4 : 7
                        }
                        className={"leftTable"}
                        style={{ cursor: "pointer", color: "darkblue" }}
                        onClick={clickRemovePractice}
                      >
                        {selectedEvent?.value?.code.includes("OFFLINE") && (
                          <b>
                            You have uploaded an Offline Schedule.
                            <br />
                            Tap here to remove it. You can add a playoff
                            schedule, when one becomes available.
                          </b>
                        )}
                        {!selectedEvent?.value?.code.includes("OFFLINE") && (
                          <b>
                            You have uploaded a Practice Schedule.
                            <br />
                            Tap here to remove it. Know that we will
                            automatically remove it when we get a Qualification
                            Matches Schedule.
                          </b>
                        )}
                      </Col>
                      <Col xs={2}></Col>
                    </Row>
                  )}
                  {!practiceFileUploaded &&
                    !selectedEvent?.value?.code.includes("OFFLINE") && (
                      <Row>
                        <Col xs={2}></Col>
                        <Col xs={8}>
                          <b>Practice Matches</b>
                          <br />
                          Your event has not yet posted a Qualification Match
                          schedule. You can use this practice match schedule to
                          help observe teams and practice for the tournament.
                          Please do not announce matches during the Practice
                          Match period.
                        </Col>
                        <Col xs={2}></Col>
                      </Row>
                    )}
                  {selectedEvent?.value?.code.includes("OFFLINE") && (
                    <Row>
                      <Col xs={1}></Col>
                      <Col xs={1}>
                        <input
                          type="file"
                          id="LoadOfflineQuals"
                          onChange={handlePracticeFiles}
                          className={"hiddenInput"}
                        />
                        <img
                          style={{ float: "left" }}
                          width="50"
                          src="images/excelicon.png"
                          alt="Excel Logo"
                        />
                      </Col>
                      <Col
                        xs={3}
                        className={"leftTable"}
                        style={{ cursor: "pointer", color: "darkblue" }}
                        onClick={clickRemovePractice}
                      >
                        {selectedEvent?.value?.code.includes("OFFLINE") && (
                          <b>
                            You have uploaded an Offline Schedule.
                            <br />
                            Tap here to remove it. You can add a playoff
                            schedule, when one becomes available.
                          </b>
                        )}
                      </Col>
                      <Col xs={2}></Col>
                      <Col xs={1}>
                        <input
                          type="file"
                          id="LoadOfflinePlayoffs"
                          onChange={handlePracticeFiles}
                          className={"hiddenInput"}
                        />
                        <img
                          style={{ float: "left" }}
                          width="50"
                          src="images/excelicon.png"
                          alt="Excel Logo"
                        />
                      </Col>
                      {showPlayoffMessage && (
                        <Col
                          xs={3}
                          className={"leftTable"}
                          style={{ cursor: "pointer", color: "darkblue" }}
                          onClick={clickLoadOfflinePlayoffs}
                        >
                          <b>
                            You can now load your Offline Playoff Schedule. You
                            may need to do this after each phase of the
                            playoffs.
                            <br />
                            Tap here to remove it and replace it, as necessary.
                          </b>
                        </Col>
                      )}
                      {!showPlayoffMessage && (
                        <Col
                          xs={3}
                          className={"leftTable"}
                          style={{ color: "darkblue" }}
                        >
                          <b>
                            Please set the Alliance Count before uploading a
                            Playoff Schedule.
                          </b>
                          <Select
                            options={playoffOverrideMenu}
                            value={
                              playoffCountOverride
                                ? playoffCountOverride
                                : allianceCount?.menu
                                ? allianceCount.menu
                                : playoffOverrideMenu[0]
                            }
                            onChange={setPlayoffCountOverride}
                          />
                        </Col>
                      )}
                      <Col xs={1}></Col>
                    </Row>
                  )}
                </Container>
              )}
            </Alert>
          </div>
        )}
      {selectedEvent &&
        (practiceSchedule?.schedule?.length > 0 ||
          qualSchedule?.schedule?.length > 0 ||
          (qualSchedule?.schedule?.length === 0 &&
            playoffSchedule?.schedule?.length > 0) ||
          (qualSchedule?.schedule?.schedule?.length === 0 &&
            playoffSchedule?.schedule?.length > 0) ||
          (qualSchedule?.schedule?.schedule?.length === 0 &&
            playoffSchedule?.schedule?.length === 0 &&
            offlinePlayoffSchedule)) && (
          <div>
            <h4>{eventLabel}</h4>
            <Table responsive striped bordered size="sm">
              <thead className="thead-default">
                <tr>
                  <th className="col2">
                    <b>Time</b>
                  </th>
                  <th className="col2">
                    <b>Description</b>
                  </th>
                  <th className="col1">
                    <b>Match Number</b>
                  </th>
                  <th className="col1" colSpan={2}>
                    <b>Score</b>
                  </th>
                  <th className="col1">
                    <b>Station 1</b>
                  </th>
                  <th className="col1">
                    <b>Station 2</b>
                  </th>
                  {!ftcMode && (
                    <th className="col1">
                      <b>Station 3</b>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {/* When available, we'll show the practice schedule here. */}
                {practiceSchedule &&
                  !hidePracticeSchedule &&
                  practiceSchedule?.schedule?.length > 0 &&
                  practiceSchedule?.schedule.map((match) => {
                    let redStyle = "red";
                    let blueStyle = "blue";
                    return (
                      <tr
                        key={"practiceSchedule" + match?.matchNumber}
                        className="centerTable"
                      >
                        <td>
                          {match?.actualStartTime ? "Actual:" : "Scheduled:"}
                          <br />{" "}
                          {match?.actualStartTime
                            ? moment(match.actualStartTime).format("dd hh:mm A")
                            : moment(match?.startTime).format("dd hh:mm A")}
                        </td>
                        <td>{match?.description}</td>
                        <td>{match?.matchNumber}</td>
                        <td className={`centerTable`} colSpan={2}>
                          <span className={redStyle}>
                            {match?.scoreRedFinal}
                          </span>
                          <br />
                          <span className={blueStyle}>
                            {match?.scoreBlueFinal}
                          </span>
                        </td>

                        <td>
                          <span className={redStyle}>
                            {getTeamByStation(match?.teams, "Red1")}
                          </span>
                          <br />
                          <span className={blueStyle}>
                            {getTeamByStation(match?.teams, "Blue1")}
                          </span>
                        </td>
                        <td>
                          <span className={redStyle}>
                            {getTeamByStation(match?.teams, "Red2")}
                          </span>
                          <br />
                          <span className={blueStyle}>
                            {getTeamByStation(match?.teams, "Blue2")}
                          </span>
                        </td>
                        <td>
                          <span className={redStyle}>
                            {getTeamByStation(match?.teams, "Red3")}
                          </span>
                          <br />
                          <span className={blueStyle}>
                            {getTeamByStation(match?.teams, "Blue3")}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                {/* When available, we'll show the offline playoff schedule here. */}
                {offlinePlayoffSchedule &&
                  offlinePlayoffSchedule?.schedule?.length > 0 &&
                  offlinePlayoffSchedule?.schedule.map((match) => {
                    let redStyle = "red";
                    let blueStyle = "blue";
                    return (
                      <tr
                        key={"practiceSchedule" + match?.matchNumber}
                        className="centerTable"
                      >
                        <td>
                          {match?.actualStartTime ? "Actual:" : "Scheduled:"}
                          <br />{" "}
                          {match?.actualStartTime
                            ? moment(match.actualStartTime).format("dd hh:mm A")
                            : moment(match?.startTime).format("dd hh:mm A")}
                        </td>
                        <td>{match?.description}</td>
                        <td>{match?.matchNumber}</td>
                        <td colSpan={ftcMode ? 1 : 2}>
                          <span className={redStyle}>
                            {match?.scoreRedFinal}
                          </span>
                          <br />
                          <span className={blueStyle}>
                            {match?.scoreBlueFinal}
                          </span>
                        </td>
                        {!ftcMode && (
                          <>
                            <td>
                              <span className={redStyle}>
                                {getTeamByStation(match?.teams, "Red1")}
                              </span>
                              <br />
                              <span className={blueStyle}>
                                {getTeamByStation(match?.teams, "Blue1")}
                              </span>
                            </td>
                            <td>
                              <span className={redStyle}>
                                {getTeamByStation(match?.teams, "Red2")}
                              </span>
                              <br />
                              <span className={blueStyle}>
                                {getTeamByStation(match?.teams, "Blue2")}
                              </span>
                            </td>
                            <td>
                              <span className={redStyle}>
                                {getTeamByStation(match?.teams, "Red3")}
                              </span>
                              <br />
                              <span className={blueStyle}>
                                {getTeamByStation(match?.teams, "Blue3")}
                              </span>
                            </td>
                          </>
                        )}
                        {ftcMode && (
                          <>
                            <td>
                              <span className={redStyle}>
                                {getTeamByStation(match?.teams, "Red1")}
                              </span>
                              <br />
                              <span className={blueStyle}>
                                {getTeamByStation(match?.teams, "Blue1")}
                              </span>
                            </td>
                            <td>
                              <span className={redStyle}>
                                {getTeamByStation(match?.teams, "Red2")}
                              </span>
                              <br />
                              <span className={blueStyle}>
                                {getTeamByStation(match?.teams, "Blue2")}
                              </span>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                {/* When available, we'll show the qualification schedule here. */}
                {qualSchedule?.schedule?.length > 0 &&
                  qualSchedule?.schedule?.map((match) => {
                    let redStyle = "red";
                    let blueStyle = "blue";
                    let winnerStyle = "tie";
                    let scoreStyle = "";
                    if (
                      Number(match.scoreRedFinal) > Number(match.scoreBlueFinal)
                    ) {
                      redStyle += " bold";
                      winnerStyle = "red";
                    } else if (
                      Number(match.scoreBlueFinal) > Number(match.scoreRedFinal)
                    ) {
                      blueStyle += " bold";
                      winnerStyle = "blue";
                    }

                    if (
                      match?.scores?.coopertitionBonusAchieved ||
                      match?.scores?.coopertitionCriteriaMet
                    ) {
                      scoreStyle = " coopertition";
                    }

                    return (
                      <tr
                        key={"qualSchedule" + match?.matchNumber}
                        className="centerTable"
                      >
                        <td>
                          {match?.actualStartTime ? "Actual:" : "Scheduled:"}
                          <br />{" "}
                          {match?.actualStartTime
                            ? moment(match?.actualStartTime).format(
                                "dd hh:mm A"
                              )
                            : moment(match?.startTime).format("dd hh:mm A")}
                        </td>
                        <td>{match?.description}</td>
                        <td>{match?.matchNumber}</td>
                        <td
                          className={
                            match?.actualStartTime
                              ? `centerTable scheduleTable${winnerStyle}`
                              : "centerTable"
                          }
                          onClick={() => {
                            if (match?.actualStartTime && match?.scores) {
                              handleOpenScores(match);
                            }
                          }}
                        >
                          <span className={redStyle}>
                            {match?.scoreRedFinal}
                          </span>
                          <br />
                          <span className={blueStyle}>
                            {match?.scoreBlueFinal}
                          </span>
                        </td>

                        <td
                          className={
                            match?.actualStartTime
                              ? `centerTable scheduleTable${winnerStyle} ${scoreStyle}`
                              : "centerTable"
                          }
                          onClick={() => {
                            if (match?.actualStartTime && match?.scores) {
                              handleOpenScores(match);
                            }
                          }}
                        >
                          <span
                            className={redStyle}
                            style={{ whiteSpace: "nowrap" }}
                          >
                            {match?.redRP && match?.actualStartTime
                              ? rankPointDisplay(match?.redRP)
                              : " "}
                          </span>
                          <br />
                          <span
                            className={blueStyle}
                            style={{ whiteSpace: "nowrap" }}
                          >
                            {match?.blueRP && match?.actualStartTime
                              ? rankPointDisplay(match?.blueRP)
                              : " "}
                          </span>
                        </td>

                        {!ftcMode && (
                          <>
                            <td>
                              <span className={redStyle}>
                                {getTeamByStation(match?.teams, "Red1")}
                              </span>
                              <br />
                              <span className={blueStyle}>
                                {getTeamByStation(match?.teams, "Blue1")}
                              </span>
                            </td>
                            <td>
                              <span className={redStyle}>
                                {getTeamByStation(match?.teams, "Red2")}
                              </span>
                              <br />
                              <span className={blueStyle}>
                                {getTeamByStation(match?.teams, "Blue2")}
                              </span>
                            </td>
                            <td>
                              <span className={redStyle}>
                                {getTeamByStation(match?.teams, "Red3")}
                              </span>
                              <br />
                              <span className={blueStyle}>
                                {getTeamByStation(match?.teams, "Blue3")}
                              </span>
                            </td>
                          </>
                        )}
                        {ftcMode && (
                          <>
                            <td>
                              <span className={redStyle}>
                                {getTeamByStation(match?.teams, "Red1")}
                              </span>
                              <br />
                              <span className={blueStyle}>
                                {getTeamByStation(match?.teams, "Blue1")}
                              </span>
                            </td>
                            <td>
                              <span className={redStyle}>
                                {getTeamByStation(match?.teams, "Red2")}
                              </span>
                              <br />
                              <span className={blueStyle}>
                                {getTeamByStation(match?.teams, "Blue2")}
                              </span>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                {/* When available, we'll show the playoff schedule here. */}
                {playoffSchedule &&
                  playoffSchedule?.schedule?.length > 0 &&
                  playoffSchedule.schedule.map((match, index) => {
                    let redStyle = "red";
                    let blueStyle = "blue";
                    let winnerStyle = "tie";
                    let qualMatchCount = qualSchedule?.schedule?.length;
                    if (
                      Number(match.scoreRedFinal) > Number(match.scoreBlueFinal)
                    ) {
                      redStyle += " bold";
                      winnerStyle = "red";
                    } else if (
                      Number(match.scoreBlueFinal) > Number(match.scoreRedFinal)
                    ) {
                      blueStyle += " bold";
                      winnerStyle = "blue";
                    }

                    return (
                      <tr
                        key={"playoffSchedule" + (index + 1)}
                        className="centerTable"
                      >
                        <td>
                          {match?.actualStartTime ? "Actual:" : "Scheduled:"}
                          <br />{" "}
                          {match?.actualStartTime
                            ? moment(match?.actualStartTime).format(
                                "dd hh:mm A"
                              )
                            : moment(match?.startTime).format("dd hh:mm A")}
                        </td>
                        <td>{match?.description}</td>
                        <td>{index + 1 + (qualMatchCount || 0)}</td>
                        <td
                          className={
                            match?.actualStartTime
                              ? `centerTable scheduleTable${winnerStyle}`
                              : "centerTable"
                          }
                          onClick={() => {
                            if (match?.actualStartTime && match?.scores) {
                              handleOpenScores(match);
                            }
                          }}
                          colSpan={2}
                        >
                          <span className={redStyle}>
                            {match?.scoreRedFinal}
                          </span>
                          <br />
                          <span className={blueStyle}>
                            {match?.scoreBlueFinal}
                          </span>
                        </td>
                        {!ftcMode && (
                          <>
                            <td>
                              <span className={redStyle}>
                                {getTeamByStation(match?.teams, "Red1")}
                              </span>
                              <br />
                              <span className={blueStyle}>
                                {getTeamByStation(match?.teams, "Blue1")}
                              </span>
                            </td>
                            <td>
                              <span className={redStyle}>
                                {getTeamByStation(match?.teams, "Red2")}
                              </span>
                              <br />
                              <span className={blueStyle}>
                                {getTeamByStation(match?.teams, "Blue2")}
                              </span>
                            </td>
                            <td>
                              <span className={redStyle}>
                                {getTeamByStation(match?.teams, "Red3")}
                              </span>
                              <br />
                              <span className={blueStyle}>
                                {getTeamByStation(match?.teams, "Blue3")}
                              </span>
                            </td>
                          </>
                        )}
                        {ftcMode && (
                          <>
                            <td>
                              <span className={redStyle}>
                                {getTeamByStation(match?.teams, "Red1")}
                              </span>
                              <br />
                              <span className={blueStyle}>
                                {getTeamByStation(match?.teams, "Blue1")}
                              </span>
                            </td>
                            <td>
                              <span className={redStyle}>
                                {getTeamByStation(match?.teams, "Red2")}
                              </span>
                              <br />
                              <span className={blueStyle}>
                                {getTeamByStation(match?.teams, "Blue2")}
                              </span>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                {((selectedEvent?.value?.code.includes("OFFLINE") &&
                    !playoffOnly &&
                    (!practiceSchedule || 
                     practiceSchedule?.schedule?.length === 0 ||
                     practiceSchedule?.schedule?.schedule?.length === 0)) ||
                  (!selectedEvent?.value?.code.includes("OFFLINE") &&
                    (!qualSchedule ||
                     qualSchedule?.schedule?.length === 0 ||
                     qualSchedule?.schedule?.schedule?.length === 0))) &&
                  !(
                    selectedEvent?.value?.type === "Championship" ||
                    selectedEvent?.value?.type ===
                      "DistrictChampionshipWithLevels"
                  ) && (
                    <tr>
                      <td colSpan={8}>
                        No Qualification match schedule available yet.
                      </td>
                    </tr>
                  )}
                {!offlinePlayoffSchedule &&
                  playoffSchedule?.schedule?.length === 0 && (
                    <tr>
                      <td colSpan={8}>
                        No Playoff match schedule available yet.
                      </td>
                    </tr>
                  )}
              </tbody>
            </Table>
          </div>
        )}
      <Modal
        centered={true}
        show={showAdjustAlliances}
        size="lg"
        onHide={handleClose}
      >
        <Modal.Header
          className={"promoteBackup"}
          closeVariant={"white"}
          closeButton
        >
          <Modal.Title>Adjust Alliances</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container>
            <Row>
              Use this form to adjust the Alliance members. If you add Alliance
              members, gatool will add the teams to the Team List. This is
              especially useful when planning 4-team Alliance events.
            </Row>
            <Form>
              <Table>
                <Row>
                  <Col>Number</Col>
                  <Col>Name</Col>
                  <Col>Captain</Col>
                  <Col>Round 1</Col>
                  <Col>Round 2</Col>
                  <Col>Round 3</Col>
                </Row>
                {formData?.alliances.map((alliance, allianceIndex) => {
                  return (
                    <Row key={`alliance-${alliance.number}-${allianceIndex}`}>
                      <Col>{alliance.number}</Col>
                      <Col>
                        <Form.Control
                          type="text"
                          value={alliance.name}
                          placeholder="Name"
                          onChange={(e) =>
                            handleFormValue(
                              alliance.number,
                              "name",
                              e.target.value
                            )
                          }
                        />
                      </Col>
                      <Col>
                        <Form.Control
                          type="text"
                          value={alliance.captain}
                          placeholder="Captain"
                          onChange={(e) =>
                            handleFormValue(
                              alliance.number,
                              "captain",
                              e.target.value
                            )
                          }
                        />
                      </Col>
                      <Col>
                        <Form.Control
                          type="text"
                          value={alliance.round1}
                          placeholder="Round 1"
                          onChange={(e) =>
                            handleFormValue(
                              alliance.number,
                              "round1",
                              e.target.value
                            )
                          }
                        />
                      </Col>
                      <Col>
                        <Form.Control
                          type="text"
                          value={alliance.round2}
                          placeholder="Round 2"
                          onChange={(e) =>
                            handleFormValue(
                              alliance.number,
                              "round2",
                              e.target.value
                            )
                          }
                        />
                      </Col>
                      <Col>
                        <Form.Control
                          type="text"
                          value={alliance.round3}
                          placeholder="Round 3"
                          onChange={(e) =>
                            handleFormValue(
                              alliance.number,
                              "round3",
                              e.target.value
                            )
                          }
                        />
                      </Col>
                    </Row>
                  );
                })}
              </Table>
            </Form>
          </Container>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleAdjustAlliances}>
            Save Alliances
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal fullscreen={true} show={showScores} onHide={handleCloseScores}>
        <Modal.Header
          className={"promoteBackup"}
          closeVariant={"white"}
          closeButton
        >
          <Modal.Title>
            Score Details for {scoresMatch?.description}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container fluid>
            <Table
              style={{ margin: "0px auto", overflowY: "scroll" }}
              responsive
              striped
              bordered
              size="sm"
            >
              <tbody>
                <tr>
                  <td>Start Time:</td>
                  <td colSpan={2}>
                    {moment(scoresMatch?.actualStartTime).format("dd hh:mm A")}
                  </td>
                </tr>
                <tr>
                  <td>Post Time:</td>
                  <td colSpan={2}>
                    {moment(scoresMatch?.postResultTime).format("dd hh:mm A")}
                  </td>
                </tr>
                <tr>
                  <td>Winner:</td>
                  <td colSpan={2}>
                    {scoresMatch?.winner.winner === "red" ? (
                      <span style={{ color: "red" }}>
                        <b>Red Alliance</b>
                      </span>
                    ) : scoresMatch?.winner.winner === "blue" ? (
                      <span style={{ color: "blue" }}>
                        <b>Blue Alliance</b>
                      </span>
                    ) : scoresMatch?.winner.tieWinner === "red" ? (
                      <span style={{ color: "red" }}>
                        <b>{scoresMatch?.winner.tieDetail}</b>
                      </span>
                    ) : scoresMatch?.winner.tieWinner === "blue" ? (
                      <span style={{ color: "blue" }}>
                        <b>{scoresMatch?.winner.tieDetail}</b>
                      </span>
                    ) : scoresMatch?.winner.tieWinner === "tie" ? (
                      <span style={{ color: "green" }}>
                        <b>{scoresMatch?.winner.tieDetail}</b>
                      </span>
                    ) : (
                      <span style={{ color: "green" }}>
                        <b>TIE</b>
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td>Coopertition:</td>
                  <td colSpan={2}>
                    <Handshake
                      result={
                        scoresMatch?.scores?.coopertitionBonusAchieved ||
                        scoresMatch?.scores.alliances[0]
                          ?.coopertitionCriteriaMet
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>Criterion</b>
                  </td>
                  <td className="scheduleTablered">
                    <b>Red Alliance Results</b>
                  </td>
                  <td className="scheduleTableblue">
                    <b>Blue Alliance Results</b>
                  </td>
                </tr>
                {scoresMatch?.scores.alliances[0] ? (
                  _.orderBy(
                    addScoreType(scoresMatch?.scores.alliances[0]),
                    ["type", "key"],
                    ["asc", "asc"]
                  ).map((key) => {
                    if (
                      typeof scoresMatch?.scores.alliances[0][key.key] ===
                      "object"
                    ) {
                      return expandScoresRow(key);
                      // return null
                    } else {
                      return scoresRow(key);
                    }
                  })
                ) : (
                  <></>
                )}
              </tbody>
            </Table>
          </Container>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseScores}>
            Done
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default SchedulePage;
