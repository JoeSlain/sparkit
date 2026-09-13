# Web workspace

React Router Framework SPA (`ssr: false`) with Vite, React, Tailwind and local shadcn-style primitives. Native code and Expo are intentionally absent. The demo uses real Supabase auth and private task/profile APIs; there is no mock data mode.

From the repository root, copy `apps/web/.env.example` to `apps/web/.env.local`, fill in the local project's publishable key, then run `pnpm dev:web`. Missing configuration renders a setup screen. A public Supabase key may enter the browser; a service-role key must never use a `VITE_` variable.

Package scripts:

- `pnpm --filter @agency/web dev`
- `pnpm --filter @agency/web build`
- `pnpm --filter @agency/web typecheck`
- `pnpm --filter @agency/web test`

All interface messages use Lingui macros and the shared `@agency/i18n` catalogs. Locale preference survives reload; language defaults to the browser's FR/EN preference. Queries include the authenticated user ID, and caches are cancelled and cleared on account changes. Supabase RLS remains the authorization boundary.

## Real browser acceptance

The root command `pnpm test:e2e` reads this project's local Supabase configuration, starts an owned web server, runs the suite, and stops that server. Start local Supabase first with `pnpm db:start`; `WEB_PORT` optionally selects the web port.

For an externally managed web server, start this repository's local Supabase and the configured web development server first. Set server-side test environment variables `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and optionally `PLAYWRIGHT_BASE_URL` (default `http://127.0.0.1:5173`). Run `pnpm --filter @agency/web test:e2e` with Chromium installed through Playwright.

The suite refuses non-local Supabase URLs, provisions unique confirmed users, seeds another user's task through that user's public client, and cleans accounts on completion. It verifies sign-up/sign-in/sign-out, persisted session and profile, CRUD, locale persistence, and user separation through the real UI. Local email confirmation must be disabled. No server is started implicitly by the browser suite, so CI/worktree orchestration can supply its assigned ports.

Unit tests cover configuration validation, auth feedback, private cache clearing, and a stale session restoration race. Unit auth mocks are confined to these tests; E2E never intercepts or mocks the backend.

Static deployment uses `build/client`. Configure the chosen host to serve `index.html` for application routes. No external fonts or analytics are loaded by this template.
