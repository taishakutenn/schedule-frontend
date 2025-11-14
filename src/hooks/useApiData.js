import { useState, useEffect } from "react";

export const useApiData = (apiFunction, dependencies = [], enabled = true) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled || !apiFunction) {
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiFunction();
        setData(result);
      } catch (err) {
        setError(err.message);
        console.error("Ошибка загрузки:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [enabled, apiFunction, ...dependencies]);

  return { data, loading, error };
};
