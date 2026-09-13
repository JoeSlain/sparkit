import { Platform } from 'react-native';
import { createAppClient } from '@agency/supabase';
import { secureStorage } from './secure-storage';

const url = (
  Platform.OS === 'android'
    ? process.env.EXPO_PUBLIC_SUPABASE_ANDROID_URL || process.env.EXPO_PUBLIC_SUPABASE_URL
    : process.env.EXPO_PUBLIC_SUPABASE_URL
)?.trim();
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
function initializeClient() {
  if (!url || !publishableKey) return null;
  try {
    return createAppClient({
      url,
      publishableKey,
      storage: secureStorage,
      persistSession: true,
      detectSessionInUrl: false,
    });
  } catch {
    return null;
  }
}
export const client = initializeClient();
