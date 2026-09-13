import { QueryClient } from '@tanstack/react-query';
export const taskKey = (userId: string) => ['tasks', userId] as const;
export const profileKey = (userId: string) => ['profile', userId] as const;
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: true },
      mutations: { retry: false },
    },
  });
}
