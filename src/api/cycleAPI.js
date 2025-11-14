import { API_BASE_URL } from "./apiURL";

export const getCycles = async () => {
  const response = await fetch(`${API_BASE_URL}/cycles/search`);
  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.cycles.map((item) => item.cycle);
};

export const getCyclesById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/chapters/search/by_id/${id}`);

  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.cycle;
};

export const getCyclesInChapter = async (id) => {
  const response = await fetch(
    `${API_BASE_URL}/cycles/search/by_chapter/${id}`
  );
  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.cycles.map((item) => item.cycle);
};
