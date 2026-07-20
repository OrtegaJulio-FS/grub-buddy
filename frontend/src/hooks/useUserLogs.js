import { useCallback } from 'react';
import { listLogs } from '../api/logs';
import { useAsync } from './useAsync';

// Raw logs for one user, unsorted/ungrouped - the Profile page's header
// (log count), Top Spots (grouped + ranked), and Diary (sorted chronologically)
// all derive their view from this same fetch. Requests the max page size
// (100, GET /logs's ceiling) rather than the default 50 - the Diary is
// meant to show a user's full history, not silently truncate it.
export function useUserLogs(userId) {
  const fetcher = useCallback(() => listLogs({ userId, limit: 100 }), [userId]);
  const { data, loading, error, refetch } = useAsync(fetcher, [userId]);
  return { logs: data || [], loading, error, refetch };
}
