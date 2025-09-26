import {
  ButtonToolbar,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "react-bootstrap";
import { useState } from "react";
import _ from "lodash";
import { useHotkeysContext, useHotkeys } from "react-hotkeys-hook";
import { commonFouls } from "./Fouls";

function FoulButtons({ currentYear }) {
  const [showFoul, setShowFoul] = useState(false);
  const [foul, setFoul] = useState(null);
  const { disableScope, enableScope } = useHotkeysContext();

  const handleShow = (foul) => {
    setShowFoul(true);
    setFoul(foul);
    disableScope("matchNavigation");
    disableScope("tabNavigation");
    enableScope("foulDialog");
  };

  const handleClose = () => {
    setShowFoul(false);
    enableScope("matchNavigation");
    enableScope("tabNavigation");
    disableScope("foulDialog");
  };

  useHotkeys("enter", () => document.getElementById("closeFoul").click(), {
    scopes: "foulDialog",
  });

  const fullScreen = foul?.code === "LOOKUP" ? true : "";

  return (
    <>
      <ButtonToolbar
        style={{ alignContent: "center", width: "100%", display: "block", marginTop: "10px" }}
      >
        {_.filter(_.sortBy(commonFouls, ["card", "code", "rp"]), (foul) => {
          return foul.card === "red" || foul.card === "yellow";
        }).map((foul) => {
          return (
            <Button
              onClick={() => handleShow(foul)}
              className={"foulButtons"}
              variant={
                foul?.card === "yellow"
                  ? "warning"
                  : foul?.card === "red"
                  ? "danger"
                  : ""
              }
              key={foul.code}
            >
              {foul?.rp ? (
                <>
                  <b>RP</b>{" "}
                </>
              ) : (
                ""
              )}
              {foul.code}
            </Button>
          );
        })}
        {_.filter(_.sortBy(commonFouls, ["card", "code", "rp"]), (foul) => {
          return foul.card !== "red" && foul.card !== "yellow";
        }).map((foul) => {
          return (
            <Button
              onClick={() => handleShow(foul)}
              className={"foulButtons"}
              variant={"info"}
              key={foul.code}
            >
              {foul?.rp ? (
                <>
                  <b>RP</b>{" "}
                </>
              ) : (
                ""
              )}
              {foul.code}
            </Button>
          );
        })}
        <Button
          className={"foulButtons"}
          key={"foulLookup"}
          onClick={() => {
            // window.open(`https://frctools.com/${currentYear}`);
            handleShow({
              year: currentYear,
              code: "LOOKUP",
              name: "Lookup Foul",
              level: null,
              card: null,
              rp: null,
              text: (
                <div style={{ height: "calc(100vh - 200px)" }}>
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://frctools.com/${currentYear}`}
                    title="Foul Lookup"
                  />
                </div>
              ),
              violation: <></>,
            });
          }}
        >
          Lookup Foul...
        </Button>
      </ButtonToolbar>
      <Modal
        centered={true}
        show={showFoul}
        onHide={handleClose}
        fullscreen={fullScreen}
      >
        <ModalHeader
          className={
            foul?.card === "red" ? "btn btn-danger" : "btn btn-warning"
          }
        >
          <b>
            {foul?.code}: {foul?.name}
          </b>
        </ModalHeader>
        <ModalBody>
          <h5>{foul?.text}</h5>
          <p>
            <i>Violation: {foul?.violation}</i>
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            variant={foul?.card === "yellow" ? "warning" : "danger"}
            onClick={handleClose}
            id={"closeFoul"}
          >
            Close {foul?.code}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

export default FoulButtons;
