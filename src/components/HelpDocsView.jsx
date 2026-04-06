import HelpLiveWiki from "./HelpLiveWiki";
import { getHelpDocsUrl, useHelpLiveWiki } from "../utils/helpDocsUrl";

/**
 * Bundled static HTML (default) or live wiki fetch when REACT_APP_HELP_LIVE_WIKI=true.
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
      src={getHelpDocsUrl()}
      title="Help"
    />
  );
}
