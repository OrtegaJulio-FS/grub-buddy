import { useCallback } from 'react';
import { checkIsFollowing } from '../api/follows';
import { useAsync } from './useAsync';
import { useAuth } from './useAuth';

export function useIsFollowing(targetUserId) {
  const { user } = useAuth();
  const fetcher = useCallback(
    () => (user ? checkIsFollowing(user.id, targetUserId) : Promise.resolve({ isFollowing: false })),
    [user, targetUserId]
  );
  const { data, loading, error, refetch } = useAsync(fetcher, [user, targetUserId]);
  return { isFollowing: data?.isFollowing || false, loading, error, refetch };
}
