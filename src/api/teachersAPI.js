import { API_BASE_URL } from "./apiURL";

export const getTeachers = async () => {
  const response = await fetch(`${API_BASE_URL}/teachers/search`);
  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.teachers.map((item) => item.teacher);
};

export const getTeacherById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/teachers/search/by_id/${id}`);

  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.teacher;
};

export const getTeachersByIds = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("Параметр 'ids' должен быть непустым массивом чисел.");
  }
  const params = new URLSearchParams();
  ids.forEach((id) => params.append("ids", id));

  const url = `${API_BASE_URL}/teachers/search/by_ids?${params.toString()}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.teachers.map((item) => item.teacher);
};
