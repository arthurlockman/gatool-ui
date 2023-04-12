import { Alert, Container } from "react-bootstrap";
import _ from "lodash";
import { rankHighlight } from "../components/HelperFunctions";
import PlayByPlay from "../components/PlayByPlay";
import BottomButtons from "../components/BottomButtons";
import TopButtons from "../components/TopButtons";
import { useHotkeys } from "react-hotkeys-hook";
import { useSwipeable } from "react-swipeable";

const paleGreen = "rgba(144, 238, 144, 0.5)"


function PlayByPlayPage({ selectedEvent, selectedYear, teamList, rankings, communityUpdates, currentMatch, playoffSchedule, qualSchedule, allianceCount, alliances, setAlliances, showNotes, showMottoes, showQualsStats, showQualsStatsQuals, swapScreen, timeFormat, eventHighScores, backupTeam, setBackupTeam, nextMatch, previousMatch, setMatchFromMenu, practiceSchedule, districtRankings }) {
    var displayOrder = ["Blue1", "Red3", "Blue2", "Red2", "Blue3", "Red1", "Blue4", "Red4"];
    if (swapScreen === true) { displayOrder = ["Red3", "Blue1", "Red2", "Blue2", "Red1", "Blue3", "Red4", "Blue4"] }

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

            var teamDistrictRanks = _.filter(districtRankings?.districtRanks, { "teamNumber": team.teamNumber })[0] || null;
            team.districtRanking = teamDistrictRanks?.rank;
            team.qualifiedDistrictCmp = teamDistrictRanks?.qualifiedDistrictCmp;
            team.qualifiedFirstCmp = teamDistrictRanks?.qualifiedFirstCmp;

        }

        if (station.slice(-1) === "4") {
            if (inPlayoffs) {

                var playoffTeams = matchDetails?.teams.map((team) => {
                    return { "teamNumber": team?.teamNumber, "alliance": team.alliance }
                });
                var allianceTeams = _.filter(playoffTeams, { "alliance": allianceNumber }).map((o) => { return o.teamNumber });
                var allianceMembers = _.filter(alliances?.alliances, { "number": Number(allianceNumber?.slice(-1)) })[0];
                var allianceArray = [];
                allianceArray.push(allianceMembers?.captain);
                allianceArray.push(allianceMembers?.round1);
                allianceArray.push(allianceMembers?.round2);
                if (allianceMembers?.round3) {
                    allianceArray.push(allianceMembers?.round3);
                }
                if (allianceMembers?.backup) {
                    allianceArray.push(allianceMembers?.backup);
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

                    teamDistrictRanks = _.filter(districtRankings?.districtRanks, { "teamNumber": team.teamNumber })[0] || null;
                    team.districtRanking = teamDistrictRanks?.rank;
                    team.qualifiedDistrictCmp = teamDistrictRanks?.qualifiedDistrictCmp;
                    team.qualifiedFirstCmp = teamDistrictRanks?.qualifiedFirstCmp;
                }
            }
        }

        return team;
    }

    var schedule = practiceSchedule?.schedule || [];
    if (qualSchedule?.schedule.length > 0) {
        schedule = _.concat(schedule, qualSchedule?.schedule);
    }

    if (playoffSchedule?.schedule?.length > 0) {
        schedule = _.concat(schedule, playoffSchedule?.schedule);
    }



    var scores = [];
    _.forEach(schedule, (match) => {
        _.forEach(match?.teams, (team) => {
            var row = {};
            row.teamNumber = team.teamNumber;
            row.alliance = team.station.substring(0, team.station.length - 1);
            row.score = match[`score${row.alliance}Final`];
            row.level = match.level;
            row.description = match.description;
            row.alliancePartners = _.filter(match.teams, function (o) { return o.station.substring(0, team.station.length - 1) === row.alliance }).map((q) => {
                return q.teamNumber;
            })
            scores.push(row);
        })
    })

    teamList?.teams.forEach((team, index) => {
        teamList.teams[index].highScore = _.orderBy(_.filter(_.filter(scores, "score"), { "teamNumber": team?.teamNumber }), ["score"], ["desc"])[0];
    }
    )

    var matchDetails = schedule[currentMatch - 1];
    var inPlayoffs = (matchDetails?.tournamentLevel === "Playoff" ? true : false)
    const matchMenu = schedule.map((match, index) => {
        var tag = `${match?.description} of ${qualSchedule?.schedule?.length}`;
        if (match?.tournamentLevel === "Playoff" || match?.tournamentLevel === "Practice") {
            tag = match?.description;
        }
        return { "value": index + 1, "label": tag, "color": !_.isNull(match?.scoreRedFinal) ? paleGreen : "" }
    })

    var teamDetails = [];
    if (teamList && matchDetails) {
        //fill in the team details
        displayOrder.forEach((station) => {
            teamDetails[station] = updateTeamDetails(station, matchDetails)
        })
    }
    const swipeHandlers = useSwipeable(
        {
            onSwipedLeft: () => {
                nextMatch();
            },
            onSwipedRight: () => {
                previousMatch();
            },
            preventScrollOnSwipe: true,
        }
    )

    useHotkeys('right', () => nextMatch(), { scopes: 'matchNavigation' });
    useHotkeys('left', () => previousMatch(), { scopes: 'matchNavigation' });

    return (

        <Container fluid>
            {!selectedEvent && <div>
                <Alert variant="warning" >You need to select an event before you can see anything here.</Alert>
            </div>}
            {selectedEvent && (!teamList || teamList?.teams.length === 0) && <div>
                <Alert variant="warning" ><div><img src="loadingIcon.gif" alt="Loading data..." /></div>Awaiting team data for {selectedEvent.label}</Alert>
            </div>}
            {selectedEvent && teamList && (!schedule || schedule?.length === 0) && <div>
                <Alert variant="warning" ><div><img src="loadingIcon.gif" alt="Loading data..." /></div>Awaiting schedule data for {selectedEvent.label}</Alert>
            </div>}
            {selectedEvent && teamList?.teams.length > 0 && schedule?.length > 0 &&
                <Container fluid {...swipeHandlers}>
                    <TopButtons previousMatch={previousMatch} nextMatch={nextMatch} currentMatch={currentMatch} matchMenu={matchMenu} setMatchFromMenu={setMatchFromMenu} selectedEvent={selectedEvent} matchDetails={matchDetails} timeFormat={timeFormat} inPlayoffs={inPlayoffs} alliances={alliances} setAlliances={setAlliances} rankings={rankings} backupTeam={backupTeam} setBackupTeam={setBackupTeam} />
                    <table className={"playByPlayTable"}>
                        <tbody>
                            <tr className={"gatool-playbyplay"}>
                                <PlayByPlay station={displayOrder[0]} team={teamDetails[displayOrder[0]]} inPlayoffs={inPlayoffs} key={displayOrder[0]} selectedYear={selectedYear} selectedEvent={selectedEvent} showNotes={showNotes} showMottoes={showMottoes} showQualsStats={showQualsStats} showQualsStatsQuals={showQualsStatsQuals} />
                                <PlayByPlay station={displayOrder[1]} team={teamDetails[displayOrder[1]]} inPlayoffs={inPlayoffs} key={displayOrder[1]} selectedYear={selectedYear} selectedEvent={selectedEvent} showNotes={showNotes} showMottoes={showMottoes} showQualsStats={showQualsStats} showQualsStatsQuals={showQualsStatsQuals} />
                            </tr>
                            <tr className={"gatool-playbyplay"}>
                                <PlayByPlay station={displayOrder[2]} team={teamDetails[displayOrder[2]]} inPlayoffs={inPlayoffs} key={displayOrder[2]} selectedYear={selectedYear} selectedEvent={selectedEvent} showNotes={showNotes} showMottoes={showMottoes} showQualsStats={showQualsStats} showQualsStatsQuals={showQualsStatsQuals} />
                                <PlayByPlay station={displayOrder[3]} team={teamDetails[displayOrder[3]]} inPlayoffs={inPlayoffs} key={displayOrder[3]} selectedYear={selectedYear} selectedEvent={selectedEvent} showNotes={showNotes} showMottoes={showMottoes} showQualsStats={showQualsStats} showQualsStatsQuals={showQualsStatsQuals} />
                            </tr>
                            <tr className={"gatool-playbyplay"}>
                                <PlayByPlay station={displayOrder[4]} team={teamDetails[displayOrder[4]]} inPlayoffs={inPlayoffs} key={displayOrder[4]} selectedYear={selectedYear} selectedEvent={selectedEvent} showNotes={showNotes} showMottoes={showMottoes} showQualsStats={showQualsStats} showQualsStatsQuals={showQualsStatsQuals} />
                                <PlayByPlay station={displayOrder[5]} team={teamDetails[displayOrder[5]]} inPlayoffs={inPlayoffs} key={displayOrder[5]} selectedYear={selectedYear} selectedEvent={selectedEvent} showNotes={showNotes} showMottoes={showMottoes} showQualsStats={showQualsStats} showQualsStatsQuals={showQualsStatsQuals} />
                            </tr>
                            {inPlayoffs && (!_.isEmpty(teamDetails["Red4"]) || !_.isEmpty(teamDetails["Blue4"])) &&
                                <tr className={"gatool-playbyplay"}>
                                    <PlayByPlay station={displayOrder[6]} team={teamDetails[displayOrder[6]]} inPlayoffs={inPlayoffs} key={displayOrder[6]} selectedYear={selectedYear} selectedEvent={selectedEvent} showNotes={showNotes} showMottoes={showMottoes} showQualsStats={showQualsStats} showQualsStatsQuals={showQualsStatsQuals} />
                                    <PlayByPlay station={displayOrder[7]} team={teamDetails[displayOrder[7]]} inPlayoffs={inPlayoffs} key={displayOrder[7]} selectedYear={selectedYear} selectedEvent={selectedEvent} showNotes={showNotes} showMottoes={showMottoes} showQualsStats={showQualsStats} showQualsStatsQuals={showQualsStatsQuals} />
                                </tr>}
                        </tbody>
                    </table>
                    <BottomButtons previousMatch={previousMatch} nextMatch={nextMatch} matchDetails={matchDetails} playoffSchedule={playoffSchedule} eventHighScores={eventHighScores} alliances={alliances} selectedEvent={selectedEvent} />
                </Container>}
        </Container>
    )
}

export default PlayByPlayPage;