# Native smoke test

Build, launch and check the mobile app on iOS, then Android. One build and one device at a time. Run
Stim from `apps/mobile`, never from the repository root, and read `pnpm exec stim guide agent` for the
installed version first.

## Prerequisites

- Local backend running: `pnpm db:start`, then `pnpm db:seed`. Use the local test accounts described
  in `apps/mobile/README.md`, never personal credentials.
- At least 15 GiB free disk for iOS, 10 GiB for an Android emulator ([KI-003](../KNOWN_ISSUES.md#ki-003)).

## iOS

```sh
cd apps/mobile
pnpm exec stim doctor --platform ios
pnpm exec stim start
pnpm exec stim ios
pnpm exec stim logs --errors
```

Use the device ID and Metro port Stim prints; they change between runs.

## Android

Stop the iOS device, then repeat with `doctor --platform android` and `stim android`. An emulator
reaches the local backend through `10.0.2.2`; a physical device needs `pnpm env:local --host <LAN IP>`
and must be unlocked ([KI-004](../KNOWN_ISSUES.md#ki-004)).

## Check

Reproduce each action and confirm the visible state. A clean exit code is not enough.

- [ ] Sign up and sign in; the session survives an app restart
- [ ] Profile name update persists
- [ ] Task create, toggle and delete persist
- [ ] French and English both render without overflow
- [ ] A second account does not see the first account's data

The scripted version is `tests/maestro/workspace.yaml` ([KI-001](../KNOWN_ISSUES.md#ki-001)).

## Record

Update the iOS and Android rows in [STATUS.md](../STATUS.md) with the date and commit. Keep screenshots
and raw logs in `.local/agents/logs/`. Stop the devices you started.
