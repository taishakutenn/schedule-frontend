import { API_BASE_URL } from "./apiURL";

export const uploadAndParsePlan = async (file, chapters, cycles, modules) => {
  const formData = new FormData();
  formData.append("file", file);

  formData.append("chapters", chapters.join(","));
  formData.append("cycles", cycles.join(","));
  formData.append("modules", modules.join(","));

  const response = await fetch(`${API_BASE_URL}/parser/upload/`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = `Ошибка: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch (e) {
      console.warn("Не удалось распарсить тело ошибки:", e);
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data;
};
