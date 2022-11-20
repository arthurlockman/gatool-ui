import { useEffect, useState } from "react";
import { UseAuthClient } from "../clients/AuthClient";

function SetupPage() {
    // This is a demo on how to get data from the API. UseAuthClient()
    // provides us with an authenticated client that we can use to get data.
    var httpClient = UseAuthClient();
    // UseState can store data that persists across re-renders
    var [data, setData] = useState('');
    useEffect(() => {
        async function getData() {
            // Get the data inside the UseEffect
            const val = await httpClient.get('2022/events')
            const json = await val.json()
            // Store the data in the UseEffect
            setData(JSON.stringify(json))
        }
        getData()
    }, [httpClient])

    return (
        <>
            <div>This is the setup page</div>
            {/* Display the data we got */}
            {data}
        </>
    )
}

export default SetupPage;