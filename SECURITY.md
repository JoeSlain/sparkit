# Sécurité

Ce starter fournit des protections et tests de référence ; il ne constitue pas un audit de sécurité du produit qui en sera dérivé. Chaque projet généré doit définir ses responsables, ses environnements, son processus de mise à jour et ses exigences métier.

## Signaler une vulnérabilité

Ne pas publier de secret, donnée utilisateur ou preuve directement exploitable dans une issue publique.

Si le dépôt qui distribue ce starter propose **Security → Report a vulnerability** sur GitHub, utiliser ce canal privé. Sinon, contacter le mainteneur par un canal privé déjà identifié dans ce dépôt. Aucun email de sécurité fictif n’est fourni ici. Le propriétaire d’un projet dérivé doit publier son contact et sa politique de traitement avant une ouverture au public.

Préciser la version ou le commit affecté, les conditions nécessaires, les étapes de reproduction, l’impact et une suggestion de correction si disponible. Utiliser des comptes et données de test. Aucune durée garantie de réponse ou liste de versions maintenues n’est annoncée sans équipe et procédure correspondantes.

**English:** Please disclose vulnerabilities privately through the repository's enabled security-reporting channel or an established private maintainer contact. Do not post credentials, personal data or immediately exploitable details in public issues. Derived projects must publish their own security contact and support policy.

## Secrets et données

Les variables `VITE_*` et `EXPO_PUBLIC_*` sont accessibles dans les applications distribuées. N’y placer que des valeurs publiques prévues à cet effet. Une clé Supabase publishable/anon n’est pas un mécanisme d’autorisation à elle seule : les grants et RLS restent indispensables.

Les clés secrètes/service-role et les connexions Postgres privilégiées contournent les protections utilisateur usuelles. Elles restent dans les outils serveur, la CI ou les scripts locaux de test. Ne pas exporter ces valeurs dans un bundle, un log, une capture, un rapport de test ou une URL.

Les fichiers `.env.local` et `.local/` sont exclus de Git. `.local/supabase.json` peut contenir des credentials de la stack locale ; ne pas le joindre à une issue. Le générateur ne copie pas les secrets et les workflows de worktree doivent préserver cette isolation. Les environnements de branche sont régénérés à partir de leur propre stack.

En cas d’exposition d’un vrai secret, le révoquer ou le faire tourner chez le fournisseur, déterminer le périmètre affecté et rechercher les usages non autorisés. Supprimer un fichier d’un commit ne révoque pas son contenu déjà diffusé.

## Contrôles présents

Le client utilise de vraies sessions Supabase. Les requêtes de données sont protégées par RLS ; les colonnes sensibles disposent de grants restreints. Les profils et tâches sont privés par utilisateur. Les fonctions Auth privilégiées ont une responsabilité limitée et un search path explicite.

Le bucket `user-files` est privé et ses policies exigent un préfixe de chemin correspondant à l’utilisateur. Les tests réels vérifient qu’un second utilisateur ne peut pas lire ou supprimer les fichiers du premier via l’API. Les limites de taille et de type MIME constituent des contrôles de stockage, pas une analyse antivirus du contenu.

Les applications doivent vider les caches privés lorsqu’un compte change. Le natif conserve la session dans SecureStore ; le navigateur conserve la session dans son environnement de stockage. Toute donnée reçue côté client doit être considérée comme accessible à cet utilisateur et à un environnement client compromis.

## Frontières de confiance

Valider l’entrée côté interface améliore l’expérience, mais ne remplace pas la validation serveur ou les contraintes SQL. Ne pas déduire un droit d’accès d’un filtre de requête, d’un bouton caché, d’un feature flag ou d’un identifiant difficile à deviner.

Les webhooks d’une future intégration doivent vérifier l’émetteur et gérer les doublons. Une route administrative doit autoriser l’opération avant d’utiliser un client privilégié. Les claims ou métadonnées modifiables par l’utilisateur ne doivent pas servir de rôle administratif.

## Environnements locaux

Les scripts de seed/intégration refusent les endpoints non locaux et utilisent les credentials de la stack du checkout courant. Les comptes `alice@example.test` et `bob@example.test` et leur mot de passe sont des fixtures publiques de développement. Ne jamais les créer sur un environnement accessible au public.

Les confirmations email sont désactivées dans la configuration locale. Les providers OAuth, domaines d’envoi et parcours réels des stores ne sont pas configurés par ce réglage. Un service local n’est pas destiné à être exposé sur Internet ; l’accès depuis un appareil sur le LAN doit rester limité au réseau de développement choisi.

`db:reset` efface les données locales. Vérifier le checkout et l’environnement avant toute commande destructive. Les scripts ne doivent pas être adaptés pour cibler production en réutilisant une option de test locale.

## Avant une release

Le responsable du produit doit vérifier au minimum :

- Les RLS, grants et chemins Storage réellement déployés, avec tests entre utilisateurs.
- Les redirects Auth, schemes/deep links, confirmations, récupération de compte et configuration email.
- La séparation staging/production, l’accès des membres de l’équipe et la rotation des secrets.
- La suppression de compte et de ses fichiers, les sauvegardes DB **et objets**, puis une restauration exercée.
- Les journaux et outils optionnels, pour éviter l’envoi de tokens ou de données privées.
- Les dépendances, les versions natives compatibles et les procédures de rollback.

Les backups PostgreSQL ne contiennent pas les blobs Storage. Une suppression Auth seule ne suffit pas à implémenter tout le parcours de suppression des fichiers. Les applications manipulant des uploads non fiables peuvent nécessiter des contrôles supplémentaires adaptés à leur usage.

Les questions de conformité, conservation, consentement et données sensibles dépendent du produit et de ses marchés. Elles doivent être traitées au niveau de l’application finale, sans considérer ce template comme une certification.
