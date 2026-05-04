// Flat ESLint config (ESLint v9). Replaces the old `eslintConfig` block in
// package.json. The strict variant lives in eslint.config.strict.mjs and
// extends this one with extra rules for newly-added/clean files.
import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";

const baseRules = {
  ...react.configs.recommended.rules,
  ...react.configs["jsx-runtime"].rules,
  ...reactHooks.configs.recommended.rules,
  ...jsxA11y.flatConfigs.recommended.rules,
  "react-hooks/exhaustive-deps": "error",
  "react/prop-types": "off",
  "react/no-unescaped-entities": "off",
  "react/display-name": "off",
  "no-unused-vars": "off",
  "no-irregular-whitespace": "off",
  "no-empty": ["error", { allowEmptyCatch: true }],
  "no-compare-neg-zero": "off",
  "no-unsafe-optional-chaining": "off",
  "jsx-a11y/click-events-have-key-events": "off",
  "jsx-a11y/no-static-element-interactions": "off",
  "jsx-a11y/no-noninteractive-element-interactions": "off",
  "jsx-a11y/interactive-supports-focus": "off",
  "jsx-a11y/tabindex-no-positive": "off",
  "jsx-a11y/label-has-associated-control": "off",
  "jsx-a11y/no-autofocus": "off",
  "unused-imports/no-unused-imports": "error",
  "unused-imports/no-unused-vars": [
    "warn",
    {
      vars: "all",
      varsIgnorePattern: "^_",
      args: "after-used",
      argsIgnorePattern: "^_",
      caughtErrors: "none",
    },
  ],
};

const plugins = {
  react,
  "react-hooks": reactHooks,
  "jsx-a11y": jsxA11y,
  "unused-imports": unusedImports,
};

const settings = { react: { version: "detect" } };

const languageOptions = {
  ecmaVersion: 2022,
  sourceType: "module",
  parserOptions: { ecmaFeatures: { jsx: true } },
  globals: {
    ...globals.browser,
    ...globals.node,
    ...globals.es2022,
  },
};

export default [
  {
    ignores: [
      "build/**",
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "public/**",
      "infra/**",
      "infra-cdk/**",
      "src/generated/**",
    ],
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: "off",
    },
  },
  js.configs.recommended,
  {
    files: ["src/**/*.{js,jsx}"],
    languageOptions,
    settings,
    plugins,
    rules: baseRules,
  },
  {
    files: ["**/*.test.{js,jsx}", "src/setupTests.js"],
    languageOptions: {
      ...languageOptions,
      globals: {
        ...languageOptions.globals,
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        vi: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
      },
    },
  },
  {
    files: ["src/service-worker.js"],
    languageOptions: {
      ...languageOptions,
      globals: {
        ...globals.browser,
        ...globals.serviceworker,
        self: "readonly",
      },
    },
  },
  {
    files: ["scripts/**/*.mjs", "vite.config.js", "*.config.js", "*.config.mjs"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.node },
    },
  },
];
