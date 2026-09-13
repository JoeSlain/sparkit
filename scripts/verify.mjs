import { run } from './process.mjs';

for (const script of [
  'i18n:compile',
  'format:check',
  'lint',
  'deadcode',
  'typecheck',
  'test',
  'test:components',
  'build',
]) {
  console.log(`\nChecking ${script}`);
  run('pnpm', [script]);
}
