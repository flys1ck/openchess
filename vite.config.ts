import Vue from "@vitejs/plugin-vue";
import VueRouter from "unplugin-vue-router/vite";
import { defineConfig } from "vite-plus";
import ClientSideLayout from "vite-plugin-vue-layouts";

// https://vitejs.dev/config/
export default defineConfig({
  lint: {
    plugins: ["typescript"],
    env: {
      builtin: true,
    },
    ignorePatterns: [".vscode", "dist", "pnpm-lock.yaml", "src-tauri", "src/*.d.ts", "src-python", "test-results"],
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
  },
  fmt: {
    printWidth: 120,
    trailingComma: "es5",
    sortTailwindcss: {},
    sortPackageJson: false,
    ignorePatterns: [".vscode", "dist", "pnpm-lock.yaml", "src-tauri", "src/*.d.ts", "src-python", "test-results"],
  },
  plugins: [
    VueRouter({
      dts: "./src/typed-router.d.ts",
    }),
    ClientSideLayout(),
    Vue({
      script: {
        defineModel: true,
      },
    }),
  ],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  // prevent vite from obscuring rust errors
  clearScreen: false,
  // tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
  },
  // to make use of `TAURI_DEBUG` and other env variables
  // https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
  envPrefix: ["VITE_", "TAURI_", "STOCKFISH_"],
  build: {
    // Tauri supports es2021
    target: process.env.TAURI_PLATFORM == "windows" ? "chrome105" : "safari15",
    // don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,
  },
  resolve: {
    tsconfigPaths: true,
  },
});
