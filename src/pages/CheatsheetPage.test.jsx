import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CheatsheetPage from "./CheatsheetPage";

vi.mock("contexts/EventDataContext", () => ({ useEventData: vi.fn() }));
vi.mock("../contextProviders/AuthClientContext", () => ({
  apiBaseUrl: "https://api.gatool.org/v3/",
}));
vi.mock("react-quizlet-flashcard", () => ({
  FlashcardArray: ({ deck }) => (
    <div data-testid="flashcard-array">{deck?.length ?? 0} cards</div>
  ),
}));

import { useEventData } from "contexts/EventDataContext";

function setupMocks(overrides = {}) {
  useEventData.mockReturnValue({
    selectedEvent: { value: { code: "NYTR" }, label: "Test Event" },
    selectedYear: { value: "2026" },
    eventLabel: "Test Event",
    ftcMode: false,
    teamList: {
      teams: [
        {
          teamNumber: 254,
          nameShort: "Poofs",
          city: "San Jose",
          stateProv: "CA",
          country: "USA",
        },
      ],
    },
    communityUpdates: [{ teamNumber: 254, updates: { nameShortLocal: "Local Poofs" } }],
    robotImages: [],
    ...overrides,
  });
}

describe("CheatsheetPage", () => {
  beforeEach(() => {
    setupMocks();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      blob: async () => new Blob(["pdf"]),
    }));
    URL.createObjectURL = vi.fn(() => "blob:test");
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows the FRC cheat sheet download link", () => {
    render(<CheatsheetPage />);
    expect(screen.getByText("Download the Cheat Sheet")).toBeInTheDocument();
    expect(screen.getByAltText("Cheatsheet")).toHaveAttribute(
      "src",
      "/cheatsheet/rebuilt-cheat-sheet-04222026.png"
    );
  });

  it("shows the FTC cheat sheet when in FTC mode", () => {
    setupMocks({ ftcMode: { value: "FTCOnline", label: "FTC Online" } });
    render(<CheatsheetPage />);
    expect(screen.getByAltText("Cheatsheet")).toHaveAttribute(
      "src",
      "/cheatsheet/decode_cheat_sheet_04222026.png"
    );
  });

  it("shows the FIRST Global cheat sheet when in FIRST Global mode", () => {
    setupMocks({ ftcMode: { value: "FIRSTGlobal", label: "FIRST Global" } });
    render(<CheatsheetPage />);
    expect(screen.getByAltText("Cheatsheet")).toHaveAttribute(
      "src",
      "/cheatsheet/IGNITING_INNOVATION_Cheat_Sheet_06222026.png"
    );
  });

  it("renders flashcards when teams and community updates are available", () => {
    render(<CheatsheetPage />);
    expect(screen.getByTestId("flashcard-array")).toHaveTextContent("1 cards");
    expect(
      screen.getByText(/helpful flash cards you can use/i)
    ).toBeInTheDocument();
  });

  it("downloads the cheat sheet PDF via fetch", async () => {
    render(<CheatsheetPage />);
    fireEvent.click(screen.getByText("Download the Cheat Sheet"));
    expect(fetch).toHaveBeenCalledWith(
      "/cheatsheet/rebuilt-cheat-sheet-04222026.pdf"
    );
  });
});
