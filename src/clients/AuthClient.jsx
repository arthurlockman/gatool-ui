import { useAuth0 } from "@auth0/auth0-react";
import { createContext, useContext, useMemo } from "react"

const apiBaseUrl = "https://api.gatool.org/v3/";

class AuthClient {
    constructor(tokenGetter) {
        this.tokenGetter = tokenGetter
    }

    async get(path) {
        var token = await this.getToken();
        return fetch(`${apiBaseUrl}${path}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
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