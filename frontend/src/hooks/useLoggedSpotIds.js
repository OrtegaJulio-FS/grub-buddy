import { useCallback, useMemo } from 'react';
import { listLogs } from '../api/logs';
import { useAsync } from './useAsync';
import { useAuth } from './useAuth';

// Which spots the logged-in user has logged, for the Feed grid's visit
// stamps. Rating/count come from the spot objects themselves now (server-side
// aggregates via GET /spots) - this hook only answers "have I logged this?".
// Requests the max page size (100) rather than the default 50 - missing an
// older log here would wrongly hide that spot's visit stamp. Resolves to no
// logged spots when logged out (e.g. browsing the Feed without a session).
export function useLoggedSpotIds() {
  const { user } = useAuth();
  const fetcher = useCallback(
    () => (user ? listLogs({ userId: user.id, limit: 100 }) : Promise.resolve([])),
    [user]
  );
  const { data, loading, error, refetch } = useAsync(fetcher, [user]);

  const loggedSpotIds = useMemo(() => {
    const set = new Set();
    for (const log of data || []) set.add(String(log.spot_id));
    return set;
  }, [data]);

  return { loggedSpotIds, loading, error, refetch };
}
