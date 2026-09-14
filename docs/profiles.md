# Profils et intégrations optionnelles

Le générateur implémente actuellement trois **cibles** : `web`, `mobile` et `both`. Les profils ci-dessous décrivent des capacités optionnelles. Il n’existe pas de flag `--profile growth` ; l’activation se fait par variables d’environnement.

## Ce qui est présent

| Capacité                     | État                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------- |
| Auth, profil, tâches privées | Implémentés avec Supabase et RLS                                                            |
| Stockage privé               | Bucket, policies et tests API ; aucune interface d’upload d’exemple                         |
| Validation et FR/EN          | Valibot et Lingui partagés ; `pnpm i18n:translate` optionnel                                |
| UI web et native             | Applications séparées, contrats et tokens partagés                                          |
| Intégrations optionnelles    | Code préparé dans `@agency/integrations` + apps ; **désactivé sans config** (pas de trafic) |
| Génération par cible         | `--targets web\|mobile\|both`                                                               |
| Worktrees                    | Branche Git, configuration Supabase locale et ports distincts                               |
| EAS                          | Profiles + caches Gradle/ccache ; projet cloud et credentials à relier                      |

## Règle d’activation

Sans DSN/clé/`ENABLED` explicite, les clients restent des no-op. `APP_ENV` / `VITE_APP_ENV` / `EXPO_PUBLIC_APP_ENV=local` bloque aussi PostHog même si une clé est présente (évite le bruit en local). Les secrets serveur (`SENTRY_AUTH_TOKEN`, `RESEND_API_KEY`) ne vont jamais dans `VITE_*` / `EXPO_PUBLIC_*`.

## `observability` — Sentry

**Code** : `@sentry/react` (web), `@sentry/react-native` + plugin Expo (mobile). Android release : R8 minify + shrink + keep rules Sentry (`expo-build-properties`). Upload mapping/source maps via `SENTRY_AUTH_TOKEN` (+ `SENTRY_ORG` / `SENTRY_PROJECT`) sur EAS.

**Activer** : `VITE_SENTRY_DSN` / `EXPO_PUBLIC_SENTRY_DSN`.

Acceptation : erreur volontaire dans le bon environnement, stack lisible (JS + R8 mapping), pas d’envoi sans DSN.

## `growth` — PostHog

**Code** : `posthog-js` (web), `posthog-react-native` (mobile). Autocapture off ; identify/reset au changement de session.

**Activer** : `VITE_POSTHOG_KEY` / `EXPO_PUBLIC_POSTHOG_KEY` (+ host optionnel). Ignoré si env `local`.

## `payments` — RevenueCat

**Code** : `react-native-purchases` (mobile). `logIn` / `logOut` branchés sur la session Supabase.

**Activer** : `EXPO_PUBLIC_REVENUECAT_APPLE_KEY` / `EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY`.

Web paywall non inclus (choix produit). Webhooks serveur à ajouter côté backend quand les achats sont réels.

## `email` — Resend

**Code** : `@agency/integrations/email` (`sendTransactionalEmail`). Serveur/CI uniquement.

**Activer** : `RESEND_API_KEY` (+ `RESEND_FROM` optionnel).

## `notifications` — Expo Notifications

**Code** : `expo-notifications`. `registerForPush` exige permission + `eas.projectId`.

**Activer** : `EXPO_PUBLIC_NOTIFICATIONS_ENABLED=1` et projet EAS configuré.

Persistance du token push côté Supabase : à brancher quand le produit en a besoin.

## `offline` — PowerSync

**Code** : contrat `OfflineSyncClient` + garde-fou. Les packages `@powersync/*` ne sont pas installés par défaut (empreinte native lourde).

**Activer** : ajouter les deps PowerSync, puis `EXPO_PUBLIC_POWERSYNC_URL` et remplacer le stub dans `apps/mobile/src/integrations.ts`.

## `design-ops` / `heavy-ops`

Toujours documentaires (tokens pipeline, hébergement). Pas de SDK installé.

## Contrats automatiques

`packages/integrations` : tests Vitest sur les gates (config vide = disabled). Les essais fournisseur live ne sont pas revendiqués sans credentials.
