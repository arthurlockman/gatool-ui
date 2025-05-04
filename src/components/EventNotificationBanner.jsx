import { Alert } from "react-bootstrap";
import moment from "moment";
import _ from "lodash";

const EventNotificationBanner = ({
  notifications = [],
  eventBell = [],
  setEventBell = null,
}) => {
  const handleEventBell = (signal) => {
    var bell = _.cloneDeep(eventBell);
    if (_.indexOf(bell, JSON.stringify(signal)) === -1) {
      bell.push(JSON.stringify(signal));
      setEventBell(bell);
    }
  };

  return notifications.map((notification) => {
    const visible =
      moment().isBefore(notification?.expiry) &&
      moment().isAfter(notification?.onTime) &&
      _.indexOf(eventBell, JSON.stringify(notification)) === -1;
    const dismissable = !_.isNull(eventBell);
    return (
      <>
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
      </>
    );
  });
};

export default EventNotificationBanner;
