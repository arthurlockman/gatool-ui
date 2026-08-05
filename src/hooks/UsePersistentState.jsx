import localforage from "localforage";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

// Browsers can drop the IndexedDB connection mid-session — Safari does this
// under memory pressure and every subsequent read/write then rejects with
// "Connection to Indexed Database server lost". Previously nothing handled
// those rejections, so a single dropped connection produced hundreds of
// unhandled promise rejections over a long announcer session, and callers
// went on telling users their changes were saved when they were not.
//
// We can't recover in-page. localforage does have a _tryReconnect path, but
// createTransaction only reaches it when db.transaction() throws
// synchronously (InvalidStateError / NotFoundError). Safari's dropped
// connection instead aborts the transaction asynchronously, which localforage
// surfaces straight to the caller via transaction.onabort with no reconnect
// attempt. There is no public API to force one either: setDriver() is a no-op
// when the driver is already selected, and createInstance() reuses the same
// cached connection for a given database name.
//
// So: keep the app running from in-memory state, surface the problem once,
// and let the user reload when it's safe for them to do so (this is a live
// announcing tool — an automatic reload mid-match would be far worse, and
// would also discard the in-memory edits that can still be pushed to the
// cloud from Settings).
let storageFailureReported = false;

function reportStorageFailure(key, error) {
  console.warn(`Could not persist "${key}" to local storage.`, error);
  // One notice per page load — a dead connection fails every subsequent
  // write, and this hook has ~85 call sites.
  if (storageFailureReported) return;
  storageFailureReported = true;
  toast.error(
    ({ closeToast }) => (
      <div>
        <div>
          Your browser stopped saving data on this device, so changes will be
          lost if you reload. If you have unsent team updates, send them to
          gatool Cloud from Settings first.
        </div>
        <div className="mt-2 d-flex gap-2">
          <button
            type="button"
            className="btn btn-sm btn-light"
            onClick={() => window.location.reload()}
          >
            Reload now
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-light"
            onClick={closeToast}
          >
            Not now
          </button>
        </div>
      </div>
    ),
    { autoClose: false, closeOnClick: false, draggable: false }
  );
}

/** Test seam: clears the once-per-page-load notice guard. */
export function resetStorageFailureNotice() {
  storageFailureReported = false;
}

export const usePersistentState = (key, defaultValue) => {
  const [value, setValue] = useState(defaultValue);
  const [hydrated, setHydrated] = useState(false);
  // Serialized form of whatever was last written to (or read from) storage,
  // so an explicit saveNow() and the write effect don't both write the same
  // payload, and so hydration doesn't immediately echo the value back.
  const lastPersistedRef = useRef(undefined);

  useEffect(() => {
    setHydrated(false);
    lastPersistedRef.current = undefined;
    let cancelled = false;
    async function load() {
      try {
        const saved = await localforage.getItem(key);
        if (cancelled) return;
        if (saved !== null) {
          lastPersistedRef.current = saved;
          try {
            const initial = JSON.parse(saved);
            // Check for null/undefined explicitly to preserve false, 0, empty string, etc.
            setValue(
              initial !== null && initial !== undefined ? initial : defaultValue
            );
          } catch (e) {
            // If parsing fails, use default value
            setValue(defaultValue);
          }
        }
      } catch (e) {
        // Storage is unreadable (dropped connection, private mode, quota).
        // Fall back to the default and keep the app usable from memory.
        if (!cancelled) reportStorageFailure(key, e);
      } finally {
        if (!cancelled) {
          setHydrated(true);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    const serialized = JSON.stringify(value);
    if (lastPersistedRef.current === serialized) return;
    localforage
      .setItem(key, serialized)
      .then(() => {
        lastPersistedRef.current = serialized;
      })
      .catch((e) => reportStorageFailure(key, e));
  }, [key, value, hydrated]);

  // Like setValue, but resolves to whether the value actually reached storage.
  // Use this instead of setValue whenever the UI is about to tell the user
  // their change was saved. Takes a concrete value, not an updater function.
  const saveNow = useCallback(
    async (next) => {
      setValue(next);
      const serialized = JSON.stringify(next);
      try {
        await localforage.setItem(key, serialized);
        lastPersistedRef.current = serialized;
        return true;
      } catch (e) {
        reportStorageFailure(key, e);
        return false;
      }
    },
    [key]
  );

  return [value, setValue, saveNow];
};
