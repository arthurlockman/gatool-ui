// Fouls that can result in a YELLOW CARD, RED CARD, or DISQUALIFICATION under
// the 2026 FIRST Global Challenge (Igniting Innovation) Game Manual. FIRST
// Global does not award automatic Ranking Points for fouls, so `rp` is always
// false here.
export const commonFoulsFirstGlobal = [
  {
    year: 2026,
    code: "M01",
    name: "Play the game as written",
    level: null,
    card: "yellow",
    rp: false,
    text: (
      <>
        <p>
          Teams must play the game as intended. Attempts to gain a competitive
          advantage by employing an unintended method of play violate the
          rules.
        </p>
      </>
    ),
    violation: (
      <>YELLOW CARD, or RED CARD for repeated or egregious violations.</>
    ),
  },
  {
    year: 2026,
    code: "M02",
    name: "Be a good person",
    level: null,
    card: "yellow",
    rp: false,
    text: (
      <>
        <p>
          All teams are expected to support and demonstrate the FIRST Global
          goals and expected behaviors in all actions and interactions at the
          event.
        </p>
      </>
    ),
    violation: (
      <>
        YELLOW CARD, RED CARD for repeated violations, or DISQUALIFIED for
        egregious conduct.
      </>
    ),
  },
  {
    year: 2026,
    code: "M05",
    name: "Pre-designate one HUMAN PLAYER",
    level: null,
    card: "yellow",
    rp: false,
    text: (
      <>
        <p>
          Each team may pre-designate only one HUMAN PLAYER for each MATCH.
        </p>
      </>
    ),
    violation: (
      <>
        YELLOW CARD + MINOR FOUL, or YELLOW CARD + MAJOR FOUL for repeated
        violations.
      </>
    ),
  },
  {
    year: 2026,
    code: "M09",
    name: "Stay stationary until “go”",
    level: null,
    card: "yellow",
    rp: false,
    text: (
      <>
        <p>
          ROBOTS must start the MATCH stationary and may not move until the
          MATCH begins.
        </p>
      </>
    ),
    violation: <>YELLOW CARD.</>,
  },
  {
    year: 2026,
    code: "M10",
    name: "Stay in your ALLIANCE STATION",
    level: null,
    card: "yellow",
    rp: false,
    text: (
      <>
        <p>
          DRIVE TEAMS must remain in their assigned ALLIANCE STATIONS
          throughout the MATCH.
        </p>
      </>
    ),
    violation: <>YELLOW CARD.</>,
  },
  {
    year: 2026,
    code: "M11",
    name: "No outside communication",
    level: null,
    card: "yellow",
    rp: false,
    text: (
      <>
        <p>
          Outside communication with the DRIVE TEAM is prohibited during the
          MATCH.
        </p>
      </>
    ),
    violation: <>YELLOW CARD.</>,
  },
  {
    year: 2026,
    code: "M12",
    name: "Wait until it's safe",
    level: null,
    card: "yellow",
    rp: false,
    text: (
      <>
        <p>
          DRIVE TEAMS may not contact anything inside of the PLAYING FIELD
          until the field LEDs indicate it is safe to do so.
        </p>
      </>
    ),
    violation: <>YELLOW CARD.</>,
  },
  {
    year: 2026,
    code: "M13",
    name: "Hands off the ROBOT",
    level: null,
    card: "yellow",
    rp: false,
    text: (
      <>
        <p>
          DRIVE TEAMS must not directly interact with ROBOTS during the
          MATCH.
        </p>
      </>
    ),
    violation: (
      <>YELLOW CARD, or RED CARD for repeated or egregious violations.</>
    ),
  },
  {
    year: 2026,
    code: "M16",
    name: "Don't damage or disable other ROBOTS",
    level: "major",
    card: "yellow",
    rp: false,
    text: (
      <>
        <p>
          ROBOTS may not intentionally damage, tip over, or disable other
          ROBOTS.
        </p>
      </>
    ),
    violation: <>YELLOW CARD + MAJOR FOUL.</>,
  },
  {
    year: 2026,
    code: "M18",
    name: "Stay off the PLAYING FIELD structure",
    level: null,
    card: "yellow",
    rp: false,
    text: (
      <>
        <p>
          ROBOTS may not grab, grapple, grasp, or attach to any part of the
          PLAYING FIELD.
        </p>
      </>
    ),
    violation: <>YELLOW CARD.</>,
  },
  {
    year: 2026,
    code: "M19",
    name: "Don't force a violation",
    level: "major",
    card: "yellow",
    rp: false,
    text: (
      <>
        <p>
          Strategies aimed at causing an opponent to violate a rule are not
          allowed.
        </p>
      </>
    ),
    violation: <>YELLOW CARD + MAJOR FOUL.</>,
  },
  {
    year: 2026,
    code: "M22",
    name: "Keep it civil in the stands",
    level: null,
    card: "yellow",
    rp: false,
    text: (
      <>
        <p>
          Spectators and team members should be respectful of noise levels.
          Excessive noise includes sustained, amplified sound directed at the
          PLAYING FIELD or DRIVE TEAMS.
        </p>
      </>
    ),
    violation: (
      <>
        YELLOW CARD, RED CARD for repeated violations, or DISQUALIFIED for
        egregious conduct.
      </>
    ),
  },
  {
    year: 2026,
    code: "G01",
    name: "Play to score, not just to block",
    level: "major",
    card: "yellow",
    rp: false,
    text: (
      <>
        <p>
          ROBOT actions which only serve to prevent the opposing REGIONAL
          ALLIANCE from scoring, without contributing to the ROBOT&rsquo;s own
          scoring, are not allowed.
        </p>
      </>
    ),
    violation: <>YELLOW CARD + MAJOR FOUL.</>,
  },
  {
    year: 2026,
    code: "G03",
    name: "Stay in your starting volume",
    level: "major",
    card: "yellow",
    rp: false,
    text: (
      <>
        <p>
          ROBOTS may not extend beyond their starting volume until after the
          MATCH begins.
        </p>
      </>
    ),
    violation: <>YELLOW CARD + MAJOR FOUL.</>,
  },
  {
    year: 2026,
    code: "G07",
    name: "Don't damage GAME PIECES",
    level: null,
    card: "yellow",
    rp: false,
    text: (
      <>
        <p>
          Damaged GAME PIECES will not be counted for score, and damaging
          them is a rule violation.
        </p>
      </>
    ),
    violation: (
      <>
        YELLOW CARD, YELLOW CARD + MINOR or MAJOR FOUL, or RED CARD depending
        on severity.
      </>
    ),
  },
  {
    year: 2026,
    code: "G08",
    name: "Only HUMAN PLAYERS touch WILDFIRE",
    level: "minor",
    card: "yellow",
    rp: false,
    text: (
      <>
        <p>
          HUMAN PLAYERS are the only DRIVE TEAM members allowed to interact
          with WILDFIRE.
        </p>
      </>
    ),
    violation: <>YELLOW CARD + MINOR FOUL.</>,
  },
  {
    year: 2026,
    code: "G09",
    name: "Stay in the HUMAN PLAYER ZONE",
    level: "minor",
    card: "yellow",
    rp: false,
    text: (
      <>
        <p>
          HUMAN PLAYERS must be standing in the HUMAN PLAYER ZONE when
          CONTAINING WILDFIRE.
        </p>
      </>
    ),
    violation: <>YELLOW CARD + MINOR FOUL.</>,
  },
  {
    year: 2026,
    code: "G10",
    name: "Only ROBOTS contain WILDFIRE",
    level: "minor",
    card: "yellow",
    rp: false,
    text: (
      <>
        <p>
          WILDFIRE may only be CONTAINED in the SUPPRESSION UNITS by ROBOTS.
        </p>
      </>
    ),
    violation: <>YELLOW CARD + MINOR FOUL.</>,
  },
  {
    year: 2026,
    code: "G11",
    name: "Retrieve WILDFIRE from the FIRE SHIELD only",
    level: null,
    card: "yellow",
    rp: false,
    text: (
      <>
        <p>
          HUMAN PLAYERS may only retrieve WILDFIRE from inside the FIRE
          SHIELD.
        </p>
      </>
    ),
    violation: <>YELLOW CARD + MINOR or MAJOR FOUL.</>,
  },
  {
    year: 2026,
    code: "G13",
    name: "Don't launch GAME PIECES at anyone",
    level: null,
    card: "red",
    rp: false,
    text: (
      <>
        <p>
          ROBOTS may not intentionally launch or propel GAME PIECES through
          the air at other ROBOTS or humans.
        </p>
      </>
    ),
    violation: <>RED CARD.</>,
  },
  {
    year: 2026,
    code: "G18",
    name: "Don't interfere with CLIMBING",
    level: null,
    card: "yellow",
    rp: false,
    text: (
      <>
        <p>
          ROBOTS must not intentionally interfere with other ROBOTS CLIMBING
          the BRACE.
        </p>
      </>
    ),
    violation: (
      <>YELLOW CARD, or RED CARD for repeated or egregious violations.</>
    ),
  },
  {
    year: 2026,
    code: "R02",
    name: "One ROBOT per team",
    level: null,
    card: "dq",
    rp: false,
    text: (
      <>
        <p>
          Each FIRST Global team may only enter one ROBOT and may not bring
          additional ROBOTS to the event.
        </p>
      </>
    ),
    violation: <>DISQUALIFIED.</>,
  },
  {
    year: 2026,
    code: "R07",
    name: "Keep your ROBOT together",
    level: null,
    card: "yellow",
    rp: false,
    text: (
      <>
        <p>
          ROBOTS must remain in one piece on the PLAYING FIELD and may not
          intentionally detach parts.
        </p>
      </>
    ),
    violation: (
      <>YELLOW CARD, or RED CARD for repeated or egregious violations.</>
    ),
  },
  {
    year: 2026,
    code: "R09",
    name: "Get inspected before you play",
    level: null,
    card: "red",
    rp: false,
    text: (
      <>
        <p>
          Each ROBOT must pass an initial inspection before it is eligible to
          compete.
        </p>
      </>
    ),
    violation: <>RED CARD.</>,
  },
  {
    year: 2026,
    code: "R18",
    name: "ROBOTS stay in the pits overnight",
    level: null,
    card: "red",
    rp: false,
    text: (
      <>
        <p>
          ROBOTS must remain in each team&rsquo;s pit at the venue overnight
          throughout the EVENT.
        </p>
      </>
    ),
    violation: <>RED CARD.</>,
  },
];
