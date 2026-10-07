# Status

One row per area. ✅ verified on the stated commit · ⚠️ verified earlier or partially · ❌ not verified ·
see [README.md](README.md#evidence-rule) for what counts as evidence.

| Area                                                                    | State | Last evidence                                                                                                                                                 | Commit           |
| ----------------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Static checks (format, lint, dead code, types, unit, component, builds) | ✅    | CI `pnpm verify`, 2026-10-07                                                                                                                                  | `537313c`        |
| i18n catalogs                                                           | ✅    | CI `pnpm i18n:check`, 2026-10-07                                                                                                                              | `537313c`        |
| Schema, migrations, RLS                                                 | ✅    | CI `pnpm --filter @sparkit/db check`, `pnpm db:test` (pgTAP), 2026-10-07                                                                                      | `537313c`        |
| Backend integration and generated types                                 | ✅    | CI `pnpm test:integration`, `db:types` without diff, 2026-10-07                                                                                               | `537313c`        |
| Web E2E                                                                 | ✅    | CI `pnpm test:e2e` (Playwright, Chromium), 2026-10-07                                                                                                         | `537313c`        |
| iOS build and launch                                                    | ⚠️    | Local `stim ios` on a simulator, sign-in checked with Argent, 2026-09-13. Predates the shared Tamagui UI                                                      | around `bee42c8` |
| Android build and launch                                                | ⚠️    | Local `stim android` on a physical device, 2026-09-13. UI not checked ([KI-004](KNOWN_ISSUES.md#ki-004)); emulator blocked ([KI-003](KNOWN_ISSUES.md#ki-003)) | around `bee42c8` |
| Native UI acceptance (Maestro)                                          | ❌    | No full green run ([KI-001](KNOWN_ISSUES.md#ki-001))                                                                                                          | —                |
| Generator (`web`, `mobile`, `both`)                                     | ⚠️    | Unit tests in CI. Install, typecheck and tests per generated copy done by hand 2026-09-13, before `apps/video` and the shared Tamagui UI                      | around `bee42c8` |
| Worktree lifecycle                                                      | ❌    | Config unit tests only. Real worktree, isolated Supabase stack, `stim worktree warm` and cleanup never run end to end                                         | —                |
| Optional integrations                                                   | ⚠️    | Off by default; contract tests only. No live service test                                                                                                     | —                |
