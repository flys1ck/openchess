import { expect, test } from "@playwright/test";

test.use({ storageState: "e2e/.auth/user.json" });

async function move(page, from, to) {
  await page.getByTestId(`square-${from}`).dragTo(page.getByTestId(`square-${to}`), { force: true });
}

test("should load inital position", async ({ page }) => {
  await page.goto("/analysis");
  expect(page.getByLabel("FEN")).toHaveValue("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

  expect(page.locator("cg-container")).toHaveScreenshot();
});

test("should move pieces", async ({ page }) => {
  await page.goto("/analysis");

  await move(page, "f2", "f3");
  await move(page, "e7", "e5");
  await move(page, "g2", "g4");
  await move(page, "d8", "h4");
});
