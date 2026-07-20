import { useCallback } from 'react';
import { getList } from '../api/lists';
import { useAsync } from './useAsync';

export function useList(id) {
  const fetcher = useCallback(() => getList(id), [id]);
  const { data, loading, error, refetch } = useAsync(fetcher, [id]);
  return { list: data, loading, error, refetch };
}
