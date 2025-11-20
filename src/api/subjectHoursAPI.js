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