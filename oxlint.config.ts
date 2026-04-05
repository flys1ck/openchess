import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["typescript", "vitest", "vue"],
  env: {
    builtin: true,
  },
  ignorePatterns: [".vscode", "dist", "src-tauri", "src/*.d.ts", "src-python", "test-results"],
  rules: {
    "no-console": [
      "warn",
      {
        allow: ["warn", "error"],
      },
    ],
    "no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
      },
    ],
  },
  options: {},
});
