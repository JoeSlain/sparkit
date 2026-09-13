import { createAppClient } from '@agency/supabase';

export function readConfiguration(env: Record<string, string | undefined>) {
  const url = env.VITE_SUPABASE_URL?.trim();
  const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !publishableKey || publishableKey.startsWith('sb_secret_')) return null;
  try {
    const parsed = new URL(url);
    if (!['https:', 'http:'].includes(parsed.protocol)) return null;
    return { url, publishableKey };
  } catch {
    return null;
  }
}
const configuration = readConfiguration(import.meta.env);
export const client = configuration
  ? createAppClient({ ...configuration, persistSession: true, detectSessionInUrl: true })
  : null;
