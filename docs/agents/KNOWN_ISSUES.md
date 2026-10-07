# Known issues

Failures in the product, tooling or infrastructure that are not fixed yet. For misses in the agent's
own context, use `failures.md` instead (see [README.md](README.md#agent-context-failures-failuresmd)).

Statuses: `open` · `flaky` · `workaround` · `fixed`. Keep a `fixed` entry for one cycle, then delete it;
Git keeps the history. Raw logs stay in `.local/agents/logs/` and are not linked from here.

```md
### KI-NNN

**Title** — Status: open · Target: iOS sim · Seen: YYYY-MM-DD (`commit`)

- Symptom:
- Reproduce:
- Workaround:
- Fixed by:
```

### KI-001

**Maestro sign-in is flaky on iOS** — Status: flaky · Target: iOS simulator · Seen: 2026-09-13

- Symptom: the TextInput loses focus and the system "Save Password" prompt interrupts the flow, so
  `tests/maestro/workspace.yaml` never completes green.
- Reproduce: run the Maestro workspace scenario after `stim ios`.
- Workaround: none. Sign-in was verified manually with Argent instead.
- Fixed by: —

### KI-002

**Docker Desktop fails to start from an agent shell** — Status: workaround · Target: macOS host · Seen: 2026-09-13

- Symptom: `opening tray: starting electron: unmarshaling start request: unexpected EOF`. Docker
  Desktop rejects launches whose environment exceeds its 16 KiB spawn limit (docker/for-mac#7709);
  agent shells often do.
- Reproduce: `open -a Docker` from a shell with a large environment.
- Workaround: [runbooks/docker-recovery.md](runbooks/docker-recovery.md).
- Fixed by: — (upstream Docker bug)

### KI-003

**Android emulator and Docker fail on a nearly full disk** — Status: workaround · Target: Android emulator, Docker · Seen: 2026-09-13

- Symptom: the AVD will not boot, and Docker's VM can freeze on `ENOSPC`, taking the Supabase stack
  down with it.
- Reproduce: start an AVD with less than about 10 GiB free.
- Workaround: free space first. Keep 15–20 GiB free for iOS builds. Remove only caches this project
  created; never prune other projects' Docker volumes or images.
- Fixed by: —

### KI-004

**Android UI not verified after launch** — Status: open · Target: Android physical device · Seen: 2026-09-13

- Symptom: the app installed and launched, but the device stayed on its PIN lock screen, so no UI
  acceptance ran.
- Reproduce: `stim android --device <serial>` on a locked device.
- Workaround: unlock the device before the run. An emulator reaches the local backend through
  `10.0.2.2`; a physical device needs `pnpm env:local --host <LAN IP>`.
- Fixed by: —
