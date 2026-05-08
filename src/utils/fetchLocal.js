/**
 * Wrapper around fetch() for local network requests (Cheesy Arena, FTC Offline)
 * that adds consistent timeout handling and error recovery.
 *
 * These requests intentionally skip auth — they target local network devices
 * like http://10.0.100.5:8080 — but still need timeouts so they don't hang
 * indefinitely when the device is unreachable.
 *
 * @param {string} url  — full URL (not a relative path)
 * @param {object} [options]
 * @param {number} [options.timeout=10000]  — timeout in ms (default 10s)
 * @param {AbortSignal} [options.signal]    — caller-supplied abort signal
 * @returns {Promise<Response>}
 */
export async function fetchLocal(url, { timeout = 10000, signal } = {}) {
  const timeoutSignal = AbortSignal.timeout(timeout);
  const combinedSignal = signal
    ? AbortSignal.any([timeoutSignal, signal])
    : timeoutSignal;

  const response = await fetch(url, { signal: combinedSignal });
  return response;
}
