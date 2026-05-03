import {
  getPublicUrl,
  getHelpDocsUrl,
  getHelpWikiManifestUrl,
  useHelpLiveWiki,
} from "./helpDocsUrl";

describe("getPublicUrl", () => {
  const originalPublicUrl = process.env.PUBLIC_URL;
  afterEach(() => {
    process.env.PUBLIC_URL = originalPublicUrl;
  });

  it("prepends a leading slash when the path has none", () => {
    process.env.PUBLIC_URL = "";
    expect(getPublicUrl("foo.html")).toBe("/foo.html");
  });

  it("preserves an existing leading slash", () => {
    process.env.PUBLIC_URL = "";
    expect(getPublicUrl("/foo.html")).toBe("/foo.html");
  });

  it("uses PUBLIC_URL as the base when set", () => {
    process.env.PUBLIC_URL = "/app";
    expect(getPublicUrl("/foo.html")).toBe("/app/foo.html");
  });

  it("strips a trailing slash from PUBLIC_URL", () => {
    process.env.PUBLIC_URL = "/app/";
    expect(getPublicUrl("/foo.html")).toBe("/app/foo.html");
  });

  it("treats unset PUBLIC_URL as empty base", () => {
    delete process.env.PUBLIC_URL;
    expect(getPublicUrl("/foo.html")).toBe("/foo.html");
  });
});

describe("getHelpDocsUrl", () => {
  const originalPublicUrl = process.env.PUBLIC_URL;
  afterEach(() => {
    process.env.PUBLIC_URL = originalPublicUrl;
  });

  it("returns /help-docs.html under the public base", () => {
    process.env.PUBLIC_URL = "";
    expect(getHelpDocsUrl()).toBe("/help-docs.html");
    process.env.PUBLIC_URL = "/app";
    expect(getHelpDocsUrl()).toBe("/app/help-docs.html");
  });
});

describe("getHelpWikiManifestUrl", () => {
  const originalPublicUrl = process.env.PUBLIC_URL;
  afterEach(() => {
    process.env.PUBLIC_URL = originalPublicUrl;
  });

  it("returns /help-wiki-manifest.json under the public base", () => {
    process.env.PUBLIC_URL = "";
    expect(getHelpWikiManifestUrl()).toBe("/help-wiki-manifest.json");
  });
});

describe("useHelpLiveWiki", () => {
  const original = process.env.REACT_APP_HELP_LIVE_WIKI;
  afterEach(() => {
    process.env.REACT_APP_HELP_LIVE_WIKI = original;
  });

  it("is true only when the env var is exactly the string 'true'", () => {
    process.env.REACT_APP_HELP_LIVE_WIKI = "true";
    expect(useHelpLiveWiki()).toBe(true);
  });

  it("is false for any other value or unset", () => {
    process.env.REACT_APP_HELP_LIVE_WIKI = "TRUE";
    expect(useHelpLiveWiki()).toBe(false);
    process.env.REACT_APP_HELP_LIVE_WIKI = "1";
    expect(useHelpLiveWiki()).toBe(false);
    delete process.env.REACT_APP_HELP_LIVE_WIKI;
    expect(useHelpLiveWiki()).toBe(false);
  });
});
