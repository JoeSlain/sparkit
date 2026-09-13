import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { run } from './process.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const directory = resolve(root, 'packages/i18n/locales');
const snapshot = () =>
  Object.fromEntries(
    readdirSync(directory).map((locale) => [
      locale,
      readFileSync(resolve(directory, locale, 'messages.po'), 'utf8'),
    ]),
  );
const before = snapshot();
run('pnpm', ['i18n:extract'], { cwd: root });
run('pnpm', ['i18n:compile'], { cwd: root });
if (JSON.stringify(before) !== JSON.stringify(snapshot())) {
  console.error(
    'Translation catalogs were out of date. Review the updated catalogs, translate and commit the .po files.',
  );
  process.exitCode = 1;
}
