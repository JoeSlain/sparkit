import { describe, expect, it } from 'vitest';
import { readConfiguration } from '../app/lib/client';
describe('public configuration', () => {
  it('keeps the app unconfigured for missing or unsafe URLs', () => {
    expect(readConfiguration({})).toBeNull();
    expect(
      readConfiguration({
        VITE_SUPABASE_URL: 'javascript:alert(1)',
        VITE_SUPABASE_PUBLISHABLE_KEY: 'public',
      }),
    ).toBeNull();
    expect(readConfiguration({ VITE_SUPABASE_URL: 'https://example.supabase.co' })).toBeNull();
  });
  it('accepts local and hosted public configuration', () => {
    expect(
      readConfiguration({
        VITE_SUPABASE_URL: ' http://127.0.0.1:54321 ',
        VITE_SUPABASE_PUBLISHABLE_KEY: ' public ',
      }),
    ).toEqual({ url: 'http://127.0.0.1:54321', publishableKey: 'public' });
  });
});
