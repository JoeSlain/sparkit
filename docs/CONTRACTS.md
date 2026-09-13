# Shared implementation contract

Namespace: `@agency/*`. pnpm workspace dependencies: `workspace:*`. Source exports are TypeScript; bundlers/tests transpile them.

## Packages

- `@agency/validation`: Valibot `taskInputSchema` ({title}, trimmed 1..160), `profileInputSchema` ({display_name}, trimmed 1..80), `authInputSchema` ({email,password}, password >=8), `localeSchema` (en/fr). Export inferred input types.
- `@agency/supabase`: `Database`, `Task`, `Profile`, `AppClient`; `createAppClient({url,publishableKey,storage?,persistSession?,detectSessionInUrl?})`; `listTasks(client)`, `createTask(client,{title})`, `setTaskCompleted(client,{id,completed})`, `deleteTask(client,id)`, `getProfile(client)`, `updateProfile(client,{display_name})`. Throw API errors; never return failures as successful query data. Task: id, user_id, title, completed, created_at, updated_at. Profile: id=auth user id, display_name, created_at, updated_at. All dates strings to clients.
- `@agency/db`: Drizzle schema, migration export/check tooling; server-only. Supabase SQL migrations in `supabase/migrations` are applied only by Supabase CLI.
- `@agency/i18n`: `Locale = 'en'|'fr'`, `createI18n(locale?:Locale)`, `activateLocale(instance,locale)`. Coordinator owns catalogs/config; UI agents use Lingui macros with readable English source messages and stable explicit IDs where sensible. Coordinator extracts/translates after screens exist.
- `@agency/tokens`: shared raw design values, no React imports.

## UI example

Authentication using real Supabase email/password (local confirmation disabled). Signed-in dashboard with private tasks, profile display name, locale switcher, sign out. No fake data mode. Friendly unconfigured environment screen instead of crashing. TanStack Query handles remote data and clears at logout/account change. Queries keyed by user id. Loading, error, empty, validation and pending states accessible.

Native: Expo Router, Tamagui 2, secure auth storage, AppState auth refresh/focus and network adapter; no web export. Web: React Router Framework mode SPA (ssr:false), Vite, Tailwind/shadcn-style primitives in `apps/web/app/components/ui`, components.json.

Stable test IDs on both UIs: `email-input`, `password-input`, `sign-in-button`, `sign-up-button`, `task-input`, `add-task-button`, `task-row`, `task-toggle`, `task-delete`, `profile-name-input`, `save-profile-button`, `locale-en`, `locale-fr`, `sign-out-button`. Native use testID; web data-testid.

## Environment

Web: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY; native EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Optional matching *_SENTRY_DSN. Local-only test credentials and service-role keys never in public configs or version control.

Coordinator owns root files, package lock/install, `packages/i18n`, `packages/tokens`, scripts/generator/worktrees and CI. Backend agent owns `packages/db`, `packages/supabase`, `packages/validation`, `supabase`, `tests/integration` and backend tests. Web agent owns `apps/web`. Mobile agent owns `apps/mobile` and native Maestro flow source.
