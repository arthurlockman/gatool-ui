import { Alert, Container, Row, Col } from "react-bootstrap";
import StatsMatch from "../components/StatsMatch";
import _ from "lodash";

function StatsPage({
  worldStats,
  selectedEvent,
  eventHighScores,
  eventNamesCY,
  eventLabel,
  districts,
  selectedYear,
  ftcMode,
  ftcRegionHighScores,
}) {
  const eventDistrict = _.filter(districts, {
    value: selectedEvent?.value?.districtCode,
  })[0];
  const hasAnyStats =
    worldStats ||
    eventHighScores ||
    ftcRegionHighScores;
  const isFTC = !!ftcMode;
  const ftcRegionLabel = selectedEvent?.value?.regionCode
    ? `Region ${selectedEvent.value.regionCode}`
    : "Region";

  return (
    <Container fluid>
      {!selectedEvent && (
        <div>
          <Alert variant="warning">
            You need to select an event before you can see anything here.
          </Alert>
        </div>
      )}
      {selectedEvent && !hasAnyStats && (
        <div>
          <Alert variant="warning">
            <Alert variant="warning">
              <div>
                <img src="loadingIcon.gif" alt="Loading data..." />
              </div>
              Awaiting stats data for {eventLabel}
            </Alert>
          </Alert>
        </div>
      )}
      {selectedEvent && hasAnyStats && (
        <Container fluid>
          <Row>
            {/* World High Scores (FRC and FTC use same endpoint: {{apiBase}}/{{season}}/highscores) */}
            {worldStats && <Col xs={"12"} sm={((selectedEvent?.value?.districtCode && !isFTC) || (isFTC && ftcRegionHighScores)) ? "4" : "6"}>
              <table className="table table-condensed gatool-highScores-Table gatool-worldHighScores">
                <thead>
                  <tr>
                    <td className={"statsMatchHeader"} style={{ backgroundColor: "#f2dede" }} colSpan={2}>
                      World High Scores {worldStats?.year}
                    </td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ backgroundColor: "#f2dede" }}>Qualification</td>
                    <td style={{ backgroundColor: "#f2dede" }}>Playoff</td>
                  </tr>
                  <tr>
                    <StatsMatch
                      highScores={worldStats?.highscores}
                      matchType={`${selectedYear.value}penaltyFreequal`}
                      matchName={"No penalties in match"}
                      eventNamesCY={eventNamesCY}
                      tableType={"world"}
                    />
                    <StatsMatch
                      highScores={worldStats?.highscores}
                      matchType={`${selectedYear.value}penaltyFreeplayoff`}
                      matchName={"No penalties in match"}
                      eventNamesCY={eventNamesCY}
                      tableType={"world"}
                    />
                  </tr>
                  <tr>
                    <StatsMatch
                      highScores={worldStats?.highscores}
                      matchType={`${selectedYear.value}TBAPenaltyFreequal`}
                      matchName={"No penalties to winner"}
                      eventNamesCY={eventNamesCY}
                      tableType={"world"}
                    />
                    <StatsMatch
                      highScores={worldStats?.highscores}
                      matchType={`${selectedYear.value}TBAPenaltyFreeplayoff`}
                      matchName={"No penalties to winner"}
                      eventNamesCY={eventNamesCY}
                      tableType={"world"}
                    />
                  </tr>
                  <tr>
                    <StatsMatch
                      highScores={worldStats?.highscores}
                      matchType={`${selectedYear.value}offsettingqual`}
                      matchName={"Offsetting penalties"}
                      eventNamesCY={eventNamesCY}
                      tableType={"world"}
                    />
                    <StatsMatch
                      highScores={worldStats?.highscores}
                      matchType={`${selectedYear.value}offsettingplayoff`}
                      matchName={"Offsetting penalties"}
                      eventNamesCY={eventNamesCY}
                      tableType={"world"}
                    />
                  </tr>
                  <tr>
                    <StatsMatch
                      highScores={worldStats?.highscores}
                      matchType={`${selectedYear.value}overallqual`}
                      matchName={"Incl. penalties"}
                      eventNamesCY={eventNamesCY}
                      tableType={"world"}
                    />
                    <StatsMatch
                      highScores={worldStats?.highscores}
                      matchType={`${selectedYear.value}overallplayoff`}
                      matchName={"Incl. penalties"}
                      eventNamesCY={eventNamesCY}
                      tableType={"world"}
                    />
                  </tr>
                </tbody>
              </table>
            </Col>}
            {/* FRC District High Scores */}
            {selectedEvent?.value?.districtCode && !isFTC && (
              <Col xs={"12"} sm={"4"}>
                <table className="table table-condensed gatool-highScores-Table gatool-districtHighScores">
                  <thead>
                    <tr>
                      <td className={"statsMatchHeader"} colSpan={2} style={{ backgroundColor: "#fff5ce" }}>
                        {eventDistrict?.label} High Scores {worldStats?.year}
                      </td>
                    </tr>
                  </thead>
                  <tbody>
                  <tr>
                    <td style={{ backgroundColor: "#fff5ce" }}>Qualification</td>
                    <td style={{ backgroundColor: "#fff5ce" }}>Playoff</td>
                  </tr>
                    <tr>
                      <StatsMatch
                        highScores={worldStats?.highscores}
                        matchType={`${selectedYear.value}District${selectedEvent?.value?.districtCode}penaltyFreequal`}
                        matchName={"No penalties in match"}
                        eventNamesCY={eventNamesCY}
                        tableType={"district"}
                      />
                      <StatsMatch
                        highScores={worldStats?.highscores}
                        matchType={`${selectedYear.value}District${selectedEvent?.value?.districtCode}penaltyFreeplayoff`}
                        matchName={"No penalties in match"}
                        eventNamesCY={eventNamesCY}
                        tableType={"district"}
                      />
                    </tr>
                    <tr>
                      <StatsMatch
                        highScores={worldStats?.highscores}
                        matchType={`${selectedYear.value}District${selectedEvent?.value?.districtCode}TBAPenaltyFreequal`}
                        matchName={"No penalties to winner"}
                        eventNamesCY={eventNamesCY}
                        tableType={"district"}
                      />
                      <StatsMatch
                        highScores={worldStats?.highscores}
                        matchType={`${selectedYear.value}District${selectedEvent?.value?.districtCode}TBAPenaltyFreeplayoff`}
                        matchName={"No penalties to winner"}
                        eventNamesCY={eventNamesCY}
                        tableType={"district"}
                      />
                    </tr>
                    <tr>
                      <StatsMatch
                        highScores={worldStats?.highscores}
                        matchType={`${selectedYear.value}District${selectedEvent?.value?.districtCode}offsettingqual`}
                        matchName={"Offsetting penalties"}
                        eventNamesCY={eventNamesCY}
                        tableType={"district"}
                      />
                      <StatsMatch
                        highScores={worldStats?.highscores}
                        matchType={`${selectedYear.value}District${selectedEvent?.value?.districtCode}offsettingplayoff`}
                        matchName={"Offsetting penalties"}
                        eventNamesCY={eventNamesCY}
                        tableType={"district"}
                      />
                    </tr>
                    <tr>
                      <StatsMatch
                        highScores={worldStats?.highscores}
                        matchType={`${selectedYear.value}District${selectedEvent?.value?.districtCode}overallqual`}
                        matchName={"Incl. penalties"}
                        eventNamesCY={eventNamesCY}
                        tableType={"district"}
                      />
                      <StatsMatch
                        highScores={worldStats?.highscores}
                        matchType={`${selectedYear.value}District${selectedEvent?.value?.districtCode}overallplayoff`}
                        matchName={"Incl. penalties"}
                        eventNamesCY={eventNamesCY}
                        tableType={"district"}
                      />
                    </tr>
                  </tbody>
                </table>
              </Col>
            )}
            {/* FTC Region High Scores */}
            {ftcRegionHighScores && isFTC && (
              <Col xs={"12"} sm={"4"}>
                <table className="table table-condensed gatool-highScores-Table gatool-districtHighScores">
                  <thead>
                    <tr>
                      <td className={"statsMatchHeader"} colSpan={2} style={{ backgroundColor: "#fff5ce" }}>
                        {ftcRegionLabel} High Scores {ftcRegionHighScores?.year}
                      </td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ backgroundColor: "#fff5ce" }}>Qualification</td>
                      <td style={{ backgroundColor: "#fff5ce" }}>Playoff</td>
                    </tr>
                    <tr>
                      <StatsMatch highScores={ftcRegionHighScores?.highscores} matchType={"penaltyFreequal"} matchName={"No penalties in match"} eventNamesCY={eventNamesCY} tableType={"district"} />
                      <StatsMatch highScores={ftcRegionHighScores?.highscores} matchType={"penaltyFreeplayoff"} matchName={"No penalties in match"} eventNamesCY={eventNamesCY} tableType={"district"} />
                    </tr>
                    <tr>
                      <StatsMatch highScores={ftcRegionHighScores?.highscores} matchType={"TBAPenaltyFreequal"} matchName={"No penalties to winner"} eventNamesCY={eventNamesCY} tableType={"district"} />
                      <StatsMatch highScores={ftcRegionHighScores?.highscores} matchType={"TBAPenaltyFreeplayoff"} matchName={"No penalties to winner"} eventNamesCY={eventNamesCY} tableType={"district"} />
                    </tr>
                    <tr>
                      <StatsMatch highScores={ftcRegionHighScores?.highscores} matchType={"offsettingqual"} matchName={"Offsetting penalties"} eventNamesCY={eventNamesCY} tableType={"district"} />
                      <StatsMatch highScores={ftcRegionHighScores?.highscores} matchType={"offsettingplayoff"} matchName={"Offsetting penalties"} eventNamesCY={eventNamesCY} tableType={"district"} />
                    </tr>
                    <tr>
                      <StatsMatch highScores={ftcRegionHighScores?.highscores} matchType={"overallqual"} matchName={"Incl. penalties"} eventNamesCY={eventNamesCY} tableType={"district"} />
                      <StatsMatch highScores={ftcRegionHighScores?.highscores} matchType={"overallplayoff"} matchName={"Incl. penalties"} eventNamesCY={eventNamesCY} tableType={"district"} />
                    </tr>
                  </tbody>
                </table>
              </Col>
            )}
            <Col
              xs={"12"}
              sm={
                (isFTC && (worldStats || ftcRegionHighScores)) || (!isFTC && selectedEvent?.value?.districtCode && worldStats)
                  ? "4"
                  : worldStats
                  ? "6"
                  : "12"
              }
            >
              <table className="table table-condensed gatool-highScores-Table gatool-eventHighScores">
                <thead>
                  <tr>
                    <td className={"statsMatchHeader"} colSpan={2} style={{ backgroundColor: "#d9edf7" }}>
                      Event High Scores: {eventLabel}
                    </td>
                  </tr>
                </thead>
                <tbody>
                <tr>
                    <td style={{ backgroundColor: "#d9edf7" }}>Qualification</td>
                    <td style={{ backgroundColor: "#d9edf7" }}>Playoff</td>
                  </tr>
                  <tr>
                    <StatsMatch
                      highScores={eventHighScores?.highscores}
                      matchType={"penaltyFreequal"}
                      matchName={"No penalties in match"}
                      eventNamesCY={eventNamesCY}
                      tableType={"event"}
                    />
                    <StatsMatch
                      highScores={eventHighScores?.highscores}
                      matchType={"penaltyFreeplayoff"}
                      matchName={"No penalties in match"}
                      eventNamesCY={eventNamesCY}
                      tableType={"event"}
                    />
                  </tr>
                  <tr>
                    <StatsMatch
                      highScores={eventHighScores?.highscores}
                      matchType={"TBAPenaltyFreequal"}
                      matchName={"No penalties to winner"}
                      eventNamesCY={eventNamesCY}
                      tableType={"event"}
                    />
                    <StatsMatch
                      highScores={eventHighScores?.highscores}
                      matchType={"TBAPenaltyFreeplayoff"}
                      matchName={"No penalties to winner"}
                      eventNamesCY={eventNamesCY}
                      tableType={"event"}
                    />
                  </tr>
                  <tr>
                    <StatsMatch
                      highScores={eventHighScores?.highscores}
                      matchType={"offsettingqual"}
                      matchName={"Offsetting penalties"}
                      eventNamesCY={eventNamesCY}
                      tableType={"event"}
                    />
                    <StatsMatch
                      highScores={eventHighScores?.highscores}
                      matchType={"offsettingplayoff"}
                      matchName={"Offsetting penalties"}
                      eventNamesCY={eventNamesCY}
                      tableType={"event"}
                    />
                  </tr>
                  <tr>
                    <StatsMatch
                      highScores={eventHighScores?.highscores}
                      matchType={"overallqual"}
                      matchName={"Incl. penalties"}
                      eventNamesCY={eventNamesCY}
                      tableType={"event"}
                    />
                    <StatsMatch
                      highScores={eventHighScores?.highscores}
                      matchType={"overallplayoff"}
                      matchName={"Incl. penalties"}
                      eventNamesCY={eventNamesCY}
                      tableType={"event"}
                    />
                  </tr>
                </tbody>
              </table>
            </Col>
          </Row>
          <Row>
             <br />
            <br />
          </Row>
        </Container>
      )}
    </Container>
  );
}

export default StatsPage;
