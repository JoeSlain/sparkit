import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import type { AppClient } from '@sparkit/supabase';
import type { Session } from '@supabase/supabase-js';
import { createQueryClient, taskKey } from '../app/lib/query';
import { useSession } from '../app/lib/use-session';

const session = (id: string) => ({ user: { id } }) as Session;
describe('account isolation', () => {
  it('clears private query data between accounts and on logout', async () => {
    const queryClient = createQueryClient();
    let listener: (_event: string, value: Session | null) => void = () => {};
    const unsubscribe = vi.fn();
    const client = {
      auth: {
        onAuthStateChange: vi.fn((callback) => {
          listener = callback;
          return { data: { subscription: { unsubscribe } } };
        }),
        getSession: vi.fn(async () => ({ data: { session: session('a') }, error: null })),
      },
    } as unknown as AppClient;
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result, unmount } = renderHook(() => useSession(client), { wrapper });
    await waitFor(() => expect(result.current.session?.user.id).toBe('a'));
    queryClient.setQueryData(taskKey('a'), [{ title: 'Private A' }]);
    act(() => listener('SIGNED_IN', session('b')));
    expect(queryClient.getQueryData(taskKey('a'))).toBeUndefined();
    queryClient.setQueryData(taskKey('b'), [{ title: 'Private B' }]);
    act(() => listener('SIGNED_OUT', null));
    expect(queryClient.getQueryData(taskKey('b'))).toBeUndefined();
    expect(result.current.session).toBeNull();
    unmount();
    expect(unsubscribe).toHaveBeenCalledOnce();
  });
  it('ignores a stale initial session response after a newer auth event', async () => {
    const queryClient = createQueryClient();
    let listener: (_event: string, value: Session | null) => void = () => {};
    let resolveInitial!: (value: unknown) => void;
    const initial = new Promise((resolve) => {
      resolveInitial = resolve;
    });
    const client = {
      auth: {
        onAuthStateChange: vi.fn((callback) => {
          listener = callback;
          return { data: { subscription: { unsubscribe: vi.fn() } } };
        }),
        getSession: vi.fn(() => initial),
      },
    } as unknown as AppClient;
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useSession(client), { wrapper });
    act(() => listener('SIGNED_OUT', null));
    await act(async () => {
      resolveInitial({ data: { session: session('old-user') }, error: null });
    });
    expect(result.current.session).toBeNull();
    expect(result.current.loading).toBe(false);
  });
});
