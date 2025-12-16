import Navbar from "react-bootstrap/Navbar";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "react-bootstrap";
import { useState } from "react";

function BottomNavigation({ ftcMode }) {
  const [url, setURL] = useState({ title: null, url: null });
  const handleClose = () => {
    setURL({ title: null, url: null });
  };

  return (
    <>
      <Navbar 
        fixed="bottom" 
        bg="light"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          width: "100%",
          zIndex: 1030
        }}
      >
        <span style={{ width: "100%", fontSize: "11px" }}>
          © 2017-{new Date().getFullYear()} Arthur Rosa &amp; James Lockman,{" "}
          <span
            style={{ cursor: "pointer", color: "blue" }}
            onClick={() => {
              setURL({
                title: "Northern Force",
                url: "http://www.northernforce.org/",
              });
            }}
          >
            FIRST Robotics Team 172 Northern Force
          </span>{" "}
          and the{" "}
          <span
            style={{ cursor: "pointer", color: "blue" }}
            onClick={() => {
              setURL({ title: "GoFAR", url: "http://gofarmaine.org" });
            }}
          >
            Gorham-Falmouth Alliance for Robotics.
          </span>{" "}
          {!ftcMode && (
            <>
              <span
                style={{ cursor: "pointer", color: "blue" }}
                onClick={() => {
                  setURL({
                    title: "FIRST API",
                    url: "https://frc-events.firstinspires.org/services/API",
                  });
                }}
              >
                Event Data provided by{" "}
                <i>
                  <b>FIRST</b>
                </i>
                .
              </span>{" "}
              <span
                style={{ cursor: "pointer", color: "blue" }}
                onClick={() => {
                  setURL({
                    title: "TBA API",
                    url: "https://www.thebluealliance.com/apidocs/v3",
                  });
                }}
              >
                Additional Data provided by{" "}
                <i>
                  <b>TBA</b>
                </i>{" "}
              </span>
              <span
                style={{ cursor: "pointer", color: "blue" }}
                onClick={() => {
                  setURL({
                    title: "Statbotics API",
                    url: "https://www.statbotics.io",
                  });
                }}
              >
                and by{" "}
                <i>
                  <b>Statbotics.io</b>
                </i>
                .
              </span>
            </>
          )}
          {ftcMode && (
            <>
              <span
                style={{ cursor: "pointer", color: "blue" }}
                onClick={() => {
                  setURL({
                    title: "FIRST API",
                    url: "https://ftc-events.firstinspires.org/services/API",
                  });
                }}
              >
                Event Data provided by{" "}
                <i>
                  <b>FIRST</b>
                </i>
                .
              </span>{" "}
              <span>Additional Data provided by </span>
              <span
                style={{ cursor: "pointer", color: "blue" }}
                onClick={() => {
                  setURL({
                    title: "FTC Scout API",
                    url: "https://ftcscout.org/api",
                  });
                }}
              >
                {" "}
                <b>
                  FTC<i>Scout</i>
                </b>
                APIs
              </span>
            </>
          )}
        </span>
      </Navbar>
      <Modal centered={true} show={url?.title} onHide={handleClose} fullscreen>
        <ModalHeader>{url?.title}</ModalHeader>
        <ModalBody>
          <div style={{ height: "calc(100vh - 200px)" }}>
            <iframe
              width="100%"
              height="100%"
              src={url?.url}
              title={url?.title}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleClose}>Close {url?.title}</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

export default BottomNavigation;
