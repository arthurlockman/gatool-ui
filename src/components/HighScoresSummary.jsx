import _ from "lodash";
import { Row, Col } from "react-bootstrap";

/**
 * Picks the higher-scoring of qual vs playoff for a given category (e.g. TBAPenaltyFree or overall).
 * @param {Object} highscores - highscores map keyed by matchType
 * @param {string} qualKey - matchType for qual (e.g. "TBAPenaltyFreequal")
 * @param {string} playoffKey - matchType for playoff (e.g. "TBAPenaltyFreeplayoff")
 * @returns {Object|null} The better entry or null
 */
function bestOfQualPlayoff(highscores, qualKey, playoffKey) {
  if (!highscores) return null;
  const qual = highscores[qualKey];
  const playoff = highscores[playoffKey];
  if (!qual && !playoff) return null;
  if (!qual) return playoff;
  if (!playoff) return qual;
  const qualScore = Number(qual.score);
  const playoffScore = Number(playoff.score);
  return qualScore >= playoffScore ? qual : playoff;
}

function HighScoresSummary({
  worldStats,
  ftcRegionHighScores,
  ftcLeagueHighScores,
  selectedEvent,
  selectedYear,
  eventNamesCY,
  districts,
  ftcLeagues,
}) {
  const year = selectedYear?.value;
  const isFTC = !!selectedEvent?.value?.regionCode;
  const districtCode = selectedEvent?.value?.districtCode;
  const regionCode = selectedEvent?.value?.regionCode;
  const leagueCode = selectedEvent?.value?.leagueCode;

  const eventDisplayName = (eventName) =>
    (eventNamesCY && eventNamesCY[eventName]) || eventName || "";

  const sections = [];

  // World: two results (penalty-free best, overall best)
  if (worldStats?.highscores && year) {
    const penaltyFree = bestOfQualPlayoff(
      worldStats.highscores,
      `${year}TBAPenaltyFreequal`,
      `${year}TBAPenaltyFreeplayoff`
    );
    const overall = bestOfQualPlayoff(
      worldStats.highscores,
      `${year}overallqual`,
      `${year}overallplayoff`
    );
    if (penaltyFree || overall) {
      sections.push({
        label: "World",
        bg: "#f2dede",
        penaltyFree,
        overall,
      });
    }
  }

  // FTC Region
  if (isFTC && ftcRegionHighScores?.highscores) {
    const penaltyFree = bestOfQualPlayoff(
      ftcRegionHighScores.highscores,
      "TBAPenaltyFreequal",
      "TBAPenaltyFreeplayoff"
    );
    const overall = bestOfQualPlayoff(
      ftcRegionHighScores.highscores,
      "overallqual",
      "overallplayoff"
    );
    if (penaltyFree || overall) {
      sections.push({
        label: regionCode ? `Region ${regionCode}` : "Region",
        bg: "#fff5ce",
        penaltyFree,
        overall,
      });
    }
  }

  // FTC League (when available)
  if (isFTC && leagueCode && ftcLeagueHighScores?.highscores) {
    const penaltyFree = bestOfQualPlayoff(
      ftcLeagueHighScores.highscores,
      "TBAPenaltyFreequal",
      "TBAPenaltyFreeplayoff"
    );
    const overall = bestOfQualPlayoff(
      ftcLeagueHighScores.highscores,
      "overallqual",
      "overallplayoff"
    );
    if (penaltyFree || overall) {
      const leagueOption = _.find(ftcLeagues || [], { value: leagueCode });
      const leagueLabel = leagueOption?.label || `League ${leagueCode}`;
      sections.push({
        label: leagueLabel,
        bg: "#eff9ee",
        penaltyFree,
        overall,
      });
    }
  }

  // FRC District
  if (!isFTC && districtCode && worldStats?.highscores && year) {
    const prefix = `${year}District${districtCode}`;
    const penaltyFree = bestOfQualPlayoff(
      worldStats.highscores,
      `${prefix}TBAPenaltyFreequal`,
      `${prefix}TBAPenaltyFreeplayoff`
    );
    const overall = bestOfQualPlayoff(
      worldStats.highscores,
      `${prefix}overallqual`,
      `${prefix}overallplayoff`
    );
    if (penaltyFree || overall) {
      const districtOption = _.filter(districts || [], {
        value: districtCode,
      })[0];
      const districtLabel = districtOption?.label || `District ${districtCode}`;
      sections.push({
        label: districtLabel,
        bg: "#fff5ce",
        penaltyFree,
        overall,
      });
    }
  }

  if (sections.length === 0) return null;

  const eventPrefix = (entry) => {
    if (!entry) return "";
    const name = eventDisplayName(entry.eventName);
    if (name) return `${name} `;
    const m = String(entry.matchName || "");
    return /qual|qualification/i.test(m) ? "Quals " : "Playoffs ";
  };

  const renderEntry = (entry) => {
    if (!entry) return <span className="text-muted"><i>No matches meet criteria.</i></span>;
    const prefix = eventPrefix(entry);
    return (
      <div className="mb-2">
        <div style={{ fontSize: "1.5rem" }}><b>{entry.score}</b></div>
        <div>{prefix}<br />{entry.matchName}<br/>({entry.allianceMembers})</div>
      </div>
    );
  };

  const isFRCRegionalOnly = !isFTC && !districtCode && sections.length === 1;
  const colSize = sections.length > 0 ? Math.floor(12 / sections.length) : 12;
  const renderColumn = (sec) => (
    <Col key={sec.label} xs={12} md={colSize}>
      <div
        className="border rounded p-2 h-100"
        style={{ fontSize: "0.9rem", backgroundColor: sec.bg }}
      >
        <div className="fw-bold mb-2">{sec.label}</div>
        <div className="text-muted small">No penalties to winner</div>
        {renderEntry(sec.penaltyFree)}
        <div className="text-muted small">Incl. penalties</div>
        {renderEntry(sec.overall)}
      </div>
    </Col>
  );

  // FRC Regionals (World only): show as two columns (No penalties to winner | Incl. penalties)
  if (isFRCRegionalOnly) {
    const sec = sections[0];
    return (
      <Row className="mb-2">
        <Col xs={12} md={6}>
          <div
            className="border rounded p-2 h-100"
            style={{ fontSize: "0.9rem", backgroundColor: sec.bg }}
          >
            <div className="fw-bold mb-2">{sec.label} — No penalties to winner</div>
            {renderEntry(sec.penaltyFree)}
          </div>
        </Col>
        <Col xs={12} md={6}>
          <div
            className="border rounded p-2 h-100"
            style={{ fontSize: "0.9rem", backgroundColor: sec.bg }}
          >
            <div className="fw-bold mb-2">{sec.label} — Incl. penalties</div>
            {renderEntry(sec.overall)}
          </div>
        </Col>
      </Row>
    );
  }

  return (
    <Row className="mb-2">
      {sections.map((sec) => renderColumn(sec))}
    </Row>
  );
}

export default HighScoresSummary;
