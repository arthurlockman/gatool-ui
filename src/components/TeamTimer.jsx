
import moment from 'moment/moment';

function getInteractiveProps(editable, handleShow, team) {
    if (!editable) return {};

    const openTeam = (event) => {
        if (event.type === "keydown" && event.key !== "Enter" && event.key !== " ") return;
        if (event.type === "keydown") event.preventDefault();
        handleShow(team, event);
    };

    return {
        onClick: openTeam,
        onKeyDown: openTeam,
        role: "button",
        tabIndex: 0,
    };
}

function getVisitStatus(lastVisitAt, stale) {
    if (lastVisitAt) return moment(lastVisitAt).fromNow();
    if (stale) return <b><i>Needs review!</i></b>;
    return "No recent visit.";
}

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

    const teamNumber = team?.teamNumber;
    const lastVisitAt = lastVisit[`${teamNumber}`];
    const stale = updateWarning(team?.updates?.lastUpdate);
    const interactiveProps = getInteractiveProps(editable, handleShow, team);
    const className = `${editable ? "teamNumberButton " : ""}${lastVisitAt ? "teamTableButtonHighlight" : ""}${stale ? " staleTeam" : ""}`;

    return (
        <td className={className} {...interactiveProps} key={"teamData" + teamNumber}><span className={"teamDataNumber"}>{team?.displayTeamNumber || teamNumber}</span><br />{getVisitStatus(lastVisitAt, stale)}</td>
    );
};

export default TeamTimer;
