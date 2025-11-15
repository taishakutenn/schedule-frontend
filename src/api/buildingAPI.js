import { API_BASE_URL } from "./apiURL";

export const getBuildings = async () => {
  const response = await fetch(`${API_BASE_URL}/buildings/search`);
  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.buildings.map((item) => item.building);
};

// export const getTeacherById = async (id) => {
//   const response = await fetch(`${API_BASE_URL}/cabinets/search/by_id/${id}`);

//   if (!response.ok) {
//     throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
//   }
//   const data = await response.json();
//   return data.cabinet;
// };
