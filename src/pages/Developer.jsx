import { useAuth } from "../contextProviders/AuthProvider";
import { useEffect, useState } from "react";
import Select from "react-select";
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
import { toast } from "react-toastify";
import NotificationBanner from "components/NotificationBanner";
import { UseAuthClient } from "../contextProviders/AuthClientContext";

const BASE_ROLES = [
  { name: "user", label: "User", description: "Base application access" },
  { name: "admin", label: "Admin", description: "System administrator access" },
];
const MIN_USER_QUERY_LENGTH = 2;
const USER_SEARCH_DEBOUNCE_MS = 300;

async function fetchUsers(httpClient, query, signal) {
  const response = await httpClient.get(
    `system/users?query=${encodeURIComponent(query)}&limit=20`,
    30000,
    signal
  );
  if (response?._aborted) return null;
  if (response?.status !== 200 || typeof response.json !== "function") {
    throw new Error(response?.statusText || "Could not load users");
  }
  return response.json();
}

function Developer({
  putNotifications,
  getNotifications,
  getSyncStatus,
  systemBell,
  setSystemBell,
  resetCache,
  putUserPrefs,
  getUserPrefs,
}) {
  const { user, getAccessToken } = useAuth();
  const [httpClient] = UseAuthClient();
  const isAdmin = user?.["https://gatool.org/roles"]?.includes("admin");

  const [token, setToken] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [userOptions, setUserOptions] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [updatingRole, setUpdatingRole] = useState("");
  const [roleResult, setRoleResult] = useState(null);
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

  const [lastSyncData, setLastSyncData] = useState(null);

  const [userPrefsResult, setUserPrefsResult] = useState(null);
  const [userPrefsLoading, setUserPrefsLoading] = useState(false);

  useEffect(() => {
    async function fetchToken() {
      try {
        const t = await getAccessToken();
        setToken(t);
      } catch (e) {
        setToken(null);
      }
    }
    fetchToken();
  }, [getAccessToken, user]);

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

  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    setRolesLoading(true);
    setRolesError("");
    httpClient
      .get("system/roles")
      .then(async (response) => {
        if (response?.status !== 200 || typeof response.json !== "function") {
          throw new Error(response?.statusText || "Could not load roles");
        }
        const roles = await response.json();
        if (active) setAvailableRoles(Array.isArray(roles) ? roles : []);
      })
      .catch(() => {
        if (active) setRolesError("Could not load manageable roles.");
      })
      .finally(() => {
        if (active) setRolesLoading(false);
      });
    return () => {
      active = false;
    };
  }, [httpClient, isAdmin]);

  useEffect(() => {
    const query = userQuery.trim();
    if (query.length < MIN_USER_QUERY_LENGTH) {
      setUserOptions([]);
      setUsersError("");
      setUsersLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setUsersLoading(true);
      setUsersError("");
      try {
        const users = await fetchUsers(httpClient, query, controller.signal);
        if (users) {
          setUserOptions(
            users.map((entry) => ({
              value: entry.email,
              label: entry.email,
              user: entry,
            }))
          );
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setUserOptions([]);
          setUsersError("Could not load users.");
        }
      } finally {
        if (!controller.signal.aborted) setUsersLoading(false);
      }
    }, USER_SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [httpClient, userQuery]);

  const handleRoleChange = async (role, granted) => {
    if (!selectedUser) return;
    const email = selectedUser.email;
    const path = `system/users/${encodeURIComponent(email)}/roles/${encodeURIComponent(role.name)}`;
    setUpdatingRole(role.name);
    setRoleResult(null);
    try {
      const response = granted
        ? await httpClient.put(path)
        : await httpClient.delete(path);
      if (response?.status < 200 || response?.status >= 300) {
        throw new Error(response?.statusText || "Could not update role");
      }

      const updatedUser = response.status === 200 && typeof response.json === "function"
        ? await response.json()
        : (await fetchUsers(httpClient, email))?.find(
            (entry) => entry.email.toLowerCase() === email.toLowerCase()
          );
      if (!updatedUser) throw new Error("Updated user could not be reloaded");
      setSelectedUser(updatedUser);
      setUserOptions((options) =>
        options.map((option) =>
          option.value === email ? { ...option, user: updatedUser } : option
        )
      );
      setRoleResult({
        variant: "success",
        message: `${role.label || role.name} ${granted ? "granted" : "revoked"}.`,
      });
    } catch (error) {
      setRoleResult({
        variant: "danger",
        message: error.message || "Could not update role.",
      });
    } finally {
      setUpdatingRole("");
    }
  };

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
    const submission = {
      message: formValue.message,
      onTime: formValue.onTime,
      offTime: formValue.offTime,
      onDate: formValue.onDate,
      offDate: formValue.offDate,
      variant: formValue.variant,
      link: formValue.link,
    };
    try {
      const result = await putNotifications(submission);
      if (result?.status === 200 || result?.status === 204) {
        toast.success("System message saved successfully.");
      } else {
        toast.error(`Save failed: ${result?.statusText || "Unknown error"}. Please try again.`);
      }
    } catch (e) {
      // Error toast already shown by httpClient (e.g. 403)
    }
  };

  const handleGetMessage = async () => {
    const message = await getNotifications();
    if (message?.message?.includes?.("**Error**")) {
      toast.error("Could not load system message.");
      return;
    }
    const formData = {
      message: message?.message ?? "",
      onTime: message?.onTime ?? "",
      offTime: message?.offTime ?? "",
      onDate: message?.onDate ?? "",
      offDate: message?.offDate ?? "",
      variant: message?.variant ?? "",
      link: message?.link ?? "",
    };
    setFormValue(formData);
    const offDate = message?.offDate;
    const offTime = message?.offTime;
    const onDate = message?.onDate;
    const onTime = message?.onTime;
    const expiry = offDate != null && offTime != null && String(offDate) && String(offTime)
      ? moment(`${offDate} ${offTime}`)
      : null;
    const onTimeMoment = onDate != null && onTime != null && String(onDate) && String(onTime)
      ? moment(`${onDate} ${onTime}`)
      : null;
    setFormattedMessage({
      message: formData.message,
      expiry: expiry ?? moment(),
      onTime: onTimeMoment ?? moment(),
      variant: formData.variant,
      link: formData.link,
    });
  };

  const handleResetCache = async () => {
    resetCache();
  };

  const handlePutUserPrefs = async () => {
    setUserPrefsLoading(true);
    try {
      const result = await putUserPrefs();
      setUserPrefsResult(result);
      setUserPrefsLoading(false);
    } catch (error) {
      setUserPrefsResult({
        status: "error",
        message: error.message || "Unknown error occurred",
      });
      setUserPrefsLoading(false);
    }
  };

  const handleGetUserPrefs = async () => {
    setUserPrefsLoading(true);
    try {
      const result = await getUserPrefs();
      setUserPrefsResult(result);
      setUserPrefsLoading(false);
    } catch (error) {
      setUserPrefsResult({
        status: "error",
        message: error.message || "Unknown error occurred",
      });
      setUserPrefsLoading(false);
    }
  };

  return (
    <>
      <br />
      {isAdmin ? (
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
            <Container>
              <br />
              <h5>User Preferences</h5>
              <p>Save or retrieve user preferences from gatool Cloud.</p>
              <Button
                variant="primary"
                onClick={handlePutUserPrefs}
                disabled={userPrefsLoading}
                className="me-2"
              >
                {userPrefsLoading ? "Saving..." : "Save User Preferences"}
              </Button>
              <Button
                variant="secondary"
                onClick={handleGetUserPrefs}
                disabled={userPrefsLoading}
              >
                {userPrefsLoading ? "Loading..." : "Get User Preferences"}
              </Button>
              {userPrefsResult && (
                <div className="mt-3">
                  <Alert
                    variant={
                      userPrefsResult.status === "ok" ||
                      userPrefsResult.status === 200
                        ? "success"
                        : "danger"
                    }
                  >
                    <strong>Result:</strong>
                    <pre style={{ whiteSpace: "pre-wrap", marginTop: "10px" }}>
                      {JSON.stringify(userPrefsResult, null, 2)}
                    </pre>
                  </Alert>
                </div>
              )}
            </Container>
          </Tab>
          <Tab eventKey="users" title="User Management">
            <Container>
              {lastSyncData && (
                <div>
                  <h3>
                    Last Sync:{" "}
                    {moment(lastSyncData.lastUpdated).format(
                      "ddd, MMM Do YYYY, h:mm:ss a"
                    )}
                  </h3>
                  <p>Total events: {lastSyncData.totalEvents}</p>
                  <p>Subscribes: {lastSyncData.subscribes}</p>
                  <p>Unsubscribes: {lastSyncData.unsubscribes}</p>
                  <p>Profile updates: {lastSyncData.profileUpdates}</p>
                  <p>Cleaned: {lastSyncData.cleaned}</p>
                  {lastSyncData.recentEvents?.length > 0 && (
                    <>
                      <h4>Recent Events</h4>
                      <table className="table table-sm table-striped">
                        <thead>
                          <tr>
                            <th>Time</th>
                            <th>Type</th>
                            <th>Email</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lastSyncData.recentEvents.map((evt, i) => (
                            <tr key={i}>
                              <td>{moment(evt.timestamp).format("MMM D, h:mm a")}</td>
                              <td>{evt.type}</td>
                              <td>{evt.email}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}
                </div>
              )}
              <br />
              <h3>Role Editor</h3>
              <Form.Group className="mb-3" controlId="user-role-search">
                <Form.Label>User email</Form.Label>
                <Select
                  aria-label="User email"
                  inputValue={userQuery}
                  value={
                    selectedUser
                      ? {
                          value: selectedUser.email,
                          label: selectedUser.email,
                          user: selectedUser,
                        }
                      : null
                  }
                  options={userOptions}
                  isLoading={usersLoading}
                  isDisabled={Boolean(updatingRole)}
                  isClearable
                  filterOption={null}
                  onInputChange={(value, action) => {
                    if (action.action === "input-change") {
                      setUserQuery(value);
                      setSelectedUser(null);
                      setRoleResult(null);
                    }
                  }}
                  onChange={(option) => {
                    setSelectedUser(option?.user || null);
                    setUserQuery("");
                    setRoleResult(null);
                  }}
                  placeholder="Type at least 2 characters"
                  noOptionsMessage={() => {
                    if (usersError) return usersError;
                    if (userQuery.trim().length < MIN_USER_QUERY_LENGTH) {
                      return "Type at least 2 characters";
                    }
                    return "No users found";
                  }}
                  loadingMessage={() => "Searching users..."}
                />
              </Form.Group>

              {selectedUser && (
                <div className="mb-3">
                  <h4>{selectedUser.email}</h4>
                  <p className="text-muted mb-2">
                    Created: {selectedUser.createdAt ? moment(selectedUser.createdAt).format("MMM D, YYYY, h:mm a") : "Unknown"}
                    {" | "}
                    Last login: {selectedUser.lastLoginAt ? moment(selectedUser.lastLoginAt).format("MMM D, YYYY, h:mm a") : "Never"}
                  </p>
                  <p className="mb-2">
                    Assigned roles: {selectedUser.roles?.length ? selectedUser.roles.join(", ") : "None"}
                  </p>

                  {BASE_ROLES.map((role) => (
                    <Form.Check
                      key={role.name}
                      id={`user-role-${role.name}`}
                      type="checkbox"
                      className="mb-2"
                      label={`${role.label} - ${role.description}`}
                      checked={selectedUser.roles?.includes(role.name) || false}
                      disabled
                      readOnly
                    />
                  ))}

                  {rolesLoading && <p>Loading manageable roles...</p>}
                  {rolesError && <Alert variant="danger">{rolesError}</Alert>}
                  {availableRoles
                    .filter((role) => !BASE_ROLES.some((baseRole) => baseRole.name === role.name))
                    .map((role) => (
                      <Form.Check
                        key={role.name}
                        id={`user-role-${role.name}`}
                        type="checkbox"
                        className="mb-2"
                        label={`${role.label || role.name}${role.description ? ` - ${role.description}` : ""}`}
                        checked={selectedUser.roles?.includes(role.name) || false}
                        disabled={Boolean(updatingRole)}
                        onChange={(event) => handleRoleChange(role, event.target.checked)}
                      />
                    ))}

                  {updatingRole && <p>Updating role...</p>}
                  {roleResult && (
                    <Alert className="mt-3" variant={roleResult.variant}>
                      {roleResult.message}
                    </Alert>
                  )}
                </div>
              )}
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
