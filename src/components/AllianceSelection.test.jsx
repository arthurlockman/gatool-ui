import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AllianceSelection from "./AllianceSelection";

vi.mock("../contexts/SettingsContext", () => ({
    useSettings: () => ({ allianceSelectionRoundOrder: null }),
}));
vi.mock("react-hotkeys-hook", () => ({
    useHotkeysContext: () => ({ disableScope: vi.fn(), enableScope: vi.fn() }),
    useHotkeys: vi.fn(),
}));
vi.mock("hooks/UseWindowDimensions", () => ({
    default: () => ({ width: 1200, height: 900 }),
}));

const remappings = {
    9984: "841B",
    9995: "2035B",
    9996: "2135B",
    9997: "8B",
    9998: "4698B",
    9974: "7419B",
};

function renderSelection({ firstGlobalMode = false, ftcMode = false, remapNumberToString = (n) => remappings[n] || n } = {}) {
    const ranks = [
        { teamNumber: 1678, rank: 1 },
        { teamNumber: "841B", rank: 2 },
        { teamNumber: 841, rank: 3 },
        ...["2035B", "2135B", "7419B", "4698B", "8B"].map((teamNumber, i) => ({ teamNumber, rank: i + 4 })),
        { teamNumber: 12345, rank: 9 },
    ];
    const teams = [1678, 841, ...Object.keys(remappings).map(Number)].map((teamNumber) => ({
        teamNumber, nameShort: `Robot ${teamNumber}`, rookieYear: 2020,
    }));
    let selection;
    function Harness() {
        const [arrays, setArrays] = useState({});
        const [filter, setFilter] = useState("");
        selection = arrays;
        return <AllianceSelection
            selectedYear={{ value: "2026" }}
            selectedEvent={{ value: { code: "CAELK", type: "OffSeason", tbaEventKey: "cacc" } }}
            rankings={{ ranks }}
            teamList={{ teams }}
            allianceCount={{ count: 2 }}
            communityUpdates={[{ teamNumber: 9997, updates: { nameShortLocal: "Extra robot" } }]}
            allianceSelectionArrays={arrays}
            setAllianceSelectionArrays={setArrays}
            handleReset={vi.fn()}
            teamFilter={filter}
            setTeamFilter={setFilter}
            ftcMode={ftcMode}
            firstGlobalMode={firstGlobalMode}
            remapNumberToString={remapNumberToString}
            useFourTeamAlliances={false}
            setResetAllianceSelection={vi.fn()}
        />;
    }
    const view = render(<Harness />);
    return { ...view, getSelection: () => selection, ranks, teams };
}

describe("AllianceSelection team identifiers", () => {
    it("keeps all six cacc extra robots, assigns captains by rank, and preserves numeric IDs", async () => {
        const { getSelection, ranks, teams } = renderSelection();
        await waitFor(() => expect(getSelection().rankedTeams).toHaveLength(8));

        expect(getSelection().alliances.map((alliance) => alliance.captain.teamNumber)).toEqual([1678, 9984]);
        for (const [number, display] of Object.entries(remappings)) {
            expect(getSelection().availableTeams.some((team) => team.teamNumber === Number(number))).toBe(true);
            expect(screen.getAllByText(display).length).toBeGreaterThan(0);
        }
        expect(getSelection().rankedTeams.some((team) => team.teamNumber === 12345)).toBe(false);
        expect(ranks[1].teamNumber).toBe("841B");
        expect(teams.find((team) => team.teamNumber === 9984).rank).toBeUndefined();
    });

    it("filters and selects by a letter-suffixed number while storing the numeric pick", async () => {
        const { getSelection } = renderSelection();
        await screen.findByLabelText("Team Number");
        fireEvent.change(screen.getByLabelText("Team Number"), { target: { value: "8b" } });
        const available = document.querySelectorAll(".availableTeam");
        expect(available).toHaveLength(1);
        expect(available[0]).toHaveTextContent("8B");

        fireEvent.click(screen.getByRole("button", { name: "Select this team" }));
        const dialog = await screen.findByRole("dialog");
        expect(dialog).toHaveTextContent("8B");
        expect(dialog).toHaveTextContent("Extra robot");
        fireEvent.click(screen.getByRole("button", { name: /accept/i }));
        fireEvent.click(screen.getByRole("button", { name: /accept/i }));
        await waitFor(() => expect(getSelection().alliances[0].round1?.teamNumber).toBe(9997));
    });

    it("orders Teams for Alliance Selection by number then suffix", async () => {
        const { getSelection } = renderSelection();
        await waitFor(() => expect(getSelection().rankedTeams).toHaveLength(8));
        const order = [...document.querySelectorAll(".availableTeam")].map((cell) => cell.textContent.match(/^\d+[A-Z]*/)?.[0]);
        expect(order).toEqual(["8B", "841", "841B", "2035B", "2135B", "4698B", "7419B"]);
        expect(getSelection().availableTeams.map((team) => team.teamNumber)).toEqual([9997, 841, 9984, 9995, 9996, 9998, 9974]);
    });

    it("continues accepting numeric surrogate IDs in the filter", async () => {
        renderSelection();
        await screen.findByLabelText("Team Number");
        fireEvent.change(screen.getByLabelText("Team Number"), { target: { value: "9997" } });
        expect(document.querySelectorAll(".availableTeam")).toHaveLength(1);
        expect(screen.getByRole("button", { name: "Select this team" })).toBeInTheDocument();
    });

    it("keeps FIRST Global rankings keyed by numeric team number", async () => {
        const { getSelection } = renderSelection({
            firstGlobalMode: true,
            ftcMode: { value: "FIRSTGlobal" },
            remapNumberToString: (n) => n === 841 ? "Bahamas" : n,
        });
        await waitFor(() => expect(getSelection().rankedTeams).toHaveLength(2));
        expect(getSelection().rankedTeams.map((team) => team.teamNumber)).toEqual([1678, 841]);
        expect(screen.getAllByText("Bahamas").length).toBeGreaterThan(0);
    });
});
