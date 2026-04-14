import { Row, Col, Button } from "react-bootstrap";
import FoulButtons from "./FoulButtons";
import HighScoresSummary from "./HighScoresSummary";
import { CaretLeftFill, CaretRightFill } from "react-bootstrap-icons";
import PlayoffDetails from "../components/PlayoffDetails";
import { useSettings } from "../contexts/SettingsContext";


function BottomButtons({
  previousMatch,
  nextMatch,
  currentMatch,
  matchDetails,
  playoffSchedule,
  eventHighScores,
  alliances,
  selectedEvent,
  adHocMode,
  playoffCountOverride,
  ftcMode,
  worldStats,
  ftcRegionHighScores,
  ftcLeagueHighScores,
  frcDistrictHighScores,
  selectedYear,
  eventNamesCY,
  districts,
  ftcLeagues,
}) {
  const { showWorldAndStatsOnAnnouncePlayByPlay, highScoreMode } = useSettings();
    var matches = playoffSchedule?.schedule;
    var eventHighScore = eventHighScores?.highscores?.overallqual;
    if (!highScoreMode) {
        if (matchDetails?.tournamentLevel.toLowerCase() === "playoff") {
            eventHighScore = eventHighScores?.highscores?.overallplayoff;
        }
    } else
        if (eventHighScores?.highscores?.overallqual?.score < eventHighScores?.highscores?.overallplayoff?.score) {
            eventHighScore = eventHighScores?.highscores?.overallplayoff;
        }
    const hasEventHighScore = Number(eventHighScore?.score) > 0;


    return (
        <>
            <Row style={{ "paddingTop": "10px" }}>
                <Col xs={"2"} lg={"3"}>
                    {!adHocMode && <Button size="lg" variant="outline-success" className={"gatool-button buttonNoWrap"} onClick={previousMatch}><span className={"d-none d-lg-block"}><CaretLeftFill /> Previous Match</span><span className={"d-block d-lg-none"}><CaretLeftFill /> <CaretLeftFill /></span></Button>}
                </Col>
                {matchDetails?.tournamentLevel.toLowerCase() === "playoff" && <Col xs={hasEventHighScore ? "5" : "8"} lg={hasEventHighScore ? "4" : "6"} className={"playoffDetails"}>
                    <PlayoffDetails matchDetails={matchDetails} alliances={alliances} matches={matches} playoffCountOverride={playoffCountOverride} ftcMode={ftcMode}/>
                </Col>}

                {hasEventHighScore && <Col xs={matchDetails?.tournamentLevel.toLowerCase() !== "playoff" ? "8" : "3"} lg={matchDetails?.tournamentLevel.toLowerCase() !== "playoff" ? "6" : "2"}>
                    <div className="border rounded p-2 h-100 gatool-highscores-summary-panel gatool-highscores-summary--event">
                        <p className="mb-0"><b>{highScoreMode ? 'Event' : matchDetails?.tournamentLevel.toLowerCase() === "playoff" ? 'Playoffs' : 'Quals'} High Score: {eventHighScore?.score}<br />
                            in {eventHighScore?.matchName}<br />
                            ({eventHighScore?.allianceMembers})</b>
                        </p>
                    </div>
                </Col>}

                {matchDetails?.tournamentLevel.toLowerCase() !== "playoff" && !hasEventHighScore && (
                    <Col xs={"8"} lg={"6"}>
                        <h4 className="gatool-awaiting-inline">{currentMatch === 1 ? "Awaiting results from first match" : matchDetails?.description}</h4>
                    </Col>
                )}

                <Col xs={"2"} lg={"3"}>
                    {!adHocMode && <Button size="lg" variant="outline-success" className={"gatool-button buttonNoWrap"} onClick={nextMatch}><span className={"d-none d-lg-block"}>Next Match <CaretRightFill /></span><span className={"d-block d-lg-none"}><CaretRightFill /> <CaretRightFill /></span></Button>}
                </Col>
            </Row>
            {showWorldAndStatsOnAnnouncePlayByPlay !== false && (
              <>
                <Row className="mt-3"><Col /></Row>
                <HighScoresSummary
                worldStats={worldStats}
                ftcRegionHighScores={ftcRegionHighScores}
                ftcLeagueHighScores={ftcLeagueHighScores}
                frcDistrictHighScores={frcDistrictHighScores}
                selectedEvent={selectedEvent}
                selectedYear={selectedYear}
                eventNamesCY={eventNamesCY}
                districts={districts}
                ftcLeagues={ftcLeagues}
              />
              </>
            )}
            <Row><FoulButtons currentYear={selectedEvent?.year} ftcMode={ftcMode}/></Row>
            <Row> <br /><br /><br /></Row>
        </>
    )
}

export default BottomButtons;