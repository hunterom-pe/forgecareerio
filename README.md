# Forge

**Forge** is an AI-powered job search and application-management platform that helps candidates find roles, tailor their materials, track their pipeline, and prepare for every stage of the hiring process. It is a full-stack Next.js application with subscription billing, authenticated workflows, and Gemini-backed AI features.

Production site: [forgecareer.io](https://forgecareer.io)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Subscription Tiers](#subscription-tiers)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [Testing](#testing)
- [Observability](#observability)
- [Deployment](#deployment)

---

## Overview

Forge replaces the spray-and-pray job hunt with an intelligent, end-to-end workflow:

1. **Find** — Search for matching roles, scored against the candidate's resume.
2. **Track** — Manage applications through a Kanban-style pipeline (Wishlist → Applied → Interview → Offer / Rejected).
3. **Optimize** — Generate tailored resume bullets and summaries for each role using Google Gemini.
4. **Prepare** — Produce interview briefs, follow-up emails, and negotiation playbooks on demand.
5. **Learn** — Use the Intelligence dashboard to spot patterns in matches and rejections.

## Features

### Job Discovery
- Resume-aware search with cached results (`SearchCache` model) to avoid redundant API spend.
- Match-score ranking against the candidate's profile.

### Application Tracker
- Drag-and-drop Kanban board (`@hello-pangea/dnd`).
- Statuses, rejection reasons/notes, save/delete, apply-link tracking.

### AI Workflows (Gemini)
- **Resume Optimization** — tailored summaries and bullet points per job.
- **Interview Brief** — company/role-specific prep document.
- **Follow-up Generator** — context-aware follow-up emails.
- **Negotiation Playbook** — tier-gated negotiation guidance.
- **Intelligence** — aggregate insight across the user's pipeline.

### Document Handling
- Resume upload to S3 (`@aws-sdk/client-s3`).
- DOCX parsing (`mammoth`) and generation (`docx`, `docx-templates`, `docxtemplater`, `pizzip`).

### Account & Billing
- Email/password auth via NextAuth + Prisma adapter, with bcrypt-hashed credentials.
- Stripe Checkout for subscriptions, Stripe Customer Portal for management, webhook-driven tier sync.
- Per-tier monthly usage counters (optimizations / briefs / scans) with automatic monthly resets.

### Transactional Email
- Sent via Resend (verification, support replies, billing notifications).

### Marketing & Legal Pages
- Landing page, pricing, support, privacy, terms, custom `not-found` and `error` boundaries.
- Sitemap, robots, OpenGraph image, theme-aware UI (`next-themes`).

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 16** (App Router) on **React 19** |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4, `tailwind-merge`, `clsx`, `framer-motion`, `lucide-react` |
| Auth | NextAuth 4 + `@next-auth/prisma-adapter`, bcryptjs |
| Database | PostgreSQL via Prisma 6 |
| AI | `@google/generative-ai` (Gemini) |
| Payments | Stripe (Checkout, Customer Portal, webhooks) |
| Storage | AWS S3 |
| Email | Resend |
| Validation | Zod 4 |
| Data fetching | SWR |
| Documents | docx, docx-templates, docxtemplater, mammoth, pizzip |
| Monitoring | Sentry (Next.js SDK) |
| Testing | Playwright + `@axe-core/playwright`, Lighthouse CI |

> **Note:** This project uses Next.js 16 + React 19. APIs and conventions may differ from older versions — consult `node_modules/next/dist/docs/` before changing framework-level code.

## Architecture

```
┌────────────────────────────────────────────────────────────┐
│  Next.js App Router (src/app)                              │
│                                                            │
│  ├── Marketing  (/, /pricing, /support, /privacy, /terms)  │
│  ├── Auth       (/login, /onboarding)                      │
│  ├── Dashboard  (/dashboard/{applications,intelligence,    │
│  │              interviews,profile})                       │
│  └── API Routes (/api/*)                                   │
│      ├── auth/[...nextauth], auth/register                 │
│      ├── jobs/{search, tracked, update-status,             │
│      │        intelligence, interview-brief,               │
│      │        follow-up, negotiation-playbook, reset}      │
│      ├── user/{onboard, resume, usage, update-password}    │
│      ├── upload, support, debug                            │
│      ├── checkout, create-portal-session                   │
│      └── webhooks/stripe                                   │
└─────────────┬──────────────────────────────────────────────┘
              │
   ┌──────────┼─────────────────────────────────────────────┐
   ▼          ▼                  ▼                ▼         ▼
PostgreSQL  Gemini API     AWS S3           Stripe       Resend
(Prisma)    (AI features)  (resumes/docs)   (billing)    (email)
              │
              ▼
            Sentry (errors, perf — server, edge, client)
```

`src/lib` centralizes service clients: `prisma.ts`, `gemini.ts`, `stripe.ts`, `email.ts`, `usage.ts`, `password.ts`, `utils.ts`, plus `NotificationContext.tsx` for in-app toasts.

## Subscription Tiers

Defined by the `Tier` enum in [prisma/schema.prisma](prisma/schema.prisma) and gated by `src/lib/usage.ts`:

| Tier | Price | Notes |
|---|---|---|
| **SEEKER** | $0 | Free entry tier — limited monthly optimizations/briefs/scans. |
| **ELITE** | $15 / mo | Expanded AI usage and tracker capacity. |
| **PROFESSIONAL** | $29 / mo | Full feature set including negotiation playbook. |

Usage counters (`optimizationCount`, `briefCount`, `scanCount`) reset monthly via `lastResetDate`. Tier transitions are driven by Stripe webhooks at `/api/webhooks/stripe`.

## Getting Started

### Prerequisites

- Node.js 20+
- A PostgreSQL database (local or hosted; the schema uses `directUrl`, compatible with Supabase / Neon pooled setups)
- Accounts/credentials for: Stripe, Google AI Studio (Gemini), AWS S3, Resend, Sentry (optional in dev)

### Install

```bash
npm install
```

### Configure

Create a `.env` file (see [Environment Variables](#environment-variables) below).

### Initialize the database

```bash
npx prisma generate
npx prisma migrate dev
```

### Run the dev server

```bash
npm run dev
```

Open <http://localhost:3000>.

## Environment Variables

The application reads the following variables (names inferred from `schema.prisma`, `src/lib/*`, and config files):

```bash
# Database
DATABASE_URL=postgresql://...        # pooled connection
DIRECT_URL=postgresql://...          # direct connection (used by Prisma migrate)

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...

# Google Gemini
GOOGLE_GENERATIVE_AI_API_KEY=...

# Stripe
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
STRIPE_ELITE_MONTHLY_PRICE_ID=...
STRIPE_ELITE_QUARTERLY_PRICE_ID=...
STRIPE_ELITE_YEARLY_PRICE_ID=...
STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID=...
STRIPE_PROFESSIONAL_QUARTERLY_PRICE_ID=...
STRIPE_PROFESSIONAL_YEARLY_PRICE_ID=...

# AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=...
AWS_S3_BUCKET=...

# Resend
RESEND_API_KEY=...

# Sentry
SENTRY_DSN=...
NEXT_PUBLIC_SENTRY_DSN=...
```

Confirm exact variable names against `src/lib/*.ts` before deploying — some integrations may accept alternate naming.

## Database

The Prisma schema includes:

- **User** — profile, hashed password, tier, monthly usage counters, resume path.
- **Account / Session / VerificationToken** — NextAuth tables.
- **Job** — tracked applications with match scores, optimized resume content, and rejection metadata.
- **SearchCache** — `(query, location)`-keyed JSON cache of search results.

Common Prisma commands:

```bash
npx prisma studio              # browse data
npx prisma migrate dev         # create + apply migrations
npx prisma migrate deploy      # apply migrations in production
npx prisma generate            # regenerate client
```

## Project Structure

```
forge-v1/
├── src/
│   ├── app/                  # Next.js App Router pages + API routes
│   │   ├── api/              # Route handlers (auth, jobs, user, stripe, ...)
│   │   ├── dashboard/        # Authenticated app surface
│   │   ├── login/ onboarding/ pricing/ support/ privacy/ terms/
│   │   ├── layout.tsx        # Root layout (fonts, providers, metadata)
│   │   ├── page.tsx          # Marketing landing page
│   │   ├── error.tsx / global-error.tsx / not-found.tsx
│   │   └── sitemap.ts / robots.ts
│   ├── components/
│   │   ├── ui/               # Reusable primitives
│   │   ├── dashboard/        # Dashboard-specific components
│   │   ├── DashboardLayoutClient.tsx
│   │   ├── Providers.tsx     # NextAuth session provider
│   │   └── ThemeProvider.tsx
│   ├── lib/                  # Service clients & shared helpers
│   ├── instrumentation.ts    # Sentry server/edge init
│   └── instrumentation-client.ts
├── prisma/
│   └── schema.prisma
├── e2e/                      # Playwright suites (smoke, visual, a11y, perf, security)
├── public/                   # Static assets
├── scripts/
│   └── generate_test_resume.ts
├── sentry.server.config.ts
├── sentry.edge.config.ts
├── playwright.config.ts
├── lighthouserc.json
├── next.config.ts
└── tsconfig.json
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Next.js dev server. |
| `npm run build` | Production build. |
| `npm run start` | Run the built app. |
| `npm run lint` | ESLint. |
| `npm run type-check` | `tsc --noEmit` — strict type pass. |
| `npm run test:e2e` | Full Playwright suite. |
| `npm run test:e2e:ui` | Playwright UI runner. |
| `npm run test:e2e:smoke` | Smoke tests only. |
| `npm run test:e2e:visual` | Visual regression. |
| `npm run test:e2e:visual:update` | Refresh visual snapshots. |
| `npm run test:e2e:a11y` | Accessibility (axe-core). |
| `npm run test:e2e:perf` | Performance suite. |
| `npm run test:e2e:security` | Security suite. |
| `npm run test:e2e:report` | Open the last HTML report. |

## Testing

E2E coverage lives in [`e2e/`](e2e/) and is split by concern:

- **smoke.spec.ts** — core happy-path flows.
- **visual.spec.ts** — pixel snapshots for the marketing surface and dashboard.
- **a11y.spec.ts** — `@axe-core/playwright` audits.
- **perf.spec.ts** — Lighthouse / perf budgets (`lighthouserc.json`).
- **security.spec.ts** — auth, headers, and access-control checks.

See [e2e/README.md](e2e/README.md) for fixture and config details.

## Observability

- Sentry is wired for server, edge, and client runtimes via `instrumentation.ts`, `instrumentation-client.ts`, `sentry.server.config.ts`, and `sentry.edge.config.ts`.
- Errors and performance traces are reported using `@sentry/nextjs`.

## Deployment

The app is built for Vercel-class platforms:

1. Provision PostgreSQL and apply migrations (`npx prisma migrate deploy`).
2. Configure all environment variables from the section above.
3. Configure the Stripe webhook endpoint to point at `/api/webhooks/stripe` and store the resulting signing secret as `STRIPE_WEBHOOK_SECRET`.
4. Verify Sentry DSNs and source-map uploads.
5. Deploy. Run `npm run test:e2e:smoke` against the deployed URL as a post-deploy gate.

---

© Forge. All rights reserved.
