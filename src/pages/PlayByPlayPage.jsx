import { Alert, Container } from "react-bootstrap";
import _ from "lodash";
import { rankHighlight } from "../components/HelperFunctions";
import PlayByPlay from "../components/PlayByPlay";
import BottomButtons from "../components/BottomButtons";
import TopButtons from "../components/TopButtons";
import { useHotkeys } from "react-hotkeys-hook";
import { useSwipeable } from "react-swipeable";
import NotificationBanner from "components/NotificationBanner";
import EventNotificationBanner from "components/EventNotificationBanner";
import moment from "moment";
import useScrollPosition from "../hooks/useScrollPosition";
import { useScrollToTop } from "../contextProviders/ScrollContainerContext";
import { useEffect, useRef } from "react";
import { getAllianceLookupEntry } from "../utils/allianceLookup";
import { matchHasPostedResult } from "../utils/playoffReserveEdits";
import { applyPlayoffStationOrderToMatch } from "../utils/playoffStationOrderEdits";
import { getPlayByPlayDisplayOrder } from "../utils/playByPlayDisplayOrder";

function PlayByPlayPage({
  selectedEvent,
  selectedYear,
  worldStats,
  ftcRegionHighScores,
  ftcLeagueHighScores,
  frcDistrictHighScores,
  districts,
  ftcLeagues,
  eventNamesCY,
  teamList,
  rankings,
  communityUpdates,
  currentMatch,
  playoffSchedule,
  qualSchedule,
  allianceCount,
  alliances,
  setAlliances,
  showNotes,
  showMottoes,
  showQualsStats,
  showQualsStatsQuals,
  swapScreen,
  timeFormat,
  eventHighScores,
  backupTeam,
  setBackupTeam,
  upsertPlayoffReserveOverlay,
  removePlayoffReserveOverlay,
  playoffReserveEdits,
  playoffStationOrderEdits,
  upsertPlayoffStationOrderOverlay,
  removePlayoffStationOrderOverlay,
  nextMatch,
  previousMatch,
  setMatchFromMenu,
  practiceSchedule,
  offlinePlayoffSchedule,
  districtRankings,
  regionalEventDetail,
  getRegionalEventDetail,
  adHocMatch,
  setAdHocMatch,
  adHocMode,
  hidePracticeSchedule,
  teamReduction,
  qualsLength,
  playoffOnly,
  getSchedule,
  usePullDownToUpdate,
  useSwipe,
  eventLabel,
  playoffCountOverride,
  showInspection,
  showWorldAndStatsOnAnnouncePlayByPlay,
  highScoreMode,
  EPA,
  eventMessage,
  eventBell,
  setEventBell,
  ftcMode,
  remapNumberToString,
  remapStringToNumber,
  useScrollMemory,
}) {
  // Remember scroll position for Play by play page
  useScrollPosition('playbyplay', true, false, useScrollMemory);
  const scrollToTop = useScrollToTop();

  const isRegionalEvent = !ftcMode && !selectedEvent?.value?.districtCode;
  const regionalDetailForSeason = regionalEventDetail?.season === selectedYear?.value ? regionalEventDetail : null;
  useEffect(() => {
    if (isRegionalEvent && selectedEvent?.value?.code && !selectedEvent?.value?.code.includes("OFFLINE") && !regionalDetailForSeason && getRegionalEventDetail) {
      getRegionalEventDetail();
    }
  }, [isRegionalEvent, selectedEvent?.value?.code, regionalDetailForSeason, getRegionalEventDetail]);

  // Reset scroll position when navigating to a different match
  // Reset both Announce and Play By Play scroll positions when match changes
  const previousMatchRef = useRef(currentMatch);
  useEffect(() => {
    if (previousMatchRef.current !== currentMatch && previousMatchRef.current !== undefined) {
      scrollToTop();
      // Clear saved scroll position for both Announce and Play By Play when match changes
      sessionStorage.removeItem('scrollPosition_announce');
      sessionStorage.removeItem('scrollPosition_playbyplay');
    }
    previousMatchRef.current = currentMatch;
  }, [currentMatch, scrollToTop]);

  const matchesToNotify = _.toInteger(
    (teamList?.teams?.length - teamReduction) / 6
  );
  const notification =
    currentMatch >= qualsLength - matchesToNotify &&
      currentMatch <= qualsLength &&
      showInspection
      ? {
        expiry: moment().add(1, "hour"),
        onTime: moment(),
        message:
          "Please remind teams to have their robots reinspected before Playoffs and to send their team rep(s) for Alliance Selection.",
      }
      : {};

  var displayOrder = getPlayByPlayDisplayOrder(ftcMode, swapScreen);



  function updateTeamDetails(station, matchDetails) {
    var team = {};
    var alliance = station.slice(0, station.length - 1);
    var allianceNumber =
      matchDetails?.teams[
        _.findIndex(matchDetails?.teams, { station: `${alliance}1` })
      ]?.alliance;
    if (station.slice(-1) !== "4") {
      team =
        matchDetails?.teams[
        _.findIndex(matchDetails?.teams, { station: station })
        ];

      // Reverse-map the team number to get the actual team number for lookups
      const lookupTeamNumber = remapNumberToString(team?.teamNumber);

      team = _.merge(
        team,
        teamList?.teams[
        _.findIndex(teamList?.teams, { teamNumber: team?.teamNumber })
        ],
        rankings?.ranks?.length > 0
          ? rankings?.ranks[
          _.findIndex(rankings?.ranks, { teamNumber: lookupTeamNumber })
          ]
          : null,
        EPA?.length > 0
          ? EPA[_.findIndex(EPA, { teamNumber: team?.teamNumber })]
          : null,
        communityUpdates?.length > 0
          ? communityUpdates[
          _.findIndex(communityUpdates, { teamNumber: team?.teamNumber })
          ]
          : null
      );

      team.rankStyle = rankHighlight(team?.rank, allianceCount || { count: 8 });
      const pbpAllianceEntry = getAllianceLookupEntry(
        alliances?.Lookup,
        team?.teamNumber,
        remapNumberToString
      );
      team.alliance = pbpAllianceEntry?.alliance ?? null;
      team.allianceRole = pbpAllianceEntry?.role ?? null;

      var teamDistrictRanks =
        _.filter(districtRankings?.districtRanks, {
          teamNumber: team?.teamNumber,
        })[0] || null;
      team.districtRanking = teamDistrictRanks?.rank;
      team.qualifiedDistrictCmp = teamDistrictRanks?.qualifiedDistrictCmp;
      team.qualifiedFirstCmp = teamDistrictRanks?.qualifiedFirstCmp;
      // Regional event: set World Champs qualification from regional advancement (main teams Red1–Red3, Blue1–Blue3)
      if (
        !ftcMode &&
        !selectedEvent?.value?.districtCode &&
        selectedEvent?.value?.code &&
        !selectedEvent?.value?.code.includes("OFFLINE") &&
        regionalEventDetail?.teams?.length > 0 &&
        (regionalEventDetail?.season == null || regionalEventDetail?.season === selectedYear?.value || String(regionalEventDetail?.season) === String(selectedYear?.value))
      ) {
        const lookupNumber = remapStringToNumber ? remapStringToNumber(team?.teamNumber) : team?.teamNumber;
        const num = lookupNumber != null ? Number(lookupNumber) : NaN;
        const regionalAdvancement = _.find(regionalEventDetail.teams, (t) =>
          Number(t.teamNumber) === num || String(t.teamNumber) === String(lookupNumber)
        );
        if (regionalAdvancement) {
          team.qualifiedFirstCmp = Boolean(regionalAdvancement.qualifiedFirstCmp);
        }
      }
    }

    if (station.slice(-1) === "4") {
      if (inPlayoffs) {
        var playoffTeams = matchDetails?.teams.map((team) => {
          return { teamNumber: team?.teamNumber, alliance: team.alliance };
        });
        var allianceTeams = _.filter(playoffTeams, {
          alliance: allianceNumber,
        }).map((o) => {
          return o.teamNumber;
        });
        //var allianceMembers = _.filter(alliances?.alliances, { "number": Number(allianceNumber?.slice(-1)) })[0];
        var allianceMembers = allianceNumber
          ? _.filter(alliances?.alliances, { name: allianceNumber })[0]
          : [];
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

        var remainingTeam = _.difference(allianceArray.filter(Boolean), allianceTeams);
        if (remainingTeam.length > 0) {
          // Reverse-map the team number to get the actual team number for lookups
          const lookupRemainingTeam = remainingTeam[0];

          team = _.merge(
            team,
            teamList?.teams[
            _.findIndex(teamList?.teams, { teamNumber: remapStringToNumber(lookupRemainingTeam) })
            ],
            rankings?.ranks[
            _.findIndex(rankings?.ranks, { teamNumber: lookupRemainingTeam })
            ],
            communityUpdates[
            _.findIndex(communityUpdates, { teamNumber: remapStringToNumber(lookupRemainingTeam) })
            ]
          );

          team.rankStyle = rankHighlight(
            team?.rank,
            allianceCount || { count: 8 }
          );
          const pbpRemEntry = getAllianceLookupEntry(
            alliances?.Lookup,
            lookupRemainingTeam,
            remapNumberToString
          );
          team.alliance = pbpRemEntry?.alliance ?? null;
          team.allianceRole = pbpRemEntry?.role ?? null;

          if (selectedEvent?.value?.districtCode) {
            teamDistrictRanks =
              _.filter(districtRankings?.districtRanks, {
                teamNumber: remapStringToNumber(lookupRemainingTeam),
              })[0] || null;
            team.districtRanking = teamDistrictRanks?.rank;
            team.qualifiedDistrictCmp = teamDistrictRanks?.qualifiedDistrictCmp;
            team.qualifiedFirstCmp = teamDistrictRanks?.qualifiedFirstCmp;
          } else if (
            !ftcMode &&
            selectedEvent?.value?.code &&
            !selectedEvent?.value?.code.includes("OFFLINE") &&
            regionalEventDetail?.teams?.length > 0 &&
            (regionalEventDetail?.season == null || regionalEventDetail?.season === selectedYear?.value || String(regionalEventDetail?.season) === String(selectedYear?.value))
          ) {
            const lookupNumber = remapStringToNumber ? remapStringToNumber(lookupRemainingTeam) : lookupRemainingTeam;
            const num = lookupNumber != null ? Number(lookupNumber) : NaN;
            const regionalAdvancement = _.find(regionalEventDetail.teams, (t) =>
              Number(t.teamNumber) === num || String(t.teamNumber) === String(lookupNumber)
            );
            if (regionalAdvancement) {
              team.qualifiedFirstCmp = Boolean(regionalAdvancement.qualifiedFirstCmp);
            }
          }
        }
      }
    }

    return team;
  }

  var schedule = [];
  if (
    (practiceSchedule?.schedule?.schedule?.length > 0 ||
      practiceSchedule?.schedule?.length > 0) &&
    (qualSchedule?.schedule?.length === 0 ||
      qualSchedule?.schedule?.schedule?.length === 0)
  ) {
    schedule =
      practiceSchedule?.schedule?.schedule || practiceSchedule?.schedule;
  }
  if (
    (practiceSchedule?.schedule?.schedule?.length > 0 ||
      practiceSchedule?.schedule?.length > 0) &&
    (qualSchedule?.schedule?.length > 0 ||
      qualSchedule?.schedule?.schedule?.length > 0)
  ) {
    var firstMatch =
      typeof qualSchedule.schedule?.schedule !== "undefined"
        ? qualSchedule.schedule?.schedule[0]
        : qualSchedule?.schedule[0];
    if (
      moment().isBefore(moment(firstMatch.startTime).subtract(20, "minutes")) &&
      !hidePracticeSchedule
    ) {
      schedule =
        practiceSchedule?.schedule?.schedule || practiceSchedule?.schedule;
    }
  }
  if (offlinePlayoffSchedule?.schedule.length > 0) {
    schedule = _.concat(schedule, offlinePlayoffSchedule?.schedule);
  }

  // Handle nested structure (standard from API/uploads) or flat structure (legacy)
  if (qualSchedule?.schedule?.schedule?.length > 0) {
    schedule = _.concat(schedule, qualSchedule?.schedule?.schedule);
  } else if (qualSchedule?.schedule?.length > 0) {
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
      row.alliancePartners = _.filter(match?.teams, function (o) {
        return o.station.substring(0, team.station.length - 1) === row.alliance;
      }).map((q) => {
        return q.teamNumber;
      });
      scores.push(row);
    });
  });

  teamList?.teams.forEach((team, index) => {
    teamList.teams[index].highScore = _.orderBy(
      _.filter(_.filter(scores, "score"), { teamNumber: team?.teamNumber }),
      ["score"],
      ["desc"]
    )[0];
  });

  var matchDetails = !adHocMode
    ? schedule[currentMatch - 1]
    : {
      description: "Practice Match",
      startTime: null,
      matchNumber: 1,
      field: "Primary",
      tournamentLevel: "Practice",
      teams: [
        {
          teamNumber: adHocMatch[0]?.teamNumber
            ? adHocMatch[0]?.teamNumber
            : null,
          station: "Red1",
          surrogate: false,
          dq: false,
        },
        {
          teamNumber: adHocMatch[1]?.teamNumber
            ? adHocMatch[1]?.teamNumber
            : null,
          station: "Red2",
          surrogate: false,
          dq: false,
        },
        {
          teamNumber: adHocMatch[2]?.teamNumber
            ? adHocMatch[2]?.teamNumber
            : null,
          station: "Red3",
          surrogate: false,
          dq: false,
        },
        {
          teamNumber: adHocMatch[3]?.teamNumber
            ? adHocMatch[3]?.teamNumber
            : null,
          station: "Blue1",
          surrogate: false,
          dq: false,
        },
        {
          teamNumber: adHocMatch[4]?.teamNumber
            ? adHocMatch[4]?.teamNumber
            : null,
          station: "Blue2",
          surrogate: false,
          dq: false,
        },
        {
          teamNumber: adHocMatch[5]?.teamNumber
            ? adHocMatch[5]?.teamNumber
            : null,
          station: "Blue3",
          surrogate: false,
          dq: false,
        },
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
    };

  if (
    (practiceSchedule?.schedule?.schedule?.length > 0 ||
      practiceSchedule?.schedule?.length > 0) &&
    adHocMatch &&
    (!qualSchedule ||
      qualSchedule?.schedule?.length === 0 ||
      qualSchedule?.schedule?.schedule?.length === 0)
  ) {
    if (matchDetails?.teams) {
      matchDetails.teams = adHocMatch;
    }
  }

  var inPlayoffs = matchDetails?.tournamentLevel
    ? matchDetails?.tournamentLevel.toLowerCase() === "playoff"
      ? true
      : false
    : false;

  matchDetails = applyPlayoffStationOrderToMatch(
    matchDetails,
    selectedEvent?.value?.code,
    playoffStationOrderEdits,
    ftcMode
  );
  /** Raw match (before station-order overlay) — used by TopButtons reserve dialog so it
   *  works from schedule station assignments, not visual reorder. */
  const rawMatchDetailsForReserve = schedule[currentMatch - 1] ?? null;

  const matchMenu = schedule.map((match, index) => {
    var tag = `${match?.description} of ${qualSchedule?.schedule?.length}`;
    if (
      (match?.tournamentLevel &&
        match?.tournamentLevel?.toLowerCase() === "playoff") ||
      (match?.tournamentLevel &&
        match?.tournamentLevel?.toLowerCase() === "practice")
    ) {
      tag = match?.description;
    }
    return {
      value: index + 1,
      label: tag,
      matchCompleted: matchHasPostedResult(match),
    };
  });

  var teamDetails = [];
  if (teamList && matchDetails && communityUpdates) {
    //fill in the team details
    displayOrder.forEach((station) => {
      teamDetails[station] = updateTeamDetails(station, matchDetails);
    });
  }

  if (practiceSchedule?.schedule.length > 0) {
    if (!adHocMatch) setAdHocMatch(matchDetails?.teams);
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (useSwipe) nextMatch();
    },
    onSwipedRight: () => {
      if (useSwipe) previousMatch();
    },
    onSwipedDown: () => {
      if (usePullDownToUpdate) {
        if (useSwipe) getSchedule();
      }
    },
    preventScrollOnSwipe: useSwipe,
  });

  useHotkeys("right", () => nextMatch(), { scopes: "matchNavigation" });
  useHotkeys("left", () => previousMatch(), { scopes: "matchNavigation" });

  return (
    <Container fluid>
      {!selectedEvent && (
        <div>
          <Alert variant="warning" className="gatool-awaiting-message">
            You need to select an event before you can see anything here.
          </Alert>
        </div>
      )}
      {selectedEvent && (!teamList || teamList?.teams.length === 0) && (
        <div>
          <Alert variant="warning" className="gatool-awaiting-message">
            <div>
              <img src="loadingIcon.gif" alt="Loading data..." />
            </div>
            Awaiting team data for {eventLabel}
          </Alert>
        </div>
      )}
      {selectedEvent &&
        teamList &&
        (!schedule || schedule?.length === 0) &&
        !adHocMode && (
          <div>
            <Alert variant="warning" className="gatool-awaiting-message">
              <div>
                <img src="loadingIcon.gif" alt="Loading data..." />
              </div>
              Awaiting schedule data for {eventLabel}
            </Alert>
          </div>
        )}
      {selectedEvent &&
        teamList?.teams.length > 0 &&
        (schedule?.length > 0 ||
          practiceSchedule?.schedule.length > 0 ||
          adHocMode) && (
          <Container fluid {...swipeHandlers}>
            <TopButtons
              previousMatch={previousMatch}
              nextMatch={nextMatch}
              currentMatch={currentMatch}
              matchMenu={matchMenu}
              setMatchFromMenu={setMatchFromMenu}
              selectedEvent={selectedEvent}
              matchDetails={matchDetails}
              rawMatchDetailsForReserve={rawMatchDetailsForReserve}
              timeFormat={timeFormat}
              inPlayoffs={inPlayoffs}
              alliances={alliances}
              setAlliances={setAlliances}
              rankings={rankings}
              backupTeam={backupTeam}
              setBackupTeam={setBackupTeam}
              upsertPlayoffReserveOverlay={upsertPlayoffReserveOverlay}
              removePlayoffReserveOverlay={removePlayoffReserveOverlay}
              playoffReserveEdits={playoffReserveEdits}
              playoffStationOrderEdits={playoffStationOrderEdits}
              upsertPlayoffStationOrderOverlay={upsertPlayoffStationOrderOverlay}
              removePlayoffStationOrderOverlay={removePlayoffStationOrderOverlay}
              teamList={teamList}
              adHocMatch={adHocMatch}
              setAdHocMatch={setAdHocMatch}
              adHocMode={adHocMode}
              swapScreen={swapScreen}
              playoffOnly={playoffOnly}
              eventLabel={eventLabel}
              ftcMode={ftcMode}
              remapNumberToString={remapNumberToString}
              remapStringToNumber={remapStringToNumber}
            />
            <NotificationBanner
              notification={notification}
            ></NotificationBanner>
            <EventNotificationBanner
              notifications={eventMessage}
              eventBell={eventBell}
              setEventBell={setEventBell}
            ></EventNotificationBanner>
            {!matchDetails?.description?.includes("Bye Match") && (
              <table className={"playByPlayTable"}>
                <tbody>
                  <tr className={"gatool-playbyplay"}>
                    <PlayByPlay
                      station={displayOrder[0]}
                      team={teamDetails[displayOrder[0]]}
                      inPlayoffs={inPlayoffs}
                      key={displayOrder[0]}
                      selectedEvent={selectedEvent}
                      showNotes={showNotes}
                      showMottoes={showMottoes}
                      showQualsStats={showQualsStats}
                      showQualsStatsQuals={showQualsStatsQuals}
                      adHocMode={adHocMode}
                      playoffOnly={playoffOnly}
                      ftcMode={ftcMode}
                      remapNumberToString={remapNumberToString}
                    />
                    <PlayByPlay
                      station={displayOrder[1]}
                      team={teamDetails[displayOrder[1]]}
                      inPlayoffs={inPlayoffs}
                      key={displayOrder[1]}
                      selectedEvent={selectedEvent}
                      showNotes={showNotes}
                      showMottoes={showMottoes}
                      showQualsStats={showQualsStats}
                      showQualsStatsQuals={showQualsStatsQuals}
                      adHocMode={adHocMode}
                      playoffOnly={playoffOnly}
                      ftcMode={ftcMode}
                      remapNumberToString={remapNumberToString}
                    />
                  </tr>
                  <tr className={"gatool-playbyplay"}>
                    <PlayByPlay
                      station={displayOrder[2]}
                      team={teamDetails[displayOrder[2]]}
                      inPlayoffs={inPlayoffs}
                      key={displayOrder[2]}
                      selectedEvent={selectedEvent}
                      showNotes={showNotes}
                      showMottoes={showMottoes}
                      showQualsStats={showQualsStats}
                      showQualsStatsQuals={showQualsStatsQuals}
                      adHocMode={adHocMode}
                      playoffOnly={playoffOnly}
                      ftcMode={ftcMode}
                      remapNumberToString={remapNumberToString}
                    />
                    <PlayByPlay
                      station={displayOrder[3]}
                      team={teamDetails[displayOrder[3]]}
                      inPlayoffs={inPlayoffs}
                      key={displayOrder[3]}
                      selectedEvent={selectedEvent}
                      showNotes={showNotes}
                      showMottoes={showMottoes}
                      showQualsStats={showQualsStats}
                      showQualsStatsQuals={showQualsStatsQuals}
                      adHocMode={adHocMode}
                      playoffOnly={playoffOnly}
                      ftcMode={ftcMode}
                      remapNumberToString={remapNumberToString}
                    />
                  </tr>
                  {(!ftcMode || (inPlayoffs &&ftcMode && selectedEvent?.value?.champLevel === "CHAMPS")) && (
                    <tr className={"gatool-playbyplay"}>
                      <PlayByPlay
                        station={displayOrder[4]}
                        team={teamDetails[displayOrder[4]]}
                        inPlayoffs={inPlayoffs}
                        key={displayOrder[4]}
                        selectedEvent={selectedEvent}
                        showNotes={showNotes}
                        showMottoes={showMottoes}
                        showQualsStats={showQualsStats}
                        showQualsStatsQuals={showQualsStatsQuals}
                        adHocMode={adHocMode}
                        playoffOnly={playoffOnly}
                        ftcMode={ftcMode}
                        remapNumberToString={remapNumberToString}
                      />
                      <PlayByPlay
                        station={displayOrder[5]}
                        team={teamDetails[displayOrder[5]]}
                        inPlayoffs={inPlayoffs}
                        key={displayOrder[5]}
                        selectedEvent={selectedEvent}
                        showNotes={showNotes}
                        showMottoes={showMottoes}
                        showQualsStats={showQualsStats}
                        showQualsStatsQuals={showQualsStatsQuals}
                        adHocMode={adHocMode}
                        playoffOnly={playoffOnly}
                        ftcMode={ftcMode}
                        remapNumberToString={remapNumberToString}
                      />
                    </tr>
                  )}
                  {((inPlayoffs && !ftcMode) ||
                    selectedEvent?.value?.champLevel === "CHAMPS") &&
                    (!_.isEmpty(teamDetails["Red4"]) ||
                      !_.isEmpty(teamDetails["Blue4"])) && (
                      <tr className={"gatool-playbyplay"}>
                        <PlayByPlay
                          station={displayOrder[6]}
                          team={_.isEmpty(teamDetails[displayOrder[6]]) ? null : teamDetails[displayOrder[6]]}
                          inPlayoffs={inPlayoffs}
                          key={displayOrder[6]}
                          selectedEvent={selectedEvent}
                          showNotes={showNotes}
                          showMottoes={showMottoes}
                          showQualsStats={showQualsStats}
                          showQualsStatsQuals={showQualsStatsQuals}
                          adHocMode={adHocMode}
                          playoffOnly={playoffOnly}
                          ftcMode={ftcMode}
                          remapNumberToString={remapNumberToString}
                        />
                        <PlayByPlay
                          station={displayOrder[7]}
                          team={_.isEmpty(teamDetails[displayOrder[7]]) ? null : teamDetails[displayOrder[7]]}
                          inPlayoffs={inPlayoffs}
                          key={displayOrder[7]}
                          selectedEvent={selectedEvent}
                          showNotes={showNotes}
                          showMottoes={showMottoes}
                          showQualsStats={showQualsStats}
                          showQualsStatsQuals={showQualsStatsQuals}
                          adHocMode={adHocMode}
                          playoffOnly={playoffOnly}
                          ftcMode={ftcMode}
                          remapNumberToString={remapNumberToString}
                        />
                      </tr>
                    )}
                </tbody>
              </table>
            )}
            {matchDetails?.description?.includes("Bye Match") && (
              <Alert>
                <h1>
                  <b>BYE MATCH</b>
                </h1>
              </Alert>
            )}
            <BottomButtons
              previousMatch={previousMatch}
              nextMatch={nextMatch}
              currentMatch={currentMatch}
              matchDetails={matchDetails}
              playoffSchedule={playoffSchedule}
              eventHighScores={eventHighScores}
              alliances={alliances}
              selectedEvent={selectedEvent}
              adHocMode={adHocMode}
              playoffCountOverride={playoffCountOverride}
              showWorldAndStatsOnAnnouncePlayByPlay={showWorldAndStatsOnAnnouncePlayByPlay}
              highScoreMode={highScoreMode}
              ftcMode={ftcMode}
              worldStats={worldStats}
              ftcRegionHighScores={ftcRegionHighScores}
              ftcLeagueHighScores={ftcLeagueHighScores}
              frcDistrictHighScores={frcDistrictHighScores}
              selectedYear={selectedYear}
              eventNamesCY={eventNamesCY}
              districts={districts}
              ftcLeagues={ftcLeagues}
            />
          </Container>
        )}
    </Container>
  );
}

export default PlayByPlayPage;
