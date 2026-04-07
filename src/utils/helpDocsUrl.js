/**
 * Absolute path under the app root for a file in `public/` (respects `homepage` / PUBLIC_URL).
 */
export function getPublicUrl(path) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const base = (process.env.PUBLIC_URL || "").replace(/\/$/, "");
  return `${base}${normalized}`;
}

/**
 * URL to the static help snapshot in `public/` (still copied to `build/` for direct access).
 * The in-app Help UI uses the bundled copy in `src/generated/helpDocsHtml.js` so it works even when
 * the host maps all paths to `index.html` (common on production vs beta).
 */
export function getHelpDocsUrl() {
  return getPublicUrl("/help-docs.html");
}

/** Manifest listing wiki pages + raw GitHub URLs (written by sync-help-docs). */
export function getHelpWikiManifestUrl() {
  return getPublicUrl("/help-wiki-manifest.json");
}

/** When true, Help loads markdown from GitHub raw wiki URLs using the manifest (needs network). */
export function useHelpLiveWiki() {
  return process.env.REACT_APP_HELP_LIVE_WIKI === "true";
}
