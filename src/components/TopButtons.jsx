import { Row, Col, Button } from "react-bootstrap";
import { CaretLeftFill, CaretRightFill } from "react-bootstrap-icons";
import Select from "react-select";
import MatchClock from "../components/MatchClock";

function TopButtons({previousMatch, nextMatch, currentMatch, matchMenu, setMatchFromMenu, selectedEvent, matchDetails, timeFormat }) {
    return (
        <>
            <Row style={{ "paddingTop": "10px", "paddingBottom": "10px" }}>
                        <Col xs={"3"} ><Button size="large" variant="outline-success" className={"gatool-button buttonNoWrap"} onClick={previousMatch}><span className={"d-none d-lg-block"}><CaretLeftFill /> Previous Match</span><span className={"d-block d-lg-none"}><CaretLeftFill /> <CaretLeftFill /></span></Button></Col>
                        <Col xs={"2"}><MatchClock matchDetails={matchDetails} timeFormat={timeFormat}/></Col>
                        <Col xs={"4"}><b>{selectedEvent?.label.replace("FIRST Championship - ", "").replace("FIRST In Texas District Championship - ", "").replace("FIRST Ontario Provincial Championship - ", "").replace("New England FIRST District Championship - ", "")}</b><br /><Select options={matchMenu} value={currentMatch ? matchMenu[currentMatch - 1] : matchMenu[0]} onChange={setMatchFromMenu} styles={{
                            option: (styles, { data }) => {
                                return {
                                    ...styles,
                                    backgroundColor: data.color,
                                    color: "black"
                                };
                            },
                        }} /></Col>
                        <Col xs={"3"}><Button size="large" variant="outline-success" className={"gatool-button buttonNoWrap"} onClick={nextMatch}><span className={"d-none d-lg-block"}>Next Match <CaretRightFill /></span><span className={"d-block d-lg-none"}><CaretRightFill /> <CaretRightFill /></span></Button></Col>
                    </Row>
        </>
    )
}

export default TopButtons;