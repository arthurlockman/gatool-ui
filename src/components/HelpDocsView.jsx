import HelpLiveWiki from "./HelpLiveWiki";
import { useHelpLiveWiki } from "../utils/helpDocsUrl";
import bundledHelpHtml from "../generated/helpDocsHtml";

/**
 * Bundled static HTML (default) or live wiki fetch when REACT_APP_HELP_LIVE_WIKI=true.
 * Help HTML is embedded in the bundle (not loaded via iframe src URL) so it still works
 * when production serves only the SPA shell for unknown paths (e.g. /help-docs.html → index.html).
 */
export default function HelpDocsView({ embedded }) {
  const live = useHelpLiveWiki();
  const height = embedded ? "100%" : "90vh";

  if (live) {
    return (
      <div style={{ height, minHeight: 320, overflow: "auto" }}>
        <HelpLiveWiki />
      </div>
    );
  }

  return (
    <iframe
      width="100%"
      height={height}
      style={{ border: 0, minHeight: embedded ? 320 : undefined, display: "block" }}
      srcDoc={bundledHelpHtml}
      title="Help"
    />
  );
}
