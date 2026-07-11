import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HelpPage from "./HelpPage";

vi.mock("../components/HelpDocsView", () => ({
  default: ({ embedded }) => (
    <div data-testid="help-docs-view" data-embedded={String(embedded)} />
  ),
}));

describe("HelpPage", () => {
  it("renders HelpDocsView in standalone mode", () => {
    render(<HelpPage />);
    const view = screen.getByTestId("help-docs-view");
    expect(view).toBeInTheDocument();
    expect(view).toHaveAttribute("data-embedded", "false");
  });
});
