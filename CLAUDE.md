# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev              # Start dev server (Vite HMR)

# Build
npm run build            # Production build (uses 4GB Node heap for heavy bundle)
npm run preview          # Preview production build locally

# Type checking
npm run check            # svelte-kit sync + svelte-check
npm run check:watch      # Watch mode type checking

# Linting & formatting
npm run lint             # Prettier check + ESLint
npm run format           # Auto-format with Prettier

# Testing
npm run test:unit        # Vitest (browser + server environments)
npm run test:e2e         # Playwright E2E tests
npm run test             # Both unit and E2E

# Component development
npm run storybook        # Storybook on port 6006
```

To run a single Vitest test file: `npx vitest run src/path/to/file.spec.ts`

## Architecture

### Overview

Full-stack SvelteKit 2 + Svelte 5 (Runes) portfolio with an embedded Admin CRM. Deployed on Vercel (Node.js 22.x, Singapore region). Backend uses Firebase Admin SDK; frontend uses Firebase Client SDK.

### Svelte 5 Rules (Non-negotiable)

- **Always use Runes**: `$state()`, `$derived()`, `$effect()`, `$props()`. Never use `export let` or `$:` reactive statements.
- Shared reactive state lives in `.svelte.ts` class files (e.g., `src/lib/stores/auth.svelte.ts` uses a class with `$state` fields).
- TypeScript-first: `<script lang="ts">` in all components. No `any` — use `unknown` + Zod refinement for external data.

### Data Layer (Repository Pattern)

`src/lib/server/` is the entire server domain — never import from here in `.svelte` files or `+page.ts`.

```
src/lib/server/
├── core/
│   ├── base.repository.ts   # Generic Firestore CRUD (BaseRepository<T>)
│   └── base.service.ts      # Base service class
├── repositories/            # One file per Firestore collection
├── services/                # Business logic; compose repositories
├── firebase/
│   └── firebase.server.ts   # Firebase Admin SDK initialization
├── schemas/                 # Zod schemas for runtime validation
├── middleware/              # rate-limit.ts
├── config/env.ts            # Typed env var access
└── utils/                   # logger, cache, markdown, firestore helpers
```

Repositories extend `BaseRepository<T>` which provides `create`, `findAll`, `findById`, `update`, `upsert`, `delete`, `findWithQuery`. Firestore Timestamps are automatically converted to `Date` in `toPOJO()`.

### Firebase Setup (Two SDKs)

- **Client**: `src/lib/firebase/firebase.client.ts` — Firebase JS SDK for browser auth and real-time features. Uses `VITE_FIREBASE_*` env vars.
- **Server**: `src/lib/server/firebase/firebase.server.ts` — Firebase Admin SDK for trusted server operations. Uses `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`.

### Server Hooks (`src/hooks.server.ts`)

Middleware runs in this sequence via `sequence()`:

1. **Vercel Flags** — feature flag evaluation
2. **Security Headers** — CSP, HSTS, X-Frame-Options, etc.
3. **Paraglide** — i18n locale detection (URL → cookie → base locale), injects `%paraglide.lang%`
4. **Visitor Tracking** — Tracks new visitors (geo, UA, path) via `visitor_log` cookie; skips `/admin`, `/api`, assets, and build time
5. **Auth** — Verifies `__session` cookie via Firebase Admin; populates `event.locals.user`
6. **Admin Guard** — Redirects to `/auth/login` if unauthenticated or email ≠ `OWNER_EMAIL`
7. **Public API** — Validates `x-api-key` header for `/api/public` routes

### Route Structure

```
src/routes/
├── +page.svelte             # Landing page (hero, work, blog, world sections)
├── about/                   # Interactive about page (GSAP animations, Matter.js physics)
├── admin/                   # Protected CRM (auth required + owner email check)
│   ├── projects/            # CRUD for portfolio projects
│   ├── blog/                # Blog post management
│   ├── journey/             # Career timeline management
│   ├── skills/ techstack/ socials/
│   ├── contacts/            # Inbox for contact form submissions
│   ├── analytics/           # Visitor statistics
│   └── monitoring/          # System health / error logs
├── api/                     # REST endpoints
│   ├── admin/               # Admin-only API (auth guarded)
│   └── (public routes)      # contact, blog, icons, journey, og
├── auth/login/              # Firebase Google sign-in
└── world/                   # Standalone Three.js 3D globe page
```

### i18n (Paraglide JS)

Source messages: `messages/en.json` and `messages/id.json`. Generated runtime at `src/lib/paraglide/` (do not edit generated files). Strategy: URL prefix → cookie → base locale (`en`).

Regenerate after editing messages:

```bash
npx paraglide-js compile --project ./project.inlang --outdir ./src/lib/paraglide
```

### UI Components

- `src/lib/components/ui/` — shadcn-svelte-style primitives, each with an `index.ts` re-export. Built on `bits-ui`.
- `src/lib/components/guest/` — Feature sections organized by guest page area (`hero/`, `work/`, `blog/`, `world/`, `contact/`).
- Styling: Tailwind CSS v4 (vite plugin, no `tailwind.config.js`). `tailwind-variants` for component variants. `clsx` + `tailwind-merge` for conditional classes.

### File Storage

Admin CRM uploads use **GitHub as a CDN** via `src/lib/server/services/github-storage.service.ts` (Octokit). Images are committed to a GitHub repo and served via raw URLs. Requires `GITHUB_ACCESS_TOKEN`, `GITHUB_USERNAME`, `GITHUB_REPO`.

### Feature Flags

Vercel flags integration: declare flags in `src/lib/flags.ts`, evaluated server-side in hooks. Requires `FLAGS_SECRET` env var.

### Testing Setup

Vitest runs two projects simultaneously:

- **browser** (Chromium via Playwright): matches `*.svelte.{test,spec}.{js,ts}`. Several heavy components are mocked (hero, folded-world, etc.) via `vite.config.ts` aliases.
- **server** (Node): matches `*.{test,spec}.{js,ts}` excluding svelte spec files.

### Build Chunking

Manual Rollup chunks defined in `vite.config.ts`: `lottie`, `firebase`, `animation` (gsap + matter-js), `three`. Build requires `node --max-old-space-size=4096` due to bundle size.

## Environment Variables

Copy `.env.example` to `.env`. Required groups:

- **Firebase Admin**: `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`
- **Firebase Client**: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`
- **Auth**: `OWNER_EMAIL` (only this email can access `/admin`), `FLAGS_SECRET`
- **GitHub Storage**: `GITHUB_ACCESS_TOKEN`, `GITHUB_USERNAME`, `GITHUB_REPO`
- **AI**: `GOOGLE_GEMINI_API_KEY`
- **Public**: `PUBLIC_CONTACT_EMAIL`, `PUBLIC_IMAGE_CDN_URL`

## Aliases

`@/*` → `src/*`, `@lib/*` → `src/lib/*` (configured in both `svelte.config.js` and used alongside SvelteKit's native `$lib`).
