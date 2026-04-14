import React, { useState, useEffect } from "react";
import {
  Button,
  Col,
  Container,
  Row,
  Table,
  Modal,
  Form,
} from "react-bootstrap";
import _ from "lodash";

function AdjustAlliancesModal({ show, onHide, alliances, onSave }) {
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (show) {
      setFormData(_.cloneDeep(alliances));
    }
  }, [show, alliances]);

  const handleFormValue = (allianceNumber, property, value) => {
    var formDataTemp = _.cloneDeep(formData);
    formDataTemp.alliances[allianceNumber - 1][property] = value;
    setFormData(formDataTemp);
  };

  const handleSave = () => {
    var alliancesTemp = {};
    var teamNumbers = [];
    alliancesTemp.Alliances = formData.alliances.map((alliance) => {
      var keys = Object.keys(alliance);
      keys.forEach((key) => {
        if (key.includes("captain") || key.includes("round")) {
          if (alliance[key]) {
            teamNumbers.push(Number(alliance[key]));
          }
        }
      });

      return {
        number: Number(alliance.number),
        captain: Number(alliance.captain),
        round1: Number(alliance.round1),
        round2: Number(alliance.round2),
        round3: Number(alliance.round3),
        backup: null,
        backupReplaced: null,
        name: alliance.name,
      };
    });

    onSave(alliancesTemp, teamNumbers);
  };

  return (
    <Modal
      centered={true}
      show={show}
      size="lg"
      onHide={onHide}
    >
      <Modal.Header
        className={"promoteBackup"}
        closeVariant={"white"}
        closeButton
      >
        <Modal.Title>Adjust Alliances</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          <Row>
            Use this form to adjust the Alliance members. If you add Alliance
            members, gatool will add the teams to the Team List. This is
            especially useful when planning 4-team Alliance events.
          </Row>
          <Form>
            <Table>
              <Row>
                <Col>Number</Col>
                <Col>Name</Col>
                <Col>Captain</Col>
                <Col>Round 1</Col>
                <Col>Round 2</Col>
                <Col>Round 3</Col>
              </Row>
              {(Array.isArray(formData?.alliances) ? formData.alliances : []).map((alliance, allianceIndex) => {
                return (
                  <Row key={`alliance-${alliance.number}-${allianceIndex}`}>
                    <Col>{alliance.number}</Col>
                    <Col>
                      <Form.Control
                        type="text"
                        value={alliance.name}
                        placeholder="Name"
                        onChange={(e) =>
                          handleFormValue(
                            alliance.number,
                            "name",
                            e.target.value
                          )
                        }
                      />
                    </Col>
                    <Col>
                      <Form.Control
                        type="text"
                        value={alliance.captain}
                        placeholder="Captain"
                        onChange={(e) =>
                          handleFormValue(
                            alliance.number,
                            "captain",
                            e.target.value
                          )
                        }
                      />
                    </Col>
                    <Col>
                      <Form.Control
                        type="text"
                        value={alliance.round1}
                        placeholder="Round 1"
                        onChange={(e) =>
                          handleFormValue(
                            alliance.number,
                            "round1",
                            e.target.value
                          )
                        }
                      />
                    </Col>
                    <Col>
                      <Form.Control
                        type="text"
                        value={alliance.round2}
                        placeholder="Round 2"
                        onChange={(e) =>
                          handleFormValue(
                            alliance.number,
                            "round2",
                            e.target.value
                          )
                        }
                      />
                    </Col>
                    <Col>
                      <Form.Control
                        type="text"
                        value={alliance.round3}
                        placeholder="Round 3"
                        onChange={(e) =>
                          handleFormValue(
                            alliance.number,
                            "round3",
                            e.target.value
                          )
                        }
                      />
                    </Col>
                  </Row>
                );
              })}
            </Table>
          </Form>
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleSave}>
          Save Alliances
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AdjustAlliancesModal;
