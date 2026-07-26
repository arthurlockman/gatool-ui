// Tests for usePersistentState's behaviour when local storage is unavailable.
//
// Browsers can drop the IndexedDB connection mid-session — Safari does this
// under memory pressure and every subsequent read/write rejects with
// "Connection to Indexed Database server lost". These tests pin the three
// things that must hold when that happens: no unhandled promise rejections,
// the app keeps working from memory, and saveNow() reports the failure
// truthfully so callers don't tell users their data was saved.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor, render, screen } from "@testing-library/react";
import localforage from "localforage";

vi.mock("react-toastify", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));
import { toast } from "react-toastify";

import {
  usePersistentState,
  resetStorageFailureNotice,
} from "./UsePersistentState";

const IDB_LOST = () =>
  new Error("Connection to Indexed Database server lost. Refresh the page to try again");

let unhandled;
let warnSpy;

beforeEach(() => {
  resetStorageFailureNotice();
  vi.restoreAllMocks();
  toast.error.mockClear();
  warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  unhandled = [];
  // Node surfaces unhandled rejections on `process`, not on jsdom's `window`.
  const onUnhandled = (reason) => unhandled.push(reason);
  process.on("unhandledRejection", onUnhandled);
  globalThis.__onUnhandled = onUnhandled;
});

afterEach(() => {
  process.off("unhandledRejection", globalThis.__onUnhandled);
});

/** Give any floating promise chains a chance to settle and reject. */
async function flushRejections() {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));
  });
}

/** The hook reports every storage failure through console.warn. */
function warnedAbout(key) {
  return warnSpy.mock.calls.some(([msg]) =>
    typeof msg === "string" && msg.includes(key)
  );
}

describe("usePersistentState when storage writes fail", () => {
  it("does not emit an unhandled rejection and keeps the value in memory", async () => {
    vi.spyOn(localforage, "getItem").mockResolvedValue(null);
    vi.spyOn(localforage, "setItem").mockRejectedValue(IDB_LOST());

    const { result } = renderHook(() => usePersistentState("cache:test", []));

    await act(async () => {
      result.current[1]([{ teamNumber: 1234 }]);
    });
    await flushRejections();

    // The rejection must be caught and reported, not left floating.
    expect(warnedAbout("cache:test")).toBe(true);
    expect(unhandled).toEqual([]);
    // The app keeps running off in-memory state even though the write failed.
    expect(result.current[0]).toEqual([{ teamNumber: 1234 }]);
  });

  it("saveNow resolves false so callers can tell the user the truth", async () => {
    vi.spyOn(localforage, "getItem").mockResolvedValue(null);
    vi.spyOn(localforage, "setItem").mockRejectedValue(IDB_LOST());

    const { result } = renderHook(() => usePersistentState("cache:test", []));
    await waitFor(() => expect(result.current[2]).toBeTypeOf("function"));

    let persisted;
    await act(async () => {
      persisted = await result.current[2]([{ teamNumber: 1234 }]);
    });

    expect(persisted).toBe(false);
    expect(unhandled).toEqual([]);
  });

  it("saveNow resolves true when the write lands", async () => {
    vi.spyOn(localforage, "getItem").mockResolvedValue(null);
    const setItem = vi.spyOn(localforage, "setItem").mockResolvedValue(undefined);

    const { result } = renderHook(() => usePersistentState("cache:test", []));
    await waitFor(() => expect(result.current[2]).toBeTypeOf("function"));

    let persisted;
    await act(async () => {
      persisted = await result.current[2]([{ teamNumber: 1234 }]);
    });

    expect(persisted).toBe(true);
    expect(setItem).toHaveBeenCalledWith(
      "cache:test",
      JSON.stringify([{ teamNumber: 1234 }])
    );
  });

  it("does not re-write the same payload after saveNow already persisted it", async () => {
    vi.spyOn(localforage, "getItem").mockResolvedValue(null);
    const setItem = vi.spyOn(localforage, "setItem").mockResolvedValue(undefined);

    const { result } = renderHook(() => usePersistentState("cache:test", []));
    await waitFor(() => expect(result.current[2]).toBeTypeOf("function"));

    await act(async () => {
      await result.current[2]([{ teamNumber: 1234 }]);
    });
    await flushRejections();

    const writes = setItem.mock.calls.filter(
      ([, v]) => v === JSON.stringify([{ teamNumber: 1234 }])
    );
    expect(writes).toHaveLength(1);
  });
});

describe("usePersistentState when storage reads fail", () => {
  it("falls back to the default value without an unhandled rejection", async () => {
    vi.spyOn(localforage, "getItem").mockRejectedValue(IDB_LOST());
    vi.spyOn(localforage, "setItem").mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      usePersistentState("cache:test", ["fallback"])
    );
    await flushRejections();

    expect(warnedAbout("cache:test")).toBe(true);
    expect(unhandled).toEqual([]);
    expect(result.current[0]).toEqual(["fallback"]);
  });
});

describe("storage failure notice", () => {
  it("offers a reload the user controls, and does not auto-close", async () => {
    vi.spyOn(localforage, "getItem").mockResolvedValue(null);
    vi.spyOn(localforage, "setItem").mockRejectedValue(IDB_LOST());

    const { result } = renderHook(() => usePersistentState("cache:test", []));
    await act(async () => {
      result.current[1]([1]);
    });
    await flushRejections();

    expect(toast.error).toHaveBeenCalledTimes(1);
    const [content, options] = toast.error.mock.calls[0];
    // Sticky: an announcer must be able to act on this between matches, not
    // have it disappear on a timer or an accidental click.
    expect(options).toMatchObject({ autoClose: false, closeOnClick: false });

    // The reload must be user-initiated — never automatic. A dropped Safari
    // connection recurs after reload, so auto-reloading would loop, and it
    // would discard in-memory edits that are still recoverable via Settings.
    const closeToast = vi.fn();
    render(<>{content({ closeToast })}</>);
    expect(screen.getByRole("button", { name: /reload now/i })).toBeTruthy();
    screen.getByRole("button", { name: /not now/i }).click();
    expect(closeToast).toHaveBeenCalled();
  });

  it("notifies once per page load no matter how many writes fail", async () => {
    vi.spyOn(localforage, "getItem").mockResolvedValue(null);
    vi.spyOn(localforage, "setItem").mockRejectedValue(IDB_LOST());

    const { result } = renderHook(() => usePersistentState("cache:test", []));
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        result.current[1]([i]);
      });
      await flushRejections();
    }

    // ~85 call sites share this hook; a dead connection fails every write.
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls.length).toBeGreaterThan(1);
  });
});
