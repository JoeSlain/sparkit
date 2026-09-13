# Native Workspace

Expo SDK 57, React Native 0.86.3, React 19.2.3, Expo Router and Tamagui 2.
Only iOS and Android are configured. This app has no Expo Web target.

Run root setup and database seed first. Copy `.env.example` into `.env.local`
with the local Supabase publishable key. Root tooling writes these values for you.
Use the explicit Android URL override for an emulator; a physical device needs
an accessible LAN hostname. Never put a service-role key into an `EXPO_PUBLIC_` variable.

From the repository root:

```sh
pnpm dev:mobile
pnpm --filter @agency/mobile typecheck
pnpm --filter @agency/mobile test
```

From this directory, the resource-owning agent uses `stim guide agent`, `stim doctor`,
`stim start`, then `stim ios` or `stim android`. Pass Stim's exact device ID and Metro
port to UI tools. Build one platform at a time and reuse native artifacts. JavaScript
changes use Fast Refresh. `stim stop` cleans the resources it owns.

Authentication is real Supabase email/password. The session is encrypted in
SecureStore, chunked to avoid per-item size constraints. Storage operations are
serialized per key so an overlapping refresh cannot restore tokens after sign-out;
failed partial writes are cleaned before the next operation. Account changes cancel
queries and clear the query/mutation cache; keys also contain the user ID.
AppState manages token refresh and query focus, NetInfo manages query connectivity.
Locale selection is persisted independently. Confirmation-required signup shows a
check-email state rather than pretending the user is authenticated.

The deterministic acceptance scenario is `../../tests/maestro/workspace.yaml`.
It requires a dedicated seeded local account with no tasks and real Supabase.
Run it on an isolated simulator/emulator owned by this test: launch resets app data
and the test keychain. Do not point this reset flow at a personal device.
Supply `E2E_EMAIL` and `E2E_PASSWORD` using your local secret environment; root test
tooling must reset only that account's data before each run. The scenario tests
signin, task create/toggle/delete, profile persistence, session persistence, FR/EN,
and logout. Component tests intentionally isolate authentication failures and
validation; they do not replace this real backend acceptance test.

The EAS profiles are configuration only. There is deliberately no remote EAS
project ID, update URL, credentials, or automatic publish step. Preview iOS builds
require signing when used on a real device; the development profile targets the
simulator. `runtimeVersion: fingerprint` computes compatibility from the native inputs.
A native dependency or config change requires a matching new build; verify the
fingerprint with the same environment when preparing an update. Connect EAS and configure OTA explicitly when preparing a real release.
Always validate preview builds, use the selected EAS environment, upload update
source maps, and test rollback before enabling production updates.

Tamagui uses runtime styles with a small system-font configuration. Import from
`@tamagui/core` and `@tamagui/stacks` only — the umbrella `tamagui` package pulls
web-only Popper/`react-dom` code into Jest and mobile-only installs. No compiler
or animation dependency is needed for these screens. Lingui's Babel macro compiles
messages and shared precompiled catalogs provide English/French at runtime.
