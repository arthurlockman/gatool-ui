import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import EventNotificationBanner from "./EventNotificationBanner";
import moment from "moment";

// Build a notification that is currently visible (within its on/off window)
function makeNotification(overrides = {}) {
  return {
    message: overrides.message ?? "Test notification",
    onTime: moment().subtract(1, "hour"),
    expiry: moment().add(1, "hour"),
    variant: "info",
    link: null,
    ...overrides,
  };
}

describe("EventNotificationBanner – eventBell cap", () => {
  it("renders nothing when notifications array is empty", () => {
    const { container } = render(
      <EventNotificationBanner notifications={[]} eventBell={[]} setEventBell={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders a visible notification", () => {
    const n = makeNotification({ message: "Hello event" });
    render(
      <EventNotificationBanner
        notifications={[n]}
        eventBell={[]}
        setEventBell={vi.fn()}
      />
    );
    expect(screen.getByText("Hello event")).toBeInTheDocument();
  });

  it("hides a notification whose key is already in eventBell", () => {
    const n = makeNotification({ message: "Already dismissed" });
    render(
      <EventNotificationBanner
        notifications={[n]}
        eventBell={[JSON.stringify(n)]}
        setEventBell={vi.fn()}
      />
    );
    expect(screen.queryByText("Already dismissed")).not.toBeInTheDocument();
  });

  it("calls setEventBell with the notification added when dismissed", () => {
    const setEventBell = vi.fn();
    const n = makeNotification({ message: "Dismiss me" });
    render(
      <EventNotificationBanner
        notifications={[n]}
        eventBell={[]}
        setEventBell={setEventBell}
      />
    );

    const closeBtn = document.querySelector(".btn-close");
    fireEvent.click(closeBtn);

    expect(setEventBell).toHaveBeenCalledTimes(1);
    const [nextBell] = setEventBell.mock.calls[0];
    expect(nextBell).toContain(JSON.stringify(n));
  });

  it("does not add a duplicate entry to eventBell", () => {
    const setEventBell = vi.fn();
    const n = makeNotification({ message: "Already in bell" });
    const existing = [JSON.stringify(n)];

    // Even though the notification is hidden (already in bell), test the guard
    // by calling with eventBell pre-populated and a second notification visible
    const n2 = makeNotification({ message: "Second" });
    render(
      <EventNotificationBanner
        notifications={[n2]}
        eventBell={existing}
        setEventBell={setEventBell}
      />
    );

    const closeBtn = document.querySelector(".btn-close");
    fireEvent.click(closeBtn);

    const [nextBell] = setEventBell.mock.calls[0];
    const serialized = JSON.stringify(n2);
    const occurrences = nextBell.filter((e) => e === serialized).length;
    expect(occurrences).toBe(1);
  });

  it("caps eventBell at 200 entries when dismissing", () => {
    const setEventBell = vi.fn();

    // Pre-fill eventBell with 200 entries
    const existingBell = Array.from({ length: 200 }, (_, i) =>
      JSON.stringify({ message: `old-${i}` })
    );

    const n = makeNotification({ message: "New notification" });
    render(
      <EventNotificationBanner
        notifications={[n]}
        eventBell={existingBell}
        setEventBell={setEventBell}
      />
    );

    const closeBtn = document.querySelector(".btn-close");
    fireEvent.click(closeBtn);

    expect(setEventBell).toHaveBeenCalledTimes(1);
    const [nextBell] = setEventBell.mock.calls[0];
    // After adding one more to a full 200-entry list it should be trimmed back to 200
    expect(nextBell.length).toBeLessThanOrEqual(200);
    // The new notification must be present
    expect(nextBell).toContain(JSON.stringify(n));
  });

  it("keeps eventBell under 200 when many notifications are dismissed in sequence", () => {
    // Simulate repeated dismissals by rendering with a growing bell array
    let currentBell = [];

    for (let i = 0; i < 250; i++) {
      const setEventBell = vi.fn((next) => { currentBell = next; });
      const n = makeNotification({ message: `notification-${i}` });

      const { unmount } = render(
        <EventNotificationBanner
          notifications={[n]}
          eventBell={currentBell}
          setEventBell={setEventBell}
        />
      );

      const closeBtn = document.querySelector(".btn-close");
      if (closeBtn) fireEvent.click(closeBtn);
      unmount();
    }

    expect(currentBell.length).toBeLessThanOrEqual(200);
  });
});
