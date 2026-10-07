# Decisions

Durable choices and the reason for each. `AGENTS.md` states the rules; this file explains them. Reverse
a decision only with the user's agreement, then update the entry rather than deleting it.

## Stack

- **pnpm workspaces, pinned versions.** Reproducible installs from one root lockfile. Do not switch
  package managers without proving Metro, EAS and worktrees still work.
- **Expo native only, no Expo Web.** Web is a separate React + Vite + React Router app built as a static
  SPA, so hosting needs no Node server.
- **Tamagui 2 via `@tamagui/core` and `@tamagui/stacks` only.** The umbrella `tamagui` package pulls
  `@tamagui/popper`, which imports `flushSync` from `react-dom` and breaks mobile-only projects. The
  `react-dom` peer warning on mobile is expected.
- **Lingui only**, English source and French catalogs.
- **Expo peer pins.** Reanimated, Worklets and Metro config are pinned to the versions Expo supports,
  not the newer peers pnpm would pick. Check the manifests before bumping.

## Data

- **Real Supabase** for Auth, Postgres and Storage. Acceptance tests never use a mocked successful
  backend.
- **Drizzle writes table definitions; the Supabase CLI is the only migration runner.** Never rewrite a
  published migration; add a new one.
- **One full Supabase stack per worktree**, not a shared Postgres with one database per branch: Auth,
  PostgREST, Storage and their URLs must be isolated too.
- **No silent fallback to stale keys.** If the local stack status cannot be read, fail loudly.

## Scope and release

- **Optional integrations are gated recipes.** Sentry, PostHog, RevenueCat, Resend, notifications and
  offline stay off and send no traffic without explicit configuration. Do not describe them as live.
- **No automatic publication.** No deployments, EAS cloud builds, store submissions, paid accounts or
  package publishing without a separate release decision.
- **MIT license, independent starter.** It must not depend on any private project.
