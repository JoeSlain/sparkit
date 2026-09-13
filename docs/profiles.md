# Profils et intégrations optionnelles

Le générateur implémente actuellement trois **cibles** : `web`, `mobile` et `both`. Les profils ci-dessous décrivent des capacités à ajouter selon le produit. Il n’existe pas de flag `--profile growth` ou de plugin installant automatiquement ces services.

## Ce qui est présent

| Capacité                       | État                                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------------------ |
| Auth, profil, tâches privées   | Implémentés avec Supabase et RLS                                                           |
| Stockage privé                 | Bucket, policies et tests API ; aucune interface d’upload d’exemple                        |
| Validation et FR/EN            | Valibot et Lingui partagés                                                                 |
| UI web et native               | Applications séparées, contrats et tokens partagés                                         |
| Génération par cible           | `--targets web\|mobile\|both`                                                              |
| Worktrees                      | Branche Git, configuration Supabase locale et ports distincts                              |
| EAS                            | Configuration native préparée ; connexion au compte, credentials et publication à réaliser |
| Services optionnels ci-dessous | Recettes ; SDKs et comptes réels non configurés par défaut                                 |

Supabase Realtime est disponible dans la stack locale, mais l’exemple de tâches utilise les requêtes et mutations de TanStack Query. Il n’implémente pas une synchronisation offline ni une souscription Realtime automatique.

## `core`

Le socle comprend Expo/Tamagui pour le natif, React Router/Vite pour le web, Supabase, Drizzle, Valibot, Lingui, TanStack Query et les outils de qualité. pnpm et Turborepo sont les outils actifs. Stim sert à l’exécution native ; Supabase CLI reste responsable des services et migrations.

L’observabilité externalisée est un choix d’intégration ultérieur. La présence d’un emplacement de configuration ne signifie pas qu’un SDK est installé, que ses erreurs remontent ou que ses source maps sont publiées.

## `observability` — Sentry

À ajouter : SDK adapté à chaque application, initialisation conditionnée à un DSN explicite, environnement, identifiant de release et configuration de l’envoi des source maps. Les tokens d’upload appartiennent à la CI ; ils n’entrent pas dans le bundle.

Acceptation avant activation : erreur volontaire retrouvée dans le bon projet/environnement, stack lisible sur une build de release et sur un update compatible, filtrage des données personnelles, absence d’envoi lorsque l’intégration est désactivée. Aucun de ces résultats fournisseur n’est revendiqué par le starter.

## `growth` — PostHog

Définir d’abord une liste limitée d’événements métier et les propriétés autorisées. Installer ensuite les SDKs nécessaires, désactiver les collectes non voulues, et prévoir identification après connexion puis reset lors du changement de compte. Les feature flags influent sur l’interface ; l’autorisation reste côté backend.

Acceptation : événements vérifiés dans un environnement de test, absence de payload privé, comportement explicite sans réseau et sans configuration. La politique de consentement, la région de traitement et la conservation relèvent du produit et de ses marchés.

## `payments` — RevenueCat

Configurer les produits et abonnements dans les stores, les droits RevenueCat et les clés publiques propres à chaque plateforme. Raccorder l’identité applicative, l’achat, la restauration et l’affichage du droit actif. Les webhooks doivent vérifier leur authenticité, tolérer les doublons et mettre à jour l’état serveur de façon idempotente.

Acceptation : achat sandbox, restauration, annulation/expiration, changement de compte et webhook répété. Une clé publique ou un paywall rendu ne constitue pas une intégration de paiement validée. Le parcours web doit être choisi selon le produit et les règles applicables ; il n’est pas déduit automatiquement du SDK natif.

## `email` — Resend

Envoyer les emails depuis une fonction ou un backend autorisé, jamais directement avec une clé secrète côté client. Vérifier le domaine d’envoi, versionner les templates et prévoir idempotence, retries limités et journalisation sans contenu sensible.

L’email transactionnel produit et les emails Supabase Auth sont deux configurations à expliciter. Une boîte mail locale ne prouve pas la délivrabilité en production. Vérifier les parcours de confirmation et de récupération avec le fournisseur réel.

## `notifications` — Expo Notifications

Ajouter le SDK, les permissions et les credentials requis. Enregistrer les tokens côté serveur avec l’utilisateur, la plateforme et l’installation ; traiter tokens invalides, déconnexion et changement de compte. Prévoir un comportement utile lorsque la permission est refusée.

Acceptation sur appareils compatibles : autorisation/refus, réception et ouverture, deep link vers un contenu autorisé, utilisateur déconnecté, environnement staging séparé de production. Un émulateur ou un mock ne couvre pas toutes ces étapes.

## `offline` — PowerSync

Activer ce profil quand le produit exige de vraies écritures hors connexion. SQLite devient la source locale des données synchronisées ; éviter de maintenir sans raison un second cache autoritaire des mêmes lignes dans TanStack Query.

À concevoir : périmètre des données synchronisées, autorisation de lecture du flux, validation des uploads, identifiants générés côté client, conflits, erreurs permanentes, indicateur de synchronisation et effacement des données au changement de compte. Les règles de sync ne remplacent pas automatiquement les RLS PostgreSQL.

Acceptation : perte réseau prolongée, arrêt/redémarrage de l’app, mutations concurrentes, reconnexion, refus serveur et isolation de deux utilisateurs. PowerSync n’est pas installé dans le starter.

Zero supporte React Native/Expo, mais ses contraintes concernant les écritures offline doivent être vérifiées pour la version retenue. Il ne doit pas être présenté comme un remplacement interchangeable de PowerSync pour une app autonome hors connexion.

## `design-ops`

Les tokens partagés du starter constituent un point d’entrée. Un pipeline Tokens Studio → Style Dictionary → configuration Tamagui/CSS doit définir une source unique, des noms stables, les modes et un contrôle des différences générées. Ne pas entretenir plusieurs palettes manuelles portant le même rôle.

Storybook, Chromatic, Figma Code Connect et Figma MCP ne sont pas installés ni connectés ici. Avant de les ajouter, choisir les composants réellement maintenus, les états accessibles et la couverture des plateformes. Vérifier qu’un changement de token se propage jusqu’au rendu web et natif, puis contrôler les états sombres, erreurs, chargements et textes longs.

## `heavy-ops` — hébergement avancé

Le premier déploiement peut rester sur Supabase Cloud, EAS pour les builds natifs et un hébergeur statique pour le web SPA. Le dossier web de sortie est `apps/web/build/client` ; l’hôte doit servir `index.html` sur les routes applicatives.

Uncloud ou SST nécessitent un besoin identifié, une infrastructure versionnée, un responsable opérationnel, des sauvegardes, une restauration testée et une méthode de rollback. Ils ne sont pas installés et aucun environnement distant n’est provisionné par le générateur.

## Règle d’activation

Chaque intégration doit documenter sa configuration, son comportement désactivé, ses coûts attendus, ses données envoyées, ses tests de contrat et les essais fournisseur effectivement réalisés. Conserver une frontière claire entre « code préparé », « test automatique local réussi » et « service externe validé ». Sans activation explicite, le starter ne doit pas émettre de trafic vers ces services optionnels.
