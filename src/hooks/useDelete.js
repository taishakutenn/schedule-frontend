import { useState } from "react";
import { API_BASE_URL } from "../api/apiURL";

export const useDelete = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const del = async (endpoint, idElem) => {
    setLoading(true);
    setError(null);

    try {
      const url = `${API_BASE_URL}${endpoint}/delete/${idElem}`;
      const response = await fetch(url, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { del, loading, error };
};
