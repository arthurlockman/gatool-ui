#!/usr/bin/env node
/**
 * Fail if any of statements/branches/functions/lines coverage percentage
 * dropped vs. the base branch.
 *
 * Usage: node scripts/check-coverage-not-decreased.mjs <base-summary> <head-summary>
 *
 * A small tolerance is applied to absorb floating-point noise from tiny
 * file-count changes that don't represent real regressions.
 */
import fs from "node:fs";

const TOLERANCE = 0.1; // percentage points
const METRICS = ["statements", "branches", "functions", "lines"];

const [, , basePath, headPath] = process.argv;
if (!basePath || !headPath) {
  console.error("Usage: check-coverage-not-decreased.mjs <base-summary> <head-summary>");
  process.exit(2);
}

const readTotals = (p, label) => {
  if (!fs.existsSync(p)) {
    console.log(`No ${label} coverage summary found at ${p}; skipping check.`);
    return null;
  }
  return JSON.parse(fs.readFileSync(p, "utf8")).total;
};

const base = readTotals(basePath, "base");
const head = readTotals(headPath, "head");
if (!base || !head) process.exit(0);

let failed = false;
const rows = [];
for (const metric of METRICS) {
  const b = base[metric].pct;
  const h = head[metric].pct;
  const delta = h - b;
  const regressed = delta < -TOLERANCE;
  rows.push({ metric, base: b, head: h, delta, regressed });
  if (regressed) failed = true;
}

const fmt = (n) => `${n.toFixed(2)}%`;
const sign = (n) => (n >= 0 ? "+" : "");
console.log("Coverage comparison (base \u2192 head):");
console.log("metric      | base    | head    | \u0394");
console.log("------------|---------|---------|--------");
for (const r of rows) {
  const flag = r.regressed ? " \u274c" : "";
  console.log(
    `${r.metric.padEnd(11)} | ${fmt(r.base).padStart(7)} | ${fmt(r.head).padStart(7)} | ${sign(r.delta)}${r.delta.toFixed(2)}${flag}`
  );
}

if (failed) {
  console.error(
    `\nCoverage regression detected (tolerance ${TOLERANCE} pp). Add tests so coverage does not drop below the base branch.`
  );
  process.exit(1);
}
console.log(`\nNo coverage regression beyond tolerance of ${TOLERANCE} pp.`);
