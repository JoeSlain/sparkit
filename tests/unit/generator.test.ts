import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
  symlinkSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { afterEach, expect, test } from 'vitest';
// @ts-expect-error The public generator is dependency-free JavaScript.
import { createProject, validateProjectName } from '../../scripts/create-project.mjs';
// @ts-expect-error The lifecycle tool also runs before dependency installation.
import { ticketConfig, prepareBackend } from '../../scripts/worktree.mjs';
const paths: string[] = [];
function fixture() {
  const dir = mkdtempSync(resolve(tmpdir(), 'sparkit-generator-'));
  paths.push(dir);
  const source = resolve(dir, 'template');
  mkdirSync(source);
  const files: Record<string, string> = {
    'package.json': JSON.stringify({
      name: 'sparkit',
      scripts: { 'dev:web': 'web', 'dev:mobile': 'mobile', 'test:e2e': 'test' },
      devDependencies: { stim: '1.2.0' },
    }),
    'apps/web/package.json': '{"name":"@sparkit/web"}',
    'apps/mobile/app.json': '{"bundleIdentifier":"com.sparkit.app"}',
    '.env.local': 'PRIVATE=secret',
    '.env.example': 'PUBLIC=placeholder',
    '.local/secret.json': 'secret',
    'node_modules/cache': 'cache',
    '.git/config': 'history',
    'pnpm-lock.yaml': 'old lock',
    'tests/maestro/smoke.yaml': 'flow',
    'supabase/config.toml':
      'project_id = "sparkit"\n[api]\nport = 54381\n[auth]\nsite_url = "http://localhost:5173"\n',
    'supabase/migrations/initial.sql': 'select 1;',
    'supabase/seed.sql': 'select 1;',
  };
  for (const [name, text] of Object.entries(files)) {
    const path = resolve(source, name);
    mkdirSync(resolve(path, '..'), { recursive: true });
    writeFileSync(path, text);
  }
  symlinkSync(resolve(source, '.env.local'), resolve(source, 'linked-secret'));
  return { dir, source, destination: resolve(dir, 'new-app'), name: 'new-app' };
}
afterEach(() => {
  for (const path of paths.splice(0)) rmSync(path, { recursive: true, force: true });
});
test('rejects invalid package names and targets before writing', () => {
  for (const name of ['../escape', 'Bad', 'a/b', '', 'a'.repeat(49)])
    expect(() => validateProjectName(name)).toThrow();
  const f = fixture();
  expect(() => createProject({ ...f, targets: 'desktop' })).toThrow();
  expect(existsSync(f.destination)).toBe(false);
});
test('web-only output has no mobile tree, secrets, history, cache or stale lock', () => {
  const f = fixture();
  createProject({ ...f, targets: 'web' });
  for (const name of [
    'apps/mobile',
    '.env.local',
    '.local',
    '.git',
    'node_modules',
    'linked-secret',
    'pnpm-lock.yaml',
    'tests/maestro',
  ])
    expect(existsSync(resolve(f.destination, name))).toBe(false);
  const manifest = JSON.parse(readFileSync(resolve(f.destination, 'package.json'), 'utf8'));
  expect(manifest.name).toBe('new-app');
  expect(manifest.devDependencies.stim).toBeUndefined();
  expect(readFileSync(resolve(f.destination, 'apps/web/package.json'), 'utf8')).toContain(
    '@new-app/web',
  );
  expect(existsSync(resolve(f.destination, '.env.example'))).toBe(true);
});
test('mobile-only output renames app identifiers and prunes web', () => {
  const f = fixture();
  createProject({ ...f, targets: 'mobile' });
  expect(existsSync(resolve(f.destination, 'apps/web'))).toBe(false);
  expect(readFileSync(resolve(f.destination, 'apps/mobile/app.json'), 'utf8')).toContain(
    'com.newapp.app',
  );
});
test('never overwrites existing destinations or copies recursively through symlinks', () => {
  const f = fixture();
  expect(() => createProject({ ...f, destination: f.source })).toThrow();
  expect(() => createProject({ ...f, destination: resolve(f.source, 'nested') })).toThrow();
  const alias = resolve(f.dir, 'alias');
  symlinkSync(f.source, alias);
  expect(() => createProject({ ...f, destination: resolve(alias, 'nested') })).toThrow();
  mkdirSync(f.destination);
  expect(() => createProject(f)).toThrow();
});
test('worktree runtime isolates project and ports without modifying tracked config', () => {
  const f = fixture();
  const before = readFileSync(resolve(f.source, 'supabase/config.toml'), 'utf8');
  const config = prepareBackend(f.source, 'APP-123-profile');
  expect(config.branch).toBe('codex/app-123-profile');
  expect(ticketConfig('APP-123-profile')).toEqual(config);
  const runtime = readFileSync(resolve(f.source, '.local/backend/supabase/config.toml'), 'utf8');
  expect(runtime).toContain('sparkit-app-123-profile');
  expect(runtime).toContain(String(config.apiPort));
  expect(readFileSync(resolve(f.source, 'supabase/config.toml'), 'utf8')).toBe(before);
  expect(() => ticketConfig('../bad')).toThrow();
});
