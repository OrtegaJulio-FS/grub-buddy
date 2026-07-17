import { useCallback } from 'react';
import { listActivity } from '../api/activity';
import { useAsync } from './useAsync';

export function useActivity() {
  const fetcher = useCallback(() => listActivity(), []);
  const { data, loading, error, refetch } = useAsync(fetcher, []);
  return { activity: data || [], loading, error, refetch };
}
