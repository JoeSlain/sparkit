import { execFileSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const templateRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));

export function validateProjectName(name) {
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(name) || name.length > 48)
    throw new Error(
      'Project name must be lowercase kebab-case, start with a letter, and contain at most 48 characters.',
    );
  return name;
}

const ignored = new Set([
  '.git',
  'node_modules',
  '.local',
  '.turbo',
  '.expo',
  '.react-router',
  'dist',
  'build',
  'coverage',
  'test-results',
  'playwright-report',
  '.DS_Store',
  '.temp',
  '.branches',
]);
const textExtensions = /\.(?:json|mjs|cjs|js|ts|tsx|md|yaml|yml|toml|css|html|sql|po|sh)$/;

export function createProject({ destination, name, targets = 'both', source = templateRoot }) {
  validateProjectName(name);
  if (!['web', 'mobile', 'both'].includes(targets))
    throw new Error('Targets must be web, mobile or both.');
  const output = resolve(destination);
  const sourcePath = realpathSync(resolve(source));
  let ancestor = output;
  while (!existsSync(ancestor)) ancestor = dirname(ancestor);
  const resolvedOutput = resolve(realpathSync(ancestor), relative(ancestor, output));
  const rel = relative(sourcePath, resolvedOutput);
  if (!rel || (!rel.startsWith(`..${sep}`) && rel !== '..' && !isAbsolute(rel)))
    throw new Error('Create the project outside the template directory.');
  if (existsSync(output)) throw new Error('Destination already exists; refusing to overwrite.');
  mkdirSync(dirname(output), { recursive: true });
  cpSync(sourcePath, output, {
    recursive: true,
    filter(path) {
      const name = basename(path);
      const parts = relative(sourcePath, path).split(sep);
      if (parts.some((part) => ignored.has(part))) return false;
      if (lstatSync(path).isSymbolicLink()) return false;
      if (name.startsWith('.env') && !['.env.example', '.env.schema'].includes(name)) return false;
      if (/\.(?:log|tsbuildinfo)$/.test(name)) return false;
      if (
        parts[0] === 'apps' &&
        parts[1] === 'mobile' &&
        (targets === 'web' || ['ios', 'android'].includes(parts[2]))
      )
        return false;
      if (parts[0] === 'apps' && parts[1] === 'web' && targets === 'mobile') return false;
      if (parts[0] === 'apps' && parts[1] === 'video') return false;
      if (
        parts[0] === 'packages' &&
        parts[1] === 'i18n' &&
        parts.includes('locales') &&
        name.endsWith('.ts')
      )
        return false;
      return true;
    },
  });
  function rewrite(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const file = resolve(dir, entry.name);
      if (entry.isDirectory()) rewrite(file);
      else if (
        textExtensions.test(entry.name) ||
        ['AGENTS.md', '.env.example', '.env.schema'].includes(entry.name)
      ) {
        const slug = name.replaceAll('-', '');
        const text = readFileSync(file, 'utf8')
          .replaceAll('com.sparkit.app', `com.${slug}.app`)
          .replaceAll('sparkit://', `${slug}://`)
          .replaceAll('@sparkit/', `@${name}/`)
          .replaceAll('sparkit', name);
        writeFileSync(file, text);
      }
    }
  }
  rewrite(output);
  const mobileConfig = resolve(output, 'apps/mobile/app.json');
  if (existsSync(mobileConfig)) {
    const app = JSON.parse(readFileSync(mobileConfig, 'utf8'));
    if (app.expo) {
      app.expo.scheme = name.replaceAll('-', '');
      writeFileSync(mobileConfig, JSON.stringify(app, null, 2) + '\n');
    }
  }
  const readme = resolve(output, 'README.md');
  if (existsSync(readme) && targets !== 'both') {
    const absent = targets === 'web' ? 'mobile' : 'web';
    writeFileSync(
      readme,
      readFileSync(readme, 'utf8')
        .split('\n')
        .filter((line) => !line.includes(`](apps/${absent}/README.md)`))
        .join('\n'),
    );
  }
  if (targets !== 'both') {
    const absent = targets === 'web' ? 'mobile' : 'web';
    for (const locale of ['en', 'fr']) {
      const catalog = resolve(output, `packages/i18n/locales/${locale}/messages.po`);
      if (!existsSync(catalog)) continue;
      const blocks = readFileSync(catalog, 'utf8')
        .trimEnd()
        .split('\n\n')
        .flatMap((block) => {
          const references = block.split('\n').filter((line) => line.startsWith('#: '));
          const remaining = references.filter((line) => !line.startsWith(`#: apps/${absent}/`));
          if (references.length && !remaining.length) return [];
          return [
            block
              .split('\n')
              .filter((line) => !line.startsWith(`#: apps/${absent}/`))
              .join('\n'),
          ];
        });
      writeFileSync(catalog, blocks.join('\n\n') + '\n');
    }
  }
  const manifestPath = resolve(output, 'package.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  manifest.name = name;
  manifest.version = '0.1.0';
  if (targets === 'web') {
    delete manifest.scripts['dev:mobile'];
    delete manifest.devDependencies.stim;
    rmSync(resolve(output, 'tests/maestro'), { recursive: true, force: true });
  }
  if (targets === 'mobile') {
    delete manifest.scripts['dev:web'];
    delete manifest.scripts['test:e2e'];
    rmSync(resolve(output, 'scripts/test-web.mjs'), { force: true });
    const ci = resolve(output, '.github/workflows/ci.yml');
    if (existsSync(ci)) {
      const yaml = readFileSync(ci, 'utf8')
        .replace(/      - run: pnpm --filter @[^\n]+ exec playwright[^\n]+\n/g, '')
        .replace(/      - run: pnpm test:e2e\n/g, '')
        .replace(
          /      - uses: actions\/upload-artifact@v4\n        if: failure\(\)\n        with:\n          name: web-failures\n          path: apps\/web\/test-results\n/g,
          '',
        );
      writeFileSync(ci, yaml);
    }
  }
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  // Profile selection changes dependency importers; generate a new project lockfile on its first install.
  rmSync(resolve(output, 'pnpm-lock.yaml'), { force: true });
  writeFileSync(
    resolve(output, 'template.json'),
    `${JSON.stringify({ template: 'sparkit', templateVersion: '0.1.0', targets, generatedAt: new Date().toISOString() }, null, 2)}\n`,
  );
  return output;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2).filter((arg) => arg !== '--');
  const destination = args[0];
  const value = (flag, fallback) => (args.includes(flag) ? args[args.indexOf(flag) + 1] : fallback);
  if (!destination || destination.startsWith('-'))
    throw new Error('Usage: pnpm create:project ../my-app --name my-app --targets web|mobile|both');
  const output = createProject({
    destination,
    name: value('--name', basename(resolve(destination))),
    targets: value('--targets', 'both'),
  });
  if (existsSync(resolve(templateRoot, 'node_modules/.bin/oxfmt'))) {
    execFileSync('pnpm', ['exec', 'oxfmt', '--write', output], {
      cwd: templateRoot,
      stdio: 'inherit',
    });
  }
  console.log(
    `Created ${output}\nNext: cd to that directory, run pnpm install, pnpm i18n:compile, pnpm db:start.\nCommit the generated lockfile. No secrets or Git history were copied.`,
  );
}
