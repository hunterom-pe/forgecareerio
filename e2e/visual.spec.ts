import { test, expect } from "@playwright/test";
import { publicRoutes } from "./fixtures/routes";

for (const route of publicRoutes) {
  test(`visual: ${route.name} matches snapshot`, async ({ page }) => {
    await page.goto(route.path, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("load");

    await page.evaluate(() => {
      const style = document.createElement("style");
      style.textContent = `*, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }`;
      document.head.appendChild(style);
    });

    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot(`${route.name}.png`, {
      fullPage: true,
    });
  });
}
