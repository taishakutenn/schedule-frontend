import { API_BASE_URL } from "./apiURL";

export const getTeachersCategory = async () => {
  const response = await fetch(`${API_BASE_URL}/teacher-category/search`);

  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.categories.map((item) => item.category);
};

export const getTeacherById = async (category) => {
  const response = await fetch(
    `${API_BASE_URL}/teacher-category/search/${category}`
  );

  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.category;
};
