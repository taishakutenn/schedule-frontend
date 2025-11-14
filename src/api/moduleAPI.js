import { API_BASE_URL } from "./apiURL";

export const getChapters = async () => {
  const response = await fetch(`${API_BASE_URL}/modules/search`);
  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.modules.map((item) => item.module);
};

export const getChaptersById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/modules/search/by_id/${id}`);

  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.module;
};

export const getChaptersInPlan = async (id) => {
  const response = await fetch(`${API_BASE_URL}/modules/search/by_cycle/${id}`);
  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.modules.map((item) => item.module);
};
