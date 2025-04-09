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

const commonFouls = [
  {
    year: 2025,
    code: "G206",
    name: "Don’t violate rules for RP",
    level: "verbal",
    card: "yellow",
    rp: true,
    text: (
      <>
        <p>
          A team or ALLIANCE may not collude with another team to each
          purposefully violate a rule in an attempt to influence Ranking Points.
        </p>
      </>
    ),
    violation: (
      <>YELLOW CARD and the ALLIANCE is ineligible for CORAL and BARGE RPs</>
    ),
  },
  {
    year: 3000,
    code: "G207",
    name: "Don’t abuse ARENA access",
    level: "verbal",
    card: "yellow",
    rp: null,
    text: (
      <>
        <p>
          A team member (except DRIVERS, HUMAN PLAYERS, and COACHES) granted
          access to restricted areas in and around the ARENA (e.g. via
          TECHNICIAN button, event issued Media badges, etc.) may not assist or
          use signaling devices during the MATCH. Exceptions will be granted for
          inconsequential infractions and in cases concerning safety.
        </p>
      </>
    ),
    violation: (
      <>
        VERBAL WARNING. YELLOW CARD if subsequent violations during the event.
      </>
    ),
  },
  {
    year: 3000,
    code: "G209",
    name: "Keep your ROBOT together",
    level: null,
    card: "red",
    rp: null,
    text: (
      <>
        <p>
          A ROBOT may not intentionally detach or leave a part on the FIELD.
        </p>
      </>
    ),
    violation: <>RED CARD.</>,
  },
  {
    year: 3000,
    code: "G210",
    name: "Don’t expect to gain by doing others harm",
    level: "major",
    card: "yellow",
    rp: null,
    text: (
      <>
        <p>
          A strategy not consistent with standard gameplay and clearly aimed at
          forcing the opponent ALLIANCE to violate a rule is not in the spirit
          of FIRST Robotics Competition and not allowed. Rule violations forced
          in this manner will not result in an assignment of a penalty to the
          targeted ALLIANCE.
        </p>
      </>
    ),
    violation: <>MAJOR FOUL. YELLOW CARD if REPEATED.</>,
  },
  {
    year: 3000,
    code: "G211",
    name: "Egregious or exceptional violations",
    level: null,
    card: "yellow",
    rp: null,
    text: (
      <>
        <p>
          Egregious behavior beyond what is listed in the rules or subsequent
          violations of any rule or procedure during the event is prohibited.
        </p>
        <p>
          In addition to rule violations explicitly listed in this manual and
          witnessed by a REFEREE, the Head REFEREE may assign a YELLOW or RED
          CARD for egregious ROBOT actions or team member behavior at any time
          during the event.
        </p>
      </>
    ),
    violation: <>YELLOW or RED CARD.</>,
  },
  {
    year: 3000,
    code: "G302",
    name: "You can’t bring/use anything you want",
    level: null,
    card: "yellow",
    rp: null,
    text: (
      <>
        <p>
          The only equipment that may be brought to the ARENA for use during a
          MATCH is listed below. Regardless of if equipment fits criteria below,
          it may not be employed in a way that breaks any other rules,
          introduces a safety hazard, blocks visibility for FIELD STAFF or
          audience members, or jams or interferes with the remote sensing
          capabilities of another team or the FIELD.
        </p>
      </>
    ),
    violation: (
      <>
        MATCH will not start until the situation is remedied. If discovered or
        used inappropriately during a MATCH, YELLOW CARD.
      </>
    ),
  },
  {
    year: 3000,
    code: "G303",
    name: "Start your robots",
    level: null,
    card: "red",
    rp: null,
    text: (
      <>
        <p>
          A ROBOT must meet all following MATCH-start requirements:
          <ol type="A">
            <li>
              it does not pose a hazard to humans, FIELD elements, or other
              ROBOTS,
            </li>
            <li>
              has passed initial, complete inspection, i.e. it’s compliant with
              all ROBOT rules (for exceptions regarding Practice MATCHES, see
              section 9 Inspection and Eligibility),
            </li>
            <li>
              if modified after initial Inspection, it’s compliant with I104,
            </li>
            <li>its BUMPERS overlap their ROBOT STARTING LINE,</li>
            <li>it’s the only team-provided item left on the FIELD,</li>
            <li>
              it’s not attached to, entangled with, or suspended from any FIELD
              element,
            </li>
            <li>
              it’s confined to its STARTING CONFIGURATION (reference R102 and
              R104), and
            </li>
            <li>
              it fully and solely supports not more than 1 CORAL (as described
              in section 6.3.4 SCORING ELEMENTS).
            </li>
          </ol>
        </p>
      </>
    ),
    violation: (
      <>
        If fix is a quick remedy, the MATCH won’t start until all requirements
        are met. If it is not a quick remedy, DISABLED and, at the discretion of
        the Head REFEREE, must be re-inspected. If a ROBOT not compliant with
        part B or C participates, its team receives a RED CARD.
      </>
    ),
  },
  {
    year: 2025,
    code: "G402",
    name: "Let the ROBOT do its thing",
    level: "minor",
    card: "yellow",
    rp: null,
    text: (
      <>
        <p>
          In AUTO, a DRIVE TEAM member may not directly or indirectly interact
          with a ROBOT or an OPERATOR CONSOLE unless for personal safety,
          OPERATOR CONSOLE safety, or pressing an E-Stop or A-Stop. A HUMAN
          PLAYER feeding CORAL to a ROBOT is an exception to this rule.
        </p>
      </>
    ),
    violation: <>MINOR FOUL and YELLOW CARD.</>,
  },
  {
    year: 2025,
    code: "G409",
    name: "1 of each at a time",
    level: "minor",
    card: "yellow",
    rp: null,
    text: (
      <>
        <p>
          A ROBOT may not simultaneously CONTROL more than 1 CORAL and 1 ALGAE
          either directly or transitively through other objects. A ROBOT is in
          CONTROL of a SCORING ELEMENT if
          <ol type="A">
            <li>
              the SCORING ELEMENT is fully supported by or stuck in, on, or
              under the ROBOT or
            </li>
            <li>
              the ROBOT intentionally pushes a SCORING ELEMENT to a desired
              location or in a preferred direction (i.e. herding).
            </li>
          </ol>
          A ROBOT pushing scored CORAL on level 1 while attempting to score
          other CORAL is an exception to this rule.
        </p>
      </>
    ),
    violation: (
      <>MINOR FOUL per additional SCORING ELEMENT. YELLOW CARD if excessive.</>
    ),
  },
  {
    year: 2025,
    code: "G410",
    name: "No de-scoring",
    level: "major",
    card: null,
    rp: true,
    text: (
      <>
        <p>A ROBOT may not de-score a CORAL scored on the opponent’s REEF.</p>
      </>
    ),
    violation: (
      <>
        MAJOR FOUL per de-scored CORAL and the{" "}
        <b>opposing ALLIANCE is awarded the CORAL RP.</b>
      </>
    ),
  },
  {
    year: 2025,
    code: "G411",
    name: "Don’t put ALGAE on their REEF",
    level: "major",
    card: "yellow",
    rp: null,
    text: (
      <>
        <p>A ROBOT may not deliberately put ALGAE on their opponent’s REEF.</p>
      </>
    ),
    violation: <>MAJOR FOUL and YELLOW CARD.</>,
  },
  {
    year: 3000,
    code: "G415",
    name: "Expansion limits",
    level: "minor",
    card: null,
    rp: null,
    text: (
      <>
        <p>
          A ROBOT may not extend more than 1 ft. 6 in. (~45 cm) beyond the
          vertical projection of its ROBOT PERIMETER.
        </p>
        <p>
          If the over-expansion is due to damage and not used for strategic
          benefit, it is an exception to this rule, and no penalty is imposed.
        </p>
      </>
    ),
    violation: (
      <>
        MINOR FOUL, or MAJOR FOUL if the over-expansion is used for strategic
        benefit, including if it impedes or enables a scoring action.
      </>
    ),
  },
  {
    year: 3000,
    code: "G416",
    name: "Don’t damage the FIELD",
    level: "verbal",
    card: "yellow",
    rp: null,
    text: (
      <>
        <p>A ROBOT may not damage FIELD elements.</p>
      </>
    ),
    violation: (
      <>
        VERBAL WARNING. If the Head REFEREE infers that additional damage is
        likely, DISABLED. YELLOW CARD for any subsequent damage during the
        event. Corrective action (such as eliminating sharp edges, removing the
        damaging MECHANISM, and/or re-inspection) may be required before the
        ROBOT will be allowed to compete in subsequent MATCHES.
      </>
    ),
  },
  {
    year: 3000,
    code: "G417",
    name: "Watch your FIELD interaction",
    level: "major",
    card: "yellow",
    rp: null,
    text: (
      <>
        <p>
          A ROBOT is prohibited from the following interactions with FIELD
          elements with the exception of CAGES.
          <ol type="A">
            <li>grabbing,</li>
            <li>grasping,</li>
            <li>
              attaching to (including the use of a vacuum or hook fastener to
              anchor to the FIELD carpet),
            </li>
            <li>becoming entangled with, and</li>
            <li>suspending from.</li>
          </ol>
        </p>
      </>
    ),
    violation: (
      <>
        MAJOR FOUL, plus YELLOW CARD if REPEATED, or longer than MOMENTARY. If
        the Head REFEREE infers that damage is likely, DISABLED. Corrective
        action (such as removing the offending MECHANISM, and/or re-inspection)
        may be required before the ROBOT will be allowed to compete in
        subsequent MATCHES.
      </>
    ),
  },
  {
    year: 2025,
    code: "G418",
    name: "An Opponent’s CAGES are off-limits in TELEOP",
    level: "major",
    card: null,
    rp: true,
    text: (
      <>
        <p>In TELEOP, A ROBOT may not contact an opponent’s CAGE.</p>
      </>
    ),
    violation: (
      <>
        MAJOR FOUL and{" "}
        <b>
          opposing ALLIANCE is awarded the BARGE RP if a Qualification MATCH
        </b>
        .
      </>
    ),
  },
  {
    year: 2025,
    code: "G419",
    name: "ANCHORS are off-limits",
    level: "major",
    card: null,
    rp: true,
    text: (
      <>
        <p>
          A ROBOT may not contact the ANCHORS. Exceptions are granted for
          actions that are, MOMENTARY, and inconsequential.
        </p>
      </>
    ),
    violation: (
      <>
        MAJOR FOUL and the{" "}
        <b>
          ALLIANCE is <b>ineligible for the BARGE RP</b> if a Qualification
          MATCH
        </b>
        .
      </>
    ),
  },
  {
    year: 2025,
    code: "G420",
    name: "NET and contents are off-limits",
    level: "major",
    card: null,
    rp: null,
    text: (
      <>
        <p>A ROBOT may not contact either NET or any ALGAE scored in a NET.</p>
      </>
    ),
    violation: <>MAJOR FOUL. Additional MAJOR FOUL for each ALGAE de-scored.</>,
  },
  {
    year: 2025,
    code: "G422",
    name: (
      <i>
        <b>Stay out of other ROBOTS</b>
      </i>
    ),
    level: "minor",
    card: null,
    rp: null,
    text: (
      <>
        <p>
          A ROBOT may not use a COMPONENT outside its ROBOT PERIMETER (except
          its BUMPERS) to initiate contact with an opponent ROBOT inside the
          vertical projection of the opponent’s ROBOT PERIMETER.
        </p>
      </>
    ),
    violation: <>MINOR FOUL.</>,
  },
  {
    year: 2025,
    code: "G423",
    name: (
      <i>
        <b>This isn’t combat robotics</b>
      </i>
    ),
    level: "major",
    card: "yellow",
    rp: null,
    text: (
      <>
        <p>
          A ROBOT may not damage or functionally impair an opponent ROBOT in
          either of the following ways:
          <ol type="A">
            <li>deliberately.</li>
            <li>
              regardless of intent, by initiating contact, either directly or
              transitively via a SCORING ELEMENT CONTROLLED by the ROBOT, inside
              the vertical projection of an opponent’s ROBOT PERIMETER.
            </li>
          </ol>
        </p>
        <p>
          Damage or functional impairment because of contact with a tipped-over
          opponent ROBOT, which is not perceived by a REFEREE to be deliberate,
          is not a violation of this rule.
        </p>
      </>
    ),
    violation: (
      <>
        MAJOR FOUL and YELLOW CARD, or if opponent ROBOT is unable to drive,
        then MAJOR FOUL and RED CARD.
      </>
    ),
  },
  {
    year: 2025,
    code: "G424",
    name: "Don’t tip or entangle",
    level: "major",
    card: "yellow",
    rp: null,
    text: (
      <>
        <p>
          A ROBOT may not deliberately, attach to, tip, or entangle with an
          opponent ROBOT.
        </p>
      </>
    ),
    violation: (
      <>
        MAJOR FOUL and YELLOW CARD, or if CONTINUOUS or opponent ROBOT is unable
        to drive, then MAJOR FOUL and RED CARD.
      </>
    ),
  },
  {
    year: 2025,
    code: "G428",
    name: "CAGE protection.",
    level: "major",
    card: null,
    rp: true,
    text: (
      <>
        <p>
          A ROBOT may not contact, directly or transitively through a SCORING
          ELEMENT, an opponent ROBOT in contact with an opponent CAGE during the
          last 20 seconds regardless of who initiates contact.
        </p>
      </>
    ),
    violation: (
      <>
        MAJOR FOUL and the <b>opponent ALLIANCE is awarded the BARGE RP</b>
      </>
    ),
  },
  {
    year: 2025,
    code: "G430",
    name: "COACHES and other teams: hands off the controls",
    level: "major",
    card: "red",
    rp: null,
    text: (
      <>
        <p>
          A ROBOT shall be operated only by the DRIVERS and/or HUMAN PLAYERS of
          that team. A COACH activating their E-Stop or A-Stop is the exception
          to this rule.
        </p>
      </>
    ),
    violation: <>MAJOR FOUL. RED CARD if greater-than-MOMENTARY.</>,
  },
  {
    year: 2025,
    code: "G501",
    name: "Leave promptly",
    level: "verbal",
    card: "red",
    rp: null,
    text: (
      <>
        <p>
          A DRIVE TEAM member may not cause significant or multiple delays to
          the start of a subsequent MATCH, scheduled break content, or other
          FIELD activities.
        </p>
      </>
    ),
    violation: (
      <>
        VERBAL WARNING. YELLOW CARD if subsequent violations at any point during
        the event.
      </>
    ),
  },
  {
    year: 2025,
    code: "I102",
    name: "Get inspected before playing a Qualification/Playoff MATCH",
    level: null,
    card: "red",
    rp: null,
    text: (
      <>
        <p>
          A team is only permitted to participate in a Qualification or Playoff
          MATCH and receive Ranking or MATCH Points if their ROBOT has passed an
          initial, complete inspection.
        </p>
      </>
    ),
    violation: (
      <>
        If prior to the start of the MATCH, the team is DISQUALIFIED and not
        eligible to participate in the MATCH. If after the MATCH, the team
        receives a RED CARD and the MATCH may be replayed per T201.
      </>
    ),
  },
  {
    year: 2025,
    code: "T301",
    name: "Freeze, ROBOT",
    level: "verbal",
    card: "yellow",
    rp: null,
    text: (
      <>
        <p>
          During the period when the ARENA is open for measurement, ROBOTS can
          be enabled, but may neither drive, extend outside their ROBOT
          PERIMETER, nor interact with (e.g. score, push, pickup, etc.) SCORING
          ELEMENTS, a CAGE, PROCESSOR, REEF, CORAL STATION, or other FIELD
          elements.
        </p>
      </>
    ),
    violation: (
      <>
        VERBAL WARNING, plus YELLOW CARD if subsequent violations at any point
        during the event or egregious.
      </>
    ),
  },
];

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
        style={{ alignContent: "center", width: "100%", display: "block" }}
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
            >
              {foul?.rp?<><b>RP</b> </>:""}{foul.code}
            </Button>
          );
        })}
        {_.filter(_.sortBy(commonFouls, ["card", "code","rp"]), (foul) => {
          return foul.card !== "red" && foul.card !== "yellow";
        }).map((foul) => {
          return (
            <Button
              onClick={() => handleShow(foul)}
              className={"foulButtons"}
              variant={"info"}
            >
              {foul?.rp?<><b>RP</b> </>:""}{foul.code}
            </Button>
          );
        })}
        <Button
          className={"foulButtons"}
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
