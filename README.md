<p align="center">
  <img src="docs/assets/banner.png" alt="Sparkit mascot"/>
</p>

# Sparkit

A standalone TypeScript starter for a native iOS/Android app, a web app, or both.

The example includes real Supabase authentication, an editable profile, and private persistent tasks. UIs are localized in English and French with Lingui. Data is not mocked.

Optional paid services are integration recipes, not enabled SDKs. MIT licensed.

## Architecture

| Area | Choice |
| ---- | ------ |
| Mobile | Expo, Expo Router, React Native, Tamagui 2 |
| Web | React Router Framework SPA, React, Vite, Tamagui 2 |
| Data | Supabase Auth, Postgres, private Storage, TanStack Query |
| Schema | Drizzle for tables; Supabase CLI as the sole migration runner |
| Validation / i18n | Valibot; Lingui with English source messages and FR/EN catalogs |
| Development | pnpm, Turborepo, strict TypeScript, oxlint, oxfmt, Varlock, Knip, Lefthook |
| Tests | Vitest, component tests, pgTAP, Supabase integration, Playwright, Maestro scenario |
| Native runtime | Stim and Expo development builds |

Mobile targets iOS and Android only. Web and mobile both use Tamagui 2 for UI. Web keeps its own router (React Router) and may use `react-native-web` only as Tamagui's renderer; there is no Expo Web export. Shared packages cover contracts, data, translations, and tokens.

pnpm is the package manager and runner. Nub remains a possible future path, to qualify before changing the lockfile and commands. Bun and devflow are not required.

## Getting started

Prerequisites: Node 24.16.x, pnpm 10.34.5, Git, Docker or a compatible engine, Supabase CLI. JavaScript dependencies are locked in the repo. iOS builds need macOS and Xcode; Android needs the Android SDK and a compatible emulator. Stim reports missing native prerequisites with `doctor`.

From the cloned starter root:

```sh
pnpm install --frozen-lockfile
pnpm i18n:compile
pnpm db:start
pnpm db:seed
pnpm dev:web
```

Web usually listens on `http://127.0.0.1:5173`. `db:start` brings up the local Supabase stack and generates app env files. Local ports start at 54381. Studio and imgproxy are not started by the daily script, to keep resource use down.

**Local-only** demo accounts are `alice@example.test` and `bob@example.test`, with the public password `Local-test-password-42!`. They are for starter trials; do not create them on a hosted project. Integration tests create their own temporary users.

For mobile, after the preparation above:

```sh
cd apps/mobile
pnpm exec stim guide agent
pnpm exec stim doctor --platform ios
pnpm exec stim start
pnpm exec stim ios
```

Use `doctor --platform android` and `stim android` for Android. Run one platform at a time and keep the exact device ID and Metro port Stim reports. JavaScript changes use Fast Refresh; native changes need a new build. `pnpm dev:mobile` remains available to start the Expo development server without Stim orchestration.

The Android emulator gets an adapted local URL via `EXPO_PUBLIC_SUPABASE_ANDROID_URL`. For a physical device, regenerate env vars with `pnpm env:local --host LAN_ADDRESS` on a trusted development network.

## Create an independent project

```sh
pnpm create:project ../my-app --name my-app --targets both
cd ../my-app
pnpm install
pnpm i18n:compile
pnpm db:start
pnpm db:seed
```

`--targets` accepts `web`, `mobile`, or `both`. The generator refuses an existing directory, removes unselected targets, and excludes secrets, caches, installed dependencies, and Git history. The first install in the generated project produces its own lockfile: verify and commit it, then use `pnpm install --frozen-lockfile` afterward. Also initialize its own Git repository before using worktrees.

Choose the product's bundle IDs, native scheme, and Auth redirects before any release. The generator does not open provider accounts, deploy anything, or submit to stores.

## Useful commands

| Command | Effect |
| ------- | ------ |
| `pnpm verify` | Catalog compile, format, lint, types, automated tests, and package builds |
| `pnpm test:integration` | Real auth, CRUD, and Storage against the local stack |
| `pnpm db:test` | pgTAP SQL assertions, including cross-user isolation |
| `pnpm db:reset` | Rebuilds the **local** DB from migrations; wipes its data |
| `pnpm db:seed` | Prepares the two local demo accounts |
| `pnpm db:types` | Regenerates types from the local DB |
| `pnpm test:e2e` | Starts its web server and Playwright against local Supabase; free web port required |
| `pnpm i18n:extract` | Updates catalog messages |
| `pnpm i18n:translate` | Fills missing French via `lingui-ai-translate` (API key required, outside verify) |
| `pnpm i18n:check` | Checks expected translations are present |
| `pnpm deadcode` | Finds unused files, exports, and dependencies |
| `pnpm db:stop` | Stops this checkout's local stack |

`verify` does not replace Supabase tests, browser tests, or device trials. The `build:ios` and `build:android` scripts export JavaScript bundles; they do not alone produce a signed binary or prove a native launch.

The `test:e2e` launcher reads local credentials without printing them, passes the admin key only to the test process, and stops its server when done. It refuses a port already in use; stop the web dev server or set `WEB_PORT=FREE_PORT`. Chromium must be installed for Playwright.

The Maestro scenario lives in `tests/maestro/workspace.yaml`. Web/native test prerequisites and variables are described in each app's README. Test accounts and admin keys stay on the test-tool side only.

## Work by ticket

```sh
pnpm worktree APP-123
```

Creates a `codex/app-123` branch, a neighboring checkout, and a distinct Supabase config under `.local/backend`. It prints ports and the next commands. It does not start services or copy secrets. Stop unused stacks and devices to limit memory use.

One Postgres DB per branch is not enough to isolate Auth, Storage, and other Supabase services. The starter therefore uses full local stacks with their own ports. devflow is not integrated: its shared-Postgres mode is not a validated full Supabase integration for this project. See the [daily workflow](docs/daily-workflow.md).

## Documentation

- [Backend architecture and migrations](docs/backend.md)
- [Daily workflow and worktrees](docs/daily-workflow.md)
- [Profiles and optional integrations](docs/profiles.md)
- [Shared contracts](docs/CONTRACTS.md)
- [Web app](apps/web/README.md)
- [Native app](apps/mobile/README.md)
- [Contributing](CONTRIBUTING.md) and [security](SECURITY.md)

Sentry, PostHog, RevenueCat, Resend, notifications, and offline profiles are **wired in code** (`@sparkit/integrations` plus web/mobile wiring) and stay **off without env vars**. No optional network traffic locally by default. design-ops / heavy-ops remain documentary. EAS configs must be linked to a project and credentials before any release.

MIT license. See `LICENSE`.

<details>
<summary>Français</summary>

# Sparkit

Un starter TypeScript pour créer une application iOS/Android, une application web, ou les deux.

L’exemple comprend une vraie authentification Supabase, un profil modifiable et des tâches privées persistantes. Les interfaces sont traduites en anglais et français avec Lingui. Les données ne sont pas simulées.

Les services payants optionnels sont des recettes d’intégration, pas des SDK activés. Licence MIT.

## Architecture

| Partie | Choix |
| ------ | ----- |
| Mobile | Expo, Expo Router, React Native, Tamagui 2 |
| Web | React Router Framework en SPA, React, Vite, Tamagui 2 |
| Données | Supabase Auth, Postgres, Storage privé, TanStack Query |
| Schéma | Drizzle pour les tables ; Supabase CLI comme seul exécuteur des migrations |
| Validation / langues | Valibot ; Lingui avec messages anglais et catalogues FR/EN |
| Développement | pnpm, Turborepo, TypeScript strict, oxlint, oxfmt, Varlock, Knip, Lefthook |
| Tests | Vitest, tests de composants, pgTAP, intégration Supabase, Playwright, scénario Maestro |
| Exécution native | Stim et builds de développement Expo |

Le mobile cible uniquement iOS et Android. Le web et le mobile utilisent tous deux Tamagui 2 pour l’UI. Le web conserve son propre routeur (React Router) et peut utiliser `react-native-web` uniquement comme rendu Tamagui ; aucun export Expo Web n’est prévu. Les packages partagent les contrats, les données, les traductions et les tokens.

pnpm est le gestionnaire et runner actuel. Nub reste une évolution possible, à qualifier avant de changer le lockfile et les commandes. Bun et devflow ne sont pas requis.

## Démarrer

Prérequis : Node 24.16.x, pnpm 10.34.5, Git, Docker ou un moteur compatible, Supabase CLI. Les dépendances JavaScript sont verrouillées dans le dépôt. Les builds iOS nécessitent macOS et Xcode ; Android nécessite le SDK Android et un émulateur compatible. Stim indique les prérequis natifs manquants avec `doctor`.

Depuis la racine du starter cloné :

```sh
pnpm install --frozen-lockfile
pnpm i18n:compile
pnpm db:start
pnpm db:seed
pnpm dev:web
```

Le web écoute normalement sur `http://127.0.0.1:5173`. `db:start` lance la stack Supabase locale et génère les fichiers d’environnement des applications. Les ports locaux commencent à 54381. Studio et imgproxy ne sont pas lancés par le script quotidien afin de réduire les ressources utilisées.

Les comptes de démonstration **locaux uniquement** sont `alice@example.test` et `bob@example.test`, avec le mot de passe public `Local-test-password-42!`. Ils servent aux essais du starter ; ne pas les créer sur un projet hébergé. Les tests d’intégration créent leurs propres utilisateurs temporaires.

Pour le mobile, après la préparation ci-dessus :

```sh
cd apps/mobile
pnpm exec stim guide agent
pnpm exec stim doctor --platform ios
pnpm exec stim start
pnpm exec stim ios
```

Utiliser `doctor --platform android` et `stim android` pour Android. Exécuter une plateforme à la fois et conserver l’identifiant exact du device et le port Metro indiqués par Stim. Un changement JavaScript utilise Fast Refresh ; un changement natif nécessite un nouveau build. `pnpm dev:mobile` reste disponible pour démarrer le serveur Expo de développement sans orchestration Stim.

L’émulateur Android reçoit une URL locale adaptée via `EXPO_PUBLIC_SUPABASE_ANDROID_URL`. Pour un appareil physique, régénérer les variables avec `pnpm env:local --host ADRESSE_LAN` sur un réseau de développement maîtrisé.

## Créer un projet indépendant

```sh
pnpm create:project ../mon-app --name mon-app --targets both
cd ../mon-app
pnpm install
pnpm i18n:compile
pnpm db:start
pnpm db:seed
```

`--targets` accepte `web`, `mobile` ou `both`. Le générateur refuse un dossier existant, retire les cibles non choisies et exclut les secrets, caches, dépendances installées et l’historique Git. La première installation du projet généré produit son propre lockfile : le vérifier et le committer, puis utiliser `pnpm install --frozen-lockfile` ensuite. Initialiser également son propre dépôt Git avant d’utiliser les worktrees.

Choisir les identifiants de bundle, le scheme natif et les redirects Auth du produit avant une publication. Le générateur n’ouvre aucun compte fournisseur, ne déploie rien et ne soumet rien aux stores.

## Commandes utiles

| Commande | Effet |
| -------- | ----- |
| `pnpm verify` | Compilation des catalogues, format, lint, types, tests automatiques et builds des packages |
| `pnpm test:integration` | Auth, CRUD et Storage réels contre la stack locale |
| `pnpm db:test` | Assertions SQL pgTAP, dont isolation entre utilisateurs |
| `pnpm db:reset` | Reconstruit la DB **locale** depuis les migrations ; efface ses données |
| `pnpm db:seed` | Prépare les deux comptes locaux de démonstration |
| `pnpm db:types` | Régénère les types à partir de la DB locale |
| `pnpm test:e2e` | Lance son serveur web et Playwright contre Supabase local ; port web libre requis |
| `pnpm i18n:extract` | Met à jour les messages des catalogues |
| `pnpm i18n:translate` | Remplit le français manquant via `lingui-ai-translate` (clé API requise, hors verify) |
| `pnpm i18n:check` | Vérifie la présence des traductions attendues |
| `pnpm deadcode` | Analyse des fichiers, exports et dépendances inutilisés |
| `pnpm db:stop` | Arrête la stack locale de ce checkout |

`verify` ne remplace pas les tests contre Supabase, les tests navigateur ou les essais sur device. Les scripts `build:ios` et `build:android` exportent les bundles JavaScript ; ils ne produisent pas, à eux seuls, un binaire signé ni une preuve de lancement natif.

Le launcher `test:e2e` lit les credentials locaux sans les afficher, transmet la clé administrative uniquement au processus de test et arrête son serveur à la fin. Il refuse un port déjà utilisé ; arrêter le serveur web de développement ou fournir `WEB_PORT=PORT_LIBRE`. Chromium doit être installé pour Playwright.

Le scénario Maestro se trouve dans `tests/maestro/workspace.yaml`. Les prérequis et variables des tests web/native sont décrits dans les README de chaque application. Les comptes de test et clés administratives restent exclusivement côté outils de test.

## Travailler par ticket

```sh
pnpm worktree APP-123
```

La commande crée une branche `codex/app-123`, un checkout voisin et une configuration Supabase distincte sous `.local/backend`. Elle indique les ports et la suite des commandes. Elle ne lance pas les services et ne copie pas les secrets. Arrêter les stacks et devices inutilisés pour limiter la mémoire consommée.

Une DB Postgres par branche ne suffit pas à isoler Auth, Storage et les autres services Supabase. Le starter utilise donc des stacks locales complètes avec leurs propres ports. devflow n’est pas intégré : son mode Postgres partagé ne constitue pas une intégration Supabase complète validée pour ce projet. Voir le [workflow quotidien](docs/daily-workflow.md).

## Documentation

- [Architecture et migrations backend](docs/backend.md)
- [Workflow quotidien et worktrees](docs/daily-workflow.md)
- [Profils et intégrations optionnelles](docs/profiles.md)
- [Contrats partagés](docs/CONTRACTS.md)
- [Application web](apps/web/README.md)
- [Application native](apps/mobile/README.md)
- [Contribuer](CONTRIBUTING.md) et [sécurité](SECURITY.md)

Les profils Sentry, PostHog, RevenueCat, Resend, notifications et offline sont **préparés dans le code** (`@sparkit/integrations` + wiring web/mobile) et restent **éteints sans variables**. Pas de trafic réseau optionnel en local par défaut. design-ops / heavy-ops restent documentaires. Les configurations EAS doivent être reliées à un projet et à des credentials avant toute release.

Licence MIT. Consulter `LICENSE`.

</details>
