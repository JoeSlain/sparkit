import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';
import { getLocalConfig } from '../supabase/local-config.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const port = Number(process.env.WEB_PORT ?? '5173');
if (!Number.isInteger(port) || port < 1024 || port > 65535)
  throw new Error('WEB_PORT must be an integer between 1024 and 65535.');
const baseURL = `http://127.0.0.1:${port}`;
const config = getLocalConfig();
const {
  SUPABASE_SERVICE_ROLE_KEY: _serviceRole,
  SUPABASE_SECRET_KEY: _secretKey,
  ...publicEnvironment
} = process.env;
const appEnvironment = {
  ...publicEnvironment,
  VITE_SUPABASE_URL: config.url,
  VITE_SUPABASE_PUBLISHABLE_KEY: config.publishableKey,
};
const testEnvironment = {
  ...appEnvironment,
  SUPABASE_URL: config.url,
  SUPABASE_PUBLISHABLE_KEY: config.publishableKey,
  SUPABASE_SERVICE_ROLE_KEY: config.serviceKey,
  PLAYWRIGHT_BASE_URL: baseURL,
};

// Fail before spawning if the requested port belongs to another process.
await new Promise((resolve, reject) => {
  const probe = createServer();
  probe.once('error', reject);
  probe.listen(port, '127.0.0.1', () => probe.close(resolve));
});
const server = spawn('pnpm', ['--filter', '@agency/web', 'dev', '--port', String(port)], {
  cwd: root,
  env: appEnvironment,
  stdio: 'inherit',
  detached: process.platform !== 'win32',
});
let serverExited = false;
server.once('exit', () => {
  serverExited = true;
});
let serverError;
server.once('error', (error) => {
  serverError = error;
});
async function stopServer() {
  if (!server.pid) return;
  const kill = (signal) => {
    try {
      if (process.platform === 'win32') server.kill(signal);
      else process.kill(-server.pid, signal);
    } catch (error) {
      if (error.code !== 'ESRCH') throw error;
    }
  };
  kill('SIGTERM');
  const deadline = Date.now() + 5_000;
  while (!serverExited && Date.now() < deadline)
    await new Promise((resolve) => setTimeout(resolve, 100));
  if (!serverExited) kill('SIGKILL');
}
try {
  const deadline = Date.now() + 60_000;
  let ready = false;
  while (Date.now() < deadline) {
    if (serverError) throw serverError;
    if (serverExited) throw new Error('The web development server stopped before becoming ready.');
    try {
      ready = (await fetch(baseURL, { signal: AbortSignal.timeout(2_000) })).ok;
    } catch {
      /* Wait for the owned server. */
    }
    if (ready) break;
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
  if (!ready) throw new Error('Web server readiness timed out.');
  const result = await new Promise((resolve, reject) => {
    const child = spawn('pnpm', ['--filter', '@agency/web', 'test:e2e', ...process.argv.slice(2)], {
      cwd: root,
      env: testEnvironment,
      stdio: 'inherit',
    });
    child.once('error', reject);
    child.once('exit', (code, signal) => resolve(code ?? (signal ? 1 : 0)));
  });
  process.exitCode = result;
} finally {
  await stopServer();
}
