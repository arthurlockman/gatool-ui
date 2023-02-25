import {Container} from  "react-bootstrap";

function CheatsheetPage() {
    return (
        <Container fluid>
        <a href="/cheatsheet/charged-up-cheat-sheet.pdf" download><img src="/cheatsheet/Charged-Up-Cheat-Sheet.png" width="100%" alt="Cheatsheet"></img></a>
        </Container>
    )
}

export default CheatsheetPage;