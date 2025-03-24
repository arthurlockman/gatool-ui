import _ from "lodash";

function StatsMatch({ highScores, matchType, matchName, eventNamesCY, tableType }) {
    const style = tableType === "world" ? {backgroundColor: "#f2dede"} : tableType === "event"? {backgroundColor: "#d9edf7"} : {backgroundColor: "#fff5ce"} 
    return (
        <>
            {highScores && (_.keys(highScores[matchType])?.length > 0) && 
            <td style={style}>
                <span className={"statsMatchName"}>{matchName}</span><br />
                <span className={"statsScore"}>Score: {highScores[matchType]?.score}</span><br />
                {highScores[matchType]?.matchName}<br />
                {_.findIndex(eventNamesCY[highScores[matchType]?.eventName]) >= 0 ? eventNamesCY[highScores[matchType]?.eventName] : highScores[matchType]?.eventName}<br />
                {highScores[matchType]?.alliance} Alliance<br />({highScores[matchType].allianceMembers})<br />
            </td>}
            {(!highScores || _.keys(highScores[matchType])?.length === 0) && <td style={style}>{matchName}<br /><i>No matches meet criteria.</i>
            </td>}
        </>)
}

export default StatsMatch