# Implementation plan

Status: core implementation exists; local validation largely closed. Playwright E2E 3/3; Stim iOS sim + Android physical device launch proven; Maestro full sign-in still flaky. First local commit + real worktree cycle remain. Read [HANDOFF.md](HANDOFF.md). Working name `agency-starter`; MIT license.

## Deliverable

A standalone pnpm monorepo and reusable project generator for native mobile, web, or both. Native Expo + Tamagui; React/Vite web; Lingui FR/EN; Supabase Auth/Postgres/Storage; Drizzle SQL authoring; real authenticated profile and private task CRUD examples. No Expo Web.

## Stages

1. Freeze package boundaries, shared APIs, versions and acceptance criteria.
2. Implement backend/schema/RLS and web/native examples in parallel.
3. Integrate Lingui, tooling, environment validation, generator, worktree lifecycle and CI.
4. Run static checks, unit/component tests, migration reconstruction and RLS tests.
5. Run real web E2E against local Supabase; run native builds and UI acceptance on iOS and Android sequentially.
6. Generate clean web-only/mobile-only/both projects and validate installation/build behavior. Record measured results and remaining external prerequisites.

## Acceptance

- Clean install from a checked-in frozen lockfile; lint, format, typecheck and relevant tests succeed.
- Native builds contain no web target. Web-only generation contains no Expo dependencies.
- Sign up/sign in/sign out; auth survives reload; query cache clears between users.
- Profile name update and task create/toggle/delete persist in real Supabase.
- User A cannot read/write user B's rows; anonymous users cannot access private rows. Storage policies are tested.
- FR/EN catalogs compile strictly; both languages are visually checked.
- Migrations rebuild from zero and upgrade deterministically; generated types match the schema.
- E2E scenarios use stable semantic identifiers and deterministic local test accounts.
- Generator validates names, refuses to overwrite directories, excludes secrets/caches/git, and produces independent projects.
- Worktree preparation assigns isolated environment/ports, never targets production, preserves compatible caches, and cleans only owned resources.
- README, license, contributing/security policies, environment examples, CI, release checklist and version-upgrade guidance are present.

## Optional capabilities

Provide clearly gated integration recipes/adapters for Sentry, PostHog, RevenueCat, Resend, notifications, offline, design-ops and heavy-ops. Distinguish automated contract tests from live service tests requiring external accounts. Do not imply paid service validation when credentials are unavailable.

## Resources

One native build and one simulator/emulator at a time. Shared pnpm/build caches; independent dependency installations and branch-local runtime state. Start only this project's local Supabase stack. No EAS cloud build, store submission, remote project creation or publication without a separate release decision.
