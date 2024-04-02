import { useState, useEffect } from 'react';
import moment from 'moment/moment';
import { Col } from 'react-bootstrap';
import { useInterval } from 'react-interval-hook';

const MatchClock = ({ matchDetails, timeFormat }) => {
    const [currentTime, setCurrentTime] = useState(moment());

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
        if (matchDetails) {
            start()
        } else { stop() }
    }, [matchDetails, start, stop]);

    //display the delay on the Announce Screen if we have a schedule
    var timeDifference = 0;
    var matchDelay = "";
    if (matchDetails?.actualStartTime) {
        timeDifference = moment(matchDetails?.actualStartTime).diff(matchDetails?.startTime, "minutes");
        if (timeDifference < 0) {
            matchDelay = "alert-success";
        } else if ((timeDifference >= 0) && (timeDifference < 10)) {
            matchDelay = "alert-success";
        } else if ((timeDifference >= 10) && (timeDifference < 20)) {
            matchDelay = "alert-warning";
        } else if (timeDifference >= 20) {
            matchDelay = "alert-danger";
        }
    } else {
        timeDifference = moment(currentTime).diff(matchDetails?.startTime, "minutes");
        if (timeDifference < 0) {
            matchDelay = "alert-success";
        } else if ((timeDifference >= 0) && (timeDifference < 10)) {
            matchDelay = "alert-success";
        } else if ((timeDifference >= 10) && (timeDifference < 20)) {
            matchDelay = "alert-warning";
        } else if (timeDifference >= 20) {
            matchDelay = "alert-danger";
        }

    }
    return (
        <Col xs={"3"} lg={"2"} className={matchDelay}>
            <div><b>{moment(currentTime).format(timeFormat.value)}</b></div>
            {matchDetails?.actualStartTime && <div>Actual match time:<br />{moment(matchDetails?.actualStartTime).format("MMM Do, " + timeFormat.value)}</div>}
            {!matchDetails?.actualStartTime && matchDetails?.startTime && <div><h5><b>{Math.abs(timeDifference)} minutes {timeDifference <=0 ? "ahead" : "behind"}</b></h5></div>}
            {!matchDetails?.actualStartTime && !matchDetails?.startTime && <div><h5><b>Unscheduled</b></h5></div>}
        </Col>
    );
};

export default MatchClock;