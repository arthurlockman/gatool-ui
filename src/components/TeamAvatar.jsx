import { useState, useEffect } from "react";

/**
 * Module-level cache: cacheKey -> Promise<string> | string.
 * Values are either a pending Promise (fetch in-flight), a blob URL string
 * (success), or "" (permanent failure). Using Promises lets remounted
 * components subscribe to an in-flight fetch instead of treating it as failed.
 */
const avatarCache = new Map();

/**
 * Renders an FRC team avatar image, fetching it at most once per session.
 * On the first mount the image is fetched, converted to a blob URL, and
 * stored in a module-level Map. Subsequent mounts serve from memory with
 * zero network requests.
 */
export default function TeamAvatar({ src, teamNumber }) {
  const cacheKey = `${teamNumber}@${src}`;

  // Serve immediately from cache on mount (first render only)
  const cached = avatarCache.get(cacheKey);
  const resolvedUrl = typeof cached === "string" && cached !== "" ? cached : null;

  const [blobUrl, setBlobUrl] = useState(resolvedUrl);
  const [failed, setFailed] = useState(typeof cached === "string" && cached === "");

  useEffect(() => {
    // Read cache inside the effect so changes don't cause re-runs
    const entry = avatarCache.get(cacheKey);

    // Already have a resolved result
    if (typeof entry === "string") {
      if (entry !== "") setBlobUrl(entry);
      else setFailed(true);
      return;
    }

    let cancelled = false;

    // Reuse an in-flight promise or start a new fetch
    const promise =
      entry ||
      fetch(src)
        .then((r) => {
          if (!r.ok) throw new Error("avatar not found");
          return r.blob();
        })
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          avatarCache.set(cacheKey, url);
          return url;
        })
        .catch(() => {
          avatarCache.set(cacheKey, "");
          return "";
        });

    // Store the promise so concurrent/future mounts share one fetch
    if (!entry) avatarCache.set(cacheKey, promise);

    promise.then((result) => {
      if (cancelled) return;
      if (result && result !== "") setBlobUrl(result);
      else setFailed(true);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, src]);

  if (failed || !blobUrl) return null;
  return <img src={blobUrl} alt="" />;
}

/** Clear the avatar cache (call when switching events). */
export function clearAvatarCache() {
  for (const val of avatarCache.values()) {
    if (typeof val === "string" && val) URL.revokeObjectURL(val);
  }
  avatarCache.clear();
}
