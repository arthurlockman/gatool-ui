
function TeamDataPage({selectedEvent, teamList}) {
    function fixTeamName(teamName) {
        return `aefaefaef ${teamName}`;
    }

    return (
        <>{teamList && teamList.teams && teamList.teams.map((team) => {return fixTeamName(team.nameFull)})}</>

    )
}

export default TeamDataPage;