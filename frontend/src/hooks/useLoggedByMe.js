import { useCallback } from 'react';
import { listLogs } from '../api/logs';
import { useAsync } from './useAsync';
import { CURRENT_USER_ID } from '../lib/currentUser';

// Has the current (fake) user logged this spot? Rating/count for the spot
// itself come from the spot object (server-side aggregates via GET
// /spots/:id) - this only answers the visit-stamp question.
export function useLoggedByMe(spotId) {
  const fetcher = useCallback(() => listLogs({ spotId, userId: CURRENT_USER_ID }), [spotId]);
  const { data, loading, error, refetch } = useAsync(fetcher, [spotId]);

  return { loggedByMe: (data || []).length > 0, loading, error, refetch };
}
