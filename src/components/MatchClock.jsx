import React, { useState, useEffect } from 'react';
import moment from 'moment/moment';
import { Col } from 'react-bootstrap';

const MatchClock = ({ matchDetails, timeFormat }) => {
    const [currentTime, setCurrentTime] = useState(moment());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(moment());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

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
            {!matchDetails?.actualStartTime && <div>Scheduled match time:<br />{moment(matchDetails?.startTime).format("MMM Do, " + timeFormat.value)}</div>}
        </Col>
    );
};

export default MatchClock;