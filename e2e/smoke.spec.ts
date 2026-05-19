import { test, expect, type ConsoleMessage } from "@playwright/test";
import { publicRoutes } from "./fixtures/routes";

const IGNORED_CONSOLE_PATTERNS = [
  /Download the React DevTools/i,
  /\[Fast Refresh\]/i,
  /\[HMR\]/i,
  /app\.netlify\.com/i,
];

for (const route of publicRoutes) {
  test.describe(`smoke: ${route.name}`, () => {
    test(`${route.path} responds 2xx and renders without console errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (msg: ConsoleMessage) => {
        if (msg.type() !== "error") return;
        const text = msg.text();
        if (IGNORED_CONSOLE_PATTERNS.some((p) => p.test(text))) return;
        errors.push(text);
      });
      page.on("pageerror", (err) => errors.push(err.message));

      const response = await page.goto(route.path, { waitUntil: "domcontentloaded" });
      expect(response, `no response for ${route.path}`).not.toBeNull();
      expect(response!.status(), `bad status for ${route.path}`).toBeLessThan(400);

      await expect(page).toHaveTitle(/.+/);
      await expect(page.locator("body")).toBeVisible();

      if (route.expectedHeading) {
        await expect(
          page.getByRole("heading", { name: route.expectedHeading }).first(),
        ).toBeVisible();
      }

      expect(errors, `console errors on ${route.path}:\n${errors.join("\n")}`).toEqual([]);
    });
  });
}

test("404 page returns 404 status", async ({ page }) => {
  const response = await page.goto("/this-route-does-not-exist", {
    waitUntil: "domcontentloaded",
  });
  expect(response?.status()).toBe(404);
});
