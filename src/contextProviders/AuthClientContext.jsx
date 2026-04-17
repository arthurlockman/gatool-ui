import { useAuth0 } from "@auth0/auth0-react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useOnlineStatus } from "./OnlineContext";

export const apiBaseUrl =
  process.env.REACT_APP_API_BASE || "https://api.gatool.org/v3/";

const FIVE_O_THREE_TOAST_THROTTLE_MS = 10000; // Only show one 503 toast per 10s when many requests fail
let last503ToastAt = 0;

function show503ToastIfNotThrottled(errorText) {
  const now = Date.now();
  if (now - last503ToastAt > FIVE_O_THREE_TOAST_THROTTLE_MS) {
    last503ToastAt = now;
    toast.error(errorText);
  }
}

class AuthClient {
  setOperationsInProgress = null;
  operationsInProgress = 0;
  online = true;
  _inflight = new Map();

  constructor(tokenGetter, setOperationsInProgress) {
    this.setOperationsInProgress = setOperationsInProgress;
    this.tokenGetter = tokenGetter;
  }

  // Clone a resolved GET result so each deduped caller gets an independent body.
  // Non-Response results (e.g. timeout/abort shapes) are returned as-is.
  _cloneGetResult(result) {
    if (result && typeof result.clone === "function") return result.clone();
    return result;
  }

  // Share a single in-flight GET promise across simultaneous callers for the
  // same URL. Skipped entirely when the caller supplies an AbortSignal, since
  // sharing a promise across differing lifecycles would let one caller's abort
  // cancel another caller's request.
  _dedupeGet(key, signal, runner) {
    if (signal) return runner();
    const existing = this._inflight.get(key);
    if (existing) return existing.then((r) => this._cloneGetResult(r));
    const p = runner();
    this._inflight.set(key, p);
    p.finally(() => {
      if (this._inflight.get(key) === p) this._inflight.delete(key);
    });
    return p.then((r) => this._cloneGetResult(r));
  }

  clearInflight() {
    this._inflight.clear();
  }

  async get(path, timeOut = 30000, signal) {
    return this._dedupeGet(`GET:${apiBaseUrl}${path}`, signal, () =>
      this._doGet(path, timeOut, signal)
    );
  }

  async _doGet(path, timeOut, signal) {
    if (!this.online) {
      throw new Error("You are offline.");
    }

    this.operationStart();
    try {
      var token = await this.getToken();
      const timeoutSignal = AbortSignal.timeout(timeOut);
      var response = await fetch(`${apiBaseUrl}${path}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: signal ? AbortSignal.any([timeoutSignal, signal]) : timeoutSignal,
      }).finally(() => {
        this.operationDone();
      });
    } catch (e) {
      this.operationDone();
      if (e?.name === "AbortError" && signal?.aborted) {
        // Caller-initiated cancellation — silently swallow
        return { status: 0, statusText: "Aborted", ok: false, _aborted: true };
      }
      console.log("Fetch timeout exceeded");
      return { status: 408, statusText: "Request Timeout" };
    }
    if (response.ok) return response;
    var errorText = `Received a ${response.status} error from backend: "${response.statusText}"`;
    if (response.status === 400) {
      errorText +=
        " This is an error with the FIRST APIs, not one caused by gatool. These usually clear in a few minutes, so please try again soon.";
    }
    if (response.status === 401) {
      errorText +=
        " Your session may have expired. Please log out and log in again.";
    }
    if (response.status === 404) {
      errorText += " We couldn't find " + path;
      return response;
    }
    if (response.status === 500) {
      errorText +=
        " Something happened in the backend that we don't understand. We have logged the request and will investigate soon.";
    }
    if (response.status === 503) {
      console.error("503 Service Unavailable — GET", `${apiBaseUrl}${path}`);
      errorText =
        "The service is temporarily unavailable (server busy or updating). Please try again in a moment.";
      show503ToastIfNotThrottled(errorText);
      throw new Error(errorText);
    }
    toast.error(errorText);
    throw new Error(errorText);
  }

  async getNoAuth(path, customAPIBaseUrl, timeOut = 300000, headers, signal) {
    const base = customAPIBaseUrl || apiBaseUrl;
    return this._dedupeGet(`GETNA:${base}${path}`, signal, () =>
      this._doGetNoAuth(path, customAPIBaseUrl, timeOut, headers, signal)
    );
  }

  async _doGetNoAuth(path, customAPIBaseUrl, timeOut, headers, signal) {
    if (!this.online) {
      throw new Error("You are offline.");
    }

    this.operationStart();
    try {
      const timeoutSignal = AbortSignal.timeout(timeOut);
      var options = {
        signal: signal ? AbortSignal.any([timeoutSignal, signal]) : timeoutSignal,
      };
      if (headers) options.headers = headers;
      var response = await fetch(
        `${customAPIBaseUrl || apiBaseUrl}${path}`,
        options
      ).finally(() => {
        this.operationDone();
      });
      if (response.ok) return response;
    } catch (e) {
      this.operationDone();
      if (e?.name === "AbortError" && signal?.aborted) {
        return { status: 0, statusText: "Aborted", ok: false, _aborted: true };
      }
      console.log("Fetch timeout exceeded");
      return { status: 408, statusText: "Request Timeout" };
    }
    var errorText = `Received a ${response.status} error from backend: "${response.statusText}"`;
    if (response.status === 400) {
      if (path.includes("statbotics") || path.includes("ftcscout")) {
        return response;
      } else if (path.includes("/teams?teamNumber=")) {
        return response;
      } else {
        errorText +=
          " This is an error with the FIRST APIs, not one caused by gatool. These usually clear in a few minutes, so please try again soon.";
      }
    }
    if (response.status === 401) {
      errorText +=
        " Your session may have expired. Please log out and log in again.";
    }
    if (response.status === 404) {
      errorText += " We couldn't find " + path;
      return response;
    }
    if (response.status === 500) {
      if (path.includes("statbotics") || path.includes("ftcscout")) {
        return response;
      } else {
        errorText +=
          " Something happened in the backend that we don't understand. We have logged the request and will investigate soon.";
      }
    }
    if (response.status === 503) {
      if (path.includes("/elim/alliances")) {
        return { status: 204, statusText: "No Alliances loaded" };
      }
      if (path.includes("/elims/")) {
        return { status: 204, statusText: "No Playoff matches loaded" };
      }
      const base = customAPIBaseUrl || apiBaseUrl;
      console.error("503 Service Unavailable — GET (no auth)", `${base}${path}`);
      errorText =
        "The service is temporarily unavailable (server busy or updating). Please try again in a moment.";
      show503ToastIfNotThrottled(errorText);
      throw new Error(errorText);
    }
    toast.error(errorText);
    throw new Error(errorText);
  }

  async put(path, body, customAPIBaseUrl, timeOut = 30000) {
    if (!this.online) {
      throw new Error("You are offline.");
    }

    this.operationStart();
    try {
      var token = await this.getToken();
      var response = await fetch(`${customAPIBaseUrl || apiBaseUrl}${path}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        method: "PUT",
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeOut),
      }).finally(() => {
        this.operationDone();
      });
      if (response.ok) return response;
    } catch (e) {
      this.operationDone();
      console.log("Fetch timeout exceeded");
      return { status: 408, statusText: "Request Timeout" };
    }
    var errorText = `Received a ${response.status} error from backend: "${response.statusText}"`;
    if (response.status === 400) {
      errorText +=
        " This is an error with the FIRST APIs, not one caused by gatool. These usually clear in a few minutes, so please try again soon.";
    }
    if (response.status === 401) {
      errorText +=
        " Your session may have expired. Please log out and log in again.";
    }
    if (response.status === 403) {
      errorText += path === "system/announcements"
        ? " You need to be a system admin to update system announcements."
        : " You don't have permission to perform this action. You may need to be an event admin or have a specific role to update event notifications.";
    }
    if (response.status === 500) {
      errorText +=
        " Something happened in the backend that we don't understand. We have logged the request and will investigate soon.";
    }
    if (response.status === 503) {
      console.error("503 Service Unavailable — PUT", `${customAPIBaseUrl || apiBaseUrl}${path}`);
      errorText =
        "The service is temporarily unavailable (server busy or updating). Please try again in a moment.";
      show503ToastIfNotThrottled(errorText);
      throw new Error(errorText);
    }
    toast.error(errorText);
    throw new Error(errorText);
  }

  async post(path, body, timeOut = 30000) {
    if (!this.online) {
      throw new Error("You are offline.");
    }

    this.operationStart();
    try {
      var token = await this.getToken();
      var response = await fetch(`${apiBaseUrl}${path}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: body == null ? null : JSON.stringify(body),
        signal: AbortSignal.timeout(timeOut),
      }).finally(() => {
        this.operationDone();
      });
      if (response.ok) return response;
    } catch (e) {
      this.operationDone();
      console.log("Fetch timeout exceeded");
      return { status: 408, statusText: "Request Timeout" };
    }
    var errorText = `Received a ${response.status} error from backend: "${response.statusText}"`;
    if (response.status === 400) {
      errorText +=
        " This is an error with the FIRST APIs, not one caused by gatool. These usually clear in a few minutes, so please try again soon.";
    }
    if (response.status === 401) {
      errorText +=
        " Your session may have expired. Please log out and log in again.";
    }
    if (response.status === 500) {
      errorText +=
        " Something happened in the backend that we don't understand. We have logged the request and will investigate soon.";
    }
    if (response.status === 503) {
      console.error("503 Service Unavailable — POST", `${apiBaseUrl}${path}`);
      errorText =
        "The service is temporarily unavailable (server busy or updating). Please try again in a moment.";
      show503ToastIfNotThrottled(errorText);
      throw new Error(errorText);
    }
    toast.error(errorText);
    throw new Error(errorText);
  }

  async postNoAuth(path, body, customAPIBaseUrl, headers, timeOut = 30000) {
    if (!this.online) {
      throw new Error("You are offline.");
    }

    this.operationStart();
    try {
      var response = await fetch(`${customAPIBaseUrl || apiBaseUrl}${path}`, {
        headers: { ...headers, "Content-Type": "application/json" },
        method: "POST",
        body: body == null ? null : JSON.stringify(body),
        signal: AbortSignal.timeout(timeOut),
      }).finally(() => {
        this.operationDone();
      });
      if (response.ok) return response;
    } catch (e) {
      this.operationDone();
      console.log("Fetch timeout exceeded");
      return { status: 408, statusText: "Request Timeout" };
    }
    var errorText = `Received a ${response.status} error from backend: "${response.statusText}"`;
    if (response.status === 400) {
      errorText +=
        " This is an error with the FIRST APIs, not one caused by gatool. These usually clear in a few minutes, so please try again soon.";
    }
    if (response.status === 401) {
      errorText +=
        " Your session may have expired. Please log out and log in again.";
    }
    if (response.status === 500) {
      errorText +=
        " Something happened in the backend that we don't understand. We have logged the request and will investigate soon.";
    }
    if (response.status === 503) {
      console.error("503 Service Unavailable — POST (no auth)", `${customAPIBaseUrl || apiBaseUrl}${path}`);
      errorText =
        "The service is temporarily unavailable (server busy or updating). Please try again in a moment.";
      show503ToastIfNotThrottled(errorText);
      throw new Error(errorText);
    }
    toast.error(errorText);
    throw new Error(errorText);
  }

  async delete(path, timeOut = 30000) {
    if (!this.online) {
      throw new Error("You are offline.");
    }

    this.operationStart();
    try {
      var token = await this.getToken();
      var response = await fetch(`${apiBaseUrl}${path}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: "DELETE",
        signal: AbortSignal.timeout(timeOut),
      }).finally(() => {
        this.operationDone();
      });
      if (response.ok) return response;
    } catch (e) {
      this.operationDone();
      console.log("Fetch timeout exceeded");
      return { status: 408, statusText: "Request Timeout" };
    }
    var errorText = `Received a ${response.status} error from backend: "${response.statusText}"`;
    if (response.status === 400) {
      errorText +=
        " This is an error with the FIRST APIs, not one caused by gatool. These usually clear in a few minutes, so please try again soon.";
    }
    if (response.status === 401) {
      errorText +=
        " Your session may have expired. Please log out and log in again.";
    }
    if (response.status === 404) {
      errorText += " We couldn't find " + path;
      return response;
    }
    if (response.status === 500) {
      errorText +=
        " Something happened in the backend that we don't understand. We have logged the request and will investigate soon.";
    }
    if (response.status === 503) {
      console.error("503 Service Unavailable — DELETE", `${apiBaseUrl}${path}`);
      errorText =
        "The service is temporarily unavailable (server busy or updating). Please try again in a moment.";
      show503ToastIfNotThrottled(errorText);
      throw new Error(errorText);
    }
    toast.error(errorText);
    throw new Error(errorText);
  }

  setOnlineStatus(online) {
    this.online = online;
  }

  operationStart() {
    this.operationsInProgress += 1;
    this.setOperationsInProgress(this.operationsInProgress);
  }

  operationDone() {
    this.operationsInProgress -= 1;
    this.operationsInProgress = Math.max(0, this.operationsInProgress);
    this.setOperationsInProgress(this.operationsInProgress);
  }

  async getToken() {
    var tokenResponse = await this.tokenGetter({
      audience: `https://${
        process.env.REACT_APP_AUTH0_DOMAIN || "gatool.auth0.com"
      }/userinfo`,
      scope: "openid email profile offline_access",
      detailedResponse: true,
    });
    return tokenResponse.id_token;
  }
}

const AuthClientContext = createContext([new AuthClient(), null]);

function UseAuthClient() {
  return useContext(AuthClientContext);
}

function AuthClientContextProvider({ children }) {
  const { getAccessTokenSilently } = useAuth0();
  const [operationsInProgress, setOperationsInProgress] = useState(0);
  const client = useMemo(() => {
    return new AuthClient(getAccessTokenSilently, setOperationsInProgress);
  }, [getAccessTokenSilently, setOperationsInProgress]);

  const isOnline = useOnlineStatus();
  useEffect(() => {
    client.setOnlineStatus(isOnline);
  }, [isOnline, client]);
  // @ts-ignore
  return (
    <AuthClientContext.Provider
      value={[
        client,
        // @ts-ignore
        operationsInProgress,
      ]}
    >
      {children}
    </AuthClientContext.Provider>
  );
}

export { AuthClient, UseAuthClient, AuthClientContextProvider };
