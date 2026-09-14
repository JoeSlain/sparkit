import * as Sentry from '@sentry/react-native';
import PostHog from 'posthog-react-native';
import Purchases from 'react-native-purchases';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import {
  disabledAnalytics,
  disabledNotifications,
  disabledObservability,
  disabledOfflineSync,
  disabledPayments,
  trimPublicConfig,
  type AnalyticsClient,
  type NotificationsClient,
  type ObservabilityClient,
  type OfflineSyncClient,
  type PaymentsClient,
} from '@agency/integrations';

const sentryDsn = trimPublicConfig(process.env.EXPO_PUBLIC_SENTRY_DSN);
const posthogKey = trimPublicConfig(process.env.EXPO_PUBLIC_POSTHOG_KEY);
const posthogHost =
  trimPublicConfig(process.env.EXPO_PUBLIC_POSTHOG_HOST) ?? 'https://us.i.posthog.com';
const revenueCatApple = trimPublicConfig(process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY);
const revenueCatGoogle = trimPublicConfig(process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY);
const notificationsEnabled =
  trimPublicConfig(process.env.EXPO_PUBLIC_NOTIFICATIONS_ENABLED) === '1';
const powerSyncUrl = trimPublicConfig(process.env.EXPO_PUBLIC_POWERSYNC_URL);
const appEnv = trimPublicConfig(process.env.EXPO_PUBLIC_APP_ENV) ?? 'local';

let observability: ObservabilityClient = disabledObservability;
let analytics: AnalyticsClient = disabledAnalytics;
let payments: PaymentsClient = disabledPayments;
let notifications: NotificationsClient = disabledNotifications;
let offlineSync: OfflineSyncClient = disabledOfflineSync;
let posthog: PostHog | null = null;

export function initNativeIntegrations(): void {
  if (sentryDsn && !observability.enabled) {
    Sentry.init({
      dsn: sentryDsn,
      environment: appEnv,
      enabled: true,
      tracesSampleRate: appEnv === 'production' ? 0.1 : 0,
      sendDefaultPii: false,
    });
    observability = {
      enabled: true,
      setUser(user) {
        if (!user) {
          Sentry.setUser(null);
          return;
        }
        Sentry.setUser(user.email ? { id: user.id, email: user.email } : { id: user.id });
      },
      captureException(error, context) {
        Sentry.captureException(error, context ? { tags: context } : undefined);
      },
    };
  }

  if (posthogKey && appEnv !== 'local' && !analytics.enabled) {
    posthog = new PostHog(posthogKey, {
      host: posthogHost,
      captureAppLifecycleEvents: false,
      preloadFeatureFlags: false,
    });
    analytics = {
      enabled: true,
      identify(userId, properties) {
        posthog?.identify(userId, properties);
      },
      reset() {
        posthog?.reset();
      },
      capture(event, properties) {
        posthog?.capture(event, properties);
      },
    };
  }

  const revenueCatKey = Platform.OS === 'ios' ? revenueCatApple : revenueCatGoogle;
  if (revenueCatKey && !payments.enabled) {
    Purchases.configure({ apiKey: revenueCatKey });
    payments = {
      enabled: true,
      async logIn(appUserId) {
        await Purchases.logIn(appUserId);
      },
      async logOut() {
        await Purchases.logOut();
      },
    };
  }

  if (notificationsEnabled) {
    notifications = {
      enabled: true,
      async registerForPush() {
        const permissions = await Notifications.getPermissionsAsync();
        let status = permissions.status;
        if (status !== 'granted') {
          const requested = await Notifications.requestPermissionsAsync();
          status = requested.status;
        }
        if (status !== 'granted') return null;
        const projectId =
          Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId;
        if (!projectId || typeof projectId !== 'string') return null;
        const token = await Notifications.getExpoPushTokenAsync({ projectId });
        return token.data;
      },
    };
  }

  if (powerSyncUrl) {
    // PowerSync stays opt-in: set EXPO_PUBLIC_POWERSYNC_URL and add @powersync/* when enabling.
    offlineSync = {
      enabled: false,
      async connect() {
        throw new Error(
          'PowerSync URL is set but the native PowerSync packages are not wired. Add @powersync/react-native per docs/profiles.md.',
        );
      },
      async disconnect() {},
    };
  }
}

export function getNativeObservability(): ObservabilityClient {
  return observability;
}

export const nativeIntegrationFlags = {
  get observability() {
    return observability.enabled;
  },
  get analytics() {
    return analytics.enabled;
  },
  get payments() {
    return payments.enabled;
  },
  get notifications() {
    return notifications.enabled;
  },
  get offlineSync() {
    return offlineSync.enabled;
  },
};

export async function syncNativeIntegrationUser(
  user: { id: string; email?: string | null } | null,
): Promise<void> {
  observability.setUser(user);
  if (!user) {
    analytics.reset();
    if (payments.enabled) await payments.logOut();
    return;
  }
  analytics.identify(user.id, user.email ? { email: user.email } : undefined);
  if (payments.enabled) await payments.logIn(user.id);
}
