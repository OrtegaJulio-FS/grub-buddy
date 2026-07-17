import { useCallback, useEffect, useState } from 'react';

// Generic data-fetching hook: runs `fetcher` whenever `deps` change, and
// exposes a `refetch` for imperative reloads (e.g. after logging a visit).
export function useAsync(fetcher, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [reloadToken, setReloadToken] = useState(0);

  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, loading: false, error });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadToken]);

  return { ...state, refetch };
}

// Generic mutation hook: wraps an async action with loading/error state.
export function useMutation(mutationFn) {
  const [state, setState] = useState({ loading: false, error: null });

  const mutate = useCallback(
    async (...args) => {
      setState({ loading: true, error: null });
      try {
        const result = await mutationFn(...args);
        setState({ loading: false, error: null });
        return result;
      } catch (error) {
        setState({ loading: false, error });
        throw error;
      }
    },
    [mutationFn]
  );

  return { ...state, mutate };
}
