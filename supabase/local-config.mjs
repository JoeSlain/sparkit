import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import path from 'node:path';

const require = createRequire(new URL('../packages/supabase/package.json', import.meta.url));
export const { createClient } = require('@supabase/supabase-js');
const root = fileURLToPath(new URL('../', import.meta.url));
const runtimeRoot = existsSync(path.join(root, '.local/backend/supabase/config.toml'))
  ? path.join(root, '.local/backend')
  : root;

/** Reads the current project's local CLI status. Never logs tokens or accepts remote URLs. */
export function getLocalConfig() {
  let status;
  try {
    status = JSON.parse(
      execFileSync('pnpm', ['exec', 'supabase', 'status', '-o', 'json'], {
        cwd: runtimeRoot,
        encoding: 'utf8',
        timeout: 30000,
        stdio: ['ignore', 'pipe', 'pipe'],
      }),
    );
  } catch {
    throw new Error('Local Supabase is unavailable. Run pnpm db:start from this project first.');
  }
  const url = status.API_URL;
  const parsed = new URL(url);
  if (
    !['127.0.0.1', 'localhost', '[::1]'].includes(parsed.hostname) ||
    parsed.protocol !== 'http:'
  ) {
    throw new Error('Test tooling refuses any non-local Supabase endpoint.');
  }
  const publishableKey = status.PUBLISHABLE_KEY ?? status.ANON_KEY;
  const serviceKey = status.SECRET_KEY ?? status.SERVICE_ROLE_KEY;
  if (!publishableKey || !serviceKey)
    throw new Error('Local Supabase status did not include required API keys.');
  return { url, publishableKey, serviceKey };
}

export function createLocalAdmin(config = getLocalConfig()) {
  return createClient(config.url, config.serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
