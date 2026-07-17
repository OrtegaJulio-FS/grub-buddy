import { useCallback } from 'react';
import { checkIsFollowing } from '../api/follows';
import { useAsync } from './useAsync';
import { CURRENT_USER_ID } from '../lib/currentUser';

export function useIsFollowing(targetUserId) {
  const fetcher = useCallback(() => checkIsFollowing(CURRENT_USER_ID, targetUserId), [targetUserId]);
  const { data, loading, error, refetch } = useAsync(fetcher, [targetUserId]);
  return { isFollowing: data?.isFollowing || false, loading, error, refetch };
}
