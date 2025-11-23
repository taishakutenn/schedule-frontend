import { API_BASE_URL } from "./apiURL";

export const getCertifications = async () => {
  const response = await fetch(`${API_BASE_URL}/certifications/search`);
  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.certifications.map((item) => item.certification);
};

export const getCertificationsByIds = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("Параметр 'ids' должен быть непустым массивом чисел.");
  }
  const params = new URLSearchParams();
  ids.forEach((id) => params.append("ids", id));

  const url = `${API_BASE_URL}/certifications/search/by_ids?${params.toString()}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.certifications.map((item) => item.certification);
};
