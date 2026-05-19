import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { publicRoutes } from "./fixtures/routes";

for (const route of publicRoutes) {
  test(`a11y: ${route.name} has no serious or critical violations`, async ({ page }) => {
    await page.goto(route.path, { waitUntil: "domcontentloaded" });
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
    await page.waitForLoadState("load");
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const seriousOrCritical = results.violations.filter((v) =>
      v.impact === "serious" || v.impact === "critical",
    );

    if (seriousOrCritical.length > 0) {
      const report = seriousOrCritical
        .map((v) => `[${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node${v.nodes.length === 1 ? "" : "s"})\n  ${v.helpUrl}`)
        .join("\n\n");
      console.log(`\nA11y violations on ${route.path}:\n${report}`);
    }

    expect(seriousOrCritical).toEqual([]);
  });
}
