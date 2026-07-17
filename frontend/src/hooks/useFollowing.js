import { useCallback } from 'react';
import { listFollowing } from '../api/follows';
import { useAsync } from './useAsync';

export function useFollowing(userId) {
  const fetcher = useCallback(() => listFollowing(userId), [userId]);
  const { data, loading, error, refetch } = useAsync(fetcher, [userId]);
  return { following: data || [], loading, error, refetch };
}
