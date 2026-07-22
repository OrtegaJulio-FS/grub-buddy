import { useCallback } from 'react';
import { listLogs } from '../api/logs';
import { useAsync } from './useAsync';
import { useAuth } from './useAuth';

// Has the logged-in user logged this spot? Rating/count for the spot itself
// come from the spot object (server-side aggregates via GET /spots/:id) -
// this only answers the visit-stamp question.
export function useLoggedByMe(spotId) {
  const { user } = useAuth();
  const fetcher = useCallback(
    () => (user ? listLogs({ spotId, userId: user.id }) : Promise.resolve([])),
    [spotId, user]
  );
  const { data, loading, error, refetch } = useAsync(fetcher, [spotId, user]);

  return { loggedByMe: (data || []).length > 0, loading, error, refetch };
}
