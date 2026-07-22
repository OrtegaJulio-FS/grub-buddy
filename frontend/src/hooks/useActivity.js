import { useCallback } from 'react';
import { listActivity } from '../api/activity';
import { useAsync } from './useAsync';
import { useAuth } from './useAuth';

// GET /activity requires a session (it's "what people I follow are up to" -
// meaningless without a "me") - skip the request entirely when logged out
// rather than letting it 401, since the Feed calls this hook unconditionally
// to drive the "Trusted by friends" tab.
export function useActivity() {
  const { user } = useAuth();
  const fetcher = useCallback(() => (user ? listActivity() : Promise.resolve([])), [user]);
  const { data, loading, error, refetch } = useAsync(fetcher, [user]);
  return { activity: data || [], loading, error, refetch };
}
