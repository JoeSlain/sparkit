# Agent docs

How coding agents (and the humans running them) read and record project state. `AGENTS.md` holds the
rules; this folder holds the state and the reasons behind it.

| File                                             | Holds                                                      | Tracked         |
| ------------------------------------------------ | ---------------------------------------------------------- | --------------- |
| [STATUS.md](STATUS.md)                           | Current state per area, each row backed by evidence        | yes             |
| [KNOWN_ISSUES.md](KNOWN_ISSUES.md)               | Product, tooling and infrastructure failures not yet fixed | yes             |
| [DECISIONS.md](DECISIONS.md)                     | Durable choices and why they were made                     | yes             |
| [runbooks/](runbooks/)                           | Repeatable procedures (native smoke test, Docker recovery) | yes             |
| `EDITION.md`                                     | Downstream editions only: their own files, rules and state | downstream only |
| `.local/agents/failures.md`                      | Personal log of agent-context misses (see below)           | no              |
| `.local/agents/sessions/`, `.local/agents/logs/` | Session notes, raw logs, machine paths                     | no              |

`.local/` is ignored by Git and by the project generator. Anything that names a machine path, a device
ID, a port picked at run time or a personal account belongs there, never in a tracked file.

## Protocol

**Start.** Read `AGENTS.md`, then the rows of `STATUS.md` and the open entries of `KNOWN_ISSUES.md` for
the area you will touch. Read `DECISIONS.md` before reversing a choice.

**Editions.** A downstream edition (a private fork that merges this repository) describes itself in
`docs/agents/EDITION.md`: which files are its own, where shared changes must go, and its own status and
known issues. The template never ships that file, and the generator drops it, so downstream merges never
conflict on it.

**Ownership.** Parallel agents own disjoint paths. Typical split:

| Owner       | Paths                                                                      |
| ----------- | -------------------------------------------------------------------------- |
| Backend     | `supabase/`, `packages/db`, `packages/supabase`, `tests/integration`       |
| Web         | `apps/web`                                                                 |
| Mobile      | `apps/mobile`, `tests/maestro`                                             |
| Coordinator | root config, lockfile, `scripts/`, `.github/`, `docs/`, other `packages/*` |

Only the coordinator installs dependencies, edits root configuration or runs heavy native builds.

**Finish.** Before handing back:

1. Update the `STATUS.md` rows you changed, with evidence.
2. Add or update a `KNOWN_ISSUES.md` entry for every failure you saw and did not fix.
3. If the agent context (this folder, `AGENTS.md`, a skill, a memory) was missing or wrong, add an entry
   to `failures.md`.

## Evidence rule

A row or a claim says ✅ only with the command that ran, the date and the commit. "No error printed" is
not evidence: for UI, reproduce the action and check the visible state. A `vitest --passWithNoTests`
success proves nothing about behavior. Do not count the same tests twice across levels. When the code
moves on, an old result is downgraded to ⚠️ rather than kept as ✅.

## Agent-context failures (`failures.md`)

`KNOWN_ISSUES.md` records what breaks in the product. `failures.md` records when **the agent's context**
— `AGENTS.md`, these docs, a skill or a memory — was missing, wrong or stale and cost turns. It is
personal and untracked. Keep one per developer, in the primary checkout so every worktree shares it:

```sh
echo "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.local/agents/failures.md"
```

Entry format, newest first, one line per field:

```md
### YYYY-MM-DD — short title

Prompt/situation: what was asked
Miss: what went wrong (wrong assumption, wrong file, stale instruction followed…)
Missing/wrong context: the line, or the missing line, and which file
Fix: what changed and where (file, commit)
Status: open | fixed YYYY-MM-DD
```

Rules:

- Log only real misses. Nothing to report means nothing to write.
- Before editing `AGENTS.md`, these docs, a skill or memory, reread the open entries and check the edit
  does not reintroduce them.
- Never delete an entry: a fixed one is a regression test. Move it under `## Archive` once fixed so the
  open list stays short enough to reread. Raw detail goes to `.local/agents/logs/`, not into the entry.
