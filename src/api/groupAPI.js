import { API_BASE_URL } from "./apiURL";
import { getPlanByYearAndSpeciality } from "./plansAPI";
import { getAllSubjectsInPlan } from "./subjectAPI";
import { getSubjectHoursBySubject } from "./subjectHoursAPI";

export const getGroups = async () => {
  const response = await fetch(`${API_BASE_URL}/groups/search`);
  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.groups.map((item) => item.group);
};

export const getGroupsBySpeciality = async (speciality_code) => {
  const response = await fetch(
    `${API_BASE_URL}/groups/search/by_speciality/${speciality_code}`
  );
  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.groups.map((item) => item.group);
};

export const getGroupByName = async (groupName) => {
  const response = await fetch(
    `${API_BASE_URL}/groups/search/by_group_name/${groupName}`
  );
  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.group;
};

export const getSubjectsByGroupAndSemesters = async (groupName) => {
  // Get group speciality and group date
  const group = await getGroupByName(groupName);
  const specialityGroup = group.speciality_code;
  const groupDate = "20" + group.group_name.slice(0, 2); // and add current millennium

  // Get a plan using this data
  const plan = await getPlanByYearAndSpeciality(groupDate, specialityGroup);
  const planId = plan.id;

  // Get all subject in this plan
  const subjects = await getAllSubjectsInPlan(planId);
  const subjectsIds = subjects.map((subject) => subject.id); // create array subjects ids 

  // In cycle get all subject hours
  const subjectHours = [];
  for (let id in subjectsIds) {
    try {
      const subjectHour = await getSubjectHoursBySubject(id);
      subjectHours.push(subjectHour);
    } catch (err) {
      console.log(`Не удалось получить часы для предмета с id: ${id}. Ошибка: ${err}`);
    }
  }
  
  // ОТЛАДКА
  console.log("Отладочный вывод");
  subjectHours.forEach(subjectHour => {
    subjectHour.forEach(array => {
      console.log(array);
    })
  });
  console.log("ПРЕДМЕТЫ");
  console.log(subjects);

  // console.log(subjectsIds);
  // Get subject hourss
  return subjectHours;
};

export const getGroupsByNames = async (names) => {
  if (!Array.isArray(names) || names.length === 0) {
    throw new Error("Параметр 'names' должен быть непустым массивом строк.");
  }
  const params = new URLSearchParams();
  names.forEach((group_name) => params.append("names", group_name));

  const url = `${API_BASE_URL}/groups/search/by_names?${params.toString()}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.groups.map((item) => item.group);
};
