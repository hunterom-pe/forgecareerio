# Playwright E2E suite

Browser tests for careerhunter.io. Three layers:

- `smoke.spec.ts` — every public route returns 2xx, renders, and has no console errors
- `visual.spec.ts` — full-page screenshot diff against committed baselines
- `a11y.spec.ts` — axe-core scan, fails on `serious` or `critical` violations

## Local

```bash
npm run test:e2e           # all tests, spins up `next dev` automatically
npm run test:e2e:ui        # interactive UI mode
npm run test:e2e:smoke     # smoke only
npm run test:e2e:a11y      # a11y only
```

## Visual snapshots

Baselines are platform-specific. Generate them in the same OS the CI uses (Linux). The recommended flow:

```bash
# Update baselines in CI (preferred): trigger the workflow with `update-snapshots` input
# Locally (only if you're on Linux or want Mac baselines for local dev):
npm run test:e2e:visual:update
```

Snapshots live next to the spec at `e2e/visual.spec.ts-snapshots/`. Commit them.

## CI

`.github/workflows/playwright.yml` runs on every PR. It waits for the Netlify deploy preview, then runs Playwright against that URL. Required repo secret: `NETLIFY_SITE_ID` (Netlify site UUID, found at Site → Site configuration → Site information).

## Targeting a custom URL

```bash
PLAYWRIGHT_BASE_URL=https://deploy-preview-42--careerhunter.netlify.app npm run test:e2e:smoke
```

When `PLAYWRIGHT_BASE_URL` is set, Playwright skips starting `next dev` and just hits that URL.
