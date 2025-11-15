import { API_BASE_URL } from "./apiURL";

export const getSpecialities = async () => {
  const response = await fetch(`${API_BASE_URL}/specialities/search`);
  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.specialities.map((item) => item.speciality);
};

// export const getTeacherById = async (id) => {
//   const response = await fetch(`${API_BASE_URL}/cabinets/search/by_id/${id}`);

//   if (!response.ok) {
//     throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
//   }
//   const data = await response.json();
//   return data.cabinet;
// };
