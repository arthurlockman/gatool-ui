#!/usr/bin/env node
/**
 * Publish Vite sourcemaps to New Relic Browser.
 *
 * New Relic matches a sourcemap to an error by the exact deployed javascriptUrl,
 * so every filename is verified against the live site before upload. A miss means
 * this build's content hashes diverged from what Cloudflare Pages deployed
 * (most likely the wiki sync in `prebuild` produced different help-doc content),
 * and uploading would silently create dead entries.
 *
 * Verification asserts a JavaScript content-type, not just a 200: Cloudflare Pages
 * serves the SPA fallback (200 + text/html) for unknown paths, so status alone
 * would pass for every nonexistent asset.
 *
 * Usage:
 *   node scripts/publish-sourcemaps.mjs \
 *     --base-url=https://gatool.org \
 *     --application-id=1431858641 \
 *     --api-key="$NR_API_KEY" [--dry-run]
 */
import { appendFileSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { parseArgs } from "node:util";
import { publishSourcemap } from "@newrelic/publish-sourcemap";

const { values } = parseArgs({
  options: {
    "build-dir": { type: "string", default: "build" },
    "base-url": { type: "string" },
    "application-id": { type: "string" },
    "api-key": { type: "string" },
    "repo-url": { type: "string" },
    "build-commit": { type: "string" },
    "verify-timeout": { type: "string", default: "300" }, // seconds
    "dry-run": { type: "boolean", default: false },
  },
});

const buildDir = values["build-dir"];
const apiKey = values["api-key"] || process.env.NR_API_KEY;
const applicationId = values["application-id"] || process.env.APPLICATION_ID;
const baseUrl = (values["base-url"] || "").replace(/\/+$/, "");
const verifyTimeout = Number(values["verify-timeout"]);
const dryRun = values["dry-run"];

for (const [name, value] of Object.entries({
  "--base-url": baseUrl,
  "--application-id": applicationId,
  // A dry run only verifies deployed filenames; it never talks to New Relic.
  ...(dryRun ? {} : { "--api-key": apiKey }),
})) {
  if (!value) {
    console.error(`Missing required option ${name}`);
    process.exit(1);
  }
}

const MAX_MAP_BYTES = 50 * 1024 * 1024; // New Relic hard limit
const CONCURRENCY = 5;
const FOLLOWUP_VERIFY_MS = 30_000;
const JS_CONTENT_TYPE = /(java|ecma)script/i;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith(".js.map")) out.push(full);
  }
  return out;
}

const maps = walk(buildDir)
  .map((sourcemapPath) => {
    const rel = relative(buildDir, sourcemapPath).split(sep).join("/");
    return {
      sourcemapPath,
      rel,
      javascriptUrl: `${baseUrl}/${rel.replace(/\.map$/, "")}`,
      size: statSync(sourcemapPath).size,
    };
  })
  .sort((a, b) => a.rel.localeCompare(b.rel));

if (maps.length === 0) {
  console.error(`No .js.map files under ${buildDir}/ — was the build run with SOURCEMAP=hidden?`);
  process.exit(1);
}
console.log(`Found ${maps.length} sourcemap(s) in ${buildDir}/`);

/**
 * HEAD the deployed asset, retrying to wait out an in-flight Cloudflare deploy.
 * Cloudflare Pages answers 200 with index.html for unknown paths, so a non-JS
 * content-type counts as "not deployed".
 */
async function verify(url, deadline) {
  let delay = 5000;
  for (;;) {
    try {
      const res = await fetch(url, { method: "HEAD", redirect: "follow" });
      if (res.ok && JS_CONTENT_TYPE.test(res.headers.get("content-type") || "")) return true;
    } catch {
      // Network blip — fall through and retry until the deadline.
    }
    if (Date.now() >= deadline) return false;
    await new Promise((resolve) => setTimeout(resolve, delay));
    delay = Math.min(delay * 2, 30_000);
  }
}

async function pool(items, limit, fn) {
  const results = [];
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const index = next++;
        results[index] = await fn(items[index]);
      }
    }),
  );
  return results;
}

// Probe the deploy with the entry chunk from index.html. It embeds application
// source, so its hash changes on every commit — meaning its URL only resolves
// once Cloudflare has published *this* build. Vendor chunks hash off
// node_modules alone and unhashed files like service-worker.js exist on every
// deploy, so either would pass instantly against the previous deploy and
// silently defeat this gate.
const entryHref = readFileSync(join(buildDir, "index.html"), "utf8").match(
  /<script[^>]+type="module"[^>]+src="\/([^"]+\.js)"/,
)?.[1];
const probe = entryHref && maps.find((m) => m.rel === `${entryHref}.map`);
if (!probe) {
  console.error(
    `Could not identify the entry chunk sourcemap from ${buildDir}/index.html — refusing to ` +
      `verify against a chunk that may be unchanged since the previous deploy.`,
  );
  process.exit(1);
}

console.log(`Waiting for deploy of ${probe.javascriptUrl} …`);
if (!(await verify(probe.javascriptUrl, Date.now() + verifyTimeout * 1000))) {
  const entryFile = probe.rel.replace(/\.map$/, "");
  console.error(
    [
      `Entry chunk ${entryFile} never appeared at ${baseUrl} within ${verifyTimeout}s.`,
      ``,
      `Either the Cloudflare Pages deploy hasn't finished — re-run once it has — or this`,
      `build's content hashes diverged from the deployed build, in which case a re-run`,
      `cannot help: \`prebuild\` (scripts/sync-help-docs.mjs) re-clones the GitHub wiki at`,
      `HEAD each time, so if the wiki changed after Cloudflare built, every subsequent`,
      `build drifts further. That case needs a fresh push to rebuild both sides.`,
      ``,
      `Check the Cloudflare Pages deployment for this commit before retrying.`,
    ].join("\n"),
  );
  process.exit(1);
}

// The probe resolved, so the deploy is live and the rest only need a short grace period.
const verified = await pool(
  maps.filter((m) => m !== probe),
  CONCURRENCY,
  async (m) => ({ ...m, ok: await verify(m.javascriptUrl, Date.now() + FOLLOWUP_VERIFY_MS) }),
);
verified.push({ ...probe, ok: true });
verified.sort((a, b) => a.rel.localeCompare(b.rel));

const missing = verified.filter((m) => !m.ok);
const tooBig = verified.filter((m) => m.ok && m.size > MAX_MAP_BYTES);
const publishable = verified.filter((m) => m.ok && m.size <= MAX_MAP_BYTES);

/** Status code from whichever layer produced the error (superagent sets .status). */
function errorStatus(err) {
  return err?.status ?? err?.response?.status ?? err?.response?.statusCode;
}

function describeError(err) {
  const status = errorStatus(err);
  const message = err?.message || "";
  if (message && status) return `${message} (HTTP ${status})`;
  if (message) return message;
  if (status) return `HTTP ${status}`;
  return String(err);
}

/** Transient conditions worth a retry. Other 4xx will fail again identically. */
function isRetryable(status) {
  return status === 429 || (status >= 500 && status < 600);
}

async function upload(m) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await new Promise((resolve, reject) =>
        publishSourcemap(
          {
            sourcemapPath: m.sourcemapPath,
            javascriptUrl: m.javascriptUrl,
            applicationId,
            apiKey,
            repoUrl: values["repo-url"],
            buildCommit: values["build-commit"],
          },
          (err) => (err ? reject(err) : resolve()),
        ),
      );
      return { ...m, uploaded: true };
    } catch (err) {
      lastError = err;
      const status = errorStatus(err);
      // 409 means New Relic already has a sourcemap for this javascriptUrl.
      // Asset URLs are content-hashed, so an existing entry was built from
      // identical bytes and is already correct. Vendor chunks hash off
      // node_modules alone, so they keep their filename across commits and
      // conflict on every deploy that doesn't bump a dependency — that is the
      // normal steady state, not a failure.
      if (status === 409) return { ...m, alreadyPresent: true };
      if (status !== undefined && !isRetryable(status)) break;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
    }
  }
  return { ...m, uploaded: false, error: describeError(lastError) };
}

const uploaded = dryRun
  ? publishable.map((m) => ({ ...m, uploaded: true }))
  : await pool(publishable, CONCURRENCY, upload);

const alreadyPresent = uploaded.filter((m) => m.alreadyPresent);
const failed = uploaded.filter((m) => !m.uploaded && !m.alreadyPresent);
const succeeded = uploaded.filter((m) => m.uploaded).length;

// --- report ---
const lines = [
  `## New Relic sourcemap upload${dryRun ? " (dry run)" : ""}`,
  ``,
  `- Base URL: \`${baseUrl}\``,
  `- Application ID: \`${applicationId}\``,
  `- Uploaded: **${succeeded}/${maps.length}**`,
];
if (alreadyPresent.length) {
  lines.push(
    `- Already in New Relic (unchanged since a previous deploy): **${alreadyPresent.length}**`
  );
}
if (tooBig.length) lines.push(`- Skipped (>50MB): ${tooBig.map((m) => m.rel).join(", ")}`);
if (missing.length) {
  lines.push(
    ``,
    `### ❌ Not found on the deployed site`,
    ``,
    `The entry chunk verified, so this build matches the deployed one — but these`,
    `individual chunks are missing at \`${baseUrl}\`. That usually means a partial or`,
    `still-propagating deploy rather than a hash mismatch, so a re-run should clear it.`,
    ``,
    ...missing.map((m) => `- \`${m.rel}\``),
  );
}
if (failed.length) {
  lines.push(``, `### ❌ Upload failed`, ``, ...failed.map((m) => `- \`${m.rel}\`: ${m.error}`));
}

const report = lines.join("\n");
console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${report}\n`);
}

process.exit(missing.length || failed.length ? 1 : 0);
