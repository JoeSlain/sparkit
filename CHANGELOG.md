# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-09-20

### Added

- Standalone pnpm monorepo starter for Expo native (iOS/Android) and Vite web,
  with optional Remotion promo video app
- Shared Tamagui 2 UI across web and mobile
- Real Supabase Auth, Postgres, private Storage, Drizzle-authored migrations,
  and RLS-backed profile + task examples
- Lingui English source catalogs with French translations
- Local stack scripts (`db:start`, `db:test`, `db:seed`), `pnpm verify`,
  integration tests, Playwright web E2E, and `create:project` generator
- Optional integration wiring (Sentry, PostHog, RevenueCat, Resend, notifications,
  offline) that stays off without configuration
- Contributor docs: CONTRIBUTING, SECURITY, CODE_OF_CONDUCT

### Notes

- Requires Node 24.16.x, pnpm 10.34.5, Docker (or compatible), and Supabase CLI
- Native store builds need an EAS project and credentials before release
- This is an early public starter release; derived products must own their own
  security contact, environments, and support policy
