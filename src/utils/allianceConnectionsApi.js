const MATCHUPS_API_BASE =
  process.env.REACT_APP_API_BASE || "https://api.gatool.org/v3/";

/**
 * Prior alliance partner history from gatool matchups API.
 * @see https://api.gatool.org/v3/{year}/matchups/{eventCode}/{teamNumbers}
 */
export function getConnectionsEventKey(selectedEvent, selectedYear) {
  if (!selectedEvent?.value || !selectedYear?.value) return null;
  const tba = selectedEvent.value.tbaEventKey;
  if (tba) return String(tba).toLowerCase();
  const code = selectedEvent.value.code;
  if (
    !code ||
    String(code).includes("OFFLINE") ||
    String(code).includes("PRACTICE")
  ) {
    return null;
  }
  return `${selectedYear.value}${String(code).toLowerCase()}`;
}

/**
 * Extracts numeric team IDs from an alliance (handles FIRST, TBA, Cheesy Arena formats).
 * @returns {string|null} comma-sorted team ids, or null if fewer than 2 teams
 */
export function allianceRosterToConnectionKey(alliance) {
  if (!alliance) return null;
  let nums = [];
  if (Array.isArray(alliance.picks)) {
    nums = alliance.picks
      .map((p) => {
        if (typeof p === "number") return p;
        if (typeof p === "string") {
          const m = p.replace(/^frc/i, "");
          const n = Number(m);
          return Number.isNaN(n) ? null : n;
        }
        return null;
      })
      .filter((n) => n != null && n > 0);
  }
  if (Array.isArray(alliance.team_keys)) {
    nums = alliance.team_keys
      .map((k) => {
        const m = String(k).replace(/^frc/i, "");
        const n = Number(m);
        return Number.isNaN(n) ? null : n;
      })
      .filter((n) => n != null && n > 0);
  }
  if (nums.length < 2) {
    const raw = [
      alliance.captain,
      alliance.round1,
      alliance.round2,
      alliance.round3,
      alliance.pick1,
      alliance.pick2,
      alliance.pick3,
      alliance.backup,
      ...(Array.isArray(alliance.TeamIds) ? alliance.TeamIds : []),
    ];
    nums = raw
      .map((n) => {
        if (n == null || n === "") return NaN;
        if (typeof n === "number") return Number.isNaN(n) ? NaN : n;
        const s = String(n).replace(/^frc/i, "");
        const num = Number(s);
        return Number.isNaN(num) ? NaN : num;
      })
      .filter((n) => !Number.isNaN(n) && n > 0);
  }
  const uniq = [...new Set(nums)].sort((a, b) => a - b);
  if (uniq.length < 2) return null;
  return uniq.join(",");
}

/**
 * Error from the connections API with status and optional detail message from the server.
 */
export class ConnectionsApiError extends Error {
  constructor(message, status = null, detail = null) {
    super(message);
    this.name = "ConnectionsApiError";
    this.status = status;
    this.detail = detail;
  }
}

/** Retries after first failure (4 attempts total). */
const MATCHUPS_NETWORK_RETRIES = 3;
const MATCHUPS_RETRY_DELAYS_MS = [400, 800, 1600];

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const id = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(id);
      signal?.removeEventListener("abort", onAbort);
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

function isFetchNetworkFailure(e) {
  return (
    e instanceof TypeError &&
    (e.message === "Failed to fetch" || e.message === "Load failed")
  );
}

/** Fetch with retries on network errors and transient 502/503/504. */
async function fetchMatchupsWithRetries(url, signal) {
  let res;
  for (let attempt = 0; attempt <= MATCHUPS_NETWORK_RETRIES; attempt++) {
    try {
      res = await fetch(url, { signal });
    } catch (e) {
      if (e?.name === "AbortError") throw e;
      if (!isFetchNetworkFailure(e) || attempt === MATCHUPS_NETWORK_RETRIES) {
        if (isFetchNetworkFailure(e)) {
          throw new ConnectionsApiError(
            "Network error — request could not reach the server. If the API works when you open it in the browser, CORS may be blocking requests from this app.",
            null,
            null
          );
        }
        throw e;
      }
      console.log(
        `[Connections API] network error, retry ${attempt + 1}/${MATCHUPS_NETWORK_RETRIES}…`
      );
      await sleep(
        MATCHUPS_RETRY_DELAYS_MS[attempt] ??
          MATCHUPS_RETRY_DELAYS_MS[MATCHUPS_RETRY_DELAYS_MS.length - 1],
        signal
      );
      continue;
    }

    if (res.ok) return res;

    const transient = [502, 503, 504].includes(res.status);
    if (!transient || attempt === MATCHUPS_NETWORK_RETRIES) return res;

    console.log(
      `[Connections API] HTTP ${res.status}, retry ${attempt + 1}/${MATCHUPS_NETWORK_RETRIES}…`
    );
    await sleep(
      MATCHUPS_RETRY_DELAYS_MS[attempt] ??
        MATCHUPS_RETRY_DELAYS_MS[MATCHUPS_RETRY_DELAYS_MS.length - 1],
      signal
    );
  }
  return res;
}

function getErrorMessage(status, body) {
  if (body && typeof body === "object" && body.detail != null) {
    return typeof body.detail === "string" ? body.detail : String(body.detail);
  }
  if (typeof body === "string" && body.trim()) return body.trim();
  switch (status) {
    case 429:
      return "Too many requests — please slow down and try again in a moment.";
    case 500:
      return "An unexpected error occurred while fetching data. Please try again.";
    case 502:
    case 503:
    case 504:
      return "A required service is temporarily unavailable. Please try again later.";
    case 404:
      return "Resource not found.";
    default:
      return `Connections API error (${status}). Please try again.`;
  }
}

export async function fetchAllianceConnections(eventKey, teamNumbers, signal) {
  const nums = [...new Set(teamNumbers)]
    .map((n) => Number(n))
    .filter((n) => !Number.isNaN(n) && n > 0)
    .sort((a, b) => a - b);
  if (nums.length < 2) return [];

  const year = eventKey ? String(eventKey).substring(0, 4) : "";
  const eventCode = eventKey ? String(eventKey).substring(4) : "";
  if (!year || !eventCode) return [];

  const base = MATCHUPS_API_BASE.replace(/\/$/, "");
  const teamNumbersStr = nums.join(",");
  const url = `${base}/${year}/matchups/${encodeURIComponent(eventCode)}/${teamNumbersStr}`;

  const res = await fetchMatchupsWithRetries(url, signal);

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (!res.ok) {
    let body = null;
    try {
      body = isJson ? await res.json() : await res.text();
    } catch {
      body = null;
    }
    console.log("[Connections API] error response:", { url, status: res.status, body });
    const detail = body && typeof body === "object" ? body.detail : body;
    const message = getErrorMessage(res.status, body);
    const err = new ConnectionsApiError(message, res.status, detail);
    throw err;
  }

  let data;
  try {
    data = isJson ? await res.json() : null;
  } catch {
    return [];
  }

  console.log("[Connections API] response:", { url, status: res.status, data });

  let items = [];
  if (Array.isArray(data)) items = data;
  else if (data && Array.isArray(data.details)) items = data.details;
  if (items.length === 0) return [];

  return items.map((item) => normalizeMatchupItem(item));
}

/**
 * Normalizes API response (camelCase) to the format expected by AnnounceAllianceMatchupSummary (snake_case).
 */
function normalizeMatchupItem(item) {
  const partneredAt = (item.partneredAt ?? item.partnered_at ?? []).map(
    (p) => ({
      event_key: p.eventKey ?? p.event_key,
      event_name: p.eventName ?? p.event_name,
      year: p.year,
      stage: p.stage,
      result: p.result,
    })
  );
  return {
    team_a: item.teamA ?? item.team_a,
    team_b: item.teamB ?? item.team_b,
    team_a_name: item.teamAName ?? item.team_a_name,
    team_b_name: item.teamBName ?? item.team_b_name,
    partnered_at: partneredAt,
  };
}
