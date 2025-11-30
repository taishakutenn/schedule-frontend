import { API_BASE_URL } from "./apiURL";

export const getInfoForCreateSchedule = async (group_name, semester) => {
  const response = await fetch(`${API_BASE_URL}/subjects_in_cycles/search/info_for_create/${group_name}/${semester}`);
  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

export const createNewSession = async (sessionNumber, sessionDate, teacherInPlanId, sessionType) => {
  const formattedDate = sessionDate.toISOString().slice(0, 10);

  const response = await fetch(`${API_BASE_URL}/sessions/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      session_number: sessionNumber,
      session_date: formattedDate,
      teacher_in_plan: teacherInPlanId,
      session_type: sessionType,
      cabinet_number: "210",
      building_number: "2"
    })
  })

  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}


  //{
//   "session_number": 0,
//   "session_date": "2025-11-30",
//   "teacher_in_plan": 0,
//   "session_type": "string",
//   "cabinet_number": 0,
//   "building_number": 0
// }
