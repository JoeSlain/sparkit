import { trimPublicConfig, isIntegrationConfigured } from './config';

export { trimPublicConfig, isIntegrationConfigured };

export type AnalyticsClient = {
  readonly enabled: boolean;
  identify: (userId: string, properties?: Record<string, string | number | boolean | null>) => void;
  reset: () => void;
  capture: (event: string, properties?: Record<string, string | number | boolean | null>) => void;
};

export const disabledAnalytics: AnalyticsClient = {
  enabled: false,
  identify() {},
  reset() {},
  capture() {},
};

export type ObservabilityClient = {
  readonly enabled: boolean;
  setUser: (user: { id: string; email?: string | null } | null) => void;
  captureException: (error: unknown, context?: Record<string, string>) => void;
};

export const disabledObservability: ObservabilityClient = {
  enabled: false,
  setUser() {},
  captureException() {},
};

export type PaymentsClient = {
  readonly enabled: boolean;
  logIn: (appUserId: string) => Promise<void>;
  logOut: () => Promise<void>;
};

export const disabledPayments: PaymentsClient = {
  enabled: false,
  async logIn() {},
  async logOut() {},
};

export type NotificationsClient = {
  readonly enabled: boolean;
  registerForPush: () => Promise<string | null>;
};

export const disabledNotifications: NotificationsClient = {
  enabled: false,
  async registerForPush() {
    return null;
  },
};

export type OfflineSyncClient = {
  readonly enabled: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
};

export const disabledOfflineSync: OfflineSyncClient = {
  enabled: false,
  async connect() {},
  async disconnect() {},
};
