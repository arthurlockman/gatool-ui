import helpDocsHtml from "./helpDocsHtml";

/**
 * The help modal renders helpDocsHtml inside an <iframe srcDoc>. Two things
 * need to keep working:
 *   1. Sidebar TOC anchors (#section-id) — browsers do NOT reliably scroll
 *      hash links inside an about:srcdoc iframe, so the bundled HTML must
 *      ship a click interceptor that calls scrollIntoView itself.
 *   2. Any other (absolute) link in the help content must open in a new tab,
 *      otherwise the iframe would navigate to gatool.org and re-render the
 *      whole SPA inside the modal.
 *
 * If the inline script in scripts/sync-help-docs.mjs is removed or the
 * generated section ids drift out of sync with the sidebar hrefs, this
 * test fails.
 */
describe("bundled help docs HTML", () => {
  it("ships an in-iframe click interceptor that handles hash and external links", () => {
    expect(helpDocsHtml).toContain("addEventListener");
    expect(helpDocsHtml).toContain("scrollIntoView");
    expect(helpDocsHtml).toContain("window.open");
    expect(helpDocsHtml).toContain('"_blank"');
  });

  it("has every sidebar anchor pointing to a real section id", () => {
    const navMatch = helpDocsHtml.match(/<nav>([\s\S]*?)<\/nav>/);
    expect(navMatch).not.toBeNull();
    const navHtml = navMatch[1];

    const hrefRegex = /href="#([^"]+)"/g;
    const navHashIds = [];
    let m;
    while ((m = hrefRegex.exec(navHtml)) !== null) {
      navHashIds.push(m[1]);
    }
    expect(navHashIds.length).toBeGreaterThan(0);

    const sectionIds = new Set();
    const idRegex = /<section id="([^"]+)"/g;
    while ((m = idRegex.exec(helpDocsHtml)) !== null) {
      sectionIds.add(m[1]);
    }

    const orphans = navHashIds.filter((id) => !sectionIds.has(id));
    expect(orphans).toEqual([]);
  });

  it("does not contain unsafe relative hrefs that would navigate the iframe to the SPA", () => {
    const hrefRegex = /href="([^"]+)"/g;
    const bad = [];
    let m;
    while ((m = hrefRegex.exec(helpDocsHtml)) !== null) {
      const v = m[1];
      if (v.startsWith("#")) continue;
      if (/^[a-z][a-z0-9+.-]*:/i.test(v)) continue;
      bad.push(v);
    }
    expect(bad).toEqual([]);
  });
});
