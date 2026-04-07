import _ from "lodash";

/**
 * Flattened opponent meeting: one Red vs Blue pair met at this event/stage.
 * @typedef {{ event_key: string, event_name?: string, year?: number, stage?: string, result?: string|null, teamRed: number, teamBlue: number, teamRedName?: string, teamBlueName?: string }} OpponentMeeting
 */

/**
 * Renders "When these alliances met" from connections API opponents_at (Red vs Blue pairs).
 * Shows event, year, stage; for Finals, shows winner when result is present.
 */
function MatchOpponentsSummary({
  opponentsList,
  loading,
  error,
}) {
  if (loading) {
    return (
      <div className="match-opponents-summary match-opponents-summary--status">
        <span className="text-muted">Loading opponent history…</span>
      </div>
    );
  }
  if (error) {
    const message =
      error?.message && typeof error.message === "string"
        ? error.message
        : "Opponent history unavailable";
    return (
      <div className="match-opponents-summary match-opponents-summary--status">
        <span className="text-muted">{message}</span>
      </div>
    );
  }
  if (!opponentsList?.length) {
    return (
      <div className="match-opponents-summary match-opponents-summary--status">
        <span className="text-muted">No prior meetings between these alliances</span>
      </div>
    );
  }

  const byEvent = _.groupBy(
    opponentsList,
    (m) => `${m.event_key || ""}|${m.year ?? ""}|${m.stage || ""}`
  );
  const lines = [];
  Object.entries(byEvent).forEach(([groupKey, meetings]) => {
    const first = meetings[0];
    const eventName = first.event_name || first.event_key || "";
    const year = first.year != null ? String(first.year) : "";
    const stage = first.stage || "";
    const result = first.result != null && String(first.result).trim() !== ""
      ? String(first.result).trim()
      : null;
    const isFinals = /finals?/i.test(stage);
    const bits = [year, eventName, stage].filter(Boolean);
    lines.push(
      <div key={groupKey} className="match-opponents-summary-line">
        <span className="match-opponents-summary-line-main">
          {bits.join(" · ")}
        </span>
        {isFinals && result && (
          <span className="match-opponents-summary-line-result">
            {" — "}
            <strong>Winner: {result}</strong>
          </span>
        )}
      </div>
    );
  });

  return (
    <div className="match-opponents-summary">
      <div className="match-opponents-summary-title">
        <b>When these alliances met</b>
      </div>
      {lines}
    </div>
  );
}

export default MatchOpponentsSummary;
