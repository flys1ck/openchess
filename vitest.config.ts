import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    include: ["src/**/*.spec.ts", "packages/openchess-extension/src/**/*.spec.ts"],
  },
});
