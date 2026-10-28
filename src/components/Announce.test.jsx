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
    it.each(["OffSeason", "Regional", "FTC", "FIRSTGlobal"])("shows %s alliance affiliations only in playoffs", (type) => {
        const props = {
            station: "Red1",
            team: { teamNumber: 254, alliance: "Alliance 2", allianceRole: "Captain" },
            selectedYear: { value: "2026" },
            selectedEvent: { value: { type, name: "Test Event" } },
            eventNamesCY: {},
        };
        const { rerender } = render(<table><tbody><Announce {...props} inPlayoffs={false} /></tbody></table>);
        expect(screen.queryByText("Alliance 2")).not.toBeInTheDocument();
        expect(screen.queryByText(/Captain/)).not.toBeInTheDocument();
        rerender(<table><tbody><Announce {...props} inPlayoffs /></tbody></table>);
        expect(screen.getByText(/Alliance 2/)).toBeInTheDocument();
        expect(screen.getByText(/Captain/)).toBeInTheDocument();
    });

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

        const number = document.querySelector(".announceTeamNumber b");
        expect(number.querySelector(".teamNumberStack").children[0]).toHaveTextContent("9984");
        expect(number.querySelector(".teamNumberSuffix")).toHaveTextContent("841B");
        expect(screen.getByText(/Event Winner/)).toBeInTheDocument();
        expect(screen.queryByText(/Minor Award/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Old Winner/)).not.toBeInTheDocument();
        expect(consoleError.mock.calls.flat().join(" ")).not.toMatch(/unique "key" prop/);
    });
});
