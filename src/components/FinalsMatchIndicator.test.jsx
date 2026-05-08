import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import FinalsMatchIndicator from "./FinalsMatchIndicator";
import { GREEN } from "./bracketConstants";

describe("FinalsMatchIndicator", () => {
	it("renders nothing when finalsCount is 0", () => {
		const { container } = render(
			<svg xmlns="http://www.w3.org/2000/svg">
				<FinalsMatchIndicator
					x={100}
					y={200}
					firstFinalsMatchNumber={10}
					finalsCount={0}
					getFinalsMatchWinnerForDisplay={() => null}
					getFinalsMatchScoreForDisplay={() => null}
				/>
			</svg>
		);
		expect(container.querySelectorAll("circle")).toHaveLength(0);
	});

	it("renders one circle per finalsCount and invokes getters with sequential match numbers", () => {
		const getFinalsMatchWinnerForDisplay = vi.fn((mn) =>
			mn === 10 ? { winner: "red" } : { winner: "blue" },
		);
		const getFinalsMatchScoreForDisplay = vi.fn((mn, alliance) =>
			alliance === "red" ? mn : mn + 100,
		);

		const { container } = render(
			<svg xmlns="http://www.w3.org/2000/svg">
				<FinalsMatchIndicator
					x={100}
					y={50}
					firstFinalsMatchNumber={10}
					finalsCount={3}
					indicatorSpacing={32}
					indicatorScale={1}
					getFinalsMatchWinnerForDisplay={getFinalsMatchWinnerForDisplay}
					getFinalsMatchScoreForDisplay={getFinalsMatchScoreForDisplay}
				/>
			</svg>
		);

		expect(container.querySelectorAll("circle")).toHaveLength(3);
		expect(getFinalsMatchWinnerForDisplay).toHaveBeenCalledTimes(3);
		expect(getFinalsMatchWinnerForDisplay).toHaveBeenCalledWith(10);
		expect(getFinalsMatchWinnerForDisplay).toHaveBeenCalledWith(11);
		expect(getFinalsMatchWinnerForDisplay).toHaveBeenCalledWith(12);
		expect(getFinalsMatchScoreForDisplay).toHaveBeenCalledWith(10, "red");
		expect(getFinalsMatchScoreForDisplay).toHaveBeenCalledWith(10, "blue");
	});

	it("places the outer group at translate(x, y)", () => {
		const { container } = render(
			<svg xmlns="http://www.w3.org/2000/svg">
				<FinalsMatchIndicator
					x={1139.25}
					y={438}
					firstFinalsMatchNumber={10}
					finalsCount={1}
					getFinalsMatchWinnerForDisplay={() => ({ winner: "red" })}
					getFinalsMatchScoreForDisplay={() => 99}
				/>
			</svg>
		);
		const outer = container.querySelector("svg > g");
		expect(outer?.getAttribute("transform")).toBe("translate(1139.25, 438)");
	});

	it("centers slots symmetrically around x for multiple finals (half-span spacing)", () => {
		const { container } = render(
			<svg xmlns="http://www.w3.org/2000/svg">
				<FinalsMatchIndicator
					x={200}
					y={0}
					firstFinalsMatchNumber={10}
					finalsCount={3}
					indicatorSpacing={30}
					indicatorScale={1}
					getFinalsMatchWinnerForDisplay={() => ({ winner: "red" })}
					getFinalsMatchScoreForDisplay={() => 0}
				/>
			</svg>
		);
		const translates = [...container.querySelectorAll("g")].map((g) => g.getAttribute("transform"));
		// halfSpan = (3-1)*30/2 = 30 → slotX = -30, 0, 30
		expect(translates.some((t) => t === "translate(-30, 0)" || t === "translate(-30,0)")).toBe(true);
		expect(translates.some((t) => t === "translate(30, 0)" || t === "translate(30,0)")).toBe(true);
	});

	it("uses green fill for tie winners", () => {
		const { container } = render(
			<svg xmlns="http://www.w3.org/2000/svg">
				<FinalsMatchIndicator
					x={0}
					y={0}
					firstFinalsMatchNumber={12}
					finalsCount={1}
					getFinalsMatchWinnerForDisplay={() => ({ winner: "tie" })}
					getFinalsMatchScoreForDisplay={() => 138}
				/>
			</svg>
		);
		const circle = container.querySelector("circle");
		expect(circle?.getAttribute("fill")).toBe(GREEN);
	});

	it("scales circle radius by indicatorScale", () => {
		const { container } = render(
			<svg xmlns="http://www.w3.org/2000/svg">
				<FinalsMatchIndicator
					x={0}
					y={0}
					firstFinalsMatchNumber={10}
					finalsCount={1}
					indicatorScale={1.2}
					getFinalsMatchWinnerForDisplay={() => ({ winner: "red" })}
					getFinalsMatchScoreForDisplay={() => 100}
				/>
			</svg>
		);
		const circle = container.querySelector("circle");
		expect(circle?.getAttribute("r")).toBe(String(8 * 1.2));
	});
});
