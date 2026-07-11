import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchLocal } from "./fetchLocal";

describe("fetchLocal", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls fetch with the full URL and returns the response", async () => {
    const mockResponse = { ok: true, status: 200 };
    fetch.mockResolvedValue(mockResponse);

    const result = await fetchLocal("http://10.0.100.5:8080/api/rankings");

    expect(fetch).toHaveBeenCalledWith(
      "http://10.0.100.5:8080/api/rankings",
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
    expect(result).toBe(mockResponse);
  });

  it("passes a combined abort signal when the caller supplies one", async () => {
    const caller = new AbortController();
    fetch.mockResolvedValue({ ok: true });

    await fetchLocal("http://10.0.100.5:8080/api/alliances", {
      signal: caller.signal,
      timeout: 5000,
    });

    const { signal } = fetch.mock.calls[0][1];
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(signal.aborted).toBe(false);
  });

  it("propagates fetch rejections", async () => {
    const err = new TypeError("Failed to fetch");
    fetch.mockRejectedValue(err);

    await expect(
      fetchLocal("http://10.0.100.5:8080/api/matches/playoff")
    ).rejects.toThrow("Failed to fetch");
  });
});
