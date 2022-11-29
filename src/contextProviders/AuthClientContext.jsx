import { useAuth0 } from "@auth0/auth0-react";
import { createContext, useContext, useMemo, useState } from "react"

const apiBaseUrl = "https://api.gatool.org/v3/";

class AuthClient {
    setOperationsInProgress = null;
    operationsInProgress = 0;

    constructor(tokenGetter, setOperationsInProgress) {
        this.setOperationsInProgress = setOperationsInProgress
        this.tokenGetter = tokenGetter
    }

    async get(path) {
        this.operationStart();
        var token = await this.getToken();
        return fetch(`${apiBaseUrl}${path}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).finally(() => {
            this.operationDone();
        });
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
            audience: 'https://gatool.auth0.com/userinfo',
            scope: 'openid email profile',
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
    return <AuthClientContext.Provider value={[client, operationsInProgress]}>{children}</AuthClientContext.Provider>
}

export { AuthClient, UseAuthClient, AuthClientContextProvider }