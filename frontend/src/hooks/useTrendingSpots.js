import { useCallback } from 'react';
import { listTrendingSpots } from '../api/spots';
import { useAsync } from './useAsync';

export function useTrendingSpots(limit = 10) {
  const fetcher = useCallback(() => listTrendingSpots(limit), [limit]);
  const { data, loading, error, refetch } = useAsync(fetcher, [limit]);
  return { spots: data || [], loading, error, refetch };
}
