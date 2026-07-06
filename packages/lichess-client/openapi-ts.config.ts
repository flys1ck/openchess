import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "https://lichess.org/api/openapi.yaml",
  output: {
    path: "src",
  },
  plugins: [
    // ...other plugins
    {
      name: "@hey-api/sdk",
      operations: {
        strategy: "flat",
        nesting: (operation) => {
          const newName =
            operation.summary
              ?.toLowerCase()
              .replace(/[^a-z0-9 ]/g, "")
              .split(" ")
              .map((word, index) => (index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
              .join("") ||
            operation.operationId ||
            operation.id;
          return [newName];
        },
      },
    },
  ],
});
