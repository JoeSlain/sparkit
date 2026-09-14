import { useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { initWebIntegrations, syncWebIntegrationUser, webIntegrationFlags } from './integrations';

let started = false;

export function WebIntegrations({ session }: { session: Session | null }) {
  useEffect(() => {
    if (!started) {
      initWebIntegrations();
      started = true;
    }
  }, []);
  useEffect(() => {
    syncWebIntegrationUser(
      session?.user ? { id: session.user.id, email: session.user.email ?? null } : null,
    );
  }, [session]);
  // Keep flag getters referenced so optional wiring stays discoverable for product screens.
  void webIntegrationFlags;
  return null;
}
