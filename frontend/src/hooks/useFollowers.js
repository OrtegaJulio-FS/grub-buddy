import { useCallback } from 'react';
import { listFollowers } from '../api/follows';
import { useAsync } from './useAsync';

export function useFollowers(userId) {
  const fetcher = useCallback(() => listFollowers(userId), [userId]);
  const { data, loading, error, refetch } = useAsync(fetcher, [userId]);
  return { followers: data || [], loading, error, refetch };
}
