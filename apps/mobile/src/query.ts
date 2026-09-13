import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
    mutations: { retry: false },
  },
});

export function clearAccountCache(
  previous: string | null,
  next: string | null,
  cache: QueryClient,
): void {
  if (previous === next) return;
  void cache.cancelQueries();
  cache.clear();
}
