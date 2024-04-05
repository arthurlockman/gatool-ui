import { Alert } from "react-bootstrap";
import moment from "moment";

const NotificationBanner = ({ notification }) => {
    const visible = moment().isBefore(notification?.expiry) && moment().isAfter(notification?.onTime);
    return (
        <>
        {visible ? 
        <Alert onClick={()=>{if (notification?.link !== ""){window.open(notification?.link);}}} variant={notification?.variant ? notification?.variant : "primary"} style={{padding:"6px",marginBottom:"2px"}}><b>{notification?.message}</b></Alert> : <></>}
        </>
    )

}

export default NotificationBanner
