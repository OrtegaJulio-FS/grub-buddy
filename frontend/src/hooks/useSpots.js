import { useCallback } from 'react';
import { listSpots } from '../api/spots';
import { useAsync } from './useAsync';

export function useSpots({ city, category, minRating, search } = {}) {
  const fetcher = useCallback(
    () => listSpots({ city, category, minRating, search }),
    [city, category, minRating, search]
  );
  const { data, loading, error, refetch } = useAsync(fetcher, [city, category, minRating, search]);
  return { spots: data || [], loading, error, refetch };
}
