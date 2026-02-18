import { Alert } from "react-bootstrap";
import moment from "moment";
import _ from "lodash";

const NotificationBanner = ({
  notification,
  systemBell = "",
  setSystemBell = null,
}) => {
  const visible =
    moment().isBefore(notification?.expiry) &&
    moment().isAfter(notification?.onTime) &&
    systemBell !== JSON.stringify(notification);
  const dismissable = !_.isNull(setSystemBell);
  return (
    <>
      {visible ? (
        <Alert
          className={notification?.variant}
          dismissible={dismissable}
          onClose={() => {
            setSystemBell(JSON.stringify(notification));
          }}
          variant={notification?.variant ? notification?.variant : "primary"}
          style={{ padding: "6px", marginBottom: "10px", fontSize: "1.5em" }}
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
};

export default NotificationBanner;
