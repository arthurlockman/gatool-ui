import { useEffect, useState } from "react";
import { marked } from "marked";
import { Alert, Spinner } from "react-bootstrap";
import { getHelpWikiManifestUrl } from "../utils/helpDocsUrl";
import styles from "./HelpLiveWiki.module.css";

/**
 * Fetches help-wiki-manifest.json (from public/) then each page's .md from GitHub raw (CORS allows this).
 */
export default function HelpLiveWiki() {
  const [state, setState] = useState({ status: "loading", message: "", pages: [] });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const manifestRes = await fetch(getHelpWikiManifestUrl(), { cache: "no-store" });
        if (!manifestRes.ok) {
          throw new Error(
            `Could not load help manifest (${manifestRes.status}). Run npm run sync-help-docs and commit public/help-wiki-manifest.json.`
          );
        }
        const manifest = await manifestRes.json();
        const rawBase = manifest.rawBaseUrl?.replace(/\/$/, "") || "";
        const pageList = Array.isArray(manifest.pages) ? manifest.pages : [];
        if (!rawBase || pageList.length === 0) {
          throw new Error("Invalid help-wiki-manifest.json");
        }

        marked.setOptions({ breaks: true, gfm: true });

        const loaded = await Promise.all(
          pageList.map(async (p) => {
            const file = encodeURIComponent(p.file);
            const url = `${rawBase}/${file}`;
            const r = await fetch(url, { cache: "no-store" });
            if (!r.ok) {
              throw new Error(`Failed to load ${p.file} (${r.status})`);
            }
            const md = await r.text();
            const html = marked.parse(md);
            return {
              title: p.title,
              anchor: p.anchor,
              wikiUrl: p.wikiUrl,
              html,
            };
          })
        );

        if (!cancelled) {
          setState({ status: "ready", message: "", pages: loaded });
        }
      } catch (e) {
        if (!cancelled) {
          setState({
            status: "error",
            message: e?.message || String(e),
            pages: [],
          });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") {
    return (
      <div className={styles.centered}>
        <Spinner animation="border" role="status" className="me-2" />
        Loading help from wiki…
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <Alert variant="warning" className="mb-0">
        <strong>Live wiki help failed.</strong> {state.message}
        <div className="small mt-2">
          Use the bundled help instead: remove <code>REACT_APP_HELP_LIVE_WIKI</code> from your env, or run{" "}
          <code>npm run sync-help-docs</code> and commit <code>public/help-docs.html</code>.
        </div>
      </Alert>
    );
  }

  return (
    <div className={styles.layout}>
      <nav className={styles.nav}>
        <h1 className={styles.navTitle}>gatool Help</h1>
        {state.pages.map((p) => (
          <a key={p.anchor} href={`#${p.anchor}`} className={styles.navLink}>
            {p.title}
          </a>
        ))}
      </nav>
      <main className={styles.main}>
        {state.pages.map((p) => (
          <section key={p.anchor} id={p.anchor} className={styles.section}>
            <h2>{p.title}</h2>
            <div className={styles.content} dangerouslySetInnerHTML={{ __html: p.html }} />
            <div className={styles.source}>
              Source:{" "}
              <a href={p.wikiUrl} target="_blank" rel="noopener noreferrer">
                {p.wikiUrl}
              </a>
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
