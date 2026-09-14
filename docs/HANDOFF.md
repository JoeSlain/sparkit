# Passation — Agency Starter

Mis à jour le 13 septembre 2026, vers 15 h 20 Europe/Paris. **Ce document ne constitue pas une autorisation de publier** (pas de GitHub / EAS cloud / stores).

## Reprise — avancement (clôturé localement)

Travail dans `/Users/joe/dev/agency-starter` uniquement.

| Priorité                          | État        | Preuve                                                                                                                                                                     |
| --------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 Isolation mobile seul           | **Fait**    | `@tamagui/core` + `@tamagui/stacks` ; peer `react-dom` ignoré. Copie mobile : 9/9 Jest sans `react-dom`.                                                                   |
| 2 Lockfile + web                  | **Fait**    | `pnpm install --frozen-lockfile` ; web 8 Vitest ; `pnpm verify` OK (rejoué 13/09 ~15 h).                                                                                   |
| 6 Générateur web/mobile/both      | **Partiel** | Copies QA validées (install + contrôles ciblés). `verify` complet par copie et cycle worktree Git réel restent après premier commit.                                       |
| 3–5 Docker / backend / E2E / Stim | **Fait***   | Docker + backend + Playwright **3/3**. Stim iOS sim + Auth Argent. Stim Android Pixel 9 Pro build/launch OK. *Maestro sign-in encore flaky ; UI Android post-launch = PIN. |

Prochaine action utile : cycle `pnpm worktree` live (HEAD existe). Android AVD : ≥ ~10 Gio libres ; device physique : `EXPO_PUBLIC_SUPABASE_ANDROID_URL=http://<LAN>:54381` (émulateur = `10.0.2.2`). Relancer Docker avec env minimal si `unexpected EOF`.

---

## Demande et décisions à préserver

Créer un template open source réutilisable, indépendant de l’App Factory. Le dépôt local est `/Users/joe/dev/agency-starter`. Le répertoire initial de la conversation était `/Users/joe/dev/app-factory` : toujours préciser le bon répertoire de travail ; ne pas modifier l’App Factory.

- Utiliser **pnpm**, décision utilisateur la plus récente. Nub sera évalué plus tard ; ne pas réintroduire Nub maintenant.
- Mobile : Expo natif iOS/Android, Expo Router, Tamagui 2. **Pas d’Expo Web.**
- Web : application séparée React/Vite, React Router Framework en mode SPA ; aucun serveur Node requis pour héberger le build statique.
- Lingui FR/EN, pas i18next.
- Supabase réel pour Auth, Postgres et Storage ; Drizzle produit les migrations de tables, Supabase CLI est l’unique exécuteur.
- TypeScript strict, TanStack Query, Valibot, pnpm workspaces, Turbo, oxlint/oxfmt, Varlock, Knip, Lefthook.
- Génération de projets `web`, `mobile`, `both`. Worktrees par ticket ; Stim pour les builds/exécutions, Argent/Maestro pour les vérifications natives.
- Les profils externes sont pour le moment des **recettes documentées**, pas des SDK actifs : Sentry, PostHog, RevenueCat, Resend, notifications, offline, design-ops, hébergement avancé. Ils restent à implémenter/qualifier selon la portée retenue. Ne pas présenter Sentry comme déjà branché.
- Ne pas publier sur GitHub, déployer, lancer EAS Cloud, créer des comptes payants ou soumettre aux stores sans décision de release.

Le nom `agency-starter`, la licence MIT et l’exemple profil/tâches privées ont été retenus comme choix de travail. Le projet n’a pas encore de dépôt distant.

## État Git — à lire avant toute opération

Dépôt Git sur `main` avec premier commit local `bee42c8` (pas de remote). Vérifier `git log -1` avant toute opération destructive. Le lockfile est aligné avec les manifests après la reprise (Tamagui lean + deps web validation) ; `pnpm install --frozen-lockfile` a réussi. Ne pas utiliser `git clean`, ne pas remplacer le dossier et ne pas supposer que les fichiers non suivis sont jetables.

Les agents ont travaillé dans des chemins disjoints : backend, frontend web, mobile ; le coordinateur a écrit l’outillage, i18n, le générateur et CI. Lire [AGENTS.md](../AGENTS.md), [PLAN.md](PLAN.md) et [CONTRACTS.md](CONTRACTS.md).

## Ce qui est implémenté

| Zone                       | État                                                                                                                                               |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web`                 | Auth réelle, profil, CRUD tâches, cache par utilisateur, FR/EN persisté, responsive, clavier, états loading/error/empty ; build SPA fonctionnel    |
| `apps/mobile`              | Même parcours Supabase, Tamagui, Expo Router, Query focus/réseau ; SecureStore découpé et sérialisé pour éviter les courses refresh/logout ; FR/EN |
| `packages/supabase`        | Client public typé et fonctions métier ; types générés depuis la DB locale réelle                                                                  |
| `packages/validation`      | Schémas Valibot partagés et tests                                                                                                                  |
| `packages/db`              | Schéma Drizzle, snapshot réel, export SQL immuable vers Supabase                                                                                   |
| `packages/i18n`            | 93 messages EN/FR au dernier relevé ; zéro traduction française manquante ; fichiers TS compilés ignorés par Git                                   |
| `packages/tokens`          | Tokens de couleur, espacement et arrondi ; UI spécifique à chaque plateforme                                                                       |
| `supabase`                 | Config locale, migrations, RLS, grants, Storage privé, fixtures Auth et pgTAP                                                                      |
| `scripts`                  | Générateur de projet, orchestration locale Supabase, worktrees, vérification et launcher Playwright                                                |
| `.github/workflows/ci.yml` | Jobs de vérification et backend/web écrits ; non exécutés sur GitHub                                                                               |
| Documentation              | README, contribution, sécurité, workflow quotidien, backend, profils optionnels, contrats                                                          |

Les primitives web sont locales ; ce n’est pas une installation complète de shadcn CLI. Il n’y a ni serveur Hono ajouté inutilement, ni synchronisation offline installée.

Versions principales : Node `24.16.0`, pnpm `10.34.5`, Expo `57.0.22`, React `19.3.0`, React Native `0.86.3`, Tamagui `2.7.7`, Lingui `6.7.0`, Supabase JS `2.116.0`, Query `5.102.8`, Valibot `1.5.0`, Router `8.3.1`, Vite `8.3.0`, Vitest `5.0.0`, TypeScript `6.0.3`, Stim `1.3.1`, Turbo `2.10.12`. Vérifier les manifests pour les pins finaux.

Expo a nécessité de fixer Reanimated `4.5.1`, Worklets `0.10.1`, Metro config `0.86.3` plutôt que les peers plus récents installés automatiquement. L’app utilise `com.agencystarter.app`, scheme `agencystarter`, runtimeVersion `fingerprint`. Les configs EAS existent, mais aucun projet EAS ni OTA réelle n’est configuré.

## Preuves et limites de validation

Les résultats suivants ont réellement été obtenus. Les changements de finition intervenus ensuite nécessitent une dernière passe complète.

| Vérification               | Résultat observé                                                                                                 |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Installation du monorepo   | Réussie ; lockfile figé OK après reprise (`--frozen-lockfile`)                                                   |
| `pnpm verify` racine       | Réussi à nouveau le 13/09 ~15 h : format, lint, types, tests et builds JS/Hermes                                 |
| TypeScript                 | Tous les packages passent ; frontend et mobile ont aussi repassé leurs contrôles ciblés après corrections        |
| Vitest racine              | 10 tests : 5 validation + 5 générateur/worktree, réussis                                                         |
| Web composants             | 8 tests réussis (dont 2 cas Valibot e-mail/mot de passe)                                                         |
| Mobile Jest                | 9 tests / 3 suites réussis dans le monorepo et dans les copies `mobile` / `both`                                 |
| Migrations                 | Reset local depuis zéro réussi (avant saturation) ; export Drizzle vérifié                                       |
| Sécurité SQL               | 22 assertions pgTAP réussies (avant saturation)                                                                  |
| Intégration backend réelle | 5 tests Auth/profil/tâches/Storage réussis, avant saturation du disque                                           |
| Web production             | Build statique réussi dans `apps/web/build/client` (rejoué à la reprise)                                         |
| Export natif JS/Hermes     | iOS et Android réussis via `pnpm verify` à la reprise ; ce ne sont pas des binaires natifs                       |
| Playwright apparence       | 1 scénario réussi (session antérieure) : FR/EN, persistance, tabulation, 390 px                                  |
| Playwright métier          | **3/3 OK** à la reprise (apparence + workspace + signup) ; toggle corrigé (optimistic + click async)             |
| Build/lancement iOS        | **OK** : `stim ios` → com.agencystarter.app sur BA7F60CF…, Metro 8082 ; Auth confirmée Argent                    |
| Build/lancement Android    | **OK** device : `stim android --device 56171FDAP000TX` (Pixel 9 Pro) ; APK + bundle Metro OK ; AVD bloqué ENOSPC |
| Maestro / Argent UI suite  | Auth iOS Argent OK ; Maestro sign-in flaky (focus TextInput / Save Password) ; pas de parcours complet vert      |
| Projet généré web seul     | Rejoué : install, Lingui, typecheck, 8 tests, build SPA ; aucun Expo/RN                                          |
| Projet généré mobile seul  | Rejoué : install sans `react-dom`, 9 Jest OK (fix Tamagui lean)                                                  |
| Projet généré both         | Rejoué : install, typecheck tous packages, 9 mobile + 8 web                                                      |
| Worktree                   | Tests unitaires de configuration réussis ; cycle Git + stack Supabase isolée + warm + nettoyage réel non exécuté |
| React Doctor               | Scan initial 72/100 ; mobile après correction des contextes 75/100, trois warnings examinés                      |

Les 5 tests de validation sont exécutés à plusieurs niveaux ; ne pas additionner deux fois les mêmes tests. Certains packages exposent encore des scripts `vitest --passWithNoTests` : leur succès n’est pas une preuve de tests métier supplémentaires.

Les warnings React Doctor mobiles restants concernent la complexité du dashboard, le logout dont le cache est purgé centralement au changement d’état Auth, et le brouillon du profil initialisé depuis les données puis volontairement conservé pendant les refetches. Pas de score parfait revendiqué.

## Priorités de reprise

### 1. Corriger l’isolation du profil mobile seul — FAIT (reprise)

Cause : import du paquet parapluie `tamagui` → `@tamagui/menu` → `@tamagui/popper` (`flushSync` depuis `react-dom` dans `Popper.native.js`). Correctif source : imports `@tamagui/core` / `@tamagui/stacks` uniquement ; peer `react-dom` ignoré volontairement (pas d’Expo Web / `react-native-web`). Revalidé sur copie mobile seule régénérée.

### 2. Figer les dernières modifications web et le lockfile — FAIT (reprise)

`pnpm install`, Lingui extract/compile, 8 tests web, typecheck et build SPA rejoués. Lockfile figé. Ne pas remettre un serveur de production ; `entry.server.tsx` + SPA restent la voie correcte.

### 3. Récupérer l’environnement local — PARTIEL (reprise)

Dernière mesure : environ **12 Gio** libres sur `/` — encore sous la marge 15–20 Go pour les builds iOS.

**Docker réparé le 13 sept. ~00:42** : control plane figé après `ENOSPC` (logs VM). Arrêt forcé des process Desktop (volumes intacts). Relance échouait avec `opening tray: starting electron: unmarshaling start request: unexpected EOF` tant que Docker était ouvert depuis un shell agent à gros environnement (bug Docker Desktop, limite spawn 16 KiB — voir docker/for-mac#7709). Correctif : lancer avec un env minimal, p.ex. `env -i HOME="$HOME" USER="$USER" PATH="/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin" open -a Docker`. Vérifié : `docker ps` OK, engine `28.5.1`, stack `agency-starter` healthy (edge_runtime relancé). Ne pas purger volumes/images des autres projets.

### 4. Rejouer le backend et les E2E web

La stack principale utilise `project_id = "agency-starter"`, API `54381`, DB `54382`, shadow `54383`, Studio `54384` et mail local `54385`. Studio et imgproxy sont exclus du démarrage quotidien.

```sh
cd /Users/joe/dev/agency-starter
export PATH="/Users/joe/.nvm/versions/node/v24.16.0/bin:$PATH"
pnpm install
pnpm i18n:extract
pnpm i18n:compile
pnpm db:start
pnpm db:reset
pnpm db:seed
pnpm db:test
pnpm test:integration
pnpm db:types
WEB_PORT=5197 pnpm test:e2e
```

`db:reset` efface exclusivement les données du backend local sélectionné. Examiner le diff des types générés. Les migrations actuelles sont `20260912191816_initial_schema.sql` et `20260912191817_security.sql` ; ne pas réécrire arbitrairement une migration déjà publiée.

Le port web 5173 était utilisé par un autre service : ne pas le tuer. Les essais de cette tâche ont utilisé 5197 ; vérifier qu’il est libre. Le launcher démarre et arrête son propre serveur et passe les clés administratives uniquement au processus de test. Il doit aussi être testé par son chemin normal, sans contournement du helper de statut.

Les tests de dépannage web ont utilisé temporairement le statut local mis en cache, car le control plane Docker était bloqué. **Ne pas ajouter de fallback automatique silencieux vers d’anciennes clés.**

### 5. Construire et tester réellement iOS puis Android

Lire le skill Stim et `pnpm exec stim guide agent` de la version installée. Lancer Stim depuis `apps/mobile`, jamais depuis la racine du monorepo. Les scripts Metro/export sont limités à deux workers ; garder un seul build et un seul device à la fois.

```sh
cd /Users/joe/dev/agency-starter/apps/mobile
pnpm exec stim doctor --platform ios
pnpm exec stim start
pnpm exec stim ios
pnpm exec stim logs --errors
```

Device créé par cette tâche : `BA7F60CF-4A39-4A2C-9904-45209FC7A0F0`, nommé `stim-agency-starter-mobile (iPhone 17 26.5)`. Il est arrêté. Metro utilisait le port 8082 ; **utiliser les nouvelles valeurs retournées par Stim à la reprise**. Identifiant app `com.agencystarter.app`.

Vérifier Auth, persistance de session après relance, profil, création/toggle/suppression d’une tâche, changement FR/EN et séparation des comptes avec Argent/Maestro. Le scénario est `tests/maestro/workspace.yaml`; lire ses variables et `apps/mobile/README.md`. Les comptes de fixtures sont locaux et documentés dans le README. Ne pas utiliser d’identifiants personnels.

Conserver screenshots et logs, puis arrêter le device possédé et répéter sur Android avec `doctor --platform android`, `stim start`, `stim android`. L’émulateur accède au backend local via `10.0.2.2`; un téléphone physique a besoin de `pnpm env:local --host IP_LAN`.

### 6. Terminer la validation du générateur et des worktrees

Le générateur refuse les destinations existantes et les chemins récursifs, y compris via symlink. Il exclut secrets, caches, Git et dossiers natifs générés. Il renomme les packages/bundles/scheme, retire la cible absente, ajuste la CI mobile seule et filtre les catalogues associés à la cible retirée. Le CLI applique oxfmt si disponible.

Recréer **trois dossiers neufs** avec `--targets web`, `mobile`, `both`. Leur premier install régénère un lockfile propre ; vérifier et committer ce lockfile avant les prochains installs frozen. Tester `verify`, extraction sans drift, comportement des scripts, absence d’Expo dans le profil web et indépendance du profil mobile.

`pnpm worktree APP-123` demande un `HEAD` existant : il faut donc d’abord un premier commit local vérifié. Il crée une branche `codex/app-123`, un dossier voisin et une config sous `.local/backend/supabase`, avec liens vers les migrations/tests et ports distincts. Cette config est ignorée par Git ; les commandes locales et le helper d’intégration la prennent en compte.

L’isolation est une stack Supabase complète par worktree, **pas** un Postgres partagé prétendument suffisant pour Auth/Storage. devflow n’est pas intégré. Les ports sont dérivés du ticket ; contrôler les collisions, y compris entre projets différents. Le script doit encore être testé avec un vrai worktree et une vraie stack, puis vérifier que les données ne croisent pas les branches.

`.worktreeexclude` empêche Stim de recopier les `.env*`, `.local` et métadonnées Supabase. `stim worktree warm` doit terminer avant installation/écritures concurrentes. Lire la documentation installée avant le nettoyage ; ne pas supprimer des ressources non possédées.

### 7. Passe finale et préparation open source

```sh
pnpm install --frozen-lockfile
pnpm format
pnpm i18n:extract
pnpm i18n:compile
pnpm verify
pnpm i18n:check
pnpm --filter @agency/db check
```

Le contrôle i18n compare désormais les catalogues avant/après extraction, même sans Git. Vérifier son comportement sur les trois cibles. Actualiser [PLAN.md](PLAN.md), README et un rapport final de validation. Examiner la CI, les suppressions de cibles dans le générateur et les exclusions Knip. Les jobs GitHub restent à exécuter après création du dépôt distant.

Installer les hooks volontairement avec `pnpm hooks:install` ; ne pas approuver aveuglément tous les scripts de dépendances. Une éventuelle adoption de Nub doit conserver une installation reproductible et être testée sur Metro/EAS/worktrees.

Créer ensuite le premier commit local après revue, sans inclure `.env*` réels, `.local`, artefacts, clés ou sorties natives. La publication reste une étape séparée.

## Artefacts locaux et nettoyage effectué

Les fichiers suivants ont été conservés sous `.local/handoff/` (ignorés par Git et le générateur) :

- `root-verify.log` : passe complète réussie à un état intermédiaire.
- `generated-mobile-install.log` et `generated-mobile-verify.log` : reproduction du problème Tamagui/react-dom.
- `supabase-reset.log` : reset initial réussi.

Captures Playwright : sous `apps/web/test-results/`, notamment le dossier `appearance-auth-screen-sup-3a854-French-and-narrow-viewports-chromium`. Logs Stim : `/Users/joe/.stim/workspaces/mobile--ca39f463166a3d0b/logs`, à lire avec `stim logs` plutôt que d’inférer le succès depuis l’absence de logs.

Copies de QA à la reprise : `/tmp/agency-qa-mobile` et `/tmp/agency-qa-both` (alignées sur le correctif Tamagui). La copie web seule a été validée puis supprimée pour l’espace. Elles ne sont pas le template source.

Pour récupérer de l’espace, seuls les Pods incomplets et DerivedData de **cette tâche** ainsi qu’un Chromium complet téléchargé pour ces tests ont été supprimés. Chromium headless a été conservé. Aucun nettoyage global de caches utilisateur, volumes Docker, autres projets ou devices personnels n’a été effectué. Le cache de compilation partagé Stim reste présent.

À la passation : aucun serveur web de cette tâche actif ; dernier `stim stop` réussi, Metro 8082 libéré et simulateur possédé arrêté ; commande `docker ps` pendue terminée. Docker lui-même reste à diagnostiquer. Un runner Argent sur iPhone physique appartenait à un autre contexte : il n’a pas été arrêté ni utilisé.

Cette passation contient des chemins et résultats propres à cette machine. La déplacer hors des livrables publics ou la rendre générique avant publication et avant une génération destinée à un tiers.
