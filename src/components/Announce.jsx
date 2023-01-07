import { Row, Col } from 'react-bootstrap';
import _ from "lodash";

function Announce({ station, team, inPlayoffs }) {
    var allianceColor = station.slice(0, -1);
    var awardsYears = Object.keys(team?.awards)
    var awards = [];
    awardsYears.forEach((year) => {
        team?.awards[year]?.Awards.forEach((award) => {
            awards.push(award);
        })
    })
    awards = _.orderBy(awards,["year","highlight","name"], ['desc', 'desc', 'asc']);

    return (
        <><Row key={station} className={`gatool-announce ${_.toLower(allianceColor)}Alliance`} >
            <Col xs={1} >
                <span className={"announceTeamNumber"} ><b>{team.teamNumber}</b></span><br />
                {team?.updates?.sayNumber && <span >{team.updates.sayNumber}<br /></span>}
                <span >{team?.rookieYear}</span>
                {inPlayoffs && <p id="red1Alliance" className={"announceAlliance"}>{team.alliance}<br />{team.allianceRole}</p>}
            </Col>
            <Col xs={2}>
                <span className={"teamName"}>{team?.updates?.nameShortLocal ? team?.updates?.nameShortLocal : team?.nameShort}</span><br />
                <span id="red1CityState">{team?.updates?.cityStateLocal ? team?.updates?.CityStateLocal : team?.city + ", " + team?.stateProv}</span><br />
                {team?.updates?.robotNameLocal && <span id="red1RobotName" className={"robotName"}>{team?.updates?.robotNameLocal}<br /></span>}
                {team?.updates?.teamMottoLocal && <span id="red1Motto" className={"mottoes"}>{team?.updates?.teamMottoLocal}<br /></span>}
                <span id="red1Champs" className={"champs"}>champs stats</span>
            </Col>
            <Col xs={7}>
                <p className={"announceOrganization"}>{team?.updates?.organizationLocal ? team?.updates?.organizationLocal : team?.schoolName}</p>
                <p className={"sponsors"} id="red1Sponsors">{team?.updates?.topSponsorsLocal ? team?.updates?.topSponsorsLocal : team?.topSponsors}</p>
                <p className={`HOF${allianceColor}`}>
                    {team?.hallOfFame.map((award)=>{
                        return <span key={award.year+award.type+award.challenge} className={`HOF${allianceColor}`}>{award.year} {award.type==="chairmans" ? "Chairman's Award" : "Winner"} {award.challenge}<br /></span>
                    })}
                    </p>
                <p id="red1Awards" className={"awards"}>
                        {awards.map((award) => {
                            return <span key={award.year+award.eventName+award.name+award.person+team.teamNumber} className={award.highlight ? "awardHilight" : ""}>{award.year} {award.eventName} : {award.name}{award.person ? ` : ${award.person}` : ""}<br /></span>
                        })}


                </p>
                <p id="red1Notes" className={"notes"}></p>
            </Col>
            <Col xs={1} className={"ranking"} >
                <div style={team?.rankStyle}>{team?.rank ? team?.rank : ""}</div>
            </Col>
        </Row>
        </>
    )
}

export default Announce;