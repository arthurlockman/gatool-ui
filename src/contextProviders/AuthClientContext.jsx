import { useAuth0 } from "@auth0/auth0-react";
import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { toast } from 'react-toastify';
import { useOnlineStatus } from "./OnlineContext";

export const apiBaseUrl = process.env.REACT_APP_API_BASE || "https://api.gatool.org/v3/";

class AuthClient {
    setOperationsInProgress = null;
    operationsInProgress = 0;
    online = true;

    constructor(tokenGetter, setOperationsInProgress) {
        this.setOperationsInProgress = setOperationsInProgress
        this.tokenGetter = tokenGetter
    }

    async get(path) {
        if (!this.online) {
            throw new Error('You are offline.')
        }

        this.operationStart();
        var token = await this.getToken();
        var response = await fetch(`${apiBaseUrl}${path}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).finally(() => {
            this.operationDone();
        });
        if (response.ok) return response;
        var errorText = `Received a ${response.status} error from backend: "${response.statusText}"`;
        if (response.status === 400) {
            errorText += " This is an error with the FIRST APIs, not one caused by gatool. These usually clear in a few minutes, so please try again soon."
        }
        if (response.status === 401) {
            errorText += " Your session may have expired. Please log out and log in again."
        }
        if (response.status === 404) {
            errorText += " We couldn't find " + path;
            return response;
        }
        if (response.status === 500) {
            errorText += " Something happened in the backend that we don't understand. We have logged the request and will investigate soon."
        }
        toast.error(errorText);
        throw new Error(errorText);
    }

    async getNoAuth(path, customAPIBaseUrl) {
        if (!this.online) {
            throw new Error('You are offline.')
        }

        this.operationStart();
        var response = await fetch(`${customAPIBaseUrl || apiBaseUrl}${path}`).finally(() => {
            this.operationDone();
        });
        if (response.ok) return response;
        var errorText = `Received a ${response.status} error from backend: "${response.statusText}"`;
        if (response.status === 400) {
            errorText += " This is an error with the FIRST APIs, not one caused by gatool. These usually clear in a few minutes, so please try again soon."
        }
        if (response.status === 401) {
            errorText += " Your session may have expired. Please log out and log in again."
        }
        if (response.status === 404) {
            errorText += " We couldn't find " + path;
            return response;
        }
        if (response.status === 500) {
            if (customAPIBaseUrl === 'https://api.statbotics.io/v3/') {
                return response;
            } else {

                errorText += " Something happened in the backend that we don't understand. We have logged the request and will investigate soon."
            }
        }
        toast.error(errorText);
        throw new Error(errorText);
    }

    async put(path, body) {
        if (!this.online) {
            throw new Error('You are offline.')
        }

        this.operationStart();
        var token = await this.getToken();
        var response = await fetch(`${apiBaseUrl}${path}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            method: 'PUT',
            body: JSON.stringify(body)
        }).finally(() => {
            this.operationDone();
        });
        if (response.ok) return response;
        var errorText = `Received a ${response.status} error from backend: "${response.statusText}"`;
        if (response.status === 400) {
            errorText += " This is an error with the FIRST APIs, not one caused by gatool. These usually clear in a few minutes, so please try again soon."
        }
        if (response.status === 401) {
            errorText += " Your session may have expired. Please log out and log in again."
        }
        if (response.status === 500) {
            errorText += " Something happened in the backend that we don't understand. We have logged the request and will investigate soon."
        }
        toast.error(errorText);
        throw new Error(errorText);
    }

    async post(path, body) {
        if (!this.online) {
            throw new Error('You are offline.')
        }

        this.operationStart();
        var token = await this.getToken();
        var response = await fetch(`${apiBaseUrl}${path}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: body == null ? null : JSON.stringify(body)
        }).finally(() => {
            this.operationDone();
        });
        if (response.ok) return response;
        var errorText = `Received a ${response.status} error from backend: "${response.statusText}"`;
        if (response.status === 400) {
            errorText += " This is an error with the FIRST APIs, not one caused by gatool. These usually clear in a few minutes, so please try again soon."
        }
        if (response.status === 401) {
            errorText += " Your session may have expired. Please log out and log in again."
        }
        if (response.status === 500) {
            errorText += " Something happened in the backend that we don't understand. We have logged the request and will investigate soon."
        }
        toast.error(errorText);
        throw new Error(errorText);
    }

    async postNoAuth(path, body) {
        if (!this.online) {
            throw new Error('You are offline.')
        }

        this.operationStart();
        var response = await fetch(`${apiBaseUrl}${path}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: body == null ? null : JSON.stringify(body)
        }).finally(() => {
            this.operationDone();
        });
        if (response.ok) return response;
        var errorText = `Received a ${response.status} error from backend: "${response.statusText}"`;
        if (response.status === 400) {
            errorText += " This is an error with the FIRST APIs, not one caused by gatool. These usually clear in a few minutes, so please try again soon."
        }
        if (response.status === 401) {
            errorText += " Your session may have expired. Please log out and log in again."
        }
        if (response.status === 500) {
            errorText += " Something happened in the backend that we don't understand. We have logged the request and will investigate soon."
        }
        toast.error(errorText);
        throw new Error(errorText);
    }

    setOnlineStatus(online) {
        this.online = online
    }

    operationStart() {
        this.operationsInProgress += 1;
        this.setOperationsInProgress(this.operationsInProgress);
    }

    operationDone() {
        this.operationsInProgress -= 1;
        this.setOperationsInProgress(this.operationsInProgress);
    }

    async getToken() {
        var tokenResponse = await this.tokenGetter({
            audience: `https://${process.env.REACT_APP_AUTH0_DOMAIN || 'gatool.auth0.com'}/userinfo`,
            scope: 'openid email profile offline_access',
            detailedResponse: true
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
    }, [getAccessTokenSilently, setOperationsInProgress])

    const isOnline = useOnlineStatus();
    useEffect(() => {
        client.setOnlineStatus(isOnline)
    }, [isOnline, client])
    // @ts-ignore
    return <AuthClientContext.Provider value={[client, operationsInProgress]}>{children}</AuthClientContext.Provider>
}

export { AuthClient, UseAuthClient, AuthClientContextProvider }