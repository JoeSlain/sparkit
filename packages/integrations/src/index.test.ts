import { describe, expect, it } from 'vitest';
import {
  disabledAnalytics,
  disabledObservability,
  isIntegrationConfigured,
  trimPublicConfig,
} from './index';
import { isResendConfigured } from './email';

describe('integrations gates', () => {
  it('treats blank public config as disabled', () => {
    expect(trimPublicConfig('')).toBeUndefined();
    expect(trimPublicConfig('  ')).toBeUndefined();
    expect(trimPublicConfig('https://example.ingest.sentry.io/1')).toBe(
      'https://example.ingest.sentry.io/1',
    );
    expect(isIntegrationConfigured(undefined, 'x')).toBe(false);
    expect(isIntegrationConfigured('a', 'b')).toBe(true);
  });

  it('exposes no-op clients when disabled', () => {
    expect(disabledAnalytics.enabled).toBe(false);
    expect(disabledObservability.enabled).toBe(false);
    disabledAnalytics.capture('x');
    disabledObservability.captureException(new Error('x'));
  });

  it('keeps Resend off without a server key', () => {
    const previous = process.env.RESEND_API_KEY;
    delete process.env.RESEND_API_KEY;
    expect(isResendConfigured()).toBe(false);
    if (previous === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = previous;
  });
});
