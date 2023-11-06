import _ from "lodash";

function StatsMatch({ highScores, matchType, matchName, eventNamesCY, tableType }) {
    const style = tableType === "world" ? {backgroundColor: "#f2dede"} : {backgroundColor: "#d9edf7"}
    return (
        <>
            {highScores && (_.keys(highScores[matchType])?.length > 0) && <td style={style}>{matchName}<br />
                Score: {highScores[matchType]?.score}<br />
                {highScores[matchType]?.matchName}<br />
                {_.findIndex(eventNamesCY[highScores[matchType]?.eventName]) >= 0 ? eventNamesCY[highScores[matchType]?.eventName] : highScores[matchType]?.eventName}<br />
                {highScores[matchType]?.alliance} Alliance<br />({highScores[matchType].allianceMembers})<br />
            </td>}
            {(!highScores || _.keys(highScores[matchType])?.length === 0) && <td style={style}>{matchName}<br />No matches meet criteria.
            </td>}
        </>)
}

export default StatsMatch