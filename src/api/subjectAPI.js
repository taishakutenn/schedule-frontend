import { API_BASE_URL } from "./apiURL";
import { getChaptersInPlan } from "./chapterAPI";
import { getCyclesInChapter } from "./cycleAPI";
import { getModulesInCycle } from "./moduleAPI";

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

export const getSubjectsInCycle = async (id) => {
  const response = await fetch(
    `${API_BASE_URL}/subjects_in_cycles/search/by_cycle/${id}`
  );
  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.subjects_in_cycles.map((item) => item.subject_in_cycle);
};

export const getSubjectsInModule = async (id) => {
  const response = await fetch(
    `${API_BASE_URL}/subjects_in_cycles/search/by_module/${id}`
  );
  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.subjects_in_cycles.map((item) => item.subject_in_cycle);
};

export const getAllSubjectsInPlan = async (planId) => {
  const subjects = [];

  const chapters = await getChaptersInPlan(planId);

  for (const chapter of chapters) {
    const cycles = await getCyclesInChapter(chapter.id);

    for (const cycle of cycles) {
      const subjectsInCycle = await getSubjectsInCycle(cycle.id);
      if (subjectsInCycle && Array.isArray(subjectsInCycle)) {
        subjects.push(...subjectsInCycle);
      }

      const modulesInCycle = await getModulesInCycle(cycle.id);
      if (modulesInCycle && Array.isArray(modulesInCycle)) {
        for (const module of modulesInCycle) {
          const subjectsInModule = await getSubjectsInModule(module.id);
          if (subjectsInModule && Array.isArray(subjectsInModule)) {
            subjects.push(...subjectsInModule);
          }
        }
      }
    }
  }

  const uniqueSubjects = subjects.filter(
    (s, index, self) => index === self.findIndex((item) => item.id === s.id)
  );

  return uniqueSubjects;
};
