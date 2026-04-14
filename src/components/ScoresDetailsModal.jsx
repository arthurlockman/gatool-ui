import React from "react";
import {
  Button,
  Container,
  Modal,
  Table,
  Tooltip,
  OverlayTrigger,
} from "react-bootstrap";
import moment from "moment";
import _ from "lodash";
import { CheckCircleFill, XCircleFill } from "react-bootstrap-icons";
import Handshake from "components/Handshake";

export const rankPointDisplay = (rankPoints) => {
  var pointsDisplay = [];
  _.forEach(rankPoints, (value, key) => {
    // FRC uses "BonusAchieved" or "Achieved" in key names; prefer stripping BonusAchieved first, then Achieved
    const name = key.endsWith("BonusAchieved")
      ? key.slice(0, -"BonusAchieved".length)
      : key.endsWith("Achieved")
        ? key.slice(0, -"Achieved".length)
        : key;
    pointsDisplay.push({
      bonus: _.startCase(name),
      earned: value,
    });
  });
  return pointsDisplay.map((point, index) => {
    return (
      <React.Fragment key={`rp-${point.bonus}-${index}`}>
        <OverlayTrigger
          delay={500}
          overlay={
            <Tooltip id={`tooltip-${point.bonus}`}>
              {point.bonus} {point.earned ? " Achieved" : " Not Achieved"}
            </Tooltip>
          }
        >
          <span className={`rankPoints${point.earned ? "" : " unearned"}`}>
            {point.bonus.slice(0, 1)}
          </span>
        </OverlayTrigger>
      </React.Fragment>
    );
  });
};

const scoreAchieved = (result) => {
  return result ? (
    <CheckCircleFill style={{ color: "green" }} />
  ) : (
    <XCircleFill style={{ color: "red" }} />
  );
};

const addScoreType = (scores) => {
  if (scores == null || typeof scores !== "object" || Array.isArray(scores)) {
    return [];
  }
  return Object.keys(scores).map((key) => {
    if (key.toLowerCase().includes("alliance")) return { type: 1, key: key };
    else if (
      key.toLowerCase().includes("bonus") ||
      key.toLowerCase() === "rp"
    )
      return { type: 2, key: key };
    else if (key.toLowerCase().includes("auto")) return { type: 3, key: key };
    else if (key.toLowerCase().includes("teleop"))
      return { type: 4, key: key };
    else if (key.toLowerCase().includes("endgame"))
      return { type: 5, key: key };
    else if (key.toLowerCase().includes("algae"))
      return { type: 6, key: key };
    else if (key.toLowerCase().includes("foul")) return { type: 7, key: key };
    else if (key.toLowerCase().includes("total"))
      return { type: 9, key: key };
    else return { type: 10, key: key };
  });
};

function ScoresDetailsModal({ show, onHide, scoresMatch }) {
  const scoresRow = (key, rowKey) => {
    const redAlliance = scoresMatch?.scores?.alliances?.[1];
    const blueAlliance = scoresMatch?.scores?.alliances?.[0];
    const redVal = redAlliance?.[key.key];
    const blueVal = blueAlliance?.[key.key];
    return (
      <tr key={rowKey}>
        <td>
          <b>{key.key}</b>
        </td>
        <td className="scheduleTablered">
          {typeof redVal === "boolean"
            ? scoreAchieved(redVal)
            : redVal}
        </td>
        <td className="scheduleTableblue">
          {typeof blueVal === "boolean"
            ? scoreAchieved(blueVal)
            : blueVal}
        </td>
      </tr>
    );
  };

  const expandScoresRow = (key) => {
    const redAlliance = scoresMatch?.scores?.alliances?.[1];
    const blueAlliance = scoresMatch?.scores?.alliances?.[0];
    const redRow = redAlliance?.[key.key];
    const blueRow = blueAlliance?.[key.key];
    const safeRedRow = redRow != null && typeof redRow === "object" && !Array.isArray(redRow) ? redRow : {};
    const safeBlueRow = blueRow != null && typeof blueRow === "object" && !Array.isArray(blueRow) ? blueRow : {};
    return (
      <>
        <tr>
          <td>
            <b>{key.key}</b>
          </td>
          <td className="scheduleTablered"></td>
          <td className="scheduleTableblue"></td>
        </tr>

        {Object.keys(safeRedRow).map((itemKey, itemIndex) => {
          const redItem = safeRedRow[itemKey];
          const blueItem = safeBlueRow[itemKey];
          if (redItem != null && typeof redItem === "object" && !Array.isArray(redItem)) {
            const redRowKeys = Object.keys(redItem);
            return (
              <React.Fragment key={`redrow-${itemKey}-${itemIndex}`}>
                <tr>
                  <td>
                    <b>     {itemKey}</b>
                  </td>
                  <td className="scheduleTablered">
                    <tr>
                      <td>
                        <tr>
                          {redRowKeys.map((score, scoreIndex) => {
                            return (
                              <td
                                key={`red-header-${score}-${scoreIndex}`}
                                style={{
                                  writingMode: "vertical-rl",
                                  padding: "5px 0px 0px 5px",
                                }}
                              >
                                <b>{score}</b>
                              </td>
                            );
                          })}
                        </tr>
                        <tr>
                          {redRowKeys.map((score, scoreIndex) => {
                            const redVal = redItem[score];
                            const writingMode =
                              typeof redVal === "string"
                                ? "vertical-rl"
                                : Array.isArray(redVal)
                                ? "vertical-rl"
                                : "horizontal-tb";
                            return (
                              <td
                                key={`red-value-${score}-${scoreIndex}`}
                                style={{
                                  writingMode: writingMode,
                                  padding: "5px 0px 0px 5px",
                                }}
                              >
                                {typeof redVal === "string"
                                  ? redVal
                                  : Array.isArray(redVal)
                                  ? redVal.join(",")
                                  : scoreAchieved(redVal)}
                              </td>
                            );
                          })}
                        </tr>
                      </td>
                    </tr>
                  </td>
                  <td className="scheduleTableblue">
                    <tr>
                      <td>
                        <tr>
                          {redRowKeys.map((score, scoreIndex) => {
                            return (
                              <td
                                key={`blue-header-${score}-${scoreIndex}`}
                                style={{
                                  writingMode: "vertical-rl",
                                  padding: "5px 0px 0px 5px",
                                }}
                              >
                                <b>{score}</b>
                              </td>
                            );
                          })}
                        </tr>
                        <tr>
                          {redRowKeys.map((score, scoreIndex) => {
                            const blueVal = (blueItem != null && typeof blueItem === "object") ? blueItem[score] : undefined;
                            const writingMode =
                              typeof blueVal === "string"
                                ? "vertical-rl"
                                : Array.isArray(blueVal)
                                ? "vertical-rl"
                                : "horizontal-tb";
                            return (
                              <td
                                key={`blue-value-${score}-${scoreIndex}`}
                                style={{
                                  writingMode: writingMode,
                                  padding: "5px 0px 0px 5px",
                                }}
                              >
                                {typeof blueVal === "string"
                                  ? blueVal
                                  : Array.isArray(blueVal)
                                  ? blueVal.join(",")
                                  : scoreAchieved(blueVal)}
                              </td>
                            );
                          })}
                        </tr>
                      </td>
                    </tr>
                  </td>
                </tr>
              </React.Fragment>
            );
          } else {
            return (
              <tr key={`redrow-simple-${itemKey}-${itemIndex}`}>
                <td>
                  <b>     {itemKey}</b>
                </td>
                <td className="scheduleTablered">{redItem}</td>
                <td className="scheduleTableblue">{safeBlueRow[itemKey]}</td>
              </tr>
            );
          }
        })}
      </>
    );
  };

  return (
    <Modal
      fullscreen={true}
      show={show}
      onHide={onHide}
      keyboard
      contentClassName="gatool-score-details-modal"
    >
      <Modal.Header
        className={"promoteBackup"}
        closeVariant={"white"}
        closeButton
      >
        <Modal.Title>
          Score Details for {scoresMatch?.description}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container fluid>
          <Table
            className="gatool-score-details-table"
            style={{ margin: "0px auto", overflowY: "scroll" }}
            responsive
            striped
            bordered
            size="sm"
          >
            <tbody>
              <tr>
                <td>Start Time:</td>
                <td colSpan={2}>
                  {moment(scoresMatch?.actualStartTime).format("dd hh:mm A")}
                </td>
              </tr>
              <tr>
                <td>Post Time:</td>
                <td colSpan={2}>
                  {moment(scoresMatch?.postResultTime).format("dd hh:mm A")}
                </td>
              </tr>
              <tr>
                <td>Winner:</td>
                <td colSpan={2}>
                  {scoresMatch?.winner?.winner === "red" ? (
                    <span className="gatool-score-winner-red">
                      <b>Red Alliance</b>
                    </span>
                  ) : scoresMatch?.winner?.winner === "blue" ? (
                    <span className="gatool-score-winner-blue">
                      <b>Blue Alliance</b>
                    </span>
                  ) : scoresMatch?.winner?.tieWinner === "red" ? (
                    <span className="gatool-score-winner-red">
                      <b>{scoresMatch?.winner?.tieDetail}</b>
                    </span>
                  ) : scoresMatch?.winner?.tieWinner === "blue" ? (
                    <span className="gatool-score-winner-blue">
                      <b>{scoresMatch?.winner?.tieDetail}</b>
                    </span>
                  ) : scoresMatch?.winner?.tieWinner === "tie" ? (
                    <span className="gatool-score-winner-tie">
                      <b>{scoresMatch?.winner?.tieDetail}</b>
                    </span>
                  ) : (
                    <span className="gatool-score-winner-tie">
                      <b>TIE</b>
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td>Coopertition:</td>
                <td colSpan={2}>
                  <Handshake
                    result={
                      scoresMatch?.scores?.coopertitionBonusAchieved ||
                      scoresMatch?.scores?.alliances?.[0]
                        ?.coopertitionCriteriaMet
                    }
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>Criterion</b>
                </td>
                <td className="scheduleTablered">
                  <b>Red Alliance Results</b>
                </td>
                <td className="scheduleTableblue">
                  <b>Blue Alliance Results</b>
                </td>
              </tr>
              {(scoresMatch?.scores?.alliances?.[0] != null && typeof scoresMatch.scores.alliances[0] === "object") ? (
                _.orderBy(
                  addScoreType(scoresMatch.scores.alliances[0]),
                  ["type", "key"],
                  ["asc", "asc"]
                ).map((key, keyIndex) => {
                  const rowKey = `score-row-${key?.type ?? ""}-${key?.key ?? ""}-${keyIndex}`;
                  if (
                    typeof scoresMatch?.scores?.alliances?.[0]?.[key.key] ===
                    "object"
                  ) {
                    return (
                      <React.Fragment key={rowKey}>
                        {expandScoresRow(key)}
                      </React.Fragment>
                    );
                  } else {
                    return scoresRow(key, rowKey);
                  }
                })
              ) : (
                <></>
              )}
            </tbody>
          </Table>
        </Container>
      </Modal.Body>
      <Modal.Footer className="gatool-score-details-footer">
        <Button variant="primary" type="button" onClick={onHide}>
          Done
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ScoresDetailsModal;
