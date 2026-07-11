// Vitest setup: jest-dom matchers + MSW server lifecycle.
//
// Wired via `test.setupFiles` in vite.config.js.

// Node 25+ exposes a global `localStorage` object without working methods unless
// `--localstorage-file` is set. jsdom inherits that broken object, which breaks
// localforage ("No available storage method found"). Install a real in-memory
// implementation before any app code touches storage.
function createMemoryLocalStorage() {
  const store = new Map();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key) {
      const k = String(key);
      return store.has(k) ? store.get(k) : null;
    },
    key(index) {
      return [...store.keys()][index] ?? null;
    },
    removeItem(key) {
      store.delete(String(key));
    },
    setItem(key, value) {
      store.set(String(key), String(value));
    },
  };
}

function installLocalStoragePolyfill() {
  const current = globalThis.localStorage;
  const needsPolyfill = !current || typeof current.setItem !== "function";
  if (!needsPolyfill) return;

  const storage = createMemoryLocalStorage();
  Object.defineProperty(globalThis, "localStorage", {
    value: storage,
    configurable: true,
    writable: true,
  });
  if (typeof window !== "undefined") {
    Object.defineProperty(window, "localStorage", {
      value: storage,
      configurable: true,
      writable: true,
    });
  }
}

installLocalStoragePolyfill();

import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./server";

beforeAll(() => {
  server.listen({ onUnhandledRequest: "warn" });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
