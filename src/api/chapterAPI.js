import { API_BASE_URL } from "./apiURL";

export const getChapters = async () => {
  const response = await fetch(`${API_BASE_URL}/chapters/search`);
  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.chapters.map((item) => item.chapter);
};

export const getChaptersById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/chapters/search/by_id/${id}`);

  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.chapter;
};

export const getChaptersInPlan = async (id) => {
  const response = await fetch(`${API_BASE_URL}/chapters/search/by_plan/${id}`);
  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.chapters.map((item) => item.chapter);
};
