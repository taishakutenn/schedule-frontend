import { API_BASE_URL } from "./apiURL";

export const getPaymentForm = async () => {
  const response = await fetch(`${API_BASE_URL}/payment-form/search`);
  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.payment_forms.map((item) => item.payment_form);
};

// export const getTeacherById = async (id) => {
//   const response = await fetch(`${API_BASE_URL}/teachers/search/by_id/${id}`);

//   if (!response.ok) {
//     throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
//   }
//   const data = await response.json();
//   return data.teacher;
// };
