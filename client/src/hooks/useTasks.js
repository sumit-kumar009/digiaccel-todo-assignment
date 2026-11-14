import { useCallback, useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';

// Loads data with `loader` and reloads whenever `deps` change or any task is
// created / updated / deleted anywhere in the app.
export default function useTasks(loader, deps, { enabled = true } = {}) {
  const { version } = useApp();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    setLoading(true);
    setError('');
    loader()
      .then((result) => !cancelled && setData(result))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version, enabled, retry]);

  const reload = useCallback(() => setRetry((r) => r + 1), []);

  return { data, loading, error, reload };
}
