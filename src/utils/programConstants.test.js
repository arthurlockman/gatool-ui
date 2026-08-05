import {
  ftcBaseURL,
  fgBaseURL,
  getApiBaseUrl,
  isFirstGlobalMode,
  getTeamUpdatesBaseUrl,
  isFtcLayout,
} from "./programConstants";

describe("programConstants", () => {
  describe("getApiBaseUrl", () => {
    it("returns undefined for FRC mode (ftcMode false/null)", () => {
      expect(getApiBaseUrl(false)).toBeUndefined();
      expect(getApiBaseUrl(null)).toBeUndefined();
    });

    it("returns the FTC base URL for FTC Online mode", () => {
      expect(getApiBaseUrl({ value: "FTCOnline", label: "FTC Online" })).toBe(
        ftcBaseURL
      );
    });

    it("returns the FIRST Global base URL for FIRST Global mode", () => {
      expect(
        getApiBaseUrl({ value: "FIRSTGlobal", label: "FIRST Global" })
      ).toBe(fgBaseURL);
    });
  });

  describe("isFirstGlobalMode", () => {
    it("is true only when ftcMode.value is FIRSTGlobal", () => {
      expect(isFirstGlobalMode({ value: "FIRSTGlobal" })).toBe(true);
      expect(isFirstGlobalMode({ value: "FTCOnline" })).toBe(false);
      expect(isFirstGlobalMode(false)).toBe(false);
      expect(isFirstGlobalMode(null)).toBe(false);
    });
  });

  describe("getTeamUpdatesBaseUrl", () => {
    it("returns undefined for FRC mode", () => {
      expect(getTeamUpdatesBaseUrl(false)).toBeUndefined();
    });

    it("returns the FTC base URL for both FTC and FIRST Global modes", () => {
      expect(getTeamUpdatesBaseUrl({ value: "FTCOnline" })).toBe(ftcBaseURL);
      expect(getTeamUpdatesBaseUrl({ value: "FIRSTGlobal" })).toBe(ftcBaseURL);
    });
  });

  describe("isFtcLayout", () => {
    it("is false for FRC and FIRST Global, true for FTC", () => {
      expect(isFtcLayout(false)).toBe(false);
      expect(isFtcLayout(null)).toBe(false);
      expect(isFtcLayout({ value: "FIRSTGlobal" })).toBe(false);
      expect(isFtcLayout({ value: "FTCOnline" })).toBe(true);
      expect(isFtcLayout({ value: "FTCLocal" })).toBe(true);
    });
  });
});
