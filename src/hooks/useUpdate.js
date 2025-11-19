import { useState } from "react";
import { API_BASE_URL } from "../api/apiURL";

export const useUpdate = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = async (tableName, itemId, updatedData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/${tableName}/update`, {
        method: "PUT",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher_id: itemId,
          ...updatedData,
        }),
      });
      
      console.log("Даты: ", JSON.stringify(updatedData, null, 2));

      let responseData = null;
      const contentType = response.headers.get("content-type");

      if (response.status === 204) {
        responseData = { success: true, message: "Запись успешно обновлена." };
      } else if (contentType && contentType.includes("application/json")) {
        try {
          responseData = await response.json();
        } catch (jsonError) {
          console.error("Ошибка парсинга JSON:", jsonError);
          throw new Error("Сервер вернул некорректный JSON.");
        }
      } else {
        try {
          const text = await response.text();
          responseData = JSON.parse(text);
        } catch (textOrParseError) {
          responseData = {
            message: text || `HTTP error! status: ${response.status}`,
          };
        }
      }

      if (!response.ok) {
        const errorMessage =
          typeof responseData === "object" && responseData.message
            ? responseData.message
            : `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      return responseData;
    } catch (err) {
      setError(err.message);
      console.error("Ошибка обновления:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
};
