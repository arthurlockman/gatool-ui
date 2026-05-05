import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import React from "react";
import { OnlineStatusProvider, useOnlineStatus } from "./OnlineContext";

// Helper component that reads the context value
function OnlineConsumer({ onRender }) {
  const status = useOnlineStatus();
  onRender(status);
  return null;
}

describe("OnlineStatusProvider – listener cleanup", () => {
  let addSpy;
  let removeSpy;

  beforeEach(() => {
    addSpy = vi.spyOn(window, "addEventListener");
    removeSpy = vi.spyOn(window, "removeEventListener");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("registers exactly one offline and one online listener on mount", () => {
    const { unmount } = render(
      <OnlineStatusProvider>
        <div />
      </OnlineStatusProvider>
    );

    const offlineCalls = addSpy.mock.calls.filter(([e]) => e === "offline");
    const onlineCalls  = addSpy.mock.calls.filter(([e]) => e === "online");
    expect(offlineCalls).toHaveLength(1);
    expect(onlineCalls).toHaveLength(1);

    unmount();
  });

  it("removes the same function reference that was added (not a new arrow fn)", () => {
    const { unmount } = render(
      <OnlineStatusProvider>
        <div />
      </OnlineStatusProvider>
    );

    const addedOffline = addSpy.mock.calls.find(([e]) => e === "offline")?.[1];
    const addedOnline  = addSpy.mock.calls.find(([e]) => e === "online")?.[1];

    unmount();

    const removedOffline = removeSpy.mock.calls.find(([e]) => e === "offline")?.[1];
    const removedOnline  = removeSpy.mock.calls.find(([e]) => e === "online")?.[1];

    // This is the core regression check: the same reference must be passed to both calls
    expect(removedOffline).toBe(addedOffline);
    expect(removedOnline).toBe(addedOnline);
  });

  it("does not accumulate extra listeners across multiple mounts", () => {
    // Simulate React Strict Mode / multiple mount cycles
    const mount = () =>
      render(
        <OnlineStatusProvider>
          <div />
        </OnlineStatusProvider>
      );

    const { unmount: u1 } = mount();
    u1();
    const { unmount: u2 } = mount();
    u2();

    const offlineAdds   = addSpy.mock.calls.filter(([e]) => e === "offline").length;
    const offlineRemoves = removeSpy.mock.calls.filter(([e]) => e === "offline").length;
    expect(offlineAdds).toBe(offlineRemoves);
  });

  it("reflects the current navigator.onLine value on initial render", () => {
    const rendered = [];
    render(
      <OnlineStatusProvider>
        <OnlineConsumer onRender={(v) => rendered.push(v)} />
      </OnlineStatusProvider>
    );
    expect(rendered[0]).toBe(navigator.onLine);
  });

  it("updates to false when the offline event fires", async () => {
    const rendered = [];
    render(
      <OnlineStatusProvider>
        <OnlineConsumer onRender={(v) => rendered.push(v)} />
      </OnlineStatusProvider>
    );

    await act(async () => {
      window.dispatchEvent(new Event("offline"));
    });

    expect(rendered.at(-1)).toBe(false);
  });

  it("updates to true when the online event fires", async () => {
    const rendered = [];
    render(
      <OnlineStatusProvider>
        <OnlineConsumer onRender={(v) => rendered.push(v)} />
      </OnlineStatusProvider>
    );

    // Go offline first, then back online
    await act(async () => { window.dispatchEvent(new Event("offline")); });
    await act(async () => { window.dispatchEvent(new Event("online")); });

    expect(rendered.at(-1)).toBe(true);
  });
});
