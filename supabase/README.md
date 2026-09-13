# Local Supabase and acceptance tests

Run commands from the repository root:

```sh
pnpm db:start
pnpm db:reset
pnpm db:test
node supabase/seed-local.mjs
pnpm --filter @agency/integration test:integration
```

Local services use API 54381, Postgres 54382, shadow 54383, Studio 54384 and mail inbox 54385. OAuth provider credentials are not configured. Email confirmations are disabled **only for this local fixture**. Enable confirmations and explicit redirect allowlists for a hosted project. Native deep links use `agencystarter://`; generated applications must configure their own scheme in both Expo and Supabase.

The seed script creates `alice@example.test` and `bob@example.test`, both with the public local-only password `Local-test-password-42!`. It reads credentials from this project's `supabase status` without printing them, refuses non-loopback endpoints and never uses a remote environment variable. Never create these fixture accounts on a remote project.

`tests/database/isolation.test.sql` checks RLS, restricted column grants, immutable ownership, database validation and private Storage paths in a transaction that rolls back. Integration tests create unique users through real Auth, use their real JWTs for CRUD and Storage, then delete uploaded fixtures and users. They fail if the local services are unavailable.

The `user-files` bucket is private and accepts supported images, PDF and plain text up to 10 MiB. Object paths start with the authenticated user's UUID followed by `/`. Public URLs do not grant access. Use authenticated download or short-lived signed URLs only after an authorized request.

Profiles are created by an Auth insert trigger with a safe default name. Clients can change only `display_name`. Tasks permit insert of `user_id` and `title`, updates of `title`/`completed`, and deletion of owned rows. IDs, ownership and audit timestamps cannot be changed by an authenticated API caller. Server-side privileged operations require their own authorization; service keys bypass RLS.

Postgres backups do not back up Storage blobs. A production release must separately cover object backup/restore, Auth mail configuration, rate limits, environment redirects and account deletion with file cleanup. No remote integration is claimed by these local tests.
