import { API_BASE_URL } from "./apiURL";

export const getInfoForCreateSchedule = async (group_name, semester) => {
  const response = await fetch(`${API_BASE_URL}/subjects_in_cycles/search/info_for_create/${group_name}/${semester}`);
  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

export const createNewSession = async (sessionNumber, sessionDate, teacherInPlanId, sessionType, cabinet, building) => {
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
      cabinet_number: cabinet,
      building_number: building
    })
  })

  if (!response.ok) {
    const error = new Error(`Ошибка: ${response.status} ${response.statusText}`);
    error.status = response.status;
    error.data = await response.json();
    throw error;
  }

  const data = await response.json();
  return data;
}

export const getReportForGroup = async (groupName, startPeriodDate) => {
  const response = await fetch(`${API_BASE_URL}/schedule/search/sessions/report/for-group/${groupName}/${startPeriodDate}`);

  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  // Return blob for download file
  const blob = await response.blob();
  return blob;
};

export const getSessionsForTeacherAndDate = async (teacherId, startPeriodDate, endPeriodDate) => {
  const response = await fetch(`${API_BASE_URL}/sessions/search/by_teacher_id/${teacherId}/${startPeriodDate}/${endPeriodDate}`);

  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export const copyScheduleInRange = async (startCopyPeriodDate, startInsertPeriodDate, copyCountDays) => {
  const formatedStartCopyPeriodDate = startCopyPeriodDate.toISOString().slice(0, 10);
  const formatedStartInsertPeriodDate = startInsertPeriodDate.toISOString().slice(0, 10);

  const response = await fetch(`${API_BASE_URL}/schedule/copy/${formatedStartCopyPeriodDate}/${formatedStartInsertPeriodDate}/${copyCountDays}`, {
    method: "POST"
  })

  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  return true;
}

export const updateSession = async (
  sessionId,
  sessionNumber = null,
  sessionDate = null,
  teacherInPlanId = null,
  sessionType = null,
  cabinet = null,
  building = null) => {
  const formattedDate = sessionDate.toISOString().slice(0, 10);

  const response = await fetch(`${API_BASE_URL}/sessions/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      session_id: sessionId,
      new_session_number: sessionNumber,
      new_session_date: formattedDate,
      new_teacher_in_plan: teacherInPlanId,
      new_session_type: sessionType,
      new_cabinet_number: cabinet,
      new_building_number: building
    })
  })

  if (!response.ok) {
    const error = new Error(`Ошибка: ${response.status} ${response.statusText}`);
    error.status = response.status;
    error.data = await response.json();
    throw error;
  }

  const data = await response.json();
  return data;
}

export const deleteSession = async (sessionId) => {
  const response = await fetch(`${API_BASE_URL}/sessions/delete/by_id/${sessionId}`, {
    method: "DELETE"
  })

  if (!response.ok) {
    const error = new Error(`Ошибка: ${response.status} ${response.statusText}`);
    error.status = response.status;
    error.data = await response.json();
    throw error;
  }

  const data = await response.json();
  return data;
}

/**
 * Сохраняет все потоки, возвращает успешно созданные пары и ошибки при создании
 * @param form Форма с данными основной пары
 * @param maintSessionId Id главной пары, к которой подтягиваются потоки
 * @param streamsSessionData Список всех потоков
 * @param sessionNumber Номер пары
 * @param date Дата пары
 * @returns {result}
 */
export const createStreamsSessions = async (form, mainSessionId, streamsSessionData, sessionNumber, date) => {
  // Результирующий словарь
  const result = {}

  // Массив для отслеживания успешно созданных пар
  const createdSessions = [];
  const errors = [];

  // Добавляем id основной пары в массив созданных пар
  createdSessions.push({id: mainSessionId});

  // Создаём пары для потоков последовательно, чтобы отлавливать ошибки для каждой
  for (let i = 0; i < streamsSessionData.length; i++) {
    const sessionData = streamsSessionData[i];
    const streamInfo = form.streams[i];

    try {
      const newStreamSession = await createNewSession(
        sessionNumber,
        date,
        sessionData.teacherInPlanId,
        sessionData.sessionType,
        sessionData.cabinet,
        sessionData.building,
      );

      // Сохраняем успешно созданную пару
      createdSessions.push({
        id: newStreamSession.session.id,
      });
    } catch (error) {
      // Обрабатываем ошибку для конкретного потока
      const errorMessage =
        error.data?.detail?.msg ||
        error.data?.detail ||
        "Неизвестная ошибка";

      errors.push({
        group: streamInfo.group_name,
        subject: form.subject.label,
        sessionType: form.sessionType.value,
        cabinet: form.cabinet.value,
        error: errorMessage,
        status: error.status,
      });
    }
  }

  // Возвращаем словарь с созданными парами и ошибками
  result["createdSessions"] = createdSessions;
  result["errors"] = errors;

  return result;
};