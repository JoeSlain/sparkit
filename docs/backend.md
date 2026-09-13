# Backend guide

The starter uses real Supabase Auth, Postgres and private Storage. Browser and native clients call the same typed API with a publishable key and the user's session. RLS enforces ownership. There is no mock-success mode and no requirement to deploy a separate HTTP server for this example.

## Package boundaries

| Package              | Responsibility                                                           | Allowed consumers               |
| -------------------- | ------------------------------------------------------------------------ | ------------------------------- |
| `@agency/validation` | Runtime validation and normalized input types                            | Browser, native, trusted server |
| `@agency/supabase`   | Public client factory, generated DB types, typed profile/task operations | Browser and native              |
| `@agency/db`         | Drizzle table definitions, schema snapshots and migration export tooling | Server/tooling only             |

`createAppClient` accepts platform-specific auth storage. Native supplies secure storage; the browser uses the Supabase browser storage adapter. The UI owns the session lifecycle, query keys by user ID and clearing cached private data when an account changes. Do not put service keys, connection strings or Drizzle database clients into public bundles.

All data operations throw Supabase failures. Update/delete operations that find no accessible row also fail, preventing a UI from treating an unauthorized or missing-row mutation as a success. Inserts derive `user_id` from the authenticated user; the database independently validates ownership. Validation strips unexpected fields, but RLS and column grants remain the authority against direct API calls.

## Schema and ownership

- `profiles.id` references `auth.users.id`. An Auth trigger creates the profile with the safe default name `New user`.
- `profiles.display_name` is the only profile column that clients can update.
- `tasks.user_id` references the profile, with cascading deletion.
- Clients can insert task titles for themselves, read/delete their own rows, and update `title` or `completed`.
- IDs, ownership and audit timestamps cannot be changed through an authenticated client.
- Database constraints independently reject invalid lengths and blank names/titles. Database triggers set `updated_at`.
- Policies use `(select auth.uid())` and an owner index supports listing tasks. Anonymous users have no table grants.

The Auth foreign key, triggers, private functions, policies and grants are SQL-owned Supabase resources. Private functions have an empty search path and no public execute grant. A service key or privileged Postgres connection bypasses normal client protection: any later administrative API must authorize operations explicitly.

## One migration runner

Drizzle owns application table definitions in `packages/db/src/schema.ts`. The exact ORM/kit pair is pinned. Generated SQL and snapshots live in `packages/db/drizzle/`; immutable exports live in `supabase/migrations/`. Supabase CLI is the **only** migration runner.

```sh
pnpm --filter @agency/db generate --name describe_change
pnpm --filter @agency/db export
pnpm --filter @agency/db check
pnpm db:reset
pnpm db:test
pnpm db:types
pnpm --filter @agency/integration test:integration
```

Review generated SQL before exporting. Do not use `drizzle-kit push` or maintain a second deployed Drizzle migration history. The exporter refuses to overwrite changed SQL and detects missing/orphaned generated exports. Put new Supabase-only resources in a separately timestamped migration using `pnpm exec supabase migration new describe_security_change`; apply it after the related tables.

Initial migrations separate table DDL from security configuration. RLS is enabled in the table migration itself, before application grants are provided. For later changes, review grants/policies in the same change that introduces a resource. Do not generate policies by guessing from UI filters.

After applying migrations, generate client types from the **actual local database**, using `pnpm db:types`. These types describe the resulting database, including SQL-owned resources. They are not an independently edited schema. Commit type updates with migrations and check generation drift in CI.

Applied migrations are immutable. Test both a clean reconstruction and an upgrade from the preceding release. Serialize deploys per environment. Use additive/expand-contract changes when old mobile binaries remain in use; an OTA update does not upgrade every installed native client at once.

## Local services and fixtures

`supabase/config.toml` gives this project a distinct identity and port range:

| Service         | Port  |
| --------------- | ----- |
| API             | 54381 |
| Postgres        | 54382 |
| Shadow Postgres | 54383 |
| Studio          | 54384 |
| Mail inbox      | 54385 |

Run `pnpm db:start`, then `pnpm db:reset`, then `node supabase/seed-local.mjs`. The deterministic local accounts are `alice@example.test` and `bob@example.test`, both with password `Local-test-password-42!`. These are public test fixtures. Never create them in a hosted project. The script reads this checkout's local CLI status internally, refuses non-loopback endpoints, and does not print service credentials.

The checked-in SQL seed contains no users or production data. Auth accounts are created through the real Admin Auth API, so password hashing and lifecycle triggers follow the service's normal behavior. Local email confirmations are disabled for deterministic acceptance tests. Hosted environments must deliberately configure confirmations, mail delivery, OAuth providers, redirect allowlists and rate limits.

## Worktrees

A separate SQL database alone does not isolate Supabase Auth, Storage, PostgREST and Realtime. Integrated branch testing requires the matching services and public API URL, not just a new `DATABASE_URL`.

Each active worktree should have a unique Supabase project ID, a non-overlapping port block, its own generated app environment and its own disposable fixtures. Start/stop/reset only the resources owned by that worktree. Keep the Supabase Postgres major version aligned with the hosted project. OAuth callbacks and native schemes must route back to the matching application build/environment.

The root worktree tooling is responsible for assigning these resources. Do not manually point multiple isolated-looking branches at the same staging API. This template does not require devflow and does not claim that its shared-Postgres mode provides full Supabase isolation.

## Tests

```sh
pnpm --filter @agency/validation test
pnpm db:test
pnpm --filter @agency/integration test:integration
```

Validation tests check normalization, boundary lengths, field stripping, email/password handling and locales.

The pgTAP suite runs inside a rolled-back transaction. It checks separate users, anonymous access, forbidden ownership changes, database validation and Storage path isolation. Integration tests create unique local users and real sessions, exercise profile/task persistence, refresh/logout, spoofed writes, and real Storage upload/download access. They remove their own uploaded files and users afterward. Missing local infrastructure causes a failure; tests do not silently skip or substitute mocks.

A production release additionally needs an exercised restoration procedure, mail/OAuth verification, account deletion with Storage cleanup, and monitoring. Passing the local suite is not evidence that remote credentials or external providers work.

## Private files

The `user-files` bucket is private. Paths must start with the authenticated user's UUID, for example `<user-id>/receipts/file.pdf`. Policies cover list/download, upload, update/move and delete. Supported content types are JPEG, PNG, WebP, PDF and plain text, up to 10 MiB.

Use authenticated downloads or an authorized request for a short-lived signed URL. Never assume an unguessable URL alone is authorization. Storage APIs can hide inaccessible-object existence, so a delete response alone does not prove the object was removed.

Postgres backups include Storage metadata, not file contents. Back up and restore blobs separately. Removing an Auth user does not by itself implement the application's complete account-deletion workflow; remove their files deliberately through Storage APIs.

## Extensions

Custom server logic can use Hono inside Supabase Edge Functions; Hono and Edge Functions are not competing architecture choices. Add a separate server or worker only when runtime, duration, resource or integration constraints require it.

A genuine offline feature changes the data architecture. PowerSync's local SQLite and upload queue require conflict/error handling and separate sync read authorization. Zero supports React Native/Expo but should not be treated as an interchangeable offline-write engine. Neither is enabled in this starter. Realtime subscriptions are likewise not an offline queue.

Primary references: [Supabase local development](https://supabase.com/docs/guides/local-development), [database migrations](https://supabase.com/docs/guides/deployment/database-migrations), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [database testing](https://supabase.com/docs/guides/database/testing), [Storage policies](https://supabase.com/docs/guides/storage/security/access-control), [backups](https://supabase.com/docs/guides/platform/backups), [Drizzle integration](https://orm.drizzle.team/docs/tutorials/drizzle-with-supabase).
