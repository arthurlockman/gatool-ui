import { Alert, Container, Table, Row, Col, OverlayTrigger, Tooltip } from "react-bootstrap";
import {
  SortNumericDown,
  SortNumericUp,
  SortAlphaDown,
  SortAlphaUp,
} from "react-bootstrap-icons";
import { utils, read } from "xlsx";
import { toast } from "react-toastify";
import _ from "lodash";
import moment from "moment";

function RanksPage({
  selectedEvent,
  teamList,
  rankings,
  rankSort,
  setRankSort,
  allianceCount,
  rankingsOverride,
  setRankingsOverride,
  setRankings,
  allianceSelection,
  getRanks,
  setAllianceSelectionArrays,
  playoffs,
  districtRankings,
  eventLabel,
  communityUpdates,
}) {
  // This function clicks the hidden file upload button
  function clickLoadRanks() {
    document.getElementById("RankingsFiles").click();
  }

  function clickRemoveRanks() {
    setRankingsOverride(null);
    setAllianceSelectionArrays({});
    getRanks();
  }

  // This function imports a Rankings Report from Excel.
  function handleRankingsOverrideFiles(e) {
    var files = e.target.files;
    var f = files[0];
    var reader = new FileReader();
    reader.onload = function (e) {
      // @ts-ignore
      var data = new Uint8Array(e.target.result);
      var workbook;
      workbook = read(data, { type: "array" });
      var worksheet = workbook.Sheets[workbook.SheetNames[0]];
      var rankingsNew = utils.sheet_to_json(worksheet, { range: 3 });
      if (!rankingsNew[0]?.Rank) {
        rankingsNew = utils.sheet_to_json(worksheet, { range: 4 });
      }
      var formattedRankings = { ranks: [] };
      var errorRanks = [];
      var errorMessage = "";
      rankingsNew.forEach((rank) => {
        var ranksKeys = Object.keys(rank);
        ranksKeys.forEach((key) => {
          rank[key] = rank[key].toString();
        });

        if (ranksKeys.length < 9) {
          if (ranksKeys.length > 1) {
            errorRanks.push(rank);
          }
        }
      });

      if (errorRanks.length > 0) {
        errorMessage =
          "Your Ranking Report has missing data from the following team" +
          (errorRanks.length > 1 ? "es:" : ":") +
          "</br>";
        errorRanks.forEach((match) => {
          errorMessage += match["teamNumber"] + "</br>";
        });
        errorMessage += "Please check the report and reload.</br>";
        toast.error(errorMessage);
      } else {
        rankingsNew = _.filter(rankingsNew, "Team");
        formattedRankings.ranks = rankingsNew.map((rank) => {
          var winsLossTie = {};
          winsLossTie.wins = rank["W-L-T"].split("-")[0];
          winsLossTie.losses = rank["W-L-T"].split("-")[1];
          winsLossTie.ties = rank["W-L-T"].split("-")[2];
          var tempRow = {
            rank: parseInt(rank.Rank),
            teamNumber: parseInt(rank.Team),
            sortOrder1: parseInt(rank["RS"]),
            sortOrder2: null,
            sortOrder3: null,
            sortOrder4: null,
            sortOrder5: null,
            sortOrder6: null,
            wins: parseInt(winsLossTie.wins),
            losses: parseInt(winsLossTie.losses),
            ties: parseInt(winsLossTie.ties),
            qualAverage: parseInt(rank["Match Pts"]) || "-",
            dq: parseInt(rank["DQ"]),
            matchesPlayed: parseInt(rank.Played),
          };
          return tempRow;
        });

        formattedRankings.lastUpdate = moment();
        setRankingsOverride(true);
        setRankings(_.cloneDeep(formattedRankings));
        setAllianceSelectionArrays({});

        if (selectedEvent?.value?.code.includes("OFFLINE")) {
          toast.success(
            `Your have successfully loaded your Rankings Report for your Offline event. Your Alliance Selection page has been unlocked. Please verify the accuracy with your Scorekeeper.`
          );
        } else {
          toast.success(
            `Your have successfully loaded your Rankings Report. Your Alliance Selection page has been restarted to match the new rankings. Please verify the accuracy with your Scorekeeper.`
          );
        }

        clearFileInput("RankingsFiles");
        document
          .getElementById("RankingsFiles")
          .addEventListener("change", handleRankingsOverrideFiles);
      }
    };
    reader.readAsArrayBuffer(f);
  }

  // This function clears the file input by removing and recreating the file input button
  function clearFileInput(id) {
    var oldInput = document.getElementById(id);
    var newInput = document.createElement("input");
    newInput.type = "file";
    newInput.id = oldInput.id;
    // @ts-ignore
    newInput.name = oldInput.name;
    newInput.className = oldInput.className;
    newInput.style.cssText = oldInput.style.cssText;
    oldInput.parentNode.replaceChild(newInput, oldInput);
  }

  function getTeamName(teamNumber) {
    var team = _.find(teamList?.teams, { teamNumber: teamNumber });
    return team?.nameShortLocal ? team?.nameShortLocal : team?.nameShort;
  }

  function rankHighlight(rank) {
    var style = { color: "black", backgroundColor: "white" };
    if (rank <= allianceCount?.count && rank > 1) {
      style.color = "white";
      style.backgroundColor = "green";
    } else if (rank < allianceCount?.count + 3 && rank > allianceCount?.count) {
      style.color = "black";
      style.backgroundColor = "yellow";
    } else if (rank === 1) {
      style.color = "white";
      style.backgroundColor = "orange";
    } else {
      style.color = "";
      style.backgroundColor = "";
    }
    return style;
  }

    var rankingsList = rankings?.ranks?.map((teamRow) => {
        teamRow.teamName = getTeamName(teamRow.teamNumber);
        if (selectedEvent?.value?.districtCode) {
            teamRow.districtRankDetails = _.cloneDeep(_.filter(districtRankings?.districtRanks, { "teamNumber": teamRow.teamNumber })[0]);
            teamRow.districtRanking = teamRow.districtRankDetails?.rank;
        }
        return teamRow;
    })


  if (rankSort.charAt(0) === "-") {
    rankingsList = _.orderBy(rankingsList, rankSort.slice(1), "desc");
  } else {
    rankingsList = _.orderBy(rankingsList, rankSort, "asc");
  }

  return (
    <Container fluid>
      {!selectedEvent && (
        <div>
          <Alert variant="warning">
            You need to select an event before you can see anything here.
          </Alert>
        </div>
      )}

      {selectedEvent && (!teamList || teamList?.teams.length === 0) && (
        <div>
          <Alert variant="warning">
            <div>
              <img src="loadingIcon.gif" alt="Loading data..." />
            </div>
            <div>Awaiting team data for {selectedEvent.label}</div>
          </Alert>
        </div>
      )}

      {selectedEvent &&
        teamList?.teams.length > 0 &&
        (!rankings || rankings?.ranks.length === 0) && (
          <div>
            <Alert variant="warning">
              <div>
                <img src="loadingIcon.gif" alt="Loading data..." />
              </div>
              <div>Your event is not reporting rankings yet.</div>
            </Alert>
          </div>
        )}

      {selectedEvent &&
        teamList?.teams.length > 0 &&
        !rankingsOverride &&
        selectedEvent?.value?.code.includes("OFFLINE") && (
          <Container fluid>
            <Row>
              <Col xs={2}></Col>
              <Col
                xs={8}
                className={"leftTable"}
                style={{ cursor: "pointer", color: "darkblue" }}
                onClick={clickLoadRanks}
              >
                <Alert variant={"danger"}>
                  <img
                    style={{ float: "left" }}
                    width="50"
                    src="images/excelicon.png"
                    alt="Excel Logo"
                  />{" "}
                  <input
                    type="file"
                    id="RankingsFiles"
                    onChange={handleRankingsOverrideFiles}
                    className={"hiddenInput"}
                  />{" "}
                  You can upload a Rankings Report for your Offline Event, which
                  will activate Alliance Selection. You will need to ask your
                  Scorekeeper to export a Rankings Report in Excel format, which
                  you can upload here.
                  <br />
                  <b>Tap here to upload a Rankings Report.</b>
                </Alert>
              </Col>
              <Col xs={2}></Col>
            </Row>
          </Container>
        )}

      {selectedEvent &&
        teamList?.teams.length > 0 &&
        rankings?.ranks.length > 0 && (
          <div>
            <h4>{eventLabel}</h4>
            {rankings?.ranks.length > 0 &&
              !rankingsOverride &&
              !playoffs &&
              allianceSelection && (
                <>
                  <Container fluid>
                    <Row>
                      <Col xs={2}></Col>
                      <Col
                        xs={8}
                        className={"leftTable"}
                        style={{ cursor: "pointer", color: "darkblue" }}
                        onClick={clickLoadRanks}
                      >
                        <Alert variant={"danger"}>
                          <img
                            style={{ float: "left" }}
                            width="50"
                            src="images/excelicon.png"
                            alt="Excel Logo"
                          />{" "}
                          <input
                            type="file"
                            id="RankingsFiles"
                            onChange={handleRankingsOverrideFiles}
                            className={"hiddenInput"}
                          />{" "}
                          If you are seeing a discrepancy between this table and
                          your event Rankings, and if you know your event is
                          ready for Alliance Selection, you can upload a
                          Rankings Report here. You will need to ask your
                          Scorekeeper to export a Rankings Report in Excel
                          format, which you can upload here.
                          <br />
                          <b>
                            This is an emergency escape hatch, and should only
                            be used in a situation where you are unable to
                            retrieve current rankings.
                            <br />
                            Tap here to upload a Rankings Report.
                          </b>
                        </Alert>
                      </Col>
                      <Col xs={2}></Col>
                    </Row>
                  </Container>
                </>
              )}
            {rankings?.ranks.length > 0 &&
              rankingsOverride &&
              !playoffs &&
              !selectedEvent?.value?.code.includes("OFFLINE") &&
              allianceSelection && (
                <>
                  <Container fluid>
                    <Row>
                      <Col xs={2}></Col>
                      <Col
                        xs={8}
                        className={"leftTable"}
                        style={{ cursor: "pointer", color: "darkblue" }}
                        onClick={clickRemoveRanks}
                      >
                        <Alert variant={"warning"}>
                          <img
                            style={{ float: "left" }}
                            width="50"
                            src="images/excelicon.png"
                            alt="Excel Logo"
                          />{" "}
                          <input
                            type="file"
                            id="RankingsFiles"
                            onChange={handleRankingsOverrideFiles}
                            className={"hiddenInput"}
                          />{" "}
                          You have loaded an exported Rankings Report from your
                          Scorekeeper. Since you are offline, the data shown
                          below is from that file, not from rankings synced from
                          FIRST.
                          <br />
                          <b>
                            Please closely compare the rankings shown below to
                            the rankings provided by your Scorekeeper. If there
                            is any discrepancy, please remove this file and
                            upload a new file.
                            <br />
                            Tap here to unload the Rankings Report, which will
                            trigger a Rankings load from FIRST. This is
                            necessary to ensure that you have the most current
                            data for your Alliance Selection.
                          </b>
                        </Alert>
                      </Col>
                      <Col xs={2}></Col>
                    </Row>
                  </Container>
                </>
              )}
            {rankings?.ranks.length > 0 &&
              rankingsOverride &&
              !playoffs &&
              selectedEvent?.value?.code.includes("OFFLINE") &&
              allianceSelection && (
                <>
                  <Container fluid>
                    <Row>
                      <Col xs={2}></Col>
                      <Col
                        xs={8}
                        className={"leftTable"}
                        style={{ cursor: "pointer", color: "darkblue" }}
                        onClick={clickRemoveRanks}
                      >
                        <Alert variant={"warning"}>
                          <img
                            style={{ float: "left" }}
                            width="50"
                            src="images/excelicon.png"
                            alt="Excel Logo"
                          />{" "}
                          <input
                            type="file"
                            id="RankingsFiles"
                            onChange={handleRankingsOverrideFiles}
                            className={"hiddenInput"}
                          />{" "}
                          You have loaded an exported Rankings Report from your
                          Scorekeeper. The data shown below is from that file,
                          not from rankings synced from FIRST.
                          <br />
                          <b>
                            Please closely compare the rankings shown below to
                            the rankings provided by your Scorekeeper. If there
                            is any discrepancy, please remove this file and try
                            syncing. If that does not work, upload a new file.
                            <br />
                            Tap here to unload the Rankings Report, which will
                            trigger a Rankings load from FIRST. This is
                            necessary to ensure that you have the most current
                            data for your Alliance Selection.
                          </b>
                        </Alert>
                      </Col>
                      <Col xs={2}></Col>
                    </Row>
                  </Container>
                </>
              )}
            {rankings?.ranks.length > 0 &&
              rankingsOverride &&
              !playoffs &&
              !allianceSelection && (
                <>
                  <Container fluid>
                    <Row>
                      <Col xs={2}></Col>
                      <Col
                        xs={8}
                        className={"leftTable"}
                        style={{ cursor: "pointer", color: "darkblue" }}
                        onClick={clickRemoveRanks}
                      >
                        <Alert variant={"warning"}>
                          <img
                            style={{ float: "left" }}
                            width="50"
                            src="images/excelicon.png"
                            alt="Excel Logo"
                          />{" "}
                          <input
                            type="file"
                            id="RankingsFiles"
                            onChange={handleRankingsOverrideFiles}
                            className={"hiddenInput"}
                          />{" "}
                          You have loaded an exported Rankings Report from your
                          Scorekeeper.
                          <br />
                          <b>Tap here to unload the Rankings Report.</b>
                        </Alert>
                      </Col>
                      <Col xs={2}></Col>
                    </Row>
                  </Container>
                </>
              )}

            <Table responsive striped bordered size="sm">
              <thead className="thead-default">
                <tr>
                  <td colSpan={12}>
                    <b>
                      This table lists the teams in rank order for this
                      competition.Its columns are sortable. This table updates
                      during the competition, and freezes once Playoff Matches
                      begin.
                    </b>
                  </td>
                </tr>
                <tr>
                  <th
                    onClick={() =>
                      rankSort === "teamNumber"
                        ? setRankSort("-teamNumber")
                        : setRankSort("teamNumber")
                    }
                  >
                    <b>
                      Team #{rankSort === "teamNumber" ? <SortNumericUp /> : ""}
                      {rankSort === "-teamNumber" ? <SortNumericDown /> : ""}
                    </b>
                  </th>
                  <th
                    onClick={() =>
                      rankSort === "rank"
                        ? setRankSort("-rank")
                        : setRankSort("rank")
                    }
                  >
                    <b>
                      Rank{rankSort === "rank" ? <SortNumericUp /> : ""}
                      {rankSort === "-rank" ? <SortNumericDown /> : ""}
                    </b>
                  </th>
                  <th
                    onClick={() =>
                      rankSort === "teamName"
                        ? setRankSort("-teamName")
                        : setRankSort("teamName")
                    }
                  >
                    <b>
                      Team Name{rankSort === "teamName" ? <SortAlphaUp /> : ""}
                      {rankSort === "-teamName" ? <SortAlphaDown /> : ""}
                    </b>
                  </th>
                  <th
                    onClick={() =>
                      rankSort === "sortOrder1"
                        ? setRankSort("-sortOrder1")
                        : setRankSort("sortOrder1")
                    }
                  >
                    <b>
                      RP Avg.
                      {rankSort === "sortOrder1" ? <SortNumericUp /> : ""}
                      {rankSort === "-sortOrder1" ? <SortNumericDown /> : ""}
                    </b>
                  </th>
                  <th
                    onClick={() =>
                      rankSort === "wins"
                        ? setRankSort("-wins")
                        : setRankSort("wins")
                    }
                  >
                    <b>
                      Wins{rankSort === "wins" ? <SortNumericUp /> : ""}
                      {rankSort === "-wins" ? <SortNumericDown /> : ""}
                    </b>
                  </th>
                  <th
                    onClick={() =>
                      rankSort === "losses"
                        ? setRankSort("-losses")
                        : setRankSort("losses")
                    }
                  >
                    <b>
                      Losses{rankSort === "losses" ? <SortNumericUp /> : ""}
                      {rankSort === "-losses" ? <SortNumericDown /> : ""}
                    </b>
                  </th>
                  <th
                    onClick={() =>
                      rankSort === "ties"
                        ? setRankSort("-ties")
                        : setRankSort("ties")
                    }
                  >
                    <b>
                      Ties{rankSort === "ties" ? <SortNumericUp /> : ""}
                      {rankSort === "-ties" ? <SortNumericDown /> : ""}
                    </b>
                  </th>
                  <th
                    onClick={() =>
                      rankSort === "qualAverage"
                        ? setRankSort("-qualAverage")
                        : setRankSort("qualAverage")
                    }
                  >
                    <b>
                      Qual Avg.
                      {rankSort === "qualAverage" ? <SortNumericUp /> : ""}
                      {rankSort === "-qualAverage" ? <SortNumericDown /> : ""}
                    </b>
                  </th>
                  <th
                    onClick={() =>
                      rankSort === "dq" ? setRankSort("-dq") : setRankSort("dq")
                    }
                  >
                    <b>
                      DQ{rankSort === "dq" ? <SortNumericUp /> : ""}
                      {rankSort === "-dq" ? <SortNumericDown /> : ""}
                    </b>
                  </th>
                  <th
                    onClick={() =>
                      rankSort === "matchesPlayed"
                        ? setRankSort("-matchesPlayed")
                        : setRankSort("matchesPlayed")
                    }
                  >
                    <b>
                      Matches Played
                      {rankSort === "matchesPlayed" ? <SortNumericUp /> : ""}
                      {rankSort === "-matchesPlayed" ? <SortNumericDown /> : ""}
                    </b>
                  </th>
                  {selectedEvent?.value?.districtCode && (
                    <th
                      onClick={() =>
                        rankSort === "districtRanking"
                          ? setRankSort("-districtRanking")
                          : setRankSort("districtRanking")
                      }
                    >
                      <b>
                        District Ranking
                        {rankSort === "districtRanking" ? (
                          <SortNumericUp />
                        ) : (
                          ""
                        )}
                        {rankSort === "-districtRanking" ? (
                          <SortNumericDown />
                        ) : (
                          ""
                        )}
                      </b>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {rankings &&
                  rankings?.ranks &&
                  rankingsList.map((rankRow) => {
                    rankRow = _.merge(
                      rankRow,
                      communityUpdates[
                        _.findIndex(communityUpdates, {
                          teamNumber: rankRow.teamNumber,
                        })
                      ]
                    );
                    return (
                      <tr key={"rankings" + rankRow.teamNumber}>
                        <td>{rankRow.teamNumber}</td>
                        <td style={rankHighlight(rankRow.rank)}>
                          {rankRow.rank}
                        </td>
                        <td
                          dangerouslySetInnerHTML={{
                            __html: rankRow?.updates?.nameShortLocal
                              ? rankRow.updates.nameShortLocal
                              : rankRow.teamName,
                          }}
                        ></td>
                        <td>{rankRow.sortOrder1}</td>
                        <td>{rankRow.wins}</td>
                        <td>{rankRow.losses}</td>
                        <td>{rankRow.ties}</td>
                        <td>{rankRow.qualAverage}</td>
                        <td>{rankRow.dq}</td>
                        <td>{rankRow.matchesPlayed}</td>
                        {selectedEvent?.value?.districtCode && (
                          <td>
                            {rankRow?.districtRankDetails?.rank
                              ? <OverlayTrigger delay={500} overlay={
                                <Tooltip><>Points breakdown<br />
                                Age points: {rankRow?.districtRankDetails?.teamAgePoints}<br />
                                Event 1 ({rankRow?.districtRankDetails?.event1Code}) :{rankRow?.districtRankDetails?.event1Points}<br />
                                Event 2 ({rankRow?.districtRankDetails?.event2Code}) :{rankRow?.districtRankDetails?.event2Points}<br />
                                {rankRow?.districtRankDetails?.districtCmpCode ? <>DCMP ({rankRow?.districtRankDetails?.districtCmpCode}) :{rankRow?.districtRankDetails?.districtCmpPoints}</>:""}</></Tooltip>
                              }><span>{`${rankRow?.districtRankDetails?.rank} (${rankRow?.districtRankDetails?.totalPoints} pts)`}</span></OverlayTrigger>
                              : "Not in District"}
                            {rankRow?.districtRankDetails ? (
                              <>
                              
                                {rankRow?.districtRankDetails.qualifiedDistrictCmp ? (
                                  <span>
                                    <b> D</b>
                                  </span>
                                ) : (
                                  ""
                                )}
                                {rankRow?.districtRankDetails.qualifiedFirstCmp ? (
                                  <span>
                                    <b> W</b>
                                  </span>
                                ) : (
                                  ""
                                )}
                              </>
                            ) : (
                              ""
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
              </tbody>
            </Table>
            <div>
              <br />
            </div>
          </div>
        )}
    </Container>
  );
}

export default RanksPage;
