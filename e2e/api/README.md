# API Contract Tests

A layer below the browser-driven Playwright E2E suite: hits HTTP endpoints
directly and validates response **shape** against Zod schemas in
[`schemas/index.ts`](./schemas/index.ts). Catches frontend/backend schema
drift (e.g. backend renames `userId` → `user_id`) before it reaches the UI
suite, where the same break shows up as a confusing UI failure two layers
removed from the cause.

## What's covered

| Suite | What it checks | Auth needed |
| --- | --- | --- |
| `auth.spec.ts` | `/api/auth/register` input validation: bad email, weak password, empty body | no |
| `protected-routes.spec.ts` | Every protected route returns `401 { error }` when unauthenticated | no |
| `user-usage.spec.ts` | `/api/user/usage` response matches `UsageResponseSchema` | yes |
| `jobs.spec.ts` | `/api/jobs/tracked` shape; `/api/jobs/update-status` 400 paths | yes |

Authed suites skip automatically when `TEST_USER_EMAIL` /
`TEST_USER_PASSWORD` are not set, so the no-auth contract sweep still
runs in any environment.

## Running locally

```sh
# Unauthenticated checks only (against local dev server)
npm run test:e2e:api

# Full suite against a deployed preview
TEST_USER_EMAIL=qa@example.com \
TEST_USER_PASSWORD=... \
PLAYWRIGHT_BASE_URL=https://deploy-preview-123--forgecareer.netlify.app \
npm run test:e2e:api
```

The test user must already exist in the target environment's database.
Create one once with `POST /api/auth/register` against a non-prod DB; do
not run authed tests against production unless you have a dedicated
seeded account.

## Why a separate project (not a folder under `e2e/`)?

Playwright's `api` project (see `playwright.config.ts`) has no browser
dependency, so the suite installs and runs in seconds in CI — distinct
from the browser E2E job, with its own pass/fail signal on PRs. When a
contract drifts you get an isolated failure pointing at the API layer,
not a Playwright trace from the page that happened to consume the field.
