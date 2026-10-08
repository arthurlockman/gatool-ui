import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

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
    it("spans the high-score row across the three FIRST Global statistics columns", () => {
        renderStats(true);

        expect(screen.getByText(/Team high score/).closest("td")).toHaveAttribute("colspan", "3");
    });

    it("spans the high-score row across all five statistics columns", () => {
        renderStats(false);

        expect(screen.getByText(/Team high score/).closest("td")).toHaveAttribute("colspan", "5");
    });
});
