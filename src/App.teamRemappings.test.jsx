import { useState } from "react";
import { act, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

const mocks = vi.hoisted(() => ({
  mode: { value: "FIRSTGlobal" },
  teams: null,
  remappings: null,
  data: null,
  setTeamList: null,
  getAccessToken: vi.fn(async () => "fake-token"),
}));

vi.mock("./contextProviders/AuthProvider", () => ({
  useAuth: () => ({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    getAccessToken: mocks.getAccessToken,
  }),
}));

vi.mock("./contexts/EventSelectionContext", () => ({
  useEventSelection: () => ({
    selectedEvent: null,
    selectedYear: null,
    ftcMode: mocks.mode,
  }),
}));

vi.mock("./hooks/UsePersistentState", () => ({
  usePersistentState: (key, defaultValue) => {
    const [value, setValue] = useState(() => {
      if (key === "cache:teamList") return mocks.teams;
      if (key === "cache:teamRemappings") return mocks.remappings;
      return defaultValue;
    });
    if (key === "cache:teamList") mocks.setTeamList = setValue;
    return [value, setValue];
  },
}));

// Observe the real App mapping callbacks without mounting unrelated pages.
vi.mock("./contexts/EventStoreProvider", () => ({
  EventStoreProvider: ({ data }) => {
    mocks.data = data;
    return null;
  },
}));

vi.mock("react-loader-spinner", () => ({ Blocks: () => null }));

import App from "./App";
import { OnlineStatusProvider } from "./contextProviders/OnlineContext";
import { AuthClientContextProvider } from "./contextProviders/AuthClientContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { HotkeysProvider } from "react-hotkeys-hook";
import { SnackbarProvider } from "notistack";

function renderApp() {
  return render(
    <HotkeysProvider>
      <OnlineStatusProvider>
        <AuthClientContextProvider>
          <SnackbarProvider>
            <SettingsProvider>
              <App />
            </SettingsProvider>
          </SnackbarProvider>
        </AuthClientContextProvider>
      </OnlineStatusProvider>
    </HotkeysProvider>
  );
}

beforeEach(() => {
  mocks.mode = { value: "FIRSTGlobal" };
  mocks.teams = { teams: [{ teamNumber: 13, country: "Bahamas" }] };
  mocks.remappings = null;
  mocks.data = null;
  mocks.setTeamList = null;
});

describe("App FIRST Global team remappings", () => {
  it("keeps Kosovo for team 12 when a cached list also contains a later Bahamas record", async () => {
    mocks.teams = {
      teams: [
        { teamNumber: 12, nameFull: "Team Kosovo", country: "KOS", countryCode: "xk" },
        { teamNumber: 13, nameFull: "Team Bangladesh", country: "BAN", countryCode: "bd" },
        { teamNumber: 12, nameFull: "Team Bahamas", country: "BAH", countryCode: "bs" },
        { teamNumber: 13, nameFull: "Team Bangladesh", country: "BAN", countryCode: "bd" },
      ],
    };
    mocks.remappings = {
      numbers: { 12: "BAH", 13: "BAN" },
      strings: { KOS: 12, BAH: 12, BAN: 13 },
    };
    renderApp();

    await waitFor(() => expect(mocks.data.remapNumberToString(12)).toBe("KOS"));
    expect(mocks.data.remapStringToNumber("KOS")).toBe(12);
    expect(mocks.data.remapStringToNumber("BAH")).toBeNull();
    expect(mocks.data.remapNumberToString(13)).toBe("BAN");
  });

  it("rebuilds both mappings when a correction keeps the team count unchanged", async () => {
    renderApp();
    await waitFor(() => expect(mocks.data.remapNumberToString(13)).toBe("Bahamas"));

    act(() => {
      mocks.setTeamList({ teams: [{ teamNumber: 13, country: "Kosovo" }] });
    });

    await waitFor(() => expect(mocks.data.remapNumberToString(13)).toBe("Kosovo"));
    expect(mocks.data.remapStringToNumber("Kosovo")).toBe(13);
    expect(mocks.data.remapStringToNumber("Bahamas")).toBeNull();
  });

  it("preserves country, countryCode, and numeric fallback precedence", async () => {
    mocks.teams = {
      teams: [
        { teamNumber: 13, country: "Kosovo", countryCode: "XK" },
        { teamNumber: 14, countryCode: "BS" },
        { teamNumber: 15 },
      ],
    };
    renderApp();

    await waitFor(() => expect(mocks.data.remapNumberToString(13)).toBe("Kosovo"));
    expect(mocks.data.remapNumberToString(14)).toBe("BS");
    expect(mocks.data.remapNumberToString(15)).toBe("15");
    expect(mocks.data.remapNumberToString(16)).toBe(16);
    expect(mocks.data.remapStringToNumber("BS")).toBe(14);
  });

  it.each([{ teams: [] }, null])("clears mappings when the team list becomes %j", async (emptyList) => {
    renderApp();
    await waitFor(() => expect(mocks.data.remapNumberToString(13)).toBe("Bahamas"));

    act(() => mocks.setTeamList(emptyList));

    await waitFor(() => expect(mocks.data.remapNumberToString(13)).toBe(13));
    expect(mocks.data.remapStringToNumber("Bahamas")).toBeNaN();
  });

  it.each([null, { value: "FTC" }])("leaves existing mappings untouched outside FIRST Global (mode %j)", (mode) => {
    mocks.mode = mode;
    mocks.remappings = { numbers: { 13: "TeamA" }, strings: { TeamA: 13 } };
    renderApp();
    expect(mocks.data.remapNumberToString(13)).toBe("TeamA");

    act(() => mocks.setTeamList({ teams: [{ teamNumber: 13, country: "Kosovo" }] }));
    expect(mocks.data.remapNumberToString(13)).toBe("TeamA");
    expect(mocks.data.remapStringToNumber("TeamA")).toBe(13);

    act(() => mocks.setTeamList(null));
    expect(mocks.data.remapNumberToString(13)).toBe("TeamA");
  });
});
