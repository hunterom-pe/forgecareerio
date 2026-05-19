import { test, expect } from "@playwright/test";
import { publicRoutes } from "./fixtures/routes";

// Google "Good" thresholds — https://web.dev/vitals/
const THRESHOLDS = {
  ttfb: 800,   // ms  Time to First Byte
  fcp: 1800,   // ms  First Contentful Paint
  lcp: 2500,   // ms  Largest Contentful Paint
  cls: 0.1,    //     Cumulative Layout Shift (unitless score)
};

for (const route of publicRoutes) {
  test(`perf: ${route.name} meets Core Web Vitals thresholds`, async ({ page }) => {
    // Inject observers before the page loads so buffered entries are captured
    await page.addInitScript(() => {
      (window as unknown as Record<string, unknown>).__perf = { lcp: 0, cls: 0 };

      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
        (window as unknown as Record<string, { lcp: number; cls: number }>).__perf.lcp =
          last.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });

      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
          if (!layoutShift.hadRecentInput) {
            (window as unknown as Record<string, { lcp: number; cls: number }>).__perf.cls +=
              layoutShift.value;
          }
        }
      }).observe({ type: "layout-shift", buffered: true });
    });

    await page.goto(route.path, { waitUntil: "networkidle" });
    // Give observers an extra beat to flush any late entries
    await page.waitForTimeout(1000);

    const metrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming;
      const fcpEntry = performance.getEntriesByName("first-contentful-paint")[0];
      const perf = (window as unknown as Record<string, { lcp: number; cls: number }>).__perf;
      return {
        ttfb: nav.responseStart,
        fcp: fcpEntry?.startTime ?? 0,
        lcp: perf.lcp,
        cls: perf.cls,
      };
    });

    expect
      .soft(metrics.ttfb, `TTFB ${metrics.ttfb.toFixed(0)}ms on ${route.path}`)
      .toBeLessThan(THRESHOLDS.ttfb);
    expect
      .soft(metrics.fcp, `FCP ${metrics.fcp.toFixed(0)}ms on ${route.path}`)
      .toBeLessThan(THRESHOLDS.fcp);
    expect
      .soft(metrics.lcp, `LCP ${metrics.lcp.toFixed(0)}ms on ${route.path}`)
      .toBeLessThan(THRESHOLDS.lcp);
    expect
      .soft(metrics.cls, `CLS ${metrics.cls.toFixed(3)} on ${route.path}`)
      .toBeLessThan(THRESHOLDS.cls);

    // Hard fail if all four vitals are zero — indicates the observer script didn't run
    const allZero = metrics.ttfb === 0 && metrics.fcp === 0 && metrics.lcp === 0;
    expect(allZero, "No performance entries collected — page may not have loaded").toBe(false);
  });
}
