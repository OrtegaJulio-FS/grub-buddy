import { useCallback } from 'react';
import { listUserLists } from '../api/lists';
import { useAsync } from './useAsync';

// `userId` may not be known yet - AddToListModal is always mounted on the
// Spot Page (just visually hidden until opened) and calls this with
// `user?.id`, which is undefined for an anonymous visitor. Skip the request
// rather than fetching /users/undefined/lists.
export function useUserLists(userId) {
  const fetcher = useCallback(() => (userId ? listUserLists(userId) : Promise.resolve([])), [userId]);
  const { data, loading, error, refetch } = useAsync(fetcher, [userId]);
  return { lists: data || [], loading, error, refetch };
}
