import Announce from "../components/Announce";
import React from "react";

function AnnouncePage(teamList, rankings, communityUpdates, currentMatch, setCurrentMatch) {
    return (
        <><div>This is the AnnouncePage page</div>

        <Announce allianceColor={"red"} team={172} currentMatch={currentMatch} />
        <Announce allianceColor={"red"} team={172} currentMatch={currentMatch} />
        <Announce allianceColor={"red"} team={172} currentMatch={currentMatch} />
        <Announce allianceColor={"blue"} team={172} currentMatch={currentMatch} />
        <Announce allianceColor={"blue"} team={172} currentMatch={currentMatch} />
        <Announce allianceColor={"blue"} team={172} currentMatch={currentMatch} />

        </>
    )
}

export default AnnouncePage;