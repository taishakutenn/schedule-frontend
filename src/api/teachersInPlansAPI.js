import { API_BASE_URL } from "./apiURL";

export const getTeachersInPlans = async () => {
  const response = await fetch(`${API_BASE_URL}/teachers_in_plans/search`);
  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.teachers_in_plans.map((item) => item.teacher_in_plan);
};

export const getTeacherInPlanByTeacher = async (id) => {
  const response = await fetch(
    `${API_BASE_URL}/teachers_in_plans/search/by_teacher/${id}`
  );

  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.teachers_in_plans.map((item) => item.teacher_in_plan);
};

export const getTeacherInPlanByGroup = async (name) => {
  const response = await fetch(
    `${API_BASE_URL}/teachers_in_plans/search/by_group/${name}`
  );

  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.teachers_in_plans.map((item) => item.teacher_in_plan);
};
