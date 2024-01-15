import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { utils, read } from "xlsx";
import { Alert, Button, Container, Form } from "react-bootstrap";

function Developer() {
    const { user, getAccessTokenSilently } = useAuth0();

    var [token, setToken] = useState(null);
    var [formattedUsers, setFormattedUsers] = useState(null);
    var [loadedUsers, setLoadedUsers] = useState(null);

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
     * @param id text The ID to delete and recreate
    */
    function clearFileInput(id) {
        var oldInput = document.getElementById(id);
        var newInput = document.createElement("input");
        newInput.type = "file";
        newInput.id = oldInput.id;
        // @ts-ignore
        newInput.name = oldInput.name;
        newInput.className = oldInput.className;
        newInput.style.cssText = oldInput.style.cssText;
        oldInput.parentNode.replaceChild(newInput, oldInput)
    }

    /** 
     * This function receives a file from the upload button and parses the user list from the CSV.
     * It then returns Auth0 formatted JSON, which is displays to the user in a Text Area on screen.
     * It also destroys and recreates the button, and then re-attaches the proper event listener.
     *
     * @function handleUserUpload
     * @param e The file upload event, which contains a pointer to the file.
    */
    function handleUserUpload(e) {
        var files = e.target.files;
        var f = files[0];
        var reader = new FileReader();
        reader.onload = function (e) {
            //@ts-ignore
            var data = new Uint8Array(e.target.result);
            var workbook;
            workbook = read(data, { type: 'array' });
            var worksheet = workbook.Sheets[workbook.SheetNames[0]];
            var users = utils.sheet_to_json(worksheet);
            var auth0JSON = users.map((user => {
                return { "user_id": user["Email Address"].toLowerCase(), "email": user["Email Address"], "email_verified": false }
            }))
            setFormattedUsers(JSON.stringify(auth0JSON));
            setLoadedUsers("success");
            clearFileInput("userUpload");
            document.getElementById("userUpload").addEventListener('change', handleUserUpload);
        }
        reader.readAsArrayBuffer(f);
    }

    return (
        <Container>
            {(user["https://gatool.org/roles"].indexOf("admin") >= 0) ?
                <>
                    <div><Form.Control as="textarea" rows={3} value={token ? token : ""} readOnly />
                        <Button onClick={() => {
                            navigator.clipboard.writeText(token)
                        }} >Copy token to Clipboard</Button></div>
                    <Button variant="light"><input type="file" id="userUpload" onChange={handleUserUpload} className={"hiddenInput"} /></Button>
                    <div></div>
                    <Button style={{ cursor: "pointer" }} onClick={clickLoadUsers}><img style={{ float: "left" }} width="50" src="images/excelicon.png" alt="Excel Logo" />{loadedUsers ? <>Load new user list</> : <>Load user list from Mailchimp</>}</Button>
                    <div><Form.Control as="textarea" rows={3} value={formattedUsers ? formattedUsers : ""} readOnly />
                        {loadedUsers && <Button variant={loadedUsers ? loadedUsers : "primary"} onClick={() => {
                            navigator.clipboard.writeText(formattedUsers);
                            setLoadedUsers("info");
                        }} >{loadedUsers === "info" ? <>Users have been copied</> : <>Copy users to Clipboard</>}</Button>}</div>
                </> : <Alert>You're not authorized to use this page.</Alert>}

        </Container>
    )
}

export default Developer;