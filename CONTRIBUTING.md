# Contribuer

Merci de contribuer à ce starter. Les changements doivent rester utilisables dans des projets indépendants : éviter les chemins machine, comptes fournisseur, secrets ou conventions locales non documentées.

Les contributions et discussions peuvent être en français ou en anglais. Le code utilise des noms explicites en anglais ; les messages de l’interface passent par Lingui et disposent de catalogues anglais/français. La participation est régie par le [code de conduite](CODE_OF_CONDUCT.md).

## Préparer l’environnement

Lire `AGENTS.md`, `docs/CONTRACTS.md` et le [workflow quotidien](docs/daily-workflow.md). Utiliser Node 24.16.x et pnpm 10.34.5. pnpm est le gestionnaire et runner retenu ; ne pas introduire un second lockfile ou migrer vers Nub/Bun dans une modification sans rapport.

```sh
pnpm install --frozen-lockfile
pnpm i18n:compile
pnpm db:start
pnpm db:seed
```

Un moteur compatible Docker et Supabase CLI sont nécessaires aux tests backend. Le web et le mobile possèdent des prérequis supplémentaires décrits dans leurs README. Les fixtures Auth locales ne doivent jamais être créées en production.

Pour une tâche isolée, utiliser `pnpm worktree APP-123`. Travailler dans le chemin affiché, avec ses propres ports et fichiers d’environnement. Ne pas exécuter une migration sur une stack utilisée par une autre branche.

## Proposer une modification

1. Décrire le problème et le résultat attendu ; pour un changement d’architecture, expliquer son coût de maintenance pour les projets générés.
2. Respecter les contrats entre packages. Toute modification de l’API partagée doit être répercutée sur les deux applications concernées.
3. Ajouter ou ajuster les tests qui démontrent le comportement, puis exécuter les contrôles adaptés.
4. Actualiser la documentation, les catalogues et les exemples affectés.
5. Ouvrir une PR ciblée avec les résultats réellement obtenus et les limites restantes.

Les commits suivent une forme conventionnelle : `feat:`, `fix:`, `docs:`, `test:`, `chore:`. Une mise à jour de dépendance doit garder les versions exactes et le lockfile cohérents. Éviter de mélanger une migration majeure de framework avec une correction fonctionnelle.

## Frontières à conserver

- Le natif est Expo/React Native ; le web utilise React Router/Vite. Les deux utilisent Tamagui 2. `react-native-web` est autorisé uniquement comme rendu Tamagui côté web ; ne pas ajouter Expo Web ni de routage universel.
- `@sparkit/db` reste réservé au serveur et aux outils. Le client importe `@sparkit/supabase`.
- Supabase CLI est le seul exécuteur de migrations. Les migrations appliquées sont immuables.
- Les clés publiques peuvent être distribuées ; les clés administratives et secrets restent côté serveur/outils.
- Les intégrations optionnelles doivent fonctionner désactivées, sans trafic fournisseur caché.
- Les sessions et caches privés doivent être isolés entre utilisateurs.

Une modification SQL doit être testée avec deux utilisateurs et un client anonyme. Une modification de Storage doit utiliser les APIs réelles dans un test d’intégration ; les opérations SQL directes ne reproduisent pas tout le service.

## Vérifications

```sh
pnpm verify
pnpm db:test
pnpm test:integration
```

Ajouter `pnpm test:e2e` pour un parcours web et les tests sur device pour un parcours natif. Les tests navigateur nécessitent Chromium installé et une stack locale. Ne pas remplacer un échec d’infrastructure par un skip ou un mock qui donne artificiellement un résultat vert.

Une capture ou une vérification visuelle doit préciser la plateforme, la langue et le scénario. Pour le natif, noter le device réellement utilisé et distinguer export JavaScript, compilation native, lancement et fonctionnement du parcours.

Les mises à jour des migrations doivent inclure les types Supabase régénérés et le contrôle d’export Drizzle. Tester les changements de format du générateur sur les trois cibles ; une installation du monorepo source ne prouve pas qu’un projet généré est autonome.

Pour une modification de traduction :

```sh
pnpm i18n:extract
# optional: pnpm i18n:translate  (needs OPENAI_API_KEY or another provider key)
pnpm i18n:check
pnpm i18n:compile
```

## Ressources et collaboration avec des agents

Plusieurs agents peuvent travailler sur des chemins distincts, mais un seul responsable installe les dépendances et modifie le lockfile à un instant donné. Exécuter les builds natifs de façon séquentielle, réutiliser Metro et les caches, puis arrêter les stacks locales inutilisées.

Stim doit être exécuté depuis l’application. Lire son guide installé avant de modifier une procédure native. Les worktrees ne doivent pas recevoir les secrets du checkout source lors d’un `warm` ; conserver la politique d’exclusion du dépôt.

Ne pas publier une application, créer des ressources payantes, soumettre aux stores ou partager des données utilisateur dans le cadre d’une simple vérification locale. Les releases ont leur propre décision et configuration.

## Signaler un problème

Pour un bug public, fournir les versions, la cible, les étapes minimales et les logs expurgés. Ne pas joindre de `.env.local`, de JWT, de clé service-role ou de données utilisateur. Pour une faille de sécurité, suivre [SECURITY.md](SECURITY.md) plutôt qu’une issue publique contenant des détails exploitables.

## Licence

En proposant une contribution, vous acceptez qu’elle soit distribuée sous la licence MIT du projet. Vérifier les droits des dépendances, images, polices et autres ressources ajoutées.
