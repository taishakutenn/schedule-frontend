import { useState, useEffect, useCallback } from "react";

export const useApiData = (apiFunction, dependencies = [], enabled = true) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Мемоизируем функцию выполнения запроса
  const fetchData = useCallback(async () => {
    if (!enabled || typeof apiFunction !== "function") {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction();
      setData(result);
    } catch (err) {
      setError(err.message);
      setData([]);
      console.error("Ошибка загрузки:", err);
    } finally {
      setLoading(false);
    }
  }, [apiFunction, enabled]);

  useEffect(() => {
    fetchData();
  }, [...dependencies]); // Убрали apiFunction и enabled из зависимостей

  return { data, loading, error };
};
