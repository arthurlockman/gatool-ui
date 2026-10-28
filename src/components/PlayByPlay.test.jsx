import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import useWindowDimensions from "hooks/UseWindowDimensions";

vi.mock("hooks/UseWindowDimensions", () => ({
    default: vi.fn(() => ({ width: 1200, height: 800 })),
}));

vi.mock("../contexts/SettingsContext", () => ({
    useSettings: () => ({
        showNotes: false,
        showMottoes: false,
        showQualsStats: false,
        showQualsStatsQuals: true,
    }),
}));

import PlayByPlay from "./PlayByPlay";

const team = {
    teamNumber: 254,
    nameShort: "Team Example",
    rank: 1,
    sortOrder1: 2,
    qualAverage: 3.5,
    wins: 4,
    losses: 1,
    ties: 0,
    highScore: { score: 100, description: "Qualification 1" },
};

function renderStats(firstGlobalMode) {
    render(
        <table>
            <tbody>
                <tr>
                    <PlayByPlay
                        station="Blue1"
                        team={team}
                        inPlayoffs={false}
                        selectedEvent={{ value: { name: "Test Event" } }}
                        adHocMode={false}
                        playoffOnly={false}
                        ftcMode={false}
                        firstGlobalMode={firstGlobalMode}
                    />
                </tr>
            </tbody>
        </table>,
    );
}

describe("PlayByPlay statistics table", () => {
    it.each([
        [false, false], [true, false], [true, true],
    ])("gates alliance affiliations on playoffs (FTC=%s, FIRST Global=%s) in both layouts", (ftcMode, firstGlobalMode) => {
        const props = {
            station: "Blue1",
            team: { ...team, alliance: "Alliance 2", allianceRole: "Captain" },
            selectedEvent: { value: { name: "Test Event" } },
            ftcMode,
            firstGlobalMode,
        };
        const { rerender } = render(<table><tbody><tr><PlayByPlay {...props} inPlayoffs={false} /></tr></tbody></table>);
        for (const dimensions of [{ width: 1200, height: 800 }, { width: 600, height: 900 }]) {
            useWindowDimensions.mockReturnValue(dimensions);
            rerender(<table><tbody><tr><PlayByPlay {...props} inPlayoffs={false} /></tr></tbody></table>);
            expect(screen.queryByText(/Alliance 2/)).not.toBeInTheDocument();
            expect(screen.queryByText(/Captain/)).not.toBeInTheDocument();
            rerender(<table><tbody><tr><PlayByPlay {...props} inPlayoffs /></tr></tbody></table>);
            expect(screen.getByText(/Alliance 2/)).toBeInTheDocument();
            expect(screen.getByText(/Captain/)).toBeInTheDocument();
        }
    });

    it("stacks the numeric and suffixed identifiers", () => {
        const { container } = render(
            <table><tbody><tr>
                <PlayByPlay
                    station="Blue1"
                    team={{ ...team, teamNumber: 9984 }}
                    selectedEvent={{ value: { name: "CACC" } }}
                    remapNumberToString={(n) => n === 9984 ? "841B" : n}
                />
            </tr></tbody></table>
        );
        const number = container.querySelector(".playByPlayteamNumber");
        expect(number.querySelector(".teamNumberStack").children[0]).toHaveTextContent("9984");
        expect(number.querySelector(".teamNumberSuffix")).toHaveTextContent("841B");
    });

    it("spans the high-score row across the three FIRST Global statistics columns", () => {
        renderStats(true);

        expect(screen.getByText(/Team high score/).closest("td")).toHaveAttribute("colspan", "3");
    });

    it("spans the high-score row across all five statistics columns", () => {
        renderStats(false);

        expect(screen.getByText(/Team high score/).closest("td")).toHaveAttribute("colspan", "5");
    });
});
