
import _ from "lodash";

const announceBackground = { "red": "#F7B3B4", "blue": "#98B4F4" }

function Announce({ station, team, inPlayoffs, awardsMenu, selectedYear, selectedEvent, showNotesAnnounce, showAwards, showMinorAwards, showSponsors, autoHideSponsors, showMottoes, showChampsStats, eventNamesCY, showDistrictChampsStats, playoffOnly, ftcMode, showBlueBanners, remapNumberToString }) {
    const originalAndSustaining = ["20", "45", "126", "148", "151", "157", "190", "191", "250"];
    var allianceColor = station.slice(0, -1);
    var awardsYears = team?.awards ? Object.keys(team.awards) : []
    var awards = [];
    awardsYears.forEach((year) => {
        team?.awards[year]?.awards.forEach((award) => {
            awards.push(award);
        })
    })
    awards = _.orderBy(awards, ["year", "highlight", "name"], ['desc', 'desc', 'asc']);
    var years = 1 + Number(selectedYear?.value) - Number(team?.rookieYear);
    if (typeof team?.updates?.teamYearsNoCompeteLocal !== "undefined") { years -= team?.updates?.teamYearsNoCompeteLocal }
    var yearsDisplay = "th";
    if (years.toString().endsWith("1")) { yearsDisplay = "st" }
    if (years.toString().endsWith("2")) { yearsDisplay = "nd" }
    if (years.toString().endsWith("3")) { yearsDisplay = "rd" }
    if (years.toString() === "11" || years.toString() === "12" || years.toString() === "13") { yearsDisplay = "th" }
    if (years.toString() === "1") { yearsDisplay = "Rookie" };
    
    // Display remapped team number if available
    const displayTeamNumber = remapNumberToString ? remapNumberToString(team.teamNumber) : team.teamNumber;

    return (
        <><tr key={station} className={`gatool-announce ${_.toLower(allianceColor)}Alliance`} >
            <td className={'col1'} style={{ backgroundColor: _.toLower(allianceColor) === "red" ? announceBackground.red : announceBackground.blue }}>
                <span className={"announceTeamNumber"} ><b>{displayTeamNumber}</b></span><br />
                {team?.updates?.sayNumber && <span className={"playByPlaysayNumber"}>{team.updates?.sayNumber}<br /></span>}
                <span >{team?.rookieYear}<br />({years === 1 ? "" : years}{yearsDisplay} season)</span>
                {inPlayoffs && <p className={"announceAlliance"}>{team.alliance}{(selectedEvent?.value?.name.includes("OFFLINE") && !playoffOnly) ? <></> : <><br />{team.allianceRole}</>}</p>}
            </td>
            <td className={'col2'} style={{ backgroundColor: _.toLower(allianceColor) === "red" ? announceBackground.red : announceBackground.blue }}>
                <span className={"teamName"}>{team?.updates?.nameShortLocal ? team?.updates?.nameShortLocal : team?.nameShort}</span><br />
                <span>{team?.updates?.cityStateLocal ? team?.updates?.cityStateLocal : `${team?.city}, ${team?.stateProv}${team?.country !== "USA" ? `, ${team?.country}` : ""}`}</span><br />
                {(team?.updates?.robotNameLocal || team?.robotName )&& <span className={"robotName"}>{team?.updates?.robotNameLocal?team?.updates?.robotNameLocal:team?.robotName}<br /></span>}
                {team?.updates?.teamMottoLocal && (showMottoes || _.isNull(showMottoes)) && <span className={"mottoes"}>{team?.updates?.teamMottoLocal}<br /></span>}
                {(selectedEvent?.value?.champLevel === "CHAMPS" || selectedEvent?.value?.champLevel === "CMPDIV" || selectedEvent?.value?.champLevel === "CMPSUB") && showChampsStats &&
                    <span className={"champs"}>
                        {team?.champsAppearances?.champsAppearances > 0 && <span><b>{team?.champsAppearances?.champsAppearances} Champs Appearance{team?.champsAppearances?.champsAppearances > 1 ? "s" : ""}</b><br /></span>}
                        {team?.champsAppearances?.champsAppearances > 0 && <span>
                            {team?.champsAppearances?.champsAppearancesYears?.join(", ")}
                            <br /></span>}
                        {team?.champsAppearances?.einsteinAppearances > 0 && <span><b>{team?.champsAppearances?.einsteinAppearances} Einstein Appearance{team?.champsAppearances?.einsteinAppearances > 1 ? "s" : ""}</b><br /></span>}
                        {team?.champsAppearances?.einsteinAppearances > 0 && <span>
                            {team?.champsAppearances?.einsteinAppearancesYears?.join(", ")}
                            <br /></span>}
                        {team?.champsAppearances?.FOCAppearances > 0 && <span><b>Festival of Champions Team</b><br />{team?.champsAppearances?.FOCAppearancesYears?.join(", ")}</span>}
                    </span>}
                {(selectedEvent?.value?.champLevel === "DISTCHAMPS" || selectedEvent?.value?.champLevel === "DISTDIV" || (showDistrictChampsStats && inPlayoffs)) && showChampsStats && <span className={"champs"}>
                    {team?.champsAppearances?.districtChampsAppearances > 0 && <span><b>{team?.champsAppearances?.districtChampsAppearances} District Champs Appearance{team?.champsAppearances?.districtChampsAppearances > 1 ? "s" : ""}</b><br /></span>}
                    {team?.champsAppearances?.districtChampsAppearances > 0 && <span>
                        {team?.champsAppearances?.districtChampsAppearancesYears?.join(", ")}
                        <br /></span>}
                    {team?.champsAppearances?.districtEinsteinAppearances > 0 && <span><b>{team?.champsAppearances?.districtEinsteinAppearances} District Einstein Appearance{team?.champsAppearances?.districtEinsteinAppearances > 1 ? "s" : ""}</b><br /></span>}
                    {team?.champsAppearances?.districtEinsteinAppearances > 0 && <span>
                        {team?.champsAppearances?.districtEinsteinAppearancesYears?.join(", ")}
                        <br /></span>}
                </span>}
                {showBlueBanners && team?.blueBanners?.blueBanners > 0 && (() => {
                    const totalChairmansImpact = (team?.blueBanners?.regionalChairmans || 0) + 
                        (team?.blueBanners?.districtChairmans || 0) + 
                        (team?.blueBanners?.einsteinChairmans || 0) + 
                        (team?.blueBanners?.regionalImpact || 0) + 
                        (team?.blueBanners?.districtImpact || 0) + 
                        (team?.blueBanners?.einsteinImpact || 0) +
                        (team?.blueBanners?.einsteinChairmansFinalist || 0) +
                        (team?.blueBanners?.einsteinImpactFinalist || 0);
                    const totalWoodieFlowersFinalists = (team?.blueBanners?.regionalWoodieFlowers || 0) +
                        (team?.blueBanners?.districtWoodieFlowers || 0) +
                        (team?.blueBanners?.districtChampionshipWoodieFlowers || 0);
                    const totalWoodieFlowersWinners = (team?.blueBanners?.championshipWoodieFlowers || 0);
                    return (
                        <span className={"champs"}>
                            <span><b>{team?.blueBanners?.blueBanners} Blue Banner{team?.blueBanners?.blueBanners > 1 ? "s" : ""}</b><br /></span>
                            {team?.blueBanners?.regionalWins > 0 && <span>  {team?.blueBanners?.regionalWins} Regional Win{team?.blueBanners?.regionalWins > 1 ? "s" : ""}<br /></span>}
                            {team?.blueBanners?.districtWins > 0 && <span>  {team?.blueBanners?.districtWins} District Win{team?.blueBanners?.districtWins > 1 ? "s" : ""}<br /></span>}
                            {team?.blueBanners?.districtChampionshipWins > 0 && <span>  {team?.blueBanners?.districtChampionshipWins} District Championship Win{team?.blueBanners?.districtChampionshipWins > 1 ? "s" : ""}<br /></span>}
                            {team?.blueBanners?.championshipDivisionWins > 0 && <span>  {team?.blueBanners?.championshipDivisionWins} Championship Division Win{team?.blueBanners?.championshipDivisionWins > 1 ? "s" : ""}<br /></span>}
                            {team?.blueBanners?.einsteinWins > 0 && <span>  {team?.blueBanners?.einsteinWins} Einstein Win{team?.blueBanners?.einsteinWins > 1 ? "s" : ""}<br /></span>}
                            {totalChairmansImpact > 0 && <span>  <b>{totalChairmansImpact} Chairman's/Impact Award{totalChairmansImpact > 1 ? "s" : ""}<br /></b></span>}
                            {team?.blueBanners?.einsteinChairmans > 0 && <span>    <b>{team?.blueBanners?.einsteinChairmans} Chairman's Award{team?.blueBanners?.einsteinChairmans > 1 ? "s" : ""}<br /></b></span>}
                            {team?.blueBanners?.einsteinImpact > 0 && <span>    <b>{team?.blueBanners?.einsteinImpact} Impact Award{team?.blueBanners?.einsteinImpact > 1 ? "s" : ""}<br /></b></span>}
                            {team?.blueBanners?.einsteinChairmansFinalist > 0 && <span>    <b>{team?.blueBanners?.einsteinChairmansFinalist} Chairman's Award Finalist{team?.blueBanners?.einsteinChairmansFinalist > 1 ? "s" : ""}<br /></b></span>}
                            {team?.blueBanners?.einsteinImpactFinalist > 0 && <span>    <b>{team?.blueBanners?.einsteinImpactFinalist} Impact Award Finalist{team?.blueBanners?.einsteinImpactFinalist > 1 ? "s" : ""}<br /></b></span>}
                            {team?.blueBanners?.regionalChairmans > 0 && <span>    {team?.blueBanners?.regionalChairmans} Regional Chairman's Award{team?.blueBanners?.regionalChairmans > 1 ? "s" : ""}<br /></span>}
                            {team?.blueBanners?.districtChairmans > 0 && <span>    {team?.blueBanners?.districtChairmans} District Chairman's Award{team?.blueBanners?.districtChairmans > 1 ? "s" : ""}<br /></span>}
                            {team?.blueBanners?.regionalImpact > 0 && <span>    {team?.blueBanners?.regionalImpact} Regional Impact Award{team?.blueBanners?.regionalImpact > 1 ? "s" : ""}<br /></span>}
                            {team?.blueBanners?.districtImpact > 0 && <span>    {team?.blueBanners?.districtImpact} District Impact Award{team?.blueBanners?.districtImpact > 1 ? "s" : ""}<br /></span>}
                            {totalWoodieFlowersFinalists > 0 && <span>  {totalWoodieFlowersFinalists} Woodie Flowers Finalist{totalWoodieFlowersFinalists > 1 ? "s" : ""}<br /></span>}
                            {totalWoodieFlowersWinners > 0 && <span>  {totalWoodieFlowersWinners} Woodie Flowers Award{totalWoodieFlowersWinners > 1 ? "s" : ""}<br /></span>}
                        </span>
                    );
                })()}
            </td>
            <td className={'col7'} style={{ backgroundColor: _.toLower(allianceColor) === "red" ? announceBackground.red : announceBackground.blue }}>
                <p className={"announceOrganization"}>{team?.updates?.organizationLocal ? team?.updates?.organizationLocal : team?.organization}</p>
                {(showSponsors || ((autoHideSponsors || _.isNull(autoHideSponsors)) && !team?.rank)) &&
                    ((selectedEvent?.value?.type === "Championship" || selectedEvent?.value?.type === "ChampionshipDivision") ?
                        <p className={"sponsors"} >{team?.updates?.topSponsorLocal ? team?.updates?.topSponsorLocal : team?.topSponsor}</p> :
                        <p className={"sponsors"} >{team?.updates?.topSponsorsLocal ? team?.updates?.topSponsorsLocal : team?.topSponsors}</p>)
                }
                <p className={`HOF${allianceColor}`}>
                    {originalAndSustaining.includes(String(team?.teamNumber)) && <span>Original and Sustaining Team<br /></span>}
                    {team?.hallOfFame ? team?.hallOfFame.map((award) => {
                        return <span key={award.year + award.type + award.challenge} className={`HOF${allianceColor} ${(award.type === "chairmans" || award.type === "impact") ? "HOF" : ""}`}>{award.year} {award.type === "chairmans" ? "Chairman's Award" : award.type === "impact" ? "FIRST Impact Award" : "Winner"} {award.challenge}<br /></span>
                    }) : ""}
                </p>
                {(team?.qualifiedDistrictCmp || team?.qualifiedFirstCmp) &&
                    <p className={"champsQualifiedAnnounce"}>
                        {(team?.qualifiedDistrictCmp && (selectedEvent?.value?.champLevel === "")) && <>Qualified for District Champs
                            {team?.qualifiedFirstCmp && <br />}
                        </>}
                        {team?.qualifiedFirstCmp && (selectedEvent?.value?.champLevel !== "CMPDIV" && selectedEvent?.value?.champLevel !== "CMPSUB" && selectedEvent?.value?.champLevel !== "CMPSUB") && <>Qualified for World Champs</>}
                    </p>}
                {awards && (showAwards || _.isNull(showAwards)) && <p className={"awards"}>
                    {awards.map((award, index) => {
                        let formattedAward = <></>;
                        if (award.year > selectedYear.value - (awardsMenu?.value || 3)) {
                            if (!award.highlight && (showMinorAwards || _.isNull(showMinorAwards))) {
                                formattedAward = <span key={award?.year + award?.eventName + award?.name + award?.person + team?.teamNumber + index} >{award.year} {_.findIndex(eventNamesCY[award.eventName]) >= 0 ? eventNamesCY[award.eventName] : award.eventName} : {award.name}{award.person ? ` : ${award.person}` : ""}<br /></span>
                            } else {
                                if (award.highlight) {
                                    formattedAward = <span key={award?.year + award?.eventName + award?.name + award?.person + team?.teamNumber + index} className={"awardHilight"}>{award.year} {_.findIndex(eventNamesCY[award.eventName]) >= 0 ? eventNamesCY[award.eventName] : award.eventName} : {award.name}{award.person ? ` : ${award.person}` : ""}<br /></span>
                                }
                            }
                        }
                        return formattedAward

                    })}


                </p>}
                {(showNotesAnnounce || _.isNull(showNotesAnnounce)) && <p className="teamNotes" dangerouslySetInnerHTML={{ __html: team?.updates?.teamNotesLocal }} />}
            </td>
            <td className={"col1 ranking"} style={team?.rankStyle.backgroundColor === "" ? { backgroundColor: _.toLower(allianceColor) === "red" ? announceBackground.red : announceBackground.blue } : team?.rankStyle}>
                {team?.rank ? team?.rank : ""}
            </td>
        </tr>
        </>
    )
}

export default Announce;