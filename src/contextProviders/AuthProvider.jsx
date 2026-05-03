import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import localforage from "localforage";
// Update AuthProvider to use centralized apiBase module
import { apiBaseUrl } from "./apiBase";
import LoginModal from "../components/auth/LoginModal";
import PasskeyManagerModal from "../components/auth/PasskeyManagerModal";

const ROLES_CLAIM = "https://gatool.org/roles";
const REFRESH_KEY = "gatool.auth.refresh";
const LAST_EMAIL_KEY = "gatool.auth.lastEmail";
const REFRESH_LEAD_SECONDS = 60; // refresh this many seconds before expiry

const AuthContext = createContext(null);

// Build a deterministic SVG initials avatar — used as the fallback when the
// user has no Gravatar set (Gravatar 404s with d=404).
export function initialsAvatar(email) {
  if (!email) return "";
  const initial = email.trim().charAt(0).toUpperCase() || "?";
  // Stable hue from email
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = (hash * 31 + email.charCodeAt(i)) >>> 0;
  const hue = hash % 360;
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'>` +
    `<rect width='100%' height='100%' fill='hsl(${hue},60%,45%)' rx='8'/>` +
    `<text x='50%' y='54%' text-anchor='middle' dominant-baseline='middle' ` +
    `font-family='-apple-system,Segoe UI,Roboto,sans-serif' font-size='34' ` +
    `font-weight='600' fill='white'>${initial}</text>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// SHA-256 hex digest of the lowercased trimmed email — Gravatar's current
// canonical identifier (https://docs.gravatar.com/api/avatars/hash/).
async function gravatarHash(email) {
  const normalized = email.trim().toLowerCase();
  const bytes = new TextEncoder().encode(normalized);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function gravatarUrl(hashHex, size = 128) {
  // d=404 → Gravatar returns 404 when the email isn't registered, letting
  // the <img onError> handler swap in our local initials avatar.
  return `https://www.gravatar.com/avatar/${hashHex}?s=${size}&d=404`;
}

function buildUser(email, roles) {
  const safeRoles = Array.isArray(roles) ? roles : [];
  return {
    name: email,
    email,
    nickname: email,
    picture: initialsAvatar(email),
    [ROLES_CLAIM]: safeRoles,
  };
}

async function postJson(path, body) {
  const res = await fetch(`${apiBaseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  return res;
}

export function AuthProvider({ children }) {
  // Access token kept in memory only (not in localStorage). Refresh token in
  // localforage so it survives reload but not casual XSS reads of localStorage.
  const accessTokenRef = useRef(null);
  const expiresAtRef = useRef(0); // epoch ms
  const refreshPromiseRef = useRef(null);
  const refreshTimerRef = useRef(null);

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);
  const [passkeyOpen, setPasskeyOpen] = useState(false);
  const [lastEmail, setLastEmail] = useState("");

  const isAuthenticated = !!user;

  // Try to upgrade the avatar to Gravatar (HEAD probe with d=404) whenever
  // the user's email changes. If Gravatar 404s or the request fails, we
  // keep the locally-rendered initials avatar that buildUser already set.
  useEffect(() => {
    const email = user?.email;
    if (!email) return;
    let cancelled = false;
    (async () => {
      try {
        const hash = await gravatarHash(email);
        const url = gravatarUrl(hash);
        const res = await fetch(url, { method: "GET", mode: "cors" });
        if (cancelled || !res.ok) return;
        setUser((prev) => (prev && prev.email === email ? { ...prev, picture: url } : prev));
      } catch {
        // network blocked / offline — keep initials fallback
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.email]);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const scheduleRefresh = useCallback(
    (expiresInSeconds) => {
      clearRefreshTimer();
      const ms = Math.max(5_000, (expiresInSeconds - REFRESH_LEAD_SECONDS) * 1000);
      refreshTimerRef.current = setTimeout(() => {
        // fire-and-forget; getAccessToken handles failures
        // eslint-disable-next-line no-use-before-define
        refreshNow().catch(() => {});
      }, ms);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clearRefreshTimer]
  );

  const applyTokens = useCallback(
    async (tokenResp) => {
      accessTokenRef.current = tokenResp.accessToken;
      expiresAtRef.current = Date.now() + tokenResp.expiresIn * 1000;
      await localforage.setItem(REFRESH_KEY, tokenResp.refreshToken);
      await localforage.setItem(LAST_EMAIL_KEY, tokenResp.email);
      setLastEmail(tokenResp.email);
      setUser(buildUser(tokenResp.email, tokenResp.roles));
      scheduleRefresh(tokenResp.expiresIn);
    },
    [scheduleRefresh]
  );

  const clearTokens = useCallback(async () => {
    accessTokenRef.current = null;
    expiresAtRef.current = 0;
    clearRefreshTimer();
    await localforage.removeItem(REFRESH_KEY);
    setUser(null);
  }, [clearRefreshTimer]);

  const refreshNow = useCallback(async () => {
    if (refreshPromiseRef.current) return refreshPromiseRef.current;
    const refreshToken = await localforage.getItem(REFRESH_KEY);
    if (!refreshToken) return null;

    const p = (async () => {
      try {
        const res = await postJson("auth/refresh", { refreshToken });
        if (!res.ok) {
          await clearTokens();
          return null;
        }
        const data = await res.json();
        await applyTokens(data);
        return data.accessToken;
      } finally {
        refreshPromiseRef.current = null;
      }
    })();
    refreshPromiseRef.current = p;
    return p;
  }, [applyTokens, clearTokens]);

  const getAccessToken = useCallback(async () => {
    const now = Date.now();
    if (accessTokenRef.current && now < expiresAtRef.current - 5_000) {
      return accessTokenRef.current;
    }
    const t = await refreshNow();
    return t;
  }, [refreshNow]);

  // Bootstrap: try refresh on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const lastEmailStored = await localforage.getItem(LAST_EMAIL_KEY);
        if (lastEmailStored && !cancelled) setLastEmail(lastEmailStored);
        await refreshNow();
      } catch (e) {
        // ignore — user just stays anonymous
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      clearRefreshTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = await localforage.getItem(REFRESH_KEY);
    if (refreshToken) {
      // best-effort revoke
      try {
        await postJson("auth/logout", { refreshToken });
      } catch (e) {
        /* ignore */
      }
    }
    await clearTokens();
  }, [clearTokens]);

  const openLoginModal = useCallback(() => setLoginOpen(true), []);
  const openPasskeyModal = useCallback(() => setPasskeyOpen(true), []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      lastEmail,
      getAccessToken,
      refreshNow,
      logout,
      openLoginModal,
      openPasskeyModal,
      // Compatibility shims so existing callsites keep working.
      loginWithRedirect: openLoginModal,
      getAccessTokenSilently: async () => {
        const t = await getAccessToken();
        if (!t) throw new Error("Not authenticated");
        // Mimic Auth0 detailedResponse shape for the one Developer.jsx callsite
        return { id_token: t, access_token: t };
      },
    }),
    [
      user,
      isAuthenticated,
      isLoading,
      lastEmail,
      getAccessToken,
      refreshNow,
      logout,
      openLoginModal,
      openPasskeyModal,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <LoginModal
        show={loginOpen}
        onHide={() => setLoginOpen(false)}
        defaultEmail={lastEmail}
        onAuthenticated={applyTokens}
      />
      <PasskeyManagerModal
        show={passkeyOpen}
        onHide={() => setPasskeyOpen(false)}
        getAccessToken={getAccessToken}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

// Back-compat alias so the codebase can switch incrementally if desired.
export const useAuth0 = useAuth;
