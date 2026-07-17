import { useCallback, useMemo } from 'react';
import { listLogs } from '../api/logs';
import { useAsync } from './useAsync';
import { CURRENT_USER_ID } from '../lib/currentUser';

// Which spots the current (fake) user has logged, for the Feed grid's visit
// stamps. Rating/count come from the spot objects themselves now (server-side
// aggregates via GET /spots) - this hook only answers "have I logged this?".
export function useLoggedSpotIds() {
  const fetcher = useCallback(() => listLogs({ userId: CURRENT_USER_ID }), []);
  const { data, loading, error, refetch } = useAsync(fetcher, []);

  const loggedSpotIds = useMemo(() => {
    const set = new Set();
    for (const log of data || []) set.add(String(log.spot_id));
    return set;
  }, [data]);

  return { loggedSpotIds, loading, error, refetch };
}
