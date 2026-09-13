import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { run } from './process.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const backendRoot = existsSync(resolve(root, '.local/backend/supabase/config.toml'))
  ? resolve(root, '.local/backend')
  : root;
const operation = process.argv[2] ?? 'env';
const hostFlag = process.argv.indexOf('--host');
const host = hostFlag >= 0 ? process.argv[hostFlag + 1] : null;
if (host && !/^[a-zA-Z0-9.:-]+$/.test(host))
  throw new Error('Use a hostname or IP with --host, without a scheme or path.');

function status() {
  const result = JSON.parse(
    execFileSync('supabase', ['status', '-o', 'json'], {
      cwd: backendRoot,
      encoding: 'utf8',
      timeout: 30000,
      stdio: ['ignore', 'pipe', 'pipe'],
    }),
  );
  const url = result.API_URL;
  if (!url || !['127.0.0.1', 'localhost'].includes(new URL(url).hostname))
    throw new Error('Local commands refuse a non-local Supabase endpoint.');
  const key = result.PUBLISHABLE_KEY || result.ANON_KEY;
  if (!key) throw new Error('Supabase did not provide a public API key.');
  return { result, url, key };
}

function writeEnvironments() {
  const { result, url, key } = status();
  const localUrl = new URL(url);
  if (host) localUrl.hostname = host;
  const publicUrl = localUrl.origin;
  const androidUrl = new URL(publicUrl);
  if (!host) androidUrl.hostname = '10.0.2.2';
  const comment = '# Generated for LOCAL development only. Never commit this file.\n';
  writeFileSync(
    resolve(root, '.env.local'),
    `${comment}APP_ENV=local\nSUPABASE_URL=${publicUrl}\nSUPABASE_PUBLISHABLE_KEY=${key}\n`,
    { mode: 0o600 },
  );
  if (existsSync(resolve(root, 'apps/web')))
    writeFileSync(
      resolve(root, 'apps/web/.env.local'),
      `${comment}VITE_SUPABASE_URL=${publicUrl}\nVITE_SUPABASE_PUBLISHABLE_KEY=${key}\n`,
      { mode: 0o600 },
    );
  if (existsSync(resolve(root, 'apps/mobile')))
    writeFileSync(
      resolve(root, 'apps/mobile/.env.local'),
      `${comment}EXPO_PUBLIC_SUPABASE_URL=${publicUrl}\nEXPO_PUBLIC_SUPABASE_ANDROID_URL=${androidUrl.origin}\nEXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${key}\n`,
      { mode: 0o600 },
    );
  mkdirSync(resolve(root, '.local'), { recursive: true });
  writeFileSync(resolve(root, '.local/supabase.json'), JSON.stringify(result), { mode: 0o600 });
  console.log('Local environment files written. API credentials were not printed.');
}

if (!existsSync(resolve(root, 'supabase/config.toml')))
  throw new Error('Missing local Supabase config.');
const config = readFileSync(resolve(root, 'supabase/config.toml'), 'utf8');
if (!/^project_id\s*=\s*"[a-z0-9-]+"/m.test(config))
  throw new Error('Expected an explicit local project_id.');
switch (operation) {
  case 'start':
    execFileSync('supabase', ['start', '-x', 'studio,imgproxy'], {
      cwd: backendRoot,
      stdio: ['ignore', 'pipe', 'inherit'],
    });
    writeEnvironments();
    break;
  case 'env':
    writeEnvironments();
    break;
  case 'test':
    status();
    run('supabase', ['test', 'db'], { cwd: backendRoot });
    break;
  case 'types': {
    status();
    const types = execFileSync(
      'supabase',
      ['gen', 'types', 'typescript', '--local', '--schema', 'public'],
      { cwd: backendRoot, encoding: 'utf8', timeout: 30000, stdio: ['ignore', 'pipe', 'inherit'] },
    );
    const file = resolve(root, 'packages/supabase/src/database.types.ts');
    writeFileSync(file, types);
    run('pnpm', ['exec', 'oxfmt', '--write', file], { cwd: root });
    break;
  }
  case 'stop':
    run('supabase', ['stop'], { cwd: backendRoot });
    break;
  case 'reset':
    status();
    run('supabase', ['db', 'reset', '--local'], { cwd: backendRoot });
    writeEnvironments();
    break;
  default:
    throw new Error('Usage: pnpm env:local [--host LAN_IP] or pnpm db:start|db:stop|db:reset');
}
