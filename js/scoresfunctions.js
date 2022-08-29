$("#loadingFeedback").html("Loading scoring functions...");


function getEventScores(eventCode, year, tlevel) {
    "use strict";
    return new Promise(function (resolve, reject) {

        var req = new XMLHttpRequest();
        req.open('GET', apiURLV3 + year + '/schedule/hybrid/' + eventCode + "/" + tlevel);
        req.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
        req.addEventListener('load', function () {
            if (req.status === 200) {
                resolve(JSON.parse(req.responseText));
            } else {
                reject(req.statusText);
            }
        });
        req.send();
    });
}

function winningAllianceTeams(matchData) {
    "use strict";
    const teams = [];
    for (let i = 0; i < matchData.match.teams.length; i++) {
        if (matchData.match.teams[i].station.toLowerCase().startsWith(matchData.highScoreAlliance)) {
            teams.push(matchData.match.teams[i].teamNumber);
        }
    }
    return teams.join(", ");
}

function findHighestScore(matchData) {
    "use strict";
    return (matchData.scoreRedFinal > matchData.scoreBlueFinal) ? matchData.scoreRedFinal : matchData.scoreBlueFinal;
}

function getHighScores() {
    "use strict";
    var req = new XMLHttpRequest();
    var eventNames = JSON.parse(localStorage.events);
    req.open('GET', apiURL + localStorage.currentYear + '/highscores');
    req.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
    req.addEventListener('load', function () {
        if (req.status === 200) {
            const data = JSON.parse(req.responseText);
            const overallQual = data.filter(x => x.yearType.includes("overallqual"));
            const penaltyFreeQual = data.filter(x => x.yearType.includes("penaltyFreequal"));
            const overallPlayoff = data.filter(x => x.yearType.includes("overallplayoff"));
            const penaltyFreePlayoff = data.filter(x => x.yearType.includes("penaltyFreeplayoff"));
            const offsettingQual = data.filter(x => x.yearType.includes("offsettingqual"));
            const offsettingPlayoff = data.filter(x => x.yearType.includes("offsettingplayoff"));
            $("#highscoreyear").html(" " + localStorage.currentYear);
            if (penaltyFreeQual.length > 0) {
                const data = penaltyFreeQual[0].matchData;
                $("#highQualsNoFouls").html("Qual <i>(no fouls)</i><br>Score: <b>" + findHighestScore(data.match) + "</b><br>Match " + data.match.matchNumber + "<br>" + eventNames[data.event.eventCode] + "<br>" + data.highScoreAlliance + " alliance (" + winningAllianceTeams(data) + ")");
            }
            if (offsettingQual.length > 0) {
                const data = offsettingQual[0].matchData;
                $("#highQualsOffsettingFouls").html("Qual <i>(offsetting fouls)</i><br>Score: <b>" + findHighestScore(data.match) + "</b><br>Match " + data.match.matchNumber + "<br>" + eventNames[data.event.eventCode] + "<br>" + data.highScoreAlliance + " alliance (" + winningAllianceTeams(data) + ")");
            }
            if (overallQual.length > 0) {
                const data = overallQual[0].matchData;
                $("#highQuals").html("Qual <i>(including fouls)</i><br>Score: <b>" + findHighestScore(data.match) + "</b><br>Match " + data.match.matchNumber + "<br>" + eventNames[data.event.eventCode] + "<br>" + data.highScoreAlliance + " alliance (" + winningAllianceTeams(data) + ")");
            }
            if (penaltyFreePlayoff.length > 0) {
                const data = penaltyFreePlayoff[0].matchData;
                $("#highPlayoffNoFouls").html("Playoff <i>(no fouls)</i><br>Score: <b>" + findHighestScore(data.match) + "</b><br>Match " + data.match.matchNumber + "<br>" + eventNames[data.event.eventCode] + "<br>" + data.highScoreAlliance + " alliance (" + winningAllianceTeams(data) + ")");
            }
            if (offsettingPlayoff.length > 0) {
                const data = offsettingPlayoff[0].matchData;
                $("#highPlayoffOffsettingFouls").html("Playoff <i>(offsetting fouls)</i><br>Score: <b>" + findHighestScore(data.match) + "</b><br>Match " + data.match.matchNumber + "<br>" + eventNames[data.event.eventCode] + "<br>" + data.highScoreAlliance + " alliance (" + winningAllianceTeams(data) + ")");
            }
            if (overallPlayoff.length > 0) {
                const data = overallPlayoff[0].matchData;
                $("#highPlayoff").html("Playoff <i>(including fouls)</i><br>Score: <b>" + findHighestScore(data.match) + "</b><br>Match " + data.match.matchNumber + "<br>" + eventNames[data.event.eventCode] + "<br>" + data.highScoreAlliance + " alliance (" + winningAllianceTeams(data) + ")");
            }
        }
    });
    var req2 = new XMLHttpRequest();
    req2.open('GET', apiURL + localStorage.currentYear + '/highscores/' + localStorage.currentEvent);
    req2.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
    req2.addEventListener('load', function () {
        if (req2.status === 200) {
            $("#eventhighscorestable").html('<thead><tr><td colspan="2">Event High Scores: <span id="highscoreevent"></span></td>/tr></thead><tr><td id="eventHighQualsNoFouls">Qual (no penalties)<br>No matches meet criteria<br></td><td id="eventHighPlayoffNoFouls">Playoff (no penalties)<br>No matches meet criteria</td></tr><tr> <td id="eventHighQualsOffsettingFouls">Qual (offsetting fouls)<br>No matches meet criteria<br></td><td id="eventHighPlayoffOffsettingFouls">Playoff (offsetting fouls)<br>No matches meet criteria<br></td></tr><tr><td id="eventHighQuals">Qual<br>No matches meet criteria<br></td><td id="eventHighPlayoff">Playoff<br>No matches meet criteria</td></tr>');
            const data = JSON.parse(req2.responseText);
            const overallQual = data.filter(x => x.yearType.includes("overallqual"));
            const penaltyFreeQual = data.filter(x => x.yearType.includes("penaltyFreequal"));
            const overallPlayoff = data.filter(x => x.yearType.includes("overallplayoff"));
            const penaltyFreePlayoff = data.filter(x => x.yearType.includes("penaltyFreeplayoff"));
            const offsettingQual = data.filter(x => x.yearType.includes("offsettingqual"));
            const offsettingPlayoff = data.filter(x => x.yearType.includes("offsettingplayoff"));
            $("#highscoreevent").html(" " + eventNames[localStorage.currentEvent]);
            if (penaltyFreeQual.length > 0) {
                const data = penaltyFreeQual[0].matchData;
                $("#eventHighQualsNoFouls").html("Qual <i>(no fouls)</i><br>Score: <b>" + findHighestScore(data.match) + "</b><br>Match " + data.match.matchNumber + "<br>" + eventNames[data.event.eventCode] + "<br>" + data.highScoreAlliance + " alliance (" + winningAllianceTeams(data) + ")");
            }
            if (offsettingQual.length > 0) {
                const data = offsettingQual[0].matchData;
                $("#eventHighQualsOffsettingFouls").html("Qual <i>(offsetting fouls)</i><br>Score: <b>" + findHighestScore(data.match) + "</b><br>Match " + data.match.matchNumber + "<br>" + eventNames[data.event.eventCode] + "<br>" + data.highScoreAlliance + " alliance (" + winningAllianceTeams(data) + ")");
            }
            if (overallQual.length > 0) {
                const data = overallQual[0].matchData;
                $("#eventHighQuals").html("Qual <i>(including fouls)</i><br>Score: <b>" + findHighestScore(data.match) + "</b><br>Match " + data.match.matchNumber + "<br>" + eventNames[data.event.eventCode] + "<br>" + data.highScoreAlliance + " alliance (" + winningAllianceTeams(data) + ")");
            }
            if (penaltyFreePlayoff.length > 0) {
                const data = penaltyFreePlayoff[0].matchData;
                $("#eventHighPlayoffNoFouls").html("Playoff <i>(no fouls)</i><br>Score: <b>" + findHighestScore(data.match) + "</b><br>Match " + data.match.matchNumber + "<br>" + eventNames[data.event.eventCode] + "<br>" + data.highScoreAlliance + " alliance (" + winningAllianceTeams(data) + ")");
            }
            if (offsettingPlayoff.length > 0) {
                const data = offsettingPlayoff[0].matchData;
                $("#eventHighPlayoffOffsettingFouls").html("Playoff <i>(offsetting fouls)</i><br>Score: <b>" + findHighestScore(data.match) + "</b><br>Match " + data.match.matchNumber + "<br>" + eventNames[data.event.eventCode] + "<br>" + data.highScoreAlliance + " alliance (" + winningAllianceTeams(data) + ")");
            }
            if (overallPlayoff.length > 0) {
                const data = overallPlayoff[0].matchData;
                $("#eventHighPlayoff").html("Playoff <i>(including fouls)</i><br>Score: <b>" + findHighestScore(data.match) + "</b><br>Match " + data.match.matchNumber + "<br>" + eventNames[data.event.eventCode] + "<br>" + data.highScoreAlliance + " alliance (" + winningAllianceTeams(data) + ")");
            }
        }
    });
    req2.send();
    req.send();

}

function getTeamRanks() {
    "use strict";
    prepareAllianceSelection();
    if (localStorage.offseason == "true") {
        $('#rankUpdateContainer').html("Offline Event");
    } else {
        $("#rankUpdateContainer").html("Loading ranking data...");
    }
    $('#ranksProgressBar').show();
    $('#teamRanksPicker').addClass('alert-danger');
    var team = {};
    var teamAllianceReady = 0;
    var req = new XMLHttpRequest();
    req.open('GET', apiURLV3 + localStorage.currentYear + '/rankings/' + localStorage.currentEvent);
    req.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
    req.addEventListener('load', function () {
        if (req.status === 200) {
            var data = JSON.parse(req.responseText);
            if (data.Rankings.length === 0) {
                $("#rankingDisplay").html('<b>No Rankings available.</b>');
                $("#allianceSelectionTable").hide();
                $("#playoffBracket").hide();
                $(".playoffCells").html("TBD");
                $(".playoffBadge").removeClass("redScore blueScore tieScore greyScore");
                allianceListUnsorted = [];
                var teamList = JSON.parse(localStorage.teamList);
                for (var j = 0; j < teamList.length; j++) {
                    allianceListUnsorted[j] = teamList[j].teamNumber;
                    //team = JSON.parse(localStorage["teamData" + teamList[j].teamNumber]);
                    team = decompressLocalStorage("teamData" + teamList[j].teamNumber);
                    team.rank = "";
                    team.sortOrder1 = "";
                    team.sortOrder2 = "";
                    team.sortOrder3 = "";
                    team.sortOrder4 = "";
                    team.sortOrder5 = "";
                    team.sortOrder6 = "";
                    team.wins = "";
                    team.losses = "";
                    team.ties = "";
                    team.qualAverage = "";
                    team.dq = "";
                    team.matchesPlayed = "";
                    $("#teamTableRank" + teamList[j].teamNumber).html("");
                    $("#teamTableRank" + teamList[j].teamNumber).attr("class", teamTableRankHighlight(100));
                    //localStorage["teamData" + teamList[j].teamNumber] = JSON.stringify(team);
                    compressLocalStorage("teamData" + teamList[j].teamNumber, team);
                }
            } else {
                haveRanks = true;
                localStorage.Rankings = JSON.stringify(data.Rankings);
                if (localStorage.currentMatch > JSON.parse(localStorage.qualsList).Schedule.length) {
                    $("#rankingDisplay").html("<b>Qual Seed<b>");
                } else {
                    $("#rankingDisplay").html('<b>Ranking</b>');
                }
                $('#ranksContainer').html('<p class = "eventName">' + localStorage.eventName + ' (<b><span id="rankstablelastupdated"></span></b>)</p><p>This table lists the teams in rank order for this competition. This table updates during the competition, and freezes once Playoff Matches begin. </p><table id="ranksTable" class="table table-condensed table-responsive table-bordered table-striped"></table>');
                var ranksList = `<thead id="ranksTableHead" class="thead-default"><tr><td onclick="w3.sortHTMLAsNumber('#ranksTable','.ranksTableRow', '.rankTableNumber')" class="col1"><b>Team #</b></td><td onclick="w3.sortHTMLAsNumber('#ranksTable','.ranksTableRow', '.rankTableRank')" class="col1"><b>Rank</b></td><td onclick="w3.sortHTML('#ranksTable','.ranksTableRow', '.rankTableName')" class="col2"><b>Team Name</b></td><td onclick="w3.sortHTMLAsNumber('#ranksTable','.ranksTableRow', '.rankTableRP')" class = "col1"><b>RP Avg.</b></td><td onclick="w3.sortHTMLAsNumber('#ranksTable','.ranksTableRow', '.rankTableWins')" class="col1"><b>Wins</b></td><td  onclick="w3.sortHTMLAsNumber('#ranksTable','.ranksTableRow', '.rankTableLosses')" class="col1"><b>Losses</b></td><td onclick="w3.sortHTMLAsNumber('#ranksTable','.ranksTableRow', '.rankTableTies')" class="col1"><b>Ties</b></td><td onclick="w3.sortHTMLAsNumber('#ranksTable','.ranksTableRow', '.rankTableQualAverage')" class="col1"><b>Qual Avg</b></td><td onclick="w3.sortHTMLAsNumber('#ranksTable','.ranksTableRow', '.rankTableDQ')" class="col1"><b>DQ</b></td><td onclick="w3.sortHTMLAsNumber('#ranksTable','.ranksTableRow', '.rankTableMatchesPlayed')" class="col1"><b>Matches Played</b></td><td onclick="w3.sortHTMLAsNumber('#ranksTable','.ranksTableRow', '.sortDistrictRank')" class="col1 districtRank"><b>District Rank</b></tr></thead><tbody>`;

                // Determine the number of matches each team will play
                matchCount = parseInt(Number(JSON.parse(localStorage.qualsList).Schedule.length) * 6 / Number(data.Rankings.length));

                //Process rank info for each team.
                for (var i = 0; i < data.Rankings.length; i++) {

                    team = decompressLocalStorage("teamData" + data.Rankings[i].teamNumber);
                    team.rank = data.Rankings[i].rank;
                    allianceTeamList[i] = data.Rankings[i].teamNumber;
                    allianceListUnsorted[i] = data.Rankings[i].teamNumber;
                    //rankingsList = data.Rankings[i].teamNumber;
                    team.sortOrder1 = data.Rankings[i].sortOrder1;
                    team.sortOrder2 = data.Rankings[i].sortOrder2;
                    team.sortOrder3 = data.Rankings[i].sortOrder3;
                    team.sortOrder4 = data.Rankings[i].sortOrder4;
                    team.sortOrder5 = data.Rankings[i].sortOrder5;
                    team.sortOrder6 = data.Rankings[i].sortOrder6;
                    team.wins = data.Rankings[i].wins;
                    team.losses = data.Rankings[i].losses;
                    team.ties = data.Rankings[i].ties;
                    team.qualAverage = data.Rankings[i].qualAverage;
                    team.dq = data.Rankings[i].dq;
                    team.matchesPlayed = data.Rankings[i].matchesPlayed;
                    $("#teamTableRank" + data.Rankings[i].teamNumber).html(data.Rankings[i].rank);
                    $("#teamTableRank" + data.Rankings[i].teamNumber).attr("class", teamTableRankHighlight(data.Rankings[i].rank));
                    ranksList += updateRanksTableRow(team, data.Rankings[i].teamNumber);
                    compressLocalStorage("teamData" + data.Rankings[i].teamNumber, team);
                   
                    //Count how many teams have not played all of their matches
                    if (data.Rankings[i].matchesPlayed < matchCount) {
                        teamAllianceReady += 1;
                    }

                }
                if (teamAllianceReady == 0) {
                    allianceSelectionReady = true;
                } else {
                    allianceSelectionReady = false;
                }

                $("#ranksProgressBar").hide();
                $('#ranksTable').html(ranksList + "</tbody>");
                $('#teamRanksPicker').removeClass('alert-danger');
                $('#teamRanksPicker').addClass('alert-success');
                lastRanksUpdate = req.getResponseHeader("Last-Modified");
                
                teamCountTotal = data.Rankings.length;
                if (localStorage.playoffCountOverride === "true") {
                    allianceCount = parseInt(localStorage.playoffCountOverrideValue);
                    allianceSelectionLength = 2 * allianceCount - 1;
                } else if (oneDayEvent) {
                    allianceCount = 4;
                    allianceSelectionLength = 2 * allianceCount - 1;
                } else if (teamCountTotal <= 24) {
                    allianceCount = Math.floor((teamCountTotal - 1) / 3);
                    allianceSelectionLength = 2 * allianceCount - 1;
                } else {
                    allianceCount = 8;
                }
                $('#eventAllianceCount').html(allianceCount);
                $("#eventTeamCount").html(teamCountTotal);

                allianceSelectionOrder=[];
                for (var alliance of allianceSelectionOrderBase) {
                    if (parseInt(alliance.substring(8, 9)) <= allianceCount) {
                        allianceSelectionOrder.push(alliance)
                    }
                };

                $("#allianceUndoButton").hide();
                allianceChoices.Alliance1Captain = allianceTeamList[0];
                $("#Alliance1Captain").html("Alliance 1 Captain<div class ='allianceTeam allianceCaptain' captain='Alliance1Captain' teamnumber = '" + allianceTeamList[0] + "' id='allianceTeam" + allianceTeamList[0] + "' onclick='chosenAllianceAlert(this)'>" + allianceTeamList.shift() + "</div>");
                allianceChoices.Alliance2Captain = allianceTeamList[0];
                $("#Alliance2Captain").html("Alliance 2 Captain<div class ='allianceTeam allianceCaptain' captain='Alliance2Captain' teamnumber = '" + allianceTeamList[0] + "' id='allianceTeam" + allianceTeamList[0] + "' onclick='allianceAlert(this)'>" + allianceTeamList.shift() + "</div>");
                if (allianceCount > 2) {
                    allianceChoices.Alliance3Captain = allianceTeamList[0];
                    $("#Alliance3Captain").html("Alliance 3 Captain<div class ='allianceTeam allianceCaptain' captain='Alliance3Captain' teamnumber = '" + allianceTeamList[0] + "' id='allianceTeam" + allianceTeamList[0] + "' onclick='allianceAlert(this)'>" + allianceTeamList.shift() + "</div>");
                }
                if (allianceCount > 3) {
                    allianceChoices.Alliance4Captain = allianceTeamList[0];
                    $("#Alliance4Captain").html("Alliance 4 Captain<div class ='allianceTeam allianceCaptain' captain='Alliance4Captain' teamnumber = '" + allianceTeamList[0] + "' id='allianceTeam" + allianceTeamList[0] + "' onclick='allianceAlert(this)'>" + allianceTeamList.shift() + "</div>");
                }
                if (allianceCount > 4) {
                    allianceChoices.Alliance5Captain = allianceTeamList[0];
                    $("#Alliance5Captain").html("Alliance 5 Captain<div class ='allianceTeam allianceCaptain' captain='Alliance5Captain' teamnumber = '" + allianceTeamList[0] + "' id='allianceTeam" + allianceTeamList[0] + "' onclick='allianceAlert(this)'>" + allianceTeamList.shift() + "</div>");
                }
                if (allianceCount > 5) {
                    allianceChoices.Alliance6Captain = allianceTeamList[0];
                    $("#Alliance6Captain").html("Alliance 6 Captain<div class ='allianceTeam allianceCaptain' captain='Alliance6Captain' teamnumber = '" + allianceTeamList[0] + "' id='allianceTeam" + allianceTeamList[0] + "' onclick='allianceAlert(this)'>" + allianceTeamList.shift() + "</div>");
                }
                if (allianceCount > 6) {
                    allianceChoices.Alliance7Captain = allianceTeamList[0];
                    $("#Alliance7Captain").html("Alliance 7 Captain<div class ='allianceTeam allianceCaptain' captain='Alliance7Captain' teamnumber = '" + allianceTeamList[0] + "' id='allianceTeam" + allianceTeamList[0] + "' onclick='allianceAlert(this)'>" + allianceTeamList.shift() + "</div>");
                }
                if (allianceCount > 7) {
                    allianceChoices.Alliance8Captain = allianceTeamList[0];
                    $("#Alliance8Captain").html("Alliance 8 Captain<div class ='allianceTeam allianceCaptain' captain='Alliance8Captain' teamnumber = '" + allianceTeamList[0] + "' id='allianceTeam" + allianceTeamList[0] + "' onclick='allianceAlert(this)'>" + allianceTeamList.shift() + "</div>");
                }
                $("#backupMessage").html(`(Initially rank ${allianceCount+1} to ${allianceCount+8} top to bottom)`)
                $("#backupAllianceTeam1").html("<div id='backupAllianceTeamContainer1' class ='allianceTeam' captain='alliance' teamnumber=" + allianceTeamList[0] + " onclick='allianceAlert(this)'>" + allianceTeamList[0] + "</div>");
                $("#backupAllianceTeam2").html("<div id='backupAllianceTeamContainer2' class ='allianceTeam' captain='alliance' teamnumber=" + allianceTeamList[1] + " onclick='allianceAlert(this)'>" + allianceTeamList[1] + "</div>");
                $("#backupAllianceTeam3").html("<div id='backupAllianceTeamContainer3' class ='allianceTeam' captain='alliance' teamnumber=" + allianceTeamList[2] + " onclick='allianceAlert(this)'>" + allianceTeamList[2] + "</div>");
                $("#backupAllianceTeam4").html("<div id='backupAllianceTeamContainer4' class ='allianceTeam' captain='alliance' teamnumber=" + allianceTeamList[3] + " onclick='allianceAlert(this)'>" + allianceTeamList[3] + "</div>");
                $("#backupAllianceTeam5").html("<div id='backupAllianceTeamContainer5' class ='allianceTeam' captain='alliance' teamnumber=" + allianceTeamList[4] + " onclick='allianceAlert(this)'>" + allianceTeamList[4] + "</div>");
                $("#backupAllianceTeam6").html("<div id='backupAllianceTeamContainer6' class ='allianceTeam' captain='alliance' teamnumber=" + allianceTeamList[5] + " onclick='allianceAlert(this)'>" + allianceTeamList[5] + "</div>");
                $("#backupAllianceTeam7").html("<div id='backupAllianceTeamContainer7' class ='allianceTeam' captain='alliance' teamnumber=" + allianceTeamList[6] + " onclick='allianceAlert(this)'>" + allianceTeamList[6] + "</div>");
                $("#backupAllianceTeam8").html("<div id='backupAllianceTeamContainer8' class ='allianceTeam' captain='alliance' teamnumber=" + allianceTeamList[7] + " onclick='allianceAlert(this)'>" + allianceTeamList[7] + "</div>");


                allianceTeamList = sortAllianceTeams(allianceTeamList);

                $("#rankUpdateContainer").html(moment().format("dddd, MMMM Do YYYY, " + timeFormats[localStorage.timeFormat]));
            }
            $(".districtRank").hide();
            if (localStorage.eventDistrict != "") {
                $(".districtRank").show();
                getDistrictRanks(localStorage.eventDistrict, localStorage.currentYear);
            }
            backupAllianceList = allianceListUnsorted.slice(allianceCount);
        }
    });
    if (localStorage.offseason !== "true") {
        req.send();
    }
}

function getAllTeamAwards(teamNumber) {
    "use strict";
    var req = new XMLHttpRequest();
    req.open('GET', apiURL + "team/" + teamNumber + "/awards");
    req.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
    req.addEventListener('load', function () {
        if (req.status === 200) {
            var allAwards = JSON.parse(req.responseText);
            var result = {};
            result.chairmans = 0;
            result.chairmansyears = [];
            result.champsFinalist = 0;
            result.champsFinalistyears = [];
            result.champsSubdivisionWinner = 0;
            result.champsSubdivisionWinneryears = [];
            result.champsDivisionWinner = 0;
            result.champsDivisionWinneryears = [];
            result.woodieflowers = 0;
            result.woodieflowersyears = [];
            result.deansList = 0;
            result.deansListyears = [];
            result.voy = 0;
            result.voyyears = [];

            for (var i = 0; i < allAwards.length; i++) {
                //Chairman's Award
                //award_type === 0
                //event_key === xxxxcmp
                if ((allAwards[i].award_type === 0) && ((allAwards[i].event_key === allAwards[i].year + "cmp") || (allAwards[i].event_key === allAwards[i].year + "cmptx") || (allAwards[i].event_key === allAwards[i].year + "cmpmi") || (allAwards[i].event_key === allAwards[i].year + "cmpaw"))) {
                    result.chairmans += 1;
                    result.chairmansyears.push(allAwards[i].year);
                }

                //Champs Finalist
                //award_type === 2
                //event_key === xxxxcmp
                if ((allAwards[i].award_type === 2) && ((allAwards[i].event_key === allAwards[i].year + "cmp") || (allAwards[i].event_key === allAwards[i].year + "cmptx") || (allAwards[i].event_key === allAwards[i].year + "cmpmi") || (allAwards[i].event_key === allAwards[i].year + "cmpaw"))) {
                    result.champsFinalist += 1;
                    result.champsFinalistyears.push(allAwards[i].year);
                }


                //Champs Subdivision Winner
                //award_type === 1
                //event_key === [xxxarc,xxxgal,xxxcur,xxxxdar,xxxxtes,xxxxdal,xxxxcars,xxxxcarv,xxxxtur,xxxxroe,xxxxhop,xxxxnew]
                if ((allAwards[i].award_type === 1) && (allAwards[i].event_key === allAwards[i].year + "arc") && (allAwards[i].year >=2015 && allAwards[i].year <2022)) {
                    result.champsSubdivisionWinner += 1;
                    result.champsSubdivisionWinneryears.push(allAwards[i].year + " Archimedes");
                }
                if ((allAwards[i].award_type === 1) && (allAwards[i].event_key === allAwards[i].year + "gal") && (allAwards[i].year >=2015 && allAwards[i].year <2022)) {
                    result.champsSubdivisionWinner += 1;
                    result.champsSubdivisionWinneryears.push(allAwards[i].year + " Galileo");
                }
                if ((allAwards[i].award_type === 1) && (allAwards[i].event_key === allAwards[i].year + "cur") && (allAwards[i].year >=2015 && allAwards[i].year <2022)) {
                    result.champsSubdivisionWinner += 1;
                    result.champsSubdivisionWinneryears.push(allAwards[i].year + " Curie");
                }
                if ((allAwards[i].award_type === 1) && (allAwards[i].event_key === allAwards[i].year + "dar") && (allAwards[i].year >=2015 && allAwards[i].year <2022)) {
                    result.champsSubdivisionWinner += 1;
                    result.champsSubdivisionWinneryears.push(allAwards[i].year + " Darwin");
                }
                if ((allAwards[i].award_type === 1) && (allAwards[i].event_key === allAwards[i].year + "tes") && (allAwards[i].year >=2015 && allAwards[i].year <2022)) {
                    result.champsSubdivisionWinner += 1;
                    result.champsSubdivisionWinneryears.push(allAwards[i].year + " Tesla");
                }
                if ((allAwards[i].award_type === 1) && (allAwards[i].event_key === allAwards[i].year + "dal") && (allAwards[i].year >=2015 && allAwards[i].year <2022)) {
                    result.champsSubdivisionWinner += 1;
                    result.champsSubdivisionWinneryears.push(allAwards[i].year + " Daly");
                }
                if ((allAwards[i].award_type === 1) && (allAwards[i].event_key === allAwards[i].year + "cars") && (allAwards[i].year >=2015 && allAwards[i].year <2022)) {
                    result.champsSubdivisionWinner += 1;
                    result.champsSubdivisionWinneryears.push(allAwards[i].year + " Carson");
                }
                if ((allAwards[i].award_type === 1) && (allAwards[i].event_key === allAwards[i].year + "carv") && (allAwards[i].year >=2015 && allAwards[i].year <2022)) {
                    result.champsSubdivisionWinner += 1;
                    result.champsSubdivisionWinneryears.push(allAwards[i].year + " Carver");
                }
                if ((allAwards[i].award_type === 1) && (allAwards[i].event_key === allAwards[i].year + "tur") && (allAwards[i].year >=2015 && allAwards[i].year <2022)) {
                    result.champsSubdivisionWinner += 1;
                    result.champsSubdivisionWinneryears.push(allAwards[i].year + " Turing");
                }
                if ((allAwards[i].award_type === 1) && (allAwards[i].event_key === allAwards[i].year + "roe") && (allAwards[i].year >=2015 && allAwards[i].year <2022)) {
                    result.champsSubdivisionWinner += 1;
                    result.champsSubdivisionWinneryears.push(allAwards[i].year + " Roebling");
                }
                if ((allAwards[i].award_type === 1) && (allAwards[i].event_key === allAwards[i].year + "hop") && (allAwards[i].year >=2015 && allAwards[i].year <2022)) {
                    result.champsSubdivisionWinner += 1;
                    result.champsSubdivisionWinneryears.push(allAwards[i].year + " Hopper");
                }
                if ((allAwards[i].award_type === 1) && (allAwards[i].event_key === allAwards[i].year + "new") && (allAwards[i].year >=2015 && allAwards[i].year <2022)) {
                    result.champsSubdivisionWinner += 1;
                    result.champsSubdivisionWinneryears.push(allAwards[i].year + " Newton");
                }

                //Champs Division Winner
                //award_type === 1
                //year >= 2022
                //event_key === [xxxarc,xxxgal,xxxcur,xxxxdar,xxxxtes,xxxxdal,xxxxcars,xxxxcarv,xxxxtur,xxxxroe,xxxxhop,xxxxnew]
                if ((allAwards[i].award_type === 1) && (allAwards[i].event_key === allAwards[i].year + "arc") && (allAwards[i].year >=2022 || allAwards[i].year <2015)) {
                    result.champsDivisionWinner += 1;
                    result.champsDivisionWinneryears.push(allAwards[i].year + " Archimedes");
                }
                if ((allAwards[i].award_type === 1) && (allAwards[i].event_key === allAwards[i].year + "gal") && (allAwards[i].year >=2022 || allAwards[i].year <2015)) {
                    result.champsDivisionWinner += 1;
                    result.champsDivisionWinneryears.push(allAwards[i].year + " Galileo");
                }
                if ((allAwards[i].award_type === 1) && (allAwards[i].event_key === allAwards[i].year + "cur") && (allAwards[i].year >=2022 || allAwards[i].year <2015)) {
                    result.champsDivisionWinner += 1;
                    result.champsDivisionWinneryears.push(allAwards[i].year + " Curie");
                }
                if ((allAwards[i].award_type === 1) && (allAwards[i].event_key === allAwards[i].year + "dar") && (allAwards[i].year >=2022 || allAwards[i].year <2015)) {
                    result.champsDivisionWinner += 1;
                    result.champsDivisionWinneryears.push(allAwards[i].year + " Darwin");
                }
                if ((allAwards[i].award_type === 1) && (allAwards[i].event_key === allAwards[i].year + "tes") && (allAwards[i].year >=2022 || allAwards[i].year <2015)) {
                    result.champsDivisionWinner += 1;
                    result.champsDivisionWinneryears.push(allAwards[i].year + " Tesla");
                }
                if ((allAwards[i].award_type === 1) && (allAwards[i].event_key === allAwards[i].year + "dal") && (allAwards[i].year >=2022 || allAwards[i].year <2015)) {
                    result.champsDivisionWinner += 1;
                    result.champsDivisionWinneryears.push(allAwards[i].year + " Daly");
                }
                if ((allAwards[i].award_type === 1) && (allAwards[i].event_key === allAwards[i].year + "cars") && (allAwards[i].year >=2022 || allAwards[i].year <2015)) {
                    result.champsDivisionWinner += 1;
                    result.champsDivisionWinneryears.push(allAwards[i].year + " Carson");
                }
                if ((allAwards[i].award_type === 1) && (allAwards[i].event_key === allAwards[i].year + "carv") && (allAwards[i].year >=2022 || allAwards[i].year <2015)) {
                    result.champsDivisionWinner += 1;
                    result.champsDivisionWinneryears.push(allAwards[i].year + " Carver");
                }
                if ((allAwards[i].award_type === 1) && (allAwards[i].event_key === allAwards[i].year + "tur") && (allAwards[i].year >=2022 || allAwards[i].year <2015)) {
                    result.champsDivisionWinner += 1;
                    result.champsDivisionWinneryears.push(allAwards[i].year + " Turing");
                }
                if ((allAwards[i].award_type === 1) && (allAwards[i].event_key === allAwards[i].year + "roe") && (allAwards[i].year >=2022 || allAwards[i].year <2015)) {
                    result.champsDivisionWinner += 1;
                    result.champsDivisionWinneryears.push(allAwards[i].year + " Roebling");
                }
                if ((allAwards[i].award_type === 1) && (allAwards[i].event_key === allAwards[i].year + "hop") && (allAwards[i].year >=2022 || allAwards[i].year <2015)) {
                    result.champsDivisionWinner += 1;
                    result.champsDivisionWinneryears.push(allAwards[i].year + " Hopper");
                }
                if ((allAwards[i].award_type === 1) && (allAwards[i].event_key === allAwards[i].year + "new") && (allAwards[i].year >=2022 || allAwards[i].year <2015)) {
                    result.champsDivisionWinner += 1;
                    result.champsDivisionWinneryears.push(allAwards[i].year + " Newton");
                }

                //Woodie Flowers
                //award_type === 3
                //event_key === xxxxcmp, xxxxcmptx, xxxxcmpmi (WF award is awarded simultaneously at TX and MI, so remove MI), xxxxcmpaw
                //if ((allAwards[i].award_type === 3) && ((allAwards[i].event_key === allAwards[i].year + "cmp") || (allAwards[i].event_key === allAwards[i].year + "cmptx") || (allAwards[i].event_key === allAwards[i].year + "cmpmi"))) {
                if ((allAwards[i].award_type === 3) && ((allAwards[i].event_key === allAwards[i].year + "cmp") || (allAwards[i].event_key === allAwards[i].year + "cmptx") || (allAwards[i].event_key === allAwards[i].year + "cmpaw"))) {
                    result.woodieflowers += 1;
                    result.woodieflowersyears.push(allAwards[i].year + " " + allAwards[i].recipient_list[0].awardee);
                }

                //Dean's List
                //award_type === 4
                //event_key === xxxxcmp, xxxxcmptx, xxxxcmpmi, xxxxcmpaw
                if ((allAwards[i].award_type === 4) && ((allAwards[i].event_key === allAwards[i].year + "cmp") || (allAwards[i].event_key === allAwards[i].year + "cmptx") || (allAwards[i].event_key === allAwards[i].year + "cmpmi") || (allAwards[i].event_key === allAwards[i].year + "cmpaw"))) {
                    result.deansList += 1;
                    for (var j = 0; j < allAwards[i].recipient_list.length; j++) {
                        if (allAwards[i].recipient_list[j].team_key === "frc" + teamNumber) {
                            result.deansListyears.push(allAwards[i].year + " " + allAwards[i].recipient_list[j].awardee);
                        }
                    }


                }


                //Volunteer of the Year
                //award_type === 5
                //event_key === xxxxcmp, xxxxcmptx, xxxxcmpmi, xxxcmpaw
                if ((allAwards[i].award_type === 5) && ((allAwards[i].event_key === allAwards[i].year + "cmp") || (allAwards[i].event_key === allAwards[i].year + "cmptx") || (allAwards[i].event_key === allAwards[i].year + "cmpmi") || (allAwards[i].event_key === allAwards[i].year + "cmpaw"))) {
                    var voyEvent = "FIRST Champs";
                    if (allAwards[i].event_key === allAwards[i].year + "cmptx") {
                        voyEvent = "Houston Champs";

                    } else if (allAwards[i].event_key === allAwards[i].year + "cmpmi") {
                        voyEvent = "Detroit Champs";
                    } else if (allAwards[i].event_key === allAwards[i].year + "cmpaw") {
                        voyEvent = "At Home Champs";
                    }

                    result.voy += 1;
                    result.voyyears.push(allAwards[i].year + " " + voyEvent + " - " + allAwards[i].recipient_list[0].awardee);
                }

            }
            champsAwards[String(teamNumber)] = result;

        } else if (req.status === 504) {
            console.log("allAwards Timeout. Trying " + teamNumber + " again");
            let timerTeamNumber = teamNumber;
            setTimeout(function () { getAllTeamAwards(timerTeamNumber); }, 5000);
        }
    });
    req.send();
}

function getTeamAppearances(teamList) {
    for (let j = 0; j < teamList.length; j++) {
        let delay = tbaBatchDelay * j;
        setTimeout(function () {
            getTeamAppearance(teamList[j].teamNumber);
            getAllTeamAwards(teamList[j].teamNumber);
        }, delay);
    }
}


function getTeamAppearance(teamNumber) {
    "use strict";
    var req = new XMLHttpRequest();
    req.open('GET', apiURL + "team/" + teamNumber + "/appearances");
    req.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
    req.addEventListener('load', function () {
        if (req.status === 200) {
            var appearances = JSON.parse(req.responseText);
            var result = {};
            result.champsAppearances = 0;
            result.champsAppearancesyears = [];
            result.einsteinAppearances = 0;
            result.einsteinAppearancesyears = [];

            result.districtChampsAppearances = 0;
            result.districtChampsAppearancesyears = [];
            result.districtEinsteinAppearances = 0;
            result.districtEinsteinAppearancesyears = [];
            result.FOCAppearances = 0;
            result.FOCAppearancesyears = [];
            for (var i = 0; i < appearances.length; i++) {
                //check for district code
                //DISTRICT_CMP = 2
                //DISTRICT_CMP_DIVISION = 5   
                // Ontario (>=2019), Michigan (>=2017), Texas (>=2022), New England (>=2022), 
                // Indiana (>=2022) check for Einstein appearances 
                //appearances.district.abbreviation = "ont"
                //appearances.district.abbreviation = "fim"
                // >=2017 check for Division appearance then Champs appearances
                //test for champs prior to 2001
                if (appearances[i].district !== null) {
                    if (((appearances[i].year >= 2019) && (appearances[i].district.abbreviation === "ont")) || 
                    ((appearances[i].year >= 2017) && (appearances[i].district.abbreviation === "fim")) ||
                    ((appearances[i].year >= 2022) && (appearances[i].district.abbreviation === "ne")) ||
                    ((appearances[i].year >= 2022) && (appearances[i].district.abbreviation === "in")) ||
                    ((appearances[i].year >= 2022) && (appearances[i].district.abbreviation === "tx"))) {
                        if (appearances[i].event_type === 5) {
                            result.districtChampsAppearances += 1;
                            result.districtChampsAppearancesyears.push(appearances[i].year);
                        }
                        if (appearances[i].event_type === 2) {
                            result.districtEinsteinAppearances += 1;
                            result.districtEinsteinAppearancesyears.push(appearances[i].year);
                        }
                    } else {
                        if (appearances[i].event_type === 2) {
                            result.districtChampsAppearances += 1;
                            result.districtChampsAppearancesyears.push(appearances[i].year);
                        }

                    }
                }


                //check for champs Division code
                //CMP_DIVISION = 3
                //CMP_FINALS = 4
                //FOC = 6
                // >=2001 check for Division appearance then Champs appearances
                if (appearances[i].event_type === 6) {
                    result.FOCAppearances += 1;
                    result.FOCAppearancesyears.push(appearances[i].year);
                }
                //test for champs prior to 2001
                if (appearances[i].year < 2001) {
                    if (appearances[i].event_type === 4) {
                        result.champsAppearances += 1;
                        result.champsAppearancesyears.push(appearances[i].year);
                    }
                } else {
                    if (appearances[i].event_type === 3) {
                        result.champsAppearances += 1;
                        result.champsAppearancesyears.push(appearances[i].year);
                    }
                    // TO FIX: mapping out this year's Einstein appearances.
                    // if (appearances[i].event_type === 4 && appearances[i].year < Number(localStorage.currentYear) && inSubdivision()) {
                    if (appearances[i].event_type === 4 ) {
                        result.einsteinAppearances += 1;
                        result.einsteinAppearancesyears.push(appearances[i].year);
                    }

                }
            }
            eventAppearances[String(teamNumber)] = result;

        } else if (req.status === 504) {
            console.log("Appearances Timeout. Trying " + teamNumber + " again");
            let timerTeamNumber = teamNumber;
            setTimeout(function () { getTeamAppearance(timerTeamNumber); }, 10000 + Math.random() * 2000);
        }
    });
    req.send();
}