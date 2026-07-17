import { useCallback, useMemo } from 'react';
import { listLogs } from '../api/logs';
import { useAsync } from './useAsync';
import { summarizeLogs } from '../lib/ratings';
import { CURRENT_USER_ID } from '../lib/currentUser';

export function useLogsForSpot(spotId) {
  const fetcher = useCallback(() => listLogs({ spotId }), [spotId]);
  const { data, loading, error, refetch } = useAsync(fetcher, [spotId]);

  const logs = data || [];
  const { average, count } = useMemo(() => summarizeLogs(logs), [logs]);
  const loggedByMe = useMemo(
    () => logs.some((log) => String(log.user_id) === CURRENT_USER_ID),
    [logs]
  );

  return { logs, average, count, loggedByMe, loading, error, refetch };
}
