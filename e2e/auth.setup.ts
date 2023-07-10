import { test as setup } from "@playwright/test";

const authFile = "e2e/.auth/user.json";

setup("should authenticate", async ({ page }) => {
  // mock tauri
  page.addInitScript(() => {
    window.__TAURI_METADATA__ = {
      __windows: ["main"].map((label) => ({ label })),
      __currentWindow: { label: "main" },
    };
  });

  await page.goto("/signin");

  await page.getByLabel("Email address").fill(process.env.PLAYWRIGHT_USER);
  await page.getByLabel("Password").fill(process.env.PLAYWRIGHT_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.waitForURL("/analysis");

  await page.context().storageState({ path: authFile });
});
