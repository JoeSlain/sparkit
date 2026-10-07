# Sparkit

Independent open-source starter. Work only in this repository and its explicitly created worktrees.

## Architecture

- Expo is native iOS/Android only. No Expo Web or universal routing.
- Web and native both use Tamagui 2 (`@tamagui/core` + `@tamagui/stacks`). Web may use `react-native-web` only as Tamagui's renderer, never Expo Web.
- Web uses React + Vite + React Router. Native uses Expo Router.
- Lingui is the only translation system; English source and French catalogs.
- pnpm workspaces with pinned versions; root owns installation and the lockfile.
- Supabase is real data/auth. Never replace acceptance tests with a mocked successful backend.
- Drizzle owns application table definitions; Supabase CLI is the sole migration runner.
- Public clients use RLS. Privileged credentials are server/test-only and must never enter bundles.
- See `docs/CONTRACTS.md` before changing shared APIs.

## Agent docs

If `docs/agents/EDITION.md` exists, read it first: this checkout is a downstream edition with its own rules.
Then read `docs/agents/README.md`: `STATUS.md` and `KNOWN_ISSUES.md` for your area, `DECISIONS.md` before reversing a choice.
Before handing back, update the status rows and known issues you touched, with command, date and commit as evidence.
Log misses in the agent context to `.local/agents/failures.md`. Machine paths, device IDs and raw logs stay under `.local/`.

## Collaboration

Parallel agents own disjoint paths. Do not edit another agent's files without coordination.
Only the coordinator installs dependencies, changes root configuration, or runs heavy native builds.
One native build/device active at a time by default. Pass the exact Stim device ID and Metro port to UI tools.
Use meaningful unit, integration, and E2E tests. Do not claim remote integrations or device tests passed unless actually run.

## Commands

Root scripts are the public interface: `pnpm dev:web`, `pnpm dev:mobile`, `pnpm verify`, `pnpm test:e2e`, `pnpm db:start`, `pnpm db:test`.
Run Stim from `apps/mobile`. Reuse native builds and Metro; JavaScript edits use Fast Refresh.
Optional integrations must stay disabled and incur no network traffic without explicit configuration.
Use conventional commits and document compatibility changes. Do not publish packages, deployments, or a public repository automatically.
