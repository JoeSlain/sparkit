import * as Sentry from '@sentry/react';
import posthog from 'posthog-js';
import {
  disabledAnalytics,
  disabledObservability,
  trimPublicConfig,
  type AnalyticsClient,
  type ObservabilityClient,
} from '@agency/integrations';

const sentryDsn = trimPublicConfig(import.meta.env.VITE_SENTRY_DSN);
const posthogKey = trimPublicConfig(import.meta.env.VITE_POSTHOG_KEY);
const posthogHost =
  trimPublicConfig(import.meta.env.VITE_POSTHOG_HOST) ?? 'https://us.i.posthog.com';
const appEnv = trimPublicConfig(import.meta.env.VITE_APP_ENV) ?? 'local';

let observability: ObservabilityClient = disabledObservability;
let analytics: AnalyticsClient = disabledAnalytics;

export function initWebIntegrations(): void {
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
    posthog.init(posthogKey, {
      api_host: posthogHost,
      person_profiles: 'identified_only',
      capture_pageview: false,
      capture_pageleave: false,
      autocapture: false,
      persistence: 'localStorage+cookie',
    });
    analytics = {
      enabled: true,
      identify(userId, properties) {
        posthog.identify(userId, properties);
      },
      reset() {
        posthog.reset();
      },
      capture(event, properties) {
        posthog.capture(event, properties);
      },
    };
  }
}

export function syncWebIntegrationUser(user: { id: string; email?: string | null } | null): void {
  observability.setUser(user);
  if (!user) analytics.reset();
  else analytics.identify(user.id, user.email ? { email: user.email } : undefined);
}

export const webIntegrationFlags = {
  get observability() {
    return observability.enabled;
  },
  get analytics() {
    return analytics.enabled;
  },
};
