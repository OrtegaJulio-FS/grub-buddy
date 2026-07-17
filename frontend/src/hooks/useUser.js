import { useCallback } from 'react';
import { getUser } from '../api/users';
import { useAsync } from './useAsync';

export function useUser(id) {
  const fetcher = useCallback(() => getUser(id), [id]);
  const { data, loading, error, refetch } = useAsync(fetcher, [id]);
  return { user: data, loading, error, refetch };
}
