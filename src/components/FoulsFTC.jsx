export const commonFoulsFTC = [
  {
    year: 3000,
    code: "G101",
    name: "Humans, stay off the FIELD until green",
    level: "verbal",
    card: null,
    rp: false,
    text: (
      <>
        <p>
          Other than actions explicitly allowed in section 11.4.6 Human, a DRIVE
          TEAM member may only enter the FIELD during the following times:
          <ol type={"A"}>
            <li>
              pre-MATCH set-up in order to place their ROBOT and pre-loaded
              SCORING ELEMENTS per G301, G303, and G304, and
            </li>
            <li>
              after a MATCH is over to stop and collect their ROBOT in a
              reasonable amount of time when instructed to do so by the Head
              REFEREE or their designee.
            </li>
          </ol>
        </p>
      </>
    ),
    violation: <>VERBAL WARNING.</>,
  },
  {
    year: 3000,
    code: "G102",
    name: "Be careful when interacting with ARENA elements.",
    level: "verbal",
    card: "yellow",
    rp: false,
    text: (
      <>
        <p>
          A team member is prohibited from the following actions with regards to
          interaction with ARENA elements:
          <ol type="A">
            <li>climbing on,</li>
            <li>hanging from,</li>
            <li>
              manipulating such that it does not return to its original shape
              without human intervention, and
            </li>
            <li>damaging.</li>
          </ol>
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
    code: "G201",
    name: "Be a good person",
    level: "verbal",
    card: "yellow",
    rp: false,
    text: (
      <>
        <p>
          All teams must be civil toward everyone and respectful of team and
          event equipment while at a FIRST Tech Challenge event. Please review
          the FIRST Code of Conduct and Core Values for more information.
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
    code: "G202",
    name: "DRIVE TEAM Interactions",
    level: "verbal",
    card: "yellow",
    rp: false,
    text: (
      <>
        <p>
          DRIVE TEAM members cannot distract/interfere with the opposing
          ALLIANCE. This includes taunting or other disruptive behavior.
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
    code: "G203",
    name: "Asking other teams to throw a MATCH – not cool.",
    level: "verbal",
    card: "red",
    rp: false,
    text: (
      <>
        <p>
          A team may not encourage an ALLIANCE of which it is not a member to
          play beneath its ability.
          <br />
          <i>
            NOTE: This rule is not intended to prevent an ALLIANCE from planning
            and/or executing its own strategy in a specific MATCH in which all
            the teams are members of the ALLIANCE.
          </i>
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
    code: "G204",
    name: "Letting someone coerce you into throwing a MATCH – also not cool.",
    level: "verbal",
    card: "red",
    rp: false,
    text: (
      <>
        <p>
          A team, as the result of encouragement by a team not on their
          ALLIANCE, may not play beneath its ability.
          <br />
          <i>
            NOTE: This rule is not intended to prevent an ALLIANCE from planning
            and/or executing its own strategy in a specific MATCH in which all
            the teams are members of the ALLIANCE.
          </i>
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
    code: "G205",
    name: "Throwing your own match is bad.",
    level: "verbal",
    card: "red",
    rp: false,
    text: (
      <>
        <p>
          A team may not intentionally lose a MATCH or sacrifice RANKING POINTS
          in an effort to lower their own ranking and/or manipulate the rankings
          of other teams.
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
    year: 2025,
    code: "G206",
    name: "Don’t violate rules for RP",
    level: null,
    card: "yellow",
    rp: true,
    text: (
      <>
        <p>
          A team or ALLIANCE may not collude with another team to each
          purposefully violate a rule in an attempt to influence RANKING POINTS.
        </p>
      </>
    ),
    violation: (
      <>YELLOW CARD and the ALLIANCE is ineligible for PATTERN and GOAL RPs</>
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
          A team member (except those DRIVE TEAM members on the DRIVE TEAM for
          the MATCH) granted access to restricted areas in and around the ARENA
          (e.g., via event issued media badges) may not assist, coach, or use
          signaling devices during the MATCH. Exceptions will be granted for
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
    code: "G208",
    name: "Show up to your MATCHES",
    level: null,
    card: "dq",
    rp: null,
    text: (
      <>
        <p>
          If a ROBOT has passed initial, complete inspection, at least 1 member
          of its DRIVE TEAM must report to the ARENA and participate in each of
          their assigned Qualification MATCHES.
        </p>
      </>
    ),
    violation: <>DISQUALIFIED from the current MATCH</>,
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
    level: "minor",
    card: "yellow",
    rp: null,
    text: (
      <>
        <p>
          Actions clearly aimed at forcing the opponent ALLIANCE to violate a
          rule are not in the spirit of FIRST Tech Challenge and not allowed.
          Rule violations forced in this manner will not result in an assignment
          of a penalty to the targeted ALLIANCE.
        </p>
      </>
    ),
    violation: (
      <>
        MINOR FOUL. MAJOR FOUL if REPEATED. The ALLIANCE that was forced to
        break a rule will not be assessed a penalty.
      </>
    ),
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
        <p>
          Continued violations will be brought to FIRST Headquarters’ attention.
          FIRST Headquarters will work with event staff to determine if further
          escalations are necessary, which can include removal from award
          consideration and removal from the event.
        </p>
      </>
    ),
    violation: <>YELLOW or RED CARD.</>,
  },
  {
    year: 3000,
    code: "G212",
    name: "All teams can play",
    level: null,
    card: "yellow",
    rp: null,
    text: (
      <>
        <p>
          A team may not encourage another team to exclude their ROBOT or be
          DISQUALIFIED from a Qualification MATCH for any reason.
        </p>
      </>
    ),
    violation: (
      <>
        YELLOW CARD or RED CARD if the ROBOT does not participate in the MATCH.
      </>
    ),
  },
  {
    year: 3000,
    code: "G301",
    name: "Be prompt.",
    level: "verbal",
    card: null,
    rp: null,
    text: (
      <>
        <p>
          A DRIVE TEAM member may not cause significant delays to the start of
          their MATCH. Causing a significant delay requires both of the
          following to be true:
          <ol type={"A"}>
            <li>The expected MATCH start time has passed, and</li>
            <li>
              The DRIVE TEAM has access to the ARENA and is neither MATCH ready
              nor making a good faith effort, as perceived by the Head REFEREE,
              to quickly become MATCH ready.
            </li>
          </ol>
        </p>
      </>
    ),
    violation: (
      <>
        <p>
          If a Qualification MATCH: VERBAL WARNING. MAJOR FOUL for the upcoming
          MATCH if a subsequent violation occurs within the tournament phase. If
          the DRIVE TEAM is not MATCH ready within 2 minutes of the VERBAL
          WARNING/MAJOR FOUL, and the Head REFEREE perceives no good faith
          effort by the DRIVE TEAM to quickly become MATCH ready, DISABLED.
        </p>

        <p>
          If a Playoff MATCH: a VERBAL WARNING is issued to the ALLIANCE. MAJOR
          FOUL for the ALLIANCE’S upcoming MATCH if a subsequent violation
          occurs within the tournament phase. If the ALLIANCE is not MATCH ready
          within 2 minutes of the VERBAL WARNING/MAJOR FOUL having been issued,
          and the Head REFEREE perceives no good faith effort by the DRIVE
          TEAM(s) to quickly become MATCH ready, the offending team’s ROBOT is
          DISABLED.
        </p>
      </>
    ),
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
          Items brought to the FIELD to be used for a MATCH, in addition to the
          ROBOT, OPERATOR CONSOLE, must fit in the team’s designated ALLIANCE
          AREA, be worn or held by members of the DRIVE TEAM, or be an item used
          as an accommodation (e.g., single-step stools that do not roll/fold,
          crutches, cushion, kneeling mat,). Regardless of if the equipment fits
          the criteria above, it may not:
          <ol type={"A"}>
            <li>be employed in a way that introduces a safety hazard,</li>
            <li>extend more than 6 ft. 6 in. (~198 cm) above the TILES,</li>
            <li>
              communicate with anything or anyone outside of the ARENA with the
              exception of medically required equipment,
            </li>
            <li>block visibility for FIELD STAFF or audience members, or</li>
            <li>jam or interfere with anything in the ARENA.</li>
          </ol>
        </p>
      </>
    ),
    violation: (
      <>
        MATCH will not start until the situation is remedied. YELLOW CARD, if
        discovered or used inappropriately during a MATCH.
      </>
    ),
  },
  {
    year: 3000,
    code: "G303",
    name: "ROBOTS on the FIELD must come ready to play a MATCH.",
    level: null,
    card: "red",
    rp: null,
    text: (
      <>
        <p>
          A ROBOT must meet all following MATCH-start requirements:
          <ol type={"A"}>
            <li>
              does not pose a hazard to humans, FIELD elements, or other ROBOTS.
            </li>

            <li>
              has passed inspection, i.e., it is compliant with all ROBOT rules.
            </li>
            <li>
              if modified after initial Inspection, it is compliant with I305.
            </li>
            <li>is the only team-provided item left on the FIELD.</li>
            <li>
              ROBOT SIGNS must indicate the correct ALLIANCE color (see R101).
            </li>
            <li>
              ROBOT must be motionless following completion of OpMode
              initialization.
            </li>
          </ol>
        </p>
      </>
    ),
    violation: (
      <>
        The MATCH will not start until all requirements are met if there is a
        quick remedy. DISABLED if it is not a quick remedy, and, at the
        discretion of the Head REFEREE, ROBOT must be re-inspected. RED CARD if
        a team’s ROBOT is not compliant with part B or C participates.
      </>
    ),
  },
  {
    year: 2025,
    code: "G401",
    name: "Let the ROBOT do its thing",
    level: "major",
    card: null,
    rp: true,
    text: (
      <>
        <p>
          As soon as FIELD STAFF begins the randomization process and until the
          end of AUTO, DRIVE TEAM members may not directly or indirectly
          interact with a ROBOT or an OPERATOR CONSOLE, with the following
          exceptions:
          <ol type="A">
            <li>
              to press the (▶) start button within a MOMENTARY reaction of the
              start of the MATCH,
            </li>
            <li>
              to press the (■) stop button either at the team’s discretion or
              instruction of the Head REFEREE per T202, or
            </li>
            <li>for personal safety or OPERATOR CONSOLE safety.</li>
          </ol>
        </p>
      </>
    ),
    violation: (
      <>
        MAJOR FOUL plus the ALLIANCE is not eligible for PATTERN points in AUTO
        if the ROBOT LAUNCHES an ARTIFACT such that it enters the open top of
        the GOAL after the interaction and before the end of AUTO.
      </>
    ),
  },
  {
    year: 2025,
    code: "G402",
    name: "No AUTO opponent interference.",
    level: "major",
    card: null,
    rp: null,
    text: (
      <>
        <p>
          During AUTO, FIELD columns A, B, C constitute the blue side of the
          FIELD, and columns D, E, F (Figure 9‑5) constitute the red side of the
          FIELD. During AUTO, a ROBOT may not:
          <ol type={"A"}>
            <li>
              contact an opposing ALLIANCE’S ROBOT which is completely within
              the opposing ALLIANCE’S side of the FIELD either directly or
              transitively through an ARTIFACT, or
            </li>
            <li>
              disrupt an ARTIFACT from its pre-staged location on the opposing
              ALLIANCE’S side of the FIELD either directly or transitively
              through contact with an ARTIFACT, or by LAUNCHING or rolling an
              ARTIFACT directly into it.
            </li>
          </ol>
        </p>
      </>
    ),
    violation: (
      <>
        MAJOR FOUL per instance of ROBOT contact in G402.A and MAJOR FOUL per
        ARTIFACT in G402.B.
      </>
    ),
  },
  {
    year: 2025,
    code: "G408",
    name: "No more than 3 at a time.",
    level: "minor",
    card: "yellow",
    rp: null,
    text: (
      <>
        <p>A ROBOT may not simultaneously CONTROL more than 3 ARTIFACTS.</p>
      </>
    ),
    violation: (
      <>
        MINOR FOUL per SCORING ELEMENT over the limit. YELLOW CARD if excessive.
      </>
    ),
  },
  {
    year: 3000,
    code: "G409",
    name: "ROBOTS must be under control.",
    level: null,
    card: "yellow",
    rp: null,
    text: (
      <>
        <p>
          A ROBOT must not pose an undue hazard to a human or an ARENA element
          during a MATCH in the following ways:
          <ol type={"A"}>
            <li>
              the ROBOT or anything it CONTROLS, i.e., a SCORING ELEMENT,
              disrupts anything outside the FIELD or contacts a human that is
              outside the FIELD.
            </li>
            <li>the ROBOT operation is dangerous.</li>
          </ol>
        </p>
      </>
    ),
    violation: (
      <>
        Violation: DISABLED and VERBAL WARNING. YELLOW CARD if REPEATED or if
        subsequent violations occur during the event.
      </>
    ),
  },
  {
    year: 3000,
    code: "G410",
    name: "ROBOTS must stop when instructed.",
    level: "major",
    card: "red",
    rp: true,
    text: (
      <>
        <p>
          If a team is instructed to DISABLE their ROBOT by a REFEREE per T202,
          a DRIVE TEAM member must press the (■) stop button on the DRIVER
          STATION app.
        </p>
      </>
    ),
    violation: (
      <>
        MAJOR FOUL if greater-than-MOMENTARY delay plus RED CARD if CONTINUOUS.
      </>
    ),
  },
  {
    year: 2025,
    code: "G412",
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
        VERBAL WARNING. DISABLED if the Head REFEREE infers that additional
        damage is likely. YELLOW CARD for any subsequent damage during the
        event. Corrective action (such as eliminating sharp edges, removing the
        damaging MECHANISM, and/or re-inspection) may be required before the
        ROBOT will be allowed to compete in subsequent MATCHES.
      </>
    ),
  },
  {
    year: 2025,
    code: "G413",
    name: "Watch your ARENA interaction.",
    level: "major",
    card: "yellow",
    rp: null,
    text: (
      <>
        <p>
          A ROBOT is prohibited from the following interactions with an ARENA
          element, except for SCORING ELEMENTS (per G407):
          <ol type={"A"}>
            <li>grabbing,</li>
            <li>grasping,</li>
            <li>attaching to,</li>
            <li>becoming entangled with, or</li>
            <li>suspending from.</li>
          </ol>
        </p>
      </>
    ),
    violation: (
      <>
        MAJOR FOUL plus YELLOW CARD if REPEATED or if greater-than-MOMENTARY.
        DISABLED if the Head REFEREE infers that damage is likely. Corrective
        action (such as removing the offending MECHANISM, and/or re-inspection)
        may be required before the ROBOT will be allowed to compete in
        subsequent MATCHES.
      </>
    ),
  },
  {
    year: 2025,
    code: "G417",
    name: "ROBOTS only operate GATES as directed.",
    level: "major",
    card: null,
    rp: true,
    text: (
      <>
        <p>
          ROBOTs may not:
          <ol type={"A"}>
            <li>
              contact, either directly or transitively through a SCORING
              ELEMENT, an opposing ALLIANCE’S GATE, or
            </li>
            <li>apply any closing force to either GATE.</li>
          </ol>
        </p>
      </>
    ),
    violation: (
      <>
        MAJOR FOUL and the opposing ALLIANCE is awarded the PATTERN RP if
        G417.A.
      </>
    ),
  },
  {
    year: 2025,
    code: "G418",
    name: "ROBOTS may not meddle with ARTIFACTS on RAMPS",
    level: "major",
    card: null,
    rp: true,
    text: (
      <>
        <p>
          ROBOTS may not contact, either directly or transitively through a
          SCORING ELEMENT CONTROLLED by the ROBOT, ARTIFACTS on a RAMP,
          including their own RAMP. Additionally, ROBOTS may not:
          <ol type={"A"}>
            <li>
              remove an ARTIFACT from their own RAMP except by operating the
              GATE, or
            </li>
            <li>remove an ARTIFACT from the opponent’s RAMP by any means.</li>
          </ol>
        </p>
      </>
    ),
    violation: (
      <>
        MAJOR FOUL per ARTIFACT, and the ALLIANCE is ineligible for the PATTERN
        RP if G418.A, or the opposing ALLIANCE is awarded the PATTERN RP if
        G418.B.
      </>
    ),
  },
  {
    year: 2025,
    code: "G419",
    name: "ROBOTS LAUNCH into their own GOAL.",
    level: "major",
    card: null,
    rp: true,
    text: (
      <>
        <p>
          ROBOTS may not:
          <ol type={"A"}>
            <li>
              intentionally place or LAUNCH ARTIFACTS directly onto their own
              RAMP, or
            </li>
            <li>
              place or LAUNCH ARTIFACTS into the opponent’s GOAL or onto the
              opponent’s RAMP.
            </li>
          </ol>
        </p>
      </>
    ),
    violation: (
      <>
        MAJOR FOUL per ARTIFACT, and the ALLIANCE is ineligible for the PATTERN
        RP if G418.A, or the opposing ALLIANCE is awarded the PATTERN RP if
        G418.B.
      </>
    ),
  },
  {
    year: 2025,
    code: "G420",
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
          A ROBOT may not functionally impair an opponent ROBOT in either of the
          following ways:
          <ol type={"A"}>
            <li>deliberately.</li>
            <li>
              regardless of intent, by initiating contact, either directly or
              transitively via a SCORING ELEMENT CONTROLLED by the ROBOT, inside
              the opposing ROBOT’S CHASSIS.
            </li>
          </ol>
        </p>
        <p>
          Damage or functional impairment because of contact with a tipped-over
          or DISABLED opponent ROBOT, which is not perceived by a REFEREE to be
          deliberate, is not a violation of this rule.
        </p>
      </>
    ),
    violation: (
      <>
        MAJOR FOUL and YELLOW CARD. MAJOR FOUL and RED CARD if opponent ROBOT is
        unable to drive.
      </>
    ),
  },
  {
    year: 2025,
    code: "G421",
    name: "Don’t tip or entangle",
    level: "major",
    card: "yellow",
    rp: null,
    text: (
      <>
        <p>
          A ROBOT may not deliberately, as perceived by a REFEREE, attach to,
          tip, or entangle an opponent ROBOT.
        </p>
      </>
    ),
    violation: (
      <>
        MAJOR FOUL and YELLOW CARD. MAJOR FOUL and RED CARD if CONTINUOUS or
        opponent ROBOT is unable to drive.
      </>
    ),
  },

  {
    year: 3000,
    code: "G429",
    name: "DRIVE COACHES and other teams: hands off the controls",
    level: "major",
    card: "yellow",
    rp: null,
    text: (
      <>
        <p>
          A ROBOT shall be operated only by the DRIVERS of that team; DRIVE
          COACHES may not handle the gamepads. DRIVE COACHES, if desired, may
          help the DRIVERS in the following ways:
          <ol type={"A"}>
            <li>holding the DRIVER STATION device,</li>
            <li>troubleshooting the DRIVER STATION device,</li>
            <li>selecting OpModes on the DRIVER STATION app,</li>
            <li>pressing the INIT button on the DRIVER STATION app,</li>
            <li>pressing the (▶) start button on the DRIVER STATION app, or</li>
            <li>pressing the (■) stop button on the DRIVER STATION app.</li>
          </ol>
        </p>
      </>
    ),
    violation: <>MAJOR FOUL. YELLOW CARD if greater-than-MOMENTARY.</>,
  },
  {
    year: 3000,
    code: "G431",
    name: "DRIVE TEAMS, watch your reach.",
    level: "major",
    card: "yellow",
    rp: null,
    text: (
      <>
        <p>
          Once a MATCH starts, a DRIVE TEAM member inside the FIELD may not:
          <ol type={"A"}>
            <li>directly contact a ROBOT,</li>
            <li>contact a SCORING ELEMENT in contact with a ROBOT,</li>
            <li>disrupt SCORING ELEMENT scoring, or</li>
            <li>contact a FIELD element.</li>
          </ol>
        </p>
      </>
    ),
    violation: (
      <>
        MAJOR FOUL plus YELLOW CARD if G431.A. RED CARD and the opposing
        ALLIANCE is awarded the PATTERN RP if G431.C.
      </>
    ),
  },
  {
    year: 3000,
    code: "I302",
    name: "Enter only 1 ROBOT.",
    level: "verbal",
    card: "red",
    rp: null,
    text: (
      <>
        <p>
          Each team may only inspect and play MATCHES with 1 ROBOT at a FIRST
          Tech Challenge event. Each FIRST Tech Challenge team may only
          participate in 1 concurrent event at a time.
        </p>
      </>
    ),
    violation: <>VERBAL WARNING. RED CARD if not corrected.</>,
  },
  {
    year: 3000,
    code: "I303",
    name: "Get inspected before playing a Qualification/Playoff MATCH",
    level: null,
    card: "red",
    rp: null,
    text: (
      <>
        <p>
          A team is only permitted to participate in a Qualification or Playoff
          MATCH and receive RANKING POINTS if their ROBOT has passed an initial,
          complete inspection. INSPECTORS are available to help, but teams are
          expected to ensure their ROBOT and other supporting equipment are
          within the rules at all times when competing.
        </p>
      </>
    ),
    violation: (
      <>
        If prior to the start of the MATCH, the team is DISQUALIFIED and not
        eligible to participate in the MATCH. If after the start of the MATCH,
        the team receives a RED CARD for that MATCH.
      </>
    ),
  },
  {
    year: 3000,
    code: "I305",
    name: "Unless the change is listed below, any change to a ROBOT must get re-inspected.",
    level: null,
    card: "red",
    rp: null,
    text: (
      <>
        <p>
          A ROBOT may play MATCHES with a subset of the MECHANISMS that were
          present during inspection provided the reconfigured ROBOT still
          complies with all ROBOT construction rules. Only MECHANISMS that were
          present during the inspection may be added, removed, or reconfigured
          between MATCHES without re-inspection per this rule. If a ROBOT is
          modified after its most recently passed inspection, it must be
          re-inspected before the ROBOT is eligible to participate in a MATCH.
        </p>
        <p>
          Exceptions are listed below (unless they result in a significant
          change to the ROBOT’S size, legality, or safety).
          <ol type={"A"}>
            <li>
              addition, relocation, or removal of fasteners (e.g., cable ties,
              tape, and rivets),
            </li>
            <li>addition, relocation, or removal of labeling or marking,</li>
            <li>addition, relocation, or replacement of the team SIGN,</li>
            <li>revision of ROBOT code,</li>
            <li>replacement of a COMPONENT with an identical COMPONENT,</li>
            <li>
              replacement of a MECHANISM with an identical MECHANISM (size,
              weight, material), and
            </li>
            <li>
              additions, removals, or reconfiguration of ROBOT with a subset of
              MECHANISMS already inspected per I304
            </li>
          </ol>
        </p>
      </>
    ),
    violation: (
      <>
        ROBOT must be inspected before participating in a MATCH or the team will
        receive a RED CARD.
      </>
    ),
  },
];
