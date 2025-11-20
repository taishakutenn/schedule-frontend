import { API_BASE_URL } from "./apiURL";

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
  const groupDate = group.group_name.slice(0, 2);

  
  return groupDate;
};
