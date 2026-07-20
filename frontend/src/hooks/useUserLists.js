import { useCallback } from 'react';
import { listUserLists } from '../api/lists';
import { useAsync } from './useAsync';

export function useUserLists(userId) {
  const fetcher = useCallback(() => listUserLists(userId), [userId]);
  const { data, loading, error, refetch } = useAsync(fetcher, [userId]);
  return { lists: data || [], loading, error, refetch };
}
