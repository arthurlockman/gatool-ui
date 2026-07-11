import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AwardsPage from "./AwardsPage";

vi.mock("contexts/EventDataContext", () => ({ useEventData: vi.fn() }));
vi.mock("react-hotkeys-hook", () => ({
  useHotkeysContext: () => ({ disableScope: vi.fn(), enableScope: vi.fn() }),
  useHotkeys: vi.fn(),
}));
vi.mock("hooks/UseWindowDimensions", () => ({
  default: () => ({ width: 1200, height: 800 }),
}));

import { useEventData } from "contexts/EventDataContext";

function makeTeams() {
  return {
    teams: [
      {
        teamNumber: 254,
        nameShort: "Poofs",
        organization: "Bellarmine",
        city: "San Jose",
        stateProv: "CA",
        country: "USA",
        rookieYear: 1996,
      },
      {
        teamNumber: 1678,
        nameShort: "Citrus",
        organization: "Davis High",
        city: "Davis",
        stateProv: "CA",
        country: "USA",
        rookieYear: 2005,
      },
    ],
  };
}

function setupMocks(overrides = {}) {
  useEventData.mockReturnValue({
    selectedEvent: { value: { code: "NYTR" }, label: "Test Event" },
    selectedYear: { value: "2026" },
    teamList: makeTeams(),
    communityUpdates: null,
    eventLabel: "Test Event",
    remapNumberToString: (n) => String(n),
    firstGlobalMode: false,
    ...overrides,
  });
}

describe("AwardsPage", () => {
  beforeEach(() => {
    setupMocks();
  });

  it("shows the no-event alert when nothing is selected", () => {
    setupMocks({ selectedEvent: null });
    render(<AwardsPage />);
    expect(
      screen.getByText(/you need to select an event/i)
    ).toBeInTheDocument();
  });

  it("shows the awaiting-team-data alert when the team list is empty", () => {
    setupMocks({ teamList: { teams: [] } });
    render(<AwardsPage />);
    expect(screen.getByText(/awaiting team data/i)).toBeInTheDocument();
  });

  it("renders team buttons and opens the awards modal on click", () => {
    render(<AwardsPage />);
    fireEvent.click(screen.getByRole("button", { name: "254" }));
    expect(screen.getByText("Awards Announcement")).toBeInTheDocument();
    expect(screen.getByText(/Team 254/)).toBeInTheDocument();
    expect(screen.getByText(/Congratulations!/i)).toBeInTheDocument();
  });

  it("shows Original and Sustaining copy for legacy teams in FRC mode", () => {
    setupMocks({
      teamList: {
        teams: [
          {
            teamNumber: 148,
            nameShort: "Robowranglers",
            organization: "Greenville HS",
            city: "Greenville",
            stateProv: "TX",
            country: "USA",
            rookieYear: 1992,
          },
        ],
      },
    });
    render(<AwardsPage />);
    fireEvent.click(screen.getByRole("button", { name: "148" }));
    expect(screen.getByText(/Original and Sustaining Team/i)).toBeInTheDocument();
    expect(screen.getByText(/Founded in 1992/i)).toBeInTheDocument();
  });

  it("hides FRC-specific copy in FIRST Global mode", () => {
    setupMocks({
      firstGlobalMode: true,
      teamList: {
        teams: [
          {
            teamNumber: 254,
            nameShort: "Poofs",
            organization: "Bellarmine",
            city: "San Jose",
            stateProv: "CA",
            country: "USA",
            rookieYear: 1996,
          },
        ],
      },
    });
    render(<AwardsPage />);
    fireEvent.click(screen.getByRole("button", { name: "254" }));
    expect(screen.queryByText(/Original and Sustaining Team/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Founded in 1996/i)).not.toBeInTheDocument();
  });

  it("shows Select this team when the filter matches exactly one team", () => {
    render(<AwardsPage />);
    fireEvent.change(screen.getByPlaceholderText("Enter a number"), {
      target: { value: "1678" },
    });
    expect(screen.getByText("Select this team")).toBeInTheDocument();
  });
});
