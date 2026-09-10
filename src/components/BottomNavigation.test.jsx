import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BottomNavigation from "./BottomNavigation";

describe("BottomNavigation footer credits", () => {
  it("credits Northern Force and GoFAR regardless of program", () => {
    render(<BottomNavigation ftcMode={false} />);
    expect(
      screen.getByText("FIRST Robotics Team 172 Northern Force")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Gorham-Falmouth Alliance for Robotics.")
    ).toBeInTheDocument();
  });

  it("does not credit Caster's Tool (feature removed)", () => {
    render(<BottomNavigation ftcMode={false} />);
    expect(screen.queryByText(/Caster's Tool/i)).not.toBeInTheDocument();
  });

  it("credits FRC data sources (TBA, Nexus, Statbotics) for FRC events, chained correctly without Caster's Tool", () => {
    const { container } = render(<BottomNavigation ftcMode={false} />);
    expect(screen.getByText("TBA")).toBeInTheDocument();
    expect(screen.getByText("Nexus")).toBeInTheDocument();
    expect(screen.getByText("Statbotics.io")).toBeInTheDocument();
    // "by TBA, by Nexus, and by Statbotics" — no dangling "by Caster's Tool" left behind
    expect(container.textContent).toContain(", and by");
  });

  it("credits FTC Scout for FTC events instead of the FRC data sources", () => {
    const { container } = render(<BottomNavigation ftcMode={true} />);
    expect(container.textContent).toContain("FTCScoutAPIs");
    expect(screen.queryByText("Nexus")).not.toBeInTheDocument();
    expect(screen.queryByText("Statbotics.io")).not.toBeInTheDocument();
  });

  describe("clicking a footer credit opens its modal", () => {
    it.each([
      ["FIRST Robotics Team 172 Northern Force", "Northern Force"],
      ["Gorham-Falmouth Alliance for Robotics.", "GoFAR"],
      ["TBA", "TBA API"],
      ["Nexus", "Nexus API"],
      ["Statbotics.io", "Statbotics API"],
    ])("%s opens the %s modal", (linkText, title) => {
      render(<BottomNavigation ftcMode={false} />);
      fireEvent.click(screen.getByText(linkText));
      expect(screen.getByTitle(title)).toBeInTheDocument();
    });

    it("FTC Scout credit opens the FTC Scout API modal (ftcMode)", () => {
      const { container } = render(<BottomNavigation ftcMode={true} />);
      // "FTCScoutAPIs" text is split across nested <b>/<i> tags, so target the link span directly
      const links = container.querySelectorAll(".app-footer-link");
      fireEvent.click(links[links.length - 1]);
      expect(screen.getByTitle("FTC Scout API")).toBeInTheDocument();
    });

    it("FIRST credit opens the FIRST API modal for FRC events", () => {
      const { container } = render(<BottomNavigation ftcMode={false} />);
      // "FIRST." text is split across nested <i>/<b> tags, so target the link span directly
      const links = container.querySelectorAll(".app-footer-link");
      fireEvent.click(links[2]);
      expect(screen.getByTitle("FIRST API")).toBeInTheDocument();
    });

    it("FIRST credit opens the FIRST API modal for FTC events", () => {
      const { container } = render(<BottomNavigation ftcMode={true} />);
      const links = container.querySelectorAll(".app-footer-link");
      fireEvent.click(links[2]);
      expect(screen.getByTitle("FIRST API")).toBeInTheDocument();
    });
  });

  it("closes the modal when Close is clicked", () => {
    render(<BottomNavigation ftcMode={false} />);
    fireEvent.click(screen.getByText("Nexus"));
    expect(screen.getByTitle("Nexus API")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /close nexus api/i }));
    expect(screen.queryByTitle("Nexus API")).not.toBeInTheDocument();
  });
});
