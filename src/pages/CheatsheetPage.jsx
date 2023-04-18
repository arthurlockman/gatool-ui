import { Container, Row } from "react-bootstrap";
import { FlashcardArray } from "react-quizlet-flashcard";
import _ from "lodash";

function CheatsheetPage({ teamList, communityUpdates, selectedEvent }) {
    var sortedTeams = _.orderBy(teamList?.teams, "teamNumber", "asc");
    var cardStyle = {
        display: "flex",
        alignItems: "center",
        justifyContent: "center"

    }
    const cards = sortedTeams.map((team, index) => {
        var card = {
            id: 0,
            frontHTML: "",
            backHTML: ""
        };
        team = _.merge(team, communityUpdates[_.findIndex(communityUpdates, { "teamNumber": team?.teamNumber })], teamList?.teams[_.findIndex(teamList?.teams, { "teamNumber": team?.teamNumber })]);
        card.id = index;
        card.frontHTML = `<h1><b>${team.teamNumber}</b></h1>`;
        card.frontContentStyle = cardStyle;
        card.backContentStyle = cardStyle;
        card.backHTML = `<h1><b>${team?.updates?.nameShortLocal ? team?.updates?.nameShortLocal : team?.nameShort}</b><br />${team?.updates?.cityStateLocal ? team?.updates?.cityStateLocal : team?.city + ", " + team?.stateProv}</h1>`;
        return card;
    })

    return (
        <Container fluid>
            <a href="/cheatsheet/charged-up-cheat-sheet.pdf" download><img src="/cheatsheet/Charged-Up-Cheat-Sheet.png" width="100%" alt="Cheatsheet"></img></a>
            <div><h3>Here is a very useful summary for the playoffs, provided by Bill Aucoin.<br /><a href="/cheatsheet/2023_GA_TACAIDS.pdf" download>Download PDF.</a></h3>
                <p><br /></p></div>
            {cards.length > 0 &&
                <Container fluid className={"flashCards"}>
                    <Row><h3>Here are some helpful flash cards you can use to learn the names of the teams at {selectedEvent?.label}.</h3></Row>
                    <Row><FlashcardArray cards={cards} /></Row>
                    <Row><br /><br /></Row>
                </Container>}
        </Container>
    )
}

export default CheatsheetPage;