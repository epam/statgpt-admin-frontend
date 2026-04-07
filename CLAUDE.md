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

Build output: `dist/apps/statgpt-admin-frontend/`

## Architecture

**Nx monorepo** with a single Next.js 15 App Router application in `apps/statgpt-admin-frontend/`. The app is an admin dashboard for the AI DIAL/StatGPT platform managing Data Sources, Datasets, Documents, Channels (with glossary terms and jobs), and Audit Logs.

### Route Structure

- `/` — redirects to `/data-sources`
- `/data-sources`, `/data-sets`, `/documents`, `/channels` — CRUD list views
- `/channels/[id]` — channel detail (client component using `useParams`)
- `/channels/[id]/glossary`, `/channels/[id]/jobs` — nested channel sub-views
- `/audit-logs` — audit log viewer with date range filtering
- `/api/auth/[...nextauth]` — NextAuth provider
- `/api/health` — health check
- `/api/v1/*` — BFF route handlers mirroring backend entities

Each route group has a co-located `actions.ts` file for Server Actions (mutations).

### Two-Tier API Pattern

All API calls are server-side only — no direct browser-to-backend requests:

1. **Server API classes** (`src/server/`): `BaseApi` wraps `fetch` with `get/post/put/delete/streamRequest`. Domain subclasses (`ChannelsApi`, `DataSetsApi`, `DataSourcesApi`, `DocumentsApi`, `AuditLogsApi`) call the upstream backend directly using a JWT forwarded as `Authorization: Bearer <token>`. Server Components and Server Actions call these directly.

2. **BFF Route Handlers** (`src/app/api/v1/`): Next.js API routes that Client Components call. These handlers authenticate via `getToken({ req })` from `next-auth/jwt` and delegate to the server API classes.

Long-running operations (export/import) use **RxJS** `interval` + `race` + `timeout` to poll job status every 2 seconds with a 5-minute timeout (`src/server/channels-api.ts`).

### Component Organization

- **`src/components/BaseComponents/`** — 28 reusable UI primitives (Button, Input, Modal, ConfirmDialog, Dropdown with autocomplete, DatePicker, Loader, Field variants, LoadFileArea, Multiselect, etc.)
- **`src/components/`** (top-level) — feature components: ListView, GridView (AG Grid wrapper), ChannelView, JobsView, TermsView, AuditLogs, AddDataSet/AddDataSourceModal/AddChannelsModal/AddDocument (multi-step flows), Configuration, Editor (Monaco), Menu, Header, Breadcrumbs
- AG Grid column definitions live in `src/constants/columns/`; grid filter helpers in `src/utils/client/grid.ts`

### Domain Models

All domain models in `src/models/` extend `BaseEntity` (`id`, `title`, `description`, `created_at`, `updated_at`). `BaseEntityWithDetails` adds `details` + `preprocessing_status`. The `src/types/` directory contains only `PopUpState` enum for modal state.

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
- **Dynamic routes** use `'use client'` with `useParams()` from `next/navigation`
- **Routing constants** defined via `Menu` and `MenuUrl` enums in `src/constants/menu.ts`

### Notable Libraries

- **AG Grid 34** (Community) — all data tables; uses infinite row model for server-paginated data (Audit Logs), client-side row data for smaller lists. Default page size: 100.
- **Monaco Editor** — JSON/YAML config editing in modals
- **NextAuth.js v4** — multi-provider auth (OIDC, Azure AD, Cognito, Keycloak, GitLab, Okta, Auth0, Google); config in `src/utils/auth/auth-providers.ts`
- **React DnD** — drag-and-drop
- **Tailwind CSS 3** + SCSS for styling

### Environment Variables

Required: `API_URL`, `DIAL_API_URL`, `NEXTAUTH_SECRET` (for auth). Optional: `NEXTAUTH_URL` (production), `DIAL_API_KEY` (if JWT not configured), `DISABLE_MENU_ITEMS`. Auth providers are configured via `AUTH_<PROVIDER>_*` env vars (Azure AD, Google, Auth0, GitLab, Keycloak, Okta).

### Security

CSP nonces are generated per-request in both `next.config.js` (static headers) and `middleware.ts` (dynamic injection). The middleware wraps NextAuth `withAuth` and injects the nonce into response headers. Known CVEs in the base Docker image (`node:24-alpine`) are tracked in `.trivyignore`.

### Testing

Jest 30 + `@testing-library/react` v16. Test infrastructure is configured but no test files currently exist. Coverage output goes to `coverage/apps/statgpt-admin-frontend/`.
