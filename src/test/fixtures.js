// Loads JSON fixtures committed under src/test/fixtures/ for use by MSW handlers.
//
// The capture script (scripts/capture-fixtures.sh) writes one file per
// endpoint, named after a stable slug (e.g. `2026-events.json`,
// `2026-MAWOR-schedule-qual.json`). Fixtures missing from disk are surfaced
// as a clear error so tests fail fast instead of mysteriously 404'ing.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURE_DIR = path.resolve(__dirname, "fixtures");

const cache = new Map();

export function loadFixture(slug) {
  if (cache.has(slug)) return cache.get(slug);
  const file = path.join(FIXTURE_DIR, `${slug}.json`);
  if (!fs.existsSync(file)) {
    throw new Error(
      `Fixture not found: ${slug}.json (looked in ${FIXTURE_DIR}). ` +
        `Run scripts/capture-fixtures.sh to regenerate.`
    );
  }
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  cache.set(slug, data);
  return data;
}

export function fixtureExists(slug) {
  return fs.existsSync(path.join(FIXTURE_DIR, `${slug}.json`));
}

export function fixturePath(slug) {
  return path.join(FIXTURE_DIR, `${slug}.json`);
}
