import React from "react";
import { Alert } from "react-bootstrap";
import moment from "moment";
import _ from "lodash";

const EventNotificationBanner = ({
  notifications = [],
  eventBell = [],
  setEventBell = null,
}) => {
  const EVENT_BELL_MAX = 200;

  const handleEventBell = (signal) => {
    var bell = _.cloneDeep(eventBell);
    const serialized = JSON.stringify(signal);
    if (_.indexOf(bell, serialized) === -1) {
      bell.push(serialized);
      // Prevent unbounded growth: keep only the most recent entries
      if (bell.length > EVENT_BELL_MAX) {
        bell = bell.slice(bell.length - EVENT_BELL_MAX);
      }
      setEventBell(bell);
    }
  };

  return notifications.map((notification, index) => {
    const visible =
      moment().isBefore(notification?.expiry) &&
      moment().isAfter(notification?.onTime) &&
      _.indexOf(eventBell, JSON.stringify(notification)) === -1;
    const dismissable = !_.isNull(eventBell);
    const key = notification?.message != null ? `event-notif-${index}-${String(notification.message).slice(0, 40)}` : `event-notif-${index}`;
    return (
      <React.Fragment key={key}>
        {visible ? (
          <Alert
            dismissible={dismissable}
            onClose={() => {
              handleEventBell(notification);
            }}
            variant={notification?.variant ? notification?.variant : "primary"}
            style={{ padding: "6px", marginBottom: "2px" }}
          >
            <b>{notification?.message}</b>
            {notification?.link ? (
              <Alert.Link
                onClick={() => {
                  if (notification?.link) {
                    window.open(notification?.link);
                  }
                }}
              >
                {" "}
                Learn more
              </Alert.Link>
            ) : (
              <></>
            )}
          </Alert>
        ) : (
          <></>
        )}
      </React.Fragment>
    );
  });
};

export default EventNotificationBanner;
