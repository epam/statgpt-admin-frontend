# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run start          # Dev server at http://localhost:4100
npm run build          # Production build (all Nx projects)
npm run lint           # Lint all projects
npm run test           # Run tests (passes with no tests)
npm run format         # Check formatting
npm run format:write   # Fix formatting
```

All commands delegate to Nx. To target just the app:

```bash
npx nx serve statgpt-admin-frontend
npx nx test statgpt-admin-frontend
npx nx lint statgpt-admin-frontend
```

## Architecture

**Nx monorepo** with a single Next.js 15 App Router application in `apps/statgpt-admin-frontend/`. The app is an admin dashboard for the AI DIAL/StatGPT platform managing Data Sources, Datasets, Documents, Channels (with glossary terms and jobs), and Audit Logs.

### Two-Tier API Pattern

All API calls are server-side only — no direct browser-to-backend requests:

1. **Server API classes** (`src/server/`): `BaseApi` wraps `fetch` with `get/post/put/delete/streamRequest`. Domain subclasses (`ChannelsApi`, `DataSetsApi`, etc.) call the upstream backend directly using a JWT forwarded as `Authorization: Bearer <token>`. Server Components and Server Actions call these directly.

2. **BFF Route Handlers** (`src/app/api/v1/`): Next.js API routes that Client Components call. These handlers authenticate via `getToken({ req })` from `next-auth/jwt` and delegate to the server API classes.

Long-running operations (export/import) use **RxJS** `interval` + `race` + `timeout` to poll job status every 2 seconds with a 5-minute timeout (`src/server/channels-api.ts`).

### State Management

No global state library. State flows via:

- **React Server Components** for initial page data
- **Server Actions** (`'use server'`) for mutations — defined in `actions.ts` files co-located with routes
- **`NotificationContext`** (`src/context/`) — the only React Context; manages a toast notification queue
- **URL search params** as filter state (Audit Logs) via the `useAuditLogFiltersInUrl` hook
- Local `useState`/`useRef` for component-scoped state

### Key Conventions

- **`@/*` path alias** maps to `apps/statgpt-admin-frontend/*`
- **`force-dynamic`** is exported from all page files to disable Next.js static caching
- **`mergeClasses`** utility (`src/utils/mergeClasses.ts`) wraps `classnames` + `tailwind-merge` — use this instead of `clsx` or manual string concatenation for Tailwind class merging
- **CSS variables for all colors** — Tailwind is configured with `var(--token-name)` tokens; do not hardcode color values
- **SVGs** are imported as React components via `@svgr/webpack`
- **Auth is optional**: if no `AUTH_*` env vars are set, the app runs unauthenticated (`isAuthDisabled = true`)
- **`DISABLE_MENU_ITEMS`** env var hides sidebar items at runtime
- **pino** for server-side structured logging only — never use `console.log` on the server
- **Strict TypeScript**: `strict: true`, `noImplicitAny: true`

### Notable Libraries

- **AG Grid 34** (Community) — all data tables; uses infinite row model for server-paginated data (Audit Logs), client-side row data for smaller lists
- **Monaco Editor** — JSON/YAML config editing in modals
- **NextAuth.js v4** — multi-provider auth (OIDC, Azure AD, Cognito, Keycloak, GitLab); config in `src/utils/auth/auth-providers.ts`
- **React DnD** — drag-and-drop
- **Tailwind CSS 3** + SCSS for styling

### Security

CSP nonces are generated per-request in both `next.config.js` (static headers) and `middleware.ts` (dynamic injection). The middleware wraps NextAuth `withAuth` and injects the nonce into response headers.

### Testing

Jest 30 + `@testing-library/react` v16. Test infrastructure is configured but no test files currently exist. Coverage output goes to `coverage/apps/statgpt-admin-frontend/`.
