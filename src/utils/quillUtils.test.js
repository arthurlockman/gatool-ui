import { describe, it, expect } from "vitest";
import { htmlToPlainText, normalizeQuillHtml } from "./quillUtils";

// ---------------------------------------------------------------------------
// htmlToPlainText
// ---------------------------------------------------------------------------

describe("htmlToPlainText", () => {
    it("returns empty string for falsy input", () => {
        expect(htmlToPlainText("")).toBe("");
        expect(htmlToPlainText(null)).toBe("");
        expect(htmlToPlainText(undefined)).toBe("");
    });

    it("strips basic HTML tags", () => {
        expect(htmlToPlainText("<p>Hello world</p>")).toBe("Hello world");
    });

    it("decodes &nbsp; entities to plain spaces", () => {
        expect(htmlToPlainText("<p>Hello&nbsp;world</p>")).toBe("Hello world");
    });

    it("decodes Unicode non-breaking spaces (\\u00a0) to plain spaces", () => {
        expect(htmlToPlainText("<p>Hello\u00a0world</p>")).toBe("Hello world");
    });

    it("treats &nbsp; and \\u00a0 as equivalent to a regular space", () => {
        const withNbsp = htmlToPlainText("<p>Hello&nbsp;world</p>");
        const withUnicode = htmlToPlainText("<p>Hello\u00a0world</p>");
        const withSpace = htmlToPlainText("<p>Hello world</p>");
        expect(withNbsp).toBe(withSpace);
        expect(withUnicode).toBe(withSpace);
    });

    it("collapses multiple whitespace characters into a single space", () => {
        expect(htmlToPlainText("<p>Hello   world</p>")).toBe("Hello world");
    });

    it("trims leading and trailing whitespace", () => {
        expect(htmlToPlainText("<p>  Hello world  </p>")).toBe("Hello world");
    });

    it("handles nested tags", () => {
        expect(htmlToPlainText("<p><strong>Bold</strong> and <em>italic</em></p>")).toBe(
            "Bold and italic"
        );
    });

    it("handles list items", () => {
        const html = "<ul><li>Item one</li><li>Item two</li></ul>";
        const text = htmlToPlainText(html);
        expect(text).toContain("Item one");
        expect(text).toContain("Item two");
    });

    it("handles br tags by treating them as whitespace", () => {
        const text = htmlToPlainText("<p>Line one<br>Line two</p>");
        // Both words should be present; whitespace normalisation merges them
        expect(text).toContain("Line one");
        expect(text).toContain("Line two");
    });

    it("handles content with &nbsp; throughout (Quill v2 regression case)", () => {
        // Simulates stored data where Quill v2 inserted &nbsp; between every word
        const stored = "<p>Team&nbsp;from&nbsp;Michigan&nbsp;competes&nbsp;well</p>";
        const rendered = "<p>Team from Michigan competes well</p>";
        expect(htmlToPlainText(stored)).toBe(htmlToPlainText(rendered));
    });

    it("handles Quill v2 empty editor value", () => {
        expect(htmlToPlainText("<p><br></p>")).toBe("");
    });

    it("handles Quill v2 minimal empty paragraph", () => {
        expect(htmlToPlainText("<p></p>")).toBe("");
    });

    it("decodes &amp; entities", () => {
        expect(htmlToPlainText("<p>R&amp;D team</p>")).toBe("R&D team");
    });

    it("returns empty string for a string of only whitespace tags", () => {
        expect(htmlToPlainText("<p> </p>")).toBe("");
    });
});

// ---------------------------------------------------------------------------
// normalizeQuillHtml
// ---------------------------------------------------------------------------

describe("normalizeQuillHtml", () => {
    it("returns empty string for null", () => {
        expect(normalizeQuillHtml(null)).toBe("");
    });

    it("returns empty string for undefined", () => {
        expect(normalizeQuillHtml(undefined)).toBe("");
    });

    it("returns empty string for empty string", () => {
        expect(normalizeQuillHtml("")).toBe("");
    });

    it("normalises Quill v2 empty editor <p><br></p> to empty string", () => {
        expect(normalizeQuillHtml("<p><br></p>")).toBe("");
    });

    it("normalises Quill v2 empty editor <p></p> to empty string", () => {
        expect(normalizeQuillHtml("<p></p>")).toBe("");
    });

    it("passes through non-empty HTML unchanged", () => {
        const html = "<p>Some <strong>rich</strong> content</p>";
        expect(normalizeQuillHtml(html)).toBe(html);
    });

    it("passes through HTML with lists unchanged", () => {
        const html = "<ul><li>Item</li></ul>";
        expect(normalizeQuillHtml(html)).toBe(html);
    });

    it("does not alter HTML that happens to contain a <br> mid-content", () => {
        const html = "<p>Line one<br>Line two</p>";
        expect(normalizeQuillHtml(html)).toBe(html);
    });
});

// ---------------------------------------------------------------------------
// Integration: change-detection parity
// The core use-case is that htmlToPlainText(currentQuillOutput) ===
// htmlToPlainText(storedHtml) when the user has not changed the content,
// regardless of how Quill v2 internally serialises the HTML.
// ---------------------------------------------------------------------------

describe("change-detection parity", () => {
    it("reports no change when stored data has &nbsp; and Quill output has regular spaces", () => {
        const stored = "<p>Notes&nbsp;about&nbsp;this&nbsp;team</p>";
        const quillOutput = "<p>Notes about this team</p>";
        expect(htmlToPlainText(stored)).toBe(htmlToPlainText(quillOutput));
    });

    it("reports no change when stored data has \\u00a0 and Quill output has &nbsp;", () => {
        const stored = "<p>Notes\u00a0about\u00a0this\u00a0team</p>";
        const quillOutput = "<p>Notes&nbsp;about&nbsp;this&nbsp;team</p>";
        expect(htmlToPlainText(stored)).toBe(htmlToPlainText(quillOutput));
    });

    it("detects a genuine text change", () => {
        const stored = "<p>Original notes</p>";
        const quillOutput = "<p>Updated notes</p>";
        expect(htmlToPlainText(stored)).not.toBe(htmlToPlainText(quillOutput));
    });

    it("reports no change when both sides are empty variants", () => {
        expect(htmlToPlainText(normalizeQuillHtml("<p><br></p>"))).toBe(
            htmlToPlainText(normalizeQuillHtml(""))
        );
    });

    it("detects a change from empty to non-empty", () => {
        const stored = "";
        const quillOutput = "<p>New content</p>";
        expect(htmlToPlainText(normalizeQuillHtml(stored))).not.toBe(
            htmlToPlainText(normalizeQuillHtml(quillOutput))
        );
    });
});
