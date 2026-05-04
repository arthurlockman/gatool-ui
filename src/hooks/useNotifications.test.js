import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { SnackbarProvider } from "notistack";
import { useNotifications } from "./useNotifications";
import { renderHookWithProviders } from "../test/renderHook";
import { createTestHttpClient } from "../test/httpClient";
import { server } from "../test/server";
import { loadFixture } from "../test/fixtures";
import { EventSelectionProvider } from "../contexts/EventSelectionContext";

const BASE = "https://api.gatool.org/v3";

function Wrapper({ children }) {
  return (
    <SnackbarProvider>
      <EventSelectionProvider>{children}</EventSelectionProvider>
    </SnackbarProvider>
  );
}

function renderNotifications(deps = {}) {
  const httpClient = createTestHttpClient();
  const utils = renderHookWithProviders(
    () =>
      useNotifications({
        httpClient,
        selectedEvent: null,
        useFTCOffline: false,
        manualOfflineMode: false,
        ...deps,
      }),
    { wrapper: Wrapper }
  );
  return { ...utils, httpClient };
}

const MAWOR_EVENT = { value: { code: "MAWOR" }, label: "MAWOR" };

describe("useNotifications", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("exposes initial state and API surface", () => {
    const { result } = renderNotifications();
    expect(result.current.systemMessage).toBeNull();
    expect(result.current.systemBell).toBe("");
    expect(result.current.eventMessage).toEqual([]);
    expect(result.current.eventBell).toEqual([]);
    expect(result.current.showReloaded).toBe(false);
    expect(typeof result.current.getNotifications).toBe("function");
    expect(typeof result.current.getEventNotifications).toBe("function");
    expect(typeof result.current.getSystemMessages).toBe("function");
    expect(typeof result.current.getEventMessages).toBe("function");
  });

  it("getNotifications returns the announcements fixture (happy path)", async () => {
    const { result } = renderNotifications();
    const fixture = loadFixture("announcements");
    let notifications;
    await act(async () => {
      notifications = await result.current.getNotifications();
    });
    expect(notifications).toEqual(fixture);
  });

  it("getNotifications returns an empty default on 204 No Content", async () => {
    server.use(
      http.get(`${BASE}/announcements`, () => new HttpResponse(null, { status: 204 }))
    );
    const { result } = renderNotifications();
    let notifications;
    await act(async () => {
      notifications = await result.current.getNotifications();
    });
    expect(notifications).toEqual({
      message: "",
      onTime: "",
      offTime: "",
      onDate: "",
      offDate: "",
      variant: "",
      link: "",
    });
  });

  it("getNotifications returns an error payload on 500", async () => {
    server.use(
      http.get(
        `${BASE}/announcements`,
        () => new HttpResponse(null, { status: 500, statusText: "Server Error" })
      )
    );
    const { result } = renderNotifications();
    let notifications;
    await act(async () => {
      notifications = await result.current.getNotifications();
    });
    expect(notifications.message).toContain("**Error**");
    expect(notifications.variant).toBe("danger");
  });

  it("getEventNotifications returns [] when no event is selected", async () => {
    const { result } = renderNotifications({ selectedEvent: null });
    let notifications;
    await act(async () => {
      notifications = await result.current.getEventNotifications();
    });
    expect(notifications).toEqual([]);
  });

  it("getEventNotifications returns an array of announcements", async () => {
    const payload = [
      {
        message: "Pit gates open at 7am",
        onDate: "2026-04-16",
        onTime: "06:00",
        offDate: "2026-04-16",
        offTime: "20:00",
        variant: "info",
        user: "alice",
      },
    ];
    server.use(
      http.get(`${BASE}/announcements/MAWOR`, () => HttpResponse.json(payload))
    );
    const { result } = renderNotifications({ selectedEvent: MAWOR_EVENT });
    let notifications;
    await act(async () => {
      notifications = await result.current.getEventNotifications();
    });
    expect(notifications).toEqual(payload);
  });

  it("getEventNotifications wraps a 404 into an error array", async () => {
    server.use(
      http.get(
        `${BASE}/announcements/MAWOR`,
        () => new HttpResponse(null, { status: 404, statusText: "Not Found" })
      )
    );
    const { result } = renderNotifications({ selectedEvent: MAWOR_EVENT });
    let notifications;
    await act(async () => {
      notifications = await result.current.getEventNotifications();
    });
    expect(notifications).toHaveLength(1);
    expect(notifications[0].message).toContain("**Error**");
    expect(notifications[0].variant).toBe("danger");
  });

  it("getSystemMessages updates systemMessage on a successful fetch", async () => {
    const { result } = renderNotifications();
    await act(async () => {
      await result.current.getSystemMessages();
    });
    await waitFor(() => {
      expect(result.current.systemMessage).not.toBeNull();
    });
    const fixture = loadFixture("announcements");
    expect(result.current.systemMessage.message).toBe(fixture.message);
    expect(result.current.systemMessage.variant).toBe(fixture.variant);
    expect(result.current.systemBell).toBe("");
  });

  it("getEventMessages clears eventMessage when the API returns an error array", async () => {
    server.use(
      http.get(
        `${BASE}/announcements/MAWOR`,
        () => new HttpResponse(null, { status: 500, statusText: "boom" })
      )
    );
    const { result } = renderNotifications({ selectedEvent: MAWOR_EVENT });
    await act(async () => {
      await result.current.getEventMessages();
    });
    await waitFor(() => {
      expect(result.current.eventMessage).toEqual([]);
    });
  });

  it("getEventMessages formats announcements into expiry/onTime moments", async () => {
    const payload = [
      {
        message: "Lunch is served",
        onDate: "2026-04-16",
        onTime: "12:00",
        offDate: "2026-04-16",
        offTime: "13:00",
        variant: "success",
        user: "bob",
        link: "https://example.com",
      },
    ];
    server.use(
      http.get(`${BASE}/announcements/MAWOR`, () => HttpResponse.json(payload))
    );
    const { result } = renderNotifications({ selectedEvent: MAWOR_EVENT });
    await act(async () => {
      await result.current.getEventMessages();
    });
    await waitFor(() => {
      expect(result.current.eventMessage).toHaveLength(1);
    });
    const formatted = result.current.eventMessage[0];
    expect(formatted.message).toBe("Lunch is served");
    expect(formatted.variant).toBe("success");
    expect(formatted.user).toBe("bob");
    expect(formatted.link).toBe("https://example.com");
    expect(formatted.onTime.format("YYYY-MM-DD HH:mm")).toBe("2026-04-16 12:00");
    expect(formatted.expiry.format("YYYY-MM-DD HH:mm")).toBe("2026-04-16 13:00");
  });
});
