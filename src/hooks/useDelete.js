import { useState } from "react";
import { API_BASE_URL } from "../api/apiURL";

export const useDelete = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const del = async (endpoint, idElem) => {
    setLoading(true);
    setError(null);

    try {
      let idPath;
      if (Array.isArray(idElem)) {
        idPath = idElem.join("/");
      } else {
        idPath = idElem;
      }

      const url = `${API_BASE_URL}${endpoint}/delete/${idPath}`;
      const response = await fetch(url, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.statusText}`);
      }

      let result;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        result = { success: true };
      }

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
