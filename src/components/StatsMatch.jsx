import _ from "lodash";

function StatsMatch({ highScores, matchType, matchName }) {
    return (
        <>
            {highScores && (_.keys(highScores[matchType])?.length > 0) && <td >{matchName}<br />
                Score: {highScores[matchType]?.score}<br />
                {highScores[matchType]?.matchName}<br />
                {highScores[matchType]?.eventName}<br />
                {highScores[matchType]?.alliance} Alliance<br />({highScores[matchType].allianceMembers})<br />
            </td>}
            {(!highScores || _.keys(highScores[matchType])?.length === 0) && <td >{matchName}<br />No matches meet criteria.
            </td>}
        </>)
}

export default StatsMatch