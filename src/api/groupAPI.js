import { API_BASE_URL } from "./apiURL";

export const getGroups = async () => {
  const response = await fetch(`${API_BASE_URL}/groups/search`);
  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.groups.map((item) => item.group);
};

