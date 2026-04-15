import { useState, useEffect } from "react";

/**
 * Module-level cache: teamKey -> blob URL (or empty string for failures).
 * Survives component unmounts so avatars are never re-fetched within a session.
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
  const cached = avatarCache.get(cacheKey);

  const [blobUrl, setBlobUrl] = useState(cached && cached !== "" ? cached : null);
  const [failed, setFailed] = useState(cached === "");

  useEffect(() => {
    if (avatarCache.has(cacheKey)) return;

    let cancelled = false;
    avatarCache.set(cacheKey, ""); // mark in-flight to prevent duplicate fetches

    fetch(src)
      .then((r) => {
        if (!r.ok) throw new Error("avatar not found");
        return r.blob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        avatarCache.set(cacheKey, url);
        if (!cancelled) setBlobUrl(url);
      })
      .catch(() => {
        avatarCache.set(cacheKey, "");
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [cacheKey, src]);

  if (failed || !blobUrl) return null;
  return <img src={blobUrl} alt="" />;
}

/** Clear the avatar cache (call when switching events). */
export function clearAvatarCache() {
  for (const url of avatarCache.values()) {
    if (url) URL.revokeObjectURL(url);
  }
  avatarCache.clear();
}
