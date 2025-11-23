import { useState } from "react";
import { API_BASE_URL } from "../api/apiURL";
import { tableIds } from "../utils/idTableConfig";

export const useUpdate = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = async (tableName, itemId, updatedData) => {
    setLoading(true);
    setError(null);

    try {
      let id = {};

      if (Array.isArray(itemId)) {
        if (typeof itemId[0] === "object" && itemId.length === 1) {
          id = itemId[0];
        } else {
          const tableFields = tableIds[tableName];
          tableFields.forEach((field, index) => {
            id[field] = itemId[index];
          });
        }
      }

      const response = await fetch(`${API_BASE_URL}/${tableName}/update`, {
        method: "PUT",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...id,
          ...updatedData,
        }),
      });

      console.log("Ids: ", JSON.stringify(id, null, 2));
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
