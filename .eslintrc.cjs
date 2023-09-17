/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  root: true,
  extends: [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "@vue/eslint-config-typescript",
    "@vue/eslint-config-prettier/skip-formatting",
  ],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "one-var": ["warn", "never"],
  },
  overrides: [
    {
      files: ["src/pages/**/*", "src/layouts/**/*"],
      rules: {
        "vue/multi-word-component-names": [
          "off",
          {
            ignores: [],
          },
        ],
      },
    },
  ],
};
