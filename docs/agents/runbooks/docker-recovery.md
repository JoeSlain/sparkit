# Docker recovery (macOS)

Use when `docker ps` hangs, the Supabase stack is down, or Docker Desktop will not start.
See [KI-002](../KNOWN_ISSUES.md#ki-002) and [KI-003](../KNOWN_ISSUES.md#ki-003).

1. **Check disk space.** `df -h /`. Below about 10 GiB, free space first; an `ENOSPC` in the VM freezes
   the control plane. Remove only caches this project created.
2. **Stop a frozen Docker Desktop.** Quit it; if the processes do not exit, force-quit them. Volumes
   survive.
3. **Start it with a minimal environment.** Agent shells can exceed Docker Desktop's spawn limit:

   ```sh
   env -i HOME="$HOME" USER="$USER" PATH="/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin" open -a Docker
   ```

4. **Verify.** `docker ps` answers, then `pnpm db:start` reports the stack healthy. Restart any
   container that stays unhealthy (often `edge_runtime`).

Never prune volumes or images that belong to other projects.
