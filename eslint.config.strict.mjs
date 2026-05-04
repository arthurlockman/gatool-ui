// Strict ESLint config — extends the base with complexity / max-lines /
// max-depth / max-params / max-nested-callbacks. Used by
// scripts/lint-changed.mjs to hold *new* code (and any previously-clean
// file) to a higher bar without forcing a giant cleanup PR.
import baseConfig from "./eslint.config.mjs";

export default [
  ...baseConfig,
  {
    files: ["src/**/*.{js,jsx}"],
    rules: {
      complexity: ["error", { max: 20 }],
      "max-lines-per-function": [
        "error",
        { max: 250, skipBlankLines: true, skipComments: true, IIFEs: true },
      ],
      "max-depth": ["error", { max: 4 }],
      "max-params": ["error", { max: 6 }],
      "max-nested-callbacks": ["error", { max: 4 }],
    },
  },
  {
    files: ["**/*.test.{js,jsx}"],
    rules: {
      "max-lines-per-function": "off",
      "max-nested-callbacks": "off",
    },
  },
];
