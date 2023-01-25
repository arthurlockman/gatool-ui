import { Row, Col, Button } from "react-bootstrap"
import { CaretLeftFill, CaretRightFill } from "react-bootstrap-icons"

function BottomButtons({previousMatch, nextMatch, matchDetails}) {
    return (
        <>
            <Row style={{ "paddingTop": "10px" }}>
                <Col xs={"3"}>
                    <Button size="large" variant="outline-success" className={"gatool-button buttonNoWrap"} onClick={previousMatch}><span className={"d-none d-lg-block"}><CaretLeftFill /> Previous Match</span><span className={"d-block d-lg-none"}><CaretLeftFill /> <CaretLeftFill /></span></Button>
                </Col>
                <Col xs={"6"}><h4>{matchDetails?.description}</h4></Col>
                <Col xs={"3"}>
                    <Button size="large" variant="outline-success" className={"gatool-button buttonNoWrap"} onClick={nextMatch}><span className={"d-none d-lg-block"}>Next Match <CaretRightFill /></span><span className={"d-block d-lg-none"}><CaretRightFill /> <CaretRightFill /></span></Button>
                </Col>
            </Row>
            <Row> <br /><br /><br /></Row>
        </>
    )
}

export default BottomButtons;