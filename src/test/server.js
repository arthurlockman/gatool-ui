// Shared MSW node server for vitest. Lifecycle (listen/reset/close) is
// installed in src/test/setup.js so it applies to every test file.
//
// Per-test overrides:
//   import { server } from "./test/server";
//   server.use(http.get("...", () => HttpResponse.json({...})));
import { setupServer } from "msw/node";
import { defaultHandlers } from "./handlers";

export const server = setupServer(...defaultHandlers);
