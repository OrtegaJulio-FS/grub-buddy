import { useCallback } from 'react';
import { getSpot } from '../api/spots';
import { useAsync } from './useAsync';

export function useSpot(id) {
  const fetcher = useCallback(() => getSpot(id), [id]);
  const { data, loading, error, refetch } = useAsync(fetcher, [id]);
  return { spot: data, loading, error, refetch };
}
