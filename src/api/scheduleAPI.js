import { API_BASE_URL } from "./apiURL";

export const getInfoForCreateSchedule = async (group_name, semester) => {
  const response = await fetch(`${API_BASE_URL}/subjects_in_cycles/search/info_for_create/${group_name}/${semester}`);
  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};
