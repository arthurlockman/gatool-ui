import { defineConfig, transformWithEsbuild } from "vite";
import react from "@vitejs/plugin-react";
import jsconfigPaths from "vite-jsconfig-paths";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Treat all `.js` files under `src/` as JSX so we don't have to mass-rename
// the handful of legacy `.js` files that contain JSX (Handshake, appUpdates,
// fouls/foulsFTC, useNotifications, fetchLocal, generated/helpDocsHtml).
function jsAsJsx() {
  const root = path.resolve(__dirname, "src");
  return {
    name: "treat-src-js-as-jsx",
    enforce: "pre",
    async transform(code, id) {
      if (!id.startsWith(root)) return null;
      if (!id.endsWith(".js")) return null;
      return transformWithEsbuild(code, id, {
        loader: "jsx",
        jsx: "automatic",
      });
    },
  };
}

export default defineConfig({
  plugins: [
    jsAsJsx(),
    react(),
    jsconfigPaths(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "service-worker.js",
      // We register the SW ourselves via src/serviceWorkerRegistration.js,
      // gated by ServiceWorkerContext. Don't let the plugin auto-inject.
      injectRegister: false,
      // We ship our own public/manifest.json — don't generate one.
      manifest: false,
      injectManifest: {
        // Keep precache list in line with what CRA precached: the JS/CSS/HTML
        // build output plus icons/manifest.
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json}"],
        // Some bundles (especially with the help-docs HTML) can exceed the 2MB default.
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
      },
      devOptions: {
        // Don't run the SW in dev — matches CRA behaviour (SW only in prod).
        enabled: false,
      },
    }),
  ],
  // CRA-compat: serve from root, output to build/ (Azure SWA reads build/).
  base: "/",
  server: {
    port: 3000,
    open: false,
  },
  build: {
    outDir: "build",
    emptyOutDir: true,
    sourcemap: true,
    commonjsOptions: {
      // react-quill / quill 1.x mix CJS+ESM; let Rollup interop them.
      transformMixedEsModules: true,
    },
  },
  optimizeDeps: {
    // Pre-bundle Quill so dev import works without manual interop.
    include: ["react-quill", "quill"],
    esbuildOptions: {
      // Some node_modules ship `.js` files containing JSX-ish content; this
      // matches CRA's permissive Babel pipeline.
      loader: { ".js": "jsx" },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/setupTests.js"],
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "json-summary", "lcov"],
      reportsDirectory: "./coverage",
    },
  },
});
