import { useEffect } from 'react';
import moment from 'moment/moment';
import { useInterval } from 'react-interval-hook';

const TeamTimer = ({ team, lastVisit, monthsWarning, handleShow, currentTime, setCurrentTime }) => {

    const { start, stop } = useInterval(
        () => {
            setCurrentTime(moment());
        },
        1000,
        {
            autoStart: true,
            immediate: false,
            selfCorrecting: true,
            onFinish: () => {
                console.log('Event refresh stopped at Match Clock level.');
            },
        }
    )

    // Automatically updates the curent time. Checks every second if active.
    useEffect(() => {
        if (team) {
            start()
        } else { stop() }
    }, [team, start, stop]);

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

    return (
        <td className={`teamNumberButton ${lastVisit[`${team?.teamNumber}`] ? "teamTableButtonHighlight" : ""}${updateWarning(team.lastUpdate) ? " staleTeam" : ""}`} onClick={(e) => handleShow(team, e)} key={"teamData" + team?.teamNumber}><span className={"teamDataNumber"}>{team?.teamNumber}</span><br />{lastVisit[`${team?.teamNumber}`] ? moment(lastVisit[`${team?.teamNumber}`]).fromNow() : updateWarning(team.lastUpdate) ? <b><i>Needs review!</i></b> : "No recent visit."}</td>
    );
};

export default TeamTimer;