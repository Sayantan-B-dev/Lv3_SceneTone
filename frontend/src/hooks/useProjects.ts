import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import type { Project } from '@/types';

const projectKeys = {
  list: ['projects'] as const,
  detail: (id: string) => ['projects', id] as const,
};

export function useProjects(enabled = true) {
  return useQuery({
    queryKey: projectKeys.list,
    queryFn: () => apiRequest<{ projects: Project[] }>('/projects'),
    enabled,
  });
}

export function useProject(projectId: string | undefined) {
  return useQuery({
    queryKey: projectKeys.detail(projectId ?? 'unknown'),
    queryFn: () => apiRequest<{ project: Project }>(`/projects/${projectId}`),
    enabled: Boolean(projectId),
    retry: false,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) =>
      apiRequest<{ project: Project }>('/projects', {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.list });
    },
  });
}

export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) =>
      apiRequest<{ project: Project }>(`/projects/${projectId}`, {
        method: 'PATCH',
        body: JSON.stringify({ name }),
      }),
    onSuccess: ({ project }) => {
      queryClient.setQueryData(projectKeys.detail(projectId), { project });
      void queryClient.invalidateQueries({ queryKey: projectKeys.list });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) =>
      apiRequest<void>(`/projects/${projectId}`, { method: 'DELETE' }),
    onSuccess: (_data, projectId) => {
      queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) });
      void queryClient.invalidateQueries({ queryKey: projectKeys.list });
    },
  });
}
