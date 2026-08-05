import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HotkeysProvider } from "react-hotkeys-hook";
import FoulButtons from "./FoulButtons";
import { commonFouls } from "../data/fouls";
import { commonFoulsFTC } from "../data/foulsFTC";
import { commonFoulsFirstGlobal } from "../data/foulsFirstGlobal";

function renderFoulButtons(props) {
	return render(
		<HotkeysProvider initiallyActiveScopes={["matchNavigation"]}>
			<FoulButtons currentYear={2026} {...props} />
		</HotkeysProvider>,
	);
}

const frcMode = null;
const ftcOnlineMode = { value: "FTCOnline", label: "FTC Online" };
const firstGlobalMode = { value: "FIRSTGlobal", label: "FIRST Global" };

describe("FoulButtons", () => {
	it("renders one button per cardable foul in FRC mode and includes the Lookup Foul button", () => {
		renderFoulButtons({ ftcMode: frcMode });

		const cardableCodes = commonFouls.filter(
			(f) => f.card === "red" || f.card === "yellow",
		);
		for (const foul of cardableCodes) {
			expect(screen.getByText(foul.code)).toBeInTheDocument();
		}
		expect(
			screen.getByRole("button", { name: /Lookup Foul/i }),
		).toBeInTheDocument();
	});

	it("renders FTC fouls (not FRC fouls) when ftcMode is FTC and includes the Lookup Foul button", () => {
		renderFoulButtons({ ftcMode: ftcOnlineMode });

		const ftcCode = commonFoulsFTC[0].code;
		expect(screen.getByText(ftcCode)).toBeInTheDocument();

		const frcOnlyCode = commonFouls.find(
			(f) => !commonFoulsFTC.some((ftc) => ftc.code === f.code),
		)?.code;
		if (frcOnlyCode) {
			expect(screen.queryByText(frcOnlyCode)).not.toBeInTheDocument();
		}
		expect(
			screen.getByRole("button", { name: /Lookup Foul/i }),
		).toBeInTheDocument();
	});

	it("renders FIRST Global fouls and hides the Lookup Foul button in FIRST Global mode", () => {
		renderFoulButtons({ ftcMode: firstGlobalMode });

		for (const foul of commonFoulsFirstGlobal) {
			expect(screen.getByText(foul.code)).toBeInTheDocument();
		}
		expect(
			screen.queryByRole("button", { name: /Lookup Foul/i }),
		).not.toBeInTheDocument();
	});

	it("does not render any FRC- or FTC-only foul codes in FIRST Global mode", () => {
		renderFoulButtons({ ftcMode: firstGlobalMode });

		const overlappingFrcCode = commonFouls.find(
			(f) => !commonFoulsFirstGlobal.some((fg) => fg.code === f.code),
		)?.code;
		expect(screen.queryByText(overlappingFrcCode)).not.toBeInTheDocument();
	});

	it("opens the foul detail modal with the correct code, name, and violation text on click", async () => {
		const user = userEvent.setup();
		renderFoulButtons({ ftcMode: firstGlobalMode });

		const foul = commonFoulsFirstGlobal.find((f) => f.code === "G13");
		await user.click(screen.getByRole("button", { name: foul.code }));

		expect(screen.getByText(`${foul.code}: ${foul.name}`)).toBeInTheDocument();
		expect(screen.getByText(/RED CARD/)).toBeInTheDocument();
	});
});

describe("commonFoulsFirstGlobal data", () => {
	it("only contains fouls that carry a Yellow Card, Red Card, or Disqualification", () => {
		for (const foul of commonFoulsFirstGlobal) {
			expect(["yellow", "red", "dq"]).toContain(foul.card);
		}
	});

	it("never awards an automatic ranking point (FIRST Global has no RP fouls)", () => {
		for (const foul of commonFoulsFirstGlobal) {
			expect(foul.rp).toBe(false);
		}
	});

	it("has a unique code for every entry", () => {
		const codes = commonFoulsFirstGlobal.map((f) => f.code);
		expect(new Set(codes).size).toBe(codes.length);
	});

	it("has required fields populated for every entry", () => {
		for (const foul of commonFoulsFirstGlobal) {
			expect(foul.year).toBeTypeOf("number");
			expect(foul.code).toBeTypeOf("string");
			expect(foul.name).toBeTruthy();
			expect(foul.text).toBeTruthy();
			expect(foul.violation).toBeTruthy();
		}
	});
});
