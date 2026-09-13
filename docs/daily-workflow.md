# Workflow quotidien

## Reprendre un checkout

Utiliser Node 24.16.x et la version pnpm du champ `packageManager`. Après un changement de dépendances :

```sh
pnpm install --frozen-lockfile
pnpm i18n:compile
pnpm db:start
pnpm db:seed
```

`db:start` régénère les environnements locaux à partir de la stack de ce checkout. Ne pas recopier le `.env.local` d’une autre branche. `db:seed` prépare les comptes locaux sans réinitialiser toutes les données. `db:reset` est réservé à une reconstruction volontaire : il efface les données locales avant de rejouer migrations et seed SQL.

Lancer le web avec `pnpm dev:web`. Pour le mobile, travailler depuis `apps/mobile`, lire `pnpm exec stim guide agent`, puis utiliser `doctor`, `start` et la commande `ios` ou `android` adaptée.

## Ouvrir un ticket isolé

Depuis le checkout principal, dont les changements nécessaires sont déjà commités :

```sh
pnpm worktree APP-123
```

Le script crée le worktree à partir de `HEAD`, sur `codex/app-123`. Les modifications non commitées du checkout source ne sont pas incluses. Le chemin est affiché ; il se trouve à côté du dépôt et porte le nom du projet suivi du ticket.

La configuration calculée est enregistrée dans `.local/worktree.json`. La stack utilise un `project_id` distinct et un bloc de ports ; son fichier Supabase est sous `.local/backend/supabase/config.toml`. Migrations, seed et tests y sont liés aux sources du worktree. Les callbacks web locaux reprennent son port web.

Dans le worktree, suivre les commandes affichées : installer les dépendances verrouillées, compiler les catalogues, démarrer la DB et préparer les fixtures. Lancer le web sur le port affiché, par exemple `pnpm dev:web --port PORT_AFFICHE`.

Les ports sont déterministes et peuvent exceptionnellement entrer en collision. Une collision doit être résolue en identifiant la ressource concernée ; ne pas arrêter un service d’un autre projet pour forcer le démarrage. Le script refuse aussi de remplacer un dossier de destination existant : reprendre le worktree déjà créé.

## Réutiliser les caches natifs sans copier les environnements

Stim peut réutiliser des dépendances et des artefacts ignorés avec `stim worktree warm`. **Par défaut, cette commande peut aussi copier des `.env` et des configurations locales.** Ce starter exige leur exclusion à la racine du checkout source, ainsi que celle de `.local` et des états Supabase.

La politique `.worktreeexclude` fournie exclut `.env*`, les environnements des applications, `.local` et les états Supabase. Avant le premier `warm`, vérifier qu’elle est présente dans le checkout source ; une politique `worktree.exclude` dans le `.stim.json` racine est une autre possibilité. Les règles de copie sont à la racine du dépôt ; les réglages de device et de runtime sont dans l’application. `pnpm exec stim guide settings` explique cette distinction et `pnpm exec stim guide lifecycle options` décrit les exclusions.

Si les exclusions ne sont pas configurées, utiliser une installation pnpm ordinaire et les caches partagés de compilation, puis laisser `pnpm db:start` créer les variables de la branche. Ne pas employer `warm` comme outil de distribution de secrets.

Lorsque les exclusions sont en place, lancer `warm` dans le worktree natif **avant** une installation ou toute écriture parallèle. Attendre sa réussite complète, puis vérifier les dépendances du lockfile et générer les environnements avec le script local. Un dossier ignoré déjà présent est conservé en entier par Stim ; une copie partielle n’est pas automatiquement complétée.

Depuis `apps/mobile` :

```sh
pnpm exec stim doctor --platform ios
pnpm exec stim start
pnpm exec stim ios
pnpm exec stim logs --errors
```

Adapter la plateforme pour Android. Réutiliser le device et Metro indiqués par Stim. Un retour de commande sans erreur ne suffit pas à confirmer qu’un écran fonctionne : reproduire l’action et vérifier l’état visible. Ne pas partager un device actif entre deux agents.

## Changer le backend

```sh
pnpm --filter @agency/db generate --name nom_du_changement
pnpm --filter @agency/db export
pnpm --filter @agency/db check
pnpm db:reset
pnpm db:test
pnpm db:types
pnpm test:integration
```

Cette reconstruction est volontairement destructive pour les données **locales** du checkout courant. Recréer les comptes de démonstration avec `pnpm db:seed` ensuite.

Drizzle décrit les tables ; Supabase CLI applique les migrations. Les policies, grants, fonctions privées, triggers Auth et règles Storage sont du SQL versionné. Une migration déjà appliquée ne se réécrit pas. Le [guide backend](backend.md) détaille les responsabilités et la vérification d’upgrade.

## Avant une revue

Exécuter les vérifications adaptées au changement. `pnpm verify` couvre les contrôles statiques, les tests des packages et les bundles. Ajouter `pnpm db:test` et `pnpm test:integration` pour le backend ; `pnpm test:e2e` pour le web ; les scénarios sur device pour le mobile. Le launcher Playwright démarre son propre serveur et refuse un port occupé. Depuis un worktree, fournir `WEB_PORT=PORT_AFFICHE pnpm test:e2e` après avoir arrêté le serveur web de développement sur ce port.

Pour une traduction, exécuter `pnpm i18n:extract`, compléter les catalogues puis `pnpm i18n:check` et `pnpm i18n:compile`. Contrôler visuellement les deux langues : la compilation ne détecte pas tous les débordements.

Dans la PR, expliquer le comportement attendu, les vérifications réellement exécutées et les prérequis externes encore absents. Ne pas présenter un mock de test comme une validation Supabase, un export JavaScript comme un build natif, ou une configuration EAS comme une release.

## Terminer et économiser les ressources

Arrêter le serveur web avec son terminal. Depuis l’application native, `pnpm exec stim stop` arrête les ressources locales qu’elle possède. Depuis la racine du worktree, `pnpm db:stop` arrête sa stack Supabase. Les fichiers du checkout restent disponibles.

Conserver les caches pnpm et Stim compatibles. Éviter plusieurs builds natifs simultanés et arrêter les simulateurs/émulateurs inutilisés. Le nettoyage d’un worktree ou de caches est une action distincte : vérifier d’abord que le travail est commité et que les ressources appartiennent à ce ticket. Ne pas lancer de suppression globale Docker ou de nettoyage forcé.

## Pourquoi pas devflow dans le socle ?

Le besoin du starter est une isolation vérifiable de la stack Supabase entière. Un Postgres partagé avec une DB logique par branche ne fournit pas, à lui seul, Auth, PostgREST, Storage, Realtime, leurs URLs et leurs configurations isolées.

L’intégration complète avec devflow n’a pas été validée ici ; devflow n’est donc pas installé ni requis. Le fallback retenu est Supabase CLI, un projet local et des ports par worktree. Il consomme davantage de mémoire qu’un seul moteur Postgres, mais conserve les mêmes services et contrats applicatifs. Une future optimisation doit démontrer cette isolation avec les tests réels avant de remplacer le mécanisme.

pnpm reste le gestionnaire et runner du projet ; Nub sera évalué séparément, sans migration implicite des équipes ou des projets générés.
