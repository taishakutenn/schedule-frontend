import { API_BASE_URL } from "./apiURL";

export const getSubjects = async () => {
  const response = await fetch(`${API_BASE_URL}/subjects_in_cycles/search`);
  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.subjects_in_cycles.map((item) => item.subject_in_cycle);
};

export const getSubjectById = async (id) => {
  const response = await fetch(
    `${API_BASE_URL}/subjects_in_cycles/search/by_id/${id}`
  );

  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.subject_in_cycle;
};

export const getSubjectsByIds = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("Параметр 'ids' должен быть непустым массивом чисел.");
  }
  const params = new URLSearchParams();
  ids.forEach((id) => params.append("ids", id));

  const url = `${API_BASE_URL}/subjects_in_cycles/search/by_ids?${params.toString()}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.subjects_in_cycles.map((item) => item.subject_in_cycle);
};

export const getAllSubjectsInPlan = async (id) => {
  const response = await fetch(
    `${API_BASE_URL}/subjects_in_cycles/search/by_plan/${id}`
  );

  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  const result = data.subjects_in_cycles;

  const mappedResult = Array.isArray(result)
    ? result.map((item) => item.subject_in_cycle)
    : [];

  return mappedResult;
};
