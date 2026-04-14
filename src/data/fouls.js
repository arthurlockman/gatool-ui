export const commonFouls = [
  {
    year: 2026,
    code: "G101",
    name: "Humans, remain outside the FIELD.",
    level: "verbal",
    card: "yellow",
    rp: false,
    text: (
      <>
        <p>
          A team member may not reach into the FIELD with any part of their body
          during a MATCH.
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
    year: 2026,
    code: "G102",
    name: "Never step over the guardrail",
    level: "verbal",
    card: "yellow",
    rp: false,
    text: (
      <>
        <p>
          A team member may only enter or exit the FIELD through open gates and
          only enter if FIELD lighting (FIELD facing side of the team signs and
          timers) is green, unless explicitly instructed by a REFEREE or an FTA.
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
    year: 2026,
    code: "G103",
    name: "Be careful what you interact with.",
    level: "verbal",
    card: "yellow",
    rp: false,
    text: (
      <>
        <p>
          A team member is prohibited from the following actions with regards to
          interaction with ARENA elements.{" "}
        </p>
        <ol type="A">
          <li>climbing on or inside,</li>
          <li>hanging from,</li>
          <li>
            manipulating such that it doesn’t return to its original shape
            without human intervention, and
          </li>
          <li>damaging.</li>
        </ol>
      </>
    ),
    violation: (
      <>
        VERBAL WARNING. YELLOW CARD if subsequent violations during the event.
      </>
    ),
  },
  {
    year: 2026,
    code: "G104",
    name: "Teams may not enable their ROBOTS on the FIELD",
    level: "verbal",
    card: "yellow",
    rp: false,
    text: (
      <>
        <p>
          Teams may not tether to the ROBOT while on the FIELD except in special
          circumstances (e.g. after Opening Ceremonies, before an immediate
          MATCH replay, etc.) and with the express permission from the FTA or a
          REFEREE.
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
    year: 2026,
    code: "G201",
    name: "Be a good person",
    level: "verbal",
    card: "yellow",
    rp: false,
    text: (
      <>
        <p>
          All teams must be civil toward everyone and respectful of team and
          event equipment while at a FIRST Robotics Competition event.
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
    year: 2026,
    code: "G202",
    name: "Don’t bang on the glass",
    level: "verbal",
    card: "yellow",
    rp: false,
    text: (
      <>
        <p>
          A team member may never strike or hit the DRIVER STATION plastic
          windows.
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
    year: 2026,
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
        </p>
        <p>
          Note: This rule is not intended to prevent an ALLIANCE from planning
          and/or executing its own strategy in a specific MATCH in which all the
          teams are members of the ALLIANCE.
        </p>
      </>
    ),
    violation: (
      <>VERBAL WARNING. RED CARD if subsequent violations during the event.</>
    ),
  },
  {
    year: 2026,
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
        </p>
        <p>
          Note: This rule is not intended to prevent an ALLIANCE from planning
          and/or executing its own strategy in a specific MATCH in which all the
          ALLIANCE members are participants.
        </p>
      </>
    ),
    violation: (
      <>VERBAL WARNING. RED CARD if subsequent violations during the event.</>
    ),
  },
  {
    year: 2026,
    code: "G205",
    name: "Throwing your own MATCH is bad.",
    level: "verbal",
    card: "red",
    rp: false,
    text: (
      <>
        <p>
          A team may not intentionally lose a MATCH or sacrifice Ranking Points
          in an effort to lower their own ranking or manipulate the rankings of
          other teams.
        </p>
      </>
    ),
    violation: (
      <>VERBAL WARNING. RED CARD if subsequent violations during the event.</>
    ),
  },
  {
    year: 2026,
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
      <>YELLOW CARD and the ALLIANCE is ineligible for the BONUS RPs.</>
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
    code: "G212",
    name: "All teams can play",
    level: null,
    card: "yellow",
    rp: null,
    text: (
      <>
        <p>
          A team may not encourage another team to exclude their ROBOT or be
          BYPASSED from a qualification MATCH for any reason
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
    code: "G302",
    name: "Limit what you use during a MATCH.",
    level: null,
    card: "yellow",
    rp: null,
    text: (
      <>
        <p>
          Items used during a match must fit on your team’s DRIVER STATION
          shelf, be worn or held by members from your DRIVE TEAM, or be an item
          used as an accommodation (e.g. stools, crutches, etc.). Regardless of
          if the equipment fits the criteria above, it may not:
          <ol type="A">
            <li>be employed in a way that introduces a safety hazard,</li>
            <li>extend more than 78.0in (1.981m) above the floor,</li>
            <li>
              communicate with anything or anyone outside of the ARENA with the
              exception of medically required equipment,
            </li>
            <li>block visibility for FIELD STAFF or audience members, or</li>
            <li>
              jam or interfere with the remote sensing capabilities of another
              team or the FIELD.
            </li>
          </ol>
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
    year: 2026,
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
            <li>it’s not contacting the BUMP,</li>
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
              it fully and solely supports not more than 8 FUEL (as described in
              section 6.3.4 SCORING ELEMENTS).
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
    year: 2026,
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
          PLAYER entering FUEL onto the FIELD is an exception to this rule.
        </p>
      </>
    ),
    violation: <>MINOR FOUL and YELLOW CARD.</>,
  },
  {
    year: 2026,
    code: "G408",
    name: "Don’t catch FUEL.",
    level: "minor",
    card: "yellow",
    rp: null,
    text: (
      <>
        <p>
          A ROBOT may not do either of the following with FUEL released by the
          HUB unless and until that FUEL contacts anything else besides that
          ROBOT or FUEL CONTROLLED by that ROBOT:
          <ol type="A">
            <li>gain greater than MOMENTARY CONTROL of FUEL, or</li>
            <li>
              push or redirect FUEL to a desired location or in a preferred
              direction.
            </li>
          </ol>
          A ROBOT is in CONTROL of a SCORING ELEMENT if the SCORING ELEMENT is
          fully supported by or stuck in, on, or under the ROBOT.
        </p>
      </>
    ),
    violation: <>MINOR FOUL. If strategic, MAJOR FOUL and YELLOW CARD.</>,
  },
  {
    year: 2026,
    code: "G411",
    name: "Don’t damage the FIELD.",
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
        event.
        <br />
        Corrective action (such as eliminating sharp edges, removing the
        damaging MECHANISM, and/or re-inspection) may be required before the
        ROBOT will be allowed to compete in subsequent MATCHES.
      </>
    ),
  },
  {
    year: 2026,
    code: "G412",
    name: "Watch your FIELD interaction",
    level: "major",
    card: "yellow",
    rp: null,
    text: (
      <>
        <p>
          A ROBOT is prohibited from the following interactions with FIELD
          elements (with the exception of the RUNGS and UPRIGHTS):
        </p>
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
    year: 2026,
    code: "G416",
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
    year: 2026,
    code: "G417",
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
    year: 2026,
    code: "G420",
    name: "TOWER protection.",
    level: "major",
    card: null,
    rp: true,
    text: (
      <>
        <p>
          A ROBOT may not contact, directly or transitively through a SCORING
          ELEMENT, an opponent ROBOT in contact with an opponent TOWER during
          the last 30 seconds of the MATCH regardless of who initiates contact.
        </p>
      </>
    ),
    violation: (
      <>
        MAJOR FOUL and if the opponent ROBOT is off the ground the opponent
        ROBOT is awarded LEVEL 3 TOWER points.
      </>
    ),
  },
  {
    year: 2026,
    code: "G422",
    name: "DRIVE COACHES and other teams: hands off the controls",
    level: "major",
    card: "red",
    rp: null,
    text: (
      <>
        <p>
          A ROBOT shall be operated only by the DRIVERS and/or HUMAN PLAYERS of
          that team. A DRIVE COACH activating their E-Stop or A-Stop is the
          exception to this rule.
        </p>
      </>
    ),
    violation: <>MAJOR FOUL. RED CARD if greater-than-MOMENTARY.</>,
  },
  {
    year: 2026,
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
    year: 2026,
    code: "T301",
    name: "Measurement, not practice.",
    level: "verbal",
    card: "yellow",
    rp: null,
    text: (
      <>
        <p>
          During the period when the ARENA is open for measurement:
          <ol type="A">
            <li>
              ROBOTS can be enabled, but may neither drive, extend outside their
              ROBOT PERIMETER, nor interact with (e.g. score, push, pickup,
              etc.) SCORING ELEMENTS (or anything resembling SCORING ELEMENTS),
              a HUB, BUMP, TRENCH, OUTPOST, or other FIELD elements.
            </li>
            <li>
              Humans may touch a SCORING ELEMENT but may not practice with it
              (e.g. throw FUEL, or anything resembling FUEL, or use the
              OUTPOST).
            </li>
          </ol>
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
