import { API_BASE_URL } from "./apiURL";

export const getSubjectHoursBySubject = async (subject_id) => {
  const response = await fetch(
    `${API_BASE_URL}/subjects_in_cycles_hours/search/by_subject_in_cycle/${subject_id}`
  );
  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.subjects_in_cycle_hours.map(
    (item) => item.subject_in_cycle_hours
  );
};

export const getSubjectHoursByIds = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("Параметр 'ids' должен быть непустым массивом чисел.");
  }
  const params = new URLSearchParams();
  ids.forEach((id) => params.append("ids", id));

  const url = `${API_BASE_URL}/subjects_in_cycles_hours/search/by_ids?${params.toString()}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.subjects_in_cycle_hours.map(
    (item) => item.subject_in_cycle_hours
  );
};
