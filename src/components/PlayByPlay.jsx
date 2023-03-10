import _ from "lodash";

function PlayByPlay({ station, team, inPlayoffs, selectedYear, selectedEvent, showNotes, showMottoes, showQualsStats }) {
    var allianceColor = station.slice(0, -1);

    return (
        <>
            <td className={`col2 ${allianceColor.toLowerCase()}AlliancePlayByPlay align-middle`} align="center" >
                {team?.teamNumber && (team?.teamNumber !== 0) &&
                    <>
                        <p className={"playByPlayteamNumber"}>{team?.teamNumber}</p>
                        <p className={"playByPlaysayNumber"} >{team?.updates?.sayNumber}</p>
                        <p className={"playByPlayOrganization"}>{team?.updates?.organizationLocal ? team?.updates?.organizationLocal : team?.schoolName}</p>
                        <p className={"playByPlayCity"}>{team?.updates?.cityStateLocal ? team?.updates?.cityStateLocal : team?.city + ", " + team?.stateProv}</p>
                        {(showMottoes || _.isNull(showMottoes)) && <p className={"playByPlayCity mottoes"}>{team?.updates?.teamMottoLocal}</p>}
                        {inPlayoffs && <p className={"playByPlayAlliance"}>{team?.alliance}<br />{team?.allianceRole}</p>}
                    </>
                }
                {!team?.teamNumber && <>
                    <div className={"tbd"}>TBD</div>
                </>
                }
            </td>
            <td className={`col4 ${allianceColor.toLowerCase()}AlliancePlayByPlay`} >
                {team?.teamNumber && (team?.teamNumber !== 0) &&
                    <>
                        <p className={`playByPlayTeamName ${(inPlayoffs && showQualsStats) ? "playByPlayTeamNameStats" : ""}`}>{team?.updates?.nameShortLocal ? team?.updates?.nameShortLocal : team?.nameShort}</p>
                        <p className={"playByPlayRobotName"}>{team?.updates?.robotNameLocal}</p>
                        {(!inPlayoffs || (inPlayoffs && showQualsStats)) && <div className={"playByPlayWinLossTie text-center"}>
                            <table className={"wltTable"}>
                                <tbody>
                                    <tr>
                                        <td className={"wltCol"} style={team?.rankStyle}>Rank {team?.rank}<br />AV RP {team?.sortOrder1}</td><td className={"wltCol"}>Qual Avg<br />{team?.qualAverage}</td><td className={"wltCol"}>W-L-T<br />{team?.wins}-{team?.losses}-{team?.ties}</td>
                                    </tr>
                                    <tr><td colSpan={3}>Team high score: {team?.highScore?.score}<br />in {team?.highScore?.description}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>}
                        {(showNotes || _.isNull(showNotes)) && <p className={"notes playByPlayWinLossTie"} dangerouslySetInnerHTML={{ __html: team?.updates?.teamNotes }}></p>}
                    </>
                }
                {!team?.teamNumber && <>
                    <div className={"tbd"}>TBD</div>
                </>}
            </td>
        </>
    )
}

export default PlayByPlay;