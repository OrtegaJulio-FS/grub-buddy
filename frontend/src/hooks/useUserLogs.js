import { useCallback } from 'react';
import { listLogs } from '../api/logs';
import { useAsync } from './useAsync';

// Raw logs for one user, unsorted/ungrouped - the Profile page's header
// (log count), Top Spots (grouped + ranked), and Diary (sorted chronologically)
// all derive their view from this same fetch.
export function useUserLogs(userId) {
  const fetcher = useCallback(() => listLogs({ userId }), [userId]);
  const { data, loading, error, refetch } = useAsync(fetcher, [userId]);
  return { logs: data || [], loading, error, refetch };
}
