import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getPublicUrl,
  getHelpDocsUrl,
  getHelpWikiManifestUrl,
  useHelpLiveWiki,
} from "./helpDocsUrl";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getPublicUrl", () => {
  it("prepends a leading slash when the path has none", () => {
    vi.stubEnv("BASE_URL", "/");
    expect(getPublicUrl("foo.html")).toBe("/foo.html");
  });

  it("preserves an existing leading slash", () => {
    vi.stubEnv("BASE_URL", "/");
    expect(getPublicUrl("/foo.html")).toBe("/foo.html");
  });

  it("uses BASE_URL as the base when set to a sub-path", () => {
    vi.stubEnv("BASE_URL", "/app");
    expect(getPublicUrl("/foo.html")).toBe("/app/foo.html");
  });

  it("strips a trailing slash from BASE_URL", () => {
    vi.stubEnv("BASE_URL", "/app/");
    expect(getPublicUrl("/foo.html")).toBe("/app/foo.html");
  });

  it("treats unset BASE_URL as root '/'", () => {
    vi.stubEnv("BASE_URL", "");
    expect(getPublicUrl("/foo.html")).toBe("/foo.html");
  });
});

describe("getHelpDocsUrl", () => {
  it("returns /help-docs.html under the public base", () => {
    vi.stubEnv("BASE_URL", "/");
    expect(getHelpDocsUrl()).toBe("/help-docs.html");
    vi.stubEnv("BASE_URL", "/app");
    expect(getHelpDocsUrl()).toBe("/app/help-docs.html");
  });
});

describe("getHelpWikiManifestUrl", () => {
  it("returns /help-wiki-manifest.json under the public base", () => {
    vi.stubEnv("BASE_URL", "/");
    expect(getHelpWikiManifestUrl()).toBe("/help-wiki-manifest.json");
  });
});

describe("useHelpLiveWiki", () => {
  it("is true only when VITE_HELP_LIVE_WIKI is exactly 'true'", () => {
    vi.stubEnv("VITE_HELP_LIVE_WIKI", "true");
    expect(useHelpLiveWiki()).toBe(true);
  });

  it("is false for any other value or unset", () => {
    vi.stubEnv("VITE_HELP_LIVE_WIKI", "TRUE");
    expect(useHelpLiveWiki()).toBe(false);
    vi.stubEnv("VITE_HELP_LIVE_WIKI", "1");
    expect(useHelpLiveWiki()).toBe(false);
    vi.stubEnv("VITE_HELP_LIVE_WIKI", "");
    expect(useHelpLiveWiki()).toBe(false);
  });
});
