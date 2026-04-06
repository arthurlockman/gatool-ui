import { execSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, basename } from "node:path";
import { marked } from "marked";

const repoRoot = process.cwd();
const outputPath = join(repoRoot, "public", "help-docs.html");
const manifestPath = join(repoRoot, "public", "help-wiki-manifest.json");
const wikiRepo = "https://github.com/arthurlockman/gatool-ui.wiki.git";
/** Public raw URLs for each wiki .md file (used when REACT_APP_HELP_LIVE_WIKI=true in the app). */
const wikiRawBaseUrl = "https://raw.githubusercontent.com/wiki/arthurlockman/gatool-ui";

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toWikiLink(pageName) {
  const pageSlug = String(pageName || "").replace(/ /g, "-");
  return `https://github.com/arthurlockman/gatool-ui/wiki/${pageSlug}`;
}

function normalizeForSort(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function pageSortRank(title) {
  const key = normalizeForSort(title);

  if (key === "home") return 0;
  if (key.includes("install") && key.includes("full screen")) return 1;
  if (key.includes("how do i use gatool")) return 2;

  // Tab order from main navigation.
  if (key.includes("setup")) return 10;
  if (key.includes("schedule")) return 11;
  if (key.includes("team")) return 12;
  if (key.includes("rank")) return 13;
  if (key.includes("announce")) return 14;
  if (key.includes("play by play")) return 15;
  if (key.includes("alliance selection")) return 16;
  if (key.includes("award")) return 17;
  if (key.includes("stat")) return 18;
  if (key.includes("cheat sheet")) return 19;
  if (key.includes("emcee")) return 20;

  return 100;
}

function renderDocument(pages) {
  const nav = pages
    .map((p) => `<a href="#${p.anchor}">${p.title}</a>`)
    .join("");

  const sections = pages
    .map(
      (p) => `
      <section id="${p.anchor}">
        <h2>${p.title}</h2>
        <div class="content">${p.html}</div>
        <div class="source">Source: <a href="${p.wikiUrl}" target="_blank" rel="noopener noreferrer">${p.wikiUrl}</a></div>
      </section>
    `
    )
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>gatool Help</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; color: #1d2733; }
    .layout { display: grid; grid-template-columns: 260px 1fr; min-height: 100vh; }
    nav { background: #f3f6fa; border-right: 1px solid #d5dee8; padding: 16px; position: sticky; top: 0; height: 100vh; overflow: auto; }
    nav h1 { font-size: 1.1rem; margin: 0 0 12px; }
    nav a { display: block; color: #1f5fa5; text-decoration: none; padding: 6px 0; font-size: 0.95rem; }
    nav a:hover { text-decoration: underline; }
    main { padding: 18px 24px 60px; max-width: 980px; }
    section { margin-bottom: 40px; border-bottom: 1px solid #e4e8ee; padding-bottom: 24px; }
    section h2 { margin-top: 0; }
    img { max-width: 100%; height: auto; }
    pre { overflow-x: auto; background: #f7f8fa; border: 1px solid #e0e5ec; border-radius: 6px; padding: 10px; }
    code { background: #f7f8fa; padding: 1px 4px; border-radius: 4px; }
    .source { margin-top: 10px; color: #516173; font-size: 0.9rem; }
    @media (max-width: 900px) {
      .layout { grid-template-columns: 1fr; }
      nav { position: static; height: auto; border-right: none; border-bottom: 1px solid #d5dee8; }
      main { padding: 14px; }
    }
  </style>
</head>
<body>
  <div class="layout">
    <nav>
      <h1>gatool Help</h1>
      ${nav}
    </nav>
    <main>
      ${sections}
    </main>
  </div>
</body>
</html>`;
}

function buildFromWiki() {
  const tempRoot = mkdtempSync(join(tmpdir(), "gatool-wiki-"));
  try {
    execSync(`git clone --depth 1 "${wikiRepo}" "${tempRoot}"`, {
      stdio: "pipe",
    });

    const mdFiles = readdirSync(tempRoot)
      .filter((f) => f.endsWith(".md"))
      // Ignore GitHub wiki metadata pages like _Footer/_Sidebar.
      .filter((f) => !basename(f, ".md").startsWith("_"))
      .sort((a, b) => {
        if (a === "Home.md") return -1;
        if (b === "Home.md") return 1;
        return a.localeCompare(b);
      });

    if (mdFiles.length === 0) {
      throw new Error("No markdown pages found in wiki.");
    }

    marked.setOptions({ breaks: true, gfm: true });

    const pages = mdFiles
      .map((filename) => {
        const raw = readFileSync(join(tempRoot, filename), "utf8");
        const title = basename(filename, ".md").replace(/-/g, " ");
        const anchor = slugify(title);
        const html = marked.parse(raw);
        return {
          file: filename,
          title,
          anchor,
          html,
          wikiUrl: toWikiLink(basename(filename, ".md")),
          sortRank: pageSortRank(title),
        };
      })
      .sort((a, b) => {
        if (a.sortRank !== b.sortRank) {
          return a.sortRank - b.sortRank;
        }
        return a.title.localeCompare(b.title);
      });

    const manifest = {
      generatedAt: new Date().toISOString(),
      rawBaseUrl: wikiRawBaseUrl,
      pages: pages.map((p) => ({
        file: p.file,
        title: p.title,
        anchor: p.anchor,
        wikiUrl: p.wikiUrl,
      })),
    };
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

    const doc = renderDocument(pages);
    writeFileSync(outputPath, doc, "utf8");
    const written = readFileSync(outputPath, "utf8");
    if (!written.includes("<section") || !written.includes("gatool Help")) {
      throw new Error("help-docs.html was written but does not look valid.");
    }
    console.log(`Help docs synced from wiki (${pages.length} pages).`);
    console.log(
      "Ship this snapshot: git add public/help-docs.html public/help-wiki-manifest.json && git commit -m \"Update help from wiki\""
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}

function main() {
  try {
    buildFromWiki();
  } catch (error) {
    if (existsSync(outputPath)) {
      console.warn("Wiki sync failed; using existing public/help-docs.html (and help-wiki-manifest.json if present).");
      console.warn(error?.message || error);
      return;
    }
    throw error;
  }
}

main();
