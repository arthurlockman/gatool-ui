import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { utils, write } from "xlsx";
import moment from "moment";
import SchedulePage from "./SchedulePage";

vi.mock("contexts/EventDataContext", () => ({ useEventData: vi.fn() }));
vi.mock("contexts/EventActionsContext", () => ({
  useEventActions: vi.fn(() => ({
    setSelectedEvent: vi.fn(),
    getTeamList: vi.fn(),
    loadEvent: vi.fn(),
    getAlliances: vi.fn(),
  })),
}));
vi.mock("../contexts/SettingsContext", () => ({
  useSettings: vi.fn(() => ({
    hidePracticeSchedule: false,
    useScrollMemory: false,
    playoffCountOverride: null,
    setPlayoffCountOverride: vi.fn(),
  })),
}));
vi.mock("../hooks/useScrollPosition", () => ({ default: vi.fn() }));
vi.mock("components/ScoresDetailsModal", () => ({
  default: ({ show, scoresMatch }) =>
    show ? (
      <div role="dialog">
        <span>{scoresMatch?.description}</span>
      </div>
    ) : null,
  rankPointDisplay: () => null,
}));
vi.mock("components/AdjustAlliancesModal", () => ({ default: () => null }));

import { useEventData } from "contexts/EventDataContext";
import { useEventActions } from "contexts/EventActionsContext";
import { useSettings } from "../contexts/SettingsContext";

function schedulePageProps(overrides = {}) {
  return {
    setPracticeSchedule: vi.fn(),
    setOfflinePlayoffSchedule: vi.fn(),
    practiceFileUploaded: false,
    setPracticeFileUploaded: vi.fn(),
    setTeamListLoading: vi.fn(),
    playoffOnly: false,
    setPlayoffOnly: vi.fn(),
    champsStyle: false,
    setChampsStyle: vi.fn(),
    setQualsLength: vi.fn(),
    setEventLabel: vi.fn(),
    ...overrides,
  };
}

function setupMocks(overrides = {}) {
  useEventData.mockReturnValue({
    selectedEvent: { value: { code: "NYTR" }, label: "Test Event" },
    playoffSchedule: null,
    qualSchedule: { schedule: [] },
    qualScheduleAllFields: null,
    practiceSchedule: null,
    offlinePlayoffSchedule: null,
    alliances: { alliances: [], Lookup: {} },
    eventLabel: "Test Event",
    allianceCount: { count: 8 },
    ftcMode: false,
    firstGlobalMode: false,
    remapNumberToString: (n) => String(n),
    ...overrides,
  });
}

describe("SchedulePage", () => {
  beforeEach(() => {
    setupMocks();
    useSettings.mockReturnValue({
      hidePracticeSchedule: false,
      useScrollMemory: false,
      playoffCountOverride: null,
      setPlayoffCountOverride: vi.fn(),
    });
  });

  it("shows the no-event alert when nothing is selected", () => {
    setupMocks({ selectedEvent: null });
    render(<SchedulePage {...schedulePageProps()} />);
    expect(
      screen.getByText(/you need to select an event/i)
    ).toBeInTheDocument();
  });

  it("shows the awaiting-schedule alert when no schedule is loaded", () => {
    render(<SchedulePage {...schedulePageProps()} />);
    expect(screen.getByText(/awaiting schedule for/i)).toBeInTheDocument();
  });

  it("renders the schedule table when qual matches are available", () => {
    setupMocks({
      qualSchedule: {
        schedule: [
          {
            matchNumber: 1,
            description: "Qualification 1",
            startTime: "2026-03-01T12:00:00Z",
            teams: [
              { teamNumber: 254, station: "Red1" },
              { teamNumber: 1678, station: "Blue1" },
            ],
          },
        ],
      },
    });

    render(<SchedulePage {...schedulePageProps()} />);
    expect(screen.getByText("Match Number")).toBeInTheDocument();
    expect(screen.getByText("Qualification 1")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("shows both TBA identifiers in the schedule", () => {
    setupMocks({
      remapNumberToString: (n) => n === 9984 ? "841B" : n,
      qualSchedule: { schedule: [{
        matchNumber: 1,
        description: "Qualification 1",
        teams: [{ teamNumber: 9984, station: "Red1" }],
      }] },
    });
    render(<SchedulePage {...schedulePageProps()} />);
    expect(screen.getByText("9984/841B")).toBeInTheDocument();
  });

  it("imports and displays a four-alliance Excel playoff schedule including future matches", async () => {
    setupMocks({
      selectedEvent: { value: { code: "OFFLINE" }, label: "Offline Event" },
      remapNumberToString: (n) => n === 9998 ? "4698B" : String(n),
    });
    const getAlliances = vi.fn();
    const getTeamList = vi.fn();
    useEventActions.mockReturnValue({
      setSelectedEvent: vi.fn(), getTeamList, loadEvent: vi.fn(), getAlliances,
    });
    useSettings.mockReturnValue({
      hidePracticeSchedule: false,
      useScrollMemory: false,
      playoffCountOverride: { value: 4 },
      setPlayoffCountOverride: vi.fn(),
    });
    const props = schedulePageProps({ playoffOnly: true });
    const { container, rerender } = render(<SchedulePage {...props} />);
    const descriptions = [
      "Match 1 (R1) (#1)", "Match 2 (R1) (#2)", "Match 3 (R2) (#3)",
      "Match 4 (R2) (#4)", "Match 5 (R3) (#5)", "Final 1 (#6)",
      "Final 2 (#7)", "Final Tiebreaker (#8)",
    ];
    const sheet = utils.aoa_to_sheet([
      ["Playoff Match Schedule"], [],
      [null, "Mainely SPIRIT"], ["Matches Per Team"],
      ["Time", "Description", "Blue 1", "Blue 2", "Blue 3", "Red 1", "Red 2", "Red 3"],
      [46319.572916666664, descriptions[0], "9998", "4473", "172", "133", "5687", "9997"],
      [46319.57986111111, descriptions[1], "58", "9055", "6153", "2648", "4564", "9999"],
      [null, "Field Break"],
      ...descriptions.slice(2).map((description, i) => [46319.59444444445 + i / 144, description]),
      [null, "Awards Break *"],
      ["\n* break if required\n"],
    ]);
    for (let row = 6; row <= 15; row++) {
      if (sheet[`A${row}`]?.t === "n") sheet[`A${row}`].z = "m/d/yyyy h:mm AM/PM";
    }
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, sheet, "Sheet1");
    const file = new File([write(workbook, { type: "array", bookType: "xlsx" })], "playoffs.xlsx");
    fireEvent.change(container.querySelector("#LoadOfflinePlayoffs"), { target: { files: [file] } });

    await waitFor(() => expect(props.setOfflinePlayoffSchedule).toHaveBeenCalledOnce());
    const saved = props.setOfflinePlayoffSchedule.mock.calls[0][0];
    expect(Array.isArray(saved.schedule)).toBe(true);
    expect(saved.schedule.map((match) => match.description)).toEqual(descriptions);
    expect(saved.schedule.map((match) => match.matchNumber)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(moment(saved.schedule[0].startTime).format("YYYY-MM-DD HH:mm")).toBe("2026-10-24 13:45");
    expect(saved.schedule[2].teams).toHaveLength(6);
    expect(saved.schedule[2].teams.every((team) => team.teamNumber === null)).toBe(true);
    expect(getAlliances.mock.calls[0][0].Alliances.map((alliance) => alliance.captain)).toEqual(["133", "2648", "58", "4698B"]);
    expect(getTeamList).toHaveBeenCalledWith(expect.arrayContaining([133, 5687, 9997, 9998, 4473, 172]));
    expect(getTeamList.mock.calls[0][0]).toHaveLength(12);
    expect(getTeamList.mock.calls[0][0]).not.toContain(null);

    setupMocks({
      selectedEvent: { value: { code: "OFFLINE" }, label: "Offline Event" },
      offlinePlayoffSchedule: saved,
    });
    rerender(<SchedulePage {...props} />);
    for (const description of descriptions) {
      expect(screen.getByText(description)).toBeInTheDocument();
    }
  });

  it("preserves the nested practice schedule, text times, and surrogate markers", async () => {
    const props = schedulePageProps();
    const { container } = render(<SchedulePage {...props} />);
    const sheet = utils.aoa_to_sheet([
      ["Practice Match Schedule"], [],
      [null, "Test Event"], [],
      ["Time", "Description", "Blue 1", "Blue 2", "Blue 3", "Red 1", "Red 2", "Red 3"],
      ["Sat 1:45 PM", "Practice 1", "1", "2", "3", "4*", "5", "6"],
      [null, "Field Break"],
    ]);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, sheet, "Sheet1");
    const file = new File([write(workbook, { type: "array", bookType: "xlsx" })], "practice.xlsx");
    fireEvent.change(container.querySelector("#BackupFiles"), { target: { files: [file] } });

    await waitFor(() => expect(props.setPracticeSchedule).toHaveBeenCalledOnce());
    const saved = props.setPracticeSchedule.mock.calls[0][0];
    expect(saved.schedule.schedule).toHaveLength(1);
    expect(saved.schedule.schedule[0]).toMatchObject({
      description: "Practice 1",
      tournamentLevel: "Practice",
      matchNumber: 1,
      teams: expect.arrayContaining([
        expect.objectContaining({ teamNumber: 4, station: "Red1", surrogate: true }),
      ]),
    });
    expect(moment(saved.schedule.schedule[0].startTime).format("HH:mm")).toBe("13:45");
    expect(props.setQualsLength).toHaveBeenCalledWith(1);
    expect(props.setOfflinePlayoffSchedule).not.toHaveBeenCalled();
  });

  it("opens score details for FIRST Global results without an actual start time", () => {
    const match = {
      matchNumber: 1,
      description: "Qualification 1",
      startTime: "2026-03-01T12:00:00Z",
      actualStartTime: null,
      scoreRedFinal: 72,
      scoreBlueFinal: 42,
      scores: {
        alliances: [
          { alliance: "Red", totalPoints: 72 },
          { alliance: "Blue", totalPoints: 42 },
        ],
        details: { redRobotOneBraceState: 0.1 },
      },
      teams: [
        { teamNumber: 254, station: "Red1" },
        { teamNumber: 1678, station: "Blue1" },
      ],
    };
    setupMocks({
      ftcMode: { value: "FIRSTGlobal" },
      firstGlobalMode: true,
      qualSchedule: { schedule: [match] },
    });

    render(<SchedulePage {...schedulePageProps()} />);
    fireEvent.click(screen.getByText("72"));

    expect(screen.getByRole("dialog")).toHaveTextContent("Qualification 1");
  });

  it("does not tint or display an unplayed FIRST Global 0-0 placeholder as a tie", () => {
    setupMocks({
      ftcMode: { value: "FIRSTGlobal" },
      firstGlobalMode: true,
      qualSchedule: {
        schedule: [
          {
            matchNumber: 2,
            description: "Qualification 2",
            startTime: "2026-03-01T12:00:00Z",
            actualStartTime: null,
            postResultTime: null,
            scoreRedFinal: 0,
            scoreBlueFinal: 0,
            scores: { alliances: [] },
            teams: [],
          },
        ],
      },
    });

    const { container } = render(<SchedulePage {...schedulePageProps()} />);
    const row = screen.getByText("Qualification 2").closest("tr");
    const resultCell = row?.querySelector("td:nth-child(4)");

    expect(resultCell).not.toHaveClass("scheduleTabletie");
    expect(resultCell).toHaveTextContent("");
    expect(container.querySelectorAll(".scheduleTabletie")).toHaveLength(0);
  });
});
