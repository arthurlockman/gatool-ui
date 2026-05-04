// Test-only HTTP client. Mirrors the surface of the real AuthClient
// (`get`, `getNoAuth`, `put`, etc.) used by hooks, but skips auth, toasts,
// and operation accounting. Calls real `fetch` so MSW handlers can intercept.
//
// Default base URL matches what production uses: https://api.gatool.org/v3/.
// Pass a custom `baseUrl` if a test wants to point elsewhere.
import { apiBaseUrl as defaultBaseUrl } from "../contextProviders/apiBase";

export function createTestHttpClient({ baseUrl = defaultBaseUrl } = {}) {
  async function doFetch(path, customAPIBaseUrl, init = {}) {
    const url = `${customAPIBaseUrl || baseUrl}${path}`;
    return fetch(url, init);
  }

  return {
    get: (path, _timeout, signal) =>
      doFetch(path, undefined, { signal }),
    getNoAuth: (path, customAPIBaseUrl, _timeout, headers, signal) =>
      doFetch(path, customAPIBaseUrl, { headers, signal }),
    put: (path, body, customAPIBaseUrl) =>
      doFetch(path, customAPIBaseUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    post: (path, body, customAPIBaseUrl) =>
      doFetch(path, customAPIBaseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    postNoAuth: (path, body, customAPIBaseUrl, headers) =>
      doFetch(path, customAPIBaseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(headers || {}) },
        body: JSON.stringify(body),
      }),
    del: (path, customAPIBaseUrl) =>
      doFetch(path, customAPIBaseUrl, { method: "DELETE" }),
    clearInflight: () => {},
  };
}
