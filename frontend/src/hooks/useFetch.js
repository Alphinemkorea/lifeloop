import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth.js';
import { parseApiResponse } from '../utils/api.js';

export const useFetch = (url) => {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!!url);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!url) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(url, { headers });
      const json = await parseApiResponse(res);
      setData(json);
    } catch (err) {
      console.error(`Error fetching ${url}:`, err);
      setError(err.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  }, [url, token]);

  useEffect(() => {
    fetchData();

    const handleDataRefresh = () => {
      fetchData();
    };

    window.addEventListener('moment_created', handleDataRefresh);
    window.addEventListener('space_updated', handleDataRefresh);

    return () => {
      window.removeEventListener('moment_created', handleDataRefresh);
      window.removeEventListener('space_updated', handleDataRefresh);
    };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};
