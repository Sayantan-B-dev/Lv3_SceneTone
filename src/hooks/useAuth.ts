import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError, apiRequest } from '@/lib/api';
import type { User } from '@/types';

export const authKeys = {
  me: ['auth', 'me'] as const,
};

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: async (): Promise<User | null> => {
      try {
        const data = await apiRequest<{ user: User }>('/auth/me');
        return data.user;
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          return null;
        }
        throw error;
      }
    },
    retry: false,
    staleTime: 60_000,
  });
}

export function useGoogleSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credential: string) =>
      apiRequest<{ user: User }>('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential }),
      }),
    onSuccess: ({ user }) => {
      queryClient.setQueryData(authKeys.me, user);
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiRequest<void>('/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      queryClient.setQueryData(authKeys.me, null);
      queryClient.removeQueries({ queryKey: ['projects'] });
    },
  });
}
