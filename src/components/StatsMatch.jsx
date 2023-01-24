import _ from "lodash";

function StatsMatch({highScores={highScores}, matchType={matchType}, matchName={matchName}}) {
    return (
    <>
    {!_.isEmpty(_.filter(highScores, { "scoreType": matchType })) && <td >{matchName}<br />
        Score: {_.filter(highScores, { "scoreType": matchType })[0].score}<br />
        {_.filter(highScores, { "scoreType": matchType })[0].matchName}<br />
        {_.filter(highScores, { "scoreType": matchType })[0].eventName}<br />
        {_.filter(highScores, { "scoreType": matchType })[0].alliance} Alliance<br />({_.filter(highScores, { "scoreType": matchType })[0].allianceMembers})<br />
    </td>}
    {_.isEmpty(_.filter(highScores, { "scoreType": matchType })) && <td >{matchName}<br />No matches meet criteria.
    </td>}
    </>)
}

export default StatsMatch