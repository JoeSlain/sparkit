# Agency Starter

Independent open-source starter. Work only in this repository and its explicitly created worktrees.

## Architecture

- Expo is native iOS/Android only. No Expo Web, react-native-web, or universal routing.
- Web uses React + Vite + React Router. Native uses Expo Router + Tamagui.
- Lingui is the only translation system; English source and French catalogs.
- pnpm workspaces with pinned versions; root owns installation and the lockfile.
- Supabase is real data/auth. Never replace acceptance tests with a mocked successful backend.
- Drizzle owns application table definitions; Supabase CLI is the sole migration runner.
- Public clients use RLS. Privileged credentials are server/test-only and must never enter bundles.
- See `docs/CONTRACTS.md` before changing shared APIs.

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
