import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { AppClient } from '@sparkit/supabase';
import { useQueryClient } from '@tanstack/react-query';

export function useSession(client: AppClient | null) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<{
    session: Session | null;
    loading: boolean;
    failed: boolean;
  }>({ session: null, loading: !!client, failed: false });
  useEffect(() => {
    if (!client) return;
    let active = true;
    let revision = 0;
    let previousUser: string | null = null;
    function accept(session: Session | null) {
      if (!active) return;
      const nextUser = session?.user.id ?? null;
      if (nextUser !== previousUser) {
        void queryClient.cancelQueries();
        queryClient.clear();
        previousUser = nextUser;
      }
      setState({ session, loading: false, failed: false });
    }
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      revision++;
      accept(session);
    });
    const initialRevision = revision;
    void client.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active || revision !== initialRevision) return;
        if (error) setState({ session: null, loading: false, failed: true });
        else accept(data.session);
      })
      .catch(() => {
        if (active && revision === initialRevision)
          setState({ session: null, loading: false, failed: true });
      });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [client, queryClient]);
  return state;
}
