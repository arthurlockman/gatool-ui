
import moment from 'moment/moment';


const TeamTimer = ({ team, lastVisit, monthsWarning, handleShow, currentTime, editable = true }) => {

    /**
     * /Display a warning on the Team Data screen if the data is over 6 months old
     * @param {moment.Moment} updateTime 
     */
    function updateWarning(updateTime) {
        var timeDifference = 0;
        var updateDelay = false;
        timeDifference = moment(currentTime).diff(updateTime, "months");
        if (timeDifference >= monthsWarning?.value) {
            updateDelay = true;
        }
        return updateDelay
    }

    const openTeam = (event) => {
        if (!editable) return;
        if (event.type === "keydown" && event.key !== "Enter" && event.key !== " ") return;
        if (event.type === "keydown") event.preventDefault();
        handleShow(team, event);
    };

    return (
        <td className={`${editable ? "teamNumberButton " : ""}${lastVisit[`${team?.teamNumber}`] ? "teamTableButtonHighlight" : ""}${updateWarning(team?.updates?.lastUpdate) ? " staleTeam" : ""}`} onClick={editable ? openTeam : undefined} onKeyDown={editable ? openTeam : undefined} role={editable ? "button" : undefined} tabIndex={editable ? 0 : undefined} key={"teamData" + team?.teamNumber}><span className={"teamDataNumber"}>{team?.displayTeamNumber || team?.teamNumber}</span><br />{lastVisit[`${team?.teamNumber}`] ? moment(lastVisit[`${team?.teamNumber}`]).fromNow() : updateWarning(team?.updates?.lastUpdate) ? <b><i>Needs review!</i></b> : "No recent visit."}</td>
    );
};

export default TeamTimer;
