import { defineConfig } from "oxfmt";

export default defineConfig({
  printWidth: 120,
  trailingComma: "es5",
  sortTailwindcss: {},
  sortPackageJson: false,
  ignorePatterns: [".vscode", "dist", "src-tauri", "src/*.d.ts", "src-python", "test-results"],
});
