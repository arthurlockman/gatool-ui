import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { read, utils } from "xlsx";
import {
  Alert,
  Button,
  Container,
  Form,
  InputGroup,
  Row,
  Tab,
  Tabs,
} from "react-bootstrap";
import moment from "moment";
import _ from "lodash";
import NotificationBanner from "components/NotificationBanner";

function Developer({
  putNotifications,
  getNotifications,
  forceUserSync,
  getSyncStatus,
  systemBell,
  setSystemBell,
  resetCache,
}) {
  const { user, getAccessTokenSilently } = useAuth0();

  const [token, setToken] = useState(null);
  const [formattedUsers, setFormattedUsers] = useState(null);
  const [loadedUsers, setLoadedUsers] = useState(null);
  const [formattedMessage, setFormattedMessage] = useState({
    message: "",
    expiry: moment(),
    onTime: moment(),
    variant: "",
    link: "",
  });

  const [formValue, setFormValue] = useState({
    onTime: "",
    offTime: "",
    onDate: "",
    offDate: "",
    message: "",
    variant: "",
    link: "",
  });

  const [lastSyncData, setLastSyncData] = useState({
    timestamp: null,
    fullUsers: null,
    readOnlyUsers: null,
    deletedUsers: null,
  });

  useEffect(() => {
    async function getToken() {
      const tokenResponse = await getAccessTokenSilently({
        audience: `https://${
          process.env.REACT_APP_AUTH0_DOMAIN || "gatool.auth0.com"
        }/userinfo`,
        scope: "openid email profile",
        detailedResponse: true,
      });
      setToken(tokenResponse.id_token);
    }

    getToken();
  }, [getAccessTokenSilently, user]);

  useEffect(() => {
    setFormattedMessage({
      message: formValue?.message,
      expiry: formValue?.offDate
        ? moment(`${formValue?.offDate} ${formValue?.offTime}`)
        : null,
      onTime: formValue?.onDate
        ? moment(`${formValue?.onDate} ${formValue?.onTime}`)
        : null,
      variant: formValue?.variant || "",
      link: formValue?.link,
    });
  }, [formValue]);

  useEffect(() => {
    getSyncStatus().then((status) => {
      setLastSyncData(status);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * This function clicks the hidden file upload button
   * @function  clickLoadUsers
   */
  function clickLoadUsers() {
    document.getElementById("userUpload").click();
  }

  /**
   * This function clears the file input by removing and recreating the file input button
   *
   * @function clearFileInput
   * @param {string} id - The ID to delete and recreate
   */
  function clearFileInput(id) {
    const oldInput = document.getElementById(id);
    const newInput = document.createElement("input");
    newInput.type = "file";
    newInput.id = oldInput.id;
    // @ts-ignore
    newInput.name = oldInput.name;
    newInput.className = oldInput.className;
    newInput.style.cssText = oldInput.style.cssText;
    oldInput.parentNode.replaceChild(newInput, oldInput);
  }

  /**
   * This function receives a file from the upload button and parses the user list from the CSV.
   * It then returns Auth0 formatted JSON, which is displays to the user in a Text Area on screen.
   * It also destroys and recreates the button, and then re-attaches the proper event listener.
   *
   * @function handleUserUpload
   * @param {*} e - The file upload event, which contains a pointer to the file.
   */
  function handleUserUpload(e) {
    let files = e.target.files;
    let f = files[0];
    let reader = new FileReader();
    reader.onload = function (e) {
      //@ts-ignore
      const data = new Uint8Array(e.target.result);
      let workbook;
      try {
        workbook = read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const users = utils.sheet_to_json(worksheet);
        let auth0Users = [];
        try {
          if (users.length > 0) {
            auth0Users = users.map((user) => {
              return {
                user_id: user["Email Address"].toLowerCase(),
                email: user["Email Address"],
                email_verified: false,
              };
            });
            setFormattedUsers(JSON.stringify(auth0Users));
            setLoadedUsers("success");
          } else {
            setFormattedUsers("No users in file");
            setLoadedUsers("danger");
          }
        } catch (err) {
          setFormattedUsers(err.message);
          setLoadedUsers("danger");
        }
      } catch (err) {
        setFormattedUsers(err.message);
        setLoadedUsers("danger");
      }
      clearFileInput("userUpload");
      document
        .getElementById("userUpload")
        .addEventListener("change", handleUserUpload);
    };
    reader.readAsArrayBuffer(f);
  }

  /**
   * This function creates a downloadable file from an object
   * @function downloadObjectAsJson
   * @param {string} exportName - The name of the file
   * @param {Object} exportObj - The object you want to include in the file
   */
  function downloadObjectAsJson(exportObj, exportName) {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(exportObj));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  /**
   * This function handles setting parts of the form value
   * @function handleFormValue
   * @param {string} key - The property you want to set
   * @param {string} value - The value of the property you want to set
   */
  const handleFormValue = (key, value) => {
    const tempFormValue = _.cloneDeep(formValue);
    tempFormValue[key] = value;
    setFormValue(tempFormValue);
  };

  const handleMessage = async () => {
    console.log(formValue);
    const submission = {
      message: formValue.message,
      onTime: formValue.onTime,
      offTime: formValue.offTime,
      onDate: formValue.onDate,
      offDate: formValue.offDate,
      variant: formValue.variant,
      link: formValue.link,
    };
    const result = await putNotifications(submission);
    if (result.status === 200) {
      console.log("message set.");
    } else {
      console.log("message not set.");
    }
  };

  const handleGetMessage = async () => {
    const message = await getNotifications();
    console.log(message);
    setFormValue(message);
    setFormattedMessage({
      message: formValue?.message,
      expiry: moment(`${formValue?.offDate} ${formValue?.offTime}`),
      onTime: moment(`${formValue?.onDate} ${formValue?.onTime}`),
      variant: formValue?.variant || "",
      link: formValue?.link,
    });
  };

  const handleResetCache = async () => {
    resetCache();
  };

  return (
    <>
      <br />
      {user["https://gatool.org/roles"].indexOf("admin") >= 0 ? (
        <Tabs defaultActiveKey="tools" id="dev-tools-tabs" className="mb-3">
          <Tab eventKey="tools" title="Dev Tools">
            <Container>
              <Form.Control
                as="textarea"
                rows={3}
                value={token ? token : ""}
                readOnly
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(token);
                }}
              >
                Copy token to Clipboard
              </Button>
            </Container>
            <Container>
              <br />
              If you suspect that there are cached data that need to be
              released, you can clear the cache on the server side here.
              <br />
              <Button variant="danger" onClick={handleResetCache}>
                Clear Cache
              </Button>
            </Container>
          </Tab>
          <Tab eventKey="users" title="User Management">
            <Container>
              <Button onClick={forceUserSync} type="button" variant="primary">
                Sync users with Mailchimp
              </Button>
              <div>
                <h3>
                  Last Sync time:{" "}
                  {lastSyncData &&
                    moment(lastSyncData.timestamp).format(
                      "ddd, MMM Do YYYY, h:mm:ss a"
                    )}
                </h3>
                <p>Full users: {lastSyncData && lastSyncData.fullUsers}</p>
                <p>
                  Read only users: {lastSyncData && lastSyncData.readOnlyUsers}
                </p>
                <p>
                  Deleted users: {lastSyncData && lastSyncData.deletedUsers}
                </p>
              </div>
              <br />
              <div>
                <input
                  type="file"
                  id="userUpload"
                  onChange={handleUserUpload}
                  className={"hiddenInput"}
                />
              </div>

              <Button style={{ cursor: "pointer" }} onClick={clickLoadUsers}>
                <img
                  style={{ float: "left" }}
                  width="50"
                  src="images/excelicon.png"
                  alt="Excel Logo"
                />
                {loadedUsers ? (
                  <>Load new user list</>
                ) : (
                  <>Load user list from Mailchimp</>
                )}
              </Button>
              <div>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formattedUsers ? formattedUsers : ""}
                  readOnly
                />
                {loadedUsers && (
                  <Button
                    variant={loadedUsers ? loadedUsers : "primary"}
                    onClick={() => {
                      if (loadedUsers !== "danger") {
                        navigator.clipboard.writeText(formattedUsers);
                        downloadObjectAsJson(
                          JSON.parse(formattedUsers),
                          "Auth0JSON" + moment().format("MMDDYYYY_HHmmss")
                        );
                        setLoadedUsers("info");
                      }
                    }}
                  >
                    {loadedUsers === "info" ? (
                      <>Users have been downloaded</>
                    ) : loadedUsers === "danger" ? (
                      <>Error in file</>
                    ) : (
                      <>Download users to JSON file</>
                    )}
                  </Button>
                )}
              </div>
            </Container>
          </Tab>
          <Tab eventKey="notifications" title="Notifications">
            <Container>
              <Form>
                <NotificationBanner
                  notification={formattedMessage}
                  systemBell={systemBell}
                  setSystemBell={setSystemBell}
                ></NotificationBanner>
                <Form.Group className="mb-3" controlId="systemNotification">
                  <Form.Label>Notification</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formValue.message}
                    placeholder="Enter message"
                    onChange={(e) => handleFormValue("message", e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="notificationLink">
                  <Form.Label>Link for Notfication</Form.Label>
                  <Form.Control
                    type="text"
                    value={formValue.link}
                    placeholder="Enter URL"
                    onChange={(e) => handleFormValue("link", e.target.value)}
                  />
                </Form.Group>
                <Form.Group controlId="variant">
                  <Form.Label>Variant</Form.Label>
                  <Form.Select
                    value={formValue.variant}
                    onChange={(e) => handleFormValue("variant", e.target.value)}
                  >
                    <option value={"info"}>Info</option>
                    <option value={"success"}>All OK</option>
                    <option value={"warning"}>Warning</option>
                    <option value={"danger"}>Urgent</option>
                  </Form.Select>
                </Form.Group>

                <InputGroup>
                  <Form.Group className="mb-3" controlId="onDate">
                    <Form.Label>On Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={formValue.onDate}
                      onChange={(e) =>
                        handleFormValue("onDate", e.target.value)
                      }
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="onTime">
                    <Form.Label>On Time</Form.Label>
                    <Form.Control
                      type="time"
                      value={formValue.onTime}
                      onChange={(e) =>
                        handleFormValue("onTime", e.target.value)
                      }
                    />
                  </Form.Group>
                </InputGroup>

                <InputGroup>
                  <Form.Group className="mb-3" controlId="offDate">
                    <Form.Label>Off Date</Form.Label>
                    <Form.Control
                      type="date"
                      placeholder=""
                      value={formValue.offDate}
                      onChange={(e) =>
                        handleFormValue("offDate", e.target.value)
                      }
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="offTime">
                    <Form.Label>Off Time</Form.Label>
                    <Form.Control
                      type="time"
                      placeholder=""
                      value={formValue.offTime}
                      onChange={(e) =>
                        handleFormValue("offTime", e.target.value)
                      }
                    />
                  </Form.Group>
                </InputGroup>

                <Button variant="secondary" onClick={handleGetMessage}>
                  Get Message
                </Button>
                <Button variant="primary" onClick={handleMessage}>
                  Submit
                </Button>
                <Row>
                  <br />
                  <br />
                </Row>
              </Form>
            </Container>
          </Tab>
        </Tabs>
      ) : (
        <Alert variant={"warning"}>
          You're not authorized to use this page.
        </Alert>
      )}
    </>
  );
}

export default Developer;
