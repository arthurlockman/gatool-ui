import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Announce from "./Announce";

vi.mock("../contexts/SettingsContext", () => ({
    useSettings: () => ({
        awardsMenu: { value: 3 },
        showAwards: true,
        showMinorAwards: false,
    }),
}));

afterEach(() => {
    vi.restoreAllMocks();
});

describe("Announce awards", () => {
    it("renders visible awards without React key warnings when some awards are filtered out", () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        const team = {
            teamNumber: 9984,
            nameShort: "Extra robot",
            rookieYear: 2020,
            awards: {
                2026: { awards: [
                    { year: 2026, eventCode: "CACC", name: "Event Winner", highlight: true },
                    { year: 2026, eventCode: "CACC", name: "Minor Award", highlight: false },
                ] },
                2020: { awards: [{ year: 2020, eventCode: "CAOLD", name: "Old Winner", highlight: true }] },
            },
        };

        render(
            <table><tbody>
                <Announce
                    station="Red1"
                    team={team}
                    selectedYear={{ value: "2026" }}
                    selectedEvent={{ value: { type: "OffSeason", name: "CAELK", champLevel: "" } }}
                    eventNamesCY={{}}
                    remapNumberToString={(n) => n === 9984 ? "841B" : n}
                />
            </tbody></table>
        );

        expect(screen.getByText("841B")).toBeInTheDocument();
        expect(screen.getByText(/Event Winner/)).toBeInTheDocument();
        expect(screen.queryByText(/Minor Award/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Old Winner/)).not.toBeInTheDocument();
        expect(consoleError.mock.calls.flat().join(" ")).not.toMatch(/unique "key" prop/);
    });
});
