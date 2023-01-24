import { Row, Col, Button } from "react-bootstrap"
import { CaretLeftFill, CaretRightFill } from "react-bootstrap-icons"

function BottomButtons({previousMatch, nextMatch, matchDetails}) {
    return (
        <>
            <Row style={{ "paddingTop": "10px" }}>
                <Col xs={"3"}>
                    <Button variant="outline-success" className={"gatool-button buttonNoWrap"} onClick={previousMatch}><CaretLeftFill /> Previous Match</Button>
                </Col>
                <Col xs={"6"}><h4>{matchDetails?.description}</h4></Col>
                <Col xs={"3"}>
                    <Button variant="outline-success" className={"gatool-button buttonNoWrap"} onClick={nextMatch}>Next Match  <CaretRightFill /></Button>
                </Col>
            </Row>
            <Row> <br /><br /></Row>
        </>
    )
}

export default BottomButtons;