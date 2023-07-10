import { expect, test } from "@playwright/test";

test("should open sign in page", async ({ page }) => {
  await page.goto("/");
  const title = page.getByRole("heading", { name: "Sign in to your account" });

  expect(title).toBeVisible();
});

test("should fail sign in with empty values", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Sign in" }).click();
});

test("should sign in with email and password", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Email").fill(process.env.PLAYWRIGHT_USER);
  await page.getByLabel("Password").fill(process.env.PLAYWRIGHT_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL("/analysis");
});

test("should sign in with Google OAuth", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Google" }).click();

  await expect(page).toHaveURL(/https:\/\/accounts\.google\.com\/v3\/signin*/);
});
