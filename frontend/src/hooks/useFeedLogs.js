import { useCallback, useMemo } from 'react';
import { listLogs } from '../api/logs';
import { useAsync } from './useAsync';
import { groupLogsBySpot, summarizeLogs } from '../lib/ratings';
import { CURRENT_USER_ID } from '../lib/currentUser';

// Fetches every log once and derives, per spot: rating average/count and
// whether the current (fake) user has logged it - so the Feed grid can render
// fork ratings and visit stamps without one request per card.
export function useFeedLogs() {
  const fetcher = useCallback(() => listLogs(), []);
  const { data, loading, error, refetch } = useAsync(fetcher, []);

  const logs = data || [];

  const logsBySpot = useMemo(() => groupLogsBySpot(logs), [logs]);

  const statsBySpot = useMemo(() => {
    const map = new Map();
    for (const [spotId, spotLogs] of logsBySpot) {
      map.set(spotId, summarizeLogs(spotLogs));
    }
    return map;
  }, [logsBySpot]);

  const loggedSpotIds = useMemo(() => {
    const set = new Set();
    for (const log of logs) {
      if (String(log.user_id) === CURRENT_USER_ID) set.add(String(log.spot_id));
    }
    return set;
  }, [logs]);

  return { statsBySpot, loggedSpotIds, loading, error, refetch };
}
