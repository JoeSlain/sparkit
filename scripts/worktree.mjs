import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
export function ticketConfig(ticket) {
  if (!/^[a-z][a-z0-9]*-\d+(?:-[a-z0-9]+)*$/i.test(ticket))
    throw new Error('Use a ticket identifier such as APP-123 or APP-123-profile.');
  const name = ticket.toLowerCase();
  const slot = createHash('sha256').update(name).digest().readUInt16BE(0) % 1000;
  return { name, branch: `codex/${name}`, webPort: 6000 + slot, apiPort: 20000 + slot * 10 };
}
export function prepareBackend(path, ticket) {
  const config = ticketConfig(ticket);
  const backend = resolve(path, '.local/backend/supabase');
  mkdirSync(backend, { recursive: true });
  let text = readFileSync(resolve(path, 'supabase/config.toml'), 'utf8');
  text = text.replace(
    /^project_id = "[^"]+"/m,
    `project_id = "${JSON.parse(readFileSync(resolve(path, 'package.json'), 'utf8')).name}-${config.name}"`,
  );
  for (let offset = 0; offset < 5; offset++)
    text = text.replaceAll(String(54381 + offset), String(config.apiPort + offset));
  text = text.replaceAll('5173', String(config.webPort));
  writeFileSync(resolve(backend, 'config.toml'), text);
  for (const entry of ['migrations', 'seed.sql', 'tests']) {
    const source = resolve(path, 'supabase', entry);
    if (existsSync(source) && !existsSync(resolve(backend, entry)))
      symlinkSync(source, resolve(backend, entry));
  }
  writeFileSync(resolve(path, '.local/worktree.json'), JSON.stringify(config, null, 2) + '\n');
  return config;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const ticket = process.argv[2];
  const config = ticketConfig(ticket ?? '');
  const path = resolve(
    dirname(root),
    `${JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')).name}-${config.name}`,
  );
  if (existsSync(path))
    throw new Error('Worktree destination exists; resume it without creating another.');
  execFileSync('git', ['worktree', 'add', '-b', config.branch, path, 'HEAD'], {
    cwd: root,
    stdio: 'inherit',
  });
  prepareBackend(path, ticket);
  console.log(
    `Worktree ready: ${path}\nRun pnpm install --frozen-lockfile, pnpm i18n:compile, pnpm db:start, pnpm db:seed.\nWeb: pnpm dev:web --port ${config.webPort}\nFor native: cd apps/mobile; pnpm exec stim worktree warm; pnpm exec stim start; pnpm exec stim ios (or android).\nThis worktree has a separate LOCAL Supabase stack. Port collisions fail safely; stop unused stacks to save memory.`,
  );
}
