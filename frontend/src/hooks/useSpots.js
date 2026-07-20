import { useCallback } from 'react';
import { listSpots } from '../api/spots';
import { useAsync } from './useAsync';

export function useSpots({ city, category, minRating, search, limit, offset } = {}) {
  const fetcher = useCallback(
    () => listSpots({ city, category, minRating, search, limit, offset }),
    [city, category, minRating, search, limit, offset]
  );
  const { data, loading, error, refetch } = useAsync(fetcher, [city, category, minRating, search, limit, offset]);
  return { spots: data || [], loading, error, refetch };
}
