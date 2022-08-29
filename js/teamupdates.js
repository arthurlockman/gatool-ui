$("#loadingFeedback").html("Loading team update functions...");

function getTeamUpdates(teamNumber, singleton) {
    "use strict";
    $('#teamDataTabPicker').addClass('alert-danger');
    var req = new XMLHttpRequest();
    req.open('GET', apiURL + 'team/' + teamNumber + '/updates');
    req.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
    req.addEventListener('load', function () {
        if (req.status !== 204) {
            var teamUpdates = JSON.parse(req.responseText);
            var teamData = decompressLocalStorage("teamData" + teamNumber);
            teamData.nameShortLocal = teamUpdates.nameShortLocal;
            teamData.cityStateLocal = teamUpdates.cityStateLocal;
            teamData.topSponsorsLocal = teamUpdates.topSponsorsLocal;
            teamData.sponsorsLocal = teamUpdates.sponsorsLocal;
            teamData.organizationLocal = teamUpdates.organizationLocal;
            teamData.robotNameLocal = teamUpdates.robotNameLocal;
            teamData.awardsLocal = teamUpdates.awardsLocal;
            teamData.teamMottoLocal = teamUpdates.teamMottoLocal || "";
            teamData.teamNotesLocal = teamUpdates.teamNotesLocal || "";
            teamData.teamYearsNoCompeteLocal = teamUpdates.teamYearsNoCompeteLocal;
            teamData.showRobotName = teamUpdates.showRobotName;
            teamData.teamNotes = teamUpdates.teamNotes || "";
            teamData.sayNumber = teamUpdates.sayNumber || "";
            teamData.lastUpdate = (teamUpdates.lastUpdate || "No recent update");
            //teamData.source = teamUpdates.source;
            compressLocalStorage("teamData" + teamNumber, teamData);
        }
        teamUpdateCalls--;
        if ((teamAwardCalls === 0) && (teamUpdateCalls === 0) && (lastSchedulePage)) {
            $('#teamDataTabPicker').removeClass('alert-danger');
            $('#teamDataTabPicker').addClass('alert-success');
            $('#teamloadprogress').hide();
            $('#teamProgressBar').hide();
            teamLoadProgressBar = 0;
            $('#teamloadprogressbar').attr("style", "width:" + (teamLoadProgressBar / teamCountTotal * 100) + "%");
            $('#teamProgressBarLoading').attr("style", "width:" + (teamLoadProgressBar / teamCountTotal * 100) + "%");
            if (singleton) {
                BootstrapDialog.show({
                    message: "Team data loaded from gatool Cloud. Your local data for " + teamNumber + " is now showing data from the <i><b>FIRST</b></i> GA and MC community.",
                    buttons: [{
                        icon: 'glyphicon glyphicon-cloud-download',
                        cssClass: 'btn btn-success col-md-5 col-xs-12 col-sm-12 alertButton',
                        label: 'OK',
                        hotkey: 13, // Enter.
                        title: 'OK',
                        action: function (dialogRef) {
                            dialogRef.close();
                            updateTeamInfo(teamNumber);
                            updateTeamTable();
                        }
                    }]
                });
            } else {
                BootstrapDialog.show({
                    message: "Team data loaded from gatool Cloud. Your local data for " + localStorage.currentEvent + " is now showing data from the <i><b>FIRST</b></i> GA and MC community.",
                    buttons: [{
                        icon: 'glyphicon glyphicon-cloud-download',
                        cssClass: 'btn btn-success col-md-5 col-xs-12 col-sm-12 alertButton',
                        label: 'OK',
                        hotkey: 13, // Enter.
                        title: 'OK',
                        action: function (dialogRef) {
                            dialogRef.close();
                            updateTeamTable();
                        }
                    }]
                });
            }
            //if (Number(localStorage.currentYear) >= 2018) {
            //    getAvatars()
            //}
        }


    });

    req.send();
}

function sendTeamUpdates(teamNumber, singleton) {
    "use strict";
    $('#teamDataTabPicker').addClass('alert-danger');
    var req = new XMLHttpRequest();
    var teamUpdates = {};
    //var teamData = JSON.parse(localStorage["teamData" + teamNumber]);
    var teamData = decompressLocalStorage("teamData" + teamNumber);
    teamUpdates.nameShortLocal = teamData.nameShortLocal;
    teamUpdates.cityStateLocal = teamData.cityStateLocal;
    teamUpdates.topSponsorsLocal = teamData.topSponsorsLocal;
    teamUpdates.sponsorsLocal = teamData.sponsorsLocal;
    teamUpdates.organizationLocal = teamData.organizationLocal;
    teamUpdates.robotNameLocal = teamData.robotNameLocal;
    teamUpdates.awardsLocal = teamData.awardsLocal;
    teamUpdates.teamMottoLocal = teamData.teamMottoLocal;
    teamUpdates.teamNotesLocal = teamData.teamNotesLocal;
    teamUpdates.teamYearsNoCompeteLocal = teamData.teamYearsNoCompeteLocal;
    teamUpdates.showRobotName = teamData.showRobotName;
    teamUpdates.teamNotes = teamData.teamNotes;
    teamUpdates.sayNumber = teamData.sayNumber;
    teamUpdates.lastUpdate = moment().format();
    teamUpdates.source = parseJwt(localStorage.getItem("token")).email;
    req.open('PUT', apiURL + 'team/' + teamNumber + '/updates');
    req.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
    req.addEventListener('load', function () {
        teamUpdateCalls--;
        if ((teamAwardCalls === 0) && (teamUpdateCalls === 0) && (lastSchedulePage)) {
            $('#teamDataTabPicker').removeClass('alert-danger');
            $('#teamDataTabPicker').addClass('alert-success');
            $('#teamloadprogress').hide();
            $('#teamProgressBar').hide();
            teamLoadProgressBar = 0;
            $('#teamloadprogressbar').attr("style", "width:" + (teamLoadProgressBar / teamCountTotal * 100) + "%");
            $('#teamProgressBarLoading').attr("style", "width:" + (teamLoadProgressBar / teamCountTotal * 100) + "%");
            if (singleton) {
                BootstrapDialog.show({
                    message: "Team data saved to gatool Cloud. Thank you for sharing your local data for Team " + teamNumber + " with the <i><b>FIRST</b></i> GA and MC community.",
                    buttons: [{
                        icon: 'glyphicon glyphicon-cloud-upload',
                        label: 'OK',
                        hotkey: 13, // Enter.
                        title: 'OK',
                        action: function (dialogRef) {
                            dialogRef.close();
                        }
                    }]
                });
            } else {
                BootstrapDialog.show({
                    message: "Team data saved to gatool Cloud. Thank you for sharing your local data for " + localStorage.currentEvent + " with the <i><b>FIRST</b></i> GA and MC community.",
                    buttons: [{
                        icon: 'glyphicon glyphicon-cloud-upload',
                        cssClass: "btn btn-success col-md-5 col-xs-12 col-sm-12 alertButton",
                        label: 'OK',
                        hotkey: 13, // Enter.
                        title: 'OK',
                        action: function (dialogRef) {
                            dialogRef.close();
                        }
                    }]
                });
            }

        }
    });
    req.send(JSON.stringify(teamUpdates));
}

function saveTeamUpdates() {
    //This function saves ALL of the team data to gatool Cloud.
    "use strict";
    if (onlineStatus) {
        BootstrapDialog.show({
            type: 'type-info',
            title: '<b>Save Team Updates to the gatool Cloud</b>',
            message: "<b>You are about to save your local updates to the gatool Cloud. <span class='danger'>This will replace data in gatool Cloud with the changes you have made to teams in this event</span>.</b><br>With great power comes great responsibility. To ensure the best experience for everyone, we ask that only the GAs and MCs who are working an event save their changes.<br>If you are not working at an event, <b>please do not save changes between Wednesday and Sunday during the competition season</b>. This policy will allow everyone to benefit from the on-site team's research.<br><b>Are you sure you want to do this?</b>",
            buttons: [{
                icon: 'glyphicon glyphicon-check',
                label: "No, don't save my updates now.",
                hotkey: 78, // "N".
                cssClass: "btn btn-info col-md-5 col-xs-12 col-sm-12 alertButton",
                action: function (dialogRef) {
                    dialogRef.close();
                }
            }, {
                icon: 'glyphicon glyphicon-cloud-upload',
                label: 'Yes, save my updates now.',
                hotkey: 13, // Enter.
                cssClass: 'btn btn-success col-md-5 col-xs-12 col-sm-12 alertButton',
                action: function (dialogRef) {
                    dialogRef.close();
                    BootstrapDialog.show({
                        type: 'type-success',
                        icon: 'glyphicon glyphicon-thumbs-up',
                        title: '<b>Are you sure you want to upload Team Data for ' + localStorage.currentEvent + '?</b>',
                        message: "<span class = 'allianceAnnounceDialog'>Are you sure you want to upload Team Data for " + localStorage.currentEvent + "? You can upload data for a specific team from the Team Data Screen.</span>",
                        buttons: [{
                            icon: 'glyphicon glyphicon-thumbs-down',
                            label: 'No, I do not want to do this now.',
                            hotkey: 78, // "N".
                            cssClass: "btn btn-danger col-md-5 col-xs-12 col-sm-12 alertButton",
                            action: function (dialogRef) {
                                dialogRef.close();
                            }
                        }, {
                            icon: 'glyphicon glyphicon-thumbs-up',
                            cssClass: "btn btn-success col-md-5 col-xs-12 col-sm-12 alertButton",
                            label: 'Yes, I do want to do this now.',
                            hotkey: 13, // Enter.
                            action: function (dialogRef) {
                                dialogRef.close();
                                //var teamData = JSON.parse(localStorage.teamList);
                                var teamData = eventTeamList.slice(0);
                                for (var i = 0; i < teamData.length; i++) {
                                    teamUpdateCalls++;
                                    sendTeamUpdates(teamData[i].teamNumber, false);
                                }

                            }
                        }]
                    });
                }
            }]
        });
    } else {
        BootstrapDialog.show({
            type: 'type-danger',
            title: '<b>Save Team Updates to the gatool Cloud</b>',
            message: 'You appear to be offline. Please connect to the Internet and try again.',
            buttons: [{
                icon: 'glyphicon glyphicon-signal',
                label: "Ok.",
                hotkey: 13, // Enter.
                cssClass: "btn btn-info col-md-5 col-xs-12 col-sm-12 alertButton",
                action: function (dialogRef) {
                    dialogRef.close();
                }
            }]
        });
    }
}

function resetThisAward() {
    //This function saves the team stored in localStorage.currentTeam's data to gatool Cloud.
    "use strict";
    BootstrapDialog.show({
        type: 'type-info',
        title: '<b>Reset Team ' + localStorage.currentTeam + "'s Awards to TIMS values</b>",
        message: "<b>You are about to reset the awards for this team to the values provided by <i><b>FIRST</b></i>.<br><b>Are you sure you want to do this?</b>",
        buttons: [{
            icon: 'glyphicon glyphicon-check',
            label: "No, don't save this reset now.",
            hotkey: 78, // "N".
            cssClass: "btn btn-info col-md-5 col-xs-12 col-sm-12 alertButton",
            action: function (dialogRef) {
                dialogRef.close();
            }
        }, {
            icon: 'glyphicon glyphicon-cloud-upload',
            label: 'Yes, reset the awards now.',
            hotkey: 13, // Enter.
            cssClass: 'bth btn-success col-md-5 col-xs-12 col-sm-12 alertButton',
            action: function (dialogRef) {
                dialogRef.close();
                var teamData = decompressLocalStorage("teamData" + localStorage.currentTeam);
                $("#awardsUpdateLabel").removeClass("bg-success");
                if (teamData.awards !== "") {
                    $("#awardsUpdate").html(teamData.awards);
                    $("#awardsUpdate .awardsDepth1, #awardsUpdate .awardsEventCode, #awardsUpdate .awardsSeparator1, #awardsUpdate .awardsSeparator2").remove();
                } else {
                    $("#awardsUpdate").html("No awards from <i><b>FIRST</b></i> in the last three years.");
                }

            }
        }]
    });
}

function saveTeamUpdate() {
    //This function saves the team stored in localStorage.currentTeam's data to gatool Cloud.
    "use strict";
    if (onlineStatus) {
        BootstrapDialog.show({
            type: 'type-info',
            title: '<b>Save Team ' + localStorage.currentTeam + ' Update to the gatool Cloud</b>',
            message: "<b>You are about to save your local updates to the gatool Cloud. <span class='danger'>This will replace data in gatool Cloud with the changes you have made to this specific team in this event</span>.</b><br>With great power comes great responsibility. To ensure the best experience for everyone, we ask that only the GAs and MCs who are working an event save their changes.<br>If you are not working at an event, <b>please do not save changes between Wednesday and Sunday during the competition season</b>. This policy will allow everyone to benefit from the on-site team's research.<br><b>Are you sure you want to do this?</b>",
            buttons: [{
                icon: 'glyphicon glyphicon-check',
                label: "No, don't save this update now.",
                hotkey: 78, // "N".
                cssClass: "btn btn-info col-md-5 col-xs-12 col-sm-12 alertButton",
                action: function (dialogRef) {
                    dialogRef.close();
                }
            }, {
                icon: 'glyphicon glyphicon-cloud-upload',
                label: 'Yes, save this update now.',
                hotkey: 13, // Enter.
                cssClass: 'bth btn-success col-md-5 col-xs-12 col-sm-12 alertButton',
                action: function (dialogRef) {
                    dialogRef.close();
                    updateTeamInfoDone("true");
                }
            }]
        });
    } else {
        BootstrapDialog.show({
            type: 'type-danger',
            title: '<b>Save Team ' + localStorage.currentTeam + ' Update to the gatool Cloud</b>',
            message: 'You appear to be offline. Please connect to the Internet and try again.',
            buttons: [{
                icon: 'glyphicon glyphicon-signal',
                label: "Ok.",
                hotkey: 13, // Enter.
                cssClass: "btn btn-info col-md-5 col-xs-12 col-sm-12 alertButton",
                action: function (dialogRef) {
                    dialogRef.close();
                }
            }]
        });
    }
}

function loadTeamUpdates() {
    "use strict";
    if (onlineStatus) {
        BootstrapDialog.show({
            type: 'type-warning',
            title: '<b>Load Team Updates from the gatool Cloud</b>',
            message: 'You are about to load team data updates from the gatool Cloud. <b>This will replace your local changes to the teams in this event</b> with the data you <b><i>or others</i></b> may have stored in the gatool Cloud.<br><b>Are you sure you want to do this?</b>',
            buttons: [{
                icon: 'glyphicon glyphicon-check',
                label: "No, I don't want to<br>load updates now.",
                hotkey: 78, // "N".
                cssClass: "btn btn-info col-md-5 col-xs-12 col-sm-12 alertButton",
                action: function (dialogRef) {
                    dialogRef.close();
                }
            }, {
                icon: 'glyphicon glyphicon-cloud-download',
                label: 'Yes, I do want to<br>load updates now.',
                hotkey: 13, // Enter.
                cssClass: 'btn btn-success col-md-5 col-xs-12 col-sm-12 alertButton',
                action: function (dialogRef) {
                    dialogRef.close();
                    //var teamData = JSON.parse(localStorage.teamList);
                    var teamData = eventTeamList.slice(0);

                    for (var i = 0; i < teamData.length; i++) {
                        teamUpdateCalls++;
                        getTeamUpdates(teamData[i].teamNumber, false);
                    }

                }
            }]
        });
    } else {
        BootstrapDialog.show({
            type: 'type-danger',
            title: '<b>Load Team Updates from the gatool Cloud</b>',
            message: 'You appear to be offline. Please connect to the Internet and try again.',
            buttons: [{
                icon: 'glyphicon glyphicon-signal',
                label: "Ok.",
                hotkey: 13, // Enter.
                cssClass: "btn btn-info col-md-5 col-xs-12 col-sm-12 alertButton",
                action: function (dialogRef) {
                    dialogRef.close();
                }
            }]
        });
    }
}

function loadTeamUpdate() {
    "use strict";
    var currentTeam = localStorage.currentTeam;
    if (onlineStatus) {
        BootstrapDialog.show({
            type: 'type-warning',
            title: '<b>Load Team Updates for ' + currentTeam + ' from the gatool Cloud</b>',
            message: 'You are about to load team data updates for Team ' + currentTeam + ' from the gatool Cloud. <b>This will replace your local changes to this team</b> with the data you <b><i>or others</i></b> may have stored in the gatool Cloud.<br><b>Are you sure you want to do this?</b>',
            buttons: [{
                icon: 'glyphicon glyphicon-check',
                label: "No, I don't want to<br>load updates now.",
                hotkey: 78, // "N".
                cssClass: "btn btn-info col-md-5 col-xs-12 col-sm-12 alertButton",
                action: function (dialogRef) {
                    dialogRef.close();
                }
            }, {
                icon: 'glyphicon glyphicon-cloud-download',
                label: 'Yes, I do want to<br>load updates now.',
                hotkey: 13, // Enter.
                cssClass: 'btn btn-success col-md-5 col-xs-12 col-sm-12 alertButton',
                action: function (dialogRef) {
                    dialogRef.close();
                    teamUpdateCalls++;
                    getTeamUpdates(currentTeam, true);
                }
            }]
        });
    } else {
        BootstrapDialog.show({
            type: 'type-danger',
            title: '<b>Load Team Updates for ' + currentTeam + ' from the gatool Cloud</b>',
            message: 'You appear to be offline. Please connect to the Internet and try again.',
            buttons: [{
                icon: 'glyphicon glyphicon-signal',
                label: "Ok.",
                hotkey: 13, // Enter.
                cssClass: "btn btn-info col-md-5 col-xs-12 col-sm-12 alertButton",
                action: function (dialogRef) {
                    dialogRef.close();
                }
            }]
        });
    }
}

