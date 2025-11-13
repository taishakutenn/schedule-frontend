// files for configurate request to API

import { getTeachers } from "../api/teachersAPI";
import { getTeachersCategory } from "../api/teacherCategoryAPI";

export const tableConfig = {
  teachers: {
    apiFunction: getTeachers,
    loadingMessage: "Загрузка преподавателей...",
    errorMessage: "Ошибка при загрузке преподавателей",
  },
  teachers_category: {
    apiFunction: getTeachersCategory,
    loadingMessage: "Загрузка категорий преподавателей",
    errorMessage: "Ошибка при загрузке категорий преподавателей",
  },
};
