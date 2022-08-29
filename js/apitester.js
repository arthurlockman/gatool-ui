var schedule = [];
var playoffSchedule = [];
var year = findGetParameter("year") || 2022;
var eventCode = findGetParameter("event") || "";

$(document).ready(function () {
	if (eventCode) {
		getScoutingDataNew();
	}
});

function getScoutingDataNew() {
	let options = {
		method: 'GET',
		headers: {
			"Authorization": "Bearer " + localStorage.getItem("token")
		}
	}
	eventCode = $("#eventCodeInput").val() || findGetParameter("event");
	year = $("#yearInput").val() || findGetParameter("year");
	$("#apiResponse").html(`Fetching data for ${eventCode} in ${year}`);
	$("#year").html(year);
	
	//get quals schedule
	fetch("https://www.gatool.org/api/" + year + "/schedule/" + eventCode + "/qual?returnschedule=true", options)
		.then(response => response.json())
		.then(data => {
			schedule = data.Schedule;
			if (schedule.length > 0) {
				var lastMatch = 0;
				for (match of schedule) {
					if (match.postResultTime) {
						lastMatch = match.matchNumber;
					}
				}
				// now get the score details for the matches
				fetch("https://www.gatool.org/api/" + year + '/scores/' + eventCode + "/qual/1/" + lastMatch + "/", options)
					.then(scores => scores.json())
					.then(scoreData => {
						for (score of scoreData.MatchScores) {
							schedule[score.matchNumber - 1].matchData = score;
						}
					}).then(
						//get the playoff schedule
						fetch("https://www.gatool.org/api/" + year + "/schedule/" + eventCode + "/playoff?returnschedule=true", options)
							.then(response => response.json())
							.then(data => {
								playoffSchedule = data.Schedule;
								if (playoffSchedule.length > 0) {
									var lastMatch = 0;
									for (match of schedule) {
										if (match.postResultTime) {
											lastMatch = match.matchNumber;
										}
									}
									fetch("https://www.gatool.org/api/" + year + '/scores/' + eventCode + "/playoff/1/" + lastMatch + "/", options)
										.then(scores => scores.json())
										.then(scoreData => {
											for (const [index, score] of scoreData.MatchScores.entries()) {
												playoffSchedule[index].matchData = score;
											}
											exportScoreData(year, eventCode);
										})
										.catch(err => {
											$("#apiResponse").html(`No Playoff Scores for ${eventCode} in ${year}. Generating Excel.`);
											exportScoreData(year, eventCode);
										});
								} else {
									$("#apiResponse").html(`We have a Quals schedule, but no Playoff Schedule for ${eventCode} in ${year}. Generating Excel.`);
									exportScoreData(year, eventCode);
								}
							})
							.catch(err => {
								$("#apiResponse").html(`No Playoff Schedule for ${eventCode} in ${year}. Generating Excel.`);
								exportScoreData(year, eventCode);
							})
					)
					.catch(err => {
						$("#apiResponse").html(`No Quals Scores for ${eventCode} in ${year}. Generating Excel.`);
						exportScoreData(year, eventCode);
					});
			} else {
				$("#apiResponse").html(`No Quals Schedule for ${eventCode} in ${year}.`);
			}
		})
		.catch(err => {
			$("#apiResponse").html(err);
		});


}



function exportScoreData(year, eventCode) {
	//var elt = document.getElementById("teamsTable");
	//var wb = XLSX.utils.table_to_book(elt, {cellHTML:true},{sheet:"Team Table"});
	/* create new workbook */
	var data = [];
	var record = {};
	var keys = [];
	var workbook = XLSX.utils.book_new();
	var exportedSchedule = schedule.concat(playoffSchedule);

	//Add the Schedule to the worksheet   
	//console.log(data);
	for (match of exportedSchedule) {
		record = {};
		keys = Object.keys(match);
		for (key of keys) {
			if (key == "matchData") {
				record["matchLevel"] = match.matchData.matchLevel;
				for (alliance of match.matchData.alliances) {
					allianceKeys = keys = Object.keys(alliance);
					for (allianceKey of allianceKeys) {
						if (allianceKey !== "alliance") {
							record[alliance.alliance + allianceKey] = alliance[allianceKey];
						}
					}
				}
				//fill in alliance match data
			} else if (key == "teams") {
				for (team of match.teams) {
					record[team.station] = team.teamNumber;
					record[team.station + "dq"] = team.dq;
					record[team.station + "surrogate"] = team.surrogate;
				}
			} else {
				record[key] = match[key];
			}

		}
		data.push(record);

	}
	//console.log(data2);
	ws = XLSX.utils.json_to_sheet(data, { cellHTML: "true" });
	XLSX.utils.book_append_sheet(workbook, ws, "schedule");


	XLSX.write(workbook, { bookType: "xlsx", bookSST: true, type: 'base64' });
	XLSX.writeFile(workbook, "scores_" + year + "_" + eventCode + moment().format('MMDDYYYY_HHmmss') + ".xlsx");
	$("#apiResponse").html(JSON.stringify(data));

}

function findGetParameter(parameterName) {
	var result = null,
		tmp = [];
	var items = location.search.substring(1).split("&");
	for (var index = 0; index < items.length; index++) {
		tmp = items[index].split("=");
		if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
	}
	return result;
}