import { API_BASE_URL } from "./apiURL";

export const getPlans = async () => {
  const response = await fetch(`${API_BASE_URL}/plans/search`);

  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.plans.map((item) => item.plan);
};

export const getPlanById = async (plan) => {
  const response = await fetch(`${API_BASE_URL}/plans/search/by_id/${plan}`);

  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.plan;
};

export const getPlanByYearAndSpeciality = async (year, speciality) => {
  const response = await fetch(`${API_BASE_URL}/plans/search/by_year_and_speciality/${year}/${speciality}`);

  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.plan;
};
