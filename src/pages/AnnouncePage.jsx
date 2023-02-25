import Announce from "../components/Announce";
import { Alert, Container } from "react-bootstrap";
import React from "react";
import _ from "lodash";
import { rankHighlight } from "../components/HelperFunctions";
import BottomButtons from "../components/BottomButtons";
import TopButtons from "../components/TopButtons";


const paleGreen = "rgba(144, 238, 144, 0.5)"

function AnnouncePage({ selectedEvent, selectedYear, teamList, rankings, communityUpdates, currentMatch, setCurrentMatch, playoffSchedule, setPlayoffSchedule, qualSchedule, allianceCount, alliances, setAlliances, getSchedule, getRanks, awardsMenu, showNotes, showAwards, showSponsors, showMottoes, showChampsStats, timeFormat, eventHighScores, backupTeam, setBackupTeam, getWorldStats, nextMatch, previousMatch, setMatchFromMenu, enableScope, disableScope}) {

    function updateTeamDetails(station, matchDetails) {
        var team = {}
        var alliance = station.slice(0, station.length - 1);
        var allianceNumber = matchDetails?.teams[_.findIndex(matchDetails?.teams, { "station": `${alliance}1` })].alliance;
        if (station.slice(-1) !== "4") {
            team = matchDetails?.teams[_.findIndex(matchDetails?.teams, { "station": station })];
            team = _.merge(team,
                teamList?.teams[_.findIndex(teamList?.teams, { "teamNumber": team?.teamNumber })],
                rankings?.ranks[_.findIndex(rankings?.ranks, { "teamNumber": team?.teamNumber })],
                communityUpdates[_.findIndex(communityUpdates, { "teamNumber": team?.teamNumber })]
            );
            team.rankStyle = rankHighlight(team?.rank, allianceCount || 8);
            team.alliance = alliances?.Lookup[`${team?.teamNumber}`]?.alliance || null;
            team.allianceRole = alliances?.Lookup[`${team?.teamNumber}`]?.role || null;
        }

        if (station?.slice(-1) === "4") {
            if (inPlayoffs) {

                var playoffTeams = matchDetails?.teams.map((team) => {
                    return { "teamNumber": team?.teamNumber, "alliance": team?.alliance }
                });
                var allianceTeams = _.filter(playoffTeams, { "alliance": allianceNumber }).map((o) => { return o.teamNumber });
                var allianceMembers = _.filter(alliances?.alliances, { "number": Number(allianceNumber.slice(-1)) })[0];
                var allianceArray = [];
                allianceArray.push(allianceMembers.captain);
                allianceArray.push(allianceMembers.round1);
                allianceArray.push(allianceMembers.round2);
                if (allianceMembers.round3) {
                    allianceArray.push(allianceMembers.round3);
                }
                if (allianceMembers.backup) {
                    allianceArray.push(allianceMembers.backup);
                }

                var remainingTeam = _.difference(allianceArray, allianceTeams);
                if (remainingTeam.length > 0) {
                    team = _.merge(team,
                        teamList?.teams[_.findIndex(teamList?.teams, { "teamNumber": remainingTeam[0] })],
                        rankings?.ranks[_.findIndex(rankings?.ranks, { "teamNumber": remainingTeam[0] })],
                        communityUpdates[_.findIndex(communityUpdates, { "teamNumber": remainingTeam[0] })]
                    );
                    team.rankStyle = rankHighlight(team?.rank, allianceCount || 8);
                    team.alliance = alliances?.Lookup[`${remainingTeam[0]}`]?.alliance || null;
                    team.allianceRole = alliances?.Lookup[`${remainingTeam[0]}`]?.role || null;
                }
            }
        }

        return team;
    }

    var schedule = qualSchedule?.schedule || [];
    var inPlayoffs = false;
    if (playoffSchedule?.schedule?.length > 0) {
        schedule = _.concat(qualSchedule?.schedule, playoffSchedule?.schedule);
    }
    if (currentMatch > qualSchedule?.schedule?.length) {
        inPlayoffs = true;
    }

    const matchDetails = schedule[currentMatch - 1];
    const matchMenu = schedule.map((match, index) => {
        var tag = `${match.description} of ${qualSchedule.schedule.length}`;
        if (match.tournamentLevel === "Playoff") {
            tag = match.description;
        }
        return { "value": index + 1, "label": tag, "color": !_.isNull(match.scoreRedFinal) ? paleGreen : "" }
    })

    var displayOrder = ["Red1", "Red2", "Red3", "Red4", "Blue1", "Blue2", "Blue3", "Blue4"];
    var teamDetails = [];
    if (teamList && matchDetails) {
        //fill in the team details
        displayOrder.forEach((station) => {
            teamDetails[station] = updateTeamDetails(station, matchDetails)
        })
    }


    


    return (
        <Container fluid >
            {!selectedEvent &&  <div>
                <Alert variant="warning" >You need to select an event before you can see anything here.</Alert>
            </div>}
            {selectedEvent && (!teamList || teamList?.teams.length === 0) && <div>
                <Alert variant="warning" ><div><img src="loadingIcon.gif" alt="Loading data..." /></div>Awaiting team data for {selectedEvent.label}</Alert>
            </div>}
            {selectedEvent && teamList && (!schedule || schedule?.length === 0) && <div>
                <Alert variant="warning" ><div><img src="loadingIcon.gif" alt="Loading data..." /></div>Awaiting schedule data for {selectedEvent.label}</Alert>
            </div>}
            {selectedEvent && teamList?.teams.length > 0 && schedule?.length > 0 &&
                <Container fluid>
                    <TopButtons previousMatch={previousMatch} nextMatch={nextMatch} currentMatch={currentMatch} matchMenu={matchMenu} setMatchFromMenu={setMatchFromMenu} selectedEvent={selectedEvent} matchDetails={matchDetails} timeFormat={timeFormat} inPlayoffs={inPlayoffs} alliances={alliances} setAlliances={setAlliances} rankings={rankings} backupTeam={backupTeam} setBackupTeam={setBackupTeam} enableScope={enableScope} disableScope={disableScope}/>
                    <table className={"table table-responsive"}>
                        <tbody>
                            {displayOrder.map((station) => {
                                if (!_.isEmpty(teamDetails[station])) {
                                    return <Announce station={station} team={teamDetails[station]} inPlayoffs={inPlayoffs} key={station} awardsMenu={awardsMenu} selectedYear={selectedYear} selectedEvent={selectedEvent} showNotes={showNotes} showAwards={showAwards} showSponsors={showSponsors} showMottoes={showMottoes} showChampsStats={showChampsStats} />
                                } else {
                                    return ""
                                }
                            }
                            )}
                        </tbody>
                    </table>
                    <BottomButtons previousMatch={previousMatch} nextMatch={nextMatch} matchDetails={matchDetails} playoffSchedule={playoffSchedule}  eventHighScores={eventHighScores}/>
                </Container>
            }

        </Container>
    )
}

export default AnnouncePage;