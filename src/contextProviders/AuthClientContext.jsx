import { useAuth0 } from "@auth0/auth0-react";
import { createContext, useContext, useMemo } from "react"

const apiBaseUrl = "https://api.gatool.org/v3/";

class AuthClient {
    operationsInProgress = 0;

    constructor(tokenGetter) {
        this.tokenGetter = tokenGetter
    }

    async get(path) {
        this.operationsInProgress += 1;
        var token = await this.getToken();
        return fetch(`${apiBaseUrl}${path}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).finally(() => {
            this.operationsInProgress -= 1;
        });
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

const AuthClientContext = createContext(new AuthClient());

function UseAuthClient() {
    return useContext(AuthClientContext);
}

function AuthClientContextProvider({ children }) {
    const { getAccessTokenSilently } = useAuth0();
    const client = useMemo(() => {
        return new AuthClient(getAccessTokenSilently);
    }, [getAccessTokenSilently])
    return <AuthClientContext.Provider value={client}>{children}</AuthClientContext.Provider>
}

export { AuthClient, UseAuthClient, AuthClientContextProvider }