import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";

function Developer() {
    const { user, getAccessTokenSilently } = useAuth0();

    var [token, setToken] = useState(null);

    useEffect(() => {
        async function getToken() {
            var tokenResponse = await getAccessTokenSilently({
                audience: 'https://gatool.auth0.com/userinfo',
                scope: 'openid email profile',
                detailedResponse: true
            });
            setToken(tokenResponse.id_token)
        }
        getToken()
    }, [getAccessTokenSilently, user])

    return (
        <>
            {user.email.endsWith("rthr.me") || user.email.endsWith("adobe.com") ? <>
                <Form.Control as="textarea" rows={3} value={token ? token : ""} readOnly />
                <Button onClick={() => {
                    navigator.clipboard.writeText(token)
                }} >Copy to Clipboard</Button>
            </> : <Alert>You're not authorized to use this page.</Alert>}

        </>
    )
}

export default Developer;