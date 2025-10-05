import _ from "lodash";
import useWindowDimensions from "hooks/UseWindowDimensions";

function PlayByPlay({ station, team, inPlayoffs, selectedEvent, showNotes, showMottoes, showQualsStats, showQualsStatsQuals, adHocMode, playoffOnly, ftcMode}) {
    const { height, width } = useWindowDimensions();
    var allianceColor = station.slice(0, -1);

    return (
        <>
            <td className={`col2 ${allianceColor.toLowerCase()}AlliancePlayByPlay align-middle`} align="center" >
                {team?.teamNumber && (team?.teamNumber !== 0) &&
                    <>
                        <p className={"playByPlayteamNumber"}>{team?.teamNumber}</p>
                        <p className={"playByPlaysayNumber"} >{team?.updates?.sayNumber}</p>
                        <p className={team?.updates?.organizationLocal ? (team?.updates?.organizationLocal?.length > 60 ? "playByPlayOrganization narrowFont" : "playByPlayOrganization") : (team?.schoolName?.length > 60 ? "playByPlayOrganization narrowFont" : "playByPlayOrganization")}>{team?.updates?.organizationLocal ? team?.updates?.organizationLocal : team?.schoolName}</p>
                        <p className={"playByPlayCity"}>{team?.updates?.cityStateLocal ? team?.updates?.cityStateLocal : `${team?.city}, ${team?.stateProv}${team?.country !== "USA" ? `, ${team?.country}` : ""}`}</p>
                        {(showMottoes || _.isNull(showMottoes)) && <p className={"playByPlayCity mottoes"}>{team?.updates?.teamMottoLocal}</p>}
                        {inPlayoffs && width < height && <p className={"playByPlayAlliance"}>{team?.alliance}{(selectedEvent?.value?.name.includes("OFFLINE") && !playoffOnly) ? <></> : <><br />{team.allianceRole}</>}</p>}
                    </>
                }
                {!team?.teamNumber && <>
                    <div className={"tbd"}>{""}</div>
                </>
                }
            </td>
            <td className={`col4 ${allianceColor.toLowerCase()}AlliancePlayByPlay`} >
                {team?.teamNumber && (team?.teamNumber !== 0) &&
                    <>
                        <p className={`playByPlayTeamName ${(inPlayoffs && showQualsStats) ? "playByPlayTeamNameStats" : ""} ${team?.updates?.nameShortLocal ? (team?.updates?.nameShortLocal?.length > 60 ? " narrowFont" : "") : (team?.nameShort?.length > 60 ? " narrowFont" : "")}`}>{team?.updates?.nameShortLocal ? team?.updates?.nameShortLocal : team?.nameShort}</p>
                        <p className={"playByPlayRobotName"}>{team?.updates?.robotNameLocal}</p>
                        {((!inPlayoffs && (_.isNull(showQualsStatsQuals) || showQualsStatsQuals)) || (inPlayoffs && showQualsStats)) && team?.rank &&
                            <div className={"playByPlayWinLossTie text-center"}>
                                <table className={"wltTable"}>
                                    <tbody>
                                        <tr>
                                            <td className={"wltCol"} style={team?.rankStyle}>Rank {team?.rank}<br />AV RP {team?.sortOrder1}</td><td className={"wltCol"}>Qual Avg<br />{Math.floor(team?.qualAverage*100)/100}</td><td className={"wltCol"}>W-L-T<br />{team?.wins}-{team?.losses}-{team?.ties}</td><td className={"wltCol"}>{ftcMode?'OPA':'EPA'}<br />{team?.epa?.epa?.total_points?.mean>=0 ? team?.epa?.epa?.total_points?.mean : "TBD"}</td><td className={"wltCol"}>Season<br />{team?.epa?.record?.wins>=0 ? `${team?.epa?.record?.wins}-${team?.epa?.record?.losses}-${team?.epa?.record?.ties}` : `TBD`}</td>
                                        </tr>
                                        <tr><td colSpan={6}>Team high score: {team?.highScore?.score} in {team?.highScore?.description.replace(" ", " ")}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>}

                        {(team?.qualifiedDistrictCmp || team?.qualifiedFirstCmp) &&
                            <p className={"champsQualified"}>
                                {(team?.qualifiedDistrictCmp && (selectedEvent?.value?.champLevel === "")) && <>Qualified for District Champs
                                    {team?.qualifiedFirstCmp && <br />}
                                </>}
                                {team?.qualifiedFirstCmp && (selectedEvent?.value?.champLevel !== "CMPDIV" && selectedEvent?.value?.champLevel !== "CMPSUB" && selectedEvent?.value?.champLevel !== "CMPSUB") && <>Qualified for World Champs</>}
                            </p>}
                        {(showNotes || _.isNull(showNotes)) && <p className={`notes playByPlayWinLossTie teamNotes${team?.updates?.teamNotesLocal?.length > 60 ? " narrowFont" : ""}`} dangerouslySetInnerHTML={{ __html: team?.updates?.teamNotesLocal }}></p>}
                        {inPlayoffs && width >= height && <p className={"playByPlayAlliance"}>{team?.alliance}{selectedEvent?.value?.name.includes("OFFLINE") ? <></> : <><br />{team.allianceRole}</>}</p>}
                    </>
                }
                {!team?.teamNumber && <>
                    <div className={"tbd"}>{adHocMode ? "No team selected" : "No fourth Alliance member"}</div>
                </>}
            </td>
        </>
    )
}

export default PlayByPlay;