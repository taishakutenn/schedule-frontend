// files for configurate request to API

import { getTeachers } from "../api/teachersAPI";
import { getTeachersCategory } from "../api/teacherCategoryAPI";
import { getPlans } from "../api/plansAPI";

export const tableConfig = {
  teachers: {
    apiFunction: getTeachers,
    loadingMessage: "Загрузка преподавателей...",
    errorMessage: "Ошибка при загрузке преподавателей",
  },
  teachers_category: {
    apiFunction: getTeachersCategory,
    loadingMessage: "Загрузка категорий преподавателей...",
    errorMessage: "Ошибка при загрузке категорий преподавателей",
  },
  plans: {
    apiFunction: getPlans,
    loadingMessage: "Загрузка учебных планов...",
    errorMessage: "Ошибка при загрузке учебных планов",
  },
};
