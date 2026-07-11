import _ from "lodash";
import { useEventData } from "contexts/EventDataContext";

function StatsMatch({
  highScores,
  matchType,
  matchName,
  eventNamesCY,
  tableType,
  backgroundColorOverride = undefined,
}) {
  const { firstGlobalMode, remapNumberToString } = useEventData();

  function formatAllianceMembers(raw) {
    if (!firstGlobalMode || !raw) return raw;
    return String(raw).replace(/\d+/g, (num) => remapNumberToString(Number(num)));
  }

  const style =
    backgroundColorOverride != null
      ? { backgroundColor: backgroundColorOverride }
      : tableType === "world"
      ? { backgroundColor: "#f2dede" }
      : tableType === "event"
      ? { backgroundColor: "#d9edf7" }
      : { backgroundColor: "#fff5ce" };
  return (
    <>
      {highScores && _.keys(highScores[matchType])?.length > 0 && (
        <td style={style}>
          <span className={"statsMatchName"}>{matchName}</span>
          <br />
          <span className={"statsScore"}>
            Score: {highScores[matchType]?.score}
          </span>
          <br />
          {highScores[matchType]?.matchName}
          <br />
          {_.findIndex(eventNamesCY[highScores[matchType]?.eventName]) >= 0
            ? eventNamesCY[highScores[matchType]?.eventName]
            : highScores[matchType]?.eventName}
          <br />
          {highScores[matchType]?.alliance} Alliance
          <br />({formatAllianceMembers(highScores[matchType].allianceMembers)})<br />
        </td>
      )}
      {(!highScores || _.keys(highScores[matchType])?.length === 0) && (
        <td style={style}>
          {matchName}
          <br />
          <i>No matches meet criteria.</i>
        </td>
      )}
    </>
  );
}

export default StatsMatch;
