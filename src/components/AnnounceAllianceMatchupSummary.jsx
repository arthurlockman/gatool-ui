import _ from "lodash";

/** Caster's Tool / connections API often sends result: "winner" for event wins. */
const WINNER_RESULT_EXACT = new Set([
  "winner",
  "winners",
  "won",
  "champion",
  "champions",
  "gold",
]);

/** True when API result text indicates this partnership won that playoff stage/event. */
function isPartnershipWinnerResult(result) {
  if (result == null || String(result).trim() === "") return false;
  const s = String(result).toLowerCase().trim();
  if (WINNER_RESULT_EXACT.has(s)) return true;
  if (
    /\b(lost|loss|eliminated|elimination|runner|2nd|second|did not advance)\b/.test(
      s
    )
  ) {
    return false;
  }
  return /\b(won|winner|winners|champion|champions|gold|1st\b|first place|blue banner|event winner)\b/.test(
    s
  );
}

/** True when API result text indicates this partnership was a finalist (runner-up, 2nd, etc.). */
function isPartnershipFinalistResult(result) {
  if (result == null || String(result).trim() === "") return false;
  const s = String(result).toLowerCase().trim();
  return /\b(finalist|finalists|runner[- ]?up|runner[- ]?ups|2nd|second place|silver)\b/.test(
    s
  );
}

/**
 * Renders prior playoff partner pairings from connections API (partnered_at only).
 * @param {object} props
 * @param {Array<{ team_a: number, team_b: number, team_a_name?: string, team_b_name?: string, partnered_at?: Array<{ event_key?: string, event_name?: string, year?: number, stage?: string, result?: string|null }> }>} [props.connections]
 * @param {boolean} [props.loading]
 * @param {Error|null} [props.error]
 */
function AnnounceAllianceMatchupSummary({ connections, loading, error }) {
  if (loading) {
    return (
      <div className="announce-alliance-matchup-summary announce-alliance-matchup-summary--status">
        <span className="text-muted">Loading prior partnerships…</span>
      </div>
    );
  }
  if (error) {
    const message =
      error?.message && typeof error.message === "string"
        ? error.message
        : "Partnership history unavailable";
    return (
      <div className="announce-alliance-matchup-summary announce-alliance-matchup-summary--status">
        <span className="text-muted">{message}</span>
      </div>
    );
  }
  if (!connections?.length) {
    return (
      <div className="announce-alliance-matchup-summary announce-alliance-matchup-summary--status">
        <span className="text-muted">No prior playoff partnerships</span>
      </div>
    );
  }

  const teamIds = new Set();
  connections.forEach((e) => {
    teamIds.add(e.team_a);
    teamIds.add(e.team_b);
  });
  const teamCount = teamIds.size;

  const eventKeyYearToEntry = {};
  connections.forEach((edge) => {
    (edge.partnered_at || []).forEach((p) => {
      const key = `${p.event_key || ""}|${p.year ?? ""}`;
      if (!eventKeyYearToEntry[key])
        eventKeyYearToEntry[key] = {
          event_key: p.event_key,
          event_name: p.event_name,
          year: p.year,
          stage: p.stage,
          result: p.result,
          edgeCount: 0,
        };
      eventKeyYearToEntry[key].edgeCount += 1;
    });
  });

  const fullAllianceEventKeys = new Set();
  if (teamCount >= 3 && connections.length >= 3) {
    Object.entries(eventKeyYearToEntry).forEach(([key, entry]) => {
      if (entry.edgeCount >= connections.length) fullAllianceEventKeys.add(key);
    });
  }

  const lines = [];
  const fullAllianceEvents = _.orderBy(
    Object.entries(eventKeyYearToEntry)
      .filter(([key]) => fullAllianceEventKeys.has(key))
      .map(([, entry]) => entry),
    ["year"],
    ["desc"]
  );

  if (fullAllianceEvents.length > 0) {
    lines.push(
      <div key="alliance-header" className="announce-alliance-matchup-pair">
        <b>Alliance</b>
      </div>
    );
    fullAllianceEvents.forEach((p, i) => {
      const bits = [
        p.year != null ? String(p.year) : "",
        p.event_name || p.event_key || "",
        ...(p.stage && p.stage.toLowerCase() !== "finals" ? [p.stage] : []),
      ].filter(Boolean);
      const hasResult =
        p.result != null && String(p.result).trim() !== "";
      const winner = hasResult && isPartnershipWinnerResult(p.result);
      const finalist = hasResult && isPartnershipFinalistResult(p.result);
      const lineClass = winner
        ? "announce-alliance-matchup-line announce-alliance-matchup-line--winner"
        : finalist
          ? "announce-alliance-matchup-line announce-alliance-matchup-line--finalist"
          : "announce-alliance-matchup-line";
      const resultDisplay = winner
        ? "WINNER 🏆"
        : finalist
          ? "FINALIST"
          : String(p.result).trim();
      lines.push(
        <div
          key={`alliance-${p.event_key}-${p.year}-${i}`}
          className={lineClass}
        >
          <span className="announce-alliance-matchup-line-main">
            {bits.join(" · ")}
          </span>
          {hasResult && (
            <span className="announce-alliance-matchup-line-result">
              {" — "}
              <strong>{resultDisplay}</strong>
            </span>
          )}
        </div>
      );
    });
  }

  connections.forEach((edge) => {
    const a = edge.team_a;
    const b = edge.team_b;
    const nameA = edge.team_a_name || `#${a}`;
    const nameB = edge.team_b_name || `#${b}`;
    const partnered = edge.partnered_at || [];
    const pairOnly = partnered.filter(
      (p) => !fullAllianceEventKeys.has(`${p.event_key || ""}|${p.year ?? ""}`)
    );
    if (pairOnly.length === 0 && fullAllianceEvents.length > 0) return;
    if (partnered.length === 0) return;
    const header = (
      <div key={`h-${a}-${b}`} className="announce-alliance-matchup-pair">
        <b>
          {nameA} / {nameB}
        </b>
      </div>
    );
    lines.push(header);
    const sorted = _.orderBy(pairOnly.length ? pairOnly : partnered, ["year"], ["desc"]);
    sorted.forEach((p, i) => {
      const bits = [
        p.year != null ? String(p.year) : "",
        p.event_name || p.event_key || "",
        ...(p.stage && p.stage.toLowerCase() !== "finals" ? [p.stage] : []),
      ].filter(Boolean);
      const hasResult =
        p.result != null && String(p.result).trim() !== "";
      const winner = hasResult && isPartnershipWinnerResult(p.result);
      const finalist = hasResult && isPartnershipFinalistResult(p.result);
      const lineClass = winner
        ? "announce-alliance-matchup-line announce-alliance-matchup-line--winner"
        : finalist
          ? "announce-alliance-matchup-line announce-alliance-matchup-line--finalist"
          : "announce-alliance-matchup-line";
      const resultDisplay = winner
        ? "WINNER 🏆"
        : finalist
          ? "FINALIST"
          : String(p.result).trim();
      lines.push(
        <div
          key={`${a}-${b}-${p.event_key}-${i}`}
          className={lineClass}
        >
          <span className="announce-alliance-matchup-line-main">
            {bits.join(" · ")}
          </span>
          {hasResult && (
            <span className="announce-alliance-matchup-line-result">
              {" — "}
              <strong>{resultDisplay}</strong>
            </span>
          )}
        </div>
      );
    });
  });

  if (lines.length === 0) {
    return (
      <div className="announce-alliance-matchup-summary announce-alliance-matchup-summary--status">
        <span className="text-muted">No prior playoff partnerships</span>
      </div>
    );
  }

  return (
    <div className="announce-alliance-matchup-summary">{lines}</div>
  );
}

export default AnnounceAllianceMatchupSummary;
