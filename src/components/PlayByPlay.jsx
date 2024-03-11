import _ from "lodash";

function PlayByPlay({ station, team, inPlayoffs, selectedYear, selectedEvent, showNotes, showMottoes, showQualsStats, showQualsStatsQuals, adHocMode }) {
    var allianceColor = station.slice(0, -1);
    const portrait = window?.screen?.orientation.type.includes("landscape") ? "landscape" : "portrait";

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
                        {inPlayoffs && <p className={"playByPlayAlliance hideLandscape"}>{team?.alliance}<br />{team?.allianceRole}</p>}
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
                                            <td className={"wltCol"} style={team?.rankStyle}>Rank {team?.rank}<br />AV RP {team?.sortOrder1}</td><td className={"wltCol"}>Qual Avg<br />{team?.qualAverage}</td><td className={"wltCol"}>W-L-T<br />{team?.wins}-{team?.losses}-{team?.ties}</td>
                                        </tr>
                                        <tr><td colSpan={3}>Team high score: {team?.highScore?.score}<br />in {team?.highScore?.description}</td>
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
                        {(showNotes || _.isNull(showNotes)) && <p className={"notes playByPlayWinLossTie teamNotes"} dangerouslySetInnerHTML={{ __html: team?.updates?.teamNotesLocal }}></p>}
                        {inPlayoffs && <p className={"playByPlayAlliance showLandscape"}>{team?.alliance}<br />{team?.allianceRole}</p>}
                    </>
                }
                {!team?.teamNumber && <>
                    <div className={"tbd"}>{adHocMode ? "Please choose a team" : "No fourth Alliance member"}</div>
                </>}
            </td>
        </>
    )
}

export default PlayByPlay;