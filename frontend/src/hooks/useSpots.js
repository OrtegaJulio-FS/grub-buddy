import { useCallback } from 'react';
import { listSpots } from '../api/spots';
import { useAsync } from './useAsync';

export function useSpots({ city, category } = {}) {
  const fetcher = useCallback(() => listSpots({ city, category }), [city, category]);
  const { data, loading, error, refetch } = useAsync(fetcher, [city, category]);
  return { spots: data || [], loading, error, refetch };
}
