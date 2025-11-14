import { API_BASE_URL } from "./apiURL";

export const getModules = async () => {
  const response = await fetch(`${API_BASE_URL}/modules/search`);
  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.modules.map((item) => item.module);
};

export const getModulesById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/modules/search/by_id/${id}`);

  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.module;
};

export const getModulesInCycle = async (id) => {
  const response = await fetch(`${API_BASE_URL}/modules/search/by_cycle/${id}`);
  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.modules.map((item) => item.module);
};
