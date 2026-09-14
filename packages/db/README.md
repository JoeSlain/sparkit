# Database ownership

This package is server/tooling-only. Do not import it from a browser or native bundle.

Drizzle 0.45.2 / kit 0.31.10 owns application table definitions. SQL snapshots and generated SQL live in `drizzle/`. Supabase CLI is the **only migration runner**; no `drizzle-kit push` or `migrate` is used.

1. Edit `src/schema.ts`.
2. From the repository root run `pnpm --filter @sparkit/db generate`.
3. Review generated SQL, especially constraints, drops and RLS changes.
4. Run `pnpm --filter @sparkit/db export`. It creates immutable SQL copies in `supabase/migrations/`; `check` detects missing or modified exports.
5. Put new policies, grants, private functions, Auth foreign keys/triggers and Storage changes in a separately timestamped `supabase migration new` SQL file. These Supabase resources are SQL-owned, not managed by Drizzle introspection.
6. Run `pnpm db:reset`, `pnpm db:test` and integration tests. Regenerate Supabase client types through the root `db:types` command and commit them.

The profile/Auth foreign key is intentionally SQL-owned because Auth is a Supabase-managed schema. The initial security migration follows the initial table migration. On later changes, ensure security grants/policies follow new tables in timestamp order. Every table must have RLS before exposure. Applied migrations are immutable; create a forward migration for corrections.

The generated client types are a different view of the same reconstructed schema, not a second schema authority. CI should regenerate them and fail on drift. Test upgrades from the previous release as well as a clean reset. Serialize deployment per environment and use expand/contract changes while older mobile binaries remain active.
