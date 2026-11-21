'use client';

import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';

interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
  uptimeSeconds: number;
}

export function ApiStatus() {
  const { data, isPending, isError } = useQuery({
    queryKey: ['health'],
    queryFn: () => apiRequest<HealthResponse>('/health'),
    refetchInterval: 30_000,
  });

  const state = isPending ? 'pending' : isError ? 'error' : 'ok';
  const label = isPending
    ? 'Checking API connection'
    : isError
      ? 'API unavailable'
      : 'API connected';

  return (
    <p className={`api-status api-status--${state}`} role="status" aria-live="polite">
      {label}
      {data ? <span className="api-status__detail">{data.service}</span> : null}
    </p>
  );
}
