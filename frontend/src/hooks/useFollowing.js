import { useCallback } from 'react';
import { listFollowing } from '../api/follows';
import { useAsync } from './useAsync';

// `userId` may not be known yet - an anonymous Spot Page visitor has no
// logged-in user to pass in (see SpotPage's `useFollowing(user?.id)`), so
// skip the request rather than fetching /users/undefined/following.
export function useFollowing(userId) {
  const fetcher = useCallback(() => (userId ? listFollowing(userId) : Promise.resolve([])), [userId]);
  const { data, loading, error, refetch } = useAsync(fetcher, [userId]);
  return { following: data || [], loading, error, refetch };
}
