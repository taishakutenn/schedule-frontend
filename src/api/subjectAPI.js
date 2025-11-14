import { API_BASE_URL } from "./apiURL";

export const getSubjects = async () => {
  const response = await fetch(`${API_BASE_URL}/subject_in_cycles/search`);
  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.subjects_in_cycles.map((item) => item.subject_in_cycle);
};

export const getSubjectById = async (id) => {
  const response = await fetch(
    `${API_BASE_URL}/subject_in_cycles/search/by_id/${id}`
  );

  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.subject_in_cycle;
};

export const getSubjectsInCycle = async (id) => {
  const response = await fetch(
    `${API_BASE_URL}/subject_in_cycles/search/by_cycle/${id}`
  );
  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.subjects_in_cycles.map((item) => item.subject_in_cycle);
};

export const getSubjectsInModule = async (id) => {
  const response = await fetch(
    `${API_BASE_URL}/subject_in_cycles/search/by_module/${id}`
  );
  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.subjects_in_cycles.map((item) => item.subject_in_cycle);
};
