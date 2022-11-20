import { useEffect, useState } from "react";
import { UseAuthClient } from "../clients/AuthClient";

function SetupPage() {
    var httpClient = UseAuthClient();
    var [data, setData] = useState('');
    useEffect(() => {
        async function getData() {
            const val = await httpClient.get('2022/events')
            const json = await val.json()
            setData(JSON.stringify(json))
        }
        getData()
    }, [httpClient])

    return (
        <>
            <div>This is the setup page</div>
            {data}
        </>
    )
}

export default SetupPage;