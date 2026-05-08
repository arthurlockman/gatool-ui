#!/usr/bin/env node
/**
 * Runs the strict ESLint config (.eslintrc.strict.json) against the .js / .jsx
 * files changed in the current PR — but skips files that are listed in
 * .eslint-strict-baseline.json (legacy files known to violate the strict
 * rules). The strict config layers complexity / max-lines-per-function /
 * max-depth / max-params / max-nested-callbacks on top of the base config
 * so we hold *new* code (and any previously-clean file) to the higher bar
 * without forcing a giant cleanup PR.
 *
 * Adding a brand-new file? It must pass strict.
 * Modifying a baseline file? Strict rules don't run on it (touching the
 *   file does not unlock more legacy debt — but if you reduce its violations
 *   to zero, please remove it from the baseline).
 *
 * Base ref resolution:
 *   - In GitHub Actions PRs: GITHUB_BASE_REF (e.g. "main")
 *   - Locally: pass as first arg, default to "origin/main"
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const baseRefArg = process.argv[2];
const baseRef = baseRefArg
    || (process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}` : "origin/main");

function git(...args) {
    return execFileSync("git", args, { cwd: repoRoot, encoding: "utf8" }).trim();
}

let changed;
try {
    const out = git("diff", "--name-only", "--diff-filter=ACMR", `${baseRef}...HEAD`);
    changed = out.split("\n").filter(Boolean);
} catch (err) {
    console.error(`Could not diff against ${baseRef}: ${err.message}`);
    console.error("Make sure the base ref is fetched (e.g. fetch-depth: 0 in GitHub Actions).");
    process.exit(1);
}

const baselinePath = path.join(repoRoot, ".eslint-strict-baseline.json");
const baseline = new Set(JSON.parse(readFileSync(baselinePath, "utf8")));

const lintable = changed.filter(f =>
    (f.endsWith(".js") || f.endsWith(".jsx"))
    && f.startsWith("src/")
    && existsSync(path.join(repoRoot, f)) // skip deleted files
    && !baseline.has(f)                   // skip grandfathered legacy files
);

const skippedBaseline = changed.filter(f => baseline.has(f));
if (skippedBaseline.length > 0) {
    console.log(`Skipping ${skippedBaseline.length} baseline file(s) (pre-existing violations):`);
    skippedBaseline.forEach(f => console.log(`  ${f}`));
}

if (lintable.length === 0) {
    console.log(`No new / clean changed JS/JSX files in src/ vs ${baseRef}; skipping strict lint.`);
    process.exit(0);
}

console.log(`Running strict ESLint on ${lintable.length} changed file(s):`);
lintable.forEach(f => console.log(`  ${f}`));

const result = spawnSync(
    process.platform === "win32" ? "npx.cmd" : "npx",
    [
        "eslint",
        "--config", "eslint.config.strict.mjs",
        "--no-warn-ignored",
        "--max-warnings=0",
        ...lintable
    ],
    { cwd: repoRoot, stdio: "inherit" }
);

process.exit(result.status ?? 1);

