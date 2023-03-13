import {Container} from  "react-bootstrap";

function CheatsheetPage() {
    return (
        <Container fluid>
        <a href="/cheatsheet/charged-up-cheat-sheet.pdf" download><img src="/cheatsheet/Charged-Up-Cheat-Sheet.png" width="100%" alt="Cheatsheet"></img></a>
        <div><h3>Here is a very useful summary for the playoffs, provided by Bill Aucoin. <a href="/cheatsheet/2023_GA_TACAIDS.pdf" download>Download PDF.</a></h3>
        <p><br /></p></div>
        </Container>
    )
}

export default CheatsheetPage;