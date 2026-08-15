import { useState, useCallback, useRef } from 'react';

interface UseApiOptions {
  immediate?: boolean;
}

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Generic data-fetching hook.
 * Usage:
 *   const { data, loading, error, execute } = useApi(fetchFn);
 *   useEffect(() => { execute(params); }, []);
 */
export function useApi<T, P = void>(
  fetchFn: (params: P) => Promise<T>,
  _options: UseApiOptions = {},
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const abortRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (params: P): Promise<T | null> => {
      // Cancel any in-flight request
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setState((s) => ({ ...s, loading: true, error: null }));

      try {
        const result = await fetchFn(params);
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (err: unknown) {
        if ((err as Error)?.name === 'AbortError') return null;
        const message =
          (err as Error)?.message || 'An unexpected error occurred.';
        setState({ data: null, loading: false, error: message });
        return null;
      }
    },
    [fetchFn],
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}

/**
 * Mutation hook — for create/update/delete operations.
 * Returns execute, loading, error but no persistent data.
 */
export function useMutation<T, P = void>(
  mutateFn: (params: P) => Promise<T>,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (params: P): Promise<T | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await mutateFn(params);
        setLoading(false);
        return result;
      } catch (err: unknown) {
        const message = (err as Error)?.message || 'An unexpected error occurred.';
        setError(message);
        setLoading(false);
        throw err; // Re-throw so callers can handle with toast
      }
    },
    [mutateFn],
  );

  return { execute, loading, error };
}
