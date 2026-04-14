import { Button, Container, Modal } from "react-bootstrap";
import moment from "moment";

/** Per-team API sometimes returns totalPoints: 0; derive total from regional point fields when needed. */
function getRegionalAdvancementTotal(r) {
  if (r.totalPoints != null && r.totalPoints > 0) return r.totalPoints;
  return (r.regional1Points ?? 0) + (r.regional2Points ?? 0) + (r.regionalDirectPoints ?? 0);
}

function AdvancementDetailsModal({ show, onHide, team, type, remapNumberToString }) {
  const d = team?.districtRankDetails;
  const r = team?.regionalAdvancement;
  let headerClass = "bg-light text-dark";
  let closeVariant = undefined;
  if (type === "district") {
    if (d?.qualifiedFirstCmp) {
      headerClass = "bg-success text-white";
      closeVariant = "white";
    } else if (d?.qualifiedDistrictCmp) {
      headerClass = "bg-info text-white";
      closeVariant = "white";
    } else {
      headerClass = "bg-warning text-dark";
    }
  } else {
    const qualified = r?.qualifiedFirstCmp;
    const hasNotPlayedBoth = r && !r.regional2Details;
    if (qualified) {
      headerClass = "bg-success text-white";
      closeVariant = "white";
    } else if (hasNotPlayedBoth) {
      headerClass = "bg-warning text-dark";
    }
  }

  return (
    <Modal centered show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton className={headerClass} closeVariant={closeVariant}>
        <Modal.Title>
          Championship Advancement — Team{" "}
          {remapNumberToString
            ? remapNumberToString(team?.teamNumber)
            : team?.teamNumber}{" "}
          ({type === "district" ? "District" : "World"})
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {type === "district" && team?.districtRankDetails && (
          <Container fluid>
            <p>
              <b>District Rank:</b> {team.districtRankDetails.rank} (
              {team.districtRankDetails.totalPoints} pts)
            </p>
            <p>
              <b>Age points:</b>{" "}
              {team.districtRankDetails.teamAgePoints ?? 0}
            </p>
            <p>
              <b>Event 1 ({team.districtRankDetails.event1Code}):</b>{" "}
              {team.districtRankDetails.event1Points ?? 0} pts
            </p>
            <p>
              <b>Event 2 ({team.districtRankDetails.event2Code}):</b>{" "}
              {team.districtRankDetails.event2Points ?? 0} pts
            </p>
            {team.districtRankDetails.districtCmpCode && (
              <p>
                <b>DCMP ({team.districtRankDetails.districtCmpCode}):</b>{" "}
                {team.districtRankDetails.districtCmpPoints ?? 0} pts
              </p>
            )}
            <p>
              <b>Qualified for District Championship:</b>{" "}
              {team.districtRankDetails.qualifiedDistrictCmp ? "Yes" : "No"}
            </p>
            <p>
              <b>Qualified for World Championship:</b>{" "}
              {team.districtRankDetails.qualifiedFirstCmp ? "Yes" : "No"}
            </p>
          </Container>
        )}
        {type === "regional" &&
          team?.regionalAdvancement &&
          (() => {
            const r = team.regionalAdvancement;
            return (
              <Container fluid>
                <p>
                  <b>World Rank:</b> {r.rank} ({getRegionalAdvancementTotal(r)}{" "}
                  pts)
                </p>
                <p>
                  <b>Championship Status:</b> {r.championshipStatus ?? "None"}
                </p>
                <p>
                  <b>Qualified for World Championship:</b>{" "}
                  {r.qualifiedFirstCmp ? "Yes" : "No"}
                </p>
                {r.qualifiedFirstCmpEventCode && (
                  <p>
                    <b>Qualified at event:</b> {r.qualifiedFirstCmpEventCode}
                    {r.qualifiedFirstCmpDate && (
                      <>
                        {" "}
                        ({moment(r.qualifiedFirstCmpDate).format("YYYY-MM-DD")})
                      </>
                    )}
                  </p>
                )}
                <hr />
                <h6>Event breakdown</h6>
                {r.regional1Details && (
                  <div className="mb-2">
                    <b>Event 1 ({r.regional1Details.tournamentCode}):</b>{" "}
                    {r.regional1Points ?? r.regional1Details.totalPoints} pts
                    <ul className="small mb-0">
                      <li>
                        Qualification performance:{" "}
                        {r.regional1Details.qualificationPerformancePoints}
                      </li>
                      <li>
                        Alliance selection:{" "}
                        {r.regional1Details.allianceSelectionPoints}
                      </li>
                      <li>
                        Playoff advancement:{" "}
                        {r.regional1Details.playoffAdvancementPoints}
                      </li>
                      <li>Award: {r.regional1Details.awardPoints}</li>
                      <li>Team age: {r.regional1Details.teamAgePoints}</li>
                    </ul>
                  </div>
                )}
                {r.regional2Details && (
                  <div className="mb-2">
                    <b>Event 2 ({r.regional2Details.tournamentCode}):</b>{" "}
                    {r.regional2Points ?? r.regional2Details.totalPoints} pts
                    <ul className="small mb-0">
                      <li>
                        Qualification performance:{" "}
                        {r.regional2Details.qualificationPerformancePoints}
                      </li>
                      <li>
                        Alliance selection:{" "}
                        {r.regional2Details.allianceSelectionPoints}
                      </li>
                      <li>
                        Playoff advancement:{" "}
                        {r.regional2Details.playoffAdvancementPoints}
                      </li>
                      <li>Award: {r.regional2Details.awardPoints}</li>
                      <li>Team age: {r.regional2Details.teamAgePoints}</li>
                    </ul>
                  </div>
                )}
                {r.regionalDirectDetails && (
                  <div className="mb-2">
                    <b>Direct ({r.regionalDirectDetails.tournamentCode}):</b>{" "}
                    {r.regionalDirectPoints ??
                      r.regionalDirectDetails.totalPoints}{" "}
                    pts
                  </div>
                )}
                {r.tiebreakers && (
                  <>
                    <hr />
                    <h6>Tiebreakers</h6>
                    <p className="small mb-0">
                      Playoff: {r.tiebreakers.eventPlayoffPoints} · Alliance:{" "}
                      {r.tiebreakers.eventAlliancePoints} · Qual:{" "}
                      {r.tiebreakers.eventQualificationPoints}
                      <br />
                      Match high scores: {r.tiebreakers.matchHighScore1},{" "}
                      {r.tiebreakers.matchHighScore2},{" "}
                      {r.tiebreakers.matchHighScore3}
                    </p>
                  </>
                )}
                {r.adjustPoints != null && r.adjustPoints !== 0 && (
                  <p className="small mt-1">
                    <b>Adjustment:</b> {r.adjustPoints} pts
                  </p>
                )}
              </Container>
            );
          })()}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AdvancementDetailsModal;
export { getRegionalAdvancementTotal };
