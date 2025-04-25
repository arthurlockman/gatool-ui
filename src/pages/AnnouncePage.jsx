import Announce from "../components/Announce";
import { Alert, Container } from "react-bootstrap";
import _ from "lodash";
import { rankHighlight } from "../components/HelperFunctions";
import BottomButtons from "../components/BottomButtons";
import TopButtons from "../components/TopButtons";
import { useHotkeys } from "react-hotkeys-hook";
import { useSwipeable } from "react-swipeable";
import moment from "moment";
import NotificationBanner from "components/NotificationBanner";


const paleGreen = "rgba(144, 238, 144, 0.5)"

function AnnouncePage({ selectedEvent, selectedYear, teamList, rankings, communityUpdates, currentMatch, playoffSchedule, qualSchedule, allianceCount, alliances, setAlliances, awardsMenu, showNotesAnnounce, showAwards, showMinorAwards, showSponsors, showMottoes, showChampsStats, timeFormat, eventHighScores, backupTeam, setBackupTeam, nextMatch, previousMatch, setMatchFromMenu, practiceSchedule, eventNamesCY, districtRankings, showDistrictChampsStats, adHocMatch, setAdHocMatch, adHocMode, offlinePlayoffSchedule, swapScreen, autoHideSponsors, hidePracticeSchedule, teamReduction, qualsLength, playoffOnly, getSchedule, usePullDownToUpdate, useSwipe, eventLabel, playoffCountOverride, showInspection, highScoreMode }) {
    const matchesToNotify = _.toInteger((teamList?.teams?.length - teamReduction) / 6);
    if (qualSchedule?.schedule?.schedule?.length || qualSchedule?.schedule?.length) {
    };
    const notification = (currentMatch >= (qualsLength - matchesToNotify) && currentMatch <= (qualsLength) && showInspection) ? { "expiry": moment().add(1, "hour"), "onTime": moment(), "message": "Please remind teams to have their robots reinspected before Playoffs and to send their team rep(s) for Alliance Selection." } : {};

    function updateTeamDetails(station, matchDetails) {
        var team = {}
        var alliance = station.slice(0, station.length - 1);
        var allianceNumber = matchDetails?.teams[_.findIndex(matchDetails?.teams, { "station": `${alliance}1` })]?.alliance;


        if (station.slice(-1) !== "4") {
            team = matchDetails?.teams[_.findIndex(matchDetails?.teams, { "station": station })];
            team = communityUpdates ? _.merge(team,
                teamList?.teams[_.findIndex(teamList?.teams, { "teamNumber": team?.teamNumber })],
                rankings?.ranks[_.findIndex(rankings?.ranks, { "teamNumber": team?.teamNumber })],
                communityUpdates[_.findIndex(communityUpdates, { "teamNumber": team?.teamNumber })]
            ) :
                _.merge(team,
                    teamList?.teams[_.findIndex(teamList?.teams, { "teamNumber": team?.teamNumber })],
                    rankings?.ranks[_.findIndex(rankings?.ranks, { "teamNumber": team?.teamNumber })]
                );
            team.rankStyle = rankHighlight(team?.rank, allianceCount || { "count": 8 });
            team.alliance = alliances?.Lookup[`${team?.teamNumber}`] ? alliances?.Lookup[`${team?.teamNumber}`]?.alliance || null : null;
            team.allianceRole = alliances?.Lookup[`${team?.teamNumber}`] ? alliances?.Lookup[`${team?.teamNumber}`]?.role || null : null;

            var teamDistrictRanks = _.filter(districtRankings?.districtRanks, { "teamNumber": team.teamNumber })[0] || null;
            team.districtRanking = teamDistrictRanks?.rank;
            team.qualifiedDistrictCmp = teamDistrictRanks?.qualifiedDistrictCmp;
            team.qualifiedFirstCmp = teamDistrictRanks?.qualifiedFirstCmp;
        }

        if (station?.slice(-1) === "4") {
            if (inPlayoffs || selectedEvent?.value?.champLevel === "CHAMPS") {

                var playoffTeams = matchDetails?.teams.map((team) => {
                    return { "teamNumber": team?.teamNumber, "alliance": team?.alliance }
                });
                var allianceTeams = allianceNumber ? _.filter(playoffTeams, { "alliance": allianceNumber }).map((o) => { return o.teamNumber }) : [];
                // var allianceMembers = allianceNumber ? _.filter(alliances?.alliances, { "number": Number(allianceNumber.slice(-1)) })[0] : [];
                var allianceMembers = allianceNumber ? _.filter(alliances?.alliances, { "name": allianceNumber })[0] : [];
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
                if (remainingTeam.length > 0 && teamList?.teams?.length > 0) {
                    team = _.merge(team,
                        teamList?.teams[_.findIndex(teamList?.teams, { "teamNumber": remainingTeam[0] })],
                        rankings?.ranks?.length > 0 ? rankings?.ranks[_.findIndex(rankings?.ranks, { "teamNumber": remainingTeam[0] })] : null,
                        communityUpdates?.length > 0 ? communityUpdates[_.findIndex(communityUpdates, { "teamNumber": remainingTeam[0] })] : null
                    );
                    team.rankStyle = rankHighlight(team?.rank, allianceCount || { "count": 8 });
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

    var schedule = [];
    if ((practiceSchedule?.schedule?.schedule?.length > 0 || practiceSchedule?.schedule?.length > 0) && (qualSchedule?.schedule?.length === 0 || qualSchedule?.schedule?.schedule?.length === 0)) {
        schedule = practiceSchedule?.schedule?.schedule || practiceSchedule?.schedule;
    }
    if ((practiceSchedule?.schedule?.schedule?.length > 0 || practiceSchedule?.schedule?.length > 0) && (qualSchedule?.schedule?.length > 0 || qualSchedule?.schedule?.schedule?.length > 0)) {
        var firstMatch = typeof qualSchedule.schedule?.schedule !== "undefined" ? qualSchedule.schedule?.schedule[0] : qualSchedule?.schedule[0]
        if (moment().isBefore(moment(firstMatch.startTime).subtract(20, "minutes")) && !hidePracticeSchedule) {
            schedule = practiceSchedule?.schedule?.schedule || practiceSchedule?.schedule;
        }
    }
    if (offlinePlayoffSchedule?.schedule?.length > 0) {
        schedule = _.concat(schedule, offlinePlayoffSchedule?.schedule);
    }

    if (qualSchedule?.schedule.length > 0) {
        schedule = _.concat(schedule, qualSchedule?.schedule);
    }

    if (playoffSchedule?.schedule?.length > 0) {
        schedule = _.concat(schedule, playoffSchedule?.schedule);
    }

    var matchDetails = (!adHocMode ? schedule[currentMatch - 1] : adHocMatch ?
        {
            description: "Practice Match",
            startTime: null,
            matchNumber: 1,
            field: "Primary",
            tournamentLevel: "Practice",
            teams: [
                { teamNumber: adHocMatch[0]?.teamNumber ? adHocMatch[0]?.teamNumber : null, station: 'Red1', surrogate: false, dq: false },
                { teamNumber: adHocMatch[1]?.teamNumber ? adHocMatch[1]?.teamNumber : null, station: 'Red2', surrogate: false, dq: false },
                { teamNumber: adHocMatch[2]?.teamNumber ? adHocMatch[2]?.teamNumber : null, station: 'Red3', surrogate: false, dq: false },
                { teamNumber: adHocMatch[3]?.teamNumber ? adHocMatch[3]?.teamNumber : null, station: 'Blue1', surrogate: false, dq: false },
                { teamNumber: adHocMatch[4]?.teamNumber ? adHocMatch[4]?.teamNumber : null, station: 'Blue2', surrogate: false, dq: false },
                { teamNumber: adHocMatch[5]?.teamNumber ? adHocMatch[5]?.teamNumber : null, station: 'Blue3', surrogate: false, dq: false }
            ],
            isReplay: false,
            matchVideoLink: null,
            scoreRedFinal: null,
            scoreRedFoul: null,
            scoreRedAuto: null,
            scoreBlueFinal: null,
            scoreBlueFoul: null,
            scoreBlueAuto: null,
            autoStartTime: null,
            actualStartTime: null,
            postResultTime: null,
            winner: {
                winner: null,
                tieWinner: null,
                level: null,
            },
        } : null);

    if (practiceSchedule?.schedule.length > 0 && adHocMatch && (!qualSchedule || qualSchedule?.schedule.length === 0)) {
        if (matchDetails && typeof matchDetails?.teams === "undefined") { matchDetails.teams = adHocMatch }
    };

    var inPlayoffs = (matchDetails?.tournamentLevel === "Playoff" ? true : false);

    const matchMenu = schedule.map((match, index) => {
        var tag = `${match?.description} of ${qualSchedule?.schedule?.length}`;
        if (match?.tournamentLevel === "Playoff" || match?.tournamentLevel === "Practice") {
            tag = match?.description;
        }
        return { "value": index + 1, "label": tag, "color": !_.isNull(match?.scoreRedFinal) ? paleGreen : "" }
    })

    var displayOrder = ["Red1", "Red2", "Red3", "Red4", "Blue1", "Blue2", "Blue3", "Blue4"];
    var teamDetails = [];
    if (teamList && matchDetails) {
        //fill in the team details
        displayOrder.forEach((station) => {
            teamDetails[station] = updateTeamDetails(station, matchDetails)
        })
    }

    if (practiceSchedule?.schedule?.schedule?.length > 0 || practiceSchedule?.schedule?.length > 0) {
        if (!adHocMatch) {
            setAdHocMatch(matchDetails?.teams);
        }
    }


    // eslint-disable-next-line react-hooks/rules-of-hooks
    const swipeHandlers = useSwipe ? useSwipeable(
        {
            onSwipedLeft: () => {
                nextMatch();
            },
            onSwipedRight: () => {
                previousMatch();
            },
            onSwipedDown: () => {
                if (usePullDownToUpdate) {
                    getSchedule();
                }

            },
            preventScrollOnSwipe: true,
        }
    ) : {}

    useHotkeys('right', () => nextMatch(), { scopes: 'matchNavigation' });
    useHotkeys('left', () => previousMatch(), { scopes: 'matchNavigation' });

    return (
        <  >
            {!selectedEvent && <div>
                <Alert variant="warning" >You need to select an event before you can see anything here.</Alert>
            </div>}
            {selectedEvent && (!teamList || teamList?.teams.length === 0) && <div>
                <Alert variant="warning" ><div><img src="loadingIcon.gif" alt="Loading data..." /></div>Awaiting team data for {eventLabel}</Alert>
            </div>}
            {selectedEvent && teamList && (!schedule || schedule?.length === 0) && !adHocMode && <div>
                <Alert variant="warning" ><div><img src="loadingIcon.gif" alt="Loading data..." /></div>Awaiting schedule data for {eventLabel}</Alert>
            </div>}
            {selectedEvent && teamList?.teams.length > 0 && (schedule?.length > 0 || practiceSchedule?.schedule.length > 0 || adHocMode) &&
                <Container fluid {...swipeHandlers}>
                    <TopButtons previousMatch={previousMatch} nextMatch={nextMatch} currentMatch={currentMatch} matchMenu={matchMenu} setMatchFromMenu={setMatchFromMenu} selectedEvent={selectedEvent} matchDetails={matchDetails} timeFormat={timeFormat} inPlayoffs={inPlayoffs} alliances={alliances} setAlliances={setAlliances} rankings={rankings} backupTeam={backupTeam} setBackupTeam={setBackupTeam} teamList={teamList} adHocMatch={adHocMatch} setAdHocMatch={setAdHocMatch} adHocMode={adHocMode} swapScreen={swapScreen} playoffOnly={playoffOnly} eventLabel={eventLabel} />
                    <NotificationBanner notification={notification}></NotificationBanner>
                    {!matchDetails?.description.includes("Bye Match") && <table className={"table table-responsive"}>
                        <thead>
                            <tr key={"header"}>
                                <td>Team #</td>
                                <td>Team Name</td>
                                <td>Organization, Sponsors & Awards</td>
                                <td>Rank</td>
                            </tr>
                        </thead>
                        <tbody>
                            {displayOrder.map((station, index) => {
                                if (!_.isEmpty(teamDetails[station]) && !_.isUndefined(teamDetails[station].teamNumber) && !_.isNull(teamDetails[station].teamNumber) && teamDetails[station].teamNumber > 0) {
                                    return <Announce station={station} team={teamDetails[station]} inPlayoffs={inPlayoffs} key={`${station}${index}`} awardsMenu={awardsMenu} selectedYear={selectedYear} selectedEvent={selectedEvent} showNotesAnnounce={showNotesAnnounce} autoHideSponsors={autoHideSponsors} showAwards={showAwards} showMinorAwards={showMinorAwards} showSponsors={showSponsors} showMottoes={showMottoes} showChampsStats={showChampsStats} eventNamesCY={eventNamesCY} showDistrictChampsStats={showDistrictChampsStats} playoffOnly={playoffOnly} />
                                } else {
                                    if (station.slice(-1) !== "4") {
                                        var allianceColor = _.toLower(station.slice(0, -1));
                                        return (<tr className={`gatool-announce ${allianceColor}Alliance`}>
                                            <td colSpan={4} className={"tbd"}>{adHocMode ? "No team selected" : "TBD"}</td>
                                        </tr>);
                                    } else {
                                        return "";
                                    }
                                }
                            }
                            )}
                        </tbody>
                    </table>}
                    {matchDetails?.description?.includes("Bye Match") && <Alert><h1><b>BYE MATCH</b></h1></Alert>
                    }
                    <BottomButtons previousMatch={previousMatch} nextMatch={nextMatch} matchDetails={matchDetails} playoffSchedule={playoffSchedule} eventHighScores={eventHighScores} alliances={alliances} selectedEvent={selectedEvent} adHocMode={adHocMode} playoffCountOverride={playoffCountOverride} highScoreMode={highScoreMode} />
                </Container>
            }

        </>
    )
}

export default AnnouncePage;