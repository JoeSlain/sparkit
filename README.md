# Agency Starter

Un starter TypeScript pour créer une application iOS/Android, une application web, ou les deux. Le projet est indépendant de l’App Factory : il peut être copié, versionné et maintenu séparément.

L’exemple comprend une vraie authentification Supabase, un profil modifiable et des tâches privées persistantes. Les interfaces sont traduites en anglais et français avec Lingui. Les données ne sont pas simulées.

**English:** A standalone TypeScript starter for native iOS/Android and/or web applications, with real Supabase authentication, private CRUD, FR/EN localization, a project generator and isolated local development workflows. MIT licensed. Optional paid services are integration recipes, not enabled SDKs.

## Architecture

| Partie               | Choix                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------- |
| Mobile               | Expo, Expo Router, React Native, Tamagui 2                                             |
| Web                  | React Router Framework en SPA, React, Vite, Tailwind, composants locaux                |
| Données              | Supabase Auth, Postgres, Storage privé, TanStack Query                                 |
| Schéma               | Drizzle pour les tables ; Supabase CLI comme seul exécuteur des migrations             |
| Validation / langues | Valibot ; Lingui avec messages anglais et catalogues FR/EN                             |
| Développement        | pnpm, Turborepo, TypeScript strict, oxlint, oxfmt, Varlock, Knip, Lefthook             |
| Tests                | Vitest, tests de composants, pgTAP, intégration Supabase, Playwright, scénario Maestro |
| Exécution native     | Stim et builds de développement Expo                                                   |

Le mobile cible uniquement iOS et Android. Le web a son propre routeur et ses propres composants ; aucun export Expo Web n’est prévu. Les packages partagent les contrats, les données, les traductions et les tokens, sans imposer un même composant à toutes les plateformes.

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

| Commande                | Effet                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------ |
| `pnpm verify`           | Compilation des catalogues, format, lint, types, tests automatiques et builds des packages |
| `pnpm test:integration` | Auth, CRUD et Storage réels contre la stack locale                                         |
| `pnpm db:test`          | Assertions SQL pgTAP, dont isolation entre utilisateurs                                    |
| `pnpm db:reset`         | Reconstruit la DB **locale** depuis les migrations ; efface ses données                    |
| `pnpm db:seed`          | Prépare les deux comptes locaux de démonstration                                           |
| `pnpm db:types`         | Régénère les types à partir de la DB locale                                                |
| `pnpm test:e2e`         | Lance son serveur web et Playwright contre Supabase local ; port web libre requis          |
| `pnpm i18n:extract`     | Met à jour les messages des catalogues                                                     |
| `pnpm i18n:check`       | Vérifie la présence des traductions attendues                                              |
| `pnpm deadcode`         | Analyse des fichiers, exports et dépendances inutilisés                                    |
| `pnpm db:stop`          | Arrête la stack locale de ce checkout                                                      |

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

Les profils Sentry, PostHog, RevenueCat, Resend, notifications, offline, design-ops et hébergement avancé sont documentés comme recettes. Ils ne sont pas annoncés comme des intégrations opérationnelles ou validées avec un compte réel. Les configurations EAS doivent être reliées à un projet et à des credentials avant toute release.

Licence MIT. Consulter `LICENSE`.
