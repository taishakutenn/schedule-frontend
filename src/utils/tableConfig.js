// files for configurate request to API

import { getTeachers } from "../api/teachersAPI";
import { getTeachersCategory } from "../api/teacherCategoryAPI";
import { getPlans } from "../api/plansAPI";
import { getCabinets } from "../api/cabinetAPI";
import { getBuildings } from "../api/buildingAPI";
import { getSpecialities } from "../api/specialityAPI";
import { getSessionTypes } from "../api/sessionTypeAPI";
import { getGroups } from "../api/groupAPI";
import { getStreams } from "../api/streamAPI";

export const tableConfig = {
  teachers: {
    apiFunction: getTeachers,
    loadingMessage: "Загрузка преподавателей...",
    errorMessage: "Ошибка при загрузке преподавателей",
  },
  teacher_category: {
    apiFunction: getTeachersCategory,
    loadingMessage: "Загрузка категорий преподавателей...",
    errorMessage: "Ошибка при загрузке категорий преподавателей",
  },
  plans: {
    apiFunction: getPlans,
    loadingMessage: "Загрузка учебных планов...",
    errorMessage: "Ошибка при загрузке учебных планов",
  },
  buildings: {
    apiFunction: getBuildings,
    loadingMessage: "Загрузка зданий...",
    errorMessage: "Ошибка при загрузке зданий",
  },
  cabinets: {
    apiFunction: getCabinets,
    loadingMessage: "Загрузка кабинетов...",
    errorMessage: "Ошибка при загрузке кабинетов",
  },
  specialities: {
    apiFunction: getSpecialities,
    loadingMessage: "Загрузка специальностей...",
    errorMessage: "Ошибка при загрузке специальностей",
  },
  session_type: {
    apiFunction: getSessionTypes,
    loadingMessage: "Загрузка типов занятий...",
    errorMessage: "Ошибка при загрузке типов занятий",
  },
  groups: {
    apiFunction: getGroups,
    loadingMessage: "Загрузка групп...",
    errorMessage: "Ошибка при загрузке групп",
  },
  streams: {
    apiFunction: getStreams,
    loadingMessage: "Загрузка потоков...",
    errorMessage: "Ошибка при загрузке потоков",
  }
};
