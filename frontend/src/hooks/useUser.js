import { useCallback } from 'react';
import { getUser } from '../api/users';
import { useAsync } from './useAsync';

// `id` may not be known yet (e.g. ListPage looks up the owner from a list
// that's still loading) - skip the request rather than fetching /users/undefined.
export function useUser(id) {
  const fetcher = useCallback(() => (id ? getUser(id) : Promise.resolve(null)), [id]);
  const { data, loading, error, refetch } = useAsync(fetcher, [id]);
  return { user: data, loading, error, refetch };
}
